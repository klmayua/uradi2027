# URADI-360 Production Deployment Configuration

## Backend Deployment (Railway)

### 1. Create Railway Project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init --name uradi360-backend
```

### 2. Environment Variables

Set these in Railway Dashboard:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/uradi360
POSTGRES_USER=uradi
POSTGRES_PASSWORD=secure_random_password
POSTGRES_DB=uradi360

# Redis
REDIS_URL=redis://host:6379

# Security (generate new!)
JWT_SECRET=your_generated_jwt_secret
JWT_REFRESH_SECRET=your_generated_refresh_secret
SESSION_SECRET=your_generated_session_secret
JWT_ALGORITHM=HS256
JWT_EXPIRY_HOURS=24

# CORS
ALLOWED_ORIGINS=https://uradi360.vercel.app,https://uradi360-public.vercel.app

# AI Services
KIMI_API_KEY=your_kimi_key
KIMI_BASE_URL=https://api.moonshot.ai/v1
KIMI_MODEL=kimi-k2-turbo-preview

# Communication
TERMII_API_KEY=your_termii_key
TERMII_SENDER_ID=URADI360
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=your_twilio_number

# Payments (get from Paystack dashboard)
PAYSTACK_SECRET_KEY=sk_live_your_key
PAYSTACK_PUBLIC_KEY=pk_live_your_key

# Email
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@uradi360.com
```

### 3. Deploy Backend

```bash
# From backend directory
cd Uradi360_Build/backend

# Add to Railway project
railway link

# Deploy
railway up

# Get the deployment URL
railway status
```

## Frontend Deployment (Vercel)

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Create vercel.json

```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://uradi360-backend.up.railway.app"
  }
}
```

### 3. Environment Variables

```bash
NEXT_PUBLIC_API_URL=https://uradi360-backend.up.railway.app
```

### 4. Deploy

```bash
# From apps/command-center directory
cd Uradi360_Build/apps/command-center

# Deploy to Vercel
vercel --prod

# Or link existing project
vercel link
vercel --prod
```

## Domain Configuration

### Backend Domain
1. In Railway dashboard: Settings → Domains
2. Add custom domain: `api.uradi360.com`
3. Update DNS with provided CNAME

### Frontend Domain
1. In Vercel dashboard: Project Settings → Domains
2. Add custom domain: `uradi360.com`
3. Add redirect: `www.uradi360.com` → `uradi360.com`
4. Update DNS with provided A/CNAME records

## SSL Certificates

Both Railway and Vercel automatically provide SSL certificates via Let's Encrypt.

## Health Check Endpoints

- Backend: `GET https://api.uradi360.com/health`
- API Docs: `https://api.uradi360.com/docs`

## Post-Deployment Verification

```bash
# Test health endpoint
curl https://api.uradi360.com/health

# Test login
curl -X POST https://api.uradi360.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@uradi360.com", "password": "Admin123!"}'
```

## Monitoring

### Railway Dashboard
- URL: https://railway.app/dashboard
- Monitor: CPU, memory, database connections
- Set up alerts for high resource usage

### Vercel Dashboard
- URL: https://vercel.com/dashboard
- Monitor: Build times, deployment status
- View: Real-time analytics

### Sentry Error Tracking
```bash
# Add to environment variables
SENTRY_DSN=your_sentry_dsn
```

## Backup Strategy

### Database Backups
1. Railway provides automated daily backups
2. Manual backup before major deployments:
```bash
railway run pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

## Rollback Procedure

```bash
# Railway rollback
railway rollback

# Vercel rollback
vercel rollback
```

## Performance Optimization

### Backend
- Enable connection pooling (already configured)
- Redis caching enabled
- Gzip compression enabled

### Frontend
- Static generation for public pages
- ISR for data-heavy pages
- Image optimization via Next.js
- Bundle analysis: `npm run analyze`

## Security Checklist

- [ ] JWT secrets rotated and unique per environment
- [ ] Database credentials not in code
- [ ] HTTPS enforced on all endpoints
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all APIs
- [ ] SQL injection protection (parametrized queries)
- [ ] XSS protection in frontend
