import { FormEvent, useEffect, useMemo, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ApiError,
  getSections,
  getCategories,
  getDistricts,
  getTags,
  getArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  updateArticleFeaturedImage,
  createMedia,
  deleteMedia,
  getMediaUrl,
  getEpaperEditions,
  createEpaperEdition,
  deleteEpaperEdition,
  type SectionItem,
  type CategoryItem,
  type DistrictItem,
  type TagItem,
  type ArticleListItem,
  type MediaType,
  type EpaperEditionItem,
} from "@/lib/api";

function formatApiErrorDetails(err: ApiError): string {
  const data = err.data;
  if (!data) return err.message;
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    try {
      // Common DRF shapes: { detail: "..." } or { field: ["msg"] }
      const maybeDetail = (data as { detail?: unknown }).detail;
      if (typeof maybeDetail === "string" && maybeDetail.trim()) return maybeDetail;
      return JSON.stringify(data);
    } catch {
      return err.message;
    }
  }
  return err.message;
}

const EditorDashboard = () => {
  const { user, accessToken, logout } = useAuth();
  const { toast } = useToast();

  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [districts, setDistricts] = useState<DistrictItem[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  // Optional translations for Hindi / Gujarati
  const [titleHi, setTitleHi] = useState("");
  const [titleGu, setTitleGu] = useState("");
  const [summaryHi, setSummaryHi] = useState("");
  const [summaryGu, setSummaryGu] = useState("");
  const [contentHi, setContentHi] = useState("");
  const [contentGu, setContentGu] = useState("");
  const [sectionId, setSectionId] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [districtId, setDistrictId] = useState<number | "">("");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [contentType, setContentType] = useState<"ARTICLE" | "REEL" | "VIDEO" | "YOUTUBE">("ARTICLE");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [primaryLanguage, setPrimaryLanguage] = useState<"EN" | "HI" | "GU">("GU");
  const [isBreaking, setIsBreaking] = useState(false);
  const [isTop, setIsTop] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Create-form media/featured image
  const [createFeaturedImageFile, setCreateFeaturedImageFile] = useState<File | null>(null);
  const [createMediaType, setCreateMediaType] = useState<MediaType>("IMAGE");
  const [createMediaCaption, setCreateMediaCaption] = useState("");
  const [createMediaUrl, setCreateMediaUrl] = useState("");
  const [createMediaFile, setCreateMediaFile] = useState<File | null>(null);

  const [recentArticles, setRecentArticles] = useState<ArticleListItem[]>([]);
  const [manageStatus, setManageStatus] = useState<"ALL" | "DRAFT" | "PUBLISHED">("ALL");
  const [manageSearch, setManageSearch] = useState("");
  const [manageLoading, setManageLoading] = useState(false);
  const [manageResults, setManageResults] = useState<ArticleListItem[]>([]);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editArticle, setEditArticle] = useState<ArticleListItem | null>(null);
  const [editTitleEn, setEditTitleEn] = useState("");
  const [editSummaryEn, setEditSummaryEn] = useState("");
  const [editContentEn, setEditContentEn] = useState("");
  const [editSectionId, setEditSectionId] = useState<number | "">("");
  const [editStatus, setEditStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT");
  const [editBreaking, setEditBreaking] = useState(false);
  const [editTop, setEditTop] = useState(false);
  const [editTrending, setEditTrending] = useState(false);
  const [editFeaturedImageFile, setEditFeaturedImageFile] = useState<File | null>(null);

  // Media add
  const [mediaType, setMediaType] = useState<MediaType>("IMAGE");
  const [mediaCaption, setMediaCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaSaving, setMediaSaving] = useState(false);

  // E-paper upload
  const [epaperPublicationDate, setEpaperPublicationDate] = useState("");
  const [epaperTitle, setEpaperTitle] = useState("");
  const [epaperPdfFile, setEpaperPdfFile] = useState<File | null>(null);
  const [epaperUploading, setEpaperUploading] = useState(false);
  const [epaperEditions, setEpaperEditions] = useState<EpaperEditionItem[]>([]);
  const [epaperLoading, setEpaperLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingSections(true);
        const [sectionsData, categoriesData, tagsData] = await Promise.all([
          getSections(),
          getCategories(),
          getTags(),
        ]);
        if (!cancelled) {
          setSections(Array.isArray(sectionsData) ? sectionsData : []);
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
          setTags(Array.isArray(tagsData) ? tagsData : []);
        }
      } catch (err) {
        console.error("Failed to load taxonomy for editor dashboard:", err);
        if (!cancelled) {
          toast({
            title: "Could not load sections/categories/tags",
            description:
              "Ensure the backend is running and you have permission to view sections.",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setLoadingSections(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  // Gujarat section id (used to decide when to show district dropdown)
  const gujaratSectionId = useMemo(() => {
    const found = sections.find(
      (s) =>
        s.slug === "gujarat" ||
        s.name_en.toLowerCase() === "gujarat" ||
        (s.name_gu && s.name_gu.toLowerCase().includes("ગુજરાત"))
    );
    return found?.id ?? null;
  }, [sections]);

  // Load districts when section changes (only when Gujarat section is selected)
  useEffect(() => {
    let cancelled = false;
    // Hide / reset districts when no section selected or section is not Gujarat
    if (!sectionId || (gujaratSectionId && Number(sectionId) !== gujaratSectionId)) {
      setDistricts([]);
      setDistrictId("");
      return;
    }
    (async () => {
      try {
        const data = await getDistricts({ section: Number(sectionId), is_active: true });
        if (!cancelled) {
          setDistricts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load districts:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sectionId, gujaratSectionId]);

  const sectionOptions = useMemo(
    () => sections.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [sections]
  );

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
        // Optional translations
        title_hi: titleHi || undefined,
        title_gu: titleGu || undefined,
        summary_hi: summaryHi || undefined,
        summary_gu: summaryGu || undefined,
        content_hi: contentHi || undefined,
        content_gu: contentGu || undefined,
        section: Number(sectionId),
        status,
        primary_language: primaryLanguage,
        content_type: contentType,
        category: categoryId ? Number(categoryId) : undefined,
        district: districtId ? Number(districtId) : undefined,
        tags: selectedTagIds,
        is_breaking: isBreaking,
        is_top: isTop,
        is_trending: isTrending,
      };

      const created = await createArticle(payload);
      setRecentArticles((prev) => [created, ...prev].slice(0, 5));

      // Optional: upload featured image (like Django admin "featured image" field)
      if (createFeaturedImageFile) {
        try {
          await updateArticleFeaturedImage(created.slug, createFeaturedImageFile);
        } catch (err) {
          toast({
            title: "Article saved, but image upload failed",
            description: err instanceof Error ? err.message : "Please try again from the Edit dialog.",
            variant: "destructive",
          });
        }
      }

      // Optional: attach a first media item (image / video / YouTube), similar to Django inline media
      const trimmedUrl = createMediaUrl.trim();
      const wantsImage = createMediaType === "IMAGE" && !!createMediaFile;
      const wantsVideoOrReel =
        (createMediaType === "VIDEO" || createMediaType === "REEL") &&
        (!!createMediaFile || !!trimmedUrl);
      const wantsYoutube = createMediaType === "YOUTUBE" && !!trimmedUrl;

      if (wantsImage || wantsVideoOrReel || wantsYoutube) {
        try {
          await createMedia({
            article: created.id,
            media_type: createMediaType,
            caption: createMediaCaption || undefined,
            youtube_url:
              (createMediaType === "YOUTUBE" ||
                createMediaType === "VIDEO" ||
                createMediaType === "REEL") && trimmedUrl
                ? trimmedUrl
                : undefined,
            file:
              (createMediaType === "VIDEO" || createMediaType === "REEL") && createMediaFile
                ? createMediaFile
                : null,
            image: createMediaType === "IMAGE" ? createMediaFile : null,
          });
        } catch (err) {
          toast({
            title: "Article saved, but media upload failed",
            description: err instanceof Error ? err.message : "You can re-attach media from the Edit dialog.",
            variant: "destructive",
          });
        }
      }

      setTitle("");
      setSummary("");
      setContent("");
      setTitleHi("");
      setTitleGu("");
      setSummaryHi("");
      setSummaryGu("");
      setContentHi("");
      setContentGu("");
      setSectionId("");
      setStatus("DRAFT");
      setCategoryId("");
      setDistrictId("");
      setSelectedTagIds([]);
      setPrimaryLanguage("GU");
      setIsBreaking(false);
      setIsTop(false);
      setIsTrending(false);
      setCreateFeaturedImageFile(null);
      setCreateMediaType("IMAGE");
      setCreateMediaCaption("");
      setCreateMediaUrl("");
      setCreateMediaFile(null);

      // Reload manage list so the new article appears without manual refresh
      loadManage();

      toast({
        title: "Article saved",
        description:
          status === "PUBLISHED"
            ? "Your article is published on the frontend."
            : "Your article is saved as draft.",
      });
    } catch (err: unknown) {
      toast({
        title: "Could not save article",
        description:
          err instanceof ApiError
            ? formatApiErrorDetails(err)
            : err instanceof Error
              ? err.message
              : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const loadManage = async () => {
    setManageLoading(true);
    try {
      const res = await getArticles({
        page: 1,
        status: manageStatus === "ALL" ? undefined : manageStatus,
        search: manageSearch.trim() || undefined,
      });
      setManageResults(Array.isArray(res?.results) ? res.results : []);
    } catch (e) {
      toast({ title: "Failed to load articles", variant: "destructive", description: String(e) });
    } finally {
      setManageLoading(false);
    }
  };

  const openEdit = async (slug: string) => {
    setEditOpen(true);
    setEditSlug(slug);
    setEditLoading(true);
    setEditArticle(null);
    try {
      const a = await getArticleBySlug(slug);
      if (!a) throw new Error("Article not found");
      setEditArticle(a);
      setEditTitleEn(a.title_en ?? "");
      setEditSummaryEn(a.summary_en ?? "");
      setEditContentEn(a.content_en ?? "");
      setEditSectionId(a.section ?? "");
      const s = a.status;
      setEditStatus(s === "PUBLISHED" || s === "ARCHIVED" || s === "DRAFT" ? s : "DRAFT");
      setEditBreaking(!!a.is_breaking);
      setEditTop(!!a.is_top);
      setEditTrending(!!a.is_trending);
    } catch (e) {
      toast({ title: "Failed to load article", variant: "destructive", description: String(e) });
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const saveEdit = async () => {
    if (!editSlug) return;
    if (!editTitleEn.trim() || !editSectionId) {
      toast({ title: "Title and section are required", variant: "destructive" });
      return;
    }
    setEditSaving(true);
    try {
      const updated = await updateArticle(editSlug, {
        title_en: editTitleEn.trim(),
        summary_en: editSummaryEn,
        content_en: editContentEn,
        section: Number(editSectionId),
        status: editStatus,
        is_breaking: editBreaking,
        is_top: editTop,
        is_trending: editTrending,
      });
      if (editFeaturedImageFile) {
        await updateArticleFeaturedImage(editSlug, editFeaturedImageFile);
      }
      const refetched = await getArticleBySlug(updated.slug);
      setEditArticle(refetched);
      toast({ title: "Article updated" });
      loadManage();
    } catch (e) {
      toast({ title: "Update failed", variant: "destructive", description: String(e) });
    } finally {
      setEditSaving(false);
      setEditFeaturedImageFile(null);
    }
  };

  const removeArticle = async (slug: string) => {
    if (!confirm(`Delete article "${slug}"?`)) return;
    try {
      await deleteArticle(slug);
      toast({ title: "Article deleted" });
      loadManage();
    } catch (e) {
      toast({ title: "Delete failed", variant: "destructive", description: String(e) });
    }
  };

  const addMedia = async () => {
    if (!editArticle) return;
    if (mediaType === "YOUTUBE" && !mediaUrl.trim()) {
      toast({ title: "YouTube URL required", variant: "destructive" });
      return;
    }
    if (mediaType === "IMAGE" && !mediaFile) {
      toast({ title: "File required", variant: "destructive" });
      return;
    }
    // VIDEO and REEL: require either file OR YouTube URL
    if ((mediaType === "VIDEO" || mediaType === "REEL") && !mediaFile && !mediaUrl.trim()) {
      toast({ title: "Upload a file or enter a YouTube URL", variant: "destructive" });
      return;
    }
    setMediaSaving(true);
    try {
      await createMedia({
        article: editArticle.id,
        media_type: mediaType,
        caption: mediaCaption || undefined,
        youtube_url: (mediaType === "YOUTUBE" || mediaType === "VIDEO" || mediaType === "REEL") && mediaUrl.trim() ? mediaUrl.trim() : undefined,
        file: (mediaType === "VIDEO" || mediaType === "REEL") && mediaFile ? mediaFile : null,
        image: mediaType === "IMAGE" ? mediaFile : null,
      });
      const refetched = await getArticleBySlug(editArticle.slug);
      setEditArticle(refetched);
      setMediaCaption("");
      setMediaUrl("");
      setMediaFile(null);
      toast({ title: "Media added" });
    } catch (e) {
      toast({ title: "Media upload failed", variant: "destructive", description: String(e) });
    } finally {
      setMediaSaving(false);
    }
  };

  const removeMedia = async (id: number) => {
    if (!editArticle) return;
    try {
      await deleteMedia(id);
      const refetched = await getArticleBySlug(editArticle.slug);
      setEditArticle(refetched);
      toast({ title: "Media deleted" });
    } catch (e) {
      toast({ title: "Delete failed", variant: "destructive", description: String(e) });
    }
  };

  // E-paper functions
  const loadEpaperEditions = async () => {
    setEpaperLoading(true);
    try {
      const data = await getEpaperEditions();
      const editions = Array.isArray(data) ? data : (data as { results: EpaperEditionItem[] }).results || [];
      setEpaperEditions(editions);
    } catch (err) {
      console.error("Failed to load e-paper editions:", err);
      toast({
        title: "Could not load e-paper editions",
        variant: "destructive",
      });
    } finally {
      setEpaperLoading(false);
    }
  };

  const handleEpaperSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      toast({
        title: "Not authenticated",
        description: "Please log in again.",
        variant: "destructive",
      });
      return;
    }
    if (!epaperPublicationDate || !epaperPdfFile) {
      toast({
        title: "Missing details",
        description: "Publication date and PDF file are required.",
        variant: "destructive",
      });
      return;
    }

    setEpaperUploading(true);
    try {
      await createEpaperEdition({
        publication_date: epaperPublicationDate,
        title: epaperTitle || undefined,
        pdf_file: epaperPdfFile,
      });
      toast({
        title: "E-paper uploaded successfully",
        description: "The PDF has been uploaded.",
      });
      // Reset form
      setEpaperPublicationDate("");
      setEpaperTitle("");
      setEpaperPdfFile(null);
      // Reload list
      await loadEpaperEditions();
    } catch (err) {
      const errorMsg = err instanceof ApiError ? formatApiErrorDetails(err) : String(err);
      toast({
        title: "Upload failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setEpaperUploading(false);
    }
  };

  const removeEpaperEdition = async (id: number) => {
    if (!confirm("Are you sure you want to delete this e-paper edition?")) return;
    try {
      await deleteEpaperEdition(id);
      toast({ title: "E-paper edition deleted" });
      await loadEpaperEditions();
    } catch (e) {
      toast({ title: "Delete failed", variant: "destructive", description: String(e) });
    }
  };

  // Load e-paper editions on mount
  useEffect(() => {
    loadEpaperEditions();
  }, []);

  return (
    <PageLayout showTicker={false}>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Editor Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Signed in as {user?.username} ({user?.role})
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            Log out
          </button>
        </div>

        <Tabs defaultValue="create" className="space-y-4">
          <TabsList>
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="manage" onClick={() => loadManage()}>Manage</TabsTrigger>
            <TabsTrigger value="epaper" onClick={() => loadEpaperEditions()}>E-paper</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
              <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold">Create article</h2>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Content Studio</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title (English) *</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter headline..." required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Summary (English)</Label>
                  <textarea
                    id="summary"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={2}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content (English)</Label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title-hi">Title (Hindi, optional)</Label>
                    <Input
                      id="title-hi"
                      value={titleHi}
                      onChange={(e) => setTitleHi(e.target.value)}
                      placeholder="हिंदी में शीर्षक"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title-gu">Title (Gujarati, optional)</Label>
                    <Input
                      id="title-gu"
                      value={titleGu}
                      onChange={(e) => setTitleGu(e.target.value)}
                      placeholder="ગુજરાતીમાં શીર્ષક"
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="summary-hi">Summary (Hindi, optional)</Label>
                    <textarea
                      id="summary-hi"
                      value={summaryHi}
                      onChange={(e) => setSummaryHi(e.target.value)}
                      rows={2}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="summary-gu">Summary (Gujarati, optional)</Label>
                    <textarea
                      id="summary-gu"
                      value={summaryGu}
                      onChange={(e) => setSummaryGu(e.target.value)}
                      rows={2}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="content-hi">Content (Hindi, optional)</Label>
                    <textarea
                      id="content-hi"
                      value={contentHi}
                      onChange={(e) => setContentHi(e.target.value)}
                      rows={6}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content-gu">Content (Gujarati, optional)</Label>
                    <textarea
                      id="content-gu"
                      value={contentGu}
                      onChange={(e) => setContentGu(e.target.value)}
                      rows={6}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featured-image">Featured image (optional)</Label>
                  <Input
                    id="featured-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCreateFeaturedImageFile(e.target.files?.[0] ?? null)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    This image will be used as the main thumbnail for the article, similar to the Django admin featured image.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="section">Section *</Label>
                    <select
                      id="section"
                      value={sectionId}
                      onChange={(e) => setSectionId(e.target.value ? Number(e.target.value) : "")}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      disabled={loadingSections}
                      required
                    >
                      <option value="">Select section…</option>
                      {sectionOptions.map((s) => (
                        <option key={s.id} value={s.id}>{s.name_en}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value === "PUBLISHED" ? "PUBLISHED" : "DRAFT")}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contentType">Content type</Label>
                    <select
                      id="contentType"
                      value={contentType}
                      onChange={(e) => {
                        const v = e.target.value;
                        setContentType(v === "REEL" || v === "VIDEO" || v === "YOUTUBE" ? v : "ARTICLE");
                      }}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="ARTICLE">Article</option>
                      <option value="REEL">Reel</option>
                      <option value="VIDEO">Video</option>
                      <option value="YOUTUBE">YouTube</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {/* Category is optional; hide it entirely if not needed */}
                  {/* <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">No category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name_en}
                        </option>
                      ))}
                    </select>
                  </div> */}

                  {gujaratSectionId && sectionId === gujaratSectionId && (
                    <div className="space-y-2">
                      <Label htmlFor="district">District (only for Gujarat section)</Label>
                      <select
                        id="district"
                        value={districtId}
                        onChange={(e) => setDistrictId(e.target.value ? Number(e.target.value) : "")}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">No district</option>
                        {districts.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name_en}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="primaryLanguage">Primary language</Label>
                    <select
                      id="primaryLanguage"
                      value={primaryLanguage}
                      onChange={(e) => {
                        const v = e.target.value;
                        setPrimaryLanguage(v === "HI" || v === "GU" ? v : "EN");
                      }}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="EN">English</option>
                      <option value="HI">Hindi</option>
                      <option value="GU">Gujarati</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-[2fr,1fr]">
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <select
                      id="tags"
                      multiple
                      value={selectedTagIds.map((id) => String(id))}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions).map((opt) => Number(opt.value));
                        setSelectedTagIds(selected);
                      }}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm h-24"
                    >
                      {tags.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-muted-foreground">Hold Ctrl (Windows) or Cmd (Mac) to select multiple tags.</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Flags</Label>
                    <div className="flex flex-col gap-2 text-xs">
                      <label className="flex items-center justify-between gap-2">
                        <span>Is breaking</span>
                        <Switch checked={isBreaking} onCheckedChange={setIsBreaking} />
                      </label>
                      <label className="flex items-center justify-between gap-2">
                        <span>Is top</span>
                        <Switch checked={isTop} onCheckedChange={setIsTop} />
                      </label>
                      <label className="flex items-center justify-between gap-2">
                        <span>Is trending</span>
                        <Switch checked={isTrending} onCheckedChange={setIsTrending} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-2 space-y-3 border-t border-border pt-4">
                  <p className="text-xs font-semibold">Optional media (photos / video / YouTube)</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="create-media-type">Type</Label>
                      <select
                        id="create-media-type"
                        value={createMediaType}
                        onChange={(e) => setCreateMediaType(e.target.value as MediaType)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="IMAGE">Image</option>
                        <option value="VIDEO">Video</option>
                        <option value="REEL">Reel</option>
                        <option value="YOUTUBE">YouTube</option>
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="create-media-caption">Caption</Label>
                      <Input
                        id="create-media-caption"
                        value={createMediaCaption}
                        onChange={(e) => setCreateMediaCaption(e.target.value)}
                        placeholder="Optional description for the photo/video"
                      />
                    </div>
                  </div>

                  {createMediaType === "YOUTUBE" ? (
                    <div className="space-y-2">
                      <Label htmlFor="create-media-url">YouTube URL</Label>
                      <Input
                        id="create-media-url"
                        value={createMediaUrl}
                        onChange={(e) => setCreateMediaUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                  ) : createMediaType === "VIDEO" || createMediaType === "REEL" ? (
                    <div className="space-y-4">
                      <p className="text-xs text-muted-foreground">Upload a file OR paste a YouTube link (both are optional).</p>
                      <div className="space-y-2">
                        <Label htmlFor="create-media-file">File (optional)</Label>
                        <Input
                          id="create-media-file"
                          type="file"
                          accept="video/*"
                          onChange={(e) => setCreateMediaFile(e.target.files?.[0] ?? null)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="create-media-url-video">YouTube URL (optional)</Label>
                        <Input
                          id="create-media-url-video"
                          value={createMediaUrl}
                          onChange={(e) => setCreateMediaUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="create-media-image-file">Image file (optional)</Label>
                      <Input
                        id="create-media-image-file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCreateMediaFile(e.target.files?.[0] ?? null)}
                      />
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save"}
                </Button>
              </form>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Recently created</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentArticles.length === 0 ? (
                    <p className="text-xs text-muted-foreground">New articles will appear here after you save them.</p>
                  ) : (
                    <ul className="space-y-2 text-xs">
                      {recentArticles.map((a) => (
                        <li key={a.id} className="flex items-start justify-between gap-2 border-b border-border/60 pb-2 last:border-0 last:pb-0">
                          <div>
                            <p className="font-medium line-clamp-2">{a.title_en}</p>
                            <p className="text-[11px] text-muted-foreground">Status: {a.status} • Slug: {a.slug}</p>
                          </div>
                          {a.slug && (
                            <a href={`/article/${a.slug}`} target="_blank" rel="noreferrer" className="text-[11px] font-medium text-primary hover:underline">
                              View
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="manage" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Articles</CardTitle>
                </div>
                <Button variant="outline" onClick={() => loadManage()} disabled={manageLoading}>
                  {manageLoading ? "Loading…" : "Refresh"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select
                      value={manageStatus}
                      onChange={(e) => {
                        const v = e.target.value;
                        setManageStatus(v === "DRAFT" || v === "PUBLISHED" ? v : "ALL");
                      }}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="ALL">All</option>
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Search</Label>
                    <div className="flex gap-2">
                      <Input value={manageSearch} onChange={(e) => setManageSearch(e.target.value)} placeholder="Search title/content…" />
                      <Button type="button" onClick={() => loadManage()} disabled={manageLoading}>Search</Button>
                    </div>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead className="w-[220px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manageResults.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-muted-foreground">No articles.</TableCell>
                      </TableRow>
                    ) : (
                      manageResults.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.title_en}</TableCell>
                          <TableCell className="text-xs">{a.status}</TableCell>
                          <TableCell className="text-xs font-mono">{a.slug}</TableCell>
                          <TableCell className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEdit(a.slug)}>Edit</Button>
                            <Button size="sm" variant="ghost" onClick={() => window.open(`/article/${a.slug}`, "_blank")}>View</Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeArticle(a.slug)}>Delete</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="epaper" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
              <form onSubmit={handleEpaperSubmit} className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold">E-paper editions</h2>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Upload PDF</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="epaper-date">Publication date *</Label>
                  <Input
                    id="epaper-date"
                    type="date"
                    value={epaperPublicationDate}
                    onChange={(e) => setEpaperPublicationDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="epaper-title">Title</Label>
                  <Input
                    id="epaper-title"
                    value={epaperTitle}
                    onChange={(e) => setEpaperTitle(e.target.value)}
                    placeholder="Optional - defaults to Kanam Express ePaper + date"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    If left empty, the title will be auto-generated as "Kanam Express ePaper - DD-MM-YYYY"
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="epaper-pdf">PDF file *</Label>
                  <Input
                    id="epaper-pdf"
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setEpaperPdfFile(e.target.files?.[0] ?? null)}
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Upload PDF file for the e-paper edition. Maximum file size: 100MB
                  </p>
                  {epaperPdfFile && (
                    <p className="text-xs text-muted-foreground">
                      Selected: {epaperPdfFile.name} ({(epaperPdfFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={epaperUploading} className="w-full">
                  {epaperUploading ? "Uploading..." : "Upload e-paper"}
                </Button>
              </form>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">E-paper editions</CardTitle>
                </CardHeader>
                <CardContent>
                  {epaperLoading ? (
                    <p className="text-xs text-muted-foreground">Loading...</p>
                  ) : epaperEditions.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No e-paper editions uploaded yet.</p>
                  ) : (
                    <ul className="space-y-2 text-xs">
                      {epaperEditions.map((edition) => (
                        <li key={edition.id} className="flex items-start justify-between gap-2 border-b border-border/60 pb-2 last:border-0 last:pb-0">
                          <div>
                            <p className="font-medium line-clamp-2">{edition.title}</p>
                            <p className="text-[11px] text-muted-foreground">
                              Date: {new Date(edition.publication_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <a
                              href={getMediaUrl(edition.pdf_file)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-medium text-primary hover:underline"
                            >
                              View
                            </a>
                            <button
                              onClick={() => removeEpaperEdition(edition.id)}
                              className="text-[11px] font-medium text-destructive hover:underline ml-2"
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="w-[95vw] sm:max-w-4xl h-[90dvh] max-h-[90dvh] flex flex-col overflow-hidden p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Edit article</DialogTitle>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              {editLoading || !editArticle ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Title (EN)</Label>
                      <Input value={editTitleEn} onChange={(e) => setEditTitleEn(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Section</Label>
                      <select value={editSectionId} onChange={(e) => setEditSectionId(e.target.value ? Number(e.target.value) : "")} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="">Select section…</option>
                        {sectionOptions.map((s) => (
                          <option key={s.id} value={s.id}>{s.name_en}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Summary (EN)</Label>
                    <textarea value={editSummaryEn} onChange={(e) => setEditSummaryEn(e.target.value)} rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  </div>

                  <div className="space-y-2">
                    <Label>Content (EN)</Label>
                    <textarea value={editContentEn} onChange={(e) => setEditContentEn(e.target.value)} rows={10} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <select
                        value={editStatus}
                        onChange={(e) => {
                          const v = e.target.value;
                          setEditStatus(v === "PUBLISHED" || v === "ARCHIVED" ? v : "DRAFT");
                        }}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 pt-7">
                      <Switch checked={editBreaking} onCheckedChange={setEditBreaking} />
                      <span className="text-sm">Breaking</span>
                    </div>
                    <div className="flex items-center gap-2 pt-7">
                      <Switch checked={editTop} onCheckedChange={setEditTop} />
                      <span className="text-sm">Top</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch checked={editTrending} onCheckedChange={setEditTrending} />
                    <span className="text-sm">Trending</span>
                  </div>

                  <div className="space-y-2">
                    <Label>Featured image</Label>
                    {editArticle.featured_image ? (
                      <img src={getMediaUrl(editArticle.featured_image)} alt="" className="h-28 rounded border border-border object-cover" />
                    ) : (
                      <p className="text-xs text-muted-foreground">No featured image.</p>
                    )}
                    <Input type="file" accept="image/*" onChange={(e) => setEditFeaturedImageFile(e.target.files?.[0] ?? null)} />
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Media</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <select value={mediaType} onChange={(e) => setMediaType(e.target.value as MediaType)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option value="IMAGE">Image</option>
                            <option value="VIDEO">Video</option>
                            <option value="REEL">Reel</option>
                            <option value="YOUTUBE">YouTube</option>
                          </select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Caption</Label>
                          <Input value={mediaCaption} onChange={(e) => setMediaCaption(e.target.value)} />
                        </div>
                      </div>

                      {mediaType === "YOUTUBE" ? (
                        <div className="space-y-2">
                          <Label>YouTube URL</Label>
                          <Input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
                        </div>
                      ) : mediaType === "VIDEO" || mediaType === "REEL" ? (
                        <div className="space-y-4">
                          <p className="text-xs text-muted-foreground">Upload a file OR paste a YouTube link</p>
                          <div className="space-y-2">
                            <Label>File (optional)</Label>
                            <Input type="file" accept="video/*" onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)} />
                          </div>
                          <div className="space-y-2">
                            <Label>YouTube URL (optional)</Label>
                            <Input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label>File</Label>
                          <Input type="file" accept="image/*" onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)} />
                        </div>
                      )}

                      <Button type="button" onClick={addMedia} disabled={mediaSaving}>
                        {mediaSaving ? "Uploading…" : "Add media"}
                      </Button>

                      <div className="space-y-2">
                        {(editArticle.media ?? []).length === 0 ? (
                          <p className="text-xs text-muted-foreground">No media items.</p>
                        ) : (
                          <ul className="space-y-2 text-sm">
                            {(editArticle.media ?? []).map((m) => (
                              <li key={m.id} className="flex items-center justify-between gap-3 rounded border border-border p-2">
                                <div className="min-w-0">
                                  <p className="text-xs font-mono">{m.media_type}</p>
                                  <p className="text-xs text-muted-foreground truncate">{m.caption || m.youtube_url || m.file || m.image || ""}</p>
                                </div>
                                <Button type="button" variant="ghost" className="text-destructive" onClick={() => removeMedia(m.id)}>
                                  Delete
                                </Button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Close</Button>
              <Button type="button" onClick={saveEdit} disabled={editSaving}>
                {editSaving ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {user?.role === "EDITOR" && (
          <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <CardHeader>
              <CardTitle className="text-base">Editor Notice</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p className="mb-2">
                As an <strong>Editor</strong>, your changes to categories, sections, and tags require admin approval before they appear on the public website.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>When you create or edit categories/sections/tags, they will be marked as <strong>Pending</strong></li>
                <li>Only a <strong>Super Admin</strong> can approve your changes</li>
                <li>Once approved, your changes will be visible to all visitors</li>
                <li>You can still edit pending items, but they will need approval again</li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default EditorDashboard;

