"""
日报生成采集器
================

职责：
  - 从原库读取今日赛果、TS 排名、明日赛程
  - 组装 Markdown 日报
  - 保存到 lol_data/scripts/

迁移策略：
  P0（当前）：直接从原库读数据组装，替代空模板
  P2（后续）：与旧 cron 输出对比，确认一致后切 cron
"""

import sqlite3
from datetime import date, datetime, timedelta
from typing import Optional

ORIGINAL_DB = "/home/ubuntu/lol_data/英雄联盟数据库.db"
DAILY_REPORT_DIR = "/home/ubuntu/lol_data/scripts"


def _get_db():
    conn = sqlite3.connect(ORIGINAL_DB)
    conn.row_factory = sqlite3.Row
    return conn


def _today_results(db, target_date: str) -> list[dict]:
    """读取今日赛果（含比分/胜者/三维标签）"""
    rows = db.execute("""
        SELECT m.match_id, m.match_time,
               ta.short_name AS team_a, tb.short_name AS team_b,
               m.score_a, m.score_b, m.winner,
               COALESCE(t3a.dim_1_value, '') AS tag_a,
               COALESCE(t3b.dim_1_value, '') AS tag_b,
               m.league_id
        FROM matches m
        JOIN teams ta ON ta.team_id = m.team_a_id
        JOIN teams tb ON tb.team_id = m.team_b_id
        LEFT JOIN team_3d_data t3a ON t3a.team_name = ta.short_name
        LEFT JOIN team_3d_data t3b ON t3b.team_name = tb.short_name
        WHERE m.status = 'completed'
          AND m.match_time LIKE ?
          AND (m.league_id LIKE 'LPL%' OR m.league_id LIKE 'LCK%'
               OR m.league_id LIKE 'MSI%' OR m.league_id LIKE 'EWC%')
        ORDER BY m.match_time
    """, (f"{target_date}%",)).fetchall()

    results = []
    for r in rows:
        winner_name = ""
        if r["winner"]:
            if r["winner"] == r["team_a"] or r["winner"] == r["team_a"].upper():
                winner_name = r["team_a"]
            elif r["winner"] == r["team_b"] or r["winner"] == r["team_b"].upper():
                winner_name = r["team_b"]
        results.append({
            "time": r["match_time"][:16] if r["match_time"] else "",
            "team_a": r["team_a"], "team_b": r["team_b"],
            "score_a": r["score_a"], "score_b": r["score_b"],
            "winner": winner_name or "—",
            "tag_a": r["tag_a"], "tag_b": r["tag_b"],
            "league": r["league_id"],
        })
    return results


def _ts_rankings(db) -> list[dict]:
    """读取当前 TS 排名"""
    rows = db.execute("""
        SELECT short_name, region, mu, sigma,
               (mu - 3 * sigma) AS ts_score
        FROM teams
        WHERE short_name IS NOT NULL
        ORDER BY ts_score DESC
    """).fetchall()
    return [
        {"team": r["short_name"], "region": r["region"] or "—",
         "mu": round(r["mu"], 1) if r["mu"] else 0,
         "sigma": round(r["sigma"], 1) if r["sigma"] else 0,
         "ts": round(r["ts_score"], 1) if r["ts_score"] else 0}
        for r in rows
    ]


def _tomorrow_schedule(db, target_date: str) -> list[dict]:
    """读取明日赛程"""
    tomorrow = (datetime.strptime(target_date, "%Y-%m-%d") + timedelta(days=1)).strftime("%Y-%m-%d")
    rows = db.execute("""
        SELECT s.id, s.date, s.time_bjt,
               s.team_a, s.team_b, s.region
        FROM schedules s
        WHERE s.date = ?
        ORDER BY s.time_bjt
    """, (tomorrow,)).fetchall()

    return [
        {"time": f"{r['date']} {r['time_bjt']}" if r['time_bjt'] else r['date'],
         "team_a": r["team_a"], "team_b": r["team_b"],
         "league": r["region"] or ""}
        for r in rows
    ]


def generate_report(target_date: Optional[str] = None, verbose: bool = True) -> str:
    """
    生成 LOL 日报。

    Args:
        target_date: 日期 YYYY-MM-DD，默认昨天（日报回顾昨天）
        verbose: 是否打印日志

    Returns:
        Markdown 日报内容
    """
    if target_date is None:
        target_date = (date.today() - timedelta(days=1)).isoformat()

    if verbose:
        print(f"[daily_report] 生成日报: {target_date}")

    db = _get_db()
    try:
        results = _today_results(db, target_date)
        rankings = _ts_rankings(db)
        schedule = _tomorrow_schedule(db, target_date)
    finally:
        db.close()

    lines = [
        f"# LOL 电竞日报 · {target_date}",
        "",
        "> 数据来源: ScoreGG / 英雄联盟数据库",
        "",
    ]

    # ── 📊 赛果 ──
    if results:
        lines.append("## 📊 赛果")
        lines.append("")
        lines.append("| 时间 | 队伍 A | 比分 | 队伍 B | 胜者 | 赛区 |")
        lines.append("|------|--------|------|--------|------|------|")
        for r in results:
            winner_mark = f"**{r['winner']}**"
            score = f"{r['score_a'] or '?'}-{r['score_b'] or '?'}"
            tag = ""
            if r["tag_a"] or r["tag_b"]:
                tag_a = f"[{r['tag_a']}]" if r["tag_a"] else ""
                tag_b = f"[{r['tag_b']}]" if r["tag_b"] else ""
                tag = f" {tag_a} {tag_b}"
            lines.append(
                f"| {r['time']} | {r['team_a']} | {score} | {r['team_b']} | {winner_mark} | {r['league']} |"
            )
        lines.append("")
    else:
        lines.append("## 📊 赛果")
        lines.append("")
        lines.append(f"_今日（{target_date}）无 LPL/LCK 完赛记录_")
        lines.append("")

    # ── 📈 TS 排名 ──
    if rankings:
        lines.append("## 📈 TS 排名")
        lines.append("")
        lines.append("| # | 队伍 | 赛区 | 能力分 | σ | TS 评分 |")
        lines.append("|---|------|------|--------|---|---------|")
        for i, r in enumerate(rankings[:10], 1):
            lines.append(
                f"| {i} | {r['team']} | {r['region']} | {r['mu']} | {r['sigma']} | {r['ts']} |"
            )
        lines.append("")

    # ── 🔮 明日赛程 ──
    if schedule:
        lines.append("## 🔮 明日赛程")
        lines.append("")
        lines.append("| 时间 | 队伍 A | 队伍 B | 赛区 |")
        lines.append("|------|--------|--------|------|")
        for s in schedule:
            lines.append(
                f"| {s['time']} | {s['team_a']} | {s['team_b']} | {s['league']} |"
            )
        lines.append("")
    else:
        lines.append("## 🔮 明日赛程")
        lines.append("")
        lines.append(f"_暂无明日赛程数据_")
        lines.append("")

    lines.extend([
        "---",
        f"*生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M')}*",
    ])

    report = "\n".join(lines)

    # 保存文件
    output_path = f"{DAILY_REPORT_DIR}/LOL电竞日报_{target_date}.md"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(report)

    if verbose:
        print(f"[daily_report] ✅ 日报保存到: {output_path}")
        print(f"[daily_report] 赛果 {len(results)} 场 / 排名 {len(rankings)} 队 / 明日赛程 {len(schedule)} 场")

    return report


def run(verbose: bool = True) -> str:
    """运行日报生成（每日入口）"""
    return generate_report(verbose=verbose)


if __name__ == "__main__":
    report = run()
    print(report[:300])
