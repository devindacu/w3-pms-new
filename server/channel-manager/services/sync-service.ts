/**
 * Sync Orchestration Service
 * 
 * Coordinates rate push, availability push, and booking fetch
 * across all active channels. Integrates with the job queue
 * for reliable, retryable operations.
 */

import { db } from '../../db';
import * as schema from '../../../shared/schema';
import { eq, and, gte, lte, or } from 'drizzle-orm';
import { getQueue, JobType } from '../queue/job-queue';
import { getAdapterForChannel, getAllActiveAdapters } from '../adapters/factory';
import type { InventoryUpdate, RateUpdate, SyncResult } from '../adapters/base-adapter';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface PushRatesOptions extends DateRange {
  channelId?: number;
  roomTypeCodes?: string[];
  currency?: string;
}

export interface PushAvailabilityOptions extends DateRange {
  channelId?: number;
  roomTypeCodes?: string[];
}

export interface FetchBookingsOptions extends DateRange {
  channelId?: number;
}

// ─── Job Processors ──────────────────────────────────────────────────────────

/**
 * Register all job processors with the queue.
 * Call this once at service startup.
 */
export function registerQueueProcessors(): void {
  const queue = getQueue();

  queue.process<{ channelId: number; rates: RateUpdate[] }>('push-rates', async (job) => {
    const adapter = await getAdapterForChannel(job.payload.channelId);
    const result = await adapter.pushRates(job.payload.rates);
    return { success: result.success, data: result };
  });

  queue.process<{ channelId: number; inventory: InventoryUpdate[] }>('push-availability', async (job) => {
    const adapter = await getAdapterForChannel(job.payload.channelId);
    const result = await adapter.pushAvailability(job.payload.inventory);
    return { success: result.success, data: result };
  });

  queue.process<{ channelId: number; startDate: string; endDate: string }>('fetch-bookings', async (job) => {
    const adapter = await getAdapterForChannel(job.payload.channelId);
    const bookings = await adapter.fetchBookings(
      new Date(job.payload.startDate),
      new Date(job.payload.endDate)
    );
    const result = await adapter.persistBookings(bookings);
    return { success: result.success, data: { bookingsCount: bookings.length, ...result } };
  });

  queue.process<{ channelId: number }>('health-check', async (job) => {
    const adapter = await getAdapterForChannel(job.payload.channelId);
    const result = await adapter.healthCheck();
    return { success: result.healthy, data: result };
  });

  queue.process<{
    channelId: number;
    channelName: string;
    eventType: string;
    payload: Record<string, unknown>;
  }>('process-webhook', async (job) => {
    const { channelId, channelName, eventType, payload } = job.payload;
    const adapter = await getAdapterForChannel(channelId);
    const booking = (adapter as any).parseWebhookPayload?.(payload);

    if (booking) {
      const bookings = [booking];
      const result = await adapter.persistBookings(bookings as any);
      return { success: result.success, data: { eventType, bookingId: booking.externalBookingId } };
    }

    return { success: true, data: { eventType, message: 'No booking data in webhook' } };
  });

  queue.process<Record<string, unknown>>('full-sync', async (job) => {
    const adapters = await getAllActiveAdapters();
    const results: SyncResult[] = [];
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    for (const [channelId, adapter] of adapters) {
      try {
        const bookings = await adapter.fetchBookings(startDate, endDate);
        const syncResult = await adapter.persistBookings(bookings);
        results.push(syncResult);
      } catch (err) {
        console.error(`[FullSync] Channel ${channelId} failed:`, err);
      }
    }

    const totalSuccess = results.filter(r => r.success).length;
    return {
      success: totalSuccess === results.length,
      data: { channels: results.length, successful: totalSuccess, results },
    };
  });

  console.log('[SyncService] Queue processors registered');
}

// ─── Sync Service ─────────────────────────────────────────────────────────────

export class SyncService {
  /**
   * Push rates to a specific channel (or all active channels).
   * Enqueues a job for reliable processing.
   */
  async enqueuePushRates(rates: RateUpdate[], options: { channelId: number; priority?: number }): Promise<string> {
    const queue = getQueue();
    return queue.add('push-rates', { channelId: options.channelId, rates }, {
      channelId: options.channelId,
      priority: options.priority ?? 3,
      maxAttempts: 3,
    });
  }

  /**
   * Push availability to a specific channel.
   * Enqueues a job for reliable processing.
   */
  async enqueuePushAvailability(
    inventory: InventoryUpdate[],
    options: { channelId: number; priority?: number }
  ): Promise<string> {
    const queue = getQueue();
    return queue.add('push-availability', { channelId: options.channelId, inventory }, {
      channelId: options.channelId,
      priority: options.priority ?? 3,
      maxAttempts: 3,
    });
  }

  /**
   * Fetch bookings from a specific channel.
   * Enqueues a job for reliable processing.
   */
  async enqueueFetchBookings(options: {
    channelId: number;
    startDate: Date;
    endDate: Date;
    priority?: number;
  }): Promise<string> {
    const queue = getQueue();
    return queue.add('fetch-bookings', {
      channelId: options.channelId,
      startDate: options.startDate.toISOString(),
      endDate: options.endDate.toISOString(),
    }, {
      channelId: options.channelId,
      priority: options.priority ?? 5,
      maxAttempts: 3,
    });
  }

  /**
   * Schedule a health check for a channel.
   */
  async enqueueHealthCheck(channelId: number): Promise<string> {
    const queue = getQueue();
    return queue.add('health-check', { channelId }, {
      channelId,
      priority: 8,
      maxAttempts: 2,
    });
  }

  /**
   * Enqueue processing of an incoming webhook payload.
   * High priority to ensure fast response to OTA events.
   */
  async enqueueWebhookProcessing(
    channelId: number,
    channelName: string,
    eventType: string,
    payload: Record<string, unknown>
  ): Promise<string> {
    const queue = getQueue();
    return queue.add('process-webhook', { channelId, channelName, eventType, payload }, {
      channelId,
      priority: 1,  // Highest priority
      maxAttempts: 5,
    });
  }

  /**
   * Trigger a full sync across all active channels.
   */
  async enqueueFullSync(): Promise<string> {
    const queue = getQueue();
    return queue.add('full-sync', {}, { priority: 7, maxAttempts: 2 });
  }

  /**
   * Push rates to ALL active channels.
   * Builds rate updates from the channelRates table.
   */
  async pushRatesToAllChannels(options: PushRatesOptions): Promise<Map<number, string>> {
    const adapters = await getAllActiveAdapters();
    const jobIds = new Map<number, string>();

    for (const channelId of adapters.keys()) {
      // Fetch stored rates for this channel
      const rates = await this.buildRateUpdates(channelId, options);
      if (rates.length === 0) continue;

      const jobId = await this.enqueuePushRates(rates, { channelId, priority: 3 });
      jobIds.set(channelId, jobId);
    }

    return jobIds;
  }

  /**
   * Push availability to ALL active channels.
   */
  async pushAvailabilityToAllChannels(options: PushAvailabilityOptions): Promise<Map<number, string>> {
    const adapters = await getAllActiveAdapters();
    const jobIds = new Map<number, string>();

    for (const channelId of adapters.keys()) {
      const inventory = await this.buildInventoryUpdates(channelId, options);
      if (inventory.length === 0) continue;

      const jobId = await this.enqueuePushAvailability(inventory, { channelId, priority: 3 });
      jobIds.set(channelId, jobId);
    }

    return jobIds;
  }

  /**
   * Fetch bookings from ALL active channels.
   */
  async fetchBookingsFromAllChannels(options: FetchBookingsOptions): Promise<Map<number, string>> {
    const adapters = await getAllActiveAdapters();
    const jobIds = new Map<number, string>();

    for (const channelId of adapters.keys()) {
      const jobId = await this.enqueueFetchBookings({ ...options, channelId, priority: 5 });
      jobIds.set(channelId, jobId);
    }

    return jobIds;
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async buildRateUpdates(channelId: number, options: PushRatesOptions): Promise<RateUpdate[]> {
    const startStr = options.startDate.toISOString().split('T')[0];
    const endStr = options.endDate.toISOString().split('T')[0];

    const rows = await db.select()
      .from(schema.channelRates)
      .where(
        and(
          eq(schema.channelRates.channelId, channelId),
          gte(schema.channelRates.date, startStr),
          lte(schema.channelRates.date, endStr),
          ...(options.roomTypeCodes?.length
            ? [or(...options.roomTypeCodes.map(rt => eq(schema.channelRates.otaRoomTypeCode, rt)))]
            : [])
        )
      );

    return rows.map(r => ({
      roomTypeCode: r.otaRoomTypeCode,
      ratePlanCode: r.otaRatePlanCode ?? undefined,
      date: r.date,
      rate: parseFloat(r.baseRate),
      currency: r.currency ?? options.currency ?? 'LKR',
      extraAdultRate: r.extraAdultRate ? parseFloat(r.extraAdultRate) : undefined,
      extraChildRate: r.extraChildRate ? parseFloat(r.extraChildRate) : undefined,
      mealPlan: r.mealPlan ?? undefined,
    }));
  }

  private async buildInventoryUpdates(channelId: number, options: PushAvailabilityOptions): Promise<InventoryUpdate[]> {
    const startStr = options.startDate.toISOString().split('T')[0];
    const endStr = options.endDate.toISOString().split('T')[0];

    const rows = await db.select()
      .from(schema.channelInventory)
      .where(
        and(
          eq(schema.channelInventory.channelId, channelId),
          gte(schema.channelInventory.date, startStr),
          lte(schema.channelInventory.date, endStr),
          ...(options.roomTypeCodes?.length
            ? [or(...options.roomTypeCodes.map(rt => eq(schema.channelInventory.otaRoomTypeCode, rt)))]
            : [])
        )
      );

    return rows.map(r => ({
      roomTypeCode: r.otaRoomTypeCode,
      date: r.date,
      available: r.availableInventory,
      totalInventory: r.totalInventory,
      isBlocked: r.isBlocked ?? false,
      minStay: r.minStay ?? 1,
      maxStay: r.maxStay ?? undefined,
      cta: r.cta ?? false,
      ctd: r.ctd ?? false,
    }));
  }
}

export const syncService = new SyncService();
