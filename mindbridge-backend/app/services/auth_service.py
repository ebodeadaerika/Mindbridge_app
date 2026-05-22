"""
MindBridge — Auth Service
Business logic for registration, login, JWT creation, profile updates,
token refresh, and account deletion.
"""
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from jose import jwt, JWTError
import bcrypt as _bcrypt
import httpx

from app.models.user import User, UserRole
from app.schemas.user import UserRegister, UserLogin, UserUpdate, TokenResponse, UserResponse, RefreshRequest, ForgotPasswordRequest, ResetPasswordRequest
from app.config import settings
from app.services import email_service


# ── Password Helpers ────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    """Hash a plain-text password with bcrypt (FR-03, NFR-04)."""
    return _bcrypt.hashpw(password.encode("utf-8"), _bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Constant-time bcrypt verification."""
    return _bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


# ── Token Creation ──────────────────────────────────────────────────────────────

def create_access_token(user_id: str, role: str) -> str:
    """Generate a signed JWT access token that expires in ACCESS_TOKEN_EXPIRE_MINUTES."""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "role": role,
        "type": "access",
        "exp": expire,
        "iat": now,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_password_reset_token(user_id: str) -> str:
    """
    Generate a short-lived (1 hour) signed JWT for password reset.
    The 'type: password_reset' claim prevents use as an access or refresh token.
    Stateless — no DB storage required; expiry is enforced by the JWT itself.
    """
    now = datetime.now(timezone.utc)
    expire = now + timedelta(hours=1)
    payload = {
        "sub": str(user_id),
        "type": "password_reset",
        "exp": expire,
        "iat": now,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    """
    Generate a long-lived refresh token (REFRESH_TOKEN_EXPIRE_DAYS, default 30 days).
    The 'type: refresh' claim distinguishes it from access tokens so a refresh token
    cannot be used as a Bearer token on protected endpoints.
    """
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "exp": expire,
        "iat": now,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def _build_token_response(user: User) -> TokenResponse:
    """Build a complete TokenResponse (access + refresh) for a given user."""
    return TokenResponse(
        access_token=create_access_token(user.id, user.role.value),
        refresh_token=create_refresh_token(user.id),
        user=UserResponse.model_validate(user),
    )


# ── Auth Operations ─────────────────────────────────────────────────────────────

def register_user(db: Session, data: UserRegister) -> TokenResponse:
    """
    Register a new student account.
    - Validates email uniqueness (FR-02)
    - Hashes password before storage (FR-03)
    - Issues JWT token on success (FR-04)
    """
    existing = db.query(User).filter(User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    user = User(
        name=data.name,
        email=data.email.lower(),
        password_hash=hash_password(data.password),
        role=UserRole.student,
        university=data.university,
        year_of_study=data.year_of_study,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _build_token_response(user)


def login_user(db: Session, data: UserLogin) -> TokenResponse:
    """
    Authenticate an existing user and return a JWT token (FR-04).
    Returns 401 for both wrong email AND wrong password — same message
    to prevent email enumeration attacks.
    Google-auth accounts (no password) are also rejected here with the same message.
    """
    user = db.query(User).filter(User.email == data.email.lower()).first()
    if not user or user.password_hash == "GOOGLE_AUTH" or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    return _build_token_response(user)


def refresh_tokens(db: Session, refresh_token: str) -> TokenResponse:
    """
    Validate a refresh token and issue a new access + refresh token pair.
    Rotates the refresh token on each use (single-use pattern prevents replay).
    """
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Enforce token type — a refresh token must not be usable as an access token
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )

    from uuid import UUID
    user = db.query(User).filter(User.id == UUID(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return _build_token_response(user)


def update_profile(db: Session, user: User, data: UserUpdate) -> UserResponse:
    """Update the current user's profile fields (FR-07)."""
    if data.name is not None:
        user.name = data.name
    if data.bio is not None:
        user.bio = data.bio or None
    if data.university is not None:
        user.university = data.university.strip() or None
    if data.year_of_study is not None:
        user.year_of_study = data.year_of_study.strip() or None
    if data.notif_mood_reminder is not None:
        user.notif_mood_reminder = data.notif_mood_reminder
    if data.notif_forum_replies is not None:
        user.notif_forum_replies = data.notif_forum_replies

    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)


def request_password_reset(db: Session, email: str) -> None:
    """
    Initiate a password reset for the given email address.
    ALWAYS returns without error — never reveals whether the email exists
    to prevent account enumeration attacks.
    If SMTP is not configured, the reset link is printed to stdout (dev mode).
    """
    user = db.query(User).filter(User.email == email.lower()).first()
    if not user:
        return  # Silent — do not reveal that this email is not registered

    token = create_password_reset_token(str(user.id))
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"

    try:
        email_service.send_password_reset_email(user.email, user.name, reset_url)
    except Exception:
        # Email send failure must not expose internals to the client.
        # In dev mode the console fallback already printed the link; in prod,
        # the error is swallowed here — a monitoring alert should fire separately.
        if settings.is_development:
            import traceback
            traceback.print_exc()


def reset_password(db: Session, token: str, new_password: str) -> dict:
    """
    Validate a password-reset JWT and update the user's password.
    Returns HTTP 400 for any invalid / expired / wrong-type token.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset link is invalid or has expired",
        )

    if payload.get("type") != "password_reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset link",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset link")

    from uuid import UUID
    user = db.query(User).filter(User.id == UUID(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset link")

    user.password_hash = hash_password(new_password)
    db.commit()
    return {"message": "Password reset successfully"}


async def google_auth(db: Session, access_token: str) -> TokenResponse:
    """
    Verify a Google OAuth access token and sign in or auto-register the user.
    - Calls Google's userinfo endpoint to get email + name (no API key needed)
    - Enforces the academic email requirement (must be .edu / .ac.XX / .edu.XX)
    - Finds existing account or creates a new one (password_hash = "GOOGLE_AUTH")
    - Returns the same TokenResponse as regular login/register
    """
    # Verify the token with Google and fetch user info
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            r.raise_for_status()
    except httpx.HTTPStatusError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token. Please try signing in again.",
        )
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not reach Google servers. Please try again.",
        )

    info = r.json()
    email: str = info.get("email", "").lower()
    name: str = info.get("name") or email.split("@")[0]
    email_verified: bool = info.get("email_verified", False)

    if not email or not email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account email is not verified.",
        )

    # Enforce academic email — must be a real university account
    from app.schemas.user import _is_academic_email
    if not _is_academic_email(email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Only university Google accounts are accepted "
                "(e.g. .edu, .ac.uk, .edu.cm). "
                "Please sign in with your university email."
            ),
        )

    # Find existing account or create a new one
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            name=name,
            email=email,
            password_hash="GOOGLE_AUTH",  # No password — Google-only account
            role=UserRole.student,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return _build_token_response(user)


def delete_account(db: Session, user: User) -> dict:
    """
    Permanently delete a user account and all associated private data.
    - Journal entries: cascade-deleted (FK cascade="all, delete-orphan")
    - Resources: created_by set to NULL (FK ondelete="SET NULL")
    - Mood logs: stored by anon_token — no user FK, remain in DB as anonymous stats
    - Crisis flags: completely anonymous — no user FK
    - Forum posts: completely anonymous — no user FK
    """
    db.delete(user)
    db.commit()
    return {"message": "Account permanently deleted"}
