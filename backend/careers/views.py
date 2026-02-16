from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from .models import JobPosting, JobApplication, ApplicationReview, Notification
from .serializers import (
    JobPostingSerializer, JobApplicationSerializer,
    ApplicationReviewSerializer, JobApplicationDetailSerializer,
    NotificationSerializer
)
from .permissions import IsAdminOrReadOnly, IsApplicationOwnerOrAdmin, IsAdminUser


class JobPostingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing job postings.
    
    - List: Public (anyone can view)
    - Create/Update/Delete: Admin only
    """
    queryset = JobPosting.objects.all()
    serializer_class = JobPostingSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ['status', 'job_type', 'category', 'location']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['created_at', 'deadline']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def open_positions(self, request):
        """Get only open job positions"""
        open_jobs = self.queryset.filter(status='OPEN')
        serializer = self.get_serializer(open_jobs, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], permission_classes=[IsAdminUser])
    def applications(self, request, pk=None):
        """Get all applications for a specific job"""
        job = self.get_object()
        applications = job.applications.all()
        serializer = JobApplicationSerializer(applications, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], permission_classes=[IsAdminUser])
    def statistics(self, request, pk=None):
        """Get application statistics for a job"""
        job = self.get_object()
        stats = {
            'total_applications': job.applications.count(),
            'submitted': job.applications.filter(status='SUBMITTED').count(),
            'under_review': job.applications.filter(status='UNDER_REVIEW').count(),
            'shortlisted': job.applications.filter(status='SHORTLISTED').count(),
            'accepted': job.applications.filter(status='ACCEPTED').count(),
            'rejected': job.applications.filter(status='REJECTED').count(),
        }
        return Response(stats)


class JobApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for job applications.
    
    - Create: Public (anyone can apply without login)
    - View own: Authenticated users can view their applications
    - List/Update: Admin can see all and manage
    """
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    permission_classes = [AllowAny]  # Allow public access for creating applications
    filterset_fields = ['job_posting', 'status']
    search_fields = ['full_name', 'email', 'skills']
    ordering_fields = ['applied_at', 'updated_at']
    ordering = ['-applied_at']
    
    def get_permissions(self):
        """
        Allow public access for create, but require authentication for list/update/delete
        """
        if self.action == 'create':
            return [AllowAny()]
        elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return super().get_permissions()
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return JobApplication.objects.none()  # Unauthenticated users see nothing (they can only create)
        if user.role == 'SUPER_ADMIN':
            return self.queryset
        # Regular users see only their applications (where user is not None)
        return self.queryset.filter(user=user)
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return JobApplicationDetailSerializer
        return JobApplicationSerializer
    
    def perform_create(self, serializer):
        # If user is authenticated, link to their account, otherwise set to None
        user = self.request.user if self.request.user.is_authenticated else None
        application = serializer.save(user=user)
        
        # Create notification for admin
        Notification.objects.create(
            notification_type='CAREER_APPLICATION',
            title=f'New Job Application: {application.job_posting.title}',
            message=f'{application.full_name} has applied for the position "{application.job_posting.title}". Email: {application.email}',
            related_object_type='JobApplication',
            related_object_id=application.id
        )
    
    def perform_update(self, serializer):
        """Allow admin to update status and notes"""
        obj = self.get_object()
        if self.request.user.role == 'SUPER_ADMIN':
            serializer.save()
        else:
            # Non-admin users can only update their own application (if user is not None)
            if obj.user and obj.user == self.request.user:
                serializer.save()
            else:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You can only update your own applications")
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def change_status(self, request, pk=None):
        """Admin can change application status"""
        application = self.get_object()
        new_status = request.data.get('status')
        
        valid_statuses = ['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'ACCEPTED']
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Must be one of {valid_statuses}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        application.status = new_status
        application.save()
        serializer = self.get_serializer(application)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], permission_classes=[IsApplicationOwnerOrAdmin])
    def download_resume(self, request, pk=None):
        """Download the resume file"""
        application = self.get_object()
        if not application.resume:
            return Response(
                {'error': 'No resume found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        file_url = request.build_absolute_uri(application.resume.url)
        return Response({'resume_url': file_url})
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def all_applications(self, request):
        """Admin view: All applications across all jobs"""
        applications = JobApplication.objects.all()
        
        # Filter by job if specified
        job_id = request.query_params.get('job_id')
        if job_id:
            applications = applications.filter(job_posting_id=job_id)
        
        # Filter by status if specified
        status_filter = request.query_params.get('status')
        if status_filter:
            applications = applications.filter(status=status_filter)
        
        serializer = self.get_serializer(applications, many=True)
        return Response(serializer.data)


class ApplicationReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for reviewing applications (Admin only).
    
    - Create: Admin creates review
    - Update: Admin can update review
    - Delete: Admin can delete review
    """
    queryset = ApplicationReview.objects.all()
    serializer_class = ApplicationReviewSerializer
    permission_classes = [IsAdminUser]
    ordering_fields = ['reviewed_at', 'rating']
    ordering = ['-reviewed_at']
    
    def perform_create(self, serializer):
        serializer.save(reviewed_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def by_rating(self, request):
        """Get applications grouped by rating"""
        rating = request.query_params.get('rating')
        if not rating:
            return Response({'error': 'rating parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        
        reviews = self.queryset.filter(rating=rating)
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for notifications (Admin only).
    
    - List: Get all notifications
    - Retrieve: Get specific notification
    - Mark as read: Mark notification as read
    """
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAdminUser]
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter notifications - can add filters for unread only"""
        queryset = super().get_queryset()
        unread_only = self.request.query_params.get('unread_only', 'false').lower() == 'true'
        if unread_only:
            queryset = queryset.filter(is_read=False)
        return queryset
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.mark_as_read()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        count = Notification.objects.filter(is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        return Response({'marked_read': count})
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = Notification.objects.filter(is_read=False).count()
        return Response({'unread_count': count})
