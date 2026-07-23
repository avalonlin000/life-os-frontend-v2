"""长期复盘对话的模型适配层。"""

from __future__ import annotations

from datetime import datetime, timedelta
import json
from typing import Any, Callable

from app.agents.llm_client import LLMClient, load_prompt
from app.db.connection import RefactorSessionLocal
from app.db.repositories.refactored import MoodRepository, TradeRepository, WisdomRepository


class ReviewAIService:
    def __init__(self, session_factory: Callable = RefactorSessionLocal, llm: Any = None):
        self._session_factory = session_factory
        self._llm = llm or LLMClient()

    def initiate(self, period: str = "8days") -> dict:
        today = datetime.now()
        start = today - timedelta(days=8 if period == "8days" else 15 if period == "half_month" else 30)
        start_str, end_str = start.strftime("%Y-%m-%d"), today.strftime("%Y-%m-%d")
        db = self._session_factory()
        try:
            trades = TradeRepository.list_between(db, start_str, end_str)
            moods = MoodRepository.list_between(db, start_str, end_str)
            parts = [f"复盘周期：{start_str} ~ {end_str}（{period}）"]
            if trades:
                parts.append(f"交易：{len(trades)} 笔，胜 {sum(1 for item in trades if item.结果盈亏 and item.结果盈亏 > 0)} 笔")
            if moods:
                parts.append(f"平均心情：{sum(item.mood_score for item in moods) / len(moods):.1f}/10")
            return self._llm.chat(load_prompt("review_initiate.txt"), "\n".join(parts), temperature=0.6).json()
        finally:
            db.close()

    def extract(self, conversation_text: str, period: str = "8days") -> dict:
        db = self._session_factory()
        try:
            result = self._llm.chat(load_prompt("review_extract_wisdom.txt"), f"复盘周期：{period}\n\n对话内容：\n{conversation_text}", temperature=0.4).json()
            if isinstance(result, dict) and result.get("wisdom_items"):
                for item in result["wisdom_items"]:
                    WisdomRepository.create(db, {"content": item.get("content", ""), "tags": json.dumps(item.get("tags", []), ensure_ascii=False)})
            return result if isinstance(result, dict) else {}
        finally:
            db.close()
