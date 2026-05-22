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
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.limiter import limiter
from app.routes import auth, mood, journal, forum, crisis, resources, ai

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
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Register rate limiter state and 429 handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS Middleware ─────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


# ── Root Redirect ──────────────────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
def root():
    return {
        "message": "Welcome to the MindBridge API",
        "docs": "/docs",
        "health": "/health",
    }


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
