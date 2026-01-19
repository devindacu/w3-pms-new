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
