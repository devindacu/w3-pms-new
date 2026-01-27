# Deployment Checklist for Backup and Channel Manager Features

## Pre-Deployment Steps

### 1. Database Setup
- [ ] Ensure PostgreSQL database is running
- [ ] Set `DATABASE_URL` environment variable
- [ ] Run database migration: `psql $DATABASE_URL -f migrations/002_channel_manager_backup.sql`
- [ ] Verify all tables created successfully

### 2. Environment Configuration
Required environment variables:
```bash
# Required
DATABASE_URL=postgresql://user:password@host:5432/database

# Optional (with defaults)
BACKUP_DIR=/var/lib/hotel-pms/backups  # Default backup location
SYNC_INTERVAL_MS=60000                  # Sync queue processing interval
```

### 3. Directory Setup
```bash
# Create backup directory
sudo mkdir -p /var/lib/hotel-pms/backups
sudo chown -R app-user:app-group /var/lib/hotel-pms/backups
sudo chmod 750 /var/lib/hotel-pms/backups
```

### 4. Channel Configuration
For each OTA channel you want to integrate:
- [ ] Obtain API credentials from the OTA platform
- [ ] Add channel record to the `channels` table
- [ ] Store encrypted credentials in `connection_details` field
- [ ] Test connection with a test booking sync

## Channel-Specific Setup

### Booking.com
- Register at: https://connect.booking.com/
- Get: Property ID and API Key
- API Type: XML-based

### Agoda
- Register at: https://developer.agoda.com/
- Get: Hotel ID and API Key
- API Type: JSON REST

### Expedia
- Register at: https://developer.expediagroup.com/
- Get: Property ID and OAuth Token
- API Type: JSON REST

### Airbnb
- Register at: https://www.airbnb.com/partner
- Get: Listing ID, API Key, and Secret
- API Type: JSON REST

## Deployment Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Application (if needed)
```bash
npm run build
```

### 3. Run Tests
```bash
DATABASE_URL='postgresql://test:test@localhost:5432/test' npx tsx server/test-services.ts
```

### 4. Start Server
```bash
npm run server
```

### 5. Verify Server Started
- Check server logs for: "API Server running on http://localhost:3001"
- Check auto-sync started: Data sync service should be processing queue

## Post-Deployment Verification

### 1. Test API Endpoints
```bash
# Test backup list
curl http://localhost:3001/api/backup/list

# Test sync status
curl http://localhost:3001/api/sync/status

# Test channel bookings list
curl http://localhost:3001/api/channel-bookings
```

### 2. Create Initial Backup
```bash
curl -X POST http://localhost:3001/api/backup/create \
  -H "Content-Type: application/json" \
  -d '{"createdBy": "system", "options": {"compress": true}}'
```

### 3. Verify Auto-Sync
- Check `data_sync_queue` table for pending items
- Wait for sync interval to pass
- Verify items are being processed

### 4. Test Channel Sync (if configured)
```bash
curl -X POST http://localhost:3001/api/channels/1/sync-bookings \
  -H "Content-Type: application/json" \
  -d '{
    "channelName": "booking.com",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "config": {
      "propertyId": "YOUR_PROPERTY_ID",
      "apiKey": "YOUR_API_KEY"
    }
  }'
```

## Monitoring

### Key Metrics to Monitor
1. Sync queue length: `SELECT COUNT(*) FROM data_sync_queue WHERE status='pending'`
2. Failed syncs: `SELECT COUNT(*) FROM data_sync_queue WHERE status='failed'`
3. Backup success rate: `SELECT status, COUNT(*) FROM system_backups GROUP BY status`
4. Channel sync logs: `SELECT * FROM channel_sync_logs ORDER BY started_at DESC LIMIT 10`

### Set Up Alerts
- [ ] Alert when sync queue has >100 pending items
- [ ] Alert when backup fails
- [ ] Alert when channel sync fails
- [ ] Alert when disk space for backups is low

## Security Checklist

- [ ] API endpoints protected with authentication
- [ ] Channel API credentials encrypted in database
- [ ] Backup files have restricted permissions (750 or tighter)
- [ ] Database credentials secured
- [ ] CORS configured for production domains only
- [ ] Rate limiting enabled for external API calls

## Production Readiness

### Before Going Live
- [ ] XML parser implemented for Booking.com (currently using placeholder)
- [ ] Authentication/authorization added to all endpoints
- [ ] Backup encryption implemented for sensitive data
- [ ] Monitoring and alerting configured
- [ ] Error tracking service integrated (e.g., Sentry)
- [ ] Load testing completed
- [ ] Disaster recovery plan documented

### Recommended Enhancements
- [ ] Add webhook listeners for real-time channel updates
- [ ] Implement backup retention policies
- [ ] Add cloud storage integration for backups
- [ ] Set up automated scheduled backups
- [ ] Implement conflict resolution for booking conflicts
- [ ] Add channel performance analytics

## Rollback Plan

If issues arise after deployment:

1. **Stop Auto-Sync**
```typescript
// In server console or API call
dataSyncService.stopAutoSync();
```

2. **Restore from Backup**
```bash
curl -X POST http://localhost:3001/api/backup/restore \
  -H "Content-Type: application/json" \
  -d '{"filePath": "/path/to/backup.json.gz"}'
```

3. **Revert Code**
```bash
git revert HEAD
git push
```

## Support Resources

- Implementation Guide: `CHANNEL_MANAGER_BACKUP_GUIDE.md`
- Implementation Summary: `BACKUP_CHANNEL_IMPLEMENTATION.md`
- Database Migration: `migrations/002_channel_manager_backup.sql`
- Test Script: `server/test-services.ts`

## Contact

For issues or questions:
- Check the documentation files
- Review sync logs in database
- Check server logs for errors
- Contact development team

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Sign-off**: _______________
