import { formatCurrency, formatDate } from './helpers'
import { jsPDF } from 'jspdf'
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

const downloadFile = (content: string | Blob, filename: string, mimeType: string) => {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const generateExcelContent = (headers: string[], rows: string[][]): string => {
  const escapeCell = (value: string | number): string => {
    const strValue = String(value)
    if (strValue.includes('\t') || strValue.includes('\n') || strValue.includes('"')) {
      return `"${strValue.replace(/"/g, '""')}"`
    }
    return strValue
  }

  const headerRow = headers.map(escapeCell).join('\t')
  const dataRows = rows.map(row => row.map(escapeCell).join('\t')).join('\n')
  
  return `${headerRow}\n${dataRows}`
}

const generatePDFReport = (
  title: string,
  subtitle: string,
  headers: string[],
  rows: string[][],
  options?: { landscape?: boolean }
): jsPDF => {
  const doc = new jsPDF(options?.landscape ? 'landscape' : 'portrait')
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPosition = margin

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(title, pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 10

  if (subtitle) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(subtitle, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15
  } else {
    yPosition += 10
  }

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')

  const columnCount = headers.length
  const columnWidth = (pageWidth - 2 * margin) / columnCount
  
  let xPosition = margin
  headers.forEach(header => {
    doc.text(header, xPosition, yPosition)
    xPosition += columnWidth
  })
  
  yPosition += 3
  doc.setLineWidth(0.5)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  rows.forEach(row => {
    if (yPosition > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      xPosition = margin
      headers.forEach(header => {
        doc.text(header, xPosition, yPosition)
        xPosition += columnWidth
      })
      yPosition += 3
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 7
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
    }

    const isBold = row[0] && (
      row[0].toUpperCase() === row[0] || 
      row[0].includes('TOTAL') || 
      row[0].includes('NET')
    )
    
    if (isBold) {
      doc.setFont('helvetica', 'bold')
    }

    xPosition = margin
    row.forEach((cell, index) => {
      const maxWidth = columnWidth - 2
      const lines = doc.splitTextToSize(cell || '', maxWidth)
      doc.text(lines, xPosition, yPosition)
      xPosition += columnWidth
    })

    if (isBold) {
      doc.setFont('helvetica', 'normal')
    }

    yPosition += 6
  })

  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  const footerText = `Generated on ${formatDate(new Date())} at ${new Date().toLocaleTimeString()}`
  doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' })

  return doc
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
  rows.push(['Net Profit Margin', '', totalRevenue > 0 ? `${((netIncome / totalRevenue) * 100).toFixed(2)}%` : '0%'])
  
  const title = 'Income Statement'
  const subtitle = dateRange 
    ? `Period: ${formatDate(dateRange.from)} to ${formatDate(dateRange.to)}`
    : `As of ${formatDate(new Date())}`
  const filename = `income-statement-${formatDate(new Date())}`
  
  if (format === 'csv') {
    const csvContent = generateCSVContent(headers, rows)
    downloadFile(csvContent, `${filename}.csv`, 'text/csv')
  } else if (format === 'excel') {
    const excelContent = generateExcelContent(headers, rows)
    downloadFile(excelContent, `${filename}.xls`, 'application/vnd.ms-excel')
  } else if (format === 'pdf') {
    const doc = generatePDFReport(title, subtitle, headers, rows)
    doc.save(`${filename}.pdf`)
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
  
  const headers = ['Account', 'Amount']
  const rows: string[][] = []
  
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
  
  const title = 'Balance Sheet'
  const subtitle = `As of ${formatDate(new Date())}`
  const filename = `balance-sheet-${formatDate(new Date())}`
  
  if (format === 'csv') {
    const csvContent = generateCSVContent(headers, rows)
    downloadFile(csvContent, `${filename}.csv`, 'text/csv')
  } else if (format === 'excel') {
    const excelContent = generateExcelContent(headers, rows)
    downloadFile(excelContent, `${filename}.xls`, 'application/vnd.ms-excel')
  } else if (format === 'pdf') {
    const doc = generatePDFReport(title, subtitle, headers, rows)
    doc.save(`${filename}.pdf`)
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
  
  const headers = ['Activity', 'Amount']
  const rows: string[][] = []
  
  rows.push(['OPERATING ACTIVITIES', ''])
  rows.push(['Cash from Operations (Payments Received)', formatCurrency(cashInflows, currency)])
  rows.push(['Cash for Operations (Expenses Paid)', formatCurrency(-cashOutflows, currency)])
  rows.push(['Net Cash from Operating Activities', formatCurrency(cashInflows - cashOutflows, currency)])
  rows.push(['', ''])
  
  rows.push(['NET INCREASE IN CASH', formatCurrency(netCashFlow, currency)])
  
  const title = 'Cash Flow Statement'
  const subtitle = dateRange 
    ? `Period: ${formatDate(dateRange.from)} to ${formatDate(dateRange.to)}`
    : `As of ${formatDate(new Date())}`
  const filename = `cash-flow-${formatDate(new Date())}`
  
  if (format === 'csv') {
    const csvContent = generateCSVContent(headers, rows)
    downloadFile(csvContent, `${filename}.csv`, 'text/csv')
  } else if (format === 'excel') {
    const excelContent = generateExcelContent(headers, rows)
    downloadFile(excelContent, `${filename}.xls`, 'application/vnd.ms-excel')
  } else if (format === 'pdf') {
    const doc = generatePDFReport(title, subtitle, headers, rows)
    doc.save(`${filename}.pdf`)
  }
}

export const exportAccountsReceivable = (
  data: FinancialReportData,
  options: ExportOptions
): void => {
  const { format, currency = 'LKR' } = options
  
  const arInvoices = data.guestInvoices.filter(inv => inv.amountDue > 0)
  
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
  
  const title = 'Accounts Receivable Report'
  const subtitle = `As of ${formatDate(new Date())}`
  const filename = `accounts-receivable-${formatDate(new Date())}`
  
  if (format === 'csv') {
    const csvContent = generateCSVContent(headers, rows)
    downloadFile(csvContent, `${filename}.csv`, 'text/csv')
  } else if (format === 'excel') {
    const excelContent = generateExcelContent(headers, rows)
    downloadFile(excelContent, `${filename}.xls`, 'application/vnd.ms-excel')
  } else if (format === 'pdf') {
    const doc = generatePDFReport(title, subtitle, headers, rows, { landscape: true })
    doc.save(`${filename}.pdf`)
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
  
  const title = 'Accounts Payable Report'
  const subtitle = `As of ${formatDate(new Date())}`
  const filename = `accounts-payable-${formatDate(new Date())}`
  
  if (format === 'csv') {
    const csvContent = generateCSVContent(headers, rows)
    downloadFile(csvContent, `${filename}.csv`, 'text/csv')
  } else if (format === 'excel') {
    const excelContent = generateExcelContent(headers, rows)
    downloadFile(excelContent, `${filename}.xls`, 'application/vnd.ms-excel')
  } else if (format === 'pdf') {
    const doc = generatePDFReport(title, subtitle, headers, rows, { landscape: true })
    doc.save(`${filename}.pdf`)
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
  
  const title = 'Expense Report'
  const subtitle = dateRange 
    ? `Period: ${formatDate(dateRange.from)} to ${formatDate(dateRange.to)}`
    : `As of ${formatDate(new Date())}`
  const filename = `expense-report-${formatDate(new Date())}`
  
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
    
    if (format === 'csv') {
      const csvContent = generateCSVContent(headers, rows)
      downloadFile(csvContent, `${filename}.csv`, 'text/csv')
    } else if (format === 'excel') {
      const excelContent = generateExcelContent(headers, rows)
      downloadFile(excelContent, `${filename}.xls`, 'application/vnd.ms-excel')
    } else if (format === 'pdf') {
      const doc = generatePDFReport(title, subtitle, headers, rows, { landscape: true })
      doc.save(`${filename}.pdf`)
    }
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
    
    if (format === 'csv') {
      const csvContent = generateCSVContent(headers, rows)
      downloadFile(csvContent, `${filename}.csv`, 'text/csv')
    } else if (format === 'excel') {
      const excelContent = generateExcelContent(headers, rows)
      downloadFile(excelContent, `${filename}.xls`, 'application/vnd.ms-excel')
    } else if (format === 'pdf') {
      const doc = generatePDFReport(title, subtitle, headers, rows, { landscape: true })
      doc.save(`${filename}.pdf`)
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
  
  const title = 'Revenue Report'
  const subtitle = dateRange 
    ? `Period: ${formatDate(dateRange.from)} to ${formatDate(dateRange.to)}`
    : `As of ${formatDate(new Date())}`
  const filename = `revenue-report-${formatDate(new Date())}`
  
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
    
    if (format === 'csv') {
      const csvContent = generateCSVContent(headers, rows)
      downloadFile(csvContent, `${filename}.csv`, 'text/csv')
    } else if (format === 'excel') {
      const excelContent = generateExcelContent(headers, rows)
      downloadFile(excelContent, `${filename}.xls`, 'application/vnd.ms-excel')
    } else if (format === 'pdf') {
      const doc = generatePDFReport(title, subtitle, headers, rows)
      doc.save(`${filename}.pdf`)
    }
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
    
    if (format === 'csv') {
      const csvContent = generateCSVContent(headers, rows)
      downloadFile(csvContent, `${filename}.csv`, 'text/csv')
    } else if (format === 'excel') {
      const excelContent = generateExcelContent(headers, rows)
      downloadFile(excelContent, `${filename}.xls`, 'application/vnd.ms-excel')
    } else if (format === 'pdf') {
      const doc = generatePDFReport(title, subtitle, headers, rows, { landscape: true })
      doc.save(`${filename}.pdf`)
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
  
  const headers = ['Tax Type', 'Total Amount', 'Invoice Count']
  const rows: string[][] = Object.entries(taxSummary).map(([name, data]) => [
    name,
    formatCurrency(data.amount, currency),
    data.count.toString()
  ])
  
  const total = Object.values(taxSummary).reduce((sum, data) => sum + data.amount, 0)
  rows.push(['TOTAL', formatCurrency(total, currency), ''])
  
  const title = 'Tax Summary Report'
  const subtitle = dateRange 
    ? `Period: ${formatDate(dateRange.from)} to ${formatDate(dateRange.to)}`
    : `As of ${formatDate(new Date())}`
  const filename = `tax-summary-${formatDate(new Date())}`
  
  if (format === 'csv') {
    const csvContent = generateCSVContent(headers, rows)
    downloadFile(csvContent, `${filename}.csv`, 'text/csv')
  } else if (format === 'excel') {
    const excelContent = generateExcelContent(headers, rows)
    downloadFile(excelContent, `${filename}.xls`, 'application/vnd.ms-excel')
  } else if (format === 'pdf') {
    const doc = generatePDFReport(title, subtitle, headers, rows)
    doc.save(`${filename}.pdf`)
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
  
  const title = 'Cost Center Report'
  const subtitle = `As of ${formatDate(new Date())}`
  const filename = `cost-center-report-${formatDate(new Date())}`
  
  if (format === 'csv') {
    const csvContent = generateCSVContent(headers, rows)
    downloadFile(csvContent, `${filename}.csv`, 'text/csv')
  } else if (format === 'excel') {
    const excelContent = generateExcelContent(headers, rows)
    downloadFile(excelContent, `${filename}.xls`, 'application/vnd.ms-excel')
  } else if (format === 'pdf') {
    const doc = generatePDFReport(title, subtitle, headers, rows, { landscape: true })
    doc.save(`${filename}.pdf`)
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
  
  const title = 'Profit Center Report'
  const subtitle = `As of ${formatDate(new Date())}`
  const filename = `profit-center-report-${formatDate(new Date())}`
  
  if (format === 'csv') {
    const csvContent = generateCSVContent(headers, rows)
    downloadFile(csvContent, `${filename}.csv`, 'text/csv')
  } else if (format === 'excel') {
    const excelContent = generateExcelContent(headers, rows)
    downloadFile(excelContent, `${filename}.xls`, 'application/vnd.ms-excel')
  } else if (format === 'pdf') {
    const doc = generatePDFReport(title, subtitle, headers, rows, { landscape: true })
    doc.save(`${filename}.pdf`)
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
