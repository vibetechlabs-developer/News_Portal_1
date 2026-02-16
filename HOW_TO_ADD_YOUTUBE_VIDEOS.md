# How to Add YouTube Videos

This guide explains how to add YouTube videos to your news portal.

## Overview

The system has three separate sections:
1. **Videos Section** - Only uploaded video files (not YouTube)
2. **Reels Section** - Only uploaded video files (not YouTube)
3. **YouTube Section** - Only YouTube videos (from both VideoContent and ReelContent)

## Method 1: Using Django Admin Panel (Recommended)

### Step 1: Access Admin Panel
1. Go to your admin panel URL: `http://your-domain.com/admin/`
2. Login with your admin/editor credentials

### Step 2: Add YouTube Video to VideoContent
1. Navigate to **News** → **Video contents**
2. Click **"Add video content"** button
3. Fill in the form:
   - **Title (English)**: Enter the video title in English
   - **Title (Hindi)**: (Optional) Enter title in Hindi
   - **Title (Gujarati)**: (Optional) Enter title in Gujarati
   - **Slug**: Auto-generated from title (or enter manually)
   - **Description**: (Optional) Add video description
   - **Section**: Select appropriate section
   - **Category**: (Optional) Select category
   - **Tags**: (Optional) Add relevant tags
   - **Thumbnail**: Upload a thumbnail image (recommended)
   - **File**: **LEAVE EMPTY** (for YouTube videos)
   - **YouTube URL**: Enter the YouTube video URL
   - **Status**: Select "Published" to make it visible
   - **Primary Language**: Select the main language

4. **YouTube URL Formats Supported:**
   - `https://www.youtube.com/watch?v=VIDEO_ID`
   - `https://youtu.be/VIDEO_ID`
   - `https://www.youtube.com/embed/VIDEO_ID`
   - `https://www.youtube.com/shorts/VIDEO_ID`
   - `https://m.youtube.com/watch?v=VIDEO_ID`
   - Just the video ID: `VIDEO_ID`

5. Click **"Save"**

### Step 3: Add YouTube Video to ReelContent (for Reels)
1. Navigate to **News** → **Reel contents**
2. Click **"Add reel content"** button
3. Fill in the form (same as above)
4. **Important**: Enter YouTube URL in the **"YouTube URL"** field
5. **Leave "File" field empty** for YouTube videos
6. Click **"Save"**

## Method 2: Using API

### Create YouTube Video via API

**Endpoint:** `POST /api/news/videos/`

**Request Body:**
```json
{
  "title_en": "My YouTube Video Title",
  "title_gu": "મારું યુટ્યુબ વિડિયો શીર્ષક",
  "title_hi": "मेरा यूट्यूब वीडियो शीर्षक",
  "slug": "my-youtube-video",
  "description_en": "Video description",
  "section": 1,
  "category": 2,
  "tags": [1, 2, 3],
  "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "status": "PUBLISHED",
  "primary_language": "EN"
}
```

**For Reels:**
**Endpoint:** `POST /api/news/reels/`

**Request Body:**
```json
{
  "title_en": "My YouTube Reel Title",
  "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "section": 1,
  "status": "PUBLISHED",
  "primary_language": "EN"
}
```

## Important Notes

### ✅ DO:
- **For YouTube videos**: Fill in `youtube_url` field, leave `file` field empty
- **For uploaded videos**: Upload file in `file` field, leave `youtube_url` empty
- Always add a thumbnail image for better display
- Set status to "PUBLISHED" to make it visible on the website
- Use proper titles and descriptions for SEO

### ❌ DON'T:
- Don't fill both `youtube_url` and `file` fields at the same time
- Don't use YouTube URLs in the Videos/Reels sections (they will be filtered out)
- Don't forget to set status to "PUBLISHED" if you want it visible

## Where Videos Appear

### YouTube Videos:
- Appear in the **YouTube Section** on the homepage
- Can be from either VideoContent or ReelContent models
- Displayed with YouTube player embed

### Uploaded Videos:
- **VideoContent** with uploaded files → Appear in **Videos Section**
- **ReelContent** with uploaded files → Appear in **Reels Section**
- Displayed with HTML5 video player

## Example YouTube URLs

```
✅ Valid formats:
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ
https://www.youtube.com/embed/dQw4w9WgXcQ
https://www.youtube.com/shorts/dQw4w9WgXcQ
dQw4w9WgXcQ

❌ Invalid formats:
https://youtube.com/watch?v=dQw4w9WgXcQ (missing www)
youtube.com/watch?v=dQw4w9WgXcQ (missing protocol)
```

## Troubleshooting

### Video not showing in YouTube Section?
1. Check if `youtube_url` field is filled correctly
2. Verify the URL format is correct
3. Make sure status is set to "PUBLISHED"
4. Check if the YouTube video is public and accessible

### Video showing in wrong section?
- YouTube videos should only appear in YouTube Section
- Uploaded videos should appear in Videos/Reels sections
- Make sure you're using the correct field (`youtube_url` vs `file`)

### Video not playing?
1. Verify the YouTube URL is correct and the video is public
2. Check browser console for errors
3. Ensure the video hasn't been removed from YouTube
4. Try the video URL directly in a browser

## Quick Reference

| Field | YouTube Video | Uploaded Video |
|-------|--------------|----------------|
| `youtube_url` | ✅ Fill with YouTube URL | ❌ Leave empty |
| `file` | ❌ Leave empty | ✅ Upload video file |
| Appears in | YouTube Section | Videos/Reels Section |
