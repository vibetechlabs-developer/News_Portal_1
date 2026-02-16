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
        ("Our Values - Value 1", {"fields": ("value1_title_en", "value1_title_gu", "value1_title_hi", "value1_desc_en", "value1_desc_gu", "value1_desc_hi")}),
        ("Our Values - Value 2", {"fields": ("value2_title_en", "value2_title_gu", "value2_title_hi", "value2_desc_en", "value2_desc_gu", "value2_desc_hi")}),
        ("Our Values - Value 3", {"fields": ("value3_title_en", "value3_title_gu", "value3_title_hi", "value3_desc_en", "value3_desc_gu", "value3_desc_hi")}),
        ("Our Values - Value 4", {"fields": ("value4_title_en", "value4_title_gu", "value4_title_hi", "value4_desc_en", "value4_desc_gu", "value4_desc_hi")}),
        ("Contact", {"fields": ("website_url", "contact_phone_primary", "contact_phone_secondary", "contact_email", "contact_address")}),
        ("Contact Page", {"fields": ("organization_name_en", "organization_name_gu", "organization_name_hi", "working_hours_en", "working_hours_gu", "working_hours_hi", "google_maps_embed_url")}),
        ("Social", {"fields": ("facebook_url", "twitter_url", "instagram_url", "youtube_url")}),
    )
