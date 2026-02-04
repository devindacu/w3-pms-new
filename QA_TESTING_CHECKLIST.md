# W3 Hotel PMS - Manual QA Testing Checklist
**Version:** 1.0  
**Date:** February 4, 2026  
**Purpose:** Comprehensive manual testing guide for critical workflows

---

## Pre-Testing Setup

### Environment Verification
- [ ] Database connection verified (DATABASE_URL configured)
- [ ] Server running on port 5000
- [ ] Frontend accessible at http://localhost:5000
- [ ] No console errors on initial load
- [ ] User authentication working (if applicable)

### Test Data Preparation
- [ ] Sample guests created
- [ ] Sample rooms configured
- [ ] Sample inventory items loaded
- [ ] Sample suppliers added
- [ ] Test date range: Use current date ± 7 days

---

## Critical Workflow Testing

### 1. Front Office - Check-In/Check-Out Workflow ⭐⭐⭐

#### Test Case 1.1: Guest Check-In
**Priority:** Critical  
**Pre-requisites:** 
- At least one reservation in "confirmed" status
- Room available and in "vacant-clean" status

**Steps:**
1. Navigate to Front Office module
2. Click "Check In" button for a confirmed reservation
3. Verify guest details displayed correctly
4. Confirm room assignment
5. Click "Complete Check-In"

**Expected Results:**
- [ ] Reservation status changes to "checked-in"
- [ ] Room status updates to "occupied-clean"
- [ ] Folio automatically created with room charges
- [ ] Success notification displayed
- [ ] Guest appears in "Current Guests" list

**Actual Results:**
- Status: ⬜ Pass ⬜ Fail ⬜ Blocked
- Notes: _______________________________________________

---

#### Test Case 1.2: Guest Check-Out
**Priority:** Critical  
**Pre-requisites:**
- At least one guest currently checked in
- Guest has charges on folio

**Steps:**
1. Navigate to Front Office module
2. Click "Check Out" for checked-in guest
3. Review folio and charges
4. Verify balance calculation
5. Record payment if balance > 0
6. Click "Complete Check-Out"

**Expected Results:**
- [ ] Balance calculation accurate (charges - payments)
- [ ] Payment recorded successfully
- [ ] Reservation status changes to "checked-out"
- [ ] Room status updates to "vacant-dirty"
- [ ] Final invoice generated
- [ ] Success notification displayed

**Actual Results:**
- Status: ⬜ Pass ⬜ Fail ⬜ Blocked
- Notes: _______________________________________________

---

### 2. Finance - Invoice & Payment Processing ⭐⭐⭐

#### Test Case 2.1: Create Invoice
**Priority:** Critical  
**Pre-requisites:**
- Guest with active folio
- Room charges posted

**Steps:**
1. Navigate to Finance → Invoice Management
2. Click "Create Invoice"
3. Select invoice type (e.g., "room-only")
4. Add line items (room charges, services)
5. Apply tax (verify calculation)
6. Save invoice

**Expected Results:**
- [ ] Invoice created with unique number
- [ ] Line items display correctly
- [ ] Tax calculated accurately
- [ ] Subtotal + tax = total
- [ ] Status set to "draft" or "approved"
- [ ] Invoice appears in list

**Actual Results:**
- Status: ⬜ Pass ⬜ Fail ⬜ Blocked
- Invoice Number: _______________
- Total Amount: _______________
- Notes: _______________________________________________

---

#### Test Case 2.2: Record Payment
**Priority:** Critical  
**Pre-requisites:**
- Invoice with balance > 0

**Steps:**
1. Navigate to Finance → Invoices
2. Select invoice with outstanding balance
3. Click "Record Payment"
4. Enter payment amount (full or partial)
5. Select payment method (cash/card/transfer)
6. Add payment reference
7. Submit payment

**Expected Results:**
- [ ] Payment recorded with timestamp
- [ ] Balance updated correctly (original - payment)
- [ ] Payment appears in payment history
- [ ] If full payment: invoice status → "paid"
- [ ] If partial: invoice status → "partially-paid"
- [ ] Success notification displayed

**Actual Results:**
- Status: ⬜ Pass ⬜ Fail ⬜ Blocked
- Original Balance: _______________
- Payment Amount: _______________
- New Balance: _______________
- Notes: _______________________________________________

---

### 3. Procurement - Three-Way Matching ⭐⭐⭐

#### Test Case 3.1: Purchase Order Creation
**Priority:** High  
**Pre-requisites:**
- Supplier configured
- Inventory items exist

**Steps:**
1. Navigate to Procurement module
2. Click "Create Purchase Order"
3. Select supplier
4. Add line items (item, quantity, unit price)
5. Review totals
6. Submit PO

**Expected Results:**
- [ ] PO created with unique number
- [ ] Status set to "draft" or "approved"
- [ ] Line items total calculated correctly
- [ ] Supplier details attached
- [ ] Expected delivery date set
- [ ] PO appears in list

**Actual Results:**
- Status: ⬜ Pass ⬜ Fail ⬜ Blocked
- PO Number: _______________
- Total Amount: _______________
- Notes: _______________________________________________

---

#### Test Case 3.2: Goods Receipt (GRN)
**Priority:** High  
**Pre-requisites:**
- Approved purchase order

**Steps:**
1. Navigate to Procurement → GRN
2. Click "Create GRN"
3. Select purchase order
4. Enter received quantities
5. Perform quality check (pass/fail)
6. Submit GRN

**Expected Results:**
- [ ] GRN created with reference to PO
- [ ] Received quantities recorded
- [ ] Quality check status saved
- [ ] If all received: PO status → "received"
- [ ] Inventory updated (stock increased)
- [ ] GRN appears in list

**Actual Results:**
- Status: ⬜ Pass ⬜ Fail ⬜ Blocked
- GRN Number: _______________
- Items Received: _______________
- Notes: _______________________________________________

---

#### Test Case 3.3: Invoice Matching
**Priority:** High  
**Pre-requisites:**
- PO exists
- GRN completed
- Supplier invoice received

**Steps:**
1. Navigate to Finance → Three-Way Matching
2. Select PO and GRN
3. Enter supplier invoice details
4. Compare quantities and prices
5. Review variances (if any)
6. Approve or reject match

**Expected Results:**
- [ ] System compares PO vs GRN vs Invoice
- [ ] Variances highlighted (quantity/price)
- [ ] If match within tolerance: auto-approve
- [ ] If variance: require manual approval
- [ ] Matched invoice status updated
- [ ] Payment can proceed

**Actual Results:**
- Status: ⬜ Pass ⬜ Fail ⬜ Blocked
- Variance Detected: ⬜ Yes ⬜ No
- Variance Type: _______________
- Notes: _______________________________________________

---

### 4. Housekeeping - Room Status Management ⭐⭐

#### Test Case 4.1: Create Housekeeping Task
**Priority:** Medium  
**Pre-requisites:**
- Rooms in various status states

**Steps:**
1. Navigate to Housekeeping module
2. Click "Create Task"
3. Select room
4. Select task type (cleaning, maintenance)
5. Assign to staff member
6. Set priority
7. Submit task

**Expected Results:**
- [ ] Task created with unique ID
- [ ] Task appears in task list
- [ ] Assigned staff receives notification (if enabled)
- [ ] Task status set to "pending"
- [ ] Room status visible

**Actual Results:**
- Status: ⬜ Pass ⬜ Fail ⬜ Blocked
- Task ID: _______________
- Notes: _______________________________________________

---

#### Test Case 4.2: Update Room Status
**Priority:** Medium  
**Pre-requisites:**
- Room in "vacant-dirty" status
- Housekeeping task assigned

**Steps:**
1. Navigate to Housekeeping
2. Select task
3. Update task status to "in-progress"
4. Complete task
5. Update room status to "vacant-clean"
6. Submit

**Expected Results:**
- [ ] Task status updates to "completed"
- [ ] Room status updates to "vacant-clean"
- [ ] Room becomes available for assignment
- [ ] Task completion timestamp recorded
- [ ] Success notification displayed

**Actual Results:**
- Status: ⬜ Pass ⬜ Fail ⬜ Blocked
- Notes: _______________________________________________

---

### 5. Kitchen Operations - Order & Recipe Management ⭐⭐

#### Test Case 5.1: Create Kitchen Order
**Priority:** Medium  
**Pre-requisites:**
- Menu items configured
- Recipes with ingredients

**Steps:**
1. Navigate to F&B POS or Kitchen Management
2. Create new order
3. Add menu items
4. Specify quantities
5. Submit to kitchen

**Expected Results:**
- [ ] Order created with order number
- [ ] Order appears in Kitchen Display System
- [ ] Ingredients deducted from inventory (if tracked)
- [ ] Order status set to "pending"
- [ ] Kitchen receives notification

**Actual Results:**
- Status: ⬜ Pass ⬜ Fail ⬜ Blocked
- Order Number: _______________
- Notes: _______________________________________________

---

#### Test Case 5.2: Recipe Costing
**Priority:** Medium  
**Pre-requisites:**
- Recipe with ingredients
- Ingredient costs configured

**Steps:**
1. Navigate to Kitchen → Recipe Management
2. Select or create recipe
3. Add ingredients with quantities
4. System calculates cost
5. Set selling price
6. Save recipe

**Expected Results:**
- [ ] Total cost calculated automatically
- [ ] Cost per serving displayed
- [ ] Profit margin calculated
- [ ] Recipe saved successfully
- [ ] Can be used in menu items

**Actual Results:**
- Status: ⬜ Pass ⬜ Fail ⬜ Blocked
- Total Cost: _______________
- Selling Price: _______________
- Margin: _______________
- Notes: _______________________________________________

---

### 6. Channel Manager - OTA Integration ⭐⭐

#### Test Case 6.1: Rate Update
**Priority:** Medium  
**Pre-requisites:**
- OTA connection configured (Booking.com/Airbnb)
- Rate plan created

**Steps:**
1. Navigate to Channel Manager
2. Select channel (e.g., Booking.com)
3. Update room rates
4. Set date range
5. Push to channel

**Expected Results:**
- [ ] Rate update successful
- [ ] Confirmation received from channel
- [ ] Rates reflected in channel manager
- [ ] No error messages
- [ ] Sync status shows "synced"

**Actual Results:**
- Status: ⬜ Pass ⬜ Fail ⬜ Blocked
- Notes: _______________________________________________

---

#### Test Case 6.2: Inventory Sync
**Priority:** Medium  
**Pre-requisites:**
- Rooms configured in channel
- Availability set

**Steps:**
1. Navigate to Channel Manager
2. Update room availability
3. Close/open rooms for specific dates
4. Push inventory to channel
5. Verify sync status

**Expected Results:**
- [ ] Inventory update successful
- [ ] Channel shows updated availability
- [ ] Closed dates blocked correctly
- [ ] Sync status "synced"
- [ ] No conflicts detected

**Actual Results:**
- Status: ⬜ Pass ⬜ Fail ⬜ Blocked
- Notes: _______________________________________________

---

### 7. CRM - Guest Profile & Feedback ⭐

#### Test Case 7.1: Guest Profile Management
**Priority:** Low  
**Pre-requisites:**
- Guest records exist

**Steps:**
1. Navigate to CRM module
2. Click "Create Guest Profile"
3. Enter guest details (name, email, phone)
4. Add preferences (room type, special requests)
5. Save profile

**Expected Results:**
- [ ] Profile created successfully
- [ ] All fields saved correctly
- [ ] Profile searchable
- [ ] Profile linked to reservations
- [ ] Edit/delete options available

**Actual Results:**
- Status: ⬜ Pass ⬜ Fail ⬜ Blocked
- Notes: _______________________________________________

---

#### Test Case 7.2: Feedback Recording
**Priority:** Low  
**Pre-requisites:**
- Guest profile exists

**Steps:**
1. Navigate to CRM → Feedback
2. Click "Add Feedback"
3. Select guest
4. Enter rating (1-5 stars)
5. Add comments
6. Submit feedback

**Expected Results:**
- [ ] Feedback recorded with timestamp
- [ ] Rating saved
- [ ] Comments visible in guest profile
- [ ] Feedback appears in list
- [ ] Can filter by rating

**Actual Results:**
- Status: ⬜ Pass ⬜ Fail ⬜ Blocked
- Notes: _______________________________________________

---

### 8. Inventory - Stock Management ⭐

#### Test Case 8.1: Stock Movement
**Priority:** Medium  
**Pre-requisites:**
- Inventory items configured
- Stock levels set

**Steps:**
1. Navigate to Inventory Management
2. Select item
3. Record stock movement (in/out)
4. Enter quantity and reason
5. Submit

**Expected Results:**
- [ ] Stock level updated correctly
- [ ] Movement recorded in history
- [ ] If below reorder level: alert shown
- [ ] Movement type recorded (purchase/usage/adjustment)
- [ ] Timestamp saved

**Actual Results:**
- Status: ⬜ Pass ⬜ Fail ⬜ Blocked
- Previous Stock: _______________
- Movement: _______________
- New Stock: _______________
- Notes: _______________________________________________

---

### 9. Reports & Analytics ⭐

#### Test Case 9.1: Revenue Report
**Priority:** Low  
**Pre-requisites:**
- Transactions recorded (invoices, payments)

**Steps:**
1. Navigate to Reports module
2. Select "Revenue Report"
3. Choose date range
4. Select department (optional)
5. Generate report

**Expected Results:**
- [ ] Report generates without errors
- [ ] Data displayed accurately
- [ ] Totals calculated correctly
- [ ] Can export to PDF/Excel
- [ ] Charts/graphs render properly

**Actual Results:**
- Status: ⬜ Pass ⬜ Fail ⬜ Blocked
- Total Revenue: _______________
- Notes: _______________________________________________

---

### 10. Night Audit ⭐⭐

#### Test Case 10.1: End of Day Process
**Priority:** High  
**Pre-requisites:**
- Daily transactions recorded
- Date changeover ready

**Steps:**
1. Navigate to Night Audit
2. Review daily transactions
3. Post room charges to folios
4. Verify all charges posted
5. Run end-of-day reports
6. Execute night audit

**Expected Results:**
- [ ] All room charges posted automatically
- [ ] No-show reservations updated
- [ ] System date rolls to next day
- [ ] Audit log created
- [ ] Reports generated successfully
- [ ] No errors during process

**Actual Results:**
- Status: ⬜ Pass ⬜ Fail ⬜ Blocked
- Date Before: _______________
- Date After: _______________
- Notes: _______________________________________________

---

## Edge Cases & Error Handling

### Test Case E.1: Duplicate Payment Prevention
**Steps:**
1. Record payment for invoice
2. Attempt to record same payment again (same amount, reference)
3. Verify system behavior

**Expected:** System prevents duplicate or warns user  
**Result:** ⬜ Pass ⬜ Fail

---

### Test Case E.2: Negative Balance Handling
**Steps:**
1. Create invoice with charges
2. Record payment > invoice total
3. Verify balance calculation

**Expected:** System handles overpayment gracefully (credit balance shown)  
**Result:** ⬜ Pass ⬜ Fail

---

### Test Case E.3: Room Double-Booking Prevention
**Steps:**
1. Create reservation for room
2. Attempt to book same room for overlapping dates
3. Verify system behavior

**Expected:** System prevents double booking or shows conflict warning  
**Result:** ⬜ Pass ⬜ Fail

---

### Test Case E.4: Network Disconnection During Sync
**Steps:**
1. Initiate data sync operation
2. Disconnect network during sync
3. Reconnect network
4. Verify data integrity

**Expected:** System detects conflict and allows manual resolution  
**Result:** ⬜ Pass ⬜ Fail

---

### Test Case E.5: Invalid Data Input
**Steps:**
1. Attempt to create invoice with negative amount
2. Attempt to create reservation with check-out before check-in
3. Attempt to record payment with invalid card number
4. Verify validation

**Expected:** System validates input and shows clear error messages  
**Result:** ⬜ Pass ⬜ Fail

---

## Performance Testing

### Test Case P.1: Large Data Load
**Steps:**
1. Load dashboard with 100+ reservations
2. Load report with 1000+ transactions
3. Measure load time

**Expected:** Pages load within 3 seconds  
**Result:** ⬜ Pass ⬜ Fail  
**Load Time:** _______________

---

### Test Case P.2: Concurrent Users
**Steps:**
1. Simulate 5+ users accessing system simultaneously
2. Perform different operations
3. Verify no conflicts or data corruption

**Expected:** All operations complete successfully  
**Result:** ⬜ Pass ⬜ Fail

---

## Browser Compatibility

- [ ] Chrome (latest): ⬜ Pass ⬜ Fail
- [ ] Firefox (latest): ⬜ Pass ⬜ Fail
- [ ] Safari (latest): ⬜ Pass ⬜ Fail
- [ ] Edge (latest): ⬜ Pass ⬜ Fail

---

## Mobile Responsiveness

- [ ] Smartphone (portrait): ⬜ Pass ⬜ Fail
- [ ] Smartphone (landscape): ⬜ Pass ⬜ Fail
- [ ] Tablet (portrait): ⬜ Pass ⬜ Fail
- [ ] Tablet (landscape): ⬜ Pass ⬜ Fail

---

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast sufficient
- [ ] Focus indicators visible
- [ ] Form labels present

---

## QA Summary

**Test Execution Date:** _______________  
**Tester Name:** _______________  
**Total Test Cases:** 30+  
**Passed:** _______________  
**Failed:** _______________  
**Blocked:** _______________  
**Pass Rate:** _______________%

### Critical Issues Found
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Recommendations
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Sign-Off

**QA Lead:** _______________ Date: _______________  
**Product Owner:** _______________ Date: _______________  
**Ready for Production:** ⬜ Yes ⬜ No (explain why)

---

**Next Steps:**
- [ ] Fix critical bugs identified
- [ ] Re-test failed cases
- [ ] Document workarounds (if any)
- [ ] Schedule deployment
