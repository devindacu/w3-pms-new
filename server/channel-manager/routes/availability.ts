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

// POST /availability/bulk — Bulk availability update across channels + date range
//
// Sets the same availability value (or delta) across multiple channels,
// multiple room types, and a date range.
//
// Body:
//   channels: number[]       - Channel IDs (empty = all active)
//   roomTypes: string[]      - Room type codes to update
//   startDate: string        - ISO date (inclusive)
//   endDate: string          - ISO date (inclusive)
//   available: number        - Rooms to mark available
//   totalInventory?: number  - Total capacity (defaults to available if not set)
//   isBlocked?: boolean      - Block the dates instead of setting availability
//   minStay?: number
//   maxStay?: number
//   cta?: boolean            - Closed To Arrival
//   ctd?: boolean            - Closed To Departure
//   daysOfWeek?: number[]    - 0=Sun … 6=Sat. If set, only update those days.

router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const {
      channels: channelIds = [],
      roomTypes = [],
      startDate,
      endDate,
      available,
      totalInventory,
      isBlocked = false,
      minStay = 1,
      maxStay,
      cta = false,
      ctd = false,
      daysOfWeek,
    } = req.body as {
      channels?: number[];
      roomTypes?: string[];
      startDate: string;
      endDate: string;
      available: number;
      totalInventory?: number;
      isBlocked?: boolean;
      minStay?: number;
      maxStay?: number;
      cta?: boolean;
      ctd?: boolean;
      daysOfWeek?: number[];
    };

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    if (available == null || isNaN(available)) {
      return res.status(400).json({ error: 'available rooms count is required' });
    }

    // Resolve channels
    let targetChannels: { id: number; name: string }[];
    if (channelIds.length > 0) {
      const all = await db.select({ id: schema.channels.id, name: schema.channels.name })
        .from(schema.channels)
        .where(eq(schema.channels.isActive, true));
      targetChannels = all.filter(c => channelIds.includes(c.id));
    } else {
      targetChannels = await db.select({ id: schema.channels.id, name: schema.channels.name })
        .from(schema.channels)
        .where(eq(schema.channels.isActive, true));
    }

    if (!targetChannels.length) {
      return res.status(400).json({ error: 'No active channels found for the given IDs' });
    }

    const total = totalInventory ?? available;
    let totalUpserted = 0;
    const jobIds: Record<number, string> = {};

    for (const channel of targetChannels) {
      const invUpdates: InventoryUpdate[] = [];

      for (const roomTypeCode of (roomTypes.length > 0 ? roomTypes : ['default'])) {
        for (let d = new Date(startDate); d <= new Date(endDate); d.setDate(d.getDate() + 1)) {
          // Filter by day-of-week if specified
          if (daysOfWeek && daysOfWeek.length > 0 && !daysOfWeek.includes(d.getDay())) continue;

          const dateStr = d.toISOString().split('T')[0];
          const booked = Math.max(0, total - available);

          invUpdates.push({
            roomTypeCode,
            date: dateStr,
            available,
            totalInventory: total,
            isBlocked,
            minStay,
            maxStay,
            cta,
            ctd,
          });

          // Upsert in DB
          const existing = await db.select({ id: schema.channelInventory.id })
            .from(schema.channelInventory)
            .where(and(
              eq(schema.channelInventory.channelId, channel.id),
              eq(schema.channelInventory.otaRoomTypeCode, roomTypeCode),
              eq(schema.channelInventory.date, dateStr),
            ))
            .limit(1);

          const record = {
            channelId: channel.id,
            channelName: channel.name,
            internalRoomType: roomTypeCode,
            otaRoomTypeCode: roomTypeCode,
            date: dateStr,
            totalInventory: total,
            availableInventory: available,
            bookedInventory: booked,
            isBlocked,
            minStay,
            maxStay: maxStay ?? null,
            cta,
            ctd,
            syncStatus: 'pending',
            updatedAt: new Date(),
          };

          if (existing.length > 0) {
            await db.update(schema.channelInventory).set(record).where(eq(schema.channelInventory.id, existing[0].id));
          } else {
            await db.insert(schema.channelInventory).values({ ...record, createdAt: new Date() });
          }
          totalUpserted++;
        }
      }

      // Enqueue push job
      const jobId = await syncService.enqueuePushAvailability(invUpdates, { channelId: channel.id, priority: 3 });
      jobIds[channel.id] = jobId;
    }

    res.json({
      success: true,
      totalUpserted,
      channelsTargeted: targetChannels.length,
      jobIds,
      message: `Bulk availability update: ${totalUpserted} records, ${targetChannels.length} push jobs enqueued`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to bulk update availability', details: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
