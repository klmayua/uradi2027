# URADI-360 UI/UX Implementation Checklist
# Based on URADI360_BUILD.yaml Specification
# Status: BUILD IN PROGRESS

## PHASE 1: FOUNDATION & SHELL (Week 1)

### Day 1: Project Setup & Design System
- [ ] Initialize Next.js 15 with shadcn/ui
- [ ] Install all dependencies (TanStack Query, Zustand, Recharts, Mapbox, Supabase)
- [ ] Configure Tailwind with URADI design system colors
- [ ] Set up folder structure (app, components, hooks, stores, lib)
- [ ] Create design tokens (colors, typography, spacing)
- [ ] Configure fonts (Inter, JetBrains Mono)
- [ ] Set up dark mode (default)

**Design System Implementation:**
- [ ] Color palette CSS variables:
  - [ ] --bg-primary: #0B1120 (midnight navy)
  - [ ] --bg-secondary: #111827 (cards/panels)
  - [ ] --bg-tertiary: #1F2937 (hover states)
  - [ ] --border: #374151
  - [ ] --text-primary: #F9FAFB
  - [ ] --text-secondary: #9CA3AF
  - [ ] --text-tertiary: #6B7280
  - [ ] --accent-gold: #C8A94E
  - [ ] --accent-gold-light: #E8D5A3
  - [ ] --accent-gold-dark: #A68B35
  - [ ] --status-positive: #10B981
  - [ ] --status-warning: #F59E0B
  - [ ] --status-critical: #EF4444
  - [ ] --status-neutral: #6366F1
  - [ ] --status-info: #3B82F6
- [ ] Typography classes:
  - [ ] font-heading: Inter (700, 600)
  - [ ] font-body: Inter (400, 500)
  - [ ] font-data: JetBrains Mono

### Day 2: Authentication Screens
**Task 1.3 - Login Page (YAML Lines 833-835):**
- [ ] Create login page layout
- [ ] Dark midnight theme background
- [ ] URADI-360 logo centered
- [ ] Gold accent elements
- [ ] Email/password form
- [ ] No social login (restricted internal tool)
- [ ] Form validation
- [ ] Error states
- [ ] Loading states
- [ ] "Forgot password" link
- [ ] Session persistence

### Day 3-4: App Shell Layout
**Task 1.3 - App Shell (YAML Lines 837-849):**

**Sidebar Component:**
- [ ] Width: w-64 (collapsible to w-16)
- [ ] Background: bg-primary (#0B1120)
- [ ] Sections with headers:
  - [ ] OVERVIEW
  - [ ] INTELLIGENCE
  - [ ] CONSTITUENTS
  - [ ] NARRATIVE
  - [ ] CAMPAIGN
  - [ ] ELECTION DAY
  - [ ] GOVERNANCE
  - [ ] SETTINGS
- [ ] Navigation items with icons + labels
- [ ] Active item styling:
  - [ ] Gold left border (border-l-4)
  - [ ] Gold text color
- [ ] Collapsed state:
  - [ ] Icon only
  - [ ] Tooltip on hover
- [ ] Toggle button
- [ ] Smooth animations

**Topbar Component:**
- [ ] Height: h-14
- [ ] Background: bg-secondary (#111827)
- [ ] Left: Breadcrumb navigation
- [ ] Center: Tenant selector dropdown
  - [ ] Gold pill styling
  - [ ] Options: Jigawa | Kano
  - [ ] Switch context on change
- [ ] Right:
  - [ ] Notification bell icon
  - [ ] Red badge count
  - [ ] User avatar menu
  - [ ] Dropdown with logout

**Command Palette:**
- [ ] Cmd+K trigger
- [ ] Modal overlay
- [ ] Search input
- [ ] Searchable items:
  - [ ] Voters by name/phone
  - [ ] LGAs
  - [ ] Wards
  - [ ] Reports
- [ ] Keyboard navigation (arrow keys, enter, escape)
- [ ] Recent searches

### Day 5: State Management & API Setup
- [ ] Configure Zustand stores:
  - [ ] authStore (user, tenant, login/logout)
  - [ ] tenantStore (currentTenant, setTenant)
  - [ ] uiStore (sidebarCollapsed, commandPaletteOpen)
- [ ] Set up TanStack Query:
  - [ ] Query client configuration
  - [ ] Default refetch intervals
- [ ] Configure Supabase client
- [ ] API client setup
- [ ] Protected routes middleware
- [ ] Tenant context provider

---

## PHASE 2: OVERVIEW DASHBOARD (Week 1-2)

### Day 6-7: KPI Cards & Layout
**Task 1.4 - KPI Cards (YAML Lines 874-877):**
- [ ] Row layout (4 cards across on desktop)
- [ ] Card component:
  - [ ] Background: bg-secondary
  - [ ] Border-left: 4px gold accent
  - [ ] Large number: JetBrains Mono
  - [ ] Label below
  - [ ] Sparkline trend chart (mini)
  - [ ] Color indicator (green/amber/red)
- [ ] Cards to implement:
  - [ ] Total Voter Contacts (e.g., 142,387)
  - [ ] Avg Sentiment (e.g., +12)
  - [ ] LGAs Won (proj) (e.g., 18/27)
  - [ ] Days to Election (e.g., 247)
- [ ] Responsive: Stack on mobile

### Day 8-10: State Map Component
**Task 1.4 - State Map (YAML Lines 879-884):**
- [ ] Mapbox GL JS integration
- [ ] Full-bleed container (70% width)
- [ ] Dark theme map style
- [ ] LGA boundaries from GeoJSON
- [ ] Choropleth coloring by sentiment:
  - [ ] Green: positive sentiment
  - [ ] Amber: neutral sentiment
  - [ ] Red: negative sentiment
- [ ] Interactive features:
  - [ ] Hover: tooltip with LGA name, sentiment, voter contacts
  - [ ] Click: drill-down panel slides from right
  - [ ] Drill-down shows ward breakdown
- [ ] Legend for color scale
- [ ] Loading state

### Day 11: Activity Feed
**Task 1.4 - Activity Feed (YAML Lines 886-890):**
- [ ] Container (30% width)
- [ ] Real-time updates via Supabase
- [ ] Activity items:
  - [ ] Icon per activity type
  - [ ] Text description
  - [ ] Relative timestamp ("2 min ago")
  - [ ] Link to detail
- [ ] Activity types:
  - [ ] New voter contacts
  - [ ] Sentiment alerts
  - [ ] Scorecard published
  - [ ] Incidents reported
- [ ] Auto-scroll to newest
- [ ] "Mark all as read"

### Day 12-13: Charts Section
**Task 1.4 - Charts Row (YAML Lines 892-895):**

**Sentiment Trend Chart (50% width):**
- [ ] Recharts line chart
- [ ] Dark background
- [ ] Multiple lines:
  - [ ] Overall sentiment
  - [ ] By LGA group
- [ ] Weekly data points
- [ ] Gold/green/red data series
- [ ] JetBrains Mono labels
- [ ] Tooltip on hover

**Top Issues Chart (25% width):**
- [ ] Horizontal bar chart
- [ ] Top 5 issues:
  - [ ] Security
  - [ ] Economy
  - [ ] Education
  - [ ] Infrastructure
  - [ ] Healthcare
- [ ] Sorted by frequency

**Party Leaning Breakdown (25% width):**
- [ ] Donut chart
- [ ] Party colors:
  - [ ] APC: #1E40AF
  - [ ] PDP: #DC2626
  - [ ] NNPP: #7C3AED
  - [ ] ADC: #059669
  - [ ] Undecided: #9CA3AF
- [ ] Percentage labels
- [ ] Legend

### Day 14: Dashboard Polish
- [ ] Loading skeletons
- [ ] Error boundaries
- [ ] Empty states
- [ ] Responsive breakpoints:
  - [ ] Desktop: 1440px+ (4 columns)
  - [ ] Tablet: 1024px (2 columns)
  - [ ] Mobile: <768px (1 column)
- [ ] Performance optimization
- [ ] 60s refetch interval

---

## PHASE 3: VOTER CRM (Week 2-3)

### Day 15-17: Voter List Table
**Task 1.5 - Voter List (YAML Lines 916-925):**
- [ ] TanStack Table implementation
- [ ] Columns:
  - [ ] Name
  - [ ] Phone
  - [ ] LGA
  - [ ] Ward
  - [ ] Sentiment (-100 to +100 with color bar)
  - [ ] Persuadability (0-100)
  - [ ] Party Leaning (colored pill)
  - [ ] Last Contacted
  - [ ] Source
- [ ] Full-text search:
  - [ ] By name
  - [ ] By phone
- [ ] Filters:
  - [ ] LGA dropdown
  - [ ] Sentiment range slider
  - [ ] Party leaning multi-select
  - [ ] Source multi-select
  - [ ] Persuadability range
- [ ] Bulk actions:
  - [ ] Send SMS
  - [ ] Send WhatsApp
  - [ ] Add tag
  - [ ] Export CSV
- [ ] Pagination:
  - [ ] 50 per page
  - [ ] Infinite scroll option
- [ ] Total count header
- [ ] Sortable columns
- [ ] Sticky header
- [ ] Striped rows

### Day 18-19: Add Voter Form
**Task 1.5 - Add Voter (YAML Lines 927-932):**
- [ ] Slide-out panel (right side)
- [ ] Form fields:
  - [ ] Name (required)
  - [ ] Phone (+234 validation)
  - [ ] Ward (cascading: State → LGA → Ward)
  - [ ] Gender (select)
  - [ ] Age range (select)
  - [ ] Occupation (text)
  - [ ] Language preference (ha/ff/en)
  - [ ] Contact preference (ussd/whatsapp/sms/door)
  - [ ] Party leaning (select)
  - [ ] Issues (multi-select)
  - [ ] Source (select)
  - [ ] Notes (textarea)
- [ ] Duplicate detection:
  - [ ] Check phone number
  - [ ] Show warning if exists
- [ ] "Add & Next" button
- [ ] Form validation
- [ ] Success toast

### Day 20: Voter Detail Page
**Task 1.5 - Voter Detail (YAML Lines 934-940):**
- [ ] Route: /constituents/voters/[id]
- [ ] Header:
  - [ ] Name
  - [ ] Phone
  - [ ] Sentiment badge
  - [ ] Persuadability gauge
- [ ] Contact history timeline
- [ ] Sentiment history chart
- [ ] Issues mentioned
- [ ] Field agent notes
- [ ] "Send message" button
- [ ] Edit inline
- [ ] Back button

### Day 21: Voter Import
**Task 1.5 - CSV Import (YAML Line 943):**
- [ ] CSV upload button
- [ ] Column mapping dialog
- [ ] Preview before import
- [ ] Progress indicator
- [ ] Error handling
- [ ] Success confirmation
- [ ] Process 1000+ records

---

## PHASE 4: ANCHOR CITIZENS & YOUTH (Week 3)

### Day 22-23: Anchor Citizens
**Task 1.6 (YAML Lines 960-964):**
- [ ] Data table with columns:
  - [ ] Name
  - [ ] LGA
  - [ ] Ward
  - [ ] Influence Level (high/med/low badge)
  - [ ] Community Role
  - [ ] Reports Submitted
  - [ ] Last Report
  - [ ] Stipend Status
  - [ ] Active
- [ ] Detail view:
  - [ ] Profile
  - [ ] Submitted reports list
  - [ ] Stipend payment history
- [ ] Map view:
  - [ ] Show all anchor citizens
  - [ ] Influence-level markers

### Day 24: Youth Ambassadors
**Task 1.6 (YAML Lines 966-969):**
- [ ] Data table with columns:
  - [ ] Name
  - [ ] LGA
  - [ ] Campus
  - [ ] TikTok handle
  - [ ] Instagram handle
  - [ ] Content Produced
  - [ ] Events Coordinated
  - [ ] Training Status
  - [ ] Stipend Status
  - [ ] Active
- [ ] Detail view:
  - [ ] Profile
  - [ ] Content portfolio
  - [ ] Event history
- [ ] "Assign to LGA" action

---

## PHASE 5: SENTIMENT & INTELLIGENCE (Week 3-4)

### Day 25-26: Sentiment Dashboard
**Task 1.7 (YAML Lines 984-998):**
- [ ] State-wide sentiment gauge (-100 to +100)
- [ ] Trend line (sentiment over time)
- [ ] LGA heatmap
- [ ] Source breakdown (pie chart)
- [ ] Sentiment by LGA table:
  - [ ] LGA name
  - [ ] Avg Score
  - [ ] Trend (sparkline)
  - [ ] Entries Count
  - [ ] Top Issue
- [ ] Raw sentiment feed:
  - [ ] Reverse-chronological
  - [ ] Source icon
  - [ ] Ward
  - [ ] Raw text
  - [ ] AI-analyzed score
  - [ ] Category
- [ ] Filters:
  - [ ] LGA
  - [ ] Category
  - [ ] Source
  - [ ] Date range
  - [ ] Score range

### Day 27-28: Political Atlas
**Task 2.1 (YAML Lines 1148-1168):**
- [ ] Political actors table:
  - [ ] Name
  - [ ] Title
  - [ ] Party (colored pill)
  - [ ] LGA
  - [ ] Influence Type
  - [ ] Influence Level (1-10 bar)
  - [ ] Loyalty (badge)
  - [ ] Faction
  - [ ] Last Assessed
- [ ] Filters:
  - [ ] Party
  - [ ] Loyalty
  - [ ] Influence type
  - [ ] LGA
  - [ ] Faction
- [ ] Network graph visualization:
  - [ ] Force-directed graph
  - [ ] Nodes sized by influence
  - [ ] Node colors by loyalty
  - [ ] Edges for connections
  - [ ] Click node: popup detail
  - [ ] Export as PNG/PDF
- [ ] LGA power map:
  - [ ] Dominant party coloring
  - [ ] Top 5 actors per LGA

### Day 29-30: Scenarios
**Task 2.2 (YAML Lines 1178-1199):**
- [ ] Scenario cards:
  - [ ] Title
  - [ ] Probability (large %)
  - [ ] Description
  - [ ] Impact badge
  - [ ] Vote projection bar chart
  - [ ] Our response plan
  - [ ] Status
- [ ] Scenario comparison view:
  - [ ] Side-by-side table
  - [ ] Stacked bar chart
  - [ ] Sensitivity analysis
- [ ] Electoral projection dashboard:
  - [ ] State map
  - [ ] LGA coloring by projected winner
  - [ ] Total projected votes
  - [ ] Confidence interval
- [ ] Kwankwaso Scenario Matrix (Kano-specific)

---

## PHASE 6: NARRATIVE & CAMPAIGN (Week 4)

### Day 31-32: Scorecards
**Task 2.4 (YAML Lines 1226-1249):**
- [ ] Scorecard list:
  - [ ] Cards per issue
  - [ ] Title, period, status
  - [ ] Published date
- [ ] Scorecard builder:
  - [ ] Period selector
  - [ ] Metric categories:
    - [ ] Fiscal Transparency
    - [ ] Security
    - [ ] Infrastructure
    - [ ] Economic Development
    - [ ] Education
    - [ ] Health
  - [ ] Per category:
    - [ ] Metric name
    - [ ] Current value
    - [ ] Benchmark value
    - [ ] Grade (A-F auto-calculated)
  - [ ] Rich text editor
  - [ ] Auto-generate infographic
  - [ ] Preview mode
  - [ ] Publish (generates PDF)
- [ ] Scorecard archive
- [ ] Trend charts

### Day 33-34: Content Pipeline
**Task 2.5 (YAML Lines 1258-1271):**
- [ ] Content table:
  - [ ] Type
  - [ ] Platform
  - [ ] Language
  - [ ] Status
  - [ ] Scheduled
  - [ ] Engagement
- [ ] Content editor:
  - [ ] Rich text
  - [ ] Character limit for SMS/USSD
  - [ ] Media upload
  - [ ] Schedule
  - [ ] Multi-language
- [ ] Broadcast messaging:
  - [ ] Channel select (USSD/SMS/WhatsApp)
  - [ ] Audience filter
  - [ ] Estimated reach
  - [ ] Compose message
  - [ ] Schedule/send
  - [ ] Track delivery/read/reply

### Day 35-36: Micro-Targeting
**Task 2.8 (YAML Lines 1335-1363):**
- [ ] Segment builder:
  - [ ] Visual query builder
  - [ ] Filters:
    - [ ] LGA
    - [ ] Ward
    - [ ] Sentiment range
    - [ ] Persuadability range
    - [ ] Party leaning
    - [ ] Age
    - [ ] Gender
    - [ ] Issues
    - [ ] Contact history
  - [ ] Real-time count
  - [ ] Save segment
- [ ] Target map:
  - [ ] State map colored by segment density
  - [ ] Ward-level distribution
  - [ ] Priority wards highlighting
- [ ] Message recommendations:
  - [ ] AI-generated messaging
  - [ ] 3 variants in Hausa
  - [ ] Review and edit
  - [ ] One-click send
- [ ] Resource optimizer:
  - [ ] LGA scoring algorithm
  - [ ] Prioritized LGA list
  - [ ] Budget allocation suggestion

---

## PHASE 7: ELECTION DAY (Week 5)

### Day 37-39: Monitor Mode
**Task 3.5 (YAML Lines 1458-1489):**
- [ ] Monitor check-in:
  - [ ] Assigned polling unit display
  - [ ] GPS verification (within 200m)
  - [ ] Selfie capture
  - [ ] Check-in timestamp
  - [ ] Status indicator
- [ ] Accreditation tracker:
  - [ ] Manual counter
  - [ ] Running total
  - [ ] Submit count
- [ ] Vote tally entry:
  - [ ] Votes per party
  - [ ] Auto-calculate total
  - [ ] Validate against accredited
  - [ ] Photo capture (mandatory)
  - [ ] Submit tally
- [ ] Incident reporting:
  - [ ] Quick types:
    - [ ] Violence
    - [ ] Irregularity
    - [ ] Delay
    - [ ] Intimidation
    - [ ] Material shortage
    - [ ] Bribe attempt
  - [ ] Photo/video capture
  - [ ] GPS + timestamp
  - [ ] Severity auto-escalation
- [ ] Status indicators:
  - [ ] My unit status
  - [ ] Network status
  - [ ] Sync status

### Day 40-42: Command Center Dashboard
**Task 3.6 (YAML Lines 1496-1519):**
- [ ] Monitor status board:
  - [ ] Map: all polling units
  - [ ] Color by status
  - [ ] Stats: checked in, results received, incidents
  - [ ] Table: monitor list
- [ ] Real-time results aggregation (PVT):
  - [ ] Auto-aggregate by ward/LGA/state
  - [ ] Running projection
  - [ ] LGA-by-LGA results map
  - [ ] Actual vs projected variance
- [ ] Incident map:
  - [ ] Live map of incidents
  - [ ] Color by severity
  - [ ] Incident list
  - [ ] Acknowledge/Escalate actions
  - [ ] Critical alerts (full-screen)
- [ ] Results verification:
  - [ ] Side-by-side comparison
  - [ ] Variance flagging
  - [ ] Photo evidence viewer

---

## PHASE 8: GOVERNANCE MODE (Week 6)

### Day 43-44: Citizen Service CRM
**Task 4.4 (YAML Lines 1631-1647):**
- [ ] Feedback inbox:
  - [ ] Ticketing interface
  - [ ] Columns: date, LGA, ward, category, message, status
  - [ ] Status workflow
  - [ ] Assignment routing
  - [ ] SLA tracking
- [ ] Resolution dashboard:
  - [ ] KPIs: total, open, avg time, satisfaction
  - [ ] By sector breakdown
  - [ ] By LGA breakdown
  - [ ] Trend analysis
- [ ] Public feedback portal:
  - [ ] Status tracking
  - [ ] Anonymous reference number

### Day 45-46: Security Coordination
**Task 4.5 (YAML Lines 1654-1671):**
- [ ] Incident map (live):
  - [ ] Security reports on map
  - [ ] Clustering
  - [ ] Heat zones
  - [ ] Time filter (24h/7d/30d)
- [ ] Pattern analysis:
  - [ ] AI-assisted detection
  - [ ] Category breakdown
  - [ ] Time-of-day analysis
- [ ] Early warning alerts:
  - [ ] Threshold-based alerts
  - [ ] Sentiment-based alerts
  - [ ] Push notifications

---

## PHASE 9: RAPID RESPONSE & POLLS (Week 6)

### Day 47-48: Rapid Response
**Task 4.6 (YAML Lines 1681-1697):**
- [ ] Incident log:
  - [ ] Table: trigger, severity, source, response, time
  - [ ] Create new response
  - [ ] Timer tracking
- [ ] Response builder:
  - [ ] AI-assisted suggestions
  - [ ] 3 response options
  - [ ] Channel selection
  - [ ] One-click deploy
- [ ] Response analytics:
  - [ ] Average response time
  - [ ] Attack vectors
  - [ ] Effectiveness metrics

### Day 49-50: Polls & Surveys
**Task 4.7 (YAML Lines 1706-1723):**
- [ ] Create poll:
  - [ ] Question text (multi-language)
  - [ ] Answer options (2-5)
  - [ ] Target: LGAs, demographics
  - [ ] Channel: USSD, WhatsApp, field
  - [ ] Duration
- [ ] Deploy poll:
  - [ ] USSD push
  - [ ] WhatsApp broadcast
  - [ ] Field app
- [ ] Results dashboard:
  - [ ] Real-time count
  - [ ] Bar chart
  - [ ] Cross-tabulation
  - [ ] Geographic distribution

---

## PHASE 10: POLISH & DEPLOYMENT (Week 7-8)

### Week 7: Polish
- [ ] Loading skeletons on all pages
- [ ] Error boundaries
- [ ] Empty states
- [ ] Keyboard navigation
- [ ] Toasts for mutations
- [ ] Responsive tweaks
- [ ] Performance optimization
- [ ] Lazy loading
- [ ] Virtualized tables
- [ ] Favicon, OG images
- [ ] Page titles

### Week 8: Testing & Deployment
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance audit (Lighthouse 90+)
- [ ] Security audit
- [ ] Cross-browser testing
- [ ] Deploy to Vercel
- [ ] Configure domain
- [ ] SSL certificates
- [ ] Monitoring setup

---

## TOTAL SCOPE

**Estimated Timeline:** 8 weeks (2 months)
**Components:** 150+
**Screens:** 50+
**API Integrations:** 23 modules
**Complex Features:** Maps, Charts, Real-time, AI

**Team Required:**
- 2 Senior React/Next.js developers
- 1 UI/UX designer (for refinements)
- 1 QA engineer (week 7-8)

**Budget Estimate:** $15,000-25,000

---

## STATUS TRACKING

- [x] Phase 1: Foundation (Backend Complete)
- [ ] Phase 2: Shell & Dashboard
- [ ] Phase 3: Voter CRM
- [ ] Phase 4: Anchor Citizens
- [ ] Phase 5: Sentiment & Intelligence
- [ ] Phase 6: Narrative & Campaign
- [ ] Phase 7: Election Day
- [ ] Phase 8: Governance
- [ ] Phase 9: Rapid Response
- [ ] Phase 10: Polish & Deploy

**Current Status:** READY TO START PHASE 2
