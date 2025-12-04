# Finance Module — Hotel PMS (Complete Specification)

## 1. Goals & Scope

Provide a full accounting and financial control system that integrates with PMS, POS, Procurement, Payroll, and Banking to:

- Record transactions (sales, purchases, payments)
- Maintain General Ledger & Chart of Accounts
- Handle Accounts Receivable (guest folios, group master bills)
- Handle Accounts Payable (supplier invoices, payments)
- Manage multi-currency, tax, service charges
- Produce statutory & management reports (P&L, Balance Sheet, Cashflow)
- Support audit trails, month-end close, and GL reconciliation
- Export to ERP / external accounting packages

## 2. Core Concepts & Entities

### 2.1 Chart of Accounts (CoA)

Hierarchical structure: Assets → Liabilities → Equity → Revenue → Expenses

**Example accounts:**

**Assets:**
- Cash on Hand
- Bank: Main USD
- Bank: LKR
- Accounts Receivable
- Inventory

**Liabilities:**
- Accounts Payable
- Tax Payable (VAT)
- Deferred Revenue

**Equity:**
- Owner's Capital
- Retained Earnings

**Revenue:**
- Room Revenue
- F&B Revenue
- Other Revenue

**Expenses:**
- COGS (Food)
- Payroll Expense
- Utilities
- Maintenance
- Depreciation

**Features:**
- Account types, sub-accounts, code (numeric), normal balance (debit/credit)
- Account currency, tax applicability, reporting group
- Account mapping for POS, PO, invoices and bank feeds

### 2.2 Journal & Journal Entries

- General Journal (manual)
- Special Journals: Sales Journal, Purchase Journal, Cash Receipts, Cash Payments
- Each Journal Entry: date, doc_ref, lines (account_id, debit, credit, cost_center, tax_id), created_by, approved_flag
- Support recurring journal templates (e.g., monthly accruals, depreciation)

### 2.3 Open Periods & Period Close

- Fiscal Year and Period (month) locking
- Period status: Open / Locked / Closed
- Support reversing entries

## 3. Accounts Receivable (AR)

### 3.1 Guest Folios & Invoicing

- Link folios to AR invoice(s)
- Invoice generation (from folio) posts to Sales accounts and Tax payable
- Support interim invoices and final invoices
- Credit notes & refunds

### 3.2 Receipts & Payment Allocation

- Receive payments: Cash, Card, Bank transfer, Voucher, Corporate billing
- Payment lines allocate to invoice(s)
- Partial payments & overpayments (customer credit balance)
- Unapplied receipts queue

### 3.3 Aging & Collections

- AR aging buckets (0-30, 31-60, 61-90, 90+)
- Dunning rules & automated reminders
- Corporate billing with credit limits & statements

### 3.4 Integration Points

- PMS folios, POS real-time postings, payment gateway (card capture/settlement)

## 4. Accounts Payable (AP)

### 4.1 Supplier Invoices

- Create AP invoice manually or via OCR ingestion
- Three-way match: PO ↔ GRN ↔ Invoice (flag mismatches)
- Tax & withholding handling
- Invoice approvals & routing workflows

### 4.2 Payments

- Payment proposals (due-date batches)
- Payment methods: Bank transfer, Cheque, Card payments (refunds), Petty cash
- Batch payments & payment runs (CSV export for bank)
- Multi-currency vendor payments with realized FX gain/loss booking

### 4.3 Supplier Statements & Reconciliation

- Supplier aging
- Supplier statements (balance, invoice list)
- Hold & release invoices (for disputes)

## 5. Cash & Bank Management

### 5.1 Cash on Hand

- Petty cash floats, top-ups, petty cash expense claims

### 5.2 Bank Accounts

- Multi-bank accounts with currency
- Bank reconciliation: import bank statement (CSV/MT940) and auto-match transactions
- Reconciliation adjustments journal entry support
- Bank transfer between accounts (internal movement)

### 5.3 Payment Gateways

- Card capture (authorization), settlement, refunds
- Reconcile payment gateway report to received bank deposits
- PCI considerations: tokenization, do not store raw card data (use gateway tokens)

## 6. Tax, Service Charge & Compliance

### 6.1 Tax Handling

- Configurable tax rates (VAT, GST) with effective dates
- Tax-inclusive vs tax-exclusive pricing
- Tax postings: per line tax calculation & tax reporting accounts
- Support for multiple tax authorities and tax reports

### 6.2 Service Charge & Tips

- Service charge (configurable % per department)
- Service charge distribution (to revenue vs. payable to staff)
- Tip pooling & payout handling

### 6.3 Withholding Taxes

- Withholding tax on supplier invoices if jurisdiction requires
- Generate WITHHOLDING tax certificates and remittance journal

## 7. Costing, Departments & Projects

- Cost centers / departments (F&B, Rooms, Engineering)
- Job / project codes (for events, construction)
- Post journal entries to cost center
- Departmental P&L and project profitability reports

## 8. Inter-module Posting Rules

**POS sale (F&B):**
- Debit Cash/AR → Credit F&B Revenue
- Tax lines credit Tax Payable
- COGS entry if tracked

**Room revenue:**
- Debit AR (folio) → Credit Room Revenue
- Tax portion credited to Tax Payable

**PO → Invoice (AP):**
- Debit Expense/Inventory → Credit Accounts Payable

**Goods Received (no invoice):**
- Optional accrual: Debit Inventory/Expense → Credit GR Accrual

**Payment of AP:**
- Debit AP → Credit Bank/Cash

**Payroll:**
- Debit Payroll Expense → Credit Bank/Payroll Payable
- Employer taxes/benefits separate entries

## 9. Multi-currency & FX

- Store transaction currency and local/base currency
- Use exchange rate table per date
- On payment, calculate realized/unrealized FX gain or loss (post to GL FX Gain/Loss account)
- Revaluation of AR/AP balances at period-end optional (create revaluation journals)

## 10. Reporting & Dashboards

### 10.1 Standard Financial Reports

- Trial Balance (by period)
- General Ledger (drillable)
- Balance Sheet
- Profit & Loss (P&L) — departmental and consolidated
- Cashflow Statement (indirect/direct)
- Aged Receivables & Payables
- Bank Reconciliation Report
- Tax Summary (VAT collected & paid)
- Journal Audit Trail

### 10.2 Operational Reports

- Daily Revenue Report (by revenue center & channel)
- Revenue by Room Type
- F&B sales vs COGS
- Purchase summary (supplier, item)
- Budget vs Actual (monthly)

### 10.3 Dashboards

- Cash Position (real-time)
- KPIs: ADR, RevPAR, Occupancy% (from PMS) integrated
- AP due this month, AR overdue
- Top 10 vendors by spend
- Expense trend by department

## 11. Security, Controls & Auditability

- Strong RBAC: who can post journal, approve payments, close periods
- Approval workflows for:
  - AP invoice approval (2-level for > threshold)
  - Payment runs approval
  - Journal posting & reversing
- Segregation of duties: requesters vs approvers vs payers
- Immutable audit trail with before/after snapshots
- Data encryption at rest for sensitive fields
- Backup & retention policies (statutory compliance)
- Tamper-evident logs (hash chain optional)

## 12. Month-end & Year-end Procedures

1. Cut-off: close front-end postings (PMS/POS) for period
2. Accruals and prepayments posting
3. Depreciation run (fixed assets module)
4. Reconciliation: bank, AR, AP, intercompany
5. FX revaluation (if enabled)
6. Generate final financial statements
7. Lock period for audit

## 13. Automation & Advanced Features

- Automated recurring entries (rent, lease, depreciation)
- Auto-matching AP invoices to PO/GRN via OCR + fuzzy match
- Cash forecasting (predict next 90 days)
- Auto-suggest payment runs optimizing cashflow & discounts
- Integration with Revenue Management for forecast-driven revenue recognition
- ML anomaly detection (unusual invoice amounts, duplicate invoices)
- Multi-entity consolidation for chains (intercompany eliminations)

## 14. Example Transactions

### Example A — Guest checkout (room + F&B)

**Room revenue: 15,000 LKR (taxable 8%, service 10%)**

Post AR Invoice lines:
```
DR Accounts Receivable         17,820.00
  CR Room Revenue                      15,000.00
  CR Service Charge Payable             1,500.00
  CR VAT Payable                        1,320.00
```

Guest pays 10,000 LKR by card:
```
DR Bank Account (Card)         10,000.00
  CR Accounts Receivable               10,000.00
```

### Example B — Supplier invoice + payment

**Supplier Invoice for goods = 50,000 LKR VAT 8%:**
```
DR Inventory / Expense         50,000.00
DR VAT Recoverable              4,000.00
  CR Accounts Payable                  54,000.00
```

Payment by bank 54,000:
```
DR Accounts Payable            54,000.00
  CR Bank Account                      54,000.00
```

## 15. Testing & QA Checklist

- [ ] Unit tests for posting logic (debits == credits)
- [ ] Integration test with PMS/POS posting flows
- [ ] Reconciliation flow tests (bank import)
- [ ] Tax calculation edge cases (tax-inclusive/exclusive)
- [ ] Multi-currency rounding & FX gain/loss
- [ ] Access control & segregation-of-duties tests
- [ ] Performance tests for month-end batch operations

## 16. Implementation Status

### Phase 1 - Foundation (Current)
- [x] Chart of Accounts structure
- [x] Journal Entry framework
- [x] Basic AR/AP structure
- [x] Tax configuration
- [ ] Period management

### Phase 2 - Core Operations
- [ ] Full GL posting engine
- [ ] AR invoice generation from folios
- [ ] AP invoice processing
- [ ] Payment processing
- [ ] Bank reconciliation

### Phase 3 - Reporting
- [ ] Standard financial reports
- [ ] Operational dashboards
- [ ] Export capabilities

### Phase 4 - Advanced Features
- [ ] Multi-currency support
- [ ] Automated workflows
- [ ] Advanced analytics
- [ ] ERP integration

## 17. Integration Points

### Current Integrations
- **PMS (Front Office)**: Guest folios, reservations
- **POS (F&B)**: Order postings, payments
- **Procurement**: Purchase orders, GRNs, supplier invoices
- **HR**: Payroll expenses

### Planned Integrations
- **Banking APIs**: Statement imports, payment initiation
- **Payment Gateways**: Card processing, reconciliation
- **ERP Systems**: Export capabilities
- **Tax Authorities**: Electronic filing

## 18. Currency & Localization

- Base currency: LKR (Sri Lankan Rupee)
- Multi-currency support for international transactions
- Tax compliance for Sri Lankan regulations (VAT, NBT, etc.)
- Date formats and number formatting per locale

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Module Status:** In Development  
**Owner:** W3 Media PVT LTD
