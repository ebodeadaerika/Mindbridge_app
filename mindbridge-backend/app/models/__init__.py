"""
MindBridge — Models Package
Import all models here so Alembic can discover them for migrations.
"""
from app.models.user import User, UserRole
from app.models.mood import MoodLog
from app.models.journal import JournalEntry
from app.models.forum import ForumPost, ForumReply
from app.models.crisis import CrisisFlag, CrisisSeverity
from app.models.resource import Resource, ResourceCategory

__all__ = [
    "User", "UserRole",
    "MoodLog",
    "JournalEntry",
    "ForumPost", "ForumReply",
    "CrisisFlag", "CrisisSeverity",
    "Resource", "ResourceCategory",
]
