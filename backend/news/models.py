from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils import timezone

from utils.validators import validate_file_size, validate_image_size


class Language(models.TextChoices):
    EN = "EN", "English"
    HI = "HI", "Hindi"
    GU = "GU", "Gujarati"


class ContentStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    PUBLISHED = "PUBLISHED", "Published"
    ARCHIVED = "ARCHIVED", "Archived"


class ContentType(models.TextChoices):
    ARTICLE = "ARTICLE", "Article"
    REEL = "REEL", "Reel"
    YOUTUBE = "YOUTUBE", "YouTube"
    VIDEO = "VIDEO", "Video"


def featured_image_upload_to(instance: "NewsArticle", filename: str) -> str:
    # Use timezone.now() instead of instance.created_at because created_at is None during creation
    return f"news/featured/{timezone.now():%Y/%m}/{filename}"


def media_upload_to(instance: "Media", filename: str) -> str:
    return f"news/media/{timezone.now():%Y/%m}/{filename}"


def epaper_upload_to(instance: "EpaperEdition", filename: str) -> str:
    """
    Store uploaded e-paper PDFs under /media/epaper/YYYY/MM/<filename>.
    """
    return f"epaper/{timezone.now():%Y/%m}/{filename}"


class Section(models.Model):
    """
    Navbar sections:
    - National, International, Sports, Education, Politics, Lifestyle, Dharmadarshan
    - Gujarat (parent) -> Daxin, Utar, Saurashtra, Madhya, Gandhinagar (children)
    """

    name_en = models.CharField(max_length=120)
    name_hi = models.CharField(max_length=120, blank=True)
    name_gu = models.CharField(max_length=120, blank=True)
    slug = models.SlugField(max_length=140, unique=True)

    parent = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="children"
    )
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    # Approval workflow: Editors need admin approval
    is_approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_sections",
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["order", "name_en"]
        indexes = [
            models.Index(fields=["parent"]),
            models.Index(fields=["is_active", "order"]),
            models.Index(fields=["is_approved", "is_active"]),
        ]

    def __str__(self) -> str:
        return self.name_en


class District(models.Model):
    """
    Geographic districts (e.g. Gujarat districts) used for location-based navigation.
    """

    name_en = models.CharField(max_length=120)
    name_hi = models.CharField(max_length=120, blank=True)
    name_gu = models.CharField(max_length=120, blank=True)
    slug = models.SlugField(max_length=140, unique=True)

    section = models.ForeignKey(Section, on_delete=models.PROTECT, related_name="districts")
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "name_en"]
        indexes = [
            models.Index(fields=["section", "is_active", "order"]),
        ]

    def __str__(self) -> str:
        return self.name_en


class Category(models.Model):
    """
    Optional: use for finer grouping inside a Section (e.g. Politics -> Elections).
    """

    name_en = models.CharField(max_length=120)
    name_hi = models.CharField(max_length=120, blank=True)
    name_gu = models.CharField(max_length=120, blank=True)
    slug = models.SlugField(max_length=140, unique=True)
    is_active = models.BooleanField(default=True)

    # Approval workflow: Editors need admin approval
    is_approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_categories",
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["name_en"]
        indexes = [
            models.Index(fields=["is_active", "name_en"]),
            models.Index(fields=["is_approved", "is_active"]),
        ]

    def __str__(self) -> str:
        return self.name_en


class Tag(models.Model):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=100, unique=True)

    # Approval workflow: Editors need admin approval
    is_approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_tags",
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["name"]
        indexes = [models.Index(fields=["is_approved"])]

    def __str__(self) -> str:
        return self.name


class NewsArticle(models.Model):
    # Translated fields (store all 3; frontend language switch just chooses which to show)
    title_en = models.CharField(max_length=300)
    title_hi = models.CharField(max_length=300, blank=True)
    title_gu = models.CharField(max_length=300, blank=True)

    slug = models.SlugField(max_length=320, unique=True)

    summary_en = models.TextField(blank=True)
    summary_hi = models.TextField(blank=True)
    summary_gu = models.TextField(blank=True)

    content_en = models.TextField()
    content_hi = models.TextField(blank=True)
    content_gu = models.TextField(blank=True)

    featured_image = models.ImageField(
        upload_to=featured_image_upload_to,
        blank=True,
        null=True,
        validators=[validate_image_size],
    )

    section = models.ForeignKey(Section, on_delete=models.PROTECT, related_name="news")
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="news"
    )
    district = models.ForeignKey(
        District, on_delete=models.SET_NULL, null=True, blank=True, related_name="news"
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="news")

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="articles"
    )

    status = models.CharField(max_length=12, choices=ContentStatus.choices, default=ContentStatus.DRAFT)
    content_type = models.CharField(max_length=12, choices=ContentType.choices, default=ContentType.ARTICLE)
    primary_language = models.CharField(max_length=2, choices=Language.choices, default=Language.GU)

    is_breaking = models.BooleanField(default=False)
    is_top = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)

    view_count = models.PositiveIntegerField(default=0)
    likes_count = models.PositiveIntegerField(default=0)

    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]
        indexes = [
            models.Index(fields=["status", "published_at"]),
            models.Index(fields=["is_breaking", "status", "published_at"]),
            models.Index(fields=["is_top", "status", "published_at"]),
            models.Index(fields=["section", "status", "published_at"]),
            models.Index(fields=["category", "status", "published_at"]),
            models.Index(fields=["district", "status", "published_at"]),
        ]

    def publish(self) -> None:
        self.status = ContentStatus.PUBLISHED
        if not self.published_at:
            self.published_at = timezone.now()

    def __str__(self) -> str:
        return self.title_en


class EpaperEdition(models.Model):
    """
    Single-file e-paper edition (typically one PDF per publication date).
    Editors/Super Admins can upload; public users can download.
    """

    publication_date = models.DateField(unique=True)
    title = models.CharField(max_length=200)
    pdf_file = models.FileField(
        upload_to=epaper_upload_to,
        validators=[validate_file_size],
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-publication_date", "-created_at"]
        indexes = [
            models.Index(fields=["publication_date"]),
        ]

    def __str__(self) -> str:
        return f"{self.title} ({self.publication_date:%Y-%m-%d})"


class MediaType(models.TextChoices):
    IMAGE = "IMAGE", "Image"
    VIDEO = "VIDEO", "Video"
    REEL = "REEL", "Reel"
    YOUTUBE = "YOUTUBE", "YouTube"


class Media(models.Model):
    """
    Supports:
    - Uploaded videos/reels (file)
    - YouTube embed (youtube_url)
    - Images
    """

    article = models.ForeignKey(NewsArticle, on_delete=models.CASCADE, related_name="media")
    media_type = models.CharField(max_length=10, choices=MediaType.choices)

    file = models.FileField(
        upload_to=media_upload_to,
        blank=True,
        null=True,
        # No file size limit for videos/reels - they can be large
    )
    image = models.ImageField(
        upload_to=media_upload_to,
        blank=True,
        null=True,
        validators=[validate_image_size],
    )
    youtube_url = models.URLField(blank=True)

    thumbnail = models.ImageField(
        upload_to=media_upload_to,
        blank=True,
        null=True,
        validators=[validate_image_size],
    )
    caption = models.CharField(max_length=300, blank=True)
    order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "id"]
        indexes = [models.Index(fields=["article", "media_type", "order"])]

    def __str__(self) -> str:
        return f"{self.media_type} for {self.article_id}"


class BaseClip(models.Model):
    """
    Base model for standalone video/reel content that is not tied to a full NewsArticle.
    This lets you manage dedicated video/reel sections with their own tables.
    """

    title_en = models.CharField(max_length=300)
    title_hi = models.CharField(max_length=300, blank=True)
    title_gu = models.CharField(max_length=300, blank=True)

    slug = models.SlugField(max_length=320, unique=True)

    description_en = models.TextField(blank=True)
    description_hi = models.TextField(blank=True)
    description_gu = models.TextField(blank=True)

    section = models.ForeignKey(Section, on_delete=models.PROTECT, related_name="%(class)s_items")
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)s_items",
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="%(class)s_items")

    thumbnail = models.ImageField(
        upload_to=media_upload_to,
        blank=True,
        null=True,
        validators=[validate_image_size],
    )
    file = models.FileField(
        upload_to=media_upload_to,
        blank=True,
        null=True,
        # No file size limit for videos/reels - they can be large
    )
    youtube_url = models.URLField(blank=True)

    primary_language = models.CharField(max_length=2, choices=Language.choices, default=Language.GU)
    status = models.CharField(max_length=12, choices=ContentStatus.choices, default=ContentStatus.DRAFT)

    view_count = models.PositiveIntegerField(default=0)
    likes_count = models.PositiveIntegerField(default=0)

    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def publish(self) -> None:
        self.status = ContentStatus.PUBLISHED
        if not self.published_at:
            self.published_at = timezone.now()

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return self.title_en


class VideoContent(BaseClip):
    """
    Dedicated table for video content (non-reel).
    """

    class Meta:
        ordering = ["-published_at", "-created_at"]
        indexes = [
            models.Index(fields=["status", "published_at"]),
            models.Index(fields=["section", "status", "published_at"]),
            models.Index(fields=["category", "status", "published_at"]),
        ]


class ReelContent(BaseClip):
    """
    Dedicated table for reel-style short videos.
    """

    class Meta:
        ordering = ["-published_at", "-created_at"]
        indexes = [
            models.Index(fields=["status", "published_at"]),
            models.Index(fields=["section", "status", "published_at"]),
            models.Index(fields=["category", "status", "published_at"]),
        ]


class Like(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="likes")
    article = models.ForeignKey(NewsArticle, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "article"], name="unique_like_per_user_article")
        ]
        indexes = [models.Index(fields=["article", "created_at"])]

    def __str__(self) -> str:
        return f"Like({self.user_id}, {self.article_id})"


class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="comments")
    article = models.ForeignKey(NewsArticle, on_delete=models.CASCADE, related_name="comments")
    parent = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, related_name="replies")
    content = models.TextField()
    is_approved = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["article", "created_at"]),
            models.Index(fields=["parent"]),
            models.Index(fields=["is_approved"]),
        ]

    def __str__(self) -> str:
        return f"Comment({self.article_id})"
