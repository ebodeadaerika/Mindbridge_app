"""
MindBridge — Database Utilities
Generic helpers for common ORM operations.
"""
from typing import TypeVar, Type

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

T = TypeVar("T")


def get_or_404(db: Session, model: Type[T], record_id, *, detail: str = "Not found") -> T:
    """
    Fetch a single record by primary key or raise HTTP 404.
    Eliminates the repeated query-then-check-None pattern across services.
    """
    record = db.query(model).filter(model.id == record_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)
    return record
