"""
ScoreGG 比赛导入采集器（迁移自 scripts/scoregg_refresh.py）
==========================================================

职责：
  - 从 ScoreGG API 拉取每日比赛数据
  - 写入原库 schedules + matches 表
  - 支持单日刷新和全量扫描

用法:
    python -c "from app.collectors.scoregg import run; run()"
"""

import sys
import os
import sqlite3
from datetime import datetime, timedelta
from typing import Optional

import requests

ORIGINAL_DB = "/home/ubuntu/lol_data/英雄联盟数据库.db"
SCOREGG_API = "https://www.scoregg.com/services/api_url.php"

TEAM_NAME_OVERRIDE = {"DRX": "KRX"}

LPL_LCK_TEAMS = {
    "AL", "BLG", "EDG", "FPX", "IG", "JDG", "LGD", "LNG", "NIP", "OMG",
    "RA", "RNG", "TES", "TT", "UP", "WBG", "WE", "BFX",
    "BRO", "DK", "DNS", "DRX", "GEN", "HLE", "KDF", "KTC", "KT", "NS", "SB", "T1",
}

TOURNAMENT_MAP = {
    "2026 LCK通往MSI之路": ("LCK", "BO3", "2026夏季赛"),
    "2026 LPL第二赛段": ("LPL", "BO3", "2026第二赛段"),
    "2026 EWC中国区预选赛": ("EWC电竞世界杯", "BO3", "EWC中国区预选赛"),
    "2026 EWC LCK预选赛": ("EWC电竞世界杯", "BO3", "EWC LCK预选赛"),
    "2026 LCP第二赛段": ("LCP", "BO3", "2026第二赛段"),
}

LCK_TOURNAMENT_KEYWORDS = ["LCK"]


# ═══════════════════════════════════════════════════════
# API 请求
# ═══════════════════════════════════════════════════════

def fetch_by_date(date_str: str) -> dict:
    """获取指定日期的比赛列表"""
    resp = requests.post(SCOREGG_API, data={
        "api_path": "services/match/web_math_list.php",
        "method": "GET",
        "gameID": "1",
        "date": date_str,
    }, timeout=30)
    data = resp.json()
    if data.get("code") != "200":
        return {}
    return data.get("data", {}).get("list", {})


def parse_tournament(match_data: dict) -> tuple:
    """解析赛事信息 → (region, format, stage)"""
    tour_name = match_data.get("tournamentName", "")
    match_name = match_data.get("name", "")
    if tour_name in TOURNAMENT_MAP:
        return TOURNAMENT_MAP[tour_name]
    for keyword in TOURNAMENT_MAP:
        if keyword in match_name:
            return TOURNAMENT_MAP[keyword]
    return ("其他", "BO3", "")


def kst_to_bjt(kst_str: str) -> str:
    """KST → BJT"""
    try:
        kst = datetime.fromisoformat(kst_str)
        bjt = kst - timedelta(hours=1)
        return bjt.strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        return kst_str


# ═══════════════════════════════════════════════════════
# 数据标准化
# ═══════════════════════════════════════════════════════

def normalize_match(match: dict, tournament_name: str = "") -> Optional[dict]:
    """标准化单条比赛"""
    team_a = match.get("team_a_short_name", "")
    team_b = match.get("team_b_short_name", "")
    team_a = TEAM_NAME_OVERRIDE.get(team_a, team_a)
    team_b = TEAM_NAME_OVERRIDE.get(team_b, team_b)

    if not team_a or not team_b:
        return None
    if team_a not in LPL_LCK_TEAMS and team_b not in LPL_LCK_TEAMS:
        return None

    start_date = match.get("start_date", "")
    start_time = match.get("start_time", "")
    status_code = str(match.get("status", ""))
    score_a = match.get("team_a_win", "0")
    score_b = match.get("team_b_win", "0")
    match_id = match.get("match_id", "")

    winner = ""
    if status_code == "2":
        try:
            if int(score_a) > int(score_b):
                winner = team_a
            elif int(score_b) > int(score_a):
                winner = team_b
        except (ValueError, TypeError):
            pass

    region, fmt, stage = parse_tournament({
        "tournamentName": tournament_name,
        "name": match.get("name", ""),
    })

    full_time = f"{start_date} {start_time}:00" if start_time else ""

    return {
        "match_id": str(match_id),
        "date": start_date,
        "time_bjt": full_time,
        "team_a": team_a,
        "team_b": team_b,
        "region": region,
        "league": tournament_name,
        "format": fmt,
        "stage": stage,
        "status": "completed" if status_code == "2" else ("live" if status_code == "1" else "scheduled"),
        "score_a": score_a,
        "score_b": score_b,
        "winner": winner,
    }


# ═══════════════════════════════════════════════════════
# 数据库写入
# ═══════════════════════════════════════════════════════

def write_to_db(matches: list[dict], db_path: str = ORIGINAL_DB) -> tuple[int, int]:
    """写入 schedules + matches 表 → (schedule_total, match_total)"""
    db = sqlite3.connect(db_path)
    c = db.cursor()
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    sched_ins = sched_upd = 0
    match_ins = match_upd = 0

    for m in matches:
        # schedules 表
        try:
            c.execute("""
                INSERT INTO schedules (date, time_bjt, team_a, team_b, region, format, stage, source, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'scoregg', ?)
            """, (m["date"], m["time_bjt"], m["team_a"], m["team_b"],
                  m["region"], m["format"], m["stage"], now))
            sched_ins += 1
        except sqlite3.IntegrityError:
            c.execute("""
                UPDATE schedules SET time_bjt=?, region=?, format=?, stage=?, source='scoregg', updated_at=?
                WHERE date=? AND team_a=? AND team_b=?
            """, (m["time_bjt"], m["region"], m["format"], m["stage"], now,
                  m["date"], m["team_a"], m["team_b"]))
            sched_upd += 1

        # matches 表（仅已完赛）
        if m["status"] == "completed" and m["winner"]:
            mid = f"scoregg_{m['match_id']}"
            try:
                c.execute("""
                    INSERT INTO matches (match_id, team_a_id, team_b_id, match_time,
                                         score_a, score_b, winner, status, game_format, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?)
                """, (mid, m["team_a"], m["team_b"], m["time_bjt"],
                      m["score_a"], m["score_b"], m["winner"], m["format"], now))
                match_ins += 1
            except sqlite3.IntegrityError:
                c.execute("""
                    UPDATE matches SET score_a=?, score_b=?, winner=?, status='completed',
                                       game_format=?, updated_at=?
                    WHERE match_id=?
                """, (m["score_a"], m["score_b"], m["winner"], m["format"], now, mid))
                match_upd += 1

    # DRX → KRX 残留修复
    for t, cols in [("schedules", "team_a,team_b"), ("matches", "team_a_id,team_b_id,winner")]:
        for col in cols.split(","):
            c.execute(f"UPDATE [{t}] SET {col}='KRX' WHERE {col}='DRX'")

    db.commit()
    db.close()
    return sched_ins + sched_upd, match_ins + match_upd


# ═══════════════════════════════════════════════════════
# 入口
# ═══════════════════════════════════════════════════════

def run(date: Optional[str] = None, verbose: bool = True) -> int:
    """
    运行 ScoreGG 采集。

    Args:
        date: 日期 YYYY-MM-DD，默认今天
        verbose: 是否打印日志

    Returns:
        采集到的比赛数
    """
    target_date = date or datetime.now().strftime("%Y-%m-%d")

    if verbose:
        print(f"[scoregg] 采集日期: {target_date}")

    match_list = fetch_by_date(target_date)
    if not match_list:
        if verbose:
            print(f"[scoregg] 无数据: {target_date}")
        return 0

    # 解析
    normalized = []
    seen = set()
    for date_key, date_block in match_list.items():
        info = date_block.get("info", {}) if isinstance(date_block, dict) else {}
        for _tid, tdata in info.items():
            tn = tdata.get("tournamentinfo", {}).get("name", "") if isinstance(tdata, dict) else ""
            for match in tdata.get("list", []) if isinstance(tdata, dict) else []:
                norm = normalize_match(match, tn)
                if norm and norm["match_id"] not in seen:
                    seen.add(norm["match_id"])
                    normalized.append(norm)

    if not normalized:
        if verbose:
            print(f"[scoregg] 无有效比赛")
        return 0

    # 写入
    sched_total, match_total = write_to_db(normalized)

    if verbose:
        print(f"[scoregg] ✅ schedules {sched_total} / matches {match_total} / 跳过 {len(match_list) - len(normalized)}")

    return len(normalized)


if __name__ == "__main__":
    import sys
    date_arg = sys.argv[1] if len(sys.argv) > 1 else None
    run(date=date_arg)
