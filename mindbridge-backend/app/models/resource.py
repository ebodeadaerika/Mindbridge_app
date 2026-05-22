"""
MindBridge — Resource Model
Mental health articles, breathing exercises, coping strategies, crisis hotlines.
Only admins can create/delete resources (FR-35).
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class ResourceCategory(str, enum.Enum):
    article = "article"
    breathing = "breathing"
    coping = "coping"
    hotline = "hotline"


class Resource(Base):
    __tablename__ = "resources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    title = Column(String(200), nullable=False)
    category = Column(Enum(ResourceCategory), nullable=False)
    description = Column(Text, nullable=True)
    url = Column(String(500), nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    # Relationship
    creator = relationship("User", back_populates="resources_created")

    def __repr__(self):
        return f"<Resource id={self.id} title={self.title[:30]} category={self.category}>"
