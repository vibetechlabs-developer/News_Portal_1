import { useState, useEffect, useMemo } from 'react';
import { Globe, Search, X, MapPin } from 'lucide-react';
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

const International = () => {
  const { language } = useLanguage();
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: sectionsData = [] } = useSections();
  const internationalSection = useMemo(() => sectionsData.find((s) => s.slug === 'international'), [sectionsData]);
  const { data: districts = [] } = useDistricts(internationalSection?.id);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [articlesRes, sectionsRes] = await Promise.all([
          getArticlesBySection('international', { 
            search: searchQuery || undefined,
            district: selectedDistrict || undefined,
          }),
          getSections(),
        ]);
        if (cancelled) return;
        setArticles(articlesRes.results ?? []);
        setSections(Array.isArray(sectionsRes) ? sectionsRes : []);
      } catch (error) {
        console.error('Failed to fetch International news:', error);
        if (!cancelled) setArticles([]);
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

  const getSectionName = (sectionId: number) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return language === 'en' ? 'World' : 'વિશ્વ';
    return language === 'en' ? section.name_en : (section.name_gu || section.name_hi || section.name_en);
  };

  const leadArticle = articles[0];
  const otherArticles = articles.slice(1);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-primary" />
              <h1 className="headline-primary text-foreground">
                {language === 'en' ? 'International News' : 'આંતરરાષ્ટ્રીય સમાચાર'}
              </h1>
            </div>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors self-start sm:self-center"
            >
              <Search className="w-4 h-4" />
              <span>{language === 'en' ? 'Search' : 'શોધો'}</span>
            </button>
          </div>
          <p className="text-muted-foreground max-w-2xl mb-4">
            {language === 'en'
              ? 'Breaking news and analysis from around the world'
              : 'વિશ્વભરમાંથી બ્રેકિંગ ન્યૂઝ અને વિશ્લેષણ'}
          </p>
          {showSearch && (
            <div className="relative animate-fade-in mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'en' ? 'Search news...' : 'સમાચાર શોધો...'}
                className="pl-12 pr-12 h-12 text-base border-2 border-primary/20 focus:border-primary bg-background"
                autoFocus
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          )}
          {districts.length > 0 && (
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 min-w-max pb-2">
                <button
                  onClick={() => setSelectedDistrict(null)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
                    selectedDistrict === null
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-foreground hover:bg-primary/10'
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
                        : 'bg-card text-foreground hover:bg-primary/10'
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                {language === 'en' ? 'Loading...' : 'લોડ થઈ રહ્યું છે...'}
              </div>
            ) : (
              <>
                {leadArticle && (
                  <Link to={`/article/${leadArticle.slug}`} className="block mb-6">
                    <article className="news-card overflow-hidden">
                      <div className="aspect-[16/9] overflow-hidden">
                        <img
                          src={getMediaUrl(leadArticle.featured_image) || 'https://via.placeholder.com/800x450'}
                          alt={getArticleTitle(leadArticle)}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                      <div className="p-6">
                        <span className="category-tag">{getSectionName(leadArticle.section)}</span>
                        <h2 className="headline-secondary mt-3">{getArticleTitle(leadArticle)}</h2>
                        {leadArticle.summary_en && (
                          <p className="text-muted-foreground mt-3 line-clamp-2">
                            {language === 'en' ? leadArticle.summary_en : (leadArticle.summary_gu || leadArticle.summary_hi || leadArticle.summary_en)}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                          {leadArticle.published_at || leadArticle.created_at
                            ? formatDistanceToNow(new Date(leadArticle.published_at || leadArticle.created_at), { addSuffix: true })
                            : null}
                        </div>
                      </div>
                    </article>
                  </Link>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {otherArticles.map((article) => (
                    <Link key={article.id} to={`/article/${article.slug}`}>
                      <NewsCard
                        image={getMediaUrl(article.featured_image) || 'https://via.placeholder.com/600x400'}
                        category={getSectionName(article.section)}
                        headline={getArticleTitle(article)}
                        time={
                          article.published_at
                            ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
                            : formatDistanceToNow(new Date(article.created_at), { addSuffix: true })
                        }
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
          <div className="lg:col-span-1">
            <TrendingSidebar />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default International;
