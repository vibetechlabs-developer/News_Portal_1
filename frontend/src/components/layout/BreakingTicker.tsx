import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getBreakingNews, type ArticleListItem } from '@/lib/api';

export function BreakingTicker() {
  const { t, language } = useLanguage();
  const [items, setItems] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getBreakingNews();
        if (cancelled) return;
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch breaking news:', err);
        if (!cancelled) setError('failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getLocalizedText = (article: ArticleListItem) => {
    if (language === 'en') return article.title_en;
    if (language === 'hi') return article.title_hi || article.title_en;
    return article.title_gu || article.title_hi || article.title_en;
  };

  // If API has no breaking news or failed, don't show static ticker
  if (!loading && (error || items.length === 0)) {
    return null;
  }

  const displayItems = loading
    ? Array.from({ length: 3 }).map((_, idx) => ({
        id: idx,
        title_en: t('loading'),
        title_hi: t('loading'),
        title_gu: t('loading'),
      })) as ArticleListItem[]
    : items;

  return (
    <div className="bg-ticker overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-10">
          {/* Breaking Badge */}
          <div className="flex-shrink-0 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 font-bold text-sm uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 animate-pulse" />
            <span>{t('breaking_news')}</span>
          </div>

          {/* Ticker Content */}
          <div className="relative flex-1 overflow-hidden ml-4">
            <div className="ticker-scroll flex items-center gap-12 whitespace-nowrap">
              {[...displayItems, ...displayItems].map((item, index) =>
                loading || !item.slug ? (
                  <span key={`${item.id}-${index}`} className="text-sm font-medium text-breaking">
                    {getLocalizedText(item)}
                  </span>
                ) : (
                  <Link
                    key={`${item.id}-${index}`}
                    to={`/article/${item.slug}`}
                    className="text-sm font-medium text-breaking cursor-pointer hover:underline block"
                  >
                    {getLocalizedText(item)}
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
