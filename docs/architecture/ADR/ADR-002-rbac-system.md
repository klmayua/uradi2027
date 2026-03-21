# ADR-002: Role-Based Access Control (RBAC)

**Status:** Accepted
**Date:** 2026-03-21
**Deciders:** Technical Lead, Security Lead

## Context

URADI-360 has 9 distinct user roles with varying permissions across 40+ features. Access control must be:
- Granular (resource + action level)
- Maintainable (easy to add roles/permissions)
- Auditable (track who did what)
- Performant (permission checks < 50ms)

User Roles:
1. Super Admin - Full platform access
2. Admin - Campaign management
3. Strategist - Data analysis
4. Coordinator - Field operations
5. Analyst - Reports and insights
6. Field Agent - Ground data collection
7. Monitor - Election day observation
8. Content Manager - Communications
9. Finance Manager - Budget control

## Decision

**Implement hierarchical RBAC with resource-action permissions.**

### Permission Model

```python
# Permission structure: "resource:action"
PERMISSIONS = {
    "voters:create",      # Create voter records
    "voters:read",        # View voter records
    "voters:update",      # Edit voter records
    "voters:delete",      # Delete voter records
    "voters:import",      # Bulk import voters
    "voters:export",      # Export voter data
    # ... 40+ resources
}

# Role-to-Permission mapping
ROLE_PERMISSIONS = {
    "superadmin": {"*": ["*"]},  # Wildcard = all permissions
    "admin": {
        "users": ["create", "read", "update", "delete"],
        "voters": ["create", "read", "update", "delete", "import", "export"],
        # ...
    },
    "field_agent": {
        "voters": ["create", "read"],  # Own records only
        "canvassing": ["create", "read", "update"],
    },
    # ... 6 more roles
}
```

### Implementation Strategy

1. **Backend Enforcement:**
   ```python
   # Decorator pattern
   @require_permission("voters", "create")
   async def create_voter(request: Request, ...):
       ...

   # Or service layer
   if not check_permission(user, "voters", "create"):
       raise HTTPException(403, "Permission denied")
   ```

2. **Frontend Guards:**
   ```typescript
   // Permission guard component
   <PermissionGuard resource="voters" action="create">
     <CreateVoterButton />
   </PermissionGuard>

   // Hook for conditional rendering
   const canCreate = useCan("voters", "create");
   ```

3. **Permission Caching:**
   - Cache user permissions in JWT token
   - Frontend caches for 5 minutes
   - Database lookup on token refresh only

## Consequences

### Positive
- **Flexibility:** Easy to add new roles or permissions
- **Clarity:** Explicit permission grants
- **Auditability:** Can log permission checks
- **Performance:** Cached permissions reduce DB load
- **Maintainability:** Single source of truth for permissions

### Negative
- **Complexity:** More complex than simple role checks
- **Testing:** Must test all permission combinations
- **UI Complexity:** Need permission-aware UI components
- **Documentation:** Must document all 40+ permissions

### Neutral
- **Migration:** Existing users need permission migration
- **Debugging:** Permission denied errors need clear messages

## Alternatives Considered

### Alternative 1: Role-Based Only (No Resource Granularity)
- **Description:** Check role only, not specific permissions
- **Pros:** Simple, easy to understand
- **Cons:** Can't grant partial access, inflexible
- **Decision:** Rejected - too limiting for campaign needs

### Alternative 2: Attribute-Based Access Control (ABAC)
- **Description:** Policies based on user/resource attributes
- **Pros:** Very flexible, can express complex rules
- **Cons:** Overly complex for our needs, harder to audit
- **Decision:** Rejected - RBAC sufficient for requirements

### Alternative 3: ACL (Access Control Lists) per Resource
- **Description:** Each resource has list of allowed users
- **Pros:** Fine-grained control
- **Cons:** Doesn't scale, hard to manage
- **Decision:** Rejected - too complex for 9 roles

## References

- [OWASP RBAC](https://owasp.org/www-community/Access_Control)
- Implementation: `backend/api/users.py`, `hooks/useUsers.ts`
- Permission Guard: `components/auth/PermissionGuard.tsx`

## Notes

- Permissions are additive (no negative permissions)
- Super Admin has wildcard access
- Field Agents have "own records only" scope for some resources
- Permission changes require token refresh to take effect
- Audit log records all permission denied events

---

**Last Updated:** 2026-03-21
**Review Date:** 2026-06-21
