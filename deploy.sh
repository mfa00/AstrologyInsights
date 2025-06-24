#!/bin/bash

# Astrology Insights Deployment Script for Linux
# This script sets up the application with Nginx, SSL, and PM2

set -e  # Exit on any error

# Configuration
APP_NAME="astrologyinsights"
APP_USER="astrologyinsights"
APP_DIR="/var/www/astrologyinsights"
DOMAIN="astrologyinsights.ge"
NODE_VERSION="18"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
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

# Update system packages
update_system() {
    print_status "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    print_success "System packages updated"
}

# Install Node.js
install_nodejs() {
    print_status "Installing Node.js ${NODE_VERSION}..."
    
    # Install Node.js using NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Install global packages
    sudo npm install -g pm2@latest
    
    print_success "Node.js $(node --version) and PM2 installed"
}

# Install Nginx
install_nginx() {
    print_status "Installing Nginx..."
    sudo apt install -y nginx
    sudo systemctl enable nginx
    print_success "Nginx installed and enabled"
}

# Install PostgreSQL
install_postgresql() {
    print_status "Installing PostgreSQL..."
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl enable postgresql
    sudo systemctl start postgresql
    print_success "PostgreSQL installed and started"
}

# Create application user
create_app_user() {
    print_status "Creating application user..."
    
    if ! id "$APP_USER" &>/dev/null; then
        sudo useradd -m -s /bin/bash $APP_USER
        sudo usermod -aG www-data $APP_USER
        print_success "User $APP_USER created"
    else
        print_warning "User $APP_USER already exists"
    fi
}

# Setup application directory
setup_app_directory() {
    print_status "Setting up application directory..."
    
    sudo mkdir -p $APP_DIR
    sudo chown $APP_USER:www-data $APP_DIR
    sudo chmod 755 $APP_DIR
    
    print_success "Application directory setup complete"
}

# Setup database
setup_database() {
    print_status "Setting up PostgreSQL database..."
    
    # Create database user and database
    sudo -u postgres psql -c "CREATE USER $APP_USER WITH PASSWORD 'your_secure_password_here';" || true
    sudo -u postgres psql -c "CREATE DATABASE $APP_NAME OWNER $APP_USER;" || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $APP_NAME TO $APP_USER;" || true
    
    print_success "Database setup complete"
    print_warning "Please update the database password in your .env file"
}

# Deploy application code
deploy_application() {
    print_status "Deploying application code..."
    
    # Copy application files
    sudo cp -r . $APP_DIR/
    sudo chown -R $APP_USER:www-data $APP_DIR
    
    # Install dependencies
    cd $APP_DIR
    sudo -u $APP_USER npm ci --production
    
    # Build the application
    sudo -u $APP_USER npm run build
    
    print_success "Application deployed and built"
}

# Setup environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    sudo -u $APP_USER tee $APP_DIR/.env > /dev/null <<EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://$APP_USER:your_secure_password_here@localhost:5432/$APP_NAME
SESSION_SECRET=$(openssl rand -base64 32)
VITE_API_URL=https://$DOMAIN/api
EOF

    sudo chmod 600 $APP_DIR/.env
    print_success "Environment variables configured"
    print_warning "Please update DATABASE_URL with your actual database password"
}

# Setup PM2
setup_pm2() {
    print_status "Setting up PM2..."
    
    # Create PM2 ecosystem file
    sudo -u $APP_USER tee $APP_DIR/ecosystem.config.js > /dev/null <<EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx',
    cwd: '$APP_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    log_file: '$APP_DIR/logs/combined.log',
    out_file: '$APP_DIR/logs/out.log',
    error_file: '$APP_DIR/logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    restart_delay: 5000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

    # Create logs directory
    sudo -u $APP_USER mkdir -p $APP_DIR/logs
    
    # Start application with PM2
    cd $APP_DIR
    sudo -u $APP_USER pm2 start ecosystem.config.js
    sudo -u $APP_USER pm2 save
    
    # Setup PM2 startup
    sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $APP_USER --hp /home/$APP_USER
    
    print_success "PM2 configured and application started"
}

# Setup Nginx configuration
setup_nginx() {
    print_status "Setting up Nginx configuration..."
    
    # Copy Nginx configuration
    sudo cp nginx.conf /etc/nginx/sites-available/$APP_NAME
    
    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    
    # Remove default Nginx site
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    sudo nginx -t
    
    print_success "Nginx configuration setup complete"
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    print_status "Setting up SSL with Let's Encrypt..."
    
    # Install Certbot
    sudo apt install -y certbot python3-certbot-nginx
    
    # Create temporary Nginx config for initial certificate
    sudo tee /etc/nginx/sites-available/${APP_NAME}_temp > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}
EOF

    sudo ln -sf /etc/nginx/sites-available/${APP_NAME}_temp /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/$APP_NAME
    sudo systemctl reload nginx
    
    # Obtain SSL certificate
    sudo certbot certonly --webroot -w /var/www/html -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    # Switch back to main configuration
    sudo rm -f /etc/nginx/sites-enabled/${APP_NAME}_temp
    sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    
    # Setup automatic renewal
    sudo systemctl enable certbot.timer
    
    print_success "SSL certificate obtained and configured"
}

# Setup firewall
setup_firewall() {
    print_status "Setting up firewall..."
    
    sudo ufw --force enable
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow 'Nginx Full'
    
    print_success "Firewall configured"
}

# Start services
start_services() {
    print_status "Starting services..."
    
    sudo systemctl restart nginx
    sudo systemctl restart postgresql
    
    print_success "All services started"
}

# Main deployment function
main() {
    print_status "Starting Astrology Insights deployment..."
    
    check_root
    update_system
    install_nodejs
    install_nginx
    install_postgresql
    create_app_user
    setup_app_directory
    setup_database
    deploy_application
    setup_environment
    setup_pm2
    setup_nginx
    setup_ssl
    setup_firewall
    start_services
    
    print_success "🎉 Deployment completed successfully!"
    echo ""
    print_status "Your application is now running at: https://$DOMAIN"
    print_status "PM2 status: pm2 status"
    print_status "View logs: pm2 logs $APP_NAME"
    print_status "Restart app: pm2 restart $APP_NAME"
    echo ""
    print_warning "Don't forget to:"
    echo "1. Update the database password in $APP_DIR/.env"
    echo "2. Configure your DNS to point to this server"
    echo "3. Update the domain name in nginx.conf if different"
    echo "4. Test the application thoroughly"
}

# Run the deployment
main "$@" 