import {
  type GuestInvoice,
  type InvoiceLineItem,
  type LineTaxDetail,
  type InvoiceTaxLine,
  type InvoiceDiscount,
  type InvoicePaymentRecord,
  type TaxConfiguration,
  type ServiceChargeConfiguration,
  type GuestInvoiceType,
  type GuestInvoiceStatus,
  type TaxType,
  type Folio,
  type FolioCharge,
  type FolioExtraService,
  type Order,
  type SystemUser,
  type InvoiceAuditEntry,
  type InvoiceValidationResult,
  type ConsolidatedInvoiceRequest,
  type GLEntry,
  type InvoiceNumberSequence,
  type Department
} from './types'
import { generateId, generateNumber, formatCurrency } from './helpers'

export function generateInvoiceNumber(
  invoiceType: GuestInvoiceType,
  sequence?: InvoiceNumberSequence
): string {
  if (!sequence) {
    const prefix = getInvoicePrefix(invoiceType)
    return generateNumber(prefix)
  }

  const paddedNumber = sequence.currentNumber.toString().padStart(sequence.paddingLength, '0')
  return `${sequence.prefix}${paddedNumber}${sequence.suffix || ''}`
}

function getInvoicePrefix(invoiceType: GuestInvoiceType): string {
  const prefixes: Record<GuestInvoiceType, string> = {
    'guest-folio': 'INV',
    'room-only': 'RM',
    'fnb-only': 'FB',
    'extras-only': 'EX',
    'group-master': 'GM',
    'proforma': 'PRO',
    'credit-note': 'CN',
    'debit-note': 'DN'
  }
  return prefixes[invoiceType]
}

export function calculateLineTaxes(
  lineItem: Partial<InvoiceLineItem>,
  taxConfigurations: TaxConfiguration[],
  serviceChargeConfig?: ServiceChargeConfiguration
): LineTaxDetail[] {
  const taxLines: LineTaxDetail[] = []
  
  if (!lineItem.taxable) return taxLines

  const activeTaxes = taxConfigurations
    .filter(tax => tax.isActive)
    .sort((a, b) => a.calculationOrder - b.calculationOrder)

  let taxableAmount = lineItem.netAmount || 0
  
  if (lineItem.serviceChargeApplicable && serviceChargeConfig?.isTaxable) {
    taxableAmount += lineItem.serviceChargeAmount || 0
  }

  for (const taxConfig of activeTaxes) {
    if (taxConfig.exemptCategories?.includes(lineItem.department || '')) continue

    const taxAmount = (taxableAmount * taxConfig.rate) / 100
    
    taxLines.push({
      taxType: taxConfig.type,
      taxName: taxConfig.name,
      taxRate: taxConfig.rate,
      taxableAmount: taxableAmount,
      taxAmount: Number(taxAmount.toFixed(2)),
      isInclusive: taxConfig.isInclusive
    })

    if (taxConfig.isCompoundTax) {
      taxableAmount += taxAmount
    }
  }

  return taxLines
}

export function calculateServiceCharge(
  lineItem: Partial<InvoiceLineItem>,
  serviceChargeConfig?: ServiceChargeConfiguration
): number {
  if (!lineItem.serviceChargeApplicable || !serviceChargeConfig?.isActive) return 0
  
  if (serviceChargeConfig.exemptCategories?.includes(lineItem.department || '')) return 0

  const netAmount = lineItem.netAmount || 0
  const serviceChargeAmount = (netAmount * serviceChargeConfig.rate) / 100
  
  return Number(serviceChargeAmount.toFixed(2))
}

export function calculateInvoiceTotals(
  lineItems: InvoiceLineItem[],
  discounts: InvoiceDiscount[],
  taxConfigurations: TaxConfiguration[],
  serviceChargeConfig?: ServiceChargeConfiguration
) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0)
  
  const lineLevelDiscountTotal = lineItems.reduce((sum, item) => sum + (item.discountAmount || 0), 0)
  
  const invoiceLevelDiscounts = discounts.filter(d => d.scope === 'invoice-level')
  let invoiceDiscountTotal = 0
  
  for (const discount of invoiceLevelDiscounts) {
    if (discount.type === 'percentage') {
      invoiceDiscountTotal += (subtotal * discount.value) / 100
    } else {
      invoiceDiscountTotal += discount.value
    }
  }

  const totalDiscount = lineLevelDiscountTotal + invoiceDiscountTotal
  const discountedSubtotal = subtotal - totalDiscount

  const serviceChargeAmount = lineItems.reduce((sum, item) => sum + (item.serviceChargeAmount || 0), 0)
  
  const taxBreakdown: Record<string, InvoiceTaxLine> = {}
  
  for (const lineItem of lineItems) {
    for (const taxLine of lineItem.taxLines || []) {
      const key = `${taxLine.taxType}-${taxLine.taxRate}`
      
      if (!taxBreakdown[key]) {
        taxBreakdown[key] = {
          taxType: taxLine.taxType,
          taxName: taxLine.taxName,
          taxRate: taxLine.taxRate,
          taxableAmount: 0,
          taxAmount: 0,
          isInclusive: taxLine.isInclusive,
          breakdown: []
        }
      }
      
      taxBreakdown[key].taxableAmount += taxLine.taxableAmount
      taxBreakdown[key].taxAmount += taxLine.taxAmount
      taxBreakdown[key].breakdown?.push({
        lineItemId: lineItem.id,
        description: lineItem.description,
        taxableAmount: taxLine.taxableAmount,
        taxAmount: taxLine.taxAmount
      })
    }
  }

  const taxLines = Object.values(taxBreakdown).map(tax => ({
    ...tax,
    taxableAmount: Number(tax.taxableAmount.toFixed(2)),
    taxAmount: Number(tax.taxAmount.toFixed(2))
  }))

  const totalTax = taxLines.reduce((sum, tax) => sum + tax.taxAmount, 0)
  
  const grandTotal = discountedSubtotal + serviceChargeAmount + totalTax

  return {
    subtotal: Number(subtotal.toFixed(2)),
    totalDiscount: Number(totalDiscount.toFixed(2)),
    serviceChargeAmount: Number(serviceChargeAmount.toFixed(2)),
    taxLines,
    totalTax: Number(totalTax.toFixed(2)),
    grandTotal: Number(grandTotal.toFixed(2))
  }
}

export function createLineItemFromFolioCharge(
  charge: FolioCharge,
  taxConfigurations: TaxConfiguration[],
  serviceChargeConfig?: ServiceChargeConfiguration
): InvoiceLineItem {
  const netAmount = charge.amount * charge.quantity
  const discountAmount = 0
  
  const taxable = !['advance-deposit', 'refund'].includes(charge.description.toLowerCase())
  const serviceChargeApplicable = charge.department === 'fnb'

  const lineItem: Partial<InvoiceLineItem> = {
    id: generateId(),
    folioChargeId: charge.id,
    date: charge.timestamp,
    itemType: mapDepartmentToItemType(charge.department),
    department: charge.department,
    description: charge.description,
    quantity: charge.quantity,
    unit: 'unit',
    unitPrice: charge.amount,
    lineTotal: netAmount,
    discountAmount,
    netAmount: netAmount - discountAmount,
    taxable,
    serviceChargeApplicable,
    serviceChargeAmount: 0,
    taxLines: [],
    totalTax: 0,
    lineGrandTotal: 0,
    postedBy: charge.postedBy,
    postedAt: charge.timestamp,
    isSplit: false,
    isVoided: false
  }

  lineItem.serviceChargeAmount = calculateServiceCharge(lineItem, serviceChargeConfig)
  lineItem.taxLines = calculateLineTaxes(lineItem, taxConfigurations, serviceChargeConfig)
  lineItem.totalTax = lineItem.taxLines.reduce((sum, tax) => sum + tax.taxAmount, 0)
  lineItem.lineGrandTotal = (lineItem.netAmount || 0) + (lineItem.serviceChargeAmount || 0) + lineItem.totalTax

  return lineItem as InvoiceLineItem
}

export function createLineItemFromExtraService(
  extraService: FolioExtraService,
  taxConfigurations: TaxConfiguration[],
  serviceChargeConfig?: ServiceChargeConfiguration
): InvoiceLineItem {
  const lineItem: Partial<InvoiceLineItem> = {
    id: generateId(),
    folioExtraServiceId: extraService.id,
    date: extraService.postedAt,
    itemType: 'extra-service',
    department: mapCategoryToDepartment(extraService.categoryName),
    description: `${extraService.serviceName} - ${extraService.categoryName}`,
    quantity: extraService.quantity,
    unit: 'service',
    unitPrice: extraService.unitPrice,
    lineTotal: extraService.quantity * extraService.unitPrice,
    discountAmount: 0,
    netAmount: extraService.quantity * extraService.unitPrice,
    taxable: true,
    serviceChargeApplicable: false,
    serviceChargeAmount: 0,
    taxLines: [],
    totalTax: 0,
    lineGrandTotal: 0,
    postedBy: extraService.postedBy,
    postedAt: extraService.postedAt,
    isSplit: false,
    isVoided: false
  }

  lineItem.serviceChargeAmount = calculateServiceCharge(lineItem, serviceChargeConfig)
  lineItem.taxLines = calculateLineTaxes(lineItem, taxConfigurations, serviceChargeConfig)
  lineItem.totalTax = lineItem.taxLines.reduce((sum, tax) => sum + tax.taxAmount, 0)
  lineItem.lineGrandTotal = (lineItem.netAmount || 0) + (lineItem.serviceChargeAmount || 0) + lineItem.totalTax

  return lineItem as InvoiceLineItem
}

function mapDepartmentToItemType(department: Department): InvoiceLineItem['itemType'] {
  const mapping: Record<Department, InvoiceLineItem['itemType']> = {
    'front-office': 'room-charge',
    'fnb': 'fnb-restaurant',
    'housekeeping': 'misc',
    'kitchen': 'fnb-restaurant',
    'engineering': 'misc',
    'finance': 'misc',
    'hr': 'misc',
    'admin': 'misc'
  }
  return mapping[department] || 'misc'
}

function mapCategoryToDepartment(categoryName: string): Department {
  const lowerCategory = categoryName.toLowerCase()
  if (lowerCategory.includes('spa')) return 'fnb'
  if (lowerCategory.includes('transport')) return 'front-office'
  if (lowerCategory.includes('laundry')) return 'housekeeping'
  return 'front-office'
}

export function validateInvoice(invoice: Partial<GuestInvoice>): InvoiceValidationResult {
  const errors: Array<{ field: string; message: string; severity: 'error' | 'warning' }> = []
  const warnings: Array<{ field: string; message: string; suggestion?: string }> = []

  if (!invoice.invoiceNumber) {
    errors.push({ field: 'invoiceNumber', message: 'Invoice number is required', severity: 'error' })
  }

  if (!invoice.guestName) {
    errors.push({ field: 'guestName', message: 'Guest name is required', severity: 'error' })
  }

  if (!invoice.lineItems || invoice.lineItems.length === 0) {
    errors.push({ field: 'lineItems', message: 'Invoice must have at least one line item', severity: 'error' })
  }

  const calculatedSubtotal = invoice.lineItems?.reduce((sum, item) => sum + item.lineTotal, 0) || 0
  if (Math.abs(calculatedSubtotal - (invoice.subtotal || 0)) > 0.01) {
    errors.push({ field: 'subtotal', message: 'Subtotal calculation mismatch', severity: 'error' })
  }

  const calculatedTax = invoice.lineItems?.reduce((sum, item) => sum + (item.totalTax || 0), 0) || 0
  if (Math.abs(calculatedTax - (invoice.totalTax || 0)) > 0.01) {
    errors.push({ field: 'totalTax', message: 'Tax calculation mismatch', severity: 'error' })
  }

  const calculatedGrandTotal = (invoice.subtotal || 0) - (invoice.totalDiscount || 0) + 
    (invoice.serviceChargeAmount || 0) + (invoice.totalTax || 0)
  if (Math.abs(calculatedGrandTotal - (invoice.grandTotal || 0)) > 0.01) {
    errors.push({ field: 'grandTotal', message: 'Grand total calculation mismatch', severity: 'error' })
  }

  const calculatedDue = (invoice.grandTotal || 0) - (invoice.totalPaid || 0)
  if (Math.abs(calculatedDue - (invoice.amountDue || 0)) > 0.01) {
    errors.push({ field: 'amountDue', message: 'Amount due calculation mismatch', severity: 'error' })
  }

  if (invoice.totalPaid && invoice.totalPaid > (invoice.grandTotal || 0)) {
    warnings.push({ 
      field: 'totalPaid', 
      message: 'Total paid exceeds grand total',
      suggestion: 'Review payments or issue credit note for overpayment'
    })
  }

  const lineItemValidations = (invoice.lineItems || []).map(item => {
    const itemErrors: string[] = []
    
    if (!item.description) itemErrors.push('Description is required')
    if (item.quantity <= 0) itemErrors.push('Quantity must be greater than 0')
    if (item.unitPrice < 0) itemErrors.push('Unit price cannot be negative')
    
    const calculatedLineTotal = item.quantity * item.unitPrice
    if (Math.abs(calculatedLineTotal - item.lineTotal) > 0.01) {
      itemErrors.push('Line total mismatch')
    }

    return {
      lineItemId: item.id,
      isValid: itemErrors.length === 0,
      errors: itemErrors
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    lineItemValidations,
    taxCalculationVerified: Math.abs(calculatedTax - (invoice.totalTax || 0)) <= 0.01,
    totalCalculationVerified: Math.abs(calculatedGrandTotal - (invoice.grandTotal || 0)) <= 0.01,
    paymentBalanceVerified: Math.abs(calculatedDue - (invoice.amountDue || 0)) <= 0.01
  }
}

export function createInvoiceAuditEntry(
  action: InvoiceAuditEntry['action'],
  description: string,
  performedBy: string,
  beforeSnapshot?: any,
  afterSnapshot?: any
): InvoiceAuditEntry {
  return {
    id: generateId(),
    action,
    description,
    performedBy,
    performedAt: Date.now(),
    beforeSnapshot,
    afterSnapshot
  }
}

export function createGLEntriesForInvoice(invoice: GuestInvoice): GLEntry[] {
  const entries: GLEntry[] = []
  const now = Date.now()

  entries.push({
    accountCode: '1200',
    accountName: 'Accounts Receivable',
    debit: invoice.grandTotal,
    credit: 0,
    description: `Guest Invoice ${invoice.invoiceNumber}`,
    postingDate: now,
    reference: invoice.invoiceNumber
  })

  const revenuByDepartment: Record<string, number> = {}
  
  for (const lineItem of invoice.lineItems) {
    const dept = lineItem.department
    if (!revenuByDepartment[dept]) {
      revenuByDepartment[dept] = 0
    }
    revenuByDepartment[dept] += lineItem.netAmount
  }

  const departmentAccounts: Record<Department, { code: string; name: string }> = {
    'front-office': { code: '4100', name: 'Room Revenue' },
    'fnb': { code: '4200', name: 'F&B Revenue' },
    'housekeeping': { code: '4300', name: 'Other Revenue' },
    'kitchen': { code: '4200', name: 'F&B Revenue' },
    'engineering': { code: '4300', name: 'Other Revenue' },
    'finance': { code: '4300', name: 'Other Revenue' },
    'hr': { code: '4300', name: 'Other Revenue' },
    'admin': { code: '4300', name: 'Other Revenue' }
  }

  for (const [dept, amount] of Object.entries(revenuByDepartment)) {
    const account = departmentAccounts[dept as Department] || { code: '4300', name: 'Other Revenue' }
    entries.push({
      accountCode: account.code,
      accountName: account.name,
      debit: 0,
      credit: amount,
      description: `${dept} charges - Invoice ${invoice.invoiceNumber}`,
      postingDate: now,
      reference: invoice.invoiceNumber
    })
  }

  if (invoice.serviceChargeAmount > 0) {
    entries.push({
      accountCode: '4500',
      accountName: 'Service Charge Revenue',
      debit: 0,
      credit: invoice.serviceChargeAmount,
      description: `Service Charge - Invoice ${invoice.invoiceNumber}`,
      postingDate: now,
      reference: invoice.invoiceNumber
    })
  }

  if (invoice.totalTax > 0) {
    entries.push({
      accountCode: '2300',
      accountName: 'Tax Payable',
      debit: 0,
      credit: invoice.totalTax,
      description: `Tax Collected - Invoice ${invoice.invoiceNumber}`,
      postingDate: now,
      reference: invoice.invoiceNumber
    })
  }

  return entries
}

export function generateInvoicePDF(
  invoice: GuestInvoice,
  hotelInfo: {
    name: string
    address: string
    phone: string
    email: string
    website?: string
    taxRegistrationNumber?: string
    logo?: string
  }
): string {
  return `data:text/html,<html><body><h1>Invoice ${invoice.invoiceNumber}</h1><p>PDF generation placeholder</p></body></html>`
}

export function formatInvoiceForEmail(
  invoice: GuestInvoice,
  hotelInfo: {
    name: string
    address: string
    phone: string
    email: string
  }
): { subject: string; body: string; htmlBody: string } {
  const subject = `Invoice ${invoice.invoiceNumber} from ${hotelInfo.name}`
  
  const body = `
Dear ${invoice.guestName},

Thank you for staying with us at ${hotelInfo.name}.

Please find attached your invoice ${invoice.invoiceNumber}.

Invoice Summary:
- Invoice Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}
- Amount: ${formatCurrency(invoice.grandTotal)}
- Amount Paid: ${formatCurrency(invoice.totalPaid)}
- Balance Due: ${formatCurrency(invoice.amountDue)}

${invoice.paymentInstructions || ''}

If you have any questions, please contact us at ${hotelInfo.email} or ${hotelInfo.phone}.

Best regards,
${hotelInfo.name}
  `.trim()

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
<style>
body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 600px; margin: 0 auto; padding: 20px; }
.header { background: #f8f9fa; padding: 20px; border-bottom: 3px solid #007bff; }
.summary { background: #fff; padding: 20px; margin: 20px 0; border: 1px solid #ddd; }
.amount { font-size: 24px; font-weight: bold; color: #007bff; }
.footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h2>Invoice ${invoice.invoiceNumber}</h2>
    <p>${hotelInfo.name}</p>
  </div>
  
  <div class="summary">
    <p>Dear ${invoice.guestName},</p>
    <p>Thank you for staying with us. Here is your invoice summary:</p>
    
    <table width="100%" style="margin: 20px 0;">
      <tr>
        <td>Invoice Date:</td>
        <td><strong>${new Date(invoice.invoiceDate).toLocaleDateString()}</strong></td>
      </tr>
      <tr>
        <td>Total Amount:</td>
        <td class="amount">${formatCurrency(invoice.grandTotal)}</td>
      </tr>
      <tr>
        <td>Amount Paid:</td>
        <td><strong>${formatCurrency(invoice.totalPaid)}</strong></td>
      </tr>
      <tr>
        <td>Balance Due:</td>
        <td class="amount">${formatCurrency(invoice.amountDue)}</td>
      </tr>
    </table>
    
    ${invoice.paymentInstructions ? `<p style="background: #fff3cd; padding: 10px; border-left: 3px solid #ffc107;">${invoice.paymentInstructions}</p>` : ''}
  </div>
  
  <div class="footer">
    <p>If you have any questions, please contact us:</p>
    <p>Email: ${hotelInfo.email}<br>Phone: ${hotelInfo.phone}</p>
    <p>Best regards,<br>${hotelInfo.name}</p>
  </div>
</div>
</body>
</html>
  `.trim()

  return { subject, body, htmlBody }
}
