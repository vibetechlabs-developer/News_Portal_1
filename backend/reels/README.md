# Reels & Videos Management System

A comprehensive Django app for managing short-form video content (reels and videos) with multilingual support, approval workflow, and admin panel integration.

## Features

✨ **Core Features:**
- 📹 Support for multiple video formats (MP4, MOV, AVI, WebM, MKV)
- 🌍 Multilingual content (English, Hindi, Gujarati)
- ✅ Approval workflow with admin control
- ⭐ Featured and trending content management
- 📊 Engagement metrics (views, likes, shares)
- 🏷️ Category and tag-based organization
- 🎬 Automatic thumbnail support
- 📱 Responsive API endpoints

## Models

### Reel
Main model for storing reel/video content.

**Fields:**
- `title_en`, `title_hi`, `title_gu` - Multilingual titles
- `description_en`, `description_hi`, `description_gu` - Multilingual descriptions
- `slug` - URL-friendly identifier (auto-generated)
- `video` - Video file (MP4, MOV, AVI, WebM, MKV)
- `thumbnail` - Optional custom thumbnail image
- `duration` - Video duration in seconds
- `author` - ForeignKey to User
- `status` - DRAFT, PUBLISHED, ARCHIVED
- `is_featured` - Show on homepage
- `is_trending` - Mark as trending
- `is_approved` - Approval status
- `approved_by` - Admin who approved
- `approved_at` - Approval timestamp
- `created_at`, `updated_at`, `published_at` - Timestamps
- `view_count`, `like_count`, `share_count` - Engagement metrics
- `primary_language` - Primary language for content

**Methods:**
- `publish()` - Publish approved reel
- `get_absolute_url()` - Get reel URL
- `save()` - Auto-generates slug

### ReelCategory
Organize reels into categories.

**Fields:**
- `name_en`, `name_hi`, `name_gu` - Multilingual category names
- `slug` - URL identifier
- `description_en`, `description_hi`, `description_gu` - Descriptions
- `icon` - Category icon/image
- `order` - Display ordering
- `is_active` - Toggle visibility

### ReelTag
Tags for discovering and filtering reels.

**Fields:**
- `name` - Tag name
- `slug` - URL identifier
- `is_active` - Toggle visibility
- `created_at` - Creation timestamp

## Setup Instructions

### 1. Installation
The app is already installed in Django. Run migrations:

```bash
python manage.py makemigrations reels
python manage.py migrate reels
```

### 2. Admin Panel Access
Access the Django admin at `/admin/` and navigate to:
- **Reels & Videos** → Reels
- **Reels & Videos** → Reel Categories
- **Reels & Videos** → Reel Tags

## Admin Panel Functions

### Reel Management (`/admin/reels/reel/`)

**List View:**
- Color-coded status badges (Draft, Published, Archived)
- Approval status indicator
- Featured & Trending badges
- View count display
- Quick filters by status, approval, language, date, author

**Edit View:**
- Multilingual content fields organized in fieldsets
- Video upload with format validation
- Thumbnail preview
- Automatic slug generation
- Approval workflow fields
- Metrics and statistics

**Bulk Actions:**
- Mark as Published
- Mark as Draft
- Mark as Featured
- Remove from Featured
- Approve Reels

**Search:**
- Search by title (EN, HI, GU)
- Search by description
- Search by author username/email

### Category Management (`/admin/reels/reelcategory/`)
- Create and manage reel categories
- Multilingual category names
- Category icons
- Display ordering

### Tag Management (`/admin/reels/reeltag/`)
- Create and manage tags
- Enable/disable tags
- Search and filter

## API Endpoints

### Reels API (`/api/reels-new/reels/`)

**List Reels (GET)**
```bash
GET /api/reels-new/reels/
```
Query Parameters:
- `status` - Filter by status (draft, published, archived)
- `primary_language` - Filter by language (en, hi, gu)
- `is_featured` - Filter featured reels (true/false)
- `is_trending` - Filter trending reels (true/false)
- `search` - Search in titles and descriptions
- `ordering` - Sort by field (created_at, published_at, view_count, like_count)

**Create Reel (POST)** - Authenticated only
```bash
POST /api/reels-new/reels/
Content-Type: multipart/form-data

{
    "title_en": "My Reel",
    "description_en": "Description",
    "video": <video_file>,
    "thumbnail": <image_file>,
    "primary_language": "en"
}
```

**Retrieve Reel (GET)**
```bash
GET /api/reels-new/reels/{slug}/
```

**Update Reel (PUT/PATCH)** - Author/Admin only
```bash
PATCH /api/reels-new/reels/{slug}/
```

**Delete Reel (DELETE)** - Author/Admin only
```bash
DELETE /api/reels-new/reels/{slug}/
```

### Special Endpoints

**Get Trending Reels**
```bash
GET /api/reels-new/reels/trending/
```

**Get Featured Reels**
```bash
GET /api/reels-new/reels/featured/
```

**Get My Reels** - Authenticated
```bash
GET /api/reels-new/reels/my_reels/
```

**Approve Reel** - Admin only
```bash
POST /api/reels-new/reels/{slug}/approve/
```

**Publish Reel** - Admin only
```bash
POST /api/reels-new/reels/{slug}/publish/
```

**Increment View Count**
```bash
POST /api/reels-new/reels/{slug}/increment_view/
```

**Like Reel** - Authenticated
```bash
POST /api/reels-new/reels/{slug}/like/
```

**Share Reel**
```bash
POST /api/reels-new/reels/{slug}/share/
```

**Get Statistics** - Admin only
```bash
GET /api/reels-new/reels/statistics/
```

### Categories API (`/api/reels-new/categories/`)

**List Categories**
```bash
GET /api/reels-new/categories/
```

**Search Categories**
```bash
GET /api/reels-new/categories/?search=entertainment
```

### Tags API (`/api/reels-new/tags/`)

**List Tags**
```bash
GET /api/reels-new/tags/
```

**Search Tags**
```bash
GET /api/reels-new/tags/?search=viral
```

## Example Workflows

### 1. Upload and Publish a Reel

```bash
# 1. Create draft reel
POST /api/reels-new/reels/ (as authenticated user)

# 2. Admin approves reel
POST /api/reels-new/reels/{slug}/approve/

# 3. Admin publishes reel
POST /api/reels-new/reels/{slug}/publish/
```

### 2. Get Trending Reels for Homepage

```bash
GET /api/reels-new/reels/trending/
```

### 3. Track Engagement

```bash
# When reel is viewed
POST /api/reels-new/reels/{slug}/increment_view/

# When user likes
POST /api/reels-new/reels/{slug}/like/

# When user shares
POST /api/reels-new/reels/{slug}/share/

# Get statistics (admin)
GET /api/reels-new/reels/statistics/
```

## Serializers

### ReelListSerializer
Used for listing reels - minimal data, optimized for list views.

### ReelDetailSerializer
Used for detail views - complete reel information.

### ReelCreateUpdateSerializer
Used for create/update operations - user input validation.

### ReelStatisticsSerializer
Used for analytics endpoints - engagement statistics.

### ReelCategorySerializer
For category endpoints.

### ReelTagSerializer
For tag endpoints.

## Testing

Run tests with:
```bash
python manage.py test reels
```

Test coverage includes:
- Model creation and validation
- Slug auto-generation
- Admin panel functionality
- API permissions
- Multilingual content

## File Organization

Uploaded files are organized by date:
```
media/
├── reels/
│   ├── videos/
│   │   └── 2026/01/filename.mp4
│   └── thumbnails/
│       └── 2026/01/thumbnail.jpg
```

## Database Indexes

Optimized indexes for performance:
- `status`, `published_at` - For published content queries
- `is_approved`, `status` - For approval workflow
- `is_featured`, `is_trending` - For homepage queries
- `author`, `status` - For user's reels
- `created_at` - For recent content

## Production Considerations

1. **Video Storage**: Consider using CDN/S3 for video files
2. **Thumbnail Generation**: Auto-generate thumbnails on upload
3. **Video Validation**: Validate video codec and duration
4. **Rate Limiting**: Add rate limiting to view/like endpoints
5. **Caching**: Cache trending/featured reels
6. **Async Tasks**: Use Celery for video processing

## Troubleshooting

**Migration Issues**
```bash
python manage.py showmigrations reels
python manage.py migrate reels
```

**File Upload Issues**
- Check `MEDIA_ROOT` and `MEDIA_URL` in settings
- Verify file permissions
- Check `MAX_UPLOAD_SIZE`

**Admin Display Issues**
- Clear browser cache
- Check static files: `python manage.py collectstatic`

## Support

For issues or feature requests, contact the development team.
