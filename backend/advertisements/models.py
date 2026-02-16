from __future__ import annotations

from django.db import models
from django.utils import timezone

from utils.validators import validate_file_size, validate_image_size


def ad_asset_upload_to(instance: "Advertisement", filename: str) -> str:
    return f"ads/assets/{timezone.now():%Y/%m}/{filename}"


class AdPlacement(models.TextChoices):
    TOP = "TOP", "Top"
    SIDEBAR_LEFT = "SIDEBAR_LEFT", "Sidebar Left"
    SIDEBAR_RIGHT = "SIDEBAR_RIGHT", "Sidebar Right"
    IN_ARTICLE = "IN_ARTICLE", "In Article"
    FOOTER = "FOOTER", "Footer"
    POPUP = "POPUP", "Popup"


class AdType(models.TextChoices):
    IMAGE = "IMAGE", "Image"
    VIDEO = "VIDEO", "Video"
    HTML = "HTML", "HTML Snippet"


class AdStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    ACTIVE = "ACTIVE", "Active"
    PAUSED = "PAUSED", "Paused"
    ENDED = "ENDED", "Ended"


class GoogleAdSenseSlot(models.Model):
    """
    Store AdSense slot metadata so frontend can render ad blocks by placement.
    """

    name = models.CharField(max_length=120, unique=True)
    placement = models.CharField(max_length=20, choices=AdPlacement.choices)

    client_id = models.CharField(max_length=64, blank=True)  # e.g. ca-pub-xxxx
    slot_id = models.CharField(max_length=64, blank=True)
    format = models.CharField(max_length=64, blank=True)  # e.g. auto, rectangle, etc.
    responsive = models.BooleanField(default=True)

    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["placement", "order", "name"]
        indexes = [models.Index(fields=["placement", "is_active", "order"])]

    def __str__(self) -> str:
        return f"{self.name} ({self.placement})"


class AdvertisementQuerySet(models.QuerySet):
    def currently_active(self, now: timezone.datetime | None = None):
        """
        Return ads that are currently eligible to be shown.

        Mirrors the logic used by the API:
        - is_active=True
        - status=AdStatus.ACTIVE
        - start_at <= now (if set)
        - end_at >= now (if set)
        """
        if now is None:
            now = timezone.now()
        return self.filter(
            is_active=True,
            status=AdStatus.ACTIVE,
        ).filter(
            models.Q(start_at__isnull=True) | models.Q(start_at__lte=now),
            models.Q(end_at__isnull=True) | models.Q(end_at__gte=now),
        )


class Advertisement(models.Model):
    title = models.CharField(max_length=200)
    placement = models.CharField(max_length=20, choices=AdPlacement.choices)
    ad_type = models.CharField(max_length=10, choices=AdType.choices, default=AdType.IMAGE)
    status = models.CharField(max_length=10, choices=AdStatus.choices, default=AdStatus.DRAFT)

    image = models.ImageField(
        upload_to=ad_asset_upload_to,
        blank=True,
        null=True,
        validators=[validate_image_size],
    )
    video = models.FileField(
        upload_to=ad_asset_upload_to,
        blank=True,
        null=True,
        validators=[validate_file_size],
    )
    # Trusted HTML snippet used for ad embeds. This is intentionally only editable by
    # authenticated staff users via the admin / ads API and is not sanitized by the
    # backend. If you ever allow non-staff to submit HTML, you must sanitize it first.
    html_snippet = models.TextField(blank=True)

    link_url = models.URLField(blank=True)

    advertiser_name = models.CharField(max_length=200, blank=True)
    advertiser_email = models.EmailField(blank=True)
    advertiser_phone = models.CharField(max_length=30, blank=True)

    start_at = models.DateTimeField(null=True, blank=True)
    end_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    impression_count = models.PositiveIntegerField(default=0)
    click_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = AdvertisementQuerySet.as_manager()

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["placement", "is_active", "status"]),
            models.Index(fields=["start_at", "end_at"]),
        ]

    def __str__(self) -> str:
        return self.title

    def is_currently_active(self, now: timezone.datetime | None = None) -> bool:
        """
        Return True if this ad should be considered "active" for display right now.

        This is the per-instance mirror of AdvertisementQuerySet.currently_active().
        """
        if not self.is_active or self.status != AdStatus.ACTIVE:
            return False
        if now is None:
            now = timezone.now()
        if self.start_at and self.start_at > now:
            return False
        if self.end_at and self.end_at < now:
            return False
        return True


class RequestStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    APPROVED = "APPROVED", "Approved"
    REJECTED = "REJECTED", "Rejected"


class AdvertisementRequestQuerySet(models.QuerySet):
    def pending(self):
        """Shortcut for pending ad requests."""
        return self.filter(status=RequestStatus.PENDING)


class AdvertisementRequest(models.Model):
    advertiser_name = models.CharField(max_length=200)
    advertiser_email = models.EmailField()
    advertiser_phone = models.CharField(max_length=30, blank=True)
    company_name = models.CharField(max_length=200, blank=True)

    placement = models.CharField(max_length=20, choices=AdPlacement.choices)
    ad_type = models.CharField(max_length=10, choices=AdType.choices, default=AdType.IMAGE)
    budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    message = models.TextField(blank=True)

    status = models.CharField(max_length=10, choices=RequestStatus.choices, default=RequestStatus.PENDING)
    admin_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = AdvertisementRequestQuerySet.as_manager()

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["status", "created_at"])]

    def __str__(self) -> str:
        return f"{self.advertiser_name} ({self.status})"
