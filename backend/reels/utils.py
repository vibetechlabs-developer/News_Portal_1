"""
Utility functions for reels app
"""
import os
import mimetypes
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


ALLOWED_VIDEO_EXTENSIONS = ['mp4', 'mov', 'avi', 'webm', 'mkv']
ALLOWED_VIDEO_MIMETYPES = [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    'video/x-matroska'
]
MAX_VIDEO_SIZE = 100 * 1024 * 1024  # 100 MB

ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
ALLOWED_IMAGE_MIMETYPES = [
    'image/jpeg',
    'image/png',
    'image/webp'
]
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB


def validate_video_file(file_obj):
    """
    Validate video file for upload.
    
    Args:
        file_obj: Django UploadedFile object
    
    Raises:
        ValidationError: If file is invalid
    """
    if not file_obj:
        raise ValidationError(_('Video file is required.'))
    
    # Check file size
    if file_obj.size > MAX_VIDEO_SIZE:
        size_mb = file_obj.size / (1024 * 1024)
        raise ValidationError(
            _('Video file is too large (%(size).1f MB). Maximum size is 100 MB.') % {'size': size_mb}
        )
    
    # Check file extension
    file_ext = os.path.splitext(file_obj.name)[1].lstrip('.').lower()
    if file_ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise ValidationError(
            _('Unsupported video format. Allowed formats: MP4, MOV, AVI, WebM, MKV')
        )
    
    # Check MIME type
    mime_type, _ = mimetypes.guess_type(file_obj.name)
    if mime_type and mime_type not in ALLOWED_VIDEO_MIMETYPES:
        raise ValidationError(
            _('Invalid file format detected. Please upload a valid video file.')
        )
    
    return True


def validate_image_file(file_obj):
    """
    Validate image file for upload.
    
    Args:
        file_obj: Django UploadedFile object
    
    Returns:
        True if valid, raises ValidationError otherwise
    """
    if not file_obj:
        return True  # Optional field
    
    # Check file size
    if file_obj.size > MAX_IMAGE_SIZE:
        size_mb = file_obj.size / (1024 * 1024)
        raise ValidationError(
            _('Image file is too large (%(size).1f MB). Maximum size is 5 MB.') % {'size': size_mb}
        )
    
    # Check file extension
    file_ext = os.path.splitext(file_obj.name)[1].lstrip('.').lower()
    if file_ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValidationError(
            _('Unsupported image format. Allowed formats: JPG, PNG, WebP')
        )
    
    # Check MIME type
    mime_type, _ = mimetypes.guess_type(file_obj.name)
    if mime_type and mime_type not in ALLOWED_IMAGE_MIMETYPES:
        raise ValidationError(
            _('Invalid image format detected. Please upload a valid image file.')
        )
    
    return True


def get_file_size_display(file_obj):
    """
    Get human-readable file size.
    
    Args:
        file_obj: Django File object
    
    Returns:
        str: Human-readable file size (e.g., "15.5 MB")
    """
    if not file_obj:
        return 'N/A'
    
    try:
        size = file_obj.size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024:
                return f"{size:.2f} {unit}"
            size /= 1024
        return 'Very large'
    except Exception:
        return 'Unknown'


def get_video_info(file_obj):
    """
    Get video file information.
    
    Args:
        file_obj: Django File object
    
    Returns:
        dict: Video information (name, size, size_display, extension)
    """
    if not file_obj:
        return {}
    
    try:
        filename = file_obj.name
        file_ext = os.path.splitext(filename)[1].lstrip('.').lower()
        
        return {
            'name': filename,
            'size': file_obj.size,
            'size_display': get_file_size_display(file_obj),
            'extension': file_ext,
        }
    except Exception:
        return {}
