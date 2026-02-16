from __future__ import annotations

from django.db import connection
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET


@require_GET
@csrf_exempt
def health(request):
    """
    Health/readiness check for load balancers and monitoring.
    Returns 200 with status and optional DB check.
    """
    try:
        connection.ensure_connection()
        db_ok = True
    except Exception:
        db_ok = False
    status_code = 200 if db_ok else 503
    return JsonResponse(
        {"status": "ok" if db_ok else "degraded", "database": "ok" if db_ok else "error"},
        status=status_code,
    )
