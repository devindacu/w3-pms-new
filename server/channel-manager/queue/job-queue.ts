/**
 * Channel Manager Job Queue
 * 
 * Provides a unified queue interface with two implementations:
 * 1. InMemoryQueue  - Default, works without any external dependencies
 * 2. BullRedisQueue - Redis-backed, used when REDIS_URL is set (production)
 * 
 * Features:
 * - Priority-based processing (1=highest, 10=lowest)
 * - Automatic retry with exponential backoff
 * - Dead-letter queue for permanently failed jobs
 * - Job event emitter (completed, failed, stalled)
 * - Concurrency control
 */

import { EventEmitter } from 'events';
import { db } from '../../db';
import * as schema from '../../../shared/schema';
import { eq, and, lte, or } from 'drizzle-orm';

// ─── Job Types ────────────────────────────────────────────────────────────────

export type JobType =
  | 'push-rates'
  | 'push-availability'
  | 'fetch-bookings'
  | 'process-webhook'
  | 'health-check'
  | 'full-sync'
  | 'retry-failed';

export interface Job<T = Record<string, unknown>> {
  id: string;
  type: JobType;
  channelId?: number;
  channelName?: string;
  payload: T;
  priority: number;         // 1 (highest) to 10 (lowest)
  attempts: number;
  maxAttempts: number;
  nextRunAt: Date;
  createdAt: Date;
}

export interface JobResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export type JobProcessor<T = Record<string, unknown>> = (job: Job<T>) => Promise<JobResult>;

export interface QueueOptions {
  concurrency?: number;
  defaultMaxAttempts?: number;
  defaultPriority?: number;
}

// ─── Queue Interface ──────────────────────────────────────────────────────────

export interface IJobQueue extends EventEmitter {
  add<T = Record<string, unknown>>(
    type: JobType,
    payload: T,
    options?: {
      channelId?: number;
      channelName?: string;
      priority?: number;
      maxAttempts?: number;
      delay?: number;
    }
  ): Promise<string>;

  process<T = Record<string, unknown>>(type: JobType, processor: JobProcessor<T>): void;
  start(): void;
  stop(): Promise<void>;
  getStats(): Promise<QueueStats>;
  getJobs(filter?: { status?: string; channelId?: number; type?: JobType }): Promise<Job[]>;
  retryFailed(channelId?: number): Promise<number>;
  clearCompleted(olderThanMs?: number): Promise<number>;
}

export interface QueueStats {
  pending: number;
  running: number;
  completed: number;
  failed: number;
  deadLetter: number;
}

// ─── Backoff Calculator ───────────────────────────────────────────────────────

function calculateBackoffMs(attempt: number): number {
  // Exponential backoff: 5s, 15s, 45s, 135s, 405s, capped at 1h
  const base = 5_000;
  const backoff = base * Math.pow(3, attempt - 1);
  return Math.min(backoff, 3_600_000);
}

// ─── In-Memory Queue ──────────────────────────────────────────────────────────

interface InMemoryJobRecord<T = Record<string, unknown>> extends Job<T> {
  status: 'pending' | 'running' | 'completed' | 'failed' | 'dead';
  result?: JobResult;
  errorHistory: string[];
  dbId?: number;  // DB row ID for status updates
}

export class InMemoryQueue extends EventEmitter implements IJobQueue {
  private jobs = new Map<string, InMemoryJobRecord>();
  private processors = new Map<string, JobProcessor>();
  private running = new Set<string>();
  private concurrency: number;
  private defaultMaxAttempts: number;
  private defaultPriority: number;
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private stopped = false;

  constructor(options: QueueOptions = {}) {
    super();
    this.concurrency = options.concurrency ?? 5;
    this.defaultMaxAttempts = options.defaultMaxAttempts ?? 3;
    this.defaultPriority = options.defaultPriority ?? 5;
  }

  async add<T = Record<string, unknown>>(
    type: JobType,
    payload: T,
    options: {
      channelId?: number;
      channelName?: string;
      priority?: number;
      maxAttempts?: number;
      delay?: number;
    } = {}
  ): Promise<string> {
    const id = `job-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const job: InMemoryJobRecord<T> = {
      id,
      type,
      channelId: options.channelId,
      channelName: options.channelName,
      payload,
      priority: options.priority ?? this.defaultPriority,
      attempts: 0,
      maxAttempts: options.maxAttempts ?? this.defaultMaxAttempts,
      nextRunAt: new Date(Date.now() + (options.delay ?? 0)),
      createdAt: new Date(),
      status: 'pending',
      errorHistory: [],
    };
    this.jobs.set(id, job as InMemoryJobRecord);

    // Persist to DB for durability, store returned DB id for future updates
    const dbId = await this.persistJob(job as InMemoryJobRecord).catch(() => undefined);
    if (dbId) (this.jobs.get(id) as InMemoryJobRecord).dbId = dbId;

    this.emit('added', job);
    return id;
  }

  process<T = Record<string, unknown>>(type: JobType, processor: JobProcessor<T>): void {
    this.processors.set(type, processor as JobProcessor);
  }

  start(): void {
    this.stopped = false;
    this.tickInterval = setInterval(() => this.tick(), 1_000);
    console.log('[ChannelQueue] In-memory queue started');
  }

  async stop(): Promise<void> {
    this.stopped = true;
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    // Wait for running jobs to complete (max 30s)
    const deadline = Date.now() + 30_000;
    while (this.running.size > 0 && Date.now() < deadline) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    console.log('[ChannelQueue] Queue stopped');
  }

  private async tick(): Promise<void> {
    if (this.stopped || this.running.size >= this.concurrency) return;

    const now = new Date();
    const available = this.concurrency - this.running.size;

    // Get pending jobs sorted by priority then createdAt
    const pending = Array.from(this.jobs.values())
      .filter(j => j.status === 'pending' && j.nextRunAt <= now)
      .sort((a, b) => a.priority - b.priority || a.createdAt.getTime() - b.createdAt.getTime())
      .slice(0, available);

    for (const job of pending) {
      this.executeJob(job).catch(err => {
        console.error(`[ChannelQueue] Unhandled job error for ${job.id}:`, err);
      });
    }
  }

  private async executeJob(job: InMemoryJobRecord): Promise<void> {
    const processor = this.processors.get(job.type);
    if (!processor) {
      // No processor registered — leave pending and warn
      console.warn(`[ChannelQueue] No processor for job type: ${job.type}`);
      return;
    }

    this.running.add(job.id);
    job.status = 'running';
    job.attempts++;

    try {
      const result = await processor(job);
      job.status = 'completed';
      job.result = result;
      this.emit('completed', job, result);
      await this.updateJobStatus(job.id, 'completed', result).catch(() => {});
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      job.errorHistory.push(`[attempt ${job.attempts}] ${error}`);

      if (job.attempts >= job.maxAttempts) {
        job.status = 'dead';
        this.emit('dead', job, error);
        await this.updateJobStatus(job.id, 'dead', undefined, error).catch(() => {});
        console.error(`[ChannelQueue] Job ${job.id} (${job.type}) moved to dead letter after ${job.attempts} attempts`);
      } else {
        // Schedule retry with exponential backoff
        const backoff = calculateBackoffMs(job.attempts);
        job.status = 'pending';
        job.nextRunAt = new Date(Date.now() + backoff);
        this.emit('retry', job, error, backoff);
        await this.updateJobStatus(job.id, 'pending', undefined, error, job.nextRunAt).catch(() => {});
        console.warn(`[ChannelQueue] Job ${job.id} retry ${job.attempts}/${job.maxAttempts} in ${backoff}ms`);
      }
    } finally {
      this.running.delete(job.id);
    }
  }

  async getStats(): Promise<QueueStats> {
    const values = Array.from(this.jobs.values());
    return {
      pending: values.filter(j => j.status === 'pending').length,
      running: values.filter(j => j.status === 'running').length,
      completed: values.filter(j => j.status === 'completed').length,
      failed: values.filter(j => j.status === 'failed').length,
      deadLetter: values.filter(j => j.status === 'dead').length,
    };
  }

  async getJobs(filter: { status?: string; channelId?: number; type?: JobType } = {}): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(j => {
      if (filter.status && j.status !== filter.status) return false;
      if (filter.channelId && j.channelId !== filter.channelId) return false;
      if (filter.type && j.type !== filter.type) return false;
      return true;
    });
  }

  async retryFailed(channelId?: number): Promise<number> {
    let count = 0;
    for (const job of this.jobs.values()) {
      if (job.status === 'dead' || job.status === 'failed') {
        if (!channelId || job.channelId === channelId) {
          job.status = 'pending';
          job.attempts = 0;
          job.nextRunAt = new Date();
          count++;
        }
      }
    }
    return count;
  }

  async clearCompleted(olderThanMs = 24 * 3600 * 1000): Promise<number> {
    const cutoff = new Date(Date.now() - olderThanMs);
    let count = 0;
    for (const [id, job] of this.jobs.entries()) {
      if (job.status === 'completed' && job.createdAt < cutoff) {
        this.jobs.delete(id);
        count++;
      }
    }
    return count;
  }

  // Persist job to DB for crash recovery; returns the DB row id
  private async persistJob(job: InMemoryJobRecord): Promise<number | undefined> {
    try {
      const rows = await db.insert(schema.channelSyncJobs).values({
        jobType: job.type,
        channelId: job.channelId ?? null,
        channelName: job.channelName ?? null,
        payload: job.payload as Record<string, unknown>,
        priority: job.priority,
        status: job.status,
        attempts: job.attempts,
        maxAttempts: job.maxAttempts,
        nextRunAt: job.nextRunAt,
        createdAt: job.createdAt,
      }).returning({ id: schema.channelSyncJobs.id });
      return rows[0]?.id;
    } catch {
      return undefined; // Non-fatal
    }
  }

  private async updateJobStatus(
    id: string,
    status: string,
    result?: JobResult,
    error?: string,
    nextRunAt?: Date
  ): Promise<void> {
    const job = this.jobs.get(id) as InMemoryJobRecord | undefined;
    if (!job?.dbId) return;  // Only update if we have the exact DB row id

    try {
      await db.update(schema.channelSyncJobs)
        .set({
          status,
          attempts: job.attempts,
          ...(status === 'completed' ? { completedAt: new Date(), result: result as Record<string, unknown> } : {}),
          ...(status === 'dead' ? { failedAt: new Date() } : {}),
          ...(error ? { lastError: error } : {}),
          ...(nextRunAt ? { nextRunAt } : {}),
          updatedAt: new Date(),
        })
        .where(eq(schema.channelSyncJobs.id, job.dbId));
    } catch {
      // Non-fatal
    }
  }
}

// ─── Bull/Redis Queue ─────────────────────────────────────────────────────────

export class BullRedisQueue extends EventEmitter implements IJobQueue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private queues = new Map<string, any>();
  private redisUrl: string;
  private concurrency: number;
  private defaultMaxAttempts: number;
  private defaultPriority: number;

  constructor(redisUrl: string, options: QueueOptions = {}) {
    super();
    this.redisUrl = redisUrl;
    this.concurrency = options.concurrency ?? 5;
    this.defaultMaxAttempts = options.defaultMaxAttempts ?? 3;
    this.defaultPriority = options.defaultPriority ?? 5;
  }

  private async getQueue(type: JobType) {
    if (!this.queues.has(type)) {
      const Bull = (await import('bull')).default;
      const q = new Bull(`channel-manager:${type}`, this.redisUrl, {
        defaultJobOptions: {
          attempts: this.defaultMaxAttempts,
          backoff: { type: 'exponential', delay: 5_000 },
          removeOnComplete: { age: 86400 },
          removeOnFail: false,
        },
      });

      q.on('completed', (job: { id: string; data: unknown }, result: JobResult) =>
        this.emit('completed', { id: String(job.id), ...job.data }, result)
      );
      q.on('failed', (job: { id: string; data: unknown; attemptsMade: number }, err: Error) =>
        this.emit('retry', { id: String(job.id), ...job.data }, err.message, 0)
      );

      this.queues.set(type, q);
    }
    return this.queues.get(type)!;
  }

  async add<T = Record<string, unknown>>(
    type: JobType,
    payload: T,
    options: {
      channelId?: number;
      channelName?: string;
      priority?: number;
      maxAttempts?: number;
      delay?: number;
    } = {}
  ): Promise<string> {
    const queue = await this.getQueue(type);
    const job = await queue.add(
      { type, channelId: options.channelId, channelName: options.channelName, payload },
      {
        priority: options.priority ?? this.defaultPriority,
        delay: options.delay ?? 0,
        attempts: options.maxAttempts ?? this.defaultMaxAttempts,
      }
    );
    return String(job.id);
  }

  process<T = Record<string, unknown>>(type: JobType, processor: JobProcessor<T>): void {
    this.getQueue(type).then((queue: { process: (concurrency: number, fn: (bullJob: { id: string; data: { payload: T; channelId?: number; channelName?: string } }) => Promise<JobResult>) => void }) => {
      queue.process(this.concurrency, async (bullJob: { id: string; data: { payload: T; channelId?: number; channelName?: string } }) => {
        const job: Job<T> = {
          id: String(bullJob.id),
          type,
          channelId: bullJob.data.channelId,
          channelName: bullJob.data.channelName,
          payload: bullJob.data.payload,
          priority: this.defaultPriority,
          attempts: 0,
          maxAttempts: this.defaultMaxAttempts,
          nextRunAt: new Date(),
          createdAt: new Date(),
        };
        return processor(job);
      });
    });
  }

  start(): void {
    console.log(`[ChannelQueue] Bull/Redis queue started (${this.redisUrl})`);
  }

  async stop(): Promise<void> {
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    this.queues.clear();
  }

  async getStats(): Promise<QueueStats> {
    let stats: QueueStats = { pending: 0, running: 0, completed: 0, failed: 0, deadLetter: 0 };
    for (const queue of this.queues.values()) {
      const counts = await queue.getJobCounts();
      stats.pending += counts.waiting + counts.delayed;
      stats.running += counts.active;
      stats.completed += counts.completed;
      stats.failed += counts.failed;
    }
    return stats;
  }

  async getJobs(filter: { status?: string; channelId?: number; type?: JobType } = {}): Promise<Job[]> {
    const jobs: Job[] = [];
    for (const [type, queue] of this.queues.entries()) {
      if (filter.type && type !== filter.type) continue;
      const bullJobs = await queue.getJobs(['waiting', 'active', 'completed', 'failed', 'delayed']);
      for (const bj of bullJobs) {
        if (filter.channelId && bj.data.channelId !== filter.channelId) continue;
        jobs.push({
          id: String(bj.id),
          type: bj.data.type,
          channelId: bj.data.channelId,
          channelName: bj.data.channelName,
          payload: bj.data.payload,
          priority: bj.opts?.priority ?? 5,
          attempts: bj.attemptsMade ?? 0,
          maxAttempts: bj.opts?.attempts ?? 3,
          nextRunAt: new Date(bj.timestamp),
          createdAt: new Date(bj.timestamp),
        });
      }
    }
    return jobs;
  }

  async retryFailed(channelId?: number): Promise<number> {
    let count = 0;
    for (const queue of this.queues.values()) {
      const failed = await queue.getFailed();
      for (const job of failed) {
        if (!channelId || job.data.channelId === channelId) {
          await job.retry();
          count++;
        }
      }
    }
    return count;
  }

  async clearCompleted(olderThanMs = 24 * 3600 * 1000): Promise<number> {
    let count = 0;
    const cutoff = Date.now() - olderThanMs;
    for (const queue of this.queues.values()) {
      const completed = await queue.getCompleted();
      for (const job of completed) {
        if (job.timestamp < cutoff) {
          await job.remove();
          count++;
        }
      }
    }
    return count;
  }
}

// ─── Queue Factory ────────────────────────────────────────────────────────────

let _queueInstance: IJobQueue | null = null;

export function createQueue(options: QueueOptions = {}): IJobQueue {
  if (_queueInstance) return _queueInstance;

  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    console.log('[ChannelQueue] Using Bull/Redis queue');
    _queueInstance = new BullRedisQueue(redisUrl, options);
  } else {
    console.log('[ChannelQueue] Using in-memory queue (set REDIS_URL for production)');
    _queueInstance = new InMemoryQueue(options);
  }
  return _queueInstance;
}

export function getQueue(): IJobQueue {
  if (!_queueInstance) {
    _queueInstance = createQueue();
  }
  return _queueInstance;
}
