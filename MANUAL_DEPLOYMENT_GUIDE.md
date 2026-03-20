# URADI-360 Manual Deployment Guide
## Step-by-Step Production Deployment

**Date:** March 17, 2026
**Status:** Ready for Deployment

---

## PRE-DEPLOYMENT CHECKLIST

### 1. Prerequisites

- [ ] Railway account (https://railway.app)
- [ ] Vercel account (https://vercel.com)
- [ ] Git repository pushed to GitHub/GitLab
- [ ] All API keys obtained (see below)

### 2. Required API Keys

| Service | Get From | Status |
|---------|----------|--------|
| Kimi AI | https://platform.moonshot.ai/ | ⏳ Needed |
| Termii SMS | https://termii.com/ | ⏳ Needed |
| Twilio | https://console.twilio.com/ | ⏳ Needed |
| SendGrid | https://sendgrid.com/ | ⏳ Needed |
| Paystack | https://dashboard.paystack.com/ | ⏳ Needed |
| Mapbox | https://account.mapbox.com/ | ⏳ Optional |

---

## PART 1: Backend Deployment (Railway)

### Step 1: Install Railway CLI

```bash
# Using npm
npm install -g @railway/cli

# Or using Homebrew (Mac)
brew install railway

# Verify installation
railway --version
```

### Step 2: Login to Railway

```bash
railway login
```

This will open a browser window for authentication.

### Step 3: Navigate to Backend Directory

```bash
cd Uradi360_Build/backend
```

### Step 4: Initialize Railway Project

```bash
# Create new project
railway init --name uradi360-backend

# Or link to existing project
railway link
```

### Step 5: Add PostgreSQL Database

```bash
# In Railway dashboard or CLI
railway add --database postgres

# Or create manually in dashboard:
# 1. Go to https://railway.app/dashboard
# 2. Click "New" → "Database" → "Add PostgreSQL"
# 3. Connect to your project
```

### Step 6: Add Redis Cache

```bash
# In Railway dashboard
# 1. Click "New" → "Database" → "Add Redis"
# 2. Connect to your project
```

### Step 7: Configure Environment Variables

```bash
# Open Railway dashboard variables
railway variables

# Or set individually:
railway variables set JWT_SECRET="your_generated_secret"
railway variables set KIMI_API_KEY="your_kimi_key"
railway variables set TERMII_API_KEY="your_termii_key"
railway variables set TWILIO_ACCOUNT_SID="your_twilio_sid"
railway variables set TWILIO_AUTH_TOKEN="your_twilio_token"
railway variables set SENDGRID_API_KEY="your_sendgrid_key"
railway variables set PAYSTACK_SECRET_KEY="your_paystack_key"
```

**Required Environment Variables:**

```bash
# Security (Generate new!)
JWT_SECRET=your_64_char_hex_secret
JWT_REFRESH_SECRET=your_64_char_hex_secret
SESSION_SECRET=your_64_char_hex_secret

# Database (Auto-populated by Railway if using their Postgres)
DATABASE_URL=${{Postgres.DATABASE_URL}}
DATABASE_URL_LOCAL=${{Postgres.DATABASE_URL}}

# Redis (Auto-populated by Railway if using their Redis)
REDIS_URL=${{Redis.REDIS_URL}}
REDIS_URL_LOCAL=${{Redis.REDIS_URL}}

# AI Services
KIMI_API_KEY=your_kimi_key
KIMI_BASE_URL=https://api.moonshot.ai/v1
KIMI_MODEL=kimi-k2-turbo-preview

# Communication
TERMII_API_KEY=your_termii_key
TERMII_SENDER_ID=URADI360
TERMII_BASE_URL=https://api.termii.com/api/
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
TWILIO_WHATSAPP_NUMBER=your_twilio_number

# Email
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@uradi360.com
SENDGRID_FROM_NAME=URADI-360

# Payments
PAYSTACK_SECRET_KEY=your_paystack_secret
PAYSTACK_PUBLIC_KEY=your_paystack_public
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret
PAYSTACK_BASE_URL=https://api.paystack.co

# Application
NODE_ENV=production
BACKEND_PORT=8000
FRONTEND_URL=https://uradi360.vercel.app
CORS_ORIGIN=https://uradi360.vercel.app
CORS_CREDENTIALS=true
LOG_LEVEL=info
ENABLE_METRICS=true
```

### Step 8: Deploy Backend

```bash
# Deploy to Railway
railway up

# Check deployment status
railway status

# View logs
railway logs
```

### Step 9: Run Database Migrations

```bash
# Run migrations
railway run alembic upgrade head

# Seed production data (optional)
railway run python seed_production_data.py
```

### Step 10: Verify Backend Deployment

```bash
# Get your backend URL
BACKEND_URL=$(railway status --json | jq -r '.domain')

# Test health endpoint
curl https://$BACKEND_URL/health

# Expected response:
# {"status": "healthy"}

# Test API docs
curl https://$BACKEND_URL/docs
```

---

## PART 2: Frontend Deployment (Vercel)

### Step 1: Install Vercel CLI

```bash
# Using npm
npm install -g vercel

# Verify installation
vercel --version
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Navigate to Frontend Directory

```bash
cd Uradi360_Build/apps/command-center
```

### Step 4: Configure Environment Variables

Create `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=https://uradi360-backend.up.railway.app
```

### Step 5: Deploy to Vercel

```bash
# Deploy to production
vercel --prod

# Or for first-time setup
vercel

# Follow prompts:
# - Set up and deploy? [Y/n] Y
# - Link to existing project? [y/N] N
# - What's your project name? uradi360-command-center
```

### Step 6: Configure Environment Variables in Vercel Dashboard

```bash
# Open Vercel dashboard
vercel env add NEXT_PUBLIC_API_URL

# Enter value: https://uradi360-backend.up.railway.app
```

Or via dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://uradi360-backend.up.railway.app`

### Step 7: Redeploy with Environment Variables

```bash
vercel --prod
```

### Step 8: Verify Frontend Deployment

```bash
# Get your frontend URL
FRONTEND_URL=$(vercel ls --json | jq -r '.[0].url')

# Open in browser
open https://$FRONTEND_URL
```

---

## PART 3: Post-Deployment Configuration

### 1. Custom Domain Setup (Optional)

#### Backend (Railway)

```bash
# In Railway dashboard:
# 1. Go to your project
# 2. Click on your service
# 3. Go to Settings → Domains
# 4. Click "Custom Domain"
# 5. Enter: api.uradi360.com
# 6. Follow DNS instructions
```

#### Frontend (Vercel)

```bash
# Using CLI
vercel domains add uradi360.com

# Or in dashboard:
# 1. Go to project settings
# 2. Click "Domains"
# 3. Add: uradi360.com
# 4. Configure DNS as instructed
```

### 2. SSL Certificates

Both Railway and Vercel automatically provision SSL certificates via Let's Encrypt.

### 3. Monitoring Setup

#### Sentry Error Tracking

```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Configure in backend
# Add to requirements.txt: sentry-sdk[fastapi]
# Add to main.py:
import sentry_sdk
sentry_sdk.init(
    dsn="your_sentry_dsn",
    traces_sample_rate=1.0,
)
```

#### Vercel Analytics

Already enabled by default in Vercel dashboard.

### 4. Backup Configuration

#### Database Backups (Railway)

```bash
# Railway provides automatic daily backups
# Manual backup:
railway run pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

---

## PART 4: Testing & Verification

### 1. Health Checks

```bash
# Backend health
curl https://your-backend-url/health

# API documentation
curl https://your-backend-url/docs

# Frontend
curl https://your-frontend-url
```

### 2. Authentication Test

```bash
# Test login
curl -X POST https://your-backend-url/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@uradi360.com",
    "password": "Admin123!"
  }'

# Expected: {"access_token": "...", "token_type": "bearer"}
```

### 3. API Endpoints Test

```bash
# Get voters (requires auth token)
curl https://your-backend-url/api/voters \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get incidents
curl https://your-backend-url/api/incidents \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Frontend Test

1. Open https://your-frontend-url
2. Test login flow
3. Navigate to voters page
4. Test incident reporting
5. Verify real-time updates (WebSocket)

---

## PART 5: Troubleshooting

### Common Issues

#### 1. CORS Errors

**Symptom:** Frontend can't connect to backend

**Fix:**
```python
# In backend/main.py, update CORS origins
origins = [
    "https://uradi360.vercel.app",
    "https://uradi360.com",
    "https://www.uradi360.com"
]
```

#### 2. Database Connection Failed

**Symptom:** 500 errors on API calls

**Fix:**
```bash
# Check Railway database status
railway status

# Check logs
railway logs

# Verify DATABASE_URL is set
railway variables
```

#### 3. Build Failures

**Symptom:** Vercel build fails

**Fix:**
```bash
# Check build logs
vercel --prod

# Common fixes:
# 1. Ensure NEXT_PUBLIC_API_URL is set
# 2. Check for TypeScript errors: npm run build
# 3. Verify all dependencies installed: npm ci
```

#### 4. WebSocket Connection Failed

**Symptom:** Real-time updates not working

**Fix:**
```bash
# WebSocket URLs must use wss:// in production
# Update frontend WebSocket URL:
const WS_URL = 'wss://your-backend-url'
```

---

## PART 6: Rollback Procedure

### If Deployment Fails:

```bash
# Railway rollback
railway rollback

# Vercel rollback
vercel rollback

# Or redeploy previous version
vercel --prod
```

---

## DEPLOYMENT VERIFICATION CHECKLIST

- [ ] Railway project created
- [ ] PostgreSQL database added
- [ ] Redis cache added
- [ ] Environment variables configured
- [ ] Backend deployed successfully
- [ ] Database migrations run
- [ ] Vercel project created
- [ ] Frontend deployed successfully
- [ ] Environment variables set in Vercel
- [ ] Custom domains configured (optional)
- [ ] SSL certificates active
- [ ] Authentication working
- [ ] API endpoints responding
- [ ] Frontend loading correctly
- [ ] WebSocket connections working
- [ ] Error monitoring active

---

## SUPPORT CONTACTS

| Service | Support URL |
|---------|-------------|
| Railway | https://railway.app/help |
| Vercel | https://vercel.com/help |
| Kimi AI | https://platform.moonshot.ai/ |
| Twilio | https://support.twilio.com/ |
| Paystack | https://paystack.com/support |

---

## NEXT STEPS AFTER DEPLOYMENT

1. **Staff Training** - Train campaign staff on platform usage
2. **Data Import** - Import voter data from existing sources
3. **Field Testing** - Test field app on actual devices
4. **Security Audit** - Run penetration testing
5. **Load Testing** - Simulate election day traffic
6. **Documentation** - Create user guides and runbooks

---

**Status:** Ready for deployment
**Estimated Time:** 2-3 hours for complete setup
**Difficulty:** Intermediate

---

*Guide generated: March 17, 2026*
*Version: 1.0*
