"""
仓库层 — 新增表读写封装
"""
from typing import Optional
from sqlalchemy.orm import Session
from app.db.models import (
    TradeModel, ActivityModel, ScheduleNewModel, MoodModel,
    KnowledgeModel, WisdomModel, DailyReviewModel, NoteModel, GoalModel,
    GrowthDomainModel, StageGoalModel, PracticeEventModel, KnowledgeProfileModel,
)


class TradeRepository:
    @staticmethod
    def list_all(db: Session, game: Optional[str] = None) -> list[TradeModel]:
        q = db.query(TradeModel).order_by(TradeModel.date.desc())
        if game:
            q = q.filter(TradeModel.game == game)
        return q.all()

    @staticmethod
    def get_by_id(db: Session, trade_id: int) -> Optional[TradeModel]:
        return db.query(TradeModel).filter(TradeModel.trade_id == trade_id).first()

    @staticmethod
    def list_by_ids(db: Session, trade_ids: list[int]) -> list[TradeModel]:
        if not trade_ids:
            return []
        return db.query(TradeModel).filter(TradeModel.trade_id.in_(trade_ids)).all()

    @staticmethod
    def list_between(db: Session, start_date: str, end_date: str) -> list[TradeModel]:
        return db.query(TradeModel).filter(
            TradeModel.date >= start_date,
            TradeModel.date <= end_date,
        ).all()

    @staticmethod
    def create(db: Session, data: dict) -> TradeModel:
        obj = TradeModel(**data)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def update(db: Session, trade_id: int, data: dict) -> Optional[TradeModel]:
        obj = db.query(TradeModel).filter(TradeModel.trade_id == trade_id).first()
        if not obj:
            return None
        for k, v in data.items():
            setattr(obj, k, v)
        db.commit()
        db.refresh(obj)
        return obj


class ActivityRepository:
    @staticmethod
    def list_by_date(db: Session, date: str) -> list[ActivityModel]:
        return db.query(ActivityModel).filter(
            ActivityModel.start_time.like(f"{date}%")
        ).order_by(ActivityModel.start_time).all()

    @staticmethod
    def get_by_id(db: Session, activity_id: int) -> Optional[ActivityModel]:
        return db.query(ActivityModel).filter(ActivityModel.id == activity_id).first()

    @staticmethod
    def create(db: Session, data: dict) -> ActivityModel:
        obj = ActivityModel(**data)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def update(db: Session, activity_id: int, data: dict) -> Optional[ActivityModel]:
        obj = db.query(ActivityModel).filter(ActivityModel.id == activity_id).first()
        if not obj:
            return None
        for k, v in data.items():
            setattr(obj, k, v)
        db.commit()
        db.refresh(obj)
        return obj


class ScheduleNewRepository:
    @staticmethod
    def list_by_date(db: Session, date: str) -> list[ScheduleNewModel]:
        return db.query(ScheduleNewModel).filter(
            ScheduleNewModel.date == date
        ).order_by(ScheduleNewModel.priority).all()

    @staticmethod
    def list_by_date_source(db: Session, date: str, source: str) -> list[ScheduleNewModel]:
        return db.query(ScheduleNewModel).filter(
            ScheduleNewModel.date == date,
            ScheduleNewModel.source == source,
        ).all()

    @staticmethod
    def list_by_date_excluding_source(db: Session, date: str, source: str, limit: int = 12) -> list[ScheduleNewModel]:
        return db.query(ScheduleNewModel).filter(
            ScheduleNewModel.date == date,
            ScheduleNewModel.source != source,
        ).order_by(
            ScheduleNewModel.priority.asc().nullslast(),
            ScheduleNewModel.created_at.asc(),
        ).limit(limit).all()

    @staticmethod
    def get_by_date_source_content(db: Session, date: str, source: str, content: str) -> Optional[ScheduleNewModel]:
        return db.query(ScheduleNewModel).filter(
            ScheduleNewModel.date == date,
            ScheduleNewModel.source == source,
            ScheduleNewModel.content == content,
        ).first()

    @staticmethod
    def delete_by_date_source(db: Session, date: str, source: str) -> int:
        result = db.query(ScheduleNewModel).filter(
            ScheduleNewModel.date == date,
            ScheduleNewModel.source == source,
        ).delete(synchronize_session=False)
        db.flush()
        return result

    @staticmethod
    def create(db: Session, data: dict) -> ScheduleNewModel:
        obj = ScheduleNewModel(**data)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def update(db: Session, schedule_id: int, data: dict) -> Optional[ScheduleNewModel]:
        obj = db.query(ScheduleNewModel).filter(ScheduleNewModel.id == schedule_id).first()
        if not obj:
            return None
        for k, v in data.items():
            setattr(obj, k, v)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def get_by_id(db: Session, schedule_id: int) -> Optional[ScheduleNewModel]:
        return db.query(ScheduleNewModel).filter(ScheduleNewModel.id == schedule_id).first()

    @staticmethod
    def list_unfinished_until(db: Session, date: str, limit: int = 20) -> list[ScheduleNewModel]:
        return db.query(ScheduleNewModel).filter(
            ScheduleNewModel.is_done == False,
            ScheduleNewModel.date <= date,
        ).limit(limit).all()

    @staticmethod
    def list_completed_by_source(db: Session, source: str, limit: int = 50) -> list[ScheduleNewModel]:
        return db.query(ScheduleNewModel).filter(
            ScheduleNewModel.source == source,
            ScheduleNewModel.is_done.is_(True),
        ).order_by(
            ScheduleNewModel.date.desc(),
            ScheduleNewModel.updated_at.desc(),
        ).limit(limit).all()


class GrowthDomainRepository:
    @staticmethod
    def list_active(db: Session) -> list[GrowthDomainModel]:
        return db.query(GrowthDomainModel).filter(
            GrowthDomainModel.status == "active"
        ).order_by(GrowthDomainModel.created_at.asc(), GrowthDomainModel.id.asc()).all()

    @staticmethod
    def get_by_id(db: Session, domain_id: int) -> Optional[GrowthDomainModel]:
        return db.query(GrowthDomainModel).filter(GrowthDomainModel.id == domain_id).first()

    @staticmethod
    def create(db: Session, data: dict) -> GrowthDomainModel:
        obj = GrowthDomainModel(**data)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj


class StageGoalRepository:
    @staticmethod
    def list_active(db: Session, domain_id: Optional[int] = None) -> list[StageGoalModel]:
        query = db.query(StageGoalModel).filter(StageGoalModel.status == "active")
        if domain_id is not None:
            query = query.filter(StageGoalModel.domain_id == domain_id)
        return query.order_by(StageGoalModel.created_at.asc(), StageGoalModel.id.asc()).all()

    @staticmethod
    def get_by_id(db: Session, stage_goal_id: int) -> Optional[StageGoalModel]:
        return db.query(StageGoalModel).filter(StageGoalModel.id == stage_goal_id).first()

    @staticmethod
    def create(db: Session, data: dict) -> StageGoalModel:
        obj = StageGoalModel(**data)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj


class PracticeEventRepository:
    @staticmethod
    def list_by_schedule(db: Session, schedule_id: int) -> list[PracticeEventModel]:
        return db.query(PracticeEventModel).filter(
            PracticeEventModel.schedule_id == schedule_id
        ).order_by(PracticeEventModel.created_at.asc(), PracticeEventModel.id.asc()).all()

    @staticmethod
    def create(db: Session, data: dict) -> PracticeEventModel:
        obj = PracticeEventModel(**data)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj


class MoodRepository:
    @staticmethod
    def get_by_date(db: Session, date: str) -> Optional[MoodModel]:
        return db.query(MoodModel).filter(MoodModel.date == date).first()

    @staticmethod
    def create_or_update(db: Session, data: dict) -> MoodModel:
        """按 date upsert"""
        existing = db.query(MoodModel).filter(MoodModel.date == data["date"]).first()
        if existing:
            for k, v in data.items():
                setattr(existing, k, v)
            db.commit()
            db.refresh(existing)
            return existing
        obj = MoodModel(**data)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def list_between(db: Session, start_date: str, end_date: str) -> list[MoodModel]:
        return db.query(MoodModel).filter(
            MoodModel.date >= start_date,
            MoodModel.date <= end_date,
        ).order_by(MoodModel.date).all()


class KnowledgeRepository:
    @staticmethod
    def _is_internal_smoke(item: KnowledgeModel) -> bool:
        text = " ".join(str(value or "") for value in (
            item.title, item.content, item.source_url, item.tags,
        )).lower()
        return "xiaobai-smoke" in text or "smoke-test" in text

    @staticmethod
    def list_all(db: Session, source_type: Optional[str] = None) -> list[KnowledgeModel]:
        q = db.query(KnowledgeModel).order_by(KnowledgeModel.created_at.desc())
        if source_type:
            q = q.filter(KnowledgeModel.source_type == source_type)
        return [item for item in q.all() if not KnowledgeRepository._is_internal_smoke(item)]

    @staticmethod
    def list_recent(db: Session, limit: int = 5) -> list[KnowledgeModel]:
        return KnowledgeRepository.list_all(db)[:limit]

    @staticmethod
    def create(db: Session, data: dict) -> KnowledgeModel:
        obj = KnowledgeModel(**data)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def get_by_id(db: Session, knowledge_id: int) -> Optional[KnowledgeModel]:
        return db.query(KnowledgeModel).filter(KnowledgeModel.id == knowledge_id).first()

    @staticmethod
    def get_product_by_id(db: Session, knowledge_id: int) -> Optional[KnowledgeModel]:
        item = KnowledgeRepository.get_by_id(db, knowledge_id)
        return item if item and not KnowledgeRepository._is_internal_smoke(item) else None

    @staticmethod
    def get_by_source_url(db: Session, source_url: str) -> Optional[KnowledgeModel]:
        return db.query(KnowledgeModel).filter(KnowledgeModel.source_url == source_url).first()

    @staticmethod
    def list_paged(db: Session, page: int, page_size: int) -> tuple[int, list[KnowledgeModel]]:
        clean = KnowledgeRepository.list_all(db)
        total = len(clean)
        start = (page - 1) * page_size
        items = clean[start:start + page_size]
        return total, items

    @staticmethod
    def search(db: Session, topic: str, scope: str = "all", limit: int = 6) -> list[KnowledgeModel]:
        query = db.query(KnowledgeModel)
        if scope == "manual":
            query = query.filter(KnowledgeModel.source_type == "manual")
        elif scope == "life-os":
            query = query.filter(
                (KnowledgeModel.title.like("%Life%"))
                | (KnowledgeModel.content.like("%Life%"))
                | (KnowledgeModel.title.like("%结衣%"))
                | (KnowledgeModel.content.like("%结衣%"))
            )
        keyword_filter = (
            KnowledgeModel.title.like(f"%{topic}%")
            | KnowledgeModel.content.like(f"%{topic}%")
            | KnowledgeModel.tags.like(f"%{topic}%")
        )
        matched = query.filter(keyword_filter).order_by(KnowledgeModel.created_at.desc()).all()
        return [item for item in matched if not KnowledgeRepository._is_internal_smoke(item)][:limit]

    @staticmethod
    def list_for_suggestion(db: Session, limit: int = 50) -> list[KnowledgeModel]:
        items = db.query(KnowledgeModel).order_by(
            KnowledgeModel.is_core.desc(),
            KnowledgeModel.created_at.desc(),
        ).all()
        return [item for item in items if not KnowledgeRepository._is_internal_smoke(item)][:limit]

    @staticmethod
    def get_profile(db: Session, knowledge_id: int) -> Optional[KnowledgeProfileModel]:
        return db.query(KnowledgeProfileModel).filter(
            KnowledgeProfileModel.knowledge_id == knowledge_id
        ).first()

    @staticmethod
    def upsert_profile(db: Session, knowledge_id: int, data: dict) -> KnowledgeProfileModel:
        item = KnowledgeRepository.get_profile(db, knowledge_id)
        if item is None:
            item = KnowledgeProfileModel(knowledge_id=knowledge_id, **data)
            db.add(item)
        else:
            for key, value in data.items():
                setattr(item, key, value)
            item.updated_at = __import__("datetime").datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        db.commit()
        db.refresh(item)
        return item


class DailyReviewRepository:
    @staticmethod
    def get_by_date(db: Session, date: str) -> Optional[DailyReviewModel]:
        return db.query(DailyReviewModel).filter(DailyReviewModel.date == date).first()

    @staticmethod
    def upsert_generated(db: Session, date: str, summary: str, trade_ids: str | None, mood_id: int | None) -> DailyReviewModel:
        existing = DailyReviewRepository.get_by_date(db, date)
        if existing:
            existing.summary = summary
            existing.trade_ids = trade_ids
            existing.mood_id = mood_id
            db.commit()
            db.refresh(existing)
            return existing
        obj = DailyReviewModel(
            date=date,
            summary=summary,
            trade_ids=trade_ids,
            mood_id=mood_id,
        )
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj


class NoteRepository:
    @staticmethod
    def list_recent(db: Session, limit: int = 10) -> list[NoteModel]:
        return (
            db.query(NoteModel)
            .order_by(NoteModel.date.desc(), NoteModel.id.desc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_latest_by_date(db: Session, date: str) -> Optional[NoteModel]:
        return (
            db.query(NoteModel)
            .filter(NoteModel.date == date)
            .order_by(NoteModel.id.desc())
            .first()
        )

    @staticmethod
    def create(db: Session, data: dict) -> NoteModel:
        obj = NoteModel(**data)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj

    @staticmethod
    def delete_by_id(db: Session, note_id: int) -> bool:
        """删除指定笔记；返回是否实际删除了一条记录。"""
        obj = db.query(NoteModel).filter(NoteModel.id == note_id).first()
        if obj is None:
            return False
        db.delete(obj)
        db.commit()
        return True


class WisdomRepository:
    @staticmethod
    def list_all(db: Session) -> list[WisdomModel]:
        return db.query(WisdomModel).order_by(WisdomModel.created_at.desc()).all()

    @staticmethod
    def list_recent(db: Session, limit: int = 8) -> list[WisdomModel]:
        return db.query(WisdomModel).order_by(WisdomModel.created_at.desc()).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, wisdom_id: int) -> Optional[WisdomModel]:
        return db.query(WisdomModel).filter(WisdomModel.id == wisdom_id).first()

    @staticmethod
    def create(db: Session, data: dict) -> WisdomModel:
        obj = WisdomModel(**data)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj


class GoalRepository:
    @staticmethod
    def get_by_id(db: Session, goal_id: int) -> Optional[GoalModel]:
        return db.query(GoalModel).filter(GoalModel.id == goal_id).first()

    @staticmethod
    def list_active(db: Session) -> list[GoalModel]:
        return (
            db.query(GoalModel)
            .filter(GoalModel.status == "active")
            .order_by(GoalModel.created_at.desc(), GoalModel.id.desc())
            .all()
        )

    @staticmethod
    def create(db: Session, data: dict) -> GoalModel:
        obj = GoalModel(**data)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return obj
