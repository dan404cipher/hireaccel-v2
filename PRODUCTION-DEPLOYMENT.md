# Hire Accel Production Deployment Guide

## Overview
This guide explains the corrected production deployment setup for Hire Accel, fixing the 404 routing issues.

## Problem Analysis
The previous 404 errors were caused by routing mismatches between the client and server:

- **Client Expected**: `https://hireaccel.v-accel.ai/api/auth/login`
- **Server Provided**: `/auth/login` (without `/api` prefix)
- **Result**: 404 errors for authentication endpoints

## Solution
Fixed the routing by ensuring consistency between client requests and server endpoints:

### Server Routes Structure
```
/ (root)
├── /auth/*          (authentication endpoints)
├── /api/v1/*        (API v1 endpoints)
├── /health          (health check)
└── /uploads/*       (file serving)
```

### Client API Configuration
```javascript
// Client calls:
baseURL = "https://hireaccel.v-accel.ai"
- Auth: ${baseURL}/auth/login
- API: ${baseURL}/api/v1/users
- Health: ${baseURL}/health
```

### Nginx Proxy Configuration
```nginx
# Direct proxy - no URL rewriting needed
location /auth { proxy_pass http://localhost:3001; }
location /api { proxy_pass http://localhost:3001; }
location /health { proxy_pass http://localhost:3001/health; }
```

## Production Environment Files

### API Environment (`.env.production`)
```bash
NODE_ENV=production
PORT=3001
MONGO_URI=mongodb+srv://...
JWT_ACCESS_SECRET=change_in_production_32chars_min
JWT_REFRESH_SECRET=change_in_production_32chars_min
CORS_ORIGIN=https://hireaccel.v-accel.ai
# ... other configs
```

### Client Environment (`.env.production`)
```bash
VITE_API_URL=https://hireaccel.v-accel.ai
VITE_NODE_ENV=production
# ... other configs
```

## Deployment Instructions

### 1. Upload Files to Server
```bash
# Copy the updated files to your server
scp api/.env.production root@72.60.96.187:/var/www/hireaccel/api/
scp client/.env.production root@72.60.96.187:/var/www/hireaccel/client/
scp nginx.conf root@72.60.96.187:/etc/nginx/sites-available/hireaccel
```

### 2. Run Deployment Script
```bash
# On your server
chmod +x /path/to/deploy-production-fixed.sh
./deploy-production-fixed.sh
```

### 3. Manual Steps (if needed)
```bash
# Update repository
cd /var/www/hireaccel
git pull origin master

# Copy environment files
cd /var/www/hireaccel/api && cp .env.production .env
cd /var/www/hireaccel/client && cp .env.production .env

# Rebuild client
cd /var/www/hireaccel/client
npm run build

# Restart services
pm2 restart hireaccel-api
systemctl restart nginx
```

## Testing the Fix

### 1. Health Check
```bash
curl https://hireaccel.v-accel.ai/health
```

### 2. Authentication Test
```bash
curl -X POST https://hireaccel.v-accel.ai/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 3. API Test
```bash
curl https://hireaccel.v-accel.ai/api/v1/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Expected API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | User login |
| `/auth/register` | POST | User registration |
| `/auth/refresh` | POST | Token refresh |
| `/auth/me` | GET | Current user |
| `/api/v1/users` | GET | List users |
| `/api/v1/jobs` | GET | List jobs |
| `/api/v1/companies` | GET | List companies |
| `/health` | GET | Health check |
| `/uploads/*` | GET | Static file serving |

## Security Notes

### 1. Change Default Secrets
⚠️ **CRITICAL**: Update these in production:
```bash
JWT_ACCESS_SECRET=your_secure_32char_secret_here
JWT_REFRESH_SECRET=your_secure_32char_secret_here
SESSION_SECRET=your_secure_32char_secret_here
```

### 2. SSL Certificate
```bash
# Install Let's Encrypt SSL
apt install certbot python3-certbot-nginx
certbot --nginx -d hireaccel.v-accel.ai
```

## Troubleshooting

### Check PM2 Status
```bash
pm2 status
pm2 logs hireaccel-api
```

### Check Nginx
```bash
systemctl status nginx
nginx -t
tail -f /var/log/nginx/error.log
```

### Check Application Logs
```bash
tail -f /var/log/hireaccel/api-combined.log
```

### Common Issues

1. **404 on /auth/login**
   - Check Nginx configuration
   - Verify API server is running on port 3001
   - Check client environment VITE_API_URL

2. **CORS Errors**
   - Verify CORS_ORIGIN in API .env
   - Check client domain matches CORS_ORIGIN

3. **File Upload Issues**
   - Check uploads directory permissions: `chmod 755 /var/www/hireaccel/api/uploads`
   - Verify Nginx alias path

## File Structure
```
/var/www/hireaccel/
├── api/
│   ├── .env (copied from .env.production)
│   ├── src/
│   └── uploads/
├── client/
│   ├── .env (copied from .env.production)
│   └── dist/
└── ecosystem.config.js
```

This setup ensures proper routing and eliminates the 404 errors you were experiencing.
