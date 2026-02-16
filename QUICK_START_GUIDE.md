# Quick Start Guide

## Prerequisites Installation

### 1. Install PostgreSQL
**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Install and set password for `postgres` user
- Note down the password

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Install Python (if not installed)
- Download Python 3.10+ from https://www.python.org/downloads/
- Make sure to check "Add Python to PATH" during installation

### 3. Install Node.js (for React)
- Download Node.js 18+ from https://nodejs.org/
- This includes npm (Node Package Manager)

---

## Backend Setup Commands

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Create Virtual Environment
**Important:** Always activate the virtual environment before running `python manage.py` or `pip`. Otherwise you'll get errors like `ModuleNotFoundError: No module named 'decouple'` because the system Python is used instead of the venv.

**Windows (venv in project root `News_Portal\venv`):**
```bash
# From project root (News_Portal):
venv\Scripts\activate
cd backend
python manage.py runserver
```
Or from `backend` folder:
```bash
..\venv\Scripts\activate
python manage.py runserver
```
Or run without activating: `..\venv\Scripts\python.exe manage.py runserver`

**Windows (venv inside backend):**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Python Packages
```bash
pip install -r requirements.txt
```

If `requirements.txt` doesn't exist, install manually:
```bash
pip install Django==5.2.5
pip install djangorestframework==3.15.2
pip install djangorestframework-simplejwt==5.3.1
pip install django-cors-headers==4.3.1
pip install django-filter==24.2
pip install psycopg2-binary==2.9.9
pip install python-decouple==3.8
pip install Pillow==10.4.0
```

### Step 4: Create PostgreSQL Database
**Using psql (PostgreSQL command line):**
```bash
psql -U postgres
```

Then in psql:
```sql
CREATE DATABASE news_portal_db;
CREATE USER news_user WITH PASSWORD 'your_password';
ALTER ROLE news_user SET client_encoding TO 'utf8';
ALTER ROLE news_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE news_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE news_portal_db TO news_user;
\q
```

**Or using pgAdmin (GUI):**
- Open pgAdmin
- Right-click on "Databases" → Create → Database
- Name: `news_portal_db`
- Save

### Step 5: Configure Django Settings

Update `backend/backend/settings.py`:

1. Add PostgreSQL database configuration:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'news_portal_db',
        'USER': 'news_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

2. Add installed apps:
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'users',
    'news',
    'advertisements',
    'contact',
    'analytics',
]
```

3. Add CORS middleware:
```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # Add this
    'django.middleware.common.CommonMiddleware',
    # ... rest of middleware
]
```

4. Add CORS settings:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React default port
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True
```

5. Add media and static settings:
```python
import os

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
```

### Step 6: Create Django Apps
```bash
python manage.py startapp news
python manage.py startapp advertisements
python manage.py startapp contact
python manage.py startapp analytics
```

### Step 7: Create Models
- Edit `users/models.py` - Add custom User model
- Edit `news/models.py` - Add News, Category, Section models
- Edit `advertisements/models.py` - Add Advertisement models
- Edit `contact/models.py` - Add ContactMessage model
- Edit `analytics/models.py` - Add NewsView model

### Step 8: Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 9: Create Superuser
```bash
python manage.py createsuperuser
```
Follow prompts to create admin user.

### Step 10: Run Development Server
**Use the virtual environment's Python** (see Step 2). From project root you can also run:
```bash
.\runserver.ps1
```
Or from backend with venv activated:
```bash
python manage.py runserver
```

Backend will run on `http://localhost:8000`

---

## Frontend Setup Commands

### Step 1: Create React App
```bash
cd ..  # Go back to project root
npx create-react-app frontend
cd frontend
```

### Step 2: Install Required Packages
```bash
npm install react-router-dom axios react-i18next i18next
npm install @reduxjs/toolkit react-redux  # If using Redux
npm install react-player  # For YouTube/reels
npm install react-infinite-scroll-component  # For infinite scroll
```

### Step 3: Create Folder Structure
```bash
mkdir -p src/components/Layout
mkdir -p src/components/News
mkdir -p src/components/Media
mkdir -p src/components/Advertisement
mkdir -p src/components/Language
mkdir -p src/components/Common
mkdir -p src/pages
mkdir -p src/pages/Admin
mkdir -p src/pages/Editor
mkdir -p src/services
mkdir -p src/store/slices  # If using Redux
mkdir -p src/context  # If using Context API
mkdir -p src/hooks
mkdir -p src/utils
mkdir -p src/locales/en
mkdir -p src/locales/hi
mkdir -p src/locales/gu
mkdir -p src/styles
```

**Windows PowerShell:**
```powershell
New-Item -ItemType Directory -Path src/components/Layout, src/components/News, src/components/Media, src/components/Advertisement, src/components/Language, src/components/Common, src/pages, src/pages/Admin, src/pages/Editor, src/services, src/store/slices, src/context, src/hooks, src/utils, src/locales/en, src/locales/hi, src/locales/gu, src/styles -Force
```

### Step 4: Create Environment File
Create `.env` in `frontend/`:
```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_GOOGLE_ADSENSE_ID=your-adsense-id
```

### Step 5: Start Development Server
```bash
npm start
```

Frontend will run on `http://localhost:3000`

---

## Common Django Commands

### Create Migrations
```bash
python manage.py makemigrations
```

### Apply Migrations
```bash
python manage.py migrate
```

### Create Superuser
```bash
python manage.py createsuperuser
```

### Run Development Server
```bash
python manage.py runserver
```

### Run Development Server on Specific Port
```bash
python manage.py runserver 8000
```

### Collect Static Files (for production)
```bash
python manage.py collectstatic
```

### Open Django Shell
```bash
python manage.py shell
```

### Create App
```bash
python manage.py startapp app_name
```

---

## Common React Commands

### Start Development Server
```bash
npm start
```

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

### Install Package
```bash
npm install package_name
```

### Install Dev Dependency
```bash
npm install --save-dev package_name
```

---

## PostgreSQL Commands

### Connect to Database
```bash
psql -U news_user -d news_portal_db
```

### List All Databases
```bash
psql -U postgres -c "\l"
```

### List All Tables
```bash
psql -U news_user -d news_portal_db -c "\dt"
```

### Drop Database (careful!)
```bash
psql -U postgres -c "DROP DATABASE news_portal_db;"
```

### Backup Database
```bash
pg_dump -U news_user news_portal_db > backup.sql
```

### Restore Database
```bash
psql -U news_user news_portal_db < backup.sql
```

---

## Testing API Endpoints

### Using curl

**Register User:**
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}'
```

**Login (get JWT tokens):**
```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'
```
Response includes `access` and `refresh` tokens. Use the access token in the Authorization header: `Authorization: Bearer <access>`.

**Get News (with token):**
```bash
curl -X GET http://localhost:8000/api/news/articles/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### Using Postman
1. Import collection or create new requests
2. Set base URL: `http://localhost:8000/api`
3. For authenticated endpoints, add header:
   - Key: `Authorization`
   - Value: `Bearer YOUR_TOKEN_HERE`

---

## Troubleshooting

### Backend Issues

**Database Connection Error:**
- Check PostgreSQL is running
- Verify database credentials in settings.py
- Check PostgreSQL is listening on port 5432

**Migration Errors:**
- Delete migration files (except `__init__.py`) and run `makemigrations` again
- Check model syntax

**Port Already in Use:**
- Change port: `python manage.py runserver 8001`
- Or kill process using port 8000

### Frontend Issues

**CORS Errors:**
- Ensure `corsheaders` is installed and configured
- Check `CORS_ALLOWED_ORIGINS` in settings.py

**API Connection Failed:**
- Verify backend server is running
- Check `REACT_APP_API_URL` in `.env`
- Restart React dev server after changing `.env`

**Module Not Found:**
- Run `npm install` again
- Check package.json for correct package names

---

## Next Steps

1. Follow `PROJECT_STRUCTURE.md` for detailed file structure
2. Follow `IMPLEMENTATION_CHECKLIST.md` for step-by-step implementation
3. Refer to `DATABASE_SCHEMA.md` for model relationships
4. Start with backend models, then APIs, then frontend

---

## Useful Resources

- Django Documentation: https://docs.djangoproject.com/
- Django REST Framework: https://www.django-rest-framework.org/
- React Documentation: https://react.dev/
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- React Router: https://reactrouter.com/
- Axios: https://axios-http.com/
- i18next: https://www.i18next.com/
