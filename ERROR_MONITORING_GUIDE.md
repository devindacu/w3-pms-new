# W3 Hotel PMS - Error Monitoring Guide
**Version:** 1.0  
**Date:** February 4, 2026  
**Purpose:** Guide for monitoring and managing errors in production

---

## Overview

The W3 Hotel PMS includes comprehensive error monitoring capabilities to help track, analyze, and resolve issues quickly in production.

## Error Monitoring Components

### 1. Error Logger (`src/lib/errorLogger.ts`)

**Purpose:** Centralized error logging utility that captures all errors, warnings, and informational messages.

**Features:**
- Automatic global error capture
- Unhandled promise rejection tracking
- Local storage persistence
- Error metrics and analytics
- Export functionality

**Usage:**
```typescript
import { logError, logWarning, logInfo } from '@/lib/errorLogger'

// Log an error
logError('Failed to save data', 'ComponentName', { userId: 123 })

// Log a warning
logWarning('API response slow', 'APIService', { responseTime: 3000 })

// Log info
logInfo('User action completed', 'Dashboard', { action: 'export' })
```

---

### 2. Error Monitoring Dashboard (`src/components/ErrorMonitoringDashboard.tsx`)

**Purpose:** Real-time UI for viewing and analyzing errors.

**Access:** Navigate to Settings → Error Monitoring (or add to sidebar)

**Features:**
- Real-time error display
- Error metrics (total errors, error rate, warnings)
- Filtering by level (error/warning/info) and time range
- Top errors and component analysis
- Export logs to JSON
- Clear logs functionality

**Dashboard Metrics:**
- **Total Errors:** Count of errors in selected time range
- **Warnings:** Count of warnings
- **Error Rate:** Errors per hour
- **Total Logs:** All log entries

---

### 3. Health Check Script (`scripts/health-check.sh`)

**Purpose:** Automated server health monitoring.

**Usage:**
```bash
# Run health check
./scripts/health-check.sh

# Run with custom API URL
API_URL=https://pms.yourdomain.com ./scripts/health-check.sh

# Schedule with cron (every 5 minutes)
*/5 * * * * /path/to/scripts/health-check.sh >> /var/log/health-check.log 2>&1
```

**Checks Performed:**
- Server running (health endpoint)
- Response time (< 3 seconds)
- Database connection
- Disk space (< 80% usage)
- Memory usage (< 80%)
- CPU usage (< 80%)
- Recent error logs

**Status Levels:**
- **HEALTHY:** All checks pass
- **DEGRADED:** 1-2 checks fail (warning)
- **UNHEALTHY:** 3+ checks fail (critical)

---

## Error Types

### Level: Error (Critical)
**When to use:** Issues that prevent functionality or cause data loss

**Examples:**
- Database connection failures
- API request failures
- Data validation errors
- Payment processing failures
- Authentication failures

**Response:**
- Immediate investigation required
- Fix within 4 hours
- May require rollback if widespread

---

### Level: Warning (Medium)
**When to use:** Issues that don't break functionality but indicate problems

**Examples:**
- Slow API responses (> 2 seconds)
- Deprecated feature usage
- Low inventory alerts
- Failed sync attempts (retryable)
- Rate limit warnings

**Response:**
- Investigate within 24 hours
- Plan fix for next release
- Monitor for escalation

---

### Level: Info (Low)
**When to use:** Informational messages for tracking user actions

**Examples:**
- User login/logout
- Data export actions
- Report generation
- Configuration changes
- Successful operations

**Response:**
- Review during regular monitoring
- Use for analytics and audit trails

---

## Monitoring Schedule

### Real-Time Monitoring (Hours 0-2 after deployment)
**Frequency:** Every 15 minutes

**Actions:**
1. Check Error Monitoring Dashboard
2. Review error rate (should be < 1 error/hour)
3. Investigate any critical errors immediately
4. Verify no widespread issues

**Alert Thresholds:**
- Error rate > 5/hour: WARNING
- Error rate > 10/hour: CRITICAL
- Any database connection errors: CRITICAL

---

### Active Monitoring (Hours 3-24 after deployment)
**Frequency:** Every hour

**Actions:**
1. Check Error Monitoring Dashboard
2. Review error trends
3. Check health check script results
4. Monitor server metrics

**Alert Thresholds:**
- Same as real-time, but less frequent checks

---

### Standard Monitoring (Days 2-14)
**Frequency:** Twice daily (morning and evening)

**Actions:**
1. Review error summary
2. Check for recurring errors
3. Review top errors by component
4. Plan fixes for next sprint

**Alert Thresholds:**
- Persistent errors (same error > 10 times): Investigate
- New error types: Review and categorize

---

### Ongoing Monitoring (Week 2+)
**Frequency:** Daily

**Actions:**
1. Review error dashboard summary
2. Check weekly error trends
3. Monthly error report
4. Quarterly error analysis

---

## Error Investigation Workflow

### Step 1: Identify Error
1. Check Error Monitoring Dashboard
2. Note error frequency and pattern
3. Identify affected component
4. Check time of occurrence

### Step 2: Reproduce Error
1. Review error context (if available)
2. Attempt to reproduce in development
3. Check related code in component
4. Review recent changes to component

### Step 3: Analyze Root Cause
1. Check error stack trace
2. Review application logs
3. Check database logs (if DB-related)
4. Review network logs (if API-related)
5. Check for related errors

### Step 4: Prioritize Fix
**Priority Levels:**
- **P0 (Critical):** System down, data loss - Fix immediately
- **P1 (High):** Core functionality broken - Fix within 24 hours
- **P2 (Medium):** Secondary functionality affected - Fix within 1 week
- **P3 (Low):** Cosmetic or minor issue - Fix in next release

### Step 5: Implement Fix
1. Create bug fix branch
2. Implement fix with tests
3. Code review
4. Test in staging
5. Deploy to production
6. Monitor for recurrence

### Step 6: Document
1. Update error investigation notes
2. Add to known issues (if needed)
3. Update error handling if pattern found
4. Share learnings with team

---

## Common Errors and Solutions

### Error: "Cannot find module"
**Cause:** Missing dependency or incorrect import path

**Investigation:**
1. Check package.json for dependency
2. Verify import path is correct
3. Check if file exists

**Solution:**
```bash
npm install missing-package
# or
npm ci  # Reinstall all dependencies
```

---

### Error: "Network request failed"
**Cause:** API endpoint unreachable or CORS issue

**Investigation:**
1. Check if server is running
2. Verify API URL is correct
3. Check network tab in browser
4. Check CORS headers

**Solution:**
- Verify server is running: `pm2 status`
- Check server logs: `pm2 logs`
- Update CORS configuration in `server/index.ts`

---

### Error: "Database connection refused"
**Cause:** Database not accessible or connection string incorrect

**Investigation:**
1. Check DATABASE_URL environment variable
2. Verify database server is running
3. Check network connectivity
4. Verify credentials

**Solution:**
```bash
# Verify DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL

# Restart database (if self-hosted)
sudo systemctl restart postgresql
```

---

### Error: "Out of memory"
**Cause:** Memory leak or high memory usage

**Investigation:**
1. Check memory usage: `free -m`
2. Check Node.js memory: `pm2 monit`
3. Review recent code changes
4. Check for memory leaks in code

**Solution:**
```bash
# Increase Node.js memory limit
pm2 delete app
pm2 start app.js --max-memory-restart 1G

# Or set in code
node --max-old-space-size=4096 app.js
```

---

### Error: "Unauthorized" or "Forbidden"
**Cause:** Authentication or authorization failure

**Investigation:**
1. Check user session/token
2. Verify user permissions
3. Check authentication middleware
4. Review CORS settings

**Solution:**
- Verify user is logged in
- Check token expiration
- Verify user has required permissions
- Check server authentication middleware

---

## Error Metrics and KPIs

### Key Performance Indicators

**Error Rate:**
- **Target:** < 1 error per hour
- **Warning:** 1-5 errors per hour
- **Critical:** > 5 errors per hour

**Error Resolution Time:**
- **P0:** < 2 hours
- **P1:** < 24 hours
- **P2:** < 1 week
- **P3:** < 1 month

**Error Recurrence:**
- **Target:** < 5% of fixed errors recur
- **Warning:** 5-10% recurrence
- **Critical:** > 10% recurrence

**System Uptime:**
- **Target:** 99.9% (< 43 minutes downtime/month)
- **Warning:** 99.5-99.9%
- **Critical:** < 99.5%

---

## Reporting

### Daily Error Report
**Recipients:** Development Team  
**Content:**
- Total errors (last 24 hours)
- Top 5 errors by frequency
- New error types
- Error rate trend

---

### Weekly Error Summary
**Recipients:** Team Lead, Product Owner  
**Content:**
- Week-over-week error comparison
- Top components with errors
- Fixed vs open errors
- Trending issues

---

### Monthly Error Analysis
**Recipients:** Management, Stakeholders  
**Content:**
- Monthly error metrics
- Error reduction achievements
- Areas of concern
- Improvement initiatives

---

## Alert Configuration

### Email Alerts
**Critical Events:**
- System unhealthy (3+ health checks fail)
- Error rate > 10/hour
- Database connection failure
- Server down

**Setup:**
```bash
# Configure in health-check.sh
# Uncomment email section and configure:
echo "$message" | mail -s "W3 PMS Alert" admin@example.com
```

---

### Slack Alerts
**Critical + Warning Events:**
- Error rate > 5/hour
- Disk space > 90%
- Memory usage > 90%

**Setup:**
```bash
# Configure webhook in health-check.sh
curl -X POST -H 'Content-type: application/json' \
  --data "{\"text\":\"$message\"}" \
  https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

---

## Error Prevention

### Code Quality
- Maintain 0 TypeScript errors
- Fix all ESLint errors
- Code review all changes
- Write defensive code

### Testing
- Unit test critical functions
- Integration test workflows
- Test error handling paths
- Test edge cases

### Monitoring
- Monitor error trends
- Identify patterns early
- Address root causes
- Continuous improvement

### Documentation
- Document known issues
- Maintain troubleshooting guide
- Share error solutions
- Update runbooks

---

## Tools and Integrations

### Recommended Tools

**Error Tracking:**
- Sentry (production error tracking)
- LogRocket (session replay)
- Datadog (infrastructure monitoring)

**Uptime Monitoring:**
- UptimeRobot
- Pingdom
- StatusCake

**Log Management:**
- Papertrail
- Loggly
- Splunk

---

## Contacts

**On-Call Engineer:** _______________  
**DevOps Team:** _______________  
**Database Admin:** _______________  
**Emergency:** _______________

---

## Appendix: Error Codes

### Application Error Codes

| Code | Description | Severity |
|------|-------------|----------|
| APP-001 | Database connection failed | Critical |
| APP-002 | API request timeout | High |
| APP-003 | Invalid user input | Low |
| APP-004 | Authentication failed | Medium |
| APP-005 | Payment processing failed | Critical |
| APP-006 | Data validation failed | Medium |
| APP-007 | File upload failed | Low |
| APP-008 | Email send failed | Low |
| APP-009 | Report generation failed | Medium |
| APP-010 | Sync conflict detected | Medium |

---

**Document Version:** 1.0  
**Last Updated:** February 4, 2026  
**Next Review:** March 4, 2026
