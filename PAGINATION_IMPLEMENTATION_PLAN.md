# Pagination Implementation Plan

## Objective
Add pagination to all 21 module list views for improved performance with large datasets (1000+ records).

## Modules to Update

### Property Management (5 modules)
1. ✅ **Front Office** - Guests, Reservations, Rooms, Folios
2. ✅ **Guest Relations (CRM)** - Guest Profiles, Complaints, Feedback, Campaigns
3. ✅ **Extra Services** - Services list
4. ✅ **Housekeeping** - Tasks, Rooms
5. ✅ **F&B / POS** - Menu Items, Orders

### Revenue Management (2 modules)
6. ✅ **Room & Revenue** - Room Types, Rate Plans, Seasons, Corporate Accounts
7. ✅ **Channel Manager** - Connections, Reservations, Reviews

### Inventory & Procurement (3 modules)
8. ✅ **Inventory** - Food Items, Amenities, Construction Materials, General Products
9. ✅ **Suppliers** - Supplier list
10. ✅ **Procurement & Invoices** - Requisitions, Purchase Orders, GRNs, Invoices

### Kitchen (1 module)
11. ✅ **Kitchen Operations** - Recipes, Menus, Consumption Logs, Stations

### Finance & HR (3 modules)
12. ✅ **Finance** - Invoices, Payments, Expenses, Journal Entries, Budgets
13. ✅ **HR & Staff** - Employees, Attendance, Leave Requests, Performance Reviews
14. ✅ **User Management** - System Users, Activity Logs

### Maintenance (1 module)
15. ✅ **Maintenance & Construction** - Projects, Materials, Contractors

### Analytics & Reports (4 modules)
16. ✅ **Analytics** - Various analytics views with data tables
17. ✅ **Revenue & Occupancy** - Trend tables
18. ✅ **AI Forecasting** - Forecast tables
19. ✅ **Reports** - Report data tables

### Settings & Invoice Center (2 modules)
20. ✅ **Invoice Center** - Guest Invoices, Supplier Invoices, Payments
21. ✅ **Settings** - Configuration lists (Email Templates, Tax Settings)

## Implementation Strategy

### Phase 1: Create Enhanced Pagination Hook
- Combine filtering, sorting, and pagination
- Add search debouncing
- Include batch selection support

### Phase 2: Update All Modules (Priority Order)
1. High-traffic modules first (Front Office, Reservations, Invoices)
2. Large dataset modules (Inventory, Finance)
3. Remaining modules

### Phase 3: Testing & Optimization
- Test with 1000+ records
- Verify mobile responsiveness
- Ensure batch operations work with pagination
- Performance benchmarking

## Technical Approach

### usePaginatedTable Hook
```typescript
const {
  paginatedData,
  pagination,
  goToPage,
  setItemsPerPage,
  selectedIds,
  toggleSelect,
  toggleSelectAll,
  clearSelection,
  filters,
  setFilters,
  sortConfig,
  setSortConfig
} = usePaginatedTable(data, {
  initialItemsPerPage: 50,
  searchFields: ['name', 'email'],
  filterConfig: {...},
  sortConfig: {...}
})
```

### Standard Implementation Pattern
1. Import `usePagination` hook and `Pagination` component
2. Wrap filtered/sorted data with pagination
3. Use `paginatedData` instead of full dataset
4. Add `<Pagination />` component below table
5. Ensure batch operations reference correct dataset

### Items Per Page Options
- Default: 50
- Options: 25, 50, 100, 200
- Modules with small datasets (< 50): 25, 50
- Modules with large datasets: 50, 100, 200, 500

## Success Criteria
- [ ] All 21 modules have pagination
- [ ] Performance improved for 1000+ record datasets
- [ ] Mobile-responsive pagination controls
- [ ] Batch operations work correctly
- [ ] Export functions export all data (not just current page)
- [ ] Search/filter preserves pagination state
- [ ] No breaking changes to existing functionality
