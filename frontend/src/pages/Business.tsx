import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { PageLayout } from '@/components/layout/PageLayout';
import { NewsCard } from '@/components/news/NewsCard';
import { TrendingSidebar } from '@/components/news/TrendingSidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getArticlesBySection,
  getCategories,
  getSections,
  getMediaUrl,
  getMarketIndices,
  type ArticleListItem,
  type CategoryItem,
  type SectionItem,
  type MarketIndexItem,
} from '@/lib/api';

const Business = () => {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [marketData, setMarketData] = useState<MarketIndexItem[]>([]);
  const [marketLoading, setMarketLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');

  const fetchMarket = async () => {
    setMarketLoading(true);
    try {
      const res = await getMarketIndices();
      setMarketData(res.indices ?? []);
    } catch {
      setMarketData([]);
    } finally {
      setMarketLoading(false);
    }
  };

  useEffect(() => {
    fetchMarket();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [articlesRes, categoriesRes, sectionsRes] = await Promise.all([
          getArticlesBySection('business', {
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
          }),
          getCategories(),
          getSections(),
        ]);
        if (cancelled) return;
        setArticles(articlesRes.results ?? []);
        setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
        setSections(Array.isArray(sectionsRes) ? sectionsRes : []);
      } catch (error) {
        console.error('Failed to fetch Business news:', error);
        if (!cancelled) setArticles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedCategory]);

  const getArticleTitle = (article: ArticleListItem) => {
    if (language === 'en') return article.title_en;
    return article.title_gu || article.title_hi || article.title_en;
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return language === 'en' ? 'Business' : 'બિઝનેસ';
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return language === 'en' ? 'Business' : 'બિઝનેસ';
    return language === 'en' ? cat.name_en : (cat.name_gu || cat.name_hi || cat.name_en);
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="headline-primary text-foreground flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            {language === 'en' ? 'Business & Markets' : 'બિઝનેસ અને માર્કેટ'}
          </h1>
        </div>

        {/* Live Market Indices - powered by Stooq.com via backend proxy */}
        <div className="bg-card rounded-xl p-4 mb-6 shadow-card overflow-x-auto">
          <div className="flex items-center justify-between gap-4 mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {language === 'en' ? 'Live Indices' : 'લાઇવ ઇન્ડેક્સ'}
            </h2>
            <button
              type="button"
              onClick={fetchMarket}
              disabled={marketLoading}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-full transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${marketLoading ? 'animate-spin' : ''}`} />
              {language === 'en' ? 'Refresh' : 'રિફ્રેશ'}
            </button>
          </div>
          <div className="flex gap-6 min-w-max flex-wrap">
            {marketLoading && marketData.length === 0 ? (
              <div className="flex items-center gap-2 py-2 text-muted-foreground text-sm">
                {language === 'en' ? 'Loading live indices...' : 'લાઇવ ઇન્ડેક્સ લોડ થઈ રહ્યું છે...'}
              </div>
            ) : marketData.length === 0 ? (
              <div className="py-2 text-muted-foreground text-sm">
                {language === 'en' ? 'Market data unavailable' : 'માર્કેટ ડેટા ઉપલબ્ધ નથી'}
              </div>
            ) : (
              marketData.map((item, index) => (
                <div
                  key={item.symbol || index}
                  className="flex items-center gap-3 px-4 py-2 border-r border-border last:border-r-0"
                >
                  <span className="font-medium text-foreground text-sm">{item.name}</span>
                  {item.error ? (
                    <span className="text-sm text-muted-foreground">—</span>
                  ) : (
                    <>
                      <span className="font-bold">{item.value ?? '—'}</span>
                      {item.change != null && item.isUp != null && (
                        <span
                          className={`flex items-center gap-1 text-sm font-medium ${
                            item.isUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {item.isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {item.change}
                        </span>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-primary/10'
                }`}
              >
                {language === 'en' ? 'All' : 'બધા'}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedCategory === cat.id ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-primary/10'
                  }`}
                >
                  {language === 'en' ? cat.name_en : (cat.name_gu || cat.name_hi || cat.name_en)}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {language === 'en' ? 'No business news found.' : 'કોઈ બિઝનેસ સમાચાર મળ્યા નથી.'}
              </div>
            ) : (
              <div className="space-y-6">
                {articles.map((article) => (
                  <Link key={article.id} to={`/article/${article.slug}`}>
                    <NewsCard
                      variant="horizontal"
                      image={getMediaUrl(article.featured_image) || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600'}
                      category={language === 'en' ? 'Business' : getCategoryName(article.category ?? null)}
                      headline={getArticleTitle(article) || ''}
                      time={article.published_at
                        ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
                        : ''}
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <TrendingSidebar />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Business;
