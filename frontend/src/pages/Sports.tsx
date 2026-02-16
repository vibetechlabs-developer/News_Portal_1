import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
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
  getCricketMatches,
  type CricketMatchesResponse,
  type ArticleListItem,
  type CategoryItem,
  type SectionItem,
} from '@/lib/api';

type LiveMatchTeam = {
  name: string;
  score: string;
  flag?: string;
};

type LiveMatch = {
  sport: 'cricket';
  team1: LiveMatchTeam;
  team2: LiveMatchTeam;
  status: string;
  isLive: boolean;
};

function normalizeCricketMatches(payload: CricketMatchesResponse | undefined): LiveMatch[] {
  if (!payload || !Array.isArray(payload.typeMatches)) return [];

  const matches: LiveMatch[] = [];

  for (const tm of payload.typeMatches) {
    if (!tm?.seriesMatches) continue;
    for (const series of tm.seriesMatches) {
      const wrapper = series?.seriesAdWrapper;
      if (!wrapper?.matches) continue;
      for (const m of wrapper.matches) {
        const info = m.matchInfo || {};
        const score = m.matchScore || {};
        const team1Info = info.team1 || {};
        const team2Info = info.team2 || {};
        const t1Inngs = score.team1Score?.inngs1 || {};
        const t2Inngs = score.team2Score?.inngs1 || {};

        const formatScore = (inngs: { runs?: number; wickets?: number; overs?: number | string }): string => {
          const runs = typeof inngs.runs === 'number' ? inngs.runs : undefined;
          const wkts = typeof inngs.wickets === 'number' ? inngs.wickets : undefined;
          const overs =
            typeof inngs.overs === 'number' || typeof inngs.overs === 'string' ? String(inngs.overs) : undefined;

          if (runs == null && wkts == null) return overs ? `(${overs} ov)` : '';
          if (runs != null && wkts != null) {
            return overs ? `${runs}/${wkts} (${overs})` : `${runs}/${wkts}`;
          }
          if (runs != null) {
            return overs ? `${runs} (${overs})` : String(runs);
          }
          return '';
        };

        matches.push({
          sport: 'cricket',
          team1: {
            name: (team1Info.teamSName as string) || (team1Info.teamName as string) || 'Team 1',
            score: formatScore(t1Inngs),
            flag: undefined,
          },
          team2: {
            name: (team2Info.teamSName as string) || (team2Info.teamName as string) || 'Team 2',
            score: formatScore(t2Inngs),
            flag: undefined,
          },
          status: (info.status as string) || (info.state as string) || (info.matchDesc as string) || '',
          isLive: true,
        });
      }
    }
  }

  return matches;
}

const Sports = () => {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [articlesRes, categoriesRes, sectionsRes] = await Promise.all([
          getArticlesBySection('sports', {
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
        console.error('Failed to fetch Sports news:', error);
        if (!cancelled) setArticles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedCategory]);

  useEffect(() => {
    let cancelled = false;

    const loadMatches = async () => {
      try {
        setLiveLoading(true);
        const data = await getCricketMatches();
        if (cancelled) return;
        const normalized = normalizeCricketMatches(data);
        setLiveMatches(normalized.slice(0, 2));
      } catch (err) {
        console.error('Failed to fetch live cricket matches:', err);
        if (!cancelled) setLiveMatches([]);
      } finally {
        if (!cancelled) setLiveLoading(false);
      }
    };

    void loadMatches();
    const intervalId = setInterval(() => {
      void loadMatches();
    }, 60_000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  const getArticleTitle = (article: ArticleListItem) => {
    if (language === 'en') return article.title_en;
    return article.title_gu || article.title_hi || article.title_en;
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return language === 'en' ? 'Sports' : 'રમતગમત';
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return language === 'en' ? 'Sports' : 'રમતગમત';
    return language === 'en' ? cat.name_en : (cat.name_gu || cat.name_hi || cat.name_en);
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-accent" />
            <h1 className="headline-primary text-foreground">
              {language === 'en' ? 'Sports' : 'રમતગમત'}
            </h1>
          </div>
        </div>

        {/* Live Matches - dynamic from cricket API (via backend) */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 mb-8 text-primary-foreground">
          <div className="flex items-center gap-2 mb-4">
            <div className="live-dot bg-accent" />
            <h2 className="font-bold text-lg">
              {language === 'en' ? 'Live Matches' : 'લાઇવ મેચ'}
            </h2>
          </div>
          {liveLoading ? (
            <p className="text-sm opacity-80">{language === 'en' ? 'Loading live matches...' : 'લાઇવ મેચ લોડ થઈ રહી છે...'}</p>
          ) : liveMatches.length === 0 ? (
            <p className="text-sm opacity-80">
              {language === 'en' ? 'No live cricket matches at the moment.' : 'હાલમાં કોઈ લાઇવ ક્રિકેટ મેચ નથી.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveMatches.map((match, index) => (
                <div key={index} className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {match.team1.flag && <span className="text-2xl">{match.team1.flag}</span>}
                      <div>
                        <p className="font-semibold">{match.team1.name}</p>
                        <p className="text-xl font-bold">{match.team1.score}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs uppercase opacity-80">vs</p>
                      <p className="text-sm mt-1 bg-accent text-accent-foreground px-2 py-1 rounded">
                        {match.status || (language === 'en' ? 'Live' : 'લાઇવ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <p className="font-semibold">{match.team2.name}</p>
                        <p className="text-xl font-bold">{match.team2.score}</p>
                      </div>
                      {match.team2.flag && <span className="text-2xl">{match.team2.flag}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Category filter */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
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
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-primary/10'
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
                    {language === 'en' ? 'No sports news found.' : 'કોઈ સ્પોર્ટ્સ સમાચાર મળ્યા નથી.'}
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

export default Sports;
