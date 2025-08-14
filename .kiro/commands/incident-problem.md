---
description: "Action: Standardized process for identifying, managing, and resolving incidents and problems."
---

# Incident & Problem Management

## Severity Levels

| Level | Response Time | Resolution Time | Example |
|-------|---------------|------------------|---------|
| **SEV-1** | 15 min | 1 hour | Complete system outage |
| **SEV-2** | 30 min | 4 hours | Major feature failure |
| **SEV-3** | 2 hours | 1 business day | Minor degradation |
| **SEV-4** | 1 business day | 1 week | Cosmetic issues |

## Incident Response Flow

### 1. Identification
- [ ] Monitoring alert received
- [ ] User report submitted
- [ ] Automated test failure
- [ ] Security scan finding

### 2. Initial Response
```bash
# Acknowledge incident
/incident declare "[SEV-X] Brief description" --channel=incidents

# Gather initial data
kubectl get pods -A | grep -v Running  # Check for failed pods
grep -i error /var/log/app/*.log | tail -n 50  # Check recent errors
```

### 3. Triage & Escalation
- [ ] Assign incident owner
- [ ] Set up war room
- [ ] Notify stakeholders
- [ ] Update status page

### 4. Resolution
- [ ] Implement workaround (if needed)
- [ ] Deploy fix
- [ ] Verify resolution
- [ ] Monitor stability

## Communication Protocol

### Internal Updates (Every 30 min for SEV-1/2)
```markdown
## [INCIDENT] [SEV-X] Brief Description
**Status**: Investigating/Identified/Monitoring/Resolved  
**Start Time**: YYYY-MM-DD HH:MM TZ  
**Impact**: [Service/Feature] is [down/degraded/unavailable]

### Current Status
- [ ] Impact assessment complete
- [ ] Root cause identified
- [ ] Fix in progress
- [ ] Monitoring for resolution

### Next Update
HH:MM TZ or when significant changes occur
```

### External Communication
```markdown
**Subject**: Service Disruption Notification

Dear [Customer/User],

We are currently investigating an issue affecting [service].

**Current Status**: [Investigating/Identified/Monitoring/Resolved]
**Impact**: [Brief description of impact]
**Next Update**: [Time or condition]

We apologize for any inconvenience and appreciate your patience.

- [Company] Team
```

## Post-Incident Process

### 1. Immediate Actions (0-24h)
- [ ] Document timeline
- [ ] Preserve logs & metrics
- [ ] Schedule post-mortem
- [ ] Update documentation

### 2. Post-Mortem (Within 3 Days)
- **What happened?**
- **Why did it happen?**
- **How was it resolved?**
- **How do we prevent recurrence?**

### 3. Action Items
| Task | Owner | Due Date | Status |
|------|-------|----------|--------|
| Fix root cause | @user | YYYY-MM-DD | Not Started |
| Update monitoring | @user | YYYY-MM-DD | In Progress |
| Improve documentation | @user | YYYY-MM-DD | Pending |

## Problem Management

### 1. Problem Identification
- Recurring incidents
- Major incidents (SEV-1/SEV-2)
- High-impact issues
- Security vulnerabilities

### 2. Problem Investigation
- Root cause analysis
- Impact assessment
- Workaround identification
- Permanent solution design

### 3. Resolution & Verification
- Implement solution
- Test thoroughly
- Deploy to production
- Monitor effectiveness

## Tools & Resources

### Monitoring
- [ ] Prometheus/Grafana
- [ ] New Relic/Datadog
- [ ] CloudWatch/Stackdriver
- [ ] Custom dashboards

### Communication
- [ ] Slack (#incidents)
- [ ] PagerDuty/OpsGenie
- [ ] StatusPage.io
- [ ] Email templates

### Documentation
- [ ] Runbooks
- [ ] Architecture diagrams
- [ ] Contact lists
- [ ] Escalation paths

## Metrics & Reporting

### Key Metrics
- MTTR (Mean Time to Resolve)
- MTBF (Mean Time Between Failures)
- Incident volume by severity
- Recurring issue rate
- Customer impact hours

### Monthly Report
- Total incidents by type
- Top contributing factors
- Improvement initiatives
- Success metrics

## Training & Drills

### Quarterly Drills
- Tabletop exercises
- Red team/blue team
- Disaster recovery tests
- Communication drills

### Training Topics
- Incident command system
- Debugging techniques
- Communication protocols
- Tooling proficiency

## On-Call Rotation

### Responsibilities
- Primary responder
- Secondary backup
- Escalation path
- Handoff process

### Best Practices
- Always acknowledge pages within 15 min
- Document actions taken
- Escalate when stuck
- Follow runbooks

## Continuous Improvement

### Process Reviews
- Monthly incident review
- Quarterly process audit
- Annual policy update
- Tooling assessment

### Feedback Loop
- Team retrospectives
- Stakeholder surveys
- Customer feedback
- Metrics analysis
