# Server-Side Sync with Conflict Resolution

## Overview

The W3 Hotel PMS now supports **server-side synchronization** for true multi-device, multi-user collaboration. This extends beyond the local tab sync to enable:

- ✅ **Cross-device sync** - Work on desktop, tablet, and mobile seamlessly
- ✅ **Multi-user collaboration** - Multiple staff members editing simultaneously  
- ✅ **Conflict resolution** - Intelligent handling of simultaneous edits
- ✅ **Offline-first** - Queue changes when offline, sync when reconnected
- ✅ **Version history** - Track all changes with timestamps and authors

## Architecture

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  Device A    │         │    Server    │         │  Device B    │
│  (Desktop)   │◀───────▶│   (Cloud)    │◀───────▶│   (Mobile)   │
│              │  HTTPS  │              │  HTTPS  │              │
│  localStorage│         │  spark.kv    │         │ localStorage │
└──────────────┘         └──────────────┘         └──────────────┘
       │                        │                        │
       ▼                        ▼                        ▼
 Conflict Queue          Version Log             Conflict Queue
```

## Key Features

### 1. **Automatic Server Sync**
- Changes are automatically pushed to server
- Periodic pull for remote changes (configurable interval)
- Exponential backoff for failed syncs
- Bandwidth-efficient delta updates

### 2. **Smart Conflict Detection**
- Timestamp-based conflict detection
- Field-level merge strategies
- User-friendly conflict resolution UI
- Automatic resolution options

### 3. **Conflict Resolution Strategies**

#### **Keep Local** (Default for user's own edits)
- Preserves local changes
- Discards remote changes
- Best when you know your data is correct

#### **Keep Remote** (Default for data staleness > 5 minutes)
- Accepts server version
- Discards local changes  
- Best when working with outdated data

#### **Merge Changes** (Smart field-level merge)
- Combines both versions intelligently
- Preserves non-conflicting fields
- Merges arrays and nested objects
- Best for complementary changes

#### **Manual Resolution**
- User reviews both versions side-by-side
- Choose fields from each version
- Create custom merged version
- Best for critical data conflicts

### 4. **Offline Support**
- Queue changes when offline
- Automatic sync when reconnected
- Conflict-free offline operations
- Status indicator shows queue depth

## How It Works

### Sync Flow

1. **User makes a change** → Saved to localStorage + added to sync queue
2. **Sync worker attempts push** → Sends change to server with metadata
3. **Server processes change**:
   - Checks version/timestamp
   - Detects conflicts if any
   - Returns conflict data or success
4. **Client handles response**:
   - Success → Mark as synced, remove from queue
   - Conflict → Show resolution UI
   - Error → Retry with backoff
5. **Periodic pull** → Fetch remote changes every 30s
6. **Apply remote changes** → Update local state, check for conflicts

### Conflict Detection

A conflict occurs when:
- Same record edited on multiple devices within conflict window (default: 30s)
- Timestamps differ but both recent
- Neither version is clearly "newer"

Example:
```
Device A edits Guest #123 at 10:30:00
Device B edits Guest #123 at 10:30:15
→ Conflict detected (within 30s window)
```

### Conflict Metadata

Each change includes:
```typescript
{
  id: string              // Unique change ID
  key: string             // Storage key (e.g., 'w3-hotel-guests')
  value: T                // Updated data
  timestamp: number       // When change was made
  version: number         // Incremental version
  deviceId: string        // Unique device identifier
  userId: string          // User who made change
  fieldChanges: string[]  // Which fields were modified
}
```

## User Experience

### Sync Status Indicator

Located in the top header, shows:
- **Synced** (green) - All changes saved to server
- **Syncing...** (blue, animated) - Upload/download in progress
- **Offline** (gray) - No connection, queued: X changes
- **Conflict** (orange) - Requires user attention

### Conflict Resolution Dialog

When a conflict is detected:

1. **Alert appears** with conflict count
2. **Dialog shows**:
   - What data is in conflict (e.g., "Guest: John Smith")
   - Your version vs. Server version
   - Who made the server change and when
   - Differences highlighted
3. **Resolution options**:
   - Keep My Changes
   - Use Server Version
   - Merge Both (if possible)
   - Review & Choose Fields (manual)
4. **Preview** - See result before applying
5. **Apply** - Resolve conflict and sync

### Example Conflict UI

```
┌─────────────────────────────────────────────────────┐
│ Conflict Detected: Guest Record                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Guest: Sarah Johnson (#G-2024-0042)                │
│                                                      │
│ Your Changes (Local)    │  Server Changes          │
│ ────────────────────────┼───────────────────────────│
│ Email: sarah@new.com    │  Email: sarah@email.com  │
│ Phone: +1-555-0123     │  Phone: +1-555-0123      │
│ Room: 305 (Changed)    │  Room: 201 (Changed)     │
│                         │                          │
│ Modified: Just now      │  Modified: 30s ago       │
│ By: You                 │  By: John (Front Desk)   │
│                                                      │
│ [Keep My Changes] [Use Server] [Merge] [Manual]    │
└─────────────────────────────────────────────────────┘
```

## Configuration

### Sync Settings (in Settings → System)

```typescript
{
  // How often to check for remote changes (ms)
  syncInterval: 30000, // 30 seconds
  
  // Conflict detection window (ms)
  conflictWindow: 30000, // 30 seconds
  
  // Auto-resolve strategy
  autoResolveStrategy: 'keep-local' | 'keep-remote' | 'merge' | 'manual',
  
  // Maximum offline queue size
  maxQueueSize: 1000,
  
  // Retry configuration
  maxRetries: 5,
  retryBackoff: 'exponential', // or 'linear'
  
  // Enable/disable sync
  syncEnabled: true,
  
  // Sync only on WiFi (mobile optimization)
  wifiOnly: false,
}
```

## API Reference

### `useServerSync<T>(key: string, defaultValue: T, options?)`

Enhanced hook with server synchronization.

```typescript
import { useServerSync } from '@/hooks/use-server-sync'

function MyComponent() {
  const {
    value,                    // Current value
    setValue,                 // Update function
    syncStatus,               // 'synced' | 'syncing' | 'offline' | 'conflict'
    conflicts,                // Active conflicts
    resolveConflict,          // Resolve by ID
    queueDepth,              // Number of pending changes
    lastSyncTime,            // When last synced
    forceSync,               // Trigger immediate sync
  } = useServerSync<Guest[]>('w3-hotel-guests', [])
  
  return (
    // Your component
  )
}
```

### `SyncConflictDialog`

UI component for resolving conflicts.

```typescript
import { SyncConflictDialog } from '@/components/SyncConflictDialog'

<SyncConflictDialog
  conflicts={conflicts}
  onResolve={(conflictId, strategy, value) => {
    resolveConflict(conflictId, strategy, value)
  }}
  onDismiss={(conflictId) => {
    // Optionally ignore conflict
  }}
/>
```

### `ServerSyncProvider`

Context provider for global sync state.

```typescript
import { ServerSyncProvider } from '@/components/ServerSyncProvider'

function App() {
  return (
    <ServerSyncProvider config={syncConfig}>
      {/* Your app */}
    </ServerSyncProvider>
  )
}
```

## Sync Strategies by Data Type

### High Priority (Real-time sync)
- Room status changes
- Reservations and check-ins
- Payment transactions
- Critical inventory updates

**Config**: syncInterval: 10s, autoResolve: 'manual'

### Medium Priority (Standard sync)
- Guest profiles
- Invoices and folios
- Staff schedules
- Reports

**Config**: syncInterval: 30s, autoResolve: 'merge'

### Low Priority (Batched sync)
- Analytics data
- Activity logs
- Historical reports
- System settings

**Config**: syncInterval: 60s, autoResolve: 'keep-remote'

## Conflict Resolution Examples

### Example 1: Guest Email Update

**Scenario**: Two receptionists update the same guest's email simultaneously.

**Conflict**:
- User A: Changes email to "john@newemail.com"
- User B: Changes email to "j.smith@company.com"

**Resolution Options**:
1. **Keep Local** → Use "john@newemail.com"
2. **Keep Remote** → Use "j.smith@company.com"  
3. **Manual** → Ask user which is correct

**Recommended**: Manual (email is critical contact info)

### Example 2: Room Status Update

**Scenario**: Housekeeping and front desk update room status.

**Conflict**:
- Housekeeping: Sets Room 301 to "Clean"
- Front Desk: Sets Room 301 to "Occupied"

**Resolution Options**:
1. **Keep Local** → Use your status
2. **Keep Remote** → Use their status
3. **Merge** → Not applicable (single field)

**Recommended**: Keep most recent (use timestamp), or manual review

### Example 3: Inventory Quantity

**Scenario**: Multiple staff members adjust inventory counts.

**Conflict**:
- User A: Sets towels to 150 (counted)
- User B: Sets towels to 145 (checked out 5)

**Resolution Options**:
1. **Keep Local** → 150
2. **Keep Remote** → 145
3. **Merge** → Use server value and apply local delta: 145 - 5 = 140

**Recommended**: Merge with delta calculation

## Performance Optimization

### Bandwidth Efficiency
- Delta sync (only changed fields)
- Compression for large payloads
- Batch multiple small changes
- Deduplication of redundant updates

### Battery & Data Savings
- Adaptive sync intervals based on activity
- WiFi-only mode for mobile devices
- Suspend sync when tab is hidden
- Coalesce rapid changes

### Scalability
- Per-user sync channels
- Partitioned data by module
- Lazy loading of conflict history
- Automatic cleanup of old versions

## Security

### Authentication
- User authentication via spark.user()
- Device fingerprinting
- Session tokens for sync API

### Authorization
- Role-based sync permissions
- Field-level access control
- Audit trail for all changes

### Data Protection
- End-to-end encryption option
- Secure WebSocket (WSS)
- No sensitive data in conflict logs
- GDPR-compliant retention

## Migration from Local-Only Sync

Existing applications can enable server sync gradually:

1. **Enable sync worker** - Starts background sync process
2. **Initial upload** - Push local data to server
3. **Monitor conflicts** - Review and resolve any initial conflicts
4. **Enable auto-sync** - Turn on automatic synchronization
5. **Test multi-device** - Verify cross-device functionality

No data loss during migration - local data is preserved.

## Troubleshooting

### Sync Not Working

**Check**:
- Internet connection active
- Sync enabled in settings
- No authentication errors in console
- spark.kv API available

**Solution**:
- Verify network connectivity
- Check browser console for errors
- Force sync manually
- Clear sync queue and re-push

### Conflicts Not Resolving

**Check**:
- Conflict resolution strategy set
- No JavaScript errors
- User has permission to resolve

**Solution**:
- Review conflict in dialog
- Choose appropriate strategy
- Contact admin if permissions issue

### Data Not Syncing Between Devices

**Check**:
- Both devices logged in as same user
- Both devices have sync enabled
- Not in WiFi-only mode on cellular

**Solution**:
- Force sync on both devices
- Check sync status indicator
- Verify same user account

## Implementation Status

✅ **Complete**:
- Server-side sync hook (`useServerSync`)
- Conflict detection with configurable window
- Multiple resolution strategies (keep-local, keep-remote, merge, manual)
- Conflict resolution UI dialog
- Server sync status indicator
- Offline queue with retry logic
- Version tracking and metadata
- Field-level change detection
- Cross-tab synchronization integration

## How to Use

### Basic Setup

1. **Import the hook**:
```typescript
import { useServerSync } from '@/hooks/use-server-sync'
```

2. **Replace `useKV` with `useServerSync`**:
```typescript
// Before
const [guests, setGuests] = useKV<Guest[]>('w3-hotel-guests', [])

// After - with server sync
const {
  value: guests,
  setValue: setGuests,
  syncStatus,
  conflicts,
  pendingConflicts,
  resolveConflict,
  queueDepth,
  lastSyncTime,
  forceSync
} = useServerSync<Guest[]>('w3-hotel-guests', [], {
  syncInterval: 30000,  // 30 seconds
  autoResolveStrategy: 'manual',  // or 'keep-local', 'keep-remote', 'merge'
})
```

3. **Add UI components**:
```typescript
import { ServerSyncStatusIndicator } from '@/components/ServerSyncStatusIndicator'
import { ServerSyncConflictDialog } from '@/components/ServerSyncConflictDialog'

// In your component
<ServerSyncStatusIndicator
  syncStatus={syncStatus}
  queueDepth={queueDepth}
  lastSyncTime={lastSyncTime}
  conflictCount={pendingConflicts.length}
  onForceSync={forceSync}
  onShowConflicts={() => setShowConflicts(true)}
/>

<ServerSyncConflictDialog
  open={showConflicts}
  onOpenChange={setShowConflicts}
  conflicts={pendingConflicts}
  onResolve={resolveConflict}
  onIgnore={ignoreConflict}
/>
```

## Future Enhancements

- [ ] Real-time WebSocket sync (push notifications)
- [ ] Collaborative editing indicators (presence)
- [ ] Change feed and activity stream
- [ ] Advanced merge algorithms (3-way merge)
- [ ] Conflict-free replicated data types (CRDTs)
- [ ] Sync analytics and monitoring dashboard
- [ ] Selective sync (choose modules to sync)
- [ ] Peer-to-peer sync (LAN mode)

## Support

For server sync issues:
- Check network connectivity
- Review sync settings
- Monitor conflict queue
- Contact support with sync logs

---

**Developed by W3 Media PVT LTD**  
© 2024 W3 Hotel PMS - Multi-Device Sync Edition
