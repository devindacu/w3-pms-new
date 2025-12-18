# 📴 Mobile-Optimized Offline Mode - Complete Guide

## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
- [User Guide](#user-guide)
- [Developer Guide](#developer-guide)
- [Components Reference](#components-reference)
- [API Reference](#api-reference)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

The W3 Hotel PMS Offline Mode is a comprehensive solution that enables hotel staff to continue critical operations during internet connectivity issues. All actions are automatically queued with priority-based syncing when connection is restored.

### Why Offline Mode?

**Business Continuity**: Hotels operate 24/7 and cannot afford downtime  
**Guest Experience**: Seamless service regardless of connectivity  
**Staff Efficiency**: No waiting for slow connections  
**Data Integrity**: Zero data loss with automatic sync

### Architecture

```
┌─────────────────────────────────────────────┐
│           User Interface Layer              │
│  (Components, Quick Actions, Indicators)    │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Application Logic Layer             │
│     (Hooks, State Management, Events)       │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│          Offline Manager Layer              │
│   (Queue Management, Sync, Persistence)     │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│          Storage & Sync Layer               │
│    (LocalStorage, Online Detection, API)    │
└─────────────────────────────────────────────┘
```

---

## Key Features

### ✨ Automatic Detection
- Real-time online/offline detection
- Seamless transition between modes
- Visual indicators throughout UI
- No manual mode switching

### 💾 Reliable Storage
- Browser LocalStorage persistence
- Survives page refreshes
- Automatic data backup
- Efficient serialization

### 🎯 Priority Queue System
- **High**: Check-ins, payments, status updates
- **Medium**: Tasks, orders, inventory
- **Low**: Feedback, notes, comments

### 🔄 Smart Syncing
- Automatic when connection restored
- Priority-based processing
- Manual sync option
- Batch operation handling

### 📱 Mobile First
- Touch-optimized interface
- Responsive design
- Swipe gestures
- Bottom sheet navigation

---

## Getting Started

### For Users

#### Quick Start (3 Steps)
1. **Navigate** to "Quick Operations" in sidebar
2. **Perform** your action (check-in, status update, payment)
3. **Relax** - it's automatically saved and will sync

#### First Time Setup
No setup required! Offline mode is always active and ready.

#### Testing Offline Mode
1. Open the application
2. Turn off your Wi-Fi/internet
3. Perform a quick operation
4. Turn Wi-Fi back on
5. Watch it sync automatically

### For Developers

#### Installation
```bash
# Already included in the project
# No additional packages needed
```

#### Basic Usage
```typescript
import { useOfflineStatus, useOfflineQueue } from '@/hooks/use-offline'

function MyComponent() {
  const { isOnline, queueStatus } = useOfflineStatus()
  const { queueOperation } = useOfflineQueue()

  const handleAction = async () => {
    // Update local state first
    updateLocalState()
    
    // Queue for sync
    await queueOperation('update', 'resource-type', data, 'high')
    
    // Show feedback
    toast.success(`Saved ${!isOnline ? '(will sync)' : ''}`)
  }
}
```

---

## User Guide

### Dashboard Indicators

#### Desktop Header
- **Wi-Fi Icon**: Shows connection status
- **Badge Number**: Pending operations count
- **Click**: Opens status popover with details

#### Mobile Header
- **Offline Button**: Opens full status sheet
- **Badge**: Shows pending count
- **Tap**: Access quick operations

### Quick Operations

#### Accessing Quick Operations
1. **Desktop**: Click "Quick Operations" in sidebar
2. **Mobile**: Tap offline button or use sidebar

#### Available Operations

##### 1. Check-In/Check-Out
**Use When**: Guest arriving or departing
**Steps**:
1. Toggle Check-In or Check-Out
2. Select available room
3. Enter guest name (check-in only)
4. Tap Complete

##### 2. Room Status Update
**Use When**: Room status changes
**Steps**:
1. Select room from list
2. View current status
3. Choose new status
4. Tap Update

##### 3. Payment Recording
**Use When**: Receiving guest payment
**Steps**:
1. Enter amount
2. Select payment method
3. Add reference (optional)
4. Tap Record

### Syncing Operations

#### Automatic Sync
- Happens when connection restored
- Priority order processing
- Background operation
- Toast notification on complete

#### Manual Sync
1. Click/tap "Sync Now" button
2. Wait for progress indicator
3. See success confirmation
4. Operations marked as synced

### Status Monitoring

#### Queue Status
- **Pending**: Operations waiting to sync
- **Synced**: Successfully synced operations
- **Last Sync**: Time of last successful sync

#### Visual Indicators
- 🟢 Green = Online, all synced
- 🔴 Red = Offline mode active
- 🟡 Yellow = Pending operations

---

## Developer Guide

### Core Components

#### 1. Offline Manager
**Location**: `/src/lib/offlineManager.ts`

```typescript
class OfflineManager {
  // Singleton instance
  static getInstance(): OfflineManager
  
  // Status methods
  isOnline(): boolean
  getQueueStatus(): OfflineQueueStatus
  
  // Queue management
  queueOperation(type, resource, data, priority): Promise<void>
  syncPendingOperations(): Promise<void>
  clearQueue(): void
  
  // Listeners
  addOnlineStatusListener(callback): () => void
  addSyncStatusListener(callback): () => void
}
```

#### 2. React Hooks
**Location**: `/src/hooks/use-offline.ts`

```typescript
// Connection and queue status
function useOfflineStatus(): {
  isOnline: boolean
  queueStatus: OfflineQueueStatus
  syncPending: () => Promise<void>
  clearQueue: () => void
}

// Operation queuing
function useOfflineQueue(): {
  queueOperation: (type, resource, data, priority) => Promise<void>
  getPendingOperations: () => OfflineOperation[]
}
```

### UI Components

#### Desktop Components

**OfflineIndicator**
```typescript
import { OfflineIndicator } from '@/components/OfflineIndicator'

<OfflineIndicator />
```

**OfflineModeBanner**
```typescript
import { OfflineModeBanner } from '@/components/OfflineModeBanner'

<OfflineModeBanner />
```

#### Mobile Components

**MobileOfflineTools**
```typescript
import { MobileOfflineTools } from '@/components/MobileOfflineTools'

<MobileOfflineTools />
```

**OfflineOperationsPanel**
```typescript
import { OfflineOperationsPanel } from '@/components/OfflineOperationsPanel'

<OfflineOperationsPanel
  rooms={rooms}
  onUpdateRoom={handleUpdateRoom}
/>
```

#### Quick Action Components

**QuickCheckInOut**
```typescript
import { QuickCheckInOut } from '@/components/QuickCheckInOut'

<QuickCheckInOut
  rooms={rooms}
  onUpdateRoom={handleUpdateRoom}
  isOnline={isOnline}
/>
```

**QuickRoomStatus**
```typescript
import { QuickRoomStatus } from '@/components/QuickRoomStatus'

<QuickRoomStatus
  rooms={rooms}
  onUpdateRoom={handleUpdateRoom}
  isOnline={isOnline}
/>
```

**QuickPaymentRecord**
```typescript
import { QuickPaymentRecord } from '@/components/QuickPaymentRecord'

<QuickPaymentRecord isOnline={isOnline} />
```

### Custom Implementation

#### Adding New Offline Operation

```typescript
// 1. Define operation type
type MyOperationType = {
  id: string
  customField: string
  // ... other fields
}

// 2. Create handler function
async function handleMyOperation(data: MyOperationType) {
  const { isOnline } = useOfflineStatus()
  const { queueOperation } = useOfflineQueue()
  
  // Update local state
  updateLocalData(data)
  
  // Queue for sync
  await queueOperation(
    'create',
    'my-resource',
    data,
    'medium' // priority
  )
  
  // User feedback
  toast.success(`Saved${!isOnline ? ' (offline)' : ''}`)
}

// 3. Use in component
<Button onClick={() => handleMyOperation(myData)}>
  Save
</Button>
```

#### Custom Priority Logic

```typescript
function determinePriority(operationType: string): Priority {
  switch(operationType) {
    case 'check-in':
    case 'check-out':
    case 'payment':
      return 'high'
    case 'housekeeping':
    case 'order':
      return 'medium'
    default:
      return 'low'
  }
}

await queueOperation(
  'create',
  resource,
  data,
  determinePriority(operationType)
)
```

---

## Components Reference

### Complete Component List

| Component | Location | Purpose |
|-----------|----------|---------|
| OfflineManager | `/src/lib/offlineManager.ts` | Core offline logic |
| useOfflineStatus | `/src/hooks/use-offline.ts` | Status hook |
| useOfflineQueue | `/src/hooks/use-offline.ts` | Queue hook |
| OfflineIndicator | `/src/components/OfflineIndicator.tsx` | Desktop indicator |
| OfflineModeBanner | `/src/components/OfflineModeBanner.tsx` | Banner alert |
| MobileOfflineTools | `/src/components/MobileOfflineTools.tsx` | Mobile panel |
| OfflineOperationsPanel | `/src/components/OfflineOperationsPanel.tsx` | Operations dashboard |
| QuickCheckInOut | `/src/components/QuickCheckInOut.tsx` | Check-in/out form |
| QuickRoomStatus | `/src/components/QuickRoomStatus.tsx` | Status update form |
| QuickPaymentRecord | `/src/components/QuickPaymentRecord.tsx` | Payment form |
| OfflineStatusWidget | `/src/components/OfflineStatusWidget.tsx` | Dashboard widget |

---

## API Reference

### Types

```typescript
type OfflineOperation = {
  id: string
  type: 'create' | 'update' | 'delete'
  resource: string
  data: any
  timestamp: number
  synced: boolean
  priority: 'high' | 'medium' | 'low'
}

type OfflineQueueStatus = {
  pending: number
  failed: number
  synced: number
  lastSync: number | null
}
```

### Methods

#### offlineManager.queueOperation()
```typescript
queueOperation(
  type: 'create' | 'update' | 'delete',
  resource: string,
  data: any,
  priority: 'high' | 'medium' | 'low' = 'medium'
): Promise<void>
```

#### offlineManager.syncPendingOperations()
```typescript
syncPendingOperations(): Promise<void>
```

#### offlineManager.getQueueStatus()
```typescript
getQueueStatus(): OfflineQueueStatus
```

---

## Best Practices

### For Users

1. **Regular Syncing**: Sync when online to keep queue small
2. **Check Status**: Review pending operations before important tasks
3. **Use Quick Ops**: Faster than navigating full modules
4. **Monitor Indicators**: Keep eye on connection status

### For Developers

1. **Update Local First**: Always update UI before queuing
2. **Validate Data**: Check data validity before queuing
3. **Handle Errors**: Graceful error handling and user feedback
4. **Priority Correctly**: Use appropriate priorities
5. **Test Offline**: Always test offline scenarios
6. **Document Changes**: Comment offline-related code

### Code Examples

#### Good Practice ✅
```typescript
async function handleUpdate(data) {
  // 1. Update local state immediately
  setLocalData(data)
  
  // 2. Queue for sync
  await queueOperation('update', 'resource', data, 'high')
  
  // 3. Provide feedback
  toast.success(`Updated ${!isOnline ? '(offline)' : ''}`)
}
```

#### Bad Practice ❌
```typescript
async function handleUpdate(data) {
  // Don't wait for sync before updating UI
  await queueOperation('update', 'resource', data, 'high')
  setLocalData(data) // UI updates too late
}
```

---

## Troubleshooting

### Common Issues

#### Issue: Operations Not Syncing
**Symptoms**: Pending count not decreasing
**Solutions**:
1. Check internet connection
2. Click "Sync Now" manually
3. Check browser console
4. Refresh page

#### Issue: Storage Full
**Symptoms**: Error saving operations
**Solutions**:
1. Sync all pending operations
2. Clear browser cache
3. Close other tabs
4. Increase browser storage

#### Issue: Missing Offline Indicator
**Symptoms**: Can't see status
**Solutions**:
1. Refresh the page
2. Check screen size/responsive
3. Enable JavaScript
4. Update browser

### Debug Mode

```typescript
// Enable debug logging
localStorage.setItem('offline-debug', 'true')

// View queue contents
console.log(offlineManager.getPendingOperations())

// Check storage
console.log(localStorage.getItem('w3-hotel-offline-queue'))
```

### Support Channels

- 📖 Documentation: Check all MD files
- 🐛 Bug Reports: GitHub Issues
- 💬 Questions: Team chat
- 📧 Email: support@example.com

---

## Documentation Files

- 📘 **OFFLINE_MODE_GUIDE.md** - Complete user/developer guide
- 📗 **OFFLINE_MODE_IMPLEMENTATION.md** - Technical implementation details
- 📙 **OFFLINE_MODE_QUICK_REFERENCE.md** - Quick reference card
- 📕 **OFFLINE_MODE_README.md** - This file

---

## Version History

### v1.0.0 (Current)
- ✅ Core offline infrastructure
- ✅ Priority-based queue system
- ✅ Mobile-optimized UI
- ✅ Quick operations panel
- ✅ Automatic sync
- ✅ Real-time status tracking

### Future Versions
- v1.1.0: Conflict resolution UI
- v1.2.0: Background sync workers
- v2.0.0: Service worker integration

---

## Credits

**Developed By**: W3 Media Development Team  
**Version**: 1.0.0  
**Last Updated**: 2024  
**License**: Proprietary  

---

## Quick Links

- [User Guide](#user-guide)
- [Developer Guide](#developer-guide)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

**🎉 Congratulations! You now have a fully functional offline mode system.**

For questions or support, contact your system administrator or development team.
