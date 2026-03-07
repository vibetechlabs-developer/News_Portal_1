-- Fix PostgreSQL permissions for news_newsarticle table
-- Run this script as a PostgreSQL superuser (e.g., postgres user)

-- Replace 'news_user' with your actual DB_USER from settings.py
-- Replace 'news_portal_db' with your actual DB_NAME from settings.py

-- Grant usage on the schema (usually 'public')
GRANT USAGE ON SCHEMA public TO news_user;

-- Grant all privileges on the news_newsarticle table
GRANT ALL PRIVILEGES ON TABLE news_newsarticle TO news_user;

-- Grant privileges on all sequences (for auto-increment fields)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO news_user;

-- Grant privileges on all tables in the public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO news_user;

-- Set default privileges for future tables (so new tables automatically get permissions)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO news_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO news_user;

-- If you have other tables that might have the same issue, grant permissions on all news_* tables:
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO news_user;

-- Verify permissions (optional - run as news_user to test)
-- \c news_portal_db news_user
-- SELECT * FROM news_newsarticle LIMIT 1;
