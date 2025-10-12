# 🚀 AECOIN Store - Production Deployment Guide

## ✅ Build Status: COMPLETED

Your application has been successfully built for production!

---

## 📦 What's Ready

- ✅ Production build created in `/dist` folder
- ✅ Client assets optimized and bundled
- ✅ Server code compiled
- ✅ Production environment variables configured
- ✅ Windows compatibility fixes applied

---

## 🌐 Deployment Options

### Option 1: VPS Deployment (Ubuntu/Debian Server)

#### Prerequisites
- Ubuntu 20.04+ or Debian 11+ server
- SSH access to your server
- Domain `aeofficial.com` DNS pointed to server IP
- Root or sudo access

#### Quick Deploy (Automated)

1. **Upload files to your server:**
```bash
# From your local machine, upload the entire project
scp -r c:\Users\jihadullahhamid\Desktop\AEProd root@YOUR_SERVER_IP:/var/www/
```

2. **SSH into your server:**
```bash
ssh root@YOUR_SERVER_IP
```

3. **Run the deployment script:**
```bash
cd /var/www/AEProd
chmod +x deploy.sh
sudo ./deploy.sh
```

The script will automatically:
- Install Node.js 20
- Install PostgreSQL and MySQL
- Install Nginx
- Install PM2
- Configure SSL with Let's Encrypt
- Set up the application
- Start the server

---

### Option 2: Manual VPS Deployment

If you prefer manual control, follow these steps:

#### Step 1: Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

#### Step 2: Upload Application
```bash
# Create directory
sudo mkdir -p /var/www/aecoin-store
sudo chown -R $USER:$USER /var/www/aecoin-store

# Upload files (from your local machine)
scp -r c:\Users\jihadullahhamid\Desktop\AEProd/* user@YOUR_SERVER_IP:/var/www/aecoin-store/
```

#### Step 3: Configure Environment
```bash
cd /var/www/aecoin-store

# Copy production environment
cp .env.production .env

# Install dependencies (production only)
npm ci --production
```

#### Step 4: Start Application with PM2
```bash
# Start the app
pm2 start dist/index.js --name aecoin-store --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Step 5: Configure Nginx
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/aeofficial.com
```

Paste this configuration:
```nginx
server {
    listen 80;
    server_name aeofficial.com www.aeofficial.com;

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

    # Serve static files directly
    location /attached_assets/ {
        alias /var/www/aecoin-store/attached_assets/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/aeofficial.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 6: Setup SSL Certificate
```bash
sudo certbot --nginx -d aeofficial.com -d www.aeofficial.com
```

---

### Option 3: Docker Deployment

#### Step 1: Create Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY dist ./dist
COPY attached_assets ./attached_assets
COPY .env.production ./.env

EXPOSE 5000

CMD ["node", "dist/index.js"]
```

#### Step 2: Build and Run
```bash
# Build image
docker build -t aecoin-store .

# Run container
docker run -d \
  --name aecoin-store \
  -p 5000:5000 \
  --env-file .env.production \
  --restart unless-stopped \
  aecoin-store
```

---

### Option 4: Cloud Platform Deployment

#### Railway.app
1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Deploy: `railway up`
5. Add environment variables in Railway dashboard

#### Render.com
1. Connect your GitHub repository
2. Create new Web Service
3. Build command: `npm install && npm run build`
4. Start command: `node dist/index.js`
5. Add environment variables in Render dashboard

#### DigitalOcean App Platform
1. Connect GitHub repository
2. Select Node.js environment
3. Build command: `npm install && npm run build`
4. Run command: `node dist/index.js`
5. Add environment variables

---

## 🔐 Security Checklist

Before going live, ensure:

- [ ] Change `SESSION_SECRET` to a strong random value
- [ ] Change `ADMIN_PASSWORD` to a strong password
- [ ] Enable firewall (UFW on Ubuntu)
- [ ] Setup SSL certificate (HTTPS)
- [ ] Configure database backups
- [ ] Setup monitoring (PM2 monitoring, UptimeRobot, etc.)
- [ ] Review and secure all API keys
- [ ] Enable rate limiting
- [ ] Configure CORS properly

---

## 🔍 Verification Steps

After deployment:

1. **Check if app is running:**
```bash
pm2 status
pm2 logs aecoin-store
```

2. **Test the application:**
- Visit: https://aeofficial.com
- Test login with admin credentials
- Test payment gateways
- Test Discord OAuth
- Test FiveM integration

3. **Monitor logs:**
```bash
pm2 logs aecoin-store --lines 100
```

---

## 🆘 Troubleshooting

### App won't start
```bash
# Check logs
pm2 logs aecoin-store

# Check if port 5000 is available
sudo netstat -tulpn | grep 5000

# Restart app
pm2 restart aecoin-store
```

### Database connection issues
```bash
# Test database connection
node -e "console.log(process.env.DATABASE_URL)"

# Check if database is accessible
psql "postgresql://neondb_owner:npg_3hxTvIwJCN9l@ep-spring-surf-a18uh1nm-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
```

### Nginx issues
```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### SSL certificate issues
```bash
# Renew certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

---

## 📊 Monitoring & Maintenance

### Setup PM2 Monitoring
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Database Backups
```bash
# Create backup script
cat > /home/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump "postgresql://..." > /var/backups/aecoin-$DATE.sql
# Keep only last 7 days
find /var/backups -name "aecoin-*.sql" -mtime +7 -delete
EOF

chmod +x /home/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /home/backup-db.sh
```

### Update Application
```bash
cd /var/www/aecoin-store
git pull  # if using git
npm install
npm run build
pm2 restart aecoin-store
```

---

## 📞 Support

If you encounter issues:
1. Check the logs: `pm2 logs aecoin-store`
2. Review Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check system resources: `htop` or `free -h`
4. Verify environment variables are set correctly

---

## 🎉 Next Steps

After successful deployment:
1. Test all features thoroughly
2. Setup monitoring and alerts
3. Configure automated backups
4. Setup staging environment for testing updates
5. Document any custom configurations

---

**Deployment Date:** $(date)
**Domain:** aeofficial.com
**Server Port:** 5000
**Node Version:** 20.x
**Database:** NeonDB PostgreSQL
