from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Django Admin configuration for the custom user model.

    Note: logging into Django Admin requires `is_staff=True`.
    """

    list_display = (*BaseUserAdmin.list_display, "email", "role")
    list_filter = (*BaseUserAdmin.list_filter, "role")
    search_fields = (*BaseUserAdmin.search_fields, "email")

    fieldsets = BaseUserAdmin.fieldsets + (
        ("Role & Profile", {"fields": ("role", "phone_number", "profile_picture")}),
    )
