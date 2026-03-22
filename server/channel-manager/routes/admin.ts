/**
 * Admin Dashboard Routes
 * GET  /api/channel-manager/admin/channels          - List all channels with health
 * POST /api/channel-manager/admin/channels          - Create channel
 * PUT  /api/channel-manager/admin/channels/:id      - Update channel config
 * DELETE /api/channel-manager/admin/channels/:id    - Delete channel
 * GET  /api/channel-manager/admin/mappings          - List room mappings
 * POST /api/channel-manager/admin/mappings          - Create mapping
 * PUT  /api/channel-manager/admin/mappings/:id      - Update mapping
 * DELETE /api/channel-manager/admin/mappings/:id    - Delete mapping
 * GET  /api/channel-manager/admin/queue             - Queue stats + jobs
 * POST /api/channel-manager/admin/queue/retry       - Retry failed jobs
 * POST /api/channel-manager/admin/queue/clear       - Clear completed jobs
 * GET  /api/channel-manager/admin/sync-logs         - Sync history
 * GET  /api/channel-manager/admin/health            - All channel health status
 * POST /api/channel-manager/admin/health-check      - Trigger health check
 * POST /api/channel-manager/admin/full-sync         - Trigger full sync
 */

import { Router, Request, Response } from 'express';
import { db } from '../../db';
import * as schema from '../../../shared/schema';
import { eq, and, desc, gte } from 'drizzle-orm';
import { getQueue } from '../queue/job-queue';
import { syncService } from '../services/sync-service';
import { getAdapterForChannel, getAllActiveAdapters, invalidateAdapterCache } from '../adapters/factory';

const router = Router();

// ─── Channels ────────────────────────────────────────────────────────────────

// GET /admin/channels — All channels with health status
router.get('/channels', async (_req: Request, res: Response) => {
  try {
    const channels = await db.select().from(schema.channels).orderBy(schema.channels.name);
    const healthRows = await db.select().from(schema.channelHealth);
    const healthMap = new Map(healthRows.map(h => [h.channelId, h]));

    const result = channels.map(c => ({
      ...c,
      connectionDetails: undefined, // Don't expose credentials
      health: healthMap.get(c.id) ?? null,
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch channels', details: err instanceof Error ? err.message : String(err) });
  }
});

// POST /admin/channels — Create new channel
router.post('/channels', async (req: Request, res: Response) => {
  try {
    const { name, type, commission, connectionDetails } = req.body as {
      name: string;
      type: string;
      commission?: number;
      connectionDetails?: Record<string, string>;
    };

    if (!name || !type) {
      return res.status(400).json({ error: 'name and type are required' });
    }

    const rows = await db.insert(schema.channels).values({
      name,
      type: type.toLowerCase(),
      commission: commission?.toFixed(2),
      connectionDetails: connectionDetails ? JSON.stringify(connectionDetails) : null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    res.status(201).json({ success: true, data: { ...rows[0], connectionDetails: undefined } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create channel', details: err instanceof Error ? err.message : String(err) });
  }
});

// PUT /admin/channels/:id — Update channel
router.put('/channels/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid channel ID' });

    const { name, type, commission, connectionDetails, isActive } = req.body;

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (type !== undefined) updates.type = type.toLowerCase();
    if (commission !== undefined) updates.commission = parseFloat(commission).toFixed(2);
    if (isActive !== undefined) updates.isActive = isActive;
    if (connectionDetails !== undefined) {
      updates.connectionDetails = typeof connectionDetails === 'string'
        ? connectionDetails
        : JSON.stringify(connectionDetails);
    }

    await db.update(schema.channels).set(updates as any).where(eq(schema.channels.id, id));

    // Invalidate adapter cache after config update
    invalidateAdapterCache(id);

    res.json({ success: true, message: 'Channel updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update channel', details: err instanceof Error ? err.message : String(err) });
  }
});

// DELETE /admin/channels/:id — Soft delete (deactivate)
router.delete('/channels/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid channel ID' });

    await db.update(schema.channels)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(schema.channels.id, id));

    invalidateAdapterCache(id);
    res.json({ success: true, message: 'Channel deactivated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete channel', details: err instanceof Error ? err.message : String(err) });
  }
});

// ─── Room Mappings ────────────────────────────────────────────────────────────

// GET /admin/mappings
router.get('/mappings', async (req: Request, res: Response) => {
  try {
    const { channelId, channelName } = req.query as Record<string, string>;
    const conditions = [];
    if (channelId) conditions.push(eq(schema.channelRoomMappings.channelId, parseInt(channelId)));
    if (channelName) conditions.push(eq(schema.channelRoomMappings.channelName, channelName));

    const rows = await db.select()
      .from(schema.channelRoomMappings)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(schema.channelRoomMappings.channelName, schema.channelRoomMappings.internalRoomType);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mappings', details: err instanceof Error ? err.message : String(err) });
  }
});

// POST /admin/mappings — Create mapping
router.post('/mappings', async (req: Request, res: Response) => {
  try {
    const {
      channelId, channelName, internalRoomType, internalRoomId,
      otaRoomTypeCode, otaRoomTypeName, otaRatePlanCode, otaRatePlanName,
    } = req.body;

    if (!channelId || !internalRoomType || !otaRoomTypeCode) {
      return res.status(400).json({ error: 'channelId, internalRoomType, otaRoomTypeCode are required' });
    }

    const rows = await db.insert(schema.channelRoomMappings).values({
      channelId,
      channelName: channelName ?? 'unknown',
      internalRoomType,
      internalRoomId: internalRoomId ?? null,
      otaRoomTypeCode,
      otaRoomTypeName: otaRoomTypeName ?? null,
      otaRatePlanCode: otaRatePlanCode ?? null,
      otaRatePlanName: otaRatePlanName ?? null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create mapping', details: err instanceof Error ? err.message : String(err) });
  }
});

// PUT /admin/mappings/:id
router.put('/mappings/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid mapping ID' });

    const updates = { ...req.body, updatedAt: new Date() };
    delete updates.id;
    await db.update(schema.channelRoomMappings).set(updates).where(eq(schema.channelRoomMappings.id, id));
    res.json({ success: true, message: 'Mapping updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update mapping', details: err instanceof Error ? err.message : String(err) });
  }
});

// DELETE /admin/mappings/:id
router.delete('/mappings/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid mapping ID' });
    await db.delete(schema.channelRoomMappings).where(eq(schema.channelRoomMappings.id, id));
    res.json({ success: true, message: 'Mapping deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete mapping', details: err instanceof Error ? err.message : String(err) });
  }
});

// ─── Queue Management ─────────────────────────────────────────────────────────

// GET /admin/queue — Queue stats + recent jobs
router.get('/queue', async (_req: Request, res: Response) => {
  try {
    const queue = getQueue();
    const stats = await queue.getStats();

    // Recent DB jobs for monitoring
    const recentJobs = await db.select()
      .from(schema.channelSyncJobs)
      .orderBy(desc(schema.channelSyncJobs.createdAt))
      .limit(50);

    res.json({ success: true, stats, recentJobs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch queue stats', details: err instanceof Error ? err.message : String(err) });
  }
});

// POST /admin/queue/retry — Retry failed jobs
router.post('/queue/retry', async (req: Request, res: Response) => {
  try {
    const { channelId } = req.body as { channelId?: number };
    const queue = getQueue();
    const retried = await queue.retryFailed(channelId);
    res.json({ success: true, retried, message: `${retried} jobs re-queued` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retry jobs', details: err instanceof Error ? err.message : String(err) });
  }
});

// POST /admin/queue/clear — Clear completed jobs
router.post('/queue/clear', async (req: Request, res: Response) => {
  try {
    const { olderThanHours = 24 } = req.body as { olderThanHours?: number };
    const queue = getQueue();
    const cleared = await queue.clearCompleted(olderThanHours * 3600_000);
    res.json({ success: true, cleared, message: `${cleared} completed jobs cleared` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear jobs', details: err instanceof Error ? err.message : String(err) });
  }
});

// ─── Sync Logs ─────────────────────────────────────────────────────────────

// GET /admin/sync-logs
router.get('/sync-logs', async (req: Request, res: Response) => {
  try {
    const { channelId, channelName, syncType, status, page = '1', limit = '50' } = req.query as Record<string, string>;
    const conditions = [];
    if (channelId) conditions.push(eq(schema.channelSyncLogs.channelId, parseInt(channelId)));
    if (channelName) conditions.push(eq(schema.channelSyncLogs.channelName, channelName));
    if (syncType) conditions.push(eq(schema.channelSyncLogs.syncType, syncType));
    if (status) conditions.push(eq(schema.channelSyncLogs.status, status));

    const rows = await db.select()
      .from(schema.channelSyncLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.channelSyncLogs.startedAt))
      .limit(parseInt(limit))
      .offset((parseInt(page) - 1) * parseInt(limit));

    res.json({ success: true, data: rows, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sync logs', details: err instanceof Error ? err.message : String(err) });
  }
});

// ─── Health Monitoring ────────────────────────────────────────────────────────

// GET /admin/health
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const channels = await db.select().from(schema.channels).where(eq(schema.channels.isActive, true));
    const healthRows = await db.select().from(schema.channelHealth);
    const healthMap = new Map(healthRows.map(h => [h.channelId, h]));

    const result = channels.map(c => ({
      channelId: c.id,
      channelName: c.name,
      type: c.type,
      health: healthMap.get(c.id) ?? { status: 'unknown' },
    }));

    const allHealthy = result.every(r => (r.health as any)?.status === 'healthy');
    res.json({ success: true, overall: allHealthy ? 'healthy' : 'degraded', channels: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch health', details: err instanceof Error ? err.message : String(err) });
  }
});

// POST /admin/health-check — Trigger health checks
router.post('/health-check', async (req: Request, res: Response) => {
  try {
    const { channelId } = req.body as { channelId?: number };

    if (channelId) {
      const jobId = await syncService.enqueueHealthCheck(channelId);
      return res.json({ success: true, jobId, message: `Health check enqueued for channel ${channelId}` });
    }

    const adapters = await getAllActiveAdapters();
    const jobIds: Record<number, string> = {};
    for (const cid of adapters.keys()) {
      jobIds[cid] = await syncService.enqueueHealthCheck(cid);
    }

    res.json({ success: true, jobIds, message: `Health checks enqueued for ${Object.keys(jobIds).length} channels` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to trigger health check', details: err instanceof Error ? err.message : String(err) });
  }
});

// POST /admin/full-sync — Trigger full sync
router.post('/full-sync', async (_req: Request, res: Response) => {
  try {
    const jobId = await syncService.enqueueFullSync();
    res.json({ success: true, jobId, message: 'Full sync enqueued' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to trigger full sync', details: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
