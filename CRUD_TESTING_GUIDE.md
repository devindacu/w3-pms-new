# CRUD Testing Guide - W3 Hotel PMS
## Practical Step-by-Step Testing Instructions

This guide provides detailed instructions for testing CRUD operations across all modules.

---

## Quick Start: Load Sample Data

1. **Navigate to Dashboard**
2. **Click "Load Sample Data" button**
3. **Verify** toast notification confirms data loaded
4. **Result:** All modules now have test data

---

## Module-by-Module Testing Instructions

### 1. FRONT OFFICE

#### Test Guest CRUD
```
CREATE:
1. Navigate to "Front Office" → "Guest Relations"
2. Click "+ Add Guest Profile"
3. Fill in required fields:
   - First Name: "John"
   - Last Name: "Doe"
   - Email: "john.doe@example.com"
   - Phone: "+94771234567"
   - Nationality: Select from dropdown
4. Click "Save"
5. ✅ Verify: Toast shows "Guest profile created"

READ:
1. View guest list
2. Click on "John Doe"
3. ✅ Verify: Profile details dialog opens
4. ✅ Verify: All fields display correctly

UPDATE:
1. Click "Edit" on John Doe's profile
2. Change phone to "+94777654321"
3. Add VIP preference
4. Click "Save Changes"
5. ✅ Verify: Changes saved, toast notification appears

DELETE:
1. Click delete icon on John Doe
2. Confirm deletion
3. ✅ Verify: Guest removed from list
```

#### Test Reservation CRUD
```
CREATE:
1. Click "+ New Reservation"
2. Select guest
3. Choose dates (Check-in/Check-out)
4. Select room type
5. Enter rate
6. Click "Create Reservation"
7. ✅ Verify: Reservation appears in calendar

READ:
1. Click on reservation in calendar
2. ✅ Verify: Details dialog shows all info

UPDATE:
1. Click "Edit" on reservation
2. Extend checkout date by 1 day
3. Save changes
4. ✅ Verify: Calendar updates

DELETE:
1. Click "Cancel" on reservation
2. Confirm cancellation
3. ✅ Verify: Reservation status changes or removes
```

---

### 2. EXTRA SERVICES

#### Test Service Category CRUD
```
CREATE:
1. Go to "Extra Services"
2. Click "+ Add Category"
3. Enter: "Spa Services"
4. Add description
5. Save
6. ✅ Verify: Category appears in list

READ/UPDATE/DELETE:
- Similar pattern to guest testing
```

#### Test Service CRUD
```
CREATE:
1. Click "+ Add Service"
2. Fill in:
   - Name: "Massage - 60 min"
   - Category: "Spa Services"
   - Price: 5000 LKR
   - Tax: 10%
3. Save
4. ✅ Verify: Service in catalog

ASSIGN TO FOLIO:
1. Go to folio
2. Click "Add Extra Service"
3. Select "Massage - 60 min"
4. Enter quantity: 1
5. Save
6. ✅ Verify: Charge added to folio
```

---

### 3. HOUSEKEEPING

#### Test Task CRUD
```
CREATE:
1. Navigate to "Housekeeping"
2. Click "+ New Task"
3. Select room
4. Task type: "Clean Room"
5. Assign to housekeeper
6. Save
7. ✅ Verify: Task in pending list

UPDATE:
1. Click on task
2. Change status to "In Progress"
3. Save
4. ✅ Verify: Task moves to in-progress section

COMPLETE:
1. Change status to "Completed"
2. ✅ Verify: Room status updates to "Clean"
```

---

### 4. F&B / POS

#### Test Menu Item CRUD
```
CREATE:
1. Go to "F&B / POS"
2. Click "+ Add Menu Item"
3. Fill in:
   - Name: "Club Sandwich"
   - Category: "Lunch"
   - Price: 1200 LKR
   - Available: Yes
4. Save
5. ✅ Verify: Item in menu

UPDATE:
1. Edit "Club Sandwich"
2. Change price to 1350 LKR
3. Save
4. ✅ Verify: Price updated
```

#### Test Order CRUD
```
CREATE:
1. Click "New Order"
2. Select table/room
3. Add items:
   - Club Sandwich x2
   - Soft Drink x2
4. Enter guest name
5. Submit order
6. ✅ Verify: Order in active orders

UPDATE:
1. Click on order
2. Add item: French Fries
3. Update
4. ✅ Verify: Total recalculated

COMPLETE:
1. Change status to "Served"
2. Click "Post to Folio" (if room service)
3. ✅ Verify: Charge appears on guest folio
```

---

### 5. INVENTORY

#### Test Food Item CRUD
```
CREATE:
1. Navigate to "Inventory"
2. Go to "Food Items" tab
3. Click "+ Add Food Item"
4. Fill in:
   - Name: "Chicken Breast"
   - Category: "Meat"
   - Unit: "KG"
   - Current Stock: 50
   - Reorder Level: 20
   - Supplier: Select
5. Save
6. ✅ Verify: Item in inventory

UPDATE STOCK:
1. Click on "Chicken Breast"
2. Adjust stock to 30 KG
3. Save
4. ✅ Verify: Stock level updated

CHECK ALERTS:
1. Reduce stock below 20 KG
2. ✅ Verify: Low stock alert appears
```

---

### 6. PROCUREMENT

#### Test Requisition → PO → GRN Flow
```
CREATE REQUISITION:
1. Go to "Procurement"
2. Click "+ New Requisition"
3. Department: "Kitchen"
4. Add items:
   - Chicken Breast: 100 KG
   - Rice: 50 KG
5. Select supplier or "Any Supplier"
6. Submit for approval
7. ✅ Verify: Requisition status "Pending Approval"

APPROVE & CREATE PO:
1. Click on requisition
2. Click "Approve"
3. Click "Create PO"
4. Review PO preview
5. Generate PDF
6. ✅ Verify: PO created with number

CREATE GRN:
1. When goods arrive, click "+ New GRN"
2. Select PO
3. Enter received quantities:
   - Chicken: 100 KG (match)
   - Rice: 48 KG (short supply)
4. Note variance
5. Save GRN
6. ✅ Verify: Inventory auto-updated

THREE-WAY MATCHING:
1. Supplier sends invoice
2. Go to "Invoices" tab
3. Click "+ New Invoice"
4. Enter invoice details
5. Click "Match with PO/GRN"
6. ✅ Verify: System flags 2 KG rice variance
```

---

### 7. KITCHEN OPERATIONS

#### Test Recipe CRUD
```
CREATE:
1. Navigate to "Kitchen Operations"
2. Click "+ New Recipe"
3. Fill in:
   - Name: "Chicken Curry"
   - Servings: 4
4. Add ingredients:
   - Chicken Breast: 500g
   - Curry Powder: 50g
   - Coconut Milk: 200ml
5. Save
6. ✅ Verify: Cost per portion calculated

CONSUMPTION:
1. Log production: 10 servings
2. ✅ Verify: Inventory auto-deducted
```

---

### 8. FINANCE

#### Test Journal Entry CRUD
```
CREATE:
1. Go to "Finance"
2. Click "+ New Journal Entry"
3. Add lines:
   - Debit: Food Expense 10,000 LKR
   - Credit: Accounts Payable 10,000 LKR
4. Add narration
5. Save
6. ✅ Verify: Entry balanced and saved

POST TO GL:
1. Click "Post"
2. ✅ Verify: Cannot edit after posting
```

#### Test Payment CRUD
```
CREATE:
1. Click "+ Record Payment"
2. Select invoice
3. Amount: 10,000 LKR
4. Method: "Bank Transfer"
5. Save
6. ✅ Verify: Invoice status updates to "Paid"

REFUND:
1. Click "Refund" on payment
2. Enter refund amount
3. Confirm
4. ✅ Verify: Credit note generated
```

---

### 9. HR MANAGEMENT

#### Test Employee CRUD
```
CREATE:
1. Navigate to "HR & Staff"
2. Click "+ Add Employee"
3. Fill comprehensive form:
   - Personal details
   - Contact info
   - Emergency contact
   - Department
   - Salary
4. Save
5. ✅ Verify: Employee in directory

ATTENDANCE:
1. Go to "Attendance" tab
2. Click "+ Mark Attendance"
3. Select employee, date, times
4. Save
5. ✅ Verify: Attendance recorded

LEAVE REQUEST:
1. Click "+ Leave Request"
2. Select employee, dates, type
3. Submit
4. Approve/Reject
5. ✅ Verify: Leave balance updated
```

---

### 10. ROOM & REVENUE MANAGEMENT

#### Test Rate Plan CRUD
```
CREATE SEASON:
1. Navigate to "Room & Revenue"
2. Go to "Seasons" tab
3. Click "+ Add Season"
4. Name: "Peak Season"
5. Dates: Dec 1 - Jan 15
6. Rate multiplier: 1.5x
7. Save
8. ✅ Verify: Season in calendar

CREATE RATE PLAN:
1. Click "+ New Rate Plan"
2. Name: "Best Available Rate"
3. Type: "Standard"
4. Base rate: 15,000 LKR
5. Meal plan: "Bed & Breakfast"
6. Save
7. ✅ Verify: Plan in list

BULK RATE UPDATE:
1. Go to "Rate Calendar"
2. Select date range
3. Click "Bulk Update"
4. Select room types
5. New rate: 18,000 LKR
6. Apply
7. ✅ Verify: Calendar updates
```

---

### 11. CHANNEL MANAGER

#### Test OTA Connection
```
CREATE:
1. Go to "Channel Manager"
2. Click "+ Add Connection"
3. Select channel: "Booking.com"
4. Enter credentials
5. Map room types
6. Save
7. ✅ Verify: Connection status "Active"

SYNC INVENTORY:
1. Click "Sync Inventory"
2. Select dates
3. Push availability
4. ✅ Verify: Sync log shows success
```

---

### 12. INVOICE CENTER

#### Test Guest Invoice
```
VIEW:
1. Navigate to "Invoice Center"
2. Click on any invoice
3. ✅ Verify: A4 preview loads with branding

EDIT:
1. Click "Edit"
2. Add line item
3. Adjust tax
4. Save
5. ✅ Verify: Grand total recalculates

DOWNLOAD/SHARE:
1. Click "Download PDF"
2. ✅ Verify: PDF downloads
3. Click "Email"
4. Enter email
5. ✅ Verify: Email sent confirmation

BATCH OPERATIONS:
1. Select multiple invoices
2. Click "Batch Print"
3. ✅ Verify: All PDFs generate
```

---

### 13. SETTINGS

#### Test Branding
```
UPDATE:
1. Navigate to "Settings"
2. Go to "Branding" tab
3. Upload logo
4. Change primary color
5. Enter hotel details
6. Save
7. ✅ Verify: Changes reflect globally

TEST:
1. Generate invoice
2. ✅ Verify: New branding appears
```

#### Test Email Template
```
CREATE:
1. Go to "Email Templates" tab
2. Click "+ New Template"
3. Name: "Booking Confirmation"
4. Edit HTML
5. Add variables: {{guestName}}, {{roomType}}
6. Save
7. ✅ Verify: Template in library

TEST:
1. Click "Preview"
2. ✅ Verify: Variables populated
3. Send test email
4. ✅ Verify: Email received
```

---

## Integration Testing

### Test Cross-Module Flow

#### Complete Guest Journey
```
1. CREATE guest profile (CRM)
2. CREATE reservation (Front Office)
3. CHECK-IN guest (Front Office)
   ✅ Verify: Folio auto-created
4. ADD room service order (F&B)
   ✅ Verify: Charges on folio
5. ASSIGN extra services (Extra Services)
   ✅ Verify: Charges on folio
6. GENERATE invoice (Invoice Center)
   ✅ Verify: All charges included
7. RECORD payment (Finance)
   ✅ Verify: Invoice marked paid
8. CHECK-OUT guest
   ✅ Verify: Room status updates
```

#### Procurement to Kitchen Flow
```
1. CREATE requisition for ingredients
2. APPROVE and generate PO
3. RECEIVE goods (GRN)
   ✅ Verify: Inventory updated
4. USE in recipe (Kitchen)
   ✅ Verify: Stock deducted
5. SELL menu item (F&B)
   ✅ Verify: Revenue recorded
```

---

## Performance Testing

### Large Dataset Tests
```
1. Create 100+ guests
2. Create 50+ reservations
3. Generate 200+ invoices
4. Add 500+ inventory items

Verify:
- List views load in < 2 seconds
- Search functions work
- Filters apply correctly
- Exports complete
```

---

## Error Handling Tests

### Validation Tests
```
1. Try creating guest without required fields
   ✅ Verify: Error messages appear

2. Try double-booking a room
   ✅ Verify: Conflict prevented

3. Try negative inventory
   ✅ Verify: Validation error

4. Try unbalanced journal entry
   ✅ Verify: Cannot save

5. Try deleting in-use item
   ✅ Verify: Dependency warning
```

---

## Checklist for Complete Testing

### Per Module Checklist
- [ ] Create new record via dialog
- [ ] View record in list
- [ ] Open detail view
- [ ] Edit existing record
- [ ] Delete record (with confirmation)
- [ ] Verify data persistence
- [ ] Check related data updates
- [ ] Test validation rules
- [ ] Verify error messages
- [ ] Check mobile responsiveness

### Global Checks
- [ ] All currencies show LKR
- [ ] Notifications appear on actions
- [ ] Audit logs capture changes
- [ ] Exports generate correctly
- [ ] Prints format properly
- [ ] Search works across modules
- [ ] Filters apply correctly
- [ ] Permissions respected

---

## Automated Testing Script

```typescript
// Example test script structure
async function testModuleCRUD(moduleName: string) {
  console.log(`Testing ${moduleName}...`);
  
  // CREATE
  const created = await createTestRecord(moduleName);
  assert(created.id, 'Create failed');
  
  // READ
  const record = await getRecord(moduleName, created.id);
  assert(record, 'Read failed');
  
  // UPDATE
  const updated = await updateRecord(moduleName, created.id, { name: 'Updated' });
  assert(updated.name === 'Updated', 'Update failed');
  
  // DELETE
  const deleted = await deleteRecord(moduleName, created.id);
  assert(deleted, 'Delete failed');
  
  console.log(`✅ ${moduleName} CRUD tests passed`);
}

// Run for all modules
const modules = [
  'guests', 'reservations', 'rooms', 'housekeeping',
  'menu', 'orders', 'inventory', 'suppliers',
  // ... all 21 modules
];

modules.forEach(testModuleCRUD);
```

---

## Conclusion

This testing guide covers comprehensive CRUD operations across all 21 modules. Follow the step-by-step instructions to verify each operation works correctly.

**Expected Outcome:** All operations should complete successfully with appropriate feedback to the user.

**Report Issues:** Document any failures with screenshots and steps to reproduce.

---

**Guide Version:** 1.0  
**Last Updated:** ${new Date().toISOString()}  
