import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, TrendUp, TrendDown, ArrowUp, ArrowDown } from '@phosphor-icons/react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Area } from 'recharts'
import { type ProfitCenter, type CostCenter, type Expense, type ProfitCenterReport } from '@/lib/types'
import { formatCurrency } from '@/lib/helpers'

interface ProfitCenterReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profitCenters: ProfitCenter[]
  costCenters: CostCenter[]
  expenses: Expense[]
  profitCenterReports?: ProfitCenterReport[]
}

const CHART_COLORS = ['oklch(0.65 0.22 265)', 'oklch(0.55 0.16 220)', 'oklch(0.60 0.18 155)', 'oklch(0.68 0.24 35)', 'oklch(0.62 0.20 310)']

export function ProfitCenterReportDialog({
  open,
  onOpenChange,
  profitCenters,
  costCenters,
  expenses,
  profitCenterReports = []
}: ProfitCenterReportDialogProps) {
  const [selectedProfitCenterId, setSelectedProfitCenterId] = useState<string>('')
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

  const selectedProfitCenter = profitCenters.find(pc => pc.id === selectedProfitCenterId)

  const profitCenterCosts = useMemo(() => {
    if (!selectedProfitCenter) return 0
    
    const relevantCostCenters = costCenters.filter(cc => 
      selectedProfitCenter.costCenterIds.includes(cc.id)
    )
    
    const departmentExpenses = expenses.filter(exp => 
      exp.date >= startDate && 
      exp.date <= now &&
      relevantCostCenters.some(cc => cc.department === exp.department)
    )
    
    return departmentExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  }, [selectedProfitCenter, costCenters, expenses, startDate, now])

  const revenue = selectedProfitCenter?.actualRevenue || selectedProfitCenter?.targetRevenue || 0
  const costs = profitCenterCosts
  const profit = revenue - costs
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0

  const targetRevenue = selectedProfitCenter?.targetRevenue || 0
  const targetProfit = selectedProfitCenter?.targetProfit || 0
  const targetMargin = selectedProfitCenter?.targetMargin || 0

  const revenueVariance = revenue - targetRevenue
  const profitVariance = profit - targetProfit
  const marginVariance = margin - targetMargin

  const profitCenterComparison = useMemo(() => {
    return profitCenters.map(pc => {
      const pcCostCenters = costCenters.filter(cc => pc.costCenterIds.includes(cc.id))
      const pcExpenses = expenses.filter(exp => 
        exp.date >= startDate && 
        exp.date <= now &&
        pcCostCenters.some(cc => cc.department === exp.department)
      )
      const pcCosts = pcExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      const pcRevenue = pc.actualRevenue || pc.targetRevenue || 0
      const pcProfit = pcRevenue - pcCosts
      const pcMargin = pcRevenue > 0 ? (pcProfit / pcRevenue) * 100 : 0
      
      return {
        name: pc.code,
        fullName: pc.name,
        revenue: pcRevenue,
        costs: pcCosts,
        profit: pcProfit,
        margin: pcMargin
      }
    }).sort((a, b) => b.profit - a.profit)
  }, [profitCenters, costCenters, expenses, startDate, now])

  const monthlyTrend = useMemo(() => {
    const months: Record<string, { revenue: number; costs: number }> = {}
    
    if (selectedProfitCenter) {
      const relevantCostCenters = costCenters.filter(cc => 
        selectedProfitCenter.costCenterIds.includes(cc.id)
      )
      
      expenses
        .filter(exp => 
          exp.date >= startDate && 
          exp.date <= now &&
          relevantCostCenters.some(cc => cc.department === exp.department)
        )
        .forEach(exp => {
          const date = new Date(exp.date)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          if (!months[monthKey]) {
            months[monthKey] = { revenue: 0, costs: 0 }
          }
          months[monthKey].costs += exp.amount
        })
    }

    return Object.entries(months).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      costs: data.costs,
      profit: data.revenue - data.costs,
      margin: data.revenue > 0 ? ((data.revenue - data.costs) / data.revenue) * 100 : 0
    })).sort((a, b) => a.month.localeCompare(b.month))
  }, [selectedProfitCenter, costCenters, expenses, startDate, now])

  const getPerformanceRating = (actualMargin: number, targetMargin: number): string => {
    const diff = actualMargin - targetMargin
    if (diff >= 10) return 'excellent'
    if (diff >= 5) return 'good'
    if (diff >= 0) return 'average'
    if (diff >= -5) return 'below-average'
    return 'poor'
  }

  const performanceRating = getPerformanceRating(margin, targetMargin)

  const exportReport = () => {
    console.log('Exporting profit center report...')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Profit Center Performance Report</DialogTitle>
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
                <Label>Profit Center</Label>
                <Select value={selectedProfitCenterId} onValueChange={setSelectedProfitCenterId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Profit Center" />
                  </SelectTrigger>
                  <SelectContent>
                    {profitCenters.map((pc) => (
                      <SelectItem key={pc.id} value={pc.id}>
                        {pc.code} - {pc.name}
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

            {selectedProfitCenter ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card className="p-4 border-l-4 border-l-primary">
                    <p className="text-sm text-muted-foreground mb-1">Revenue</p>
                    <p className="text-2xl font-semibold">{formatCurrency(revenue)}</p>
                    {targetRevenue > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        {revenueVariance >= 0 ? (
                          <ArrowUp size={14} className="text-success" />
                        ) : (
                          <ArrowDown size={14} className="text-destructive" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(Math.abs(revenueVariance))} vs target
                        </span>
                      </div>
                    )}
                  </Card>

                  <Card className="p-4 border-l-4 border-l-accent">
                    <p className="text-sm text-muted-foreground mb-1">Total Costs</p>
                    <p className="text-2xl font-semibold">{formatCurrency(costs)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedProfitCenter.costCenterIds.length} cost centers
                    </p>
                  </Card>

                  <Card className="p-4 border-l-4 border-l-success">
                    <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
                    <p className="text-2xl font-semibold">{formatCurrency(profit)}</p>
                    {targetProfit > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        {profitVariance >= 0 ? (
                          <ArrowUp size={14} className="text-success" />
                        ) : (
                          <ArrowDown size={14} className="text-destructive" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(Math.abs(profitVariance))} vs target
                        </span>
                      </div>
                    )}
                  </Card>

                  <Card className="p-4 border-l-4 border-l-secondary">
                    <p className="text-sm text-muted-foreground mb-1">Profit Margin</p>
                    <p className="text-2xl font-semibold">{margin.toFixed(1)}%</p>
                    {targetMargin > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        {marginVariance >= 0 ? (
                          <TrendUp size={14} className="text-success" />
                        ) : (
                          <TrendDown size={14} className="text-destructive" />
                        )}
                        <span className="text-xs text-muted-foreground">
                          {Math.abs(marginVariance).toFixed(1)}% vs target
                        </span>
                      </div>
                    )}
                  </Card>
                </div>

                <Card className="p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedProfitCenter.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedProfitCenter.code}</p>
                    </div>
                    <Badge className={
                      performanceRating === 'excellent' ? 'bg-green-600' :
                      performanceRating === 'good' ? 'bg-green-500' :
                      performanceRating === 'average' ? 'bg-yellow-500' :
                      performanceRating === 'below-average' ? 'bg-orange-500' :
                      'bg-red-500'
                    }>
                      {performanceRating.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Manager</p>
                      <p className="text-sm font-medium">{selectedProfitCenter.managerName || 'Not Assigned'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Department</p>
                      <p className="text-sm font-medium">{selectedProfitCenter.department?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge variant={selectedProfitCenter.status === 'active' ? 'default' : 'secondary'}>
                        {selectedProfitCenter.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cost Centers</p>
                      <p className="text-sm font-medium">{selectedProfitCenter.costCenterIds.length}</p>
                    </div>
                  </div>
                </Card>

                <Tabs defaultValue="performance" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="comparison">Comparison</TabsTrigger>
                    <TabsTrigger value="costs">Cost Breakdown</TabsTrigger>
                  </TabsList>

                  <TabsContent value="performance" className="space-y-4">
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Revenue vs Profit Trend</h3>
                      <ResponsiveContainer width="100%" height={350}>
                        <ComposedChart data={monthlyTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Legend />
                          <Bar yAxisId="left" dataKey="revenue" fill={CHART_COLORS[0]} name="Revenue" />
                          <Bar yAxisId="left" dataKey="costs" fill={CHART_COLORS[1]} name="Costs" />
                          <Line yAxisId="right" type="monotone" dataKey="margin" stroke={CHART_COLORS[2]} name="Margin %" strokeWidth={2} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Target vs Actual</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm">Revenue</span>
                              <span className="text-sm font-medium">{formatCurrency(revenue)} / {formatCurrency(targetRevenue)}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${Math.min((revenue / (targetRevenue || 1)) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm">Profit</span>
                              <span className="text-sm font-medium">{formatCurrency(profit)} / {formatCurrency(targetProfit)}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-success h-2 rounded-full" 
                                style={{ width: `${Math.min((profit / (targetProfit || 1)) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm">Margin</span>
                              <span className="text-sm font-medium">{margin.toFixed(1)}% / {targetMargin.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-accent h-2 rounded-full" 
                                style={{ width: `${Math.min((margin / (targetMargin || 1)) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
                        <div className="space-y-3">
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium">Revenue Performance</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {revenueVariance >= 0 
                                ? `Exceeding target by ${formatCurrency(revenueVariance)}` 
                                : `Below target by ${formatCurrency(Math.abs(revenueVariance))}`}
                            </p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium">Profitability</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {profitVariance >= 0 
                                ? `Achieving ${formatCurrency(profitVariance)} above profit target` 
                                : `Need to improve profit by ${formatCurrency(Math.abs(profitVariance))}`}
                            </p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium">Efficiency</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Operating at {margin.toFixed(1)}% margin
                              {marginVariance >= 0 ? ' (Above target)' : ' (Below target)'}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="comparison" className="space-y-4">
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Profit Center Comparison</h3>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={profitCenterComparison} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={80} />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Legend />
                          <Bar dataKey="revenue" fill={CHART_COLORS[0]} name="Revenue" />
                          <Bar dataKey="profit" fill={CHART_COLORS[2]} name="Profit" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>

                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Performance Ranking</h3>
                      <div className="space-y-2">
                        {profitCenterComparison.map((pc, index) => (
                          <div key={pc.name} className={`flex items-center justify-between p-3 rounded-lg ${pc.name === selectedProfitCenter?.code ? 'bg-primary/10 border border-primary' : 'bg-muted'}`}>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-primary-foreground font-semibold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{pc.name}</p>
                                <p className="text-xs text-muted-foreground">{pc.fullName}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(pc.profit)}</p>
                              <p className="text-xs text-muted-foreground">{pc.margin.toFixed(1)}% margin</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="costs" className="space-y-4">
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Associated Cost Centers</h3>
                      <div className="space-y-3">
                        {costCenters
                          .filter(cc => selectedProfitCenter.costCenterIds.includes(cc.id))
                          .map((cc) => (
                            <div key={cc.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div>
                                <p className="font-medium">{cc.code} - {cc.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline">{cc.type}</Badge>
                                  {cc.department && (
                                    <span className="text-xs text-muted-foreground">
                                      {cc.department.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">{formatCurrency(cc.actualCost || 0)}</p>
                                <p className="text-xs text-muted-foreground">Actual Cost</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">Please select a profit center to view the report</p>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
