# Mobile-Optimized Table System

## Overview

The hotel PMS now features a fully responsive table system that automatically adapts to different screen sizes, providing optimal viewing experiences on desktop, tablet, and mobile devices.

## Key Features

### 1. Automatic Responsive Switching
- **Desktop (≥768px)**: Traditional table layout with full columns
- **Mobile (<768px)**: Card-based layout with stacked information
- **Seamless transitions** between layouts as viewport changes

### 2. Three Main Components

#### ResponsiveDataView
A drop-in replacement for standard tables that handles responsive switching automatically.

**Key Props:**
- `data`: Array of items to display
- `columns`: Column configuration with labels, keys, and custom renderers
- `keyExtractor`: Function to get unique key from each item
- `onRowClick`: Optional click handler for rows/cards
- `renderCardContent`: Custom card rendering function
- `allowViewToggle`: Enable manual view switching (default: true)
- `defaultView`: Starting view mode ('table' or 'cards')

#### MobileTableCard
Pre-styled card component for consistent mobile layouts.

**Features:**
- Header section for primary information
- Field list with label/value pairs
- Actions section for buttons
- Highlight mode for important items
- Full-width field support

#### useTableView Hook
React hook for managing view preferences with persistence.

**Returns:**
- `viewMode`: Current view mode
- `setViewMode`: Function to change view
- `isMobile`: Boolean indicating mobile viewport
- `isTableView`: Convenience boolean for table view
- `isCardsView`: Convenience boolean for cards view

## Implementation Examples

### Basic Usage

```tsx
import { ResponsiveDataView, type Column } from '@/components/ResponsiveDataView'

const columns: Column<Invoice>[] = [
  { key: 'number', label: 'Invoice #' },
  { key: 'customer', label: 'Customer' },
  { 
    key: 'amount', 
    label: 'Amount',
    render: (item) => formatCurrency(item.amount),
  },
]

<ResponsiveDataView
  data={invoices}
  columns={columns}
  keyExtractor={(item) => item.id}
/>
```

### With Custom Card Layout

```tsx
<ResponsiveDataView
  data={reservations}
  columns={columns}
  renderCardContent={(reservation) => (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold">{reservation.guestName}</h4>
          <p className="text-sm text-muted-foreground">
            Room {reservation.roomNumber}
          </p>
        </div>
        <Badge>{reservation.status}</Badge>
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Check-in:</span>
          <span className="ml-2">{formatDate(reservation.checkIn)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Check-out:</span>
          <span className="ml-2">{formatDate(reservation.checkOut)}</span>
        </div>
      </div>
    </div>
  )}
/>
```

### Manual View Control

```tsx
import { useTableView } from '@/hooks/use-table-view'

function MyComponent() {
  const { viewMode, setViewMode, isMobile } = useTableView({
    storageKey: 'reservations-view',
  })

  return (
    <>
      {!isMobile && (
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'table' ? 'default' : 'outline'}
            onClick={() => setViewMode('table')}
          >
            Table View
          </Button>
          <Button 
            variant={viewMode === 'cards' ? 'default' : 'outline'}
            onClick={() => setViewMode('cards')}
          >
            Cards View
          </Button>
        </div>
      )}
      
      {viewMode === 'table' ? <TableView /> : <CardsView />}
    </>
  )
}
```

## Column Configuration Best Practices

### 1. Use Mobile-Friendly Labels

```tsx
{
  key: 'customerFullName',
  label: 'Customer Full Name',
  mobileLabel: 'Customer', // Shorter for mobile
}
```

### 2. Hide Non-Essential Columns on Mobile

```tsx
{
  key: 'createdDate',
  label: 'Created Date',
  hideOnMobile: true, // Won't appear in mobile cards
}
```

### 3. Custom Renderers for Complex Data

```tsx
{
  key: 'status',
  label: 'Status',
  render: (item) => (
    <Badge variant={getVariant(item.status)}>
      {item.status}
    </Badge>
  ),
}
```

### 4. Nested Property Access

```tsx
{
  key: 'customer.name', // Access nested properties
  label: 'Customer Name',
}
```

## Mobile Card Patterns

### Pattern 1: Header with Badge

```tsx
<MobileTableCard
  header={
    <div className="flex items-center justify-between">
      <span className="font-semibold">{item.title}</span>
      <Badge>{item.status}</Badge>
    </div>
  }
  fields={[...]}
/>
```

### Pattern 2: Actions at Bottom

```tsx
<MobileTableCard
  fields={[...]}
  actions={
    <>
      <Button size="sm" variant="outline">View</Button>
      <Button size="sm">Edit</Button>
    </>
  }
/>
```

### Pattern 3: Full-Width Fields

```tsx
<MobileTableCard
  fields={[
    { label: 'Name', value: item.name },
    { 
      label: 'Notes', 
      value: item.notes,
      fullWidth: true, // Takes full width
    },
  ]}
/>
```

## CSS Utility Classes

The system includes new utility classes for mobile optimization:

- `.mobile-card-field`: Flex container for label/value pairs
- `.mobile-card-label`: Styled label (muted, min-width)
- `.mobile-card-value`: Styled value (right-aligned, breaks words)
- `.mobile-card-header`: Header section with border
- `.mobile-card-actions`: Actions container with border
- `.responsive-table-wrapper`: Hides table on mobile
- `.mobile-cards-wrapper`: Shows only on mobile

## Responsive Design Guidelines

### Spacing

```tsx
// Use responsive spacing classes
className="p-2 sm:p-4 md:p-6"
className="gap-2 sm:gap-3 md:gap-4"
className="space-y-2 sm:space-y-3 md:space-y-4"
```

### Typography

```tsx
// Scale text appropriately
className="text-xs sm:text-sm md:text-base"
className="text-sm sm:text-base md:text-lg"
```

### Grid Layouts

```tsx
// Responsive grid columns
className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
```

### Visibility

```tsx
// Show/hide based on breakpoint
<div className="hidden md:block">Desktop only</div>
<div className="md:hidden">Mobile only</div>
```

## Migration Guide

### Step 1: Identify Tables to Update

Find all components using standard `<Table>` components that need mobile optimization.

### Step 2: Define Columns

Convert table headers to column definitions:

**Before:**
```tsx
<TableHeader>
  <TableRow>
    <TableHead>Name</TableHead>
    <TableHead>Email</TableHead>
    <TableHead>Status</TableHead>
  </TableRow>
</TableHeader>
```

**After:**
```tsx
const columns: Column<User>[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' },
]
```

### Step 3: Replace Table Component

**Before:**
```tsx
<Table>
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
<ResponsiveDataView
  data={users}
  columns={columns}
  keyExtractor={(user) => user.id}
/>
```

### Step 4: Add Mobile-Specific Enhancements

- Define `mobileLabel` for columns with long labels
- Set `hideOnMobile` for non-essential columns
- Create custom `renderCardContent` for complex layouts

## Performance Considerations

1. **Memoize columns**: Use `useMemo` for column definitions
   ```tsx
   const columns = useMemo(() => [...], [dependencies])
   ```

2. **Optimize renders**: Use `React.memo` for custom renderers
   ```tsx
   const StatusBadge = React.memo(({ status }) => <Badge>{status}</Badge>)
   ```

3. **Virtual scrolling**: For lists with 100+ items, consider virtualization

4. **Lazy images**: Use `loading="lazy"` for images in cards

## Accessibility

- ✅ Keyboard navigation supported
- ✅ Screen reader friendly
- ✅ Proper focus management
- ✅ Semantic HTML elements
- ✅ ARIA labels where appropriate

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Optimized

## Testing

Run the example components to see the system in action:

```tsx
import { 
  ResponsiveTableExample, 
  ManualMobileCardsExample 
} from '@/components/ResponsiveTableExamples'
```

## Future Enhancements

Planned features:
- [ ] Column sorting
- [ ] Column visibility toggle
- [ ] Bulk selection in card view
- [ ] Export functionality
- [ ] Advanced filtering UI
- [ ] Customizable breakpoints
- [ ] Animation transitions

## Troubleshooting

### Cards not showing on mobile
- Check viewport meta tag in HTML
- Verify Tailwind breakpoints
- Inspect with browser dev tools

### View toggle not working
- Ensure `allowViewToggle={true}`
- Check browser storage permissions
- Verify useKV is working

### Styling issues
- Check Tailwind purge settings
- Inspect for CSS conflicts
- Use browser dev tools

## Support

For issues or questions, refer to:
- `MOBILE_TABLE_OPTIMIZATION.md` - Detailed technical guide
- `ResponsiveTableExamples.tsx` - Working examples
- Component source code in `/src/components/`
