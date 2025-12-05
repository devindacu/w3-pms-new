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
  Download,
  TrendUp,
  TrendDown,
  Warning,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Calendar
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

  const getDateRange = (): { start: number; end: number } => {
    if (periodType === 'custom') {
      const start = customStartDate ? new Date(customStartDate).getTime() : 0
      const end = customEndDate ? new Date(customEndDate).getTime() : Date.now()
      return { start, end }
    }

    if (periodType === 'month') {
      const start = new Date(selectedYear, selectedMonth - 1, 1).getTime()
      const end = new Date(selectedYear, selectedMonth, 0, 23, 59, 59).getTime()
      return { start, end }
    }

    if (periodType === 'quarter') {
      const startMonth = (selectedQuarter - 1) * 3
      const start = new Date(selectedYear, startMonth, 1).getTime()
      const end = new Date(selectedYear, startMonth + 3, 0, 23, 59, 59).getTime()
      return { start, end }
    }

    const start = new Date(selectedYear, 0, 1).getTime()
    const end = new Date(selectedYear, 11, 31, 23, 59, 59).getTime()
    return { start, end }
  }

  const varianceAnalysis = useMemo(() => {
    const { start, end } = getDateRange()
    
    const activeBudgets = budgets.filter(b => {
      const budgetStart = b.startDate
      const budgetEnd = b.endDate
      return budgetStart <= end && budgetEnd >= start
    })

    const relevantExpenses = expenses.filter(e => 
      e.expenseDate >= start && e.expenseDate <= end && e.status === 'approved'
    )

    const categoryMap = new Map<string, VarianceData>()

    activeBudgets.forEach(budget => {
      budget.categories.forEach(budgetCategory => {
        const categoryExpenses = relevantExpenses.filter(e => 
          e.category === budgetCategory.category && e.department === budget.department
        )
        const actualSpend = categoryExpenses.reduce((sum, e) => sum + e.amount, 0)
        
        const daysCovered = Math.min(end, budget.endDate) - Math.max(start, budget.startDate)
        const totalBudgetDays = budget.endDate - budget.startDate
        const allocatedBudget = (budgetCategory.budgetedAmount * daysCovered) / totalBudgetDays

        const variance = allocatedBudget - actualSpend
        const variancePercent = allocatedBudget > 0 ? (variance / allocatedBudget) * 100 : 0

        let status: 'favorable' | 'unfavorable' | 'ontrack' = 'ontrack'
        if (variancePercent > 10) {
          status = 'favorable'
        } else if (variancePercent < -10) {
          status = 'unfavorable'
        }

        const categoryKey = `${budget.department}-${budgetCategory.category}`
        const existing = categoryMap.get(categoryKey)
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
          categoryMap.set(categoryKey, {
            category: `${budget.department} - ${budgetCategory.category}`,
            budgeted: allocatedBudget,
            actual: actualSpend,
            variance,
            variancePercent,
            status
          })
        }
      })
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
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendUp size={24} />
            Budget Variance Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={20} className="text-primary" />
                <Label className="font-semibold">Select Period</Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="period-type">Period Type</Label>
                  <Select value={periodType} onValueChange={(v) => setPeriodType(v as PeriodType)}>
                    <SelectTrigger id="period-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="quarter">Quarterly</SelectItem>
                      <SelectItem value="year">Yearly</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {periodType !== 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                      <SelectTrigger id="year">
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
                  <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                      <SelectTrigger id="month">
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
                  <div className="space-y-2">
                    <Label htmlFor="quarter">Quarter</Label>
                    <Select value={selectedQuarter.toString()} onValueChange={(v) => setSelectedQuarter(parseInt(v))}>
                      <SelectTrigger id="quarter">
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
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="flex items-end">
                  <Button onClick={exportToCSV} variant="outline" className="w-full">
                    <Download size={18} className="mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>

              <div className="pt-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Analysis Period: <span className="text-foreground font-semibold">{getPeriodLabel()}</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 border-l-4 border-l-primary">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Total Budgeted</div>
                <div className="text-2xl font-bold">{formatCurrency(summary.totalBudgeted)}</div>
              </div>
            </Card>

            <Card className="p-4 border-l-4 border-l-accent">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Total Actual</div>
                <div className="text-2xl font-bold">{formatCurrency(summary.totalActual)}</div>
              </div>
            </Card>

            <Card className={`p-4 border-l-4 ${summary.totalVariance >= 0 ? 'border-l-success' : 'border-l-destructive'}`}>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Total Variance</div>
                <div className={`text-2xl font-bold flex items-center gap-2 ${summary.totalVariance >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {summary.totalVariance >= 0 ? <ArrowDown size={20} /> : <ArrowUp size={20} />}
                  {formatCurrency(Math.abs(summary.totalVariance))}
                </div>
                <div className="text-xs">
                  {formatPercent(Math.abs(summary.totalVariancePercent / 100))} {summary.totalVariance >= 0 ? 'under' : 'over'} budget
                </div>
              </div>
            </Card>

            <Card className="p-4 border-l-4 border-l-muted">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Categories</div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-success">Under Budget</span>
                    <span className="font-semibold">{summary.favorableCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-destructive">Over Budget</span>
                    <span className="font-semibold">{summary.unfavorableCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">On Track</span>
                    <span className="font-semibold">{summary.onTrackCount}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <ScrollArea className="h-[400px]">
              <div className="p-4 space-y-3">
                {varianceAnalysis.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <TrendUp size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No budget data available for the selected period</p>
                    <p className="text-sm mt-2">Try selecting a different time range or create budgets first</p>
                  </div>
                ) : (
                  varianceAnalysis.map((item) => (
                    <Card key={item.category} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{item.category}</h4>
                          {getStatusBadge(item.status)}
                        </div>
                        <div className={`text-right ${item.variance >= 0 ? 'text-success' : 'text-destructive'}`}>
                          <div className="text-sm font-medium">
                            {item.variance >= 0 ? '+' : '-'}{formatCurrency(Math.abs(item.variance))}
                          </div>
                          <div className="text-xs flex items-center gap-1 justify-end">
                            {item.variance >= 0 ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                            {formatPercent(Math.abs(item.variancePercent / 100))}
                          </div>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground mb-1">Budgeted</div>
                          <div className="font-semibold">{formatCurrency(item.budgeted)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Actual Spend</div>
                          <div className="font-semibold">{formatCurrency(item.actual)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Utilization</div>
                          <div className="font-semibold">
                            {formatPercent(item.budgeted > 0 ? item.actual / item.budgeted : 0)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            item.actual > item.budgeted 
                              ? 'bg-destructive' 
                              : item.actual > item.budgeted * 0.9
                              ? 'bg-accent'
                              : 'bg-success'
                          }`}
                          style={{ 
                            width: `${Math.min(100, item.budgeted > 0 ? (item.actual / item.budgeted) * 100 : 0)}%` 
                          }}
                        />
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
