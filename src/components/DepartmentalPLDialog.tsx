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
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Download,
  CalendarBlank,
  TrendUp,
  TrendDown,
  Minus,
  Printer,
  FileXls
} from '@phosphor-icons/react'
import { formatCurrency, formatDate, formatPercent } from '@/lib/helpers'
import type { 
  Department,
  GuestInvoice,
  Expense,
  Order,
  Folio,
  JournalEntry,
  GLEntry 
} from '@/lib/types'
import { toast } from 'sonner'

interface DepartmentalPLDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guestInvoices?: GuestInvoice[]
  expenses?: Expense[]
  orders?: Order[]
  folios?: Folio[]
  journalEntries?: JournalEntry[]
  glEntries?: GLEntry[]
}

interface DepartmentRevenue {
  department: Department
  revenue: number
  costOfSales: number
  grossProfit: number
  operatingExpenses: number
  operatingIncome: number
  otherIncome: number
  otherExpenses: number
  netIncome: number
  grossProfitMargin: number
  operatingMargin: number
  netProfitMargin: number
  transactions: number
}

interface PLPeriod {
  startDate: number
  endDate: number
}

const DEPARTMENTS: Department[] = [
  'front-office',
  'housekeeping',
  'fnb',
  'kitchen',
  'engineering',
  'finance',
  'hr',
  'admin'
]

const DEPARTMENT_LABELS: Record<Department, string> = {
  'front-office': 'Front Office (Rooms)',
  'housekeeping': 'Housekeeping',
  'fnb': 'Food & Beverage',
  'kitchen': 'Kitchen Operations',
  'engineering': 'Engineering & Maintenance',
  'finance': 'Finance & Accounts',
  'hr': 'Human Resources',
  'admin': 'Administration'
}

const REVENUE_DEPARTMENTS: Department[] = ['front-office', 'fnb', 'kitchen']

export function DepartmentalPLDialog({
  open,
  onOpenChange,
  guestInvoices = [],
  expenses = [],
  orders = [],
  folios = [],
  journalEntries = [],
  glEntries = []
}: DepartmentalPLDialogProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year' | 'custom'>('month')
  const [customPeriod, setCustomPeriod] = useState<PLPeriod>({
    startDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
    endDate: Date.now()
  })
  const [selectedDepartments, setSelectedDepartments] = useState<'all' | 'revenue'>('all')
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary')

  const getPeriodDates = (): PLPeriod => {
    const now = new Date()
    const endDate = now.getTime()
    
    switch (selectedPeriod) {
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        return { startDate: monthStart.getTime(), endDate }
      
      case 'quarter':
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3
        const quarterStart = new Date(now.getFullYear(), quarterMonth, 1)
        return { startDate: quarterStart.getTime(), endDate }
      
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1)
        return { startDate: yearStart.getTime(), endDate }
      
      case 'custom':
        return customPeriod
      
      default:
        return { startDate: endDate - 30 * 24 * 60 * 60 * 1000, endDate }
    }
  }

  const calculateDepartmentPL = (department: Department): DepartmentRevenue => {
    const period = getPeriodDates()
    
    let revenue = 0
    let costOfSales = 0
    let operatingExpenses = 0
    let otherIncome = 0
    let otherExpenses = 0
    let transactions = 0

    folios.forEach(folio => {
      if (folio.createdAt >= period.startDate && folio.createdAt <= period.endDate) {
        folio.charges.forEach(charge => {
          if (charge.department === department) {
            revenue += charge.amount * charge.quantity
            transactions++
          }
        })
      }
    })

    orders.forEach(order => {
      if (order.createdAt >= period.startDate && order.createdAt <= period.endDate) {
        if (department === 'fnb' || department === 'kitchen') {
          revenue += order.total
          transactions++
        }
      }
    })

    guestInvoices.forEach(invoice => {
      if (invoice.createdAt >= period.startDate && invoice.createdAt <= period.endDate) {
        invoice.lineItems.forEach(item => {
          if (item.department === department) {
            revenue += item.lineGrandTotal
            transactions++
          }
        })
      }
    })

    expenses.forEach(expense => {
      if (expense.expenseDate >= period.startDate && expense.expenseDate <= period.endDate) {
        if (expense.department === department) {
          if (expense.category === 'food-beverage') {
            costOfSales += expense.amount
          } else {
            operatingExpenses += expense.amount
          }
        }
      }
    })

    glEntries?.forEach(entry => {
      if (entry.transactionDate >= period.startDate && entry.transactionDate <= period.endDate) {
        if (entry.department === department) {
          if (entry.accountCode.startsWith('4')) {
            revenue += entry.credit - entry.debit
          } else if (entry.accountCode.startsWith('5')) {
            costOfSales += entry.debit - entry.credit
          } else if (entry.accountCode.startsWith('6')) {
            operatingExpenses += entry.debit - entry.credit
          }
        }
      }
    })

    const grossProfit = revenue - costOfSales
    const operatingIncome = grossProfit - operatingExpenses
    const netIncome = operatingIncome + otherIncome - otherExpenses

    const grossProfitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0
    const operatingMargin = revenue > 0 ? (operatingIncome / revenue) * 100 : 0
    const netProfitMargin = revenue > 0 ? (netIncome / revenue) * 100 : 0

    return {
      department,
      revenue,
      costOfSales,
      grossProfit,
      operatingExpenses,
      operatingIncome,
      otherIncome,
      otherExpenses,
      netIncome,
      grossProfitMargin,
      operatingMargin,
      netProfitMargin,
      transactions
    }
  }

  const departmentsToShow = selectedDepartments === 'revenue' 
    ? REVENUE_DEPARTMENTS 
    : DEPARTMENTS

  const departmentResults = departmentsToShow.map(dept => calculateDepartmentPL(dept))
  
  const consolidatedPL = {
    revenue: departmentResults.reduce((sum, d) => sum + d.revenue, 0),
    costOfSales: departmentResults.reduce((sum, d) => sum + d.costOfSales, 0),
    grossProfit: departmentResults.reduce((sum, d) => sum + d.grossProfit, 0),
    operatingExpenses: departmentResults.reduce((sum, d) => sum + d.operatingExpenses, 0),
    operatingIncome: departmentResults.reduce((sum, d) => sum + d.operatingIncome, 0),
    otherIncome: departmentResults.reduce((sum, d) => sum + d.otherIncome, 0),
    otherExpenses: departmentResults.reduce((sum, d) => sum + d.otherExpenses, 0),
    netIncome: departmentResults.reduce((sum, d) => sum + d.netIncome, 0),
    transactions: departmentResults.reduce((sum, d) => sum + d.transactions, 0)
  }

  const grossProfitMargin = consolidatedPL.revenue > 0 
    ? (consolidatedPL.grossProfit / consolidatedPL.revenue) * 100 
    : 0
  const operatingMargin = consolidatedPL.revenue > 0 
    ? (consolidatedPL.operatingIncome / consolidatedPL.revenue) * 100 
    : 0
  const netProfitMargin = consolidatedPL.revenue > 0 
    ? (consolidatedPL.netIncome / consolidatedPL.revenue) * 100 
    : 0

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendUp size={16} className="text-success" weight="bold" />
    if (value < 0) return <TrendDown size={16} className="text-destructive" weight="bold" />
    return <Minus size={16} className="text-muted-foreground" />
  }

  const getMarginBadge = (margin: number) => {
    if (margin >= 30) return <Badge className="bg-success text-success-foreground">{formatPercent(margin / 100)}</Badge>
    if (margin >= 15) return <Badge variant="secondary">{formatPercent(margin / 100)}</Badge>
    if (margin >= 0) return <Badge variant="outline">{formatPercent(margin / 100)}</Badge>
    return <Badge variant="destructive">{formatPercent(margin / 100)}</Badge>
  }

  const handleExportPDF = () => {
    toast.success('Exporting P&L report as PDF...')
  }

  const handleExportExcel = () => {
    const period = getPeriodDates()
    let csv = 'Departmental Profit & Loss Statement\n'
    csv += `Period: ${formatDate(period.startDate)} to ${formatDate(period.endDate)}\n\n`
    
    csv += 'Department,Revenue,Cost of Sales,Gross Profit,Operating Expenses,Operating Income,Other Income,Other Expenses,Net Income,Gross Margin %,Operating Margin %,Net Margin %,Transactions\n'
    
    departmentResults.forEach(dept => {
      csv += `${DEPARTMENT_LABELS[dept.department]},`
      csv += `${dept.revenue},${dept.costOfSales},${dept.grossProfit},`
      csv += `${dept.operatingExpenses},${dept.operatingIncome},`
      csv += `${dept.otherIncome},${dept.otherExpenses},${dept.netIncome},`
      csv += `${dept.grossProfitMargin.toFixed(2)},${dept.operatingMargin.toFixed(2)},${dept.netProfitMargin.toFixed(2)},`
      csv += `${dept.transactions}\n`
    })
    
    csv += '\nConsolidated,,,,,,,,,,,\n'
    csv += `Total,${consolidatedPL.revenue},${consolidatedPL.costOfSales},${consolidatedPL.grossProfit},`
    csv += `${consolidatedPL.operatingExpenses},${consolidatedPL.operatingIncome},`
    csv += `${consolidatedPL.otherIncome},${consolidatedPL.otherExpenses},${consolidatedPL.netIncome},`
    csv += `${grossProfitMargin.toFixed(2)},${operatingMargin.toFixed(2)},${netProfitMargin.toFixed(2)},`
    csv += `${consolidatedPL.transactions}\n`
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `departmental-pl-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('P&L report exported to Excel')
  }

  const handlePrint = () => {
    window.print()
    toast.success('Preparing print...')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <TrendUp size={28} weight="duotone" className="text-primary" />
            Departmental P&L Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Period</Label>
              <Select value={selectedPeriod} onValueChange={(v: any) => setSelectedPeriod(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Current Month</SelectItem>
                  <SelectItem value="quarter">Current Quarter</SelectItem>
                  <SelectItem value="year">Current Year</SelectItem>
                  <SelectItem value="custom">Custom Period</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedPeriod === 'custom' && (
              <>
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
              </>
            )}

            <div>
              <Label>Departments</Label>
              <Select value={selectedDepartments} onValueChange={(v: any) => setSelectedDepartments(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="revenue">Revenue Centers Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer size={16} className="mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download size={16} className="mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <FileXls size={16} className="mr-2" />
              Export Excel
            </Button>
          </div>

          <Separator />

          <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
            <TabsList>
              <TabsTrigger value="summary">Summary View</TabsTrigger>
              <TabsTrigger value="detailed">Detailed View</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <Card className="p-6 bg-primary/5 border-primary">
                <h3 className="text-lg font-semibold mb-4">Consolidated P&L</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Revenue</div>
                    <div className="text-2xl font-bold text-success">{formatCurrency(consolidatedPL.revenue)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Gross Profit</div>
                    <div className="text-2xl font-bold flex items-center gap-2">
                      {formatCurrency(consolidatedPL.grossProfit)}
                      {getTrendIcon(consolidatedPL.grossProfit)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Operating Income</div>
                    <div className="text-2xl font-bold flex items-center gap-2">
                      {formatCurrency(consolidatedPL.operatingIncome)}
                      {getTrendIcon(consolidatedPL.operatingIncome)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Net Income</div>
                    <div className="text-2xl font-bold flex items-center gap-2">
                      {formatCurrency(consolidatedPL.netIncome)}
                      {getTrendIcon(consolidatedPL.netIncome)}
                    </div>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Gross Margin</div>
                    <div className="text-xl font-semibold">{getMarginBadge(grossProfitMargin)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Operating Margin</div>
                    <div className="text-xl font-semibold">{getMarginBadge(operatingMargin)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Net Margin</div>
                    <div className="text-xl font-semibold">{getMarginBadge(netProfitMargin)}</div>
                  </div>
                </div>
              </Card>

              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {departmentResults.map((dept) => (
                    <Card key={dept.department} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg">{DEPARTMENT_LABELS[dept.department]}</h4>
                        <Badge variant="outline">{dept.transactions} transactions</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                        <div>
                          <div className="text-muted-foreground">Revenue</div>
                          <div className="font-semibold">{formatCurrency(dept.revenue)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Gross Profit</div>
                          <div className="font-semibold">{formatCurrency(dept.grossProfit)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Operating Income</div>
                          <div className="font-semibold">{formatCurrency(dept.operatingIncome)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Net Income</div>
                          <div className="font-semibold flex items-center gap-1">
                            {formatCurrency(dept.netIncome)}
                            {getTrendIcon(dept.netIncome)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Net Margin</div>
                          <div className="font-semibold">{getMarginBadge(dept.netProfitMargin)}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="detailed" className="space-y-4">
              <ScrollArea className="h-[500px]">
                <div className="space-y-6">
                  {departmentResults.map((dept) => (
                    <Card key={dept.department} className="p-6">
                      <h4 className="font-bold text-xl mb-4 pb-2 border-b">
                        {DEPARTMENT_LABELS[dept.department]}
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Revenue</span>
                          <span className="font-bold text-lg">{formatCurrency(dept.revenue)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center pl-4 text-sm">
                          <span className="text-muted-foreground">Cost of Sales</span>
                          <span className="text-destructive">({formatCurrency(dept.costOfSales)})</span>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex justify-between items-center font-semibold bg-muted/50 p-2 rounded">
                          <span>Gross Profit</span>
                          <span className="flex items-center gap-2">
                            {formatCurrency(dept.grossProfit)}
                            {getMarginBadge(dept.grossProfitMargin)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center pl-4 text-sm">
                          <span className="text-muted-foreground">Operating Expenses</span>
                          <span className="text-destructive">({formatCurrency(dept.operatingExpenses)})</span>
                        </div>
                        
                        <Separator />
                        
                        <div className="flex justify-between items-center font-semibold bg-muted/50 p-2 rounded">
                          <span>Operating Income</span>
                          <span className="flex items-center gap-2">
                            {formatCurrency(dept.operatingIncome)}
                            {getMarginBadge(dept.operatingMargin)}
                          </span>
                        </div>
                        
                        {(dept.otherIncome > 0 || dept.otherExpenses > 0) && (
                          <>
                            {dept.otherIncome > 0 && (
                              <div className="flex justify-between items-center pl-4 text-sm">
                                <span className="text-muted-foreground">Other Income</span>
                                <span className="text-success">{formatCurrency(dept.otherIncome)}</span>
                              </div>
                            )}
                            
                            {dept.otherExpenses > 0 && (
                              <div className="flex justify-between items-center pl-4 text-sm">
                                <span className="text-muted-foreground">Other Expenses</span>
                                <span className="text-destructive">({formatCurrency(dept.otherExpenses)})</span>
                              </div>
                            )}
                            
                            <Separator />
                          </>
                        )}
                        
                        <div className="flex justify-between items-center font-bold text-lg bg-primary/10 p-3 rounded">
                          <span>Net Income</span>
                          <span className="flex items-center gap-2">
                            {formatCurrency(dept.netIncome)}
                            {getMarginBadge(dept.netProfitMargin)}
                          </span>
                        </div>
                        
                        <div className="pt-2 text-sm text-muted-foreground text-right">
                          Based on {dept.transactions} transactions
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
