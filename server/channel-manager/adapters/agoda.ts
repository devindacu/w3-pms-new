/**
 * Agoda OTA Adapter
 * 
 * Integrates with Agoda YCS (Yield Control System) API:
 * - Inventory sync
 * - Rate push with currency support (LKR default)
 * - Reservation retrieval
 * - HMAC webhook signature verification
 */

import {
  BaseOTAAdapter,
  OTAConfig,
  InventoryUpdate,
  RateUpdate,
  OTABooking,
  OTABookingStatus,
  SyncResult,
  HealthCheckResult,
  withRetry,
  fetchWithTimeout,
  DEFAULT_CURRENCY,
} from './base-adapter';

const BASE_URL = 'https://ycs.agoda.com/en-us/api';

interface AgodaReservation {
  booking_id: string;
  status: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  room_type_id: string;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  total_amount: number;
  currency: string;
  commission_amount: number;
  special_requests?: string;
  booking_date: string;
}

function mapAgodaStatus(status: string): OTABookingStatus {
  const map: Record<string, OTABookingStatus> = {
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    PENDING: 'pending',
    CHECKED_IN: 'checked_in',
    CHECKED_OUT: 'checked_out',
    NO_SHOW: 'no_show',
  };
  return map[status?.toUpperCase()] ?? 'confirmed';
}

export class AgodaAdapter extends BaseOTAAdapter {
  private get headers(): Record<string, string> {
    return {
      'X-API-Key': this.config.apiKey,
      'X-Hotel-Id': this.config.hotelId ?? this.config.propertyId,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const url = `${BASE_URL}/v3/hotels/${this.config.hotelId ?? this.config.propertyId}/property-info`;
      const res = await fetchWithTimeout(url, { method: 'GET', headers: this.headers }, 10_000);
      const responseTimeMs = Date.now() - start;
      const healthy = res.ok;
      const result = { healthy, responseTimeMs, message: healthy ? undefined : `HTTP ${res.status}` };
      await this.updateHealth(result);
      return result;
    } catch (err) {
      const responseTimeMs = Date.now() - start;
      const result = { healthy: false, responseTimeMs, message: err instanceof Error ? err.message : 'Connection failed' };
      await this.updateHealth(result);
      return result;
    }
  }

  async fetchBookings(startDate: Date, endDate: Date): Promise<OTABooking[]> {
    const fmt = (d: Date) => d.toISOString().split('T')[0];

    const data = await withRetry(async () => {
      const url = `${BASE_URL}/v3/bookings?hotel_id=${this.config.hotelId ?? this.config.propertyId}&` +
        `check_in_from=${fmt(startDate)}&check_in_to=${fmt(endDate)}&statuses=CONFIRMED,CANCELLED`;
      const res = await fetchWithTimeout(url, { method: 'GET', headers: this.headers }, this.timeoutMs);
      if (!res.ok) throw new Error(`Agoda API error: HTTP ${res.status} - ${await res.text()}`);
      return res.json() as Promise<{ bookings: AgodaReservation[] }>;
    }, { maxAttempts: this.maxRetries });

    const bookings: OTABooking[] = data.bookings?.map(r => ({
      externalBookingId: r.booking_id,
      guestName: `${r.first_name} ${r.last_name}`.trim(),
      guestEmail: r.email,
      guestPhone: r.phone,
      roomTypeCode: r.room_type_id,
      checkIn: r.check_in,
      checkOut: r.check_out,
      adults: r.adults,
      children: r.children,
      totalAmount: r.total_amount,
      currency: r.currency || this.currency,
      commission: r.commission_amount,
      status: mapAgodaStatus(r.status),
      specialRequests: r.special_requests,
      bookedAt: r.booking_date,
      rawData: r,
    })) ?? [];

    await this.logSync('fetch-bookings', 'success', bookings.length);
    return bookings;
  }

  async pushAvailability(inventory: InventoryUpdate[]): Promise<SyncResult> {
    const startTime = Date.now();
    let succeeded = 0, failed = 0;
    const errors: string[] = [];

    // Agoda accepts batch updates
    const batches: InventoryUpdate[][] = [];
    for (let i = 0; i < inventory.length; i += 30) {
      batches.push(inventory.slice(i, i + 30));
    }

    for (const batch of batches) {
      try {
        await withRetry(async () => {
          const url = `${BASE_URL}/v3/inventory`;
          const payload = {
            hotel_id: this.config.hotelId ?? this.config.propertyId,
            inventory: batch.map(inv => ({
              room_type_id: inv.roomTypeCode,
              date: inv.date,
              available: inv.available,
              total: inv.totalInventory ?? inv.available,
              blocked: inv.isBlocked ?? false,
              min_stay: inv.minStay ?? 1,
              max_stay: inv.maxStay,
              closed_to_arrival: inv.cta ?? false,
              closed_to_departure: inv.ctd ?? false,
            })),
          };
          const res = await fetchWithTimeout(url, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(payload),
          }, this.timeoutMs);
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        }, { maxAttempts: this.maxRetries });
        succeeded += batch.length;
      } catch (err) {
        failed += batch.length;
        errors.push(`Batch (${batch.length} items): ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    await this.persistInventory(inventory);
    const durationMs = Date.now() - startTime;
    await this.logSync('push-availability', failed === 0 ? 'success' : 'partial', inventory.length, errors.join('; ') || undefined, durationMs);

    return {
      success: failed === 0,
      channelId: this.config.channelId,
      channelName: this.config.channelName,
      operation: 'push-availability',
      recordsProcessed: inventory.length,
      recordsSuccess: succeeded,
      recordsFailed: failed,
      errors: errors.length > 0 ? errors : undefined,
      durationMs,
    };
  }

  async pushRates(rates: RateUpdate[]): Promise<SyncResult> {
    const startTime = Date.now();
    let succeeded = 0, failed = 0;
    const errors: string[] = [];

    const batches: RateUpdate[][] = [];
    for (let i = 0; i < rates.length; i += 30) {
      batches.push(rates.slice(i, i + 30));
    }

    for (const batch of batches) {
      try {
        await withRetry(async () => {
          const url = `${BASE_URL}/v3/rates`;
          const payload = {
            hotel_id: this.config.hotelId ?? this.config.propertyId,
            rates: batch.map(r => ({
              room_type_id: r.roomTypeCode,
              rate_plan_id: r.ratePlanCode,
              date: r.date,
              amount: r.rate,
              currency: r.currency ?? this.currency,
              extra_adult: r.extraAdultRate,
              extra_child: r.extraChildRate,
              meal_plan: r.mealPlan ?? 'room_only',
            })),
          };
          const res = await fetchWithTimeout(url, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(payload),
          }, this.timeoutMs);
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        }, { maxAttempts: this.maxRetries });
        succeeded += batch.length;
      } catch (err) {
        failed += batch.length;
        errors.push(`Batch (${batch.length} items): ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    await this.persistRates(rates);
    const durationMs = Date.now() - startTime;
    await this.logSync('push-rates', failed === 0 ? 'success' : 'partial', rates.length, errors.join('; ') || undefined, durationMs);

    return {
      success: failed === 0,
      channelId: this.config.channelId,
      channelName: this.config.channelName,
      operation: 'push-rates',
      recordsProcessed: rates.length,
      recordsSuccess: succeeded,
      recordsFailed: failed,
      errors: errors.length > 0 ? errors : undefined,
      durationMs,
    };
  }

  async updateBookingStatus(externalBookingId: string, status: OTABookingStatus): Promise<boolean> {
    const statusMap: Record<OTABookingStatus, string> = {
      confirmed: 'CONFIRMED',
      cancelled: 'CANCELLED',
      pending: 'PENDING',
      checked_in: 'CHECKED_IN',
      checked_out: 'CHECKED_OUT',
      no_show: 'NO_SHOW',
      modified: 'CONFIRMED',
    };

    return withRetry(async () => {
      const url = `${BASE_URL}/v3/bookings/${externalBookingId}/status`;
      const res = await fetchWithTimeout(url, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({ status: statusMap[status] }),
      }, this.timeoutMs);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      return true;
    }, { maxAttempts: this.maxRetries });
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.config.webhookSecret) return true;
    const crypto = require('crypto');
    const expected = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(payload)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature.replace('sha256=', '')),
      Buffer.from(expected)
    );
  }

  parseWebhookPayload(body: Record<string, unknown>): Partial<OTABooking> | null {
    try {
      const r = body as unknown as AgodaReservation;
      if (!r.booking_id) return null;
      return {
        externalBookingId: r.booking_id,
        guestName: `${r.first_name} ${r.last_name}`.trim(),
        guestEmail: r.email,
        roomTypeCode: r.room_type_id,
        checkIn: r.check_in,
        checkOut: r.check_out,
        adults: r.adults,
        totalAmount: r.total_amount,
        currency: r.currency ?? DEFAULT_CURRENCY,
        status: mapAgodaStatus(r.status),
        rawData: body,
      };
    } catch {
      return null;
    }
  }
}
