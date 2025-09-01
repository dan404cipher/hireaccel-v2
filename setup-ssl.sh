#!/bin/bash

# SSL Setup Script for Hire Accel v2
# This script sets up Let's Encrypt SSL certificates

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DOMAIN="hireaccel.v-accel.ai"
EMAIL="support@v-accel.ai"  # Change this to your email
APP_DIR="/opt/hire-accel"

print_status "Setting up SSL certificates for $DOMAIN"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

# Install Certbot
install_certbot() {
    print_status "Installing Certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
    print_success "Certbot installed"
}

# Stop containers temporarily
stop_containers() {
    print_status "Stopping containers temporarily for certificate generation..."
    cd $APP_DIR
    docker-compose -f docker-compose.prod.yml down
    
    # Also stop system nginx if it exists
    systemctl stop nginx 2>/dev/null || true
    systemctl disable nginx 2>/dev/null || true
    
    # Kill any remaining nginx processes
    pkill -f nginx 2>/dev/null || true
    
    # Wait a moment for ports to be released
    sleep 3
    
    print_success "Containers and system nginx stopped"
}

# Generate SSL certificate
generate_certificate() {
    print_status "Generating SSL certificate for $DOMAIN..."
    
    # Use standalone mode since nginx is stopped
    certbot certonly --standalone \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        -d $DOMAIN \
        -d www.$DOMAIN
    
    print_success "SSL certificate generated"
}

# Update nginx configuration for SSL
update_nginx_config() {
    print_status "Updating nginx configuration for SSL..."
    
    cd $APP_DIR
    
    # Backup original config
    cp nginx-production.conf nginx-production.conf.backup
    
    # Create new SSL-enabled config
    cat > nginx-production-ssl.conf << 'EOF'
# Production Nginx configuration for Hire Accel with SSL

# Rate limiting zones (must be in http context)
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name hireaccel.v-accel.ai www.hireaccel.v-accel.ai;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name hireaccel.v-accel.ai www.hireaccel.v-accel.ai;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/hireaccel.v-accel.ai/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hireaccel.v-accel.ai/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://hireaccel.v-accel.ai;" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json
        application/xml
        image/svg+xml;

    # Client (React app) - Serve from client container
    location / {
        proxy_pass http://client:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            proxy_pass http://client:80;
            proxy_set_header Host $host;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API routes - STRIP /api prefix when forwarding
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://api:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # API timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Handle large file uploads
        client_max_body_size 50m;
    }

    # Auth endpoints with stricter rate limiting
    location /api/auth/login {
        limit_req zone=login burst=3 nodelay;
        
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://api:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # File uploads
    location /uploads {
        alias /var/www/uploads;
        expires 1d;
        add_header Cache-Control "public";
    }

    # Health check - direct proxy without /api prefix
    location /health {
        proxy_pass http://api:3001/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        access_log off;
    }

    # Block access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~ /(\.git|\.env|docker-compose|Dockerfile) {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

    print_success "SSL nginx configuration created"
}

# Update docker-compose for SSL
update_docker_compose() {
    print_status "Updating docker-compose for SSL..."
    
    cd $APP_DIR
    
    # Backup original compose file
    cp docker-compose.prod.yml docker-compose.prod.yml.backup
    
    # Update the nginx configuration file reference
    sed -i 's/nginx-production.conf/nginx-production-ssl.conf/' docker-compose.prod.yml
    
    # Add SSL certificate volume mount
    sed -i '/volumes:/a\      - /etc/letsencrypt:/etc/letsencrypt:ro' docker-compose.prod.yml
    
    print_success "Docker compose updated for SSL"
}

# Set up auto-renewal
setup_auto_renewal() {
    print_status "Setting up automatic certificate renewal..."
    
    # Create renewal script
    cat > /usr/local/bin/renew-ssl.sh << 'EOF'
#!/bin/bash
certbot renew --quiet
if [ $? -eq 0 ]; then
    cd /opt/hire-accel
    docker-compose -f docker-compose.prod.yml restart nginx
fi
EOF
    
    chmod +x /usr/local/bin/renew-ssl.sh
    
    # Add to crontab
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/local/bin/renew-ssl.sh") | crontab -
    
    print_success "Auto-renewal configured"
}

# Start containers with SSL
start_containers() {
    print_status "Starting containers with SSL configuration..."
    
    cd $APP_DIR
    docker-compose -f docker-compose.prod.yml up -d
    
    print_success "Containers started with SSL"
}

# Main execution
main() {
    print_status "Starting SSL setup for Hire Accel v2..."
    
    install_certbot
    stop_containers
    generate_certificate
    update_nginx_config
    update_docker_compose
    setup_auto_renewal
    start_containers
    
    print_success "✅ SSL setup completed successfully!"
    
    echo ""
    print_status "Your application is now available at:"
    echo "🌐 https://hireaccel.v-accel.ai"
    echo "🔒 SSL Certificate: Valid"
    echo "🔄 Auto-renewal: Configured"
    
    print_warning "Note: Make sure your domain DNS points to this server IP"
}

# Run main function
main "$@"
