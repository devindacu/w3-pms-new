import express from 'express';
import cors from 'cors';
import { db } from './db';
import * as schema from '../shared/schema';
import { eq } from 'drizzle-orm';
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
  paginationSchema,
  guestCreateSchema,
  guestUpdateSchema,
  roomCreateSchema,
  roomUpdateSchema,
  reservationCreateSchema,
  reservationUpdateSchema,
  housekeepingTaskCreateSchema,
  housekeepingTaskUpdateSchema,
  menuItemCreateSchema,
  menuItemUpdateSchema,
  invoiceCreateSchema,
  invoiceUpdateSchema,
  employeeCreateSchema,
  employeeUpdateSchema,
  inventoryItemCreateSchema,
  inventoryItemUpdateSchema,
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
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
    const result = await db.insert(schema.reservations).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

app.put('/api/reservations/:id', async (req, res) => {
  try {
    const result = await db.update(schema.reservations).set(req.body).where(eq(schema.reservations.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update reservation' });
  }
});

app.patch('/api/reservations/:id', async (req, res) => {
  try {
    const result = await db.update(schema.reservations).set(req.body).where(eq(schema.reservations.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to patch reservation' });
  }
});

app.delete('/api/reservations/:id', async (req, res) => {
  try {
    await db.delete(schema.reservations).where(eq(schema.reservations.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete reservation' });
  }
});

app.get('/api/folios', async (req, res) => {
  try {
    const result = await db.select().from(schema.folios);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch folios' });
  }
});

app.post('/api/folios', async (req, res) => {
  try {
    const result = await db.insert(schema.folios).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create folio' });
  }
});

app.put('/api/folios/:id', async (req, res) => {
  try {
    const result = await db.update(schema.folios).set(req.body).where(eq(schema.folios.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update folio' });
  }
});

app.patch('/api/folios/:id', async (req, res) => {
  try {
    const result = await db.update(schema.folios).set(req.body).where(eq(schema.folios.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to patch folio' });
  }
});

app.delete('/api/folios/:id', async (req, res) => {
  try {
    await db.delete(schema.folios).where(eq(schema.folios.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete folio' });
  }
});

app.get('/api/inventory', async (req, res) => {
  try {
    const result = await db.select().from(schema.inventoryItems);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

app.post('/api/inventory', async (req, res) => {
  try {
    const result = await db.insert(schema.inventoryItems).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

app.put('/api/inventory/:id', async (req, res) => {
  try {
    const result = await db.update(schema.inventoryItems).set(req.body).where(eq(schema.inventoryItems.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

app.patch('/api/inventory/:id', async (req, res) => {
  try {
    const result = await db.update(schema.inventoryItems).set(req.body).where(eq(schema.inventoryItems.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to patch inventory item' });
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  try {
    await db.delete(schema.inventoryItems).where(eq(schema.inventoryItems.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
});

app.get('/api/housekeeping-tasks', async (req, res) => {
  try {
    const result = await db.select().from(schema.housekeepingTasks);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/housekeeping-tasks', async (req, res) => {
  try {
    const result = await db.insert(schema.housekeepingTasks).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create housekeeping task' });
  }
});

app.put('/api/housekeeping-tasks/:id', async (req, res) => {
  try {
    const result = await db.update(schema.housekeepingTasks).set(req.body).where(eq(schema.housekeepingTasks.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update housekeeping task' });
  }
});

app.patch('/api/housekeeping-tasks/:id', async (req, res) => {
  try {
    const result = await db.update(schema.housekeepingTasks).set(req.body).where(eq(schema.housekeepingTasks.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to patch housekeeping task' });
  }
});

app.delete('/api/housekeeping-tasks/:id', async (req, res) => {
  try {
    await db.delete(schema.housekeepingTasks).where(eq(schema.housekeepingTasks.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete housekeeping task' });
  }
});

app.get('/api/menu-items', async (req, res) => {
  try {
    const result = await db.select().from(schema.menuItems);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

app.post('/api/menu-items', async (req, res) => {
  try {
    const result = await db.insert(schema.menuItems).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

app.put('/api/menu-items/:id', async (req, res) => {
  try {
    const result = await db.update(schema.menuItems).set(req.body).where(eq(schema.menuItems.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

app.patch('/api/menu-items/:id', async (req, res) => {
  try {
    const result = await db.update(schema.menuItems).set(req.body).where(eq(schema.menuItems.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to patch menu item' });
  }
});

app.delete('/api/menu-items/:id', async (req, res) => {
  try {
    await db.delete(schema.menuItems).where(eq(schema.menuItems.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const result = await db.select().from(schema.orders);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const result = await db.insert(schema.orders).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const result = await db.update(schema.orders).set(req.body).where(eq(schema.orders.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

app.patch('/api/orders/:id', async (req, res) => {
  try {
    const result = await db.update(schema.orders).set(req.body).where(eq(schema.orders.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to patch order' });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    await db.delete(schema.orders).where(eq(schema.orders.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

app.get('/api/suppliers', async (req, res) => {
  try {
    const result = await db.select().from(schema.suppliers);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

app.post('/api/suppliers', async (req, res) => {
  try {
    const result = await db.insert(schema.suppliers).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

app.put('/api/suppliers/:id', async (req, res) => {
  try {
    const result = await db.update(schema.suppliers).set(req.body).where(eq(schema.suppliers.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

app.patch('/api/suppliers/:id', async (req, res) => {
  try {
    const result = await db.update(schema.suppliers).set(req.body).where(eq(schema.suppliers.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to patch supplier' });
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    await db.delete(schema.suppliers).where(eq(schema.suppliers.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

app.get('/api/employees', async (req, res) => {
  try {
    const result = await db.select().from(schema.employees);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const result = await db.insert(schema.employees).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const result = await db.update(schema.employees).set(req.body).where(eq(schema.employees.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

app.patch('/api/employees/:id', async (req, res) => {
  try {
    const result = await db.update(schema.employees).set(req.body).where(eq(schema.employees.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to patch employee' });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    await db.delete(schema.employees).where(eq(schema.employees.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

app.get('/api/accounts', async (req, res) => {
  try {
    const result = await db.select().from(schema.accounts);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

app.get('/api/system-users', async (req, res) => {
  try {
    const result = await db.select().from(schema.systemUsers);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch system users' });
  }
});

app.get('/api/extra-service-categories', async (req, res) => {
  try {
    const result = await db.select().from(schema.extraServiceCategories);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.get('/api/extra-services', async (req, res) => {
  try {
    const result = await db.select().from(schema.extraServices);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

app.get('/api/shifts', async (req, res) => {
  try {
    const result = await db.select().from(schema.shifts);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shifts' });
  }
});

app.get('/api/amenities', async (req, res) => {
  try {
    const result = await db.select().from(schema.amenities);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch amenities' });
  }
});

app.get('/api/maintenance-requests', async (req, res) => {
  try {
    const result = await db.select().from(schema.maintenanceRequests);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch maintenance requests' });
  }
});

app.post('/api/maintenance-requests', async (req, res) => {
  try {
    const result = await db.insert(schema.maintenanceRequests).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create maintenance request' });
  }
});

app.put('/api/maintenance-requests/:id', async (req, res) => {
  try {
    const result = await db.update(schema.maintenanceRequests).set(req.body).where(eq(schema.maintenanceRequests.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update maintenance request' });
  }
});

app.patch('/api/maintenance-requests/:id', async (req, res) => {
  try {
    const result = await db.update(schema.maintenanceRequests).set(req.body).where(eq(schema.maintenanceRequests.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to patch maintenance request' });
  }
});

app.delete('/api/maintenance-requests/:id', async (req, res) => {
  try {
    await db.delete(schema.maintenanceRequests).where(eq(schema.maintenanceRequests.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete maintenance request' });
  }
});

app.get('/api/system-settings', async (req, res) => {
  try {
    const result = await db.select().from(schema.systemSettings);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch system settings' });
  }
});

app.get('/api/system-settings/:key', async (req, res) => {
  try {
    const result = await db.select().from(schema.systemSettings).where(eq(schema.systemSettings.key, req.params.key));
    res.json(result[0] || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
});

app.post('/api/system-settings', async (req, res) => {
  try {
    const { key, value, category, description } = req.body;
    try {
      const result = await db.insert(schema.systemSettings).values({ key, value, category, description }).returning();
      res.json(result[0]);
    } catch (insertError: any) {
      const errorStr = JSON.stringify(insertError);
      if (insertError.cause?.code === '23505' || errorStr.includes('duplicate') || errorStr.includes('unique')) {
        const result = await db.update(schema.systemSettings)
          .set({ value, category, description })
          .where(eq(schema.systemSettings.key, key))
          .returning();
        res.json(result[0]);
      } else {
        throw insertError;
      }
    }
  } catch (error: any) {
    console.error('System settings error:', error);
    res.status(500).json({ error: 'Failed to save setting', details: error.message });
  }
});

app.delete('/api/system-settings/:key', async (req, res) => {
  try {
    await db.delete(schema.systemSettings).where(eq(schema.systemSettings.key, req.params.key));
    res.json({ success: true });
  } catch (error) {
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
    } catch (insertError: any) {
      const errorStr = JSON.stringify(insertError);
      if (insertError.cause?.code === '23505' || errorStr.includes('duplicate') || errorStr.includes('unique')) {
        const result = await db.update(schema.systemSettings)
          .set({ value, updatedAt: new Date() })
          .where(eq(schema.systemSettings.key, 'branding'))
          .returning();
        res.json(JSON.parse(result[0].value));
      } else {
        throw insertError;
      }
    }
  } catch (error: any) {
    console.error('Failed to save branding:', error);
    res.status(500).json({ error: 'Failed to save branding', details: error.message });
  }
});

app.get('/api/system-versions', async (req, res) => {
  try {
    const result = await db.select().from(schema.systemVersions);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
});

app.post('/api/system-versions', async (req, res) => {
  try {
    const result = await db.insert(schema.systemVersions).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create version' });
  }
});


app.get('/api/transactions', async (req, res) => {
  try {
    const result = await db.select().from(schema.transactions);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const result = await db.insert(schema.transactions).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});


app.get('/api/rate-calendar', async (req, res) => {
  try {
    const result = await db.select().from(schema.rateCalendar);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rate calendar' });
  }
});

app.post('/api/rate-calendar', async (req, res) => {
  try {
    const result = await db.insert(schema.rateCalendar).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create rate entry' });
  }
});

app.get('/api/channels', async (req, res) => {
  try {
    const result = await db.select().from(schema.channels);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

app.get('/api/audit-logs', async (req, res) => {
  try {
    const result = await db.select().from(schema.auditLogs);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

app.get('/api/recipes', async (req, res) => {
  try {
    const result = await db.select().from(schema.recipes);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recipes' });
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
    res.status(500).json({ error: 'Failed to sync rates' });
  }
});

// Get channel sync logs
app.get('/api/channel-sync-logs', async (req, res) => {
  try {
    const result = await db.select().from(schema.channelSyncLogs);
    res.json(result);
  } catch (error) {
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
    res.status(500).json({ error: 'Failed to create backup', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.get('/api/backup/list', async (req, res) => {
  try {
    const backups = await backupService.listBackups();
    res.json(backups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

app.post('/api/backup/restore', async (req, res) => {
  try {
    const { filePath, options } = req.body;
    await backupService.restoreFromBackup(filePath, options || {});
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to restore backup', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

app.delete('/api/backup/:id', async (req, res) => {
  try {
    await backupService.deleteBackup(parseInt(req.params.id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete backup' });
  }
});

// Data Sync APIs
app.post('/api/sync/queue', async (req, res) => {
  try {
    await dataSyncService.queueSync(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to queue sync' });
  }
});

app.get('/api/sync/status', async (req, res) => {
  try {
    const status = await dataSyncService.getSyncQueueStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get sync status' });
  }
});

app.post('/api/sync/process', async (req, res) => {
  try {
    await dataSyncService.processSyncQueue();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process sync queue' });
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
