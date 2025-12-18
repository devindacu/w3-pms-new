# Mobile-Optimized Offline Mode

## Overview

The W3 Hotel PMS now includes a comprehensive offline mode that allows staff to continue performing critical operations even without internet connectivity. All operations are queued locally and automatically sync when connection is restored.

## Features

### 🔌 Automatic Detection
- The system automatically detects when you go offline
- Visual indicators show offline status across the interface
- No manual switching required

### 💾 Local Storage
- All operations are safely stored in browser's local storage
- Data persists through page refreshes
- Automatic cleanup of synced operations

### 🔄 Smart Syncing
- Priority-based queue (high, medium, low)
- Automatic sync when back online
- Manual sync option available
- Real-time sync status tracking

### 📱 Mobile Optimized
- Touch-friendly interface
- Responsive design for all screen sizes
- Quick action buttons for common tasks
- Swipe gestures support

## Supported Critical Operations

### ✅ High Priority Operations
1. **Guest Check-In/Check-Out**
   - Quick room assignment
   - Guest name capture
   - Automatic status updates

2. **Room Status Updates**
   - Vacant/Occupied status
   - Clean/Dirty status
   - Maintenance flags
   - Out of order marking

3. **Payment Recording**
   - Cash payments
   - Credit card transactions
   - Bank transfers
   - Payment references

### ✅ Medium Priority Operations
4. **Housekeeping Tasks**
   - Task assignments
   - Status updates
   - Completion marking

5. **F&B Orders**
   - Order placement
   - Order modifications
   - Payment processing

6. **Inventory Updates**
   - Stock adjustments
   - Usage tracking
   - Low stock alerts

### ✅ Low Priority Operations
7. **Guest Feedback**
8. **Staff Notes**
9. **General Updates**

## User Interface Components

### 1. Offline Indicator (Desktop)
Located in the header next to notifications:
- Shows connection status
- Displays pending operations count
- Quick access to sync controls
- Last sync timestamp

### 2. Mobile Offline Tools (Mobile)
Accessible from the mobile header:
- Full-screen offline dashboard
- Pending operations list
- Sync controls
- Information about offline mode

### 3. Offline Mode Banner
Appears at top of screen when offline:
- Clear offline status message
- One-click sync button
- Dismissible notification
- Smooth animations

### 4. Quick Action Cards

#### Quick Check-In/Out
- Select room from available list
- Enter guest name for check-in
- One-tap completion
- Offline mode indicator

#### Quick Room Status
- Room selection dropdown
- Current status display
- New status picker
- Instant updates

#### Quick Payment Record
- Amount entry with currency
- Payment method selection
- Reference number field
- Notes section

## Technical Implementation

### Storage Structure
```typescript
{
  id: string                    // Unique operation ID
  type: 'create' | 'update' | 'delete'
  resource: string              // Resource type (room, payment, etc.)
  data: any                     // Operation data
  timestamp: number             // When operation was created
  synced: boolean              // Sync status
  priority: 'high' | 'medium' | 'low'
}
```

### API Hooks

#### useOfflineStatus()
```typescript
const { 
  isOnline,        // Current connection status
  queueStatus,     // Queue statistics
  syncPending,     // Function to sync now
  clearQueue       // Function to clear queue
} = useOfflineStatus()
```

#### useOfflineQueue()
```typescript
const { 
  queueOperation,         // Function to queue an operation
  getPendingOperations    // Function to get pending list
} = useOfflineQueue()
```

### Usage Example

```typescript
import { useOfflineQueue, useOfflineStatus } from '@/hooks/use-offline'

function MyComponent() {
  const { isOnline } = useOfflineStatus()
  const { queueOperation } = useOfflineQueue()

  const handleCheckIn = async (roomId: string, guestName: string) => {
    // Update local state first
    updateRoomStatus(roomId, 'occupied-clean')
    
    // Queue for sync
    await queueOperation(
      'update',
      'room-checkin',
      {
        roomId,
        guestName,
        timestamp: Date.now()
      },
      'high'  // High priority for check-ins
    )
    
    // Show success message
    toast.success(
      `Check-in completed${!isOnline ? ' (will sync when online)' : ''}`
    )
  }

  return (
    // Your component JSX
  )
}
```

## Best Practices

### 1. User Communication
- Always inform users when they're offline
- Show clear feedback for queued operations
- Display sync status prominently
- Provide manual sync option

### 2. Data Safety
- Queue operations before updating UI
- Validate data before queuing
- Handle errors gracefully
- Provide rollback mechanisms

### 3. Performance
- Keep queue size manageable
- Clean up synced operations
- Use efficient storage methods
- Minimize localStorage writes

### 4. User Experience
- Make offline mode seamless
- Prioritize critical operations
- Provide clear status indicators
- Enable quick actions

## Mobile UX Guidelines

### Touch Targets
- Minimum 44x44px touch targets
- Adequate spacing between buttons
- Large, easy-to-tap controls
- Clear visual feedback

### Forms
- Large input fields
- Clear labels
- Minimal required fields
- Auto-focus on first field

### Feedback
- Immediate visual feedback
- Toast notifications
- Loading indicators
- Success/error states

### Navigation
- Easy back navigation
- Breadcrumb trails
- Clear hierarchy
- Quick access shortcuts

## Troubleshooting

### Operations Not Syncing
1. Check internet connection
2. Click "Sync Now" button manually
3. Check browser console for errors
4. Clear and retry if needed

### Storage Full
1. Sync pending operations
2. Clear old synced data
3. Close unnecessary tabs
4. Check browser storage settings

### Data Conflicts
1. Check operation timestamps
2. Review queue priority
3. Manual resolution if needed
4. Contact support if persists

## Future Enhancements

### Planned Features
- [ ] Conflict resolution UI
- [ ] Partial sync capability
- [ ] Background sync workers
- [ ] Offline data compression
- [ ] Multi-device sync
- [ ] Operation history view
- [ ] Advanced filtering
- [ ] Export queue data

### Under Consideration
- [ ] Peer-to-peer sync
- [ ] Offline mode scheduling
- [ ] Smart sync scheduling
- [ ] Data caching strategies
- [ ] Progressive web app
- [ ] Service worker integration

## Support

For issues or questions about offline mode:
1. Check this documentation
2. Review console logs
3. Test with sample data
4. Contact technical support

## Version History

### v1.0.0 (Current)
- Initial offline mode implementation
- Basic queue management
- Priority-based syncing
- Mobile-optimized UI
- Quick action components
- Real-time status tracking

---

**Last Updated:** 2024
**Maintained By:** W3 Media Development Team
