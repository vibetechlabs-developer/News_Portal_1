# Deployment Guide: Django + React + PostgreSQL

This guide covers deploying your News Portal application to production. We'll cover multiple deployment options.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Deployment Options](#deployment-options)
3. [Option 1: VPS Deployment (Ubuntu/Debian)](#option-1-vps-deployment-ubuntudebian)
4. [Option 2: Cloud Platform Deployment](#option-2-cloud-platform-deployment)
5. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

Before deploying, ensure you have:
- ✅ Domain name (optional but recommended)
- ✅ Server/VPS with Ubuntu 20.04+ or Debian 11+
- ✅ SSH access to your server
- ✅ Basic knowledge of Linux commands

---

## Deployment Options

### Quick Comparison

| Option | Best For | Cost | Difficulty |
|--------|----------|------|------------|
| **VPS (DigitalOcean, Linode, etc.)** | Full control, custom setup | $5-20/month | Medium |
| **Railway** | Quick deployment, managed services | Pay-as-you-go | Easy |
| **Render** | Simple deployment, free tier available | Free-$25/month | Easy |
| **AWS/GCP/Azure** | Enterprise, scalable | Variable | Hard |

---

## Option 1: VPS Deployment (Ubuntu/Debian)

This is the most common and flexible deployment method.

### Step 1: Server Setup

#### 1.1 Connect to Your Server
```bash
ssh root@your-server-ip
```

#### 1.2 Update System
```bash
apt update && apt upgrade -y
```

#### 1.3 Install Required Software
```bash
# Install Python 3.11+ and pip
apt install -y python3 python3-pip python3-venv python3-dev

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install Nginx (web server)
apt install -y nginx

# Install Node.js 18+ (for building React app)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install build tools
apt install -y build-essential libpq-dev

# Install Git
apt install -y git
```

### Step 2: Database Setup

#### 2.1 Create PostgreSQL Database and User
```bash
sudo -u postgres psql
```

Inside PostgreSQL prompt:
```sql
CREATE DATABASE news_portal_db;
CREATE USER news_user WITH PASSWORD 'your-strong-password-here';
ALTER ROLE news_user SET client_encoding TO 'utf8';
ALTER ROLE news_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE news_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE news_portal_db TO news_user;
\q
```

#### 2.2 Configure PostgreSQL (Optional - for remote access)
Edit `/etc/postgresql/*/main/postgresql.conf`:
```bash
sudo nano /etc/postgresql/*/main/postgresql.conf
```
Uncomment and set:
```
listen_addresses = 'localhost'
```

Edit `/etc/postgresql/*/main/pg_hba.conf`:
```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```
Ensure local connections are trusted:
```
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### Step 3: Deploy Django Backend

#### 3.1 Create Application User (Optional but recommended)
```bash
adduser newsapp
usermod -aG sudo newsapp
su - newsapp
```

#### 3.2 Clone Your Repository
```bash
cd /home/newsapp
git clone https://github.com/yourusername/News_Portal.git
cd News_Portal
```

Or upload your project files via SCP:
```bash
# From your local machine
scp -r D:\News_Portal newsapp@your-server-ip:/home/newsapp/
```

#### 3.3 Set Up Python Virtual Environment
```bash
cd /home/newsapp/News_Portal/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r ../../requirements.txt
```

#### 3.4 Configure Environment Variables
```bash
cd /home/newsapp/News_Portal/backend
cp env.sample .env
nano .env
```

Update `.env` with production values:
```env
SECRET_KEY=your-super-secret-key-generate-with-django-secret-key-generator

# Production settings
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,your-server-ip

# Database
DB_NAME=news_portal_db
DB_USER=news_user
DB_PASSWORD=your-strong-password-here
DB_HOST=localhost
DB_PORT=5432

# CORS - Add your frontend domain
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Email (configure with your email service)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
CONTACT_ADMIN_EMAIL=admin@yourdomain.com
FRONTEND_RESET_PASSWORD_URL=https://yourdomain.com/reset-password

# Security (production)
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
```

**Generate a secure SECRET_KEY:**
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

#### 3.5 Run Migrations
```bash
cd /home/newsapp/News_Portal/backend
source venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
```

#### 3.6 Create Superuser
```bash
python manage.py createsuperuser
```

### Step 4: Set Up Gunicorn (WSGI Server)

#### 4.1 Install Gunicorn
```bash
source venv/bin/activate
pip install gunicorn
```

#### 4.2 Create Gunicorn Service File
```bash
sudo nano /etc/systemd/system/newsportal.service
```

Add:
```ini
[Unit]
Description=News Portal Django Application
After=network.target

[Service]
User=newsapp
Group=www-data
WorkingDirectory=/home/newsapp/News_Portal/backend
Environment="PATH=/home/newsapp/News_Portal/backend/venv/bin"
ExecStart=/home/newsapp/News_Portal/backend/venv/bin/gunicorn \
    --workers 3 \
    --bind unix:/home/newsapp/News_Portal/backend/newsportal.sock \
    --access-logfile /home/newsapp/News_Portal/backend/logs/access.log \
    --error-logfile /home/newsapp/News_Portal/backend/logs/error.log \
    backend.wsgi:application

[Install]
WantedBy=multi-user.target
```

#### 4.3 Start and Enable Service
```bash
sudo systemctl daemon-reload
sudo systemctl start newsportal
sudo systemctl enable newsportal
sudo systemctl status newsportal
```

### Step 5: Build and Deploy React Frontend

#### 5.1 Build React Application
```bash
cd /home/newsapp/News_Portal/kanam_express\ copy
npm install
```

Create `.env.production` file:
```bash
nano .env.production
```

Add:
```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

Build:
```bash
npm run build
```

This creates a `dist/` folder with production-ready files.

#### 5.2 Option A: Serve with Nginx (Recommended)

Copy built files to Nginx directory:
```bash
sudo cp -r dist/* /var/www/newsportal/
sudo chown -R www-data:www-data /var/www/newsportal
```

### Step 6: Configure Nginx

#### 6.1 Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/newsportal
```

Add:
```nginx
# Upstream for Django backend
upstream django {
    server unix:/home/newsapp/News_Portal/backend/newsportal.sock fail_timeout=0;
}

# Frontend (React) - Main site
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS (after SSL setup)
    # return 301 https://$server_name$request_uri;
    
    root /var/www/newsportal;
    index index.html;

    # Serve React app
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Django
    location /api/ {
        proxy_pass http://django;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Serve media files
    location /media/ {
        alias /home/newsapp/News_Portal/backend/media/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Serve static files
    location /static/ {
        alias /home/newsapp/News_Portal/backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# Backend API (optional separate subdomain)
server {
    listen 80;
    server_name api.yourdomain.com;
    
    # Redirect HTTP to HTTPS (after SSL setup)
    # return 301 https://$server_name$request_uri;
    
    location / {
        proxy_pass http://django;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /media/ {
        alias /home/newsapp/News_Portal/backend/media/;
        expires 30d;
    }

    location /static/ {
        alias /home/newsapp/News_Portal/backend/staticfiles/;
        expires 30d;
    }
}
```

#### 6.2 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/newsportal /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

### Step 7: Set Up SSL with Let's Encrypt

#### 7.1 Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

#### 7.2 Obtain SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

Follow the prompts. Certbot will automatically update your Nginx configuration.

#### 7.3 Auto-renewal (already set up by certbot)
```bash
sudo certbot renew --dry-run  # Test renewal
```

### Step 8: Update Django Settings for HTTPS

After SSL is set up, update your `.env`:
```env
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
```

Restart Gunicorn:
```bash
sudo systemctl restart newsportal
```

---

## Option 2: Cloud Platform Deployment

### Railway (Easiest Option)

#### Backend Deployment:
1. Go to [railway.app](https://railway.app)
2. Create new project → "Deploy from GitHub repo"
3. Select your repository
4. Add PostgreSQL service
5. Set environment variables (from your `.env`)
6. Railway auto-detects Django and deploys

#### Frontend Deployment:
1. Create new service → "Deploy from GitHub repo"
2. Select your repository, set root directory to `kanam_express copy`
3. Set build command: `npm install && npm run build`
4. Set start command: `npx serve -s dist -l 3000`
5. Add environment variable: `VITE_API_BASE_URL=https://your-backend-url.railway.app`

### Render

#### Backend:
1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repo
4. Settings:
   - Build Command: `cd backend && pip install -r ../requirements.txt`
   - Start Command: `cd backend && gunicorn backend.wsgi:application`
   - Add PostgreSQL database
   - Add environment variables

#### Frontend:
1. New → Static Site
2. Connect GitHub repo
3. Root Directory: `kanam_express copy`
4. Build Command: `npm install && npm run build`
5. Publish Directory: `dist`
6. Add environment variable: `VITE_API_BASE_URL=https://your-backend.onrender.com`

---

## Post-Deployment Checklist

### Security
- [ ] Change default database password
- [ ] Set `DEBUG=False` in production
- [ ] Use strong `SECRET_KEY`
- [ ] Configure CORS properly
- [ ] Set up SSL/HTTPS
- [ ] Configure firewall (UFW):
  ```bash
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw enable
  ```

### Performance
- [ ] Enable Gunicorn workers (3-5 for small sites)
- [ ] Set up static file serving (Nginx)
- [ ] Configure media file serving
- [ ] Set up database backups
- [ ] Configure log rotation

### Monitoring
- [ ] Set up error logging
- [ ] Monitor server resources
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure email alerts

### Database Backups
```bash
# Create backup script
sudo nano /home/newsapp/backup-db.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR="/home/newsapp/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
pg_dump -U news_user news_portal_db > $BACKUP_DIR/db_backup_$DATE.sql
# Keep only last 7 days
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete
```

Make executable:
```bash
chmod +x /home/newsapp/backup-db.sh
```

Add to crontab (daily at 2 AM):
```bash
crontab -e
# Add:
0 2 * * * /home/newsapp/backup-db.sh
```

---

## Troubleshooting

### Check Gunicorn Logs
```bash
sudo journalctl -u newsportal -f
```

### Check Nginx Logs
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Restart Services
```bash
sudo systemctl restart newsportal
sudo systemctl restart nginx
sudo systemctl restart postgresql
```

### Test Django
```bash
cd /home/newsapp/News_Portal/backend
source venv/bin/activate
python manage.py check --deploy
```

### Common Issues

1. **502 Bad Gateway**: Check Gunicorn is running and socket permissions
2. **Static files not loading**: Run `collectstatic` and check Nginx config
3. **Database connection error**: Verify PostgreSQL is running and credentials
4. **CORS errors**: Check `CORS_ALLOWED_ORIGINS` in `.env`

---

## Quick Reference Commands

```bash
# Restart services
sudo systemctl restart newsportal nginx

# View logs
sudo journalctl -u newsportal -n 50
sudo tail -f /var/log/nginx/error.log

# Update code
cd /home/newsapp/News_Portal
git pull
cd backend
source venv/bin/activate
pip install -r ../../requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart newsportal

# Update frontend
cd /home/newsapp/News_Portal/kanam_express\ copy
npm install
npm run build
sudo cp -r dist/* /var/www/newsportal/
sudo systemctl restart nginx
```

---

## Need Help?

- Check Django logs: `/home/newsapp/News_Portal/backend/logs/`
- Check Nginx error log: `/var/log/nginx/error.log`
- Django documentation: https://docs.djangoproject.com/en/stable/howto/deployment/
- Nginx documentation: https://nginx.org/en/docs/

---

**Good luck with your deployment! 🚀**
