# Table Filtering and Sorting System

A comprehensive filtering and sorting system for all responsive data views in the W3 Hotel PMS.

## Features

- **Multi-field Filtering**: Apply filters on multiple fields simultaneously
- **Advanced Filter Types**:
  - Text filters (contains, equals, starts with, ends with)
  - Number filters (equals, greater than, less than, range)
  - Date filters (single date or date range)
  - Select filters (dropdown options)
  - Boolean filters (yes/no)
- **Flexible Sorting**: Sort by any field in ascending or descending order
- **Filter Badges**: Visual representation of active filters
- **Result Counting**: Shows filtered vs total results
- **Mobile Responsive**: Works seamlessly on all screen sizes
- **Type-safe**: Full TypeScript support

## Usage

### Basic Setup

```typescript
import { useTableFilterSort } from '@/hooks/use-table-filter-sort'
import { TableFilterSort, type FilterField, type SortField } from '@/components/TableFilterSort'

// Define your filter fields
const filterFields: FilterField[] = [
  {
    field: 'name',
    label: 'Name',
    type: 'text',
    operators: ['contains', 'equals', 'startsWith']
  },
  {
    field: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Pending', value: 'pending' },
      { label: 'Completed', value: 'completed' }
    ]
  },
  {
    field: 'amount',
    label: 'Amount',
    type: 'number',
    operators: ['equals', 'gt', 'gte', 'lt', 'lte']
  },
  {
    field: 'date',
    label: 'Date',
    type: 'date'
  },
  {
    field: 'isActive',
    label: 'Active',
    type: 'boolean'
  }
]

// Define your sort fields
const sortFields: SortField[] = [
  { field: 'name', label: 'Name' },
  { field: 'date', label: 'Date' },
  { field: 'amount', label: 'Amount' },
  { field: 'status', label: 'Status' }
]

function MyComponent() {
  const [data, setData] = useState([...])

  const {
    filteredAndSortedData,
    filters,
    sortConfig,
    addFilter,
    removeFilter,
    clearFilters,
    setSort,
  } = useTableFilterSort(data, { field: 'date', direction: 'desc' })

  return (
    <div>
      <TableFilterSort
        filterFields={filterFields}
        sortFields={sortFields}
        filters={filters}
        sortConfig={sortConfig}
        onAddFilter={addFilter}
        onRemoveFilter={removeFilter}
        onClearFilters={clearFilters}
        onSetSort={setSort}
        resultCount={filteredAndSortedData.length}
        totalCount={data.length}
      />
      
      {/* Render your table/cards with filteredAndSortedData */}
    </div>
  )
}
```

### Filter Types

#### Text Filter
```typescript
{
  field: 'customerName',
  label: 'Customer Name',
  type: 'text',
  operators: ['contains', 'equals', 'startsWith', 'endsWith']
}
```

#### Number Filter
```typescript
{
  field: 'totalAmount',
  label: 'Total Amount',
  type: 'number',
  operators: ['equals', 'gt', 'gte', 'lt', 'lte']
}
```

#### Number Range Filter
```typescript
{
  field: 'price',
  label: 'Price Range',
  type: 'range'
}
```

#### Date Filter
```typescript
{
  field: 'createdAt',
  label: 'Created Date',
  type: 'date'
}
```

#### Date Range Filter
```typescript
{
  field: 'checkInDate',
  label: 'Check-in Period',
  type: 'dateRange'
}
```

#### Select Filter
```typescript
{
  field: 'status',
  label: 'Status',
  type: 'select',
  options: [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' }
  ]
}
```

#### Boolean Filter
```typescript
{
  field: 'isPaid',
  label: 'Payment Status',
  type: 'boolean'
}
```

### Nested Field Access

The system supports filtering and sorting on nested object properties using dot notation:

```typescript
const filterFields: FilterField[] = [
  {
    field: 'guest.name',
    label: 'Guest Name',
    type: 'text'
  },
  {
    field: 'room.type',
    label: 'Room Type',
    type: 'select',
    options: [
      { label: 'Standard', value: 'standard' },
      { label: 'Deluxe', value: 'deluxe' },
      { label: 'Suite', value: 'suite' }
    ]
  }
]

const sortFields: SortField[] = [
  { field: 'guest.name', label: 'Guest Name' },
  { field: 'reservation.checkInDate', label: 'Check-in Date' }
]
```

### Default Sorting

Set initial sort configuration:

```typescript
const {
  filteredAndSortedData,
  // ...
} = useTableFilterSort(
  data,
  { field: 'createdAt', direction: 'desc' } // Default sort
)
```

## Integration Examples

### Finance Module - Invoice List

```typescript
const filterFields: FilterField[] = [
  { field: 'invoiceNumber', label: 'Invoice #', type: 'text' },
  { field: 'supplier.name', label: 'Supplier', type: 'text' },
  {
    field: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Pending', value: 'pending' },
      { label: 'Approved', value: 'approved' },
      { label: 'Paid', value: 'paid' }
    ]
  },
  { field: 'totalAmount', label: 'Amount', type: 'range' },
  { field: 'invoiceDate', label: 'Invoice Date', type: 'dateRange' },
  { field: 'isPaid', label: 'Paid', type: 'boolean' }
]

const sortFields: SortField[] = [
  { field: 'invoiceNumber', label: 'Invoice #' },
  { field: 'invoiceDate', label: 'Date' },
  { field: 'totalAmount', label: 'Amount' },
  { field: 'supplier.name', label: 'Supplier' }
]
```

### Guest Relations - Guest Profiles

```typescript
const filterFields: FilterField[] = [
  { field: 'fullName', label: 'Name', type: 'text' },
  { field: 'email', label: 'Email', type: 'text' },
  { field: 'nationality', label: 'Nationality', type: 'text' },
  {
    field: 'loyaltyTier',
    label: 'Loyalty Tier',
    type: 'select',
    options: [
      { label: 'Bronze', value: 'bronze' },
      { label: 'Silver', value: 'silver' },
      { label: 'Gold', value: 'gold' },
      { label: 'Platinum', value: 'platinum' }
    ]
  },
  { field: 'totalSpent', label: 'Total Spent', type: 'range' },
  { field: 'lastVisit', label: 'Last Visit', type: 'date' }
]
```

### Procurement - Purchase Orders

```typescript
const filterFields: FilterField[] = [
  { field: 'poNumber', label: 'PO Number', type: 'text' },
  { field: 'supplier.name', label: 'Supplier', type: 'text' },
  {
    field: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Submitted', value: 'submitted' },
      { label: 'Approved', value: 'approved' },
      { label: 'Received', value: 'received' }
    ]
  },
  { field: 'orderDate', label: 'Order Date', type: 'dateRange' },
  { field: 'totalAmount', label: 'Amount', type: 'range' }
]
```

### Front Office - Reservations

```typescript
const filterFields: FilterField[] = [
  { field: 'confirmationNumber', label: 'Confirmation #', type: 'text' },
  { field: 'guestName', label: 'Guest Name', type: 'text' },
  {
    field: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Confirmed', value: 'confirmed' },
      { label: 'Checked In', value: 'checked-in' },
      { label: 'Checked Out', value: 'checked-out' },
      { label: 'Cancelled', value: 'cancelled' }
    ]
  },
  { field: 'checkInDate', label: 'Check-in', type: 'dateRange' },
  { field: 'roomType', label: 'Room Type', type: 'text' },
  { field: 'totalAmount', label: 'Amount', type: 'range' }
]
```

### Inventory - Food Items

```typescript
const filterFields: FilterField[] = [
  { field: 'name', label: 'Item Name', type: 'text' },
  { field: 'category', label: 'Category', type: 'text' },
  { field: 'supplier.name', label: 'Supplier', type: 'text' },
  { field: 'currentStock', label: 'Stock Level', type: 'range' },
  { field: 'expiryDate', label: 'Expiry Date', type: 'dateRange' },
  {
    field: 'needsReorder',
    label: 'Needs Reorder',
    type: 'boolean'
  }
]
```

## Best Practices

1. **Keep Filter Fields Relevant**: Only include fields that users commonly filter by
2. **Provide Appropriate Operators**: For text fields, include contains, equals, starts with
3. **Use Select for Status Fields**: Dropdown filters work better than text for status/category fields
4. **Default Sort**: Set a sensible default sort (usually by date descending)
5. **Show Result Count**: Always display filtered vs total results
6. **Mobile Considerations**: Filter badges wrap nicely on mobile
7. **Performance**: The hook uses memoization to avoid unnecessary re-filtering

## API Reference

### useTableFilterSort Hook

```typescript
const {
  filteredAndSortedData,  // Filtered and sorted data array
  filters,                // Current active filters
  sortConfig,             // Current sort configuration
  addFilter,              // Function to add/update a filter
  removeFilter,           // Function to remove a filter by field
  clearFilters,           // Function to clear all filters
  setSort,                // Function to set sort field (toggles direction)
  hasFilters,             // Boolean indicating if any filters are active
  hasSorting,             // Boolean indicating if sorting is active
} = useTableFilterSort(data, defaultSort?)
```

### TableFilterSort Component Props

```typescript
interface TableFilterSortProps {
  filterFields?: FilterField[]    // Available filter fields
  sortFields?: SortField[]        // Available sort fields
  filters: FilterConfig[]         // Current filters (from hook)
  sortConfig: SortConfig | null   // Current sort (from hook)
  onAddFilter: (filter: FilterConfig) => void
  onRemoveFilter: (field: string) => void
  onClearFilters: () => void
  onSetSort: (field: string) => void
  resultCount?: number            // Filtered result count
  totalCount?: number             // Total data count
}
```

## Migration Guide

To add filtering and sorting to existing data views:

1. Import the hook and component
2. Define your filter and sort fields
3. Wrap your data with `useTableFilterSort`
4. Add the `<TableFilterSort />` component above your table
5. Use `filteredAndSortedData` instead of raw data

Example:

```typescript
// Before
function MyList() {
  const [items] = useKV('items', [])
  
  return (
    <Table>
      {items.map(item => <TableRow key={item.id}>...</TableRow>)}
    </Table>
  )
}

// After
function MyList() {
  const [items] = useKV('items', [])
  
  const {
    filteredAndSortedData,
    filters,
    sortConfig,
    addFilter,
    removeFilter,
    clearFilters,
    setSort,
  } = useTableFilterSort(items)
  
  return (
    <>
      <TableFilterSort
        filterFields={filterFields}
        sortFields={sortFields}
        filters={filters}
        sortConfig={sortConfig}
        onAddFilter={addFilter}
        onRemoveFilter={removeFilter}
        onClearFilters={clearFilters}
        onSetSort={setSort}
        resultCount={filteredAndSortedData.length}
        totalCount={items.length}
      />
      <Table>
        {filteredAndSortedData.map(item => <TableRow key={item.id}>...</TableRow>)}
      </Table>
    </>
  )
}
```
