from __future__ import annotations

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class ContactSmokeTests(APITestCase):
    def test_public_contact_create_throttled_scope(self):
        url = reverse("contact-messages-list")
        payload = {
            "name": "Alice",
            "email": "alice@example.com",
            "subject": "Hello",
            "message": "Test message",
        }
        res = self.client.post(url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)
