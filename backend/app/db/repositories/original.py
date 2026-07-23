"""
仓库层 — 原表只读封装
"""
from typing import Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.db.models import Team, Team3DData, Schedule, Match, League, Roster, RefreshLog, SharedVersionAnalysis


class TeamRepository:
    @staticmethod
    def list_all(db: Session) -> list[Team]:
        return db.query(Team).all()

    @staticmethod
    def get_by_name(db: Session, name: str) -> Optional[Team]:
        return db.query(Team).filter(Team.short_name == name).first()


class Team3DRepository:
    @staticmethod
    def get_by_team(db: Session, team_name: str) -> Optional[Team3DData]:
        return db.query(Team3DData).filter(Team3DData.team_name == team_name).first()


class ScheduleRepository:
    @staticmethod
    def list_by_date(db: Session, date: str) -> list[Schedule]:
        return db.query(Schedule).filter(Schedule.date == date).all()


class MatchRepository:
    @staticmethod
    def get_by_id(db: Session, match_id: str) -> Optional[Match]:
        return db.query(Match).filter(Match.match_id == match_id).first()

    @staticmethod
    def list_recent_by_team(db: Session, team: str, limit: int = 5) -> list[Match]:
        return (
            db.query(Match)
            .filter(or_(Match.team_a_id == team, Match.team_b_id == team))
            .order_by(Match.match_time.desc())
            .limit(limit)
            .all()
        )


class RosterRepository:
    @staticmethod
    def list_active_starters(db: Session, team_id: str) -> list[Roster]:
        return (
            db.query(Roster)
            .filter(
                Roster.team_id == team_id,
                Roster.status == "active",
                Roster.is_starter == 1,
            )
            .order_by(Roster.position)
            .all()
        )


class RefreshLogRepository:
    @staticmethod
    def list_recent(db: Session, limit: int = 20) -> list[RefreshLog]:
        return db.query(RefreshLog).order_by(RefreshLog.id.desc()).limit(limit).all()


class SharedVersionAnalysisRepository:
    @staticmethod
    def search(db: Session, keyword: str, limit: int = 20) -> list[SharedVersionAnalysis]:
        like = f"%{keyword}%"
        return (
            db.query(SharedVersionAnalysis)
            .filter(
                or_(
                    SharedVersionAnalysis.topic.ilike(like),
                    SharedVersionAnalysis.content.ilike(like),
                )
            )
            .order_by(SharedVersionAnalysis.id.desc())
            .limit(limit)
            .all()
        )
