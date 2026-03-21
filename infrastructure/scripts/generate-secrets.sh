#!/bin/bash

# URADI-360 Secret Generation Script
# Generates all required secure random strings

set -e

echo "========================================"
echo "  URADI-360 Secret Generator"
echo "========================================"
echo ""

# Generate secrets
JWT_SECRET=$(openssl rand -base64 64)
APP_SECRET_KEY=$(openssl rand -base64 32)
GDPR_TOKEN=$(openssl rand -hex 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -base64 32)
PAYSTACK_WEBHOOK_SECRET=$(openssl rand -hex 32)

echo "Generated Secrets:"
echo "========================================"
echo ""
echo "JWT_SECRET=${JWT_SECRET}"
echo ""
echo "APP_SECRET_KEY=${APP_SECRET_KEY}"
echo ""
echo "GDPR_DELETE_CONFIRMATION_TOKEN=${GDPR_TOKEN}"
echo ""
echo "REDIS_PASSWORD=${REDIS_PASSWORD}"
echo ""
echo "ENCRYPTION_KEY=${ENCRYPTION_KEY}"
echo ""
echo "PAYSTACK_WEBHOOK_SECRET=${PAYSTACK_WEBHOOK_SECRET}"
echo ""
echo "========================================"
echo ""
echo "Copy these values into your .env.production file"
echo "WARNING: These will only be shown once!"
echo ""

# Optionally save to file
read -p "Save to .env.secrets file? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cat > .env.secrets << EOF
# URADI-360 Generated Secrets
# Generated: $(date '+%Y-%m-%d %H:%M:%S')

JWT_SECRET=${JWT_SECRET}
APP_SECRET_KEY=${APP_SECRET_KEY}
GDPR_DELETE_CONFIRMATION_TOKEN=${GDPR_TOKEN}
REDIS_PASSWORD=${REDIS_PASSWORD}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
PAYSTACK_WEBHOOK_SECRET=${PAYSTACK_WEBHOOK_SECRET}
EOF
    chmod 600 .env.secrets
    echo "Secrets saved to .env.secrets (permissions: 600)"
fi
