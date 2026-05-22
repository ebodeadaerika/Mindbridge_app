"""
MindBridge — Crisis Tests
Tests for: flag submission, admin listing, resolution
Coverage targets: FR-26 to FR-31
"""
import pytest
import uuid


class TestCrisisSubmission:
    def test_submit_flag_low(self, client, student_token):
        """FR-26, FR-27: Student can submit a low-severity crisis flag."""
        response = client.post(
            "/api/v1/crisis/flag",
            json={"severity": "low", "message": "I've been feeling anxious lately."},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 201
        data = response.json()
        assert data["severity"] == "low"
        assert data["resolved"] == False
        assert "id" in data

    def test_submit_flag_high_no_message(self, client, student_token):
        """Message is optional — high severity flag without message is valid."""
        response = client.post(
            "/api/v1/crisis/flag",
            json={"severity": "high"},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 201
        assert response.json()["message"] is None

    def test_submit_flag_no_identity(self, client, student_token, db):
        """FR-31: No user identity is stored with the crisis flag."""
        from app.models.crisis import CrisisFlag
        client.post(
            "/api/v1/crisis/flag",
            json={"severity": "medium"},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        flag = db.query(CrisisFlag).first()
        assert flag is not None
        # CrisisFlag has no user_id column — verify it doesn't exist
        assert not hasattr(flag, "user_id")

    def test_submit_flag_invalid_severity(self, client, student_token):
        """Only low/medium/high are valid severity values."""
        response = client.post(
            "/api/v1/crisis/flag",
            json={"severity": "extreme"},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 422

    def test_submit_flag_requires_auth(self, client):
        """Crisis submission requires authentication."""
        response = client.post("/api/v1/crisis/flag", json={"severity": "low"})
        assert response.status_code == 401


class TestCrisisAdmin:
    def test_admin_list_all_alerts(self, client, student_token, admin_token):
        """FR-29: Admin can view all pending crisis flags."""
        headers_student = {"Authorization": f"Bearer {student_token}"}
        headers_admin = {"Authorization": f"Bearer {admin_token}"}

        client.post("/api/v1/crisis/flag", json={"severity": "high"}, headers=headers_student)
        client.post("/api/v1/crisis/flag", json={"severity": "low"}, headers=headers_student)

        response = client.get("/api/v1/crisis/alerts", headers=headers_admin)
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        assert data["pending_count"] == 2
        assert data["resolved_count"] == 0

    def test_admin_filter_pending(self, client, student_token, admin_token):
        """Admin can filter by resolved status."""
        headers_student = {"Authorization": f"Bearer {student_token}"}
        headers_admin = {"Authorization": f"Bearer {admin_token}"}

        client.post("/api/v1/crisis/flag", json={"severity": "medium"}, headers=headers_student)

        response = client.get("/api/v1/crisis/alerts?resolved=false", headers=headers_admin)
        assert response.json()["total"] == 1

    def test_student_cannot_view_alerts(self, client, student_token):
        """NFR-08: Students cannot access the admin alerts endpoint."""
        response = client.get(
            "/api/v1/crisis/alerts",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 403

    def test_resolve_flag(self, client, student_token, admin_token):
        """FR-30: Admin can mark a crisis flag as resolved."""
        headers_student = {"Authorization": f"Bearer {student_token}"}
        headers_admin = {"Authorization": f"Bearer {admin_token}"}

        submit = client.post("/api/v1/crisis/flag",
                             json={"severity": "high"}, headers=headers_student)
        flag_id = submit.json()["id"]

        response = client.put(
            f"/api/v1/crisis/alerts/{flag_id}/resolve",
            json={"resolution_note": "Student was reached and offered counselling."},
            headers=headers_admin
        )
        assert response.status_code == 200
        data = response.json()
        assert data["resolved"] == True
        assert data["resolution_note"] == "Student was reached and offered counselling."

    def test_resolve_already_resolved(self, client, student_token, admin_token):
        """Cannot resolve an already-resolved flag."""
        headers_student = {"Authorization": f"Bearer {student_token}"}
        headers_admin = {"Authorization": f"Bearer {admin_token}"}

        submit = client.post("/api/v1/crisis/flag",
                             json={"severity": "low"}, headers=headers_student)
        flag_id = submit.json()["id"]
        client.put(f"/api/v1/crisis/alerts/{flag_id}/resolve",
                   json={}, headers=headers_admin)
        response = client.put(f"/api/v1/crisis/alerts/{flag_id}/resolve",
                               json={}, headers=headers_admin)
        assert response.status_code == 409

    def test_resolve_nonexistent_flag(self, client, admin_token):
        """Returns 404 for nonexistent flag ID."""
        response = client.put(
            f"/api/v1/crisis/alerts/{uuid.uuid4()}/resolve",
            json={},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 404
