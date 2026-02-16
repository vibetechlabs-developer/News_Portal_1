from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobPostingViewSet, JobApplicationViewSet, ApplicationReviewViewSet, NotificationViewSet

router = DefaultRouter()
router.register(r'job-postings', JobPostingViewSet, basename='job-posting')
router.register(r'applications', JobApplicationViewSet, basename='job-application')
router.register(r'reviews', ApplicationReviewViewSet, basename='application-review')
router.register(r'notifications', NotificationViewSet, basename='notification')

app_name = 'careers'

urlpatterns = [
    path('', include(router.urls)),
]
