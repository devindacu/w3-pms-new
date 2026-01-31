import { formatCurrency, formatDate } from './helpers'
import type { 
  Invoice, 
  Payment, 
  Expense, 
  GuestInvoice,
  CostCenter,
  ProfitCenter,
  CostCenterReport,
  ProfitCenterReport
} from './types'

export type ExportFormat = 'pdf' | 'excel' | 'csv'
export type ReportType = 
  | 'income-statement'
  | 'balance-sheet'
  | 'cash-flow'
  | 'accounts-receivable'
  | 'accounts-payable'
  | 'expense-report'
  | 'revenue-report'
  | 'tax-summary'
  | 'budget-variance'
  | 'cost-center-report'
  | 'profit-center-report'
  | 'departmental-pl'

export interface ExportOptions {
  format: ExportFormat
  reportType: ReportType
  dateRange?: {
    from: Date
    to: Date
  }
  includeSummary?: boolean
  includeCharts?: boolean
  currency?: string
  groupBy?: 'month' | 'quarter' | 'year' | 'category'
}

export interface FinancialReportData {
  invoices: Invoice[]
  guestInvoices: GuestInvoice[]
  payments: Payment[]
  expenses: Expense[]
  costCenters?: CostCenter[]
  profitCenters?: ProfitCenter[]
  costCenterReports?: CostCenterReport[]
  profitCenterReports?: ProfitCenterReport[]
}

const generateCSVContent = (headers: string[], rows: string[][]): string => {
  const escapeCSV = (value: string | number): string => {
    const strValue = String(value)
    if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
      return `"${strValue.replace(/"/g, '""')}"`
    }
    return strValue
  }

  const headerRow = headers.map(escapeCSV).join(',')
  const dataRows = rows.map(row => row.map(escapeCSV).join(',')).join('\n')
  
  return `${headerRow}\n${dataRows}`
}

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const filterByDateRange = <T extends { [key: string]: any }>(
  items: T[],
  dateField: keyof T,
  dateRange?: { from: Date; to: Date }
): T[] => {
  if (!dateRange) return items
  
  return items.filter(item => {
    const itemDate = new Date(item[dateField] as number)
    return itemDate >= dateRange.from && itemDate <= dateRange.to
  })
}

export const exportIncomeStatement = (
  data: FinancialReportData,
  options: ExportOptions
): void => {
  const { format, dateRange, currency = 'LKR' } = options
  
  const filteredGuestInvoices = filterByDateRange(
    data.guestInvoices,
    'invoiceDate',
    dateRange
  )
  const filteredExpenses = filterByDateRange(
    data.expenses,
    'expenseDate',
    dateRange
  )
  
  const totalRevenue = filteredGuestInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0)
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const netIncome = totalRevenue - totalExpenses
  
  const expensesByCategory = filteredExpenses.reduce((acc, exp) => {
    const category = exp.category || 'Uncategorized'
    acc[category] = (acc[category] || 0) + exp.amount
    return acc
  }, {} as Record<string, number>)
  
  if (format === 'csv') {
    const headers = ['Category', 'Amount', 'Percentage']
    const rows: string[][] = []
    
    rows.push(['REVENUE', '', ''])
    rows.push(['Total Revenue', formatCurrency(totalRevenue, currency), '100%'])
    rows.push(['', '', ''])
    
    rows.push(['EXPENSES', '', ''])
    Object.entries(expensesByCategory).forEach(([category, amount]) => {
      const percentage = totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(2) : '0'
      rows.push([category, formatCurrency(amount, currency), `${percentage}%`])
    })
    rows.push(['Total Expenses', formatCurrency(totalExpenses, currency), ''])
    rows.push(['', '', ''])
    
    rows.push(['NET INCOME', formatCurrency(netIncome, currency), ''])
    
    const csvContent = generateCSVContent(headers, rows)
    const filename = `income-statement-${formatDate(new Date())}.csv`
    downloadFile(csvContent, filename, 'text/csv')
  } else if (format === 'excel') {
    const headers = ['Category', 'Amount', 'Percentage']
    const rows: string[][] = []
    
    rows.push(['Income Statement', '', ''])
    if (dateRange) {
      rows.push([`Period: ${formatDate(dateRange.from)} to ${formatDate(dateRange.to)}`, '', ''])
    }
    rows.push(['', '', ''])
    
    rows.push(['REVENUE', '', ''])
    rows.push(['Total Revenue', formatCurrency(totalRevenue, currency), '100%'])
    rows.push(['', '', ''])
    
    rows.push(['EXPENSES', '', ''])
    Object.entries(expensesByCategory).forEach(([category, amount]) => {
      const percentage = totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(2) : '0'
      rows.push([category, formatCurrency(amount, currency), `${percentage}%`])
    })
    rows.push(['Total Expenses', formatCurrency(totalExpenses, currency), ''])
    rows.push(['', '', ''])
    
    rows.push(['NET INCOME', formatCurrency(netIncome, currency), ''])
    rows.push(['Net Profit Margin', '', totalRevenue > 0 ? `${((netIncome / totalRevenue) * 100).toFixed(2)}%` : '0%'])
    
    const csvContent = generateCSVContent(headers, rows)
    const filename = `income-statement-${formatDate(new Date())}.csv`
    downloadFile(csvContent, filename, 'text/csv')
  }
}

export const exportBalanceSheet = (
  data: FinancialReportData,
  options: ExportOptions
): void => {
  const { format, currency = 'LKR' } = options
  
  const totalReceivables = data.guestInvoices.reduce((sum, inv) => sum + inv.amountDue, 0)
  const totalPayables = data.invoices
    .filter(inv => inv.status !== 'posted' && inv.status !== 'approved')
    .reduce((sum, inv) => sum + inv.total, 0)
  
  const totalAssets = totalReceivables
  const totalLiabilities = totalPayables
  const equity = totalAssets - totalLiabilities
  
  if (format === 'csv' || format === 'excel') {
    const headers = ['Account', 'Amount']
    const rows: string[][] = []
    
    rows.push(['Balance Sheet', ''])
    rows.push([`As of ${formatDate(new Date())}`, ''])
    rows.push(['', ''])
    
    rows.push(['ASSETS', ''])
    rows.push(['Accounts Receivable', formatCurrency(totalReceivables, currency)])
    rows.push(['Total Assets', formatCurrency(totalAssets, currency)])
    rows.push(['', ''])
    
    rows.push(['LIABILITIES', ''])
    rows.push(['Accounts Payable', formatCurrency(totalPayables, currency)])
    rows.push(['Total Liabilities', formatCurrency(totalLiabilities, currency)])
    rows.push(['', ''])
    
    rows.push(['EQUITY', ''])
    rows.push(['Total Equity', formatCurrency(equity, currency)])
    rows.push(['', ''])
    
    rows.push(['TOTAL LIABILITIES & EQUITY', formatCurrency(totalLiabilities + equity, currency)])
    
    const csvContent = generateCSVContent(headers, rows)
    const filename = `balance-sheet-${formatDate(new Date())}.csv`
    downloadFile(csvContent, filename, 'text/csv')
  }
}

export const exportCashFlow = (
  data: FinancialReportData,
  options: ExportOptions
): void => {
  const { format, dateRange, currency = 'LKR' } = options
  
  const filteredPayments = filterByDateRange(
    data.payments,
    'processedAt',
    dateRange
  )
  const filteredExpenses = filterByDateRange(
    data.expenses,
    'expenseDate',
    dateRange
  )
  
  const cashInflows = filteredPayments.reduce((sum, p) => sum + p.amount, 0)
  const cashOutflows = filteredExpenses
    .filter(e => e.approvedBy)
    .reduce((sum, e) => sum + e.amount, 0)
  const netCashFlow = cashInflows - cashOutflows
  
  if (format === 'csv' || format === 'excel') {
    const headers = ['Activity', 'Amount']
    const rows: string[][] = []
    
    rows.push(['Cash Flow Statement', ''])
    if (dateRange) {
      rows.push([`Period: ${formatDate(dateRange.from)} to ${formatDate(dateRange.to)}`, ''])
    }
    rows.push(['', ''])
    
    rows.push(['OPERATING ACTIVITIES', ''])
    rows.push(['Cash from Operations (Payments Received)', formatCurrency(cashInflows, currency)])
    rows.push(['Cash for Operations (Expenses Paid)', formatCurrency(-cashOutflows, currency)])
    rows.push(['Net Cash from Operating Activities', formatCurrency(cashInflows - cashOutflows, currency)])
    rows.push(['', ''])
    
    rows.push(['NET INCREASE IN CASH', formatCurrency(netCashFlow, currency)])
    
    const csvContent = generateCSVContent(headers, rows)
    const filename = `cash-flow-${formatDate(new Date())}.csv`
    downloadFile(csvContent, filename, 'text/csv')
  }
}

export const exportAccountsReceivable = (
  data: FinancialReportData,
  options: ExportOptions
): void => {
  const { format, currency = 'LKR' } = options
  
  const arInvoices = data.guestInvoices.filter(inv => inv.amountDue > 0)
  
  if (format === 'csv' || format === 'excel') {
    const headers = ['Invoice Number', 'Guest Name', 'Invoice Date', 'Due Date', 'Total Amount', 'Amount Paid', 'Amount Due', 'Days Overdue']
    const rows: string[][] = arInvoices.map(inv => {
      const daysOverdue = inv.dueDate 
        ? Math.max(0, Math.floor((Date.now() - inv.dueDate) / (1000 * 60 * 60 * 24)))
        : 0
      
      return [
        inv.invoiceNumber,
        inv.guestName,
        formatDate(inv.invoiceDate),
        inv.dueDate ? formatDate(inv.dueDate) : 'N/A',
        formatCurrency(inv.grandTotal, currency),
        formatCurrency(inv.amountPaid, currency),
        formatCurrency(inv.amountDue, currency),
        daysOverdue.toString()
      ]
    })
    
    const totalDue = arInvoices.reduce((sum, inv) => sum + inv.amountDue, 0)
    rows.push(['', '', '', '', '', 'TOTAL', formatCurrency(totalDue, currency), ''])
    
    const csvContent = generateCSVContent(headers, rows)
    const filename = `accounts-receivable-${formatDate(new Date())}.csv`
    downloadFile(csvContent, filename, 'text/csv')
  }
}

export const exportAccountsPayable = (
  data: FinancialReportData,
  options: ExportOptions
): void => {
  const { format, currency = 'LKR' } = options
  
  const apInvoices = data.invoices.filter(
    inv => inv.status !== 'posted' && inv.status !== 'approved'
  )
  
  if (format === 'csv' || format === 'excel') {
    const headers = ['Invoice Number', 'Supplier', 'Invoice Date', 'Due Date', 'Amount', 'Status', 'Days Overdue']
    const rows: string[][] = apInvoices.map(inv => {
      const daysOverdue = inv.dueDate 
        ? Math.max(0, Math.floor((Date.now() - inv.dueDate) / (1000 * 60 * 60 * 24)))
        : 0
      
      return [
        inv.invoiceNumber,
        inv.supplierId || 'Unknown',
        formatDate(inv.invoiceDate),
        inv.dueDate ? formatDate(inv.dueDate) : 'N/A',
        formatCurrency(inv.total, currency),
        inv.status,
        daysOverdue.toString()
      ]
    })
    
    const totalPayable = apInvoices.reduce((sum, inv) => sum + inv.total, 0)
    rows.push(['', '', '', '', formatCurrency(totalPayable, currency), '', ''])
    
    const csvContent = generateCSVContent(headers, rows)
    const filename = `accounts-payable-${formatDate(new Date())}.csv`
    downloadFile(csvContent, filename, 'text/csv')
  }
}

export const exportExpenseReport = (
  data: FinancialReportData,
  options: ExportOptions
): void => {
  const { format, dateRange, currency = 'LKR', groupBy = 'category' } = options
  
  const filteredExpenses = filterByDateRange(
    data.expenses,
    'expenseDate',
    dateRange
  )
  
  if (format === 'csv' || format === 'excel') {
    if (groupBy === 'category') {
      const expensesByCategory = filteredExpenses.reduce((acc, exp) => {
        const category = exp.category || 'Uncategorized'
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(exp)
        return acc
      }, {} as Record<string, Expense[]>)
      
      const headers = ['Category', 'Date', 'Description', 'Amount', 'Status']
      const rows: string[][] = []
      
      Object.entries(expensesByCategory).forEach(([category, expenses]) => {
        rows.push([category, '', '', '', ''])
        expenses.forEach(exp => {
          rows.push([
            '',
            formatDate(exp.expenseDate),
            exp.description || '',
            formatCurrency(exp.amount, currency),
            exp.approvedBy ? 'Approved' : 'Pending'
          ])
        })
        const categoryTotal = expenses.reduce((sum, e) => sum + e.amount, 0)
        rows.push(['', '', 'Subtotal', formatCurrency(categoryTotal, currency), ''])
        rows.push(['', '', '', '', ''])
      })
      
      const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
      rows.push(['', '', 'TOTAL', formatCurrency(total, currency), ''])
      
      const csvContent = generateCSVContent(headers, rows)
      const filename = `expense-report-${formatDate(new Date())}.csv`
      downloadFile(csvContent, filename, 'text/csv')
    } else {
      const headers = ['Date', 'Category', 'Description', 'Amount', 'Status', 'Approved By']
      const rows: string[][] = filteredExpenses.map(exp => [
        formatDate(exp.expenseDate),
        exp.category || 'Uncategorized',
        exp.description || '',
        formatCurrency(exp.amount, currency),
        exp.approvedBy ? 'Approved' : 'Pending',
        exp.approvedBy || ''
      ])
      
      const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
      rows.push(['', '', 'TOTAL', formatCurrency(total, currency), '', ''])
      
      const csvContent = generateCSVContent(headers, rows)
      const filename = `expense-report-${formatDate(new Date())}.csv`
      downloadFile(csvContent, filename, 'text/csv')
    }
  }
}

export const exportRevenueReport = (
  data: FinancialReportData,
  options: ExportOptions
): void => {
  const { format, dateRange, currency = 'LKR', groupBy = 'month' } = options
  
  const filteredInvoices = filterByDateRange(
    data.guestInvoices,
    'invoiceDate',
    dateRange
  )
  
  if (format === 'csv' || format === 'excel') {
    if (groupBy === 'month') {
      const revenueByMonth = filteredInvoices.reduce((acc, inv) => {
        const date = new Date(inv.invoiceDate)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        acc[monthKey] = (acc[monthKey] || 0) + inv.grandTotal
        return acc
      }, {} as Record<string, number>)
      
      const headers = ['Month', 'Revenue', 'Invoice Count']
      const rows: string[][] = Object.entries(revenueByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, revenue]) => {
          const count = filteredInvoices.filter(inv => {
            const date = new Date(inv.invoiceDate)
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` === month
          }).length
          
          return [month, formatCurrency(revenue, currency), count.toString()]
        })
      
      const total = filteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0)
      rows.push(['TOTAL', formatCurrency(total, currency), filteredInvoices.length.toString()])
      
      const csvContent = generateCSVContent(headers, rows)
      const filename = `revenue-report-${formatDate(new Date())}.csv`
      downloadFile(csvContent, filename, 'text/csv')
    } else {
      const headers = ['Invoice Number', 'Guest', 'Date', 'Subtotal', 'Tax', 'Total', 'Status']
      const rows: string[][] = filteredInvoices.map(inv => [
        inv.invoiceNumber,
        inv.guestName,
        formatDate(inv.invoiceDate),
        formatCurrency(inv.subtotal, currency),
        formatCurrency(inv.totalTax, currency),
        formatCurrency(inv.grandTotal, currency),
        inv.status
      ])
      
      const total = filteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0)
      rows.push(['', '', 'TOTAL', '', '', formatCurrency(total, currency), ''])
      
      const csvContent = generateCSVContent(headers, rows)
      const filename = `revenue-report-${formatDate(new Date())}.csv`
      downloadFile(csvContent, filename, 'text/csv')
    }
  }
}

export const exportTaxSummary = (
  data: FinancialReportData,
  options: ExportOptions
): void => {
  const { format, dateRange, currency = 'LKR' } = options
  
  const filteredInvoices = filterByDateRange(
    data.guestInvoices,
    'invoiceDate',
    dateRange
  )
  
  const taxSummary = filteredInvoices.reduce((acc, inv) => {
    inv.taxes?.forEach(tax => {
      if (!acc[tax.name]) {
        acc[tax.name] = { amount: 0, count: 0 }
      }
      acc[tax.name].amount += tax.amount
      acc[tax.name].count += 1
    })
    return acc
  }, {} as Record<string, { amount: number; count: number }>)
  
  if (format === 'csv' || format === 'excel') {
    const headers = ['Tax Type', 'Total Amount', 'Invoice Count']
    const rows: string[][] = Object.entries(taxSummary).map(([name, data]) => [
      name,
      formatCurrency(data.amount, currency),
      data.count.toString()
    ])
    
    const total = Object.values(taxSummary).reduce((sum, data) => sum + data.amount, 0)
    rows.push(['TOTAL', formatCurrency(total, currency), ''])
    
    const csvContent = generateCSVContent(headers, rows)
    const filename = `tax-summary-${formatDate(new Date())}.csv`
    downloadFile(csvContent, filename, 'text/csv')
  }
}

export const exportCostCenterReport = (
  data: FinancialReportData,
  options: ExportOptions
): void => {
  const { format, currency = 'LKR' } = options
  
  if (!data.costCenterReports || data.costCenterReports.length === 0) {
    return
  }
  
  if (format === 'csv' || format === 'excel') {
    const headers = ['Cost Center', 'Period', 'Total Costs', 'Budget', 'Variance', 'Variance %']
    const rows: string[][] = data.costCenterReports.map(report => {
      const variance = report.budgetAmount - report.actualAmount
      const variancePercent = report.budgetAmount > 0 
        ? ((variance / report.budgetAmount) * 100).toFixed(2)
        : '0'
      
      return [
        report.costCenterId,
        report.period,
        formatCurrency(report.actualAmount, currency),
        formatCurrency(report.budgetAmount, currency),
        formatCurrency(variance, currency),
        `${variancePercent}%`
      ]
    })
    
    const csvContent = generateCSVContent(headers, rows)
    const filename = `cost-center-report-${formatDate(new Date())}.csv`
    downloadFile(csvContent, filename, 'text/csv')
  }
}

export const exportProfitCenterReport = (
  data: FinancialReportData,
  options: ExportOptions
): void => {
  const { format, currency = 'LKR' } = options
  
  if (!data.profitCenterReports || data.profitCenterReports.length === 0) {
    return
  }
  
  if (format === 'csv' || format === 'excel') {
    const headers = ['Profit Center', 'Period', 'Revenue', 'Costs', 'Profit', 'Margin %']
    const rows: string[][] = data.profitCenterReports.map(report => {
      const profit = report.revenueAmount - report.costAmount
      const margin = report.revenueAmount > 0 
        ? ((profit / report.revenueAmount) * 100).toFixed(2)
        : '0'
      
      return [
        report.profitCenterId,
        report.period,
        formatCurrency(report.revenueAmount, currency),
        formatCurrency(report.costAmount, currency),
        formatCurrency(profit, currency),
        `${margin}%`
      ]
    })
    
    const csvContent = generateCSVContent(headers, rows)
    const filename = `profit-center-report-${formatDate(new Date())}.csv`
    downloadFile(csvContent, filename, 'text/csv')
  }
}

export const exportFinancialReport = (
  reportType: ReportType,
  data: FinancialReportData,
  options: ExportOptions
): void => {
  switch (reportType) {
    case 'income-statement':
      exportIncomeStatement(data, options)
      break
    case 'balance-sheet':
      exportBalanceSheet(data, options)
      break
    case 'cash-flow':
      exportCashFlow(data, options)
      break
    case 'accounts-receivable':
      exportAccountsReceivable(data, options)
      break
    case 'accounts-payable':
      exportAccountsPayable(data, options)
      break
    case 'expense-report':
      exportExpenseReport(data, options)
      break
    case 'revenue-report':
      exportRevenueReport(data, options)
      break
    case 'tax-summary':
      exportTaxSummary(data, options)
      break
    case 'cost-center-report':
      exportCostCenterReport(data, options)
      break
    case 'profit-center-report':
      exportProfitCenterReport(data, options)
      break
    default:
      throw new Error(`Unsupported report type: ${reportType}`)
  }
}
