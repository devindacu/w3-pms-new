import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PrintButton } from '@/components/PrintButton'
import { A4PrintWrapper } from '@/components/A4PrintWrapper'
import {
  TrendUp,
  TrendDown,
  Warning,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Calendar,
  Download
} from '@phosphor-icons/react'
import { formatCurrency, formatPercent, formatDate } from '@/lib/helpers'
import type { Budget, Expense, Invoice } from '@/lib/types'

interface BudgetVarianceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  budgets: Budget[]
  expenses: Expense[]
  invoices: Invoice[]
}

type PeriodType = 'month' | 'quarter' | 'year' | 'custom'

interface VarianceData {
  category: string
  budgeted: number
  actual: number
  variance: number
  variancePercent: number
  status: 'favorable' | 'unfavorable' | 'ontrack'
}

export function BudgetVarianceDialog({
  open,
  onOpenChange,
  budgets,
  expenses,
  invoices
}: BudgetVarianceDialogProps) {
  const [periodType, setPeriodType] = useState<PeriodType>('month')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedQuarter, setSelectedQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ]
  const quarters = [
    { value: 1, label: 'Q1 (Jan-Mar)' },
    { value: 2, label: 'Q2 (Apr-Jun)' },
    { value: 3, label: 'Q3 (Jul-Sep)' },
    { value: 4, label: 'Q4 (Oct-Dec)' },
  ]

  const varianceAnalysis = useMemo(() => {
    let startDate: Date
    let endDate: Date

    if (periodType === 'custom') {
      if (!customStartDate || !customEndDate) return []
      startDate = new Date(customStartDate)
      endDate = new Date(customEndDate)
    } else if (periodType === 'month') {
      startDate = new Date(selectedYear, selectedMonth - 1, 1)
      endDate = new Date(selectedYear, selectedMonth, 0)
    } else if (periodType === 'quarter') {
      const startMonth = (selectedQuarter - 1) * 3
      startDate = new Date(selectedYear, startMonth, 1)
      endDate = new Date(selectedYear, startMonth + 3, 0)
    } else {
      startDate = new Date(selectedYear, 0, 1)
      endDate = new Date(selectedYear, 11, 31)
    }

    const categoryMap = new Map<string, VarianceData>()

    budgets.forEach(budget => {
      const budgetStart = new Date(budget.startDate)
      const budgetEnd = new Date(budget.endDate)

      if (budgetStart <= endDate && budgetEnd >= startDate) {
        budget.categories.forEach(budgetCat => {
          const actualExpenses = expenses
            .filter(exp => {
              const expDate = new Date(exp.expenseDate)
              return exp.category === budgetCat.category && 
                     expDate >= startDate && 
                     expDate <= endDate
            })
            .reduce((sum, exp) => sum + exp.amount, 0)

          const actualTotal = actualExpenses
          const variance = budgetCat.budgetedAmount - actualTotal
          const variancePercent = budgetCat.budgetedAmount > 0 
            ? (variance / budgetCat.budgetedAmount) * 100 
            : 0

          let status: 'favorable' | 'unfavorable' | 'ontrack'
          if (variancePercent >= 10) {
            status = 'favorable'
          } else if (variancePercent < -5) {
            status = 'unfavorable'
          } else {
            status = 'ontrack'
          }

          const existing = categoryMap.get(budgetCat.category)
          if (existing) {
            existing.budgeted += budgetCat.budgetedAmount
            existing.actual += actualTotal
            existing.variance = existing.budgeted - existing.actual
            existing.variancePercent = existing.budgeted > 0
              ? (existing.variance / existing.budgeted) * 100
              : 0
            
            if (existing.variancePercent >= 10) {
              existing.status = 'favorable'
            } else if (existing.variancePercent < -5) {
              existing.status = 'unfavorable'
            } else {
              existing.status = 'ontrack'
            }
          } else {
            categoryMap.set(budgetCat.category, {
              category: budgetCat.category,
              budgeted: budgetCat.budgetedAmount,
              actual: actualTotal,
              variance,
              variancePercent,
              status
            })
          }
        })
      }
    })

    return Array.from(categoryMap.values()).sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
  }, [budgets, expenses, invoices, periodType, selectedYear, selectedMonth, selectedQuarter, customStartDate, customEndDate])

  const summary = useMemo(() => {
    const totalBudgeted = varianceAnalysis.reduce((sum, v) => sum + v.budgeted, 0)
    const totalActual = varianceAnalysis.reduce((sum, v) => sum + v.actual, 0)
    const totalVariance = totalBudgeted - totalActual
    const favorableCount = varianceAnalysis.filter(v => v.status === 'favorable').length
    const unfavorableCount = varianceAnalysis.filter(v => v.status === 'unfavorable').length
    const onTrackCount = varianceAnalysis.filter(v => v.status === 'ontrack').length

    return {
      totalBudgeted,
      totalActual,
      totalVariance,
      favorableCount,
      unfavorableCount,
      onTrackCount
    }
  }, [varianceAnalysis])

  const getPeriodLabel = () => {
    if (periodType === 'custom') {
      return `${customStartDate || 'Start'} to ${customEndDate || 'End'}`
    }
    if (periodType === 'month') {
      return `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`
    }
    if (periodType === 'quarter') {
      return `${quarters.find(q => q.value === selectedQuarter)?.label} ${selectedYear}`
    }
    return `${selectedYear}`
  }

  const exportToCSV = () => {
    const rows = [
      ['Category', 'Budgeted', 'Actual', 'Variance', 'Variance %', 'Status'],
      ...varianceAnalysis.map(v => [
        v.category,
        v.budgeted.toFixed(2),
        v.actual.toFixed(2),
        v.variance.toFixed(2),
        v.variancePercent.toFixed(2),
        v.status
      ])
    ]
    const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `budget-variance-${getPeriodLabel().replace(/\s/g, '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusBadge = (status: 'favorable' | 'unfavorable' | 'ontrack') => {
    if (status === 'favorable') {
      return (
        <Badge className="bg-success/10 text-success border-success/20">
          <CheckCircle size={14} className="mr-1" />
          Under Budget
        </Badge>
      )
    }
    if (status === 'unfavorable') {
      return (
        <Badge className="bg-destructive/10 text-destructive border-destructive/20">
          <Warning size={14} className="mr-1" />
          Over Budget
        </Badge>
      )
    }
    return (
      <Badge variant="outline">
        <TrendUp size={14} className="mr-1" />
        On Track
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendUp size={24} />
              Budget Variance Analysis
            </div>
            <PrintButton
              elementId="budget-variance-print"
              options={{
                title: `Budget Variance Analysis - ${getPeriodLabel()}`,
                filename: `budget-variance-${Date.now()}.pdf`
              }}
              variant="outline"
              size="sm"
            />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Period Type</Label>
                <Select value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="quarter">Quarter</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {periodType !== 'custom' && (
                <div>
                  <Label>Year</Label>
                  <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {periodType === 'month' && (
                <div>
                  <Label>Month</Label>
                  <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month.value} value={month.value.toString()}>{month.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {periodType === 'quarter' && (
                <div>
                  <Label>Quarter</Label>
                  <Select value={selectedQuarter.toString()} onValueChange={(v) => setSelectedQuarter(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {quarters.map(quarter => (
                        <SelectItem key={quarter.value} value={quarter.value.toString()}>{quarter.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {periodType === 'custom' && (
                <>
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="flex items-end">
                <Button onClick={exportToCSV} variant="outline" className="w-full">
                  <Download size={16} className="mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Budgeted</div>
              <div className="text-2xl font-semibold">{formatCurrency(summary.totalBudgeted)}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Actual</div>
              <div className="text-2xl font-semibold">{formatCurrency(summary.totalActual)}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Variance</div>
              <div className={`text-2xl font-semibold ${summary.totalVariance >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(Math.abs(summary.totalVariance))}
                {summary.totalVariance >= 0 ? <ArrowUp className="inline ml-1" size={20} /> : <ArrowDown className="inline ml-1" size={20} />}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Status Summary</div>
              <div className="flex gap-2 mt-2">
                <Badge className="bg-success/10 text-success">{summary.favorableCount}</Badge>
                <Badge className="bg-destructive/10 text-destructive">{summary.unfavorableCount}</Badge>
                <Badge variant="outline">{summary.onTrackCount}</Badge>
              </div>
            </Card>
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Category Breakdown - {getPeriodLabel()}</h3>
            </div>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {varianceAnalysis.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No budget data available for the selected period
                  </div>
                ) : (
                  varianceAnalysis.map((item) => (
                    <Card key={item.category} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{item.category}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatPercent(Math.abs(item.variancePercent))} {item.variance >= 0 ? 'under' : 'over'} budget
                          </p>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>
                      <Separator className="my-2" />
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Budgeted</div>
                          <div className="font-semibold">{formatCurrency(item.budgeted)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Actual</div>
                          <div className="font-semibold">{formatCurrency(item.actual)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Variance</div>
                          <div className={`font-semibold ${item.variance >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {formatCurrency(Math.abs(item.variance))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>

        <div className="hidden">
          <A4PrintWrapper id="budget-variance-print" title={`Budget Variance Analysis - ${getPeriodLabel()}`}>
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold">Summary</h2>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="text-sm text-gray-600">Total Budgeted</div>
                    <div className="text-lg font-semibold">{formatCurrency(summary.totalBudgeted)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Actual</div>
                    <div className="text-lg font-semibold">{formatCurrency(summary.totalActual)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Variance</div>
                    <div className="text-lg font-semibold">{formatCurrency(Math.abs(summary.totalVariance))}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Status</div>
                    <div className="text-sm">
                      Favorable: {summary.favorableCount}, Unfavorable: {summary.unfavorableCount}, On Track: {summary.onTrackCount}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Category Breakdown</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Category</th>
                      <th className="p-2 text-right">Budgeted</th>
                      <th className="p-2 text-right">Actual</th>
                      <th className="p-2 text-right">Variance</th>
                      <th className="p-2 text-right">Variance %</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {varianceAnalysis.map((item) => (
                      <tr key={item.category} className="border-b">
                        <td className="p-2">{item.category}</td>
                        <td className="p-2 text-right">{formatCurrency(item.budgeted)}</td>
                        <td className="p-2 text-right">{formatCurrency(item.actual)}</td>
                        <td className="p-2 text-right">{formatCurrency(Math.abs(item.variance))}</td>
                        <td className="p-2 text-right">{formatPercent(Math.abs(item.variancePercent) / 100)}</td>
                        <td className="p-2 text-center">{item.status}</td>
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
