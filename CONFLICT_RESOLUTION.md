# Sync Conflict Resolution System

## Overview

The W3 Hotel PMS now features a comprehensive conflict resolution system for handling simultaneous edits across multiple browser tabs. When two or more tabs modify the same data at nearly the same time, the system detects the conflict and provides users with multiple resolution strategies.

## Features

### 1. **Automatic Conflict Detection**
- Detects when the same data is modified within a 5-second window across different tabs
- Tracks version metadata (timestamp, tabId, userId) for each change
- Compares local and remote versions to identify actual conflicts

### 2. **Visual Conflict UI**
- **Conflict Indicator**: Badge in the header showing pending conflict count
- **Conflict Dialog**: Rich UI for reviewing and resolving conflicts with:
  - Side-by-side comparison of conflicting versions
  - Field-level diff view highlighting specific changes
  - Multiple resolution strategies
  - Interactive selection interface

### 3. **Resolution Strategies**
- **Manual Selection**: User chooses which version to keep
- **Last Write Wins**: Automatically keeps the most recent change
- **First Write Wins**: Keeps the earliest change
- **Smart Merge**: Attempts to intelligently merge both versions

### 4. **Conflict History**
- Tracks all detected conflicts
- Shows resolution status (pending, resolved, ignored)
- Records which strategy was used
- Maintains audit trail

## How It Works

### Conflict Detection Algorithm

```typescript
function detectConflict(localValue, localMetadata, remoteValue, remoteMetadata) {
  // 1. Check if changes occurred within conflict window (5 seconds)
  const timeDiff = Math.abs(localMetadata.timestamp - remoteMetadata.timestamp)
  const CONFLICT_THRESHOLD = 5000 // 5 seconds
  
  if (timeDiff > CONFLICT_THRESHOLD) return false
  
  // 2. Compare actual values
  const localStr = JSON.stringify(localValue)
  const remoteStr = JSON.stringify(remoteValue)
  
  return localStr !== remoteStr
}
```

### Resolution Strategies

#### Last Write Wins
```typescript
// Keeps the version with the newer timestamp
const resolved = conflict.localVersion.timestamp > conflict.remoteVersion.timestamp
  ? conflict.localVersion.value
  : conflict.remoteVersion.value
```

#### First Write Wins
```typescript
// Keeps the version with the older timestamp
const resolved = conflict.localVersion.timestamp < conflict.remoteVersion.timestamp
  ? conflict.localVersion.value
  : conflict.remoteVersion.value
```

#### Smart Merge
```typescript
// For arrays: combines unique items
// For objects: merges properties (local takes precedence)
function mergeValues(local, remote) {
  if (Array.isArray(local) && Array.isArray(remote)) {
    const localIds = new Set(local.map(item => item.id))
    const merged = [...local]
    remote.forEach(item => {
      if (!localIds.has(item.id)) merged.push(item)
    })
    return merged
  }
  
  if (typeof local === 'object' && typeof remote === 'object') {
    return { ...remote, ...local } // Local wins for properties
  }
  
  return local
}
```

## Usage

### For Developers

#### Using the Conflict Resolver Hook

```typescript
import { useConflictResolver } from '@/hooks/use-conflict-resolver'

function MyComponent() {
  const {
    value,
    setValue,
    conflicts,
    pendingConflicts,
    resolveConflict,
    ignoreConflict,
    hasPendingConflicts
  } = useConflictResolver<MyDataType>('my-data-key', defaultValue, {
    // Optional: auto-resolve using a specific strategy
    autoResolveStrategy: 'last-write-wins',
    
    // Optional: callbacks
    onConflictDetected: (conflict) => {
      console.log('Conflict detected!', conflict)
    },
    onConflictResolved: (conflict, resolution) => {
      console.log('Conflict resolved:', resolution)
    }
  })
  
  // Use like normal useState, but with conflict detection
  const updateData = () => {
    setValue((current) => ({
      ...current,
      someField: 'new value'
    }))
  }
  
  return (
    <div>
      {hasPendingConflicts && (
        <Alert>You have {pendingConflicts.length} pending conflicts</Alert>
      )}
      
      {/* Your component UI */}
    </div>
  )
}
```

#### Displaying Conflicts

```typescript
import { ConflictDialog } from '@/components/ConflictDialog'
import { ConflictIndicator } from '@/components/ConflictIndicator'

function MyComponent() {
  const { conflicts, resolveConflict, ignoreConflict } = useConflictResolver(...)
  const [selectedConflict, setSelectedConflict] = useState(null)
  
  return (
    <>
      {/* Conflict indicator in header */}
      <ConflictIndicator
        conflicts={conflicts}
        onViewConflict={setSelectedConflict}
        onResolveAll={() => {
          // Auto-resolve all using last-write-wins
          conflicts.forEach(c => resolveConflict(c.id, 'last-write-wins'))
        }}
      />
      
      {/* Conflict resolution dialog */}
      {selectedConflict && (
        <ConflictDialog
          conflict={selectedConflict}
          open={!!selectedConflict}
          onClose={() => setSelectedConflict(null)}
          onResolve={resolveConflict}
          onIgnore={ignoreConflict}
          formatValue={(value) => (
            <div>{/* Custom value formatting */}</div>
          )}
        />
      )}
    </>
  )
}
```

### For End Users

#### Testing Conflict Resolution

1. **Navigate to Sync Testing**
   - Go to "Testing & Tools → Sync Testing" in the sidebar
   - Click on the "Conflicts" tab

2. **Create Simultaneous Edits**
   - Open 2-3 browser tabs side by side
   - In each tab, quickly modify the same task within a few seconds
   - A conflict warning will appear

3. **Resolve Conflicts**
   - Click on the conflict indicator (red badge in header)
   - Review the conflicting versions side-by-side
   - Choose a resolution strategy:
     - **Select manually**: Click on the version you want to keep
     - **Last Write Wins**: Auto-select the most recent change
     - **First Write Wins**: Auto-select the earliest change  
     - **Smart Merge**: Attempt to combine both versions
   - Click "Resolve Conflict" to apply

#### Understanding the Conflict Dialog

**Side-by-Side Tab**:
- Shows both versions in full
- Click on either version to select it
- Selected version is highlighted with a checkmark

**Field Changes Tab**:
- Shows only the fields that differ
- Highlights exact differences between versions
- Useful for complex objects with many fields

**Resolution Tab**:
- Choose from 4 resolution strategies
- Each strategy explained with description
- Preview the result before applying

## API Reference

### `useConflictResolver<T>`

Enhanced version of `useKV` with automatic conflict detection and resolution.

**Type Signature**:
```typescript
function useConflictResolver<T>(
  key: string,
  defaultValue: T,
  options?: {
    autoResolveStrategy?: ConflictResolutionStrategy
    onConflictDetected?: (conflict: Conflict<T>) => void
    onConflictResolved?: (conflict: Conflict<T>, resolution: T) => void
  }
): {
  value: T
  setValue: (newValue: T | ((prev: T) => T)) => void
  deleteValue: () => void
  conflicts: Conflict<T>[]
  pendingConflicts: Conflict<T>[]
  resolveConflict: (conflictId: string, strategy: ConflictResolutionStrategy, customResolution?: T) => void
  ignoreConflict: (conflictId: string) => void
  clearResolvedConflicts: () => void
  hasPendingConflicts: boolean
}
```

**Parameters**:
- `key`: Unique storage key for the data
- `defaultValue`: Initial value if key doesn't exist
- `options`: Optional configuration object

**Returns**:
- `value`: Current data value
- `setValue`: Function to update value (conflict-aware)
- `deleteValue`: Function to delete the value
- `conflicts`: All conflicts (pending, resolved, ignored)
- `pendingConflicts`: Only pending conflicts
- `resolveConflict`: Function to resolve a specific conflict
- `ignoreConflict`: Function to ignore a conflict
- `clearResolvedConflicts`: Remove resolved conflicts from list
- `hasPendingConflicts`: Boolean indicating if any conflicts are pending

### `ConflictDialog`

Visual component for reviewing and resolving conflicts.

**Props**:
```typescript
interface ConflictDialogProps<T> {
  conflict: Conflict<T>
  open: boolean
  onClose: () => void
  onResolve: (conflictId: string, strategy: ConflictResolutionStrategy, customResolution?: T) => void
  onIgnore: (conflictId: string) => void
  formatValue?: (value: T) => React.ReactNode
}
```

### `ConflictIndicator`

Header badge showing conflict count and quick access.

**Props**:
```typescript
interface ConflictIndicatorProps {
  conflicts: Conflict<any>[]
  onViewConflict: (conflict: Conflict<any>) => void
  onResolveAll?: () => void
}
```

## Types

### `Conflict<T>`

```typescript
interface Conflict<T> {
  id: string
  key: string
  localVersion: ConflictVersion<T>
  remoteVersion: ConflictVersion<T>
  detectedAt: number
  status: 'pending' | 'resolved' | 'ignored'
  resolution?: T
  strategy?: ConflictResolutionStrategy
}
```

### `ConflictVersion<T>`

```typescript
interface ConflictVersion<T> {
  value: T
  metadata: ConflictMetadata
  version: number
}
```

### `ConflictMetadata`

```typescript
interface ConflictMetadata {
  conflictId: string
  key: string
  timestamp: number
  tabId: string
  userId?: string
}
```

### `ConflictResolutionStrategy`

```typescript
type ConflictResolutionStrategy = 
  | 'manual' 
  | 'last-write-wins' 
  | 'first-write-wins' 
  | 'merge'
```

## Best Practices

### 1. Choose the Right Strategy

- **Last Write Wins**: Best for simple edits where the latest version is usually correct
- **First Write Wins**: Useful when first input should be preserved
- **Smart Merge**: Good for arrays or objects where changes may be complementary
- **Manual**: Use when human judgment is required

### 2. Always Use Functional Updates

```typescript
// ✅ CORRECT - always gets the latest state
setValue((current) => ({ ...current, field: 'new value' }))

// ❌ WRONG - may use stale state and cause conflicts
setValue({ ...value, field: 'new value' })
```

### 3. Set Appropriate Conflict Windows

The default 5-second window detects most simultaneous edits. Adjust if needed:

```typescript
// In conflictResolution.ts
const CONFLICT_THRESHOLD = 5000 // Milliseconds
```

### 4. Provide Custom Formatters

For complex data types, provide custom formatters to make conflicts easier to understand:

```typescript
<ConflictDialog
  conflict={conflict}
  formatValue={(task) => (
    <div className="space-y-2">
      <div><strong>Title:</strong> {task.title}</div>
      <div><strong>Status:</strong> {task.completed ? 'Done' : 'Pending'}</div>
      <div><strong>Priority:</strong> {task.priority}</div>
    </div>
  )}
  ...
/>
```

### 5. Auto-Resolve Low-Risk Conflicts

For non-critical data, consider auto-resolving:

```typescript
const { ... } = useConflictResolver('todos', [], {
  autoResolveStrategy: 'last-write-wins',
  onConflictDetected: (conflict) => {
    console.log('Auto-resolved conflict:', conflict.id)
  }
})
```

## Troubleshooting

### Conflicts Not Detected

**Issue**: Changes in multiple tabs don't trigger conflicts

**Solutions**:
- Ensure changes occur within the 5-second window
- Verify both tabs are using `useConflictResolver` hook
- Check that the same `key` is used in both tabs
- Confirm BroadcastChannel is supported in your browser

### Too Many False Positives

**Issue**: Conflicts detected when they shouldn't be

**Solutions**:
- Increase the `CONFLICT_THRESHOLD` value
- Ensure data serialization is deterministic (same object = same JSON)
- Consider using content-based comparison instead of timestamp

### Merge Strategy Not Working

**Issue**: Smart merge doesn't combine data correctly

**Solutions**:
- Check that your data has unique `id` fields (for arrays)
- Ensure objects are properly structured
- Consider implementing a custom merge function
- Use manual resolution for complex cases

## Performance Considerations

### Memory Usage

- Conflict history is kept in memory
- Use `clearResolvedConflicts()` periodically to free memory
- Limit the number of tracked conflicts (default: all)

### Network/Storage

- Conflicts are local-only (not persisted to localStorage)
- Resolution writes the resolved value to localStorage via `useKV`
- Each conflict adds ~1-2KB to memory footprint

### UI Performance

- Conflict dialog renders full object comparisons
- For large objects, consider lazy rendering or pagination
- Custom formatters can improve rendering performance

## Future Enhancements

Planned improvements:
- [ ] Operational Transform (OT) for real-time collaborative editing
- [ ] Conflict-free Replicated Data Types (CRDTs) integration
- [ ] Server-side conflict resolution for multi-device sync
- [ ] Undo/redo stack with conflict-aware history
- [ ] Visual diff editor for text fields
- [ ] Automatic three-way merge for object changes
- [ ] Conflict resolution policies (per data type)
- [ ] Machine learning-based resolution suggestions

## Related Documentation

- [Real-Time Data Sync](./REALTIME_SYNC.md) - Core sync system documentation
- [Sync Demo Guide](./SYNC_DEMO_GUIDE.md) - Testing the sync features
- [Multi-Tab Collaboration Guide](./docs/multi-tab-collaboration.md) - Best practices

## Support

For questions or issues related to conflict resolution:
1. Review this documentation
2. Check the Sync Testing panel for live debugging
3. Enable verbose logging in browser console
4. Contact W3 Media support team

---

**Developed by W3 Media PVT LTD**
© 2024 W3 Hotel PMS - All Rights Reserved
