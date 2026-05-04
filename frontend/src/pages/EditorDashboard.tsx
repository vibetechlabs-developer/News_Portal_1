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
  createTag,
  deleteTag,
  updateTag,

  getMediaUrl,
  getEpaperEditions,
  createEpaperEdition,
  deleteEpaperEdition,
  type SectionItem,
  type CategoryItem,
  type DistrictItem,
  type TagItem,
  type ArticleListItem,

  type EpaperEditionItem,
  getVideosAdmin,
  createVideoContentAdmin,
  updateVideoContentAdmin,
  deleteVideoContentAdmin,
  getReelsAdmin,
  createReelContentAdmin,
  updateReelContentAdmin,
  deleteReelContentAdmin,
  type VideoContentItem,
  type ReelContentItem,
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
  // Main article fields (can be strictly any language now)
  const [sectionId, setSectionId] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [districtId, setDistrictId] = useState<number | "">("");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);
  const [deletingTag, setDeletingTag] = useState(false);
  const [editingTag, setEditingTag] = useState(false);
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [publishedAt, setPublishedAt] = useState<string>("");
  const [primaryLanguage, setPrimaryLanguage] = useState<"EN" | "HI" | "GU">("GU");
  const [isBreaking, setIsBreaking] = useState(false);
  const [isTop, setIsTop] = useState(false);
  const [isEditorPick, setIsEditorPick] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Create-form featured image
  const [createFeaturedImageFile, setCreateFeaturedImageFile] = useState<File | null>(null);

  const [createViewCount, setCreateViewCount] = useState<number | "">("");
  const [createLikesCount, setCreateLikesCount] = useState<number | "">("");

  // Create-form Poll fields
  const [createPollQuestion, setCreatePollQuestion] = useState("");
  const [createPollOptions, setCreatePollOptions] = useState<string[]>(["", ""]);

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
  const [editPublishedAt, setEditPublishedAt] = useState<string>("");
  const [editBreaking, setEditBreaking] = useState(false);
  const [editTop, setEditTop] = useState(false);
  const [editEditorPick, setEditEditorPick] = useState(false);
  const [editTrending, setEditTrending] = useState(false);
  const [editSelectedTagIds, setEditSelectedTagIds] = useState<number[]>([]);
  const [editDistrictId, setEditDistrictId] = useState<number | "">("");
  const [editDistrictOptions, setEditDistrictOptions] = useState<DistrictItem[]>([]);
  const [editFeaturedImageFile, setEditFeaturedImageFile] = useState<File | null>(null);

  const [editViewCount, setEditViewCount] = useState<number | "">("");
  const [editLikesCount, setEditLikesCount] = useState<number | "">("");

  // Edit Poll fields
  const [editPollQuestion, setEditPollQuestion] = useState("");
  const [editPollOptions, setEditPollOptions] = useState<string[]>(["", ""]);



  // E-paper upload
  const [epaperPublicationDate, setEpaperPublicationDate] = useState("");
  const [epaperTitle, setEpaperTitle] = useState("");
  const [epaperPdfFile, setEpaperPdfFile] = useState<File | null>(null);
  const [epaperUploading, setEpaperUploading] = useState(false);
  const [epaperEditions, setEpaperEditions] = useState<EpaperEditionItem[]>([]);
  const [epaperLoading, setEpaperLoading] = useState(false);

  // Media Tab (Reels & Videos)
  const [mediaTabType, setMediaTabType] = useState<"VIDEO" | "REEL">("VIDEO");
  const [mediaTabTitle, setMediaTabTitle] = useState("");
  const [mediaTabFile, setMediaTabFile] = useState<File | null>(null);
  const [mediaTabYoutube, setMediaTabYoutube] = useState("");
  const [mediaTabIsLive, setMediaTabIsLive] = useState(false);
  const [mediaTabViewCount, setMediaTabViewCount] = useState<number | "">("");
  const [mediaTabLikesCount, setMediaTabLikesCount] = useState<number | "">("");
  const [mediaTabUploading, setMediaTabUploading] = useState(false);
  const [mediaTabLoading, setMediaTabLoading] = useState(false);
  const [mediaTabItems, setMediaTabItems] = useState<Array<(VideoContentItem | ReelContentItem) & { _type: "VIDEO" | "REEL" }>>([]);

  const [mediaEditOpen, setMediaEditOpen] = useState(false);
  const [mediaEditItem, setMediaEditItem] = useState<((VideoContentItem | ReelContentItem) & { _type: "VIDEO" | "REEL" }) | null>(null);
  const [mediaEditTitleEn, setMediaEditTitleEn] = useState("");
  const [mediaEditSectionId, setMediaEditSectionId] = useState<number | "">("");
  const [mediaEditStatus, setMediaEditStatus] = useState<string>("PUBLISHED");
  const [mediaEditIsLive, setMediaEditIsLive] = useState(false);
  const [mediaEditPrimaryLanguage, setMediaEditPrimaryLanguage] = useState<"EN" | "HI" | "GU">("GU");
  const [mediaEditYoutube, setMediaEditYoutube] = useState("");
  const [mediaEditYoutubeOriginal, setMediaEditYoutubeOriginal] = useState("");
  const [mediaEditFile, setMediaEditFile] = useState<File | null>(null);
  const [mediaEditViewCount, setMediaEditViewCount] = useState(0);
  const [mediaEditLikesCount, setMediaEditLikesCount] = useState(0);
  const [mediaEditSaving, setMediaEditSaving] = useState(false);

  /** Quick dialog: only manual view_count + likes_count (no other fields). */
  const [mediaManualCountsOpen, setMediaManualCountsOpen] = useState(false);
  const [mediaManualCountsItem, setMediaManualCountsItem] = useState<
    ((VideoContentItem | ReelContentItem) & { _type: "VIDEO" | "REEL" }) | null
  >(null);
  const [mediaManualCountsViews, setMediaManualCountsViews] = useState(0);
  const [mediaManualCountsLikes, setMediaManualCountsLikes] = useState(0);
  const [mediaManualCountsSaving, setMediaManualCountsSaving] = useState(false);

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

  // Load districts when section changes (for any section that has districts)
  useEffect(() => {
    let cancelled = false;
    setDistricts([]);
    setDistrictId("");
    if (!sectionId) return;
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
  }, [sectionId]);

  const sectionOptions = useMemo(
    () => sections.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [sections]
  );

  // Load districts for the edit dialog when editSectionId changes
  useEffect(() => {
    let cancelled = false;
    setEditDistrictOptions([]);
    setEditDistrictId("");
    if (!editSectionId) return;
    (async () => {
      try {
        const data = await getDistricts({ section: Number(editSectionId), is_active: true });
        if (!cancelled) setEditDistrictOptions(Array.isArray(data) ? data : []);
      } catch {
        // silently skip
      }
    })();
    return () => { cancelled = true; };
  }, [editSectionId]);

  const handleAddTag = async (e: React.MouseEvent, isEditForm: boolean) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    setCreatingTag(true);
    try {
      const created = await createTag({ name: newTagName.trim() });
      setTags((prev) => [...prev, created]);
      if (isEditForm) {
        setEditSelectedTagIds((prev) => [...prev, created.id]);
      } else {
        setSelectedTagIds((prev) => [...prev, created.id]);
      }
      setNewTagName("");
      toast({ title: "Tag created" });
    } catch (err) {
      toast({
        title: "Failed to create tag",
        description: err instanceof ApiError ? formatApiErrorDetails(err) : String(err),
        variant: "destructive",
      });
    } finally {
      setCreatingTag(false);
    }
  };

  const handleSaveEditTag = async (e: React.MouseEvent, isEditForm: boolean) => {
    e.preventDefault();
    if (!editingTagId || !newTagName.trim()) return;

    const tagToEdit = tags.find(t => t.id === editingTagId);
    if (!tagToEdit || !tagToEdit.slug) return;
    
    if (newTagName.trim() === tagToEdit.name) {
      // No change made, just cancel
      setEditingTagId(null);
      setNewTagName("");
      return;
    }

    setEditingTag(true);
    try {
      const updatedTag = await updateTag(tagToEdit.slug, { name: newTagName.trim() });
      setTags(prev => prev.map(t => t.id === updatedTag.id ? updatedTag : t));
      toast({ title: "Tag updated successfully" });
      setEditingTagId(null);
      setNewTagName("");
    } catch (err) {
      toast({
        title: "Failed to update tag",
        description: err instanceof ApiError ? formatApiErrorDetails(err) : String(err),
        variant: "destructive",
      });
    } finally {
      setEditingTag(false);
    }
  };

  const handleCancelEditTag = () => {
    setEditingTagId(null);
    setNewTagName("");
  };

  const handleDeleteTags = async (e: React.MouseEvent, isEditForm: boolean) => {
    e.preventDefault();
    const selectedIds = isEditForm ? editSelectedTagIds : selectedTagIds;
    if (selectedIds.length === 0) return;

    if (!confirm("Are you sure you want to delete the selected tags? This will remove them from all articles.")) return;

    setDeletingTag(true);
    try {
      const tagsToDelete = tags.filter((t) => selectedIds.includes(t.id));

      for (const t of tagsToDelete) {
        if (t.slug) {
          await deleteTag(t.slug);
        }
      }

      setTags((prev) => prev.filter((t) => !selectedIds.includes(t.id)));
      if (isEditForm) {
        setEditSelectedTagIds([]);
      } else {
        setSelectedTagIds([]);
      }
      toast({ title: "Tags deleted successfully" });
    } catch (err) {
      toast({
        title: "Failed to delete tags",
        description: err instanceof ApiError ? formatApiErrorDetails(err) : String(err),
        variant: "destructive",
      });
    } finally {
      setDeletingTag(false);
    }
  };

  const handleEditTags = async (e: React.MouseEvent, isEditForm: boolean) => {
    e.preventDefault();
    const selectedIds = isEditForm ? editSelectedTagIds : selectedTagIds;
    if (selectedIds.length !== 1) {
      toast({ title: "Please select exactly one tag to edit", variant: "destructive" });
      return;
    }

    const tagToEdit = tags.find(t => t.id === selectedIds[0]);
    if (!tagToEdit || !tagToEdit.slug) return;

    setEditingTagId(tagToEdit.id);
    setNewTagName(tagToEdit.name);
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
        summary_en: summary,
        content_en: content,
        section: Number(sectionId),
        status,
        published_at: publishedAt ? new Date(publishedAt).toISOString() : undefined,
        category: categoryId ? Number(categoryId) : undefined,
        district: districtId ? Number(districtId) : undefined,
        tags: selectedTagIds,
        is_breaking: isBreaking,
        is_top: isTop,
        is_trending: isTrending,
        is_editor_pick: isEditorPick,
        view_count: createViewCount === "" ? undefined : createViewCount,
        likes_count: createLikesCount === "" ? undefined : createLikesCount,
      };

      const created = await createArticle(payload);
      
      // Optional: create poll
      if (createPollQuestion.trim()) {
        try {
          const validOptions = createPollOptions.filter(opt => opt.trim() !== "");
          if (validOptions.length >= 2) {
            import('@/lib/api').then(({ createPoll }) => {
              createPoll({
                article: created.id,
                question: createPollQuestion.trim(),
                options: validOptions.map(text => ({ text: text.trim() })),
              }).catch(err => {
                toast({
                  title: "Article saved, but poll creation failed",
                  description: err instanceof Error ? err.message : "You can try adding it from the Edit dialog.",
                  variant: "destructive",
                });
              });
            });
          }
        } catch (err) {
            // Failed silently to not block article creation success state
        }
      }

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



      setTitle("");
      setSummary("");
      setContent("");
      setSectionId("");
      setStatus("DRAFT");
      setPublishedAt("");
      setCategoryId("");
      setDistrictId("");
      setSelectedTagIds([]);
      setEditingTagId(null);
      setNewTagName("");
      setIsBreaking(false);
      setIsTop(false);
      setIsTrending(false);
      setIsEditorPick(false);
      setCreateFeaturedImageFile(null);
      setCreateViewCount("");
      setCreateLikesCount("");
      setCreatePollQuestion("");
      setCreatePollOptions(["", ""]);

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
      setEditSectionId(a.section ?? "");
      setEditDistrictId(a.district ?? "");
      setEditSelectedTagIds(a.tags ?? []);
      const s = a.status;
      setEditStatus(s === "PUBLISHED" || s === "ARCHIVED" || s === "DRAFT" ? s : "DRAFT");
      
      if (a.published_at) {
        const d = new Date(a.published_at);
        const tzoffset = d.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, 16);
        setEditPublishedAt(localISOTime);
      } else {
        setEditPublishedAt("");
      }
      setEditBreaking(!!a.is_breaking);
      setEditTop(!!a.is_top);
      setEditTrending(!!a.is_trending);
      setEditEditorPick(!!(a as any).is_editor_pick);
      setEditViewCount(typeof a.view_count === "number" ? a.view_count : "");
      setEditLikesCount(typeof a.likes_count === "number" ? a.likes_count : "");

      if (a.poll) {
        setEditPollQuestion(a.poll.question);
        setEditPollOptions(a.poll.options.map(opt => opt.text));
      } else {
        setEditPollQuestion("");
        setEditPollOptions(["", ""]);
      }
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
        district: editDistrictId ? Number(editDistrictId) : null,
        status: editStatus,
        published_at: editPublishedAt ? new Date(editPublishedAt).toISOString() : undefined,
        is_breaking: editBreaking,
        is_top: editTop,
        is_trending: editTrending,
        is_editor_pick: editEditorPick,
        view_count: editViewCount === "" ? undefined : editViewCount,
        likes_count: editLikesCount === "" ? undefined : editLikesCount,
        tags: editSelectedTagIds,
      });
      if (editFeaturedImageFile) {
        await updateArticleFeaturedImage(editSlug, editFeaturedImageFile);
      }

      // Handle Poll Updates
      if (editPollQuestion.trim()) {
        const validOptions = editPollOptions.filter(opt => opt.trim() !== "");
        if (validOptions.length >= 2) {
          const apiModule = await import('@/lib/api');
          const pollPayload = {
            article: updated.id,
            question: editPollQuestion.trim(),
            options: validOptions.map(text => ({ text: text.trim() })),
          };
          if (editArticle?.poll?.id) {
            await apiModule.updatePoll(editArticle.poll.id, pollPayload).catch(() => {});
          } else {
            await apiModule.createPoll(pollPayload).catch(() => {});
          }
        }
      } else if (editArticle?.poll?.id && !editPollQuestion.trim()) {
         // User cleared the poll question, delete the poll
         const apiModule = await import('@/lib/api');
         await apiModule.deletePoll(editArticle.poll.id).catch(() => {});
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
      // Immediately remove from UI state (don't re-fetch — server list cache may not have updated yet)
      setManageResults((prev) => prev.filter((a) => a.slug !== slug));
      toast({ title: "Article deleted" });
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

  // Media Tab Functions
  const loadMediaTabContent = async () => {
    setMediaTabLoading(true);
    try {
      const [videos, reels] = await Promise.all([
        getVideosAdmin(),
        getReelsAdmin()
      ]);
      const vItems = Array.isArray(videos.results) ? videos.results.map(v => ({ ...v, _type: "VIDEO" as const })) : [];
      const rItems = Array.isArray(reels.results) ? reels.results.map(r => ({ ...r, _type: "REEL" as const })) : [];

      const combined = [...vItems, ...rItems].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setMediaTabItems(combined);
    } catch (err) {
      console.error("Failed to load media tab content:", err);
      toast({ title: "Could not load videos/reels", variant: "destructive" });
    } finally {
      setMediaTabLoading(false);
    }
  };

  const handleMediaTabSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) return toast({ title: "Not authenticated", variant: "destructive" });
    if (!mediaTabTitle) return toast({ title: "Title required", variant: "destructive" });
    if (!mediaTabFile && !mediaTabYoutube.trim()) return toast({ title: "File or YouTube URL required", variant: "destructive" });

    setMediaTabUploading(true);
    try {
      const targetSectionId = sections.find(s => s.slug.toLowerCase() === (mediaTabType === "VIDEO" ? "videos" : "reels"))?.id || sections[0]?.id || 1;

      const payload = {
        title_en: mediaTabTitle,
        section: targetSectionId,
        file: mediaTabFile,
        youtube_url: mediaTabYoutube.trim() || undefined,
        status: "PUBLISHED",
        is_live: mediaTabIsLive,
        primary_language: "GU",
        ...(mediaTabViewCount !== "" ? { view_count: mediaTabViewCount } : {}),
        ...(mediaTabLikesCount !== "" ? { likes_count: mediaTabLikesCount } : {}),
      };

      if (mediaTabType === "VIDEO") await createVideoContentAdmin(payload);
      else await createReelContentAdmin(payload);

      toast({ title: `${mediaTabType === "VIDEO" ? "Video" : "Reel"} uploaded successfully` });
      setMediaTabTitle("");
      setMediaTabFile(null);
      setMediaTabYoutube("");
      setMediaTabIsLive(false);
      setMediaTabViewCount("");
      setMediaTabLikesCount("");
      await loadMediaTabContent();
    } catch (err) {
      const errorMsg = err instanceof ApiError ? formatApiErrorDetails(err) : String(err);
      toast({ title: "Upload failed", description: errorMsg, variant: "destructive" });
    } finally {
      setMediaTabUploading(false);
    }
  };

  const removeMediaTabContent = async (id: number, type: "VIDEO" | "REEL") => {
    if (!confirm(`Are you sure you want to delete this ${type.toLowerCase()}?`)) return;
    try {
      if (type === "VIDEO") await deleteVideoContentAdmin(id);
      else await deleteReelContentAdmin(id);
      toast({ title: "Deleted successfully" });
      await loadMediaTabContent();
    } catch (e) {
      toast({ title: "Delete failed", variant: "destructive", description: String(e) });
    }
  };

  const openMediaEditDialog = (item: (VideoContentItem | ReelContentItem) & { _type: "VIDEO" | "REEL" }) => {
    setMediaEditItem(item);
    setMediaEditTitleEn(item.title_en);
    setMediaEditSectionId(item.section);
    setMediaEditStatus(item.status || "PUBLISHED");
    setMediaEditIsLive(!!item.is_live);
    const lang = item.primary_language;
    setMediaEditPrimaryLanguage(lang === "EN" || lang === "HI" || lang === "GU" ? lang : "GU");
    const y = (item.youtube_url ?? "").trim();
    setMediaEditYoutube(item.youtube_url ?? "");
    setMediaEditYoutubeOriginal(y);
    setMediaEditFile(null);
    setMediaEditViewCount(typeof item.view_count === "number" ? item.view_count : 0);
    setMediaEditLikesCount(typeof item.likes_count === "number" ? item.likes_count : 0);
    setMediaEditOpen(true);
  };

  const resetMediaEditForm = () => {
    setMediaEditItem(null);
    setMediaEditTitleEn("");
    setMediaEditSectionId("");
    setMediaEditYoutube("");
    setMediaEditYoutubeOriginal("");
    setMediaEditFile(null);
  };

  const saveMediaEdit = async () => {
    if (!mediaEditItem) return;
    const title = mediaEditTitleEn.trim();
    if (!title) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    if (mediaEditSectionId === "") {
      toast({ title: "Section required", variant: "destructive" });
      return;
    }
    const patch: Parameters<typeof updateVideoContentAdmin>[1] = {
      title_en: title,
      section: Number(mediaEditSectionId),
      status: mediaEditStatus,
      primary_language: mediaEditPrimaryLanguage,
      is_live: mediaEditIsLive,
      view_count: Math.max(0, Number(mediaEditViewCount) || 0),
      likes_count: Math.max(0, Number(mediaEditLikesCount) || 0),
    };
    const ytNow = mediaEditYoutube.trim();
    if (ytNow !== mediaEditYoutubeOriginal) {
      patch.youtube_url = ytNow;
    }
    if (mediaEditFile) {
      patch.file = mediaEditFile;
    }
    setMediaEditSaving(true);
    try {
      if (mediaEditItem._type === "VIDEO") {
        await updateVideoContentAdmin(mediaEditItem.id, patch);
      } else {
        await updateReelContentAdmin(mediaEditItem.id, patch);
      }
      toast({ title: "Saved" });
      setMediaEditOpen(false);
      resetMediaEditForm();
      await loadMediaTabContent();
    } catch (err) {
      const errorMsg = err instanceof ApiError ? formatApiErrorDetails(err) : String(err);
      toast({ title: "Update failed", description: errorMsg, variant: "destructive" });
    } finally {
      setMediaEditSaving(false);
    }
  };

  const resetMediaManualCounts = () => {
    setMediaManualCountsItem(null);
    setMediaManualCountsViews(0);
    setMediaManualCountsLikes(0);
  };

  const openMediaManualCountsDialog = (item: (VideoContentItem | ReelContentItem) & { _type: "VIDEO" | "REEL" }) => {
    setMediaManualCountsItem(item);
    setMediaManualCountsViews(typeof item.view_count === "number" ? item.view_count : 0);
    setMediaManualCountsLikes(typeof item.likes_count === "number" ? item.likes_count : 0);
    setMediaManualCountsOpen(true);
  };

  const saveMediaManualCounts = async () => {
    if (!mediaManualCountsItem) return;
    const patch = {
      view_count: Math.max(0, Number(mediaManualCountsViews) || 0),
      likes_count: Math.max(0, Number(mediaManualCountsLikes) || 0),
    };
    setMediaManualCountsSaving(true);
    try {
      if (mediaManualCountsItem._type === "VIDEO") {
        await updateVideoContentAdmin(mediaManualCountsItem.id, patch);
      } else {
        await updateReelContentAdmin(mediaManualCountsItem.id, patch);
      }
      toast({ title: "Manual views & likes saved" });
      setMediaManualCountsOpen(false);
      resetMediaManualCounts();
      await loadMediaTabContent();
    } catch (err) {
      const errorMsg = err instanceof ApiError ? formatApiErrorDetails(err) : String(err);
      toast({ title: "Could not save counts", description: errorMsg, variant: "destructive" });
    } finally {
      setMediaManualCountsSaving(false);
    }
  };

  // Load e-paper editions on mount
  useEffect(() => {
    loadEpaperEditions();
  }, []);

  // Get current local datetime for the max attribute
  const currentLocalDateTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

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
            <TabsTrigger value="media" onClick={() => loadMediaTabContent()}>Reels & Videos</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
              <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold">Create article</h2>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Content Studio</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter headline..." required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Summary</Label>
                  <textarea
                    id="summary"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={2}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>



                <div className="space-y-2">
                  <Label htmlFor="featured-image">Featured image (optional)</Label>
                  <Input
                    id="featured-image"
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
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
                    <Label htmlFor="publishedAt">Publish Date & Time (Optional)</Label>
                    <Input
                      id="publishedAt"
                      type="datetime-local"
                      value={publishedAt}
                      max={currentLocalDateTime}
                      onChange={(e) => setPublishedAt(e.target.value)}
                    />
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

                  {districts.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="district">
                        {sections.find(s => s.id === Number(sectionId))?.slug === 'national' ? 'State / Region' : 'District'}
                      </Label>
                      <select
                        id="district"
                        value={districtId}
                        onChange={(e) => setDistrictId(e.target.value ? Number(e.target.value) : "")}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">
                          {sections.find(s => s.id === Number(sectionId))?.slug === 'national' ? 'No state selected' : 'No district'}
                        </option>
                        {districts.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name_en}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
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
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder={editingTagId ? "Edit tag name..." : "New tag name"}
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (editingTagId) {
                              handleSaveEditTag(e as any, false);
                            } else {
                              handleAddTag(e as any, false);
                            }
                          }
                        }}
                      />
                      {editingTagId ? (
                        <>
                          <Button
                            type="button"
                            variant="default"
                            onClick={(e) => handleSaveEditTag(e, false)}
                            disabled={editingTag || !newTagName.trim()}
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancelEditTag}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={(e) => handleAddTag(e, false)}
                            disabled={creatingTag || !newTagName.trim()}
                          >
                            Add
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={(e) => handleEditTags(e, false)}
                            disabled={editingTag || selectedTagIds.length !== 1}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={(e) => handleDeleteTags(e, false)}
                            disabled={deletingTag || selectedTagIds.length === 0}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Flags</Label>
                    <div className="flex flex-col gap-2 text-xs">
                      <label className="flex items-center justify-between gap-2">
                        <span>Is Breaking</span>
                        <Switch checked={isBreaking} onCheckedChange={setIsBreaking} />
                      </label>
                      <label className="flex items-center justify-between gap-2">
                        <span>Is Top</span>
                        <Switch checked={isTop} onCheckedChange={setIsTop} />
                      </label>
                      <label className="flex items-center justify-between gap-2">
                        <span>Is Trending</span>
                        <Switch checked={isTrending} onCheckedChange={setIsTrending} />
                      </label>
                      <label className="flex items-center justify-between gap-2">
                        <span>Editor's Pick</span>
                        <Switch checked={isEditorPick} onCheckedChange={setIsEditorPick} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs mt-4">
                  <div className="space-y-2">
                    <Label>Manual views (optional)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Optional"
                      value={createViewCount}
                      onChange={(e) => setCreateViewCount(e.target.value ? Number(e.target.value) : "")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Manual likes (optional)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Optional"
                      value={createLikesCount}
                      onChange={(e) => setCreateLikesCount(e.target.value ? Number(e.target.value) : "")}
                    />
                  </div>
                </div>

                {/* Poll Creation Section */}
                <div className="mt-6 border-t pt-4 space-y-4">
                  <h3 className="text-sm font-semibold">Attach Poll (Optional)</h3>
                  <div className="space-y-2">
                    <Label>Question</Label>
                    <Input
                      placeholder="e.g. Who will win the 2024 elections?"
                      value={createPollQuestion}
                      onChange={(e) => setCreatePollQuestion(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Options</Label>
                    {createPollOptions.map((opt, idx) => (
                      <div key={idx} className="flex gap-2 items-center mb-2">
                        <Input
                          placeholder={`Option ${idx + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...createPollOptions];
                            newOpts[idx] = e.target.value;
                            setCreatePollOptions(newOpts);
                          }}
                        />
                        {createPollOptions.length > 2 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const newOpts = createPollOptions.filter((_, i) => i !== idx);
                              setCreatePollOptions(newOpts);
                            }}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCreatePollOptions([...createPollOptions, ""])}
                    >
                      Add Option
                    </Button>
                  </div>
                </div>

                <div className="mt-4">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : "Save"}
                  </Button>
                </div>
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
                      <TableHead className="w-[260px]">Actions</TableHead>
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
                          <TableCell className="flex flex-wrap gap-2">
                            {a.status === "DRAFT" && (
                              <Button
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await updateArticle(a.slug, { status: "PUBLISHED" });
                                    toast({ title: "Article published" });
                                    loadManage();
                                  } catch (e) {
                                    toast({
                                      title: "Publish failed",
                                      variant: "destructive",
                                      description: String(e),
                                    });
                                  }
                                }}
                              >
                                Publish
                              </Button>
                            )}
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
                    Upload PDF file for the e-paper edition. Maximum recommended file size: 500MB
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

          <TabsContent value="media" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
              <form onSubmit={handleMediaTabSubmit} className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-semibold">Upload Reel or Video</h2>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Media Studio</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="media-tab-title">Title *</Label>
                  <Input
                    id="media-tab-title"
                    value={mediaTabTitle}
                    onChange={(e) => setMediaTabTitle(e.target.value)}
                    placeholder="Enter a catchy title..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="media-tab-type">Media Type *</Label>
                  <select
                    id="media-tab-type"
                    value={mediaTabType}
                    onChange={(e) => setMediaTabType(e.target.value as "VIDEO" | "REEL")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="VIDEO">Video (Horizontal)</option>
                    <option value="REEL">Reel (Vertical)</option>
                  </select>
                </div>

                <div className="space-y-4 pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground font-medium">Upload a video file OR paste a YouTube link</p>
                  <div className="space-y-2">
                    <Label htmlFor="media-tab-file">File</Label>
                    <Input
                      id="media-tab-file"
                      type="file"
                      accept="video/*"
                      onChange={(e) => setMediaTabFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="media-tab-youtube">YouTube URL</Label>
                    <Input
                      id="media-tab-youtube"
                      value={mediaTabYoutube}
                      onChange={(e) => setMediaTabYoutube(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-border">
                  <Label htmlFor="media-tab-is-live">Is Live Broadcast?</Label>
                  <Switch id="media-tab-is-live" checked={mediaTabIsLive} onCheckedChange={setMediaTabIsLive} />
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="media-tab-view-count">Manual view count (optional)</Label>
                    <Input
                      id="media-tab-view-count"
                      type="number"
                      min={0}
                      placeholder="Starts at 0"
                      value={mediaTabViewCount}
                      onChange={(e) => setMediaTabViewCount(e.target.value ? Number(e.target.value) : "")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="media-tab-likes-count">Manual likes count (optional)</Label>
                    <Input
                      id="media-tab-likes-count"
                      type="number"
                      min={0}
                      placeholder="Starts at 0"
                      value={mediaTabLikesCount}
                      onChange={(e) => setMediaTabLikesCount(e.target.value ? Number(e.target.value) : "")}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={mediaTabUploading || loadingSections} className="w-full mt-4">
                  {mediaTabUploading ? "Uploading..." : `Upload ${mediaTabType === "VIDEO" ? "Video" : "Reel"}`}
                </Button>
              </form>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Recently uploaded</CardTitle>
                  <p className="text-xs text-muted-foreground font-normal pt-1">
                    <strong>Manual views & likes</strong> sets displayed counts only.
                    {" "}
                    <strong>Edit</strong> changes title, section, status, link, file, live, language, and counts together.
                  </p>
                </CardHeader>
                <CardContent>
                  {mediaTabLoading ? (
                    <p className="text-xs text-muted-foreground">Loading...</p>
                  ) : mediaTabItems.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No reels or videos uploaded yet.</p>
                  ) : (
                    <ul className="space-y-2 text-xs">
                      {mediaTabItems.map((item) => (
                        <li key={`${item._type}-${item.id}`} className="flex items-start justify-between gap-2 border-b border-border/60 pb-2 last:border-0 last:pb-0">
                          <div>
                            <p className="font-medium line-clamp-2">{item.title_en}</p>
                            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                              {item._type} • Status: {item.status}{item.is_live ? " • LIVE" : ""}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Views: {item.view_count ?? 0} · Likes: {item.likes_count ?? 0}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <Button type="button" variant="outline" size="sm" className="h-7 text-xs px-2" onClick={() => openMediaManualCountsDialog(item)}>
                              Manual views & likes
                            </Button>
                            <Button type="button" variant="secondary" size="sm" className="h-7 text-xs px-2" onClick={() => openMediaEditDialog(item)}>
                              Edit
                            </Button>
                            <button
                              type="button"
                              onClick={() => removeMediaTabContent(item.id, item._type)}
                              className="text-[11px] font-medium text-destructive hover:underline"
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
                      <Label>Title</Label>
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

                  {/* District dropdown — shown when the selected section has districts */}
                  {editDistrictOptions.length > 0 && (
                    <div className="space-y-2">
                      <Label>
                        {sectionOptions.find(s => s.id === Number(editSectionId))?.slug === 'national' ? 'State / Region' : 'District'}
                      </Label>
                      <select
                        value={editDistrictId}
                        onChange={(e) => setEditDistrictId(e.target.value ? Number(e.target.value) : "")}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">
                          {sectionOptions.find(s => s.id === Number(editSectionId))?.slug === 'national' ? 'No state selected' : 'No district'}
                        </option>
                        {editDistrictOptions.map((d) => (
                          <option key={d.id} value={d.id}>{d.name_en}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="edit-tags">Tags</Label>
                    <select
                      id="edit-tags"
                      multiple
                      value={editSelectedTagIds.map((id) => String(id))}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions).map((opt) => Number(opt.value));
                        setEditSelectedTagIds(selected);
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
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder={editingTagId ? "Edit tag name..." : "New tag name"}
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (editingTagId) {
                                handleSaveEditTag(e as any, true);
                            } else {
                                handleAddTag(e as any, true);
                            }
                          }
                        }}
                      />
                      {editingTagId ? (
                        <>
                          <Button
                            type="button"
                            variant="default"
                            onClick={(e) => handleSaveEditTag(e, true)}
                            disabled={editingTag || !newTagName.trim()}
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancelEditTag}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={(e) => handleAddTag(e, true)}
                            disabled={creatingTag || !newTagName.trim()}
                          >
                            Add
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={(e) => handleEditTags(e, true)}
                            disabled={editingTag || editSelectedTagIds.length !== 1}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={(e) => handleDeleteTags(e, true)}
                            disabled={deletingTag || editSelectedTagIds.length === 0}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Summary</Label>
                    <textarea value={editSummaryEn} onChange={(e) => setEditSummaryEn(e.target.value)} rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  </div>

                  <div className="space-y-2">
                    <Label>Content</Label>
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
                    <div className="space-y-2">
                      <Label>Publish Date & Time</Label>
                      <Input
                        type="datetime-local"
                        value={editPublishedAt}
                        max={currentLocalDateTime}
                        onChange={(e) => setEditPublishedAt(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-7">
                      <Switch checked={editBreaking} onCheckedChange={setEditBreaking} />
                      <span className="text-sm">Breaking</span>
                    </div>
                    <div className="flex items-center gap-2 pt-7">
                      <Switch checked={editTop} onCheckedChange={setEditTop} />
                      <span className="text-sm">Top</span>
                    </div>
                    <div className="flex items-center gap-2 pt-7">
                      <Switch checked={editEditorPick} onCheckedChange={setEditEditorPick} />
                      <span className="text-sm">⭐ Editor's Pick</span>
                    </div>
                  </div>

                  
                  {/* Manual views / likes (shown on site; optional leave blank to keep unchanged on save) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Manual views</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Optional"
                        value={editViewCount}
                        onChange={(e) => setEditViewCount(e.target.value ? Number(e.target.value) : "")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Manual likes</Label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Optional"
                        value={editLikesCount}
                        onChange={(e) => setEditLikesCount(e.target.value ? Number(e.target.value) : "")}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-2">
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
                    <Input type="file" accept="image/jpeg, image/png, image/webp" onChange={(e) => setEditFeaturedImageFile(e.target.files?.[0] ?? null)} />
                  </div>

                  {/* Poll Editing Section */}
                  <div className="mt-6 border-t pt-4 space-y-4">
                    <h3 className="text-sm font-semibold">Attach/Edit Poll (Optional)</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Leave the question blank to remove an existing poll. Note: changing questions or options will reset all votes.
                    </p>
                    <div className="space-y-2">
                      <Label>Question</Label>
                      <Input
                        placeholder="e.g. Who will win the 2024 elections?"
                        value={editPollQuestion}
                        onChange={(e) => setEditPollQuestion(e.target.value)}
                      />
                    </div>
                    {editPollQuestion.trim() !== "" && (
                      <div className="space-y-2">
                        <Label>Options</Label>
                        {editPollOptions.map((opt, idx) => (
                          <div key={idx} className="flex gap-2 items-center mb-2">
                            <Input
                              placeholder={`Option ${idx + 1}`}
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...editPollOptions];
                                newOpts[idx] = e.target.value;
                                setEditPollOptions(newOpts);
                              }}
                            />
                            {editPollOptions.length > 2 && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  const newOpts = editPollOptions.filter((_, i) => i !== idx);
                                  setEditPollOptions(newOpts);
                                }}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setEditPollOptions([...editPollOptions, ""])}
                        >
                          Add Option
                        </Button>
                      </div>
                    )}
                  </div>


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

        <Dialog
          open={mediaEditOpen}
          onOpenChange={(open) => {
            setMediaEditOpen(open);
            if (!open) resetMediaEditForm();
          }}
        >
          <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90dvh] flex flex-col overflow-hidden p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Edit {mediaEditItem?._type === "REEL" ? "reel" : "video"}</DialogTitle>
            </DialogHeader>
            {mediaEditItem && (
              <div className="space-y-4 py-1 overflow-y-auto min-h-0 pr-1 text-sm">
                <p className="text-xs text-muted-foreground font-mono">
                  {mediaEditItem._type} · ID {mediaEditItem.id}
                  {mediaEditItem.slug ? ` · /${mediaEditItem.slug}` : ""}
                </p>

                <div className="space-y-2">
                  <Label htmlFor="media-edit-title">Title</Label>
                  <Input id="media-edit-title" value={mediaEditTitleEn} onChange={(e) => setMediaEditTitleEn(e.target.value)} placeholder="Title" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="media-edit-section">Section</Label>
                  <select
                    id="media-edit-section"
                    value={mediaEditSectionId}
                    onChange={(e) => setMediaEditSectionId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={loadingSections}
                  >
                    <option value="">Select section…</option>
                    {sectionOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="media-edit-status">Status</Label>
                    <select
                      id="media-edit-status"
                      value={mediaEditStatus}
                      onChange={(e) => setMediaEditStatus(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="media-edit-lang">Language</Label>
                    <select
                      id="media-edit-lang"
                      value={mediaEditPrimaryLanguage}
                      onChange={(e) => setMediaEditPrimaryLanguage(e.target.value as "EN" | "HI" | "GU")}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="GU">Gujarati</option>
                      <option value="HI">Hindi</option>
                      <option value="EN">English</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
                  <Label htmlFor="media-edit-live" className="text-sm font-normal">
                    Live broadcast
                  </Label>
                  <Switch id="media-edit-live" checked={mediaEditIsLive} onCheckedChange={setMediaEditIsLive} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="media-edit-youtube">YouTube URL</Label>
                  <Input
                    id="media-edit-youtube"
                    value={mediaEditYoutube}
                    onChange={(e) => setMediaEditYoutube(e.target.value)}
                    placeholder="https://www.youtube.com/…"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    If this item only uses YouTube (no uploaded file), keep a valid URL or upload a file below. Changing the URL updates the link; clearing it removes the link only if a file is still present.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="media-edit-file">Replace video file (optional)</Label>
                  <Input
                    id="media-edit-file"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setMediaEditFile(e.target.files?.[0] ?? null)}
                  />
                  {mediaEditFile && (
                    <p className="text-[11px] text-muted-foreground">Selected: {mediaEditFile.name}</p>
                  )}
                </div>

                <div className="rounded-md border border-border/80 bg-muted/30 px-3 py-2 space-y-3">
                  <p className="text-xs font-medium text-foreground">Manual counts (shown on the site)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="media-edit-views">Views</Label>
                      <Input
                        id="media-edit-views"
                        type="number"
                        min={0}
                        value={mediaEditViewCount}
                        onChange={(e) => setMediaEditViewCount(Math.max(0, Number(e.target.value) || 0))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="media-edit-likes">Likes</Label>
                      <Input
                        id="media-edit-likes"
                        type="number"
                        min={0}
                        value={mediaEditLikesCount}
                        onChange={(e) => setMediaEditLikesCount(Math.max(0, Number(e.target.value) || 0))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="pt-2 border-t border-border shrink-0">
              <Button type="button" variant="outline" onClick={() => { setMediaEditOpen(false); resetMediaEditForm(); }}>
                Cancel
              </Button>
              <Button type="button" onClick={saveMediaEdit} disabled={mediaEditSaving || !mediaEditItem}>
                {mediaEditSaving ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={mediaManualCountsOpen}
          onOpenChange={(open) => {
            setMediaManualCountsOpen(open);
            if (!open) resetMediaManualCounts();
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Manual views & likes</DialogTitle>
            </DialogHeader>
            {mediaManualCountsItem && (
              <div className="space-y-4 py-2">
                <p className="text-sm line-clamp-2">{mediaManualCountsItem.title_en}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {mediaManualCountsItem._type} · ID {mediaManualCountsItem.id}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Set the numbers shown for views and likes on the website. Real views/likes from visitors can still change these later unless you edit again.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="media-manual-views">Views</Label>
                    <Input
                      id="media-manual-views"
                      type="number"
                      min={0}
                      value={mediaManualCountsViews}
                      onChange={(e) => setMediaManualCountsViews(Math.max(0, Number(e.target.value) || 0))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="media-manual-likes">Likes</Label>
                    <Input
                      id="media-manual-likes"
                      type="number"
                      min={0}
                      value={mediaManualCountsLikes}
                      onChange={(e) => setMediaManualCountsLikes(Math.max(0, Number(e.target.value) || 0))}
                    />
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setMediaManualCountsOpen(false); resetMediaManualCounts(); }}>
                Cancel
              </Button>
              <Button type="button" onClick={saveMediaManualCounts} disabled={mediaManualCountsSaving || !mediaManualCountsItem}>
                {mediaManualCountsSaving ? "Saving…" : "Save views & likes"}
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
    </PageLayout >
  );
};

export default EditorDashboard;

