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
    Layout mirrors the reference: header stripe, red title banner, candidate info
    top-left, photo top-right, Gujarati body paragraph, signature block.
    """
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    W, H = A4

    # ── Background template (optional) ──────────────────────────────────────
    template_used = _draw_background_if_exists(
        c, _template_asset_path("nimnuk_patra_bg.png"), 0, 0, W, H
    )

    guj = _guj_font(bold=False)
    guj_bold = _guj_font(bold=True)

    if not template_used:
        # Light watermark stripe at bottom
        c.saveState()
        c.setFillColor(colors.HexColor("#f8f8f8"))
        c.rect(0, 0, W, H, fill=1, stroke=0)
        # Top header bar (very thin red line at top)
        c.setFillColor(colors.HexColor("#c0161c"))
        c.rect(0, H - 6, W, 6, fill=1, stroke=0)
        # Gold bottom line
        c.setFillColor(colors.HexColor("#D4AF37"))
        c.rect(0, 0, W, 4, fill=1, stroke=0)
        c.restoreState()

    # ── Ref No / Date row ───────────────────────────────────────────────────
    today_str = timezone.now().strftime("%d-%m-%Y")
    press_id = application.employee_press_id or _generate_press_id(application.id)
    c.setFillColor(colors.black)
    c.setFont(_FONT_LATIN, 10)
    c.drawString(45, H - 35, f"Ref. No: {press_id}")
    c.drawRightString(W - 45, H - 35, f"DATE: {today_str}")

    # ── Red title banner ─────────────────────────────────────────────────────
    banner_y = H - 100
    banner_h = 38
    banner_w = 220
    banner_x = (W - banner_w) / 2
    c.setFillColor(colors.HexColor("#c0161c"))
    c.roundRect(banner_x, banner_y, banner_w, banner_h, 6, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont(guj_bold, 22)
    c.drawCentredString(W / 2, banner_y + 10, "\u0AA8\u0ABF\u0AAE\u0AA3\u0AC2\u0A82\u0A95 \u0AAA\u0AA4\u0ACD\u0AB0")

    # ── Candidate info (left) ────────────────────────────────────────────────
    info_top = H - 150
    c.setFillColor(colors.black)
    c.setFont(guj, 13)
    c.drawString(45, info_top,       "\u0AAA\u0ACD\u0AB0\u0AA4\u0ABF\u0AB6\u0ACD\u0AB0\u0AC0,")
    c.setFont(guj_bold, 13)
    c.drawString(45, info_top - 20,  _pdf_safe_text(application.full_name))
    c.setFont(guj, 12)
    # Address lines (use latin fallback for safety)
    addr_lines = []
    if getattr(application, "father_name", None):
        c.setFont(guj, 12)
        c.drawString(45, info_top - 40, _pdf_safe_text(application.father_name))
        offset = 60
    else:
        offset = 40
    c.setFont(_FONT_LATIN, 11)
    c.drawString(45, info_top - offset - 2, _latin_safe(job.location) + ".")

    # ── Photo (right) ────────────────────────────────────────────────────────
    photo_w, photo_h = 130, 155
    photo_x = W - 45 - photo_w
    photo_y = H - 150 - photo_h + 20
    _draw_photo(c, application, photo_x, photo_y, photo_w, photo_h,
                border_color=colors.HexColor("#555555"))

    # Stamp circle overlay on photo (decorative)
    c.saveState()
    c.setStrokeColor(colors.HexColor("#1a3c7a"))
    c.setFillColor(colors.transparent)
    c.setLineWidth(1.2)
    stamp_cx = photo_x + photo_w - 28
    stamp_cy = photo_y + 30
    c.circle(stamp_cx, stamp_cy, 22, stroke=1, fill=0)
    c.setFont(_FONT_LATIN, 5)
    c.setFillColor(colors.HexColor("#1a3c7a"))
    c.drawCentredString(stamp_cx, stamp_cy + 5, "KANAM EXPRESS")
    c.drawCentredString(stamp_cx, stamp_cy - 2, "EDITOR")
    c.restoreState()

    # ── Divider line ─────────────────────────────────────────────────────────
    divider_y = H - 330
    c.setStrokeColor(colors.HexColor("#dddddd"))
    c.setLineWidth(0.5)
    c.line(45, divider_y, W - 45, divider_y)

    # ── Body paragraph (Gujarati) ─────────────────────────────────────────────
    body_top = divider_y - 22
    c.setFont(guj, 13)
    c.setFillColor(colors.black)

    # Build dynamic Gujarati paragraph
    # We use the position from job.title (latin) embedded inside Gujarati sentence
    position_gu = _pdf_safe_text(job.title)
    city_gu = _latin_safe(job.location)

    para_lines = [
        "\u0AB8\u0AB5\u0ABF\u0AA8\u0AAF \u0AB8\u0AB9 \u0A9C\u0AA3\u0ABE\u0AB5\u0AB5\u0ABE\u0AA8\u0AC1\u0A82 \u0A95\u0AC7 \u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AAE\u0ABE\u0A82 \u0A85\u0A97\u0ACD\u0AB0\u0AC7\u0AB8\u0AB0 \u0A9A\u0ABE\u0AB2\u0AA4\u0AC0 \u0AA8\u0ACD\u0AAF\u0AC2\u0A9D \u0A9A\u0AC7\u0AA8\u0AB2",
        "'\u0A95\u0ABE\u0AA8\u0AAE \u0A8F\u0A95\u0ACD\u0AB8\u0AAA\u0ACD\u0AB0\u0AC7\u0AB8' \u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0 24X7 \u0A95\u0AB2\u0ABE\u0A95 Live \u0A85\u0AA8\u0AC7 \u0A95\u0ABE\u0AA8\u0AAE \u0A8F\u0A95\u0ACD\u0AB8\u0AAA\u0ACD\u0AB0\u0AC7\u0AB8",
        "\u0AB8\u0ABE\u0AAA\u0ACD\u0AA4\u0ABE\u0AB9\u0ABF\u0A95 \u0A85\u0A96\u0AAC\u0ABE\u0AB0\u0AAE\u0ABE\u0A82 \u0A86\u0AAA\u0AB6\u0ACD\u0AB0\u0AC0\u0AA8\u0AC7",
        f"{position_gu} \u0AA4\u0AB0\u0AC0\u0A95\u0AC7 \u0AA8\u0ABF\u0AAE\u0AA3\u0AC2\u0A82\u0A95 \u0A95\u0AB0\u0AA4\u0ABE\u0A82 \u0A85\u0AAE\u0AC7 \u0A97\u0ACE\u0AB0\u0AB5 \u0A85\u0AA8\u0AC1\u0AAD\u0AB5\u0AC0\u0A8F \u0A9B\u0AC0\u0A8F.",
        "\u0A86\u0AAA\u0AA3\u0AC0 \u0AB8\u0ABE\u0AAE\u0ABE\u0A9C\u0ABF\u0A95 \u0A85\u0AA8\u0AC7 \u0AB0\u0ABE\u0A9C\u0ACD\u0AAF \u0AA4\u0AC7\u0AAE\u0A9C \u0AA6\u0AC7\u0AB6\u0AA8\u0AC0 \u0AB8\u0AC7\u0AB5\u0ABE",
        "\u0A95\u0AB0\u0AB5\u0ABE\u0AA8\u0AC0 \u0AB2\u0ABE\u0A97\u0AA3\u0AC0 \u0A85\u0AA8\u0AC7 \u0A85\u0AA8\u0AC1\u0AAD\u0AB5\u0AA8\u0ABE \u0A86\u0AA7\u0ABE\u0AB0\u0AC7 \u0A85\u0AAE\u0ABE\u0AB0\u0ABE \u0AAE\u0AC0\u0AA1\u0ABF\u0AAF\u0ABE",
        "\u0AB9\u0ABE\u0E53\u0AB8\u0AAE\u0ABE\u0A82 \u0A95\u0AB0\u0AB5\u0ABE\u0AAE\u0ABE\u0A82 \u0A86\u0AB5\u0AC7\u0AB2 \u0AA8\u0ABF\u0AAE\u0AA3\u0AC2\u0A82\u0A95\u0AA8\u0ABE",
        "\u0AA8\u0AC0\u0AA4\u0ABF-\u0AA8\u0ABF\u0AAF\u0AAE\u0BCB, \u0AB6\u0AB0\u0AA4\u0BCB\u0AA8\u0AC7 \u0A86\u0AA7\u0AC0\u0AA8 \u0AB0\u0AB9\u0AC0 \u0AA8\u0ABF\u0AB7\u0ACD\u0AA0\u0ABE\u0AAA\u0BC2\u0AB0\u0AB5\u0A95, \u0AB5\u0AAB\u0ABE\u0AA6\u0ABE\u0AB0\u0AC0\u0AA5\u0AC0 \u0A85\u0AA8\u0AC7 \u0AB8\u0AA4\u0ACD\u0AAF\u0AA8\u0AC0 \u0AB8\u0ABE\u0AA5\u0AC7 \u0AB0\u0AB9\u0AC0\u0AA8\u0AC7 \u0AAB\u0AB0\u0A9C \u0AAC\u0A9C\u0ABE\u0AB5\u0AB6\u0BCB",
        "\u0AA4\u0AC7\u0AB5\u0AC0 \u0A86\u0AB6\u0ABE \u0AB8\u0ABE\u0AA5\u0AC7 \u0A86\u0AAA\u0AA8\u0AC7 \u0A85\u0AAD\u0ABF\u0AA8\u0A82\u0AA6\u0AA8 \u0AAA\u0ABE\u0AA0\u0AB5\u0AC1\u0A82 \u0A9B\u0AC1\u0A82.",
    ]
    line_h = 18
    cy = body_top
    for line in para_lines:
        c.drawString(45, cy, line)
        cy -= line_h

    # ── Nakkal ravana ────────────────────────────────────────────────────────
    cy -= 20
    c.setFont(guj, 12)
    c.drawString(45, cy, "\u0AA8\u0A95\u0AB2 \u0AB0\u0AB5\u0ABE\u0AA8\u0ABE :")

    # ── Signature block (right-aligned) ──────────────────────────────────────
    sig_x = W - 240
    sig_y = cy - 10
    c.setFont(guj, 13)
    c.drawString(sig_x, sig_y, "\u0A86\u0AAA\u0AA8\u0BCB \u0AB5\u0ABF\u0AB6\u0ACD\u0AB5\u0ABE\u0AB8\u0AC1,")

    # Signature placeholder line
    c.setStrokeColor(colors.black)
    c.setLineWidth(0.5)
    c.line(sig_x, sig_y - 35, sig_x + 180, sig_y - 35)

    c.setFont(guj, 12)
    c.drawString(sig_x, sig_y - 52, "\u0A9C\u0AAA\u0AA8\u0A95\u0AC1\u0AAE\u0ABE\u0AB0 \u0A85\u0A9C\u0AAF\u0AAD\u0ABE\u0A88 \u0AB6\u0ABE\u0AB9")
    c.setFont(guj, 11)
    c.drawString(sig_x, sig_y - 70, "\u0AA4\u0A82\u0AA4\u0ACD\u0AB0\u0AC0\u0AB6\u0ACD\u0AB0\u0AC0, \u0A95\u0ABE\u0AA8\u0AAE \u0A8F\u0A95\u0ACD\u0AB8\u0AAA\u0ACD\u0AB0\u0AC7\u0AB8")

    # ── Bottom decorative triangle ───────────────────────────────────────────
    c.setFillColor(colors.HexColor("#c0161c"))
    p = c.beginPath()
    p.moveTo(0, 0)
    p.lineTo(0, 40)
    p.lineTo(40, 0)
    p.close()
    c.drawPath(p, fill=1, stroke=0)

    c.showPage()
    c.save()
    return buffer.getvalue()


# ---------------------------------------------------------------------------
# PDF: Professional ID Card (Front + Back, landscape A4)
# ---------------------------------------------------------------------------

def _build_id_card_pdf(application: JobApplication, job: JobPosting) -> bytes:
    """
    Generate a landscape A4 PDF containing the Press ID Card front (left)
    and back (right), closely matching the Kanam Express reference design.
    """
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=landscape(A4))
    W, H = landscape(A4)

    GOLD = colors.HexColor("#D4AF37")
    RED  = colors.HexColor("#c0161c")
    DARK = colors.HexColor("#1a1a2e")
    ORANGE = colors.HexColor("#E05C00")
    BLUE   = colors.HexColor("#1a3c8b")
    LIGHT_GOLD = colors.HexColor("#FFF3CD")

    margin = 28
    gap    = 16
    card_w = (W - 2 * margin - gap) / 2
    card_h = H - 2 * margin
    lx = margin               # front card left-x
    rx = margin + card_w + gap  # back card left-x
    cy = margin               # bottom y of cards

    # ── Try template backgrounds first ──────────────────────────────────────
    front_bg = _draw_background_if_exists(c, _template_asset_path("id_card_front_bg.png"), lx, cy, card_w, card_h)
    back_bg  = _draw_background_if_exists(c, _template_asset_path("id_card_back_bg.png"),  rx, cy, card_w, card_h)

    guj      = _guj_font(bold=False)
    guj_bold = _guj_font(bold=True)

    press_id = application.employee_press_id or _generate_press_id(application.id)

    # Compute validity (end of current year or joining_date + 1 year)
    if application.joining_date:
        validity = application.joining_date.replace(year=application.joining_date.year + 1).strftime("%d/%m/%Y")
    else:
        validity = f"31/12/{timezone.now().year + 1}"

    # ════════════════════════════════════════════════════════════════════════
    # FRONT CARD
    # ════════════════════════════════════════════════════════════════════════
    if not front_bg:
        # Card border & background
        c.setFillColor(colors.white)
        c.setStrokeColor(GOLD)
        c.setLineWidth(2.5)
        c.roundRect(lx, cy, card_w, card_h, 8, fill=1, stroke=1)

        # ── Gold corner accent triangles ──────────────────────────────────
        # Top-left
        c.setFillColor(GOLD)
        p = c.beginPath(); p.moveTo(lx, cy+card_h); p.lineTo(lx+50, cy+card_h); p.lineTo(lx, cy+card_h-50); p.close()
        c.drawPath(p, fill=1, stroke=0)
        # Top-right
        p = c.beginPath(); p.moveTo(lx+card_w, cy+card_h); p.lineTo(lx+card_w-50, cy+card_h); p.lineTo(lx+card_w, cy+card_h-50); p.close()
        c.drawPath(p, fill=1, stroke=0)
        # Bottom-right
        p = c.beginPath(); p.moveTo(lx+card_w, cy); p.lineTo(lx+card_w-50, cy); p.lineTo(lx+card_w, cy+50); p.close()
        c.drawPath(p, fill=1, stroke=0)
        # Bottom-left
        p = c.beginPath(); p.moveTo(lx, cy); p.lineTo(lx+50, cy); p.lineTo(lx, cy+50); p.close()
        c.drawPath(p, fill=1, stroke=0)

        # ── Red header band ────────────────────────────────────────────────
        header_h = 60
        header_y = cy + card_h - header_h
        c.setFillColor(RED)
        c.roundRect(lx + 2, header_y, card_w - 4, header_h, 6, fill=1, stroke=0)
        # Repair rounded bottom of header (make it flat at bottom)
        c.rect(lx + 2, header_y, card_w - 4, 8, fill=1, stroke=0)

        # Company name in header
        c.setFillColor(GOLD)
        c.setFont(_FONT_LATIN_BOLD, 17)
        c.drawCentredString(lx + card_w/2, header_y + 38, "KANAM EXPRESS")
        c.setFillColor(colors.white)
        c.setFont(guj_bold, 13)
        c.drawCentredString(lx + card_w/2, header_y + 18, "NEWS \u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0")

        # Gold sub-banner
        c.setFillColor(GOLD)
        c.rect(lx + 2, header_y - 20, card_w - 4, 18, fill=1, stroke=0)
        c.setFillColor(DARK)
        c.setFont(guj, 10)
        c.drawCentredString(lx + card_w/2, header_y - 14, "\u0AA8\u0ABF\u0AA1\u0AB0 \u0A85\u0AA8\u0AC7 \u0AA8\u0ABF\u0AB7\u0ACD\u0AAA\u0A95\u0ACD\u0AB7")

        # Website
        c.setFillColor(DARK)
        c.setFont(_FONT_LATIN, 9)
        c.drawCentredString(lx + card_w/2, header_y - 36, "www.kanamexpress.com")

    # ── Applicant Photo ──────────────────────────────────────────────────────
    if not front_bg:
        photo_w, photo_h = 100, 120
        photo_x = lx + (card_w - photo_w) / 2
        photo_y = cy + card_h - 60 - 20 - 20 - photo_h - 20  # below sub-banner
        _draw_photo(c, application, photo_x, photo_y, photo_w, photo_h,
                    border_color=colors.HexColor("#aaaaaa"))

        # Stamp circle on photo
        c.saveState()
        c.setStrokeColor(BLUE)
        c.setFillColor(colors.transparent)
        c.setLineWidth(1)
        scx = photo_x + photo_w - 22
        scy = photo_y + 24
        c.circle(scx, scy, 19, stroke=1, fill=0)
        c.setFont(_FONT_LATIN, 5)
        c.setFillColor(BLUE)
        c.drawCentredString(scx, scy + 5, "KANAM EXPRESS")
        c.drawCentredString(scx, scy - 2, "EDITOR")
        c.restoreState()

        # ── Name, Designation, Phone, ID ────────────────────────────────────
        name_y = photo_y - 22
        c.setFillColor(DARK)
        c.setFont(_FONT_LATIN_BOLD, 13)
        name_str = _latin_safe(application.full_name).upper()
        # Truncate if too long
        if len(name_str) > 28:
            name_str = name_str[:27] + "."
        c.drawCentredString(lx + card_w/2, name_y, name_str)

        c.setFont(_FONT_LATIN_BOLD, 10)
        c.setFillColor(colors.HexColor("#444444"))
        c.drawCentredString(lx + card_w/2, name_y - 16, _latin_safe(job.title).upper())

        c.setFont(_FONT_LATIN, 10)
        c.setFillColor(DARK)
        c.drawCentredString(lx + card_w/2, name_y - 32, f"M. {_latin_safe(application.phone)}")

        c.setFont(_FONT_LATIN_BOLD, 11)
        c.setFillColor(BLUE)
        c.drawCentredString(lx + card_w/2, name_y - 50, f"KE Sr No. {press_id}")

        # ── TV PRESS footer ──────────────────────────────────────────────────
        c.setFont(_FONT_LATIN_BOLD, 26)
        c.setFillColor(ORANGE)
        c.drawCentredString(lx + card_w/2, cy + 18, "TV PRESS")

    # ════════════════════════════════════════════════════════════════════════
    # BACK CARD
    # ════════════════════════════════════════════════════════════════════════
    if not back_bg:
        c.setFillColor(colors.white)
        c.setStrokeColor(GOLD)
        c.setLineWidth(2.5)
        c.roundRect(rx, cy, card_w, card_h, 8, fill=1, stroke=1)

        # Top-right gold accent
        c.setFillColor(GOLD)
        p = c.beginPath(); p.moveTo(rx+card_w, cy+card_h); p.lineTo(rx+card_w-60, cy+card_h); p.lineTo(rx+card_w, cy+card_h-60); p.close()
        c.drawPath(p, fill=1, stroke=0)
        # Bottom-left gold accent
        p = c.beginPath(); p.moveTo(rx, cy); p.lineTo(rx+60, cy); p.lineTo(rx, cy+60); p.close()
        c.drawPath(p, fill=1, stroke=0)

    if not back_bg:
        pad = 20
        bx  = rx + pad   # content left-x
        bw  = card_w - 2*pad
        row_y = cy + card_h - pad - 20
        line_h = 18

        def _back_label(label, value, ypos):
            c.setFont(_FONT_LATIN_BOLD, 10)
            c.setFillColor(DARK)
            c.drawString(bx, ypos, label)
            c.setFont(_FONT_LATIN, 10)
            c.setFillColor(colors.HexColor("#333333"))
            c.drawString(bx + 72, ypos, value)

        _back_label("Valid Up to  :", validity, row_y)
        row_y -= line_h

        if application.joining_date:
            _back_label("Date of Birth:", "—", row_y)  # DOB not in model; placeholder
        row_y -= line_h

        # Address
        c.setFont(_FONT_LATIN_BOLD, 10)
        c.setFillColor(DARK)
        c.drawString(bx, row_y, "Address      :")
        c.setFont(_FONT_LATIN, 10)
        c.setFillColor(colors.HexColor("#333333"))
        c.drawString(bx + 72, row_y, _latin_safe(job.location))
        row_y -= line_h * 1.8

        # Rules & Regulations
        c.setFont(_FONT_LATIN_BOLD, 10)
        c.setFillColor(DARK)
        c.drawString(bx, row_y, "Rules & Regulations :")
        row_y -= line_h * 0.9

        rules = [
            "Kanam Express News Paper and Channel will not be",
            "responsible for any criminal activity held by the card holder.",
            "Anybody who uses the card illegally is responsible for the",
            "name use. KANAM EXPRESS is not responsible for any illegal",
            "usage and misuse of the card.",
            "Loss, Misplacement or the card must immediately be",
            "reported in writing to the editor of KANAM EXPRESS.",
        ]
        c.setFont(_FONT_LATIN, 9)
        c.setFillColor(colors.HexColor("#333333"))
        for i, rule in enumerate(rules):
            prefix = "- " if i in (0, 2, 5) else "  "
            c.drawString(bx + 4, row_y, prefix + rule)
            row_y -= 13

        # Signature area
        row_y -= 10
        c.setStrokeColor(colors.HexColor("#555555"))
        c.setLineWidth(0.5)
        sig_line_x = rx + card_w - pad - 120
        c.line(sig_line_x, row_y, sig_line_x + 110, row_y)
        c.setFont(_FONT_LATIN, 9)
        c.setFillColor(colors.HexColor("#555555"))
        c.drawCentredString(sig_line_x + 55, row_y - 12, "Authorised Sign.")

        # HEAD OFFICE footer
        footer_h = 68
        c.setFillColor(DARK)
        c.rect(rx + 2, cy, card_w - 4, footer_h, fill=1, stroke=0)
        c.roundRect(rx + 2, cy, card_w - 4, footer_h, 6, fill=1, stroke=0)
        c.rect(rx + 2, cy + footer_h - 8, card_w - 4, 10, fill=1, stroke=0)

        fx = rx + pad
        fy = cy + footer_h - 14
        c.setFont(_FONT_LATIN_BOLD, 10)
        c.setFillColor(GOLD)
        c.drawString(fx, fy, "\u0026  HEAD OFFICE")
        c.setFont(_FONT_LATIN, 8)
        c.setFillColor(colors.white)
        c.drawString(fx, fy - 13, "Gokul Lala Ni Khadki, Jawahar Bazar, Jambusar,")
        c.drawString(fx, fy - 24, "Dist. Bharuch, Gujarat-392150")
        c.drawString(fx, fy - 35, "\u260E  9824749413 / 7623046498")
        c.drawString(fx, fy - 46, "\u2709  kanamexpress@gmail.com")

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
