export type RoomStatus = 'vacant-clean' | 'vacant-dirty' | 'occupied-clean' | 'occupied-dirty' | 'maintenance' | 'out-of-order'
export type RoomType = 'standard' | 'deluxe' | 'suite' | 'executive' | 'presidential'
export type ReservationStatus = 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled' | 'no-show'
export type BeddingType = 'king' | 'queen' | 'twin' | 'single' | 'double' | 'sofa-bed' | 'bunk-bed'
export type ViewType = 'city' | 'ocean' | 'garden' | 'pool' | 'mountain' | 'courtyard' | 'interior'
export type BaseRatePlanType = 'bar' | 'rack' | 'corporate' | 'travel-agent' | 'wholesale' | 'member' | 'staff'
export type PromoRatePlanType = 'early-bird' | 'last-minute' | 'long-stay' | 'weekend' | 'festive' | 'honeymoon' | 'spa-package'
export type MealPlanType = 'ro' | 'bb' | 'hb' | 'fb' | 'ai'
export type DerivedRateType = 'percentage-discount' | 'percentage-markup' | 'fixed-discount' | 'fixed-markup' | 'derived-from-rate'
export type RestrictionType = 'min-stay' | 'max-stay' | 'min-stay-arrival' | 'cta' | 'ctd' | 'stop-sell' | 'mandatory-stay'
export type SeasonType = 'low' | 'mid' | 'high' | 'peak'

export interface RoomTypeConfig {
  id: string
  name: string
  code: string
  description?: string
  baseRate: number
  rackRate: number
  maxOccupancy: number
  baseOccupancy: number
  size?: number
  amenities: string[]
  bedding: BeddingType[]
  viewTypes: ViewType[]
  inventoryItems?: string[]
  sortOrder: number
  isActive: boolean
  createdAt: number
  updatedAt: number
  createdBy: string
}

export interface RatePlanConfig {
  id: string
  code: string
  name: string
  description?: string
  type: BaseRatePlanType | PromoRatePlanType
  mealPlan?: MealPlanType
  parentRatePlanId?: string
  isParent: boolean
  roomTypeId?: string
  baseRate?: number
  derivedRateConfig?: DerivedRateConfig
  validFrom: number
  validTo?: number
  blackoutDates?: number[]
  minimumStay?: number
  maximumStay?: number
  advanceBookingDays?: number
  maxAdvanceBookingDays?: number
  cancellationPolicy?: string
  requiresApproval: boolean
  isActive: boolean
  sortOrder: number
  channels?: string[]
  createdAt: number
  updatedAt: number
  createdBy: string
}

export interface DerivedRateConfig {
  derivedType: DerivedRateType
  parentRatePlanId: string
  value: number
  roundingRule?: 'none' | 'nearest-5' | 'nearest-10' | 'nearest-50' | 'nearest-100'
}

export interface RateCalendar {
  id: string
  roomTypeId: string
  ratePlanId: string
  date: number
  rate: number
  availability: number
  restrictions: YieldRestriction[]
  isOverride: boolean
  overrideReason?: string
  createdAt: number
  updatedAt: number
  updatedBy: string
}

export interface YieldRestriction {
  type: RestrictionType
  value?: number
  isActive: boolean
}

export interface Season {
  id: string
  name: string
  code: string
  type: SeasonType
  startDate: number
  endDate: number
  rateMultiplier: number
  description?: string
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export interface EventDay {
  id: string
  name: string
  date: number
  description?: string
  rateMultiplier: number
  minimumStay?: number
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export interface CorporateAccount {
  id: string
  companyName: string
  code: string
  contactPerson: string
  email: string
  phone: string
  address?: string
  negotiatedRates: CorporateRate[]
  blackoutDates?: number[]
  roomAllotment?: number
  creditLimit?: number
  paymentTerms?: string
  commissionRate?: number
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export interface CorporateRate {
  roomTypeId: string
  ratePlanId: string
  rate: number
  validFrom: number
  validTo?: number
}

export interface OccupancyPricing {
  id: string
  roomTypeId: string
  ratePlanId: string
  baseOccupancy: number
  extraAdultCharge: number
  extraChildCharge: number
  childAgeSlab: ChildAgeSlab[]
  maxOccupancy: number
  createdAt: number
  updatedAt: number
}

export interface ChildAgeSlab {
  minAge: number
  maxAge: number
  charge: number
  chargeType: 'fixed' | 'percentage'
}

export interface RateAuditLog {
  id: string
  roomTypeId: string
  ratePlanId: string
  date: number
  changeType: 'create' | 'update' | 'delete' | 'override'
  oldRate?: number
  newRate?: number
  oldRestrictions?: YieldRestriction[]
  newRestrictions?: YieldRestriction[]
  reason?: string
  changedBy: string
  changedAt: number
  approvedBy?: string
  approvedAt?: number
}
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
export type ExtraServiceStatus = 'active' | 'inactive' | 'archived'

export interface ExtraServiceCategory {
  id: string
  name: string
  description?: string
  icon?: string
  sortOrder: number
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export interface ExtraService {
  id: string
  categoryId: string
  name: string
  description?: string
  basePrice: number
  taxRate: number
  unit: string
  status: ExtraServiceStatus
  department: Department
  requiresApproval: boolean
  maxQuantity?: number
  comments?: string
  createdAt: number
  updatedAt: number
  createdBy: string
}

export interface FolioExtraService {
  id: string
  folioId: string
  serviceId: string
  serviceName: string
  categoryName: string
  quantity: number
  unitPrice: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  comments?: string
  postedBy: string
  postedAt: number
  approvedBy?: string
  approvedAt?: number
}

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
  dateOfBirth?: number
  address?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
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

export type InvoiceType = 'standard' | 'credit-note' | 'debit-note' | 'proforma' | 'recurring'
export type InvoiceStatus = 'draft' | 'pending-validation' | 'validated' | 'matched' | 'mismatch' | 'approved' | 'paid' | 'partially-paid' | 'overdue' | 'posted' | 'rejected' | 'disputed' | 'cancelled'
export type InvoiceMismatchType = 'price-variance' | 'quantity-variance' | 'item-missing' | 'no-po-match' | 'no-grn-match' | 'total-variance'

export interface Invoice {
  id: string
  invoiceNumber: string
  supplierId: string
  supplierName?: string
  purchaseOrderId?: string
  grnId?: string
  type: InvoiceType
  status: InvoiceStatus
  invoiceDate: number
  issueDate: number
  dueDate: number
  receivedDate?: number
  paymentTerms: PaymentTerms
  subtotal: number
  tax: number
  taxRate: number
  taxAmount: number
  discountAmount?: number
  discountPercentage?: number
  total: number
  amountPaid: number
  balance: number
  currency: string
  exchangeRate: number
  items: InvoiceItem[]
  scannedImageUrl?: string
  attachments?: string[]
  ocrData?: OCRData
  mismatches?: InvoiceMismatch[]
  matchingResult?: InvoiceMatchingResult
  validatedBy?: string
  validatedAt?: number
  approvedBy?: string
  approvedAt?: number
  postedAt?: number
  postedToAccountsBy?: string
  paidBy?: string
  paidAt?: number
  paymentReference?: string
  rejectionReason?: string
  notes?: string
  internalNotes?: string
  createdBy: string
  createdAt: number
  updatedAt: number
}

export interface InvoiceItem {
  id: string
  itemName: string
  name: string
  description?: string
  quantity: number
  unit: string
  unitPrice: number
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  poItemId?: string
  grnItemId?: string
  inventoryItemId: string
  variance?: ItemVariance
  varianceReason?: string
}

export interface ItemVariance {
  quantityVariance: number
  quantityVariancePercentage: number
  priceVariance: number
  priceVariancePercentage: number
  totalVariance: number
  totalVariancePercentage: number
  reason?: string
}

export interface InvoiceMatchingResult {
  id: string
  invoiceId: string
  purchaseOrderId?: string
  grnId?: string
  matchStatus: 'fully-matched' | 'partially-matched' | 'not-matched' | 'variance-within-tolerance' | 'needs-review' | 'approved-with-variance' | 'rejected'
  overallVariance: number
  variancePercentage: number
  toleranceThreshold: number
  itemsMatched: number
  itemsMismatched: number
  itemsMissing: number
  itemsAdditional: number
  quantityVariances: MatchingVariance[]
  priceVariances: MatchingVariance[]
  totalVariances: MatchingVariance[]
  recommendations: MatchingRecommendation[]
  requiresApproval: boolean
  approvalLevel: 'auto-approve' | 'manager' | 'senior-manager' | 'director' | 'cfo'
  matchedBy?: string
  matchedAt: number
  approvedBy?: string
  approvedAt?: number
  rejectedBy?: string
  rejectedAt?: number
  rejectionReason?: string
  notes?: string
  auditTrail: MatchingAuditEntry[]
}

export interface MatchingVariance {
  itemId: string
  itemName: string
  field: 'quantity' | 'price' | 'total' | 'tax' | 'unit' | 'description'
  poValue?: number
  grnValue?: number
  invoiceValue?: number
  variance: number
  variancePercentage: number
  isWithinTolerance: boolean
  requiresAction: boolean
  suggestedAction?: string
  actionTaken?: string
  resolvedBy?: string
  resolvedAt?: number
}

export interface MatchingRecommendation {
  type: 'approve' | 'reject' | 'create-dispute' | 'request-clarification' | 'adjust-tolerance' | 'contact-supplier' | 'create-debit-note' | 'create-credit-note'
  priority: 'info' | 'warning' | 'action-required' | 'critical'
  message: string
  actionLabel?: string
  actionData?: any
}

export interface MatchingAuditEntry {
  id: string
  timestamp: number
  action: 'created' | 'matched' | 'approved' | 'rejected' | 'variance-accepted' | 'dispute-created' | 'updated' | 'tolerance-adjusted'
  performedBy: string
  performedByName: string
  details?: string
  previousStatus?: string
  newStatus?: string
  changes?: {
    field: string
    oldValue: any
    newValue: any
  }[]
}

export interface ThreeWayMatch {
  id: string
  poNumber: string
  grnNumber: string
  invoiceNumber: string
  purchaseOrder: PurchaseOrder
  grn: GoodsReceivedNote
  invoice: Invoice
  matchingResult: InvoiceMatchingResult
  createdAt: number
  updatedAt: number
}

export interface MatchingToleranceConfig {
  id: string
  quantityTolerancePercentage: number
  priceTolerancePercentage: number
  totalTolerancePercentage: number
  quantityToleranceAmount?: number
  priceToleranceAmount?: number
  totalToleranceAmount?: number
  autoApproveWithinTolerance: boolean
  requireApprovalThreshold: number
  requireSeniorApprovalThreshold: number
  requireDirectorApprovalThreshold: number
  appliesTo?: {
    supplierIds?: string[]
    categoryIds?: string[]
    departments?: Department[]
  }
  isActive: boolean
  createdAt: number
  updatedAt: number
  createdBy: string
}

export interface VarianceReport {
  id: string
  reportNumber: string
  reportType: 'po-grn' | 'grn-invoice' | 'po-invoice' | 'three-way'
  period: {
    from: number
    to: number
  }
  totalVariances: number
  totalVarianceAmount: number
  totalVariancePercentage: number
  variancesByCategory: {
    category: string
    count: number
    totalAmount: number
    percentage: number
  }[]
  variancesBySupplier: {
    supplierId: string
    supplierName: string
    count: number
    totalAmount: number
    percentage: number
  }[]
  topVariances: {
    invoiceNumber: string
    supplierId: string
    supplierName: string
    varianceAmount: number
    variancePercentage: number
    status: string
  }[]
  varianceTrends: {
    date: number
    count: number
    amount: number
  }[]
  generatedBy: string
  generatedAt: number
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

export type NotificationType = 
  | 'inventory-low-stock'
  | 'inventory-critical-stock'
  | 'inventory-expired'
  | 'inventory-expiring-soon'
  | 'requisition-pending'
  | 'requisition-approved'
  | 'requisition-rejected'
  | 'po-pending-approval'
  | 'po-approved'
  | 'po-delivery-due'
  | 'grn-received'
  | 'invoice-mismatch'
  | 'payment-due'
  | 'room-maintenance'
  | 'room-ready'
  | 'housekeeping-task-overdue'
  | 'guest-checkout-today'
  | 'guest-checkin-today'
  | 'order-pending'
  | 'order-ready'
  | 'kitchen-inventory-low'
  | 'recipe-cost-variance'
  | 'waste-high'
  | 'quality-check-failed'
  | 'staff-leave-request'
  | 'staff-shift-swap'
  | 'construction-project-delayed'
  | 'construction-material-low'
  | 'supplier-rating-low'
  | 'system-alert'
  | 'forecast-stockout-warning'
  | 'forecast-high-demand'

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical'
export type NotificationStatus = 'unread' | 'read' | 'archived' | 'dismissed'

export interface Notification {
  id: string
  type: NotificationType
  priority: NotificationPriority
  status: NotificationStatus
  title: string
  message: string
  module: Department | 'procurement' | 'inventory' | 'construction' | 'forecasting' | 'system'
  resourceId?: string
  resourceType?: string
  actionUrl?: string
  actionLabel?: string
  metadata?: Record<string, any>
  createdAt: number
  readAt?: number
  archivedAt?: number
  dismissedAt?: number
  expiresAt?: number
}

export interface NotificationPreferences {
  userId: string
  emailEnabled: boolean
  emailAddress?: string
  notificationTypes: {
    [key in NotificationType]?: {
      enabled: boolean
      email: boolean
      priority: NotificationPriority
    }
  }
  dailyDigest: boolean
  dailyDigestTime: string
  updatedAt: number
}

export interface EmailNotification {
  id: string
  to: string[]
  cc?: string[]
  subject: string
  body: string
  htmlBody?: string
  notificationIds: string[]
  status: 'pending' | 'sent' | 'failed'
  sentAt?: number
  failureReason?: string
  createdAt: number
}

export type DisputeType = 'quality-issue' | 'quantity-shortage' | 'damaged-goods' | 'late-delivery' | 'incorrect-items' | 'pricing-error' | 'invoice-mismatch' | 'other'
export type DisputeStatus = 'open' | 'in-review' | 'supplier-contacted' | 'awaiting-response' | 'negotiating' | 'resolved' | 'closed' | 'escalated'
export type DisputePriority = 'low' | 'medium' | 'high' | 'critical'
export type DisputeResolution = 'credit-note' | 'replacement' | 'refund' | 'price-adjustment' | 'accepted-as-is' | 'partial-credit' | 'return-goods'

export interface SupplierDispute {
  id: string
  disputeNumber: string
  supplierId: string
  supplierName: string
  purchaseOrderId?: string
  grnId?: string
  invoiceId?: string
  disputeType: DisputeType
  status: DisputeStatus
  priority: DisputePriority
  title: string
  description: string
  disputedAmount: number
  claimAmount: number
  items: DisputeItem[]
  evidence: DisputeEvidence[]
  communications: DisputeCommunication[]
  resolution?: DisputeResolution
  resolutionDetails?: string
  agreedAmount?: number
  creditNoteNumber?: string
  creditNoteAmount?: number
  deadlineDate?: number
  raisedBy: string
  raisedAt: number
  contactedSupplierAt?: number
  responseReceivedAt?: number
  resolvedBy?: string
  resolvedAt?: number
  closedAt?: number
  escalatedTo?: string
  escalatedAt?: number
  notes?: string
  tags?: string[]
  updatedAt: number
}

export interface DisputeItem {
  id: string
  itemName: string
  inventoryItemId?: string
  grnItemId?: string
  invoiceItemId?: string
  issueDescription: string
  orderedQuantity?: number
  receivedQuantity?: number
  damagedQuantity?: number
  orderedPrice?: number
  invoicedPrice?: number
  disputedAmount: number
  photoEvidence?: string[]
}

export interface DisputeEvidence {
  id: string
  type: 'photo' | 'document' | 'email' | 'delivery-note' | 'invoice' | 'grn' | 'quality-report' | 'other'
  title: string
  description?: string
  fileUrl?: string
  fileData?: string
  uploadedBy: string
  uploadedAt: number
}

export interface DisputeCommunication {
  id: string
  direction: 'outgoing' | 'incoming'
  method: 'email' | 'phone' | 'meeting' | 'letter' | 'portal'
  contactPerson?: string
  subject?: string
  message: string
  response?: string
  attachments?: string[]
  sentBy?: string
  receivedFrom?: string
  timestamp: number
  followUpRequired: boolean
  followUpDate?: number
  notes?: string
}



export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
export type GuestSegment = 'vip' | 'corporate' | 'leisure' | 'group' | 'wedding' | 'repeat' | 'new'
export type CommunicationPreference = 'email' | 'sms' | 'phone' | 'whatsapp' | 'none'
export type ComplaintStatus = 'open' | 'investigating' | 'resolved' | 'closed' | 'escalated'
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent'
export type ComplaintCategory = 'room-cleanliness' | 'staff-behavior' | 'food-quality' | 'billing-issue' | 'amenities' | 'noise' | 'service-delay' | 'facility-maintenance' | 'other'
export type FeedbackRating = 1 | 2 | 3 | 4 | 5
export type MarketingCampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled'
export type MarketingChannelType = 'email' | 'sms' | 'both'
export type UpsellCategory = 'room-upgrade' | 'spa' | 'dining' | 'transport' | 'tours' | 'late-checkout' | 'early-checkin' | 'package' | 'other'
export type UpsellStatus = 'offered' | 'accepted' | 'declined' | 'pending'

export interface GuestProfile {
  id: string
  guestId: string
  salutation?: 'Mr' | 'Ms' | 'Mrs' | 'Dr' | 'Prof'
  firstName: string
  lastName: string
  email?: string
  phone: string
  alternatePhone?: string
  dateOfBirth?: number
  nationality?: string
  idType?: string
  idNumber?: string
  passportNumber?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  companyName?: string
  gstNumber?: string
  preferences: GuestPreferences
  loyaltyInfo: LoyaltyInfo
  segments: GuestSegment[]
  communicationPreference: CommunicationPreference[]
  doNotDisturb: boolean
  blacklisted: boolean
  blacklistReason?: string
  vipNotes?: string
  dietaryRestrictions?: string[]
  allergies?: string[]
  specialRequests?: string[]
  totalStays: number
  totalNights: number
  totalSpent: number
  averageSpendPerStay: number
  lastStayDate?: number
  nextReservationDate?: number
  acquisitionSource?: string
  referredBy?: string
  socialMediaHandles?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
  }
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
  }
  bookingHistory?: GuestBookingHistory[]
  tags?: string[]
  notes?: string
  createdAt: number
  updatedAt: number
  createdBy: string
}

export interface GuestBookingHistory {
  id: string
  reservationId: string
  checkInDate: number
  checkOutDate: number
  nights: number
  roomNumber?: string
  roomType: RoomType
  ratePerNight: number
  totalAmount: number
  amountPaid: number
  source: string
  status: ReservationStatus
  adults: number
  children: number
  specialRequests?: string
  servicesUsed?: string[]
  totalFnBSpend?: number
  totalExtraServicesSpend?: number
  feedback?: string
  rating?: number
  complaintsFiled?: number
  createdAt: number
}

export interface GuestPreferences {
  roomType?: RoomType
  floor?: string
  bedType?: 'king' | 'queen' | 'twin' | 'single'
  smoking?: boolean
  view?: 'sea' | 'city' | 'garden' | 'pool' | 'no-preference'
  pillow?: 'soft' | 'firm' | 'memory-foam' | 'feather'
  temperature?: number
  newspaper?: string
  wakeUpCall?: boolean
  wakeUpTime?: string
  minibarPreferences?: string[]
  roomAmenities?: string[]
  foodPreferences?: string[]
  beveragePreferences?: string[]
  transportPreferences?: string[]
  activityInterests?: string[]
  checkInTimePreference?: string
  checkOutTimePreference?: string
  roomLocation?: 'near-elevator' | 'far-from-elevator' | 'corner-room' | 'end-of-corridor' | 'no-preference'
  bedConfiguration?: string
  bathPreference?: 'shower' | 'bathtub' | 'both' | 'no-preference'
  connectingRooms?: boolean
  accessibilityNeeds?: string[]
  petFriendly?: boolean
  quietRoom?: boolean
  highFloor?: boolean
  paymentMethod?: PaymentMethod
  specialOccasions?: {
    type: 'birthday' | 'anniversary' | 'honeymoon' | 'other'
    date?: number
    notes?: string
  }[]
  notesForStaff?: string
}

export interface LoyaltyInfo {
  memberId?: string
  tier: LoyaltyTier
  points: number
  lifetimePoints: number
  pointsToNextTier: number
  tierSince: number
  tierBenefits: string[]
  pointsExpiring?: {
    points: number
    expiryDate: number
  }[]
  enrolledDate: number
  lastPointsEarned?: number
  lastPointsRedeemed?: number
}

export interface LoyaltyTransaction {
  id: string
  guestId: string
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted' | 'bonus'
  points: number
  balance: number
  reason: string
  reservationId?: string
  orderId?: string
  campaignId?: string
  referenceNumber?: string
  expiryDate?: number
  processedBy?: string
  notes?: string
  createdAt: number
}

export interface LoyaltyProgram {
  id: string
  name: string
  description: string
  isActive: boolean
  tiers: LoyaltyTier[]
  tierRequirements: {
    [key in LoyaltyTier]: {
      minPoints: number
      minStays: number
      minSpend: number
      benefits: string[]
      pointsMultiplier: number
    }
  }
  earningRules: {
    roomNightPoints: number
    spendMultiplier: number
    bonusCategories: {
      category: string
      multiplier: number
    }[]
  }
  redemptionRules: {
    minimumRedemption: number
    pointValue: number
    blackoutDates?: number[]
    restrictions?: string[]
  }
  pointsExpiry: {
    enabled: boolean
    expiryMonths: number
    warningDays: number
  }
  updatedAt: number
}

export interface GuestComplaint {
  id: string
  complaintNumber: string
  guestId: string
  guestName: string
  reservationId?: string
  roomNumber?: string
  category: ComplaintCategory
  priority: ComplaintPriority
  status: ComplaintStatus
  subject: string
  description: string
  reportedBy: string
  reportedAt: number
  reportedVia: 'in-person' | 'phone' | 'email' | 'social-media' | 'review-site' | 'other'
  assignedTo?: string
  assignedAt?: number
  department?: Department
  actionsTaken: ComplaintAction[]
  resolution?: string
  compensationOffered?: {
    type: 'refund' | 'discount' | 'upgrade' | 'loyalty-points' | 'complimentary-service' | 'other'
    value: number
    description: string
  }
  guestSatisfied?: boolean
  followUpRequired: boolean
  followUpDate?: number
  followUpBy?: string
  resolvedBy?: string
  resolvedAt?: number
  closedBy?: string
  closedAt?: number
  escalatedTo?: string
  escalatedAt?: number
  tags?: string[]
  attachments?: string[]
  internalNotes?: string
  updatedAt: number
}

export interface ComplaintAction {
  id: string
  actionType: 'investigation' | 'resolution-attempt' | 'compensation' | 'follow-up' | 'escalation' | 'closure'
  description: string
  takenBy: string
  takenAt: number
  result?: string
  notes?: string
}

export type ReviewSource = 'manual' | 'google-maps' | 'tripadvisor' | 'booking.com' | 'airbnb' | 'facebook'

export interface ReviewSourceConfig {
  id: string
  source: Exclude<ReviewSource, 'manual'>
  url: string
  isActive: boolean
  lastSync?: number
  reviewCount: number
  averageRating: number
  createdAt: number
  updatedAt: number
}

export interface GuestFeedback {
  id: string
  feedbackNumber: string
  guestId?: string
  guestName: string
  reservationId?: string
  roomNumber?: string
  stayCheckIn?: number
  stayCheckOut?: number
  submittedAt: number
  channel: 'email' | 'sms' | 'in-room-tablet' | 'website' | 'app' | 'front-desk' | 'phone' | 'review-site'
  reviewSource: ReviewSource
  reviewSourceUrl?: string
  externalReviewId?: string
  overallRating: FeedbackRating
  ratings: {
    roomCleanliness?: FeedbackRating
    roomComfort?: FeedbackRating
    staffService?: FeedbackRating
    foodQuality?: FeedbackRating
    facilities?: FeedbackRating
    valueForMoney?: FeedbackRating
    location?: FeedbackRating
    checkInExperience?: FeedbackRating
    checkOutExperience?: FeedbackRating
  }
  comments?: string
  highlights?: string[]
  improvements?: string[]
  wouldRecommend: boolean
  wouldReturn: boolean
  nps?: number
  sentiment?: 'positive' | 'neutral' | 'negative'
  reviewPublic?: boolean
  reviewPlatform?: string
  responseRequired: boolean
  respondedBy?: string
  responseText?: string
  respondedAt?: number
  tags?: string[]
  actionItems?: string[]
  createdAt: number
}

export interface MarketingTemplate {
  id: string
  templateId: string
  name: string
  description?: string
  type: 'promotional' | 'transactional' | 'welcome' | 'birthday' | 'anniversary' | 'loyalty' | 'feedback-request' | 'win-back' | 'booking-confirmation' | 'pre-arrival' | 'post-stay' | 'seasonal' | 'newsletter'
  channel: MarketingChannelType
  subject?: string
  emailBody?: string
  smsBody?: string
  variables: TemplateVariable[]
  segments?: GuestSegment[]
  tags?: string[]
  isActive: boolean
  usage: number
  openRate?: number
  clickRate?: number
  conversionRate?: number
  lastUsed?: number
  createdBy: string
  createdAt: number
  updatedAt: number
}

export interface TemplateVariable {
  name: string
  description: string
  example: string
  required: boolean
}

export interface MarketingCampaign {
  id: string
  campaignId: string
  name: string
  description?: string
  type: 'promotional' | 'loyalty' | 'seasonal' | 'feedback' | 'reengagement' | 'upsell' | 'event' | 'newsletter'
  status: MarketingCampaignStatus
  channel: MarketingChannelType
  templateId?: string
  targetSegments: GuestSegment[]
  targetTiers?: LoyaltyTier[]
  filters: CampaignFilter[]
  recipientCount: number
  scheduledDate?: number
  sentDate?: number
  completedDate?: number
  emailsSent: number
  smsSent: number
  emailsOpened: number
  emailsClicked: number
  conversions: number
  revenue: number
  cost: number
  roi?: number
  offer?: {
    type: 'discount-percentage' | 'discount-amount' | 'free-upgrade' | 'loyalty-points' | 'free-service' | 'package-deal'
    value: number
    code?: string
    validFrom?: number
    validUntil?: number
    termsAndConditions?: string
  }
  trackingLinks?: {
    name: string
    url: string
    clicks: number
  }[]
  unsubscribes: number
  bounces: number
  errors: number
  createdBy: string
  createdAt: number
  updatedAt: number
  completedBy?: string
  cancelledBy?: string
  cancelledAt?: number
  cancelReason?: string
  notes?: string
}

export interface CampaignFilter {
  field: 'totalStays' | 'totalSpent' | 'lastStayDate' | 'loyaltyTier' | 'segment' | 'country' | 'city' | 'hasEmail' | 'hasSMS' | 'age' | 'preferredRoomType'
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'between' | 'contains' | 'in'
  value: any
}

export interface UpsellOffer {
  id: string
  offerId: string
  name: string
  description: string
  category: UpsellCategory
  basePrice: number
  discountedPrice?: number
  isActive: boolean
  validFrom?: number
  validUntil?: number
  availableFor: {
    roomTypes?: RoomType[]
    segments?: GuestSegment[]
    tiers?: LoyaltyTier[]
    minimumStayNights?: number
  }
  inventory?: {
    total: number
    available: number
    reserved: number
  }
  commissionPercentage?: number
  images?: string[]
  highlights?: string[]
  termsAndConditions?: string
  displayOrder: number
  createdBy: string
  createdAt: number
  updatedAt: number
}

export interface UpsellTransaction {
  id: string
  transactionNumber: string
  guestId: string
  guestName: string
  reservationId?: string
  offerId: string
  offerName: string
  category: UpsellCategory
  status: UpsellStatus
  offeredAt: number
  offeredBy: string
  offeredVia: 'front-desk' | 'email' | 'sms' | 'app' | 'website' | 'phone' | 'in-room-tablet'
  respondedAt?: number
  amount: number
  discount?: number
  finalAmount: number
  commissionAmount?: number
  commissionPaidTo?: string
  paymentStatus?: PaymentStatus
  paymentMethod?: PaymentMethod
  folioId?: string
  deliveryDate?: number
  deliveryTime?: string
  deliveryStatus?: 'pending' | 'confirmed' | 'delivered' | 'cancelled'
  guestRating?: FeedbackRating
  guestFeedback?: string
  notes?: string
  createdAt: number
  updatedAt: number
}

export interface GuestCommunication {
  id: string
  guestId: string
  guestName: string
  type: 'email' | 'sms' | 'phone' | 'whatsapp' | 'in-person' | 'letter'
  direction: 'inbound' | 'outbound'
  subject?: string
  message: string
  templateId?: string
  campaignId?: string
  sentBy?: string
  receivedFrom?: string
  timestamp: number
  status?: 'sent' | 'delivered' | 'read' | 'failed' | 'bounced'
  channel?: string
  attachments?: string[]
  tags?: string[]
  relatedTo?: {
    type: 'reservation' | 'complaint' | 'feedback' | 'upsell' | 'campaign' | 'general'
    id: string
  }
  notes?: string
}

export interface GuestJourney {
  guestId: string
  events: JourneyEvent[]
  touchpoints: number
  lastInteraction: number
  engagementScore: number
  conversionRate: number
  lifetimeValue: number
}

export interface JourneyEvent {
  id: string
  type: 'website-visit' | 'inquiry' | 'reservation' | 'check-in' | 'upsell-offer' | 'upsell-accept' | 'complaint' | 'feedback' | 'campaign-sent' | 'campaign-opened' | 'campaign-clicked' | 'loyalty-earned' | 'loyalty-redeemed' | 'check-out' | 'review-posted'
  timestamp: number
  details: string
  metadata?: Record<string, any>
}

export type OTAChannel = 'booking.com' | 'agoda' | 'expedia' | 'airbnb' | 'makemytrip' | 'goibibo' | 'tripadvisor' | 'hotels.com' | 'direct-website'
export type OTAConnectionStatus = 'connected' | 'disconnected' | 'syncing' | 'error' | 'pending'
export type SyncDirection = 'push' | 'pull' | 'bidirectional'
export type SyncStatus = 'success' | 'failed' | 'in-progress' | 'pending' | 'partial'
export type RatePlanType = 'standard' | 'non-refundable' | 'advance-purchase' | 'package' | 'promotional' | 'corporate' | 'weekend' | 'long-stay'

export interface OTAConnection {
  id: string
  channel: OTAChannel
  name: string
  status: OTAConnectionStatus
  apiKey?: string
  propertyId?: string
  accountId?: string
  username?: string
  isActive: boolean
  autoSync: boolean
  syncFrequency: number
  lastSync?: number
  nextSync?: number
  totalBookings: number
  totalRevenue: number
  averageRating?: number
  reviewCount?: number
  commission: number
  syncSettings: {
    syncAvailability: boolean
    syncRates: boolean
    syncRestrictions: boolean
    syncInventory: boolean
    syncReservations: boolean
    syncReviews: boolean
  }
  lastError?: {
    code: string
    message: string
    timestamp: number
  }
  createdAt: number
  updatedAt: number
  connectedBy: string
}

export interface RatePlan {
  id: string
  planId: string
  name: string
  description?: string
  type: RatePlanType
  roomTypes: RoomType[]
  baseRate: number
  currency: string
  isActive: boolean
  channels: OTAChannel[]
  includedInPackage?: string[]
  mealPlan?: 'room-only' | 'breakfast' | 'half-board' | 'full-board' | 'all-inclusive'
  cancellationPolicy: {
    freeCancellationDays: number
    penaltyPercentage: number
    noShowCharge: number
  }
  advancePurchaseDays?: number
  minimumStay?: number
  maximumStay?: number
  blackoutDates?: number[]
  validFrom?: number
  validUntil?: number
  markup?: number
  discount?: number
  priority: number
  createdBy: string
  createdAt: number
  updatedAt: number
}

export interface ChannelInventory {
  id: string
  date: number
  roomType: RoomType
  totalRooms: number
  availableRooms: number
  channelAllocations: {
    [key in OTAChannel]?: number
  }
  reservedRooms: number
  blockedRooms: number
  overbooking: number
  lastUpdated: number
  updatedBy?: string
}

export interface ChannelRate {
  id: string
  date: number
  roomType: RoomType
  ratePlanId: string
  baseRate: number
  channelRates: {
    [key in OTAChannel]?: {
      rate: number
      currency: string
      commission: number
      netRate: number
      extraGuestCharge?: number
      childCharge?: number
    }
  }
  restrictions: RateRestrictions
  lastUpdated: number
  updatedBy?: string
}

export interface RateRestrictions {
  minimumStay?: number
  maximumStay?: number
  closedToArrival: boolean
  closedToDeparture: boolean
  stopSell: boolean
  minimumAdvanceBooking?: number
  maximumAdvanceBooking?: number
}

export interface ChannelReservation {
  id: string
  bookingId: string
  channel: OTAChannel
  channelBookingId: string
  guestId: string
  roomType: RoomType
  checkInDate: number
  checkOutDate: number
  adults: number
  children: number
  ratePlanId: string
  ratePerNight: number
  totalAmount: number
  commission: number
  netAmount: number
  currency: string
  status: ReservationStatus
  guestDetails: {
    firstName: string
    lastName: string
    email?: string
    phone?: string
    nationality?: string
    specialRequests?: string
  }
  paymentDetails: {
    method: 'prepaid' | 'pay-at-hotel' | 'virtual-card'
    status: PaymentStatus
    paidAmount: number
    cardDetails?: {
      type: string
      lastFour?: string
      expiryDate?: string
    }
  }
  cancellationPolicy: string
  syncedToPMS: boolean
  pmsReservationId?: string
  importedAt: number
  lastSyncedAt?: number
  notes?: string
}

export interface SyncLog {
  id: string
  channel: OTAChannel
  syncType: 'availability' | 'rates' | 'restrictions' | 'inventory' | 'reservations' | 'reviews' | 'full'
  direction: SyncDirection
  status: SyncStatus
  startedAt: number
  completedAt?: number
  duration?: number
  recordsProcessed: number
  recordsSuccessful: number
  recordsFailed: number
  errors?: SyncError[]
  details?: {
    roomTypes?: RoomType[]
    dateRange?: {
      from: number
      to: number
    }
    changes?: {
      created: number
      updated: number
      deleted: number
    }
  }
  triggeredBy: 'manual' | 'auto' | 'scheduled' | 'api-webhook'
  executedBy?: string
}

export interface SyncError {
  id: string
  errorCode: string
  message: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  resourceType?: string
  resourceId?: string
  timestamp: number
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: number
  resolution?: string
}

export interface ChannelPerformance {
  id: string
  channel: OTAChannel
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  startDate: number
  endDate: number
  bookings: number
  cancellations: number
  revenue: number
  commission: number
  netRevenue: number
  averageRoomRate: number
  averageLOS: number
  conversionRate: number
  reviewCount: number
  averageRating: number
  responseRate: number
  responseTime: number
  calculatedAt: number
}

export interface ChannelReview {
  id: string
  channel: OTAChannel
  externalReviewId: string
  guestName: string
  guestCountry?: string
  reservationId?: string
  channelBookingId?: string
  rating: number
  reviewTitle?: string
  reviewText: string
  positiveComments?: string
  negativeComments?: string
  submittedAt: number
  stayDate?: number
  tripType?: 'business' | 'leisure' | 'family' | 'couple' | 'solo' | 'group'
  roomType?: RoomType
  verified: boolean
  responseText?: string
  responseBy?: string
  respondedAt?: number
  sentiment?: 'positive' | 'neutral' | 'negative'
  categories?: {
    cleanliness?: number
    comfort?: number
    location?: number
    facilities?: number
    staff?: number
    valueForMoney?: number
    wifi?: number
  }
  helpful: number
  notHelpful: number
  isPublic: boolean
  syncedToFeedback: boolean
  feedbackId?: string
  importedAt: number
  lastSyncedAt?: number
  tags?: string[]
}

export interface BulkUpdateOperation {
  id: string
  operationType: 'rate-update' | 'availability-update' | 'restriction-update' | 'inventory-update'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  channels: OTAChannel[]
  roomTypes: RoomType[]
  dateRange: {
    from: number
    to: number
  }
  updates: {
    rate?: number
    rateAdjustment?: {
      type: 'percentage' | 'amount'
      value: number
    }
    availability?: number
    restrictions?: Partial<RateRestrictions>
  }
  applyToDaysOfWeek?: number[]
  totalRecords: number
  processedRecords: number
  failedRecords: number
  errors?: SyncError[]
  createdBy: string
  createdAt: number
  startedAt?: number
  completedAt?: number
  cancelledBy?: string
  cancelledAt?: number
}

export type GuestInvoiceType = 'guest-folio' | 'room-only' | 'fnb-only' | 'extras-only' | 'group-master' | 'proforma' | 'credit-note' | 'debit-note'
export type GuestInvoiceStatus = 'draft' | 'interim' | 'final' | 'posted' | 'cancelled' | 'refunded' | 'partially-refunded'
export type TaxType = 'vat' | 'gst' | 'service-charge' | 'sales-tax' | 'tourism-tax' | 'municipal-tax'
export type PaymentType = 'cash' | 'card' | 'bank-transfer' | 'mobile-payment' | 'corporate-billing' | 'voucher' | 'loyalty-points' | 'advance-deposit'
export type InvoiceDeliveryStatus = 'pending' | 'printed' | 'emailed' | 'downloaded' | 'failed'
export type DiscountType = 'percentage' | 'fixed-amount'
export type DiscountScope = 'line-item' | 'invoice-level' | 'category' | 'tax-exemption'

export interface TaxConfiguration {
  id: string
  name: string
  type: TaxType
  rate: number
  isInclusive: boolean
  isActive: boolean
  isCompoundTax: boolean
  appliesTo: Department[]
  exemptCategories?: string[]
  calculationOrder: number
  taxableOnServiceCharge: boolean
  startDate?: number
  endDate?: number
  registrationNumber?: string
  createdAt: number
  updatedAt: number
}

export interface ServiceChargeConfiguration {
  id: string
  rate: number
  isActive: boolean
  appliesTo: Department[]
  exemptCategories?: string[]
  isTaxable: boolean
  distributionRules?: {
    staffPercentage: number
    housePercentage: number
  }
  startDate?: number
  endDate?: number
  createdAt: number
  updatedAt: number
}

export interface GuestInvoice {
  id: string
  invoiceNumber: string
  invoiceType: GuestInvoiceType
  status: GuestInvoiceStatus
  folioIds: string[]
  reservationIds: string[]
  guestId: string
  guestName: string
  guestAddress?: string
  guestEmail?: string
  guestPhone?: string
  companyName?: string
  companyGSTNumber?: string
  companyAddress?: string
  roomNumber?: string
  checkInDate?: number
  checkOutDate?: number
  invoiceDate: number
  dueDate?: number
  currency: string
  exchangeRate: number
  lineItems: InvoiceLineItem[]
  splitBillingMap?: SplitBillingMapping[]
  subtotal: number
  discounts: InvoiceDiscount[]
  totalDiscount: number
  serviceChargeRate: number
  serviceChargeAmount: number
  taxLines: InvoiceTaxLine[]
  totalTax: number
  grandTotal: number
  payments: InvoicePaymentRecord[]
  totalPaid: number
  amountDue: number
  creditNotes: CreditNoteReference[]
  debitNotes: DebitNoteReference[]
  prepayments: PrepaymentApplication[]
  netAmountDue: number
  isPostedToAccounts: boolean
  postedToAccountsBy?: string
  postedToAccountsAt?: number
  accountingReference?: string
  glEntries?: GLEntry[]
  deliveryMethods: InvoiceDeliveryMethod[]
  pdfUrl?: string
  emailDeliveryStatus?: InvoiceDeliveryStatus
  emailDeliveredAt?: number
  printedBy?: string
  printedAt?: number
  downloadedBy?: string
  downloadedAt?: number
  auditTrail: InvoiceAuditEntry[]
  isGroupMaster: boolean
  groupMemberInvoices?: string[]
  parentGroupInvoiceId?: string
  splitFromInvoiceId?: string
  isTaxExempt: boolean
  taxExemptionReason?: string
  taxExemptionCertificate?: string
  specialInstructions?: string
  internalNotes?: string
  termsAndConditions?: string
  paymentInstructions?: string
  bankDetails?: BankingDetails
  qrCodeData?: string
  legalDisclaimer?: string
  cancellationReason?: string
  cancelledBy?: string
  cancelledAt?: number
  refundAmount?: number
  refundMethod?: PaymentType
  refundedAt?: number
  refundedBy?: string
  refundReference?: string
  createdBy: string
  createdAt: number
  updatedAt: number
  finalizedBy?: string
  finalizedAt?: number
}

export interface InvoiceLineItem {
  id: string
  folioChargeId?: string
  folioExtraServiceId?: string
  orderItemId?: string
  date: number
  itemType: 'room-charge' | 'fnb-restaurant' | 'fnb-minibar' | 'fnb-banquet' | 'fnb-room-service' | 'spa' | 'transport' | 'laundry' | 'telephone' | 'parking' | 'late-checkout' | 'early-checkin' | 'extra-service' | 'misc'
  department: Department
  description: string
  quantity: number
  unit: string
  unitPrice: number
  lineTotal: number
  discountType?: DiscountType
  discountValue?: number
  discountAmount?: number
  netAmount: number
  taxable: boolean
  serviceChargeApplicable: boolean
  serviceChargeAmount: number
  taxLines: LineTaxDetail[]
  totalTax: number
  lineGrandTotal: number
  postedBy?: string
  postedAt: number
  isSplit: boolean
  splitToInvoiceId?: string
  isVoided: boolean
  voidedBy?: string
  voidedAt?: number
  voidReason?: string
  reference?: string
  notes?: string
}

export interface LineTaxDetail {
  taxType: TaxType
  taxName: string
  taxRate: number
  taxableAmount: number
  taxAmount: number
  isInclusive: boolean
}

export interface InvoiceDiscount {
  id: string
  type: DiscountType
  scope: DiscountScope
  description: string
  value: number
  amount: number
  appliedToLineIds?: string[]
  appliedBy: string
  appliedAt: number
  approvalRequired: boolean
  approvedBy?: string
  approvedAt?: number
  reason?: string
  voucherCode?: string
  corporateContractId?: string
}

export interface InvoiceTaxLine {
  taxType: TaxType
  taxName: string
  taxRate: number
  taxableAmount: number
  taxAmount: number
  isInclusive: boolean
  breakdown?: {
    lineItemId: string
    description: string
    taxableAmount: number
    taxAmount: number
  }[]
}

export interface InvoicePaymentRecord {
  id: string
  paymentDate: number
  paymentType: PaymentType
  amount: number
  currency: string
  exchangeRate: number
  amountInBaseCurrency: number
  reference?: string
  authorizationCode?: string
  cardType?: string
  cardLast4?: string
  bankName?: string
  chequeNumber?: string
  voucherCode?: string
  loyaltyPointsUsed?: number
  receivedBy: string
  receivedAt: number
  isRefunded: boolean
  refundedAmount?: number
  refundedAt?: number
  refundReference?: string
  notes?: string
}

export interface CreditNoteReference {
  creditNoteId: string
  creditNoteNumber: string
  amount: number
  reason: string
  issuedAt: number
  issuedBy: string
}

export interface DebitNoteReference {
  debitNoteId: string
  debitNoteNumber: string
  amount: number
  reason: string
  issuedAt: number
  issuedBy: string
}

export interface PrepaymentApplication {
  prepaymentId: string
  reservationId: string
  amount: number
  appliedBy: string
  appliedAt: number
}

export interface GLEntry {
  accountCode: string
  accountName: string
  debit: number
  credit: number
  description: string
  postingDate: number
  reference: string
}

export interface InvoiceDeliveryMethod {
  method: 'print' | 'email' | 'download' | 'sms' | 'whatsapp' | 'portal'
  status: InvoiceDeliveryStatus
  recipient?: string
  attemptedAt: number
  deliveredAt?: number
  failureReason?: string
  retryCount: number
  deliveredBy?: string
}

export interface BankingDetails {
  bankName: string
  accountName: string
  accountNumber: string
  swiftCode?: string
  ibanNumber?: string
  branchName?: string
  branchCode?: string
  paymentInstructions?: string
}

export interface InvoiceAuditEntry {
  id: string
  action: 'created' | 'updated' | 'finalized' | 'payment-received' | 'voided' | 'split' | 'merged' | 'discount-applied' | 'tax-adjusted' | 'posted-to-accounts' | 'printed' | 'emailed' | 'cancelled' | 'refunded'
  description: string
  performedBy: string
  performedAt: number
  ipAddress?: string
  beforeSnapshot?: any
  afterSnapshot?: any
  changes?: {
    field: string
    oldValue: any
    newValue: any
  }[]
}

export interface SplitBillingMapping {
  originalLineItemId: string
  splitToInvoiceId: string
  splitAmount: number
  splitPercentage: number
  splitReason: string
}

export interface InvoiceTemplate {
  id: string
  name: string
  type: GuestInvoiceType
  isDefault: boolean
  headerLayout: {
    hotelLogo?: string
    hotelName: string
    hotelAddress: string
    hotelPhone: string
    hotelEmail: string
    hotelWebsite?: string
    taxRegistrationNumber?: string
    businessRegistrationNumber?: string
  }
  showColumns: {
    date: boolean
    itemCode: boolean
    quantity: boolean
    unit: boolean
    unitPrice: boolean
    discount: boolean
    serviceCharge: boolean
    tax: boolean
    lineTotal: boolean
  }
  footerText?: string
  legalDisclaimer?: string
  paymentInstructions?: string
  showBankDetails: boolean
  showQRCode: boolean
  showSignature: boolean
  colorScheme?: {
    primary: string
    secondary: string
    accent: string
  }
  createdAt: number
  updatedAt: number
}

export interface NightAuditLog {
  id: string
  auditDate: number
  auditPeriodStart: number
  auditPeriodEnd: number
  status: 'in-progress' | 'completed' | 'failed'
  startedBy: string
  startedAt: number
  completedAt?: number
  operations: NightAuditOperation[]
  roomChargesPosted: number
  fnbChargesPosted: number
  extraChargesPosted: number
  foliosClosed: number
  invoicesGenerated: number
  paymentsReconciled: number
  totalRevenue: number
  errors: AuditError[]
  warnings: AuditWarning[]
  summary: {
    roomRevenue: number
    fnbRevenue: number
    extraRevenue: number
    totalTax: number
    totalServiceCharge: number
    cashPayments: number
    cardPayments: number
    otherPayments: number
    outstandingBalance: number
  }
  nextAuditDate: number
  notes?: string
}

export interface NightAuditOperation {
  id: string
  operationType: 'post-room-charges' | 'post-fnb-charges' | 'post-extra-charges' | 'close-folios' | 'generate-invoices' | 'reconcile-payments' | 'update-inventory' | 'rotate-invoice-numbers' | 'generate-reports'
  status: 'pending' | 'completed' | 'failed' | 'skipped'
  recordsProcessed: number
  startTime: number
  endTime?: number
  duration?: number
  errors?: string[]
  details?: any
}

export interface AuditError {
  id: string
  errorType: string
  message: string
  resourceType?: string
  resourceId?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  requiresAction: boolean
  resolvedBy?: string
  resolvedAt?: number
  resolution?: string
}

export interface AuditWarning {
  id: string
  warningType: string
  message: string
  resourceType?: string
  resourceId?: string
  acknowledgedBy?: string
  acknowledgedAt?: number
}

export interface InvoiceNumberSequence {
  id: string
  invoiceType: GuestInvoiceType
  prefix: string
  currentNumber: number
  paddingLength: number
  suffix?: string
  resetPeriod: 'never' | 'daily' | 'monthly' | 'yearly' | 'financial-year'
  lastResetDate?: number
  nextResetDate?: number
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export interface ConsolidatedInvoiceRequest {
  folioIds: string[]
  invoiceType: GuestInvoiceType
  consolidationType: 'single-guest' | 'group-master' | 'split-billing'
  splitRules?: {
    type: 'by-line-item' | 'by-percentage' | 'by-amount' | 'by-department'
    allocations: {
      guestName: string
      folioId?: string
      percentage?: number
      amount?: number
      departments?: Department[]
      lineItemIds?: string[]
    }[]
  }
  discounts?: InvoiceDiscount[]
  applyPrepayments: boolean
  generateSeparateInvoices: boolean
  notes?: string
}

export interface InvoiceValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface InvoiceValidationWarning {
  field: string
  message: string
  suggestion?: string
}

export interface InvoiceValidationResult {
  isValid: boolean
  errors: InvoiceValidationError[]
  warnings: InvoiceValidationWarning[]
  lineItemValidations: {
    lineItemId: string
    isValid: boolean
    errors: string[]
  }[]
  taxCalculationVerified: boolean
  totalCalculationVerified: boolean
  paymentBalanceVerified: boolean
}

export type BudgetCategory = 'salary' | 'utilities' | 'supplies' | 'maintenance' | 'marketing' | 'inventory' | 'food-beverage' | 'housekeeping' | 'administrative' | 'other'
export type BudgetCategoryType = BudgetCategory
export type BudgetPeriod = 'monthly' | 'quarterly' | 'yearly'
export type ExpenseCategory = 'salary' | 'utilities' | 'supplies' | 'maintenance' | 'marketing' | 'food-beverage' | 'housekeeping' | 'administrative' | 'travel' | 'entertainment' | 'other'
export type PaymentTerms = 'net-7' | 'net-15' | 'net-30' | 'net-45' | 'net-60' | 'net-90' | 'due-on-receipt' | 'prepaid'

export interface Payment {
  id: string
  paymentNumber: string
  invoiceId?: string
  guestId?: string
  supplierId?: string
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  reference?: string
  notes?: string
  processedAt: number
  processedBy: string
  reconciled: boolean
  reconciledAt?: number
  reconciledBy?: string
  isRefunded: boolean
  refundedAmount?: number
  refundedAt?: number
  refundedBy?: string
  refundReference?: string
  refundReason?: string
  partialRefunds?: PaymentRefund[]
  originalPaymentId?: string
  isRefund: boolean
}

export interface PaymentRefund {
  id: string
  refundNumber: string
  originalPaymentId: string
  originalPaymentNumber: string
  amount: number
  refundMethod: PaymentMethod
  reason: string
  notes?: string
  approvedBy?: string
  approvedAt?: number
  processedBy: string
  processedAt: number
  invoiceId?: string
  guestId?: string
  reference?: string
  status: 'pending' | 'approved' | 'processed' | 'cancelled'
  createdAt: number
}

export interface Expense {
  id: string
  expenseNumber: string
  category: ExpenseCategory
  department: Department
  amount: number
  description: string
  date: number
  expenseDate: number
  supplierId?: string
  invoiceNumber?: string
  receiptUrl?: string
  paymentMethod?: PaymentMethod
  approvedBy?: string
  approvedAt?: number
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  createdBy: string
  createdAt: number
}

export interface Account {
  id: string
  accountNumber: string
  accountName: string
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  balance: number
  currency: string
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export interface BudgetCategoryItem {
  id?: string
  category: ExpenseCategory
  budgetedAmount: number
  actualAmount: number
  variance: number
  notes?: string
}

export interface Budget {
  id: string
  budgetName: string
  department: Department
  period: BudgetPeriod
  startDate: number
  endDate: number
  totalBudget: number
  totalActual: number
  variance: number
  categories: BudgetCategoryItem[]
  status: 'draft' | 'approved' | 'active' | 'closed'
  approvedBy?: string
  approvedAt?: number
  createdBy: string
  createdAt: number
  updatedAt: number
}

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
export type NormalBalance = 'debit' | 'credit'
export type JournalType = 'general' | 'sales' | 'purchase' | 'cash-receipts' | 'cash-payments' | 'payroll' | 'depreciation' | 'accrual' | 'adjustment'
export type JournalEntryStatus = 'draft' | 'pending-approval' | 'approved' | 'posted' | 'reversed' | 'rejected'
export type FiscalPeriodStatus = 'open' | 'locked' | 'closed'
export type ReconciliationStatus = 'unreconciled' | 'partial' | 'reconciled' | 'disputed'
export type GLPostingSource = 'manual' | 'guest-invoice' | 'supplier-invoice' | 'payment' | 'expense' | 'payroll' | 'bank-transfer' | 'folio' | 'pos' | 'grn' | 'purchase-order' | 'depreciation' | 'system'

export interface ChartOfAccount {
  id: string
  accountCode: string
  accountName: string
  accountType: AccountType
  parentAccountId?: string
  normalBalance: NormalBalance
  isActive: boolean
  isBankAccount: boolean
  isControlAccount: boolean
  currency: string
  taxApplicable: boolean
  costCenterEnabled: boolean
  description?: string
  reportingGroup?: string
  mappings: {
    posCategory?: string
    invoiceType?: GuestInvoiceType
    department?: Department
    paymentMethod?: PaymentMethod
  }
  currentBalance: number
  openingBalance: number
  fiscalYearOpeningBalance: number
  lastTransactionDate?: number
  createdAt: number
  updatedAt: number
  createdBy: string
}

export interface JournalEntry {
  id: string
  journalNumber: string
  journalType: JournalType
  status: JournalEntryStatus
  transactionDate: number
  postingDate?: number
  fiscalPeriod: string
  fiscalYear: string
  source: GLPostingSource
  sourceDocumentType?: string
  sourceDocumentId?: string
  sourceDocumentNumber?: string
  description: string
  reference?: string
  lines: JournalEntryLine[]
  totalDebit: number
  totalCredit: number
  isBalanced: boolean
  isRecurring: boolean
  recurringTemplateId?: string
  isReversal: boolean
  reversalOfEntryId?: string
  reversedByEntryId?: string
  reversalReason?: string
  attachments?: string[]
  tags?: string[]
  approvalWorkflow?: ApprovalStep[]
  createdBy: string
  createdAt: number
  submittedBy?: string
  submittedAt?: number
  approvedBy?: string
  approvedAt?: number
  postedBy?: string
  postedAt?: number
  rejectedBy?: string
  rejectedAt?: number
  rejectionReason?: string
  auditTrail: JournalAuditEntry[]
}

export interface JournalEntryLine {
  id: string
  lineNumber: number
  accountId: string
  accountCode: string
  accountName: string
  debit: number
  credit: number
  description?: string
  costCenter?: string
  department?: Department
  taxId?: string
  taxAmount?: number
  currency?: string
  exchangeRate?: number
  baseCurrencyAmount?: number
  reconciliationStatus: ReconciliationStatus
  reconciledWith?: string
  reconciledAt?: number
  reconciledBy?: string
}

export interface GLEntry {
  id: string
  journalEntryId: string
  journalNumber: string
  lineId: string
  accountId: string
  accountCode: string
  accountName: string
  transactionDate: number
  postingDate: number
  fiscalPeriod: string
  fiscalYear: string
  debit: number
  credit: number
  balance: number
  runningBalance: number
  description: string
  source: GLPostingSource
  sourceDocumentId?: string
  sourceDocumentNumber?: string
  costCenter?: string
  department?: Department
  createdBy: string
  createdAt: number
}

export interface FiscalPeriod {
  id: string
  periodCode: string
  periodName: string
  fiscalYear: string
  startDate: number
  endDate: number
  status: FiscalPeriodStatus
  isCurrentPeriod: boolean
  closedBy?: string
  closedAt?: number
  lockedBy?: string
  lockedAt?: number
  openedBy?: string
  openedAt?: number
  adjustmentEntries?: string[]
  notes?: string
}

export interface FiscalYear {
  id: string
  yearCode: string
  yearName: string
  startDate: number
  endDate: number
  isCurrent: boolean
  status: 'open' | 'closed'
  periods: string[]
  closedBy?: string
  closedAt?: number
  createdAt: number
}

export interface RecurringJournalTemplate {
  id: string
  templateName: string
  journalType: JournalType
  description: string
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly'
  startDate: number
  endDate?: number
  nextRunDate: number
  lastRunDate?: number
  isActive: boolean
  lines: RecurringJournalLine[]
  autoApprove: boolean
  autoPost: boolean
  createdBy: string
  createdAt: number
  updatedAt: number
}

export interface RecurringJournalLine {
  lineNumber: number
  accountId: string
  accountCode: string
  accountName: string
  debitFormula?: string
  creditFormula?: string
  fixedDebit?: number
  fixedCredit?: number
  description: string
  costCenter?: string
  department?: Department
}

export interface ApprovalStep {
  stepNumber: number
  approverRole: string
  approverId?: string
  approverName?: string
  status: 'pending' | 'approved' | 'rejected' | 'skipped'
  comments?: string
  timestamp?: number
}

export interface JournalAuditEntry {
  id: string
  action: 'created' | 'updated' | 'submitted' | 'approved' | 'rejected' | 'posted' | 'reversed' | 'deleted'
  performedBy: string
  performedByName: string
  timestamp: number
  changes?: {
    field: string
    oldValue: any
    newValue: any
  }[]
  comments?: string
  ipAddress?: string
}

export interface BankReconciliation {
  id: string
  reconciliationNumber: string
  bankAccountId: string
  bankAccountName: string
  statementDate: number
  statementBalance: number
  bookBalance: number
  difference: number
  status: 'in-progress' | 'completed' | 'discrepancy'
  statementFile?: string
  matchedTransactions: ReconciledTransaction[]
  unmatchedBankTransactions: BankTransaction[]
  unmatchedBookTransactions: GLEntry[]
  adjustmentEntries?: string[]
  reconciledBy?: string
  reconciledAt?: number
  reviewedBy?: string
  reviewedAt?: number
  notes?: string
  createdAt: number
  updatedAt: number
}

export interface BankTransaction {
  id: string
  transactionDate: number
  valueDate: number
  description: string
  reference?: string
  debit: number
  credit: number
  balance: number
  transactionType?: string
  matched: boolean
  matchedGLEntryId?: string
}

export interface ReconciledTransaction {
  bankTransactionId: string
  glEntryId: string
  matchType: 'exact' | 'partial' | 'manual' | 'fuzzy' | 'suggested' | 'manual-one-to-many' | 'manual-many-to-one'
  matchScore?: number
  reconciledAt: number
  reconciledBy: string
  relatedBankTransactionIds?: string[]
  relatedGLEntryIds?: string[]
}

export interface TrialBalance {
  id: string
  fiscalPeriod: string
  fiscalYear: string
  generatedAt: number
  generatedBy: string
  accounts: TrialBalanceAccount[]
  totalDebit: number
  totalCredit: number
  isBalanced: boolean
}

export interface TrialBalanceAccount {
  accountId: string
  accountCode: string
  accountName: string
  accountType: AccountType
  openingBalance: number
  debit: number
  credit: number
  closingBalance: number
  normalBalance: NormalBalance
}

export interface HotelBranding {
  id: string
  hotelName: string
  hotelAddress: string
  hotelCity: string
  hotelState: string
  hotelCountry: string
  hotelPostalCode: string
  hotelPhone: string
  hotelEmail: string
  hotelWebsite?: string
  taxRegistrationNumber?: string
  businessRegistrationNumber?: string
  logo?: string
  logoWidth?: number
  logoHeight?: number
  favicon?: string
  emailHeaderLogo?: string
  tagline?: string
  colorScheme: {
    primary: string
    secondary: string
    accent: string
  }
  footerGradient?: {
    color1: string
    color2: string
    color3: string
    color4: string
  }
  invoiceFooter?: string
  termsAndConditions?: string
  paymentInstructions?: string
  bankDetails: BankingDetails
  showQRCode: boolean
  qrCodeContent?: string
  travelDirections?: {
    gpsCoordinates?: string
    directionsFromAirport?: string
    directionsFromCity?: string
    drivingDirections?: string
    nearestLandmark?: string
    nearbyAttractions?: string
    localTravelTips?: string
    transportationOptions?: string
    taxiFare?: string
    publicTransport?: string
    shuttleService?: string
    shuttleSchedule?: string
    parkingInfo?: string
    googleMapsLink?: string
    wazeLink?: string
  }
  currency: string
  currencySymbol: string
  currencyPosition: 'before' | 'after'
  decimalPlaces: number
  dateFormat: string
  timeFormat: string
  timezone: string
  createdAt: number
  updatedAt: number
  updatedBy: string
}

export type EmailTemplateCategory = 'invoice' | 'batch' | 'reminder' | 'confirmation'

export interface EmailTemplate {
  id: string
  name: string
  code: string
  category: EmailTemplateCategory
  subject: string
  body: string
  isDefault: boolean
  isActive: boolean
  variables: string[]
  createdAt: number
  updatedAt: number
  createdBy: string
}

export interface EmailTrackingEvent {
  id: string
  emailSentId: string
  eventType: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed'
  timestamp: number
  recipientEmail: string
  linkClicked?: string
  userAgent?: string
  ipAddress?: string
  metadata?: Record<string, any>
}

export interface EmailSentRecord {
  id: string
  templateId: string
  templateName: string
  templateCategory: EmailTemplateCategory
  recipientEmail: string
  recipientName?: string
  guestId?: string
  invoiceId?: string
  batchId?: string
  subject: string
  sentAt: number
  sentBy: string
  status: 'sent' | 'delivered' | 'failed'
  failureReason?: string
  trackingId: string
  trackingLinks: EmailTrackingLink[]
  events: EmailTrackingEvent[]
  metadata?: Record<string, any>
}

export interface EmailTrackingLink {
  id: string
  originalUrl: string
  trackingUrl: string
  linkText?: string
  linkType: 'payment' | 'booking' | 'review' | 'portal' | 'custom'
  clicks: number
  uniqueClicks: number
  firstClickAt?: number
  lastClickAt?: number
}

export interface EmailTemplateAnalytics {
  templateId: string
  templateName: string
  templateCategory: EmailTemplateCategory
  period: 'daily' | 'weekly' | 'monthly' | 'all-time'
  startDate?: number
  endDate?: number
  totalSent: number
  totalDelivered: number
  totalBounced: number
  totalOpened: number
  totalClicked: number
  totalComplained: number
  totalUnsubscribed: number
  uniqueOpens: number
  uniqueClicks: number
  deliveryRate: number
  openRate: number
  clickRate: number
  clickToOpenRate: number
  bounceRate: number
  complaintRate: number
  unsubscribeRate: number
  averageTimeToOpen?: number
  averageTimeToClick?: number
  topLinks: {
    url: string
    linkText?: string
    clicks: number
    uniqueClicks: number
  }[]
  opensByHour: {
    hour: number
    opens: number
  }[]
  clicksByHour: {
    hour: number
    clicks: number
  }[]
  deviceBreakdown: {
    desktop: number
    mobile: number
    tablet: number
    unknown: number
  }
  calculatedAt: number
}

export interface EmailCampaignAnalytics {
  batchId: string
  batchName?: string
  campaignType: 'invoice-batch' | 'marketing' | 'reminder' | 'notification'
  templateId: string
  templateName: string
  sentAt: number
  sentBy: string
  totalRecipients: number
  totalSent: number
  totalDelivered: number
  totalBounced: number
  totalOpened: number
  totalClicked: number
  totalFailed: number
  deliveryRate: number
  openRate: number
  clickRate: number
  clickToOpenRate: number
  bounceRate: number
  revenue?: number
  conversions?: number
  conversionRate?: number
  costPerClick?: number
  roi?: number
  calculatedAt: number
}

export interface EmailAnalyticsSummary {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all-time'
  startDate?: number
  endDate?: number
  totalEmailsSent: number
  totalDelivered: number
  totalOpened: number
  totalClicked: number
  totalBounced: number
  averageDeliveryRate: number
  averageOpenRate: number
  averageClickRate: number
  averageBounceRate: number
  topPerformingTemplates: {
    templateId: string
    templateName: string
    openRate: number
    clickRate: number
    sent: number
  }[]
  bottomPerformingTemplates: {
    templateId: string
    templateName: string
    openRate: number
    clickRate: number
    sent: number
  }[]
  templateComparison: {
    templateId: string
    templateName: string
    sent: number
    openRate: number
    clickRate: number
    trend: 'up' | 'down' | 'stable'
  }[]
  calculatedAt: number
}

export type DashboardWidgetType = 
  | 'occupancy'
  | 'revenue-today'
  | 'housekeeping'
  | 'amenities-stock'
  | 'food-inventory'
  | 'maintenance-construction'
  | 'fnb-performance'
  | 'maintenance-status'
  | 'room-status'
  | 'low-stock'
  | 'arrivals-departures'
  | 'guest-feedback'
  | 'revenue-chart'
  | 'occupancy-chart'
  | 'department-performance'
  | 'pending-approvals'
  | 'financial-summary'
  | 'kitchen-operations'
  | 'crm-summary'
  | 'channel-performance'
  | 'period-comparison'

export type WidgetSize = 'small' | 'medium' | 'large' | 'full'

export interface DashboardWidget {
  id: string
  type: DashboardWidgetType
  title: string
  size: WidgetSize
  position: number
  isVisible: boolean
  refreshInterval?: number
  config?: WidgetConfig
}

export interface WidgetConfig {
  showComparison?: boolean
  comparisonPeriod?: 'yesterday' | 'last-week' | 'last-month' | 'last-year'
  displayMode?: 'table' | 'chart' | 'cards' | 'list'
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'donut'
  dateRange?: {
    from: number
    to: number
  }
  filters?: Record<string, any>
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  groupBy?: string
  showPercentages?: boolean
  showTrends?: boolean
  departments?: Department[]
  roomTypes?: RoomType[]
  thresholds?: {
    warning?: number
    critical?: number
  }
}

export interface DashboardLayout {
  id: string
  userId?: string
  userRole?: UserRole | SystemRole
  name: string
  description?: string
  isDefault: boolean
  isShared: boolean
  widgets: DashboardWidget[]
  columns: 1 | 2 | 3 | 4
  createdAt: number
  updatedAt: number
  createdBy: string
}

export interface RoleWidgetPreset {
  role: UserRole | SystemRole
  name: string
  description: string
  defaultWidgets: DashboardWidgetType[]
  recommendedWidgets: DashboardWidgetType[]
  layout: {
    columns: 1 | 2 | 3 | 4
    widgetSizes: Record<DashboardWidgetType, WidgetSize>
  }
}

export type CostCenterType = 'revenue' | 'service' | 'support' | 'administrative'
export type ProfitCenterStatus = 'active' | 'inactive' | 'suspended'

export interface CostCenter {
  id: string
  code: string
  name: string
  description?: string
  type: CostCenterType
  department?: Department
  parentCostCenterId?: string
  managerId?: string
  managerName?: string
  isActive: boolean
  budget?: number
  actualCost?: number
  allocatedExpenses: string[]
  costDriverMetric?: string
  allocationBasis?: 'headcount' | 'square-footage' | 'revenue' | 'transactions' | 'custom'
  allocationPercentage?: number
  notes?: string
  createdAt: number
  updatedAt: number
  createdBy: string
}

export interface ProfitCenter {
  id: string
  code: string
  name: string
  description?: string
  department?: Department
  managerId?: string
  managerName?: string
  costCenterIds: string[]
  status: ProfitCenterStatus
  targetRevenue?: number
  targetProfit?: number
  targetMargin?: number
  actualRevenue?: number
  actualCost?: number
  actualProfit?: number
  actualMargin?: number
  revenueStreams: RevenueStream[]
  performanceMetrics?: ProfitCenterPerformanceMetrics
  notes?: string
  createdAt: number
  updatedAt: number
  createdBy: string
}

export interface RevenueStream {
  id: string
  name: string
  category: 'room' | 'fnb' | 'extra-services' | 'spa' | 'events' | 'other'
  revenue: number
  percentage: number
}

export interface ProfitCenterPerformanceMetrics {
  period: string
  revenue: number
  directCosts: number
  allocatedCosts: number
  totalCosts: number
  grossProfit: number
  netProfit: number
  grossMargin: number
  netMargin: number
  roi: number
  revenueTrend: 'increasing' | 'stable' | 'decreasing'
  profitTrend: 'increasing' | 'stable' | 'decreasing'
}

export interface CostCenterReport {
  id: string
  reportNumber: string
  costCenterId: string
  costCenterCode: string
  costCenterName: string
  period: {
    from: number
    to: number
  }
  budgetedAmount: number
  actualAmount: number
  variance: number
  variancePercentage: number
  expenseBreakdown: CostCenterExpenseBreakdown[]
  monthlyTrend: MonthlyTrendData[]
  topExpenseCategories: {
    category: ExpenseCategory
    amount: number
    percentage: number
  }[]
  comparisonToPreviousPeriod: {
    previousAmount: number
    change: number
    changePercentage: number
  }
  recommendations: string[]
  generatedAt: number
  generatedBy: string
}

export interface CostCenterExpenseBreakdown {
  category: ExpenseCategory
  department: Department
  budgeted: number
  actual: number
  variance: number
  variancePercentage: number
  transactions: number
  averageTransactionValue: number
}

export interface ProfitCenterReport {
  id: string
  reportNumber: string
  profitCenterId: string
  profitCenterCode: string
  profitCenterName: string
  period: {
    from: number
    to: number
  }
  revenue: number
  directCosts: number
  allocatedCosts: number
  totalCosts: number
  grossProfit: number
  netProfit: number
  grossMargin: number
  netMargin: number
  targetRevenue: number
  targetProfit: number
  targetMargin: number
  revenueVariance: number
  profitVariance: number
  marginVariance: number
  revenueByStream: RevenueStream[]
  costByCenter: {
    costCenterId: string
    costCenterName: string
    amount: number
    percentage: number
  }[]
  monthlyTrend: MonthlyProfitTrendData[]
  departmentalContribution: DepartmentalContribution[]
  performanceRating: 'excellent' | 'good' | 'average' | 'below-average' | 'poor'
  keyInsights: string[]
  recommendations: string[]
  generatedAt: number
  generatedBy: string
}

export interface MonthlyTrendData {
  month: string
  period: number
  budgeted: number
  actual: number
  variance: number
  variancePercentage: number
}

export interface MonthlyProfitTrendData {
  month: string
  period: number
  revenue: number
  costs: number
  profit: number
  margin: number
}

export interface DepartmentalContribution {
  department: Department
  revenue: number
  costs: number
  profit: number
  margin: number
  revenuePercentage: number
  contributionPercentage: number
}

export interface ConsolidatedFinancialReport {
  id: string
  reportNumber: string
  reportType: 'cost-center' | 'profit-center' | 'departmental' | 'consolidated'
  period: {
    from: number
    to: number
  }
  totalRevenue: number
  totalCosts: number
  totalProfit: number
  overallMargin: number
  profitCenterSummary: {
    profitCenterId: string
    profitCenterName: string
    revenue: number
    profit: number
    margin: number
    ranking: number
  }[]
  costCenterSummary: {
    costCenterId: string
    costCenterName: string
    budgeted: number
    actual: number
    variance: number
    variancePercentage: number
    efficiency: number
  }[]
  departmentalSummary: {
    department: Department
    revenue: number
    costs: number
    profit: number
    margin: number
    headcount?: number
    revenuePerEmployee?: number
    profitPerEmployee?: number
  }[]
  topPerformers: {
    type: 'profit-center' | 'cost-center'
    id: string
    name: string
    metric: string
    value: number
  }[]
  bottomPerformers: {
    type: 'profit-center' | 'cost-center'
    id: string
    name: string
    metric: string
    value: number
  }[]
  executiveSummary: string
  strategicRecommendations: string[]
  generatedAt: number
  generatedBy: string
}
