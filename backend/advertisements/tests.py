from __future__ import annotations

from django.utils import timezone
from rest_framework.test import APITestCase

from advertisements.models import Advertisement, AdPlacement, AdStatus


class AdvertisementModelTests(APITestCase):
    def test_is_currently_active_helper(self):
        now = timezone.now()
        ad = Advertisement.objects.create(
            title="Test Ad",
            placement=AdPlacement.TOP,
            status=AdStatus.ACTIVE,
            is_active=True,
            start_at=now - timezone.timedelta(days=1),
            end_at=now + timezone.timedelta(days=1),
        )

        self.assertTrue(ad.is_currently_active(now))
