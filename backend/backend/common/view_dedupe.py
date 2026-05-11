"""Deduplicate content views so the same user/device does not inflate view_count."""

from __future__ import annotations

import uuid
from typing import Tuple

from django.core.cache import cache
from django.http import HttpRequest


# Long TTL: one counted view per actor per content for years (not "per day").
_VIEW_DEDUPE_TIMEOUT_SECONDS = 60 * 60 * 24 * 365 * 5


def resolve_view_actor(request: HttpRequest) -> Tuple[str, str | None, bool]:
    """
    Return (actor_key, session_id, is_new_session).

    actor_key is used in cache keys. For anonymous users we rely on `device_id`
    cookie (same pattern as likes). If missing, a new UUID is generated and
    caller should set the cookie on the response.
    """
    user = request.user if request.user.is_authenticated else None
    session_id = request.COOKIES.get("device_id")
    is_new_session = False
    if not user:
        if not session_id:
            session_id = str(uuid.uuid4())
            is_new_session = True
        actor = f"s:{session_id}"
    else:
        actor = f"u:{user.pk}"
    return actor, session_id, is_new_session


def try_register_unique_view(cache_key: str) -> bool:
    """
    Atomically register a first-time view for this cache_key.

    Returns True if this request should count as a new view; False if duplicate.
    """
    # cache.add returns False if key already exists
    return cache.add(cache_key, 1, timeout=_VIEW_DEDUPE_TIMEOUT_SECONDS)


def attach_device_cookie_if_needed(response, session_id: str | None, is_new_session: bool):
    if is_new_session and session_id:
        response.set_cookie(
            "device_id",
            session_id,
            max_age=10 * 365 * 24 * 60 * 60,
            samesite="Lax",
        )
