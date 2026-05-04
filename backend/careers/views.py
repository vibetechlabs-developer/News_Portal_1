from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from django.conf import settings
from django.utils.html import escape
from django.utils.text import slugify
from io import BytesIO
import logging
import threading
import os

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

from backend.common.mail import send_mail_logged_with_error
from .models import JobPosting, JobApplication, ApplicationReview, Notification
from .serializers import (
    JobPostingSerializer, JobApplicationSerializer,
    ApplicationReviewSerializer, JobApplicationDetailSerializer,
    NotificationSerializer
)
from .permissions import IsAdminOrReadOnly, IsApplicationOwnerOrAdmin, IsAdminUser

logger = logging.getLogger(__name__)


def _pdf_safe_text(value: object) -> str:
    """
    ReportLab default fonts can fail on non-latin text.
    Convert dynamic text to latin-safe representation to avoid 500/502.
    """
    text = "" if value is None else str(value)
    return text.encode("latin-1", "replace").decode("latin-1")


def _draw_photo(c: canvas.Canvas, application: JobApplication, x: float, y: float, w: float, h: float) -> None:
    c.setStrokeColor(colors.grey)
    c.rect(x, y, w, h, stroke=1, fill=0)
    if not application.photo:
        c.setFont("Helvetica", 9)
        c.drawCentredString(x + (w / 2), y + (h / 2), "PHOTO")
        return
    try:
        reader = ImageReader(application.photo.path)
        c.drawImage(reader, x + 2, y + 2, w - 4, h - 4, preserveAspectRatio=True, anchor="c")
    except Exception:
        c.setFont("Helvetica", 9)
        c.drawCentredString(x + (w / 2), y + (h / 2), "PHOTO")


def _template_asset_path(filename: str) -> str:
    return os.path.join(settings.BASE_DIR, "careers", "template_assets", filename)


def _draw_background_if_exists(
    c: canvas.Canvas, file_path: str, x: float, y: float, w: float, h: float
) -> bool:
    if not os.path.exists(file_path):
        return False
    try:
        c.drawImage(ImageReader(file_path), x, y, w, h, preserveAspectRatio=False, mask="auto")
        return True
    except Exception:
        logger.exception("Failed to draw background template: %s", file_path)
        return False


def _build_nimnuk_patra_pdf(application: JobApplication, job: JobPosting) -> bytes:
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    template_used = _draw_background_if_exists(
        c, _template_asset_path("nimnuk_patra_bg.png"), 0, 0, width, height
    )

    if not template_used:
        c.setFillColor(colors.HexColor("#cf1b1b"))
        c.rect(0, height - 70, width, 70, fill=1, stroke=0)
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 22)
        c.drawCentredString(width / 2, height - 45, "NIMNUK PATRA")

    c.setFillColor(colors.black)
    c.setFont("Helvetica", 11)
    c.drawRightString(width - 40, height - 95, f"Date: {timezone.now().strftime('%d-%m-%Y')}")
    c.drawString(45, height - 130, f"To: {_pdf_safe_text(application.full_name)}")

    _draw_photo(c, application, width - 200, height - 310, 140, 170)

    text = c.beginText(45, height - 170)
    text.setFont("Helvetica", 12)
    lines = [
        "We are pleased to appoint you at Kanam Express.",
        f"Position: {_pdf_safe_text(job.title)}",
        f"Category: {_pdf_safe_text(job.get_category_display())}",
        f"Location: {_pdf_safe_text(job.location)}",
        f"Job Type: {_pdf_safe_text(job.get_job_type_display())}",
        f"Contact: {_pdf_safe_text(application.phone)}",
        "",
        "Please follow company policy, ethics and legal compliance.",
    ]
    if application.admin_notes:
        lines += ["", "Special Note:", _pdf_safe_text(application.admin_notes)]
    for line in lines:
        text.textLine(line)
    c.drawText(text)

    c.setFont("Helvetica-Bold", 12)
    c.drawString(45, 110, "Best Regards,")
    c.setFont("Helvetica", 12)
    c.drawString(45, 92, "Kanam Express Team")
    c.drawString(45, 76, "kanamexpress.com")

    c.showPage()
    c.save()
    return buffer.getvalue()


def _build_id_card_pdf(application: JobApplication, job: JobPosting) -> bytes:
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=landscape(A4))
    width, height = landscape(A4)

    margin = 40
    gap = 24
    card_w = (width - (2 * margin) - gap) / 2
    card_h = height - (2 * margin)
    left_x = margin
    right_x = margin + card_w + gap
    y = margin
    front_bg_used = _draw_background_if_exists(
        c, _template_asset_path("id_card_front_bg.png"), left_x, y, card_w, card_h
    )
    back_bg_used = _draw_background_if_exists(
        c, _template_asset_path("id_card_back_bg.png"), right_x, y, card_w, card_h
    )

    # Front card
    if not front_bg_used:
        c.setStrokeColor(colors.HexColor("#d98c00"))
        c.setLineWidth(2)
        c.rect(left_x, y, card_w, card_h, stroke=1, fill=0)
        c.setFillColor(colors.HexColor("#cf1b1b"))
        c.rect(left_x, y + card_h - 54, card_w, 54, stroke=0, fill=1)
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 18)
        c.drawCentredString(left_x + (card_w / 2), y + card_h - 34, "KANAM EXPRESS")
        c.setFont("Helvetica-Bold", 13)
        c.drawCentredString(left_x + (card_w / 2), y + card_h - 50, "NEWS GUJARATI")

    _draw_photo(c, application, left_x + (card_w / 2) - 58, y + 178, 116, 142)
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 15)
    c.drawCentredString(left_x + (card_w / 2), y + 150, _pdf_safe_text(application.full_name)[:38])
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(left_x + (card_w / 2), y + 130, _pdf_safe_text(job.title))
    c.setFont("Helvetica", 11)
    c.drawCentredString(left_x + (card_w / 2), y + 112, _pdf_safe_text(application.phone))
    c.setFillColor(colors.HexColor("#312f9b"))
    c.setFont("Helvetica-Bold", 12)
    serial_no = f"KE-{timezone.now().strftime('%Y')}-{application.id:04d}"
    c.drawCentredString(left_x + (card_w / 2), y + 92, f"KE Sr No. {serial_no}")
    c.setFillColor(colors.HexColor("#e25c00"))
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(left_x + (card_w / 2), y + 42, "TV PRESS")

    # Back card
    if not back_bg_used:
        c.setStrokeColor(colors.HexColor("#d98c00"))
        c.setLineWidth(2)
        c.rect(right_x, y, card_w, card_h, stroke=1, fill=0)
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(right_x + 20, y + card_h - 34, "Valid Upto : LIFE TIME")
    c.drawString(right_x + 20, y + card_h - 56, "Address")
    c.setFont("Helvetica", 13)
    c.drawString(right_x + 120, y + card_h - 56, "Jambusar, Dist. Bharuch")

    c.setFont("Helvetica-Bold", 13)
    c.drawString(right_x + 20, y + card_h - 95, "Rules & Regulations:")
    rules = c.beginText(right_x + 20, y + card_h - 115)
    rules.setFont("Helvetica", 11)
    for line in [
        "- Card holder must follow organization rules.",
        "- Illegal use is card holder responsibility.",
        "- Loss/misplacement must be reported immediately.",
        "- Kanam Express may deactivate card at any time.",
    ]:
        rules.textLine(line)
    c.drawText(rules)

    c.setFont("Helvetica-Bold", 13)
    c.drawString(right_x + 20, y + 85, "HEAD OFFICE")
    c.setFont("Helvetica", 10)
    c.drawString(right_x + 20, y + 70, "Gokul Lala Ni Khadki, Jawahar Bazar, Jambusar")
    c.drawString(right_x + 20, y + 56, "Dist. Bharuch, Gujarat")
    c.drawString(right_x + 20, y + 42, "9824749413 / 7623046498")
    c.drawString(right_x + 20, y + 28, "kanamexpress@gmail.com")

    c.showPage()
    c.save()
    return buffer.getvalue()


def _send_acceptance_email_documents(application_id: int) -> None:
    """
    Build PDFs and send acceptance email in background so API response is fast.
    """
    try:
        application = JobApplication.objects.select_related("job_posting").get(pk=application_id)
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

        nimnuk_pdf = _build_nimnuk_patra_pdf(application, job)
        id_card_pdf = _build_id_card_pdf(application, job)
        safe_name = slugify(application.full_name) or f"candidate_{application.id}"
        letter_filename = f"nimnuk_patra_{safe_name}.pdf"
        id_filename = f"id_card_{safe_name}.pdf"

        email_sent, email_error = send_mail_logged_with_error(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[application.email],
            binary_attachments=[
                (letter_filename, nimnuk_pdf, "application/pdf"),
                (id_filename, id_card_pdf, "application/pdf"),
            ],
        )
        if not email_sent:
            send_mail_logged_with_error(
                subject=subject,
                message=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[application.email],
            )
            logger.warning("Acceptance email attachment send failed (application_id=%s): %s", application.id, email_error)
    except Exception:
        logger.exception("Background acceptance email send failed for application_id=%s", application_id)


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
        
        try:
            old_status = application.status
            application.status = new_status
            application.save()

            resend_email = str(request.data.get("resend_email", "")).lower() in {"1", "true", "yes"}
            should_send_acceptance = new_status == "ACCEPTED" and (old_status != "ACCEPTED" or resend_email)

            if should_send_acceptance:
                threading.Thread(
                    target=_send_acceptance_email_documents,
                    args=(application.id,),
                    daemon=True,
                ).start()

            serializer = self.get_serializer(application)
            return Response(serializer.data)
        except Exception:
            logger.exception("change_status failed for application_id=%s", application.id)
            # Return safe JSON instead of letting this become nginx 500 HTML page.
            return Response(
                {
                    "id": application.id,
                    "status": application.status,
                    "detail": "Status processed, but an internal error occurred while building response.",
                },
                status=status.HTTP_200_OK,
            )
    
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
