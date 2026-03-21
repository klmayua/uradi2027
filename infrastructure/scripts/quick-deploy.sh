#!/bin/bash

# URADI-360 Quick Deployment Script
# One-command deployment for production

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$INFRA_DIR")"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  URADI-360 Quick Deploy${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# =============================================================================
# CHECK PREREQUISITES
# =============================================================================

check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"

    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Docker is not installed${NC}"
        exit 1
    fi

    # Check docker-compose
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}Docker Compose is not installed${NC}"
        exit 1
    fi

    # Check .env file
    if [ ! -f "$INFRA_DIR/vps/.env.production" ]; then
        echo -e "${RED}Environment file not found: $INFRA_DIR/vps/.env.production${NC}"
        echo "Please create the environment file first."
        exit 1
    fi

    echo -e "${GREEN}✓ All prerequisites met${NC}"
}

# =============================================================================
# DEPLOYMENT OPTIONS
# =============================================================================

show_menu() {
    echo ""
    echo "Select deployment option:"
    echo "  1) Full deployment (build + deploy + migrate)"
    echo "  2) Quick deploy (pull images only)"
    echo "  3) Database migration only"
    echo "  4) Rollback to previous version"
    echo "  5) View logs"
    echo "  6) Exit"
    echo ""
}

full_deployment() {
    echo -e "${YELLOW}Starting full deployment...${NC}"

    cd "$INFRA_DIR/vps"

    # Build and deploy
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d

    # Wait for database
    sleep 10

    # Run migrations
    echo -e "${YELLOW}Running database migrations...${NC}"
    docker-compose exec -T backend alembic upgrade head || true

    # Health check
    echo -e "${YELLOW}Running health check...${NC}"
    sleep 5

    if curl -s http://localhost:8000/health/simple > /dev/null; then
        echo -e "${GREEN}✓ Deployment successful!${NC}"
    else
        echo -e "${RED}✗ Health check failed${NC}"
        echo "Check logs with: docker-compose logs backend"
        exit 1
    fi
}

quick_deploy() {
    echo -e "${YELLOW}Starting quick deploy...${NC}"

    cd "$INFRA_DIR/vps"

    # Pull and deploy
    docker-compose pull
    docker-compose up -d

    echo -e "${GREEN}✓ Quick deploy complete${NC}"
}

run_migrations() {
    echo -e "${YELLOW}Running database migrations...${NC}"

    cd "$INFRA_DIR/vps"
    docker-compose exec -T backend alembic upgrade head

    echo -e "${GREEN}✓ Migrations complete${NC}"
}

rollback() {
    echo -e "${YELLOW}Rolling back...${NC}"

    cd "$INFRA_DIR/vps"
    docker-compose down

    # List previous images
    echo "Available images:"
    docker images | grep uradi360

    echo ""
    echo "Enter image tag to rollback to (or press Enter for previous):"
    read tag

    if [ -n "$tag" ]; then
        docker-compose up -d --build
    else
        docker-compose up -d
    fi

    echo -e "${GREEN}✓ Rollback complete${NC}"
}

view_logs() {
    cd "$INFRA_DIR/vps"
    docker-compose logs -f --tail=100
}

# =============================================================================
# MAIN
# =============================================================================

check_prerequisites

while true; do
    show_menu
    read -p "Enter choice [1-6]: " choice

    case $choice in
        1) full_deployment; break ;;
        2) quick_deploy; break ;;
        3) run_migrations; break ;;
        4) rollback; break ;;
        5) view_logs ;;
        6) echo "Exiting..."; exit 0 ;;
        *) echo -e "${RED}Invalid option${NC}" ;;
    esac
done

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment operation complete!${NC}"
echo -e "${GREEN}========================================${NC}"
