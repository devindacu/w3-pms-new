# Error Audit Report - W3 Hotel PMS
Last Updated: 2025-01-XX

## ✅ CRITICAL VITE MODULE ERROR - RESOLVED

**Error:** Cannot find module '/workspaces/spark-template/node_modules/vite/dist/node/chunks/dist.js'
**Status:** ✅ FIXED
**Solution:** Updated Vite to latest version (7.2.6)
**Date Fixed:** Latest iteration

---

## Summary
Total Errors Found: 75+
Critical Errors: 15 → 14 (1 resolved)
Type Errors: 60+

**Files Affected:**

### 1. **Functional Setter Type Mismatches** ✅ FIXED
**Files Affected:**
### 2. **Guest Invoice Au



**File:** `GuestInvoiceManagement.tsx`

- Using status `'void'` which doesn't exist (should be `'cancelled
**Fix Applied
- Changed all references from `'void'` to `'cancelled'`
- U



### 2. Missing Type Exports
**Files:** `BudgetDialog.tsx`, `InvoiceDialog.tsx`

**Errors:**
- `BudgetCategory` exported as `BudgetCategoryType`
- `InvoiceType` not exported
- `PaymentTerms` not exported

**Fix Required:** Add or rename exports in `types.ts`

### 3. Missing Required Fields  

#### BudgetDialog.tsx (Line 119)
**Error:** Property 'updatedAt' missing in Budget type
**Fix:** Add `updatedAt: now` field

#### ExpenseDialog.tsx (Line 67)
**Error:** Missing 'expenseDate' and 'status' properties
**Fix:** Add missing required fields to Expense object

#### RoomTypeDialog.tsx (Line 75)
**Error:** Missing multiple required properties: `rackRate`, `baseOccupancy`, `bedding`, `viewTypes`, `sortOrder`, `createdBy`
**Fix:** Add all required fields to RoomTypeConfig object

### 4. Invoice Type Confusion

**Problem:** Two separate invoice systems causing conflicts:
- Doesn't have: `balance`, `amountPaid`, `t
- `GuestInvoice` (guest billing invoices)

**Files Affected:**
- `Finance.tsx` - Using wrong Invoice type (needs procurement Invoice)
- `InvoiceDialog.tsx` - Wrong fields for Invoice type
- `InvoiceViewerA4.tsx` - Expects GuestInvoice but uses Invoice fields
- `GuestInvoiceManagement.tsx` - Status type mismatches

**Errors:**
- Accessing non-existent properties: `balance`, `amountPaid`, `type`, `issueDate`, `paymentTerms`, `guestId`, `discount`
- Wrong status comparisons: `'paid'` vs `GuestInvoiceStatus`
- Wrong audit action types: `'modified'` vs allowed types


**Files Referenced but Not Found:**
- `GuestInvoiceDialog.tsx`
- `ChargePostingDialog.tsx`

- `InvoiceAdjustmentDialog.tsx`
- `NightAuditDialog.tsx`

**Used In:** `GuestInvoicing.tsx`
**Impact:** Module cannot compile

### 6. Status/Enum Comparison Errors

#### PurchaseOrderStatus (reportHelpers.ts)
**Error:** Comparing PurchaseOrderStatus with `'rejected'` which doesn't exist
**Fix:** Use correct status value or add 'rejected' to PurchaseOrderStatus type

#### GuestInvoiceStatus (Multiple files)

- Comparing with `'paid'` (doesn't exist in type)
**Error:** Using `'link'` as delivery method
**Files:** `GuestInvoiceManagement.tsx`, `Finance.tsx`

### 7. Delivery Method Type Mismatch
**File:** `GuestInvoiceManagement.tsx` (Line 358)
**Error:** Using `'link'` as delivery method but type expects: `'download' | 'email' | 'portal' | 'print' | 'sms' | 'whatsapp'`
1. ✅ Fix functional setter types (DONE)

4. **Fix Invoice vs GuestInvoice type con
**File:** `GuestInvoiceEditDialog.tsx` (Lines 81, 84)
**Error:** Using `'modified'` action but type expects: `'cancelled' | 'created' | 'discount-applied' | 'emailed' | 'finalized' | 'merged' | 'payment-received' | 'posted-to-accounts' | 'printed' | 'refunded' | 'split' | 'tax-adjusted' | 'updated' | 'voided'`
**Fix:** Change `'modified'` to `'updated'`

### 9. Missing Optional Field Guards
**Files:** `Finance.tsx`, `InvoiceDialog.tsx`
**Errors:**
- Accessing `expense.paymentMethod` without null check (Line 517)
- Accessing `inv.dueDate` without undefined check (Line 69)
**Fix:** Add optional chaining or null checks

### 10. InvoiceMatchingDialog Array Type Error
**File:** `InvoiceMatchingDialog.tsx` (Lines 204, 211, 218)
**Error:** Pushing objects to array typed as `never[]`
**Fix:** Properly type the array or recommendations state

## Recommendations

### High Priority
1. **Clarify Invoice Types:** Create clear separation between procurement and guest invoices
2. **Create Missing Components:** Implement all referenced dialog components
3. **Fix Type Exports:** Ensure all types are properly exported from types.ts
4. **Status Type Audits:** Review all status enums to ensure they match usage

### Medium Priority
5. **Add Missing Fields:** Complete all object constructions with required fields
6. **Null Safety:** Add guards for all optional properties before access
7. **Functional Setter Audit:** Check all remaining components for setter type mismatches


8. **Code Documentation:** Document the two invoice systems clearly
9. **Type Aliases:** Consider using type aliases for complex functional setter types
10. **ESLint Rules:** Add rules to catch these patterns early

## Testing Checklist
- [ ] All TypeScript errors resolved
- [ ] Recipe & Menu management functional
- [ ] Kitchen consumption tracking working
- [ ] Extra services CRUD operations
- [ ] Invoice generation and viewing
- [ ] Budget and expense tracking
- [ ] All dialogs render without errors
- [ ] Data persistence via useKV working correctly

## Notes
Many errors stem from a larger refactoring where Invoice types were split into procurement vs guest billing systems, but not all components were updated consistently. A systematic update of all invoice-related components is recommended.
