#!/bin/bash

# URADI-360 VPS Provisioning Script
# Sets up Docker, Nginx, SSL, and deployment environment

set -e

# Configuration
APP_NAME="uradi360"
DOCKER_VERSION="24.0"
DOCKER_COMPOSE_VERSION="2.21"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  URADI-360 VPS Provisioning Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root or with sudo${NC}"
   exit 1
fi

# Get server IP
SERVER_IP=$(curl -s ifconfig.me)
echo -e "${BLUE}Server IP: $SERVER_IP${NC}"
echo ""

# =============================================================================
# STEP 1: System Update
# =============================================================================
echo -e "${YELLOW}[1/10] Updating system packages...${NC}"
apt-get update -y
apt-get upgrade -y
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    ufw \
    fail2ban \
    htop \
    vim \
    git \
    unzip

# =============================================================================
# STEP 2: Install Docker
# =============================================================================
echo -e "${YELLOW}[2/10] Installing Docker...${NC}"

# Remove old versions
apt-get remove -y docker docker-engine docker.io containerd runc || true

# Add Docker official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker
systemctl enable docker
systemctl start docker

# Add user to docker group (replace 'ubuntu' with your username)
usermod -aG docker ubuntu || true
usermod -aG docker $SUDO_USER || true

echo -e "${GREEN}Docker installed successfully${NC}"
docker --version

# =============================================================================
# STEP 3: Install Docker Compose
# =============================================================================
echo -e "${YELLOW}[3/10] Installing Docker Compose...${NC}"

DOCKER_COMPOSE_URL="https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}.0/docker-compose-$(uname -s)-$(uname -m)"
curl -L "$DOCKER_COMPOSE_URL" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create symlink
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

echo -e "${GREEN}Docker Compose installed successfully${NC}"
docker-compose --version

# =============================================================================
# STEP 4: Configure Firewall
# =============================================================================
echo -e "${YELLOW}[4/10] Configuring firewall...${NC}"

# Reset UFW
ufw --force reset

# Default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (before enabling)
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow Docker networks
ufw allow from 172.16.0.0/12
ufw allow from 192.168.0.0/16

# Enable UFW
echo "y" | ufw enable

echo -e "${GREEN}Firewall configured${NC}"
ufw status verbose

# =============================================================================
# STEP 5: Install Fail2ban
# =============================================================================
echo -e "${YELLOW}[5/10] Configuring Fail2ban...${NC}"

# Configure Fail2ban for SSH
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
EOF

systemctl enable fail2ban
systemctl restart fail2ban

echo -e "${GREEN}Fail2ban configured${NC}"

# =============================================================================
# STEP 6: Create Application Directory Structure
# =============================================================================
echo -e "${YELLOW}[6/10] Creating application directories...${NC}"

mkdir -p /opt/$APP_NAME/{backend,frontend,logs,backups,ssl}
mkdir -p /var/log/$APP_NAME
mkdir -p /var/www/certbot

# Set permissions
chown -R $SUDO_USER:$SUDO_USER /opt/$APP_NAME || true
chmod -R 755 /opt/$APP_NAME

echo -e "${GREEN}Directory structure created at /opt/$APP_NAME${NC}"

# =============================================================================
# STEP 7: Install Nginx
# =============================================================================
echo -e "${YELLOW}[7/10] Installing Nginx...${NC}"

apt-get install -y nginx

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Create basic nginx config
cat > /etc/nginx/nginx.conf << 'EOF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript text/javascript;

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF

systemctl restart nginx

echo -e "${GREEN}Nginx installed and configured${NC}"

# =============================================================================
# STEP 8: Setup Log Rotation
# =============================================================================
echo -e "${YELLOW}[8/10] Configuring log rotation...${NC}"

cat > /etc/logrotate.d/$APP_NAME << EOF
/opt/$APP_NAME/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}

/var/log/$APP_NAME/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 www-data www-data
}
EOF

echo -e "${GREEN}Log rotation configured${NC}"

# =============================================================================
# STEP 9: Setup Automated Backups
# =============================================================================
echo -e "${YELLOW}[9/10] Setting up backup scripts...${NC}"

cat > /opt/$APP_NAME/backup.sh << 'EOF'
#!/bin/bash
# Automated backup script for URADI-360

BACKUP_DIR="/opt/uradi360/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

# Backup Docker volumes
docker run --rm -v uradi360-backend_logs:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/logs_$DATE.tar.gz -C /data .
docker run --rm -v uradi360-uploads:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/uploads_$DATE.tar.gz -C /data .

# Backup Redis (if needed)
# docker exec uradi360-redis redis-cli SAVE
# docker cp uradi360-redis:/data/dump.rdb $BACKUP_DIR/redis_$DATE.rdb

# Clean old backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE"
EOF

chmod +x /opt/$APP_NAME/backup.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /opt/$APP_NAME/backup.sh >> /var/log/$APP_NAME/backup.log 2>>1" | crontab -

echo -e "${GREEN}Backup script created and scheduled${NC}"

# =============================================================================
# STEP 10: Create Deployment Scripts
# =============================================================================
echo -e "${YELLOW}[10/10] Creating deployment scripts...${NC}"

cat > /opt/$APP_NAME/deploy.sh << 'EOF'
#!/bin/bash
# URADI-360 Deployment Script

set -e

echo "========================================"
echo "  URADI-360 Deployment"
echo "========================================"

# Pull latest images
echo "Pulling latest images..."
docker-compose pull

# Deploy
echo "Deploying..."
docker-compose up -d --remove-orphans

# Cleanup old images
echo "Cleaning up..."
docker image prune -f

echo "Deployment complete!"
docker-compose ps
EOF

chmod +x /opt/$APP_NAME/deploy.sh

# Create health check script
cat > /opt/$APP_NAME/health-check.sh << 'EOF'
#!/bin/bash
# Health check script

HEALTH_URL="http://localhost:8000/health"
SLACK_WEBHOOK=""  # Add your Slack webhook URL

response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL || echo "000")

if [ "$response" != "200" ]; then
    echo "Health check failed! Status: $response"

    # Restart containers if unhealthy
    docker-compose restart backend

    # Send alert (uncomment with Slack webhook)
    # curl -X POST -H 'Content-type: application/json' \
    #     --data '{"text":"🚨 URADI-360 Health Check Failed!"}' \
    #     $SLACK_WEBHOOK

    exit 1
fi

echo "Health check passed!"
EOF

chmod +x /opt/$APP_NAME/health-check.sh

# =============================================================================
# COMPLETION
# =============================================================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  VPS Provisioning Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Copy your docker-compose.yml to /opt/$APP_NAME/"
echo "  2. Copy your .env.production to /opt/$APP_NAME/.env"
echo "  3. Configure Nginx site: /etc/nginx/sites-available/"
echo "  4. Run SSL setup: infrastructure/vps/ssl/setup-ssl.sh"
echo "  5. Deploy: cd /opt/$APP_NAME && ./deploy.sh"
echo ""
echo -e "${YELLOW}Note: Log out and log back in for Docker group changes to take effect${NC}"
