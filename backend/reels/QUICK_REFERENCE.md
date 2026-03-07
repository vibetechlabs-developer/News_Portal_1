# 📹 Reels Upload - Quick Reference Card

## ✅ Status: All Set Up!

✓ Database tables created  
✓ Admin panel registered  
✓ API endpoints active  
✓ File upload configured (100 MB max)  
✓ Multilingual support enabled  
✓ Approval workflow ready  

---

## 🚀 Start Here

### 1. Open Django Admin
```
http://localhost:8000/admin/
```

### 2. Find Reels Section
**Reels & Videos** → **Reels** (in left sidebar)

### 3. Click Upload Button
Blue button **"📹 Upload New Reel"** (top-right)

---

## 📝 Upload Form Fields

| Field | Required | Format | Max Size |
|-------|----------|--------|----------|
| Title (English) | ✓ | Text | - |
| Title (Hindi) | | Text | - |
| Title (Gujarati) | | Text | - |
| Description (EN) | | Text | - |
| Description (HI) | | Text | - |
| Description (GU) | | Text | - |
| Video File | ✓ | MP4, MOV, AVI, WebM, MKV | 100 MB |
| Thumbnail | | JPG, PNG, WebP | 5 MB |
| Duration | | Seconds | - |
| Primary Language | ✓ | EN / HI / GU | - |

---

## 🎬 Video Format Guidelines

**Recommended:**
- Format: MP4 (H.264 codec)
- Resolution: 720p-1080p
- Aspect Ratio: 9:16 (mobile) or 16:9 (landscape)
- Frame Rate: 30fps

**Supported Formats:**
- MP4 ✓
- MOV ✓
- AVI ✓
- WebM ✓
- MKV ✓

**Avoid:**
- FLV ❌
- WMV ❌
- Any proprietary formats ❌

---

## 🔄 Status Flow

```
UPLOAD (USER)
    ↓
[DRAFT] 🟠 (Orange)
    ↓
APPROVE (ADMIN)
    ↓
[APPROVED] ✅
    ↓
PUBLISH (ADMIN)
    ↓
[PUBLISHED] 🟢 (Green) - Now visible to public!
```

---

## 📊 Admin List View

**What You See:**
- 📍 Title (with language)
- 👤 Author name
- 🎨 Status badge (Draft/Published/Archived)
- ✅ Approval status
- ⭐ Featured/Trending flags
- 👁️ View count
- 📅 Created date
- 🚀 Published date
- 📥 Download link

**Filters (Left Sidebar):**
- Status
- Approval
- Featured/Trending
- Language
- Created date
- Author

**Search Box:**
- Search by title
- Search by description
- Search by author

---

## ⚡ Bulk Actions

**Select reels → Choose action → Click "Go"**

| Action | Effect |
|--------|--------|
| Mark selected as published | Status → PUBLISHED 🟢 |
| Mark selected as draft | Status → DRAFT 🟠 |
| Mark as featured | Add ⭐ Featured tag |
| Remove from featured | Remove ⭐ tag |
| Approve reels | Approval → ✓ Approved |

---

## 🔗 Important URLs

| Page | URL |
|------|-----|
| Admin Login | `/admin/` |
| Reels List | `/admin/reels/reel/` |
| Upload Form | `/admin/reels/reel/upload/` |
| Add New Reel | `/admin/reels/reel/add/` |
| API Reels List | `/api/reels-new/reels/` |
| API Trending | `/api/reels-new/reels/trending/` |
| API Featured | `/api/reels-new/reels/featured/` |

---

## 🎯 Common Tasks (30 seconds each)

### Upload a Reel
1. Click **Upload New Reel** button
2. Fill English title & description
3. Select video file
4. Click **Upload Reel**
✓ Done! Status = DRAFT

### Approve a Reel
1. Go to Reels list
2. Select reel checkbox
3. Choose **Approve reels** action
4. Click **Go**
✓ Done! Status = APPROVED

### Publish a Reel
1. Select approved reel
2. Choose **Mark selected as published** action
3. Click **Go**
✓ Done! Status = PUBLISHED (now visible)

### Make Featured
1. Select reel
2. Choose **Mark as featured** action
3. Click **Go**
✓ Done! Shows ⭐ in list

### Download Video
1. Click **📥 Download** link in reel row
✓ Done! Browser downloads MP4

### Search Reel
1. Type in search box (top of list)
2. Search by title, description, or author
3. Results appear instantly
✓ Done!

### Filter by Status
1. Click **Status** in left sidebar
2. Select: Draft / Published / Archived
3. List filters automatically
✓ Done!

---

## 🔐 Who Can Do What?

| Task | Public | Logged In | Admin |
|------|--------|-----------|-------|
| View published reels | ✓ | ✓ | ✓ |
| Upload reel | ✗ | ✓ | ✓ |
| Edit own reel | ✗ | ✓ | ✓ |
| Approve | ✗ | ✗ | ✓ |
| Publish | ✗ | ✗ | ✓ |
| Admin panel | ✗ | ✗ | ✓ |

---

## 📂 File Storage

**Videos:** `media/reels/videos/YYYY/MM/DD/filename.mp4`  
**Thumbnails:** `media/reels/thumbnails/YYYY/MM/DD/filename.jpg`  

Files automatically organized by upload date!

---

## ❌ Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Can't find upload button | Go to `/admin/reels/reel/` click blue button |
| File too large error | Use videos < 100 MB |
| Invalid format error | Use MP4, MOV, AVI, WebM, or MKV |
| Admin page not loading | Hard refresh (Ctrl+Shift+R) or restart server |
| Reel doesn't appear | Check status (must be PUBLISHED) |
| Thumbnail not showing | Use JPG, PNG, or WebP < 5 MB |

---

## 📚 Documentation Files

- **Full Guide:** `UPLOAD_GUIDE.md` - Complete instructions
- **Setup Info:** `SETUP.md` - Installation & checklist
- **API Reference:** `README.md` - API endpoints
- **Quick Ref:** This file! 🎯

---

## 💡 Pro Tips

✓ **Multilingual:** Always fill English, optionally Hindi & Gujarati  
✓ **SEO:** Use clear, descriptive titles  
✓ **Thumbnails:** Use 16:9 aspect ratio images  
✓ **Duration:** Leave blank if unsure - auto-detects  
✓ **Featured:** Mark best content as featured for homepage  
✓ **Trending:** Use trending tag for viral content  
✓ **Approval:** Always approve before publishing  

---

## 🔄 API Usage Example

### Upload via API
```bash
curl -X POST http://localhost:8000/api/reels-new/reels/ \
  -H "Authorization: Bearer TOKEN" \
  -F "title_en=My Reel" \
  -F "video=@video.mp4"
```

### List Published Reels
```bash
curl http://localhost:8000/api/reels-new/reels/?status=published
```

### Get Trending
```bash
curl http://localhost:8000/api/reels-new/reels/trending/
```

---

## ✨ Next Steps

1. ✓ Upload your first reel
2. ✓ Approve it
3. ✓ Publish it
4. ✓ Mark as featured (optional)
5. ✓ Share the URL

---

**Admin Panel:** `http://localhost:8000/admin/`  
**Status:** ✅ Ready to go!  
**Last Updated:** March 7, 2026
