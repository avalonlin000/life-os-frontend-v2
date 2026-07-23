"""Small, explicit maintenance CLI for the Jieyi reality-issue backend."""

from __future__ import annotations

import argparse
import json
import sqlite3
from contextlib import closing
from pathlib import Path
from typing import Optional, Sequence
from urllib.parse import quote

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config import get_settings
from app.services.jieyi.reality_issue_schema import RealityIssueSchemaCompatibility


def _path(value) -> Path:
    return Path(value).expanduser().resolve()


def _readonly_connection(database: Path) -> sqlite3.Connection:
    uri = f"file:{quote(str(database))}?mode=ro"
    return sqlite3.connect(uri, uri=True)


def _schema_report(connection: sqlite3.Connection) -> dict:
    tables = {
        row[0]
        for row in connection.execute("SELECT name FROM sqlite_master WHERE type = 'table'")
    }
    indexes = {
        row[0]
        for row in connection.execute("SELECT name FROM sqlite_master WHERE type = 'index'")
    }
    schedule_columns = (
        {row[1] for row in connection.execute("PRAGMA table_info(schedules_new)")}
        if "schedules_new" in tables
        else set()
    )
    missing_tables = sorted(set(RealityIssueSchemaCompatibility.REQUIRED_TABLES) - tables)
    missing_schedule_columns = sorted(
        set(RealityIssueSchemaCompatibility.REQUIRED_SCHEDULE_COLUMNS) - schedule_columns
    )
    missing_indexes = sorted(set(RealityIssueSchemaCompatibility.REQUIRED_INDEXES) - indexes)
    return {
        "schema_ready": not missing_tables and not missing_schedule_columns and not missing_indexes,
        "missing_tables": missing_tables,
        "missing_schedule_columns": missing_schedule_columns,
        "missing_indexes": missing_indexes,
    }


def schema_database(database) -> dict:
    database = _path(database)
    if not database.exists():
        return {
            "ok": False,
            "database": "missing",
            "schema_ready": False,
            "missing_tables": list(RealityIssueSchemaCompatibility.REQUIRED_TABLES),
            "missing_schedule_columns": list(RealityIssueSchemaCompatibility.REQUIRED_SCHEDULE_COLUMNS),
            "missing_indexes": list(RealityIssueSchemaCompatibility.REQUIRED_INDEXES),
        }
    with closing(_readonly_connection(database)) as connection:
        report = _schema_report(connection)
    return {"ok": True, "database": "reachable", **report}


def health_database(database) -> dict:
    report = schema_database(database)
    return {
        "ok": report["database"] == "reachable" and report["schema_ready"],
        "database": report["database"],
        "schema_ready": report["schema_ready"],
        "missing_tables": report["missing_tables"],
        "missing_schedule_columns": report["missing_schedule_columns"],
        "missing_indexes": report["missing_indexes"],
    }


def smoke_database(database) -> dict:
    health = health_database(database)
    if not health["ok"]:
        return health
    database = _path(database)
    with closing(_readonly_connection(database)) as connection:
        counts = {
            "reality_issues": connection.execute("SELECT COUNT(*) FROM reality_issues").fetchone()[0],
            "reality_issue_entries": connection.execute(
                "SELECT COUNT(*) FROM reality_issue_entries"
            ).fetchone()[0],
            "linked_practices": connection.execute(
                "SELECT COUNT(*) FROM schedules_new WHERE reality_issue_id IS NOT NULL"
            ).fetchone()[0],
        }
        focus_count = connection.execute(
            "SELECT COUNT(*) FROM reality_issues WHERE is_focus = 1"
        ).fetchone()[0]
    return {
        "ok": focus_count <= 1,
        "database": "reachable",
        "schema_ready": True,
        "counts": counts,
        "invariants": {"focus_count": focus_count, "single_focus": focus_count <= 1},
    }


def backup_database(database, output) -> dict:
    database = _path(database)
    output = _path(output)
    if not database.exists():
        raise FileNotFoundError(database)
    if output.exists():
        raise FileExistsError(output)
    if not output.parent.exists():
        raise FileNotFoundError(output.parent)
    try:
        with closing(_readonly_connection(database)) as source, closing(sqlite3.connect(output)) as target:
            source.backup(target)
    except Exception:
        output.unlink(missing_ok=True)
        raise
    return {"ok": True, "database": "reachable", "backup_path": str(output)}


def migrate_database(database, backup) -> dict:
    database = _path(database)
    backup = _path(backup)
    backup_database(database, backup)
    engine = create_engine(
        f"sqlite:///{database}",
        connect_args={"check_same_thread": False},
    )
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    db = session_factory()
    try:
        RealityIssueSchemaCompatibility.ensure(db)
    finally:
        db.close()
        engine.dispose()
    result = health_database(database)
    return {**result, "backup_path": str(backup)}


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Jieyi backend maintenance")
    parser.add_argument("--db", default=get_settings().REFACTOR_DB_PATH, help="SQLite database path")
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("health", help="read-only connectivity and readiness check")
    commands.add_parser("schema", help="read-only schema compatibility report")
    commands.add_parser("smoke", help="read-only counts and invariant check")
    backup = commands.add_parser("backup", help="explicit consistent SQLite backup")
    backup.add_argument("--output", required=True)
    migrate = commands.add_parser("migrate", help="explicit backup then additive schema upgrade")
    migrate.add_argument("--backup", required=True)
    return parser


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = _parser().parse_args(argv)
    try:
        if args.command == "health":
            result = health_database(args.db)
        elif args.command == "schema":
            result = schema_database(args.db)
        elif args.command == "smoke":
            result = smoke_database(args.db)
        elif args.command == "backup":
            result = backup_database(args.db, args.output)
        else:
            result = migrate_database(args.db, args.backup)
    except Exception as error:
        result = {"ok": False, "error": type(error).__name__, "detail": str(error)}
        print(json.dumps(result, ensure_ascii=False, sort_keys=True))
        return 2
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))
    return 0 if result.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
