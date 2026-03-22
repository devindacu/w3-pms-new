/**
 * Rates Routes
 * POST /api/channel-manager/rates/push       - Push rates to one/all channels
 * GET  /api/channel-manager/rates            - List stored rates
 * PUT  /api/channel-manager/rates            - Upsert rates in DB
 * DELETE /api/channel-manager/rates/:id      - Remove a rate record
 */

import { Router, Request, Response } from 'express';
import { db } from '../../db';
import * as schema from '../../../shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { syncService } from '../services/sync-service';
import type { RateUpdate } from '../adapters/base-adapter';

const router = Router();

// POST /rates/push — Enqueue rate push to channel(s)
router.post('/push', async (req: Request, res: Response) => {
  try {
    const { channelId, rates, startDate, endDate } = req.body as {
      channelId?: number;
      rates?: RateUpdate[];
      startDate?: string;
      endDate?: string;
    };

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 30 * 86400_000);

    if (channelId) {
      // Push to specific channel
      const payload = rates ?? [];
      if (payload.length === 0) {
        // Build from DB if no rates supplied
        const jobId = await syncService.enqueuePushRates([], { channelId, priority: 3 });
        return res.json({ success: true, jobId, message: 'Rate push enqueued' });
      }
      const jobId = await syncService.enqueuePushRates(payload, { channelId });
      return res.json({ success: true, jobId, message: `Rate push enqueued for channel ${channelId}` });
    } else {
      // Push to all active channels
      const jobIds = await syncService.pushRatesToAllChannels({ startDate: start, endDate: end });
      const result = Object.fromEntries(jobIds);
      return res.json({ success: true, jobIds: result, message: `Rate push enqueued for ${jobIds.size} channels` });
    }
  } catch (err) {
    console.error('[Rates] Push error:', err);
    res.status(500).json({ error: 'Failed to enqueue rate push', details: err instanceof Error ? err.message : String(err) });
  }
});

// GET /rates — List stored rates with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { channelId, roomType, startDate, endDate, page = '1', limit = '50' } = req.query as Record<string, string>;

    const conditions = [];
    if (channelId) conditions.push(eq(schema.channelRates.channelId, parseInt(channelId)));
    if (roomType) conditions.push(eq(schema.channelRates.otaRoomTypeCode, roomType));
    if (startDate) conditions.push(gte(schema.channelRates.date, startDate));
    if (endDate) conditions.push(lte(schema.channelRates.date, endDate));

    const rows = await db.select()
      .from(schema.channelRates)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(parseInt(limit))
      .offset((parseInt(page) - 1) * parseInt(limit));

    res.json({ success: true, data: rows, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rates', details: err instanceof Error ? err.message : String(err) });
  }
});

// PUT /rates — Upsert rate records
router.put('/', async (req: Request, res: Response) => {
  try {
    const { channelId, channelName, rates } = req.body as {
      channelId: number;
      channelName: string;
      rates: RateUpdate[];
    };

    if (!channelId || !channelName || !Array.isArray(rates) || rates.length === 0) {
      return res.status(400).json({ error: 'channelId, channelName, and rates array are required' });
    }

    let upserted = 0;
    for (const rate of rates) {
      const existing = await db.select()
        .from(schema.channelRates)
        .where(and(
          eq(schema.channelRates.channelId, channelId),
          eq(schema.channelRates.otaRoomTypeCode, rate.roomTypeCode),
          eq(schema.channelRates.date, rate.date)
        ))
        .limit(1);

      const record = {
        channelId,
        channelName,
        internalRoomType: rate.roomTypeCode,
        otaRoomTypeCode: rate.roomTypeCode,
        otaRatePlanCode: rate.ratePlanCode ?? null,
        date: rate.date,
        baseRate: rate.rate.toFixed(2),
        currency: rate.currency ?? 'LKR',
        rateType: 'BAR',
        extraAdultRate: rate.extraAdultRate?.toFixed(2) ?? null,
        extraChildRate: rate.extraChildRate?.toFixed(2) ?? null,
        mealPlan: rate.mealPlan ?? 'room_only',
        syncStatus: 'pending',
        updatedAt: new Date(),
      };

      if (existing.length > 0) {
        await db.update(schema.channelRates).set(record).where(eq(schema.channelRates.id, existing[0].id));
      } else {
        await db.insert(schema.channelRates).values({ ...record, createdAt: new Date() });
      }
      upserted++;
    }

    res.json({ success: true, upserted, message: `${upserted} rate records saved` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save rates', details: err instanceof Error ? err.message : String(err) });
  }
});

// DELETE /rates/:id — Remove a rate record
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid rate ID' });

    await db.delete(schema.channelRates).where(eq(schema.channelRates.id, id));
    res.json({ success: true, message: `Rate ${id} deleted` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete rate', details: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
