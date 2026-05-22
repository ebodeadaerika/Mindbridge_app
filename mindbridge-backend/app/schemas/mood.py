"""
MindBridge — Mood Schemas (Pydantic v2)
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date
from uuid import UUID


# ── Request Schemas ────────────────────────────────────────────────────────────

class MoodCheckIn(BaseModel):
    mood_score: int = Field(ge=1, le=5, description="Overall mood 1 (very low) to 5 (excellent)")
    energy_level: int = Field(ge=1, le=5, description="Energy level 1 (exhausted) to 5 (energised)")
    note: Optional[str] = Field(None, max_length=500, description="Optional free-text note")


# ── Response Schemas ───────────────────────────────────────────────────────────

class MoodLogResponse(BaseModel):
    id: UUID
    mood_score: int
    energy_level: int
    note: Optional[str] = None
    date: date

    model_config = {"from_attributes": True}


class MoodHistoryResponse(BaseModel):
    entries: List[MoodLogResponse]
    total: int


class MoodTrendsResponse(BaseModel):
    """Admin-only — aggregated statistics only, never individual entries."""
    average_mood: float
    average_energy: float
    total_checkins: int
    mood_distribution: dict  # {"1": count, "2": count, ...}
    daily_averages: List[dict]  # [{"date": "2026-01-01", "avg_mood": 3.4}]
