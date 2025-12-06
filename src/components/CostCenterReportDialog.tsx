import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Download, TrendUp, TrendDown, ChartBar, ListChecks, Calendar, Warning } from '@phosphor-icons/react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Area } from 'recharts'
import { type CostCenter, type Expense, type Budget, type CostCenterReport, type Department, type ExpenseCategory } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/helpers'
import { toast } from 'sonner'

interface CostCenterReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  costCenters: CostCenter[]
  expenses: Expense[]
  budgets: Budget[]
  costCenterReports?: CostCenterReport[]
}

const CHART_COLORS = ['oklch(0.65 0.22 265)', 'oklch(0.55 0.16 220)', 'oklch(0.60 0.18 155)', 'oklch(0.68 0.24 35)', 'oklch(0.62 0.20 310)']

export function CostCenterReportDialog({
  open,
  onOpenChange,
  costCenters,
  expenses,
  budgets,
  costCenterReports = []
}: CostCenterReportDialogProps) {
  const [selectedCostCenterId, setSelectedCostCenterId] = useState<string>('')
  const [dateRange, setDateRange] = useState<'month' | 'quarter' | 'year'>('month')
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary')

  const now = Date.now()
  const startDate = useMemo(() => {
    const date = new Date()
    if (dateRange === 'month') {
      date.setMonth(date.getMonth() - 1)
    } else if (dateRange === 'quarter') {
      date.setMonth(date.getMonth() - 3)
    } else {
      date.setFullYear(date.getFullYear() - 1)
    }
    return date.getTime()
  }, [dateRange])

  const selectedCostCenter = costCenters.find(cc => cc.id === selectedCostCenterId)

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => 
      exp.date >= startDate && exp.date <= now &&
      (selectedCostCenter ? exp.department === selectedCostCenter.department : true)
    )
  }, [expenses, startDate, now, selectedCostCenter])

  const allCostCentersData = useMemo(() => {
    return costCenters.map(cc => {
      const ccExpenses = expenses.filter(exp => 
        exp.date >= startDate && 
        exp.date <= now &&
        exp.department === cc.department
      )
      const actual = ccExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      const budget = cc.budget || budgets.find(b => b.department === cc.department)?.totalBudget || 0
      const variance = budget - actual
      const variancePercentage = budget > 0 ? (variance / budget) * 100 : 0
      
      return {
        ...cc,
        actualAmount: actual,
        budgetedAmount: budget,
        variance,
        variancePercentage,
        efficiency: budget > 0 ? ((budget - actual) / budget) * 100 : 0,
        status: variance >= 0 ? 'under-budget' : 'over-budget'
      }
    })
  }, [costCenters, expenses, budgets, startDate, now])

  const totalActual = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const totalBudget = selectedCostCenter?.budget || budgets.find(b => b.department === selectedCostCenter?.department)?.totalBudget || 0
  const variance = totalBudget - totalActual
  const variancePercentage = totalBudget > 0 ? (variance / totalBudget) * 100 : 0

  const expensesByCategory = useMemo(() => {
    const categoryMap: Record<string, { actual: number; budgeted: number }> = {}
    
    filteredExpenses.forEach(exp => {
      if (!categoryMap[exp.category]) {
        categoryMap[exp.category] = { actual: 0, budgeted: 0 }
      }
      categoryMap[exp.category].actual += exp.amount
    })

    const relatedBudget = budgets.find(b => b.department === selectedCostCenter?.department)
    if (relatedBudget) {
      relatedBudget.categories.forEach(cat => {
        if (!categoryMap[cat.category]) {
          categoryMap[cat.category] = { actual: 0, budgeted: 0 }
        }
        categoryMap[cat.category].budgeted = cat.budgetedAmount
      })
    }

    return Object.entries(categoryMap).map(([category, data]) => ({
      category,
      actual: data.actual,
      budgeted: data.budgeted,
      variance: data.budgeted - data.actual,
      variancePercentage: data.budgeted > 0 ? ((data.budgeted - data.actual) / data.budgeted) * 100 : 0,
      percentage: totalActual > 0 ? (data.actual / totalActual) * 100 : 0
    }))
  }, [filteredExpenses, totalActual, budgets, selectedCostCenter])

  const monthlyTrend = useMemo(() => {
    const months: Record<string, { actual: number; budgeted: number }> = {}
    
    filteredExpenses.forEach(exp => {
      const date = new Date(exp.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!months[monthKey]) {
        months[monthKey] = { actual: 0, budgeted: 0 }
      }
      months[monthKey].actual += exp.amount
    })

    const relatedBudget = budgets.find(b => b.department === selectedCostCenter?.department)
    if (relatedBudget) {
      const monthlyBudget = relatedBudget.totalBudget / 12
      Object.keys(months).forEach(monthKey => {
        months[monthKey].budgeted = monthlyBudget
      })
    }

    return Object.entries(months).map(([month, data]) => ({
      month,
      actual: data.actual,
      budgeted: data.budgeted,
      variance: data.budgeted - data.actual,
      variancePercentage: data.budgeted > 0 ? ((data.budgeted - data.actual) / data.budgeted) * 100 : 0
    })).sort((a, b) => a.month.localeCompare(b.month))
  }, [filteredExpenses, budgets, selectedCostCenter])

  const departmentBreakdown = useMemo(() => {
    const deptMap: Record<Department, number> = {} as any
    filteredExpenses.forEach(exp => {
      deptMap[exp.department] = (deptMap[exp.department] || 0) + exp.amount
    })
    return Object.entries(deptMap).map(([dept, amount]) => ({
      department: dept as Department,
      amount,
      percentage: totalActual > 0 ? (amount / totalActual) * 100 : 0
    }))
  }, [filteredExpenses, totalActual])

  const exportReport = () => {
    const reportData = {
      period: dateRange,
      startDate: formatDate(startDate),
      endDate: formatDate(now),
      costCenter: selectedCostCenter?.name || 'All Cost Centers',
      totalBudget,
      totalActual,
      variance,
      variancePercentage,
      expensesByCategory,
      monthlyTrend,
      departmentBreakdown
    }
    
    console.log('Exporting cost center report...', reportData)
    toast.success('Report export functionality coming soon')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Cost Center Performance Report</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Detailed budget vs actual analysis across all departments
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={exportReport} size="sm" variant="outline">
                <Download size={16} className="mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(95vh-120px)]">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Cost Center</Label>
                <Select value={selectedCostCenterId} onValueChange={setSelectedCostCenterId}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Cost Centers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Cost Centers</SelectItem>
                    {costCenters.map((cc) => (
                      <SelectItem key={cc.id} value={cc.id}>
                        {cc.code} - {cc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Period</Label>
                <Select value={dateRange} onValueChange={(val) => setDateRange(val as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>View Mode</Label>
                <Select value={viewMode} onValueChange={(val) => setViewMode(val as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 border-l-4 border-l-primary">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Budgeted Amount</p>
                  <ChartBar size={20} className="text-primary" />
                </div>
                <p className="text-2xl font-semibold">{formatCurrency(totalBudget)}</p>
                <p className="text-xs text-muted-foreground mt-1">Target allocation</p>
              </Card>

              <Card className="p-4 border-l-4 border-l-accent">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Actual Spent</p>
                  <ListChecks size={20} className="text-accent" />
                </div>
                <p className="text-2xl font-semibold">{formatCurrency(totalActual)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalBudget > 0 ? ((totalActual / totalBudget) * 100).toFixed(1) : 0}% of budget
                </p>
              </Card>

              <Card className={`p-4 border-l-4 ${variance >= 0 ? 'border-l-success' : 'border-l-destructive'}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Variance</p>
                  {variance >= 0 ? (
                    <TrendUp size={20} className="text-success" />
                  ) : (
                    <TrendDown size={20} className="text-destructive" />
                  )}
                </div>
                <p className="text-2xl font-semibold">{formatCurrency(Math.abs(variance))}</p>
                <Badge className={variance >= 0 ? "bg-success text-success-foreground mt-2" : "bg-destructive text-destructive-foreground mt-2"}>
                  {variance >= 0 ? 'Under Budget' : 'Over Budget'}
                </Badge>
              </Card>

              <Card className="p-4 border-l-4 border-l-secondary">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Budget Efficiency</p>
                  <Calendar size={20} className="text-secondary" />
                </div>
                <p className="text-2xl font-semibold">{Math.abs(variancePercentage).toFixed(1)}%</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs text-muted-foreground">
                    {variance >= 0 ? 'Savings' : 'Overspend'}
                  </span>
                </div>
              </Card>
            </div>

            {!selectedCostCenterId && viewMode === 'summary' && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">All Cost Centers Overview</h3>
                <div className="space-y-3">
                  {allCostCentersData.slice(0, 10).map((cc) => (
                    <div key={cc.id} className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{cc.code}</Badge>
                          <div>
                            <p className="font-medium">{cc.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {cc.type} • {cc.department?.replace(/-/g, ' ')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(cc.actualAmount)}</p>
                        <p className="text-xs text-muted-foreground">of {formatCurrency(cc.budgetedAmount)}</p>
                      </div>
                      <div className="ml-4 text-right min-w-[100px]">
                        <Badge className={cc.status === 'under-budget' ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>
                          {cc.variance >= 0 ? '+' : ''}{formatCurrency(cc.variance)}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {cc.variancePercentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
                <TabsTrigger value="breakdown">Category Analysis</TabsTrigger>
                <TabsTrigger value="comparison">Budget Comparison</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Budget vs Actual (Monthly)</h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <ComposedChart data={monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        <Legend />
                        <Bar dataKey="budgeted" fill={CHART_COLORS[1]} name="Budgeted" opacity={0.6} />
                        <Line type="monotone" dataKey="actual" stroke={CHART_COLORS[0]} name="Actual" strokeWidth={3} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Card>

                  {selectedCostCenter && (
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Cost Center Details</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Code</p>
                            <p className="font-medium">{selectedCostCenter.code}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Type</p>
                            <Badge>{selectedCostCenter.type}</Badge>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Department</p>
                            <p className="font-medium capitalize">{selectedCostCenter.department?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Manager</p>
                            <p className="font-medium">{selectedCostCenter.managerName || 'Not Assigned'}</p>
                          </div>
                          {selectedCostCenter.allocationBasis && (
                            <div>
                              <p className="text-sm text-muted-foreground">Allocation Basis</p>
                              <p className="font-medium capitalize">{selectedCostCenter.allocationBasis}</p>
                            </div>
                          )}
                          {selectedCostCenter.allocationPercentage && (
                            <div>
                              <p className="text-sm text-muted-foreground">Allocation %</p>
                              <p className="font-medium">{selectedCostCenter.allocationPercentage}%</p>
                            </div>
                          )}
                        </div>
                        <Separator />
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Description</p>
                          <p className="text-sm">{selectedCostCenter.description || 'No description available'}</p>
                        </div>
                      </div>
                    </Card>
                  )}

                  {!selectedCostCenter && (
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Department Distribution</h3>
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={departmentBreakdown}
                            dataKey="amount"
                            nameKey="department"
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            label={(entry) => `${entry.department}: ${entry.percentage.toFixed(1)}%`}
                          >
                            {departmentBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="trends" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Variance Trend Analysis</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Area type="monotone" dataKey="budgeted" fill={CHART_COLORS[4]} stroke={CHART_COLORS[4]} fillOpacity={0.3} name="Budget" />
                      <Bar dataKey="actual" fill={CHART_COLORS[0]} name="Actual Spend" />
                      <Line type="monotone" dataKey="variance" stroke={CHART_COLORS[3]} strokeWidth={2} name="Variance" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {monthlyTrend.slice(-3).map((month) => (
                    <Card key={month.month} className="p-4">
                      <p className="text-sm text-muted-foreground mb-2">{month.month}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Budgeted:</span>
                          <span className="font-medium text-sm">{formatCurrency(month.budgeted)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Actual:</span>
                          <span className="font-medium text-sm">{formatCurrency(month.actual)}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold">Variance:</span>
                          <span className={`font-semibold text-sm ${month.variance >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {formatCurrency(month.variance)}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="breakdown" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Expense by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={expensesByCategory}
                          dataKey="actual"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry) => `${entry.category}: ${entry.percentage.toFixed(1)}%`}
                        >
                          {expensesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Top Expense Categories</h3>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {expensesByCategory
                          .sort((a, b) => b.actual - a.actual)
                          .map((cat, index) => (
                            <div key={cat.category} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground font-semibold text-sm shrink-0">
                                  {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium capitalize truncate">{cat.category.replace(/-/g, ' ')}</p>
                                  <p className="text-xs text-muted-foreground">{cat.percentage.toFixed(1)}% of total</p>
                                </div>
                              </div>
                              <div className="text-right ml-3">
                                <p className="font-semibold">{formatCurrency(cat.actual)}</p>
                                {cat.variance !== 0 && (
                                  <p className={`text-xs ${cat.variance >= 0 ? 'text-success' : 'text-destructive'}`}>
                                    {cat.variance >= 0 ? '+' : ''}{formatCurrency(cat.variance)}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </Card>
                </div>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Category Budget vs Actual Comparison</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={expensesByCategory} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" width={150} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Bar dataKey="budgeted" fill={CHART_COLORS[4]} name="Budgeted" opacity={0.7} />
                      <Bar dataKey="actual" fill={CHART_COLORS[0]} name="Actual" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </TabsContent>

              <TabsContent value="comparison" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Detailed Budget vs Actual Comparison</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Category</th>
                          <th className="text-right py-3 px-4">Budgeted</th>
                          <th className="text-right py-3 px-4">Actual</th>
                          <th className="text-right py-3 px-4">Variance</th>
                          <th className="text-right py-3 px-4">% Variance</th>
                          <th className="text-center py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expensesByCategory.map((cat) => (
                          <tr key={cat.category} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">
                              <p className="font-medium capitalize">{cat.category.replace(/-/g, ' ')}</p>
                            </td>
                            <td className="text-right py-3 px-4">{formatCurrency(cat.budgeted)}</td>
                            <td className="text-right py-3 px-4">{formatCurrency(cat.actual)}</td>
                            <td className={`text-right py-3 px-4 font-semibold ${cat.variance >= 0 ? 'text-success' : 'text-destructive'}`}>
                              {cat.variance >= 0 ? '+' : ''}{formatCurrency(cat.variance)}
                            </td>
                            <td className={`text-right py-3 px-4 ${cat.variance >= 0 ? 'text-success' : 'text-destructive'}`}>
                              {cat.variancePercentage.toFixed(1)}%
                            </td>
                            <td className="text-center py-3 px-4">
                              {cat.variance >= 0 ? (
                                <Badge className="bg-success text-success-foreground">
                                  <TrendUp size={14} className="mr-1" />
                                  Under
                                </Badge>
                              ) : (
                                <Badge className="bg-destructive text-destructive-foreground">
                                  <TrendDown size={14} className="mr-1" />
                                  Over
                                </Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-muted font-semibold">
                        <tr>
                          <td className="py-3 px-4">TOTAL</td>
                          <td className="text-right py-3 px-4">{formatCurrency(totalBudget)}</td>
                          <td className="text-right py-3 px-4">{formatCurrency(totalActual)}</td>
                          <td className={`text-right py-3 px-4 ${variance >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
                          </td>
                          <td className={`text-right py-3 px-4 ${variance >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {variancePercentage.toFixed(1)}%
                          </td>
                          <td className="text-center py-3 px-4">
                            {variance >= 0 ? (
                              <Badge className="bg-success text-success-foreground">Under Budget</Badge>
                            ) : (
                              <Badge className="bg-destructive text-destructive-foreground">Over Budget</Badge>
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </Card>

                {expensesByCategory.some(cat => cat.variance < 0) && (
                  <Card className="p-6 border-l-4 border-l-destructive bg-destructive/5">
                    <div className="flex items-start gap-3">
                      <Warning size={24} className="text-destructive shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-destructive mb-2">Budget Overruns Detected</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          The following categories have exceeded their budget allocations:
                        </p>
                        <div className="space-y-2">
                          {expensesByCategory
                            .filter(cat => cat.variance < 0)
                            .sort((a, b) => a.variance - b.variance)
                            .map(cat => (
                              <div key={cat.category} className="flex items-center justify-between text-sm bg-background/50 p-2 rounded">
                                <span className="capitalize font-medium">{cat.category.replace(/-/g, ' ')}</span>
                                <span className="text-destructive font-semibold">
                                  {formatCurrency(Math.abs(cat.variance))} over ({Math.abs(cat.variancePercentage).toFixed(1)}%)
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
