from __future__ import annotations

from django.conf import settings
from django.db.models import F, Q, Count
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.utils.text import slugify
from django.views.decorators.cache import cache_page
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView

from backend.common.permissions import CONTENT_MANAGER_ROLES, IsEditorOrSuperAdmin, IsOwnerOrPrivileged, IsSuperAdmin
from backend.common.request import get_client_ip
from .models import (
    Category,
    Comment,
    ContentStatus,
    District,
    Like,
    Media,
    NewsArticle,
    Section,
    Tag,
    VideoContent,
    ReelContent,
    EpaperEdition,
)
from .serializers import (
    CategorySerializer,
    CommentSerializer,
    DistrictSerializer,
    LikeSerializer,
    MediaSerializer,
    NewsArticleSerializer,
    SectionSerializer,
    TagSerializer,
    VideoContentSerializer,
    ReelContentSerializer,
    EpaperEditionSerializer,
)

import logging
import requests

logger = logging.getLogger(__name__)


def _is_content_manager(user):
    return bool(user and user.is_authenticated and getattr(user, "role", None) in CONTENT_MANAGER_ROLES)


def _is_super_admin(user):
    return bool(user and user.is_authenticated and getattr(user, "role", None) == "SUPER_ADMIN")


def _unique_slug(model_class, base_slug, lookup_field="slug", exclude_pk=None):
    """Generate a unique slug; if taken, append -2, -3, etc."""
    slug = base_slug
    counter = 1
    while True:
        qs = model_class.objects.filter(**{lookup_field: slug})
        if exclude_pk is not None:
            qs = qs.exclude(pk=exclude_pk)
        if not qs.exists():
            return slug
        counter += 1
        slug = f"{base_slug}-{counter}"


class SectionViewSet(viewsets.ModelViewSet):
    serializer_class = SectionSerializer
    lookup_field = "slug"
    filterset_fields = ["parent", "is_active"]
    ordering_fields = ["order", "name_en"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsEditorOrSuperAdmin()]

    def get_queryset(self):
        qs = Section.objects.all().order_by("order", "name_en").prefetch_related("children")
        user = self.request.user
        if not _is_content_manager(user):
            # Public: only approved and active
            qs = qs.filter(is_approved=True, is_active=True)
        elif not _is_super_admin(user):
            # Editor: see all but filter pending in list view
            pass  # Editors see all for management
        # Super Admin sees all
        return qs

    def perform_create(self, serializer):
        data = serializer.validated_data
        slug = data.get("slug") or slugify(data.get("name_en", "")) or "section"
        slug = _unique_slug(Section, slug[:140])
        user = self.request.user
        # Auto-approve if Super Admin, otherwise pending
        if _is_super_admin(user):
            serializer.save(slug=slug, is_approved=True, approved_by=user, approved_at=timezone.now())
        else:
            serializer.save(slug=slug, is_approved=False)

    def perform_update(self, serializer):
        data = serializer.validated_data
        slug = data.get("slug") or (serializer.instance and serializer.instance.slug)
        if slug and serializer.instance:
            slug = _unique_slug(Section, slug[:140], exclude_pk=serializer.instance.pk)
        user = self.request.user
        # If Super Admin updates, auto-approve; Editor updates reset approval
        if _is_super_admin(user):
            if slug:
                serializer.save(slug=slug, is_approved=True, approved_by=user, approved_at=timezone.now())
            else:
                serializer.save(is_approved=True, approved_by=user, approved_at=timezone.now())
        else:
            # Editor update: reset to pending
            if slug:
                serializer.save(slug=slug, is_approved=False, approved_by=None, approved_at=None)
            else:
                serializer.save(is_approved=False, approved_by=None, approved_at=None)

    @action(detail=True, methods=["post"], permission_classes=[IsSuperAdmin])
    def approve(self, request, slug=None):
        """Super Admin approves a section."""
        section = self.get_object()
        section.is_approved = True
        section.approved_by = request.user
        section.approved_at = timezone.now()
        section.save(update_fields=["is_approved", "approved_by", "approved_at"])
        return Response({"status": "approved"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], permission_classes=[IsSuperAdmin])
    def reject(self, request, slug=None):
        """Super Admin rejects a section."""
        section = self.get_object()
        section.is_approved = False
        # Mark rejected sections as inactive so they disappear from public
        # navigation and can be distinguished from "pending" in the admin UI.
        section.is_active = False
        section.approved_by = None
        section.approved_at = None
        section.save(update_fields=["is_approved", "is_active", "approved_by", "approved_at"])
        return Response({"status": "rejected"}, status=status.HTTP_200_OK)


class DistrictViewSet(viewsets.ModelViewSet):
    serializer_class = DistrictSerializer
    lookup_field = "slug"
    filterset_fields = ["section", "is_active"]
    ordering_fields = ["order", "name_en"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsEditorOrSuperAdmin()]

    def get_queryset(self):
        qs = District.objects.all().order_by("order", "name_en").select_related("section")
        user = self.request.user
        if not _is_content_manager(user):
            qs = qs.filter(is_active=True)
        return qs

    def perform_create(self, serializer):
        data = serializer.validated_data
        slug = data.get("slug") or slugify(data.get("name_en", "")) or "district"
        slug = _unique_slug(District, slug[:140])
        serializer.save(slug=slug)

    def perform_update(self, serializer):
        data = serializer.validated_data
        slug = data.get("slug") or (serializer.instance and serializer.instance.slug)
        if slug and serializer.instance:
            slug = _unique_slug(District, slug[:140], exclude_pk=serializer.instance.pk)
            serializer.save(slug=slug)
        else:
            serializer.save()


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    lookup_field = "slug"
    filterset_fields = ["is_active"]
    ordering_fields = ["name_en"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsEditorOrSuperAdmin()]

    def get_queryset(self):
        qs = Category.objects.all().order_by("name_en")
        user = self.request.user
        if not _is_content_manager(user):
            # Public: only approved and active
            qs = qs.filter(is_approved=True, is_active=True)
        # Editors and Super Admins see all
        return qs

    def perform_create(self, serializer):
        data = serializer.validated_data
        slug = data.get("slug") or slugify(data.get("name_en", "")) or "category"
        slug = _unique_slug(Category, slug[:140])
        user = self.request.user
        if _is_super_admin(user):
            serializer.save(slug=slug, is_approved=True, approved_by=user, approved_at=timezone.now())
        else:
            serializer.save(slug=slug, is_approved=False)

    def perform_update(self, serializer):
        data = serializer.validated_data
        slug = data.get("slug") or (serializer.instance and serializer.instance.slug)
        if slug and serializer.instance:
            slug = _unique_slug(Category, slug[:140], exclude_pk=serializer.instance.pk)
        user = self.request.user
        if _is_super_admin(user):
            if slug:
                serializer.save(slug=slug, is_approved=True, approved_by=user, approved_at=timezone.now())
            else:
                serializer.save(is_approved=True, approved_by=user, approved_at=timezone.now())
        else:
            if slug:
                serializer.save(slug=slug, is_approved=False, approved_by=None, approved_at=None)
            else:
                serializer.save(is_approved=False, approved_by=None, approved_at=None)

    @action(detail=True, methods=["post"], permission_classes=[IsSuperAdmin])
    def approve(self, request, slug=None):
        """Super Admin approves a category."""
        category = self.get_object()
        category.is_approved = True
        category.approved_by = request.user
        category.approved_at = timezone.now()
        category.save(update_fields=["is_approved", "approved_by", "approved_at"])
        return Response({"status": "approved"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], permission_classes=[IsSuperAdmin])
    def reject(self, request, slug=None):
        """Super Admin rejects a category."""
        category = self.get_object()
        category.is_approved = False
        # Mark rejected categories as inactive so they disappear from public
        # filters and can be distinguished from "pending" in the admin UI.
        category.is_active = False
        category.approved_by = None
        category.approved_at = None
        category.save(update_fields=["is_approved", "is_active", "approved_by", "approved_at"])
        return Response({"status": "rejected"}, status=status.HTTP_200_OK)


class TagViewSet(viewsets.ModelViewSet):
    serializer_class = TagSerializer
    lookup_field = "slug"
    ordering_fields = ["name"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsEditorOrSuperAdmin()]

    def get_queryset(self):
        qs = Tag.objects.all().order_by("name")
        user = self.request.user
        if not _is_content_manager(user):
            # Public: only approved
            qs = qs.filter(is_approved=True)
        # Editors and Super Admins see all
        return qs

    def perform_create(self, serializer):
        data = serializer.validated_data
        slug = data.get("slug") or slugify(data.get("name", "")) or "tag"
        slug = _unique_slug(Tag, slug[:100])
        user = self.request.user
        if _is_super_admin(user):
            serializer.save(slug=slug, is_approved=True, approved_by=user, approved_at=timezone.now())
        else:
            serializer.save(slug=slug, is_approved=False)

    def perform_update(self, serializer):
        data = serializer.validated_data
        slug = data.get("slug") or (serializer.instance and serializer.instance.slug)
        if slug and serializer.instance:
            slug = _unique_slug(Tag, slug[:100], exclude_pk=serializer.instance.pk)
        user = self.request.user
        if _is_super_admin(user):
            if slug:
                serializer.save(slug=slug, is_approved=True, approved_by=user, approved_at=timezone.now())
            else:
                serializer.save(is_approved=True, approved_by=user, approved_at=timezone.now())
        else:
            if slug:
                serializer.save(slug=slug, is_approved=False, approved_by=None, approved_at=None)
            else:
                serializer.save(is_approved=False, approved_by=None, approved_at=None)

    @action(detail=True, methods=["post"], permission_classes=[IsSuperAdmin])
    def approve(self, request, slug=None):
        """Super Admin approves a tag."""
        tag = self.get_object()
        tag.is_approved = True
        tag.approved_by = request.user
        tag.approved_at = timezone.now()
        tag.save(update_fields=["is_approved", "approved_by", "approved_at"])
        return Response({"status": "approved"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], permission_classes=[IsSuperAdmin])
    def reject(self, request, slug=None):
        """Super Admin rejects a tag."""
        tag = self.get_object()
        tag.is_approved = False
        # Mark as reviewed (rejected) by setting approved_by/approved_at while
        # keeping is_approved=False. This lets the frontend distinguish between
        # "Pending" (never reviewed) and "Rejected" (explicitly declined).
        tag.approved_by = request.user
        tag.approved_at = timezone.now()
        tag.save(update_fields=["is_approved", "approved_by", "approved_at"])
        return Response({"status": "rejected"}, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["get"],
        url_path="trending",
        permission_classes=[AllowAny],
    )
    @method_decorator(cache_page(60 * 5))
    def trending(self, request):
        """
        Return tags ordered by how often they are used on published articles.
        Useful for building a "trending tags" cloud on the frontend.
        """

        limit_param = request.query_params.get("limit", "20")
        try:
            limit = max(1, min(int(limit_param), 100))
        except (TypeError, ValueError):
            limit = 20

        qs = (
            Tag.objects.filter(is_approved=True)
            .annotate(
                article_count=Count(
                    "news",
                    filter=Q(news__status=ContentStatus.PUBLISHED),
                )
            )
            .filter(article_count__gt=0)
            .order_by("-article_count", "name")[:limit]
        )
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


@method_decorator(cache_page(60), name="list")
class NewsArticleViewSet(viewsets.ModelViewSet):
    serializer_class = NewsArticleSerializer
    lookup_field = "slug"

    filterset_fields = [
        "section",
        "category",
        "district",
        "tags",
        "status",
        "content_type",
        "primary_language",
        "is_breaking",
        "is_top",
        "is_featured",
    ]
    search_fields = [
        "title_en",
        "title_hi",
        "title_gu",
        "summary_en",
        "summary_hi",
        "summary_gu",
        "content_en",
        "content_hi",
        "content_gu",
    ]
    ordering_fields = ["published_at", "created_at", "updated_at", "view_count", "likes_count"]

    def get_permissions(self):
        """
        Permission rules:
        - Public (AllowAny): list/retrieve + read-only convenience endpoints (breaking/top/most-read/related/track_view)
        - Authenticated user: toggle_like
        - Privileged (Editor/Super Admin): create/update/delete
        """

        if self.action in {
            "list",
            "retrieve",
            "breaking_list",
            "top_list",
            "most_read",
            "related",
            "track_view",
        }:
            return [AllowAny()]

        if self.action in {"toggle_like"}:
            return [IsAuthenticated()]

        return [IsEditorOrSuperAdmin()]

    def get_queryset(self):
        qs = (
            NewsArticle.objects.all()
            .select_related("section", "category", "district", "author")
            .prefetch_related("tags", "media")
        )

        user = self.request.user
        is_privileged = bool(
            user
            and user.is_authenticated
            and getattr(user, "role", None) in CONTENT_MANAGER_ROLES
        )
        if is_privileged:
            return qs
        return qs.filter(status=ContentStatus.PUBLISHED)

    def perform_create(self, serializer):
        published_at = serializer.validated_data.get("published_at")
        status_value = serializer.validated_data.get("status")

        # Reporters can create and edit drafts but cannot publish articles directly.
        role = getattr(self.request.user, "role", None)
        if role == "REPORTER" and status_value == ContentStatus.PUBLISHED:
            raise PermissionDenied("Reporters cannot publish articles. Please ask an editor or super admin to publish.")

        # Keep published_at in sync when publishing
        if status_value == ContentStatus.PUBLISHED and not published_at:
            published_at = timezone.now()

        serializer.save(author=self.request.user, published_at=published_at)

    def perform_update(self, serializer):
        instance = serializer.instance
        next_status = serializer.validated_data.get("status", instance.status)
        next_published_at = serializer.validated_data.get("published_at", instance.published_at)

        # Reporters may update drafts but cannot transition an article to PUBLISHED.
        role = getattr(self.request.user, "role", None)
        if (
            role == "REPORTER"
            and instance.status != ContentStatus.PUBLISHED
            and next_status == ContentStatus.PUBLISHED
        ):
            raise PermissionDenied("Reporters cannot publish articles. Please ask an editor or super admin to publish.")

        if next_status == ContentStatus.PUBLISHED and not next_published_at:
            next_published_at = timezone.now()

        serializer.save(published_at=next_published_at)

    @action(detail=False, methods=["get"], url_path="breaking", permission_classes=[AllowAny])
    @method_decorator(cache_page(60))
    def breaking_list(self, request):
        """Convenience list of breaking news (published, is_breaking=True)."""
        qs = self.get_queryset().filter(is_breaking=True).order_by("-published_at", "-created_at")[:15]
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="top", permission_classes=[AllowAny])
    @method_decorator(cache_page(60))
    def top_list(self, request):
        """Convenience list of top news (published, is_top=True)."""
        qs = self.get_queryset().filter(is_top=True).order_by("-published_at", "-created_at")[:15]
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[AllowAny])
    def track_view(self, request, slug=None):
        """
        Tracks an article view:
        - increments `NewsArticle.view_count`
        - writes a row into `analytics.NewsView`
        """

        article = self.get_object()

        # Increment view_count atomically
        NewsArticle.objects.filter(pk=article.pk).update(view_count=F("view_count") + 1)

        try:
            from analytics.models import NewsView  # local import to avoid circular deps

            NewsView.objects.create(
                article=article,
                user=request.user if request.user.is_authenticated else None,
                ip_address=get_client_ip(request),
                user_agent=(request.META.get("HTTP_USER_AGENT") or "")[:300],
            )
        except Exception:
            # Analytics is non-critical; do not fail the request if tracking fails
            pass

        return Response({"ok": True}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def toggle_like(self, request, slug=None):
        """
        Like/unlike the article for the current user.
        """

        article = self.get_object()
        like, created = Like.objects.get_or_create(user=request.user, article=article)
        if created:
            NewsArticle.objects.filter(pk=article.pk).update(likes_count=F("likes_count") + 1)
            return Response({"liked": True}, status=status.HTTP_201_CREATED)
        like.delete()
        NewsArticle.objects.filter(pk=article.pk, likes_count__gt=0).update(likes_count=F("likes_count") - 1)
        return Response({"liked": False}, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["get"],
        url_path="most-read",
        permission_classes=[AllowAny],
    )
    @method_decorator(cache_page(60))
    def most_read(self, request):
        """
        Return the most-read articles, using the denormalized `view_count` field.
        Optional query params:
        - limit: number of articles to return (default 10, max 50)
        - days: restrict to articles published in the last N days (optional)
        """

        limit_param = request.query_params.get("limit", "10")
        days_param = request.query_params.get("days")

        try:
            limit = max(1, min(int(limit_param), 50))
        except (TypeError, ValueError):
            limit = 10

        qs = self.get_queryset()
        if days_param:
            try:
                days = int(days_param)
                if days > 0:
                    since = timezone.now() - timezone.timedelta(days=days)
                    qs = qs.filter(published_at__gte=since)
            except (TypeError, ValueError):
                pass

        qs = qs.order_by("-view_count", "-published_at", "-created_at")[:limit]
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["get"],
        url_path="related",
        permission_classes=[AllowAny],
    )
    @method_decorator(cache_page(60))
    def related(self, request, slug=None):
        """
        Return related articles based on section, category and shared tags.
        """

        article = self.get_object()

        qs = self.get_queryset().exclude(pk=article.pk)

        tag_ids = list(article.tags.values_list("id", flat=True))
        filters = Q()
        if article.category_id:
            filters |= Q(category_id=article.category_id)
        filters |= Q(section_id=article.section_id)
        if tag_ids:
            filters |= Q(tags__in=tag_ids)

        qs = qs.filter(filters).distinct().order_by("-published_at", "-created_at")[:10]
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class MediaViewSet(viewsets.ModelViewSet):
    serializer_class = MediaSerializer

    filterset_fields = ["article", "media_type"]
    ordering_fields = ["order", "id", "created_at"]

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [AllowAny()]
        return [IsEditorOrSuperAdmin()]

    def get_queryset(self):
        user = self.request.user
        is_privileged = bool(
            user
            and user.is_authenticated
            and getattr(user, "role", None) in CONTENT_MANAGER_ROLES
        )
        qs = Media.objects.all().select_related("article")
        if is_privileged:
            return qs
        return qs.filter(article__status=ContentStatus.PUBLISHED)


class VideoContentViewSet(viewsets.ModelViewSet):
    """
    CRUD API for standalone video content (non-reel).
    Public sees only published items; editors/admins can manage all.
    """

    serializer_class = VideoContentSerializer
    filterset_fields = ["section", "category", "tags", "status", "primary_language"]
    ordering_fields = ["published_at", "created_at", "view_count", "likes_count"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsEditorOrSuperAdmin()]

    def get_queryset(self):
        qs = (
            VideoContent.objects.all()
            .select_related("section", "category")
            .prefetch_related("tags")
        )
        user = self.request.user
        if _is_content_manager(user):
            return qs
        return qs.filter(status=ContentStatus.PUBLISHED)


class ReelContentViewSet(viewsets.ModelViewSet):
    """
    CRUD API for standalone reel content.
    Public sees only published items; editors/admins can manage all.
    """

    serializer_class = ReelContentSerializer
    filterset_fields = ["section", "category", "tags", "status", "primary_language"]
    ordering_fields = ["published_at", "created_at", "view_count", "likes_count"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsEditorOrSuperAdmin()]

    def get_queryset(self):
        qs = (
            ReelContent.objects.all()
            .select_related("section", "category")
            .prefetch_related("tags")
        )
        user = self.request.user
        if _is_content_manager(user):
            return qs
        return qs.filter(status=ContentStatus.PUBLISHED)


class EpaperEditionViewSet(viewsets.ModelViewSet):
    """
    CRUD API for single-file e-paper editions (PDF per publication date).
    Public users can list/retrieve to download; editors/admins can manage.
    """

    serializer_class = EpaperEditionSerializer
    queryset = EpaperEdition.objects.all()
    filterset_fields = ["publication_date"]
    ordering_fields = ["publication_date", "created_at"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsEditorOrSuperAdmin()]


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsOwnerOrPrivileged]

    filterset_fields = ["article", "parent", "user", "is_approved"]
    ordering_fields = ["created_at", "updated_at"]

    def get_queryset(self):
        qs = Comment.objects.all().select_related("article", "user", "parent")

        user = self.request.user
        is_privileged = bool(
            user
            and user.is_authenticated
            and getattr(user, "role", None) in CONTENT_MANAGER_ROLES
        )
        if is_privileged:
            return qs
        return qs.filter(is_approved=True, article__status=ContentStatus.PUBLISHED)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class LikeViewSet(
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    mixins.ListModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = LikeSerializer
    permission_classes = [IsOwnerOrPrivileged]
    filterset_fields = ["article", "user"]
    ordering_fields = ["created_at"]

    def get_queryset(self):
        qs = Like.objects.all().select_related("article", "user")

        user = self.request.user
        is_privileged = bool(
            user
            and user.is_authenticated
            and getattr(user, "role", None) in CONTENT_MANAGER_ROLES
        )
        if is_privileged:
            return qs
        if user and user.is_authenticated:
            return qs.filter(user=user)
        return qs.none()

    def perform_create(self, serializer):
        like = serializer.save(user=self.request.user)
        NewsArticle.objects.filter(pk=like.article_id).update(likes_count=F("likes_count") + 1)

    def perform_destroy(self, instance):
        article_id = instance.article_id
        instance.delete()
        NewsArticle.objects.filter(pk=article_id, likes_count__gt=0).update(likes_count=F("likes_count") - 1)


class CricketNewsProxyView(APIView):
    """
    Read-only proxy endpoint that fetches live cricket news (or scores) from an
    external API such as RapidAPI, and exposes it under our own backend.

    This keeps the RapidAPI key on the server and avoids CORS issues for the frontend.
    """

    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        if not getattr(settings, "CRICKET_API_ENABLED", False):
            return Response(
                {"detail": "Cricket API is not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        base_url = getattr(settings, "CRICKET_API_BASE_URL", "")
        api_host = getattr(settings, "CRICKET_API_HOST", "")
        api_key = getattr(settings, "CRICKET_API_KEY", "")

        if not base_url or not api_host or not api_key:
            return Response(
                {"detail": "Cricket API settings are incomplete."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            resp = requests.get(
                base_url,
                headers={
                    "x-rapidapi-key": api_key,
                    "x-rapidapi-host": api_host,
                },
                params=request.query_params,
                timeout=10,
            )
        except requests.RequestException:
            logger.exception("Error while calling external Cricket API")
            return Response(
                {"detail": "Failed to fetch data from cricket provider."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        content_type = resp.headers.get("content-type", "")
        if "application/json" in content_type:
            try:
                data = resp.json()
            except ValueError:
                return Response(
                    {"detail": "Invalid JSON from cricket provider."},
                    status=status.HTTP_502_BAD_GATEWAY,
                )
            return Response(data, status=resp.status_code)

        # Fallback: return raw text payload
        return Response(
            {"raw": resp.text},
            status=resp.status_code,
        )


class CricketMatchesProxyView(APIView):
    """
    Read-only proxy endpoint that fetches live cricket matches/scores from an
    external API such as RapidAPI (e.g. Cricbuzz matches/v1/live).
    """

    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        if not getattr(settings, "CRICKET_API_ENABLED", False):
            return Response(
                {"detail": "Cricket API is not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        matches_url = getattr(settings, "CRICKET_MATCHES_API_URL", "")
        api_host = getattr(settings, "CRICKET_API_HOST", "")
        api_key = getattr(settings, "CRICKET_API_KEY", "")

        if not matches_url or not api_host or not api_key:
            return Response(
                {"detail": "Cricket matches API settings are incomplete."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            resp = requests.get(
                matches_url,
                headers={
                    "x-rapidapi-key": api_key,
                    "x-rapidapi-host": api_host,
                },
                params=request.query_params,
                timeout=10,
            )
        except requests.RequestException:
            logger.exception("Error while calling external Cricket matches API")
            return Response(
                {"detail": "Failed to fetch live matches from cricket provider."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        content_type = resp.headers.get("content-type", "")
        if "application/json" in content_type:
            try:
                data = resp.json()
            except ValueError:
                return Response(
                    {"detail": "Invalid JSON from cricket matches provider."},
                    status=status.HTTP_502_BAD_GATEWAY,
                )
            return Response(data, status=resp.status_code)

        return Response({"raw": resp.text}, status=resp.status_code)
