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

export type MenuType = 'breakfast' | 'lunch' | 'dinner' | 'buffet' | 'a-la-carte' | 'banquet' | 'staff-meal' | 'seasonal'
export type DietaryRestriction = 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'nut-free' | 'halal' | 'kosher'
export type AllergenType = 'milk' | 'eggs' | 'fish' | 'shellfish' | 'tree-nuts' | 'peanuts' | 'wheat' | 'soybeans' | 'sesame'
export type ConsumptionLogType = 'recipe-consumption' | 'waste' | 'spoilage' | 'variance'

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
  recipeCode: string
  name: string
  description?: string
  menuItemId?: string
  category: string
  ingredients: RecipeIngredient[]
  subRecipes?: SubRecipe[]
  instructions: RecipeStep[]
  preparationTime: number
  cookingTime: number
  totalTime: number
  yieldPortions: number
  portionSize: string
  portionUnit: string
  costPerPortion: number
  sellingPrice?: number
  profitMargin?: number
  allergens: AllergenType[]
  dietaryInfo: DietaryRestriction[]
  nutritionInfo?: NutritionInfo
  photos?: string[]
  skillLevel: 'easy' | 'medium' | 'hard' | 'expert'
  equipment?: string[]
  notes?: string
  version: number
  versionHistory?: RecipeVersion[]
  isActive: boolean
  createdBy: string
  createdAt: number
  updatedAt: number
  lastUsed?: number
}

export interface RecipeIngredient {
  id: string
  inventoryItemId?: string
  foodItemId?: string
  name: string
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  preparationNotes?: string
  isOptional: boolean
  substituteOptions?: string[]
}

export interface SubRecipe {
  id: string
  recipeId: string
  recipeName: string
  quantity: number
  unit: string
  costContribution: number
}

export interface RecipeStep {
  stepNumber: number
  instruction: string
  time?: number
  temperature?: string
  notes?: string
  photoUrl?: string
}

export interface RecipeVersion {
  version: number
  changes: string
  modifiedBy: string
  modifiedAt: number
  previousCost: number
  newCost: number
}

export interface NutritionInfo {
  servingSize: string
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  fiber?: number
  sugar?: number
  sodium?: number
  cholesterol?: number
}

export interface Menu {
  id: string
  menuCode: string
  name: string
  description?: string
  type: MenuType
  category: string
  items: MenuRecipeItem[]
  startDate?: number
  endDate?: number
  daysAvailable?: string[]
  timeSlotsAvailable?: TimeSlot[]
  isActive: boolean
  pricing?: MenuPricing
  notes?: string
  createdBy: string
  createdAt: number
  updatedAt: number
}

export interface MenuRecipeItem {
  id: string
  recipeId: string
  recipeName: string
  displayOrder: number
  price: number
  isAvailable: boolean
  maxDailyQuantity?: number
  soldToday?: number
  notes?: string
}

export interface TimeSlot {
  startTime: string
  endTime: string
}

export interface MenuPricing {
  adultPrice?: number
  childPrice?: number
  groupDiscountPercent?: number
  minimumGroupSize?: number
}

export interface KitchenConsumptionLog {
  id: string
  logNumber: string
  recipeId: string
  recipeName: string
  orderId?: string
  orderNumber?: string
  menuItemId?: string
  portionsProduced: number
  type: ConsumptionLogType
  ingredients: ConsumptionIngredient[]
  totalCost: number
  costPerPortion: number
  variance?: VarianceDetail[]
  wasteReason?: string
  spoilageReason?: string
  producedBy: string
  producedAt: number
  shiftType?: ShiftType
  notes?: string
  createdAt: number
}

export interface ConsumptionIngredient {
  id: string
  inventoryItemId?: string
  foodItemId?: string
  name: string
  expectedQuantity: number
  actualQuantity: number
  unit: string
  unitCost: number
  expectedCost: number
  actualCost: number
  variance: number
  variancePercent: number
  varianceReason?: string
}

export interface VarianceDetail {
  itemName: string
  expectedQuantity: number
  actualQuantity: number
  variance: number
  variancePercent: number
  varianceCost: number
  reason?: string
}

export interface DailyConsumptionReport {
  id: string
  reportDate: number
  shift?: ShiftType
  totalRecipesProduced: number
  totalPortions: number
  totalRevenue: number
  totalCost: number
  grossProfit: number
  profitMargin: number
  recipeBreakdown: RecipeConsumptionSummary[]
  ingredientUsage: IngredientUsageSummary[]
  wasteItems: WasteSummary[]
  topSellingRecipes: RecipeSales[]
  lowPerformingRecipes: RecipeSales[]
  totalVariance: number
  variancePercent: number
  generatedBy: string
  generatedAt: number
}

export interface RecipeConsumptionSummary {
  recipeId: string
  recipeName: string
  portionsProduced: number
  averageCostPerPortion: number
  totalCost: number
  totalRevenue: number
  profit: number
  profitMargin: number
}

export interface IngredientUsageSummary {
  inventoryItemId?: string
  foodItemId?: string
  itemName: string
  totalUsed: number
  unit: string
  averageCost: number
  totalCost: number
  recipes: string[]
}

export interface WasteSummary {
  itemName: string
  quantity: number
  unit: string
  cost: number
  reason: string
  timestamp: number
}

export interface RecipeSales {
  recipeId: string
  recipeName: string
  portionsSold: number
  revenue: number
  cost: number
  profit: number
  profitMargin: number
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
  invoicePhotos?: string[]
  deliveryNotePhotos?: string[]
  hasVariance?: boolean
  varianceNotes?: string
  deliveryNoteNumber?: string
  vehicleNumber?: string
  driverName?: string
  qualityCheckStatus?: 'passed' | 'partial' | 'failed'
}

export interface GRNItem {
  id: string
  inventoryItemId: string
  orderedQuantity: number
  receivedQuantity: number
  damagedQuantity: number
  batchNumber?: string
  expiryDate?: number
  manufactureDate?: number
  unitPrice?: number
  varianceAmount?: number
  varianceReason?: string
  barcode?: string
  qualityStatus?: QualityStatus
  rejectionReason?: string
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

export type InvoiceStatus = 'pending-validation' | 'validated' | 'matched' | 'mismatch' | 'approved' | 'posted' | 'rejected'
export type InvoiceMismatchType = 'price-variance' | 'quantity-variance' | 'item-missing' | 'no-po-match' | 'no-grn-match' | 'total-variance'

export interface Invoice {
  id: string
  invoiceNumber: string
  supplierId: string
  supplierName?: string
  purchaseOrderId?: string
  grnId?: string
  invoiceDate: number
  dueDate?: number
  subtotal: number
  tax: number
  total: number
  status: InvoiceStatus
  items: InvoiceItem[]
  scannedImageUrl?: string
  ocrData?: OCRData
  mismatches?: InvoiceMismatch[]
  validatedBy?: string
  validatedAt?: number
  approvedBy?: string
  approvedAt?: number
  postedAt?: number
  postedToAccountsBy?: string
  rejectionReason?: string
  notes?: string
  createdAt: number
  updatedAt: number
}

export interface InvoiceItem {
  id: string
  itemName: string
  description?: string
  quantity: number
  unit: string
  unitPrice: number
  total: number
  poItemId?: string
  grnItemId?: string
  inventoryItemId?: string
  variance?: number
  varianceReason?: string
}

export interface OCRData {
  rawText: string
  confidence: number
  extractedFields: {
    invoiceNumber?: string
    invoiceDate?: string
    supplierName?: string
    supplierAddress?: string
    taxId?: string
    subtotal?: number
    tax?: number
    total?: number
    dueDate?: string
  }
  extractedItems?: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
    confidence: number
  }>
  processingTime: number
  processedAt: number
}

export interface InvoiceMismatch {
  id: string
  type: InvoiceMismatchType
  severity: 'low' | 'medium' | 'high' | 'critical'
  itemId?: string
  itemName?: string
  description: string
  expectedValue?: string | number
  actualValue?: string | number
  variance?: number
  requiresApproval: boolean
  resolvedBy?: string
  resolvedAt?: number
  resolution?: string
}

export type ForecastPeriod = 7 | 14 | 30
export type ForecastConfidence = 'low' | 'medium' | 'high' | 'very-high'
export type SeasonalityPattern = 'none' | 'weekly' | 'monthly' | 'seasonal' | 'yearly'
export type AnomalyType = 'spike' | 'drop' | 'unusual-pattern' | 'zero-consumption' | 'waste-increase'
export type AnomalySeverity = 'info' | 'warning' | 'critical'

export interface DemandForecast {
  id: string
  itemId: string
  itemName: string
  itemType: 'food' | 'amenity' | 'material' | 'general'
  category: string
  currentStock: number
  reorderLevel: number
  forecastPeriodDays: ForecastPeriod
  forecastedDemand: number
  dailyDemandBreakdown: DailyDemandForecast[]
  confidence: ForecastConfidence
  confidenceScore: number
  suggestedReorderQuantity: number
  suggestedReorderDate: number
  estimatedStockoutDate?: number
  seasonalityPattern: SeasonalityPattern
  seasonalityFactor: number
  occupancyImpact: number
  menuPlanImpact: number
  historicalAverageDemand: number
  trendDirection: 'increasing' | 'stable' | 'decreasing'
  trendPercent: number
  anomalies: DemandAnomaly[]
  dataQuality: {
    historicalDataPoints: number
    hasSeasonalData: boolean
    hasOccupancyData: boolean
    hasMenuData: boolean
    dataCompleteness: number
  }
  generatedAt: number
  validUntil: number
  generatedBy?: string
}

export interface DailyDemandForecast {
  date: number
  forecastedQuantity: number
  lowerBound: number
  upperBound: number
  confidence: number
  occupancyRate?: number
  menuFactor?: number
  seasonalFactor?: number
  specialEvent?: string
}

export interface DemandAnomaly {
  id: string
  type: AnomalyType
  severity: AnomalySeverity
  date: number
  expectedValue: number
  actualValue: number
  deviationPercent: number
  description: string
  possibleCauses: string[]
  actionRecommended: string
  isResolved: boolean
  resolvedBy?: string
  resolvedAt?: number
  notes?: string
}

export interface ConsumptionHistory {
  itemId: string
  itemName: string
  date: number
  quantityConsumed: number
  occupancyRate?: number
  weatherCondition?: string
  specialEvent?: string
  menuItems?: string[]
  wasteQuantity?: number
  spoilageQuantity?: number
}

export interface ForecastParameters {
  itemId: string
  forecastPeriodDays: ForecastPeriod
  includeSeasonality: boolean
  includeOccupancy: boolean
  includeMenuPlans: boolean
  includeWeather: boolean
  confidenceLevel: number
  anomalyDetectionSensitivity: 'low' | 'medium' | 'high'
}

export interface ForecastModelMetrics {
  itemId: string
  itemName: string
  modelType: 'time-series' | 'ml-hybrid' | 'statistical'
  accuracy: number
  meanAbsoluteError: number
  rootMeanSquareError: number
  forecastBias: number
  trainingDataPoints: number
  lastTrainedAt: number
  performanceRating: 'poor' | 'fair' | 'good' | 'excellent'
}

export interface AutoReorderSuggestion {
  id: string
  itemId: string
  itemName: string
  itemType: 'food' | 'amenity' | 'material' | 'general'
  currentStock: number
  reorderLevel: number
  forecastedDemand: number
  suggestedQuantity: number
  suggestedDate: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimatedCost: number
  supplierId?: string
  supplierName?: string
  leadTimeDays: number
  confidence: ForecastConfidence
  reason: string
  isAutoGenerated: boolean
  generatedAt: number
  expiresAt: number
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'ordered'
  reviewedBy?: string
  reviewedAt?: number
  notes?: string
}

export type KitchenStationType = 'hot-kitchen' | 'cold-kitchen' | 'pastry' | 'butchery' | 'prep-station' | 'desserts' | 'grill' | 'fry-station' | 'salad-bar' | 'bakery'
export type ProductionTaskStatus = 'pending' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled'
export type ProductionTaskPriority = 'low' | 'normal' | 'high' | 'urgent'
export type KitchenStaffRole = 'executive-chef' | 'sous-chef' | 'chef-de-partie' | 'commis-chef' | 'line-cook' | 'prep-cook' | 'pastry-chef' | 'kitchen-steward'

export interface KitchenStation {
  id: string
  stationId: string
  name: string
  type: KitchenStationType
  description?: string
  location: string
  equipment: string[]
  capacity: number
  assignedStaff: string[]
  isActive: boolean
  maintenanceSchedule?: StationMaintenance[]
  safetyChecklist?: SafetyCheckItem[]
  notes?: string
  createdAt: number
  updatedAt: number
}

export interface StationMaintenance {
  id: string
  equipmentName: string
  lastMaintenance?: number
  nextMaintenance: number
  maintenanceType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
  assignedTo?: string
  notes?: string
}

export interface SafetyCheckItem {
  id: string
  checkName: string
  description: string
  frequency: 'pre-shift' | 'post-shift' | 'hourly' | 'daily'
  isCompleted: boolean
  lastCheckedAt?: number
  lastCheckedBy?: string
}

export interface KitchenStaff {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  role: KitchenStaffRole
  specializations: string[]
  shiftType: ShiftType
  primaryStation?: string
  secondaryStations: string[]
  certifications: StaffCertification[]
  performanceRating: number
  tasksCompleted: number
  efficiency: number
  qualityRating: number
  isAvailable: boolean
  status: 'active' | 'on-leave' | 'off-duty'
  phone?: string
  email?: string
  hireDate: number
  notes?: string
}

export interface StaffCertification {
  id: string
  name: string
  issuedBy: string
  issuedDate: number
  expiryDate?: number
  certificateNumber?: string
}

export interface ProductionSchedule {
  id: string
  scheduleId: string
  date: number
  shiftType: ShiftType
  menuId?: string
  menuName?: string
  tasks: ProductionTask[]
  totalRecipes: number
  totalPortions: number
  estimatedCost: number
  estimatedRevenue: number
  assignedStaff: StaffAssignment[]
  status: 'draft' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  startedAt?: number
  completedAt?: number
  actualCost?: number
  actualRevenue?: number
  efficiency?: number
  notes?: string
  createdBy: string
  createdAt: number
  updatedAt: number
}

export interface ProductionTask {
  id: string
  scheduleId: string
  recipeId: string
  recipeName: string
  station: string
  portionsRequired: number
  portionsCompleted: number
  priority: ProductionTaskPriority
  status: ProductionTaskStatus
  assignedTo?: string
  estimatedTime: number
  actualTime?: number
  startTime?: number
  endTime?: number
  dependencies: string[]
  ingredients: TaskIngredient[]
  equipment: string[]
  notes?: string
  qualityCheckRequired: boolean
  qualityCheckStatus?: 'passed' | 'failed' | 'pending'
  qualityCheckedBy?: string
}

export interface TaskIngredient {
  id: string
  foodItemId?: string
  name: string
  quantityNeeded: number
  quantityIssued: number
  unit: string
  storeLocation: string
  issuedBy?: string
  issuedAt?: number
  batchNumber?: string
}

export interface StaffAssignment {
  id: string
  staffId: string
  staffName: string
  role: KitchenStaffRole
  assignedStation: string
  tasks: string[]
  startTime: number
  endTime: number
  breakTime?: number[]
  isPresent: boolean
  performanceNotes?: string
}

export interface BatchProduction {
  id: string
  batchNumber: string
  recipeId: string
  recipeName: string
  batchSize: number
  portionsProduced: number
  productionDate: number
  shiftType: ShiftType
  producedBy: string
  station: string
  batchStartTime: number
  batchEndTime: number
  totalTime: number
  ingredients: BatchIngredient[]
  totalCost: number
  costPerPortion: number
  qualityCheck: BatchQualityCheck
  storageInstructions?: string
  expiryTime?: number
  isActive: boolean
  notes?: string
}

export interface BatchIngredient {
  id: string
  foodItemId: string
  name: string
  quantity: number
  unit: string
  batchNumber?: string
  cost: number
}

export interface BatchQualityCheck {
  checkedBy: string
  checkedAt: number
  temperature?: number
  appearance: 'excellent' | 'good' | 'acceptable' | 'poor'
  taste: 'excellent' | 'good' | 'acceptable' | 'poor'
  texture: 'excellent' | 'good' | 'acceptable' | 'poor'
  portionConsistency: 'excellent' | 'good' | 'acceptable' | 'poor'
  overallRating: 'passed' | 'conditional' | 'failed'
  notes?: string
  actionTaken?: string
}

export interface KitchenInventoryIssue {
  id: string
  issueNumber: string
  requestedBy: string
  requestedFor: string
  station?: string
  scheduleId?: string
  items: InventoryIssueItem[]
  status: 'pending' | 'partially-issued' | 'issued' | 'rejected'
  requestedAt: number
  issuedBy?: string
  issuedAt?: number
  notes?: string
}

export interface InventoryIssueItem {
  id: string
  foodItemId: string
  itemName: string
  requestedQuantity: number
  issuedQuantity: number
  unit: string
  batchNumber?: string
  storeLocation: string
  purpose: string
}

export interface WasteTracking {
  id: string
  wasteId: string
  date: number
  shiftType: ShiftType
  station: string
  items: WasteItem[]
  totalWasteCost: number
  reportedBy: string
  supervisorApproval?: string
  approvedAt?: number
  correctiveActions?: string
  notes?: string
  createdAt: number
}

export interface WasteItem {
  id: string
  itemType: 'ingredient' | 'prepared-food' | 'finished-dish'
  itemId?: string
  itemName: string
  quantity: number
  unit: string
  cost: number
  wasteCategory: 'preparation-waste' | 'overproduction' | 'spoilage' | 'customer-return' | 'quality-rejection' | 'breakage' | 'other'
  reason: string
  preventable: boolean
  preventionSuggestion?: string
}

export interface KitchenPerformanceMetrics {
  date: number
  shiftType?: ShiftType
  recipesProduced: number
  totalPortions: number
  totalCost: number
  totalRevenue: number
  grossProfit: number
  profitMargin: number
  foodCostPercentage: number
  wastePercentage: number
  wasteCost: number
  laborHours: number
  laborCost: number
  portionsPerLaborHour: number
  onTimeCompletionRate: number
  qualityPassRate: number
  efficiency: number
  topPerformingRecipes: RecipeSales[]
  bottomPerformingRecipes: RecipeSales[]
  staffPerformance: StaffPerformanceSummary[]
  inventoryTurnover: number
}

export interface StaffPerformanceSummary {
  staffId: string
  staffName: string
  role: KitchenStaffRole
  tasksCompleted: number
  tasksAssigned: number
  averageTaskTime: number
  qualityScore: number
  efficiency: number
  hoursWorked: number
}
