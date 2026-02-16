from __future__ import annotations

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from news.models import NewsArticle, Section

User = get_user_model()


class ApiAuthAndPermissionsTests(APITestCase):
    def _create_user(self, *, username: str, email: str, password: str, role: str = "USER") -> User:
        user = User.objects.create_user(username=username, email=email, password=password)
        user.role = role
        user.save(update_fields=["role"])
        return user

    def _access_token_for(self, *, username: str, password: str) -> str:
        url = reverse("token-obtain")
        res = self.client.post(url, {"username": username, "password": password}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
        self.assertIn("access", res.data)
        return res.data["access"]

    def test_register_then_token_then_me(self):
        # Register
        register_url = reverse("auth-register")
        res = self.client.post(
            register_url,
            {"username": "alice", "email": "alice@example.com", "password": "StrongPass123"},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)

        # Unauthenticated /me should be rejected
        me_url = reverse("auth-me")
        res = self.client.get(me_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED, res.data)

        # Obtain token and call /me
        access = self._access_token_for(username="alice", password="StrongPass123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        res = self.client.get(me_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
        self.assertEqual(res.data["username"], "alice")

    def test_users_admin_endpoint_requires_super_admin(self):
        self._create_user(username="bob", email="bob@example.com", password="StrongPass123", role="USER")
        access = self._access_token_for(username="bob", password="StrongPass123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        users_url = reverse("users-list")
        res = self.client.get(users_url)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN, res.data)

        # Super admin should be allowed
        self.client.credentials()
        self._create_user(username="root", email="root@example.com", password="StrongPass123", role="SUPER_ADMIN")
        access = self._access_token_for(username="root", password="StrongPass123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        res = self.client.get(users_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)

    def test_public_sections_list_and_editor_article_create_permission(self):
        section = Section.objects.create(name_en="Sports", slug="sports", order=1, is_active=True)

        # Public sections list should work
        sections_url = reverse("news-sections-list")
        res = self.client.get(sections_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)

        # Create article requires editor/super admin
        articles_url = reverse("news-articles-list")
        payload = {
            "title_en": "Test Article",
            "slug": "test-article",
            "content_en": "hello",
            "section": section.id,
            "status": "PUBLISHED",
        }

        self._create_user(username="charlie", email="charlie@example.com", password="StrongPass123", role="USER")
        access = self._access_token_for(username="charlie", password="StrongPass123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        res = self.client.post(articles_url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN, res.data)

        self.client.credentials()
        self._create_user(username="ed", email="ed@example.com", password="StrongPass123", role="EDITOR")
        access = self._access_token_for(username="ed", password="StrongPass123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        res = self.client.post(articles_url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)
        self.assertTrue(NewsArticle.objects.filter(slug="test-article").exists())
