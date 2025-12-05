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
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
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
    { value: 12, label: 'December' }
  ]
  const quarters = [
    { value: 1, label: 'Q1 (Jan-Mar)' },
    { value: 2, label: 'Q2 (Apr-Jun)' },
    { value: 3, label: 'Q3 (Jul-Sep)' },
    { value: 4, label: 'Q4 (Oct-Dec)' }
  ]

  const varianceAnalysis = useMemo(() => {
    let startDate: number
    let endDate: number

    if (periodType === 'custom') {
      if (!customStartDate || !customEndDate) return []
      startDate = new Date(customStartDate).getTime()
      endDate = new Date(customEndDate).getTime()
    } else if (periodType === 'month') {
      startDate = new Date(selectedYear, selectedMonth - 1, 1).getTime()
      endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59).getTime()
    } else if (periodType === 'quarter') {
      const quarterStartMonth = (selectedQuarter - 1) * 3
      startDate = new Date(selectedYear, quarterStartMonth, 1).getTime()
      endDate = new Date(selectedYear, quarterStartMonth + 3, 0, 23, 59, 59).getTime()
    } else {
      startDate = new Date(selectedYear, 0, 1).getTime()
      endDate = new Date(selectedYear, 11, 31, 23, 59, 59).getTime()
    }

    const categoryMap = new Map<string, VarianceData>()

    budgets.forEach(budget => {
      if (budget.startDate > endDate || budget.endDate < startDate) return

      const overlapStart = Math.max(budget.startDate, startDate)
      const overlapEnd = Math.min(budget.endDate, endDate)
      const daysCovered = Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24))

      const categoryExpenses = expenses.filter(
        exp => exp.category === budget.category && 
               exp.expenseDate >= overlapStart && 
               exp.expenseDate <= overlapEnd
      )
      const actualSpend = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0)

      const totalBudgetDays = Math.ceil((budget.endDate - budget.startDate) / (1000 * 60 * 60 * 24))
      const allocatedBudget = (budget.amount * daysCovered) / totalBudgetDays

      const variance = allocatedBudget - actualSpend
      const variancePercent = allocatedBudget > 0 ? (variance / allocatedBudget) * 100 : 0

      let status: 'favorable' | 'unfavorable' | 'ontrack' = 'ontrack'
      if (variancePercent > 10) {
        status = 'favorable'
      } else if (variancePercent < -10) {
        status = 'unfavorable'
      }

      const existing = categoryMap.get(budget.category)
      if (existing) {
        existing.budgeted += allocatedBudget
        existing.actual += actualSpend
        existing.variance = existing.budgeted - existing.actual
        existing.variancePercent = existing.budgeted > 0 
          ? (existing.variance / existing.budgeted) * 100 
          : 0
        
        if (existing.variancePercent > 10) {
          existing.status = 'favorable'
        } else if (existing.variancePercent < -10) {
          existing.status = 'unfavorable'
        } else {
          existing.status = 'ontrack'
        }
      } else {
        categoryMap.set(budget.category, {
          category: budget.category,
          budgeted: allocatedBudget,
          actual: actualSpend,
          variance,
          variancePercent,
          status
        })
      }
    })

    return Array.from(categoryMap.values()).sort((a, b) => 
      Math.abs(b.variance) - Math.abs(a.variance)
    )
  }, [budgets, expenses, periodType, selectedYear, selectedMonth, selectedQuarter, customStartDate, customEndDate])

  const summary = useMemo(() => {
    const totalBudgeted = varianceAnalysis.reduce((sum, v) => sum + v.budgeted, 0)
    const totalActual = varianceAnalysis.reduce((sum, v) => sum + v.actual, 0)
    const totalVariance = totalBudgeted - totalActual
    const totalVariancePercent = totalBudgeted > 0 ? (totalVariance / totalBudgeted) * 100 : 0

    const unfavorableCount = varianceAnalysis.filter(v => v.status === 'unfavorable').length
    const favorableCount = varianceAnalysis.filter(v => v.status === 'favorable').length
    const onTrackCount = varianceAnalysis.filter(v => v.status === 'ontrack').length

    return {
      totalBudgeted,
      totalActual,
      totalVariance,
      totalVariancePercent,
      unfavorableCount,
      favorableCount,
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
    return `Year ${selectedYear}`
  }

  const exportToCSV = () => {
    const rows = [
      ['Budget Variance Analysis'],
      ['Period', getPeriodLabel()],
      ['Generated', new Date().toLocaleString()],
      [],
      ['Category', 'Budgeted', 'Actual', 'Variance', 'Variance %', 'Status'],
      ...varianceAnalysis.map(v => [
        v.category,
        v.budgeted.toFixed(2),
        v.actual.toFixed(2),
        v.variance.toFixed(2),
        v.variancePercent.toFixed(2) + '%',
        v.status
      ]),
      [],
      ['TOTAL', summary.totalBudgeted.toFixed(2), summary.totalActual.toFixed(2), summary.totalVariance.toFixed(2), summary.totalVariancePercent.toFixed(2) + '%', '']
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
          <DialogTitle className="flex items-center gap-2">
            <TrendUp size={24} />
            Budget Variance Analysis
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
      </DialogContent>
    </Dialog>
  )
}
