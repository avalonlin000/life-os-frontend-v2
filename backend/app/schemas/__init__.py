"""
Pydantic Schemas — 1:1 对应 contracts/types.ts
==============================================
FastAPI 自动生成 OpenAPI 与前端类型契约对齐
"""

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field


# ── 交易记录（§4.2） ──

class TradeCreate(BaseModel):
    date: Optional[str] = None
    标的: str
    调查: Optional[str] = None
    仓位: Optional[str] = None
    进场时机: Optional[str] = None
    结果盈亏: Optional[float] = None
    game: Optional[str] = "lol"


class TradeUpdate(BaseModel):
    标的: Optional[str] = None
    调查: Optional[str] = None
    仓位: Optional[str] = None
    进场时机: Optional[str] = None
    结果盈亏: Optional[float] = None
    game: Optional[str] = None


class TradeOut(BaseModel):
    trade_id: int
    date: str
    标的: str
    调查: Optional[str] = None
    仓位: Optional[str] = None
    进场时机: Optional[str] = None
    结果盈亏: Optional[float] = None
    game: Optional[str] = "lol"
    created_at: str
    updated_at: str


# ── 活动记录（§3.5） ──

class ActivityCreate(BaseModel):
    schedule_id: Optional[int] = None
    name: str
    start_time: Optional[str] = None
    mood_before: Optional[int] = None
    tags: Optional[str] = None          # JSON string


class ActivityFinish(BaseModel):
    end_time: Optional[str] = None
    note: Optional[str] = None
    rating: Optional[float] = None        # 0.5-5
    tags: Optional[str] = None          # JSON string
    mood_after: Optional[int] = None


class ActivityOut(BaseModel):
    id: int
    schedule_id: Optional[int] = None
    name: str
    start_time: str
    end_time: Optional[str] = None
    note: Optional[str] = None
    rating: Optional[float] = None
    tags: Optional[str] = None
    mood_before: Optional[int] = None
    mood_after: Optional[int] = None
    created_at: str
    updated_at: str


# ── 日程（§3.4） ──

class ScheduleCreate(BaseModel):
    date: str
    content: str
    source: str = "user_add"
    priority: Optional[int] = None
    category: Optional[str] = None
    knowledge_id: Optional[int] = None
    stage_goal_id: Optional[int] = None
    reality_issue_id: Optional[int] = None


class ScheduleUpdate(BaseModel):
    content: Optional[str] = None
    source: Optional[str] = None
    priority: Optional[int] = None
    category: Optional[str] = None
    is_done: Optional[bool] = None
    stage_goal_id: Optional[int] = None
    reality_issue_id: Optional[int] = None
    practice_status: Optional[str] = None


class ScheduleOut(BaseModel):
    id: int
    date: str
    content: str
    source: str
    priority: Optional[int] = None
    category: Optional[str] = None
    is_done: bool
    knowledge_id: Optional[int] = None
    stage_goal_id: Optional[int] = None
    reality_issue_id: Optional[int] = None
    practice_status: str = "active"
    created_at: str
    updated_at: str


# ── 心情（§4.3） ──

class MoodCreate(BaseModel):
    date: str
    mood_score: int = Field(ge=0, le=10)
    energy: Optional[int] = Field(None, ge=0, le=10)
    stress: Optional[int] = Field(None, ge=0, le=10)
    trade_ids: Optional[str] = None     # JSON array as string
    note: Optional[str] = None


class MoodOut(BaseModel):
    id: int
    date: str
    mood_score: int
    energy: Optional[int] = None
    stress: Optional[int] = None
    trade_ids: Optional[str] = None
    note: Optional[str] = None
    created_at: str


# ── 知识库 ──

class KnowledgeCreate(BaseModel):
    title: str
    content: str
    source_type: str = "manual"
    source_url: Optional[str] = None
    tags: Optional[str] = None
    is_core: bool = False


class KnowledgeOut(BaseModel):
    id: int
    title: str
    content: str
    source_type: str
    source_url: Optional[str] = None
    tags: Optional[str] = None
    is_core: bool
    created_at: str
    updated_at: str


class KnowledgeProfileUpsert(BaseModel):
    problem: str = Field(min_length=1, max_length=4000)
    method: str = Field(min_length=1, max_length=4000)
    applicable_conditions: str = Field(min_length=1, max_length=4000)
    boundaries: str = Field(min_length=1, max_length=4000)
    testable_action: str = Field(min_length=1, max_length=4000)


# ── 智慧条目 ──

class WisdomOut(BaseModel):
    id: int
    content: str
    source_review_id: Optional[int] = None
    tags: Optional[str] = None
    created_at: str


# ── 每日总评 ──

class DailyReviewOut(BaseModel):
    id: int
    date: str
    summary: Optional[str] = None
    trade_ids: Optional[str] = None
    wisdom_ids: Optional[str] = None
    mood_id: Optional[int] = None
    user_reflection: Optional[str] = None
    created_at: str
    updated_at: str


# ── 长期复盘 ──

class ReviewExtractIn(BaseModel):
    conversation: str = Field(..., description="复盘对话全文")
    period: str = Field("8days", description="复盘周期：8days | half_month | month")

class TeamOut(BaseModel):
    id: int
    team_id: str
    name: str
    short_name: Optional[str] = None
    region: Optional[str] = None
    league_id: Optional[str] = None
    logo_url: Optional[str] = None
    mu: float
    sigma: float
    personality: Optional[str] = None

class Team3DOut(BaseModel):
    id: int
    team_name: str
    region: str
    dim_1_name: str
    dim_1_value: str
    dim_2_name: str
    dim_2_value: str
    dim_3_name: str
    dim_3_value: str
    season: Optional[str] = None
    notes: Optional[str] = None
    version_understanding: Optional[str] = None

class Team3DUpdate(BaseModel):
    dim_1_name: Optional[str] = None
    dim_1_value: Optional[str] = None
    dim_2_name: Optional[str] = None
    dim_2_value: Optional[str] = None
    dim_3_name: Optional[str] = None
    dim_3_value: Optional[str] = None
    notes: Optional[str] = None
    version_understanding: Optional[str] = None


# ── TK 知识搜索 ──

class TKOut(BaseModel):
    id: int
    concept: str
    content: str
    source_category: str
    created_at: str
    content_type: str


# ── 分析师报告 ──

class AnalystReportOut(BaseModel):
    team: str
    name: str
    region: Optional[str] = None
    updated_at: Optional[str] = None
    summary: str


class AnalystReportDetailOut(BaseModel):
    found: bool
    team: str
    name: str
    region: Optional[str] = None
    sections: list[dict] = []
    generated_at: str


# ── 新增：心情趋势 ──

class MoodTrendItem(BaseModel):
    """单日心情趋势数据点"""
    date: str
    mood_score: int
    energy: Optional[int] = None
    stress: Optional[int] = None


# ── 新增：目标 ──

class GoalCreate(BaseModel):
    content: str


class GoalOut(BaseModel):
    id: int
    content: str
    status: str = "active"
    created_at: str


class GrowthDomainCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)


class GrowthDomainOut(BaseModel):
    id: int
    name: str
    status: str
    created_at: str
    updated_at: Optional[str] = None


class StageGoalCreate(BaseModel):
    domain_id: int
    content: str = Field(min_length=1, max_length=500)


class StageGoalOut(BaseModel):
    id: int
    domain_id: int
    content: str
    status: str
    created_at: str
    updated_at: Optional[str] = None


class CurrentPracticeCreate(BaseModel):
    stage_goal_id: int
    date: str
    content: str = Field(min_length=1, max_length=500)


class PracticeEventCreate(BaseModel):
    event_type: str
    note: Optional[str] = Field(None, max_length=1000)


# ── 现实课题主循环 ──

RealityIssueStatus = Literal["active", "paused", "resolved"]
RealityIssueEntryKind = Literal[
    "fact",
    "knowledge",
    "understanding",
    "question",
    "method",
    "feedback",
    "worldview_update",
    "method_update",
]


class RealityIssueCreate(BaseModel):
    statement: Optional[str] = Field(None, min_length=1, max_length=4000)
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    current_reality: Optional[str] = Field(None, min_length=1, max_length=4000)
    desired_change: Optional[str] = Field(None, max_length=4000)
    primary_contradiction: Optional[str] = Field(None, max_length=4000)
    objective_conditions: Optional[str] = Field(None, max_length=4000)


class RealityIssueUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    current_reality: Optional[str] = Field(None, min_length=1, max_length=4000)
    desired_change: Optional[str] = Field(None, max_length=4000)
    primary_contradiction: Optional[str] = Field(None, max_length=4000)
    objective_conditions: Optional[str] = Field(None, max_length=4000)
    status: Optional[RealityIssueStatus] = None


class RealityIssueEntryCreate(BaseModel):
    kind: RealityIssueEntryKind
    content: Optional[str] = Field(None, min_length=1, max_length=10000)
    source_type: Optional[str] = Field(None, max_length=120)
    source_id: Optional[int] = None
    practice_id: Optional[int] = None
    occurred_at: Optional[str] = Field(None, max_length=80)


class RealityIssuePracticeCreate(BaseModel):
    date: str = Field(min_length=1, max_length=32)
    content: str = Field(min_length=1, max_length=1000)
    method_entry_id: int


class RealityIssueFeedbackCreate(BaseModel):
    content: str = Field(min_length=1, max_length=10000)
    occurred_at: Optional[str] = Field(None, max_length=80)


class RealityMethodCandidateCreate(BaseModel):
    analysis_id: str = Field(min_length=1, max_length=120)
    content: Optional[str] = Field(None, min_length=1, max_length=10000)


# ── 新增：笔记 ──

class NoteCreate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    content: str = Field(min_length=1, max_length=20000)
    date: Optional[str] = Field(None, max_length=32)


class NoteOut(BaseModel):
    id: int
    title: str
    content: str
    date: str
    created_at: str
