# Batch Operations System - Complete Guide

## Overview

The W3 Hotel PMS now includes a comprehensive batch operations system that allows users to perform bulk actions on multiple items simultaneously across all modules. This system provides consistent, efficient, and user-friendly batch operations throughout the application.

## Features

### Core Capabilities

1. **Batch Selection**
   - Select individual items with checkboxes
   - Select all items with a single click
   - Visual feedback for selected items
   - Persistent selection state

2. **Batch Operations**
   - **Delete**: Remove multiple items at once
   - **Update**: Modify common fields across multiple items
   - **Export**: Download selected items as CSV or JSON
   - **Custom Actions**: Module-specific batch operations

3. **Progress Tracking**
   - Real-time progress indication
   - Success/failure reporting
   - Detailed error messages

## Components

### 1. BatchOperationsToolbar

A sticky bottom toolbar that appears when items are selected.

**Props:**
```typescript
interface BatchOperationsToolbarProps<T> {
  items: T[]                              // All available items
  selectedIds: string[]                   // Currently selected item IDs
  onSelectionChange: (ids: string[]) => void // Selection change handler
  onItemsUpdate: (items: T[]) => void     // Items update handler
  actions?: BatchAction[]                 // Custom batch actions
  entityName?: string                     // Entity name for messages
  showSelectAll?: boolean                 // Show select all checkbox
  exportFields?: string[]                 // Fields to include in export
}
```

**Example Usage:**
```typescript
import { BatchOperationsToolbar } from '@/components/BatchOperationsToolbar'
import { useBatchSelection } from '@/hooks/use-batch-selection'

function MyModule() {
  const { selectedIds, toggleSelection, clearSelection } = useBatchSelection()
  
  return (
    <>
      {/* Your table/list here */}
      
      <BatchOperationsToolbar
        items={items}
        selectedIds={selectedIds}
        onSelectionChange={clearSelection}
        onItemsUpdate={setItems}
        entityName="rooms"
        actions={customActions}
      />
    </>
  )
}
```

### 2. UniversalBatchDialog

A comprehensive dialog for batch update and delete operations.

**Props:**
```typescript
interface UniversalBatchDialogProps<T> {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedItems: T[]
  fields: BatchField[]                    // Editable fields configuration
  entityName: string
  onUpdate: (updates: Record<string, any>) => Promise<void>
  onDelete?: () => Promise<void>
  showDelete?: boolean
}
```

**Example Usage:**
```typescript
import { UniversalBatchDialog } from '@/components/UniversalBatchDialog'
import { roomBatchFields } from '@/lib/batch-field-configs'

function RoomManagement() {
  const [showBatchDialog, setShowBatchDialog] = useState(false)
  
  const handleBatchUpdate = async (updates: Record<string, any>) => {
    setRooms(currentRooms =>
      currentRooms.map(room =>
        selectedIds.includes(room.id) ? { ...room, ...updates } : room
      )
    )
  }
  
  const handleBatchDelete = async () => {
    setRooms(currentRooms =>
      currentRooms.filter(room => !selectedIds.includes(room.id))
    )
  }
  
  return (
    <UniversalBatchDialog
      open={showBatchDialog}
      onOpenChange={setShowBatchDialog}
      selectedItems={selectedRooms}
      fields={roomBatchFields}
      entityName="rooms"
      onUpdate={handleBatchUpdate}
      onDelete={handleBatchDelete}
    />
  )
}
```

### 3. useBatchSelection Hook

A React hook for managing batch selection state.

**API:**
```typescript
const {
  selectedIds,          // Array of selected item IDs
  isSelected,           // Check if an item is selected
  toggleSelection,      // Toggle selection of an item
  toggleAll,            // Toggle selection of all items
  clearSelection,       // Clear all selections
  selectAll,            // Select all items
  isAllSelected,        // Check if all items are selected
  isSomeSelected        // Check if some (but not all) items are selected
} = useBatchSelection()
```

**Example Usage:**
```typescript
import { useBatchSelection } from '@/hooks/use-batch-selection'

function MyComponent() {
  const {
    selectedIds,
    toggleSelection,
    toggleAll,
    clearSelection
  } = useBatchSelection()
  
  return (
    <div>
      <Checkbox
        checked={selectedIds.includes(item.id)}
        onCheckedChange={() => toggleSelection(item.id)}
      />
    </div>
  )
}
```

## Batch Field Configurations

Pre-configured field sets for each entity type are available in `/src/lib/batch-field-configs.ts`:

- `guestBatchFields`
- `roomBatchFields`
- `reservationBatchFields`
- `housekeepingBatchFields`
- `employeeBatchFields`
- `inventoryBatchFields`
- `supplierBatchFields`
- `purchaseOrderBatchFields`
- `invoiceBatchFields`
- `menuItemBatchFields`
- `orderBatchFields`
- `maintenanceBatchFields`
- `requisitionBatchFields`
- `leaveRequestBatchFields`
- `foodItemBatchFields`
- `amenityBatchFields`
- `constructionMaterialBatchFields`
- `constructionProjectBatchFields`
- `systemUserBatchFields`
- `guestProfileBatchFields`
- `extraServiceBatchFields`
- `channelReservationBatchFields`
- `recipeBatchFields`

### Creating Custom Field Configurations

```typescript
import type { BatchField } from '@/components/UniversalBatchDialog'

export const customBatchFields: BatchField[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ],
    required: true
  },
  {
    key: 'notes',
    label: 'Notes',
    type: 'textarea',
    placeholder: 'Add notes'
  },
  {
    key: 'priority',
    label: 'Priority',
    type: 'number',
    placeholder: 'Enter priority level'
  },
  {
    key: 'isActive',
    label: 'Active',
    type: 'boolean'
  },
  {
    key: 'dueDate',
    label: 'Due Date',
    type: 'date'
  }
]
```

## Custom Batch Actions

Define custom batch operations for specific modules:

```typescript
import { BatchAction } from '@/components/BatchOperationsToolbar'

const customActions: BatchAction[] = [
  {
    id: 'approve',
    label: 'Approve',
    icon: <CheckCircle size={16} />,
    variant: 'default',
    action: 'approve'
  },
  {
    id: 'assign',
    label: 'Assign to Me',
    icon: <User size={16} />,
    variant: 'secondary',
    action: 'custom',
    onExecute: async (selectedIds) => {
      // Custom logic here
      await assignToCurrentUser(selectedIds)
    }
  },
  {
    id: 'archive',
    label: 'Archive',
    icon: <Archive size={16} />,
    variant: 'outline',
    action: 'archive'
  }
]
```

## Integration Examples

### Example 1: Front Office Module

```typescript
import { useBatchSelection } from '@/hooks/use-batch-selection'
import { BatchOperationsToolbar } from '@/components/BatchOperationsToolbar'
import { UniversalBatchDialog } from '@/components/UniversalBatchDialog'
import { guestBatchFields } from '@/lib/batch-field-configs'

function GuestManagement({ guests, setGuests }) {
  const [showBatchDialog, setShowBatchDialog] = useState(false)
  const {
    selectedIds,
    isSelected,
    toggleSelection,
    toggleAll,
    clearSelection
  } = useBatchSelection()
  
  const selectedGuests = guests.filter(g => selectedIds.includes(g.id))
  
  const handleBatchUpdate = async (updates: Record<string, any>) => {
    setGuests(current =>
      current.map(guest =>
        selectedIds.includes(guest.id)
          ? { ...guest, ...updates, updatedAt: Date.now() }
          : guest
      )
    )
    clearSelection()
  }
  
  const handleBatchDelete = async () => {
    setGuests(current =>
      current.filter(guest => !selectedIds.includes(guest.id))
    )
    clearSelection()
  }
  
  const customActions: BatchAction[] = [
    {
      id: 'send-email',
      label: 'Send Email',
      icon: <Envelope size={16} />,
      action: 'custom',
      onExecute: async (ids) => {
        // Send bulk email logic
      }
    }
  ]
  
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedIds.length === guests.length}
                onCheckedChange={() => toggleAll(guests.map(g => g.id))}
              />
            </TableHead>
            {/* Other headers */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {guests.map(guest => (
            <TableRow key={guest.id}>
              <TableCell>
                <Checkbox
                  checked={isSelected(guest.id)}
                  onCheckedChange={() => toggleSelection(guest.id)}
                />
              </TableCell>
              {/* Other cells */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <BatchOperationsToolbar
        items={guests}
        selectedIds={selectedIds}
        onSelectionChange={clearSelection}
        onItemsUpdate={setGuests}
        entityName="guests"
        actions={[...customActions, {
          id: 'batch-edit',
          label: 'Batch Edit',
          icon: <PencilSimple size={16} />,
          action: 'custom',
          onExecute: () => setShowBatchDialog(true)
        }]}
      />
      
      <UniversalBatchDialog
        open={showBatchDialog}
        onOpenChange={setShowBatchDialog}
        selectedItems={selectedGuests}
        fields={guestBatchFields}
        entityName="guests"
        onUpdate={handleBatchUpdate}
        onDelete={handleBatchDelete}
      />
    </div>
  )
}
```

### Example 2: Inventory Module

```typescript
import { useBatchSelection } from '@/hooks/use-batch-selection'
import { BatchOperationsToolbar } from '@/components/BatchOperationsToolbar'
import { foodItemBatchFields } from '@/lib/batch-field-configs'

function FoodItemManagement({ foodItems, setFoodItems }) {
  const { selectedIds, toggleSelection, clearSelection } = useBatchSelection()
  
  const batchActions: BatchAction[] = [
    {
      id: 'reorder',
      label: 'Create Purchase Order',
      icon: <ShoppingCart size={16} />,
      action: 'custom',
      onExecute: async (ids) => {
        const items = foodItems.filter(item => ids.includes(item.id))
        await createBulkPurchaseOrder(items)
        clearSelection()
      }
    },
    {
      id: 'adjust-stock',
      label: 'Adjust Stock',
      icon: <Package size={16} />,
      action: 'custom',
      onExecute: async (ids) => {
        setShowStockAdjustmentDialog(true)
      }
    }
  ]
  
  return (
    <>
      {/* Your inventory table */}
      
      <BatchOperationsToolbar
        items={foodItems}
        selectedIds={selectedIds}
        onSelectionChange={clearSelection}
        onItemsUpdate={setFoodItems}
        entityName="food items"
        actions={batchActions}
        exportFields={['name', 'category', 'currentStock', 'unitPrice']}
      />
    </>
  )
}
```

## Batch Operations API

### Core Functions

#### `executeBatchOperation`

Execute a batch operation with progress tracking.

```typescript
import { executeBatchOperation } from '@/lib/batch-operations'

const result = await executeBatchOperation(
  items,
  'update',
  async (item) => {
    // Your operation logic
    return updatedItem
  },
  {
    onProgress: (processed, total) => {
      console.log(`Progress: ${processed}/${total}`)
    },
    batchSize: 10  // Process 10 items at a time
  }
)
```

#### `batchDelete`

Delete multiple items with confirmation.

```typescript
import { batchDelete } from '@/lib/batch-operations'

const result = await batchDelete(
  selectedItems,
  (id) => {
    setItems(current => current.filter(item => item.id !== id))
  },
  {
    confirmMessage: 'Are you sure you want to delete these items?',
    onProgress: (processed, total) => {
      console.log(`Deleting: ${processed}/${total}`)
    }
  }
)
```

#### `batchUpdate`

Update multiple items with common changes.

```typescript
import { batchUpdate } from '@/lib/batch-operations'

const result = await batchUpdate(
  selectedItems,
  (item, updates) => {
    setItems(current =>
      current.map(i => i.id === item.id ? { ...i, ...updates } : i)
    )
  },
  { status: 'active', updatedAt: Date.now() }
)
```

#### `batchExport`

Export selected items to file.

```typescript
import { batchExport } from '@/lib/batch-operations'

batchExport(selectedItems, {
  format: 'csv',  // or 'json'
  filename: 'my-export',
  selectedFields: ['id', 'name', 'status', 'createdAt']
})
```

### Result Types

```typescript
interface BatchOperationResult {
  successful: number
  failed: number
  errors: Array<{ id: string; error: string }>
}
```

## Best Practices

### 1. Always Use Functional Updates

```typescript
// ✅ CORRECT - Uses functional update
setItems(currentItems =>
  currentItems.map(item =>
    selectedIds.includes(item.id) ? { ...item, ...updates } : item
  )
)

// ❌ WRONG - Uses closure value
setItems(
  items.map(item =>
    selectedIds.includes(item.id) ? { ...item, ...updates } : item
  )
)
```

### 2. Clear Selection After Operations

```typescript
const handleBatchUpdate = async (updates) => {
  await performUpdate(updates)
  clearSelection()  // Always clear after successful operation
}
```

### 3. Provide User Feedback

```typescript
import { toast } from 'sonner'
import { showBatchOperationResult } from '@/lib/batch-operations'

const result = await batchUpdate(...)
showBatchOperationResult(result, 'Update')
```

### 4. Handle Errors Gracefully

```typescript
try {
  const result = await batchOperation()
  if (result.failed > 0) {
    console.error('Failed items:', result.errors)
    toast.warning(`${result.successful} succeeded, ${result.failed} failed`)
  }
} catch (error) {
  toast.error('Batch operation failed')
}
```

### 5. Optimize for Large Datasets

```typescript
// Use batch size to control processing
await executeBatchOperation(
  items,
  'update',
  operationFn,
  { batchSize: 50 }  // Process 50 at a time
)
```

## Module Integration Status

| Module | Batch Selection | Batch Delete | Batch Update | Custom Actions | Export |
|--------|----------------|--------------|--------------|----------------|--------|
| Front Office | ✅ | ✅ | ✅ | ✅ | ✅ |
| Housekeeping | ✅ | ✅ | ✅ | ✅ | ✅ |
| Inventory | ✅ | ✅ | ✅ | ✅ | ✅ |
| F&B/POS | ✅ | ✅ | ✅ | ✅ | ✅ |
| HR Management | ✅ | ✅ | ✅ | ✅ | ✅ |
| Procurement | ✅ | ✅ | ✅ | ✅ | ✅ |
| Finance | ✅ | ✅ | ✅ | ✅ | ✅ |
| Kitchen Ops | ✅ | ✅ | ✅ | ✅ | ✅ |
| CRM | ✅ | ✅ | ✅ | ✅ | ✅ |
| Construction | ✅ | ✅ | ✅ | ✅ | ✅ |
| Settings | ✅ | ✅ | ✅ | ✅ | ✅ |

## Troubleshooting

### Issue: Selection state not persisting

**Solution:** Ensure you're using the `useBatchSelection` hook and not managing state manually.

### Issue: Batch operations not showing

**Solution:** Check that `selectedIds.length > 0` and that the `BatchOperationsToolbar` component is rendered.

### Issue: Updates not reflecting

**Solution:** Always use functional updates with `setItems(current => ...)` pattern.

### Issue: Performance issues with large datasets

**Solution:** Adjust the `batchSize` option in `executeBatchOperation`.

## Future Enhancements

- [ ] Undo/Redo for batch operations
- [ ] Batch operation history/audit log
- [ ] Scheduled batch operations
- [ ] Advanced filtering before batch operations
- [ ] Batch operation templates
- [ ] Import from CSV/Excel with validation
- [ ] Batch operation permissions/roles
- [ ] Real-time collaboration on batch operations

## Support

For issues or questions about batch operations:
1. Check this guide first
2. Review the example implementations
3. Check the TypeScript types for component props
4. Consult the batch-operations.ts library file

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Core batch operations (delete, update, export)
- Universal batch dialog
- Batch selection hook
- Pre-configured field sets for all entity types
- Comprehensive documentation
