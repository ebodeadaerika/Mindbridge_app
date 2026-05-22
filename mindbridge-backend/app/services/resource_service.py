"""
MindBridge — Resource Service
Business logic for mental health resource library.
Only admins can create/delete resources; any authenticated user can browse (FR-32, FR-35).
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from uuid import UUID

from app.models.resource import Resource, ResourceCategory
from app.models.user import User
from app.schemas.resource import ResourceCreate, ResourceUpdate, ResourceResponse, ResourceListResponse


def list_resources(db: Session, category: ResourceCategory = None) -> ResourceListResponse:
    """Return all resources, optionally filtered by category (FR-32, FR-36)."""
    query = db.query(Resource)
    if category:
        query = query.filter(Resource.category == category)
    resources = query.order_by(Resource.created_at.desc()).all()
    return ResourceListResponse(
        resources=[ResourceResponse.model_validate(r) for r in resources],
        total=len(resources),
    )


def create_resource(db: Session, admin: User, data: ResourceCreate) -> ResourceResponse:
    """Create a new resource — admin only (FR-35, FR-44)."""
    resource = Resource(
        title=data.title,
        category=data.category,
        description=data.description,
        url=data.url,
        created_by=admin.id,
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return ResourceResponse.model_validate(resource)


def update_resource(db: Session, resource_id: UUID, data: ResourceUpdate) -> ResourceResponse:
    """Update an existing resource — admin only."""
    resource = _get_or_404(db, resource_id)
    if data.title is not None:
        resource.title = data.title
    if data.category is not None:
        resource.category = data.category
    if data.description is not None:
        resource.description = data.description
    if data.url is not None:
        resource.url = data.url
    db.commit()
    db.refresh(resource)
    return ResourceResponse.model_validate(resource)


def delete_resource(db: Session, resource_id: UUID) -> dict:
    """Delete a resource — admin only (FR-35)."""
    resource = _get_or_404(db, resource_id)
    db.delete(resource)
    db.commit()
    return {"message": "Resource deleted successfully"}


def _get_or_404(db: Session, resource_id: UUID) -> Resource:
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    return resource
