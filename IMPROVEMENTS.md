# News Portal – Full Improvement List

## Summary

- **Frontend:** Several pages and components still use **static data**. This document lists all improvements and what was done to connect the frontend to the API.
- **Backend:** Minor improvements and consistency notes.

---

## Frontend Improvements

### 1. ✅ Navbar – Dynamic from API

- **Before:** `navItems` was fully static (home, gujarat, national, business, sports, etc.).
- **After:** Navbar should be driven by **sections** from `GET /api/v1/news/sections/` so new sections appear automatically. Gujarat submenu can stay as static cities or be driven by child sections if the backend supports parent/child sections.
- **Status:** Implemented – Navbar uses `useSections()` and builds links from section slugs; fallback for translation keys.

### 2. ✅ Footer – Categories from API

- **Before:** Footer "Categories" links were hardcoded (gujarat, national, business, sports, etc.).
- **After:** Use sections from API for the categories column so it stays in sync with the navbar.
- **Status:** Implemented – Footer fetches sections and renders category links from API.

### 3. ✅ Sports Page – Connect to API

- **Before:** `sportCategories`, `liveMatches`, and `sportsNews` were fully static.
- **After:** Use `getArticlesBySection('sports')` for news; use `getCategories()` for sport filters (or keep a small static list for sport types if categories don’t map 1:1). Live matches can remain static until a dedicated backend exists.
- **Status:** Implemented – Sports page uses API for articles; category filter uses API categories; live matches remain static placeholder.

### 4. ✅ International Page – Connect to API

- **Before:** `regions` and `internationalNews` were static.
- **After:** Use `getArticlesBySection('international')` for articles; region filter can stay UI-only or map to tags/categories later.
- **Status:** Implemented – International page uses API for articles.

### 5. ✅ Business Page – Connect to API

- **Before:** `marketData` and `businessNews` were static.
- **After:** Use `getArticlesBySection('business')` for news. Market ticker (SENSEX, NIFTY, etc.) can stay static until a market-data API exists.
- **Status:** Implemented – Business page uses API for articles; market data remains static.

### 6. ✅ Entertainment Page – Connect to API

- **Before:** `categories` and `entertainmentNews` were static.
- **After:** Use `getArticlesBySection('entertainment')` and optionally `getCategories()` for filters.
- **Status:** Implemented – Entertainment page uses API for articles; category filter uses API categories.

### 7. ✅ Technology Page – Connect to API

- **Before:** `techCategories` and `techNews` were static.
- **After:** Use `getArticlesBySection('technology')` and optionally categories for filters.
- **Status:** Implemented – Technology page uses API for articles; category filter uses API categories.

### 8. ✅ National Page – “Live Updates” Sidebar

- **Before:** `timelineNews` was static (fake times and headlines).
- **After:** Replace with latest articles from the national section (e.g. `getArticlesBySection('national')` limited to 4–5, ordered by date) and display as “Latest Updates” or “Live Updates”.
- **Status:** Implemented – National sidebar uses API-driven latest national articles instead of static timeline.

### 9. ✅ Reels Section on Home – Link to Article

- **Before:** Reel cards linked only to `/reels` (listing page).
- **After:** Link to `/article/${reel.slug}` so each reel opens its article/detail page.
- **Status:** Implemented – ReelsSection links to article detail.

### 10. ✅ Ads API URL

- **Before:** `getAdvertisements` could build a URL without a trailing slash; some backends expect `/ads/advertisements/`.
- **After:** Use path `/ads/advertisements/` and append query string for placement/ad_type.
- **Status:** Implemented in `api.ts`.

### 11. Contact Page – Form vs Contact Info

- **Form:** Already uses API (`useSubmitContactMessage` → `POST /api/v1/contact/messages/`). ✅
- **Contact info:** Editor name, phone, email, address, social links, working hours are static. For a full improvement, add a **Site Settings** or **Contact Info** model in the backend and an endpoint (e.g. `GET /api/v1/settings/contact/`) and render from API. **Status:** Not implemented; optional backend + frontend task.

### 12. Videos Page

- **Before:** Already uses `getArticles({ content_type: 'VIDEO' })`. ✅
- **Optional:** `videoCategories` is static; can be replaced by API categories if you want filter by category. **Status:** Left as-is; can reuse same pattern as Sports/Entertainment if needed.

### 13. Trending, Latest, Article Detail, Breaking Ticker

- Already use API (getMostRead, getArticles, getArticleBySlug, getBreakingNews, etc.). ✅

### 14. CityNews Page

- Uses `cityData` static map for city slug → section; then fetches articles via `getArticlesBySection`. City list is intentionally static (known cities). ✅ Acceptable as-is.

### 15. LanguageContext / Translations

- Nav keys (home, gujarat, national, etc.) are in translations; when navbar is driven by sections, section names can come from API (`name_en`, `name_gu`, `name_hi`) with fallback to translation key. Implemented in Navbar/Footer. ✅

---

## Backend Improvements (Recommendations)

1. **API base URL:** Ensure frontend and backend agree on base URL (e.g. `http://localhost:8000` for dev) and CORS allows the frontend origin.
2. **Sections order:** Ensure `GET /api/v1/news/sections/` returns sections in a consistent order (e.g. `order` field) so navbar/footer order is predictable.
3. **Health check:** `GET /api/v1/health/` is used by the frontend; keep it lightweight.
4. **Ads:** Placements (TOP, SIDEBAR_LEFT, SIDEBAR_RIGHT, etc.) are already in the backend; frontend uses the same placement values for filtering.
5. **Optional – Site/Contact settings:** Add a simple settings endpoint for contact info, social links, and working hours so the Contact page can be fully dynamic.

---

## Files Touched (Implementation)

- `kanam_express copy/src/lib/api.ts` – Fixed ads URL (trailing slash + query).
- `kanam_express copy/src/components/layout/Navbar.tsx` – Dynamic nav from sections API.
- `kanam_express copy/src/components/layout/Footer.tsx` – Categories from sections API.
- `kanam_express copy/src/components/sections/ReelsSection.tsx` – Link to article by slug.
- `kanam_express copy/src/pages/National.tsx` – Live Updates sidebar from API.
- `kanam_express copy/src/pages/Sports.tsx` – Articles and category filter from API.
- `kanam_express copy/src/pages/International.tsx` – Articles from API.
- `kanam_express copy/src/pages/Business.tsx` – Articles from API.
- `kanam_express copy/src/pages/Entertainment.tsx` – Articles and categories from API.
- `kanam_express copy/src/pages/Technology.tsx` – Articles and categories from API.

---

## How to Verify

1. Start backend: `cd backend && python manage.py runserver` (with venv activated).
2. Start frontend: `cd "kanam_express copy" && npm run dev` (or bun).
3. Ensure backend has sections (e.g. national, international, business, sports, entertainment, technology, gujarat) and at least a few published articles per section.
4. Check Home, Navbar, Footer, Sports, International, Business, Entertainment, Technology, National (sidebar), and Reels section links; all should show API data where implemented.
