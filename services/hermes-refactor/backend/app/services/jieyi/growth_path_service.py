"""结衣第一条真实主路径：成长领域 → 阶段目标 → 当前实践 → 回归。"""

from __future__ import annotations

from datetime import datetime
from typing import Callable, Optional

from app.db.connection import RefactorSessionLocal
from app.db.models import GrowthDomainModel, PracticeEventModel, StageGoalModel
from app.db.repositories.refactored import (
    GrowthDomainRepository,
    PracticeEventRepository,
    ScheduleNewRepository,
    StageGoalRepository,
)
from app.services.jieyi.action_service import schedule_to_dict


def _domain_to_dict(item: GrowthDomainModel) -> dict:
    return {
        "id": item.id,
        "name": item.name,
        "status": item.status,
        "created_at": item.created_at,
        "updated_at": item.updated_at,
    }


def _stage_goal_to_dict(item: StageGoalModel) -> dict:
    return {
        "id": item.id,
        "domain_id": item.domain_id,
        "content": item.content,
        "status": item.status,
        "created_at": item.created_at,
        "updated_at": item.updated_at,
    }


def _event_to_dict(item: PracticeEventModel) -> dict:
    return {
        "id": item.id,
        "schedule_id": item.schedule_id,
        "event_type": item.event_type,
        "note": item.note,
        "created_at": item.created_at,
    }


class GrowthPathService:
    def __init__(self, session_factory: Callable = RefactorSessionLocal):
        self._session_factory = session_factory

    def get_map(self, date: Optional[str] = None) -> dict:
        target_date = date or datetime.now().strftime("%Y-%m-%d")
        db = self._session_factory()
        try:
            domains = GrowthDomainRepository.list_active(db)
            stage_goals = StageGoalRepository.list_active(db)
            practices = [
                item for item in ScheduleNewRepository.list_by_date(db, target_date)
                if item.stage_goal_id is not None
            ]
            practices_by_goal: dict[int, list[dict]] = {}
            for practice in practices:
                value = schedule_to_dict(practice)
                value["events"] = [
                    _event_to_dict(event)
                    for event in PracticeEventRepository.list_by_schedule(db, practice.id)
                ]
                practices_by_goal.setdefault(practice.stage_goal_id, []).append(value)

            goals_by_domain: dict[int, list[dict]] = {}
            for goal in stage_goals:
                value = _stage_goal_to_dict(goal)
                value["current_practices"] = practices_by_goal.get(goal.id, [])
                goals_by_domain.setdefault(goal.domain_id, []).append(value)

            return {
                "date": target_date,
                "domains": [
                    {**_domain_to_dict(domain), "stage_goals": goals_by_domain.get(domain.id, [])}
                    for domain in domains
                ],
                "unlinked_practice_count": len([
                    item for item in ScheduleNewRepository.list_by_date(db, target_date)
                    if item.stage_goal_id is None
                ]),
            }
        finally:
            db.close()

    def create_domain(self, name: str) -> dict:
        db = self._session_factory()
        try:
            return _domain_to_dict(GrowthDomainRepository.create(db, {"name": name.strip()}))
        finally:
            db.close()

    def create_stage_goal(self, domain_id: int, content: str) -> dict:
        db = self._session_factory()
        try:
            domain = GrowthDomainRepository.get_by_id(db, domain_id)
            if not domain or domain.status != "active":
                return {"error": "growth_domain_not_found"}
            return _stage_goal_to_dict(StageGoalRepository.create(db, {
                "domain_id": domain_id,
                "content": content.strip(),
            }))
        finally:
            db.close()

    def create_practice(self, stage_goal_id: int, date: str, content: str) -> dict:
        db = self._session_factory()
        try:
            stage_goal = StageGoalRepository.get_by_id(db, stage_goal_id)
            if not stage_goal or stage_goal.status != "active":
                return {"error": "stage_goal_not_found"}
            practice = ScheduleNewRepository.create(db, {
                "date": date,
                "content": content.strip(),
                "source": "user_add",
                "stage_goal_id": stage_goal_id,
                "practice_status": "active",
                "is_done": False,
            })
            PracticeEventRepository.create(db, {
                "schedule_id": practice.id,
                "event_type": "started",
                "note": "用户确认当前实践",
            })
            return schedule_to_dict(practice)
        finally:
            db.close()

    def change_practice_state(self, schedule_id: int, event_type: str, note: str = "") -> dict:
        state_changes = {
            "completed": {"practice_status": "completed", "is_done": True},
            "interrupted": {"practice_status": "interrupted", "is_done": False},
            "returned": {"practice_status": "active", "is_done": False},
        }
        if event_type not in state_changes:
            return {"error": "invalid_practice_event"}

        db = self._session_factory()
        try:
            existing = ScheduleNewRepository.get_by_id(db, schedule_id)
            if not existing or existing.stage_goal_id is None:
                return {"error": "current_practice_not_found"}
            practice = ScheduleNewRepository.update(db, schedule_id, state_changes[event_type])
            event = PracticeEventRepository.create(db, {
                "schedule_id": schedule_id,
                "event_type": event_type,
                "note": note.strip() or None,
            })
            return {
                "practice": schedule_to_dict(practice),
                "event": _event_to_dict(event),
            }
        finally:
            db.close()
