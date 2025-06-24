# 🚀 Linux Deployment Guide for Astrology Insights

This guide will help you deploy your Astrology Insights application on a Linux server with Nginx, SSL, and Neon Database integration.

## 📋 Prerequisites

- Ubuntu 20.04+ or Debian 10+ server
- Root or sudo access
- Domain name pointing to your server (optional for SSL)
- At least 1GB RAM and 10GB storage
- **Neon Database** account and connection string

## 🏗️ Architecture Overview

```
Internet → Nginx (Port 80/443) → Node.js App (Port 5000) → Neon Database (Cloud)
```

- **Nginx**: Reverse proxy, SSL termination, static file serving
- **Node.js**: Application server with session-based view tracking
- **Neon Database**: Cloud PostgreSQL database for articles, views, and analytics
- **PM2/Systemd**: Process management and auto-restart
- **Let's Encrypt**: Free SSL certificates (optional)

## 🎯 Key Benefits of Using Neon DB

- ✅ **No local database setup** required
- ✅ **Automatic backups** and point-in-time recovery
- ✅ **Serverless scaling** with auto-pause
- ✅ **Built-in connection pooling**
- ✅ **Global availability** and low latency
- ✅ **Zero maintenance** database management

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

## 🔧 Manual Deployment Steps

### 1. System Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install other dependencies
sudo apt install -y nginx git curl
```

### 2. Create Application User

```bash
sudo useradd -m -s /bin/bash astrologyinsights
sudo usermod -aG www-data astrologyinsights
```

### 3. Setup Neon Database

1. **Create a Neon account** at [neon.tech](https://neon.tech)
2. **Create a new project** and database
3. **Copy the connection string** from your Neon dashboard
4. **Note**: The connection string looks like:
   ```
   postgresql://username:password@ep-xyz.region.aws.neon.tech/database?sslmode=require
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

### 5. Configure Environment Variables

```bash
sudo -u astrologyinsights tee /var/www/astrologyinsights/.env <<EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://your-neon-connection-string-here
SESSION_SECRET=$(openssl rand -base64 32)
VITE_API_URL=https://yourdomain.com/api
EOF

sudo chmod 600 /var/www/astrologyinsights/.env
```

**Important**: Replace `your-neon-connection-string-here` with your actual Neon database connection string.

### 6. Setup Process Management

#### Option A: Using PM2 (Recommended)

```bash
# Install PM2
sudo npm install -g pm2

# Create PM2 ecosystem file
sudo -u astrologyinsights tee /var/www/astrologyinsights/ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'astrologyinsights',
    script: 'server/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx',
    cwd: '/var/www/astrologyinsights',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    log_file: '/var/www/astrologyinsights/logs/combined.log',
    out_file: '/var/www/astrologyinsights/logs/out.log',
    error_file: '/var/www/astrologyinsights/logs/error.log',
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
sudo -u astrologyinsights mkdir -p /var/www/astrologyinsights/logs

# Start application with PM2
cd /var/www/astrologyinsights
sudo -u astrologyinsights pm2 start ecosystem.config.js
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

# Start Nginx
sudo systemctl restart nginx
```

### 8. Setup SSL (Optional - for domain access)

If you have a domain name:

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

### 10. Test the Application

```bash
# For IP access (development)
curl http://10.70.10.71/api/articles

# For domain access (production)
curl https://yourdomain.com/api/articles
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

Since you're using Neon DB, most database management is handled through the Neon console:

- **Monitoring**: Use Neon dashboard for metrics
- **Backups**: Automatic with Neon
- **Scaling**: Automatic based on usage
- **Connection pooling**: Built-in

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

### Neon Database Monitoring

- Access the **Neon Console** at [console.neon.tech](https://console.neon.tech)
- Monitor **connection count**, **query performance**, and **storage usage**
- Set up **alerts** for high usage or connection limits

## 🔒 Security Best Practices

### 1. Environment Variables

```bash
# Secure your .env file
sudo chmod 600 /var/www/astrologyinsights/.env
sudo chown astrologyinsights:www-data /var/www/astrologyinsights/.env
```

### 2. Neon Database Security

- ✅ **TLS encryption** is enabled by default
- ✅ **IP allowlisting** can be configured in Neon console
- ✅ **Connection pooling** prevents connection exhaustion
- ✅ **Automatic backups** with point-in-time recovery

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

### 1. Nginx Configuration

The provided `nginx.conf` includes:
- ✅ Gzip compression
- ✅ Static file caching
- ✅ HTTP/2 support (with SSL)
- ✅ Connection keep-alive
- ✅ Rate limiting

### 2. Node.js Clustering

```bash
# PM2 automatically uses all CPU cores
pm2 start ecosystem.config.js

# Monitor performance
pm2 monit
```

### 3. Neon Database Optimization

- ✅ **Connection pooling** is automatic
- ✅ **Auto-pause** when not in use saves costs
- ✅ **Regional deployment** for low latency
- ✅ **Read replicas** available for scaling reads

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

The application includes automatic database initialization that creates tables if they don't exist. For new migrations:

```bash
cd /var/www/astrologyinsights
sudo -u astrologyinsights npm run migrate  # If you have migration scripts
```

### Backup Strategy

With Neon DB, backups are automatic:
- ✅ **Continuous backups** with point-in-time recovery
- ✅ **30-day retention** on free tier, longer on paid plans
- ✅ **One-click restore** from Neon console

For application files:
```bash
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
   # Test Neon connection
   sudo -u astrologyinsights node -e "
   const { Client } = require('pg');
   const client = new Client({ connectionString: process.env.DATABASE_URL });
   client.connect().then(() => console.log('✅ Connected')).catch(console.error);
   "
   ```

3. **SSL certificate issues** (if using domain)
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

# Check application performance
pm2 monit

# Check Neon database performance in console
# Visit https://console.neon.tech → Your Project → Monitoring
```

## 📞 Support

For deployment issues:

1. **Check application logs** first
2. **Review Neon console** for database issues
3. **Check this documentation** for common solutions
4. **Contact support** if needed

---

## 🎉 Success!

After successful deployment, your Astrology Insights application will be running with:

- ✅ **Session-based view tracking** (no inflation from refreshes)
- ✅ **Cloud database** with Neon (automatic backups, scaling)
- ✅ **Production-grade Nginx** configuration
- ✅ **Robust process management** with PM2/Systemd
- ✅ **Security hardening** and rate limiting
- ✅ **Optional HTTPS** with automatic SSL renewal

Your application should be accessible at:
- **Development**: `http://10.70.10.71` (or your server IP)
- **Production**: `https://yourdomain.com` (if domain configured)

The session-based view tracking ensures realistic analytics without artificial inflation from browser refreshes! 🌟 