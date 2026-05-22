"""
MindBridge — Mood Tests
Tests for: check-in, history, trends endpoints
Coverage targets: FR-09 to FR-15
"""
import pytest
from unittest.mock import patch
from datetime import date


class TestMoodCheckin:
    def test_checkin_success(self, client, student_token):
        """FR-09, FR-10: Student can submit a daily mood check-in."""
        response = client.post(
            "/api/v1/mood/checkin",
            json={"mood_score": 4, "energy_level": 3, "note": "Feeling okay today"},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 201
        data = response.json()
        assert data["mood_score"] == 4
        assert data["energy_level"] == 3
        assert data["note"] == "Feeling okay today"
        assert "id" in data

    def test_checkin_no_note(self, client, student_token):
        """FR-10: Note is optional."""
        response = client.post(
            "/api/v1/mood/checkin",
            json={"mood_score": 3, "energy_level": 3},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 201
        assert response.json()["note"] is None

    def test_checkin_invalid_score(self, client, student_token):
        """Mood score must be 1-5."""
        response = client.post(
            "/api/v1/mood/checkin",
            json={"mood_score": 6, "energy_level": 3},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 422

    def test_checkin_duplicate_today(self, client, student_token):
        """FR-11: Only one check-in per student per calendar day."""
        payload = {"mood_score": 3, "energy_level": 3}
        headers = {"Authorization": f"Bearer {student_token}"}
        client.post("/api/v1/mood/checkin", json=payload, headers=headers)
        response = client.post("/api/v1/mood/checkin", json=payload, headers=headers)
        assert response.status_code == 409
        assert "already checked in" in response.json()["detail"]

    def test_checkin_requires_auth(self, client):
        """FR-05: Check-in requires authentication."""
        response = client.post(
            "/api/v1/mood/checkin",
            json={"mood_score": 3, "energy_level": 3}
        )
        assert response.status_code == 401

    def test_checkin_admin_forbidden(self, client, admin_token):
        """Admin cannot submit check-ins — student only."""
        response = client.post(
            "/api/v1/mood/checkin",
            json={"mood_score": 3, "energy_level": 3},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 403


class TestMoodHistory:
    def test_history_empty(self, client, student_token):
        """FR-13: Empty history returns empty list."""
        response = client.get(
            "/api/v1/mood/history",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 200
        assert response.json()["entries"] == []
        assert response.json()["total"] == 0

    def test_history_after_checkin(self, client, student_token):
        """FR-13: History contains submitted check-ins."""
        headers = {"Authorization": f"Bearer {student_token}"}
        client.post("/api/v1/mood/checkin", json={"mood_score": 4, "energy_level": 3}, headers=headers)
        response = client.get("/api/v1/mood/history", headers=headers)
        assert response.status_code == 200
        assert response.json()["total"] == 1
        assert response.json()["entries"][0]["mood_score"] == 4

    def test_history_requires_student(self, client, admin_token):
        """History is student-only."""
        response = client.get(
            "/api/v1/mood/history",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 403


class TestMoodTrends:
    def test_trends_admin_access(self, client, admin_token, student_token):
        """FR-14: Admin can view campus trends."""
        # Submit a check-in first
        client.post(
            "/api/v1/mood/checkin",
            json={"mood_score": 4, "energy_level": 3},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        response = client.get(
            "/api/v1/mood/trends",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "average_mood" in data
        assert "total_checkins" in data
        assert "mood_distribution" in data
        assert data["total_checkins"] == 1

    def test_trends_student_forbidden(self, client, student_token):
        """NFR-08: Students cannot access admin trend data."""
        response = client.get(
            "/api/v1/mood/trends",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 403

    def test_trends_no_individual_entries(self, client, admin_token, student_token):
        """FR-14: Trends endpoint never returns individual anon_tokens."""
        client.post(
            "/api/v1/mood/checkin",
            json={"mood_score": 2, "energy_level": 1},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        response = client.get(
            "/api/v1/mood/trends",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        data = response.json()
        assert "anon_token" not in str(data)
        assert "user_id" not in str(data)
