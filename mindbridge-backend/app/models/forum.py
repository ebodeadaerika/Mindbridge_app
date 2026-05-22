"""
MindBridge — Forum Models (ForumPost + ForumReply + PostLike)
PRIVACY CRITICAL: Posts and replies use auto-generated animal names.
No link to any user account is stored (FR-21, FR-22, NFR-07).
PostLike uses anon_token (HMAC-SHA256 of user_id) — same privacy model as MoodLog.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class ForumPost(Base):
    __tablename__ = "forum_posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    # Auto-generated anonymous display name e.g. "Blue Sparrow" (FR-22)
    anon_name = Column(String(100), nullable=False)
    body = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    is_deleted = Column(Boolean, nullable=False, default=False)  # Soft delete for admin moderation (FR-24)

    # Relationships
    replies = relationship("ForumReply", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("PostLike", back_populates="post", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<ForumPost id={self.id} anon_name={self.anon_name}>"


class ForumReply(Base):
    __tablename__ = "forum_replies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    post_id = Column(UUID(as_uuid=True), ForeignKey("forum_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    anon_name = Column(String(100), nullable=False)
    body = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    # Relationship
    post = relationship("ForumPost", back_populates="replies")

    def __repr__(self):
        return f"<ForumReply id={self.id} post_id={self.post_id}>"


class PostLike(Base):
    """
    Anonymous like on a forum post.
    PRIVACY: Uses anon_token (HMAC-SHA256 of user_id with SECRET_KEY pepper).
    This prevents double-liking while keeping likes unlinkable to real accounts (NFR-07).
    """
    __tablename__ = "post_likes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    post_id = Column(UUID(as_uuid=True), ForeignKey("forum_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    # NEVER store user_id — only an anonymous hash (same pattern as mood_logs.anon_token)
    anon_token = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))

    # Relationship
    post = relationship("ForumPost", back_populates="likes")

    # One like per anonymous token per post
    __table_args__ = (
        UniqueConstraint("post_id", "anon_token", name="uq_post_like_anon"),
    )

    def __repr__(self):
        return f"<PostLike post_id={self.post_id}>"
