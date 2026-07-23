"""结衣笔记产品服务；只读取结衣产品正源。"""

from __future__ import annotations

from datetime import datetime
from typing import Callable

from app.db.connection import RefactorSessionLocal
from app.db.models import NoteModel
from app.db.repositories.refactored import NoteRepository


def note_to_dict(item: NoteModel) -> dict:
    return {
        "id": item.id,
        "title": item.title,
        "content": item.content,
        "date": item.date,
        "created_at": item.created_at,
    }


class NoteService:
    def __init__(self, session_factory: Callable = RefactorSessionLocal):
        self._session_factory = session_factory

    def list_recent(self, limit: int = 10) -> list[dict]:
        safe_limit = max(1, min(limit, 100))
        db = self._session_factory()
        try:
            return [note_to_dict(item) for item in NoteRepository.list_recent(db, safe_limit)]
        finally:
            db.close()

    def create(self, data: dict) -> dict:
        content = data.get("content")
        if not isinstance(content, str) or not content.strip():
            raise ValueError("note_content_required")
        payload = {
            "title": (data.get("title") or "").strip() or "记一笔",
            "content": content,
            "date": (data.get("date") or "").strip() or datetime.now().strftime("%Y-%m-%d"),
        }
        db = self._session_factory()
        try:
            return note_to_dict(NoteRepository.create(db, payload))
        finally:
            db.close()

    def delete(self, note_id: int) -> bool:
        db = self._session_factory()
        try:
            return NoteRepository.delete_by_id(db, note_id)
        finally:
            db.close()

    def get_daily_note(self, date: str | None = None) -> dict:
        target_date = date or datetime.now().strftime("%Y-%m-%d")
        db = self._session_factory()
        try:
            item = NoteRepository.get_latest_by_date(db, target_date)
            if item is None:
                return {
                    "date": target_date,
                    "title": "",
                    "text": "",
                    "found": False,
                    "source": "none",
                }
            return {
                "date": target_date,
                "title": item.title,
                "text": item.content,
                "found": True,
                "source": "product_note",
            }
        finally:
            db.close()
