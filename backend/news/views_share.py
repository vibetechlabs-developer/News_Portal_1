from django.conf import settings
from django.shortcuts import render, get_object_or_404
from django.views import View

from news.models import NewsArticle

class ArticleShareProxyView(View):
    """
    Returns an HTML page with Open Graph `<meta>` tags for social media 
    crawlers (WhatsApp, Facebook, Twitter).
    
    Any client that executes Javascript or supports `<meta http-equiv="refresh">` 
    (i.e., real human browsers) will instantly be redirected to the actual 
    React Frontend article URL.
    """
    def get(self, request, slug, *args, **kwargs):
        article = get_object_or_404(NewsArticle, slug=slug, status="PUBLISHED")
        
        # Decide which title/summary to show based on what exists (prioritize Gujarati)
        title = article.title_gu or article.title_en or article.title_hi
        summary = article.summary_gu or article.summary_en or article.summary_hi or ""
        
        # Build the exact Frontend URL we want users to be redirected to
        frontend_base_url = getattr(settings, "FRONTEND_URL", "https://kanamexpress.com")
        target_url = f"{frontend_base_url.rstrip('/')}/article/{slug}"
        
        # Determine the Open Graph Image URL
        image_url = ""
        if article.featured_image:
            image_url = request.build_absolute_uri(article.featured_image.url)
        
        context = {
            "title": title,
            "summary": summary,
            "target_url": target_url,
            "image_url": image_url,
        }
        
        return render(request, "news/share_proxy.html", context)
