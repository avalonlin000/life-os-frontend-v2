"""结衣 Agent 兼容外壳。

结衣产品行为已经归属 ``app.services.jieyi``。这个类只保留旧方法名，
把调用转发到产品服务，避免历史脚本或旧客户端立刻失效；它不再直接
持有数据库、模型提示词或业务编排实现。
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from app.services.jieyi.action_service import ActionService
from app.services.jieyi.context_service import ContextService
from app.services.jieyi.daily_plan_ai_service import DailyPlanAIService
from app.services.jieyi.daily_plan_service import DailyPlanService
from app.services.jieyi.daily_review_ai_service import DailyReviewAIService
from app.services.jieyi.deep_learning_service import DeepLearningService
from app.services.jieyi.feedback_loop_service import FeedbackLoopService
from app.services.jieyi.goal_ai_service import GoalAIService
from app.services.jieyi.goal_service import GoalService
from app.services.jieyi.knowledge_split_service import KnowledgeSplitService
from app.services.jieyi.note_service import NoteService
from app.services.jieyi.principles_service import PrinciplesService
from app.services.jieyi.review_ai_service import ReviewAIService
from app.services.jieyi.schedule_suggestion_service import ScheduleSuggestionService
from app.services.jieyi.today_service import TodayService
from app.services.jieyi.method_library import JIEYI_METHOD_LIBRARY


class JieyiAgent:
    """旧入口兼容层；新的业务代码应直接依赖 ``app.services.jieyi``。"""

    def __init__(
        self,
        *,
        feedback_loop: Any = None,
        action_service: Any = None,
        context_service: Any = None,
        principles_service: Any = None,
        today_service: Any = None,
        deep_learning_service: Any = None,
        daily_review_ai_service: Any = None,
        daily_plan_ai_service: Any = None,
        schedule_suggestion_service: Any = None,
        knowledge_split_service: Any = None,
        review_ai_service: Any = None,
        goal_service: Any = None,
        goal_ai_service: Any = None,
        note_service: Any = None,
    ):
        self.action_service = action_service or ActionService()
        self.feedback_loop = feedback_loop or FeedbackLoopService(action_service=self.action_service)
        self.context_service = context_service or ContextService()
        self.principles_service = principles_service or PrinciplesService()
        self.today_service = today_service or TodayService(
            feedback_loop=self.feedback_loop,
            context_service=self.context_service,
            principles_service=self.principles_service,
        )
        self.deep_learning_service = deep_learning_service or DeepLearningService()
        self.daily_review_ai_service = daily_review_ai_service or DailyReviewAIService()
        self.daily_plan_ai_service = daily_plan_ai_service or DailyPlanAIService()
        self.schedule_suggestion_service = schedule_suggestion_service or ScheduleSuggestionService()
        self.knowledge_split_service = knowledge_split_service or KnowledgeSplitService()
        self.review_ai_service = review_ai_service or ReviewAIService()
        self.goal_service = goal_service or GoalService()
        self.goal_ai_service = goal_ai_service or GoalAIService()
        self.note_service = note_service or NoteService()

    # ── 知行思道兼容入口 ──

    @staticmethod
    def _method_for_date(date: str, offset: int = 0) -> dict:
        return FeedbackLoopService.method_for_date(date, offset)

    def get_thinking_cards_today(self, date: Optional[str] = None) -> dict:
        return self.feedback_loop.get_thinking_cards_today(date)

    def answer_thinking_card(self, card_id: str, data: dict) -> dict:
        return self.feedback_loop.answer_thinking_card(card_id, data)

    def thinking_card_to_action(self, card_id: str, data: dict) -> dict:
        return self.feedback_loop.thinking_card_to_action(card_id, data)

    def get_practices_today(self, date: Optional[str] = None) -> dict:
        return self.feedback_loop.get_practices_today(date)

    def check_practice(self, method_id: str, data: dict) -> dict:
        return self.feedback_loop.check_practice(method_id, data)

    def get_reflection_today(self, date: Optional[str] = None) -> dict:
        return self.feedback_loop.get_reflection_today(date)

    def write_reflection_tomorrow(self, data: dict) -> dict:
        return self.feedback_loop.write_reflection_tomorrow(data)

    def get_principles(self) -> dict:
        return self.principles_service.get_principles()

    def get_today_flow(self, date: Optional[str] = None) -> dict:
        return self.today_service.get_flow(date)

    def get_today_aggregate(self, date: Optional[str] = None) -> dict:
        return self.today_service.get_aggregate(date)

    def save_thought(self, data: dict) -> dict:
        return self.feedback_loop.save_thought(data)

    # ── AI/知识兼容入口 ──

    def create_deep_learning_session(self, data: dict) -> dict:
        return self.deep_learning_service.create_session(data)

    def update_deep_learning_session_step(self, session_id: str, data: dict) -> dict:
        return self.deep_learning_service.update_session_step(session_id, data)

    def generate_questions(self) -> dict:
        return self.deep_learning_service.generate_questions()

    def prepare_deep_learning(self, data: dict) -> dict:
        return self.deep_learning_service.prepare(data)

    def save_deep_learning_acceptance(self, data: dict) -> dict:
        return self.deep_learning_service.save_acceptance(data)

    def split_knowledge(self, knowledge_id: int) -> dict:
        return self.knowledge_split_service.split(knowledge_id)

    def suggest_schedule(self, date: Optional[str] = None) -> dict:
        return self.schedule_suggestion_service.suggest(date)

    @staticmethod
    def _parse_tags(raw_tags) -> list[str]:
        return ScheduleSuggestionService._parse_tags(raw_tags)

    @staticmethod
    def _normalize_action_key(content: str) -> str:
        return ScheduleSuggestionService._normalize_key(content)

    @staticmethod
    def _infer_category(text: str, tags: list[str]) -> str:
        return ScheduleSuggestionService._category(text, tags)

    @staticmethod
    def _effort_level(text: str, category: str) -> str:
        return ScheduleSuggestionService._effort(text, category)

    @staticmethod
    def _clean_action_content(content: str) -> str:
        return ScheduleSuggestionService._clean(content)

    @staticmethod
    def _is_actionable_clause(clause: str) -> bool:
        return ScheduleSuggestionService._is_actionable_clause(clause)

    @staticmethod
    def _extract_atomic_actions(knowledge_item) -> list[dict]:
        return ScheduleSuggestionService._extract_actions(knowledge_item)

    @staticmethod
    def _energy_level(today_mood, yesterday_mood) -> str:
        return ScheduleSuggestionService._energy(today_mood, yesterday_mood)

    @staticmethod
    def _build_schedule_suggestions(
        target_date,
        knowledge,
        today_mood,
        yesterday_mood,
        yesterday_schedules,
        existing_schedules,
    ) -> dict:
        return ScheduleSuggestionService._build(
            target_date,
            knowledge,
            today_mood,
            yesterday_mood,
            yesterday_schedules,
            existing_schedules,
        )

    def generate_daily_review(self, date: Optional[str] = None) -> dict:
        return self.daily_review_ai_service.generate(date)

    def generate_daily_plan(self, date: Optional[str] = None) -> dict:
        return self.daily_plan_ai_service.generate(date)

    def list_wisdom(self) -> list[dict]:
        return self.principles_service.list_wisdom()

    def initiate_review(self, period: str = "8days") -> dict:
        return self.review_ai_service.initiate(period)

    def extract_wisdom_from_review(self, conversation_text: str, period: str = "8days") -> dict:
        return self.review_ai_service.extract(conversation_text, period)

    # ── 目标、笔记和计划兼容入口 ──

    def refresh_daily_plan(self, date: Optional[str] = None) -> dict:
        target_date = date or datetime.now().strftime("%Y-%m-%d")
        return DailyPlanService.refresh_from_legacy(target_date)

    def list_goals(self) -> list[dict]:
        return self.goal_service.list_active()

    def create_goal(self, data: dict) -> dict:
        return self.goal_service.create(data)

    def breakdown_goal(self, goal_id: int) -> dict:
        return self.goal_ai_service.breakdown(goal_id)

    def list_notes(self, limit: int = 10) -> list[dict]:
        return self.note_service.list_recent(limit)

    def get_daily_note(self, date: Optional[str] = None) -> dict:
        return self.note_service.get_daily_note(date)

    def get_daily_context(self, date: str) -> dict:
        return self.context_service.get_daily_context(date)

    def sync_daily_plan_to_schedule(self, data: dict) -> dict:
        return DailyPlanService.sync_actions(data)

    def write_next_plan(self, data: dict) -> dict:
        return DailyPlanService.write_plan(data)
