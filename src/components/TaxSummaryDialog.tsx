import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Receipt, Calendar } from '@phosphor-icons/react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { formatCurrency, formatDate } from '@/lib/helpers'
import type { Invoice, Expense, Payment } from '@/lib/types'
import { toast } from 'sonner'

interface TaxSummaryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoices: Invoice[]
  expenses: Expense[]
  payments: Payment[]
  guestInvoices?: any[]
}

const TAX_COLORS = [
  'oklch(0.65 0.22 265)',
  'oklch(0.68 0.24 35)',
  'oklch(0.60 0.18 155)',
  'oklch(0.62 0.24 25)',
  'oklch(0.55 0.16 220)',
]

export function TaxSummaryDialog({ 
  open, 
  onOpenChange, 
  invoices,
  expenses,
  payments,
  guestInvoices = []
}: TaxSummaryDialogProps) {
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()
  
  const [periodType, setPeriodType] = useState<'month' | 'quarter' | 'year'>('month')
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedQuarter, setSelectedQuarter] = useState(Math.floor(currentMonth / 3) + 1)

  const taxAnalysis = useMemo(() => {
    let startDate: number
    let endDate: number

    if (periodType === 'month') {
      startDate = new Date(selectedYear, selectedMonth, 1).getTime()
      endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59).getTime()
    } else if (periodType === 'quarter') {
      const quarterStart = (selectedQuarter - 1) * 3
      startDate = new Date(selectedYear, quarterStart, 1).getTime()
      endDate = new Date(selectedYear, quarterStart + 3, 0, 23, 59, 59).getTime()
    } else {
      startDate = new Date(selectedYear, 0, 1).getTime()
      endDate = new Date(selectedYear, 11, 31, 23, 59, 59).getTime()
    }

    const filteredInvoices = invoices.filter(inv => 
      inv.invoiceDate >= startDate && inv.invoiceDate <= endDate
    )

    const filteredGuestInvoices = guestInvoices.filter(inv => 
      inv.issueDate >= startDate && inv.issueDate <= endDate
    )

    const filteredExpenses = expenses.filter(exp => 
      exp.expenseDate >= startDate && exp.expenseDate <= endDate
    )

    const taxCollected = new Map<string, {
      taxName: string
      taxRate: number
      taxAmount: number
      baseAmount: number
      transactionCount: number
    }>()

    filteredGuestInvoices.forEach((inv) => {
      inv.lineItems?.forEach((item: any) => {
        if (item.taxAmount && item.taxAmount > 0) {
          const taxKey = `Tax ${item.taxRate || 0}%`
          if (!taxCollected.has(taxKey)) {
            taxCollected.set(taxKey, {
              taxName: taxKey,
              taxRate: item.taxRate || 0,
              taxAmount: 0,
              baseAmount: 0,
              transactionCount: 0,
            })
          }
          const tax = taxCollected.get(taxKey)!
          tax.taxAmount += item.taxAmount
          tax.baseAmount += item.subtotal || 0
          tax.transactionCount += 1
        }
      })

      if (inv.serviceCharge && inv.serviceCharge > 0) {
        const taxKey = 'Service Charge'
        if (!taxCollected.has(taxKey)) {
          taxCollected.set(taxKey, {
            taxName: taxKey,
            taxRate: 0,
            taxAmount: 0,
            baseAmount: 0,
            transactionCount: 0,
          })
        }
        const tax = taxCollected.get(taxKey)!
        tax.taxAmount += inv.serviceCharge
        tax.transactionCount += 1
      }
    })

    const taxPaid = new Map<string, {
      taxName: string
      taxRate: number
      taxAmount: number
      baseAmount: number
      transactionCount: number
    }>()

    filteredInvoices.forEach((inv) => {
      const tax = inv.tax || 0
      if (tax > 0) {
        const taxKey = 'Input Tax (Purchase)'
        if (!taxPaid.has(taxKey)) {
          taxPaid.set(taxKey, {
            taxName: taxKey,
            taxRate: 0,
            taxAmount: 0,
            baseAmount: 0,
            transactionCount: 0,
          })
        }
        const taxEntry = taxPaid.get(taxKey)!
        taxEntry.taxAmount += tax
        taxEntry.baseAmount += inv.subtotal || 0
        taxEntry.transactionCount += 1
      }
    })

    const totalTaxCollected = Array.from(taxCollected.values()).reduce((sum, t) => sum + t.taxAmount, 0)
    const totalTaxPaid = Array.from(taxPaid.values()).reduce((sum, t) => sum + t.taxAmount, 0)
    const netTaxLiability = totalTaxCollected - totalTaxPaid

    const monthlyTrend: { month: string; collected: number; paid: number; net: number }[] = []
    
    if (periodType === 'year') {
      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(selectedYear, month, 1).getTime()
        const monthEnd = new Date(selectedYear, month + 1, 0, 23, 59, 59).getTime()

        const monthInvoices = invoices.filter(inv => 
          inv.invoiceDate >= monthStart && inv.invoiceDate <= monthEnd
        )
        const monthGuestInvoices = guestInvoices.filter(inv => 
          inv.issueDate >= monthStart && inv.issueDate <= monthEnd
        )

        let collected = 0
        monthGuestInvoices.forEach((inv) => {
          inv.lineItems?.forEach((item: any) => {
            if (item.taxAmount) collected += item.taxAmount
          })
          if (inv.serviceCharge) collected += inv.serviceCharge
        })

        const paid = monthInvoices.reduce((sum, inv) => sum + (inv.tax || 0), 0)

        monthlyTrend.push({
          month: new Date(selectedYear, month).toLocaleDateString('en-US', { month: 'short' }),
          collected,
          paid,
          net: collected - paid,
        })
      }
    }

    return {
      taxCollected: Array.from(taxCollected.values()),
      taxPaid: Array.from(taxPaid.values()),
      totalTaxCollected,
      totalTaxPaid,
      netTaxLiability,
      monthlyTrend,
      invoiceCount: filteredGuestInvoices.length,
      purchaseCount: filteredInvoices.length,
      period: {
        start: startDate,
        end: endDate,
        type: periodType,
      },
    }
  }, [invoices, guestInvoices, expenses, periodType, selectedYear, selectedMonth, selectedQuarter])

  const exportToCSV = () => {
    const csvRows: string[] = []
    
    csvRows.push('Tax Summary Report')
    csvRows.push(`Period: ${formatDate(taxAnalysis.period.start)} to ${formatDate(taxAnalysis.period.end)}`)
    csvRows.push(`Generated: ${formatDate(Date.now())}`)
    csvRows.push('')
    csvRows.push('Summary')
    csvRows.push(`Total Tax Collected,${taxAnalysis.totalTaxCollected}`)
    csvRows.push(`Total Tax Paid,${taxAnalysis.totalTaxPaid}`)
    csvRows.push(`Net Tax Liability,${taxAnalysis.netTaxLiability}`)
    csvRows.push('')
    csvRows.push('Tax Collected (Output Tax)')
    csvRows.push('Tax Type,Rate,Base Amount,Tax Amount,Transactions')
    
    taxAnalysis.taxCollected.forEach((tax) => {
      csvRows.push(`${tax.taxName},${tax.taxRate}%,${tax.baseAmount},${tax.taxAmount},${tax.transactionCount}`)
    })
    
    csvRows.push('')
    csvRows.push('Tax Paid (Input Tax)')
    csvRows.push('Tax Type,Rate,Base Amount,Tax Amount,Transactions')
    
    taxAnalysis.taxPaid.forEach((tax) => {
      csvRows.push(`${tax.taxName},${tax.taxRate}%,${tax.baseAmount},${tax.taxAmount},${tax.transactionCount}`)
    })

    if (taxAnalysis.monthlyTrend.length > 0) {
      csvRows.push('')
      csvRows.push('Monthly Trend')
      csvRows.push('Month,Collected,Paid,Net')
      taxAnalysis.monthlyTrend.forEach((month) => {
        csvRows.push(`${month.month},${month.collected},${month.paid},${month.net}`)
      })
    }

    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Tax_Summary_${formatDate(Date.now()).replace(/\//g, '-')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success('Tax summary exported to CSV')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt size={24} />
            Tax Summary Report
          </DialogTitle>
        </DialogHeader>

        <div className="dialog-content-wrapper">
          <ScrollArea className="dialog-body-scrollable">
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <Label>Period Type</Label>
                    <Select value={periodType} onValueChange={(value: any) => setPeriodType(value)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="month">Monthly</SelectItem>
                        <SelectItem value="quarter">Quarterly</SelectItem>
                        <SelectItem value="year">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Year</Label>
                    <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 5 }, (_, i) => currentYear - i).map((year) => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {periodType === 'month' && (
                    <div>
                      <Label>Month</Label>
                      <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i).map((month) => (
                            <SelectItem key={month} value={month.toString()}>
                              {new Date(2000, month).toLocaleDateString('en-US', { month: 'long' })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {periodType === 'quarter' && (
                    <div>
                      <Label>Quarter</Label>
                      <Select value={selectedQuarter.toString()} onValueChange={(value) => setSelectedQuarter(parseInt(value))}>
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Q1</SelectItem>
                          <SelectItem value="2">Q2</SelectItem>
                          <SelectItem value="3">Q3</SelectItem>
                          <SelectItem value="4">Q4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <Button onClick={exportToCSV} variant="outline" size="sm">
                  <Download size={16} className="mr-2" />
                  Export CSV
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 border-l-4 border-l-success">
                  <p className="text-sm text-muted-foreground mb-1">Tax Collected (Output)</p>
                  <p className="text-2xl font-bold text-success">{formatCurrency(taxAnalysis.totalTaxCollected)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{taxAnalysis.invoiceCount} invoices</p>
                </Card>
                
                <Card className="p-4 border-l-4 border-l-accent">
                  <p className="text-sm text-muted-foreground mb-1">Tax Paid (Input)</p>
                  <p className="text-2xl font-bold text-accent">{formatCurrency(taxAnalysis.totalTaxPaid)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{taxAnalysis.purchaseCount} purchases</p>
                </Card>

                <Card className="p-4 border-l-4 border-l-primary">
                  <p className="text-sm text-muted-foreground mb-1">Net Tax Liability</p>
                  <p className={`text-2xl font-bold ${taxAnalysis.netTaxLiability >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {formatCurrency(taxAnalysis.netTaxLiability)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {taxAnalysis.netTaxLiability >= 0 ? 'Payable' : 'Refundable'}
                  </p>
                </Card>

                <Card className="p-4 border-l-4 border-l-secondary">
                  <p className="text-sm text-muted-foreground mb-1">Effective Tax Rate</p>
                  <p className="text-2xl font-bold text-secondary">
                    {taxAnalysis.taxCollected.reduce((sum, t) => sum + t.baseAmount, 0) > 0
                      ? ((taxAnalysis.totalTaxCollected / taxAnalysis.taxCollected.reduce((sum, t) => sum + t.baseAmount, 0)) * 100).toFixed(2)
                      : '0.00'}%
                  </p>
                </Card>
              </div>

              {periodType === 'year' && taxAnalysis.monthlyTrend.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Monthly Tax Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={taxAnalysis.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.05 140)" />
                      <XAxis dataKey="month" stroke="oklch(0.45 0.08 140)" fontSize={12} />
                      <YAxis stroke="oklch(0.45 0.08 140)" fontSize={12} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="collected" stroke="oklch(0.60 0.18 155)" strokeWidth={2} name="Collected" />
                      <Line type="monotone" dataKey="paid" stroke="oklch(0.68 0.24 35)" strokeWidth={2} name="Paid" />
                      <Line type="monotone" dataKey="net" stroke="oklch(0.65 0.22 265)" strokeWidth={2} name="Net" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-success" />
                    Tax Collected (Output Tax)
                  </h3>
                  <div className="space-y-3">
                    {taxAnalysis.taxCollected.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No tax collected in this period</p>
                    ) : (
                      taxAnalysis.taxCollected.map((tax, index) => (
                        <div key={tax.taxName} className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded" 
                                style={{ backgroundColor: TAX_COLORS[index % TAX_COLORS.length] }}
                              />
                              <h4 className="font-semibold">{tax.taxName}</h4>
                            </div>
                            <Badge variant="secondary">{tax.transactionCount} transactions</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {tax.taxRate > 0 && (
                              <div>
                                <p className="text-muted-foreground">Rate</p>
                                <p className="font-semibold">{tax.taxRate}%</p>
                              </div>
                            )}
                            <div>
                              <p className="text-muted-foreground">Base Amount</p>
                              <p className="font-semibold">{formatCurrency(tax.baseAmount)}</p>
                            </div>
                          </div>
                          <Separator className="my-3" />
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Tax Amount</p>
                            <p className="text-xl font-bold text-success">{formatCurrency(tax.taxAmount)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-accent" />
                    Tax Paid (Input Tax)
                  </h3>
                  <div className="space-y-3">
                    {taxAnalysis.taxPaid.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No tax paid in this period</p>
                    ) : (
                      taxAnalysis.taxPaid.map((tax, index) => (
                        <div key={tax.taxName} className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded" 
                                style={{ backgroundColor: TAX_COLORS[index % TAX_COLORS.length] }}
                              />
                              <h4 className="font-semibold">{tax.taxName}</h4>
                            </div>
                            <Badge variant="secondary">{tax.transactionCount} transactions</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {tax.taxRate > 0 && (
                              <div>
                                <p className="text-muted-foreground">Rate</p>
                                <p className="font-semibold">{tax.taxRate}%</p>
                              </div>
                            )}
                            <div>
                              <p className="text-muted-foreground">Base Amount</p>
                              <p className="font-semibold">{formatCurrency(tax.baseAmount)}</p>
                            </div>
                          </div>
                          <Separator className="my-3" />
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Tax Amount</p>
                            <p className="text-xl font-bold text-accent">{formatCurrency(tax.taxAmount)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>

              <Card className="p-6 bg-primary/5 border-2 border-primary">
                <h3 className="text-lg font-semibold mb-4">Tax Reconciliation</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-lg">
                    <span>Output Tax (Collected)</span>
                    <span className="font-semibold text-success">{formatCurrency(taxAnalysis.totalTaxCollected)}</span>
                  </div>
                  <div className="flex items-center justify-between text-lg">
                    <span>Input Tax (Paid)</span>
                    <span className="font-semibold text-accent">({formatCurrency(taxAnalysis.totalTaxPaid)})</span>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between text-xl">
                    <span className="font-bold">Net Tax {taxAnalysis.netTaxLiability >= 0 ? 'Payable' : 'Refundable'}</span>
                    <span className={`font-bold ${taxAnalysis.netTaxLiability >= 0 ? 'text-primary' : 'text-destructive'}`}>
                      {formatCurrency(Math.abs(taxAnalysis.netTaxLiability))}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
