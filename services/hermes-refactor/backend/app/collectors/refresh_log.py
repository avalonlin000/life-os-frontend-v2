"""
刷新日志采集器（迁移 — 原库 refresh_log 表）
===========================================
现状：原库已有 refresh_log 表记录采集操作
迁移方式：保持写入 refresh_log 表（走 changelog 审计）

用法:
    python -c "from app.collectors.refresh_log import run; run()"
"""

import os
import sqlite3
from datetime import datetime
from typing import Optional


# 原库路径
ORIGINAL_DB = "/home/ubuntu/lol_data/英雄联盟数据库.db"


def log(refresh_type: str, records_affected: int = 0, status: str = "success",
        error_message: Optional[str] = None, source: Optional[str] = None):
    """
    记录刷新日志到原库 refresh_log 表
    
    Args:
        refresh_type: 刷新类型 (scoregg / ts_update / tk_graph / daily_report / ...)
        records_affected: 影响记录数
        status: success / error
        error_message: 错误信息
        source: 数据来源
    """
    conn = sqlite3.connect(ORIGINAL_DB)
    try:
        conn.execute(
            """INSERT INTO refresh_log (refresh_type, source, records_affected, status, error_message)
               VALUES (?, ?, ?, ?, ?)""",
            (refresh_type, source or "collector", records_affected, status, error_message),
        )
        conn.commit()
    finally:
        conn.close()


def run(refresh_type: str = "manual", records_affected: int = 0,
        status: str = "success", error_message: Optional[str] = None,
        source: Optional[str] = None, verbose: bool = True):
    """
    运行刷新日志采集
    
    统一入口，供其他 collector 调用记录执行结果
    """
    log(refresh_type, records_affected, status, error_message, source)
    if verbose:
        status_icon = "✅" if status == "success" else "❌"
        print(f"[refresh_log] {status_icon} {refresh_type}: {records_affected} records, status={status}")


if __name__ == "__main__":
    run(refresh_type="test", records_affected=0)
