# ── MindBridge Backend — Dockerfile ──────────────────────────────────────────
# Multi-stage build: smaller production image
# Python 3.11 | FastAPI | Uvicorn

FROM python:3.11-slim AS base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# ── Dependencies Stage ────────────────────────────────────────────────────────
FROM base AS deps

COPY requirements.txt .
RUN pip install --break-system-packages --no-cache-dir -r requirements.txt

# ── Production Stage ──────────────────────────────────────────────────────────
FROM deps AS production

# Copy application source
COPY . .

# Make start.sh executable (used by Render.com startCommand)
RUN chmod +x /app/start.sh

# Create non-root user for security
RUN adduser --disabled-password --gecos "" appuser && \
    chown -R appuser:appuser /app
USER appuser

# Expose application port (Render.com sets $PORT; default 8000 for Docker Compose)
EXPOSE 8000

# Health check — works for both Docker Compose (fixed port 8000) and Render ($PORT)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT:-8000}/health')" || exit 1

# Default start command (Docker Compose / Kubernetes).
# Render overrides this via startCommand in render.yaml.
CMD ["/app/start.sh"]
