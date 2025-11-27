import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
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
  ArrowsClockwise
} from '@phosphor-icons/react'
import { formatCurrency, formatPercent } from '@/lib/helpers'
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

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    console.log(`Exporting report as ${format}`)
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

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Order Summary Report</h3>
              <p className="text-sm text-muted-foreground">
                {period.charAt(0).toUpperCase() + period.slice(1)} overview of orders
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">Total Orders</div>
              <div className="text-2xl font-semibold">{orderSummary.totalOrders}</div>
            </Card>
            <Card className="p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">Total Revenue</div>
              <div className="text-2xl font-semibold">{formatCurrency(orderSummary.totalRevenue)}</div>
            </Card>
            <Card className="p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">Avg Order Value</div>
              <div className="text-2xl font-semibold">{formatCurrency(orderSummary.averageOrderValue)}</div>
            </Card>
            <Card className="p-4 bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">Items Sold</div>
              <div className="text-2xl font-semibold">{orderSummary.totalItemsSold}</div>
            </Card>
          </div>

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
              <p className="text-sm text-muted-foreground">Track purchasing patterns over time</p>
            </div>
          </div>

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
              <p className="text-sm text-muted-foreground">Analyze profit margins for each dish</p>
            </div>
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

          <Button variant="outline">
            <FunnelSimple size={20} className="mr-2" />
            Advanced Filters
          </Button>
        </div>
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
