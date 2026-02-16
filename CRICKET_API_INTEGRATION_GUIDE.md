# 🏏 Step-by-Step Guide: Cricket API Integration

This guide will walk you through integrating a cricket live API (RapidAPI) into your News Portal.

---

## 📋 Prerequisites

- RapidAPI account (free)
- Django backend running
- Frontend (React/Vite) running

---

## Step 1: Get RapidAPI Account & API Key

### 1.1 Sign Up
1. Go to **https://rapidapi.com**
2. Click **"Sign Up"** (free account)
3. Complete registration

### 1.2 Get Your API Key
1. After login, go to **Dashboard** → **My Apps** → **Default Application**
2. Copy your **API Key** (looks like: `abc123def456ghi789...`)
   - Keep this secret! Don't share it publicly.

---

## Step 2: Subscribe to a Cricket API

### 2.1 Choose an API
Popular options:
- **Cricbuzz Cricket API**: https://rapidapi.com/cricketapilive/api/cricbuzz-cricket
- **Cricket Live Scores API**: Search "cricket" on RapidAPI

### 2.2 Subscribe
1. Click **"Subscribe"** on the API page
2. Choose **"Basic"** or **"Free"** plan (usually 2,500 requests/day)
3. Confirm subscription

### 2.3 Get API Details
On the API page, look for:
- **Host**: Example: `cricbuzz-cricket.p.rapidapi.com`
- **Base URL**: Example: `https://cricbuzz-cricket.p.rapidapi.com/news/v1/index`
- **Your API Key**: Already copied from Step 1.2

**Example for Cricbuzz Cricket API:**
- Host: `cricbuzz-cricket.p.rapidapi.com`
- Base URL: `https://cricbuzz-cricket.p.rapidapi.com/news/v1/index`
- Or for live matches: `https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live`

---

## Step 3: Configure Backend Environment

### 3.1 Create `.env` File
1. Navigate to `D:\News_Portal\backend\`
2. Copy `env.sample` to `.env`:
   ```bash
   # Windows PowerShell
   Copy-Item env.sample .env
   
   # Or manually copy the file and rename it
   ```

### 3.2 Edit `.env` File
Open `backend\.env` in a text editor and add these lines at the bottom:

```env
# Cricket API Configuration (RapidAPI)
CRICKET_API_ENABLED=True
CRICKET_API_BASE_URL=https://cricbuzz-cricket.p.rapidapi.com/news/v1/index
CRICKET_API_HOST=cricbuzz-cricket.p.rapidapi.com
CRICKET_API_KEY=your-actual-rapidapi-key-here
```

**Replace `your-actual-rapidapi-key-here` with your actual RapidAPI key from Step 1.2**

**Important:** 
- Replace the `CRICKET_API_BASE_URL` with the actual endpoint URL from your chosen API
- Replace `CRICKET_API_HOST` with the actual host from your chosen API
- Keep your API key secret - never commit `.env` to Git!

---

## Step 4: Install Python Dependencies

### 4.1 Install `requests` Library
Open terminal in `D:\News_Portal\backend\` and run:

```bash
pip install requests==2.32.3
```

Or install all requirements:
```bash
pip install -r requirements.txt
```

This installs the `requests` library needed to call external APIs.

---

## Step 5: Test Backend Endpoint

### 5.1 Start Django Server
```bash
cd D:\News_Portal\backend
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

### 5.2 Test the Cricket Endpoint

**Option A: Using Browser**
Open: **http://localhost:8000/api/v1/news/cricket-live/**

**Option B: Using cURL (PowerShell)**
```powershell
curl http://localhost:8000/api/v1/news/cricket-live/
```

**Option C: Using Postman or Thunder Client**
- Method: `GET`
- URL: `http://localhost:8000/api/v1/news/cricket-live/`

### 5.3 Expected Results

**✅ Success Response:**
```json
{
  "storyList": [
    {
      "story": {
        "id": 12345,
        "headline": "India wins the match!",
        "intro": "India defeated Australia by 5 wickets...",
        "pubTime": "2026-02-15T10:30:00Z"
      }
    }
  ]
}
```
*(Exact format depends on your chosen API)*

**❌ Error Responses:**

If you see:
```json
{"detail": "Cricket API is not configured."}
```
→ Check that `CRICKET_API_ENABLED=True` in `.env`

```json
{"detail": "Cricket API settings are incomplete."}
```
→ Check that all 4 variables (`ENABLED`, `BASE_URL`, `HOST`, `KEY`) are set in `.env`

```json
{"detail": "Failed to fetch data from cricket provider."}
```
→ Check your API key and base URL are correct. Verify the API is subscribed.

---

## Step 6: Verify Frontend Integration

### 6.1 Start Frontend Server
```bash
cd "D:\News_Portal\kanam_express copy"
npm run dev
```

### 6.2 Check Home Page
1. Open browser: **http://localhost:8080** (or your frontend port)
2. Scroll to the **right sidebar**
3. You should see a **"Cricket Updates"** card at the top

### 6.3 What You Should See

**✅ Working:**
- Card title: "Live Cricket Updates" (or "Cricket Updates")
- List of cricket news headlines
- "X minutes ago" timestamps
- Clickable links to original articles
- Refresh button (🔄) to reload data

**❌ Not Working:**
- "Cricket API is not configured" message
- Empty card or error message
- Check browser console (F12) for errors

---

## Step 7: Troubleshooting

### Problem: "Cricket API is not configured"
**Solution:**
1. Check `backend\.env` file exists
2. Verify `CRICKET_API_ENABLED=True`
3. Restart Django server

### Problem: "Cricket API settings are incomplete"
**Solution:**
1. Check all 4 variables are set in `.env`:
   - `CRICKET_API_ENABLED=True`
   - `CRICKET_API_BASE_URL=...`
   - `CRICKET_API_HOST=...`
   - `CRICKET_API_KEY=...`
2. Make sure there are no typos
3. Restart Django server

### Problem: "Failed to fetch data from cricket provider"
**Solution:**
1. Verify your RapidAPI key is correct
2. Check you're subscribed to the API
3. Verify `CRICKET_API_BASE_URL` matches the API endpoint URL
4. Check `CRICKET_API_HOST` matches the API host
5. Test the API directly on RapidAPI playground first

### Problem: Frontend shows no cricket data
**Solution:**
1. Check browser console (F12) for errors
2. Verify backend endpoint works (Step 5)
3. Check network tab - is `/api/v1/news/cricket-live/` returning data?
4. Verify frontend is pointing to correct backend URL

### Problem: API returns 429 (Too Many Requests)
**Solution:**
- You've exceeded your free tier limit
- Wait for rate limit reset (usually daily)
- Or upgrade to a paid plan

---

## Step 8: Customize API Endpoint (Optional)

If you want to use a different endpoint (e.g., live scores instead of news):

### 8.1 Change Base URL
In `backend\.env`, change:
```env
# For live scores instead of news:
CRICKET_API_BASE_URL=https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live
```

### 8.2 Restart Server
```bash
# Stop Django server (Ctrl+C)
# Start again
python manage.py runserver
```

---

## 📝 Quick Reference

### Environment Variables
```env
CRICKET_API_ENABLED=True
CRICKET_API_BASE_URL=https://your-api-url.com/endpoint
CRICKET_API_HOST=your-api-host.p.rapidapi.com
CRICKET_API_KEY=your-rapidapi-key
```

### Backend Endpoint
- **URL**: `http://localhost:8000/api/v1/news/cricket-live/`
- **Method**: `GET`
- **Auth**: None (public)

### Frontend Location
- **Component**: `src/components/news/CricketLiveWidget.tsx`
- **API Call**: `src/lib/api.ts` → `getCricketNews()`
- **Display**: Right sidebar on home page (`/`)

---

## ✅ Checklist

- [ ] RapidAPI account created
- [ ] API key copied
- [ ] Subscribed to cricket API
- [ ] `.env` file created in `backend/`
- [ ] All 4 cricket variables set in `.env`
- [ ] `requests` library installed
- [ ] Django server restarted
- [ ] Backend endpoint tested (`/api/v1/news/cricket-live/`)
- [ ] Frontend shows cricket widget
- [ ] Cricket news displays correctly

---

## 🎉 Success!

If you see cricket news in the sidebar, you're done! The integration is working.

**Next Steps:**
- Customize the widget styling
- Add more cricket endpoints (scores, fixtures, etc.)
- Add caching to reduce API calls
- Style the cricket section on Sports page

---

## 📞 Need Help?

If you encounter issues:
1. Check Django logs: `python manage.py runserver` (terminal output)
2. Check browser console: F12 → Console tab
3. Verify API subscription on RapidAPI dashboard
4. Test API directly on RapidAPI playground

---

**Last Updated:** February 2026
