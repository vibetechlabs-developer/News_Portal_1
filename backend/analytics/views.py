from __future__ import annotations

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import viewsets

from backend.common.permissions import IsEditorOrSuperAdmin
from .models import NewsView
from .serializers import NewsViewSerializer


@method_decorator(cache_page(60), name="list")
class NewsViewViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Internal analytics (editor/admin only).
    """

    permission_classes = [IsEditorOrSuperAdmin]
    serializer_class = NewsViewSerializer
    queryset = NewsView.objects.all().select_related("article", "user")

    filterset_fields = ["article", "user"]
    ordering_fields = ["viewed_at"]
