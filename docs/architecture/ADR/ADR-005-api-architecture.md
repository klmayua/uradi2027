# ADR-005: API Architecture & Design

**Status:** Accepted
**Date:** 2026-03-21
**Deciders:** Technical Lead, API Architect

## Context

URADI-360 exposes 150+ API endpoints across multiple modules:
- Authentication (auth/*)
- Voter Management (/api/voters/*)
- Intelligence (/api/intelligence/*, /api/osint/*)
- Field Operations (/api/field/*, /api/canvassing/*)
- Election Day (/api/election/*)
- AI Agents (/api/ai/*)
- Governance (/api/governance/*)

API design must balance:
- RESTful conventions (familiar to developers)
- Performance (efficient data transfer)
- Flexibility (handle complex queries)
- Versioning (backward compatibility)
- Documentation (auto-generated)

## Decision

**RESTful API with FastAPI, following these principles:**

### URL Structure

```
/api/{module}/{resource}/{id?}/{action?}

Examples:
/api/voters                    # List voters
/api/voters/{id}              # Get specific voter
/api/voters/{id}/history      # Sub-resource
/api/intelligence/reports     # Module namespace
/api/ai/analyze-sentiment     # Action endpoints
```

### HTTP Methods

| Method | Usage | Example |
|--------|-------|---------|
| GET | Read (idempotent) | Get voter, list voters |
| POST | Create | Create voter, submit form |
| PATCH | Partial update | Update voter fields |
| DELETE | Remove | Delete voter |
| PUT | Replace (rare) | Replace entire resource |

### Response Format

```json
{
  "data": { ... },           // Resource(s) on success
  "error": {                 // On failure only
    "code": "VALIDATION_ERROR",
    "message": "Invalid phone number format",
    "details": { ... }
  },
  "meta": {                  // Pagination, etc.
    "page": 1,
    "per_page": 50,
    "total": 1250
  }
}
```

### Status Codes

| Code | Usage |
|------|-------|
| 200 | Success (GET, PATCH) |
| 201 | Created (POST) |
| 204 | No content (DELETE) |
| 400 | Bad request (validation) |
| 401 | Unauthorized (not logged in) |
| 403 | Forbidden (no permission) |
| 404 | Resource not found |
| 409 | Conflict (duplicate, state error) |
| 422 | Validation error |
| 429 | Rate limited |
| 500 | Server error |

### Key Features

1. **Auto-Generated Documentation:**
   - FastAPI generates OpenAPI spec
   - Swagger UI at `/docs`
   - ReDoc at `/redoc`

2. **Request Validation:**
   - Pydantic models for all inputs
   - Automatic type conversion
   - Custom validators

3. **Dependency Injection:**
   - Database sessions
   - Current user context
   - Permission checking

4. **Pagination:**
   - Cursor-based for large datasets
   - Offset-based for smaller lists
   - Default: 50 items per page

5. **Filtering:**
   - Query parameters for filtering
   - Multiple filter operators (eq, gt, lt, like)
   - Sorting via `sort` parameter

## Consequences

### Positive
- **Developer Experience:** Auto-docs, type hints, validation
- **Consistency:** Uniform patterns across all endpoints
- **Performance:** Async handling, efficient serialization
- **Maintainability:** Pydantic models self-document

### Negative
- **Learning Curve:** Team must learn FastAPI patterns
- **Verbosity:** More boilerplate than Flask/Django
- **Documentation Gap:** Auto-docs need manual enhancement

### Neutral
- **REST Limitations:** Complex operations need RPC-style endpoints
- **Versioning:** URL versioning (/api/v1/) not yet implemented

## Alternatives Considered

### Alternative 1: GraphQL
- **Description:** GraphQL API with single endpoint
- **Pros:** Client-specified fields, reduced over-fetching
- **Cons:** Complexity, caching challenges, learning curve
- **Decision:** Rejected - REST sufficient for our needs

### Alternative 2: gRPC
- **Description:** Binary protocol with code generation
- **Pros:** Performance, type safety
- **Cons:** Browser support requires proxy, complexity
- **Decision:** Rejected - Internal APIs only (not public)

### Alternative 3: JSON:API Standard
- **Description:** Strict REST specification
- **Pros:** Consistency, standardized
- **Cons:** Verbosity, rigid structure
- **Decision:** Rejected - Too restrictive

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [REST API Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- Implementation: `backend/main.py`, `backend/api/*.py`

## Notes

- API versioning strategy: URL-based (`/api/v1/`, `/api/v2/`)
- Rate limiting: 100 requests/minute per user
- CORS: Configured for specific origins only
- WebSocket: Separate endpoints for real-time features
- Batch operations: POST with array body

---

**Last Updated:** 2026-03-21
**Review Date:** 2026-09-21
