# Quick Reference: Performance Utilities

## 🚀 How to Add Pagination to Any List

### Step 1: Import
```tsx
import { usePagination } from '@/lib/performance-utils'
import { Pagination } from '@/components/Pagination'
```

### Step 2: Use Hook
```tsx
const { paginatedData, pagination, goToPage, setItemsPerPage } = 
  usePagination(yourData, 50) // 50 items per page
```

### Step 3: Render
```tsx
return (
  <>
    <Table data={paginatedData} />
    <Pagination
      pagination={pagination}
      onPageChange={goToPage}
      onItemsPerPageChange={setItemsPerPage}
    />
  </>
)
```

**That's it!** Your list now supports pagination.

---

## 💾 How to Add Caching

### Option 1: Using React Hook
```tsx
import { useClientCache } from '@/lib/performance-utils'

const { data, loading, refresh } = useClientCache(
  'cache-key',
  () => expensiveFunction(),
  [dependencies],
  60000 // 1 minute TTL
)
```

### Option 2: Using Global Cache
```tsx
import { globalCache } from '@/lib/performance-utils'

// Set
globalCache.set('key', data, 300000) // 5 minutes

// Get
const cached = globalCache.get('key')

// Invalidate
globalCache.delete('key')
globalCache.invalidatePattern(/^guest-/)
```

---

## 📦 How to Add Batch Operations

### Batch Delete
```tsx
import { batchDelete, showBatchOperationResult } from '@/lib/batch-operations'

const handleBatchDelete = async () => {
  const result = await batchDelete(
    selectedItems,
    (id) => deleteItem(id),
    {
      confirmMessage: `Delete ${selectedItems.length} items?`,
      onProgress: (done, total) => console.log(`${done}/${total}`)
    }
  )
  showBatchOperationResult(result, 'Delete')
}
```

### Batch Export
```tsx
import { batchExport } from '@/lib/batch-operations'

const handleExport = () => {
  batchExport(items, {
    format: 'csv',
    filename: 'my-export',
    selectedFields: ['name', 'email', 'status']
  })
}
```

### Batch Update
```tsx
import { batchUpdate, showBatchOperationResult } from '@/lib/batch-operations'

const handleBatchActivate = async () => {
  const result = await batchUpdate(
    selectedItems,
    (item, updates) => updateItem(item.id, updates),
    { status: 'active' }
  )
  showBatchOperationResult(result, 'Activate')
}
```

---

## 📊 Performance Utilities Cheat Sheet

### Pagination
```tsx
const { paginatedData, pagination, goToPage, setItemsPerPage } = 
  usePagination(data, itemsPerPage)
```

### Caching
```tsx
const { data, loading, refresh } = 
  useClientCache(key, fetchFn, deps, ttl)
```

### Virtual Scrolling
```tsx
const { visibleItems, totalHeight, offsetY, onScroll } = 
  useVirtualScroll(items, itemHeight, containerHeight)
```

### Debounce
```tsx
const debouncedValue = useDebounce(value, 300)
```

### Batch Processing
```tsx
const results = await processBatch(items, processFn, batchSize)
```

### Performance Measurement
```tsx
const result = measurePerformance(() => heavyWork(), 'Label')
const asyncResult = await measureAsyncPerformance(async () => await work(), 'Label')
```

---

## 🎯 When to Use What

### Use Pagination When:
- List has > 50 items
- Data updates infrequently
- Full dataset search not required

### Use Caching When:
- Data is expensive to compute/fetch
- Data changes infrequently (< 5 min)
- Same data accessed multiple times

### Use Virtual Scrolling When:
- List has > 500 items
- All items must be searchable
- Items have uniform height

### Use Batch Operations When:
- Operating on multiple items
- Need progress feedback
- Operations might fail individually

---

## 📱 Responsive CSS Classes

### Dialog Grids
```html
<div class="dialog-grid-1">  <!-- 1 column -->
<div class="dialog-grid-2">  <!-- 1 mobile, 2 desktop -->
<div class="dialog-grid-3">  <!-- 1 mobile, 2 tablet, 3 desktop -->
<div class="dialog-grid-4">  <!-- 1 mobile, 2 tablet, 4 desktop -->
```

### Mobile Utilities
```html
<div class="mobile-stack">    <!-- Column mobile, row desktop -->
<div class="mobile-hide">     <!-- Hidden on mobile -->
<div class="mobile-show">     <!-- Visible only on mobile -->
```

### Form Fields
```html
<input class="dialog-form-input">
<textarea class="dialog-form-textarea">
<button class="dialog-button">
```

---

## 💰 Currency Formatting

```tsx
import { formatCurrency } from '@/lib/helpers'

formatCurrency(1234.56)  // "LKR 1,234.56"
```

**Always use the helper** - Never hardcode currency symbols.

---

## ✅ Quick Checklist for New Features

- [ ] Add pagination if list > 50 items
- [ ] Add caching for expensive operations
- [ ] Use formatCurrency() for all amounts
- [ ] Use responsive grid classes for dialogs
- [ ] Test on mobile (375px width minimum)
- [ ] Add batch operations for bulk actions
- [ ] Measure performance for slow operations
- [ ] Invalidate cache when data changes

---

## 📚 Documentation Files

- `OPTIMIZATION_IMPLEMENTATION.md` - Full optimization guide
- `PAGINATION_INTEGRATION_GUIDE.md` - Detailed integration examples
- `SYSTEM_VERIFICATION_REPORT.md` - Test results & benchmarks
- `KNOWN_ISSUES_RESOLVED.md` - Issue resolution tracking
- `PERFORMANCE_SUMMARY.md` - Executive summary

---

## 🎓 Code Examples

### Complete Paginated List with Batch Operations
```tsx
function MyList({ items, onUpdate, onDelete }) {
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [search, setSearch] = useState('')
  
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  )
  
  const { paginatedData, pagination, goToPage, setItemsPerPage } = 
    usePagination(filteredItems, 50)
  
  const selectedItems = items.filter(i => selectedIds.has(i.id))
  
  const handleBatchDelete = async () => {
    const result = await batchDelete(
      selectedItems,
      (id) => onDelete(id),
      { onProgress: (done, total) => console.log(`${done}/${total}`) }
    )
    showBatchOperationResult(result, 'Delete')
    setSelectedIds(new Set())
  }
  
  const handleExport = () => {
    batchExport(selectedItems.length > 0 ? selectedItems : filteredItems, {
      format: 'csv',
      filename: 'export'
    })
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
        />
        {selectedIds.size > 0 && (
          <div className="flex gap-2">
            <Button onClick={handleExport}>Export</Button>
            <Button variant="destructive" onClick={handleBatchDelete}>
              Delete {selectedIds.size}
            </Button>
          </div>
        )}
      </div>
      
      <Table data={paginatedData} />
      
      <Pagination
        pagination={pagination}
        onPageChange={goToPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  )
}
```

---

## 🚀 Performance Tips

1. **Pagination over virtual scrolling** for most cases
2. **Cache static data** (room types, rate plans)
3. **Debounce search inputs** (300ms recommended)
4. **Batch API calls** when possible
5. **Invalidate cache** when data changes
6. **Measure performance** of slow operations
7. **Use memo** for expensive calculations
8. **Test with 1000+ records** regularly

---

**Quick Start**: Add pagination to a list in 3 lines of code!

```tsx
const { paginatedData, pagination, goToPage, setItemsPerPage } = usePagination(data, 50)
<Table data={paginatedData} />
<Pagination pagination={pagination} onPageChange={goToPage} onItemsPerPageChange={setItemsPerPage} />
```

