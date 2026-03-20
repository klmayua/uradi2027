#!/bin/bash

# URADI-360 Production Deployment Script
# This script automates the deployment of URADI-360 to production

set -e

echo "=========================================="
echo "URADI-360 Production Deployment"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="Uradi360_Build/backend"
FRONTEND_DIR="Uradi360_Build/apps/command-center"
RAILWAY_PROJECT="uradi360-backend"
VERCEL_PROJECT="uradi360-command-center"

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check prerequisites
echo "Step 1: Checking prerequisites..."
echo "----------------------------------------"

# Check Railway CLI
if ! command -v railway &> /dev/null; then
    print_error "Railway CLI not found. Install with: npm install -g @railway/cli"
    exit 1
fi
print_status "Railway CLI found"

# Check Vercel CLI
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI not found. Install with: npm install -g vercel"
    exit 1
fi
print_status "Vercel CLI found"

# Check if logged in
if ! railway whoami &> /dev/null; then
    print_error "Not logged into Railway. Run: railway login"
    exit 1
fi
print_status "Logged into Railway"

if ! vercel whoami &> /dev/null; then
    print_error "Not logged into Vercel. Run: vercel login"
    exit 1
fi
print_status "Logged into Vercel"

echo ""
echo "Step 2: Deploying Backend..."
echo "----------------------------------------"

# Deploy Backend
cd $BACKEND_DIR

# Check if project exists
if ! railway status &> /dev/null; then
    print_warning "Railway project not found. Creating..."
    railway init --name $RAILWAY_PROJECT
fi

# Set environment variables (if not already set)
print_status "Checking environment variables..."

# Deploy to Railway
print_status "Deploying to Railway..."
railway up --detach

# Run migrations
print_status "Running database migrations..."
railway run alembic upgrade head

# Get backend URL
BACKEND_URL=$(railway status --json | jq -r '.domain')
print_status "Backend deployed to: $BACKEND_URL"

cd -

echo ""
echo "Step 3: Deploying Frontend..."
echo "----------------------------------------"

# Deploy Frontend
cd $FRONTEND_DIR

# Update environment variable
export NEXT_PUBLIC_API_URL="https://$BACKEND_URL"
print_status "Set API URL: $NEXT_PUBLIC_API_URL"

# Install dependencies
print_status "Installing dependencies..."
npm ci

# Build
print_status "Building..."
npm run build

# Deploy to Vercel
print_status "Deploying to Vercel..."
vercel --prod --yes

# Get frontend URL
FRONTEND_URL=$(vercel ls --json | jq -r '.[0].url')
print_status "Frontend deployed to: $FRONTEND_URL"

cd -

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Backend URL: https://$BACKEND_URL"
echo "Frontend URL: https://$FRONTEND_URL"
echo "API Docs: https://$BACKEND_URL/docs"
echo ""
echo "Next Steps:"
echo "1. Configure custom domains in Railway/Vercel dashboards"
echo "2. Set up SSL certificates"
echo "3. Configure Sentry for error tracking"
echo "4. Test authentication flow"
echo "5. Verify all integrations (SMS, WhatsApp, Email)"
echo ""
echo "Run verification with:"
echo "  curl https://$BACKEND_URL/health"
echo ""
