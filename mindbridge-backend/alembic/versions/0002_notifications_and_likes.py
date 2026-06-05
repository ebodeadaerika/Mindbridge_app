"""Add notification prefs to users + post_likes table

Revision ID: 0002_notifications_and_likes
Revises: 0001_initial_schema
Create Date: 2026-05-21 00:00:00.000000
"""
from alembic import op

# revision identifiers
revision = "0002_notifications_and_likes"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        -- Notification preferences on the users table
        ALTER TABLE users
            ADD COLUMN IF NOT EXISTS notif_mood_reminder BOOLEAN NOT NULL DEFAULT TRUE,
            ADD COLUMN IF NOT EXISTS notif_forum_replies BOOLEAN NOT NULL DEFAULT TRUE;

        -- Post likes — anonymous like tracking (privacy: no user_id, only anon_token)
        CREATE TABLE IF NOT EXISTS post_likes (
            id          UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
            post_id     UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
            anon_token  VARCHAR(255) NOT NULL,
            created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            CONSTRAINT uq_post_like_anon UNIQUE (post_id, anon_token)
        );
        CREATE INDEX IF NOT EXISTS ix_post_likes_post_id ON post_likes (post_id);
    """)


def downgrade() -> None:
    op.execute("""
        DROP TABLE IF EXISTS post_likes;
        ALTER TABLE users
            DROP COLUMN IF EXISTS notif_mood_reminder,
            DROP COLUMN IF EXISTS notif_forum_replies;
    """)
