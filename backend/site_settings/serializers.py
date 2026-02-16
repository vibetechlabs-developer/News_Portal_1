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
            "value1_title_en", "value1_title_gu", "value1_title_hi",
            "value1_desc_en", "value1_desc_gu", "value1_desc_hi",
            "value2_title_en", "value2_title_gu", "value2_title_hi",
            "value2_desc_en", "value2_desc_gu", "value2_desc_hi",
            "value3_title_en", "value3_title_gu", "value3_title_hi",
            "value3_desc_en", "value3_desc_gu", "value3_desc_hi",
            "value4_title_en", "value4_title_gu", "value4_title_hi",
            "value4_desc_en", "value4_desc_gu", "value4_desc_hi",
            "organization_name_en", "organization_name_gu", "organization_name_hi",
            "working_hours_en", "working_hours_gu", "working_hours_hi",
            "google_maps_embed_url",
        ]
