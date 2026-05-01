from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import UserAppProfile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Safe user representation for APIs.

    IMPORTANT: do NOT expose password/hash or admin/security flags by default.
    """

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "phone_number",
            "profile_picture",
            "is_active",
            "last_login",
            "date_joined",
        )
        read_only_fields = ("id", "role", "last_login", "date_joined")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "phone_number",
            "profile_picture",
        )
        read_only_fields = ("id",)

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class AdminUserSerializer(serializers.ModelSerializer):
    """
    Used by SUPER_ADMIN only (UserAdminViewSet).
    Allows setting role, is_staff, is_active when creating or updating users.
    Password is write-only; omit to leave unchanged on update.
    """

    password = serializers.CharField(write_only=True, min_length=8, required=False)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "role",
            "phone_number",
            "profile_picture",
            "is_active",
            "is_staff",
            "last_login",
            "date_joined",
        )
        read_only_fields = ("id", "last_login", "date_joined")

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        if not password:
            raise serializers.ValidationError({"password": "Required when creating a user."})
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    uidb64 = serializers.CharField(write_only=True)
    token = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)


class UserAppProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAppProfile
        fields = (
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
        )
        read_only_fields = (
            "location_permission_updated_at",
            "marketing_opt_in_updated_at",
            "personalized_news_opt_in_updated_at",
            "created_at",
            "updated_at",
        )


class UserAppProfileAdminSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    role = serializers.CharField(source="user.role", read_only=True)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)
    date_joined = serializers.DateTimeField(source="user.date_joined", read_only=True)

    class Meta:
        model = UserAppProfile
        fields = (
            "user_id",
            "username",
            "email",
            "role",
            "is_active",
            "date_joined",
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
        )
