#!/bin/bash

# URADI-360 Production Deployment Script
# Full deployment with database migrations and health checks

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_NAME="uradi360"
COMPOSE_FILE="infrastructure/vps/docker-compose.yml"
ENV_FILE="infrastructure/vps/.env.production"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  URADI-360 Production Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# =============================================================================
# PRE-DEPLOYMENT CHECKS
# =============================================================================
echo -e "${YELLOW}Running pre-deployment checks...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: Environment file not found at $ENV_FILE${NC}"
    exit 1
fi

# Check if docker-compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}Error: Docker Compose file not found at $COMPOSE_FILE${NC}"
    exit 1
fi

# Check environment variables
source $ENV_FILE

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo -e "${RED}Error: Required environment variables not set${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Pre-deployment checks passed${NC}"
echo ""

# =============================================================================
# BACKUP DATABASE (Optional)
# =============================================================================
read -p "Create database backup before deployment? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Creating database backup...${NC}"
    pg_dump "$DATABASE_URL" > "backups/pre-deploy-$(date +%Y%m%d-%H%M%S).sql"
    echo -e "${GREEN}✓ Backup created${NC}"
fi
echo ""

# =============================================================================
# PULL LATEST IMAGES
# =============================================================================
echo -e "${YELLOW}Pulling latest Docker images...${NC}"
docker-compose -f $COMPOSE_FILE pull
echo -e "${GREEN}✓ Images pulled${NC}"
echo ""

# =============================================================================
# DATABASE MIGRATIONS
# =============================================================================
echo -e "${YELLOW}Running database migrations...${NC}"

# Start database connection (if not running)
docker-compose -f $COMPOSE_FILE up -d redis

# Wait for services
sleep 5

# Run migrations using a temporary container
docker run --rm --network host \
    -e DATABASE_URL="$DATABASE_URL" \
    -v "$(pwd)/infrastructure/supabase/schema.sql:/migrations/schema.sql" \
    postgres:15-alpine \
    psql "$DATABASE_URL" -f /migrations/schema.sql

echo -e "${GREEN}✓ Database migrations completed${NC}"
echo ""

# =============================================================================
# DEPLOY APPLICATION
# =============================================================================
echo -e "${YELLOW}Deploying application services...${NC}"

# Deploy with zero downtime (if possible)
# First start new containers alongside old ones
# Then switch traffic (handled by docker-compose)

docker-compose -f $COMPOSE_FILE up -d --remove-orphans --build

# Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
sleep 15

echo -e "${GREEN}✓ Services deployed${NC}"
echo ""

# =============================================================================
# HEALTH CHECKS
# =============================================================================
echo -e "${YELLOW}Running health checks...${NC}"

HEALTH_URL="http://localhost:8000/health"
MAX_RETRIES=10
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL 2>/dev/null || echo "000")

    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓ Health check passed${NC}"
        break
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "  Attempt $RETRY_COUNT/$MAX_RETRIES: Status $response, retrying..."
    sleep 5
done

if [ "$response" != "200" ]; then
    echo -e "${RED}✗ Health check failed after $MAX_RETRIES attempts${NC}"
    echo -e "${YELLOW}Rolling back...${NC}"
    docker-compose -f $COMPOSE_FILE down
    exit 1
fi

echo ""

# =============================================================================
# CLEANUP
# =============================================================================
echo -e "${YELLOW}Cleaning up old images and containers...${NC}"

# Remove unused images
docker image prune -f

# Remove stopped containers
docker container prune -f

# Show disk usage
docker system df

echo -e "${GREEN}✓ Cleanup completed${NC}"
echo ""

# =============================================================================
# POST-DEPLOYMENT VERIFICATION
# =============================================================================
echo -e "${YELLOW}Running post-deployment verification...${NC}"

# Check container status
containers=$(docker-compose -f $COMPOSE_FILE ps -q)
for container in $containers; do
    status=$(docker inspect -f '{{.State.Status}}' $container)
    name=$(docker inspect -f '{{.Name}}' $container | sed 's/\///')

    if [ "$status" != "running" ]; then
        echo -e "${RED}✗ Container $name is not running (status: $status)${NC}"
        exit 1
    fi

done

echo -e "${GREEN}✓ All containers are running${NC}"
echo ""

# =============================================================================
# DEPLOYMENT COMPLETE
# =============================================================================
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Application URLs:${NC}"
echo "  API:      https://api.uradi360.com"
echo "  Command:  https://app.uradi360.com"
echo "  Portal:   https://campaign.uradi360.com"
echo ""
echo -e "${BLUE}Services Status:${NC}"
docker-compose -f $COMPOSE_FILE ps
echo ""
echo -e "${BLUE}To view logs:${NC}"
echo "  docker-compose -f $COMPOSE_FILE logs -f"
echo ""
echo -e "${BLUE}To rollback:${NC}"
echo "  docker-compose -f $COMPOSE_FILE down && docker-compose -f $COMPOSE_FILE up -d"
echo ""

# Save deployment info
DEPLOY_DATE=$(date '+%Y-%m-%d %H:%M:%S')
echo "Deployed at: $DEPLOY_DATE" >> deploy-history.log
echo "Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')" >> deploy-history.log
echo "---" >> deploy-history.log
