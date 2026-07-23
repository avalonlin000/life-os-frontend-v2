"""Persistence boundary for Jieyi reality issues."""

from __future__ import annotations

from typing import Optional

from app.db.models import (
    KnowledgeModel,
    PracticeEventModel,
    RealityIssueEntryModel,
    RealityIssueModel,
    RealityMethodSourceModel,
    PersonalMethodVersionModel,
    ScheduleNewModel,
)
from app.db.repositories.refactored import KnowledgeRepository


class RealityIssueRepository:
    def __init__(self, db):
        self.db = db

    def list_issues(self) -> list[RealityIssueModel]:
        return self.db.query(RealityIssueModel).order_by(RealityIssueModel.id.asc()).all()

    def get_issue(self, issue_id: int) -> Optional[RealityIssueModel]:
        return self.db.query(RealityIssueModel).filter(RealityIssueModel.id == issue_id).first()

    def get_focus(self) -> Optional[RealityIssueModel]:
        return self.db.query(RealityIssueModel).filter(RealityIssueModel.is_focus.is_(True)).first()

    def clear_focus(self) -> None:
        self.db.query(RealityIssueModel).filter(RealityIssueModel.is_focus.is_(True)).update(
            {RealityIssueModel.is_focus: False}, synchronize_session=False
        )

    def get_entry(self, issue_id: int, entry_id: int) -> Optional[RealityIssueEntryModel]:
        return self.db.query(RealityIssueEntryModel).filter(
            RealityIssueEntryModel.id == entry_id,
            RealityIssueEntryModel.reality_issue_id == issue_id,
        ).first()

    def list_entries(self, issue_id: int) -> list[RealityIssueEntryModel]:
        return self.db.query(RealityIssueEntryModel).filter(
            RealityIssueEntryModel.reality_issue_id == issue_id
        ).order_by(RealityIssueEntryModel.id.asc()).all()

    def latest_confirmed_entry(
        self, issue_id: int, kind: str
    ) -> Optional[RealityIssueEntryModel]:
        return self.db.query(RealityIssueEntryModel).filter(
            RealityIssueEntryModel.reality_issue_id == issue_id,
            RealityIssueEntryModel.kind == kind,
            RealityIssueEntryModel.status == "confirmed",
        ).order_by(RealityIssueEntryModel.id.desc()).first()

    def generated_feedback_candidate(
        self, issue_id: int, feedback_id: int, kind: str
    ) -> Optional[RealityIssueEntryModel]:
        return self.db.query(RealityIssueEntryModel).filter(
            RealityIssueEntryModel.reality_issue_id == issue_id,
            RealityIssueEntryModel.kind == kind,
            RealityIssueEntryModel.source_type == "practice_feedback",
            RealityIssueEntryModel.source_id == feedback_id,
        ).first()

    def get_knowledge(self, knowledge_id: int) -> Optional[KnowledgeModel]:
        return KnowledgeRepository.get_product_by_id(self.db, knowledge_id)

    def list_method_sources(self, method_entry_id: int) -> list[RealityMethodSourceModel]:
        return self.db.query(RealityMethodSourceModel).filter(
            RealityMethodSourceModel.method_entry_id == method_entry_id
        ).order_by(RealityMethodSourceModel.id.asc()).all()

    def get_method_version(self, update_entry_id: int) -> Optional[PersonalMethodVersionModel]:
        return self.db.query(PersonalMethodVersionModel).filter(
            PersonalMethodVersionModel.update_entry_id == update_entry_id
        ).first()

    def list_method_versions(self, issue_id: int) -> list[PersonalMethodVersionModel]:
        return self.db.query(PersonalMethodVersionModel).filter(
            PersonalMethodVersionModel.issue_id == issue_id
        ).order_by(PersonalMethodVersionModel.id.asc()).all()

    def get_practice(self, schedule_id: int, issue_id: Optional[int] = None) -> Optional[ScheduleNewModel]:
        query = self.db.query(ScheduleNewModel).filter(ScheduleNewModel.id == schedule_id)
        if issue_id is None:
            query = query.filter(ScheduleNewModel.reality_issue_id.is_not(None))
        else:
            query = query.filter(ScheduleNewModel.reality_issue_id == issue_id)
        return query.first()

    def list_practices(self, issue_id: int) -> list[ScheduleNewModel]:
        return self.db.query(ScheduleNewModel).filter(
            ScheduleNewModel.reality_issue_id == issue_id
        ).order_by(ScheduleNewModel.date.asc(), ScheduleNewModel.id.asc()).all()

    def list_events(self, schedule_id: int) -> list[PracticeEventModel]:
        return self.db.query(PracticeEventModel).filter(
            PracticeEventModel.schedule_id == schedule_id
        ).order_by(PracticeEventModel.id.asc()).all()

    def latest_event(self, schedule_id: int) -> Optional[PracticeEventModel]:
        return self.db.query(PracticeEventModel).filter(
            PracticeEventModel.schedule_id == schedule_id
        ).order_by(PracticeEventModel.id.desc()).first()

    def add(self, item) -> None:
        self.db.add(item)

    def flush(self) -> None:
        self.db.flush()

    def commit(self) -> None:
        self.db.commit()

    def refresh(self, item) -> None:
        self.db.refresh(item)
