# Reels App Setup Checklist

This file contains the next steps to activate the Reels app in your Django project.

## What Was Created ✅

A complete Django app for managing reels and videos with:
- ✅ Database models (Reel, ReelCategory, ReelTag)
- ✅ Django admin panel with advanced features
- ✅ REST API endpoints
- ✅ Multilingual support (EN, HI, GU)
- ✅ Approval workflow
- ✅ Permissions system
- ✅ Admin actions for bulk operations
- ✅ Comprehensive serializers
- ✅ Unit tests
- ✅ Initial migration file

## Next Steps (Required)

### 1. Apply Database Migrations
```powershell
cd D:\News\News_Portal_1\backend
python manage.py migrate reels
```

This will create the database tables for:
- `reels_reel` - Main reel/video table
- `reels_reelcategory` - Categories table
- `reels_reeltag` - Tags table

### 2. Access Django Admin
1. Start your development server
2. Go to `http://localhost:8000/admin/`
3. Login with admin credentials
4. Navigate to **Reels & Videos** section

### 3. Create Initial Data (Optional)
In Django admin, create:
- At least 2-3 Reel Categories (Entertainment, News, Sports, etc.)
- At least 5-10 Reel Tags (Viral, Breaking, Live, etc.)

### 4. Test API Endpoints
```bash
# List reels
curl http://localhost:8000/api/reels-new/reels/

# List categories
curl http://localhost:8000/api/reels-new/categories/

# List tags
curl http://localhost:8000/api/reels-new/tags/
```

## File Structure Created

```
backend/reels/
├── __init__.py
├── admin.py              # Admin panel configuration
├── apps.py               # App configuration
├── models.py             # Database models (Reel, ReelCategory, ReelTag)
├── serializers.py        # DRF serializers
├── views.py              # API viewsets
├── urls.py               # URL routing
├── tests.py              # Unit tests
├── README.md             # Comprehensive documentation
├── migrations/
│   ├── __init__.py
│   └── 0001_initial.py   # Initial migration
```

## Admin Panel Features

### Reel Admin Interface
Located at: `http://localhost:8000/admin/reels/reel/`

**Features:**
- 📁 Organized fieldsets for content, media, publishing, approval, visibility
- 🔍 Advanced search across all languages
- 🏷️ Multiple filters (status, approval, language, date, author)
- 🎨 Color-coded status badges
- ⭐ Visual indicators for featured/trending
- 🎬 Video preview/link
- 🖼️ Thumbnail preview in admin
- ⚡ Bulk actions (Publish, Draft, Feature, Approve)

### Category Admin
Located at: `http://localhost:8000/admin/reels/reelcategory/`

### Tag Admin
Located at: `http://localhost:8000/admin/reels/reeltag/`

## Configuration Changes Made

### 1. settings.py
Added `'reels'` to `INSTALLED_APPS`:
```python
INSTALLED_APPS = [
    ...
    'reels',  # ← Added
]
```

### 2. api_urls.py
Added imports and router registrations:
```python
from reels.views import ReelViewSet, ReelCategoryViewSet, ReelTagViewSet

router.register(r"reels-new/reels", ReelViewSet, basename="reels-new")
router.register(r"reels-new/categories", ReelCategoryViewSet, basename="reels-categories")
router.register(r"reels-new/tags", ReelTagViewSet, basename="reels-tags")
```

## API Endpoints Available

### After migrations:

```
GET    /api/reels-new/reels/                    # List all reels
POST   /api/reels-new/reels/                    # Create reel (auth required)
GET    /api/reels-new/reels/{slug}/             # Get reel details
PATCH  /api/reels-new/reels/{slug}/             # Update reel (auth required)
DELETE /api/reels-new/reels/{slug}/             # Delete reel (auth required)
POST   /api/reels-new/reels/trending/           # Get trending reels
POST   /api/reels-new/reels/featured/           # Get featured reels
POST   /api/reels-new/reels/my_reels/           # Get user's reels (auth required)
POST   /api/reels-new/reels/{slug}/approve/     # Approve reel (admin only)
POST   /api/reels-new/reels/{slug}/publish/     # Publish reel (admin only)
POST   /api/reels-new/reels/{slug}/like/        # Like reel (auth required)
POST   /api/reels-new/reels/{slug}/share/       # Share reel
POST   /api/reels-new/reels/{slug}/increment_view/ # Increment views
GET    /api/reels-new/reels/statistics/         # Get statistics (admin only)

GET    /api/reels-new/categories/               # List categories
GET    /api/reels-new/tags/                     # List tags
```

## Database Schema

### reels_reel table
- id (BigAutoField, Primary Key)
- title_en, title_hi, title_gu (CharField, 255)
- description_en, description_hi, description_gu (TextField)
- slug (SlugField, unique)
- video (FileField)
- thumbnail (ImageField)
- duration (PositiveIntegerField)
- author_id (ForeignKey to User)
- status (CharField: draft, published, archived)
- is_featured (Boolean)
- is_trending (Boolean)
- is_approved (Boolean)
- approved_by_id (ForeignKey to User, nullable)
- approved_at (DateTimeField, nullable)
- created_at, updated_at, published_at (DateTimeField)
- view_count, like_count, share_count (PositiveIntegerField)
- primary_language (CharField: en, hi, gu)

### Indexes
- (status, published_at)
- (is_approved, status)
- (is_featured, is_trending)
- (created_at)
- (author_id, status)

## Common Tasks

### Upload a Reel
1. Go to `/admin/reels/reel/` → Add Reel
2. Fill in multilingual titles and descriptions
3. Upload video file
4. (Optional) Upload custom thumbnail
5. Set primary language and auto-generate slug
6. Save as Draft

### Approve a Reel
1. Go to `/admin/reels/reel/`
2. Select reel(s)
3. Click "Approve reels" action
4. Confirm

### Publish a Reel
1. Ensure reel is approved
2. Click "Mark selected as published" action
3. Or use API: `POST /api/reels-new/reels/{slug}/publish/`

### Make it Featured
1. Go to `/admin/reels/reel/`
2. Select reel
3. Click "Mark as featured" action
4. Or enable "Featured" checkbox in edit form

## Troubleshooting

### Issue: Migration fails
```bash
# Check migration status
python manage.py showmigrations reels

# Try again
python manage.py migrate reels
```

### Issue: Admin page not showing
- Verify app is in INSTALLED_APPS (✓ Done)
- Clear Django cache: Restart development server
- Check console for import errors

### Issue: File uploads fail
- Verify `MEDIA_ROOT` is set in settings.py
- Create `/media` directory if missing
- Check file permissions on media directory

### Issue: API returns 404
- Verify routes are in api_urls.py (✓ Done)
- Check router is included in urlpatterns (✓ Done)
- Restart development server

## Admin Features Demo

### Approve & Publish Workflow
1. User uploads reel (status: DRAFT)
2. Admin goes to admin panel
3. Admin selects reel → "Approve reels" action
4. Admin selects reel → "Mark selected as published" action
5. Reel now visible in: `/api/reels-new/reels/` and `/api/reels-new/reels/featured/`

### Multilingual Support
- Each reel can have content in English, Hindi, and Gujarati
- `primary_language` field indicates main language
- API filters by language: `?primary_language=hi`

### Metrics & Analytics
- Automatically tracks views, likes, shares
- Admin can view statistics: `/api/reels-new/reels/statistics/`
- View count increases on API call: `POST .../increment_view/`

## Storage

Video files stored in:
```
media/reels/videos/YYYY/MM/filename.mp4
```

Thumbnails stored in:
```
media/reels/thumbnails/YYYY/MM/thumbnail.jpg
```

## Permissions

- **Public users**: Can view published, approved reels only
- **Authenticated users**: Can upload reels, edit own reels, like, share
- **Admin users**: Full access to all operations, approval, publishing

## Next Advanced Features (Optional)

- [ ] Auto-generate thumbnails from video
- [ ] Video transcoding/optimization
- [ ] Like/dislike tracking per user
- [ ] Comments on reels
- [ ] Reels recommendations
- [ ] Sharing to social media
- [ ] Playlist support
- [ ] Collaborative reels

---

**Documentation**: See [README.md](README.md) for complete documentation.

**Questions?** Check the README.md file or review the admin panel interface.
