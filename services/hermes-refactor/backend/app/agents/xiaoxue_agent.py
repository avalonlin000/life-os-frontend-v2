"""
小雪 Agent — LOL 数据管家 + 交易记录分析
==========================================
设计方案 §13.2：小雪是结衣的子系统，专精交易决策辅助，回答"怎么打"。

职责：
- LOL 数据管家（队伍/赛程/三维/TK）
- 交易记录 CRUD + 技术复盘分析
- 数据回流结衣做人生层面复盘

模型调用：通过 LLMClient，模型名/密钥/baseURL 全走 config 环境变量。
"""

import json
from typing import Optional
from datetime import datetime

from sqlalchemy.orm import Session

from app.agents.llm_client import LLMClient, load_prompt
from app.db.connection import OriginalSessionLocal, RefactorSessionLocal
from app.db.repositories.original import TeamRepository, Team3DRepository, MatchRepository, RosterRepository, SharedVersionAnalysisRepository
from app.db.repositories.refactored import TradeRepository
from app.db.models import TradeModel, Team3DData


class XiaoxueAgent:
    """
    小雪 Agent — LOL 数据管家 + 交易记录
    
    用法:
        agent = XiaoxueAgent()
        teams = agent.list_teams()
        analysis = agent.analyze_trades(game="lol")
    """

    def __init__(self):
        self.llm = LLMClient()

    # ── LOL 数据管家（只读） ──

    def list_teams(self) -> list[dict]:
        """获取队伍列表"""
        db = OriginalSessionLocal()
        try:
            teams = TeamRepository.list_all(db)
            return [
                {
                    "id": t.id,
                    "team_id": t.team_id,
                    "name": t.name,
                    "short_name": t.short_name,
                    "region": t.region,
                    "mu": t.mu,
                    "sigma": t.sigma,
                }
                for t in teams
            ]
        finally:
            db.close()

    def get_team_3d(self, team_name: str) -> Optional[dict]:
        """获取队伍三维数据"""
        db = OriginalSessionLocal()
        try:
            t3d = Team3DRepository.get_by_team(db, team_name)
            if not t3d:
                return None
            return {
                "id": t3d.id,
                "team_name": t3d.team_name,
                "region": t3d.region,
                "dim_1_name": t3d.dim_1_name,
                "dim_1_value": t3d.dim_1_value,
                "dim_2_name": t3d.dim_2_name,
                "dim_2_value": t3d.dim_2_value,
                "dim_3_name": t3d.dim_3_name,
                "dim_3_value": t3d.dim_3_value,
                "season": t3d.season,
                "notes": t3d.notes,
                "version_understanding": t3d.version_understanding,
            }
        finally:
            db.close()

    def update_team_3d(self, team_name: str, data: dict) -> Optional[dict]:
        """更新队伍三维标签（只更新已有记录）"""
        db = OriginalSessionLocal()
        try:
            t3d = Team3DRepository.get_by_team(db, team_name)
            if not t3d:
                return None
            for key, value in data.items():
                if hasattr(t3d, key) and value is not None:
                    setattr(t3d, key, value)
            db.commit()
            db.refresh(t3d)
            return self.get_team_3d(team_name)
        finally:
            db.close()

    def search_tk(self, keyword: str, limit: int = 20) -> list[dict]:
        """搜索 TK 知识库（shared_version_analysis）"""
        if not keyword or not keyword.strip():
            return []
        db = OriginalSessionLocal()
        try:
            rows = SharedVersionAnalysisRepository.search(db, keyword.strip(), limit=limit)
            return [
                {
                    "id": r.id,
                    "concept": (r.topic or "")[:80],
                    "content": (r.content or "")[:800],
                    "source_category": r.source_category or "",
                    "created_at": str(r.created_at) if r.created_at else "",
                    "content_type": r.content_type or "",
                }
                for r in rows
            ]
        finally:
            db.close()

    def list_analyst_reports(self) -> list[dict]:
        """列出所有可生成分析师报告的队伍（有三维数据）"""
        db = OriginalSessionLocal()
        try:
            t3d_rows = db.query(Team3DData).order_by(Team3DData.updated_at.desc()).all()
            seen = set()
            reports = []
            for t3d in t3d_rows:
                team = t3d.team_name
                if team in seen:
                    continue
                seen.add(team)
                team_info = TeamRepository.get_by_name(db, team) or TeamRepository.get_by_name(db, team.upper())
                reports.append({
                    "team": team,
                    "name": team_info.name if team_info else team,
                    "region": team_info.region if team_info else t3d.region,
                    "updated_at": str(t3d.updated_at) if t3d.updated_at else None,
                    "summary": f"{t3d.dim_1_name}: {t3d.dim_1_value} / {t3d.dim_2_name}: {t3d.dim_2_value} / {t3d.dim_3_name}: {t3d.dim_3_value}",
                })
            return reports
        finally:
            db.close()

    def get_analyst_report(self, team: str) -> dict:
        """获取队伍分析师报告（数据驱动 + LLM 增强）"""
        db = OriginalSessionLocal()
        try:
            team_upper = team.upper()
            t3d = Team3DRepository.get_by_team(db, team_upper)
            team_info = TeamRepository.get_by_name(db, team_upper)
            if not t3d:
                return {"found": False, "team": team_upper, "name": team_info.name if team_info else team_upper, "region": team_info.region if team_info else None, "sections": [], "generated_at": datetime.now().isoformat()}

            name = team_info.name if team_info else t3d.team_name
            region = team_info.region if team_info else t3d.region

            sections = [
                {"title": "三维评估", "items": [
                    f"{t3d.dim_1_name}: {t3d.dim_1_value}",
                    f"{t3d.dim_2_name}: {t3d.dim_2_value}",
                    f"{t3d.dim_3_name}: {t3d.dim_3_value}",
                ]},
                {"title": "版本理解", "text": t3d.version_understanding or "暂无"},
                {"title": "战术笔记", "text": t3d.notes or "暂无"},
            ]

            # 最近比赛
            matches = MatchRepository.list_recent_by_team(db, team_upper, limit=5)
            match_lines = []
            for m in matches:
                result = "胜" if m.winner == team_upper else ("负" if m.winner else "未知")
                match_lines.append(f"{m.match_time} vs {m.team_b_id if m.team_a_id == team_upper else m.team_a_id} {m.score_a}-{m.score_b} ({result})")
            sections.append({"title": "近5场", "items": match_lines or ["暂无赛事数据"]})

            # 首发阵容
            if team_info:
                roster = RosterRepository.list_active_starters(db, team_info.team_id)
                roster_lines = [f"{r.position or r.role}: {r.player_name}" for r in roster]
                sections.append({"title": "首发阵容", "items": roster_lines or ["暂无阵容数据"]})

            return {
                "found": True,
                "team": team_upper,
                "name": name,
                "region": region,
                "sections": sections,
                "generated_at": datetime.now().isoformat(),
            }
        finally:
            db.close()

    # ── 交易记录 CRUD ──

    def list_trades(self, game: Optional[str] = None) -> list[dict]:
        """获取交易记录列表"""
        db = RefactorSessionLocal()
        try:
            trades = TradeRepository.list_all(db, game=game)
            return [self._trade_to_dict(t) for t in trades]
        finally:
            db.close()

    def get_trade(self, trade_id: int) -> Optional[dict]:
        """获取单条交易记录"""
        db = RefactorSessionLocal()
        try:
            trade = TradeRepository.get_by_id(db, trade_id)
            if not trade:
                return None
            return self._trade_to_dict(trade)
        finally:
            db.close()

    def create_trade(self, data: dict) -> dict:
        """创建交易记录"""
        db = RefactorSessionLocal()
        try:
            # 自动补 date
            if "date" not in data or not data["date"]:
                data["date"] = datetime.now().strftime("%Y-%m-%d")
            trade = TradeRepository.create(db, data)
            return self._trade_to_dict(trade)
        finally:
            db.close()

    def update_trade(self, trade_id: int, data: dict) -> Optional[dict]:
        """更新交易记录"""
        db = RefactorSessionLocal()
        try:
            trade = TradeRepository.update(db, trade_id, data)
            if not trade:
                return None
            return self._trade_to_dict(trade)
        finally:
            db.close()

    # ── 交易分析（调 LLM） ──

    def analyze_trades(self, game: Optional[str] = None) -> dict:
        """
        分析交易记录，生成技术复盘
        
        Returns:
            分析结果（JSON）
        """
        trades = self.list_trades(game=game)
        if not trades:
            return {"analysis": "暂无交易记录", "per_trade": [], "patterns": [], "suggestion": "先记录第一笔交易"}

        # 构建 user message
        trades_text = "\n".join([
            f"交易#{t['trade_id']} | {t['date']} | 标的:{t['标的']} | 调查:{t.get('调查','无')} | "
            f"仓位:{t.get('仓位','无')} | 进场:{t.get('进场时机','无')} | 盈亏:{t.get('结果盈亏','未知')}"
            for t in trades[-10:]  # 最近 10 笔
        ])

        system_prompt = load_prompt("trade_analysis.txt")
        user_message = f"以下是最近的交易记录：\n{trades_text}\n\n请分析。"

        resp = self.llm.chat(system_prompt, user_message)
        result = resp.json()

        # 兜底：JSON 解析失败时，从 LLM 原始输出提取文本
        if not result or "analysis" not in result:
            raw = resp.content.strip()
            if raw and raw not in ("{}", ""):
                # 去掉 markdown 标记
                import re
                text = raw
                if text.startswith("```"):
                    text = re.sub(r"^```[\w]*\n?", "", text)
                if text.endswith("```"):
                    text = text[:-3]
                text = text.strip()
                result = {
                    "analysis": text[:500] if len(text) > 500 else text,
                    "per_trade": [],
                    "patterns": [],
                    "suggestion": text[:100] if len(text) > 100 else text,
                    "_fallback": True,
                }

        return result

    # ── 内部工具 ──

    @staticmethod
    def _trade_to_dict(trade: TradeModel) -> dict:
        return {
            "trade_id": trade.trade_id,
            "date": trade.date,
            "标的": trade.标的,
            "调查": trade.调查,
            "仓位": trade.仓位,
            "进场时机": trade.进场时机,
            "结果盈亏": trade.结果盈亏,
            "game": trade.game,
            "created_at": trade.created_at,
            "updated_at": trade.updated_at,
        }
