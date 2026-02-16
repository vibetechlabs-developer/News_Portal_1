import { useState, useEffect, useMemo } from 'react';
import { Search, X, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { PageLayout } from '@/components/layout/PageLayout';
import { NewsCard } from '@/components/news/NewsCard';
import { TrendingSidebar } from '@/components/news/TrendingSidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import {
  getArticlesBySection,
  getSections,
  getMediaUrl,
  type ArticleListItem,
  type SectionItem,
} from '@/lib/api';
import { useSections, useDistricts } from '@/hooks/useNewsApi';

const National = () => {
  const { language } = useLanguage();
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [sidebarLatest, setSidebarLatest] = useState<ArticleListItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: sectionsData = [] } = useSections();
  const nationalSection = useMemo(() => sectionsData.find((s) => s.slug === 'national'), [sectionsData]);
  const { data: districts = [] } = useDistricts(nationalSection?.id);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [articlesRes, sectionsRes, sidebarRes] = await Promise.all([
          getArticlesBySection('national', { 
            search: searchQuery || undefined,
            district: selectedDistrict || undefined,
          }),
          getSections(),
          getArticlesBySection('national').then((r) => r.results?.slice(0, 5) ?? []),
        ]);
        if (cancelled) return;
        setSections(Array.isArray(sectionsRes) ? sectionsRes : []);
        setArticles(articlesRes.results ?? []);
        setSidebarLatest(Array.isArray(sidebarRes) ? sidebarRes : []);
      } catch (error) {
        console.error('Failed to fetch National news:', error);
        if (!cancelled) setArticles([]);
        if (!cancelled) setSidebarLatest([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchQuery, selectedDistrict]);

  const getArticleTitle = (article: ArticleListItem) => {
    if (language === 'en') return article.title_en;
    return article.title_gu || article.title_hi || article.title_en;
  };

  const getArticleSummary = (article: ArticleListItem) => {
    if (language === 'en') return article.summary_en || '';
    return article.summary_gu || article.summary_hi || article.summary_en || '';
  };

  const getSectionName = (sectionId: number) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return language === 'en' ? 'National' : 'રાષ્ટ્રીય';
    return language === 'en' ? section.name_en : (section.name_gu || section.name_hi || section.name_en);
  };

  const leadStory = articles[0];
  const otherNews = articles.slice(1);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="headline-primary text-foreground">
                {language === 'en' ? 'National News' : 'રાષ્ટ્રીય સમાચાર'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {language === 'en' 
                  ? 'Politics, governance, economy and more from across India' 
                  : 'સમગ્ર ભારતમાંથી રાજકારણ, શાસન, અર્થતંત્ર અને વધુ'}
              </p>
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

        {/* District Filter - Horizontal Scroll */}
        {districts.length > 0 && (
          <div className="overflow-x-auto scrollbar-hide mb-8">
            <div className="flex items-center gap-2 min-w-max pb-2">
              <button
                onClick={() => setSelectedDistrict(null)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
                  selectedDistrict === null
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-primary/10'
                }`}
              >
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {language === 'en' ? 'All' : 'બધા'}
                </span>
              </button>
              {districts.map((district) => (
                <button
                  key={district.id}
                  onClick={() => setSelectedDistrict(district.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
                    selectedDistrict === district.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-primary/10'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {language === 'en' ? district.name_en : (district.name_gu || district.name_en)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                {language === 'en' ? 'Loading...' : 'લોડ થઈ રહ્યું છે...'}
              </div>
            ) : (
              <>
                {/* Lead Story */}
                {leadStory && (
                  <Link to={`/article/${leadStory.slug}`}>
                    <article className="news-card overflow-hidden">
                      <div className="aspect-[16/9] overflow-hidden">
                        <img
                          src={getMediaUrl(leadStory.featured_image) || 'https://via.placeholder.com/800x450'}
                          alt={getArticleTitle(leadStory)}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="p-6">
                        <span className="category-tag">{getSectionName(leadStory.section)}</span>
                        <h2 className="headline-secondary mt-3">
                          {getArticleTitle(leadStory)}
                        </h2>
                        {getArticleSummary(leadStory) && (
                          <p className="text-muted-foreground mt-3 line-clamp-2">
                            {getArticleSummary(leadStory)}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {leadStory.published_at 
                            ? formatDistanceToNow(new Date(leadStory.published_at), { addSuffix: true })
                            : formatDistanceToNow(new Date(leadStory.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </article>
                  </Link>
                )}

                {/* News Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {otherNews.map((article) => (
                    <Link key={article.id} to={`/article/${article.slug}`}>
                      <NewsCard
                        image={getMediaUrl(article.featured_image) || 'https://via.placeholder.com/600x400'}
                        category={getSectionName(article.section)}
                        headline={getArticleTitle(article)}
                        time={article.published_at 
                          ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
                          : formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                      />
                    </Link>
                  ))}
                </div>

                {articles.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    {language === 'en' ? 'No news found' : 'કોઈ સમાચાર મળ્યા નથી'}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Latest Updates (from API) */}
            <div className="bg-card rounded-xl p-5 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <div className="live-dot" />
                <h3 className="font-semibold">
                  {language === 'en' ? 'Latest Updates' : 'તાજા અપડેટ્સ'}
                </h3>
              </div>
              <div className="space-y-4">
                {sidebarLatest.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{language === 'en' ? 'No updates yet.' : 'હજુ અપડેટ્સ નથી.'}</p>
                ) : (
                  sidebarLatest.map((item) => (
                    <Link key={item.id} to={`/article/${item.slug}`} className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0 block hover:text-primary transition-colors">
                      <span className="text-xs font-medium text-primary whitespace-nowrap">
                        {item.published_at || item.created_at
                          ? formatDistanceToNow(new Date(item.published_at || item.created_at), { addSuffix: true })
                          : ''}
                      </span>
                      <p className="text-sm text-foreground">
                        {language === 'en' ? item.title_en : (item.title_gu || item.title_hi || item.title_en)}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </div>

            <TrendingSidebar />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default National;

