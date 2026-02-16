# News Portal – API Login, Project Overview & Adding Data

This guide explains how to **log in via the API**, how the **project and backend** work, and how to **use the backend and add data**.

---

## 1. How to log in using the API

Authentication uses **JWT (JSON Web Tokens)**. You get an **access token** and a **refresh token** from the backend, then send the access token with every protected request.

### Login endpoint

- **URL:** `POST http://localhost:8000/api/v1/auth/token/`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
    "username": "your_username",
    "password": "your_password"
  }
  ```

**Response (200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

- **`access`** – use this in the `Authorization` header for all authenticated requests.
- **`refresh`** – use it to get a new access token when it expires (see below).

### Using the token in requests

For any endpoint that requires authentication, add:

- **Header name:** `Authorization`
- **Header value:** `Bearer <your_access_token>`

Example (list your profile):

```http
GET http://localhost:8000/api/v1/auth/me/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### Refresh token (when access token expires)

- **URL:** `POST http://localhost:8000/api/v1/auth/token/refresh/`
- **Body:**
  ```json
  { "refresh": "your_refresh_token_here" }
  ```

**Response:** new `access` (and optionally `refresh`) token.

### Other auth-related endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register/` | Register new user (username, email, password, etc.) |
| GET  | `/api/v1/auth/me/`       | Get/update current user (requires token) |
| POST | `/api/v1/auth/logout/`   | Blacklist refresh token (requires token) |
| POST | `/api/v1/auth/password-reset/`      | Request password reset email |
| POST | `/api/v1/auth/password-reset/confirm/` | Confirm reset with token from email |

### Example: login with cURL

```bash
# 1) Login and save tokens
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"your_username\",\"password\":\"your_password\"}"

# 2) Use access token (replace YOUR_ACCESS_TOKEN with the "access" value from step 1)
curl -X GET http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Example: login with JavaScript (fetch)

```javascript
const response = await fetch('http://localhost:8000/api/v1/auth/token/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'your_username', password: 'your_password' }),
});
const { access, refresh } = await response.json();
// Store access/refresh (e.g. in memory or localStorage), then:
const meResponse = await fetch('http://localhost:8000/api/v1/auth/me/', {
  headers: { 'Authorization': `Bearer ${access}` },
});
```

---

## 2. Project overview

- **Backend:** Django 5 + Django REST Framework + PostgreSQL.
- **Auth:** JWT via `djangorestframework-simplejwt`.
- **Roles:** Super Admin, Editor/Reporter, User (see `backend/ROLES_AND_PERMISSIONS.md`).

### Main apps and URLs (all under `/api/v1/`)

| Area        | Base path / router        | What it does |
|------------|---------------------------|--------------|
| Auth       | `auth/` (see above)       | Register, login (token), me, logout, password reset |
| Users      | `users/`                  | Super-admin user management (list/create/update/delete users) |
| News       | `news/sections/`, `news/categories/`, `news/tags/`, `news/articles/`, `news/media/`, `news/comments/`, `news/likes/` | Sections, categories, tags, articles, media, comments, likes |
| Ads        | `ads/slots/`, `ads/advertisements/`, `ads/requests/` | Ad slots, ads, ad requests |
| Contact    | `contact/messages/`       | Contact form messages |
| Analytics  | `analytics/views/`        | News view tracking |
| Docs       | `docs/`                   | Swagger UI for full API schema |
| Health     | `health/`                 | Simple health check |

### Running the backend

1. From project root: `venv\Scripts\activate` then `cd backend` (or use `..\venv\Scripts\python.exe` from `backend`).
2. Ensure PostgreSQL is running and `.env` (or env vars) has correct `DATABASE_*` and `SECRET_KEY`.
3. Run: `python manage.py runserver`  
   Backend: **http://localhost:8000**

### API documentation (Swagger)

- Open **http://localhost:8000/api/docs/** in a browser to see all endpoints, request/response shapes, and try them out.  
- Schema only: **http://localhost:8000/api/schema/**

---

## 3. How to use the backend and add data

### Option A: Django Admin (easiest for bulk/manual data)

1. Create a superuser: `python manage.py createsuperuser`
2. Open **http://localhost:8000/admin/** and log in with that user.
3. Add/edit **Users**, **Sections**, **Categories**, **Tags**, **News articles**, **Ads**, **Contact messages**, etc., from the admin UI.

### Option B: API (for apps, scripts, or a frontend)

You need a user that has the right role (e.g. **Editor** or **Super Admin** for creating news). Get a JWT as in section 1, then call the APIs below with `Authorization: Bearer <access_token>`.

#### 1) Get IDs you need (sections, categories, tags)

- **Sections:** `GET /api/news/sections/` (use `slug` or `id` in article payload).
- **Categories:** `GET /api/news/categories/`.
- **Tags:** `GET /api/news/tags/` or create via `POST /api/news/tags/` with `name` (and optionally `slug`).

#### 2) Create a news article

- **URL:** `POST /api/news/articles/`
- **Auth:** Required (Editor or Super Admin).
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <access_token>`

**Example body (minimal):**
```json
{
  "title_en": "My first article",
  "title_hi": "",
  "title_gu": "",
  "slug": "my-first-article",
  "summary_en": "Short summary.",
  "summary_hi": "",
  "summary_gu": "",
  "content_en": "Full article content here.",
  "content_hi": "",
  "content_gu": "",
  "section": 1,
  "category": null,
  "tags": [],
  "status": "DRAFT",
  "content_type": "ARTICLE",
  "primary_language": "EN",
  "is_breaking": false,
  "is_top": false,
  "is_featured": false
}
```

- **section** – ID from `GET /api/news/sections/`.
- **category** – ID or `null`.
- **tags** – list of tag IDs, e.g. `[1, 2]`.
- **status** – `"DRAFT"`, `"PUBLISHED"`, or `"ARCHIVED"`. If you set `"PUBLISHED"`, the server sets `published_at` automatically.
- **content_type** – `"ARTICLE"`, `"REEL"`, `"YOUTUBE"`, `"VIDEO"`.
- **primary_language** – `"EN"`, `"HI"`, or `"GU"`.

**Optional:** `featured_image` – use multipart/form-data and send the image file instead of JSON if you need to upload an image.

**Response:** 201 with the created article (including `id`, `slug`, etc.).

#### 3) Add media to an article (images, video, YouTube)

- **URL:** `POST /api/news/media/`
- **Auth:** Editor or Super Admin.
- Use **multipart/form-data** (or the structure required by your client) with:
  - `article` – article ID
  - `media_type` – `"IMAGE"`, `"VIDEO"`, `"REEL"`, `"YOUTUBE"`
  - `file` or `image` – for uploads
  - `youtube_url` – for YouTube
  - optional: `caption`, `order`, `thumbnail`

#### 4) Create sections / categories / tags (if you manage them via API)

- **Section:** `POST /api/news/sections/` – e.g. `{"name_en": "Sports", "slug": "sports", "order": 1}`.
- **Category:** `POST /api/news/categories/` – e.g. `{"name_en": "Cricket", "slug": "cricket"}`.
- **Tag:** `POST /api/news/tags/` – e.g. `{"name": "Elections", "slug": "elections"}`.

Permissions may restrict these to admins; check `/api/docs/` or your roles.

#### 5) Advertisements and contact

- **Ads:** Create via `POST /api/ads/advertisements/` (admin); ad requests from public via `POST /api/ads/requests/`.
- **Active ads logic:** The backend exposes only **currently active** ads on public endpoints. An ad is considered active when:
  - `is_active = true`
  - `status = "ACTIVE"`
  - `start_at` is not set or is in the past
  - `end_at` is not set or is in the future  
  This logic is centralized in the `Advertisement.is_currently_active()` helper and the `Advertisement.objects.currently_active()` queryset.

- **Ad HTML snippets:** For `ad_type="HTML"`, the `html_snippet` field is treated as **trusted admin input**. Only authenticated staff (Editor / Super Admin) can create or edit these ads via the API or Django Admin; the backend does not sanitize this HTML. If you ever expose ad-HTML submission to the public, you **must** add a sanitizer or external review step.

- **Contact:** Public form submits to `POST /api/contact/messages/`; admins list/read at `GET /api/contact/messages/`.

#### 6) Analytics and view counts

- Each article view is tracked in `analytics.NewsView` when `/api/news/articles/{slug}/track_view/` is called.
- The `NewsArticle.view_count` field is a **denormalized counter** used for fast queries (e.g. most-read lists) and is incremented on each tracked view.
- If you ever suspect drift between `view_count` and the underlying analytics table (for example after manual data changes), you can recompute counts from analytics:
  ```bash
  cd backend
  python manage.py recompute_view_counts  # or add --dry-run to preview changes
  ```

#### 7) Spam protection and rate limiting

- **Global rate limiting:** The API uses DRF's `AnonRateThrottle` and `UserRateThrottle` so that anonymous users (by IP) and authenticated users are limited globally:
  - `anon`: `100/hour`
  - `user`: `1000/hour`
- **Scoped throttling for sensitive forms:**
  - Contact form (`/api/contact/messages/`) uses the `contact` throttle scope (default: `5/minute`) via `ScopedRateThrottle` in `ContactMessageViewSet`.
  - Public ad requests (`/api/ads/requests/`) use the `ads_requests` throttle scope (default: `10/hour`) in `AdvertisementRequestViewSet`.
- These throttles are IP-based for anonymous users and token-based for authenticated users, which helps reduce automated spam.
- **Optional CAPTCHA:** If you need even stricter protection, you can place Google reCAPTCHA or hCaptcha on the frontend contact and ad request forms and have the backend verify the token before accepting the request.

#### 8) Caching and performance

- Several high-traffic, read-heavy endpoints are cached at the view level:
  - Sections, categories, tags (list/retrieve, plus `tags/trending/`).
  - News articles (list/retrieve and custom lists like `breaking`, `top`, `most-read`, `related`).
  - Analytics views list (`/api/v1/analytics/views/`).
- In production you should configure a shared cache backend such as **Redis** so multiple app servers benefit from the same cache and invalidation:
  - Set `CACHES` in `backend/backend/settings.py` to use `django_redis.cache.RedisCache` or your preferred backend.
  - In local development, Django's default local-memory cache is sufficient.

### Option C: Create data via Django shell

```bash
cd backend
..\venv\Scripts\activate
python manage.py shell
```

Then create users, sections, categories, tags, and articles using Django ORM (see `news/models.py`, `users/models.py`). Useful for one-off or seed data.

---

## 4. Quick reference – main API base URLs

Assume backend at **http://localhost:8000**:

- Login: `POST /api/v1/auth/token/`
- Refresh: `POST /api/v1/auth/token/refresh/`
- Current user: `GET /api/v1/auth/me/`
- Register: `POST /api/v1/auth/register/`
- News articles: `GET/POST /api/v1/news/articles/`, `GET/PUT/PATCH/DELETE /api/v1/news/articles/{slug}/`
- Sections: `GET /api/v1/news/sections/`
- Categories: `GET /api/v1/news/categories/`
- Tags: `GET/POST /api/v1/news/tags/`
- Media: `POST /api/v1/news/media/`, etc.
- Swagger UI: **http://localhost:8000/api/v1/docs/**

For exact request/response shapes and required fields, use **http://localhost:8000/api/v1/docs/** or the schema at `/api/v1/schema/`.
