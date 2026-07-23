"""结衣首页今日聚合：只装配知、行、思、道产品服务。"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from app.services.jieyi.context_service import ContextService
from app.services.jieyi.feedback_loop_service import FeedbackLoopService
from app.services.jieyi.principles_service import PrinciplesService


class TodayService:
    def __init__(
        self,
        feedback_loop: Any = None,
        context_service: Any = None,
        principles_service: Any = None,
    ):
        self.feedback_loop = feedback_loop or FeedbackLoopService()
        self.context_service = context_service or ContextService()
        self.principles_service = principles_service or PrinciplesService()

    def get_flow(self, date: str | None = None) -> dict:
        target_date = date or datetime.now().strftime("%Y-%m-%d")
        thinking = self.feedback_loop.get_thinking_cards_today(target_date)
        practices = self.feedback_loop.get_practices_today(target_date)
        reflection = self.feedback_loop.get_reflection_today(target_date)
        principles = self.principles_service.get_principles()
        primary_action = None
        actions = practices.get("actions") or []
        practice_items = practices.get("practices") or []
        if actions:
            first = actions[0]
            primary_action = {
                "kind": "schedule",
                "id": first.get("id"),
                "title": first.get("content"),
                "reason": first.get("category") or "来自今日行动队列",
                "minimum": "先做 10 分钟，做完再加码。",
                "is_done": bool(first.get("is_done")),
            }
        elif practice_items:
            first = practice_items[0]
            primary_action = {
                "kind": "practice",
                "id": first.get("method_id") or first.get("id"),
                "title": first.get("name"),
                "reason": first.get("reason"),
                "minimum": first.get("statement") or "把动作压到今天能完成的最小版本。",
                "is_done": bool(first.get("is_done")),
            }
        return {
            "date": target_date,
            "question_card": (thinking.get("cards") or [None])[0],
            "primary_action": primary_action,
            "practice_preview": practice_items[:3],
            "reflection": reflection,
            "principle_candidate": (principles.get("principles") or [None])[0],
        }

    def get_aggregate(self, date: str | None = None) -> dict:
        target_date = date or datetime.now().strftime("%Y-%m-%d")
        thinking = self.feedback_loop.get_thinking_cards_today(target_date)
        practices = self.feedback_loop.get_practices_today(target_date)
        reflection = self.feedback_loop.get_reflection_today(target_date)
        principles = self.principles_service.get_principles()
        context = self.context_service.get_daily_context(target_date)

        cards = thinking.get("cards") or []
        primary_card = cards[0] if cards else None
        recent_knowledge = context.get("recent_knowledge") or []
        activities = context.get("activities") or []
        mood = context.get("mood")
        daily_review = context.get("daily_review")
        practice_items = practices.get("practices") or []
        actions = practices.get("actions") or []
        done_count = len([item for item in actions if item.get("is_done")])
        practice_done_count = len([item for item in practice_items if item.get("is_done")])
        principle_items = principles.get("principles") or []
        wisdom_count = len([item for item in principle_items if str(item.get("id", "")).startswith("wisdom:")])
        material_available = bool(recent_knowledge)

        return {
            "date": target_date,
            "status": "ok",
            "empty_states": {
                "know_materials": not material_available,
                "act_actions": len(actions) == 0,
                "reflect_review": not bool(daily_review),
                "way_user_principles": wisdom_count == 0,
            },
            "know": {
                "today_question": primary_card,
                "one_sentence_thought": {
                    "enabled": True,
                    "endpoint": "/api/jieyi/thoughts",
                    "placeholder": "写一句：这条问题今天逼我改哪个动作？",
                    "card_id": primary_card.get("id") if primary_card else None,
                },
                "deep_learning_entry": {
                    "enabled": True,
                    "endpoint": "/api/agent/jieyi/deep-learning/prepare",
                    "status": "materials_ready" if material_available else "fallback_ready",
                    "label": "有材料可深挖" if material_available else "材料不足 · 方法论兜底可用",
                },
                "materials": {
                    "status": "available" if material_available else "empty",
                    "available": material_available,
                    "count": len(recent_knowledge),
                    "message": "已接入最近知识材料，可用于深度学习。" if material_available else "今天还没有可用的后台知识材料；深度学习入口仍可打开，但会使用方法论兜底。",
                    "items": recent_knowledge[:5],
                },
                "cards": cards,
            },
            "act": {
                "today_practices": practice_items,
                "today_actions": actions,
                "completion_status": {
                    "practice_total": len(practice_items),
                    "practice_done": practice_done_count,
                    "action_total": len(actions),
                    "action_done": done_count,
                    "message": "今天还没有具体行动，先从一个今日修炼开始。" if not actions else f"今日行动 {done_count}/{len(actions)} 已完成。",
                },
                "ai_suggestion_entry": {
                    "enabled": True,
                    "endpoint": "/api/schedule/suggest",
                    "label": "让结衣补一个今日行动建议",
                },
            },
            "reflect": {
                "reconciliation": reflection,
                "activities": {
                    "status": "available" if activities else "empty",
                    "items": activities,
                    "message": "今天还没有活动记录。" if not activities else f"今天已有 {len(activities)} 条活动记录。",
                },
                "note": {
                    "status": "available" if mood and mood.get("note") else "empty",
                    "mood": mood,
                    "text": mood.get("note") if mood else "",
                },
                "today_review": {
                    "status": "available" if daily_review else "empty",
                    "data": daily_review,
                    "message": "今日整理还没有生成。" if not daily_review else "今日整理已生成。",
                },
                "tomorrow_plan_entry": {
                    "enabled": True,
                    "endpoint": "/api/jieyi/reflection/write-tomorrow",
                    "label": "把今天的阻力写进明天计划",
                },
            },
            "way": {
                "direction": principles.get("direction"),
                "principles": principle_items,
                "evidence_summary": [
                    {
                        "id": item.get("id"),
                        "source": item.get("source"),
                        "evidence": item.get("evidence"),
                        "related_practice": item.get("related_practice"),
                    }
                    for item in principle_items
                ],
                "data_sources": principles.get("data_sources") or [],
                "status": "available" if principle_items else "empty",
                "message": "原则来自方法论库与知行思验证记录；wisdom 为空时只显示待验证方法论。",
            },
        }
