import {
  getArticles,
  getArticleBySlug,
  getRelatedArticles,
  getMostRead,
  getSections,
  getDistricts,
  getCategories,
  getBreakingNews,
  getSiteSettings,
  type ArticlesResponse,
  type ArticleListItem,
  type SectionItem,
  type DistrictItem,
  type CategoryItem,
  type SiteSettingsData,
  submitContactMessage,
  type ContactMessagePayload,
} from "@/lib/api";
import { useApiQuery, useApiMutation } from "./useApi";

// Articles

export function useArticles(params?: Parameters<typeof getArticles>[0]) {
  return useApiQuery<ArticlesResponse, ["articles", typeof params]>(
    ["articles", params],
    () => getArticles(params),
    { keepPreviousData: true }
  );
}

export function useArticle(slug: string | undefined) {
  return useApiQuery<ArticleListItem | null, ["article", string | undefined]>(
    ["article", slug],
    () => (slug ? getArticleBySlug(slug) : Promise.resolve(null)),
    { enabled: Boolean(slug) }
  );
}

export function useRelatedArticles(slug: string | undefined) {
  return useApiQuery<ArticleListItem[], ["article", string | undefined, "related"]>(
    ["article", slug, "related"],
    () => (slug ? getRelatedArticles(slug) : Promise.resolve([])),
    { enabled: Boolean(slug) }
  );
}

export function useMostRead(limit = 20, days = 7) {
  return useApiQuery<ArticleListItem[], ["most-read", number, number]>(
    ["most-read", limit, days],
    () => getMostRead({ limit, days })
  );
}

export function useBreakingNews() {
  return useApiQuery<ArticleListItem[], ["breaking"]>(
    ["breaking"],
    () => getBreakingNews()
  );
}

// Taxonomy / metadata

export function useSections() {
  return useApiQuery<SectionItem[], ["sections"]>(
    ["sections"],
    () => getSections()
  );
}

export function useDistricts(sectionId?: number) {
  return useApiQuery<DistrictItem[], ["districts", number | undefined]>(
    ["districts", sectionId],
    () => getDistricts(sectionId != null ? { section: sectionId, is_active: true } : undefined),
    { enabled: sectionId != null }
  );
}

export function useCategories() {
  return useApiQuery<CategoryItem[], ["categories"]>(
    ["categories"],
    () => getCategories()
  );
}

// Site settings (About, etc.)

export function useSiteSettings() {
  return useApiQuery<SiteSettingsData, ["site-settings"]>(
    ["site-settings"],
    () => getSiteSettings()
  );
}

// Mutations

export function useSubmitContactMessage() {
  return useApiMutation<{ id: number }, ContactMessagePayload>(submitContactMessage);
}

