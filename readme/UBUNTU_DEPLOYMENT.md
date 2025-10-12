# AECOIN Store - Ubuntu VPS Deployment Guide

## System Requirements

- Ubuntu 20.04 LTS or newer
- Minimum 2GB RAM
- 20GB disk space
- Root or sudo access

## 1. Initial Server Setup

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Essential Tools
```bash
sudo apt install -y curl git build-essential nginx certbot python3-certbot-nginx
```

## 2. Install Node.js 20.x

```bash
# Install Node.js 20.x via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

## 3. Install PostgreSQL (Main Database)

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql <<EOF
CREATE DATABASE aecoin_store;
CREATE USER aecoin_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE aecoin_store TO aecoin_user;
\q
EOF
```

## 4. Install MySQL (FiveM Database)

```bash
# Install MySQL Server
sudo apt install -y mysql-server

# Secure MySQL installation
sudo mysql_secure_installation

# Create database connection for FiveM
sudo mysql <<EOF
CREATE DATABASE IF NOT EXISTS fivem_database;
CREATE USER IF NOT EXISTS 'fivem_user'@'%' IDENTIFIED BY 'your_fivem_password';
GRANT ALL PRIVILEGES ON fivem_database.* TO 'fivem_user'@'%';
FLUSH PRIVILEGES;
EOF
```

## 5. Clone and Setup Application

```bash
# Create application directory
sudo mkdir -p /var/www/aecoin-store
sudo chown -R $USER:$USER /var/www/aecoin-store
cd /var/www/aecoin-store

# Clone your repository (or upload files via SFTP/SCP)
git clone <your-repo-url> .

# Install dependencies
npm install
```

## 6. Environment Variables Setup

Create `.env` file in the project root:

```bash
nano .env
```

Add the following environment variables:

```env
# Application
NODE_ENV=production
PORT=5000

# PostgreSQL Database (Main)
DATABASE_URL=postgresql://aecoin_user:your_secure_password_here@localhost:5432/aecoin_store
PGHOST=localhost
PGPORT=5432
PGUSER=aecoin_user
PGPASSWORD=your_secure_password_here
PGDATABASE=aecoin_store

# FiveM MySQL Database
FIVEM_DB_HOST=localhost
FIVEM_DB_PORT=3306
FIVEM_DB_USER=fivem_user
FIVEM_DB_PASSWORD=your_fivem_password
FIVEM_DB_NAME=fivem_database
FIVEM_DB_TABLE=ak4y_donatesystem_codes
FIVEM_DB_COLUMN_CODE=code
FIVEM_DB_COLUMN_CREDITSVALUE=creditsvalue

# Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=https://yourdomain.com/api/auth/discord/callback

# Stripe Payment Gateway
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ToyyibPay Payment Gateway (Malaysia)
TOYYIBPAY_SECRET_KEY=your_toyyibpay_secret_key

# Billplz Payment Gateway (Malaysia)
BILLPLZ_SECRET_KEY=your_billplz_api_key
BILLPLZ_SIGNATURE_KEY=your_billplz_signature_key

# Session Secret (generate random string)
SESSION_SECRET=$(openssl rand -base64 32)
```

**Note**: Replace all placeholder values with your actual credentials.

## 7. Database Migration

```bash
# Generate database schema
npm run db:push

# Verify tables were created
psql postgresql://aecoin_user:your_secure_password_here@localhost:5432/aecoin_store -c "\dt"
```

## 8. Build Application

```bash
# Build frontend
npm run build

# Test the application locally
NODE_ENV=production npm start
```

Press `Ctrl+C` after verifying it starts successfully.

## 9. Install PM2 Process Manager

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

# Start application with PM2
pm2 start ecosystem.config.cjs

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Follow the command it outputs
```

## 10. Configure Nginx Reverse Proxy

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/aecoin-store
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Client max body size
    client_max_body_size 10M;

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files cache
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:5000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/aecoin-store /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 11. SSL Certificate with Let's Encrypt

```bash
# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## 12. Firewall Configuration

```bash
# Enable UFW firewall
sudo ufw enable

# Allow necessary ports
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS

# Check firewall status
sudo ufw status
```

## 13. Configure Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the webhook signing secret and update `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```
5. Restart application:
   ```bash
   pm2 restart aecoin-store
   ```

## 14. Database Backup Setup

Create automated backup script:

```bash
# Create backup script
sudo nano /usr/local/bin/backup-aecoin-db.sh
```

Add the following:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/aecoin-store"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="aecoin_store"
DB_USER="aecoin_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# PostgreSQL backup
PGPASSWORD='your_secure_password_here' pg_dump -h localhost -U $DB_USER $DB_NAME > $BACKUP_DIR/backup_$TIMESTAMP.sql

# Compress backup
gzip $BACKUP_DIR/backup_$TIMESTAMP.sql

# Delete backups older than 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$TIMESTAMP.sql.gz"
```

```bash
# Make script executable
sudo chmod +x /usr/local/bin/backup-aecoin-db.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-aecoin-db.sh") | crontab -
```

## 15. Monitoring and Logs

### View Application Logs
```bash
# PM2 logs
pm2 logs aecoin-store

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### PM2 Monitoring
```bash
# Real-time monitoring
pm2 monit

# Application status
pm2 status

# Resource usage
pm2 list
```

## 16. Maintenance Commands

### Restart Application
```bash
pm2 restart aecoin-store
```

### Update Application
```bash
cd /var/www/aecoin-store
git pull origin main
npm install
npm run build
pm2 restart aecoin-store
```

### Database Migration After Update
```bash
npm run db:push
pm2 restart aecoin-store
```

## 17. Security Hardening

### Disable Root Login
```bash
sudo nano /etc/ssh/sshd_config
```
Set: `PermitRootLogin no`

### Keep System Updated
```bash
sudo apt update && sudo apt upgrade -y
```

### Enable Fail2Ban
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 18. Troubleshooting

### Application Won't Start
```bash
# Check logs
pm2 logs aecoin-store --lines 100

# Check if port 5000 is in use
sudo lsof -i :5000

# Restart application
pm2 restart aecoin-store
```

### Database Connection Issues
```bash
# Test PostgreSQL connection
psql postgresql://aecoin_user:your_secure_password_here@localhost:5432/aecoin_store -c "SELECT version();"

# Check PostgreSQL status
sudo systemctl status postgresql
```

### Nginx Issues
```bash
# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Check Nginx status
sudo systemctl status nginx
```

## 19. Performance Optimization

### Enable Nginx Gzip Compression
Edit `/etc/nginx/nginx.conf`:
```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;
```

### PostgreSQL Tuning
Edit `/etc/postgresql/*/main/postgresql.conf`:
```
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
```

Then restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## 20. Going Live Checklist

- [ ] All environment variables configured correctly
- [ ] Database migrations completed
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Application running with PM2
- [ ] Nginx reverse proxy configured
- [ ] Stripe webhooks configured
- [ ] Discord OAuth redirect URIs updated
- [ ] Database backups automated
- [ ] Monitoring and logs accessible
- [ ] Domain DNS pointed to server IP
- [ ] Test all payment flows (Stripe & ToyyibPay)
- [ ] Test Discord login
- [ ] Test FiveM code redemption

## Support

For issues or questions:
- Check logs: `pm2 logs aecoin-store`
- Monitor: `pm2 monit`
- Restart: `pm2 restart aecoin-store`

---

**Note**: Replace all placeholder values (passwords, API keys, domain names) with your actual production credentials. Keep your `.env` file secure and never commit it to version control.
