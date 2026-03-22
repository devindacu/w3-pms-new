/**
 * Booking.com OTA Adapter
 * 
 * Integrates with Booking.com Connectivity API:
 * - Inventory/availability sync via REST
 * - Rate push via REST
 * - Reservation retrieval
 * - Webhook handling for real-time reservation notifications
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

const BASE_URL = 'https://connect.booking.com/hotel/hws/connect/v1';

interface BookingComReservation {
  id: string;
  booker_firstname: string;
  booker_lastname: string;
  booker_email: string;
  booker_phone?: string;
  room_reservation_info: {
    room_type_id: string;
    checkin: string;
    checkout: string;
    nr_adults: number;
    nr_children: number;
    price_per_night: number;
    total_price: number;
    currency_code: string;
    status: string;
  }[];
  commission: number;
  status: string;
  special_requests?: string;
  created_at: string;
}

function mapBookingComStatus(status: string): OTABookingStatus {
  const map: Record<string, OTABookingStatus> = {
    ok: 'confirmed',
    cancelled: 'cancelled',
    modified: 'modified',
    no_show: 'no_show',
    checked_in: 'checked_in',
    checked_out: 'checked_out',
  };
  return map[status.toLowerCase()] ?? 'confirmed';
}

export class BookingComAdapter extends BaseOTAAdapter {
  private get authHeader(): string {
    return `Basic ${Buffer.from(`${this.config.propertyId}:${this.config.apiKey}`).toString('base64')}`;
  }

  private get headers(): Record<string, string> {
    return {
      'Authorization': this.authHeader,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const url = `${BASE_URL}/properties/${this.config.propertyId}`;
      const res = await fetchWithTimeout(url, { method: 'GET', headers: this.headers }, 10_000);
      const responseTimeMs = Date.now() - start;
      const healthy = res.ok;
      const result = { healthy, responseTimeMs, message: healthy ? undefined : `HTTP ${res.status}` };
      await this.updateHealth(result);
      return result;
    } catch (err) {
      const responseTimeMs = Date.now() - start;
      const result = {
        healthy: false,
        responseTimeMs,
        message: err instanceof Error ? err.message : 'Connection failed',
      };
      await this.updateHealth(result);
      return result;
    }
  }

  async fetchBookings(startDate: Date, endDate: Date): Promise<OTABooking[]> {
    const fmt = (d: Date) => d.toISOString().split('T')[0];

    const bookings = await withRetry(async () => {
      const url = `${BASE_URL}/properties/${this.config.propertyId}/reservations?` +
        `arrival_date_start=${fmt(startDate)}&arrival_date_end=${fmt(endDate)}&status=ok,cancelled`;

      const res = await fetchWithTimeout(url, { method: 'GET', headers: this.headers }, this.timeoutMs);
      if (!res.ok) throw new Error(`Booking.com API error: HTTP ${res.status} - ${await res.text()}`);
      return res.json() as Promise<{ reservations: BookingComReservation[] }>;
    }, { maxAttempts: this.maxRetries });

    const otaBookings: OTABooking[] = bookings.reservations?.map(r => {
      const room = r.room_reservation_info[0];
      return {
        externalBookingId: r.id,
        guestName: `${r.booker_firstname} ${r.booker_lastname}`.trim(),
        guestEmail: r.booker_email,
        guestPhone: r.booker_phone,
        roomTypeCode: room.room_type_id,
        checkIn: room.checkin,
        checkOut: room.checkout,
        adults: room.nr_adults,
        children: room.nr_children,
        totalAmount: room.total_price,
        currency: room.currency_code || this.currency,
        commission: r.commission,
        status: mapBookingComStatus(r.status),
        specialRequests: r.special_requests,
        bookedAt: r.created_at,
        rawData: r,
      };
    }) ?? [];

    await this.logSync('fetch-bookings', 'success', otaBookings.length);
    return otaBookings;
  }

  async pushAvailability(inventory: InventoryUpdate[]): Promise<SyncResult> {
    const startTime = Date.now();
    let succeeded = 0, failed = 0;
    const errors: string[] = [];

    for (const inv of inventory) {
      try {
        await withRetry(async () => {
          const url = `${BASE_URL}/properties/${this.config.propertyId}/room_types/${inv.roomTypeCode}/availability`;
          const payload = {
            availability: [{
              date: inv.date,
              available: inv.available,
              total: inv.totalInventory ?? inv.available,
              blocked: inv.isBlocked ?? false,
              closed_to_arrival: inv.cta ?? false,
              closed_to_departure: inv.ctd ?? false,
              min_length_of_stay: inv.minStay ?? 1,
              ...(inv.maxStay ? { max_length_of_stay: inv.maxStay } : {}),
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
          const url = `${BASE_URL}/properties/${this.config.propertyId}/room_types/${rate.roomTypeCode}/rates`;
          const payload = {
            rates: [{
              date: rate.date,
              price: rate.rate,
              currency_code: rate.currency ?? this.currency,
              ...(rate.ratePlanCode ? { rate_plan_id: rate.ratePlanCode } : {}),
              ...(rate.extraAdultRate ? { extra_adult_price: rate.extraAdultRate } : {}),
              ...(rate.extraChildRate ? { extra_child_price: rate.extraChildRate } : {}),
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
      confirmed: 'ok',
      cancelled: 'cancelled',
      pending: 'pending',
      checked_in: 'checked_in',
      checked_out: 'checked_out',
      no_show: 'no_show',
      modified: 'modified',
    };

    return withRetry(async () => {
      const url = `${BASE_URL}/properties/${this.config.propertyId}/reservations/${externalBookingId}`;
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
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }

  parseWebhookPayload(body: Record<string, unknown>): Partial<OTABooking> | null {
    try {
      const reservation = body.reservation as BookingComReservation | undefined;
      if (!reservation) return null;
      const room = reservation.room_reservation_info?.[0];
      return {
        externalBookingId: reservation.id,
        guestName: `${reservation.booker_firstname} ${reservation.booker_lastname}`.trim(),
        guestEmail: reservation.booker_email,
        roomTypeCode: room?.room_type_id ?? '',
        checkIn: room?.checkin ?? '',
        checkOut: room?.checkout ?? '',
        adults: room?.nr_adults ?? 1,
        totalAmount: room?.total_price ?? 0,
        currency: room?.currency_code ?? DEFAULT_CURRENCY,
        status: mapBookingComStatus(reservation.status),
        rawData: body,
      };
    } catch {
      return null;
    }
  }
}
