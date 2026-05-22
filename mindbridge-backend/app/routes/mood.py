"""
MindBridge — Mood Routes
POST /mood/checkin, GET /mood/history, GET /mood/trends
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.mood import MoodCheckIn, MoodLogResponse, MoodHistoryResponse, MoodTrendsResponse
from app.services import mood_service
from app.middleware.roles import require_student, require_admin
from app.models.user import User

router = APIRouter(prefix="/mood", tags=["Mood Check-in"])


@router.post("/checkin", response_model=MoodLogResponse, status_code=201)
def checkin(
    data: MoodCheckIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student),
):
    """
    Submit today's mood check-in (FR-09, FR-10).
    One check-in per student per calendar day (FR-11).
    Stored anonymously — never linked to user identity (FR-12).
    """
    return mood_service.submit_checkin(db, current_user, data)


@router.get("/history", response_model=MoodHistoryResponse)
def history(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student),
):
    """
    Return the authenticated student's own mood history (FR-13).
    """
    return mood_service.get_history(db, current_user)


@router.get("/trends", response_model=MoodTrendsResponse)
def trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Return aggregated campus-wide mood trends — admin only (FR-14, FR-42).
    Returns statistics only — NEVER individual records.
    """
    return mood_service.get_trends(db)
