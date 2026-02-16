from __future__ import annotations

from django.db import models


class SiteSettings(models.Model):
    """
    Single-row (singleton) model for site-wide content: About page, tagline, editor info.
    Create one row via admin; API returns it for the frontend.
    """
    # Brand / tagline
    tagline_en = models.CharField(max_length=200, default="Fearless and Unbiased - Gujarat's most trusted weekly newspaper.")
    tagline_gu = models.CharField(max_length=200, blank=True)
    tagline_hi = models.CharField(max_length=200, blank=True)

    # About page
    about_title_en = models.CharField(max_length=120, default="About Us")
    about_title_gu = models.CharField(max_length=120, blank=True)
    about_title_hi = models.CharField(max_length=120, blank=True)
    about_description_en = models.TextField(blank=True)
    about_description_gu = models.TextField(blank=True)
    about_description_hi = models.TextField(blank=True)

    # Editor
    editor_name = models.CharField(max_length=120, default="Japan A. Shah")
    editor_title_en = models.CharField(max_length=120, default="Editor in Chief & Owner")
    editor_title_gu = models.CharField(max_length=120, blank=True)
    editor_title_hi = models.CharField(max_length=120, blank=True)
    editor_bio_en = models.TextField(blank=True)
    editor_bio_gu = models.TextField(blank=True)
    editor_bio_hi = models.TextField(blank=True)

    # Mission & publication
    mission_en = models.TextField(blank=True)
    mission_gu = models.TextField(blank=True)
    mission_hi = models.TextField(blank=True)
    publication_description_en = models.TextField(blank=True)
    publication_description_gu = models.TextField(blank=True)
    publication_description_hi = models.TextField(blank=True)

    # Contact / website
    website_url = models.URLField(blank=True, default="https://www.kanamexpress.com")
    contact_phone_primary = models.CharField(max_length=30, blank=True)
    contact_phone_secondary = models.CharField(max_length=30, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_address = models.TextField(blank=True)

    # Social (optional)
    facebook_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Site settings"
        verbose_name_plural = "Site settings"

    def __str__(self) -> str:
        return "Site settings"
