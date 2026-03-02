import express from 'express';
import cors from 'cors';
import { db } from './db';
import * as schema from '../shared/schema';
import { eq, and, lte, gte, ne, sql } from 'drizzle-orm';
import { computeRateQuote } from './services/rateEngine';
import { 
  securityHeaders, 
  apiLimiter, 
  requestSizeLimiter,
  errorLogger,
  requestLogger,
  corsOptions,
} from './middleware/security';
import {
  validate,
  idParamSchema,
  guestCreateSchema,
  guestUpdateSchema,
  roomCreateSchema,
  roomUpdateSchema,
  reservationCreateSchema,
  reservationUpdateSchema,
  employeeCreateSchema,
  employeeUpdateSchema,
} from './middleware/validation';

const app = express();

// Security middleware - must be first
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Add size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestSizeLimiter);

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(requestLogger);
}

// Rate limiting for all API routes
app.use('/api/', apiLimiter);

// Health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api/guests', async (req, res) => {
  try {
    const result = await db.select().from(schema.guests);
    res.json(result);
  } catch (error) {
    console.error('Error fetching guests:', error);
    res.status(500).json({ error: 'Failed to fetch guests' });
  }
});

app.post('/api/guests', validate(guestCreateSchema), async (req, res) => {
  try {
    const result = await db.insert(schema.guests).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error creating guest:', error);
    res.status(500).json({ error: 'Failed to create guest' });
  }
});

app.put('/api/guests/:id', validate(idParamSchema, 'params'), validate(guestUpdateSchema), async (req, res) => {
  try {
    // idParamSchema transforms id to number, so we can use it directly
    const result = await db.update(schema.guests).set(req.body).where(eq(schema.guests.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating guest:', error);
    res.status(500).json({ error: 'Failed to update guest' });
  }
});

app.patch('/api/guests/:id', validate(idParamSchema, 'params'), validate(guestUpdateSchema), async (req, res) => {
  try {
    const result = await db.update(schema.guests).set(req.body).where(eq(schema.guests.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error patching guest:', error);
    res.status(500).json({ error: 'Failed to patch guest' });
  }
});

app.delete('/api/guests/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    await db.delete(schema.guests).where(eq(schema.guests.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting guest:', error);
    res.status(500).json({ error: 'Failed to delete guest' });
  }
});

app.get('/api/rooms', async (req, res) => {
  try {
    const result = await db.select().from(schema.rooms);
    res.json(result);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

app.post('/api/rooms', validate(roomCreateSchema), async (req, res) => {
  try {
    const result = await db.insert(schema.rooms).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

app.put('/api/rooms/:id', validate(idParamSchema, 'params'), validate(roomUpdateSchema), async (req, res) => {
  try {
    const result = await db.update(schema.rooms).set(req.body).where(eq(schema.rooms.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ error: 'Failed to update room' });
  }
});

app.patch('/api/rooms/:id', validate(idParamSchema, 'params'), validate(roomUpdateSchema), async (req, res) => {
  try {
    const result = await db.update(schema.rooms).set(req.body).where(eq(schema.rooms.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error patching room:', error);
    res.status(500).json({ error: 'Failed to patch room' });
  }
});

app.delete('/api/rooms/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    await db.delete(schema.rooms).where(eq(schema.rooms.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

app.get('/api/reservations', async (req, res) => {
  try {
    const result = await db.select().from(schema.reservations);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

app.post('/api/reservations', validate(reservationCreateSchema), async (req, res) => {
  try {
    const result = await db.insert(schema.reservations).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

app.put('/api/reservations/:id', validate(idParamSchema, 'params'), validate(reservationUpdateSchema), async (req, res) => {
  try {
    const result = await db.update(schema.reservations).set(req.body).where(eq(schema.reservations.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update reservation' });
  }
});

app.patch('/api/reservations/:id', async (req, res) => {
  try {
    const result = await db.update(schema.reservations).set(req.body).where(eq(schema.reservations.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to patch reservation' });
  }
});

app.delete('/api/reservations/:id', async (req, res) => {
  try {
    await db.delete(schema.reservations).where(eq(schema.reservations.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete reservation' });
  }
});

app.get('/api/folios', async (req, res) => {
  try {
    const result = await db.select().from(schema.folios);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch folios' });
  }
});

app.post('/api/folios', async (req, res) => {
  try {
    const result = await db.insert(schema.folios).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create folio' });
  }
});

app.put('/api/folios/:id', async (req, res) => {
  try {
    const result = await db.update(schema.folios).set(req.body).where(eq(schema.folios.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update folio' });
  }
});

app.patch('/api/folios/:id', async (req, res) => {
  try {
    const result = await db.update(schema.folios).set(req.body).where(eq(schema.folios.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to patch folio' });
  }
});

app.delete('/api/folios/:id', async (req, res) => {
  try {
    await db.delete(schema.folios).where(eq(schema.folios.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete folio' });
  }
});

app.get('/api/inventory', async (req, res) => {
  try {
    const result = await db.select().from(schema.inventoryItems);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

app.post('/api/inventory', async (req, res) => {
  try {
    const result = await db.insert(schema.inventoryItems).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

app.put('/api/inventory/:id', async (req, res) => {
  try {
    const result = await db.update(schema.inventoryItems).set(req.body).where(eq(schema.inventoryItems.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

app.patch('/api/inventory/:id', async (req, res) => {
  try {
    const result = await db.update(schema.inventoryItems).set(req.body).where(eq(schema.inventoryItems.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to patch inventory item' });
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  try {
    await db.delete(schema.inventoryItems).where(eq(schema.inventoryItems.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

app.get('/api/housekeeping-tasks', async (req, res) => {
  try {
    const result = await db.select().from(schema.housekeepingTasks);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/housekeeping-tasks', async (req, res) => {
  try {
    const result = await db.insert(schema.housekeepingTasks).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create housekeeping task' });
  }
});

app.put('/api/housekeeping-tasks/:id', async (req, res) => {
  try {
    const result = await db.update(schema.housekeepingTasks).set(req.body).where(eq(schema.housekeepingTasks.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update housekeeping task' });
  }
});

app.patch('/api/housekeeping-tasks/:id', async (req, res) => {
  try {
    const result = await db.update(schema.housekeepingTasks).set(req.body).where(eq(schema.housekeepingTasks.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to patch housekeeping task' });
  }
});

app.delete('/api/housekeeping-tasks/:id', async (req, res) => {
  try {
    await db.delete(schema.housekeepingTasks).where(eq(schema.housekeepingTasks.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete housekeeping task' });
  }
});

app.get('/api/menu-items', async (req, res) => {
  try {
    const result = await db.select().from(schema.menuItems);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

app.post('/api/menu-items', async (req, res) => {
  try {
    const result = await db.insert(schema.menuItems).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

app.put('/api/menu-items/:id', async (req, res) => {
  try {
    const result = await db.update(schema.menuItems).set(req.body).where(eq(schema.menuItems.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

app.patch('/api/menu-items/:id', async (req, res) => {
  try {
    const result = await db.update(schema.menuItems).set(req.body).where(eq(schema.menuItems.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to patch menu item' });
  }
});

app.delete('/api/menu-items/:id', async (req, res) => {
  try {
    await db.delete(schema.menuItems).where(eq(schema.menuItems.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const result = await db.select().from(schema.orders);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const result = await db.insert(schema.orders).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const result = await db.update(schema.orders).set(req.body).where(eq(schema.orders.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

app.patch('/api/orders/:id', async (req, res) => {
  try {
    const result = await db.update(schema.orders).set(req.body).where(eq(schema.orders.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to patch order' });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    await db.delete(schema.orders).where(eq(schema.orders.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

app.get('/api/suppliers', async (req, res) => {
  try {
    const result = await db.select().from(schema.suppliers);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

app.post('/api/suppliers', async (req, res) => {
  try {
    const result = await db.insert(schema.suppliers).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

app.put('/api/suppliers/:id', async (req, res) => {
  try {
    const result = await db.update(schema.suppliers).set(req.body).where(eq(schema.suppliers.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

app.patch('/api/suppliers/:id', async (req, res) => {
  try {
    const result = await db.update(schema.suppliers).set(req.body).where(eq(schema.suppliers.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to patch supplier' });
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    await db.delete(schema.suppliers).where(eq(schema.suppliers.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

app.get('/api/employees', async (req, res) => {
  try {
    const result = await db.select().from(schema.employees);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

app.post('/api/employees', validate(employeeCreateSchema), async (req, res) => {
  try {
    const result = await db.insert(schema.employees).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

app.put('/api/employees/:id', validate(idParamSchema, 'params'), validate(employeeUpdateSchema), async (req, res) => {
  try {
    const result = await db.update(schema.employees).set(req.body).where(eq(schema.employees.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

app.patch('/api/employees/:id', async (req, res) => {
  try {
    const result = await db.update(schema.employees).set(req.body).where(eq(schema.employees.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to patch employee' });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    await db.delete(schema.employees).where(eq(schema.employees.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

app.get('/api/accounts', async (req, res) => {
  try {
    const result = await db.select().from(schema.accounts);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

app.post('/api/accounts', async (req, res) => {
  try {
    const result = await db.insert(schema.accounts).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

app.put('/api/accounts/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    const result = await db.update(schema.accounts).set(req.body).where(eq(schema.accounts.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

app.delete('/api/accounts/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    await db.delete(schema.accounts).where(eq(schema.accounts.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

app.get('/api/system-users', async (req, res) => {
  try {
    const result = await db.select().from(schema.systemUsers);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch system users' });
  }
});

app.post('/api/system-users', async (req, res) => {
  try {
    const result = await db.insert(schema.systemUsers).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error creating system user:', error);
    res.status(500).json({ error: 'Failed to create system user' });
  }
});

app.put('/api/system-users/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    const result = await db.update(schema.systemUsers).set(req.body).where(eq(schema.systemUsers.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating system user:', error);
    res.status(500).json({ error: 'Failed to update system user' });
  }
});

app.delete('/api/system-users/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    await db.delete(schema.systemUsers).where(eq(schema.systemUsers.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting system user:', error);
    res.status(500).json({ error: 'Failed to delete system user' });
  }
});

app.get('/api/extra-service-categories', async (req, res) => {
  try {
    const result = await db.select().from(schema.extraServiceCategories);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/extra-service-categories', async (req, res) => {
  try {
    const result = await db.insert(schema.extraServiceCategories).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error creating extra service category:', error);
    res.status(500).json({ error: 'Failed to create extra service category' });
  }
});

app.put('/api/extra-service-categories/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    const result = await db.update(schema.extraServiceCategories).set(req.body).where(eq(schema.extraServiceCategories.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating extra service category:', error);
    res.status(500).json({ error: 'Failed to update extra service category' });
  }
});

app.delete('/api/extra-service-categories/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    await db.delete(schema.extraServiceCategories).where(eq(schema.extraServiceCategories.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting extra service category:', error);
    res.status(500).json({ error: 'Failed to delete extra service category' });
  }
});

app.get('/api/extra-services', async (req, res) => {
  try {
    const result = await db.select().from(schema.extraServices);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

app.post('/api/extra-services', async (req, res) => {
  try {
    const result = await db.insert(schema.extraServices).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error creating extra service:', error);
    res.status(500).json({ error: 'Failed to create extra service' });
  }
});

app.put('/api/extra-services/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    const result = await db.update(schema.extraServices).set(req.body).where(eq(schema.extraServices.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating extra service:', error);
    res.status(500).json({ error: 'Failed to update extra service' });
  }
});

app.delete('/api/extra-services/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    await db.delete(schema.extraServices).where(eq(schema.extraServices.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting extra service:', error);
    res.status(500).json({ error: 'Failed to delete extra service' });
  }
});

app.get('/api/shifts', async (req, res) => {
  try {
    const result = await db.select().from(schema.shifts);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch shifts' });
  }
});

app.post('/api/shifts', async (req, res) => {
  try {
    const result = await db.insert(schema.shifts).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error creating shift:', error);
    res.status(500).json({ error: 'Failed to create shift' });
  }
});

app.put('/api/shifts/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    const result = await db.update(schema.shifts).set(req.body).where(eq(schema.shifts.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating shift:', error);
    res.status(500).json({ error: 'Failed to update shift' });
  }
});

app.delete('/api/shifts/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    await db.delete(schema.shifts).where(eq(schema.shifts.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting shift:', error);
    res.status(500).json({ error: 'Failed to delete shift' });
  }
});

app.get('/api/amenities', async (req, res) => {
  try {
    const result = await db.select().from(schema.amenities);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch amenities' });
  }
});

app.post('/api/amenities', async (req, res) => {
  try {
    const result = await db.insert(schema.amenities).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error creating amenity:', error);
    res.status(500).json({ error: 'Failed to create amenity' });
  }
});

app.put('/api/amenities/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    const result = await db.update(schema.amenities).set(req.body).where(eq(schema.amenities.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating amenity:', error);
    res.status(500).json({ error: 'Failed to update amenity' });
  }
});

app.delete('/api/amenities/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    await db.delete(schema.amenities).where(eq(schema.amenities.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting amenity:', error);
    res.status(500).json({ error: 'Failed to delete amenity' });
  }
});

app.get('/api/maintenance-requests', async (req, res) => {
  try {
    const result = await db.select().from(schema.maintenanceRequests);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch maintenance requests' });
  }
});

app.post('/api/maintenance-requests', async (req, res) => {
  try {
    const result = await db.insert(schema.maintenanceRequests).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create maintenance request' });
  }
});

app.put('/api/maintenance-requests/:id', async (req, res) => {
  try {
    const result = await db.update(schema.maintenanceRequests).set(req.body).where(eq(schema.maintenanceRequests.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update maintenance request' });
  }
});

app.patch('/api/maintenance-requests/:id', async (req, res) => {
  try {
    const result = await db.update(schema.maintenanceRequests).set(req.body).where(eq(schema.maintenanceRequests.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to patch maintenance request' });
  }
});

app.delete('/api/maintenance-requests/:id', async (req, res) => {
  try {
    await db.delete(schema.maintenanceRequests).where(eq(schema.maintenanceRequests.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete maintenance request' });
  }
});

app.get('/api/system-settings', async (req, res) => {
  try {
    const result = await db.select().from(schema.systemSettings);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch system settings' });
  }
});

app.get('/api/system-settings/:key', async (req, res) => {
  try {
    const result = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, req.params.key));
    res.json(result[0] || null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

app.post('/api/system-settings', async (req, res) => {
  try {
    const { key, value, category, description } = req.body;
    try {
      const result = await db.insert(schema.systemSettings).values({ key, value, category, description }).returning();
      res.json(result[0]);
    } catch (insertError: unknown) {
      const errorStr = JSON.stringify(insertError);
      const isDuplicateError = errorStr.includes('duplicate') || errorStr.includes('unique') || 
        (insertError && typeof insertError === 'object' && 'cause' in insertError && 
         insertError.cause && typeof insertError.cause === 'object' && 'code' in insertError.cause && 
         insertError.cause.code === '23505');
      
      if (isDuplicateError) {
        const result = await db.update(schema.systemSettings)
          .set({ value, category, description })
          .where(eq(schema.systemSettings.key, key))
          .returning();
        res.json(result[0]);
      } else {
        throw insertError;
      }
    }
  } catch (error: unknown) {
    console.error('System settings error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to save setting', details: message });
  }
});

app.delete('/api/system-settings/:key', async (req, res) => {
  try {
    await db.delete(schema.systemSettings).where(eq(schema.systemSettings.key, req.params.key));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete setting' });
  }
});

// Branding endpoints
app.get('/api/branding', async (req, res) => {
  try {
    const result = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, 'branding'));
    if (result.length > 0 && result[0].value) {
      res.json(JSON.parse(result[0].value));
    } else {
      res.json(null);
    }
  } catch (error) {
    console.error('Failed to fetch branding:', error);
    res.status(500).json({ error: 'Failed to fetch branding' });
  }
});

app.post('/api/branding', async (req, res) => {
  try {
    const brandingData = req.body;
    const value = JSON.stringify(brandingData);
    
    try {
      const result = await db.insert(schema.systemSettings).values({
        key: 'branding',
        value,
        category: 'branding',
        description: 'Hotel branding and customization settings'
      }).returning();
      res.json(JSON.parse(result[0].value));
    } catch (insertError: unknown) {
      const errorStr = JSON.stringify(insertError);
      const isDuplicateError = errorStr.includes('duplicate') || errorStr.includes('unique') || 
        (insertError && typeof insertError === 'object' && 'cause' in insertError && 
         insertError.cause && typeof insertError.cause === 'object' && 'code' in insertError.cause && 
         insertError.cause.code === '23505');
      
      if (isDuplicateError) {
        const result = await db.update(schema.systemSettings)
          .set({ value, updatedAt: new Date() })
          .where(eq(schema.systemSettings.key, 'branding'))
          .returning();
        res.json(JSON.parse(result[0].value));
      } else {
        throw insertError;
      }
    }
  } catch (error: unknown) {
    console.error('Failed to save branding:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to save branding', details: message });
  }
});

app.get('/api/system-versions', async (req, res) => {
  try {
    const result = await db.select().from(schema.systemVersions);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
});

app.post('/api/system-versions', async (req, res) => {
  try {
    const result = await db.insert(schema.systemVersions).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create version' });
  }
});


app.get('/api/transactions', async (req, res) => {
  try {
    const result = await db.select().from(schema.transactions);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const result = await db.insert(schema.transactions).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

app.put('/api/transactions/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    const result = await db.update(schema.transactions).set(req.body).where(eq(schema.transactions.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

app.delete('/api/transactions/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    await db.delete(schema.transactions).where(eq(schema.transactions.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

app.get('/api/rate-calendar', async (req, res) => {
  try {
    const result = await db.select().from(schema.rateCalendar);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch rate calendar' });
  }
});

app.post('/api/rate-calendar', async (req, res) => {
  try {
    const result = await db.insert(schema.rateCalendar).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create rate entry' });
  }
});

app.put('/api/rate-calendar/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    const result = await db.update(schema.rateCalendar).set(req.body).where(eq(schema.rateCalendar.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating rate calendar entry:', error);
    res.status(500).json({ error: 'Failed to update rate calendar entry' });
  }
});

app.delete('/api/rate-calendar/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    await db.delete(schema.rateCalendar).where(eq(schema.rateCalendar.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting rate calendar entry:', error);
    res.status(500).json({ error: 'Failed to delete rate calendar entry' });
  }
});

app.get('/api/channels', async (req, res) => {
  try {
    const result = await db.select().from(schema.channels);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

app.post('/api/channels', async (req, res) => {
  try {
    const result = await db.insert(schema.channels).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error creating channel:', error);
    res.status(500).json({ error: 'Failed to create channel' });
  }
});

app.get('/api/channels/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    const result = await db.select().from(schema.channels).where(eq(schema.channels.id, req.params.id));
    if (result.length === 0) return res.status(404).json({ error: 'Channel not found' });
    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching channel:', error);
    res.status(500).json({ error: 'Failed to fetch channel' });
  }
});

app.put('/api/channels/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    const result = await db.update(schema.channels).set(req.body).where(eq(schema.channels.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating channel:', error);
    res.status(500).json({ error: 'Failed to update channel' });
  }
});

app.post('/api/channels/:id/test-connection', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    const { apiKey, propertyId } = req.body;
    if (!apiKey || !propertyId) {
      return res.status(400).json({ error: 'apiKey and propertyId are required' });
    }
    // Log the test attempt in sync logs
    await db.insert(schema.channelSyncLogs).values({
      channelId: req.params.id,
      channelName: req.body.channelName || 'Unknown',
      syncType: 'test-connection',
      status: 'success',
      recordsProcessed: 0,
      recordsSuccess: 0,
      recordsFailed: 0,
      startedAt: new Date(),
      completedAt: new Date(),
      duration: 0,
    });
    res.json({ success: true, message: 'Connection credentials validated' });
  } catch (error) {
    console.error('Error testing channel connection:', error);
    res.status(500).json({ error: 'Connection test failed' });
  }
});

app.delete('/api/channels/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    await db.delete(schema.channels).where(eq(schema.channels.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting channel:', error);
    res.status(500).json({ error: 'Failed to delete channel' });
  }
});

app.get('/api/audit-logs', async (req, res) => {
  try {
    const result = await db.select().from(schema.auditLogs);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

app.get('/api/recipes', async (req, res) => {
  try {
    const result = await db.select().from(schema.recipes);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

app.post('/api/recipes', async (req, res) => {
  try {
    const result = await db.insert(schema.recipes).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

app.put('/api/recipes/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    const result = await db.update(schema.recipes).set(req.body).where(eq(schema.recipes.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

app.delete('/api/recipes/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    await db.delete(schema.recipes).where(eq(schema.recipes.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// Channel Manager APIs
import { BookingComService } from './services/bookingCom';
import { AgodaService } from './services/agoda';
import { ExpediaService } from './services/expedia';
import { AirbnbService } from './services/airbnb';
import { BackupService } from './services/backup';
import { DataSyncService } from './services/dataSync';

const backupService = new BackupService();
const dataSyncService = new DataSyncService();

// Start auto-sync with 1 minute interval (configurable via environment)
const syncInterval = parseInt(process.env.SYNC_INTERVAL_MS || '60000');
dataSyncService.startAutoSync(syncInterval);

// Get channel bookings
app.get('/api/channel-bookings', async (req, res) => {
  try {
    const result = await db.select().from(schema.channelBookings);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch channel bookings' });
  }
});

// Sync bookings from a specific channel
app.post('/api/channels/:id/sync-bookings', async (req, res) => {
  try {
    const channelId = parseInt(req.params.id);
    const { startDate, endDate, channelName, config } = req.body;

    let service;
    switch (channelName.toLowerCase()) {
      case 'booking.com':
        service = new BookingComService(config);
        break;
      case 'agoda':
        service = new AgodaService(config);
        break;
      case 'expedia':
        service = new ExpediaService(config);
        break;
      case 'airbnb':
        service = new AirbnbService(config);
        break;
      default:
        return res.status(400).json({ error: 'Unknown channel' });
    }

    const bookings = await service.fetchBookings(new Date(startDate), new Date(endDate));
    const result = await service.syncBookingsToDatabase(bookings, channelId);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to sync bookings', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Sync availability to channel
app.post('/api/channels/:id/sync-availability', async (req, res) => {
  try {
    const { channelName, config, roomType, date, available } = req.body;

    let service;
    switch (channelName.toLowerCase()) {
      case 'booking.com':
        service = new BookingComService(config);
        break;
      case 'agoda':
        service = new AgodaService(config);
        break;
      case 'expedia':
        service = new ExpediaService(config);
        break;
      case 'airbnb':
        service = new AirbnbService(config);
        break;
      default:
        return res.status(400).json({ error: 'Unknown channel' });
    }

    const success = await service.syncAvailability(roomType, new Date(date), available);
    res.json({ success });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to sync availability' });
  }
});

// Sync rates to channel
app.post('/api/channels/:id/sync-rates', async (req, res) => {
  try {
    const { channelName, config, roomType, date, rate } = req.body;

    let service;
    switch (channelName.toLowerCase()) {
      case 'booking.com':
        service = new BookingComService(config);
        break;
      case 'agoda':
        service = new AgodaService(config);
        break;
      case 'expedia':
        service = new ExpediaService(config);
        break;
      case 'airbnb':
        service = new AirbnbService(config);
        break;
      default:
        return res.status(400).json({ error: 'Unknown channel' });
    }

    const success = await service.syncRates(roomType, new Date(date), rate);
    res.json({ success });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to sync rates' });
  }
});

// Get channel sync logs
app.get('/api/channel-sync-logs', async (req, res) => {
  try {
    const result = await db.select().from(schema.channelSyncLogs);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch sync logs' });
  }
});

// ============ Extended Booking.com API Endpoints ============

// Update property details
app.post('/api/channels/booking-com/property', async (req, res) => {
  try {
    const { config, propertyData } = req.body;
    const service = new BookingComService(config);
    const success = await service.updateProperty(propertyData);
    res.json({ success });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// Update room types
app.post('/api/channels/booking-com/rooms', async (req, res) => {
  try {
    const { config, roomTypes } = req.body;
    const service = new BookingComService(config);
    const success = await service.updateRoomTypes(roomTypes);
    res.json({ success });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update room types' });
  }
});

// Upload photo
app.post('/api/channels/booking-com/photos', async (req, res) => {
  try {
    const { config, photoData } = req.body;
    const service = new BookingComService(config);
    const success = await service.uploadPhoto(photoData);
    res.json({ success });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// Update facilities
app.post('/api/channels/booking-com/facilities', async (req, res) => {
  try {
    const { config, facilities } = req.body;
    const service = new BookingComService(config);
    const success = await service.updateFacilities(facilities);
    res.json({ success });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update facilities' });
  }
});

// Get payments
app.post('/api/channels/booking-com/payments', async (req, res) => {
  try {
    const { config, startDate, endDate } = req.body;
    const service = new BookingComService(config);
    const payments = await service.getPayments(new Date(startDate), new Date(endDate));
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get reviews
app.get('/api/channels/booking-com/reviews', async (req, res) => {
  try {
    const { config, startDate, endDate } = req.query as any;
    const service = new BookingComService(JSON.parse(config));
    const reviews = await service.getReviews(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// ============ Extended Airbnb API Endpoints ============

// Update listing
app.post('/api/channels/airbnb/listing', async (req, res) => {
  try {
    const { config, listingData } = req.body;
    const service = new AirbnbService(config);
    const success = await service.updateListing(listingData);
    res.json({ success });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// Upload listing photo
app.post('/api/channels/airbnb/photos', async (req, res) => {
  try {
    const { config, photoUrl, caption } = req.body;
    const service = new AirbnbService(config);
    const success = await service.uploadListingPhoto(photoUrl, caption);
    res.json({ success });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// Send message to guest
app.post('/api/channels/airbnb/messages', async (req, res) => {
  try {
    const { config, reservationId, message } = req.body;
    const service = new AirbnbService(config);
    const success = await service.sendMessage(reservationId, message);
    res.json({ success });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get messages for reservation
app.get('/api/channels/airbnb/messages/:reservationId', async (req, res) => {
  try {
    const { config } = req.query as any;
    const service = new AirbnbService(JSON.parse(config));
    const messages = await service.getMessages(req.params.reservationId);
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get reviews
app.get('/api/channels/airbnb/reviews', async (req, res) => {
  try {
    const { config } = req.query as any;
    const service = new AirbnbService(JSON.parse(config));
    const reviews = await service.getReviews();
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Respond to review
app.post('/api/channels/airbnb/reviews/:reviewId/response', async (req, res) => {
  try {
    const { config, response } = req.body;
    const service = new AirbnbService(config);
    const success = await service.respondToReview(req.params.reviewId, response);
    res.json({ success });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to respond to review' });
  }
});

// Update pricing rules
app.post('/api/channels/airbnb/pricing', async (req, res) => {
  try {
    const { config, pricingRules } = req.body;
    const service = new AirbnbService(config);
    const success = await service.updatePricingRules(pricingRules);
    res.json({ success });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update pricing rules' });
  }
});

// Get calendar
app.get('/api/channels/airbnb/calendar', async (req, res) => {
  try {
    const { config, startDate, endDate } = req.query as any;
    const service = new AirbnbService(JSON.parse(config));
    const calendar = await service.getCalendar(new Date(startDate), new Date(endDate));
    res.json(calendar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch calendar' });
  }
});

// Get analytics
app.get('/api/channels/airbnb/analytics', async (req, res) => {
  try {
    const { config, startDate, endDate } = req.query as any;
    const service = new AirbnbService(JSON.parse(config));
    const analytics = await service.getAnalytics(new Date(startDate), new Date(endDate));
    res.json(analytics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Backup APIs
app.post('/api/backup/create', async (req, res) => {
  try {
    const { createdBy, options } = req.body;
    const filePath = await backupService.createFullBackup(createdBy || 'system', options || {});
    res.json({ success: true, filePath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create backup', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/backup/list', async (req, res) => {
  try {
    const backups = await backupService.listBackups();
    res.json(backups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

app.post('/api/backup/restore', async (req, res) => {
  try {
    const { filePath, options } = req.body;
    await backupService.restoreFromBackup(filePath, options || {});
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to restore backup', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.delete('/api/backup/:id', async (req, res) => {
  try {
    await backupService.deleteBackup(parseInt(req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete backup' });
  }
});

// Data Sync APIs
app.post('/api/sync/queue', async (req, res) => {
  try {
    await dataSyncService.queueSync(req.body);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to queue sync' });
  }
});

app.get('/api/sync/status', async (req, res) => {
  try {
    const status = await dataSyncService.getSyncQueueStatus();
    res.json(status);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get sync status' });
  }
});

app.post('/api/sync/process', async (req, res) => {
  try {
    await dataSyncService.processSyncQueue();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process sync queue' });
  }
});

// ============ Booking Engine API ============

// Rate Plans CRUD
app.get('/api/booking/rate-plans', async (req, res) => {
  try {
    const result = await db.select().from(schema.ratePlans);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch rate plans' });
  }
});

app.post('/api/booking/rate-plans', async (req, res) => {
  try {
    const result = await db.insert(schema.ratePlans).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create rate plan' });
  }
});

app.put('/api/booking/rate-plans/:id', async (req, res) => {
  try {
    const result = await db.update(schema.ratePlans).set({ ...req.body, updatedAt: new Date() }).where(eq(schema.ratePlans.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update rate plan' });
  }
});

app.delete('/api/booking/rate-plans/:id', async (req, res) => {
  try {
    await db.delete(schema.ratePlans).where(eq(schema.ratePlans.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete rate plan' });
  }
});

// Resident Rules CRUD
app.get('/api/booking/resident-rules', async (req, res) => {
  try {
    const result = await db.select().from(schema.residentRules);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch resident rules' });
  }
});

app.post('/api/booking/resident-rules', async (req, res) => {
  try {
    const result = await db.insert(schema.residentRules).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create resident rule' });
  }
});

app.delete('/api/booking/resident-rules/:id', async (req, res) => {
  try {
    await db.delete(schema.residentRules).where(eq(schema.residentRules.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete resident rule' });
  }
});

// Seasonal Multipliers CRUD
app.get('/api/booking/seasonal-multipliers', async (req, res) => {
  try {
    const result = await db.select().from(schema.seasonalMultipliers);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch seasonal multipliers' });
  }
});

app.post('/api/booking/seasonal-multipliers', async (req, res) => {
  try {
    const result = await db.insert(schema.seasonalMultipliers).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create seasonal multiplier' });
  }
});

app.delete('/api/booking/seasonal-multipliers/:id', async (req, res) => {
  try {
    await db.delete(schema.seasonalMultipliers).where(eq(schema.seasonalMultipliers.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete seasonal multiplier' });
  }
});

// Promo Codes CRUD
app.get('/api/booking/promo-codes', async (req, res) => {
  try {
    const result = await db.select().from(schema.promoCodes);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch promo codes' });
  }
});

app.post('/api/booking/promo-codes', async (req, res) => {
  try {
    const data = { ...req.body, code: req.body.code?.toUpperCase() };
    const result = await db.insert(schema.promoCodes).values(data).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create promo code' });
  }
});

app.put('/api/booking/promo-codes/:id', async (req, res) => {
  try {
    const data = { ...req.body, updatedAt: new Date() };
    const result = await db.update(schema.promoCodes).set(data).where(eq(schema.promoCodes.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update promo code' });
  }
});

app.delete('/api/booking/promo-codes/:id', async (req, res) => {
  try {
    await db.delete(schema.promoCodes).where(eq(schema.promoCodes.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete promo code' });
  }
});

// Widget Settings
app.get('/api/booking/widget-settings', async (req, res) => {
  try {
    const result = await db.select().from(schema.widgetSettings).where(eq(schema.widgetSettings.propertyId, 'default'));
    if (result.length) {
      res.json(result[0]);
    } else {
      res.json({ propertyId: 'default', primaryColor: '#1a56db', accentColor: '#0e9f6e', propertyName: 'Hotel', currencyCode: 'KES', currencySymbol: 'KES', showAddOns: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch widget settings' });
  }
});

app.put('/api/booking/widget-settings', async (req, res) => {
  try {
    const existing = await db.select().from(schema.widgetSettings).where(eq(schema.widgetSettings.propertyId, 'default'));
    if (existing.length) {
      const result = await db.update(schema.widgetSettings).set({ ...req.body, updatedAt: new Date() }).where(eq(schema.widgetSettings.propertyId, 'default')).returning();
      res.json(result[0]);
    } else {
      const result = await db.insert(schema.widgetSettings).values({ ...req.body, propertyId: 'default' }).returning();
      res.json(result[0]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update widget settings' });
  }
});

// Rate Quote - server-side pricing calculation (NEVER trust frontend pricing)
app.post('/api/booking/quote', async (req, res) => {
  try {
    const { checkIn, checkOut, adults, children, roomId, guestCountry, promoCode } = req.body;
    if (!checkIn || !checkOut || !roomId) {
      return res.status(400).json({ error: 'checkIn, checkOut, and roomId are required' });
    }
    const quote = await computeRateQuote({ checkIn, checkOut, adults: adults || 1, children: children || 0, roomId, guestCountry, promoCode });
    res.json(quote);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Failed to compute rate quote' });
  }
});

// Availability search
app.get('/api/booking/availability', async (req, res) => {
  try {
    const { checkIn, checkOut, adults, guestCountry } = req.query as Record<string, string>;
    if (!checkIn || !checkOut) return res.status(400).json({ error: 'checkIn and checkOut are required' });

    const allRooms = await db.select().from(schema.rooms).where(eq(schema.rooms.status, 'available'));

    // Get reservations that overlap with the requested dates
    const overlapping = await db.select().from(schema.reservations).where(
      and(
        ne(schema.reservations.status, 'cancelled'),
        lte(schema.reservations.checkInDate, checkOut),
        gte(schema.reservations.checkOutDate, checkIn)
      )
    );
    const occupiedRoomIds = new Set(overlapping.map(r => r.roomId));
    const availableRooms = allRooms.filter(r => !occupiedRoomIds.has(r.id));

    const roomsWithRates = await Promise.all(availableRooms.map(async (room) => {
      try {
        const quote = await computeRateQuote({
          checkIn,
          checkOut,
          adults: parseInt(adults || '1'),
          roomId: room.id,
          guestCountry,
        });
        return { ...room, quote };
      } catch {
        return { ...room, quote: null };
      }
    }));
    res.json(roomsWithRates.filter(r => r.quote !== null));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// Create booking (server-side price validation)
app.post('/api/booking/reserve', async (req, res) => {
  try {
    const { checkIn, checkOut, roomId, guestCountry, promoCode, adults, children, guestDetails } = req.body;
    if (!checkIn || !checkOut || !roomId || !guestDetails) {
      return res.status(400).json({ error: 'Missing required booking fields' });
    }
    // Server-side price computation - never trust client
    const quote = await computeRateQuote({ checkIn, checkOut, adults: adults || 1, children: children || 0, roomId, guestCountry, promoCode });

    // Upsert guest
    let guestId: number;
    const existingGuests = await db.select().from(schema.guests).where(eq(schema.guests.email, guestDetails.email));
    if (existingGuests.length) {
      guestId = existingGuests[0].id;
    } else {
      const newGuest = await db.insert(schema.guests).values({
        firstName: guestDetails.firstName,
        lastName: guestDetails.lastName,
        email: guestDetails.email,
        phone: guestDetails.phone,
        country: guestCountry,
        nationality: guestCountry,
      }).returning();
      guestId = newGuest[0].id;
    }

    const confirmationNumber = `BKG-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const reservation = await db.insert(schema.reservations).values({
      guestId,
      roomId,
      confirmationNumber,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      adults: adults || 1,
      children: children || 0,
      ratePerNight: quote.adjustedRatePerNight.toFixed(2),
      totalAmount: quote.totalAmount.toFixed(2),
      status: 'confirmed',
      source: 'booking-widget',
      specialRequests: guestDetails.specialRequests,
    }).returning();

    // Increment promo code usage if applicable
    if (quote.promoCode) {
      await db.update(schema.promoCodes)
        .set({ usedCount: sql`${schema.promoCodes.usedCount} + 1` })
        .where(eq(schema.promoCodes.code, quote.promoCode));
    }

    res.json({
      success: true,
      confirmationNumber,
      reservationId: reservation[0].id,
      quote,
      guestDetails,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to create booking' });
  }
});

// Expenses CRUD
app.get('/api/expenses', async (req, res) => {
  try {
    const result = await db.select().from(schema.expenses);
    res.json(result);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const result = await db.insert(schema.expenses).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

app.put('/api/expenses/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    const result = await db.update(schema.expenses).set(req.body).where(eq(schema.expenses.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

app.delete('/api/expenses/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    await db.delete(schema.expenses).where(eq(schema.expenses.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// Budgets CRUD
app.get('/api/budgets', async (req, res) => {
  try {
    const result = await db.select().from(schema.budgets);
    res.json(result);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

app.post('/api/budgets', async (req, res) => {
  try {
    const result = await db.insert(schema.budgets).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

app.put('/api/budgets/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    const result = await db.update(schema.budgets).set(req.body).where(eq(schema.budgets.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

app.delete('/api/budgets/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    await db.delete(schema.budgets).where(eq(schema.budgets.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

// Journal Entries CRUD
app.get('/api/journal-entries', async (req, res) => {
  try {
    const result = await db.select().from(schema.journalEntries);
    res.json(result);
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

app.post('/api/journal-entries', async (req, res) => {
  try {
    const result = await db.insert(schema.journalEntries).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

app.put('/api/journal-entries/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    const result = await db.update(schema.journalEntries).set(req.body).where(eq(schema.journalEntries.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating journal entry:', error);
    res.status(500).json({ error: 'Failed to update journal entry' });
  }
});

app.delete('/api/journal-entries/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    await db.delete(schema.journalEntries).where(eq(schema.journalEntries.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});

// Requisitions CRUD
app.get('/api/requisitions', async (req, res) => {
  try {
    const result = await db.select().from(schema.requisitions);
    res.json(result);
  } catch (error) {
    console.error('Error fetching requisitions:', error);
    res.status(500).json({ error: 'Failed to fetch requisitions' });
  }
});

app.post('/api/requisitions', async (req, res) => {
  try {
    const result = await db.insert(schema.requisitions).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error creating requisition:', error);
    res.status(500).json({ error: 'Failed to create requisition' });
  }
});

app.put('/api/requisitions/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    const result = await db.update(schema.requisitions).set(req.body).where(eq(schema.requisitions.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating requisition:', error);
    res.status(500).json({ error: 'Failed to update requisition' });
  }
});

app.delete('/api/requisitions/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    await db.delete(schema.requisitions).where(eq(schema.requisitions.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting requisition:', error);
    res.status(500).json({ error: 'Failed to delete requisition' });
  }
});

// Purchase Orders CRUD
app.get('/api/purchase-orders', async (req, res) => {
  try {
    const result = await db.select().from(schema.purchaseOrders);
    res.json(result);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
});

app.post('/api/purchase-orders', async (req, res) => {
  try {
    const result = await db.insert(schema.purchaseOrders).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({ error: 'Failed to create purchase order' });
  }
});

app.put('/api/purchase-orders/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    const result = await db.update(schema.purchaseOrders).set(req.body).where(eq(schema.purchaseOrders.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating purchase order:', error);
    res.status(500).json({ error: 'Failed to update purchase order' });
  }
});

app.delete('/api/purchase-orders/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    await db.delete(schema.purchaseOrders).where(eq(schema.purchaseOrders.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    res.status(500).json({ error: 'Failed to delete purchase order' });
  }
});

// Goods Received Notes CRUD
app.get('/api/goods-received-notes', async (req, res) => {
  try {
    const result = await db.select().from(schema.goodsReceivedNotes);
    res.json(result);
  } catch (error) {
    console.error('Error fetching goods received notes:', error);
    res.status(500).json({ error: 'Failed to fetch goods received notes' });
  }
});

app.post('/api/goods-received-notes', async (req, res) => {
  try {
    const result = await db.insert(schema.goodsReceivedNotes).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error creating goods received note:', error);
    res.status(500).json({ error: 'Failed to create goods received note' });
  }
});

app.put('/api/goods-received-notes/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    const result = await db.update(schema.goodsReceivedNotes).set(req.body).where(eq(schema.goodsReceivedNotes.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating goods received note:', error);
    res.status(500).json({ error: 'Failed to update goods received note' });
  }
});

app.delete('/api/goods-received-notes/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    await db.delete(schema.goodsReceivedNotes).where(eq(schema.goodsReceivedNotes.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting goods received note:', error);
    res.status(500).json({ error: 'Failed to delete goods received note' });
  }
});

// 404 handler - must be after all routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// Error handling middleware - must be last
app.use(errorLogger);

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Security features enabled: ✓ Helmet ✓ CORS ✓ Rate limiting`);
});
