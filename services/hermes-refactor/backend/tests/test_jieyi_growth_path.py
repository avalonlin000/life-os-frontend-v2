from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.connection import RefactorBase
from app.db import models  # noqa: F401 - register tables
from app.services.jieyi.growth_path_service import GrowthPathService


def make_service() -> GrowthPathService:
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    RefactorBase.metadata.create_all(bind=engine)
    return GrowthPathService(sessionmaker(bind=engine, autoflush=False, autocommit=False))


def test_growth_path_keeps_practice_linked_through_interruption_and_return():
    service = make_service()

    domain = service.create_domain("认知成长")
    goal = service.create_stage_goal(domain["id"], "恢复每周稳定输入与输出")
    practice = service.create_practice(goal["id"], "2026-07-20", "写下一条真实观察")

    interrupted = service.change_practice_state(practice["id"], "interrupted", "今天精力不足")
    returned = service.change_practice_state(practice["id"], "returned", "缩小到只写一句")
    completed = service.change_practice_state(practice["id"], "completed", "已完成一句观察")
    growth_map = service.get_map("2026-07-20")

    assert interrupted["practice"]["practice_status"] == "interrupted"
    assert returned["practice"]["practice_status"] == "active"
    assert completed["practice"]["practice_status"] == "completed"
    assert completed["practice"]["is_done"] is True

    mapped_goal = growth_map["domains"][0]["stage_goals"][0]
    mapped_practice = mapped_goal["current_practices"][0]
    assert mapped_goal["content"] == "恢复每周稳定输入与输出"
    assert mapped_practice["stage_goal_id"] == goal["id"]
    assert [event["event_type"] for event in mapped_practice["events"]] == [
        "started",
        "interrupted",
        "returned",
        "completed",
    ]


def test_growth_path_rejects_orphan_stage_goal_and_practice():
    service = make_service()

    assert service.create_stage_goal(999, "不存在的领域") == {"error": "growth_domain_not_found"}
    assert service.create_practice(999, "2026-07-20", "不存在的实践") == {"error": "stage_goal_not_found"}
