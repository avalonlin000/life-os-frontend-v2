"""
结衣 API 路由 — 设计方案 §11 + §11.1
========================================
知行思三页全部路由：知识库/日程/活动/心情/总评/智慧
"""

from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Query, HTTPException

from app.schemas import (
    KnowledgeCreate, KnowledgeOut,
    ScheduleCreate, ScheduleUpdate, ScheduleOut,
    ActivityCreate, ActivityFinish, ActivityOut,
    MoodCreate, MoodOut,
    DailyReviewOut,
    WisdomOut,
    ReviewExtractIn,
    MoodTrendItem,
    GoalCreate, GoalOut,
    NoteCreate, NoteOut,
    GrowthDomainCreate, GrowthDomainOut,
    StageGoalCreate, StageGoalOut,
    CurrentPracticeCreate, PracticeEventCreate,
    RealityIssueCreate, RealityIssueUpdate,
    RealityIssueEntryCreate, RealityIssuePracticeCreate, KnowledgeProfileUpsert,
    RealityIssueFeedbackCreate, RealityMethodCandidateCreate,
)
from app.services.jieyi.action_service import ActionService
from app.services.jieyi.context_service import ContextService
from app.services.jieyi.daily_plan_service import DailyPlanService
from app.services.jieyi.daily_plan_ai_service import DailyPlanAIService
from app.services.jieyi.daily_review_ai_service import DailyReviewAIService
from app.services.jieyi.deep_learning_service import DeepLearningService
from app.services.jieyi.feedback_loop_service import FeedbackLoopService
from app.services.jieyi.goal_ai_service import GoalAIService
from app.services.jieyi.goal_service import GoalService
from app.services.jieyi.growth_path_service import GrowthPathService
from app.services.jieyi.knowledge_service import KnowledgeService
from app.services.jieyi.knowledge_split_service import KnowledgeSplitService
from app.services.jieyi.note_service import NoteService
from app.services.jieyi.principles_service import PrinciplesService
from app.services.jieyi.reflection_service import ReflectionService
from app.services.jieyi.review_ai_service import ReviewAIService
from app.services.jieyi.reality_issue_service import (
    RealityIssueConflict,
    RealityIssueInvalid,
    RealityIssueNotFound,
    RealityIssueService,
)
from app.services.jieyi.schedule_suggestion_service import ScheduleSuggestionService
from app.services.jieyi.today_service import TodayService

router = APIRouter()
knowledge_service = KnowledgeService()
action_service = ActionService()
reflection_service = ReflectionService()
feedback_loop_service = FeedbackLoopService()
context_service = ContextService()
principles_service = PrinciplesService()
today_service = TodayService(
    feedback_loop=feedback_loop_service,
    context_service=context_service,
    principles_service=principles_service,
)
deep_learning_service = DeepLearningService()
daily_review_ai_service = DailyReviewAIService()
daily_plan_ai_service = DailyPlanAIService()
schedule_suggestion_service = ScheduleSuggestionService()
knowledge_split_service = KnowledgeSplitService()
review_ai_service = ReviewAIService()
goal_ai_service = GoalAIService()
goal_service = GoalService()
note_service = NoteService()
growth_path_service = GrowthPathService()
reality_issue_service = RealityIssueService()


def _raise_reality_issue_http_error(error: Exception) -> None:
    if isinstance(error, RealityIssueNotFound):
        raise HTTPException(status_code=404, detail=str(error)) from error
    if isinstance(error, RealityIssueConflict):
        raise HTTPException(status_code=409, detail=str(error)) from error
    raise HTTPException(status_code=422, detail=str(error)) from error


# ── 知：知识库 ──

@router.get("/api/knowledge", response_model=list[KnowledgeOut])
async def list_knowledge(
    source_type: Optional[str] = Query(None, description="按来源筛选：bilibili/wechat/manual/wisdom"),
):
    """知识库列表"""
    return knowledge_service.list_all(source_type=source_type)


@router.post("/api/knowledge", response_model=KnowledgeOut)
async def create_knowledge(data: KnowledgeCreate):
    """导入知识"""
    return knowledge_service.create(data.model_dump())


@router.post("/api/knowledge/{knowledge_id}/split")
async def split_knowledge(knowledge_id: int):
    """AI 拆解知识成可执行项（知→行 关键链路）"""
    result = knowledge_split_service.split(knowledge_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.get("/api/knowledge/questions")
async def get_knowledge_questions():
    """根据知识库生成 2 道针对性思考题（每道 2 个子问题）"""
    return deep_learning_service.generate_questions()


@router.get("/api/knowledge/paged")
async def list_knowledge_paged(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
):
    """材料分页。主流程不用它，深度学习/材料库需要时再调。"""
    return knowledge_service.list_paged(page=page, page_size=page_size)


@router.get("/api/knowledge/{knowledge_id}")
async def get_knowledge_detail(knowledge_id: int):
    """材料详情，给深度学习阅读全文用。"""
    result = knowledge_service.get_detail(knowledge_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"材料 {knowledge_id} 不存在")
    return result


@router.get("/api/knowledge/{knowledge_id}/profile")
async def get_knowledge_profile(knowledge_id: int):
    result = knowledge_service.get_profile(knowledge_id)
    if not result:
        raise HTTPException(status_code=404, detail="knowledge_profile_unavailable")
    return result


@router.put("/api/knowledge/{knowledge_id}/profile")
async def upsert_knowledge_profile(knowledge_id: int, data: KnowledgeProfileUpsert):
    result = knowledge_service.upsert_profile(knowledge_id, data.model_dump())
    if not result:
        raise HTTPException(status_code=404, detail="knowledge_not_found_or_internal")
    return result

@router.post("/api/agent/jieyi/deep-learning/prepare")
async def prepare_deep_learning(data: dict):
    """知页深度学习：按粗主题检索本地知识，生成 3 个深挖问题和学习包。"""
    return deep_learning_service.prepare(data)


@router.post("/api/agent/jieyi/deep-learning/acceptance")
async def save_deep_learning_acceptance(data: dict):
    """知页深度学习验收：把五卡结论回写到知识/行动/下一问题。"""
    return deep_learning_service.save_acceptance(data)


@router.post("/api/jieyi/principles/candidates/{candidate_id}/promote")
async def promote_principle_candidate(candidate_id: int, data: dict):
    """用户明确确认后，把认知资产候选提升为正式智慧原则。"""
    return principles_service.promote_candidate(candidate_id, data.get("statement", ""))

# ── 行：日程 ──

@router.get("/api/schedule", response_model=list[ScheduleOut])
async def list_schedule(
    date: Optional[str] = Query(None, description="日期 YYYY-MM-DD，默认今天"),
):
    """日程列表"""
    return action_service.list_by_date(date=date)


@router.post("/api/schedule", response_model=ScheduleOut)
async def create_schedule(data: ScheduleCreate):
    """创建日程（source 标记 ai_suggest | user_add）"""
    return action_service.create(data.model_dump())


@router.put("/api/schedule/{schedule_id}", response_model=ScheduleOut)
async def update_schedule(schedule_id: int, data: ScheduleUpdate):
    """更新日程（打卡/修改）"""
    result = action_service.update(schedule_id, data.model_dump(exclude_none=True))
    if not result:
        raise HTTPException(status_code=404, detail=f"日程 {schedule_id} 不存在")
    return result


# ── 思：活动记录（岁月式） ──

@router.get("/api/activities", response_model=list[ActivityOut])
async def list_activities(
    date: Optional[str] = Query(None, description="日期 YYYY-MM-DD，默认今天"),
):
    """活动记录列表"""
    return reflection_service.list_activities(date=date)


@router.post("/api/activities", response_model=ActivityOut)
async def start_activity(data: ActivityCreate):
    """开始活动（岁月式：声明→计时→结束记体验）"""
    return reflection_service.start_activity(data.model_dump(exclude_none=True))


@router.post("/api/activities/{activity_id}/finish", response_model=ActivityOut)
async def finish_activity(activity_id: int, data: ActivityFinish):
    """结束活动 + 记体验"""
    result = reflection_service.finish_activity(activity_id, data.model_dump(exclude_none=True))
    if not result:
        raise HTTPException(status_code=404, detail=f"活动 {activity_id} 不存在")
    return result


# ── 思：心情 ──

@router.get("/api/mood", response_model=list[MoodOut])
async def get_mood(
    date: Optional[str] = Query(None, description="日期 YYYY-MM-DD，默认今天"),
):
    """获取心情记录（无记录返回空列表）"""
    result = reflection_service.get_mood(date=date)
    return [result] if result else []


@router.post("/api/mood", response_model=MoodOut)
async def save_mood(data: MoodCreate):
    """保存心情（含 trade_ids，upsert）"""
    return reflection_service.save_mood(data.model_dump(exclude_none=True))


# ── 思：每日总评 ──

@router.get("/api/daily-review")
async def get_daily_review(
    date: Optional[str] = Query(None, description="日期 YYYY-MM-DD，默认今天"),
):
    """获取每日总评"""
    return reflection_service.get_daily_review(date=date)


@router.post("/api/daily-review")
async def generate_daily_review(
    date: Optional[str] = Query(None, description="日期 YYYY-MM-DD，默认今天"),
):
    """生成每日总评草稿（系统自动生成，含单次记录 JOIN）"""
    return daily_review_ai_service.generate(date=date)


# ── 思：智慧条目 ──

@router.get("/api/wisdom", response_model=list[WisdomOut])
async def list_wisdom():
    """智慧条目列表（思→知回流）"""
    return principles_service.list_wisdom()


# ── 长期复盘（飞书发起） ──

@router.post("/api/review/initiate")
async def initiate_review(
    period: Optional[str] = Query("8days", description="复盘周期：8days | half_month | month"),
):
    """
    发起长期复盘（飞书结衣按周期主动对话）
    
    返回：
    - opening: 开场白（发送给用户的第一条消息）
    - guide_questions: 引导问题列表
    - period_range: 复盘时间范围
    """
    result = review_ai_service.initiate(period=period)
    return result


@router.post("/api/review/extract")
async def extract_wisdom(data: ReviewExtractIn):
    """
    从复盘对话中提炼智慧条目 → 回流 wisdom 表
    """
    result = review_ai_service.extract(data.conversation, data.period)
    return result


# ── 行动台：每日课程表 ──

@router.get("/api/daily-plan")
async def get_daily_plan(
    date: Optional[str] = Query(None, description="日期 YYYY-MM-DD，默认今天"),
):
    """获取每日课程表：产品数据库优先，旧日课文件只作兼容读取。"""
    target_date = date or datetime.now().strftime("%Y-%m-%d")
    return DailyPlanService.get_by_date(target_date)


# ── 日程建议（AI生成） ──

@router.post("/api/schedule/suggest")
async def suggest_schedule(
    date: Optional[str] = Query(None, description="日期 YYYY-MM-DD，默认今天"),
):
    """AI 生成日程建议（基于知识库+心情+未完成项）"""
    return schedule_suggestion_service.suggest(date=date)


# ── 心情趋势（v1.0 新增） ──

@router.get("/api/mood/trend", response_model=list[MoodTrendItem])
async def mood_trend(
    days: int = Query(7, description="天数，默认近7天"),
):
    """获取近N天的心情/精力/压力趋势"""
    return reflection_service.get_mood_trend(days=days)


# ── 日程刷新（v1.0 新增） ──

@router.post("/api/daily-plan/refresh")
async def refresh_daily_plan(
    date: Optional[str] = Query(None, description="日期 YYYY-MM-DD，默认今天"),
):
    """显式把旧日课文件导入结衣产品并同步当天计划行动。"""
    target_date = date or datetime.now().strftime("%Y-%m-%d")
    return DailyPlanService.refresh_from_legacy(target_date)


@router.post("/api/daily-plan/generate")
async def generate_daily_plan(
    date: Optional[str] = Query(None, description="日期 YYYY-MM-DD，默认今天"),
):
    """根据结衣产品知识生成课程表，并写入产品正源。"""
    result = daily_plan_ai_service.generate(date=date)
    if not result.get("ok"):
        raise HTTPException(status_code=422, detail=result)
    return result


# ── 目标管理（v1.0 新增） ──

@router.get("/api/goals", response_model=list[GoalOut])
async def list_goals():
    """获取目标列表"""
    return goal_service.list_active()


@router.post("/api/goals", response_model=GoalOut)
async def create_goal(data: GoalCreate):
    """创建目标（行页加想法）"""
    return goal_service.create(data.model_dump())


@router.post("/api/goals/{goal_id}/breakdown")
async def breakdown_goal(goal_id: int):
    """AI 拆解目标成行动项"""
    result = goal_ai_service.breakdown(goal_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


# ── 人生方向 → 阶段目标 → 当前实践 ──

@router.get("/api/jieyi/growth-map")
async def get_growth_map(
    date: Optional[str] = Query(None, description="日期 YYYY-MM-DD，默认今天"),
):
    """读取成长领域、阶段目标、当天当前实践和回归轨迹。"""
    return growth_path_service.get_map(date=date)


@router.post("/api/jieyi/growth-domains", response_model=GrowthDomainOut)
async def create_growth_domain(data: GrowthDomainCreate):
    """用户确认后创建成长领域。"""
    return growth_path_service.create_domain(data.name)


@router.post("/api/jieyi/stage-goals", response_model=StageGoalOut)
async def create_stage_goal(data: StageGoalCreate):
    """用户确认后在成长领域下创建阶段目标。"""
    result = growth_path_service.create_stage_goal(data.domain_id, data.content)
    if result.get("error"):
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.post("/api/jieyi/current-practices", response_model=ScheduleOut)
async def create_current_practice(data: CurrentPracticeCreate):
    """用户确认后创建可追溯到阶段目标的当前实践。"""
    result = growth_path_service.create_practice(data.stage_goal_id, data.date, data.content)
    if result.get("error"):
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.post("/api/jieyi/current-practices/{schedule_id}/events")
async def change_current_practice(schedule_id: int, data: PracticeEventCreate):
    """记录当前实践的完成、中断或回归。"""
    result = growth_path_service.change_practice_state(schedule_id, data.event_type, data.note or "")
    if result.get("error") == "current_practice_not_found":
        try:
            practice = reality_issue_service.change_practice_state(
                schedule_id, data.event_type, data.note or ""
            )
            return {"practice": practice, "event": {"event_type": data.event_type, "note": data.note}}
        except (RealityIssueNotFound, RealityIssueInvalid, RealityIssueConflict) as error:
            _raise_reality_issue_http_error(error)
    if result.get("error") == "invalid_practice_event":
        raise HTTPException(status_code=422, detail=result["error"])
    if result.get("error"):
        raise HTTPException(status_code=404, detail=result["error"])
    return result


# ── 现实课题：认识 → 改造 → 反馈 → 更新 ──

@router.get("/api/jieyi/reality-issues")
async def list_reality_issues():
    return reality_issue_service.list_issues()


@router.get("/api/jieyi/reality-issues/focus")
async def get_focused_reality_issue():
    result = reality_issue_service.get_focus()
    if not result:
        raise HTTPException(status_code=404, detail="focused_reality_issue_not_found")
    return result


@router.get("/api/jieyi/reality-issues/{issue_id}/knowledge-analysis")
async def analyze_reality_issue_knowledge(issue_id: int):
    try:
        return reality_issue_service.analyze_knowledge(issue_id)
    except (RealityIssueNotFound, RealityIssueInvalid, RealityIssueConflict) as error:
        _raise_reality_issue_http_error(error)


@router.post("/api/jieyi/reality-issues/{issue_id}/knowledge-analysis/method-candidate")
async def create_knowledge_method_candidate(issue_id: int, data: RealityMethodCandidateCreate):
    try:
        return reality_issue_service.create_method_candidate(issue_id, data.model_dump())
    except (RealityIssueNotFound, RealityIssueInvalid, RealityIssueConflict) as error:
        _raise_reality_issue_http_error(error)


@router.post("/api/jieyi/reality-issues")
async def create_reality_issue(data: RealityIssueCreate):
    try:
        return reality_issue_service.create_issue(data.model_dump())
    except (RealityIssueNotFound, RealityIssueInvalid, RealityIssueConflict) as error:
        _raise_reality_issue_http_error(error)


@router.patch("/api/jieyi/reality-issues/{issue_id}")
async def update_reality_issue(issue_id: int, data: RealityIssueUpdate):
    try:
        return reality_issue_service.update_issue(issue_id, data.model_dump(exclude_none=True))
    except (RealityIssueNotFound, RealityIssueInvalid, RealityIssueConflict) as error:
        _raise_reality_issue_http_error(error)


@router.post("/api/jieyi/reality-issues/{issue_id}/focus")
async def focus_reality_issue(issue_id: int):
    try:
        return reality_issue_service.focus_issue(issue_id)
    except (RealityIssueNotFound, RealityIssueInvalid, RealityIssueConflict) as error:
        _raise_reality_issue_http_error(error)


@router.post("/api/jieyi/reality-issues/{issue_id}/entries")
async def create_reality_issue_entry(issue_id: int, data: RealityIssueEntryCreate):
    try:
        return reality_issue_service.create_entry(issue_id, data.model_dump())
    except (RealityIssueNotFound, RealityIssueInvalid, RealityIssueConflict) as error:
        _raise_reality_issue_http_error(error)


@router.post("/api/jieyi/reality-issues/{issue_id}/entries/{entry_id}/confirm")
async def confirm_reality_issue_entry(issue_id: int, entry_id: int):
    try:
        return reality_issue_service.confirm_entry(issue_id, entry_id)
    except (RealityIssueNotFound, RealityIssueInvalid, RealityIssueConflict) as error:
        _raise_reality_issue_http_error(error)


@router.post("/api/jieyi/reality-issues/{issue_id}/entries/{entry_id}/reject")
async def reject_reality_issue_entry(issue_id: int, entry_id: int):
    try:
        return reality_issue_service.reject_entry(issue_id, entry_id)
    except (RealityIssueNotFound, RealityIssueInvalid, RealityIssueConflict) as error:
        _raise_reality_issue_http_error(error)


@router.post("/api/jieyi/reality-issues/{issue_id}/entries/{entry_id}/promote-method-version")
async def promote_reality_method_version(issue_id: int, entry_id: int):
    try:
        return reality_issue_service.promote_method_version(issue_id, entry_id)
    except (RealityIssueNotFound, RealityIssueInvalid, RealityIssueConflict) as error:
        _raise_reality_issue_http_error(error)


@router.get("/api/jieyi/reality-issues/{issue_id}")
async def get_reality_issue(issue_id: int):
    try:
        return reality_issue_service.get_issue(issue_id)
    except (RealityIssueNotFound, RealityIssueInvalid, RealityIssueConflict) as error:
        _raise_reality_issue_http_error(error)


@router.post("/api/jieyi/reality-issues/{issue_id}/practices")
async def create_reality_issue_practice(issue_id: int, data: RealityIssuePracticeCreate):
    try:
        return reality_issue_service.create_practice(issue_id, data.model_dump())
    except (RealityIssueNotFound, RealityIssueInvalid, RealityIssueConflict) as error:
        _raise_reality_issue_http_error(error)


@router.post("/api/jieyi/reality-issues/{issue_id}/practices/{schedule_id}/feedback")
async def add_reality_issue_feedback(
    issue_id: int,
    schedule_id: int,
    data: RealityIssueFeedbackCreate,
):
    try:
        return reality_issue_service.add_feedback(issue_id, schedule_id, data.model_dump())
    except (RealityIssueNotFound, RealityIssueInvalid, RealityIssueConflict) as error:
        _raise_reality_issue_http_error(error)


# ── 笔记/日志（v1.0 新增） ──

@router.get("/api/notes", response_model=list[NoteOut])
async def list_notes(
    limit: int = Query(10, description="返回条数"),
):
    """获取项目日志列表"""
    return note_service.list_recent(limit=limit)


@router.post("/api/notes", response_model=NoteOut)
async def create_note(data: NoteCreate):
    """保存普通原文；不分类、不调用模型、不关联现实课题。"""
    try:
        return note_service.create(data.model_dump())
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@router.delete("/api/notes/{note_id}")
async def delete_note(note_id: int):
    """删除一条笔记；不存在时明确返回 404。"""
    if not note_service.delete(note_id):
        raise HTTPException(status_code=404, detail="note_not_found")
    return {"deleted": True, "id": note_id}


# ── 每日反思一条（v1.0 新增） ──

@router.get("/api/daily-note")
async def get_daily_note(
    date: Optional[str] = Query(None, description="日期 YYYY-MM-DD，默认今天"),
):
    """获取结衣产品笔记中的今日反思。"""
    return note_service.get_daily_note(date=date)


# ── 结衣知行合一编排层（v2：思考卡 / 改命动作 / 阻力复盘 / 原则） ──

@router.get("/api/jieyi/today")
async def get_jieyi_today(
    date: Optional[str] = Query(None, description="日期 YYYY-MM-DD，默认今天"),
):
    """移动端四页聚合：今日一问、今日行动、今晚复盘、原则候选。"""
    return today_service.get_flow(date=date)


@router.get("/api/jieyi/today/aggregate")
async def get_jieyi_today_aggregate(
    date: Optional[str] = Query(None, description="日期 YYYY-MM-DD，默认今天"),
):
    """四页今日聚合：知/行/思/道 前端一次性消费字段。"""
    return today_service.get_aggregate(date=date)


@router.get("/api/agent/jieyi/today")
async def get_agent_jieyi_today(
    date: Optional[str] = Query(None, description="日期 YYYY-MM-DD，默认今天"),
):
    """Agent 命名空间兼容入口：返回同一个四页今日聚合结构。"""
    return today_service.get_aggregate(date=date)


@router.post("/api/jieyi/thoughts")
async def save_jieyi_thought(data: dict):
    """写一句想法：保存 note，并返回行动/复盘候选。"""
    return feedback_loop_service.save_thought(data)


@router.post("/api/agent/jieyi/deep-learning/session")
async def create_deep_learning_session(data: dict):
    """创建 60 分钟深度学习 session。"""
    return deep_learning_service.create_session(data)


@router.put("/api/agent/jieyi/deep-learning/session/{session_id}/step")
async def update_deep_learning_session_step(session_id: str, data: dict):
    """保存 60 分钟深度学习某一步结果。"""
    return deep_learning_service.update_session_step(session_id, data)

@router.get("/api/jieyi/thinking-cards/today")
async def get_thinking_cards_today(
    date: Optional[str] = Query(None, description="日期 YYYY-MM-DD，默认今天"),
):
    """知页：新知/复习 → 结衣提问 → 结合用户 → 建议。"""
    return feedback_loop_service.get_thinking_cards_today(date=date)


@router.post("/api/jieyi/thinking-cards/{card_id:path}/answer")
async def answer_thinking_card(card_id: str, data: dict):
    """保存用户对思考卡的判断。"""
    return feedback_loop_service.answer_thinking_card(card_id, data)


@router.post("/api/jieyi/thinking-cards/{card_id:path}/to-action")
async def thinking_card_to_action(card_id: str, data: dict):
    """思考卡转今日行动。"""
    return feedback_loop_service.thinking_card_to_action(card_id, data)


@router.get("/api/jieyi/practices/today")
async def get_practices_today(
    date: Optional[str] = Query(None, description="日期 YYYY-MM-DD，默认今天"),
):
    """行页：每日改命动作 + 今日行动。"""
    return feedback_loop_service.get_practices_today(date=date)


@router.post("/api/jieyi/practices/{method_id}/check")
async def check_practice(method_id: str, data: dict):
    """勾选/取消每日改命动作。"""
    return feedback_loop_service.check_practice(method_id, data)


@router.get("/api/jieyi/reflection/today")
async def get_reflection_today(
    date: Optional[str] = Query(None, description="日期 YYYY-MM-DD，默认今天"),
):
    """思页：今日对账与阻力问题。"""
    return feedback_loop_service.get_reflection_today(date=date)


@router.post("/api/jieyi/reflection/write-tomorrow")
async def write_reflection_tomorrow(data: dict):
    """把思页调整写入明日计划。"""
    return feedback_loop_service.write_reflection_tomorrow(data)


@router.get("/api/jieyi/principles")
async def get_principles():
    """道页：长期方向与已验证原则。"""
    return principles_service.get_principles()


# ── 结衣 Agent 路由（v1.1 新增） ──

@router.get("/api/agent/jieyi/daily-context")
async def get_jieyi_daily_context(
    date: Optional[str] = Query(None, description="日期 YYYY-MM-DD，默认今天"),
):
    """结衣读取每日上下文 — daily_plan + activities + mood + review + schedules + knowledge + goals"""
    target_date = date or datetime.now().strftime("%Y-%m-%d")
    return context_service.get_daily_context(target_date)


@router.post("/api/agent/jieyi/write-next-plan")
async def write_jieyi_next_plan(data: dict):
    """结衣写入下一天课程表（upsert by date）"""
    return DailyPlanService.write_plan(data)
