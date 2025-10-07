# AECOIN Store - Multi-VPS Production Deployment Guide

Complete step-by-step guide for deploying AECOIN Store to any VPS provider.

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Provider-Specific Setup](#provider-specific-setup)
3. [Automated Deployment](#automated-deployment)
4. [Manual Deployment Steps](#manual-deployment-steps)
5. [Payment Gateway Configuration](#payment-gateway-configuration)
6. [SSL/HTTPS Setup](#ssl-https-setup)
7. [Security Hardening](#security-hardening)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup & Restore](#backup--restore)
10. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Specifications
- **OS**: Ubuntu 20.04/22.04 LTS, Debian 11+, CentOS 8+, or RHEL 8+
- **RAM**: 2GB (4GB recommended for production)
- **Storage**: 20GB SSD
- **CPU**: 2 cores
- **Network**: 1Gbps network interface

### Required Software
- Node.js 20.x
- PostgreSQL 13+ (main database)
- MySQL 8.0+ (FiveM integration)
- Nginx (reverse proxy)
- PM2 (process manager)
- Certbot (SSL certificates)

### Domain Requirements
- Domain name pointed to your VPS IP
- DNS A records configured
- SSL certificate (free via Let's Encrypt)

---

## Provider-Specific Setup

### DigitalOcean

1. **Create Droplet**
```bash
# Via CLI (requires doctl)
doctl compute droplet create aecoin-store \
  --image ubuntu-22-04-x64 \
  --size s-2vcpu-4gb \
  --region sgp1 \
  --ssh-keys YOUR_SSH_KEY_ID

# Via Web: droplets → Create → Ubuntu 22.04, $24/mo plan
```

2. **Configure Firewall**
```bash
# Add firewall rules
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

### AWS EC2

1. **Launch Instance**
```bash
# Via AWS CLI
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-group-ids sg-xxxxx \
  --subnet-id subnet-xxxxx

# Via Console: EC2 → Launch Instance → Ubuntu 22.04, t3.medium
```

2. **Security Group Rules**
- Inbound: SSH (22), HTTP (80), HTTPS (443)
- Outbound: All traffic

### Linode

1. **Create Linode**
```bash
# Via Linode CLI
linode-cli linodes create \
  --type g6-standard-2 \
  --region ap-south \
  --image linode/ubuntu22.04 \
  --root_pass YOUR_PASSWORD

# Via Cloud Manager: Create → Linode → Ubuntu 22.04, Dedicated 4GB
```

2. **Network Configuration**
- Cloud Firewall: Allow 22, 80, 443

### Vultr

1. **Deploy Server**
```bash
# Via Vultr API
curl "https://api.vultr.com/v2/instances" \
  -X POST \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  --data '{"region":"sgp","plan":"vc2-2c-4gb","os_id":1743}'

# Via Portal: Deploy → Cloud Compute → Ubuntu 22.04, 4GB plan
```

2. **Firewall Rules**
- SSH (22), HTTP (80), HTTPS (443)

### Generic VPS Setup

For any provider, ensure:
1. Root or sudo access
2. SSH key authentication enabled
3. Firewall allows ports 22, 80, 443
4. Server time synchronized (NTP)

---

## Automated Deployment

### Quick Start (Recommended)

1. **Download Deployment Script**
```bash
# SSH into your VPS
ssh root@your-server-ip

# Download deployment script
curl -o deploy.sh https://raw.githubusercontent.com/YOUR_REPO/main/deploy.sh
chmod +x deploy.sh

# Run automated deployment
sudo ./deploy.sh
```

2. **Follow Interactive Prompts**
The script will ask for:
- Domain name
- Database passwords
- Discord OAuth credentials
- Stripe API keys
- ToyyibPay secret key
- Billplz API keys
- Admin email for SSL

3. **Wait for Completion**
- Installation: ~10-15 minutes
- SSL certificate: ~2 minutes
- Total: ~20 minutes

---

## Manual Deployment Steps

### Step 1: Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl git build-essential nginx certbot python3-certbot-nginx ufw

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Set timezone
sudo timedatectl set-timezone Asia/Kuala_Lumpur
```

### Step 2: Install Node.js 20.x

```bash
# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v20.x.x
npm --version
```

### Step 3: Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql <<EOF
CREATE DATABASE aecoin_store;
CREATE USER aecoin_user WITH PASSWORD 'CHANGE_ME_SECURE_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE aecoin_store TO aecoin_user;
ALTER DATABASE aecoin_store OWNER TO aecoin_user;
\c aecoin_store
GRANT ALL ON SCHEMA public TO aecoin_user;
\q
EOF
```

### Step 4: Install MySQL (FiveM Database)

```bash
# Install MySQL
sudo apt install -y mysql-server

# Secure installation
sudo mysql_secure_installation
# Answer: Y, 2, strong_password, Y, Y, Y, Y

# Create FiveM database
sudo mysql <<EOF
CREATE DATABASE IF NOT EXISTS fivem_database;
CREATE USER IF NOT EXISTS 'fivem_user'@'%' IDENTIFIED BY 'CHANGE_ME_FIVEM_PASSWORD';
GRANT ALL PRIVILEGES ON fivem_database.* TO 'fivem_user'@'%';
FLUSH PRIVILEGES;
EOF

# If connecting to remote FiveM MySQL, skip local MySQL installation
```

### Step 5: Clone Application

```bash
# Create application directory
sudo mkdir -p /var/www/aecoin-store
sudo chown -R $USER:$USER /var/www/aecoin-store
cd /var/www/aecoin-store

# Clone repository
git clone https://github.com/YOUR_USERNAME/aecoin-store.git .

# Or upload via SCP
# scp -r ./aecoin-store root@your-server-ip:/var/www/

# Install dependencies
npm install --production
```

### Step 6: Environment Configuration

```bash
# Create .env file
nano .env
```

**Copy and configure:**

```env
# Application
NODE_ENV=production
PORT=5000

# PostgreSQL Database
DATABASE_URL=postgresql://aecoin_user:YOUR_PG_PASSWORD@localhost:5432/aecoin_store
PGHOST=localhost
PGPORT=5432
PGUSER=aecoin_user
PGPASSWORD=YOUR_PG_PASSWORD
PGDATABASE=aecoin_store

# FiveM MySQL Database
FIVEM_DB_HOST=YOUR_FIVEM_SERVER_IP
FIVEM_DB_PORT=3306
FIVEM_DB_USER=fivem_user
FIVEM_DB_PASSWORD=YOUR_FIVEM_PASSWORD
FIVEM_DB_NAME=fivem_database
FIVEM_DB_TABLE=ak4y_donatesystem_codes
FIVEM_DB_COLUMN_CODE=code
FIVEM_DB_COLUMN_CREDITSVALUE=creditsvalue

# Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=https://yourdomain.com/api/auth/discord/callback

# Stripe Payment Gateway
STRIPE_SECRET_KEY=sk_live_your_stripe_secret
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ToyyibPay Payment Gateway
TOYYIBPAY_SECRET_KEY=your_toyyibpay_secret

# Billplz Payment Gateway
BILLPLZ_SECRET_KEY=your_billplz_api_key
BILLPLZ_SIGNATURE_KEY=your_billplz_signature_key

# Session Security
SESSION_SECRET=$(openssl rand -base64 32)
```

### Step 7: Database Migration

```bash
# Run database migrations
npm run db:push

# Verify tables created
psql $DATABASE_URL -c "\dt"

# Optional: Restore from backup
psql $DATABASE_URL < database_backup_20251006_043457.sql
```

### Step 8: Build Application

```bash
# Build frontend and backend
npm run build

# Test production build
NODE_ENV=production npm start
# Press Ctrl+C after verification
```

### Step 9: Setup PM2 Process Manager

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.cjs << 'EOF'
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

# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Start application
pm2 start ecosystem.config.cjs

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup systemd
# Run the command it outputs

# Monitor application
pm2 status
pm2 logs aecoin-store
```

### Step 10: Configure Nginx Reverse Proxy

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/aecoin-store
```

**Add configuration:**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Webhook endpoints - increase timeout
    location ~ ^/api/(stripe-webhook|toyyibpay-return|billplz-callback) {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # Client max body size
    client_max_body_size 10M;
}
```

**Enable site:**

```bash
# Enable configuration
sudo ln -s /etc/nginx/sites-available/aecoin-store /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## Payment Gateway Configuration

### Stripe Setup

1. **Get API Keys**
   - Go to https://dashboard.stripe.com/apikeys
   - Copy Secret Key (`sk_live_...`) and Publishable Key (`pk_live_...`)

2. **Configure Webhook**
   - Go to Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe-webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy Signing Secret (`whsec_...`)

3. **Update .env**
```env
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### ToyyibPay Setup

1. **Get Secret Key**
   - Login to https://toyyibpay.com/
   - Go to Settings → API Keys
   - Copy Secret Key

2. **Configure Return URL**
   - Add return URL: `https://yourdomain.com/api/toyyibpay-return`

3. **Update .env**
```env
TOYYIBPAY_SECRET_KEY=your_secret_key
```

### Billplz Setup

1. **Get API Keys**
   - Login to https://www.billplz.com/
   - Go to Settings → API
   - Copy API Secret Key and X Signature Key

2. **Configure Callback URL**
   - Add callback URL: `https://yourdomain.com/api/billplz-callback`

3. **Update .env**
```env
BILLPLZ_SECRET_KEY=your_api_key
BILLPLZ_SIGNATURE_KEY=your_signature_key
```

### Discord OAuth Setup

1. **Create Application**
   - Go to https://discord.com/developers/applications
   - Create new application "AECOIN Store"

2. **Configure OAuth2**
   - OAuth2 → Add Redirect: `https://yourdomain.com/api/auth/discord/callback`
   - Scopes: `identify`, `email`

3. **Update .env**
```env
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=https://yourdomain.com/api/auth/discord/callback
```

---

## SSL/HTTPS Setup

### Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose redirect (option 2)

# Verify auto-renewal
sudo certbot renew --dry-run

# Certificate will auto-renew via cron
```

### Manual SSL Certificate

If using custom SSL:

```bash
# Edit Nginx config
sudo nano /etc/nginx/sites-available/aecoin-store
```

Add SSL configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ... rest of configuration
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}
```

---

## Security Hardening

### SSH Security

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config
```

**Recommended settings:**
```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
Port 2222  # Change default port
```

```bash
# Restart SSH
sudo systemctl restart sshd
```

### Fail2Ban

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Create local config
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Edit configuration
sudo nano /etc/fail2ban/jail.local
```

**Enable jails:**
```ini
[sshd]
enabled = true
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
```

```bash
# Start Fail2Ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Check status
sudo fail2ban-client status
```

### PostgreSQL Security

```bash
# Edit PostgreSQL config
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

**Restrict access:**
```
local   all             postgres                                peer
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
```

```bash
# Reload PostgreSQL
sudo systemctl reload postgresql
```

### System Updates

```bash
# Enable automatic security updates
sudo apt install -y unattended-upgrades

# Configure automatic updates
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## Monitoring & Logging

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs aecoin-store --lines 100

# Check status
pm2 status

# View metrics
pm2 describe aecoin-store
```

### Log Rotation

```bash
# Install logrotate config
sudo nano /etc/logrotate.d/aecoin-store
```

**Add configuration:**
```
/var/log/pm2/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Database Monitoring

```bash
# PostgreSQL activity
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# MySQL processes
sudo mysql -e "SHOW FULL PROCESSLIST;"
```

---

## Backup & Restore

### Database Backup Script

```bash
# Create backup script
cat > /var/www/aecoin-store/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/var/backups/aecoin-store"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
pg_dump $DATABASE_URL > $BACKUP_DIR/postgres_$DATE.sql

# Backup .env file
cp /var/www/aecoin-store/.env $BACKUP_DIR/env_$DATE.backup

# Compress backups
tar -czf $BACKUP_DIR/aecoin_backup_$DATE.tar.gz \
  $BACKUP_DIR/postgres_$DATE.sql \
  $BACKUP_DIR/env_$DATE.backup

# Remove old backups (keep 7 days)
find $BACKUP_DIR -name "aecoin_backup_*.tar.gz" -mtime +7 -delete

# Clean temporary files
rm $BACKUP_DIR/postgres_$DATE.sql $BACKUP_DIR/env_$DATE.backup

echo "Backup completed: $BACKUP_DIR/aecoin_backup_$DATE.tar.gz"
EOF

chmod +x /var/www/aecoin-store/backup.sh
```

### Automate Backups (Cron)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /var/www/aecoin-store/backup.sh >> /var/log/aecoin-backup.log 2>&1
```

### Restore from Backup

```bash
# Extract backup
tar -xzf /var/backups/aecoin-store/aecoin_backup_YYYYMMDD_HHMMSS.tar.gz -C /tmp

# Restore PostgreSQL
psql $DATABASE_URL < /tmp/postgres_YYYYMMDD_HHMMSS.sql

# Restore .env
cp /tmp/env_YYYYMMDD_HHMMSS.backup /var/www/aecoin-store/.env

# Restart application
pm2 restart aecoin-store
```

---

## Troubleshooting

### Application Won't Start

**Check PM2 logs:**
```bash
pm2 logs aecoin-store --err --lines 50
```

**Common issues:**
- Missing environment variables → Check `.env` file
- Database connection failed → Verify `DATABASE_URL`
- Port 5000 in use → `sudo lsof -i :5000`

### Database Connection Errors

**PostgreSQL:**
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Check PostgreSQL status
sudo systemctl status postgresql

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*-main.log
```

**MySQL:**
```bash
# Test connection
mysql -h $FIVEM_DB_HOST -u $FIVEM_DB_USER -p$FIVEM_DB_PASSWORD $FIVEM_DB_NAME -e "SELECT 1;"

# Check MySQL status
sudo systemctl status mysql
```

### Payment Gateway Issues

**Stripe webhook not receiving events:**
```bash
# Check webhook logs
pm2 logs aecoin-store | grep stripe-webhook

# Test webhook endpoint
curl -X POST https://yourdomain.com/api/stripe-webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"test"}'

# Verify Stripe webhook secret
env | grep STRIPE_WEBHOOK_SECRET
```

**ToyyibPay/Billplz callback not working:**
```bash
# Check Nginx logs
sudo tail -f /var/log/nginx/access.log | grep -E 'toyyibpay|billplz'

# Test endpoints
curl https://yourdomain.com/api/toyyibpay-return
curl https://yourdomain.com/api/billplz-callback
```

### SSL Certificate Issues

```bash
# Check certificate expiry
sudo certbot certificates

# Renew certificate manually
sudo certbot renew --force-renewal

# Test SSL configuration
curl -I https://yourdomain.com
```

### High Memory Usage

```bash
# Check memory usage
free -h
pm2 describe aecoin-store | grep memory

# Restart application
pm2 restart aecoin-store

# Increase PM2 memory limit
# Edit ecosystem.config.cjs: max_memory_restart: '2G'
pm2 reload ecosystem.config.cjs
```

### Nginx 502 Bad Gateway

```bash
# Check if app is running
pm2 status aecoin-store

# Verify port 5000
curl http://localhost:5000

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test Nginx config
sudo nginx -t
```

---

## Performance Optimization

### Node.js Optimization

```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'aecoin-store',
    script: 'npm',
    args: 'start',
    instances: 'max',  // Use all CPU cores
    exec_mode: 'cluster',
    max_memory_restart: '2G',
    node_args: '--max-old-space-size=2048'
  }]
};
```

### Nginx Caching

```nginx
# Add to Nginx config
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 7d;
    add_header Cache-Control "public";
}
```

### Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_redemption_codes_order_id ON redemption_codes(order_id);
```

---

## Support & Maintenance

### Regular Maintenance Tasks

**Weekly:**
- Check disk space: `df -h`
- Review error logs: `pm2 logs --err --lines 100`
- Monitor SSL expiry: `sudo certbot certificates`

**Monthly:**
- Update packages: `sudo apt update && sudo apt upgrade`
- Review security patches: `sudo unattended-upgrades --dry-run`
- Rotate logs: `sudo logrotate /etc/logrotate.conf`

**Quarterly:**
- Review backup integrity
- Test restore procedures
- Update Node.js if needed

### Health Check Endpoint

Add to your application:

```typescript
// server/routes.ts
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### Monitoring Script

```bash
#!/bin/bash
# /var/www/aecoin-store/healthcheck.sh

HEALTH_URL="https://yourdomain.com/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -ne 200 ]; then
  echo "Health check failed with status $RESPONSE"
  pm2 restart aecoin-store
  # Send alert (email, Slack, etc.)
fi
```

---

## Quick Reference

### Common Commands

```bash
# Application
pm2 start ecosystem.config.cjs
pm2 restart aecoin-store
pm2 stop aecoin-store
pm2 logs aecoin-store

# Nginx
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl restart nginx

# Database
psql $DATABASE_URL
npm run db:push

# SSL
sudo certbot renew
sudo certbot certificates

# System
sudo systemctl status postgresql
sudo systemctl status mysql
sudo ufw status
```

### Important File Locations

```
/var/www/aecoin-store/          # Application root
/var/www/aecoin-store/.env      # Environment variables
/var/log/pm2/                   # Application logs
/var/log/nginx/                 # Nginx logs
/etc/nginx/sites-available/     # Nginx configs
/var/backups/aecoin-store/      # Backups
```

---

## Deployment Checklist

- [ ] VPS provisioned and accessible via SSH
- [ ] Domain DNS pointed to VPS IP
- [ ] Node.js 20.x installed
- [ ] PostgreSQL installed and configured
- [ ] MySQL installed (if needed for FiveM)
- [ ] Application cloned and dependencies installed
- [ ] .env file configured with all secrets
- [ ] Database migrated (npm run db:push)
- [ ] Application built (npm run build)
- [ ] PM2 configured and application running
- [ ] Nginx installed and configured
- [ ] SSL certificate obtained
- [ ] Firewall configured (ports 22, 80, 443)
- [ ] Payment gateway webhooks configured
- [ ] Discord OAuth redirect URI updated
- [ ] Backups automated via cron
- [ ] Health checks configured
- [ ] Monitoring setup complete

---

**Deployment completed successfully! 🚀**

For automated deployment, use the `deploy.sh` script in the repository.
