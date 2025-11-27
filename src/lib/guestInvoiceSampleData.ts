import type { GuestInvoice, InvoiceLineItem, TaxConfiguration, ServiceChargeConfiguration } from './types'
import { generateId, generateNumber } from './helpers'

export const sampleTaxConfigurations: TaxConfiguration[] = [
  {
    id: generateId(),
    name: 'GST',
    type: 'gst',
    rate: 12,
    isInclusive: false,
    isActive: true,
    isCompoundTax: false,
    appliesTo: ['front-office', 'fnb', 'housekeeping'],
    calculationOrder: 1,
    taxableOnServiceCharge: true,
    registrationNumber: 'GST123456789',
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: generateId(),
    name: 'Service Tax',
    type: 'service-charge',
    rate: 10,
    isInclusive: false,
    isActive: true,
    isCompoundTax: false,
    appliesTo: ['fnb'],
    calculationOrder: 2,
    taxableOnServiceCharge: false,
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  }
]

export const sampleServiceChargeConfig: ServiceChargeConfiguration = {
  id: generateId(),
  rate: 10,
  isActive: true,
  appliesTo: ['fnb'],
  isTaxable: true,
  distributionRules: {
    staffPercentage: 60,
    housePercentage: 40
  },
  createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
  updatedAt: Date.now()
}

export const sampleGuestInvoices: GuestInvoice[] = [
  {
    id: generateId(),
    invoiceNumber: 'INV-2024-001',
    invoiceType: 'guest-folio',
    status: 'final',
    folioIds: [generateId()],
    reservationIds: [generateId()],
    guestId: generateId(),
    guestName: 'John Smith',
    guestAddress: '123 Main Street, New York, NY 10001',
    guestEmail: 'john.smith@email.com',
    guestPhone: '+1 (555) 123-4567',
    roomNumber: '301',
    checkInDate: Date.now() - 5 * 24 * 60 * 60 * 1000,
    checkOutDate: Date.now() - 2 * 24 * 60 * 60 * 1000,
    invoiceDate: Date.now() - 2 * 24 * 60 * 60 * 1000,
    dueDate: Date.now() + 28 * 24 * 60 * 60 * 1000,
    currency: 'USD',
    exchangeRate: 1,
    lineItems: [
      {
        id: generateId(),
        date: Date.now() - 5 * 24 * 60 * 60 * 1000,
        itemType: 'room-charge',
        department: 'front-office',
        description: 'Deluxe Room - 3 Nights',
        quantity: 3,
        unit: 'night',
        unitPrice: 250,
        lineTotal: 750,
        discountAmount: 0,
        netAmount: 750,
        taxable: true,
        serviceChargeApplicable: false,
        serviceChargeAmount: 0,
        taxLines: [
          {
            taxType: 'gst',
            taxName: 'GST',
            taxRate: 12,
            taxableAmount: 750,
            taxAmount: 90,
            isInclusive: false
          }
        ],
        totalTax: 90,
        lineGrandTotal: 840,
        postedBy: 'user-001',
        postedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
        isSplit: false,
        isVoided: false
      },
      {
        id: generateId(),
        date: Date.now() - 4 * 24 * 60 * 60 * 1000,
        itemType: 'fnb-restaurant',
        department: 'fnb',
        description: 'Dinner - Main Restaurant',
        quantity: 1,
        unit: 'meal',
        unitPrice: 85,
        lineTotal: 85,
        discountAmount: 0,
        netAmount: 85,
        taxable: true,
        serviceChargeApplicable: true,
        serviceChargeAmount: 8.5,
        taxLines: [
          {
            taxType: 'gst',
            taxName: 'GST',
            taxRate: 12,
            taxableAmount: 93.5,
            taxAmount: 11.22,
            isInclusive: false
          }
        ],
        totalTax: 11.22,
        lineGrandTotal: 104.72,
        postedBy: 'user-001',
        postedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
        isSplit: false,
        isVoided: false
      },
      {
        id: generateId(),
        date: Date.now() - 3 * 24 * 60 * 60 * 1000,
        itemType: 'laundry',
        department: 'housekeeping',
        description: 'Laundry Service',
        quantity: 1,
        unit: 'service',
        unitPrice: 35,
        lineTotal: 35,
        discountAmount: 0,
        netAmount: 35,
        taxable: true,
        serviceChargeApplicable: false,
        serviceChargeAmount: 0,
        taxLines: [
          {
            taxType: 'gst',
            taxName: 'GST',
            taxRate: 12,
            taxableAmount: 35,
            taxAmount: 4.2,
            isInclusive: false
          }
        ],
        totalTax: 4.2,
        lineGrandTotal: 39.2,
        postedBy: 'user-001',
        postedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        isSplit: false,
        isVoided: false
      }
    ],
    subtotal: 870,
    discounts: [],
    totalDiscount: 0,
    serviceChargeRate: 10,
    serviceChargeAmount: 8.5,
    taxLines: [
      {
        taxType: 'gst',
        taxName: 'GST',
        taxRate: 12,
        taxableAmount: 878.5,
        taxAmount: 105.42,
        isInclusive: false
      }
    ],
    totalTax: 105.42,
    grandTotal: 983.92,
    payments: [
      {
        id: generateId(),
        paymentDate: Date.now() - 2 * 24 * 60 * 60 * 1000,
        paymentType: 'card',
        amount: 983.92,
        currency: 'USD',
        exchangeRate: 1,
        amountInBaseCurrency: 983.92,
        reference: 'CARD-****-1234',
        cardType: 'Visa',
        cardLast4: '1234',
        receivedBy: 'user-001',
        receivedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        isRefunded: false
      }
    ],
    totalPaid: 983.92,
    amountDue: 0,
    creditNotes: [],
    debitNotes: [],
    prepayments: [],
    netAmountDue: 0,
    isPostedToAccounts: true,
    postedToAccountsBy: 'user-001',
    postedToAccountsAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    deliveryMethods: [
      {
        method: 'email',
        status: 'emailed',
        recipient: 'john.smith@email.com',
        attemptedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        deliveredAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        retryCount: 0,
        deliveredBy: 'user-001'
      },
      {
        method: 'print',
        status: 'printed',
        attemptedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        deliveredAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        retryCount: 0,
        deliveredBy: 'user-001'
      }
    ],
    emailDeliveryStatus: 'emailed',
    emailDeliveredAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    printedBy: 'user-001',
    printedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    auditTrail: [
      {
        id: generateId(),
        action: 'created',
        description: 'Invoice created from guest folio',
        performedBy: 'user-001',
        performedAt: Date.now() - 2 * 24 * 60 * 60 * 1000
      },
      {
        id: generateId(),
        action: 'finalized',
        description: 'Invoice finalized and posted to accounts',
        performedBy: 'user-001',
        performedAt: Date.now() - 2 * 24 * 60 * 60 * 1000
      },
      {
        id: generateId(),
        action: 'payment-received',
        description: 'Payment received via credit card',
        performedBy: 'user-001',
        performedAt: Date.now() - 2 * 24 * 60 * 60 * 1000
      }
    ],
    isGroupMaster: false,
    isTaxExempt: false,
    paymentInstructions: 'Payment due within 30 days. Please reference invoice number when making payment.',
    termsAndConditions: 'All charges are non-refundable unless otherwise stated. Late payment may incur additional charges.',
    createdBy: 'user-001',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    finalizedBy: 'user-001',
    finalizedAt: Date.now() - 2 * 24 * 60 * 60 * 1000
  },
  {
    id: generateId(),
    invoiceNumber: 'INV-2024-002',
    invoiceType: 'guest-folio',
    status: 'final',
    folioIds: [generateId()],
    reservationIds: [generateId()],
    guestId: generateId(),
    guestName: 'Sarah Johnson',
    guestEmail: 'sarah.j@email.com',
    guestPhone: '+1 (555) 987-6543',
    roomNumber: '215',
    checkInDate: Date.now() - 2 * 24 * 60 * 60 * 1000,
    checkOutDate: Date.now(),
    invoiceDate: Date.now(),
    dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
    currency: 'USD',
    exchangeRate: 1,
    lineItems: [
      {
        id: generateId(),
        date: Date.now() - 2 * 24 * 60 * 60 * 1000,
        itemType: 'room-charge',
        department: 'front-office',
        description: 'Standard Room - 2 Nights',
        quantity: 2,
        unit: 'night',
        unitPrice: 180,
        lineTotal: 360,
        discountAmount: 0,
        netAmount: 360,
        taxable: true,
        serviceChargeApplicable: false,
        serviceChargeAmount: 0,
        taxLines: [
          {
            taxType: 'gst',
            taxName: 'GST',
            taxRate: 12,
            taxableAmount: 360,
            taxAmount: 43.2,
            isInclusive: false
          }
        ],
        totalTax: 43.2,
        lineGrandTotal: 403.2,
        postedBy: 'user-001',
        postedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        isSplit: false,
        isVoided: false
      }
    ],
    subtotal: 360,
    discounts: [],
    totalDiscount: 0,
    serviceChargeRate: 0,
    serviceChargeAmount: 0,
    taxLines: [
      {
        taxType: 'gst',
        taxName: 'GST',
        taxRate: 12,
        taxableAmount: 360,
        taxAmount: 43.2,
        isInclusive: false
      }
    ],
    totalTax: 43.2,
    grandTotal: 403.2,
    payments: [],
    totalPaid: 0,
    amountDue: 403.2,
    creditNotes: [],
    debitNotes: [],
    prepayments: [],
    netAmountDue: 403.2,
    isPostedToAccounts: true,
    postedToAccountsBy: 'user-001',
    postedToAccountsAt: Date.now(),
    deliveryMethods: [],
    auditTrail: [
      {
        id: generateId(),
        action: 'created',
        description: 'Invoice created from guest folio',
        performedBy: 'user-001',
        performedAt: Date.now()
      }
    ],
    isGroupMaster: false,
    isTaxExempt: false,
    paymentInstructions: 'Payment due within 30 days.',
    createdBy: 'user-001',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    finalizedBy: 'user-001',
    finalizedAt: Date.now()
  },
  {
    id: generateId(),
    invoiceNumber: 'INV-2024-003',
    invoiceType: 'guest-folio',
    status: 'draft',
    folioIds: [generateId()],
    reservationIds: [generateId()],
    guestId: generateId(),
    guestName: 'Michael Brown',
    guestEmail: 'mbrown@email.com',
    guestPhone: '+1 (555) 456-7890',
    companyName: 'Brown Enterprises Inc.',
    companyGSTNumber: 'GST-987654321',
    roomNumber: '412',
    checkInDate: Date.now() - 1 * 24 * 60 * 60 * 1000,
    checkOutDate: Date.now() + 2 * 24 * 60 * 60 * 1000,
    invoiceDate: Date.now(),
    currency: 'USD',
    exchangeRate: 1,
    lineItems: [
      {
        id: generateId(),
        date: Date.now() - 1 * 24 * 60 * 60 * 1000,
        itemType: 'room-charge',
        department: 'front-office',
        description: 'Executive Suite - 3 Nights',
        quantity: 3,
        unit: 'night',
        unitPrice: 450,
        lineTotal: 1350,
        discountAmount: 135,
        netAmount: 1215,
        taxable: true,
        serviceChargeApplicable: false,
        serviceChargeAmount: 0,
        taxLines: [
          {
            taxType: 'gst',
            taxName: 'GST',
            taxRate: 12,
            taxableAmount: 1215,
            taxAmount: 145.8,
            isInclusive: false
          }
        ],
        totalTax: 145.8,
        lineGrandTotal: 1360.8,
        postedBy: 'user-001',
        postedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        isSplit: false,
        isVoided: false
      }
    ],
    subtotal: 1350,
    discounts: [
      {
        id: generateId(),
        type: 'percentage',
        scope: 'line-item',
        description: 'Corporate discount - 10%',
        value: 10,
        amount: 135,
        appliedBy: 'user-001',
        appliedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        approvalRequired: false
      }
    ],
    totalDiscount: 135,
    serviceChargeRate: 0,
    serviceChargeAmount: 0,
    taxLines: [
      {
        taxType: 'gst',
        taxName: 'GST',
        taxRate: 12,
        taxableAmount: 1215,
        taxAmount: 145.8,
        isInclusive: false
      }
    ],
    totalTax: 145.8,
    grandTotal: 1360.8,
    payments: [],
    totalPaid: 0,
    amountDue: 1360.8,
    creditNotes: [],
    debitNotes: [],
    prepayments: [],
    netAmountDue: 1360.8,
    isPostedToAccounts: false,
    deliveryMethods: [],
    auditTrail: [
      {
        id: generateId(),
        action: 'created',
        description: 'Invoice created from guest folio',
        performedBy: 'user-001',
        performedAt: Date.now()
      },
      {
        id: generateId(),
        action: 'discount-applied',
        description: 'Corporate discount applied - 10%',
        performedBy: 'user-001',
        performedAt: Date.now()
      }
    ],
    isGroupMaster: false,
    isTaxExempt: false,
    specialInstructions: 'Corporate billing - invoice to be sent to company address',
    paymentInstructions: 'Net 30 payment terms as per corporate agreement.',
    createdBy: 'user-001',
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
]
