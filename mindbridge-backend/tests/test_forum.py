"""
MindBridge — Forum Tests
Tests for: post listing, create post, reply, admin delete
Coverage targets: FR-21 to FR-25
"""
import pytest


class TestForumPosts:
    def test_list_posts_empty(self, client, student_token):
        """Returns empty list when no posts exist."""
        response = client.get(
            "/api/v1/forum/posts",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 200
        assert response.json()["posts"] == []
        assert response.json()["total"] == 0

    def test_create_post(self, client, student_token):
        """FR-21, FR-22: Student can create an anonymous forum post."""
        response = client.post(
            "/api/v1/forum/post",
            json={"body": "I'm struggling with exam stress, any tips?", "category": "Exams"},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 201
        data = response.json()
        assert data["body"] == "I'm struggling with exam stress, any tips?"
        assert "anon_name" in data
        assert len(data["anon_name"]) > 0

    def test_post_has_anonymous_name(self, client, student_token):
        """FR-22: Post uses auto-generated animal name, not the user's real name."""
        response = client.post(
            "/api/v1/forum/post",
            json={"body": "Test post"},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        anon_name = response.json()["anon_name"]
        # Should be a two-word name like "Blue Sparrow"
        assert len(anon_name.split()) == 2
        # Should not contain "Student User" (the actual user's name)
        assert "Student" not in anon_name

    def test_list_posts_after_create(self, client, student_token):
        """Posts appear in listing after creation."""
        headers = {"Authorization": f"Bearer {student_token}"}
        client.post("/api/v1/forum/post", json={"body": "Post 1"}, headers=headers)
        client.post("/api/v1/forum/post", json={"body": "Post 2"}, headers=headers)
        response = client.get("/api/v1/forum/posts", headers=headers)
        assert response.json()["total"] == 2

    def test_filter_by_category(self, client, student_token):
        """FR-25: Posts can be filtered by category."""
        headers = {"Authorization": f"Bearer {student_token}"}
        client.post("/api/v1/forum/post", json={"body": "A", "category": "Anxiety"}, headers=headers)
        client.post("/api/v1/forum/post", json={"body": "B", "category": "Exams"}, headers=headers)

        response = client.get("/api/v1/forum/posts?category=Anxiety", headers=headers)
        assert response.json()["total"] == 1

    def test_post_body_max_500(self, client, student_token):
        """Post body cannot exceed 500 characters."""
        response = client.post(
            "/api/v1/forum/post",
            json={"body": "x" * 501},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 422


class TestForumReplies:
    def test_add_reply(self, client, student_token):
        """FR-23: Student can reply to a forum post."""
        headers = {"Authorization": f"Bearer {student_token}"}
        post = client.post("/api/v1/forum/post",
                           json={"body": "Original post"}, headers=headers)
        post_id = post.json()["id"]

        response = client.post(
            f"/api/v1/forum/post/{post_id}/reply",
            json={"body": "You're not alone, I feel the same way!"},
            headers=headers
        )
        assert response.status_code == 201
        data = response.json()
        assert "anon_name" in data
        assert data["body"] == "You're not alone, I feel the same way!"

    def test_reply_to_nonexistent_post(self, client, student_token):
        """Replying to a nonexistent post returns 404."""
        import uuid
        response = client.post(
            f"/api/v1/forum/post/{uuid.uuid4()}/reply",
            json={"body": "Reply"},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 404

    def test_get_post_detail_with_replies(self, client, student_token):
        """Post detail includes all replies."""
        headers = {"Authorization": f"Bearer {student_token}"}
        post = client.post("/api/v1/forum/post", json={"body": "Hello"}, headers=headers)
        post_id = post.json()["id"]
        client.post(f"/api/v1/forum/post/{post_id}/reply",
                    json={"body": "Reply 1"}, headers=headers)

        response = client.get(f"/api/v1/forum/post/{post_id}", headers=headers)
        assert response.status_code == 200
        assert len(response.json()["replies"]) == 1


class TestForumModeration:
    def test_admin_can_delete_post(self, client, student_token, admin_token):
        """FR-24: Admin can delete posts that violate guidelines."""
        post = client.post(
            "/api/v1/forum/post",
            json={"body": "Inappropriate post"},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        post_id = post.json()["id"]

        response = client.delete(
            f"/api/v1/forum/post/{post_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200

        # Post no longer appears in listing
        list_resp = client.get(
            "/api/v1/forum/posts",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert list_resp.json()["total"] == 0

    def test_student_cannot_delete_post(self, client, student_token):
        """FR-24: Students cannot moderate posts."""
        post = client.post(
            "/api/v1/forum/post",
            json={"body": "My post"},
            headers={"Authorization": f"Bearer {student_token}"}
        )
        post_id = post.json()["id"]

        response = client.delete(
            f"/api/v1/forum/post/{post_id}",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert response.status_code == 403
