from __future__ import annotations

from django.db import models


class SiteSettings(models.Model):
    """
    Single-row (singleton) model for site-wide content: About page, tagline, editor info.
    Create one row via admin; API returns it for the frontend.
    """
    tagline_en = models.CharField(max_length=200, default="Fearless and Unbiased - Gujarat's most trusted weekly newspaper.")
    tagline_gu = models.CharField(max_length=200, blank=True)
    tagline_hi = models.CharField(max_length=200, blank=True)
    about_title_en = models.CharField(max_length=120, default="About Us")
    about_title_gu = models.CharField(max_length=120, blank=True)
    about_title_hi = models.CharField(max_length=120, blank=True)
    about_description_en = models.TextField(blank=True)
    about_description_gu = models.TextField(blank=True)
    about_description_hi = models.TextField(blank=True)
    editor_name = models.CharField(max_length=120, default="Japan A. Shah")
    editor_title_en = models.CharField(max_length=120, default="Editor in Chief & Owner")
    editor_title_gu = models.CharField(max_length=120, blank=True)
    editor_title_hi = models.CharField(max_length=120, blank=True)
    editor_bio_en = models.TextField(blank=True)
    editor_bio_gu = models.TextField(blank=True)
    editor_bio_hi = models.TextField(blank=True)
    mission_en = models.TextField(blank=True)
    mission_gu = models.TextField(blank=True)
    mission_hi = models.TextField(blank=True)
    publication_description_en = models.TextField(blank=True)
    publication_description_gu = models.TextField(blank=True)
    publication_description_hi = models.TextField(blank=True)
    website_url = models.URLField(blank=True, default="https://www.kanamexpress.com")
    contact_phone_primary = models.CharField(max_length=30, blank=True)
    contact_phone_secondary = models.CharField(max_length=30, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_address = models.TextField(blank=True)
    facebook_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)
    
    # Our Values (4 values for About page)
    value1_title_en = models.CharField(max_length=100, default="Truth", blank=True)
    value1_title_gu = models.CharField(max_length=100, blank=True)
    value1_title_hi = models.CharField(max_length=100, blank=True)
    value1_desc_en = models.CharField(max_length=200, default="Committed to truthful reporting", blank=True)
    value1_desc_gu = models.CharField(max_length=200, blank=True)
    value1_desc_hi = models.CharField(max_length=200, blank=True)
    
    value2_title_en = models.CharField(max_length=100, default="Community", blank=True)
    value2_title_gu = models.CharField(max_length=100, blank=True)
    value2_title_hi = models.CharField(max_length=100, blank=True)
    value2_desc_en = models.CharField(max_length=200, default="Serving our community", blank=True)
    value2_desc_gu = models.CharField(max_length=200, blank=True)
    value2_desc_hi = models.CharField(max_length=200, blank=True)
    
    value3_title_en = models.CharField(max_length=100, default="Accuracy", blank=True)
    value3_title_gu = models.CharField(max_length=100, blank=True)
    value3_title_hi = models.CharField(max_length=100, blank=True)
    value3_desc_en = models.CharField(max_length=200, default="Precise and verified news", blank=True)
    value3_desc_gu = models.CharField(max_length=200, blank=True)
    value3_desc_hi = models.CharField(max_length=200, blank=True)
    
    value4_title_en = models.CharField(max_length=100, default="Integrity", blank=True)
    value4_title_gu = models.CharField(max_length=100, blank=True)
    value4_title_hi = models.CharField(max_length=100, blank=True)
    value4_desc_en = models.CharField(max_length=200, default="Ethical journalism", blank=True)
    value4_desc_gu = models.CharField(max_length=200, blank=True)
    value4_desc_hi = models.CharField(max_length=200, blank=True)
    
    # Contact page additional fields
    organization_name_en = models.CharField(max_length=200, default="Kanam Express - Weekly Newspaper", blank=True)
    organization_name_gu = models.CharField(max_length=200, blank=True)
    organization_name_hi = models.CharField(max_length=200, blank=True)
    working_hours_en = models.TextField(blank=True, default="Mon - Fri: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed")
    working_hours_gu = models.TextField(blank=True)
    working_hours_hi = models.TextField(blank=True)
    google_maps_embed_url = models.URLField(blank=True, default="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.5!2d72.95!3d21.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sJambusar%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1234567890")
    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Site settings"
        verbose_name_plural = "Site settings"

    def __str__(self) -> str:
        return "Site settings"
