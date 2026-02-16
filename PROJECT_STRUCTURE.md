# News Portal Project Structure & Requirements

## Project Overview
A multi-language news portal similar to sandesh.com with Django backend, React frontend, and PostgreSQL database.

---

## Technology Stack

### Backend
- **Framework**: Django 5.2.5
- **Database**: PostgreSQL 
- **API**: Django REST Framework
- **Authentication**: JWT (djangorestframework-simplejwt)
- **File Storage**: Django FileField/ImageField (or AWS S3 for production)
- **Translation**: django-modeltranslation or custom i18n

### Frontend
- **Framework**: React.js
- **State Management**: Redux Toolkit or Context API
- **Routing**: React Router
- **HTTP Client**: Axios
- **UI Library**: Material-UI or Tailwind CSS
- **Translation**: react-i18next

### Database
- **PostgreSQL** (production)
- **SQLite** (development - optional)

---

## Backend Django Structure

### Project Structure
```
backend/
├── backend/                    # Main project folder
│   ├── __init__.py
│   ├── settings.py            # Django settings
│   ├── urls.py                # Main URL configuration
│   ├── wsgi.py
│   ├── asgi.py
│   └── local_settings.py      # Local environment variables
│
├── manage.py
├── requirements.txt
├── .env                        # Environment variables
│
├── news/                       # Main news app
│   ├── __init__.py
│   ├── models.py              # News, Category, Section models
│   ├── admin.py               # Admin panel configuration
│   ├── views.py               # API views
│   ├── serializers.py         # DRF serializers
│   ├── urls.py                # News app URLs
│   ├── permissions.py         # Custom permissions
│   ├── filters.py             # Filtering logic
│   └── migrations/
│
├── users/                      # User management app
│   ├── __init__.py
│   ├── models.py              # Custom User model (SuperAdmin, Editor, User)
│   ├── admin.py
│   ├── views.py               # Authentication views
│   ├── serializers.py         # User serializers
│   ├── urls.py
│   ├── permissions.py         # Role-based permissions
│   └── migrations/
│
├── media/                      # Media files (images, videos)
│   ├── news_images/
│   ├── reels/
│   └── advertisements/
│
├── static/                     # Static files
│   ├── css/
│   ├── js/
│   └── images/
│
├── advertisements/             # Advertisement management
│   ├── __init__.py
│   ├── models.py              # Advertisement model
│   ├── admin.py
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   └── migrations/
│
├── contact/                    # Contact form app
│   ├── __init__.py
│   ├── models.py              # ContactMessage model
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   └── migrations/
│
├── analytics/                  # Analytics & tracking
│   ├── __init__.py
│   ├── models.py              # View counts, likes, etc.
│   ├── views.py
│   └── migrations/
│
└── utils/                      # Utility functions
    ├── __init__.py
    ├── permissions.py         # Shared permission classes
    ├── helpers.py             # Helper functions
    └── constants.py           # Constants (languages, sections, etc.)
```

---

## Database Models

### 1. Users App (`users/models.py`)

#### Custom User Model
```python
# Extend Django's AbstractUser
- username
- email
- password
- role (SUPER_ADMIN, EDITOR, USER)
- phone_number
- profile_picture
- is_active
- date_joined
- last_login
```

### 2. News App (`news/models.py`)

#### Category Model
```python
- id
- name (English, Hindi, Gujarati)
- slug
- description
- created_at
- updated_at
```

#### Section Model
```python
- id
- name (English, Hindi, Gujarati)
- slug
- parent_section (for Gujarat -> Daxin, Utar, etc.)
- created_at
```

#### News Article Model
```python
- id
- title (English, Hindi, Gujarati)
- slug
- content (English, Hindi, Gujarati)
- summary/excerpt
- featured_image
- category (ForeignKey)
- section (ForeignKey)
- author (ForeignKey to User)
- status (DRAFT, PUBLISHED, ARCHIVED)
- is_breaking_news (Boolean)
- is_top_news (Boolean)
- views_count
- likes_count
- published_at
- created_at
- updated_at
- tags (ManyToMany)
- language (EN, HI, GU)
```

#### Media Model (for Reels/Videos)
```python
- id
- news_article (ForeignKey, nullable)
- media_type (IMAGE, VIDEO, REEL, YOUTUBE)
- file_url
- youtube_url (for YouTube videos)
- thumbnail
- duration (for videos)
- caption
- order (for multiple media)
- created_at
```

#### Tag Model
```python
- id
- name
- slug
- created_at
```

#### Like Model
```python
- id
- user (ForeignKey)
- news_article (ForeignKey)
- created_at
```

#### Comment Model (Optional)
```python
- id
- user (ForeignKey)
- news_article (ForeignKey)
- content
- parent_comment (for replies)
- created_at
- updated_at
```

### 3. Advertisements App (`advertisements/models.py`)

#### Advertisement Model
```python
- id
- title
- advertiser_name
- advertiser_email
- advertiser_phone
- ad_type (BANNER, SIDEBAR, IN_ARTICLE, POPUP)
- image_url
- video_url
- link_url
- start_date
- end_date
- is_active
- position (TOP, SIDEBAR_LEFT, SIDEBAR_RIGHT, FOOTER)
- click_count
- impression_count
- created_at
- updated_at
```

#### Advertisement Request Model
```python
- id
- advertiser_name
- advertiser_email
- advertiser_phone
- company_name
- ad_type
- budget
- message
- status (PENDING, APPROVED, REJECTED)
- created_at
```

### 4. Contact App (`contact/models.py`)

#### ContactMessage Model
```python
- id
- name
- email
- phone
- subject
- message
- is_read
- created_at
```

### 5. Analytics App (`analytics/models.py`)

#### NewsView Model
```python
- id
- news_article (ForeignKey)
- user (ForeignKey, nullable for anonymous)
- ip_address
- user_agent
- viewed_at
```

---

## API Endpoints Structure

### Authentication (`users/urls.py`)
```
POST   /api/auth/register/              # User registration
POST   /api/auth/login/                 # Login (JWT tokens)
POST   /api/auth/logout/                # Logout
POST   /api/auth/refresh/               # Refresh JWT token
GET    /api/auth/me/                    # Get current user
PUT    /api/auth/profile/               # Update profile
```

### News (`news/urls.py`)
```
GET    /api/news/                       # List all news (with filters)
GET    /api/news/breaking/              # Breaking news
GET    /api/news/top/                   # Top news
GET    /api/news/{id}/                  # News detail
POST   /api/news/                       # Create news (Editor/Admin)
PUT    /api/news/{id}/                  # Update news (Editor/Admin)
DELETE /api/news/{id}/                  # Delete news (Admin only)
GET    /api/news/categories/            # List categories
GET    /api/news/sections/              # List sections
GET    /api/news/section/{slug}/        # News by section
GET    /api/news/category/{slug}/       # News by category
GET    /api/news/search/                # Search news
POST   /api/news/{id}/like/            # Like/Unlike news
GET    /api/news/{id}/views/           # Track view
```

### Media (`news/urls.py`)
```
POST   /api/media/                      # Upload media (Editor/Admin)
GET    /api/media/{id}/                 # Get media
DELETE /api/media/{id}/                 # Delete media (Editor/Admin)
```

### Advertisements (`advertisements/urls.py`)
```
GET    /api/ads/                        # List active ads
GET    /api/ads/{id}/                   # Ad detail
POST   /api/ads/                        # Create ad (Admin)
PUT    /api/ads/{id}/                   # Update ad (Admin)
DELETE /api/ads/{id}/                   # Delete ad (Admin)
POST   /api/ads/request/                # Submit ad request
GET    /api/ads/requests/               # List ad requests (Admin)
PUT    /api/ads/requests/{id}/          # Approve/Reject request (Admin)
```

### Contact (`contact/urls.py`)
```
POST   /api/contact/                    # Submit contact form
GET    /api/contact/messages/           # List messages (Admin)
GET    /api/contact/messages/{id}/      # Message detail (Admin)
PUT    /api/contact/messages/{id}/read/ # Mark as read (Admin)
```

### About/Static Pages
```
GET    /api/about/                      # About page content
GET    /api/address/                    # Address & map data
```

---

## Frontend React Structure

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
│
├── src/
│   ├── components/              # Reusable components
│   │   ├── Layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── News/
│   │   │   ├── NewsCard.jsx
│   │   │   ├── NewsDetail.jsx
│   │   │   ├── NewsList.jsx
│   │   │   └── BreakingNews.jsx
│   │   ├── Media/
│   │   │   ├── VideoPlayer.jsx
│   │   │   └── ReelPlayer.jsx
│   │   ├── Advertisement/
│   │   │   └── AdBanner.jsx
│   │   ├── Language/
│   │   │   └── LanguageSwitcher.jsx
│   │   └── Common/
│   │       ├── Button.jsx
│   │       ├── Loading.jsx
│   │       └── Error.jsx
│   │
│   ├── pages/                   # Page components
│   │   ├── Home.jsx
│   │   ├── News/
│   │   │   ├── NewsListPage.jsx
│   │   │   ├── NewsDetailPage.jsx
│   │   │   └── SectionPage.jsx
│   │   ├── Admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── NewsManagement.jsx
│   │   │   ├── AdManagement.jsx
│   │   │   └── UserManagement.jsx
│   │   ├── Editor/
│   │   │   └── EditorDashboard.jsx
│   │   ├── Contact.jsx
│   │   ├── About.jsx
│   │   └── AdvertisementForm.jsx
│   │
│   ├── services/                # API calls
│   │   ├── api.js              # Axios instance
│   │   ├── auth.js
│   │   ├── news.js
│   │   ├── ads.js
│   │   └── contact.js
│   │
│   ├── store/                   # Redux store (if using Redux)
│   │   ├── slices/
│   │   │   ├── authSlice.js
│   │   │   ├── newsSlice.js
│   │   │   └── languageSlice.js
│   │   └── store.js
│   │
│   ├── context/                 # Context API (if using Context)
│   │   ├── AuthContext.jsx
│   │   ├── LanguageContext.jsx
│   │   └── NewsContext.jsx
│   │
│   ├── hooks/                   # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useNews.js
│   │   └── useLanguage.js
│   │
│   ├── utils/                   # Utility functions
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── i18n.js             # Translation setup
│   │
│   ├── locales/                 # Translation files
│   │   ├── en/
│   │   │   └── translation.json
│   │   ├── hi/
│   │   │   └── translation.json
│   │   └── gu/
│   │       └── translation.json
│   │
│   ├── styles/                  # CSS/SCSS files
│   │   ├── main.css
│   │   └── components/
│   │
│   ├── App.jsx
│   ├── index.js
│   └── routes.jsx              # React Router configuration
│
├── package.json
└── .env                         # Frontend environment variables
```

---

## PostgreSQL Database Setup

### Database Configuration (`backend/backend/settings.py`)
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'news_portal_db',
        'USER': 'your_db_user',
        'PASSWORD': 'your_db_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### Required PostgreSQL Extensions
- No special extensions needed for basic setup
- Consider `pg_trgm` for better search performance

---

## Django Settings Requirements

### Installed Apps (`backend/backend/settings.py`)
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',                    # For CORS
    'django_filters',                 # For filtering
    'django_modeltranslation',        # For translations (optional)
    
    # Local apps
    'users',
    'news',
    'advertisements',
    'contact',
    'analytics',
]
```

### Middleware
```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # Add CORS middleware
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.locale.LocaleMiddleware',  # For translations
]
```

### Media & Static Files
```python
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
```

### REST Framework Configuration
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
}
```

---

## Required Python Packages (`requirements.txt`)

```
Django==5.2.5
djangorestframework==3.15.2
djangorestframework-simplejwt==5.3.1
django-cors-headers==4.3.1
django-filter==24.2
psycopg2-binary==2.9.9
python-decouple==3.8
Pillow==10.4.0
django-modeltranslation==0.18.12  # Optional for translations
django-extensions==3.2.3          # Optional utilities
```

---

## Required React Packages (`package.json`)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "react-i18next": "^13.5.0",
    "i18next": "^23.7.6",
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4",
    "react-player": "^2.13.0",
    "react-infinite-scroll-component": "^6.1.0"
  }
}
```

---

## File Requirements Summary

### Backend Files to Create/Modify

1. **Settings & Configuration**
   - `backend/backend/settings.py` - Update with PostgreSQL, DRF, CORS
   - `backend/backend/urls.py` - Add app URLs
   - `backend/.env` - Environment variables
   - `backend/requirements.txt` - Python dependencies

2. **Users App**
   - `backend/users/models.py` - Custom User model with roles
   - `backend/users/admin.py` - Admin configuration
   - `backend/users/serializers.py` - User serializers
   - `backend/users/views.py` - Authentication views
   - `backend/users/urls.py` - Auth endpoints
   - `backend/users/permissions.py` - Role-based permissions

3. **News App**
   - `backend/news/models.py` - News, Category, Section, Media, Like models
   - `backend/news/admin.py` - Admin for news management
   - `backend/news/serializers.py` - News serializers
   - `backend/news/views.py` - News API views
   - `backend/news/urls.py` - News endpoints
   - `backend/news/filters.py` - Filtering logic
   - `backend/news/permissions.py` - News permissions

4. **Advertisements App**
   - `backend/advertisements/models.py` - Advertisement models
   - `backend/advertisements/admin.py`
   - `backend/advertisements/serializers.py`
   - `backend/advertisements/views.py`
   - `backend/advertisements/urls.py`

5. **Contact App**
   - `backend/contact/models.py` - ContactMessage model
   - `backend/contact/admin.py`
   - `backend/contact/serializers.py`
   - `backend/contact/views.py`
   - `backend/contact/urls.py`

6. **Analytics App**
   - `backend/analytics/models.py` - View tracking
   - `backend/analytics/views.py`

7. **Utils**
   - `backend/utils/permissions.py` - Shared permissions
   - `backend/utils/constants.py` - Constants (languages, roles, sections)

### Frontend Files to Create

1. **Core**
   - `frontend/src/App.jsx` - Main app component
   - `frontend/src/index.js` - Entry point
   - `frontend/src/routes.jsx` - Route configuration

2. **Components** (as listed in structure above)
3. **Pages** (as listed in structure above)
4. **Services** - API integration files
5. **Store/Context** - State management
6. **Locales** - Translation JSON files
7. **Styles** - CSS/SCSS files

---

## Implementation Steps

### Phase 1: Backend Setup
1. Install PostgreSQL and create database
2. Update Django settings for PostgreSQL
3. Install required packages
4. Create all Django apps (users, news, advertisements, contact, analytics)
5. Create models for each app
6. Run migrations
7. Create serializers
8. Create API views
9. Set up URL routing
10. Configure permissions
11. Set up JWT authentication
12. Test API endpoints

### Phase 2: Frontend Setup
1. Create React app
2. Install required packages
3. Set up routing
4. Create layout components (Navbar, Footer)
5. Set up state management
6. Create API service layer
7. Implement language switching
8. Create news display components
9. Create admin/editor dashboards
10. Integrate Google AdSense
11. Add contact and advertisement forms
12. Style with CSS/UI library

### Phase 3: Integration
1. Connect frontend to backend APIs
2. Implement authentication flow
3. Add media upload functionality
4. Integrate YouTube/reels players
5. Add like/view tracking
6. Implement search and filtering
7. Add pagination
8. Test all features

### Phase 4: Deployment
1. Configure production settings
2. Set up static file serving
3. Deploy backend (Heroku, AWS, etc.)
4. Deploy frontend (Vercel, Netlify, etc.)
5. Configure domain and SSL
6. Set up monitoring

---

## Key Features Implementation Notes

### Multi-language Support
- Use `django-modeltranslation` or custom translation fields
- Frontend: Use `react-i18next` for UI translations
- Store translations in database or JSON files
- Language switcher component in navbar

### Role-Based Access Control
- Super Admin: All permissions
- Editor: Create/Update news, manage own content
- User: Read news, like, comment (if implemented)

### Google AdSense Integration
- Add AdSense script in React `index.html`
- Create ad placement components
- Configure ad slots in backend (optional)

### Media Handling
- Use Django FileField for images/videos
- For YouTube: Store video ID, use react-player
- For reels: Store video file or URL
- Implement thumbnail generation

### Breaking News & Top News
- Add boolean fields in News model
- Filter API endpoints for breaking/top news
- Display prominently on homepage

### Sections & Categories
- Hierarchical structure for Gujarat regions
- Filter news by section/category
- Dynamic navbar based on sections

---

## Environment Variables

### Backend (`.env`)
```
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_NAME=news_portal_db
DATABASE_USER=your_user
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

### Frontend (`.env`)
``` 
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_GOOGLE_ADSENSE_ID=your-adsense-id
```

---

This structure provides a complete roadmap for building your news portal. Start with backend models and APIs, then move to frontend implementation.
