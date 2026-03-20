# URADI-360 COMPLETE THIRD-PARTY SERVICES INVENTORY

**Last Updated:** March 2026  
**Status:** ✅ LIVE KEYS AVAILABLE

---

## 🔑 CONFIRMED LIVE SERVICES (With Active API Keys)

### 1. ✅ KIMI AI (Moonshot AI) - OLLAMA CLOUD
**Provider:** Moonshot AI (via Ollama Cloud)  
**Purpose:** AI sentiment analysis, scenario simulation, targeting recommendations  
**Status:** ✅ LIVE - Keys Available

**Configuration:**
```env
KIMI_API_KEY=YOUR_KIMI_API_KEY_HERE
KIMI_BASE_URL=https://api.moonshot.ai/v1
KIMI_MODEL=kimi-k2-turbo-preview
```

**Available Models:**
- `kimi-k2-turbo-preview` (recommended)
- `kimi-k2-0711`

**Usage:**
- Sentiment analysis (-100 to +100 scoring)
- Category classification
- Issue extraction
- Scenario simulation
- Message generation

---

### 2. ✅ TERMII SMS (Nigeria)
**Provider:** Termii  
**Purpose:** SMS broadcasts, alerts, voter outreach  
**Status:** ✅ LIVE - Keys Available  
**Region:** Nigeria-focused

**Configuration:**
```env
TERMII_API_KEY=YOUR_TERMII_API_KEY_HERE
TERMII_SENDER_ID=URADIPX
TERMII_BASE_URL=https://api.termii.com/api/
```

**Capabilities:**
- Send SMS to Nigerian numbers
- Delivery tracking
- Template messaging
- Bulk broadcasts

**Note:** Replace `URADIPX` with `URADI360` for production

---

### 3. ✅ TWILIO (WhatsApp)
**Provider:** Twilio  
**Purpose:** WhatsApp Business API for voter messaging  
**Status:** ✅ LIVE - Keys Available

**Configuration:**
```env
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID_HERE
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN_HERE
TWILIO_PHONE_NUMBER=YOUR_TWILIO_PHONE_NUMBER
TWILIO_WHATSAPP_NUMBER=YOUR_TWILIO_WHATSAPP_NUMBER
```

**Capabilities:**
- Send WhatsApp messages
- Receive inbound messages
- Media sharing (photos)
- Webhook integration

**Note:** This is a US number. For Nigeria, consider getting a local Twilio number or use 360dialog.

---

### 4. ✅ SENDGRID (Email)
**Provider:** Twilio SendGrid  
**Purpose:** Transactional emails, reports, notifications  
**Status:** ✅ AVAILABLE (from other projects)

**Configuration:**
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@uradi360.com
SENDGRID_FROM_NAME=URADI-360 Platform
```

**Capabilities:**
- Transactional emails
- Weekly reports
- Alert notifications
- Password reset emails

---

### 5. ✅ PAYSTACK (Payments)
**Provider:** Paystack  
**Purpose:** Payment processing, donations, subscriptions  
**Status:** ✅ AVAILABLE (from UradiPro project)

**Configuration:**
```env
PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_paystack_public_key
PAYSTACK_WEBHOOK_SECRET=whsec_your_webhook_secret
PAYSTACK_BASE_URL=https://api.paystack.co
```

**Capabilities:**
- Payment processing
- Subscription management
- Donation collection
- Webhook handling

---

### 6. ✅ GOOGLE AUTH (OAuth)
**Provider:** Google Cloud Platform  
**Purpose:** Social login, Google Workspace integration  
**Status:** ✅ AVAILABLE (from Lamora project)

**Configuration:**
```env
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
```

**Capabilities:**
- Google OAuth login
- Gmail integration
- Google Calendar sync
- Google Drive storage

---

### 7. ✅ FIREBASE
**Provider:** Google Firebase  
**Purpose:** Push notifications, real-time database, authentication  
**Status:** ✅ AVAILABLE (from Lamora project)

**Configuration:**
```env
FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@lamora-22022026.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
```

**Capabilities:**
- Push notifications (Expo alternative)
- Real-time database
- Authentication
- Cloud messaging

---

### 8. ✅ GMAIL SMTP
**Provider:** Google  
**Purpose:** Email sending via Gmail  
**Status:** ⚠️ CONFIGURATION NEEDED

**Configuration:**
```env
GMAIL_EMAIL=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
GMAIL_SMTP_HOST=smtp.gmail.com
GMAIL_SMTP_PORT=587
```

**Note:** Requires generating App Password from Google Account

---

## 🔧 INFRASTRUCTURE SERVICES

### 9. ✅ POSTGRESQL (Database)
**Status:** ✅ CONFIGURED
```env
DATABASE_URL=postgresql://uradi:uradi_password_123@localhost:5436/uradi
POSTGRES_USER=uradi
POSTGRES_PASSWORD=uradi_password_123
POSTGRES_DB=uradi
DB_PORT=5436
```

### 10. ✅ REDIS (Cache)
**Status:** ✅ CONFIGURED
```env
REDIS_URL=redis://localhost:6380
REDIS_PORT=6380
REDIS_HOST=localhost
```

### 11. ✅ MINIO (Object Storage)
**Status:** ✅ CONFIGURED
```env
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=YOUR_MINIO_ACCESS_KEY
MINIO_SECRET_KEY=YOUR_MINIO_SECRET_KEY
MINIO_CONSOLE_PORT=9001
```

---

## ❌ SERVICES NOT AVAILABLE / NEED SETUP

### 12. ❌ Africa's Talking (USSD)
**Status:** NOT CONFIGURED  
**Alternative:** Use Termii for SMS instead

**Note:** Termii does not support USSD. If USSD is required:
- Apply for Africa's Talking account
- Or use Twilio's USSD capabilities

### 13. ❌ Mapbox
**Status:** NOT CONFIGURED  
**Required for:** Maps visualization

**Action Needed:**
- Create Mapbox account
- Get public token
- Add to environment variables

### 14. ❌ Sentry
**Status:** NOT CONFIGURED  
**Required for:** Error tracking

**Action Needed:**
- Create Sentry account
- Get DSN
- Add to environment variables

### 15. ❌ PostHog
**Status:** NOT CONFIGURED  
**Required for:** Analytics

**Action Needed:**
- Create PostHog account
- Get API key
- Add to environment variables

---

## 📋 COMPLETE ENVIRONMENT VARIABLES TEMPLATE

```env
# ============================================
# AI/LLM SERVICES - KIMI (CONFIRMED LIVE)
# ============================================
KIMI_API_KEY=YOUR_KIMI_API_KEY_HERE
KIMI_BASE_URL=https://api.moonshot.ai/v1
KIMI_MODEL=kimi-k2-turbo-preview

# Alternative AI Services
DEEPSEEK_API_KEY=YOUR_DEEPSEEK_API_KEY_HERE
GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE

# ============================================
# SMS SERVICES - TERMII (CONFIRMED LIVE)
# ============================================
TERMII_API_KEY=YOUR_TERMII_API_KEY_HERE
TERMII_SENDER_ID=URADI360
TERMII_BASE_URL=https://api.termii.com/api/

# ============================================
# WHATSAPP - TWILIO (CONFIRMED LIVE)
# ============================================
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID_HERE
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN_HERE
TWILIO_PHONE_NUMBER=YOUR_TWILIO_PHONE_NUMBER
TWILIO_WHATSAPP_NUMBER=YOUR_TWILIO_WHATSAPP_NUMBER

# ============================================
# EMAIL - SENDGRID (AVAILABLE)
# ============================================
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@uradi360.com
SENDGRID_FROM_NAME=URADI-360

# Alternative: Gmail SMTP
GMAIL_EMAIL=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
GMAIL_SMTP_HOST=smtp.gmail.com
GMAIL_SMTP_PORT=587

# ============================================
# PAYMENTS - PAYSTACK (AVAILABLE)
# ============================================
PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_paystack_public_key
PAYSTACK_WEBHOOK_SECRET=whsec_your_webhook_secret
PAYSTACK_BASE_URL=https://api.paystack.co

# ============================================
# AUTHENTICATION - GOOGLE (AVAILABLE)
# ============================================
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ============================================
# FIREBASE (AVAILABLE)
# ============================================
FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...

# ============================================
# DATABASE (CONFIGURED)
# ============================================
DATABASE_URL=YOUR_DATABASE_URL_HERE
DATABASE_URL_LOCAL=YOUR_DATABASE_URL_HERE
POSTGRES_USER=YOUR_POSTGRES_USER
POSTGRES_PASSWORD=YOUR_POSTGRES_PASSWORD
POSTGRES_DB=uradi
DB_PORT=5436
DB_HOST=localhost
DB_POOL_SIZE=20

# ============================================
# REDIS (CONFIGURED)
# ============================================
REDIS_URL=redis://localhost:6380
REDIS_URL_LOCAL=redis://localhost:6380
REDIS_PORT=6380
REDIS_HOST=localhost

# ============================================
# MINIO OBJECT STORAGE (CONFIGURED)
# ============================================
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=YOUR_MINIO_ACCESS_KEY
MINIO_SECRET_KEY=YOUR_MINIO_SECRET_KEY
MINIO_CONSOLE_PORT=9001

# ============================================
# SECURITY (GENERATED)
# ============================================
JWT_SECRET=YOUR_JWT_SECRET_HERE
JWT_REFRESH_SECRET=YOUR_JWT_REFRESH_SECRET_HERE
SESSION_SECRET=YOUR_SESSION_SECRET_HERE
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d
BCRYPT_ROUNDS=12

# ============================================
# MISSING - NEED SETUP
# ============================================
# MAPBOX_TOKEN=your_mapbox_token_here
# SENTRY_DSN=your_sentry_dsn_here
# AFRICASTALKING_API_KEY=your_africastalking_key_here
# AFRICASTALKING_USERNAME=your_africastalking_username

# ============================================
# APPLICATION SETTINGS
# ============================================
NODE_ENV=development
FRONTEND_PORT=4321
BACKEND_PORT=3000
FRONTEND_URL=http://localhost:4321

# Feature Flags
ENABLE_USSD=true
ENABLE_WHATSAPP=true
ENABLE_SMS=true
ENABLE_EMAIL=true
ENABLE_PAYMENTS=true

# Rate Limiting
MAX_REQUESTS_PER_MINUTE=1000
RATE_LIMIT_WINDOW_MS=60000

# CORS
CORS_ORIGIN=http://localhost:4321
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=debug
LOG_FORMAT=pretty

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
ENABLE_TRACING=false
```

---

## 🚀 IMMEDIATE ACTION ITEMS

### Priority 1: Critical (Required for Launch)
- [x] ✅ KIMI AI - Already configured
- [x] ✅ Termii SMS - Already configured
- [x] ✅ Twilio WhatsApp - Already configured
- [x] ✅ Database (PostgreSQL) - Already configured
- [x] ✅ Redis - Already configured
- [ ] ⚠️ Mapbox - **GET TOKEN** (needed for maps)

### Priority 2: Important (Should Have)
- [ ] SendGrid - Get API key
- [ ] Paystack - Get production keys
- [ ] Sentry - Set up error tracking
- [ ] MinIO - Configure for production

### Priority 3: Nice to Have
- [ ] Google Auth - Configure OAuth
- [ ] Firebase - Set up push notifications
- [ ] PostHog - Analytics
- [ ] Africa's Talking - If USSD needed

---

## 💰 ESTIMATED MONTHLY COSTS (Production)

| Service | Cost (USD) | Cost (NGN) |
|---------|-----------|-----------|
| KIMI AI | $50-200 | ₦75,000-300,000 |
| Termii SMS | $50-500 | ₦75,000-750,000 |
| Twilio WhatsApp | $20-100 | ₦30,000-150,000 |
| SendGrid | $0-90 | ₦0-135,000 |
| Paystack | 1.5% per transaction | 1.5% per transaction |
| Mapbox | $0-50 | ₦0-75,000 |
| Sentry | $0-26 | ₦0-39,000 |
| **TOTAL** | **$120-966** | **~₦180,000-1,449,000** |

*Costs vary based on usage volume

---

## 📞 SERVICE CONTACTS

| Service | Website | Support |
|---------|---------|---------|
| KIMI AI | platform.moonshot.ai | - |
| Termii | termii.com | support@termii.com |
| Twilio | twilio.com | support@twilio.com |
| SendGrid | sendgrid.com | support@sendgrid.com |
| Paystack | paystack.com | support@paystack.com |
| Mapbox | mapbox.com | support@mapbox.com |
| Sentry | sentry.io | support@sentry.io |

---

## ✅ VERIFICATION CHECKLIST

Before production deployment:

- [x] KIMI API key tested and working
- [x] Termii API key tested and working
- [x] Twilio credentials tested and working
- [ ] Mapbox token obtained
- [ ] SendGrid API key obtained
- [ ] Paystack production keys obtained
- [ ] Sentry DSN obtained
- [ ] All webhook URLs configured
- [ ] SSL certificates installed
- [ ] Domain DNS configured

---

**Status:** 8/15 services fully configured and ready  
**Recommendation:** Obtain Mapbox token before launch (required for maps)
