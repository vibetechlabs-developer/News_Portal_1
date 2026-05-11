from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from .models import Reel, ReelCategory, ReelTag
from backend.common.view_dedupe import (
    attach_device_cookie_if_needed,
    resolve_view_actor,
    try_register_unique_view,
)
from .serializers import (
    ReelListSerializer,
    ReelDetailSerializer,
    ReelCreateUpdateSerializer,
    ReelCategorySerializer,
    ReelTagSerializer,
    ReelStatisticsSerializer
)


class ReelViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing reels and videos
    
    list: Get all approved published reels
    create: Create a new reel (authenticated)
    retrieve: Get reel details
    update: Update reel (author only)
    destroy: Delete reel (author/admin only)
    approve: Approve reel (admin only)
    trending: Get trending reels
    featured: Get featured reels
    statistics: Get reel statistics (admin)
    """
    
    queryset = Reel.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'primary_language', 'is_featured', 'is_trending']
    search_fields = ['title_en', 'title_hi', 'title_gu', 'description_en', 'author__username']
    ordering_fields = ['created_at', 'published_at', 'view_count', 'like_count']
    ordering = ['-published_at']
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'retrieve':
            return ReelDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ReelCreateUpdateSerializer
        elif self.action == 'statistics':
            return ReelStatisticsSerializer
        return ReelListSerializer
    
    def get_queryset(self):
        """Filter queryset based on user permissions"""
        if self.request.user.is_staff:
            # Admins see all reels
            return Reel.objects.all()
        elif self.request.method != 'GET':
            # Non-staff users can only modify their own reels
            return Reel.objects.filter(author=self.request.user)
        else:
            # Public users see only published approved reels
            return Reel.objects.filter(status='published', is_approved=True)
    
    def perform_create(self, serializer):
        """Assign current user as author"""
        serializer.save(author=self.request.user)
    
    def perform_update(self, serializer):
        """Only author or admin can update"""
        reel = self.get_object()
        if reel.author != self.request.user and not self.request.user.is_staff:
            self.permission_denied(
                self.request,
                message="You can only edit your own reels."
            )
        serializer.save()
    
    def perform_destroy(self, instance):
        """Only author or admin can delete"""
        if instance.author != self.request.user and not self.request.user.is_staff:
            self.permission_denied(
                self.request,
                message="You can only delete your own reels."
            )
        instance.delete()
    
    @action(detail=False, methods=['get'])
    def trending(self, request):
        """Get currently trending reels"""
        trending_reels = self.get_queryset().filter(
            is_trending=True,
            status='published'
        )[:10]
        serializer = self.get_serializer(trending_reels, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured reels"""
        featured_reels = self.get_queryset().filter(
            is_featured=True,
            status='published'
        )[:10]
        serializer = self.get_serializer(featured_reels, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_reels(self, request):
        """Get current user's reels"""
        if not request.user.is_authenticated:
            return Response(
                {'detail': 'Authentication required.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        user_reels = Reel.objects.filter(author=request.user)
        serializer = self.get_serializer(user_reels, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, slug=None):
        """Approve a reel (admin only)"""
        from django.utils import timezone
        
        reel = self.get_object()
        reel.is_approved = True
        reel.approved_by = request.user
        reel.approved_at = timezone.now()
        reel.save()
        
        serializer = self.get_serializer(reel)
        return Response(
            {'message': 'Reel approved successfully.', 'reel': serializer.data},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def publish(self, request, slug=None):
        """Publish a reel (admin only)"""
        reel = self.get_object()
        
        if not reel.is_approved:
            return Response(
                {'error': 'Cannot publish. Reel must be approved first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            reel.publish()
            serializer = self.get_serializer(reel)
            return Response(
                {'message': 'Reel published successfully.', 'reel': serializer.data},
                status=status.HTTP_200_OK
            )
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def increment_view(self, request, slug=None):
        """Increment view count for a reel"""
        reel = self.get_object()
        actor, session_id, is_new_session = resolve_view_actor(request)
        dedupe_key = f"view:reelsapp:{reel.pk}:{actor}"
        if not try_register_unique_view(dedupe_key):
            resp = Response({"view_count": reel.view_count, "deduped": True})
            attach_device_cookie_if_needed(resp, session_id, is_new_session)
            return resp
        reel.view_count += 1
        reel.save(update_fields=['view_count'])
        resp = Response({"view_count": reel.view_count})
        attach_device_cookie_if_needed(resp, session_id, is_new_session)
        return resp
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, slug=None):
        """Like a reel"""
        reel = self.get_object()
        reel.like_count += 1
        reel.save(update_fields=['like_count'])
        return Response({'like_count': reel.like_count})
    
    @action(detail=True, methods=['post'])
    def share(self, request, slug=None):
        """Share a reel"""
        reel = self.get_object()
        reel.share_count += 1
        reel.save(update_fields=['share_count'])
        return Response({'share_count': reel.share_count})
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def statistics(self, request):
        """Get statistics for all reels (admin only)"""
        reels = self.get_queryset().order_by('-view_count')[:20]
        serializer = self.get_serializer(reels, many=True)
        
        total_views = sum(reel.view_count for reel in reels)
        total_likes = sum(reel.like_count for reel in reels)
        
        return Response({
            'total_reels': self.get_queryset().count(),
            'total_views': total_views,
            'total_likes': total_likes,
            'top_reels': serializer.data
        })


class ReelCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for reel categories"""
    
    queryset = ReelCategory.objects.filter(is_active=True).order_by('order')
    serializer_class = ReelCategorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name_en', 'name_hi', 'name_gu', 'slug']
    ordering = ['order']


class ReelTagViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for reel tags"""
    
    queryset = ReelTag.objects.filter(is_active=True).order_by('name')
    serializer_class = ReelTagSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'slug']
