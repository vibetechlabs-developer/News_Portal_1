from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.http import HttpResponse
import csv

from .models import User, UserAppProfile


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


@admin.register(UserAppProfile)
class UserAppProfileAdmin(admin.ModelAdmin):
    actions = ["export_selected_as_csv"]
    list_display = (
        "user",
        "location_permission_granted",
        "location_permission_updated_at",
        "marketing_opt_in",
        "marketing_opt_in_updated_at",
        "personalized_news_opt_in",
        "personalized_news_opt_in_updated_at",
        "city",
        "state",
        "country",
        "device_platform",
        "app_version",
        "last_seen_at",
        "updated_at",
    )
    search_fields = ("user__username", "user__email", "city", "state", "country", "device_id")
    list_filter = ("location_permission_granted", "marketing_opt_in", "personalized_news_opt_in", "device_platform")
    readonly_fields = ("created_at", "updated_at")

    def export_selected_as_csv(self, request, queryset):
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="user_app_profiles.csv"'
        writer = csv.writer(response)
        writer.writerow(
            [
                "user_id",
                "username",
                "email",
                "location_permission_granted",
                "location_permission_updated_at",
                "latitude",
                "longitude",
                "city",
                "state",
                "country",
                "pincode",
                "device_id",
                "device_model",
                "device_platform",
                "app_version",
                "app_build_number",
                "marketing_opt_in",
                "marketing_opt_in_updated_at",
                "personalized_news_opt_in",
                "personalized_news_opt_in_updated_at",
                "last_seen_at",
                "created_at",
                "updated_at",
            ]
        )
        for obj in queryset.select_related("user"):
            writer.writerow(
                [
                    obj.user_id,
                    obj.user.username if obj.user else "",
                    obj.user.email if obj.user else "",
                    obj.location_permission_granted,
                    obj.location_permission_updated_at,
                    obj.latitude,
                    obj.longitude,
                    obj.city,
                    obj.state,
                    obj.country,
                    obj.pincode,
                    obj.device_id,
                    obj.device_model,
                    obj.device_platform,
                    obj.app_version,
                    obj.app_build_number,
                    obj.marketing_opt_in,
                    obj.marketing_opt_in_updated_at,
                    obj.personalized_news_opt_in,
                    obj.personalized_news_opt_in_updated_at,
                    obj.last_seen_at,
                    obj.created_at,
                    obj.updated_at,
                ]
            )
        return response

    export_selected_as_csv.short_description = "Export selected app profiles as CSV"
