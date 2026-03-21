#!/bin/bash

# URADI-360 Full Provisioning and Deployment Script
# Run this on the VPS to set up everything from scratch

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  URADI-360 Full Provision & Deploy${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Configuration
PROJECT_ROOT="/opt/uradi360"
INFRA_DIR="${PROJECT_ROOT}/infrastructure"
VPS_DIR="${INFRA_DIR}/vps"

# =============================================================================
# CHECK IF RUNNING AS ROOT
# =============================================================================
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root or with sudo${NC}"
   exit 1
fi

# =============================================================================
# STEP 1: SYSTEM UPDATE & DEPENDENCIES
# =============================================================================
echo -e "${YELLOW}[1/10] Updating system and installing dependencies...${NC}"
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
    unzip \
    openssl

# =============================================================================
# STEP 2: GENERATE SECRETS
# =============================================================================
echo -e "${YELLOW}[2/10] Generating secure secrets...${NC}"

JWT_SECRET=$(openssl rand -base64 64)
APP_SECRET_KEY=$(openssl rand -base64 32)
GDPR_TOKEN=$(openssl rand -hex 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)
PAYSTACK_WEBHOOK_SECRET=$(openssl rand -hex 32)

echo -e "${GREEN}✓ Secrets generated${NC}"

# =============================================================================
# STEP 3: INSTALL DOCKER
# =============================================================================
echo -e "${YELLOW}[3/10] Installing Docker...${NC}"

# Remove old versions
apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Add Docker official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

systemctl enable docker
systemctl start docker

echo -e "${GREEN}✓ Docker installed${NC}"

# =============================================================================
# STEP 4: INSTALL DOCKER COMPOSE
# =============================================================================
echo -e "${YELLOW}[4/10] Installing Docker Compose...${NC}"

DOCKER_COMPOSE_VERSION="2.21.0"
DOCKER_COMPOSE_URL="https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)"
curl -L "$DOCKER_COMPOSE_URL" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

echo -e "${GREEN}✓ Docker Compose installed${NC}"

# =============================================================================
# STEP 5: CONFIGURE FIREWALL
# =============================================================================
echo -e "${YELLOW}[5/10] Configuring firewall...${NC}"

ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow from 172.16.0.0/12
ufw allow from 192.168.0.0/16

echo "y" | ufw enable

echo -e "${GREEN}✓ Firewall configured${NC}"

# =============================================================================
# STEP 6: INSTALL NGINX
# =============================================================================
echo -e "${YELLOW}[6/10] Installing Nginx...${NC}"

apt-get install -y nginx
rm -f /etc/nginx/sites-enabled/default

echo -e "${GREEN}✓ Nginx installed${NC}"

# =============================================================================
# STEP 7: SETUP SSL CERTIFICATES
# =============================================================================
echo -e "${YELLOW}[7/10] Setting up SSL certificates...${NC}"

apt-get install -y certbot python3-certbot-nginx

# Create webroot for ACME challenges
mkdir -p /var/www/certbot

# Note: Actual certificate generation will happen after DNS is configured
# For now, create self-signed cert for testing
mkdir -p /etc/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/privkey.pem \
    -out /etc/nginx/ssl/fullchain.pem \
    -subj "/C=NG/ST=Lagos/L=Lagos/O=URADI360/CN=api.uradi360.com" 2>/dev/null || true

echo -e "${GREEN}✓ SSL setup complete (will use certbot for production certs)${NC}"

# =============================================================================
# STEP 8: CREATE PROJECT DIRECTORIES
# =============================================================================
echo -e "${YELLOW}[8/10] Creating project directories...${NC}"

mkdir -p ${PROJECT_ROOT}/{backend,frontend,logs,backups,ssl}
mkdir -p /var/log/uradi360
mkdir -p /opt/uradi360/monitoring

chown -R $SUDO_USER:$SUDO_USER ${PROJECT_ROOT} 2>/dev/null || true
chmod -R 755 ${PROJECT_ROOT}

echo -e "${GREEN}✓ Directories created at ${PROJECT_ROOT}${NC}"

# =============================================================================
# STEP 9: CREATE ENVIRONMENT FILE
# =============================================================================
echo -e "${YELLOW}[9/10] Creating environment file...${NC}"

# Create .env file with generated secrets
cat > ${VPS_DIR}/.env.production << EOF
# URADI-360 Production Environment
# Auto-generated: $(date '+%Y-%m-%d %H:%M:%S')

# =============================================================================
# APPLICATION
# =============================================================================
APP_NAME=URADI-360
APP_ENV=production
APP_DEBUG=false
APP_SECRET_KEY=${APP_SECRET_KEY}
APP_URL=https://api.uradi360.com
FRONTEND_URL=https://app.uradi360.com
CITIZEN_PORTAL_URL=https://campaign.uradi360.com

# =============================================================================
# SECURITY
# =============================================================================
CORS_ORIGINS=https://app.uradi360.com,https://campaign.uradi360.com,https://uradi360.com
CORS_CREDENTIALS=true
RATE_LIMIT_REQUESTS_PER_MINUTE=100
RATE_LIMIT_BURST=20
ENCRYPTION_KEY=${ENCRYPTION_KEY}
GDPR_DELETE_CONFIRMATION_TOKEN=${GDPR_TOKEN}

# =============================================================================
# AUTHENTICATION
# =============================================================================
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
PASSWORD_RESET_TOKEN_EXPIRE_HOURS=24
MAGIC_LINK_EXPIRE_MINUTES=15

# =============================================================================
# REDIS
# =============================================================================
REDIS_URL=redis://redis:6379/0
REDIS_CACHE_URL=redis://redis:6379/1
REDIS_CELERY_URL=redis://redis:6379/2
REDIS_PASSWORD=${REDIS_PASSWORD}

# =============================================================================
# CELERY
# =============================================================================
CELERY_BROKER_URL=redis://:${REDIS_PASSWORD}@redis:6379/2
CELERY_RESULT_BACKEND=redis://:${REDIS_PASSWORD}@redis:6379/3
CELERY_WORKER_CONCURRENCY=4
CELERY_TASK_TIME_LIMIT=3600

# =============================================================================
# ELECTION
# =============================================================================
ELECTION_DATE=2027-03-06
ELECTION_TYPE=gubernatorial
ELECTION_STATE=Jigawa
VOTER_REGISTRATION_DEADLINE=2027-01-15

# =============================================================================
# MAINTENANCE
# =============================================================================
MAINTENANCE_MODE=false
MAINTENANCE_MESSAGE="Platform is under maintenance. Please try again later."
BACKUP_RETENTION_DAYS=30

# =============================================================================
# PLACEHOLDER - USER MUST FILL IN
# =============================================================================
# DATABASE_URL=postgresql://...
# SUPABASE_URL=https://...
# SUPABASE_KEY=...
# SUPABASE_SERVICE_KEY=...
# JWT_SECRET=...
# PAYSTACK_SECRET_KEY=...
# PAYSTACK_PUBLIC_KEY=...
EOF

chmod 600 ${VPS_DIR}/.env.production
echo -e "${GREEN}✓ Environment file created${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT: Edit ${VPS_DIR}/.env.production and fill in the placeholder values!${NC}"

# =============================================================================
# STEP 10: SETUP LOGROTATE & BACKUPS
# =============================================================================
echo -e "${YELLOW}[10/10] Setting up log rotation and backups...${NC}"

# Logrotate
cat > /etc/logrotate.d/uradi360 << 'EOF'
/opt/uradi360/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}

/var/log/uradi360/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 www-data www-data
}
EOF

# Backup script
cat > ${PROJECT_ROOT}/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/uradi360/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

# Backup Docker volumes
docker run --rm -v uradi360_backend_logs:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/logs_$DATE.tar.gz -C /data . 2>/dev/null || true
docker run --rm -v uradi360_uploads:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/uploads_$DATE.tar.gz -C /data . 2>/dev/null || true

# Clean old backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE"
EOF

chmod +x ${PROJECT_ROOT}/backup.sh

# Schedule backups
echo "0 2 * * * /opt/uradi360/backup.sh >> /var/log/uradi360/backup.log 2>&1" | crontab -

echo -e "${GREEN}✓ Log rotation and backups configured${NC}"

# =============================================================================
# COMPLETION
# =============================================================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  VPS Provisioning Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Copy your application code to ${PROJECT_ROOT}"
echo "  2. Edit ${VPS_DIR}/.env.production and fill in:"
echo "     - DATABASE_URL (from Supabase)"
echo "     - SUPABASE_* keys"
echo "     - JWT_SECRET (run: openssl rand -base64 64)"
echo "     - PAYSTACK keys"
echo "     - CLOUDFLARE tokens"
echo "  3. Run: cd ${VPS_DIR} && docker-compose up -d"
echo "  4. Configure DNS to point to this VPS IP"
echo "  5. Run: certbot --nginx -d api.uradi360.com"
echo ""
echo -e "${BLUE}Generated Secrets (save these!):${NC}"
echo "  JWT_SECRET: ${JWT_SECRET:0:20}..."
echo "  APP_SECRET_KEY: ${APP_SECRET_KEY:0:20}..."
echo "  REDIS_PASSWORD: ${REDIS_PASSWORD:0:20}..."
echo ""
echo -e "${YELLOW}Full secrets saved to: ${VPS_DIR}/.env.production${NC}"
