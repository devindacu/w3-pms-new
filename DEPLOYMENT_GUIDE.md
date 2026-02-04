# W3 Hotel PMS - Production Deployment Checklist
**Version:** 1.0  
**Date:** February 4, 2026  
**Purpose:** Comprehensive deployment guide for production release

---

## Pre-Deployment Checklist

### 1. Code Quality ✅
- [x] All TypeScript compilation errors resolved (0 errors)
- [x] All ESLint errors fixed (0 errors)
- [x] Build successful (`npm run build`)
- [x] No console errors in production build
- [ ] Code review completed and approved
- [ ] All PR comments addressed

### 2. Testing ✅
- [ ] Manual QA testing completed (see QA_TESTING_CHECKLIST.md)
- [ ] All critical workflows tested and passed
- [ ] Edge cases tested
- [ ] Browser compatibility verified
- [ ] Mobile responsiveness verified
- [ ] Performance testing completed
- [ ] Load testing completed (if applicable)

### 3. Security ✅
- [x] CodeQL security scan passed (0 alerts)
- [x] NPM audit shows 0 production vulnerabilities
- [x] Environment variables secured (not in source code)
- [ ] API keys rotated for production
- [ ] Database credentials secured
- [ ] HTTPS configured (production only)
- [ ] CORS settings configured correctly
- [ ] Rate limiting enabled
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified (DOMPurify in use)

### 4. Database ⚠️
- [ ] Database backup created
- [ ] Database migrations tested
- [ ] Database connection string configured (DATABASE_URL)
- [ ] Database user permissions verified
- [ ] Database indexes optimized
- [ ] Database connection pooling configured

### 5. Infrastructure ⚠️
- [ ] Production server provisioned
- [ ] Node.js version verified (v20.20.0)
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] Load balancer configured (if applicable)
- [ ] CDN configured (if applicable)
- [ ] Firewall rules configured
- [ ] Monitoring tools installed

### 6. Environment Configuration ⚠️
- [ ] `.env.production` file created
- [ ] DATABASE_URL set
- [ ] NODE_ENV=production
- [ ] PORT configured
- [ ] API keys configured
- [ ] Third-party service credentials set
- [ ] Logging level configured
- [ ] Error tracking service configured (e.g., Sentry)

### 7. Performance ✅
- [x] Bundle size optimized (1.07 MB gzipped - acceptable)
- [ ] Images optimized
- [ ] Lazy loading implemented (future improvement)
- [ ] Code splitting implemented (future improvement)
- [ ] Caching headers configured
- [ ] Service worker configured (future - PWA)

### 8. Documentation ✅
- [x] README.md updated
- [x] API documentation complete (if applicable)
- [x] Deployment guide created (this document)
- [x] QA testing checklist created
- [x] Error monitoring guide created
- [ ] User manual updated
- [ ] Admin guide updated

---

## Deployment Steps

### Phase 1: Preparation (30 minutes)

#### 1.1 Create Production Branch
```bash
git checkout main
git pull origin main
git checkout -b production/v1.4.0
```

#### 1.2 Version Bump
```bash
# Update version in package.json
npm version patch  # or minor, or major
git add package.json package-lock.json
git commit -m "chore: bump version to 1.4.0"
```

#### 1.3 Create Release Tag
```bash
git tag -a v1.4.0 -m "Production release v1.4.0"
git push origin production/v1.4.0 --tags
```

#### 1.4 Build Production Assets
```bash
npm ci  # Clean install
npm run build  # Production build
```

#### 1.5 Verify Build
```bash
# Check dist folder
ls -lh dist/
# Verify no errors in console
node dist/index.js  # Test server build (if applicable)
```

---

### Phase 2: Database Setup (15 minutes)

#### 2.1 Backup Current Database (if upgrading)
```bash
# PostgreSQL example (Neon)
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql
```

#### 2.2 Run Migrations
```bash
export DATABASE_URL="your-production-database-url"
npm run db:push  # Run Drizzle migrations
```

#### 2.3 Verify Database
```bash
# Connect to database and verify tables
psql $DATABASE_URL
\dt  # List tables
\q   # Quit
```

---

### Phase 3: Server Deployment (20 minutes)

#### 3.1 Upload Files to Server
```bash
# Using SCP (example)
scp -r dist/ user@production-server:/var/www/w3-pms/
scp package.json package-lock.json user@production-server:/var/www/w3-pms/
scp -r server/ user@production-server:/var/www/w3-pms/
scp -r shared/ user@production-server:/var/www/w3-pms/
```

#### 3.2 Install Dependencies on Server
```bash
ssh user@production-server
cd /var/www/w3-pms
npm ci --production  # Production dependencies only
```

#### 3.3 Configure Environment Variables
```bash
# Create .env file on server
cat > .env << EOF
NODE_ENV=production
DATABASE_URL=your-production-database-url
PORT=5000
# Add other environment variables
EOF
```

#### 3.4 Start Application
```bash
# Using PM2 (recommended)
npm install -g pm2
pm2 start server/index.js --name w3-pms
pm2 save
pm2 startup  # Enable auto-start on server reboot

# Or using systemd
sudo systemctl start w3-pms
sudo systemctl enable w3-pms
```

---

### Phase 4: Verification (15 minutes)

#### 4.1 Health Check
```bash
# Check server is running
curl http://localhost:5000/health
# Expected: {"status":"ok","timestamp":"...","uptime":...}

# Check frontend loads
curl http://localhost:5000
# Expected: HTML content
```

#### 4.2 Smoke Tests
- [ ] Home page loads without errors
- [ ] Login works (if applicable)
- [ ] Navigation between modules works
- [ ] Database queries return data
- [ ] API endpoints respond correctly

#### 4.3 Error Monitoring
```bash
# Check server logs
pm2 logs w3-pms --lines 50

# Check for errors
pm2 logs w3-pms --err
```

#### 4.4 Performance Check
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] No memory leaks
- [ ] CPU usage normal

---

### Phase 5: DNS & SSL (10 minutes)

#### 5.1 Configure DNS
```bash
# Point domain to server IP
# A record: pms.yourdomain.com -> server-ip-address
# Wait for DNS propagation (up to 48 hours, usually minutes)
```

#### 5.2 Install SSL Certificate
```bash
# Using Let's Encrypt (certbot)
sudo certbot --nginx -d pms.yourdomain.com

# Or manually configure SSL
# Copy certificate files to /etc/ssl/
# Update nginx/apache configuration
```

#### 5.3 Test HTTPS
```bash
curl https://pms.yourdomain.com/health
# Verify SSL certificate is valid
```

---

### Phase 6: Monitoring Setup (15 minutes)

#### 6.1 Configure PM2 Monitoring
```bash
pm2 install pm2-logrotate  # Log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

#### 6.2 Set Up Uptime Monitoring
- [ ] Configure UptimeRobot or similar service
- [ ] Set up email/SMS alerts for downtime
- [ ] Configure health check endpoint monitoring

#### 6.3 Set Up Error Tracking
- [ ] Install Sentry SDK (optional)
- [ ] Configure error reporting
- [ ] Test error reporting

#### 6.4 Set Up Analytics (optional)
- [ ] Google Analytics configured
- [ ] Tracking code installed
- [ ] Goals and conversions set up

---

### Phase 7: Final Checks (10 minutes)

#### 7.1 Security Scan
```bash
# Run security headers check
curl -I https://pms.yourdomain.com
# Verify: X-Frame-Options, Content-Security-Policy, etc.
```

#### 7.2 Backup Verification
- [ ] Database backup successful
- [ ] Code backup in version control
- [ ] Configuration backup saved

#### 7.3 Documentation Update
- [ ] Update deployment notes
- [ ] Document any issues encountered
- [ ] Update runbook

---

## Post-Deployment Monitoring (First 48 Hours)

### Hour 1-2: Intensive Monitoring
- [ ] Monitor error logs every 15 minutes
- [ ] Check server resource usage
- [ ] Verify user activity (if live)
- [ ] Test critical workflows manually

### Hour 3-24: Active Monitoring
- [ ] Check error logs every hour
- [ ] Monitor server metrics (CPU, RAM, disk)
- [ ] Review user reports/complaints
- [ ] Check database performance

### Day 2-7: Standard Monitoring
- [ ] Check error logs twice daily
- [ ] Review metrics dashboard daily
- [ ] Address any reported issues
- [ ] Document lessons learned

### Week 2+: Ongoing Monitoring
- [ ] Weekly error log review
- [ ] Weekly performance review
- [ ] Monthly security review
- [ ] Quarterly capacity planning

---

## Rollback Plan

### When to Rollback
- Critical security vulnerability discovered
- Data corruption detected
- Performance degradation > 50%
- Critical functionality broken
- High error rate (> 10 errors/hour)

### Rollback Steps (15 minutes)

#### 1. Stop Current Application
```bash
pm2 stop w3-pms
```

#### 2. Restore Previous Code
```bash
git checkout v1.3.0  # Previous version
npm ci
npm run build
```

#### 3. Restore Database (if needed)
```bash
# Restore from backup
psql $DATABASE_URL < backup-YYYYMMDD-HHMMSS.sql
```

#### 4. Restart Application
```bash
pm2 restart w3-pms
```

#### 5. Verify Rollback
```bash
curl http://localhost:5000/health
# Check version number
# Test critical workflows
```

#### 6. Communicate Rollback
- [ ] Notify users of rollback
- [ ] Explain what happened
- [ ] Provide timeline for fix
- [ ] Document root cause

---

## Troubleshooting

### Issue: Server Won't Start

**Symptoms:**
- PM2 shows "errored" status
- Port already in use error

**Solutions:**
```bash
# Check if port is in use
sudo lsof -i :5000

# Kill process on port
sudo kill -9 $(sudo lsof -t -i:5000)

# Check environment variables
pm2 env 0

# Check logs for specific error
pm2 logs w3-pms --err
```

---

### Issue: Database Connection Failed

**Symptoms:**
- "DATABASE_URL environment variable is required"
- "Connection refused"

**Solutions:**
```bash
# Verify DATABASE_URL is set
echo $DATABASE_URL

# Test database connection
psql $DATABASE_URL

# Check firewall rules
sudo ufw status

# Verify database server is running
pg_isready -d $DATABASE_URL
```

---

### Issue: High Memory Usage

**Symptoms:**
- Server crashes randomly
- Out of memory errors

**Solutions:**
```bash
# Increase Node.js memory limit
pm2 delete w3-pms
pm2 start server/index.js --name w3-pms --max-memory-restart 1G

# Monitor memory usage
pm2 monit

# Check for memory leaks
node --inspect server/index.js
```

---

### Issue: Slow Performance

**Symptoms:**
- Page load time > 5 seconds
- API timeout errors

**Solutions:**
```bash
# Enable production optimizations
export NODE_ENV=production

# Check bundle size
ls -lh dist/assets/

# Enable compression
# Update server config to use gzip

# Monitor database queries
# Add indexes to slow queries

# Implement caching
# Use Redis or similar
```

---

## Emergency Contacts

**Technical Lead:** _______________  
**Database Admin:** _______________  
**DevOps:** _______________  
**On-Call Support:** _______________

---

## Deployment Sign-Off

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Version:** v1.4.0  
**Database Migration:** ⬜ Yes ⬜ No  
**Rollback Plan Tested:** ⬜ Yes ⬜ No  
**Monitoring Configured:** ⬜ Yes ⬜ No

**Approval:**
- Technical Lead: _______________ Date: _______________
- Product Owner: _______________ Date: _______________
- DevOps: _______________ Date: _______________

---

## Next Deployment

**Scheduled Date:** _______________  
**Planned Features:** _______________  
**Required Testing:** _______________
