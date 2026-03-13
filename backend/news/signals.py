"""
Django signals for the news app.

When a VideoContent, ReelContent or Media (VIDEO/REEL) instance is saved
with a file but no thumbnail, we automatically extract the first video frame
and save it as the thumbnail using OpenCV.

This runs *after* the DB row is committed and the file exists on disk,
so there is no timing issue with Django's file upload pipeline.
"""

import logging
import os

from django.db.models.signals import post_save
from django.dispatch import receiver

logger = logging.getLogger(__name__)


def _auto_thumb(instance, prefix: str):
    """
    Core helper: extract first frame from instance.file with OpenCV and
    save it to instance.thumbnail (direct DB update, no .save() recursion).
    """
    if not instance.file:
        return
    if instance.thumbnail:
        return  # Already has a thumbnail — leave it alone

    try:
        file_field = instance.file

        # Resolve to an absolute path on disk
        if hasattr(file_field, "path") and file_field.path and os.path.exists(file_field.path):
            video_path = file_field.path
        else:
            logger.warning(f"[auto_thumb] File not yet on disk for {prefix}_{instance.pk}: {getattr(file_field, 'name', '?')}")
            return

        from utils.video_helpers import generate_video_thumbnail
        from django.core.files.storage import default_storage

        thumb_bytes = generate_video_thumbnail(file_field)
        if not thumb_bytes:
            logger.warning(f"[auto_thumb] OpenCV returned nothing for {prefix}_{instance.pk}")
            return

        filename = f"auto_thumbs/{prefix}_{instance.pk}.jpg"
        saved_path = default_storage.save(filename, thumb_bytes)

        # Update the thumbnail field directly in DB to avoid calling save() again
        instance.__class__.objects.filter(pk=instance.pk).update(thumbnail=saved_path)
        # Refresh in-memory attribute so the response is accurate
        instance.thumbnail.name = saved_path
        logger.info(f"[auto_thumb] Saved thumbnail for {prefix}_{instance.pk} → {saved_path}")

    except Exception as exc:
        logger.error(f"[auto_thumb] Failed for {prefix}_{instance.pk}: {exc}", exc_info=True)


# ── VideoContent ──────────────────────────────────────────────────────────────

@receiver(post_save, sender="news.VideoContent")
def on_video_content_saved(sender, instance, created, **kwargs):
    if "thumbnail" in (kwargs.get("update_fields") or []):
        return  # Avoid reacting to our own thumbnail update
    _auto_thumb(instance, "video")


# ── ReelContent ───────────────────────────────────────────────────────────────

@receiver(post_save, sender="news.ReelContent")
def on_reel_content_saved(sender, instance, created, **kwargs):
    if "thumbnail" in (kwargs.get("update_fields") or []):
        return
    _auto_thumb(instance, "reel")


# ── Media (VIDEO / REEL types) ────────────────────────────────────────────────

@receiver(post_save, sender="news.Media")
def on_media_saved(sender, instance, created, **kwargs):
    if "thumbnail" in (kwargs.get("update_fields") or []):
        return
    from news.models import MediaType
    if instance.media_type not in [MediaType.VIDEO, MediaType.REEL]:
        return
    _auto_thumb(instance, "media")
