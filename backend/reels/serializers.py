from rest_framework import serializers
from .models import Reel, ReelCategory, ReelTag


class ReelTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReelTag
        fields = ['id', 'name', 'slug', 'is_active']


class ReelCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ReelCategory
        fields = [
            'id',
            'name_en',
            'name_hi',
            'name_gu',
            'slug',
            'description_en',
            'description_hi',
            'description_gu',
            'icon',
            'order',
            'is_active'
        ]


class ReelListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for listing reels (less data)
    """
    author = serializers.StringRelatedField()
    url = serializers.SerializerMethodField()
    
    class Meta:
        model = Reel
        fields = [
            'id',
            'title_en',
            'title_hi',
            'title_gu',
            'slug',
            'thumbnail',
            'duration',
            'author',
            'status',
            'is_approved',
            'is_featured',
            'is_trending',
            'view_count',
            'like_count',
            'created_at',
            'published_at',
            'url'
        ]
        read_only_fields = [
            'id',
            'created_at',
            'published_at',
            'view_count',
            'like_count'
        ]
    
    def get_url(self, obj):
        return obj.get_absolute_url()


class ReelDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for individual reel view
    """
    author = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()
    
    class Meta:
        model = Reel
        fields = [
            'id',
            'title_en',
            'title_hi',
            'title_gu',
            'description_en',
            'description_hi',
            'description_gu',
            'slug',
            'video',
            'thumbnail',
            'duration',
            'author',
            'status',
            'is_approved',
            'is_featured',
            'is_trending',
            'view_count',
            'like_count',
            'share_count',
            'primary_language',
            'created_at',
            'updated_at',
            'published_at',
            'url'
        ]
        read_only_fields = [
            'id',
            'slug',
            'created_at',
            'updated_at',
            'published_at',
            'view_count',
            'like_count',
            'share_count'
        ]
    
    def get_author(self, obj):
        return {
            'id': obj.author.id,
            'username': obj.author.username,
            'email': obj.author.email,
            'first_name': obj.author.first_name,
            'last_name': obj.author.last_name
        }
    
    def get_url(self, obj):
        return obj.get_absolute_url()


class ReelCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating reels
    """
    class Meta:
        model = Reel
        fields = [
            'title_en',
            'title_hi',
            'title_gu',
            'description_en',
            'description_hi',
            'description_gu',
            'video',
            'thumbnail',
            'duration',
            'is_featured',
            'is_trending',
            'primary_language'
        ]
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class ReelStatisticsSerializer(serializers.Serializer):
    """
    Serializer for reel statistics and analytics
    """
    id = serializers.IntegerField()
    title = serializers.SerializerMethodField()
    view_count = serializers.IntegerField()
    like_count = serializers.IntegerField()
    share_count = serializers.IntegerField()
    engagement_rate = serializers.SerializerMethodField()
    published_at = serializers.DateTimeField()
    
    def get_title(self, obj):
        return obj.title_en
    
    def get_engagement_rate(self, obj):
        """Calculate engagement rate"""
        total_interactions = obj.like_count + obj.share_count
        if obj.view_count > 0:
            return round((total_interactions / obj.view_count) * 100, 2)
        return 0
