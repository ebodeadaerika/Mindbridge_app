"""
MindBridge — Forum Service
Business logic for anonymous peer support forum.
All posts and replies use auto-generated animal names — no user identity stored (FR-21).
Likes use anon_token (same HMAC-SHA256 privacy model as mood logs) — no user_id stored.
"""
import random
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from uuid import UUID

from app.models.forum import ForumPost, ForumReply, PostLike
from app.models.user import User
from app.schemas.forum import (
    ForumPostCreate, ForumReplyCreate,
    ForumPostResponse, ForumPostDetailResponse, ForumListResponse,
    ForumReplyResponse, LikeToggleResponse,
)
from app.utils.privacy import generate_anon_token

# Animal name generator for anonymous identities (FR-22)
_ADJECTIVES = [
    "Blue", "Green", "Golden", "Silver", "Crimson", "Violet", "Amber",
    "Jade", "Coral", "Ivory", "Sage", "Indigo", "Teal", "Ruby", "Onyx",
]
_ANIMALS = [
    "Sparrow", "Falcon", "Otter", "Panda", "Tiger", "Lynx", "Crane",
    "Dolphin", "Fox", "Owl", "Wolf", "Heron", "Raven", "Deer", "Finch",
]


def _generate_anon_name() -> str:
    """Generate a random 'Adjective Animal' display name e.g. 'Blue Sparrow'."""
    return f"{random.choice(_ADJECTIVES)} {random.choice(_ANIMALS)}"



def list_posts(
    db: Session,
    user_id,
    category: str = None,
    page: int = 1,
    per_page: int = 20,
) -> ForumListResponse:
    """
    Return paginated forum posts — active only (FR-25).
    Reply counts, like counts, and current-user liked status fetched in bulk (no N+1).
    """
    query = db.query(ForumPost).filter(ForumPost.is_deleted == False)
    if category:
        query = query.filter(ForumPost.category == category)

    total = query.count()
    posts = query.order_by(ForumPost.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    if not posts:
        return ForumListResponse(posts=[], total=total, page=page, per_page=per_page)

    post_ids = [p.id for p in posts]

    # Bulk-fetch reply counts for this page in one GROUP BY query
    reply_count_rows = (
        db.query(ForumReply.post_id, func.count(ForumReply.id).label("cnt"))
        .filter(ForumReply.post_id.in_(post_ids))
        .group_by(ForumReply.post_id)
        .all()
    )
    reply_counts = {row.post_id: row.cnt for row in reply_count_rows}

    # Bulk-fetch like counts for this page
    like_count_rows = (
        db.query(PostLike.post_id, func.count(PostLike.id).label("cnt"))
        .filter(PostLike.post_id.in_(post_ids))
        .group_by(PostLike.post_id)
        .all()
    )
    like_counts = {row.post_id: row.cnt for row in like_count_rows}

    # Bulk-fetch which of these posts the current user has already liked
    anon_token = generate_anon_token(str(user_id))
    liked_rows = (
        db.query(PostLike.post_id)
        .filter(PostLike.post_id.in_(post_ids), PostLike.anon_token == anon_token)
        .all()
    )
    liked_ids = {row.post_id for row in liked_rows}

    result = []
    for post in posts:
        post_resp = ForumPostResponse.model_validate(post)
        post_resp.reply_count = reply_counts.get(post.id, 0)
        post_resp.like_count = like_counts.get(post.id, 0)
        post_resp.liked = post.id in liked_ids
        result.append(post_resp)

    return ForumListResponse(posts=result, total=total, page=page, per_page=per_page)


def get_post(db: Session, user_id, post_id: UUID) -> ForumPostDetailResponse:
    """Return a single post with all its replies, like count, and liked status."""
    post = db.query(ForumPost).filter(ForumPost.id == post_id, ForumPost.is_deleted == False).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    like_count = (
        db.query(func.count(PostLike.id))
        .filter(PostLike.post_id == post_id)
        .scalar()
    ) or 0

    anon_token = generate_anon_token(str(user_id))
    liked = (
        db.query(PostLike)
        .filter(PostLike.post_id == post_id, PostLike.anon_token == anon_token)
        .first()
    ) is not None

    post_resp = ForumPostDetailResponse.model_validate(post)
    post_resp.like_count = like_count
    post_resp.liked = liked
    return post_resp


def toggle_like(db: Session, user: User, post_id: UUID) -> LikeToggleResponse:
    """
    Toggle a like on a forum post.
    Uses anon_token — user_id is NEVER stored (NFR-07).
    Returns the new liked state and updated count.
    """
    post = db.query(ForumPost).filter(ForumPost.id == post_id, ForumPost.is_deleted == False).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    anon_token = generate_anon_token(str(user.id))
    existing = (
        db.query(PostLike)
        .filter(PostLike.post_id == post_id, PostLike.anon_token == anon_token)
        .first()
    )

    if existing:
        db.delete(existing)
        db.commit()
        liked = False
    else:
        db.add(PostLike(post_id=post_id, anon_token=anon_token))
        db.commit()
        liked = True

    like_count = (
        db.query(func.count(PostLike.id))
        .filter(PostLike.post_id == post_id)
        .scalar()
    ) or 0

    return LikeToggleResponse(liked=liked, like_count=like_count)


def create_post(db: Session, data: ForumPostCreate) -> ForumPostResponse:
    """Create an anonymous forum post (FR-21, FR-22)."""
    post = ForumPost(
        anon_name=_generate_anon_name(),
        body=data.body,
        category=data.category,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    post_resp = ForumPostResponse.model_validate(post)
    post_resp.reply_count = 0
    post_resp.like_count = 0
    post_resp.liked = False
    return post_resp


def create_reply(db: Session, post_id: UUID, data: ForumReplyCreate) -> ForumReplyResponse:
    """Add an anonymous reply to an existing post (FR-23)."""
    post = db.query(ForumPost).filter(ForumPost.id == post_id, ForumPost.is_deleted == False).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    reply = ForumReply(
        post_id=post_id,
        anon_name=_generate_anon_name(),
        body=data.body,
    )
    db.add(reply)
    db.commit()
    db.refresh(reply)
    return ForumReplyResponse.model_validate(reply)


def delete_post(db: Session, post_id: UUID) -> dict:
    """Soft-delete a post for admin moderation (FR-24). Sets is_deleted=True."""
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    post.is_deleted = True
    db.commit()
    return {"message": "Post removed by moderator"}
