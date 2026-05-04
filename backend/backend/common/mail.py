"""Outbound email helper: logs failures instead of swallowing them silently."""

from __future__ import annotations

import logging
from collections.abc import Iterable

from django.conf import settings
from django.core.mail import EmailMultiAlternatives

logger = logging.getLogger(__name__)


def send_mail_logged(
    *,
    subject: str,
    message: str,
    recipient_list: list[str],
    from_email: str | None = None,
    html_message: str | None = None,
    file_attachments: Iterable[str] | None = None,
    binary_attachments: Iterable[tuple[str, bytes, str]] | None = None,
) -> bool:
    """
    Send email with optional HTML and attachments; logs failures.

    Uses DEFAULT_FROM_EMAIL when from_email is omitted.
    """
    frm = from_email or settings.DEFAULT_FROM_EMAIL
    try:
        email = EmailMultiAlternatives(
            subject=subject,
            message=message,
            from_email=frm,
            to=recipient_list,
        )
        if html_message:
            email.attach_alternative(html_message, "text/html")
        for path in file_attachments or ():
            email.attach_file(path)
        for filename, content, mimetype in binary_attachments or ():
            email.attach(filename, content, mimetype)
        email.send(fail_silently=False)
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
