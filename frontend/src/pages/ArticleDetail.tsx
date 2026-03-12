import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share2, Send, Trash2 } from "lucide-react";

import { PageLayout } from "@/components/layout/PageLayout";
import { NewsCard } from "@/components/news/NewsCard";
import { VideoPlayer } from "@/components/news/VideoPlayer";
import { ContentProtection } from "@/components/ContentProtection";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  getArticleBySlug,
  getRelatedArticles,
  getMediaUrl,
  trackArticleView,
  toggleArticleLike,
  getArticleComments,
  postComment,
  deleteComment,
  ApiError,
  type ArticleListItem,
  type CommentItem,
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
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const trackedRef = useRef<string | null>(null);
  const autoplay = searchParams.get("autoplay") === "1";

  // --- Like state ---
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);

  // --- Comment state ---
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  // --- Share feedback ---
  const [shareCopied, setShareCopied] = useState(false);

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

  // Initialise like count from article data
  useEffect(() => {
    if (article) {
      setLikesCount(article.likes_count ?? 0);
    }
  }, [article]);

  // Fetch comments when article is loaded
  useEffect(() => {
    if (!article) return;
    setCommentsLoading(true);
    getArticleComments(article.id)
      .then((data) => setComments(data))
      .catch(() => setComments([]))
      .finally(() => setCommentsLoading(false));
  }, [article]);

  const handleLike = async () => {
    if (!article) return;
    setLikeLoading(true);
    try {
      const result = await toggleArticleLike(slug!);
      setLiked(result.liked);
      setLikesCount((c) => result.liked ? c + 1 : Math.max(0, c - 1));
    } catch (e) {
      toast({ title: "Could not update like", description: String(e), variant: "destructive" });
    } finally {
      setLikeLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const titleText = article ? getTitle(article, language) : document.title;
    if (navigator.share) {
      try {
        await navigator.share({ title: titleText, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article || !commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const newComment = await postComment(article.id, commentText.trim(), replyTo ?? undefined);
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
      setReplyTo(null);
      toast({ title: language === "en" ? "Comment posted!" : "ટિપ્પણી પ્રકાશિત!" });
    } catch (e) {
      toast({ title: "Could not post comment", description: String(e), variant: "destructive" });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      // silently fail
    }
  };

  const title = useMemo(() => (article ? getTitle(article, language) : ""), [article, language]);
  const summary = useMemo(() => (article ? getSummary(article, language) : ""), [article, language]);
  const content = useMemo(() => (article ? getContent(article, language) : ""), [article, language]);

  // Top-level comments only; replies are nested
  const topLevelComments = useMemo(() => comments.filter((c) => c.parent == null), [comments]);
  const repliesMap = useMemo(() => {
    const map: Record<number, CommentItem[]> = {};
    comments.forEach((c) => {
      if (c.parent != null) {
        if (!map[c.parent]) map[c.parent] = [];
        map[c.parent].push(c);
      }
    });
    return map;
  }, [comments]);

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
            {/* ─── Article body ─────────────────────── */}
            <article className="mx-auto max-w-3xl">
              <ContentProtection>
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
              </ContentProtection>

              {/* ─── Engagement Bar ─────────────────── */}
              <div className="mt-8 pt-6 border-t border-border flex items-center gap-4">
                {/* Like */}
                <button
                  onClick={handleLike}
                  disabled={likeLoading}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    liked
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted"
                  }`}
                  title={liked ? "Unlike" : "Like"}
                >  <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                  <span>{likesCount}</span>
                </button>

                {/* Comment count indicator */}
                <button
                  onClick={() => document.getElementById("comments-section")?.scrollIntoView({ behavior: "smooth" })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{comments.length}</span>
                </button>

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors ml-auto"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{shareCopied ? (language === "en" ? "Copied!" : "કૉપી!") : (language === "en" ? "Share" : "શેર")}</span>
                </button>
              </div>

              {/* ─── Comments Section ────────────────── */}
              <section id="comments-section" className="mt-10">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  {language === "en" ? "Comments" : "ટિપ્પણીઓ"} ({comments.length})
                </h2>

                {/* Comment form */}
                <form onSubmit={handleSubmitComment} className="mb-8">
                  {replyTo != null && (
                    <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{language === "en" ? "Replying to comment" : "ટિપ્પણીનો જવાબ"} #{replyTo}</span>
                      <button type="button" className="text-primary hover:underline" onClick={() => setReplyTo(null)}>
                        {language === "en" ? "Cancel" : "રદ"}
                      </button>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={language === "en" ? "Write a comment…" : "ટિપ્પણી લખો…"}
                      rows={3}
                      className="flex-1 resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      required
                    />
                    <button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="self-end flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {language === "en" ? "Post" : "મોકલો"}
                    </button>
                  </div>
                </form>

                {/* Comment list */}
                {commentsLoading ? (
                  <div className="text-sm text-muted-foreground">{language === "en" ? "Loading comments…" : "ટિપ્પણીઓ લોડ થઈ રહ્યા છે..."}</div>
                ) : topLevelComments.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-4">
                    {language === "en" ? "No comments yet. Be the first!" : "હજી કોઈ ટિપ્પણી નથી."}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topLevelComments.map((comment) => (
                      <div key={comment.id} className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-foreground">
                                {(comment as any).guest_name || 
                                  ((comment.user ? ((typeof comment.user === 'object' ? comment.user?.id : comment.user)) : "Guest"))}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => setReplyTo(comment.id)}
                                className="text-xs text-muted-foreground hover:text-primary px-2 py-1 rounded transition-colors"
                              >
                                {language === "en" ? "Reply" : "જવાબ"}
                              </button>
                            {isAuthenticated && (user as { id?: number })?.id === comment.user && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Replies */}
                        {(repliesMap[comment.id] ?? []).length > 0 && (
                          <div className="mt-3 ml-4 pl-4 border-l-2 border-border space-y-3">
                            {repliesMap[comment.id].map((reply) => (
                              <div key={reply.id} className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-0.5">
                                      <span className="text-xs font-semibold text-foreground">
                                        {(reply as any).guest_name || 
                                          ((reply.user ? ((typeof reply.user === 'object' ? reply.user?.id : reply.user)) : "Guest"))}
                                      </span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                                    </span>
                                  </div>
                                  <p className="text-sm text-foreground">{reply.content}</p>
                                </div>
                                {isAuthenticated && (user as { id?: number })?.id === reply.user && (
                                  <button
                                    onClick={() => handleDeleteComment(reply.id)}
                                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
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
