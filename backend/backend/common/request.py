from __future__ import annotations


def get_client_ip(request) -> str | None:
    """
    Best-effort client IP extraction (works behind proxies if configured).
    """

    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if xff:
        # XFF: client, proxy1, proxy2...
        return xff.split(",")[0].strip() or None
    return request.META.get("REMOTE_ADDR") or None

