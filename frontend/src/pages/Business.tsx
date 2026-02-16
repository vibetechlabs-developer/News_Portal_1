import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
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
  type ArticleListItem,
  type CategoryItem,
  type SectionItem,
} from '@/lib/api';

const marketData = [
  { name: 'SENSEX', value: '72,456.89', change: '+1.24%', isUp: true },
  { name: 'NIFTY 50', value: '21,890.45', change: '+0.98%', isUp: true },
  { name: 'BANK NIFTY', value: '45,678.12', change: '-0.34%', isUp: false },
  { name: 'USD/INR', value: '83.12', change: '+0.12%', isUp: true },
  { name: 'GOLD', value: '₹62,450', change: '+0.56%', isUp: true },
];

const Business = () => {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');

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
    return () => {
      cancelled = true;
    };
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

        <div className="bg-card rounded-xl p-4 mb-6 shadow-card overflow-x-auto">
          <div className="flex gap-6 min-w-max">
            {marketData.map((item, index) => (
              <div key={index} className="flex items-center gap-3 px-4 py-2 border-r border-border last:border-0">
                <span className="font-medium text-foreground">{item.name}</span>
                <span className="font-bold text-lg">{item.value}</span>
                <span
                  className={`flex items-center gap-1 text-sm font-medium ${item.isUp ? 'text-green-600' : 'text-red-600'}`}
                >
                  {item.isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {item.change}
                </span>
              </div>
            ))}
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
                    {language === 'en' ? 'No business news found.' : 'કોઈ બિઝનેસ સમાચાર મળ્યા નથી.'}
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

export default Business;
