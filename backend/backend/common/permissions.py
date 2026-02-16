from __future__ import annotations

from rest_framework.permissions import BasePermission, SAFE_METHODS


def _get_role(user) -> str | None:
    # Works with AnonymousUser too (no "role" attr)
    return getattr(user, "role", None)


class IsSuperAdmin(BasePermission):
    """
    Allows access only to SUPER_ADMIN users (custom `users.User.role`).
    """

    def has_permission(self, request, view) -> bool:
        return bool(request.user and request.user.is_authenticated and _get_role(request.user) == "SUPER_ADMIN")


# Roles that can manage content (news, ads, contact, analytics)
CONTENT_MANAGER_ROLES = {"EDITOR", "REPORTER", "SUPER_ADMIN"}


class IsEditorOrSuperAdmin(BasePermission):
    """
    Allows access to EDITOR, REPORTER, or SUPER_ADMIN users.
    Use for: creating/editing news, ads, contact, analytics.
    """

    def has_permission(self, request, view) -> bool:
        if not (request.user and request.user.is_authenticated):
            return False
        return _get_role(request.user) in CONTENT_MANAGER_ROLES


class IsOwnerOrPrivileged(BasePermission):
    """
    Object-level permission:
    - SAFE methods: allowed for everyone (subject to queryset filtering)
    - Write: allowed to object owner OR editor/super-admin

    Owner resolution tries `obj.user` then `obj.author`.
    """

    def has_permission(self, request, view) -> bool:
        # Let viewset handle auth for SAFE; for writes require auth
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj) -> bool:
        if request.method in SAFE_METHODS:
            return True

        user = request.user
        if not (user and user.is_authenticated):
            return False

        if _get_role(user) in CONTENT_MANAGER_ROLES:
            return True

        owner = getattr(obj, "user", None) or getattr(obj, "author", None)
        return bool(owner and getattr(owner, "pk", None) == getattr(user, "pk", None))

