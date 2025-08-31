#!/bin/bash
# Fix for 404 login issue - Update API routes
# Run this on your production server

set -e

echo "🔧 Fixing API routing issue..."

APP_DIR="/var/www/hireaccel"
cd $APP_DIR

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin master

# Restart API service
echo "🔄 Restarting API..."
pm2 restart hireaccel-api

# Wait a moment for restart
sleep 3

# Check status
echo "✅ Checking status..."
pm2 status

echo "🎉 Fix applied! The login endpoint should now work at /api/auth/login"
echo "Test it with: curl -X POST https://hireaccel.v-accel.ai/api/auth/login"
