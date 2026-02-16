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
  getSections,
  getArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  updateArticleFeaturedImage,
  createMedia,
  deleteMedia,
  getMediaUrl,
  type SectionItem,
  type ArticleListItem,
  type MediaType,
  type EpaperEdition,
  listEpaperEditionsAdmin,
  createEpaperEditionAdmin,
  deleteEpaperEditionAdmin,
} from "@/lib/api";

const EditorDashboard = () => {
  const { user, accessToken, logout } = useAuth();
  const { toast } = useToast();

  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [sectionId, setSectionId] = useState<number | "">("");
  const [contentType, setContentType] = useState<"ARTICLE" | "REEL" | "VIDEO" | "YOUTUBE">("ARTICLE");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [submitting, setSubmitting] = useState(false);

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
  const [editFeatured, setEditFeatured] = useState(false);
  const [editFeaturedImageFile, setEditFeaturedImageFile] = useState<File | null>(null);

  // Media add
  const [mediaType, setMediaType] = useState<MediaType>("IMAGE");
  const [mediaCaption, setMediaCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaSaving, setMediaSaving] = useState(false);

  // E-paper management
  const [epaperItems, setEpaperItems] = useState<EpaperEdition[]>([]);
  const [epaperLoading, setEpaperLoading] = useState(false);
  const [epaperSaving, setEpaperSaving] = useState(false);
  const [epaperDate, setEpaperDate] = useState("");
  const [epaperTitle, setEpaperTitle] = useState("");
  const [epaperFile, setEpaperFile] = useState<File | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingSections(true);
        const data = await getSections();
        if (!cancelled) {
          setSections(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load sections for editor dashboard:", err);
        if (!cancelled) {
          toast({
            title: "Could not load sections",
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

  const sectionOptions = useMemo(() => sections.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [sections]);

  const loadEpaper = async () => {
    if (!accessToken) return;
    setEpaperLoading(true);
    try {
      const items = await listEpaperEditionsAdmin({ page_size: 50 });
      setEpaperItems(Array.isArray(items) ? items : []);
    } catch (err) {
      toast({
        title: "Failed to load e-paper editions",
        description: String(err),
        variant: "destructive",
      });
    } finally {
      setEpaperLoading(false);
    }
  };

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
        status,
        primary_language: "EN",
        content_type: contentType,
      };

      const created = await createArticle(payload);
      setRecentArticles((prev) => [created, ...prev].slice(0, 5));
      setTitle("");
      setSummary("");
      setContent("");
      setSectionId("");
      setStatus("DRAFT");

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
        description: err instanceof Error ? err.message : "Please try again.",
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
      setEditFeatured(!!a.is_featured);
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
        is_featured: editFeatured,
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
    if (mediaType !== "YOUTUBE" && !mediaFile) {
      toast({ title: "File required", variant: "destructive" });
      return;
    }
    setMediaSaving(true);
    try {
      await createMedia({
        article: editArticle.id,
        media_type: mediaType,
        caption: mediaCaption || undefined,
        youtube_url: mediaType === "YOUTUBE" ? mediaUrl.trim() : undefined,
        file: mediaType === "VIDEO" || mediaType === "REEL" ? mediaFile : null,
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
    if (!epaperDate || !epaperFile) {
      toast({
        title: "Missing details",
        description: "Publication date and PDF file are required.",
        variant: "destructive",
      });
      return;
    }

    setEpaperSaving(true);
    try {
      const title = epaperTitle.trim() || `Kanam Express ePaper ${epaperDate}`;
      await createEpaperEditionAdmin({
        publication_date: epaperDate,
        title,
        pdf_file: epaperFile,
      });
      toast({ title: "E-paper uploaded" });
      setEpaperTitle("");
      setEpaperFile(null);
      await loadEpaper();
    } catch (err) {
      toast({
        title: "Upload failed",
        description: String(err),
        variant: "destructive",
      });
    } finally {
      setEpaperSaving(false);
    }
  };

  const handleDeleteEpaper = async (id: number) => {
    if (!window.confirm("Delete this e-paper edition? This cannot be undone.")) return;
    try {
      await deleteEpaperEditionAdmin(id);
      toast({ title: "E-paper deleted" });
      await loadEpaper();
    } catch (err) {
      toast({
        title: "Delete failed",
        description: String(err),
        variant: "destructive",
      });
    }
  };

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
            <TabsTrigger value="epaper" onClick={() => loadEpaper()}>E-paper</TabsTrigger>
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
                  <Label htmlFor="summary">Summary</Label>
                  <textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
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

          <TabsContent value="epaper" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">E-paper editions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleEpaperSubmit} className="grid gap-4 md:grid-cols-3 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="epaper-date">Publication date *</Label>
                    <Input
                      id="epaper-date"
                      type="date"
                      value={epaperDate}
                      onChange={(e) => setEpaperDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="epaper-title">Title</Label>
                    <Input
                      id="epaper-title"
                      value={epaperTitle}
                      onChange={(e) => setEpaperTitle(e.target.value)}
                      placeholder="Optional – defaults to Kanam Express ePaper + date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="epaper-file">PDF file *</Label>
                    <Input
                      id="epaper-file"
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={(e) => setEpaperFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                  <div className="md:col-span-3 flex justify-end">
                    <Button type="submit" disabled={epaperSaving}>
                      {epaperSaving ? "Uploading…" : "Upload e-paper"}
                    </Button>
                  </div>
                </form>

                <div className="space-y-3">
                  {epaperLoading ? (
                    <p className="text-sm text-muted-foreground">Loading editions…</p>
                  ) : epaperItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No e-paper editions uploaded yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>File</TableHead>
                          <TableHead className="w-[180px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {epaperItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-sm">
                              {new Date(item.publication_date).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </TableCell>
                            <TableCell className="text-sm">{item.title}</TableCell>
                            <TableCell className="text-xs">
                              <a
                                href={getMediaUrl(item.pdf_file)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline"
                              >
                                Open PDF
                              </a>
                            </TableCell>
                            <TableCell className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(getMediaUrl(item.pdf_file), "_blank")}
                              >
                                View
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => handleDeleteEpaper(item.id)}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit article</DialogTitle>
            </DialogHeader>
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
                  <Switch checked={editFeatured} onCheckedChange={setEditFeatured} />
                  <span className="text-sm">Featured</span>
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
                    ) : (
                      <div className="space-y-2">
                        <Label>File</Label>
                        <Input type="file" accept={mediaType === "IMAGE" ? "image/*" : "video/*"} onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)} />
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

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Close</Button>
                  <Button type="button" onClick={saveEdit} disabled={editSaving}>
                    {editSaving ? "Saving…" : "Save changes"}
                  </Button>
                </DialogFooter>
              </div>
            )}
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

