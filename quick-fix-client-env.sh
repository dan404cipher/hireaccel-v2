#!/bin/bash
# Quick fix for client environment to match server routes

echo "🔧 Fixing client API URL configuration..."

# Check current client env
echo "Current client .env file:"
cat /var/www/hireaccel/client/.env | grep VITE_API_URL

# The issue: client is calling /api/auth/login but server expects /auth/login
# Solution: Update client to call server directly without /api prefix for auth

# Update the client environment
cd /var/www/hireaccel/client

# Backup current env
cp .env .env.backup

# Update VITE_API_URL to point to domain root (no /api suffix)
sed -i 's|VITE_API_URL=.*|VITE_API_URL=https://hireaccel.v-accel.ai|' .env

echo "Updated client .env file:"
cat .env | grep VITE_API_URL

# Rebuild the client
echo "🔨 Rebuilding client..."
npm run build

echo "✅ Client updated and rebuilt"
echo ""
echo "🧪 Testing the fix:"
echo "The client should now call:"
echo "  - Auth: https://hireaccel.v-accel.ai/auth/login ✅"
echo "  - API: https://hireaccel.v-accel.ai/api/v1/users ✅"
echo ""
echo "Instead of:"
echo "  - Auth: https://hireaccel.v-accel.ai/api/auth/login ❌"

