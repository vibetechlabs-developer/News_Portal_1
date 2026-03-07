from django.contrib.auth.decorators import login_required, permission_required
from rest_framework import permissions


class IsReelAuthorOrAdmin(permissions.BasePermission):
    """
    Permission to allow only the author or admin to modify a reel.
    """
    
    def has_object_permission(self, request, view, obj):
        # Allow safe methods for all
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Allow author or admin to modify
        return obj.author == request.user or request.user.is_staff


class CanApproveReels(permissions.BasePermission):
    """
    Permission to allow only admins to approve/publish reels.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class CanUploadReels(permissions.BasePermission):
    """
    Permission to allow authenticated users to upload reels.
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


# Decorator for admin views
admin_only = permission_required('reels.change_reel', redirect_field_name=None)
authenticated_only = login_required
