from __future__ import annotations

from django.core.exceptions import ValidationError


def validate_file_size(value, max_mb: int = 5) -> None:
    """
    Generic file size validator.

    Use this on FileField / ImageField to prevent very large uploads which hurt
    performance and storage. Default: 5 MB.
    """

    if not value:
        return

    try:
        size = value.size
    except AttributeError:
        # Not a file-like object; ignore
        return

    limit = max_mb * 1024 * 1024
    if size > limit:
        raise ValidationError(
            f"File too large. Size should not exceed {max_mb} MB."
        )


def validate_image_size(value) -> None:
    """
    Convenience wrapper for images specifically.
    """

    validate_file_size(value, max_mb=5)

