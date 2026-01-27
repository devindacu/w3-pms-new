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
      // Airbnb Host API endpoint with query parameters
      const endpoint = this.config.endpoint || 'https://api.airbnb.com/v2/host/reservations';
      const params = new URLSearchParams({
        listing_id: this.config.propertyId,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      });
      
      const response = await fetch(`${endpoint}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Airbnb-API-Key': this.config.apiKey || '',
          'Authorization': `Bearer ${this.config.apiSecret || ''}`
        }
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

  // ============ Extended Airbnb API Services ============

  /**
   * Listing Management API - Create or update listing details
   */
  async updateListing(listingData: any): Promise<boolean> {
    try {
      const endpoint = this.config.endpoint || `https://api.airbnb.com/v2/host/listings/${this.config.propertyId}`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Airbnb-API-Key': this.config.apiKey || '',
          'Authorization': `Bearer ${this.config.apiSecret || ''}`
        },
        body: JSON.stringify({
          name: listingData.name,
          description: listingData.description,
          property_type: listingData.propertyType,
          room_type: listingData.roomType,
          accommodates: listingData.accommodates,
          bedrooms: listingData.bedrooms,
          beds: listingData.beds,
          bathrooms: listingData.bathrooms,
          amenities: listingData.amenities || []
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating listing on Airbnb:', error);
      return false;
    }
  }

  /**
   * Photos API - Upload listing photos
   */
  async uploadListingPhoto(photoUrl: string, caption?: string): Promise<boolean> {
    try {
      const endpoint = this.config.endpoint || `https://api.airbnb.com/v2/host/listings/${this.config.propertyId}/photos`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Airbnb-API-Key': this.config.apiKey || '',
          'Authorization': `Bearer ${this.config.apiSecret || ''}`
        },
        body: JSON.stringify({
          photo_url: photoUrl,
          caption: caption || ''
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error uploading photo to Airbnb:', error);
      return false;
    }
  }

  /**
   * Messaging API - Send message to guest
   */
  async sendMessage(reservationId: string, message: string): Promise<boolean> {
    try {
      const endpoint = this.config.endpoint || `https://api.airbnb.com/v2/host/threads/${reservationId}/messages`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Airbnb-API-Key': this.config.apiKey || '',
          'Authorization': `Bearer ${this.config.apiSecret || ''}`
        },
        body: JSON.stringify({
          message: message
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending message on Airbnb:', error);
      return false;
    }
  }

  /**
   * Messaging API - Get messages for a reservation
   */
  async getMessages(reservationId: string): Promise<any[]> {
    try {
      const endpoint = this.config.endpoint || `https://api.airbnb.com/v2/host/threads/${reservationId}/messages`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Airbnb-API-Key': this.config.apiKey || '',
          'Authorization': `Bearer ${this.config.apiSecret || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`Airbnb API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Error fetching messages from Airbnb:', error);
      return [];
    }
  }

  /**
   * Reviews API - Get reviews for the listing
   */
  async getReviews(): Promise<any[]> {
    try {
      const endpoint = this.config.endpoint || `https://api.airbnb.com/v2/host/listings/${this.config.propertyId}/reviews`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Airbnb-API-Key': this.config.apiKey || '',
          'Authorization': `Bearer ${this.config.apiSecret || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`Airbnb API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.reviews || [];
    } catch (error) {
      console.error('Error fetching reviews from Airbnb:', error);
      return [];
    }
  }

  /**
   * Reviews API - Respond to a review
   */
  async respondToReview(reviewId: string, response: string): Promise<boolean> {
    try {
      const endpoint = this.config.endpoint || `https://api.airbnb.com/v2/host/reviews/${reviewId}/response`;
      
      const result = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Airbnb-API-Key': this.config.apiKey || '',
          'Authorization': `Bearer ${this.config.apiSecret || ''}`
        },
        body: JSON.stringify({
          response: response
        })
      });

      return result.ok;
    } catch (error) {
      console.error('Error responding to review on Airbnb:', error);
      return false;
    }
  }

  /**
   * Pricing Rules API - Update pricing rules
   */
  async updatePricingRules(pricingRules: any): Promise<boolean> {
    try {
      const endpoint = this.config.endpoint || `https://api.airbnb.com/v2/host/listings/${this.config.propertyId}/pricing-rules`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Airbnb-API-Key': this.config.apiKey || '',
          'Authorization': `Bearer ${this.config.apiSecret || ''}`
        },
        body: JSON.stringify({
          base_price: pricingRules.basePrice,
          weekend_price: pricingRules.weekendPrice,
          monthly_discount: pricingRules.monthlyDiscount,
          weekly_discount: pricingRules.weeklyDiscount,
          cleaning_fee: pricingRules.cleaningFee,
          extra_person_fee: pricingRules.extraPersonFee
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating pricing rules on Airbnb:', error);
      return false;
    }
  }

  /**
   * Calendar API - Get availability calendar
   */
  async getCalendar(startDate: Date, endDate: Date): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        listing_id: this.config.propertyId,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      });

      const endpoint = this.config.endpoint || `https://api.airbnb.com/v2/host/calendar?${params.toString()}`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Airbnb-API-Key': this.config.apiKey || '',
          'Authorization': `Bearer ${this.config.apiSecret || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`Airbnb API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.calendar || [];
    } catch (error) {
      console.error('Error fetching calendar from Airbnb:', error);
      return [];
    }
  }

  /**
   * Analytics API - Get listing performance data
   */
  async getAnalytics(startDate: Date, endDate: Date): Promise<any> {
    try {
      const params = new URLSearchParams({
        listing_id: this.config.propertyId,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      });

      const endpoint = this.config.endpoint || `https://api.airbnb.com/v2/host/analytics?${params.toString()}`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Airbnb-API-Key': this.config.apiKey || '',
          'Authorization': `Bearer ${this.config.apiSecret || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`Airbnb API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching analytics from Airbnb:', error);
      return null;
    }
  }
}
