# Environment Variables Reference

**Version:** 1.0.0
**Date:** 2026-03-21
**Status:** ✅ COMPLETE

Complete reference for all environment variables used in URADI-360.

---

## Quick Navigation

| Section | Variables |
|---------|-----------|
| [🔒 Security](#security) | JWT, sessions, bcrypt |
| [🗄️ Database](#database) | PostgreSQL connection |
| [⚡ Cache](#cache) | Redis configuration |
| [☁️ Storage](#storage) | MinIO/S3 object storage |
| [🤖 AI Services](#ai-services) | Kimi API |
| [📱 Communication](#communication) | SMS, WhatsApp, Email |
| [💳 Payments](#payments) | Paystack integration |
| [🔑 Authentication](#authentication) | OAuth providers |
| [🌐 Application](#application) | URLs, ports, features |
| [📊 Monitoring](#monitoring) | Logging, metrics, Sentry |
| [🗺️ Maps](#maps) | Mapbox token |

---

## Security

### JWT Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | ✅ | - | **🔒 CRITICAL** Secret key for signing JWT tokens. Generate with: `openssl rand -hex 64` |
| `JWT_REFRESH_SECRET` | ✅ | - | **🔒 CRITICAL** Separate secret for refresh tokens. Use different value than JWT_SECRET |
| `JWT_ALGORITHM` | Optional | `HS256` | Algorithm for JWT signing. Options: HS256, HS384, HS512 |
| `JWT_EXPIRY_HOURS` | Optional | `24` | Access token lifetime in hours |
| `JWT_REFRESH_EXPIRY_DAYS` | Optional | `7` | Refresh token lifetime in days |
| `BCRYPT_ROUNDS` | Optional | `12` | Password hashing rounds. Higher = more secure but slower |

**Example:**
```bash
JWT_SECRET=6f8d9c2b5e1a4f7d8e3c9b2a5f7d1e4c6b8a3f9d2c5e7b1a4f6d8c3e9b2a5f7d1e4c
JWT_REFRESH_SECRET=9c8b7a6f5e4d3c2b1a9f8e7d6c5b4a3f2e1d9c8b7a6f5e4d3c2b1a9f8e7d6c5b
```

**Security Notes:**
- 🔒 Never commit real values to git
- 🔒 Rotate immediately after first deployment
- 🔒 Use different secrets for production/staging
- 🔒 Minimum 64 characters (hex)

### Session Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SESSION_SECRET` | ✅ | - | **🔒 CRITICAL** Secret for session cookies |

---

## Database

### Primary Connection

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | - | Full PostgreSQL connection string. Format: `postgresql://user:pass@host:port/db` |
| `DATABASE_URL_LOCAL` | Optional | - | Local development database URL |

**Format:**
```
postgresql://username:password@hostname:port/database_name?sslmode=require
```

**Example:**
```bash
DATABASE_URL=postgresql://uradi:SecurePass123@prod-db.railway.app:5432/uradi360?sslmode=require
```

### Connection Pool

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_POOL_SIZE` | Optional | `20` | Maximum database connections in pool |
| `DB_IDLE_TIMEOUT` | Optional | `30000` | Close idle connections after (ms) |
| `DB_CONNECTION_TIMEOUT` | Optional | `5000` | Connection timeout (ms) |

**Tuning Guidelines:**
- Pool size: (2 × CPU cores) + effective_spindle_count
- Start with 20, increase if connection wait times observed
- Monitor `waiting_connections` metric

### Component Variables (Alternative)

If not using full `DATABASE_URL`, specify components:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `POSTGRES_USER` | If no URL | - | Database username |
| `POSTGRES_PASSWORD` | If no URL | - | **🔒 CRITICAL** Database password |
| `POSTGRES_DB` | If no URL | - | Database name |
| `DB_HOST` | If no URL | - | Database hostname |
| `DB_PORT` | If no URL | `5432` | Database port |

---

## Cache

### Redis Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_URL` | ✅ | - | Redis connection string. Format: `redis://host:port/db` |
| `REDIS_URL_LOCAL` | Optional | - | Local Redis for development |
| `REDIS_HOST` | If no URL | `localhost` | Redis hostname |
| `REDIS_PORT` | If no URL | `6379` | Redis port |
| `REDIS_PASSWORD` | Optional | - | **🔒 CRITICAL** Redis password (if auth enabled) |

**Example:**
```bash
REDIS_URL=redis://redis.railway.app:6379/0
REDIS_PASSWORD=redis_secure_password_123
```

**Used For:**
- Session storage
- Rate limiting counters
- Cache layer
- Background job results
- Real-time features (pub/sub)

---

## Storage

### MinIO / S3 Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MINIO_ENDPOINT` | ✅ | - | MinIO server endpoint (or S3 endpoint) |
| `MINIO_ACCESS_KEY` | ✅ | - | **🔒 CRITICAL** Access key for object storage |
| `MINIO_SECRET_KEY` | ✅ | - | **🔒 CRITICAL** Secret key for object storage |
| `MINIO_CONSOLE_PORT` | Optional | `9001` | MinIO console port (dev only) |

**Example:**
```bash
# MinIO (self-hosted)
MINIO_ENDPOINT=storage.uradi360.com:9000
MINIO_ACCESS_KEY=URADI360ACCESSKEY
MINIO_SECRET_KEY=your-secret-key-here

# AWS S3
MINIO_ENDPOINT=s3.amazonaws.com
MINIO_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
MINIO_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

**Used For:**
- File uploads (documents, images)
- Export files
- Backup storage
- Static assets

---

## AI Services

### Kimi Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `KIMI_API_KEY` | Optional | - | **🔒 CRITICAL** API key for Kimi LLM |
| `KIMI_BASE_URL` | Optional | `https://api.moonshot.ai/v1` | Kimi API endpoint |
| `KIMI_MODEL` | Optional | `kimi-k2-turbo-preview` | Model to use |

**Example:**
```bash
KIMI_API_KEY=sk-abc123def456ghi789jkl012mno345pqr678stu9vwx0yz
KIMI_BASE_URL=https://api.moonshot.ai/v1
KIMI_MODEL=kimi-k2-turbo-preview
```

**Note:** If not provided, AI features will use fallback logic or be disabled.

---

## Communication

### SMS (Termii)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TERMII_API_KEY` | Optional | - | **🔒 CRITICAL** Termii API key |
| `TERMII_SENDER_ID` | Optional | `URADI360` | SMS sender ID |
| `TERMII_BASE_URL` | Optional | `https://api.termii.com/api/` | Termii API base URL |

### WhatsApp (Twilio)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TWILIO_ACCOUNT_SID` | Optional | - | **🔒 CRITICAL** Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Optional | - | **🔒 CRITICAL** Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Optional | - | Twilio phone number for SMS |
| `TWILIO_WHATSAPP_NUMBER` | Optional | - | Twilio WhatsApp number |

**Get from:** https://console.twilio.com/

### Email (SendGrid)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SENDGRID_API_KEY` | Optional | - | **🔒 CRITICAL** SendGrid API key |
| `SENDGRID_FROM_EMAIL` | Optional | `noreply@uradi360.com` | Default sender email |
| `SENDGRID_FROM_NAME` | Optional | `URADI-360` | Default sender name |

### Africa's Talking (Alternative SMS)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AFRICASTALKING_API_KEY` | Optional | - | **🔒 CRITICAL** Africa's Talking API key |
| `AFRICASTALKING_USERNAME` | Optional | - | Africa's Talking username |

---

## Payments

### Paystack Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PAYSTACK_SECRET_KEY` | Optional | - | **🔒 CRITICAL** Paystack secret key (sk_live_*) |
| `PAYSTACK_PUBLIC_KEY` | Optional | - | Paystack public key (pk_live_*) |
| `PAYSTACK_WEBHOOK_SECRET` | Optional | - | **🔒 CRITICAL** Webhook signature secret |
| `PAYSTACK_BASE_URL` | Optional | `https://api.paystack.co` | Paystack API base URL |

**Example:**
```bash
PAYSTACK_SECRET_KEY=sk_live_abc123def456ghi789jkl
PAYSTACK_PUBLIC_KEY=pk_live_mno345pqr678stu9vwx0yz
PAYSTACK_WEBHOOK_SECRET=whsec_1234567890abcdef
```

**Important:**
- Use `sk_live_*` for production
- Use `sk_test_*` for development
- Never expose secret key in frontend
- Webhook secret validates incoming webhooks

---

## Authentication

### OAuth Providers

#### Google OAuth

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_CLIENT_ID` | Optional | - | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | - | **🔒 CRITICAL** Google OAuth Client Secret |

**Get from:** https://console.cloud.google.com/

### Firebase

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `FIREBASE_PROJECT_ID` | Optional | - | Firebase project identifier |
| `FIREBASE_CLIENT_EMAIL` | Optional | - | Service account email |
| `FIREBASE_SERVICE_ACCOUNT` | Optional | - | **🔒 CRITICAL** Service account JSON (base64 encoded) |

---

## Application

### URLs and Ports

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Optional | `development` | Environment: `development`, `staging`, `production` |
| `FRONTEND_PORT` | Optional | `4321` | Frontend development server port |
| `BACKEND_PORT` | Optional | `8000` | Backend API port |
| `FRONTEND_URL` | Optional | - | Production frontend URL |
| `BACKEND_URL` | Optional | - | Production backend URL |

**Example:**
```bash
NODE_ENV=production
FRONTEND_URL=https://uradi360.vercel.app
BACKEND_URL=https://uradi360-backend.up.railway.app
```

### Feature Flags

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENABLE_USSD` | Optional | `true` | Enable USSD integration |
| `ENABLE_WHATSAPP` | Optional | `true` | Enable WhatsApp messaging |
| `ENABLE_SMS` | Optional | `true` | Enable SMS messaging |
| `ENABLE_EMAIL` | Optional | `true` | Enable email notifications |
| `ENABLE_PAYMENTS` | Optional | `true` | Enable payment processing |

**Usage:**
- Set to `false` to disable feature
- Useful for gradual rollouts
- Can be overridden per-tenant in future

### Rate Limiting

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MAX_REQUESTS_PER_MINUTE` | Optional | `1000` | Maximum API requests per minute per user |
| `RATE_LIMIT_WINDOW_MS` | Optional | `60000` | Rate limit window in milliseconds |

### CORS Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CORS_ORIGIN` | Optional | - | Comma-separated allowed origins |
| `CORS_CREDENTIALS` | Optional | `true` | Allow cookies with CORS |

**Example:**
```bash
CORS_ORIGIN=https://uradi360.vercel.app,https://uradi360.com,https://admin.uradi360.com
CORS_CREDENTIALS=true
```

### Super Admin

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SUPERADMIN_EMAIL` | Optional | `admin@uradi360.com` | Initial super admin email |

---

## Monitoring

### Logging

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LOG_LEVEL` | Optional | `info` | Log level: `debug`, `info`, `warn`, `error` |
| `LOG_FORMAT` | Optional | `json` | Log format: `json`, `pretty` |

**Levels:**
- `debug`: Detailed debugging info
- `info`: General operational messages
- `warn`: Warning conditions
- `error`: Error conditions

### Metrics

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENABLE_METRICS` | Optional | `true` | Enable Prometheus metrics endpoint |
| `METRICS_PORT` | Optional | `9090` | Port for metrics endpoint |
| `ENABLE_TRACING` | Optional | `false` | Enable distributed tracing |

### Error Tracking

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SENTRY_DSN` | Optional | - | **🔒 SENSITIVE** Sentry error tracking DSN |

**Get from:** https://sentry.io/

---

## Maps

### Mapbox

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MAPBOX_TOKEN` | Optional | - | **🔒 SENSITIVE** Mapbox access token |

**Get from:** https://account.mapbox.com/

**Used For:**
- Polling unit maps
- Field agent navigation
- Territory visualization

---

## Environment Templates

### Development

```bash
# .env.development
NODE_ENV=development

# Database (Local)
DATABASE_URL=postgresql://uradi:password@localhost:5432/uradi360

# Redis (Local)
REDIS_URL=redis://localhost:6379/0

# Storage (Local MinIO)
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

# Security (Dev only - NOT for production)
JWT_SECRET=dev-secret-not-for-production
JWT_REFRESH_SECRET=dev-refresh-secret-not-for-production

# Features
ENABLE_USSD=false
ENABLE_WHATSAPP=false
ENABLE_SMS=false
ENABLE_EMAIL=true
ENABLE_PAYMENTS=false

# Logging
LOG_LEVEL=debug
LOG_FORMAT=pretty
```

### Staging

```bash
# .env.staging
NODE_ENV=staging

# Database (Staging)
DATABASE_URL=postgresql://uradi:staging_pass@staging-db.railway.app:5432/uradi360

# Redis (Staging)
REDIS_URL=redis://staging-redis.railway.app:6379/0

# Security (Generate new for staging)
JWT_SECRET=GENERATE_WITH_OPENSSL
JWT_REFRESH_SECRET=GENERATE_WITH_OPENSSL

# Features (Test all)
ENABLE_USSD=true
ENABLE_WHATSAPP=true
ENABLE_SMS=true
ENABLE_EMAIL=true
ENABLE_PAYMENTS=true

# Third-party (Test credentials)
PAYSTACK_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=SG.test...
```

### Production

```bash
# .env.production
NODE_ENV=production

# Database (Production)
DATABASE_URL=postgresql://uradi:strong_password@prod-db.railway.app:5432/uradi360
DB_POOL_SIZE=50

# Redis (Production)
REDIS_URL=redis://prod-redis.railway.app:6379/0

# Security (CRITICAL - Generate strong secrets)
JWT_SECRET=openssl_rand_hex_64_chars_here
JWT_REFRESH_SECRET=different_openssl_rand_hex_64_here
BCRYPT_ROUNDS=14

# All features enabled
ENABLE_USSD=true
ENABLE_WHATSAPP=true
ENABLE_SMS=true
ENABLE_EMAIL=true
ENABLE_PAYMENTS=true

# Logging
LOG_LEVEL=warn
LOG_FORMAT=json

# Monitoring
ENABLE_METRICS=true
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

---

## Security Checklist

Before deploying to production:

- [ ] All 🔒 CRITICAL variables set with strong values
- [ ] JWT secrets are 64+ characters, random
- [ ] Database password is strong (not guessable)
- [ ] No default passwords (change MinIO defaults)
- [ ] All API keys are production (not test/dev)
- [ ] Webhook secrets configured
- [ ] CORS origins limited to production domains
- [ ] Log level set to `warn` or `error` (not `debug`)
- [ ] `.env` file added to `.gitignore`
- [ ] `.env.example` committed (with placeholder values)

---

## Troubleshooting

### Database Connection Failed

**Error:** `could not connect to server: Connection refused`

**Solutions:**
1. Check `DATABASE_URL` format
2. Verify database is running: `pg_isready`
3. Check firewall rules
4. Verify SSL mode: `?sslmode=require` vs `?sslmode=disable`

### Redis Connection Failed

**Error:** `Connection refused`

**Solutions:**
1. Check Redis is running: `redis-cli ping`
2. Verify `REDIS_URL` format
3. Check password if Redis auth enabled

### JWT Errors

**Error:** `Invalid token` or `Signature verification failed`

**Solutions:**
1. Verify `JWT_SECRET` matches between servers
2. Check token hasn't expired
3. Ensure `JWT_ALGORITHM` matches

### CORS Errors

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solutions:**
1. Add frontend URL to `CORS_ORIGIN`
2. Include `https://` protocol
3. Set `CORS_CREDENTIALS=true` if using cookies

---

## Rotating Secrets

### Regular Rotation Schedule

| Secret Type | Rotation Frequency | Command |
|-------------|-------------------|---------|
| JWT Secrets | Annually | `openssl rand -hex 64` |
| API Keys | Every 6 months | Regenerate in provider console |
| Database Password | Annually | Update in provider, update env |
| Webhook Secrets | Every 6 months | Regenerate and update |

### Rotation Procedure

1. Generate new secret
2. Update in environment (staging first)
3. Deploy to staging
4. Test authentication flows
5. Update production environment
6. Deploy to production
7. Old tokens will expire naturally (JWT expiry)
8. Revoke old API keys after 24 hours

---

## References

- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [Redis URI Scheme](https://www.iana.org/assignments/uri-schemes/prov/redis)

---

**Maintained by:** DevOps Team
**Last Updated:** 2026-03-21
**Questions:** devops@uradi360.com
