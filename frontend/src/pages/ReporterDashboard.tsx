import { FormEvent, useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  getSections,
  apiUrl,
  type SectionItem,
  type ArticleListItem,
} from "@/lib/api";

const ReporterDashboard = () => {
  const { user, accessToken, logout } = useAuth();
  const { toast } = useToast();

  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [sectionId, setSectionId] = useState<number | "">("");
  const [contentType, setContentType] = useState<"ARTICLE" | "REEL" | "VIDEO" | "YOUTUBE">("ARTICLE");
  const [submitting, setSubmitting] = useState(false);

  const [myDrafts, setMyDrafts] = useState<ArticleListItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingSections(true);
        const data = await getSections();
        if (!cancelled) setSections(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load sections:", err);
        if (!cancelled) {
          toast({
            title: "Could not load sections",
            description: "Please try again later.",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setLoadingSections(false);
      }
    })();
    return () => { cancelled = true; };
  }, [toast]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      toast({
        title: "Not authenticated",
        description: "Please log in again.",
        variant: "destructive",
      });
      return;
    }
    if (!title || !sectionId) {
      toast({
        title: "Missing details",
        description: "Title and section are required.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title_en: title,
        slug: title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 60),
        summary_en: summary,
        content_en: content,
        section: Number(sectionId),
        status: "DRAFT",
        primary_language: "EN",
        content_type: contentType,
      };

      const res = await fetch(apiUrl("/news/articles/"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data && (data.detail as string)) ||
            "Failed to create article. Check permissions."
        );
      }

      const created = (await res.json()) as ArticleListItem;
      setMyDrafts((prev) => [created, ...prev].slice(0, 10));
      setTitle("");
      setSummary("");
      setContent("");
      setSectionId("");

      toast({
        title: "Draft saved",
        description: "Your draft has been saved. An editor can review and publish it.",
      });
    } catch (err: unknown) {
      toast({
        title: "Could not save draft",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout showTicker={false}>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Reporter Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Signed in as {user?.username} ({user?.role})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              View site
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              Log out
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <h2 className="text-sm font-semibold">Submit a new story (draft)</h2>
            <p className="text-xs text-muted-foreground">
              Reporters can create drafts only. An editor will review and publish.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-medium" htmlFor="title">
                Title (English) *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Enter headline..."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium" htmlFor="summary">
                Summary
              </label>
              <textarea
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Short summary..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium" htmlFor="content">
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Full article body..."
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium" htmlFor="section">
                  Section *
                </label>
                <select
                  id="section"
                  value={sectionId}
                  onChange={(e) =>
                    setSectionId(e.target.value ? Number(e.target.value) : "")
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={loadingSections}
                  required
                >
                  <option value="">Select section…</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium" htmlFor="contentType">
                  Content type
                </label>
                <select
                  id="contentType"
                  value={contentType}
                  onChange={(e) =>
                    setContentType(
                      e.target.value as "ARTICLE" | "REEL" | "VIDEO" | "YOUTUBE"
                    )
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="ARTICLE">Article</option>
                  <option value="REEL">Reel</option>
                  <option value="VIDEO">Video</option>
                  <option value="YOUTUBE">YouTube</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-60"
            >
              {submitting ? "Saving draft..." : "Save as draft"}
            </button>
          </form>

          <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-semibold">My recent drafts</h2>
            {myDrafts.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Drafts you create in this session will appear here.
              </p>
            ) : (
              <ul className="space-y-2 text-xs">
                {myDrafts.map((a) => (
                  <li
                    key={a.id}
                    className="flex justify-between gap-2 border-b border-border/60 pb-2 last:border-0"
                  >
                    <p className="font-medium line-clamp-2">{a.title_en}</p>
                    {a.slug && (
                      <a
                        href={`/article/${a.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex-shrink-0"
                      >
                        View
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ReporterDashboard;
