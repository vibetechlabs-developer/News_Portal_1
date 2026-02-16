#!/bin/bash
# Database Backup Script
# Run this daily via cron: 0 2 * * * /home/newsapp/backup-db.sh

set -e

# Configuration
BACKUP_DIR="/home/newsapp/backups"
DB_NAME="news_portal_db"
DB_USER="news_user"
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"

echo "🔄 Creating database backup: $BACKUP_FILE"

# Create backup
PGPASSWORD=$(grep DB_PASSWORD /home/newsapp/News_Portal/backend/.env | cut -d '=' -f2) \
    pg_dump -U "$DB_USER" -h localhost "$DB_NAME" > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"
echo "✅ Backup created: ${BACKUP_FILE}.gz"

# Remove old backups (older than RETENTION_DAYS)
find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "🗑️  Removed backups older than $RETENTION_DAYS days"

# Optional: Upload to cloud storage (uncomment and configure)
# aws s3 cp "${BACKUP_FILE}.gz" s3://your-bucket/backups/
# or
# gsutil cp "${BACKUP_FILE}.gz" gs://your-bucket/backups/

echo "✅ Backup complete!"
