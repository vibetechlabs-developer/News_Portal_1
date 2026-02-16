from rest_framework import serializers

from .models import NewsView


class NewsViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsView
        fields = "__all__"
        read_only_fields = ("id", "viewed_at")
