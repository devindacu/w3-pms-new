import express from 'express';
import cors from 'cors';
import { db } from './db';
import * as schema from '../shared/schema';
import { eq } from 'drizzle-orm';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/guests', async (req, res) => {
  try {
    const result = await db.select().from(schema.guests);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch guests' });
  }
});

app.post('/api/guests', async (req, res) => {
  try {
    const result = await db.insert(schema.guests).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create guest' });
  }
});

app.put('/api/guests/:id', async (req, res) => {
  try {
    const result = await db.update(schema.guests).set(req.body).where(eq(schema.guests.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update guest' });
  }
});

app.get('/api/rooms', async (req, res) => {
  try {
    const result = await db.select().from(schema.rooms);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

app.post('/api/rooms', async (req, res) => {
  try {
    const result = await db.insert(schema.rooms).values(req.body).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

app.put('/api/rooms/:id', async (req, res) => {
  try {
    const result = await db.update(schema.rooms).set(req.body).where(eq(schema.rooms.id, parseInt(req.params.id))).returning();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update room' });
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

app.get('/api/folios', async (req, res) => {
  try {
    const result = await db.select().from(schema.folios);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch folios' });
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

app.get('/api/housekeeping-tasks', async (req, res) => {
  try {
    const result = await db.select().from(schema.housekeepingTasks);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
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

app.get('/api/orders', async (req, res) => {
  try {
    const result = await db.select().from(schema.orders);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
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

app.get('/api/employees', async (req, res) => {
  try {
    const result = await db.select().from(schema.employees);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
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

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Server running on http://localhost:${PORT}`);
});
