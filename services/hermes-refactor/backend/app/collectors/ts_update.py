"""
TS 评分更新采集器（迁移自 scripts/_ts_update.py）
====================================================

迁移策略（P0→P2）：
  P0（当前）：调用旧脚本 /home/ubuntu/lol_data/scripts/_ts_update.py
             记录 refresh_log，保持新旧并存
  P2（后续）：实现原生 TrueSkill 计算，输出对比一致后切 cron
"""

import subprocess
import sys
import os
from datetime import date, datetime
from typing import Optional


OLD_SCRIPT = "/home/ubuntu/lol_data/scripts/_ts_update.py"


def get_season_weight(match_time: str, league_first: date, league_last: date) -> float:
    """赛季阶段权重（保留骨架，P2 原生实现用）"""
    if not match_time or not league_first or not league_last:
        return 1.0
    try:
        match_dt = datetime.fromisoformat(match_time).date()
        total = (league_last - league_first).days
        if total < 7:
            return 1.0
        elapsed = (match_dt - league_first).days
        ratio = elapsed / total
        if ratio < 0.25:
            return 0.10 + 0.90 * (ratio / 0.25)
        elif ratio > 0.75:
            return 1.0 - 0.90 * ((ratio - 0.75) / 0.25)
        return 1.0
    except Exception:
        return 1.0


def _write_refresh_log(
    db_path: str,
    records_affected: int,
    status: str = "success",
    error_message: Optional[str] = None,
) -> None:
    """尽力写 refresh_log；表不存在时静默跳过。"""
    import sqlite3
    conn = sqlite3.connect(db_path)
    try:
        exists = conn.execute(
            "SELECT 1 FROM sqlite_master WHERE type='table' AND name='refresh_log'"
        ).fetchone()
        if not exists:
            return
        conn.execute(
            """INSERT INTO refresh_log
               (refresh_type, source, records_affected, status, error_message)
               VALUES (?, ?, ?, ?, ?)""",
            ("ts_update", "collector", records_affected, status, error_message),
        )
        conn.commit()
    finally:
        conn.close()


def run(verbose: bool = True) -> int:
    """
    运行 TS 评分更新（P0：调用旧脚本）。

    Returns:
        旧脚本 exit code（0=成功）
    """
    if not os.path.exists(OLD_SCRIPT):
        msg = f"旧脚本不存在: {OLD_SCRIPT}"
        if verbose:
            print(f"[ts_update] ❌ {msg}")
        return 1

    if verbose:
        print(f"[ts_update] 调用旧脚本: {OLD_SCRIPT}")

    try:
        result = subprocess.run(
            [sys.executable, OLD_SCRIPT],
            capture_output=True,
            text=True,
            timeout=300,
            cwd="/home/ubuntu/lol_data",
            env={**os.environ, "PYTHONPATH": "/home/ubuntu/lol_data/libs"},
        )
    except subprocess.TimeoutExpired:
        msg = "旧脚本执行超时（300s）"
        if verbose:
            print(f"[ts_update] ❌ {msg}")
        try:
            _write_refresh_log(
                os.path.expanduser("~/lol_data/英雄联盟数据库.db"),
                0, status="error", error_message=msg,
            )
        except Exception:
            pass
        return 1
    except Exception as e:
        msg = f"调用旧脚本失败: {e}"
        if verbose:
            print(f"[ts_update] ❌ {msg}")
        return 1

    if result.returncode != 0:
        msg = result.stderr[:500] if result.stderr else f"exit_code={result.returncode}"
        if verbose:
            print(f"[ts_update] ❌ 旧脚本失败: {msg}")
        try:
            _write_refresh_log(
                os.path.expanduser("~/lol_data/英雄联盟数据库.db"),
                0, status="error", error_message=msg,
            )
        except Exception:
            pass
        return result.returncode

    if verbose:
        # 打印旧脚本输出（最后 10 行摘要）
        lines = result.stdout.strip().split("\n")
        for line in lines[-10:]:
            print(f"  {line}")
        print(f"[ts_update] ✅ 旧脚本执行成功")

    # 写刷新日志
    try:
        _write_refresh_log(
            os.path.expanduser("~/lol_data/英雄联盟数据库.db"),
            1, status="success",
        )
    except Exception:
        pass

    return 0


if __name__ == "__main__":
    run()
