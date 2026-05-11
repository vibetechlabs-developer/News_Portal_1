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
    MarketIndicesProxyView,
    DistrictViewSet,
    EpaperEditionViewSet,
    LikeViewSet,
    MediaViewSet,
    NewsArticleViewSet,
    SectionViewSet,
    TagViewSet,
    VideoContentViewSet,
    ReelContentViewSet,
    PollViewSet,
    PushSubscriptionView,
)
from news.fcm_views import (
    FCMDeviceRegisterView,
    FCMDeviceUnregisterView,
    FCMGuestDeviceRegisterView,
    FCMGuestDeviceUnregisterView,
)
from news.views_share import ArticleShareProxyView
from reels.views import ReelViewSet, ReelCategoryViewSet, ReelTagViewSet
from users.views import (
    MeView,
    CustomerProfilesAdminListView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
    ThrottledTokenObtainPairView,
    UserAppProfileAdminViewSet,
    UserAppProfileView,
    UserAdminViewSet,
)

router = DefaultRouter()

# Users / Auth
router.register(r"users", UserAdminViewSet, basename="users")
router.register(r"users/customers", UserAppProfileAdminViewSet, basename="users-customers")
router.register(r"customers", UserAppProfileAdminViewSet, basename="customers")

# News
router.register(r"news/sections", SectionViewSet, basename="news-sections")
router.register(r"news/districts", DistrictViewSet, basename="news-districts")
router.register(r"news/categories", CategoryViewSet, basename="news-categories")
router.register(r"news/tags", TagViewSet, basename="news-tags")
router.register(r"news/articles", NewsArticleViewSet, basename="news-articles")
router.register(r"news/media", MediaViewSet, basename="news-media")
router.register(r"news/comments", CommentViewSet, basename="news-comments")
router.register(r"news/likes", LikeViewSet, basename="news-likes")
router.register(r"news/polls", PollViewSet, basename="news-polls")

# Dedicated video/reel tables
router.register(r"news/videos", VideoContentViewSet, basename="news-videos")
router.register(r"news/reels", ReelContentViewSet, basename="news-reels")

# Reels app (new)
router.register(r"reels-new/reels", ReelViewSet, basename="reels-new")
router.register(r"reels-new/categories", ReelCategoryViewSet, basename="reels-categories")
router.register(r"reels-new/tags", ReelTagViewSet, basename="reels-tags")

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
    path("auth/app-profile/", UserAppProfileView.as_view(), name="auth-app-profile"),
    path("auth/token/", ThrottledTokenObtainPairView.as_view(), name="token-obtain"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/logout/", TokenBlacklistView.as_view(), name="token-blacklist"),
    path("auth/password-reset/", PasswordResetRequestView.as_view(), name="password-reset"),
    path("auth/password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    # Stable explicit list endpoint for customers (avoid router nesting edge cases)
    path("users/customers/", CustomerProfilesAdminListView.as_view(), name="users-customers-list"),
    path("customers/", CustomerProfilesAdminListView.as_view(), name="customers-list"),
    path("news/cricket-live/", CricketNewsProxyView.as_view(), name="cricket-live"),
    path("news/cricket-live-matches/", CricketMatchesProxyView.as_view(), name="cricket-live-matches"),
    path("push/subscriptions/", PushSubscriptionView.as_view(), name="push-subscriptions"),
    path("push/fcm-devices/", FCMDeviceRegisterView.as_view(), name="fcm-devices"),
    path("push/fcm-devices/unregister/", FCMDeviceUnregisterView.as_view(), name="fcm-devices-unregister"),
    path("push/fcm-devices/guest/", FCMGuestDeviceRegisterView.as_view(), name="fcm-devices-guest"),
    path("push/fcm-devices/guest/unregister/", FCMGuestDeviceUnregisterView.as_view(), name="fcm-devices-guest-unregister"),
    path("market/indices/", MarketIndicesProxyView.as_view(), name="market-indices"),
    path("share/<str:slug>/", ArticleShareProxyView.as_view(), name="article-share"),
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path("docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("", include(router.urls)),
]

