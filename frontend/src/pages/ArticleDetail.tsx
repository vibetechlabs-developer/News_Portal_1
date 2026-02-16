import { useEffect, useMemo, useRef } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

import { PageLayout } from "@/components/layout/PageLayout";
import { NewsCard } from "@/components/news/NewsCard";
import { VideoPlayer } from "@/components/news/VideoPlayer";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getArticleBySlug,
  getRelatedArticles,
  getMediaUrl,
  trackArticleView,
  type ArticleListItem,
} from "@/lib/api";

function getTitle(article: ArticleListItem, language: string) {
  if (language === "en") return article.title_en;
  return article.title_gu || article.title_hi || article.title_en;
}

function getSummary(article: ArticleListItem, language: string) {
  if (language === "en") return article.summary_en || "";
  return article.summary_gu || article.summary_hi || article.summary_en || "";
}

function getContent(article: ArticleListItem, language: string) {
  if (language === "en") return article.content_en || "";
  return article.content_gu || article.content_hi || article.content_en || "";
}

function getVideoMedia(article: ArticleListItem) {
  const media = article.media ?? [];
  return media.find(
    (m) =>
      (m.media_type === "VIDEO" || m.media_type === "REEL" || m.media_type === "YOUTUBE") &&
      (m.youtube_url || m.file || m.image)
  ) ?? null;
}

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const trackedRef = useRef<string | null>(null);
  const autoplay = searchParams.get("autoplay") === "1";

  const articleQuery = useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
      if (!slug) return null;
      return getArticleBySlug(slug);
    },
    enabled: Boolean(slug),
  });

  const relatedQuery = useQuery({
    queryKey: ["article", slug, "related"],
    queryFn: async () => {
      if (!slug) return [];
      return getRelatedArticles(slug);
    },
    enabled: Boolean(slug),
  });

  // Track view once per slug (best-effort; doesn't block rendering).
  useEffect(() => {
    if (!slug) return;
    if (trackedRef.current === slug) return;
    if (!articleQuery.data) return;
    trackedRef.current = slug;
    trackArticleView(slug).catch(() => {
      // non-critical
    });
  }, [slug, articleQuery.data]);

  const article = articleQuery.data;
  const title = useMemo(() => (article ? getTitle(article, language) : ""), [article, language]);
  const summary = useMemo(() => (article ? getSummary(article, language) : ""), [article, language]);
  const content = useMemo(() => (article ? getContent(article, language) : ""), [article, language]);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link to="/" className="text-sm font-medium text-primary hover:underline">
            ← {language === "en" ? "Back to Home" : "હોમ પર પાછા"}
          </Link>
          {article && (
            <div className="text-xs text-muted-foreground">
              {article.published_at
                ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true })
                : formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
            </div>
          )}
        </div>

        {articleQuery.isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            {language === "en" ? "Loading..." : "લોડ થઈ રહ્યું છે..."}
          </div>
        ) : articleQuery.isError ? (
          <div className="text-center py-12 text-muted-foreground">
            {language === "en" ? "Failed to load article." : "આર્ટિકલ લોડ થઈ શક્યું નથી."}
          </div>
        ) : !article ? (
          <div className="text-center py-12 text-muted-foreground">
            {language === "en" ? "Article not found." : "આર્ટિકલ મળ્યું નથી."}
          </div>
        ) : (
          <>
            <article className="mx-auto max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                {title}
              </h1>

              {summary ? (
                <p className="mt-4 text-lg text-muted-foreground">
                  {summary}
                </p>
              ) : null}

              {getVideoMedia(article) ? (
                <div className="mt-6">
                  <VideoPlayer
                    media={getVideoMedia(article)!}
                    playing={autoplay}
                  />
                </div>
              ) : article.featured_image ? (
                <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
                  <img
                    src={getMediaUrl(article.featured_image)}
                    alt={title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              ) : null}

              <div className="mt-6 whitespace-pre-line text-foreground leading-7">
                {content}
              </div>
            </article>

            {/* Related */}
            <section className="mt-12">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="section-title">
                  {language === "en" ? "Related" : "સંબંધિત"}
                </h2>
              </div>

              {relatedQuery.isLoading ? (
                <div className="text-sm text-muted-foreground">
                  {language === "en" ? "Loading..." : "લોડ થઈ રહ્યું છે..."}
                </div>
              ) : relatedQuery.data?.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedQuery.data.slice(0, 6).map((a) => (
                    <NewsCard
                      key={a.id}
                      image={
                        getMediaUrl(a.featured_image) ||
                        "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600"
                      }
                      category=""
                      headline={getTitle(a, language)}
                      time={
                        a.published_at
                          ? formatDistanceToNow(new Date(a.published_at), { addSuffix: true })
                          : formatDistanceToNow(new Date(a.created_at), { addSuffix: true })
                      }
                      href={`/article/${a.slug}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {language === "en" ? "No related articles." : "કોઈ સંબંધિત આર્ટિકલ નથી."}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </PageLayout>
  );
}

