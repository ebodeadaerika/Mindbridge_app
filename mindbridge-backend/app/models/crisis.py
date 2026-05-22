"""
MindBridge — CrisisFlag Model
PRIVACY CRITICAL: No user identity is stored unless the student includes
contact info voluntarily in their message (FR-26, FR-31).
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, Text, DateTime, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum


class CrisisSeverity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class CrisisFlag(Base):
    __tablename__ = "crisis_flags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    severity = Column(Enum(CrisisSeverity), nullable=False)
    message = Column(Text, nullable=True)          # Optional — student's words if they choose to share
    resolved = Column(Boolean, nullable=False, default=False)
    resolution_note = Column(Text, nullable=True)  # Admin note when resolving (FR-30)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return f"<CrisisFlag id={self.id} severity={self.severity} resolved={self.resolved}>"
