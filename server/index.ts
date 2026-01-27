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

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Server running on http://localhost:${PORT}`);
});
