"""
ORM 模型 — 设计方案 §10
=========================
- 原表映射：只读，__table_args__={"extend_existing": True}，不自动建表
- 新表定义：可读写，独立建表
- 新表不外键依赖原表，靠 trade_ids / date / schedule_id 关联
"""

from sqlalchemy import (
    Column, Integer, String, Text, Float, DateTime, Boolean, JSON,
    TIMESTAMP, Date, func,
)
from app.db.connection import OriginalBase, RefactorBase


# ════════════════════════════════════════════════════════════════
# 原表映射（只读 — 映射现有 SQLite 结构，严格对应 DB schema）
# ════════════════════════════════════════════════════════════════

class Team(OriginalBase):
    """队伍基础信息"""
    __tablename__ = "teams"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True)
    team_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    short_name = Column(String, nullable=True)
    region = Column(String, nullable=True)
    league_id = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    mu = Column(Float, default=25.0)
    sigma = Column(Float, default=8.333)
    personality = Column(String, default="stable")
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    mu_velocity = Column(Float, default=0)
    mu_acceleration = Column(Float, default=0)


class Team3DData(OriginalBase):
    """队伍三维标签"""
    __tablename__ = "team_3d_data"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True)
    team_name = Column(String, nullable=False)
    region = Column(String, nullable=False)
    dim_1_name = Column(String, nullable=False)
    dim_1_value = Column(String, nullable=False)
    dim_2_name = Column(String, nullable=False)
    dim_2_value = Column(String, nullable=False)
    dim_3_name = Column(String, nullable=False)
    dim_3_value = Column(String, nullable=False)
    season = Column(String, default="2026 Spring")
    updated_at = Column(String)
    notes = Column(String, nullable=True)
    version_understanding = Column(String, nullable=True)


class Schedule(OriginalBase):
    """赛程"""
    __tablename__ = "schedules"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True)
    date = Column(String, nullable=False)
    time_bjt = Column(String, nullable=False)
    team_a = Column(String, nullable=False)
    team_b = Column(String, nullable=False)
    region = Column(String, nullable=False)
    format = Column(String, nullable=False)
    stage = Column(String, nullable=True)
    source = Column(String, nullable=True)
    updated_at = Column(String, nullable=False)


class Match(OriginalBase):
    """比赛详情"""
    __tablename__ = "matches"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True)
    match_id = Column(String, nullable=False)
    team_a_id = Column(String, nullable=False)
    team_b_id = Column(String, nullable=False)
    league_id = Column(String, nullable=True)
    match_time = Column(TIMESTAMP, nullable=True)
    game_format = Column(String, default="BO3")
    status = Column(String, default="scheduled")
    winner = Column(String, nullable=True)
    score_a = Column(Integer, default=0)
    score_b = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    stage = Column(String, default="")


class League(OriginalBase):
    """联赛信息"""
    __tablename__ = "leagues"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True)
    league_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    region = Column(String, nullable=True)
    year = Column(Integer, nullable=True)
    season = Column(String, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())


class Roster(OriginalBase):
    """选手名单"""
    __tablename__ = "rosters"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True)
    roster_id = Column(String, nullable=False)
    team_id = Column(String, nullable=False)
    player_id = Column(String, nullable=True)
    player_name = Column(String, nullable=False)
    role = Column(String, nullable=True)
    position = Column(String, nullable=True)
    is_starter = Column(Integer, default=1)
    join_date = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    leave_date = Column(String, default="NULL")
    status = Column(String, default="active")
    transfer_notes = Column(String, default="NULL")


class RefreshLog(OriginalBase):
    """刷新日志"""
    __tablename__ = "refresh_log"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True)
    refresh_type = Column(String, nullable=False)
    source = Column(String, nullable=True)
    records_affected = Column(Integer, default=0)
    status = Column(String, default="success")
    error_message = Column(String, nullable=True)
    started_at = Column(TIMESTAMP, server_default=func.current_timestamp())
    completed_at = Column(TIMESTAMP, nullable=True)


class ChangeLog(OriginalBase):
    """变更审计日志"""
    __tablename__ = "changelog"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True)
    table_name = Column(String, nullable=False)
    row_id = Column(Integer, nullable=True)
    operation = Column(String, nullable=False)
    old_values = Column(Text, nullable=True)
    new_values = Column(Text, nullable=True)
    changed_at = Column(DateTime, server_default=func.current_timestamp())
    triggered_by = Column(String, default="system")


class SharedVersionAnalysis(OriginalBase):
    """版本分析共享数据"""
    __tablename__ = "shared_version_analysis"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True)
    source_category = Column(String, nullable=False)
    topic = Column(String, nullable=True)
    content = Column(String, nullable=False)
    sort_order = Column(Integer, default=0)
    team_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.current_timestamp())
    content_type = Column(String, default="version_meta")
    embedding = Column(Text, nullable=True)


# _schema 表无主键，不做 ORM 映射（通过 raw SQL 访问）
# class SchemaVersion(OriginalBase):
#     __tablename__ = "_schema"
#     ...


# ════════════════════════════════════════════════════════════════
# 新增表模型（可读写 — 设计方案 §4.2 + §10.1）
# ════════════════════════════════════════════════════════════════

class TradeModel(RefactorBase):
    """交易记录 — 设计方案 §4.2"""
    __tablename__ = "trades"

    trade_id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(String, nullable=False, index=True)
    标的 = Column(String, nullable=False)
    调查 = Column(String, nullable=True)
    仓位 = Column(String, nullable=True)
    进场时机 = Column(String, nullable=True)
    结果盈亏 = Column(Float, nullable=True)
    game = Column(String, nullable=True, default="lol")  # lol / cs / val
    created_at = Column(String, server_default=func.datetime("now", "localtime"))
    updated_at = Column(String, server_default=func.datetime("now", "localtime"))


class ActivityModel(RefactorBase):
    """活动记录（岁月式）— 设计方案 §3.5"""
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    schedule_id = Column(Integer, nullable=True)  # 可空，关联日程
    name = Column(String, nullable=False)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=True)
    note = Column(String, nullable=True)
    rating = Column(Float, nullable=True)  # 0.5-5
    tags = Column(String, nullable=True)     # JSON 数组
    mood_before = Column(Integer, nullable=True)  # 0-10
    mood_after = Column(Integer, nullable=True)   # 0-10
    created_at = Column(String, server_default=func.datetime("now", "localtime"))
    updated_at = Column(String, server_default=func.datetime("now", "localtime"))


class ScheduleNewModel(RefactorBase):
    """日程（重构版）— 设计方案 §3.4"""
    __tablename__ = "schedules_new"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(String, nullable=False, index=True)
    content = Column(String, nullable=False)
    source = Column(String, nullable=False, default="user_add")  # ai_suggest | user_add
    priority = Column(Integer, nullable=True)  # 四象限 1-4
    category = Column(String, nullable=True)
    is_done = Column(Boolean, default=False)
    knowledge_id = Column(Integer, nullable=True)  # 关联拆解来源
    stage_goal_id = Column(Integer, nullable=True, index=True)  # 当前实践所属阶段目标
    reality_issue_id = Column(Integer, nullable=True, index=True)  # 可选关联现实课题；旧日程保持为空
    method_entry_id = Column(Integer, nullable=True, index=True)  # 可选关联已确认的方法条目
    practice_status = Column(String, nullable=False, default="active")  # active | completed | interrupted
    created_at = Column(String, server_default=func.datetime("now", "localtime"))
    updated_at = Column(String, server_default=func.datetime("now", "localtime"))


class GrowthDomainModel(RefactorBase):
    """成长领域：用户长期愿意经营的方向。"""
    __tablename__ = "growth_domains"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False)
    status = Column(String, nullable=False, default="active")
    created_at = Column(String, server_default=func.datetime("now", "localtime"))
    updated_at = Column(String, server_default=func.datetime("now", "localtime"))


class StageGoalModel(RefactorBase):
    """阶段目标：某个领域当前准备验证的具体变化。"""
    __tablename__ = "stage_goals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    domain_id = Column(Integer, nullable=False, index=True)
    content = Column(Text, nullable=False)
    status = Column(String, nullable=False, default="active")
    created_at = Column(String, server_default=func.datetime("now", "localtime"))
    updated_at = Column(String, server_default=func.datetime("now", "localtime"))


class PracticeEventModel(RefactorBase):
    """当前实践状态变化记录，用于完成、中断和回归读回。"""
    __tablename__ = "practice_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    schedule_id = Column(Integer, nullable=False, index=True)
    event_type = Column(String, nullable=False)  # started | completed | interrupted | returned
    note = Column(Text, nullable=True)
    created_at = Column(String, server_default=func.datetime("now", "localtime"))


class RealityIssueModel(RefactorBase):
    """现实课题：认识、方法、实践与反馈的聚合中心。"""
    __tablename__ = "reality_issues"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(Text, nullable=False)
    current_reality = Column(Text, nullable=False)
    desired_change = Column(Text, nullable=False, default="")
    primary_contradiction = Column(Text, nullable=True)
    objective_conditions = Column(Text, nullable=True)
    status = Column(String, nullable=False, default="active", index=True)
    is_focus = Column(Boolean, nullable=False, default=False, index=True)
    created_at = Column(String, server_default=func.datetime("now", "localtime"))
    updated_at = Column(String, server_default=func.datetime("now", "localtime"))


class RealityIssueEntryModel(RefactorBase):
    """现实课题中的事实、认识、方法、反馈与更新历史。"""
    __tablename__ = "reality_issue_entries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    reality_issue_id = Column(Integer, nullable=False, index=True)
    kind = Column(String, nullable=False, index=True)
    content = Column(Text, nullable=False)
    status = Column(String, nullable=False, default="candidate", index=True)
    source_type = Column(String, nullable=True)
    source_id = Column(Integer, nullable=True)
    practice_id = Column(Integer, nullable=True, index=True)
    occurred_at = Column(String, nullable=True)
    created_at = Column(String, server_default=func.datetime("now", "localtime"))
    confirmed_at = Column(String, nullable=True)


class RealityMethodSourceModel(RefactorBase):
    """方法候选采用知识分析时保存的来源与边界快照。"""
    __tablename__ = "reality_method_sources"

    id = Column(Integer, primary_key=True, autoincrement=True)
    method_entry_id = Column(Integer, nullable=False, index=True)
    analysis_id = Column(String, nullable=False, index=True)
    knowledge_id = Column(Integer, nullable=False, index=True)
    relevance_reason = Column(Text, nullable=False)
    applicable_conditions = Column(Text, nullable=False)
    boundary = Column(Text, nullable=False)
    verification_action = Column(Text, nullable=False)
    created_at = Column(String, server_default=func.datetime("now", "localtime"))


class PersonalMethodVersionModel(RefactorBase):
    """经反馈和用户确认形成的个人方法版本，不覆盖原知识。"""
    __tablename__ = "personal_method_versions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    issue_id = Column(Integer, nullable=False, index=True)
    method_entry_id = Column(Integer, nullable=False, index=True)
    update_entry_id = Column(Integer, nullable=False, unique=True, index=True)
    knowledge_ids = Column(Text, nullable=False, default="[]")
    content = Column(Text, nullable=False)
    applicable_conditions = Column(Text, nullable=False, default="")
    boundary = Column(Text, nullable=False, default="")
    evidence_feedback_id = Column(Integer, nullable=False, index=True)
    status = Column(String, nullable=False, default="confirmed")
    created_at = Column(String, server_default=func.datetime("now", "localtime"))


class MoodModel(RefactorBase):
    """心情记录（升级版）— 设计方案 §4.3"""
    __tablename__ = "mood"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(String, nullable=False, index=True, unique=True)
    mood_score = Column(Integer, nullable=False)       # 0-10
    energy = Column(Integer, nullable=True)             # 0-10
    stress = Column(Integer, nullable=True)             # 0-10
    trade_ids = Column(String, nullable=True)           # JSON 数组：从 had_trade 升级为 trade_ids
    note = Column(String, nullable=True)
    created_at = Column(String, server_default=func.datetime("now", "localtime"))


class KnowledgeModel(RefactorBase):
    """知识库条目（"知"页）"""
    __tablename__ = "knowledge"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    source_type = Column(String, nullable=False)  # bilibili | wechat | manual | wisdom
    source_url = Column(String, nullable=True)
    tags = Column(String, nullable=True)          # JSON 数组
    is_core = Column(Boolean, default=False)       # 柱石库标记
    created_at = Column(String, server_default=func.datetime("now", "localtime"))
    updated_at = Column(String, server_default=func.datetime("now", "localtime"))


class KnowledgeProfileModel(RefactorBase):
    """知识进入现实前的兼容结构；原始知识正文保持不变。"""
    __tablename__ = "knowledge_profiles"

    knowledge_id = Column(Integer, primary_key=True)
    problem = Column(Text, nullable=False)
    method = Column(Text, nullable=False)
    applicable_conditions = Column(Text, nullable=False)
    boundaries = Column(Text, nullable=False)
    testable_action = Column(Text, nullable=False)
    created_at = Column(String, server_default=func.datetime("now", "localtime"))
    updated_at = Column(String, server_default=func.datetime("now", "localtime"))


class WisdomModel(RefactorBase):
    """智慧条目（思→知回流）"""
    __tablename__ = "wisdom"

    id = Column(Integer, primary_key=True, autoincrement=True)
    content = Column(Text, nullable=False)
    source_review_id = Column(Integer, nullable=True)
    tags = Column(String, nullable=True)
    created_at = Column(String, server_default=func.datetime("now", "localtime"))


class DailyReviewModel(RefactorBase):
    """每日总评草稿"""
    __tablename__ = "daily_review"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(String, nullable=False, index=True, unique=True)
    summary = Column(Text, nullable=True)
    trade_ids = Column(String, nullable=True)   # JSON 数组
    wisdom_ids = Column(String, nullable=True)  # JSON 数组
    mood_id = Column(Integer, nullable=True)
    user_reflection = Column(Text, nullable=True)  # 用户补一句感悟
    created_at = Column(String, server_default=func.datetime("now", "localtime"))
    updated_at = Column(String, server_default=func.datetime("now", "localtime"))


class GoalModel(RefactorBase):
    """用户目标（行页「加想法」）"""
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, autoincrement=True)
    content = Column(Text, nullable=False)
    status = Column(String, default="active")  # active | broken_down | done
    created_at = Column(String, server_default=func.datetime("now", "localtime"))
    updated_at = Column(String, server_default=func.datetime("now", "localtime"))


class NoteModel(RefactorBase):
    """项目日志/笔记"""
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    date = Column(String, nullable=False, index=True)
    created_at = Column(String, server_default=func.datetime("now", "localtime"))
    updated_at = Column(String, server_default=func.datetime("now", "localtime"))


class DailyPlanModel(RefactorBase):
    """结衣每日课程表 — learn / review / do_tasks + 结衣建议"""
    __tablename__ = "daily_plan"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(String, nullable=False, index=True, unique=True)
    learn = Column(Text, nullable=True)          # JSON array
    review = Column(Text, nullable=True)         # JSON array
    do_tasks = Column(Text, nullable=True)       # JSON array
    suggestion = Column(Text, nullable=True)     # 结衣建议文案
    created_at = Column(String, server_default=func.datetime("now", "localtime"))
    updated_at = Column(String, server_default=func.datetime("now", "localtime"))
