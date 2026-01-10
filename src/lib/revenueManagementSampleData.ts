import type { RoomTypeConfig, RatePlanConfig, Season, EventDay, CorporateAccount } from './types'

const now = Date.now()
const systemUserId = 'system-user-1'

export const sampleRoomTypeConfigs: RoomTypeConfig[] = [
  {
    id: 'rt-1',
    name: 'Standard Room',
    code: 'STD',
    description: 'Comfortable standard room with essential amenities, perfect for business travelers and solo guests.',
    baseRate: 15000,
    rackRate: 18000,
    maxOccupancy: 2,
    baseOccupancy: 2,
    size: 25,
    amenities: ['Wi-Fi', 'Air Conditioning', 'TV', 'Mini Bar', 'Safe', 'Work Desk', 'Coffee Maker'],
    bedding: ['queen'],
    viewTypes: ['city', 'courtyard'],
    inventoryItems: ['Towels', 'Toiletries', 'Slippers', 'Robe'],
    sortOrder: 1,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    createdBy: systemUserId
  },
  {
    id: 'rt-2',
    name: 'Deluxe Room',
    code: 'DLX',
    description: 'Spacious deluxe room with premium furnishings and enhanced amenities.',
    baseRate: 22000,
    rackRate: 26000,
    maxOccupancy: 3,
    baseOccupancy: 2,
    size: 35,
    amenities: ['Wi-Fi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Safe', 'Work Desk', 'Coffee Maker', 'Balcony', 'Bathrobe', 'Premium Toiletries'],
    bedding: ['king'],
    viewTypes: ['garden', 'pool'],
    inventoryItems: ['Towels', 'Premium Toiletries', 'Slippers', 'Bathrobe', 'Pillow Menu'],
    sortOrder: 2,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    createdBy: systemUserId
  },
  {
    id: 'rt-3',
    name: 'Ocean View Suite',
    code: 'OVS',
    description: 'Luxurious suite with breathtaking ocean views, separate living area, and premium amenities.',
    baseRate: 45000,
    rackRate: 55000,
    maxOccupancy: 4,
    baseOccupancy: 2,
    size: 60,
    amenities: ['Wi-Fi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Safe', 'Work Desk', 'Nespresso Machine', 'Balcony', 'Bathrobe', 'Premium Toiletries', 'Living Area', 'Jacuzzi', 'Butler Service'],
    bedding: ['king', 'sofa-bed'],
    viewTypes: ['ocean'],
    inventoryItems: ['Towels', 'Premium Toiletries', 'Slippers', 'Bathrobe', 'Pillow Menu', 'Welcome Amenities'],
    sortOrder: 3,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    createdBy: systemUserId
  },
  {
    id: 'rt-4',
    name: 'Family Suite',
    code: 'FAM',
    description: 'Spacious family suite with two bedrooms, perfect for families traveling together.',
    baseRate: 38000,
    rackRate: 46000,
    maxOccupancy: 6,
    baseOccupancy: 4,
    size: 70,
    amenities: ['Wi-Fi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Safe', 'Work Desk', 'Coffee Maker', 'Kitchenette', 'Balcony', 'Living Area', 'Kids Amenities'],
    bedding: ['king', 'twin'],
    viewTypes: ['garden', 'pool'],
    inventoryItems: ['Towels', 'Toiletries', 'Slippers', 'Bathrobe', 'Kids Amenities'],
    sortOrder: 4,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    createdBy: systemUserId
  },
  {
    id: 'rt-5',
    name: 'Executive Suite',
    code: 'EXE',
    description: 'Premium executive suite with panoramic views, separate office area, and exclusive lounge access.',
    baseRate: 65000,
    rackRate: 78000,
    maxOccupancy: 3,
    baseOccupancy: 2,
    size: 85,
    amenities: ['Wi-Fi', 'Air Conditioning', 'Smart TV', 'Mini Bar', 'Safe', 'Executive Desk', 'Nespresso Machine', 'Balcony', 'Bathrobe', 'Premium Toiletries', 'Living Area', 'Jacuzzi', 'Butler Service', 'Lounge Access', 'Meeting Room Access'],
    bedding: ['king'],
    viewTypes: ['ocean', 'city'],
    inventoryItems: ['Towels', 'Premium Toiletries', 'Slippers', 'Bathrobe', 'Pillow Menu', 'Welcome Amenities', 'Business Supplies'],
    sortOrder: 5,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    createdBy: systemUserId
  },
  {
    id: 'rt-6',
    name: 'Presidential Suite',
    code: 'PRE',
    description: 'The ultimate luxury experience with expansive living spaces, private terrace, and personalized service.',
    baseRate: 150000,
    rackRate: 180000,
    maxOccupancy: 4,
    baseOccupancy: 2,
    size: 150,
    amenities: ['Wi-Fi', 'Air Conditioning', 'Smart TV', 'Full Bar', 'Safe', 'Executive Desk', 'Nespresso Machine', 'Private Terrace', 'Bathrobe', 'Luxury Toiletries', 'Living Area', 'Dining Area', 'Spa Bath', 'Private Butler', 'Lounge Access', 'Limousine Service', 'Private Chef Available'],
    bedding: ['king', 'queen'],
    viewTypes: ['ocean', 'mountain'],
    inventoryItems: ['Towels', 'Luxury Toiletries', 'Slippers', 'Bathrobe', 'Pillow Menu', 'Welcome Amenities', 'Business Supplies', 'Champagne on Arrival'],
    sortOrder: 6,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    createdBy: systemUserId
  }
]

export const sampleRatePlans: RatePlanConfig[] = [
  {
    id: 'rp-1',
    code: 'BAR',
    name: 'Best Available Rate',
    description: 'Our flexible rate with no restrictions. Best value for direct bookings.',
    type: 'bar',
    mealPlan: 'ro',
    isParent: true,
    requiresApproval: false,
    isActive: true,
    sortOrder: 1,
    validFrom: now,
    channels: ['Direct', 'Website', 'Phone', 'Walk-in'],
    createdAt: now,
    updatedAt: now,
    createdBy: systemUserId
  },
  {
    id: 'rp-2',
    code: 'RACK',
    name: 'Rack Rate',
    description: 'Published standard rate without any discounts.',
    type: 'rack',
    mealPlan: 'ro',
    isParent: true,
    requiresApproval: false,
    isActive: true,
    sortOrder: 2,
    validFrom: now,
    channels: ['Direct', 'Website', 'Walk-in'],
    createdAt: now,
    updatedAt: now,
    createdBy: systemUserId
  },
  {
    id: 'rp-3',
    code: 'CORP',
    name: 'Corporate Rate',
    description: 'Special negotiated rate for corporate clients and business travelers.',
    type: 'corporate',
    mealPlan: 'bb',
    isParent: true,
    requiresApproval: true,
    isActive: true,
    sortOrder: 3,
    validFrom: now,
    minimumStay: 1,
    cancellationPolicy: '24 hours prior to arrival',
    channels: ['Direct', 'Corporate Portal'],
    createdAt: now,
    updatedAt: now,
    createdBy: systemUserId
  },
  {
    id: 'rp-4',
    code: 'EB15',
    name: 'Early Bird - 15% Off',
    description: 'Save 15% when you book 30 days in advance.',
    type: 'early-bird',
    mealPlan: 'ro',
    isParent: false,
    parentRatePlanId: 'rp-1',
    derivedRateConfig: {
      derivedType: 'percentage-discount',
      parentRatePlanId: 'rp-1',
      value: 15,
      roundingRule: 'nearest-100'
    },
    requiresApproval: false,
    isActive: true,
    sortOrder: 4,
    validFrom: now,
    advanceBookingDays: 30,
    minimumStay: 2,
    cancellationPolicy: 'Non-refundable',
    channels: ['Direct', 'Website'],
    createdAt: now,
    updatedAt: now,
    createdBy: systemUserId
  },
  {
    id: 'rp-5',
    code: 'BB',
    name: 'Bed & Breakfast',
    description: 'Room rate including daily breakfast for two.',
    type: 'bar',
    mealPlan: 'bb',
    isParent: false,
    parentRatePlanId: 'rp-1',
    derivedRateConfig: {
      derivedType: 'fixed-markup',
      parentRatePlanId: 'rp-1',
      value: 3000,
      roundingRule: 'nearest-100'
    },
    requiresApproval: false,
    isActive: true,
    sortOrder: 5,
    validFrom: now,
    channels: ['Direct', 'Website', 'OTA'],
    createdAt: now,
    updatedAt: now,
    createdBy: systemUserId
  },
  {
    id: 'rp-6',
    code: 'HB',
    name: 'Half Board',
    description: 'Room rate including breakfast and dinner daily.',
    type: 'bar',
    mealPlan: 'hb',
    isParent: false,
    parentRatePlanId: 'rp-1',
    derivedRateConfig: {
      derivedType: 'fixed-markup',
      parentRatePlanId: 'rp-1',
      value: 6000,
      roundingRule: 'nearest-100'
    },
    requiresApproval: false,
    isActive: true,
    sortOrder: 6,
    validFrom: now,
    channels: ['Direct', 'Website', 'OTA'],
    createdAt: now,
    updatedAt: now,
    createdBy: systemUserId
  },
  {
    id: 'rp-7',
    code: 'LM',
    name: 'Last Minute Deal',
    description: 'Save on last-minute bookings made within 48 hours of arrival.',
    type: 'last-minute',
    mealPlan: 'ro',
    isParent: false,
    parentRatePlanId: 'rp-1',
    derivedRateConfig: {
      derivedType: 'percentage-discount',
      parentRatePlanId: 'rp-1',
      value: 20,
      roundingRule: 'nearest-100'
    },
    requiresApproval: false,
    isActive: true,
    sortOrder: 7,
    validFrom: now,
    maxAdvanceBookingDays: 2,
    minimumStay: 1,
    cancellationPolicy: 'Non-refundable',
    channels: ['Website', 'Mobile App'],
    createdAt: now,
    updatedAt: now,
    createdBy: systemUserId
  },
  {
    id: 'rp-8',
    code: 'LS7',
    name: 'Long Stay - 7 Nights',
    description: 'Special rate for extended stays of 7 nights or more.',
    type: 'long-stay',
    mealPlan: 'bb',
    isParent: false,
    parentRatePlanId: 'rp-1',
    derivedRateConfig: {
      derivedType: 'percentage-discount',
      parentRatePlanId: 'rp-1',
      value: 25,
      roundingRule: 'nearest-100'
    },
    requiresApproval: false,
    isActive: true,
    sortOrder: 8,
    validFrom: now,
    minimumStay: 7,
    cancellationPolicy: '7 days prior to arrival',
    channels: ['Direct', 'Website'],
    createdAt: now,
    updatedAt: now,
    createdBy: systemUserId
  },
  {
    id: 'rp-9',
    code: 'WKD',
    name: 'Weekend Getaway',
    description: 'Special weekend rate for Friday and Saturday stays.',
    type: 'weekend',
    mealPlan: 'bb',
    isParent: false,
    parentRatePlanId: 'rp-1',
    derivedRateConfig: {
      derivedType: 'percentage-markup',
      parentRatePlanId: 'rp-1',
      value: 10,
      roundingRule: 'nearest-100'
    },
    requiresApproval: false,
    isActive: true,
    sortOrder: 9,
    validFrom: now,
    minimumStay: 2,
    channels: ['Direct', 'Website', 'OTA'],
    createdAt: now,
    updatedAt: now,
    createdBy: systemUserId
  },
  {
    id: 'rp-10',
    code: 'HM',
    name: 'Honeymoon Package',
    description: 'Romantic package with champagne, spa treatment, and special amenities.',
    type: 'honeymoon',
    mealPlan: 'hb',
    isParent: false,
    parentRatePlanId: 'rp-1',
    derivedRateConfig: {
      derivedType: 'fixed-markup',
      parentRatePlanId: 'rp-1',
      value: 15000,
      roundingRule: 'nearest-100'
    },
    requiresApproval: false,
    isActive: true,
    sortOrder: 10,
    validFrom: now,
    minimumStay: 3,
    cancellationPolicy: '14 days prior to arrival',
    channels: ['Direct', 'Website'],
    createdAt: now,
    updatedAt: now,
    createdBy: systemUserId
  }
]

export const sampleSeasons: Season[] = [
  {
    id: 'season-1',
    name: 'Low Season',
    code: 'LOW',
    type: 'low',
    startDate: new Date('2025-05-01').getTime(),
    endDate: new Date('2025-09-30').getTime(),
    rateMultiplier: 0.85,
    description: 'Off-peak season with reduced rates',
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'season-2',
    name: 'Mid Season',
    code: 'MID',
    type: 'mid',
    startDate: new Date('2025-10-01').getTime(),
    endDate: new Date('2025-11-30').getTime(),
    rateMultiplier: 1.0,
    description: 'Regular season with standard rates',
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'season-3',
    name: 'High Season',
    code: 'HIGH',
    type: 'high',
    startDate: new Date('2025-12-01').getTime(),
    endDate: new Date('2025-12-19').getTime(),
    rateMultiplier: 1.3,
    description: 'Peak demand period with premium rates',
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'season-4',
    name: 'Festive Season',
    code: 'PEAK',
    type: 'peak',
    startDate: new Date('2025-12-20').getTime(),
    endDate: new Date('2026-01-05').getTime(),
    rateMultiplier: 1.5,
    description: 'Christmas and New Year peak season',
    isActive: true,
    createdAt: now,
    updatedAt: now
  }
]

export const sampleEventDays: EventDay[] = [
  {
    id: 'event-1',
    name: 'Sinhala & Tamil New Year',
    date: new Date('2025-04-14').getTime(),
    rateMultiplier: 1.4,
    description: 'Traditional New Year celebration',
    minimumStay: 2,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'event-2',
    name: 'Vesak Festival',
    date: new Date('2025-05-12').getTime(),
    rateMultiplier: 1.3,
    description: 'Buddhist festival celebration',
    minimumStay: 2,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'event-3',
    name: 'Christmas Eve',
    date: new Date('2025-12-24').getTime(),
    rateMultiplier: 1.6,
    description: 'Christmas celebration',
    minimumStay: 3,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'event-4',
    name: 'New Year\'s Eve',
    date: new Date('2025-12-31').getTime(),
    rateMultiplier: 1.8,
    description: 'New Year celebration with gala dinner',
    minimumStay: 3,
    isActive: true,
    createdAt: now,
    updatedAt: now
  }
]

export const sampleCorporateAccounts: CorporateAccount[] = [
  {
    id: 'corp-1',
    companyName: 'Tech Solutions Lanka (Pvt) Ltd',
    code: 'TSL',
    contactPerson: 'Samantha Silva',
    email: 'samantha.silva@techsolutions.lk',
    phone: '+94 77 123 4567',
    address: '123 Galle Road, Colombo 03',
    negotiatedRates: [
      {
        roomTypeId: 'rt-1',
        ratePlanId: 'rp-3',
        rate: 12000,
        validFrom: now,
        validTo: new Date('2025-12-31').getTime()
      },
      {
        roomTypeId: 'rt-2',
        ratePlanId: 'rp-3',
        rate: 17600,
        validFrom: now,
        validTo: new Date('2025-12-31').getTime()
      }
    ],
    creditLimit: 500000,
    paymentTerms: '30 days net',
    blackoutDates: [
      new Date('2025-12-24').getTime(),
      new Date('2025-12-31').getTime()
    ],
    roomAllotment: 5,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'corp-2',
    companyName: 'Global Consulting Group',
    code: 'GCG',
    contactPerson: 'Rajiv Wickremesinghe',
    email: 'rajiv.w@globalconsulting.com',
    phone: '+94 11 234 5678',
    address: '456 Union Place, Colombo 02',
    negotiatedRates: [
      {
        roomTypeId: 'rt-1',
        ratePlanId: 'rp-3',
        rate: 11250,
        validFrom: now,
        validTo: new Date('2025-12-31').getTime()
      },
      {
        roomTypeId: 'rt-2',
        ratePlanId: 'rp-3',
        rate: 16500,
        validFrom: now,
        validTo: new Date('2025-12-31').getTime()
      },
      {
        roomTypeId: 'rt-3',
        ratePlanId: 'rp-3',
        rate: 33750,
        validFrom: now,
        validTo: new Date('2025-12-31').getTime()
      }
    ],
    creditLimit: 1000000,
    paymentTerms: '45 days net',
    blackoutDates: [],
    roomAllotment: 10,
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: 'corp-3',
    companyName: 'National Airlines',
    code: 'NAL',
    contactPerson: 'Nisha Fernando',
    email: 'nisha.fernando@nationalair.lk',
    phone: '+94 77 987 6543',
    address: 'Airport Road, Katunayake',
    negotiatedRates: [
      {
        roomTypeId: 'rt-1',
        ratePlanId: 'rp-3',
        rate: 10500,
        validFrom: now,
        validTo: new Date('2025-12-31').getTime()
      },
      {
        roomTypeId: 'rt-2',
        ratePlanId: 'rp-3',
        rate: 15400,
        validFrom: now,
        validTo: new Date('2025-12-31').getTime()
      }
    ],
    creditLimit: 750000,
    paymentTerms: '30 days net',
    blackoutDates: [],
    roomAllotment: 15,
    isActive: true,
    createdAt: now,
    updatedAt: now
  }
]
