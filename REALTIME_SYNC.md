# Real-Time Data Sync Across Browser Tabs

## Overview

The W3 Hotel PMS now supports real-time data synchronization across multiple browser tabs, enabling seamless multi-user support and consistent data viewing. When one user makes changes in one tab, all other open tabs automatically update to reflect those changes.

## Features

### 1. **Automatic Data Synchronization**
- All data changes are instantly broadcast to other tabs
- Uses the browser's native BroadcastChannel API
- Zero latency for local tab-to-tab communication
- Works offline - no server connection required

### 2. **Multi-Tab Detection**
- System detects and displays the number of active tabs
- Heartbeat mechanism to track tab lifecycle
- Automatic cleanup of stale tab connections

### 3. **Visual Sync Indicator**
- Real-time status badge in the header
- Shows "Syncing..." during data updates
- Displays number of active tabs
- Provides last sync timestamp
- Color-coded status (green = synced, pulsing = syncing)

### 4. **Supported Data Types**
All application data is synchronized including:
- Guest records and profiles
- Room bookings and reservations
- Inventory items (food, amenities, materials)
- Financial records (invoices, payments)
- Staff and HR data
- Reports and analytics
- System settings and preferences

## How It Works

### BroadcastChannel API
The system uses the browser's native `BroadcastChannel` API to enable communication between tabs:

```typescript
const channel = new BroadcastChannel('w3-hotel-sync')
channel.postMessage({ type: 'kv-update', key: 'rooms', value: updatedRooms })
```

### Message Types
- **kv-update**: Data has been created or modified
- **kv-delete**: Data has been deleted
- **user-activity**: Tab heartbeat signal
- **notification**: System notifications and alerts

### Data Flow
1. User makes a change in Tab A (e.g., updates a room status)
2. The change is saved to localStorage via `useKV`
3. A broadcast message is sent to all other tabs
4. Tabs B, C, D receive the message and update their state
5. UI automatically re-renders with the new data

## Usage

### For End Users

**Opening Multiple Tabs:**
1. Open the W3 Hotel PMS in your browser
2. Open additional tabs (Ctrl+T / Cmd+T)
3. Navigate to the same PMS URL
4. All tabs will show a sync indicator with tab count

**Viewing Sync Status:**
- Look for the sync badge in the top-right header
- Hover over it to see detailed sync information
- The badge shows the number of active tabs
- Watch for the "Syncing..." animation during updates

**Working Across Tabs:**
- Make changes in any tab (create, edit, delete records)
- Switch to other tabs to see changes reflected immediately
- No need to refresh - updates happen automatically
- All tabs stay in perfect sync

### For Developers

**Using Synced State:**

Instead of regular `useKV`, use `useSyncedKV` for automatic synchronization:

```typescript
import { useSyncedKV } from '@/hooks/use-synced-kv'

function MyComponent() {
  // This state will automatically sync across all tabs
  const [rooms, setRooms] = useSyncedKV<Room[]>('w3-hotel-rooms', [])
  
  // Updates are broadcast to all other tabs
  const updateRoom = (roomId: string, newStatus: string) => {
    setRooms((currentRooms) => 
      currentRooms.map(room => 
        room.id === roomId ? { ...room, status: newStatus } : room
      )
    )
  }
  
  return (
    // Your component JSX
  )
}
```

**Custom Broadcast Messages:**

You can also send custom messages using the `useBroadcastSync` hook:

```typescript
import { useBroadcastSync } from '@/hooks/use-broadcast-sync'

function MyComponent() {
  const handleMessage = (message) => {
    console.log('Received:', message)
  }
  
  const { broadcast } = useBroadcastSync(handleMessage)
  
  const notifyOtherTabs = () => {
    broadcast({
      type: 'notification',
      value: { message: 'New booking created!' }
    })
  }
}
```

## Browser Support

The BroadcastChannel API is supported in:
- ✅ Chrome 54+
- ✅ Firefox 38+
- ✅ Edge 79+
- ✅ Safari 15.4+
- ✅ Opera 41+

For unsupported browsers, the system gracefully degrades:
- Sync indicator shows "Sync Unavailable"
- Regular localStorage persistence still works
- Manual refresh required to see changes from other tabs

## Performance Considerations

### Efficient Updates
- Only changed data is broadcast, not entire datasets
- Functional updates ensure latest state is always used
- Debouncing prevents excessive broadcasts during rapid changes

### Memory Management
- Automatic cleanup of event listeners on unmount
- Stale tab detection and removal
- Channel closure on component unmount

### Best Practices
1. **Always use functional updates** when modifying synced state:
   ```typescript
   // ✅ CORRECT
   setRooms((current) => [...current, newRoom])
   
   // ❌ WRONG - may cause data loss
   setRooms([...rooms, newRoom])
   ```

2. **Keep broadcast payloads small** - avoid sending large objects unnecessarily

3. **Use appropriate keys** - unique, descriptive keys for different data types

## Troubleshooting

### Tabs Not Syncing
- **Check browser compatibility** - ensure BroadcastChannel is supported
- **Verify same origin** - tabs must be on the same domain
- **Check console** - look for sync-related errors
- **Try hard refresh** - Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

### Sync Indicator Not Showing
- **Check component import** - ensure SyncStatusIndicator is imported
- **Verify placement** - should be in the App header
- **Browser support** - older browsers won't show sync features

### Data Not Updating
- **Use functional updates** - always use callback form of setState
- **Check key names** - ensure keys match across components
- **Verify message handling** - check broadcast message handling logic

## Future Enhancements

Planned improvements for the sync system:
- [ ] Conflict resolution for simultaneous edits
- [ ] Server-side sync for true multi-user collaboration
- [ ] Offline queue for pending changes
- [ ] WebSocket integration for real-time server updates
- [ ] Version control and change history
- [ ] Optimistic UI updates with rollback
- [ ] Selective sync (only sync specific modules)
- [ ] Cross-device sync via cloud storage

## Security Considerations

- **Same-origin only** - BroadcastChannel only works within the same domain
- **No external access** - Messages cannot be intercepted by other websites
- **Client-side only** - No data is sent to external servers during sync
- **localStorage security** - Standard localStorage security applies

## Technical Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Tab A     │     │   Tab B     │     │   Tab C     │
│             │     │             │     │             │
│  useSyncedKV│────▶│BroadcastCh. │◀────│ useSyncedKV │
│             │     │  (Shared)   │     │             │
│  localStorage│     │             │     │ localStorage│
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                    │
       └───────────────────┴────────────────────┘
                          │
                   ┌──────▼──────┐
                   │ localStorage│
                   │  (Shared)   │
                   └─────────────┘
```

## API Reference

### `useSyncedKV<T>(key: string, defaultValue: T)`
Enhanced version of `useKV` with automatic cross-tab synchronization.

**Parameters:**
- `key` - Unique storage key
- `defaultValue` - Initial value if key doesn't exist

**Returns:** `[value, setValue, deleteValue]`

### `useBroadcastSync(onMessage?: (message: SyncMessage) => void)`
Low-level hook for custom broadcast functionality.

**Parameters:**
- `onMessage` - Callback for handling received messages

**Returns:** `{ broadcast, tabId }`

### `SyncStatusIndicator`
Visual component showing real-time sync status.

**Props:** None (self-contained)

## Support

For questions or issues related to real-time sync:
1. Check this documentation
2. Review browser console for errors
3. Verify browser compatibility
4. Contact W3 Media support team

---

**Developed by W3 Media PVT LTD**
© 2024 W3 Hotel PMS - All Rights Reserved
