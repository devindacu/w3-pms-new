import { useState, useMemo } from 'react'
  Dialog
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
} from '@ph
  TrendUp,

  Warning,
  onOpenChange
  ArrowUp,
  invoices: 
  Calendar
type PeriodType = 'month' | 'q
import { formatCurrency, formatPercent, formatDate } from '@/lib/helpers'
  category: string

  variance: number
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
      return { sta
    { value: 1, label: 'January' },
        const actualSpend = category
        const daysCovered = Math.
        const allocatedBudget = (
        const variance = alloca

        if (variancePercent > 10
        } else if (variancePercent
        }
        const categoryKey = `${budge
        if (existing) {
          existing.actual += actualS
   
            : 0
          if (existing.variancePercent >
          } else if (existing.variancePe
          } else {
          }
   

            variance,
            status
        }
    })
    return Array.from(categ
    )

    const totalBudgeted = varianc
    const totalVariance = totalBudgeted - totalActual

    const favorableCount = 


      totalVariance,
      unfavorableCount,
      onTrackCount
  }, [varianceAnalysis])
  const getPeriodLabel = ()
     

    }
      return `${quarters.find(q => q.value === selectedQuarter)?.lab
    return `Year ${select


      ['Period', getPeriodLabel()],
      [],
    
        v.budgeted.toFixed(2),
        v.variance.toFixed(2),
        v.status
      [],
    ]

    const url = URL.createObjectURL(blob)
    a.href = url
    a

  const getStatusBadge = (status: 'favorable' | 'unfavo

          <CheckCircle size={14} clas
        </Badge>
    }
      
          <Warning size={14} className="mr-1" />
      const totalBudgetDays = budget.endDate - budget.startDate
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
























































































































































































































































