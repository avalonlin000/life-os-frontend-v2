from __future__ import annotations

from datetime import datetime
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.jieyi import routes as jieyi_routes
from app.db.connection import RefactorBase
from app.db.models import KnowledgeModel, NoteModel, RealityIssueEntryModel, ScheduleNewModel
from app.services.jieyi.reality_issue_service import RealityIssueService
from app.services.jieyi.reality_issue_schema import RealityIssueSchemaCompatibility
from app.services.jieyi.knowledge_service import KnowledgeService
from app.services.jieyi.note_service import NoteService


def _make_service():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    RefactorBase.metadata.create_all(bind=engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    return RealityIssueService(session_factory=session_factory), session_factory, engine


def _make_client(monkeypatch):
    service, session_factory, engine = _make_service()
    monkeypatch.setattr(jieyi_routes, "reality_issue_service", service)
    monkeypatch.setattr(
        jieyi_routes,
        "knowledge_service",
        KnowledgeService(session_factory=session_factory),
    )
    monkeypatch.setattr(
        jieyi_routes,
        "note_service",
        NoteService(session_factory=session_factory),
    )
    monkeypatch.setattr(
        jieyi_routes,
        "growth_path_service",
        type("MissingGrowthPractice", (), {
            "change_practice_state": staticmethod(
                lambda schedule_id, event_type, note="": {"error": "current_practice_not_found"}
            )
        })(),
    )
    app = FastAPI()
    app.include_router(jieyi_routes.router)
    return TestClient(app), service, session_factory, engine


def test_post_note_preserves_plain_text_without_classifying_or_linking(monkeypatch):
    client, _, session_factory, _ = _make_client(monkeypatch)
    original = "  今天突然想到：先把原始感受留下。\n暂时不判断它属于什么。  "

    response = client.post(
        "/api/notes",
        json={"content": original, "date": "2099-07-22"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": response.json()["id"],
        "title": "记一笔",
        "content": original,
        "date": "2099-07-22",
        "created_at": response.json()["created_at"],
    }
    with session_factory() as db:
        notes = db.query(NoteModel).all()
        assert [(item.title, item.content, item.date) for item in notes] == [
            ("记一笔", original, "2099-07-22")
        ]
        assert db.query(RealityIssueEntryModel).count() == 0


def test_post_note_defaults_date_and_rejects_blank_content(monkeypatch):
    client, _, _, _ = _make_client(monkeypatch)

    saved = client.post(
        "/api/notes",
        json={"title": "临时想法", "content": "保持原样保存"},
    )
    assert saved.status_code == 200
    assert saved.json()["title"] == "临时想法"
    assert saved.json()["content"] == "保持原样保存"
    assert saved.json()["date"] == datetime.now().strftime("%Y-%m-%d")

    blank = client.post("/api/notes", json={"content": "   "})
    assert blank.status_code == 422
    assert blank.json()["detail"] == "note_content_required"


def test_delete_note_removes_existing_note_and_returns_clear_result(monkeypatch):
    client, _, session_factory, _ = _make_client(monkeypatch)
    saved = client.post("/api/notes", json={"content": "清理测试内容", "date": "2099-07-22"})
    note_id = saved.json()["id"]

    response = client.delete(f"/api/notes/{note_id}")

    assert response.status_code == 200
    assert response.json() == {"deleted": True, "id": note_id}
    with session_factory() as db:
        assert db.query(NoteModel).filter(NoteModel.id == note_id).first() is None


def test_delete_note_returns_404_when_note_does_not_exist(monkeypatch):
    client, _, _, _ = _make_client(monkeypatch)

    response = client.delete("/api/notes/404404")

    assert response.status_code == 404
    assert response.json()["detail"] == "note_not_found"


def test_product_knowledge_analysis_excludes_smoke_and_reports_explicit_gap(monkeypatch):
    client, _, session_factory, _ = _make_client(monkeypatch)
    issue = _create_issue(client, "我陷入必须证明自己正确的执念，结果影响了纪律执行")
    with session_factory() as db:
        real = KnowledgeModel(
            id=13,
            title="深度学习 · 执念",
            content="把结果确认和纪律执行分开。",
            source_type="cognitive_asset_candidate",
            source_url="deep-learning:2026-07-19:执念",
            tags='["深度学习", "执念", "promoted"]',
        )
        smoke = KnowledgeModel(
            id=14,
            title="xiaobai-smoke 执念验证",
            content="工程测试内容",
            source_type="manual",
            tags="xiaobai-smoke-test",
        )
        db.add_all([real, smoke])
        db.commit()

    saved = client.put(
        "/api/knowledge/13/profile",
        json={
            "problem": "执念让结果判断干扰纪律执行",
            "method": "把结果确认和纪律执行分开",
            "applicable_conditions": "已经有规则，但因想证明自己正确而偏离规则",
            "boundaries": "不用于替代事实核查，也不代表放弃修正错误",
            "testable_action": "下一次出现争辩冲动时，先按既定规则行动并记录结果",
        },
    )
    assert saved.status_code == 200
    assert saved.json()["knowledge_id"] == 13

    listed = client.get("/api/knowledge").json()
    assert [item["id"] for item in listed] == [13]
    assert client.get("/api/knowledge/14").status_code == 404
    rejected_smoke_link = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/entries",
        json={"kind": "knowledge", "source_type": "knowledge", "source_id": 14},
    )
    assert rejected_smoke_link.status_code == 404
    assert rejected_smoke_link.json()["detail"] == "knowledge_not_found"

    matched = client.get(
        f"/api/jieyi/reality-issues/{issue['id']}/knowledge-analysis"
    )
    assert matched.status_code == 200
    payload = matched.json()
    assert payload["status"] == "ready"
    assert payload["analysis_id"]
    assert payload["issue_id"] == issue["id"]
    assert payload["knowledge_gap"] is None
    assert payload["conflicts"] == []
    assert payload["unknowns"] == []
    assert payload["matches"][0] == {
        "knowledge_id": 13,
        "title": "深度学习 · 执念",
        "source_type": "cognitive_asset_candidate",
        "source_url": "deep-learning:2026-07-19:执念",
        "relevance_reason": "课题与知识共同涉及：执念",
        "problem": "执念让结果判断干扰纪律执行",
        "method": "把结果确认和纪律执行分开",
        "applicable_conditions": "已经有规则，但因想证明自己正确而偏离规则",
        "boundary": "不用于替代事实核查，也不代表放弃修正错误",
        "verification_action": "下一次出现争辩冲动时，先按既定规则行动并记录结果",
    }

    missing_issue = _create_issue(client, "最近睡眠混乱，需要恢复稳定作息")
    missing = client.get(
        f"/api/jieyi/reality-issues/{missing_issue['id']}/knowledge-analysis"
    ).json()
    assert missing["status"] == "knowledge_gap"
    assert missing["matches"] == []
    assert missing["knowledge_gap"]["status"] == "knowledge_gap"
    assert "私人知识" in missing["knowledge_gap"]["message"]


def test_feedback_updates_the_practiced_knowledge_method_and_persists_a_version(monkeypatch):
    client, _, session_factory, _ = _make_client(monkeypatch)
    issue = _create_issue(client, "我陷入执念，想把结果判断和纪律执行分开")
    with session_factory() as db:
        db.add(KnowledgeModel(
            id=13,
            title="深度学习 · 执念",
            content="把结果确认和纪律执行分开。",
            source_type="cognitive_asset_candidate",
            source_url="deep-learning:2026-07-19:执念",
            tags='["执念"]',
        ))
        db.commit()
    client.put("/api/knowledge/13/profile", json={
        "problem": "执念让结果判断干扰纪律执行",
        "method": "把结果确认和纪律执行分开",
        "applicable_conditions": "已经有规则但想证明自己正确",
        "boundaries": "不替代事实核查",
        "testable_action": "先按规则行动并记录结果",
    })
    analysis = client.get(
        f"/api/jieyi/reality-issues/{issue['id']}/knowledge-analysis"
    ).json()

    first_method = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/knowledge-analysis/method-candidate",
        json={
            "content": "出现争辩冲动时先执行既定规则",
            "analysis_id": analysis["analysis_id"],
        },
    ).json()
    assert first_method["knowledge_sources"][0]["knowledge_id"] == 13
    client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/entries/{first_method['id']}/confirm"
    )
    practice = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/practices",
        json={
            "date": "2099-07-22",
            "content": "今天按既定规则完成一次行动",
            "method_entry_id": first_method["id"],
        },
    ).json()["practices"][0]

    second_method = _create_confirmed_method(
        client, issue["id"], "后来提出但没有用于这次实践的另一方法"
    )
    feedback_payload = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/practices/{practice['id']}/feedback",
        json={"content": "冲动仍在，但我没有偏离既定规则"},
    ).json()
    update = feedback_payload["method_updates"][0]
    assert "出现争辩冲动时先执行既定规则" in update["content"]
    assert second_method["content"] not in update["content"]

    confirmed = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/entries/{update['id']}/confirm"
    )
    assert confirmed.status_code == 200
    promoted = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/entries/{update['id']}/promote-method-version"
    )
    assert promoted.status_code == 200
    reread = client.get(f"/api/jieyi/reality-issues/{issue['id']}").json()
    version = reread["personal_method_versions"][0]
    assert version == {
        "id": version["id"],
        "issue_id": issue["id"],
        "knowledge_ids": [13],
        "method_entry_id": first_method["id"],
        "update_entry_id": update["id"],
        "evidence_feedback_id": feedback_payload["feedback"][0]["id"],
        "content": update["content"],
        "applicable_conditions": "已经有规则但想证明自己正确",
        "boundary": "不替代事实核查",
        "status": "confirmed",
        "created_at": version["created_at"],
    }


def test_method_version_rejects_an_update_without_knowledge_evidence(monkeypatch):
    client, _, _, _ = _make_client(monkeypatch)
    issue = _create_issue(client, "一个尚未调用私人知识的课题")
    method = _create_confirmed_method(client, issue["id"], "普通手写方法")
    practice = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/practices",
        json={
            "date": "2099-07-22",
            "content": "执行普通手写方法",
            "method_entry_id": method["id"],
        },
    ).json()["practices"][0]
    feedback = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/practices/{practice['id']}/feedback",
        json={"content": "完成了，但没有知识来源可供验证"},
    ).json()
    update = feedback["method_updates"][0]
    client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/entries/{update['id']}/confirm"
    )

    promoted = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/entries/{update['id']}/promote-method-version"
    )
    assert promoted.status_code == 409
    assert promoted.json()["detail"] == "method_update_missing_knowledge_source"


def test_unstructured_knowledge_is_reported_unavailable_and_cannot_create_a_method(monkeypatch):
    client, _, session_factory, _ = _make_client(monkeypatch)
    issue = _create_issue(client, "执念影响纪律执行")
    with session_factory() as db:
        db.add(KnowledgeModel(
            id=13,
            title="深度学习 · 执念",
            content="把结果确认和纪律执行分开。",
            source_type="cognitive_asset_candidate",
            tags='["执念"]',
        ))
        db.commit()

    missing_profile = client.get("/api/knowledge/13/profile")
    assert missing_profile.status_code == 404
    assert missing_profile.json()["detail"] == "knowledge_profile_unavailable"

    analysis = client.get(
        f"/api/jieyi/reality-issues/{issue['id']}/knowledge-analysis"
    ).json()
    assert analysis["status"] == "knowledge_unavailable"
    assert analysis["matches"] == []
    assert analysis["knowledge_gap"]["status"] == "knowledge_unavailable"

    method = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/knowledge-analysis/method-candidate",
        json={"analysis_id": analysis["analysis_id"]},
    )
    assert method.status_code == 409
    assert method.json()["detail"] == "knowledge_analysis_not_ready"


def _create_issue(client: TestClient, statement: str = "最近睡眠混乱，希望恢复稳定作息") -> dict:
    response = client.post("/api/jieyi/reality-issues", json={"statement": statement})
    assert response.status_code == 200
    return response.json()


def _create_confirmed_method(client: TestClient, issue_id: int, content: str = "先做最小实践") -> dict:
    candidate = client.post(
        f"/api/jieyi/reality-issues/{issue_id}/entries",
        json={"kind": "method", "content": content},
    ).json()
    response = client.post(
        f"/api/jieyi/reality-issues/{issue_id}/entries/{candidate['id']}/confirm"
    )
    assert response.status_code == 200
    return response.json()


def test_create_first_issue_focuses_it_and_focus_switch_is_explicit(monkeypatch):
    client, _, _, _ = _make_client(monkeypatch)

    first = _create_issue(client)
    updated = client.patch(
        f"/api/jieyi/reality-issues/{first['id']}",
        json={"desired_change": "连续两周形成可持续的睡眠节律", "primary_contradiction": "晚间刺激与休息需要冲突"},
    )
    assert updated.status_code == 200
    assert updated.json()["desired_change"] == "连续两周形成可持续的睡眠节律"
    second = _create_issue(client, "学习输入很多，但没有进入现实实践")

    assert first["is_focus"] is True
    assert first["facts"] == []
    assert first["methods"] == []
    assert first["practices"] == []
    assert second["is_focus"] is False

    switched = client.post(f"/api/jieyi/reality-issues/{second['id']}/focus")
    assert switched.status_code == 200
    assert switched.json()["is_focus"] is True
    assert client.get("/api/jieyi/reality-issues/focus").json()["id"] == second["id"]

    listed = client.get("/api/jieyi/reality-issues").json()
    assert [item["is_focus"] for item in listed] == [False, True]


def test_typed_entries_preserve_source_and_require_candidate_confirmation(monkeypatch):
    client, _, session_factory, _ = _make_client(monkeypatch)
    issue = _create_issue(client)

    with session_factory() as db:
        knowledge = KnowledgeModel(
            title="睡眠规律材料",
            content="固定起床时间比强迫入睡更可控。",
            source_type="manual",
            source_url="local:test-source",
        )
        db.add(knowledge)
        db.commit()
        db.refresh(knowledge)
        knowledge_id = knowledge.id

    fact = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/entries",
        json={"kind": "fact", "content": "最近一周有五天凌晨两点后入睡", "source_type": "observation"},
    ).json()
    understanding = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/entries",
        json={"kind": "understanding", "content": "晚间刺激可能是主要矛盾", "source_type": "agent"},
    ).json()
    knowledge = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/entries",
        json={"kind": "knowledge", "source_type": "knowledge", "source_id": knowledge_id},
    ).json()
    question = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/entries",
        json={"kind": "question", "content": "咖啡因是否影响了入睡？"},
    ).json()
    method = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/entries",
        json={"kind": "method", "content": "连续七天固定起床时间", "source_type": "user_proposal"},
    ).json()

    assert fact["status"] == "observed"
    assert understanding["status"] == "candidate"
    assert knowledge["status"] == "observed"
    assert knowledge["source_id"] == knowledge_id
    assert knowledge["content"] == "固定起床时间比强迫入睡更可控。"

    confirmed = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/entries/{understanding['id']}/confirm"
    )
    rejected = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/entries/{question['id']}/reject"
    )
    confirmed_method = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/entries/{method['id']}/confirm"
    )
    assert confirmed.status_code == 200
    assert confirmed.json()["status"] == "confirmed"
    assert confirmed.json()["confirmed_at"]
    assert rejected.status_code == 200
    assert rejected.json()["status"] == "rejected"
    assert confirmed_method.status_code == 200
    assert confirmed_method.json()["status"] == "confirmed"

    aggregate = client.get("/api/jieyi/reality-issues/focus").json()
    assert aggregate["understandings"][0]["status"] == "confirmed"
    assert aggregate["questions"][0]["status"] == "rejected"
    assert aggregate["methods"][0]["status"] == "confirmed"


def test_linked_practice_keeps_issue_through_events_and_feedback(monkeypatch):
    client, _, _, _ = _make_client(monkeypatch)
    issue = _create_issue(client)
    method = _create_confirmed_method(client, issue["id"], "今晚十一点关闭屏幕")

    aggregate = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/practices",
        json={
            "date": "2099-07-21",
            "content": "今晚十一点关闭屏幕",
            "method_entry_id": method["id"],
        },
    ).json()
    practice = aggregate["practices"][0]

    for event_type, expected in (
        ("interrupted", "interrupted"),
        ("returned", "active"),
        ("completed", "completed"),
    ):
        response = client.post(
            f"/api/jieyi/current-practices/{practice['id']}/events",
            json={"event_type": event_type, "note": f"test-{event_type}"},
        )
        assert response.status_code == 200
        changed = response.json()["practice"]
        assert changed["practice_status"] == expected
        assert changed["reality_issue_id"] == issue["id"]

    feedback = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/practices/{practice['id']}/feedback",
        json={"content": "关屏后仍然清醒，但没有继续刷视频", "occurred_at": "2099-07-21T23:30:00"},
    )
    assert feedback.status_code == 200
    refreshed = feedback.json()
    assert refreshed["practices"][0]["reality_issue_id"] == issue["id"]
    assert [event["event_type"] for event in refreshed["practices"][0]["events"]] == [
        "started", "interrupted", "returned", "completed"
    ]
    assert refreshed["feedback"][0]["practice_id"] == practice["id"]
    assert refreshed["feedback"][0]["status"] == "observed"


def test_practice_requires_confirmed_method_from_same_issue_and_reads_it_back(monkeypatch):
    client, _, _, _ = _make_client(monkeypatch)
    issue = _create_issue(client)
    other = _create_issue(client, "另一个现实课题")
    candidate = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/entries",
        json={"kind": "method", "content": "固定十一点关屏"},
    ).json()
    other_method = client.post(
        f"/api/jieyi/reality-issues/{other['id']}/entries",
        json={"kind": "method", "content": "另一个课题的方法"},
    ).json()
    client.post(f"/api/jieyi/reality-issues/{other['id']}/entries/{other_method['id']}/confirm")

    rejected_missing = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/practices",
        json={"date": "2099-07-21", "content": "今晚关屏"},
    )

    rejected_candidate = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/practices",
        json={"date": "2099-07-21", "content": "今晚关屏", "method_entry_id": candidate["id"]},
    )
    rejected_other = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/practices",
        json={"date": "2099-07-21", "content": "今晚关屏", "method_entry_id": other_method["id"]},
    )
    assert rejected_missing.status_code == 422
    assert rejected_candidate.status_code == 409
    assert rejected_other.status_code == 404

    client.post(f"/api/jieyi/reality-issues/{issue['id']}/entries/{candidate['id']}/confirm")
    created = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/practices",
        json={"date": "2099-07-21", "content": "今晚关屏", "method_entry_id": candidate["id"]},
    )
    assert created.status_code == 200
    assert created.json()["practices"][0]["method_entry_id"] == candidate["id"]


def test_feedback_generates_traceable_honest_update_candidates_once(monkeypatch):
    client, service, session_factory, _ = _make_client(monkeypatch)
    issue = _create_issue(client)
    ids = {}
    for kind, content in (
        ("understanding", "晚间持续刺激可能在维持失眠"),
        ("method", "连续七天十一点关闭屏幕"),
    ):
        entry = client.post(
            f"/api/jieyi/reality-issues/{issue['id']}/entries",
            json={"kind": kind, "content": content},
        ).json()
        client.post(f"/api/jieyi/reality-issues/{issue['id']}/entries/{entry['id']}/confirm")
        ids[kind] = entry["id"]
    aggregate = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/practices",
        json={
            "date": "2099-07-21",
            "content": "十一点关屏",
            "method_entry_id": ids["method"],
        },
    ).json()
    practice_id = aggregate["practices"][0]["id"]
    refreshed = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/practices/{practice_id}/feedback",
        json={"content": "关屏后仍清醒，但没有继续刷视频"},
    ).json()
    feedback = refreshed["feedback"][0]

    for group in ("worldview_updates", "method_updates"):
        assert len(refreshed[group]) == 1
        candidate = refreshed[group][0]
        assert candidate["status"] == "candidate"
        assert candidate["practice_id"] == practice_id
        assert candidate["source_type"] == "practice_feedback"
        assert candidate["source_id"] == feedback["id"]
        assert "待" in candidate["content"]
        assert "关屏后仍清醒" in candidate["content"]

    # 即使内部生成逻辑因重试再次执行，同一反馈也不能产生重复候选。
    with session_factory() as db:
        repository = __import__(
            "app.services.jieyi.reality_issue_repository", fromlist=["RealityIssueRepository"]
        ).RealityIssueRepository(db)
        feedback_model = repository.get_entry(issue["id"], feedback["id"])
        service._ensure_feedback_candidates(repository, issue["id"], practice_id, feedback_model)
        repository.commit()
    reread = client.get("/api/jieyi/reality-issues/focus").json()
    assert len(reread["worldview_updates"]) == 1
    assert len(reread["method_updates"]) == 1


def test_practice_state_machine_rejects_illegal_transitions_and_is_idempotent(monkeypatch):
    client, _, _, _ = _make_client(monkeypatch)
    issue = _create_issue(client)
    method = _create_confirmed_method(client, issue["id"])
    practice = client.post(
        f"/api/jieyi/reality-issues/{issue['id']}/practices",
        json={
            "date": "2099-07-21",
            "content": "写一句观察",
            "method_entry_id": method["id"],
        },
    ).json()["practices"][0]

    illegal_return = client.post(
        f"/api/jieyi/current-practices/{practice['id']}/events",
        json={"event_type": "returned"},
    )
    assert illegal_return.status_code == 409

    first = client.post(
        f"/api/jieyi/current-practices/{practice['id']}/events",
        json={"event_type": "interrupted", "note": "精力不足"},
    )
    repeated = client.post(
        f"/api/jieyi/current-practices/{practice['id']}/events",
        json={"event_type": "interrupted", "note": "重复请求"},
    )
    assert first.status_code == repeated.status_code == 200
    aggregate = client.get("/api/jieyi/reality-issues/focus").json()
    assert [event["event_type"] for event in aggregate["practices"][0]["events"]] == [
        "started", "interrupted"
    ]

    client.post(
        f"/api/jieyi/current-practices/{practice['id']}/events",
        json={"event_type": "returned"},
    )
    client.post(
        f"/api/jieyi/current-practices/{practice['id']}/events",
        json={"event_type": "completed"},
    )
    impossible = client.post(
        f"/api/jieyi/current-practices/{practice['id']}/events",
        json={"event_type": "interrupted"},
    )
    assert impossible.status_code == 409


def test_worldview_and_method_updates_keep_confirmed_history(monkeypatch):
    client, _, _, _ = _make_client(monkeypatch)
    issue = _create_issue(client)

    created = []
    for kind, content in (
        ("worldview_update", "睡眠问题不只是意志问题"),
        ("worldview_update", "睡眠问题首先是环境与节律问题，不只是意志问题"),
        ("method_update", "下一轮先固定起床时间，再调整入睡时间"),
    ):
        entry = client.post(
            f"/api/jieyi/reality-issues/{issue['id']}/entries",
            json={"kind": kind, "content": content, "source_type": "practice_feedback"},
        ).json()
        assert entry["status"] == "candidate"
        confirmed = client.post(
            f"/api/jieyi/reality-issues/{issue['id']}/entries/{entry['id']}/confirm"
        ).json()
        created.append(confirmed)

    aggregate = client.get("/api/jieyi/reality-issues/focus").json()
    assert aggregate["worldview_updates"] == created[:2]
    assert aggregate["method_updates"] == [created[2]]


def test_schema_compatibility_only_adds_relation_and_preserves_old_schedule():
    engine = create_engine("sqlite://", poolclass=StaticPool)
    with engine.begin() as connection:
        connection.execute(text("""
            CREATE TABLE schedules_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date VARCHAR NOT NULL,
                content VARCHAR NOT NULL,
                source VARCHAR NOT NULL,
                priority INTEGER,
                category VARCHAR,
                is_done BOOLEAN,
                knowledge_id INTEGER,
                stage_goal_id INTEGER,
                practice_status VARCHAR NOT NULL DEFAULT 'active',
                created_at VARCHAR,
                updated_at VARCHAR
            )
        """))
        connection.execute(text("""
            INSERT INTO schedules_new
                (date, content, source, is_done, practice_status, created_at, updated_at)
            VALUES
                ('2099-07-20', 'legacy-test-schedule', 'user_add', 0, 'active', '2099-07-20', '2099-07-20')
        """))

    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    with session_factory() as db:
        RealityIssueSchemaCompatibility.ensure(db)

    migrated_columns = {column["name"] for column in inspect(engine).get_columns("schedules_new")}
    assert {"reality_issue_id", "method_entry_id"} <= migrated_columns
    assert {
        "knowledge_profiles",
        "reality_method_sources",
        "personal_method_versions",
    } <= set(inspect(engine).get_table_names())
    with session_factory() as db:
        legacy = db.query(ScheduleNewModel).filter(ScheduleNewModel.content == "legacy-test-schedule").one()
        assert legacy.reality_issue_id is None
        assert legacy.method_entry_id is None
        assert legacy.practice_status == "active"
