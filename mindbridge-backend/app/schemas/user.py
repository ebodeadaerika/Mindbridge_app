"""
MindBridge — User Schemas (Pydantic v2)
Request/response shapes for auth and profile endpoints.
"""
import re
import dns.resolver
from functools import lru_cache
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.user import UserRole


def _strip_html(text: str) -> str:
    """Remove all HTML/script tags and collapse surrounding whitespace."""
    return re.sub(r'<[^>]+>', '', text).strip()


# Matches .edu  |  .ac.XX (e.g. .ac.uk .ac.cm .ac.za)  |  .edu.XX (e.g. .edu.ng .edu.au)
# Covers universities in the US, UK, Africa, Asia, Australia, and Latin America.
_ACADEMIC_EMAIL_RE = re.compile(
    r'@[^@]+\.(edu|ac\.[a-z]{2,4}|edu\.[a-z]{2,4})$',
    re.IGNORECASE,
)


def _is_academic_email(email: str) -> bool:
    return bool(_ACADEMIC_EMAIL_RE.search(email))


@lru_cache(maxsize=512)
def _domain_has_mx(domain: str) -> bool:
    """
    Return True if the domain has at least one MX record.
    Results are cached so repeated registrations from the same school
    don't incur extra DNS lookups. Returns True on timeout/error to
    avoid blocking legitimate users when DNS is slow.
    """
    try:
        resolver = dns.resolver.Resolver()
        resolver.lifetime = 3.0  # 3-second total timeout
        resolver.resolve(domain, 'MX')
        return True
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
        # Domain does not exist or has no MX records — definitively fake
        return False
    except Exception:
        # Timeout, network error, etc. — give benefit of the doubt
        return True


# ── Request Schemas ────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    university: Optional[str] = None
    year_of_study: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        clean = _strip_html(v)
        if not clean:
            raise ValueError("Name cannot be empty")
        return clean

    @field_validator("email")
    @classmethod
    def must_be_academic_email(cls, v: str) -> str:
        if not _is_academic_email(v):
            raise ValueError(
                "Only university email addresses are accepted "
                "(e.g. .edu, .ac.uk, .ac.cm, .edu.ng)"
            )
        domain = v.split("@")[1]
        if not _domain_has_mx(domain):
            raise ValueError(
                f"'{domain}' does not appear to be a real university domain. "
                "Please use your actual university email address."
            )
        return v

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r'[A-Z]', v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r'\d', v):
            raise ValueError("Password must contain at least one number")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    university: Optional[str] = None
    year_of_study: Optional[str] = None
    notif_mood_reminder: Optional[bool] = None
    notif_forum_replies: Optional[bool] = None

    @field_validator("bio")
    @classmethod
    def bio_clean(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return _strip_html(v).strip() or None

    @field_validator("name")
    @classmethod
    def name_clean(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        clean = _strip_html(v)
        if not clean:
            raise ValueError("Name cannot be empty")
        return clean


# ── Response Schemas ───────────────────────────────────────────────────────────

class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    role: UserRole
    bio: Optional[str] = None
    university: Optional[str] = None
    year_of_study: Optional[str] = None
    created_at: datetime
    notif_mood_reminder: bool = True
    notif_forum_replies: bool = True

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshRequest(BaseModel):
    refresh_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def must_be_academic_email(cls, v: str) -> str:
        if not _is_academic_email(v):
            raise ValueError(
                "Only university email addresses are accepted "
                "(e.g. .edu, .ac.uk, .ac.cm, .edu.ng)"
            )
        domain = v.split("@")[1]
        if not _domain_has_mx(domain):
            raise ValueError(
                f"'{domain}' does not appear to be a real university domain. "
                "Please use your actual university email address."
            )
        return v


class GoogleAuthRequest(BaseModel):
    access_token: str  # Google OAuth access token from the frontend


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not re.search(r'[A-Z]', v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r'\d', v):
            raise ValueError("Password must contain at least one number")
        return v
