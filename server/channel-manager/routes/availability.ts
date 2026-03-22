/**
 * Availability Routes
 * POST /api/channel-manager/availability/push    - Push availability to channel(s)
 * GET  /api/channel-manager/availability         - List stored inventory
 * PUT  /api/channel-manager/availability         - Upsert inventory records
 * POST /api/channel-manager/availability/block   - Block dates for a room type
 */

import { Router, Request, Response } from 'express';
import { db } from '../../db';
import * as schema from '../../../shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { syncService } from '../services/sync-service';
import type { InventoryUpdate } from '../adapters/base-adapter';

const router = Router();

// POST /availability/push — Enqueue availability push
router.post('/push', async (req: Request, res: Response) => {
  try {
    const { channelId, inventory, startDate, endDate } = req.body as {
      channelId?: number;
      inventory?: InventoryUpdate[];
      startDate?: string;
      endDate?: string;
    };

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 30 * 86400_000);

    if (channelId) {
      const payload = inventory ?? [];
      const jobId = await syncService.enqueuePushAvailability(payload, { channelId });
      return res.json({ success: true, jobId, message: `Availability push enqueued for channel ${channelId}` });
    } else {
      const jobIds = await syncService.pushAvailabilityToAllChannels({ startDate: start, endDate: end });
      return res.json({ success: true, jobIds: Object.fromEntries(jobIds), message: `Availability push enqueued for ${jobIds.size} channels` });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to enqueue availability push', details: err instanceof Error ? err.message : String(err) });
  }
});

// GET /availability — List stored inventory
router.get('/', async (req: Request, res: Response) => {
  try {
    const { channelId, roomType, startDate, endDate, page = '1', limit = '100' } = req.query as Record<string, string>;

    const conditions = [];
    if (channelId) conditions.push(eq(schema.channelInventory.channelId, parseInt(channelId)));
    if (roomType) conditions.push(eq(schema.channelInventory.otaRoomTypeCode, roomType));
    if (startDate) conditions.push(gte(schema.channelInventory.date, startDate));
    if (endDate) conditions.push(lte(schema.channelInventory.date, endDate));

    const rows = await db.select()
      .from(schema.channelInventory)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(parseInt(limit))
      .offset((parseInt(page) - 1) * parseInt(limit));

    res.json({ success: true, data: rows, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inventory', details: err instanceof Error ? err.message : String(err) });
  }
});

// PUT /availability — Upsert inventory records
router.put('/', async (req: Request, res: Response) => {
  try {
    const { channelId, channelName, inventory } = req.body as {
      channelId: number;
      channelName: string;
      inventory: InventoryUpdate[];
    };

    if (!channelId || !channelName || !Array.isArray(inventory) || inventory.length === 0) {
      return res.status(400).json({ error: 'channelId, channelName, and inventory array are required' });
    }

    let upserted = 0;
    for (const inv of inventory) {
      const existing = await db.select()
        .from(schema.channelInventory)
        .where(and(
          eq(schema.channelInventory.channelId, channelId),
          eq(schema.channelInventory.otaRoomTypeCode, inv.roomTypeCode),
          eq(schema.channelInventory.date, inv.date)
        ))
        .limit(1);

      const record = {
        channelId,
        channelName,
        internalRoomType: inv.roomTypeCode,
        otaRoomTypeCode: inv.roomTypeCode,
        date: inv.date,
        totalInventory: inv.totalInventory ?? inv.available,
        availableInventory: inv.available,
        bookedInventory: (inv.totalInventory ?? inv.available) - inv.available,
        isBlocked: inv.isBlocked ?? false,
        minStay: inv.minStay ?? 1,
        maxStay: inv.maxStay ?? null,
        cta: inv.cta ?? false,
        ctd: inv.ctd ?? false,
        syncStatus: 'pending',
        updatedAt: new Date(),
      };

      if (existing.length > 0) {
        await db.update(schema.channelInventory).set(record).where(eq(schema.channelInventory.id, existing[0].id));
      } else {
        await db.insert(schema.channelInventory).values({ ...record, createdAt: new Date() });
      }
      upserted++;
    }

    res.json({ success: true, upserted, message: `${upserted} inventory records saved` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save inventory', details: err instanceof Error ? err.message : String(err) });
  }
});

// POST /availability/block — Block specific dates
router.post('/block', async (req: Request, res: Response) => {
  try {
    const { channelId, channelName, roomTypeCodes, startDate, endDate, reason } = req.body as {
      channelId: number;
      channelName: string;
      roomTypeCodes: string[];
      startDate: string;
      endDate: string;
      reason?: string;
    };

    if (!channelId || !roomTypeCodes?.length || !startDate || !endDate) {
      return res.status(400).json({ error: 'channelId, roomTypeCodes, startDate, endDate are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    let blocked = 0;

    for (const roomTypeCode of roomTypeCodes) {
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const existing = await db.select()
          .from(schema.channelInventory)
          .where(and(
            eq(schema.channelInventory.channelId, channelId),
            eq(schema.channelInventory.otaRoomTypeCode, roomTypeCode),
            eq(schema.channelInventory.date, dateStr)
          ))
          .limit(1);

        const record = {
          channelId,
          channelName: channelName ?? 'unknown',
          internalRoomType: roomTypeCode,
          otaRoomTypeCode: roomTypeCode,
          date: dateStr,
          totalInventory: 0,
          availableInventory: 0,
          bookedInventory: 0,
          isBlocked: true,
          syncStatus: 'pending',
          updatedAt: new Date(),
        };

        if (existing.length > 0) {
          await db.update(schema.channelInventory).set(record).where(eq(schema.channelInventory.id, existing[0].id));
        } else {
          await db.insert(schema.channelInventory).values({ ...record, createdAt: new Date(), minStay: 1 });
        }
        blocked++;
      }
    }

    // Auto-enqueue push to all matching channels
    if (channelId) {
      await syncService.enqueuePushAvailability([], { channelId, priority: 2 });
    }

    res.json({ success: true, blocked, message: `${blocked} date/room slots blocked` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to block dates', details: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
