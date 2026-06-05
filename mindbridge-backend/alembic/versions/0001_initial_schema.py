"""Initial schema — create all MindBridge tables

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-05-20 00:00:00.000000
"""
from alembic import op

# revision identifiers
revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── Pure SQL migration — no SQLAlchemy type objects to avoid auto-CREATE TYPE ──

    op.execute("""
        CREATE TYPE userrole AS ENUM ('student', 'admin');
        CREATE TYPE crisisseverity AS ENUM ('low', 'medium', 'high');
        CREATE TYPE resourcecategory AS ENUM ('article', 'breathing', 'coping', 'hotline');

        CREATE TABLE users (
            id          UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
            name        VARCHAR(100) NOT NULL,
            email       VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role        userrole NOT NULL DEFAULT 'student',
            university  VARCHAR(200),
            year_of_study VARCHAR(50),
            created_at  TIMESTAMP NOT NULL DEFAULT NOW()
        );
        CREATE UNIQUE INDEX ix_users_email ON users (email);

        CREATE TABLE mood_logs (
            id           UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
            anon_token   VARCHAR(255) NOT NULL,
            mood_score   INTEGER NOT NULL,
            energy_level INTEGER NOT NULL,
            note         TEXT,
            date         DATE NOT NULL DEFAULT CURRENT_DATE,
            created_at   DATE NOT NULL DEFAULT CURRENT_DATE,
            CONSTRAINT uq_mood_anon_date UNIQUE (anon_token, date)
        );
        CREATE INDEX ix_mood_logs_anon_token ON mood_logs (anon_token);

        CREATE TABLE journal_entries (
            id         UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
            user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title      VARCHAR(200) NOT NULL,
            body       TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
        CREATE INDEX ix_journal_entries_user_id ON journal_entries (user_id);

        CREATE TABLE forum_posts (
            id         UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
            anon_name  VARCHAR(100) NOT NULL,
            body       TEXT NOT NULL,
            category   VARCHAR(100),
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            is_deleted BOOLEAN NOT NULL DEFAULT FALSE
        );

        CREATE TABLE forum_replies (
            id         UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
            post_id    UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
            anon_name  VARCHAR(100) NOT NULL,
            body       TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
        CREATE INDEX ix_forum_replies_post_id ON forum_replies (post_id);

        CREATE TABLE crisis_flags (
            id              UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
            severity        crisisseverity NOT NULL,
            message         TEXT,
            resolved        BOOLEAN NOT NULL DEFAULT FALSE,
            resolution_note TEXT,
            created_at      TIMESTAMP NOT NULL DEFAULT NOW()
        );

        CREATE TABLE resources (
            id          UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
            title       VARCHAR(200) NOT NULL,
            category    resourcecategory NOT NULL,
            description TEXT,
            url         VARCHAR(500),
            created_by  UUID REFERENCES users(id) ON DELETE SET NULL,
            created_at  TIMESTAMP NOT NULL DEFAULT NOW()
        );
    """)


def downgrade() -> None:
    op.execute("""
        DROP TABLE IF EXISTS resources;
        DROP TABLE IF EXISTS crisis_flags;
        DROP TABLE IF EXISTS forum_replies;
        DROP TABLE IF EXISTS forum_posts;
        DROP TABLE IF EXISTS journal_entries;
        DROP TABLE IF EXISTS mood_logs;
        DROP TABLE IF EXISTS users;
        DROP TYPE IF EXISTS resourcecategory;
        DROP TYPE IF EXISTS crisisseverity;
        DROP TYPE IF EXISTS userrole;
    """)
