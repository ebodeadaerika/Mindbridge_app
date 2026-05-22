"""
MindBridge — Auth Tests
Tests for: register, login, /me endpoints
Coverage targets: FR-01 to FR-08
"""
import pytest


class TestRegister:
    def test_register_success(self, client):
        """FR-01: Student can register with name, email, password."""
        response = client.post("/api/v1/auth/register", json={
            "name": "Jane Doe",
            "email": "jane@university.edu",
            "password": "Secure123",
        })
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "jane@university.edu"
        assert data["user"]["role"] == "student"
        assert "password_hash" not in data["user"]

    def test_register_duplicate_email(self, client):
        """FR-02: System rejects duplicate email registrations."""
        payload = {"name": "User", "email": "dup@university.edu", "password": "Pass1234"}
        client.post("/api/v1/auth/register", json=payload)
        response = client.post("/api/v1/auth/register", json=payload)
        assert response.status_code == 409
        assert "already exists" in response.json()["detail"]

    def test_register_short_password(self, client):
        """FR-03: Passwords shorter than 8 chars are rejected."""
        response = client.post("/api/v1/auth/register", json={
            "name": "User",
            "email": "user@university.edu",
            "password": "short",
        })
        assert response.status_code == 422

    def test_register_invalid_email(self, client):
        """System rejects malformed email addresses."""
        response = client.post("/api/v1/auth/register", json={
            "name": "User",
            "email": "not-an-email",
            "password": "Password123",
        })
        assert response.status_code == 422

    def test_register_with_university(self, client):
        """FR-01: Optional fields (university, year_of_study) are accepted."""
        response = client.post("/api/v1/auth/register", json={
            "name": "Student",
            "email": "uni@university.edu",
            "password": "Password123",
            "university": "ICT University of Cameroon",
            "year_of_study": "Year 3",
        })
        assert response.status_code == 201
        assert response.json()["user"]["university"] == "ICT University of Cameroon"


class TestLogin:
    def test_login_success(self, client):
        """FR-04: Successful login returns JWT token."""
        client.post("/api/v1/auth/register", json={
            "name": "User", "email": "login@university.edu", "password": "Password123"
        })
        response = client.post("/api/v1/auth/login", json={
            "email": "login@university.edu", "password": "Password123"
        })
        assert response.status_code == 200
        assert "access_token" in response.json()
        assert response.json()["token_type"] == "bearer"

    def test_login_wrong_password(self, client):
        """Wrong password returns 401."""
        client.post("/api/v1/auth/register", json={
            "name": "User", "email": "wp@university.edu", "password": "Correct123"
        })
        response = client.post("/api/v1/auth/login", json={
            "email": "wp@university.edu", "password": "Wrongpassword1"
        })
        assert response.status_code == 401

    def test_login_nonexistent_email(self, client):
        """Non-existent email returns 401 (same message as wrong password — no enumeration)."""
        response = client.post("/api/v1/auth/login", json={
            "email": "nobody@university.edu", "password": "Password123"
        })
        assert response.status_code == 401


class TestProfile:
    def test_get_me(self, client, student_token):
        """FR-07: Authenticated user can retrieve their own profile."""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "student@mindbridge.edu"
        assert "password_hash" not in data

    def test_get_me_no_token(self, client):
        """FR-05: Protected endpoints reject requests without a token."""
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 401

    def test_update_me(self, client, student_token):
        """FR-07: Authenticated user can update their profile."""
        response = client.put(
            "/api/v1/auth/me",
            json={"name": "Updated Name", "university": "ICT University"},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 200
        assert response.json()["name"] == "Updated Name"
        assert response.json()["university"] == "ICT University"

    def test_update_me_invalid_token(self, client):
        """Invalid token returns 401."""
        response = client.put(
            "/api/v1/auth/me",
            json={"name": "Hacker"},
            headers={"Authorization": "Bearer fake.token.here"}
        )
        assert response.status_code == 401


class TestHealthCheck:
    def test_health_endpoint(self, client):
        """Health check returns 200."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
