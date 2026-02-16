from rest_framework import serializers

from .models import GoogleAdSenseSlot, Advertisement, AdvertisementRequest


class GoogleAdSenseSlotSerializer(serializers.ModelSerializer):
	class Meta:
		model = GoogleAdSenseSlot
		fields = "__all__"
		read_only_fields = ("id",)


class AdvertisementSerializer(serializers.ModelSerializer):
	class Meta:
		model = Advertisement
		fields = "__all__"
		read_only_fields = (
			"id",
			"impression_count",
			"click_count",
			"created_at",
			"updated_at",
		)


class AdvertisementRequestSerializer(serializers.ModelSerializer):
	class Meta:
		model = AdvertisementRequest
		fields = "__all__"
		read_only_fields = ("id", "created_at", "updated_at")
