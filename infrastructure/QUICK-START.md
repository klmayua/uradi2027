# URADI-360 Production Deployment Quick Start

**Follow these steps to deploy URADI-360 to production.**

---

## Prerequisites

Before starting, ensure you have:

- [ ] VPS with Ubuntu 22.04+ (4 vCPU, 8GB RAM, 100GB SSD)
- [ ] Domain name configured with CloudFlare
- [ ] Supabase Pro project created
- [ ] GitHub repository with Actions enabled

---

## Step 1: Clone Repository on VPS

```bash
ssh root@your-vps-ip

# Create app directory
mkdir -p /opt/uradi360
cd /opt/uradi360

# Clone repository
git clone https://github.com/your-org/uradi360.git .

# Checkout main branch
git checkout main
```

---

## Step 2: Configure Environment

```bash
# Copy environment template
cp infrastructure/vps/.env.production .env

# Edit with your values
nano .env
```

**Required Variables:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_KEY` - Your Supabase service role key
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_PASSWORD` - Strong password for Redis
- `APP_SECRET_KEY` - 32+ character random string
- `SENTRY_DSN` - Your Sentry project DSN
- `SMTP_PASSWORD` - SendGrid API key
- `TWILIO_*` - Twilio credentials for SMS

---

## Step 3: Run Provisioning Script

```bash
# Make script executable
chmod +x infrastructure/scripts/provision-vps.sh

# Run provisioning (takes ~15 minutes)
sudo ./infrastructure/scripts/provision-vps.sh
```

This will install:
- Docker & Docker Compose
- Nginx
- SSL certificates (via Let's Encrypt)
- Firewall (UFW)
- Fail2ban
- Log rotation
- Backup scripts

---

## Step 4: Configure CloudFlare

1. Log into CloudFlare dashboard
2. Select your domain
3. Import DNS records from `infrastructure/cloudflare/dns-records.yml`
4. Configure firewall rules from `infrastructure/cloudflare/firewall-rules.yml`
5. Enable "Full (strict)" SSL/TLS mode

---

## Step 5: Deploy Application

### Option A: Automated Deploy (Recommended)

```bash
# Quick deploy script
chmod +x infrastructure/scripts/quick-deploy.sh
./infrastructure/scripts/quick-deploy.sh
```

Select option 1 for full deployment.

### Option B: Manual Deploy

```bash
cd infrastructure/vps

# Build and start
docker-compose up -d --build

# Run migrations
docker-compose exec backend alembic upgrade head

# Verify
./../scripts/health-check.sh
```

---

## Step 6: Verify Deployment

```bash
# Check all services are running
docker-compose ps

# View logs
docker-compose logs -f backend

# Test API
curl https://api.uradi360.com/health

# Test frontend
curl https://app.uradi360.com
```

---

## Step 7: Configure GitHub Actions

1. Go to GitHub repository > Settings > Secrets and variables > Actions
2. Add the following secrets:

| Secret Name | Description |
|-------------|-------------|
| `VPS_HOST` | Your VPS IP address |
| `VPS_USERNAME` | SSH username (e.g., deploy) |
| `VPS_SSH_KEY` | Private SSH key for deployment |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `SENTRY_DSN` | Sentry DSN |
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications |
| `GITHUB_TOKEN` | Auto-generated, no need to add |

3. Push to main branch to trigger first deployment:

```bash
git push origin main
```

---

## Step 8: Set Up Monitoring

```bash
# Run monitoring setup
chmod +x infrastructure/scripts/setup-monitoring.sh
sudo ./infrastructure/scripts/setup-monitoring.sh
```

Access monitoring:
- **Grafana**: http://your-vps-ip:3000
- **Prometheus**: http://your-vps-ip:9090
- **Sentry**: https://your-sentry-project.sentry.io

---

## Step 9: Run Database Seeds

```bash
# Create first tenant and admin user
docker-compose exec backend python -c "
from database import SessionLocal
from models import Tenant, Profile
# Add your seed logic here
"
```

---

## Common Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f celery-worker

# Scale workers
docker-compose up -d --scale celery-worker=4

# Restart service
docker-compose restart backend

# Database shell
docker-compose exec backend psql \$DATABASE_URL

# Redis CLI
docker-compose exec redis redis-cli

# Backup database
docker-compose exec backend pg_dump \$DATABASE_URL > backup.sql

# Update deployment
git pull
docker-compose up -d --build
```

---

## Troubleshooting

### Container won't start
```bash
docker-compose logs backend | tail -50
```

### Database connection issues
```bash
# Test connection
docker-compose exec backend python -c "from database import engine; engine.connect()"
```

### SSL certificate issues
```bash
# Renew certificates
certbot renew --force-renewal
```

### Out of disk space
```bash
# Clean up Docker
docker system prune -af
docker volume prune -f
```

---

## Support

For deployment issues:
- Check logs: `docker-compose logs`
- Review documentation in `infrastructure/README.md`
- Contact: infrastructure@uradi360.com

---

**Your URADI-360 platform should now be live!**
