from __future__ import annotations

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView

from backend.common.permissions import IsSuperAdmin
from .serializers import (
    AdminUserSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserSerializer,
)

User = get_user_model()


class AuthRateThrottle(ScopedRateThrottle):
    scope_attr = "throttle_scope"


class ThrottledTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [AuthRateThrottle]
    throttle_scope = "auth"


class RegisterView(generics.CreateAPIView):
    """
    Public registration endpoint.
    """

    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
    throttle_classes = [AuthRateThrottle]
    throttle_scope = "auth"


class MeView(generics.RetrieveUpdateAPIView):
    """
    Get/update the currently authenticated user's profile.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class PasswordResetRequestView(generics.GenericAPIView):
    """
    Request password reset: send email with link containing uid and token.
    Frontend should redirect user to FRONTEND_RESET_PASSWORD_URL?uid=<uidb64>&token=<token>
    then call password-reset/confirm/ with uidb64, token, new_password.
    """

    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer
    throttle_classes = [AuthRateThrottle]
    throttle_scope = "auth"

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        user = User.objects.filter(email__iexact=email).first()
        if user:
            token = default_token_generator.make_token(user)
            uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
            reset_url = (
                f"{settings.FRONTEND_RESET_PASSWORD_URL.rstrip('/')}"
                f"?uid={uidb64}&token={token}"
            )
            send_mail(
                subject="Password reset - News Portal",
                message=f"Use this link to reset your password: {reset_url}\n\nIf you did not request this, ignore this email.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=True,
            )
        return Response(
            {"detail": "If an account exists with this email, you will receive a reset link."},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(generics.GenericAPIView):
    """
    Confirm password reset with token from email link.
    """

    permission_classes = [AllowAny]
    serializer_class = PasswordResetConfirmSerializer
    throttle_classes = [AuthRateThrottle]
    throttle_scope = "auth"

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        uidb64 = serializer.validated_data["uidb64"]
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]
        try:
            uid = urlsafe_base64_decode(uidb64)
            user = User.objects.get(pk=int(uid.decode()))
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"detail": "Invalid or expired reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not default_token_generator.check_token(user, token):
            return Response(
                {"detail": "Invalid or expired reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.set_password(new_password)
        user.save(update_fields=["password"])
        return Response({"detail": "Password has been reset."}, status=status.HTTP_200_OK)


class UserAdminViewSet(viewsets.ModelViewSet):
    """
    SUPER_ADMIN-only user management.
    Use AdminUserSerializer to create/update users and set role (EDITOR, REPORTER, USER),
    is_staff, and is_active. List/retrieve use UserSerializer (no password).
    """

    permission_classes = [IsSuperAdmin]
    queryset = User.objects.all().order_by("-date_joined")

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return AdminUserSerializer
        return UserSerializer
