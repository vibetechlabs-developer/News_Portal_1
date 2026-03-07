# Fix Database Permissions Error

## Problem
The error `permission denied for table news_newsarticle` occurs because the database user doesn't have the necessary permissions to access the table.

## Solution

### Option 1: Run SQL Script (Recommended)

1. **Connect to PostgreSQL as a superuser:**
   ```bash
   psql -U postgres -d news_portal_db
   ```
   (Replace `postgres` with your PostgreSQL superuser and `news_portal_db` with your database name)

2. **Run the SQL script:**
   ```sql
   \i fix_db_permissions.sql
   ```
   Or copy and paste the contents of `fix_db_permissions.sql` into the psql prompt.

3. **Verify the fix:**
   ```sql
   \c news_portal_db news_user
   SELECT * FROM news_newsarticle LIMIT 1;
   ```

### Option 2: Run Commands Directly

If you prefer to run commands directly:

```bash
# Connect as superuser
psql -U postgres -d news_portal_db

# Then run these SQL commands:
GRANT USAGE ON SCHEMA public TO news_user;
GRANT ALL PRIVILEGES ON TABLE news_newsarticle TO news_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO news_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO news_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO news_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO news_user;
```

### Option 3: If on Production Server (SSH)

If you're on a production server via SSH:

```bash
# SSH into your server
ssh user@your-server

# Connect to PostgreSQL
sudo -u postgres psql -d news_portal_db

# Run the GRANT commands from Option 2
```

### Option 4: Check Current Permissions

To see what permissions currently exist:

```sql
-- Connect as superuser
\c news_portal_db postgres

-- Check table permissions
\dp news_newsarticle

-- Check user permissions
\du news_user
```

## Important Notes

1. **Replace placeholders:**
   - Replace `news_user` with your actual `DB_USER` from `.env` or `settings.py`
   - Replace `news_portal_db` with your actual `DB_NAME`

2. **After fixing permissions:**
   - Restart your Django application
   - Test the API endpoint: `GET /api/v1/news/articles/`

3. **If the error persists:**
   - Check that you're using the correct database user in your Django settings
   - Verify the table exists: `\dt news_newsarticle`
   - Check if the table is in a different schema: `\dn` and `SET search_path TO schema_name;`

## Prevention

To prevent this issue in the future:

1. **Run migrations with the application user:**
   ```bash
   python manage.py migrate
   ```
   This ensures tables are created with the correct ownership.

2. **Or grant permissions immediately after migrations:**
   ```bash
   python manage.py migrate
   # Then run the GRANT commands
   ```
