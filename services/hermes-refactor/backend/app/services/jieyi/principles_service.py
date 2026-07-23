"""“道”读取服务：区分已验证原则与待验证方法论。"""

from __future__ import annotations

from datetime import datetime
import json
from typing import Callable

from app.db.connection import RefactorSessionLocal
from app.db.repositories.refactored import KnowledgeRepository, ScheduleNewRepository, WisdomRepository
from app.services.jieyi.method_library import JIEYI_METHOD_LIBRARY


class PrinciplesService:
    def __init__(self, session_factory: Callable = RefactorSessionLocal):
        self._session_factory = session_factory

    def get_principles(self) -> dict:
        today = datetime.now().strftime("%Y-%m-%d")
        db = self._session_factory()
        try:
            wisdom_items = WisdomRepository.list_recent(db, 8)
            completed = ScheduleNewRepository.list_completed_by_source(db, "daily_practice", 50)
            latest_by_content = {}
            for row in completed:
                latest_by_content.setdefault(row.content, row)

            principles = []
            for item in wisdom_items:
                tags = self._json_list(item.tags)
                review_id = getattr(item, "source_review_id", None)
                created_at = getattr(item, "created_at", None)
                candidate_id = self._tag_value(tags, "candidate_id:")
                promoted_from_candidate = candidate_id is not None or "from_cognitive_asset_candidate" in tags
                principles.append({
                    "id": f"wisdom:{item.id}",
                    "content": item.content,
                    "source": (
                        f"认知资产候选 #{candidate_id} · 用户确认提升"
                        if promoted_from_candidate and candidate_id
                        else "认知资产候选 · 用户确认提升"
                        if promoted_from_candidate
                        else f"思页复盘 #{review_id}" if review_id is not None else "思页复盘沉淀"
                    ),
                    "source_type": "reflection_wisdom",
                    "pillar": "认知资产正式原则" if promoted_from_candidate else tags[0] if tags else "知行思验证",
                    "evidence": (
                        "来自用户明确确认的认知资产候选，已提升为正式原则。"
                        if promoted_from_candidate
                        else "来自复盘/长期对话后写入 wisdom 表，属于已经沉淀的用户判断。"
                    ),
                    "related_practice": None,
                    "verification_status": "verified",
                    "verification_label": "已验证",
                    "last_verified_at": created_at,
                })

            for item in KnowledgeRepository.list_all(db, source_type="cognitive_asset_candidate"):
                tags = self._json_list(item.tags)
                if "promoted" in tags:
                    continue
                source_date = self._candidate_source_date(item.source_url, item.created_at)
                principles.append({
                    "id": f"knowledge:{item.id}",
                    "content": item.content,
                    "source": f"深度学习材料 · {source_date}",
                    "source_type": "cognitive_asset_candidate",
                    "pillar": "认知资产候选",
                    "evidence": "来自深度学习五卡验收；候选确认前不进入长期原则。",
                    "related_practice": None,
                    "verification_status": "pending",
                    "verification_label": "候选池 · 待确认",
                    "last_verified_at": None,
                    "candidate_status": "candidate",
                    "source_date": source_date,
                    "source_reflection": None,
                    "related_actions": [],
                    "related_knowledge": tags[1:2],
                })

            for method in JIEYI_METHOD_LIBRARY[:6]:
                checkin = latest_by_content.get(method["practice"])
                principles.append({
                    "id": f"method:{method['id']}",
                    "content": method["statement"],
                    "source": method["source"],
                    "source_type": "method_library",
                    "pillar": method["pillar"],
                    "evidence": method["reason"],
                    "related_practice": method["practice"],
                    "verification_status": "checked_today" if checkin and checkin.date == today else "pending",
                    "verification_label": "今日已练，等待复盘沉淀" if checkin and checkin.date == today else "待验证",
                    "last_verified_at": checkin.date if checkin else None,
                })

            return {
                "direction": "成为一个能持续积累资产和判断力的人。",
                "principles": principles,
                "data_sources": [
                    "wisdom 表：思页/长期复盘沉淀的用户判断",
                    "schedules_new 表：daily_practice 完成记录，用于最近验证状态",
                    "JIEYI_METHOD_LIBRARY：知页方法论候选，未复盘前标记待验证",
                ],
            }
        finally:
            db.close()

    def promote_candidate(self, candidate_id: int, statement: str) -> dict:
        """把用户明确确认的候选提升为正式 wisdom，并保留候选来源。"""
        statement = (statement or "").strip()
        if not statement:
            return {"ok": False, "error": "正式原则不能为空"}

        db = self._session_factory()
        try:
            candidate = KnowledgeRepository.get_by_id(db, candidate_id)
            if not candidate or candidate.source_type != "cognitive_asset_candidate":
                return {"ok": False, "error": f"认知资产候选 {candidate_id} 不存在"}

            tags = self._json_list(candidate.tags)
            existing_wisdom_id = self._tag_value(tags, "promoted_wisdom_id:")
            if existing_wisdom_id:
                wisdom = WisdomRepository.get_by_id(db, int(existing_wisdom_id))
                if wisdom:
                    return self._promotion_result(candidate, wisdom, already_promoted=True)

            wisdom = WisdomRepository.create(db, {
                "content": statement,
                "tags": json.dumps([
                    "from_cognitive_asset_candidate",
                    f"candidate_id:{candidate_id}",
                    f"source_date:{self._candidate_source_date(candidate.source_url, candidate.created_at)}",
                    "explicit_user_confirmation",
                ], ensure_ascii=False),
            })
            promoted_tags = [tag for tag in tags if tag != "pending"]
            promoted_tags.extend(["promoted", f"promoted_wisdom_id:{wisdom.id}"])
            candidate.tags = json.dumps(list(dict.fromkeys(promoted_tags)), ensure_ascii=False)
            db.commit()
            return self._promotion_result(candidate, wisdom, already_promoted=False)
        finally:
            db.close()

    def list_wisdom(self) -> list[dict]:
        db = self._session_factory()
        try:
            return [{
                "id": item.id,
                "content": item.content,
                "source_review_id": item.source_review_id,
                "tags": item.tags,
                "created_at": item.created_at,
            } for item in WisdomRepository.list_all(db)]
        finally:
            db.close()

    @staticmethod
    def _json_list(value) -> list:
        import json
        if isinstance(value, list):
            return value
        if not value:
            return []
        try:
            parsed = json.loads(value)
        except (TypeError, json.JSONDecodeError):
            return []
        return parsed if isinstance(parsed, list) else []

    @staticmethod
    def _candidate_source_date(source_url, created_at) -> str:
        if isinstance(source_url, str) and source_url.startswith("deep-learning:"):
            parts = source_url.split(":", 2)
            if len(parts) > 1 and parts[1]:
                return parts[1]
        return str(created_at or "")[:10]

    @staticmethod
    def _tag_value(tags: list, prefix: str) -> str | None:
        for tag in tags:
            if isinstance(tag, str) and tag.startswith(prefix):
                return tag[len(prefix):]
        return None

    @staticmethod
    def _promotion_result(candidate, wisdom, already_promoted: bool) -> dict:
        return {
            "ok": True,
            "already_promoted": already_promoted,
            "candidate": {
                "id": candidate.id,
                "status": "promoted",
                "source_type": "cognitive_asset_candidate",
                "source_date": PrinciplesService._candidate_source_date(candidate.source_url, candidate.created_at),
            },
            "principle": {
                "id": f"wisdom:{wisdom.id}",
                "content": wisdom.content,
                "source_type": "reflection_wisdom",
                "verification_status": "verified",
                "verification_label": "已验证",
                "source": f"认知资产候选 #{candidate.id} · 用户确认提升",
            },
        }
