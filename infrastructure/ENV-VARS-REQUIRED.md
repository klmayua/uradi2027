# URADI-360 Environment Variables - Updated Requirements

**Date:** March 21, 2026
**Changes:** Added CloudFlare, Ollama (local AI), Paystack configuration

---

## 🔴 CRITICAL - Required for Basic Operation

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| ☐ `DATABASE_URL` | PostgreSQL connection string | Supabase Dashboard > Settings > Database |
| ☐ `JWT_SECRET` | 64+ character random string for JWT signing | Generate: `openssl rand -base64 64` |
| ☐ `APP_SECRET_KEY` | 32+ character secret for Flask/FastAPI | Generate: `openssl rand -base64 32` |
| ☐ `GDPR_DELETE_CONFIRMATION_TOKEN` | Secure random token for data deletion | Generate: `openssl rand -hex 32` |
| ☐ `REDIS_PASSWORD` | Password for Redis authentication | Generate: `openssl rand -base64 32` |

---

## 🟡 REQUIRED - Authentication & Database

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| ☐ `SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard > Settings > API |
| ☐ `SUPABASE_KEY` | Supabase anon public key | Supabase Dashboard > Settings > API |
| ☐ `SUPABASE_SERVICE_KEY` | Supabase service_role secret key | Supabase Dashboard > Settings > API |

---

## 🟢 CLOUDFLARE - CDN & Security (NEW)

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| ☐ `CLOUDFLARE_API_TOKEN` | API token for DNS/WAF management | CloudFlare Dashboard > My Profile > API Tokens |
| ☐ `CLOUDFLARE_ZONE_ID` | Zone ID for your domain | CloudFlare Dashboard > Overview (right sidebar) |
| ☐ `CLOUDFLARE_ACCOUNT_ID` | Your CloudFlare account ID | CloudFlare Dashboard > sidebar |
| ☐ `CLOUDFLARE_EMAIL` | Account email address | Your CloudFlare login email |
| ☐ `CLOUDFLARE_API_KEY` | Global API key (legacy) | CloudFlare Dashboard > My Profile > API Tokens > Global API Key |

**Note:** Use API Token (preferred) or Global API Key, not both.

---

## 🔵 OLLAMA - Local AI Models (NEW)

### Ollama Server Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| ☐ `OLLAMA_HOST` | Ollama server URL | `http://ollama:11434` |
| ☐ `OLLAMA_TIMEOUT` | Request timeout in seconds | `300` |

### Recommended Models Configuration

Based on your use cases, here are the **recommended Ollama models**:

#### 1. General OSINT & Narrative Analysis
**Model:** `mistral` or `llama3`
- **Why:** Excellent at understanding context, relationships, and summarizing complex information
- **Size:** ~4GB
- **Speed:** Fast on GPU, moderate on CPU
- **Use for:**
  - Narrative clustering
  - Trend analysis
  - Summarizing news/articles
  - Entity extraction

```bash
# Pull command
ollama pull mistral
```

#### 2. Sentiment Analysis
**Model:** `phi4` or dedicated sentiment model
- **Why:** Good at classification tasks, smaller and faster
- **Size:** ~2GB
- **Speed:** Very fast
- **Use for:**
  - Classifying mention sentiment (positive/negative/neutral)
  - Emotion detection
  - Stance classification

```bash
# Pull command
ollama pull phi4
```

**Alternative:** Use rule-based sentiment analysis with VADER or TextBlob (no GPU needed) and only use LLM for complex cases.

#### 3. Text Embeddings (Vector Search)
**Model:** `mxbai-embed-large` or `nomic-embed-text`
- **Why:** Specialized for creating embeddings for semantic search
- **Size:** ~1GB
- **Use for:**
  - Similarity search
  - Clustering mentions
  - Duplicate detection

```bash
# Pull command
ollama pull nomic-embed-text
```

#### 4. Daily Brief Generation
**Model:** `mistral` or `llama3`
- **Why:** Good at structured output and report generation
- **Use for:**
  - Generating executive summaries
  - Creating actionable insights
  - Formatting reports

### Complete Ollama Model Setup Commands

Run these on your VPS after Ollama is installed:

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull recommended models
ollama pull mistral          # OSINT/Narrative/Daily Briefs
ollama pull phi4             # Sentiment/Classification
ollama pull nomic-embed-text # Embeddings/Semantic Search

# Verify installation
ollama list
```

### Environment Variables for Models

| Variable | Description | Recommended Value |
|----------|-------------|-------------------|
| ☐ `OLLAMA_MODEL_NARRATIVE` | Model for OSINT/Narrative | `mistral` |
| ☐ `OLLAMA_MODEL_SENTIMENT` | Model for Sentiment Analysis | `phi4` |
| ☐ `OLLAMA_MODEL_EMBEDDINGS` | Model for Embeddings | `nomic-embed-text` |
| ☐ `OLLAMA_MODEL_GENERAL` | Fallback general model | `mistral` |

---

## 💰 PAYSTACK - Payments (REQUIRED - Already Integrated)

Yes, Paystack is already integrated! Found in:
- `backend/api/payments.py` - API endpoints
- `backend/services/payment_service.py` - Service layer

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| ☐ `PAYSTACK_SECRET_KEY` | Paystack secret key (test/live) | Paystack Dashboard > Settings > API Keys |
| ☐ `PAYSTACK_PUBLIC_KEY` | Paystack public key | Paystack Dashboard > Settings > API Keys |
| ☐ `PAYSTACK_WEBHOOK_SECRET` | Webhook signature secret | Paystack Dashboard > Settings > Webhooks |
| ☐ `PAYSTACK_BASE_URL` | API base URL | `https://api.paystack.co` (default) |

**Note:** Paystack is used for:
- Campaign donations
- Subscription payments
- Payment verification
- Webhook handling

---

## 📧 EMAIL (SendGrid Recommended)

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| ☐ `SMTP_HOST` | SMTP server | `smtp.sendgrid.net` |
| ☐ `SMTP_PORT` | SMTP port | `587` |
| ☐ `SMTP_USER` | SMTP username | `apikey` |
| ☐ `SMTP_PASSWORD` | SendGrid API key | SendGrid Dashboard > Settings > API Keys |
| ☐ `SMTP_FROM` | From email | `noreply@uradi360.com` |
| ☐ `SMTP_FROM_NAME` | From name | `URADI-360 Platform` |

---

## 📱 SMS (Twilio)

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| ☐ `TWILIO_ACCOUNT_SID` | Twilio account SID | Twilio Console > Dashboard |
| ☐ `TWILIO_AUTH_TOKEN` | Twilio auth token | Twilio Console > Dashboard |
| ☐ `TWILIO_PHONE_NUMBER` | Twilio phone number | Twilio Console > Phone Numbers |
| ☐ `SMS_ENABLED` | Enable/disable SMS | `true` or `false` |

---

## 📊 MONITORING

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| ☐ `SENTRY_DSN` | Sentry DSN for error tracking | Sentry.io > Project Settings > DSN |
| ☐ `SENTRY_ENVIRONMENT` | Environment label | `production` |
| ☐ `GRAFANA_PASSWORD` | Grafana admin password | Create your own |

---

## 🌐 EXTERNAL APIs (Optional)

### Social Media Scrapers

| Variable | Description | Required? |
|----------|-------------|-----------|
| ☐ `TWITTER_BEARER_TOKEN` | Twitter API v2 bearer token | Optional |
| ☐ `FACEBOOK_ACCESS_TOKEN` | Facebook Graph API token | Optional |
| ☐ `INSTAGRAM_ACCESS_TOKEN` | Instagram API token | Optional |

**Note:** With Ollama local models, you can reduce dependency on external AI services like OpenAI.

---

## ⚙️ OPTIONAL - Application Settings

These have sensible defaults but you may customize:

| Variable | Default | Description |
|----------|---------|-------------|
| ☐ `APP_ENV` | `production` | Environment name |
| ☐ `APP_DEBUG` | `false` | Debug mode (never true in production) |
| ☐ `APP_URL` | `https://api.uradi360.com` | Backend API URL |
| ☐ `FRONTEND_URL` | `https://app.uradi360.com` | Command Center URL |
| ☐ `CITIZEN_PORTAL_URL` | `https://campaign.uradi360.com` | Citizen Portal URL |
| ☐ `CORS_ORIGINS` | URLs above | Allowed frontend origins |
| ☐ `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | JWT expiry time |
| ☐ `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token expiry |
| ☐ `RATE_LIMIT_REQUESTS_PER_MINUTE` | `100` | API rate limit |
| ☐ `CELERY_WORKER_CONCURRENCY` | `4` | Background workers |
| ☐ `ELECTION_DATE` | `2027-03-06` | Election date |
| ☐ `ELECTION_STATE` | `Jigawa` | State |
| ☐ `ENABLE_OSINT` | `true` | Enable OSINT features |
| ☐ `ENABLE_DAILY_BRIEFS` | `true` | Enable AI briefs |
| ☐ `BACKUP_RETENTION_DAYS` | `30` | Backup retention |

---

## 📝 Summary: Minimum Required for Launch

You **must** provide at least these 12 variables:

### Critical (5)
1. `DATABASE_URL`
2. `JWT_SECRET`
3. `APP_SECRET_KEY`
4. `GDPR_DELETE_CONFIRMATION_TOKEN`
5. `REDIS_PASSWORD`

### Supabase (3)
6. `SUPABASE_URL`
7. `SUPABASE_KEY`
8. `SUPABASE_SERVICE_KEY`

### CloudFlare (1)
9. `CLOUDFLARE_API_TOKEN` (or `CLOUDFLARE_API_KEY` + `CLOUDFLARE_EMAIL`)

### Paystack (2)
10. `PAYSTACK_SECRET_KEY`
11. `PAYSTACK_PUBLIC_KEY`

### Ollama (1 - uses defaults if not set)
12. `OLLAMA_HOST` (defaults to `http://ollama:11434`)

---

## 🔐 Security Recommendations

### Generate Strong Secrets

Run this on your VPS:

```bash
# 64-char JWT secret
openssl rand -base64 64

# 32-char App secret
openssl rand -base64 32

# 32-char GDPR token
openssl rand -hex 32

# 32-char Redis password
openssl rand -base64 32

# Paystack webhook secret
openssl rand -hex 32
```

### Store Securely

1. **Never commit `.env` to git** (already in `.gitignore`)
2. **Use CloudFlare Secrets** for sensitive values
3. **Rotate keys quarterly**
4. **Use different keys for test/production**

---

## ✅ Which category will you provide first?

Please provide values in this order:

1. **🔴 Critical** - Required for basic operation
2. **🟡 Supabase** - Database configuration
3. **💰 Paystack** - Payment processing
4. **🟢 CloudFlare** - CDN & security
5. **🔵 Ollama** - AI models (I can set defaults if you skip)

**Reply with the category and the values**, and I'll update the `.env.production` file.
