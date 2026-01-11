# Pagination Quick Reference Card

## 🚀 Quick Start

### Import
```typescript
import { usePaginatedTable } from '@/hooks/use-paginated-table'
import { Pagination } from '@/components/Pagination'
```

### Basic Usage
```typescript
const { paginatedData, pagination, goToPage, setItemsPerPage } = 
  usePaginatedTable(items, {
    initialItemsPerPage: 50,
    searchFields: ['name', 'email'],
  })

return (
  <>
    <Table>
      {paginatedData.map(item => <TableRow key={item.id}>...</TableRow>)}
    </Table>
    <Pagination
      pagination={pagination}
      onPageChange={goToPage}
      onItemsPerPageChange={setItemsPerPage}
    />
  </>
)
```

## 📊 Hook API Reference

### `usePaginatedTable<T>(data, options)`

#### Parameters
```typescript
data: T[]  // Array of items to paginate

options: {
  initialItemsPerPage?: number  // Default: 50
  searchFields?: (keyof T)[]    // Fields to search
  enableSelection?: boolean      // Default: true
}
```

#### Returns
```typescript
{
  // Pagination
  paginatedData: T[]              // Current page items
  pagination: PaginationState     // Page state info
  goToPage: (page: number) => void
  setItemsPerPage: (n: number) => void
  nextPage: () => void
  prevPage: () => void
  
  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void
  filteredData: T[]               // All filtered items
  
  // Selection
  selectedIds: Set<string>
  toggleSelect: (id: string) => void
  toggleSelectAll: () => void
  clearSelection: () => void
  selectedItems: T[]              // All selected items
}
```

## 🎯 Common Patterns

### Pattern 1: Simple List
```typescript
const { paginatedData, pagination, goToPage, setItemsPerPage } = 
  usePaginatedTable(items, { initialItemsPerPage: 50 })
```

### Pattern 2: With Search
```typescript
const { 
  paginatedData, 
  pagination, 
  goToPage, 
  setItemsPerPage,
  searchQuery,
  setSearchQuery 
} = usePaginatedTable(items, {
  initialItemsPerPage: 50,
  searchFields: ['name', 'email', 'phone']
})

// In render:
<Input 
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder="Search..."
/>
```

### Pattern 3: With Selection
```typescript
const { 
  paginatedData,
  selectedIds,
  toggleSelect,
  toggleSelectAll,
  selectedItems 
} = usePaginatedTable(items, {
  initialItemsPerPage: 50,
  enableSelection: true
})

// Select all on page:
<Checkbox
  checked={selectedIds.size === paginatedData.length}
  onCheckedChange={toggleSelectAll}
/>

// Select individual:
<Checkbox
  checked={selectedIds.has(item.id)}
  onCheckedChange={() => toggleSelect(item.id)}
/>
```

### Pattern 4: With Batch Operations
```typescript
const { selectedItems, selectedIds, clearSelection } = 
  usePaginatedTable(items, { enableSelection: true })

const handleBatchDelete = () => {
  // Use selectedItems (not selectedIds)
  setItems(prev => prev.filter(item => !selectedIds.has(item.id)))
  clearSelection()
  toast.success(`Deleted ${selectedItems.length} items`)
}
```

### Pattern 5: Export All vs Selected
```typescript
const { filteredData, selectedItems, selectedIds } = 
  usePaginatedTable(items, { enableSelection: true })

// Export all (respects filters, not just current page)
const exportAll = () => {
  exportToCsv(filteredData)
}

// Export only selected
const exportSelected = () => {
  exportToCsv(selectedItems)
}
```

## ⚙️ Default Configuration

### Items Per Page by Module Type
| Type | Default | Options |
|------|---------|---------|
| Large datasets (Logs, Inventory) | 100 | 50, 100, 200, 500 |
| Medium datasets (Guests, Orders) | 50 | 25, 50, 100, 200 |
| Small datasets (Settings) | 25 | 25, 50, 100 |

### Search Fields by Module
| Module | Search Fields |
|--------|---------------|
| Guests | name, email, phone, nationality |
| Reservations | guestName, roomNumber, status, confirmationNumber |
| Invoices | invoiceNumber, guestName, status |
| Employees | firstName, lastName, email, department |
| Suppliers | name, contactPerson, email, category |
| Products | name, category, supplier, sku |

## 🔧 Pagination Component Props

```typescript
<Pagination
  pagination={pagination}           // Required: state object
  onPageChange={goToPage}          // Required: page change handler
  onItemsPerPageChange={setItemsPerPage}  // Required: items/page handler
  itemsPerPageOptions={[25, 50, 100, 200]}  // Optional: custom options
/>
```

## ✅ Best Practices

### DO ✅
```typescript
// Use paginatedData in your table
{paginatedData.map(item => <Row key={item.id} />)}

// Use filteredData for exports
exportToCsv(filteredData)

// Use selectedItems for batch operations
batchDelete(selectedItems)

// Use functional updates
setItems(prev => prev.filter(item => !selectedIds.has(item.id)))
```

### DON'T ❌
```typescript
// Don't use full data in table (performance issue)
{items.map(item => <Row key={item.id} />)}

// Don't export only current page
exportToCsv(paginatedData)

// Don't use selectedIds directly for operations
batchDelete(Array.from(selectedIds))

// Don't mutate data directly
items.filter(item => !selectedIds.has(item.id))
```

## 🐛 Troubleshooting

### Issue: Pagination doesn't update after filter
**Solution**: Make sure you're passing filtered data to `usePaginatedTable`
```typescript
const filteredItems = items.filter(item => item.status === selectedStatus)
const { paginatedData } = usePaginatedTable(filteredItems, {...})
```

### Issue: Selection doesn't work across pages
**Solution**: Use `selectedItems` not `selectedIds` for operations
```typescript
// ✅ Correct
const handleDelete = () => {
  deleteItems(selectedItems)
}

// ❌ Wrong  
const handleDelete = () => {
  const items = paginatedData.filter(item => selectedIds.has(item.id))
  deleteItems(items)
}
```

### Issue: Export only exports current page
**Solution**: Use `filteredData` not `paginatedData`
```typescript
// ✅ Correct
const { filteredData } = usePaginatedTable(items, {...})
const handleExport = () => exportToCsv(filteredData)

// ❌ Wrong
const { paginatedData } = usePaginatedTable(items, {...})
const handleExport = () => exportToCsv(paginatedData)
```

### Issue: Pagination shows wrong total
**Solution**: Hook automatically handles this - check your data source
```typescript
// Make sure you're passing the right data
const { paginatedData } = usePaginatedTable(items, {...})
// pagination.totalItems will be items.length

// If you have pre-filtered data:
const filtered = items.filter(someCondition)
const { paginatedData } = usePaginatedTable(filtered, {...})
// pagination.totalItems will be filtered.length
```

## 📱 Mobile Considerations

### Responsive Table Pattern
```typescript
{/* Desktop */}
<div className="hidden md:block">
  <Table>
    {paginatedData.map(item => <TableRow key={item.id}>...</TableRow>)}
  </Table>
  <Pagination {...} />
</div>

{/* Mobile */}
<div className="md:hidden">
  {paginatedData.map(item => (
    <Card key={item.id}>...</Card>
  ))}
  <Pagination {...} />
</div>
```

## 🔍 Testing Checklist

- [ ] Test with 0 items
- [ ] Test with 1 item
- [ ] Test with exactly itemsPerPage items
- [ ] Test with 1000+ items
- [ ] Test search functionality
- [ ] Test batch selection
- [ ] Test batch delete
- [ ] Test export all
- [ ] Test export selected
- [ ] Test mobile view
- [ ] Test page navigation
- [ ] Test items per page change

## 📚 More Information

- Full Guide: `PAGINATION_COMPLETE_GUIDE.md`
- Implementation Details: `PAGINATION_IMPLEMENTATION_COMPLETE.md`
- Integration Examples: `PAGINATION_INTEGRATION_GUIDE.md`
- Final Verification: `PAGINATION_FINAL_VERIFICATION.md`

---

**Quick Tip**: Start with defaults (50 items/page) and adjust based on your data and use case.
