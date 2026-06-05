"""Add bio column to users

Revision ID: 0003_bio
Revises: 0002_notifications_and_likes
Create Date: 2026-05-21 00:00:00.000000
"""
from alembic import op

revision = "0003_bio"
down_revision = "0002_notifications_and_likes"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        ALTER TABLE users
            ADD COLUMN IF NOT EXISTS bio TEXT;
    """)


def downgrade() -> None:
    op.execute("""
        ALTER TABLE users
            DROP COLUMN IF EXISTS bio;
    """)
