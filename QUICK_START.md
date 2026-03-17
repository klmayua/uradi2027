# URADI-360 Quick Start Guide

## Getting Started

```bash
cd apps/command-center
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Project Structure

```
app/                    # Next.js App Router pages
components/             # React components
├── ui/                # shadcn/ui components (to be added)
├── layout/            # Layout components
├── charts/            # Chart components
├── maps/             # Mapbox components
stores/                # Zustand state stores
├── authStore.ts       # Authentication
├── tenantStore.ts     # Multi-tenant
└── uiStore.ts         # UI state
lib/                   # Utilities
├── api.ts            # API client
└── utils.ts          # Helper functions
hooks/                 # Custom React hooks
├── useData.ts        # Data fetching
└── useAuth.ts        # Auth hooks
types/                 # TypeScript types
└── index.ts          # All types
```

---

## Design System

### Colors
```tsx
// Backgrounds
bg-uradi-bg-primary      // #0B1120 (main bg)
bg-uradi-bg-secondary    // #111827 (cards)
bg-uradi-bg-tertiary     // #1F2937 (hover)

// Text
text-uradi-text-primary    // #F9FAFB
text-uradi-text-secondary  // #9CA3AF
text-uradi-text-tertiary  // #6B7280

// Accent
text-uradi-gold           // #C8A94E
bg-uradi-gold
border-uradi-gold

// Status
text-uradi-status-positive   // #10B981 (green)
text-uradi-status-warning    // #F59E0B (amber)
text-uradi-status-critical   // #EF4444 (red)
```

### Typography
```tsx
// Font families
font-sans    // Inter (body)
font-mono    // JetBrains Mono (data)

// Usage
<p className="font-mono text-2xl">142,387</p>  // Numbers
<h1 className="font-sans font-bold">Title</h1>  // Headings
```

---

## State Management

### Auth Store
```tsx
import { useAuthStore } from '@/stores/authStore';

const { user, login, logout } = useAuthStore();

// Login
await login(email, password);

// Logout
logout();
```

### Tenant Store
```tsx
import { useTenantStore } from '@/stores/tenantStore';

const { currentTenant, setTenant } = useTenantStore();

// Switch tenant
setTenant('kano');  // 'jigawa' | 'kano'
```

### UI Store
```tsx
import { useUIStore } from '@/stores/uiStore';

const { sidebarCollapsed, toggleSidebar, setCommandPaletteOpen } = useUIStore();

// Toggle command palette
setCommandPaletteOpen(true);  // or Cmd+K
```

---

## Data Fetching

### Using Hooks
```tsx
import { useVoters, useDashboardOverview } from '@/hooks/useData';

// Dashboard
const { data: dashboard, isLoading } = useDashboardOverview();

// Voters with filters
const { data: voters } = useVoters({
  lga_id: 'jigawa-dutse',
  sentiment_min: 50,
  page: 1,
  page_size: 50,
});
```

### API Client
```tsx
import { api } from '@/lib/api';

// Direct API calls
const voters = await api.voters.list({ lga_id: 'jigawa-dutse' });
const sentiment = await api.sentiment.trend(30);
```

---

## Creating a New Page

1. Create directory:
```bash
mkdir -p app/constituents/voters
```

2. Create page:
```tsx
// app/constituents/voters/page.tsx
export default function VotersPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-uradi-text-primary">
        Voter CRM
      </h1>
    </div>
  );
}
```

3. Add to Sidebar navigation in `components/Sidebar.tsx`

---

## Adding shadcn Components

```bash
npx shadcn add button
npx shadcn add card
npx shadcn add input
npx shadcn add table
npx shadcn add dialog
npx shadcn add dropdown-menu
npx shadcn add select
npx shadcn add tabs
npx shadcn add badge
npx shadcn add avatar
npx shadcn add sheet
npx shadcn add scroll-area
npx shadcn add tooltip
npx shadcn add popover
```

---

## Git Workflow

### Branch Naming
```
feature/voter-crm-table
bugfix/sidebar-active-state
hotfix/auth-redirect
```

### Commits
```bash
git commit -m "feat(voters): add data table with pagination"
git commit -m "fix(auth): resolve token refresh issue"
git commit -m "docs(api): update endpoint documentation"
```

---

## Common Patterns

### Card Component
```tsx
<div className="bg-uradi-bg-secondary border border-uradi-border rounded-xl p-6">
  <h2 className="text-lg font-semibold text-uradi-text-primary mb-4">Title</h2>
  {/* Content */}
</div>
```

### KPI Card
```tsx
<div className="bg-uradi-bg-secondary border-l-4 border-uradi-gold rounded-xl p-6">
  <p className="text-uradi-text-secondary text-sm">Label</p>
  <p className="text-3xl font-bold text-uradi-text-primary font-mono">
    142,387
  </p>
</div>
```

### Loading State
```tsx
const { data, isLoading } = useVoters();

if (isLoading) {
  return <div className="animate-pulse h-32 bg-uradi-bg-secondary rounded-xl" />;
}
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Open Command Palette |
| `Esc` | Close modals/panels |
| `Cmd+\` | Toggle Sidebar |

---

## Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

---

## Troubleshooting

### Port already in use
```bash
npx kill-port 3000
npm run dev
```

### TypeScript errors
```bash
npx tsc --noEmit
```

### Clear Next.js cache
```bash
rm -rf .next
npm run dev
```

---

## Resources

- **Design Spec:** `URADI360_BUILD.yaml` (Part 3: Design System)
- **Workflow:** `WORKFLOW_STACK.md`
- **API Docs:** Backend README in `backend/`
- **Component Library:** https://ui.shadcn.com

---

## Next Priority Tasks

1. Initialize shadcn/ui components
2. Connect dashboard to real APIs
3. Build Voter CRM table
4. Add Mapbox integration
5. Create remaining pages

See `WORKFLOW_STACK.md` for full implementation phases.
