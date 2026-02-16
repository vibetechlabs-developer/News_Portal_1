#!/bin/bash
# Server Setup Script for News Portal Deployment
# Run this script on a fresh Ubuntu/Debian server

set -e  # Exit on error

echo "🚀 Starting News Portal Server Setup..."

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Python and dependencies
echo "🐍 Installing Python and dependencies..."
apt install -y python3 python3-pip python3-venv python3-dev

# Install PostgreSQL
echo "🐘 Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Install Nginx
echo "🌐 Installing Nginx..."
apt install -y nginx

# Install Node.js
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install build tools
echo "🔧 Installing build tools..."
apt install -y build-essential libpq-dev git

# Install Certbot for SSL
echo "🔒 Installing Certbot..."
apt install -y certbot python3-certbot-nginx

echo "✅ Server setup complete!"
echo ""
echo "Next steps:"
echo "1. Set up PostgreSQL database (see DEPLOYMENT_GUIDE.md)"
echo "2. Deploy your application files"
echo "3. Configure environment variables"
echo "4. Run migrations and collectstatic"
echo "5. Set up Gunicorn service"
echo "6. Configure Nginx"
echo "7. Set up SSL certificate"
