from __future__ import annotations

from django.conf import settings
from django.core.mail import send_mail
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from backend.common.permissions import IsEditorOrSuperAdmin
from .models import ContactMessage
from .serializers import ContactMessageSerializer


def _send_contact_notification_email(instance: ContactMessage) -> None:
    to_email = getattr(settings, "CONTACT_ADMIN_EMAIL", None)
    if not to_email:
        return
    subject = f"[News Portal] Contact: {instance.subject or 'No subject'}"
    body = (
        f"Name: {instance.name}\n"
        f"Email: {instance.email}\n"
        f"Phone: {instance.phone or '-'}\n"
        f"Subject: {instance.subject or '-'}\n\n"
        f"Message:\n{instance.message}"
    )
    send_mail(
        subject=subject,
        message=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[to_email],
        fail_silently=True,
    )


class ContactMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ContactMessageSerializer
    filterset_fields = ["is_read"]
    ordering_fields = ["created_at"]
    search_fields = ["name", "email", "phone", "subject", "message"]
    throttle_classes = [ScopedRateThrottle]

    def get_permissions(self):
        if self.action in {"create"}:
            return [AllowAny()]
        return [IsEditorOrSuperAdmin()]

    def get_throttles(self):
        """
        Apply a stricter rate limit for public contact form submissions only.
        The actual rate is configured via REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']['contact'].
        """

        if self.action == "create":
            self.throttle_scope = "contact"
        else:
            # Disable scoped throttling for admin-only actions
            self.throttle_scope = None
        return super().get_throttles()

    def get_queryset(self):
        return ContactMessage.objects.all()

    def perform_create(self, serializer):
        instance = serializer.save()
        _send_contact_notification_email(instance)

    @action(detail=True, methods=["post"], permission_classes=[IsEditorOrSuperAdmin])
    def mark_read(self, request, pk=None):
        msg = self.get_object()
        msg.is_read = True
        msg.save(update_fields=["is_read"])
        return Response({"ok": True}, status=status.HTTP_200_OK)
