"""
MindBridge — Crisis Schemas (Pydantic v2)
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.models.crisis import CrisisSeverity


# ── Request Schemas ────────────────────────────────────────────────────────────

class CrisisFlagCreate(BaseModel):
    severity: CrisisSeverity
    message: Optional[str] = Field(None, max_length=1000)


class CrisisResolve(BaseModel):
    resolution_note: Optional[str] = Field(None, max_length=1000)


# ── Response Schemas ───────────────────────────────────────────────────────────

class CrisisFlagResponse(BaseModel):
    id: UUID
    severity: CrisisSeverity
    message: Optional[str] = None
    resolved: bool
    resolution_note: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CrisisListResponse(BaseModel):
    flags: List[CrisisFlagResponse]
    total: int
    pending_count: int
    resolved_count: int
