#!/bin/bash
# Production Deployment Script for Hire Accel
# Domain: hireaccel.v-accel.ai
# Server: 72.60.96.187

set -e  # Exit on any error

echo "🚀 Starting Hire Accel Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="hireaccel.v-accel.ai"
APP_DIR="/var/www/hire-accel"
API_PORT=3001
CLIENT_PORT=3000
NGINX_SITES="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo -e "  Domain: ${GREEN}$DOMAIN${NC}"
echo -e "  App Directory: ${GREEN}$APP_DIR${NC}"
echo -e "  API Port: ${GREEN}$API_PORT${NC}"
echo -e "  Client Port: ${GREEN}$CLIENT_PORT${NC}"
echo ""

# Step 1: System Update and Package Installation
echo -e "${YELLOW}📦 Step 1: Updating system and installing packages...${NC}"
apt update && apt upgrade -y
apt install -y curl git nginx ufw fail2ban

# Step 2: Install Node.js 18.x
echo -e "${YELLOW}📦 Step 2: Installing Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Verify installations
echo -e "${GREEN}✅ Node.js version: $(node --version)${NC}"
echo -e "${GREEN}✅ NPM version: $(npm --version)${NC}"

# Step 3: Install PM2
echo -e "${YELLOW}📦 Step 3: Installing PM2...${NC}"
npm install -g pm2

# Step 4: Create application directory
echo -e "${YELLOW}📁 Step 4: Setting up application directory...${NC}"
mkdir -p $APP_DIR
cd $APP_DIR

# Step 5: Clone repository
echo -e "${YELLOW}📥 Step 5: Cloning repository...${NC}"
if [ -d ".git" ]; then
    echo "Repository already exists, pulling latest changes..."
    git pull origin master
else
    git clone https://github.com/dan404cipher/hire-accel.git .
fi

# Step 6: Install API dependencies
echo -e "${YELLOW}📦 Step 6: Installing API dependencies...${NC}"
cd $APP_DIR/api
cp .env.production .env
npm install --production

# Step 7: Install Client dependencies and build
echo -e "${YELLOW}📦 Step 7: Installing Client dependencies and building...${NC}"
cd $APP_DIR/client
cp .env.production .env
npm install
npm run build

# Step 8: Create PM2 ecosystem file
echo -e "${YELLOW}⚙️  Step 8: Creating PM2 configuration...${NC}"
cat > $APP_DIR/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'hire-accel-api',
      script: './api/src/server.ts',
      cwd: '/var/www/hire-accel',
      interpreter: 'node',
      interpreter_args: '--loader ts-node/esm',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/hire-accel/api-error.log',
      out_file: '/var/log/hire-accel/api-out.log',
      log_file: '/var/log/hire-accel/api-combined.log'
    }
  ]
};
EOF

# Step 9: Create log directory
echo -e "${YELLOW}📝 Step 9: Setting up logging...${NC}"
mkdir -p /var/log/hire-accel
chmod 755 /var/log/hire-accel

# Step 10: Install ts-node for TypeScript execution
echo -e "${YELLOW}📦 Step 10: Installing TypeScript runner...${NC}"
cd $APP_DIR/api
npm install -g ts-node typescript

# Step 11: Run database seed
echo -e "${YELLOW}🌱 Step 11: Seeding database...${NC}"
cd $APP_DIR/api
npm run seed

# Step 12: Start PM2 processes
echo -e "${YELLOW}🚀 Step 12: Starting application with PM2...${NC}"
cd $APP_DIR
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Step 13: Configure Nginx
echo -e "${YELLOW}🌐 Step 13: Configuring Nginx...${NC}"
cat > $NGINX_SITES/hire-accel << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Client (React app) - Serve static files
    location / {
        root $APP_DIR/client/dist;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API routes
    location /api {
        proxy_pass http://localhost:$API_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # API timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # File uploads
    location /uploads {
        alias $APP_DIR/api/uploads;
        expires 1d;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:$API_PORT/health;
    }
}
EOF

# Enable the site
ln -sf $NGINX_SITES/hire-accel $NGINX_ENABLED/
rm -f $NGINX_ENABLED/default

# Test Nginx configuration
nginx -t

# Step 14: Configure Firewall
echo -e "${YELLOW}🔥 Step 14: Configuring firewall...${NC}"
ufw --force enable
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 80
ufw allow 443

# Step 15: Start services
echo -e "${YELLOW}🔄 Step 15: Starting services...${NC}"
systemctl enable nginx
systemctl restart nginx
systemctl enable fail2ban
systemctl restart fail2ban

# Step 16: Install SSL with Let's Encrypt (optional)
echo -e "${YELLOW}🔒 Step 16: Setting up SSL (optional)...${NC}"
echo "To set up SSL, run: certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo "First install certbot: apt install certbot python3-certbot-nginx"

# Step 17: Final status check
echo -e "${YELLOW}✅ Step 17: Checking deployment status...${NC}"
pm2 status
systemctl status nginx --no-pager -l

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "  1. Point your domain ${GREEN}$DOMAIN${NC} to this server IP: ${GREEN}72.60.96.187${NC}"
echo -e "  2. Install SSL certificate: ${YELLOW}certbot --nginx -d $DOMAIN${NC}"
echo -e "  3. Test your application at: ${GREEN}http://$DOMAIN${NC}"
echo ""
echo -e "${BLUE}📊 Useful Commands:${NC}"
echo -e "  Monitor logs: ${YELLOW}pm2 logs${NC}"
echo -e "  Restart API: ${YELLOW}pm2 restart hire-accel-api${NC}"
echo -e "  Check Nginx: ${YELLOW}systemctl status nginx${NC}"
echo -e "  View Nginx logs: ${YELLOW}tail -f /var/log/nginx/error.log${NC}"
echo ""
echo -e "${GREEN}✨ Your Hire Accel application is now running in production!${NC}"
