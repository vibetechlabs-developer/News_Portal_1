from rest_framework import serializers
from .models import SiteSettings


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            "tagline_en", "tagline_gu", "tagline_hi",
            "about_title_en", "about_title_gu", "about_title_hi",
            "about_description_en", "about_description_gu", "about_description_hi",
            "editor_name", "editor_title_en", "editor_title_gu", "editor_title_hi",
            "editor_bio_en", "editor_bio_gu", "editor_bio_hi",
            "mission_en", "mission_gu", "mission_hi",
            "publication_description_en", "publication_description_gu", "publication_description_hi",
            "website_url",
            "contact_phone_primary", "contact_phone_secondary", "contact_email", "contact_address",
            "facebook_url", "twitter_url", "instagram_url", "youtube_url",
        ]
