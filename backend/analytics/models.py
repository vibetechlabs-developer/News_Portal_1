from __future__ import annotations

from django.conf import settings
from django.db import models


class NewsView(models.Model):
    """
    Tracks views per article. You can aggregate this table to compute view_count,
    trending articles, etc.
    """

    article = models.ForeignKey("news.NewsArticle", on_delete=models.CASCADE, related_name="views")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="news_views"
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=300, blank=True)

    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-viewed_at"]
        indexes = [
            models.Index(fields=["article", "viewed_at"]),
            models.Index(fields=["user", "viewed_at"]),
        ]

    def __str__(self) -> str:
        return f"View({self.article_id})"
