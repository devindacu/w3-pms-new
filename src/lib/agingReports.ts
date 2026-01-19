import type { GuestInvoice, Invoice as SupplierInvoice, Payment } from './types'

export interface AgingBucket {
  label: string
  minDays: number
  maxDays: number | null
  count: number
  amount: number
}

export interface ARAgingReport {
  asOfDate: number
  totalOutstanding: number
  buckets: {
    current: AgingBucket        // 0-30 days
    days31to60: AgingBucket     // 31-60 days
    days61to90: AgingBucket     // 61-90 days
    over90: AgingBucket         // 90+ days
  }
  customerDetails: Array<{
    customerId: string
    customerName: string
    totalOutstanding: number
    invoices: Array<{
      invoiceNumber: string
      invoiceDate: number
      dueDate: number
      originalAmount: number
      amountDue: number
      daysOverdue: number
      agingBucket: 'current' | '31-60' | '61-90' | '90+'
    }>
  }>
  generatedAt: number
}

export interface APAgingReport {
  asOfDate: number
  totalOutstanding: number
  buckets: {
    current: AgingBucket        // 0-30 days
    days31to60: AgingBucket     // 31-60 days
    days61to90: AgingBucket     // 61-90 days
    over90: AgingBucket         // 90+ days
  }
  vendorDetails: Array<{
    vendorId: string
    vendorName: string
    totalOutstanding: number
    invoices: Array<{
      invoiceNumber: string
      invoiceDate: number
      dueDate: number
      originalAmount: number
      amountDue: number
      daysOverdue: number
      agingBucket: 'current' | '31-60' | '61-90' | '90+'
    }>
  }>
  generatedAt: number
}

/**
 * Calculate days overdue for an invoice
 */
function calculateDaysOverdue(dueDate: number, asOfDate: number): number {
  if (asOfDate <= dueDate) return 0
  return Math.floor((asOfDate - dueDate) / (1000 * 60 * 60 * 24))
}

/**
 * Determine aging bucket for days overdue
 */
function getAgingBucket(daysOverdue: number): 'current' | '31-60' | '61-90' | '90+' {
  if (daysOverdue <= 30) return 'current'
  if (daysOverdue <= 60) return '31-60'
  if (daysOverdue <= 90) return '61-90'
  return '90+'
}

/**
 * Create empty aging bucket
 */
function createEmptyBucket(label: string, minDays: number, maxDays: number | null): AgingBucket {
  return {
    label,
    minDays,
    maxDays,
    count: 0,
    amount: 0
  }
}

/**
 * Generate Accounts Receivable Aging Report
 * Shows outstanding amounts owed by customers (guests)
 */
export function generateARAgingReport(
  guestInvoices: GuestInvoice[],
  payments: Payment[],
  asOfDate: number = Date.now()
): ARAgingReport {
  // Filter to only unpaid or partially paid invoices as of the report date
  const outstandingInvoices = guestInvoices.filter(
    inv => inv.invoiceDate <= asOfDate && inv.amountDue > 0
  )

  // Initialize buckets
  const buckets = {
    current: createEmptyBucket('Current (0-30 days)', 0, 30),
    days31to60: createEmptyBucket('31-60 days', 31, 60),
    days61to90: createEmptyBucket('61-90 days', 61, 90),
    over90: createEmptyBucket('Over 90 days', 91, null)
  }

  // Group invoices by customer
  const customerMap = new Map<string, {
    customerId: string
    customerName: string
    totalOutstanding: number
    invoices: ARAgingReport['customerDetails'][0]['invoices']
  }>()

  outstandingInvoices.forEach(inv => {
    const daysOverdue = calculateDaysOverdue(inv.dueDate || inv.invoiceDate, asOfDate)
    const agingBucket = getAgingBucket(daysOverdue)

    // Update bucket totals
    const bucket = agingBucket === 'current' ? buckets.current :
                   agingBucket === '31-60' ? buckets.days31to60 :
                   agingBucket === '61-90' ? buckets.days61to90 :
                   buckets.over90

    bucket.count++
    bucket.amount += inv.amountDue

    // Add to customer details
    if (!customerMap.has(inv.guestId)) {
      customerMap.set(inv.guestId, {
        customerId: inv.guestId,
        customerName: inv.guestName,
        totalOutstanding: 0,
        invoices: []
      })
    }

    const customer = customerMap.get(inv.guestId)!
    customer.totalOutstanding += inv.amountDue
    customer.invoices.push({
      invoiceNumber: inv.invoiceNumber,
      invoiceDate: inv.invoiceDate,
      dueDate: inv.dueDate || inv.invoiceDate,
      originalAmount: inv.grandTotal,
      amountDue: inv.amountDue,
      daysOverdue,
      agingBucket
    })
  })

  // Sort customers by total outstanding (descending)
  const customerDetails = Array.from(customerMap.values())
    .sort((a, b) => b.totalOutstanding - a.totalOutstanding)

  const totalOutstanding = customerDetails.reduce((sum, c) => sum + c.totalOutstanding, 0)

  return {
    asOfDate,
    totalOutstanding,
    buckets,
    customerDetails,
    generatedAt: Date.now()
  }
}

/**
 * Generate Accounts Payable Aging Report
 * Shows outstanding amounts owed to vendors (suppliers)
 */
export function generateAPAgingReport(
  supplierInvoices: SupplierInvoice[],
  asOfDate: number = Date.now()
): APAgingReport {
  // Filter to only unpaid invoices as of the report date
  const outstandingInvoices = supplierInvoices.filter(
    inv => inv.invoiceDate <= asOfDate && 
           inv.status !== 'paid' && 
           inv.status !== 'cancelled'
  )

  // Initialize buckets
  const buckets = {
    current: createEmptyBucket('Current (0-30 days)', 0, 30),
    days31to60: createEmptyBucket('31-60 days', 31, 60),
    days61to90: createEmptyBucket('61-90 days', 61, 90),
    over90: createEmptyBucket('Over 90 days', 91, null)
  }

  // Group invoices by vendor
  const vendorMap = new Map<string, {
    vendorId: string
    vendorName: string
    totalOutstanding: number
    invoices: APAgingReport['vendorDetails'][0]['invoices']
  }>()

  outstandingInvoices.forEach(inv => {
    const dueDate = inv.dueDate || inv.invoiceDate
    const daysOverdue = calculateDaysOverdue(dueDate, asOfDate)
    const agingBucket = getAgingBucket(daysOverdue)

    // Calculate amount due (for AP, we use total if not paid)
    const amountDue = inv.total

    // Update bucket totals
    const bucket = agingBucket === 'current' ? buckets.current :
                   agingBucket === '31-60' ? buckets.days31to60 :
                   agingBucket === '61-90' ? buckets.days61to90 :
                   buckets.over90

    bucket.count++
    bucket.amount += amountDue

    // Add to vendor details
    if (!vendorMap.has(inv.supplierId)) {
      vendorMap.set(inv.supplierId, {
        vendorId: inv.supplierId,
        vendorName: inv.supplierName,
        totalOutstanding: 0,
        invoices: []
      })
    }

    const vendor = vendorMap.get(inv.supplierId)!
    vendor.totalOutstanding += amountDue
    vendor.invoices.push({
      invoiceNumber: inv.invoiceNumber,
      invoiceDate: inv.invoiceDate,
      dueDate: dueDate,
      originalAmount: inv.total,
      amountDue: amountDue,
      daysOverdue,
      agingBucket
    })
  })

  // Sort vendors by total outstanding (descending)
  const vendorDetails = Array.from(vendorMap.values())
    .sort((a, b) => b.totalOutstanding - a.totalOutstanding)

  const totalOutstanding = vendorDetails.reduce((sum, v) => sum + v.totalOutstanding, 0)

  return {
    asOfDate,
    totalOutstanding,
    buckets,
    vendorDetails,
    generatedAt: Date.now()
  }
}

/**
 * Get summary statistics for AR aging
 */
export function getARAgingSummary(report: ARAgingReport) {
  const total = report.totalOutstanding
  
  return {
    totalOutstanding: total,
    currentPercentage: total > 0 ? (report.buckets.current.amount / total) * 100 : 0,
    days31to60Percentage: total > 0 ? (report.buckets.days31to60.amount / total) * 100 : 0,
    days61to90Percentage: total > 0 ? (report.buckets.days61to90.amount / total) * 100 : 0,
    over90Percentage: total > 0 ? (report.buckets.over90.amount / total) * 100 : 0,
    overdueAmount: report.buckets.days31to60.amount + report.buckets.days61to90.amount + report.buckets.over90.amount,
    overduePercentage: total > 0 ? 
      ((report.buckets.days31to60.amount + report.buckets.days61to90.amount + report.buckets.over90.amount) / total) * 100 
      : 0,
    totalCustomers: report.customerDetails.length,
    customersWithOverdue: report.customerDetails.filter(c => 
      c.invoices.some(inv => inv.agingBucket !== 'current')
    ).length
  }
}

/**
 * Get summary statistics for AP aging
 */
export function getAPAgingSummary(report: APAgingReport) {
  const total = report.totalOutstanding
  
  return {
    totalOutstanding: total,
    currentPercentage: total > 0 ? (report.buckets.current.amount / total) * 100 : 0,
    days31to60Percentage: total > 0 ? (report.buckets.days31to60.amount / total) * 100 : 0,
    days61to90Percentage: total > 0 ? (report.buckets.days61to90.amount / total) * 100 : 0,
    over90Percentage: total > 0 ? (report.buckets.over90.amount / total) * 100 : 0,
    overdueAmount: report.buckets.days31to60.amount + report.buckets.days61to90.amount + report.buckets.over90.amount,
    overduePercentage: total > 0 ? 
      ((report.buckets.days31to60.amount + report.buckets.days61to90.amount + report.buckets.over90.amount) / total) * 100 
      : 0,
    totalVendors: report.vendorDetails.length,
    vendorsWithOverdue: report.vendorDetails.filter(v => 
      v.invoices.some(inv => inv.agingBucket !== 'current')
    ).length
  }
}

/**
 * Get customers/vendors at risk (90+ days overdue)
 */
export function getHighRiskAccounts(report: ARAgingReport | APAgingReport): Array<{
  id: string
  name: string
  amount: number
  oldestInvoiceDays: number
}> {
  const details = 'customerDetails' in report ? report.customerDetails : report.vendorDetails
  
  return details
    .filter(detail => detail.invoices.some(inv => inv.agingBucket === '90+'))
    .map(detail => ({
      id: 'customerId' in detail ? detail.customerId : detail.vendorId,
      name: 'customerName' in detail ? detail.customerName : detail.vendorName,
      amount: detail.totalOutstanding,
      oldestInvoiceDays: Math.max(...detail.invoices.map(inv => inv.daysOverdue))
    }))
    .sort((a, b) => b.amount - a.amount)
}
