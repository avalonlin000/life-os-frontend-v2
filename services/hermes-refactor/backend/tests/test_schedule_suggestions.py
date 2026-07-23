import os
os.environ.setdefault("ORIGINAL_DB_PATH", "/tmp/nonexistent-original.db")
os.environ.setdefault("REFACTOR_DB_PATH", "/tmp/nonexistent-refactor.db")

from types import SimpleNamespace

from app.agents.jieyi_agent import JieyiAgent


def make_knowledge(id, title, content, tags="[]", source_type="manual", is_core=True):
    return SimpleNamespace(
        id=id,
        title=title,
        content=content,
        tags=tags,
        source_type=source_type,
        is_core=is_core,
        created_at="2026-06-23 10:00:00",
    )


def make_schedule(content, is_done=False, date="2026-06-23", source="user_add", category=None):
    return SimpleNamespace(
        content=content,
        is_done=is_done,
        date=date,
        source=source,
        category=category,
    )


def make_mood(energy=8, mood_score=8, stress=3):
    return SimpleNamespace(energy=energy, mood_score=mood_score, stress=stress)


def test_schedule_suggestions_extract_dedupe_and_rank_high_energy():
    agent = JieyiAgent()
    knowledge = [
        make_knowledge(
            1,
            "交易复盘体系",
            "建立交易复盘体系：Day1 建立交易复盘模板，Day2 回填最近三笔交易，Day3 总结入场规则。每天收盘后复盘交易。",
            '["交易", "复盘"]',
        ),
        make_knowledge(
            2,
            "健身维护",
            "每天拉伸10分钟，做一次深蹲训练，状态差也要做维护性动作。",
            '["健身"]',
        ),
        make_knowledge(
            3,
            "交易日课",
            "搭建交易复盘模板并记录关键字段，避免凭感觉交易。",
            '["交易"]',
        ),
    ]
    suggestions = agent._build_schedule_suggestions(
        target_date="2026-06-24",
        knowledge=knowledge,
        today_mood=make_mood(energy=8),
        yesterday_mood=make_mood(energy=7),
        yesterday_schedules=[make_schedule("建立交易复盘模板", is_done=False)],
        existing_schedules=[],
    )

    contents = [item["content"] for item in suggestions["suggestions"]]
    assert contents[0] == "回填最近三笔交易"
    assert len([c for c in contents if "交易复盘模板" in c]) == 0
    assert len(contents) == len(set(contents))
    assert suggestions["context"]["energy_level"] == "high"
    assert suggestions["suggestions"][0]["category"] == "交易"
    assert suggestions["suggestions"][0]["knowledge_id"] == 1


def test_schedule_suggestions_prefer_maintenance_when_low_energy():
    agent = JieyiAgent()
    knowledge = [
        make_knowledge(1, "交易复盘体系", "建立交易复盘体系：Day1 建立交易复盘模板，Day2 回填最近三笔交易，Day3 总结入场规则。", '["交易"]'),
        make_knowledge(2, "毛选阅读", "状态差时读一篇毛选，摘一句能用的判断。", '["读书", "心法"]'),
        make_knowledge(3, "身体维护", "每天拉伸10分钟，散步15分钟。", '["健身"]'),
    ]
    suggestions = agent._build_schedule_suggestions(
        target_date="2026-06-24",
        knowledge=knowledge,
        today_mood=make_mood(energy=3, mood_score=4, stress=8),
        yesterday_mood=None,
        yesterday_schedules=[],
        existing_schedules=[],
    )

    top_contents = [item["content"] for item in suggestions["suggestions"][:2]]
    assert any("拉伸" in content or "读一篇毛选" in content for content in top_contents)
    assert suggestions["context"]["energy_level"] == "low"
    assert all(item["content"] != "建立交易复盘体系" for item in suggestions["suggestions"])


def test_schedule_suggestions_split_big_actions_into_daily_small_steps():
    agent = JieyiAgent()
    knowledge = [
        make_knowledge(
            1,
            "存在主义学习计划",
            "系统学习存在主义：先整理三个核心问题，再阅读一篇原文摘录，然后写一段和自己生活有关的反思，最后沉淀成一条可执行原则。",
            '["存在主义", "读书"]',
        )
    ]

    suggestions = agent._build_schedule_suggestions(
        target_date="2026-06-24",
        knowledge=knowledge,
        today_mood=make_mood(energy=6, mood_score=6, stress=4),
        yesterday_mood=None,
        yesterday_schedules=[],
        existing_schedules=[],
    )

    contents = [item["content"] for item in suggestions["suggestions"]]
    assert "系统学习存在主义" not in contents
    assert contents[:3] == [
        "整理三个核心问题",
        "阅读一篇原文摘录",
        "写一段和自己生活有关的反思",
    ]
    assert all(item["source"] == "knowledge_suggest" for item in suggestions["suggestions"])
    assert suggestions["context"]["candidate_count"] >= 4


def test_schedule_suggestions_avoid_existing_and_limit_low_energy_density():
    agent = JieyiAgent()
    knowledge = [
        make_knowledge(1, "佛学实践", "建立佛学实践体系：先读一篇短文，记录一个让自己起反应的念头，写一句无常观察，整理成复盘问题。", '["佛学", "心法"]'),
        make_knowledge(2, "身体维护", "每天拉伸10分钟，散步15分钟，冥想5分钟。", '["健身", "心法"]'),
    ]

    suggestions = agent._build_schedule_suggestions(
        target_date="2026-06-24",
        knowledge=knowledge,
        today_mood=make_mood(energy=2, mood_score=3, stress=9),
        yesterday_mood=None,
        yesterday_schedules=[],
        existing_schedules=[make_schedule("散步15分钟", is_done=False, date="2026-06-24")],
    )

    contents = [item["content"] for item in suggestions["suggestions"]]
    assert "散步15分钟" not in contents
    assert len(contents) <= 3
    assert suggestions["context"]["daily_capacity"] == 3
    assert any("拉伸" in content or "冥想" in content or "读一篇短文" in content for content in contents[:2])
