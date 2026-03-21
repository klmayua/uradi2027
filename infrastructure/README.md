# URADI-360 Infrastructure Provisioning Guide

**Version:** 1.0.0
**Date:** March 21, 2026
**Status:** Production Ready

---

## Quick Start

This infrastructure package provides everything needed to deploy URADI-360 to production.

### Prerequisites

- [ ] Supabase account (supabase.com)
- [ ] VPS with Ubuntu 22.04+ (4 vCPU, 8GB RAM, 100GB SSD minimum)
- [ ] CloudFlare account
- [ ] GitHub repository
- [ ] Domain name configured

### Deployment Order

```
1. Supabase Setup (15 min)
   └── Run: scripts/setup-supabase.sh

2. VPS Provisioning (20 min)
   └── Run: scripts/provision-vps.sh

3. Environment Configuration (10 min)
   └── Configure: vps/.env.production

4. Application Deployment (15 min)
   └── Run: scripts/deploy.sh

5. CloudFlare DNS (5 min)
   └── Import: cloudflare/dns-records.yml

6. Monitoring Setup (10 min)
   └── Run: scripts/setup-monitoring.sh
```

**Total Time:** ~75 minutes

---

## Directory Structure

```
infrastructure/
├── README.md                    # This file
├── scripts/                     # Automation scripts
│   ├── setup-supabase.sh       # Supabase project setup
│   ├── provision-vps.sh        # VPS Docker + Nginx setup
│   ├── deploy.sh               # Full deployment
│   └── setup-monitoring.sh     # Sentry + Grafana
├── supabase/                    # Database configuration
│   ├── schema.sql              # Full schema with RLS
│   ├── seed.sql                # Essential seed data
│   ├── migrations/             # Migration files
│   └── config.toml             # Supabase CLI config
├── vps/                         # VPS configuration
│   ├── docker-compose.yml      # Production services
│   ├── .env.production         # Environment template
│   ├── nginx/                  # Nginx configs
│   │   ├── nginx.conf
│   │   └── sites-available/
│   └── ssl/                    # SSL certificate scripts
├── cloudflare/                  # CloudFlare configuration
│   ├── dns-records.yml         # DNS records
│   ├── page-rules.yml          # Caching rules
│   └── firewall-rules.yml      # WAF rules
├── github-actions/              # CI/CD pipelines
│   ├── deploy-backend.yml
│   ├── deploy-frontend.yml
│   └── pr-checks.yml
└── monitoring/                  # Observability
    ├── sentry-project-config.yml
    ├── grafana-dashboards/
    └── alerts/
```

---

## Resource Requirements

### Production VPS Specs

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 4 vCPU | 8 vCPU |
| **RAM** | 8 GB | 16 GB |
| **SSD** | 100 GB | 200 GB |
| **Network** | 100 Mbps | 1 Gbps |
| **OS** | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### Supabase Project Tier

| Feature | Tier | Reason |
|---------|------|--------|
| **Database** | Pro | 8GB storage, auto-scaling |
| **Auth** | Pro | 100K users, SSO |
| **Storage** | Pro | 100GB for uploads |
| **Edge Functions** | Pro | Serverless execution |
| **Realtime** | Pro | 500 concurrent |

---

## Security Checklist

Before production deployment:

- [ ] Change all default passwords
- [ ] Enable 2FA on all accounts (Supabase, VPS, CloudFlare)
- [ ] Configure backup retention (7 days minimum)
- [ ] Set up log aggregation
- [ ] Configure DDoS protection (CloudFlare)
- [ ] Enable SSL/TLS (Auto)
- [ ] Set up monitoring alerts
- [ ] Document incident response plan

---

## Support

For infrastructure issues:
- **Supabase:** support@supabase.com
- **VPS Provider:** Your hosting provider
- **CloudFlare:** Community forums
- **URADI-360:** infrastructure@uradi360.com

---

**END OF INFRASTRUCTURE GUIDE**
