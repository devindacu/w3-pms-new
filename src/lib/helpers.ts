import { 
  type Room, 
  type RoomStatus, 
  type Reservation, 
  type Folio, 
  type InventoryItem,
  type HousekeepingTask,
  type Order,
  type MaintenanceRequest,
  type DashboardMetrics,
  type FoodItem,
  type FoodCategory,
  type OrderFrequency,
  type QualityStatus,
  type SystemRole,
  type SystemUser,
  type UserPermission,
  type PermissionAction,
  type PermissionResource,
  type ActivityLog,
  type ActivityType
} from './types'

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function generateNumber(prefix: string): string {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatDate(timestamp: number | undefined): string {
  if (!timestamp || isNaN(timestamp)) return 'N/A'
  const date = new Date(timestamp)
  if (isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function formatDateTime(timestamp: number | undefined): string {
  if (!timestamp || isNaN(timestamp)) return 'N/A'
  const date = new Date(timestamp)
  if (isNaN(date.getTime())) return 'N/A'
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatTime(timestamp: number | undefined): string {
  if (!timestamp || isNaN(timestamp)) return 'N/A'
  const date = new Date(timestamp)
  if (isNaN(date.getTime())) return 'N/A'
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }
  return ((current - previous) / previous) * 100
}

export function formatPercentageChange(current: number, previous: number): string {
  const change = calculatePercentageChange(current, previous)
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}%`
}

export function calculateNights(checkIn: number, checkOut: number): number {
  const diffMs = checkOut - checkIn
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export function calculateOccupancyRate(occupied: number, total: number): number {
  if (total === 0) return 0
  return Math.round((occupied / total) * 100)
}

export function calculateFolioBalance(folio: Folio): number {
  const totalCharges = folio.charges.reduce((sum, charge) => sum + (charge.amount * charge.quantity), 0)
  const totalPayments = folio.payments
    .filter(p => p.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0)
  return totalCharges - totalPayments
}

export function calculateInventoryValue(items: InventoryItem[]): number {
  return items.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0)
}

export function calculateOrderTotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
}

export function getRoomStatusColor(status: RoomStatus): string {
  const colors = {
    'vacant-clean': 'bg-success text-success-foreground',
    'vacant-dirty': 'bg-accent text-accent-foreground',
    'occupied-clean': 'bg-primary text-primary-foreground',
    'occupied-dirty': 'bg-secondary text-secondary-foreground',
    'maintenance': 'bg-muted text-muted-foreground',
    'out-of-order': 'bg-destructive text-destructive-foreground'
  }
  return colors[status]
}

export function getRoomStatusIcon(status: RoomStatus): string {
  const icons = {
    'vacant-clean': 'CheckCircle',
    'vacant-dirty': 'Warning',
    'occupied-clean': 'User',
    'occupied-dirty': 'UserCircle',
    'maintenance': 'Wrench',
    'out-of-order': 'XCircle'
  }
  return icons[status]
}

export function getStockStatusColor(item: InventoryItem): string {
  if (item.currentStock === 0) return 'text-destructive'
  if (item.currentStock <= item.reorderLevel) return 'text-accent'
  return 'text-success'
}

export function getStockStatus(item: InventoryItem): string {
  if (item.currentStock === 0) return 'out-of-stock'
  if (item.currentStock <= item.reorderLevel) return 'low-stock'
  return 'in-stock'
}

export function isExpiringSoon(expiryDate: number | undefined, daysThreshold: number = 7): boolean {
  if (!expiryDate) return false
  const daysUntilExpiry = Math.ceil((expiryDate - Date.now()) / (1000 * 60 * 60 * 24))
  return daysUntilExpiry <= daysThreshold && daysUntilExpiry >= 0
}

export function isExpired(expiryDate: number | undefined): boolean {
  if (!expiryDate) return false
  return Date.now() > expiryDate
}

export function getDaysUntilExpiry(expiryDate: number | undefined): number | null {
  if (!expiryDate) return null
  const diff = expiryDate - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function filterRoomsByStatus(rooms: Room[], status?: RoomStatus): Room[] {
  if (!status) return rooms
  return rooms.filter(r => r.status === status)
}

export function filterRoomsByType(rooms: Room[], type?: string): Room[] {
  if (!type) return rooms
  return rooms.filter(r => r.roomType === type)
}

export function sortRoomsByNumber(rooms: Room[]): Room[] {
  return [...rooms].sort((a, b) => {
    const numA = parseInt(a.roomNumber)
    const numB = parseInt(b.roomNumber)
    return numA - numB
  })
}

export function getAvailableRooms(
  rooms: Room[], 
  reservations: Reservation[], 
  checkIn: number, 
  checkOut: number
): Room[] {
  const occupiedRoomIds = reservations
    .filter(r => 
      r.status === 'confirmed' || r.status === 'checked-in'
    )
    .filter(r => {
      return !(checkOut <= r.checkInDate || checkIn >= r.checkOutDate)
    })
    .map(r => r.roomId)
    .filter((id): id is string => id !== undefined)

  return rooms.filter(room => 
    !occupiedRoomIds.includes(room.id) && 
    (room.status === 'vacant-clean' || room.status === 'vacant-dirty')
  )
}

export function calculateHousekeepingWorkload(tasks: HousekeepingTask[], housekeeperId: string): number {
  return tasks.filter(t => 
    t.assignedTo === housekeeperId && 
    (t.status === 'pending' || t.status === 'in-progress')
  ).length
}

export function getPriorityColor(priority: string): string {
  const colors = {
    low: 'text-muted-foreground',
    normal: 'text-foreground',
    medium: 'text-primary',
    high: 'text-accent',
    urgent: 'text-destructive'
  }
  return colors[priority as keyof typeof colors] || colors.normal
}

export function formatGuestName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`
}

export function searchGuests(guests: any[], searchTerm: string): any[] {
  const term = searchTerm.toLowerCase()
  return guests.filter(g => 
    g.firstName.toLowerCase().includes(term) ||
    g.lastName.toLowerCase().includes(term) ||
    g.email?.toLowerCase().includes(term) ||
    g.phone.includes(term)
  )
}

export function searchInventory(items: InventoryItem[], searchTerm: string): InventoryItem[] {
  const term = searchTerm.toLowerCase()
  return items.filter(i => 
    i.name.toLowerCase().includes(term) ||
    i.category.toLowerCase().includes(term)
  )
}

export function calculateDashboardMetrics(
  rooms: Room[],
  reservations: Reservation[],
  housekeepingTasks: HousekeepingTask[],
  orders: Order[],
  inventory: InventoryItem[],
  maintenanceRequests: MaintenanceRequest[]
): DashboardMetrics {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStart = today.getTime()
  const todayEnd = todayStart + 24 * 60 * 60 * 1000

  const occupiedRooms = rooms.filter(r => r.status === 'occupied-clean' || r.status === 'occupied-dirty')
  const availableRooms = rooms.filter(r => r.status === 'vacant-clean')
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance' || r.status === 'out-of-order')
  
  const todayOrders = orders.filter(o => o.createdAt >= todayStart && o.createdAt < todayEnd)
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0)

  const lowStockItems = inventory.filter(i => i.currentStock <= i.reorderLevel && i.currentStock > 0)
  const expiringItems = inventory.filter(i => isExpiringSoon(i.expiryDate, 7))
  const inventoryValue = calculateInventoryValue(inventory)

  const openRequests = maintenanceRequests.filter(r => 
    r.status === 'scheduled' || r.status === 'in-progress'
  )
  const urgentRequests = openRequests.filter(r => r.priority === 'urgent')

  return {
    occupancy: {
      current: occupiedRooms.length,
      available: availableRooms.length,
      occupied: occupiedRooms.length,
      maintenance: maintenanceRooms.length,
      rate: calculateOccupancyRate(occupiedRooms.length, rooms.length)
    },
    revenue: {
      today: todayRevenue,
      month: 0,
      lastMonth: 0,
      growth: 0
    },
    housekeeping: {
      cleanRooms: rooms.filter(r => r.status === 'vacant-clean' || r.status === 'occupied-clean').length,
      dirtyRooms: rooms.filter(r => r.status === 'vacant-dirty' || r.status === 'occupied-dirty').length,
      pendingTasks: housekeepingTasks.filter(t => t.status === 'pending').length
    },
    fnb: {
      ordersToday: todayOrders.length,
      revenueToday: todayRevenue,
      averageOrderValue: todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0
    },
    inventory: {
      lowStockItems: lowStockItems.length,
      expiringItems: expiringItems.length,
      totalValue: inventoryValue
    },
    maintenance: {
      openRequests: openRequests.length,
      urgent: urgentRequests.length,
      avgResolutionTime: 0
    }
  }
}

export function calculateHistoricalComparison(orders: Order[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStart = today.getTime()
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000
  const yesterdayEnd = todayStart
  const todayEnd = todayStart + 24 * 60 * 60 * 1000

  const todayOrders = orders.filter(o => o.createdAt >= todayStart && o.createdAt < todayEnd)
  const yesterdayOrders = orders.filter(o => o.createdAt >= yesterdayStart && o.createdAt < yesterdayEnd)

  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0)
  const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + o.total, 0)

  const todayAvgOrder = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0
  const yesterdayAvgOrder = yesterdayOrders.length > 0 ? yesterdayRevenue / yesterdayOrders.length : 0

  return {
    today: {
      orders: todayOrders.length,
      revenue: todayRevenue,
      avgOrder: todayAvgOrder
    },
    yesterday: {
      orders: yesterdayOrders.length,
      revenue: yesterdayRevenue,
      avgOrder: yesterdayAvgOrder
    }
  }
}

export function getFoodCategoryColor(category: FoodCategory): string {
  const colors = {
    'perishable': 'bg-destructive/10 text-destructive border-destructive/20',
    'non-perishable': 'bg-success/10 text-success border-success/20',
    'frozen': 'bg-primary/10 text-primary border-primary/20',
    'beverage': 'bg-accent/10 text-accent border-accent/20',
    'spices': 'bg-secondary/10 text-secondary border-secondary/20',
    'dairy': 'bg-destructive/10 text-destructive border-destructive/20',
    'meat': 'bg-destructive/10 text-destructive border-destructive/20',
    'vegetables': 'bg-success/10 text-success border-success/20',
    'fruits': 'bg-success/10 text-success border-success/20',
    'bakery': 'bg-accent/10 text-accent border-accent/20',
    'dry-goods': 'bg-secondary/10 text-secondary border-secondary/20'
  }
  return colors[category] || 'bg-muted text-muted-foreground'
}

export function getOrderFrequencyColor(frequency: OrderFrequency): string {
  const colors = {
    'daily': 'bg-destructive text-destructive-foreground',
    'weekly': 'bg-accent text-accent-foreground',
    'monthly': 'bg-secondary text-secondary-foreground',
    'on-demand': 'bg-muted text-muted-foreground'
  }
  return colors[frequency]
}

export function getQualityStatusColor(status: QualityStatus): string {
  const colors = {
    'excellent': 'bg-success text-success-foreground',
    'good': 'bg-primary text-primary-foreground',
    'fair': 'bg-accent text-accent-foreground',
    'poor': 'bg-destructive text-destructive-foreground',
    'rejected': 'bg-destructive text-destructive-foreground'
  }
  return colors[status]
}

export function getFoodStockStatus(item: FoodItem): { status: string; color: string; urgent: boolean } {
  if (item.currentStock === 0) {
    return { status: 'out-of-stock', color: 'text-destructive', urgent: true }
  }
  
  if (item.expiryDate && isExpired(item.expiryDate)) {
    return { status: 'expired', color: 'text-destructive', urgent: true }
  }
  
  if (item.expiryDate && isExpiringSoon(item.expiryDate, 3)) {
    return { status: 'expiring-soon', color: 'text-destructive', urgent: true }
  }
  
  if (item.currentStock <= item.reorderLevel) {
    return { status: 'low-stock', color: 'text-accent', urgent: true }
  }
  
  return { status: 'in-stock', color: 'text-success', urgent: false }
}

export function calculateFoodInventoryValue(items: FoodItem[]): number {
  return items.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0)
}

export function searchFoodItems(items: FoodItem[], searchTerm: string): FoodItem[] {
  const term = searchTerm.toLowerCase()
  return items.filter(i => 
    i.name.toLowerCase().includes(term) ||
    i.category.toLowerCase().includes(term) ||
    i.foodId.toLowerCase().includes(term)
  )
}

export function filterFoodByCategory(items: FoodItem[], category?: FoodCategory): FoodItem[] {
  if (!category) return items
  return items.filter(i => i.category === category)
}

export function filterFoodByFrequency(items: FoodItem[], frequency?: OrderFrequency): FoodItem[] {
  if (!frequency) return items
  return items.filter(i => i.orderFrequency === frequency)
}

export function filterFoodByStatus(items: FoodItem[], status?: string): FoodItem[] {
  if (!status) return items
  return items.filter(i => {
    const itemStatus = getFoodStockStatus(i)
    return itemStatus.status === status
  })
}

export function getUrgentFoodItems(items: FoodItem[]): FoodItem[] {
  return items.filter(i => getFoodStockStatus(i).urgent)
}

export function getExpiringFoodItems(items: FoodItem[], daysThreshold: number = 7): FoodItem[] {
  return items.filter(i => 
    i.expiryDate && isExpiringSoon(i.expiryDate, daysThreshold) && !isExpired(i.expiryDate)
  )
}

export function getExpiredFoodItems(items: FoodItem[]): FoodItem[] {
  return items.filter(i => i.expiryDate && isExpired(i.expiryDate))
}

export function getAmenityCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'toiletries': 'bg-primary/10 text-primary border-primary/20',
    'linens': 'bg-accent/10 text-accent border-accent/20',
    'cleaning-supplies': 'bg-success/10 text-success border-success/20',
    'beverages': 'bg-secondary/10 text-secondary border-secondary/20',
    'food-items': 'bg-destructive/10 text-destructive border-destructive/20',
    'paper-products': 'bg-muted text-muted-foreground border-border',
    'room-supplies': 'bg-primary/10 text-primary border-primary/20',
    'public-area-supplies': 'bg-accent/10 text-accent border-accent/20',
    'laundry-supplies': 'bg-success/10 text-success border-success/20',
    'guest-amenities': 'bg-secondary/10 text-secondary border-secondary/20'
  }
  return colors[category] || 'bg-muted text-muted-foreground'
}

export function getAmenityStockStatus(amenity: { currentStock: number; reorderLevel: number; parLevel: number }): { status: string; color: string; urgent: boolean } {
  if (amenity.currentStock === 0) {
    return { status: 'out-of-stock', color: 'text-destructive', urgent: true }
  }
  
  if (amenity.currentStock <= amenity.reorderLevel) {
    return { status: 'low-stock', color: 'text-accent', urgent: true }
  }
  
  if (amenity.currentStock < amenity.parLevel * 0.5) {
    return { status: 'below-par', color: 'text-accent', urgent: false }
  }
  
  return { status: 'in-stock', color: 'text-success', urgent: false }
}

export function calculateAmenityInventoryValue(items: { currentStock: number; unitCost: number }[]): number {
  return items.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0)
}

export function searchAmenities(items: any[], searchTerm: string): any[] {
  const term = searchTerm.toLowerCase()
  return items.filter((i: any) => 
    i.name.toLowerCase().includes(term) ||
    i.category.toLowerCase().includes(term) ||
    i.amenityId.toLowerCase().includes(term) ||
    (i.department && i.department.some((d: string) => d.toLowerCase().includes(term)))
  )
}

export function filterAmenitiesByCategory(items: any[], category?: string): any[] {
  if (!category) return items
  return items.filter((i: any) => i.category === category)
}

export function filterAmenitiesByDepartment(items: any[], department?: string): any[] {
  if (!department) return items
  return items.filter((i: any) => i.department.includes(department))
}

export function filterAmenitiesByStatus(items: any[], status?: string): any[] {
  if (!status) return items
  return items.filter((i: any) => {
    const itemStatus = getAmenityStockStatus(i)
    return itemStatus.status === status
  })
}

export function getUrgentAmenities(items: any[]): any[] {
  return items.filter((i: any) => getAmenityStockStatus(i).urgent)
}

export function getDaysUntilReorder(amenity: { currentStock: number; usageRatePerDay: number; reorderLevel: number }): number {
  if (amenity.usageRatePerDay === 0) return 999
  const daysToReorder = (amenity.currentStock - amenity.reorderLevel) / amenity.usageRatePerDay
  return Math.max(0, Math.floor(daysToReorder))
}

export function calculateAutoReorderQuantity(amenity: { reorderQuantity: number; parLevel: number; currentStock: number }): number {
  const needed = amenity.parLevel - amenity.currentStock
  return Math.max(amenity.reorderQuantity, needed)
}

export function getConstructionMaterialCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'electrical': 'bg-accent/10 text-accent border-accent/20',
    'plumbing': 'bg-primary/10 text-primary border-primary/20',
    'carpentry': 'bg-secondary/10 text-secondary border-secondary/20',
    'masonry': 'bg-muted text-muted-foreground border-border',
    'painting': 'bg-success/10 text-success border-success/20',
    'hvac': 'bg-accent/10 text-accent border-accent/20',
    'hardware': 'bg-primary/10 text-primary border-primary/20',
    'safety-equipment': 'bg-destructive/10 text-destructive border-destructive/20',
    'tools': 'bg-secondary/10 text-secondary border-secondary/20',
    'general-building': 'bg-muted text-muted-foreground border-border'
  }
  return colors[category] || 'bg-muted text-muted-foreground'
}

export function getProjectStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'planning': 'bg-muted text-muted-foreground',
    'approved': 'bg-primary text-primary-foreground',
    'in-progress': 'bg-accent text-accent-foreground',
    'on-hold': 'bg-secondary text-secondary-foreground',
    'completed': 'bg-success text-success-foreground',
    'cancelled': 'bg-destructive text-destructive-foreground'
  }
  return colors[status] || 'bg-muted text-muted-foreground'
}

export function getInventorySegmentColor(segment: string): string {
  const colors: Record<string, string> = {
    'regular-maintenance': 'bg-primary/10 text-primary border-primary/20',
    'project-construction': 'bg-accent/10 text-accent border-accent/20',
    'emergency-stock': 'bg-destructive/10 text-destructive border-destructive/20'
  }
  return colors[segment] || 'bg-muted text-muted-foreground'
}

export function calculateProjectProgress(project: { tasks: { status: string }[] }): number {
  if (!project.tasks || project.tasks.length === 0) return 0
  const completedTasks = project.tasks.filter(t => t.status === 'completed').length
  return Math.round((completedTasks / project.tasks.length) * 100)
}

export function calculateMaterialUsage(material: { requiredQuantity: number; allocatedQuantity: number; usedQuantity: number }): { 
  percentUsed: number
  percentAllocated: number
  remaining: number
} {
  const percentUsed = material.requiredQuantity > 0 
    ? Math.round((material.usedQuantity / material.requiredQuantity) * 100) 
    : 0
  const percentAllocated = material.requiredQuantity > 0 
    ? Math.round((material.allocatedQuantity / material.requiredQuantity) * 100) 
    : 0
  const remaining = material.allocatedQuantity - material.usedQuantity
  
  return { percentUsed, percentAllocated, remaining }
}

export function getConstructionMaterialStockStatus(material: { currentStock: number; reorderLevel: number }): { 
  status: string
  color: string
  urgent: boolean 
} {
  if (material.currentStock === 0) {
    return { status: 'out-of-stock', color: 'text-destructive', urgent: true }
  }
  
  if (material.currentStock <= material.reorderLevel) {
    return { status: 'low-stock', color: 'text-accent', urgent: true }
  }
  
  return { status: 'in-stock', color: 'text-success', urgent: false }
}

export function searchConstructionMaterials(items: any[], searchTerm: string): any[] {
  const term = searchTerm.toLowerCase()
  return items.filter((i: any) => 
    i.name.toLowerCase().includes(term) ||
    i.category.toLowerCase().includes(term) ||
    i.materialId.toLowerCase().includes(term)
  )
}

export function filterMaterialsByCategory(items: any[], category?: string): any[] {
  if (!category) return items
  return items.filter((i: any) => i.category === category)
}

export function filterMaterialsBySegment(items: any[], segment?: string): any[] {
  if (!segment) return items
  return items.filter((i: any) => i.segment === segment)
}

export function filterMaterialsByProject(items: any[], projectId?: string): any[] {
  if (!projectId) return items.filter((i: any) => !i.projectId)
  return items.filter((i: any) => i.projectId === projectId)
}

export function getUrgentConstructionMaterials(items: any[]): any[] {
  return items.filter((i: any) => getConstructionMaterialStockStatus(i).urgent)
}

export function calculateConstructionInventoryValue(items: { currentStock: number; unitCost: number }[]): number {
  return items.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0)
}

export function searchProjects(projects: any[], searchTerm: string): any[] {
  const term = searchTerm.toLowerCase()
  return projects.filter((p: any) => 
    p.name.toLowerCase().includes(term) ||
    p.projectId.toLowerCase().includes(term) ||
    p.location.toLowerCase().includes(term) ||
    p.type.toLowerCase().includes(term)
  )
}

export function filterProjectsByStatus(projects: any[], status?: string): any[] {
  if (!status) return projects
  return projects.filter((p: any) => p.status === status)
}

export function filterProjectsByType(projects: any[], type?: string): any[] {
  if (!type) return projects
  return projects.filter((p: any) => p.type === type)
}

export function isProjectOverBudget(project: { estimatedBudget: number; actualCost: number }): boolean {
  return project.actualCost > project.estimatedBudget
}

export function isProjectOverdue(project: { endDate?: number; status: string }): boolean {
  if (!project.endDate || project.status === 'completed' || project.status === 'cancelled') return false
  return Date.now() > project.endDate
}

export function getDaysUntilProjectDeadline(project: { endDate?: number }): number | null {
  if (!project.endDate) return null
  const diff = project.endDate - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getRolePermissions(role: SystemRole): UserPermission[] {
  const permissionsByRole: Record<SystemRole, UserPermission[]> = {
    'admin': [
      { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'suppliers', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'food-items', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'amenities', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'construction-materials', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'general-products', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'purchase-orders', actions: ['create', 'read', 'update', 'delete', 'approve', 'issue', 'manage'] },
      { resource: 'requisitions', actions: ['create', 'read', 'update', 'delete', 'approve', 'manage'] },
      { resource: 'stock', actions: ['create', 'read', 'update', 'delete', 'receive', 'manage'] },
      { resource: 'invoices', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'payments', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'projects', actions: ['create', 'read', 'update', 'delete', 'manage'] },
      { resource: 'reports', actions: ['read', 'manage'] },
      { resource: 'system-settings', actions: ['read', 'update', 'manage'] }
    ],
    'procurement-manager': [
      { resource: 'suppliers', actions: ['create', 'read', 'update'] },
      { resource: 'food-items', actions: ['read', 'update'] },
      { resource: 'amenities', actions: ['read', 'update'] },
      { resource: 'construction-materials', actions: ['read', 'update'] },
      { resource: 'general-products', actions: ['read', 'update'] },
      { resource: 'purchase-orders', actions: ['create', 'read', 'update', 'approve', 'issue'] },
      { resource: 'requisitions', actions: ['read', 'approve'] },
      { resource: 'stock', actions: ['read'] },
      { resource: 'invoices', actions: ['read', 'update'] },
      { resource: 'payments', actions: ['read'] },
      { resource: 'reports', actions: ['read'] }
    ],
    'department-head': [
      { resource: 'food-items', actions: ['read'] },
      { resource: 'amenities', actions: ['read'] },
      { resource: 'construction-materials', actions: ['read'] },
      { resource: 'general-products', actions: ['read'] },
      { resource: 'requisitions', actions: ['create', 'read', 'update', 'approve'] },
      { resource: 'stock', actions: ['read'] },
      { resource: 'reports', actions: ['read'] }
    ],
    'storekeeper': [
      { resource: 'food-items', actions: ['read', 'update'] },
      { resource: 'amenities', actions: ['read', 'update'] },
      { resource: 'construction-materials', actions: ['read', 'update'] },
      { resource: 'general-products', actions: ['read', 'update'] },
      { resource: 'purchase-orders', actions: ['read'] },
      { resource: 'requisitions', actions: ['read'] },
      { resource: 'stock', actions: ['create', 'read', 'update', 'receive'] },
      { resource: 'reports', actions: ['read'] }
    ],
    'accounts': [
      { resource: 'suppliers', actions: ['read'] },
      { resource: 'purchase-orders', actions: ['read'] },
      { resource: 'invoices', actions: ['create', 'read', 'update'] },
      { resource: 'payments', actions: ['create', 'read', 'update'] },
      { resource: 'reports', actions: ['read'] }
    ],
    'user-requester': [
      { resource: 'food-items', actions: ['read'] },
      { resource: 'amenities', actions: ['read'] },
      { resource: 'general-products', actions: ['read'] },
      { resource: 'requisitions', actions: ['create', 'read', 'update'] },
      { resource: 'stock', actions: ['read'] }
    ]
  }
  
  return permissionsByRole[role] || []
}

export function hasPermission(user: SystemUser, resource: PermissionResource, action: PermissionAction): boolean {
  if (!user.isActive) return false
  
  const resourcePermission = user.permissions.find(p => p.resource === resource)
  if (!resourcePermission) return false
  
  return resourcePermission.actions.includes(action)
}

export function canAccessModule(user: SystemUser, module: string): boolean {
  if (!user.isActive) return false
  
  const moduleResourceMap: Record<string, PermissionResource> = {
    'users': 'users',
    'suppliers': 'suppliers',
    'food-management': 'food-items',
    'amenities': 'amenities',
    'construction': 'construction-materials',
    'general-products': 'general-products',
    'procurement': 'purchase-orders',
    'inventory': 'stock',
    'finance': 'invoices'
  }
  
  const resource = moduleResourceMap[module]
  if (!resource) return false
  
  return user.permissions.some(p => p.resource === resource)
}

export function getRoleColor(role: SystemRole): string {
  const colors: Record<SystemRole, string> = {
    'admin': 'bg-destructive/10 text-destructive border-destructive/20',
    'procurement-manager': 'bg-primary/10 text-primary border-primary/20',
    'department-head': 'bg-accent/10 text-accent border-accent/20',
    'storekeeper': 'bg-success/10 text-success border-success/20',
    'accounts': 'bg-secondary/10 text-secondary border-secondary/20',
    'user-requester': 'bg-muted text-muted-foreground border-border'
  }
  return colors[role] || 'bg-muted text-muted-foreground'
}

export function getRoleLabel(role: SystemRole): string {
  const labels: Record<SystemRole, string> = {
    'admin': 'Administrator',
    'procurement-manager': 'Procurement Manager',
    'department-head': 'Department Head',
    'storekeeper': 'Storekeeper',
    'accounts': 'Accounts',
    'user-requester': 'User/Requester'
  }
  return labels[role] || role
}

export function getActivityTypeLabel(type: ActivityType): string {
  const labels: Record<ActivityType, string> = {
    'user-login': 'User Login',
    'user-logout': 'User Logout',
    'user-created': 'User Created',
    'user-updated': 'User Updated',
    'user-deleted': 'User Deleted',
    'user-role-changed': 'Role Changed',
    'user-status-changed': 'Status Changed',
    'po-created': 'PO Created',
    'po-approved': 'PO Approved',
    'po-issued': 'PO Issued',
    'requisition-created': 'Requisition Created',
    'requisition-approved': 'Requisition Approved',
    'requisition-rejected': 'Requisition Rejected',
    'stock-received': 'Stock Received',
    'stock-adjusted': 'Stock Adjusted',
    'invoice-created': 'Invoice Created',
    'payment-processed': 'Payment Processed',
    'supplier-created': 'Supplier Created',
    'supplier-updated': 'Supplier Updated',
    'project-created': 'Project Created',
    'project-updated': 'Project Updated',
    'settings-changed': 'Settings Changed'
  }
  return labels[type] || type
}

export function getActivityTypeColor(type: ActivityType): string {
  const colors: Record<string, string> = {
    'user-login': 'text-success',
    'user-logout': 'text-muted-foreground',
    'user-created': 'text-primary',
    'user-updated': 'text-accent',
    'user-deleted': 'text-destructive',
    'user-role-changed': 'text-accent',
    'user-status-changed': 'text-accent',
    'po-created': 'text-primary',
    'po-approved': 'text-success',
    'po-issued': 'text-success',
    'requisition-created': 'text-primary',
    'requisition-approved': 'text-success',
    'requisition-rejected': 'text-destructive',
    'stock-received': 'text-success',
    'stock-adjusted': 'text-accent',
    'invoice-created': 'text-primary',
    'payment-processed': 'text-success',
    'supplier-created': 'text-primary',
    'supplier-updated': 'text-accent',
    'project-created': 'text-primary',
    'project-updated': 'text-accent',
    'settings-changed': 'text-accent'
  }
  return colors[type] || 'text-foreground'
}

export function searchUsers(users: SystemUser[], searchTerm: string): SystemUser[] {
  const term = searchTerm.toLowerCase()
  return users.filter(u => 
    u.username.toLowerCase().includes(term) ||
    u.email.toLowerCase().includes(term) ||
    u.firstName.toLowerCase().includes(term) ||
    u.lastName.toLowerCase().includes(term) ||
    u.userId.toLowerCase().includes(term)
  )
}

export function filterUsersByRole(users: SystemUser[], role?: SystemRole): SystemUser[] {
  if (!role) return users
  return users.filter(u => u.role === role)
}

export function filterUsersByStatus(users: SystemUser[], isActive?: boolean): SystemUser[] {
  if (isActive === undefined) return users
  return users.filter(u => u.isActive === isActive)
}

export function filterUsersByDepartment(users: SystemUser[], department?: string): SystemUser[] {
  if (!department) return users
  return users.filter(u => u.department === department)
}

export function searchActivityLogs(logs: ActivityLog[], searchTerm: string): ActivityLog[] {
  const term = searchTerm.toLowerCase()
  return logs.filter(l => 
    l.username.toLowerCase().includes(term) ||
    l.action.toLowerCase().includes(term) ||
    l.details?.toLowerCase().includes(term) ||
    l.resource?.toLowerCase().includes(term)
  )
}

export function filterActivityByType(logs: ActivityLog[], type?: ActivityType): ActivityLog[] {
  if (!type) return logs
  return logs.filter(l => l.activityType === type)
}

export function filterActivityByUser(logs: ActivityLog[], userId?: string): ActivityLog[] {
  if (!userId) return logs
  return logs.filter(l => l.userId === userId)
}

export function filterActivityByDateRange(logs: ActivityLog[], startDate?: number, endDate?: number): ActivityLog[] {
  if (!startDate && !endDate) return logs
  
  return logs.filter(l => {
    if (startDate && l.timestamp < startDate) return false
    if (endDate && l.timestamp > endDate) return false
    return true
  })
}

export function createActivityLog(
  user: SystemUser,
  activityType: ActivityType,
  action: string,
  details?: string,
  resource?: string,
  resourceId?: string,
  metadata?: Record<string, any>
): ActivityLog {
  return {
    id: generateId(),
    userId: user.id,
    username: user.username,
    userRole: user.role,
    activityType,
    resource,
    resourceId,
    action,
    details,
    timestamp: Date.now(),
    metadata
  }
}
