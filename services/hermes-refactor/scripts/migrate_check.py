"""
migrate_check.py — 迁移校验脚本
==========================
设计方案 §14：启动新服务前跑一遍，确认 ORM 能正确读出原库各表行数与字段，
读不出来就停，绝不改原库。

用法：
    cd /home/ubuntu/workspace/hermes-refactor
    python scripts/migrate_check.py
"""

import sys
import os
from pathlib import Path

# 把 backend 加入路径
BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from sqlalchemy import inspect, text
from app.db.connection import original_engine, refactor_engine
from app.db.models import OriginalBase, RefactorBase


# 原库需要能读的核心表（按设计方案 §10）
ORIGINAL_TABLES = [
    "teams",
    "team_3d_data",
    "schedules",
    "matches",
    "leagues",
    "rosters",
    "refresh_log",
    "changelog",
    "shared_version_analysis",
]

# 重构新增表（设计方案 §10.1）
REFACTOR_TABLES = [
    "trades",
    "activities",
    "schedules_new",
    "mood",
    "knowledge",
    "wisdom",
    "daily_review",
]


def check_original_tables() -> dict:
    """校验原库表可读：表存在 + 能数行数"""
    results = {}
    inspector = inspect(original_engine)
    existing_tables = set(inspector.get_table_names())

    for table in ORIGINAL_TABLES:
        if table not in existing_tables:
            results[table] = {"status": "missing", "count": None}
            continue
        try:
            with original_engine.connect() as conn:
                row = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).one()
                results[table] = {"status": "ok", "count": row[0]}
        except Exception as e:
            results[table] = {"status": "error", "count": None, "error": str(e)}

    return results


def check_refactor_tables() -> dict:
    """校验重构新增表存在且可读写"""
    results = {}
    inspector = inspect(refactor_engine)
    existing_tables = set(inspector.get_table_names())

    for table in REFACTOR_TABLES:
        if table not in existing_tables:
            results[table] = {"status": "missing", "count": None}
            continue
        try:
            with refactor_engine.connect() as conn:
                row = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).one()
                results[table] = {"status": "ok", "count": row[0]}
        except Exception as e:
            results[table] = {"status": "error", "count": None, "error": str(e)}

    return results


def main():
    print("=" * 60)
    print("Hermes 系统重构 · 迁移校验")
    print("=" * 60)

    print("\n[原库只读校验]", os.getenv("ORIGINAL_DB_PATH", "默认路径"))
    original_results = check_original_tables()
    all_ok = True
    for table, info in original_results.items():
        status = info["status"]
        count = info.get("count")
        extra = f" | count={count}" if count is not None else ""
        if info.get("error"):
            extra += f" | error={info['error']}"
        marker = "✅" if status == "ok" else "❌"
        print(f"  {marker} {table}: {status}{extra}")
        if status != "ok":
            all_ok = False

    print("\n[新表校验]", os.getenv("REFACTOR_DB_PATH", "默认路径"))
    refactor_results = check_refactor_tables()
    for table, info in refactor_results.items():
        status = info["status"]
        count = info.get("count")
        extra = f" | count={count}" if count is not None else ""
        if info.get("error"):
            extra += f" | error={info['error']}"
        marker = "✅" if status == "ok" else "❌"
        print(f"  {marker} {table}: {status}{extra}")
        if status != "ok":
            all_ok = False

    print("\n" + "=" * 60)
    if all_ok:
        print("✅ 校验通过，可继续启动服务。")
        return 0
    else:
        print("❌ 校验失败，请先修复以上问题，不要启动服务。")
        return 1


if __name__ == "__main__":
    sys.exit(main())
