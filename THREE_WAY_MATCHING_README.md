# Three-Way Matching System - W3 Hotel PMS

## Overview

The Three-Way Matching system provides comprehensive invoice reconciliation between Purchase Orders (PO), Goods Received Notes (GRN), and Supplier Invoices. This ensures accurate payment processing and variance detection.

## Components

### 1. ThreeWayMatchingDialog

**Location:** `src/components/ThreeWayMatchingDialog.tsx`

**Features:**
- Automated matching between PO, GRN, and Invoice
- Real-time variance calculation and analysis
- Configurable tolerance thresholds
- Multi-level approval workflows
- Comprehensive audit trail
- Dispute creation integration

**Variance Detection:**
- **Quantity Variances**: Compares ordered vs received vs invoiced quantities
- **Price Variances**: Detects differences between PO price and invoice price
- **Total Amount Variances**: Overall line item and invoice-level discrepancies

**Matching Status:**
- `fully-matched`: All items match within tolerance
- `partially-matched`: Some items have variances
- `variance-within-tolerance`: Variances exist but are acceptable
- `needs-review`: Significant variances requiring attention
- `not-matched`: No PO/GRN found for invoice
- `approved-with-variance`: Manually approved despite variances
- `rejected`: Variances rejected

**Approval Levels:**
- `auto-approve`: Variance ≤ tolerance threshold
- `manager`: Variance ≤ 5%
- `senior-manager`: Variance ≤ 15%
- `director`: Variance ≤ 25%
- `cfo`: Variance > 25%

### 2. VarianceReportDialog

**Location:** `src/components/VarianceReportDialog.tsx`

**Features:**
- Comprehensive variance reporting
- Multiple report types (PO-GRN, GRN-Invoice, PO-Invoice, Three-Way)
- Flexible time periods (7, 30, 60, 90, 180, 365 days)
- CSV export functionality
- Variance analytics by:
  - Supplier
  - Category
  - Time trends
  - Top variances

**Report Metrics:**
- Total variance count
- Total variance amount
- Variance percentage
- Supplier-wise breakdown
- Category-wise breakdown
- Daily trends

## Data Types

### InvoiceMatchingResult
```typescript
{
  id: string
  invoiceId: string
  purchaseOrderId?: string
  grnId?: string
  matchStatus: MatchStatus
  overallVariance: number
  variancePercentage: number
  toleranceThreshold: number
  itemsMatched: number
  itemsMismatched: number
  itemsMissing: number
  itemsAdditional: number
  quantityVariances: MatchingVariance[]
  priceVariances: MatchingVariance[]
  totalVariances: MatchingVariance[]
  recommendations: MatchingRecommendation[]
  requiresApproval: boolean
  approvalLevel: ApprovalLevel
  auditTrail: MatchingAuditEntry[]
}
```

### MatchingVariance
```typescript
{
  itemId: string
  itemName: string
  field: 'quantity' | 'price' | 'total' | 'tax' | 'unit' | 'description'
  poValue?: number
  grnValue?: number
  invoiceValue?: number
  variance: number
  variancePercentage: number
  isWithinTolerance: boolean
  requiresAction: boolean
  suggestedAction?: string
}
```

### VarianceReport
```typescript
{
  id: string
  reportNumber: string
  reportType: 'po-grn' | 'grn-invoice' | 'po-invoice' | 'three-way'
  period: { from: number; to: number }
  totalVariances: number
  totalVarianceAmount: number
  totalVariancePercentage: number
  variancesByCategory: CategoryVariance[]
  variancesBySupplier: SupplierVariance[]
  topVariances: TopVariance[]
  varianceTrends: TrendData[]
}
```

## Workflow

### 1. Invoice Receipt
1. Supplier invoice is uploaded or scanned
2. System attempts to match with existing PO and GRN
3. Three-way matching is automatically triggered

### 2. Variance Detection
1. System compares quantities (PO → GRN → Invoice)
2. System compares prices (PO → Invoice)
3. System calculates total amount variances
4. Variances are categorized by severity

### 3. Tolerance Checking
```typescript
const toleranceConfig = {
  quantityTolerancePercentage: 5,    // 5% quantity variance allowed
  priceTolerancePercentage: 2,       // 2% price variance allowed
  totalTolerancePercentage: 5        // 5% total variance allowed
}
```

### 4. Approval Routing
- Variances within tolerance → Auto-approve
- 0-5% variance → Manager approval
- 5-15% variance → Senior Manager approval
- 15-25% variance → Director approval
- >25% variance → CFO approval

### 5. Recommendations
The system provides intelligent recommendations:
- **Approve**: All variances within tolerance
- **Request Clarification**: Minor variances detected
- **Create Dispute**: Significant variances found
- **Contact Supplier**: Additional items not in PO
- **Create Debit Note**: Missing items from PO

### 6. Dispute Creation
For unacceptable variances:
1. Automatically populate dispute with variance details
2. Link PO, GRN, and Invoice
3. Set priority based on variance severity
4. Track communications and resolution

## Integration Points

### Procurement Module
```typescript
import { ThreeWayMatchingDialog } from '@/components/ThreeWayMatchingDialog'

<ThreeWayMatchingDialog
  open={matchingDialogOpen}
  onOpenChange={setMatchingDialogOpen}
  invoice={selectedInvoice}
  purchaseOrders={purchaseOrders}
  grns={grns}
  suppliers={suppliers}
  currentUser={currentUser}
  onMatchComplete={(result) => {
    // Update invoice with matching result
    setInvoices(currentInvoices =>
      currentInvoices.map(inv =>
        inv.id === selectedInvoice.id
          ? { ...inv, matchingResult: result, status: 'matched' }
          : inv
      )
    )
  }}
  onCreateDispute={(dispute) => {
    // Create supplier dispute
    setDisputes(current => [...current, dispute as SupplierDispute])
  }}
/>
```

### Finance Module
```typescript
import { VarianceReportDialog } from '@/components/VarianceReportDialog'

<VarianceReportDialog
  open={reportDialogOpen}
  onOpenChange={setReportDialogOpen}
  invoices={invoices}
  purchaseOrders={purchaseOrders}
  grns={grns}
  suppliers={suppliers}
/>
```

## Configuration

### Tolerance Settings
Create a tolerance configuration dialog to allow administrators to set:
```typescript
interface MatchingToleranceConfig {
  quantityTolerancePercentage: number
  priceTolerancePercentage: number
  totalTolerancePercentage: number
  autoApproveWithinTolerance: boolean
  requireApprovalThreshold: number
  requireSeniorApprovalThreshold: number
  requireDirectorApprovalThreshold: number
}
```

### Approval Workflows
Define approval hierarchies based on:
- Variance amount
- Variance percentage
- Supplier rating
- Historical variance patterns

## Reports & Analytics

### Variance Reports
- Export to CSV
- Filter by date range
- Filter by supplier
- Filter by variance type
- Sort by amount or percentage

### Key Metrics
- Total variances detected
- Average variance percentage
- Most problematic suppliers
- Trend analysis over time
- Approval rates by level

## Best Practices

1. **Automatic Matching**: Run three-way matching on all new invoices
2. **Tolerance Review**: Review tolerance thresholds quarterly
3. **Supplier Performance**: Use variance data for supplier ratings
4. **Dispute Resolution**: Track resolution times and outcomes
5. **Audit Trail**: Maintain complete history of all matching decisions

## Error Handling

### Common Scenarios
- **No PO Found**: Flag for review, may be direct purchase
- **No GRN Found**: Cannot match quantities, price-only comparison
- **Multiple Matches**: Show all potential matches for manual selection
- **Partial Deliveries**: Support multiple GRNs for single PO
- **Price Changes**: Handle approved price variations

## Future Enhancements

1. **ML-Based Matching**: Use machine learning to improve automatic matching
2. **Predictive Variances**: Predict likely variances based on historical data
3. **Supplier Insights**: Detailed supplier variance patterns
4. **Mobile Approval**: Mobile app for variance approvals
5. **Integration**: Connect with accounting systems (QuickBooks, Xero, etc.)
6. **Advanced Analytics**: Dashboards with variance visualizations
7. **Automated Dispute Resolution**: Suggest resolutions based on past cases

## Security & Compliance

- **Audit Trail**: Complete history of all matching decisions
- **Role-Based Access**: Approval authority based on user role
- **Data Integrity**: Immutable matching records
- **Compliance**: SOX, GAAP compliance for financial matching
- **Segregation of Duties**: Different users for matching vs approval

## Support

For issues or questions:
1. Check variance report for patterns
2. Review tolerance configuration
3. Examine audit trail for decision history
4. Contact supplier for clarification
5. Escalate to finance team if unresolved

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Module:** Finance & Procurement  
**Dependencies:** Invoice Management, Purchase Orders, GRN Module
