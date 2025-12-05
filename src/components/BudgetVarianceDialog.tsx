import { useState, useMemo } from 'react'
  Dialog
  DialogH
} from '@/compon
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
  TrendUp,
  Warning,
  ArrowUp,
  Calendar,
} from '@phosphor-icons/react'
import type { Budget, Expense, Invoice } from '@/lib/types'
interface BudgetVarianceDialogProps {
  onOpen
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
    { v
  onOpenChange,
  ]
  expenses,
    { valu
}: BudgetVarianceDialogProps) {
  const [periodType, setPeriodType] = useState<PeriodType>('month')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedQuarter, setSelectedQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)
      endDate = ne
    { value: 1, label: 'January' },
      } else if (variancePercent < -
      }
      const existing = categoryMa
        existing.budgeted += al
        existing.variance = exis
          ? (existing.variance /
        
          existing.status = 'favorabl
          existing.status = 'unfavor
          existing.status = 'ontrack'
      } else {
   
          actual: ac
          variancePercent,
        })
    })
    return Array.from(categoryMap.value
   

    const totalBudgeted = varianceAnalysis
    const totalVariance =



      totalBudgeted,
      totalVariance,
      unfavorableCount,
      onTrackCount
  }, [varianceAnalysis])
  const getPeriodLabel = () => {
      return `${customStartDate || 'Start'
    if (periodType === 'month') {
    }
      return `${quarters.find(q => q.value === selectedQuarter)?.label} ${selectedYear
    return `

    const rows = [
     

      ...varianceAnalysis.map(v => [

        v.variance.toFixed(2),
        v.status

    ]
    const csv = rows.map(row => row.map(cell => `"${cell}"
    const url = URL.createObjectURL(blob)

    a.click()
  }
  const getStatusBadge = (status: 'favorable' | 'u
      return (
       
        </Badge>

      return (
          <Warning size={14} className="mr-1" />

    }
      <Badge variant="outline">

    )

    <Dialog open={open} onOp
        <DialogHeader>
            <TrendUp size={24}
      }

          <Card className="p-4">
              <div>
                <Select value={periodType} o
                    <SelectValue />
                  <SelectContent>
                    <SelectItem value="quarter">Quarter</
                    <SelectItem value="custom">Custom Rang
             
        
                <div>
                  <Select value={select
                      <SelectValue />
                    <SelectContent>
                
          existing.status = 'ontrack'
         
      } else {
                <div>
                  <Select value={sel
                      <SelectValue /
                    <SelectCon
                   
          variancePercent,
                
        })
       
    })

                    <SelectContent>
                        <SelectItem key={quarter.
     
                </div>

                <>
                    <Label>Start Date</Label>
                      type="date"
                      onChange={(e) => setCustomStart
                  </div>

                      type="date"
                      onChange={(e) => setCustomEndDate(e.target.value)}
                  </div>

            
      totalBudgeted,
                </
      totalVariance,

      unfavorableCount,
              <div cl
      onTrackCount
     
  }, [varianceAnalysis])

  const getPeriodLabel = () => {
            </Card>
              <div className="text-sm text-muted-foreground mb-1">Status 
     
    if (periodType === 'month') {
            </Card>
    }
            <div className="flex it
            </div>
     
                  <div className=
   

                      <div cl
    const rows = [
                            {format
                        </div>
                      </div>
         
                          <div className="text-muted-foreground">Budgeted</di
      ...varianceAnalysis.map(v => [
                   
                        </div>
                          <d
        v.variance.toFixed(2),
                        </div>
        v.status
         
         
        </div>
    ]



    const url = URL.createObjectURL(blob)

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
