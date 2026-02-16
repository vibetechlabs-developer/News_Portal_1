# 🚀 Quick Start: Dynamic Careers System

## Setup Instructions

### Step 1: Verify Backend Setup ✅

The Django app is already created and configured. Just verify:

```bash
# Check if migrations exist
cd backend
python manage.py showmigrations careers

# Run migrations (if not already done)
python manage.py migrate careers
```

### Step 2: Create Test Data (Optional)

Create a sample job through the Django admin:

1. Start the server: `python manage.py runserver`
2. Go to: `http://localhost:8000/admin/`
3. Login with admin credentials
4. Navigate to **Careers > Job Postings**
5. Click **Add Job Posting**
6. Fill in details:
   - Title: "Senior Developer"
   - Description: "We are hiring experienced developers"
   - Requirements: "5+ years Python, Django experience"
   - Responsibilities: "Develop and maintain APIs"
   - Location: "Ahmedabad"
   - Job Type: "Full Time"
   - Category: "Engineering"
   - Status: "Open"
7. Save

### Step 3: Update Admin Dashboard (Optional but Recommended)

To add the Careers tab to the Admin Dashboard:

1. Open: `src/pages/AdminDashboard.tsx`
2. Add import at top:
   ```tsx
   import AdminCareers from '@/components/careers/AdminCareers';
   ```
3. Change line 897 from `grid-cols-8` to `grid-cols-9`
4. Add a new tab trigger before users tab:
   ```tsx
   <TabsTrigger value="careers" disabled={!isSuperAdmin}>Careers</TabsTrigger>
   ```
5. Add a new TabsContent before closing `</Tabs>`:
   ```tsx
   <TabsContent value="careers" className="space-y-4">
     <Card>
       <CardHeader>
         <CardTitle>Careers Management</CardTitle>
         <CardDescription>Manage job postings and applications.</CardDescription>
       </CardHeader>
       <CardContent>
         <AdminCareers />
       </CardContent>
     </Card>
   </TabsContent>
   ```

### Step 4: Start the Application

```bash
# Terminal 1 - Backend
cd backend
python manage.py runserver

# Terminal 2 - Frontend
cd kanam_express\ copy
npm run dev
```

---

## Testing Workflow

### As a Regular User:

1. **Browse Jobs:**
   - Go to: `http://localhost:3000/careers`
   - You should see open job postings
   - Try filtering by job type

2. **View Job Details:**
   - Click on any job card
   - See full details including salary, location, requirements

3. **Apply for a Job:**
   - Click "Apply Now"
   - Fill in personal information
   - Select your resume file (PDF/DOC/DOCX)
   - Add optional portfolio & LinkedIn links
   - Submit
   - You should see a success message

4. **Check Application Status:**
   - Login if not already
   - Go to `/careers`
   - You can see the applied job (if implemented)

### As Admin:

1. **Access Admin Dashboard:**
   - Go to: `http://localhost:3000/admin` (or AdminDashboard tab)
   - Login as Super Admin

2. **Manage Job Postings:**
   - Go to Careers tab → Job Postings
   - Create new job
   - Edit existing job
   - Delete job

3. **Review Applications:**
   - Go to Careers tab → Applications
   - See all applicants
   - Change application status
   - Download resume

4. **Via Django Admin:**
   - Go to: `http://localhost:8000/admin/careers/`
   - View all models
   - Manage from there

---

## API Testing (Using curl or Postman)

### Get Open Jobs:
```bash
curl http://localhost:8000/api/v1/careers/job-postings/open_positions/
```

### Create Job (Admin):
```bash
curl -X POST http://localhost:8000/api/v1/careers/job-postings/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Job",
    "description": "Test description",
    "requirements": "Test requirements",
    "responsibilities": "Test responsibilities",
    "location": "Ahmedabad",
    "job_type": "FULL_TIME",
    "category": "ENGINEERING",
    "status": "OPEN"
  }'
```

### Submit Application:
```bash
curl -X POST http://localhost:8000/api/v1/careers/applications/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "job_posting=1" \
  -F "full_name=John Doe" \
  -F "email=john@example.com" \
  -F "phone=9999999999" \
  -F "years_of_experience=3" \
  -F "skills=Python,Django" \
  -F "cover_letter=I want to work here" \
  -F "resume=@/path/to/resume.pdf"
```

### Get All Applications (Admin):
```bash
curl http://localhost:8000/api/v1/careers/applications/all_applications/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Common Issues & Solutions

### Issue: File upload fails
- **Solution**: Check media folder permissions: `chmod 755 backend/media/`

### Issue: API returns 404
- **Solution**: Verify app is registered in `settings.py` INSTALLED_APPS

### Issue: Can't see Careers tab in admin
- **Solution**: Make sure you're logged in as SUPER_ADMIN user

### Issue: Resume file not saving
- **Solution**: Ensure file is PDF, DOC, or DOCX (not DOCM, etc.)

---

## Database Verification

Check if tables are created:

```bash
python manage.py dbshell
# Inside postgres shell:
\dt careers_*
# You should see three tables:
# - careers_jobposting
# - careers_jobapplication  
# - careers_applicationreview
```

---

## What's Working ✅

- [x] Job CRUD operations (Create, Read, Update, Delete)
- [x] User job applications with resume upload
- [x] Application status tracking
- [x] Admin application review
- [x] Job filtering by type and status
- [x] Bilingual support (English/Gujarati)
- [x] Mobile responsive design
- [x] File validation (resume)
- [x] API permissions and authentication
- [x] Django admin interface

---

## Next Steps

1. **Add More Features:**
   - Email notifications when application status changes
   - Job alerts based on user preferences
   - Interview scheduling
   - Skill matching algorithm

2. **Customization:**
   - Add more job categories
   - Add salary negotiation
   - Add employee referral system
   - Add job recommendations

3. **Deployment:**
   - Configure media upload to S3/CloudStorage
   - Setup email service (SendGrid, etc.)
   - Configure production database
   - Add logging and monitoring

---

## Support

Having issues? Check:
1. Console for JavaScript errors
2. Network tab for API errors
3. Django logs: `python manage.py tail`
4. Database connection

Happy hiring! 🎉
