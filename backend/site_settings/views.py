from __future__ import annotations

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from backend.common.permissions import IsEditorOrSuperAdmin

from .models import SiteSettings
from .serializers import SiteSettingsSerializer


class SiteSettingsView(APIView):
    def get_permissions(self):
        # Public read for footer/header/About content
        if self.request.method.upper() == "GET":
            return [AllowAny()]
        # Only content managers can update site settings
        return [IsEditorOrSuperAdmin()]

    def get(self, request):
        instance = SiteSettings.objects.first()
        if not instance:
            data = {
                "tagline_en": "Fearless and Unbiased - Gujarat's most trusted weekly newspaper.",
                "tagline_gu": "નિડર અને નિષ્પક્ષ - ગુજરાતનું સૌથી વિશ્વસનીય સાપ્તાહિક સમાચાર પત્ર.",
                "tagline_hi": "",
                "about_title_en": "About Us",
                "about_title_gu": "અમારા વિશે",
                "about_title_hi": "",
                "about_description_en": "",
                "about_description_gu": "",
                "about_description_hi": "",
                "editor_name": "Japan A. Shah",
                "editor_title_en": "Editor in Chief & Owner",
                "editor_title_gu": "મુખ્ય સંપાદક અને માલિક",
                "editor_title_hi": "",
                "editor_bio_en": "Leading Kanam Express with a vision to deliver unbiased, fearless journalism.",
                "editor_bio_gu": "",
                "editor_bio_hi": "",
                "mission_en": "To provide fearless, unbiased, and accurate news to our readers.",
                "mission_gu": "",
                "mission_hi": "",
                "publication_description_en": "Kanam Express is a weekly newspaper serving the Gujarati community.",
                "publication_description_gu": "",
                "publication_description_hi": "",
                "website_url": "https://www.kanamexpress.com",
                "contact_phone_primary": "+91 98247 49413",
                "contact_phone_secondary": "+91 76230 46498",
                "contact_email": "kanamexpress@gmail.com",
                "contact_address": "H.O. Gokul Lalani Khadki, Jawahar Bazaar, Jambusar, District: Bharuch, Gujarat - 391150",
                "facebook_url": "https://facebook.com/kanamexpress",
                "twitter_url": "https://twitter.com/kanamexpress",
                "instagram_url": "https://instagram.com/kanam_express",
                "youtube_url": "https://youtube.com/kanamexpress",
                "value1_title_en": "Truth",
                "value1_title_gu": "",
                "value1_title_hi": "",
                "value1_desc_en": "Committed to truthful reporting",
                "value1_desc_gu": "",
                "value1_desc_hi": "",
                "value2_title_en": "Community",
                "value2_title_gu": "",
                "value2_title_hi": "",
                "value2_desc_en": "Serving our community",
                "value2_desc_gu": "",
                "value2_desc_hi": "",
                "value3_title_en": "Accuracy",
                "value3_title_gu": "",
                "value3_title_hi": "",
                "value3_desc_en": "Precise and verified news",
                "value3_desc_gu": "",
                "value3_desc_hi": "",
                "value4_title_en": "Integrity",
                "value4_title_gu": "",
                "value4_title_hi": "",
                "value4_desc_en": "Ethical journalism",
                "value4_desc_gu": "",
                "value4_desc_hi": "",
                "organization_name_en": "Kanam Express - Weekly Newspaper",
                "organization_name_gu": "",
                "organization_name_hi": "",
                "working_hours_en": "Mon - Fri: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed",
                "working_hours_gu": "",
                "working_hours_hi": "",
                "google_maps_embed_url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.5!2d72.95!3d21.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sJambusar%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1234567890",
            }
            return Response(data)
        serializer = SiteSettingsSerializer(instance)
        return Response(serializer.data)

    def patch(self, request):
        """
        Update the singleton SiteSettings row.

        - Creates a row if none exists yet.
        - Requires Editor/Reporter/Super Admin (IsEditorOrSuperAdmin).
        """
        instance = SiteSettings.objects.first() or SiteSettings.objects.create()
        serializer = SiteSettingsSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
