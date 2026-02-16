import { useState, useEffect } from 'react';
import { Cpu, Smartphone, Globe, Zap, Shield, Bot } from 'lucide-react';
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

const Technology = () => {
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
          getArticlesBySection('technology', {
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
          }),
          getCategories(),
        ]);
        if (cancelled) return;
        setArticles(articlesRes.results ?? []);
        setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
      } catch (error) {
        console.error('Failed to fetch Technology news:', error);
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
    if (!categoryId) return language === 'en' ? 'Technology' : 'ટેકનોલોજી';
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return language === 'en' ? 'Technology' : 'ટેકનોલોજી';
    return language === 'en' ? cat.name_en : (cat.name_gu || cat.name_hi || cat.name_en);
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-primary via-primary/95 to-accent/90 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Cpu className="w-8 h-8 text-primary-foreground" />
            <h1 className="headline-primary text-primary-foreground">
              {language === 'en' ? 'Technology' : 'ટેકનોલોજી'}
            </h1>
          </div>
          <p className="text-primary-foreground/80 max-w-2xl">
            {language === 'en'
              ? 'Latest in AI, gadgets, startups, and digital innovation'
              : 'AI, ગેજેટ્સ, સ્ટાર્ટઅપ અને ડિજિટલ ઇનોવેશનમાં તાજેતરનું'}
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === 'all'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30'
              }`}
            >
              <Cpu className="w-4 h-4" />
              {language === 'en' ? 'All' : 'બધા'}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === cat.id
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30'
                }`}
              >
                {language === 'en' ? cat.name_en : (cat.name_gu || cat.name_hi || cat.name_en)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Bot, label: 'AI Tools', value: '2.5K+', color: 'text-blue-500' },
            { icon: Smartphone, label: 'New Gadgets', value: '150+', color: 'text-green-500' },
            { icon: Zap, label: 'Startups Funded', value: '$2.1B', color: 'text-yellow-500' },
            { icon: Shield, label: 'Security Alerts', value: '24', color: 'text-red-500' },
          ].map((stat, index) => (
            <div key={index} className="bg-card rounded-xl p-4 shadow-card text-center">
              <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                {language === 'en' ? 'Loading...' : 'લોડ થઈ રહ્યું છે...'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                    {language === 'en' ? 'No technology news found.' : 'કોઈ ટેકનોલોજી સમાચાર મળ્યા નથી.'}
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

export default Technology;
