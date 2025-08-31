#!/bin/bash
# Quick fix for Nginx configuration issue

echo "🔧 Fixing Nginx configuration..."

# Create the corrected Nginx configuration
cat > /etc/nginx/sites-available/hireaccel << 'EOF'
server {
    listen 80;
    server_name hireaccel.v-accel.ai www.hireaccel.v-accel.ai;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Client (React app) - Serve static files
    location / {
        root /var/www/hireaccel/client/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Authentication routes
    location /auth {
        proxy_pass http://localhost:3001;
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
    }

    # API v1 routes
    location /api {
        proxy_pass http://localhost:3001;
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
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3001/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # File uploads - serve uploaded files
    location /uploads {
        alias /var/www/hireaccel/api/uploads;
        expires 1d;
        add_header Cache-Control "public";
    }

    # Block access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~* \.(env|log)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

echo "✅ Configuration updated"

# Test the configuration
echo "🧪 Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuration test passed"
    echo "🔄 Restarting Nginx..."
    systemctl restart nginx
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx restarted successfully"
        echo "🎉 Fix applied successfully!"
        
        # Test the endpoints
        echo "🧪 Testing endpoints..."
        echo "Health check:"
        curl -s http://localhost/health | head -1
        
        systemctl status nginx --no-pager -l
    else
        echo "❌ Failed to restart Nginx"
        systemctl status nginx --no-pager -l
    fi
else
    echo "❌ Configuration test failed"
    echo "Please check the configuration manually"
fi

