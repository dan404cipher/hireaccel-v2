#!/bin/bash

# Hire Accel v2 - Ubuntu Server Deployment Script
# This script automates the deployment process on Ubuntu

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
        exit 1
    fi
}

# Check Ubuntu version
check_ubuntu() {
    if ! grep -q "Ubuntu" /etc/os-release; then
        print_error "This script is designed for Ubuntu. Detected: $(lsb_release -d | cut -f2)"
        exit 1
    fi
    print_success "Ubuntu detected: $(lsb_release -d | cut -f2)"
}

# Update system packages
update_system() {
    print_status "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    print_success "System packages updated"
}

# Install Docker
install_docker() {
    if command -v docker &> /dev/null; then
        print_success "Docker is already installed"
        return
    fi

    print_status "Installing Docker..."
    
    # Remove old versions
    sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Install prerequisites
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    
    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Set up repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    print_success "Docker installed successfully"
    print_warning "Please log out and log back in for docker group changes to take effect"
}

# Install Docker Compose
install_docker_compose() {
    if command -v docker-compose &> /dev/null; then
        print_success "Docker Compose is already installed"
        return
    fi

    print_status "Installing Docker Compose..."
    
    # Download latest version
    DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # Make executable
    sudo chmod +x /usr/local/bin/docker-compose
    
    print_success "Docker Compose installed: $(/usr/local/bin/docker-compose --version)"
}

# Install additional tools
install_tools() {
    print_status "Installing additional tools..."
    sudo apt-get install -y git curl wget unzip nginx-core ufw fail2ban htop
    print_success "Additional tools installed"
}

# Configure firewall
configure_firewall() {
    print_status "Configuring UFW firewall..."
    
    # Reset UFW to defaults
    sudo ufw --force reset
    
    # Set default policies
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    
    # Allow SSH (adjust port if needed)
    sudo ufw allow ssh
    
    # Allow HTTP and HTTPS
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    # Enable UFW
    sudo ufw --force enable
    
    print_success "Firewall configured"
    sudo ufw status verbose
}

# Configure fail2ban
configure_fail2ban() {
    print_status "Configuring fail2ban..."
    
    # Create custom jail configuration
    sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-req-limit]
enabled = true
filter = nginx-req-limit
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

    sudo systemctl restart fail2ban
    sudo systemctl enable fail2ban
    
    print_success "Fail2ban configured"
}

# Setup application directory
setup_app_directory() {
    APP_DIR="/opt/hire-accel"
    
    print_status "Setting up application directory..."
    
    # Create directory structure
    sudo mkdir -p $APP_DIR
    sudo chown $USER:$USER $APP_DIR
    
    print_success "Application directory created: $APP_DIR"
    echo "APP_DIR=$APP_DIR"
}

# Main installation function
main() {
    print_status "Starting Hire Accel v2 Ubuntu Server Setup..."
    
    check_root
    check_ubuntu
    update_system
    install_docker
    install_docker_compose
    install_tools
    configure_firewall
    configure_fail2ban
    setup_app_directory
    
    print_success "✅ Server setup completed successfully!"
    print_status "Next steps:"
    echo "1. Log out and log back in to apply docker group changes"
    echo "2. Transfer your application files to /opt/hire-accel/"
    echo "3. Copy .env.production.example to .env.production and configure with your secrets"
    echo "4. Run the deployment with: cd /opt/hire-accel && docker-compose -f docker-compose.prod.yml up -d"
    echo "5. Set up SSL certificates (recommended)"
    
    print_warning "Remember to:"
    echo "- Change default SSH port (optional but recommended)"
    echo "- Set up regular backups"
    echo "- Configure monitoring"
    echo "- Copy .env.production.example to .env.production and update JWT secrets"
    echo "- Generate strong secrets with: openssl rand -base64 64"
}

# Run main function
main "$@"
