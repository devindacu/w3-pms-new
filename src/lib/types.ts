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
export type PurchaseOrderStatus = 'draft' | 'approved' | 'ordered' | 'received' | 'closed'
export type MaintenanceStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent'
export type Department = 'front-office' | 'housekeeping' | 'fnb' | 'kitchen' | 'engineering' | 'finance' | 'hr' | 'admin'
export type UserRole = 'admin' | 'manager' | 'front-desk' | 'housekeeper' | 'chef' | 'waiter' | 'engineer' | 'accountant' | 'hr-staff' | 'procurement-manager' | 'department-head' | 'storekeeper' | 'accounts' | 'user-requester'
export type FoodCategory = 'perishable' | 'non-perishable' | 'frozen' | 'beverage' | 'spices' | 'dairy' | 'meat' | 'vegetables' | 'fruits' | 'bakery' | 'dry-goods'
export type OrderFrequency = 'daily' | 'weekly' | 'monthly' | 'on-demand'
export type QualityStatus = 'excellent' | 'good' | 'fair' | 'poor' | 'rejected'
export type AmenityCategory = 'toiletries' | 'linens' | 'cleaning-supplies' | 'beverages' | 'food-items' | 'paper-products' | 'room-supplies' | 'public-area-supplies' | 'laundry-supplies' | 'guest-amenities'
export type AmenityDepartment = 'housekeeping' | 'front-office' | 'fnb' | 'public-areas' | 'laundry' | 'spa' | 'gym' | 'pool'
export type ConstructionMaterialCategory = 'electrical' | 'plumbing' | 'carpentry' | 'masonry' | 'painting' | 'hvac' | 'hardware' | 'safety-equipment' | 'tools' | 'general-building'
export type ProjectStatus = 'planning' | 'approved' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled'
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical'
export type ProjectType = 'renovation' | 'new-construction' | 'repair' | 'upgrade' | 'preventive-maintenance'
export type InventorySegment = 'regular-maintenance' | 'project-construction' | 'emergency-stock'

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
  unitPrice: number
  estimatedCost: number
  supplierId?: string
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
  sentAt?: number
  sentBy?: string
  emailedTo?: string[]
  emailedAt?: number
  printedAt?: number
  printedBy?: string
  digitalSignature?: string
  qrCode?: string
  watermark?: 'DRAFT' | 'APPROVED' | 'ORDERED'
  revisionNumber: number
  auditLog?: POAuditEntry[]
}

export interface POAuditEntry {
  id: string
  timestamp: number
  action: string
  performedBy: string
  details?: string
  previousStatus?: PurchaseOrderStatus
  newStatus?: PurchaseOrderStatus
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

export interface SupplierContactPerson {
  id: string
  name: string
  role: string
  email?: string
  phone: string
  isPrimary: boolean
}

export interface Supplier {
  id: string
  supplierId: string
  name: string
  category: string[]
  contactPersons: SupplierContactPerson[]
  email?: string
  phone: string
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  taxId?: string
  businessRegNumber?: string
  website?: string
  paymentTerms: string
  creditLimit?: number
  deliveryTimeDays: number
  minimumOrderValue?: number
  rating: number
  deliveryTimeRating: number
  costRating: number
  qualityRating: number
  totalOrders: number
  totalSpent: number
  bankName?: string
  bankAccountNumber?: string
  bankBranch?: string
  notes?: string
  isActive: boolean
  createdAt: number
  updatedAt: number
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

export type ShiftType = 'morning' | 'afternoon' | 'evening' | 'night' | 'full-day'

export interface Shift {
  id: string
  shiftType: ShiftType
  startTime: string
  endTime: string
  department: Department
  requiredStaff: number
  breakDuration: number
  description?: string
}

export interface DutyRoster {
  id: string
  employeeId: string
  date: number
  shiftId: string
  department: Department
  status: 'scheduled' | 'completed' | 'missed' | 'swapped'
  swappedWith?: string
  notes?: string
  createdAt: number
  createdBy: string
}

export interface PerformanceReview {
  id: string
  employeeId: string
  reviewerId: string
  reviewPeriodStart: number
  reviewPeriodEnd: number
  punctuality: number
  qualityOfWork: number
  teamwork: number
  communication: number
  initiative: number
  overallRating: number
  strengths: string
  areasForImprovement: string
  goals: string
  comments: string
  status: 'draft' | 'submitted' | 'acknowledged'
  submittedAt?: number
  acknowledgedAt?: number
  createdAt: number
  updatedAt: number
}

export interface FoodItem {
  id: string
  foodId: string
  name: string
  category: FoodCategory
  unit: string
  currentStock: number
  reorderLevel: number
  reorderQuantity: number
  unitCost: number
  supplierIds: string[]
  orderFrequency: OrderFrequency
  storeLocation: string
  expiryDate?: number
  batchNumber?: string
  qualityStatus?: QualityStatus
  receivedDate?: number
  qualityCheckedBy?: string
  qualityNotes?: string
  isPerishable: boolean
  shelfLife?: number
  lastOrdered?: number
  lastUpdated: number
  createdAt: number
}

export interface FoodSupplierMapping {
  id: string
  foodItemId: string
  supplierId: string
  isPrimary: boolean
  unitPrice: number
  minimumOrderQuantity: number
  leadTimeDays: number
  qualityRating: number
  lastSupplyDate?: number
  createdAt: number
}

export interface QualityCheck {
  id: string
  foodItemId: string
  batchNumber: string
  checkDate: number
  checkedBy: string
  qualityStatus: QualityStatus
  temperature?: number
  appearance?: string
  smell?: string
  texture?: string
  overallNotes?: string
  actionTaken?: string
  passed: boolean
}

export interface Amenity {
  id: string
  amenityId: string
  name: string
  category: AmenityCategory
  department: AmenityDepartment[]
  unit: string
  currentStock: number
  reorderLevel: number
  reorderQuantity: number
  unitCost: number
  supplierIds: string[]
  autoReorder: boolean
  storeLocation: string
  parLevel: number
  usageRatePerDay: number
  lastOrdered?: number
  lastRestocked?: number
  notes?: string
  lastUpdated: number
  createdAt: number
}

export interface AmenityUsageLog {
  id: string
  amenityId: string
  department: AmenityDepartment
  quantity: number
  usedBy: string
  roomNumber?: string
  purpose?: string
  timestamp: number
}

export interface AmenityAutoOrder {
  id: string
  amenityId: string
  supplierId: string
  orderQuantity: number
  status: 'pending' | 'ordered' | 'received' | 'cancelled'
  triggeredAt: number
  orderedAt?: number
  receivedAt?: number
  orderReference?: string
}

export interface ConstructionMaterial {
  id: string
  materialId: string
  name: string
  category: ConstructionMaterialCategory
  unit: string
  currentStock: number
  reorderLevel: number
  reorderQuantity: number
  unitCost: number
  supplierIds: string[]
  segment: InventorySegment
  storeLocation: string
  projectId?: string
  batchNumber?: string
  warrantyMonths?: number
  specifications?: string
  safetyDataSheet?: string
  lastOrdered?: number
  lastRestocked?: number
  notes?: string
  lastUpdated: number
  createdAt: number
}

export interface ConstructionProject {
  id: string
  projectId: string
  name: string
  description: string
  type: ProjectType
  status: ProjectStatus
  priority: ProjectPriority
  location: string
  startDate?: number
  endDate?: number
  estimatedBudget: number
  actualCost: number
  completionPercentage: number
  assignedContractor?: string
  projectManager?: string
  materials: ProjectMaterialRequirement[]
  tasks: ProjectTask[]
  notes?: string
  createdAt: number
  updatedAt: number
}

export interface ProjectMaterialRequirement {
  id: string
  materialId: string
  materialName: string
  requiredQuantity: number
  allocatedQuantity: number
  usedQuantity: number
  unit: string
  estimatedCost: number
  actualCost: number
}

export interface ProjectTask {
  id: string
  projectId: string
  taskName: string
  description?: string
  assignedTo?: string
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked'
  priority: MaintenancePriority
  dueDate?: number
  completedAt?: number
  dependencies?: string[]
  notes?: string
}

export interface MaterialOrder {
  id: string
  orderNumber: string
  projectId?: string
  supplierId: string
  contractorId?: string
  items: MaterialOrderItem[]
  subtotal: number
  tax: number
  total: number
  status: PurchaseOrderStatus
  expectedDelivery?: number
  actualDelivery?: number
  segment: InventorySegment
  notes?: string
  createdAt: number
  createdBy: string
  approvedBy?: string
  approvedAt?: number
}

export interface MaterialOrderItem {
  id: string
  materialId: string
  name: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
}

export interface Contractor {
  id: string
  contractorId: string
  name: string
  contactPerson: string
  email?: string
  phone: string
  address?: string
  specializations: ConstructionMaterialCategory[]
  licenseNumber?: string
  rating: number
  totalProjects: number
  totalSpent: number
  paymentTerms?: string
  insuranceExpiry?: number
  createdAt: number
}

export interface MaterialUsageLog {
  id: string
  materialId: string
  projectId?: string
  quantity: number
  usedBy: string
  purpose: string
  location?: string
  timestamp: number
}

export type GeneralProductCategory = 'office-supplies' | 'cleaning-products' | 'seasonal-items' | 'promotional-materials' | 'uniforms' | 'safety-equipment' | 'technology' | 'furniture' | 'signage' | 'miscellaneous'

export interface GeneralProduct {
  id: string
  productId: string
  name: string
  category: GeneralProductCategory
  description?: string
  unit: string
  currentStock: number
  reorderLevel: number
  reorderQuantity: number
  unitCost: number
  supplierIds: string[]
  department: Department[]
  storeLocation: string
  batchNumber?: string
  warrantyMonths?: number
  purchaseDate?: number
  lastOrdered?: number
  lastRestocked?: number
  isConsumable: boolean
  notes?: string
  lastUpdated: number
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

export type SystemRole = 'admin' | 'procurement-manager' | 'department-head' | 'storekeeper' | 'accounts' | 'user-requester'

export interface SystemUser {
  id: string
  userId: string
  username: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: SystemRole
  department?: Department
  permissions: UserPermission[]
  isActive: boolean
  lastLogin?: number
  createdAt: number
  updatedAt: number
  createdBy?: string
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'issue' | 'receive' | 'manage'
export type PermissionResource = 'users' | 'suppliers' | 'food-items' | 'amenities' | 'construction-materials' | 'general-products' | 'purchase-orders' | 'requisitions' | 'stock' | 'invoices' | 'payments' | 'projects' | 'reports' | 'system-settings'

export interface UserPermission {
  resource: PermissionResource
  actions: PermissionAction[]
}

export type ActivityType = 'user-login' | 'user-logout' | 'user-created' | 'user-updated' | 'user-deleted' | 'user-role-changed' | 'user-status-changed' | 'po-created' | 'po-approved' | 'po-issued' | 'requisition-created' | 'requisition-approved' | 'requisition-rejected' | 'stock-received' | 'stock-adjusted' | 'invoice-created' | 'payment-processed' | 'supplier-created' | 'supplier-updated' | 'project-created' | 'project-updated' | 'settings-changed'

export interface ActivityLog {
  id: string
  userId: string
  username: string
  userRole: SystemRole
  activityType: ActivityType
  resource?: string
  resourceId?: string
  action: string
  details?: string
  ipAddress?: string
  userAgent?: string
  timestamp: number
  metadata?: Record<string, any>
}
