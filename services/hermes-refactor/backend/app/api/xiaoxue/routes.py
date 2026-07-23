"""
小雪 API 路由 — 设计方案 §11
==============================
现有路由 + 新增交易记录路由
"""

from typing import Optional
from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session

from app.schemas import TeamOut, Team3DOut, Team3DUpdate, TradeCreate, TradeUpdate, TradeOut, TKOut, AnalystReportOut, AnalystReportDetailOut
from app.agents.xiaoxue_agent import XiaoxueAgent

router = APIRouter()
agent = XiaoxueAgent()


# ── 现有路由（承接） ──

@router.get("/api/teams", response_model=list[TeamOut])
async def get_teams():
    """获取队伍列表"""
    return agent.list_teams()


@router.get("/api/team-3d/{team}", response_model=Team3DOut)
async def get_team_3d(team: str):
    """获取队伍三维数据"""
    result = agent.get_team_3d(team)
    if not result:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"队伍 {team} 三维数据不存在")
    return result


@router.get("/api/tk", response_model=list[TKOut])
async def search_tk(q: str = Query(..., description="搜索关键词"), limit: int = Query(20, ge=1, le=100)):
    """TK 知识搜索"""
    return agent.search_tk(q, limit=limit)


@router.get("/api/analyst", response_model=list[AnalystReportOut])
async def list_analyst_reports():
    """分析师报告列表"""
    return agent.list_analyst_reports()


@router.get("/api/analyst/{team}", response_model=AnalystReportDetailOut)
async def get_analyst_report(team: str):
    """获取单个队伍分析师报告"""
    return agent.get_analyst_report(team)


# ── 新增路由：交易记录（§4.2） ──

@router.get("/api/trades", response_model=list[TradeOut])
async def list_trades(game: Optional[str] = Query(None, description="按游戏筛选：lol/cs/val")):
    """获取交易记录列表（卡片式）"""
    return agent.list_trades(game=game)


@router.post("/api/trades/analyze")
async def analyze_trades(game: Optional[str] = Query(None, description="按游戏筛选")):
    """AI 分析交易记录（触发 LLM 调用）"""
    return agent.analyze_trades(game=game)


@router.get("/api/trades/{trade_id}", response_model=TradeOut)
async def get_trade(trade_id: int):
    """获取单条交易记录"""
    result = agent.get_trade(trade_id)
    if not result:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"交易 {trade_id} 不存在")
    return result


@router.post("/api/trades", response_model=TradeOut)
async def create_trade(data: TradeCreate):
    """创建交易记录"""
    return agent.create_trade(data.model_dump(exclude_none=True))


@router.put("/api/trades/{trade_id}", response_model=TradeOut)
async def update_trade(trade_id: int, data: TradeUpdate):
    """更新交易记录"""
    result = agent.update_trade(trade_id, data.model_dump(exclude_none=True))
    if not result:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"交易 {trade_id} 不存在")
    return result
