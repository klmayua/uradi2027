# URADI-360 Customer Onboarding Playbook

**Version:** 1.0.0
**Date:** April 4, 2026
**Status:** ACTIVE - For CS Team Use
**Classification:** Internal - Confidential

---

## 1. Executive Summary

### 1.1 Onboarding Philosophy

**Mission Statement:**
Deliver seamless, value-driven onboarding that transforms campaigns from software purchasers into electoral victors through URADI-360 mastery.

**Core Principles:**
1. **Campaigns Are Time-Critical:** Elections have immovable deadlines. Every day of onboarding is a day of potential competitive advantage lost.
2. **Multi-Stakeholder Complexity:** Political campaigns involve candidates, managers, coordinators, agents, and strategists—all requiring different training.
3. **Data Sensitivity:** Voter data is the crown jewel. Security and accuracy are non-negotiable.
4. **Offline-First Necessity:** Nigerian connectivity requires robust offline capabilities and sync strategies.
5. **Results-Driven:** Onboarding success is measured by electoral victory, not just platform proficiency.

### 1.2 Onboarding Overview

**Duration:** 8 weeks (standard timeline)
**Phases:** 5 structured phases
**Success Rate Target:** 95% of customers achieving go-live within 8 weeks

### 1.3 Key Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to Value | <2 weeks | First campaign activity launched |
| User Activation | >80% | Users logged in within first week |
| Training Completion | >90% | Users completing role-specific training |
| Go-Live Success | >95% | Platform fully operational by Week 4 |
| CSAT Score | >4.5/5 | Post-onboarding survey |

---

## 2. Pre-Onboarding

### 2.1 Handoff from Sales

**Sales to CS Transition Checklist:**

Before onboarding begins, Sales must provide:

- [ ] Signed contract and initial payment received
- [ ] Order Form with complete details
- [ ] Primary contact information (Campaign Manager)
- [ ] Technical contact information (if applicable)
- [ ] Stakeholder list and roles
- [ ] Special requirements or customizations
- [ ] Expected go-live date
- [ ] Competitor information
- [ ] Pain points and success criteria

**CSM Review Meeting:**
- Schedule 30-minute handoff meeting with Sales
- Review deal notes and requirements
- Clarify any ambiguities
- Confirm timeline expectations
- Set up customer folder in CS system

### 2.2 Onboarding Preparation

**Week -1: Setup Phase**

| Day | Task | Owner | Deliverable |
|-----|------|-------|-------------|
| -7 | Create customer folder and documentation | CSM | Customer file ready |
| -7 | Send welcome email with onboarding overview | CSM | Welcome pack sent |
| -6 | Schedule kickoff call | CSM | Calendar invite sent |
| -6 | Prepare tenant provisioning request | CSM | Provisioning ticket |
| -5 | Set up project tracking | CSM | Project board ready |
| -3 | Prepare training materials | CSM | Training deck ready |
| -1 | Confirm kickoff attendance | CSM | Attendee list confirmed |

---

## 3. Phase 1: Kickoff (Week 1)

### 3.1 Welcome Call

**Duration:** 60 minutes
**Attendees:**
- Required: Campaign Manager, Technical Contact (if any)
- Recommended: Key department heads (Field, Communications, Data)
- URADI-360: CSM, Implementation Specialist (optional)

**Agenda:**

| Time | Topic | Owner | Notes |
|------|-------|-------|-------|
| 0:00-5:00 | Introductions | CSM | All attendees introduce roles |
| 5:00-15:00 | Platform Overview | CSM | 10-min high-level demo |
| 15:00-25:00 | Campaign Goals | Customer | Document success criteria |
| 25:00-40:00 | Timeline Review | CSM | Walk through 8-week plan |
| 40:00-50:00 | Stakeholder Alignment | CSM | Confirm key contacts by role |
| 50:00-60:00 | Next Steps | CSM | Set up Phase 2 meetings |

**Key Questions to Ask:**
1. "What does success look like for your campaign in 8 weeks?"
2. "Who are the key decision makers we should know?"
3. "What are your biggest concerns about technology adoption?"
4. "Do you have existing voter data we need to import?"
5. "What's your preferred communication channel?"

**Deliverables:**
- [ ] Kickoff meeting notes documented
- [ ] Success criteria defined
- [ ] Stakeholder contact list confirmed
- [ ] Phase 2 calendar invites sent

### 3.2 Goal Alignment Workshop

**Purpose:** Ensure URADI-360 capabilities align with campaign objectives

**Activities:**
- Review campaign strategy document (if available)
- Map URADI-360 features to campaign needs
- Define measurable onboarding success metrics
- Identify potential challenges and mitigation strategies

**Campaign Objectives Template:**

| Objective | URADI-360 Feature | Success Metric | Timeline |
|-----------|------------------|----------------|----------|
| Voter Registration | Database import, segmentation | 2M records imported, 90% valid | Week 2 |
| Field Operations | Field app, GPS tracking | 100 agents active, 20 contacts/day | Week 4 |
| Voter Engagement | Citizen portal, messaging | 50K portal visits, 10% engagement | Week 6 |
| Election Monitoring | Real-time results | 95% coverage, <1 hour reporting | Election Day |

### 3.3 Timeline Confirmation

**Standard 8-Week Timeline:**

```
Week 1: Kickoff
├── Day 1-2: Welcome call, goal alignment
├── Day 3-5: Stakeholder introductions
└── Deliverable: Kickoff complete, Phase 2 scheduled

Week 2-3: Setup
├── Tenant provisioning
├── User account creation
├── Branding customization
└── Deliverable: Platform ready for training

Week 3-4: Training
├── Admin training
├── Field coordinator training
├── Field agent training
├── Content manager training
└── Deliverable: All users trained

Week 4: Go-Live
├── System launch
├── Initial campaign activities
├── Daily check-ins
└── Deliverable: Live operations

Week 5-8: Optimization
├── Performance review
├── Process refinement
├── Advanced features
└── Deliverable: Optimized operations
```

**Customization Options:**
- Compressed timeline: 4 weeks (add resources, parallel tracks)
- Extended timeline: 12 weeks (complex requirements, larger teams)
- Phased rollout: By LGA or department

---

## 4. Phase 2: Setup (Weeks 2-3)

### 4.1 Tenant Provisioning

**Technical Setup Checklist:**

| Step | Task | Owner | Duration | Status |
|------|------|-------|----------|--------|
| 2.1.1 | Create tenant in PostgreSQL | DevOps | 2 hours | ⬜ |
| 2.1.2 | Configure row-level security | DevOps | 2 hours | ⬜ |
| 2.1.3 | Seed LGA/ward/polling unit data | DevOps | 4 hours | ⬜ |
| 2.1.4 | Create initial admin account | DevOps | 1 hour | ⬜ |
| 2.1.5 | Configure environment variables | DevOps | 2 hours | ⬜ |
| 2.1.6 | Deploy Command Center | DevOps | 4 hours | ⬜ |
| 2.1.7 | Deploy Citizen Portal | DevOps | 4 hours | ⬜ |
| 2.1.8 | Configure backup policies | DevOps | 2 hours | ⬜ |
| 2.1.9 | Verify tenant isolation | DevOps | 2 hours | ⬜ |
| 2.1.10 | Hand over to CSM | DevOps | 1 hour | ⬜ |

**Timeline:** 2-3 business days
**Dependencies:** Contract signed, payment received

### 4.2 User Account Creation

**User Onboarding Process:**

**Step 1: Admin Account Setup**
- Create primary admin account (Campaign Manager)
- Send welcome email with login credentials
- Schedule admin training
- Enable MFA for admin role

**Step 2: User List Collection**
- Request complete user list from customer
- Include: Name, Email, Phone, Role, LGA/Ward assignment
- Verify data accuracy
- Identify training schedule constraints

**Step 3: Bulk User Creation**
- Create accounts in batches by role
- Send invitation emails with setup instructions
- Track invitation acceptance
- Follow up on non-responders

**User Creation Template:**

| Name | Email | Role | LGA | Ward | Status | Training Date |
|------|-------|------|-----|------|--------|---------------|
| [Name] | [Email] | Admin | All | All | Invited | [Date] |
| [Name] | [Email] | Coordinator | Dutse | All | Invited | [Date] |

### 4.3 Branding Customization

**Citizen Portal Customization:**

| Element | Customization | Customer Input Required | Timeline |
|---------|--------------|------------------------|----------|
| Logo | Upload campaign logo | Yes | 1 day |
| Colors | Primary, secondary colors | Yes | 1 day |
| Fonts | Web-safe font selection | Optional | 1 day |
| Candidate Photos | Upload candidate images | Yes | 1 day |
| Campaign Slogan | Text content | Yes | 1 day |
| Contact Info | Phone, email, social | Yes | 1 day |
| Social Links | Facebook, Twitter, etc. | Optional | 1 day |
| Custom Domain | portal.campaign.com | Optional | 3 days |

**Mobile App Branding:**
- App icon customization (campaign logo)
- Splash screen with campaign branding
- Color theming (primary color)

**Review Process:**
1. Customer provides branding assets
2. CSM configures branding in platform
3. Customer reviews and approves
4. Changes implemented
5. Final sign-off

### 4.4 Data Import

**Data Import Process:**

**Step 1: Data Assessment**
- Review existing data sources
- Assess data quality and completeness
- Identify data mapping requirements
- Determine import method (bulk, API, manual)

**Step 2: Template Provision**
- Provide CSV import template
- Include required fields: full_name, phone, lga_id, ward_id
- Include optional fields: email, address, gender, age, vin
- Provide data validation rules

**Step 3: Data Preparation**
- Customer prepares data in template format
- CSM reviews sample records (100 records)
- Feedback provided on data quality
- Customer finalizes full dataset

**Step 4: Import Execution**
- Import in batches (10,000 records per batch)
- Validate each batch
- Report errors and duplicates
- Customer reviews import results

**Step 5: Data Verification**
- Spot-check imported records
- Verify LGA/ward assignments
- Confirm phone number formatting
- Sign-off on data quality

**Import Pricing:**
- Self-service import: Free (using template)
- Assisted import: ₦500,000 (up to 500K records)
- Full data service: ₦1,000,000 (cleaning + import)

---

## 5. Phase 3: Training (Weeks 3-4)

### 5.1 Training Strategy

**Role-Based Training Approach:**

| Role | Training Duration | Format | Focus Areas |
|------|------------------|--------|-------------|
| **Superadmin** | 3 hours | 1-on-1 | Full platform, tenant management |
| **Admin** | 2 hours | Group | User management, reports, settings |
| **Strategist** | 2 hours | Group | Analytics, segmentation, intelligence |
| **Coordinator** | 1.5 hours | Group | Field ops, agent management, monitoring |
| **Field Agent** | 1 hour | Group (in-person preferred) | Mobile app, canvassing workflow |
| **Content Manager** | 1 hour | Group | Content creation, messaging, portal |
| **Analyst** | 1.5 hours | Group | Reports, dashboards, data export |
| **Finance Manager** | 1 hour | 1-on-1 | Donations, financial tracking |

### 5.2 Admin Training

**Duration:** 2 hours
**Format:** Group webinar or in-person
**Materials:** Admin Training Deck, Practice Environment

**Agenda:**

| Time | Topic | Demo | Practice |
|------|-------|------|----------|
| 0:00-10:00 | Platform Overview | ✅ | ⬜ |
| 10:00-25:00 | User Management | ✅ | ✅ |
| 25:00-45:00 | Voter Database | ✅ | ✅ |
| 45:00-60:00 | Break | ⬜ | ⬜ |
| 60:00-80:00 | Field Operations | ✅ | ✅ |
| 80:00-95:00 | Reports & Analytics | ✅ | ✅ |
| 95:00-110:00 | Settings & Configuration | ✅ | ✅ |
| 110:00-120:00 | Q&A | ⬜ | ⬜ |

**Key Topics:**
- Creating and managing user accounts
- Assigning roles and permissions
- Voter database navigation and search
- Creating voter segments
- Monitoring field operations
- Generating reports
- Platform settings

**Practice Exercises:**
1. Create 5 new user accounts
2. Create a voter segment (e.g., "Strong Support in Dutse")
3. Assign agents to a ward
4. Generate a field activity report

### 5.3 Field Coordinator Training

**Duration:** 1.5 hours
**Format:** Group webinar
**Materials:** Coordinator Training Deck

**Key Topics:**
- Territory management (LGA/Ward/Polling Unit)
- Agent assignment and tracking
- Real-time monitoring dashboard
- Performance metrics and leaderboards
- Incident reporting
- Verification workflows

**Hands-On Activities:**
- Map territory structure
- Assign agents to areas
- Review GPS tracking
- Practice incident reporting

### 5.4 Field Agent Training

**Duration:** 1 hour
**Format:** In-person preferred (can be webinar)
**Materials:** Field App User Guide, Mobile Devices

**Training Locations:**
- Campaign headquarters
- Regional offices
- LGA centers
- Train-the-trainer model for large teams

**Key Topics:**
- Mobile app installation and login
- Offline mode operation
- Voter lookup and registration
- Canvassing workflow
- Photo capture and verification
- GPS check-ins
- Data synchronization

**Practice Session:**
- Mock canvassing exercise
- Photo capture practice
- Offline mode testing
- Sync demonstration

### 5.5 Content Manager Training

**Duration:** 1 hour
**Format:** Group webinar
**Materials:** Content Management Guide

**Key Topics:**
- Creating content (news, events, announcements)
- Message templates
- Broadcast scheduling
- Citizen Portal management
- OSINT brief review
- Approval workflows

### 5.6 Training Best Practices

**Before Training:**
- Send pre-read materials 48 hours in advance
- Confirm attendee list
- Test technology (screenshare, audio)
- Prepare practice environment

**During Training:**
- Start with platform overview
- Use real customer data (anonymized) where possible
- Encourage questions
- Provide hands-on practice time
- Record session for future reference

**After Training:**
- Send recording and materials
- Provide follow-up resources
- Schedule office hours for questions
- Track completion rates

---

## 6. Phase 4: Go-Live (Week 4)

### 6.1 System Launch

**Go-Live Checklist:**

**Technical Readiness:**
- [ ] All users created and active
- [ ] User acceptance testing completed
- [ ] Data import verified
- [ ] Branding approved
- [ ] Mobile app distributed
- [ ] Support channels activated

**Process Readiness:**
- [ ] Training completed for all roles
- [ ] SOPs documented
- [ ] Escalation paths communicated
- [ ] Communication plan activated

**Launch Day Activities:**
- Daily check-in call (15 minutes)
- Monitor platform usage
- Address immediate issues
- Celebrate milestones

### 6.2 Initial Campaign Activities

**Week 4 Focus:**
- Pilot program in 1-2 LGAs
- Small-scale field operations
- Test workflows end-to-end
- Gather user feedback

**Pilot Success Criteria:**
- >50 agents actively using mobile app
- >500 voter contacts logged
- <5% sync failure rate
- >80% user satisfaction

### 6.3 Daily Check-Ins

**Daily Standup Structure (15 min):**

| Agenda | Duration | Owner |
|--------|----------|-------|
| Wins from yesterday | 2 min | Customer |
| Challenges/blockers | 5 min | Customer |
| Today's priorities | 3 min | Customer |
| Support needs | 5 min | CSM |

**Duration:** First 2 weeks of go-live
**Attendance:** Campaign Manager, Key Coordinators, CSM

### 6.4 Issue Resolution

**Issue Escalation During Go-Live:**

| Severity | Response Time | Resolution Target | Escalation Path |
|----------|---------------|-------------------|-----------------|
| P1 (System Down) | 30 min | 2 hours | CSM → Technical Lead |
| P2 (Feature Broken) | 2 hours | 8 hours | CSM → Support Team |
| P3 (Minor Issue) | 4 hours | 24 hours | CSM handles |
| P4 (Question) | 8 hours | 48 hours | Email support |

**Issue Tracking:**
- Log all issues in support system
- Provide daily summary to customer
- Track resolution times
- Identify patterns

---

## 7. Phase 5: Optimization (Weeks 5-8)

### 7.1 Performance Review

**Weekly Review Meeting (1 hour):**

**Agenda:**
- Review key metrics (voter contacts, coverage, data quality)
- Analyze field operations performance
- Identify bottlenecks and issues
- Celebrate successes
- Plan improvements

**Metrics Dashboard:**

| Metric | Week 4 | Week 5 | Week 6 | Week 7 | Week 8 |
|--------|--------|--------|--------|--------|--------|
| Active Agents | 50 | 75 | 100 | 120 | 150 |
| Daily Contacts | 500 | 800 | 1,200 | 1,500 | 2,000 |
| Coverage % | 40% | 55% | 70% | 80% | 90% |
| Data Quality Score | 85% | 88% | 90% | 92% | 95% |

### 7.2 Process Refinement

**Optimization Activities:**
- Workflow adjustments based on feedback
- Additional training for underperforming areas
- Feature adoption encouragement
- Best practice sharing across LGAs
- Automation of repetitive tasks

**Common Optimizations:**
- Territory rebalancing
- Agent reassignments
- Workflow simplification
- Reporting automation
- Integration activation

### 7.3 Advanced Features Rollout

**Week 5-6:**
- OSINT sentiment analysis activation
- Advanced segmentation features
- Automated reporting

**Week 7-8:**
- Scenario planning tools
- Predictive analytics
- Integration with external systems
- Custom dashboard creation

### 7.4 Success Metrics Review

**Final Review (Week 8):**

**Health Score Calculation:**

| Factor | Weight | Score |
|--------|--------|-------|
| User Adoption | 25% | ___ |
| Data Quality | 25% | ___ |
| Feature Utilization | 20% | ___ |
| Campaign Performance | 15% | ___ |
| Support Engagement | 15% | ___ |
| **Total Health Score** | **100%** | **___** |

**Health Score Interpretation:**
- 80-100: Healthy (green)
- 60-79: At Risk (yellow) - intervention needed
- Below 60: Critical (red) - executive escalation

---

## 8. Templates and Resources

### 8.1 Welcome Email Template

```
Subject: Welcome to URADI-360 - Your Campaign Success Starts Now!

Dear [Campaign Manager Name],

Welcome to URADI-360! We're excited to partner with [Campaign Name] on your journey to victory.

Your dedicated Customer Success Manager is [CSM Name], and they'll be your primary contact throughout your campaign.

WHAT'S NEXT:
1. Kickoff Call: [Date/Time] - Calendar invite attached
2. Platform Access: We'll provision your tenant within 48 hours
3. Training Schedule: We'll coordinate training for all roles

GETTING STARTED:
- Onboarding Playbook: [Link]
- User Guides: [Link]
- Support Portal: [Link]

QUESTIONS?
Reply to this email or call [CSM Phone].

Let's win together!

[CSM Name]
Customer Success Manager, URADI-360
```

### 8.2 Kickoff Meeting Agenda Template

See Section 3.1 for full agenda

### 8.3 Training Completion Certificate

**Template:**
```
CERTIFICATE OF COMPLETION

This certifies that
[Name]

has successfully completed training for the role of
[Role]

on the URADI-360 platform

Date: [Date]
CSM: [CSM Name]
```

### 8.4 Go-Live Readiness Checklist

See Section 6.1

### 8.5 Weekly Status Report Template

```
WEEKLY STATUS REPORT - [Campaign Name]
Week: [X] of 8
Date: [Date]

HIGHLIGHTS:
- [Achievement 1]
- [Achievement 2]

METRICS:
- Active Users: [X] / [Y] ([Z]%)
- Voter Contacts: [X]
- Data Quality Score: [X]%

CHALLENGES:
- [Challenge 1]
- [Challenge 2]

NEXT WEEK PRIORITIES:
1. [Priority 1]
2. [Priority 2]

SUPPORT TICKETS:
- Open: [X]
- Resolved this week: [Y]

CSM NOTES:
[Notes]
```

---

## 9. Escalation Procedures

### 9.1 Onboarding Escalation Triggers

**Auto-Escalate When:**
- Go-live delayed by >1 week
- User adoption <50% after Week 2
- Data quality score <60%
- Customer CSAT <3/5
- Critical P1 issues unresolved >4 hours

**Escalation Path:**
```
CSM → CS Manager → Director of CS → VP Customer Success → CEO
```

### 9.2 Intervention Strategies

**Low Adoption:**
- Additional training sessions
- 1-on-1 coaching
- Executive sponsorship
- Workflow review and simplification

**Data Quality Issues:**
- Data cleaning workshop
- Import re-run
- Validation rules training
- Process documentation

**Technical Issues:**
- Technical resource assignment
- Priority support escalation
- Workaround identification
- Root cause analysis

---

## 10. Success Measurement

### 10.1 Onboarding KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Time to First Value | <2 weeks | First campaign activity |
| Time to Go-Live | <4 weeks | Full platform operational |
| User Activation Rate | >80% | Logged in within Week 1 |
| Training Completion | >90% | Completed role training |
| Data Quality Score | >85% | Valid records / Total |
| CSAT Score | >4.5/5 | Post-onboarding survey |
| Support Ticket Volume | <10/week | Tickets created |
| Go-Live Success Rate | >95% | On-time, on-budget |

### 10.2 Post-Onboarding Survey

**Questions (1-5 scale):**
1. How satisfied are you with the onboarding process?
2. Did training prepare you to use the platform effectively?
3. How responsive was the URADI-360 team to your needs?
4. How confident are you in achieving campaign success with URADI-360?
5. Would you recommend URADI-360 to other campaigns?

**Open-ended:**
- What worked well?
- What could be improved?
- Additional comments?

---

## 11. Appendices

### Appendix A: Role Definition Matrix

See `docs/architecture/USER_MATRIX.md`

### Appendix B: Platform Feature List

See `docs/product-briefs/PRODUCT_BRIEF_v1.0.md`

### Appendix C: Troubleshooting Guide

See `docs/user-guides/ADMIN_GUIDE.md`

### Appendix D: Support Contacts

- **CSM:** [CSM Email/Phone]
- **Technical Support:** support@uradi360.com
- **Emergency:** +234-XXX-XXXX-XXXX

---

**END OF ONBOARDING PLAYBOOK**

**Document Version:** 1.0.0
**Last Updated:** April 4, 2026
**Next Review:** Monthly during election season

For questions or feedback, contact the Customer Success Team.
