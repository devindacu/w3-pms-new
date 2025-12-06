import {  
  type Payment,
  type Expense,
  type Account,
  type Budget,
  type CostCenter,
  type ProfitCenter,
  type CostCenterReport,
  type ProfitCenterReport
} from './types'

export const samplePayments: Payment[] = [
  {
    id: 'pay-1',
    paymentNumber: 'PAY-2024-001',
    amount: 15420,
    method: 'card',
    status: 'paid',
    reference: 'CARD-20240115-001',
    notes: 'Guest checkout payment - Room 102',
    processedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    processedBy: 'Emily Rodriguez',
    reconciled: true,
    reconciledAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    reconciledBy: 'Sarah Chen',
    isRefunded: false,
    isRefund: false
  },
  {
    id: 'pay-2',
    paymentNumber: 'PAY-2024-002',
    amount: 8500,
    method: 'cash',
    status: 'paid',
    reference: 'CASH-20240116-001',
    notes: 'F&B payment - Restaurant',
    processedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    processedBy: 'John Davis',
    reconciled: true,
    reconciledAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    reconciledBy: 'Sarah Chen',
    isRefunded: false,
    isRefund: false
  },
  {
    id: 'pay-3',
    paymentNumber: 'PAY-2024-003',
    amount: 22800,
    method: 'bank-transfer',
    status: 'paid',
    reference: 'TRF-20240117-001',
    notes: 'Corporate booking payment - XYZ Corp',
    processedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    processedBy: 'Emily Rodriguez',
    reconciled: true,
    reconciledAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    reconciledBy: 'Sarah Chen',
    isRefunded: false,
    isRefund: false
  },
  {
    id: 'pay-4',
    paymentNumber: 'PAY-2024-004',
    amount: 12600,
    method: 'card',
    status: 'paid',
    reference: 'CARD-20240118-001',
    notes: 'Room service and spa',
    processedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    processedBy: 'John Davis',
    reconciled: false,
    isRefunded: false,
    isRefund: false
  },
  {
    id: 'pay-5',
    paymentNumber: 'PAY-2024-005',
    amount: 18900,
    method: 'mobile-payment',
    status: 'paid',
    reference: 'MOB-20240119-001',
    notes: 'Conference room booking',
    processedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    processedBy: 'Emily Rodriguez',
    reconciled: false,
    isRefunded: false,
    isRefund: false
  },
  {
    id: 'pay-6',
    paymentNumber: 'PAY-2024-006',
    amount: 5200,
    method: 'cash',
    status: 'partially-paid',
    reference: 'CASH-20240120-001',
    notes: 'Partial payment for group booking',
    processedAt: Date.now() - 12 * 60 * 60 * 1000,
    processedBy: 'John Davis',
    reconciled: false,
    isRefunded: false,
    isRefund: false
  }
]

export const sampleExpenses: Expense[] = [
  {
    id: 'exp-1',
    expenseNumber: 'EXP-2024-001',
    category: 'utilities',
    department: 'admin',
    amount: 45000,
    description: 'Monthly electricity bill - January 2024',
    date: Date.now() - 10 * 24 * 60 * 60 * 1000,
    expenseDate: Date.now() - 10 * 24 * 60 * 60 * 1000,
    supplierId: 'sup-utility-1',
    invoiceNumber: 'ELEC-JAN-2024',
    paymentMethod: 'bank-transfer',
    approvedBy: 'Sarah Chen',
    approvedAt: Date.now() - 9 * 24 * 60 * 60 * 1000,
    status: 'approved',
    createdBy: 'Admin User',
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000
  },
  {
    id: 'exp-2',
    expenseNumber: 'EXP-2024-002',
    category: 'food-beverage',
    department: 'fnb',
    amount: 128000,
    description: 'Fresh produce and ingredients - Weekly delivery',
    date: Date.now() - 7 * 24 * 60 * 60 * 1000,
    expenseDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
    supplierId: 'sup-food-1',
    invoiceNumber: 'INV-F&B-W02',
    paymentMethod: 'bank-transfer',
    approvedBy: 'Sarah Chen',
    approvedAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
    status: 'approved',
    createdBy: 'Chef Michael',
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000
  },
  {
    id: 'exp-3',
    expenseNumber: 'EXP-2024-003',
    category: 'housekeeping',
    department: 'housekeeping',
    amount: 35000,
    description: 'Cleaning supplies and toiletries',
    date: Date.now() - 5 * 24 * 60 * 60 * 1000,
    expenseDate: Date.now() - 5 * 24 * 60 * 60 * 1000,
    supplierId: 'sup-cleaning-1',
    invoiceNumber: 'CLN-INV-024',
    paymentMethod: 'card',
    approvedBy: 'Sarah Chen',
    approvedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    status: 'approved',
    createdBy: 'Lisa Housekeeper',
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000
  },
  {
    id: 'exp-4',
    expenseNumber: 'EXP-2024-004',
    category: 'maintenance',
    department: 'engineering',
    amount: 22500,
    description: 'HVAC system maintenance and parts',
    date: Date.now() - 4 * 24 * 60 * 60 * 1000,
    expenseDate: Date.now() - 4 * 24 * 60 * 60 * 1000,
    supplierId: 'sup-hvac-1',
    invoiceNumber: 'HVAC-SVC-156',
    paymentMethod: 'bank-transfer',
    approvedBy: 'Sarah Chen',
    approvedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    status: 'approved',
    createdBy: 'Tom Engineer',
    createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000
  },
  {
    id: 'exp-5',
    expenseNumber: 'EXP-2024-005',
    category: 'marketing',
    department: 'admin',
    amount: 18000,
    description: 'Social media advertising campaign - Q1 2024',
    date: Date.now() - 3 * 24 * 60 * 60 * 1000,
    expenseDate: Date.now() - 3 * 24 * 60 * 60 * 1000,
    invoiceNumber: 'MKT-AD-Q1-01',
    status: 'pending',
    createdBy: 'Marketing Team',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000
  },
  {
    id: 'exp-6',
    expenseNumber: 'EXP-2024-006',
    category: 'administrative',
    department: 'admin',
    amount: 12000,
    description: 'Office supplies and stationery',
    date: Date.now() - 2 * 24 * 60 * 60 * 1000,
    expenseDate: Date.now() - 2 * 24 * 60 * 60 * 1000,
    supplierId: 'sup-office-1',
    invoiceNumber: 'OFF-SUP-089',
    paymentMethod: 'card',
    status: 'pending',
    createdBy: 'Admin User',
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000
  },
  {
    id: 'exp-7',
    expenseNumber: 'EXP-2024-007',
    category: 'salary',
    department: 'hr',
    amount: 450000,
    description: 'Monthly salaries - January 2024',
    date: Date.now() - 15 * 24 * 60 * 60 * 1000,
    expenseDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
    paymentMethod: 'bank-transfer',
    approvedBy: 'Sarah Chen',
    approvedAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    status: 'approved',
    createdBy: 'HR Manager',
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000
  }
]

export const sampleAccounts: Account[] = [
  {
    id: 'acc-1001',
    accountNumber: '1001',
    accountName: 'Cash on Hand',
    accountType: 'asset',
    balance: 85000,
    currency: 'LKR',
    isActive: true,
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'acc-1002',
    accountNumber: '1002',
    accountName: 'Bank Account - Commercial Bank',
    accountType: 'asset',
    balance: 1250000,
    currency: 'LKR',
    isActive: true,
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'acc-1100',
    accountNumber: '1100',
    accountName: 'Accounts Receivable',
    accountType: 'asset',
    balance: 320000,
    currency: 'LKR',
    isActive: true,
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'acc-1200',
    accountNumber: '1200',
    accountName: 'Inventory - Food & Beverage',
    accountType: 'asset',
    balance: 450000,
    currency: 'LKR',
    isActive: true,
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'acc-2001',
    accountNumber: '2001',
    accountName: 'Accounts Payable',
    accountType: 'liability',
    balance: 280000,
    currency: 'LKR',
    isActive: true,
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'acc-2100',
    accountNumber: '2100',
    accountName: 'VAT Payable',
    accountType: 'liability',
    balance: 125000,
    currency: 'LKR',
    isActive: true,
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'acc-3001',
    accountNumber: '3001',
    accountName: 'Owner\'s Capital',
    accountType: 'equity',
    balance: 5000000,
    currency: 'LKR',
    isActive: true,
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'acc-3100',
    accountNumber: '3100',
    accountName: 'Retained Earnings',
    accountType: 'equity',
    balance: 850000,
    currency: 'LKR',
    isActive: true,
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'acc-4001',
    accountNumber: '4001',
    accountName: 'Room Revenue',
    accountType: 'revenue',
    balance: 1850000,
    currency: 'LKR',
    isActive: true,
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'acc-4002',
    accountNumber: '4002',
    accountName: 'F&B Revenue',
    accountType: 'revenue',
    balance: 620000,
    currency: 'LKR',
    isActive: true,
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'acc-4003',
    accountNumber: '4003',
    accountName: 'Other Services Revenue',
    accountType: 'revenue',
    balance: 180000,
    currency: 'LKR',
    isActive: true,
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'acc-5001',
    accountNumber: '5001',
    accountName: 'Cost of Goods Sold - Food',
    accountType: 'expense',
    balance: 245000,
    currency: 'LKR',
    isActive: true,
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'acc-5100',
    accountNumber: '5100',
    accountName: 'Payroll Expense',
    accountType: 'expense',
    balance: 450000,
    currency: 'LKR',
    isActive: true,
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'acc-5200',
    accountNumber: '5200',
    accountName: 'Utilities Expense',
    accountType: 'expense',
    balance: 45000,
    currency: 'LKR',
    isActive: true,
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'acc-5300',
    accountNumber: '5300',
    accountName: 'Maintenance & Repairs',
    accountType: 'expense',
    balance: 22500,
    currency: 'LKR',
    isActive: true,
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'acc-5400',
    accountNumber: '5400',
    accountName: 'Marketing & Advertising',
    accountType: 'expense',
    balance: 18000,
    currency: 'LKR',
    isActive: true,
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  }
]

export const sampleBudgets: Budget[] = [
  {
    id: 'budget-1',
    budgetName: 'Q1 2024 - Front Office',
    department: 'front-office',
    period: 'quarterly',
    startDate: new Date('2024-01-01').getTime(),
    endDate: new Date('2024-03-31').getTime(),
    totalBudget: 500000,
    totalActual: 385000,
    variance: -115000,
    categories: [
      { id: 'cat-1', category: 'salary', budgetedAmount: 350000, actualAmount: 300000, variance: -50000 },
      { id: 'cat-2', category: 'supplies', budgetedAmount: 50000, actualAmount: 35000, variance: -15000 },
      { id: 'cat-3', category: 'utilities', budgetedAmount: 100000, actualAmount: 50000, variance: -50000 }
    ],
    status: 'active',
    approvedBy: 'Sarah Chen',
    approvedAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    createdBy: 'Admin User',
    createdAt: Date.now() - 95 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'budget-2',
    budgetName: 'Q1 2024 - Food & Beverage',
    department: 'fnb',
    period: 'quarterly',
    startDate: new Date('2024-01-01').getTime(),
    endDate: new Date('2024-03-31').getTime(),
    totalBudget: 800000,
    totalActual: 720000,
    variance: -80000,
    categories: [
      { id: 'cat-4', category: 'food-beverage', budgetedAmount: 500000, actualAmount: 450000, variance: -50000 },
      { id: 'cat-5', category: 'salary', budgetedAmount: 250000, actualAmount: 230000, variance: -20000 },
      { id: 'cat-6', category: 'supplies', budgetedAmount: 50000, actualAmount: 40000, variance: -10000 }
    ],
    status: 'active',
    approvedBy: 'Sarah Chen',
    approvedAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    createdBy: 'Chef Michael',
    createdAt: Date.now() - 95 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'budget-3',
    budgetName: 'Q1 2024 - Housekeeping',
    department: 'housekeeping',
    period: 'quarterly',
    startDate: new Date('2024-01-01').getTime(),
    endDate: new Date('2024-03-31').getTime(),
    totalBudget: 350000,
    totalActual: 380000,
    variance: 30000,
    categories: [
      { id: 'cat-7', category: 'housekeeping', budgetedAmount: 200000, actualAmount: 220000, variance: 20000, notes: 'Increased linen replacement costs' },
      { id: 'cat-8', category: 'salary', budgetedAmount: 150000, actualAmount: 160000, variance: 10000 }
    ],
    status: 'active',
    approvedBy: 'Sarah Chen',
    approvedAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    createdBy: 'Lisa Housekeeper',
    createdAt: Date.now() - 95 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now()
  },
  {
    id: 'budget-4',
    budgetName: 'January 2024 - Marketing',
    department: 'admin',
    period: 'monthly',
    startDate: new Date('2024-01-01').getTime(),
    endDate: new Date('2024-01-31').getTime(),
    totalBudget: 100000,
    totalActual: 95000,
    variance: -5000,
    categories: [
      { id: 'cat-9', category: 'marketing', budgetedAmount: 80000, actualAmount: 78000, variance: -2000 },
      { id: 'cat-10', category: 'administrative', budgetedAmount: 20000, actualAmount: 17000, variance: -3000 }
    ],
    status: 'closed',
    approvedBy: 'Sarah Chen',
    approvedAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
    createdBy: 'Marketing Team',
    createdAt: Date.now() - 65 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 30 * 24 * 60 * 60 * 1000
  }
]

export const sampleCostCenters: CostCenter[] = [
  {
    id: 'cc-1',
    code: 'CC-FO-001',
    name: 'Front Office Operations',
    description: 'Reception, reservations, and guest check-in/check-out services',
    type: 'service',
    department: 'front-office',
    managerId: 'emp-1',
    managerName: 'Emily Rodriguez',
    isActive: true,
    budget: 500000,
    actualCost: 385000,
    allocatedExpenses: ['exp-1', 'exp-6'],
    costDriverMetric: 'guest-nights',
    allocationBasis: 'revenue',
    allocationPercentage: 15,
    notes: 'Primary guest-facing service center',
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
    createdBy: 'system'
  },
  {
    id: 'cc-2',
    code: 'CC-HK-001',
    name: 'Housekeeping Department',
    description: 'Room cleaning, linen management, and property maintenance',
    type: 'service',
    department: 'housekeeping',
    managerId: 'emp-2',
    managerName: 'Lisa Martinez',
    isActive: true,
    budget: 350000,
    actualCost: 380000,
    allocatedExpenses: ['exp-3'],
    costDriverMetric: 'rooms-cleaned',
    allocationBasis: 'square-footage',
    allocationPercentage: 12,
    notes: 'Includes laundry and room preparation',
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
    createdBy: 'system'
  },
  {
    id: 'cc-3',
    code: 'CC-FNB-001',
    name: 'Food & Beverage Production',
    description: 'Kitchen operations, food preparation, and menu planning',
    type: 'revenue',
    department: 'fnb',
    managerId: 'emp-3',
    managerName: 'Chef Michael',
    isActive: true,
    budget: 800000,
    actualCost: 720000,
    allocatedExpenses: ['exp-2'],
    costDriverMetric: 'covers-served',
    allocationBasis: 'revenue',
    allocationPercentage: 30,
    notes: 'Includes restaurant and room service kitchen',
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
    createdBy: 'system'
  },
  {
    id: 'cc-4',
    code: 'CC-ENG-001',
    name: 'Engineering & Maintenance',
    description: 'Building maintenance, repairs, and technical services',
    type: 'support',
    department: 'engineering',
    managerId: 'emp-4',
    managerName: 'Tom Engineer',
    isActive: true,
    budget: 250000,
    actualCost: 225000,
    allocatedExpenses: ['exp-4'],
    costDriverMetric: 'work-orders',
    allocationBasis: 'square-footage',
    allocationPercentage: 10,
    notes: 'Preventive and corrective maintenance',
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
    createdBy: 'system'
  },
  {
    id: 'cc-5',
    code: 'CC-ADM-001',
    name: 'Administration & Finance',
    description: 'Accounting, HR, and general administration',
    type: 'administrative',
    department: 'admin',
    managerId: 'emp-5',
    managerName: 'Sarah Chen',
    isActive: true,
    budget: 400000,
    actualCost: 385000,
    allocatedExpenses: ['exp-1', 'exp-5', 'exp-6'],
    costDriverMetric: 'headcount',
    allocationBasis: 'headcount',
    allocationPercentage: 8,
    notes: 'Support functions and overhead',
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
    createdBy: 'system'
  },
  {
    id: 'cc-6',
    code: 'CC-MKT-001',
    name: 'Sales & Marketing',
    description: 'Revenue generation, promotion, and brand management',
    type: 'support',
    department: 'admin',
    managerId: 'emp-6',
    managerName: 'Marketing Manager',
    isActive: true,
    budget: 300000,
    actualCost: 275000,
    allocatedExpenses: ['exp-5'],
    costDriverMetric: 'bookings-generated',
    allocationBasis: 'revenue',
    allocationPercentage: 5,
    notes: 'Digital marketing, partnerships, and sales efforts',
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
    createdBy: 'system'
  },
  {
    id: 'cc-7',
    code: 'CC-HR-001',
    name: 'Human Resources',
    description: 'Recruitment, training, payroll, and employee relations',
    type: 'administrative',
    department: 'hr',
    managerId: 'emp-7',
    managerName: 'HR Manager',
    isActive: true,
    budget: 550000,
    actualCost: 520000,
    allocatedExpenses: ['exp-7'],
    costDriverMetric: 'employee-count',
    allocationBasis: 'headcount',
    allocationPercentage: 6,
    notes: 'Payroll and benefits administration',
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
    createdBy: 'system'
  }
]

export const sampleProfitCenters: ProfitCenter[] = [
  {
    id: 'pc-1',
    code: 'PC-ROOMS',
    name: 'Rooms Division',
    description: 'Room sales and accommodation revenue',
    department: 'front-office',
    managerId: 'emp-1',
    managerName: 'Emily Rodriguez',
    costCenterIds: ['cc-1', 'cc-2'],
    status: 'active',
    targetRevenue: 2500000,
    targetProfit: 1500000,
    targetMargin: 60,
    actualRevenue: 1850000,
    actualCost: 765000,
    actualProfit: 1085000,
    actualMargin: 58.6,
    revenueStreams: [
      { id: 'rs-1', name: 'Standard Rooms', category: 'room', revenue: 850000, percentage: 45.9 },
      { id: 'rs-2', name: 'Deluxe Rooms', category: 'room', revenue: 620000, percentage: 33.5 },
      { id: 'rs-3', name: 'Suites', category: 'room', revenue: 380000, percentage: 20.6 }
    ],
    performanceMetrics: {
      period: 'Q1 2024',
      revenue: 1850000,
      directCosts: 385000,
      allocatedCosts: 380000,
      totalCosts: 765000,
      grossProfit: 1465000,
      netProfit: 1085000,
      grossMargin: 79.2,
      netMargin: 58.6,
      roi: 141.8,
      revenueTrend: 'increasing',
      profitTrend: 'increasing'
    },
    notes: 'Primary revenue driver for the hotel',
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
    createdBy: 'system'
  },
  {
    id: 'pc-2',
    code: 'PC-FNB',
    name: 'Food & Beverage Division',
    description: 'Restaurant, bar, room service, and catering operations',
    department: 'fnb',
    managerId: 'emp-3',
    managerName: 'Chef Michael',
    costCenterIds: ['cc-3'],
    status: 'active',
    targetRevenue: 1000000,
    targetProfit: 250000,
    targetMargin: 25,
    actualRevenue: 620000,
    actualCost: 720000,
    actualProfit: -100000,
    actualMargin: -16.1,
    revenueStreams: [
      { id: 'rs-4', name: 'Restaurant Sales', category: 'fnb', revenue: 350000, percentage: 56.5 },
      { id: 'rs-5', name: 'Bar Sales', category: 'fnb', revenue: 150000, percentage: 24.2 },
      { id: 'rs-6', name: 'Room Service', category: 'fnb', revenue: 80000, percentage: 12.9 },
      { id: 'rs-7', name: 'Catering & Events', category: 'fnb', revenue: 40000, percentage: 6.5 }
    ],
    performanceMetrics: {
      period: 'Q1 2024',
      revenue: 620000,
      directCosts: 450000,
      allocatedCosts: 270000,
      totalCosts: 720000,
      grossProfit: 170000,
      netProfit: -100000,
      grossMargin: 27.4,
      netMargin: -16.1,
      roi: -13.9,
      revenueTrend: 'stable',
      profitTrend: 'decreasing'
    },
    notes: 'Underperforming - requires cost optimization',
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
    createdBy: 'system'
  },
  {
    id: 'pc-3',
    code: 'PC-OTHER',
    name: 'Other Services',
    description: 'Spa, laundry, and miscellaneous revenue streams',
    department: 'admin',
    managerId: 'emp-5',
    managerName: 'Sarah Chen',
    costCenterIds: ['cc-5'],
    status: 'active',
    targetRevenue: 300000,
    targetProfit: 150000,
    targetMargin: 50,
    actualRevenue: 180000,
    actualCost: 90000,
    actualProfit: 90000,
    actualMargin: 50,
    revenueStreams: [
      { id: 'rs-8', name: 'Spa Services', category: 'spa', revenue: 80000, percentage: 44.4 },
      { id: 'rs-9', name: 'Laundry Services', category: 'extra-services', revenue: 45000, percentage: 25 },
      { id: 'rs-10', name: 'Business Center', category: 'extra-services', revenue: 30000, percentage: 16.7 },
      { id: 'rs-11', name: 'Parking', category: 'extra-services', revenue: 25000, percentage: 13.9 }
    ],
    performanceMetrics: {
      period: 'Q1 2024',
      revenue: 180000,
      directCosts: 45000,
      allocatedCosts: 45000,
      totalCosts: 90000,
      grossProfit: 135000,
      netProfit: 90000,
      grossMargin: 75,
      netMargin: 50,
      roi: 100,
      revenueTrend: 'stable',
      profitTrend: 'stable'
    },
    notes: 'High margin service offerings',
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now(),
    createdBy: 'system'
  }
]

export const sampleCostCenterReports: CostCenterReport[] = [
  {
    id: 'ccr-1',
    reportNumber: 'CCR-2024-Q1-001',
    costCenterId: 'cc-1',
    costCenterCode: 'CC-FO-001',
    costCenterName: 'Front Office Operations',
    period: {
      from: new Date('2024-01-01').getTime(),
      to: new Date('2024-03-31').getTime()
    },
    budgetedAmount: 500000,
    actualAmount: 385000,
    variance: -115000,
    variancePercentage: -23,
    expenseBreakdown: [
      {
        category: 'salary',
        department: 'front-office',
        budgeted: 350000,
        actual: 300000,
        variance: -50000,
        variancePercentage: -14.3,
        transactions: 90,
        averageTransactionValue: 3333
      },
      {
        category: 'supplies',
        department: 'front-office',
        budgeted: 50000,
        actual: 35000,
        variance: -15000,
        variancePercentage: -30,
        transactions: 45,
        averageTransactionValue: 778
      },
      {
        category: 'utilities',
        department: 'front-office',
        budgeted: 100000,
        actual: 50000,
        variance: -50000,
        variancePercentage: -50,
        transactions: 3,
        averageTransactionValue: 16667
      }
    ],
    monthlyTrend: [
      {
        month: 'January 2024',
        period: new Date('2024-01-01').getTime(),
        budgeted: 166667,
        actual: 128333,
        variance: -38334,
        variancePercentage: -23
      },
      {
        month: 'February 2024',
        period: new Date('2024-02-01').getTime(),
        budgeted: 166667,
        actual: 128333,
        variance: -38334,
        variancePercentage: -23
      },
      {
        month: 'March 2024',
        period: new Date('2024-03-01').getTime(),
        budgeted: 166666,
        actual: 128334,
        variance: -38332,
        variancePercentage: -23
      }
    ],
    topExpenseCategories: [
      { category: 'salary', amount: 300000, percentage: 77.9 },
      { category: 'utilities', amount: 50000, percentage: 13 },
      { category: 'supplies', amount: 35000, percentage: 9.1 }
    ],
    comparisonToPreviousPeriod: {
      previousAmount: 420000,
      change: -35000,
      changePercentage: -8.3
    },
    recommendations: [
      'Excellent cost control - 23% under budget',
      'Consider reviewing utility contracts for further savings',
      'Staff productivity is high - maintain current levels'
    ],
    generatedAt: Date.now(),
    generatedBy: 'system'
  },
  {
    id: 'ccr-2',
    reportNumber: 'CCR-2024-Q1-002',
    costCenterId: 'cc-2',
    costCenterCode: 'CC-HK-001',
    costCenterName: 'Housekeeping Department',
    period: {
      from: new Date('2024-01-01').getTime(),
      to: new Date('2024-03-31').getTime()
    },
    budgetedAmount: 350000,
    actualAmount: 380000,
    variance: 30000,
    variancePercentage: 8.6,
    expenseBreakdown: [
      {
        category: 'housekeeping',
        department: 'housekeeping',
        budgeted: 200000,
        actual: 220000,
        variance: 20000,
        variancePercentage: 10,
        transactions: 65,
        averageTransactionValue: 3385
      },
      {
        category: 'salary',
        department: 'housekeeping',
        budgeted: 150000,
        actual: 160000,
        variance: 10000,
        variancePercentage: 6.7,
        transactions: 90,
        averageTransactionValue: 1778
      }
    ],
    monthlyTrend: [
      {
        month: 'January 2024',
        period: new Date('2024-01-01').getTime(),
        budgeted: 116667,
        actual: 126667,
        variance: 10000,
        variancePercentage: 8.6
      },
      {
        month: 'February 2024',
        period: new Date('2024-02-01').getTime(),
        budgeted: 116667,
        actual: 126667,
        variance: 10000,
        variancePercentage: 8.6
      },
      {
        month: 'March 2024',
        period: new Date('2024-03-01').getTime(),
        budgeted: 116666,
        actual: 126666,
        variance: 10000,
        variancePercentage: 8.6
      }
    ],
    topExpenseCategories: [
      { category: 'housekeeping', amount: 220000, percentage: 57.9 },
      { category: 'salary', amount: 160000, percentage: 42.1 }
    ],
    comparisonToPreviousPeriod: {
      previousAmount: 360000,
      change: 20000,
      changePercentage: 5.6
    },
    recommendations: [
      'Over budget due to increased linen replacement costs',
      'Review vendor contracts for housekeeping supplies',
      'Consider bulk purchasing to reduce unit costs',
      'Implement linen lifecycle tracking to optimize replacement schedule'
    ],
    generatedAt: Date.now(),
    generatedBy: 'system'
  },
  {
    id: 'ccr-3',
    reportNumber: 'CCR-2024-Q1-003',
    costCenterId: 'cc-3',
    costCenterCode: 'CC-FNB-001',
    costCenterName: 'Food & Beverage Production',
    period: {
      from: new Date('2024-01-01').getTime(),
      to: new Date('2024-03-31').getTime()
    },
    budgetedAmount: 800000,
    actualAmount: 720000,
    variance: -80000,
    variancePercentage: -10,
    expenseBreakdown: [
      {
        category: 'food-beverage',
        department: 'fnb',
        budgeted: 500000,
        actual: 450000,
        variance: -50000,
        variancePercentage: -10,
        transactions: 120,
        averageTransactionValue: 3750
      },
      {
        category: 'salary',
        department: 'fnb',
        budgeted: 250000,
        actual: 230000,
        variance: -20000,
        variancePercentage: -8,
        transactions: 90,
        averageTransactionValue: 2556
      },
      {
        category: 'supplies',
        department: 'fnb',
        budgeted: 50000,
        actual: 40000,
        variance: -10000,
        variancePercentage: -20,
        transactions: 35,
        averageTransactionValue: 1143
      }
    ],
    monthlyTrend: [
      {
        month: 'January 2024',
        period: new Date('2024-01-01').getTime(),
        budgeted: 266667,
        actual: 240000,
        variance: -26667,
        variancePercentage: -10
      },
      {
        month: 'February 2024',
        period: new Date('2024-02-01').getTime(),
        budgeted: 266667,
        actual: 240000,
        variance: -26667,
        variancePercentage: -10
      },
      {
        month: 'March 2024',
        period: new Date('2024-03-01').getTime(),
        budgeted: 266666,
        actual: 240000,
        variance: -26666,
        variancePercentage: -10
      }
    ],
    topExpenseCategories: [
      { category: 'food-beverage', amount: 450000, percentage: 62.5 },
      { category: 'salary', amount: 230000, percentage: 31.9 },
      { category: 'supplies', amount: 40000, percentage: 5.6 }
    ],
    comparisonToPreviousPeriod: {
      previousAmount: 750000,
      change: -30000,
      changePercentage: -4
    },
    recommendations: [
      'Good cost control - 10% under budget',
      'Food cost percentage is optimal at 62.5%',
      'Consider menu engineering to improve margins',
      'Staff productivity is excellent'
    ],
    generatedAt: Date.now(),
    generatedBy: 'system'
  }
]

export const sampleProfitCenterReports: ProfitCenterReport[] = [
  {
    id: 'pcr-1',
    reportNumber: 'PCR-2024-Q1-001',
    profitCenterId: 'pc-1',
    profitCenterCode: 'PC-ROOMS',
    profitCenterName: 'Rooms Division',
    period: {
      from: new Date('2024-01-01').getTime(),
      to: new Date('2024-03-31').getTime()
    },
    revenue: 1850000,
    directCosts: 385000,
    allocatedCosts: 380000,
    totalCosts: 765000,
    grossProfit: 1465000,
    netProfit: 1085000,
    grossMargin: 79.2,
    netMargin: 58.6,
    targetRevenue: 2500000,
    targetProfit: 1500000,
    targetMargin: 60,
    revenueVariance: -650000,
    profitVariance: -415000,
    marginVariance: -1.4,
    revenueByStream: [
      { id: 'rs-1', name: 'Standard Rooms', category: 'room', revenue: 850000, percentage: 45.9 },
      { id: 'rs-2', name: 'Deluxe Rooms', category: 'room', revenue: 620000, percentage: 33.5 },
      { id: 'rs-3', name: 'Suites', category: 'room', revenue: 380000, percentage: 20.6 }
    ],
    costByCenter: [
      { costCenterId: 'cc-1', costCenterName: 'Front Office Operations', amount: 385000, percentage: 50.3 },
      { costCenterId: 'cc-2', costCenterName: 'Housekeeping Department', amount: 380000, percentage: 49.7 }
    ],
    monthlyTrend: [
      {
        month: 'January 2024',
        period: new Date('2024-01-01').getTime(),
        revenue: 600000,
        costs: 250000,
        profit: 350000,
        margin: 58.3
      },
      {
        month: 'February 2024',
        period: new Date('2024-02-01').getTime(),
        revenue: 620000,
        costs: 255000,
        profit: 365000,
        margin: 58.9
      },
      {
        month: 'March 2024',
        period: new Date('2024-03-01').getTime(),
        revenue: 630000,
        costs: 260000,
        profit: 370000,
        margin: 58.7
      }
    ],
    departmentalContribution: [
      {
        department: 'front-office',
        revenue: 1850000,
        costs: 385000,
        profit: 1465000,
        margin: 79.2,
        revenuePercentage: 100,
        contributionPercentage: 100
      }
    ],
    performanceRating: 'good',
    keyInsights: [
      'Strong occupancy rates driving consistent revenue',
      'Excellent cost control with 79.2% gross margin',
      'Standard rooms are the primary revenue driver at 45.9%',
      'Revenue trending upward month-over-month'
    ],
    recommendations: [
      'Focus on upselling to deluxe and suite categories',
      'Implement dynamic pricing to optimize RevPAR',
      'Maintain excellent housekeeping standards',
      'Target 10% revenue increase through marketing initiatives'
    ],
    generatedAt: Date.now(),
    generatedBy: 'system'
  },
  {
    id: 'pcr-2',
    reportNumber: 'PCR-2024-Q1-002',
    profitCenterId: 'pc-2',
    profitCenterCode: 'PC-FNB',
    profitCenterName: 'Food & Beverage Division',
    period: {
      from: new Date('2024-01-01').getTime(),
      to: new Date('2024-03-31').getTime()
    },
    revenue: 620000,
    directCosts: 450000,
    allocatedCosts: 270000,
    totalCosts: 720000,
    grossProfit: 170000,
    netProfit: -100000,
    grossMargin: 27.4,
    netMargin: -16.1,
    targetRevenue: 1000000,
    targetProfit: 250000,
    targetMargin: 25,
    revenueVariance: -380000,
    profitVariance: -350000,
    marginVariance: -41.1,
    revenueByStream: [
      { id: 'rs-4', name: 'Restaurant Sales', category: 'fnb', revenue: 350000, percentage: 56.5 },
      { id: 'rs-5', name: 'Bar Sales', category: 'fnb', revenue: 150000, percentage: 24.2 },
      { id: 'rs-6', name: 'Room Service', category: 'fnb', revenue: 80000, percentage: 12.9 },
      { id: 'rs-7', name: 'Catering & Events', category: 'fnb', revenue: 40000, percentage: 6.5 }
    ],
    costByCenter: [
      { costCenterId: 'cc-3', costCenterName: 'Food & Beverage Production', amount: 720000, percentage: 100 }
    ],
    monthlyTrend: [
      {
        month: 'January 2024',
        period: new Date('2024-01-01').getTime(),
        revenue: 200000,
        costs: 240000,
        profit: -40000,
        margin: -20
      },
      {
        month: 'February 2024',
        period: new Date('2024-02-01').getTime(),
        revenue: 205000,
        costs: 240000,
        profit: -35000,
        margin: -17.1
      },
      {
        month: 'March 2024',
        period: new Date('2024-03-01').getTime(),
        revenue: 215000,
        costs: 240000,
        profit: -25000,
        margin: -11.6
      }
    ],
    departmentalContribution: [
      {
        department: 'fnb',
        revenue: 620000,
        costs: 720000,
        profit: -100000,
        margin: -16.1,
        revenuePercentage: 100,
        contributionPercentage: 100
      }
    ],
    performanceRating: 'below-average',
    keyInsights: [
      'Division is operating at a loss due to high costs',
      'Food cost percentage at 72.6% is unsustainable',
      'Revenue is 38% below target',
      'Slight improvement trend in March shows potential'
    ],
    recommendations: [
      'URGENT: Conduct comprehensive menu cost analysis',
      'Reduce food waste through better inventory management',
      'Review supplier contracts and negotiate better pricing',
      'Implement portion control and recipe standardization',
      'Consider menu price adjustments to improve margins',
      'Focus on high-margin items in restaurant promotions',
      'Expand catering and events business',
      'Cross-train staff to optimize labor costs'
    ],
    generatedAt: Date.now(),
    generatedBy: 'system'
  },
  {
    id: 'pcr-3',
    reportNumber: 'PCR-2024-Q1-003',
    profitCenterId: 'pc-3',
    profitCenterCode: 'PC-OTHER',
    profitCenterName: 'Other Services',
    period: {
      from: new Date('2024-01-01').getTime(),
      to: new Date('2024-03-31').getTime()
    },
    revenue: 180000,
    directCosts: 45000,
    allocatedCosts: 45000,
    totalCosts: 90000,
    grossProfit: 135000,
    netProfit: 90000,
    grossMargin: 75,
    netMargin: 50,
    targetRevenue: 300000,
    targetProfit: 150000,
    targetMargin: 50,
    revenueVariance: -120000,
    profitVariance: -60000,
    marginVariance: 0,
    revenueByStream: [
      { id: 'rs-8', name: 'Spa Services', category: 'spa', revenue: 80000, percentage: 44.4 },
      { id: 'rs-9', name: 'Laundry Services', category: 'extra-services', revenue: 45000, percentage: 25 },
      { id: 'rs-10', name: 'Business Center', category: 'extra-services', revenue: 30000, percentage: 16.7 },
      { id: 'rs-11', name: 'Parking', category: 'extra-services', revenue: 25000, percentage: 13.9 }
    ],
    costByCenter: [
      { costCenterId: 'cc-5', costCenterName: 'Administration & Finance', amount: 90000, percentage: 100 }
    ],
    monthlyTrend: [
      {
        month: 'January 2024',
        period: new Date('2024-01-01').getTime(),
        revenue: 58000,
        costs: 30000,
        profit: 28000,
        margin: 48.3
      },
      {
        month: 'February 2024',
        period: new Date('2024-02-01').getTime(),
        revenue: 60000,
        costs: 30000,
        profit: 30000,
        margin: 50
      },
      {
        month: 'March 2024',
        period: new Date('2024-03-01').getTime(),
        revenue: 62000,
        costs: 30000,
        profit: 32000,
        margin: 51.6
      }
    ],
    departmentalContribution: [
      {
        department: 'admin',
        revenue: 180000,
        costs: 90000,
        profit: 90000,
        margin: 50,
        revenuePercentage: 100,
        contributionPercentage: 100
      }
    ],
    performanceRating: 'excellent',
    keyInsights: [
      'Excellent 50% net margin achieved',
      'Spa services are the primary revenue driver',
      'Low cost structure enables high profitability',
      'Steady month-over-month growth trend'
    ],
    recommendations: [
      'Expand spa services to capture more demand',
      'Promote service packages to increase average spend',
      'Consider adding premium service offerings',
      'Market services more aggressively to hotel guests',
      'Maintain excellent margin performance'
    ],
    generatedAt: Date.now(),
    generatedBy: 'system'
  }
]
