"""
MindBridge — Resource Routes
GET /resources, POST /resources, PUT /resources/{id}, DELETE /resources/{id}
"""
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from app.database import get_db
from app.models.resource import ResourceCategory
from app.schemas.resource import ResourceCreate, ResourceUpdate, ResourceResponse, ResourceListResponse
from app.services import resource_service
from app.middleware.roles import require_any_role, require_admin
from app.models.user import User

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.get("", response_model=ResourceListResponse)
def list_resources(
    category: Optional[ResourceCategory] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_any_role),
):
    """
    Browse the resource library (FR-32).
    Optionally filter by category: article, breathing, coping, hotline (FR-36).
    """
    return resource_service.list_resources(db, category=category)


@router.post("", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
def create_resource(
    data: ResourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Create a new resource — admin only (FR-35, FR-44)."""
    return resource_service.create_resource(db, current_user, data)


@router.put("/{resource_id}", response_model=ResourceResponse)
def update_resource(
    resource_id: UUID,
    data: ResourceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Update an existing resource — admin only."""
    return resource_service.update_resource(db, resource_id, data)


@router.delete("/{resource_id}", status_code=status.HTTP_200_OK)
def delete_resource(
    resource_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Delete a resource — admin only (FR-35)."""
    return resource_service.delete_resource(db, resource_id)
