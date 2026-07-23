"""目标拆解模型适配层。"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Callable

from app.agents.llm_client import LLMClient, load_prompt
from app.db.connection import RefactorSessionLocal
from app.db.repositories.refactored import GoalRepository, ScheduleNewRepository


class GoalAIService:
    def __init__(self, session_factory: Callable = RefactorSessionLocal, llm: Any = None):
        self._session_factory = session_factory
        self._llm = llm or LLMClient()

    def breakdown(self, goal_id: int) -> dict:
        db = self._session_factory()
        try:
            goal = GoalRepository.get_by_id(db, goal_id)
            if not goal:
                return {"error": f"目标 {goal_id} 不存在"}
            result = self._llm.chat(load_prompt("breakdown_goal.txt"), f"用户目标：{goal.content}", temperature=0.5).json()
            if isinstance(result, dict) and result.get("items"):
                for item in result["items"]:
                    ScheduleNewRepository.create(db, {"date": datetime.now().strftime("%Y-%m-%d"), "content": item.get("content", ""), "source": "ai_suggest", "priority": item.get("priority", 2), "category": item.get("category", "")})
            goal.status = "broken_down"
            db.commit()
            return result if isinstance(result, dict) else {}
        finally:
            db.close()
