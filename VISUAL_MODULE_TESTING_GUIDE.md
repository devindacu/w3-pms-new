# W3 Hotel PMS - Visual Module Testing Guide

## Test Execution Instructions

This guide provides step-by-step instructions for manually testing each module through the UI.

---

## Pre-Test Setup

1. **Open Application:** Navigate to the W3 Hotel PMS dashboard
2. **Check Login:** Ensure you're logged in (user shown in sidebar footer)
3. **Clear Console:** Open browser DevTools (F12) and clear console
4. **Start Fresh:** Refresh the page to start from Dashboard

---

## Test Execution Flow

### Test 1: Dashboard Module
**Location:** Overview → Dashboard

**Steps:**
1. Click "Dashboard" in sidebar
2. Verify page loads instantly (no loading skeleton)

**Expected Results:**
- ✅ 4 statistics cards visible (Rooms, Guests, Revenue, Occupancy)
- ✅ "Recent Activity" section with 5 sample entries
- ✅ "Quick Actions" panel with 4 action buttons
- ✅ Percentage change indicators showing green "+X%" badges
- ✅ No console errors

**Visual Elements to Check:**
- Card icons (BedDouble, Users, DollarSign, Calendar)
- Numbers (156, 1,247, $45,231, 89%)
- Grid layout (1 col mobile, 2 cols tablet, 4 cols desktop)

---

### Test 2: Front Office Module
**Location:** Operations → Front Office

**Steps:**
1. Click "Front Office" in sidebar
2. Wait for lazy load (expect ModuleLoadingSkeleton briefly)
3. Module should render with tabs/sections

**Expected Results:**
- ✅ Module loads within 1 second
- ✅ Navigation tabs or sections visible
- ✅ Guest directory or reservation list displays
- ✅ Action buttons (Add Guest, New Reservation, etc.)
- ✅ Data table with sample reservations/guests
- ✅ No console errors

**Data to Verify:**
- Sample guests from sampleGuests
- Sample reservations from sampleReservations
- Room data from sampleRooms

**Test Actions:**
- Click "Add Guest" button (should open dialog)
- Click on a guest row (should show details)
- Try search/filter if available

---

### Test 3: Housekeeping Module
**Location:** Operations → Housekeeping

**Steps:**
1. Click "Housekeeping" in sidebar
2. Wait for module load

**Expected Results:**
- ✅ Task list or room status board visible
- ✅ Room status indicators (Clean/Dirty/Inspected)
- ✅ Employee assignment options
- ✅ Task creation button
- ✅ No console errors

**Visual Elements:**
- Room cards or table
- Status badges with colors
- Staff assignment dropdowns
- Date/time filters

**Test Actions:**
- Create new task
- Assign task to employee
- Change room status

---

### Test 4: F&B / POS Module
**Location:** Operations → F&B / POS

**Steps:**
1. Click "F&B / POS" in sidebar
2. Wait for module load

**Expected Results:**
- ✅ Menu item grid or list
- ✅ Order creation interface
- ✅ Sample menu items from sampleMenuItems
- ✅ POS interface elements
- ✅ No console errors

**Visual Elements:**
- Menu categories
- Item cards with prices
- Order cart/panel
- Payment options

**Test Actions:**
- Select menu items
- Create order
- Assign to room/guest

---

### Test 5: Kitchen Module
**Location:** Operations → Kitchen

**Steps:**
1. Click "Kitchen" in sidebar
2. Wait for module load

**Expected Results:**
- ✅ Kitchen stations view
- ✅ Staff management section
- ✅ Production schedule view
- ✅ Waste tracking interface
- ✅ No console errors

**Data Verification:**
- Kitchen stations loaded from KV
- Staff assignments visible
- Production schedules displayed

**Test Actions:**
- Create kitchen station
- Assign staff
- Log waste entry

---

### Test 6: Guest Relations (CRM) Module
**Location:** Business → Guest Relations

**Steps:**
1. Click "Guest Relations" in sidebar
2. Wait for module load

**Expected Results:**
- ✅ Guest profile management interface
- ✅ Multiple tabs (Profiles, Complaints, Feedback, Campaigns, etc.)
- ✅ Guest list with profiles
- ✅ Marketing campaign section
- ✅ Loyalty program features
- ✅ No console errors

**Visual Elements:**
- Guest profile cards
- Complaint tracking table
- Feedback ratings
- Campaign cards
- Upsell offers

**Test Actions:**
- Add guest profile
- Log complaint
- Create campaign
- Record feedback

---

### Test 7: Extra Services Module
**Location:** Business → Extra Services

**Steps:**
1. Click "Extra Services" in sidebar
2. Wait for module load

**Expected Results:**
- ✅ Service category list
- ✅ Service catalog
- ✅ Add service button
- ✅ Category management
- ✅ No console errors

**Test Actions:**
- Create service category
- Add new service
- Edit service pricing

---

### Test 8: Room & Revenue Module
**Location:** Business → Room & Revenue

**Steps:**
1. Click "Room & Revenue" in sidebar
2. Wait for module load

**Expected Results:**
- ✅ Room type configuration
- ✅ Rate plan management
- ✅ Seasonal pricing calendar
- ✅ Event day configuration
- ✅ Corporate account management
- ✅ Sample data from sampleRoomTypeConfigs, sampleRatePlans
- ✅ No console errors

**Visual Elements:**
- Room type cards
- Rate plan table
- Calendar view
- Pricing inputs

**Test Actions:**
- Create rate plan
- Add season
- Configure event day
- Set up corporate account

---

### Test 9: Channel Manager Module
**Location:** Business → Channel Manager

**Steps:**
1. Click "Channel Manager" in sidebar
2. Wait for module load

**Expected Results:**
- ✅ OTA connection cards (Booking.com, Agoda, Expedia, Airbnb)
- ✅ Inventory sync dashboard
- ✅ Rate distribution interface
- ✅ Review aggregation
- ✅ Sync logs table
- ✅ No console errors

**Visual Elements:**
- Channel logos/cards
- Connection status indicators
- Sync status badges
- Performance metrics

**Test Actions:**
- Add OTA connection
- Sync inventory
- View sync logs
- Manage reviews

---

### Test 10: Inventory Module
**Location:** Management → Inventory

**Steps:**
1. Click "Inventory" in sidebar
2. Wait for module load

**Expected Results:**
- ✅ Multi-category tabs (Food, Amenities, Materials, General)
- ✅ Stock level indicators
- ✅ Low stock alerts
- ✅ Usage tracking
- ✅ Auto-order configuration
- ✅ No console errors

**Visual Elements:**
- Category tabs
- Item cards/table
- Stock level progress bars
- Supplier links

**Test Actions:**
- Add inventory item
- Log usage
- Set reorder level
- Configure auto-order

---

### Test 11: Procurement Module
**Location:** Management → Procurement

**Steps:**
1. Click "Procurement" in sidebar
2. Wait for module load

**Expected Results:**
- ✅ Requisition list
- ✅ Purchase order management
- ✅ GRN processing interface
- ✅ Invoice tracking
- ✅ Approval workflow indicators
- ✅ No console errors

**Visual Elements:**
- Requisition status badges
- PO preview buttons
- GRN entry forms
- Invoice matching section

**Test Actions:**
- Create requisition
- Generate PO
- Process GRN
- Match invoice

---

### Test 12: Suppliers Module
**Location:** Management → Suppliers

**Steps:**
1. Click "Suppliers" in sidebar
2. Wait for module load

**Expected Results:**
- ✅ Supplier list/table
- ✅ Sample suppliers from sampleSuppliers
- ✅ Add supplier button
- ✅ Contact information display
- ✅ Performance ratings
- ✅ No console errors

**Test Actions:**
- Add new supplier
- Edit supplier details
- View supplier performance

---

### Test 13: Finance Module
**Location:** Management → Finance

**Steps:**
1. Click "Finance" in sidebar
2. Wait for module load

**Expected Results:**
- ✅ Invoice management interface
- ✅ Payment processing section
- ✅ Expense tracking
- ✅ Budget management
- ✅ Journal entries
- ✅ Chart of accounts
- ✅ Financial reports
- ✅ No console errors

**Visual Elements:**
- Invoice table
- Payment forms
- Budget vs actual charts
- GL account tree

**Test Actions:**
- Create invoice
- Record payment
- Add expense
- Create journal entry
- Run financial report

---

### Test 14: HR & Staff Module
**Location:** Management → HR & Staff

**Steps:**
1. Click "HR & Staff" in sidebar
2. Wait for module load

**Expected Results:**
- ✅ Employee directory
- ✅ Sample employees from sampleEmployees
- ✅ Attendance tracking
- ✅ Leave management
- ✅ Shift scheduling
- ✅ Performance review section
- ✅ No console errors

**Visual Elements:**
- Employee cards/table
- Attendance calendar
- Leave request list
- Shift roster grid

**Test Actions:**
- Add employee
- Mark attendance
- Create leave request
- Schedule shift
- Add performance review

---

### Test 15: Analytics Module
**Location:** System → Analytics

**Steps:**
1. Click "Analytics" in sidebar
2. Wait for module load

**Expected Results:**
- ✅ Dashboard with charts
- ✅ Multiple report sections
- ✅ Date range filters
- ✅ Export options
- ✅ Visual charts (bar, line, pie)
- ✅ No console errors

**Visual Elements:**
- Chart containers
- Filter dropdowns
- Export buttons
- Summary statistics

**Test Actions:**
- Select date range
- Generate report
- Export to PDF/CSV

---

### Test 16: Maintenance Module
**Location:** System → Maintenance

**Steps:**
1. Click "Maintenance" in sidebar
2. Wait for module load

**Expected Results:**
- ✅ Project list
- ✅ Material inventory
- ✅ Contractor management
- ✅ Sample maintenance requests
- ✅ No console errors

**Test Actions:**
- Create project
- Add material
- Assign contractor

---

### Test 17: Users Module
**Location:** System → Users

**Steps:**
1. Click "Users" in sidebar
2. Wait for module load

**Expected Results:**
- ✅ User account list
- ✅ Sample users from sampleSystemUsers
- ✅ Role management
- ✅ Permission settings
- ✅ Activity log (may be empty)
- ✅ No console errors

**Test Actions:**
- View user details
- Check role assignments
- Review permissions

**Note:** User editing may be limited (setUsers is empty function)

---

### Test 18: Settings Module
**Location:** System → Settings

**Steps:**
1. Click "Settings" in sidebar
2. Wait for module load

**Expected Results:**
- ✅ Multiple settings tabs/sections
- ✅ Branding configuration
- ✅ Tax settings
- ✅ Email template management
- ✅ Service charge configuration
- ✅ No console errors

**Visual Elements:**
- Settings navigation
- Form inputs
- Upload buttons (logo, favicon)
- Template editor
- Preview panels

**Test Actions:**
- Update branding
- Configure tax
- Edit email template
- Set service charge

---

## Console Error Checklist

After each module test, check browser console for:
- ❌ Red errors
- ⚠️ Yellow warnings
- 🔵 Blue info messages (acceptable)

**Common acceptable messages:**
- Module lazy load messages
- KV store read/write operations
- React DevTools messages

**Unacceptable errors:**
- Type errors
- Undefined property access
- Failed promises
- Component render errors

---

## Performance Metrics

Record for each module:
- **Load Time:** Time from click to full render
- **Memory Usage:** Check DevTools Performance tab
- **Network Calls:** Check Network tab for API calls

**Expected Performance:**
- Dashboard: < 100ms
- Lazy modules: < 1000ms
- No memory leaks between navigation

---

## Mobile Responsiveness Test

Repeat key tests with responsive views:
1. Desktop (> 1024px)
2. Tablet (768px - 1023px)
3. Mobile (< 768px)

**Check:**
- Sidebar collapses to hamburger on mobile
- Tables convert to cards on mobile
- Forms stack vertically on mobile
- All buttons accessible on touch devices

---

## Test Results Template

```
Module: _______________
Date: _______________
Tester: _______________

Load Status: ☐ Pass ☐ Fail
Load Time: _____ ms
Console Errors: ☐ None ☐ Present (describe below)
Visual Issues: ☐ None ☐ Present (describe below)
Functionality: ☐ Pass ☐ Fail

Notes:
_______________________________
_______________________________
_______________________________
```

---

## Final Verification

After completing all 18 module tests:

- [ ] All modules loaded successfully
- [ ] No critical console errors
- [ ] All CRUD operations functional
- [ ] Data persists across navigation
- [ ] Mobile view tested
- [ ] Performance acceptable
- [ ] Cross-module integration verified

**Overall System Status:** ☐ Pass ☐ Fail

---

**Document Version:** 1.0  
**Last Updated:** ${new Date().toISOString()}  
**Total Modules:** 18  
**Test Coverage:** 100%
