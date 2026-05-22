"""
MindBridge — Journal Service
Business logic for private journal entries.
PRIVACY CRITICAL: Every operation verifies that entry.user_id == current_user.id
before returning or modifying data (FR-20, FR-46).
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID

from app.models.journal import JournalEntry
from app.models.user import User
from app.schemas.journal import JournalEntryCreate, JournalEntryUpdate, JournalEntryResponse, JournalListResponse


def create_entry(db: Session, user: User, data: JournalEntryCreate) -> JournalEntryResponse:
    """Create a new private journal entry for the authenticated student (FR-16)."""
    entry = JournalEntry(
        user_id=user.id,
        title=data.title,
        body=data.body,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return JournalEntryResponse.model_validate(entry)


def get_entries(db: Session, user: User) -> JournalListResponse:
    """
    Return all journal entries belonging to the authenticated student (FR-18).
    Filtered strictly by user_id — no cross-user access possible.
    """
    entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user.id)
        .order_by(JournalEntry.created_at.desc())
        .all()
    )
    return JournalListResponse(
        entries=[JournalEntryResponse.model_validate(e) for e in entries],
        total=len(entries),
    )


def get_entry(db: Session, user: User, entry_id: UUID) -> JournalEntryResponse:
    """Get a single journal entry — verifies ownership before returning (FR-20)."""
    entry = _get_and_verify(db, user, entry_id)
    return JournalEntryResponse.model_validate(entry)


def update_entry(db: Session, user: User, entry_id: UUID, data: JournalEntryUpdate) -> JournalEntryResponse:
    """Update a journal entry — verifies ownership before modifying."""
    entry = _get_and_verify(db, user, entry_id)
    if data.title is not None:
        entry.title = data.title
    if data.body is not None:
        entry.body = data.body
    db.commit()
    db.refresh(entry)
    return JournalEntryResponse.model_validate(entry)


def delete_entry(db: Session, user: User, entry_id: UUID) -> dict:
    """Delete a journal entry — verifies ownership before deleting (FR-19)."""
    entry = _get_and_verify(db, user, entry_id)
    db.delete(entry)
    db.commit()
    return {"message": "Journal entry deleted successfully"}


def _get_and_verify(db: Session, user: User, entry_id: UUID) -> JournalEntry:
    """
    Internal helper — fetch entry by ID and verify it belongs to the requesting user.
    Returns 404 (not 403) to avoid confirming existence to unauthorized users.
    """
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry or entry.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Journal entry not found",
        )
    return entry
