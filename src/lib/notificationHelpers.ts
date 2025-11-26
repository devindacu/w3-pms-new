import { 
  Notification, 
  NotificationType, 
  NotificationPriority,
  FoodItem,
  Amenity,
  ConstructionMaterial,
  GeneralProduct,
  Requisition,
  PurchaseOrder,
  GoodsReceivedNote,
  Invoice,
  HousekeepingTask,
  Reservation,
  Order,
  LeaveRequest,
  ConstructionProject,
  DemandForecast,
  Room
} from './types'

export const generateNotification = (
  type: NotificationType,
  priority: NotificationPriority,
  title: string,
  message: string,
  module: Notification['module'],
  resourceId?: string,
  resourceType?: string,
  actionUrl?: string,
  actionLabel?: string,
  metadata?: Record<string, any>
): Notification => {
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    priority,
    status: 'unread',
    title,
    message,
    module,
    resourceId,
    resourceType,
    actionUrl,
    actionLabel,
    metadata,
    createdAt: Date.now(),
    expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000)
  }
}

export const checkInventoryAlerts = (
  foodItems: FoodItem[],
  amenities: Amenity[],
  constructionMaterials: ConstructionMaterial[],
  generalProducts: GeneralProduct[]
): Notification[] => {
  const notifications: Notification[] = []
  const now = Date.now()

  foodItems.forEach(item => {
    if (item.currentStock <= 0) {
      notifications.push(generateNotification(
        'inventory-critical-stock',
        'critical',
        `Food Item Out of Stock: ${item.name}`,
        `${item.name} has run out of stock. Immediate reorder required.`,
        'inventory',
        item.id,
        'food-item',
        undefined,
        'Reorder Now',
        { category: item.category, supplierIds: item.supplierIds }
      ))
    } else if (item.currentStock <= item.reorderLevel) {
      notifications.push(generateNotification(
        'inventory-low-stock',
        'high',
        `Food Item Low Stock: ${item.name}`,
        `${item.name} is at ${item.currentStock} ${item.unit}. Reorder level is ${item.reorderLevel} ${item.unit}.`,
        'inventory',
        item.id,
        'food-item',
        undefined,
        'Create PO',
        { category: item.category, supplierIds: item.supplierIds }
      ))
    }

    if (item.expiryDate && item.expiryDate < now) {
      notifications.push(generateNotification(
        'inventory-expired',
        'critical',
        `Food Item Expired: ${item.name}`,
        `${item.name} (Batch: ${item.batchNumber}) has expired. Remove from inventory immediately.`,
        'inventory',
        item.id,
        'food-item',
        undefined,
        'View Item',
        { expiryDate: item.expiryDate, batchNumber: item.batchNumber }
      ))
    } else if (item.expiryDate && item.expiryDate < now + (3 * 24 * 60 * 60 * 1000)) {
      const daysUntilExpiry = Math.ceil((item.expiryDate - now) / (24 * 60 * 60 * 1000))
      notifications.push(generateNotification(
        'inventory-expiring-soon',
        'high',
        `Food Item Expiring Soon: ${item.name}`,
        `${item.name} (Batch: ${item.batchNumber}) expires in ${daysUntilExpiry} day(s).`,
        'inventory',
        item.id,
        'food-item',
        undefined,
        'View Item',
        { expiryDate: item.expiryDate, batchNumber: item.batchNumber, daysUntilExpiry }
      ))
    }
  })

  amenities.forEach(item => {
    if (item.currentStock <= 0) {
      notifications.push(generateNotification(
        'inventory-critical-stock',
        'critical',
        `Amenity Out of Stock: ${item.name}`,
        `${item.name} has run out of stock. Immediate reorder required.`,
        'inventory',
        item.id,
        'amenity',
        undefined,
        'Reorder Now',
        { category: item.category, departments: item.department }
      ))
    } else if (item.currentStock <= item.reorderLevel) {
      notifications.push(generateNotification(
        'inventory-low-stock',
        'high',
        `Amenity Low Stock: ${item.name}`,
        `${item.name} is at ${item.currentStock} ${item.unit}. Reorder level is ${item.reorderLevel} ${item.unit}.`,
        'inventory',
        item.id,
        'amenity',
        undefined,
        'Create PO',
        { category: item.category, departments: item.department }
      ))
    }
  })

  constructionMaterials.forEach(item => {
    if (item.currentStock <= 0) {
      notifications.push(generateNotification(
        'construction-material-low',
        'critical',
        `Material Out of Stock: ${item.name}`,
        `${item.name} has run out of stock. Project delays possible.`,
        'construction',
        item.id,
        'construction-material',
        undefined,
        'Reorder Now',
        { category: item.category, segment: item.segment, projectId: item.projectId }
      ))
    } else if (item.currentStock <= item.reorderLevel) {
      notifications.push(generateNotification(
        'construction-material-low',
        'high',
        `Material Low Stock: ${item.name}`,
        `${item.name} is at ${item.currentStock} ${item.unit}. Reorder level is ${item.reorderLevel} ${item.unit}.`,
        'construction',
        item.id,
        'construction-material',
        undefined,
        'Create PO',
        { category: item.category, segment: item.segment, projectId: item.projectId }
      ))
    }
  })

  generalProducts.forEach(item => {
    if (item.currentStock <= 0) {
      notifications.push(generateNotification(
        'inventory-critical-stock',
        'medium',
        `Product Out of Stock: ${item.name}`,
        `${item.name} has run out of stock.`,
        'inventory',
        item.id,
        'general-product',
        undefined,
        'Reorder Now',
        { category: item.category, departments: item.department }
      ))
    } else if (item.currentStock <= item.reorderLevel) {
      notifications.push(generateNotification(
        'inventory-low-stock',
        'medium',
        `Product Low Stock: ${item.name}`,
        `${item.name} is at ${item.currentStock} ${item.unit}. Reorder level is ${item.reorderLevel} ${item.unit}.`,
        'inventory',
        item.id,
        'general-product',
        undefined,
        'Create PO',
        { category: item.category, departments: item.department }
      ))
    }
  })

  return notifications
}

export const checkProcurementAlerts = (
  requisitions: Requisition[],
  purchaseOrders: PurchaseOrder[]
): Notification[] => {
  const notifications: Notification[] = []
  const now = Date.now()

  requisitions.forEach(req => {
    if (req.status === 'pending-approval') {
      notifications.push(generateNotification(
        'requisition-pending',
        req.priority === 'urgent' ? 'critical' : 'medium',
        `Requisition Pending Approval: ${req.requisitionNumber}`,
        `Requisition from ${req.department} department requires approval.`,
        'procurement',
        req.id,
        'requisition',
        undefined,
        'Review',
        { priority: req.priority, department: req.department }
      ))
    }
  })

  purchaseOrders.forEach(po => {
    if (po.status === 'draft') {
      notifications.push(generateNotification(
        'po-pending-approval',
        'medium',
        `PO Pending Approval: ${po.poNumber}`,
        `Purchase Order ${po.poNumber} requires approval.`,
        'procurement',
        po.id,
        'purchase-order',
        undefined,
        'Review PO',
        { supplier: po.supplierId, total: po.total }
      ))
    }

    if (po.status === 'ordered' && po.expectedDelivery && po.expectedDelivery < now + (24 * 60 * 60 * 1000)) {
      const hoursUntilDelivery = Math.ceil((po.expectedDelivery - now) / (60 * 60 * 1000))
      notifications.push(generateNotification(
        'po-delivery-due',
        'medium',
        `Delivery Due: ${po.poNumber}`,
        `Expected delivery in ${hoursUntilDelivery} hour(s) from supplier.`,
        'procurement',
        po.id,
        'purchase-order',
        undefined,
        'View PO',
        { expectedDelivery: po.expectedDelivery, supplier: po.supplierId }
      ))
    }
  })

  return notifications
}

export const checkInvoiceAlerts = (invoices: Invoice[]): Notification[] => {
  const notifications: Notification[] = []

  invoices.forEach(inv => {
    if (inv.mismatches && inv.mismatches.length > 0) {
      const criticalMismatches = inv.mismatches.filter(m => m.severity === 'critical' || m.severity === 'high')
      if (criticalMismatches.length > 0) {
        notifications.push(generateNotification(
          'invoice-mismatch',
          'high',
          `Invoice Mismatch: ${inv.invoiceNumber}`,
          `Invoice has ${criticalMismatches.length} critical mismatch(es). Review required.`,
          'procurement',
          inv.id,
          'invoice',
          undefined,
          'Review',
          { mismatches: criticalMismatches.length, supplier: inv.supplierId }
        ))
      }
    }

    if (inv.dueDate && inv.status === 'validated') {
      const now = Date.now()
      const daysUntilDue = Math.ceil((inv.dueDate - now) / (24 * 60 * 60 * 1000))
      if (daysUntilDue <= 3 && daysUntilDue >= 0) {
        notifications.push(generateNotification(
          'payment-due',
          daysUntilDue === 0 ? 'critical' : 'high',
          `Payment Due: ${inv.invoiceNumber}`,
          `Payment due ${daysUntilDue === 0 ? 'today' : `in ${daysUntilDue} day(s)`} to ${inv.supplierName}.`,
          'procurement',
          inv.id,
          'invoice',
          undefined,
          'Process Payment',
          { dueDate: inv.dueDate, amount: inv.total, supplier: inv.supplierId }
        ))
      }
    }
  })

  return notifications
}

export const checkHousekeepingAlerts = (
  tasks: HousekeepingTask[],
  rooms: Room[]
): Notification[] => {
  const notifications: Notification[] = []
  const now = Date.now()

  const overdueTasks = tasks.filter(task => 
    task.status === 'pending' && 
    task.priority === 'urgent' &&
    task.createdAt < now - (2 * 60 * 60 * 1000)
  )

  if (overdueTasks.length > 0) {
    notifications.push(generateNotification(
      'housekeeping-task-overdue',
      'high',
      `${overdueTasks.length} Urgent Housekeeping Task(s) Overdue`,
      `${overdueTasks.length} urgent cleaning task(s) pending for over 2 hours.`,
      'housekeeping',
      undefined,
      'housekeeping-tasks',
      undefined,
      'View Tasks',
      { count: overdueTasks.length }
    ))
  }

  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance' || r.status === 'out-of-order')
  if (maintenanceRooms.length > 0) {
    notifications.push(generateNotification(
      'room-maintenance',
      'medium',
      `${maintenanceRooms.length} Room(s) Under Maintenance`,
      `${maintenanceRooms.length} room(s) currently unavailable for sale.`,
      'housekeeping',
      undefined,
      'rooms',
      undefined,
      'View Rooms',
      { count: maintenanceRooms.length, rooms: maintenanceRooms.map(r => r.roomNumber) }
    ))
  }

  return notifications
}

export const checkReservationAlerts = (reservations: Reservation[]): Notification[] => {
  const notifications: Notification[] = []
  const now = Date.now()
  const today = new Date(now).setHours(0, 0, 0, 0)
  const tomorrow = today + (24 * 60 * 60 * 1000)

  const checkInsToday = reservations.filter(r => 
    r.status === 'confirmed' &&
    r.checkInDate >= today &&
    r.checkInDate < tomorrow
  )

  const checkOutsToday = reservations.filter(r =>
    r.status === 'checked-in' &&
    r.checkOutDate >= today &&
    r.checkOutDate < tomorrow
  )

  if (checkInsToday.length > 0) {
    notifications.push(generateNotification(
      'guest-checkin-today',
      'medium',
      `${checkInsToday.length} Guest(s) Checking In Today`,
      `${checkInsToday.length} reservation(s) scheduled for check-in today.`,
      'front-office',
      undefined,
      'reservations',
      undefined,
      'View Arrivals',
      { count: checkInsToday.length }
    ))
  }

  if (checkOutsToday.length > 0) {
    notifications.push(generateNotification(
      'guest-checkout-today',
      'medium',
      `${checkOutsToday.length} Guest(s) Checking Out Today`,
      `${checkOutsToday.length} guest(s) scheduled for check-out today.`,
      'front-office',
      undefined,
      'reservations',
      undefined,
      'View Departures',
      { count: checkOutsToday.length }
    ))
  }

  return notifications
}

export const checkKitchenAlerts = (
  orders: Order[],
  foodItems: FoodItem[]
): Notification[] => {
  const notifications: Notification[] = []

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing')
  if (pendingOrders.length > 5) {
    notifications.push(generateNotification(
      'order-pending',
      'high',
      `${pendingOrders.length} Orders Pending`,
      `Kitchen has ${pendingOrders.length} orders in queue.`,
      'kitchen',
      undefined,
      'orders',
      undefined,
      'View Orders',
      { count: pendingOrders.length }
    ))
  }

  const criticalItems = foodItems.filter(f => f.currentStock <= f.reorderLevel * 0.5)
  if (criticalItems.length > 0) {
    notifications.push(generateNotification(
      'kitchen-inventory-low',
      'critical',
      `${criticalItems.length} Critical Kitchen Item(s)`,
      `${criticalItems.length} ingredient(s) critically low. May affect menu availability.`,
      'kitchen',
      undefined,
      'food-items',
      undefined,
      'View Inventory',
      { count: criticalItems.length, items: criticalItems.map(i => i.name) }
    ))
  }

  return notifications
}

export const checkHRAlerts = (leaveRequests: LeaveRequest[]): Notification[] => {
  const notifications: Notification[] = []

  const pendingLeaves = leaveRequests.filter(lr => lr.status === 'pending')
  if (pendingLeaves.length > 0) {
    notifications.push(generateNotification(
      'staff-leave-request',
      'medium',
      `${pendingLeaves.length} Leave Request(s) Pending`,
      `${pendingLeaves.length} employee leave request(s) require approval.`,
      'hr',
      undefined,
      'leave-requests',
      undefined,
      'Review Requests',
      { count: pendingLeaves.length }
    ))
  }

  return notifications
}

export const checkConstructionAlerts = (projects: ConstructionProject[]): Notification[] => {
  const notifications: Notification[] = []
  const now = Date.now()

  projects.forEach(project => {
    if (project.status === 'in-progress' && project.endDate && project.endDate < now) {
      const daysOverdue = Math.ceil((now - project.endDate) / (24 * 60 * 60 * 1000))
      notifications.push(generateNotification(
        'construction-project-delayed',
        'high',
        `Project Delayed: ${project.name}`,
        `Project is ${daysOverdue} day(s) overdue. Budget at ${project.completionPercentage}% completion.`,
        'construction',
        project.id,
        'project',
        undefined,
        'View Project',
        { daysOverdue, completionPercentage: project.completionPercentage }
      ))
    }

    if (project.actualCost > project.estimatedBudget * 0.9 && project.status === 'in-progress') {
      const budgetUsed = (project.actualCost / project.estimatedBudget) * 100
      notifications.push(generateNotification(
        'construction-project-delayed',
        'medium',
        `Project Budget Alert: ${project.name}`,
        `Project has used ${budgetUsed.toFixed(0)}% of estimated budget.`,
        'construction',
        project.id,
        'project',
        undefined,
        'View Project',
        { budgetUsed, actualCost: project.actualCost, estimatedBudget: project.estimatedBudget }
      ))
    }
  })

  return notifications
}

export const checkForecastAlerts = (forecasts: DemandForecast[]): Notification[] => {
  const notifications: Notification[] = []
  const now = Date.now()

  forecasts.forEach(forecast => {
    if (forecast.estimatedStockoutDate && forecast.estimatedStockoutDate < now + (7 * 24 * 60 * 60 * 1000)) {
      const daysUntilStockout = Math.ceil((forecast.estimatedStockoutDate - now) / (24 * 60 * 60 * 1000))
      notifications.push(generateNotification(
        'forecast-stockout-warning',
        daysUntilStockout <= 2 ? 'critical' : 'high',
        `Forecasted Stockout: ${forecast.itemName}`,
        `AI predicts stockout in ${daysUntilStockout} day(s). Suggested reorder: ${forecast.suggestedReorderQuantity} units.`,
        'forecasting',
        forecast.itemId,
        forecast.itemType,
        undefined,
        'Create PO',
        { 
          estimatedStockoutDate: forecast.estimatedStockoutDate,
          suggestedQuantity: forecast.suggestedReorderQuantity,
          confidence: forecast.confidence
        }
      ))
    }

    if (forecast.trendDirection === 'increasing' && forecast.trendPercent > 20) {
      notifications.push(generateNotification(
        'forecast-high-demand',
        'medium',
        `High Demand Forecasted: ${forecast.itemName}`,
        `AI forecasts ${forecast.trendPercent.toFixed(0)}% increase in demand. Consider increasing stock levels.`,
        'forecasting',
        forecast.itemId,
        forecast.itemType,
        undefined,
        'View Forecast',
        {
          trendPercent: forecast.trendPercent,
          forecastedDemand: forecast.forecastedDemand,
          confidence: forecast.confidence
        }
      ))
    }
  })

  return notifications
}

export const getNotificationIcon = (type: NotificationType): string => {
  const iconMap: Record<NotificationType, string> = {
    'inventory-low-stock': 'Package',
    'inventory-critical-stock': 'Warning',
    'inventory-expired': 'Warning',
    'inventory-expiring-soon': 'Clock',
    'requisition-pending': 'ClipboardText',
    'requisition-approved': 'CheckCircle',
    'requisition-rejected': 'XCircle',
    'po-pending-approval': 'ShoppingCart',
    'po-approved': 'CheckCircle',
    'po-delivery-due': 'Truck',
    'grn-received': 'Package',
    'invoice-mismatch': 'Warning',
    'payment-due': 'CurrencyDollar',
    'room-maintenance': 'Wrench',
    'room-ready': 'CheckCircle',
    'housekeeping-task-overdue': 'Clock',
    'guest-checkout-today': 'SignOut',
    'guest-checkin-today': 'SignIn',
    'order-pending': 'ForkKnife',
    'order-ready': 'CheckCircle',
    'kitchen-inventory-low': 'ChefHat',
    'recipe-cost-variance': 'ChartBar',
    'waste-high': 'Warning',
    'quality-check-failed': 'XCircle',
    'staff-leave-request': 'Users',
    'staff-shift-swap': 'ArrowsClockwise',
    'construction-project-delayed': 'Hammer',
    'construction-material-low': 'Hammer',
    'supplier-rating-low': 'TrendDown',
    'system-alert': 'Bell',
    'forecast-stockout-warning': 'Sparkle',
    'forecast-high-demand': 'TrendUp'
  }
  
  return iconMap[type] || 'Bell'
}

export const getNotificationColor = (priority: NotificationPriority): string => {
  const colorMap: Record<NotificationPriority, string> = {
    'low': 'text-muted-foreground',
    'medium': 'text-primary',
    'high': 'text-accent',
    'critical': 'text-destructive'
  }
  
  return colorMap[priority]
}

export const generateAllAlerts = (
  foodItems: FoodItem[],
  amenities: Amenity[],
  constructionMaterials: ConstructionMaterial[],
  generalProducts: GeneralProduct[],
  requisitions: Requisition[],
  purchaseOrders: PurchaseOrder[],
  invoices: Invoice[],
  housekeepingTasks: HousekeepingTask[],
  rooms: Room[],
  reservations: Reservation[],
  orders: Order[],
  leaveRequests: LeaveRequest[],
  projects: ConstructionProject[],
  forecasts: DemandForecast[]
): Notification[] => {
  return [
    ...checkInventoryAlerts(foodItems, amenities, constructionMaterials, generalProducts),
    ...checkProcurementAlerts(requisitions, purchaseOrders),
    ...checkInvoiceAlerts(invoices),
    ...checkHousekeepingAlerts(housekeepingTasks, rooms),
    ...checkReservationAlerts(reservations),
    ...checkKitchenAlerts(orders, foodItems),
    ...checkHRAlerts(leaveRequests),
    ...checkConstructionAlerts(projects),
    ...checkForecastAlerts(forecasts)
  ]
}
