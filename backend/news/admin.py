from django.contrib import admin

from .models import Category, Comment, District, Like, Media, NewsArticle, Section, Tag, VideoContent, ReelContent, EpaperEdition


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ("name_en", "slug", "parent", "order", "is_active")
    list_filter = ("is_active", "parent")
    search_fields = ("name_en", "name_hi", "name_gu", "slug")
    ordering = ("order", "name_en")


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ("name_en", "slug", "section", "order", "is_active")
    list_filter = ("is_active", "section")
    search_fields = ("name_en", "name_hi", "name_gu", "slug")
    ordering = ("section", "order", "name_en")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name_en", "slug", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name_en", "name_hi", "name_gu", "slug")


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    search_fields = ("name", "slug")


@admin.register(NewsArticle)
class NewsArticleAdmin(admin.ModelAdmin):
    list_display = (
        "title_en",
        "slug",
        "section",
        "category",
        "district",
        "status",
        "content_type",
        "is_breaking",
        "is_top",
        "is_featured",
        "published_at",
        "created_at",
    )
    list_filter = ("status", "content_type", "section", "category", "district", "is_breaking", "is_top", "is_featured")
    search_fields = ("title_en", "title_hi", "title_gu", "slug")
    prepopulated_fields = {"slug": ("title_en",)}
    autocomplete_fields = ("author", "section", "category", "district", "tags")


@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ("article", "media_type", "order", "created_at")
    list_filter = ("media_type",)
    search_fields = ("article__title_en", "youtube_url", "caption")
    autocomplete_fields = ("article",)
    ordering = ("article", "order", "id")


@admin.register(VideoContent)
class VideoContentAdmin(admin.ModelAdmin):
    list_display = (
        "title_en",
        "slug",
        "section",
        "category",
        "status",
        "published_at",
        "created_at",
    )
    list_filter = ("status", "section", "category")
    search_fields = ("title_en", "title_hi", "title_gu", "slug")
    prepopulated_fields = {"slug": ("title_en",)}
    autocomplete_fields = ("section", "category", "tags")


@admin.register(ReelContent)
class ReelContentAdmin(admin.ModelAdmin):
    list_display = (
        "title_en",
        "slug",
        "section",
        "category",
        "status",
        "published_at",
        "created_at",
    )
    list_filter = ("status", "section", "category")
    search_fields = ("title_en", "title_hi", "title_gu", "slug")
    prepopulated_fields = {"slug": ("title_en",)}
    autocomplete_fields = ("section", "category", "tags")


@admin.register(EpaperEdition)
class EpaperEditionAdmin(admin.ModelAdmin):
    list_display = ("title", "publication_date", "pdf_file", "created_at")
    list_filter = ("publication_date",)
    search_fields = ("title",)
    ordering = ("-publication_date", "-created_at")


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ("user", "article", "created_at")
    search_fields = ("user__username", "user__email", "article__title_en")
    autocomplete_fields = ("user", "article")


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ("article", "user", "parent", "is_approved", "created_at")
    list_filter = ("is_approved",)
    search_fields = ("article__title_en", "user__username", "user__email", "content")
    autocomplete_fields = ("article", "user", "parent")
