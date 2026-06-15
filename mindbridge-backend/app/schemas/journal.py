"""
MindBridge — Journal Schemas (Pydantic v2)
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID


# ── Request Schemas ────────────────────────────────────────────────────────────

class JournalEntryCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    body: str = Field(min_length=1, max_length=50000)

    @field_validator("title", "body")
    @classmethod
    def not_whitespace_only(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Field cannot be empty or whitespace only")
        return stripped


class JournalEntryUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    body: Optional[str] = Field(None, min_length=1, max_length=50000)

    @field_validator("title", "body")
    @classmethod
    def not_whitespace_only(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        stripped = v.strip()
        if not stripped:
            raise ValueError("Field cannot be empty or whitespace only")
        return stripped


# ── Response Schemas ───────────────────────────────────────────────────────────

class JournalEntryResponse(BaseModel):
    id: UUID
    title: str
    body: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class JournalListResponse(BaseModel):
    entries: List[JournalEntryResponse]
    total: int
