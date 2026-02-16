# 🎬 How It Works: Step-by-Step Example

## Complete User Journey

### Scenario: A user wants to apply for a "Senior Developer" job

---

## 📱 Step 1: User Visits Careers Page

**URL:** `http://localhost:3000/careers`

**What Happens:**
```javascript
// Frontend: Careers.tsx
1. Component mounts
2. useEffect triggers API call
3. careersAPI.getOpenPositions() called
```

**Backend Response:**
```python
# Django: JobPostingViewSet.open_positions()
GET /api/v1/careers/job-postings/open_positions/
↓
Returns all jobs with status='OPEN' and deadline > now
```

**Data Returned:**
```json
[
  {
    "id": 1,
    "title": "Senior Developer",
    "location": "Ahmedabad",
    "job_type": "FULL_TIME",
    "salary_range_min": 600000,
    "salary_range_max": 1200000,
    "description": "We are hiring experienced developers...",
    "is_open": true,
    "application_count": 5
  }
]
```

**Frontend Display:**
- Three JobCard components rendered in a grid
- Each shows title, location, job type, salary range
- Green "Open" badge displayed
- Responsive grid layout

---

## 🔍 Step 2: User Clicks on Job Card

**Action:** User clicks "View" button on Senior Developer card

**What Happens:**
```javascript
// Frontend: Careers.tsx
handleJobCardClick(job) {
  setSelectedJob(job)
  setShowDetails(true)
}
```

**Component Displayed:** JobDetails Modal

**Modal Content:**
```
┌─────────────────────────────────────┐
│  Senior Developer                   │ X
├─────────────────────────────────────┤
│                                     │
│ Senior Software Engineer            │
│ Engineering                         │
│                                     │
│ [Quick Info Grid]                   │
│ ├─ Ahmedabad (location)             │
│ ├─ Full Time (job type)             │
│ ├─ ₹6L - ₹12L (salary)              │
│ └─ 5 applications (count)           │
│                                     │
│ [Expandable Sections]               │
│ ├─ Description                      │
│ ├─ Requirements                     │
│ └─ Responsibilities                 │
│                                     │
│ Status: ✓ Open for Applications     │
│                                     │
│         [Close] [Apply Now →]       │
└─────────────────────────────────────┘
```

---

## 📝 Step 3: User Clicks "Apply Now"

**Frontend Action:**
```javascript
handleApplyClick() {
  setShowDetails(false)
  setShowApplicationForm(true)
}
```

**Component Displayed:** JobApplicationForm Modal

**Form Fields:**
```
┌─────────────────────────────────────┐
│  Apply for: Senior Developer        │ X
├─────────────────────────────────────┤
│                                     │
│ Full Name*           Email*         │
│ [John Doe]         [john@...]      │
│                                     │
│ Phone Number*        Years Exp.*    │
│ [99999...]         [3]             │
│                                     │
│ Skills (comma sep)*                 │
│ [Python, Django, React]            │
│                                     │
│ Cover Letter*                       │
│ [I am passionate about...]         │
│ [...]                              │
│                                     │
│ Resume Upload* (PDF, DOC, DOCX)     │
│ [Choose File] resume.pdf ✓          │
│                                     │
│ Portfolio URL (optional)            │
│ [https://github.com/...]           │
│                                     │
│ LinkedIn URL (optional)             │
│ [https://linkedin.com/...]         │
│                                     │
│         [Cancel] [Submit →]        │
└─────────────────────────────────────┘
```

---

## ⬆️ Step 4: User Uploads Resume & Submits

**Frontend Action:**
```javascript
handleSubmit(event) {
  // Validate form
  if (!resumeFile) throw error
  
  // Create FormData with file
  const formData = new FormData()
  formData.append('resume', resumeFile)
  formData.append('full_name', 'John Doe')
  formData.append('email', 'john@example.com')
  // ... other fields
  
  // Call API
  careersAPI.submitApplication(formData)
}
```

**Backend Processing:**
```python
# Django: JobApplicationViewSet.create()
POST /api/v1/careers/applications/

# Request received:
{
  "job_posting": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "9999999999",
  "years_of_experience": 3,
  "cover_letter": "...",
  "skills": "Python, Django, React",
  "resume": <binary PDF file>,
  "portfolio_url": "https://github.com/...",
  "linkedin_url": "https://linkedin.com/..."
}

# Processing:
1. File validation - check type (pdf/doc/docx), size (<5MB)
2. Create JobApplication record
3. Set status = 'SUBMITTED'
4. Set user = authenticated user
5. Save uploaded file to media/resumes/
6. Return response with created application ID
```

**File Storage:**
```
backend/media/resumes/
├── resumesXXXXXX.pdf  (actual file from upload)
└── (auto-generated unique filename)
```

**Database Entry Created:**
```
careers_jobapplication
├── id: 1
├── job_posting_id: 1 (Senior Developer job)
├── user_id: 5 (John Doe, the authenticated user)
├── full_name: "John Doe"
├── email: "john@example.com"
├── phone: "9999999999"
├── years_of_experience: 3
├── cover_letter: "I am passionate about..."
├── skills: "Python, Django, React"
├── resume: "resumes/resumesABC123.pdf"
├── portfolio_url: "https://github.com/..."
├── linkedin_url: "https://linkedin.com/..."
├── status: "SUBMITTED"
├── admin_notes: null
├── applied_at: 2026-02-12 10:30:00 UTC
└── updated_at: 2026-02-12 10:30:00 UTC
```

**Frontend Response:**
```
✓ Application submitted successfully!
[Modal closes after 2 seconds]
User returns to job details
Application count increments to 6
```

---

## 👨‍💼 Step 5: Admin Reviews Applications

**Admin URL:** `http://localhost:3000/admin` or Django admin

**What Admin Sees:**
```
Admin Dashboard > Careers > Applications Tab

┌──────────────────────────────────┐
│ John Doe                         │
│ Senior Developer job             │ [Status ▼]
│ john@example.com • 9999999999    │ [Download]
└──────────────────────────────────┘
```

**Admin Actions:**

### 1) Change Application Status
```javascript
// Dropdown options in Applications list:
SUBMITTED (current)
  ↓
UNDER_REVIEW
SHORTLISTED
REJECTED
ACCEPTED

// Admin selects: UNDER_REVIEW
careersAPI.changeApplicationStatus(appId, 'UNDER_REVIEW')
```

**Backend:**
```python
POST /api/v1/careers/applications/1/change_status/
{
  "status": "UNDER_REVIEW"
}

# Updates database:
UPDATE careers_jobapplication 
SET status = 'UNDER_REVIEW', updated_at = NOW()
WHERE id = 1
```

### 2) Download Resume
```javascript
// Admin clicks download icon
const resumeUrl = careersAPI.downloadResume(appId)
// Opens: /api/v1/careers/applications/1/download_resume/
// Returns: {"resume_url": "http://...../media/resumes/resumesABC123.pdf"}
```

### 3) Add Admin Notes
```javascript
// Admin updates application with notes
careersAPI.updateApplication(appId, {
  admin_notes: "Great technical skills, schedule interview with CEO"
})

PUT /api/v1/careers/applications/1/
{
  "admin_notes": "Great technical skills..."
}
```

---

## 📊 Step 6: Check Job Statistics

**Admin URL:** Job Details in Application

**API Call:**
```
GET /api/v1/careers/job-postings/1/statistics/
```

**Response:**
```json
{
  "total_applications": 6,
  "submitted": 1,
  "under_review": 2,
  "shortlisted": 2,
  "accepted": 1,
  "rejected": 0
}
```

**Dashboard Display:**
```
Senior Developer - Job Statistics
├─ Total Applications: 6
├─ Submitted: 1
├─ Under Review: 2
├─ Shortlisted: 2
├─ Accepted: 1
└─ Rejected: 0
```

---

## 🔄 Complete Data Flow Diagram

```
USER ACTIONS                 FRONTEND              BACKEND              DATABASE
    │                           │                      │                    │
    ├─ Opens /careers ──────→ Careers.tsx ────→ GET /job-postings/ ──→ SQL Query
    │                           │                      │                    │
    │                           └──────── Returns JobPosting[] ←────────────┘
    │
    ├─ Clicks job ──────────→ setSelectedJob ──→ (Local State)
    │                           │
    │                        JobDetails Modal
    │
    ├─ Clicks Apply ────────→ JobApplicationForm Modal
    │                           │
    ├─ Fills form           Forms validation
    │  + Uploads resume
    │
    ├─ Submits ─────────────→ careersAPI.submitApplication()
    │                           │
    │                           ├─ File size check (< 5MB)
    │                           ├─ File type check (.pdf, .doc, .docx)
    │                           │
    │                           └─→ POST /applications/ ────→ Validate data
    │                                   │                      │
    │                                   │                      ├─ Save file
    │                                   │                      ├─ Create record
    │                                   │                      │
    │                         Returns {                   INSERT INTO
    │                           id: 1,                    careers_jobapplication
    │                           status: SUBMITTED              │
    │                         }                                │
    │                           │                              │
    │ ← ← ← ← ← ← ← ← ← Success message ← ← ← ← ← ← ← ← ← ←─┘
    │
    │ [Meanwhile, Admin visits Dashboard]
    │
    ├─ Admin views apps ────→ AdminCareers.tsx ────→ GET /applications/all_applications/
    │                           │                      │
    │                           │                      └──→ SQL Query
    │                           │
    │                        Applications List
    │                           │
    ├─ Admin changes status ─→ handleChangeApplicationStatus()
    │                           │
    │                           └─→ POST /applications/1/change_status/ ──→ UPDATE
    │                                   │                                      │
    │                                   └────────── Success ──────────────────┘
```

---

## 💾 Database Relationships

```
┌─────────────────────┐
│   users_user        │
├─────────────────────┤
│ id (PK)             │
│ username            │
│ email               │
│ role                │
└──────┬──────────────┘
       │
       │ (posts jobs)
       ↓
┌─────────────────────────────────┐
│  careers_jobposting             │
├─────────────────────────────────┤
│ id (PK)                         │
│ title                           │
│ status = 'OPEN'                 │
│ posted_by_id (FK) ──────┐       │
│ created_at              │       │
└──────┬────────────────────────┐ │
       │ (applies for)           │ │
       │                         │ │
       ↓                         │ │
┌─────────────────────────────────┐ │
│  careers_jobapplication        │ │
├─────────────────────────────────┤ │
│ id (PK)                        │ │
│ job_posting_id (FK) ←──────────┘ │
│ user_id (FK) ──────────────┐     │
│ resume (file path)         │     │
│ status = 'SUBMITTED'       │     │
│ applied_at                 │     │
└──────┬──────────────────────────┘
       │                         │
       │ (reviews) ┌─────────────┘ (applied by)
       │           │               │
       ↓           ↓               ↓
┌─────────────────────────────────────────┐
│  careers_applicationreview              │
├─────────────────────────────────────────┤
│ id (PK)                                 │
│ application_id (FK, OneToOne)           │
│ reviewed_by_id (FK)                     │
│ rating (1-5)                            │
│ feedback                                │
│ reviewed_at                             │
└─────────────────────────────────────────┘
```

---

## 🔒 Permission Flow

```
Route: GET /api/v1/careers/job-postings/
├─ No authentication needed
├─ Permission: AllowAny for SAFE_METHODS (GET)
└─ Result: Anyone sees open jobs ✓

Route: POST /api/v1/careers/job-postings/
├─ Authentication required: Yes
├─ Permission: IsAdminOrReadOnly (only SUPER_ADMIN)
├─ Check: Is user.role == 'SUPER_ADMIN'?
│   ├─ YES: Allow create ✓
│   └─ NO: Deny with 403 ✗
└─ Result: Only admins can create jobs

Route: GET /api/v1/careers/applications/
├─ Authentication required: Yes
├─ Permission: IsAuthenticated
├─ Query Filter:
│   ├─ If user.role == 'SUPER_ADMIN': Return all
│   └─ Else: Return only user's own applications
└─ Result: Users see their apps, admins see all

Route: GET /api/v1/careers/applications/all_applications/
├─ Authentication required: Yes
├─ Permission: IsAdminUser (SUPER_ADMIN only)
├─ Check: Is user.role == 'SUPER_ADMIN'?
│   ├─ YES: Return all applications ✓
│   └─ NO: Deny with 403 ✗
└─ Result: Only admins can see all applications
```

---

## 📈 File Size Validation Flow

```
User uploads: resume.pdf (3.5 MB)
   │
   ├─ Frontend validation (JobApplicationForm.tsx)
   │  ├─ File type check
   │  │  ├─ application/pdf ✓
   │  │  ├─ application/msword ✓
   │  │  └─ application/vnd.openxmlformats... ✓
   │  │
   │  └─ File size check
   │     ├─ file.size = 3.5 * 1024 * 1024 bytes
   │     ├─ max = 5 * 1024 * 1024 bytes
   │     ├─ 3.5 < 5? YES ✓
   │     └─ Continue to upload
   │
   ├─ API call: POST /applications/ with FormData
   │  └─ Sends multipart/form-data
   │
   ├─ Backend validation (models.py)
   │  └─ FileExtensionValidator(['pdf', 'doc', 'docx'])
   │     └─ Checks file extension
   │
   ├─ File saved to disk
   │  └─ backend/media/resumes/resumesXXXXXX.pdf
   │
   └─ Database record created
      └─ careers_jobapplication.resume = "resumes/resumesXXXXXX.pdf"
```

---

## ✅ Success Flow Summary

```
User applies for job
      ↓
Form validates ✓
      ↓
Resume validates ✓
      ↓
API POST request sent ✓
      ↓
Backend processes ✓
      ↓
File saved ✓
      ↓
DB record created ✓
      ↓
Response returned ✓
      ↓
User sees success message ✓
      ↓
Application appears in admin dashboard ✓
      ↓
Admin can download resume ✓
      ↓
Admin can change status ✓
      ↓
Process complete ✓
```

---

**This example covers the complete journey from browsing to admin review!**
