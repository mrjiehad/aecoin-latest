# 🚀 Quick Deployment Guide - AECOIN Store

## ✅ Your Application is Ready to Deploy!

---

## 🎯 Fastest Way to Deploy (3 Methods)

### Method 1: Using PowerShell Script (Easiest)

**Requirements:** SSH access to your server

```powershell
# Run this from PowerShell in the project directory
.\deploy-to-server.ps1 -ServerIP "YOUR_SERVER_IP" -ServerUser "root"
```

This will:
- Upload all files to your server
- Install dependencies
- Prepare the application

Then SSH into your server and run:
```bash
cd /var/www/aecoin-store
sudo ./deploy.sh
```

---

### Method 2: Manual Upload via FTP/SFTP

1. **Upload these folders/files to your server:**
   - `dist/` folder
   - `attached_assets/` folder
   - `package.json`
   - `package-lock.json`
   - `.env.production` (rename to `.env` on server)
   - `ecosystem.config.js`

2. **SSH into your server and run:**
```bash
cd /path/to/uploaded/files
npm ci --production
pm2 start ecosystem.config.js
pm2 save
```

---

### Method 3: Using Git (If you have a repository)

```bash
# On your server
git clone YOUR_REPO_URL /var/www/aecoin-store
cd /var/www/aecoin-store
npm install
npm run build
cp .env.production .env
pm2 start ecosystem.config.js
pm2 save
```

---

## 🔧 Server Requirements

Before deploying, ensure your server has:

- ✅ Ubuntu 20.04+ or Debian 11+
- ✅ Node.js 20.x installed
- ✅ PM2 installed (`npm install -g pm2`)
- ✅ Nginx installed (for reverse proxy)
- ✅ Port 80 and 443 open (for HTTP/HTTPS)

**Quick Server Setup:**
```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

---

## 🌐 Domain Configuration

**Point your domain to your server:**

1. Go to your domain registrar (Namecheap, GoDaddy, etc.)
2. Add/Update DNS A records:
   ```
   Type: A
   Name: @
   Value: YOUR_SERVER_IP
   TTL: 300
   
   Type: A
   Name: www
   Value: YOUR_SERVER_IP
   TTL: 300
   ```

3. Wait 5-30 minutes for DNS propagation

---

## 🔒 SSL Certificate (HTTPS)

After deploying, setup SSL:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d aeofficial.com -d www.aeofficial.com

# Auto-renewal is configured automatically
```

---

## ✅ Verify Deployment

After deployment, check:

1. **App is running:**
```bash
pm2 status
pm2 logs aecoin-store
```

2. **Visit your site:**
   - http://YOUR_SERVER_IP:5000 (direct access)
   - https://aeofficial.com (after Nginx + SSL setup)

3. **Test features:**
   - Login with admin credentials
   - Test payment gateways
   - Test Discord OAuth
   - Check FiveM integration

---

## 🆘 Quick Troubleshooting

### App won't start?
```bash
pm2 logs aecoin-store --lines 50
```

### Port already in use?
```bash
sudo lsof -i :5000
# Kill the process if needed
sudo kill -9 PID
```

### Database connection error?
Check your `.env` file has correct `DATABASE_URL`

### Can't access from browser?
```bash
# Check if app is running
pm2 status

# Check firewall
sudo ufw status
sudo ufw allow 5000
```

---

## 📊 Monitoring

```bash
# View logs
pm2 logs aecoin-store

# Monitor resources
pm2 monit

# Restart app
pm2 restart aecoin-store

# Stop app
pm2 stop aecoin-store
```

---

## 🔄 Update Application

When you make changes:

```bash
# On your local machine
npm run build

# Upload new dist folder to server
# Then on server:
pm2 restart aecoin-store
```

---

## 📞 Need Help?

1. Check logs: `pm2 logs aecoin-store`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Review full documentation: `PRODUCTION_DEPLOY.md`

---

## 🎉 You're All Set!

Your application is built and ready to deploy. Choose your preferred method above and follow the steps.

**Current Configuration:**
- Domain: aeofficial.com
- Port: 5000
- Database: NeonDB (PostgreSQL)
- Payment: Billplz + ToyyibPay
- Auth: Discord OAuth

Good luck with your deployment! 🚀
