import os

os.environ.setdefault("ORIGINAL_DB_PATH", "/tmp/nonexistent-original.db")
os.environ.setdefault("REFACTOR_DB_PATH", "/tmp/nonexistent-refactor.db")

from types import SimpleNamespace

from app.services.jieyi.daily_plan_service import DailyPlanService


class FakeQuery:
    def __init__(self, existing=None):
        self.existing = existing

    def filter(self, *args, **kwargs):
        return self

    def first(self):
        return self.existing


class FakeDB:
    def __init__(self, existing=None):
        self.existing = existing
        self.added = []
        self.deleted = False
        self.commits = 0

    def query(self, model):
        return FakeQuery(self.existing)

    def add(self, obj):
        self.added.append(obj)

    def commit(self):
        self.commits += 1

    def close(self):
        pass


def test_sync_daily_plan_to_schedule_replaces_daily_plan_rows_with_full_do_tasks(monkeypatch):
    fake_db = FakeDB()
    monkeypatch.setattr("app.services.jieyi.daily_plan_service.RefactorSessionLocal", lambda: fake_db)

    deleted = []

    def fake_delete_by_date_source(db, date, source):
        deleted.append((db, date, source))

    monkeypatch.setattr("app.services.jieyi.daily_plan_service.ScheduleNewRepository.delete_by_date_source", fake_delete_by_date_source)

    added = fake_db.added

    data = {
        "date": "2026-06-24",
        "doTasks": [
            "冥想 5min（闭眼→腹式呼吸→想象自己是一座山，有念头飘来就像云飘过山）",
            "散步 15min（出门只走一圈，不追求步数）",
            "",
        ],
    }

    result = DailyPlanService.sync_actions(data)

    assert result == {"ok": True, "date": "2026-06-24", "synced": 2}
    assert deleted == [(fake_db, "2026-06-24", "daily_plan")]
    assert [item.content for item in added] == data["doTasks"][:2]
    assert all(item.source == "daily_plan" for item in added)
    assert [item.priority for item in added] == [1, 2]
    assert all(item.category == "daily_plan" for item in added)
    assert fake_db.commits == 1


def test_write_next_plan_syncs_full_do_tasks_after_upsert(monkeypatch):
    fake_db = FakeDB(existing=None)
    monkeypatch.setattr("app.services.jieyi.daily_plan_service.RefactorSessionLocal", lambda: fake_db)

    synced = []
    monkeypatch.setattr(
        DailyPlanService,
        "_sync_actions_in_session",
        lambda db, date, do_tasks: synced.append((db, date, do_tasks)) or 2,
    )

    data = {
        "date": "2026-06-25",
        "learn": [],
        "review": [],
        "doTasks": ["冥想 5min（完整引导）", "拉伸 10min（完整引导）"],
        "suggestion": "低密度推进",
    }

    result = DailyPlanService.write_plan(data)

    assert result["ok"] is True
    assert result["synced_schedules"] == 2
    assert synced == [(fake_db, "2026-06-25", data["doTasks"])]
    assert fake_db.commits == 1
