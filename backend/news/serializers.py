from rest_framework import serializers
from django.contrib.auth import get_user_model

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
    VideoLike,
    ReelLike,
    VideoComment,
    ReelComment,
    Poll,
    PollOption,
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


User = get_user_model()


class PublicUserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ("id", "username", "first_name", "last_name")
		read_only_fields = fields


class CommentSerializer(serializers.ModelSerializer):
	user = PublicUserSerializer(read_only=True)

	class Meta:
		model = Comment
		fields = "__all__"
		read_only_fields = ("id", "created_at", "updated_at")


class NewsArticleSerializer(serializers.ModelSerializer):
	slug = serializers.SlugField(required=False, allow_blank=True)
	tags = serializers.PrimaryKeyRelatedField(queryset=Tag.objects.all(), many=True, required=False)
	media = MediaSerializer(many=True, read_only=True)
	district_name_en = serializers.SerializerMethodField()
	district_name_gu = serializers.SerializerMethodField()
	poll = serializers.SerializerMethodField()

	def get_poll(self, obj):
		if hasattr(obj, 'poll'):
			return PollSerializer(obj.poll).data
		return None

	def get_district_name_en(self, obj):
		if obj.district:
			return obj.district.name_en
		return None

	def get_district_name_gu(self, obj):
		if obj.district:
			return obj.district.name_gu or obj.district.name_en
		return None

	class Meta:
		model = NewsArticle
		fields = "__all__"
		read_only_fields = ("id", "created_at", "updated_at")



class VideoContentSerializer(serializers.ModelSerializer):
	slug = serializers.SlugField(required=False, allow_blank=True)
	# Explicitly serialize file field as full URL
	file = serializers.FileField(use_url=True, required=False, allow_null=True)
	thumbnail = serializers.ImageField(use_url=True, required=False, allow_null=True)
	
	class Meta:
		model = VideoContent
		fields = "__all__"
		# view_count / likes_count are writable for editor/admin create & update (manual seeding like articles)
		read_only_fields = ("id", "created_at", "updated_at")


class ReelContentSerializer(serializers.ModelSerializer):
	slug = serializers.SlugField(required=False, allow_blank=True)
	# Explicitly serialize file field as full URL
	file = serializers.FileField(use_url=True, required=False, allow_null=True)
	thumbnail = serializers.ImageField(use_url=True, required=False, allow_null=True)
	
	class Meta:
		model = ReelContent
		fields = "__all__"
		read_only_fields = ("id", "created_at", "updated_at")


class EpaperEditionSerializer(serializers.ModelSerializer):
	# Explicitly serialize PDF file field as full URL
	pdf_file = serializers.FileField(use_url=True)
	
	class Meta:
		model = EpaperEdition
		fields = "__all__"
		read_only_fields = ("id", "created_at", "updated_at")


class VideoLikeSerializer(serializers.ModelSerializer):
	class Meta:
		model = VideoLike
		fields = "__all__"
		read_only_fields = ("id", "created_at")


class ReelLikeSerializer(serializers.ModelSerializer):
	class Meta:
		model = ReelLike
		fields = "__all__"
		read_only_fields = ("id", "created_at")


class VideoCommentSerializer(serializers.ModelSerializer):
	user = PublicUserSerializer(read_only=True)

	class Meta:
		model = VideoComment
		fields = "__all__"
		read_only_fields = ("id", "created_at", "updated_at")


class ReelCommentSerializer(serializers.ModelSerializer):
	user = PublicUserSerializer(read_only=True)

	class Meta:
		model = ReelComment
		fields = "__all__"
		read_only_fields = ("id", "created_at", "updated_at")


class PollOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PollOption
        fields = ("id", "text", "votes")
        read_only_fields = ("id", "votes")


class PollSerializer(serializers.ModelSerializer):
    options = PollOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Poll
        fields = ("id", "question", "is_active", "options", "created_at")
        read_only_fields = ("id", "created_at")


class FCMDeviceRegisterSerializer(serializers.Serializer):
    """Payload for registering/updating an FCM device token (Android / iOS)."""

    platform = serializers.ChoiceField(choices=["ANDROID", "IOS", "android", "ios"])
    fcm_token = serializers.CharField(min_length=10, max_length=4096)
    device_id = serializers.CharField(required=False, allow_blank=True, max_length=255)
    device_model = serializers.CharField(required=False, allow_blank=True, max_length=255)
    app_version = serializers.CharField(required=False, allow_blank=True, max_length=64)

    def validate_platform(self, value: str) -> str:
        return str(value).upper()


class FCMDeviceUnregisterSerializer(serializers.Serializer):
    fcm_token = serializers.CharField(min_length=10, max_length=4096)

