/**
 * Channel Manager Microservice
 * 
 * A standalone Express microservice for multi-OTA channel management.
 * 
 * Design:
 * - Runs on its own port (default 3002) or mounts into the main server
 * - Modular adapter pattern: Booking.com, Expedia, Agoda, Airbnb
 * - Queue-based job processing (in-memory or Redis/Bull)
 * - PostgreSQL persistence via Drizzle ORM
 * - All currencies default to LKR
 * 
 * Usage (standalone):
 *   node -e "import('./server/channel-manager/index.js').then(m => m.start())"
 * 
 * Usage (embedded in main server):
 *   import { createChannelManagerApp } from './channel-manager/index.js'
 *   app.use('/api/channel-manager', createChannelManagerApp())
 */

import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createQueue } from './queue/job-queue';
import { registerQueueProcessors } from './services/sync-service';
import { channelManagerAuth } from './middleware/auth';
import ratesRouter from './routes/rates';
import availabilityRouter from './routes/availability';
import bookingsRouter from './routes/bookings';
import adminRouter from './routes/admin';
import webhooksRouter from './routes/webhooks';

// ─── Rate Limiting ────────────────────────────────────────────────────────────

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute
  max: 100,
  message: { error: 'Webhook rate limit exceeded' },
});

// ─── App Factory ──────────────────────────────────────────────────────────────

export function createChannelManagerApp(): Express {
  const app = express();

  // ── Body parsers
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ── CORS
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:5000'],
    credentials: true,
  }));

  // ── Health / ping (no auth required)
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'channel-manager',
      version: '1.0.0',
      currency: 'LKR',
      timestamp: new Date().toISOString(),
      queue: process.env.REDIS_URL ? 'redis' : 'in-memory',
    });
  });

  // ── API endpoints (require API key in production)
  app.use('/rates', apiLimiter, channelManagerAuth, ratesRouter);
  app.use('/availability', apiLimiter, channelManagerAuth, availabilityRouter);
  app.use('/bookings', apiLimiter, channelManagerAuth, bookingsRouter);
  app.use('/admin', apiLimiter, channelManagerAuth, adminRouter);

  // ── Webhooks (no API key, but OTA signature verification)
  app.use('/webhooks', webhookLimiter, webhooksRouter);

  // ── Error handler
  app.use((err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
    console.error('[ChannelManager] Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  });

  return app;
}

// ─── Queue Initialization ─────────────────────────────────────────────────────

let initialized = false;

export function initChannelManager(): void {
  if (initialized) return;
  initialized = true;

  // Create and start the job queue
  const queue = createQueue({
    concurrency: parseInt(process.env.CM_QUEUE_CONCURRENCY ?? '5'),
    defaultMaxAttempts: 3,
  });

  // Register all job type processors
  registerQueueProcessors();

  // Start queue processing
  queue.start();

  // Queue event listeners for observability
  queue.on('completed', (job, result) => {
    console.info(`[Queue] Job ${job.id} (${job.type}) completed:`, result.success ? 'success' : 'failed');
  });

  queue.on('dead', (job, error) => {
    console.error(`[Queue] Job ${job.id} (${job.type}) permanently failed:`, error);
  });

  queue.on('retry', (job, error, backoffMs) => {
    console.warn(`[Queue] Job ${job.id} (${job.type}) retry in ${backoffMs}ms: ${error}`);
  });

  // Schedule periodic jobs
  schedulePeriodicJobs();

  console.log('[ChannelManager] Initialized ✓');
}

// ─── Periodic Job Scheduler ──────────────────────────────────────────────────

function schedulePeriodicJobs(): void {
  const queue = createQueue();

  // Fetch bookings every 15 minutes
  const BOOKING_FETCH_INTERVAL = parseInt(process.env.CM_BOOKING_FETCH_INTERVAL ?? '900000');
  setInterval(async () => {
    try {
      await queue.add('fetch-bookings', {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 86400_000).toISOString(),
      }, { priority: 5 });
    } catch (err) {
      console.error('[Scheduler] Booking fetch failed:', err);
    }
  }, BOOKING_FETCH_INTERVAL);

  // Health check every 5 minutes
  const HEALTH_CHECK_INTERVAL = parseInt(process.env.CM_HEALTH_CHECK_INTERVAL ?? '300000');
  setInterval(async () => {
    try {
      await queue.add('health-check', {}, { priority: 8 });
    } catch (err) {
      console.error('[Scheduler] Health check failed:', err);
    }
  }, HEALTH_CHECK_INTERVAL);

  // Clear completed jobs once per hour
  setInterval(async () => {
    try {
      await queue.clearCompleted(24 * 3600 * 1000);
    } catch {}
  }, 3600_000);

  console.log('[ChannelManager] Periodic jobs scheduled');
}

// ─── Standalone server startup ────────────────────────────────────────────────

export async function start(): Promise<void> {
  const PORT = parseInt(process.env.CM_PORT ?? process.env.PORT ?? '3002');

  // Initialize queue and processors
  initChannelManager();

  // Start HTTP server
  const app = createChannelManagerApp();
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║          W3 Hotel PMS - Channel Manager               ║
║          Microservice v1.0.0                          ║
╠═══════════════════════════════════════════════════════╣
║  Port:     ${String(PORT).padEnd(43)}║
║  Queue:    ${(process.env.REDIS_URL ? 'Redis/Bull' : 'In-Memory (set REDIS_URL for production)').padEnd(43)}║
║  Currency: LKR (default)                              ║
║  Channels: Booking.com, Expedia, Agoda, Airbnb        ║
╠═══════════════════════════════════════════════════════╣
║  API Endpoints:                                       ║
║    GET  /health                                       ║
║    POST /rates/push                                   ║
║    POST /availability/push                            ║
║    POST /bookings/fetch                               ║
║    GET  /admin/channels                               ║
║    POST /webhooks/{channel}                           ║
╚═══════════════════════════════════════════════════════╝
    `);
  });
}

// Auto-start when run directly via: tsx server/channel-manager/index.ts
// In ESM (Node.js --input-type=module or .mjs), import.meta.url is defined.
// This check is safe in both ESM and CommonJS contexts.
const isMain = typeof process.argv[1] !== 'undefined' &&
  import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));

if (isMain) {
  start().catch(err => {
    console.error('[ChannelManager] Fatal error:', err);
    process.exit(1);
  });
}
