#!/bin/bash
# Backend Deployment Script
# Run this from the project root directory

set -e

PROJECT_DIR="/home/newsapp/News_Portal"
BACKEND_DIR="$PROJECT_DIR/backend"

echo "🚀 Deploying Django Backend..."

# Check if virtual environment exists
if [ ! -d "$BACKEND_DIR/venv" ]; then
    echo "📦 Creating virtual environment..."
    cd "$BACKEND_DIR"
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source "$BACKEND_DIR/venv/bin/activate"

# Install/update dependencies
echo "📥 Installing dependencies..."
cd "$BACKEND_DIR"
pip install --upgrade pip
pip install -r ../../requirements.txt
pip install gunicorn

# Check if .env exists
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo "⚠️  .env file not found!"
    echo "Copying env.sample to .env..."
    cp "$BACKEND_DIR/env.sample" "$BACKEND_DIR/.env"
    echo "⚠️  Please edit .env file with production values!"
    read -p "Press Enter after editing .env file..."
fi

# Run migrations
echo "🔄 Running database migrations..."
python manage.py migrate

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# Create logs directory
mkdir -p "$BACKEND_DIR/logs"

echo "✅ Backend deployment complete!"
echo ""
echo "Next steps:"
echo "1. Create superuser: python manage.py createsuperuser"
echo "2. Set up Gunicorn service (see DEPLOYMENT_GUIDE.md)"
echo "3. Configure Nginx"
