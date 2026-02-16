# Deployment Scripts

This directory contains helper scripts to simplify the deployment process.

## Scripts Overview

### 1. `setup_server.sh`
Initial server setup script. Installs all required system packages.
- Python 3, pip, venv
- PostgreSQL
- Nginx
- Node.js
- Build tools
- Certbot (for SSL)

**Usage:**
```bash
chmod +x setup_server.sh
sudo ./setup_server.sh
```

### 2. `setup_database.sh`
Creates PostgreSQL database and user.

**Usage:**
```bash
chmod +x setup_database.sh
./setup_database.sh
```

### 3. `deploy_backend.sh`
Deploys the Django backend:
- Creates/updates virtual environment
- Installs dependencies
- Runs migrations
- Collects static files

**Usage:**
```bash
chmod +x deploy_backend.sh
./deploy_backend.sh
```

### 4. `deploy_frontend.sh`
Builds and deploys the React frontend:
- Installs npm dependencies
- Builds production bundle
- Copies files to Nginx directory

**Usage:**
```bash
chmod +x deploy_frontend.sh
./deploy_frontend.sh
```

### 5. `backup_database.sh`
Creates a database backup and removes old backups.

**Usage:**
```bash
chmod +x backup_database.sh
./backup_database.sh
```

**Set up daily cron job:**
```bash
crontab -e
# Add: 0 2 * * * /home/newsapp/backup_database.sh
```

## Configuration Files

### `nginx_config.conf`
Nginx configuration template. Copy to `/etc/nginx/sites-available/newsportal` and customize:
- Replace `yourdomain.com` with your actual domain
- Uncomment HTTPS redirect after SSL setup

### `gunicorn_service.conf`
Systemd service file for Gunicorn. Copy to `/etc/systemd/system/newsportal.service` and:
- Adjust paths if needed
- Adjust worker count based on your server resources

## Quick Deployment Steps

1. **Initial Setup:**
   ```bash
   sudo ./setup_server.sh
   ./setup_database.sh
   ```

2. **Deploy Backend:**
   ```bash
   # Edit .env file first
   nano backend/.env
   ./deploy_backend.sh
   python manage.py createsuperuser
   ```

3. **Set up Gunicorn:**
   ```bash
   sudo cp gunicorn_service.conf /etc/systemd/system/newsportal.service
   sudo systemctl daemon-reload
   sudo systemctl enable newsportal
   sudo systemctl start newsportal
   ```

4. **Deploy Frontend:**
   ```bash
   # Create .env.production first
   echo "VITE_API_BASE_URL=https://yourdomain.com" > "kanam_express copy/.env.production"
   ./deploy_frontend.sh
   ```

5. **Configure Nginx:**
   ```bash
   sudo cp nginx_config.conf /etc/nginx/sites-available/newsportal
   sudo nano /etc/nginx/sites-available/newsportal  # Edit domain names
   sudo ln -s /etc/nginx/sites-available/newsportal /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Set up SSL:**
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

7. **Set up Backups:**
   ```bash
   chmod +x backup_database.sh
   crontab -e
   # Add: 0 2 * * * /home/newsapp/backup_database.sh
   ```

## Notes

- All scripts assume the project is located at `/home/newsapp/News_Portal`
- Adjust paths in scripts if your setup differs
- Make sure to edit configuration files before using them
- Test each step before proceeding to the next

## Troubleshooting

If scripts fail:
1. Check file permissions: `chmod +x script_name.sh`
2. Check if you're in the correct directory
3. Review error messages carefully
4. Refer to the main DEPLOYMENT_GUIDE.md for detailed instructions
