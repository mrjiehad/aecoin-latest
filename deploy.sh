#!/bin/bash

################################################################################
# AECOIN Store - Automated VPS Deployment Script
# 
# This script automates the complete deployment of AECOIN Store on any VPS
# Supports: Ubuntu 20.04+, Debian 11+, CentOS 8+, RHEL 8+
#
# Usage: sudo ./deploy.sh
################################################################################

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration variables
APP_NAME="aecoin-store"
APP_DIR="/var/www/aecoin-store"
LOG_DIR="/var/log/pm2"
BACKUP_DIR="/var/backups/aecoin-store"
NODE_VERSION="20"

################################################################################
# Helper Functions
################################################################################

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Detect OS and package manager
detect_os() {
    print_header "Detecting Operating System"
    
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        OS_VERSION=$VERSION_ID
    else
        print_error "Cannot detect OS. /etc/os-release not found"
        exit 1
    fi
    
    case $OS in
        ubuntu|debian)
            PKG_MANAGER="apt"
            PKG_UPDATE="apt update"
            PKG_INSTALL="apt install -y"
            ;;
        centos|rhel|fedora)
            PKG_MANAGER="yum"
            PKG_UPDATE="yum update -y"
            PKG_INSTALL="yum install -y"
            ;;
        *)
            print_error "Unsupported OS: $OS"
            exit 1
            ;;
    esac
    
    print_success "Detected: $OS $OS_VERSION"
    print_info "Package Manager: $PKG_MANAGER"
}

# Update system
update_system() {
    print_header "Updating System Packages"
    $PKG_UPDATE
    print_success "System updated"
}

# Install essential tools
install_essentials() {
    print_header "Installing Essential Tools"
    
    if [ "$PKG_MANAGER" = "apt" ]; then
        $PKG_INSTALL curl git build-essential nginx certbot python3-certbot-nginx ufw
    else
        $PKG_INSTALL curl git gcc gcc-c++ make nginx certbot python3-certbot-nginx firewalld
    fi
    
    print_success "Essential tools installed"
}

# Configure firewall
configure_firewall() {
    print_header "Configuring Firewall"
    
    if [ "$PKG_MANAGER" = "apt" ]; then
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw --force enable
        print_success "UFW firewall configured"
    else
        systemctl start firewalld
        systemctl enable firewalld
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        firewall-cmd --reload
        print_success "Firewalld configured"
    fi
}

# Install Node.js
install_nodejs() {
    print_header "Installing Node.js $NODE_VERSION"
    
    # Check if Node.js is already installed
    if command -v node &> /dev/null; then
        CURRENT_NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$CURRENT_NODE_VERSION" = "$NODE_VERSION" ]; then
            print_success "Node.js $NODE_VERSION already installed"
            return
        fi
    fi
    
    # Install Node.js via NodeSource
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    
    if [ "$PKG_MANAGER" = "apt" ]; then
        apt install -y nodejs
    else
        yum install -y nodejs
    fi
    
    # Verify installation
    node --version
    npm --version
    print_success "Node.js $NODE_VERSION installed"
}

# Install PostgreSQL
install_postgresql() {
    print_header "Installing PostgreSQL"
    
    if [ "$PKG_MANAGER" = "apt" ]; then
        $PKG_INSTALL postgresql postgresql-contrib
    else
        $PKG_INSTALL postgresql-server postgresql-contrib
        postgresql-setup --initdb
    fi
    
    systemctl start postgresql
    systemctl enable postgresql
    print_success "PostgreSQL installed and started"
}

# Install MySQL
install_mysql() {
    print_header "Installing MySQL"
    
    # Ask if MySQL is needed
    echo -n "Do you need local MySQL for FiveM? (y/N): "
    read -r INSTALL_MYSQL
    
    if [[ "$INSTALL_MYSQL" =~ ^[Yy]$ ]]; then
        if [ "$PKG_MANAGER" = "apt" ]; then
            $PKG_INSTALL mysql-server
        else
            $PKG_INSTALL mysql-server
        fi
        
        systemctl start mysqld || systemctl start mysql
        systemctl enable mysqld || systemctl enable mysql
        print_success "MySQL installed and started"
        
        # Note about mysql_secure_installation
        print_warning "Run 'mysql_secure_installation' after deployment to secure MySQL"
    else
        print_info "Skipping MySQL installation (using remote FiveM database)"
    fi
}

# Collect configuration from user
collect_config() {
    print_header "Configuration Setup"
    
    echo -e "${YELLOW}Please provide the following information:${NC}\n"
    
    # Domain
    read -p "Enter your domain name (e.g., aeofficial.my): " DOMAIN
    
    # Database passwords
    read -sp "Enter PostgreSQL password for aecoin_user: " PG_PASSWORD
    echo
    read -sp "Confirm PostgreSQL password: " PG_PASSWORD_CONFIRM
    echo
    
    if [ "$PG_PASSWORD" != "$PG_PASSWORD_CONFIRM" ]; then
        print_error "Passwords do not match"
        exit 1
    fi
    
    # FiveM Database
    echo -e "\n${BLUE}FiveM Database Configuration${NC}"
    read -p "Enter FiveM MySQL host (IP or hostname): " FIVEM_HOST
    read -p "Enter FiveM MySQL port (default 3306): " FIVEM_PORT
    FIVEM_PORT=${FIVEM_PORT:-3306}
    read -p "Enter FiveM MySQL database name: " FIVEM_DB
    read -p "Enter FiveM MySQL username: " FIVEM_USER
    read -sp "Enter FiveM MySQL password: " FIVEM_PASSWORD
    echo
    read -p "Enter FiveM table name (default: ak4y_donatesystem_codes): " FIVEM_TABLE
    FIVEM_TABLE=${FIVEM_TABLE:-ak4y_donatesystem_codes}
    read -p "Enter FiveM code column name (default: code): " FIVEM_CODE_COLUMN
    FIVEM_CODE_COLUMN=${FIVEM_CODE_COLUMN:-code}
    read -p "Enter FiveM credits column name (default: creditsvalue): " FIVEM_CREDITS_COLUMN
    FIVEM_CREDITS_COLUMN=${FIVEM_CREDITS_COLUMN:-creditsvalue}
    
    # Discord OAuth
    echo -e "\n${BLUE}Discord OAuth Configuration${NC}"
    read -p "Enter Discord Client ID: " DISCORD_CLIENT_ID
    read -p "Enter Discord Client Secret: " DISCORD_CLIENT_SECRET
    
    # ToyyibPay
    echo -e "\n${BLUE}ToyyibPay Configuration (Malaysian Payment Gateway)${NC}"
    read -p "Enter ToyyibPay Secret Key: " TOYYIBPAY_SECRET_KEY
    
    # Billplz
    echo -e "\n${BLUE}Billplz Configuration (Malaysian Payment Gateway)${NC}"
    read -p "Enter Billplz API Secret Key: " BILLPLZ_SECRET_KEY
    read -p "Enter Billplz X Signature Key: " BILLPLZ_SIGNATURE_KEY
    
    # SSL Configuration
    echo -e "\n${BLUE}SSL Certificate Configuration${NC}"
    echo -n "Do you want to enable SSL/HTTPS with Let's Encrypt? (y/N): "
    read -r ENABLE_SSL
    
    if [[ "$ENABLE_SSL" =~ ^[Yy]$ ]]; then
        read -p "Enter admin email for SSL certificate: " ADMIN_EMAIL
        print_info "SSL will be configured after Nginx setup"
    else
        print_info "Skipping SSL configuration (you can enable it later)"
    fi
    
    # Repository URL
    echo -e "\n${BLUE}Repository Configuration${NC}"
    read -p "Enter Git repository URL (or press Enter to skip): " REPO_URL
    
    print_success "Configuration collected"
}

# Setup PostgreSQL database
setup_postgresql() {
    print_header "Setting up PostgreSQL Database"
    
    sudo -u postgres psql <<EOF
CREATE DATABASE aecoin_store;
CREATE USER aecoin_user WITH PASSWORD '$PG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE aecoin_store TO aecoin_user;
ALTER DATABASE aecoin_store OWNER TO aecoin_user;
\c aecoin_store
GRANT ALL ON SCHEMA public TO aecoin_user;
\q
EOF
    
    print_success "PostgreSQL database configured"
}

# Clone or upload application
setup_application() {
    print_header "Setting up Application"
    
    # Create app directory
    mkdir -p $APP_DIR
    
    if [ -n "$REPO_URL" ]; then
        print_info "Cloning repository from $REPO_URL"
        git clone $REPO_URL $APP_DIR
    else
        print_warning "No repository URL provided"
        print_info "Please upload your application files to $APP_DIR manually"
        echo -n "Press Enter when files are uploaded..."
        read
    fi
    
    cd $APP_DIR
    
    # Install dependencies (including devDependencies for drizzle-kit)
    print_info "Installing dependencies..."
    npm install
    
    print_success "Application setup complete"
}

# Create environment file
create_env_file() {
    print_header "Creating Environment Configuration"
    
    # Generate session secret
    SESSION_SECRET=$(openssl rand -base64 32)
    
    cat > $APP_DIR/.env <<EOF
# Application
NODE_ENV=production
PORT=5000

# PostgreSQL Database
DATABASE_URL=postgresql://aecoin_user:$PG_PASSWORD@localhost:5432/aecoin_store
PGHOST=localhost
PGPORT=5432
PGUSER=aecoin_user
PGPASSWORD=$PG_PASSWORD
PGDATABASE=aecoin_store

# FiveM MySQL Database
FIVEM_DB_HOST=$FIVEM_HOST
FIVEM_DB_PORT=$FIVEM_PORT
FIVEM_DB_USER=$FIVEM_USER
FIVEM_DB_PASSWORD=$FIVEM_PASSWORD
FIVEM_DB_NAME=$FIVEM_DB
FIVEM_DB_TABLE=$FIVEM_TABLE
FIVEM_DB_COLUMN_CODE=$FIVEM_CODE_COLUMN
FIVEM_DB_COLUMN_CREDITSVALUE=$FIVEM_CREDITS_COLUMN

# Discord OAuth
DISCORD_CLIENT_ID=$DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET=$DISCORD_CLIENT_SECRET
DISCORD_REDIRECT_URI=https://$DOMAIN/api/auth/discord/callback

# ToyyibPay Payment Gateway (Malaysia)
TOYYIBPAY_SECRET_KEY=$TOYYIBPAY_SECRET_KEY

# Billplz Payment Gateway (Malaysia)
BILLPLZ_SECRET_KEY=$BILLPLZ_SECRET_KEY
BILLPLZ_SIGNATURE_KEY=$BILLPLZ_SIGNATURE_KEY

# Session Security
SESSION_SECRET=$SESSION_SECRET
EOF
    
    chmod 600 $APP_DIR/.env
    print_success "Environment file created"
}

# Run database migrations
run_migrations() {
    print_header "Running Database Migrations"
    
    cd $APP_DIR
    npm run db:push
    
    print_success "Database schema created"
}

# Build application
build_application() {
    print_header "Building Application"
    
    cd $APP_DIR
    npm run build
    
    print_success "Application built successfully"
}

# Install and configure PM2
setup_pm2() {
    print_header "Setting up PM2 Process Manager"
    
    # Install PM2 globally
    npm install -g pm2
    
    # Create log directory
    mkdir -p $LOG_DIR
    
    # Create PM2 ecosystem file
    cat > $APP_DIR/ecosystem.config.cjs <<'EOF'
module.exports = {
  apps: [{
    name: 'aecoin-store',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/aecoin-store',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/pm2/aecoin-error.log',
    out_file: '/var/log/pm2/aecoin-out.log',
    log_file: '/var/log/pm2/aecoin-combined.log',
    time: true
  }]
};
EOF
    
    # Start application with PM2
    cd $APP_DIR
    pm2 start ecosystem.config.cjs
    pm2 save
    
    # Setup PM2 startup script
    pm2 startup systemd -u root --hp /root
    
    print_success "PM2 configured and application started"
}

# Configure Nginx
setup_nginx() {
    print_header "Configuring Nginx"
    
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/$APP_NAME <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Payment gateway callback endpoints
    location ~ ^/api/(toyyibpay-return|billplz-callback) {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    client_max_body_size 10M;
}
EOF
    
    # Enable site
    if [ "$PKG_MANAGER" = "apt" ]; then
        ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
    else
        ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/conf.d/$APP_NAME.conf
    fi
    
    # Test configuration
    nginx -t
    
    # Reload Nginx
    systemctl reload nginx
    
    print_success "Nginx configured"
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    if [[ ! "$ENABLE_SSL" =~ ^[Yy]$ ]]; then
        print_info "Skipping SSL setup (not enabled)"
        return 0
    fi
    
    print_header "Setting up SSL Certificate"
    
    print_warning "Make sure your domain DNS is pointing to this server's IP address"
    echo -n "Continue with SSL setup? (y/N): "
    read -r CONFIRM_SSL
    
    if [[ ! "$CONFIRM_SSL" =~ ^[Yy]$ ]]; then
        print_info "SSL setup skipped. You can run certbot manually later:"
        echo -e "${YELLOW}  sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN${NC}"
        return 0
    fi
    
    # Obtain certificate
    if certbot --nginx -d $DOMAIN -d www.$DOMAIN \
        --non-interactive \
        --agree-tos \
        --email $ADMIN_EMAIL \
        --redirect; then
        
        # Test auto-renewal
        certbot renew --dry-run
        print_success "SSL certificate installed"
    else
        print_error "SSL certificate installation failed"
        print_info "You can run certbot manually later after fixing DNS:"
        echo -e "${YELLOW}  sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN${NC}"
        return 0
    fi
}

# Setup backup cron job
setup_backup() {
    print_header "Setting up Automated Backups"
    
    # Create backup directory
    mkdir -p $BACKUP_DIR
    
    # Create backup script
    cat > $APP_DIR/backup.sh <<'EOF'
#!/bin/bash

BACKUP_DIR="/var/backups/aecoin-store"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup PostgreSQL
pg_dump $DATABASE_URL > $BACKUP_DIR/postgres_$DATE.sql

# Backup .env
cp /var/www/aecoin-store/.env $BACKUP_DIR/env_$DATE.backup

# Compress
tar -czf $BACKUP_DIR/aecoin_backup_$DATE.tar.gz \
  $BACKUP_DIR/postgres_$DATE.sql \
  $BACKUP_DIR/env_$DATE.backup

# Cleanup
rm $BACKUP_DIR/postgres_$DATE.sql $BACKUP_DIR/env_$DATE.backup

# Remove old backups (keep 7 days)
find $BACKUP_DIR -name "aecoin_backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/aecoin_backup_$DATE.tar.gz"
EOF
    
    chmod +x $APP_DIR/backup.sh
    
    # Add to crontab (daily at 2 AM)
    (crontab -l 2>/dev/null; echo "0 2 * * * $APP_DIR/backup.sh >> /var/log/aecoin-backup.log 2>&1") | crontab -
    
    print_success "Backup automation configured"
}

# Verify deployment
verify_deployment() {
    print_header "Verifying Deployment"
    
    # Check if app is running
    if pm2 list | grep -q "aecoin-store.*online"; then
        print_success "Application is running"
    else
        print_error "Application is not running"
        print_info "Check logs: pm2 logs aecoin-store"
    fi
    
    # Check Nginx
    if systemctl is-active --quiet nginx; then
        print_success "Nginx is running"
    else
        print_error "Nginx is not running"
    fi
    
    # Check PostgreSQL
    if systemctl is-active --quiet postgresql; then
        print_success "PostgreSQL is running"
    else
        print_error "PostgreSQL is not running"
    fi
    
    # Check SSL certificate
    if certbot certificates | grep -q "$DOMAIN"; then
        print_success "SSL certificate installed"
    else
        print_warning "SSL certificate not found"
    fi
    
    # Test application endpoint
    if curl -s http://localhost:5000 > /dev/null; then
        print_success "Application responding on port 5000"
    else
        print_error "Application not responding"
    fi
}

# Print deployment summary
print_summary() {
    print_header "Deployment Summary"
    
    echo -e "${GREEN}Deployment completed successfully!${NC}\n"
    
    echo -e "${BLUE}Application Details:${NC}"
    echo -e "  URL: https://$DOMAIN"
    echo -e "  App Directory: $APP_DIR"
    echo -e "  Log Directory: $LOG_DIR"
    echo -e "  Backup Directory: $BACKUP_DIR"
    
    echo -e "\n${BLUE}Useful Commands:${NC}"
    echo -e "  PM2 Status:    pm2 status"
    echo -e "  PM2 Logs:      pm2 logs aecoin-store"
    echo -e "  PM2 Restart:   pm2 restart aecoin-store"
    echo -e "  Nginx Reload:  systemctl reload nginx"
    echo -e "  View Backups:  ls -lh $BACKUP_DIR"
    
    echo -e "\n${BLUE}Next Steps:${NC}"
    echo -e "  1. Configure payment gateway callback URLs:"
    echo -e "     - ToyyibPay Return URL: https://$DOMAIN/api/toyyibpay-return"
    echo -e "     - Billplz Callback URL: https://$DOMAIN/api/billplz-callback"
    echo -e "  2. Update Discord OAuth redirect URI:"
    echo -e "     - https://$DOMAIN/api/auth/discord/callback"
    echo -e "  3. Test the application at https://$DOMAIN"
    
    echo -e "\n${YELLOW}Security Reminders:${NC}"
    echo -e "  - Run 'mysql_secure_installation' if MySQL was installed"
    echo -e "  - Keep your system updated: apt update && apt upgrade"
    echo -e "  - Monitor logs regularly: pm2 logs aecoin-store"
    echo -e "  - Backup .env file securely"
    
    echo -e "\n${GREEN}🚀 AECOIN Store is now live!${NC}\n"
}

################################################################################
# Main Execution
################################################################################

main() {
    clear
    
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║          AECOIN Store - Automated Deployment             ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
    
    # Pre-flight checks
    check_root
    
    # Detect OS
    detect_os
    
    # Collect configuration
    collect_config
    
    # System setup
    update_system
    install_essentials
    configure_firewall
    
    # Install software
    install_nodejs
    install_postgresql
    install_mysql
    
    # Database setup
    setup_postgresql
    
    # Application setup
    setup_application
    create_env_file
    run_migrations
    build_application
    
    # Process management
    setup_pm2
    
    # Web server
    setup_nginx
    setup_ssl
    
    # Backup automation
    setup_backup
    
    # Verification
    verify_deployment
    
    # Summary
    print_summary
}

# Run main function
main "$@"
