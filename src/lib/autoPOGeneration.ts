import type { 
  FoodItem, 
  Amenity, 
  ConstructionMaterial, 
  GeneralProduct,
  PurchaseOrder,
  PurchaseOrderItem,
  Supplier,
  SystemUser
} from './types'

export interface ReorderTrigger {
  itemId: string
  itemName: string
  itemType: 'food' | 'amenity' | 'material' | 'product'
  category: string
  currentStock: number
  reorderLevel: number
  reorderQuantity: number
  unit: string
  preferredSupplierId: string
  preferredSupplierName: string
  unitCost: number
  estimatedTotal: number
  daysUntilStockout: number
  priority: 'critical' | 'high' | 'medium' | 'low'
}

export interface AutoPORecommendation {
  supplierId: string
  supplierName: string
  items: Array<{
    itemId: string
    itemName: string
    itemType: 'food' | 'amenity' | 'material' | 'product'
    quantity: number
    unit: string
    unitCost: number
    total: number
  }>
  estimatedTotal: number
  urgency: 'critical' | 'high' | 'medium' | 'low'
  createdAt: number
}

/**
 * Identify items that need reordering based on current stock levels
 */
export function identifyReorderTriggers(
  foodItems: FoodItem[],
  amenities: Amenity[],
  materials: ConstructionMaterial[],
  products: GeneralProduct[],
  averageDailyUsage?: Map<string, number>
): ReorderTrigger[] {
  const triggers: ReorderTrigger[] = []

  // Process food items
  foodItems.forEach(item => {
    if (item.currentStock <= item.reorderLevel) {
      const dailyUsage = averageDailyUsage?.get(item.id) || 0
      const daysUntilStockout = dailyUsage > 0 ? Math.floor(item.currentStock / dailyUsage) : 999

      let priority: ReorderTrigger['priority'] = 'low'
      if (item.currentStock === 0) priority = 'critical'
      else if (daysUntilStockout <= 3) priority = 'critical'
      else if (daysUntilStockout <= 7) priority = 'high'
      else if (daysUntilStockout <= 14) priority = 'medium'

      triggers.push({
        itemId: item.id,
        itemName: item.name,
        itemType: 'food',
        unit: item.unit,
        category: item.category,
        currentStock: item.currentStock,
        reorderLevel: item.reorderLevel,
        reorderQuantity: item.reorderQuantity,
        preferredSupplierId: (item as any).preferredSupplierId || item.supplierIds?.[0] || '',
        preferredSupplierName: '', // Will be filled later
        unitCost: item.unitCost,
        estimatedTotal: item.reorderQuantity * item.unitCost,
        daysUntilStockout,
        priority
      })
    }
  })

  // Process amenities
  amenities.forEach(item => {
    if (item.currentStock <= item.reorderLevel) {
      const dailyUsage = averageDailyUsage?.get(item.id) || 0
      const daysUntilStockout = dailyUsage > 0 ? Math.floor(item.currentStock / dailyUsage) : 999

      let priority: ReorderTrigger['priority'] = 'low'
      if (item.currentStock === 0) priority = 'critical'
      else if (daysUntilStockout <= 3) priority = 'critical'
      else if (daysUntilStockout <= 7) priority = 'high'
      else if (daysUntilStockout <= 14) priority = 'medium'

      triggers.push({
        itemId: item.id,
        itemName: item.name,
        itemType: 'amenity',
        unit: item.unit,
        category: item.category,
        currentStock: item.currentStock,
        reorderLevel: item.reorderLevel,
        reorderQuantity: item.reorderQuantity,
        preferredSupplierId: (item as any).preferredSupplierId || item.supplierIds?.[0] || '',
        preferredSupplierName: '',
        unitCost: item.unitCost,
        estimatedTotal: item.reorderQuantity * item.unitCost,
        daysUntilStockout,
        priority
      })
    }
  })

  // Process construction materials
  materials.forEach(item => {
    if (item.currentStock <= item.reorderLevel) {
      const dailyUsage = averageDailyUsage?.get(item.id) || 0
      const daysUntilStockout = dailyUsage > 0 ? Math.floor(item.currentStock / dailyUsage) : 999

      let priority: ReorderTrigger['priority'] = 'low'
      if (item.currentStock === 0) priority = 'high'
      else if (daysUntilStockout <= 7) priority = 'high'
      else if (daysUntilStockout <= 14) priority = 'medium'

      triggers.push({
        itemId: item.id,
        itemName: item.name,
        itemType: 'material',
        unit: item.unit,
        category: item.category,
        currentStock: item.currentStock,
        reorderLevel: item.reorderLevel,
        reorderQuantity: item.reorderQuantity,
        preferredSupplierId: (item as any).preferredSupplierId || item.supplierIds?.[0] || '',
        preferredSupplierName: '',
        unitCost: item.unitCost,
        estimatedTotal: item.reorderQuantity * item.unitCost,
        daysUntilStockout,
        priority
      })
    }
  })

  // Process general products
  products.forEach(item => {
    if (item.currentStock <= item.reorderLevel) {
      const dailyUsage = averageDailyUsage?.get(item.id) || 0
      const daysUntilStockout = dailyUsage > 0 ? Math.floor(item.currentStock / dailyUsage) : 999

      let priority: ReorderTrigger['priority'] = 'low'
      if (item.currentStock === 0) priority = 'high'
      else if (daysUntilStockout <= 7) priority = 'high'
      else if (daysUntilStockout <= 14) priority = 'medium'

      triggers.push({
        itemId: item.id,
        itemName: item.name,
        itemType: 'product',
        unit: (item as any).unit || 'unit',
        category: item.category,
        currentStock: item.currentStock,
        reorderLevel: item.reorderLevel,
        reorderQuantity: item.reorderQuantity,
        preferredSupplierId: (item as any).preferredSupplierId || item.supplierIds?.[0] || '',
        preferredSupplierName: '',
        unitCost: item.unitCost,
        estimatedTotal: item.reorderQuantity * item.unitCost,
        daysUntilStockout,
        priority
      })
    }
  })

  // Sort by priority (critical first) and then by days until stockout
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  return triggers.sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    return a.daysUntilStockout - b.daysUntilStockout
  })
}

/**
 * Generate Auto-PO recommendations grouped by supplier
 */
export function generateAutoPORecommendations(
  triggers: ReorderTrigger[],
  suppliers: Supplier[]
): AutoPORecommendation[] {
  // Create supplier map for quick lookup
  const supplierMap = new Map(suppliers.map(s => [s.id, s]))

  // Update trigger supplier names
  triggers.forEach(trigger => {
    const supplier = supplierMap.get(trigger.preferredSupplierId)
    if (supplier) {
      trigger.preferredSupplierName = supplier.name
    }
  })

  // Group triggers by supplier
  const groupedBySupplier = new Map<string, ReorderTrigger[]>()
  
  triggers.forEach(trigger => {
    if (trigger.preferredSupplierId) {
      if (!groupedBySupplier.has(trigger.preferredSupplierId)) {
        groupedBySupplier.set(trigger.preferredSupplierId, [])
      }
      groupedBySupplier.get(trigger.preferredSupplierId)!.push(trigger)
    }
  })

  // Create recommendations
  const recommendations: AutoPORecommendation[] = []

  groupedBySupplier.forEach((items, supplierId) => {
    const supplier = supplierMap.get(supplierId)
    if (!supplier) return

    // Determine overall urgency (highest priority item)
    const urgency = items.some(i => i.priority === 'critical') ? 'critical' :
                   items.some(i => i.priority === 'high') ? 'high' :
                   items.some(i => i.priority === 'medium') ? 'medium' : 'low'

    const estimatedTotal = items.reduce((sum, item) => sum + item.estimatedTotal, 0)

    recommendations.push({
      supplierId,
      supplierName: supplier.name,
      items: items.map(item => ({
        itemId: item.itemId,
        itemName: item.itemName,
        itemType: item.itemType,
        unit: item.unit,
        quantity: item.reorderQuantity,
        unitCost: item.unitCost,
        total: item.estimatedTotal
      })),
      estimatedTotal,
      urgency,
      createdAt: Date.now()
    })
  })

  // Sort by urgency
  const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  return recommendations.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])
}

/**
 * Create purchase order from recommendation
 */
export function createPOFromRecommendation(
  recommendation: AutoPORecommendation,
  currentUser: SystemUser,
  deliveryDate: number,
  notes?: string
): PurchaseOrder {
  const poNumber = `PO-AUTO-${Date.now()}`
  
  const items: PurchaseOrderItem[] = recommendation.items.map((item, index) => ({
    id: `poi-${Date.now()}-${index}`,
    inventoryItemId: item.itemId,
    name: item.itemName,
    quantity: item.quantity,
    unit: item.unit || 'unit',
    unitPrice: item.unitCost,
    total: item.total,
  }))

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const tax = subtotal * 0.15 // Assuming 15% tax
  const total = subtotal + tax

  const po: PurchaseOrder = {
    id: `po-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    poNumber,
    supplierId: recommendation.supplierId,
    expectedDelivery: deliveryDate,
    status: 'draft',
    items,
    subtotal,
    tax,
    total,
    notes: notes || `Auto-generated PO based on reorder triggers. Urgency: ${recommendation.urgency}`,
    createdAt: Date.now(),
    createdBy: `${currentUser.firstName} ${currentUser.lastName}`,
    revisionNumber: 1,
  }

  return po
}

/**
 * Calculate average daily usage for an item based on historical data
 * This is a simplified version - in production, you'd analyze actual usage logs
 */
export function calculateAverageDailyUsage(
  itemId: string,
  usageLogs: Array<{ itemId: string; quantity: number; date: number }>,
  days: number = 30
): number {
  const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000)
  
  const relevantLogs = usageLogs.filter(
    log => log.itemId === itemId && log.date >= cutoffDate
  )

  if (relevantLogs.length === 0) return 0

  const totalUsage = relevantLogs.reduce((sum, log) => sum + log.quantity, 0)
  return totalUsage / days
}

/**
 * Get items that are frequently out of stock
 */
export function getFrequentlyOutOfStockItems(
  triggers: ReorderTrigger[],
  stockoutHistory: Map<string, number> // itemId -> number of stockouts
): ReorderTrigger[] {
  return triggers
    .filter(trigger => (stockoutHistory.get(trigger.itemId) || 0) >= 3)
    .sort((a, b) => (stockoutHistory.get(b.itemId) || 0) - (stockoutHistory.get(a.itemId) || 0))
}

/**
 * Optimize reorder quantities based on historical usage and lead time
 */
export function optimizeReorderQuantity(
  averageDailyUsage: number,
  leadTimeDays: number,
  safetyStockDays: number = 7
): number {
  // Economic Order Quantity simplified version
  // Order enough for lead time + safety stock
  const optimalQuantity = averageDailyUsage * (leadTimeDays + safetyStockDays)
  
  // Round up to nearest whole number
  return Math.ceil(optimalQuantity)
}
