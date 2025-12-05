# Mobile Table Optimization Guide

## Overview

This guide explains the mobile-responsive table system that automatically switches between table views (desktop) and card views (mobile) for optimal user experience across all devices.

## Components

### 1. ResponsiveDataView

A flexible component that renders data as tables on desktop and cards on mobile.

**Features:**
- Automatic responsive switching
- Optional manual view toggle (table/cards)
- Customizable column rendering
- Click handlers for rows/cards
- Custom card content rendering
- Empty state handling

**Usage:**

```tsx
import { ResponsiveDataView, type Column } from '@/components/ResponsiveDataView'

interface Invoice {
  id: string
  number: string
  customer: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  date: string
}

const columns: Column<Invoice>[] = [
  {
    key: 'number',
    label: 'Invoice #',
    mobileLabel: 'Number',
  },
  {
    key: 'customer',
    label: 'Customer Name',
  },
  {
    key: 'amount',
    label: 'Amount',
    render: (item) => formatCurrency(item.amount),
    className: 'text-right font-semibold',
  },
  {
    key: 'status',
    label: 'Status',
    render: (item) => (
      <Badge variant={item.status === 'paid' ? 'success' : 'destructive'}>
        {item.status}
      </Badge>
    ),
  },
  {
    key: 'date',
    label: 'Date',
    hideOnMobile: true, // This column won't show on mobile cards
  },
]

function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([])

  return (
    <ResponsiveDataView
      data={invoices}
      columns={columns}
      keyExtractor={(item) => item.id}
      onRowClick={(invoice) => openInvoiceDetails(invoice)}
      emptyMessage="No invoices found"
      allowViewToggle={true}
      defaultView="table"
    />
  )
}
```

### 2. MobileTableCard

A pre-built card component for mobile table rows with consistent styling.

**Usage:**

```tsx
import { MobileTableCard, MobileTableGrid } from '@/components/MobileTableCard'

function CustomMobileView() {
  return (
    <MobileTableGrid>
      {invoices.map((invoice) => (
        <MobileTableCard
          key={invoice.id}
          onClick={() => handleClick(invoice)}
          header={
            <div className="flex items-center justify-between">
              <span className="font-semibold">{invoice.number}</span>
              <Badge>{invoice.status}</Badge>
            </div>
          }
          fields={[
            { label: 'Customer', value: invoice.customer },
            { label: 'Amount', value: formatCurrency(invoice.amount) },
            { label: 'Date', value: formatDate(invoice.date) },
            {
              label: 'Notes',
              value: invoice.notes,
              fullWidth: true, // This field takes full width
            },
          ]}
          actions={
            <>
              <Button size="sm" variant="outline">View</Button>
              <Button size="sm">Pay</Button>
            </>
          }
          highlight={invoice.status === 'overdue'}
        />
      ))}
    </MobileTableGrid>
  )
}
```

### 3. useTableView Hook

A hook for managing table/card view preferences with persistent storage.

**Usage:**

```tsx
import { useTableView } from '@/hooks/use-table-view'

function MyComponent() {
  const { viewMode, setViewMode, isMobile, isTableView, isCardsView } = useTableView({
    storageKey: 'invoice-view-preference',
    defaultView: 'table',
    mobileBreakpoint: 768,
  })

  return (
    <div>
      {!isMobile && (
        <div className="flex gap-2">
          <Button
            variant={isTableView ? 'default' : 'outline'}
            onClick={() => setViewMode('table')}
          >
            Table View
          </Button>
          <Button
            variant={isCardsView ? 'default' : 'outline'}
            onClick={() => setViewMode('cards')}
          >
            Cards View
          </Button>
        </div>
      )}

      {isTableView && <TableView />}
      {isCardsView && <CardsView />}
    </div>
  )
}
```

## Best Practices

### Column Configuration

1. **Use mobileLabel for shorter labels:**
   ```tsx
   {
     key: 'customerFullName',
     label: 'Customer Full Name',
     mobileLabel: 'Customer', // Shorter for mobile
   }
   ```

2. **Hide non-essential columns on mobile:**
   ```tsx
   {
     key: 'createdAt',
     label: 'Created Date',
     hideOnMobile: true, // Not critical for mobile view
   }
   ```

3. **Use custom render for complex data:**
   ```tsx
   {
     key: 'status',
     label: 'Status',
     render: (item) => (
       <div className="flex items-center gap-2">
         <StatusIcon status={item.status} />
         <span>{item.status}</span>
       </div>
     ),
   }
   ```

### Card Content

1. **Provide custom card rendering for complex layouts:**
   ```tsx
   <ResponsiveDataView
     data={data}
     columns={columns}
     renderCardContent={(item) => (
       <div className="space-y-3">
         <div className="flex items-start justify-between">
           <div>
             <h3 className="font-semibold">{item.title}</h3>
             <p className="text-sm text-muted-foreground">{item.subtitle}</p>
           </div>
           <Badge>{item.status}</Badge>
         </div>
         <Separator />
         <div className="grid grid-cols-2 gap-2 text-sm">
           <div>
             <span className="text-muted-foreground">Amount:</span>
             <span className="ml-2 font-medium">{formatCurrency(item.amount)}</span>
           </div>
           <div>
             <span className="text-muted-foreground">Date:</span>
             <span className="ml-2">{formatDate(item.date)}</span>
           </div>
         </div>
       </div>
     )}
   />
   ```

### Responsive Styling

1. **Use Tailwind responsive classes:**
   ```tsx
   className="text-xs sm:text-sm md:text-base"
   className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
   ```

2. **Hide/show elements based on screen size:**
   ```tsx
   <div className="hidden md:block">Desktop only</div>
   <div className="md:hidden">Mobile only</div>
   ```

3. **Adjust spacing for mobile:**
   ```tsx
   className="p-2 sm:p-4 md:p-6"
   className="gap-2 sm:gap-3 md:gap-4"
   ```

## Migration Guide

### Converting Existing Tables

**Before:**
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {users.map((user) => (
      <TableRow key={user.id}>
        <TableCell>{user.name}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>{user.status}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**After:**
```tsx
const columns: Column<User>[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' },
]

<ResponsiveDataView
  data={users}
  columns={columns}
  keyExtractor={(user) => user.id}
/>
```

### Adding Actions to Cards

```tsx
<ResponsiveDataView
  data={items}
  columns={columns}
  renderCardContent={(item) => (
    <MobileTableCard
      fields={[
        { label: 'Name', value: item.name },
        { label: 'Status', value: item.status },
      ]}
      actions={
        <>
          <Button size="sm" onClick={() => handleEdit(item)}>Edit</Button>
          <Button size="sm" variant="destructive" onClick={() => handleDelete(item)}>
            Delete
          </Button>
        </>
      }
    />
  )}
/>
```

## Common Patterns

### 1. List with Search and Filters

```tsx
function DataList() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  const filteredData = data.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ResponsiveDataView data={filteredData} columns={columns} />
    </div>
  )
}
```

### 2. Clickable Rows/Cards

```tsx
<ResponsiveDataView
  data={items}
  columns={columns}
  keyExtractor={(item) => item.id}
  onRowClick={(item) => {
    // Navigate or open dialog
    setSelectedItem(item)
    setDialogOpen(true)
  }}
/>
```

### 3. Nested Data Access

```tsx
const columns: Column<Order>[] = [
  {
    key: 'customer.name', // Access nested property
    label: 'Customer',
  },
  {
    key: 'items',
    label: 'Items',
    render: (order) => order.items.length, // Custom render for arrays
  },
]
```

## Performance Considerations

1. **Memoize expensive renders:**
   ```tsx
   const columns = useMemo(() => [...], [dependencies])
   ```

2. **Virtualize long lists:**
   For lists with 100+ items, consider using virtualization libraries.

3. **Lazy load images:**
   ```tsx
   render: (item) => <img loading="lazy" src={item.image} />
   ```

## Accessibility

1. **Keyboard navigation:**
   - Cards and rows are keyboard accessible when `onRowClick` is provided
   - Use proper button elements for actions

2. **Screen readers:**
   - Labels are properly associated with values
   - Use semantic HTML elements

3. **Focus management:**
   - Cards receive focus outline
   - Action buttons are tabbable

## Testing

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('renders data in table view', () => {
  render(<ResponsiveDataView data={testData} columns={columns} />)
  expect(screen.getByText('Test Item')).toBeInTheDocument()
})

test('switches to card view on mobile', () => {
  window.innerWidth = 500
  render(<ResponsiveDataView data={testData} columns={columns} />)
  // Verify card layout
})

test('handles row click', async () => {
  const handleClick = jest.fn()
  render(
    <ResponsiveDataView
      data={testData}
      columns={columns}
      onRowClick={handleClick}
    />
  )
  await userEvent.click(screen.getByText('Test Item'))
  expect(handleClick).toHaveBeenCalled()
})
```

## Troubleshooting

### Cards not showing on mobile
- Verify the component is using responsive classes
- Check if `hideOnMobile` is set correctly
- Ensure viewport meta tag is present in HTML

### View toggle not working
- Check if `allowViewToggle` is set to `true`
- Verify storage permissions (for persisting view preference)

### Styling issues
- Ensure Tailwind classes are not being purged
- Check for conflicting CSS
- Use browser dev tools to inspect responsive breakpoints

## Future Enhancements

- [ ] Sortable columns
- [ ] Column visibility toggling
- [ ] Bulk selection in card view
- [ ] Export functionality
- [ ] Advanced filtering
- [ ] Customizable breakpoints per component
- [ ] Animation transitions between views
