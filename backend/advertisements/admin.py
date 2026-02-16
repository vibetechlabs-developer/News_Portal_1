from django.contrib import admin

from .models import Advertisement, AdvertisementRequest, GoogleAdSenseSlot


@admin.register(GoogleAdSenseSlot)
class GoogleAdSenseSlotAdmin(admin.ModelAdmin):
    list_display = ("name", "placement", "client_id", "slot_id", "responsive", "is_active", "order")
    list_filter = ("placement", "is_active", "responsive")
    search_fields = ("name", "client_id", "slot_id")
    ordering = ("placement", "order", "name")


@admin.register(Advertisement)
class AdvertisementAdmin(admin.ModelAdmin):
    list_display = ("title", "placement", "ad_type", "status", "is_active", "start_at", "end_at", "created_at")
    list_filter = ("placement", "ad_type", "status", "is_active")
    search_fields = ("title", "advertiser_name", "advertiser_email")
    ordering = ("-created_at",)


@admin.register(AdvertisementRequest)
class AdvertisementRequestAdmin(admin.ModelAdmin):
    list_display = ("advertiser_name", "advertiser_email", "placement", "ad_type", "status", "created_at")
    list_filter = ("placement", "ad_type", "status")
    search_fields = ("advertiser_name", "advertiser_email", "company_name")
    ordering = ("-created_at",)
