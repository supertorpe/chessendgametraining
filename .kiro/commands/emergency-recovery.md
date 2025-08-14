---
description: "Action: Execute emergency recovery procedures for critical system failures or incidents."
---

# Emergency Recovery Procedures

## Severity Levels

| Level | Impact | Response Time | Example |
|-------|--------|---------------|---------|
| **SEV-1** | System Down | 15 min | Complete service outage |
| **SEV-2** | Major Impact | 1 hour | Critical feature failure |
| **SEV-3** | Minor Impact | 4 hours | Partial degradation |
| **SEV-4** | Low Impact | 24 hours | Minor issues |

## First Response

### 1. Immediate Actions
- [ ] **STOP** all non-essential changes
- [ ] Activate incident response team
- [ ] Open incident channel (#incident-YYYYMMDD)
- [ ] Notify key stakeholders

### 2. Triage
```bash
# Check system status
docker ps -a          # Container status
kubectl get pods     # Kubernetes pods
journalctl -u nginx  # Web server logs
tail -f /var/log/app/error.log  # Application logs
```

## Common Scenarios

### A. Database Failure

#### Symptoms
- Connection timeouts
- High CPU/memory usage
- Replication lag

#### Recovery Steps
1. **Assess**
   ```sql
   SHOW PROCESSLIST;  -- Check running queries
   SHOW STATUS LIKE 'Threads_connected';
   ```

2. **Mitigate**
   ```bash
   # Kill long-running queries
   KILL [process_id];
   
   # Restart database (if needed)
   sudo systemctl restart mysql
   ```

3. **Verify**
   - Check replication status
   - Verify data consistency
   - Monitor performance metrics

### B. Application Crash

#### Symptoms
- 5xx errors
- Failed health checks
- High error rates

#### Recovery Steps
1. **Rollback**
   ```bash
   # Revert to last stable version
   git revert <bad-commit>
   
   # Or rollback deployment
   kubectl rollout undo deployment/app
   ```

2. **Restart**
   ```bash
   # Graceful restart
   sudo systemctl restart app
   
   # Or force restart
   pkill -f "node app.js"
   ```

### C. Security Breach

#### Immediate Actions
1. **Contain**
   - Block suspicious IPs
   - Rotate credentials
   - Isolate affected systems

2. **Assess**
   - Determine data exposure
   - Check for backdoors
   - Review access logs

3. **Report**
   - Document timeline
   - Notify stakeholders
   - Legal/Compliance reporting if needed

## Communication Protocol

### Internal Updates
```markdown
# [INCIDENT] [SEV-X] Brief Description

**Status**: Investigating/Identified/Monitoring/Resolved  
**Start Time**: YYYY-MM-DD HH:MM TZ  
**Affected Services**: Service1, Service2

## Summary
Brief description of the issue

## Impact
- [ ] Service degradation
- [ ] Partial outage
- [ ] Full outage

## Next Update
HH:MM TZ or when significant changes occur
```

### External Communication
```markdown
**Subject**: Service Disruption Notice

Dear [Customers/Users],

We are currently investigating an issue affecting [service]. 

**Current Status**: [Operational/Degraded/Outage]
**Impact**: [Brief description of impact]
**Next Update**: [Time or condition]

We apologize for any inconvenience and appreciate your patience.

- [Company] Team
```

## Post-Incident Review

### Timeline
```
HH:MM - Issue detected
HH:MM - Team notified
HH:MM - Mitigation started
HH:MM - Service restored
```

### Root Cause Analysis
- **What happened?**
- **Why did it happen?**
- **How was it fixed?**

### Action Items
| Task | Owner | Due Date | Status |
|------|-------|----------|--------|
| Fix root cause | @user | YYYY-MM-DD | In Progress |
| Update monitoring | @user | YYYY-MM-DD | Pending |
| Document process | @user | YYYY-MM-DD | Not Started |

## Emergency Contacts

| Role | Primary | Backup |
|------|---------|--------|
| Incident Commander | @user1 | @user2 |
| Technical Lead | @user3 | @user4 |
| Customer Support | @user5 | @user6 |
| Legal | @user7 | @user8 |

## Quick Reference

### Common Commands
```bash
# Check disk space
df -h

# Check memory usage
free -m

# Check network connections
ss -tulpn

# Check running processes
top -b -n 1 | head -n 20
```

### Important Files
- `/etc/nginx/nginx.conf` - Web server config
- `/var/log/` - System logs
- `/etc/systemd/system/` - Service files
- `~/.ssh/authorized_keys` - SSH access
    *   Create a formal report (e.g., in `docs/reports/EMERGENCY_REPORT_YYYY-MM-DD.md`).
    *   Include: timeline of events, root cause analysis, impact assessment, and action plan for prevention.

3.  **Implement Preventative Measures**:
    *   Based on the findings, update processes, scripts, or documentation to prevent a recurrence.
    *   This could mean improving backup procedures, adding more validation checks, or changing AI tool configurations.

4.  **Resume Normal Operations**:
    *   Once the project is stable and preventative measures are in place, communicate that normal operations can resume.
    *   Update the `PROJECT_DASHBOARD.md` to reflect the new status.

## Roles & Responsibilities

*   **Incident Commander**: Leads the overall response, makes final decisions, and is the primary point of contact.
*   **Technical Lead**: Directs the technical aspects of the recovery, performs system restores, and analyzes the cause.
*   **Communicator**: Manages all internal and external communication during the incident.
*   **Team Members**: Follow instructions, provide information, and assist with recovery tasks as assigned.

## Timeline

*   **STOP & Announce**: < 15 minutes.
*   **Assessment**: 30 minutes - 2 hours.
*   **Intervention & Recovery**: Varies (hours to days), depending on the severity of the emergency.
*   **Communication**: Continuous throughout the incident.
*   **Post-Incident Review**: Within 1 week of the incident's resolution.
