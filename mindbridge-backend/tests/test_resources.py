"""
MindBridge — Resource Tests
Tests for: listing, admin create, update, delete
Coverage targets: FR-32 to FR-36
"""
import pytest
import uuid


class TestResourceListing:
    def test_list_resources_empty(self, client, student_token):
        """FR-32: Empty list returned when no resources exist."""
        response = client.get(
            "/api/v1/resources",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 200
        assert response.json()["resources"] == []
        assert response.json()["total"] == 0

    def test_list_resources_with_data(self, client, student_token, admin_token):
        """FR-32: Students can browse resources."""
        client.post(
            "/api/v1/resources",
            json={"title": "Breathing Exercise", "category": "breathing",
                  "description": "4-7-8 technique"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        response = client.get(
            "/api/v1/resources",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.json()["total"] == 1
        assert response.json()["resources"][0]["title"] == "Breathing Exercise"

    def test_filter_by_category(self, client, student_token, admin_token):
        """FR-36: Resources can be filtered by category."""
        admin_h = {"Authorization": f"Bearer {admin_token}"}
        client.post("/api/v1/resources",
                    json={"title": "R1", "category": "article"}, headers=admin_h)
        client.post("/api/v1/resources",
                    json={"title": "R2", "category": "hotline"}, headers=admin_h)

        response = client.get(
            "/api/v1/resources?category=article",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.json()["total"] == 1
        assert response.json()["resources"][0]["category"] == "article"

    def test_list_requires_auth(self, client):
        """Resource list requires authentication."""
        response = client.get("/api/v1/resources")
        assert response.status_code == 401


class TestResourceAdmin:
    def test_admin_create_resource(self, client, admin_token):
        """FR-35, FR-44: Admin can create resources."""
        response = client.post(
            "/api/v1/resources",
            json={
                "title": "Managing Test Anxiety",
                "category": "article",
                "description": "Evidence-based strategies",
                "url": "https://mindbridge.cm/articles/anxiety"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Managing Test Anxiety"
        assert data["category"] == "article"
        assert "id" in data

    def test_student_cannot_create_resource(self, client, student_token):
        """FR-35: Students cannot create resources."""
        response = client.post(
            "/api/v1/resources",
            json={"title": "Hack", "category": "article"},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 403

    def test_admin_update_resource(self, client, admin_token):
        """Admin can update a resource."""
        create = client.post(
            "/api/v1/resources",
            json={"title": "Old Title", "category": "coping"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        resource_id = create.json()["id"]

        response = client.put(
            f"/api/v1/resources/{resource_id}",
            json={"title": "New Title"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        assert response.json()["title"] == "New Title"

    def test_admin_delete_resource(self, client, admin_token, student_token):
        """FR-35: Admin can delete resources."""
        create = client.post(
            "/api/v1/resources",
            json={"title": "To Delete", "category": "breathing"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        resource_id = create.json()["id"]

        response = client.delete(
            f"/api/v1/resources/{resource_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200

        # Verify gone
        list_resp = client.get(
            "/api/v1/resources",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert list_resp.json()["total"] == 0

    def test_delete_nonexistent_resource(self, client, admin_token):
        """Returns 404 for nonexistent resource."""
        response = client.delete(
            f"/api/v1/resources/{uuid.uuid4()}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 404

    def test_invalid_category_rejected(self, client, admin_token):
        """Invalid category is rejected by Pydantic validation."""
        response = client.post(
            "/api/v1/resources",
            json={"title": "Test", "category": "invalid_category"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 422
