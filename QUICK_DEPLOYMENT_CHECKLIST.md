# Quick Deployment Checklist

A simple step-by-step checklist for deploying your News Portal.

## Pre-Deployment

- [ ] Domain name purchased (optional but recommended)
- [ ] VPS/Server ready (Ubuntu 20.04+ or Debian 11+)
- [ ] SSH access to server
- [ ] GitHub repository ready (or files ready to upload)

---

## Step 1: Server Setup (5-10 minutes)

```bash
# Connect to server
ssh root@your-server-ip

# Run setup script
cd /tmp
# Upload setup_server.sh or copy-paste the commands
chmod +x setup_server.sh
sudo ./setup_server.sh
```

**Or manually:**
```bash
apt update && apt upgrade -y
apt install -y python3 python3-pip python3-venv python3-dev postgresql postgresql-contrib nginx nodejs build-essential libpq-dev git certbot python3-certbot-nginx
```

---

## Step 2: Database Setup (2-3 minutes)

```bash
# Run database setup script
chmod +x setup_database.sh
./setup_database.sh
```

**Or manually:**
```bash
sudo -u postgres psql
CREATE DATABASE news_portal_db;
CREATE USER news_user WITH PASSWORD 'your-strong-password';
GRANT ALL PRIVILEGES ON DATABASE news_portal_db TO news_user;
\q
```

---

## Step 3: Upload Project Files

**Option A: Git Clone**
```bash
cd /home
adduser newsapp
usermod -aG sudo newsapp
su - newsapp
git clone https://github.com/yourusername/News_Portal.git
cd News_Portal
```

**Option B: SCP Upload**
```bash
# From your local machine
scp -r D:\News_Portal newsapp@your-server-ip:/home/newsapp/
```

---

## Step 4: Configure Backend (5 minutes)

```bash
cd /home/newsapp/News_Portal/backend
cp env.sample .env
nano .env
```

**Update these values in `.env`:**
```env
SECRET_KEY=<generate-new-secret-key>
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,your-server-ip
DB_NAME=news_portal_db
DB_USER=news_user
DB_PASSWORD=your-database-password
CORS_ALLOWED_ORIGINS=https://yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com
```

**Generate SECRET_KEY:**
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## Step 5: Deploy Backend (3-5 minutes)

```bash
cd /home/newsapp/News_Portal
chmod +x deploy/deploy_backend.sh
./deploy/deploy_backend.sh
```

**Create superuser:**
```bash
cd backend
source venv/bin/activate
python manage.py createsuperuser
```

---

## Step 6: Set Up Gunicorn (2 minutes)

```bash
sudo cp deploy/gunicorn_service.conf /etc/systemd/system/newsportal.service
sudo nano /etc/systemd/system/newsportal.service  # Adjust paths if needed
sudo systemctl daemon-reload
sudo systemctl enable newsportal
sudo systemctl start newsportal
sudo systemctl status newsportal  # Check if running
```

---

## Step 7: Build Frontend (3-5 minutes)

```bash
cd /home/newsapp/News_Portal/kanam_express\ copy
echo "VITE_API_BASE_URL=https://yourdomain.com" > .env.production
npm install
npm run build
```

---

## Step 8: Configure Nginx (5 minutes)

```bash
sudo cp deploy/nginx_config.conf /etc/nginx/sites-available/newsportal
sudo nano /etc/nginx/sites-available/newsportal  # Replace yourdomain.com
sudo ln -s /etc/nginx/sites-available/newsportal /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

**Copy frontend files:**
```bash
sudo mkdir -p /var/www/newsportal
sudo cp -r "kanam_express copy/dist/"* /var/www/newsportal/
sudo chown -R www-data:www-data /var/www/newsportal
```

---

## Step 9: Set Up SSL (5 minutes)

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts. Certbot will automatically configure HTTPS.

---

## Step 10: Final Configuration

**Update Django settings for HTTPS:**
```bash
cd /home/newsapp/News_Portal/backend
nano .env
# Ensure these are set:
# SECURE_SSL_REDIRECT=True
# SECURE_HSTS_SECONDS=31536000
```

**Restart services:**
```bash
sudo systemctl restart newsportal
sudo systemctl restart nginx
```

**Set up firewall:**
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Step 11: Set Up Backups (2 minutes)

```bash
chmod +x deploy/backup_database.sh
crontab -e
# Add this line:
0 2 * * * /home/newsapp/News_Portal/deploy/backup_database.sh
```

---

## Verification Checklist

- [ ] Visit `https://yourdomain.com` - Frontend loads
- [ ] Visit `https://yourdomain.com/api/v1/health/` - API responds
- [ ] Visit `https://yourdomain.com/admin/` - Admin panel loads
- [ ] Test login functionality
- [ ] Check static files load (CSS, JS, images)
- [ ] Check media files load (uploaded images/videos)
- [ ] Test API endpoints from frontend

---

## Common Issues & Quick Fixes

### 502 Bad Gateway
```bash
sudo systemctl status newsportal  # Check Gunicorn
sudo journalctl -u newsportal -n 50  # Check logs
```

### Static files not loading
```bash
cd /home/newsapp/News_Portal/backend
source venv/bin/activate
python manage.py collectstatic --noinput
```

### Database connection error
```bash
sudo systemctl status postgresql
sudo -u postgres psql -c "\l"  # List databases
```

### CORS errors
Check `.env` file has correct `CORS_ALLOWED_ORIGINS`

---

## Useful Commands

```bash
# Restart everything
sudo systemctl restart newsportal nginx

# View logs
sudo journalctl -u newsportal -f
sudo tail -f /var/log/nginx/error.log

# Update code
cd /home/newsapp/News_Portal
git pull
cd backend && source venv/bin/activate
pip install -r ../../requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart newsportal

# Update frontend
cd /home/newsapp/News_Portal/kanam_express\ copy
npm install && npm run build
sudo cp -r dist/* /var/www/newsportal/
```

---

## Estimated Total Time: 30-45 minutes

**Need help?** Check `DEPLOYMENT_GUIDE.md` for detailed explanations.

---

## Alternative: Cloud Platform Deployment

If VPS setup seems complex, try these easier options:

### Railway (Easiest)
1. Go to railway.app
2. New Project → Deploy from GitHub
3. Add PostgreSQL
4. Set environment variables
5. Done!

### Render
1. Go to render.com
2. New Web Service (Backend)
3. New Static Site (Frontend)
4. Connect GitHub
5. Configure and deploy

See `DEPLOYMENT_GUIDE.md` for detailed cloud platform instructions.

---

**🎉 Congratulations! Your News Portal is now live!**
