import { ChannelManagerService, BookingData, ChannelConfig } from './channelManager';

/**
 * Agoda Channel Manager Integration
 * Uses Agoda YCS (Yield Control System) API
 * Documentation: https://developer.agoda.com/
 */
export class AgodaService extends ChannelManagerService {
  constructor(config: ChannelConfig) {
    super('agoda', config);
  }

  async fetchBookings(startDate: Date, endDate: Date): Promise<BookingData[]> {
    try {
      // Agoda YCS API endpoint
      const endpoint = this.config.endpoint || 'https://ycs.agoda.com/api/v1/bookings';
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey || '',
          'X-Hotel-Id': this.config.hotelId || this.config.propertyId
        },
        body: JSON.stringify({
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        })
      });

      if (!response.ok) {
        throw new Error(`Agoda API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseBookingsFromResponse(data);
    } catch (error) {
      console.error('Error fetching Agoda bookings:', error);
      throw error;
    }
  }

  async syncAvailability(roomType: string, date: Date, available: number): Promise<boolean> {
    try {
      const endpoint = this.config.endpoint || 'https://ycs.agoda.com/api/v1/inventory';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey || '',
          'X-Hotel-Id': this.config.hotelId || this.config.propertyId
        },
        body: JSON.stringify({
          room_type_id: roomType,
          date: date.toISOString().split('T')[0],
          available_rooms: available
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error syncing availability to Agoda:', error);
      return false;
    }
  }

  async syncRates(roomType: string, date: Date, rate: number): Promise<boolean> {
    try {
      const endpoint = this.config.endpoint || 'https://ycs.agoda.com/api/v1/rates';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey || '',
          'X-Hotel-Id': this.config.hotelId || this.config.propertyId
        },
        body: JSON.stringify({
          room_type_id: roomType,
          date: date.toISOString().split('T')[0],
          rate: rate,
          currency: 'USD'
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error syncing rates to Agoda:', error);
      return false;
    }
  }

  async updateBookingStatus(externalBookingId: string, status: string): Promise<boolean> {
    try {
      const endpoint = this.config.endpoint || `https://ycs.agoda.com/api/v1/bookings/${externalBookingId}`;
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey || '',
          'X-Hotel-Id': this.config.hotelId || this.config.propertyId
        },
        body: JSON.stringify({
          status: this.mapStatusToAgoda(status)
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating booking status on Agoda:', error);
      return false;
    }
  }

  private parseBookingsFromResponse(data: any): BookingData[] {
    const bookings: BookingData[] = [];
    
    try {
      const reservations = data.bookings || data.reservations || [];
      
      for (const reservation of reservations) {
        bookings.push({
          externalBookingId: reservation.booking_id || reservation.id,
          guestName: `${reservation.guest_first_name || ''} ${reservation.guest_last_name || ''}`.trim(),
          guestEmail: reservation.guest_email || '',
          roomType: reservation.room_type_id || reservation.room_type,
          checkIn: reservation.check_in_date || reservation.arrival_date,
          checkOut: reservation.check_out_date || reservation.departure_date,
          totalAmount: parseFloat(reservation.total_amount || reservation.price || 0),
          commission: parseFloat(reservation.commission || 0),
          status: this.mapStatusFromAgoda(reservation.status),
          rawData: reservation
        });
      }
    } catch (error) {
      console.error('Error parsing Agoda response:', error);
    }
    
    return bookings;
  }

  private mapStatusToAgoda(status: string): string {
    const statusMap: Record<string, string> = {
      'confirmed': 'CONFIRMED',
      'cancelled': 'CANCELLED',
      'checked-in': 'CHECKED_IN',
      'checked-out': 'CHECKED_OUT',
      'no-show': 'NO_SHOW'
    };
    return statusMap[status] || status.toUpperCase();
  }

  private mapStatusFromAgoda(agodaStatus: string): string {
    const statusMap: Record<string, string> = {
      'CONFIRMED': 'confirmed',
      'CANCELLED': 'cancelled',
      'CHECKED_IN': 'checked-in',
      'CHECKED_OUT': 'checked-out',
      'NO_SHOW': 'no-show'
    };
    return statusMap[agodaStatus] || agodaStatus.toLowerCase();
  }
}
