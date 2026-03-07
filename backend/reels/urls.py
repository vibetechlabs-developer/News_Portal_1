from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReelViewSet, ReelCategoryViewSet, ReelTagViewSet

app_name = 'reels'

router = DefaultRouter()
router.register(r'reels', ReelViewSet, basename='reel')
router.register(r'categories', ReelCategoryViewSet, basename='category')
router.register(r'tags', ReelTagViewSet, basename='tag')

urlpatterns = [
    path('', include(router.urls)),
]
