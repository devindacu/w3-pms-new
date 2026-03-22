/**
 * Webhook Routes
 * 
 * Receives real-time booking notifications from OTAs.
 * Each channel has its own endpoint for security isolation.
 * 
 * IMPORTANT: These routes must be mounted BEFORE express.json() middleware,
 * or rawBody must be captured using the captureRawBody middleware.
 * 
 * POST /api/channel-manager/webhooks/booking.com   - Booking.com webhook
 * POST /api/channel-manager/webhooks/expedia       - Expedia webhook
 * POST /api/channel-manager/webhooks/agoda         - Agoda webhook
 * POST /api/channel-manager/webhooks/airbnb        - Airbnb webhook
 */

import { Router, Request, Response, NextFunction } from 'express';
import express from 'express';
import { db } from '../../db';
import * as schema from '../../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getAdapterForChannel } from '../adapters/factory';
import { syncService } from '../services/sync-service';
import { captureRawBody } from '../middleware/auth';

const router = Router();

// Re-export from auth for per-route use (adds error handler on top of auth version)
function captureRawBodyMiddleware(req: Request & { rawBody?: string }, res: Response, next: NextFunction): void {
  captureRawBody(req, res, next);
}

// Parse JSON after capturing raw body
const parseJsonBody = express.json({ limit: '2mb' });

// ─── Webhook Signature Verification Middleware ────────────────────────────────

function createWebhookMiddleware(channelType: string) {
  return async (req: Request & { rawBody?: string }, res: Response, next: NextFunction) => {
    try {
      // Find matching active channel
      const channels = await db.select()
        .from(schema.channels)
        .where(eq(schema.channels.type, channelType));

      if (!channels.length) {
        return res.status(404).json({ error: `No ${channelType} channel configured` });
      }

      const channel = channels.find(c => c.isActive) ?? channels[0];
      let connectionDetails: Record<string, string> = {};
      try {
        connectionDetails = JSON.parse(channel.connectionDetails ?? '{}');
      } catch {}

      const webhookSecret = connectionDetails.webhookSecret;

      // If secret is configured, verify signature using the raw body
      if (webhookSecret) {
        const signature =
          (req.headers['x-signature'] as string) ||
          (req.headers['x-hub-signature-256'] as string) ||
          (req.headers['x-airbnb-webhook-signature'] as string) ||
          (req.headers['x-booking-signature'] as string) ||
          '';

        if (signature) {
          // req.rawBody was captured before JSON parsing — use it for HMAC
          const rawPayload = req.rawBody ?? '';
          if (!rawPayload) {
            await logWebhook(channel.name, 'unknown', undefined, '', req.headers as Record<string, string>, 'rejected', 'No raw body for signature verification');
            return res.status(400).json({ error: 'Cannot verify signature: raw body unavailable' });
          }

          const adapter = await getAdapterForChannel(channel.id);
          const valid = adapter.verifyWebhookSignature(rawPayload, signature);

          if (!valid) {
            await logWebhook(channel.name, 'unknown', undefined, rawPayload, req.headers as Record<string, string>, 'rejected', 'Invalid signature');
            return res.status(401).json({ error: 'Invalid webhook signature' });
          }
        }
      }

      (req as any).channelId = channel.id;
      (req as any).channelName = channel.name;
      next();
    } catch (err) {
      console.error(`[Webhook:${channelType}] Middleware error:`, err);
      next(err);
    }
  };
}

async function logWebhook(
  channelName: string,
  eventType: string,
  externalBookingId: string | undefined,
  rawPayload: string,
  headers: Record<string, unknown>,
  status: string,
  error?: string
): Promise<void> {
  try {
    await db.insert(schema.channelWebhookLogs).values({
      channelName,
      eventType,
      externalBookingId: externalBookingId ?? null,
      rawPayload,
      headers: headers as Record<string, unknown>,
      processingStatus: status,
      processingError: error ?? null,
      processedAt: status !== 'received' ? new Date() : null,
      createdAt: new Date(),
    });
  } catch {}
}

async function handleWebhook(req: Request & { rawBody?: string }, res: Response): Promise<void> {
  const channelId = (req as any).channelId as number;
  const channelName = (req as any).channelName as string;
  const body = req.body as Record<string, unknown>;

  const eventType =
    (req.headers['x-event-type'] as string) ||
    (body.event_type as string) ||
    (body.type as string) ||
    'reservation';

  // Prefer raw body for logging (before JSON parse mutates it)
  const rawPayload = req.rawBody ?? JSON.stringify(body);

  // Log receipt immediately
  await logWebhook(channelName, eventType, undefined, rawPayload, req.headers as Record<string, string>, 'received');

  try {
    // Enqueue processing job (non-blocking, high priority)
    const jobId = await syncService.enqueueWebhookProcessing(channelId, channelName, eventType, body);

    res.status(200).json({ received: true, jobId });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    await logWebhook(channelName, eventType, undefined, rawPayload, req.headers as Record<string, string>, 'failed', errMsg);
    res.status(500).json({ error: 'Webhook processing failed', details: errMsg });
  }
}

// ─── Channel-specific Webhook Endpoints ──────────────────────────────────────
// Each endpoint uses: captureRawBody → parseJsonBody → signature verification → handler
// This order ensures the raw body is available for HMAC verification before parsing.

router.post('/booking.com',
  captureRawBodyMiddleware,
  parseJsonBody,
  createWebhookMiddleware('booking.com'),
  handleWebhook
);

router.post('/expedia',
  captureRawBodyMiddleware,
  parseJsonBody,
  createWebhookMiddleware('expedia'),
  handleWebhook
);

router.post('/agoda',
  captureRawBodyMiddleware,
  parseJsonBody,
  createWebhookMiddleware('agoda'),
  handleWebhook
);

router.post('/airbnb',
  captureRawBodyMiddleware,
  parseJsonBody,
  createWebhookMiddleware('airbnb'),
  handleWebhook
);

// GET /webhooks/logs — Webhook event log
router.get('/logs', async (req: Request, res: Response) => {
  try {
    const { channelName, status, page = '1', limit = '50' } = req.query as Record<string, string>;

    const conditions = [];
    if (channelName) conditions.push(eq(schema.channelWebhookLogs.channelName, channelName));
    if (status) conditions.push(eq(schema.channelWebhookLogs.processingStatus, status));

    const rows = await db.select()
      .from(schema.channelWebhookLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(schema.channelWebhookLogs.createdAt))
      .limit(parseInt(limit))
      .offset((parseInt(page) - 1) * parseInt(limit));

    res.json({ success: true, data: rows, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch webhook logs', details: err instanceof Error ? err.message : String(err) });
  }
});

export default router;
