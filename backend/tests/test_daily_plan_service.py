import json
from types import SimpleNamespace

from app.services.jieyi.daily_plan_service import DailyPlanService


class FakeQuery:
    def __init__(self, row):
        self.row = row

    def filter(self, *args, **kwargs):
        return self

    def first(self):
        return self.row


class FakeDB:
    def __init__(self, row=None):
        self.row = row

    def query(self, model):
        return FakeQuery(self.row)

    def close(self):
        pass


def test_daily_plan_reads_product_db_before_legacy_file(monkeypatch, tmp_path):
    legacy = tmp_path / "daily_plan.json"
    legacy.write_text(json.dumps({
        "date": "2026-07-18",
        "learn": [{"title": "旧文件"}],
        "review": [],
        "doTasks": [],
    }), encoding="utf-8")
    row = SimpleNamespace(
        date="2026-07-18",
        learn=json.dumps([{"title": "产品数据库"}], ensure_ascii=False),
        review="[]",
        do_tasks="[]",
        suggestion="数据库优先",
    )
    monkeypatch.setattr(DailyPlanService, "_legacy_path", staticmethod(lambda: legacy))
    monkeypatch.setattr("app.services.jieyi.daily_plan_service.RefactorSessionLocal", lambda: FakeDB(row))

    result = DailyPlanService.get_by_date("2026-07-18")

    assert result["source"] == "product_db"
    assert result["status"] == "available"
    assert result["learn"][0]["title"] == "产品数据库"


def test_daily_plan_uses_legacy_file_only_as_explicit_compatibility_fallback(monkeypatch, tmp_path):
    legacy = tmp_path / "daily_plan.json"
    legacy.write_text(json.dumps({
        "date": "2026-07-18",
        "learn": [{"title": "外部日课"}],
        "review": [],
        "doTasks": ["散步 10 分钟"],
    }), encoding="utf-8")
    monkeypatch.setattr(DailyPlanService, "_legacy_path", staticmethod(lambda: legacy))
    monkeypatch.setattr("app.services.jieyi.daily_plan_service.RefactorSessionLocal", lambda: FakeDB())

    result = DailyPlanService.get_by_date("2026-07-18")

    assert result["source"] == "legacy_file"
    assert result["status"] == "compatibility"
    assert result["doTasks"] == ["散步 10 分钟"]
