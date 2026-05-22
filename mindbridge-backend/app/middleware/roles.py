"""
MindBridge — Role-Based Access Control
FastAPI dependencies that enforce Student vs Admin role requirements.
Returns HTTP 403 if the role requirement is not met (NFR-08).
"""
from fastapi import Depends, HTTPException, status
from app.models.user import User, UserRole
from app.middleware.auth import get_current_user


def require_student(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency — allows access only to users with the 'student' role.
    Admins are intentionally excluded from student-only operations
    to prevent accidental data access (privacy by design).
    """
    if current_user.role != UserRole.student:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is restricted to student accounts",
        )
    return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency — allows access only to users with the 'admin' role.
    Returns 403 if a student token is used (NFR-08).
    """
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is restricted to admin accounts",
        )
    return current_user


def require_any_role(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency — allows access to any authenticated user regardless of role.
    """
    return current_user
