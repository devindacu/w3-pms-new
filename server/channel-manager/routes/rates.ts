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

// POST /rates/bulk — Bulk rate update across multiple channels, rooms, dates
//
// Accepts a grid of { roomTypeCode, ratePlanCode?, rate, currency? } and
// a date range + channel list, then:
//   1. Upserts all records in DB
//   2. Enqueues a push job per target channel
//
// Body:
//   channels: number[]              - Channel IDs to push to (empty = all active)
//   roomTypes: string[]             - Room type codes to update
//   startDate: string               - ISO date (inclusive)
//   endDate: string                 - ISO date (inclusive)
//   rate: number                    - New base rate (LKR)
//   ratePlanCode?: string           - OTA rate plan code (optional)
//   currency?: string               - Defaults to LKR
//   mealPlan?: string               - room_only | breakfast | half_board | full_board
//   extraAdultRate?: number
//   extraChildRate?: number
//   adjustmentType?: 'fixed' | 'percent_increase' | 'percent_decrease'
//   adjustmentValue?: number        - Used when adjustmentType != 'fixed'

router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const {
      channels: channelIds = [],
      roomTypes = [],
      startDate,
      endDate,
      rate,
      ratePlanCode,
      currency = 'LKR',
      mealPlan = 'room_only',
      extraAdultRate,
      extraChildRate,
      adjustmentType = 'fixed',
      adjustmentValue,
    } = req.body as {
      channels?: number[];
      roomTypes?: string[];
      startDate: string;
      endDate: string;
      rate?: number;
      ratePlanCode?: string;
      currency?: string;
      mealPlan?: string;
      extraAdultRate?: number;
      extraChildRate?: number;
      adjustmentType?: 'fixed' | 'percent_increase' | 'percent_decrease';
      adjustmentValue?: number;
    };

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    if (adjustmentType === 'fixed' && (rate == null || isNaN(rate))) {
      return res.status(400).json({ error: 'rate is required when adjustmentType is fixed' });
    }
    if (adjustmentType !== 'fixed' && (adjustmentValue == null || isNaN(adjustmentValue))) {
      return res.status(400).json({ error: 'adjustmentValue is required for percent adjustments' });
    }

    // Resolve target channels
    let targetChannels: { id: number; name: string }[];
    if (channelIds.length > 0) {
      const rows = await db.select({ id: schema.channels.id, name: schema.channels.name })
        .from(schema.channels)
        .where(and(eq(schema.channels.isActive, true)));
      targetChannels = rows.filter(c => channelIds.includes(c.id));
    } else {
      targetChannels = await db.select({ id: schema.channels.id, name: schema.channels.name })
        .from(schema.channels)
        .where(eq(schema.channels.isActive, true));
    }

    if (!targetChannels.length) {
      return res.status(400).json({ error: 'No active channels found for the given IDs' });
    }

    // Build date list
    const dates: string[] = [];
    for (let d = new Date(startDate); d <= new Date(endDate); d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }

    let totalUpserted = 0;
    const jobIds: Record<number, string> = {};

    for (const channel of targetChannels) {
      const rateUpdates: RateUpdate[] = [];

      for (const roomTypeCode of (roomTypes.length > 0 ? roomTypes : ['default'])) {
        for (const date of dates) {
          let finalRate: number;

          if (adjustmentType === 'fixed') {
            finalRate = rate!;
          } else {
            // Fetch existing rate for this channel/room/date
            const existing = await db.select({ baseRate: schema.channelRates.baseRate })
              .from(schema.channelRates)
              .where(and(
                eq(schema.channelRates.channelId, channel.id),
                eq(schema.channelRates.otaRoomTypeCode, roomTypeCode),
                eq(schema.channelRates.date, date),
              ))
              .limit(1);

            const base = existing[0] ? parseFloat(existing[0].baseRate) : 0;
            if (adjustmentType === 'percent_increase') {
              finalRate = base * (1 + adjustmentValue! / 100);
            } else {
              finalRate = base * (1 - adjustmentValue! / 100);
            }
          }

          finalRate = Math.max(0, Math.round(finalRate * 100) / 100);

          rateUpdates.push({
            roomTypeCode,
            ratePlanCode,
            date,
            rate: finalRate,
            currency,
            mealPlan,
            extraAdultRate,
            extraChildRate,
          });

          // Upsert in DB
          const existing = await db.select({ id: schema.channelRates.id })
            .from(schema.channelRates)
            .where(and(
              eq(schema.channelRates.channelId, channel.id),
              eq(schema.channelRates.otaRoomTypeCode, roomTypeCode),
              eq(schema.channelRates.date, date),
            ))
            .limit(1);

          const record = {
            channelId: channel.id,
            channelName: channel.name,
            internalRoomType: roomTypeCode,
            otaRoomTypeCode: roomTypeCode,
            otaRatePlanCode: ratePlanCode ?? null,
            date,
            baseRate: finalRate.toFixed(2),
            currency,
            rateType: 'BAR',
            extraAdultRate: extraAdultRate?.toFixed(2) ?? null,
            extraChildRate: extraChildRate?.toFixed(2) ?? null,
            mealPlan,
            syncStatus: 'pending',
            updatedAt: new Date(),
          };

          if (existing.length > 0) {
            await db.update(schema.channelRates).set(record).where(eq(schema.channelRates.id, existing[0].id));
          } else {
            await db.insert(schema.channelRates).values({ ...record, createdAt: new Date() });
          }
          totalUpserted++;
        }
      }

      // Enqueue push for this channel
      const jobId = await syncService.enqueuePushRates(rateUpdates, { channelId: channel.id, priority: 3 });
      jobIds[channel.id] = jobId;
    }

    res.json({
      success: true,
      totalUpserted,
      channelsTargeted: targetChannels.length,
      datesTargeted: dates.length,
      roomTypesTargeted: roomTypes.length || 1,
      jobIds,
      message: `Bulk rate update complete: ${totalUpserted} records, ${targetChannels.length} push jobs enqueued`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to perform bulk rate update', details: err instanceof Error ? err.message : String(err) });
  }
});

// GET /rates/summary — Aggregated rate summary across channels
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, roomType } = req.query as Record<string, string>;
    const now = new Date();
    const start = startDate ?? now.toISOString().split('T')[0];
    const end = endDate ?? new Date(now.getTime() + 14 * 86400_000).toISOString().split('T')[0];

    const conditions = [
      gte(schema.channelRates.date, start),
      lte(schema.channelRates.date, end),
    ];
    if (roomType) conditions.push(eq(schema.channelRates.otaRoomTypeCode, roomType));

    const rates = await db.select()
      .from(schema.channelRates)
      .where(and(...conditions))
      .orderBy(schema.channelRates.date, schema.channelRates.channelName);

    // Group by date + room type
    const byDate = new Map<string, { date: string; channels: Record<string, number> }>();
    for (const r of rates) {
      if (!byDate.has(r.date)) byDate.set(r.date, { date: r.date, channels: {} });
      byDate.get(r.date)!.channels[r.channelName] = parseFloat(r.baseRate);
    }

    res.json({
      success: true,
      period: { startDate: start, endDate: end },
      currency: 'LKR',
      data: Array.from(byDate.values()),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rate summary', details: err instanceof Error ? err.message : String(err) });
  }
});

export default router;

