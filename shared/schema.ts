import { pgTable, serial, varchar, text, timestamp, decimal, integer, boolean, date, jsonb, bigint } from 'drizzle-orm/pg-core';

export const guests = pgTable('guests', {
  id: text('id').primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  idType: varchar('id_type', { length: 50 }),
  idNumber: varchar('id_number', { length: 100 }),
  nationality: varchar('nationality', { length: 100 }),
  loyaltyPoints: integer('loyalty_points').default(0),
  totalStays: integer('total_stays').default(0),
  totalSpent: decimal('total_spent', { precision: 12, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const rooms = pgTable('rooms', {
  id: text('id').primaryKey(),
  roomNumber: varchar('room_number', { length: 20 }).notNull().unique(),
  roomType: varchar('room_type', { length: 50 }).notNull(),
  floor: integer('floor').notNull(),
  maxOccupancy: integer('max_occupancy').notNull(),
  baseRate: decimal('base_rate', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).default('vacant-clean'),
  amenities: text('amenities'),
  notes: text('notes'),
  lastCleaned: timestamp('last_cleaned'),
  assignedHousekeeper: text('assigned_housekeeper'),
});

export const reservations = pgTable('reservations', {
  id: text('id').primaryKey(),
  guestId: text('guest_id').references(() => guests.id).notNull(),
  roomId: text('room_id').references(() => rooms.id),
  checkInDate: timestamp('check_in_date').notNull(),
  checkOutDate: timestamp('check_out_date').notNull(),
  status: varchar('status', { length: 50 }).default('confirmed').notNull(),
  adults: integer('adults').notNull(),
  children: integer('children').default(0).notNull(),
  ratePerNight: decimal('rate_per_night', { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  advancePaid: decimal('advance_paid', { precision: 12, scale: 2 }).default('0').notNull(),
  source: text('source'),
  specialRequests: text('special_requests'),
  createdBy: text('created_by'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const folios = pgTable('folios', {
  id: text('id').primaryKey(),
  reservationId: text('reservation_id').references(() => reservations.id).notNull(),
  guestId: text('guest_id').references(() => guests.id).notNull(),
  status: varchar('status', { length: 50 }).default('open'),
  totalCharges: decimal('total_charges', { precision: 12, scale: 2 }).default('0'),
  totalPayments: decimal('total_payments', { precision: 12, scale: 2 }).default('0'),
  balance: decimal('balance', { precision: 12, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const inventoryItems = pgTable('inventory_items', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  category: varchar('category', { length: 100 }),
  unit: varchar('unit', { length: 50 }),
  currentStock: decimal('current_stock', { precision: 12, scale: 2 }).default('0'),
  reorderLevel: decimal('reorder_level', { precision: 12, scale: 2 }),
  reorderQuantity: decimal('reorder_quantity', { precision: 12, scale: 2 }),
  unitCost: decimal('unit_cost', { precision: 10, scale: 2 }),
  location: varchar('location', { length: 100 }),
  supplierId: text('supplier_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const housekeepingTasks = pgTable('housekeeping_tasks', {
  id: text('id').primaryKey(),
  roomId: text('room_id').references(() => rooms.id).notNull(),
  taskType: text('task_type').notNull(),
  status: varchar('status', { length: 50 }).default('pending'),
  priority: varchar('priority', { length: 20 }).default('medium'),
  assignedTo: text('assigned_to'),
  notes: text('notes'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const menuItems = pgTable('menu_items', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  category: varchar('category', { length: 100 }),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  isAvailable: boolean('is_available').default(true),
  preparationTime: integer('preparation_time'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  orderNumber: varchar('order_number', { length: 50 }).unique(),
  type: varchar('type', { length: 50 }),
  status: varchar('status', { length: 50 }).default('pending'),
  tableNumber: varchar('table_number', { length: 20 }),
  roomId: text('room_id'),
  guestId: text('guest_id'),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }),
  tax: decimal('tax', { precision: 10, scale: 2 }),
  total: decimal('total', { precision: 12, scale: 2 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const suppliers = pgTable('suppliers', {
  id: text('id').primaryKey(),
  supplierId: varchar('supplier_id', { length: 100 }).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  rating: decimal('rating', { precision: 3, scale: 1 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const employees = pgTable('employees', {
  id: text('id').primaryKey(),
  employeeId: varchar('employee_id', { length: 50 }).unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  department: varchar('department', { length: 100 }).notNull(),
  position: varchar('position', { length: 100 }).notNull(),
  role: varchar('role', { length: 100 }).notNull(),
  isActive: boolean('is_active').default(true),
  dateOfJoining: timestamp('date_of_joining'),
  salary: decimal('salary', { precision: 12, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  accountCode: varchar('account_code', { length: 50 }).unique(),
  name: varchar('name', { length: 200 }).notNull(),
  type: varchar('type', { length: 50 }),
  category: varchar('category', { length: 100 }),
  balance: decimal('balance', { precision: 15, scale: 2 }).default('0'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const systemUsers = pgTable('system_users', {
  id: text('id').primaryKey(),
  username: varchar('username', { length: 100 }).unique().notNull(),
  email: varchar('email', { length: 255 }),
  passwordHash: varchar('password_hash', { length: 512 }),
  role: varchar('role', { length: 50 }).default('staff'),
  department: varchar('department', { length: 100 }),
  isActive: boolean('is_active').default(true),
  lastLogin: timestamp('last_login'),
  passwordResetToken: varchar('password_reset_token', { length: 255 }),
  passwordResetExpires: timestamp('password_reset_expires'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const extraServiceCategories = pgTable('extra_service_categories', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const extraServices = pgTable('extra_services', {
  id: text('id').primaryKey(),
  categoryId: text('category_id').references(() => extraServiceCategories.id),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const shifts = pgTable('shifts', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  startTime: varchar('start_time', { length: 10 }),
  endTime: varchar('end_time', { length: 10 }),
  department: varchar('department', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const amenities = pgTable('amenities', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  category: varchar('category', { length: 100 }),
  currentStock: decimal('current_stock', { precision: 10, scale: 2 }).default('0'),
  reorderLevel: decimal('reorder_level', { precision: 10, scale: 2 }),
  unitCost: decimal('unit_cost', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const maintenanceRequests = pgTable('maintenance_requests', {
  id: text('id').primaryKey(),
  roomId: text('room_id'),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  priority: varchar('priority', { length: 20 }).default('medium'),
  status: varchar('status', { length: 50 }).default('pending'),
  assignedTo: varchar('assigned_to', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

export const systemSettings = pgTable('system_settings', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 100 }).unique().notNull(),
  value: text('value'),
  category: varchar('category', { length: 100 }),
  description: text('description'),
  isEncrypted: boolean('is_encrypted').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const systemVersions = pgTable('system_versions', {
  id: serial('id').primaryKey(),
  version: varchar('version', { length: 50 }).notNull(),
  appliedAt: timestamp('applied_at').defaultNow(),
  description: text('description'),
  migrationType: varchar('migration_type', { length: 50 }),
});


export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 50 }).notNull(),
  accountId: text('account_id'),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  description: text('description'),
  reference: varchar('reference', { length: 100 }),
  transactionDate: date('transaction_date'),
  createdBy: varchar('created_by', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const recipes = pgTable('recipes', {
  id: serial('id').primaryKey(),
  menuItemId: text('menu_item_id'),
  name: varchar('name', { length: 200 }).notNull(),
  instructions: text('instructions'),
  prepTime: integer('prep_time'),
  cookTime: integer('cook_time'),
  servings: integer('servings'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const recipeIngredients = pgTable('recipe_ingredients', {
  id: serial('id').primaryKey(),
  recipeId: integer('recipe_id').references(() => recipes.id),
  inventoryItemId: text('inventory_item_id'),
  quantity: decimal('quantity', { precision: 10, scale: 3 }).notNull(),
  unit: varchar('unit', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const rateCalendar = pgTable('rate_calendar', {
  id: serial('id').primaryKey(),
  roomType: varchar('room_type', { length: 50 }).notNull(),
  date: date('date').notNull(),
  rate: decimal('rate', { precision: 10, scale: 2 }).notNull(),
  availability: integer('availability').default(0),
  minStay: integer('min_stay').default(1),
  isBlocked: boolean('is_blocked').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const channels = pgTable('channels', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }),
  isActive: boolean('is_active').default(true),
  connectionDetails: text('connection_details'),
  commission: decimal('commission', { precision: 5, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  tableName: varchar('table_name', { length: 100 }).notNull(),
  recordId: integer('record_id'),
  action: varchar('action', { length: 20 }).notNull(),
  oldValues: text('old_values'),
  newValues: text('new_values'),
  changedBy: varchar('changed_by', { length: 100 }),
  changedAt: timestamp('changed_at').defaultNow(),
  ipAddress: varchar('ip_address', { length: 50 }),
});

export const channelBookings = pgTable('channel_bookings', {
  id: serial('id').primaryKey(),
  channelId: integer('channel_id').references(() => channels.id),
  reservationId: integer('reservation_id').references(() => reservations.id),
  externalBookingId: varchar('external_booking_id', { length: 100 }),
  channelName: varchar('channel_name', { length: 50 }).notNull(),
  guestName: varchar('guest_name', { length: 200 }),
  guestEmail: varchar('guest_email', { length: 255 }),
  roomType: varchar('room_type', { length: 100 }),
  checkIn: date('check_in').notNull(),
  checkOut: date('check_out').notNull(),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }),
  commission: decimal('commission', { precision: 12, scale: 2 }),
  status: varchar('status', { length: 50 }).default('confirmed'),
  syncStatus: varchar('sync_status', { length: 50 }).default('synced'),
  rawData: text('raw_data'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const channelSyncLogs = pgTable('channel_sync_logs', {
  id: serial('id').primaryKey(),
  channelId: integer('channel_id').references(() => channels.id),
  channelName: varchar('channel_name', { length: 50 }).notNull(),
  syncType: varchar('sync_type', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  recordsProcessed: integer('records_processed').default(0),
  recordsSuccess: integer('records_success').default(0),
  recordsFailed: integer('records_failed').default(0),
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  duration: integer('duration'),
});

export const systemBackups = pgTable('system_backups', {
  id: serial('id').primaryKey(),
  backupType: varchar('backup_type', { length: 50 }).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileSize: integer('file_size'),
  status: varchar('status', { length: 20 }).notNull(),
  tablesIncluded: text('tables_included'),
  recordCount: integer('record_count'),
  location: text('location'),
  createdBy: varchar('created_by', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  errorMessage: text('error_message'),
});

export const dataSyncQueue = pgTable('data_sync_queue', {
  id: serial('id').primaryKey(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: integer('entity_id').notNull(),
  operation: varchar('operation', { length: 20 }).notNull(),
  data: text('data'),
  status: varchar('status', { length: 20 }).default('pending'),
  retryCount: integer('retry_count').default(0),
  lastError: text('last_error'),
  createdAt: timestamp('created_at').defaultNow(),
  processedAt: timestamp('processed_at'),
});

export const ratePlans = pgTable('rate_plans', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  roomType: varchar('room_type', { length: 50 }),
  residentRate: decimal('resident_rate', { precision: 10, scale: 2 }).notNull(),
  nonResidentRate: decimal('non_resident_rate', { precision: 10, scale: 2 }).notNull(),
  mealPlan: varchar('meal_plan', { length: 50 }).default('room_only'),
  minNights: integer('min_nights').default(1),
  maxNights: integer('max_nights'),
  isActive: boolean('is_active').default(true),
  taxPercent: decimal('tax_percent', { precision: 5, scale: 2 }).default('16'),
  serviceChargePercent: decimal('service_charge_percent', { precision: 5, scale: 2 }).default('5'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const residentRules = pgTable('resident_rules', {
  id: serial('id').primaryKey(),
  ratePlanId: integer('rate_plan_id').references(() => ratePlans.id),
  countryCode: varchar('country_code', { length: 10 }).notNull(),
  countryName: varchar('country_name', { length: 100 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const seasonalMultipliers = pgTable('seasonal_multipliers', {
  id: serial('id').primaryKey(),
  ratePlanId: integer('rate_plan_id').references(() => ratePlans.id),
  name: varchar('name', { length: 100 }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  multiplier: decimal('multiplier', { precision: 5, scale: 3 }).default('1.000'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const promoCodes = pgTable('promo_codes', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).unique().notNull(),
  description: text('description'),
  discountType: varchar('discount_type', { length: 20 }).default('percent'),
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  minNights: integer('min_nights').default(1),
  maxUses: integer('max_uses'),
  usedCount: integer('used_count').default(0),
  validFrom: date('valid_from'),
  validTo: date('valid_to'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const widgetSettings = pgTable('widget_settings', {
  id: serial('id').primaryKey(),
  propertyId: varchar('property_id', { length: 100 }).default('default').unique(),
  primaryColor: varchar('primary_color', { length: 20 }).default('#1a56db'),
  accentColor: varchar('accent_color', { length: 20 }).default('#0e9f6e'),
  logoUrl: text('logo_url'),
  propertyName: varchar('property_name', { length: 200 }).default('Hotel'),
  welcomeMessage: text('welcome_message'),
  currencyCode: varchar('currency_code', { length: 10 }).default('KES'),
  currencySymbol: varchar('currency_symbol', { length: 10 }).default('KES'),
  residentLabel: varchar('resident_label', { length: 50 }).default('Resident'),
  nonResidentLabel: varchar('non_resident_label', { length: 50 }).default('Non-Resident'),
  showAddOns: boolean('show_add_ons').default(true),
  allowedOrigins: text('allowed_origins'),
  isActive: boolean('is_active').default(true),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const bookingPayments = pgTable('booking_payments', {
  id: serial('id').primaryKey(),
  reservationId: integer('reservation_id').references(() => reservations.id),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('KES'),
  method: varchar('method', { length: 50 }),
  status: varchar('status', { length: 50 }).default('pending'),
  transactionRef: varchar('transaction_ref', { length: 100 }),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const expenses = pgTable('expenses', {
  id: text('id').primaryKey(),
  category: varchar('category', { length: 100 }).notNull(),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  date: date('date').notNull(),
  vendor: varchar('vendor', { length: 200 }),
  receiptUrl: text('receipt_url'),
  approvedBy: varchar('approved_by', { length: 100 }),
  status: varchar('status', { length: 50 }).default('pending'),
  createdBy: varchar('created_by', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const budgets = pgTable('budgets', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  fiscalYear: varchar('fiscal_year', { length: 20 }).notNull(),
  period: varchar('period', { length: 50 }).notNull(),
  totalBudget: decimal('total_budget', { precision: 15, scale: 2 }).notNull(),
  spentAmount: decimal('spent_amount', { precision: 15, scale: 2 }).default('0'),
  status: varchar('status', { length: 50 }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const journalEntries = pgTable('journal_entries', {
  id: serial('id').primaryKey(),
  entryNumber: varchar('entry_number', { length: 50 }).unique(),
  date: date('date').notNull(),
  description: text('description').notNull(),
  totalDebit: decimal('total_debit', { precision: 15, scale: 2 }).notNull(),
  totalCredit: decimal('total_credit', { precision: 15, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).default('draft'),
  createdBy: varchar('created_by', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const attendanceRecords = pgTable('attendances', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').references(() => employees.id),
  date: date('date').notNull(),
  checkIn: timestamp('check_in'),
  checkOut: timestamp('check_out'),
  status: varchar('status', { length: 50 }).default('present'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const leaveRequests = pgTable('leave_requests', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').references(() => employees.id),
  leaveType: varchar('leave_type', { length: 50 }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  reason: text('reason'),
  status: varchar('status', { length: 50 }).default('pending'),
  approvedBy: varchar('approved_by', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const requisitions = pgTable('requisitions', {
  id: text('id').primaryKey(),
  requisitionNumber: varchar('requisition_number', { length: 50 }).unique(),
  requestedBy: varchar('requested_by', { length: 100 }),
  department: varchar('department', { length: 100 }),
  status: varchar('status', { length: 50 }).default('pending'),
  priority: varchar('priority', { length: 20 }).default('medium'),
  notes: text('notes'),
  totalEstimated: decimal('total_estimated', { precision: 12, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const purchaseOrders = pgTable('purchase_orders', {
  id: text('id').primaryKey(),
  poNumber: varchar('po_number', { length: 50 }).unique(),
  supplierId: text('supplier_id').references(() => suppliers.id),
  requisitionId: text('requisition_id').references(() => requisitions.id),
  status: varchar('status', { length: 50 }).default('draft'),
  orderDate: date('order_date'),
  expectedDelivery: date('expected_delivery'),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const goodsReceivedNotes = pgTable('goods_received_notes', {
  id: text('id').primaryKey(),
  grnNumber: varchar('grn_number', { length: 50 }).unique(),
  purchaseOrderId: text('purchase_order_id').references(() => purchaseOrders.id),
  receivedBy: varchar('received_by', { length: 100 }),
  receivedDate: date('received_date').notNull(),
  status: varchar('status', { length: 50 }).default('pending'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const guestProfiles = pgTable('guest_profiles', {
  id: text('id').primaryKey(),
  guestId: text('guest_id').references(() => guests.id),
  vipStatus: varchar('vip_status', { length: 50 }),
  preferences: text('preferences'),
  dietaryRestrictions: text('dietary_restrictions'),
  roomPreferences: text('room_preferences'),
  loyaltyTier: varchar('loyalty_tier', { length: 50 }).default('Bronze'),
  totalSpend: decimal('total_spend', { precision: 15, scale: 2 }).default('0'),
  totalVisits: integer('total_visits').default(0),
  data: jsonb('data').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const dutyRosters = pgTable('duty_rosters', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').references(() => employees.id).notNull(),
  shiftId: text('shift_id').references(() => shifts.id).notNull(),
  date: timestamp('date').notNull(),
  status: text('status').notNull().default('scheduled'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const costCenters = pgTable('cost_centers', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  department: text('department'),
  manager: text('manager'),
  budget: decimal('budget', { precision: 12, scale: 2 }).notNull().default('0'),
  spent: decimal('spent', { precision: 12, scale: 2 }).notNull().default('0'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const profitCenters = pgTable('profit_centers', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  department: text('department'),
  manager: text('manager'),
  targetRevenue: decimal('target_revenue', { precision: 12, scale: 2 }).notNull().default('0'),
  actualRevenue: decimal('actual_revenue', { precision: 12, scale: 2 }).notNull().default('0'),
  targetCost: decimal('target_cost', { precision: 12, scale: 2 }).notNull().default('0'),
  actualCost: decimal('actual_cost', { precision: 12, scale: 2 }).notNull().default('0'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const financialPayments = pgTable('payments', {
  id: text('id').primaryKey(),
  paymentNumber: text('payment_number').notNull(),
  type: text('type').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  method: text('method').notNull(),
  status: text('status').notNull().default('pending'),
  referenceId: text('reference_id'),
  referenceType: text('reference_type'),
  description: text('description'),
  processedAt: timestamp('processed_at'),
  processedBy: text('processed_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const activityLogs = pgTable('activity_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  details: jsonb('details'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const folioCharges = pgTable('folio_charges', {
  id: text('id').primaryKey(),
  folioId: text('folio_id').references(() => folios.id).notNull(),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
  department: text('department').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  postedBy: text('posted_by'),
});

export const folioPayments = pgTable('folio_payments', {
  id: text('id').primaryKey(),
  folioId: text('folio_id').references(() => folios.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  method: text('method').notNull(),
  status: text('status').notNull().default('pending'),
  reference: text('reference'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  receivedBy: text('received_by'),
});

export const guestInvoices = pgTable('guest_invoices', {
  id: text('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull().unique(),
  guestId: text('guest_id'),
  status: text('status').notNull().default('draft'),
  invoiceType: text('invoice_type').notNull().default('guest-folio'),
  grandTotal: decimal('grand_total', { precision: 12, scale: 2 }).notNull().default('0'),
  amountDue: decimal('amount_due', { precision: 12, scale: 2 }).notNull().default('0'),
  invoiceDate: bigint('invoice_date', { mode: 'number' }).notNull().default(0),
  data: jsonb('data').notNull().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const lostFoundItems = pgTable('lost_found_items', {
  id: text('id').primaryKey(),
  itemNumber: text('item_number').notNull().unique(),
  status: text('status').notNull().default('reported'),
  category: text('category'),
  foundDate: bigint('found_date', { mode: 'number' }).notNull().default(0),
  data: jsonb('data').notNull().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const extraSettings = pgTable('extra_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull().default({}),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Channel Manager Microservice Schema ─────────────────────────────────────

/**
 * Maps internal room types/rooms to OTA-specific room type codes.
 * Each OTA has its own room identifier scheme.
 */
export const channelRoomMappings = pgTable('channel_room_mappings', {
  id: serial('id').primaryKey(),
  channelId: integer('channel_id').references(() => channels.id).notNull(),
  channelName: varchar('channel_name', { length: 50 }).notNull(),
  internalRoomType: varchar('internal_room_type', { length: 100 }).notNull(),
  internalRoomId: text('internal_room_id'),
  otaRoomTypeCode: varchar('ota_room_type_code', { length: 100 }).notNull(),
  otaRoomTypeName: varchar('ota_room_type_name', { length: 200 }),
  otaRatePlanCode: varchar('ota_rate_plan_code', { length: 100 }),
  otaRatePlanName: varchar('ota_rate_plan_name', { length: 200 }),
  isActive: boolean('is_active').default(true),
  mappingMetadata: jsonb('mapping_metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Real-time inventory (allotment) per OTA per room per date.
 * Controls how many rooms are available to each channel on each night.
 */
export const channelInventory = pgTable('channel_inventory', {
  id: serial('id').primaryKey(),
  channelId: integer('channel_id').references(() => channels.id).notNull(),
  channelName: varchar('channel_name', { length: 50 }).notNull(),
  internalRoomType: varchar('internal_room_type', { length: 100 }).notNull(),
  otaRoomTypeCode: varchar('ota_room_type_code', { length: 100 }).notNull(),
  date: date('date').notNull(),
  totalInventory: integer('total_inventory').default(0).notNull(),
  availableInventory: integer('available_inventory').default(0).notNull(),
  bookedInventory: integer('booked_inventory').default(0).notNull(),
  isBlocked: boolean('is_blocked').default(false),
  minStay: integer('min_stay').default(1),
  maxStay: integer('max_stay'),
  cta: boolean('cta').default(false),  // Closed To Arrival
  ctd: boolean('ctd').default(false),  // Closed To Departure
  lastSyncedAt: timestamp('last_synced_at'),
  syncStatus: varchar('sync_status', { length: 20 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Rate (pricing) per OTA per room per date in LKR (default).
 * Supports multiple rate plan types.
 */
export const channelRates = pgTable('channel_rates', {
  id: serial('id').primaryKey(),
  channelId: integer('channel_id').references(() => channels.id).notNull(),
  channelName: varchar('channel_name', { length: 50 }).notNull(),
  internalRoomType: varchar('internal_room_type', { length: 100 }).notNull(),
  otaRoomTypeCode: varchar('ota_room_type_code', { length: 100 }).notNull(),
  otaRatePlanCode: varchar('ota_rate_plan_code', { length: 100 }),
  date: date('date').notNull(),
  baseRate: decimal('base_rate', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('LKR').notNull(),
  rateType: varchar('rate_type', { length: 20 }).default('BAR'),  // BAR, NET, GROSS
  extraAdultRate: decimal('extra_adult_rate', { precision: 10, scale: 2 }),
  extraChildRate: decimal('extra_child_rate', { precision: 10, scale: 2 }),
  mealPlan: varchar('meal_plan', { length: 50 }).default('room_only'),
  taxIncluded: boolean('tax_included').default(false),
  taxPercent: decimal('tax_percent', { precision: 5, scale: 2 }).default('0'),
  lastSyncedAt: timestamp('last_synced_at'),
  syncStatus: varchar('sync_status', { length: 20 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Enhanced job queue for channel manager operations.
 * Supports priority, retry with exponential backoff, dead letter.
 */
export const channelSyncJobs = pgTable('channel_sync_jobs', {
  id: serial('id').primaryKey(),
  jobType: varchar('job_type', { length: 50 }).notNull(),
  channelId: integer('channel_id').references(() => channels.id),
  channelName: varchar('channel_name', { length: 50 }),
  payload: jsonb('payload').notNull().default({}),
  priority: integer('priority').default(5),       // 1 (highest) to 10 (lowest)
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  attempts: integer('attempts').default(0).notNull(),
  maxAttempts: integer('max_attempts').default(3).notNull(),
  nextRunAt: timestamp('next_run_at').defaultNow(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  failedAt: timestamp('failed_at'),
  lastError: text('last_error'),
  errorHistory: jsonb('error_history').default([]),
  result: jsonb('result'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Webhook event log for all incoming OTA notifications.
 */
export const channelWebhookLogs = pgTable('channel_webhook_logs', {
  id: serial('id').primaryKey(),
  channelName: varchar('channel_name', { length: 50 }).notNull(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  externalBookingId: varchar('external_booking_id', { length: 100 }),
  rawPayload: text('raw_payload'),
  headers: jsonb('headers').default({}),
  processingStatus: varchar('processing_status', { length: 20 }).default('received'),
  processingError: text('processing_error'),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * Channel health monitoring - tracks connection status per OTA.
 */
export const channelHealth = pgTable('channel_health', {
  id: serial('id').primaryKey(),
  channelId: integer('channel_id').references(() => channels.id).notNull(),
  channelName: varchar('channel_name', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).default('unknown').notNull(),
  lastCheckedAt: timestamp('last_checked_at'),
  lastSuccessAt: timestamp('last_success_at'),
  lastFailureAt: timestamp('last_failure_at'),
  consecutiveFailures: integer('consecutive_failures').default(0),
  responseTimeMs: integer('response_time_ms'),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

/**
 * Channel-specific rate plan configurations.
 * Maps PMS internal rate plans to OTA rate plan codes,
 * with optional markup/discount rules per channel.
 */
export const channelRatePlans = pgTable('channel_rate_plans', {
  id: serial('id').primaryKey(),
  channelId: integer('channel_id').references(() => channels.id).notNull(),
  channelName: varchar('channel_name', { length: 50 }).notNull(),
  /** Internal PMS rate plan identifier */
  internalRatePlanId: varchar('internal_rate_plan_id', { length: 100 }).notNull(),
  internalRatePlanName: varchar('internal_rate_plan_name', { length: 200 }),
  /** OTA-specific rate plan code sent in API calls */
  otaRatePlanCode: varchar('ota_rate_plan_code', { length: 100 }).notNull(),
  otaRatePlanName: varchar('ota_rate_plan_name', { length: 200 }),
  /** Rate plan category: standard, non-refundable, advance-purchase, package, etc. */
  ratePlanType: varchar('rate_plan_type', { length: 50 }).default('standard'),
  /** Positive percentage added on top of base rate (e.g. 10 = +10%) */
  markupPercent: decimal('markup_percent', { precision: 8, scale: 4 }),
  /** Positive percentage deducted from base rate (e.g. 15 = -15%) */
  discountPercent: decimal('discount_percent', { precision: 8, scale: 4 }),
  currency: varchar('currency', { length: 10 }).default('LKR').notNull(),
  mealPlan: varchar('meal_plan', { length: 50 }).default('room_only'),
  minStay: integer('min_stay').default(1),
  maxStay: integer('max_stay'),
  /** Free-text cancellation policy description */
  cancellationPolicy: text('cancellation_policy'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
