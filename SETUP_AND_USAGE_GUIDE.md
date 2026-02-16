# News Portal - Setup & Testing Guide

## Quick Start - Seed Sample Data

After setting up the project, run the following command to populate the database with sample data:

```bash
cd backend
python manage.py seed_data
```

This command will:
- ✓ Create an admin user (username: `admin`, password: `admin123`)
- ✓ Create sample articles for search, trending, and latest news sections
- ✓ Create sections, categories, and tags
- ✓ Create/configure SiteSettings for About and Contact pages

## Features & How to Use Them

### 1. Search Functionality ✓

**How to use:**
- Click the search icon in the header (top bar)
- Type a search query (e.g., "Cricket", "Politics", "Gujarat")
- Press Enter or click the search area
- Results will be displayed on the Search page

**What it searches:**
- Article titles (all languages)
- Summaries (all languages)
- Content (all languages)

**Note:** Search results depend on having published articles in the database. Run `seed_data` command to create sample articles.

### 2. Latest News Page ✓

**URL:** `/latest`

**How it works:**
- Displays all published news articles ordered by publication date
- Filter by category using the category buttons
- Search within latest news using the search box

**Display requirements:**
- Articles must have `status = PUBLISHED` 
- Must have a `published_at` date
- Run `seed_data` command to create sample articles

### 3. Trending News Page ✓

**URL:** `/trending`

**How it works:**
- Displays articles sorted by view count (most read first)
- Fallback options: editor-curated "top news" → latest articles
- Ranked display with view counts

**Display requirements:**
- Articles must be published
- View counts accumulate as users read articles
- Articles marked as `is_top=True` will appear as trending
- Run `seed_data` command to create sample articles with view counts

### 4. About Page (Fully Dynamic) ✓

**URL:** `/about`

**Features:**
- All content is pulled from SiteSettings in the backend
- Editor name, bio, mission, tagline are all customizable
- Supports 3 languages: English, Gujarati, Hindi

**How to edit:**
1. Go to Django Admin: `/admin/`
2. Login with credentials created by `seed_data` command
3. Navigate to **Site settings → Site settings**
4. Edit the following sections:
   - **Brand:** Tagline in multiple languages
   - **About page:** Title and description in multiple languages
   - **Editor:** Name, title, and biography
   - **Mission & publication:** Mission statement and publication description

### 5. Contact Page (Fully Dynamic) ✓

**URL:** `/contact`

**Features:**
- All contact information pulled from SiteSettings
- Dynamic editor information
- Editable phone numbers, email, address
- Social media links (Facebook, Twitter, Instagram, YouTube)

**How to edit:**
1. Go to Django Admin: `/admin/`
2. Navigate to **Site settings → Site settings**
3. Edit the **Contact** section:
   - Contact phone (primary & secondary)
   - Contact email
   - Contact address
4. Edit the **Social** section:
   - Facebook URL
   - Twitter URL
   - Instagram URL
   - YouTube URL

## Admin Dashboard Access

### Django Admin Panel
- **URL:** `http://localhost:8000/admin/`
- **Default credentials:** 
  - Username: `admin`
  - Password: `admin123`

### What you can manage in Admin:
1. **Site Settings** - Edit About, Contact, tagline, editor info
2. **Articles** - Create, edit, publish articles
3. **Sections** - Manage news sections (National, Gujarat, Sports, etc.)
4. **Categories** - Create news categories
5. **Tags** - Create and manage tags
6. **Users** - Manage admin users and permissions

## Testing Checklist

After running `seed_data`, test the following:

- [ ] **Search:**
  - Click search icon in header
  - Search for "Cricket" or "Politics"
  - Verify results appear

- [ ] **Latest News:**
  - Navigate to `/latest` or click "Latest" in navigation
  - Verify articles are displayed
  - Try filtering by category
  - Try searching within latest news

- [ ] **Trending News:**
  - Navigate to `/trending` or click "Trending" in navigation
  - Verify articles are displayed with rankings
  - Verify view counts are shown

- [ ] **About Page:**
  - Navigate to `/about`
  - Verify editor name, bio, mission are displayed
  - Change language to Gujarati and Hindi to verify translations

- [ ] **Contact Page:**
  - Navigate to `/contact`
  - Verify contact phone numbers, email, address are correct
  - Verify social media links work
  - Try submitting the contact form

## Creating More Content

### Via Django Admin:
1. Go to `/admin/`
2. Click **Articles** under News
3. Click **Add article**
4. Fill in:
   - Title (English, Gujarati, Hindi)
   - Slug (auto-generated from title)
   - Content
   - Section & Category
   - Status: **PUBLISHED** (important!)
   - Publish date
5. Click **Save**

### Via API (Advanced):
```bash
curl -X POST http://localhost:8000/api/v1/news/articles/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title_en": "Breaking News Title",
    "content_en": "Article content...",
    "section": 1,
    "status": "PUBLISHED"
  }'
```

## Troubleshooting

### No articles showing in search, trending, or latest news:
1. Run: `python manage.py seed_data`
2. Check Django admin to verify articles exist and have `status = PUBLISHED`
3. Restart the backend server

### About/Contact pages showing default values:
1. Go to `/admin/site_settings/sitesettings/`
2. Edit the settings and save
3. Refresh the page to see changes

### Search not returning results:
1. Verify articles exist in database
2. Check that articles have `status = PUBLISHED`
3. Verify search terms match article content
4. Check browser console for API errors

## API Endpoints Reference

| Feature | Endpoint | Method |
|---------|----------|--------|
| List Articles | `/api/v1/news/articles/` | GET |
| Search Articles | `/api/v1/news/articles/?search=query` | GET |
| Trending/Top News | `/api/v1/news/articles/top/` | GET |
| Most Read | `/api/v1/news/articles/most-read/` | GET |
| Site Settings | `/api/v1/site/settings/` | GET/PATCH |
| Contact Message | `/api/v1/contact/messages/` | POST |

## Notes

- Changes made in Django admin are reflected in the frontend immediately
- All pages support multiple languages (English, Gujarati, Hindi)
- Articles need to be marked as PUBLISHED to appear on the frontend
- View counts increment automatically as users view articles
- The trending page sorts by view count and marked "top" articles
