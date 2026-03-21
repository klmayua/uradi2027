# URADI-360 Production Launch Checklist

**Version:** 1.0.0
**Date:** March 21, 2026
**Status:** Pre-Launch

---

## Pre-Launch Timeline

```
T-7 Days:  Infrastructure Setup
T-5 Days:  Security Hardening
T-3 Days:  Data Migration & Testing
T-1 Day:   Final Checks
T-0:       LAUNCH
```

---

## Phase 1: Infrastructure Setup (Days -7 to -6)

### 1.1 Supabase Configuration

- [ ] Create Supabase project (Pro tier recommended)
- [ ] Configure database backups (daily, retain 7 days)
- [ ] Set up Point-in-Time Recovery (PITR)
- [ ] Configure connection pooling (PgBouncer)
- [ ] Enable database audit logging
- [ ] Create initial admin user in auth.users
- [ ] Run schema.sql migration
- [ ] Verify RLS policies are active
- [ ] Configure Storage buckets with proper CORS
- [ ] Set up Supabase Realtime for notifications

**Files:**
- `infrastructure/supabase/schema.sql`

### 1.2 VPS Provisioning

- [ ] Provision VPS (4 vCPU, 8GB RAM minimum)
- [ ] Update system packages
- [ ] Run `infrastructure/scripts/provision-vps.sh`
- [ ] Verify Docker installation
- [ ] Verify Nginx installation
- [ ] Configure UFW firewall
- [ ] Set up Fail2ban
- [ ] Configure log rotation
- [ ] Set up automated backups
- [ ] Test SSH access with key authentication

### 1.3 CloudFlare Configuration

- [ ] Add domain to CloudFlare
- [ ] Import DNS records from `infrastructure/cloudflare/dns-records.yml`
- [ ] Configure SSL/TLS (Full Strict)
- [ ] Enable HSTS
- [ ] Import firewall rules from `infrastructure/cloudflare/firewall-rules.yml`
- [ ] Configure WAF rules
- [ ] Set up DDoS protection
- [ ] Enable Bot Management
- [ ] Configure Page Rules for caching
- [ ] Test DNS resolution

### 1.4 Environment Configuration

- [ ] Copy `infrastructure/vps/.env.production` to VPS
- [ ] Fill in all required environment variables
- [ ] Generate strong secrets (JWT, encryption keys)
- [ ] Configure SMTP credentials
- [ ] Add Twilio credentials for SMS
- [ ] Configure OpenAI API key
- [ ] Add Sentry DSN
- [ ] Set up GitHub Container Registry token
- [ ] Verify all env vars are set (no empty values)
- [ ] Secure .env file permissions (chmod 600)

---

## Phase 2: Security Hardening (Days -5 to -4)

### 2.1 SSL/TLS Certificates

- [ ] Install certbot
- [ ] Run `infrastructure/vps/ssl/setup-ssl.sh`
- [ ] Verify certificates for all domains:
  - [ ] api.uradi360.com
  - [ ] ws.uradi360.com
  - [ ] app.uradi360.com
  - [ ] campaign.uradi360.com
- [ ] Test SSL Labs rating (aim for A+)
- [ ] Verify auto-renewal is configured
- [ ] Test certificate renewal: `certbot renew --dry-run`

### 2.2 Access Control

- [ ] Disable root SSH login
- [ ] Change default SSH port (optional but recommended)
- [ ] Configure SSH key-only authentication
- [ ] Set up sudo without password for deploy user
- [ ] Configure VPN for admin access (optional)
- [ ] Document all access credentials in password manager
- [ ] Enable 2FA on all cloud accounts

### 2.3 Secrets Management

- [ ] Rotate all default passwords
- [ ] Store secrets in password manager (1Password/Bitwarden)
- [ ] Configure GitHub secrets for Actions
- [ ] Set up SOPS or similar for encrypted secrets
- [ ] Document secret rotation schedule

### 2.4 Data Protection

- [ ] Enable database encryption at rest (Supabase)
- [ ] Verify backup encryption
- [ ] Configure VPC/private networking if available
- [ ] Set up log anonymization for PII
- [ ] Document data retention policies

---

## Phase 3: Deployment Preparation (Days -3 to -2)

### 3.1 Application Build

- [ ] Build backend Docker image locally
- [ ] Test image with `docker run`
- [ ] Push image to GitHub Container Registry
- [ ] Build Command Center frontend
- [ ] Build Citizen Portal frontend
- [ ] Verify all builds complete without errors
- [ ] Tag images with commit hash

### 3.2 Database Seeding

- [ ] Prepare seed data for first tenant
- [ ] Create initial admin user
- [ ] Import voter data (if available)
- [ ] Configure OSINT sources
- [ ] Create messaging templates
- [ ] Verify data integrity

### 3.3 Service Configuration

- [ ] Configure Nginx sites
- [ ] Set up Nginx rate limiting
- [ ] Configure Redis memory limits
- [ ] Set Celery worker concurrency
- [ ] Configure log levels (INFO for production)
- [ ] Disable debug mode

### 3.4 Monitoring Setup

- [ ] Run `infrastructure/scripts/setup-monitoring.sh`
- [ ] Configure Sentry project
- [ ] Set up Grafana dashboards
- [ ] Configure alert channels (Slack, Email)
- [ ] Test alert notifications
- [ ] Set up log aggregation (Loki)
- [ ] Configure uptime monitoring

---

## Phase 4: Testing (Days -2 to -1)

### 4.1 Functional Testing

- [ ] Test user registration flow
- [ ] Test login/logout
- [ ] Test password reset
- [ ] Test voter data import
- [ ] Test field agent mobile app sync
- [ ] Test OSINT scraping
- [ ] Test real-time alerts
- [ ] Test WebSocket connections
- [ ] Test file uploads
- [ ] Test SMS sending (Twilio)

### 4.2 Load Testing

- [ ] Run load tests against API endpoints
- [ ] Test database connection pool limits
- [ ] Test Redis memory usage
- [ ] Verify rate limiting is working
- [ ] Test concurrent user sessions
- [ ] Verify auto-scaling triggers (if configured)

### 4.3 Security Testing

- [ ] Run OWASP ZAP scan
- [ ] Test SQL injection prevention
- [ ] Test XSS prevention
- [ ] Verify CSRF protection
- [ ] Test authentication bypass attempts
- [ ] Verify RLS policies are effective
- [ ] Test file upload restrictions
- [ ] Run dependency vulnerability scan

### 4.4 Disaster Recovery Testing

- [ ] Test database restore from backup
- [ ] Test redeployment from scratch
- [ ] Verify backup integrity
- [ ] Document recovery time
- [ ] Test failover procedures

---

## Phase 5: Final Checks (Day -1)

### 5.1 Documentation Review

- [ ] Review Terms of Service with legal counsel
- [ ] Review Privacy Policy with legal counsel
- [ ] Verify all documentation is current
- [ ] Confirm user guides are accessible
- [ ] Verify API documentation is live

### 5.2 Legal Compliance

- [ ] Verify NDPR compliance
- [ ] Confirm data processing agreement ready
- [ ] Verify cookie consent implemented
- [ ] Check accessibility compliance (WCAG 2.1 AA)
- [ ] Verify election law compliance

### 5.3 Go/No-Go Meeting

Attendees: Tech Lead, Product Manager, Legal, Operations

- [ ] Review all checklist items
- [ ] Verify monitoring is active
- [ ] Confirm support channels ready
- [ ] Review rollback plan
- [ ] **GO / NO-GO Decision**

### 5.4 Launch Communication

- [ ] Prepare launch announcement
- [ ] Notify stakeholders
- [ ] Prepare support team
- [ ] Enable status page
- [ ] Schedule post-launch review

---

## Phase 6: LAUNCH (Day 0)

### Launch Sequence

```
T-00:00  Begin deployment
T-00:15  Deploy backend services
T-00:30  Deploy frontend applications
T-00:45  Run health checks
T-01:00  Enable public access
T+00:15  Monitor for issues
T+01:00  Confirm successful launch
```

### Launch Commands

```bash
# On VPS
ssh deploy@your-vps-ip
cd /opt/uradi360

# Deploy
./infrastructure/scripts/deploy.sh

# Verify
./infrastructure/scripts/health-check.sh
```

### Launch Day Checklist

- [ ] Announce maintenance window (if needed)
- [ ] Execute deployment
- [ ] Run health checks
- [ ] Verify all services responding
- [ ] Monitor error rates
- [ ] Check SSL certificates
- [ ] Verify DNS resolution
- [ ] Test critical user flows
- [ ] Monitor Sentry for errors
- [ ] **LAUNCH COMPLETE**

---

## Post-Launch Monitoring (Hours 1-24)

### Hour 1

- [ ] Monitor error rates (Sentry)
- [ ] Check API response times
- [ ] Verify database performance
- [ ] Monitor Redis memory
- [ ] Check Celery queue depth

### Hours 2-6

- [ ] Continue monitoring dashboards
- [ ] Respond to any alerts
- [ ] Collect initial user feedback
- [ ] Document any issues

### Hours 6-24

- [ ] Review first 24 hours of metrics
- [ ] Analyze any errors
- [ ] Check backup completion
- [ ] Document lessons learned

---

## Rollback Plan

If critical issues are detected:

1. **Immediate Assessment** (2 minutes)
   - Determine severity
   - Identify affected components

2. **Decision Point** (1 minute)
   - Can fix be deployed quickly?
   - If yes: Hotfix
   - If no: Rollback

3. **Rollback Execution** (5 minutes)
   ```bash
   cd /opt/uradi360
   docker-compose down
   docker-compose up -d previous-version
   ```

4. **Communication**
   - Post status update
   - Notify stakeholders
   - Schedule post-mortem

---

## Sign-Off

| Role | Name | Sign-Off | Date |
|------|------|----------|------|
| Tech Lead | | ☐ | |
| Product Manager | | ☐ | |
| Legal Counsel | | ☐ | |
| Security Lead | | ☐ | |
| Operations | | ☐ | |

---

## Emergency Contacts

| Role | Name | Phone | Slack |
|------|------|-------|-------|
| Tech Lead | | | |
| DevOps | | | |
| Security | | | |
| Legal | | | |

---

**END OF LAUNCH CHECKLIST**

*This checklist must be completed before production launch. No shortcuts.*
