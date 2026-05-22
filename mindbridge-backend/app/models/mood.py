"""
MindBridge — MoodLog Model
PRIVACY CRITICAL: anon_token is a hashed derivative of user_id.
Admins can NEVER trace a mood log back to an individual student.
"""
import uuid
from datetime import date as _date, datetime
from sqlalchemy import Column, String, Integer, Text, Date, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class MoodLog(Base):
    __tablename__ = "mood_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)

    # NEVER store user_id here — store only a hashed anonymous token (FR-12, NFR-07)
    anon_token = Column(String(255), nullable=False, index=True)

    mood_score = Column(Integer, nullable=False)    # 1–5
    energy_level = Column(Integer, nullable=False)  # 1–5
    note = Column(Text, nullable=True)
    date = Column(Date, nullable=False, default=_date.today)
    created_at = Column(Date, nullable=False, default=_date.today)

    # Enforce one check-in per anonymous token per calendar day (FR-11)
    __table_args__ = (
        UniqueConstraint("anon_token", "date", name="uq_mood_anon_date"),
    )

    def __repr__(self):
        return f"<MoodLog id={self.id} score={self.mood_score} date={self.date}>"
