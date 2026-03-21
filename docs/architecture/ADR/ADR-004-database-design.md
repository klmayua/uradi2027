# ADR-004: Database Design Strategy

**Status:** Accepted
**Date:** 2026-03-21
**Deciders:** Technical Lead, Database Architect

## Context

URADI-360 handles:
- 2M+ voter records per tenant
- Real-time election day results (high write throughput)
- Geospatial queries (polling units, LGAs)
- Time-series data (sentiment, OSINT mentions)
- Multi-tenant isolation (strict)

Database must handle:
- Read-heavy analytics workloads
- Write-heavy election day traffic
- Complex relational queries (voters, canvassing, results)
- Text search (voter names, locations)

## Decision

**Single PostgreSQL instance with strategic optimizations:**

### Schema Design Principles

1. **Normalized Core Tables:**
   - voters, users, polling_units (3NF)
   - Foreign key constraints enforced
   - Referential integrity critical

2. **Partitioned Time-Series Tables:**
   - osint_mentions (by month)
   - activity_logs (by month)
   - election_results (by election cycle)

3. **JSONB for Flexible Data:**
   - voter.contact_info (variable structure)
   - campaign.settings (tenant-specific)
   - Raw API responses

4. **Tenant Isolation:**
   - Every table has `tenant_id` column
   - RLS policies enforced
   - No shared data except system tables

### Index Strategy

```sql
-- Primary lookup patterns
CREATE INDEX idx_voters_tenant_lookup ON voters(tenant_id, last_name, first_name);
CREATE INDEX idx_voters_location ON voters(tenant_id, lga, ward);
CREATE INDEX idx_voters_phone ON voters(tenant_id, phone) WHERE phone IS NOT NULL;

-- Geospatial queries
CREATE INDEX idx_polling_units_location ON polling_units USING GIST(tenant_id, location);

-- Time-series queries
CREATE INDEX idx_mentions_time ON osint_mentions(tenant_id, detected_at DESC);

-- Full-text search
CREATE INDEX idx_voters_search ON voters USING gin(to_tsvector('english',
    coalesce(first_name, '') || ' ' ||
    coalesce(last_name, '') || ' ' ||
    coalesce(vin, '')
));
```

### Partitioning Strategy

```sql
-- OSINT mentions - partitioned by month
CREATE TABLE osint_mentions (
    id UUID DEFAULT gen_random_uuid(),
    tenant_id VARCHAR NOT NULL,
    detected_at TIMESTAMP NOT NULL,
    -- other columns
    PRIMARY KEY (id, detected_at)
) PARTITION BY RANGE (detected_at);

-- Create monthly partitions
CREATE TABLE osint_mentions_2026_03 PARTITION OF osint_mentions
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
```

## Consequences

### Positive
- **Query Performance:** Indexes optimize common access patterns
- **Scalability:** Partitioning allows archiving old data
- **Flexibility:** JSONB handles schema evolution
- **Consistency:** ACID transactions across tenant data
- **Search:** Full-text search without external service

### Negative
- **Complexity:** More complex than simple schema
- **Migration Effort:** Schema changes require planning
- **Disk Usage:** Indexes increase storage
- **Warm-up:** Query planner needs statistics

### Neutral
- **Backup Size:** Large database needs incremental backups
- **Replication:** Read replicas for analytics

## Alternatives Considered

### Alternative 1: Separate Analytics Database (ClickHouse)
- **Description:** ClickHouse for analytics, PostgreSQL for transactions
- **Pros:** Optimized for analytics, faster aggregation
- **Cons:** Complexity, data synchronization, cost
- **Decision:** Rejected - PostgreSQL sufficient for current scale

### Alternative 2: Read Replicas for Analytics
- **Description:** Read replica for heavy queries
- **Pros:** Offload primary, better performance
- **Cons:** Replication lag, cost
- **Decision:** Accepted as Phase 2 optimization

### Alternative 3: Elasticsearch for Search
- **Description:** External search service
- **Pros:** Better search relevance, faceting
- **Cons:** Additional infrastructure, sync complexity
- **Decision:** Rejected - PostgreSQL full-text sufficient

### Alternative 4: TimescaleDB Extension
- **Description:** PostgreSQL extension for time-series
- **Pros:** Optimized for time-series, compression
- **Cons:** Additional dependency
- **Decision:** Rejected - Native partitioning sufficient

## References

- [PostgreSQL Partitioning](https://www.postgresql.org/docs/current/ddl-partitioning.html)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [PostGIS Documentation](https://postgis.net/documentation/)
- Implementation: `backend/models.py`, alembic migrations

## Notes

- Connection pooling via PgBouncer (100 connections max)
- Query timeout: 30 seconds
- Idle connections: Closed after 5 minutes
- VACUUM ANALYZE runs weekly
- Partition management: Automated script creates future partitions
- Archive policy: Move partitions > 2 years old to cold storage

---

**Last Updated:** 2026-03-21
**Review Date:** 2026-09-21
