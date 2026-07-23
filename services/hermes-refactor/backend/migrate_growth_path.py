"""Idempotent migration for Jieyi growth domain → stage goal → practice path."""

from __future__ import annotations

import sqlite3

from app.config import get_settings


CREATE_STATEMENTS = (
    """
    CREATE TABLE IF NOT EXISTS growth_domains (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        status VARCHAR NOT NULL DEFAULT 'active',
        created_at VARCHAR DEFAULT (datetime('now', 'localtime')),
        updated_at VARCHAR DEFAULT (datetime('now', 'localtime'))
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS stage_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        domain_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        status VARCHAR NOT NULL DEFAULT 'active',
        created_at VARCHAR DEFAULT (datetime('now', 'localtime')),
        updated_at VARCHAR DEFAULT (datetime('now', 'localtime'))
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS practice_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        schedule_id INTEGER NOT NULL,
        event_type VARCHAR NOT NULL,
        note TEXT,
        created_at VARCHAR DEFAULT (datetime('now', 'localtime'))
    )
    """,
    "CREATE INDEX IF NOT EXISTS ix_stage_goals_domain_id ON stage_goals(domain_id)",
    "CREATE INDEX IF NOT EXISTS ix_practice_events_schedule_id ON practice_events(schedule_id)",
)


def _columns(connection: sqlite3.Connection, table: str) -> set[str]:
    return {str(row[1]) for row in connection.execute(f"PRAGMA table_info({table})")}


def migrate() -> None:
    path = get_settings().REFACTOR_DB_PATH
    connection = sqlite3.connect(path)
    try:
        with connection:
            for statement in CREATE_STATEMENTS:
                connection.execute(statement)

            schedule_columns = _columns(connection, "schedules_new")
            if "stage_goal_id" not in schedule_columns:
                connection.execute("ALTER TABLE schedules_new ADD COLUMN stage_goal_id INTEGER")
            if "practice_status" not in schedule_columns:
                connection.execute("ALTER TABLE schedules_new ADD COLUMN practice_status VARCHAR DEFAULT 'active'")
            connection.execute("CREATE INDEX IF NOT EXISTS ix_schedules_new_stage_goal_id ON schedules_new(stage_goal_id)")
            connection.execute(
                """
                UPDATE schedules_new
                SET practice_status = CASE WHEN is_done = 1 THEN 'completed' ELSE 'active' END
                WHERE practice_status IS NULL OR practice_status = ''
                """
            )
    finally:
        connection.close()

    print(f"Jieyi growth path schema ready: {path}")


if __name__ == "__main__":
    migrate()
