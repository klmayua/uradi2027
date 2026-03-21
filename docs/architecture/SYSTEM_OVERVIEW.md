# URADI-360 System Architecture Overview

**Version:** 1.0.0
**Date:** 2026-03-21
**Status:** ✅ COMPLETE

---

## Executive Summary

URADI-360 is a **multi-tenant political intelligence platform** built on a modern cloud-native architecture. It serves multiple political campaigns simultaneously with complete data isolation, while providing real-time analytics, field operations coordination, and election monitoring capabilities.

**Architecture Principles:**
1. **Multi-tenancy** - Single platform serves 100+ campaigns
2. **API-first** - All functionality exposed via REST API
3. **Real-time** - WebSockets for live updates
4. **Offline-capable** - Mobile app works without connectivity
5. **Scalable** - Horizontal scaling for election day traffic spikes

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                        │
├──────────────┬──────────────┬──────────────┬──────────────────────────────┤
│   Command    │   Citizen    │    Field     │          Public              │
│   Center     │   Portal     │     App      │            API               │
│  (Next.js)   │  (Next.js)   │   (Expo)     │         (REST)               │
│              │              │              │                              │
│ • Admin      │ • Public     │ • Offline    │ • Third-party                │
│ • Analytics  │   website    │ • GPS        │ • Mobile apps                │
│ • Management │ • Donations  │ • Camera     │ • Integrations               │
└──────┬───────┴──────┬───────┴──────┬───────┴──────────┬───────────────────┘
       │              │              │                  │
       └──────────────┴──────┬───────┴──────────────────┘
                             │
              ┌──────────────▼──────────────┐
              │      API GATEWAY            │
              │     (Nginx/FastAPI)         │
              │                              │
              │  • Rate Limiting            │
              │  • Authentication           │
              │  • Multi-tenant routing     │
              │  • Load Balancing           │
              └──────────────┬──────────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       │                     │                     │
┌──────▼──────┐     ┌────────▼────────┐   ┌──────▼──────┐
│   CORE      │     │   INTELLIGENCE  │   │    FIELD    │
│  SERVICES   │     │     SERVICES    │   │   SERVICES  │
│             │     │                  │   │             │
│ • Auth      │     │ • OSINT         │   │ • Canvassing│
│ • Users     │     │ • Sentiment     │   │ • Agents    │
│ • Tenants   │     │ • Scenarios     │   │ • Sync      │
│ • Voters    │     │ • Briefs        │   │ • Offline   │
└──────┬──────┘     └────────┬────────┘   └──────┬──────┘
       │                     │                   │
       └─────────────────────┼───────────────────┘
                             │
              ┌──────────────▼──────────────┐
              │      DATA LAYER             │
              ├──────────────┬──────────────┤
              │  PostgreSQL  │    Redis     │
              │  (Primary)   │   (Cache)    │
              │              │              │
              │ • Voter data │ • Sessions   │
              │ • Users      │ • Rate limit │
              │ • Campaigns  │ • Real-time  │
              └──────────────┴──────────────┘
```

---

## Component Breakdown

### 1. Frontend Layer

#### 1.1 Command Center (Admin Dashboard)

**Technology:** Next.js 15 + React + TypeScript + Tailwind CSS

**Purpose:** Administrative interface for campaign management

**Modules:**
```
command-center/
├── (dashboard)/          # Protected dashboard routes
├── campaign/             # Campaign operations
│   ├── micro-targeting/  # Voter segmentation
│   ├── polls/           # Poll management
│   └── rapid-response/  # Crisis management
├── constituents/         # Voter management
│   ├── voters/          # Voter database
│   ├── sentiment/       # Sentiment analysis
│   └── youth-ambassadors/
├── election-day/        # Election monitoring
├── governance/           # Post-election governance
├── intelligence/         # OSINT and analysis
├── narrative/            # Content management
├── settings/            # User management
└── public/              # Public-facing pages
```

**Key Features:**
- Server-side rendering for SEO
- Real-time updates via WebSocket
- Role-based menu access
- Responsive design (desktop/tablet)

**Access:** https://admin.uradi360.com

#### 1.2 Citizen Portal (Public Website)

**Technology:** Next.js 15 + React + Tailwind CSS

**Purpose:** Public-facing campaign website

**Pages:**
```
citizen-portal/
├── page.tsx              # Landing page
├── about/               # About candidate
├── vision/              # Policy positions
├── news/                # Campaign news
├── events/              # Event calendar
├── donate/              # Donation processing
├── volunteer/           # Volunteer signup
├── scorecard/           # Promise tracker
├── contact/             # Contact form
├── privacy/             # Privacy policy
└── terms/               # Terms of service
```

**Key Features:**
- Dynamic branding (per-tenant customization)
- SEO optimized
- Donation processing
- Social media integration

**Access:** https://[campaign].uradi360.com

#### 1.3 Field App (Mobile)

**Technology:** Expo + React Native

**Purpose:** Ground operations enablement

**Features:**
- Offline voter registration
- GPS tracking and navigation
- Photo capture with metadata
- Incident reporting
- Real-time sync
- Multi-language (Hausa, English)

**Supported Platforms:**
- Android 8.0+
- iOS 14.0+

**Access:** Download from Play Store/App Store

---

### 2. API Layer

#### 2.1 Core Services (FastAPI)

**Technology:** Python 3.12 + FastAPI + SQLAlchemy

**Main Application:** `backend/main.py`

**Router Structure:**
```python
# Authentication
/auth/login              # JWT login
/auth/refresh            # Token refresh
/auth/logout             # Logout
/auth/forgot-password    # Password reset

# Core APIs
/api/tenants            # Tenant management
/api/users              # User management (RBAC)
/api/voters             # Voter CRUD
/api/canvassing         # Field operations
/api/intelligence       # Reports & analytics
/api/osint              # Social monitoring
/api/election-day       # Results & monitoring
/api/ai-agents          # AI-powered features
/api/governance         # Post-election
/api/sync               # Mobile sync
```

**API Statistics:**
- 24 API modules
- 150+ endpoints
- Average response time: <150ms
- Rate limit: 1,000 req/min per user

#### 2.2 Authentication & Security

**Authentication Flow:**
```
1. User submits credentials
2. Server validates against database
3. Server generates JWT (30 min expiry)
4. Server generates refresh token (7 days)
5. Client stores tokens
6. Client sends JWT in Authorization header
7. Server validates JWT signature
8. Server extracts user/tenant from JWT
9. Server checks permissions (RBAC)
10. Request processed
```

**Security Headers:**
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

---

### 3. Data Layer

#### 3.1 PostgreSQL Database

**Version:** PostgreSQL 16

**Architecture:** Single primary (read/write)

**Schema:**
```sql
-- Core Tables
tenants          -- Campaign/tenant information
users            -- User accounts with roles
voters           -- Voter records (2M+ per tenant)
polling_units    -- Voting locations
lgas             -- Local Government Areas
wards            -- Electoral wards

-- Operations
canvassing_contacts   -- Field interactions
incidents             -- Election day incidents
election_results      -- Vote counts (partitioned)

-- Intelligence
osint_mentions        -- Social media mentions (partitioned)
sentiment_scores      -- Sentiment analysis
briefs                -- Daily intelligence reports

-- System
audit_logs            -- Activity logging
api_keys              -- Integration keys
```

**Partitioning Strategy:**
- `osint_mentions` - partitioned by month
- `election_results` - partitioned by election cycle
- `activity_logs` - partitioned by month

**Indexes:**
- Primary keys (UUID)
- Tenant lookups (tenant_id + key fields)
- Geospatial (PostGIS for location queries)
- Full-text search (GIN indexes)

#### 3.2 Redis Cache

**Use Cases:**
- Session storage (JWT refresh tokens)
- Rate limiting counters
- Query result caching (5 min TTL)
- Real-time pub/sub (WebSocket updates)
- Background job results (Celery)

**Configuration:**
- Max memory: 2GB
- Eviction policy: allkeys-lru
- Persistence: RDB snapshots

---

### 4. Background Services

#### 4.1 Celery Workers

**Purpose:** Asynchronous task processing

**Tasks:**
```python
# Data Processing
tasks.data_import       # Bulk voter imports
tasks.report_generation # PDF/Excel reports
tasks.data_export       # Data exports

# Intelligence
tasks.sentiment_analysis  # Analyze social media
tasks.brief_generation    # Daily briefs
tasks.trend_detection     # Detect trending topics

# Communication
tasks.sms_batch          # Bulk SMS sending
tasks.email_queue        # Email campaigns

# Maintenance
tasks.database_cleanup   # Archive old data
tasks.metrics_aggregation # Analytics
```

**Configuration:**
- Worker processes: 4
- Concurrency: 10 threads per worker
- Result backend: Redis
- Task expiry: 24 hours

#### 4.2 Scheduled Jobs

**Cron Schedule:**
```
0 6 * * *    # Daily briefing generation
0 */6 * * *  # Sentiment analysis (every 6 hours)
0 2 * * 0    # Weekly report generation
0 3 1 * *    # Monthly data archival
```

---

### 5. External Integrations

#### 5.1 Communication Services

| Service | Purpose | Protocol |
|---------|---------|----------|
| Termii | SMS gateway | REST API |
| Africa's Talking | Backup SMS | REST API |
| Twilio | WhatsApp | REST API |
| SendGrid | Email | SMTP/API |

#### 5.2 AI Services

| Service | Purpose | Model |
|---------|---------|-------|
| Kimi | Sentiment analysis, briefs | kimi-k2 |
| Ollama | Self-hosted inference | Various |

#### 5.3 Infrastructure Services

| Service | Purpose | Type |
|---------|---------|------|
| Mapbox | Maps & geocoding | SaaS |
| Sentry | Error tracking | SaaS |
| Railway | Backend hosting | PaaS |
| Vercel | Frontend hosting | PaaS |
| Supabase | File storage | SaaS |

---

## Data Flow Diagrams

### Flow 1: Voter Registration

```
Field Agent          Mobile App            API              Database
     │                    │                 │                  │
     │ 1. Open app        │                 │                  │
     │────────────────────▶│                 │                  │
     │                    │                 │                  │
     │ 2. Enter voter data│                 │                  │
     │────────────────────▶│                 │                  │
     │                    │                 │                  │
     │                    │ 3. Store locally│                  │
     │                    │ (SQLite)        │                  │
     │                    │                 │                  │
     │                    │ 4. Sync when online               │
     │                    │────────────────────────────────────▶│
     │                    │                 │                  │
     │                    │                 │ 5. Validate      │
     │                    │                 │─────────────────▶│
     │                    │                 │                  │
     │                    │                 │ 6. Save voter    │
     │                    │                 │─────────────────▶│
     │                    │                 │                  │
     │                    │ 7. Confirmation │                  │
     │◀───────────────────│                 │                  │
```

### Flow 2: Real-time Election Results

```
Monitor      Mobile App       API         WebSocket       Dashboard
   │              │            │              │              │
   │ 1. Submit    │            │              │              │
   │   results    │            │              │              │
   │─────────────▶│            │              │              │
   │              │            │              │              │
   │              │ 2. POST    │              │              │
   │              │────────────▶│              │              │
   │              │            │              │              │
   │              │            │ 3. Validate  │              │
   │              │            │ & save       │              │
   │              │            │              │              │
   │              │            │ 4. Broadcast │              │
   │              │            │─────────────▶│              │
   │              │            │              │              │
   │              │            │              │ 5. Push update│
   │              │            │              │─────────────▶│
   │              │            │              │              │
   │              │            │              │              │ 6. Update UI
   │              │            │              │              │ (Real-time)
```

### Flow 3: Sentiment Analysis

```
Social Media    Scraper      Queue      AI Worker      Database     Dashboard
     │            │          │            │            │            │
     │            │ 1. Fetch │            │            │            │
     │◀───────────│ posts    │            │            │            │
     │            │          │            │            │            │
     │            │ 2. Queue │            │            │            │
     │            │─────────▶│            │            │            │
     │            │          │            │            │            │
     │            │          │ 3. Process │            │            │
     │            │          │───────────▶│            │            │
     │            │          │            │            │            │
     │            │          │            │ 4. Analyze │            │
     │            │          │            │ with Kimi  │            │
     │            │          │            │            │            │
     │            │          │            │ 5. Store   │            │
     │            │          │            │───────────▶│            │
     │            │          │            │            │            │
     │            │          │            │            │ 6. Aggregate│
     │            │          │            │            │            │
     │            │          │            │            │───────────▶│
     │            │          │            │            │            │
     │            │          │            │            │            │ 7. Display
```

---

## Multi-Tenant Architecture

### Tenant Isolation

```
┌─────────────────────────────────────────────┐
│           URADI-360 PLATFORM                 │
│              (Single Instance)               │
├─────────────┬─────────────┬────────────────┤
│  Tenant A   │  Tenant B   │   Tenant C     │
│  (Jigawa)   │   (Kano)    │   (Lagos)      │
│             │             │                │
│ • Users: 50 │ • Users: 75 │ • Users: 120   │
│ • Voters:   │ • Voters:   │ • Voters:      │
│   2.1M      │   3.2M      │   5.8M         │
│             │             │                │
│ • Data      │ • Data      │ • Data         │
│   isolated  │   isolated  │   isolated     │
│ • Branding: │ • Branding: │ • Branding:    │
│   Red/Green │   Purple    │   Blue/White   │
└─────────────┴─────────────┴────────────────┘
```

**Isolation Mechanism:**

1. **Request Level:**
   ```http
   GET /api/voters
   Headers:
     Authorization: Bearer <JWT>
     X-Tenant-ID: jigawa-2027
   ```

2. **Database Level:**
   ```sql
   -- Row-Level Security Policy
   CREATE POLICY tenant_isolation ON voters
     USING (tenant_id = current_setting('app.current_tenant'));
   ```

3. **Application Level:**
   ```python
   # FastAPI dependency
   async def get_tenant(request: Request) -> Tenant:
       tenant_id = request.headers.get("X-Tenant-ID")
       return await validate_tenant(tenant_id)
   ```

### Resource Allocation

| Resource | Per-Tenant Limits |
|----------|------------------|
| Users | 1,000 max |
| Voters | 10M max |
| Storage | 100GB |
| API Requests | 10,000/hour |
| Concurrent Users | 100 |

---

## Scalability Architecture

### Current Scale

| Metric | Value |
|--------|-------|
| Active Tenants | 5-10 |
| Total Users | 500 |
| Voter Records | 15M |
| API Requests/Day | 100K |
| Concurrent Users | 100 |

### Target Scale (2028)

| Metric | Target |
|--------|--------|
| Active Tenants | 100+ |
| Total Users | 10,000 |
| Voter Records | 500M |
| API Requests/Day | 10M |
| Concurrent Users | 5,000 |

### Scaling Strategy

#### Phase 1: Optimization (Current)

**Database:**
- Query optimization
- Index tuning
- Connection pooling (PgBouncer)
- Read replicas for analytics

**Caching:**
- Redis for hot data
- CDN for static assets
- Browser caching

**Code:**
- Async database queries
- Pagination on all lists
- Background jobs for heavy tasks

#### Phase 2: Horizontal Scaling (Month 6)

**Application:**
- Load balancer (Nginx/HAProxy)
- Multiple FastAPI instances
- Stateless design
- Health checks

**Database:**
- Read replicas (3x)
- Write remains on primary
- Read/write splitting

**Cache:**
- Redis Cluster
- Session affinity

#### Phase 3: Multi-Region (Month 12)

**Architecture:**
- Primary region: Lagos (writes)
- Secondary: Kano, PHC (reads)
- Async replication
- CDN edge locations

---

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────┐
│ Layer 5: Application                    │
│ • JWT authentication                    │
│ • RBAC authorization                    │
│ • Input validation                      │
│ • Rate limiting                         │
├─────────────────────────────────────────┤
│ Layer 4: Database                       │
│ • Row-level security                    │
│ • Encrypted connections                 │
│ • Parameterized queries                 │
├─────────────────────────────────────────┤
│ Layer 3: Network                        │
│ • HTTPS/TLS 1.3                         │
│ • VPC isolation                         │
│ • Firewall rules                        │
├─────────────────────────────────────────┤
│ Layer 2: Infrastructure                 │
│ • Container security                    │
│ • Secrets management                    │
│ • Security patches                      │
├─────────────────────────────────────────┤
│ Layer 1: Physical                       │
│ • Cloud provider security               │
│ • Data center controls                  │
└─────────────────────────────────────────┘
```

### Security Controls

| Control | Implementation |
|---------|---------------|
| Authentication | JWT tokens, MFA for admins |
| Authorization | RBAC with resource permissions |
| Encryption | TLS 1.3 in transit, AES-256 at rest |
| Audit | All actions logged with user/context |
| Rate Limiting | 1,000 req/min per user |
| Input Validation | Pydantic schemas, SQL injection prevention |
| CORS | Whitelist origins only |
| Headers | Security headers on all responses |

---

## Deployment Architecture

### Infrastructure

```
Internet
    │
    ▼
┌─────────────┐
│   Cloudflare│  (DDoS, CDN, WAF)
│   / WAF     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Vercel   │  (Frontend hosting)
│  (Next.js)  │
└─────────────┘
       │
       │ API calls
       ▼
┌─────────────┐
│   Railway   │  (Backend hosting)
│  (FastAPI)  │
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌─────────────┐    ┌────────────┐
│  PostgreSQL │    │   Redis    │
│  (Railway)  │    │  (Railway) │
└─────────────┘    └────────────┘
```

### Environments

| Environment | Purpose | URL |
|-------------|---------|-----|
| Production | Live campaigns | *.uradi360.com |
| Staging | Pre-production | *.staging.uradi360.com |
| Development | Feature testing | localhost |

### Deployment Process

```
Developer
    │
    ▼ push
┌─────────────┐
│   GitHub    │
└──────┬──────┘
       │ trigger
       ▼
┌─────────────┐
│GitHub Actions│ (CI/CD pipeline)
│  • Test     │
│  • Build    │
│  • Deploy   │
└──────┬──────┘
       │
       ├──────────┬──────────┐
       ▼          ▼          ▼
   ┌──────┐  ┌──────┐  ┌──────┐
   │Staging│  │Production
   └──────┘  └──────┘
```

---

## Monitoring & Observability

### Metrics Collection

**Application Metrics:**
- Request latency (p50, p95, p99)
- Error rate (5xx responses)
- Throughput (requests/second)
- Active users
- Database query time

**Infrastructure Metrics:**
- CPU usage
- Memory usage
- Disk I/O
- Network traffic
- Database connections

### Alerting

| Condition | Severity | Action |
|-----------|----------|--------|
| Error rate > 1% | CRITICAL | Page on-call |
| P95 latency > 500ms | HIGH | Notify team |
| CPU > 80% | HIGH | Scale up |
| Disk > 85% | HIGH | Alert + clean |
| Failed login > 10/min | MEDIUM | Security alert |

### Logging

**Structure:** JSON format with fields:
```json
{
  "timestamp": "2026-03-21T10:30:00Z",
  "level": "info",
  "correlation_id": "uuid",
  "tenant_id": "jigawa-2027",
  "user_id": "user-uuid",
  "method": "GET",
  "path": "/api/voters",
  "status_code": 200,
  "duration_ms": 45,
  "message": "Request processed"
}
```

---

## Disaster Recovery

### Recovery Objectives

| Metric | Target |
|--------|--------|
| RPO (Recovery Point Objective) | 1 hour |
| RTO (Recovery Time Objective) | 4 hours |
| Backup Retention | 30 days |
| Geo-Redundancy | 2 regions |

### Backup Strategy

**Database:**
- Automated daily backups (full)
- Continuous WAL archiving (point-in-time recovery)
- Cross-region replication

**Files:**
- S3 versioning enabled
- Lifecycle policies (30 days)

**Configuration:**
- Infrastructure as Code (IaC)
- Version controlled

---

## Appendix

### API Endpoints Summary

| Module | Endpoints | Description |
|--------|-----------|-------------|
| Auth | 8 | Login, logout, password management |
| Users | 12 | User CRUD, permissions |
| Voters | 20 | Voter management, import/export |
| Canvassing | 15 | Field operations |
| Intelligence | 25 | OSINT, sentiment, reports |
| Election Day | 18 | Results, monitoring |
| AI Agents | 14 | AI-powered analysis |
| Governance | 16 | Post-election features |
| **Total** | **150+** | Complete API |

### Database Tables

| Category | Tables | Records |
|----------|--------|---------|
| Core | 8 | ~2.1M per tenant |
| Operations | 12 | ~500K per tenant |
| Intelligence | 8 | ~1M per tenant |
| System | 6 | ~10K per tenant |
| **Total** | **34** | **~3.6M per tenant** |

### Technology Versions

| Component | Version | Status |
|-----------|---------|--------|
| Python | 3.12 | ✅ Current |
| FastAPI | 0.115.0 | ✅ Current |
| PostgreSQL | 16 | ✅ Current |
| Redis | 7 | ✅ Current |
| Next.js | 15 | ✅ Current |
| TypeScript | 5.3 | ✅ Current |

---

**Document Version:** 1.0.0
**Last Updated:** 2026-03-21
**Next Review:** 2026-06-21

**Maintained by:** Technical Architecture Team
**Questions:** tech-arch@uradi360.com
