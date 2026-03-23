/**
 * API client for the News Portal backend.
 * In dev, use relative URLs so Vite proxies /api to http://localhost:8000.
 * This file intentionally exposes BOTH low-level helpers (`apiUrl`, `fetchJson`)
 * and higher-level convenience functions (getArticles, getSections, auth helpers, etc.).
 */

/** Rich error type used by the API client and hooks layer. */
export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }

  toString() {
    return this.message;
  }
}

/** Resolve base URL from Vite env; empty string → relative URLs for dev proxy. */
const getBaseUrl = (): string => {
  const env = import.meta.env.VITE_API_BASE_URL;
  if (env && typeof env === "string") return env.replace(/\/$/, "");
  return ""; // relative URLs → Vite proxy in dev
};

const baseUrl = getBaseUrl();

export function apiUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  // Backend mounts the versioned API at /api/v1/
  return `${baseUrl}/api/v1${p}`;
}

/** Internal auth token provider (can be wired from an AuthContext later). */
type AuthTokenProvider = () => string | null;
let getAuthToken: AuthTokenProvider = () => null;

export function setAuthTokenProvider(provider: AuthTokenProvider) {
  getAuthToken = provider;
}

type JsonBody = Record<string, unknown> | FormData | undefined;

interface RequestOptions extends Omit<RequestInit, "body"> {
  /** When true, automatically attach `Authorization: Bearer <token>` if available. */
  auth?: boolean;
  /** Convenience field for JSON / FormData bodies. */
  json?: JsonBody;
}

export interface CommentItem {
  id: number;
  content: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  user: number | {
    id: number;
    first_name?: string;
    last_name?: string;
  } | null;
  parent: number | null;
  video?: number;
  reel?: number;
  article?: number;
}

/**
 * Core request helper that all other helpers can build on.
 * - Adds optional auth header
 * - Handles JSON/text responses
 * - Throws ApiError on non-2xx responses
 */
async function request<T>(input: RequestInfo | URL, options: RequestOptions = {}): Promise<T> {
  const { auth, json, ...init } = options;

  const headers = new Headers(init.headers);
  let body: BodyInit | undefined;

  if (json instanceof FormData) {
    body = json;
  } else if (json !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(json);
  }

  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const res = await fetch(input, { ...init, headers, body });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  let data: unknown = null;
  try {
    data = isJson ? await res.json() : await res.text();
  } catch {
    // ignore parse errors; `data` stays null
  }

  if (!res.ok) {
    let errorMessage = `API request failed: ${res.status} ${res.statusText}`;
    
    // Attempt to extract detailed error messages from Django REST framework
    if (data && typeof data === "object") {
      const d = data as Record<string, any>;
      if (typeof d.detail === "string") {
        errorMessage = d.detail;
      } else if (typeof d.error === "string") {
        errorMessage = d.error;
      } else if (typeof d.message === "string") {
        errorMessage = d.message;
      } else {
        // Collect field-level array errors (e.g. {"name": ["A slot with this name already exists."]})
        const fieldErrors: string[] = [];
        for (const [key, val] of Object.entries(d)) {
          if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string") {
            // Capitalize the field name for readability (e.g. "is_active" -> "Is Active")
            const cleanKey = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            fieldErrors.push(`${cleanKey}: ${val[0]}`);
          }
        }
        if (fieldErrors.length > 0) {
          errorMessage = fieldErrors.join(" | ");
        }
      }
    }

    throw new ApiError(errorMessage, res.status, data);
  }

  return data as T;
}

/**
 * Backwards-compatible alias for the old fetchJson helper.
 * Prefer using `request` from within this file; externally you can still
 * call `fetchJson` if you need a generic JSON fetcher.
 */
async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  return request<T>(input, init);
}

// ---------- Auth helpers ----------

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return request<LoginResponse>(apiUrl("/auth/token/"), {
    method: "POST",
    json: payload as unknown as Record<string, unknown>,
  });
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: "SUPER_ADMIN" | "EDITOR" | "REPORTER" | "USER";
}

export async function getCurrentUser(accessToken?: string): Promise<AuthUser> {
  return request<AuthUser>(apiUrl("/auth/me/"), {
    method: "GET",
    auth: !accessToken,
    headers: accessToken
      ? {
        Authorization: `Bearer ${accessToken}`,
      }
      : undefined,
  });
}

export async function getHealth(): Promise<{ status: string; database: string }> {
  return request(apiUrl("/health/"));
}

export interface SiteSettingsData {
  tagline_en: string;
  tagline_gu?: string;
  tagline_hi?: string;
  about_title_en: string;
  about_title_gu?: string;
  about_title_hi?: string;
  about_description_en?: string;
  about_description_gu?: string;
  about_description_hi?: string;
  editor_name: string;
  editor_title_en: string;
  editor_title_gu?: string;
  editor_title_hi?: string;
  editor_bio_en?: string;
  editor_bio_gu?: string;
  editor_bio_hi?: string;
  mission_en?: string;
  mission_gu?: string;
  mission_hi?: string;
  publication_description_en?: string;
  publication_description_gu?: string;
  publication_description_hi?: string;
  website_url?: string;
  contact_phone_primary?: string;
  contact_phone_secondary?: string;
  contact_email?: string;
  contact_address?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  value1_title_en?: string;
  value1_title_gu?: string;
  value1_title_hi?: string;
  value1_desc_en?: string;
  value1_desc_gu?: string;
  value1_desc_hi?: string;
  value2_title_en?: string;
  value2_title_gu?: string;
  value2_title_hi?: string;
  value2_desc_en?: string;
  value2_desc_gu?: string;
  value2_desc_hi?: string;
  value3_title_en?: string;
  value3_title_gu?: string;
  value3_title_hi?: string;
  value3_desc_en?: string;
  value3_desc_gu?: string;
  value3_desc_hi?: string;
  value4_title_en?: string;
  value4_title_gu?: string;
  value4_title_hi?: string;
  value4_desc_en?: string;
  value4_desc_gu?: string;
  value4_desc_hi?: string;
  organization_name_en?: string;
  organization_name_gu?: string;
  organization_name_hi?: string;
  working_hours_en?: string;
  working_hours_gu?: string;
  working_hours_hi?: string;
  google_maps_embed_url?: string;

  // Advertise Page Fields
  advertise_title_en?: string;
  advertise_title_gu?: string;
  advertise_title_hi?: string;
  advertise_desc_en?: string;
  advertise_desc_gu?: string;
  advertise_desc_hi?: string;

  adv_stat1_value?: string;
  adv_stat1_label_en?: string;
  adv_stat1_label_gu?: string;
  adv_stat1_label_hi?: string;
  adv_stat2_value?: string;
  adv_stat2_label_en?: string;
  adv_stat2_label_gu?: string;
  adv_stat2_label_hi?: string;
  adv_stat3_value?: string;
  adv_stat3_label_en?: string;
  adv_stat3_label_gu?: string;
  adv_stat3_label_hi?: string;
  adv_stat4_value?: string;
  adv_stat4_label_en?: string;
  adv_stat4_label_gu?: string;
  adv_stat4_label_hi?: string;

  adv_format1_title_en?: string;
  adv_format1_title_gu?: string;
  adv_format1_title_hi?: string;
  adv_format1_desc_en?: string;
  adv_format1_desc_gu?: string;
  adv_format1_desc_hi?: string;
  adv_format1_tags_en?: string;
  adv_format1_tags_gu?: string;
  adv_format1_tags_hi?: string;

  adv_format2_title_en?: string;
  adv_format2_title_gu?: string;
  adv_format2_title_hi?: string;
  adv_format2_desc_en?: string;
  adv_format2_desc_gu?: string;
  adv_format2_desc_hi?: string;
  adv_format2_tags_en?: string;
  adv_format2_tags_gu?: string;
  adv_format2_tags_hi?: string;

  adv_format3_title_en?: string;
  adv_format3_title_gu?: string;
  adv_format3_title_hi?: string;
  adv_format3_desc_en?: string;
  adv_format3_desc_gu?: string;
  adv_format3_desc_hi?: string;
  adv_format3_tags_en?: string;
  adv_format3_tags_gu?: string;
  adv_format3_tags_hi?: string;
}

export async function getSiteSettings(): Promise<SiteSettingsData> {
  return request<SiteSettingsData>(apiUrl("/site/settings/"));
}

export async function updateSiteSettings(payload: Partial<SiteSettingsData>): Promise<SiteSettingsData> {
  return request<SiteSettingsData>(apiUrl("/site/settings/"), {
    method: "PATCH",
    auth: true,
    json: payload as Record<string, unknown>,
  });
}

// ---------- Market Indices (Live Nifty, Sensex, etc.) ----------

export interface MarketIndexItem {
  name: string;
  symbol: string;
  value: string | null;
  change: string | null;
  changePercent: number | null;
  isUp: boolean | null;
  error?: boolean;
}

export interface MarketIndicesResponse {
  indices: MarketIndexItem[];
}

export async function getMarketIndices(): Promise<MarketIndicesResponse> {
  return request<MarketIndicesResponse>(apiUrl("/market/indices/"), { method: "GET" });
}

// ---------- Analytics (Editor/Super Admin) ----------

export interface NewsViewEvent {
  id: number;
  article: number;
  user: number | null;
  ip_address?: string;
  user_agent?: string;
  viewed_at: string;
}

export async function listNewsViews(params?: { page_size?: number; ordering?: string }): Promise<NewsViewEvent[]> {
  const qs = new URLSearchParams();
  qs.set("page_size", String(params?.page_size ?? 200));
  if (params?.ordering) qs.set("ordering", params.ordering);
  const data = await request<{ results?: NewsViewEvent[] } | NewsViewEvent[]>(
    apiUrl(`/analytics/views/?${qs.toString()}`),
    { method: "GET", auth: true }
  );
  return Array.isArray(data) ? data : (data?.results ?? []);
}

export interface MediaItem {
  id: number;
  media_type: string;
  file?: string | null;
  image?: string | null;
  youtube_url?: string;
  thumbnail?: string | null;
  caption?: string;
  order: number;
}

export type MediaType = "IMAGE" | "VIDEO" | "REEL" | "YOUTUBE";

export async function listMedia(params?: { article?: number; media_type?: MediaType }): Promise<MediaItem[]> {
  const qs = new URLSearchParams();
  if (params?.article) qs.set("article", String(params.article));
  if (params?.media_type) qs.set("media_type", params.media_type);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const data = await request<{ results?: MediaItem[] } | MediaItem[]>(
    apiUrl(`/news/media/${suffix}`),
    { method: "GET" }
  );
  return Array.isArray(data) ? data : (data?.results ?? []);
}

export type MediaCreatePayload = {
  article: number;
  media_type: MediaType;
  caption?: string;
  order?: number;
  file?: File | null;
  image?: File | null;
  thumbnail?: File | null;
  youtube_url?: string;
};

export async function createMedia(payload: MediaCreatePayload): Promise<MediaItem> {
  const fd = new FormData();
  fd.append("article", String(payload.article));
  fd.append("media_type", payload.media_type);
  if (payload.caption) fd.append("caption", payload.caption);
  if (payload.order != null) fd.append("order", String(payload.order));
  if (payload.youtube_url) fd.append("youtube_url", payload.youtube_url);
  if (payload.file) fd.append("file", payload.file);
  if (payload.image) fd.append("image", payload.image);
  if (payload.thumbnail) fd.append("thumbnail", payload.thumbnail);
  return request(apiUrl("/news/media/"), { method: "POST", auth: true, json: fd });
}

export async function deleteMedia(id: number): Promise<void> {
  await request(apiUrl(`/news/media/${id}/`), { method: "DELETE", auth: true });
}

export interface ArticleListItem {
  id: number;
  slug: string;
  title_en: string;
  title_hi?: string;
  title_gu?: string;
  summary_en?: string;
  summary_hi?: string;
  summary_gu?: string;
  content_en?: string;
  content_hi?: string;
  content_gu?: string;
  status: string;
  content_type: string;
  primary_language: string;
  is_breaking: boolean;
  is_top: boolean;
  is_trending: boolean;
  is_editor_pick: boolean;
  view_count?: number;
  likes_count?: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  section: number;
  category: number | null;
  district: number | null;
  district_name_en?: string | null;
  district_name_gu?: string | null;
  poll?: PollData;
  tags: number[];
  featured_image?: string | null;
  media?: MediaItem[];
}

export interface ArticlesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ArticleListItem[];
}

export interface VideoContentItem {
  id: number;
  slug: string;
  title_en: string;
  title_hi?: string;
  title_gu?: string;
  description_en?: string;
  description_hi?: string;
  description_gu?: string;
  status: string;
  primary_language: string;
  view_count?: number;
  likes_count?: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  section: number;
  category: number | null;
  tags: number[];
  thumbnail?: string | null;
  file?: string | null;
  youtube_url?: string | null;
}

export interface ReelContentItem {
  id: number;
  slug: string;
  title_en: string;
  title_hi?: string;
  title_gu?: string;
  description_en?: string;
  description_hi?: string;
  description_gu?: string;
  status: string;
  primary_language: string;
  view_count?: number;
  likes_count?: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  section: number;
  category: number | null;
  tags: number[];
  thumbnail?: string | null;
  file?: string | null;
  youtube_url?: string | null;
}

export interface VideoContentResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: VideoContentItem[];
}

export interface ReelContentResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ReelContentItem[];
}

export async function getArticles(params?: {
  page?: number;
  page_size?: number;
  section?: number;
  category?: number;
  district?: number;
  status?: string;
  search?: string;
  /** Optional content type filter: ARTICLE, VIDEO, REEL, YOUTUBE */
  content_type?: string;
  /** Optional primary language filter: en, hi, gu */
  primary_language?: string;
  /** Optional flags corresponding to NewsArticle boolean fields */
  is_breaking?: boolean;
  is_top?: boolean;
  is_trending?: boolean;
  /** Optional explicit ordering, e.g. "-published_at,-created_at" */
  ordering?: string;
}): Promise<ArticlesResponse> {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.page_size) search.set("page_size", String(params.page_size));
  if (params?.section) search.set("section", String(params.section));
  if (params?.category) search.set("category", String(params.category));
  if (params?.district) search.set("district", String(params.district));
  if (params?.status) search.set("status", params.status);
  if (params?.search) search.set("search", params.search);
  if (params?.content_type) search.set("content_type", params.content_type);
  if (params?.primary_language) search.set("primary_language", params.primary_language);
  if (typeof params?.is_breaking === "boolean") {
    search.set("is_breaking", String(params.is_breaking));
  }
  if (typeof params?.is_top === "boolean") {
    search.set("is_top", String(params.is_top));
  }
  if (typeof params?.is_trending === "boolean") {
    search.set("is_trending", String(params.is_trending));
  }
  // Default ordering: newest first by published time, then creation time
  if (params?.ordering) {
    search.set("ordering", params.ordering);
  } else {
    search.set("ordering", "-published_at,-created_at");
  }
  const qs = search.toString();
  const url = apiUrl("/news/articles/" + (qs ? `?${qs}` : ""));
  // For search requests, explicitly disable authentication
  const useAuth = !params?.search;
  const data = await request<ArticlesResponse | ArticleListItem[]>(url, {
    method: "GET",
    auth: useAuth,
  });

  // Backend can be configured with or without pagination.
  // Normalize both shapes into a consistent ArticlesResponse:
  // - If we get an array → wrap it in { count, next, previous, results }.
  // - If we get the paginated object → return as-is.
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data,
    };
  }

  return data;
}

export async function getVideos(params?: {
  page?: number;
  section?: number;
  category?: number;
  status?: string;
  search?: string;
  /** Optional primary language filter: en, hi, gu */
  primary_language?: string;
  is_live?: boolean;
}): Promise<VideoContentResponse> {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.is_live !== undefined) search.set("is_live", String(params.is_live));
  if (params?.section) search.set("section", String(params.section));
  if (params?.category) search.set("category", String(params.category));
  if (params?.status) search.set("status", params.status);
  if (params?.search) search.set("search", params.search);
  if (params?.primary_language) search.set("primary_language", params.primary_language);
  const qs = search.toString();
  const url = apiUrl("/videos/" + (qs ? `?${qs}` : ""));
  return fetchJson(url);
}

export async function getReels(params?: {
  page?: number;
  section?: number;
  category?: number;
  status?: string;
  search?: string;
  /** Optional primary language filter: en, hi, gu */
  primary_language?: string;
  is_live?: boolean;
}): Promise<ReelContentResponse> {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.is_live !== undefined) search.set("is_live", String(params.is_live));
  if (params?.section) search.set("section", String(params.section));
  if (params?.category) search.set("category", String(params.category));
  if (params?.status) search.set("status", params.status);
  if (params?.search) search.set("search", params.search);
  if (params?.primary_language) search.set("primary_language", params.primary_language);
  const qs = search.toString();
  const url = apiUrl("/reels/" + (qs ? `?${qs}` : ""));
  return fetchJson(url);
}

// ---------- Poll Admin ----------

export interface PollPayload {
  article: number;
  question: string;
  is_active?: boolean;
  options: { text: string }[];
}

export async function createPoll(payload: PollPayload): Promise<PollData> {
  return request<PollData>(apiUrl("/news/polls/"), {
    method: "POST",
    auth: true,
    json: payload as unknown as Record<string, unknown>,
  });
}

export async function updatePoll(id: number, payload: Partial<PollPayload>): Promise<PollData> {
  return request<PollData>(apiUrl(`/news/polls/${id}/`), {
    method: "PATCH",
    auth: true,
    json: payload as unknown as Record<string, unknown>,
  });
}

export async function deletePoll(id: number): Promise<void> {
  await request(apiUrl(`/news/polls/${id}/`), {
    method: "DELETE",
    auth: true,
  });
}

// ---------- Video/Reel Admin (create with file OR link) ----------

export type VideoContentPayload = {
  title_en: string;
  title_hi?: string;
  title_gu?: string;
  description_en?: string;
  description_hi?: string;
  description_gu?: string;
  section: number;
  category?: number | null;
  tags?: number[];
  primary_language?: string;
  status?: string;
  is_live?: boolean;
  view_count?: number | "";
  likes_count?: number | "";
  file?: File | null;
  youtube_url?: string;
  thumbnail?: File | null;
};

export type ReelContentPayload = VideoContentPayload;

function slugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200) || "clip";
}

function clipPayloadToFormData(
  payload: VideoContentPayload,
  _prefix: "video" | "reel"
): FormData {
  const fd = new FormData();
  fd.append("title_en", payload.title_en);
  fd.append("slug", slugFromTitle(payload.title_en));
  if (payload.title_hi) fd.append("title_hi", payload.title_hi);
  if (payload.title_gu) fd.append("title_gu", payload.title_gu);
  if (payload.description_en) fd.append("description_en", payload.description_en ?? "");
  if (payload.description_hi) fd.append("description_hi", payload.description_hi ?? "");
  if (payload.description_gu) fd.append("description_gu", payload.description_gu ?? "");
  fd.append("section", String(payload.section));
  if (payload.category != null) fd.append("category", String(payload.category));
  if (payload.tags?.length) payload.tags.forEach((t) => fd.append("tags", String(t)));
  fd.append("primary_language", payload.primary_language ?? "EN");
  fd.append("status", payload.status ?? "DRAFT");
  if (payload.is_live !== undefined) fd.append("is_live", String(payload.is_live));
  if (payload.view_count !== undefined && payload.view_count !== "") fd.append("view_count", String(payload.view_count));
  if (payload.likes_count !== undefined && payload.likes_count !== "") fd.append("likes_count", String(payload.likes_count));
  if (payload.youtube_url?.trim()) fd.append("youtube_url", payload.youtube_url.trim());
  if (payload.file) fd.append("file", payload.file);
  if (payload.thumbnail) fd.append("thumbnail", payload.thumbnail);
  return fd;
}

export async function createVideoContentAdmin(payload: VideoContentPayload): Promise<VideoContentItem> {
  const fd = clipPayloadToFormData(payload, "video");
  return request<VideoContentItem>(apiUrl("/videos/"), { method: "POST", auth: true, json: fd });
}

export async function updateVideoContentAdmin(id: number, payload: Partial<VideoContentPayload>): Promise<VideoContentItem> {
  const fd = new FormData();
  if (payload.title_en != null) fd.append("title_en", payload.title_en);
  if (payload.title_hi != null) fd.append("title_hi", payload.title_hi);
  if (payload.title_gu != null) fd.append("title_gu", payload.title_gu);
  if (payload.description_en != null) fd.append("description_en", payload.description_en);
  if (payload.description_hi != null) fd.append("description_hi", payload.description_hi);
  if (payload.description_gu != null) fd.append("description_gu", payload.description_gu);
  if (payload.section != null) fd.append("section", String(payload.section));
  if (payload.category != null) fd.append("category", String(payload.category));
  if (payload.tags != null) payload.tags.forEach((t) => fd.append("tags", String(t)));
  if (payload.primary_language != null) fd.append("primary_language", payload.primary_language);
  if (payload.status != null) fd.append("status", payload.status);
  if (payload.is_live !== undefined) fd.append("is_live", String(payload.is_live));
  if (payload.view_count !== undefined && payload.view_count !== "") fd.append("view_count", String(payload.view_count));
  if (payload.likes_count !== undefined && payload.likes_count !== "") fd.append("likes_count", String(payload.likes_count));
  if (payload.youtube_url != null) fd.append("youtube_url", payload.youtube_url);
  if (payload.file) fd.append("file", payload.file);
  if (payload.thumbnail) fd.append("thumbnail", payload.thumbnail);
  return request<VideoContentItem>(apiUrl(`/videos/${id}/`), { method: "PATCH", auth: true, json: fd });
}

export async function deleteVideoContentAdmin(id: number): Promise<void> {
  await request(apiUrl(`/videos/${id}/`), { method: "DELETE", auth: true });
}

export interface VideoContentResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: VideoContentItem[];
}

export async function getVideosAdmin(pageOpts?: { page?: number; limit?: number; status?: string }): Promise<VideoContentResponse> {
  const qs = new URLSearchParams();
  if (pageOpts?.page) qs.set("page", String(pageOpts.page));
  if (pageOpts?.limit) qs.set("page_size", String(pageOpts.limit));
  if (pageOpts?.status) qs.set("status", pageOpts.status);
  return request<VideoContentResponse>(apiUrl(`/videos/?${qs.toString()}`), { method: "GET", auth: true });
}

// ---------- Video Engagement (Likes/Comments) ----------

export async function toggleVideoLike(videoId: number, isLike: boolean): Promise<void> {
  await request(apiUrl(`/videos/${videoId}/like/`), {
    method: isLike ? "POST" : "DELETE",
    auth: true,
  });
}

export async function getVideoComments(videoId: number): Promise<CommentItem[]> {
  return request<CommentItem[]>(
    apiUrl(`/videos/${videoId}/comment/`),
    { method: "GET" }
  );
}

export async function postVideoComment(videoId: number, content: string, parentId?: number): Promise<CommentItem> {
  return request<CommentItem>(apiUrl(`/videos/${videoId}/comment/`), {
    method: "POST",
    auth: true,
    json: { content, parent: parentId || null },
  });
}

export async function createReelContentAdmin(payload: ReelContentPayload): Promise<ReelContentItem> {
  const fd = clipPayloadToFormData(payload, "reel");
  return request<ReelContentItem>(apiUrl("/reels/"), { method: "POST", auth: true, json: fd });
}

export async function updateReelContentAdmin(id: number, payload: Partial<ReelContentPayload>): Promise<ReelContentItem> {
  const fd = new FormData();
  if (payload.title_en != null) fd.append("title_en", payload.title_en);
  if (payload.title_hi != null) fd.append("title_hi", payload.title_hi);
  if (payload.title_gu != null) fd.append("title_gu", payload.title_gu);
  if (payload.description_en != null) fd.append("description_en", payload.description_en ?? "");
  if (payload.description_hi != null) fd.append("description_hi", payload.description_hi ?? "");
  if (payload.description_gu != null) fd.append("description_gu", payload.description_gu ?? "");
  if (payload.section != null) fd.append("section", String(payload.section));
  if (payload.category != null) fd.append("category", String(payload.category));
  if (payload.tags != null) payload.tags.forEach((t) => fd.append("tags", String(t)));
  if (payload.primary_language != null) fd.append("primary_language", payload.primary_language);
  if (payload.status != null) fd.append("status", payload.status);
  if (payload.youtube_url != null) fd.append("youtube_url", payload.youtube_url);
  if (payload.file) fd.append("file", payload.file);
  if (payload.thumbnail) fd.append("thumbnail", payload.thumbnail);
  return request<ReelContentItem>(apiUrl(`/reels/${id}/`), { method: "PATCH", auth: true, json: fd });
}

export async function deleteReelContentAdmin(id: number): Promise<void> {
  await request(apiUrl(`/reels/${id}/`), { method: "DELETE", auth: true });
}

export interface ReelContentResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ReelContentItem[];
}

export async function getReelsAdmin(pageOpts?: { page?: number; limit?: number; status?: string }): Promise<ReelContentResponse> {
  const qs = new URLSearchParams();
  if (pageOpts?.page) qs.set("page", String(pageOpts.page));
  if (pageOpts?.limit) qs.set("page_size", String(pageOpts.limit));
  if (pageOpts?.status) qs.set("status", pageOpts.status);
  return request<ReelContentResponse>(apiUrl(`/reels/?${qs.toString()}`), { method: "GET", auth: true });
}

// ---------- Reel Engagement (Likes/Comments) ----------

export async function toggleReelLike(reelId: number, isLike: boolean): Promise<void> {
  await request(apiUrl(`/reels/${reelId}/like/`), {
    method: isLike ? "POST" : "DELETE",
    auth: true,
  });
}

export async function getReelComments(reelId: number): Promise<CommentItem[]> {
  return request<CommentItem[]>(
    apiUrl(`/reels/${reelId}/comment/`),
    { method: "GET" }
  );
}

export async function postReelComment(reelId: number, content: string, parentId?: number): Promise<CommentItem> {
  return request<CommentItem>(apiUrl(`/reels/${reelId}/comment/`), {
    method: "POST",
    auth: true,
    json: { content, parent: parentId || null },
  });
}

// ---------- Content Studio (Editor/Super Admin) ----------

export type ArticleUpsertPayload = Partial<
  Pick<
    ArticleListItem,
    | "title_en"
    | "title_hi"
    | "title_gu"
    | "summary_en"
    | "summary_hi"
    | "summary_gu"
    | "content_en"
    | "content_hi"
    | "content_gu"
    | "section"
    | "category"
    | "district"
    | "tags"
    | "status"
    | "content_type"
    | "primary_language"
    | "is_breaking"
    | "is_top"
    | "is_trending"
    | "is_editor_pick"
    | "published_at"
    | "view_count"
    | "likes_count"
  >
> & {
  slug?: string;
};

export async function createArticle(payload: ArticleUpsertPayload): Promise<ArticleListItem> {
  return request<ArticleListItem>(apiUrl("/news/articles/"), {
    method: "POST",
    auth: true,
    json: payload as Record<string, unknown>,
  });
}

export async function updateArticle(slug: string, payload: ArticleUpsertPayload): Promise<ArticleListItem> {
  return request<ArticleListItem>(apiUrl(`/news/articles/${slug}/`), {
    method: "PATCH",
    auth: true,
    json: payload as Record<string, unknown>,
  });
}

export async function deleteArticle(slug: string): Promise<void> {
  await request(apiUrl(`/news/articles/${slug}/`), { method: "DELETE", auth: true });
}

export async function updateArticleFeaturedImage(slug: string, file: File | null): Promise<ArticleListItem> {
  const fd = new FormData();
  if (file) fd.append("featured_image", file);
  return request<ArticleListItem>(apiUrl(`/news/articles/${slug}/`), {
    method: "PATCH",
    auth: true,
    json: fd,
  });
}

export async function getArticleBySlug(slug: string): Promise<ArticleListItem | null> {
  try {
    return await request<ArticleListItem>(apiUrl(`/news/articles/${slug}/`), {
      method: "GET",
      auth: true,
    });
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export interface SectionItem {
  id: number;
  name_en: string;
  name_hi: string;
  name_gu: string;
  slug: string;
  image: string | null;
  parent: number | null;
  order: number;
  is_active: boolean;
  is_approved: boolean;
  approved_by: number | null;
  approved_at: string | null;
  children?: SectionItem[];
}

export async function getSections(): Promise<SectionItem[]> {
  const data = await request<unknown>(apiUrl("/news/sections/?page_size=50"));
  if (Array.isArray(data)) return data as SectionItem[];
  if (data && typeof data === "object" && "results" in data && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: SectionItem[] }).results;
  }
  return [];
}

export interface DistrictItem {
  id: number;
  name_en: string;
  name_hi?: string;
  name_gu?: string;
  slug: string;
  section: number;
  order: number;
  is_active: boolean;
}

export async function getDistricts(params?: { section?: number; is_active?: boolean }): Promise<DistrictItem[]> {
  const qs = new URLSearchParams();
  qs.set("page_size", "200");
  if (params?.section != null) qs.set("section", String(params.section));
  if (params?.is_active != null) qs.set("is_active", String(params.is_active));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const data = await request<unknown>(apiUrl(`/news/districts/${suffix}`));
  if (Array.isArray(data)) return data as DistrictItem[];
  if (data && typeof data === "object" && "results" in data && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: DistrictItem[] }).results;
  }
  return [];
}

export async function getSectionBySlug(slug: string): Promise<SectionItem | null> {
  const res = await fetch(apiUrl(`/news/sections/${slug}/`));
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Section fetch failed: ${res.status}`);
  return (await res.json()) as SectionItem;
}

export interface CategoryItem {
  id: number;
  name_en: string;
  name_hi?: string;
  name_gu?: string;
  slug: string;
  is_active: boolean;
  is_approved: boolean;
  approved_by?: number | null;
  approved_at?: string | null;
}

export async function getCategories(): Promise<CategoryItem[]> {
  // Categories are public, no authentication needed
  const data = await request<unknown>(apiUrl("/news/categories/"), {
    method: "GET",
    auth: false,
  });
  if (Array.isArray(data)) return data as CategoryItem[];
  if (data && typeof data === "object" && "results" in data && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: CategoryItem[] }).results;
  }
  return [];
}

export async function getCategoryBySlug(slug: string): Promise<CategoryItem | null> {
  const res = await fetch(apiUrl(`/news/categories/${slug}/`));
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Category fetch failed: ${res.status}`);
  return (await res.json()) as CategoryItem;
}

export interface TagItem {
  id: number;
  name: string;
  slug: string;
  is_approved: boolean;
  approved_by?: number | null;
  approved_at?: string | null;
}

export async function getTags(): Promise<TagItem[]> {
  const data = await request<unknown>(apiUrl("/news/tags/"));
  if (Array.isArray(data)) return data as TagItem[];
  if (data && typeof data === "object" && "results" in data && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: TagItem[] }).results;
  }
  return [];
}

export async function getTrendingTags(limit = 20): Promise<TagItem[]> {
  const qs = new URLSearchParams();
  qs.set("limit", String(limit));
  // Trending tags are public, no authentication needed
  return request<TagItem[]>(apiUrl(`/news/tags/trending/?${qs.toString()}`), {
    method: "GET",
    auth: false,
  });
}

// ---------- Likes (authenticated users only) ----------

export interface LikeItem {
  id: number;
  user: number;
  article: number;
  created_at: string;
}

/**
 * Returns the current user's Like for a given article, or null if not liked.
 * Must be called with auth; returns empty if unauthenticated.
 */
export async function getUserLikeForArticle(articleId: number): Promise<LikeItem | null> {
  try {
    const data = await request<{ results?: LikeItem[] } | LikeItem[]>(
      apiUrl(`/news/likes/?article=${articleId}`),
      { method: "GET", auth: true }
    );
    const items = Array.isArray(data) ? data : (data?.results ?? []);
    return items.length > 0 ? items[0] : null;
  } catch {
    return null;
  }
}

/** POST to /news/likes/ to create a Like for an article. */
export async function createLike(articleId: number): Promise<LikeItem> {
  return request<LikeItem>(apiUrl("/news/likes/"), {
    method: "POST",
    auth: true,
    json: { article: articleId },
  });
}

/** DELETE /news/likes/{id}/ to remove a Like. */
export async function deleteLike(likeId: number): Promise<void> {
  await request(apiUrl(`/news/likes/${likeId}/`), { method: "DELETE", auth: true });
}

// ---------- Comments ----------

export interface CommentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CommentItem[];
}

/** GET /news/comments/?article={id} — returns approved comments for an article. */
export async function getArticleComments(articleId: number): Promise<CommentItem[]> {
  const data = await request<CommentsResponse | CommentItem[]>(
    apiUrl(`/news/comments/?article=${articleId}&page_size=100`),
    { method: "GET" }
  );
  return Array.isArray(data) ? data : (data?.results ?? []);
}

/** POST /news/comments/ — post a new comment (requires auth). */
export async function postComment(
  articleId: number,
  content: string,
  parentId?: number
): Promise<CommentItem> {
  return request<CommentItem>(apiUrl("/news/comments/"), {
    method: "POST",
    auth: true,
    json: { article: articleId, content, ...(parentId != null ? { parent: parentId } : {}) },
  });
}

/** DELETE /news/comments/{id}/ — delete a comment (requires auth, own comment or privileged). */
export async function deleteComment(commentId: number): Promise<void> {
  await request(apiUrl(`/news/comments/${commentId}/`), { method: "DELETE", auth: true });
}

// ---------- Admin CRUD (require auth: Editor/Super Admin) ----------

/** List all sections (including inactive) when authenticated as content manager */
export async function getSectionsAdmin(): Promise<SectionItem[]> {
  const data = await request<{ results?: SectionItem[] } | SectionItem[]>(
    apiUrl("/news/sections/?page_size=100"),
    { method: "GET", auth: true }
  );
  return Array.isArray(data) ? data : (data?.results ?? []);
}

/** List all categories (including inactive) when authenticated */
export async function getCategoriesAdmin(): Promise<CategoryItem[]> {
  const data = await request<{ results?: CategoryItem[] } | CategoryItem[]>(
    apiUrl("/news/categories/?page_size=100"),
    { method: "GET", auth: true }
  );
  return Array.isArray(data) ? data : (data?.results ?? []);
}

/** List all tags when authenticated */
export async function getTagsAdmin(): Promise<TagItem[]> {
  const data = await request<{ results?: TagItem[] } | TagItem[]>(
    apiUrl("/news/tags/?page_size=200"),
    { method: "GET", auth: true }
  );
  return Array.isArray(data) ? data : (data?.results ?? []);
}

export type SectionPayload = Partial<Omit<SectionItem, "id" | "image">> & { name_en: string; image?: File | string | null };
export type CategoryPayload = Partial<Omit<CategoryItem, "id">> & { name_en: string };
export type TagPayload = Partial<Omit<TagItem, "id">> & { name: string };

export async function createSection(payload: SectionPayload): Promise<SectionItem> {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === "image" && typeof value === "string" && (value.startsWith("http") || value.startsWith("/media"))) {
        // Skip current image URL if it's already a string from the backend
        return;
      }
      formData.append(key, value instanceof File ? value : String(value));
    }
  });
  return request(apiUrl("/news/sections/"), { method: "POST", auth: true, json: formData as any });
}

export async function updateSection(slug: string, payload: Partial<SectionPayload>): Promise<SectionItem> {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key === "image" && typeof value === "string" && (value.startsWith("http") || value.startsWith("/media"))) {
        // Skip current image URL if it's already a string from the backend
        return;
      }
      if (value === null) {
        // Handle explicit null for clearing image
        formData.append(key, "");
      } else {
        formData.append(key, value instanceof File ? value : String(value));
      }
    }
  });
  return request(apiUrl(`/news/sections/${slug}/`), { method: "PATCH", auth: true, json: formData as any });
}

export async function deleteSection(slug: string): Promise<void> {
  await request(apiUrl(`/news/sections/${slug}/`), { method: "DELETE", auth: true });
}

export async function createCategory(payload: CategoryPayload): Promise<CategoryItem> {
  return request(apiUrl("/news/categories/"), { method: "POST", auth: true, json: payload as Record<string, unknown> });
}

export async function updateCategory(slug: string, payload: Partial<CategoryPayload>): Promise<CategoryItem> {
  return request(apiUrl(`/news/categories/${slug}/`), { method: "PATCH", auth: true, json: payload as Record<string, unknown> });
}

export async function deleteCategory(slug: string): Promise<void> {
  await request(apiUrl(`/news/categories/${slug}/`), { method: "DELETE", auth: true });
}

export async function createTag(payload: TagPayload): Promise<TagItem> {
  return request(apiUrl("/news/tags/"), { method: "POST", auth: true, json: payload as Record<string, unknown> });
}

export async function updateTag(slug: string, payload: Partial<TagPayload>): Promise<TagItem> {
  return request(apiUrl(`/news/tags/${slug}/`), { method: "PATCH", auth: true, json: payload as Record<string, unknown> });
}

export async function deleteTag(slug: string): Promise<void> {
  await request(apiUrl(`/news/tags/${slug}/`), { method: "DELETE", auth: true });
}

// Approval actions (Super Admin only)
export async function approveSection(slug: string): Promise<{ status: string }> {
  return request(apiUrl(`/news/sections/${slug}/approve/`), { method: "POST", auth: true });
}

export async function rejectSection(slug: string): Promise<{ status: string }> {
  return request(apiUrl(`/news/sections/${slug}/reject/`), { method: "POST", auth: true });
}

export async function approveCategory(slug: string): Promise<{ status: string }> {
  return request(apiUrl(`/news/categories/${slug}/approve/`), { method: "POST", auth: true });
}

export async function rejectCategory(slug: string): Promise<{ status: string }> {
  return request(apiUrl(`/news/categories/${slug}/reject/`), { method: "POST", auth: true });
}

export async function approveTag(slug: string): Promise<{ status: string }> {
  return request(apiUrl(`/news/tags/${slug}/approve/`), { method: "POST", auth: true });
}

export async function rejectTag(slug: string): Promise<{ status: string }> {
  return request(apiUrl(`/news/tags/${slug}/reject/`), { method: "POST", auth: true });
}

/** Get breaking news articles */
export async function getBreakingNews(): Promise<ArticleListItem[]> {
  return fetchJson(apiUrl("/news/articles/breaking/"));
}

/** Get top news articles */
export async function getTopNews(): Promise<ArticleListItem[]> {
  return fetchJson(apiUrl("/news/articles/top/"));
}

/** Get editor's pick articles */
export async function getEditorPicks(): Promise<ArticleListItem[]> {
  return fetchJson(apiUrl("/news/articles/editor-picks/"));
}


/** Get most-read articles */
export async function getMostRead(params?: { limit?: number; days?: number }): Promise<ArticleListItem[]> {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.days) qs.set("days", String(params.days));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return fetchJson(apiUrl(`/news/articles/most-read/${suffix}`));
}

/** Get related articles */
export async function getRelatedArticles(slug: string): Promise<ArticleListItem[]> {
  return fetchJson(apiUrl(`/news/articles/${slug}/related/`));
}

/** Get articles by section slug */
export async function getArticlesBySection(sectionSlug: string, params?: {
  page?: number;
  category?: number;
  district?: number;
  search?: string;
}): Promise<ArticlesResponse> {
  const section = await getSectionBySlug(sectionSlug);
  if (!section) throw new Error(`Section not found: ${sectionSlug}`);
  return getArticles({ ...params, section: section.id });
}

/** Get articles by category slug */
export async function getArticlesByCategory(categorySlug: string, params?: {
  page?: number;
  section?: number;
  search?: string;
}): Promise<ArticlesResponse> {
  const category = await getCategoryBySlug(categorySlug);
  if (!category) throw new Error(`Category not found: ${categorySlug}`);
  return getArticles({ ...params, category: category.id });
}

/** Track article view */
export async function trackArticleView(slug: string): Promise<void> {
  const res = await fetch(apiUrl(`/news/articles/${slug}/track_view/`), {
    method: "POST",
  });
  if (!res.ok) throw new Error(`View tracking failed: ${res.status}`);
}

export async function trackReelView(id: number): Promise<void> {
  try {
    await fetch(apiUrl(`/reels/${id}/track_view/`), { method: "POST" });
  } catch {
    // Non-critical: ignore tracking errors
  }
}

export async function trackVideoView(id: number): Promise<void> {
  try {
    await fetch(apiUrl(`/videos/${id}/track_view/`), { method: "POST" });
  } catch {
    // Non-critical: ignore tracking errors
  }
}

export async function toggleArticleLike(slug: string): Promise<{ liked: boolean }> {
  return request<{ liked: boolean }>(apiUrl(`/news/articles/${slug}/toggle_like/`), {
    method: "POST",
    auth: true,
  });
}
// Ads

export interface Advertisement {
  id: number;
  title: string;
  placement: string;
  ad_type: "IMAGE" | "VIDEO" | "HTML";
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "ENDED";
  image?: string | null;
  video?: string | null;
  link_url?: string | null;
  html_snippet?: string | null;
  advertiser_name?: string;
  advertiser_email?: string;
  advertiser_phone?: string;
  start_at?: string | null;
  end_at?: string | null;
  is_active: boolean;
  impression_count?: number;
  click_count?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch currently active ads for a given placement (e.g. "SIDEBAR").
 * Public list is already limited to active ads by the backend.
 */
export async function getAdvertisements(params?: {
  placement?: string;
  ad_type?: string;
}): Promise<Advertisement[]> {
  const search = new URLSearchParams();
  if (params?.placement) search.set("placement", params.placement);
  if (params?.ad_type) search.set("ad_type", params.ad_type);
  const qs = search.toString();
  const path = "/ads/advertisements/" + (qs ? `?${qs}` : "");
  return request(apiUrl(path));
}

// ---------- Admin: Users (Super Admin only) ----------

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: "SUPER_ADMIN" | "EDITOR" | "REPORTER" | "USER";
  phone_number?: string;
  profile_picture?: string | null;
  is_active: boolean;
  is_staff: boolean;
  last_login?: string | null;
  date_joined?: string;
}

export type AdminUserPayload = Partial<Omit<AdminUser, "id" | "last_login" | "date_joined">> & {
  username: string;
  email: string;
  /** Required on create; optional on update */
  password?: string;
  role: AdminUser["role"];
};

export async function listUsersAdmin(params?: { page_size?: number }): Promise<AdminUser[]> {
  const qs = new URLSearchParams();
  qs.set("page_size", String(params?.page_size ?? 200));
  const data = await request<{ results?: AdminUser[] } | AdminUser[]>(
    apiUrl(`/users/?${qs.toString()}`),
    { method: "GET", auth: true }
  );
  return Array.isArray(data) ? data : (data?.results ?? []);
}

export async function createUserAdmin(payload: AdminUserPayload): Promise<AdminUser> {
  return request(apiUrl("/users/"), {
    method: "POST",
    auth: true,
    json: payload as Record<string, unknown>,
  });
}

export async function updateUserAdmin(id: number, payload: Partial<AdminUserPayload>): Promise<AdminUser> {
  return request(apiUrl(`/users/${id}/`), {
    method: "PATCH",
    auth: true,
    json: payload as Record<string, unknown>,
  });
}

export async function deleteUserAdmin(id: number): Promise<void> {
  await request(apiUrl(`/users/${id}/`), { method: "DELETE", auth: true });
}

// ---------- Admin: Ads / Slots / Requests ----------

export type AdPlacement = "TOP" | "SIDEBAR_LEFT" | "SIDEBAR_RIGHT" | "IN_ARTICLE" | "FOOTER" | "POPUP";
export type AdType = "IMAGE" | "VIDEO" | "HTML";
export type AdStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "ENDED";

export interface GoogleAdSenseSlot {
  id: number;
  name: string;
  placement: AdPlacement;
  client_id: string;
  slot_id: string;
  format: string;
  responsive: boolean;
  is_active: boolean;
  order: number;
}

export type GoogleAdSenseSlotPayload = Omit<GoogleAdSenseSlot, "id">;

/**
 * Public (unauthenticated) list of active AdSense slots.
 * The backend already filters to `is_active=True` for list/retrieve.
 */
export async function getAdSlots(params?: { placement?: AdPlacement }): Promise<GoogleAdSenseSlot[]> {
  const qs = new URLSearchParams();
  if (params?.placement) qs.set("placement", params.placement);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const data = await request<{ results?: GoogleAdSenseSlot[] } | GoogleAdSenseSlot[]>(
    apiUrl(`/ads/slots/${suffix}`),
    { method: "GET" }
  );
  return Array.isArray(data) ? data : (data?.results ?? []);
}

export async function listAdSlotsAdmin(): Promise<GoogleAdSenseSlot[]> {
  const data = await request<{ results?: GoogleAdSenseSlot[] } | GoogleAdSenseSlot[]>(
    apiUrl("/ads/slots/?page_size=200"),
    { method: "GET", auth: true }
  );
  return Array.isArray(data) ? data : (data?.results ?? []);
}

export async function createAdSlotAdmin(payload: Partial<GoogleAdSenseSlotPayload> & { name: string; placement: AdPlacement }): Promise<GoogleAdSenseSlot> {
  return request(apiUrl("/ads/slots/"), { method: "POST", auth: true, json: payload as Record<string, unknown> });
}

export async function updateAdSlotAdmin(id: number, payload: Partial<GoogleAdSenseSlotPayload>): Promise<GoogleAdSenseSlot> {
  return request(apiUrl(`/ads/slots/${id}/`), { method: "PATCH", auth: true, json: payload as Record<string, unknown> });
}

export async function deleteAdSlotAdmin(id: number): Promise<void> {
  await request(apiUrl(`/ads/slots/${id}/`), { method: "DELETE", auth: true });
}

export type AdvertisementPayload =
  | (Partial<Omit<Advertisement, "id" | "image" | "video" | "impression_count" | "click_count" | "created_at" | "updated_at">> & {
    title: string;
    placement: AdPlacement;
    ad_type: AdType;
    status?: AdStatus;
    is_active?: boolean;
    /** Optional upload fields (use FormData) */
    image_file?: File | null;
    video_file?: File | null;
  });

export async function listAdvertisementsAdmin(params?: { page_size?: number }): Promise<Advertisement[]> {
  const qs = new URLSearchParams();
  qs.set("page_size", String(params?.page_size ?? 200));
  const data = await request<{ results?: Advertisement[] } | Advertisement[]>(
    apiUrl(`/ads/advertisements/?${qs.toString()}`),
    { method: "GET", auth: true }
  );
  return Array.isArray(data) ? data : (data?.results ?? []);
}

function advertisementPayloadToFormData(payload: AdvertisementPayload): FormData {
  const fd = new FormData();
  ([
    "title",
    "placement",
    "ad_type",
    "status",
    "link_url",
    "html_snippet",
    "advertiser_name",
    "advertiser_email",
    "advertiser_phone",
    "start_at",
    "end_at",
  ] as const).forEach((k) => {
    const v = (payload as Record<string, unknown>)[k];
    if (v !== undefined && v !== null && String(v).length > 0) {
      fd.append(k, String(v));
    }
  });
  if (typeof payload.is_active === "boolean") fd.append("is_active", String(payload.is_active));
  if (payload.image_file) fd.append("image", payload.image_file);
  if (payload.video_file) fd.append("video", payload.video_file);
  return fd;
}

export async function createAdvertisementAdmin(payload: AdvertisementPayload): Promise<Advertisement> {
  const fd = advertisementPayloadToFormData(payload);
  return request(apiUrl("/ads/advertisements/"), { method: "POST", auth: true, json: fd });
}

export async function updateAdvertisementAdmin(id: number, payload: Partial<AdvertisementPayload>): Promise<Advertisement> {
  const fd = advertisementPayloadToFormData(payload as AdvertisementPayload);
  return request(apiUrl(`/ads/advertisements/${id}/`), { method: "PATCH", auth: true, json: fd });
}

export async function deleteAdvertisementAdmin(id: number): Promise<void> {
  await request(apiUrl(`/ads/advertisements/${id}/`), { method: "DELETE", auth: true });
}

export interface AdvertisementRequest {
  id: number;
  advertiser_name: string;
  advertiser_email: string;
  advertiser_phone?: string;
  company_name?: string;
  placement: AdPlacement;
  ad_type: AdType;
  budget?: string | number | null;
  message?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export async function listAdvertisementRequestsAdmin(params?: { page_size?: number; status?: string }): Promise<AdvertisementRequest[]> {
  const qs = new URLSearchParams();
  qs.set("page_size", String(params?.page_size ?? 200));
  if (params?.status) qs.set("status", params.status);
  const data = await request<{ results?: AdvertisementRequest[] } | AdvertisementRequest[]>(
    apiUrl(`/ads/requests/?${qs.toString()}`),
    { method: "GET", auth: true }
  );
  return Array.isArray(data) ? data : (data?.results ?? []);
}

export async function updateAdvertisementRequestAdmin(
  id: number,
  payload: Partial<Pick<AdvertisementRequest, "status" | "admin_notes">>
): Promise<AdvertisementRequest> {
  return request(apiUrl(`/ads/requests/${id}/`), {
    method: "PATCH",
    auth: true,
    json: payload as Record<string, unknown>,
  });
}

export interface ContactMessagePayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export async function submitContactMessage(payload: ContactMessagePayload): Promise<{ id: number }> {
  return request(apiUrl("/contact/messages/"), {
    method: "POST",
    json: payload as unknown as Record<string, unknown>,
  });
}

/** Build full URL for backend media (e.g. featured_image). */
export function getMediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  const base = getBaseUrl();

  if (path.startsWith("http://") || path.startsWith("https://")) {
    try {
      const u = new URL(path);
      if (u.pathname.startsWith("/media/")) {
        // Rewrite the internal media URL to use our known correct base (proxy or prod API url)
        if (!base) {
          return `${u.pathname}${u.search}${u.hash}`;
        }
        return `${base}${u.pathname}${u.search}${u.hash}`;
      }
    } catch {
      // Ignore parse errors, fall through
    }
    // External images (e.g. Unsplash, Youtube) handled here
    return path;
  }
  
  // Backend often returns relative paths like "/media/..." or "news/..." depending on fields
  const normalized = path.startsWith("/") ? path : `/media/${path}`;
  return base ? `${base}${normalized}` : normalized;
}

export { getBaseUrl };

// ---------- External Cricket Live News (proxied via backend) ----------

export interface CricketNewsItem {
  id?: string | number;
  title?: string;
  headline?: string;
  hline?: string;
  summary?: string;
  intro?: string;
  url?: string;
  link?: string;
  image?: string;
  imageUrl?: string;
  publishedAt?: string;
  pubDate?: string;
  [key: string]: unknown;
}

export interface CricketNewsResponse {
  items?: CricketNewsItem[];
  news?: CricketNewsItem[];
  articles?: CricketNewsItem[];
  // Cricbuzz-style response: storyList: [{ story: { ... } }]
  storyList?: { story?: CricketNewsItem }[];
  [key: string]: unknown;
}

/**
 * Fetch live cricket news from an external provider (RapidAPI or similar),
 * via the Django backend proxy at /api/v1/news/cricket-live/.
 *
 * The exact payload depends on the external API; the backend returns the raw JSON.
 */
export async function getCricketNews(params?: Record<string, string | number | boolean>): Promise<CricketNewsResponse | CricketNewsItem[]> {
  const search = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        search.set(key, String(value));
      }
    });
  }
  const qs = search.toString();
  const url = apiUrl("/news/cricket-live/" + (qs ? `?${qs}` : ""));
  return request<CricketNewsResponse | CricketNewsItem[]>(url, { method: "GET", auth: false });
}

// ---------- External Cricket Live Matches (proxied via backend) ----------

export interface CricketMatchInnings {
  runs?: number;
  wickets?: number;
  overs?: number | string;
}

export interface CricketMatchScore {
  team1Score?: { inngs1?: CricketMatchInnings;[key: string]: unknown };
  team2Score?: { inngs1?: CricketMatchInnings;[key: string]: unknown };
  [key: string]: unknown;
}

export interface CricketMatchInfoTeam {
  teamName?: string;
  teamSName?: string;
  [key: string]: unknown;
}

export interface CricketMatchInfo {
  matchId?: number | string;
  matchDesc?: string;
  matchFormat?: string;
  seriesName?: string;
  team1?: CricketMatchInfoTeam;
  team2?: CricketMatchInfoTeam;
  status?: string;
  state?: string;
  [key: string]: unknown;
}

export interface CricketMatchItem {
  matchInfo?: CricketMatchInfo;
  matchScore?: CricketMatchScore;
  [key: string]: unknown;
}

export interface CricketMatchesResponse {
  // Cricbuzz-style: typeMatches -> seriesMatches -> seriesAdWrapper -> matches[]
  typeMatches?: {
    matchType?: string;
    seriesMatches?: {
      seriesAdWrapper?: {
        seriesId?: number;
        seriesName?: string;
        matches?: CricketMatchItem[];
      };
    }[];
  }[];
  [key: string]: unknown;
}

export async function getCricketMatches(
  params?: Record<string, string | number | boolean>
): Promise<CricketMatchesResponse> {
  const search = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        search.set(key, String(value));
      }
    });
  }
  const qs = search.toString();
  const url = apiUrl("/news/cricket-live-matches/" + (qs ? `?${qs}` : ""));
  return request<CricketMatchesResponse>(url, { method: "GET", auth: false });
}

// ---------- E-paper Editions ----------

export interface EpaperEditionItem {
  id: number;
  publication_date: string;
  title: string;
  pdf_file: string;
  created_at: string;
  updated_at: string;
}

export interface EpaperEditionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: EpaperEditionItem[];
}

export type EpaperEditionPayload = {
  publication_date: string;
  title?: string;
  pdf_file: File;
};

export async function getEpaperEditions(
  params?: Record<string, string | number | boolean>
): Promise<EpaperEditionItem[] | EpaperEditionsResponse> {
  const search = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        search.set(key, String(value));
      }
    });
  }
  const qs = search.toString();
  const url = apiUrl("/epaper/editions/" + (qs ? `?${qs}` : ""));
  return request<EpaperEditionItem[] | EpaperEditionsResponse>(url, { method: "GET", auth: false });
}

export async function getEpaperEdition(id: number): Promise<EpaperEditionItem> {
  const url = apiUrl(`/epaper/editions/${id}/`);
  return request<EpaperEditionItem>(url, { method: "GET", auth: false });
}

export async function createEpaperEdition(payload: EpaperEditionPayload): Promise<EpaperEditionItem> {
  const formData = new FormData();
  formData.append("publication_date", payload.publication_date);
  if (payload.title) {
    formData.append("title", payload.title);
  }
  formData.append("pdf_file", payload.pdf_file);

  const url = apiUrl("/epaper/editions/");
  return request<EpaperEditionItem>(url, { method: "POST", auth: true, json: formData });
}

export async function updateEpaperEdition(
  id: number,
  payload: Partial<EpaperEditionPayload>
): Promise<EpaperEditionItem> {
  const formData = new FormData();
  if (payload.publication_date) {
    formData.append("publication_date", payload.publication_date);
  }
  if (payload.title !== undefined) {
    formData.append("title", payload.title || "");
  }
  if (payload.pdf_file) {
    formData.append("pdf_file", payload.pdf_file);
  }

  const url = apiUrl(`/epaper/editions/${id}/`);
  return request<EpaperEditionItem>(url, { method: "PATCH", auth: true, json: formData });
}

export async function deleteEpaperEdition(id: number): Promise<void> {
  const url = apiUrl(`/epaper/editions/${id}/`);
  return request<void>(url, { method: "DELETE", auth: true });
}

export interface PollOption {
  id: number;
  text: string;
  votes: number;
}

export interface PollData {
  id: number;
  question: string;
  is_active: boolean;
  options: PollOption[];
  created_at: string;
}

