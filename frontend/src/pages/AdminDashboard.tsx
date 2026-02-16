import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, HelpCircle, Bell } from "lucide-react";
import { careersAPI, type Notification } from "@/lib/careersAPI";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import AdminComponent from "@/components/careers/AdminCareers";
import {
  getBaseUrl,
  getSectionsAdmin,
  getCategoriesAdmin,
  getTagsAdmin,
  createSection,
  updateSection,
  deleteSection,
  createCategory,
  updateCategory,
  deleteCategory,
  createTag,
  updateTag,
  deleteTag,
  approveSection,
  rejectSection,
  approveCategory,
  rejectCategory,
  approveTag,
  rejectTag,
  listUsersAdmin,
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  listAdSlotsAdmin,
  createAdSlotAdmin,
  updateAdSlotAdmin,
  deleteAdSlotAdmin,
  listAdvertisementsAdmin,
  createAdvertisementAdmin,
  updateAdvertisementAdmin,
  deleteAdvertisementAdmin,
  listAdvertisementRequestsAdmin,
  updateAdvertisementRequestAdmin,
  getSiteSettings,
  updateSiteSettings,
  listNewsViews,
  type SectionItem,
  type CategoryItem,
  type TagItem,
  type SectionPayload,
  type CategoryPayload,
  type TagPayload,
  type AdminUser,
  type AdminUserPayload,
  type GoogleAdSenseSlot,
  type Advertisement,
  type AdvertisementRequest,
  type AdPlacement,
  type AdType,
  type AdStatus,
  type SiteSettingsData,
  type NewsViewEvent,
} from "@/lib/api";

const adPlacements: { value: AdPlacement; label: string }[] = [
  { value: "TOP", label: "Top" },
  { value: "SIDEBAR_LEFT", label: "Sidebar Left" },
  { value: "SIDEBAR_RIGHT", label: "Sidebar Right" },
  { value: "IN_ARTICLE", label: "In Article" },
  { value: "FOOTER", label: "Footer" },
  { value: "POPUP", label: "Popup" },
];

const adTypes: { value: AdType; label: string }[] = [
  { value: "IMAGE", label: "Image" },
  { value: "VIDEO", label: "Video" },
  { value: "HTML", label: "HTML" },
];

const adStatuses: { value: AdStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "PAUSED", label: "Paused" },
  { value: "ENDED", label: "Ended" },
];

const AdminDashboard = () => {
  const { user, accessToken, logout } = useAuth();
  const { toast } = useToast();

  const [sections, setSections] = useState<SectionItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [adSlots, setAdSlots] = useState<GoogleAdSenseSlot[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [adRequests, setAdRequests] = useState<AdvertisementRequest[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettingsData | null>(null);
  const [siteSaving, setSiteSaving] = useState(false);
  const [newsViews, setNewsViews] = useState<NewsViewEvent[]>([]);
  const [loading, setLoading] = useState({ sections: false, categories: false, tags: false });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const loadSections = useCallback(async () => {
    if (!accessToken) return;
    setLoading((l) => ({ ...l, sections: true }));
    try {
      const data = await getSectionsAdmin();
      setSections(data);
    } catch (e) {
      toast({ title: "Failed to load sections", variant: "destructive", description: String(e) });
    } finally {
      setLoading((l) => ({ ...l, sections: false }));
    }
  }, [accessToken, toast]);

  const loadCategories = useCallback(async () => {
    if (!accessToken) return;
    setLoading((l) => ({ ...l, categories: true }));
    try {
      const data = await getCategoriesAdmin();
      setCategories(data);
    } catch (e) {
      toast({ title: "Failed to load categories", variant: "destructive", description: String(e) });
    } finally {
      setLoading((l) => ({ ...l, categories: false }));
    }
  }, [accessToken, toast]);

  const loadTags = useCallback(async () => {
    if (!accessToken) return;
    setLoading((l) => ({ ...l, tags: true }));
    try {
      const data = await getTagsAdmin();
      setTags(data);
    } catch (e) {
      toast({ title: "Failed to load tags", variant: "destructive", description: String(e) });
    } finally {
      setLoading((l) => ({ ...l, tags: false }));
    }
  }, [accessToken, toast]);

  const loadUsers = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await listUsersAdmin({ page_size: 200 });
      setUsers(data);
    } catch (e) {
      toast({ title: "Failed to load users", variant: "destructive", description: String(e) });
    }
  }, [accessToken, toast]);

  const loadAdSlots = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await listAdSlotsAdmin();
      setAdSlots(data);
    } catch (e) {
      toast({ title: "Failed to load ad slots", variant: "destructive", description: String(e) });
    }
  }, [accessToken, toast]);

  const loadAds = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await listAdvertisementsAdmin({ page_size: 200 });
      setAds(data);
    } catch (e) {
      toast({ title: "Failed to load advertisements", variant: "destructive", description: String(e) });
    }
  }, [accessToken, toast]);

  const loadAdRequests = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await listAdvertisementRequestsAdmin({ page_size: 200 });
      setAdRequests(data);
    } catch (e) {
      toast({ title: "Failed to load ad requests", variant: "destructive", description: String(e) });
    }
  }, [accessToken, toast]);

  const loadSiteSettings = useCallback(async () => {
    try {
      const data = await getSiteSettings();
      setSiteSettings(data);
    } catch (e) {
      toast({ title: "Failed to load site settings", variant: "destructive", description: String(e) });
    }
  }, [toast]);

  const loadNewsViews = useCallback(async () => {
    if (!accessToken) return;
    try {
      const data = await listNewsViews({ page_size: 200, ordering: "-viewed_at" });
      setNewsViews(data);
    } catch (e) {
      toast({ title: "Failed to load analytics", variant: "destructive", description: String(e) });
    }
  }, [accessToken, toast]);

  const loadNotifications = useCallback(async () => {
    if (!accessToken) return;
    try {
      const response = await careersAPI.getNotifications();
      setNotifications(response.data.results || response.data);
    } catch (e) {
      // Silently fail - notifications are not critical
      console.error("Failed to load notifications:", e);
    }
  }, [accessToken]);

  const loadUnreadCount = useCallback(async () => {
    if (!accessToken) return;
    try {
      const response = await careersAPI.getUnreadCount();
      setUnreadCount(response.data.unread_count || 0);
    } catch (e) {
      console.error("Failed to load unread count:", e);
    }
  }, [accessToken]);

  const markNotificationRead = useCallback(async (id: number) => {
    if (!accessToken) return;
    try {
      await careersAPI.markNotificationRead(id);
      await loadNotifications();
      await loadUnreadCount();
    } catch (e) {
      toast({ title: "Failed to mark notification as read", variant: "destructive", description: String(e) });
    }
  }, [accessToken, toast, loadNotifications, loadUnreadCount]);

  const markAllNotificationsRead = useCallback(async () => {
    if (!accessToken) return;
    try {
      await careersAPI.markAllNotificationsRead();
      await loadNotifications();
      await loadUnreadCount();
      toast({ title: "All notifications marked as read" });
    } catch (e) {
      toast({ title: "Failed to mark all notifications as read", variant: "destructive", description: String(e) });
    }
  }, [accessToken, toast, loadNotifications, loadUnreadCount]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);
  useEffect(() => {
    loadTags();
  }, [loadTags]);
  
  // Load notifications on mount and set up polling
  useEffect(() => {
    if (accessToken) {
      loadNotifications();
      loadUnreadCount();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        loadNotifications();
        loadUnreadCount();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [accessToken, loadNotifications, loadUnreadCount]);

  // Section form
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [sectionEditing, setSectionEditing] = useState<SectionItem | null>(null);
  const [sectionForm, setSectionForm] = useState<SectionPayload>({
    name_en: "",
    name_hi: "",
    name_gu: "",
    slug: "",
    order: 0,
    is_active: true,
    parent: null,
  });
  const [sectionSaving, setSectionSaving] = useState(false);
  const [sectionDeleteSlug, setSectionDeleteSlug] = useState<string | null>(null);

  const openAddSection = () => {
    setSectionEditing(null);
    setSectionForm({
      name_en: "",
      name_hi: "",
      name_gu: "",
      slug: "",
      order: 0,
      is_active: true,
      parent: null,
    });
    setSectionDialogOpen(true);
  };

  const openEditSection = (s: SectionItem) => {
    setSectionEditing(s);
    setSectionForm({
      name_en: s.name_en,
      name_hi: s.name_hi ?? "",
      name_gu: s.name_gu ?? "",
      slug: s.slug,
      order: s.order,
      is_active: s.is_active,
      parent: s.parent,
    });
    setSectionDialogOpen(true);
  };

  const saveSection = async (e: FormEvent) => {
    e.preventDefault();
    if (!sectionForm.name_en?.trim()) {
      toast({ title: "Name (English) is required", variant: "destructive" });
      return;
    }
    setSectionSaving(true);
    try {
      const payload = {
        ...sectionForm,
        slug: sectionForm.slug?.trim() || undefined,
        name_hi: sectionForm.name_hi?.trim() || undefined,
        name_gu: sectionForm.name_gu?.trim() || undefined,
      };
      if (sectionEditing) {
        await updateSection(sectionEditing.slug, payload);
        toast({ title: "Section updated" });
      } else {
        await createSection(payload);
        toast({ title: "Section created" });
      }
      setSectionDialogOpen(false);
      loadSections();
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as Error).message) : "Failed to save";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSectionSaving(false);
    }
  };

  const confirmDeleteSection = async () => {
    if (!sectionDeleteSlug) return;
    try {
      await deleteSection(sectionDeleteSlug);
      toast({ title: "Section deleted" });
      setSectionDeleteSlug(null);
      loadSections();
    } catch (e) {
      toast({ title: "Delete failed", variant: "destructive", description: String(e) });
    }
  };

  // Category form
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryEditing, setCategoryEditing] = useState<CategoryItem | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryPayload>({
    name_en: "",
    name_hi: "",
    name_gu: "",
    slug: "",
    is_active: true,
  });
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryDeleteSlug, setCategoryDeleteSlug] = useState<string | null>(null);

  const openAddCategory = () => {
    setCategoryEditing(null);
    setCategoryForm({ name_en: "", name_hi: "", name_gu: "", slug: "", is_active: true });
    setCategoryDialogOpen(true);
  };

  const openEditCategory = (c: CategoryItem) => {
    setCategoryEditing(c);
    setCategoryForm({
      name_en: c.name_en,
      name_hi: c.name_hi ?? "",
      name_gu: c.name_gu ?? "",
      slug: c.slug,
      is_active: c.is_active,
    });
    setCategoryDialogOpen(true);
  };

  const saveCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name_en?.trim()) {
      toast({ title: "Name (English) is required", variant: "destructive" });
      return;
    }
    setCategorySaving(true);
    try {
      const payload = {
        ...categoryForm,
        slug: categoryForm.slug?.trim() || undefined,
        name_hi: categoryForm.name_hi?.trim() || undefined,
        name_gu: categoryForm.name_gu?.trim() || undefined,
      };
      if (categoryEditing) {
        await updateCategory(categoryEditing.slug, payload);
        toast({ title: "Category updated" });
      } else {
        await createCategory(payload);
        toast({ title: "Category created" });
      }
      setCategoryDialogOpen(false);
      loadCategories();
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as Error).message) : "Failed to save";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setCategorySaving(false);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryDeleteSlug) return;
    try {
      await deleteCategory(categoryDeleteSlug);
      toast({ title: "Category deleted" });
      setCategoryDeleteSlug(null);
      loadCategories();
    } catch (e) {
      toast({ title: "Delete failed", variant: "destructive", description: String(e) });
    }
  };

  // Tag form
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [tagEditing, setTagEditing] = useState<TagItem | null>(null);
  const [tagForm, setTagForm] = useState<TagPayload>({ name: "", slug: "" });
  const [tagSaving, setTagSaving] = useState(false);
  const [tagDeleteSlug, setTagDeleteSlug] = useState<string | null>(null);

  const openAddTag = () => {
    setTagEditing(null);
    setTagForm({ name: "", slug: "" });
    setTagDialogOpen(true);
  };

  const openEditTag = (t: TagItem) => {
    setTagEditing(t);
    setTagForm({ name: t.name, slug: t.slug });
    setTagDialogOpen(true);
  };

  const saveTag = async (e: FormEvent) => {
    e.preventDefault();
    if (!tagForm.name?.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setTagSaving(true);
    try {
      const payload = { ...tagForm, slug: tagForm.slug?.trim() || undefined };
      if (tagEditing) {
        await updateTag(tagEditing.slug, payload);
        toast({ title: "Tag updated" });
      } else {
        await createTag(payload);
        toast({ title: "Tag created" });
      }
      setTagDialogOpen(false);
      loadTags();
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as Error).message) : "Failed to save";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setTagSaving(false);
    }
  };

  const confirmDeleteTag = async () => {
    if (!tagDeleteSlug) return;
    try {
      await deleteTag(tagDeleteSlug);
      toast({ title: "Tag deleted" });
      setTagDeleteSlug(null);
      loadTags();
    } catch (e) {
      toast({ title: "Delete failed", variant: "destructive", description: String(e) });
    }
  };

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  // Users form (Super Admin only)
  type UserFormState = Omit<AdminUserPayload, "password"> & { password: string };
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userEditing, setUserEditing] = useState<AdminUser | null>(null);
  const [userDeleteId, setUserDeleteId] = useState<number | null>(null);
  const [userSaving, setUserSaving] = useState(false);
  const [userForm, setUserForm] = useState<UserFormState>({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "USER",
    phone_number: "",
    is_active: true,
    is_staff: false,
  });

  const openAddUser = () => {
    setUserEditing(null);
    setUserForm({
      username: "",
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      role: "USER",
      phone_number: "",
      is_active: true,
      is_staff: false,
    });
    setUserDialogOpen(true);
  };

  const openEditUser = (u: AdminUser) => {
    setUserEditing(u);
    setUserForm({
      username: u.username,
      email: u.email,
      password: "",
      first_name: u.first_name ?? "",
      last_name: u.last_name ?? "",
      role: u.role,
      phone_number: u.phone_number ?? "",
      is_active: u.is_active,
      is_staff: u.is_staff,
    });
    setUserDialogOpen(true);
  };

  const saveUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    if (!userForm.username?.trim() || !userForm.email?.trim()) {
      toast({ title: "Username and email are required", variant: "destructive" });
      return;
    }
    if (!userEditing && !userForm.password?.trim()) {
      toast({ title: "Password is required when creating a user", variant: "destructive" });
      return;
    }
    setUserSaving(true);
    try {
      const payload: AdminUserPayload = {
        username: userForm.username.trim(),
        email: userForm.email.trim(),
        role: userForm.role,
        is_active: userForm.is_active,
        is_staff: userForm.is_staff,
        first_name: userForm.first_name?.trim() || undefined,
        last_name: userForm.last_name?.trim() || undefined,
        phone_number: userForm.phone_number?.trim() || undefined,
        password: userForm.password?.trim() || undefined,
      };
      if (userEditing) {
        await updateUserAdmin(userEditing.id, payload);
        toast({ title: "User updated" });
      } else {
        await createUserAdmin(payload);
        toast({ title: "User created" });
      }
      setUserDialogOpen(false);
      loadUsers();
    } catch (err) {
      toast({ title: "User save failed", variant: "destructive", description: String(err) });
    } finally {
      setUserSaving(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userDeleteId) return;
    try {
      await deleteUserAdmin(userDeleteId);
      toast({ title: "User deleted" });
      setUserDeleteId(null);
      loadUsers();
    } catch (e) {
      toast({ title: "Delete failed", variant: "destructive", description: String(e) });
    }
  };

  // Ads: Slot form
  type SlotFormState = Omit<GoogleAdSenseSlot, "id"> & { id?: number };
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [slotEditing, setSlotEditing] = useState<GoogleAdSenseSlot | null>(null);
  const [slotDeleteId, setSlotDeleteId] = useState<number | null>(null);
  const [slotSaving, setSlotSaving] = useState(false);
  const [slotForm, setSlotForm] = useState<SlotFormState>({
    name: "",
    placement: "TOP",
    client_id: "",
    slot_id: "",
    format: "auto",
    responsive: true,
    is_active: true,
    order: 0,
  });

  const openAddSlot = () => {
    setSlotEditing(null);
    setSlotForm({
      name: "",
      placement: "TOP",
      client_id: "",
      slot_id: "",
      format: "auto",
      responsive: true,
      is_active: true,
      order: 0,
    });
    setSlotDialogOpen(true);
  };

  const openEditSlot = (s: GoogleAdSenseSlot) => {
    setSlotEditing(s);
    setSlotForm({ ...s });
    setSlotDialogOpen(true);
  };

  const saveSlot = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    if (!slotForm.name || !slotForm.placement) {
      toast({ title: "Name and placement are required", variant: "destructive" });
      return;
    }
    setSlotSaving(true);
    try {
      const payload = {
        name: slotForm.name.trim(),
        placement: slotForm.placement,
        client_id: slotForm.client_id.trim(),
        slot_id: slotForm.slot_id.trim(),
        format: slotForm.format.trim(),
        responsive: !!slotForm.responsive,
        is_active: !!slotForm.is_active,
        order: Number(slotForm.order ?? 0),
      };
      if (slotEditing) {
        await updateAdSlotAdmin(slotEditing.id, payload);
        toast({ title: "Ad slot updated" });
      } else {
        await createAdSlotAdmin(payload);
        toast({ title: "Ad slot created" });
      }
      setSlotDialogOpen(false);
      loadAdSlots();
    } catch (err) {
      toast({ title: "Slot save failed", variant: "destructive", description: String(err) });
    } finally {
      setSlotSaving(false);
    }
  };

  const confirmDeleteSlot = async () => {
    if (!slotDeleteId) return;
    try {
      await deleteAdSlotAdmin(slotDeleteId);
      toast({ title: "Ad slot deleted" });
      setSlotDeleteId(null);
      loadAdSlots();
    } catch (e) {
      toast({ title: "Delete failed", variant: "destructive", description: String(e) });
    }
  };

  // Ads: Advertisement form
  interface AdFormState {
    title: string;
    placement: AdPlacement;
    ad_type: AdType;
    status: AdStatus;
    is_active: boolean;
    link_url: string;
    html_snippet: string;
    advertiser_name: string;
    advertiser_email: string;
    advertiser_phone: string;
  }
  const [adDialogOpen, setAdDialogOpen] = useState(false);
  const [adEditing, setAdEditing] = useState<Advertisement | null>(null);
  const [adDeleteId, setAdDeleteId] = useState<number | null>(null);
  const [adSaving, setAdSaving] = useState(false);
  const [adImageFile, setAdImageFile] = useState<File | null>(null);
  const [adVideoFile, setAdVideoFile] = useState<File | null>(null);
  const [adForm, setAdForm] = useState<AdFormState>({
    title: "",
    placement: "TOP",
    ad_type: "IMAGE",
    status: "DRAFT",
    is_active: true,
    link_url: "",
    html_snippet: "",
    advertiser_name: "",
    advertiser_email: "",
    advertiser_phone: "",
  });

  const openAddAd = () => {
    setAdEditing(null);
    setAdImageFile(null);
    setAdVideoFile(null);
    setAdForm({
      title: "",
      placement: "TOP",
      ad_type: "IMAGE",
      status: "DRAFT",
      is_active: true,
      link_url: "",
      html_snippet: "",
      advertiser_name: "",
      advertiser_email: "",
      advertiser_phone: "",
    });
    setAdDialogOpen(true);
  };

  const openEditAd = (a: Advertisement) => {
    setAdEditing(a);
    setAdImageFile(null);
    setAdVideoFile(null);
    setAdForm({
      title: a.title,
      placement: a.placement,
      ad_type: a.ad_type,
      status: a.status,
      is_active: a.is_active,
      link_url: a.link_url ?? "",
      html_snippet: a.html_snippet ?? "",
      advertiser_name: a.advertiser_name ?? "",
      advertiser_email: a.advertiser_email ?? "",
      advertiser_phone: a.advertiser_phone ?? "",
    });
    setAdDialogOpen(true);
  };

  const saveAd = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    if (!adForm.title?.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    setAdSaving(true);
    try {
      const payload = {
        title: adForm.title.trim(),
        placement: adForm.placement,
        ad_type: adForm.ad_type,
        status: adForm.status,
        is_active: !!adForm.is_active,
        link_url: adForm.link_url?.trim() || undefined,
        html_snippet: adForm.html_snippet?.trim() || undefined,
        advertiser_name: adForm.advertiser_name?.trim() || undefined,
        advertiser_email: adForm.advertiser_email?.trim() || undefined,
        advertiser_phone: adForm.advertiser_phone?.trim() || undefined,
        image_file: adImageFile,
        video_file: adVideoFile,
      };
      if (adEditing) {
        await updateAdvertisementAdmin(adEditing.id, payload);
        toast({ title: "Advertisement updated" });
      } else {
        await createAdvertisementAdmin(payload);
        toast({ title: "Advertisement created" });
      }
      setAdDialogOpen(false);
      loadAds();
    } catch (err) {
      toast({ title: "Ad save failed", variant: "destructive", description: String(err) });
    } finally {
      setAdSaving(false);
    }
  };

  const confirmDeleteAd = async () => {
    if (!adDeleteId) return;
    try {
      await deleteAdvertisementAdmin(adDeleteId);
      toast({ title: "Advertisement deleted" });
      setAdDeleteId(null);
      loadAds();
    } catch (e) {
      toast({ title: "Delete failed", variant: "destructive", description: String(e) });
    }
  };

  // Ads: Requests update
  const updateRequestStatus = async (id: number, status: "PENDING" | "APPROVED" | "REJECTED") => {
    try {
      await updateAdvertisementRequestAdmin(id, { status });
      toast({ title: "Request updated" });
      loadAdRequests();
    } catch (e) {
      toast({ title: "Update failed", variant: "destructive", description: String(e) });
    }
  };

  const saveSiteSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    if (!siteSettings) return;
    setSiteSaving(true);
    try {
      const updated = await updateSiteSettings(siteSettings);
      setSiteSettings(updated);
      toast({ title: "Site settings saved" });
    } catch (err) {
      toast({ title: "Save failed", variant: "destructive", description: String(err) });
    } finally {
      setSiteSaving(false);
    }
  };

  // Approval handlers
  const handleApproveSection = async (slug: string) => {
    try {
      await approveSection(slug);
      toast({ title: "Section approved" });
      loadSections();
    } catch (e) {
      toast({ title: "Failed to approve", variant: "destructive", description: String(e) });
    }
  };

  const handleRejectSection = async (slug: string) => {
    try {
      await rejectSection(slug);
      toast({ title: "Section rejected" });
      loadSections();
    } catch (e) {
      toast({ title: "Failed to reject", variant: "destructive", description: String(e) });
    }
  };

  const handleApproveCategory = async (slug: string) => {
    try {
      await approveCategory(slug);
      toast({ title: "Category approved" });
      loadCategories();
    } catch (e) {
      toast({ title: "Failed to approve", variant: "destructive", description: String(e) });
    }
  };

  const handleRejectCategory = async (slug: string) => {
    try {
      await rejectCategory(slug);
      toast({ title: "Category rejected" });
      loadCategories();
    } catch (e) {
      toast({ title: "Failed to reject", variant: "destructive", description: String(e) });
    }
  };

  const handleApproveTag = async (slug: string) => {
    try {
      await approveTag(slug);
      toast({ title: "Tag approved" });
      loadTags();
    } catch (e) {
      toast({ title: "Failed to approve", variant: "destructive", description: String(e) });
    }
  };

  const handleRejectTag = async (slug: string) => {
    try {
      await rejectTag(slug);
      toast({ title: "Tag rejected" });
      loadTags();
    } catch (e) {
      toast({ title: "Failed to reject", variant: "destructive", description: String(e) });
    }
  };

  // Filter pending items
  // Items awaiting a decision: not approved but still active / never reviewed.
  // Rejected sections/categories are marked inactive by the backend and are
  // therefore intentionally excluded from these "Pending" queues. Rejected
  // tags are recognised by having `is_approved === false` but `approved_by`
  // set to a super admin user.
  const pendingSections = sections.filter((s) => !s.is_approved && s.is_active);
  const pendingCategories = categories.filter((c) => !c.is_approved && c.is_active);
  const pendingTags = tags.filter((t) => !t.is_approved && t.approved_by == null);

  return (
    <PageLayout showTicker={false}>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Signed in as {user?.username} ({user?.role})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between p-2">
                  <span className="font-semibold">Notifications</span>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllNotificationsRead}
                      className="h-7 text-xs"
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={`flex flex-col items-start p-3 cursor-pointer ${
                        !notification.is_read ? 'bg-muted' : ''
                      }`}
                      onClick={() => {
                        if (!notification.is_read) {
                          markNotificationRead(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="h-2 w-2 rounded-full bg-blue-500 ml-2 mt-1" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={logout}>
              Log out
            </Button>
          </div>
        </div>

        <Tabs
          defaultValue="overview"
          className="space-y-4"
          onValueChange={(v) => {
            if (!accessToken) return;
            if (v === "users" && isSuperAdmin) loadUsers();
            if (v === "ads") {
              loadAdSlots();
              loadAds();
              loadAdRequests();
            }
            if (v === "site") {
              loadSiteSettings();
            }
            if (v === "analytics") {
              loadNewsViews();
            }
          }}
        >
          <TabsList className="grid w-full max-w-6xl grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="ads">Ads</TabsTrigger>
            <TabsTrigger value="careers">Careers</TabsTrigger>
            <TabsTrigger value="site">Site</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users" disabled={!isSuperAdmin}>Users</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Link to="/editor">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-base">Content studio</CardTitle>
                    <CardDescription>Create and publish news articles, reels and videos.</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              <a href="/" target="_blank" rel="noreferrer">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-base">View live site</CardTitle>
                    <CardDescription>Open the public site to verify content.</CardDescription>
                  </CardHeader>
                </Card>
              </a>
              {isSuperAdmin && (
                <a href={`${(getBaseUrl() || "http://localhost:8000").replace(/\/$/, "")}/admin/`} target="_blank" rel="noreferrer">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="text-base">Django admin</CardTitle>
                      <CardDescription>Users, roles and advanced backend settings.</CardDescription>
                    </CardHeader>
                  </Card>
                </a>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Use the <strong>Categories</strong>, <strong>Sections</strong>, and <strong>Tags</strong> tabs above to add, edit, or remove data. Use <strong>Content studio</strong> to manage articles.
            </p>
          </TabsContent>

          <TabsContent value="ads" className="space-y-4">
            {adSlots.length === 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Getting Started with Google AdSense</AlertTitle>
                <AlertDescription className="mt-2">
                  To display Google ads, you need to set up your AdSense account and configure ad slots. 
                  See <strong>GOOGLE_ADSENSE_SETUP.md</strong> for a complete step-by-step guide on:
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Signing up for Google AdSense</li>
                    <li>Getting your Publisher ID (Client ID)</li>
                    <li>Creating Ad Units and getting Slot IDs</li>
                    <li>Configuring ads in this dashboard</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Ad slots (AdSense)</CardTitle>
                    <CardDescription>Configure Google AdSense ad slots.</CardDescription>
                  </div>
                  <Button onClick={openAddSlot} variant="outline">Add</Button>
                </CardHeader>
                <CardContent>
                  {adSlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No slots yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Placement</TableHead>
                          <TableHead className="w-[120px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adSlots.map((s) => (
                          <TableRow key={s.id}>
                            <TableCell className="font-medium">{s.name}</TableCell>
                            <TableCell className="text-xs">{s.placement}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => openEditSlot(s)}>Edit</Button>
                              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setSlotDeleteId(s.id)}>Delete</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Advertisements</CardTitle>
                    <CardDescription>Manage image/video/HTML ads.</CardDescription>
                  </div>
                  <Button onClick={openAddAd}>Add ad</Button>
                </CardHeader>
                <CardContent>
                  {ads.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No advertisements yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Placement</TableHead>
                          <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                          <TableHead className="w-[120px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ads.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell className="font-medium">{a.title}</TableCell>
                            <TableCell className="text-xs">{a.placement}</TableCell>
                            <TableCell className="text-xs">{a.ad_type}</TableCell>
                            <TableCell className="text-xs">{a.status}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => openEditAd(a)}>Edit</Button>
                              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setAdDeleteId(a.id)}>Delete</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Ad requests</CardTitle>
                <CardDescription>Public submissions (approve/reject).</CardDescription>
              </CardHeader>
              <CardContent>
                {adRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No ad requests.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Placement</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[220px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adRequests.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.advertiser_name}</TableCell>
                          <TableCell className="text-xs">{r.placement}</TableCell>
                          <TableCell className="text-xs">{r.ad_type}</TableCell>
                          <TableCell className="text-xs">{r.status}</TableCell>
                          <TableCell className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => updateRequestStatus(r.id, "APPROVED")}>Approve</Button>
                            <Button variant="outline" size="sm" className="text-destructive" onClick={() => updateRequestStatus(r.id, "REJECTED")}>Reject</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            {!isSuperAdmin ? (
              <p className="text-sm text-muted-foreground">Only Super Admin can manage users.</p>
            ) : (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>Create editors/reporters and manage access.</CardDescription>
                  </div>
                  <Button onClick={openAddUser}>Add user</Button>
                </CardHeader>
                <CardContent>
                  {users.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No users loaded yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Active</TableHead>
                          <TableHead className="w-[120px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell className="font-medium">{u.username}</TableCell>
                            <TableCell className="text-xs">{u.email}</TableCell>
                            <TableCell className="text-xs">{u.role}</TableCell>
                            <TableCell className="text-xs">{u.is_active ? "Yes" : "No"}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => openEditUser(u)}>Edit</Button>
                              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setUserDeleteId(u.id)}>Delete</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="careers" className="space-y-4">
            <AdminComponent />
          </TabsContent>

          <TabsContent value="site" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Site settings</CardTitle>
                <CardDescription>Controls footer/header/About content and social links.</CardDescription>
              </CardHeader>
              <CardContent>
                {!siteSettings ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : (
                  <form onSubmit={saveSiteSettings} className="space-y-6">
                    {/* Brand Section */}
                    <div className="space-y-4 border-b pb-4">
                      <h3 className="text-lg font-semibold">Brand</h3>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="tagline_en">Tagline (EN) *</Label>
                          <Input id="tagline_en" value={siteSettings.tagline_en ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, tagline_en: e.target.value }) : s)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tagline_gu">Tagline (GU)</Label>
                          <Input id="tagline_gu" value={siteSettings.tagline_gu ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, tagline_gu: e.target.value }) : s)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tagline_hi">Tagline (HI)</Label>
                          <Input id="tagline_hi" value={siteSettings.tagline_hi ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, tagline_hi: e.target.value }) : s)} />
                        </div>
                      </div>
                    </div>

                    {/* About Page Section */}
                    <div className="space-y-4 border-b pb-4">
                      <h3 className="text-lg font-semibold">About Page</h3>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="about_title_en">About Title (EN) *</Label>
                          <Input id="about_title_en" value={siteSettings.about_title_en ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, about_title_en: e.target.value }) : s)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="about_title_gu">About Title (GU)</Label>
                          <Input id="about_title_gu" value={siteSettings.about_title_gu ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, about_title_gu: e.target.value }) : s)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="about_title_hi">About Title (HI)</Label>
                          <Input id="about_title_hi" value={siteSettings.about_title_hi ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, about_title_hi: e.target.value }) : s)} />
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="about_description_en">About Description (EN)</Label>
                          <textarea
                            id="about_description_en"
                            value={siteSettings.about_description_en ?? ""}
                            onChange={(e) => setSiteSettings((s) => s ? ({ ...s, about_description_en: e.target.value }) : s)}
                            rows={4}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="about_description_gu">About Description (GU)</Label>
                          <textarea
                            id="about_description_gu"
                            value={siteSettings.about_description_gu ?? ""}
                            onChange={(e) => setSiteSettings((s) => s ? ({ ...s, about_description_gu: e.target.value }) : s)}
                            rows={4}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="about_description_hi">About Description (HI)</Label>
                          <textarea
                            id="about_description_hi"
                            value={siteSettings.about_description_hi ?? ""}
                            onChange={(e) => setSiteSettings((s) => s ? ({ ...s, about_description_hi: e.target.value }) : s)}
                            rows={4}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Editor Section */}
                    <div className="space-y-4 border-b pb-4">
                      <h3 className="text-lg font-semibold">Editor</h3>
                      <div className="space-y-2">
                        <Label htmlFor="editor_name">Editor Name *</Label>
                        <Input id="editor_name" value={siteSettings.editor_name ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, editor_name: e.target.value }) : s)} />
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="editor_title_en">Editor Title (EN) *</Label>
                          <Input id="editor_title_en" value={siteSettings.editor_title_en ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, editor_title_en: e.target.value }) : s)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="editor_title_gu">Editor Title (GU)</Label>
                          <Input id="editor_title_gu" value={siteSettings.editor_title_gu ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, editor_title_gu: e.target.value }) : s)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="editor_title_hi">Editor Title (HI)</Label>
                          <Input id="editor_title_hi" value={siteSettings.editor_title_hi ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, editor_title_hi: e.target.value }) : s)} />
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="editor_bio_en">Editor Bio (EN)</Label>
                          <textarea
                            id="editor_bio_en"
                            value={siteSettings.editor_bio_en ?? ""}
                            onChange={(e) => setSiteSettings((s) => s ? ({ ...s, editor_bio_en: e.target.value }) : s)}
                            rows={4}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="editor_bio_gu">Editor Bio (GU)</Label>
                          <textarea
                            id="editor_bio_gu"
                            value={siteSettings.editor_bio_gu ?? ""}
                            onChange={(e) => setSiteSettings((s) => s ? ({ ...s, editor_bio_gu: e.target.value }) : s)}
                            rows={4}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="editor_bio_hi">Editor Bio (HI)</Label>
                          <textarea
                            id="editor_bio_hi"
                            value={siteSettings.editor_bio_hi ?? ""}
                            onChange={(e) => setSiteSettings((s) => s ? ({ ...s, editor_bio_hi: e.target.value }) : s)}
                            rows={4}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mission & Publication Section */}
                    <div className="space-y-4 border-b pb-4">
                      <h3 className="text-lg font-semibold">Mission & Publication</h3>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="mission_en">Mission (EN)</Label>
                          <textarea
                            id="mission_en"
                            value={siteSettings.mission_en ?? ""}
                            onChange={(e) => setSiteSettings((s) => s ? ({ ...s, mission_en: e.target.value }) : s)}
                            rows={4}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mission_gu">Mission (GU)</Label>
                          <textarea
                            id="mission_gu"
                            value={siteSettings.mission_gu ?? ""}
                            onChange={(e) => setSiteSettings((s) => s ? ({ ...s, mission_gu: e.target.value }) : s)}
                            rows={4}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mission_hi">Mission (HI)</Label>
                          <textarea
                            id="mission_hi"
                            value={siteSettings.mission_hi ?? ""}
                            onChange={(e) => setSiteSettings((s) => s ? ({ ...s, mission_hi: e.target.value }) : s)}
                            rows={4}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="publication_description_en">Publication Description (EN)</Label>
                          <textarea
                            id="publication_description_en"
                            value={siteSettings.publication_description_en ?? ""}
                            onChange={(e) => setSiteSettings((s) => s ? ({ ...s, publication_description_en: e.target.value }) : s)}
                            rows={4}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="publication_description_gu">Publication Description (GU)</Label>
                          <textarea
                            id="publication_description_gu"
                            value={siteSettings.publication_description_gu ?? ""}
                            onChange={(e) => setSiteSettings((s) => s ? ({ ...s, publication_description_gu: e.target.value }) : s)}
                            rows={4}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="publication_description_hi">Publication Description (HI)</Label>
                          <textarea
                            id="publication_description_hi"
                            value={siteSettings.publication_description_hi ?? ""}
                            onChange={(e) => setSiteSettings((s) => s ? ({ ...s, publication_description_hi: e.target.value }) : s)}
                            rows={4}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Our Values Section */}
                    <div className="space-y-4 border-b pb-4">
                      <h3 className="text-lg font-semibold">Our Values</h3>
                      {/* Value 1 */}
                      <div className="space-y-3 p-4 border rounded-lg">
                        <h4 className="font-medium">Value 1</h4>
                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="value1_title_en">Title (EN)</Label>
                            <Input id="value1_title_en" value={siteSettings.value1_title_en ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, value1_title_en: e.target.value }) : s)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="value1_title_gu">Title (GU)</Label>
                            <Input id="value1_title_gu" value={siteSettings.value1_title_gu ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, value1_title_gu: e.target.value }) : s)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="value1_title_hi">Title (HI)</Label>
                            <Input id="value1_title_hi" value={siteSettings.value1_title_hi ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, value1_title_hi: e.target.value }) : s)} />
                          </div>
                        </div>
                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="value1_desc_en">Description (EN)</Label>
                            <Input id="value1_desc_en" value={siteSettings.value1_desc_en ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, value1_desc_en: e.target.value }) : s)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="value1_desc_gu">Description (GU)</Label>
                            <Input id="value1_desc_gu" value={siteSettings.value1_desc_gu ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, value1_desc_gu: e.target.value }) : s)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="value1_desc_hi">Description (HI)</Label>
                            <Input id="value1_desc_hi" value={siteSettings.value1_desc_hi ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, value1_desc_hi: e.target.value }) : s)} />
                          </div>
                        </div>
                      </div>
                      {/* Value 2 */}
                      <div className="space-y-3 p-4 border rounded-lg">
                        <h4 className="font-medium">Value 2</h4>
                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="value2_title_en">Title (EN)</Label>
                            <Input id="value2_title_en" value={siteSettings.value2_title_en ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, value2_title_en: e.target.value }) : s)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="value2_title_gu">Title (GU)</Label>
                            <Input id="value2_title_gu" value={siteSettings.value2_title_gu ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, value2_title_gu: e.target.value }) : s)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="value2_title_hi">Title (HI)</Label>
                            <Input id="value2_title_hi" value={siteSettings.value2_title_hi ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, value2_title_hi: e.target.value }) : s)} />
                          </div>
                        </div>
                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="value2_desc_en">Description (EN)</Label>
                            <Input id="value2_desc_en" value={siteSettings.value2_desc_en ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, value2_desc_en: e.target.value }) : s)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="value2_desc_gu">Description (GU)</Label>
                            <Input id="value2_desc_gu" value={siteSettings.value2_desc_gu ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, value2_desc_gu: e.target.value }) : s)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="value2_desc_hi">Description (HI)</Label>
                            <Input id="value2_desc_hi" value={siteSettings.value2_desc_hi ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, value2_desc_hi: e.target.value }) : s)} />
                          </div>
                        </div>
                      </div>
                      {/* Value 3 */}
                      <div className="space-y-3 p-4 border rounded-lg">
                        <h4 className="font-medium">Value 3</h4>
                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="value3_title_en">Title (EN)</Label>
                            <Input id="value3_title_en" value={siteSettings.value3_title_en ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, value3_title_en: e.target.value }) : s)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="value3_title_gu">Title (GU)</Label>
                            <Input id="value3_title_gu" value={siteSettings.value3_title_gu ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, value3_title_gu: e.target.value }) : s)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="value3_title_hi">Title (HI)</Label>
                            <Input id="value3_title_hi" value={siteSettings.value3_title_hi ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, value3_title_hi: e.target.value }) : s)} />
                          </div>
                        </div>
                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="value3_desc_en">Description (EN)</Label>
                            <Input id="value3_desc_en" value={siteSettings.value3_desc_en ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, value3_desc_en: e.target.value }) : s)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="value3_desc_gu">Description (GU)</Label>
                            <Input id="value3_desc_gu" value={siteSettings.value3_desc_gu ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, value3_desc_gu: e.target.value }) : s)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="value3_desc_hi">Description (HI)</Label>
                            <Input id="value3_desc_hi" value={siteSettings.value3_desc_hi ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, value3_desc_hi: e.target.value }) : s)} />
                          </div>
                        </div>
                      </div>
                      {/* Value 4 */}
                      <div className="space-y-3 p-4 border rounded-lg">
                        <h4 className="font-medium">Value 4</h4>
                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="value4_title_en">Title (EN)</Label>
                            <Input id="value4_title_en" value={siteSettings.value4_title_en ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, value4_title_en: e.target.value }) : s)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="value4_title_gu">Title (GU)</Label>
                            <Input id="value4_title_gu" value={siteSettings.value4_title_gu ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, value4_title_gu: e.target.value }) : s)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="value4_title_hi">Title (HI)</Label>
                            <Input id="value4_title_hi" value={siteSettings.value4_title_hi ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, value4_title_hi: e.target.value }) : s)} />
                          </div>
                        </div>
                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="value4_desc_en">Description (EN)</Label>
                            <Input id="value4_desc_en" value={siteSettings.value4_desc_en ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, value4_desc_en: e.target.value }) : s)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="value4_desc_gu">Description (GU)</Label>
                            <Input id="value4_desc_gu" value={siteSettings.value4_desc_gu ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, value4_desc_gu: e.target.value }) : s)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="value4_desc_hi">Description (HI)</Label>
                            <Input id="value4_desc_hi" value={siteSettings.value4_desc_hi ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, value4_desc_hi: e.target.value }) : s)} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Section */}
                    <div className="space-y-4 border-b pb-4">
                      <h3 className="text-lg font-semibold">Contact</h3>
                      <div className="space-y-2">
                        <Label htmlFor="website_url">Website URL</Label>
                        <Input id="website_url" value={siteSettings.website_url ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, website_url: e.target.value }) : s)} />
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="contact_email">Contact Email</Label>
                          <Input id="contact_email" type="email" value={siteSettings.contact_email ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, contact_email: e.target.value }) : s)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact_phone_primary">Primary Phone</Label>
                          <Input id="contact_phone_primary" value={siteSettings.contact_phone_primary ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, contact_phone_primary: e.target.value }) : s)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact_phone_secondary">Secondary Phone</Label>
                        <Input id="contact_phone_secondary" value={siteSettings.contact_phone_secondary ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, contact_phone_secondary: e.target.value }) : s)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact_address">Address</Label>
                        <textarea
                          id="contact_address"
                          value={siteSettings.contact_address ?? ""}
                          onChange={(e) => setSiteSettings((s) => s ? ({ ...s, contact_address: e.target.value }) : s)}
                          rows={3}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    {/* Social Section */}
                    <div className="space-y-4 border-b pb-4">
                      <h3 className="text-lg font-semibold">Social Media</h3>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="facebook_url">Facebook URL</Label>
                          <Input id="facebook_url" value={siteSettings.facebook_url ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, facebook_url: e.target.value }) : s)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="twitter_url">Twitter URL</Label>
                          <Input id="twitter_url" value={siteSettings.twitter_url ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, twitter_url: e.target.value }) : s)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="instagram_url">Instagram URL</Label>
                          <Input id="instagram_url" value={siteSettings.instagram_url ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, instagram_url: e.target.value }) : s)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="youtube_url">YouTube URL</Label>
                          <Input id="youtube_url" value={siteSettings.youtube_url ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, youtube_url: e.target.value }) : s)} />
                        </div>
                      </div>
                    </div>

                    {/* Contact Page Additional Fields */}
                    <div className="space-y-4 border-b pb-4">
                      <h3 className="text-lg font-semibold">Contact Page</h3>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="organization_name_en">Organization Name (EN)</Label>
                          <Input id="organization_name_en" value={siteSettings.organization_name_en ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, organization_name_en: e.target.value }) : s)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="organization_name_gu">Organization Name (GU)</Label>
                          <Input id="organization_name_gu" value={siteSettings.organization_name_gu ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, organization_name_gu: e.target.value }) : s)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="organization_name_hi">Organization Name (HI)</Label>
                          <Input id="organization_name_hi" value={siteSettings.organization_name_hi ?? ""} onChange={(e) => setSiteSettings((s) => s ? ({ ...s, organization_name_hi: e.target.value }) : s)} />
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="working_hours_en">Working Hours (EN)</Label>
                          <textarea
                            id="working_hours_en"
                            value={siteSettings.working_hours_en ?? ""}
                            onChange={(e) => setSiteSettings((s) => s ? ({ ...s, working_hours_en: e.target.value }) : s)}
                            rows={4}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder="Mon - Fri: 9:00 AM - 6:00 PM&#10;Saturday: 10:00 AM - 4:00 PM&#10;Sunday: Closed"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="working_hours_gu">Working Hours (GU)</Label>
                          <textarea
                            id="working_hours_gu"
                            value={siteSettings.working_hours_gu ?? ""}
                            onChange={(e) => setSiteSettings((s) => s ? ({ ...s, working_hours_gu: e.target.value }) : s)}
                            rows={4}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="working_hours_hi">Working Hours (HI)</Label>
                          <textarea
                            id="working_hours_hi"
                            value={siteSettings.working_hours_hi ?? ""}
                            onChange={(e) => setSiteSettings((s) => s ? ({ ...s, working_hours_hi: e.target.value }) : s)}
                            rows={4}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="google_maps_embed_url">Google Maps Embed URL</Label>
                        <Input
                          id="google_maps_embed_url"
                          value={siteSettings.google_maps_embed_url ?? ""}
                          onChange={(e) => setSiteSettings((s) => s ? ({ ...s, google_maps_embed_url: e.target.value }) : s)}
                          placeholder="https://www.google.com/maps/embed?pb=..."
                        />
                        <p className="text-xs text-muted-foreground">
                          Get this URL from Google Maps: Share → Embed a map → Copy the iframe src URL
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button type="submit" disabled={siteSaving}>
                        {siteSaving ? "Saving…" : "Save All Settings"}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics (views)</CardTitle>
                <CardDescription>Recent article view events (editor/admin only).</CardDescription>
              </CardHeader>
              <CardContent>
                {newsViews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No analytics data yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Viewed at</TableHead>
                        <TableHead>Article ID</TableHead>
                        <TableHead>User ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newsViews.slice(0, 50).map((v) => (
                        <TableRow key={v.id}>
                          <TableCell className="text-xs">{new Date(v.viewed_at).toLocaleString()}</TableCell>
                          <TableCell className="text-xs font-mono">{v.article}</TableCell>
                          <TableCell className="text-xs font-mono">{v.user ?? "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            {isSuperAdmin && pendingCategories.length > 0 && (
              <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                <CardHeader>
                  <CardTitle className="text-base">Pending Approval ({pendingCategories.length})</CardTitle>
                  <CardDescription>Categories waiting for admin approval</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name (EN)</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[200px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingCategories.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.name_en}</TableCell>
                          <TableCell className="font-mono text-xs">{c.slug}</TableCell>
                          <TableCell>
                            <span className="text-xs px-2 py-1 rounded bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100">
                              Pending
                            </span>
                          </TableCell>
                          <TableCell className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleApproveCategory(c.slug)}>
                              Approve
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleRejectCategory(c.slug)} className="text-destructive">
                              Reject
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openEditCategory(c)}>
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>Manage categories for grouping news (e.g. Politics, Sports).</CardDescription>
                </div>
                <Button onClick={openAddCategory}>Add category</Button>
              </CardHeader>
              <CardContent>
                {loading.categories ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name (EN)</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead>Approved</TableHead>
                        <TableHead className="w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-muted-foreground">
                            No categories yet. Add one above.
                          </TableCell>
                        </TableRow>
                      ) : (
                        categories.map((c) => (
                          <TableRow key={c.id} className={!c.is_approved ? "bg-muted/50" : ""}>
                            <TableCell>{c.name_en}</TableCell>
                            <TableCell className="font-mono text-xs">{c.slug}</TableCell>
                            <TableCell>{c.is_active ? "Yes" : "No"}</TableCell>
                            <TableCell>
                              {c.is_approved ? (
                                <span className="text-xs px-2 py-1 rounded bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100">
                                  Approved
                                </span>
                              ) : c.is_active ? (
                                <span className="text-xs px-2 py-1 rounded bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100">
                                  Pending
                                </span>
                              ) : (
                                <span className="text-xs px-2 py-1 rounded bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100">
                                  Rejected
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => openEditCategory(c)}>
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setCategoryDeleteSlug(c.slug)}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sections" className="space-y-4">
            {isSuperAdmin && pendingSections.length > 0 && (
              <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                <CardHeader>
                  <CardTitle className="text-base">Pending Approval ({pendingSections.length})</CardTitle>
                  <CardDescription>Sections waiting for admin approval</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name (EN)</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[200px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingSections.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.name_en}</TableCell>
                          <TableCell className="font-mono text-xs">{s.slug}</TableCell>
                          <TableCell>
                            <span className="text-xs px-2 py-1 rounded bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100">
                              Pending
                            </span>
                          </TableCell>
                          <TableCell className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleApproveSection(s.slug)}>
                              Approve
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleRejectSection(s.slug)} className="text-destructive">
                              Reject
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openEditSection(s)}>
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Sections</CardTitle>
                  <CardDescription>Navbar sections (National, Gujarat, Sports, etc.).</CardDescription>
                </div>
                <Button onClick={openAddSection}>Add section</Button>
              </CardHeader>
              <CardContent>
                {loading.sections ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name (EN)</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead>Approved</TableHead>
                        <TableHead className="w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sections.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-muted-foreground">
                            No sections yet. Add one above.
                          </TableCell>
                        </TableRow>
                      ) : (
                        sections.map((s) => (
                          <TableRow key={s.id} className={!s.is_approved ? "bg-muted/50" : ""}>
                            <TableCell>{s.name_en}</TableCell>
                            <TableCell className="font-mono text-xs">{s.slug}</TableCell>
                            <TableCell>{s.order}</TableCell>
                            <TableCell>{s.is_active ? "Yes" : "No"}</TableCell>
                            <TableCell>
                              {s.is_approved ? (
                                <span className="text-xs px-2 py-1 rounded bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100">
                                  Approved
                                </span>
                              ) : s.is_active ? (
                                <span className="text-xs px-2 py-1 rounded bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100">
                                  Pending
                                </span>
                              ) : (
                                <span className="text-xs px-2 py-1 rounded bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100">
                                  Rejected
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => openEditSection(s)}>
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setSectionDeleteSlug(s.slug)}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tags" className="space-y-4">
            {isSuperAdmin && pendingTags.length > 0 && (
              <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                <CardHeader>
                  <CardTitle className="text-base">Pending Approval ({pendingTags.length})</CardTitle>
                  <CardDescription>Tags waiting for admin approval</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[200px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingTags.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.name}</TableCell>
                          <TableCell className="font-mono text-xs">{t.slug}</TableCell>
                          <TableCell>
                            <span className="text-xs px-2 py-1 rounded bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100">
                              Pending
                            </span>
                          </TableCell>
                          <TableCell className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleApproveTag(t.slug)}>
                              Approve
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleRejectTag(t.slug)} className="text-destructive">
                              Reject
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openEditTag(t)}>
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Tags</CardTitle>
                  <CardDescription>Tags for articles (e.g. elections, cricket).</CardDescription>
                </div>
                <Button onClick={openAddTag}>Add tag</Button>
              </CardHeader>
              <CardContent>
                {loading.tags ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tags.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-muted-foreground">
                            No tags yet. Add one above.
                          </TableCell>
                        </TableRow>
                      ) : (
                        tags.map((t) => (
                          <TableRow key={t.id} className={!t.is_approved ? "bg-muted/50" : ""}>
                            <TableCell>{t.name}</TableCell>
                            <TableCell className="font-mono text-xs">{t.slug}</TableCell>
                            <TableCell>
                              {t.is_approved ? (
                                <span className="text-xs px-2 py-1 rounded bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100">
                                  Approved
                                </span>
                              ) : t.approved_by == null ? (
                                <span className="text-xs px-2 py-1 rounded bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100">
                                  Pending
                                </span>
                              ) : (
                                <span className="text-xs px-2 py-1 rounded bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100">
                                  Rejected
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" onClick={() => openEditTag(t)}>
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setTagDeleteSlug(t.slug)}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User dialog */}
        <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{userEditing ? "Edit user" : "Add user"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={saveUser} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="u-username">Username *</Label>
                  <Input id="u-username" value={userForm.username} onChange={(e) => setUserForm((f) => ({ ...f, username: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="u-email">Email *</Label>
                  <Input id="u-email" type="email" value={userForm.email} onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))} required />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="u-first">First name</Label>
                  <Input id="u-first" value={userForm.first_name ?? ""} onChange={(e) => setUserForm((f) => ({ ...f, first_name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="u-last">Last name</Label>
                  <Input id="u-last" value={userForm.last_name ?? ""} onChange={(e) => setUserForm((f) => ({ ...f, last_name: e.target.value }))} />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="u-role">Role</Label>
                  <select
                    id="u-role"
                    value={userForm.role}
                    onChange={(e) => setUserForm((f) => ({ ...f, role: e.target.value as AdminUser["role"] }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {(["SUPER_ADMIN", "EDITOR", "REPORTER", "USER"] as const).map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="u-phone">Phone</Label>
                  <Input id="u-phone" value={userForm.phone_number ?? ""} onChange={(e) => setUserForm((f) => ({ ...f, phone_number: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="u-password">
                  Password {userEditing ? "(leave blank to keep unchanged)" : "*"}
                </Label>
                <Input
                  id="u-password"
                  type="password"
                  value={userForm.password ?? ""}
                  onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={!!userForm.is_active} onCheckedChange={(v) => setUserForm((f) => ({ ...f, is_active: v }))} />
                  <span className="text-sm">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={!!userForm.is_staff} onCheckedChange={(v) => setUserForm((f) => ({ ...f, is_staff: v }))} />
                  <span className="text-sm">Staff (Django admin access)</span>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setUserDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={userSaving}>{userSaving ? "Saving…" : userEditing ? "Update" : "Create"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Slot dialog */}
        <Dialog open={slotDialogOpen} onOpenChange={setSlotDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{slotEditing ? "Edit ad slot" : "Add Google AdSense slot"}</DialogTitle>
            </DialogHeader>
            {!slotEditing && (
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Need help setting up Google AdSense?</AlertTitle>
                <AlertDescription className="mt-2">
                  You need your Google AdSense Publisher ID (Client ID) and Ad Unit ID (Slot ID). 
                  Check the <strong>GOOGLE_ADSENSE_SETUP.md</strong> guide for step-by-step instructions on how to get these from your AdSense account.
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={saveSlot} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slot-name">Name *</Label>
                <Input 
                  id="slot-name" 
                  value={slotForm.name ?? ""} 
                  onChange={(e) => setSlotForm((f) => ({ ...f, name: e.target.value }))} 
                  placeholder="e.g., Footer Banner Ad"
                  required 
                />
                <p className="text-xs text-muted-foreground">A descriptive name to identify this ad slot</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="slot-placement">Placement *</Label>
                  <select
                    id="slot-placement"
                    value={slotForm.placement ?? "TOP"}
                    onChange={(e) => setSlotForm((f) => ({ ...f, placement: e.target.value as AdPlacement }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {adPlacements.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">Where on the page this ad will appear</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slot-order">Order</Label>
                  <Input 
                    id="slot-order" 
                    type="number" 
                    value={Number(slotForm.order ?? 0)} 
                    onChange={(e) => setSlotForm((f) => ({ ...f, order: parseInt(e.target.value, 10) || 0 }))}
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground">Display order (0 = first, higher = later)</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="slot-client" className="text-base font-semibold">Google AdSense Information</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Find these in your Google AdSense account: Account → Account information (for Client ID) and Ads → By ad unit (for Slot ID)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="slot-client">
                      Publisher ID (Client ID) *
                      <span className="text-xs text-muted-foreground ml-1">(ca-pub-...)</span>
                    </Label>
                    <Input 
                      id="slot-client" 
                      value={slotForm.client_id ?? ""} 
                      onChange={(e) => setSlotForm((f) => ({ ...f, client_id: e.target.value }))} 
                      placeholder="ca-pub-1234567890123456"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Your AdSense Publisher ID from Account settings</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slot-id">
                      Ad Unit ID (Slot ID) *
                      <span className="text-xs text-muted-foreground ml-1">(numeric)</span>
                    </Label>
                    <Input 
                      id="slot-id" 
                      value={slotForm.slot_id ?? ""} 
                      onChange={(e) => setSlotForm((f) => ({ ...f, slot_id: e.target.value }))}
                      placeholder="1234567890"
                      required
                    />
                    <p className="text-xs text-muted-foreground">The Ad Unit ID from your created ad unit</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="slot-format">Format</Label>
                  <Input 
                    id="slot-format" 
                    value={slotForm.format ?? ""} 
                    onChange={(e) => setSlotForm((f) => ({ ...f, format: e.target.value }))}
                    placeholder="auto (recommended)"
                  />
                  <p className="text-xs text-muted-foreground">Usually "auto" for responsive ads, or leave empty</p>
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={!!slotForm.responsive} onCheckedChange={(v) => setSlotForm((f) => ({ ...f, responsive: v }))} />
                    <span className="text-sm">Responsive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={!!slotForm.is_active} onCheckedChange={(v) => setSlotForm((f) => ({ ...f, is_active: v }))} />
                    <span className="text-sm">Active</span>
                  </div>
                </div>
              </div>
              <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>Tip:</strong> After saving, ads may take a few minutes to appear. Make sure your AdSense account is approved and you've disabled ad blockers when testing.
                </AlertDescription>
              </Alert>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSlotDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={slotSaving}>{slotSaving ? "Saving…" : slotEditing ? "Update" : "Create"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Advertisement dialog */}
        <Dialog open={adDialogOpen} onOpenChange={setAdDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{adEditing ? "Edit advertisement" : "Add advertisement"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={saveAd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ad-title">Title *</Label>
                <Input id="ad-title" value={adForm.title} onChange={(e) => setAdForm((f) => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="ad-placement">Placement</Label>
                  <select
                    id="ad-placement"
                    value={adForm.placement}
                    onChange={(e) => setAdForm((f) => ({ ...f, placement: e.target.value as AdPlacement }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {adPlacements.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ad-type">Type</Label>
                  <select
                    id="ad-type"
                    value={adForm.ad_type}
                    onChange={(e) => setAdForm((f) => ({ ...f, ad_type: e.target.value as AdType }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {adTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ad-status">Status</Label>
                  <select
                    id="ad-status"
                    value={adForm.status}
                    onChange={(e) => setAdForm((f) => ({ ...f, status: e.target.value as AdStatus }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {adStatuses.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ad-link">Link URL</Label>
                <Input id="ad-link" value={adForm.link_url} onChange={(e) => setAdForm((f) => ({ ...f, link_url: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ad-html">HTML snippet (only for HTML ads)</Label>
                <textarea
                  id="ad-html"
                  value={adForm.html_snippet}
                  onChange={(e) => setAdForm((f) => ({ ...f, html_snippet: e.target.value }))}
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ad-image">Image file</Label>
                  <Input id="ad-image" type="file" accept="image/*" onChange={(e) => setAdImageFile(e.target.files?.[0] ?? null)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ad-video">Video file</Label>
                  <Input id="ad-video" type="file" accept="video/*" onChange={(e) => setAdVideoFile(e.target.files?.[0] ?? null)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={!!adForm.is_active} onCheckedChange={(v) => setAdForm((f) => ({ ...f, is_active: v }))} />
                <span className="text-sm">Active</span>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAdDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={adSaving}>{adSaving ? "Saving…" : adEditing ? "Update" : "Create"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Section dialog */}
        <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{sectionEditing ? "Edit section" : "Add section"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={saveSection} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="section-name_en">Name (English) *</Label>
                <Input
                  id="section-name_en"
                  value={sectionForm.name_en}
                  onChange={(e) => setSectionForm((f) => ({ ...f, name_en: e.target.value }))}
                  placeholder="e.g. National"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section-name_hi">Name (Hindi)</Label>
                <Input
                  id="section-name_hi"
                  value={sectionForm.name_hi ?? ""}
                  onChange={(e) => setSectionForm((f) => ({ ...f, name_hi: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section-name_gu">Name (Gujarati)</Label>
                <Input
                  id="section-name_gu"
                  value={sectionForm.name_gu ?? ""}
                  onChange={(e) => setSectionForm((f) => ({ ...f, name_gu: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section-slug">Slug (leave blank to auto-generate)</Label>
                <Input
                  id="section-slug"
                  value={sectionForm.slug ?? ""}
                  onChange={(e) => setSectionForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="national"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section-order">Order</Label>
                <Input
                  id="section-order"
                  type="number"
                  value={sectionForm.order ?? 0}
                  onChange={(e) => setSectionForm((f) => ({ ...f, order: parseInt(e.target.value, 10) || 0 }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="section-active"
                  checked={sectionForm.is_active ?? true}
                  onCheckedChange={(v) => setSectionForm((f) => ({ ...f, is_active: v }))}
                />
                <Label htmlFor="section-active">Active (visible on site)</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSectionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={sectionSaving}>
                  {sectionSaving ? "Saving…" : sectionEditing ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Category dialog */}
        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{categoryEditing ? "Edit category" : "Add category"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={saveCategory} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cat-name_en">Name (English) *</Label>
                <Input
                  id="cat-name_en"
                  value={categoryForm.name_en}
                  onChange={(e) => setCategoryForm((f) => ({ ...f, name_en: e.target.value }))}
                  placeholder="e.g. Politics"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-name_hi">Name (Hindi)</Label>
                <Input
                  id="cat-name_hi"
                  value={categoryForm.name_hi ?? ""}
                  onChange={(e) => setCategoryForm((f) => ({ ...f, name_hi: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-name_gu">Name (Gujarati)</Label>
                <Input
                  id="cat-name_gu"
                  value={categoryForm.name_gu ?? ""}
                  onChange={(e) => setCategoryForm((f) => ({ ...f, name_gu: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-slug">Slug (leave blank to auto-generate)</Label>
                <Input
                  id="cat-slug"
                  value={categoryForm.slug ?? ""}
                  onChange={(e) => setCategoryForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="politics"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="cat-active"
                  checked={categoryForm.is_active ?? true}
                  onCheckedChange={(v) => setCategoryForm((f) => ({ ...f, is_active: v }))}
                />
                <Label htmlFor="cat-active">Active</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={categorySaving}>
                  {categorySaving ? "Saving…" : categoryEditing ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Tag dialog */}
        <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{tagEditing ? "Edit tag" : "Add tag"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={saveTag} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tag-name">Name *</Label>
                <Input
                  id="tag-name"
                  value={tagForm.name}
                  onChange={(e) => setTagForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. elections"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tag-slug">Slug (leave blank to auto-generate)</Label>
                <Input
                  id="tag-slug"
                  value={tagForm.slug ?? ""}
                  onChange={(e) => setTagForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="elections"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setTagDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={tagSaving}>
                  {tagSaving ? "Saving…" : tagEditing ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete confirmations */}
        <AlertDialog open={!!sectionDeleteSlug} onOpenChange={(open) => !open && setSectionDeleteSlug(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete section?</AlertDialogTitle>
              <AlertDialogDescription>
                This cannot be undone. Articles in this section may need to be moved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteSection} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!categoryDeleteSlug} onOpenChange={(open) => !open && setCategoryDeleteSlug(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete category?</AlertDialogTitle>
              <AlertDialogDescription>
                This cannot be undone. Articles using this category will have it cleared.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteCategory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!tagDeleteSlug} onOpenChange={(open) => !open && setTagDeleteSlug(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete tag?</AlertDialogTitle>
              <AlertDialogDescription>This cannot be undone. The tag will be removed from all articles.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteTag} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!userDeleteId} onOpenChange={(open) => !open && setUserDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete user?</AlertDialogTitle>
              <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!slotDeleteId} onOpenChange={(open) => !open && setSlotDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete ad slot?</AlertDialogTitle>
              <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteSlot} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!adDeleteId} onOpenChange={(open) => !open && setAdDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete advertisement?</AlertDialogTitle>
              <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteAd} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageLayout>
  );
};

export default AdminDashboard;
