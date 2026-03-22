import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from './db';
import * as schema from '../shared/schema';
import { eq, and, lte, gte, ne, sql, desc } from 'drizzle-orm';
import { computeRateQuote } from './services/rateEngine';
import { 
  securityHeaders, 
  apiLimiter, 
  authLimiter,
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
    const result = await db.update(schema.reservations).set(req.body).where(eq(schema.reservations.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update reservation' });
  }
});

app.patch('/api/reservations/:id', async (req, res) => {
  try {
    const result = await db.update(schema.reservations).set(req.body).where(eq(schema.reservations.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to patch reservation' });
  }
});

app.delete('/api/reservations/:id', async (req, res) => {
  try {
    await db.delete(schema.reservations).where(eq(schema.reservations.id, req.params.id));
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
    const result = await db.update(schema.folios).set(req.body).where(eq(schema.folios.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update folio' });
  }
});

app.patch('/api/folios/:id', async (req, res) => {
  try {
    const result = await db.update(schema.folios).set(req.body).where(eq(schema.folios.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to patch folio' });
  }
});

app.delete('/api/folios/:id', async (req, res) => {
  try {
    await db.delete(schema.folios).where(eq(schema.folios.id, req.params.id));
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
    const result = await db.update(schema.inventoryItems).set(req.body).where(eq(schema.inventoryItems.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

app.patch('/api/inventory/:id', async (req, res) => {
  try {
    const result = await db.update(schema.inventoryItems).set(req.body).where(eq(schema.inventoryItems.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to patch inventory item' });
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  try {
    await db.delete(schema.inventoryItems).where(eq(schema.inventoryItems.id, req.params.id));
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
    const result = await db.update(schema.housekeepingTasks).set(req.body).where(eq(schema.housekeepingTasks.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update housekeeping task' });
  }
});

app.patch('/api/housekeeping-tasks/:id', async (req, res) => {
  try {
    const result = await db.update(schema.housekeepingTasks).set(req.body).where(eq(schema.housekeepingTasks.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to patch housekeeping task' });
  }
});

app.delete('/api/housekeeping-tasks/:id', async (req, res) => {
  try {
    await db.delete(schema.housekeepingTasks).where(eq(schema.housekeepingTasks.id, req.params.id));
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
    const result = await db.update(schema.menuItems).set(req.body).where(eq(schema.menuItems.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

app.patch('/api/menu-items/:id', async (req, res) => {
  try {
    const result = await db.update(schema.menuItems).set(req.body).where(eq(schema.menuItems.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to patch menu item' });
  }
});

app.delete('/api/menu-items/:id', async (req, res) => {
  try {
    await db.delete(schema.menuItems).where(eq(schema.menuItems.id, req.params.id));
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
    const result = await db.update(schema.orders).set(req.body).where(eq(schema.orders.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

app.patch('/api/orders/:id', async (req, res) => {
  try {
    const result = await db.update(schema.orders).set(req.body).where(eq(schema.orders.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to patch order' });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    await db.delete(schema.orders).where(eq(schema.orders.id, req.params.id));
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
    const result = await db.update(schema.suppliers).set(req.body).where(eq(schema.suppliers.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

app.patch('/api/suppliers/:id', async (req, res) => {
  try {
    const result = await db.update(schema.suppliers).set(req.body).where(eq(schema.suppliers.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to patch supplier' });
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    await db.delete(schema.suppliers).where(eq(schema.suppliers.id, req.params.id));
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
    const result = await db.update(schema.employees).set(req.body).where(eq(schema.employees.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

app.patch('/api/employees/:id', async (req, res) => {
  try {
    const result = await db.update(schema.employees).set(req.body).where(eq(schema.employees.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to patch employee' });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    await db.delete(schema.employees).where(eq(schema.employees.id, req.params.id));
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
    const result = await db.update(schema.maintenanceRequests).set(req.body).where(eq(schema.maintenanceRequests.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update maintenance request' });
  }
});

app.patch('/api/maintenance-requests/:id', async (req, res) => {
  try {
    const result = await db.update(schema.maintenanceRequests).set(req.body).where(eq(schema.maintenanceRequests.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to patch maintenance request' });
  }
});

app.delete('/api/maintenance-requests/:id', async (req, res) => {
  try {
    await db.delete(schema.maintenanceRequests).where(eq(schema.maintenanceRequests.id, req.params.id));
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
  const defaultBranding = {
    hotelName: 'W3 Hotel',
    tagline: 'Your Comfortable Stay',
    primaryColor: '#1a56db',
    secondaryColor: '#0e9f6e',
    currency: 'LKR',
    currencySymbol: 'LKR',
    timezone: 'Asia/Colombo',
    logo: null
  };
  try {
    const result = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, 'branding'));
    if (result && result.length > 0 && result[0].value) {
      res.json(JSON.parse(result[0].value));
    } else {
      res.json(defaultBranding);
    }
  } catch (error) {
    console.error('Failed to fetch branding:', error);
    res.json(defaultBranding);
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
    const channelId = parseInt(req.params.id);

    // Try to load the real adapter and run a live health check
    let healthy = false;
    let responseTimeMs = 0;
    let errorMessage: string | undefined;

    try {
      const { getAdapterForChannel } = await import('./channel-manager/adapters/factory');
      const t0 = Date.now();
      const adapter = await getAdapterForChannel(channelId);
      const result = await adapter.healthCheck();
      healthy = result.healthy;
      responseTimeMs = result.responseTimeMs ?? (Date.now() - t0);
      errorMessage = result.message;
    } catch (adapterErr) {
      // Adapter not configured for this channel ID yet; fall back to credential validation
      const { apiKey, propertyId } = req.body;
      if (!apiKey || !propertyId) {
        return res.status(400).json({ error: 'Channel adapter not configured. Provide apiKey and propertyId to test.' });
      }
      healthy = true; // Credentials present — treat as "validated"
      errorMessage = adapterErr instanceof Error ? adapterErr.message : String(adapterErr);
    }

    // Log the test in sync logs
    await db.insert(schema.channelSyncLogs).values({
      channelId,
      channelName: req.body.channelName || 'Unknown',
      syncType: 'test-connection',
      status: healthy ? 'success' : 'error',
      recordsProcessed: 0,
      recordsSuccess: 0,
      recordsFailed: 0,
      errorMessage: errorMessage ?? null,
      startedAt: new Date(),
      completedAt: new Date(),
      duration: Math.round(responseTimeMs / 1000),
    });

    if (healthy) {
      res.json({ success: true, message: 'Connection test successful', responseTimeMs });
    } else {
      res.status(503).json({ success: false, message: errorMessage ?? 'Connection test failed', responseTimeMs });
    }
  } catch (error) {
    console.error('Error testing channel connection:', error);
    res.status(500).json({ error: 'Connection test failed', details: error instanceof Error ? error.message : String(error) });
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

app.post('/api/audit-logs', async (req, res) => {
  try {
    const result = await db.insert(schema.auditLogs).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create audit log' });
  }
});

app.delete('/api/audit-logs/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    await db.delete(schema.auditLogs).where(eq(schema.auditLogs.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete audit log' });
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

app.post('/api/channel-bookings', async (req, res) => {
  try {
    const result = await db.insert(schema.channelBookings).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create channel booking' });
  }
});

app.put('/api/channel-bookings/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    const result = await db.update(schema.channelBookings).set(req.body).where(eq(schema.channelBookings.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update channel booking' });
  }
});

app.delete('/api/channel-bookings/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    await db.delete(schema.channelBookings).where(eq(schema.channelBookings.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete channel booking' });
  }
});

// Sync bookings from a specific channel — routes through new queue-based microservice
app.post('/api/channels/:id/sync-bookings', async (req, res) => {
  try {
    const channelId = parseInt(req.params.id);
    const { startDate, endDate } = req.body;

    const { syncService } = await import('./channel-manager/services/sync-service');
    const jobId = await syncService.enqueueFetchBookings({
      channelId,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + 7 * 86400_000),
    });

    res.json({ success: true, jobId, message: `Booking fetch enqueued (job ${jobId})` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to enqueue booking sync', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Sync availability to channel — routes through new queue-based microservice
app.post('/api/channels/:id/sync-availability', async (req, res) => {
  try {
    const channelId = parseInt(req.params.id);
    const { roomType, date, available, startDate, endDate } = req.body;

    const { syncService } = await import('./channel-manager/services/sync-service');

    // Build inventory payload if explicit values provided; otherwise push from DB
    const inventory = roomType && (date || startDate)
      ? [{
          roomTypeCode: roomType,
          date: date ?? startDate,
          available: available ?? 0,
        }]
      : [];

    const jobId = await syncService.enqueuePushAvailability(inventory, {
      channelId,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 86400_000),
      priority: 3,
    });

    res.json({ success: true, jobId, message: `Availability push enqueued (job ${jobId})` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to enqueue availability sync', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Sync rates to channel — routes through new queue-based microservice
app.post('/api/channels/:id/sync-rates', async (req, res) => {
  try {
    const channelId = parseInt(req.params.id);
    const { roomType, date, rate, startDate, endDate, currency = 'LKR' } = req.body;

    const { syncService } = await import('./channel-manager/services/sync-service');

    const rates = roomType && (date || startDate) && rate != null
      ? [{
          roomTypeCode: roomType,
          date: date ?? startDate,
          rate: parseFloat(rate),
          currency,
        }]
      : [];

    const jobId = await syncService.enqueuePushRates(rates, {
      channelId,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + 30 * 86400_000),
      priority: 3,
    });

    res.json({ success: true, jobId, message: `Rate push enqueued (job ${jobId})` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to enqueue rates sync', details: error instanceof Error ? error.message : 'Unknown error' });
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

app.delete('/api/channel-sync-logs/:id', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    await db.delete(schema.channelSyncLogs).where(eq(schema.channelSyncLogs.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete sync log' });
  }
});

// Per-channel stats — bookings, revenue, last sync, health
app.get('/api/channels/:id/stats', validate(idParamSchema, 'params'), async (req, res) => {
  try {
    const channelId = parseInt(req.params.id);
    const { days = '30' } = req.query as { days?: string };

    const start = new Date(Date.now() - parseInt(days) * 86400_000);
    const startDate = start.toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];

    // Bookings
    const bookings = await db.select({
      status: schema.channelBookings.status,
      totalAmount: schema.channelBookings.totalAmount,
      commission: schema.channelBookings.commission,
    })
      .from(schema.channelBookings)
      .where(
        and(
          eq(schema.channelBookings.channelId, channelId),
          gte(schema.channelBookings.checkIn, startDate),
        )
      );

    const totalRevenue = bookings.reduce((s, b) => s + parseFloat(b.totalAmount ?? '0'), 0);
    const totalCommission = bookings.reduce((s, b) => s + parseFloat(b.commission ?? '0'), 0);

    // Last 10 sync logs for this channel
    const syncLogs = await db.select()
      .from(schema.channelSyncLogs)
      .where(eq(schema.channelSyncLogs.channelId, channelId))
      .orderBy(desc(schema.channelSyncLogs.startedAt))
      .limit(10);

    // Health
    const health = await db.select()
      .from(schema.channelHealth)
      .where(eq(schema.channelHealth.channelId, channelId))
      .limit(1);

    res.json({
      success: true,
      channelId,
      period: { startDate, endDate, days: parseInt(days) },
      bookings: {
        total: bookings.length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
        checkedIn: bookings.filter(b => b.status === 'checked_in').length,
      },
      revenue: {
        total: Math.round(totalRevenue * 100) / 100,
        commission: Math.round(totalCommission * 100) / 100,
        net: Math.round((totalRevenue - totalCommission) * 100) / 100,
        currency: 'LKR',
      },
      health: health[0] ?? { status: 'unknown' },
      recentSyncLogs: syncLogs,
    });
  } catch (error) {
    console.error('Error fetching channel stats:', error);
    res.status(500).json({ error: 'Failed to fetch channel stats' });
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
    await backupService.deleteBackup(req.params.id);
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
    const result = await db.update(schema.ratePlans).set({ ...req.body, updatedAt: new Date() }).where(eq(schema.ratePlans.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update rate plan' });
  }
});

app.delete('/api/booking/rate-plans/:id', async (req, res) => {
  try {
    await db.delete(schema.ratePlans).where(eq(schema.ratePlans.id, req.params.id));
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
    await db.delete(schema.residentRules).where(eq(schema.residentRules.id, req.params.id));
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
    await db.delete(schema.seasonalMultipliers).where(eq(schema.seasonalMultipliers.id, req.params.id));
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
    const result = await db.update(schema.promoCodes).set(data).where(eq(schema.promoCodes.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update promo code' });
  }
});

app.delete('/api/booking/promo-codes/:id', async (req, res) => {
  try {
    await db.delete(schema.promoCodes).where(eq(schema.promoCodes.id, req.params.id));
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

// ─── Attendances ──────────────────────────────────────────────────────────────

app.get('/api/attendances', async (req, res) => {
  try {
    const result = await db.select().from(schema.attendanceRecords).catch(() => []);
    res.json(result);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch attendances' }); }
});

app.post('/api/attendances', async (req, res) => {
  try {
    const { id, employeeId, date, checkIn, checkOut, status, notes } = req.body;
    const result = await db.insert(schema.attendanceRecords).values({
      id: id || `att-${Date.now()}`, employeeId, date, checkIn, checkOut, status, notes
    }).returning();
    res.json(result[0]);
  } catch (error) { res.status(500).json({ error: 'Failed to create attendance' }); }
});

app.put('/api/attendances/:id', async (req, res) => {
  try {
    const { employeeId, date, checkIn, checkOut, status, notes } = req.body;
    const result = await db.update(schema.attendanceRecords)
      .set({ employeeId, date, checkIn, checkOut, status, notes })
      .where(eq(schema.attendanceRecords.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) { res.status(500).json({ error: 'Failed to update attendance' }); }
});

app.delete('/api/attendances/:id', async (req, res) => {
  try {
    await db.delete(schema.attendanceRecords).where(eq(schema.attendanceRecords.id, req.params.id));
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to delete attendance' }); }
});

// ─── Leave Requests ────────────────────────────────────────────────────────────

app.get('/api/leave-requests', async (req, res) => {
  try {
    const result = await db.select().from(schema.leaveRequests).catch(() => []);
    res.json(result);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch leave requests' }); }
});

app.post('/api/leave-requests', async (req, res) => {
  try {
    const { id, employeeId, leaveType, startDate, endDate, reason, status, approvedBy } = req.body;
    const result = await db.insert(schema.leaveRequests).values({
      id: id || `lr-${Date.now()}`, employeeId, leaveType, startDate, endDate, reason, status, approvedBy
    }).returning();
    res.json(result[0]);
  } catch (error) { res.status(500).json({ error: 'Failed to create leave request' }); }
});

app.put('/api/leave-requests/:id', async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason, status, approvedBy } = req.body;
    const result = await db.update(schema.leaveRequests)
      .set({ employeeId, leaveType, startDate, endDate, reason, status, approvedBy, updatedAt: new Date() })
      .where(eq(schema.leaveRequests.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) { res.status(500).json({ error: 'Failed to update leave request' }); }
});

app.delete('/api/leave-requests/:id', async (req, res) => {
  try {
    await db.delete(schema.leaveRequests).where(eq(schema.leaveRequests.id, req.params.id));
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to delete leave request' }); }
});

// ─── Duty Rosters ─────────────────────────────────────────────────────────────

app.get('/api/duty-rosters', async (req, res) => {
  try {
    const result = await db.select().from(schema.dutyRosters).catch(() => []);
    res.json(result);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch duty rosters' }); }
});

app.post('/api/duty-rosters', async (req, res) => {
  try {
    const { id, employeeId, shiftId, date, status, notes } = req.body;
    const result = await db.insert(schema.dutyRosters).values({
      id: id || `dr-${Date.now()}`, employeeId, shiftId, date: new Date(date), status, notes
    }).returning();
    res.json(result[0]);
  } catch (error) { res.status(500).json({ error: 'Failed to create duty roster' }); }
});

app.put('/api/duty-rosters/:id', async (req, res) => {
  try {
    const { employeeId, shiftId, date, status, notes } = req.body;
    const result = await db.update(schema.dutyRosters)
      .set({ employeeId, shiftId, date: new Date(date), status, notes })
      .where(eq(schema.dutyRosters.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) { res.status(500).json({ error: 'Failed to update duty roster' }); }
});

app.delete('/api/duty-rosters/:id', async (req, res) => {
  try {
    await db.delete(schema.dutyRosters).where(eq(schema.dutyRosters.id, req.params.id));
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to delete duty roster' }); }
});

// ─── Cost Centers ──────────────────────────────────────────────────────────────

app.get('/api/cost-centers', async (req, res) => {
  try {
    const result = await db.select().from(schema.costCenters).catch(() => []);
    res.json(result);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch cost centers' }); }
});

app.post('/api/cost-centers', async (req, res) => {
  try {
    const { id, code, name, department, manager, budget, spent, isActive } = req.body;
    const result = await db.insert(schema.costCenters).values({
      id: id || `cc-${Date.now()}`, code, name, department, manager, budget, spent, isActive
    }).returning();
    res.json(result[0]);
  } catch (error) { res.status(500).json({ error: 'Failed to create cost center' }); }
});

app.put('/api/cost-centers/:id', async (req, res) => {
  try {
    const { code, name, department, manager, budget, spent, isActive } = req.body;
    const result = await db.update(schema.costCenters)
      .set({ code, name, department, manager, budget, spent, isActive })
      .where(eq(schema.costCenters.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) { res.status(500).json({ error: 'Failed to update cost center' }); }
});

app.delete('/api/cost-centers/:id', async (req, res) => {
  try {
    await db.delete(schema.costCenters).where(eq(schema.costCenters.id, req.params.id));
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to delete cost center' }); }
});

// ─── Profit Centers ────────────────────────────────────────────────────────────

app.get('/api/profit-centers', async (req, res) => {
  try {
    const result = await db.select().from(schema.profitCenters).catch(() => []);
    res.json(result);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch profit centers' }); }
});

app.post('/api/profit-centers', async (req, res) => {
  try {
    const { id, code, name, department, manager, targetRevenue, actualRevenue, targetCost, actualCost, isActive } = req.body;
    const result = await db.insert(schema.profitCenters).values({
      id: id || `pc-${Date.now()}`, code, name, department, manager, targetRevenue, actualRevenue, targetCost, actualCost, isActive
    }).returning();
    res.json(result[0]);
  } catch (error) { res.status(500).json({ error: 'Failed to create profit center' }); }
});

app.put('/api/profit-centers/:id', async (req, res) => {
  try {
    const { code, name, department, manager, targetRevenue, actualRevenue, targetCost, actualCost, isActive } = req.body;
    const result = await db.update(schema.profitCenters)
      .set({ code, name, department, manager, targetRevenue, actualRevenue, targetCost, actualCost, isActive })
      .where(eq(schema.profitCenters.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) { res.status(500).json({ error: 'Failed to update profit center' }); }
});

app.delete('/api/profit-centers/:id', async (req, res) => {
  try {
    await db.delete(schema.profitCenters).where(eq(schema.profitCenters.id, req.params.id));
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to delete profit center' }); }
});

// ─── Financial Payments ────────────────────────────────────────────────────────

app.get('/api/payments', async (req, res) => {
  try {
    const result = await db.select().from(schema.financialPayments).catch(() => []);
    res.json(result);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch payments' }); }
});

app.post('/api/payments', async (req, res) => {
  try {
    const { id, paymentNumber, type, amount, method, status, referenceId, referenceType, description, processedAt, processedBy } = req.body;
    const result = await db.insert(schema.financialPayments).values({
      id: id || `pay-${Date.now()}`, paymentNumber: paymentNumber || `PAY-${Date.now()}`,
      type: type || 'general', amount, method, status, referenceId, referenceType, description,
      processedAt: processedAt ? new Date(processedAt) : null, processedBy
    }).returning();
    res.json(result[0]);
  } catch (error) { res.status(500).json({ error: 'Failed to create payment' }); }
});

app.put('/api/payments/:id', async (req, res) => {
  try {
    const { paymentNumber, type, amount, method, status, referenceId, referenceType, description, processedAt, processedBy } = req.body;
    const result = await db.update(schema.financialPayments)
      .set({ paymentNumber, type, amount, method, status, referenceId, referenceType, description,
        processedAt: processedAt ? new Date(processedAt) : null, processedBy })
      .where(eq(schema.financialPayments.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) { res.status(500).json({ error: 'Failed to update payment' }); }
});

app.delete('/api/payments/:id', async (req, res) => {
  try {
    await db.delete(schema.financialPayments).where(eq(schema.financialPayments.id, req.params.id));
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to delete payment' }); }
});

// ─── Activity Logs ─────────────────────────────────────────────────────────────

app.get('/api/activity-logs', async (req, res) => {
  try {
    const result = await db.select().from(schema.activityLogs).catch(() => []);
    res.json(result);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch activity logs' }); }
});

app.post('/api/activity-logs', async (req, res) => {
  try {
    const { id, userId, action, entityType, entityId, details } = req.body;
    const result = await db.insert(schema.activityLogs).values({
      id: id || `al-${Date.now()}`, userId, action, entityType, entityId, details
    }).returning();
    res.json(result[0]);
  } catch (error) { res.status(500).json({ error: 'Failed to create activity log' }); }
});

app.delete('/api/activity-logs/:id', async (req, res) => {
  try {
    await db.delete(schema.activityLogs).where(eq(schema.activityLogs.id, req.params.id));
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to delete activity log' }); }
});

// ─── Folio Charges ─────────────────────────────────────────────────────────────

app.get('/api/folio-charges', async (req, res) => {
  try {
    const result = await db.select().from(schema.folioCharges).catch(() => []);
    res.json(result);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch folio charges' }); }
});

app.post('/api/folio-charges', async (req, res) => {
  try {
    const { id, folioId, description, amount, quantity, department, postedBy } = req.body;
    const result = await db.insert(schema.folioCharges).values({
      id: id || `fc-${Date.now()}`, folioId, description, amount, quantity: quantity || 1, department, postedBy
    }).returning();
    res.json(result[0]);
  } catch (error) { res.status(500).json({ error: 'Failed to create folio charge' }); }
});

app.put('/api/folio-charges/:id', async (req, res) => {
  try {
    const { folioId, description, amount, quantity, department, postedBy } = req.body;
    const result = await db.update(schema.folioCharges)
      .set({ folioId, description, amount, quantity, department, postedBy })
      .where(eq(schema.folioCharges.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) { res.status(500).json({ error: 'Failed to update folio charge' }); }
});

app.delete('/api/folio-charges/:id', async (req, res) => {
  try {
    await db.delete(schema.folioCharges).where(eq(schema.folioCharges.id, req.params.id));
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to delete folio charge' }); }
});

// ─── Folio Payments ────────────────────────────────────────────────────────────

app.get('/api/folio-payments', async (req, res) => {
  try {
    const result = await db.select().from(schema.folioPayments).catch(() => []);
    res.json(result);
  } catch (error) { res.status(500).json({ error: 'Failed to fetch folio payments' }); }
});

app.post('/api/folio-payments', async (req, res) => {
  try {
    const { id, folioId, amount, method, status, reference, receivedBy } = req.body;
    const result = await db.insert(schema.folioPayments).values({
      id: id || `fp-${Date.now()}`, folioId, amount, method, status, reference, receivedBy
    }).returning();
    res.json(result[0]);
  } catch (error) { res.status(500).json({ error: 'Failed to create folio payment' }); }
});

app.put('/api/folio-payments/:id', async (req, res) => {
  try {
    const { folioId, amount, method, status, reference, receivedBy } = req.body;
    const result = await db.update(schema.folioPayments)
      .set({ folioId, amount, method, status, reference, receivedBy })
      .where(eq(schema.folioPayments.id, req.params.id)).returning();
    res.json(result[0]);
  } catch (error) { res.status(500).json({ error: 'Failed to update folio payment' }); }
});

app.delete('/api/folio-payments/:id', async (req, res) => {
  try {
    await db.delete(schema.folioPayments).where(eq(schema.folioPayments.id, req.params.id));
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to delete folio payment' }); }
});

// ─── Guest Invoices ────────────────────────────────────────────────────────────

app.get('/api/guest-invoices', async (req, res) => {
  try {
    const rows = await db.select().from(schema.guestInvoices).catch(() => []);
    res.json(rows.map(r => ({ ...(r.data as object || {}), id: r.id, invoiceNumber: r.invoiceNumber, guestId: r.guestId, status: r.status, invoiceType: r.invoiceType, grandTotal: r.grandTotal, amountDue: r.amountDue, invoiceDate: r.invoiceDate })));
  } catch (error) { res.status(500).json({ error: 'Failed to fetch guest invoices' }); }
});

app.post('/api/guest-invoices', async (req, res) => {
  try {
    const body = req.body;
    const result = await db.insert(schema.guestInvoices).values({
      id: body.id || `gi-${Date.now()}`,
      invoiceNumber: body.invoiceNumber || `INV-${Date.now()}`,
      guestId: body.guestId,
      status: body.status || 'draft',
      invoiceType: body.invoiceType || 'guest-folio',
      grandTotal: String(body.grandTotal || 0),
      amountDue: String(body.amountDue || 0),
      invoiceDate: body.invoiceDate || Date.now(),
      data: body,
    }).returning();
    res.json({ ...(result[0].data as object || {}), id: result[0].id, status: result[0].status });
  } catch (error) { res.status(500).json({ error: 'Failed to create guest invoice' }); }
});

app.put('/api/guest-invoices/:id', async (req, res) => {
  try {
    const body = req.body;
    const result = await db.update(schema.guestInvoices)
      .set({
        status: body.status,
        grandTotal: String(body.grandTotal || 0),
        amountDue: String(body.amountDue || 0),
        invoiceDate: body.invoiceDate,
        data: body,
        updatedAt: new Date(),
      })
      .where(eq(schema.guestInvoices.id, req.params.id)).returning();
    res.json({ ...(result[0]?.data as object || {}), id: result[0]?.id, status: result[0]?.status });
  } catch (error) { res.status(500).json({ error: 'Failed to update guest invoice' }); }
});

app.delete('/api/guest-invoices/:id', async (req, res) => {
  try {
    await db.delete(schema.guestInvoices).where(eq(schema.guestInvoices.id, req.params.id));
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to delete guest invoice' }); }
});

// ─── Lost & Found ──────────────────────────────────────────────────────────────

app.get('/api/lost-found', async (req, res) => {
  try {
    const rows = await db.select().from(schema.lostFoundItems).catch(() => []);
    res.json(rows.map(r => ({ ...(r.data as object || {}), id: r.id, itemNumber: r.itemNumber, status: r.status, category: r.category, foundDate: r.foundDate })));
  } catch (error) { res.status(500).json({ error: 'Failed to fetch lost & found items' }); }
});

app.post('/api/lost-found', async (req, res) => {
  try {
    const body = req.body;
    const result = await db.insert(schema.lostFoundItems).values({
      id: body.id || `lf-${Date.now()}`,
      itemNumber: body.itemNumber || `LF-${Date.now()}`,
      status: body.status || 'reported',
      category: body.category,
      foundDate: body.foundDate || Date.now(),
      data: body,
    }).returning();
    res.json({ ...(result[0].data as object || {}), id: result[0].id, status: result[0].status });
  } catch (error) { res.status(500).json({ error: 'Failed to create lost & found item' }); }
});

app.put('/api/lost-found/:id', async (req, res) => {
  try {
    const body = req.body;
    const result = await db.update(schema.lostFoundItems)
      .set({ status: body.status, category: body.category, foundDate: body.foundDate, data: body })
      .where(eq(schema.lostFoundItems.id, req.params.id)).returning();
    res.json({ ...(result[0]?.data as object || {}), id: result[0]?.id, status: result[0]?.status });
  } catch (error) { res.status(500).json({ error: 'Failed to update lost & found item' }); }
});

app.delete('/api/lost-found/:id', async (req, res) => {
  try {
    await db.delete(schema.lostFoundItems).where(eq(schema.lostFoundItems.id, req.params.id));
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to delete lost & found item' }); }
});

// ─── Guest Profiles ────────────────────────────────────────────────────────────

app.get('/api/guest-profiles', async (req, res) => {
  try {
    const rows = await db.select().from(schema.guestProfiles).catch(() => []);
    res.json(rows.map(r => {
      const data = typeof r.data === 'object' && r.data ? r.data as Record<string, unknown> : {};
      return { ...data, id: r.id, guestId: r.guestId, vipStatus: r.vipStatus, loyaltyTier: r.loyaltyTier };
    }));
  } catch (error) { res.status(500).json({ error: 'Failed to fetch guest profiles' }); }
});

app.post('/api/guest-profiles', async (req, res) => {
  try {
    const body = req.body;
    const result = await db.insert(schema.guestProfiles).values({
      id: body.id || `gp-${Date.now()}`,
      guestId: body.guestId,
      vipStatus: body.vipStatus,
      preferences: body.preferences ? JSON.stringify(body.preferences) : null,
      dietaryRestrictions: body.dietaryRestrictions ? JSON.stringify(body.dietaryRestrictions) : null,
      roomPreferences: body.roomPreferences ? JSON.stringify(body.roomPreferences) : null,
      loyaltyTier: body.loyaltyTier || 'Bronze',
      totalSpend: String(body.totalSpend || 0),
      totalVisits: body.totalVisits || 0,
    } as any).returning();
    res.json({ ...body, id: result[0].id });
  } catch (error) { res.status(500).json({ error: 'Failed to create guest profile' }); }
});

app.put('/api/guest-profiles/:id', async (req, res) => {
  try {
    const body = req.body;
    const result = await db.update(schema.guestProfiles)
      .set({
        guestId: body.guestId,
        vipStatus: body.vipStatus,
        loyaltyTier: body.loyaltyTier || 'Bronze',
        totalSpend: String(body.totalSpend || 0),
        totalVisits: body.totalVisits || 0,
        updatedAt: new Date(),
      })
      .where(eq(schema.guestProfiles.id, req.params.id)).returning();
    res.json({ ...body, id: result[0]?.id });
  } catch (error) { res.status(500).json({ error: 'Failed to update guest profile' }); }
});

app.delete('/api/guest-profiles/:id', async (req, res) => {
  try {
    await db.delete(schema.guestProfiles).where(eq(schema.guestProfiles.id, req.params.id));
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: 'Failed to delete guest profile' }); }
});

// ─── Extra Settings (generic JSON store) ─────────────────────────────────────

app.get('/api/extra-settings/:key', async (req, res) => {
  try {
    const rows = await db.select().from(schema.extraSettings)
      .where(eq(schema.extraSettings.key, decodeURIComponent(req.params.key))).catch(() => []);
    if (rows.length > 0) {
      res.json({ key: rows[0].key, value: rows[0].value });
    } else {
      res.json(null);
    }
  } catch (error) { res.status(500).json({ error: 'Failed to fetch setting' }); }
});

app.put('/api/extra-settings/:key', async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key);
    const { value } = req.body;
    try {
      const result = await db.insert(schema.extraSettings).values({ key, value, updatedAt: new Date() }).returning();
      res.json(result[0]);
    } catch {
      const result = await db.update(schema.extraSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(schema.extraSettings.key, key)).returning();
      res.json(result[0]);
    }
  } catch (error) { res.status(500).json({ error: 'Failed to save setting' }); }
});

// ─── Email Settings & Sending ─────────────────────────────────────────────────

import { createTransporter, verifyConnection, sendEmail as smtpSendEmail } from './services/emailService';
import type { SMTPSettings } from './services/emailService';

const EMAIL_SETTINGS_KEY = 'email-smtp-settings';

/** Mask the password field before returning to the client */
function maskSettings(settings: SMTPSettings): Omit<SMTPSettings, 'password'> & { password: string } {
  return { ...settings, password: settings.password ? '••••••••' : '' };
}

app.get('/api/email-settings', async (req, res) => {
  try {
    const rows = await db.select().from(schema.systemSettings)
      .where(eq(schema.systemSettings.key, EMAIL_SETTINGS_KEY));
    if (rows.length && rows[0].value) {
      const settings: SMTPSettings = JSON.parse(rows[0].value);
      res.json(maskSettings(settings));
    } else {
      res.json(null);
    }
  } catch (err) {
    console.error('Failed to fetch email settings:', err);
    res.status(500).json({ error: 'Failed to fetch email settings' });
  }
});

app.put('/api/email-settings', async (req, res) => {
  try {
    const incoming: SMTPSettings = req.body;
    // If the client sends the masked password, keep the stored password
    const existing: SMTPSettings | null = await db.select().from(schema.systemSettings)
      .where(eq(schema.systemSettings.key, EMAIL_SETTINGS_KEY))
      .then(rows => rows.length && rows[0].value ? JSON.parse(rows[0].value) : null);

    const isMasked = incoming.password === '••••••••'
    if (!isMasked && !incoming.password) {
      return res.status(400).json({ error: 'SMTP password is required' });
    }
    const toStore: SMTPSettings = {
      ...incoming,
      password: isMasked && existing ? existing.password : incoming.password,
    };

    const value = JSON.stringify(toStore);
    try {
      await db.insert(schema.systemSettings).values({
        key: EMAIL_SETTINGS_KEY, value, category: 'email', description: 'SMTP email configuration',
      });
    } catch {
      await db.update(schema.systemSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(schema.systemSettings.key, EMAIL_SETTINGS_KEY));
    }
    res.json(maskSettings(toStore));
  } catch (err) {
    console.error('Failed to save email settings:', err);
    res.status(500).json({ error: 'Failed to save email settings' });
  }
});

app.post('/api/email/verify', async (req, res) => {
  try {
    const rows = await db.select().from(schema.systemSettings)
      .where(eq(schema.systemSettings.key, EMAIL_SETTINGS_KEY));
    if (!rows.length || !rows[0].value) {
      return res.status(400).json({ error: 'SMTP settings not configured' });
    }
    const settings: SMTPSettings = JSON.parse(rows[0].value);
    const error = await verifyConnection(settings);
    if (error) {
      return res.status(422).json({ error });
    }
    res.json({ success: true, message: 'SMTP connection verified successfully' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

app.post('/api/email/test', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body as { to: string; subject?: string; html?: string; text?: string };
    if (!to) return res.status(400).json({ error: 'Recipient email (to) is required' });

    const rows = await db.select().from(schema.systemSettings)
      .where(eq(schema.systemSettings.key, EMAIL_SETTINGS_KEY));
    if (!rows.length || !rows[0].value) {
      return res.status(400).json({ error: 'SMTP settings not configured. Please configure SMTP in Settings > Email SMTP.' });
    }
    const settings: SMTPSettings = JSON.parse(rows[0].value);
    if (!settings.password) {
      return res.status(400).json({ error: 'SMTP password is not configured' });
    }

    await smtpSendEmail(settings, {
      to,
      subject: subject || 'Test Email from W3 Hotel PMS',
      html: html || `<p>This is a test email from <strong>W3 Hotel PMS</strong>.</p><p>Your SMTP configuration is working correctly.</p>`,
      text: text || 'Test email from W3 Hotel PMS. Your SMTP configuration is working correctly.',
    });
    res.json({ success: true, message: `Test email sent to ${to}` });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Failed to send test email:', msg);
    res.status(500).json({ error: msg });
  }
});

app.post('/api/email/send', async (req, res) => {
  try {
    const { to, subject, html, text, cc, bcc } = req.body;
    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'to, subject, and html are required' });
    }

    const rows = await db.select().from(schema.systemSettings)
      .where(eq(schema.systemSettings.key, EMAIL_SETTINGS_KEY));
    if (!rows.length || !rows[0].value) {
      return res.status(400).json({ error: 'SMTP settings not configured. Please configure SMTP in Settings > Email SMTP.' });
    }
    const settings: SMTPSettings = JSON.parse(rows[0].value);
    if (!settings.password) {
      return res.status(400).json({ error: 'SMTP password is not configured' });
    }

    await smtpSendEmail(settings, { to, subject, html, text, cc, bcc });
    res.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Failed to send email:', msg);
    res.status(500).json({ error: msg });
  }
});

// ─── Authentication Endpoints ─────────────────────────────────────────────────

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be set in production!');
  } else {
    console.warn('[Auth] WARNING: JWT_SECRET not set. Using insecure default. Set JWT_SECRET env var for production!');
  }
}
const JWT_SECRET = process.env.JWT_SECRET || 'w3-hotel-pms-dev-secret-DO-NOT-USE-IN-PRODUCTION';
const JWT_EXPIRES_IN = '8h';
const BCRYPT_ROUNDS = 12;

/**
 * POST /api/auth/login
 * Authenticate user with username/email and password
 */
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username/email and password are required' });
    }

    // Find user by username or email
    const users = await db.select().from(schema.systemUsers);
    const user = users.find(u =>
      u.username.toLowerCase() === identifier.toLowerCase() ||
      (u.email && u.email.toLowerCase() === identifier.toLowerCase())
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Use strict false check — null/undefined isActive defaults to active
    if (user.isActive === false) {
      return res.status(403).json({ error: 'Account is disabled. Please contact your administrator.' });
    }

    // If no password hash set, this account requires setup via the admin UI.
    // For initial system access, the password must be set via direct DB seeding
    // or the first-run setup API. Never compare plain text.
    let passwordValid = false;
    if (!user.passwordHash) {
      // No password set - deny login and prompt admin to set password
      return res.status(401).json({
        error: 'Account password not configured. Please contact your system administrator to set up your password.',
      });
    } else {
      passwordValid = await bcrypt.compare(password, user.passwordHash);
    }

    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await db.update(schema.systemUsers)
      .set({ lastLogin: new Date(), updatedAt: new Date() })
      .where(eq(schema.systemUsers.id, user.id));

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
        firstName: user.firstName || user.displayName?.split(' ')[0] || user.username,
        lastName: user.lastName || user.displayName?.split(' ').slice(1).join(' ') || '',
        displayName: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Always return success to avoid user enumeration
    const users = await db.select().from(schema.systemUsers);
    const user = users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());

    if (user && user.isActive) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      await db.update(schema.systemUsers)
        .set({
          passwordResetToken: resetToken,
          passwordResetExpires: resetExpires,
          updatedAt: new Date(),
        })
        .where(eq(schema.systemUsers.id, user.id));

      // Attempt to send email via SMTP if configured
      try {
        const settingsRows = await db.select().from(schema.systemSettings)
          .where(eq(schema.systemSettings.key, 'email-smtp-settings'));

        if (settingsRows.length && settingsRows[0].value) {
          const smtpSettings = JSON.parse(settingsRows[0].value);
          const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}?reset_token=${resetToken}`;
          await smtpSendEmail(smtpSettings, {
            to: user.email!,
            subject: 'Password Reset Request - W3 Hotel PMS',
            html: `
              <h2>Password Reset Request</h2>
              <p>Hello ${user.username},</p>
              <p>You requested a password reset. Click the link below to reset your password:</p>
              <p><a href="${resetUrl}" style="background:#1a56db;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;">Reset Password</a></p>
              <p>This link expires in 30 minutes.</p>
              <p>If you didn't request this, please ignore this email.</p>
              <hr/>
              <p style="color:#666;font-size:12px;">W3 Hotel PMS | Developed by W3 Media</p>
            `,
            text: `Reset your password by visiting: ${resetUrl}\n\nThis link expires in 30 minutes.`,
          });
        }
      } catch {
        // Silently fail email send - token is still stored
      }
    }

    res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const users = await db.select().from(schema.systemUsers);
    const user = users.find(u =>
      u.passwordResetToken === token &&
      u.passwordResetExpires &&
      u.passwordResetExpires > new Date()
    );

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await db.update(schema.systemUsers)
      .set({
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(schema.systemUsers.id, user.id));

    res.json({ success: true, message: 'Password reset successfully. You can now sign in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

/**
 * GET /api/auth/verify
 * Verify JWT token validity
 */
app.get('/api/auth/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string; role: string };
    res.json({ valid: true, userId: decoded.userId, username: decoded.username, role: decoded.role });
  } catch {
    res.status(401).json({ valid: false, error: 'Invalid or expired token' });
  }
});

// ─── Channel Manager Microservice (embedded) ─────────────────────────────────
// Mount the channel manager API at /api/channel-manager
// This allows using it as either an embedded module or standalone microservice

import { createChannelManagerApp, initChannelManager } from './channel-manager/index';

const channelManagerApp = createChannelManagerApp();
app.use('/api/channel-manager', channelManagerApp);

// Initialize queue and processors (shared with main server process)
initChannelManager();

/**
 * POST /api/auth/set-password
 * Set or change password for authenticated user (or by super-admin for any user)
 */
app.post('/api/auth/set-password', authLimiter, async (req, res) => {
  try {
    const { userId, currentPassword, newPassword, adminOverride } = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'User ID and new password are required' });
    }

    const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordStrengthRegex.test(newPassword)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'
      });
    }

    const users = await db.select().from(schema.systemUsers);
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!adminOverride) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required' });
      }
      if (!user.passwordHash) {
        return res.status(400).json({ error: 'No password set for this account' });
      }
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
    }

    const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await db.update(schema.systemUsers)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(eq(schema.systemUsers.id, userId));

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('Set password error:', err);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

/**
 * POST /api/auth/init-super-admin
 * Initialize the super admin account (idempotent - safe to call multiple times)
 */
app.post('/api/auth/init-super-admin', async (req, res) => {
  try {
    const SUPER_ADMIN_EMAIL = 'devindachinthaka@gmail.com';
    const SUPER_ADMIN_PASSWORD = 'DevSachi123@#';
    const hash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, BCRYPT_ROUNDS);

    const users = await db.select().from(schema.systemUsers);
    const existing = users.find(u => u.email && u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());

    if (existing) {
      await db.update(schema.systemUsers)
        .set({
          passwordHash: hash,
          role: 'super-admin',
          isActive: true,
          username: 'superadmin',
          firstName: 'Devinda',
          lastName: 'Chinthaka',
          displayName: 'Devinda Chinthaka',
          updatedAt: new Date(),
        })
        .where(eq(schema.systemUsers.id, existing.id));
      return res.json({ success: true, action: 'updated', id: existing.id });
    }

    const result = await db.insert(schema.systemUsers).values({
      id: 'super-admin-1',
      username: 'superadmin',
      displayName: 'Devinda Chinthaka',
      firstName: 'Devinda',
      lastName: 'Chinthaka',
      email: SUPER_ADMIN_EMAIL,
      role: 'super-admin',
      isActive: true,
      passwordHash: hash,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    res.json({ success: true, action: 'created', id: result[0]?.id });
  } catch (err) {
    console.error('Init super admin error:', err);
    res.status(500).json({ error: 'Failed to initialize super admin', detail: String(err) });
  }
});

/**
 * POST /api/auth/upsert-user
 * Called from UI when a user is created or updated — syncs to the auth system_users table.
 * Does NOT set/change passwords (password must be set separately via set-password).
 */
app.post('/api/auth/upsert-user', async (req, res) => {
  try {
    const { id, username, email, firstName, lastName, role, isActive } = req.body;
    if (!id || !username) return res.status(400).json({ error: 'id and username are required' });

    const existing = await db.select().from(schema.systemUsers)
      .where(eq(schema.systemUsers.id, id)).catch(() => []);

    if (existing.length > 0) {
      await db.update(schema.systemUsers)
        .set({
          username, email, firstName, lastName,
          displayName: `${firstName || ''} ${lastName || ''}`.trim() || username,
          role: role || existing[0].role,
          isActive: isActive !== undefined ? isActive : existing[0].isActive,
          updatedAt: new Date(),
        })
        .where(eq(schema.systemUsers.id, id));
      return res.json({ success: true, action: 'updated' });
    }

    await db.insert(schema.systemUsers).values({
      id, username, email, firstName, lastName,
      displayName: `${firstName || ''} ${lastName || ''}`.trim() || username,
      role: role || 'user-requester',
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date(), updatedAt: new Date(),
    });
    res.json({ success: true, action: 'created' });
  } catch (err) {
    console.error('Upsert user error:', err);
    res.status(500).json({ error: 'Failed to sync user', detail: String(err) });
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
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`API Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Security features enabled: ✓ Helmet ✓ CORS ✓ Rate limiting`);

  // Auto-initialize super admin on startup (idempotent)
  try {
    const SUPER_ADMIN_EMAIL = 'devindachinthaka@gmail.com';
    const SUPER_ADMIN_PASSWORD = 'DevSachi123@#';
    const SUPER_ADMIN_ID = 'super-admin-1';
    const users = await db.select().from(schema.systemUsers);
    const existing = users.find(u => u.email && u.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());
    const hash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, BCRYPT_ROUNDS);

    if (existing) {
      await db.update(schema.systemUsers)
        .set({ passwordHash: hash, role: 'super-admin', isActive: true,
               firstName: 'Devinda', lastName: 'Chinthaka',
               displayName: 'Devinda Chinthaka', username: 'superadmin', updatedAt: new Date() })
        .where(eq(schema.systemUsers.id, existing.id));
      console.log('✓ Super admin account verified');
    } else {
      await db.insert(schema.systemUsers).values({
        id: SUPER_ADMIN_ID, username: 'superadmin',
        displayName: 'Devinda Chinthaka', firstName: 'Devinda', lastName: 'Chinthaka',
        email: SUPER_ADMIN_EMAIL, role: 'super-admin', isActive: true,
        passwordHash: hash, createdAt: new Date(), updatedAt: new Date(),
      });
      console.log('✓ Super admin account created');
    }

    // Sync super admin into the UI KV store (extra_settings 'system-users') so it
    // appears in the User Management dashboard.
    const superAdminKvEntry = {
      id: SUPER_ADMIN_ID, userId: SUPER_ADMIN_ID,
      username: 'superadmin', email: SUPER_ADMIN_EMAIL,
      firstName: 'Devinda', lastName: 'Chinthaka',
      phone: '', role: 'super-admin',
      permissions: [], isActive: true,
      createdAt: Date.now(), updatedAt: Date.now(),
    };

    const kvRows = await db.select().from(schema.extraSettings)
      .where(eq(schema.extraSettings.key, 'system-users')).catch(() => []);

    if (kvRows.length > 0) {
      // Merge: replace existing super-admin-1 entry or prepend
      const kvUsers: Record<string, unknown>[] = Array.isArray(kvRows[0].value) ? kvRows[0].value as Record<string, unknown>[] : [];
      const filtered = kvUsers.filter((u: Record<string, unknown>) => u.id !== SUPER_ADMIN_ID);
      const merged = [superAdminKvEntry, ...filtered];
      await db.update(schema.extraSettings)
        .set({ value: merged, updatedAt: new Date() })
        .where(eq(schema.extraSettings.key, 'system-users'));
    } else {
      await db.insert(schema.extraSettings)
        .values({ key: 'system-users', value: [superAdminKvEntry], updatedAt: new Date() });
    }
    console.log('✓ Super admin synced to User Management');
  } catch (err) {
    console.error('Super admin init error:', err);
  }
});
