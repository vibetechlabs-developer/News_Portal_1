from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from django.conf import settings
from django.utils.html import escape
import base64
import mimetypes

from backend.common.mail import send_mail_logged
from .models import JobPosting, JobApplication, ApplicationReview, Notification
from .serializers import (
    JobPostingSerializer, JobApplicationSerializer,
    ApplicationReviewSerializer, JobApplicationDetailSerializer,
    NotificationSerializer
)
from .permissions import IsAdminOrReadOnly, IsApplicationOwnerOrAdmin, IsAdminUser


def _photo_data_uri(application: JobApplication) -> str:
    if not application.photo:
        return ""
    try:
        photo_path = application.photo.path
        with open(photo_path, "rb") as f:
            encoded = base64.b64encode(f.read()).decode("ascii")
        mime = mimetypes.guess_type(photo_path)[0] or "image/jpeg"
        return f"data:{mime};base64,{encoded}"
    except Exception:
        return ""


def _build_nimnuk_patra_html(application: JobApplication, job: JobPosting) -> str:
    photo_uri = _photo_data_uri(application)
    photo_block = (
        f'<img src="{photo_uri}" alt="Photo" style="width:150px;height:180px;object-fit:cover;border:1px solid #777;" />'
        if photo_uri
        else '<div style="width:150px;height:180px;border:1px dashed #777;display:flex;align-items:center;justify-content:center;">Photo</div>'
    )
    notes_html = ""
    if application.admin_notes:
        notes_html = (
            "<p><strong>Special Note:</strong><br/>"
            f"{escape(application.admin_notes).replace(chr(10), '<br/>')}</p>"
        )
    return f"""
<html><body style="font-family:Arial,sans-serif;line-height:1.5;color:#111;">
  <div style="max-width:900px;margin:0 auto;border:1px solid #ddd;padding:22px;">
    <h2 style="text-align:center;margin:0 0 16px;color:#b30000;">NIMNUK PATRA (APPOINTMENT LETTER)</h2>
    <p style="text-align:right;">Date: {escape(timezone.now().strftime("%d-%m-%Y"))}</p>
    <p>Prati, <strong>{escape(application.full_name)}</strong></p>
    <div style="margin:14px 0;">{photo_block}</div>
    <p>
      Aapne Kanam Express ma <strong>{escape(job.title)}</strong> pad ma nimnuk karva ma aave chhe.
      Aapni faraj Gujarat ane rashtriya star na samachar seva ma yogdan aapvani rehse.
    </p>
    <ul>
      <li>Department/Category: {escape(job.get_category_display())}</li>
      <li>Location: {escape(job.location)}</li>
      <li>Job Type: {escape(job.get_job_type_display())}</li>
      <li>Contact: {escape(application.phone)}</li>
    </ul>
    {notes_html}
    <p>Shubhkamna sathe, tamaro safar safal rahe evi kamna.</p>
    <p style="margin-top:26px;">Aapno Vishvasu,<br/><strong>Kanam Express Team</strong></p>
  </div>
</body></html>
""".strip()


def _build_id_card_html(application: JobApplication, job: JobPosting) -> str:
    photo_uri = _photo_data_uri(application)
    photo_block = (
        f'<img src="{photo_uri}" alt="Photo" style="width:120px;height:145px;object-fit:cover;border:1px solid #333;" />'
        if photo_uri
        else '<div style="width:120px;height:145px;border:1px dashed #333;display:flex;align-items:center;justify-content:center;">Photo</div>'
    )
    serial_no = f"KE-{timezone.now().strftime('%Y')}-{application.id:04d}"
    return f"""
<html><body style="font-family:Arial,sans-serif;">
  <div style="width:360px;border:2px solid #d98c00;padding:14px;">
    <h3 style="margin:0 0 8px;color:#b00000;">KANAM EXPRESS - STAFF ID</h3>
    <p style="margin:4px 0 12px;font-size:12px;">www.kanamexpress.com</p>
    <div style="display:flex;gap:12px;align-items:flex-start;">
      {photo_block}
      <div style="font-size:13px;line-height:1.5;">
        <p style="margin:0;"><strong>Name:</strong> {escape(application.full_name)}</p>
        <p style="margin:0;"><strong>Role:</strong> {escape(job.title)}</p>
        <p style="margin:0;"><strong>Phone:</strong> {escape(application.phone)}</p>
        <p style="margin:0;"><strong>Email:</strong> {escape(application.email)}</p>
        <p style="margin:0;"><strong>ID No:</strong> {escape(serial_no)}</p>
        <p style="margin:0;"><strong>Valid Upto:</strong> 31/12/{timezone.now().year + 1}</p>
      </div>
    </div>
  </div>
</body></html>
""".strip()


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
        
        old_status = application.status
        application.status = new_status
        application.save()
        
        resend_email = str(request.data.get("resend_email", "")).lower() in {"1", "true", "yes"}
        should_send_acceptance = new_status == "ACCEPTED" and (old_status != "ACCEPTED" or resend_email)

        if should_send_acceptance:
            job = application.job_posting
            subject = f"Job Application Accepted: {job.title} at Kanam Express"
            body = (
                f"Dear {application.full_name},\n\n"
                f"Congratulations! You have been accepted for the job role: {job.title}.\n\n"
                f"Job Details:\n"
                f"- Category: {job.get_category_display()}\n"
                f"- Location: {job.location}\n"
                f"- Job Type: {job.get_job_type_display()}\n"
            )
            
            if job.salary_range_min and job.salary_range_max:
                body += f"- Salary Range: {job.salary_range_min} to {job.salary_range_max}\n"
            
            if application.admin_notes:
                body += f"\nNote from team:\n{application.admin_notes}\n"
                
            body += (
                f"\nWelcome to the team!\n\n"
                f"Best Regards,\n"
                f"Kanam Express Team\n"
                f"kanamexpress.com"
            )

            nimnuk_html = _build_nimnuk_patra_html(application, job)
            id_card_html = _build_id_card_html(application, job)
            safe_name = "".join(ch if ch.isalnum() else "_" for ch in application.full_name).strip("_") or "candidate"
            letter_filename = f"nimnuk_patra_{safe_name}.html"
            id_filename = f"id_card_{safe_name}.html"
            email_sent = send_mail_logged(
                subject=subject,
                message=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[application.email],
                html_message=nimnuk_html,
                binary_attachments=[
                    (letter_filename, nimnuk_html.encode("utf-8"), "text/html; charset=utf-8"),
                    (id_filename, id_card_html.encode("utf-8"), "text/html; charset=utf-8"),
                ],
            )

            if not email_sent:
                return Response(
                    {
                        "error": "Status updated to ACCEPTED, but email sending failed. Check SMTP settings/logs.",
                    },
                    status=status.HTTP_502_BAD_GATEWAY,
                )

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
