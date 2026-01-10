# Version Control & Automatic Backup System

## Overview
This system provides automatic versioning and backup capabilities for all data changes in the W3 Hotel PMS. Every update to code or data is automatically backed up with the ability to roll back to previous versions.

## Features

### 1. **Automatic Backups**
- **Trigger Events**: Every data modification (create, update, delete)
- **What's Backed Up**: All KV store data (guests, reservations, rooms, invoices, etc.)
- **Retention**: Configurable retention period (default: 90 days)
- **Storage**: Browser IndexedDB for local backups

### 2. **Version Control**
- **Version Tracking**: Each change creates a new version with metadata
- **Change Detection**: Automatic diff tracking between versions
- **Rollback**: One-click restore to any previous version
- **Audit Trail**: Complete history of who changed what and when

### 3. **Backup Types**
- **Auto Backup**: Triggered on every data change
- **Manual Backup**: User-initiated full system backup
- **Scheduled Backup**: Daily automatic full backups
- **Export Backup**: Download backup as JSON file

### 4. **Restore Options**
- **Selective Restore**: Restore specific modules (e.g., only guests)
- **Full Restore**: Restore entire system state
- **Preview Before Restore**: View changes before applying
- **Merge Mode**: Combine old and new data intelligently

## Usage

### Accessing Version Control
1. Navigate to **Settings** → **System** → **Version Control & Backups**
2. View all backup versions in chronological order
3. Filter by date, module, or change type

### Creating Manual Backup
```typescript
// In any component
import { useBackup } from '@/hooks/use-backup'

const { createManualBackup } = useBackup()
await createManualBackup('Before major configuration change')
```

### Restoring a Version
1. Open Version Control panel
2. Select the version you want to restore
3. Preview changes (diff view)
4. Click "Restore to This Version"
5. Confirm restoration

### Exporting Backups
- Click "Export Backup" to download JSON file
- Includes all system data at that point in time
- Can be imported on any W3 PMS instance

## Technical Implementation

### Data Structure
```typescript
interface BackupVersion {
  id: string
  timestamp: number
  createdBy: string
  changeType: 'auto' | 'manual' | 'scheduled'
  description: string
  modules: string[]
  dataSnapshot: Record<string, any>
  size: number
  changes: ChangeLog[]
}

interface ChangeLog {
  module: string
  action: 'create' | 'update' | 'delete'
  recordId: string
  before: any
  after: any
}
```

### Storage Strategy
- **Primary Storage**: Spark KV (cloud-synced)
- **Local Cache**: IndexedDB for fast access
- **Compression**: GZIP for large backups
- **Encryption**: Optional AES-256 for sensitive data

### Performance Optimization
- **Incremental Backups**: Only store changes, not full copies
- **Lazy Loading**: Load backup details on demand
- **Background Processing**: Non-blocking backup creation
- **Cleanup**: Automatic deletion of old backups

## Configuration

### Settings
- **Auto Backup**: Enable/disable automatic backups
- **Backup Frequency**: Every change, hourly, daily
- **Retention Period**: 30/60/90/180 days
- **Max Versions**: Limit number of stored versions
- **Backup Modules**: Select which modules to backup
- **Notification**: Email alerts on backup failures

## Security

### Access Control
- Only admins can access version control
- User permissions for restore operations
- Audit log of all restore actions

### Data Protection
- Backups inherit data encryption settings
- Secure deletion of expired backups
- No sensitive data in metadata

## Best Practices

1. **Manual Backups**: Create before major changes
2. **Test Restores**: Periodically verify backup integrity
3. **Export Critical Data**: Download backups for off-site storage
4. **Monitor Storage**: Keep track of backup storage usage
5. **Document Changes**: Add descriptions to manual backups

## Troubleshooting

### Common Issues
- **Storage Full**: Reduce retention period or delete old backups
- **Slow Performance**: Reduce backup frequency or exclude large modules
- **Failed Restore**: Check browser console for errors, try selective restore
- **Missing Versions**: Check if auto-backup is enabled

## API Reference

### Hooks
- `useBackup()` - Main backup management hook
- `useVersionControl()` - Version history and restore
- `useAutoBackup()` - Automatic backup configuration

### Functions
- `createBackup()` - Create new backup version
- `restoreVersion()` - Restore to specific version
- `exportBackup()` - Download backup as JSON
- `importBackup()` - Upload and restore from JSON
- `deleteVersion()` - Remove specific backup
- `compareVersions()` - View diff between versions

## Future Enhancements
- Cloud backup integration (Google Drive, Dropbox)
- Real-time collaboration conflict resolution
- Backup scheduling with cron expressions
- Multi-property backup synchronization
- Backup encryption with user keys
