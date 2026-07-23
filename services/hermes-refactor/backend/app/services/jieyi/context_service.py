"""知行思页面需要的只读上下文聚合。"""

from __future__ import annotations

from typing import Callable

from app.db.connection import RefactorSessionLocal
from app.db.repositories.refactored import (
    ActivityRepository,
    DailyReviewRepository,
    GoalRepository,
    KnowledgeRepository,
    MoodRepository,
    ScheduleNewRepository,
)
from app.services.jieyi.action_service import schedule_to_dict
from app.services.jieyi.daily_plan_service import DailyPlanService
from app.services.jieyi.reflection_service import activity_to_dict, mood_to_dict


class ContextService:
    def __init__(self, session_factory: Callable = RefactorSessionLocal):
        self._session_factory = session_factory

    def get_daily_context(self, date: str) -> dict:
        db = self._session_factory()
        try:
            plan = DailyPlanService.get_by_date(date)
            activities = ActivityRepository.list_by_date(db, date)
            mood = MoodRepository.get_by_date(db, date)
            review = DailyReviewRepository.get_by_date(db, date)
            unfinished = ScheduleNewRepository.list_unfinished_until(db, date, 20)
            recent_knowledge = KnowledgeRepository.list_recent(db, 5)
            goals = GoalRepository.list_active(db)
            return {
                "date": date,
                "daily_plan": plan if plan.get("source") != "none" else None,
                "activities": [activity_to_dict(item) for item in activities],
                "mood": mood_to_dict(mood) if mood else None,
                "daily_review": self._review_payload(review),
                "unfinished_schedules": [schedule_to_dict(item) for item in unfinished],
                "recent_knowledge": [
                    {
                        "id": item.id,
                        "title": item.title,
                        "source_type": item.source_type,
                        "created_at": item.created_at,
                    }
                    for item in recent_knowledge
                ],
                "goals": [
                    {
                        "id": item.id,
                        "content": item.content,
                        "status": item.status,
                        "created_at": item.created_at,
                    }
                    for item in goals
                ],
            }
        finally:
            db.close()

    @staticmethod
    def _review_payload(review) -> dict | None:
        if not review or not review.summary:
            return None
        import json
        try:
            payload = json.loads(review.summary)
        except (TypeError, json.JSONDecodeError):
            return None
        return payload if isinstance(payload, dict) else None
