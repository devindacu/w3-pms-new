/**
 * Bookings Routes
 * GET  /api/channel-manager/bookings         - List channel bookings
 * POST /api/channel-manager/bookings/fetch   - Trigger booking fetch from OTA(s)
 * GET  /api/channel-manager/bookings/:id     - Get specific booking
 * PUT  /api/channel-manager/bookings/:id/status - Update booking status
 */

import { Router, Request, Response } from 'express';
import { db } from '../../db';
import * as schema from '../../../shared/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { syncService } from '../services/sync-service';
import { getAdapterForChannel } from '../adapters/factory';
import type { OTABookingStatus } from '../adapters/base-adapter';

const router = Router();

// GET /bookings — List channel bookings with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      channelId,
      channelName,
      status,
      startDate,
      endDate,
      page = '1',
      limit = '50',
    } = req.query as Record<string, string>;

    const conditions = [];
    if (channelId) conditions.push(eq(schema.channelBookings.channelId, parseInt(channelId)));
    if (channelName) conditions.push(eq(schema.channelBookings.channelName, channelName));
    if (status) conditions.push(eq(schema.channelBookings.status, status));
    if (startDate) conditions.push(gte(schema.channelBookings.checkIn, startDate));
    if (endDate) conditions.push(lte(schema.channelBookings.checkOut, endDate));

    const rows = await db.select()
      .from(schema.channelBookings)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.channelBookings.createdAt))
      .limit(parseInt(limit))
      .offset((parseInt(page) - 1) * parseInt(limit));

    // Summary stats
    const allRows = await db.select({ status: schema.channelBookings.status })
      .from(schema.channelBookings)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const stats = {
      total: allRows.length,
      confirmed: allRows.filter(r => r.status === 'confirmed').length,
      cancelled: allRows.filter(r => r.status === 'cancelled').length,
      checked_in: allRows.filter(r => r.status === 'checked_in').length,
    };

    res.json({ success: true, data: rows, stats, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings', details: err instanceof Error ? err.message : String(err) });
  }
});

// POST /bookings/fetch — Trigger booking fetch from OTA
router.post('/fetch', async (req: Request, res: Response) => {
  try {
    const { channelId, startDate, endDate } = req.body as {
      channelId?: number;
      startDate?: string;
      endDate?: string;
    };

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 7 * 86400_000);

    if (channelId) {
      const jobId = await syncService.enqueueFetchBookings({ channelId, startDate: start, endDate: end });
      return res.json({ success: true, jobId, message: `Booking fetch enqueued for channel ${channelId}` });
    } else {
      const jobIds = await syncService.fetchBookingsFromAllChannels({ startDate: start, endDate: end });
      return res.json({ success: true, jobIds: Object.fromEntries(jobIds), message: `Booking fetch enqueued for ${jobIds.size} channels` });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to enqueue booking fetch', details: err instanceof Error ? err.message : String(err) });
  }
});

// GET /bookings/:id — Get specific booking
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid booking ID' });

    const rows = await db.select()
      .from(schema.channelBookings)
      .where(eq(schema.channelBookings.id, id))
      .limit(1);

    if (!rows.length) return res.status(404).json({ error: 'Booking not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch booking', details: err instanceof Error ? err.message : String(err) });
  }
});

// PUT /bookings/:id/status — Update booking status in OTA + local DB
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid booking ID' });

    const { status } = req.body as { status: OTABookingStatus };
    if (!status) return res.status(400).json({ error: 'status is required' });

    const rows = await db.select()
      .from(schema.channelBookings)
      .where(eq(schema.channelBookings.id, id))
      .limit(1);

    if (!rows.length) return res.status(404).json({ error: 'Booking not found' });
    const booking = rows[0];

    let otaUpdated = false;
    let otaError: string | undefined;

    if (booking.channelId) {
      try {
        const adapter = await getAdapterForChannel(booking.channelId);
        otaUpdated = await adapter.updateBookingStatus(booking.externalBookingId!, status);
      } catch (err) {
        otaError = err instanceof Error ? err.message : String(err);
        console.warn(`[Bookings] OTA status update failed: ${otaError}`);
      }
    }

    // Update local DB regardless of OTA result
    await db.update(schema.channelBookings)
      .set({ status, syncStatus: otaUpdated ? 'synced' : 'sync_failed', updatedAt: new Date() })
      .where(eq(schema.channelBookings.id, id));

    res.json({
      success: true,
      message: `Booking status updated to ${status}`,
      otaUpdated,
      otaError,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update booking status', details: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
