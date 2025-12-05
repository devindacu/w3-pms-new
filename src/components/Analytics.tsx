import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  ChartBar,
  FileText,
  TrendUp,
  TrendDown,
  CurrencyDollar,
  Package,
  ChefHat,
  Receipt,
  CalendarBlank,
  Download,
  Printer,
  FunnelSimple,
  ArrowsClockwise,
  X,
  ArrowsLeftRight,
  Plus,
  Trash
} from '@phosphor-icons/react'
import { formatCurrency, formatPercent } from '@/lib/helpers'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  generateOrderSummary,
  generateSupplierPriceComparison,
  generateDepartmentConsumption,
  generateGRNVariance,
  generateExpiryForecast,
  generateCostPerDepartment,
  generateFoodCostPercentage,
  generatePurchaseTrends,
  generateBudgetUtilization,
  generateIngredientUsage,
  generateDishProfitability,
  generateMenuPerformance,
  type OrderSummaryReport,
  type SupplierPriceComparison,
  type DepartmentConsumption,
  type GRNVarianceReport,
  type ExpiryForecast,
  type CostPerDepartment,
  type FoodCostReport,
  type PurchaseTrend,
  type BudgetUtilization,
  type IngredientUsage,
  type DishProfitability,
  type MenuPerformance
} from '@/lib/reportHelpers'
import type {
  Order,
  FoodItem,
  Supplier,
  GoodsReceivedNote,
  Recipe,
  Menu,
  KitchenConsumptionLog,
  PurchaseOrder
} from '@/lib/types'
import { AdvancedFilterDialog, type AdvancedFilter, type FilterField } from '@/components/AdvancedFilterDialog'
import { PercentageChangeIndicator, PercentageChangeBadge } from '@/components/PercentageChangeIndicator'

interface AnalyticsProps {
  orders: Order[]
  foodItems: FoodItem[]
  suppliers: Supplier[]
  grns: GoodsReceivedNote[]
  recipes: Recipe[]
  menus: Menu[]
  consumptionLogs: KitchenConsumptionLog[]
  purchaseOrders: PurchaseOrder[]
}

type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
type ReportCategory = 'operational' | 'financial' | 'kitchen'

interface ComparisonPeriod {
  id: string
  label: string
  startDate: string
  endDate: string
  color: string
}

export function Analytics({
  orders,
  foodItems,
  suppliers,
  grns,
  recipes,
  menus,
  consumptionLogs,
  purchaseOrders
}: AnalyticsProps) {
  const [period, setPeriod] = useState<ReportPeriod>('monthly')
  const [category, setCategory] = useState<ReportCategory>('operational')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [activeFilter, setActiveFilter] = useState<AdvancedFilter | null>(null)
  const [savedFilters, setSavedFilters] = useKV<AdvancedFilter[]>('analytics-saved-filters', [])
  const [comparisonMode, setComparisonMode] = useState(false)
  const [comparisonPeriods, setComparisonPeriods] = useState<ComparisonPeriod[]>([])
  
  const comparisonColors = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
    'var(--primary)',
    'var(--accent)',
    'var(--success)'
  ]

  const handleAddComparisonPeriod = () => {
    const newPeriod: ComparisonPeriod = {
      id: `period-${Date.now()}`,
      label: `Period ${comparisonPeriods.length + 1}`,
      startDate: '',
      endDate: '',
      color: comparisonColors[comparisonPeriods.length % comparisonColors.length]
    }
    setComparisonPeriods((current) => [...current, newPeriod])
    toast.success('Comparison period added')
  }

  const handleRemoveComparisonPeriod = (id: string) => {
    setComparisonPeriods((current) => current.filter(p => p.id !== id))
    toast.success('Comparison period removed')
  }

  const handleUpdateComparisonPeriod = (id: string, field: keyof ComparisonPeriod, value: string) => {
    setComparisonPeriods((current) =>
      current.map(p => p.id === id ? { ...p, [field]: value } : p)
    )
  }

  const toggleComparisonMode = () => {
    setComparisonMode(!comparisonMode)
    if (!comparisonMode && comparisonPeriods.length === 0) {
      handleAddComparisonPeriod()
      handleAddComparisonPeriod()
    }
  }

  const filterFields: FilterField[] = useMemo(() => {
    const supplierOptions = suppliers.map(s => ({ value: s.id, label: s.name }))
    const categoryOptions = Array.from(new Set(foodItems.map(f => f.category))).map(c => ({ value: c, label: c }))
    const statusOptions = [
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'received', label: 'Received' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' }
    ]

    return [
      { id: 'orderDate', label: 'Order Date', type: 'date' },
      { id: 'orderAmount', label: 'Order Amount', type: 'currency' },
      { id: 'supplier', label: 'Supplier', type: 'select', options: supplierOptions },
      { id: 'category', label: 'Category', type: 'multiselect', options: categoryOptions },
      { id: 'status', label: 'Status', type: 'select', options: statusOptions },
      { id: 'itemName', label: 'Item Name', type: 'text' },
      { id: 'quantity', label: 'Quantity', type: 'number' },
      { id: 'unitPrice', label: 'Unit Price', type: 'currency' },
      { id: 'totalCost', label: 'Total Cost', type: 'currency' },
      { id: 'poNumber', label: 'PO Number', type: 'text' },
      { id: 'grnNumber', label: 'GRN Number', type: 'text' },
      { id: 'expiryDate', label: 'Expiry Date', type: 'date' },
      { id: 'stockLevel', label: 'Stock Level', type: 'number' },
      { id: 'variance', label: 'Variance %', type: 'number' }
    ]
  }, [suppliers, foodItems])

  const handleApplyFilter = (filter: AdvancedFilter) => {
    setActiveFilter(filter)
    toast.success(`Filter "${filter.name}" applied`)
  }

  const handleSaveFilter = (filter: AdvancedFilter) => {
    setSavedFilters((current) => [...(current || []), filter])
    toast.success(`Filter "${filter.name}" saved`)
  }

  const handleDeleteFilter = (filterId: string) => {
    setSavedFilters((current) => (current || []).filter(f => f.id !== filterId))
    toast.success('Filter deleted')
  }

  const handleClearFilter = () => {
    setActiveFilter(null)
    toast.success('Filter cleared')
  }

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    toast.success(`Exporting report as ${format.toUpperCase()}`)
  }

  const handlePrint = () => {
    window.print()
  }

  const renderOperationalReports = () => {
    const orderSummary = generateOrderSummary(orders, period)
    const supplierComparison = generateSupplierPriceComparison(foodItems, suppliers, purchaseOrders)
    const deptConsumption = generateDepartmentConsumption(consumptionLogs, foodItems)
    const grnVariance = generateGRNVariance(grns, purchaseOrders)
    const expiryForecast = generateExpiryForecast(foodItems)

    const getPreviousPeriodData = () => {
      const now = Date.now()
      const currentPeriod = orderSummary.breakdown
      
      if (currentPeriod.length < 2) return null
      
      const lastPeriod = currentPeriod[currentPeriod.length - 1]
      const previousPeriod = currentPeriod[currentPeriod.length - 2]
      
      return {
        current: {
          orders: lastPeriod?.orderCount || 0,
          revenue: lastPeriod?.revenue || 0,
          avgValue: lastPeriod?.averageValue || 0
        },
        previous: {
          orders: previousPeriod?.orderCount || 0,
          revenue: previousPeriod?.revenue || 0,
          avgValue: previousPeriod?.averageValue || 0
        }
      }
    }

    const periodComparison = getPreviousPeriodData()

    const getComparisonData = () => {
      if (!comparisonMode || comparisonPeriods.length === 0) return null
      
      return comparisonPeriods
        .filter(p => p.startDate && p.endDate)
        .map(period => ({
          period,
          data: generateOrderSummary(orders, 'custom').breakdown
        }))
    }

    const comparisonData = getComparisonData()

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Order Summary Report</h3>
              <p className="text-sm text-muted-foreground">
                {comparisonMode && comparisonData && comparisonData.length > 0
                  ? `Comparing ${comparisonData.length} time periods`
                  : `${period.charAt(0).toUpperCase() + period.slice(1)} overview of orders`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleExport('csv')}>
                <Download size={16} className="mr-2" />
                Export
              </Button>
              <Button size="sm" variant="outline" onClick={handlePrint}>
                <Printer size={16} className="mr-2" />
                Print
              </Button>
            </div>
          </div>

          {!comparisonMode ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4 bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Total Orders</div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-semibold">{orderSummary.totalOrders}</div>
                    {periodComparison && (
                      <PercentageChangeIndicator
                        current={periodComparison.current.orders}
                        previous={periodComparison.previous.orders}
                        size="sm"
                      />
                    )}
                  </div>
                </Card>
                <Card className="p-4 bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Total Revenue</div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-semibold">{formatCurrency(orderSummary.totalRevenue)}</div>
                    {periodComparison && (
                      <PercentageChangeIndicator
                        current={periodComparison.current.revenue}
                        previous={periodComparison.previous.revenue}
                        size="sm"
                      />
                    )}
                  </div>
                </Card>
                <Card className="p-4 bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Avg Order Value</div>
                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-semibold">{formatCurrency(orderSummary.averageOrderValue)}</div>
                    {periodComparison && (
                      <PercentageChangeIndicator
                        current={periodComparison.current.avgValue}
                        previous={periodComparison.previous.avgValue}
                        size="sm"
                      />
                    )}
                  </div>
                </Card>
                <Card className="p-4 bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Items Sold</div>
                  <div className="text-2xl font-semibold">{orderSummary.totalItemsSold}</div>
                </Card>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium mb-4">Order Trends Over Time</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={orderSummary.breakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="period" stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        border: '1px solid var(--border)',
                        borderRadius: '6px'
                      }}
                      formatter={(value: any) => typeof value === 'number' ? formatCurrency(value) : value}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="var(--primary)" 
                      fill="var(--primary)" 
                      fillOpacity={0.3}
                      name="Revenue"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="orderCount" 
                      stroke="var(--accent)" 
                      fill="var(--accent)" 
                      fillOpacity={0.3}
                      name="Orders"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : comparisonData && comparisonData.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {comparisonData.map((comp) => (
                  <Card key={comp.period.id} className="p-4" style={{ borderLeft: `4px solid ${comp.period.color}` }}>
                    <div className="text-sm font-medium mb-3" style={{ color: comp.period.color }}>
                      {comp.period.label}
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Orders:</span>
                        <span className="font-medium">
                          {comp.data.reduce((sum, d) => sum + (d.orderCount || 0), 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Revenue:</span>
                        <span className="font-medium">
                          {formatCurrency(comp.data.reduce((sum, d) => sum + (d.revenue || 0), 0))}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium mb-4">Revenue Comparison Across Periods</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={orderSummary.breakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="period" stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        border: '1px solid var(--border)',
                        borderRadius: '6px'
                      }}
                      formatter={(value: any) => formatCurrency(value)}
                    />
                    <Legend />
                    {comparisonData.map((comp, idx) => (
                      <Bar
                        key={comp.period.id}
                        dataKey={`revenue_${idx}`}
                        fill={comp.period.color}
                        name={comp.period.label}
                        radius={[8, 8, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium mb-4">Order Count Comparison</h4>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={orderSummary.breakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="period" stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--card)', 
                        border: '1px solid var(--border)',
                        borderRadius: '6px'
                      }}
                    />
                    <Legend />
                    {comparisonData.map((comp) => (
                      <Line
                        key={comp.period.id}
                        type="monotone"
                        dataKey={`orders_${comp.period.id}`}
                        stroke={comp.period.color}
                        strokeWidth={3}
                        dot={{ fill: comp.period.color, r: 5 }}
                        name={comp.period.label}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ArrowsLeftRight size={48} className="mx-auto mb-4 opacity-50" />
              <p>Configure comparison periods to view data</p>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Avg Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderSummary.breakdown.map((item) => (
                <TableRow key={item.period}>
                  <TableCell>{item.period}</TableCell>
                  <TableCell className="text-right font-medium">{item.orderCount}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.revenue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.averageValue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Supplier Price Comparison</h3>
              <p className="text-sm text-muted-foreground">Compare prices across suppliers for common items</p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Unit</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplierComparison.map((item) => (
                <TableRow key={item.itemId}>
                  <TableCell className="font-medium">{item.itemName}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.supplierName}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.price)}</TableCell>
                  <TableCell className="text-right">{item.unit}</TableCell>
                  <TableCell>
                    {item.isBestPrice ? (
                      <Badge variant="default">Best Price</Badge>
                    ) : (
                      <span className="text-muted-foreground">
                        +{formatPercent(item.priceVariance / 100)}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Department Consumption Report</h3>
              <p className="text-sm text-muted-foreground">Track ingredient usage by department</p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium mb-4">Cost Distribution by Department</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptConsumption}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="department" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '6px'
                  }}
                  formatter={(value: any) => typeof value === 'number' ? formatCurrency(value) : value}
                />
                <Legend />
                <Bar dataKey="estimatedCost" fill="var(--primary)" name="Cost (LKR)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Items Used</TableHead>
                <TableHead className="text-right">Total Quantity</TableHead>
                <TableHead className="text-right">Estimated Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deptConsumption.map((dept) => (
                <TableRow key={dept.department}>
                  <TableCell className="font-medium">{dept.department}</TableCell>
                  <TableCell className="text-right">{dept.itemsUsed}</TableCell>
                  <TableCell className="text-right">{dept.totalQuantity.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(dept.estimatedCost)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">GRN Variance Report</h3>
              <p className="text-sm text-muted-foreground">Compare ordered vs received quantities</p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>GRN #</TableHead>
                <TableHead>PO #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Ordered Qty</TableHead>
                <TableHead className="text-right">Received Qty</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grnVariance.map((grn) => (
                <TableRow key={grn.grnId}>
                  <TableCell className="font-medium">{grn.grnNumber}</TableCell>
                  <TableCell>{grn.poNumber}</TableCell>
                  <TableCell>{grn.supplierName}</TableCell>
                  <TableCell className="text-right">{grn.orderedQty.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{grn.receivedQty.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <span className={grn.variance < 0 ? 'text-destructive' : grn.variance > 0 ? 'text-success' : ''}>
                      {grn.variance > 0 ? '+' : ''}{grn.variance.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {grn.variancePercentage > 5 ? (
                      <Badge variant="destructive">High Variance</Badge>
                    ) : grn.variancePercentage > 0 ? (
                      <Badge variant="outline">Minor Variance</Badge>
                    ) : (
                      <Badge variant="default">Match</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Expiry Forecast Report</h3>
              <p className="text-sm text-muted-foreground">Items expiring in the next 30 days</p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Batch #</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Days Left</TableHead>
                <TableHead>Urgency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expiryForecast.map((item, idx) => (
                <TableRow key={`${item.itemId}-${idx}`}>
                  <TableCell className="font-medium">{item.itemName}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.batchNumber || 'N/A'}</TableCell>
                  <TableCell>{item.currentStock} {item.unit}</TableCell>
                  <TableCell>{new Date(item.expiryDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">{item.daysUntilExpiry}</TableCell>
                  <TableCell>
                    {item.urgency === 'critical' ? (
                      <Badge variant="destructive">Critical</Badge>
                    ) : item.urgency === 'high' ? (
                      <Badge className="bg-orange-500">High</Badge>
                    ) : (
                      <Badge variant="outline">Medium</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    )
  }

  const renderFinancialReports = () => {
    const costPerDept = generateCostPerDepartment(consumptionLogs, foodItems)
    const foodCostPct = generateFoodCostPercentage(orders, consumptionLogs, foodItems)
    const purchaseTrends = generatePurchaseTrends(purchaseOrders, period)
    const budgetUtil = generateBudgetUtilization(purchaseOrders, consumptionLogs, foodItems)

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Cost Per Department</h3>
              <p className="text-sm text-muted-foreground">Breakdown of costs by department</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleExport('csv')}>
                <Download size={16} className="mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">Total Cost</div>
              <div className="text-2xl font-semibold">
                {formatCurrency(costPerDept.reduce((sum, d) => sum + d.totalCost, 0))}
              </div>
            </Card>
            <Card className="p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">Departments</div>
              <div className="text-2xl font-semibold">{costPerDept.length}</div>
            </Card>
            <Card className="p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">Highest Cost</div>
              <div className="text-lg font-semibold">
                {costPerDept.length > 0 ? costPerDept[0].department : 'N/A'}
              </div>
            </Card>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium mb-4">Cost Distribution by Department</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costPerDept}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ department, percentageOfTotal }) => `${department}: ${percentageOfTotal.toFixed(1)}%`}
                  outerRadius={100}
                  fill="var(--primary)"
                  dataKey="totalCost"
                  nameKey="department"
                >
                  {costPerDept.map((entry, index) => {
                    const colors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']
                    return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  })}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '6px'
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costPerDept.map((dept) => (
                <TableRow key={dept.department}>
                  <TableCell className="font-medium">{dept.department}</TableCell>
                  <TableCell className="text-right">{dept.itemCount}</TableCell>
                  <TableCell className="text-right">{dept.totalQuantity.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(dept.totalCost)}</TableCell>
                  <TableCell className="text-right">{formatPercent(dept.percentageOfTotal / 100)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Food Cost Percentage</h3>
              <p className="text-sm text-muted-foreground">Analysis of food cost vs revenue</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">Total Revenue</div>
              <div className="text-2xl font-semibold">{formatCurrency(foodCostPct.totalRevenue)}</div>
            </Card>
            <Card className="p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">Total Cost</div>
              <div className="text-2xl font-semibold">{formatCurrency(foodCostPct.totalCost)}</div>
            </Card>
            <Card className="p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">Food Cost %</div>
              <div className="text-2xl font-semibold">{formatPercent(foodCostPct.foodCostPercentage / 100)}</div>
            </Card>
            <Card className="p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">Gross Profit</div>
              <div className="text-2xl font-semibold">{formatCurrency(foodCostPct.grossProfit)}</div>
            </Card>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium mb-4">Food Cost Analysis by Category</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={foodCostPct.breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="category" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '6px'
                  }}
                  formatter={(value: any) => typeof value === 'number' ? formatCurrency(value) : value}
                />
                <Legend />
                <Bar dataKey="revenue" fill="var(--success)" name="Revenue" radius={[8, 8, 0, 0]} />
                <Bar dataKey="cost" fill="var(--destructive)" name="Cost" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {foodCostPct.breakdown.map((item) => (
              <div key={item.category} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">{item.category}</div>
                  <div className="text-sm text-muted-foreground">
                    Revenue: {formatCurrency(item.revenue)} | Cost: {formatCurrency(item.cost)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{formatPercent(item.costPercentage / 100)}</div>
                  <div className="text-sm text-muted-foreground">Food Cost %</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Purchase Cost Trends</h3>
              <p className="text-sm text-muted-foreground">
                {comparisonMode && comparisonPeriods.length > 0
                  ? 'Comparing purchase patterns across periods'
                  : 'Track purchasing patterns over time'}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium mb-4">Purchase Order Trends</h4>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={purchaseTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="period" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '6px'
                  }}
                  formatter={(value: any) => typeof value === 'number' ? formatCurrency(value) : value}
                />
                <Legend />
                {!comparisonMode ? (
                  <>
                    <Line 
                      type="monotone" 
                      dataKey="totalAmount" 
                      stroke="var(--chart-1)" 
                      strokeWidth={3}
                      dot={{ fill: 'var(--chart-1)', r: 4 }}
                      name="Total Amount"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="averagePoValue" 
                      stroke="var(--chart-2)" 
                      strokeWidth={3}
                      dot={{ fill: 'var(--chart-2)', r: 4 }}
                      name="Avg PO Value"
                    />
                  </>
                ) : (
                  comparisonPeriods
                    .filter(p => p.startDate && p.endDate)
                    .map((period) => (
                      <Line
                        key={period.id}
                        type="monotone"
                        dataKey={`amount_${period.id}`}
                        stroke={period.color}
                        strokeWidth={3}
                        dot={{ fill: period.color, r: 5 }}
                        name={period.label}
                      />
                    ))
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {comparisonMode && comparisonPeriods.filter(p => p.startDate && p.endDate).length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-4">PO Count Comparison</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={purchaseTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="period" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      border: '1px solid var(--border)',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  {comparisonPeriods
                    .filter(p => p.startDate && p.endDate)
                    .map((period) => (
                      <Bar
                        key={period.id}
                        dataKey={`count_${period.id}`}
                        fill={period.color}
                        name={period.label}
                        radius={[8, 8, 0, 0]}
                      />
                    ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Purchase Orders</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right">Avg PO Value</TableHead>
                <TableHead className="text-right">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseTrends.map((trend, idx) => (
                <TableRow key={trend.period}>
                  <TableCell className="font-medium">{trend.period}</TableCell>
                  <TableCell className="text-right">{trend.poCount}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(trend.totalAmount)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(trend.averagePoValue)}</TableCell>
                  <TableCell className="text-right">
                    {trend.trendDirection === 'up' ? (
                      <span className="flex items-center justify-end text-destructive">
                        <TrendUp size={16} className="mr-1" />
                        {formatPercent(trend.trendPercentage / 100)}
                      </span>
                    ) : trend.trendDirection === 'down' ? (
                      <span className="flex items-center justify-end text-success">
                        <TrendDown size={16} className="mr-1" />
                        {formatPercent(trend.trendPercentage / 100)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Stable</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Budget Utilization</h3>
              <p className="text-sm text-muted-foreground">Track budget vs actual spending</p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Budget</TableHead>
                <TableHead className="text-right">Spent</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead className="text-right">% Used</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgetUtil.map((item) => (
                <TableRow key={item.category}>
                  <TableCell className="font-medium">{item.category}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.budgetAllocated)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.actualSpent)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.remaining)}</TableCell>
                  <TableCell className="text-right font-medium">{formatPercent(item.utilizationPercentage / 100)}</TableCell>
                  <TableCell>
                    {item.status === 'over-budget' ? (
                      <Badge variant="destructive">Over Budget</Badge>
                    ) : item.status === 'near-limit' ? (
                      <Badge className="bg-orange-500">Near Limit</Badge>
                    ) : (
                      <Badge variant="default">On Track</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    )
  }

  const renderKitchenReports = () => {
    const ingredientUsage = generateIngredientUsage(consumptionLogs, foodItems, recipes)
    const dishProfit = generateDishProfitability(recipes, orders, foodItems)
    const menuPerf = generateMenuPerformance(menus, orders, recipes)

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Ingredient Usage Summary</h3>
              <p className="text-sm text-muted-foreground">Most used ingredients in recipes</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleExport('csv')}>
                <Download size={16} className="mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium mb-4">Top Ingredients by Usage</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ingredientUsage.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="ingredientName" stroke="var(--muted-foreground)" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '6px'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'estimatedCost') return formatCurrency(value)
                    return value
                  }}
                />
                <Legend />
                <Bar dataKey="usageCount" fill="var(--chart-3)" name="Times Used" radius={[8, 8, 0, 0]} />
                <Bar dataKey="estimatedCost" fill="var(--chart-1)" name="Estimated Cost" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingredient</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Times Used</TableHead>
                <TableHead className="text-right">Total Quantity</TableHead>
                <TableHead className="text-right">Unit</TableHead>
                <TableHead className="text-right">Estimated Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredientUsage.map((item) => (
                <TableRow key={item.ingredientId}>
                  <TableCell className="font-medium">{item.ingredientName}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right">{item.usageCount}</TableCell>
                  <TableCell className="text-right">{item.totalQuantity.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{item.unit}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.estimatedCost)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Dish Profitability & Food Cost Breakdown</h3>
              <p className="text-sm text-muted-foreground">
                {comparisonMode && comparisonPeriods.filter(p => p.startDate && p.endDate).length > 0
                  ? 'Compare dish profitability across periods'
                  : 'Analyze profit margins for each dish'}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium mb-4">
              {comparisonMode ? 'Gross Profit Comparison Across Periods' : 'Dish Profitability Comparison'}
            </h4>
            <ResponsiveContainer width="100%" height={comparisonMode ? 400 : 300}>
              <BarChart data={dishProfit.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="dishName" stroke="var(--muted-foreground)" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '6px'
                  }}
                  formatter={(value: any) => typeof value === 'number' ? formatCurrency(value) : value}
                />
                <Legend />
                {!comparisonMode ? (
                  <>
                    <Bar dataKey="sellingPrice" fill="var(--chart-1)" name="Selling Price" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="foodCost" fill="var(--chart-2)" name="Food Cost" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="grossProfit" fill="var(--success)" name="Gross Profit" radius={[8, 8, 0, 0]} />
                  </>
                ) : (
                  comparisonPeriods
                    .filter(p => p.startDate && p.endDate)
                    .map((period) => (
                      <Bar
                        key={period.id}
                        dataKey={`profit_${period.id}`}
                        fill={period.color}
                        name={`${period.label} Profit`}
                        radius={[8, 8, 0, 0]}
                      />
                    ))
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dish</TableHead>
                <TableHead className="text-right">Selling Price</TableHead>
                <TableHead className="text-right">Food Cost</TableHead>
                <TableHead className="text-right">Cost %</TableHead>
                <TableHead className="text-right">Gross Profit</TableHead>
                <TableHead className="text-right">Margin %</TableHead>
                <TableHead className="text-right">Times Sold</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dishProfit.map((dish) => (
                <TableRow key={dish.dishId}>
                  <TableCell className="font-medium">{dish.dishName}</TableCell>
                  <TableCell className="text-right">{formatCurrency(dish.sellingPrice)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(dish.foodCost)}</TableCell>
                  <TableCell className="text-right">{formatPercent(dish.costPercentage / 100)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(dish.grossProfit)}</TableCell>
                  <TableCell className="text-right">
                    <span className={dish.profitMargin > 60 ? 'text-success' : dish.profitMargin < 40 ? 'text-destructive' : ''}>
                      {formatPercent(dish.profitMargin / 100)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{dish.timesSold}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Menu Performance Analysis</h3>
              <p className="text-sm text-muted-foreground">Track menu popularity and revenue contribution</p>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium mb-4">Menu Revenue Performance</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={menuPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="menuName" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '6px'
                  }}
                  formatter={(value: any, name: string) => {
                    if (name === 'totalRevenue' || name === 'averageOrderValue') return formatCurrency(value)
                    return value
                  }}
                />
                <Legend />
                <Bar dataKey="totalOrders" fill="var(--chart-4)" name="Total Orders" radius={[8, 8, 0, 0]} />
                <Bar dataKey="totalRevenue" fill="var(--success)" name="Total Revenue" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Menu</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Avg Order</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuPerf.map((menu) => (
                <TableRow key={menu.menuId}>
                  <TableCell className="font-medium">{menu.menuName}</TableCell>
                  <TableCell className="text-right">{menu.itemCount}</TableCell>
                  <TableCell className="text-right">{menu.totalOrders}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(menu.totalRevenue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(menu.averageOrderValue)}</TableCell>
                  <TableCell>
                    {menu.performance === 'excellent' ? (
                      <Badge variant="default">Excellent</Badge>
                    ) : menu.performance === 'good' ? (
                      <Badge variant="outline">Good</Badge>
                    ) : (
                      <Badge variant="destructive">Needs Review</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-1">Comprehensive operational and financial insights</p>
        </div>
        <Button>
          <ArrowsClockwise size={20} className="mr-2" />
          Refresh Data
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="period-select">Report Period</Label>
            <Select value={period} onValueChange={(v) => setPeriod(v as ReportPeriod)}>
              <SelectTrigger id="period-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {period === 'custom' && (
            <>
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </>
          )}

          <AdvancedFilterDialog
            fields={filterFields}
            onApplyFilter={handleApplyFilter}
            savedFilters={savedFilters || []}
            onSaveFilter={handleSaveFilter}
            onDeleteFilter={handleDeleteFilter}
          />

          {activeFilter && (
            <Button variant="outline" onClick={handleClearFilter}>
              <X size={18} className="mr-2" />
              Clear Filter
            </Button>
          )}
        </div>

        {activeFilter && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FunnelSimple size={18} />
                <span className="font-medium">Active Filter: {activeFilter.name}</span>
                <Badge variant="outline">
                  {activeFilter.groups.reduce((sum, g) => sum + g.rules.length, 0)} rules
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClearFilter}>
                <X size={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ArrowsLeftRight size={20} className="text-primary" />
            <h3 className="text-lg font-semibold">Comparison Mode</h3>
            <Badge variant={comparisonMode ? "default" : "outline"}>
              {comparisonMode ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <Button onClick={toggleComparisonMode} variant={comparisonMode ? 'default' : 'outline'}>
            <ArrowsLeftRight size={18} className="mr-2" />
            {comparisonMode ? 'Disable' : 'Enable'} Comparison
          </Button>
        </div>

        {comparisonMode && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Compare data across multiple time periods side-by-side in charts and tables.
            </p>
            
            <div className="space-y-3">
              {comparisonPeriods.map((period, index) => (
                <div key={period.id} className="flex items-end gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="w-2 h-full rounded-full" style={{ backgroundColor: period.color }} />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor={`period-label-${period.id}`}>Period Name</Label>
                      <Input
                        id={`period-label-${period.id}`}
                        value={period.label}
                        onChange={(e) => handleUpdateComparisonPeriod(period.id, 'label', e.target.value)}
                        placeholder={`Period ${index + 1}`}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`period-start-${period.id}`}>Start Date</Label>
                      <Input
                        id={`period-start-${period.id}`}
                        type="date"
                        value={period.startDate}
                        onChange={(e) => handleUpdateComparisonPeriod(period.id, 'startDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`period-end-${period.id}`}>End Date</Label>
                      <Input
                        id={`period-end-${period.id}`}
                        type="date"
                        value={period.endDate}
                        onChange={(e) => handleUpdateComparisonPeriod(period.id, 'endDate', e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveComparisonPeriod(period.id)}
                    disabled={comparisonPeriods.length <= 2}
                  >
                    <Trash size={18} />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={handleAddComparisonPeriod}
              disabled={comparisonPeriods.length >= 8}
              className="w-full"
            >
              <Plus size={18} className="mr-2" />
              Add Comparison Period
            </Button>

            {comparisonPeriods.length >= 8 && (
              <p className="text-sm text-muted-foreground text-center">
                Maximum of 8 comparison periods reached
              </p>
            )}
          </div>
        )}
      </Card>

      <Tabs value={category} onValueChange={(v) => setCategory(v as ReportCategory)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="operational">
            <Package size={18} className="mr-2" />
            Operational Reports
          </TabsTrigger>
          <TabsTrigger value="financial">
            <CurrencyDollar size={18} className="mr-2" />
            Financial Reports
          </TabsTrigger>
          <TabsTrigger value="kitchen">
            <ChefHat size={18} className="mr-2" />
            Kitchen & Menu Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="operational" className="mt-6">
          {renderOperationalReports()}
        </TabsContent>

        <TabsContent value="financial" className="mt-6">
          {renderFinancialReports()}
        </TabsContent>

        <TabsContent value="kitchen" className="mt-6">
          {renderKitchenReports()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
