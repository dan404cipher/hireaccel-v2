#!/bin/bash
# Force complete client rebuild with new environment

echo "🔧 Force rebuilding client with new environment..."

cd /var/www/hireaccel/client

echo "1. Current environment file:"
cat .env | grep VITE_API_URL

echo ""
echo "2. Cleaning build cache..."
rm -rf dist/
rm -rf node_modules/.vite/
rm -rf .vite/

echo "3. Installing dependencies..."
npm install

echo "4. Force rebuild with production environment..."
npm run build -- --force

echo "5. Verify build output contains new API URL..."
if grep -r "hireaccel.v-accel.ai" dist/ > /dev/null; then
    echo "✅ New API URL found in build"
else
    echo "❌ API URL not found in build - checking for old URL..."
    grep -r "api" dist/ | head -3
fi

echo ""
echo "6. Client build contents:"
ls -la dist/

echo ""
echo "7. Testing what the rebuilt client will call:"
echo "Expected API calls from browser:"
echo "  Auth: https://hireaccel.v-accel.ai/auth/login"
echo "  API: https://hireaccel.v-accel.ai/api/v1/users"

echo ""
echo "8. Browser cache instructions:"
echo "🌐 In your browser:"
echo "  1. Hard refresh: Ctrl+F5 (or Cmd+Shift+R on Mac)"
echo "  2. Clear cache: F12 -> Application -> Clear Storage -> Clear site data"
echo "  3. Or open incognito/private window"

echo ""
echo "✅ Client rebuild complete!"

