# URADI-360 User Matrix & Journey Map

**Version:** 1.0
**Date:** 2026-03-20
**Status:** Design Document

---

## 👥 USER PERSONAS OVERVIEW

### Primary User Roles

| Role | Code | Description | Primary Use Case |
|------|------|-------------|------------------|
| **Super Admin** | `superadmin` | Platform owner, manages all tenants | System administration, tenant provisioning |
| **Admin** | `admin` | Campaign manager, full tenant access | Campaign setup, team management, strategic decisions |
| **Strategist** | `strategist` | Senior analyst, campaign planning | Data analysis, scenario modeling, coalition building |
| **Coordinator** | `coordinator` | Field operations manager | LGA/ward management, field agent supervision |
| **Analyst** | `analyst` | Data specialist | Reports, sentiment analysis, voter profiling |
| **Field Agent** | `field_agent` | Ground canvasser | Voter registration, canvassing, data collection |
| **Monitor** | `monitor` | Election day observer | Polling unit monitoring, incident reporting |
| **Content Manager** | `content_manager` | Communications lead | Messaging, content calendar, social media |
| **Finance Manager** | `finance_manager` | Budget controller | Budget tracking, expense approval, donations |

---

## 🔐 PERMISSION MATRIX

### Feature Access by Role

```
Legend:
✅ Full Access    🔍 Read Only    ✏️ Create/Edit    ❌ No Access    👤 Own Records Only
```

| Feature | Super Admin | Admin | Strategist | Coordinator | Analyst | Field Agent | Monitor | Content Mgr | Finance Mgr |
|---------|:-----------:|:-----:|:----------:|:-----------:|:-------:|:-----------:|:-------:|:-----------:|:-----------:|
| **TENANT MANAGEMENT** |
| Create Tenant | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Configure Tenant | ✅ | ✅ | 🔍 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Tenant Stats | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **USER MANAGEMENT** |
| Create Users | ✅ | ✅ | ❌ | 👤 | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit Users | ✅ | ✅ | ❌ | 👤 | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete Users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assign Roles | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Team | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **VOTER MANAGEMENT** |
| View Voters | ✅ | ✅ | ✅ | ✅ | ✅ | 👤 | ❌ | ❌ | ❌ |
| Create Voters | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit Voters | ✅ | ✅ | ✅ | ✅ | ✅ | 👤 | ❌ | ❌ | ❌ |
| Delete Voters | ✅ | ✅ | ✅ | 👤 | ❌ | ❌ | ❌ | ❌ | ❌ |
| Bulk Import | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Export Voters | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **CANVASSING** |
| View Contacts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Contacts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update Contacts | ✅ | ✅ | ✅ | ✅ | ✅ | 👤 | ❌ | ❌ | ❌ |
| Assign Territories | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **FIELD OPERATIONS** |
| View Field Data | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🔍 | ❌ | ❌ |
| Submit Reports | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Verify Reports | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Track Agent Location | ✅ | ✅ | ✅ | ✅ | 🔍 | ❌ | ❌ | ❌ | ❌ |
| **OSINT INTELLIGENCE** |
| View Mentions | ✅ | ✅ | ✅ | ✅ | ✅ | 🔍 | 🔍 | ✅ | ❌ |
| Create Alerts | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Manage Sources | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| View Briefs | ✅ | ✅ | ✅ | ✅ | ✅ | 🔍 | 🔍 | ✅ | ❌ |
| Narrative Analysis | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **SENTIMENT ANALYSIS** |
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | 🔍 | 🔍 | ✅ | ❌ |
| Configure Analysis | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Export Reports | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **ELECTION DAY** |
| View Results | ✅ | ✅ | ✅ | ✅ | ✅ | 🔍 | ✅ | 🔍 | 🔍 |
| Submit Results | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Verify Results | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Report Incidents | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage Incidents | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **GOVERNANCE** |
| View Scorecard | ✅ | ✅ | ✅ | ✅ | ✅ | 🔍 | 🔍 | ✅ | 🔍 |
| Update Promises | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Budget View | ✅ | ✅ | ✅ | 🔍 | 🔍 | ❌ | ❌ | ❌ | ✅ |
| Budget Edit | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **CONTENT** |
| View Content | ✅ | ✅ | ✅ | ✅ | ✅ | 🔍 | 🔍 | ✅ | ❌ |
| Create Content | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Edit Content | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Publish Content | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **MESSAGING** |
| View Templates | ✅ | ✅ | ✅ | ✅ | ✅ | 🔍 | ❌ | ✅ | ❌ |
| Create Templates | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Send Messages | ✅ | ✅ | ✅ | ✅ | ❌ | 👤 | ❌ | ✅ | ❌ |
| View Analytics | ✅ | ✅ | ✅ | ✅ | ✅ | 🔍 | ❌ | ✅ | ❌ |
| **REPORTS & ANALYTICS** |
| View Reports | ✅ | ✅ | ✅ | ✅ | ✅ | 🔍 | 🔍 | ✅ | ✅ |
| Create Reports | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Schedule Reports | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Export Data | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **SETTINGS** |
| General Settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Security Settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Audit Logs | ✅ | ✅ | 🔍 | ❌ | ❌ | ❌ | ❌ | ❌ | 🔍 |
| Data Export | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| API Keys | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 🛤️ USER JOURNEY MAPS

### Journey 1: Super Admin - Tenant Onboarding

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Login     │───▶│  Dashboard  │───▶│ New Tenant  │───▶│  Configure  │───▶│   Launch    │
│             │    │             │    │   Request   │    │   Tenant    │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                   │                   │                   │                   │
      ▼                   ▼                   ▼                   ▼                   ▼
  • System Login     • View all         • Enter tenant    • Set branding    • Send welcome
  • MFA Verify         tenants            details           • Configure       • Monitor
  • Access admin     • View metrics     • Upload logo       LGA data          onboarding
    panel            • Alerts                              • Create admin
```

**Touchpoints:**
1. Login with superadmin credentials
2. Review tenant provisioning requests
3. Configure tenant (name, state, candidate, branding)
4. Seed LGA and ward data
5. Create admin user
6. Send welcome email
7. Monitor onboarding progress

---

### Journey 2: Admin - Campaign Setup

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Login     │───▶│   Invite    │───▶│   Import    │───▶│  Configure  │───▶│   Launch    │
│             │    │    Team     │    │   Voters    │    │   OSINT     │    │  Campaign   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                   │                   │                   │                   │
      ▼                   ▼                   ▼                   ▼                   ▼
  • Select tenant    • Add roles        • Upload CSV      • Add sources     • Review
  • First login        (strategist,       • Map fields      • Set keywords    • Activate
  • Change password    coordinator,       • Validate        • Configure       • Monitor
  • View dashboard     analyst, etc.)     • Import          alerts            metrics
```

**Touchpoints:**
1. Login with temporary password
2. Change password
3. Invite team members by role
4. Import voter database
5. Configure OSINT sources
6. Set up scorecard promises
7. Launch campaign activities

---

### Journey 3: Strategist - Data Analysis

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Login     │───▶│  Dashboard  │───▶│   Analyze   │───▶│  Scenario   │───▶│   Report    │
│             │    │             │    │    Data     │    │  Modeling   │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                   │                   │                   │                   │
      ▼                   ▼                   ▼                   ▼                   ▼
  • Login            • View KPIs        • Sentiment       • Coalition       • Generate
  • View alerts        trends             analysis          simulation      insights
  • Check briefs     • OSINT feed       • Voter             • Path to       • Share with
                       updates            segmentation        victory         admin
```

**Touchpoints:**
1. Login and view daily brief
2. Review sentiment trends
3. Analyze voter segmentation
4. Run coalition scenarios
5. Generate strategic reports
6. Present to campaign leadership

---

### Journey 4: Coordinator - Field Operations

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Login     │───▶│   Assign    │───▶│   Monitor   │───▶│   Review    │───▶│   Report    │
│             │    │ Territories │    │   Agents    │    │   Data      │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                   │                   │                   │                   │
      ▼                   ▼                   ▼                   ▼                   ▼
  • Login            • Map LGA/         • Track GPS       • Verify          • Daily
  • View team          ward               locations         submissions     summary
  • Check tasks        assignments      • View status     • Quality       • Escalate
  • Message team       • Set targets      • Communicate       check           issues
```

**Touchpoints:**
1. Login and view team status
2. Assign territories to field agents
3. Monitor agent locations and progress
4. Review submitted data
5. Verify and approve reports
6. Generate field reports

---

### Journey 5: Field Agent - Canvassing

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Mobile App  │───▶│   Receive   │───▶│   Visit     │───▶│   Submit    │───▶│   Sync      │
│   Login     │    │   Tasks     │    │   Voters    │    │    Data     │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                   │                   │                   │                   │
      ▼                   ▼                   ▼                   ▼                   ▼
  • Phone login      • View daily       • Navigate to     • Record          • Upload
  • Offline mode       targets            location          responses       when online
  • GPS enable       • Get route        • Interview       • Take photos     • View
                       directions         household         • Tag location    progress
```

**Touchpoints:**
1. Login to mobile app
2. Download offline data
3. Receive daily targets
4. Navigate to households
5. Collect voter information
6. Submit data (sync when online)
7. View personal progress

---

### Journey 6: Monitor - Election Day

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Login     │───▶│   Check     │───▶│   Visit     │───▶│   Report    │───▶│   Follow    │
│             │    │ Assignment  │    │   Polling   │    │   Results   │    │    Up       │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                   │                   │                   │                   │
      ▼                   ▼                   ▼                   ▼                   ▼
  • Early morning    • View assigned    • Observe         • Submit          • Track
    login              polling units      opening           results           resolution
  • Get briefing     • Check route      • Monitor           • Report          • Update
    materials        • Contact info     process             incidents         status
```

**Touchpoints:**
1. Login on election morning
2. View assigned polling units
3. Navigate to first location
4. Observe opening procedures
5. Monitor throughout day
6. Submit results
7. Report incidents
8. Follow up on issues

---

## 📊 USER WORKFLOW DIAGRAMS

### Data Flow: Field Agent → Coordinator → Strategist

```
Field Agent                    Coordinator                  Strategist
    │                              │                            │
    │ 1. Collects voter data       │                            │
    │─────────────────────────────▶│                            │
    │                              │                            │
    │                              │ 2. Reviews & verifies      │
    │                              │───────────────────────────▶│
    │                              │                            │
    │                              │ 3. Approves data           │
    │◀─────────────────────────────│                            │
    │                              │                            │
    │                              │ 4. Aggregates to reports   │
    │                              │───────────────────────────▶│
    │                              │                            │
    │                              │                            │ 5. Analyzes trends
    │                              │                            │────┐
    │                              │                            │    │
    │                              │                            │◀───┘
    │                              │                            │
    │                              │◀───────────────────────────│ 6. Strategic insights
    │                              │                            │
    │◀─────────────────────────────│ 7. New targets assigned  │
    │                              │                            │
```

### Content Approval Workflow

```
Content Manager → Admin Review → Published
      │               │              │
      │ 1. Draft      │ 2. Review    │ 3. Live
      │               │              │
      ▼               ▼              ▼
   Create         Approve/       Public
   content         Reject         website
   Save draft      Request        Social
   Schedule        changes        media
```

---

## 🎯 USER PAIN POINTS & SOLUTIONS

| Pain Point | User | Solution |
|------------|------|----------|
| Can't work offline | Field Agent | Offline-first mobile app with sync |
| Too many notifications | Coordinator | Smart filtering, priority levels |
| Data entry errors | Analyst | Validation rules, duplicate detection |
| Slow report generation | Strategist | Cached dashboards, background processing |
| Can't track agent location | Coordinator | GPS tracking with privacy controls |
| Manual data export | Admin | Scheduled exports, API access |
| No mobile dashboard | Admin | Responsive design, mobile app |
| Complex navigation | All | Role-based menus, quick actions |

---

## 📱 DEVICE & ACCESS MATRIX

| Role | Desktop | Tablet | Mobile App | Offline |
|------|:-------:|:------:|:----------:|:-------:|
| Super Admin | ✅ | ✅ | ❌ | ❌ |
| Admin | ✅ | ✅ | 🔍 | ❌ |
| Strategist | ✅ | ✅ | 🔍 | ❌ |
| Coordinator | ✅ | ✅ | ✅ | 🔍 |
| Analyst | ✅ | ✅ | 🔍 | ❌ |
| Field Agent | 🔍 | ✅ | ✅ | ✅ |
| Monitor | 🔍 | ✅ | ✅ | 🔍 |
| Content Manager | ✅ | ✅ | 🔍 | ❌ |
| Finance Manager | ✅ | ✅ | 🔍 | ❌ |

---

## 🔐 SECURITY REQUIREMENTS BY ROLE

| Role | MFA Required | Session Timeout | IP Restrictions | Audit Level |
|------|:------------:|:---------------:|:---------------:|:-----------:|
| Super Admin | ✅ | 15 min | Optional | Full |
| Admin | ✅ | 30 min | Optional | Full |
| Strategist | 🔍 | 60 min | No | Standard |
| Coordinator | 🔍 | 60 min | No | Standard |
| Analyst | 🔍 | 60 min | No | Standard |
| Field Agent | ❌ | 7 days | No | Minimal |
| Monitor | ❌ | 24 hrs | No | Standard |
| Content Manager | 🔍 | 60 min | No | Standard |
| Finance Manager | ✅ | 30 min | Optional | Full |

---

## 📈 SUCCESS METRICS BY ROLE

| Role | Primary KPI | Secondary KPIs |
|------|-------------|----------------|
| Super Admin | Tenant uptime | Support tickets, Revenue |
| Admin | Team productivity | Voter contacts, Task completion |
| Strategist | Prediction accuracy | Report quality, Insights generated |
| Coordinator | Field coverage | Data quality, Agent retention |
| Analyst | Report accuracy | Data freshness, Query response time |
| Field Agent | Contacts per day | Data completeness, Accuracy rate |
| Monitor | Incidents reported | Response time, Coverage % |
| Content Manager | Engagement rate | Content velocity, Reach |
| Finance Manager | Budget variance | Donation conversion, Expense control |

---

## ✅ USER MATRIX VALIDATION CHECKLIST

- [x] All roles defined with clear responsibilities
- [x] Permission matrix covers all features
- [x] User journeys mapped for primary workflows
- [x] Device access requirements specified
- [x] Security levels aligned with role sensitivity
- [x] Success metrics defined per role
- [x] Pain points identified with solutions
- [x] Data flow diagrams created

---

**Next Step:** Build User Management Module based on this matrix
