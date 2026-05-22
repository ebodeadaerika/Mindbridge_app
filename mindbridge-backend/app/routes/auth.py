"""
MindBridge — Auth Routes
POST /auth/register, POST /auth/login, GET /auth/me, PUT /auth/me,
POST /auth/refresh, DELETE /auth/me
"""
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import UserRegister, UserLogin, UserUpdate, UserResponse, TokenResponse, RefreshRequest, ForgotPasswordRequest, ResetPasswordRequest, GoogleAuthRequest
from app.services import auth_service
from app.middleware.auth import get_current_user
from app.middleware.roles import require_student, require_any_role
from app.models.user import User
from app.limiter import limiter

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def register(request: Request, data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new student account and return a JWT token.
    - FR-01: Allow registration with name, email, password
    - FR-02: Validates email uniqueness
    - FR-03: Passwords are hashed with bcrypt
    Rate limited: 5 registrations per minute per IP.
    """
    return auth_service.register_user(db, data)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
def login(request: Request, data: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate an existing user and return a JWT access token.
    - FR-04: Issues JWT token on success
    - NFR-06: Token expires after 24 hours
    Rate limited: 10 attempts per minute per IP (brute-force protection).
    """
    return auth_service.login_user(db, data)


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit("20/minute")
def refresh_token(request: Request, data: RefreshRequest, db: Session = Depends(get_db)):
    """
    Exchange a valid refresh token for a new access token + refresh token pair.
    Allows the frontend to silently re-authenticate without forcing a new login.
    """
    return auth_service.refresh_tokens(db, data.refresh_token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Return the current authenticated user's profile (FR-07).
    Requires a valid Bearer token.
    """
    return current_user


@router.put("/me", response_model=UserResponse)
def update_me(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update the current user's profile details (FR-07).
    Email and role cannot be changed through this endpoint.
    """
    return auth_service.update_profile(db, current_user, data)


@router.post("/google", response_model=TokenResponse)
@limiter.limit("10/minute")
async def google_auth(request: Request, data: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Sign in or register via Google OAuth.
    Accepts the access token from the frontend Google login flow,
    verifies it with Google, and returns a MindBridge JWT pair.
    Only university Google accounts (.edu, .ac.XX, .edu.cm) are accepted.
    """
    return await auth_service.google_auth(db, data.access_token)


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
@limiter.limit("3/minute")
def forgot_password(request: Request, data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Request a password reset email.
    Always returns 200 — never reveals whether the email is registered (prevents enumeration).
    Rate limited: 3 requests per minute per IP.
    """
    auth_service.request_password_reset(db, data.email)
    return {"message": "If that email is registered, a reset link has been sent"}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
@limiter.limit("5/minute")
def reset_password(request: Request, data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Reset the user's password using a valid reset token.
    Returns 400 if the token is invalid, wrong type, or expired.
    """
    return auth_service.reset_password(db, data.token, data.new_password)


@router.delete("/me", status_code=status.HTTP_200_OK)
def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role),
):
    """
    Permanently delete the authenticated user's account and all associated data.
    Journal entries are cascade-deleted. Resources remain (created_by set to NULL).
    """
    return auth_service.delete_account(db, current_user)
