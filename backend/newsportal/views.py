from __future__ import annotations

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SiteSettings
from .serializers import SiteSettingsSerializer


class SiteSettingsView(APIView):
    """
    GET /api/v1/site/settings/ – returns the single site settings row (About, tagline, editor, contact).
    Public, read-only. If no row exists, returns default-like empty strings.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        instance = SiteSettings.objects.first()
        if not instance:
            # Return defaults so frontend doesn't break
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
            }
            return Response(data)
        serializer = SiteSettingsSerializer(instance)
        return Response(serializer.data)
