from __future__ import annotations

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from news.models import NewsArticle, Section
from users.models import User


class NewsSmokeTests(APITestCase):
    def setUp(self):
        self.section = Section.objects.create(
            name_en="Sports",
            slug="sports",
            order=1,
            is_active=True,
        )
        self.editor = User.objects.create_user(
            username="editor1",
            email="editor1@example.com",
            password="StrongPass123",
        )
        self.editor.role = "EDITOR"
        self.editor.save(update_fields=["role"])

    def _access_token_for(self, username: str, password: str) -> str:
        url = reverse("token-obtain")
        res = self.client.post(url, {"username": username, "password": password}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
        return res.data["access"]

    def test_public_articles_list_and_detail(self):
        # Create a published article directly via ORM
        article = NewsArticle.objects.create(
            title_en="Hello world",
            slug="hello-world",
            content_en="hello",
            section=self.section,
            author=self.editor,
            status="PUBLISHED",
        )

        list_url = reverse("news-articles-list")
        res = self.client.get(list_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
        self.assertGreaterEqual(len(res.data.get("results", [])), 1)

        detail_url = reverse("news-articles-detail", kwargs={"slug": article.slug})
        res = self.client.get(detail_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
        self.assertEqual(res.data["slug"], "hello-world")

    def test_editor_can_create_article_via_api(self):
        access = self._access_token_for("editor1", "StrongPass123")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

        url = reverse("news-articles-list")
        payload = {
            "title_en": "API article",
            "slug": "api-article",
            "content_en": "content",
            "section": self.section.id,
            "status": "DRAFT",
        }
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)
        self.assertTrue(NewsArticle.objects.filter(slug="api-article").exists())
