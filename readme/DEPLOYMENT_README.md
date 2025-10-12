# AECOIN Store - Deployment Package

## 📦 Deployment Files Created

### 1. **VPS_DEPLOYMENT.md** (22KB)
Comprehensive step-by-step deployment guide covering:
- ✅ Multiple VPS providers (DigitalOcean, AWS EC2, Linode, Vultr)
- ✅ Manual deployment instructions for all components
- ✅ All three payment gateways (Stripe, ToyyibPay, Billplz)  
- ✅ SSL/HTTPS setup with Let's Encrypt
- ✅ Security hardening (firewall, SSH, Fail2Ban)
- ✅ Monitoring and logging setup
- ✅ Backup and restore procedures
- ✅ Troubleshooting guide
- ✅ Performance optimization tips

### 2. **deploy.sh** (19KB, executable)
Automated deployment script that:
- ✅ Detects OS automatically (Ubuntu, Debian, CentOS, RHEL)
- ✅ Installs all dependencies (Node.js, PostgreSQL, MySQL, Nginx, PM2)
- ✅ Collects configuration interactively
- ✅ Sets up databases
- ✅ Configures environment variables
- ✅ Builds and deploys application
- ✅ Sets up SSL certificates
- ✅ Configures Nginx reverse proxy
- ✅ Automates backups
- ✅ Verifies deployment

### 3. **.env.example** (2.6KB)
Complete environment variable template with:
- All database configurations (PostgreSQL + MySQL)
- Discord OAuth settings
- **All three payment gateways** (Stripe, ToyyibPay, Billplz)
- Session secrets
- Clear section organization

### 4. **database_backup_20251006_043457.sql** (25KB)
Latest PostgreSQL database backup ready for VPS deployment

## 🚀 Quick Start Deployment

### Option 1: Automated (Recommended)

```bash
# 1. SSH into your VPS
ssh root@your-vps-ip

# 2. Download the deployment script
curl -o deploy.sh https://your-repo/deploy.sh
chmod +x deploy.sh

# 3. Run deployment
sudo ./deploy.sh

# 4. Follow the interactive prompts
# - Enter domain name
# - Provide database passwords
# - Enter Discord OAuth credentials
# - Add Stripe API keys
# - Add ToyyibPay secret key
# - Add Billplz API keys
# - Provide SSL admin email
```

### Option 2: Manual Deployment

Follow the step-by-step guide in **VPS_DEPLOYMENT.md**

## 🔧 Important Configuration Steps

### After Deployment:

1. **Configure Payment Gateway Webhooks:**
   - **Stripe:** Add webhook at `https://yourdomain.com/api/stripe-webhook`
   - **ToyyibPay:** Set return URL to `https://yourdomain.com/api/toyyibpay-return`
   - **Billplz:** Set callback URL to `https://yourdomain.com/api/billplz-callback`

2. **Update Discord OAuth:**
   - Add redirect URI: `https://yourdomain.com/api/auth/discord/callback`

3. **Test Payment Flows:**
   - Test Stripe payment
   - Test ToyyibPay payment
   - Test Billplz payment

## 🔐 Security Checklist

- [ ] SSL certificate installed and auto-renewal configured
- [ ] Firewall configured (ports 22, 80, 443 only)
- [ ] SSH key authentication enabled
- [ ] Root login disabled
- [ ] MySQL secured (run `mysql_secure_installation`)
- [ ] Environment variables secured (`.env` with 600 permissions)
- [ ] Automatic backups configured
- [ ] Payment webhook secrets configured

## 📁 File Locations on VPS

```
/var/www/aecoin-store/          # Application root
/var/www/aecoin-store/.env      # Environment variables
/var/log/pm2/                   # Application logs
/var/log/nginx/                 # Nginx logs
/var/backups/aecoin-store/      # Database backups
/etc/nginx/sites-available/     # Nginx config
```

## 🛠️ Useful Commands

```bash
# Application Management
pm2 status                      # Check app status
pm2 logs aecoin-store          # View logs
pm2 restart aecoin-store       # Restart app
pm2 monit                      # Real-time monitoring

# Nginx
sudo nginx -t                  # Test config
sudo systemctl reload nginx    # Reload Nginx

# Database
psql $DATABASE_URL             # Connect to PostgreSQL
npm run db:push                # Run migrations

# SSL
sudo certbot certificates      # Check SSL status
sudo certbot renew             # Renew certificates

# Backups
ls -lh /var/backups/aecoin-store/  # View backups
```

## 📊 Deployment Architecture

```
Internet
    ↓
Nginx (Port 80/443) → SSL/TLS
    ↓
Node.js App (Port 5000) → PM2 Process Manager
    ↓
PostgreSQL (Main DB) + MySQL (FiveM DB)
    ↓
Payment Gateways: Stripe + ToyyibPay + Billplz
```

## ⚡ Performance Notes

- Application runs on PM2 with auto-restart
- Nginx acts as reverse proxy with security headers
- SSL certificates auto-renew via Certbot
- Daily automated backups at 2 AM
- Old backups auto-deleted after 7 days

## 🐛 Troubleshooting

### Application won't start:
```bash
pm2 logs aecoin-store --err
```

### Payment webhooks not working:
```bash
sudo tail -f /var/log/nginx/access.log | grep -E 'stripe|toyyibpay|billplz'
```

### Database connection issues:
```bash
psql $DATABASE_URL -c "SELECT 1;"
```

### SSL certificate issues:
```bash
sudo certbot certificates
sudo certbot renew --force-renewal
```

## 📝 Environment Variables Reference

See `.env.example` for complete list. Key variables:

```env
# Application
NODE_ENV=production
PORT=5000

# Databases
DATABASE_URL=postgresql://...
FIVEM_DB_HOST=...

# Payment Gateways
STRIPE_SECRET_KEY=sk_live_...
TOYYIBPAY_SECRET_KEY=...
BILLPLZ_SECRET_KEY=...
BILLPLZ_SIGNATURE_KEY=...

# Discord OAuth
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
```

## 🎯 Next Steps

1. ✅ Choose deployment method (automated or manual)
2. ✅ Prepare VPS with Ubuntu 20.04/22.04
3. ✅ Point domain to VPS IP address
4. ✅ Gather all API keys and credentials
5. ✅ Run deployment
6. ✅ Configure payment webhooks
7. ✅ Test all payment flows
8. ✅ Monitor logs and performance

---

**📚 Full Documentation:** See `VPS_DEPLOYMENT.md` for complete details

**🔧 Deployment Script:** Run `./deploy.sh` for automated deployment

**🗄️ Database Backup:** Use `database_backup_20251006_043457.sql` to restore data
