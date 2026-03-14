from __future__ import annotations

from django.conf import settings
from django.db.models import F, Q, Count
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.utils.text import slugify
from django.views.decorators.cache import cache_page
from rest_framework import mixins, status, viewsets, serializers
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
    District,
    EpaperEdition,
    Like,
    Media,
    NewsArticle,
    Section,
    Tag,
    VideoContent,
    ReelContent,
    VideoLike,
    ReelLike,
    VideoComment,
    ReelComment,
    ContentStatus,
)
from .serializers import (
    CategorySerializer,
    CommentSerializer,
    DistrictSerializer,
    EpaperEditionSerializer,
    LikeSerializer,
    MediaSerializer,
    NewsArticleSerializer,
    SectionSerializer,
    TagSerializer,
    VideoContentSerializer,
    ReelContentSerializer,
    VideoLikeSerializer,
    VideoCommentSerializer,
    ReelLikeSerializer,
    ReelCommentSerializer,
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


from rest_framework.pagination import PageNumberPagination

class CustomPagination(PageNumberPagination):
    page_size_query_param = 'page_size'
    max_page_size = 200

class DistrictViewSet(viewsets.ModelViewSet):
    serializer_class = DistrictSerializer
    lookup_field = "slug"
    filterset_fields = ["section", "is_active"]
    ordering_fields = ["order", "name_en"]
    pagination_class = CustomPagination

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
        if self.action in ("list", "retrieve", "trending"):
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
    pagination_class = CustomPagination

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
        "is_trending",
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
            "toggle_like",
            "editor_picks",
        }:
            return [AllowAny()]

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
        qs = self.get_queryset().filter(is_breaking=True).order_by("-updated_at", "-published_at")[:5]
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="top", permission_classes=[AllowAny])
    @method_decorator(cache_page(60))
    def top_list(self, request):
        """Convenience list of top news (published, is_top=True)."""
        qs = self.get_queryset().filter(is_top=True).order_by("-updated_at", "-published_at")[:5]
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="editor-picks", permission_classes=[AllowAny])
    @method_decorator(cache_page(30))
    def editor_picks(self, request):
        """Convenience list of editor's pick articles (published, is_editor_pick=True)."""
        qs = self.get_queryset().filter(is_editor_pick=True).order_by("-updated_at", "-published_at")[:6]
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

    @action(detail=True, methods=["post"], permission_classes=[AllowAny])
    def toggle_like(self, request, slug=None):
        """
        Like/unlike the article for the current user or anonymous session.
        """
        article = self.get_object()
        user = request.user if request.user.is_authenticated else None
        
        session_id = request.COOKIES.get("device_id")
        is_new_session = False
        if not session_id and not user:
            import uuid
            session_id = str(uuid.uuid4())
            is_new_session = True
            
        ip_address = get_client_ip(request)
        
        if user:
            like = Like.objects.filter(user=user, article=article).first()
        else:
            like = Like.objects.filter(session_id=session_id, article=article).first()
            
        if not like:
            Like.objects.create(
                user=user, 
                article=article, 
                session_id=session_id, 
                ip_address=ip_address
            )
            NewsArticle.objects.filter(pk=article.pk).update(likes_count=F("likes_count") + 1)
            response_data = {"liked": True}
            status_code = status.HTTP_201_CREATED
        else:
            like.delete()
            NewsArticle.objects.filter(pk=article.pk, likes_count__gt=0).update(likes_count=F("likes_count") - 1)
            response_data = {"liked": False}
            status_code = status.HTTP_200_OK

        response = Response(response_data, status=status_code)
        if is_new_session:
            response.set_cookie("device_id", session_id, max_age=10*365*24*60*60, samesite='Lax')
        return response

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
    Supports both file upload and youtube_url (link).
    """

    serializer_class = VideoContentSerializer
    filterset_fields = ["section", "category", "tags", "status", "primary_language"]
    ordering_fields = ["published_at", "created_at", "updated_at", "view_count", "likes_count"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsEditorOrSuperAdmin()]

    def perform_create(self, serializer):
        data = serializer.validated_data
        # Validate: must have either file or youtube_url
        if not data.get("file") and not data.get("youtube_url"):
            raise serializers.ValidationError(
                {"detail": "Either 'file' or 'youtube_url' must be provided."}
            )
        slug = data.get("slug") or slugify(data.get("title_en", "")) or "video"
        slug = _unique_slug(VideoContent, slug[:320])
        serializer.save(slug=slug)

    def perform_update(self, serializer):
        data = serializer.validated_data
        instance = serializer.instance
        # Check what will be saved: use new value if provided, otherwise keep existing
        new_file = data.get("file") if "file" in data else (instance.file if instance else None)
        new_url = data.get("youtube_url") if "youtube_url" in data else (instance.youtube_url if instance else None)
        # If both would be empty after update, that's invalid
        if not new_file and not new_url:
            raise serializers.ValidationError(
                {"detail": "Either 'file' or 'youtube_url' must be provided."}
            )
        slug = data.get("slug") or (instance and instance.slug)
        if slug and instance:
            slug = _unique_slug(VideoContent, slug[:320], exclude_pk=instance.pk)
            serializer.save(slug=slug)
        else:
            serializer.save()

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

    @action(detail=True, methods=["post", "delete"], permission_classes=[AllowAny])
    def like(self, request, pk=None):
        video = self.get_object()
        user = request.user if request.user.is_authenticated else None
        
        session_id = request.COOKIES.get("device_id")
        is_new_session = False
        if not session_id and not user:
            import uuid
            session_id = str(uuid.uuid4())
            is_new_session = True
            
        ip_address = get_client_ip(request)

        if request.method == "POST":
            # Like the video
            if user:
                like = VideoLike.objects.filter(user=user, video=video).first()
            else:
                like = VideoLike.objects.filter(session_id=session_id, video=video).first()
                
            if not like:
                VideoLike.objects.create(user=user, video=video, session_id=session_id, ip_address=ip_address)
                VideoContent.objects.filter(pk=video.pk).update(likes_count=F("likes_count") + 1)
                response = Response({"status": "liked"}, status=status.HTTP_201_CREATED)
            else:
                response = Response({"status": "already liked"}, status=status.HTTP_200_OK)
                
            if is_new_session:
                response.set_cookie("device_id", session_id, max_age=10*365*24*60*60, samesite='Lax')
            return response

        elif request.method == "DELETE":
            # Unlike the video
            if user:
                deleted, _ = VideoLike.objects.filter(user=user, video=video).delete()
            else:
                deleted, _ = VideoLike.objects.filter(session_id=session_id, video=video).delete()
                
            if deleted:
                VideoContent.objects.filter(pk=video.pk, likes_count__gt=0).update(likes_count=F("likes_count") - 1)
            return Response({"status": "unliked"}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["get", "post"], permission_classes=[AllowAny])
    def comment(self, request, pk=None):
        video = self.get_object()
        if request.method == "GET":
            # Fetch comments for this video
            comments = VideoComment.objects.filter(video=video, is_approved=True)
            serializer = VideoCommentSerializer(comments, many=True)
            return Response(serializer.data)
        elif request.method == "POST":
            # Post a new comment
            user = request.user if request.user.is_authenticated else None
            session_id = request.COOKIES.get("device_id")
            is_new_session = False
            if not session_id and not user:
                import uuid
                session_id = str(uuid.uuid4())
                is_new_session = True
                
            ip_address = get_client_ip(request)
            
            guest_name = None
            if not user:
                import random, hashlib
                prefix = random.choice(["Citizen", "Local", "Reader", "Neighbor", "Observer"])
                h = hashlib.md5(session_id.encode()).hexdigest()
                guest_name = f"{prefix} #{h[:4].upper()}"

            data = request.data.copy()
            data["video"] = video.pk
            serializer = VideoCommentSerializer(data=data)
            if serializer.is_valid():
                serializer.save(user=user, session_id=session_id, ip_address=ip_address, guest_name=guest_name)
                response = Response(serializer.data, status=status.HTTP_201_CREATED)
                if is_new_session:
                    response.set_cookie("device_id", session_id, max_age=10*365*24*60*60, samesite='Lax')
                return response
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReelContentViewSet(viewsets.ModelViewSet):
    """
    CRUD API for standalone reel content.
    Public sees only published items; editors/admins can manage all.
    Supports both file upload and youtube_url (link).
    """

    serializer_class = ReelContentSerializer
    filterset_fields = ["section", "category", "tags", "status", "primary_language"]
    ordering_fields = ["published_at", "created_at", "updated_at", "view_count", "likes_count"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsEditorOrSuperAdmin()]

    def perform_create(self, serializer):
        data = serializer.validated_data
        # Validate: must have either file or youtube_url
        if not data.get("file") and not data.get("youtube_url"):
            raise serializers.ValidationError(
                {"detail": "Either 'file' or 'youtube_url' must be provided."}
            )
        slug = data.get("slug") or slugify(data.get("title_en", "")) or "reel"
        slug = _unique_slug(ReelContent, slug[:320])
        serializer.save(slug=slug)

    def perform_update(self, serializer):
        data = serializer.validated_data
        instance = serializer.instance
        # Check what will be saved: use new value if provided, otherwise keep existing
        new_file = data.get("file") if "file" in data else (instance.file if instance else None)
        new_url = data.get("youtube_url") if "youtube_url" in data else (instance.youtube_url if instance else None)
        # If both would be empty after update, that's invalid
        if not new_file and not new_url:
            raise serializers.ValidationError(
                {"detail": "Either 'file' or 'youtube_url' must be provided."}
            )
        slug = data.get("slug") or (instance and instance.slug)
        if slug and instance:
            slug = _unique_slug(ReelContent, slug[:320], exclude_pk=instance.pk)
            serializer.save(slug=slug)
        else:
            serializer.save()

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

    @action(detail=True, methods=["post", "delete"], permission_classes=[AllowAny])
    def like(self, request, pk=None):
        reel = self.get_object()
        user = request.user if request.user.is_authenticated else None
        
        session_id = request.COOKIES.get("device_id")
        is_new_session = False
        if not session_id and not user:
            import uuid
            session_id = str(uuid.uuid4())
            is_new_session = True
            
        ip_address = get_client_ip(request)

        if request.method == "POST":
            # Like the reel
            if user:
                like = ReelLike.objects.filter(user=user, reel=reel).first()
            else:
                like = ReelLike.objects.filter(session_id=session_id, reel=reel).first()
                
            if not like:
                ReelLike.objects.create(user=user, reel=reel, session_id=session_id, ip_address=ip_address)
                ReelContent.objects.filter(pk=reel.pk).update(likes_count=F("likes_count") + 1)
                response = Response({"status": "liked"}, status=status.HTTP_201_CREATED)
            else:
                response = Response({"status": "already liked"}, status=status.HTTP_200_OK)
                
            if is_new_session:
                response.set_cookie("device_id", session_id, max_age=10*365*24*60*60, samesite='Lax')
            return response

        elif request.method == "DELETE":
            # Unlike the reel
            if user:
                deleted, _ = ReelLike.objects.filter(user=user, reel=reel).delete()
            else:
                deleted, _ = ReelLike.objects.filter(session_id=session_id, reel=reel).delete()
                
            if deleted:
                ReelContent.objects.filter(pk=reel.pk, likes_count__gt=0).update(likes_count=F("likes_count") - 1)
            return Response({"status": "unliked"}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["get", "post"], permission_classes=[AllowAny])
    def comment(self, request, pk=None):
        reel = self.get_object()
        if request.method == "GET":
            # Fetch comments for this reel
            comments = ReelComment.objects.filter(reel=reel, is_approved=True)
            serializer = ReelCommentSerializer(comments, many=True)
            return Response(serializer.data)
        elif request.method == "POST":
            # Post a new comment
            user = request.user if request.user.is_authenticated else None
            session_id = request.COOKIES.get("device_id")
            is_new_session = False
            if not session_id and not user:
                import uuid
                session_id = str(uuid.uuid4())
                is_new_session = True
                
            ip_address = get_client_ip(request)
            
            guest_name = None
            if not user:
                import random, hashlib
                prefix = random.choice(["Citizen", "Local", "Reader", "Neighbor", "Observer"])
                h = hashlib.md5(session_id.encode()).hexdigest()
                guest_name = f"{prefix} #{h[:4].upper()}"

            data = request.data.copy()
            data["reel"] = reel.pk
            serializer = ReelCommentSerializer(data=data)
            if serializer.is_valid():
                serializer.save(user=user, session_id=session_id, ip_address=ip_address, guest_name=guest_name)
                response = Response(serializer.data, status=status.HTTP_201_CREATED)
                if is_new_session:
                    response.set_cookie("device_id", session_id, max_age=10*365*24*60*60, samesite='Lax')
                return response
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    filterset_fields = ["article", "parent", "user", "is_approved"]
    ordering_fields = ["created_at", "updated_at"]

    def get_permissions(self):
        if self.action in ("list", "retrieve", "create"):
            return [AllowAny()]
        return [IsOwnerOrPrivileged()]

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

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user if request.user.is_authenticated else None
        session_id = request.COOKIES.get("device_id")
        is_new_session = False
        if not session_id and not user:
            import uuid
            session_id = str(uuid.uuid4())
            is_new_session = True

        ip_address = get_client_ip(request)
        
        guest_name = None
        if not user:
            import random, hashlib
            prefix = random.choice(["Citizen", "Local", "Reader", "Neighbor", "Observer"])
            h = hashlib.md5(session_id.encode()).hexdigest()
            guest_name = f"{prefix} #{h[:4].upper()}"

        self.perform_create(serializer, user=user, session_id=session_id, ip_address=ip_address, guest_name=guest_name)
        headers = self.get_success_headers(serializer.data)
        response = Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        if is_new_session:
            response.set_cookie("device_id", session_id, max_age=10*365*24*60*60, samesite='Lax')
        return response

    def perform_create(self, serializer, **kwargs):
        serializer.save(**kwargs)


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


class EpaperEditionViewSet(viewsets.ModelViewSet):
    """
    CRUD API for e-paper editions.
    Public can view published editions; editors/admins can manage all.
    """
    serializer_class = EpaperEditionSerializer
    filterset_fields = ["publication_date"]
    ordering_fields = ["publication_date", "created_at"]
    ordering = ["-publication_date", "-created_at"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsEditorOrSuperAdmin()]

    def get_queryset(self):
        qs = EpaperEdition.objects.all()
        user = self.request.user
        if not _is_content_manager(user):
            # Public: see all editions (no status field, all are public)
            pass
        # Editors and admins see all for management
        return qs


class CricketNewsProxyView(APIView):
    """
    Read-only proxy endpoint that fetches live cricket news (or scores) from an
    external provider. Bypasses costly RapidAPI limits by scraping NDTV Sports.
    """

    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        from bs4 import BeautifulSoup
        url = 'https://sports.ndtv.com/cricket/live-scores'
        try:
            resp = requests.get(
                url,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"},
                timeout=10,
            )
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, 'html.parser')
            
            matches = []
            match_lists = soup.find_all('div', class_='scr_mtc')
            
            for m in match_lists:
                status_elem = m.find('div', class_='scr_mtc-stt')
                status_text = status_elem.text.strip() if status_elem else 'Live'
                
                info_elem = m.find('div', class_='scr_mtcInfo')
                match_info = info_elem.text.strip() if info_elem else 'Cricket Match'

                teams = m.find_all('div', class_='scr_tm-wrp')
                team1_name = "TBD"
                team1_score = ""
                team2_name = "TBD"
                team2_score = ""
                
                if len(teams) >= 2:
                    t1_nm = teams[0].find('div', class_='scr_tm-nm')
                    team1_name = t1_nm.text.strip() if t1_nm else "TBD"
                    t1_sc = teams[0].find('span', class_='scr_tm-run')
                    team1_score = t1_sc.text.strip() if t1_sc else ""
                    
                    t2_nm = teams[1].find('div', class_='scr_tm-nm')
                    team2_name = t2_nm.text.strip() if t2_nm else "TBD"
                    t2_sc = teams[1].find('span', class_='scr_tm-run')
                    team2_score = t2_sc.text.strip() if t2_sc else ""

                # Format matches identically to what `normalizeCricketItems` in frontend expects
                matches.append({
                    "story": {
                        "headline": match_info,
                        "intro": f"{team1_name} {team1_score} vs {team2_name} {team2_score} ({status_text})",
                    }
                })
                
            return Response({"storyList": matches})
            
        except Exception as e:
            logger.exception("NDTV Scraper failed")
            return Response({"detail": "Failed to scrape live cricket news.", "error": str(e)}, status=502)


class CricketMatchesProxyView(APIView):
    """
    Read-only proxy endpoint that fetches live cricket matches/scores.
    Bypasses costly RapidAPI limits by scraping NDTV Sports natively with BeautifulSoup.
    """

    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        from bs4 import BeautifulSoup
        url = 'https://sports.ndtv.com/cricket/live-scores'
        try:
            resp = requests.get(
                url,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"},
                timeout=10,
            )
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, 'html.parser')
            
            matches = []
            match_lists = soup.find_all('div', class_='scr_mtc')
            
            for m in match_lists:
                status_elem = m.find('div', class_='scr_mtc-stt')
                status_text = status_elem.text.strip() if status_elem else 'Live'
                
                info_elem = m.find('div', class_='scr_mtcInfo')
                match_info = info_elem.text.strip() if info_elem else 'Cricket Match'

                teams = m.find_all('div', class_='scr_tm-wrp')
                team1_name = "TBD"
                team1_score = ""
                team2_name = "TBD"
                team2_score = ""
                
                if len(teams) >= 2:
                    t1_nm = teams[0].find('div', class_='scr_tm-nm')
                    team1_name = t1_nm.text.strip() if t1_nm else "TBD"
                    t1_sc = teams[0].find('span', class_='scr_tm-run')
                    team1_score = t1_sc.text.strip() if t1_sc else ""
                    
                    t2_nm = teams[1].find('div', class_='scr_tm-nm')
                    team2_name = t2_nm.text.strip() if t2_nm else "TBD"
                    t2_sc = teams[1].find('span', class_='scr_tm-run')
                    team2_score = t2_sc.text.strip() if t2_sc else ""

                # Format matches identically to what `normalizeCricketMatches` in frontend expects
                matches.append({
                    "matchInfo": {
                        "status": status_text,
                        "matchDesc": match_info,
                        "team1": {"teamName": team1_name},
                        "team2": {"teamName": team2_name}
                    },
                    "matchScore": {
                        "team1Score": {"inngs1": {"runs": team1_score}},
                        "team2Score": {"inngs1": {"runs": team2_score}}
                    }
                })
                
            return Response({"typeMatches": [{"seriesMatches": [{"seriesAdWrapper": {"matches": matches}}]}]})
            
        except Exception as e:
            logger.exception("NDTV Scraper failed")
            return Response({"detail": "Failed to scrape live matches.", "error": str(e)}, status=502)


# Stooq.com symbols for Indian market indices (free, no API key, works from VPS)
MARKET_INDICES = [
    {"symbol": "^nsei",   "name": "NIFTY 50",   "is_currency": False},
    {"symbol": "^bsesn",  "name": "SENSEX",      "is_currency": False},
    {"symbol": "^nsebank","name": "BANK NIFTY",  "is_currency": False},
    {"symbol": "usdinr",  "name": "USD/INR",     "is_currency": True},
    {"symbol": "xauusd",  "name": "GOLD",        "is_currency": True},
]


@method_decorator(cache_page(60), name="get")
class MarketIndicesProxyView(APIView):
    """
    Proxy that fetches Indian market indices from Stooq.com (free, no API key, VPS-friendly).
    Returns normalized data for the Business page ticker.
    """

    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        results = []
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        }
        for idx in MARKET_INDICES:
            symbol = idx["symbol"]
            name = idx["name"]
            is_currency = idx["is_currency"]
            # Stooq CSV: Symbol,Date,Time,Open,High,Low,Close,Volume
            url = f"https://stooq.com/q/l/?s={symbol}&f=sd2t2ohlcv&h&e=csv"
            try:
                resp = requests.get(url, headers=headers, timeout=8)
                resp.raise_for_status()
                lines = resp.text.strip().splitlines()
                if len(lines) < 2:
                    raise ValueError("No data rows from Stooq")
                row = lines[1].split(",")
                # row: Symbol,Date,Time,Open,High,Low,Close,Volume
                open_price = float(row[3])
                close_price = float(row[6])
                change_val = close_price - open_price
                change_pct = (change_val / open_price * 100) if open_price != 0 else 0
                is_up = change_val >= 0

                if is_currency:
                    value_str = f"{close_price:.4f}"
                elif name == "GOLD":
                    value_str = f"${close_price:,.2f}"
                else:
                    value_str = f"{close_price:,.2f}"

                change_str = f"{'+' if change_val >= 0 else ''}{change_pct:.2f}%"

                results.append({
                    "name": name,
                    "symbol": symbol.upper(),
                    "value": value_str,
                    "change": change_str,
                    "changePercent": round(change_pct, 2),
                    "isUp": is_up,
                })
            except Exception as e:
                logger.warning("Stooq market fetch failed for %s: %s", symbol, e)
                results.append({
                    "name": name,
                    "symbol": symbol.upper(),
                    "value": None,
                    "change": None,
                    "changePercent": None,
                    "isUp": None,
                    "error": True,
                })

        return Response({"indices": results})
