# URADI-360 API Documentation

**Version:** 1.0.0
**Base URL:** `https://api.uradi360.com/v1`
**Last Updated:** 2026-03-21

---

## Getting Started

### Base URL

```
Production:  https://api.uradi360.com/v1
Staging:     https://api.staging.uradi360.com/v1
Local:       http://localhost:8000/v1
```

### Authentication

All API requests require authentication via JWT token in the Authorization header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
X-Tenant-ID: YOUR_TENANT_ID
```

### Content Type

All requests and responses use JSON:

```http
Content-Type: application/json
Accept: application/json
```

---

## Authentication

### Login

Authenticate a user and receive JWT tokens.

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "admin@jigawa2027.com",
  "password": "securePassword123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": "user-uuid",
    "email": "admin@jigawa2027.com",
    "full_name": "Admin User",
    "role": "admin",
    "tenant_id": "jigawa-2027"
  }
}
```

### Refresh Token

Get a new access token using a refresh token.

**Endpoint:** `POST /auth/refresh`

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Logout

Invalidate the current session.

**Endpoint:** `POST /auth/logout`

**Headers:**
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "message": "Successfully logged out"
}
```

---

## Response Format

### Success Response

```json
{
  "data": {
    // Response payload
  },
  "meta": {
    "page": 1,
    "per_page": 50,
    "total": 250,
    "total_pages": 5
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request failed validation",
    "details": {
      "field_name": ["Error message"]
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTHENTICATION_ERROR` | 401 | Invalid or missing token |
| `AUTHORIZATION_ERROR` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Input validation failed |
| `RATE_LIMIT_ERROR` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Pagination

List endpoints support pagination using `page` and `per_page` query parameters.

### Request

```http
GET /api/voters?page=2&per_page=50
```

### Response

```json
{
  "data": [
    // 50 voter objects
  ],
  "meta": {
    "page": 2,
    "per_page": 50,
    "total": 2450,
    "total_pages": 49
  }
}
```

### Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `page` | integer | 1 | - | Page number |
| `per_page` | integer | 50 | 100 | Items per page |

---

## Filtering

List endpoints support filtering via query parameters.

### Examples

**Filter by status:**
```http
GET /api/voters?status=active
```

**Filter by LGA:**
```http
GET /api/voters?lga=Dutse
```

**Filter by date range:**
```http
GET /api/voters?created_after=2026-01-01&created_before=2026-12-31
```

**Multiple filters:**
```http
GET /api/voters?lga=Dutse&ward=Ward1&support_level=strong
```

---

## Sorting

Use the `sort` parameter to specify sort order.

### Examples

**Ascending:**
```http
GET /api/voters?sort=last_name
```

**Descending (prefix with -):**
```http
GET /api/voters?sort=-created_at
```

**Multiple sort fields:**
```http
GET /api/voters?sort=lga,ward,last_name
```

---

## Rate Limiting

API requests are rate limited per user.

### Limits

- **Standard:** 1,000 requests per minute
- **Burst:** 100 requests per 10 seconds
- **WebSocket:** 10 messages per second

### Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1647859200
```

---

## Webhooks

### Overview

Webhooks allow you to receive real-time notifications when events occur in the platform.

### Configuration

Configure webhook URLs in your tenant settings.

### Events

| Event | Description |
|-------|-------------|
| `voter.created` | New voter registered |
| `voter.updated` | Voter information updated |
| `canvassing.completed` | Canvassing contact logged |
| `election.result.reported` | Election result submitted |
| `user.invited` | New user invited |

### Payload Format

```json
{
  "event": "voter.created",
  "timestamp": "2026-03-21T10:30:00Z",
  "tenant_id": "jigawa-2027",
  "data": {
    "id": "voter-uuid",
    "first_name": "Aisha",
    "last_name": "Mohammed",
    "lga": "Dutse",
    "ward": "Ward1"
  }
}
```

### Security

Webhook payloads include a signature header for verification:

```http
X-Webhook-Signature: sha256=signature
```

Verify using your webhook secret:

```python
import hmac
import hashlib

signature = hmac.new(
    webhook_secret.encode(),
    payload.encode(),
    hashlib.sha256
).hexdigest()

# Compare with X-Webhook-Signature
```

---

## SDKs and Libraries

### Official SDKs

| Language | Package | Installation |
|----------|---------|--------------|
| Python | `uradi360-python` | `pip install uradi360` |
| JavaScript | `uradi360-js` | `npm install @uradi360/sdk` |
| PHP | `uradi360-php` | `composer require uradi360/sdk` |

### Example: Python SDK

```python
from uradi360 import Client

client = Client(
    api_key="your-api-key",
    tenant_id="jigawa-2027"
)

# List voters
voters = client.voters.list(lga="Dutse", per_page=50)

# Create voter
voter = client.voters.create({
    "first_name": "Aisha",
    "last_name": "Mohammed",
    "phone": "+2348012345678",
    "lga": "Dutse",
    "ward": "Ward1"
})

# Get voter by ID
voter = client.voters.get("voter-uuid")

# Update voter
client.voters.update("voter-uuid", {
    "support_level": "strong"
})

# Delete voter
client.voters.delete("voter-uuid")
```

### Example: JavaScript SDK

```javascript
import { Uradi360Client } from '@uradi360/sdk';

const client = new Uradi360Client({
  apiKey: 'your-api-key',
  tenantId: 'jigawa-2027'
});

// List voters
const voters = await client.voters.list({
  lga: 'Dutse',
  perPage: 50
});

// Create voter
const voter = await client.voters.create({
  firstName: 'Aisha',
  lastName: 'Mohammed',
  phone: '+2348012345678',
  lga: 'Dutse',
  ward: 'Ward1'
});
```

---

## API Modules

| Module | Endpoints | Description |
|--------|-----------|-------------|
| [Authentication](authentication.md) | 8 | Login, logout, tokens |
| [Users](users.md) | 12 | User management, permissions |
| [Voters](voters.md) | 20 | Voter CRUD, import, export |
| [Canvassing](canvassing.md) | 15 | Field operations |
| [Intelligence](intelligence.md) | 25 | OSINT, sentiment, reports |
| [Election Day](election-day.md) | 18 | Results, monitoring |
| [AI Agents](ai-agents.md) | 14 | AI-powered features |
| [Governance](governance.md) | 16 | Post-election features |

---

## Changelog

### v1.0.0 (2026-03-21)

- Initial API release
- 150+ endpoints across 8 modules
- JWT authentication
- Multi-tenant support
- Rate limiting
- Webhook support

### Upcoming (v1.1.0)

- GraphQL endpoint (beta)
- Batch operations
- Real-time subscriptions
- Advanced analytics

---

## Support

- **Documentation:** https://docs.uradi360.com
- **Support Email:** api-support@uradi360.com
- **Status Page:** https://status.uradi360.com

---

**Base URL:** https://api.uradi360.com/v1
**OpenAPI Spec:** https://api.uradi360.com/openapi.json

**Last Updated:** 2026-03-21
