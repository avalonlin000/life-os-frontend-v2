"""结衣每日计划生成适配层；生成成功后只写产品数据库。"""

from __future__ import annotations

import json
from datetime import datetime, timedelta
from typing import Any, Callable

from app.agents.llm_client import LLMClient, load_prompt
from app.db.connection import RefactorSessionLocal
from app.db.repositories.refactored import KnowledgeRepository, WisdomRepository
from app.services.jieyi.daily_plan_service import DailyPlanService


class DailyPlanAIService:
    def __init__(
        self,
        session_factory: Callable = RefactorSessionLocal,
        llm: Any = None,
        daily_plan_service: Any = DailyPlanService,
    ):
        self._session_factory = session_factory
        self._llm = llm or LLMClient()
        self._daily_plan_service = daily_plan_service

    def generate(self, date: str | None = None) -> dict:
        target_date = date or datetime.now().strftime("%Y-%m-%d")
        db = self._session_factory()
        try:
            candidates = KnowledgeRepository.list_recent(db, 50)
            materials = [item for item in candidates if not self._is_internal_smoke(item)][:8]
            if not materials:
                return {
                    "ok": False,
                    "date": target_date,
                    "status": "insufficient_materials",
                    "error": "结衣知识库没有可用于生成课程表的材料",
                }
            wisdom = WisdomRepository.list_recent(db, 6)
            context = {
                "date": target_date,
                "materials": [
                    {
                        "title": item.title,
                        "content": item.content[:1800],
                        "source_type": item.source_type,
                        "source_url": item.source_url,
                        "tags": item.tags,
                        "is_core": bool(item.is_core),
                    }
                    for item in materials
                ],
                "wisdom": [item.content for item in wisdom],
            }
        finally:
            db.close()

        previous_date = (
            datetime.strptime(target_date, "%Y-%m-%d") - timedelta(days=1)
        ).strftime("%Y-%m-%d")
        context["previous_plan"] = self._daily_plan_service.get_by_date(previous_date)

        result = self._llm.chat(
            load_prompt("daily_plan.txt"),
            json.dumps(context, ensure_ascii=False),
            temperature=0.45,
            max_tokens=4096,
        ).json()
        if not isinstance(result, dict) or result.get("error"):
            return {
                "ok": False,
                "date": target_date,
                "status": "model_error",
                "error": str(result.get("error") if isinstance(result, dict) else "模型没有返回有效计划"),
            }

        plan = self._normalize(result, target_date)
        if plan is None:
            return {
                "ok": False,
                "date": target_date,
                "status": "invalid_plan",
                "error": "模型返回的课程表缺少有效学习材料或行动项",
            }

        saved = self._daily_plan_service.write_plan(plan)
        return {
            "ok": True,
            "date": target_date,
            "source": "product_db",
            "plan": plan,
            "synced_schedules": saved.get("synced_schedules", 0),
        }

    @staticmethod
    def _normalize(result: dict, target_date: str) -> dict | None:
        learn = result.get("learn")
        review = result.get("review", [])
        tasks = result.get("doTasks", result.get("do_tasks"))
        if not isinstance(learn, list) or not isinstance(review, list) or not isinstance(tasks, list):
            return None

        clean_learn = []
        for item in learn[:2]:
            if not isinstance(item, dict):
                continue
            questions = item.get("questions")
            if not item.get("title") or not item.get("content") or not isinstance(questions, list):
                continue
            clean_learn.append({
                "pillar": str(item.get("pillar") or "未分类"),
                "title": str(item["title"]),
                "content": str(item["content"]),
                "questions": [str(question) for question in questions[:2] if str(question).strip()],
                "source": str(item.get("source") or "结衣知识库"),
            })

        clean_tasks = [str(task).strip() for task in tasks if str(task).strip()]
        if not clean_learn or not clean_tasks:
            return None

        clean_review = [item for item in review[:2] if isinstance(item, dict)]
        return {
            "date": target_date,
            "learn": clean_learn,
            "review": clean_review,
            "doTasks": clean_tasks,
            "suggestion": str(result.get("suggestion") or ""),
        }

    @staticmethod
    def _is_internal_smoke(item: Any) -> bool:
        text = " ".join(
            str(value or "")
            for value in (item.title, item.content, item.tags, item.source_type)
        ).lower()
        return any(marker in text for marker in ("xiaobai-smoke", "smoke-test", "smoke_test"))
