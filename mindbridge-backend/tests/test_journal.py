"""
MindBridge — Journal Tests
Tests for: create, list, get, update, delete journal entries
Coverage targets: FR-16 to FR-20
"""
import pytest


class TestJournalCRUD:
    def test_create_entry(self, client, student_token):
        """FR-16, FR-17: Student can create a private journal entry."""
        response = client.post(
            "/api/v1/journal/entry",
            json={"title": "My First Entry", "body": "Today was a tough day but I got through it."},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "My First Entry"
        assert "id" in data
        assert "created_at" in data

    def test_list_entries_empty(self, client, student_token):
        """FR-18: Empty list returned when no entries exist."""
        response = client.get(
            "/api/v1/journal/entries",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 200
        assert response.json()["entries"] == []

    def test_list_entries_after_create(self, client, student_token):
        """FR-18: Created entries appear in list."""
        headers = {"Authorization": f"Bearer {student_token}"}
        client.post("/api/v1/journal/entry",
                    json={"title": "Entry 1", "body": "Body 1"}, headers=headers)
        client.post("/api/v1/journal/entry",
                    json={"title": "Entry 2", "body": "Body 2"}, headers=headers)
        response = client.get("/api/v1/journal/entries", headers=headers)
        assert response.json()["total"] == 2

    def test_get_single_entry(self, client, student_token):
        """Can retrieve a single entry by ID."""
        headers = {"Authorization": f"Bearer {student_token}"}
        create = client.post("/api/v1/journal/entry",
                             json={"title": "Single", "body": "Content"}, headers=headers)
        entry_id = create.json()["id"]

        response = client.get(f"/api/v1/journal/entry/{entry_id}", headers=headers)
        assert response.status_code == 200
        assert response.json()["title"] == "Single"

    def test_update_entry(self, client, student_token):
        """Can update an existing journal entry."""
        headers = {"Authorization": f"Bearer {student_token}"}
        create = client.post("/api/v1/journal/entry",
                             json={"title": "Old Title", "body": "Old body"}, headers=headers)
        entry_id = create.json()["id"]

        response = client.put(
            f"/api/v1/journal/entry/{entry_id}",
            json={"title": "New Title"},
            headers=headers
        )
        assert response.status_code == 200
        assert response.json()["title"] == "New Title"
        assert response.json()["body"] == "Old body"

    def test_delete_entry(self, client, student_token):
        """FR-19: Student can delete their own entry."""
        headers = {"Authorization": f"Bearer {student_token}"}
        create = client.post("/api/v1/journal/entry",
                             json={"title": "To Delete", "body": "Bye"}, headers=headers)
        entry_id = create.json()["id"]

        response = client.delete(f"/api/v1/journal/entry/{entry_id}", headers=headers)
        assert response.status_code == 200

        # Verify it's gone
        get_response = client.get(f"/api/v1/journal/entry/{entry_id}", headers=headers)
        assert get_response.status_code == 404


class TestJournalPrivacy:
    def test_admin_cannot_list_entries(self, client, admin_token):
        """FR-20, FR-46: Admin cannot access journal entries."""
        response = client.get(
            "/api/v1/journal/entries",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 403

    def test_cross_user_access_blocked(self, client):
        """FR-20: One student cannot access another student's entries."""
        # Register two students
        r1 = client.post("/api/v1/auth/register",
                         json={"name": "Alice", "email": "alice@university.edu", "password": "Pass1234"})
        r2 = client.post("/api/v1/auth/register",
                         json={"name": "Bob", "email": "bob@university.edu", "password": "Pass1234"})
        token1 = r1.json()["access_token"]
        token2 = r2.json()["access_token"]

        # Alice creates an entry
        create = client.post("/api/v1/journal/entry",
                             json={"title": "Alice's Secret", "body": "Private"},
                             headers={"Authorization": f"Bearer {token1}"})
        entry_id = create.json()["id"]

        # Bob tries to access Alice's entry — should get 404 (not 403, to avoid confirming existence)
        response = client.get(
            f"/api/v1/journal/entry/{entry_id}",
            headers={"Authorization": f"Bearer {token2}"}
        )
        assert response.status_code == 404
