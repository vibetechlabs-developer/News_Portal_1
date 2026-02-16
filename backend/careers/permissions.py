from rest_framework import permissions
from users.models import UserRole


class IsAdminOrReadOnly(permissions.BasePermission):
    """Only admins can create, update, delete job postings. Others can view."""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.role == UserRole.SUPER_ADMIN


class IsApplicationOwnerOrAdmin(permissions.BasePermission):
    """Only application owner or admin can view/modify their application."""
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == UserRole.SUPER_ADMIN:
            return True
        return obj.user == request.user


class IsAdminUser(permissions.BasePermission):
    """Only super admins can access."""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == UserRole.SUPER_ADMIN
