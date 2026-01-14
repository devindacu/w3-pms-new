import { pgTable, text, integer, boolean, timestamp, decimal, jsonb, serial, varchar, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const guests = pgTable("guests", {
  id: text("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  nationality: text("nationality"),
  idType: text("id_type"),
  idNumber: text("id_number"),
  address: text("address"),
  preferences: jsonb("preferences").$type<string[]>(),
  loyaltyPoints: integer("loyalty_points").default(0).notNull(),
  totalStays: integer("total_stays").default(0).notNull(),
  totalSpent: decimal("total_spent", { precision: 12, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rooms = pgTable("rooms", {
  id: text("id").primaryKey(),
  roomNumber: text("room_number").notNull().unique(),
  floor: integer("floor").notNull(),
  roomType: text("room_type").notNull(),
  status: text("status").notNull().default("vacant-clean"),
  baseRate: decimal("base_rate", { precision: 10, scale: 2 }).notNull(),
  maxOccupancy: integer("max_occupancy").notNull(),
  amenities: jsonb("amenities").$type<string[]>(),
  lastCleaned: timestamp("last_cleaned"),
  assignedHousekeeper: text("assigned_housekeeper"),
  notes: text("notes"),
});

export const reservations = pgTable("reservations", {
  id: text("id").primaryKey(),
  guestId: text("guest_id").notNull().references(() => guests.id),
  roomId: text("room_id").references(() => rooms.id),
  checkInDate: timestamp("check_in_date").notNull(),
  checkOutDate: timestamp("check_out_date").notNull(),
  adults: integer("adults").notNull(),
  children: integer("children").default(0).notNull(),
  status: text("status").notNull().default("confirmed"),
  ratePerNight: decimal("rate_per_night", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  advancePaid: decimal("advance_paid", { precision: 12, scale: 2 }).default("0").notNull(),
  source: text("source"),
  specialRequests: text("special_requests"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: text("created_by"),
}, (table) => ({
  guestIdIdx: index("reservations_guest_id_idx").on(table.guestId),
  roomIdIdx: index("reservations_room_id_idx").on(table.roomId),
  statusIdx: index("reservations_status_idx").on(table.status),
}));

export const folios = pgTable("folios", {
  id: text("id").primaryKey(),
  reservationId: text("reservation_id").notNull().references(() => reservations.id),
  guestId: text("guest_id").notNull().references(() => guests.id),
  balance: decimal("balance", { precision: 12, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const folioCharges = pgTable("folio_charges", {
  id: text("id").primaryKey(),
  folioId: text("folio_id").notNull().references(() => folios.id),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  department: text("department").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  postedBy: text("posted_by"),
});

export const folioPayments = pgTable("folio_payments", {
  id: text("id").primaryKey(),
  folioId: text("folio_id").notNull().references(() => folios.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: text("method").notNull(),
  status: text("status").notNull().default("pending"),
  reference: text("reference"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  receivedBy: text("received_by"),
});

export const inventoryItems = pgTable("inventory_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  unit: text("unit").notNull(),
  currentStock: decimal("current_stock", { precision: 10, scale: 2 }).default("0").notNull(),
  reorderLevel: decimal("reorder_level", { precision: 10, scale: 2 }).default("0").notNull(),
  reorderQuantity: decimal("reorder_quantity", { precision: 10, scale: 2 }).default("0").notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }).default("0").notNull(),
  supplierId: text("supplier_id"),
  storeLocation: text("store_location"),
  expiryDate: timestamp("expiry_date"),
  batchNumber: text("batch_number"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const housekeepingTasks = pgTable("housekeeping_tasks", {
  id: text("id").primaryKey(),
  roomId: text("room_id").notNull().references(() => rooms.id),
  assignedTo: text("assigned_to"),
  taskType: text("task_type").notNull(),
  status: text("status").notNull().default("pending"),
  priority: text("priority").default("normal").notNull(),
  notes: text("notes"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const menuItems = pgTable("menu_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  recipeId: text("recipe_id"),
  available: boolean("available").default(true).notNull(),
  preparationTime: integer("preparation_time").default(0).notNull(),
  imageUrl: text("image_url"),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  type: text("type").notNull(),
  guestId: text("guest_id").references(() => guests.id),
  roomId: text("room_id").references(() => rooms.id),
  tableNumber: text("table_number"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).default("0").notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).default("0").notNull(),
  status: text("status").notNull().default("pending"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: text("created_by"),
  completedAt: timestamp("completed_at"),
});

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  menuItemId: text("menu_item_id").notNull().references(() => menuItems.id),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  specialInstructions: text("special_instructions"),
  status: text("status").notNull().default("pending"),
});

export const suppliers = pgTable("suppliers", {
  id: text("id").primaryKey(),
  supplierId: text("supplier_id").notNull().unique(),
  name: text("name").notNull(),
  category: jsonb("category").$type<string[]>(),
  contactPersons: jsonb("contact_persons").$type<any[]>(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  postalCode: text("postal_code"),
  taxId: text("tax_id"),
  businessRegNumber: text("business_reg_number"),
  website: text("website"),
  paymentTerms: text("payment_terms"),
  creditLimit: decimal("credit_limit", { precision: 12, scale: 2 }),
  deliveryTimeDays: integer("delivery_time_days"),
  minimumOrderValue: decimal("minimum_order_value", { precision: 10, scale: 2 }),
  rating: decimal("rating", { precision: 3, scale: 1 }),
  deliveryTimeRating: decimal("delivery_time_rating", { precision: 3, scale: 1 }),
  costRating: decimal("cost_rating", { precision: 3, scale: 1 }),
  qualityRating: decimal("quality_rating", { precision: 3, scale: 1 }),
  totalOrders: integer("total_orders").default(0),
  totalSpent: decimal("total_spent", { precision: 12, scale: 2 }).default("0"),
  bankName: text("bank_name"),
  bankAccountNumber: text("bank_account_number"),
  bankBranch: text("bank_branch"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const employees = pgTable("employees", {
  id: text("id").primaryKey(),
  employeeId: text("employee_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  department: text("department").notNull(),
  position: text("position").notNull(),
  role: text("role").notNull(),
  dateOfBirth: timestamp("date_of_birth"),
  dateOfJoining: timestamp("date_of_joining"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  salary: decimal("salary", { precision: 12, scale: 2 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const maintenanceRequests = pgTable("maintenance_requests", {
  id: text("id").primaryKey(),
  requestNumber: text("request_number").notNull().unique(),
  roomId: text("room_id").references(() => rooms.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("scheduled"),
  assignedTo: text("assigned_to"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: text("created_by"),
});

export const requisitions = pgTable("requisitions", {
  id: text("id").primaryKey(),
  requisitionNumber: text("requisition_number").notNull().unique(),
  department: text("department").notNull(),
  requestedBy: text("requested_by").notNull(),
  items: jsonb("items").$type<any[]>(),
  status: text("status").notNull().default("draft"),
  priority: text("priority").default("normal"),
  notes: text("notes"),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const purchaseOrders = pgTable("purchase_orders", {
  id: text("id").primaryKey(),
  poNumber: text("po_number").notNull().unique(),
  supplierId: text("supplier_id").notNull().references(() => suppliers.id),
  requisitionId: text("requisition_id").references(() => requisitions.id),
  items: jsonb("items").$type<any[]>(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0").notNull(),
  tax: decimal("tax", { precision: 12, scale: 2 }).default("0").notNull(),
  total: decimal("total", { precision: 12, scale: 2 }).default("0").notNull(),
  status: text("status").notNull().default("draft"),
  expectedDelivery: timestamp("expected_delivery"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: text("created_by"),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at"),
  sentAt: timestamp("sent_at"),
  sentBy: text("sent_by"),
  revisionNumber: integer("revision_number").default(0),
});

export const goodsReceivedNotes = pgTable("goods_received_notes", {
  id: text("id").primaryKey(),
  grnNumber: text("grn_number").notNull().unique(),
  purchaseOrderId: text("purchase_order_id").notNull().references(() => purchaseOrders.id),
  supplierId: text("supplier_id").notNull().references(() => suppliers.id),
  items: jsonb("items").$type<any[]>(),
  receivedAt: timestamp("received_at").defaultNow().notNull(),
  receivedBy: text("received_by"),
  notes: text("notes"),
  invoiceNumber: text("invoice_number"),
});

export const systemUsers = pgTable("system_users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  email: text("email"),
  role: text("role").notNull(),
  department: text("department"),
  isActive: boolean("is_active").default(true).notNull(),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activityLogs = pgTable("activity_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  details: jsonb("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const extraServiceCategories = pgTable("extra_service_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const extraServices = pgTable("extra_services", {
  id: text("id").primaryKey(),
  categoryId: text("category_id").notNull().references(() => extraServiceCategories.id),
  name: text("name").notNull(),
  description: text("description"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0").notNull(),
  unit: text("unit").notNull(),
  status: text("status").notNull().default("active"),
  department: text("department").notNull(),
  requiresApproval: boolean("requires_approval").default(false).notNull(),
  maxQuantity: integer("max_quantity"),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: text("created_by"),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountCode: text("account_code").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  category: text("category"),
  parentId: text("parent_id"),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0").notNull(),
  currency: text("currency").default("USD").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  paymentNumber: text("payment_number").notNull().unique(),
  type: text("type").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  method: text("method").notNull(),
  status: text("status").notNull().default("pending"),
  referenceId: text("reference_id"),
  referenceType: text("reference_type"),
  description: text("description"),
  processedAt: timestamp("processed_at"),
  processedBy: text("processed_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const expenses = pgTable("expenses", {
  id: text("id").primaryKey(),
  expenseNumber: text("expense_number").notNull().unique(),
  category: text("category").notNull(),
  department: text("department"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  vendorName: text("vendor_name"),
  invoiceNumber: text("invoice_number"),
  status: text("status").notNull().default("pending"),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: text("created_by"),
});

export const budgets = pgTable("budgets", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  department: text("department"),
  category: text("category"),
  allocatedAmount: decimal("allocated_amount", { precision: 12, scale: 2 }).notNull(),
  spentAmount: decimal("spent_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const costCenters = pgTable("cost_centers", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  department: text("department"),
  manager: text("manager"),
  budget: decimal("budget", { precision: 12, scale: 2 }).default("0").notNull(),
  spent: decimal("spent", { precision: 12, scale: 2 }).default("0").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const profitCenters = pgTable("profit_centers", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  department: text("department"),
  manager: text("manager"),
  targetRevenue: decimal("target_revenue", { precision: 12, scale: 2 }).default("0").notNull(),
  actualRevenue: decimal("actual_revenue", { precision: 12, scale: 2 }).default("0").notNull(),
  targetCost: decimal("target_cost", { precision: 12, scale: 2 }).default("0").notNull(),
  actualCost: decimal("actual_cost", { precision: 12, scale: 2 }).default("0").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const amenities = pgTable("amenities", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  unit: text("unit").notNull(),
  currentStock: decimal("current_stock", { precision: 10, scale: 2 }).default("0").notNull(),
  reorderLevel: decimal("reorder_level", { precision: 10, scale: 2 }).default("0").notNull(),
  costPerUnit: decimal("cost_per_unit", { precision: 10, scale: 2 }).default("0").notNull(),
  department: text("department"),
  isActive: boolean("is_active").default(true).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const attendances = pgTable("attendances", {
  id: text("id").primaryKey(),
  employeeId: text("employee_id").notNull().references(() => employees.id),
  date: timestamp("date").notNull(),
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  status: text("status").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leaveRequests = pgTable("leave_requests", {
  id: text("id").primaryKey(),
  employeeId: text("employee_id").notNull().references(() => employees.id),
  leaveType: text("leave_type").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  reason: text("reason"),
  status: text("status").notNull().default("pending"),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const shifts = pgTable("shifts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  department: text("department").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  breakDuration: integer("break_duration").default(0),
  isActive: boolean("is_active").default(true).notNull(),
});

export const dutyRosters = pgTable("duty_rosters", {
  id: text("id").primaryKey(),
  employeeId: text("employee_id").notNull().references(() => employees.id),
  shiftId: text("shift_id").notNull().references(() => shifts.id),
  date: timestamp("date").notNull(),
  status: text("status").default("scheduled").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const guestRelations = relations(guests, ({ many }) => ({
  reservations: many(reservations),
  folios: many(folios),
  orders: many(orders),
}));

export const roomRelations = relations(rooms, ({ many }) => ({
  reservations: many(reservations),
  housekeepingTasks: many(housekeepingTasks),
  orders: many(orders),
}));

export const reservationRelations = relations(reservations, ({ one, many }) => ({
  guest: one(guests, { fields: [reservations.guestId], references: [guests.id] }),
  room: one(rooms, { fields: [reservations.roomId], references: [rooms.id] }),
  folios: many(folios),
}));

export const folioRelations = relations(folios, ({ one, many }) => ({
  reservation: one(reservations, { fields: [folios.reservationId], references: [reservations.id] }),
  guest: one(guests, { fields: [folios.guestId], references: [guests.id] }),
  charges: many(folioCharges),
  payments: many(folioPayments),
}));

export const folioChargeRelations = relations(folioCharges, ({ one }) => ({
  folio: one(folios, { fields: [folioCharges.folioId], references: [folios.id] }),
}));

export const folioPaymentRelations = relations(folioPayments, ({ one }) => ({
  folio: one(folios, { fields: [folioPayments.folioId], references: [folios.id] }),
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
  guest: one(guests, { fields: [orders.guestId], references: [guests.id] }),
  room: one(rooms, { fields: [orders.roomId], references: [rooms.id] }),
  items: many(orderItems),
}));

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  menuItem: one(menuItems, { fields: [orderItems.menuItemId], references: [menuItems.id] }),
}));

export const employeeRelations = relations(employees, ({ many }) => ({
  attendances: many(attendances),
  leaveRequests: many(leaveRequests),
  dutyRosters: many(dutyRosters),
}));

export const attendanceRelations = relations(attendances, ({ one }) => ({
  employee: one(employees, { fields: [attendances.employeeId], references: [employees.id] }),
}));

export const leaveRequestRelations = relations(leaveRequests, ({ one }) => ({
  employee: one(employees, { fields: [leaveRequests.employeeId], references: [employees.id] }),
}));

export const dutyRosterRelations = relations(dutyRosters, ({ one }) => ({
  employee: one(employees, { fields: [dutyRosters.employeeId], references: [employees.id] }),
  shift: one(shifts, { fields: [dutyRosters.shiftId], references: [shifts.id] }),
}));

export type Guest = typeof guests.$inferSelect;
export type InsertGuest = typeof guests.$inferInsert;
export type Room = typeof rooms.$inferSelect;
export type InsertRoom = typeof rooms.$inferInsert;
export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = typeof reservations.$inferInsert;
export type Folio = typeof folios.$inferSelect;
export type InsertFolio = typeof folios.$inferInsert;
export type FolioCharge = typeof folioCharges.$inferSelect;
export type InsertFolioCharge = typeof folioCharges.$inferInsert;
export type FolioPayment = typeof folioPayments.$inferSelect;
export type InsertFolioPayment = typeof folioPayments.$inferInsert;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = typeof inventoryItems.$inferInsert;
export type HousekeepingTask = typeof housekeepingTasks.$inferSelect;
export type InsertHousekeepingTask = typeof housekeepingTasks.$inferInsert;
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = typeof menuItems.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;
export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type InsertMaintenanceRequest = typeof maintenanceRequests.$inferInsert;
export type Requisition = typeof requisitions.$inferSelect;
export type InsertRequisition = typeof requisitions.$inferInsert;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = typeof purchaseOrders.$inferInsert;
export type GoodsReceivedNote = typeof goodsReceivedNotes.$inferSelect;
export type InsertGoodsReceivedNote = typeof goodsReceivedNotes.$inferInsert;
export type SystemUser = typeof systemUsers.$inferSelect;
export type InsertSystemUser = typeof systemUsers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;
export type ExtraServiceCategory = typeof extraServiceCategories.$inferSelect;
export type InsertExtraServiceCategory = typeof extraServiceCategories.$inferInsert;
export type ExtraService = typeof extraServices.$inferSelect;
export type InsertExtraService = typeof extraServices.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;
export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;
export type CostCenter = typeof costCenters.$inferSelect;
export type InsertCostCenter = typeof costCenters.$inferInsert;
export type ProfitCenter = typeof profitCenters.$inferSelect;
export type InsertProfitCenter = typeof profitCenters.$inferInsert;
export type Amenity = typeof amenities.$inferSelect;
export type InsertAmenity = typeof amenities.$inferInsert;
export type Attendance = typeof attendances.$inferSelect;
export type InsertAttendance = typeof attendances.$inferInsert;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type InsertLeaveRequest = typeof leaveRequests.$inferInsert;
export type Shift = typeof shifts.$inferSelect;
export type InsertShift = typeof shifts.$inferInsert;
export type DutyRoster = typeof dutyRosters.$inferSelect;
export type InsertDutyRoster = typeof dutyRosters.$inferInsert;
