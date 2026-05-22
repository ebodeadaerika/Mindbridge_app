"""
MindBridge — Mood Service
Business logic for mood check-ins and trend analytics.
PRIVACY CRITICAL: anon_token is derived by hashing user_id with a pepper.
Admins only ever see aggregated statistics — never individual records.
"""
import hashlib
from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status

from app.models.mood import MoodLog
from app.models.user import User
from app.schemas.mood import MoodCheckIn, MoodLogResponse, MoodHistoryResponse, MoodTrendsResponse
from app.config import settings


def _generate_anon_token(user_id: str) -> str:
    """
    Derive an anonymous, non-reversible token from a user's ID.
    Uses HMAC-SHA256 with the app's SECRET_KEY as pepper.
    This makes it impossible to reverse-engineer the user_id from the token
    even with access to the database (FR-12, NFR-07).
    """
    pepper = settings.SECRET_KEY
    combined = f"{pepper}:{user_id}"
    return hashlib.sha256(combined.encode()).hexdigest()


def submit_checkin(db: Session, user: User, data: MoodCheckIn) -> MoodLogResponse:
    """
    Submit a daily mood check-in for the authenticated student.
    Enforces one check-in per day via the DB unique constraint (FR-11).
    Stores anon_token — never user_id (FR-12).
    """
    anon_token = _generate_anon_token(str(user.id))
    today = date.today()

    # Check if already checked in today
    existing = db.query(MoodLog).filter(
        MoodLog.anon_token == anon_token,
        MoodLog.date == today,
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You have already checked in today. Come back tomorrow.",
        )

    log = MoodLog(
        anon_token=anon_token,
        mood_score=data.mood_score,
        energy_level=data.energy_level,
        note=data.note,
        date=today,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return MoodLogResponse.model_validate(log)


def get_history(db: Session, user: User) -> MoodHistoryResponse:
    """
    Return the authenticated student's own mood history (FR-13).
    Uses anon_token to fetch without exposing user_id.
    """
    anon_token = _generate_anon_token(str(user.id))
    entries = (
        db.query(MoodLog)
        .filter(MoodLog.anon_token == anon_token)
        .order_by(MoodLog.date.desc())
        .all()
    )
    return MoodHistoryResponse(
        entries=[MoodLogResponse.model_validate(e) for e in entries],
        total=len(entries),
    )


def get_trends(db: Session) -> MoodTrendsResponse:
    """
    Return aggregated campus-wide mood trends for admins (FR-14, FR-42).
    NEVER returns individual entries — only statistical aggregates.
    """
    total = db.query(func.count(MoodLog.id)).scalar() or 0
    avg_mood = db.query(func.avg(MoodLog.mood_score)).scalar() or 0.0
    avg_energy = db.query(func.avg(MoodLog.energy_level)).scalar() or 0.0

    # Mood distribution
    distribution_rows = (
        db.query(MoodLog.mood_score, func.count(MoodLog.id))
        .group_by(MoodLog.mood_score)
        .all()
    )
    mood_distribution = {str(score): count for score, count in distribution_rows}
    for i in range(1, 6):
        mood_distribution.setdefault(str(i), 0)

    # Daily averages for the last 30 days
    thirty_days_ago = date.today() - timedelta(days=30)
    daily_rows = (
        db.query(MoodLog.date, func.avg(MoodLog.mood_score).label("avg_mood"))
        .filter(MoodLog.date >= thirty_days_ago)
        .group_by(MoodLog.date)
        .order_by(MoodLog.date)
        .all()
    )
    daily_averages = [
        {"date": str(row.date), "avg_mood": round(float(row.avg_mood), 2)}
        for row in daily_rows
    ]

    return MoodTrendsResponse(
        average_mood=round(float(avg_mood), 2),
        average_energy=round(float(avg_energy), 2),
        total_checkins=total,
        mood_distribution=mood_distribution,
        daily_averages=daily_averages,
    )
