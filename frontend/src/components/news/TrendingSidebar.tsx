import { useEffect, useState } from 'react';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { NewsCard } from './NewsCard';
import {
  getMostRead,
  getTopNews,
  getArticles,
  getMediaUrl,
  getAdvertisements,
  type ArticleListItem,
  type Advertisement,
} from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { CricketLiveWidget } from './CricketLiveWidget';

export function TrendingSidebar() {
  const { t, language } = useLanguage();

  const [trendingArticles, setTrendingArticles] = useState<ArticleListItem[]>([]);
  const [latestNews, setLatestNews] = useState<ArticleListItem[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [latestLoading, setLatestLoading] = useState(true);
  const [ad, setAd] = useState<Advertisement | null>(null);

  // Fetch trending articles (same logic as Trending.tsx)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setTrendingLoading(true);
        
        // 1) Primary source: backend "most read" endpoint (true trending by views)
        try {
          const mostRead = await getMostRead({ limit: 5, days: 7 });
          if (cancelled) return;

          if (Array.isArray(mostRead) && mostRead.length > 0) {
            setTrendingArticles(mostRead.slice(0, 5));
            if (!cancelled) setTrendingLoading(false);
            return;
          }
        } catch (err) {
          console.warn("getMostRead failed, falling back to top/latest articles:", err);
        }

        // 2) Secondary fallback: editor-curated "top" news
        try {
          const topNews = await getTopNews();
          if (cancelled) return;

          if (Array.isArray(topNews) && topNews.length > 0) {
            setTrendingArticles(topNews.slice(0, 5));
            if (!cancelled) setTrendingLoading(false);
            return;
          }
        } catch (err) {
          console.warn("getTopNews failed, falling back to latest articles:", err);
        }

        // 3) Final fallback: latest published articles as "trending"
        const latest = await getArticles({ page: 1, status: "PUBLISHED" });
        if (cancelled) return;
        const results = Array.isArray(latest.results) ? latest.results : [];
        setTrendingArticles(results.slice(0, 5));
      } catch (e) {
        console.error("Failed to fetch trending:", e);
        if (!cancelled) {
          setTrendingArticles([]);
        }
      } finally {
        if (!cancelled) setTrendingLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch latest news articles
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLatestLoading(true);
        const latest = await getArticles({ page: 1, status: "PUBLISHED" });
        if (cancelled) return;
        const results = Array.isArray(latest.results) ? latest.results : [];
        setLatestNews(results.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch latest news:', err);
        if (!cancelled) {
          setLatestNews([]);
        }
      } finally {
        if (!cancelled) setLatestLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch advertisements
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const adsRes = await getAdvertisements({ placement: "SIDEBAR_RIGHT" });
        if (cancelled) return;
        const firstAd = Array.isArray(adsRes) && adsRes.length > 0 ? adsRes[0] : null;
        setAd(firstAd);
      } catch (err) {
        console.error('Failed to fetch advertisements:', err);
        if (!cancelled) {
          setAd(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getArticleTitle = (article: ArticleListItem) => {
    if (language === 'en') return article.title_en;
    return article.title_gu || article.title_hi || article.title_en;
  };

  const formatTime = (article: ArticleListItem) => {
    const date = article.published_at || article.created_at;
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <aside className="space-y-8">
      {/* Live Cricket Widget */}
      <CricketLiveWidget />

      {/* Trending Articles */}
      <div className="bg-card rounded-xl p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="section-title text-lg">{t('trending')}</h3>
          </div>
          <Link to="/trending" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
            {language === 'gu' ? 'બધા જુઓ' : 'View All'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div>
          {trendingLoading ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              {t('loading')}
            </div>
          ) : trendingArticles.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              {t('no_trending_topics')}
            </div>
          ) : (
            trendingArticles.map((article, index) => (
              <div
                key={article.id}
                className="flex items-center gap-3 py-2 border-b border-border last:border-0"
              >
                <span className="w-6 h-6 flex items-center justify-center bg-primary/10 text-primary text-xs font-bold rounded flex-shrink-0">
                  {index + 1}
                </span>
                <Link
                  to={`/article/${article.slug}`}
                  className="flex-1 font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
                >
                  {getArticleTitle(article)}
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Latest News */}
      <div className="bg-card rounded-xl p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title text-lg">{t('latest_news')}</h3>
          <Link to="/latest" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
            {language === 'gu' ? 'બધા જુઓ' : 'View All'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div>
          {latestLoading ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              {t('loading')}
            </div>
          ) : latestNews.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              {t('no_news_available')}
            </div>
          ) : (
            latestNews.map((article) => (
              <NewsCard
                key={article.id}
                image={
                  getMediaUrl(article.featured_image) ||
                  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'
                }
                category=""
                headline={getArticleTitle(article)}
                time={formatTime(article)}
                variant="compact"
                href={`/article/${article.slug}`}
              />
            ))
          )}
        </div>
      </div>

      {/* Ad Space */}
      <div className="bg-secondary rounded-xl p-6 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          {language === 'en' ? 'Advertisement' : 'જાહેરાત'}
        </p>
        {ad ? (
          <a
            href={ad.target_url ?? '#'}
            target={ad.target_url ? '_blank' : undefined}
            rel={ad.target_url ? 'noopener noreferrer' : undefined}
            className="block"
          >
            {ad.ad_type === 'HTML' && ad.html_snippet ? (
              <div
                className="rounded-lg overflow-hidden bg-background text-left"
                dangerouslySetInnerHTML={{ __html: ad.html_snippet }}
              />
            ) : ad.image ? (
              <div className="aspect-[4/5] rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                <img
                  src={getMediaUrl(ad.image)}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[4/5] bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">{ad.title}</span>
              </div>
            )}
          </a>
        ) : (
          <div className="aspect-[4/5] bg-muted rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground">Ad Space</span>
          </div>
        )}
      </div>
    </aside>
  );
}
