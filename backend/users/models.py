from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

from utils.validators import validate_image_size


class UserRole(models.TextChoices):
    SUPER_ADMIN = "SUPER_ADMIN", "Super Admin"
    EDITOR = "EDITOR", "Editor"
    REPORTER = "REPORTER", "Reporter"
    USER = "USER", "User"


class User(AbstractUser):
    """
    Custom user model with role-based access:
    - SUPER_ADMIN: full access (users, content, ads, contact, analytics)
    - EDITOR: create/update/delete content (news, ads, contact), view analytics
    - REPORTER: create/update own content (news); same content permissions as Editor by default
    - USER: read content, like, comment; submit contact/ad requests
    """

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.USER)
    phone_number = models.CharField(max_length=20, blank=True)
    profile_picture = models.ImageField(
        upload_to="profiles/",
        blank=True,
        null=True,
        validators=[validate_image_size],
    )

    def is_super_admin(self) -> bool:
        return self.role == UserRole.SUPER_ADMIN

    def is_editor(self) -> bool:
        return self.role == UserRole.EDITOR

    def is_reporter(self) -> bool:
        return self.role == UserRole.REPORTER

    def is_editor_or_reporter(self) -> bool:
        """True if user can create/edit content (news, etc.)."""
        return self.role in (UserRole.EDITOR, UserRole.REPORTER)

    def __str__(self) -> str:
        return f"{self.username} ({self.role})"


class UserAppProfile(models.Model):
    """
    Customer app metadata captured with explicit client-side consent.
    """

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="app_profile",
    )
    location_permission_granted = models.BooleanField(default=False)
    location_permission_updated_at = models.DateTimeField(null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    city = models.CharField(max_length=120, blank=True)
    state = models.CharField(max_length=120, blank=True)
    country = models.CharField(max_length=120, blank=True)
    pincode = models.CharField(max_length=20, blank=True)
    device_id = models.CharField(max_length=255, blank=True)
    device_model = models.CharField(max_length=255, blank=True)
    device_platform = models.CharField(max_length=50, blank=True)
    app_version = models.CharField(max_length=50, blank=True)
    app_build_number = models.CharField(max_length=50, blank=True)
    marketing_opt_in = models.BooleanField(default=False)
    marketing_opt_in_updated_at = models.DateTimeField(null=True, blank=True)
    personalized_news_opt_in = models.BooleanField(default=False)
    personalized_news_opt_in_updated_at = models.DateTimeField(null=True, blank=True)
    last_seen_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["location_permission_granted"]),
            models.Index(fields=["device_platform"]),
            models.Index(fields=["last_seen_at"]),
        ]

    def __str__(self) -> str:
        return f"AppProfile<{self.user_id}>"

    def save(self, *args, **kwargs):
        if self.pk:
            old = UserAppProfile.objects.filter(pk=self.pk).values(
                "location_permission_granted",
                "marketing_opt_in",
                "personalized_news_opt_in",
            ).first()
            if old:
                now = timezone.now()
                if old["location_permission_granted"] != self.location_permission_granted:
                    self.location_permission_updated_at = now
                if old["marketing_opt_in"] != self.marketing_opt_in:
                    self.marketing_opt_in_updated_at = now
                if old["personalized_news_opt_in"] != self.personalized_news_opt_in:
                    self.personalized_news_opt_in_updated_at = now
        else:
            now = timezone.now()
            self.location_permission_updated_at = now
            self.marketing_opt_in_updated_at = now
            self.personalized_news_opt_in_updated_at = now
        super().save(*args, **kwargs)
