"""
MindBridge — FastAPI Application Entry Point
SEN3244 Software Architecture | Spring 2026 | ICT University of Cameroon

Architecture: Layered (N-Tier)
  Presentation Layer  → Swagger UI at /docs
  API / Routes Layer  → FastAPI route handlers + middleware
  Business Logic Layer→ Services (mood_service, ai_service, etc.)
  Data Access Layer   → SQLAlchemy ORM
  Database Layer      → PostgreSQL 15
"""
import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import text
from sqlalchemy.exc import OperationalError as SAOperationalError

from app.config import settings
from app.database import engine
from app.limiter import limiter
from app.routes import auth, mood, journal, forum, crisis, resources, ai

logger = logging.getLogger(__name__)


# ── Lifespan — DB startup retry (Chaos Engineering) ───────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    On startup: wait for DB with exponential backoff so the API survives
    brief DB outages (teacher kills the db container mid-demo).
    On shutdown: dispose all pooled connections cleanly.
    """
    _max_retries = 12
    for attempt in range(1, _max_retries + 1):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("✅  Database connection established (attempt %d)", attempt)
            break
        except Exception as exc:
            wait = min(2 ** attempt, 30)  # 2, 4, 8, 16, 30, 30 … seconds
            if attempt < _max_retries:
                logger.warning(
                    "⚠️   DB not ready (attempt %d/%d): %s — retrying in %ds …",
                    attempt, _max_retries, exc, wait,
                )
                await asyncio.sleep(wait)
            else:
                logger.error(
                    "❌  DB unreachable after %d attempts — starting anyway; "
                    "requests will get 503 until DB recovers.",
                    _max_retries,
                )

    yield  # ← application is live here

    engine.dispose()
    logger.info("🔌  Database connection pool closed")

# ── App Instance ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="MindBridge API",
    description=(
        "A student mental health and wellbeing platform providing anonymous mood tracking, "
        "private journaling, peer support, crisis flagging, and an AI wellness companion.\n\n"
        "**Course:** SEN3244 — Software Architecture\n"
        "**University:** ICT University of Cameroon\n"
        "**Semester:** Spring 2026"
    ),
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
    openapi_url="/openapi.json" if settings.is_development else None,
    lifespan=lifespan,
)

# Register rate limiter state and 429 handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS Middleware ─────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# ── Prometheus Metrics (Section 4 — Monitoring) ────────────────────────────────
# Exposes /metrics endpoint for Prometheus scraping
Instrumentator().instrument(app).expose(app)

# ── Router Registration ────────────────────────────────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(mood.router, prefix=API_PREFIX)
app.include_router(journal.router, prefix=API_PREFIX)
app.include_router(forum.router, prefix=API_PREFIX)
app.include_router(crisis.router, prefix=API_PREFIX)
app.include_router(resources.router, prefix=API_PREFIX)
app.include_router(ai.router, prefix=API_PREFIX)


# ── Health Check ───────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health_check():
    """
    Simple health check endpoint used by Kubernetes liveness and readiness probes.
    Returns 200 OK when the application is running.
    """
    payload = {"status": "healthy", "app": settings.APP_NAME}
    if settings.is_development:
        payload["version"] = settings.APP_VERSION
        payload["environment"] = settings.ENVIRONMENT
    return payload


# ── Root Redirect ──────────────────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
def root():
    return {
        "message": "Welcome to the MindBridge API",
        "docs": "/docs",
        "health": "/health",
    }


# ── Database Unavailable Handler (Chaos Engineering) ──────────────────────────
@app.exception_handler(SAOperationalError)
async def db_unavailable_handler(request: Request, exc: SAOperationalError):
    """
    When the DB container is killed mid-demo the API returns a clean 503
    instead of an ugly 500.  Once Docker restarts the DB and pool_pre_ping
    re-establishes the connection, requests succeed automatically.
    """
    logger.warning("DB connection error on %s: %s", request.url.path, exc)
    return JSONResponse(
        status_code=503,
        content={
            "message": "Database temporarily unavailable. Please try again in a moment.",
            "detail": None,
        },
    )


# ── Global Exception Handler ───────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Catch unhandled exceptions and return a human-readable error message (NFR-20).
    Logs the error but never exposes stack traces in production.
    """
    if settings.is_development:
        raise exc
    return JSONResponse(
        status_code=500,
        content={
            "message": "An unexpected error occurred. Please try again later.",
            "detail": None,
        },
    )
