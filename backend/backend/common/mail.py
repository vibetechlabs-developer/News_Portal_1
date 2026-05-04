"""Outbound email helper: logs failures instead of swallowing them silently."""

from __future__ import annotations

import logging

from django.conf import settings
from django.core.mail import send_mail as django_send_mail

logger = logging.getLogger(__name__)


def send_mail_logged(
    *,
    subject: str,
    message: str,
    recipient_list: list[str],
    from_email: str | None = None,
) -> bool:
    """
    Send one plain-text email; log exception on failure (never silent).

    Uses DEFAULT_FROM_EMAIL when from_email is omitted.
    """
    frm = from_email or settings.DEFAULT_FROM_EMAIL
    try:
        django_send_mail(
            subject=subject,
            message=message,
            from_email=frm,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        return True
    except Exception:
        logger.exception(
            "send_mail failed subject=%r from=%r to=%r backend=%r host=%r",
            subject,
            frm,
            recipient_list,
            getattr(settings, "EMAIL_BACKEND", ""),
            getattr(settings, "EMAIL_HOST", ""),
        )
        return False
