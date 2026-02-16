#!/bin/bash
# Database Setup Script
# This script creates the PostgreSQL database and user

set -e

echo "🐘 Setting up PostgreSQL database..."

# Prompt for database credentials
read -p "Enter database name [news_portal_db]: " DB_NAME
DB_NAME=${DB_NAME:-news_portal_db}

read -p "Enter database user [news_user]: " DB_USER
DB_USER=${DB_USER:-news_user}

read -sp "Enter database password: " DB_PASSWORD
echo ""

# Create database and user
sudo -u postgres psql <<EOF
-- Create database
CREATE DATABASE $DB_NAME;

-- Create user
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Set permissions
ALTER ROLE $DB_USER SET client_encoding TO 'utf8';
ALTER ROLE $DB_USER SET default_transaction_isolation TO 'read committed';
ALTER ROLE $DB_USER SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

echo "✅ Database setup complete!"
echo ""
echo "Database Name: $DB_NAME"
echo "Database User: $DB_USER"
echo ""
echo "Add these to your .env file:"
echo "DB_NAME=$DB_NAME"
echo "DB_USER=$DB_USER"
echo "DB_PASSWORD=$DB_PASSWORD"
echo "DB_HOST=localhost"
echo "DB_PORT=5432"
