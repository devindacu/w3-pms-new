import type { 
  GuestInvoice, 
  Payment, 
  Expense, 
  Invoice as SupplierInvoice,
  Order,
  Reservation
} from './types'

export interface FinancialPeriod {
  startDate: number
  endDate: number
  label: string
}

export interface ProfitLossStatement {
  period: FinancialPeriod
  revenue: {
    roomRevenue: number
    fnbRevenue: number
    otherRevenue: number
    totalRevenue: number
  }
  costOfSales: {
    foodCost: number
    beverageCost: number
    roomSupplies: number
    totalCostOfSales: number
  }
  grossProfit: number
  grossProfitMargin: number
  operatingExpenses: {
    salaries: number
    utilities: number
    maintenance: number
    marketing: number
    administrative: number
    other: number
    totalOperatingExpenses: number
  }
  operatingIncome: number
  operatingMargin: number
  otherIncome: number
  otherExpenses: number
  netIncome: number
  netProfitMargin: number
  generatedAt: number
}

export interface BalanceSheet {
  asOfDate: number
  assets: {
    currentAssets: {
      cash: number
      accountsReceivable: number
      inventory: number
      prepaidExpenses: number
      totalCurrentAssets: number
    }
    fixedAssets: {
      propertyPlantEquipment: number
      accumulatedDepreciation: number
      netFixedAssets: number
    }
    totalAssets: number
  }
  liabilities: {
    currentLiabilities: {
      accountsPayable: number
      accruedExpenses: number
      deferredRevenue: number
      totalCurrentLiabilities: number
    }
    longTermLiabilities: {
      loans: number
      totalLongTermLiabilities: number
    }
    totalLiabilities: number
  }
  equity: {
    retainedEarnings: number
    currentPeriodEarnings: number
    totalEquity: number
  }
  totalLiabilitiesAndEquity: number
  generatedAt: number
}

export interface CashFlowStatement {
  period: FinancialPeriod
  operatingActivities: {
    netIncome: number
    adjustments: {
      depreciation: number
      accountsReceivableChange: number
      accountsPayableChange: number
      inventoryChange: number
    }
    netCashFromOperations: number
  }
  investingActivities: {
    capitalExpenditures: number
    netCashFromInvesting: number
  }
  financingActivities: {
    loanProceeds: number
    loanRepayments: number
    netCashFromFinancing: number
  }
  netCashFlow: number
  beginningCash: number
  endingCash: number
  generatedAt: number
}

/**
 * Generate Profit & Loss Statement for a given period
 */
export function generateProfitLossStatement(
  period: FinancialPeriod,
  guestInvoices: GuestInvoice[],
  orders: Order[],
  expenses: Expense[],
  supplierInvoices: SupplierInvoice[]
): ProfitLossStatement {
  // Filter data for the period
  const periodInvoices = guestInvoices.filter(
    inv => inv.invoiceDate >= period.startDate && inv.invoiceDate <= period.endDate
  )
  const periodOrders = orders.filter(
    ord => ord.createdAt >= period.startDate && ord.createdAt <= period.endDate
  )
  const periodExpenses = expenses.filter(
    exp => exp.date >= period.startDate && exp.date <= period.endDate
  )
  const periodSupplierInvoices = supplierInvoices.filter(
    inv => inv.invoiceDate >= period.startDate && inv.invoiceDate <= period.endDate
  )

  // Calculate Revenue
  const roomRevenue = periodInvoices.reduce((sum, inv) => {
    const roomCharges = inv.lineItems
      .filter(li => li.itemType === 'room-charge')
      .reduce((s, li) => s + li.lineTotal, 0)
    return sum + roomCharges
  }, 0)

  const fnbRevenue = periodOrders.reduce((sum, ord) => sum + ord.total, 0)

  const otherRevenue = periodInvoices.reduce((sum, inv) => {
    const otherCharges = inv.lineItems
      .filter(li => li.itemType === 'extra-service' || li.itemType === 'misc')
      .reduce((s, li) => s + li.lineTotal, 0)
    return sum + otherCharges
  }, 0)

  const totalRevenue = roomRevenue + fnbRevenue + otherRevenue

  // Calculate Cost of Sales
  const foodBeverageCost = periodSupplierInvoices
    .filter(inv => inv.category === 'food-beverage')
    .reduce((sum, inv) => sum + inv.total, 0)

  const roomSuppliesCost = periodSupplierInvoices
    .filter(inv => inv.category === 'amenities')
    .reduce((sum, inv) => sum + inv.total, 0)

  const totalCostOfSales = foodBeverageCost + roomSuppliesCost

  const grossProfit = totalRevenue - totalCostOfSales
  const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

  // Calculate Operating Expenses
  const salaries = periodExpenses
    .filter(exp => exp.category === 'salaries')
    .reduce((sum, exp) => sum + exp.amount, 0)

  const utilities = periodExpenses
    .filter(exp => exp.category === 'utilities')
    .reduce((sum, exp) => sum + exp.amount, 0)

  const maintenance = periodExpenses
    .filter(exp => exp.category === 'maintenance')
    .reduce((sum, exp) => sum + exp.amount, 0)

  const marketing = periodExpenses
    .filter(exp => exp.category === 'marketing')
    .reduce((sum, exp) => sum + exp.amount, 0)

  const administrative = periodExpenses
    .filter(exp => exp.category === 'administrative')
    .reduce((sum, exp) => sum + exp.amount, 0)

  const otherExpenses = periodExpenses
    .filter(exp => !['salaries', 'utilities', 'maintenance', 'marketing', 'administrative'].includes(exp.category))
    .reduce((sum, exp) => sum + exp.amount, 0)

  const totalOperatingExpenses = salaries + utilities + maintenance + marketing + administrative + otherExpenses

  const operatingIncome = grossProfit - totalOperatingExpenses
  const operatingMargin = totalRevenue > 0 ? (operatingIncome / totalRevenue) * 100 : 0

  // For simplicity, we'll set other income/expenses to 0
  const otherIncome = 0
  const otherExpensesAmount = 0

  const netIncome = operatingIncome + otherIncome - otherExpensesAmount
  const netProfitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0

  return {
    period,
    revenue: {
      roomRevenue,
      fnbRevenue,
      otherRevenue,
      totalRevenue
    },
    costOfSales: {
      foodCost: foodBeverageCost * 0.6, // Assume 60% is food
      beverageCost: foodBeverageCost * 0.4, // Assume 40% is beverage
      roomSupplies: roomSuppliesCost,
      totalCostOfSales
    },
    grossProfit,
    grossProfitMargin,
    operatingExpenses: {
      salaries,
      utilities,
      maintenance,
      marketing,
      administrative,
      other: otherExpenses,
      totalOperatingExpenses
    },
    operatingIncome,
    operatingMargin,
    otherIncome,
    otherExpenses: otherExpensesAmount,
    netIncome,
    netProfitMargin,
    generatedAt: Date.now()
  }
}

/**
 * Generate Balance Sheet as of a specific date
 */
export function generateBalanceSheet(
  asOfDate: number,
  guestInvoices: GuestInvoice[],
  payments: Payment[],
  supplierInvoices: SupplierInvoice[],
  inventoryValue: number,
  fixedAssetsValue: number,
  accumulatedDepreciation: number,
  loansOutstanding: number
): BalanceSheet {
  // Calculate Accounts Receivable (unpaid guest invoices)
  const accountsReceivable = guestInvoices
    .filter(inv => inv.invoiceDate <= asOfDate && inv.amountDue > 0)
    .reduce((sum, inv) => sum + inv.amountDue, 0)

  // Calculate Cash (simplified - total payments received)
  const cash = payments
    .filter(p => p.processedAt <= asOfDate)
    .reduce((sum, p) => sum + p.amount, 0)

  // Current Assets
  const currentAssets = {
    cash,
    accountsReceivable,
    inventory: inventoryValue,
    prepaidExpenses: 0, // Simplified
    totalCurrentAssets: cash + accountsReceivable + inventoryValue
  }

  // Fixed Assets
  const fixedAssets = {
    propertyPlantEquipment: fixedAssetsValue,
    accumulatedDepreciation,
    netFixedAssets: fixedAssetsValue - accumulatedDepreciation
  }

  const totalAssets = currentAssets.totalCurrentAssets + fixedAssets.netFixedAssets

  // Calculate Accounts Payable (unpaid supplier invoices)
  const accountsPayable = supplierInvoices
    .filter(inv => inv.invoiceDate <= asOfDate && inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.total, 0)

  // Current Liabilities
  const currentLiabilities = {
    accountsPayable,
    accruedExpenses: 0, // Simplified
    deferredRevenue: 0, // Simplified (advance deposits)
    totalCurrentLiabilities: accountsPayable
  }

  // Long-term Liabilities
  const longTermLiabilities = {
    loans: loansOutstanding,
    totalLongTermLiabilities: loansOutstanding
  }

  const totalLiabilities = currentLiabilities.totalCurrentLiabilities + longTermLiabilities.totalLongTermLiabilities

  // Calculate net income for current period (simplified)
  const currentPeriodEarnings = guestInvoices
    .filter(inv => inv.invoiceDate <= asOfDate)
    .reduce((sum, inv) => sum + inv.grandTotal, 0) -
    supplierInvoices
      .filter(inv => inv.invoiceDate <= asOfDate)
      .reduce((sum, inv) => sum + inv.total, 0)

  // Equity
  const equity = {
    retainedEarnings: 0, // Simplified
    currentPeriodEarnings,
    totalEquity: currentPeriodEarnings
  }

  const totalLiabilitiesAndEquity = totalLiabilities + equity.totalEquity

  return {
    asOfDate,
    assets: {
      currentAssets,
      fixedAssets,
      totalAssets
    },
    liabilities: {
      currentLiabilities,
      longTermLiabilities,
      totalLiabilities
    },
    equity,
    totalLiabilitiesAndEquity,
    generatedAt: Date.now()
  }
}

/**
 * Generate Cash Flow Statement for a period
 */
export function generateCashFlowStatement(
  period: FinancialPeriod,
  profitLoss: ProfitLossStatement,
  beginningAR: number,
  endingAR: number,
  beginningAP: number,
  endingAP: number,
  beginningInventory: number,
  endingInventory: number,
  depreciation: number,
  capitalExpenditures: number,
  loanProceeds: number,
  loanRepayments: number,
  beginningCash: number
): CashFlowStatement {
  const arChange = endingAR - beginningAR
  const apChange = endingAP - beginningAP
  const inventoryChange = endingInventory - beginningInventory

  const netCashFromOperations = 
    profitLoss.netIncome +
    depreciation -
    arChange +
    apChange -
    inventoryChange

  const netCashFromInvesting = -capitalExpenditures

  const netCashFromFinancing = loanProceeds - loanRepayments

  const netCashFlow = netCashFromOperations + netCashFromInvesting + netCashFromFinancing
  const endingCash = beginningCash + netCashFlow

  return {
    period,
    operatingActivities: {
      netIncome: profitLoss.netIncome,
      adjustments: {
        depreciation,
        accountsReceivableChange: -arChange,
        accountsPayableChange: apChange,
        inventoryChange: -inventoryChange
      },
      netCashFromOperations
    },
    investingActivities: {
      capitalExpenditures,
      netCashFromInvesting
    },
    financingActivities: {
      loanProceeds,
      loanRepayments,
      netCashFromFinancing
    },
    netCashFlow,
    beginningCash,
    endingCash,
    generatedAt: Date.now()
  }
}

/**
 * Helper function to create financial periods
 */
export function createFinancialPeriod(
  startDate: Date,
  endDate: Date,
  label?: string
): FinancialPeriod {
  return {
    startDate: startDate.getTime(),
    endDate: endDate.getTime(),
    label: label || `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
  }
}

/**
 * Get common financial periods
 */
export function getCommonPeriods(): Record<string, FinancialPeriod> {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  // Current Month
  const monthStart = new Date(currentYear, currentMonth, 1)
  const monthEnd = new Date(currentYear, currentMonth + 1, 0)

  // Current Quarter
  const quarterMonth = Math.floor(currentMonth / 3) * 3
  const quarterStart = new Date(currentYear, quarterMonth, 1)
  const quarterEnd = new Date(currentYear, quarterMonth + 3, 0)

  // Current Year
  const yearStart = new Date(currentYear, 0, 1)
  const yearEnd = new Date(currentYear, 11, 31)

  // Last Month
  const lastMonthStart = new Date(currentYear, currentMonth - 1, 1)
  const lastMonthEnd = new Date(currentYear, currentMonth, 0)

  // Last Year
  const lastYearStart = new Date(currentYear - 1, 0, 1)
  const lastYearEnd = new Date(currentYear - 1, 11, 31)

  return {
    currentMonth: createFinancialPeriod(monthStart, monthEnd, 'Current Month'),
    lastMonth: createFinancialPeriod(lastMonthStart, lastMonthEnd, 'Last Month'),
    currentQuarter: createFinancialPeriod(quarterStart, quarterEnd, 'Current Quarter'),
    currentYear: createFinancialPeriod(yearStart, yearEnd, 'Current Year'),
    lastYear: createFinancialPeriod(lastYearStart, lastYearEnd, 'Last Year')
  }
}
