# Pagination Integration Guide

## Quick Start: Adding Pagination to Existing Modules

This guide shows how to add pagination to existing list views in any module.

## Example 1: Simple List with Pagination

### Before (Without Pagination)
```tsx
import { useState } from 'react'
import { Table } from '@/components/ui/table'

function GuestList({ guests }) {
  const [search, setSearch] = useState('')
  
  const filteredGuests = guests.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase())
  )
  
  return (
    <div>
      <Input 
        value={search} 
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search guests..."
      />
      <Table data={filteredGuests} />
    </div>
  )
}
```

### After (With Pagination)
```tsx
import { useState } from 'react'
import { Table } from '@/components/ui/table'
import { usePagination } from '@/lib/performance-utils'
import { Pagination } from '@/components/Pagination'

function GuestList({ guests }) {
  const [search, setSearch] = useState('')
  
  const filteredGuests = guests.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase())
  )
  
  // Add pagination
  const { 
    paginatedData, 
    pagination, 
    goToPage, 
    setItemsPerPage 
  } = usePagination(filteredGuests, 50)
  
  return (
    <div>
      <Input 
        value={search} 
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search guests..."
      />
      {/* Use paginatedData instead of filteredGuests */}
      <Table data={paginatedData} />
      
      {/* Add pagination controls */}
      <Pagination
        pagination={pagination}
        onPageChange={goToPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  )
}
```

## Example 2: Table with Batch Operations

### Complete Implementation
```tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { usePagination } from '@/lib/performance-utils'
import { Pagination } from '@/components/Pagination'
import { batchDelete, batchUpdate, batchExport, showBatchOperationResult } from '@/lib/batch-operations'
import { Download, Trash, Check } from '@phosphor-icons/react'

function GuestListWithBatchOps({ guests, setGuests }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  
  const filteredGuests = guests.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase())
  )
  
  const { 
    paginatedData, 
    pagination, 
    goToPage, 
    setItemsPerPage 
  } = usePagination(filteredGuests, 50)
  
  const selectedGuests = guests.filter(g => selectedIds.has(g.id))
  
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }
  
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginatedData.map(g => g.id)))
    }
  }
  
  const handleBatchDelete = async () => {
    const result = await batchDelete(
      selectedGuests,
      (id) => {
        setGuests(prev => prev.filter(g => g.id !== id))
      },
      {
        confirmMessage: `Delete ${selectedGuests.length} guests?`,
        onProgress: (done, total) => {
          console.log(`Deleting: ${done}/${total}`)
        }
      }
    )
    showBatchOperationResult(result, 'Delete')
    setSelectedIds(new Set())
  }
  
  const handleBatchActivate = async () => {
    const result = await batchUpdate(
      selectedGuests,
      (guest, updates) => {
        setGuests(prev => prev.map(g => 
          g.id === guest.id ? { ...g, ...updates } : g
        ))
      },
      { status: 'active' }
    )
    showBatchOperationResult(result, 'Activate')
    setSelectedIds(new Set())
  }
  
  const handleExport = () => {
    batchExport(selectedGuests.length > 0 ? selectedGuests : filteredGuests, {
      format: 'csv',
      filename: `guests-export-${Date.now()}`,
      selectedFields: ['name', 'email', 'phone', 'nationality']
    })
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search guests..."
          className="max-w-sm"
        />
        
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchActivate}
            >
              <Check size={16} className="mr-2" />
              Activate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <Download size={16} className="mr-2" />
              Export
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBatchDelete}
            >
              <Trash size={16} className="mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.size === paginatedData.length && paginatedData.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((guest) => (
              <TableRow key={guest.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(guest.id)}
                    onCheckedChange={() => toggleSelect(guest.id)}
                  />
                </TableCell>
                <TableCell>{guest.name}</TableCell>
                <TableCell>{guest.email}</TableCell>
                <TableCell>{guest.phone}</TableCell>
                <TableCell>{guest.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <Pagination
          pagination={pagination}
          onPageChange={goToPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>
    </div>
  )
}
```

## Example 3: With Caching

```tsx
import { useClientCache, globalCache } from '@/lib/performance-utils'

function GuestList({ fetchGuests }) {
  const { data: guests, loading, refresh } = useClientCache(
    'guest-list',
    () => fetchGuests(),
    [], // dependencies
    60000 // 1 minute cache
  )
  
  const { paginatedData, pagination, goToPage, setItemsPerPage } = 
    usePagination(guests || [], 50)
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  return (
    <div>
      <Button onClick={refresh}>Refresh</Button>
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

## Example 4: Virtual Scrolling (for 500+ items)

```tsx
import { useVirtualScroll } from '@/lib/performance-utils'

function LargeGuestList({ guests }) {
  const ITEM_HEIGHT = 50
  const CONTAINER_HEIGHT = 600
  
  const { visibleItems, totalHeight, offsetY, onScroll } = 
    useVirtualScroll(guests, ITEM_HEIGHT, CONTAINER_HEIGHT)
  
  return (
    <div 
      style={{ height: CONTAINER_HEIGHT, overflow: 'auto' }}
      onScroll={onScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((guest) => (
            <div 
              key={guest.id} 
              style={{ height: ITEM_HEIGHT }}
              className="border-b p-3"
            >
              {guest.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

## Module-Specific Integration Checklist

### Front Office Module
- [ ] Guests list - Add pagination (currently ~100 guests)
- [ ] Reservations list - Add pagination + date filter
- [ ] Rooms grid - Add virtual scroll if > 100 rooms
- [ ] Folios - Add pagination
- [ ] Add batch export for guests
- [ ] Add batch check-in for multiple reservations

### Inventory Module
- [ ] Food items - Add pagination (currently ~150 items)
- [ ] Amenities - Add pagination
- [ ] Construction materials - Add pagination
- [ ] General products - Add pagination
- [ ] Add batch update for stock levels
- [ ] Add batch export for low stock items

### Finance Module
- [ ] Invoices - Add pagination (high priority)
- [ ] Payments - Add pagination
- [ ] Expenses - Add pagination
- [ ] Journal entries - Add pagination
- [ ] Add batch approval for invoices
- [ ] Add batch export for financial reports

### HR Module
- [ ] Employees - Add pagination
- [ ] Attendance - Add pagination with date filter
- [ ] Leave requests - Add pagination
- [ ] Performance reviews - Add pagination
- [ ] Add batch approval for leave requests
- [ ] Add batch export for payroll

### Procurement Module
- [ ] Requisitions - Add pagination
- [ ] Purchase orders - Add pagination
- [ ] GRNs - Add pagination
- [ ] Supplier invoices - Add pagination
- [ ] Add batch approval workflow
- [ ] Add batch matching operations

## Cache Invalidation Patterns

```tsx
// When data changes, invalidate cache
import { globalCache } from '@/lib/performance-utils'

function addGuest(guest) {
  // Save guest
  setGuests(prev => [...prev, guest])
  
  // Invalidate related caches
  globalCache.delete('guest-list')
  globalCache.invalidatePattern(/^guest-/)
  globalCache.invalidatePattern(/^reservation-/)
}

function updateGuest(id, updates) {
  setGuests(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g))
  
  // Invalidate specific and pattern caches
  globalCache.delete(`guest-${id}`)
  globalCache.delete('guest-list')
}
```

## Performance Monitoring

```tsx
import { measurePerformance } from '@/lib/performance-utils'

function FilteredGuestList({ guests, filters }) {
  const filteredData = useMemo(() => {
    return measurePerformance(
      () => applyComplexFilters(guests, filters),
      'Guest Filtering'
    )
  }, [guests, filters])
  
  return <Table data={filteredData} />
}
```

## Best Practices Summary

1. **Always use pagination for lists > 50 items**
2. **Use virtual scrolling for lists > 500 items**
3. **Cache expensive computations and API calls**
4. **Implement batch operations for common bulk actions**
5. **Invalidate cache when data changes**
6. **Show progress for long-running batch operations**
7. **Provide export functionality for all major lists**
8. **Test with large datasets (1000+ items)**

## Testing Checklist

- [ ] Test pagination with 0 items
- [ ] Test pagination with 1 item
- [ ] Test pagination with 1000+ items
- [ ] Test search/filter maintains correct page
- [ ] Test batch operations with all items selected
- [ ] Test batch operations with errors
- [ ] Test export with large datasets
- [ ] Test mobile responsiveness of pagination
- [ ] Test cache invalidation after updates
- [ ] Test performance with browser dev tools

