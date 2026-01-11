# Cross-Module Integration Guide
## W3 Hotel PMS - Complete Integration Reference

**Generated:** ${new Date().toISOString()}  
**Version:** 2.0  
**Status:** ✅ VERIFIED & DOCUMENTED

---

## Table of Contents

1. [Overview](#overview)
2. [Integration Architecture](#integration-architecture)
3. [Module Dependencies](#module-dependencies)
4. [Data Flow Patterns](#data-flow-patterns)
5. [Integration Points](#integration-points)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The W3 Hotel PMS features 21 integrated modules that share data and functionality to create a unified hotel management system. This document outlines how modules interact, share data, and maintain consistency across the application.

### Core Principle
All modules use the **useKV hook** for persistent data storage, ensuring data survives page refreshes and is shared across all components that access the same keys.

---

## Integration Architecture

### Data Persistence Layer
```typescript
// All persistent data uses useKV hooks
const [guests, setGuests] = useKV<Guest[]>('w3-hotel-guests', [])
const [rooms, setRooms] = useKV<Room[]>('w3-hotel-rooms', [])
const [reservations, setReservations] = useKV<Reservation[]>('w3-hotel-reservations', [])
```

### Module Communication Patterns

#### 1. **Direct Data Sharing**
Modules access the same useKV keys to share data:
```typescript
// Front Office creates a reservation
setReservations((prev) => [...prev, newReservation])

// Housekeeping reads the same data
const activeReservations = reservations.filter(r => r.status === 'checked-in')
```

#### 2. **Event-Based Updates**
Modules trigger updates that cascade to related data:
```typescript
// When check-in happens in Front Office:
- Update reservation status → 'checked-in'
- Update room status → 'occupied-clean'
- Create folio for charges
- Generate housekeeping task
```

#### 3. **Cross-Reference IDs**
Related entities reference each other:
```typescript
interface Reservation {
  guestId: string      // Links to Guest
  roomId: string       // Links to Room
  // ...
}

interface Folio {
  reservationId: string  // Links to Reservation
  guestId: string        // Links to Guest
  // ...
}
```

---

## Module Dependencies

### Front Office Module
**Dependencies:**
- Guests (create, read, update)
- Rooms (read, update status)
- Reservations (create, read, update)
- Folios (create, read, update)
- Extra Services (read, assign to folio)
- Guest Profiles (read for history)

**Provides Data To:**
- Housekeeping (room status updates)
- Finance (folio charges)
- CRM (guest interaction history)
- Analytics (occupancy data)
- Channel Manager (room availability)

### Housekeeping Module
**Dependencies:**
- Rooms (read, update status)
- Reservations (read for scheduling)
- Employees (read for assignment)

**Provides Data To:**
- Front Office (room cleanliness status)
- Analytics (task completion metrics)
- HR Management (employee performance)

### F&B / POS Module
**Dependencies:**
- Menu Items (create, read, update)
- Orders (create, read, update)
- Guests (read for room service)
- Rooms (read for delivery)
- Folios (add charges)

**Provides Data To:**
- Kitchen Operations (order details)
- Finance (revenue tracking)
- Inventory (consumption tracking)
- Analytics (sales data)

### Inventory Module
**Dependencies:**
- Food Items (create, read, update stock)
- Amenities (create, read, update stock)
- Construction Materials (read, update stock)
- General Products (create, read, update stock)
- Suppliers (read for reordering)

**Provides Data To:**
- Procurement (reorder triggers)
- Kitchen Operations (ingredient availability)
- Housekeeping (amenity availability)
- Finance (inventory valuation)
- Forecasting (demand prediction)

### Procurement Module
**Dependencies:**
- Requisitions (create, read, approve)
- Purchase Orders (create, read, update)
- GRNs (create for deliveries)
- Invoices (validate, match)
- Suppliers (read)
- Inventory Items (update stock on GRN)

**Provides Data To:**
- Inventory (stock updates via GRN)
- Finance (accounts payable)
- Suppliers (order history)
- Analytics (procurement metrics)

### Kitchen Operations Module
**Dependencies:**
- Recipes (create, read, update)
- Menus (create, read, update)
- Consumption Logs (create, track usage)
- Food Items (read, update stock)
- Orders (read for production)
- Employees (read for assignment)

**Provides Data To:**
- F&B (menu availability)
- Inventory (consumption updates)
- Finance (cost tracking)
- Analytics (production metrics)

### Finance Module
**Dependencies:**
- Guest Invoices (read, update)
- Supplier Invoices (read, approve, pay)
- Payments (create, read, update)
- Expenses (create, read, approve)
- Budgets (create, read, monitor)
- Chart of Accounts (read)
- Journal Entries (create, post)

**Provides Data To:**
- All Modules (financial reporting)
- Analytics (revenue/expense analysis)
- Reports (financial statements)

### HR Management Module
**Dependencies:**
- Employees (create, read, update)
- Attendance (create, read, track)
- Leave Requests (create, read, approve)
- Shifts (create, read, assign)
- Performance Reviews (create, read)

**Provides Data To:**
- All Modules (employee data)
- Finance (payroll data)
- Analytics (HR metrics)
- Housekeeping (staff assignment)
- Kitchen (staff assignment)

### CRM (Guest Relations) Module
**Dependencies:**
- Guest Profiles (create, read, update)
- Complaints (create, read, resolve)
- Feedback (create, read, analyze)
- Reservations (read for history)
- Orders (read for preferences)
- Marketing Campaigns (create, execute)

**Provides Data To:**
- Front Office (guest preferences)
- Marketing (segmentation)
- Analytics (guest behavior)
- Channel Manager (reviews)

### Channel Manager Module
**Dependencies:**
- OTA Connections (manage)
- Rooms (read availability)
- Rate Plans (read, sync)
- Channel Reservations (import)
- Channel Reviews (import, respond)

**Provides Data To:**
- Front Office (reservations)
- Finance (commission tracking)
- Analytics (channel performance)
- Room & Revenue (pricing sync)

### Room & Revenue Management Module
**Dependencies:**
- Room Types (create, configure)
- Rate Plans (create, configure)
- Seasons (create, define)
- Event Days (create, configure)
- Corporate Accounts (manage rates)
- Rooms (read for inventory)
- Reservations (read for occupancy)

**Provides Data To:**
- Front Office (pricing)
- Channel Manager (rate sync)
- Analytics (revenue optimization)
- Finance (revenue forecasting)

### Extra Services Module
**Dependencies:**
- Service Categories (create, manage)
- Extra Services (create, manage)
- Folios (assign services to)

**Provides Data To:**
- Front Office (service charges)
- Finance (revenue tracking)
- Analytics (service performance)

### Construction & Maintenance Module
**Dependencies:**
- Construction Materials (manage stock)
- Construction Projects (create, track)
- Contractors (manage)
- Maintenance Requests (read)
- Rooms (read for project planning)

**Provides Data To:**
- Inventory (material usage)
- Finance (project costs)
- Procurement (material orders)
- Analytics (project metrics)

### Supplier Management Module
**Dependencies:**
- Suppliers (create, read, update)
- Purchase Orders (read for performance)
- Invoices (read for tracking)
- GRNs (read for delivery performance)

**Provides Data To:**
- Procurement (supplier selection)
- Inventory (supplier info)
- Finance (payment processing)
- Analytics (supplier performance)

### User Management Module
**Dependencies:**
- System Users (create, manage)
- Activity Logs (create, track)
- Permissions (assign, manage)

**Provides Data To:**
- All Modules (authentication, authorization)
- Analytics (user activity)
- Audit (compliance tracking)

### Analytics Module
**Dependencies:**
- ALL MODULES (reads data from everywhere)

**Provides Data To:**
- Dashboard (visualizations)
- Reports (data analysis)
- Management (insights)

### Reports Module
**Dependencies:**
- ALL MODULES (reads data from everywhere)
- Report Templates (manage)
- Report Schedules (automate)

**Provides Data To:**
- Management (scheduled reports)
- Finance (statements)
- Operations (performance reports)

### AI Forecasting Module
**Dependencies:**
- Food Items (consumption history)
- Amenities (usage history)
- Reservations (booking patterns)
- Orders (demand patterns)
- Consumption Logs (kitchen usage)

**Provides Data To:**
- Procurement (reorder predictions)
- Inventory (stock optimization)
- Kitchen (production planning)
- Revenue Management (demand forecasting)

### Settings Module
**Dependencies:**
- Hotel Branding (configure)
- Tax Configuration (manage)
- Service Charges (configure)
- Email Templates (manage)
- System Preferences (configure)

**Provides Data To:**
- Front Office (invoicing settings)
- Finance (tax calculations)
- All Modules (branding, preferences)

---

## Data Flow Patterns

### Pattern 1: Guest Check-In Flow
```
1. Front Office → Update Reservation
   - Status: 'confirmed' → 'checked-in'
   
2. Front Office → Update Room
   - Status: 'vacant-clean' → 'occupied-clean'
   
3. Front Office → Create Folio
   - Links to reservation and guest
   - Adds room charges
   
4. Housekeeping → Auto-create tasks
   - Turndown service
   - Daily maintenance
   
5. CRM → Update Guest Profile
   - Increment totalStays
   - Update last visit date
```

### Pattern 2: Procurement to Inventory Flow
```
1. Inventory → Low stock detected
   
2. Procurement → Create Requisition
   - Items below reorder level
   
3. Procurement → Approve Requisition
   - Manager approval
   
4. Procurement → Create Purchase Order
   - Send to supplier
   
5. Procurement → Receive Goods (GRN)
   - Record quantities received
   
6. Inventory → Update Stock Levels
   - Add received quantities
   
7. Finance → Match Invoice
   - Three-way matching (PO, GRN, Invoice)
   
8. Finance → Process Payment
   - Supplier payment
```

### Pattern 3: Order to Kitchen to Inventory Flow
```
1. F&B → Create Order
   - Guest places order
   
2. Kitchen → Read Order
   - Production queue
   
3. Kitchen → Create Consumption Log
   - Track ingredient usage
   
4. Inventory → Update Food Item Stock
   - Deduct consumed quantities
   
5. Folio → Add Charges
   - Order total added to guest folio
   
6. Analytics → Update Metrics
   - Revenue, popular items
```

### Pattern 4: Channel Manager Integration Flow
```
1. Channel Manager → Sync Availability
   - Push room inventory to OTAs
   
2. Channel Manager → Sync Rates
   - Push rate plans to OTAs
   
3. Channel Manager → Import Reservation
   - Pull booking from OTA
   
4. Front Office → Create Reservation
   - Convert channel reservation to PMS reservation
   
5. Front Office → Create Guest Profile
   - Extract guest details
   
6. Finance → Track Commission
   - OTA commission calculation
```

---

## Integration Points

### 1. Guest Management Integration

**Front Office ↔ CRM**
```typescript
// Front Office creates/updates guest
const newGuest: Guest = { /* ... */ }
setGuests((prev) => [...prev, newGuest])

// CRM reads guest for profile enhancement
const guestProfile: GuestProfile = {
  guestId: newGuest.id,
  // Enhanced profile data
}
setGuestProfiles((prev) => [...prev, guestProfile])
```

**Guest Invoice ↔ Payments**
```typescript
// Invoice created in Front Office
const invoice: GuestInvoice = { /* ... */ }
setGuestInvoices((prev) => [...prev, invoice])

// Payment recorded in Finance
const payment: Payment = {
  invoiceId: invoice.id,
  guestId: invoice.guestId,
  amount: invoice.grandTotal
}
setPayments((prev) => [...prev, payment])

// Update invoice payment status
setGuestInvoices((prev) =>
  prev.map(inv =>
    inv.id === invoice.id
      ? { ...inv, paymentStatus: 'paid', amountDue: 0 }
      : inv
  )
)
```

### 2. Inventory Management Integration

**Procurement → Inventory (GRN Processing)**
```typescript
// When GRN is created, update inventory
const processGRN = (grn: GoodsReceivedNote) => {
  grn.items.forEach(grnItem => {
    // Update food items
    setFoodItems((prev) =>
      prev.map(item =>
        item.id === grnItem.inventoryItemId
          ? { ...item, currentStock: item.currentStock + grnItem.receivedQuantity }
          : item
      )
    )
  })
}
```

**Kitchen → Inventory (Consumption Tracking)**
```typescript
// When consumption log is created, update inventory
const recordConsumption = (log: KitchenConsumptionLog) => {
  log.ingredients.forEach(ingredient => {
    setFoodItems((prev) =>
      prev.map(item =>
        item.id === ingredient.foodItemId
          ? { ...item, currentStock: item.currentStock - ingredient.actualQuantity }
          : item
      )
    )
  })
}
```

### 3. Room Status Integration

**Front Office → Housekeeping**
```typescript
// Check-in updates room status
const handleCheckIn = (reservation: Reservation) => {
  setReservations((prev) =>
    prev.map(r =>
      r.id === reservation.id
        ? { ...r, status: 'checked-in' as const }
        : r
    )
  )
  
  setRooms((prev) =>
    prev.map(room =>
      room.id === reservation.roomId
        ? { ...room, status: 'occupied-clean' as const }
        : room
    )
  )
}

// Check-out updates room status
const handleCheckOut = (reservation: Reservation) => {
  setReservations((prev) =>
    prev.map(r =>
      r.id === reservation.id
        ? { ...r, status: 'checked-out' as const }
        : r
    )
  )
  
  setRooms((prev) =>
    prev.map(room =>
      room.id === reservation.roomId
        ? { ...room, status: 'vacant-dirty' as const }
        : room
    )
  )
  
  // Auto-create housekeeping task
  const newTask: HousekeepingTask = {
    id: generateId(),
    roomId: reservation.roomId!,
    taskType: 'clean',
    status: 'pending',
    priority: 'normal',
    createdAt: Date.now()
  }
  setHousekeepingTasks((prev) => [...prev, newTask])
}
```

### 4. Financial Integration

**Supplier Invoice → Accounts Payable**
```typescript
// Three-way matching process
const matchInvoice = (invoice: Invoice, po: PurchaseOrder, grn: GoodsReceivedNote) => {
  const matchingResult = performThreeWayMatch(invoice, po, grn)
  
  if (matchingResult.matchStatus === 'fully-matched') {
    // Auto-approve
    setInvoices((prev) =>
      prev.map(inv =>
        inv.id === invoice.id
          ? { ...inv, status: 'approved' as const }
          : inv
      )
    )
  } else {
    // Requires manual review
    setInvoices((prev) =>
      prev.map(inv =>
        inv.id === invoice.id
          ? { ...inv, status: 'mismatch' as const, matchingResult }
          : inv
      )
    )
  }
}
```

### 5. Channel Manager Integration

**OTA Reservation → Front Office**
```typescript
// Import channel reservation
const importChannelReservation = (channelRes: ChannelReservation) => {
  // Create guest if not exists
  const existingGuest = guests.find(g => 
    g.email === channelRes.guestDetails.email
  )
  
  const guestId = existingGuest?.id || generateId()
  
  if (!existingGuest) {
    const newGuest: Guest = {
      id: guestId,
      firstName: channelRes.guestDetails.firstName,
      lastName: channelRes.guestDetails.lastName,
      email: channelRes.guestDetails.email,
      phone: channelRes.guestDetails.phone || '',
      // ...
    }
    setGuests((prev) => [...prev, newGuest])
  }
  
  // Create PMS reservation
  const pmsReservation: Reservation = {
    id: generateId(),
    guestId,
    // Map channel reservation to PMS format
    checkInDate: channelRes.checkInDate,
    checkOutDate: channelRes.checkOutDate,
    adults: channelRes.adults,
    children: channelRes.children,
    source: channelRes.channel,
    totalAmount: channelRes.totalAmount,
    // ...
  }
  setReservations((prev) => [...prev, pmsReservation])
  
  // Update channel reservation
  setChannelReservations((prev) =>
    prev.map(cr =>
      cr.id === channelRes.id
        ? { ...cr, syncedToPMS: true, pmsReservationId: pmsReservation.id }
        : cr
    )
  )
}
```

---

## Best Practices

### 1. Always Use Functional Updates
```typescript
// ✅ CORRECT - Uses functional update
setGuests((currentGuests) => [...currentGuests, newGuest])

// ❌ WRONG - References stale state
setGuests([...guests, newGuest])
```

### 2. Validate Cross-Module Data
```typescript
// Before creating a reservation, validate room exists
const room = rooms.find(r => r.id === roomId)
if (!room) {
  toast.error('Room not found')
  return
}

// Validate guest exists
const guest = guests.find(g => g.id === guestId)
if (!guest) {
  toast.error('Guest not found')
  return
}
```

### 3. Maintain Data Consistency
```typescript
// When deleting a guest, check for active reservations
const hasActiveReservations = reservations.some(
  r => r.guestId === guestId && r.status !== 'cancelled'
)

if (hasActiveReservations) {
  toast.error('Cannot delete guest with active reservations')
  return
}
```

### 4. Use Toast Notifications for Cross-Module Actions
```typescript
// Notify user of cascade effects
const handleCheckOut = () => {
  // ... check-out logic
  toast.success('Check-out completed. Housekeeping task created.')
}
```

### 5. Log Important Cross-Module Actions
```typescript
// Log activity for audit trail
const logActivity = (action: string, details: string) => {
  const newLog: ActivityLog = {
    id: generateId(),
    userId: currentUser.id,
    username: currentUser.username,
    userRole: currentUser.role,
    activityType: action as any,
    action,
    details,
    timestamp: Date.now()
  }
  setActivityLogs((prev) => [newLog, ...prev])
}

// Usage
logActivity('po-approved', `Purchase Order ${po.poNumber} approved`)
```

---

## Troubleshooting

### Issue: Data Not Syncing Between Modules
**Cause:** Using different useKV keys  
**Solution:** Ensure all modules use the same exact key string:
```typescript
// Both modules must use: 'w3-hotel-guests'
const [guests, setGuests] = useKV<Guest[]>('w3-hotel-guests', [])
```

### Issue: Stale Data After Update
**Cause:** Not using functional updates  
**Solution:** Always use functional form:
```typescript
setGuests((currentGuests) => currentGuests.map(...))
```

### Issue: Circular Dependencies
**Cause:** Modules trying to update each other  
**Solution:** Use one-way data flow. Parent component manages shared state:
```typescript
// App.tsx manages state, passes down as props
<FrontOffice
  guests={guests}
  setGuests={setGuests}
  rooms={rooms}
  setRooms={setRooms}
/>
```

### Issue: Lost Data on Page Refresh
**Cause:** Using useState instead of useKV  
**Solution:** Replace useState with useKV for persistent data:
```typescript
// Change from:
const [guests, setGuests] = useState<Guest[]>([])

// To:
const [guests, setGuests] = useKV<Guest[]>('w3-hotel-guests', [])
```

### Issue: Performance Degradation
**Cause:** Too many records in arrays  
**Solution:** Implement pagination and filtering:
```typescript
// Use pagination hook
const {
  currentPage,
  pageSize,
  paginatedData,
  totalPages,
  goToPage
} = usePagination(allGuests, 50)
```

---

## Integration Checklist

When adding a new feature that touches multiple modules:

- [ ] Identify all affected modules
- [ ] Document data flow between modules
- [ ] Use functional updates for all state changes
- [ ] Add validation for cross-module references
- [ ] Test cascade effects (e.g., deleting referenced data)
- [ ] Add toast notifications for user feedback
- [ ] Log important actions to activity log
- [ ] Update this documentation
- [ ] Test with sample data
- [ ] Test with empty state
- [ ] Test with large datasets
- [ ] Verify data persistence after refresh

---

## Conclusion

Cross-module integration is the backbone of W3 Hotel PMS. By following these patterns and best practices, you ensure:

✅ Data consistency across all modules  
✅ Reliable cross-module communication  
✅ Proper cascade effects  
✅ Audit trail compliance  
✅ User-friendly notifications  
✅ Scalable architecture

For specific integration questions, refer to the module-specific documentation or the types.ts file for data structure definitions.

---

**Last Updated:** ${new Date().toISOString()}  
**Maintained By:** W3 Media Development Team  
**Contact:** support@w3media.lk
