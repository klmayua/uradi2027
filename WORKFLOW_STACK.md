# URADI-360 Professional Workflow Stack

## Overview

This document defines the professional development workflow for the URADI-360 project. It ensures consistent code quality, maintainable architecture, and efficient team collaboration.

---

## 1. Project Architecture

### Monorepo Structure
```
Uradi360_Build/
├── apps/
│   ├── command-center/          # Next.js 15 - Strategist Dashboard
│   │   ├── src/
│   │   │   ├── app/             # App Router (pages)
│   │   │   ├── components/        # React components
│   │   │   │   ├── ui/          # shadcn/ui components
│   │   │   │   ├── layout/      # Shell components
│   │   │   │   ├── charts/      # Recharts wrappers
│   │   │   │   ├── maps/        # Mapbox components
│   │   │   │   └── data/        # Tables, cards
│   │   │   ├── hooks/           # Custom React hooks
│   │   │   ├── lib/             # Utilities, API clients
│   │   │   ├── stores/          # Zustand stores
│   │   │   └── types/           # TypeScript types
│   │   └── public/
│   ├── field-app/               # Expo - Mobile (future)
│   └── citizen-portal/          # Next.js - Public (future)
├── backend/                     # FastAPI - Complete
└── packages/                    # Shared packages (future)
```

### Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand
- **Data:** TanStack Query + Supabase
- **Charts:** Recharts
- **Maps:** Mapbox GL JS
- **Icons:** Lucide React

---

## 2. Git Workflow

### Branch Strategy
```
main                    # Production-ready code
├── develop             # Integration branch
├── feature/*           # Feature branches
├── bugfix/*            # Bug fix branches
└── hotfix/*            # Emergency fixes
```

### Branch Naming
- Features: `feature/voter-crm-table`
- Bugs: `bugfix/sidebar-active-state`
- Hotfixes: `hotfix/auth-redirect`

### Commit Convention
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting (no code change)
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance tasks

**Examples:**
```
feat(dashboard): add KPI cards with sparklines
fix(auth): resolve token refresh race condition
docs(api): update voter endpoints documentation
style(components): format Sidebar indentation
```

### Pull Request Process
1. Create feature branch from `develop`
2. Make commits following convention
3. Open PR to `develop` branch
4. Require 1 review approval
5. All checks must pass (lint, type-check, build)
6. Squash and merge

---

## 3. Code Standards

### File Naming
- Components: `PascalCase.tsx` (e.g., `Sidebar.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useAuth.ts`)
- Utils: `camelCase.ts` (e.g., `apiClient.ts`)
- Types: `PascalCase.ts` or `types.ts`

### Component Structure
```typescript
// 1. Imports (ordered: React, external, internal)
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';

// 2. Types
interface DashboardProps {
  tenantId: string;
}

// 3. Component
export function Dashboard({ tenantId }: DashboardProps) {
  // Hooks first
  const { user } = useAuthStore();
  const { data } = useDashboardData(tenantId);

  // State
  const [isLoading, setIsLoading] = useState(false);

  // Handlers
  const handleRefresh = () => {
    setIsLoading(true);
    // ...
  };

  // Render
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}

// 4. Default export (if needed)
export default Dashboard;
```

### Tailwind Class Order
1. Layout (display, position, flex, grid)
2. Sizing (width, height)
3. Spacing (margin, padding)
4. Typography (font, text, leading)
5. Visuals (bg, border, shadow)
6. Interactive (hover, focus, active)

```tsx
// Good
<div className="flex h-full w-full flex-col gap-4 p-6 text-sm text-white bg-uradi-bg-secondary hover:bg-uradi-bg-tertiary">

// Bad (unordered)
<div className="text-white p-6 flex bg-uradi-bg-secondary hover:bg-uradi-bg-tertiary h-full w-full gap-4 text-sm flex-col">
```

### Design System Usage
```typescript
// Colors - Always use design tokens
const colors = {
  bg: {
    primary: 'bg-uradi-bg-primary',      // #0B1120
    secondary: 'bg-uradi-bg-secondary',  // #111827
    tertiary: 'bg-uradi-bg-tertiary',    // #1F2937
  },
  accent: {
    gold: 'text-uradi-gold',             // #C8A94E
  },
  status: {
    positive: 'text-uradi-status-positive',  // #10B981
    warning: 'text-uradi-status-warning',      // #F59E0B
    critical: 'text-uradi-status-critical',  // #EF4444
  }
};

// Typography
const typography = {
  heading: 'font-sans font-bold',
  body: 'font-sans font-normal',
  data: 'font-mono',  // JetBrains Mono
};
```

---

## 4. Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal:** Working shell with authentication

- [ ] Day 1-2: Fix existing code, set up shadcn/ui
- [ ] Day 3-4: Implement stores (auth, tenant, ui)
- [ ] Day 5: Build Command Palette
- [ ] Day 6-7: Connect to backend APIs

**Deliverable:** Login → Dashboard flow working

### Phase 2: Dashboard (Week 2)
**Goal:** Complete overview dashboard

- [ ] Day 1-2: KPI Cards with sparklines
- [ ] Day 3-4: Mapbox integration
- [ ] Day 5-6: Charts (sentiment, issues, party)
- [ ] Day 7: Activity feed with real-time

**Deliverable:** Dashboard with live data

### Phase 3: Voter CRM (Week 3)
**Goal:** Full voter management

- [ ] Day 1-3: Voter list table
- [ ] Day 4-5: Search and filters
- [ ] Day 6: Add voter form
- [ ] Day 7: Voter detail page

**Deliverable:** Voter CRUD complete

### Phase 4: Intelligence (Week 4)
**Goal:** Political Atlas, Scenarios, Coalition

- [ ] Day 1-2: Political Atlas page
- [ ] Day 3-4: Scenarios page
- [ ] Day 5-6: Coalition dashboard
- [ ] Day 7: Sentiment dashboard

**Deliverable:** Intelligence module complete

### Phase 5: Campaign Tools (Week 5)
**Goal:** Scorecards, Content, Micro-targeting

- [ ] Day 1-2: Scorecard builder
- [ ] Day 3-4: Content pipeline
- [ ] Day 5-7: Micro-targeting

**Deliverable:** Campaign module complete

### Phase 6: Election Day (Week 6)
**Goal:** Monitor mode, results, incidents

- [ ] Day 1-3: Monitor dashboard
- [ ] Day 4-5: Results aggregation
- [ ] Day 6-7: Incident management

**Deliverable:** Election Day module complete

### Phase 7: Governance (Week 7)
**Goal:** Post-election features

- [ ] Day 1-3: Budget tracker
- [ ] Day 4-5: Citizen feedback CRM
- [ ] Day 6-7: Security coordination

**Deliverable:** Governance module complete

### Phase 8: Polish (Week 8)
**Goal:** Production readiness

- [ ] Day 1-2: Loading states, error boundaries
- [ ] Day 3-4: Responsive design
- [ ] Day 5-6: Performance optimization
- [ ] Day 7: Testing, documentation

**Deliverable:** Production-ready application

---

## 5. Testing Strategy

### Unit Tests
```typescript
// hooks/useAuth.test.ts
describe('useAuth', () => {
  it('should login successfully', async () => {
    // Test implementation
  });

  it('should handle login errors', async () => {
    // Test implementation
  });
});
```

### Integration Tests
- API client tests
- Store integration tests
- Component interaction tests

### E2E Tests
- Authentication flow
- Dashboard navigation
- Voter CRUD operations

---

## 6. Performance Guidelines

### Loading Targets
- Initial page load: < 2 seconds
- Dashboard data: < 1 second
- Table search: < 500ms
- Map render: < 1 second

### Optimization Techniques
1. **Code Splitting:** Dynamic imports for heavy components
2. **Data Fetching:** TanStack Query caching
3. **Images:** Next.js Image component with optimization
4. **Maps:** Lazy load Mapbox, use vector tiles
5. **Tables:** Virtualization for large datasets

### Bundle Size
- Monitor with `next-bundle-analyzer`
- Keep initial bundle < 200KB
- Lazy load heavy dependencies

---

## 7. Security Checklist

- [ ] All API calls include auth token
- [ ] Tenant isolation on every request
- [ ] Input validation on forms
- [ ] XSS prevention (React handles most)
- [ ] CSRF protection via SameSite cookies
- [ ] No secrets in client-side code
- [ ] Environment variables properly prefixed

---

## 8. Deployment Pipeline

### Environments
1. **Development:** Local development
2. **Staging:** Deployed from `develop` branch
3. **Production:** Deployed from `main` branch

### Deployment Steps
1. Run linting (`next lint`)
2. Run type checking (`tsc --noEmit`)
3. Run tests (`npm test`)
4. Build application (`next build`)
5. Deploy to Vercel

### Environment Variables
```
# Required
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=

# Optional
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
```

---

## 9. Daily Development Workflow

### Morning
1. Pull latest `develop` branch
2. Check task board for assigned work
3. Create feature branch

### Development
1. Write code following standards
2. Test locally
3. Commit with proper messages

### End of Day
1. Push branch to remote
2. Open PR if feature complete
3. Update task status

---

## 10. Code Review Checklist

- [ ] Code follows style guide
- [ ] No console.log statements
- [ ] Proper error handling
- [ ] Loading states implemented
- [ ] TypeScript types are correct
- [ ] No hardcoded values (use constants)
- [ ] Responsive design considered
- [ ] Accessibility (ARIA labels, keyboard nav)

---

## Quick Reference

### Start Development
```bash
cd apps/command-center
npm install
npm run dev
```

### Add shadcn Component
```bash
npx shadcn add button
```

### Create New Page
```bash
# Create directory
mkdir -p src/app/constituents/voters

# Create page.tsx
touch src/app/constituents/voters/page.tsx
```

### Run Type Check
```bash
npx tsc --noEmit
```

---

**Last Updated:** March 2026
**Version:** 1.0
**Maintainer:** Development Team
