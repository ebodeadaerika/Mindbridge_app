#!/bin/bash
# ── MindBridge — Render.com startup script ────────────────────────────────────
# Runs database migrations then starts the FastAPI server.
# Render injects PORT env var; falls back to 8000 for local/Docker Compose.
set -e

# ── Fix Render's legacy postgres:// prefix (SQLAlchemy 2.0 needs postgresql://)
if [[ "$DATABASE_URL" == postgres://* ]]; then
    export DATABASE_URL="postgresql://${DATABASE_URL#postgres://}"
    echo "[start.sh] Fixed DATABASE_URL prefix: postgres:// → postgresql://"
fi

echo "[start.sh] Running Alembic migrations..."
alembic upgrade head
echo "[start.sh] Migrations complete."

echo "[start.sh] Starting MindBridge API on port ${PORT:-8000}..."
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port "${PORT:-8000}" \
    --workers 1 \
    --log-level info
