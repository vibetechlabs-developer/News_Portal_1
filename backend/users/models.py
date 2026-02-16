from django.contrib.auth.models import AbstractUser
from django.db import models

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
