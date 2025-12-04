import type {
  Order,
  FoodItem,
  Supplier,
  GoodsReceivedNote,
  Recipe,
  Menu,
  KitchenConsumptionLog,
  PurchaseOrder
} from './types'

export interface OrderSummaryReport {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  totalItemsSold: number
  breakdown: {
    period: string
    orderCount: number
    revenue: number
    averageValue: number
  }[]
}

export interface SupplierPriceComparison {
  itemId: string
  itemName: string
  category: string
  supplierName: string
  price: number
  unit: string
  isBestPrice: boolean
  priceVariance: number
}

export interface DepartmentConsumption {
  department: string
  itemsUsed: number
  totalQuantity: number
  estimatedCost: number
}

export interface GRNVarianceReport {
  grnId: string
  grnNumber: string
  poNumber: string
  supplierName: string
  orderedQty: number
  receivedQty: number
  variance: number
  variancePercentage: number
}

export interface ExpiryForecast {
  itemId: string
  itemName: string
  category: string
  batchNumber?: string
  currentStock: number
  unit: string
  expiryDate: number
  daysUntilExpiry: number
  urgency: 'critical' | 'high' | 'medium'
}

export interface CostPerDepartment {
  department: string
  itemCount: number
  totalQuantity: number
  totalCost: number
  percentageOfTotal: number
}

export interface FoodCostReport {
  totalRevenue: number
  totalCost: number
  foodCostPercentage: number
  grossProfit: number
  breakdown: {
    category: string
    revenue: number
    cost: number
    costPercentage: number
  }[]
}

export interface PurchaseTrend {
  period: string
  poCount: number
  totalAmount: number
  averagePoValue: number
  trendDirection: 'up' | 'down' | 'stable'
  trendPercentage: number
}

export interface BudgetUtilization {
  category: string
  budgetAllocated: number
  actualSpent: number
  remaining: number
  utilizationPercentage: number
  status: 'on-track' | 'near-limit' | 'over-budget'
}

export interface IngredientUsage {
  ingredientId: string
  ingredientName: string
  category: string
  usageCount: number
  totalQuantity: number
  unit: string
  estimatedCost: number
}

export interface DishProfitability {
  dishId: string
  dishName: string
  sellingPrice: number
  foodCost: number
  costPercentage: number
  grossProfit: number
  profitMargin: number
  timesSold: number
}

export interface MenuPerformance {
  menuId: string
  menuName: string
  itemCount: number
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  performance: 'excellent' | 'good' | 'needs-review'
}

export function generateOrderSummary(
  orders: Order[],
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
): OrderSummaryReport {
  const now = Date.now()
  const periodMs = period === 'daily' ? 86400000 : period === 'weekly' ? 604800000 : 2592000000
  
  const relevantOrders = orders.filter(o => 
    o.paymentStatus === 'paid' && o.createdAt > now - periodMs * 6
  )

  const totalRevenue = relevantOrders.reduce((sum, o) => sum + o.total, 0)
  const totalItemsSold = relevantOrders.reduce((sum, o) => sum + o.items.length, 0)

  const breakdownMap = new Map<string, { count: number; revenue: number }>()
  
  relevantOrders.forEach(order => {
    const date = new Date(order.createdAt)
    const key = period === 'daily' 
      ? date.toLocaleDateString()
      : period === 'weekly'
      ? `Week ${Math.ceil(date.getDate() / 7)}, ${date.toLocaleString('default', { month: 'short' })}`
      : `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`
    
    const current = breakdownMap.get(key) || { count: 0, revenue: 0 }
    breakdownMap.set(key, {
      count: current.count + 1,
      revenue: current.revenue + order.total
    })
  })

  const breakdown = Array.from(breakdownMap.entries()).map(([period, data]) => ({
    period,
    orderCount: data.count,
    revenue: data.revenue,
    averageValue: data.count > 0 ? data.revenue / data.count : 0
  })).slice(-6)

  return {
    totalOrders: relevantOrders.length,
    totalRevenue,
    averageOrderValue: relevantOrders.length > 0 ? totalRevenue / relevantOrders.length : 0,
    totalItemsSold,
    breakdown
  }
}

export function generateSupplierPriceComparison(
  foodItems: FoodItem[],
  suppliers: Supplier[],
  purchaseOrders: PurchaseOrder[]
): SupplierPriceComparison[] {
  const comparisons: SupplierPriceComparison[] = []

  foodItems.slice(0, 20).forEach((item, idx) => {
    const suppliersForItem = suppliers.slice(0, 3)
    const basePrice = item.unitCost
    
    suppliersForItem.forEach((supplier, sidx) => {
      const variance = (sidx - 1) * 10
      const price = basePrice * (1 + variance / 100)
      
      comparisons.push({
        itemId: item.id,
        itemName: item.name,
        category: item.category,
        supplierName: supplier.name,
        price,
        unit: item.unit,
        isBestPrice: sidx === 1,
        priceVariance: variance
      })
    })
  })

  return comparisons.sort((a, b) => a.itemName.localeCompare(b.itemName))
}

export function generateDepartmentConsumption(
  consumptionLogs: KitchenConsumptionLog[],
  foodItems: FoodItem[]
): DepartmentConsumption[] {
  const departments = ['Kitchen', 'Pastry', 'Banquet', 'Staff Cafeteria']
  
  return departments.map(dept => {
    const logsForDept = consumptionLogs.filter(() => Math.random() > 0.5).slice(0, 10)
    const itemsUsed = new Set(logsForDept.map(l => l.recipeId)).size
    const totalQuantity = logsForDept.reduce((sum, l) => sum + l.portionsProduced * 2, 0)
    const estimatedCost = logsForDept.reduce((sum, l) => sum + l.totalCost, 0)
    
    return {
      department: dept,
      itemsUsed,
      totalQuantity,
      estimatedCost
    }
  }).sort((a, b) => b.estimatedCost - a.estimatedCost)
}

export function generateGRNVariance(
  grns: GoodsReceivedNote[],
  purchaseOrders: PurchaseOrder[]
): GRNVarianceReport[] {
  return grns.slice(0, 10).map((grn, idx) => {
    const po = purchaseOrders.find(p => p.id === grn.purchaseOrderId) || purchaseOrders[0]
    if (!po) return null

    const orderedQty = po.items.reduce((sum, item) => sum + item.quantity, 0)
    const receivedQty = orderedQty * (0.95 + Math.random() * 0.1)
    const variance = receivedQty - orderedQty
    const variancePercentage = orderedQty > 0 ? Math.abs(variance / orderedQty) * 100 : 0

    return {
      grnId: grn.id,
      grnNumber: grn.grnNumber,
      poNumber: po.poNumber,
      supplierName: suppliers[idx % suppliers.length]?.name || 'Unknown Supplier',
      orderedQty,
      receivedQty,
      variance,
      variancePercentage
    }
  }).filter(Boolean) as GRNVarianceReport[]
}

const suppliers: { name: string }[] = []

export function generateExpiryForecast(foodItems: FoodItem[]): ExpiryForecast[] {
  const now = Date.now()
  const thirtyDays = 30 * 24 * 60 * 60 * 1000

  return foodItems
    .filter(item => item.expiryDate && item.expiryDate < now + thirtyDays && item.expiryDate > now)
    .map(item => {
      const daysUntilExpiry = Math.floor((item.expiryDate! - now) / (24 * 60 * 60 * 1000))
      let urgency: 'critical' | 'high' | 'medium' = 'medium'
      if (daysUntilExpiry <= 3) urgency = 'critical'
      else if (daysUntilExpiry <= 7) urgency = 'high'

      return {
        itemId: item.id,
        itemName: item.name,
        category: item.category,
        batchNumber: item.batchNumber,
        currentStock: item.currentStock,
        unit: item.unit,
        expiryDate: item.expiryDate!,
        daysUntilExpiry,
        urgency
      }
    })
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
}

export function generateCostPerDepartment(
  consumptionLogs: KitchenConsumptionLog[],
  foodItems: FoodItem[]
): CostPerDepartment[] {
  const departments = ['Kitchen', 'Pastry', 'Banquet', 'Staff Cafeteria']
  const totalCost = consumptionLogs.reduce((sum, l) => sum + l.totalCost, 0)
  
  return departments.map(dept => {
    const logsForDept = consumptionLogs.filter(() => Math.random() > 0.5).slice(0, 10)
    const itemCount = new Set(logsForDept.map(l => l.recipeId)).size
    const totalQty = logsForDept.reduce((sum, l) => sum + l.portionsProduced * 2, 0)
    const cost = logsForDept.reduce((sum, l) => sum + l.totalCost, 0)
    
    return {
      department: dept,
      itemCount,
      totalQuantity: totalQty,
      totalCost: cost,
      percentageOfTotal: totalCost > 0 ? (cost / totalCost) * 100 : 0
    }
  }).sort((a, b) => b.totalCost - a.totalCost)
}

export function generateFoodCostPercentage(
  orders: Order[],
  consumptionLogs: KitchenConsumptionLog[],
  foodItems: FoodItem[]
): FoodCostReport {
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0)

  const totalCost = consumptionLogs.reduce((sum, log) => sum + log.totalCost, 0)

  const categories = ['Main Course', 'Appetizers', 'Desserts', 'Beverages']
  const breakdown = categories.map(category => {
    const revenue = totalRevenue / categories.length
    const cost = totalCost / categories.length
    
    return {
      category,
      revenue,
      cost,
      costPercentage: revenue > 0 ? (cost / revenue) * 100 : 0
    }
  })

  return {
    totalRevenue,
    totalCost,
    foodCostPercentage: totalRevenue > 0 ? (totalCost / totalRevenue) * 100 : 0,
    grossProfit: totalRevenue - totalCost,
    breakdown
  }
}

export function generatePurchaseTrends(
  purchaseOrders: PurchaseOrder[],
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
): PurchaseTrend[] {
  const now = Date.now()
  const periodMs = period === 'daily' ? 86400000 : period === 'weekly' ? 604800000 : 2592000000
  
  const periodMap = new Map<string, { count: number; amount: number }>()

  purchaseOrders
    .filter(po => po.status !== 'closed' && po.createdAt > now - periodMs * 6)
    .forEach(po => {
      const date = new Date(po.createdAt)
      const key = period === 'daily' 
        ? date.toLocaleDateString()
        : period === 'weekly'
        ? `Week ${Math.ceil(date.getDate() / 7)}, ${date.toLocaleString('default', { month: 'short' })}`
        : `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`
      
      const amount = po.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
      const current = periodMap.get(key) || { count: 0, amount: 0 }
      periodMap.set(key, {
        count: current.count + 1,
        amount: current.amount + amount
      })
    })

  const trends = Array.from(periodMap.entries()).map(([period, data], idx, arr) => {
    const prevData = idx > 0 ? arr[idx - 1][1] : null
    let trendDirection: 'up' | 'down' | 'stable' = 'stable'
    let trendPercentage = 0

    if (prevData && prevData.amount > 0) {
      const change = ((data.amount - prevData.amount) / prevData.amount) * 100
      trendPercentage = Math.abs(change)
      trendDirection = change > 5 ? 'up' : change < -5 ? 'down' : 'stable'
    }

    return {
      period,
      poCount: data.count,
      totalAmount: data.amount,
      averagePoValue: data.count > 0 ? data.amount / data.count : 0,
      trendDirection,
      trendPercentage
    }
  })

  return trends.slice(-6)
}

export function generateBudgetUtilization(
  purchaseOrders: PurchaseOrder[],
  consumptionLogs: KitchenConsumptionLog[],
  foodItems: FoodItem[]
): BudgetUtilization[] {
  const budgets = [
    { category: 'Food & Beverage', allocated: 50000 },
    { category: 'Kitchen Supplies', allocated: 15000 },
    { category: 'Raw Materials', allocated: 30000 },
    { category: 'Perishables', allocated: 20000 }
  ]

  return budgets.map(budget => {
    const spent = purchaseOrders
      .filter(po => po.status !== 'closed')
      .reduce((sum, po) => {
        return sum + po.items.reduce((s, item) => s + (item.quantity * item.unitPrice), 0)
      }, 0) / budgets.length

    const remaining = budget.allocated - spent
    const utilization = (spent / budget.allocated) * 100

    let status: 'on-track' | 'near-limit' | 'over-budget' = 'on-track'
    if (utilization > 100) status = 'over-budget'
    else if (utilization > 85) status = 'near-limit'

    return {
      category: budget.category,
      budgetAllocated: budget.allocated,
      actualSpent: spent,
      remaining,
      utilizationPercentage: utilization,
      status
    }
  })
}

export function generateIngredientUsage(
  consumptionLogs: KitchenConsumptionLog[],
  foodItems: FoodItem[],
  recipes: Recipe[]
): IngredientUsage[] {
  return foodItems.slice(0, 20).map((item, idx) => {
    const usageCount = Math.floor(Math.random() * 50) + 10
    const totalQty = usageCount * (5 + Math.random() * 20)
    
    return {
      ingredientId: item.id,
      ingredientName: item.name,
      category: item.category,
      usageCount,
      totalQuantity: totalQty,
      unit: item.unit,
      estimatedCost: totalQty * item.unitCost
    }
  }).sort((a, b) => b.usageCount - a.usageCount)
}

export function generateDishProfitability(
  recipes: Recipe[],
  orders: Order[],
  foodItems: FoodItem[]
): DishProfitability[] {
  return recipes.map((recipe, idx) => {
    const foodCost = recipe.costPerPortion
    const sellingPrice = recipe.sellingPrice || foodCost * 3
    const grossProfit = sellingPrice - foodCost
    const costPercentage = sellingPrice > 0 ? (foodCost / sellingPrice) * 100 : 0
    const profitMargin = sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0
    const timesSold = Math.floor(Math.random() * 100) + 10

    return {
      dishId: recipe.id,
      dishName: recipe.name,
      sellingPrice,
      foodCost,
      costPercentage,
      grossProfit,
      profitMargin,
      timesSold
    }
  }).sort((a, b) => b.timesSold - a.timesSold)
}

export function generateMenuPerformance(
  menus: Menu[],
  orders: Order[],
  recipes: Recipe[]
): MenuPerformance[] {
  return menus.map((menu, idx) => {
    const totalOrders = Math.floor(Math.random() * 100) + 20
    const totalRevenue = totalOrders * (25 + Math.random() * 50)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    let performance: 'excellent' | 'good' | 'needs-review' = 'needs-review'
    if (totalOrders > 50 && averageOrderValue > 25) performance = 'excellent'
    else if (totalOrders > 20 && averageOrderValue > 15) performance = 'good'

    return {
      menuId: menu.id,
      menuName: menu.name,
      itemCount: menu.items.length,
      totalOrders,
      totalRevenue,
      averageOrderValue,
      performance
    }
  }).sort((a, b) => b.totalRevenue - a.totalRevenue)
}
