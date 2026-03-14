from django.conf import settings
from django.shortcuts import render
from django.http import Http404
from django.views import View

from news.models import NewsArticle


class ArticleShareProxyView(View):
    """
    Returns an HTML page with Open Graph <meta> tags for social media
    crawlers (WhatsApp, Facebook, Twitter).

    Handles two URL formats:
    - /api/v1/share/<slug>/          → looks up by slug
    - /api/v1/share/<id>-<x>-<y>/   → looks up by numeric ID prefix

    Any client that executes Javascript or supports <meta http-equiv="refresh">
    (i.e., real human browsers) will be redirected to the actual React article URL.
    """

    def get(self, request, slug, *args, **kwargs):
        article = None

        # First, try slug lookup
        try:
            article = NewsArticle.objects.get(slug=slug, status="PUBLISHED")
        except NewsArticle.DoesNotExist:
            pass

        # Fallback: slug might be "{id}-{...}" format — extract numeric ID prefix
        if article is None:
            parts = slug.split("-")
            if parts[0].isdigit():
                try:
                    article = NewsArticle.objects.get(pk=int(parts[0]), status="PUBLISHED")
                except NewsArticle.DoesNotExist:
                    pass

        if article is None:
            raise Http404("Article not found or not published")

        # Prefer Gujarati title/summary, fall back to English/Hindi
        title = article.title_gu or article.title_en or article.title_hi or "Kanam Express"
        summary = article.summary_gu or article.summary_en or article.summary_hi or ""

        # Build the Frontend article URL
        frontend_base_url = getattr(settings, "FRONTEND_URL", "https://kanamexpress.com")
        target_url = f"{frontend_base_url.rstrip('/')}/article/{article.slug}"

        # Build the full absolute image URL
        image_url = ""
        if article.featured_image:
            try:
                image_url = request.build_absolute_uri(article.featured_image.url)
            except Exception:
                pass

        context = {
            "title": title,
            "summary": summary,
            "target_url": target_url,
            "image_url": image_url,
            "share_url": request.build_absolute_uri(),  # og:url = this share page
        }

        return render(request, "news/share_proxy.html", context)
