# Roles and Permissions – News Portal Backend

## Roles

| Role           | Description |
|---------------|-------------|
| **SUPER_ADMIN** | Full access: manage users, all content, ads, contact messages, analytics. |
| **EDITOR**      | Full editorial control over content (create/edit/delete news, ads, contact), including publishing/archiving news. Cannot manage users. |
| **REPORTER**    | Can create and edit **draft** news and media, but **cannot publish** articles (status cannot be set to `PUBLISHED` in the API). Cannot manage users. |
| **USER**        | Default for signups. Read content, like, comment, submit contact/ad requests. |

---

## How to Create Editors and Reporters

### Option 1: Django Admin (easiest)

1. Log in at **http://127.0.0.1:8000/admin/** with a **Super Admin** account.
2. Go to **Users** → **Add user** (or open an existing user).
3. Set **Username**, **Password**, and **Email** (and name if you want).
4. In **Role & Profile**, set **Role** to **Editor** or **Reporter**.
5. If this person should log in to Django Admin, check **Staff status**.
6. Save.

Only users with **Staff status** can use the Django Admin site.

### Option 2: API (Super Admin only)

1. Get a JWT token for a Super Admin user:
   ```http
   POST /api/auth/token/
   { "username": "superadmin", "password": "yourpassword" }
   ```
2. Create a user with a role:
   ```http
   POST /api/users/
   Authorization: Bearer <access_token>
   Content-Type: application/json

   {
     "username": "editor1",
     "email": "editor@example.com",
     "password": "SecurePass123",
     "first_name": "Jane",
     "last_name": "Editor",
     "role": "EDITOR",
     "is_staff": true,
     "is_active": true
   }
   ```
   Use `"role": "REPORTER"` for a reporter, or `"role": "USER"` for a normal user.
3. To change an existing user’s role:
   ```http
   PATCH /api/users/<id>/
   Authorization: Bearer <access_token>

   { "role": "EDITOR", "is_staff": true }
   ```
   Omit `password` to leave it unchanged.

---

## Permission Summary (by area)

This table shows which roles can access the **main API areas**.  
Implementation is enforced via `backend/common/permissions.py` and the various viewsets
(`IsSuperAdmin`, `IsEditorOrSuperAdmin`, `IsOwnerOrPrivileged`).

| Area / Action                              | Anonymous | USER | REPORTER | EDITOR | SUPER_ADMIN |
|-------------------------------------------|-----------|------|----------|--------|-------------|
| Auth: register/login/password reset       | ✅ (public endpoints) | ✅ | ✅ | ✅ | ✅ |
| Auth: `/api/auth/me/`                     | ❌       | ✅  | ✅      | ✅    | ✅         |
| Users admin (`/api/users/`)               | ❌       | ❌  | ❌      | ❌    | ✅ (IsSuperAdmin) |
| News: list/retrieve articles/sections     | ✅       | ✅  | ✅      | ✅    | ✅         |
| News: create/edit articles/media          | ❌       | ❌  | ✅ (drafts only) | ✅ (full) | ✅ (full) |
| News: comments (create/list own)          | ❌       | ✅  | ✅      | ✅    | ✅         |
| News: likes (toggle, list own)            | ❌       | ✅  | ✅      | ✅    | ✅         |
| Ads: public ad requests (`ads/requests/`) | ✅ (create only, throttled) | ✅ | ✅ | ✅ | ✅ |
| Ads: manage ads/slots/requests            | ❌       | ❌  | ✅      | ✅    | ✅         |
| Contact: public contact messages (create) | ✅ (throttled) | ✅ | ✅ | ✅ | ✅ |
| Contact: list/mark read                   | ❌       | ❌  | ✅      | ✅    | ✅         |
| Analytics (`/api/analytics/views/`)       | ❌       | ❌  | ✅      | ✅    | ✅         |
| API docs (`/api/docs/`)                   | ✅       | ✅  | ✅      | ✅    | ✅         |

### Reporter vs Editor

- **Reporter**:
  - Can **create and edit** news articles and media via `/api/news/articles/` and `/api/news/media/`.
  - Is **blocked by the API** from setting `status="PUBLISHED"` (both on create and on update); this is enforced in `NewsArticleViewSet.perform_create` and `perform_update`.
  - Typical workflow: create and refine drafts, then hand over to an Editor or Super Admin to publish.
- **Editor**:
  - Same capabilities as Reporter, **plus** full control over the `status` field (can publish, archive, etc.).
  - Can also manage ads, contact messages, and view analytics, but cannot manage users.

### Notes

- **User management** (`/api/users/`) is always restricted to **SUPER_ADMIN** via `IsSuperAdmin`.
- Public registration always creates users with role **USER**. Only Super Admins can assign EDITOR or REPORTER (via Admin or API).
