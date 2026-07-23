from __future__ import annotations

import json
import sqlite3

from jieyi_maintenance import (
    backup_database,
    health_database,
    main,
    migrate_database,
    schema_database,
    smoke_database,
)


def _create_legacy_database(path) -> None:
    with sqlite3.connect(path) as connection:
        connection.execute("""
            CREATE TABLE schedules_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date VARCHAR NOT NULL,
                content VARCHAR NOT NULL,
                source VARCHAR NOT NULL,
                priority INTEGER,
                category VARCHAR,
                is_done BOOLEAN,
                knowledge_id INTEGER,
                stage_goal_id INTEGER,
                practice_status VARCHAR NOT NULL DEFAULT 'active',
                created_at VARCHAR,
                updated_at VARCHAR
            )
        """)
        connection.execute("""
            INSERT INTO schedules_new
                (date, content, source, is_done, practice_status, created_at, updated_at)
            VALUES
                ('2099-07-20', 'maintenance-test-legacy', 'user_add', 0, 'active', '2099-07-20', '2099-07-20')
        """)


def test_health_and_schema_are_read_only_for_legacy_database(tmp_path):
    database = tmp_path / "legacy.db"
    _create_legacy_database(database)

    before_size = database.stat().st_size
    health = health_database(database)
    schema = schema_database(database)

    assert health["ok"] is False
    assert health["database"] == "reachable"
    assert health["schema_ready"] is False
    assert schema["missing_tables"] == [
        "knowledge", "knowledge_profiles", "personal_method_versions", "practice_events",
        "reality_issue_entries", "reality_issues", "reality_method_sources",
    ]
    assert schema["missing_schedule_columns"] == ["method_entry_id", "reality_issue_id"]
    assert schema["missing_indexes"] == [
        "ix_schedules_new_method_entry_id",
        "ix_schedules_new_reality_issue_id",
        "ux_reality_issues_single_focus",
    ]
    assert database.stat().st_size == before_size
    with sqlite3.connect(database) as connection:
        columns = {row[1] for row in connection.execute("PRAGMA table_info(schedules_new)")}
    assert "reality_issue_id" not in columns
    assert "method_entry_id" not in columns


def test_read_only_commands_do_not_create_a_missing_database(tmp_path):
    database = tmp_path / "missing.db"

    health = health_database(database)
    schema = schema_database(database)
    smoke = smoke_database(database)

    assert health["database"] == "missing"
    assert schema["database"] == "missing"
    assert smoke["database"] == "missing"
    assert not database.exists()


def test_explicit_backup_and_migrate_preserve_legacy_data(tmp_path):
    database = tmp_path / "legacy.db"
    backup = tmp_path / "before-migrate.db"
    _create_legacy_database(database)

    result = migrate_database(database, backup)

    assert result["ok"] is True
    assert result["backup_path"] == str(backup)
    assert backup.exists()
    assert health_database(database)["schema_ready"] is True
    with sqlite3.connect(database) as connection:
        row = connection.execute(
            "SELECT content, reality_issue_id, method_entry_id FROM schedules_new WHERE content = ?",
            ("maintenance-test-legacy",),
        ).fetchone()
    assert row == ("maintenance-test-legacy", None, None)
    with sqlite3.connect(f"file:{backup}?mode=ro", uri=True) as connection:
        backup_columns = {row[1] for row in connection.execute("PRAGMA table_info(schedules_new)")}
    assert "reality_issue_id" not in backup_columns
    assert "method_entry_id" not in backup_columns


def test_smoke_reports_only_counts_and_invariants(tmp_path):
    database = tmp_path / "ready.db"
    backup = tmp_path / "ready-before.db"
    _create_legacy_database(database)
    migrate_database(database, backup)

    result = smoke_database(database)

    assert result == {
        "ok": True,
        "database": "reachable",
        "schema_ready": True,
        "counts": {"reality_issues": 0, "reality_issue_entries": 0, "linked_practices": 0},
        "invariants": {"focus_count": 0, "single_focus": True},
    }
    assert "maintenance-test-legacy" not in json.dumps(result, ensure_ascii=False)


def test_backup_refuses_to_overwrite_existing_file(tmp_path):
    database = tmp_path / "source.db"
    backup = tmp_path / "backup.db"
    _create_legacy_database(database)
    backup_database(database, backup)

    try:
        backup_database(database, backup)
    except FileExistsError:
        pass
    else:
        raise AssertionError("backup must not overwrite an existing file")


def test_cli_health_returns_nonzero_and_json_when_schema_is_not_ready(tmp_path, capsys):
    database = tmp_path / "legacy.db"
    _create_legacy_database(database)

    exit_code = main(["--db", str(database), "health"])
    output = json.loads(capsys.readouterr().out)

    assert exit_code == 1
    assert output["schema_ready"] is False
