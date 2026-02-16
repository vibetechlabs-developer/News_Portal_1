import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';
import { NewsCard } from '@/components/news/NewsCard';
import { getTopNews, getMediaUrl, type ArticleListItem } from '@/lib/api';

export function EditorsPick() {
  const { t, language } = useLanguage();
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getTopNews();
        if (cancelled) return;
        setArticles(Array.isArray(data) ? data.slice(0, 3) : []);
      } catch (err) {
        console.error('Failed to fetch editor picks:', err);
        if (!cancelled) setArticles([]);
      } finally {
        if (!cancelled) setLoading(false);
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

  const getExcerpt = (article: ArticleListItem) => {
    if (language === 'en') return article.summary_en || '';
    return article.summary_gu || article.summary_hi || article.summary_en || '';
  };

  const formatTime = (article: ArticleListItem) => {
    const date = article.published_at || article.created_at;
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <section className="py-8">
      <div className="flex items-center gap-2 mb-6">
        <Star className="w-5 h-5 text-accent fill-accent" />
        <h2 className="section-title">{t('editors_pick')}</h2>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground text-center py-4">
          {t('loading')}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-4">
          {t('no_news_available')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <NewsCard
              key={article.id}
              image={
                getMediaUrl(article.featured_image) ||
                'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600'
              }
              category={language === 'en' ? 'Top' : t('trending')}
              headline={getArticleTitle(article)}
              excerpt={getExcerpt(article)}
              time={formatTime(article)}
              href={`/article/${article.slug}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
