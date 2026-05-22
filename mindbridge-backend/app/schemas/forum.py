"""
MindBridge — Forum Schemas (Pydantic v2)
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID


# ── Request Schemas ────────────────────────────────────────────────────────────

class ForumPostCreate(BaseModel):
    body: str = Field(min_length=1, max_length=500)
    category: Optional[str] = Field(None, max_length=100)

    @field_validator("body")
    @classmethod
    def body_not_whitespace(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Post body cannot be empty or whitespace only")
        return stripped


class ForumReplyCreate(BaseModel):
    body: str = Field(min_length=1, max_length=500)

    @field_validator("body")
    @classmethod
    def body_not_whitespace(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Reply body cannot be empty or whitespace only")
        return stripped


# ── Response Schemas ───────────────────────────────────────────────────────────

class ForumReplyResponse(BaseModel):
    id: UUID
    anon_name: str
    body: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ForumPostResponse(BaseModel):
    id: UUID
    anon_name: str
    body: str
    category: Optional[str] = None
    created_at: datetime
    reply_count: int = 0
    like_count: int = 0
    liked: bool = False

    model_config = {"from_attributes": True}


class ForumPostDetailResponse(BaseModel):
    id: UUID
    anon_name: str
    body: str
    category: Optional[str] = None
    created_at: datetime
    replies: List[ForumReplyResponse] = []
    like_count: int = 0
    liked: bool = False

    model_config = {"from_attributes": True}


class ForumListResponse(BaseModel):
    posts: List[ForumPostResponse]
    total: int
    page: int
    per_page: int


class LikeToggleResponse(BaseModel):
    """Returned by POST /forum/post/{id}/like — tells the client the new state."""
    liked: bool
    like_count: int
