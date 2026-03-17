# URADI-360 Frontend-Backend Connection Plan

## Executive Summary

This document maps all frontend UI elements (buttons, forms, widgets) to their required backend API endpoints. The application has two main sections:
1. **Command Center** (Internal Dashboard) - Dark theme, authenticated
2. **Public Website** (Candidate Facing) - Light theme, public access

---

## 1. Authentication & User Management

### Current Implementation
- Login page exists at `/login`
- No authentication provider configured yet

### Required Backend APIs

| Endpoint | Method | Frontend Component | Description |
|----------|--------|---------------------|-------------|
| `/api/auth/login` | POST | Login form on `/login` | Authenticate user with email/password |
| `/api/auth/logout` | POST | Logout button in sidebar | Clear session/token |
| `/api/auth/refresh` | POST | Auto-refresh middleware | Refresh JWT token |
| `/api/auth/me` | GET | Layout wrapper | Get current user profile |
| `/api/auth/forgot-password` | POST | Forgot password link | Send reset email |
| `/api/auth/reset-password` | POST | Reset password form | Update password |

### User Roles to Implement
```typescript
type UserRole =
  | 'super_admin'      // Full system access
  | 'campaign_manager' // Campaign oversight
  |'state_coordinator' // State-level access
  | 'lga_coordinator'  // LGA-level access
  | 'ward_coordinator' // Ward-level access
  | 'field_agent'      // Data entry only
  | 'readonly_user';  // View-only access
```

---

## 2. Command Center (Internal Dashboard)

### 2.1 Overview Dashboard (`/overview`)

| Widget | Current State | Required API | Method |
|--------|--------------|--------------|--------|
| Stat Cards (Voters, Sentiment, etc.) | Mock data | `GET /api/dashboard/stats` | Real-time aggregation |
| Charts (Trends, Demographics) | Mock data | `GET /api/dashboard/charts` | Cached analytics |
| Recent Activity Feed | Mock data | `GET /api/dashboard/activity` | WebSocket for live updates |
| Quick Actions | Static buttons | Various POST endpoints | Action triggers |

### 2.2 Voters Management (`/constituents/voters`)

| Component | Current State | Required API | Priority |
|-----------|--------------|--------------|----------|
| Voter Database Table | Mock data (1000 rows) | `GET /api/voters` | HIGH |
| Search/Filter | Client-side only | `GET /api/voters?search=&filter=` | HIGH |
| Add Voter Button | Static | `POST /api/voters` | HIGH |
| Edit Voter | Static | `PUT /api/voters/:id` | HIGH |
| Delete Voter | Static | `DELETE /api/voters/:id` | MEDIUM |
| Import Voters | Static | `POST /api/voters/import` | MEDIUM |
| Export Voters | Static | `GET /api/voters/export` | MEDIUM |
| Voter Profile Modal | Static | `GET /api/voters/:id/profile` | MEDIUM |

**Voter Data Model:**
```typescript
interface Voter {
  id: string;
  vin: string; // Voter Identification Number
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  occupation: string;
  lga: string;
  ward: string;
  pollingUnit: string;
  votingHistory: VotingRecord[];
  sentiment: 'positive' | 'neutral' | 'negative';
  tags: string[];
  lastContact: string;
  createdAt: string;
  updatedAt: string;
}
```

### 2.3 Sentiment Analysis (`/constituents/sentiment`)

| Component | Current State | Required API | Data Source |
|-----------|--------------|--------------|-------------|
| Sentiment Gauge | Mock data | `GET /api/sentiment/overview` | Aggregated from social + surveys |
| Trend Chart | Mock data | `GET /api/sentiment/trends` | Time-series data |
| LGA Breakdown | Mock data | `GET /api/sentiment/by-lga` | Geographic aggregation |
| Social Media Feed | Mock data | `GET /api/sentiment/social-feed` | Twitter/Facebook scraper |
| Keyword Cloud | Mock data | `GET /api/sentiment/keywords` | NLP processing |

**Implementation Notes:**
- Requires social media scraper (Twitter API, Facebook Graph API)
- NLP service for sentiment classification (can use local model)
- Real-time updates via WebSocket

### 2.4 Anchor Citizens (`/constituents/anchor-citizens`)

| Component | Required API | Description |
|-----------|--------------|-------------|
| Anchor Citizens List | `GET /api/anchor-citizens` | Community leaders, influencers |
| Add Anchor Citizen | `POST /api/anchor-citizens` | Create new record |
| Influence Network Graph | `GET /api/anchor-citizens/network` | D3.js visualization data |
| Engagement Tracking | `POST /api/anchor-citizens/engagement` | Log interactions |

### 2.5 Youth Ambassadors (`/constituents/youth-ambassadors`)

| Component | Required API | Description |
|-----------|--------------|-------------|
| Ambassadors List | `GET /api/youth-ambassadors` | Youth leaders |
| Performance Metrics | `GET /api/youth-ambassadors/metrics` | Activity tracking |
| Tasks Assignment | `POST /api/youth-ambassadors/tasks` | Distribute work |

### 2.6 Election Day - Incidents (`/election-day/incidents`)

| Component | Current State | Required API | Priority |
|-----------|--------------|--------------|----------|
| Incident Table | Mock data (5 incidents) | `GET /api/incidents` | CRITICAL |
| Report Incident Button | Static form | `POST /api/incidents` | CRITICAL |
| Status Updates | Static | `PUT /api/incidents/:id/status` | CRITICAL |
| Assign Team | Static | `PUT /api/incidents/:id/assign` | HIGH |
| Export Report | Static | `GET /api/incidents/export` | MEDIUM |
| Real-time Updates | None | WebSocket `/ws/incidents` | CRITICAL |

**Incident Data Model:**
```typescript
interface Incident {
  id: string;
  title: string;
  category: 'security' | 'logistics' | 'violence' | 'fraud' | 'technical';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'reported' | 'investigating' | 'escalated' | 'resolved' | 'closed';
  location: {
    lga: string;
    ward: string;
    pollingUnit: string;
    coordinates?: [number, number];
  };
  reportedBy: string;
  reportedAt: string;
  assignedTo?: string;
  description: string;
  actions: string[];
  mediaUrls?: string[];
  resolvedAt?: string;
}
```

### 2.7 Election Day - Monitors (`/election-day/monitors`)

| Component | Required API | Description |
|-----------|--------------|-------------|
| Monitor Map | `GET /api/monitors/locations` | Real-time GPS tracking |
| Check-in Status | `GET /api/monitors/checkins` | Last seen timestamps |
| Message Broadcast | `POST /api/monitors/broadcast` | Send SMS/WhatsApp |
| Performance Stats | `GET /api/monitors/stats` | Coverage metrics |

### 2.8 Election Day - Results (`/election-day/results`)

| Component | Required API | Description |
|-----------|--------------|-------------|
| Results Entry Form | `POST /api/results` | Submit PU results |
| Results Table | `GET /api/results` | Aggregated results |
| Verification Queue | `GET /api/results/pending` | Awaiting verification |
| Analytics Charts | `GET /api/results/analytics` | Vote share, turnout |
| Export to INEC | `GET /api/results/export/inec` | Official format |

**Results Data Model:**
```typescript
interface PollingUnitResult {
  id: string;
  pollingUnitCode: string;
  lga: string;
  ward: string;
  registeredVoters: number;
  accreditedVoters: number;
  votesCast: number;
  rejectedVotes: number;
  partyResults: {
    party: string;
    votes: number;
  }[];
  submittedBy: string;
  submittedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  status: 'pending' | 'verified' | 'disputed';
  evidenceUrls?: string[];
}
```

### 2.9 Campaign - Polls (`/campaign/polls`)

| Component | Required API | Description |
|-----------|--------------|-------------|
| Polls List | `GET /api/polls` | Internal polling data |
| Create Poll | `POST /api/polls` | Design new survey |
| Poll Results | `GET /api/polls/:id/results` | Aggregated responses |
| Trend Analysis | `GET /api/polls/trends` | Compare over time |

### 2.10 Campaign - Micro-Targeting (`/campaign/micro-targeting`)

| Component | Required API | Description |
|-----------|--------------|-------------|
| Segment Builder | `POST /api/targeting/segments` | Create voter segments |
| Segment List | `GET /api/targeting/segments` | Saved segments |
| Message Templates | `GET /api/targeting/templates` | SMS/WhatsApp templates |
| Send Campaign | `POST /api/targeting/send` | Broadcast messages |
| Delivery Stats | `GET /api/targeting/stats` | Open rates, responses |

### 2.11 Campaign - Rapid Response (`/campaign/rapid-response`)

| Component | Required API | Description |
|-----------|--------------|-------------|
| Opposition Tracker | `GET /api/rapid-response/opposition` | Monitor opponent activities |
| Response Templates | `GET /api/rapid-response/templates` | Pre-approved responses |
| Deploy Response | `POST /api/rapid-response/deploy` | Push to social/media |
| Approval Queue | `GET /api/rapid-response/pending` | Awaiting approval |

### 2.12 Governance - Budget (`/governance/budget`)

| Component | Required API | Description |
|-----------|--------------|-------------|
| Budget Overview | `GET /api/budget/overview` | Current fiscal data |
| Expenditure Tracking | `GET /api/budget/expenditures` | Line items |
| Variance Analysis | `GET /api/budget/variance` | Budget vs actual |
| Project Costs | `GET /api/budget/projects` | Project breakdowns |

### 2.13 Governance - Security (`/governance/security`)

| Component | Required API | Description |
|-----------|--------------|-------------|
| Security Dashboard | `GET /api/security/overview` | Crime stats, incidents |
| Deployment Map | `GET /api/security/deployments` | Security personnel locations |
| Incident Log | `GET /api/security/incidents` | Security-related events |

### 2.14 Governance - Feedback (`/governance/feedback`)

| Component | Required API | Description |
|-----------|--------------|-------------|
| Feedback Inbox | `GET /api/feedback` | Citizen submissions |
| Response Form | `POST /api/feedback/:id/respond` | Reply to citizen |
| Analytics | `GET /api/feedback/analytics` | Sentiment, categories |

### 2.15 Intelligence - Coalition (`/intelligence/coalition`)

| Component | Required API | Description |
|-----------|--------------|-------------|
| Party Strength Map | `GET /api/intelligence/parties` | Party support by LGA |
| Coalition Builder | `POST /api/intelligence/coalitions` | Model coalitions |
| Scenario Analysis | `GET /api/intelligence/scenarios` | What-if projections |

### 2.16 Intelligence - Political Atlas (`/intelligence/political-atlas`)

| Component | Required API | Description |
|-----------|--------------|-------------|
| Interactive Map | `GET /api/atlas/map-data` | GeoJSON for map |
| Ward Details | `GET /api/atlas/wards/:id` | Ward-level data |
| Historical Results | `GET /api/atlas/historical` | Past election data |

### 2.17 Intelligence - Scenarios (`/intelligence/scenarios`)

| Component | Required API | Description |
|-----------|--------------|-------------|
| Scenario Models | `GET /api/scenarios` | Saved scenarios |
| Run Simulation | `POST /api/scenarios/simulate` | Monte Carlo simulation |
| Sensitivity Analysis | `GET /api/scenarios/sensitivity` | Key variable impact |

### 2.18 Narrative - Content (`/narrative/content`)

| Component | Required API | Description |
|-----------|--------------|-------------|
| Content Calendar | `GET /api/content/calendar` | Scheduled posts |
| Create Post | `POST /api/content/posts` | Draft new content |
| Media Library | `GET /api/content/media` | Uploaded assets |
| Approval Workflow | `PUT /api/content/:id/approve` | Content approval |

### 2.19 Narrative - Messaging (`/narrative/messaging`)

| Component | Required API | Description |
|-----------|--------------|-------------|
| Message Library | `GET /api/messaging/templates` | Approved messages |
| Campaign Briefs | `GET /api/messaging/briefs` | Strategy documents |
| Talking Points | `GET /api/messaging/talking-points` | Key messages |

### 2.20 Narrative - Scorecards (`/narrative/scorecards`)

| Component | Required API | Description |
|-----------|--------------|-------------|
| Public Scorecard | `GET /api/scorecards/public` | For website display |
| Internal Scorecard | `GET /api/scorecards/internal` | Detailed metrics |
| Update Metric | `PUT /api/scorecards/metrics/:id` | Update progress |

---

## 3. Public Website (Candidate Facing)

### 3.1 Landing Page (`/`)

| Component | Current State | Required API | Priority |
|-----------|--------------|--------------|----------|
| Newsletter Signup | Static form | `POST /api/public/newsletter` | HIGH |
| Statistics Counter | Hardcoded | `GET /api/public/stats` | MEDIUM |
| Latest News | Hardcoded | `GET /api/public/news?limit=3` | HIGH |
| Upcoming Events | Hardcoded | `GET /api/public/events?upcoming=true` | HIGH |
| Contact Form | Static | `POST /api/public/contact` | HIGH |

### 3.2 About Page (`/about`)

| Component | Current State | Required API |
|-----------|--------------|--------------|
| Biography | Hardcoded | `GET /api/public/biography` |
| Timeline | Hardcoded | `GET /api/public/timeline` |
| Achievements | Hardcoded | `GET /api/public/achievements` |
| Download Bio | Static | `GET /api/public/downloads/bio` |

### 3.3 Vision Page (`/vision`)

| Component | Current State | Required API |
|-----------|--------------|--------------|
| Policy Areas | Hardcoded | `GET /api/public/policies` |
| Policy Details | Hardcoded | `GET /api/public/policies/:id` |
| Download Platform | Static | `GET /api/public/downloads/platform` |

### 3.4 Scorecard Page (`/public/scorecard`)

| Component | Current State | Required API | Priority |
|-----------|--------------|--------------|----------|
| Overall Progress | Hardcoded | `GET /api/public/scorecard` | HIGH |
| Promise List | Hardcoded | `GET /api/public/promises` | HIGH |
| Category Filter | Client-side | `GET /api/public/promises?category=` | MEDIUM |
| Download Report | Static | `GET /api/public/downloads/scorecard` | MEDIUM |

### 3.5 News Page (`/news`)

| Component | Current State | Required API | Priority |
|-----------|--------------|--------------|----------|
| News List | Hardcoded | `GET /api/public/news` | HIGH |
| Category Filter | Client-side | `GET /api/public/news?category=` | MEDIUM |
| Search | Client-side | `GET /api/public/news?search=` | MEDIUM |
| Article Detail | N/A | `GET /api/public/news/:id` | HIGH |
| Share Count | N/A | `GET /api/public/news/:id/shares` | LOW |

### 3.6 Events Page (`/events`)

| Component | Current State | Required API | Priority |
|-----------|--------------|--------------|----------|
| Events List | Hardcoded | `GET /api/public/events` | HIGH |
| RSVP Form | Static modal | `POST /api/public/events/:id/rsvp` | HIGH |
| Host Event Form | Static modal | `POST /api/public/host-event` | MEDIUM |
| Past Events | Hardcoded | `GET /api/public/events?past=true` | MEDIUM |

### 3.7 Get Involved Page (`/get-involved`)

| Component | Current State | Required API | Priority |
|-----------|--------------|--------------|----------|
| Volunteer Signup | Static form | `POST /api/public/volunteers` | HIGH |
| Role Selection | Static | `GET /api/public/volunteer-roles` | MEDIUM |
| Testimonials | Hardcoded | `GET /api/public/testimonials` | LOW |

### 3.8 Donate Page (`/donate`)

| Component | Current State | Required API | Priority |
|-----------|--------------|--------------|----------|
| Transparency Stats | Hardcoded | `GET /api/public/transparency` | HIGH |
| Recent Donors | Hardcoded | `GET /api/public/donors?recent=true` | MEDIUM |
| Donation Form | Static | `POST /api/public/donations` | CRITICAL |
| Payment Processing | N/A | Integration: Paystack/Flutterwave | CRITICAL |
| Recurring Donations | Static | `POST /api/public/donations/recurring` | MEDIUM |

**Payment Integration:**
```typescript
// Paystack/Flutterwave integration required
interface DonationRequest {
  amount: number;
  currency: 'NGN' | 'USD';
  donor: {
    name: string;
    email: string;
    phone?: string;
    showName: boolean;
  };
  paymentMethod: 'card' | 'bank' | 'ussd' | 'intl';
  isRecurring: boolean;
  metadata: {
    source: 'website';
    campaign?: string;
  };
}
```

### 3.9 Contact Page (`/contact`)

| Component | Current State | Required API | Priority |
|-----------|--------------|--------------|----------|
| Contact Form | Static form | `POST /api/public/contact` | HIGH |
| Office Locations | Hardcoded | `GET /api/public/offices` | LOW |
| Chatbot | Working UI | `POST /api/public/chatbot` | MEDIUM |

**Chatbot Integration:**
```typescript
// Can use OpenAI GPT-4 or local LLM
interface ChatRequest {
  message: string;
  sessionId: string;
  context?: {
    page: string;
    previousMessages: string[];
  };
}

interface ChatResponse {
  message: string;
  suggestions?: string[];
  actions?: {
    type: 'link' | 'form';
    label: string;
    payload: any;
  }[];
}
```

### 3.10 Resources Page (`/resources`)

| Component | Current State | Required API | Priority |
|-----------|--------------|--------------|----------|
| Resource Categories | Hardcoded | `GET /api/public/resources` | MEDIUM |
| File Downloads | Static | `GET /api/public/downloads/:id` | MEDIUM |
| FAQ | Hardcoded | `GET /api/public/faq` | MEDIUM |

---

## 4. Real-Time Features (WebSocket)

### Required WebSocket Endpoints

| Channel | Purpose | Frontend Components |
|---------|---------|---------------------|
| `/ws/incidents` | Live incident updates | Election Day - Incidents |
| `/ws/monitors` | GPS location updates | Election Day - Monitors |
| `/ws/results` | Results streaming | Election Day - Results |
| `/ws/dashboard` | Dashboard stats refresh | Overview page |
| `/ws/notifications` | System alerts | All pages (toast notifications) |

---

## 5. Third-Party Integrations

### 5.1 Payment Processing
- **Primary**: Paystack (Nigeria)
- **Alternative**: Flutterwave
- **International**: Stripe (for diaspora)

### 5.2 Communication
- **SMS**: Twilio, Africa's Talking, or Termii
- **WhatsApp**: WhatsApp Business API (via Twilio or direct)
- **Email**: SendGrid, Mailgun, or AWS SES

### 5.3 Maps
- **Primary**: Mapbox (already integrated)
- **Fallback**: Google Maps

### 5.4 Social Media
- **Twitter**: Twitter API v2 (for sentiment monitoring)
- **Facebook**: Facebook Graph API

### 5.5 AI/ML
- **Chatbot**: OpenAI GPT-4 API or self-hosted LLM
- **Sentiment Analysis**: Local model (Python + Transformers)

---

## 6. Database Schema Overview

### Core Tables

```sql
-- Users & Authentication
users (id, email, password_hash, role, profile, created_at)
sessions (id, user_id, token, expires_at)

-- Voter Management
voters (id, vin, personal_info, location, sentiment, tags, created_at)
voting_history (id, voter_id, election_year, voted, polling_unit)

-- Election Day
election_incidents (id, category, severity, status, location, reported_by, assigned_to, description, actions, created_at, resolved_at)
monitor_checkins (id, monitor_id, location, timestamp, status)
polling_unit_results (id, polling_unit_code, results, status, submitted_by, verified_by, created_at)

-- Campaign
donation (id, amount, donor_info, payment_ref, status, created_at)
volunteers (id, personal_info, role, availability, status, assigned_coordinator)
events (id, title, type, date, location, capacity, attendees, status)

-- Content
news_articles (id, title, content, category, author, published_at, status)
resources (id, title, type, category, file_url, download_count)

-- Scorecard
promises (id, title, category, description, target_date, progress, status, updates)
metrics (id, name, value, target, category, last_updated)
```

---

## 7. Implementation Priority

### Phase 1: Critical (Week 1-2)
1. Authentication API (`/api/auth/*`)
2. Voter Management API (`/api/voters/*`)
3. Public Contact Form (`/api/public/contact`)
4. Newsletter Signup (`/api/public/newsletter`)

### Phase 2: High Priority (Week 3-4)
1. Election Day Incidents (`/api/incidents/*`)
2. Election Day Results (`/api/results/*`)
3. Public Scorecard (`/api/public/scorecard`, `/api/public/promises`)
4. News API (`/api/public/news/*`)
5. Events API (`/api/public/events/*`)

### Phase 3: Medium Priority (Week 5-6)
1. Donation Processing (Paystack integration)
2. Volunteer Signup (`/api/public/volunteers`)
3. Sentiment Analysis pipeline
4. Dashboard Analytics (`/api/dashboard/*`)

### Phase 4: Lower Priority (Week 7-8)
1. Chatbot integration
2. Micro-targeting system
3. Coalition modeling
4. Advanced reporting

---

## 8. API Response Standards

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { ... }
  }
}
```

---

## 9. Security Considerations

### Authentication
- JWT tokens with 1-hour expiry
- Refresh token rotation
- Rate limiting on login attempts

### Authorization
- Role-based access control (RBAC)
- Resource-level permissions
- API key for public endpoints (rate limited)

### Data Protection
- Encryption at rest (AES-256)
- TLS 1.3 for data in transit
- PII data masking in logs

---

## 10. Performance Requirements

| Endpoint Type | Target Response Time | Caching Strategy |
|--------------|---------------------|------------------|
| Public pages | < 200ms | CDN + 1 hour cache |
| Dashboard stats | < 500ms | Redis, 5 min cache |
| Voter search | < 1s | Database indexes |
| Real-time updates | < 100ms | WebSocket |
| Reports export | < 5s | Async job + notification |

---

## Summary

**Total API Endpoints Needed**: ~80 endpoints
- Authentication: 6
- Command Center: ~50
- Public Website: ~20
- WebSocket: 5

**Critical for Launch**: 15 endpoints
**High Priority**: 20 endpoints
**Medium/Low Priority**: 45 endpoints

**Next Steps**:
1. Set up backend framework (Node.js/Express or Python/FastAPI)
2. Design database schema
3. Implement authentication
4. Build voter management APIs
5. Connect frontend forms to APIs
