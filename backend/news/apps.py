from django.apps import AppConfig


class NewsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "news"

    def ready(self):
        # Register HEIC format with Pillow so ImageFields accept iOS uploads natively
        try:
            from pillow_heif import register_heif_opener
            register_heif_opener()
        except ImportError:
            pass

        import news.signals  # noqa: F401 – wires post_save signals
