# Channel Manager and Backup System Documentation

## Overview

This document describes the channel manager integration and backup system implemented for the W3 Hotel PMS.

## Features Implemented

### 1. Channel Manager Integration

The system now supports integration with major OTA (Online Travel Agency) platforms:

- **Booking.com** - Using Booking.com Connectivity API
- **Agoda** - Using Agoda YCS (Yield Control System) API
- **Expedia** - Using Expedia Partner Central API
- **Airbnb** - Using Airbnb Host API

#### Key Capabilities

Each channel integration provides the following functionality:

1. **Booking Synchronization** - Fetch and sync bookings from OTA platforms
2. **Availability Management** - Push room availability to channels
3. **Rate Management** - Update room rates across channels
4. **Booking Status Updates** - Update booking status on OTA platforms

### 2. Database Schema Updates

New tables have been added to support channel management and backup:

#### channel_bookings
Stores bookings received from OTA channels.
- Links to channels and reservations
- Tracks external booking IDs
- Stores raw booking data for reference
- Tracks sync status

#### channel_sync_logs
Maintains a history of all synchronization operations.
- Records success/failure status
- Tracks number of records processed
- Stores error messages for debugging

#### system_backups
Tracks all system backup operations.
- Records backup metadata
- Tracks backup file location and size
- Stores status and error information

#### data_sync_queue
Queue for asynchronous data synchronization.
- Manages pending sync operations
- Tracks retry attempts
- Stores error details for failed operations

### 3. API Endpoints

#### Channel Manager APIs

**GET /api/channel-bookings**
- Fetches all channel bookings from the database

**POST /api/channels/:id/sync-bookings**
- Syncs bookings from a specific channel
- Body: `{ startDate, endDate, channelName, config }`
- Returns: `{ success, recordsProcessed, recordsSuccess, recordsFailed, errors }`

**POST /api/channels/:id/sync-availability**
- Pushes availability to a channel
- Body: `{ channelName, config, roomType, date, available }`
- Returns: `{ success }`

**POST /api/channels/:id/sync-rates**
- Pushes rates to a channel
- Body: `{ channelName, config, roomType, date, rate }`
- Returns: `{ success }`

**GET /api/channel-sync-logs**
- Fetches all channel sync logs

#### Backup APIs

**POST /api/backup/create**
- Creates a full system backup
- Body: `{ createdBy, options: { includeAuditLogs, includeSystemSettings, compress, location } }`
- Returns: `{ success, filePath }`

**GET /api/backup/list**
- Lists all available backups
- Returns: Array of backup records

**POST /api/backup/restore**
- Restores data from a backup file
- Body: `{ filePath, options: { skipExisting, validateData } }`
- Returns: `{ success }`

**DELETE /api/backup/:id**
- Deletes a backup record and file
- Returns: `{ success }`

#### Data Sync APIs

**POST /api/sync/queue**
- Adds an item to the sync queue
- Body: `{ entityType, entityId, operation, data }`
- Returns: `{ success }`

**GET /api/sync/status**
- Gets current sync queue status
- Returns: `{ pendingCount, failedCount, isProcessing }`

**POST /api/sync/process**
- Manually triggers sync queue processing
- Returns: `{ success }`

### 4. Services Architecture

#### ChannelManagerService (Base Class)
Abstract base class for all channel integrations with common functionality:
- Booking synchronization to database
- Sync logging
- Error handling

#### Channel-Specific Services
- **BookingComService** - Booking.com integration
- **AgodaService** - Agoda integration
- **ExpediaService** - Expedia integration
- **AirbnbService** - Airbnb integration

Each service implements:
- `fetchBookings(startDate, endDate)` - Retrieve bookings from channel
- `syncAvailability(roomType, date, available)` - Update availability on channel
- `syncRates(roomType, date, rate)` - Update rates on channel
- `updateBookingStatus(externalBookingId, status)` - Update booking status

#### BackupService
Handles all backup and restore operations:
- Creates compressed JSON backups of all database tables
- Supports selective table backup
- Handles data restoration with foreign key constraint ordering
- Manages backup file lifecycle

#### DataSyncService
Manages asynchronous data synchronization:
- Queue-based processing
- Automatic retry on failure
- Cross-entity synchronization (reservations, rooms, guests)
- Auto-sync mode with configurable interval

## Configuration

### Channel Integration Configuration

Each channel requires specific configuration:

```typescript
interface ChannelConfig {
  apiKey?: string;        // API key for authentication
  apiSecret?: string;     // API secret for authentication
  propertyId: string;     // Property/Hotel ID on the channel
  endpoint?: string;      // Custom API endpoint (optional)
  hotelId?: string;       // Alternative hotel identifier
}
```

### Backup Configuration

```typescript
interface BackupOptions {
  includeAuditLogs?: boolean;      // Include audit logs in backup
  includeSystemSettings?: boolean;  // Include system settings
  compress?: boolean;               // Compress backup file
  location?: string;                // Backup file location
}
```

## Usage Examples

### Syncing Bookings from Booking.com

```typescript
POST /api/channels/1/sync-bookings
{
  "channelName": "booking.com",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "config": {
    "propertyId": "PROP123456",
    "apiKey": "your-api-key"
  }
}
```

### Creating a System Backup

```typescript
POST /api/backup/create
{
  "createdBy": "admin",
  "options": {
    "includeAuditLogs": true,
    "includeSystemSettings": true,
    "compress": true
  }
}
```

### Adding Item to Sync Queue

```typescript
POST /api/sync/queue
{
  "entityType": "reservation",
  "entityId": 123,
  "operation": "update",
  "data": {
    "status": "checked-in"
  }
}
```

## Database Persistence

The system ensures data persistence across updates by:

1. **Using PostgreSQL** - All data is stored in a persistent PostgreSQL database
2. **Migration System** - Database schema changes are managed through SQL migrations
3. **Backup System** - Automated and manual backup capabilities
4. **Sync Queue** - Ensures data consistency across system updates
5. **Audit Logs** - Tracks all data changes for accountability

## Migration Guide

To apply the new database tables, run the migration:

```sql
-- Execute migrations/002_channel_manager_backup.sql
-- This creates all new tables and indexes
```

## Auto-Sync Feature

The data sync service automatically starts when the server starts:

```typescript
// In server/index.ts
dataSyncService.startAutoSync(30000); // Process queue every 30 seconds
```

This ensures:
- Pending data changes are processed automatically
- Failed operations are retried
- System data stays consistent

## Security Considerations

1. **API Keys** - Store channel API keys securely in the database
2. **Backup Encryption** - Backup files can be compressed but consider encrypting sensitive data
3. **Access Control** - Implement proper authentication for backup/restore endpoints
4. **Audit Logs** - All operations are logged for security auditing

## Future Enhancements

1. **Real-time Sync** - Implement webhook listeners for instant updates from channels
2. **Conflict Resolution** - Add logic to handle booking conflicts across channels
3. **Advanced Reporting** - Channel performance analytics and reporting
4. **Automated Backups** - Scheduled automatic backups with retention policies
5. **Incremental Backups** - Support for incremental backups to save space
6. **Cloud Storage** - Integration with cloud storage for backups (S3, Azure, etc.)

## Troubleshooting

### Sync Failures
Check the `channel_sync_logs` table for error messages and failed operations.

### Backup Issues
Ensure the backup directory has proper write permissions and sufficient disk space.

### Queue Processing
Monitor the `data_sync_queue` table for stuck or failed items. Items are retried up to 3 times before being marked as failed.

## Support

For issues or questions, please refer to the main README or contact the development team.
