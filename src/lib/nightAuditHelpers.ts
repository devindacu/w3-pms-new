import { 
  NightAuditLog, 
  NightAuditOperation, 
  AuditError, 
  AuditWarning,
  Folio,
  FolioCharge,
  Room,
  Reservation,
  GuestInvoice,
  InvoiceLineItem,
  LineTaxDetail,
  InvoiceTaxLine,
  InvoiceNumberSequence,
  Payment,
  TaxConfiguration,
  ServiceChargeConfiguration,
  GLEntry,
  Department,
  PaymentType
} from './types'

// Helper to create a complete GLEntry object
function createGLEntry(params: {
  accountCode: string
  accountName: string
  debit: number
  credit: number
  description: string
  postingDate: number
  reference: string
  createdBy?: string
}): GLEntry {
  const journalId = `JE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const lineId = `GL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const fiscalYear = new Date(params.postingDate).getFullYear().toString()
  const fiscalPeriod = `${fiscalYear}-${String(new Date(params.postingDate).getMonth() + 1).padStart(2, '0')}`
  
  return {
    id: lineId,
    journalEntryId: journalId,
    journalNumber: `JNL-${Date.now()}`,
    lineId,
    accountId: params.accountCode,
    accountCode: params.accountCode,
    accountName: params.accountName,
    transactionDate: params.postingDate,
    postingDate: params.postingDate,
    fiscalPeriod,
    fiscalYear,
    debit: params.debit,
    credit: params.credit,
    balance: params.debit - params.credit,
    runningBalance: params.debit - params.credit,
    description: params.description,
    source: 'system',
    sourceDocumentId: undefined,
    sourceDocumentNumber: params.reference,
    costCenter: undefined,
    department: undefined,
    createdBy: params.createdBy || 'system',
    createdAt: Date.now()
  }
}

export interface NightAuditConfig {
  postRoomCharges: boolean
  postFnBCharges: boolean
  postExtraCharges: boolean
  closeFolios: boolean
  generateInvoices: boolean
  reconcilePayments: boolean
  updateInventory: boolean
  rotateInvoiceNumbers: boolean
  generateReports: boolean
  auditDate: number
}

export interface RoomChargePosting {
  folioId: string
  roomId: string
  roomNumber: string
  nights: number
  ratePerNight: number
  totalCharge: number
  guestName: string
}

export interface PostingResult {
  success: boolean
  recordsProcessed: number
  errors: string[]
  charges?: FolioCharge[]
}

export function getAuditPeriod(auditDate: number): { start: number; end: number } {
  const date = new Date(auditDate)
  date.setHours(0, 0, 0, 0)
  const start = date.getTime()
  
  const endDate = new Date(date)
  endDate.setDate(endDate.getDate() + 1)
  const end = endDate.getTime()
  
  return { start, end }
}

export function calculateRoomCharges(
  folios: Folio[],
  reservations: Reservation[],
  rooms: Room[],
  auditDate: number
): RoomChargePosting[] {
  const postings: RoomChargePosting[] = []
  const { start, end } = getAuditPeriod(auditDate)
  
  folios.forEach(folio => {
    const reservation = reservations.find(r => r.id === folio.reservationId)
    if (!reservation || reservation.status !== 'checked-in') return
    
    const room = rooms.find(r => r.id === reservation.roomId)
    if (!room) return
    
    const lastCharge = folio.charges
      .filter(c => c.department === 'front-office' && c.description.includes('Room Charge'))
      .sort((a, b) => b.timestamp - a.timestamp)[0]
    
    const lastChargeDate = lastCharge ? new Date(lastCharge.timestamp) : new Date(reservation.checkInDate)
    lastChargeDate.setHours(0, 0, 0, 0)
    const auditDateOnly = new Date(auditDate)
    auditDateOnly.setHours(0, 0, 0, 0)
    
    if (lastChargeDate.getTime() < auditDateOnly.getTime()) {
      postings.push({
        folioId: folio.id,
        roomId: room.id,
        roomNumber: room.roomNumber,
        nights: 1,
        ratePerNight: reservation.ratePerNight,
        totalCharge: reservation.ratePerNight,
        guestName: `${reservation.id}`
      })
    }
  })
  
  return postings
}

export function postRoomChargesToFolios(
  folios: Folio[],
  roomCharges: RoomChargePosting[],
  auditDate: number,
  userId: string
): { updatedFolios: Folio[]; charges: FolioCharge[] } {
  const updatedFolios = [...folios]
  const newCharges: FolioCharge[] = []
  
  roomCharges.forEach(posting => {
    const folioIndex = updatedFolios.findIndex(f => f.id === posting.folioId)
    if (folioIndex === -1) return
    
    const charge: FolioCharge = {
      id: `charge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      folioId: posting.folioId,
      description: `Room Charge - ${posting.roomNumber}`,
      amount: posting.totalCharge,
      quantity: posting.nights,
      department: 'front-office',
      timestamp: auditDate,
      postedBy: userId
    }
    
    updatedFolios[folioIndex] = {
      ...updatedFolios[folioIndex],
      charges: [...updatedFolios[folioIndex].charges, charge],
      balance: updatedFolios[folioIndex].balance + posting.totalCharge,
      updatedAt: auditDate
    }
    
    newCharges.push(charge)
  })
  
  return { updatedFolios, charges: newCharges }
}

export function calculateInvoiceTaxes(
  lineItems: InvoiceLineItem[],
  taxes: TaxConfiguration[],
  serviceCharge: ServiceChargeConfiguration | null
): {
  lineItemsWithTax: InvoiceLineItem[]
  taxLines: InvoiceTaxLine[]
  totalTax: number
  totalServiceCharge: number
} {
  const activeTaxes = taxes.filter(t => t.isActive)
  const taxMap = new Map<string, { taxType: any; taxName: string; taxRate: number; taxableAmount: number; taxAmount: number; isInclusive: boolean; breakdown: any[] }>()
  
  let totalServiceChargeAmount = 0
  
  const lineItemsWithTax = lineItems.map(item => {
    const lineTaxes: LineTaxDetail[] = []
    let lineServiceCharge = 0
    let lineTotalTax = 0
    
    if (item.serviceChargeApplicable && serviceCharge?.isActive) {
      const scRate = serviceCharge.rate / 100
      lineServiceCharge = item.netAmount * scRate
      totalServiceChargeAmount += lineServiceCharge
    }
    
    const taxableAmount = item.netAmount + lineServiceCharge
    
    if (item.taxable) {
      activeTaxes
        .filter(tax => tax.appliesTo.includes(item.department))
        .sort((a, b) => a.calculationOrder - b.calculationOrder)
        .forEach(tax => {
          const taxRate = tax.rate / 100
          const thisTaxableAmount = tax.taxableOnServiceCharge ? taxableAmount : item.netAmount
          const taxAmount = thisTaxableAmount * taxRate
          
          lineTaxes.push({
            taxType: tax.type,
            taxName: tax.name,
            taxRate: tax.rate,
            taxableAmount: thisTaxableAmount,
            taxAmount,
            isInclusive: tax.isInclusive
          })
          
          lineTotalTax += taxAmount
          
          const key = `${tax.type}-${tax.name}`
          const existing = taxMap.get(key)
          if (existing) {
            existing.taxableAmount += thisTaxableAmount
            existing.taxAmount += taxAmount
            existing.breakdown.push({
              lineItemId: item.id,
              description: item.description,
              taxableAmount: thisTaxableAmount,
              taxAmount
            })
          } else {
            taxMap.set(key, {
              taxType: tax.type,
              taxName: tax.name,
              taxRate: tax.rate,
              taxableAmount: thisTaxableAmount,
              taxAmount,
              isInclusive: tax.isInclusive,
              breakdown: [{
                lineItemId: item.id,
                description: item.description,
                taxableAmount: thisTaxableAmount,
                taxAmount
              }]
            })
          }
        })
    }
    
    return {
      ...item,
      serviceChargeAmount: lineServiceCharge,
      taxLines: lineTaxes,
      totalTax: lineTotalTax,
      lineGrandTotal: item.netAmount + lineServiceCharge + lineTotalTax
    }
  })
  
  const taxLines: InvoiceTaxLine[] = Array.from(taxMap.values())
  const totalTax = taxLines.reduce((sum, tax) => sum + tax.taxAmount, 0)
  
  return {
    lineItemsWithTax,
    taxLines,
    totalTax,
    totalServiceCharge: totalServiceChargeAmount
  }
}

export function generateInvoiceFromFolio(
  folio: Folio,
  reservation: Reservation,
  guestName: string,
  invoiceNumber: string,
  taxes: TaxConfiguration[],
  serviceCharge: ServiceChargeConfiguration | null,
  userId: string,
  auditDate: number
): GuestInvoice {
  const lineItems: InvoiceLineItem[] = folio.charges.map(charge => ({
    id: `line-${charge.id}`,
    folioChargeId: charge.id,
    date: charge.timestamp,
    itemType: charge.department === 'front-office' ? 'room-charge' : 
               charge.department === 'fnb' ? 'fnb-restaurant' : 'extra-service',
    department: charge.department,
    description: charge.description,
    quantity: charge.quantity,
    unit: 'ea',
    unitPrice: charge.amount / charge.quantity,
    lineTotal: charge.amount,
    netAmount: charge.amount,
    taxable: true,
    serviceChargeApplicable: charge.department === 'fnb',
    serviceChargeAmount: 0,
    taxLines: [],
    totalTax: 0,
    lineGrandTotal: 0,
    postedBy: charge.postedBy,
    postedAt: charge.timestamp,
    isSplit: false,
    isVoided: false
  }))
  
  const subtotal = lineItems.reduce((sum, item) => sum + item.netAmount, 0)
  
  const { lineItemsWithTax, taxLines, totalTax, totalServiceCharge } = calculateInvoiceTaxes(
    lineItems,
    taxes,
    serviceCharge
  )
  
  const grandTotal = subtotal + totalServiceCharge + totalTax
  
  const paymentRecords = folio.payments.map(payment => ({
    id: payment.id,
    paymentDate: payment.timestamp,
    paymentType: (payment.method === 'credit' ? 'corporate-billing' : payment.method) as PaymentType,
    amount: payment.amount,
    currency: 'USD',
    exchangeRate: 1,
    amountInBaseCurrency: payment.amount,
    reference: payment.reference,
    receivedBy: payment.receivedBy,
    receivedAt: payment.timestamp,
    isRefunded: false
  }))
  
  const totalPaid = paymentRecords.reduce((sum, p) => sum + p.amount, 0)
  const amountDue = grandTotal - totalPaid
  
  const invoice: GuestInvoice = {
    id: `invoice-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    invoiceNumber,
    invoiceType: 'guest-folio',
    status: 'final',
    folioIds: [folio.id],
    reservationIds: [reservation.id],
    guestId: folio.guestId,
    guestName,
    invoiceDate: auditDate,
    currency: 'USD',
    exchangeRate: 1,
    lineItems: lineItemsWithTax,
    subtotal,
    discounts: [],
    totalDiscount: 0,
    serviceChargeRate: serviceCharge?.rate || 0,
    serviceChargeAmount: totalServiceCharge,
    taxLines,
    totalTax,
    grandTotal,
    payments: paymentRecords,
    totalPaid,
    amountDue,
    creditNotes: [],
    debitNotes: [],
    prepayments: [],
    netAmountDue: amountDue,
    isPostedToAccounts: false,
    deliveryMethods: [],
    auditTrail: [{
      id: `audit-${Date.now()}`,
      action: 'created',
      description: 'Invoice created during night audit',
      performedBy: userId,
      performedAt: auditDate
    }],
    isGroupMaster: false,
    isTaxExempt: false,
    createdBy: userId,
    createdAt: auditDate,
    updatedAt: auditDate
  }
  
  return invoice
}

export function generateGLEntries(
  invoice: GuestInvoice,
  chartOfAccounts: any[]
): GLEntry[] {
  const entries: GLEntry[] = []
  const reference = invoice.invoiceNumber
  const postingDate = invoice.invoiceDate
  
  entries.push(createGLEntry({
    accountCode: '1200',
    accountName: 'Accounts Receivable',
    debit: invoice.grandTotal,
    credit: 0,
    description: `Guest invoice ${invoice.invoiceNumber}`,
    postingDate,
    reference
  }))
  
  const revenueByDept = invoice.lineItems.reduce((acc, item) => {
    if (!acc[item.department]) acc[item.department] = 0
    acc[item.department] += item.netAmount
    return acc
  }, {} as Record<Department, number>)
  
  Object.entries(revenueByDept).forEach(([dept, amount]) => {
    const accountCode = dept === 'front-office' ? '4100' :
                       dept === 'fnb' ? '4200' : '4300'
    const accountName = dept === 'front-office' ? 'Room Revenue' :
                       dept === 'fnb' ? 'F&B Revenue' : 'Other Revenue'
    
    entries.push(createGLEntry({
      accountCode,
      accountName,
      debit: 0,
      credit: amount,
      description: `${accountName} - ${invoice.invoiceNumber}`,
      postingDate,
      reference
    }))
  })
  
  if (invoice.serviceChargeAmount > 0) {
    entries.push(createGLEntry({
      accountCode: '2300',
      accountName: 'Service Charge Payable',
      debit: 0,
      credit: invoice.serviceChargeAmount,
      description: `Service Charge - ${invoice.invoiceNumber}`,
      postingDate,
      reference
    }))
  }
  
  if (invoice.totalTax > 0) {
    invoice.taxLines.forEach(taxLine => {
      const taxAccountCode = taxLine.taxType === 'vat' ? '2100' :
                            taxLine.taxType === 'gst' ? '2110' : '2120'
      const taxAccountName = `${taxLine.taxName} Payable`
      
      entries.push(createGLEntry({
        accountCode: taxAccountCode,
        accountName: taxAccountName,
        debit: 0,
        credit: taxLine.taxAmount,
        description: `${taxLine.taxName} - ${invoice.invoiceNumber}`,
        postingDate,
        reference
      }))
    })
  }
  
  return entries
}

export function reconcilePayments(
  payments: Payment[],
  invoices: GuestInvoice[],
  auditDate: number
): { reconciledCount: number; errors: string[] } {
  let reconciledCount = 0
  const errors: string[] = []
  
  payments.forEach(payment => {
    if (payment.reconciled) return
    
    if (payment.invoiceId) {
      const invoice = invoices.find(inv => inv.id === payment.invoiceId)
      if (invoice) {
        reconciledCount++
      } else {
        errors.push(`Payment ${payment.paymentNumber} references non-existent invoice`)
      }
    }
  })
  
  return { reconciledCount, errors }
}

export function getNextInvoiceNumber(
  sequence: InvoiceNumberSequence,
  auditDate: number
): { number: string; updatedSequence: InvoiceNumberSequence } {
  const shouldReset = shouldResetSequence(sequence, auditDate)
  
  const currentNumber = shouldReset ? 1 : sequence.currentNumber + 1
  const paddedNumber = currentNumber.toString().padStart(sequence.paddingLength, '0')
  const invoiceNumber = `${sequence.prefix}${paddedNumber}${sequence.suffix || ''}`
  
  const updatedSequence: InvoiceNumberSequence = {
    ...sequence,
    currentNumber,
    lastResetDate: shouldReset ? auditDate : sequence.lastResetDate,
    nextResetDate: calculateNextResetDate(sequence, auditDate),
    updatedAt: auditDate
  }
  
  return { number: invoiceNumber, updatedSequence }
}

function shouldResetSequence(sequence: InvoiceNumberSequence, date: number): boolean {
  if (sequence.resetPeriod === 'never') return false
  if (!sequence.nextResetDate) return false
  return date >= sequence.nextResetDate
}

function calculateNextResetDate(sequence: InvoiceNumberSequence, fromDate: number): number | undefined {
  if (sequence.resetPeriod === 'never') return undefined
  
  const date = new Date(fromDate)
  
  switch (sequence.resetPeriod) {
    case 'daily':
      date.setDate(date.getDate() + 1)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      date.setDate(1)
      break
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1)
      date.setMonth(0)
      date.setDate(1)
      break
    case 'financial-year': {
      const currentMonth = date.getMonth()
      if (currentMonth < 3) {
        date.setMonth(3)
      } else {
        date.setFullYear(date.getFullYear() + 1)
        date.setMonth(3)
      }
      date.setDate(1)
      break
    }
  }
  
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export function validateAuditData(
  folios: Folio[],
  reservations: Reservation[],
  rooms: Room[]
): { errors: AuditError[]; warnings: AuditWarning[] } {
  const errors: AuditError[] = []
  const warnings: AuditWarning[] = []
  
  folios.forEach(folio => {
    const reservation = reservations.find(r => r.id === folio.reservationId)
    if (!reservation) {
      errors.push({
        id: `error-${Date.now()}-${Math.random()}`,
        errorType: 'missing-reservation',
        message: `Folio ${folio.id} references non-existent reservation`,
        resourceType: 'folio',
        resourceId: folio.id,
        severity: 'high',
        requiresAction: true
      })
    }
    
    if (folio.balance < 0) {
      warnings.push({
        id: `warning-${Date.now()}-${Math.random()}`,
        warningType: 'negative-balance',
        message: `Folio ${folio.id} has negative balance`,
        resourceType: 'folio',
        resourceId: folio.id
      })
    }
    
    if (reservation && reservation.roomId) {
      const room = rooms.find(r => r.id === reservation.roomId)
      if (!room) {
        errors.push({
          id: `error-${Date.now()}-${Math.random()}`,
          errorType: 'missing-room',
          message: `Reservation ${reservation.id} references non-existent room`,
          resourceType: 'reservation',
          resourceId: reservation.id,
          severity: 'medium',
          requiresAction: true
        })
      }
    }
  })
  
  return { errors, warnings }
}
