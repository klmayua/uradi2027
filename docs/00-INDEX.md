# URADI-360 Documentation Index

**Version:** 1.0.0
**Date:** 2026-03-21
**Status:** 🚧 UNDER CONSTRUCTION

Welcome to the URADI-360 documentation. This index helps you navigate the documentation structure.

---

## Quick Links

| I am a... | Start here |
|-----------|------------|
| **New Developer** | [Setup Guide](development/SETUP_GUIDE.md) → [Architecture Overview](architecture/SYSTEM_OVERVIEW.md) |
| **DevOps Engineer** | [Deployment Guide](deployment/README.md) → [Environment Setup](deployment/ENVIRONMENT_SETUP.md) |
| **Campaign Admin** | [Admin Guide](user-guides/admin-guide.md) → [User Matrix](architecture/USER_MATRIX.md) |
| **Field Coordinator** | [Coordinator Guide](user-guides/coordinator-guide.md) |
| **Analyst** | [Strategist Guide](user-guides/strategist-guide.md) → [User Matrix](architecture/USER_MATRIX.md) |
| **Security Auditor** | [Security Architecture](architecture/SECURITY_ARCHITECTURE.md) → [ADR-006](architecture/ADR/ADR-006-security-model.md) |

---

## Documentation Structure

### 📐 [Architecture](architecture/)

System design and architectural decisions.

| Document | Description |
|----------|-------------|
| [SYSTEM_OVERVIEW.md](architecture/SYSTEM_OVERVIEW.md) | High-level system architecture |
| [COMPONENT_DIAGRAMS.md](architecture/COMPONENT_DIAGRAMS.md) | Visual architecture diagrams |
| [DATA_FLOW.md](architecture/DATA_FLOW.md) | Data movement patterns |
| [SECURITY_ARCHITECTURE.md](architecture/SECURITY_ARCHITECTURE.md) | Security design and threat model |
| [DATABASE_SCHEMA.md](architecture/DATABASE_SCHEMA.md) | Complete database documentation |
| [DEPLOYMENT_ARCHITECTURE.md](architecture/DEPLOYMENT_ARCHITECTURE.md) | Infrastructure design |
| [USER_MATRIX.md](architecture/USER_MATRIX.md) | User roles and permissions matrix |
| [ADR/](architecture/ADR/) | Architecture Decision Records |

### 🔌 [API](api/)

API documentation and specifications.

| Document | Description |
|----------|-------------|
| [README.md](api/README.md) | API overview |
| [openapi.yaml](api/openapi.yaml) | OpenAPI specification (150+ endpoints) |
| [authentication.md](api/authentication.md) | Auth flows and JWT usage |
| [rate-limiting.md](api/rate-limiting.md) | Rate limit rules |
| [webhooks.md](api/webhooks.md) | Webhook documentation |
| [CHANGELOG.md](api/CHANGELOG.md) | API changes and versions |

### 🚀 [Deployment](deployment/)

Deployment and operations guides.

| Document | Description |
|----------|-------------|
| [README.md](deployment/README.md) | Deployment overview |
| [ENVIRONMENT_SETUP.md](deployment/ENVIRONMENT_SETUP.md) | Environment configuration |
| [DOCKER_GUIDE.md](deployment/DOCKER_GUIDE.md) | Container deployment |
| [RAILWAY_DEPLOYMENT.md](deployment/RAILWAY_DEPLOYMENT.md) | Railway-specific guide |
| [VERCEL_DEPLOYMENT.md](deployment/VERCEL_DEPLOYMENT.md) | Vercel-specific guide |
| [PRODUCTION_CHECKLIST.md](deployment/PRODUCTION_CHECKLIST.md) | Go-live checklist |
| [ROLLBACK_PROCEDURES.md](deployment/ROLLBACK_PROCEDURES.md) | Emergency rollback |
| [TROUBLESHOOTING.md](deployment/TROUBLESHOOTING.md) | Common issues |

### 💻 [Development](development/)

Developer onboarding and contribution guides.

| Document | Description |
|----------|-------------|
| [README.md](development/README.md) | Developer onboarding |
| [SETUP_GUIDE.md](development/SETUP_GUIDE.md) | Local development setup |
| [CODING_STANDARDS.md](development/CODING_STANDARDS.md) | Code style guide |
| [TESTING_GUIDE.md](development/TESTING_GUIDE.md) | Testing practices |
| [GIT_WORKFLOW.md](development/GIT_WORKFLOW.md) | Branching strategy |
| [DATABASE_MIGRATIONS.md](development/DATABASE_MIGRATIONS.md) | Migration guide |
| [CONTRIBUTING.md](development/CONTRIBUTING.md) | Contribution guidelines |

### 📚 [User Guides](user-guides/)

End-user documentation by role.

| Document | Description |
|----------|-------------|
| [README.md](user-guides/README.md) | User guide index |
| [admin-guide.md](user-guides/admin-guide.md) | Admin user manual |
| [field-agent-guide.md](user-guides/field-agent-guide.md) | Field agent training |
| [coordinator-guide.md](user-guides/coordinator-guide.md) | Coordinator manual |
| [strategist-guide.md](user-guides/strategist-guide.md) | Analyst manual |

### 🔧 [Operations](operations/)

Operations and maintenance guides.

| Document | Description |
|----------|-------------|
| [README.md](operations/README.md) | Operations overview |
| [MONITORING.md](operations/MONITORING.md) | Metrics and alerts |
| [BACKUP_RESTORE.md](operations/BACKUP_RESTORE.md) | Data protection |
| [SECURITY_INCIDENTS.md](operations/SECURITY_INCIDENTS.md) | Security response |
| [PERFORMANCE_TUNING.md](operations/PERFORMANCE_TUNING.md) | Optimization |
| [DISASTER_RECOVERY.md](operations/DISASTER_RECOVERY.md) | DR procedures |
| [runbooks/](operations/runbooks/) | Step-by-step procedures |

### 📖 [Reference](reference/)

Quick reference materials.

| Document | Description |
|----------|-------------|
| [ENVIRONMENT_VARIABLES.md](reference/ENVIRONMENT_VARIABLES.md) | Complete env reference |
| [GLOSSARY.md](reference/GLOSSARY.md) | Terminology definitions |
| [THIRD_PARTY_SERVICES.md](reference/THIRD_PARTY_SERVICES.md) | External dependencies |
| [DEPENDENCY_MATRIX.md](reference/DEPENDENCY_MATRIX.md) | Version compatibility |
| [DATA_RETENTION.md](reference/DATA_RETENTION.md) | Retention policies |
| [UradiUserMatrix_v1.0_2026-03-21.md](reference/UradiUserMatrix_v1.0_2026-03-21.md) | User matrix reference |

### 📊 [Status](status/)

Project status and tracking.

| Document | Description |
|----------|-------------|
| [COMPLETION_MATRIX.md](status/COMPLETION_MATRIX.md) | Feature completion |
| [TECHNICAL_DEBT.md](status/TECHNICAL_DEBT.md) | Known issues and debt |
| [SECURITY_AUDIT.md](status/SECURITY_AUDIT.md) | Security findings |
| [PERFORMANCE_BASELINE.md](status/PERFORMANCE_BASELINE.md) | Benchmarks |
| [BUILD_STATUS.md](status/BUILD_STATUS.md) | Build health |

---

## Documentation Standards

### File Naming

- Use UPPERCASE for document names: `README.md`, `SETUP_GUIDE.md`
- Use hyphens for spaces: `user-guide.md`, `api-reference.md`
- Version dated documents: `UradiUserMatrix_v1.0_2026-03-21.md`

### Document Structure

Each document should include:
1. Title and version
2. Status indicator (✅ Complete, 🚧 In Progress, 📝 Planned)
3. Table of contents (for long docs)
4. Clear sections with headers
5. Links to related documents
6. Last updated date

### Review Process

1. **Draft:** Author writes initial content
2. **Review:** Technical lead reviews
3. **Approval:** Stakeholders approve
4. **Publish:** Merge to main, update index

---

## Documentation Checklist

### Phase 1: Foundation (Week 1)
- [x] Directory structure created
- [x] ADR template created
- [x] 7 ADRs written and approved
- [ ] System overview document
- [ ] Component diagrams
- [ ] Data flow documentation
- [x] Documentation index

### Phase 2: Core Documentation (Week 2)
- [ ] Environment variables reference (100%)
- [ ] Database schema documentation
- [ ] OpenAPI specification
- [ ] Security architecture
- [ ] Deployment architecture

### Phase 3: User Documentation (Week 3)
- [ ] Admin guide complete
- [ ] Field agent guide
- [ ] Coordinator guide
- [ ] API documentation
- [ ] Troubleshooting guide

### Phase 4: Operations (Week 4)
- [ ] Monitoring guide
- [ ] Backup/restore procedures
- [ ] Security incident response
- [ ] Disaster recovery plan
- [ ] Runbooks (6 minimum)

---

## Contributing to Documentation

### Quick Edits

1. Edit the file
2. Update the "Last Updated" date
3. Submit for review

### New Documents

1. Create file in appropriate directory
2. Use [template](templates/feature-doc.md)
3. Update this index
4. Link from related documents
5. Submit for review

### Documentation Review

- Accuracy: Is it correct?
- Completeness: Is anything missing?
- Clarity: Is it understandable?
- Links: Do all links work?
- Formatting: Does it render correctly?

---

## Questions?

- **General:** docs@uradi360.com
- **Technical:** tech@uradi360.com
- **Urgent:** #documentation Slack channel

---

**Maintained by:** Technical Lead
**Last Updated:** 2026-03-21
**Next Review:** 2026-04-21
