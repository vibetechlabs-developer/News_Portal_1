from __future__ import annotations

from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .fcm_client import is_fcm_configured
from .models import FCMDevice
from .serializers import FCMDeviceRegisterSerializer, FCMDeviceUnregisterSerializer


class FCMDeviceRegisterView(APIView):
    """
    GET: whether FCM server credentials are configured (app can hide/disable UI).
    POST: register or update this user's FCM token (requires JWT).
    """

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, *args, **kwargs):
        return Response({"enabled": is_fcm_configured()}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        ser = FCMDeviceRegisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data
        user = request.user
        token = data["fcm_token"].strip()
        platform = data["platform"]
        device_id = (data.get("device_id") or "").strip() or None
        device_model = (data.get("device_model") or "").strip() or ""
        app_version = (data.get("app_version") or "").strip() or ""

        with transaction.atomic():
            existing_by_token = FCMDevice.objects.select_for_update().filter(fcm_token=token).first()
            if existing_by_token:
                existing_by_token.user = user
                existing_by_token.platform = platform
                existing_by_token.device_id = device_id
                existing_by_token.device_model = device_model
                existing_by_token.app_version = app_version
                existing_by_token.is_active = True
                existing_by_token.updated_at = timezone.now()
                existing_by_token.save(
                    update_fields=[
                        "user",
                        "platform",
                        "device_id",
                        "device_model",
                        "app_version",
                        "is_active",
                        "updated_at",
                    ]
                )
                row = existing_by_token
            elif device_id:
                row = (
                    FCMDevice.objects.select_for_update()
                    .filter(user=user, device_id=device_id)
                    .first()
                )
                if row:
                    row.fcm_token = token
                    row.platform = platform
                    row.device_model = device_model
                    row.app_version = app_version
                    row.is_active = True
                    row.updated_at = timezone.now()
                    row.save(
                        update_fields=[
                            "fcm_token",
                            "platform",
                            "device_model",
                            "app_version",
                            "is_active",
                            "updated_at",
                        ]
                    )
                else:
                    row = FCMDevice.objects.create(
                        user=user,
                        fcm_token=token,
                        platform=platform,
                        device_id=device_id,
                        device_model=device_model,
                        app_version=app_version,
                        is_active=True,
                    )
            else:
                row = FCMDevice.objects.create(
                    user=user,
                    fcm_token=token,
                    platform=platform,
                    device_id=None,
                    device_model=device_model,
                    app_version=app_version,
                    is_active=True,
                )

        return Response(
            {
                "ok": True,
                "id": row.pk,
                "platform": row.platform,
                "device_id": row.device_id,
            },
            status=status.HTTP_200_OK,
        )


class FCMDeviceUnregisterView(APIView):
    """Deactivate a device token for the current user (logout / permission revoked)."""

    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        return self._unregister(request)

    def delete(self, request, *args, **kwargs):
        return self._unregister(request)

    def _unregister(self, request):
        ser = FCMDeviceUnregisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        token = ser.validated_data["fcm_token"].strip()
        updated = FCMDevice.objects.filter(user=request.user, fcm_token=token).update(is_active=False)
        if not updated:
            return Response({"detail": "Token not found for this user."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"ok": True}, status=status.HTTP_200_OK)
