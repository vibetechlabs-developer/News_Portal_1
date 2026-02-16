from __future__ import annotations

from django.db.models import F
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from backend.common.permissions import IsEditorOrSuperAdmin
from .models import Advertisement, AdvertisementRequest, AdStatus, GoogleAdSenseSlot
from .serializers import (
    AdvertisementRequestSerializer,
    AdvertisementSerializer,
    GoogleAdSenseSlotSerializer,
)


class GoogleAdSenseSlotViewSet(viewsets.ModelViewSet):
    serializer_class = GoogleAdSenseSlotSerializer
    lookup_field = "id"

    filterset_fields = ["placement", "is_active"]
    ordering_fields = ["placement", "order", "name"]

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [AllowAny()]
        return [IsEditorOrSuperAdmin()]

    def get_queryset(self):
        qs = GoogleAdSenseSlot.objects.all()
        if self.action in {"list", "retrieve"}:
            return qs.filter(is_active=True).order_by("placement", "order", "name")
        return qs.order_by("placement", "order", "name")


class AdvertisementViewSet(viewsets.ModelViewSet):
    serializer_class = AdvertisementSerializer

    filterset_fields = ["placement", "ad_type", "status", "is_active"]
    ordering_fields = ["created_at", "updated_at", "impression_count", "click_count"]
    search_fields = ["title", "advertiser_name", "advertiser_email", "advertiser_phone"]

    def get_permissions(self):
        if self.action in {"list", "retrieve", "track_impression", "track_click"}:
            return [AllowAny()]
        return [IsEditorOrSuperAdmin()]

    def get_queryset(self):
        qs = Advertisement.objects.all()

        # Public only sees currently active ads (centralized in the model queryset).
        if self.action in {"list", "retrieve", "track_impression", "track_click"}:
            return qs.currently_active()

        return qs

    @action(detail=True, methods=["post"], permission_classes=[AllowAny])
    def track_impression(self, request, pk=None):
        ad = self.get_object()
        Advertisement.objects.filter(pk=ad.pk).update(impression_count=F("impression_count") + 1)
        return Response({"ok": True}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], permission_classes=[AllowAny])
    def track_click(self, request, pk=None):
        ad = self.get_object()
        Advertisement.objects.filter(pk=ad.pk).update(click_count=F("click_count") + 1)
        return Response({"ok": True}, status=status.HTTP_200_OK)


class AdvertisementRequestViewSet(viewsets.ModelViewSet):
    serializer_class = AdvertisementRequestSerializer
    filterset_fields = ["placement", "ad_type", "status"]
    ordering_fields = ["created_at", "updated_at"]
    throttle_classes = [ScopedRateThrottle]

    def get_permissions(self):
        if self.action in {"create"}:
            return [AllowAny()]
        return [IsEditorOrSuperAdmin()]

    def get_throttles(self):
        """
        Apply a stricter rate limit for public ad requests only.
        The actual rate is configured via REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']['ads_requests'].
        """

        if self.action == "create":
            self.throttle_scope = "ads_requests"
        else:
            self.throttle_scope = None
        return super().get_throttles()

    def get_queryset(self):
        return AdvertisementRequest.objects.all()
