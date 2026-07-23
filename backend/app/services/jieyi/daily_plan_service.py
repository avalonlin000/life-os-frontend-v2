"""结衣每日计划服务。

产品数据库是正式正源；旧日课 JSON 只作为兼容读取和显式刷新导入来源。
"""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any

from app.config import get_settings
from app.db.connection import RefactorSessionLocal
from app.db.models import DailyPlanModel, ScheduleNewModel
from app.db.repositories.refactored import ScheduleNewRepository


def _json_array(value: Any) -> list:
    if isinstance(value, list):
        return value
    if not value:
        return []
    try:
        parsed = json.loads(value)
    except (TypeError, json.JSONDecodeError):
        return []
    return parsed if isinstance(parsed, list) else []


def normalize_plan(data: dict[str, Any], *, date: str, source: str, status: str = "available") -> dict[str, Any]:
    """Return one stable API shape without claiming compatibility data is DB data."""
    return {
        "date": date,
        "learn": _json_array(data.get("learn")),
        "review": _json_array(data.get("review")),
        "doTasks": _json_array(data.get("doTasks", data.get("do_tasks"))),
        "suggestion": str(data.get("suggestion") or ""),
        "source": source,
        "status": status,
    }


class DailyPlanService:
    @staticmethod
    def _legacy_path() -> Path:
        return Path(get_settings().JIEYI_LEGACY_DAILY_PLAN_PATH)

    @classmethod
    def _read_legacy(cls, date: str) -> dict[str, Any] | None:
        path = cls._legacy_path()
        if not path.is_file():
            return None
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return None
        if not isinstance(data, dict) or data.get("date") != date:
            return None
        return data

    @classmethod
    def get_by_date(cls, date: str) -> dict[str, Any]:
        """Read DB first, then use the old JSON only as an explicit compatibility fallback."""
        db = RefactorSessionLocal()
        try:
            row = db.query(DailyPlanModel).filter(DailyPlanModel.date == date).first()
            if row:
                return normalize_plan(
                    {
                        "learn": row.learn,
                        "review": row.review,
                        "do_tasks": row.do_tasks,
                        "suggestion": row.suggestion,
                    },
                    date=date,
                    source="product_db",
                )
        finally:
            db.close()

        legacy = cls._read_legacy(date)
        if legacy is not None:
            return normalize_plan(legacy, date=date, source="legacy_file", status="compatibility")

        return normalize_plan({}, date=date, source="none", status="empty")

    @staticmethod
    def _sync_actions_in_session(db, date: str, do_tasks: list[Any]) -> int:
        ScheduleNewRepository.delete_by_date_source(db, date, "daily_plan")
        synced = 0
        for index, task in enumerate(do_tasks, start=1):
            content = task.strip() if isinstance(task, str) else ""
            if not content:
                continue
            db.add(ScheduleNewModel(
                date=date,
                content=content,
                source="daily_plan",
                priority=index,
                category="daily_plan",
            ))
            synced += 1
        return synced

    @classmethod
    def sync_actions(cls, data: dict[str, Any]) -> dict[str, Any]:
        db = RefactorSessionLocal()
        try:
            date = data["date"]
            synced = cls._sync_actions_in_session(db, date, data.get("doTasks", []))
            db.commit()
            return {"ok": True, "date": date, "synced": synced}
        finally:
            db.close()

    @classmethod
    def write_plan(cls, data: dict[str, Any]) -> dict[str, Any]:
        """Upsert one product plan and keep its action projection in the same transaction."""
        db = RefactorSessionLocal()
        try:
            date = data["date"]
            row = db.query(DailyPlanModel).filter(DailyPlanModel.date == date).first()
            values = {
                "learn": json.dumps(data.get("learn", []), ensure_ascii=False),
                "review": json.dumps(data.get("review", []), ensure_ascii=False),
                "do_tasks": json.dumps(data.get("doTasks", []), ensure_ascii=False),
                "suggestion": data.get("suggestion", ""),
            }
            if row is None:
                db.add(DailyPlanModel(date=date, **values))
            else:
                for key, value in values.items():
                    setattr(row, key, value)

            synced = cls._sync_actions_in_session(db, date, data.get("doTasks", []))
            db.commit()
            return {"ok": True, "plan": data, "synced_schedules": synced}
        finally:
            db.close()

    @classmethod
    def refresh_from_legacy(cls, date: str) -> dict[str, Any]:
        """Explicitly import the matching legacy plan into the product DB and sync actions."""
        legacy = cls._read_legacy(date)
        if legacy is None:
            return {
                "ok": True,
                "date": date,
                "message": "课程表尚未生成，等待外部日课文件产生",
                "source": "none",
                "synced_schedules": 0,
            }

        plan = normalize_plan(legacy, date=date, source="product_db", status="available")
        db = RefactorSessionLocal()
        try:
            row = db.query(DailyPlanModel).filter(DailyPlanModel.date == date).first()
            values = {
                "learn": json.dumps(plan["learn"], ensure_ascii=False),
                "review": json.dumps(plan["review"], ensure_ascii=False),
                "do_tasks": json.dumps(plan["doTasks"], ensure_ascii=False),
                "suggestion": plan["suggestion"],
            }
            if row is None:
                db.add(DailyPlanModel(date=date, **values))
            else:
                for key, value in values.items():
                    setattr(row, key, value)

            synced = cls._sync_actions_in_session(db, date, plan["doTasks"])
            db.commit()
            return {
                "ok": True,
                "date": date,
                "message": "课程表已导入结衣产品并同步行动",
                "source": "product_db",
                "synced_schedules": synced,
                "refreshed_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            }
        finally:
            db.close()
