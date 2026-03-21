# ADR-001: Multi-Tenant Architecture

**Status:** Accepted
**Date:** 2026-03-21
**Deciders:** Technical Lead, Architect

## Context

URADI-360 serves multiple political campaigns (tenants) from a single codebase and infrastructure. Each campaign (e.g., Jigawa 2027, Kano 2027) requires complete data isolation while sharing the same platform features.

Key requirements:
- Complete data isolation between tenants (no cross-tenant data access)
- Shared infrastructure (cost efficiency)
- Unified codebase (maintainability)
- Tenant-specific customizations (branding, configurations)
- Horizontal scalability (support 100+ tenants)

## Decision

**Implement row-level multi-tenancy** using PostgreSQL row-level security (RLS) policies with `tenant_id` column in every table.

Architecture:
```
┌─────────────────────────────────────────────────────────┐
│                     API LAYER                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  Command    │  │   Citizen   │  │    Field    │   │
│  │   Center    │  │   Portal    │  │     App     │   │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │
└─────────┼────────────────┼────────────────┼──────────┘
          │                │                │
          └────────────────┴────────────────┘
                           │
          ┌────────────────▼────────────────┐
          │      FastAPI + Tenant Context    │
          │    (X-Tenant-ID header extraction)│
          └────────────────┬────────────────┘
                           │
          ┌────────────────▼────────────────┐
          │    PostgreSQL + RLS Policies   │
          │  (tenant_id filter on all rows) │
          └────────────────────────────────┘
```

### Implementation Details

1. **Tenant Identification:**
   - HTTP Header: `X-Tenant-ID`
   - JWT token claim: `tenant_id`
   - Fallback: subdomain extraction

2. **Database Isolation:**
   ```sql
   -- Every table has tenant_id column
   CREATE TABLE voters (
       id UUID PRIMARY KEY,
       tenant_id VARCHAR NOT NULL,
       -- other columns
       CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
   );

   -- Row-Level Security Policy
   CREATE POLICY tenant_isolation ON voters
       USING (tenant_id = current_setting('app.current_tenant')::VARCHAR);
   ```

3. **Application Layer:**
   - Middleware extracts tenant from request
   - Database session scoped to tenant
   - Automatic tenant filtering on all queries

## Consequences

### Positive
- **Data Isolation:** Strong guarantee of tenant separation at database level
- **Cost Efficiency:** Shared infrastructure reduces operational costs
- **Maintainability:** Single codebase for all tenants
- **Customization:** Per-tenant branding and configuration
- **Scalability:** Add tenants without infrastructure changes

### Negative
- **Complexity:** More complex than single-tenant
- **Query Performance:** Additional tenant_id filtering on every query
- **Database Migrations:** Must consider all tenants during schema changes
- **Testing:** Must test with multiple tenants in test scenarios
- **Debugging:** Harder to trace issues across tenant boundaries

### Neutral
- **Backup Strategy:** Single database backup includes all tenants
- **Monitoring:** Must aggregate and filter metrics by tenant

## Alternatives Considered

### Alternative 1: Separate Database per Tenant
- **Description:** Each tenant has isolated PostgreSQL database
- **Pros:** Maximum isolation, simpler queries, easier backups
- **Cons:** Higher infrastructure costs, complex migrations, connection pooling challenges
- **Decision:** Rejected due to cost and operational complexity

### Alternative 2: Schema per Tenant
- **Description:** Shared database, separate schema per tenant
- **Pros:** Good isolation, simpler than separate databases
- **Cons:** Schema migration complexity, no shared tables (users, config)
- **Decision:** Rejected due to migration complexity

### Alternative 3: Application-Level Filtering
- **Description:** No RLS, filter tenant in application queries
- **Pros:** Database-agnostic, simpler to understand
- **Cons:** Risk of missing filters, no database-level guarantee
- **Decision:** Rejected due to security risk

## References

- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Multi-Tenant SaaS Patterns](https://docs.microsoft.com/en-us/azure/sql-database/saas-tenancy-app-design-patterns)
- Implementation: `backend/tenants/`, `backend/database.py`

## Notes

- Tenant context is set per-request, not per-connection (for connection pooling)
- Super Admin role bypasses RLS for cross-tenant operations
- Tenant switching requires new request context (no cross-tenant transactions)
- Consider partition pruning for large tenant tables in future

---

**Last Updated:** 2026-03-21
**Review Date:** 2026-06-21
