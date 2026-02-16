from __future__ import annotations

from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenBlacklistView, TokenRefreshView

from backend.views import health
from advertisements.views import (
    AdvertisementRequestViewSet,
    AdvertisementViewSet,
    GoogleAdSenseSlotViewSet,
)
from analytics.views import NewsViewViewSet
from contact.views import ContactMessageViewSet
from site_settings.views import SiteSettingsView
from careers.views import JobPostingViewSet, JobApplicationViewSet, ApplicationReviewViewSet, NotificationViewSet
from news.views import (
    CategoryViewSet,
    CommentViewSet,
    CricketNewsProxyView,
    CricketMatchesProxyView,
    DistrictViewSet,
    LikeViewSet,
    MediaViewSet,
    NewsArticleViewSet,
    SectionViewSet,
    TagViewSet,
    VideoContentViewSet,
    ReelContentViewSet,
    EpaperEditionViewSet,
)
from users.views import (
    MeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
    ThrottledTokenObtainPairView,
    UserAdminViewSet,
)

router = DefaultRouter()

# Users / Auth
router.register(r"users", UserAdminViewSet, basename="users")

# News
router.register(r"news/sections", SectionViewSet, basename="news-sections")
router.register(r"news/districts", DistrictViewSet, basename="news-districts")
router.register(r"news/categories", CategoryViewSet, basename="news-categories")
router.register(r"news/tags", TagViewSet, basename="news-tags")
router.register(r"news/articles", NewsArticleViewSet, basename="news-articles")
router.register(r"news/media", MediaViewSet, basename="news-media")
router.register(r"news/comments", CommentViewSet, basename="news-comments")
router.register(r"news/likes", LikeViewSet, basename="news-likes")

# Dedicated video/reel tables
router.register(r"videos", VideoContentViewSet, basename="videos")
router.register(r"reels", ReelContentViewSet, basename="reels")

# E-paper editions
router.register(r"epaper/editions", EpaperEditionViewSet, basename="epaper-editions")

# Ads
router.register(r"ads/slots", GoogleAdSenseSlotViewSet, basename="ads-slots")
router.register(r"ads/advertisements", AdvertisementViewSet, basename="ads-advertisements")
router.register(r"ads/requests", AdvertisementRequestViewSet, basename="ads-requests")

# Contact
router.register(r"contact/messages", ContactMessageViewSet, basename="contact-messages")

# Careers
router.register(r"careers/job-postings", JobPostingViewSet, basename="job-posting")
router.register(r"careers/applications", JobApplicationViewSet, basename="job-application")
router.register(r"careers/reviews", ApplicationReviewViewSet, basename="application-review")
router.register(r"careers/notifications", NotificationViewSet, basename="notification")

# Analytics
router.register(r"analytics/views", NewsViewViewSet, basename="analytics-views")

urlpatterns = [
    path("health/", health, name="health"),
    path("site/settings/", SiteSettingsView.as_view(), name="site-settings"),
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
    path("auth/token/", ThrottledTokenObtainPairView.as_view(), name="token-obtain"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/logout/", TokenBlacklistView.as_view(), name="token-blacklist"),
    path("auth/password-reset/", PasswordResetRequestView.as_view(), name="password-reset"),
    path("auth/password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("news/cricket-live/", CricketNewsProxyView.as_view(), name="cricket-live"),
    path("news/cricket-live-matches/", CricketMatchesProxyView.as_view(), name="cricket-live-matches"),
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path("docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("", include(router.urls)),
]

