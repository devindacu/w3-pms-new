import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PrintButton } from '@/components/PrintButton'
import { A4PrintWrapper } from '@/components/A4PrintWrapper'
import { 
  Download, 
  FilePdf, 
  FileCsv, 
  FileText, 
  CalendarBlank,
  ChartBar 
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Invoice, Payment, Expense, JournalEntry, Budget } from '@/lib/types'
import { 
  exportInvoicesToCSV, 
  exportPaymentsToCSV, 
  exportExpensesToCSV, 
  exportJournalEntriesToCSV,
  exportBudgetsToCSV,
  exportTrialBalanceToCSV,
  exportProfitLossToCSV,
  exportBalanceSheetToCSV 
} from '@/lib/exportHelpers'
import {
  exportInvoicesToPDF,
  exportPaymentsToPDF,
  exportExpensesToPDF,
  exportJournalEntriesToPDF,
  exportBudgetsToPDF,
  exportTrialBalanceToPDF,
  exportProfitLossToPDF,
  exportBalanceSheetToPDF
} from '@/lib/pdfExportHelpers'
import { formatCurrency, formatDate } from '@/lib/helpers'

interface FinanceReportsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoices: Invoice[]
  payments: Payment[]
  expenses: Expense[]
  journalEntries: JournalEntry[]
  budgets: Budget[]
}

type ReportType = 
  | 'invoices' 
  | 'payments' 
  | 'expenses' 
  | 'journal-entries' 
  | 'budgets' 
  | 'trial-balance' 
  | 'profit-loss' 
  | 'balance-sheet' 
  | 'cash-flow'
  | 'ar-aging'
  | 'ap-aging'

type ExportFormat = 'csv' | 'pdf'
type DateRange = 'all' | 'today' | 'this-week' | 'this-month' | 'this-quarter' | 'this-year' | 'last-month' | 'last-quarter' | 'last-year' | 'custom'

export function FinanceReportsDialog({
  open,
  onOpenChange,
  invoices,
  payments,
  expenses,
  journalEntries,
  budgets
}: FinanceReportsDialogProps) {
  const [reportType, setReportType] = useState<ReportType>('invoices')
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv')
  const [dateRange, setDateRange] = useState<DateRange>('this-month')

  const getDateRangeFilter = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    
    switch (dateRange) {
      case 'today':
        return { start: today, end: today + 86400000 }
      case 'this-week': {
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        startOfWeek.setHours(0, 0, 0, 0)
        return { start: startOfWeek.getTime(), end: Date.now() }
      }
      case 'this-month':
        return { 
          start: new Date(now.getFullYear(), now.getMonth(), 1).getTime(), 
          end: Date.now() 
        }
      case 'this-quarter': {
        const quarter = Math.floor(now.getMonth() / 3)
        return {
          start: new Date(now.getFullYear(), quarter * 3, 1).getTime(),
          end: Date.now()
        }
      }
      case 'this-year':
        return { 
          start: new Date(now.getFullYear(), 0, 1).getTime(), 
          end: Date.now() 
        }
      case 'last-month': {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
        return { 
          start: lastMonth.getTime(), 
          end: endOfLastMonth.getTime() 
        }
      }
      case 'last-quarter': {
        const currentQuarter = Math.floor(now.getMonth() / 3)
        const lastQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1
        const year = currentQuarter === 0 ? now.getFullYear() - 1 : now.getFullYear()
        const startMonth = lastQuarter * 3
        return {
          start: new Date(year, startMonth, 1).getTime(),
          end: new Date(year, startMonth + 3, 0).getTime()
        }
      }
      case 'last-year':
        return { 
          start: new Date(now.getFullYear() - 1, 0, 1).getTime(), 
          end: new Date(now.getFullYear() - 1, 11, 31).getTime() 
        }
      default:
        return { start: 0, end: Date.now() }
    }
  }

  const handleExport = () => {
    try {
      const { start, end } = getDateRangeFilter()
      const dateRangeLabel = dateRanges.find(r => r.value === dateRange)?.label || ''

      switch (reportType) {
        case 'invoices': {
          const filtered = dateRange === 'all' 
            ? invoices 
            : invoices.filter(inv => inv.invoiceDate >= start && inv.invoiceDate <= end)
          
          if (exportFormat === 'csv') {
            exportInvoicesToCSV(filtered)
            toast.success(`Exported ${filtered.length} invoices to CSV`)
          } else {
            exportInvoicesToPDF(filtered, dateRangeLabel)
            toast.success(`Exported ${filtered.length} invoices to PDF`)
          }
          break
        }
        
        case 'payments': {
          const filtered = dateRange === 'all' 
            ? payments 
            : payments.filter(p => p.processedAt >= start && p.processedAt <= end)
          
          if (exportFormat === 'csv') {
            exportPaymentsToCSV(filtered)
            toast.success(`Exported ${filtered.length} payments to CSV`)
          } else {
            exportPaymentsToPDF(filtered, dateRangeLabel)
            toast.success(`Exported ${filtered.length} payments to PDF`)
          }
          break
        }
        
        case 'expenses': {
          const filtered = dateRange === 'all' 
            ? expenses 
            : expenses.filter(exp => exp.expenseDate >= start && exp.expenseDate <= end)
          
          if (exportFormat === 'csv') {
            exportExpensesToCSV(filtered)
            toast.success(`Exported ${filtered.length} expenses to CSV`)
          } else {
            exportExpensesToPDF(filtered, dateRangeLabel)
            toast.success(`Exported ${filtered.length} expenses to PDF`)
          }
          break
        }
        
        case 'journal-entries': {
          const filtered = dateRange === 'all' 
            ? journalEntries 
            : journalEntries.filter(je => je.transactionDate >= start && je.transactionDate <= end)
          
          if (exportFormat === 'csv') {
            exportJournalEntriesToCSV(filtered)
            toast.success(`Exported ${filtered.length} journal entries to CSV`)
          } else {
            exportJournalEntriesToPDF(filtered, dateRangeLabel)
            toast.success(`Exported ${filtered.length} journal entries to PDF`)
          }
          break
        }
        
        case 'budgets': {
          if (exportFormat === 'csv') {
            exportBudgetsToCSV(budgets)
            toast.success(`Exported ${budgets.length} budgets to CSV`)
          } else {
            exportBudgetsToPDF(budgets)
            toast.success(`Exported ${budgets.length} budgets to PDF`)
          }
          break
        }
        
        case 'trial-balance': {
          const data = generateTrialBalanceData(start, end)
          if (exportFormat === 'csv') {
            exportTrialBalanceToCSV(data)
            toast.success('Trial Balance exported to CSV')
          } else {
            exportTrialBalanceToPDF(data, dateRangeLabel)
            toast.success('Trial Balance exported to PDF')
          }
          break
        }
        
        case 'profit-loss': {
          const data = generateProfitLossData(start, end)
          if (exportFormat === 'csv') {
            exportProfitLossToCSV(data)
            toast.success('Profit & Loss Statement exported to CSV')
          } else {
            exportProfitLossToPDF(data, dateRangeLabel)
            toast.success('Profit & Loss Statement exported to PDF')
          }
          break
        }
        
        case 'balance-sheet': {
          const data = generateBalanceSheetData()
          if (exportFormat === 'csv') {
            exportBalanceSheetToCSV(data)
            toast.success('Balance Sheet exported to CSV')
          } else {
            exportBalanceSheetToPDF(data)
            toast.success('Balance Sheet exported to PDF')
          }
          break
        }
        
        default:
          toast.info('This report type is under development')
      }
      
      onOpenChange(false)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export report')
    }
  }

  const generateTrialBalanceData = (start: number, end: number) => {
    return journalEntries
      .filter(je => je.transactionDate >= start && je.transactionDate <= end && je.status === 'posted')
      .flatMap(je => je.lines.map(line => ({
        'Account Code': line.accountCode,
        'Account Name': line.accountName,
        'Debit': line.debit,
        'Credit': line.credit
      })))
  }

  const generateProfitLossData = (start: number, end: number) => {
    const revenueTotal = invoices
      .filter(inv => inv.invoiceDate >= start && inv.invoiceDate <= end && (inv.status === 'posted' || inv.status === 'approved'))
      .reduce((sum, inv) => sum + inv.total, 0)
    
    const expenseTotal = expenses
      .filter(exp => exp.expenseDate >= start && exp.expenseDate <= end && exp.status === 'approved')
      .reduce((sum, exp) => sum + exp.amount, 0)
    
    return [
      { 'Category': 'Revenue', 'Amount': revenueTotal },
      { 'Category': 'Expenses', 'Amount': expenseTotal },
      { 'Category': 'Net Income', 'Amount': revenueTotal - expenseTotal }
    ]
  }

  const generateBalanceSheetData = () => {
    const totalAssets = invoices.reduce((sum, inv) => sum + (inv.balance || 0), 0)
    const totalLiabilities = expenses.filter(e => !e.approvedBy).reduce((sum, e) => sum + e.amount, 0)
    
    return [
      { 'Category': 'Assets', 'Sub-Category': 'Accounts Receivable', 'Amount': totalAssets },
      { 'Category': 'Liabilities', 'Sub-Category': 'Accounts Payable', 'Amount': totalLiabilities },
      { 'Category': 'Equity', 'Sub-Category': 'Retained Earnings', 'Amount': totalAssets - totalLiabilities }
    ]
  }

  const reportTypes = [
    { value: 'invoices', label: 'Invoices', icon: FileText },
    { value: 'payments', label: 'Payments', icon: FileText },
    { value: 'expenses', label: 'Expenses', icon: FileText },
    { value: 'journal-entries', label: 'Journal Entries', icon: FileText },
    { value: 'budgets', label: 'Budgets', icon: ChartBar },
    { value: 'trial-balance', label: 'Trial Balance', icon: ChartBar },
    { value: 'profit-loss', label: 'Profit & Loss', icon: ChartBar },
    { value: 'balance-sheet', label: 'Balance Sheet', icon: ChartBar },
    { value: 'cash-flow', label: 'Cash Flow Statement', icon: ChartBar },
    { value: 'ar-aging', label: 'AR Aging Report', icon: FileText },
    { value: 'ap-aging', label: 'AP Aging Report', icon: FileText }
  ]

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'this-week', label: 'This Week' },
    { value: 'this-month', label: 'This Month' },
    { value: 'this-quarter', label: 'This Quarter' },
    { value: 'this-year', label: 'This Year' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'last-quarter', label: 'Last Quarter' },
    { value: 'last-year', label: 'Last Year' }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download size={24} />
              Export Finance Reports
            </div>
            <PrintButton
              elementId="finance-reports-print"
              options={{
                title: 'Finance Reports',
                filename: `finance-reports-${Date.now()}.pdf`
              }}
              variant="outline"
              size="sm"
            />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon size={16} />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dateRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Export Format</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={exportFormat === 'csv' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setExportFormat('csv')}
                  >
                    <FileCsv size={18} className="mr-2" />
                    CSV
                  </Button>
                  <Button
                    type="button"
                    variant={exportFormat === 'pdf' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setExportFormat('pdf')}
                  >
                    <FilePdf size={18} className="mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Separator />

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">Export Summary</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Report: <span className="font-medium text-foreground">
                {reportTypes.find(t => t.value === reportType)?.label}
              </span></p>
              <p>• Date Range: <span className="font-medium text-foreground">
                {dateRanges.find(r => r.value === dateRange)?.label}
              </span></p>
              <p>• Format: <span className="font-medium text-foreground">
                {exportFormat.toUpperCase()}
              </span></p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download size={18} className="mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="hidden">
          <A4PrintWrapper id="finance-reports-print" title="Finance Reports">
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold">Export Summary</h2>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Report Type:</span>
                    <span className="font-medium">{reportTypes.find(t => t.value === reportType)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date Range:</span>
                    <span className="font-medium">{dateRanges.find(r => r.value === dateRange)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Export Format:</span>
                    <span className="font-medium">{exportFormat.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Available Report Types</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Report Type</th>
                      <th className="p-2 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportTypes.map((type) => (
                      <tr key={type.value} className="border-b">
                        <td className="p-2">{type.label}</td>
                        <td className="p-2 text-sm text-gray-600">
                          {type.value === reportType ? '✓ Selected' : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </A4PrintWrapper>
        </div>
      </DialogContent>
    </Dialog>
  )
}
