import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PageLayout } from "@/components/layout/PageLayout";
import { NewsCard } from "@/components/news/NewsCard";
import { TrendingSidebar } from "@/components/news/TrendingSidebar";
import { AdsSection } from "@/components/layout/AdsSection";
import { GoogleAdSlot } from "@/components/layout/GoogleAdSlot";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getArticlesBySection,
  getMediaUrl,
  getSectionBySlug,
  type ArticleListItem,
  type SectionItem,
} from "@/lib/api";

const SectionPage = () => {
  const { sectionSlug } = useParams<{ sectionSlug: string }>();
  const { language } = useLanguage();

  const [section, setSection] = useState<SectionItem | null>(null);
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!sectionSlug) {
      setLoading(false);
      setError("Section not found");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [sec, articlesRes] = await Promise.all([
          getSectionBySlug(sectionSlug),
          getArticlesBySection(sectionSlug),
        ]);

        if (cancelled) return;

        setSection(sec);
        setArticles(articlesRes.results ?? []);

        if (!sec) {
          setError("Section not found");
        }
      } catch (err) {
        console.error("Section page failed:", err);
        if (!cancelled) setError("Failed to load section");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sectionSlug]);

  const getArticleTitle = (a: ArticleListItem) =>
    language === "en" ? a.title_en : a.title_gu || a.title_hi || a.title_en;

  const sectionName = section
    ? language === "en"
      ? section.name_en
      : section.name_gu || section.name_hi || section.name_en
    : sectionSlug;

  const lead = articles[0];
  const rest = articles.slice(1);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="headline-primary text-foreground">{sectionName}</h1>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            {language === "en" ? "Loading..." : "લોડ થઈ રહ્યું છે..."}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-muted-foreground">
            {language === "en" ? "Section not found." : "વિભાગ મળ્યો નથી."}
            <Link to="/" className="block mt-2 text-primary hover:underline">
              ← Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {lead && (
                <Link to={`/article/${lead.slug}`}>
                  <article className="news-card overflow-hidden rounded-xl border border-border">
                    <div className="aspect-[16/9] overflow-hidden">
                      <img
                        src={
                          getMediaUrl(lead.featured_image) ||
                          "https://via.placeholder.com/800x450"
                        }
                        alt={getArticleTitle(lead)}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6">
                      <h2 className="headline-secondary mt-3">
                        {getArticleTitle(lead)}
                      </h2>
                      {(lead.summary_en || lead.summary_gu) && (
                        <p className="text-muted-foreground mt-3 line-clamp-2">
                          {language === "en"
                            ? lead.summary_en
                            : lead.summary_gu ||
                              lead.summary_hi ||
                              lead.summary_en}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {lead.published_at
                          ? formatDistanceToNow(new Date(lead.published_at), {
                              addSuffix: true,
                            })
                          : formatDistanceToNow(new Date(lead.created_at), {
                              addSuffix: true,
                            })}
                      </div>
                    </div>
                  </article>
                </Link>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {rest.map((article) => (
                  <NewsCard
                    key={article.id}
                    image={
                      getMediaUrl(article.featured_image) ||
                      "https://via.placeholder.com/600x400"
                    }
                    category={sectionName}
                    headline={getArticleTitle(article)}
                    time={
                      article.published_at
                        ? formatDistanceToNow(
                            new Date(article.published_at),
                            { addSuffix: true }
                          )
                        : formatDistanceToNow(new Date(article.created_at), {
                            addSuffix: true,
                          })
                    }
                    href={`/article/${article.slug}`}
                  />
                ))}
              </div>

              {articles.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  {language === "en"
                    ? "No news in this section yet."
                    : "આ વિભાગમાં હજુ સમાચાર નથી."}
                </div>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <TrendingSidebar />
              <GoogleAdSlot placement="SIDEBAR_RIGHT" />
              <AdsSection placement="FOOTER" />
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default SectionPage;

