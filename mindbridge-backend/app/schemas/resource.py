"""
MindBridge — Resource Schemas (Pydantic v2)
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.models.resource import ResourceCategory


# ── Request Schemas ────────────────────────────────────────────────────────────

class ResourceCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    category: ResourceCategory

    @field_validator("title")
    @classmethod
    def title_not_whitespace(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Title cannot be empty or whitespace only")
        return stripped
    description: Optional[str] = None
    url: Optional[str] = Field(None, max_length=500)


class ResourceUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    category: Optional[ResourceCategory] = None
    description: Optional[str] = None
    url: Optional[str] = Field(None, max_length=500)


# ── Response Schemas ───────────────────────────────────────────────────────────

class ResourceResponse(BaseModel):
    id: UUID
    title: str
    category: ResourceCategory
    description: Optional[str] = None
    url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ResourceListResponse(BaseModel):
    resources: List[ResourceResponse]
    total: int
