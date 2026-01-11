# Currency Configuration - W3 Hotel PMS

## Overview
The W3 Hotel PMS system has been configured to use **LKR (Sri Lankan Rupee)** as the primary currency throughout the entire application.

## Implementation Details

### Global Currency Formatting
All currency values are formatted using the `formatCurrency()` helper function located in `/src/lib/helpers.ts`.

**Format**: `LKR 1,234.56`

```typescript
export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
  
  return `LKR ${formatted}`
}
```

### Currency Display Across the System

The LKR currency format is automatically applied to all monetary values in:

#### 1. **Dashboard & Widgets**
- Revenue metrics
- Financial summaries
- Occupancy revenue
- Department performance indicators
- Period comparisons

#### 2. **Invoices & Billing**
- Guest invoices (all types)
- Supplier invoices
- Line items
- Tax calculations
- Service charges
- Subtotals and grand totals
- Payment records
- Credit/Debit notes

#### 3. **Reports**
- Financial reports
- Revenue reports
- Department reports
- Custom reports
- Scheduled reports
- Report templates (all categories)
  - Operational reports
  - Guest reports
  - Inventory reports
  - HR reports

#### 4. **Dialogs & Popups**
- Payment dialogs
- Invoice preview dialogs
- Budget dialogs
- Expense dialogs
- Price setting dialogs
- Rate management dialogs
- Purchase order dialogs
- GRN dialogs

#### 5. **Analytics**
- Revenue analytics
- F&B analytics
- Room revenue analytics
- Channel performance analytics
- Email campaign analytics
- Google Analytics integration (monetary metrics)

#### 6. **Operations Modules**
- Front Office (room rates, folios)
- F&B / POS (menu prices, orders)
- Procurement (purchase orders, requisitions)
- Finance (payments, expenses, budgets)
- Kitchen Operations (recipe costs, consumption)
- Inventory Management (item costs, stock values)
- Room & Revenue Management (rate plans, pricing)
- Extra Services (service pricing)

### Branding & System Settings

The currency configuration is stored in the Hotel Branding settings (`/src/components/BrandingSettings.tsx`):

```typescript
{
  currency: 'LKR',
  currencySymbol: 'Rs.',  // Alternative symbol (not currently used in display)
  currencyPosition: 'before',
  decimalPlaces: 2,
  // ... other branding settings
}
```

### Key Benefits

1. **Consistency**: All monetary values display uniformly across the entire system
2. **Clarity**: Clear "LKR" prefix eliminates currency ambiguity
3. **Localization**: Proper formatting for Sri Lankan business context
4. **Maintainability**: Single function controls all currency formatting
5. **Flexibility**: Easy to modify currency display format system-wide

### Usage in Components

Developers should always use the `formatCurrency()` helper when displaying monetary values:

```typescript
import { formatCurrency } from '@/lib/helpers'

// Example usage
const revenue = 125000.50
const formattedRevenue = formatCurrency(revenue)  // "LKR 125,000.50"
```

### Customization

To change the currency display format, modify the `formatCurrency()` function in `/src/lib/helpers.ts`. The change will automatically apply throughout the entire application.

Example alternative formats:
- `Rs. 1,234.56` - Using Rs. prefix
- `රු 1,234.56` - Using Sinhala symbol
- `1,234.56 LKR` - Suffix format
- `LKR1,234.56` - No space

## Verification Status

**✅ VERIFIED**: All currency symbols have been replaced with "LKR"
- No "$" symbols exist in the codebase
- All monetary values use `formatCurrency()` helper
- Format: "LKR 1,234.56"
- Verified across all modules:
  - Dashboard & Analytics
  - Revenue & Occupancy Reports
  - Finance Module
  - Invoice Center
  - Custom Reports
  - PDF Exports
  - All Dialogs & Popups

---

**Last Updated**: January 2025
**System Version**: W3 Hotel PMS v1.0
**Currency**: LKR (Sri Lankan Rupee)
**Status**: ✅ Complete - All $ symbols replaced with LKR
