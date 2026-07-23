"""知→行→思主链产品服务。

只做确定性的产品编排；LLM、外部知识检索和交易上下文继续留在独立适配层。
"""

from __future__ import annotations

import json
from datetime import datetime, timedelta
from typing import Any, Callable, Optional

from app.db.connection import RefactorSessionLocal
from app.db.repositories.refactored import (
    KnowledgeRepository,
    NoteRepository,
    ScheduleNewRepository,
    WisdomRepository,
)
from app.services.jieyi.action_service import schedule_to_dict
from app.services.jieyi.daily_plan_service import DailyPlanService
from app.services.jieyi.method_library import JIEYI_METHOD_LIBRARY


def _json_list(value: Any) -> list:
    if isinstance(value, list):
        return value
    if not value:
        return []
    try:
        parsed = json.loads(value)
    except (TypeError, json.JSONDecodeError):
        return []
    return parsed if isinstance(parsed, list) else []


class FeedbackLoopService:
    def __init__(
        self,
        session_factory: Callable = RefactorSessionLocal,
        action_service: Any = None,
        daily_plan_service: Any = DailyPlanService,
    ):
        self._session_factory = session_factory
        self._action_service = action_service
        self._daily_plan_service = daily_plan_service

    @staticmethod
    def method_for_date(date: str, offset: int = 0) -> dict:
        target_date = date or datetime.now().strftime("%Y-%m-%d")
        seed = sum(ord(ch) for ch in target_date) + offset
        return JIEYI_METHOD_LIBRARY[seed % len(JIEYI_METHOD_LIBRARY)]

    def get_thinking_cards_today(self, date: Optional[str] = None) -> dict:
        target_date = date or datetime.now().strftime("%Y-%m-%d")
        db = self._session_factory()
        try:
            method = self.method_for_date(target_date)
            cards = [{
                "id": f"method:{method['id']}:{target_date}",
                "type": "method",
                "statement": method["statement"],
                "source": method["source"],
                "question": method["question"],
                "personal_context": "你正在把结衣做成知行合一系统，关键不是多看知识，而是把方法论压成每天能执行的动作。",
                "suggestion": method["suggestion"],
                "practice": method["practice"],
                "pillar": method["pillar"],
                "tags": method["tags"],
            }]

            for item in KnowledgeRepository.list_recent(db, 2):
                cards.append({
                    "id": f"knowledge:{item.id}",
                    "type": "knowledge",
                    "statement": item.title,
                    "source": item.source_type,
                    "question": "这条知识今天能逼你改变哪一个动作？",
                    "personal_context": item.content[:160],
                    "suggestion": "如果它只是让你觉得有道理，就还没有进入行；请把它压成一个今天能做的动作。",
                    "knowledge_id": item.id,
                    "tags": _json_list(item.tags),
                })

            for item in WisdomRepository.list_recent(db, 1):
                cards.append({
                    "id": f"wisdom:{item.id}",
                    "type": "review",
                    "statement": item.content,
                    "source": "wisdom",
                    "question": "这条旧判断今天还成立吗？有没有反例？",
                    "personal_context": "这是过去复盘沉淀出来的判断，今天需要重新验证，而不是当成口号收藏。",
                    "suggestion": "如果仍然成立，把它转成今日修炼或今日行动；如果不成立，晚上在思页写下反例。",
                    "wisdom_id": item.id,
                    "tags": _json_list(item.tags),
                })
            return {"date": target_date, "cards": cards[:4]}
        finally:
            db.close()

    def answer_thinking_card(self, card_id: str, data: dict) -> dict:
        answer = (data.get("answer") or "").strip()
        if not answer:
            return {"ok": False, "error": "answer_required"}
        db = self._session_factory()
        try:
            note = NoteRepository.create(db, {
                "title": f"思考卡判断 · {card_id}",
                "content": answer,
                "date": datetime.now().strftime("%Y-%m-%d"),
            })
            return {"ok": True, "note_id": note.id, "card_id": card_id}
        finally:
            db.close()

    def save_thought(self, data: dict) -> dict:
        text = (data.get("text") or data.get("answer") or "").strip()
        card_id = data.get("card_id") or "free"
        if not text:
            return {"ok": False, "error": "text_required"}
        answer = self.answer_thinking_card(str(card_id), {"answer": text})
        return {
            "ok": True,
            "note": answer,
            "suggested_action": {
                "title": text[:48],
                "reason": "来自刚写下的一句想法",
                "minimum": "今天只做一个 10 分钟版本。",
                "can_create": True,
            },
            "review_prompt": "晚上看这句想法有没有真的落成一个动作。",
        }

    def thinking_card_to_action(self, card_id: str, data: dict) -> dict:
        target_date = data.get("date") or datetime.now().strftime("%Y-%m-%d")
        content = (data.get("content") or data.get("action") or data.get("practice") or "").strip()
        if not content:
            method_id = card_id.split(":")[1] if card_id.startswith("method:") and ":" in card_id else ""
            method = next(
                (item for item in JIEYI_METHOD_LIBRARY if item["id"] == method_id),
                self.method_for_date(target_date),
            )
            content = method["practice"]
        db = self._session_factory()
        try:
            item = ScheduleNewRepository.create(db, {
                "date": target_date,
                "content": content,
                "source": "thinking_card",
                "priority": data.get("priority") or 2,
                "category": data.get("pillar") or data.get("category") or "知",
            })
            return {"ok": True, "schedule": schedule_to_dict(item)}
        finally:
            db.close()

    def get_practices_today(self, date: Optional[str] = None) -> dict:
        target_date = date or datetime.now().strftime("%Y-%m-%d")
        db = self._session_factory()
        try:
            rows = ScheduleNewRepository.list_by_date_source(db, target_date, "daily_practice")
            status_map = {item.content: item for item in rows}
            practices = []
            for method in JIEYI_METHOD_LIBRARY:
                row = status_map.get(method["practice"])
                practices.append({
                    "id": row.id if row else method["id"],
                    "method_id": method["id"],
                    "name": method["practice"],
                    "reason": method["reason"],
                    "statement": method["statement"],
                    "pillar": method["pillar"],
                    "source": method["source"],
                    "is_done": bool(row.is_done) if row else False,
                    "schedule_id": row.id if row else None,
                })
            actions = ScheduleNewRepository.list_by_date_excluding_source(
                db,
                target_date,
                "daily_practice",
                12,
            )
            return {
                "date": target_date,
                "practices": practices,
                "actions": [schedule_to_dict(item) for item in actions],
            }
        finally:
            db.close()

    def check_practice(self, method_id: str, data: dict) -> dict:
        method = next(
            (item for item in JIEYI_METHOD_LIBRARY if item["id"] == method_id or item["practice"] == method_id),
            None,
        )
        if method is None:
            return {"ok": False, "error": "practice_not_found"}
        target_date = data.get("date") or datetime.now().strftime("%Y-%m-%d")
        values = {
            "is_done": bool(data.get("is_done", True)),
            "category": method["pillar"],
        }
        db = self._session_factory()
        try:
            existing = ScheduleNewRepository.get_by_date_source_content(
                db,
                target_date,
                "daily_practice",
                method["practice"],
            )
            if existing:
                item = ScheduleNewRepository.update(db, existing.id, values)
            else:
                item = ScheduleNewRepository.create(db, {
                    "date": target_date,
                    "content": method["practice"],
                    "source": "daily_practice",
                    "priority": 1,
                    **values,
                })
            return {
                "ok": True,
                "practice": {**method, "is_done": bool(item.is_done), "schedule_id": item.id},
            }
        finally:
            db.close()

    def get_reflection_today(self, date: Optional[str] = None) -> dict:
        target_date = date or datetime.now().strftime("%Y-%m-%d")
        if self._action_service and hasattr(self._action_service, "get_practices_today"):
            practice_data = self._action_service.get_practices_today(target_date)
        else:
            practice_data = self.get_practices_today(target_date)
        done = [item for item in practice_data["practices"] if item["is_done"]]
        missed = [item for item in practice_data["practices"] if not item["is_done"]]
        focus = missed[0] if missed else (done[0] if done else self.method_for_date(target_date))
        question = (
            f"{focus.get('name') or focus.get('practice')}没做到，是太大、忘了，还是你没有给它固定触发点？"
            if missed
            else "今天做到的动作里，哪一个最值得明天继续保留？"
        )
        summary = "今天不是看完成率，而是看哪些方法论真的落进了生活。"
        if missed:
            summary = f"今天还有 {len(missed)} 个改命动作没落下。先别批评自己，先找阻力：太大、没触发点，还是不愿面对。"
        return {
            "date": target_date,
            "done": done,
            "missed": missed,
            "question": question,
            "summary": summary,
            "tomorrow_adjustment": "明天把最容易卡住的动作压到 20 分钟以内，并绑定到一个固定场景。",
        }

    def write_reflection_tomorrow(self, data: dict) -> dict:
        tomorrow = data.get("date") or (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        adjustment = data.get("adjustment") or "把最容易卡住的动作压到 20 分钟以内。"
        method = self.method_for_date(tomorrow)
        return self._daily_plan_service.write_plan({
            "date": tomorrow,
            "learn": [{
                "pillar": method["pillar"],
                "title": method["statement"],
                "content": method["reason"],
                "questions": [method["question"]],
                "source": method["source"],
            }],
            "review": [],
            "doTasks": [method["practice"], adjustment],
            "suggestion": adjustment,
        })
