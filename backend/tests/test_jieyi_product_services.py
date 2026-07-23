import json
from types import SimpleNamespace

from app.services.jieyi.action_service import ActionService
from app.services.jieyi.context_service import ContextService
from app.services.jieyi.deep_learning_service import DeepLearningService
from app.services.jieyi.daily_review_ai_service import DailyReviewAIService
from app.services.jieyi.daily_plan_ai_service import DailyPlanAIService
from app.services.jieyi.feedback_loop_service import FeedbackLoopService
from app.services.jieyi.knowledge_service import KnowledgeService
from app.services.jieyi.principles_service import PrinciplesService
from app.services.jieyi.reflection_service import ReflectionService
from app.services.jieyi.schedule_suggestion_service import ScheduleSuggestionService
from app.services.jieyi.knowledge_split_service import KnowledgeSplitService
from app.services.jieyi.review_ai_service import ReviewAIService
from app.services.jieyi.goal_ai_service import GoalAIService
from app.services.jieyi.goal_service import GoalService
from app.services.jieyi.note_service import NoteService
from app.services.jieyi.today_service import TodayService
from app.agents.jieyi_agent import JieyiAgent


class FakeDB:
    def __init__(self):
        self.closed = False

    def close(self):
        self.closed = True


def _model(**values):
    defaults = {
        "id": 1,
        "created_at": "2026-07-18 08:00:00",
        "updated_at": "2026-07-18 08:00:00",
    }
    defaults.update(values)
    return SimpleNamespace(**defaults)


def test_knowledge_service_returns_stable_paged_contract(monkeypatch):
    db = FakeDB()
    item = _model(
        title="实践论",
        content="从行动取得反馈",
        source_type="manual",
        source_url=None,
        tags="[]",
        is_core=True,
    )
    monkeypatch.setattr(
        "app.services.jieyi.knowledge_service.KnowledgeRepository.list_paged",
        lambda session, page, page_size: (11, [item]),
    )

    result = KnowledgeService(session_factory=lambda: db).list_paged(page=0, page_size=100)

    assert result == {
        "page": 1,
        "page_size": 50,
        "total": 11,
        "items": [{
            "id": 1,
            "title": "实践论",
            "content": "从行动取得反馈",
            "source_type": "manual",
            "source_url": None,
            "tags": "[]",
            "is_core": True,
            "created_at": "2026-07-18 08:00:00",
            "updated_at": "2026-07-18 08:00:00",
        }],
    }
    assert db.closed is True


def test_action_service_keeps_missing_update_as_not_found(monkeypatch):
    db = FakeDB()
    monkeypatch.setattr(
        "app.services.jieyi.action_service.ScheduleNewRepository.update",
        lambda session, schedule_id, data: None,
    )

    result = ActionService(session_factory=lambda: db).update(404, {"is_done": True})

    assert result is None
    assert db.closed is True


def test_reflection_service_fills_activity_start_time_without_changing_input(monkeypatch):
    db = FakeDB()
    received = {}

    def create(session, data):
        received.update(data)
        return _model(
            schedule_id=None,
            name=data["name"],
            start_time=data["start_time"],
            end_time=None,
            note=None,
            rating=None,
            tags=None,
            mood_before=None,
            mood_after=None,
        )

    monkeypatch.setattr("app.services.jieyi.reflection_service.ActivityRepository.create", create)
    original = {"name": "散步"}

    result = ReflectionService(session_factory=lambda: db).start_activity(original)

    assert result["name"] == "散步"
    assert result["start_time"]
    assert original == {"name": "散步"}
    assert received["start_time"] == result["start_time"]
    assert db.closed is True


def test_reflection_service_reads_daily_review_summary_as_product_payload(monkeypatch):
    db = FakeDB()
    row = _model(
        date="2026-07-18",
        summary=json.dumps({"summary": "今天先完成最小行动"}, ensure_ascii=False),
    )
    monkeypatch.setattr(
        "app.services.jieyi.reflection_service.DailyReviewRepository.get_by_date",
        lambda session, date: row,
    )

    result = ReflectionService(session_factory=lambda: db).get_daily_review("2026-07-18")

    assert result == {"summary": "今天先完成最小行动"}
    assert db.closed is True


def test_feedback_loop_reflection_uses_product_action_state():
    class FakeActionService:
        def get_practices_today(self, date):
            return {
                "date": date,
                "practices": [
                    {"name": "散步 10 分钟", "is_done": False},
                    {"name": "冥想 5 分钟", "is_done": True},
                ],
                "actions": [],
            }

    service = FeedbackLoopService(action_service=FakeActionService())

    result = service.get_reflection_today("2026-07-18")

    assert [item["name"] for item in result["done"]] == ["冥想 5 分钟"]
    assert [item["name"] for item in result["missed"]] == ["散步 10 分钟"]
    assert "散步 10 分钟没做到" in result["question"]


def test_feedback_loop_writes_tomorrow_through_daily_plan_service():
    class FakeDailyPlanService:
        saved = None

        @classmethod
        def write_plan(cls, data):
            cls.saved = data
            return {"ok": True, "plan": data, "synced_schedules": 2}

    service = FeedbackLoopService(daily_plan_service=FakeDailyPlanService)

    result = service.write_reflection_tomorrow({
        "date": "2026-07-19",
        "adjustment": "先散步十分钟，再决定是否加量。",
    })

    assert result["ok"] is True
    assert FakeDailyPlanService.saved["date"] == "2026-07-19"
    assert FakeDailyPlanService.saved["doTasks"][-1] == "先散步十分钟，再决定是否加量。"


def test_context_service_uses_one_daily_plan_contract(monkeypatch):
    db = FakeDB()
    monkeypatch.setattr(
        "app.services.jieyi.context_service.DailyPlanService.get_by_date",
        lambda date: {"date": date, "source": "legacy_file", "status": "compatibility"},
    )
    monkeypatch.setattr("app.services.jieyi.context_service.ActivityRepository.list_by_date", lambda *args: [])
    monkeypatch.setattr("app.services.jieyi.context_service.MoodRepository.get_by_date", lambda *args: None)
    monkeypatch.setattr("app.services.jieyi.context_service.DailyReviewRepository.get_by_date", lambda *args: None)
    monkeypatch.setattr("app.services.jieyi.context_service.ScheduleNewRepository.list_unfinished_until", lambda *args: [])
    monkeypatch.setattr("app.services.jieyi.context_service.KnowledgeRepository.list_recent", lambda *args: [])
    monkeypatch.setattr("app.services.jieyi.context_service.GoalRepository.list_active", lambda *args: [])

    result = ContextService(session_factory=lambda: db).get_daily_context("2026-07-18")

    assert result["daily_plan"]["source"] == "legacy_file"
    assert result["activities"] == []
    assert db.closed is True


def test_principles_service_keeps_unverified_methods_out_of_verified_bucket(monkeypatch):
    db = FakeDB()
    monkeypatch.setattr("app.services.jieyi.principles_service.WisdomRepository.list_recent", lambda *args: [])
    monkeypatch.setattr("app.services.jieyi.principles_service.ScheduleNewRepository.list_completed_by_source", lambda *args: [])
    monkeypatch.setattr("app.services.jieyi.principles_service.KnowledgeRepository.list_all", lambda *args, **kwargs: [])

    result = PrinciplesService(session_factory=lambda: db).get_principles()

    assert len(result["principles"]) == 6
    assert all(item["verification_status"] == "pending" for item in result["principles"])
    assert db.closed is True


def test_principles_service_lists_wisdom_without_agent_dependency(monkeypatch):
    db = FakeDB()
    item = _model(content="先做最小动作", source_review_id=3, tags="行动")
    monkeypatch.setattr("app.services.jieyi.principles_service.WisdomRepository.list_all", lambda *args: [item])

    result = PrinciplesService(session_factory=lambda: db).list_wisdom()

    assert result == [{
        "id": 1,
        "content": "先做最小动作",
        "source_review_id": 3,
        "tags": "行动",
        "created_at": "2026-07-18 08:00:00",
    }]
    assert db.closed is True


def test_today_service_returns_explicit_empty_states_from_product_services():
    class FakeFeedback:
        def get_thinking_cards_today(self, date):
            return {"date": date, "cards": []}

        def get_practices_today(self, date):
            return {"date": date, "practices": [], "actions": []}

        def get_reflection_today(self, date):
            return {"date": date, "done": [], "missed": [], "summary": ""}

    class FakeContext:
        def get_daily_context(self, date):
            return {"date": date, "recent_knowledge": [], "activities": [], "mood": None, "daily_review": None}

    class FakePrinciples:
        def get_principles(self):
            return {"direction": "", "principles": [], "data_sources": []}

    result = TodayService(
        feedback_loop=FakeFeedback(),
        context_service=FakeContext(),
        principles_service=FakePrinciples(),
    ).get_aggregate("2026-07-18")

    assert result["status"] == "ok"
    assert result["empty_states"] == {
        "know_materials": True,
        "act_actions": True,
        "reflect_review": True,
        "way_user_principles": True,
    }


def test_deep_learning_service_never_calls_empty_materials_live(monkeypatch):
    db = FakeDB()
    monkeypatch.setattr("app.services.jieyi.deep_learning_service.KnowledgeRepository.search", lambda *args, **kwargs: [])

    result = DeepLearningService(session_factory=lambda: db).prepare({"topic": "不存在的主题"})

    assert result["mode"] == "fallback"
    assert result["materials"] == []
    assert "未找到匹配材料" in result["status_label"]
    assert db.closed is True


def test_deep_learning_prepare_excludes_internal_smoke_materials(monkeypatch):
    db = FakeDB()
    smoke = _model(title="xiaobai-smoke 深度学习", content="smoke-test material", source_type="daily_plan")
    real = _model(title="执念即苦", content="不是亏损让人痛苦，是执念", source_type="daily_plan")
    monkeypatch.setattr(
        "app.services.jieyi.deep_learning_service.KnowledgeRepository.search",
        lambda *args, **kwargs: [smoke, real],
    )

    result = DeepLearningService(session_factory=lambda: db).prepare({"topic": "执念"})

    assert result["mode"] == "live"
    assert [item["title"] for item in result["materials"]] == ["执念即苦"]
    assert db.closed is True


def test_deep_learning_acceptance_writes_pending_cognitive_asset_candidate(monkeypatch):
    class WriteDB(FakeDB):
        def __init__(self):
            super().__init__()
            self.added = []

        def add(self, item):
            self.added.append(item)

        def commit(self):
            return None

        def refresh(self, item):
            item.id = 42

    db = WriteDB()
    monkeypatch.setattr(
        "app.services.jieyi.deep_learning_service.KnowledgeRepository.get_by_source_url",
        lambda *args, **kwargs: None,
    )
    result = DeepLearningService(session_factory=lambda: db).save_acceptance({
        "topic": "执念",
        "question": "执念真正要解决的是哪个现实问题？",
        "level": "partial",
        "destination": "knowledge_card",
        "source_date": "2026-07-19",
        "source_materials": [{"title": "执念即苦", "source": "daily_plan"}],
        "cards": {
            "problem": "不是亏损本身，而是必须赢回来的执念接管判断。",
            "structure": "执取 -> 证明 -> 扳回 -> 偏离纪律。",
            "connection": "把我必须对换成我会错，但要活到对的时候。",
            "boundary": "不等于所有亏损都来自执念，还要区分策略问题。",
            "action": "出现扳回冲动时先写下我在证明什么，并暂停十分钟。",
        },
    })

    knowledge = [item for item in db.added if getattr(item, "source_type", None) == "cognitive_asset_candidate"]
    assert result["ok"] is True
    assert result["candidate"]["verification_status"] == "pending"
    assert result["candidate"]["source_date"] == "2026-07-19"
    assert len(knowledge) == 1
    assert json.loads(knowledge[0].tags)[-1] == "pending"
    assert db.closed is True


def test_principles_service_reads_pending_candidates_from_knowledge(monkeypatch):
    db = FakeDB()
    candidate = _model(
        title="深度学习 · 执念",
        content="problem: 扳回执念会接管判断",
        source_type="cognitive_asset_candidate",
        source_url="deep-learning:2026-07-19:执念",
        tags=json.dumps(["深度学习", "执念", "pending"], ensure_ascii=False),
        is_core=False,
        created_at="2026-07-19 10:00:00",
    )
    monkeypatch.setattr("app.services.jieyi.principles_service.WisdomRepository.list_recent", lambda *args: [])
    monkeypatch.setattr("app.services.jieyi.principles_service.ScheduleNewRepository.list_completed_by_source", lambda *args: [])
    monkeypatch.setattr("app.services.jieyi.principles_service.KnowledgeRepository.list_all", lambda *args, **kwargs: [candidate])

    result = PrinciplesService(session_factory=lambda: db).get_principles()

    item = next(item for item in result["principles"] if item["source_type"] == "cognitive_asset_candidate")
    assert item["verification_status"] == "pending"
    assert item["verification_label"] == "候选池 · 待确认"
    assert item["source_date"] == "2026-07-19"
    assert db.closed is True


def test_principles_service_promotes_candidate_once_and_keeps_source_trace(monkeypatch):
    class WriteDB(FakeDB):
        def commit(self):
            return None

    db = WriteDB()
    candidate = _model(
        id=13,
        source_type="cognitive_asset_candidate",
        source_url="deep-learning:2026-07-19:执念",
        tags=json.dumps(["深度学习", "执念", "pending"], ensure_ascii=False),
    )
    wisdom = _model(id=21, content="我会错，但要活到对的时候。", tags="[]")
    monkeypatch.setattr("app.services.jieyi.principles_service.KnowledgeRepository.get_by_id", lambda *args: candidate)
    monkeypatch.setattr("app.services.jieyi.principles_service.WisdomRepository.get_by_id", lambda *args: None)
    monkeypatch.setattr("app.services.jieyi.principles_service.WisdomRepository.create", lambda *args, **kwargs: wisdom)

    result = PrinciplesService(session_factory=lambda: db).promote_candidate(
        13,
        "我会错，但要活到对的时候；出现扳回冲动时先识别自己在证明什么。",
    )

    assert result["ok"] is True
    assert result["already_promoted"] is False
    assert result["principle"]["id"] == "wisdom:21"
    assert "promoted" in json.loads(candidate.tags)
    assert "promoted_wisdom_id:21" in json.loads(candidate.tags)
    assert db.closed is True


def test_principles_service_labels_promoted_candidate_as_formal_principle(monkeypatch):
    db = FakeDB()
    wisdom = _model(
        id=21,
        content="我会错，但要活到对的时候。",
        tags=json.dumps(["from_cognitive_asset_candidate", "candidate_id:13"], ensure_ascii=False),
    )
    monkeypatch.setattr("app.services.jieyi.principles_service.WisdomRepository.list_recent", lambda *args: [wisdom])
    monkeypatch.setattr("app.services.jieyi.principles_service.KnowledgeRepository.list_all", lambda *args, **kwargs: [])
    monkeypatch.setattr("app.services.jieyi.principles_service.ScheduleNewRepository.list_completed_by_source", lambda *args: [])

    result = PrinciplesService(session_factory=lambda: db).get_principles()

    item = next(item for item in result["principles"] if item["id"] == "wisdom:21")
    assert item["source"] == "认知资产候选 #13 · 用户确认提升"
    assert item["pillar"] == "认知资产正式原则"
    assert item["verification_status"] == "verified"
    assert db.closed is True


def test_deep_learning_service_preserves_structured_questions_from_llm(monkeypatch):
    class FakeLLM:
        def chat(self, *args, **kwargs):
            return SimpleNamespace(json=lambda: {"questions": [{"main": "如何落地？"}]})

    db = FakeDB()
    item = _model(title="行动方法", content="把知识变成行动", created_at="2026-07-18 08:00:00")

    # The service receives its data source through the repository boundary.
    monkeypatch.setattr("app.services.jieyi.deep_learning_service.KnowledgeRepository.list_recent", lambda *args: [item])
    result = DeepLearningService(session_factory=lambda: db, llm=FakeLLM()).generate_questions()

    assert result == {"questions": [{"main": "如何落地？"}]}


def test_daily_review_ai_service_returns_explicit_model_error_without_fake_summary(monkeypatch):
    class FakeLLM:
        def chat(self, *args, **kwargs):
            return SimpleNamespace(json=lambda: {"error": "LLM_API_KEY not configured", "fallback": True})

    db = FakeDB()
    mood = _model(
        date="2026-07-18",
        mood_score=5,
        energy=5,
        stress=5,
        trade_ids=None,
    )
    monkeypatch.setattr("app.services.jieyi.daily_review_ai_service.MoodRepository.get_by_date", lambda *args: mood)
    monkeypatch.setattr("app.services.jieyi.daily_review_ai_service.ActivityRepository.list_by_date", lambda *args: [])
    monkeypatch.setattr(
        "app.services.jieyi.daily_review_ai_service.DailyReviewRepository.upsert_generated",
        lambda *args: (_ for _ in ()).throw(AssertionError("model errors must not be stored")),
    )

    result = DailyReviewAIService(session_factory=lambda: db, llm=FakeLLM()).generate("2026-07-18")

    assert result["error"] == "LLM_API_KEY not configured"
    assert result["fallback"] is True
    assert "summary" not in result
    assert db.closed is True


def test_daily_review_ai_service_skips_before_model_when_no_real_records(monkeypatch):
    class FakeLLM:
        def chat(self, *args, **kwargs):
            raise AssertionError("no-data days must not call the model")

    db = FakeDB()
    monkeypatch.setattr("app.services.jieyi.daily_review_ai_service.MoodRepository.get_by_date", lambda *args: None)
    monkeypatch.setattr("app.services.jieyi.daily_review_ai_service.ActivityRepository.list_by_date", lambda *args: [])
    monkeypatch.setattr(
        "app.services.jieyi.daily_review_ai_service.DailyReviewRepository.upsert_generated",
        lambda *args: (_ for _ in ()).throw(AssertionError("empty reviews must not be stored")),
    )

    result = DailyReviewAIService(session_factory=lambda: db, llm=FakeLLM()).generate("2026-07-18")

    assert result == {
        "date": "2026-07-18",
        "summary": "",
        "highlights": [],
        "concerns": [],
        "trade_insight": None,
        "suggestion": "",
        "status": "skipped",
        "reason": "no_daily_records",
    }
    assert db.closed is True


def test_daily_review_ai_service_passes_mood_note_to_model(monkeypatch):
    captured = {}

    class FakeLLM:
        def chat(self, system_prompt, user_message, **kwargs):
            captured["user_message"] = user_message
            return SimpleNamespace(json=lambda: {
                "summary": "今天先承认恢复期的压力，再把目标放回稳定执行。",
                "highlights": ["愿意记录真实心态"],
                "concerns": ["持续亏损带来的心态波动"],
                "trade_insight": None,
                "suggestion": "明天只守住一个可完成的小动作。",
            })

    db = FakeDB()
    mood = _model(
        date="2026-07-19",
        mood_score=5,
        energy=None,
        stress=None,
        trade_ids=None,
        note="今天是恢复期，我想要从不断的亏损中走出来，不求大胜但是自己心态不能乱",
    )
    monkeypatch.setattr(
        "app.services.jieyi.daily_review_ai_service.MoodRepository.get_by_date",
        lambda *args: mood,
    )
    monkeypatch.setattr("app.services.jieyi.daily_review_ai_service.ActivityRepository.list_by_date", lambda *args: [])
    monkeypatch.setattr("app.services.jieyi.daily_review_ai_service.DailyReviewRepository.upsert_generated", lambda *args: None)

    result = DailyReviewAIService(session_factory=lambda: db, llm=FakeLLM()).generate("2026-07-19")

    assert result["summary"] == "今天先承认恢复期的压力，再把目标放回稳定执行。"
    assert "今天是恢复期，我想要从不断的亏损中走出来" in captured["user_message"]
    assert db.closed is True


def test_schedule_suggestion_service_keeps_empty_knowledge_explicit(monkeypatch):
    db = FakeDB()
    monkeypatch.setattr("app.services.jieyi.schedule_suggestion_service.KnowledgeRepository.list_for_suggestion", lambda *args: [])
    monkeypatch.setattr("app.services.jieyi.schedule_suggestion_service.MoodRepository.get_by_date", lambda *args: None)
    monkeypatch.setattr("app.services.jieyi.schedule_suggestion_service.ScheduleNewRepository.list_by_date", lambda *args: [])

    result = ScheduleSuggestionService(session_factory=lambda: db).suggest("2026-07-19")

    assert result["suggestions"] == []
    assert result["context"]["candidate_count"] == 0
    assert result["context"]["energy_level"] == "medium"
    assert db.closed is True


def test_knowledge_split_service_returns_not_found_without_model_call(monkeypatch):
    db = FakeDB()
    monkeypatch.setattr("app.services.jieyi.knowledge_split_service.KnowledgeRepository.get_by_id", lambda *args: None)

    result = KnowledgeSplitService(session_factory=lambda: db).split(404)

    assert result == {"error": "知识条目 404 不存在"}
    assert db.closed is True


def test_review_ai_service_does_not_fabricate_wisdom_when_model_returns_empty(monkeypatch):
    class FakeLLM:
        def chat(self, *args, **kwargs):
            return SimpleNamespace(json=lambda: {})

    db = FakeDB()
    monkeypatch.setattr("app.services.jieyi.review_ai_service.TradeRepository.list_between", lambda *args: [])
    monkeypatch.setattr("app.services.jieyi.review_ai_service.MoodRepository.list_between", lambda *args: [])
    monkeypatch.setattr("app.services.jieyi.review_ai_service.WisdomRepository.create", lambda *args: (_ for _ in ()).throw(AssertionError("should not write")))

    result = ReviewAIService(session_factory=lambda: db, llm=FakeLLM()).initiate("8days")

    assert result == {}
    assert db.closed is True


def test_goal_ai_service_returns_not_found_without_model_call(monkeypatch):
    db = FakeDB()
    monkeypatch.setattr("app.services.jieyi.goal_ai_service.GoalRepository.get_by_id", lambda *args: None)

    result = GoalAIService(session_factory=lambda: db).breakdown(404)

    assert result == {"error": "目标 404 不存在"}
    assert db.closed is True


def test_goal_service_lists_active_goals_without_agent_dependency(monkeypatch):
    db = FakeDB()
    goal = _model(content="把知识变成每天能完成的动作", status="active")
    monkeypatch.setattr(
        "app.services.jieyi.goal_service.GoalRepository.list_active",
        lambda session: [goal],
    )

    result = GoalService(session_factory=lambda: db).list_active()

    assert result == [{
        "id": 1,
        "content": "把知识变成每天能完成的动作",
        "status": "active",
        "created_at": "2026-07-18 08:00:00",
    }]
    assert db.closed is True


def test_jieyi_agent_is_only_a_compatibility_facade():
    class FakeGoalService:
        def list_active(self):
            return [{"id": 7, "content": "保持真实记录", "status": "active", "created_at": "now"}]

    result = JieyiAgent(goal_service=FakeGoalService()).list_goals()

    assert result == [{"id": 7, "content": "保持真实记录", "status": "active", "created_at": "now"}]


def test_note_service_reads_daily_note_only_from_product_notes(monkeypatch):
    db = FakeDB()
    note = _model(
        title="今天的反思",
        content="先完成一个最小动作，再根据反馈调整。",
        date="2026-07-19",
    )
    monkeypatch.setattr(
        "app.services.jieyi.note_service.NoteRepository.get_latest_by_date",
        lambda session, date: note,
    )

    result = NoteService(session_factory=lambda: db).get_daily_note("2026-07-19")

    assert result == {
        "date": "2026-07-19",
        "title": "今天的反思",
        "text": "先完成一个最小动作，再根据反馈调整。",
        "found": True,
        "source": "product_note",
    }
    assert db.closed is True


def test_note_service_returns_honest_empty_daily_note(monkeypatch):
    db = FakeDB()
    monkeypatch.setattr(
        "app.services.jieyi.note_service.NoteRepository.get_latest_by_date",
        lambda session, date: None,
    )

    result = NoteService(session_factory=lambda: db).get_daily_note("2026-07-19")

    assert result == {
        "date": "2026-07-19",
        "title": "",
        "text": "",
        "found": False,
        "source": "none",
    }
    assert db.closed is True


def test_daily_plan_ai_service_does_not_write_when_materials_are_empty(monkeypatch):
    class NeverWritePlanService:
        @classmethod
        def write_plan(cls, data):
            raise AssertionError("empty materials must not create a plan")

    db = FakeDB()
    monkeypatch.setattr(
        "app.services.jieyi.daily_plan_ai_service.KnowledgeRepository.list_recent",
        lambda *args: [],
    )

    result = DailyPlanAIService(
        session_factory=lambda: db,
        daily_plan_service=NeverWritePlanService,
    ).generate("2026-07-19")

    assert result == {
        "ok": False,
        "date": "2026-07-19",
        "status": "insufficient_materials",
        "error": "结衣知识库没有可用于生成课程表的材料",
    }
    assert db.closed is True


def test_daily_plan_ai_service_validates_and_writes_product_plan(monkeypatch):
    class FakeLLM:
        def chat(self, *args, **kwargs):
            return SimpleNamespace(json=lambda: {
                "date": "2026-07-19",
                "learn": [{
                    "pillar": "实践",
                    "title": "用最小行动获得反馈",
                    "content": "先做一个可验证的小动作，再根据结果调整下一步。",
                    "questions": ["今天最小动作是什么？", "结果改变了什么判断？"],
                    "source": "实践论笔记",
                }],
                "review": [],
                "doTasks": ["身体训练 10min", "冥想 5min", "执行显化一次"],
                "suggestion": "今天只守住一个最小闭环。",
            })

    class FakePlanService:
        saved = None

        @classmethod
        def get_by_date(cls, date):
            return {"date": date, "learn": [], "review": [], "doTasks": [], "source": "none"}

        @classmethod
        def write_plan(cls, data):
            cls.saved = data
            return {"ok": True, "plan": data, "synced_schedules": 3}

    db = FakeDB()
    material = _model(
        title="实践论笔记",
        content="认识来自实践，行动产生反馈。",
        source_type="manual",
        source_url=None,
        tags="[\"实践\"]",
        is_core=True,
    )
    monkeypatch.setattr(
        "app.services.jieyi.daily_plan_ai_service.KnowledgeRepository.list_recent",
        lambda *args: [material],
    )
    monkeypatch.setattr(
        "app.services.jieyi.daily_plan_ai_service.WisdomRepository.list_recent",
        lambda *args: [],
    )

    result = DailyPlanAIService(
        session_factory=lambda: db,
        llm=FakeLLM(),
        daily_plan_service=FakePlanService,
    ).generate("2026-07-19")

    assert result["ok"] is True
    assert result["source"] == "product_db"
    assert FakePlanService.saved["date"] == "2026-07-19"
    assert len(FakePlanService.saved["learn"]) == 1
    assert result["synced_schedules"] == 3
    assert db.closed is True


def test_daily_plan_ai_service_excludes_internal_smoke_materials(monkeypatch):
    captured = {}

    class FakeLLM:
        def chat(self, system_prompt, user_message, **kwargs):
            captured["user_message"] = user_message
            return SimpleNamespace(json=lambda: {
                "learn": [{
                    "pillar": "实践",
                    "title": "真实材料",
                    "content": "从真实材料生成的学习内容。",
                    "questions": ["今天如何实践？", "结果是什么？"],
                    "source": "真实材料",
                }],
                "review": [],
                "doTasks": ["身体训练 10min", "冥想 5min", "执行显化一次"],
                "suggestion": "完成一个真实闭环。",
            })

    class FakePlanService:
        @classmethod
        def get_by_date(cls, date):
            return {"date": date, "learn": [], "review": [], "doTasks": [], "source": "none"}

        @classmethod
        def write_plan(cls, data):
            return {"ok": True, "plan": data, "synced_schedules": 3}

    smoke = _model(
        title="xiaobai-smoke-test 验证材料",
        content="这只是接口验证内容",
        source_type="manual",
        source_url=None,
        tags="xiaobai-smoke-test",
        is_core=False,
    )
    real = _model(
        id=2,
        title="真实材料",
        content="认识来自实践，行动产生反馈。",
        source_type="daily_plan",
        source_url=None,
        tags="实践",
        is_core=False,
    )
    db = FakeDB()

    def list_recent(session, limit):
        assert limit == 50
        return [smoke, real]

    monkeypatch.setattr(
        "app.services.jieyi.daily_plan_ai_service.KnowledgeRepository.list_recent",
        list_recent,
    )
    monkeypatch.setattr(
        "app.services.jieyi.daily_plan_ai_service.WisdomRepository.list_recent",
        lambda *args: [],
    )

    result = DailyPlanAIService(
        session_factory=lambda: db,
        llm=FakeLLM(),
        daily_plan_service=FakePlanService,
    ).generate("2026-07-19")

    assert result["ok"] is True
    assert "真实材料" in captured["user_message"]
    assert "xiaobai-smoke" not in captured["user_message"]
    assert db.closed is True
