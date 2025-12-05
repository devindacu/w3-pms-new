# Filter & Sort Implementation Guide

This document provides step-by-step instructions for implementing filtering and sorting in all data views across the W3 Hotel PMS.

## Overview

The system now includes:
- **`useTableFilterSort` hook** - Core filtering and sorting logic
- **`TableFilterSort` component** - UI controls for filters and sorting
- **Enhanced `ResponsiveDataView`** - Integrated filtering/sorting support

## Quick Start

### 1. Using ResponsiveDataView (Recommended)

The easiest way to add filtering and sorting is to use the enhanced `ResponsiveDataView` component with column configuration:

```typescript
import { ResponsiveDataView, type Column } from '@/components/ResponsiveDataView'

const columns: Column<YourDataType>[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,           // Enable sorting
    filterable: true,         // Enable filtering
    filterType: 'text',       // Filter type
    filterOperators: ['contains', 'equals', 'startsWith'],
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
    render: (item) => <Badge>{item.status}</Badge>,
  },
  {
    key: 'amount',
    label: 'Amount',
    sortable: true,
    filterable: true,
    filterType: 'range',
    render: (item) => formatCurrency(item.amount),
  },
]

<ResponsiveDataView
  data={yourData}
  columns={columns}
  onRowClick={handleRowClick}
  enableFiltering={true}
  enableSorting={true}
  defaultSort={{ field: 'createdAt', direction: 'desc' }}
/>
```

### 2. Using the Hook Directly (Advanced)

For custom implementations:

```typescript
import { useTableFilterSort } from '@/hooks/use-table-filter-sort'
import { TableFilterSort } from '@/components/TableFilterSort'

const {
  filteredAndSortedData,
  filters,
  sortConfig,
  addFilter,
  removeFilter,
  clearFilters,
  setSort,
} = useTableFilterSort(data, { field: 'date', direction: 'desc' })

<TableFilterSort
  filterFields={[
    { field: 'name', label: 'Name', type: 'text' },
    { field: 'status', label: 'Status', type: 'select', options: [...] },
  ]}
  sortFields={[
    { field: 'name', label: 'Name' },
    { field: 'date', label: 'Date' },
  ]}
  filters={filters}
  sortConfig={sortConfig}
  onAddFilter={addFilter}
  onRemoveFilter={removeFilter}
  onClearFilters={clearFilters}
  onSetSort={setSort}
  resultCount={filteredAndSortedData.length}
  totalCount={data.length}
/>
```

## Module Implementation Checklist

### ✅ Already Enhanced
- ResponsiveDataView component (base component for all data views)

### 🔲 To Be Implemented

#### Finance Module
- [ ] Invoice Management List
- [ ] Payment Records List
- [ ] Journal Entries List
- [ ] GL Account Transactions
- [ ] Bank Reconciliation Items
- [ ] Budget vs Actual Report

#### Guest Relations (CRM)
- [ ] Guest Profile List
- [ ] Complaints List
- [ ] Feedback List
- [ ] Marketing Campaigns
- [ ] Loyalty Transactions

#### Front Office
- [ ] Reservation List
- [ ] Check-in/Check-out History
- [ ] Room Assignment View
- [ ] Folio List

#### Housekeeping
- [ ] Task List
- [ ] Room Status List
- [ ] Cleaning Schedule

#### Procurement
- [ ] Purchase Order List
- [ ] Requisition List
- [ ] GRN List
- [ ] Supplier Invoice List

#### Inventory
- [ ] Food Items List
- [ ] Amenities List
- [ ] Construction Materials List
- [ ] General Products List
- [ ] Stock Movement History

#### HR Management
- [ ] Employee List
- [ ] Attendance Records
- [ ] Leave Requests
- [ ] Performance Reviews
- [ ] Shift/Roster List

#### Kitchen Operations
- [ ] Recipe List
- [ ] Menu List
- [ ] Consumption Logs
- [ ] Production Schedules
- [ ] Waste Tracking

#### Channel Manager
- [ ] OTA Connections
- [ ] Rate Plans
- [ ] Channel Inventory
- [ ] Reservations from Channels
- [ ] Sync Logs

#### Extra Services
- [ ] Service List
- [ ] Category List
- [ ] Folio Assignments

## Step-by-Step Migration

### Example: Migrating Invoice Management

#### Before (Custom Implementation)
```typescript
function InvoiceManagement() {
  const [invoices] = useKV('invoices', [])
  const [search, setSearch] = useState('')
  
  const filtered = invoices.filter(inv => 
    inv.invoiceNumber.includes(search)
  )
  
  return (
    <>
      <Input value={search} onChange={e => setSearch(e.target.value)} />
      <Table>
        {filtered.map(inv => <TableRow>...</TableRow>)}
      </Table>
    </>
  )
}
```

#### After (With Filter & Sort)
```typescript
function InvoiceManagement() {
  const [invoices] = useKV('invoices', [])
  
  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      label: 'Invoice #',
      sortable: true,
      filterable: true,
      filterType: 'text',
    },
    {
      key: 'supplier.name',
      label: 'Supplier',
      sortable: true,
      filterable: true,
      filterType: 'text',
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Draft', value: 'draft' },
        { label: 'Approved', value: 'approved' },
        { label: 'Paid', value: 'paid' },
      ],
      render: (inv) => <Badge>{inv.status}</Badge>,
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      sortable: true,
      filterable: true,
      filterType: 'range',
      render: (inv) => formatCurrency(inv.totalAmount),
    },
    {
      key: 'invoiceDate',
      label: 'Date',
      sortable: true,
      filterable: true,
      filterType: 'dateRange',
      render: (inv) => format(inv.invoiceDate, 'MMM dd, yyyy'),
    },
  ]
  
  return (
    <ResponsiveDataView
      data={invoices}
      columns={columns}
      onRowClick={handleInvoiceClick}
      enableFiltering={true}
      enableSorting={true}
      defaultSort={{ field: 'invoiceDate', direction: 'desc' }}
    />
  )
}
```

## Column Configuration Reference

### Column Properties

```typescript
interface Column<T> {
  key: string | keyof T          // Data field (supports nested: 'supplier.name')
  label: string                  // Display label
  sortable?: boolean             // Enable sorting (default: true)
  filterable?: boolean           // Enable filtering (default: true)
  filterType?: FilterType        // Type of filter control
  filterOptions?: Option[]       // Options for select filters
  filterOperators?: Operator[]   // Available operators for the filter
  render?: (item: T) => ReactNode  // Custom render function
  hideOnMobile?: boolean         // Hide column on mobile
  mobileLabel?: string           // Alternative label for mobile
  className?: string             // CSS classes
}
```

### Filter Types

| Type | Description | Use Case |
|------|-------------|----------|
| `text` | Text input with operators | Names, IDs, descriptions |
| `number` | Number input with operators | Counts, quantities |
| `range` | Min/max number inputs | Prices, amounts |
| `date` | Single date picker | Specific dates |
| `dateRange` | Start/end date pickers | Date periods |
| `select` | Dropdown selection | Status, categories |
| `boolean` | Yes/No selection | Flags, toggles |

### Filter Operators

| Operator | Types | Description |
|----------|-------|-------------|
| `contains` | text | Contains substring |
| `equals` | text, number, date | Exact match |
| `startsWith` | text | Starts with substring |
| `endsWith` | text | Ends with substring |
| `gt` | number, date | Greater than |
| `gte` | number, date | Greater than or equal |
| `lt` | number, date | Less than |
| `lte` | number, date | Less than or equal |

## Best Practices

### 1. Choose Appropriate Filter Types

```typescript
// ✅ Good - Use select for status fields
{
  key: 'status',
  filterType: 'select',
  filterOptions: [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ]
}

// ❌ Bad - Using text for status allows typos
{
  key: 'status',
  filterType: 'text'
}
```

### 2. Use Range Filters for Amounts

```typescript
// ✅ Good - Range filter for amounts
{
  key: 'totalAmount',
  filterType: 'range',
  label: 'Amount'
}

// ❌ Less useful - Single number filter
{
  key: 'totalAmount',
  filterType: 'number'
}
```

### 3. Use Date Ranges for Time Periods

```typescript
// ✅ Good - Date range for periods
{
  key: 'checkInDate',
  filterType: 'dateRange',
  label: 'Check-in Period'
}

// ❌ Less flexible - Single date
{
  key: 'checkInDate',
  filterType: 'date'
}
```

### 4. Provide Operators for Text Fields

```typescript
// ✅ Good - Multiple operators
{
  key: 'invoiceNumber',
  filterType: 'text',
  filterOperators: ['contains', 'equals', 'startsWith']
}

// ❌ Limited - Only one search mode
{
  key: 'invoiceNumber',
  filterType: 'text'
  // Uses 'contains' by default only
}
```

### 5. Set Sensible Default Sorts

```typescript
// ✅ Good - Recent items first
<ResponsiveDataView
  defaultSort={{ field: 'createdAt', direction: 'desc' }}
/>

// ✅ Good - Alphabetical for directories
<ResponsiveDataView
  defaultSort={{ field: 'name', direction: 'asc' }}
/>
```

### 6. Mobile Optimization

```typescript
// ✅ Good - Hide less important columns on mobile
{
  key: 'createdAt',
  label: 'Created',
  hideOnMobile: true
}

// ✅ Good - Shorter labels for mobile
{
  key: 'totalAmount',
  label: 'Total Amount',
  mobileLabel: 'Amount'
}
```

## Testing Checklist

For each implementation, verify:

- [ ] Text filters work with all operators
- [ ] Number filters handle decimals correctly
- [ ] Range filters validate min < max
- [ ] Date filters handle timezone correctly
- [ ] Date range filters require both dates
- [ ] Select filters show all options
- [ ] Boolean filters work for true/false
- [ ] Sorting toggles asc/desc/none
- [ ] Multiple filters can be active
- [ ] Filter badges display correctly
- [ ] Clear all removes all filters
- [ ] Result count updates correctly
- [ ] Mobile view shows filters properly
- [ ] Filter popover closes after apply
- [ ] Sort popover closes after selection
- [ ] Nested fields (supplier.name) work
- [ ] Custom render functions display correctly
- [ ] Performance is good with 1000+ items

## Performance Considerations

The filtering and sorting is optimized with:
- Memoization to avoid re-filtering on unrelated state changes
- Efficient nested value extraction
- Proper comparison functions for different data types

For very large datasets (10,000+ items), consider:
1. Server-side filtering and sorting
2. Virtual scrolling
3. Pagination

## Examples

See the following example files:
- `/src/components/examples/InvoiceListExample.tsx`
- `/src/components/examples/GuestProfileListExample.tsx`
- `/src/components/examples/PurchaseOrderListExample.tsx`

## Support

For questions or issues:
1. Check this guide
2. Review the example implementations
3. Refer to `TABLE_FILTER_SORT_GUIDE.md` for API details
