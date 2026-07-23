"""知→行：把一条知识用模型拆成行动的适配层。"""

from __future__ import annotations

import re
from datetime import datetime
from typing import Any, Callable

from app.agents.llm_client import LLMClient, load_prompt
from app.db.connection import RefactorSessionLocal
from app.db.repositories.refactored import KnowledgeRepository, ScheduleNewRepository
from app.services.jieyi.action_service import schedule_to_dict


class KnowledgeSplitService:
    def __init__(self, session_factory: Callable = RefactorSessionLocal, llm: Any = None):
        self._session_factory = session_factory
        self._llm = llm or LLMClient()

    def split(self, knowledge_id: int) -> dict:
        db = self._session_factory()
        try:
            item = KnowledgeRepository.get_product_by_id(db, knowledge_id)
            if not item:
                return {"error": f"知识条目 {knowledge_id} 不存在"}
            response = self._llm.chat(
                load_prompt("split_knowledge.txt"),
                f"知识标题：{item.title}\n\n知识内容：\n{item.content}",
                temperature=0.5,
            )
            result = response.json()
            if not isinstance(result, dict):
                result = {}
            if not result or "items" not in result:
                result = self._parse_text_fallback(getattr(response, "content", ""))
            first_content = str((result.get("items") or [{}])[0].get("content") or "") if isinstance(result.get("items"), list) else ""
            if not result.get("items") or result.get("error") or result.get("fallback") is True or "LLM_API_KEY not configured" in first_content or first_content.strip().startswith('{"error"'):
                fallback_content = (item.title or item.content or "").strip()[:80]
                result = {"items": [{"content": f"把材料《{fallback_content or knowledge_id}》压成一个今天能做的 20 分钟动作", "priority": 2, "category": "knowledge_split", "urgency": "medium", "importance": "medium"}], "_fallback": True, "fallback_reason": "llm_empty_or_error"}

            created = []
            for action in result.get("items", []):
                content = (action.get("content") or "").strip()
                if not content:
                    continue
                schedule = ScheduleNewRepository.create(db, {
                    "date": datetime.now().strftime("%Y-%m-%d"),
                    "content": content,
                    "source": "knowledge_split",
                    "priority": action.get("priority", 2),
                    "category": action.get("category", "knowledge_split"),
                    "knowledge_id": knowledge_id,
                })
                created.append(schedule_to_dict(schedule))
            result["created_schedules"] = created
            result["created_count"] = len(created)
            return result
        finally:
            db.close()

    @staticmethod
    def _parse_text_fallback(raw: str) -> dict:
        raw = (raw or "").strip()
        if not raw or raw == "{}":
            return {}
        lines = [line.strip() for line in raw.split("\n") if line.strip()]
        if lines and lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        items = []
        for line in lines:
            cleaned = re.sub(r"^\d+[\.\)、]\s*", "", line).strip()
            if len(cleaned) > 4:
                items.append({"content": cleaned, "priority": 2, "category": "", "urgency": "medium", "importance": "medium"})
        return {"items": items, "_fallback": True} if items else {"items": [{"content": raw[:200], "priority": 2, "category": "", "urgency": "medium", "importance": "medium"}], "_fallback": True}
