import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, TrendUp, TrendDown } from '@phosphor-icons/react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { type CostCenter, type Expense, type Budget, type CostCenterReport } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/helpers'

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

  const totalActual = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const totalBudget = selectedCostCenter?.budget || budgets.find(b => b.department === selectedCostCenter?.department)?.totalBudget || 0
  const variance = totalBudget - totalActual
  const variancePercentage = totalBudget > 0 ? (variance / totalBudget) * 100 : 0

  const expensesByCategory = useMemo(() => {
    const categoryMap: Record<string, number> = {}
    filteredExpenses.forEach(exp => {
      categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount
    })
    return Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalActual > 0 ? (amount / totalActual) * 100 : 0
    }))
  }, [filteredExpenses, totalActual])

  const monthlyTrend = useMemo(() => {
    const months: Record<string, { actual: number }> = {}
    filteredExpenses.forEach(exp => {
      const date = new Date(exp.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!months[monthKey]) {
        months[monthKey] = { actual: 0 }
      }
      months[monthKey].actual += exp.amount
    })
    return Object.entries(months).map(([month, data]) => ({
      month,
      ...data
    })).sort((a, b) => a.month.localeCompare(b.month))
  }, [filteredExpenses])

  const exportReport = () => {
    console.log('Exporting cost center report...')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Cost Center Performance Report</DialogTitle>
            <Button onClick={exportReport} size="sm" variant="outline">
              <Download size={16} className="mr-2" />
              Export PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="dialog-content-wrapper">
          <div className="dialog-body-scrollable">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4 border-l-4 border-l-primary">
                <p className="text-sm text-muted-foreground mb-1">Budgeted Amount</p>
                <p className="text-2xl font-semibold">{formatCurrency(totalBudget)}</p>
              </Card>

              <Card className="p-4 border-l-4 border-l-accent">
                <p className="text-sm text-muted-foreground mb-1">Actual Spent</p>
                <p className="text-2xl font-semibold">{formatCurrency(totalActual)}</p>
              </Card>

              <Card className="p-4 border-l-4 border-l-success">
                <p className="text-sm text-muted-foreground mb-1">Variance</p>
                <p className="text-2xl font-semibold">{formatCurrency(Math.abs(variance))}</p>
                <div className="flex items-center gap-1 mt-1">
                  {variance >= 0 ? (
                    <Badge className="bg-success text-success-foreground">Under Budget</Badge>
                  ) : (
                    <Badge className="bg-destructive text-destructive-foreground">Over Budget</Badge>
                  )}
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-secondary">
                <p className="text-sm text-muted-foreground mb-1">Efficiency</p>
                <p className="text-2xl font-semibold">{Math.abs(variancePercentage).toFixed(1)}%</p>
                <div className="flex items-center gap-1 mt-1">
                  {variance >= 0 ? (
                    <TrendUp size={16} className="text-success" />
                  ) : (
                    <TrendDown size={16} className="text-destructive" />
                  )}
                  <span className="text-xs text-muted-foreground">vs Budget</span>
                </div>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="breakdown">Category Breakdown</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Monthly Spending Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Line type="monotone" dataKey="actual" stroke={CHART_COLORS[0]} name="Actual Spend" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                {selectedCostCenter && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Cost Center Details</h3>
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
                        <p className="font-medium">{selectedCostCenter.department?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Manager</p>
                        <p className="font-medium">{selectedCostCenter.managerName || 'Not Assigned'}</p>
                      </div>
                      {selectedCostCenter.allocationBasis && (
                        <div>
                          <p className="text-sm text-muted-foreground">Allocation Basis</p>
                          <p className="font-medium">{selectedCostCenter.allocationBasis}</p>
                        </div>
                      )}
                      {selectedCostCenter.allocationPercentage && (
                        <div>
                          <p className="text-sm text-muted-foreground">Allocation %</p>
                          <p className="font-medium">{selectedCostCenter.allocationPercentage}%</p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="trends" className="space-y-4">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Spending Trend Analysis</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Bar dataKey="actual" fill={CHART_COLORS[0]} name="Actual Spend" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </TabsContent>

              <TabsContent value="breakdown" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Expense by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={expensesByCategory}
                          dataKey="amount"
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
                    <div className="space-y-3">
                      {expensesByCategory
                        .sort((a, b) => b.amount - a.amount)
                        .slice(0, 5)
                        .map((cat, index) => (
                          <div key={cat.category} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground font-semibold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium capitalize">{cat.category.replace(/-/g, ' ')}</p>
                                <p className="text-xs text-muted-foreground">{cat.percentage.toFixed(1)}% of total</p>
                              </div>
                            </div>
                            <p className="font-semibold">{formatCurrency(cat.amount)}</p>
                          </div>
                        ))}
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
