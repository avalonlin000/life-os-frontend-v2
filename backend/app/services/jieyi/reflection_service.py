"""“思”产品服务：负责活动、心情、趋势和已生成复盘的稳定读写。"""

from __future__ import annotations

import json
from datetime import datetime, timedelta
from typing import Callable, Optional

from app.db.connection import RefactorSessionLocal
from app.db.models import ActivityModel, MoodModel
from app.db.repositories.refactored import (
    ActivityRepository,
    DailyReviewRepository,
    MoodRepository,
)


def activity_to_dict(item: ActivityModel) -> dict:
    return {
        "id": item.id,
        "schedule_id": item.schedule_id,
        "name": item.name,
        "start_time": item.start_time,
        "end_time": item.end_time,
        "note": item.note,
        "rating": item.rating,
        "tags": item.tags,
        "mood_before": item.mood_before,
        "mood_after": item.mood_after,
        "created_at": item.created_at,
        "updated_at": item.updated_at,
    }


def mood_to_dict(item: MoodModel) -> dict:
    return {
        "id": item.id,
        "date": item.date,
        "mood_score": item.mood_score,
        "energy": item.energy,
        "stress": item.stress,
        "trade_ids": item.trade_ids,
        "note": item.note,
        "created_at": item.created_at,
    }


class ReflectionService:
    def __init__(self, session_factory: Callable = RefactorSessionLocal):
        self._session_factory = session_factory

    def list_activities(self, date: Optional[str] = None) -> list[dict]:
        target_date = date or datetime.now().strftime("%Y-%m-%d")
        db = self._session_factory()
        try:
            return [activity_to_dict(item) for item in ActivityRepository.list_by_date(db, target_date)]
        finally:
            db.close()

    def start_activity(self, data: dict) -> dict:
        values = dict(data)
        values["start_time"] = values.get("start_time") or datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        db = self._session_factory()
        try:
            return activity_to_dict(ActivityRepository.create(db, values))
        finally:
            db.close()

    def finish_activity(self, activity_id: int, data: dict) -> Optional[dict]:
        values = dict(data)
        values["end_time"] = values.get("end_time") or datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        db = self._session_factory()
        try:
            item = ActivityRepository.update(db, activity_id, values)
            return activity_to_dict(item) if item else None
        finally:
            db.close()

    def get_mood(self, date: Optional[str] = None) -> Optional[dict]:
        target_date = date or datetime.now().strftime("%Y-%m-%d")
        db = self._session_factory()
        try:
            item = MoodRepository.get_by_date(db, target_date)
            return mood_to_dict(item) if item else None
        finally:
            db.close()

    def save_mood(self, data: dict) -> dict:
        db = self._session_factory()
        try:
            return mood_to_dict(MoodRepository.create_or_update(db, dict(data)))
        finally:
            db.close()

    def get_mood_trend(self, days: int = 7) -> list[dict]:
        end = datetime.now()
        start = end - timedelta(days=days)
        db = self._session_factory()
        try:
            items = MoodRepository.list_between(
                db,
                start.strftime("%Y-%m-%d"),
                end.strftime("%Y-%m-%d"),
            )
            return [mood_to_dict(item) for item in items]
        finally:
            db.close()

    def get_daily_review(self, date: Optional[str] = None) -> dict:
        target_date = date or datetime.now().strftime("%Y-%m-%d")
        db = self._session_factory()
        try:
            item = DailyReviewRepository.get_by_date(db, target_date)
            if item and item.summary:
                try:
                    payload = json.loads(item.summary)
                except (TypeError, json.JSONDecodeError):
                    return {"date": target_date, "summary": None, "status": "invalid"}
                return payload if isinstance(payload, dict) else {"date": target_date, "summary": None, "status": "invalid"}
            return {"date": target_date, "summary": None}
        finally:
            db.close()
