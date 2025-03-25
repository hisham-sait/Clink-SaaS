# Detailed VM-Based Deployment Guide for Bradán Accountants on GCP

This guide provides comprehensive step-by-step instructions for deploying the Bradán Accountants application on a Google Cloud Platform (GCP) Virtual Machine (VM) in the europe-west1 (Ireland) region.

## 1. Prerequisites

Before you begin, ensure you have:

- Google Cloud Platform account with billing enabled
- Google Cloud SDK installed on your local machine
- Basic knowledge of Linux commands
- Git repository with your application code

## 2. VM Setup and Configuration

### 2.1 Create a Compute Engine VM Instance

1. **Navigate to Compute Engine**:
   - Go to the GCP Console (https://console.cloud.google.com/)
   - Select your project
   - Navigate to "Compute Engine" > "VM instances"
   - Click "Create Instance"

2. **Configure the VM**:
   - **Name**: `bradan-accountants-vm`
   - **Region**: `europe-west1` (Ireland)
   - **Zone**: `europe-west1-b`
   - **Machine configuration**:
     - Series: E2 (cost-effective)
     - Machine type: e2-standard-2 (2 vCPU, 8 GB memory)
   - **Boot disk**:
     - Operating system: Ubuntu
     - Version: 22.04 LTS
     - Size: 30 GB (SSD persistent disk)
   - **Firewall**:
     - Allow HTTP traffic
     - Allow HTTPS traffic

3. **Advanced options**:
   - **Networking**:
     - Network tags: `bradan-web-server`
     - Network interfaces: default VPC
   - **Management**:
     - Startup script:
       ```bash
       #!/bin/bash
       apt-get update
       apt-get upgrade -y
       ```

4. **Click "Create"** to create the VM instance

### 2.2 Set Up SSH Access

1. **Connect to the VM** using the GCP Console's SSH button or use gcloud:
   ```bash
   gcloud compute ssh bradan-accountants-vm --zone=europe-west1-b
   ```

2. **Create a dedicated user** for the application:
   ```bash
   sudo adduser bradan
   sudo usermod -aG sudo bradan
   ```

3. **Set up SSH keys** for secure access:
   ```bash
   # On your local machine
   ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
   
   # Add the public key to the VM
   gcloud compute os-login ssh-keys add --key-file=~/.ssh/id_rsa.pub
   ```

## 3. OS Configuration

### 3.1 Update the System

```bash
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install -y build-essential
```

### 3.2 Install Node.js and npm

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node -v  # Should show v18.x.x
npm -v   # Should show 9.x.x or higher

# Install global dependencies
sudo npm install -g pm2
```

### 3.3 Install and Configure PostgreSQL

```bash
# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Start and enable PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user
sudo -i -u postgres

# Create database and user
psql -c "CREATE DATABASE bradan_accountants;"
psql -c "CREATE USER bradan_admin WITH ENCRYPTED PASSWORD 'your_secure_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE bradan_accountants TO bradan_admin;"
psql -c "ALTER USER bradan_admin WITH SUPERUSER;"

# Exit postgres user
exit
```

### 3.4 Install and Configure Redis

```bash
# Install Redis
sudo apt-get install -y redis-server

# Configure Redis to start on boot
sudo systemctl enable redis-server

# Update Redis configuration for better performance
sudo sed -i 's/supervised no/supervised systemd/g' /etc/redis/redis.conf

# Restart Redis
sudo systemctl restart redis-server
```

### 3.5 Install Git and Clone the Repository

```bash
# Install Git
sudo apt-get install -y git

# Clone the repository
mkdir -p /home/bradan/app
cd /home/bradan/app
git clone https://github.com/your-username/bradan-accountants.git .
```

### 3.6 Set Up Environment Variables

```bash
# Create .env file for backend
cat > /home/bradan/app/api/.env << EOF
# Server Configuration
PORT=3000

# Database Configuration
DATABASE_URL="postgresql://bradan_admin:your_secure_password@localhost:5432/bradan_accountants?schema=public"

# Security
JWT_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)

# Logging
LOG_LEVEL=info
LOG_DIR=logs

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Import Settings
IMPORT_BATCH_SIZE=1000
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads/imports
EOF

# Create .env file for frontend
cat > /home/bradan/app/app/.env.production << EOF
VITE_API_URL=https://your-domain.com/api
EOF

# Set proper ownership
sudo chown -R bradan:bradan /home/bradan/app
```

## 4. Application Deployment

### 4.1 Set Up the Backend

```bash
# Navigate to the API directory
cd /home/bradan/app/api

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed the database
npx prisma db seed

# Test the backend
npm start
```

### 4.2 Set Up the Frontend

```bash
# Navigate to the app directory
cd /home/bradan/app/app

# Install dependencies
npm install

# Build the frontend
npm run build
```

### 4.3 Configure PM2 for Process Management

```bash
# Navigate to the app root
cd /home/bradan/app

# Create PM2 configuration file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'bradan-backend',
      cwd: './api',
      script: 'server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
    }
  ],
};
EOF

# Start the application with PM2
pm2 start ecosystem.config.js

# Save the PM2 configuration to start on boot
pm2 save
pm2 startup
```

## 5. Web Server and HTTPS Setup

### 5.1 Install and Configure Nginx

```bash
# Install Nginx
sudo apt-get install -y nginx

# Create Nginx configuration
sudo cat > /etc/nginx/sites-available/bradan-accountants << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        root /home/bradan/app/app/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/bradan-accountants /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 5.2 Set Up HTTPS with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

## 6. Firewall Configuration

### 6.1 Configure UFW (Uncomplicated Firewall)

```bash
# Install UFW if not already installed
sudo apt-get install -y ufw

# Set default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https

# Enable the firewall
sudo ufw enable
```

### 6.2 Configure GCP Firewall Rules

1. **Navigate to VPC Network** > **Firewall** in the GCP Console
2. **Create a firewall rule**:
   - **Name**: `allow-web-traffic`
   - **Network**: default
   - **Priority**: 1000
   - **Direction of traffic**: ingress
   - **Action on match**: allow
   - **Targets**: specified target tags
   - **Target tags**: `bradan-web-server`
   - **Source filter**: IP ranges
   - **Source IP ranges**: `0.0.0.0/0`
   - **Protocols and ports**: 
     - TCP: 22, 80, 443

## 7. Monitoring and Logging

### 7.1 Set Up Application Logging

```bash
# Create logs directory
mkdir -p /home/bradan/app/api/logs
sudo chown -R bradan:bradan /home/bradan/app/api/logs

# Install logging tools
cd /home/bradan/app/api
npm install winston
```

### 7.2 Configure System Monitoring

```bash
# Install monitoring agent
curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh
sudo bash add-google-cloud-ops-agent-repo.sh --also-install

# Configure the agent
sudo cat > /etc/google-cloud-ops-agent/config.yaml << EOF
metrics:
  receivers:
    hostmetrics:
      type: hostmetrics
    nginx:
      type: nginx
    postgresql:
      type: postgresql
      receiver_version: 2
      username: bradan_admin
      password: your_secure_password
  service:
    pipelines:
      default_pipeline:
        receivers: [hostmetrics, nginx, postgresql]
logging:
  receivers:
    syslog:
      type: syslog
    nginx-access:
      type: nginx-access
  service:
    pipelines:
      default_pipeline:
        receivers: [syslog, nginx-access]
EOF

# Restart the agent
sudo systemctl restart google-cloud-ops-agent
```

### 7.3 Set Up Database Backups

```bash
# Create backup script
cat > /home/bradan/backup-db.sh << EOF
#!/bin/bash
BACKUP_DIR="/home/bradan/backups"
TIMESTAMP=\$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="\$BACKUP_DIR/bradan_accountants_\$TIMESTAMP.sql"

# Create backup directory if it doesn't exist
mkdir -p \$BACKUP_DIR

# Create backup
pg_dump -U bradan_admin -d bradan_accountants > \$BACKUP_FILE

# Compress backup
gzip \$BACKUP_FILE

# Upload to GCS (optional)
gsutil cp \$BACKUP_FILE.gz gs://your-backup-bucket/

# Remove backups older than 7 days
find \$BACKUP_DIR -type f -name "*.sql.gz" -mtime +7 -delete
EOF

# Make the script executable
chmod +x /home/bradan/backup-db.sh

# Set up cron job for daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /home/bradan/backup-db.sh") | crontab -
```

## 8. Performance Optimization

### 8.1 Optimize Node.js Performance

```bash
# Update PM2 configuration for better performance
cat > /home/bradan/app/ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'bradan-backend',
      cwd: './api',
      script: 'server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=4096'
      },
    }
  ],
};
EOF

# Restart the application
pm2 reload ecosystem.config.js
```

### 8.2 Optimize PostgreSQL

```bash
# Create PostgreSQL tuning file
sudo cat > /etc/postgresql/14/main/conf.d/tuning.conf << EOF
# Memory Configuration
shared_buffers = 2GB
effective_cache_size = 6GB
work_mem = 20MB
maintenance_work_mem = 512MB

# Checkpoint Configuration
checkpoint_completion_target = 0.9
max_wal_size = 2GB
min_wal_size = 1GB

# Query Planner Configuration
random_page_cost = 1.1
effective_io_concurrency = 200
EOF

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 8.3 Optimize Nginx

```bash
# Create Nginx performance configuration
sudo cat > /etc/nginx/conf.d/performance.conf << EOF
# Worker Configuration
worker_processes auto;
worker_rlimit_nofile 65535;

# Connection Configuration
events {
    worker_connections 4096;
    multi_accept on;
    use epoll;
}

# HTTP Configuration
http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # Gzip Settings
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_buffers 16 8k;
    gzip_http_version 1.1;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache Settings
    open_file_cache max=1000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
}
EOF

# Restart Nginx
sudo systemctl restart nginx
```

## 9. Scaling Considerations

### 9.1 Vertical Scaling

To vertically scale your VM (increase resources):

1. **Stop the VM** in the GCP Console
2. **Edit the VM**:
   - Change machine type to a larger size (e.g., e2-standard-4)
   - Increase disk size if needed
3. **Start the VM**

### 9.2 Horizontal Scaling

For horizontal scaling (multiple VMs):

1. **Create a VM instance template**:
   - In GCP Console, go to "Compute Engine" > "Instance templates"
   - Create a template based on your configured VM

2. **Create a managed instance group**:
   - Go to "Compute Engine" > "Instance groups"
   - Create a new managed instance group using your template
   - Configure autoscaling based on CPU usage

3. **Set up a load balancer**:
   - Go to "Network Services" > "Load balancing"
   - Create an HTTP(S) load balancer
   - Configure backend services to point to your instance group
   - Set up health checks

## 10. Maintenance and Updates

### 10.1 Updating the Application

```bash
# Navigate to the app directory
cd /home/bradan/app

# Pull the latest changes
git pull

# Update backend
cd api
npm install
npx prisma generate
npx prisma migrate deploy
pm2 restart bradan-backend

# Update frontend
cd ../app
npm install
npm run build
```

### 10.2 System Updates

```bash
# Update system packages
sudo apt-get update
sudo apt-get upgrade -y

# Reboot if necessary
sudo reboot
```

## 11. Troubleshooting

### 11.1 Check Application Logs

```bash
# Check PM2 logs
pm2 logs bradan-backend

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Check system logs
sudo journalctl -u nginx
sudo journalctl -u postgresql
sudo journalctl -u redis-server
```

### 11.2 Common Issues and Solutions

1. **Application not starting**:
   ```bash
   # Check for errors in the logs
   pm2 logs bradan-backend
   
   # Verify environment variables
   cat /home/bradan/app/api/.env
   
   # Check if the port is in use
   sudo netstat -tulpn | grep 3000
   ```

2. **Database connection issues**:
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Verify database connection
   psql -U bradan_admin -d bradan_accountants -c "SELECT 1"
   ```

3. **Nginx configuration issues**:
   ```bash
   # Test Nginx configuration
   sudo nginx -t
   
   # Check if Nginx is running
   sudo systemctl status nginx
   ```

## Conclusion

You have successfully deployed the Bradán Accountants application on a GCP VM. This setup provides you with full control over the operating system and environment, allowing for customization and optimization according to your specific needs.

For any issues or questions, refer to the troubleshooting section or contact your system administrator.
