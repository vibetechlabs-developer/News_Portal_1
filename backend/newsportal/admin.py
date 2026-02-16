from django.contrib import admin
from .models import SiteSettings


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ("editor_name", "website_url", "updated_at")
    fieldsets = (
        ("Brand", {"fields": ("tagline_en", "tagline_gu", "tagline_hi")}),
        ("About page", {"fields": ("about_title_en", "about_title_gu", "about_title_hi", "about_description_en", "about_description_gu", "about_description_hi")}),
        ("Editor", {"fields": ("editor_name", "editor_title_en", "editor_title_gu", "editor_title_hi", "editor_bio_en", "editor_bio_gu", "editor_bio_hi")}),
        ("Mission & publication", {"fields": ("mission_en", "mission_gu", "mission_hi", "publication_description_en", "publication_description_gu", "publication_description_hi")}),
        ("Contact", {"fields": ("website_url", "contact_phone_primary", "contact_phone_secondary", "contact_email", "contact_address")}),
        ("Social", {"fields": ("facebook_url", "twitter_url", "instagram_url", "youtube_url")}),
    )
