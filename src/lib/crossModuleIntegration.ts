import type {
  Room,
  Reservation,
  Guest,
  Folio,
  GuestInvoice,
  Payment,
  Order,
  ExtraService,
  FolioExtraService,
  Employee,
  HousekeepingTask,
  InventoryItem,
  FoodItem,
  Amenity,
  Recipe,
  KitchenConsumptionLog,
  PurchaseOrder,
  Requisition,
  GoodsReceivedNote,
  Invoice,
  Supplier,
  GuestProfile,
  MarketingCampaign,
  ChannelReservation,
  OTAConnection,
  ConstructionProject,
  ConstructionMaterial,
  GeneralProduct,
  ActivityLog,
  SystemUser,
  RoomTypeConfig,
  RatePlanConfig,
  Season,
  EventDay,
  CorporateAccount,
  DemandForecast,
  RoomStatus
} from './types'

export interface CrossModuleData {
  guests?: Guest[]
  guestProfiles?: GuestProfile[]
  rooms?: Room[]
  reservations?: Reservation[]
  folios?: Folio[]
  guestInvoices?: GuestInvoice[]
  payments?: Payment[]
  orders?: Order[]
  extraServices?: ExtraService[]
  folioExtraServices?: FolioExtraService[]
  employees?: Employee[]
  housekeepingTasks?: HousekeepingTask[]
  inventory?: InventoryItem[]
  foodItems?: FoodItem[]
  amenities?: Amenity[]
  recipes?: Recipe[]
  consumptionLogs?: KitchenConsumptionLog[]
  purchaseOrders?: PurchaseOrder[]
  requisitions?: Requisition[]
  grns?: GoodsReceivedNote[]
  invoices?: Invoice[]
  suppliers?: Supplier[]
  campaigns?: MarketingCampaign[]
  channelReservations?: ChannelReservation[]
  otaConnections?: OTAConnection[]
  constructionProjects?: ConstructionProject[]
  constructionMaterials?: ConstructionMaterial[]
  generalProducts?: GeneralProduct[]
  activityLogs?: ActivityLog[]
  roomTypes?: RoomTypeConfig[]
  ratePlans?: RatePlanConfig[]
  seasons?: Season[]
  eventDays?: EventDay[]
  corporateAccounts?: CorporateAccount[]
  forecasts?: DemandForecast[]
}

export function getGuestDetails(guestId: string, data: CrossModuleData) {
  const guest = data.guests?.find(g => g.id === guestId)
  const profile = data.guestProfiles?.find(p => p.guestId === guestId)
  const reservations = data.reservations?.filter(r => r.guestId === guestId) || []
  const invoices = data.guestInvoices?.filter(i => i.guestId === guestId) || []
  const payments = data.payments?.filter(p => p.guestId === guestId) || []
  const orders = data.orders?.filter(o => o.guestId === guestId) || []
  
  const totalSpent = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0)
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const outstandingBalance = totalSpent - totalPaid
  
  return {
    guest,
    profile,
    reservations,
    invoices,
    payments,
    orders,
    totalSpent,
    totalPaid,
    outstandingBalance,
    reservationCount: reservations.length,
    averageSpend: reservations.length > 0 ? totalSpent / reservations.length : 0
  }
}

export function getRoomDetails(roomId: string, data: CrossModuleData) {
  const room = data.rooms?.find(r => r.id === roomId)
  const currentReservation = data.reservations?.find(
    r => r.roomId === roomId && r.status === 'confirmed' && 
    new Date(r.checkInDate) <= new Date() && 
    new Date(r.checkOutDate) >= new Date()
  )
  const housekeepingTasks = data.housekeepingTasks?.filter(t => t.roomId === roomId) || []
  const upcomingReservations = data.reservations?.filter(
    r => r.roomId === roomId && new Date(r.checkInDate) > new Date()
  ).sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime()) || []
  
  const pendingTasks = housekeepingTasks.filter(t => t.status === 'pending' || t.status === 'in-progress')
  
  return {
    room,
    currentReservation,
    currentGuest: currentReservation ? data.guests?.find(g => g.id === currentReservation.guestId) : undefined,
    housekeepingTasks,
    pendingTasks,
    upcomingReservations,
    nextReservation: upcomingReservations[0],
    isOccupied: !!currentReservation,
    needsCleaning: pendingTasks.length > 0
  }
}

export function getReservationDetails(reservationId: string, data: CrossModuleData) {
  const reservation = data.reservations?.find(r => r.id === reservationId)
  if (!reservation) return null
  
  const guest = data.guests?.find(g => g.id === reservation.guestId)
  const room = data.rooms?.find(r => r.id === reservation.roomId)
  const folio = data.folios?.find(f => f.reservationId === reservationId)
  const invoice = data.guestInvoices?.find(i => i.reservationIds?.includes(reservationId))
  const folioServices = data.folioExtraServices?.filter(fs => fs.folioId === folio?.id) || []
  const services = folioServices.map(fs => 
    data.extraServices?.find(s => s.id === fs.serviceId)
  ).filter(Boolean)
  const payments = data.payments?.filter(p => p.invoiceId === invoice?.id) || []
  
  const totalCharges = folio?.charges.reduce((sum, item) => sum + item.amount, 0) || 0
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const balance = totalCharges - totalPaid
  
  return {
    reservation,
    guest,
    room,
    folio,
    invoice,
    services,
    payments,
    totalCharges,
    totalPaid,
    balance,
    nightsStay: Math.ceil((new Date(reservation.checkOutDate).getTime() - new Date(reservation.checkInDate).getTime()) / (1000 * 60 * 60 * 24)),
    isPaid: balance <= 0,
    isOverdue: invoice && invoice.status !== 'posted' && invoice.status !== 'cancelled' && invoice.status !== 'refunded' && invoice.dueDate ? invoice.dueDate < Date.now() : false
  }
}

export function getSupplierDetails(supplierId: string, data: CrossModuleData) {
  const supplier = data.suppliers?.find(s => s.id === supplierId)
  const purchaseOrders = data.purchaseOrders?.filter(po => po.supplierId === supplierId) || []
  const invoices = data.invoices?.filter(inv => inv.supplierId === supplierId) || []
  const grns = data.grns?.filter(grn => {
    const po = data.purchaseOrders?.find(p => p.id === grn.purchaseOrderId)
    return po?.supplierId === supplierId
  }) || []
  
  const totalOrdered = purchaseOrders.reduce((sum, po) => sum + po.total, 0)
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0)
  const pendingOrders = purchaseOrders.filter(po => po.status === 'ordered' || po.status === 'approved')
  const overdueInvoices = invoices.filter(inv => 
    (inv.status === 'approved' || inv.status === 'overdue' || inv.status === 'partially-paid') && inv.dueDate && inv.dueDate < Date.now()
  )
  
  return {
    supplier,
    purchaseOrders,
    invoices,
    grns,
    totalOrdered,
    totalInvoiced,
    pendingOrders,
    overdueInvoices,
    orderCount: purchaseOrders.length,
    averageOrderValue: purchaseOrders.length > 0 ? totalOrdered / purchaseOrders.length : 0,
    onTimeDeliveryRate: calculateOnTimeDeliveryRate(grns, purchaseOrders)
  }
}

export function getInventoryStatus(data: CrossModuleData) {
  const foodItems = data.foodItems || []
  const amenities = data.amenities || []
  const constructionMaterials = data.constructionMaterials || []
  const generalProducts = data.generalProducts || []
  
  const lowStockFood = foodItems.filter(f => f.currentStock <= f.reorderLevel && f.currentStock > 0)
  const outOfStockFood = foodItems.filter(f => f.currentStock === 0)
  const expiringFood = foodItems.filter(f => f.expiryDate && f.expiryDate < Date.now() + 7 * 24 * 60 * 60 * 1000)
  
  const lowStockAmenities = amenities.filter(a => a.currentStock <= a.reorderLevel && a.currentStock > 0)
  const outOfStockAmenities = amenities.filter(a => a.currentStock === 0)
  
  const lowStockMaterials = constructionMaterials.filter(m => m.currentStock <= m.reorderLevel && m.currentStock > 0)
  const outOfStockMaterials = constructionMaterials.filter(m => m.currentStock === 0)
  
  const lowStockProducts = generalProducts.filter(p => p.currentStock <= p.reorderLevel && p.currentStock > 0)
  const outOfStockProducts = generalProducts.filter(p => p.currentStock === 0)
  
  const totalValue = 
    foodItems.reduce((sum, f) => sum + (f.currentStock * f.unitCost), 0) +
    amenities.reduce((sum, a) => sum + (a.currentStock * a.unitCost), 0) +
    constructionMaterials.reduce((sum, m) => sum + (m.currentStock * m.unitCost), 0) +
    generalProducts.reduce((sum, p) => sum + (p.currentStock * p.unitCost), 0)
  
  return {
    food: {
      total: foodItems.length,
      lowStock: lowStockFood.length,
      outOfStock: outOfStockFood.length,
      expiring: expiringFood.length,
      items: foodItems,
      value: foodItems.reduce((sum, f) => sum + (f.currentStock * f.unitCost), 0)
    },
    amenities: {
      total: amenities.length,
      lowStock: lowStockAmenities.length,
      outOfStock: outOfStockAmenities.length,
      items: amenities,
      value: amenities.reduce((sum, a) => sum + (a.currentStock * a.unitCost), 0)
    },
    materials: {
      total: constructionMaterials.length,
      lowStock: lowStockMaterials.length,
      outOfStock: outOfStockMaterials.length,
      items: constructionMaterials,
      value: constructionMaterials.reduce((sum, m) => sum + (m.currentStock * m.unitCost), 0)
    },
    products: {
      total: generalProducts.length,
      lowStock: lowStockProducts.length,
      outOfStock: outOfStockProducts.length,
      items: generalProducts,
      value: generalProducts.reduce((sum, p) => sum + (p.currentStock * p.unitCost), 0)
    },
    totalValue,
    totalItems: foodItems.length + amenities.length + constructionMaterials.length + generalProducts.length,
    totalLowStock: lowStockFood.length + lowStockAmenities.length + lowStockMaterials.length + lowStockProducts.length,
    totalOutOfStock: outOfStockFood.length + outOfStockAmenities.length + outOfStockMaterials.length + outOfStockProducts.length
  }
}

export function getEmployeeDetails(employeeId: string, data: CrossModuleData) {
  const employee = data.employees?.find(e => e.id === employeeId)
  const housekeepingTasks = data.housekeepingTasks?.filter(t => t.assignedTo === employeeId) || []
  const completedTasks = housekeepingTasks.filter(t => t.status === 'completed')
  const pendingTasks = housekeepingTasks.filter(t => t.status === 'pending' || t.status === 'in-progress')
  
  return {
    employee,
    housekeepingTasks,
    completedTasks,
    pendingTasks,
    completionRate: housekeepingTasks.length > 0 ? (completedTasks.length / housekeepingTasks.length) * 100 : 0,
    averageTaskTime: calculateAverageTaskTime(completedTasks)
  }
}

export function getRevenueBreakdown(data: CrossModuleData) {
  const roomRevenue = data.guestInvoices?.reduce((sum, inv) => {
    const roomCharges = inv.lineItems.filter(li => li.itemType === 'room-charge')
    return sum + roomCharges.reduce((s, li) => s + li.lineTotal, 0)
  }, 0) || 0
  
  const fnbRevenue = data.orders?.reduce((sum, order) => sum + order.total, 0) || 0
  
  const extraServicesRevenue = data.guestInvoices?.reduce((sum, inv) => {
    const serviceCharges = inv.lineItems.filter(li => li.itemType === 'extra-service')
    return sum + serviceCharges.reduce((s, li) => s + li.lineTotal, 0)
  }, 0) || 0
  
  const otherRevenue = data.guestInvoices?.reduce((sum, inv) => {
    const otherCharges = inv.lineItems.filter(li => li.itemType === 'misc')
    return sum + otherCharges.reduce((s, li) => s + li.lineTotal, 0)
  }, 0) || 0
  
  const totalRevenue = roomRevenue + fnbRevenue + extraServicesRevenue + otherRevenue
  
  return {
    room: roomRevenue,
    fnb: fnbRevenue,
    extraServices: extraServicesRevenue,
    other: otherRevenue,
    total: totalRevenue,
    breakdown: {
      roomPercentage: totalRevenue > 0 ? (roomRevenue / totalRevenue) * 100 : 0,
      fnbPercentage: totalRevenue > 0 ? (fnbRevenue / totalRevenue) * 100 : 0,
      extraServicesPercentage: totalRevenue > 0 ? (extraServicesRevenue / totalRevenue) * 100 : 0,
      otherPercentage: totalRevenue > 0 ? (otherRevenue / totalRevenue) * 100 : 0
    }
  }
}

export function getOccupancyMetrics(data: CrossModuleData) {
  const rooms = data.rooms || []
  const reservations = data.reservations || []
  
  const totalRooms = rooms.length
  const occupiedRooms = rooms.filter(r => r.status === 'occupied-clean' || r.status === 'occupied-dirty').length
  const availableRooms = rooms.filter(r => r.status === 'vacant-clean').length
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance' || r.status === 'out-of-order').length
  const cleaningRooms = rooms.filter(r => r.status === 'vacant-dirty').length
  
  const today = new Date()
  const todayReservations = reservations.filter(r => {
    const checkIn = new Date(r.checkInDate)
    const checkOut = new Date(r.checkOutDate)
    return checkIn <= today && checkOut >= today && r.status === 'confirmed'
  })
  
  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0
  const availabilityRate = totalRooms > 0 ? (availableRooms / totalRooms) * 100 : 0
  
  return {
    totalRooms,
    occupiedRooms,
    availableRooms,
    maintenanceRooms,
    cleaningRooms,
    occupancyRate,
    availabilityRate,
    todayReservations: todayReservations.length,
    expectedCheckIns: reservations.filter(r => 
      new Date(r.checkInDate).toDateString() === today.toDateString() && r.status === 'confirmed'
    ).length,
    expectedCheckOuts: reservations.filter(r => 
      new Date(r.checkOutDate).toDateString() === today.toDateString() && r.status === 'confirmed'
    ).length
  }
}

export function getKitchenOperationsStatus(data: CrossModuleData) {
  const recipes = data.recipes || []
  const consumptionLogs = data.consumptionLogs || []
  const orders = data.orders || []
  const foodItems = data.foodItems || []
  
  const activeRecipes = recipes.filter(r => r.isActive)
  const todayConsumption = consumptionLogs.filter(log => {
    const logDate = new Date(log.producedAt)
    return logDate.toDateString() === new Date().toDateString()
  })
  
  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt)
    return orderDate.toDateString() === new Date().toDateString()
  })
  
  const lowStockIngredients = foodItems.filter(f => f.currentStock <= f.reorderLevel)
  const criticalIngredients = foodItems.filter(f => f.currentStock === 0)
  
  return {
    activeRecipes: activeRecipes.length,
    totalRecipes: recipes.length,
    todayConsumption: todayConsumption.length,
    todayOrders: todayOrders.length,
    lowStockIngredients: lowStockIngredients.length,
    criticalIngredients: criticalIngredients.length,
    orderValue: todayOrders.reduce((sum, o) => sum + o.total, 0)
  }
}

export function getProcurementStatus(data: CrossModuleData) {
  const requisitions = data.requisitions || []
  const purchaseOrders = data.purchaseOrders || []
  const grns = data.grns || []
  const invoices = data.invoices || []
  
  const pendingRequisitions = requisitions.filter(r => r.status === 'pending-approval')
  const approvedRequisitions = requisitions.filter(r => r.status === 'approved')
  
  const draftPOs = purchaseOrders.filter(po => po.status === 'draft')
  const sentPOs = purchaseOrders.filter(po => po.status === 'ordered')
  const completedPOs = purchaseOrders.filter(po => po.status === 'received' || po.status === 'closed')
  
  const pendingGRNs = grns.filter(g => !g.qualityCheckStatus || g.qualityCheckStatus === 'partial')
  const completedGRNs = grns.filter(g => g.qualityCheckStatus === 'passed')
  
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending-validation')
  const approvedInvoices = invoices.filter(inv => inv.status === 'approved')
  const paidInvoices = invoices.filter(inv => inv.status === 'paid')
  
  const totalPOValue = purchaseOrders.reduce((sum, po) => sum + po.total, 0)
  const totalInvoiceValue = invoices.reduce((sum, inv) => sum + inv.total, 0)
  
  return {
    requisitions: {
      total: requisitions.length,
      pending: pendingRequisitions.length,
      approved: approvedRequisitions.length
    },
    purchaseOrders: {
      total: purchaseOrders.length,
      draft: draftPOs.length,
      sent: sentPOs.length,
      completed: completedPOs.length,
      totalValue: totalPOValue
    },
    grns: {
      total: grns.length,
      pending: pendingGRNs.length,
      completed: completedGRNs.length
    },
    invoices: {
      total: invoices.length,
      pending: pendingInvoices.length,
      approved: approvedInvoices.length,
      paid: paidInvoices.length,
      totalValue: totalInvoiceValue
    }
  }
}

export function getChannelManagerStatus(data: CrossModuleData) {
  const connections = data.otaConnections || []
  const channelReservations = data.channelReservations || []
  
  const activeConnections = connections.filter(c => c.status === 'connected')
  const syncingConnections = connections.filter(c => c.status === 'syncing')
  const errorConnections = connections.filter(c => c.status === 'error')
  
  const todayReservations = channelReservations.filter(r => {
    const checkInDate = new Date(r.checkInDate)
    return checkInDate.toDateString() === new Date().toDateString()
  })
  
  const channelBreakdown = connections.map(conn => {
    const connReservations = channelReservations.filter(r => r.channel === conn.channel)
    return {
      channel: conn.name,
      reservations: connReservations.length,
      revenue: connReservations.reduce((sum, r) => sum + r.totalAmount, 0)
    }
  })
  
  return {
    totalConnections: connections.length,
    activeConnections: activeConnections.length,
    syncingConnections: syncingConnections.length,
    errorConnections: errorConnections.length,
    totalReservations: channelReservations.length,
    todayReservations: todayReservations.length,
    channelBreakdown,
    totalRevenue: channelReservations.reduce((sum, r) => sum + r.totalAmount, 0)
  }
}

export function getFinancialSummary(data: CrossModuleData) {
  const guestInvoices = data.guestInvoices || []
  const payments = data.payments || []
  const invoices = data.invoices || []
  
  const totalRevenue = guestInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0)
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const accountsReceivable = guestInvoices.reduce((sum, inv) => sum + inv.amountDue, 0)
  const accountsPayable = invoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.total, 0)
  
  const overdueReceivables = guestInvoices.filter(inv => 
    inv.dueDate && inv.dueDate < Date.now() && inv.status !== 'posted' && inv.status !== 'cancelled' && inv.status !== 'refunded'
  )
  
  const overduePayables = invoices.filter(inv => 
    (inv.status === 'approved' || inv.status === 'overdue' || inv.status === 'partially-paid') && inv.dueDate && inv.dueDate < Date.now()
  )
  
  return {
    revenue: {
      total: totalRevenue,
      paid: totalPaid,
      outstanding: accountsReceivable
    },
    payables: {
      total: accountsPayable,
      overdue: overduePayables.reduce((sum, inv) => sum + inv.total, 0),
      count: invoices.filter(inv => inv.status !== 'paid').length
    },
    receivables: {
      total: accountsReceivable,
      overdue: overdueReceivables.reduce((sum, inv) => sum + inv.amountDue, 0),
      count: overdueReceivables.length
    },
    netPosition: totalRevenue - accountsPayable,
    cashFlow: totalPaid - payments.filter(p => p.supplierId).reduce((sum, p) => sum + p.amount, 0)
  }
}

export function logActivity(
  userId: string,
  user: SystemUser,
  action: string,
  resourceType: string,
  resourceId: string,
  details: string,
  activityLogs: ActivityLog[],
  setActivityLogs: (logs: ActivityLog[] | ((prev: ActivityLog[]) => ActivityLog[])) => void
) {
  const newLog: ActivityLog = {
    id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    username: `${user.firstName} ${user.lastName}`,
    userRole: user.role,
    action: action as any,
    activityType: 'update' as any,
    resource: resourceType as any,
    resourceId,
    details,
    timestamp: Date.now(),
    ipAddress: '0.0.0.0'
  }
  
  setActivityLogs((prev) => [newLog, ...prev])
}

function calculateOnTimeDeliveryRate(grns: GoodsReceivedNote[], pos: PurchaseOrder[]): number {
  if (grns.length === 0) return 100
  
  const onTimeDeliveries = grns.filter(grn => {
    const po = pos.find(p => p.id === grn.purchaseOrderId)
    if (!po || !po.expectedDelivery) return true
    return grn.receivedAt <= po.expectedDelivery
  })
  
  return (onTimeDeliveries.length / grns.length) * 100
}

function calculateAverageTaskTime(tasks: HousekeepingTask[]): number {
  if (tasks.length === 0) return 0
  
  const completedWithTime = tasks.filter(t => t.completedAt && t.createdAt)
  if (completedWithTime.length === 0) return 0
  
  const totalTime = completedWithTime.reduce((sum, t) => {
    return sum + (t.completedAt! - t.createdAt)
  }, 0)
  
  return totalTime / completedWithTime.length / (1000 * 60)
}

export function syncReservationWithRoom(
  reservation: Reservation,
  rooms: Room[],
  setRooms: (rooms: Room[] | ((prev: Room[]) => Room[])) => void
) {
  const today = new Date()
  const checkIn = new Date(reservation.checkInDate)
  const checkOut = new Date(reservation.checkOutDate)
  
  if (reservation.status === 'confirmed' && checkIn <= today && checkOut >= today) {
    setRooms(currentRooms =>
      currentRooms.map(r =>
        r.id === reservation.roomId ? { ...r, status: 'occupied-clean' as const } : r
      )
    )
  } else if (reservation.status === 'checked-out' || reservation.status === 'cancelled') {
    setRooms(currentRooms =>
      currentRooms.map(r =>
        r.id === reservation.roomId ? { ...r, status: 'vacant-dirty' as const } : r
      )
    )
  }
}

export function syncInventoryWithConsumption(
  consumptionLog: KitchenConsumptionLog,
  foodItems: FoodItem[],
  setFoodItems: (items: FoodItem[] | ((prev: FoodItem[]) => FoodItem[])) => void
) {
  consumptionLog.ingredients.forEach(item => {
    setFoodItems(currentItems =>
      currentItems.map(fi =>
        fi.id === item.foodItemId
          ? { ...fi, currentStock: Math.max(0, fi.currentStock - (item as any).actualQuantityUsed ?? item.actualQuantity ?? item.plannedQuantity) }
          : fi
      )
    )
  })
}

export function syncInventoryWithGRN(
  grn: GoodsReceivedNote,
  foodItems: FoodItem[],
  setFoodItems: (items: FoodItem[] | ((prev: FoodItem[]) => FoodItem[])) => void,
  amenities: Amenity[],
  setAmenities: (items: Amenity[] | ((prev: Amenity[]) => Amenity[])) => void,
  materials: ConstructionMaterial[],
  setMaterials: (items: ConstructionMaterial[] | ((prev: ConstructionMaterial[]) => ConstructionMaterial[])) => void,
  products: GeneralProduct[],
  setProducts: (items: GeneralProduct[] | ((prev: GeneralProduct[]) => GeneralProduct[])) => void
) {
  // TODO: This is a simplified implementation that tries to update all inventory types
  // A better approach would be to add itemType to GRNItem or maintain separate item collections
  // For now, this works because IDs are unique across all inventory types
  // Each setState call is safe - it only updates if ID matches, otherwise returns unchanged
  grn.items.forEach(item => {
    // Try to update food items (will only update if ID matches a food item)
    setFoodItems(currentItems =>
      currentItems.map(fi =>
        fi.id === item.inventoryItemId
          ? { ...fi, currentStock: fi.currentStock + item.receivedQuantity }
          : fi
      )
    )
    // Try to update amenities (will only update if ID matches an amenity)
    setAmenities(currentItems =>
      currentItems.map(a =>
        a.id === item.inventoryItemId
          ? { ...a, currentStock: a.currentStock + item.receivedQuantity }
          : a
      )
    )
    // Try to update materials (will only update if ID matches a material)
    setMaterials(currentItems =>
      currentItems.map(m =>
        m.id === item.inventoryItemId
          ? { ...m, currentStock: m.currentStock + item.receivedQuantity }
          : m
      )
    )
    // Try to update products (will only update if ID matches a product)
    setProducts(currentItems =>
      currentItems.map(p =>
        p.id === item.inventoryItemId
          ? { ...p, currentStock: p.currentStock + item.receivedQuantity }
          : p
      )
    )
  })
}

export function createFolioFromReservation(
  reservation: Reservation,
  guest: Guest,
  room: Room
): Folio {
  const nightsStay = Math.ceil(
    (new Date(reservation.checkOutDate).getTime() - new Date(reservation.checkInDate).getTime()) / 
    (1000 * 60 * 60 * 24)
  )
  
  const roomCharge = reservation.totalAmount / nightsStay
  
  const lineItems = Array.from({ length: nightsStay }, (_, i) => {
    const date = new Date(reservation.checkInDate)
    date.setDate(date.getDate() + i)
    
    return {
      id: `folio-item-${Date.now()}-${i}`,
      folioId: '',
      date: date.getTime(),
      description: `Room ${room.roomNumber} - ${room.roomType}`,
      quantity: 1,
      unitPrice: roomCharge,
      amount: roomCharge,
      department: 'front-office' as const,
      timestamp: date.getTime(),
      postedBy: 'system',
    }
  })
  
  return {
    id: `folio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    reservationId: reservation.id,
    guestId: guest.id,
    charges: lineItems,
    payments: [],
    balance: reservation.totalAmount,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
}
