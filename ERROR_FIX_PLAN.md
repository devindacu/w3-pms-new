# W3 Hotel PMS - Error Fix Plan

## Current Status
Based on error audit, there are approximately 75+ TypeScript errors across multiple files.

## Priority Fix Plan

### Priority 1: Critical Type Exports (COMPLETED ✅)
- [x] Added `BudgetCategory` type export
- [x] Added `InvoiceType` type export  
- [x] Added `PaymentTerms` type export

### Priority 2: Invoice Type Confusion (IN PROGRESS)
**Problem:** Two different invoice systems causing confusion:
- `Invoice` (procurement/supplier invoices)
- `GuestInvoice` (guest billing invoices)

**Files to Fix:**
1. `Finance.tsx` - Currently using `Invoice` when it should use procurement invoice properties
2. `InvoiceDialog.tsx` - Designed for procurement invoices but using wrong fields
3. `InvoiceViewerA4.tsx` - Mixing GuestInvoice and Invoice properties
4. `GuestInvoiceManagement.tsx` - Prop type mismatches
5. `InvoiceManagement.tsx` - Prop type mismatches

**Fix Strategy:**
- Keep `Finance.tsx` using procurement `Invoice` type
- Fix property access to match actual `Invoice` type definition
- Ensure `GuestInvoiceManagement.tsx` uses `GuestInvoice` only
- Fix all component prop interfaces

### Priority 3: Missing Component Files
**Files Referenced but Don't Exist:**
- `GuestInvoiceDialog.tsx`
- `ChargePostingDialog.tsx`
- `InvoicePaymentDialog.tsx`
- `InvoiceAdjustmentDialog.tsx`
- `NightAuditDialog.tsx`

**Fix Strategy:**
- Comment out or remove imports from `GuestInvoicing.tsx`
- These can be implemented later as needed

### Priority 4: Property Mismatches
**Files with Missing Properties:**
1. `BudgetDialog.tsx` - Missing `updatedAt` field
2. `ExpenseDialog.tsx` - Missing `expenseDate` and `status` fields
3. `RoomTypeDialog.tsx` - Missing multiple required fields
4. `InvoiceViewerA4.tsx` - Accessing non-existent properties

**Fix Strategy:**
- Add missing required fields when creating objects
- Use optional chaining for optional properties

### Priority 5: Status/Enum Comparison Errors
**Files:**
1. `Finance.tsx` - Comparing with `'paid'` status that doesn't exist in `InvoiceStatus`
2. `reportHelpers.ts` - Comparing with `'rejected'` status not in `PurchaseOrderStatus`

**Fix Strategy:**
- Use correct status values from type definitions
- Add missing status values to types if needed

### Priority 6: Missing Hook Reference
**File:** App.tsx references `use-notification-sound.ts`
**Status:** File exists ✅

### Priority 7: Array Type Inference
**File:** `InvoiceMatchingDialog.tsx`
**Issue:** Recommendations array typed as `never[]`
**Fix:** Properly type the state variable

## Implementation Order
1. ✅ Fix type exports
2. Fix missing component imports
3. Fix Invoice vs GuestInvoice confusion
4. Add missing required fields
5. Fix status comparisons
6. Fix property access with optional chaining
7. Fix array type inference

## Testing Checklist
- [ ] TypeScript compiles without errors
- [ ] All modules load without runtime errors
- [ ] Sample data loads successfully
- [ ] Invoice creation/viewing works
- [ ] Budget and expense dialogs work
- [ ] Room type management works
- [ ] Procurement invoice matching works
