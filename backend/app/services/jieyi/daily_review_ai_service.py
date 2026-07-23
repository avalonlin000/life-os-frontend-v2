"""思页每日整理的模型适配层。"""

from __future__ import annotations

import json
from datetime import datetime
from typing import Any, Callable

from app.agents.llm_client import LLMClient, load_prompt
from app.db.connection import RefactorSessionLocal
from app.db.repositories.refactored import (
    ActivityRepository,
    DailyReviewRepository,
    MoodRepository,
    TradeRepository,
)


class DailyReviewAIService:
    def __init__(self, session_factory: Callable = RefactorSessionLocal, llm: Any = None):
        self._session_factory = session_factory
        self._llm = llm or LLMClient()

    def generate(self, date: str | None = None) -> dict:
        target_date = date or datetime.now().strftime("%Y-%m-%d")
        db = self._session_factory()
        try:
            mood = MoodRepository.get_by_date(db, target_date)
            trade_ids = self._parse_ids(mood.trade_ids if mood else None)
            trades = TradeRepository.list_by_ids(db, trade_ids)
            activities = ActivityRepository.list_by_date(db, target_date)

            if mood is None and not trades and not activities:
                return {
                    "date": target_date,
                    "summary": "",
                    "highlights": [],
                    "concerns": [],
                    "trade_insight": None,
                    "suggestion": "",
                    "status": "skipped",
                    "reason": "no_daily_records",
                }

            context_parts = [f"日期：{target_date}"]
            if mood:
                context_parts.append(
                    f"心情：{mood.mood_score}/10，精力：{mood.energy}/10，压力：{mood.stress}/10"
                )
                note = getattr(mood, "note", None)
                if note:
                    context_parts.append(f"用户当天记录：{note[:2000]}")
            if trades:
                trade_text = "；".join(f"#{item.trade_id} {item.标的} 盈亏:{item.结果盈亏}" for item in trades)
                context_parts.append(f"交易：{trade_text}")
            if activities:
                activity_parts = []
                for item in activities:
                    details = []
                    if item.rating is not None:
                        details.append(f"评分:{item.rating}")
                    if item.note:
                        details.append(f"记录:{item.note}")
                    details.append("已结束" if item.end_time else "进行中")
                    suffix = f"({','.join(details)})" if details else ""
                    activity_parts.append(f"{item.name}{suffix}")
                context_parts.append(f"活动：{'；'.join(activity_parts)}")

            response = self._llm.chat(
                load_prompt("daily_review.txt"),
                "\n".join(context_parts),
                temperature=0.5,
            )
            result = response.json()
            if not isinstance(result, dict):
                result = {}
            if result.get("error"):
                return result
            if not str(result.get("summary") or "").strip():
                return {**result, "date": target_date, "status": "skipped"}
            DailyReviewRepository.upsert_generated(
                db,
                target_date,
                json.dumps(result, ensure_ascii=False),
                json.dumps(trade_ids, ensure_ascii=False) if trade_ids else None,
                mood.id if mood else None,
            )
            return result
        finally:
            db.close()

    @staticmethod
    def _parse_ids(value) -> list[int]:
        if not value:
            return []
        try:
            parsed = json.loads(value) if isinstance(value, str) else value
        except (TypeError, json.JSONDecodeError):
            return []
        if not isinstance(parsed, list):
            return []
        return [int(item) for item in parsed if str(item).isdigit()]
