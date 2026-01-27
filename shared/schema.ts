import { pgTable, serial, varchar, text, timestamp, decimal, integer, boolean, date } from 'drizzle-orm/pg-core';

export const guests = pgTable('guests', {
  id: serial('id').primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  country: varchar('country', { length: 100 }),
  idType: varchar('id_type', { length: 50 }),
  idNumber: varchar('id_number', { length: 100 }),
  nationality: varchar('nationality', { length: 100 }),
  dateOfBirth: date('date_of_birth'),
  loyaltyPoints: integer('loyalty_points').default(0),
  loyaltyTier: varchar('loyalty_tier', { length: 50 }).default('Bronze'),
  totalVisits: integer('total_visits').default(0),
  totalSpent: decimal('total_spent', { precision: 12, scale: 2 }).default('0'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const rooms = pgTable('rooms', {
  id: serial('id').primaryKey(),
  number: varchar('number', { length: 20 }).notNull().unique(),
  type: varchar('type', { length: 50 }).notNull(),
  floor: integer('floor'),
  capacity: integer('capacity').default(2),
  baseRate: decimal('base_rate', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).default('available'),
  amenities: text('amenities'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const reservations = pgTable('reservations', {
  id: serial('id').primaryKey(),
  guestId: integer('guest_id').references(() => guests.id),
  roomId: integer('room_id').references(() => rooms.id),
  confirmationNumber: varchar('confirmation_number', { length: 50 }).unique(),
  checkInDate: date('check_in_date').notNull(),
  checkOutDate: date('check_out_date').notNull(),
  status: varchar('status', { length: 50 }).default('confirmed'),
  adults: integer('adults').default(1),
  children: integer('children').default(0),
  ratePerNight: decimal('rate_per_night', { precision: 10, scale: 2 }),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }),
  advancePaid: decimal('advance_paid', { precision: 12, scale: 2 }).default('0'),
  balance: decimal('balance', { precision: 12, scale: 2 }),
  source: varchar('source', { length: 50 }),
  specialRequests: text('special_requests'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const folios = pgTable('folios', {
  id: serial('id').primaryKey(),
  reservationId: integer('reservation_id').references(() => reservations.id),
  guestId: integer('guest_id').references(() => guests.id),
  folioNumber: varchar('folio_number', { length: 50 }).unique(),
  status: varchar('status', { length: 50 }).default('open'),
  totalCharges: decimal('total_charges', { precision: 12, scale: 2 }).default('0'),
  totalPayments: decimal('total_payments', { precision: 12, scale: 2 }).default('0'),
  balance: decimal('balance', { precision: 12, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const inventoryItems = pgTable('inventory_items', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  category: varchar('category', { length: 100 }),
  unit: varchar('unit', { length: 50 }),
  currentStock: decimal('current_stock', { precision: 12, scale: 2 }).default('0'),
  reorderLevel: decimal('reorder_level', { precision: 12, scale: 2 }),
  reorderQuantity: decimal('reorder_quantity', { precision: 12, scale: 2 }),
  unitCost: decimal('unit_cost', { precision: 10, scale: 2 }),
  location: varchar('location', { length: 100 }),
  supplierId: integer('supplier_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const housekeepingTasks = pgTable('housekeeping_tasks', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').references(() => rooms.id),
  type: varchar('type', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).default('pending'),
  priority: varchar('priority', { length: 20 }).default('medium'),
  assignedTo: varchar('assigned_to', { length: 100 }),
  notes: text('notes'),
  scheduledDate: date('scheduled_date'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const menuItems = pgTable('menu_items', {
  id: serial('id').primaryKey(),
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
  id: serial('id').primaryKey(),
  orderNumber: varchar('order_number', { length: 50 }).unique(),
  type: varchar('type', { length: 50 }),
  status: varchar('status', { length: 50 }).default('pending'),
  tableNumber: varchar('table_number', { length: 20 }),
  roomId: integer('room_id'),
  guestId: integer('guest_id'),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }),
  tax: decimal('tax', { precision: 10, scale: 2 }),
  total: decimal('total', { precision: 12, scale: 2 }),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  contactPerson: varchar('contact_person', { length: 100 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  category: varchar('category', { length: 100 }),
  rating: decimal('rating', { precision: 3, scale: 2 }),
  status: varchar('status', { length: 50 }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  employeeId: varchar('employee_id', { length: 50 }).unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  department: varchar('department', { length: 100 }),
  position: varchar('position', { length: 100 }),
  status: varchar('status', { length: 50 }).default('active'),
  dateOfJoining: date('date_of_joining'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
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
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).unique().notNull(),
  email: varchar('email', { length: 255 }),
  role: varchar('role', { length: 50 }).default('staff'),
  department: varchar('department', { length: 100 }),
  isActive: boolean('is_active').default(true),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const extraServiceCategories = pgTable('extra_service_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const extraServices = pgTable('extra_services', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => extraServiceCategories.id),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const shifts = pgTable('shifts', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  startTime: varchar('start_time', { length: 10 }),
  endTime: varchar('end_time', { length: 10 }),
  department: varchar('department', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const amenities = pgTable('amenities', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  category: varchar('category', { length: 100 }),
  currentStock: decimal('current_stock', { precision: 10, scale: 2 }).default('0'),
  reorderLevel: decimal('reorder_level', { precision: 10, scale: 2 }),
  unitCost: decimal('unit_cost', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const maintenanceRequests = pgTable('maintenance_requests', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id'),
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
