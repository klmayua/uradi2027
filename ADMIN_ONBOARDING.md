# URADI-360 Admin Onboarding Guide

## Welcome to URADI-360

This guide will help you set up and configure the URADI-360 platform for your campaign.

---

## Initial Setup (First Time)

### Step 1: Login
1. Navigate to the Command Center URL
2. Use the admin credentials:
   - **Email:** admin@jigawa2027.com
   - **Password:** Admin123!
3. Change your password immediately after first login

### Step 2: Create Team Members

Navigate to **Admin > Users** and create accounts for your team:

**Required Roles:**
- **Strategist** (2-3 people): Full access to intelligence and analytics
- **Coordinator** (5-10 people): Manage field operations and agents
- **Analyst** (2-3 people): Review data and generate reports
- **Field Agent** (50+ people): Mobile app users for canvassing

**For each user:**
1. Click "Add User"
2. Enter full name, email, phone
3. Select role
4. Assign LGA (for coordinators and agents)
5. Save - they will receive login credentials via email

### Step 3: Import Voter Data

Navigate to **Data > Import Voters**

**Supported formats:**
- CSV (recommended)
- Excel (.xlsx)
- JSON

**Required columns:**
- full_name
- phone (optional but recommended)
- lga_id
- ward_id (optional)

**Optional columns:**
- gender
- age_range
- occupation
- party_leaning

**Process:**
1. Download the template CSV
2. Fill in your voter data
3. Upload file
4. Map columns to system fields
5. Review preview
6. Confirm import

**Note:** Import in batches of 10,000 for best performance.

---

## Daily Operations

### Morning Routine (8:00 AM)

1. **Check Dashboard**
   - Review overnight sentiment analysis
   - Check field agent check-ins
   - Review any critical incidents

2. **Review Intelligence Reports**
   - Navigate to **Intelligence > Reports**
   - Read daily brief
   - Note any action items

3. **Check Targeting Recommendations**
   - Navigate to **Targeting > Recommendations**
   - Review AI-suggested priority LGAs
   - Assign field teams

### Throughout the Day

**Monitor Field Operations:**
- **Command Center > Field Map**: See real-time agent locations
- **Canvassing > Sessions**: Review completed sessions
- **Incidents > Reports**: Monitor field reports

**Respond to Rapid Response:**
- Check **Rapid Response > Dashboard** for active incidents
- Review AI-suggested responses
- Deploy approved messages

**Track Polls:**
- Monitor **Polls > Active** for real-time results
- Review geographic distribution
- Adjust targeting as needed

### Evening Routine (6:00 PM)

1. **Generate Daily Report**
   - Navigate to **Reports > Daily Summary**
   - Download PDF for leadership

2. **Review Field Performance**
   - Check agent activity summary
   - Identify top performers
   - Follow up on low activity

3. **Plan Tomorrow**
   - Update targeting priorities
   - Assign new areas for canvassing
   - Schedule content for broadcast

---

## Key Features Guide

### 1. Political Atlas
**Location:** Intelligence > Political Atlas

**Use for:**
- Tracking political actors and influencers
- Monitoring loyalty shifts
- Identifying persuadable figures

**How to:**
1. Add actor: Name, title, party, influence level
2. Update regularly with intelligence
3. Use network view to see relationships

### 2. Scenario Planning
**Location:** Intelligence > Scenarios

**Use for:**
- "What-if" analysis
- Coalition stability tracking
- Risk assessment

**How to:**
1. Create scenario with title and description
2. Set probability and impact
3. Run AI simulation for vote projections
4. Monitor for probability changes

### 3. Content Distribution
**Location:** Narrative > Content

**Use for:**
- Creating campaign messages
- Scheduling broadcasts
- Tracking engagement

**How to:**
1. Create content in multiple languages
2. Select target audience (LGAs, segments)
3. Schedule or send immediately
4. Monitor delivery and engagement

### 4. Scorecards
**Location:** Narrative > Scorecards

**Use for:**
- Tracking governance metrics
- Public transparency
- Campaign messaging

**How to:**
1. Create scorecard for a period
2. Add metrics with benchmarks
3. Auto-grade or manual grade
4. Publish to citizen portal

### 5. Election Day Operations
**Location:** Election Day > Command Center

**Use for:**
- Monitor polling units
- Track accreditation
- Parallel vote tabulation
- Incident management

**How to:**
1. Assign monitors to polling units
2. Track check-ins via GPS
3. Receive real-time tallies
4. Monitor incident reports

---

## Troubleshooting

### Field App Issues

**Agent can't login:**
- Verify they have field_agent role
- Check phone number format (+234...)
- Reset password if needed

**Sync not working:**
- Check internet connection
- Verify sync configuration
- Try manual sync from app settings

**GPS not working:**
- Enable location permissions
- Check phone settings
- Restart app

### Data Issues

**Import failed:**
- Check CSV format matches template
- Verify LGA codes are correct
- Remove special characters from names

**Duplicate voters:**
- Use phone number as unique identifier
- Run deduplication tool
- Merge duplicates manually

**Missing data:**
- Check field agent submissions
- Verify sync completed
- Review error logs

### System Issues

**Can't access dashboard:**
- Check internet connection
- Clear browser cache
- Try incognito mode

**Slow performance:**
- Reduce date range in filters
- Clear old data
- Contact support if persistent

---

## Best Practices

### Data Management
✅ **DO:**
- Import voters in batches
- Regular backups
- Verify data before import
- Update voter info after contact

❌ **DON'T:**
- Import duplicate records
- Share login credentials
- Delete historical data
- Ignore data quality issues

### Field Operations
✅ **DO:**
- Brief agents daily
- Monitor real-time location
- Respond to incidents quickly
- Track all voter contacts

❌ **DON'T:**
- Send agents without training
- Ignore safety reports
- Overload single agent
- Skip data entry

### Security
✅ **DO:**
- Use strong passwords
- Enable 2FA where available
- Log out when done
- Report suspicious activity

❌ **DON'T:**
- Share passwords
- Access from public computers
- Leave devices unlocked
- Download data to personal devices

---

## Support Contacts

**Technical Issues:**
- Email: tech@uradi360.com
- Phone: +234-XXX-XXXX-XXX
- Hours: 24/7 for critical issues

**Training Requests:**
- Email: training@uradi360.com
- Schedule: 2-3 days advance notice

**Feature Requests:**
- Submit via Command Center > Feedback
- Or email: product@uradi360.com

---

## Quick Reference

### Important URLs
- **Command Center:** https://uradi360.vercel.app
- **Citizen Portal:** https://uradi360-public.vercel.app
- **API Documentation:** https://uradi360-api.up.railway.app/docs

### Default Credentials
- **Admin:** admin@jigawa2027.com / Admin123!
- **Demo Strategist:** strategist@jigawa2027.com / Strategist123!
- **Demo Coordinator:** coordinator@jigawa2027.com / Coordinator123!

### Keyboard Shortcuts
- `Ctrl + D` - Dashboard
- `Ctrl + M` - Map
- `Ctrl + R` - Reports
- `Ctrl + /` - Search

---

## Checklist: First Week

- [ ] Change admin password
- [ ] Create all team member accounts
- [ ] Import initial voter data
- [ ] Train first batch of field agents
- [ ] Create first intelligence report
- [ ] Set up first poll
- [ ] Test rapid response system
- [ ] Schedule weekly review meeting

---

**Remember:** The platform is only as good as the data you put in. Encourage your team to update records after every contact!

**For additional help:** Check the in-app help icons (?) throughout the platform.
