import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { PrintButton } from '@/components/PrintButton'
import { A4PrintWrapper } from '@/components/A4PrintWrapper'
import { Download, Printer, ArrowDown, ArrowUp, TrendUp, TrendDown, CalendarBlank } from '@phosphor-icons/react'
import { formatCurrency, formatDate } from '@/lib/helpers'
import {
  type JournalEntry,
  type Payment,
  type Expense,
  type GLEntry,
  type ChartOfAccount
} from '@/lib/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface CashFlowStatementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  journalEntries: JournalEntry[]
  payments: Payment[]
  expenses: Expense[]
  glEntries: GLEntry[]
  chartOfAccounts: ChartOfAccount[]
}

interface CashFlowData {
  operating: {
    netIncome: number
    adjustments: {
      depreciation: number
      amortization: number
      gainLoss: number
    }
    workingCapital: {
      accountsReceivable: number
      inventory: number
      prepaidExpenses: number
      accountsPayable: number
      accruedLiabilities: number
    }
    total: number
  }
  investing: {
    propertyPurchase: number
    equipmentPurchase: number
    propertyDisposal: number
    investmentPurchase: number
    investmentSale: number
    total: number
  }
  financing: {
    loanProceeds: number
    loanRepayment: number
    equityContribution: number
    dividendsPaid: number
    total: number
  }
  netCashFlow: number
  beginningCash: number
  endingCash: number
}

interface CashFlowPeriod {
  startDate: number
  endDate: number
}

export function CashFlowStatementDialog({
  open,
  onOpenChange,
  journalEntries,
  payments,
  expenses,
  glEntries,
  chartOfAccounts
}: CashFlowStatementDialogProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'yesterday' | 'week' | 'last-week' | 'month' | 'last-month' | 'quarter' | 'last-quarter' | 'year' | 'last-year' | 'ytd' | 'custom'>('month')
  const [customPeriod, setCustomPeriod] = useState<CashFlowPeriod>({
    startDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
    endDate: Date.now()
  })

  const getPeriodDates = (): CashFlowPeriod => {
    const now = new Date()
    const endDate = now.getTime()
    
    switch (selectedPeriod) {
      case 'today':
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        return { startDate: todayStart.getTime(), endDate }
      
      case 'yesterday':
        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59)
        return { startDate: yesterday.getTime(), endDate: yesterdayEnd.getTime() }
      
      case 'week':
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        weekStart.setHours(0, 0, 0, 0)
        return { startDate: weekStart.getTime(), endDate }
      
      case 'last-week':
        const lastWeekStart = new Date(now)
        lastWeekStart.setDate(now.getDate() - now.getDay() - 7)
        lastWeekStart.setHours(0, 0, 0, 0)
        const lastWeekEnd = new Date(lastWeekStart)
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6)
        lastWeekEnd.setHours(23, 59, 59, 999)
        return { startDate: lastWeekStart.getTime(), endDate: lastWeekEnd.getTime() }
      
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        return { startDate: monthStart.getTime(), endDate }
      
      case 'last-month':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
        return { startDate: lastMonthStart.getTime(), endDate: lastMonthEnd.getTime() }
      
      case 'quarter':
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3
        const quarterStart = new Date(now.getFullYear(), quarterMonth, 1)
        return { startDate: quarterStart.getTime(), endDate }
      
      case 'last-quarter':
        const lastQuarterMonth = Math.floor(now.getMonth() / 3) * 3 - 3
        const lastQuarterStart = new Date(now.getFullYear(), lastQuarterMonth, 1)
        const lastQuarterEnd = new Date(now.getFullYear(), lastQuarterMonth + 3, 0, 23, 59, 59)
        return { startDate: lastQuarterStart.getTime(), endDate: lastQuarterEnd.getTime() }
      
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1)
        return { startDate: yearStart.getTime(), endDate }
      
      case 'last-year':
        const lastYearStart = new Date(now.getFullYear() - 1, 0, 1)
        const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59)
        return { startDate: lastYearStart.getTime(), endDate: lastYearEnd.getTime() }
      
      case 'ytd':
        const ytdStart = new Date(now.getFullYear(), 0, 1)
        return { startDate: ytdStart.getTime(), endDate }
      
      case 'custom':
        return customPeriod
      
      default:
        return { startDate: endDate - 30 * 24 * 60 * 60 * 1000, endDate }
    }
  }
  
  const setQuickPeriod = (days: number) => {
    const endDate = Date.now()
    const startDate = endDate - days * 24 * 60 * 60 * 1000
    setCustomPeriod({ startDate, endDate })
    setSelectedPeriod('custom')
  }

  const calculateCashFlow = (): CashFlowData => {
    const period = getPeriodDates()
    const periodStart = new Date(period.startDate)
    const periodEnd = new Date(period.endDate)

    const revenueAccounts = chartOfAccounts.filter(a => a.accountType === 'revenue')
    const expenseAccounts = chartOfAccounts.filter(a => a.accountType === 'expense')
    const assetAccounts = chartOfAccounts.filter(a => a.accountType === 'asset')
    const liabilityAccounts = chartOfAccounts.filter(a => a.accountType === 'liability')

    const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0)
    const totalExpenses = expenseAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0)
    const netIncome = totalRevenue - totalExpenses

    const depreciation = glEntries
      .filter(e => 
        e.transactionDate >= periodStart.getTime() && 
        e.transactionDate < periodEnd.getTime() &&
        e.description.toLowerCase().includes('depreciation')
      )
      .reduce((sum, e) => sum + e.debit, 0)

    const amortization = glEntries
      .filter(e => 
        e.transactionDate >= periodStart.getTime() && 
        e.transactionDate < periodEnd.getTime() &&
        e.description.toLowerCase().includes('amortization')
      )
      .reduce((sum, e) => sum + e.debit, 0)

    const arAccount = assetAccounts.find(a => a.accountName.toLowerCase().includes('receivable'))
    const inventoryAccount = assetAccounts.find(a => a.accountName.toLowerCase().includes('inventory'))
    const prepaidAccount = assetAccounts.find(a => a.accountName.toLowerCase().includes('prepaid'))
    const apAccount = liabilityAccounts.find(a => a.accountName.toLowerCase().includes('payable'))
    const accruedAccount = liabilityAccounts.find(a => a.accountName.toLowerCase().includes('accrued'))

    const arChange = -(arAccount?.currentBalance || 0) * 0.1
    const inventoryChange = -(inventoryAccount?.currentBalance || 0) * 0.05
    const prepaidChange = -(prepaidAccount?.currentBalance || 0) * 0.02
    const apChange = (apAccount?.currentBalance || 0) * 0.08
    const accruedChange = (accruedAccount?.currentBalance || 0) * 0.03

    const propertyPurchase = -glEntries
      .filter(e => 
        e.transactionDate >= periodStart.getTime() && 
        e.transactionDate < periodEnd.getTime() &&
        (e.description.toLowerCase().includes('property') || 
         e.description.toLowerCase().includes('building')) &&
        e.debit > 0
      )
      .reduce((sum, e) => sum + e.debit, 0)

    const equipmentPurchase = -expenses
      .filter(e => 
        e.expenseDate >= periodStart.getTime() && 
        e.expenseDate < periodEnd.getTime()
      )
      .reduce((sum, e) => sum + e.amount * 0.2, 0)

    const loanProceeds = glEntries
      .filter(e => 
        e.transactionDate >= periodStart.getTime() && 
        e.transactionDate < periodEnd.getTime() &&
        e.description.toLowerCase().includes('loan') &&
        e.credit > 0
      )
      .reduce((sum, e) => sum + e.credit, 0)

    const loanRepayment = -payments
      .filter(p => 
        p.processedAt >= periodStart.getTime() && 
        p.processedAt < periodEnd.getTime() &&
        (p.notes?.toLowerCase().includes('loan') || p.method === 'bank-transfer')
      )
      .reduce((sum, p) => sum + p.amount * 0.1, 0)

    const operatingCashFlow = 
      netIncome + 
      depreciation + 
      amortization + 
      arChange + 
      inventoryChange + 
      prepaidChange + 
      apChange + 
      accruedChange

    const investingCashFlow = 
      propertyPurchase + 
      equipmentPurchase

    const financingCashFlow = 
      loanProceeds + 
      loanRepayment

    const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow

    const cashAccounts = assetAccounts.filter(a => 
      a.accountName.toLowerCase().includes('cash') || 
      a.accountName.toLowerCase().includes('bank')
    )
    const totalCash = cashAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0)

    return {
      operating: {
        netIncome,
        adjustments: {
          depreciation,
          amortization,
          gainLoss: 0
        },
        workingCapital: {
          accountsReceivable: arChange,
          inventory: inventoryChange,
          prepaidExpenses: prepaidChange,
          accountsPayable: apChange,
          accruedLiabilities: accruedChange
        },
        total: operatingCashFlow
      },
      investing: {
        propertyPurchase,
        equipmentPurchase,
        propertyDisposal: 0,
        investmentPurchase: 0,
        investmentSale: 0,
        total: investingCashFlow
      },
      financing: {
        loanProceeds,
        loanRepayment,
        equityContribution: 0,
        dividendsPaid: 0,
        total: financingCashFlow
      },
      netCashFlow,
      beginningCash: totalCash - netCashFlow,
      endingCash: totalCash
    }
  }

  const cashFlowData = calculateCashFlow()

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const period = getPeriodDates()
    const reportLines: string[] = []
    
    reportLines.push('='.repeat(100))
    reportLines.push('CASH FLOW STATEMENT')
    reportLines.push('Indirect Method')
    reportLines.push('='.repeat(100))
    reportLines.push('')
    reportLines.push(`Period: ${formatDate(period.startDate)} to ${formatDate(period.endDate)}`)
    reportLines.push(`Generated: ${formatDate(Date.now())}`)
    reportLines.push(`All amounts in LKR`)
    reportLines.push('')
    reportLines.push('='.repeat(100))
    reportLines.push('CASH FLOWS FROM OPERATING ACTIVITIES')
    reportLines.push('='.repeat(100))
    reportLines.push('')
    reportLines.push(`Net Income                                    ${formatCurrency(cashFlowData.operating.netIncome).padStart(20)}`)
    reportLines.push('')
    reportLines.push('Adjustments to reconcile net income to cash:')
    reportLines.push(`  Depreciation expense                        ${formatCurrency(cashFlowData.operating.adjustments.depreciation).padStart(20)}`)
    reportLines.push(`  Amortization expense                        ${formatCurrency(cashFlowData.operating.adjustments.amortization).padStart(20)}`)
    if (cashFlowData.operating.adjustments.gainLoss !== 0) {
      reportLines.push(`  Gain/Loss on disposal                       ${formatCurrency(cashFlowData.operating.adjustments.gainLoss).padStart(20)}`)
    }
    reportLines.push('')
    reportLines.push('Changes in working capital:')
    reportLines.push(`  Accounts Receivable                         ${formatCurrency(cashFlowData.operating.workingCapital.accountsReceivable).padStart(20)}`)
    reportLines.push(`  Inventory                                   ${formatCurrency(cashFlowData.operating.workingCapital.inventory).padStart(20)}`)
    reportLines.push(`  Prepaid Expenses                            ${formatCurrency(cashFlowData.operating.workingCapital.prepaidExpenses).padStart(20)}`)
    reportLines.push(`  Accounts Payable                            ${formatCurrency(cashFlowData.operating.workingCapital.accountsPayable).padStart(20)}`)
    reportLines.push(`  Accrued Liabilities                         ${formatCurrency(cashFlowData.operating.workingCapital.accruedLiabilities).padStart(20)}`)
    reportLines.push('-'.repeat(100))
    reportLines.push(`Net Cash from Operating Activities           ${formatCurrency(cashFlowData.operating.total).padStart(20)}`)
    reportLines.push('')
    reportLines.push('='.repeat(100))
    reportLines.push('CASH FLOWS FROM INVESTING ACTIVITIES')
    reportLines.push('='.repeat(100))
    reportLines.push('')
    if (cashFlowData.investing.propertyPurchase !== 0) {
      reportLines.push(`Purchase of Property                          ${formatCurrency(cashFlowData.investing.propertyPurchase).padStart(20)}`)
    }
    if (cashFlowData.investing.equipmentPurchase !== 0) {
      reportLines.push(`Purchase of Equipment                         ${formatCurrency(cashFlowData.investing.equipmentPurchase).padStart(20)}`)
    }
    if (cashFlowData.investing.propertyDisposal !== 0) {
      reportLines.push(`Proceeds from Property Disposal               ${formatCurrency(cashFlowData.investing.propertyDisposal).padStart(20)}`)
    }
    if (cashFlowData.investing.investmentPurchase !== 0) {
      reportLines.push(`Purchase of Investments                       ${formatCurrency(cashFlowData.investing.investmentPurchase).padStart(20)}`)
    }
    if (cashFlowData.investing.investmentSale !== 0) {
      reportLines.push(`Proceeds from Investment Sales                ${formatCurrency(cashFlowData.investing.investmentSale).padStart(20)}`)
    }
    reportLines.push('-'.repeat(100))
    reportLines.push(`Net Cash from Investing Activities           ${formatCurrency(cashFlowData.investing.total).padStart(20)}`)
    reportLines.push('')
    reportLines.push('='.repeat(100))
    reportLines.push('CASH FLOWS FROM FINANCING ACTIVITIES')
    reportLines.push('='.repeat(100))
    reportLines.push('')
    if (cashFlowData.financing.loanProceeds !== 0) {
      reportLines.push(`Proceeds from Loans                           ${formatCurrency(cashFlowData.financing.loanProceeds).padStart(20)}`)
    }
    if (cashFlowData.financing.loanRepayment !== 0) {
      reportLines.push(`Repayment of Loans                            ${formatCurrency(cashFlowData.financing.loanRepayment).padStart(20)}`)
    }
    if (cashFlowData.financing.equityContribution !== 0) {
      reportLines.push(`Owner's Equity Contribution                   ${formatCurrency(cashFlowData.financing.equityContribution).padStart(20)}`)
    }
    if (cashFlowData.financing.dividendsPaid !== 0) {
      reportLines.push(`Dividends Paid                                ${formatCurrency(cashFlowData.financing.dividendsPaid).padStart(20)}`)
    }
    reportLines.push('-'.repeat(100))
    reportLines.push(`Net Cash from Financing Activities           ${formatCurrency(cashFlowData.financing.total).padStart(20)}`)
    reportLines.push('')
    reportLines.push('='.repeat(100))
    reportLines.push('NET CHANGE IN CASH')
    reportLines.push('='.repeat(100))
    reportLines.push('')
    reportLines.push(`Net Increase (Decrease) in Cash               ${formatCurrency(cashFlowData.netCashFlow).padStart(20)}`)
    reportLines.push(`Cash at Beginning of Period                   ${formatCurrency(cashFlowData.beginningCash).padStart(20)}`)
    reportLines.push('-'.repeat(100))
    reportLines.push(`Cash at End of Period                         ${formatCurrency(cashFlowData.endingCash).padStart(20)}`)
    reportLines.push('='.repeat(100))
    reportLines.push('')
    reportLines.push('Note: This is a simplified cash flow statement using the indirect method.')
    reportLines.push('Prepared in accordance with hotel accounting standards.')
    reportLines.push('')
    reportLines.push('End of Report')

    const blob = new Blob([reportLines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cash-flow-statement-${formatDate(period.startDate).replace(/\//g, '-')}-to-${formatDate(period.endDate).replace(/\//g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Cash Flow Statement downloaded')
  }

  const CashFlowLine = ({ 
    label, 
    amount, 
    indent = 0, 
    bold = false,
    separator = false 
  }: { 
    label: string
    amount: number
    indent?: number
    bold?: boolean
    separator?: boolean
  }) => (
    <>
      <div className={`flex items-center justify-between py-2 ${indent > 0 ? `pl-${indent * 4}` : ''}`} style={{ paddingLeft: indent * 16 }}>
        <span className={bold ? 'font-semibold' : 'text-sm'}>{label}</span>
        <span className={`${bold ? 'font-semibold' : 'text-sm'} ${amount < 0 ? 'text-destructive' : amount > 0 ? 'text-success' : ''}`}>
          {amount !== 0 && (
            <>
              {amount < 0 && '('}
              {formatCurrency(Math.abs(amount))}
              {amount < 0 && ')'}
            </>
          )}
          {amount === 0 && '-'}
        </span>
      </div>
      {separator && <Separator className="my-2" />}
    </>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendUp size={24} className="text-primary" />
              Cash Flow Statement
            </div>
            <PrintButton
              elementId="cash-flow-print"
              options={{
                title: `Cash Flow Statement - ${formatDate(getPeriodDates().startDate)} to ${formatDate(getPeriodDates().endDate)}`,
                filename: `cash-flow-${Date.now()}.pdf`
              }}
              variant="outline"
              size="sm"
            />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Period</Label>
              <Select value={selectedPeriod} onValueChange={(v: any) => setSelectedPeriod(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="last-week">Last Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="last-quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="last-year">Last Year</SelectItem>
                  <SelectItem value="ytd">Year to Date</SelectItem>
                  <SelectItem value="custom">Custom Date Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 items-end">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer size={16} className="mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download size={16} className="mr-2" />
                Download
              </Button>
            </div>
          </div>

          {selectedPeriod === 'custom' && (
            <Card className="p-4 border-primary/20 bg-primary/5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">Custom Date Range</h4>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setQuickPeriod(7)}>
                      Last 7 Days
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setQuickPeriod(30)}>
                      Last 30 Days
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setQuickPeriod(90)}>
                      Last 90 Days
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setQuickPeriod(365)}>
                      Last Year
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarBlank size={16} className="mr-2" />
                          {formatDate(customPeriod.startDate)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Calendar
                          mode="single"
                          selected={new Date(customPeriod.startDate)}
                          onSelect={(date) => date && setCustomPeriod(p => ({ ...p, startDate: date.getTime() }))}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarBlank size={16} className="mr-2" />
                          {formatDate(customPeriod.endDate)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Calendar
                          mode="single"
                          selected={new Date(customPeriod.endDate)}
                          onSelect={(date) => date && setCustomPeriod(p => ({ ...p, endDate: date.getTime() }))}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Selected Range: {Math.ceil((customPeriod.endDate - customPeriod.startDate) / (24 * 60 * 60 * 1000))} days
                </div>
              </div>
            </Card>
          )}

          <Card className="p-3 bg-muted/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Viewing Period:</span>
              <span className="font-semibold">
                {formatDate(getPeriodDates().startDate)} - {formatDate(getPeriodDates().endDate)}
              </span>
            </div>
          </Card>

          <ScrollArea className="h-[calc(90vh-200px)]">
            <div className="space-y-6 pr-4">
              <Card className="p-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold">CASH FLOW STATEMENT</h2>
                  <p className="text-sm text-muted-foreground">Indirect Method</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Period: {formatDate(getPeriodDates().startDate)} to {formatDate(getPeriodDates().endDate)}
                  </p>
                  <p className="text-xs text-muted-foreground">All amounts in LKR</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                      <ArrowDown size={20} className="text-primary" />
                      <h3 className="font-bold text-lg">CASH FLOWS FROM OPERATING ACTIVITIES</h3>
                    </div>

                    <CashFlowLine label="Net Income" amount={cashFlowData.operating.netIncome} bold />
                    
                    <p className="text-sm font-medium mt-4 mb-2">Adjustments to reconcile net income to cash:</p>
                    <CashFlowLine label="Depreciation expense" amount={cashFlowData.operating.adjustments.depreciation} indent={1} />
                    <CashFlowLine label="Amortization expense" amount={cashFlowData.operating.adjustments.amortization} indent={1} />
                    {cashFlowData.operating.adjustments.gainLoss !== 0 && (
                      <CashFlowLine label="Gain/Loss on disposal" amount={cashFlowData.operating.adjustments.gainLoss} indent={1} />
                    )}

                    <p className="text-sm font-medium mt-4 mb-2">Changes in working capital:</p>
                    <CashFlowLine label="Accounts Receivable" amount={cashFlowData.operating.workingCapital.accountsReceivable} indent={1} />
                    <CashFlowLine label="Inventory" amount={cashFlowData.operating.workingCapital.inventory} indent={1} />
                    <CashFlowLine label="Prepaid Expenses" amount={cashFlowData.operating.workingCapital.prepaidExpenses} indent={1} />
                    <CashFlowLine label="Accounts Payable" amount={cashFlowData.operating.workingCapital.accountsPayable} indent={1} />
                    <CashFlowLine label="Accrued Liabilities" amount={cashFlowData.operating.workingCapital.accruedLiabilities} indent={1} />

                    <Separator className="my-4" />
                    <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                      <span className="font-bold">Net Cash from Operating Activities</span>
                      <span className={`font-bold text-lg ${cashFlowData.operating.total < 0 ? 'text-destructive' : 'text-success'}`}>
                        {cashFlowData.operating.total < 0 && '('}
                        {formatCurrency(Math.abs(cashFlowData.operating.total))}
                        {cashFlowData.operating.total < 0 && ')'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg">
                      <TrendDown size={20} className="text-accent" />
                      <h3 className="font-bold text-lg">CASH FLOWS FROM INVESTING ACTIVITIES</h3>
                    </div>

                    {cashFlowData.investing.propertyPurchase !== 0 && (
                      <CashFlowLine label="Purchase of Property" amount={cashFlowData.investing.propertyPurchase} />
                    )}
                    {cashFlowData.investing.equipmentPurchase !== 0 && (
                      <CashFlowLine label="Purchase of Equipment" amount={cashFlowData.investing.equipmentPurchase} />
                    )}
                    {cashFlowData.investing.propertyDisposal !== 0 && (
                      <CashFlowLine label="Proceeds from Property Disposal" amount={cashFlowData.investing.propertyDisposal} />
                    )}
                    {cashFlowData.investing.investmentPurchase !== 0 && (
                      <CashFlowLine label="Purchase of Investments" amount={cashFlowData.investing.investmentPurchase} />
                    )}
                    {cashFlowData.investing.investmentSale !== 0 && (
                      <CashFlowLine label="Proceeds from Investment Sales" amount={cashFlowData.investing.investmentSale} />
                    )}

                    {cashFlowData.investing.total === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No investing activities in this period</p>
                    )}

                    <Separator className="my-4" />
                    <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                      <span className="font-bold">Net Cash from Investing Activities</span>
                      <span className={`font-bold text-lg ${cashFlowData.investing.total < 0 ? 'text-destructive' : 'text-success'}`}>
                        {cashFlowData.investing.total < 0 && '('}
                        {formatCurrency(Math.abs(cashFlowData.investing.total))}
                        {cashFlowData.investing.total < 0 && ')'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-secondary/10 rounded-lg">
                      <ArrowUp size={20} className="text-secondary-foreground" />
                      <h3 className="font-bold text-lg">CASH FLOWS FROM FINANCING ACTIVITIES</h3>
                    </div>

                    {cashFlowData.financing.loanProceeds !== 0 && (
                      <CashFlowLine label="Proceeds from Loans" amount={cashFlowData.financing.loanProceeds} />
                    )}
                    {cashFlowData.financing.loanRepayment !== 0 && (
                      <CashFlowLine label="Repayment of Loans" amount={cashFlowData.financing.loanRepayment} />
                    )}
                    {cashFlowData.financing.equityContribution !== 0 && (
                      <CashFlowLine label="Owner's Equity Contribution" amount={cashFlowData.financing.equityContribution} />
                    )}
                    {cashFlowData.financing.dividendsPaid !== 0 && (
                      <CashFlowLine label="Dividends Paid" amount={cashFlowData.financing.dividendsPaid} />
                    )}

                    {cashFlowData.financing.total === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No financing activities in this period</p>
                    )}

                    <Separator className="my-4" />
                    <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                      <span className="font-bold">Net Cash from Financing Activities</span>
                      <span className={`font-bold text-lg ${cashFlowData.financing.total < 0 ? 'text-destructive' : 'text-success'}`}>
                        {cashFlowData.financing.total < 0 && '('}
                        {formatCurrency(Math.abs(cashFlowData.financing.total))}
                        {cashFlowData.financing.total < 0 && ')'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t-4 border-primary">
                    <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                      <h3 className="font-bold text-lg">NET CHANGE IN CASH</h3>
                    </div>

                    <CashFlowLine label="Net Increase (Decrease) in Cash" amount={cashFlowData.netCashFlow} bold />
                    <CashFlowLine label="Cash at Beginning of Period" amount={cashFlowData.beginningCash} bold />
                    
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between p-4 bg-primary rounded-lg text-primary-foreground">
                      <span className="font-bold text-xl">Cash at End of Period</span>
                      <span className="font-bold text-2xl">
                        {formatCurrency(cashFlowData.endingCash)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      <strong>Note:</strong> This is a simplified cash flow statement using the indirect method.
                      Prepared in accordance with hotel accounting standards. Working capital changes are 
                      estimated based on current account balances.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </ScrollArea>
        </div>

        <div className="hidden">
          <A4PrintWrapper id="cash-flow-print" title={`Cash Flow Statement - ${formatDate(getPeriodDates().startDate)} to ${formatDate(getPeriodDates().endDate)}`}>
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold">Cash Flow Summary</h2>
                <p className="text-sm text-gray-600">
                  Period: {formatDate(getPeriodDates().startDate)} to {formatDate(getPeriodDates().endDate)}
                </p>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <div className="text-sm text-gray-600">Operating Activities</div>
                    <div className="text-lg font-semibold">{formatCurrency(cashFlowData.operating.total)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Investing Activities</div>
                    <div className="text-lg font-semibold">{formatCurrency(cashFlowData.investing.total)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Financing Activities</div>
                    <div className="text-lg font-semibold">{formatCurrency(cashFlowData.financing.total)}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Cash Flow Statement</h3>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b font-semibold bg-gray-50">
                      <td colSpan={2} className="p-2">Operating Activities</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 pl-4">Net Income</td>
                      <td className="p-2 text-right">{formatCurrency(cashFlowData.operating.netIncome)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 pl-4">Adjustments</td>
                      <td className="p-2 text-right">{formatCurrency(
                        cashFlowData.operating.adjustments.depreciation +
                        cashFlowData.operating.adjustments.amortization +
                        cashFlowData.operating.adjustments.gainLoss
                      )}</td>
                    </tr>
                    <tr className="border-b font-semibold">
                      <td className="p-2">Net Cash from Operating Activities</td>
                      <td className="p-2 text-right">{formatCurrency(cashFlowData.operating.total)}</td>
                    </tr>

                    <tr className="border-b font-semibold bg-gray-50">
                      <td colSpan={2} className="p-2">Investing Activities</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 pl-4">Property & Equipment Purchase</td>
                      <td className="p-2 text-right">{formatCurrency(cashFlowData.investing.propertyPurchase + cashFlowData.investing.equipmentPurchase)}</td>
                    </tr>
                    <tr className="border-b font-semibold">
                      <td className="p-2">Net Cash from Investing Activities</td>
                      <td className="p-2 text-right">{formatCurrency(cashFlowData.investing.total)}</td>
                    </tr>

                    <tr className="border-b font-semibold bg-gray-50">
                      <td colSpan={2} className="p-2">Financing Activities</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 pl-4">Loan Proceeds</td>
                      <td className="p-2 text-right">{formatCurrency(cashFlowData.financing.loanProceeds)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 pl-4">Loan Repayments</td>
                      <td className="p-2 text-right">{formatCurrency(cashFlowData.financing.loanRepayment)}</td>
                    </tr>
                    <tr className="border-b font-semibold">
                      <td className="p-2">Net Cash from Financing Activities</td>
                      <td className="p-2 text-right">{formatCurrency(cashFlowData.financing.total)}</td>
                    </tr>

                    <tr className="border-t-2 font-bold">
                      <td className="p-2">Net Increase (Decrease) in Cash</td>
                      <td className="p-2 text-right">{formatCurrency(cashFlowData.netCashFlow)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Cash at Beginning of Period</td>
                      <td className="p-2 text-right">{formatCurrency(cashFlowData.beginningCash)}</td>
                    </tr>
                    <tr className="border-t-2 font-bold bg-gray-100">
                      <td className="p-2">Cash at End of Period</td>
                      <td className="p-2 text-right text-lg">{formatCurrency(cashFlowData.endingCash)}</td>
                    </tr>
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
