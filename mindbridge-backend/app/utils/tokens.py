"""
MindBridge — JWT Token Utilities
Shared token creation logic extracted from auth_service.
"""
from datetime import datetime, timedelta, timezone

from jose import jwt

from app.config import settings


def create_jwt_token(user_id: str, token_type: str, expires_delta: timedelta, **extra_claims) -> str:
    """
    Build and sign a JWT token with standard claims.
    Consolidates the repeated payload-build + encode pattern from auth_service.
    """
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "type": token_type,
        "exp": now + expires_delta,
        "iat": now,
        **extra_claims,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
