"""
MindBridge — Crisis Service
Business logic for anonymous crisis flag submission and admin resolution.
PRIVACY CRITICAL: No user identity is ever stored unless the student
voluntarily includes contact info in their message (FR-26, FR-31).
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID

from app.models.crisis import CrisisFlag
from app.schemas.crisis import CrisisFlagCreate, CrisisResolve, CrisisFlagResponse, CrisisListResponse


def submit_flag(db: Session, data: CrisisFlagCreate) -> CrisisFlagResponse:
    """
    Submit an anonymous crisis flag (FR-26, FR-27).
    No user_id or any identifying information is stored.
    """
    flag = CrisisFlag(
        severity=data.severity,
        message=data.message,
    )
    db.add(flag)
    db.commit()
    db.refresh(flag)
    return CrisisFlagResponse.model_validate(flag)


def list_alerts(db: Session, resolved: bool = None) -> CrisisListResponse:
    """
    Return all crisis flags for admin review (FR-29, FR-43).
    Optionally filter by resolved status.
    """
    query = db.query(CrisisFlag)
    if resolved is not None:
        query = query.filter(CrisisFlag.resolved == resolved)

    flags = query.order_by(CrisisFlag.created_at.desc()).all()

    total = len(flags)
    pending = sum(1 for f in flags if not f.resolved)
    resolved_count = total - pending

    return CrisisListResponse(
        flags=[CrisisFlagResponse.model_validate(f) for f in flags],
        total=total,
        pending_count=pending,
        resolved_count=resolved_count,
    )


def resolve_flag(db: Session, flag_id: UUID, data: CrisisResolve) -> CrisisFlagResponse:
    """Mark a crisis flag as resolved with an optional admin note (FR-30)."""
    flag = db.query(CrisisFlag).filter(CrisisFlag.id == flag_id).first()
    if not flag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crisis flag not found")

    if flag.resolved:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This flag is already resolved")

    flag.resolved = True
    flag.resolution_note = data.resolution_note
    db.commit()
    db.refresh(flag)
    return CrisisFlagResponse.model_validate(flag)
