import { useEffect, useMemo, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { TrendingUp, Clock, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { getMostRead, getTopNews, getArticles, getMediaUrl, type ArticleListItem } from "@/lib/api";

function formatViews(count?: number): string {
  if (!count) return "0";
  if (count < 1000) return String(count);
  if (count < 1_000_000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

const Trending = () => {
  const { language } = useLanguage();
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Primary source: backend "most read" endpoint (true trending by views)
        try {
          const mostRead = await getMostRead({ limit: 20, days: 7 });
          if (cancelled) return;

          if (Array.isArray(mostRead) && mostRead.length > 0) {
            setArticles(mostRead);
            return;
          }
        } catch (err) {
          // Soft-fail and continue to other fallbacks
          console.warn("getMostRead failed, falling back to top/latest articles:", err);
        }

        // 2) Secondary fallback: editor-curated "top" news
        try {
          const topNews = await getTopNews();
          if (cancelled) return;

          if (Array.isArray(topNews) && topNews.length > 0) {
            setArticles(topNews.slice(0, 20));
            return;
          }
        } catch (err) {
          console.warn("getTopNews failed, falling back to latest articles:", err);
        }

        // 3) Final fallback: latest published articles as "trending"
        const latest = await getArticles({ page: 1, status: "PUBLISHED" });
        if (cancelled) return;
        const results = Array.isArray(latest.results) ? latest.results : [];
        setArticles(results.slice(0, 20));
      } catch (e) {
        console.error("Failed to fetch trending:", e);
        if (!cancelled) {
          setArticles([]);
          setError("failed");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const getTitle = useMemo(
    () => (a: ArticleListItem) => {
      if (language === "en") return a.title_en;
      return a.title_gu || a.title_hi || a.title_en;
    },
    [language]
  );

  return (
    <PageLayout showTicker={true}>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 flex items-center justify-center bg-primary rounded-full">
            <TrendingUp className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {language === 'en' ? 'Trending Now' : 'ટ્રેન્ડિંગ'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en' ? 'Most popular stories right now' : 'અત્યારની સૌથી લોકપ્રિય સ્ટોરીઝ'}
            </p>
          </div>
        </div>

        {/* Trending List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              {language === "en" ? "Loading..." : "લોડ થઈ રહ્યું છે..."}
            </div>
          ) : error || articles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {language === "en" ? "No trending news available yet." : "હજુ ટ્રેન્ડિંગ સમાચાર ઉપલબ્ધ નથી."}
            </div>
          ) : (
            articles.map((a, index) => (
              <Link
                key={a.id}
                to={`/article/${a.slug}`}
                className="flex gap-4 md:gap-6 p-4 bg-card rounded-xl shadow-card hover:shadow-elevated transition-shadow group"
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-primary/10 text-primary text-xl font-bold rounded-full">
                  {index + 1}
                </div>

                {/* Image */}
                <div className="flex-shrink-0 w-24 h-20 md:w-40 md:h-28 overflow-hidden rounded-lg">
                  <img
                    src={
                      getMediaUrl(a.featured_image) ||
                      "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600"
                    }
                    alt={getTitle(a)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-lg md:text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {getTitle(a)}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {a.published_at
                        ? formatDistanceToNow(new Date(a.published_at), { addSuffix: true })
                        : formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                    </span>
                    <span className="flex items-center gap-1 text-primary font-medium">
                      <Eye className="w-4 h-4" />
                      {formatViews(a.view_count)}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Trending;
