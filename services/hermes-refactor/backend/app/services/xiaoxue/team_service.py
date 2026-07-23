"""
小雪 Service 层 — 设计方案 §13.2
===================================
薄封装层：API 路由 → Service → Agent → Repository
"""

from app.agents.xiaoxue_agent import XiaoxueAgent

_xiaoxue = XiaoxueAgent()


class TeamService:
    """队伍 service"""
    list_all = staticmethod(_xiaoxue.list_teams)
    get_3d = staticmethod(_xiaoxue.get_team_3d)


class TradeService:
    """交易记录 service"""
    list_all = staticmethod(_xiaoxue.list_trades)
    get_by_id = staticmethod(_xiaoxue.get_trade)
    create = staticmethod(_xiaoxue.create_trade)
    update = staticmethod(_xiaoxue.update_trade)
    analyze = staticmethod(_xiaoxue.analyze_trades)
