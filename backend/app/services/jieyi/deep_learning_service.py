"""知页深度学习与模型问题适配层。

产品层只接收真实知识材料、结构化问题和明确的回写目标；没有匹配材料时保持 fallback，
不把方法论兜底伪装成 live 学习材料。
"""

from __future__ import annotations

import json
from datetime import datetime
from typing import Any, Callable

from app.agents.llm_client import LLMClient, load_prompt
from app.db.connection import RefactorSessionLocal
from app.db.models import KnowledgeModel, NoteModel
from app.db.repositories.refactored import (
    KnowledgeRepository,
    NoteRepository,
    ScheduleNewRepository,
)
from app.services.jieyi.action_service import schedule_to_dict


class DeepLearningService:
    def __init__(self, session_factory: Callable = RefactorSessionLocal, llm: Any = None):
        self._session_factory = session_factory
        self._llm = llm or LLMClient()

    def prepare(self, data: dict) -> dict:
        topic = (data.get("topic") or "").strip()
        scope = data.get("scope") or "all"
        if not topic:
            return {
                "mode": "fallback",
                "topic": "",
                "scope": scope,
                "status_label": "缺少主题",
                "materials": [],
                "questions": [],
                "cards": [],
            }

        db = self._session_factory()
        try:
            matched = [
                item for item in KnowledgeRepository.search(db, topic, scope, 6)
                if not self._is_internal_smoke(item)
            ]
            materials = []
            for index, item in enumerate(matched):
                role = "core" if index < 2 else "related" if index < 5 else "boundary"
                materials.append({
                    "title": item.title,
                    "source": item.source_type or "knowledge",
                    "snippet": (item.content or "")[:180],
                    "role": role,
                })
            questions = [
                f"{topic}真正要解决的是哪个现实问题？",
                f"本地材料里关于{topic}的共同结构是什么？",
                f"如果把{topic}转成今天的一个行动，最小动作是什么？",
            ]
            if materials:
                questions[1] = f"《{materials[0]['title']}》和旧知识之间有什么冲突或互补？"
            return {
                "mode": "live" if materials else "fallback",
                "topic": topic,
                "scope": scope,
                "status_label": "API 已连接" if materials else "未找到匹配材料，未伪装学习包",
                "materials": materials,
                "questions": questions,
                "selected_question": questions[0],
                "learning_pack": {
                    "duration_minutes": 60,
                    "core_notes": [item["title"] for item in materials if item["role"] == "core"],
                    "related_notes": [item["title"] for item in materials if item["role"] == "related"],
                    "boundary_notes": [item["title"] for item in materials if item["role"] == "boundary"],
                },
                "cards": [
                    {"key": "problem", "title": "问题", "prompt": "这次学习只回答一个真实问题，不追求读完材料。"},
                    {"key": "structure", "title": "结构", "prompt": "拆出主张、论证路径、关键概念。"},
                    {"key": "connection", "title": "旧知识连接", "prompt": "找出相似、补充、冲突、可迁移的旧笔记。"},
                    {"key": "boundary", "title": "边界/反例", "prompt": "写清楚这条知识在哪些情况下会失败。"},
                    {"key": "action", "title": "判断/行动", "prompt": "沉淀为一个决策规则、行动、复盘问题或下个学习问题。"},
                ],
                "acceptance": {
                    "levels": ["shallow", "partial", "usable"],
                    "default_level": "partial",
                    "destinations": ["knowledge_card", "action_item", "next_question"],
                },
            }
        finally:
            db.close()

    def generate_questions(self) -> dict:
        db = self._session_factory()
        try:
            items = KnowledgeRepository.list_recent(db, 20)
            if not items:
                return {"questions": []}
            knowledge_text = "\n\n---\n\n".join(
                f"标题：{item.title}\n内容：{item.content[:300]}" for item in items
            )
            response = self._llm.chat(
                load_prompt("generate_questions.txt"),
                knowledge_text,
                temperature=0.7,
            )
            result = response.json()
            if isinstance(result, dict) and "questions" in result:
                return result
            return self._question_fallback()
        finally:
            db.close()

    @staticmethod
    def _question_fallback() -> dict:
        return {
            "questions": [
                {"main": "这些知识之间有什么联系？", "subs": ["哪两条知识可以组合产生新想法？", "有没有互相矛盾的观点？"]},
                {"main": "这些知识如何改变你的行动？", "subs": ["明天你可以尝试的一个改变是什么？", "哪个知识最迫切需要实践？"]},
            ]
        }

    @staticmethod
    def _is_internal_smoke(item: Any) -> bool:
        values = [
            getattr(item, "title", ""),
            getattr(item, "content", ""),
            getattr(item, "source_url", ""),
            getattr(item, "tags", ""),
        ]
        return any("xiaobai-smoke" in str(value).lower() or "smoke-test" in str(value).lower() for value in values)

    def save_acceptance(self, data: dict) -> dict:
        topic = (data.get("topic") or "深度学习").strip()
        question = (data.get("question") or "").strip()
        destination = data.get("destination") or "knowledge_card"
        cards = data.get("cards") or {}
        body = "\n".join(f"{key}: {value}" for key, value in cards.items() if str(value).strip())
        content = body or question or topic
        today = datetime.now().strftime("%Y-%m-%d")
        source_date = (data.get("source_date") or today).strip()
        source_materials = data.get("source_materials") or []
        source_material_titles = [
            item.get("title", "") for item in source_materials
            if isinstance(item, dict) and str(item.get("title", "")).strip()
        ]
        source_url = f"deep-learning:{source_date}:{topic}"
        db = self._session_factory()
        try:
            if destination == "action_item":
                item = ScheduleNewRepository.create(db, {
                    "date": today,
                    "content": content[:120],
                    "source": "deep_learning_acceptance",
                    "priority": 2,
                    "category": "知",
                })
                return {"ok": True, "destination": destination, "schedule": schedule_to_dict(item)}

            note = NoteModel(
                title=f"深度学习验收 · {topic}",
                content=f"问题：{question}\n等级：{data.get('level')}\n{content}",
                date=today,
            )
            db.add(note)
            if destination == "knowledge_card":
                candidate = KnowledgeRepository.get_by_source_url(db, source_url)
                if candidate is None:
                    candidate = KnowledgeModel(
                        title=f"深度学习 · {topic}",
                        content=(
                            f"来源日期：{source_date}\n"
                            f"原始材料：{', '.join(source_material_titles) or '本次深度学习材料'}\n"
                            f"验收问题：{question}\n"
                            f"验收等级：{data.get('level') or 'partial'}\n"
                            f"{content}"
                        ),
                        source_type="cognitive_asset_candidate",
                        source_url=source_url,
                        tags=json.dumps(["深度学习", topic, "pending"], ensure_ascii=False),
                        is_core=False,
                    )
                    db.add(candidate)
            db.commit()
            db.refresh(note)
            response = {"ok": True, "destination": destination, "note_id": note.id}
            if destination == "knowledge_card":
                if getattr(candidate, "id", None) is None:
                    db.refresh(candidate)
                response["candidate"] = {
                    "id": f"knowledge:{candidate.id}",
                    "content": candidate.content,
                    "source": f"深度学习材料 · {source_date}",
                    "source_type": "cognitive_asset_candidate",
                    "pillar": "认知资产候选",
                    "evidence": f"来自深度学习验收：{question or topic}",
                    "related_practice": None,
                    "verification_status": "pending",
                    "verification_label": "候选池 · 待确认",
                    "last_verified_at": None,
                    "candidate_status": "candidate",
                    "source_date": source_date,
                    "source_reflection": question,
                    "related_actions": data.get("related_actions") or [],
                    "related_knowledge": data.get("related_knowledge") or source_material_titles,
                }
            return response
        finally:
            db.close()

    def create_session(self, data: dict) -> dict:
        prepared = self.prepare(data)
        session_id = f"deep:{datetime.now().strftime('%Y%m%d%H%M%S')}:{abs(hash((prepared.get('topic'), prepared.get('scope')))) % 100000}"
        return {
            "ok": True,
            "session_id": session_id,
            "topic": prepared.get("topic"),
            "steps": [
                {"key": "question", "minutes": 5, "title": "选定一个问题", "questions": prepared.get("questions", [])},
                {"key": "read", "minutes": 15, "title": "阅读核心材料", "materials": prepared.get("materials", [])},
                {"key": "structure", "minutes": 10, "title": "拆结构", "prompt": "它的主张、理由、适用条件是什么？"},
                {"key": "connection", "minutes": 10, "title": "连旧知识", "prompt": "它和你以前哪个判断冲突或互补？"},
                {"key": "boundary", "minutes": 10, "title": "找边界", "prompt": "它什么时候不成立？"},
                {"key": "landing", "minutes": 10, "title": "落地", "prompt": "生成一个行动、一个复盘问题、一个原则候选。"},
            ],
            "prepared": prepared,
        }

    def update_session_step(self, session_id: str, data: dict) -> dict:
        step = data.get("step") or data.get("key") or "step"
        content = data.get("content") or data.get("answer") or ""
        if not str(content).strip():
            return {"ok": True, "session_id": session_id, "step": step, "saved": {"ok": True}}
        db = self._session_factory()
        try:
            note = NoteRepository.create(db, {
                "title": f"思考卡判断 · {session_id}:{step}",
                "content": f"{step}: {content}",
                "date": datetime.now().strftime("%Y-%m-%d"),
            })
            return {
                "ok": True,
                "session_id": session_id,
                "step": step,
                "saved": {"ok": True, "note_id": note.id, "card_id": f"{session_id}:{step}"},
            }
        finally:
            db.close()
