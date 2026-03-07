from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify
from django.core.validators import FileExtensionValidator
import os

User = get_user_model()


def reel_video_upload(instance, filename):
    """Generate media file path with date-based organization"""
    from datetime import datetime
    date_path = datetime.now().strftime('%Y/%m')
    return f'reels/videos/{date_path}/{filename}'


def reel_thumbnail_upload(instance, filename):
    """Generate thumbnail file path with date-based organization"""
    from datetime import datetime
    date_path = datetime.now().strftime('%Y/%m')
    return f'reels/thumbnails/{date_path}/{filename}'


class ReelStatus(models.TextChoices):
    DRAFT = 'draft', _('Draft')
    PUBLISHED = 'published', _('Published')
    ARCHIVED = 'archived', _('Archived')


class Reel(models.Model):
    """
    Model for storing reels and short videos
    Supports multiple languages and approval workflow
    """
    
    # Multilingual Fields
    title_en = models.CharField(
        max_length=255,
        verbose_name=_('Title (English)')
    )
    title_hi = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_('Title (Hindi)')
    )
    title_gu = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_('Title (Gujarati)')
    )
    
    description_en = models.TextField(
        blank=True,
        verbose_name=_('Description (English)')
    )
    description_hi = models.TextField(
        blank=True,
        verbose_name=_('Description (Hindi)')
    )
    description_gu = models.TextField(
        blank=True,
        verbose_name=_('Description (Gujarati)')
    )
    
    # Slug for URL
    slug = models.SlugField(
        unique=True,
        verbose_name=_('Slug'),
        help_text='Auto-generated from English title'
    )
    
    # Video Media Files
    video = models.FileField(
        upload_to=reel_video_upload,
        validators=[FileExtensionValidator(allowed_extensions=['mp4', 'mov', 'avi', 'webm', 'mkv'])],
        verbose_name=_('Video File'),
        help_text='Supported formats: MP4, MOV, AVI, WebM, MKV'
    )
    
    thumbnail = models.ImageField(
        upload_to=reel_thumbnail_upload,
        blank=True,
        null=True,
        verbose_name=_('Thumbnail'),
        help_text='Optional custom thumbnail (recommended 16:9 aspect ratio)'
    )
    
    # Duration in seconds
    duration = models.PositiveIntegerField(
        blank=True,
        null=True,
        verbose_name=_('Duration (seconds)'),
        help_text='Auto-calculated after upload'
    )
    
    # Relationships
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reels',
        verbose_name=_('Author')
    )
    
    # Status & Publishing
    status = models.CharField(
        max_length=20,
        choices=ReelStatus.choices,
        default=ReelStatus.DRAFT,
        verbose_name=_('Status')
    )
    
    is_featured = models.BooleanField(
        default=False,
        verbose_name=_('Featured'),
        help_text='Show on homepage'
    )
    
    is_trending = models.BooleanField(
        default=False,
        verbose_name=_('Trending'),
        help_text='Mark as trending content'
    )
    
    # Approval Workflow
    is_approved = models.BooleanField(
        default=False,
        verbose_name=_('Approved')
    )
    
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_reels',
        verbose_name=_('Approved By')
    )
    
    approved_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Approved At')
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Created At')
    )
    
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Updated At')
    )
    
    published_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Published At')
    )
    
    # Metrics
    view_count = models.PositiveIntegerField(
        default=0,
        verbose_name=_('View Count')
    )
    
    like_count = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Like Count')
    )
    
    share_count = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Share Count')
    )
    
    # Primary Language
    primary_language = models.CharField(
        max_length=5,
        choices=[('en', 'English'), ('hi', 'Hindi'), ('gu', 'Gujarati')],
        default='en',
        verbose_name=_('Primary Language')
    )
    
    class Meta:
        app_label = 'reels'
        verbose_name = _('Reel')
        verbose_name_plural = _('Reels')
        ordering = ['-published_at', '-created_at']
        indexes = [
            models.Index(fields=['status', 'published_at']),
            models.Index(fields=['is_approved', 'status']),
            models.Index(fields=['is_featured', 'is_trending']),
            models.Index(fields=['created_at']),
            models.Index(fields=['author', 'status']),
        ]
    
    def __str__(self):
        return self.title_en
    
    def save(self, *args, **kwargs):
        """Auto-generate slug from title_en if not set"""
        if not self.slug or self.slug != slugify(self.title_en):
            base_slug = slugify(self.title_en)
            self.slug = base_slug
            
            # Handle slug uniqueness
            counter = 1
            while Reel.objects.exclude(pk=self.pk).filter(slug=self.slug).exists():
                self.slug = f'{base_slug}-{counter}'
                counter += 1
        
        super().save(*args, **kwargs)
    
    def publish(self):
        """Publish the reel"""
        from django.utils import timezone
        if self.is_approved:
            self.status = ReelStatus.PUBLISHED
            self.published_at = timezone.now()
            self.save()
        else:
            raise ValueError("Cannot publish. Reel must be approved first.")
    
    def get_absolute_url(self):
        """Get the absolute URL for the reel"""
        return f'/reels/{self.slug}/'


class ReelCategory(models.Model):
    """
    Categories for organizing reels
    """
    name_en = models.CharField(
        max_length=100,
        verbose_name=_('Name (English)')
    )
    name_hi = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_('Name (Hindi)')
    )
    name_gu = models.CharField(
        max_length=100,
        blank=True,
        verbose_name=_('Name (Gujarati)')
    )
    
    slug = models.SlugField(unique=True)
    
    description_en = models.TextField(
        blank=True,
        verbose_name=_('Description (English)')
    )
    description_hi = models.TextField(
        blank=True,
        verbose_name=_('Description (Hindi)')
    )
    description_gu = models.TextField(
        blank=True,
        verbose_name=_('Description (Gujarati)')
    )
    
    icon = models.ImageField(
        upload_to='reel_categories/',
        blank=True,
        null=True,
        verbose_name=_('Category Icon')
    )
    
    order = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Display Order')
    )
    
    is_active = models.BooleanField(
        default=True,
        verbose_name=_('Active')
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _('Reel Category')
        verbose_name_plural = _('Reel Categories')
        ordering = ['order', 'name_en']
        indexes = [
            models.Index(fields=['is_active', 'order']),
        ]
    
    def __str__(self):
        return self.name_en


class ReelTag(models.Model):
    """
    Tags for discovering and filtering reels
    """
    name = models.CharField(max_length=50, unique=True, verbose_name=_('Tag Name'))
    slug = models.SlugField(unique=True)
    
    is_active = models.BooleanField(default=True, verbose_name=_('Active'))
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = _('Reel Tag')
        verbose_name_plural = _('Reel Tags')
        ordering = ['name']
    
    def __str__(self):
        return self.name
