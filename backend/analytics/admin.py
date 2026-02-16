from django.contrib import admin

from .models import NewsView


@admin.register(NewsView)
class NewsViewAdmin(admin.ModelAdmin):
    list_display = ("article", "user", "ip_address", "viewed_at")
    list_filter = ("viewed_at",)
    search_fields = ("article__title_en", "user__username", "user__email", "ip_address")
    autocomplete_fields = ("article", "user")
    ordering = ("-viewed_at",)
