import { ChannelManagerService, BookingData, ChannelConfig } from './channelManager';

/**
 * Expedia Channel Manager Integration
 * Uses Expedia Partner Central (EPC) API
 * Documentation: https://developer.expediagroup.com/
 */
export class ExpediaService extends ChannelManagerService {
  constructor(config: ChannelConfig) {
    super('expedia', config);
  }

  async fetchBookings(startDate: Date, endDate: Date): Promise<BookingData[]> {
    try {
      // Expedia EPC API endpoint with query parameters
      const endpoint = this.config.endpoint || 'https://services.expediapartnercentral.com/reservations/v3';
      const params = new URLSearchParams({
        hotelId: this.config.hotelId || this.config.propertyId,
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0]
      });
      
      const response = await fetch(`${endpoint}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Expedia API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseBookingsFromResponse(data);
    } catch (error) {
      console.error('Error fetching Expedia bookings:', error);
      throw error;
    }
  }

  async syncAvailability(roomType: string, date: Date, available: number): Promise<boolean> {
    try {
      const endpoint = this.config.endpoint || 'https://services.expediapartnercentral.com/products/v2/properties';
      
      const response = await fetch(`${endpoint}/${this.config.propertyId}/roomTypes/${roomType}/ratePlans/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          date: date.toISOString().split('T')[0],
          available: available,
          closed: available === 0
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error syncing availability to Expedia:', error);
      return false;
    }
  }

  async syncRates(roomType: string, date: Date, rate: number): Promise<boolean> {
    try {
      const endpoint = this.config.endpoint || 'https://services.expediapartnercentral.com/products/v2/properties';
      
      const response = await fetch(`${endpoint}/${this.config.propertyId}/roomTypes/${roomType}/ratePlans/rates`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          date: date.toISOString().split('T')[0],
          baseRate: rate,
          currency: 'USD'
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error syncing rates to Expedia:', error);
      return false;
    }
  }

  async updateBookingStatus(externalBookingId: string, status: string): Promise<boolean> {
    try {
      const endpoint = this.config.endpoint || 'https://services.expediapartnercentral.com/reservations/v3';
      
      const response = await fetch(`${endpoint}/${externalBookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          status: this.mapStatusToExpedia(status)
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating booking status on Expedia:', error);
      return false;
    }
  }

  private parseBookingsFromResponse(data: any): BookingData[] {
    const bookings: BookingData[] = [];
    
    try {
      const reservations = data.reservations || data.entity || [];
      
      for (const reservation of reservations) {
        const primaryGuest = reservation.primaryGuest || reservation.guest || {};
        
        bookings.push({
          externalBookingId: reservation.confirmationNumber || reservation.itineraryId,
          guestName: `${primaryGuest.firstName || ''} ${primaryGuest.lastName || ''}`.trim(),
          guestEmail: primaryGuest.email || '',
          roomType: reservation.roomTypeId || reservation.roomType,
          checkIn: reservation.checkInDate || reservation.arrivalDate,
          checkOut: reservation.checkOutDate || reservation.departureDate,
          totalAmount: parseFloat(reservation.totalCharges?.total || reservation.amount || 0),
          commission: parseFloat(reservation.commission || 0),
          status: this.mapStatusFromExpedia(reservation.status),
          rawData: reservation
        });
      }
    } catch (error) {
      console.error('Error parsing Expedia response:', error);
    }
    
    return bookings;
  }

  private mapStatusToExpedia(status: string): string {
    const statusMap: Record<string, string> = {
      'confirmed': 'BOOKED',
      'cancelled': 'CANCELLED',
      'checked-in': 'CHECKED_IN',
      'checked-out': 'CHECKED_OUT',
      'no-show': 'NO_SHOW'
    };
    return statusMap[status] || status.toUpperCase();
  }

  private mapStatusFromExpedia(expediaStatus: string): string {
    const statusMap: Record<string, string> = {
      'BOOKED': 'confirmed',
      'CANCELLED': 'cancelled',
      'CHECKED_IN': 'checked-in',
      'CHECKED_OUT': 'checked-out',
      'NO_SHOW': 'no-show'
    };
    return statusMap[expediaStatus] || expediaStatus.toLowerCase();
  }
}
