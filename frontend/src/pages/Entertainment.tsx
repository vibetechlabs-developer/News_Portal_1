import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { PageLayout } from '@/components/layout/PageLayout';
import { NewsCard } from '@/components/news/NewsCard';
import { TrendingSidebar } from '@/components/news/TrendingSidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getArticlesBySection,
  getCategories,
  getMediaUrl,
  type ArticleListItem,
  type CategoryItem,
} from '@/lib/api';

const Entertainment = () => {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [articlesRes, categoriesRes] = await Promise.all([
          getArticlesBySection('entertainment', {
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
          }),
          getCategories(),
        ]);
        if (cancelled) return;
        setArticles(articlesRes.results ?? []);
        setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
      } catch (error) {
        console.error('Failed to fetch Entertainment news:', error);
        if (!cancelled) setArticles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedCategory]);

  const getArticleTitle = (article: ArticleListItem) => {
    if (language === 'en') return article.title_en;
    return article.title_gu || article.title_hi || article.title_en;
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return language === 'en' ? 'Entertainment' : 'મનોરંજન';
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return language === 'en' ? 'Entertainment' : 'મનોરંજન';
    return language === 'en' ? cat.name_en : (cat.name_gu || cat.name_hi || cat.name_en);
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-accent/20 via-primary/10 to-accent/20 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-accent" />
            <h1 className="headline-primary text-foreground">
              {language === 'en' ? 'Entertainment' : 'મનોરંજન'}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {language === 'en'
              ? 'Bollywood, Hollywood, TV Shows, Music and more'
              : 'બોલીવુડ, હોલીવુડ, ટીવી શો, સંગીત અને વધુ'}
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-primary/10'
              }`}
            >
              {language === 'en' ? 'All' : 'બધા'}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === cat.id ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-primary/10'
                }`}
              >
                {language === 'en' ? cat.name_en : (cat.name_gu || cat.name_hi || cat.name_en)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                {language === 'en' ? 'Loading...' : 'લોડ થઈ રહ્યું છે...'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {articles.map((article) => (
                  <Link key={article.id} to={`/article/${article.slug}`}>
                    <NewsCard
                      image={getMediaUrl(article.featured_image) || 'https://via.placeholder.com/600x400'}
                      category={getCategoryName(article.category)}
                      headline={getArticleTitle(article)}
                      time={
                        article.published_at
                          ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
                          : formatDistanceToNow(new Date(article.created_at), { addSuffix: true })
                      }
                    />
                  </Link>
                ))}
                {articles.length === 0 && (
                  <p className="col-span-2 text-center py-8 text-muted-foreground">
                    {language === 'en' ? 'No entertainment news found.' : 'કોઈ મનોરંજન સમાચાર મળ્યા નથી.'}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <TrendingSidebar />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Entertainment;
