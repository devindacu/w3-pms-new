import type { GuestInvoice, InvoiceLineItem, TaxConfiguration, ServiceChargeConfiguration } from './types'
import { generateId, generateNumber } from './helpers'

export const sampleTaxConfigurations: TaxConfiguration[] = [
  {
    id: generateId(),
    name: 'VAT',
    type: 'vat',
    rate: 15,
    isInclusive: false,
    isActive: true,
    isCompoundTax: false,
    appliesTo: ['front-office', 'fnb', 'housekeeping', 'kitchen', 'engineering', 'finance', 'hr', 'admin'],
    calculationOrder: 1,
    taxableOnServiceCharge: true,
    registrationNumber: 'VAT-LK-123456789',
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
    id: 'invoice-1',
    invoiceNumber: 'INV-2024-001',
    invoiceType: 'guest-folio',
    status: 'final',
    folioIds: ['folio-1'],
    reservationIds: ['res-1'],
    guestId: 'guest-1',
    guestName: 'John Smith',
    guestAddress: '123 Main Street, Colombo 03, Sri Lanka',
    guestEmail: 'john.smith@email.com',
    guestPhone: '+94-77-1234567',
    roomNumber: '102',
    checkInDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
    checkOutDate: Date.now() - 1 * 24 * 60 * 60 * 1000,
    invoiceDate: Date.now() - 1 * 24 * 60 * 60 * 1000,
    dueDate: Date.now() - 1 * 24 * 60 * 60 * 1000,
    currency: 'LKR',
    exchangeRate: 1,
    lineItems: [
      {
        id: generateId(),
        date: Date.now() - 3 * 24 * 60 * 60 * 1000,
        itemType: 'room-charge',
        department: 'front-office',
        description: 'Standard Room - Night 1',
        quantity: 1,
        unit: 'night',
        unitPrice: 18500,
        lineTotal: 18500,
        discountAmount: 0,
        netAmount: 18500,
        taxable: true,
        serviceChargeApplicable: false,
        serviceChargeAmount: 0,
        taxLines: [
          {
            taxType: 'vat',
            taxName: 'VAT',
            taxRate: 15,
            taxableAmount: 18500,
            taxAmount: 2775,
            isInclusive: false
          }
        ],
        totalTax: 2775,
        lineGrandTotal: 21275,
        postedBy: 'user-1',
        postedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        isSplit: false,
        isVoided: false
      },
      {
        id: generateId(),
        date: Date.now() - 2 * 24 * 60 * 60 * 1000,
        itemType: 'room-charge',
        department: 'front-office',
        description: 'Standard Room - Night 2',
        quantity: 1,
        unit: 'night',
        unitPrice: 18500,
        lineTotal: 18500,
        discountAmount: 0,
        netAmount: 18500,
        taxable: true,
        serviceChargeApplicable: false,
        serviceChargeAmount: 0,
        taxLines: [
          {
            taxType: 'vat',
            taxName: 'VAT',
            taxRate: 15,
            taxableAmount: 18500,
            taxAmount: 2775,
            isInclusive: false
          }
        ],
        totalTax: 2775,
        lineGrandTotal: 21275,
        postedBy: 'user-1',
        postedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        isSplit: false,
        isVoided: false
      },
      {
        id: generateId(),
        date: Date.now() - 2 * 24 * 60 * 60 * 1000,
        itemType: 'fnb-restaurant',
        department: 'fnb',
        description: 'Breakfast Buffet',
        quantity: 2,
        unit: 'pax',
        unitPrice: 2500,
        lineTotal: 5000,
        discountAmount: 0,
        netAmount: 5000,
        taxable: true,
        serviceChargeApplicable: true,
        serviceChargeAmount: 500,
        taxLines: [
          {
            taxType: 'vat',
            taxName: 'VAT',
            taxRate: 15,
            taxableAmount: 5500,
            taxAmount: 825,
            isInclusive: false
          }
        ],
        totalTax: 825,
        lineGrandTotal: 6325,
        postedBy: 'user-1',
        postedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        isSplit: false,
        isVoided: false
      },
      {
        id: generateId(),
        date: Date.now() - 2 * 24 * 60 * 60 * 1000,
        itemType: 'fnb-minibar',
        department: 'fnb',
        description: 'Mini Bar Consumption',
        quantity: 1,
        unit: 'item',
        unitPrice: 1800,
        lineTotal: 1800,
        discountAmount: 0,
        netAmount: 1800,
        taxable: true,
        serviceChargeApplicable: false,
        serviceChargeAmount: 0,
        taxLines: [
          {
            taxType: 'vat',
            taxName: 'VAT',
            taxRate: 15,
            taxableAmount: 1800,
            taxAmount: 270,
            isInclusive: false
          }
        ],
        totalTax: 270,
        lineGrandTotal: 2070,
        postedBy: 'user-1',
        postedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        isSplit: false,
        isVoided: false
      }
    ],
    subtotal: 43800,
    discounts: [],
    totalDiscount: 0,
    serviceChargeRate: 10,
    serviceChargeAmount: 500,
    taxLines: [
      {
        taxType: 'vat',
        taxName: 'VAT',
        taxRate: 15,
        taxableAmount: 44300,
        taxAmount: 6645,
        isInclusive: false
      }
    ],
    totalTax: 6645,
    grandTotal: 50945,
    payments: [
      {
        id: generateId(),
        paymentDate: Date.now() - 1 * 24 * 60 * 60 * 1000,
        paymentType: 'card',
        amount: 50945,
        currency: 'LKR',
        exchangeRate: 1,
        amountInBaseCurrency: 50945,
        reference: 'CARD-****-5678',
        cardType: 'Mastercard',
        cardLast4: '5678',
        receivedBy: 'user-1',
        receivedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        isRefunded: false
      }
    ],
    totalPaid: 50945,
    amountDue: 0,
    creditNotes: [],
    debitNotes: [],
    prepayments: [
      {
        prepaymentId: generateId(),
        reservationId: 'res-1',
        amount: 18500,
        appliedBy: 'user-1',
        appliedAt: Date.now() - 3 * 24 * 60 * 60 * 1000
      }
    ],
    netAmountDue: 0,
    isPostedToAccounts: true,
    postedToAccountsBy: 'user-1',
    postedToAccountsAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    deliveryMethods: [
      {
        method: 'email',
        status: 'emailed',
        recipient: 'john.smith@email.com',
        attemptedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        deliveredAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        retryCount: 0,
        deliveredBy: 'user-1'
      },
      {
        method: 'print',
        status: 'printed',
        attemptedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        deliveredAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        retryCount: 0,
        deliveredBy: 'user-1'
      }
    ],
    emailDeliveryStatus: 'emailed',
    emailDeliveredAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    printedBy: 'user-1',
    printedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    auditTrail: [
      {
        id: generateId(),
        action: 'created',
        description: 'Invoice created from guest folio',
        performedBy: 'user-1',
        performedAt: Date.now() - 1 * 24 * 60 * 60 * 1000
      },
      {
        id: generateId(),
        action: 'finalized',
        description: 'Invoice finalized and posted to accounts',
        performedBy: 'user-1',
        performedAt: Date.now() - 1 * 24 * 60 * 60 * 1000
      },
      {
        id: generateId(),
        action: 'payment-received',
        description: 'Payment received via credit card',
        performedBy: 'user-1',
        performedAt: Date.now() - 1 * 24 * 60 * 60 * 1000
      },
      {
        id: generateId(),
        action: 'emailed',
        description: 'Invoice emailed to guest',
        performedBy: 'user-1',
        performedAt: Date.now() - 1 * 24 * 60 * 60 * 1000
      }
    ],
    isGroupMaster: false,
    isTaxExempt: false,
    paymentInstructions: 'Thank you for your payment.',
    termsAndConditions: 'All charges are non-refundable unless otherwise stated.',
    createdBy: 'user-1',
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    finalizedBy: 'user-1',
    finalizedAt: Date.now() - 1 * 24 * 60 * 60 * 1000
  },
  {
    id: 'invoice-2',
    invoiceNumber: 'INV-2024-002',
    invoiceType: 'guest-folio',
    status: 'final',
    folioIds: ['folio-2'],
    reservationIds: ['res-2'],
    guestId: 'guest-2',
    guestName: 'Sarah Johnson',
    guestAddress: '456 Beach Road, Galle 80000, Sri Lanka',
    guestEmail: 'sarah.j@email.com',
    guestPhone: '+94-71-9876543',
    roomNumber: '104',
    checkInDate: Date.now() - 5 * 24 * 60 * 60 * 1000,
    checkOutDate: Date.now() - 2 * 24 * 60 * 60 * 1000,
    invoiceDate: Date.now() - 2 * 24 * 60 * 60 * 1000,
    dueDate: Date.now() - 2 * 24 * 60 * 60 * 1000,
    currency: 'LKR',
    exchangeRate: 1,
    lineItems: [
      {
        id: generateId(),
        date: Date.now() - 5 * 24 * 60 * 60 * 1000,
        itemType: 'room-charge',
        department: 'front-office',
        description: 'Deluxe Room - Night 1',
        quantity: 1,
        unit: 'night',
        unitPrice: 28000,
        lineTotal: 28000,
        discountAmount: 0,
        netAmount: 28000,
        taxable: true,
        serviceChargeApplicable: false,
        serviceChargeAmount: 0,
        taxLines: [
          {
            taxType: 'vat',
            taxName: 'VAT',
            taxRate: 15,
            taxableAmount: 28000,
            taxAmount: 4200,
            isInclusive: false
          }
        ],
        totalTax: 4200,
        lineGrandTotal: 32200,
        postedBy: 'user-1',
        postedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
        isSplit: false,
        isVoided: false
      },
      {
        id: generateId(),
        date: Date.now() - 4 * 24 * 60 * 60 * 1000,
        itemType: 'room-charge',
        department: 'front-office',
        description: 'Deluxe Room - Night 2',
        quantity: 1,
        unit: 'night',
        unitPrice: 28000,
        lineTotal: 28000,
        discountAmount: 0,
        netAmount: 28000,
        taxable: true,
        serviceChargeApplicable: false,
        serviceChargeAmount: 0,
        taxLines: [
          {
            taxType: 'vat',
            taxName: 'VAT',
            taxRate: 15,
            taxableAmount: 28000,
            taxAmount: 4200,
            isInclusive: false
          }
        ],
        totalTax: 4200,
        lineGrandTotal: 32200,
        postedBy: 'user-1',
        postedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
        isSplit: false,
        isVoided: false
      },
      {
        id: generateId(),
        date: Date.now() - 3 * 24 * 60 * 60 * 1000,
        itemType: 'room-charge',
        department: 'front-office',
        description: 'Deluxe Room - Night 3',
        quantity: 1,
        unit: 'night',
        unitPrice: 28000,
        lineTotal: 28000,
        discountAmount: 0,
        netAmount: 28000,
        taxable: true,
        serviceChargeApplicable: false,
        serviceChargeAmount: 0,
        taxLines: [
          {
            taxType: 'vat',
            taxName: 'VAT',
            taxRate: 15,
            taxableAmount: 28000,
            taxAmount: 4200,
            isInclusive: false
          }
        ],
        totalTax: 4200,
        lineGrandTotal: 32200,
        postedBy: 'user-1',
        postedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        isSplit: false,
        isVoided: false
      },
      {
        id: generateId(),
        date: Date.now() - 4 * 24 * 60 * 60 * 1000,
        itemType: 'extra-service',
        department: 'housekeeping',
        description: 'Extra Bed for Child',
        quantity: 3,
        unit: 'night',
        unitPrice: 3000,
        lineTotal: 9000,
        discountAmount: 0,
        netAmount: 9000,
        taxable: true,
        serviceChargeApplicable: false,
        serviceChargeAmount: 0,
        taxLines: [
          {
            taxType: 'vat',
            taxName: 'VAT',
            taxRate: 15,
            taxableAmount: 9000,
            taxAmount: 1350,
            isInclusive: false
          }
        ],
        totalTax: 1350,
        lineGrandTotal: 10350,
        postedBy: 'user-1',
        postedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
        isSplit: false,
        isVoided: false
      },
      {
        id: generateId(),
        date: Date.now() - 3 * 24 * 60 * 60 * 1000,
        itemType: 'fnb-restaurant',
        department: 'fnb',
        description: 'Lunch - Poolside Restaurant',
        quantity: 1,
        unit: 'meal',
        unitPrice: 8500,
        lineTotal: 8500,
        discountAmount: 0,
        netAmount: 8500,
        taxable: true,
        serviceChargeApplicable: true,
        serviceChargeAmount: 850,
        taxLines: [
          {
            taxType: 'vat',
            taxName: 'VAT',
            taxRate: 15,
            taxableAmount: 9350,
            taxAmount: 1402.5,
            isInclusive: false
          }
        ],
        totalTax: 1402.5,
        lineGrandTotal: 10752.5,
        postedBy: 'user-1',
        postedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        isSplit: false,
        isVoided: false
      },
      {
        id: generateId(),
        date: Date.now() - 3 * 24 * 60 * 60 * 1000,
        itemType: 'spa',
        department: 'housekeeping',
        description: 'Couple Spa Package - 90 mins',
        quantity: 1,
        unit: 'service',
        unitPrice: 15000,
        lineTotal: 15000,
        discountAmount: 1500,
        netAmount: 13500,
        taxable: true,
        serviceChargeApplicable: false,
        serviceChargeAmount: 0,
        taxLines: [
          {
            taxType: 'vat',
            taxName: 'VAT',
            taxRate: 15,
            taxableAmount: 13500,
            taxAmount: 2025,
            isInclusive: false
          }
        ],
        totalTax: 2025,
        lineGrandTotal: 15525,
        postedBy: 'user-1',
        postedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        isSplit: false,
        isVoided: false
      }
    ],
    subtotal: 93000,
    discounts: [
      {
        id: generateId(),
        type: 'percentage',
        scope: 'line-item',
        description: '10% Spa Discount - Booking.com Offer',
        value: 10,
        amount: 1500,
        appliedBy: 'user-1',
        appliedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        approvalRequired: false
      }
    ],
    totalDiscount: 1500,
    serviceChargeRate: 10,
    serviceChargeAmount: 850,
    taxLines: [
      {
        taxType: 'vat',
        taxName: 'VAT',
        taxRate: 15,
        taxableAmount: 92350,
        taxAmount: 13852.5,
        isInclusive: false
      }
    ],
    totalTax: 13852.5,
    grandTotal: 106202.5,
    payments: [
      {
        id: generateId(),
        paymentDate: Date.now() - 2 * 24 * 60 * 60 * 1000,
        paymentType: 'card',
        amount: 106202.5,
        currency: 'LKR',
        exchangeRate: 1,
        amountInBaseCurrency: 106202.5,
        reference: 'CARD-****-9012',
        cardType: 'Visa',
        cardLast4: '9012',
        receivedBy: 'user-1',
        receivedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        isRefunded: false
      }
    ],
    totalPaid: 106202.5,
    amountDue: 0,
    creditNotes: [],
    debitNotes: [],
    prepayments: [
      {
        prepaymentId: generateId(),
        reservationId: 'res-2',
        amount: 28000,
        appliedBy: 'user-1',
        appliedAt: Date.now() - 5 * 24 * 60 * 60 * 1000
      }
    ],
    netAmountDue: 0,
    isPostedToAccounts: true,
    postedToAccountsBy: 'user-1',
    postedToAccountsAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    deliveryMethods: [
      {
        method: 'email',
        status: 'emailed',
        recipient: 'sarah.j@email.com',
        attemptedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        deliveredAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        retryCount: 0,
        deliveredBy: 'user-1'
      }
    ],
    emailDeliveryStatus: 'emailed',
    emailDeliveredAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    auditTrail: [
      {
        id: generateId(),
        action: 'created',
        description: 'Invoice created from guest folio',
        performedBy: 'user-1',
        performedAt: Date.now() - 2 * 24 * 60 * 60 * 1000
      },
      {
        id: generateId(),
        action: 'discount-applied',
        description: 'Spa discount applied',
        performedBy: 'user-1',
        performedAt: Date.now() - 2 * 24 * 60 * 60 * 1000
      },
      {
        id: generateId(),
        action: 'finalized',
        description: 'Invoice finalized',
        performedBy: 'user-1',
        performedAt: Date.now() - 2 * 24 * 60 * 60 * 1000
      },
      {
        id: generateId(),
        action: 'payment-received',
        description: 'Payment received via card',
        performedBy: 'user-1',
        performedAt: Date.now() - 2 * 24 * 60 * 60 * 1000
      }
    ],
    isGroupMaster: false,
    isTaxExempt: false,
    paymentInstructions: 'Thank you for staying with us.',
    termsAndConditions: 'All charges are non-refundable unless otherwise stated.',
    createdBy: 'user-1',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    finalizedBy: 'user-1',
    finalizedAt: Date.now() - 2 * 24 * 60 * 60 * 1000
  },
  {
    id: 'invoice-3',
    invoiceNumber: 'INV-2024-003',
    invoiceType: 'guest-folio',
    status: 'final',
    folioIds: ['folio-3'],
    reservationIds: ['res-3'],
    guestId: 'guest-3',
    guestName: 'Michael Chen',
    guestAddress: '789 Orchard Boulevard, Singapore 238858',
    guestEmail: 'mchen@email.com',
    guestPhone: '+65-9123-4567',
    roomNumber: '203',
    checkInDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
    checkOutDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
    invoiceDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
    dueDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
    currency: 'LKR',
    exchangeRate: 1,
    lineItems: [
      {
        id: generateId(),
        date: Date.now() - 7 * 24 * 60 * 60 * 1000,
        itemType: 'room-charge',
        department: 'front-office',
        description: 'Suite Room - 4 Nights',
        quantity: 4,
        unit: 'night',
        unitPrice: 42000,
        lineTotal: 168000,
        discountAmount: 0,
        netAmount: 168000,
        taxable: true,
        serviceChargeApplicable: false,
        serviceChargeAmount: 0,
        taxLines: [
          {
            taxType: 'vat',
            taxName: 'VAT',
            taxRate: 15,
            taxableAmount: 168000,
            taxAmount: 25200,
            isInclusive: false
          }
        ],
        totalTax: 25200,
        lineGrandTotal: 193200,
        postedBy: 'user-1',
        postedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
        isSplit: false,
        isVoided: false
      },
      {
        id: generateId(),
        date: Date.now() - 6 * 24 * 60 * 60 * 1000,
        itemType: 'fnb-restaurant',
        department: 'fnb',
        description: 'Honeymoon Dinner - Beachfront',
        quantity: 1,
        unit: 'meal',
        unitPrice: 18000,
        lineTotal: 18000,
        discountAmount: 0,
        netAmount: 18000,
        taxable: true,
        serviceChargeApplicable: true,
        serviceChargeAmount: 1800,
        taxLines: [
          {
            taxType: 'vat',
            taxName: 'VAT',
            taxRate: 15,
            taxableAmount: 19800,
            taxAmount: 2970,
            isInclusive: false
          }
        ],
        totalTax: 2970,
        lineGrandTotal: 22770,
        postedBy: 'user-1',
        postedAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
        isSplit: false,
        isVoided: false
      },
      {
        id: generateId(),
        date: Date.now() - 5 * 24 * 60 * 60 * 1000,
        itemType: 'fnb-room-service',
        department: 'fnb',
        description: 'Breakfast in Bed - 4 Days',
        quantity: 4,
        unit: 'service',
        unitPrice: 3500,
        lineTotal: 14000,
        discountAmount: 0,
        netAmount: 14000,
        taxable: true,
        serviceChargeApplicable: true,
        serviceChargeAmount: 1400,
        taxLines: [
          {
            taxType: 'vat',
            taxName: 'VAT',
            taxRate: 15,
            taxableAmount: 15400,
            taxAmount: 2310,
            isInclusive: false
          }
        ],
        totalTax: 2310,
        lineGrandTotal: 17710,
        postedBy: 'user-1',
        postedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
        isSplit: false,
        isVoided: false
      },
      {
        id: generateId(),
        date: Date.now() - 4 * 24 * 60 * 60 * 1000,
        itemType: 'extra-service',
        department: 'housekeeping',
        description: 'Late Checkout Fee (Until 6 PM)',
        quantity: 1,
        unit: 'service',
        unitPrice: 8000,
        lineTotal: 8000,
        discountAmount: 0,
        netAmount: 8000,
        taxable: true,
        serviceChargeApplicable: false,
        serviceChargeAmount: 0,
        taxLines: [
          {
            taxType: 'vat',
            taxName: 'VAT',
            taxRate: 15,
            taxableAmount: 8000,
            taxAmount: 1200,
            isInclusive: false
          }
        ],
        totalTax: 1200,
        lineGrandTotal: 9200,
        postedBy: 'user-1',
        postedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
        isSplit: false,
        isVoided: false
      }
    ],
    subtotal: 208000,
    discounts: [],
    totalDiscount: 0,
    serviceChargeRate: 10,
    serviceChargeAmount: 3200,
    taxLines: [
      {
        taxType: 'vat',
        taxName: 'VAT',
        taxRate: 15,
        taxableAmount: 211200,
        taxAmount: 31680,
        isInclusive: false
      }
    ],
    totalTax: 31680,
    grandTotal: 242880,
    payments: [
      {
        id: generateId(),
        paymentDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
        paymentType: 'cash',
        amount: 242880,
        currency: 'LKR',
        exchangeRate: 1,
        amountInBaseCurrency: 242880,
        receivedBy: 'user-1',
        receivedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        isRefunded: false
      }
    ],
    totalPaid: 242880,
    amountDue: 0,
    creditNotes: [],
    debitNotes: [],
    prepayments: [
      {
        prepaymentId: generateId(),
        reservationId: 'res-3',
        amount: 42000,
        appliedBy: 'user-1',
        appliedAt: Date.now() - 7 * 24 * 60 * 60 * 1000
      }
    ],
    netAmountDue: 0,
    isPostedToAccounts: true,
    postedToAccountsBy: 'user-1',
    postedToAccountsAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    deliveryMethods: [
      {
        method: 'email',
        status: 'emailed',
        recipient: 'mchen@email.com',
        attemptedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        deliveredAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        retryCount: 0,
        deliveredBy: 'user-1'
      },
      {
        method: 'print',
        status: 'printed',
        attemptedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        deliveredAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        retryCount: 0,
        deliveredBy: 'user-1'
      }
    ],
    emailDeliveryStatus: 'emailed',
    emailDeliveredAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    printedBy: 'user-1',
    printedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    auditTrail: [
      {
        id: generateId(),
        action: 'created',
        description: 'Invoice created from honeymoon package reservation',
        performedBy: 'user-1',
        performedAt: Date.now() - 3 * 24 * 60 * 60 * 1000
      },
      {
        id: generateId(),
        action: 'finalized',
        description: 'Invoice finalized',
        performedBy: 'user-1',
        performedAt: Date.now() - 3 * 24 * 60 * 60 * 1000
      },
      {
        id: generateId(),
        action: 'payment-received',
        description: 'Payment received via cash',
        performedBy: 'user-1',
        performedAt: Date.now() - 3 * 24 * 60 * 60 * 1000
      },
      {
        id: generateId(),
        action: 'printed',
        description: 'Invoice printed for guest',
        performedBy: 'user-1',
        performedAt: Date.now() - 3 * 24 * 60 * 60 * 1000
      }
    ],
    isGroupMaster: false,
    isTaxExempt: false,
    specialInstructions: 'Honeymoon Package - Thank you for choosing us for your special occasion!',
    paymentInstructions: 'Thank you for your payment.',
    termsAndConditions: 'All charges are non-refundable unless otherwise stated.',
    createdBy: 'user-1',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    finalizedBy: 'user-1',
    finalizedAt: Date.now() - 3 * 24 * 60 * 60 * 1000
  }
]
