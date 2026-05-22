"""
MindBridge — Crisis Routes
POST /crisis/flag, GET /crisis/alerts, PUT /crisis/alerts/{id}/resolve
"""
from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from app.database import get_db
from app.schemas.crisis import CrisisFlagCreate, CrisisResolve, CrisisFlagResponse, CrisisListResponse
from app.services import crisis_service
from app.middleware.roles import require_student, require_admin
from app.models.user import User
from app.limiter import limiter

router = APIRouter(prefix="/crisis", tags=["Crisis Support"])


@router.post("/flag", response_model=CrisisFlagResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def submit_flag(
    request: Request,
    data: CrisisFlagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student),
):
    """
    Submit an anonymous crisis flag (FR-26, FR-27).
    No student identity is stored with the flag (FR-31).
    Rate limited: 5 flags per minute per IP (prevents automated spam while allowing genuine crises).
    """
    return crisis_service.submit_flag(db, data)


@router.get("/alerts", response_model=CrisisListResponse)
def list_alerts(
    resolved: Optional[bool] = Query(None, description="Filter: true=resolved, false=pending, null=all"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Return all crisis flags for admin/counsellor review (FR-29, FR-43).
    Admin-only endpoint (NFR-08).
    """
    return crisis_service.list_alerts(db, resolved=resolved)


@router.put("/alerts/{flag_id}/resolve", response_model=CrisisFlagResponse)
def resolve_flag(
    flag_id: UUID,
    data: CrisisResolve,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Mark a crisis flag as resolved with an optional resolution note (FR-30).
    Admin-only endpoint.
    """
    return crisis_service.resolve_flag(db, flag_id, data)
