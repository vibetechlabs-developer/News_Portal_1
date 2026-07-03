"""
Firebase Cloud Messaging (FCM) helpers for native Android / iOS apps.

Configure either:
- FIREBASE_CREDENTIALS_PATH — absolute path to the service account JSON file, or
- FIREBASE_CREDENTIALS_JSON — raw JSON string of the service account (single line / injected secret).

If neither is set, registration APIs still work (tokens are stored), but sends are skipped.
"""

from __future__ import annotations

import json
import logging
from typing import Iterable

from django.conf import settings

logger = logging.getLogger(__name__)

_app_initialized = False


def is_fcm_configured() -> bool:
    path = (getattr(settings, "FIREBASE_CREDENTIALS_PATH", "") or "").strip()
    raw = (getattr(settings, "FIREBASE_CREDENTIALS_JSON", "") or "").strip()
    return bool(path or raw)


def _ensure_app() -> bool:
    global _app_initialized
    if _app_initialized:
        return True
    if not is_fcm_configured():
        return False
    try:
        import firebase_admin
        from firebase_admin import credentials
    except ImportError:
        logger.warning("firebase-admin is not installed; FCM send is disabled.")
        return False

    if firebase_admin._apps:
        _app_initialized = True
        return True

    path = (getattr(settings, "FIREBASE_CREDENTIALS_PATH", "") or "").strip()
    raw = (getattr(settings, "FIREBASE_CREDENTIALS_JSON", "") or "").strip()
    try:
        if path:
            cred = credentials.Certificate(path)
        else:
            cred = credentials.Certificate(json.loads(raw))
        firebase_admin.initialize_app(cred)
        _app_initialized = True
        return True
    except Exception:
        logger.exception("Failed to initialize Firebase app; FCM send disabled.")
        return False


def _deactivate_invalid_tokens(tokens: Iterable[str]) -> None:
    from .models import FCMDevice

    token_list = [t for t in tokens if t]
    if not token_list:
        return
    FCMDevice.objects.filter(fcm_token__in=token_list).update(is_active=False)


def _send_fcm_broadcast(title: str, body: str, data: dict) -> None:
    """Generic FCM broadcast to all active device tokens."""
    from .models import FCMDevice

    if not _ensure_app():
        return

    try:
        from firebase_admin import messaging
    except ImportError:
        return

    tokens = list(
        FCMDevice.objects.filter(is_active=True).values_list("fcm_token", flat=True).distinct()
    )
    if not tokens:
        return

    chunk_size = 400
    for i in range(0, len(tokens), chunk_size):
        chunk = tokens[i : i + chunk_size]
        messages = [
            messaging.Message(
                notification=messaging.Notification(title=title, body=body),
                data=data,
                token=t,
                android=messaging.AndroidConfig(priority="high"),
                apns=messaging.APNSConfig(
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(sound="default"),
                    )
                ),
            )
            for t in chunk
        ]
        try:
            response = messaging.send_each(messages)
        except Exception:
            logger.exception("FCM batch send failed")
            continue

        invalid: list[str] = []
        for msg, send_resp in zip(messages, response.responses):
            if send_resp.success:
                continue
            exc = send_resp.exception
            err = str(exc).lower() if exc else ""
            if "registration-token" in err or "not registered" in err or "unregistered" in err:
                if hasattr(msg, "token") and msg.token:
                    invalid.append(msg.token)
            else:
                logger.warning("FCM send failed for token ...%s: %s", msg.token[-8:] if msg.token else "", exc)
        if invalid:
            _deactivate_invalid_tokens(invalid)


def send_article_fcm_notifications(article) -> None:
    """
    Broadcast a notification to all active FCM device tokens when a new article is published.
    Non-fatal: publishing must not fail if FCM errors.
    """
    title = article.title_en or article.title_hi or article.title_gu or f"Article #{article.pk}"
    body = "New article published"
    base = (getattr(settings, "FCM_DEEPLINK_BASE_URL", "") or "").rstrip("/")
    web_url = f"{base}/article/{article.slug}" if base else f"/article/{article.slug}"

    data = {
        "type": "news_article",
        "article_id": str(article.pk),
        "article_slug": str(article.slug),
        "url": web_url,
    }
    _send_fcm_broadcast(title, body, data)


def send_video_fcm_notifications(video) -> None:
    """Broadcast an FCM push notification when a new video is published."""
    title = video.title_en or video.title_hi or video.title_gu or f"Video #{video.pk}"
    body = "New video published"
    base = (getattr(settings, "FCM_DEEPLINK_BASE_URL", "") or "").rstrip("/")
    web_url = f"{base}/videos" if base else "/videos"
    data = {
        "type": "video_content",
        "video_id": str(video.pk),
        "video_slug": str(video.slug),
        "url": web_url,
    }
    _send_fcm_broadcast(title, body, data)


def send_reel_fcm_notifications(reel) -> None:
    """Broadcast an FCM push notification when a new reel is published."""
    title = reel.title_en or reel.title_hi or reel.title_gu or f"Reel #{reel.pk}"
    body = "New reel published"
    base = (getattr(settings, "FCM_DEEPLINK_BASE_URL", "") or "").rstrip("/")
    web_url = f"{base}/reels" if base else "/reels"
    data = {
        "type": "reel_content",
        "reel_id": str(reel.pk),
        "reel_slug": str(reel.slug),
        "url": web_url,
    }
    _send_fcm_broadcast(title, body, data)
