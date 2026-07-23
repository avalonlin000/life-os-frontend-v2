"""Additive SQLite compatibility for the Jieyi reality-issue product slice."""

from __future__ import annotations

from sqlalchemy import inspect, text

from app.db.models import (
    KnowledgeModel,
    KnowledgeProfileModel,
    PersonalMethodVersionModel,
    PracticeEventModel,
    RealityIssueEntryModel,
    RealityIssueModel,
    RealityMethodSourceModel,
    ScheduleNewModel,
)


class RealityIssueSchemaCompatibility:
    """Owns schema inspection and idempotent additive upgrades only."""

    REQUIRED_TABLES = (
        "knowledge", "knowledge_profiles", "personal_method_versions", "practice_events",
        "reality_issue_entries", "reality_issues", "reality_method_sources", "schedules_new"
    )
    REQUIRED_SCHEDULE_COLUMNS = ("method_entry_id", "reality_issue_id")
    REQUIRED_INDEXES = (
        "ix_schedules_new_method_entry_id",
        "ix_schedules_new_reality_issue_id",
        "ux_reality_issues_single_focus",
    )

    @classmethod
    def ensure(cls, db) -> None:
        bind = db.get_bind()
        RealityIssueModel.__table__.create(bind=bind, checkfirst=True)
        RealityIssueEntryModel.__table__.create(bind=bind, checkfirst=True)
        KnowledgeModel.__table__.create(bind=bind, checkfirst=True)
        KnowledgeProfileModel.__table__.create(bind=bind, checkfirst=True)
        RealityMethodSourceModel.__table__.create(bind=bind, checkfirst=True)
        PersonalMethodVersionModel.__table__.create(bind=bind, checkfirst=True)
        PracticeEventModel.__table__.create(bind=bind, checkfirst=True)
        with bind.begin() as connection:
            connection.execute(text(
                "CREATE UNIQUE INDEX IF NOT EXISTS ux_reality_issues_single_focus "
                "ON reality_issues(is_focus) WHERE is_focus = 1"
            ))

        inspector = inspect(bind)
        if "schedules_new" not in inspector.get_table_names():
            ScheduleNewModel.__table__.create(bind=bind, checkfirst=True)
            return

        columns = {column["name"] for column in inspector.get_columns("schedules_new")}
        if "reality_issue_id" not in columns:
            with bind.begin() as connection:
                connection.execute(text("ALTER TABLE schedules_new ADD COLUMN reality_issue_id INTEGER"))
        if "method_entry_id" not in columns:
            with bind.begin() as connection:
                connection.execute(text("ALTER TABLE schedules_new ADD COLUMN method_entry_id INTEGER"))
        with bind.begin() as connection:
            connection.execute(text(
                "CREATE INDEX IF NOT EXISTS ix_schedules_new_reality_issue_id "
                "ON schedules_new(reality_issue_id)"
            ))
            connection.execute(text(
                "CREATE INDEX IF NOT EXISTS ix_schedules_new_method_entry_id "
                "ON schedules_new(method_entry_id)"
            ))

    @classmethod
    def report(cls, bind) -> dict:
        inspector = inspect(bind)
        tables = set(inspector.get_table_names())
        indexes = {
            index["name"]
            for table in tables
            for index in inspector.get_indexes(table)
            if index.get("name")
        }
        schedule_columns = (
            {column["name"] for column in inspector.get_columns("schedules_new")}
            if "schedules_new" in tables
            else set()
        )
        missing_tables = sorted(set(cls.REQUIRED_TABLES) - tables)
        missing_schedule_columns = sorted(set(cls.REQUIRED_SCHEDULE_COLUMNS) - schedule_columns)
        missing_indexes = sorted(set(cls.REQUIRED_INDEXES) - indexes)
        return {
            "schema_ready": not missing_tables and not missing_schedule_columns and not missing_indexes,
            "missing_tables": missing_tables,
            "missing_schedule_columns": missing_schedule_columns,
            "missing_indexes": missing_indexes,
        }
