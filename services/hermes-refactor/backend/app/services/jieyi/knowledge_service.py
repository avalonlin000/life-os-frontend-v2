"""“知”产品服务：只负责知识条目的稳定读写，不承载 AI 编排。"""

from __future__ import annotations

from typing import Callable, Optional

from app.db.connection import RefactorSessionLocal
from app.db.models import KnowledgeModel
from app.db.repositories.refactored import KnowledgeRepository


def knowledge_to_dict(item: KnowledgeModel) -> dict:
    return {
        "id": item.id,
        "title": item.title,
        "content": item.content,
        "source_type": item.source_type,
        "source_url": item.source_url,
        "tags": item.tags,
        "is_core": item.is_core,
        "created_at": item.created_at,
        "updated_at": item.updated_at,
    }


def knowledge_profile_to_dict(item) -> dict:
    return {
        "knowledge_id": item.knowledge_id,
        "problem": item.problem,
        "method": item.method,
        "applicable_conditions": item.applicable_conditions,
        "boundaries": item.boundaries,
        "testable_action": item.testable_action,
        "created_at": item.created_at,
        "updated_at": item.updated_at,
    }


class KnowledgeService:
    def __init__(self, session_factory: Callable = RefactorSessionLocal):
        self._session_factory = session_factory

    def list_all(self, source_type: Optional[str] = None) -> list[dict]:
        db = self._session_factory()
        try:
            return [knowledge_to_dict(item) for item in KnowledgeRepository.list_all(db, source_type)]
        finally:
            db.close()

    def create(self, data: dict) -> dict:
        db = self._session_factory()
        try:
            return knowledge_to_dict(KnowledgeRepository.create(db, dict(data)))
        finally:
            db.close()

    def get_detail(self, knowledge_id: int) -> Optional[dict]:
        db = self._session_factory()
        try:
            item = KnowledgeRepository.get_product_by_id(db, knowledge_id)
            return knowledge_to_dict(item) if item else None
        finally:
            db.close()

    def list_paged(self, page: int = 1, page_size: int = 10) -> dict:
        normalized_page = max(1, int(page or 1))
        normalized_size = min(50, max(1, int(page_size or 10)))
        db = self._session_factory()
        try:
            total, items = KnowledgeRepository.list_paged(db, normalized_page, normalized_size)
            return {
                "page": normalized_page,
                "page_size": normalized_size,
                "total": total,
                "items": [knowledge_to_dict(item) for item in items],
            }
        finally:
            db.close()

    def get_profile(self, knowledge_id: int) -> Optional[dict]:
        db = self._session_factory()
        try:
            if not KnowledgeRepository.get_product_by_id(db, knowledge_id):
                return None
            item = KnowledgeRepository.get_profile(db, knowledge_id)
            return knowledge_profile_to_dict(item) if item else None
        finally:
            db.close()

    def upsert_profile(self, knowledge_id: int, data: dict) -> Optional[dict]:
        db = self._session_factory()
        try:
            knowledge = KnowledgeRepository.get_product_by_id(db, knowledge_id)
            if not knowledge:
                return None
            item = KnowledgeRepository.upsert_profile(db, knowledge_id, dict(data))
            return knowledge_profile_to_dict(item)
        finally:
            db.close()
