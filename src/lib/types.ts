export type RoomStatus = 'vacant-clean' | 'vacant-dirty' | 'occupied-clean' | 'occupied-dirty' | 'maintenance' | 'out-of-order'
export type RoomType = 'standard' | 'deluxe' | 'suite' | 'executive' | 'presidential'
export type ReservationStatus = 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled' | 'no-show'
export type PaymentMethod = 'cash' | 'card' | 'bank-transfer' | 'mobile-payment' | 'credit'
export type PaymentStatus = 'pending' | 'paid' | 'partially-paid' | 'refunded'
export type HousekeepingTaskStatus = 'pending' | 'in-progress' | 'completed' | 'inspected'
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled'
export type OrderType = 'dine-in' | 'room-service' | 'takeaway'
export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired'
export type RequisitionStatus = 'draft' | 'pending-approval' | 'approved' | 'rejected' | 'fulfilled'
export type PurchaseOrderStatus = 'draft' | 'sent' | 'confirmed' | 'delivered' | 'invoiced' | 'paid'
export type MaintenanceStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent'
export type Department = 'front-office' | 'housekeeping' | 'fnb' | 'kitchen' | 'engineering' | 'finance' | 'hr' | 'admin'
export type UserRole = 'admin' | 'manager' | 'front-desk' | 'housekeeper' | 'chef' | 'waiter' | 'engineer' | 'accountant' | 'hr-staff'

export interface Guest {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone: string
  nationality?: string
  idType?: string
  idNumber?: string
  address?: string
  preferences?: string[]
  loyaltyPoints: number
  totalStays: number
  totalSpent: number
  createdAt: number
  updatedAt: number
}

export interface Room {
  id: string
  roomNumber: string
  floor: number
  roomType: RoomType
  status: RoomStatus
  baseRate: number
  maxOccupancy: number
  amenities: string[]
  lastCleaned?: number
  assignedHousekeeper?: string
  notes?: string
}

export interface Reservation {
  id: string
  guestId: string
  roomId?: string
  checkInDate: number
  checkOutDate: number
  adults: number
  children: number
  status: ReservationStatus
  ratePerNight: number
  totalAmount: number
  advancePaid: number
  source: string
  specialRequests?: string
  createdAt: number
  updatedAt: number
  createdBy: string
}

export interface Folio {
  id: string
  reservationId: string
  guestId: string
  charges: FolioCharge[]
  payments: FolioPayment[]
  balance: number
  createdAt: number
  updatedAt: number
}

export interface FolioCharge {
  id: string
  folioId: string
  description: string
  amount: number
  quantity: number
  department: Department
  timestamp: number
  postedBy: string
}

export interface FolioPayment {
  id: string
  folioId: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  reference?: string
  timestamp: number
  receivedBy: string
}

export interface HousekeepingTask {
  id: string
  roomId: string
  assignedTo?: string
  taskType: 'clean' | 'deep-clean' | 'turndown' | 'inspection'
  status: HousekeepingTaskStatus
  priority: 'normal' | 'high' | 'urgent'
  notes?: string
  startedAt?: number
  completedAt?: number
  createdAt: number
}

export interface MenuItem {
  id: string
  name: string
  description?: string
  category: string
  price: number
  recipeId?: string
  available: boolean
  preparationTime: number
  imageUrl?: string
}

export interface Recipe {
  id: string
  menuItemId?: string
  name: string
  ingredients: RecipeIngredient[]
  instructions?: string
  portionSize: number
  portionCost: number
  preparationTime: number
}

export interface RecipeIngredient {
  inventoryItemId: string
  quantity: number
  unit: string
}

export interface Order {
  id: string
  orderNumber: string
  type: OrderType
  guestId?: string
  roomId?: string
  tableNumber?: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  notes?: string
  createdAt: number
  createdBy: string
  completedAt?: number
}

export interface OrderItem {
  id: string
  menuItemId: string
  name: string
  quantity: number
  price: number
  specialInstructions?: string
  status: OrderStatus
}

export interface InventoryItem {
  id: string
  name: string
  category: string
  unit: string
  currentStock: number
  reorderLevel: number
  reorderQuantity: number
  unitCost: number
  supplierId?: string
  storeLocation: string
  expiryDate?: number
  batchNumber?: string
  lastUpdated: number
}

export interface StockMovement {
  id: string
  inventoryItemId: string
  type: 'in' | 'out' | 'adjustment' | 'transfer' | 'waste'
  quantity: number
  fromLocation?: string
  toLocation?: string
  reference?: string
  reason?: string
  timestamp: number
  createdBy: string
}

export interface Requisition {
  id: string
  requisitionNumber: string
  department: Department
  requestedBy: string
  items: RequisitionItem[]
  status: RequisitionStatus
  priority: 'normal' | 'high' | 'urgent'
  notes?: string
  approvedBy?: string
  approvedAt?: number
  createdAt: number
}

export interface RequisitionItem {
  id: string
  inventoryItemId: string
  name: string
  quantity: number
  unit: string
  estimatedCost: number
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  supplierId: string
  requisitionId?: string
  items: PurchaseOrderItem[]
  subtotal: number
  tax: number
  total: number
  status: PurchaseOrderStatus
  expectedDelivery?: number
  notes?: string
  createdAt: number
  createdBy: string
  approvedBy?: string
  approvedAt?: number
}

export interface PurchaseOrderItem {
  id: string
  inventoryItemId: string
  name: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
}

export interface GoodsReceivedNote {
  id: string
  grnNumber: string
  purchaseOrderId: string
  supplierId: string
  items: GRNItem[]
  receivedAt: number
  receivedBy: string
  notes?: string
  invoiceNumber?: string
  invoiceAmount?: number
}

export interface GRNItem {
  id: string
  inventoryItemId: string
  orderedQuantity: number
  receivedQuantity: number
  damagedQuantity: number
  batchNumber?: string
  expiryDate?: number
}

export interface Supplier {
  id: string
  name: string
  contactPerson?: string
  email?: string
  phone: string
  address?: string
  category: string[]
  paymentTerms?: string
  rating: number
  totalOrders: number
  totalSpent: number
  createdAt: number
}

export interface MaintenanceRequest {
  id: string
  requestNumber: string
  roomId?: string
  location: string
  issueType: string
  description: string
  priority: MaintenancePriority
  status: MaintenanceStatus
  assignedTo?: string
  reportedBy: string
  createdAt: number
  scheduledAt?: number
  startedAt?: number
  completedAt?: number
  notes?: string
  spareParts?: MaintenanceSparePart[]
}

export interface MaintenanceSparePart {
  inventoryItemId: string
  name: string
  quantity: number
}

export interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email?: string
  phone: string
  department: Department
  role: UserRole
  joinDate: number
  salary?: number
  status: 'active' | 'on-leave' | 'terminated'
  createdAt: number
}

export interface Attendance {
  id: string
  employeeId: string
  date: number
  checkIn?: number
  checkOut?: number
  status: 'present' | 'absent' | 'half-day' | 'leave'
  notes?: string
}

export interface LeaveRequest {
  id: string
  employeeId: string
  leaveType: 'casual' | 'sick' | 'annual' | 'unpaid'
  startDate: number
  endDate: number
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvedAt?: number
  createdAt: number
}

export interface DashboardMetrics {
  occupancy: {
    current: number
    available: number
    occupied: number
    maintenance: number
    rate: number
  }
  revenue: {
    today: number
    month: number
    lastMonth: number
    growth: number
  }
  housekeeping: {
    cleanRooms: number
    dirtyRooms: number
    pendingTasks: number
  }
  fnb: {
    ordersToday: number
    revenueToday: number
    averageOrderValue: number
  }
  inventory: {
    lowStockItems: number
    expiringItems: number
    totalValue: number
  }
  maintenance: {
    openRequests: number
    urgent: number
    avgResolutionTime: number
  }
}
