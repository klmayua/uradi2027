# ADR-007: Scaling & Performance Strategy

**Status:** Accepted
**Date:** 2026-03-21
**Deciders:** Technical Lead, Infrastructure Lead

## Context

URADI-360 must handle:
- **Steady State:** 100 concurrent users, 1000 voters/hour
- **Election Day:** 1000+ concurrent users, 10,000+ requests/hour
- **Voter Database:** 2M+ records per tenant
- **Growth:** Support 100+ tenants by 2028

Scaling requirements:
- Horizontal scaling (add servers)
- Database scaling (partitioning, read replicas)
- Caching strategy
- CDN for static assets
- Background job processing

## Decision

**Horizontal scaling with cloud-native patterns:**

### Current Architecture (Single Instance)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Vercel    │────▶│   Railway   │────▶│  PostgreSQL │
│  (Next.js)  │     │  (FastAPI)  │     │  (Single)   │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                           │                   │
                     ┌─────▼─────┐       ┌─────▼─────┐
                     │   Redis   │       │  (Future) │
                     │  (Cache)  │       │  Read     │
                     └───────────┘       │  Replica  │
                                          └───────────┘
```

### Phase 1: Optimize Current (Immediate)

**Database:**
- Connection pooling (PgBouncer)
- Query optimization (add missing indexes)
- Partitioning for large tables
- Archive old data

**Caching:**
- Redis for session storage
- Query result caching (5 min TTL)
- Static asset caching (CDN)

**Code:**
- Async database queries
- N+1 query elimination
- Pagination on all list endpoints
- Background jobs for heavy operations

### Phase 2: Scale Horizontally (Month 6)

**Application:**
- Multiple FastAPI instances behind load balancer
- Stateless design (no local session storage)
- Health checks for auto-scaling

**Database:**
- Read replica for analytics queries
- Write remains on primary
- Connection pooling per application instance

**Caching:**
- Redis Cluster for scale
- CDN for public website

### Phase 3: Multi-Region (Month 12)

**Goal:** Low latency for users across Nigeria

**Architecture:**
- Primary region: Lagos (write operations)
- Secondary regions: Kano, Port Harcourt (read-only)
- Database replication: Async replication to regions
- CDN: Multi-region POPs

## Consequences

### Positive
- **Cost Efficiency:** Pay for what you use
- **Availability:** Redundancy eliminates single points of failure
- **Performance:** Caching and CDNs reduce latency
- **Growth:** Can scale to millions of users

### Negative
- **Complexity:** More moving parts
- **Consistency:** Eventual consistency for read replicas
- **Cost:** Higher infrastructure costs at scale
- **Operational:** More to monitor and maintain

### Neutral
- **Migration:** Need to migrate from single instance
- **Testing:** Load testing required before scaling

## Scaling Triggers

| Metric | Current | Scale Trigger | Action |
|--------|---------|---------------|--------|
| **Database CPU** | < 20% | > 70% | Add read replica |
| **Response Time** | < 100ms | > 500ms (p95) | Optimize queries |
| **Concurrent Users** | < 100 | > 500 | Scale horizontally |
| **Cache Hit Rate** | N/A | < 80% | Tune cache TTL |
| **Disk Usage** | < 50% | > 80% | Archive old data |

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **API Response (p95)** | < 200ms | Application metrics |
| **Database Query (p95)** | < 20ms | PostgreSQL logs |
| **Page Load Time** | < 3s | Lighthouse |
| **Availability** | 99.9% | Uptime monitoring |
| **Cache Hit Rate** | > 85% | Redis metrics |

## Alternatives Considered

### Alternative 1: Vertical Scaling (Bigger Server)
- **Description:** Single larger database server
- **Pros:** Simple, no code changes
- **Cons:** Ceiling on size, single point of failure
- **Decision:** Rejected - Horizontal preferred

### Alternative 2: Microservices
- **Description:** Separate services for each module
- **Pros:** Independent scaling, team autonomy
- **Cons:** Complexity, operational overhead
- **Decision:** Rejected - Monolith sufficient for current size

### Alternative 3: Serverless (AWS Lambda)
- **Description:** Function-as-a-service
- **Pros:** Auto-scaling, pay-per-request
- **Cons:** Cold start latency, vendor lock-in
- **Decision:** Rejected - Latency requirements

## References

- [12-Factor App](https://12factor.net/)
- [Cloud Native Patterns](https://github.com/PatternAtlas/)
- [PostgreSQL High Availability](https://www.postgresql.org/docs/current/high-availability.html)
- [Redis Clustering](https://redis.io/topics/cluster-tutorial)

## Notes

- Monitor metrics before scaling
- Load test before election day
- Auto-scaling policies for traffic spikes
- Database backups before any scaling operation
- Document runbooks for scaling operations

---

**Last Updated:** 2026-03-21
**Review Date:** 2026-06-21 (review metrics, adjust strategy)
