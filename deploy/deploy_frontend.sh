#!/bin/bash
# Frontend Deployment Script
# Run this from the project root directory

set -e

PROJECT_DIR="/home/newsapp/News_Portal"
FRONTEND_DIR="$PROJECT_DIR/kanam_express copy"
NGINX_DIR="/var/www/newsportal"

echo "🚀 Deploying React Frontend..."

# Check if frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Frontend directory not found: $FRONTEND_DIR"
    exit 1
fi

cd "$FRONTEND_DIR"

# Install dependencies
echo "📥 Installing npm dependencies..."
npm install

# Check for .env.production
if [ ! -f "$FRONTEND_DIR/.env.production" ]; then
    echo "⚠️  .env.production not found!"
    read -p "Enter API base URL (e.g., https://api.yourdomain.com): " API_URL
    echo "VITE_API_BASE_URL=$API_URL" > "$FRONTEND_DIR/.env.production"
fi

# Build React app
echo "🔨 Building React application..."
npm run build

# Create Nginx directory if it doesn't exist
sudo mkdir -p "$NGINX_DIR"

# Copy built files to Nginx directory
echo "📋 Copying files to Nginx directory..."
sudo cp -r dist/* "$NGINX_DIR/"

# Set proper permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data "$NGINX_DIR"
sudo chmod -R 755 "$NGINX_DIR"

echo "✅ Frontend deployment complete!"
echo ""
echo "Next steps:"
echo "1. Configure Nginx (see DEPLOYMENT_GUIDE.md)"
echo "2. Restart Nginx: sudo systemctl restart nginx"
