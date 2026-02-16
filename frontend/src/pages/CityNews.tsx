import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, MapPin, Clock, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getArticlesBySection, type ArticleListItem } from '@/lib/api';
import { useSections, useDistricts } from '@/hooks/useNewsApi';

// City / district metadata used for `/national/:city`, `/international/:city`
// Gujarat districts now come dynamically from the backend `District` API; entries
// below are for non-Gujarat regions only (plus optional fallback).
const cityData: Record<string, { name: string; nameGu: string; region: string; sectionSlug: 'gujarat' | 'national' | 'international' }> = {
  // National cities
  'delhi': { name: 'Delhi', nameGu: 'દિલ્હી', region: 'national', sectionSlug: 'national' },
  'mumbai': { name: 'Mumbai', nameGu: 'મુંબઈ', region: 'national', sectionSlug: 'national' },
  'bangalore': { name: 'Bangalore', nameGu: 'બેંગલુરુ', region: 'national', sectionSlug: 'national' },
  'chennai': { name: 'Chennai', nameGu: 'ચેન્નાઈ', region: 'national', sectionSlug: 'national' },
  'kolkata': { name: 'Kolkata', nameGu: 'કોલકાતા', region: 'national', sectionSlug: 'national' },
  'hyderabad': { name: 'Hyderabad', nameGu: 'હૈદરાબાદ', region: 'national', sectionSlug: 'national' },
  'pune': { name: 'Pune', nameGu: 'પુણે', region: 'national', sectionSlug: 'national' },
  'jaipur': { name: 'Jaipur', nameGu: 'જયપુર', region: 'national', sectionSlug: 'national' },
  'lucknow': { name: 'Lucknow', nameGu: 'લખનૌ', region: 'national', sectionSlug: 'national' },
  'kanpur': { name: 'Kanpur', nameGu: 'કાનપુર', region: 'national', sectionSlug: 'national' },

  // International cities
  'usa': { name: 'USA', nameGu: 'અમેરિકા', region: 'international', sectionSlug: 'international' },
  'uk': { name: 'UK', nameGu: 'યુકે', region: 'international', sectionSlug: 'international' },
  'dubai': { name: 'Dubai', nameGu: 'દુબઈ', region: 'international', sectionSlug: 'international' },
  'singapore': { name: 'Singapore', nameGu: 'સિંગાપોર', region: 'international', sectionSlug: 'international' },
  'australia': { name: 'Australia', nameGu: 'ઓસ્ટ્રેલિયા', region: 'international', sectionSlug: 'international' },
  'canada': { name: 'Canada', nameGu: 'કેનેડા', region: 'international', sectionSlug: 'international' },
  'china': { name: 'China', nameGu: 'ચીન', region: 'international', sectionSlug: 'international' },
  'japan': { name: 'Japan', nameGu: 'જાપાન', region: 'international', sectionSlug: 'international' },
  'pakistan': { name: 'Pakistan', nameGu: 'પાકિસ્તાન', region: 'international', sectionSlug: 'international' },
  'russia': { name: 'Russia', nameGu: 'રશિયા', region: 'international', sectionSlug: 'international' },
};

const CityNews = () => {
  const { city } = useParams<{ city: string }>();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: sections = [] } = useSections();
  const gujaratSection = sections.find((s) => s.slug === 'gujarat');
  const { data: gujaratDistricts = [] } = useDistricts(gujaratSection?.id);

  const gujaratCityMap = useMemo(() => {
    const map: Record<string, { name: string; nameGu: string; region: string; sectionSlug: 'gujarat' }> = {};
    gujaratDistricts.forEach((d) => {
      const slug = d.slug.toLowerCase();
      map[slug] = {
        name: d.name_en,
        nameGu: d.name_gu || d.name_en,
        region: 'gujarat',
        sectionSlug: 'gujarat',
      };
    });
    return map;
  }, [gujaratDistricts]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!city) return;
        const lowerCity = city.toLowerCase();
        const info = gujaratCityMap[lowerCity] ?? cityData[lowerCity];
        if (!info) {
          setArticles([]);
          return;
        }
        setLoading(true);
        const res = await getArticlesBySection(info.sectionSlug, {
          search: searchQuery || info.name,
        });
        if (cancelled) return;
        setArticles(res.results ?? []);
      } catch (error) {
        console.error('Failed to fetch city news:', error);
        if (!cancelled) setArticles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [city, searchQuery]);

  const cityInfo = city
    ? (gujaratCityMap[city.toLowerCase()] ?? cityData[city.toLowerCase()] ?? null)
    : null;
  const cityName = cityInfo 
    ? (language === 'en' ? cityInfo.name : cityInfo.nameGu)
    : city || 'City';

  const filteredNews = articles.filter(article => {
    const headline =
      language === 'en'
        ? article.title_en ?? ''
        : article.title_gu || article.title_hi || article.title_en || '';
    return headline.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getBackLink = () => {
    if (cityInfo?.region === 'national') return '/national';
    if (cityInfo?.region === 'international') return '/international';
    return '/gujarat';
  };

  return (
    <PageLayout showTicker={true}>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center bg-primary rounded-full">
              <MapPin className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {cityName}
              </h1>
              <Link to={getBackLink()} className="text-primary text-sm hover:underline">
                ← {language === 'en' ? 'Back to all news' : 'પાછા જાઓ'}
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={language === 'en' ? `Search ${cityName} news...` : `${cityName} સમાચાર શોધો...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 rounded-full border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            {language === 'en' ? 'Loading...' : 'લોડ થઈ રહ્યું છે...'}
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {language === 'en' ? 'No news found' : 'કોઈ સમાચાર મળ્યા નથી'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((article) => (
              <Link key={article.id} to={`/article/${article.slug}`} className="news-card group cursor-pointer">
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={article.featured_image || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600'}
                    alt={language === 'en' ? article.title_en : (article.title_gu || article.title_hi || article.title_en)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {cityName}
                  </span>
                  <h3 className="headline-card text-foreground group-hover:text-primary transition-colors mt-2 line-clamp-2">
                    {language === 'en'
                      ? article.title_en
                      : article.title_gu || article.title_hi || article.title_en}
                  </h3>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(
                      new Date(article.published_at || article.created_at),
                      { addSuffix: true }
                    )}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default CityNews;
