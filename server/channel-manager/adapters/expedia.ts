/**
 * Expedia OTA Adapter
 * 
 * Integrates with Expedia Partner Central (EPC) API:
 * - Inventory sync via Product API
 * - Rate push via Rates & Availability API
 * - Reservation retrieval via Reservations API
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

const BASE_RESERVATIONS = 'https://services.expediapartnercentral.com/reservations/v3';
const BASE_PRODUCTS = 'https://services.expediapartnercentral.com/products/v2';

interface ExpediaReservation {
  id: string;
  type: string;
  status: string;
  primaryGuest: {
    givenName: string;
    familyName: string;
    emailAddress?: string;
    phoneNumbers?: { countryCode?: string; number?: string }[];
  };
  roomTypeId: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: { adultCount: number; childCount: number };
  amountCharged: { value: number; currency: string };
  affiliateCommissionAmount?: { value: number };
  specialRequest?: string;
  createDateTime: string;
}

function mapExpediaStatus(status: string): OTABookingStatus {
  const map: Record<string, OTABookingStatus> = {
    BOOKED: 'confirmed',
    CANCELLED: 'cancelled',
    PENDING: 'pending',
    CHECKED_IN: 'checked_in',
    CHECKED_OUT: 'checked_out',
    NO_SHOW: 'no_show',
  };
  return map[status] ?? 'confirmed';
}

export class ExpediaAdapter extends BaseOTAAdapter {
  private get headers(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  async healthCheck(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
      const url = `${BASE_PRODUCTS}/properties/${this.config.propertyId}`;
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
      const url = `${BASE_RESERVATIONS}?propertyId=${this.config.propertyId}&checkInDate=${fmt(startDate)}&checkOutDate=${fmt(endDate)}`;
      const res = await fetchWithTimeout(url, { method: 'GET', headers: this.headers }, this.timeoutMs);
      if (!res.ok) throw new Error(`Expedia API error: HTTP ${res.status} - ${await res.text()}`);
      return res.json() as Promise<{ entity: ExpediaReservation[] }>;
    }, { maxAttempts: this.maxRetries });

    const bookings: OTABooking[] = data.entity?.map(r => ({
      externalBookingId: r.id,
      guestName: `${r.primaryGuest.givenName} ${r.primaryGuest.familyName}`.trim(),
      guestEmail: r.primaryGuest.emailAddress,
      guestPhone: r.primaryGuest.phoneNumbers?.[0]?.number,
      roomTypeCode: r.roomTypeId,
      checkIn: r.checkInDate,
      checkOut: r.checkOutDate,
      adults: r.guestCount.adultCount,
      children: r.guestCount.childCount,
      totalAmount: r.amountCharged.value,
      currency: r.amountCharged.currency || this.currency,
      commission: r.affiliateCommissionAmount?.value,
      status: mapExpediaStatus(r.status),
      specialRequests: r.specialRequest,
      bookedAt: r.createDateTime,
      rawData: r,
    })) ?? [];

    await this.logSync('fetch-bookings', 'success', bookings.length);
    return bookings;
  }

  async pushAvailability(inventory: InventoryUpdate[]): Promise<SyncResult> {
    const startTime = Date.now();
    let succeeded = 0, failed = 0;
    const errors: string[] = [];

    // Group by room type for batch updates
    const byRoomType = inventory.reduce<Record<string, InventoryUpdate[]>>((acc, inv) => {
      if (!acc[inv.roomTypeCode]) acc[inv.roomTypeCode] = [];
      acc[inv.roomTypeCode].push(inv);
      return acc;
    }, {});

    for (const [roomTypeCode, invs] of Object.entries(byRoomType)) {
      try {
        await withRetry(async () => {
          const url = `${BASE_PRODUCTS}/properties/${this.config.propertyId}/roomTypes/${roomTypeCode}/availability`;
          const payload = {
            availability: invs.map(inv => ({
              date: inv.date,
              available: inv.available,
              isAvailable: !inv.isBlocked && inv.available > 0,
              restrictions: {
                minLos: inv.minStay ?? 1,
                ...(inv.maxStay ? { maxLos: inv.maxStay } : {}),
                closedToArrival: inv.cta ?? false,
                closedToDeparture: inv.ctd ?? false,
              },
            })),
          };
          const res = await fetchWithTimeout(url, {
            method: 'PUT',
            headers: this.headers,
            body: JSON.stringify(payload),
          }, this.timeoutMs);
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        }, { maxAttempts: this.maxRetries });
        succeeded += invs.length;
      } catch (err) {
        failed += invs.length;
        errors.push(`${roomTypeCode}: ${err instanceof Error ? err.message : String(err)}`);
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

    const byRoomType = rates.reduce<Record<string, RateUpdate[]>>((acc, r) => {
      const key = `${r.roomTypeCode}:${r.ratePlanCode ?? 'default'}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(r);
      return acc;
    }, {});

    for (const [key, ratesGroup] of Object.entries(byRoomType)) {
      const [roomTypeCode, ratePlanCode] = key.split(':');
      try {
        await withRetry(async () => {
          const url = `${BASE_PRODUCTS}/properties/${this.config.propertyId}/roomTypes/${roomTypeCode}/ratePlans/${ratePlanCode ?? 'standard'}/rates`;
          const payload = {
            rates: ratesGroup.map(r => ({
              checkInDate: r.date,
              checkOutDate: r.date,
              baseRate: { value: r.rate, currency: r.currency ?? this.currency },
              ...(r.extraAdultRate ? { extraPersonRate: { value: r.extraAdultRate, currency: r.currency ?? this.currency } } : {}),
            })),
          };
          const res = await fetchWithTimeout(url, {
            method: 'PUT',
            headers: this.headers,
            body: JSON.stringify(payload),
          }, this.timeoutMs);
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        }, { maxAttempts: this.maxRetries });
        succeeded += ratesGroup.length;
      } catch (err) {
        failed += ratesGroup.length;
        errors.push(`${key}: ${err instanceof Error ? err.message : String(err)}`);
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
      confirmed: 'BOOKED',
      cancelled: 'CANCELLED',
      pending: 'PENDING',
      checked_in: 'CHECKED_IN',
      checked_out: 'CHECKED_OUT',
      no_show: 'NO_SHOW',
      modified: 'BOOKED',
    };

    return withRetry(async () => {
      const url = `${BASE_RESERVATIONS}/${externalBookingId}`;
      const res = await fetchWithTimeout(url, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({ status: statusMap[status] }),
      }, this.timeoutMs);
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      return true;
    }, { maxAttempts: this.maxRetries });
  }

  parseWebhookPayload(body: Record<string, unknown>): Partial<OTABooking> | null {
    try {
      const reservation = body as unknown as ExpediaReservation;
      if (!reservation.id) return null;
      return {
        externalBookingId: reservation.id,
        guestName: `${reservation.primaryGuest?.givenName} ${reservation.primaryGuest?.familyName}`.trim(),
        guestEmail: reservation.primaryGuest?.emailAddress,
        roomTypeCode: reservation.roomTypeId,
        checkIn: reservation.checkInDate,
        checkOut: reservation.checkOutDate,
        adults: reservation.guestCount?.adultCount ?? 1,
        totalAmount: reservation.amountCharged?.value ?? 0,
        currency: reservation.amountCharged?.currency ?? DEFAULT_CURRENCY,
        status: mapExpediaStatus(reservation.status),
        rawData: body,
      };
    } catch {
      return null;
    }
  }
}
