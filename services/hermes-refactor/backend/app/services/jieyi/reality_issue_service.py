"""现实课题主循环服务：聚合认识、方法、实践、反馈与更新历史。"""

from __future__ import annotations

from datetime import datetime
from typing import Callable, Optional

from app.db.connection import RefactorSessionLocal
from app.db.models import (
    PersonalMethodVersionModel,
    PracticeEventModel,
    RealityMethodSourceModel,
    RealityIssueEntryModel,
    RealityIssueModel,
    ScheduleNewModel,
)
from app.services.jieyi.action_service import schedule_to_dict
from app.services.jieyi.reality_issue_repository import RealityIssueRepository
from app.db.repositories.refactored import KnowledgeRepository


ENTRY_GROUPS = {
    "fact": "facts",
    "knowledge": "knowledge",
    "understanding": "understandings",
    "question": "questions",
    "method": "methods",
    "feedback": "feedback",
    "worldview_update": "worldview_updates",
    "method_update": "method_updates",
}
OBSERVED_ENTRY_KINDS = {"fact", "knowledge", "feedback"}
ISSUE_STATUSES = {"active", "paused", "resolved"}
PRACTICE_TRANSITIONS = {
    "completed": {"practice_status": "completed", "is_done": True},
    "interrupted": {"practice_status": "interrupted", "is_done": False},
    "returned": {"practice_status": "active", "is_done": False},
}


class RealityIssueNotFound(LookupError):
    pass


class RealityIssueInvalid(ValueError):
    pass


class RealityIssueConflict(RuntimeError):
    pass


def _now() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def _issue_to_dict(item: RealityIssueModel) -> dict:
    return {
        "id": item.id,
        "title": item.title,
        "current_reality": item.current_reality,
        "desired_change": item.desired_change or "",
        "primary_contradiction": item.primary_contradiction,
        "objective_conditions": item.objective_conditions,
        "status": item.status,
        "is_focus": bool(item.is_focus),
        "created_at": item.created_at,
        "updated_at": item.updated_at,
    }


def _entry_to_dict(item: RealityIssueEntryModel) -> dict:
    return {
        "id": item.id,
        "reality_issue_id": item.reality_issue_id,
        "kind": item.kind,
        "content": item.content,
        "status": item.status,
        "source_type": item.source_type,
        "source_id": item.source_id,
        "practice_id": item.practice_id,
        "occurred_at": item.occurred_at,
        "created_at": item.created_at,
        "confirmed_at": item.confirmed_at,
    }


def _method_source_to_dict(item: RealityMethodSourceModel) -> dict:
    return {
        "analysis_id": item.analysis_id,
        "knowledge_id": item.knowledge_id,
        "relevance_reason": item.relevance_reason,
        "applicable_conditions": item.applicable_conditions,
        "boundary": item.boundary,
        "verification_action": item.verification_action,
    }


def _method_version_to_dict(item: PersonalMethodVersionModel) -> dict:
    import json
    try:
        knowledge_ids = json.loads(item.knowledge_ids or "[]")
    except (TypeError, json.JSONDecodeError):
        knowledge_ids = []
    return {
        "id": item.id,
        "issue_id": item.issue_id,
        "method_entry_id": item.method_entry_id,
        "update_entry_id": item.update_entry_id,
        "knowledge_ids": knowledge_ids,
        "content": item.content,
        "applicable_conditions": item.applicable_conditions,
        "boundary": item.boundary,
        "evidence_feedback_id": item.evidence_feedback_id,
        "status": item.status,
        "created_at": item.created_at,
    }


class RealityIssueService:
    def __init__(self, session_factory: Callable = RefactorSessionLocal):
        self._session_factory = session_factory

    def _open(self):
        return self._session_factory()

    @staticmethod
    def _get_issue(repository: RealityIssueRepository, issue_id: int) -> RealityIssueModel:
        item = repository.get_issue(issue_id)
        if not item:
            raise RealityIssueNotFound("reality_issue_not_found")
        return item

    @staticmethod
    def _get_entry(
        repository: RealityIssueRepository,
        issue_id: int,
        entry_id: int,
    ) -> RealityIssueEntryModel:
        item = repository.get_entry(issue_id, entry_id)
        if not item:
            raise RealityIssueNotFound("reality_issue_entry_not_found")
        return item

    @staticmethod
    def _entry_result(repository: RealityIssueRepository, item: RealityIssueEntryModel) -> dict:
        result = _entry_to_dict(item)
        result["knowledge_sources"] = [
            _method_source_to_dict(source)
            for source in repository.list_method_sources(item.id)
        ]
        return result

    def list_issues(self) -> list[dict]:
        db = self._open()
        try:
            repository = RealityIssueRepository(db)
            return [self._aggregate(repository, item) for item in repository.list_issues()]
        finally:
            db.close()

    def get_issue(self, issue_id: int) -> dict:
        db = self._open()
        try:
            repository = RealityIssueRepository(db)
            return self._aggregate(repository, self._get_issue(repository, issue_id))
        finally:
            db.close()

    def get_focus(self) -> Optional[dict]:
        db = self._open()
        try:
            repository = RealityIssueRepository(db)
            item = repository.get_focus()
            return self._aggregate(repository, item) if item else None
        finally:
            db.close()

    def analyze_knowledge(self, issue_id: int) -> dict:
        db = self._open()
        try:
            repository = RealityIssueRepository(db)
            issue = self._get_issue(repository, issue_id)
            issue_text = " ".join(filter(None, (
                issue.title, issue.current_reality, issue.desired_change,
                issue.primary_contradiction, issue.objective_conditions,
            )))
            matches = []
            profiled_count = 0
            for knowledge in KnowledgeRepository.list_all(db):
                profile = KnowledgeRepository.get_profile(db, knowledge.id)
                if profile is None:
                    continue
                profiled_count += 1
                terms = self._knowledge_terms(knowledge, profile)
                shared = next((term for term in terms if term and term in issue_text), None)
                if shared is None:
                    continue
                matches.append({
                    "knowledge_id": knowledge.id,
                    "title": knowledge.title,
                    "source_type": knowledge.source_type,
                    "source_url": knowledge.source_url,
                    "relevance_reason": f"课题与知识共同涉及：{shared}",
                    "problem": profile.problem,
                    "method": profile.method,
                    "applicable_conditions": profile.applicable_conditions,
                    "boundary": profile.boundaries,
                    "verification_action": profile.testable_action,
                })
            analysis_id = self._analysis_id(issue_id, issue_text, matches)
            if matches:
                return {
                    "analysis_id": analysis_id,
                    "issue_id": issue_id,
                    "status": "ready",
                    "matches": matches,
                    "synthesis": "；".join(item["method"] for item in matches),
                    "conflicts": [],
                    "unknowns": [],
                    "knowledge_gap": None,
                }
            status = "knowledge_gap" if profiled_count else "knowledge_unavailable"
            return {
                "analysis_id": analysis_id,
                "issue_id": issue_id,
                "status": status,
                "matches": [],
                "synthesis": None,
                "conflicts": [],
                "unknowns": ["当前没有足够的私人知识形成方法。"],
                "knowledge_gap": {
                    "status": status,
                    "message": (
                        "当前私人知识不足以解释这件现实课题，需要补充可追溯知识。"
                        if profiled_count
                        else "现有知识尚未完成结构化，暂时不能参与现实分析。"
                    ),
                    "query": issue.current_reality,
                },
            }
        finally:
            db.close()

    @staticmethod
    def _knowledge_terms(knowledge, profile) -> list[str]:
        import json
        terms = []
        try:
            tags = json.loads(knowledge.tags or "[]")
            if isinstance(tags, list):
                terms.extend(str(tag).strip() for tag in tags)
        except (TypeError, json.JSONDecodeError):
            terms.extend(part.strip() for part in str(knowledge.tags or "").split(","))
        title = str(knowledge.title or "").replace("深度学习", "").replace("·", " ")
        terms.extend(part.strip() for part in title.split())
        return sorted({term for term in terms if len(term) >= 2}, key=len, reverse=True)

    @staticmethod
    def _analysis_id(issue_id: int, issue_text: str, matches: list[dict]) -> str:
        import hashlib
        import json
        source = f"{issue_id}|{issue_text}|{json.dumps(matches, ensure_ascii=False, sort_keys=True)}"
        return f"ka:{issue_id}:{hashlib.sha256(source.encode('utf-8')).hexdigest()[:16]}"

    def create_method_candidate(self, issue_id: int, data: dict) -> dict:
        analysis = self.analyze_knowledge(issue_id)
        if analysis["analysis_id"] != data.get("analysis_id"):
            raise RealityIssueConflict("knowledge_analysis_stale")
        if analysis["status"] != "ready" or not analysis["matches"]:
            raise RealityIssueConflict("knowledge_analysis_not_ready")
        content = (data.get("content") or analysis.get("synthesis") or "").strip()
        if not content:
            raise RealityIssueInvalid("method_content_required")

        db = self._open()
        try:
            repository = RealityIssueRepository(db)
            issue = self._get_issue(repository, issue_id)
            if issue.status != "active":
                raise RealityIssueConflict("method_requires_active_issue")
            item = RealityIssueEntryModel(
                reality_issue_id=issue_id,
                kind="method",
                content=content,
                status="candidate",
                source_type="knowledge_analysis",
            )
            repository.add(item)
            repository.flush()
            for match in analysis["matches"]:
                repository.add(RealityMethodSourceModel(
                    method_entry_id=item.id,
                    analysis_id=analysis["analysis_id"],
                    knowledge_id=match["knowledge_id"],
                    relevance_reason=match["relevance_reason"],
                    applicable_conditions=match["applicable_conditions"],
                    boundary=match["boundary"],
                    verification_action=match["verification_action"],
                ))
            repository.commit()
            repository.refresh(item)
            return self._entry_result(repository, item)
        finally:
            db.close()

    def create_issue(self, data: dict) -> dict:
        statement = (data.get("statement") or "").strip()
        current_reality = (data.get("current_reality") or statement).strip()
        if not current_reality:
            raise RealityIssueInvalid("current_reality_or_statement_required")
        title = (data.get("title") or current_reality.splitlines()[0][:80]).strip()
        if not title:
            raise RealityIssueInvalid("title_required")

        db = self._open()
        try:
            repository = RealityIssueRepository(db)
            has_focus = repository.get_focus()
            item = RealityIssueModel(
                title=title,
                current_reality=current_reality,
                desired_change=(data.get("desired_change") or "").strip(),
                primary_contradiction=data.get("primary_contradiction"),
                objective_conditions=data.get("objective_conditions"),
                status="active",
                is_focus=not bool(has_focus),
            )
            repository.add(item)
            repository.commit()
            repository.refresh(item)
            return self._aggregate(repository, item)
        finally:
            db.close()

    def update_issue(self, issue_id: int, data: dict) -> dict:
        db = self._open()
        try:
            repository = RealityIssueRepository(db)
            item = self._get_issue(repository, issue_id)
            changes = {key: value for key, value in data.items() if value is not None}
            if "status" in changes and changes["status"] not in ISSUE_STATUSES:
                raise RealityIssueInvalid("invalid_reality_issue_status")
            for required in ("title", "current_reality"):
                if required in changes and not changes[required].strip():
                    raise RealityIssueInvalid(f"{required}_required")
            for key in (
                "title", "current_reality", "desired_change",
                "primary_contradiction", "objective_conditions", "status",
            ):
                if key in changes:
                    setattr(item, key, changes[key].strip() if isinstance(changes[key], str) else changes[key])
            if item.status != "active":
                item.is_focus = False
            item.updated_at = _now()
            repository.commit()
            repository.refresh(item)
            return self._aggregate(repository, item)
        finally:
            db.close()

    def focus_issue(self, issue_id: int) -> dict:
        db = self._open()
        try:
            repository = RealityIssueRepository(db)
            item = self._get_issue(repository, issue_id)
            if item.status != "active":
                raise RealityIssueConflict("only_active_issue_can_be_focused")
            repository.clear_focus()
            item.is_focus = True
            item.updated_at = _now()
            repository.commit()
            repository.refresh(item)
            return self._aggregate(repository, item)
        finally:
            db.close()

    def create_entry(self, issue_id: int, data: dict) -> dict:
        kind = data.get("kind")
        if kind not in ENTRY_GROUPS:
            raise RealityIssueInvalid("invalid_reality_issue_entry_kind")

        db = self._open()
        try:
            repository = RealityIssueRepository(db)
            self._get_issue(repository, issue_id)
            content = (data.get("content") or "").strip()
            source_type = data.get("source_type")
            source_id = data.get("source_id")
            if kind == "knowledge" and source_id is not None and source_type == "knowledge":
                knowledge = repository.get_knowledge(source_id)
                if not knowledge:
                    raise RealityIssueNotFound("knowledge_not_found")
                content = content or knowledge.content
            if not content:
                raise RealityIssueInvalid("entry_content_required")
            practice_id = data.get("practice_id")
            if practice_id is not None:
                linked_practice = repository.get_practice(practice_id, issue_id)
                if not linked_practice:
                    raise RealityIssueNotFound("reality_issue_practice_not_found")

            item = RealityIssueEntryModel(
                reality_issue_id=issue_id,
                kind=kind,
                content=content,
                status="observed" if kind in OBSERVED_ENTRY_KINDS else "candidate",
                source_type=source_type,
                source_id=source_id,
                practice_id=practice_id,
                occurred_at=data.get("occurred_at"),
            )
            repository.add(item)
            repository.commit()
            repository.refresh(item)
            return self._entry_result(repository, item)
        finally:
            db.close()

    def confirm_entry(self, issue_id: int, entry_id: int) -> dict:
        db = self._open()
        try:
            repository = RealityIssueRepository(db)
            item = self._get_entry(repository, issue_id, entry_id)
            if item.status == "confirmed":
                return self._entry_result(repository, item)
            if item.status != "candidate":
                raise RealityIssueConflict("only_candidate_entry_can_be_confirmed")
            item.status = "confirmed"
            item.confirmed_at = _now()
            repository.commit()
            repository.refresh(item)
            return self._entry_result(repository, item)
        finally:
            db.close()

    def reject_entry(self, issue_id: int, entry_id: int) -> dict:
        db = self._open()
        try:
            repository = RealityIssueRepository(db)
            item = self._get_entry(repository, issue_id, entry_id)
            if item.status == "rejected":
                return self._entry_result(repository, item)
            if item.status != "candidate":
                raise RealityIssueConflict("only_candidate_entry_can_be_rejected")
            item.status = "rejected"
            item.confirmed_at = None
            repository.commit()
            repository.refresh(item)
            return self._entry_result(repository, item)
        finally:
            db.close()

    def create_practice(self, issue_id: int, data: dict) -> dict:
        db = self._open()
        try:
            repository = RealityIssueRepository(db)
            issue = self._get_issue(repository, issue_id)
            if issue.status != "active":
                raise RealityIssueConflict("practice_requires_active_issue")
            content = data["content"].strip()
            if not content:
                raise RealityIssueInvalid("practice_content_required")
            method_entry_id = data["method_entry_id"]
            method = repository.get_entry(issue_id, method_entry_id)
            if not method:
                raise RealityIssueNotFound("reality_issue_method_not_found")
            if method.kind != "method" or method.status != "confirmed":
                raise RealityIssueConflict("practice_requires_confirmed_method")
            practice = ScheduleNewModel(
                date=data["date"],
                content=content,
                source="reality_issue",
                reality_issue_id=issue_id,
                method_entry_id=method_entry_id,
                practice_status="active",
                is_done=False,
            )
            repository.add(practice)
            repository.flush()
            repository.add(PracticeEventModel(schedule_id=practice.id, event_type="started"))
            repository.commit()
            repository.refresh(practice)
            return self._aggregate(repository, issue)
        finally:
            db.close()

    def change_practice_state(self, schedule_id: int, event_type: str, note: str = "") -> dict:
        if event_type not in PRACTICE_TRANSITIONS:
            raise RealityIssueInvalid("invalid_practice_event")
        db = self._open()
        try:
            repository = RealityIssueRepository(db)
            practice = repository.get_practice(schedule_id)
            if not practice:
                raise RealityIssueNotFound("reality_issue_practice_not_found")
            latest_event = repository.latest_event(practice.id)
            current_status = practice.practice_status or ("completed" if practice.is_done else "active")
            idempotent = (
                (event_type == "completed" and current_status == "completed")
                or (event_type == "interrupted" and current_status == "interrupted")
                or (
                    event_type == "returned"
                    and current_status == "active"
                    and latest_event is not None
                    and latest_event.event_type == "returned"
                )
            )
            if idempotent:
                return schedule_to_dict(practice)
            legal = (
                (event_type in {"completed", "interrupted"} and current_status == "active")
                or (event_type == "returned" and current_status == "interrupted")
            )
            if not legal:
                raise RealityIssueConflict(
                    f"illegal_practice_transition:{current_status}->{event_type}"
                )
            for key, value in PRACTICE_TRANSITIONS[event_type].items():
                setattr(practice, key, value)
            practice.updated_at = _now()
            repository.add(PracticeEventModel(
                schedule_id=practice.id,
                event_type=event_type,
                note=note.strip() or None,
            ))
            repository.commit()
            repository.refresh(practice)
            return schedule_to_dict(practice)
        finally:
            db.close()

    def add_feedback(self, issue_id: int, schedule_id: int, data: dict) -> dict:
        db = self._open()
        try:
            repository = RealityIssueRepository(db)
            issue = self._get_issue(repository, issue_id)
            practice = repository.get_practice(schedule_id, issue_id)
            if not practice:
                raise RealityIssueNotFound("reality_issue_practice_not_found")
            content = data["content"].strip()
            if not content:
                raise RealityIssueInvalid("feedback_content_required")
            item = RealityIssueEntryModel(
                reality_issue_id=issue_id,
                kind="feedback",
                content=content,
                status="observed",
                source_type="practice_feedback",
                practice_id=schedule_id,
                occurred_at=data.get("occurred_at"),
            )
            repository.add(item)
            repository.flush()
            self._ensure_feedback_candidates(
                repository, issue_id, schedule_id, item
            )
            repository.commit()
            return self._aggregate(repository, issue)
        finally:
            db.close()

    @staticmethod
    def _ensure_feedback_candidates(
        repository: RealityIssueRepository,
        issue_id: int,
        schedule_id: int,
        feedback: RealityIssueEntryModel,
    ) -> None:
        """Create traceable hypotheses once; never present feedback inference as fact."""
        practice = repository.get_practice(schedule_id, issue_id)
        practiced_method = (
            repository.get_entry(issue_id, practice.method_entry_id)
            if practice and practice.method_entry_id is not None
            else None
        )
        bases = {
            "worldview_update": repository.latest_confirmed_entry(issue_id, "understanding"),
            "method_update": practiced_method,
        }
        labels = {
            "worldview_update": ("认识", "原认识可能需要补充或修正"),
            "method_update": ("方法", "原方法可能需要调整后再验证"),
        }
        feedback_excerpt = feedback.content.strip()[:500]
        for kind, base in bases.items():
            if repository.generated_feedback_candidate(issue_id, feedback.id, kind):
                continue
            label, inference = labels[kind]
            if base:
                base_text = f"最近已确认{label}「{base.content.strip()[:500]}」"
            else:
                base_text = f"当前尚无已确认{label}"
            content = (
                f"待检验候选：基于{base_text}与本次实践反馈"
                f"「{feedback_excerpt}」，{inference}；这不是已确认事实，需继续验证。"
            )
            repository.add(RealityIssueEntryModel(
                reality_issue_id=issue_id,
                kind=kind,
                content=content,
                status="candidate",
                source_type="practice_feedback",
                source_id=feedback.id,
                practice_id=schedule_id,
                occurred_at=feedback.occurred_at,
            ))

    def promote_method_version(self, issue_id: int, entry_id: int) -> dict:
        import json
        db = self._open()
        try:
            repository = RealityIssueRepository(db)
            self._get_issue(repository, issue_id)
            update = self._get_entry(repository, issue_id, entry_id)
            if update.kind != "method_update" or update.status != "confirmed":
                raise RealityIssueConflict("confirmed_method_update_required")
            existing = repository.get_method_version(update.id)
            if existing:
                return _method_version_to_dict(existing)
            if update.practice_id is None or update.source_id is None:
                raise RealityIssueConflict("method_update_missing_evidence")
            practice = repository.get_practice(update.practice_id, issue_id)
            if not practice or practice.method_entry_id is None:
                raise RealityIssueConflict("method_update_missing_practiced_method")
            sources = repository.list_method_sources(practice.method_entry_id)
            if not sources:
                raise RealityIssueConflict("method_update_missing_knowledge_source")
            knowledge_ids = list(dict.fromkeys(source.knowledge_id for source in sources))
            version = PersonalMethodVersionModel(
                issue_id=issue_id,
                method_entry_id=practice.method_entry_id,
                update_entry_id=update.id,
                knowledge_ids=json.dumps(knowledge_ids, ensure_ascii=False),
                content=update.content,
                applicable_conditions="；".join(dict.fromkeys(
                    source.applicable_conditions for source in sources if source.applicable_conditions
                )),
                boundary="；".join(dict.fromkeys(
                    source.boundary for source in sources if source.boundary
                )),
                evidence_feedback_id=update.source_id,
                status="confirmed",
            )
            repository.add(version)
            repository.commit()
            repository.refresh(version)
            return _method_version_to_dict(version)
        finally:
            db.close()

    @staticmethod
    def _aggregate(repository: RealityIssueRepository, issue: RealityIssueModel) -> dict:
        result = _issue_to_dict(issue)
        for group in ENTRY_GROUPS.values():
            result[group] = []
        for entry in repository.list_entries(issue.id):
            result[ENTRY_GROUPS[entry.kind]].append(
                RealityIssueService._entry_result(repository, entry)
            )

        result["personal_method_versions"] = [
            _method_version_to_dict(item)
            for item in repository.list_method_versions(issue.id)
        ]

        result["practices"] = []
        for practice in repository.list_practices(issue.id):
            value = schedule_to_dict(practice)
            value["events"] = [
                {
                    "id": event.id,
                    "schedule_id": event.schedule_id,
                    "event_type": event.event_type,
                    "note": event.note,
                    "created_at": event.created_at,
                }
                for event in repository.list_events(practice.id)
            ]
            result["practices"].append(value)
        return result
