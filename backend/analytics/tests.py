from __future__ import annotations

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from analytics.models import NewsView
from news.models import NewsArticle, Section
from users.models import User


class AnalyticsSmokeTests(APITestCase):
    def setUp(self):
        self.section = Section.objects.create(
            name_en="Politics",
            slug="politics",
            order=1,
            is_active=True,
        )
        self.editor = User.objects.create_user(
            username="editor2",
            email="editor2@example.com",
            password="StrongPass123",
        )
        self.editor.role = "EDITOR"
        self.editor.save(update_fields=["role"])
        self.article = NewsArticle.objects.create(
            title_en="Analytics article",
            slug="analytics-article",
            content_en="content",
            section=self.section,
            author=self.editor,
            status="PUBLISHED",
        )

    def test_track_view_creates_analytics_row(self):
        url = reverse("news-articles-track-view", kwargs={"slug": self.article.slug})
        res = self.client.post(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
        self.assertTrue(NewsView.objects.filter(article=self.article).exists())
