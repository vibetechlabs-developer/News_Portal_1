import { useState, useEffect } from 'react';
import { Clock, TrendingUp, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { PageLayout } from '@/components/layout/PageLayout';
import { NewsCard } from '@/components/news/NewsCard';
import { TrendingSidebar } from '@/components/news/TrendingSidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import {
  getArticles,
  getSections,
  getCategories,
  getMediaUrl,
  type ArticleListItem,
  type SectionItem,
  type CategoryItem,
} from '@/lib/api';

const LatestNews = () => {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [articlesRes, sectionsRes, categoriesRes] = await Promise.allSettled([
          getArticles({ 
            page: 1,
            status: 'PUBLISHED',
            search: searchQuery || undefined,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
          }),
          getSections(),
          getCategories(),
        ]);

        if (cancelled) return;

        // Articles are required; if that promise failed, surface an error
        if (articlesRes.status === 'rejected') {
          throw articlesRes.reason;
        }

        const articlesData = articlesRes.value;
        setArticles(articlesData.results ?? []);

        // Sections / categories are optional; if they fail, just fall back to empty lists
        const sectionsData = sectionsRes.status === 'fulfilled' ? sectionsRes.value : [];
        const categoriesData = categoriesRes.status === 'fulfilled' ? categoriesRes.value : [];
        setSections(Array.isArray(sectionsData) ? sectionsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error('Failed to fetch latest news:', error);
        if (!cancelled) {
          setArticles([]);
          setError('failed');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchQuery, selectedCategory]);

  const getArticleTitle = (article: ArticleListItem) => {
    if (language === 'en') return article.title_en;
    return article.title_gu || article.title_hi || article.title_en;
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return language === 'en' ? 'News' : 'સમાચાર';
    const category = categories.find(c => c.id === categoryId);
    if (!category) return language === 'en' ? 'News' : 'સમાચાર';
    return language === 'en' ? category.name_en : (category.name_gu || category.name_hi || category.name_en);
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="headline-primary text-foreground">
                  {language === 'en' ? 'Latest News' : 'તાજા સમાચાર'}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {language === 'en' 
                    ? 'Stay updated with the latest happenings' 
                    : 'તાજેતરની ઘટનાઓ સાથે અપડેટ રહો'}
                </p>
              </div>
            </div>
            
            {/* Search Button */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors self-start sm:self-center"
            >
              <Search className="w-4 h-4" />
              <span>{language === 'en' ? 'Search' : 'શોધો'}</span>
            </button>
          </div>

          {/* Search Box */}
          {showSearch && (
            <div className="relative animate-fade-in">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'en' ? 'Search news...' : 'સમાચાર શોધો...'}
                className="pl-12 pr-12 h-12 text-base border-2 border-primary/20 focus:border-primary"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Category Filter - Horizontal Scroll */}
        <div className="overflow-x-auto scrollbar-hide mb-8">
          <div className="flex items-center gap-2 min-w-max pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-primary/10'
              }`}
            >
              {language === 'en' ? 'All' : 'બધા'}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-primary/10'
                }`}
              >
                {language === 'en' ? cat.name_en : (cat.name_gu || cat.name_hi || cat.name_en)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                {language === 'en' ? 'Loading...' : 'લોડ થઈ રહ્યું છે...'}
              </div>
            ) : error ? (
              <div className="text-center py-12 text-muted-foreground">
                {language === 'en'
                  ? 'Unable to load latest news. Please try again later.'
                  : 'નવીનતમ સમાચાર લોડ કરી શકાયા નથી. કૃપા કરીને થોડા સમય પછી ફરી કોશિશ કરો.'}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {articles.map((article) => (
                    <Link key={article.id} to={`/article/${article.slug}`}>
                      <NewsCard
                        image={getMediaUrl(article.featured_image) || 'https://via.placeholder.com/600x400'}
                        category={getCategoryName(article.category)}
                        headline={getArticleTitle(article)}
                        time={article.published_at 
                          ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
                          : formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                      />
                    </Link>
                  ))}
                </div>
                {articles.length === 0 && !searchQuery && selectedCategory === 'all' && (
                  <div className="text-center py-12 text-muted-foreground">
                    {language === 'en'
                      ? 'No latest news available. Please add at least one article with Status = PUBLISHED in the backend.'
                      : 'નવીનતમ સમાચાર ઉપલબ્ધ નથી. કૃપા કરીને બેકએન્ડમાં ઓછામાં ઓછો એક આર્ટિકલ Status = PUBLISHED સાથે ઉમેરો.'}
                  </div>
                )}
                {articles.length === 0 && (searchQuery || selectedCategory !== 'all') && (
                  <div className="text-center py-12 text-muted-foreground">
                    {language === 'en' ? 'No news found' : 'કોઈ સમાચાર મળ્યા નથી'}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <TrendingSidebar />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default LatestNews;
