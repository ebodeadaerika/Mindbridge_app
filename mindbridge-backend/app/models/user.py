"""
MindBridge — User Model
Stores registered student and admin accounts.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Enum, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    student = "student"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.student)
    bio = Column(Text, nullable=True)
    university = Column(String(200), nullable=True)
    year_of_study = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    # Notification preferences — persisted so settings survive sessions and devices
    notif_mood_reminder = Column(Boolean, nullable=False, default=True)
    notif_forum_replies = Column(Boolean, nullable=False, default=True)

    # Relationships
    journal_entries = relationship("JournalEntry", back_populates="user", cascade="all, delete-orphan")
    resources_created = relationship("Resource", back_populates="creator")

    def __repr__(self):
        return f"<User id={self.id} email={self.email} role={self.role}>"
