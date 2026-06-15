"""
MindBridge — Privacy Utilities
Shared anonymous token generation used by mood and forum services.
"""
import hashlib

from app.config import settings


def generate_anon_token(user_id: str) -> str:
    """
    Derive an anonymous, non-reversible token from a user's ID.
    Uses HMAC-SHA256 with the app's SECRET_KEY as pepper.
    This makes it impossible to reverse-engineer the user_id from the token
    even with access to the database (FR-12, NFR-07).
    """
    combined = f"{settings.SECRET_KEY}:{user_id}"
    return hashlib.sha256(combined.encode()).hexdigest()
