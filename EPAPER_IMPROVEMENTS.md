# E-Newspaper Improvements – Suggestions (Sandesh Reference)

Based on reference from **Sandesh News** (sandesh.com) and similar Gujarati newspaper e-paper implementations, here are recommendations to improve the Kanam Express e-paper section.

---

## 1. Date-Based Edition Selector

**Current:** Single static edition.

**Sandesh-style:** A date picker or calendar to browse past editions (e.g. last 7–30 days).

**Implementation:**
- Add a date selector in the e-paper dialog header.
- Backend: Store/retrieve editions by publication date.
- Show available dates (e.g. weekly issues for Kanam Express).

---

## 2. Page Thumbnail Grid

**Current:** Single page view with prev/next arrows.

**Sandesh-style:** Thumbnail strip or grid of all pages so users can jump to any page.

**Implementation:**
- Render small thumbnails (e.g. 100×140px) for each page.
- Click on thumbnail to open that page in the main viewer.
- Optional: sticky thumbnail strip below the main viewer.

---

## 3. Real Newspaper Layout (PDF/Image)

**Current:** Placeholder images from Unsplash.

**Sandesh-style:** Real newspaper pages as high-quality images or PDFs.

**Implementation:**
- Store newspaper pages as:
  - PDFs per edition, or
  - High-res images (e.g. 1200–1600px width).
- Backend: API or media storage for editions by date.
- Use proper newspaper aspect ratio (e.g. A3/A2) for layout and zoom.

---

## 4. Zoom & Pan Controls

**Sandesh-style:** Zoom in/out and pan for readable text.

**Implementation:**
- Zoom: 50%, 75%, 100%, 125%, 150%, 200%.
- Optional: pinch-to-zoom on mobile.
- Pan with mouse/touch when zoomed in.

---

## 5. Share & Social Features

**Sandesh-style:** Share buttons for current page or article.

**Implementation:**
- Share current page to WhatsApp, Twitter, Facebook.
- Copy link to clipboard.
- Optional: Share specific article from e-paper page.

---

## 6. Download Options

**Current:** “Download” uses image URL, not a real PDF.

**Implementation:**
- Provide PDF download per page or full edition.
- Ensure filename includes date and page number, e.g. `Kanam-Express-2026-02-11-Page-1.pdf`.

---

## 7. Mobile Layout

**Sandesh-style:** Swipe between pages on mobile.

**Implementation:**
- Swipe left/right to change pages.
- Full-screen reading mode.
- Bottom or side page indicator (e.g. “Page 3 of 12”).

---

## 8. Section Bookmarks (Optional)

**Sandesh-style:** Quick links to sections within the paper.

**Implementation:**
- If page structure is known, add section links (e.g. Front Page, Gujarat, Sports, Entertainment).
- Map sections to page numbers for quick navigation.

---

## 9. Print-Friendly View

**Implementation:**
- Add “Print” button.
- Use print CSS for clean, full-page output.

---

## 10. Backend / Data Model

To support date-based editions and real content:

```python
# Example Django model
class EpaperEdition(models.Model):
    publication_date = models.DateField(unique=True)
    title = models.CharField(max_length=200)  # e.g. "February 11, 2026"
    total_pages = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

class EpaperPage(models.Model):
    edition = models.ForeignKey(EpaperEdition, on_delete=models.CASCADE)
    page_number = models.PositiveIntegerField()
    image = models.ImageField(upload_to='epaper/')
    pdf_file = models.FileField(upload_to='epaper/', null=True, blank=True)
```

---

## Priority Order

1. **High:** Date selector, real newspaper images/PDFs, page thumbnails.
2. **Medium:** Zoom/pan, download, share.
3. **Low:** Section bookmarks, print view.

---

## Quick Wins (Frontend Only, No Backend Change)

- Add date selector UI (can be wired later to backend).
- Show page thumbnails when multiple pages exist.
- Add zoom buttons (e.g. 100%, 125%, 150%).
- Fix download behavior when PDF URLs are available.
