"""
MindBridge — Test Configuration
Shared fixtures for all test modules.
Uses an in-memory SQLite database to avoid needing a real PostgreSQL instance during tests.
"""
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models.user import User, UserRole
from app.services.auth_service import hash_password

# ── Test Database ──────────────────────────────────────────────────────────────
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def setup_database():
    """Create all tables before each test and drop them after."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(autouse=True)
def mock_dns():
    """Bypass DNS MX lookup in all tests — avoids network dependency."""
    with patch("app.schemas.user._domain_has_mx", return_value=True):
        yield


@pytest.fixture(autouse=True)
def disable_rate_limiting():
    """Disable slowapi rate limiting in tests by setting limiter.enabled = False."""
    from app.limiter import limiter as _limiter
    original = _limiter.enabled
    _limiter.enabled = False
    yield
    _limiter.enabled = original


@pytest.fixture
def db():
    """Yield a test database session."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db):
    """Create a FastAPI test client with the test database injected."""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# ── Test Data Fixtures ─────────────────────────────────────────────────────────

@pytest.fixture
def student_user(db):
    """Create a test student user."""
    user = User(
        name="Test Student",
        email="student@university.edu",
        password_hash=hash_password("Password123"),
        role=UserRole.student,
        university="ICT University of Cameroon",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def admin_user(db):
    """Create a test admin user."""
    user = User(
        name="Test Admin",
        email="admin@university.edu",
        password_hash=hash_password("Admin123"),
        role=UserRole.admin,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def student_token(client):
    """Register a student and return their auth token."""
    response = client.post("/api/v1/auth/register", json={
        "name": "Student User",
        "email": "student@mindbridge.edu",
        "password": "Password123",
    })
    assert response.status_code == 201, f"Registration failed: {response.json()}"
    return response.json()["access_token"]


@pytest.fixture
def admin_token(client, db):
    """Create an admin user and return their auth token."""
    admin = User(
        name="Admin User",
        email="admin@mindbridge.edu",
        password_hash=hash_password("Admin123"),
        role=UserRole.admin,
    )
    db.add(admin)
    db.commit()

    response = client.post("/api/v1/auth/login", json={
        "email": "admin@mindbridge.edu",
        "password": "Admin123",
    })
    assert response.status_code == 200, f"Admin login failed: {response.json()}"
    return response.json()["access_token"]
