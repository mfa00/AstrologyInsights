# 🚀 Linux Deployment Guide for Astrology Insights

This guide will help you deploy your Astrology Insights application on a Linux server with Nginx, SSL, and proper production configuration.

## 📋 Prerequisites

- Ubuntu 20.04+ or Debian 10+ server
- Root or sudo access
- Domain name pointing to your server
- At least 2GB RAM and 20GB storage

## 🏗️ Architecture Overview

```
Internet → Nginx (Port 80/443) → Node.js App (Port 5000) → PostgreSQL
```

- **Nginx**: Reverse proxy, SSL termination, static file serving
- **Node.js**: Application server with session-based view tracking
- **PostgreSQL**: Database for articles, views, and analytics
- **PM2/Systemd**: Process management and auto-restart
- **Let's Encrypt**: Free SSL certificates

## 🚀 Automated Deployment

### Quick Start

1. **Clone your repository** on the server:
   ```bash
   git clone https://github.com/your-username/astrologyinsights.git
   cd astrologyinsights
   ```

2. **Update configuration**:
   ```bash
   # Edit the domain name in deploy.sh
   nano deploy.sh
   # Change DOMAIN="astrologyinsights.ge" to your domain
   
   # Edit the domain name in nginx.conf
   nano nginx.conf
   # Update server_name directives
   ```

3. **Run the deployment script**:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

The script will automatically:
- ✅ Install Node.js, Nginx, PostgreSQL
- ✅ Create application user and directories
- ✅ Set up database and environment
- ✅ Build and deploy the application
- ✅ Configure SSL with Let's Encrypt
- ✅ Set up firewall and security
- ✅ Start all services

## 🔧 Manual Deployment

If you prefer manual setup or need to customize the deployment:

### 1. System Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install other dependencies
sudo apt install -y nginx postgresql postgresql-contrib git curl
```

### 2. Create Application User

```bash
sudo useradd -m -s /bin/bash astrologyinsights
sudo usermod -aG www-data astrologyinsights
```

### 3. Setup PostgreSQL

```bash
sudo -u postgres psql

-- In PostgreSQL shell:
CREATE USER astrologyinsights WITH PASSWORD 'your_secure_password';
CREATE DATABASE astrologyinsights OWNER astrologyinsights;
GRANT ALL PRIVILEGES ON DATABASE astrologyinsights TO astrologyinsights;
\q
```

### 4. Deploy Application

```bash
# Create app directory
sudo mkdir -p /var/www/astrologyinsights
sudo chown astrologyinsights:www-data /var/www/astrologyinsights

# Copy application files
sudo cp -r . /var/www/astrologyinsights/
sudo chown -R astrologyinsights:www-data /var/www/astrologyinsights

# Switch to app user and setup
sudo -u astrologyinsights -i
cd /var/www/astrologyinsights

# Install dependencies and build
npm ci --production
npm run build
```

### 5. Configure Environment

```bash
sudo -u astrologyinsights tee /var/www/astrologyinsights/.env <<EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://astrologyinsights:your_secure_password@localhost:5432/astrologyinsights
SESSION_SECRET=$(openssl rand -base64 32)
VITE_API_URL=https://yourdomain.com/api
EOF

sudo chmod 600 /var/www/astrologyinsights/.env
```

### 6. Setup Process Management

#### Option A: Using PM2 (Recommended)

```bash
# Install PM2
sudo npm install -g pm2

# Start application
sudo -u astrologyinsights pm2 start ecosystem.config.js

# Save PM2 configuration
sudo -u astrologyinsights pm2 save

# Setup PM2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u astrologyinsights --hp /home/astrologyinsights
```

#### Option B: Using Systemd

```bash
# Copy service file
sudo cp astrologyinsights.service /etc/systemd/system/

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable astrologyinsights
sudo systemctl start astrologyinsights
```

### 7. Configure Nginx

```bash
# Copy Nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/astrologyinsights

# Enable the site
sudo ln -s /etc/nginx/sites-available/astrologyinsights /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t
```

### 8. Setup SSL

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 9. Setup Firewall

```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
```

### 10. Start Services

```bash
sudo systemctl restart nginx
sudo systemctl restart postgresql
```

## 🎛️ Management Commands

### Application Management

```bash
# PM2 commands (if using PM2)
pm2 status                    # Check status
pm2 logs astrologyinsights   # View logs
pm2 restart astrologyinsights # Restart app
pm2 reload astrologyinsights  # Zero-downtime reload
pm2 stop astrologyinsights    # Stop app

# Systemd commands (if using systemd)
sudo systemctl status astrologyinsights    # Check status
sudo journalctl -u astrologyinsights -f    # View logs
sudo systemctl restart astrologyinsights   # Restart app
sudo systemctl stop astrologyinsights      # Stop app
```

### Nginx Management

```bash
sudo systemctl status nginx     # Check status
sudo systemctl reload nginx     # Reload configuration
sudo systemctl restart nginx    # Restart Nginx
sudo nginx -t                   # Test configuration
```

### Database Management

```bash
sudo -u postgres psql -d astrologyinsights  # Connect to database
sudo systemctl status postgresql            # Check PostgreSQL status
```

### SSL Certificate Management

```bash
sudo certbot certificates                   # List certificates
sudo certbot renew                         # Renew certificates
sudo certbot delete --cert-name yourdomain.com  # Delete certificate
```

## 📊 Monitoring and Logs

### Application Logs

```bash
# PM2 logs
pm2 logs astrologyinsights

# Systemd logs
sudo journalctl -u astrologyinsights -f

# Application log files
tail -f /var/www/astrologyinsights/logs/combined.log
tail -f /var/www/astrologyinsights/logs/error.log
```

### Nginx Logs

```bash
sudo tail -f /var/log/nginx/astrologyinsights_access.log
sudo tail -f /var/log/nginx/astrologyinsights_error.log
```

### System Monitoring

```bash
# Check system resources
htop
free -h
df -h

# Check running processes
ps aux | grep node
ps aux | grep nginx
```

## 🔒 Security Best Practices

### 1. Database Security

```bash
# Change default PostgreSQL password
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'strong_password';"

# Configure PostgreSQL access (edit pg_hba.conf)
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

### 2. Application Security

- ✅ Environment variables in secure `.env` file
- ✅ Session-based authentication
- ✅ Rate limiting configured in Nginx
- ✅ HTTPS-only in production
- ✅ Security headers configured

### 3. Server Security

```bash
# Update system regularly
sudo apt update && sudo apt upgrade -y

# Configure fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban

# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart ssh
```

## 🚀 Performance Optimization

### 1. Nginx Optimization

The provided `nginx.conf` includes:
- ✅ Gzip compression
- ✅ Static file caching
- ✅ HTTP/2 support
- ✅ Connection keep-alive
- ✅ Rate limiting

### 2. Node.js Optimization

```bash
# Use clustering (already configured in PM2)
pm2 start ecosystem.config.js

# Monitor performance
pm2 monit
```

### 3. Database Optimization

```bash
# Tune PostgreSQL configuration
sudo nano /etc/postgresql/*/main/postgresql.conf

# Key settings for production:
# shared_buffers = 25% of RAM
# work_mem = 4MB
# maintenance_work_mem = 64MB
# effective_cache_size = 75% of RAM
```

## 🔄 Updates and Maintenance

### Deploying Updates

```bash
# 1. Pull latest code
cd /var/www/astrologyinsights
sudo -u astrologyinsights git pull origin main

# 2. Install new dependencies
sudo -u astrologyinsights npm ci --production

# 3. Build application
sudo -u astrologyinsights npm run build

# 4. Restart application
pm2 reload astrologyinsights
# OR
sudo systemctl restart astrologyinsights
```

### Database Migrations

```bash
# Run database migrations if needed
cd /var/www/astrologyinsights
sudo -u astrologyinsights npm run migrate
```

### Backup Strategy

```bash
# Database backup
sudo -u postgres pg_dump astrologyinsights > backup_$(date +%Y%m%d).sql

# Application backup
sudo tar -czf app_backup_$(date +%Y%m%d).tar.gz /var/www/astrologyinsights
```

## 🆘 Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   # Check logs
   pm2 logs astrologyinsights
   sudo journalctl -u astrologyinsights -f
   
   # Check environment
   sudo -u astrologyinsights cat /var/www/astrologyinsights/.env
   ```

2. **Database connection issues**
   ```bash
   # Test database connection
   sudo -u postgres psql -d astrologyinsights -c "SELECT 1;"
   
   # Check PostgreSQL status
   sudo systemctl status postgresql
   ```

3. **SSL certificate issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificate
   sudo certbot renew
   ```

4. **Nginx configuration issues**
   ```bash
   # Test configuration
   sudo nginx -t
   
   # Check error logs
   sudo tail -f /var/log/nginx/error.log
   ```

### Performance Issues

```bash
# Check system resources
top
htop
iotop

# Check application performance
pm2 monit

# Analyze slow queries
sudo -u postgres psql -d astrologyinsights -c "SELECT * FROM pg_stat_activity;"
```

## 📞 Support

For deployment issues or questions:

1. Check the logs first
2. Review this documentation
3. Check the application's GitHub issues
4. Contact the development team

---

## 🎉 Success!

After successful deployment, your Astrology Insights application will be running with:

- ✅ **Session-based view tracking** (no inflation from refreshes)
- ✅ **HTTPS with automatic SSL renewal**
- ✅ **Production-grade Nginx configuration**
- ✅ **Robust process management**
- ✅ **Security hardening**
- ✅ **Performance optimization**

Your application should now be accessible at `https://yourdomain.com` with all the features working correctly! 🌟 