"""
MindBridge — Forum Routes
GET /forum/posts, POST /forum/post, POST /forum/post/{id}/reply,
POST /forum/post/{id}/like, DELETE /forum/post/{id}
"""
from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from app.database import get_db
from app.limiter import limiter
from app.schemas.forum import (
    ForumPostCreate, ForumReplyCreate,
    ForumPostResponse, ForumPostDetailResponse, ForumListResponse,
    ForumReplyResponse, LikeToggleResponse,
)
from app.services import forum_service
from app.middleware.roles import require_student, require_admin, require_any_role
from app.models.user import User

router = APIRouter(prefix="/forum", tags=["Forum"])


@router.get("/posts", response_model=ForumListResponse)
def list_posts(
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role),
):
    """
    List paginated forum posts (FR-25).
    Optionally filter by category.
    Includes per-user liked status via anonymous token (no user_id stored).
    """
    return forum_service.list_posts(
        db, user_id=current_user.id, category=category, page=page, per_page=per_page
    )


@router.get("/post/{post_id}", response_model=ForumPostDetailResponse)
def get_post(
    post_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role),
):
    """Return a single forum post with all replies, like count, and liked status."""
    return forum_service.get_post(db, user_id=current_user.id, post_id=post_id)


@router.post("/post", response_model=ForumPostResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def create_post(
    request: Request,
    data: ForumPostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student),
):
    """
    Submit an anonymous forum post (FR-21, FR-22).
    No user identity is linked to this post.
    """
    return forum_service.create_post(db, data)


@router.post("/post/{post_id}/reply", response_model=ForumReplyResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
def create_reply(
    request: Request,
    post_id: UUID,
    data: ForumReplyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student),
):
    """Add an anonymous reply to an existing post (FR-23)."""
    return forum_service.create_reply(db, post_id, data)


@router.post("/post/{post_id}/like", response_model=LikeToggleResponse)
@limiter.limit("30/minute")
def toggle_like(
    request: Request,
    post_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student),
):
    """
    Toggle a like on a forum post (FR-26).
    Privacy-safe: uses anon_token — user_id is never stored.
    Returns the new liked state and updated count.
    """
    return forum_service.toggle_like(db, current_user, post_id)


@router.delete("/post/{post_id}", status_code=status.HTTP_200_OK)
def delete_post(
    post_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Admin moderation — soft-delete a post that violates community guidelines (FR-24, FR-45).
    """
    return forum_service.delete_post(db, post_id)
