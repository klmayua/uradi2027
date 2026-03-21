# ADR-003: Technology Stack Selection

**Status:** Accepted
**Date:** 2026-03-21
**Deciders:** Technical Lead, CTO

## Context

Building a political intelligence platform requires technology choices that balance:
- Developer productivity (small team)
- Performance at scale (2M+ voters)
- Offline capability (field agents)
- Real-time features (election day results)
- AI/ML integration (sentiment analysis, targeting)
- Budget constraints (campaign funding)

## Decision

**Full Stack:**

| Layer | Technology | Version |
|-------|-----------|---------|
| **Backend** | FastAPI (Python) | 3.12 |
| **Frontend** | Next.js (React/TypeScript) | 15.x |
| **Mobile** | Expo (React Native) | 50.x |
| **Database** | PostgreSQL | 16 |
| **Cache** | Redis | 7 |
| **Queue** | Celery | 5.x |
| **AI/ML** | Kimi via Ollama | - |
| **Storage** | Supabase | - |

### Rationale

**Backend: FastAPI + Python**
- Fastest Python framework (async/await)
- Automatic OpenAPI generation
- Type hints throughout
- ML/AI ecosystem (scikit-learn, pandas)
- Team familiarity

**Frontend: Next.js + TypeScript**
- React ecosystem (largest community)
- Server-side rendering (SEO for public pages)
- File-based routing
- API routes (backend-for-frontend pattern)
- Type safety across stack

**Mobile: Expo + React Native**
- Shared codebase with web (80% reuse)
- Offline-first capabilities
- Native performance
- OTA updates (critical for campaign)
- Push notifications

**Database: PostgreSQL**
- Row-level security (multi-tenancy)
- JSONB for flexible schemas
- Partitioning support (large tables)
- Full-text search
- Geospatial queries (PostGIS)

**Cache: Redis**
- Session storage
- Rate limiting
- Real-time features (WebSocket pub/sub)
- Task queue results

**Queue: Celery**
- Background jobs (data imports, reports)
- Scheduled tasks (briefs, alerts)
- Priority queues
- Result persistence

**AI: Kimi via Ollama**
- Self-hosted (data privacy)
- No API costs
- Offline capable
- Fine-tuning possible

## Consequences

### Positive
- **Productivity:** Small team can build fast
- **Performance:** Async throughout, efficient queries
- **Scalability:** Stateless backend, horizontal scaling
- **Offline:** Mobile app works without connectivity
- **Type Safety:** TypeScript + Python type hints
- **Cost:** Open source, cloud-agnostic

### Negative
- **Complexity:** Multiple technologies to master
- **Mobile:** React Native has platform-specific issues
- **Python GIL:** CPU-bound tasks need workarounds
- **AI Limitations:** Self-hosted models less capable than GPT-4

### Neutral
- **Vendor Lock-in:** Minimal (cloud-agnostic)
- **Team Size:** Requires full-stack developers

## Alternatives Considered

### Alternative 1: Django + React
- **Description:** Traditional Django backend
- **Pros:** Batteries included, ORM
- **Cons:** Sync only, slower than FastAPI
- **Decision:** Rejected - need async performance

### Alternative 2: Node.js + Express
- **Description:** Full JavaScript stack
- **Pros:** Single language, large ecosystem
- **Cons:** ML/AI libraries weaker than Python
- **Decision:** Rejected - AI requirements

### Alternative 3: Flutter (Mobile)
- **Description:** Dart-based cross-platform
- **Pros:** Better performance than React Native
- **Cons:** Separate codebase, smaller team
- **Decision:** Rejected - Expo + RN better for our team

### Alternative 4: MongoDB (Database)
- **Description:** Document database
- **Pros:** Flexible schema, easy JSON
- **Cons:** No RLS, weaker consistency
- **Decision:** Rejected - PostgreSQL RLS essential

## References

- [FastAPI Benchmarks](https://fastapi.tiangolo.com/benchmarks/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Expo Documentation](https://docs.expo.dev)
- Implementation: `backend/`, `apps/command-center/`

## Notes

- All versions pinned in requirements.txt and package.json
- Upgrade strategy: test in staging, deploy during low-traffic
- Monitoring: track performance metrics per service
- AI model: Can upgrade to GPT-4 via API if Kimi insufficient

---

**Last Updated:** 2026-03-21
**Review Date:** 2026-09-21
