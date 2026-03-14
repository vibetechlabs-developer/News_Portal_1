import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { PageLayout } from '@/components/layout/PageLayout';
import { HeroSection } from '@/components/sections/HeroSection';
import { LeadStory } from '@/components/news/LeadStory';
import { NewsCard } from '@/components/news/NewsCard';
import { TrendingSidebar } from '@/components/news/TrendingSidebar';
import { EditorsPick } from '@/components/sections/EditorsPick';
import { VideoSection } from '@/components/sections/VideoSection';
import { ReelsSection } from '@/components/sections/ReelsSection';
import { YouTubeSection } from '@/components/sections/YouTubeSection';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getArticles,
  getSections,
  getBreakingNews,
  getTopNews,
  getMediaUrl,
  type ArticleListItem,
  type SectionItem,
} from '@/lib/api';

interface GridNewsItem {
  id: number;
  image: string;
  category: string;
  categoryEn: string;
  headline: string;
  headlineEn: string;
  time: string;
  slug?: string;
}

function articleToGridItem(
  a: ArticleListItem,
  sections: SectionItem[],
  language: 'en' | 'gu'
): GridNewsItem {
  const section = sections.find((s) => s.id === a.section);
  // Use district/state name if available, otherwise fall back to section name
  const categoryEn = a.district_name_en || section?.name_en || 'News';
  const categoryGu = a.district_name_gu || a.district_name_en || (section?.name_gu || section?.name_en) || 'સમાચાર';
  const headlineEn = a.title_en ?? '';
  const headlineGu = (a.title_gu || a.title_hi || a.title_en) ?? '';
  const date = a.published_at || a.created_at;
  let time = '';
  if (date) {
    const d = new Date(date);
    time = Number.isFinite(d.getTime())
      ? formatDistanceToNow(d, { addSuffix: true })
      : '';
  }
  return {
    id: a.id,
    image: getMediaUrl(a.featured_image) || 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600',
    category: categoryGu,
    categoryEn,
    headline: language === 'en' ? headlineEn : headlineGu,
    headlineEn,
    time,
    slug: a.slug,
  };
}

const Index = () => {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [topHeadlines, setTopHeadlines] = useState<ArticleListItem[]>([]);
  const [gridNews, setGridNews] = useState<GridNewsItem[]>([]);
  const [breakingNews, setBreakingNews] = useState<ArticleListItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state for Latest News
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [articlesSettled, sectionsSettled, breakingSettled, topSettled] = await Promise.allSettled([
          getArticles({ page: 1, page_size: 10, ordering: "-updated_at" }),
          getSections(),
          getBreakingNews(),
          getTopNews(),
        ]);
        if (cancelled) return;

        const sectionsRes = sectionsSettled.status === 'fulfilled' ? sectionsSettled.value : [];
        const sectionsData = Array.isArray(sectionsRes) ? sectionsRes : [];
        setSections(sectionsData);

        const breakingRes = breakingSettled.status === 'fulfilled' ? breakingSettled.value : [];
        const breakingData = Array.isArray(breakingRes) ? breakingRes : [];
        setBreakingNews(breakingData.slice(0, 1));

        const topRes = topSettled.status === 'fulfilled' ? topSettled.value : [];
        setTopHeadlines(Array.isArray(topRes) ? topRes.slice(0, 4) : []);

        if (articlesSettled.status === 'rejected') {
          throw articlesSettled.reason;
        }

        const articlesRes = articlesSettled.value;
        const results = Array.isArray(articlesRes?.results) ? articlesRes.results : [];

        // Initial load stores exactly page 1
        setArticles(results);
        const lang = language === 'en' ? 'en' : 'gu';
        setGridNews(results.map((a) => articleToGridItem(a, sectionsData, lang)));
        setHasMore(!!articlesRes?.next);
      } catch (err) {
        console.error('Failed to fetch articles:', err);
        if (!cancelled) {
          setError(
            language === 'en'
              ? 'Unable to load latest news.'
              : 'નવીનતમ સમાચાર લોડ કરી શકાયા નથી.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [language]);

  const loadMoreArticles = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await getArticles({ page: nextPage, page_size: 10, ordering: "-updated_at" });
      const newResults = Array.isArray(res?.results) ? res.results : [];

      if (newResults.length > 0) {
        const lang = language === 'en' ? 'en' : 'gu';
        const newGridItems = newResults.map((a) => articleToGridItem(a, sections, lang));

        setArticles(prev => [...prev, ...newResults]);
        setGridNews(prev => [...prev, ...newGridItems]);
        setPage(nextPage);
      }

      setHasMore(!!res?.next);
    } catch (err) {
      console.error('Failed to load more articles:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Basic SEO: set page title per language
  useEffect(() => {
    if (language === 'en') {
      document.title = 'Kanam Express - Latest Gujarat & National News';
    } else {
      document.title = 'કણમ એક્સપ્રેસ - તાજા સમાચાર';
    }
  }, [language]);

  const getSectionName = (sectionId: number) => {
    const s = sections.find((x) => x.id === sectionId);
    return language === 'en' ? (s?.name_en ?? 'News') : (s?.name_gu || s?.name_en) ?? 'સમાચાર';
  };

  const leadArticle = breakingNews[0] || articles[0] || null;

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Heading (visually subtle, good for SEO/a11y) */}
        <h1 className="sr-only">
          {language === 'en'
            ? 'Latest news, top stories and breaking headlines'
            : 'તાજા સમાચાર, મુખ્ય હેડલાઇન્સ અને બ્રેકિંગ ન્યૂઝ'}
        </h1>

        {/* Hero Section: Top 3 headlines */}
        {topHeadlines.length >= 1 ? (
          <HeroSection
            articles={topHeadlines}
            getSectionName={getSectionName}
          />
        ) : leadArticle ? (
          <LeadStory
            href={leadArticle.slug ? `/article/${leadArticle.slug}` : '/latest'}
            image={getMediaUrl(leadArticle.featured_image) || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200'}
            category={
              leadArticle.section
                ? (sections.find((s) => s.id === leadArticle.section)?.name_en ?? 'News')
                : language === 'en'
                  ? 'Breaking'
                  : 'બ્રેકિંગ'
            }
            headline={
              language === 'en'
                ? leadArticle.title_en ?? ''
                : (leadArticle.title_gu ||
                  leadArticle.title_hi ||
                  leadArticle.title_en ||
                  '')
            }
            excerpt={
              language === 'en'
                ? leadArticle.summary_en || ''
                : leadArticle.summary_gu || leadArticle.summary_hi || leadArticle.summary_en || ''
            }
            author={language === 'en' ? 'Kanam Express Bureau' : 'કાનમ એક્સપ્રેસ બ્યુરો'}
            time={
              (() => {
                const date = leadArticle.published_at || leadArticle.created_at;
                if (!date) return language === 'en' ? 'Just now' : 'હમણાં જ';
                const d = new Date(date);
                return Number.isFinite(d.getTime())
                  ? formatDistanceToNow(d, { addSuffix: true })
                  : (language === 'en' ? 'Just now' : 'હમણાં જ');
              })()
            }
          />
        ) : null}

        {/* Optional error message */}
        {error && (
          <p className="mt-4 text-sm text-red-500">
            {error}
          </p>
        )}

        {/* Latest News Grid Heading */}
        <div className="mt-8 mb-6 flex items-center justify-between">
          <h2 className="section-title">
            {language === 'en' ? 'Latest News' : 'નવીનતમ સમાચાર'}
          </h2>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main News Column */}
          <div className="lg:col-span-2">
            {loading ? (
              // Loading skeletons for better UX
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="animate-pulse rounded-xl border border-border bg-card"
                  >
                    <div className="aspect-[16/9] bg-muted rounded-t-xl" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-muted rounded w-24" />
                      <div className="h-5 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {!error && gridNews.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card p-6">
                    <p className="text-sm text-muted-foreground">
                      {language === 'en'
                        ? 'No news is available right now.'
                        : 'હમણાં કોઈ સમાચાર ઉપલબ્ધ નથી.'}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {language === 'en'
                        ? 'To show news on the Home page, add at least 1 article with Status = PUBLISHED in the backend.'
                        : 'હોમ પેજ પર સમાચાર જોવા માટે, બેકએન્ડમાં ઓછામાં ઓછો 1 આર્ટિકલ Status = PUBLISHED સાથે ઉમેરો.'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* 4 Big Vertical Cards - TOP */}
                    {gridNews.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {gridNews.slice(0, 4).map((news, index) => (
                          <NewsCard
                            key={news.id ?? index}
                            image={news.image}
                            category={language === 'en' ? news.categoryEn : news.category}
                            headline={language === 'en' ? news.headlineEn : news.headline}
                            time={news.time}
                            href={news.slug ? `/article/${news.slug}` : undefined}
                          />
                        ))}
                      </div>
                    )}

                    {/* 5 Horizontal Cards - BELOW */}
                    {gridNews.length > 4 && (
                      <div className="mt-6 space-y-4">
                        {gridNews.slice(4, 9).map((news, index) => (
                          <NewsCard
                            key={`horizontal-${news.id ?? index}`}
                            image={news.image}
                            category={language === 'en' ? news.categoryEn : news.category}
                            headline={language === 'en' ? news.headlineEn : news.headline}
                            time={news.time}
                            variant="horizontal"
                            href={news.slug ? `/article/${news.slug}` : undefined}
                          />
                        ))}
                      </div>
                    )}

                    {/* View All Button */}
                    <div className="mt-8 flex justify-center">
                      <Link
                        to="/latest"
                        className="flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        {language === 'en' ? 'View All News' : 'તમામ સમાચાર જુઓ'}
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Editor's Pick */}
                    {gridNews.length > 0 && <EditorsPick />}
                  </>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <TrendingSidebar />
          </div>
        </div>

        {/* Video Section */}
        <VideoSection />

        {/* Reels Section - Only uploaded video files */}
        <ReelsSection />

        {/* YouTube Section - Only YouTube videos */}
        <YouTubeSection />
      </div>
    </PageLayout>
  );
};

export default Index;
