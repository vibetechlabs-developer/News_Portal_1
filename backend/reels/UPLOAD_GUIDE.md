# 📹 Reels Upload System - Installation & Usage Guide

## Quick Start

### 1. Apply Database Migrations

```powershell
cd D:\News\News_Portal_1\backend
python manage.py migrate reels
```

### 2. Start Django Development Server

```powershell
python manage.py runserver
```

The server will run at `http://localhost:8000/`

### 3. Access Admin Panel

- **URL:** `http://localhost:8000/admin/`
- **Login:** Use your admin credentials

### 4. Upload Your First Reel

Navigate to: **Reels & Videos** → **Reels** → **Upload New Reel** button (blue button in top-right)

---

## 📹 Uploading Reels - Two Methods

### Method 1: Dedicated Upload Page (Recommended)

1. Go to Admin Panel → **Reels & Videos** → **Reels**
2. Click **"📹 Upload New Reel"** button (top-right)
3. Fill in the form:
   - **English Content**: Title & Description (Required)
   - **Hindi Content**: Title & Description (Optional)
   - **Gujarati Content**: Title & Description (Optional)
   - **Video File**: Upload MP4, MOV, AVI, WebM, or MKV (Required)
   - **Thumbnail**: Upload optional thumbnail image
   - **Duration**: Enter video length in seconds (optional - auto-detected)
   - **Primary Language**: Select main content language
4. Click **"✓ Upload Reel"**
5. Reel is created as **DRAFT** - needs approval before publishing

**Supported Video Formats:**
- MP4 (H.264 codec recommended)
- MOV (QuickTime)
- AVI
- WebM
- MKV

**Supported Image Formats (Thumbnail):**
- JPG/JPEG
- PNG
- WebP

**File Size Limits:**
- Video: Max 100 MB
- Thumbnail: Max 5 MB
- Recommended aspect ratio: 16:9

### Method 2: Edit Reel Admin Interface

1. Go to Admin Panel → **Reels & Videos** → **Reels**
2. Click **"Add Reel"** button
3. Fill in all fields (same as Method 1)
4. Click **"Save"**

---

## 🎯 Workflow: Draft → Approve → Publish

### Step 1: Upload (Creator)
- User uploads reel via upload page
- Status: **DRAFT** 🟠 (Orange)
- Only creator can edit

### Step 2: Approve (Admin)
1. Go to **Reels & Videos** → **Reels**
2. Select the reel(s)
3. Choose action: **"Approve reels"**
4. Click **"Go"**
5. Status changes to: **✓ Approved** ✅

### Step 3: Publish (Admin)
1. Select the approved reel(s)
2. Choose action: **"Mark selected as published"**
3. Click **"Go"**
4. Status changes to: **PUBLISHED** 🟢 (Green)
5. Reel now appears in public API and frontend

### Optional: Mark as Featured/Trending
1. Select reel(s)
2. Choose action: **"Mark as featured"** ⭐ or **"Mark as trending"** 🔥
3. Featured/Trending reels appear on homepage

---

## 👁️ Admin Panel Features

### List View (`/admin/reels/reel/`)

**Columns Displayed:**
- 📍 **Title**: Reel title with language indicator
- 👤 **Author**: Who uploaded it
- 🎨 **Status Badge**: Color-coded (Draft, Published, Archived)
- ✅ **Approval**: Approval status (Approved/Pending)
- ⭐ **Visibility**: Featured/Trending indicators
- 👁️ **View Count**: Number of views
- 📅 **Created**: Upload date
- 🚀 **Published**: Publication date
- 📥 **Download**: Quick download link

**Filters (Sidebar):**
- Status (Draft, Published, Archived)
- Approval Status (Approved, Pending)
- Featured (Yes/No)
- Trending (Yes/No)
- Language (English, Hindi, Gujarati)
- Date Range
- Author

**Bulk Actions:**
- ✓ Mark selected as published
- ⊘ Mark selected as draft
- ⭐ Mark as featured
- Remove from featured
- ✅ Approve reels

**Search:**
- Search by title (any language)
- Search by description
- Search by author username/email

### Detail View (`/admin/reels/reel/{id}/`)

**Fieldsets:**
1. **Multilingual Content** - Titles & descriptions in EN/HI/GU
2. **Media Attachments** - Video upload, thumbnail, duration
3. **Publishing** - Author, status, publication date
4. **Approval Workflow** - Approval status, admin notes
5. **Visibility** - Featured, Trending flags
6. **Metrics** - Views, likes, shares (read-only)
7. **Timestamps** - Creation/update dates

**Features:**
- 🎬 Video preview link
- 🖼️ Thumbnail image preview
- 📊 File size info
- 🔗 Automatic slug generation
- ✒️ WYSIWYG editor for descriptions

---

## 🔌 API Endpoints

### Upload via API

**Endpoint:** `POST /api/reels-new/reels/`

**Authentication:** Required (JWT Token)

**Request:**
```bash
curl -X POST http://localhost:8000/api/reels-new/reels/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "title_en=My Awesome Reel" \
  -F "description_en=This is my first reel" \
  -F "video=@video.mp4" \
  -F "thumbnail=@thumbnail.jpg" \
  -F "primary_language=en"
```

**Response:**
```json
{
  "id": 1,
  "title_en": "My Awesome Reel",
  "slug": "my-awesome-reel",
  "status": "draft",
  "is_approved": false,
  "author": "admin",
  "video": "http://localhost:8000/media/reels/videos/2026/01/video.mp4",
  "thumbnail": "http://localhost:8000/media/reels/thumbnails/2026/01/thumbnail.jpg",
  "created_at": "2026-03-07T10:30:00Z"
}
```

### List Published Reels

**Endpoint:** `GET /api/reels-new/reels/?status=published&is_approved=true`

```bash
curl http://localhost:8000/api/reels-new/reels/?status=published
```

### Approve Reel (Admin)

**Endpoint:** `POST /api/reels-new/reels/{slug}/approve/`

```bash
curl -X POST http://localhost:8000/api/reels-new/reels/my-awesome-reel/approve/ \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Publish Reel (Admin)

**Endpoint:** `POST /api/reels-new/reels/{slug}/publish/`

```bash
curl -X POST http://localhost:8000/api/reels-new/reels/my-awesome-reel/publish/ \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Get Trending Reels

**Endpoint:** `GET /api/reels-new/reels/trending/`

```bash
curl http://localhost:8000/api/reels-new/reels/trending/
```

### Get Featured Reels

**Endpoint:** `GET /api/reels-new/reels/featured/`

```bash
curl http://localhost:8000/api/reels-new/reels/featured/
```

---

## 🐛 Troubleshooting

### Issue: "Video file is required" error

**Solution:**
- Ensure you selected a video file
- Check file size (max 100 MB)
- Verify format is MP4, MOV, AVI, WebM, or MKV
- Try uploading manually in admin

### Issue: File upload appears to hang

**Solution:**
- Check file size (large files take time)
- Monitor network tab in browser DevTools
- Check server logs for errors
- Ensure `MEDIA_ROOT` directory exists and is writable

### Issue: Admin upload page not displaying

**Solution:**
- Clear Django cache: `python manage.py clear_cache`
- Restart development server
- Hard-refresh browser (Ctrl+Shift+R)
- Check browser console for JavaScript errors

### Issue: Reel doesn't appear in list after upload

**Solution:**
- Ensure migrations applied: `python manage.py migrate reels`
- Verify status is not "ARCHIVED"
- Check approval status (must be approved for publish)
- Ensure author is set correctly

### Issue: Thumbnail not showing in admin

**Solution:**
- Verify `MEDIA_URL` and `MEDIA_ROOT` in settings.py
- Check file format (JPG, PNG, WebP only)
- Ensure image file size < 5 MB
- Verify media directory permissions

---

## 📦 File Organization in Server

Videos are organized by upload date:

```
media/reels/
├── videos/
│   └── 2026/01/07/
│       ├── reel1.mp4
│       ├── reel2.mov
│       └── ...
└── thumbnails/
    └── 2026/01/07/
        ├── thumbnail1.jpg
        ├── thumbnail2.jpg
        └── ...
```

---

## 🔐 Permissions & Access Control

| Operation | Public | Authenticated | Admin |
|-----------|--------|--------------|-------|
| View published reels | ✅ | ✅ | ✅ |
| Upload reel | ❌ | ✅ | ✅ |
| Edit own reel | ❌ | ✅ (own) | ✅ |
| Delete own reel | ❌ | ✅ (own) | ✅ |
| Approve reel | ❌ | ❌ | ✅ |
| Publish reel | ❌ | ❌ | ✅ |
| Access admin panel | ❌ | ❌ | ✅ |
| View statistics | ❌ | ❌ | ✅ |

---

## ✅ Verification Steps

After setup, verify everything works:

### Check 1: Database
```powershell
python manage.py dbshell
# View tables:
\dt reels_*
```

### Check 2: Admin Access
- Go to `http://localhost:8000/admin/`
- Navigate to "Reels & Videos"
- See the Reels list view

### Check 3: Upload Page
- Click "Upload New Reel" button
- See the upload form

### Check 4: Upload a Test Reel
- Fill in English title & description
- Upload a small MP4 file
- Click "Upload Reel"
- See success message

### Check 5: Approve & Publish
- Go to Reels list
- Select test reel
- Use "Approve reels" action
- Use "Mark selected as published" action

### Check 6: API Access
```bash
curl http://localhost:8000/api/reels-new/reels/
```

---

## 📝 Common Tasks

### Change Reel Status

**Draft to Published:**
1. Select reel in admin
2. Click action "Mark selected as published"
3. Must be approved first!

**Published to Draft:**
1. Select reel
2. Click action "Mark selected as draft"

### Make Reel Featured

1. Open reel in admin
2. Check "Featured" checkbox
3. Save
4. Or use bulk action from list

### Download Reel

1. Go to Reels list
2. Click "📥 Download" link in last column
3. Browser downloads video file

### Search Reels

1. Use search box at top of Reels list
2. Search by:
   - Title (any language)
   - Description
   - Author username

### Filter Reels

1. Click filters in sidebar
2. Select:
   - Status
   - Approval status
   - Language
   - Date range
   - Author

---

## 🚀 Next Steps

1. ✅ Apply migrations
2. ✅ Start server
3. ✅ Upload first reel
4. ✅ Approve & publish
5. ✅ Create categories & tags (optional)
6. ✅ Integrate with frontend
7. ✅ Configure CDN/S3 for production

---

## Support & Documentation

- **Full Documentation:** See [README.md](README.md)
- **Setup Checklist:** See [SETUP.md](SETUP.md)
- **API Reference:** See [README.md](README.md#api-endpoints)

---

**Last Updated:** March 7, 2026
