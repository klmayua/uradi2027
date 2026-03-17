# URADI-360 Command Center Frontend
# Next.js 15 + Tailwind CSS + shadcn/ui
# Week 2-3 Implementation Plan

## Project Structure

```
apps/command-center/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                    # Overview Dashboard
│   │   │   ├── overview/
│   │   │   │   └── page.tsx
│   │   │   ├── intelligence/
│   │   │   │   ├── political-atlas/
│   │   │   │   ├── opposition/
│   │   │   │   ├── coalition/
│   │   │   │   └── scenarios/
│   │   │   ├── constituents/
│   │   │   │   ├── voters/
│   │   │   │   ├── anchor-citizens/
│   │   │   │   └── sentiment/
│   │   │   ├── narrative/
│   │   │   │   ├── scorecard/
│   │   │   │   ├── content/
│   │   │   │   └── messaging/
│   │   │   ├── campaign/
│   │   │   │   ├── micro-targeting/
│   │   │   │   ├── rapid-response/
│   │   │   │   └── polls/
│   │   │   ├── election-day/
│   │   │   │   ├── monitors/
│   │   │   │   ├── results/
│   │   │   │   └── incidents/
│   │   │   └── governance/
│   │   │       ├── budget-tracker/
│   │   │       ├── citizen-feedback/
│   │   │       └── security/
│   │   ├── api/
│   │   │   └── auth/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   ├── CommandPalette.tsx
│   │   │   └── DashboardShell.tsx
│   │   ├── charts/
│   │   │   ├── SentimentChart.tsx
│   │   │   ├── VoteProjectionChart.tsx
│   │   │   └── KPICard.tsx
│   │   ├── maps/
│   │   │   ├── StateMap.tsx
│   │   │   └── LGAMap.tsx
│   │   └── tables/
│   │       ├── VoterTable.tsx
│   │       └── DataTable.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── api.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useVoters.ts
│   │   ├── useSentiment.ts
│   │   └── useRealtime.ts
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── tenantStore.ts
│   │   └── uiStore.ts
│   └── types/
│       ├── index.ts
│       └── api.ts
├── public/
├── tailwind.config.ts
├── next.config.js
└── package.json
```

## Installation Commands

```bash
# Create Next.js app with shadcn
echo "my-app" | npx shadcn@latest init --yes --template next --base-color zinc

# Install shadcn components
npx shadcn add button card input table dialog dropdown-menu
npx shadcn add select tabs badge avatar separator
npx shadcn add sheet scroll-area tooltip popover
npx shadcn add chart

# Install additional dependencies
npm install @tanstack/react-query zustand recharts mapbox-gl react-map-gl
npm install @supabase/supabase-js @supabase/ssr
npm install date-fns cmdk lucide-react
npm install tailwindcss-animate class-variance-authority clsx tailwind-merge

# Dev dependencies
npm install -D @types/mapbox-gl @types/node @types/react @types/react-dom
```

## Design System

### Colors (from YAML)
```css
:root {
  /* Background */
  --bg-primary: #0B1120;        /* Midnight navy */
  --bg-secondary: #111827;    /* Cards, panels */
  --bg-tertiary: #1F2937;     /* Hover states */
  --border: #374151;          /* Subtle borders */
  
  /* Text */
  --text-primary: #F9FAFB;    /* White text */
  --text-secondary: #9CA3AF;  /* Muted text */
  --text-tertiary: #6B7280;   /* Hints, labels */
  
  /* Accent */
  --accent-gold: #C8A94E;       /* URADI brand gold */
  --accent-gold-light: #E8D5A3;
  --accent-gold-dark: #A68B35;
  
  /* Status */
  --status-positive: #10B981;   /* Green - favorable */
  --status-warning: #F59E0B;    /* Amber - watch */
  --status-critical: #EF4444;   /* Red - critical */
  --status-neutral: #6366F1;   /* Indigo - neutral */
  --status-info: #3B82F6;      /* Blue - info */
  
  /* Party Colors */
  --party-apc: #1E40AF;
  --party-pdp: #DC2626;
  --party-nnpp: #7C3AED;
}
```

### Typography
```css
font-family: 'Inter', sans-serif;           /* Body */
font-family: 'JetBrains Mono', monospace; /* Data/Numbers */
```

## Key Components

### 1. Layout Components

#### Sidebar.tsx
```typescript
// Collapsible sidebar with sections
// Sections: OVERVIEW, INTELLIGENCE, CONSTITUENTS, NARRATIVE, CAMPAIGN, ELECTION DAY, GOVERNANCE, SETTINGS
// Active item: gold left border + gold text
// Collapsed: icon only with tooltip
```

#### Topbar.tsx
```typescript
// Height: h-14
// Left: Breadcrumb navigation
// Center: Tenant selector dropdown (Jigawa | Kano) - gold pill
// Right: Notification bell (badge count), user avatar menu
```

#### CommandPalette.tsx
```typescript
// Cmd+K opens search dialog
// Search: voters by name/phone, LGAs, wards, reports
// Uses cmdk library
```

### 2. Dashboard Components

#### Overview Dashboard (Home)
```typescript
// ROW 1 - KPI Cards (4 across):
// [Total Voter Contacts] [Avg Sentiment] [LGAs Won (proj)] [Days to Election]

// ROW 2 - State Map + Activity Feed (70% | 30%):
// Left: Interactive Mapbox map with LGA choropleth
// Right: Real-time activity feed (Supabase Realtime)

// ROW 3 - Sentiment Trend + Top Issues + Party Leaning (50% | 25% | 25%)
```

#### Voter CRM
```typescript
// Data table with columns:
// Name, Phone, LGA, Ward, Sentiment (-100 to +100), Persuadability, Party Leaning, Last Contacted

// Features:
// - Full-text search
// - Filters: LGA, sentiment range, party leaning
// - Bulk actions: send SMS, WhatsApp, tag, export CSV
// - Pagination: 50 per page
// - Add voter form (slide-out panel)
```

### 3. Map Components

#### StateMap.tsx
```typescript
// Mapbox GL JS integration
// LGA boundaries from GeoJSON
// Choropleth coloring by sentiment score
// Click LGA → drill-down panel
// Hover → tooltip with stats
```

### 4. Chart Components

#### SentimentChart.tsx
```typescript
// Recharts line chart
// Dark background
// Gold/green/red data series
// JetBrains Mono labels
```

#### KPICard.tsx
```typescript
// Large JetBrains Mono number
// Label below
// Sparkline trend chart
// Color indicator vs target
```

## State Management (Zustand)

```typescript
// stores/authStore.ts
interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setTenant: (tenant: Tenant) => void;
}

// stores/tenantStore.ts
interface TenantState {
  currentTenant: Tenant;
  setTenant: (tenant: Tenant) => void;
}

// stores/uiStore.ts
interface UIState {
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  toggleSidebar: () => void;
  toggleCommandPalette: () => void;
}
```

## Data Fetching (TanStack Query)

```typescript
// hooks/useVoters.ts
export function useVoters(filters: VoterFilters) {
  return useQuery({
    queryKey: ['voters', filters],
    queryFn: () => fetchVoters(filters),
    refetchInterval: 60000, // 60 seconds
  });
}

// hooks/useSentiment.ts
export function useSentiment() {
  return useQuery({
    queryKey: ['sentiment'],
    queryFn: fetchSentimentData,
    refetchInterval: 30000, // 30 seconds
  });
}

// hooks/useRealtime.ts
export function useRealtimeActivity() {
  useEffect(() => {
    const subscription = supabase
      .channel('activity')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log' }, callback)
      .subscribe();
    
    return () => subscription.unsubscribe();
  }, []);
}
```

## API Integration

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchVoters(filters: VoterFilters) {
  const response = await fetch(`${API_URL}/api/voters?${new URLSearchParams(filters)}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'X-Tenant-ID': getTenantId(),
    },
  });
  return response.json();
}

export async function fetchDashboardOverview() {
  const response = await fetch(`${API_URL}/api/dashboard/overview`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  return response.json();
}
```

## Responsive Breakpoints

```css
/* Mobile First */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */

/* Dashboard optimized for 1440px+ */
/* Tablet-friendly for field coordinators */
```

## Performance Targets

```
Dashboard load: < 2 seconds
Map render: < 1 second
Table search: < 500ms
Real-time updates: < 100ms latency
Lighthouse score: 90+
```

## Week 2 Tasks

### Day 1-2: Project Setup
- [ ] Initialize Next.js with shadcn
- [ ] Install all dependencies
- [ ] Configure Tailwind with custom colors
- [ ] Set up folder structure
- [ ] Configure Supabase client

### Day 3-4: Layout Components
- [ ] Sidebar with navigation
- [ ] Topbar with tenant selector
- [ ] Command palette (Cmd+K)
- [ ] Dashboard shell layout
- [ ] Responsive design

### Day 5-7: Auth & Overview Dashboard
- [ ] Login page
- [ ] Authentication flow
- [ ] KPI cards component
- [ ] Activity feed
- [ ] State map integration

## Week 3 Tasks

### Day 8-10: Voter CRM
- [ ] Voter list table
- [ ] Search and filters
- [ ] Add voter form
- [ ] Voter detail page
- [ ] Bulk actions

### Day 11-12: Intelligence Modules
- [ ] Political Atlas page
- [ ] Scenarios page
- [ ] Coalition dashboard

### Day 13-14: Polish & Integration
- [ ] Loading states
- [ ] Error boundaries
- [ ] Empty states
- [ ] Keyboard shortcuts
- [ ] Performance optimization

## Environment Variables

```env
NEXT_PUBLIC_API_URL=https://uradi360-api.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

## Build Commands

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start
```

## Deployment

```bash
# Vercel
vercel --prod

# Environment
NEXT_PUBLIC_API_URL=https://uradi360-api.up.railway.app
```
