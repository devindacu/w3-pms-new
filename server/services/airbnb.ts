import { ChannelManagerService, BookingData, ChannelConfig } from './channelManager';

/**
 * Airbnb Channel Manager Integration
 * Uses Airbnb Host API
 * Documentation: https://www.airbnb.com/partner/api-docs
 */
export class AirbnbService extends ChannelManagerService {
  constructor(config: ChannelConfig) {
    super('airbnb', config);
  }

  async fetchBookings(startDate: Date, endDate: Date): Promise<BookingData[]> {
    try {
      // Airbnb Host API endpoint
      const endpoint = this.config.endpoint || 'https://api.airbnb.com/v2/host/reservations';
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Airbnb-API-Key': this.config.apiKey || '',
          'Authorization': `Bearer ${this.config.apiSecret || ''}`
        },
        body: JSON.stringify({
          listing_id: this.config.propertyId,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        })
      });

      if (!response.ok) {
        throw new Error(`Airbnb API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseBookingsFromResponse(data);
    } catch (error) {
      console.error('Error fetching Airbnb bookings:', error);
      throw error;
    }
  }

  async syncAvailability(roomType: string, date: Date, available: number): Promise<boolean> {
    try {
      const endpoint = this.config.endpoint || 'https://api.airbnb.com/v2/host/calendar';
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Airbnb-API-Key': this.config.apiKey || '',
          'Authorization': `Bearer ${this.config.apiSecret || ''}`
        },
        body: JSON.stringify({
          listing_id: this.config.propertyId,
          date: date.toISOString().split('T')[0],
          available: available > 0,
          availability: available > 0 ? 'available' : 'blocked'
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error syncing availability to Airbnb:', error);
      return false;
    }
  }

  async syncRates(roomType: string, date: Date, rate: number): Promise<boolean> {
    try {
      const endpoint = this.config.endpoint || 'https://api.airbnb.com/v2/host/pricing';
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Airbnb-API-Key': this.config.apiKey || '',
          'Authorization': `Bearer ${this.config.apiSecret || ''}`
        },
        body: JSON.stringify({
          listing_id: this.config.propertyId,
          date: date.toISOString().split('T')[0],
          price: rate,
          currency: 'USD'
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error syncing rates to Airbnb:', error);
      return false;
    }
  }

  async updateBookingStatus(externalBookingId: string, status: string): Promise<boolean> {
    try {
      const endpoint = this.config.endpoint || `https://api.airbnb.com/v2/host/reservations/${externalBookingId}`;
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Airbnb-API-Key': this.config.apiKey || '',
          'Authorization': `Bearer ${this.config.apiSecret || ''}`
        },
        body: JSON.stringify({
          status: this.mapStatusToAirbnb(status)
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating booking status on Airbnb:', error);
      return false;
    }
  }

  private parseBookingsFromResponse(data: any): BookingData[] {
    const bookings: BookingData[] = [];
    
    try {
      const reservations = data.reservations || [];
      
      for (const reservation of reservations) {
        const guest = reservation.guest || {};
        
        bookings.push({
          externalBookingId: reservation.confirmation_code || reservation.id,
          guestName: `${guest.first_name || ''} ${guest.last_name || ''}`.trim(),
          guestEmail: guest.email || '',
          roomType: reservation.listing_id || this.config.propertyId,
          checkIn: reservation.start_date || reservation.check_in,
          checkOut: reservation.end_date || reservation.check_out,
          totalAmount: parseFloat(reservation.total_paid_amount_accurate || reservation.price || 0),
          commission: parseFloat(reservation.host_service_fee || 0),
          status: this.mapStatusFromAirbnb(reservation.status),
          rawData: reservation
        });
      }
    } catch (error) {
      console.error('Error parsing Airbnb response:', error);
    }
    
    return bookings;
  }

  private mapStatusToAirbnb(status: string): string {
    const statusMap: Record<string, string> = {
      'confirmed': 'accepted',
      'cancelled': 'cancelled_by_host',
      'checked-in': 'checked_in',
      'checked-out': 'completed',
      'no-show': 'cancelled_by_guest'
    };
    return statusMap[status] || status;
  }

  private mapStatusFromAirbnb(airbnbStatus: string): string {
    const statusMap: Record<string, string> = {
      'accepted': 'confirmed',
      'cancelled_by_host': 'cancelled',
      'cancelled_by_guest': 'cancelled',
      'checked_in': 'checked-in',
      'completed': 'checked-out'
    };
    return statusMap[airbnbStatus] || airbnbStatus.toLowerCase();
  }
}
