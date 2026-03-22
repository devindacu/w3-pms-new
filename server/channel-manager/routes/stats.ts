/**
 * Stats & Analytics Routes
 *
 * Aggregated channel performance data for the admin dashboard.
 *
 * GET /api/channel-manager/stats                       - Overall channel manager stats
 * GET /api/channel-manager/stats/channels              - Per-channel booking & revenue stats
 * GET /api/channel-manager/stats/channels/:channelId   - Single-channel detailed stats
 * GET /api/channel-manager/stats/rate-parity           - Rate comparison across channels
 * GET /api/channel-manager/stats/sync-summary          - Sync success/failure summary
 * GET /api/channel-manager/stats/bookings-timeline     - Bookings over time (daily/weekly)
 */

import { Router, Request, Response } from 'express';
import { db } from '../../db';
import * as schema from '../../../shared/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

const router = Router();

// ─── Helper ───────────────────────────────────────────────────────────────────

function dateWindow(daysBack = 30): [string, string] {
  const end = new Date();
  const start = new Date(end.getTime() - daysBack * 86400_000);
  return [start.toISOString().split('T')[0], end.toISOString().split('T')[0]];
}

// ─── GET /stats — Overall channel manager summary ────────────────────────────

router.get('/', async (req: Request, res: Response) => {
  try {
    const { days = '30' } = req.query as Record<string, string>;
    const [startDate, endDate] = dateWindow(parseInt(days));

    // Channel counts
    const channels = await db.select().from(schema.channels);
    const activeChannels = channels.filter(c => c.isActive).length;

    // Booking totals
    const bookings = await db.select({
      status: schema.channelBookings.status,
      totalAmount: schema.channelBookings.totalAmount,
      commission: schema.channelBookings.commission,
    })
      .from(schema.channelBookings)
      .where(and(
        gte(schema.channelBookings.checkIn, startDate),
        lte(schema.channelBookings.checkOut, endDate),
      ));

    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const totalRevenue = bookings.reduce((s, b) => s + parseFloat(b.totalAmount ?? '0'), 0);
    const totalCommission = bookings.reduce((s, b) => s + parseFloat(b.commission ?? '0'), 0);
    const netRevenue = totalRevenue - totalCommission;

    // Recent sync job stats
    const now = new Date();
    const windowStart = new Date(now.getTime() - parseInt(days) * 86400_000);
    const syncJobs = await db.select({ status: schema.channelSyncJobs.status })
      .from(schema.channelSyncJobs)
      .where(gte(schema.channelSyncJobs.createdAt, windowStart));

    const completedJobs = syncJobs.filter(j => j.status === 'completed').length;
    const failedJobs = syncJobs.filter(j => j.status === 'dead').length;
    const pendingJobs = syncJobs.filter(j => j.status === 'pending').length;

    // Health summary
    const health = await db.select().from(schema.channelHealth);
    const healthyChannels = health.filter(h => h.status === 'healthy').length;
    const unhealthyChannels = health.filter(h => h.status === 'unhealthy').length;

    res.json({
      success: true,
      period: { startDate, endDate, days: parseInt(days) },
      channels: {
        total: channels.length,
        active: activeChannels,
        healthy: healthyChannels,
        unhealthy: unhealthyChannels,
      },
      bookings: {
        total: totalBookings,
        confirmed: confirmedBookings,
        cancelled: cancelledBookings,
        cancellationRate: totalBookings > 0 ? ((cancelledBookings / totalBookings) * 100).toFixed(1) : '0',
      },
      revenue: {
        total: Math.round(totalRevenue * 100) / 100,
        commission: Math.round(totalCommission * 100) / 100,
        net: Math.round(netRevenue * 100) / 100,
        currency: 'LKR',
      },
      jobs: {
        total: syncJobs.length,
        completed: completedJobs,
        failed: failedJobs,
        pending: pendingJobs,
        successRate: syncJobs.length > 0 ? ((completedJobs / syncJobs.length) * 100).toFixed(1) : '0',
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats', details: err instanceof Error ? err.message : String(err) });
  }
});

// ─── GET /stats/channels — Per-channel booking & revenue stats ───────────────

router.get('/channels', async (req: Request, res: Response) => {
  try {
    const { days = '30' } = req.query as Record<string, string>;
    const [startDate, endDate] = dateWindow(parseInt(days));

    const channels = await db.select().from(schema.channels).where(eq(schema.channels.isActive, true));
    const health = await db.select().from(schema.channelHealth);
    const healthMap = new Map(health.map(h => [h.channelId, h]));

    const result = await Promise.all(channels.map(async (c) => {
      const bookings = await db.select({
        status: schema.channelBookings.status,
        totalAmount: schema.channelBookings.totalAmount,
        commission: schema.channelBookings.commission,
      })
        .from(schema.channelBookings)
        .where(and(
          eq(schema.channelBookings.channelId, c.id),
          gte(schema.channelBookings.checkIn, startDate),
          lte(schema.channelBookings.checkOut, endDate),
        ));

      const totalRevenue = bookings.reduce((s, b) => s + parseFloat(b.totalAmount ?? '0'), 0);
      const totalCommission = bookings.reduce((s, b) => s + parseFloat(b.commission ?? '0'), 0);

      // Last sync
      const lastSync = await db.select()
        .from(schema.channelSyncLogs)
        .where(eq(schema.channelSyncLogs.channelId, c.id))
        .orderBy(desc(schema.channelSyncLogs.startedAt))
        .limit(1);

      return {
        channelId: c.id,
        channelName: c.name,
        type: c.type,
        commission: c.commission,
        health: healthMap.get(c.id) ?? { status: 'unknown' },
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
        lastSync: lastSync[0] ?? null,
      };
    }));

    res.json({
      success: true,
      period: { startDate, endDate, days: parseInt(days) },
      data: result,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch channel stats', details: err instanceof Error ? err.message : String(err) });
  }
});

// ─── GET /stats/channels/:channelId — Detailed single-channel stats ──────────

router.get('/channels/:channelId', async (req: Request, res: Response) => {
  try {
    const channelId = parseInt(req.params.channelId);
    if (isNaN(channelId)) return res.status(400).json({ error: 'Invalid channel ID' });

    const { days = '30' } = req.query as Record<string, string>;
    const [startDate, endDate] = dateWindow(parseInt(days));

    const channel = await db.select().from(schema.channels).where(eq(schema.channels.id, channelId)).limit(1);
    if (!channel.length) return res.status(404).json({ error: 'Channel not found' });

    // Bookings
    const bookings = await db.select()
      .from(schema.channelBookings)
      .where(and(
        eq(schema.channelBookings.channelId, channelId),
        gte(schema.channelBookings.checkIn, startDate),
        lte(schema.channelBookings.checkOut, endDate),
      ))
      .orderBy(desc(schema.channelBookings.checkIn));

    const totalRevenue = bookings.reduce((s, b) => s + parseFloat(b.totalAmount ?? '0'), 0);
    const totalCommission = bookings.reduce((s, b) => s + parseFloat(b.commission ?? '0'), 0);
    const averageBookingValue = bookings.length > 0 ? totalRevenue / bookings.length : 0;

    // Sync logs
    const syncLogs = await db.select()
      .from(schema.channelSyncLogs)
      .where(eq(schema.channelSyncLogs.channelId, channelId))
      .orderBy(desc(schema.channelSyncLogs.startedAt))
      .limit(20);

    // Health
    const health = await db.select()
      .from(schema.channelHealth)
      .where(eq(schema.channelHealth.channelId, channelId))
      .limit(1);

    // Webhook logs
    const webhookLogs = await db.select()
      .from(schema.channelWebhookLogs)
      .where(eq(schema.channelWebhookLogs.channelName, channel[0].name))
      .orderBy(desc(schema.channelWebhookLogs.createdAt))
      .limit(10);

    // Inventory summary (available vs. booked ratio)
    const inventoryRows = await db.select()
      .from(schema.channelInventory)
      .where(and(
        eq(schema.channelInventory.channelId, channelId),
        gte(schema.channelInventory.date, startDate),
        lte(schema.channelInventory.date, endDate),
      ));

    const totalAvailable = inventoryRows.reduce((s, r) => s + (r.availableInventory ?? 0), 0);
    const totalCapacity = inventoryRows.reduce((s, r) => s + (r.totalInventory ?? 0), 0);
    const occupancyRate = totalCapacity > 0 ? ((totalCapacity - totalAvailable) / totalCapacity * 100).toFixed(1) : '0';

    res.json({
      success: true,
      channel: {
        ...channel[0],
        connectionDetails: undefined, // never expose credentials
      },
      period: { startDate, endDate, days: parseInt(days) },
      bookings: {
        total: bookings.length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
        checkedIn: bookings.filter(b => b.status === 'checked_in').length,
        recent: bookings.slice(0, 5),
      },
      revenue: {
        total: Math.round(totalRevenue * 100) / 100,
        commission: Math.round(totalCommission * 100) / 100,
        net: Math.round((totalRevenue - totalCommission) * 100) / 100,
        averageBookingValue: Math.round(averageBookingValue * 100) / 100,
        currency: 'LKR',
      },
      inventory: {
        occupancyRate: `${occupancyRate}%`,
        totalCapacity,
        totalAvailable,
        totalBooked: totalCapacity - totalAvailable,
      },
      health: health[0] ?? { status: 'unknown' },
      syncLogs,
      webhookLogs,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch channel stats', details: err instanceof Error ? err.message : String(err) });
  }
});

// ─── GET /stats/rate-parity — Compare rates across channels ─────────────────
//
// Shows whether rates are consistent (or divergent) across OTAs
// for the same room type on the same date.

router.get('/rate-parity', async (req: Request, res: Response) => {
  try {
    const {
      startDate,
      endDate,
      roomType,
      parityThresholdPercent = '5',
    } = req.query as Record<string, string>;

    const [start, end] = startDate && endDate
      ? [startDate, endDate]
      : dateWindow(14);

    const conditions = [
      gte(schema.channelRates.date, start),
      lte(schema.channelRates.date, end),
    ];
    if (roomType) conditions.push(eq(schema.channelRates.otaRoomTypeCode, roomType));

    const rates = await db.select()
      .from(schema.channelRates)
      .where(and(...conditions))
      .orderBy(schema.channelRates.date, schema.channelRates.otaRoomTypeCode);

    // Group by date + room type, then compare across channels
    const grouped = new Map<string, { date: string; roomType: string; channelRates: Array<{ channelId: number; channelName: string; rate: number; currency: string }> }>();

    for (const r of rates) {
      const key = `${r.date}::${r.otaRoomTypeCode}`;
      if (!grouped.has(key)) {
        grouped.set(key, { date: r.date, roomType: r.otaRoomTypeCode, channelRates: [] });
      }
      grouped.get(key)!.channelRates.push({
        channelId: r.channelId,
        channelName: r.channelName,
        rate: parseFloat(r.baseRate),
        currency: r.currency,
      });
    }

    const threshold = parseFloat(parityThresholdPercent) / 100;

    const parityReport = Array.from(grouped.values()).map(entry => {
      const rateValues = entry.channelRates.map(cr => cr.rate);
      const minRate = Math.min(...rateValues);
      const maxRate = Math.max(...rateValues);
      const avgRate = rateValues.reduce((s, r) => s + r, 0) / rateValues.length;
      const disparity = minRate > 0 ? (maxRate - minRate) / minRate : 0;
      const hasDisparity = disparity > threshold;

      return {
        date: entry.date,
        roomType: entry.roomType,
        channelRates: entry.channelRates,
        minRate: Math.round(minRate * 100) / 100,
        maxRate: Math.round(maxRate * 100) / 100,
        avgRate: Math.round(avgRate * 100) / 100,
        disparityPercent: (disparity * 100).toFixed(2),
        hasDisparity,
        currency: entry.channelRates[0]?.currency ?? 'LKR',
      };
    });

    const disparityCount = parityReport.filter(p => p.hasDisparity).length;

    res.json({
      success: true,
      period: { startDate: start, endDate: end },
      roomType: roomType ?? 'all',
      parityThresholdPercent: parseFloat(parityThresholdPercent),
      summary: {
        totalEntries: parityReport.length,
        disparities: disparityCount,
        parityRate: parityReport.length > 0
          ? (((parityReport.length - disparityCount) / parityReport.length) * 100).toFixed(1)
          : '100',
      },
      data: parityReport,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rate parity', details: err instanceof Error ? err.message : String(err) });
  }
});

// ─── GET /stats/sync-summary — Sync operation success/failure summary ────────

router.get('/sync-summary', async (req: Request, res: Response) => {
  try {
    const { days = '7' } = req.query as Record<string, string>;
    const windowStart = new Date(Date.now() - parseInt(days) * 86400_000);

    const logs = await db.select()
      .from(schema.channelSyncLogs)
      .where(gte(schema.channelSyncLogs.startedAt, windowStart))
      .orderBy(desc(schema.channelSyncLogs.startedAt));

    // Group by channel + sync type
    const summary = new Map<string, { channelName: string; syncType: string; success: number; failed: number; records: number; avgDuration: number; lastRun: Date | null }>();

    for (const log of logs) {
      const key = `${log.channelName}::${log.syncType}`;
      if (!summary.has(key)) {
        summary.set(key, { channelName: log.channelName, syncType: log.syncType, success: 0, failed: 0, records: 0, avgDuration: 0, lastRun: null });
      }
      const entry = summary.get(key)!;
      if (log.status === 'success') entry.success++;
      else if (log.status === 'error') entry.failed++;
      entry.records += log.recordsProcessed ?? 0;
      if (log.duration) entry.avgDuration = (entry.avgDuration + log.duration) / 2;
      if (!entry.lastRun || (log.startedAt && log.startedAt > entry.lastRun)) {
        entry.lastRun = log.startedAt;
      }
    }

    res.json({
      success: true,
      period: { days: parseInt(days) },
      data: Array.from(summary.values()).map(e => ({
        ...e,
        successRate: (e.success + e.failed) > 0
          ? ((e.success / (e.success + e.failed)) * 100).toFixed(1)
          : '0',
      })),
      recentLogs: logs.slice(0, 20),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sync summary', details: err instanceof Error ? err.message : String(err) });
  }
});

// ─── GET /stats/bookings-timeline — Bookings count over time ─────────────────

router.get('/bookings-timeline', async (req: Request, res: Response) => {
  try {
    const { days = '30', channelId } = req.query as Record<string, string>;
    const [startDate, endDate] = dateWindow(parseInt(days));

    const conditions = [
      gte(schema.channelBookings.checkIn, startDate),
      lte(schema.channelBookings.checkIn, endDate),
    ];
    if (channelId) conditions.push(eq(schema.channelBookings.channelId, parseInt(channelId)));

    const bookings = await db.select({
      checkIn: schema.channelBookings.checkIn,
      channelName: schema.channelBookings.channelName,
      totalAmount: schema.channelBookings.totalAmount,
      status: schema.channelBookings.status,
    })
      .from(schema.channelBookings)
      .where(and(...conditions))
      .orderBy(schema.channelBookings.checkIn);

    // Build daily timeline
    const dailyMap = new Map<string, { date: string; bookings: number; revenue: number; cancellations: number }>();

    // Pre-populate all days in range
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      dailyMap.set(key, { date: key, bookings: 0, revenue: 0, cancellations: 0 });
    }

    for (const b of bookings) {
      const day = typeof b.checkIn === 'string' ? b.checkIn : b.checkIn?.toISOString?.()?.split('T')[0] ?? '';
      if (dailyMap.has(day)) {
        const entry = dailyMap.get(day)!;
        if (b.status === 'cancelled') {
          entry.cancellations++;
        } else {
          entry.bookings++;
          entry.revenue += parseFloat(b.totalAmount ?? '0');
        }
      }
    }

    const timeline = Array.from(dailyMap.values()).map(e => ({
      ...e,
      revenue: Math.round(e.revenue * 100) / 100,
    }));

    res.json({
      success: true,
      period: { startDate, endDate, days: parseInt(days) },
      currency: 'LKR',
      timeline,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings timeline', details: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
