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
  type QualityStatus
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

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
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
