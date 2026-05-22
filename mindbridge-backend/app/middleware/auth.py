"""
MindBridge — JWT Authentication Middleware
Verifies Bearer tokens and injects the current user into route dependencies.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from uuid import UUID

from app.database import get_db
from app.models.user import User
from app.config import settings

security = HTTPBearer()


def decode_token(token: str) -> dict:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency — resolves the current authenticated user from the JWT token.
    Raises 401 if token is missing, invalid, or expired.
    Raises 404 if the user no longer exists in the database.
    """
    payload = decode_token(credentials.credentials)

    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload invalid — missing subject",
        )

    user = db.query(User).filter(User.id == UUID(user_id)).first()
    if user is None:
        # Return 401, not 404 — the token is no longer valid (user deleted/deactivated).
        # 404 would bypass the frontend's 401 interceptor, leaving the user in a broken state.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user
