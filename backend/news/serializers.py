from rest_framework import serializers

from .models import (
    Section,
    District,
    Category,
    Tag,
    NewsArticle,
    Media,
    Like,
    Comment,
    VideoContent,
    ReelContent,
    EpaperEdition,
)


class SectionSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)
    approved_by = serializers.PrimaryKeyRelatedField(read_only=True)
    approved_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Section
        fields = "__all__"
        read_only_fields = ("approved_by", "approved_at")


class DistrictSerializer(serializers.ModelSerializer):
    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model = District
        fields = "__all__"


class CategorySerializer(serializers.ModelSerializer):
	slug = serializers.SlugField(required=False, allow_blank=True)
	approved_by = serializers.PrimaryKeyRelatedField(read_only=True)
	approved_at = serializers.DateTimeField(read_only=True)

	class Meta:
		model = Category
		fields = "__all__"
		read_only_fields = ("approved_by", "approved_at")


class TagSerializer(serializers.ModelSerializer):
	slug = serializers.SlugField(required=False, allow_blank=True)
	approved_by = serializers.PrimaryKeyRelatedField(read_only=True)
	approved_at = serializers.DateTimeField(read_only=True)

	class Meta:
		model = Tag
		fields = "__all__"
		read_only_fields = ("approved_by", "approved_at")


class MediaSerializer(serializers.ModelSerializer):
	class Meta:
		model = Media
		fields = "__all__"
		read_only_fields = ("id", "created_at")


class LikeSerializer(serializers.ModelSerializer):
	class Meta:
		model = Like
		fields = "__all__"
		read_only_fields = ("id", "created_at")


class CommentSerializer(serializers.ModelSerializer):
	class Meta:
		model = Comment
		fields = "__all__"
		read_only_fields = ("id", "created_at", "updated_at")


class NewsArticleSerializer(serializers.ModelSerializer):
	tags = serializers.PrimaryKeyRelatedField(queryset=Tag.objects.all(), many=True, required=False)
	media = MediaSerializer(many=True, read_only=True)

	class Meta:
		model = NewsArticle
		fields = "__all__"
		read_only_fields = ("id", "view_count", "likes_count", "published_at", "created_at", "updated_at")


class VideoContentSerializer(serializers.ModelSerializer):
	# Explicitly serialize file field as full URL
	file = serializers.FileField(use_url=True, required=False, allow_null=True)
	thumbnail = serializers.ImageField(use_url=True, required=False, allow_null=True)
	
	class Meta:
		model = VideoContent
		fields = "__all__"
		read_only_fields = ("id", "view_count", "likes_count", "published_at", "created_at", "updated_at")


class ReelContentSerializer(serializers.ModelSerializer):
	# Explicitly serialize file field as full URL
	file = serializers.FileField(use_url=True, required=False, allow_null=True)
	thumbnail = serializers.ImageField(use_url=True, required=False, allow_null=True)
	
	class Meta:
		model = ReelContent
		fields = "__all__"
		read_only_fields = ("id", "view_count", "likes_count", "published_at", "created_at", "updated_at")


class EpaperEditionSerializer(serializers.ModelSerializer):
	# Ensure the PDF URL is fully qualified for the frontend
	pdf_file = serializers.FileField(use_url=True)

	class Meta:
		model = EpaperEdition
		fields = "__all__"
		read_only_fields = ("id", "created_at")
