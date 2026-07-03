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
from django.template.loader import render_to_string
from io import BytesIO
import logging
import threading
import os
import math

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from backend.common.mail import send_mail_logged_with_error
from .models import JobPosting, JobApplication, ApplicationReview, Notification
from .serializers import (
    JobPostingSerializer, JobApplicationSerializer,
    ApplicationReviewSerializer, JobApplicationDetailSerializer,
    NotificationSerializer
)
from .permissions import IsAdminOrReadOnly, IsApplicationOwnerOrAdmin, IsAdminUser

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Gujarati Unicode font registration (NotoSansGujarati)
# ---------------------------------------------------------------------------
_FONT_REG = "NotoGujarati"
_FONT_BOLD = "NotoGujaratiBold"
_FONT_LATIN = "Helvetica"
_FONT_LATIN_BOLD = "Helvetica-Bold"

def _register_gujarati_fonts():
    reg_path = os.path.join(settings.BASE_DIR, "careers", "template_assets", "NotoSansGujarati-Regular.ttf")
    bold_path = os.path.join(settings.BASE_DIR, "careers", "template_assets", "NotoSansGujarati-Bold.ttf")
    try:
        if _FONT_REG not in pdfmetrics.getRegisteredFontNames():
            pdfmetrics.registerFont(TTFont(_FONT_REG, reg_path))
        if _FONT_BOLD not in pdfmetrics.getRegisteredFontNames():
            pdfmetrics.registerFont(TTFont(_FONT_BOLD, bold_path))
    except Exception:
        logger.warning("Could not register Gujarati fonts; falling back to Helvetica.")

_register_gujarati_fonts()


def _guj_font(bold=False):
    """Return the Gujarati font name if registered, else fallback to Helvetica."""
    name = _FONT_BOLD if bold else _FONT_REG
    if name in pdfmetrics.getRegisteredFontNames():
        return name
    return _FONT_LATIN_BOLD if bold else _FONT_LATIN


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _pdf_safe_text(value: object) -> str:
    """Convert to string; Gujarati text is handled via the TTF font path."""
    return "" if value is None else str(value)


def _latin_safe(value: object) -> str:
    """Encode to latin-1 for standard Helvetica font paths."""
    text = "" if value is None else str(value)
    return text.encode("latin-1", "replace").decode("latin-1")


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


def _draw_photo(
    c: canvas.Canvas, application: JobApplication,
    x: float, y: float, w: float, h: float,
    border_color=None
) -> None:
    """Draw applicant photo or placeholder."""
    bcolor = border_color or colors.HexColor("#888888")
    c.setStrokeColor(bcolor)
    c.setLineWidth(1.5)
    c.rect(x, y, w, h, stroke=1, fill=0)
    if not application.photo:
        c.setFont(_FONT_LATIN, 9)
        c.setFillColor(colors.grey)
        c.drawCentredString(x + w / 2, y + h / 2, "PHOTO")
        return
    try:
        reader = ImageReader(application.photo.path)
        c.drawImage(reader, x + 2, y + 2, w - 4, h - 4, preserveAspectRatio=True, anchor="c")
    except Exception:
        c.setFont(_FONT_LATIN, 9)
        c.setFillColor(colors.grey)
        c.drawCentredString(x + w / 2, y + h / 2, "PHOTO")


def _draw_rounded_rect(c: canvas.Canvas, x, y, w, h, r, fill_color=None, stroke_color=None, line_width=1):
    """Draw a rounded rectangle using bezier curves."""
    c.saveState()
    if fill_color:
        c.setFillColor(fill_color)
    if stroke_color:
        c.setStrokeColor(stroke_color)
        c.setLineWidth(line_width)
    p = c.beginPath()
    p.moveTo(x + r, y)
    p.lineTo(x + w - r, y)
    p.curveTo(x + w, y, x + w, y, x + w, y + r)
    p.lineTo(x + w, y + h - r)
    p.curveTo(x + w, y + h, x + w, y + h, x + w - r, y + h)
    p.lineTo(x + r, y + h)
    p.curveTo(x, y + h, x, y + h, x, y + h - r)
    p.lineTo(x, y + r)
    p.curveTo(x, y, x, y, x + r, y)
    p.close()
    c.drawPath(p, fill=1 if fill_color else 0, stroke=1 if stroke_color else 0)
    c.restoreState()


def _generate_press_id(application_id: int) -> str:
    """Generate a unique Press ID in format KE-YYYY-XXXX."""
    return f"KE-{timezone.now().strftime('%Y')}-{application_id:04d}"


# ---------------------------------------------------------------------------
# PDF: Professional Nimnuk Patra (Appointment Letter)
# ---------------------------------------------------------------------------

def _build_nimnuk_patra_pdf(application: JobApplication, job: JobPosting) -> bytes:
    """
    Generate a professional Gujarati Nimnuk Patra (appointment letter) PDF.
    Uses the official nimnuk_patra_template.png and overlays candidate details.
    """
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    W, H = A4

    bg_path = _template_asset_path("nimnuk_patra_template.png")
    c.drawImage(bg_path, 0, 0, W, H)

    # Coordinate mapping from grid size (1024 x 911) to A4 (W x H)
    def gxt(x):
        return x * (W / 1024)
    def gyt(y):
        return H - (y * (H / 911))

    c.setFillColor(colors.white)
    # 1. Cover Ref No (x = 140 to 350, y = 15 to 45)
    c.rect(gxt(140), gyt(45), gxt(350-140), gyt(15)-gyt(45), fill=1, stroke=0)
    # 2. Cover Date (x = 770 to 950, y = 15 to 45)
    c.rect(gxt(770), gyt(45), gxt(950-770), gyt(15)-gyt(45), fill=1, stroke=0)
    # 3. Cover Recipient Details (x = 90 to 410, y = 220 to 350)
    c.rect(gxt(90), gyt(350), gxt(410-90), gyt(220)-gyt(350), fill=1, stroke=0)
    # 4. Cover Photo (x = 416 to 598, y = 238 to 486)
    c.rect(gxt(416), gyt(486), gxt(598-416), gyt(238)-gyt(486), fill=1, stroke=0)
    # 5. Cover designation phrase "સુરત બ્યુરો ચીફ" (x = 700 to 900, y = 548 to 578)
    c.rect(gxt(700), gyt(578), gxt(900-700), gyt(548)-gyt(578), fill=1, stroke=0)
    # 6. Cover signature text (x = 650 to 900, y = 840 to 905)
    c.rect(gxt(650), gyt(905), gxt(900-650), gyt(840)-gyt(905), fill=1, stroke=0)

    # Draw dynamic values
    c.setFillColor(colors.black)

    # Ref No
    press_id = application.employee_press_id or _generate_press_id(application.id)
    c.setFont(_FONT_LATIN_BOLD, 11)
    c.drawString(gxt(140), gyt(34), press_id)

    # Date
    today_str = timezone.now().strftime("%d-%m-%Y")
    c.drawString(gxt(770), gyt(34), today_str)

    # Recipient Info (Gujarati)
    guj = _guj_font(bold=False)
    guj_bold = _guj_font(bold=True)

    c.setFont(guj_bold, 13)
    c.drawString(gxt(95), gyt(222), "પ્રતિશ્રી,")
    c.drawString(gxt(95), gyt(248), _pdf_safe_text(application.full_name))

    c.setFont(guj, 12)
    father = getattr(application, "father_name", None)
    if father:
        c.drawString(gxt(95), gyt(272), _pdf_safe_text(father))
        c.drawString(gxt(95), gyt(296), _pdf_safe_text(job.location))
    else:
        c.drawString(gxt(95), gyt(272), _pdf_safe_text(job.location))

    # Dynamic Candidate Photo
    photo_x = gxt(416)
    photo_y = gyt(486)
    photo_w = gxt(598-416)
    photo_h = gyt(238)-gyt(486)

    photo_drawn = False
    if application.photo:
        try:
            reader = ImageReader(application.photo.path)
            c.drawImage(reader, photo_x + 2, photo_y + 2, photo_w - 4, photo_h - 4, preserveAspectRatio=True, anchor="c")
            photo_drawn = True
        except Exception:
            logger.exception("Failed to draw applicant photo in Nimnuk Patra")

    if not photo_drawn:
        c.setStrokeColor(colors.grey)
        c.setLineWidth(1)
        c.rect(photo_x, photo_y, photo_w, photo_h, stroke=1, fill=0)
        c.setFont(_FONT_LATIN, 9)
        c.setFillColor(colors.grey)
        c.drawCentredString(photo_x + photo_w/2, photo_y + photo_h/2, "PHOTO")

    # Draw stamp overlay on top of photo
    stamp_path = _template_asset_path("id_card_stamp.png")
    c.drawImage(stamp_path, gxt(512), gyt(500), gxt(100), gyt(400)-gyt(500), mask="auto")

    # Designation in body text
    c.setFillColor(colors.black)
    c.setFont(guj_bold, 13)
    c.drawString(gxt(700), gyt(570), _pdf_safe_text(job.title))

    # Signatory details
    c.setFont(guj_bold, 12)
    c.drawString(gxt(665), gyt(860), "જપનકુમાર અજયભાઈ શાહ")
    c.setFont(guj, 11)
    c.drawString(gxt(665), gyt(882), "તંત્રીશ્રી, કાનમ એક્સપ્રેસ")

    c.showPage()
    c.save()
    return buffer.getvalue()


# ---------------------------------------------------------------------------
# PDF: Professional ID Card (Front + Back, landscape A4)
# ---------------------------------------------------------------------------

def _build_id_card_pdf(application: JobApplication, job: JobPosting) -> bytes:
    """
    Generate a landscape A4 PDF containing the Press ID Card front (left)
    and back (right), matching the official templates exactly.
    """
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=landscape(A4))
    W, H = landscape(A4)

    card_h = 460
    card_w = 328.9
    y_pdf = (H - card_h) / 2

    x_front = 72.0
    x_back = x_front + card_w + 40

    front_bg = _template_asset_path("id_card_front.png")
    c.drawImage(front_bg, x_front, y_pdf, card_w, card_h)

    back_bg = _template_asset_path("id_card_back.png")
    c.drawImage(back_bg, x_back, y_pdf, card_w, card_h)

    # Coordinate mapping from grid size (512 x 716) to cards on A4
    def f_xt(x):
        return x_front + (x * (card_w / 512))
    def f_yt(y):
        return y_pdf + card_h - (y * (card_h / 716))

    def b_xt(x):
        return x_back + (x * (card_w / 512))
    def b_yt(y):
        return y_pdf + card_h - (y * (card_h / 716))

    # ════════════════════════════════════════════════════════════════════════
    # FRONT CARD OVERLAYS
    # ════════════════════════════════════════════════════════════════════════
    c.setFillColor(colors.white)
    # 1. Cover bottom details (x = 30 to 482, y = 570 to 670)
    c.rect(f_xt(30), f_yt(670), f_xt(482-30) - x_front, f_yt(570)-f_yt(670), fill=1, stroke=0)
    # 2. Cover photo placeholder (x = 156 to 312, y = 360 to 558)
    c.rect(f_xt(156), f_yt(558), f_xt(312-156) - x_front, f_yt(360)-f_yt(558), fill=1, stroke=0)

    # Name
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 12)
    name_str = _latin_safe(application.full_name).upper()
    if len(name_str) > 28:
        name_str = name_str[:27] + "."
    c.drawCentredString(f_xt(256), f_yt(602), name_str)

    # Designation
    c.setFont("Helvetica-Bold", 9)
    c.drawCentredString(f_xt(256), f_yt(624), _latin_safe(job.title).upper())

    # Phone
    c.setFont("Helvetica", 9)
    c.drawCentredString(f_xt(256), f_yt(646), f"M. {_latin_safe(application.phone)}")

    # Press Serial No
    press_id = application.employee_press_id or _generate_press_id(application.id)
    c.setFont("Helvetica-Bold", 9.5)
    c.setFillColor(colors.HexColor("#1a3c8b"))
    c.drawCentredString(f_xt(256), f_yt(668), f"KE Sr No. {press_id}")

    # Candidate Photo
    px = f_xt(156)
    py = f_yt(558)
    pw = f_xt(312) - px
    ph = f_yt(360) - py

    photo_drawn = False
    if application.photo:
        try:
            reader = ImageReader(application.photo.path)
            c.drawImage(reader, px + 2, py + 2, pw - 4, ph - 4, preserveAspectRatio=True, anchor="c")
            photo_drawn = True
        except Exception:
            logger.exception("Failed to draw applicant photo in ID Card")

    if not photo_drawn:
        c.setStrokeColor(colors.grey)
        c.setLineWidth(1)
        c.rect(px, py, pw, ph, stroke=1, fill=0)
        c.setFont("Helvetica", 7)
        c.setFillColor(colors.grey)
        c.drawCentredString(px + pw/2, py + ph/2, "PHOTO")

    # ════════════════════════════════════════════════════════════════════════
    # BACK CARD OVERLAYS
    # ════════════════════════════════════════════════════════════════════════
    c.setFillColor(colors.white)
    # Cover values to the right of labels (x = 195 to 500, y = 90 to 270)
    c.rect(b_xt(195), b_yt(270), b_xt(500-195) - x_back, b_yt(90)-b_yt(270), fill=1, stroke=0)

    # Compute validity
    if application.joining_date:
        validity = application.joining_date.replace(year=application.joining_date.year + 1).strftime("%d/%m/%Y")
    else:
        validity = f"31/12/{timezone.now().year + 1}"

    c.showPage()
    c.save()
    return buffer.getvalue()


# ---------------------------------------------------------------------------
# Email builder
# ---------------------------------------------------------------------------

def _send_acceptance_email_documents(application_id: int) -> None:
    """
    Build Nimnuk Patra + ID Card PDFs, then send a professional HTML
    approval email with both documents attached. Runs in a background thread.
    """
    try:
        application = JobApplication.objects.select_related("job_posting").get(pk=application_id)
        job = application.job_posting

        # ── Build salary string ───────────────────────────────────────────────
        if job.salary_range_min and job.salary_range_max:
            salary_str = f"₹{job.salary_range_min:,.0f} – ₹{job.salary_range_max:,.0f} / month"
        elif job.salary_range_min:
            salary_str = f"₹{job.salary_range_min:,.0f} / month"
        else:
            salary_str = None

        joining_str = None
        if application.joining_date:
            joining_str = application.joining_date.strftime("%d %B %Y")

        # ── HTML email via template ───────────────────────────────────────────
        context = {
            "full_name":  application.full_name,
            "job_title":  job.title,
            "department": job.get_category_display(),
            "job_type":   job.get_job_type_display(),
            "location":   job.location,
            "salary":     salary_str,
            "joining_date": joining_str,
            "press_id":   application.employee_press_id,
            "admin_notes": application.admin_notes,
        }
        html_body = render_to_string("careers/email/approval_email.html", context)
        plain_body = (
            f"Dear {application.full_name},\n\n"
            f"Congratulations! You have been selected for {job.title} at Kanam Express.\n\n"
            f"Position   : {job.title}\n"
            f"Department : {job.get_category_display()}\n"
            f"Location   : {job.location}\n"
            f"Job Type   : {job.get_job_type_display()}\n"
        )
        if salary_str:
            plain_body += f"Salary     : {salary_str}\n"
        if joining_str:
            plain_body += f"Joining    : {joining_str}\n"
        plain_body += (
            "\nPlease find your Appointment Letter and Press ID Card attached.\n\n"
            "Welcome to the team!\n\n"
            "Best Regards,\nKanam Express Team\nkanamexpress.com"
        )

        # ── Generate PDFs ─────────────────────────────────────────────────────
        nimnuk_pdf  = _build_nimnuk_patra_pdf(application, job)
        id_card_pdf = _build_id_card_pdf(application, job)
        safe_name   = slugify(application.full_name) or f"candidate_{application.id}"
        letter_filename  = f"nimnuk_patra_{safe_name}.pdf"
        id_card_filename = f"press_id_card_{safe_name}.pdf"

        # ── Send email with attachments ───────────────────────────────────────
        subject = f"Congratulations! Appointment – {job.title} | Kanam Express"
        email_sent, email_error = send_mail_logged_with_error(
            subject=subject,
            message=plain_body,
            html_message=html_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[application.email],
            binary_attachments=[
                (letter_filename,  nimnuk_pdf,  "application/pdf"),
                (id_card_filename, id_card_pdf, "application/pdf"),
            ],
        )
        if not email_sent:
            # Retry without attachments so at least the email arrives
            send_mail_logged_with_error(
                subject=subject,
                message=plain_body,
                html_message=html_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[application.email],
            )
            logger.warning(
                "Acceptance email with attachments failed (application_id=%s): %s",
                application.id, email_error
            )
    except Exception:
        logger.exception(
            "Background acceptance email send failed for application_id=%s", application_id
        )


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

            father_name = request.data.get('father_name')
            if father_name is not None:
                application.father_name = father_name

            joining_date = request.data.get('joining_date')
            if joining_date:
                from datetime import datetime
                try:
                    if isinstance(joining_date, str):
                        application.joining_date = datetime.strptime(joining_date, "%Y-%m-%d").date()
                except ValueError:
                    pass

            admin_notes = request.data.get('admin_notes')
            if admin_notes is not None:
                application.admin_notes = admin_notes

            if new_status == "ACCEPTED" and not application.employee_press_id:
                press_id = _generate_press_id(application.id)
                attempts = 0
                while JobApplication.objects.filter(employee_press_id=press_id).exists() and attempts < 100:
                    attempts += 1
                    press_id = f"KE-{timezone.now().strftime('%Y')}-{(application.id + attempts):04d}"
                application.employee_press_id = press_id

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
