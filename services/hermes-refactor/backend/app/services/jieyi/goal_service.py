"""结衣目标产品服务。"""

from __future__ import annotations

from typing import Callable

from app.db.connection import RefactorSessionLocal
from app.db.models import GoalModel
from app.db.repositories.refactored import GoalRepository


def goal_to_dict(item: GoalModel) -> dict:
    return {
        "id": item.id,
        "content": item.content,
        "status": item.status,
        "created_at": item.created_at,
    }


class GoalService:
    def __init__(self, session_factory: Callable = RefactorSessionLocal):
        self._session_factory = session_factory

    def list_active(self) -> list[dict]:
        db = self._session_factory()
        try:
            return [goal_to_dict(item) for item in GoalRepository.list_active(db)]
        finally:
            db.close()

    def create(self, data: dict) -> dict:
        db = self._session_factory()
        try:
            return goal_to_dict(GoalRepository.create(db, {"content": data["content"]}))
        finally:
            db.close()
