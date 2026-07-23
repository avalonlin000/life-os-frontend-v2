"""“行”产品服务：负责行动条目的稳定 CRUD。"""

from __future__ import annotations

from datetime import datetime
from typing import Callable, Optional

from app.db.connection import RefactorSessionLocal
from app.db.models import ScheduleNewModel
from app.db.repositories.refactored import ScheduleNewRepository


def schedule_to_dict(item: ScheduleNewModel) -> dict:
    return {
        "id": item.id,
        "date": item.date,
        "content": item.content,
        "source": item.source,
        "priority": item.priority,
        "category": item.category,
        "is_done": item.is_done,
        "knowledge_id": item.knowledge_id,
        "stage_goal_id": item.stage_goal_id,
        "reality_issue_id": item.reality_issue_id,
        "method_entry_id": item.method_entry_id,
        "practice_status": item.practice_status or ("completed" if item.is_done else "active"),
        "created_at": item.created_at,
        "updated_at": item.updated_at,
    }


class ActionService:
    def __init__(self, session_factory: Callable = RefactorSessionLocal):
        self._session_factory = session_factory

    def list_by_date(self, date: Optional[str] = None) -> list[dict]:
        target_date = date or datetime.now().strftime("%Y-%m-%d")
        db = self._session_factory()
        try:
            return [schedule_to_dict(item) for item in ScheduleNewRepository.list_by_date(db, target_date)]
        finally:
            db.close()

    def create(self, data: dict) -> dict:
        db = self._session_factory()
        try:
            return schedule_to_dict(ScheduleNewRepository.create(db, dict(data)))
        finally:
            db.close()

    def update(self, schedule_id: int, data: dict) -> Optional[dict]:
        db = self._session_factory()
        try:
            item = ScheduleNewRepository.update(db, schedule_id, dict(data))
            return schedule_to_dict(item) if item else None
        finally:
            db.close()
