/**
 * Rate Plans Routes
 *
 * Manages the mapping of PMS rate plans to OTA-specific rate plan codes,
 * along with per-channel pricing rules (markup / discount).
 *
 * GET    /api/channel-manager/rate-plans              - List all rate plan configs
 * POST   /api/channel-manager/rate-plans              - Create rate plan config
 * GET    /api/channel-manager/rate-plans/:id          - Get single rate plan config
 * PUT    /api/channel-manager/rate-plans/:id          - Update rate plan config
 * DELETE /api/channel-manager/rate-plans/:id          - Delete rate plan config
 * POST   /api/channel-manager/rate-plans/:id/apply    - Derive & persist rates from plan
 * GET    /api/channel-manager/rate-plans/channel/:channelId - List plans for one channel
 */

import { Router, Request, Response } from 'express';
import { db } from '../../db';
import * as schema from '../../../shared/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { syncService } from '../services/sync-service';
import type { RateUpdate } from '../adapters/base-adapter';

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDateRange(startDate?: string, endDate?: string): [string, string] {
  const now = new Date();
  const start = startDate ?? now.toISOString().split('T')[0];
  const end = endDate ?? new Date(now.getTime() + 30 * 86400_000).toISOString().split('T')[0];
  return [start, end];
}

function applyMarkup(baseRate: number, markupPct?: number | null, discountPct?: number | null): number {
  let rate = baseRate;
  if (markupPct && markupPct > 0) rate = rate * (1 + markupPct / 100);
  if (discountPct && discountPct > 0) rate = rate * (1 - discountPct / 100);
  return Math.round(rate * 100) / 100;
}

// ─── GET /rate-plans — List all rate plan configurations ────────────────────

router.get('/', async (req: Request, res: Response) => {
  try {
    const { channelId, channelName, isActive, page = '1', limit = '50' } = req.query as Record<string, string>;

    const conditions = [];
    if (channelId) conditions.push(eq(schema.channelRatePlans.channelId, parseInt(channelId)));
    if (channelName) conditions.push(eq(schema.channelRatePlans.channelName, channelName));
    if (isActive !== undefined) conditions.push(eq(schema.channelRatePlans.isActive, isActive === 'true'));

    const rows = await db.select()
      .from(schema.channelRatePlans)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.channelRatePlans.createdAt))
      .limit(parseInt(limit))
      .offset((parseInt(page) - 1) * parseInt(limit));

    res.json({ success: true, data: rows, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rate plans', details: err instanceof Error ? err.message : String(err) });
  }
});

// ─── POST /rate-plans — Create rate plan config ──────────────────────────────

router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      channelId,
      channelName,
      internalRatePlanId,
      internalRatePlanName,
      otaRatePlanCode,
      otaRatePlanName,
      ratePlanType,
      markupPercent,
      discountPercent,
      currency,
      mealPlan,
      minStay,
      maxStay,
      cancellationPolicy,
      isActive,
    } = req.body;

    if (!channelId || !internalRatePlanId || !otaRatePlanCode) {
      return res.status(400).json({
        error: 'channelId, internalRatePlanId, and otaRatePlanCode are required',
      });
    }

    // Verify channel exists
    const channel = await db.select().from(schema.channels).where(eq(schema.channels.id, channelId)).limit(1);
    if (!channel.length) return res.status(404).json({ error: `Channel ${channelId} not found` });

    const rows = await db.insert(schema.channelRatePlans).values({
      channelId,
      channelName: channelName ?? channel[0].name,
      internalRatePlanId: String(internalRatePlanId),
      internalRatePlanName: internalRatePlanName ?? null,
      otaRatePlanCode,
      otaRatePlanName: otaRatePlanName ?? null,
      ratePlanType: ratePlanType ?? 'standard',
      markupPercent: markupPercent != null ? String(parseFloat(markupPercent).toFixed(4)) : null,
      discountPercent: discountPercent != null ? String(parseFloat(discountPercent).toFixed(4)) : null,
      currency: currency ?? 'LKR',
      mealPlan: mealPlan ?? 'room_only',
      minStay: minStay ?? 1,
      maxStay: maxStay ?? null,
      cancellationPolicy: cancellationPolicy ?? null,
      isActive: isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create rate plan', details: err instanceof Error ? err.message : String(err) });
  }
});

// ─── GET /rate-plans/:id — Get single rate plan ──────────────────────────────

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid rate plan ID' });

    const rows = await db.select()
      .from(schema.channelRatePlans)
      .where(eq(schema.channelRatePlans.id, id))
      .limit(1);

    if (!rows.length) return res.status(404).json({ error: 'Rate plan not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rate plan', details: err instanceof Error ? err.message : String(err) });
  }
});

// ─── PUT /rate-plans/:id — Update rate plan config ──────────────────────────

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid rate plan ID' });

    // Build a strongly-typed partial update object
    type RatePlanUpdate = Partial<{
      internalRatePlanName: string | null;
      otaRatePlanCode: string;
      otaRatePlanName: string | null;
      ratePlanType: string | null;
      markupPercent: string | null;
      discountPercent: string | null;
      currency: string;
      mealPlan: string | null;
      minStay: number | null;
      maxStay: number | null;
      cancellationPolicy: string | null;
      isActive: boolean;
      updatedAt: Date;
    }>;

    const updates: RatePlanUpdate = { updatedAt: new Date() };
    const allowed = [
      'internalRatePlanName', 'otaRatePlanCode', 'otaRatePlanName', 'ratePlanType',
      'markupPercent', 'discountPercent', 'currency', 'mealPlan',
      'minStay', 'maxStay', 'cancellationPolicy', 'isActive',
    ] as const;

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        if (key === 'markupPercent' || key === 'discountPercent') {
          (updates as Record<string, unknown>)[key] = String(parseFloat(req.body[key]).toFixed(4));
        } else {
          (updates as Record<string, unknown>)[key] = req.body[key];
        }
      }
    }

    await db.update(schema.channelRatePlans)
      .set(updates)
      .where(eq(schema.channelRatePlans.id, id));

    res.json({ success: true, message: 'Rate plan updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update rate plan', details: err instanceof Error ? err.message : String(err) });
  }
});

// ─── DELETE /rate-plans/:id ──────────────────────────────────────────────────

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid rate plan ID' });

    await db.delete(schema.channelRatePlans).where(eq(schema.channelRatePlans.id, id));
    res.json({ success: true, message: `Rate plan ${id} deleted` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete rate plan', details: err instanceof Error ? err.message : String(err) });
  }
});

// ─── GET /rate-plans/channel/:channelId — Plans for one channel ──────────────

router.get('/channel/:channelId', async (req: Request, res: Response) => {
  try {
    const channelId = parseInt(req.params.channelId);
    if (isNaN(channelId)) return res.status(400).json({ error: 'Invalid channel ID' });

    const rows = await db.select()
      .from(schema.channelRatePlans)
      .where(eq(schema.channelRatePlans.channelId, channelId))
      .orderBy(schema.channelRatePlans.otaRatePlanCode);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rate plans', details: err instanceof Error ? err.message : String(err) });
  }
});

// ─── POST /rate-plans/:id/apply — Derive & push rates from plan config ───────
//
// Takes the stored base rates from channelRates table, applies the plan's
// markup/discount, and enqueues a push to the OTA.

router.post('/:id/apply', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid rate plan ID' });

    const planRows = await db.select()
      .from(schema.channelRatePlans)
      .where(eq(schema.channelRatePlans.id, id))
      .limit(1);

    if (!planRows.length) return res.status(404).json({ error: 'Rate plan not found' });
    const plan = planRows[0];

    if (!plan.isActive) {
      return res.status(400).json({ error: 'Rate plan is inactive' });
    }

    const { startDate, endDate } = req.body as { startDate?: string; endDate?: string };
    const [start, end] = parseDateRange(startDate, endDate);

    // Fetch base rates for this channel in the date range
    const baseRates = await db.select()
      .from(schema.channelRates)
      .where(and(
        eq(schema.channelRates.channelId, plan.channelId),
        gte(schema.channelRates.date, start),
        lte(schema.channelRates.date, end),
      ));

    if (!baseRates.length) {
      return res.status(400).json({
        error: `No base rates found for channel ${plan.channelId} between ${start} and ${end}`,
      });
    }

    // Apply markup/discount and build RateUpdate array for queue
    const rateUpdates: RateUpdate[] = baseRates.map(r => ({
      roomTypeCode: r.otaRoomTypeCode,
      ratePlanCode: plan.otaRatePlanCode,
      date: r.date,
      rate: applyMarkup(
        parseFloat(r.baseRate),
        plan.markupPercent ? parseFloat(plan.markupPercent) : null,
        plan.discountPercent ? parseFloat(plan.discountPercent) : null,
      ),
      currency: plan.currency ?? 'LKR',
      mealPlan: plan.mealPlan ?? undefined,
      minStay: plan.minStay ?? undefined,
      maxStay: plan.maxStay ?? undefined,
      extraAdultRate: r.extraAdultRate ? parseFloat(r.extraAdultRate) : undefined,
      extraChildRate: r.extraChildRate ? parseFloat(r.extraChildRate) : undefined,
    }));

    const jobId = await syncService.enqueuePushRates(rateUpdates, {
      channelId: plan.channelId,
      priority: 3,
    });

    res.json({
      success: true,
      jobId,
      message: `Rate plan "${plan.otaRatePlanCode}" applied: ${rateUpdates.length} rate updates enqueued`,
      rateUpdatesCount: rateUpdates.length,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to apply rate plan', details: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
