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
    """Upload e-paper PDFs to epaper/YYYY/MM/ directory"""
    return f"epaper/{timezone.now():%Y/%m}/{filename}"


def section_image_upload_to(instance: "Section", filename: str) -> str:
    return f"sections/{timezone.now():%Y/%m}/{filename}"


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
    image = models.ImageField(
        upload_to=section_image_upload_to,
        null=True,
        blank=True,
        validators=[validate_file_size, validate_image_size]
    )

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
    # Editor-curated flag for articles that should appear in "Trending" sections
    is_trending = models.BooleanField(default=False)
    # Editor-curated flag for articles that should appear in "Editor's Pick" section
    is_editor_pick = models.BooleanField(default=False)

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
            models.Index(fields=["is_editor_pick", "status", "published_at"]),
            models.Index(fields=["section", "status", "published_at"]),
            models.Index(fields=["category", "status", "published_at"]),
            models.Index(fields=["district", "status", "published_at"]),
        ]

    def publish(self) -> None:
        self.status = ContentStatus.PUBLISHED
        if not self.published_at:
            self.published_at = timezone.now()

    def save(self, *args, **kwargs):
        # Auto-compress featured_image to an optimized JPEG on new upload
        if self.featured_image and not getattr(self.featured_image, '_committed', True):
            try:
                from io import BytesIO
                import sys
                from PIL import Image
                from django.core.files.uploadedfile import InMemoryUploadedFile

                img = Image.open(self.featured_image)
                # Convert to RGB (removes alpha channel from PNG, prevents errors in JPEG format)
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Resize if it's too large (WhatsApp prefers 1200x630 max anyway)
                img.thumbnail((1200, 1200), Image.Resampling.LANCZOS)

                output = BytesIO()
                img.save(output, format='JPEG', quality=85)
                output.seek(0)

                # Change file extension to .jpg
                filename = self.featured_image.name
                if '.' in filename:
                    filename = filename.rsplit('.', 1)[0] + '.jpg'
                else:
                    filename += '.jpg'

                self.featured_image = InMemoryUploadedFile(
                    output,
                    'ImageField',
                    filename,
                    'image/jpeg',
                    sys.getsizeof(output),
                    None
                )
            except Exception:
                # If Pillow fails (e.g., unsupported format like HEIC without pillow-heif),
                # just pass and save S3/Disk the original file as a fallback.
                pass
                
        # Auto-generate unique slug if not provided or title changed significantly
        if not self.slug:
            from django.utils.text import slugify
            import uuid
            
            # Try to use English title first, then others
            base_slug_text = self.title_en or self.title_gu or self.title_hi
            
            import re
            # Only keep alphanumeric characters (including unicode) and spaces/hyphens
            cleaned_text = re.sub(r'[^\w\s-]', '', base_slug_text).strip()
            # Replace spaces with hyphens
            base_slug = re.sub(r'[-\s]+', '-', cleaned_text).lower()
            
            if not base_slug or base_slug == '-':
                base_slug = "article"
                
            unique_slug = base_slug
            # Keep appending random strings until unique
            while NewsArticle.objects.filter(slug=unique_slug).exclude(pk=self.pk).exists():
                unique_slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"
                
            self.slug = unique_slug

        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.title_en


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
    
    is_live = models.BooleanField(default=False)

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
            models.Index(fields=["is_live", "status", "published_at"]),
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
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="likes", null=True, blank=True)
    article = models.ForeignKey(NewsArticle, on_delete=models.CASCADE, related_name="likes")
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    session_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Note: Database-level unique constraint removed because 'user' can be null.
        # We will handle uniqueness check in the view layer for anonymous sessions.
        indexes = [models.Index(fields=["article", "created_at"]), models.Index(fields=["session_id"])]

    def __str__(self) -> str:
        return f"Like({self.user_id}, {self.article_id})"


class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="comments")
    guest_name = models.CharField(max_length=100, blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    session_id = models.CharField(max_length=255, blank=True, null=True)
    
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


class EpaperEdition(models.Model):
    """
    E-paper edition model for uploading and displaying PDF files.
    """
    publication_date = models.DateField()
    title = models.CharField(max_length=300, blank=True)
    pdf_file = models.FileField(
        upload_to=epaper_upload_to,
        help_text="Upload PDF file for the e-paper edition"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-publication_date", "-created_at"]
        indexes = [
            models.Index(fields=["publication_date"]),
        ]
        verbose_name = "E-paper Edition"
        verbose_name_plural = "E-paper Editions"

    def __str__(self) -> str:
        if self.title:
            return f"{self.title} - {self.publication_date}"
        return f"Kanam Express ePaper - {self.publication_date}"

    def save(self, *args, **kwargs):
        # Auto-generate title if not provided
        if not self.title:
            self.title = f"Kanam Express ePaper - {self.publication_date.strftime('%d-%m-%Y')}"
        super().save(*args, **kwargs)


class VideoLike(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="video_likes", null=True, blank=True)
    video = models.ForeignKey(VideoContent, on_delete=models.CASCADE, related_name="likes")
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    session_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["video", "created_at"]), models.Index(fields=["session_id"])]

    def __str__(self) -> str:
        return f"VideoLike({self.user_id}, {self.video_id})"


class ReelLike(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reel_likes", null=True, blank=True)
    reel = models.ForeignKey(ReelContent, on_delete=models.CASCADE, related_name="likes")
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    session_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["reel", "created_at"]), models.Index(fields=["session_id"])]

    def __str__(self) -> str:
        return f"ReelLike({self.user_id}, {self.reel_id})"


class VideoComment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="video_comments")
    guest_name = models.CharField(max_length=100, blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    session_id = models.CharField(max_length=255, blank=True, null=True)
    
    video = models.ForeignKey(VideoContent, on_delete=models.CASCADE, related_name="comments")
    parent = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, related_name="replies")
    content = models.TextField()
    is_approved = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["video", "created_at"]),
            models.Index(fields=["parent"]),
            models.Index(fields=["is_approved"]),
        ]

    def __str__(self) -> str:
        return f"VideoComment({self.video_id})"


class ReelComment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="reel_comments")
    guest_name = models.CharField(max_length=100, blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    session_id = models.CharField(max_length=255, blank=True, null=True)
    
    reel = models.ForeignKey(ReelContent, on_delete=models.CASCADE, related_name="comments")
    parent = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, related_name="replies")
    content = models.TextField()
    is_approved = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["reel", "created_at"]),
            models.Index(fields=["parent"]),
            models.Index(fields=["is_approved"]),
        ]

    def __str__(self) -> str:
        return f"ReelComment({self.reel_id})"


class Poll(models.Model):
    article = models.OneToOneField(NewsArticle, on_delete=models.CASCADE, related_name="poll")
    question = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Poll for {self.article_id}: {self.question}"


class PollOption(models.Model):
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name="options")
    text = models.CharField(max_length=255)
    votes = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["id"]

    def __str__(self) -> str:
        return f"Option: {self.text} ({self.votes} votes)"


class PushSubscription(models.Model):
    """
    Stores browser push subscriptions for Web Push notifications.
    """

    endpoint = models.URLField(unique=True)
    p256dh = models.TextField()
    auth = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["is_active", "-created_at"]),
        ]

    def __str__(self) -> str:
        return f"PushSubscription({self.endpoint[:60]})"
