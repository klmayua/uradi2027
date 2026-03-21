#!/bin/bash

# URADI-360 SSL Certificate Setup Script
# Uses Let's Encrypt certbot for free SSL certificates

set -e

# Configuration
DOMAIN="api.uradi360.com"
WS_DOMAIN="ws.uradi360.com"
APP_DOMAIN="app.uradi360.com"
CITIZEN_DOMAIN="campaign.uradi360.com"
EMAIL="admin@uradi360.com"  # Replace with your email

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}URADI-360 SSL Certificate Setup${NC}"
echo "================================"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}"
   exit 1
fi

# Install certbot if not present
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Installing certbot...${NC}"
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Create webroot for ACME challenges
mkdir -p /var/www/certbot

# Stop nginx temporarily (for standalone mode if needed)
echo -e "${YELLOW}Stopping nginx...${NC}"
systemctl stop nginx || true

# Obtain certificates
echo -e "${YELLOW}Obtaining SSL certificates...${NC}"
certbot certonly \
    --standalone \
    --agree-tos \
    --non-interactive \
    --email $EMAIL \
    -d $DOMAIN \
    -d $WS_DOMAIN \
    -d $APP_DOMAIN \
    -d $citizen_DOMAIN

# Copy certificates to nginx ssl directory
mkdir -p /etc/nginx/ssl
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /etc/nginx/ssl/
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /etc/nginx/ssl/

# Set permissions
chmod 644 /etc/nginx/ssl/fullchain.pem
chmod 600 /etc/nginx/ssl/privkey.pem

# Start nginx
echo -e "${YELLOW}Starting nginx...${NC}"
systemctl start nginx

# Setup auto-renewal
echo -e "${YELLOW}Setting up auto-renewal...${NC}"
(systemctl status certbot.timer &> /dev/null) || systemctl enable certbot.timer

# Create renewal hook for nginx reload
cat > /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh << 'EOF'
#!/bin/bash
# Reload nginx after certificate renewal
cp /etc/letsencrypt/live/api.uradi360.com/fullchain.pem /etc/nginx/ssl/
cp /etc/letsencrypt/live/api.uradi360.com/privkey.pem /etc/nginx/ssl/
systemctl reload nginx
EOF

chmod +x /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh

echo -e "${GREEN}SSL setup complete!${NC}"
echo ""
echo "Certificates installed at:"
echo "  - /etc/nginx/ssl/fullchain.pem"
echo "  - /etc/nginx/ssl/privkey.pem"
echo ""
echo "Auto-renewal is enabled. Test with: certbot renew --dry-run"
