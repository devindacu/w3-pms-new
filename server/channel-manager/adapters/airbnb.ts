/**
 * Airbnb OTA Adapter
 * 
 * Integrates with Airbnb Host API:
 * - Calendar/availability sync
 * - Pricing updates
 * - Reservation retrieval
 * - HMAC webhook signature verification
 */

import {
  BaseOTAAdapter,
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

const BASE_URL = 'https://api.airbnb.com/v2';

interface AirbnbReservation {
  confirmation_code: string;
  status: string;
  guest: {
    first_name: string;
    last_name: string;
    email?: string;
  };
  listing_id: string;
  start_date: string;
  end_date: string;
  number_of_guests: number;
  payout_price_breakdown?: {
    gross_earnings_aud?: number;
  };
  total_paid_amount: number;
  currency: string;
  host_payout_amount: number;
  special_requirements?: string;
  created_at: string;
}

function mapAirbnbStatus(status: string): OTABookingStatus {
  const map: Record<string, OTABookingStatus> = {
    accepted: 'confirmed',
    cancelled_by_host: 'cancelled',
    cancelled_by_guest: 'cancelled',
    pending: 'pending',
    checked_in: 'checked_in',
    completed: 'checked_out',
  };
  return map[status?.toLowerCase()] ?? 'confirmed';
}

export class AirbnbAdapter extends BaseOTAAdapter {
  private get headers(): Record<string, string> {
    return {
      'X-Airbnb-API-Key': this.config.apiKey,
      'Authorization': `Bearer ${this.config.apiSecret ?? this.config.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const url = `${BASE_URL}/listings/${this.config.propertyId}`;
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
      const url = `${BASE_URL}/reservations?listing_id=${this.config.propertyId}&start_date=${fmt(startDate)}&end_date=${fmt(endDate)}`;
      const res = await fetchWithTimeout(url, { method: 'GET', headers: this.headers }, this.timeoutMs);
      if (!res.ok) throw new Error(`Airbnb API error: HTTP ${res.status} - ${await res.text()}`);
      return res.json() as Promise<{ reservations: AirbnbReservation[] }>;
    }, { maxAttempts: this.maxRetries });

    const bookings: OTABooking[] = data.reservations?.map(r => ({
      externalBookingId: r.confirmation_code,
      guestName: `${r.guest.first_name} ${r.guest.last_name}`.trim(),
      guestEmail: r.guest.email,
      roomTypeCode: r.listing_id,
      checkIn: r.start_date,
      checkOut: r.end_date,
      adults: r.number_of_guests,
      totalAmount: r.total_paid_amount,
      currency: r.currency || this.currency,
      commission: r.total_paid_amount - (r.host_payout_amount ?? r.total_paid_amount),
      status: mapAirbnbStatus(r.status),
      specialRequests: r.special_requirements,
      bookedAt: r.created_at,
      rawData: r,
    })) ?? [];

    await this.logSync('fetch-bookings', 'success', bookings.length);
    return bookings;
  }

  async pushAvailability(inventory: InventoryUpdate[]): Promise<SyncResult> {
    const startTime = Date.now();
    let succeeded = 0, failed = 0;
    const errors: string[] = [];

    // Airbnb uses calendar-based availability (blocked/unblocked dates)
    for (const inv of inventory) {
      try {
        await withRetry(async () => {
          const url = `${BASE_URL}/calendar_operations/${inv.roomTypeCode}`;
          const payload = {
            operations: [{
              dates: { start: inv.date, end: inv.date },
              availability: inv.isBlocked || inv.available === 0 ? 'unavailable' : 'available',
              ...(inv.minStay ? { min_nights: inv.minStay } : {}),
              ...(inv.maxStay ? { max_nights: inv.maxStay } : {}),
              closed_to_arrival: inv.cta ?? false,
              closed_to_departure: inv.ctd ?? false,
            }],
          };
          const res = await fetchWithTimeout(url, {
            method: 'PUT',
            headers: this.headers,
            body: JSON.stringify(payload),
          }, this.timeoutMs);
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        }, { maxAttempts: this.maxRetries });
        succeeded++;
      } catch (err) {
        failed++;
        errors.push(`${inv.roomTypeCode}/${inv.date}: ${err instanceof Error ? err.message : String(err)}`);
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

    for (const rate of rates) {
      try {
        await withRetry(async () => {
          const url = `${BASE_URL}/listings/${rate.roomTypeCode}/pricing_settings`;
          const payload = {
            price_per_night: rate.rate,
            currency: rate.currency ?? this.currency,
            ...(rate.extraAdultRate ? { additional_guest_fee: rate.extraAdultRate } : {}),
          };
          const res = await fetchWithTimeout(url, {
            method: 'PUT',
            headers: this.headers,
            body: JSON.stringify(payload),
          }, this.timeoutMs);
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        }, { maxAttempts: this.maxRetries });
        succeeded++;
      } catch (err) {
        failed++;
        errors.push(`${rate.roomTypeCode}/${rate.date}: ${err instanceof Error ? err.message : String(err)}`);
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
      confirmed: 'accepted',
      cancelled: 'cancelled_by_host',
      pending: 'pending',
      checked_in: 'checked_in',
      checked_out: 'completed',
      no_show: 'no_show',
      modified: 'accepted',
    };

    return withRetry(async () => {
      const url = `${BASE_URL}/reservations/${externalBookingId}`;
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
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(`sha256=${expected}`));
  }

  parseWebhookPayload(body: Record<string, unknown>): Partial<OTABooking> | null {
    try {
      const r = body as unknown as AirbnbReservation;
      if (!r.confirmation_code) return null;
      return {
        externalBookingId: r.confirmation_code,
        guestName: `${r.guest?.first_name} ${r.guest?.last_name}`.trim(),
        guestEmail: r.guest?.email,
        roomTypeCode: r.listing_id,
        checkIn: r.start_date,
        checkOut: r.end_date,
        adults: r.number_of_guests,
        totalAmount: r.total_paid_amount,
        currency: r.currency ?? DEFAULT_CURRENCY,
        status: mapAirbnbStatus(r.status),
        rawData: body,
      };
    } catch {
      return null;
    }
  }
}
