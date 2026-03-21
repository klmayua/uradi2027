# ADR-006: Security Architecture & Threat Model

**Status:** Accepted
**Date:** 2026-03-21
**Deciders:** Security Lead, Technical Lead

## Context

URADI-360 handles sensitive political data:
- Voter personal information (PII)
- Campaign strategies and internal communications
- Financial data (donations, expenses)
- Intelligence reports
- User credentials and roles

Security requirements:
- Data protection (NDPR/GDPR compliance)
- Authentication and authorization
- API security
- Infrastructure security
- Incident response

Threat actors:
- External attackers (data theft, disruption)
- Insider threats (data exfiltration)
- Nation-state actors (political espionage)

## Decision

**Defense-in-depth strategy with multiple security layers:**

### Layer 1: Infrastructure

```
Internet → Cloudflare/WAF → Load Balancer → Application → Database
```

- **HTTPS Only:** TLS 1.3, HSTS enabled
- **DDoS Protection:** Cloudflare or AWS Shield
- **Network Segmentation:** Private subnets for databases
- **VPN Required:** Administrative access via VPN only

### Layer 2: Application

**Authentication:**
- JWT tokens with short expiry (30 minutes)
- Refresh tokens for extended sessions
- MFA for admin/superadmin roles
- Password policies (12+ chars, complexity)
- Account lockout after 5 failed attempts

**Authorization:**
- RBAC (see ADR-002)
- Principle of least privilege
- Resource-level permissions
- Audit logging for all access

**API Security:**
- Rate limiting (100 req/min per user)
- Input validation (Pydantic + custom validators)
- SQL injection prevention (ORM + parameterized queries)
- XSS protection (output encoding)
- CSRF tokens for state-changing operations

**Headers:**
```python
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; ...
```

### Layer 3: Data

**Encryption:**
- At rest: Database encryption (AES-256)
- In transit: TLS 1.3
- Sensitive fields: Application-level encryption (PII)
- Backups: Encrypted before storage

**Data Classification:**
- **Critical:** Authentication tokens, API keys
- **Sensitive:** Voter PII, financial data, intelligence
- **Internal:** Campaign strategies, reports
- **Public:** Published content, public records

**Access Controls:**
- Database: Role-based access, least privilege
- Encryption keys: Hardware security module (HSM) or KMS
- Audit logs: Immutable, centralized

### Layer 4: Monitoring

- **Security Events:** Failed logins, permission denials, suspicious activity
- **Audit Trail:** Who accessed what, when, from where
- **Anomaly Detection:** Unusual patterns (bulk exports, off-hours access)
- **Incident Response:** 24/7 alerting, escalation procedures

## Consequences

### Positive
- **Defense in Depth:** Multiple layers protect data
- **Compliance:** Meets NDPR/GDPR requirements
- **Auditability:** Complete access trail
- **Incident Response:** Monitoring enables quick detection

### Negative
- **Complexity:** More complex than basic security
- **Performance:** Encryption adds overhead
- **User Friction:** MFA, strong passwords
- **Cost:** Security tools and monitoring

### Neutral
- **Maintenance:** Regular security updates required
- **Training:** Team needs security awareness

## Alternatives Considered

### Alternative 1: OAuth 2.0 / OpenID Connect
- **Description:** External identity provider
- **Pros:** Centralized auth, SSO
- **Cons:** External dependency, voter privacy concerns
- **Decision:** Rejected - Self-hosted for political sensitivity

### Alternative 2: Basic Auth with API Keys
- **Description:** Simple key-based auth
- **Pros:** Simple, stateless
- **Cons:** No session management, harder to revoke
- **Decision:** Rejected - JWT provides better security

### Alternative 3: Zero Trust Architecture
- **Description:** Verify every request, no implicit trust
- **Pros:** Maximum security
- **Cons:** Overkill for current threat model
- **Decision:** Rejected - Traditional model sufficient

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [NDPR Guidelines](https://www.nitda.gov.ng/documents/Guidelines_on_NDPR.pdf)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- Implementation: `backend/middleware/security.py`, `middleware.ts`

## Notes

- Security is everyone's responsibility
- Regular security training for team
- Quarterly penetration testing
- Annual security audit
- Bug bounty program considered for future
- Incident response plan tested annually

---

**Last Updated:** 2026-03-21
**Review Date:** 2026-06-21 (quarterly security review)
