# Step-by-Step Data Entry Guide

This guide will help you add data to your database and verify it appears in the frontend.

---

## Step 1: Start the Backend Server

1. Open PowerShell or Terminal
2. Navigate to your project directory:
   ```powershell
   cd D:\News_Portal
   ```
3. Activate virtual environment:
   ```powershell
   .\venv\Scripts\activate
   ```
4. Navigate to backend:
   ```powershell
   cd backend
   ```
5. Start the server:
   ```powershell
   python manage.py runserver
   ```
   Backend will run on **http://localhost:8000**

---

## Step 2: Create a Superuser (if you don't have one)

1. In a new terminal/PowerShell window, navigate to backend:
   ```powershell
   cd D:\News_Portal\backend
   .\..\venv\Scripts\activate
   ```
2. Create superuser:
   ```powershell
   python manage.py createsuperuser
   ```
3. Follow the prompts:
   - Username: `admin` (or your choice)
   - Email: `admin@example.com` (or your choice)
   - Password: `admin123` (or a secure password)
   - Confirm password: (same as above)

---

## Step 3: Access Django Admin

1. Open browser and go to: **http://localhost:8000/admin/**
2. Login with your superuser credentials
3. You'll see the admin dashboard

---

## Step 4: Add Sections (Required for Articles)

Sections are like main categories (Gujarat, National, International, etc.)

### Add Section 1: Gujarat
1. Click on **Sections** → **Add Section**
2. Fill in:
   - **Name en**: `Gujarat`
   - **Name gu**: `ગુજરાત`
   - **Name hi**: `गुजरात` (optional)
   - **Slug**: `gujarat` (auto-generated, but verify)
   - **Order**: `1`
   - **Is active**: ✅ (checked)
   - **Parent**: (leave blank)
3. Click **Save**

### Add Section 2: National
1. Click **Add Section** again
2. Fill in:
   - **Name en**: `National`
   - **Name gu**: `રાષ્ટ્રીય`
   - **Name hi**: `राष्ट्रीय` (optional)
   - **Slug**: `national`
   - **Order**: `2`
   - **Is active**: ✅
   - **Parent**: (leave blank)
3. Click **Save**

### Add More Sections:
- **International**: Name en: `International`, Name gu: `આંતરરાષ્ટ્રીય`, Slug: `international`, Order: `3`
- **Business**: Name en: `Business`, Name gu: `બિઝનેસ`, Slug: `business`, Order: `4`
- **Sports**: Name en: `Sports`, Name gu: `રમતગમત`, Slug: `sports`, Order: `5`
- **Entertainment**: Name en: `Entertainment`, Name gu: `મનોરંજન`, Slug: `entertainment`, Order: `6`
- **Technology**: Name en: `Technology`, Name gu: `ટેકનોલોજી`, Slug: `technology`, Order: `7`

---

## Step 5: Add Categories (Optional but Recommended)

Categories provide finer grouping within sections.

1. Click on **Categories** → **Add Category**
2. Add these categories:

**Category 1: Politics**
- **Name en**: `Politics`
- **Name gu**: `રાજકારણ`
- **Slug**: `politics`
- **Is active**: ✅

**Category 2: Economy**
- **Name en**: `Economy`
- **Name gu**: `અર્થતંત્ર`
- **Slug**: `economy`
- **Is active**: ✅

**Category 3: Cricket**
- **Name en**: `Cricket`
- **Name gu**: `ક્રિકેટ`
- **Slug**: `cricket`
- **Is active**: ✅

---

## Step 6: Add Tags (Optional)

Tags help with search and trending topics.

1. Click on **Tags** → **Add Tag**
2. Add these tags:
   - **Name**: `Gujarat`, **Slug**: `gujarat` (auto-generated)
   - **Name**: `Budget2024`, **Slug**: `budget2024`
   - **Name**: `Cricket`, **Slug**: `cricket`
   - **Name**: `Election`, **Slug**: `election`
   - **Name**: `Technology`, **Slug**: `technology`

---

## Step 7: Add News Articles

This is the main content that will appear on your frontend!

### Article 1: Breaking News for Gujarat

1. Click on **News articles** → **Add News article**

2. Fill in the form:

   **Basic Information:**
   - **Title en**: `Gujarat Assembly Passes Historic Education Bill`
   - **Title gu**: `ગુજરાત વિધાનસભાએ ઐતિહાસિક શિક્ષણ બિલ પસાર કર્યું`
   - **Title hi**: `गुजरात विधानसभा ने ऐतिहासिक शिक्षा विधेयक पारित किया` (optional)
   - **Slug**: `gujarat-assembly-passes-historic-education-bill` (auto-generated)

   **Content:**
   - **Summary en**: `In a historic session, the Gujarat Legislative Assembly passed a landmark education bill that will transform the state's education sector.`
   - **Summary gu**: `એક ઐતિહાસિક સત્રમાં, ગુજરાત વિધાનસભાએ એક મહત્વપૂર્ણ શિક્ષણ બિલ પસાર કર્યું જે રાજ્યના શિક્ષણ ક્ષેત્રને પરિવર્તિત કરશે.`
   - **Content en**: 
     ```
     The Gujarat Legislative Assembly today passed a historic education bill that aims to revolutionize the state's education system. The bill, which received unanimous support from all parties, focuses on improving infrastructure, teacher training, and student outcomes.

     Chief Minister addressed the assembly, stating that this bill will ensure quality education for all children in Gujarat. The legislation includes provisions for digital classrooms, improved teacher-student ratios, and enhanced vocational training programs.

     Education Minister highlighted that the bill will be implemented in phases over the next three years, with an estimated budget of ₹5,000 crores allocated for the initiative.
     ```
   - **Content gu**: 
     ```
     ગુજરાત વિધાનસભાએ આજે એક ઐતિહાસિક શિક્ષણ બિલ પસાર કર્યું જે રાજ્યની શિક્ષણ પ્રણાલીમાં ક્રાંતિકારી ફેરફાર લાવશે. બિલ, જેને બધી પક્ષોએ સર્વાનુમતે સમર્થન આપ્યું, તે માળખાગત સુધારા, શિક્ષક તાલીમ અને વિદ્યાર્થી પરિણામો પર ધ્યાન કેન્દ્રિત કરે છે.

     મુખ્યમંત્રીએ વિધાનસભામાં કહ્યું કે આ બિલ ગુજરાતના બધા બાળકો માટે ગુણવત્તાપૂર્ણ શિક્ષણની ખાતરી કરશે. કાયદામાં ડિજિટલ ક્લાસરૂમ, સુધારેલ શિક્ષક-વિદ્યાર્થી ગુણોત્તર અને વધારેલ વ્યાવસાયિક તાલીમ કાર્યક્રમો માટેની જોગવાઈઓનો સમાવેશ થાય છે.
     ```

   **Relations:**
   - **Section**: Select `Gujarat` (the section you created)
   - **Category**: (optional) Leave blank or select a category
   - **Tags**: Select `Gujarat`, `Election` (hold Ctrl to select multiple)

   **Status & Flags:**
   - **Status**: Select `Published` ⚠️ **IMPORTANT!**
   - **Content type**: `Article`
   - **Primary language**: `GU` (Gujarati)
   - **Is breaking**: ✅ (check this box)
   - **Is top**: ✅ (check this box)
   - **Is featured**: ✅ (check this box)

   **Author:**
   - **Author**: Select your superuser account

   **Featured Image:**
   - **Featured image**: (optional) Upload an image or leave blank

3. Click **Save**

### Article 2: National News

1. Click **Add News article** again

2. Fill in:

   **Basic Information:**
   - **Title en**: `Parliament Winter Session: Discussion on Important Bills`
   - **Title gu**: `સંસદનું શિયાળુ સત્ર: મહત્વના બિલો પર ચર્ચા`
   - **Slug**: `parliament-winter-session-discussion-bills`

   **Content:**
   - **Summary en**: `The winter session of Parliament begins with discussions on several important bills related to economy and governance.`
   - **Summary gu**: `સંસદનું શિયાળુ સત્ર અર્થતંત્ર અને શાસન સંબંધિત અનેક મહત્વના બિલો પર ચર્ચા સાથે શરૂ થાય છે.`
   - **Content en**: 
     ```
     The winter session of Parliament commenced today with intense discussions on several key bills. The session is expected to address critical issues including economic reforms, healthcare policies, and infrastructure development.

     Opposition leaders raised concerns about the pace of legislative work, while the ruling party emphasized the importance of passing bills that will benefit the common man.
     ```
   - **Content gu**: 
     ```
     સંસદનું શિયાળુ સત્ર આજે અનેક મુખ્ય બિલો પર તીવ્ર ચર્ચા સાથે શરૂ થયું. સત્રમાં આર્થિક સુધારા, આરોગ્ય નીતિઓ અને માળખાગત વિકાસ સહિત મહત્વપૂર્ણ મુદ્દાઓનો સામનો કરવાની અપેક્ષા છે.
     ```

   **Relations:**
   - **Section**: Select `National`
   - **Status**: `Published` ⚠️ **IMPORTANT!**
   - **Is top**: ✅

3. Click **Save**

### Article 3: Sports News

1. Click **Add News article**

2. Fill in:

   - **Title en**: `IPL 2024: Gujarat Titans Spectacular Victory`
   - **Title gu**: `IPL 2024: ગુજરાત ટાઇટન્સની શાનદાર જીત`
   - **Slug**: `ipl-2024-gujarat-titans-victory`
   - **Summary en**: `Gujarat Titans secured a spectacular victory in the latest IPL match.`
   - **Summary gu**: `ગુજરાત ટાઇટન્સે તાજેતરની IPL મેચમાં શાનદાર જીત મેળવી.`
   - **Content en**: `Gujarat Titans displayed exceptional performance in their latest match, securing a decisive victory.`
   - **Content gu**: `ગુજરાત ટાઇટન્સે તેમની તાજેતરની મેચમાં અસાધારણ પ્રદર્શન કર્યું, નિર્ણાયક જીત મેળવી.`
   - **Section**: Select `Sports`
   - **Category**: Select `Cricket` (if you created it)
   - **Tags**: Select `Cricket`
   - **Status**: `Published` ⚠️
   - **Is top**: ✅

3. Click **Save**

### Article 4: Business News

1. Click **Add News article**

2. Fill in:

   - **Title en**: `Stock Market: Sensex Hits New High, IT Stocks Rally`
   - **Title gu**: `શેરબજાર: સેન્સેક્સ નવી ઊંચાઈએ, IT શેરોમાં તેજી`
   - **Slug**: `stock-market-sensex-new-high`
   - **Summary en**: `Indian stock markets reached new heights with Sensex crossing 72,000 points.`
   - **Summary gu**: `ભારતીય શેરબજાર સેન્સેક્સ 72,000 પોઈન્ટ પાર કરીને નવી ઊંચાઈએ પહોંચ્યો.`
   - **Content en**: `The Indian stock market witnessed a significant rally today with the Sensex crossing the 72,000 mark for the first time. IT stocks led the gains.`
   - **Content gu**: `ભારતીય શેરબજારે આજે સેન્સેક્સ પહેલી વાર 72,000 ના આંકડાને પાર કરીને નોંધપાત્ર તેજી જોઈ. IT શેરોએ લાભોનું નેતૃત્વ કર્યું.`
   - **Section**: Select `Business`
   - **Status**: `Published` ⚠️
   - **Tags**: Select `Budget2024`

3. Click **Save**

### Article 5: Technology News

1. Click **Add News article**

2. Fill in:

   - **Title en**: `AI Revolution: Future of Technology in India`
   - **Title gu**: `AI ક્રાંતિ: ભારતમાં ટેકનોલોજીનું ભવિષ્ય`
   - **Slug**: `ai-revolution-future-technology-india`
   - **Summary en**: `India is leading the AI revolution with new innovations and startups.`
   - **Summary gu**: `ભારત નવી ઇનોવેશન અને સ્ટાર્ટઅપ્સ સાથે AI ક્રાંતિનું નેતૃત્વ કરી રહ્યું છે.`
   - **Content en**: `India's tech sector is experiencing unprecedented growth in AI and machine learning technologies.`
   - **Content gu**: `ભારતનો ટેક ક્ષેત્ર AI અને મશીન લર્નિંગ ટેકનોલોજીમાં અભૂતપૂર્વ વૃદ્ધિ અનુભવી રહ્યો છે.`
   - **Section**: Select `Technology`
   - **Status**: `Published` ⚠️
   - **Tags**: Select `Technology`

3. Click **Save**

---

## Step 8: Start the Frontend

1. Open a new terminal/PowerShell window
2. Navigate to frontend:
   ```powershell
   cd D:\News_Portal\kanam_express
   ```
3. Install dependencies (if not done):
   ```powershell
   npm install
   ```
4. Start the frontend:
   ```powershell
   npm run dev
   ```
   Frontend will run on **http://localhost:8080**

---

## Step 9: Verify Data in Frontend

1. Open browser: **http://localhost:8080**

2. **Check Homepage (Index):**
   - You should see your breaking news article as the lead story
   - Other articles should appear in the grid below
   - Check the language switcher (English/Gujarati) to see translations

3. **Check Section Pages:**
   - Click on **Gujarat** - You should see your Gujarat article
   - Click on **National** - You should see your National article
   - Click on **Sports** - You should see your Sports article
   - Click on **Business** - You should see your Business article
   - Click on **Technology** - You should see your Technology article

4. **Check Latest News Page:**
   - Click on **Latest** - You should see all your published articles

5. **Check Trending Sidebar:**
   - On any page, check the right sidebar
   - You should see "Top News" with your articles
   - Tags should appear in "Trending Topics"

---

## Step 10: Troubleshooting

### If articles don't appear:

1. **Check Status**: Make sure articles are set to `Published` (not `Draft`)
2. **Check Section**: Verify the section slug matches (e.g., `gujarat`, `national`)
3. **Check Backend**: Ensure backend is running on `http://localhost:8000`
4. **Check Browser Console**: Press F12, check for errors
5. **Check Network Tab**: See if API calls are successful (should return 200 status)

### Common Issues:

- **404 Error**: Section slug doesn't match. Check section slug in admin.
- **Empty Page**: No articles published. Make sure status is `Published`.
- **Images not showing**: Upload featured images or they'll show placeholder.

---

## Quick Test Data Summary

**Sections to Create:**
- Gujarat (slug: `gujarat`)
- National (slug: `national`)
- International (slug: `international`)
- Business (slug: `business`)
- Sports (slug: `sports`)
- Entertainment (slug: `entertainment`)
- Technology (slug: `technology`)

**Articles to Create:**
- At least 1 article per section
- Set status to `Published`
- Add English and Gujarati titles/content
- Set `is_breaking` or `is_top` for featured articles

---

## Next Steps

Once you've verified the basic flow works:

1. Add more articles with different categories
2. Upload featured images for articles
3. Add more tags for better trending topics
4. Create article detail pages (if not already done)
5. Test search functionality
6. Test language switching

---

**Need Help?**
- Check backend logs in terminal
- Check browser console (F12)
- Verify API endpoints: http://localhost:8000/api/docs/
- Test API directly: http://localhost:8000/api/news/articles/
