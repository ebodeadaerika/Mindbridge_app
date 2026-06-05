"""
MindBridge — Journal Routes
POST /journal/entry, GET /journal/entries, GET /journal/entry/{id},
PUT /journal/entry/{id}, DELETE /journal/entry/{id}
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.schemas.journal import JournalEntryCreate, JournalEntryUpdate, JournalEntryResponse, JournalListResponse
from app.services import journal_service
from app.middleware.roles import require_student
from app.models.user import User

router = APIRouter(prefix="/journal", tags=["Journal"])

MAX_PAGE_SIZE = 50


@router.post("/entry", response_model=JournalEntryResponse, status_code=status.HTTP_201_CREATED)
def create_entry(
    data: JournalEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student),
):
    """Create a new private journal entry (FR-16, FR-17)."""
    return journal_service.create_entry(db, current_user, data)


@router.get("/entries", response_model=JournalListResponse)
def get_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student),
):
    """Return all journal entries for the logged-in student only (FR-18, FR-20)."""
    return journal_service.get_entries(db, current_user)


@router.get("/entry/{entry_id}", response_model=JournalEntryResponse)
def get_entry(
    entry_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student),
):
    """Return a single journal entry — verifies ownership (FR-20)."""
    return journal_service.get_entry(db, current_user, entry_id)


@router.put("/entry/{entry_id}", response_model=JournalEntryResponse)
def update_entry(
    entry_id: UUID,
    data: JournalEntryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student),
):
    """Update a journal entry — verifies ownership before modifying."""
    return journal_service.update_entry(db, current_user, entry_id, data)


@router.delete("/entry/{entry_id}", status_code=status.HTTP_200_OK)
def delete_entry(
    entry_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student),
):
    """Delete a journal entry — verifies ownership before deleting (FR-19)."""
    return journal_service.delete_entry(db, current_user, entry_id)
