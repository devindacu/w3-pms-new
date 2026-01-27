import { ChannelManagerService, BookingData, ChannelConfig } from './channelManager';

/**
 * Booking.com Channel Manager Integration
 * Uses Booking.com's Connectivity API
 * Documentation: https://connect.booking.com/user_guide/site/en-US/
 */
export class BookingComService extends ChannelManagerService {
  constructor(config: ChannelConfig) {
    super('booking.com', config);
  }

  async fetchBookings(startDate: Date, endDate: Date): Promise<BookingData[]> {
    try {
      // Booking.com API endpoint for reservations
      const endpoint = this.config.endpoint || 'https://supply-xml.booking.com/hotels/xml/reservations';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Authorization': `Basic ${Buffer.from(`${this.config.propertyId}:${this.config.apiKey}`).toString('base64')}`
        },
        body: this.buildReservationRequest(startDate, endDate)
      });

      if (!response.ok) {
        throw new Error(`Booking.com API error: ${response.statusText}`);
      }

      const xmlData = await response.text();
      return this.parseBookingsFromXML(xmlData);
    } catch (error) {
      console.error('Error fetching Booking.com bookings:', error);
      throw error;
    }
  }

  async syncAvailability(roomType: string, date: Date, available: number): Promise<boolean> {
    try {
      const endpoint = this.config.endpoint || 'https://supply-xml.booking.com/hotels/xml/availability';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Authorization': `Basic ${Buffer.from(`${this.config.propertyId}:${this.config.apiKey}`).toString('base64')}`
        },
        body: this.buildAvailabilityRequest(roomType, date, available)
      });

      return response.ok;
    } catch (error) {
      console.error('Error syncing availability to Booking.com:', error);
      return false;
    }
  }

  async syncRates(roomType: string, date: Date, rate: number): Promise<boolean> {
    try {
      const endpoint = this.config.endpoint || 'https://supply-xml.booking.com/hotels/xml/rates';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Authorization': `Basic ${Buffer.from(`${this.config.propertyId}:${this.config.apiKey}`).toString('base64')}`
        },
        body: this.buildRateRequest(roomType, date, rate)
      });

      return response.ok;
    } catch (error) {
      console.error('Error syncing rates to Booking.com:', error);
      return false;
    }
  }

  async updateBookingStatus(externalBookingId: string, status: string): Promise<boolean> {
    try {
      const endpoint = this.config.endpoint || 'https://supply-xml.booking.com/hotels/xml/bookings';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Authorization': `Basic ${Buffer.from(`${this.config.propertyId}:${this.config.apiKey}`).toString('base64')}`
        },
        body: this.buildStatusUpdateRequest(externalBookingId, status)
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating booking status on Booking.com:', error);
      return false;
    }
  }

  private buildReservationRequest(startDate: Date, endDate: Date): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<request>
  <username>${this.config.propertyId}</username>
  <password>${this.config.apiKey}</password>
  <version>2.5</version>
  <reservations>
    <from>${startDate.toISOString().split('T')[0]}</from>
    <to>${endDate.toISOString().split('T')[0]}</to>
  </reservations>
</request>`;
  }

  private buildAvailabilityRequest(roomType: string, date: Date, available: number): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<request>
  <username>${this.config.propertyId}</username>
  <password>${this.config.apiKey}</password>
  <version>2.5</version>
  <availability>
    <room_id>${roomType}</room_id>
    <date>${date.toISOString().split('T')[0]}</date>
    <roomsToSell>${available}</roomsToSell>
  </availability>
</request>`;
  }

  private buildRateRequest(roomType: string, date: Date, rate: number): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<request>
  <username>${this.config.propertyId}</username>
  <password>${this.config.apiKey}</password>
  <version>2.5</version>
  <rates>
    <room_id>${roomType}</room_id>
    <date>${date.toISOString().split('T')[0]}</date>
    <rate>${rate}</rate>
  </rates>
</request>`;
  }

  private buildStatusUpdateRequest(bookingId: string, status: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<request>
  <username>${this.config.propertyId}</username>
  <password>${this.config.apiKey}</password>
  <version>2.5</version>
  <booking_id>${bookingId}</booking_id>
  <status>${status}</status>
</request>`;
  }

  private parseBookingsFromXML(xmlData: string): BookingData[] {
    // NOTE: This is a simplified placeholder implementation
    // TODO: In production, use a proper XML parser like fast-xml-parser
    // Example: npm install fast-xml-parser
    // import { XMLParser } from 'fast-xml-parser';
    // const parser = new XMLParser();
    // const result = parser.parse(xmlData);
    
    const bookings: BookingData[] = [];
    
    // Placeholder implementation for demonstration
    // Replace this with actual XML parsing in production
    try {
      console.log('Parsing Booking.com XML response');
      console.warn('WARNING: Using placeholder XML parser - implement proper parsing before production use');
      
      // Example mock booking for demonstration
      if (xmlData.includes('reservation')) {
        bookings.push({
          externalBookingId: 'BDC-' + Date.now(),
          guestName: 'Sample Guest',
          guestEmail: 'guest@booking.com',
          roomType: 'deluxe',
          checkIn: new Date().toISOString().split('T')[0],
          checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          totalAmount: 250,
          commission: 37.5,
          status: 'confirmed',
          rawData: { source: 'booking.com' }
        });
      }
    } catch (error) {
      console.error('Error parsing Booking.com XML:', error);
    }
    
    return bookings;
  }

  // ============ Extended Booking.com API Services ============

  /**
   * Property Management API - Create or update property details
   */
  async updateProperty(propertyData: any): Promise<boolean> {
    try {
      const endpoint = this.config.endpoint || 'https://supply-xml.booking.com/hotels/xml/property';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Authorization': `Basic ${Buffer.from(`${this.config.propertyId}:${this.config.apiKey}`).toString('base64')}`
        },
        body: this.buildPropertyRequest(propertyData)
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating property on Booking.com:', error);
      return false;
    }
  }

  /**
   * Rooms API - Manage room types and details
   */
  async updateRoomTypes(roomTypes: any[]): Promise<boolean> {
    try {
      const endpoint = this.config.endpoint || 'https://supply-xml.booking.com/hotels/xml/rooms';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Authorization': `Basic ${Buffer.from(`${this.config.propertyId}:${this.config.apiKey}`).toString('base64')}`
        },
        body: this.buildRoomTypesRequest(roomTypes)
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating room types on Booking.com:', error);
      return false;
    }
  }

  /**
   * Photos API - Upload property and room photos
   */
  async uploadPhoto(photoData: { type: 'property' | 'room', roomId?: string, photoUrl: string, caption?: string }): Promise<boolean> {
    try {
      const endpoint = this.config.endpoint || 'https://supply-xml.booking.com/hotels/xml/photos';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Authorization': `Basic ${Buffer.from(`${this.config.propertyId}:${this.config.apiKey}`).toString('base64')}`
        },
        body: this.buildPhotoUploadRequest(photoData)
      });

      return response.ok;
    } catch (error) {
      console.error('Error uploading photo to Booking.com:', error);
      return false;
    }
  }

  /**
   * Facilities API - Update property amenities and facilities
   */
  async updateFacilities(facilities: string[]): Promise<boolean> {
    try {
      const endpoint = this.config.endpoint || 'https://supply-xml.booking.com/hotels/xml/facilities';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Authorization': `Basic ${Buffer.from(`${this.config.propertyId}:${this.config.apiKey}`).toString('base64')}`
        },
        body: this.buildFacilitiesRequest(facilities)
      });

      return response.ok;
    } catch (error) {
      console.error('Error updating facilities on Booking.com:', error);
      return false;
    }
  }

  /**
   * Payments API - Retrieve payment and payout information
   */
  async getPayments(startDate: Date, endDate: Date): Promise<any[]> {
    try {
      const endpoint = this.config.endpoint || 'https://supply-xml.booking.com/hotels/xml/payments';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Authorization': `Basic ${Buffer.from(`${this.config.propertyId}:${this.config.apiKey}`).toString('base64')}`
        },
        body: this.buildPaymentsRequest(startDate, endDate)
      });

      if (!response.ok) {
        throw new Error(`Booking.com Payments API error: ${response.statusText}`);
      }

      const xmlData = await response.text();
      return this.parsePaymentsFromXML(xmlData);
    } catch (error) {
      console.error('Error fetching payments from Booking.com:', error);
      return [];
    }
  }

  /**
   * Reviews API - Fetch guest reviews
   */
  async getReviews(startDate?: Date, endDate?: Date): Promise<any[]> {
    try {
      const endpoint = this.config.endpoint || 'https://supply-xml.booking.com/hotels/xml/reviews';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Authorization': `Basic ${Buffer.from(`${this.config.propertyId}:${this.config.apiKey}`).toString('base64')}`
        },
        body: this.buildReviewsRequest(startDate, endDate)
      });

      if (!response.ok) {
        throw new Error(`Booking.com Reviews API error: ${response.statusText}`);
      }

      const xmlData = await response.text();
      return this.parseReviewsFromXML(xmlData);
    } catch (error) {
      console.error('Error fetching reviews from Booking.com:', error);
      return [];
    }
  }

  // ============ XML Request Builders ============

  private buildPropertyRequest(propertyData: any): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<request>
  <username>${this.config.propertyId}</username>
  <password>${this.config.apiKey}</password>
  <version>2.5</version>
  <property>
    <name>${propertyData.name || ''}</name>
    <address>${propertyData.address || ''}</address>
    <city>${propertyData.city || ''}</city>
    <country>${propertyData.country || ''}</country>
    <phone>${propertyData.phone || ''}</phone>
    <email>${propertyData.email || ''}</email>
  </property>
</request>`;
  }

  private buildRoomTypesRequest(roomTypes: any[]): string {
    const roomsXml = roomTypes.map(room => `
    <room>
      <id>${room.id}</id>
      <name>${room.name}</name>
      <max_persons>${room.maxPersons || 2}</max_persons>
      <smoking>${room.smoking ? 'yes' : 'no'}</smoking>
    </room>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<request>
  <username>${this.config.propertyId}</username>
  <password>${this.config.apiKey}</password>
  <version>2.5</version>
  <rooms>${roomsXml}
  </rooms>
</request>`;
  }

  private buildPhotoUploadRequest(photoData: any): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<request>
  <username>${this.config.propertyId}</username>
  <password>${this.config.apiKey}</password>
  <version>2.5</version>
  <photo>
    <type>${photoData.type}</type>
    ${photoData.roomId ? `<room_id>${photoData.roomId}</room_id>` : ''}
    <url>${photoData.photoUrl}</url>
    ${photoData.caption ? `<caption>${photoData.caption}</caption>` : ''}
  </photo>
</request>`;
  }

  private buildFacilitiesRequest(facilities: string[]): string {
    const facilitiesXml = facilities.map(f => `<facility>${f}</facility>`).join('');
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<request>
  <username>${this.config.propertyId}</username>
  <password>${this.config.apiKey}</password>
  <version>2.5</version>
  <facilities>${facilitiesXml}</facilities>
</request>`;
  }

  private buildPaymentsRequest(startDate: Date, endDate: Date): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<request>
  <username>${this.config.propertyId}</username>
  <password>${this.config.apiKey}</password>
  <version>2.5</version>
  <payments>
    <from>${startDate.toISOString().split('T')[0]}</from>
    <to>${endDate.toISOString().split('T')[0]}</to>
  </payments>
</request>`;
  }

  private buildReviewsRequest(startDate?: Date, endDate?: Date): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<request>
  <username>${this.config.propertyId}</username>
  <password>${this.config.apiKey}</password>
  <version>2.5</version>
  <reviews>
    ${startDate ? `<from>${startDate.toISOString().split('T')[0]}</from>` : ''}
    ${endDate ? `<to>${endDate.toISOString().split('T')[0]}</to>` : ''}
  </reviews>
</request>`;
  }

  // ============ XML Response Parsers ============

  private parsePaymentsFromXML(xmlData: string): any[] {
    // Placeholder - implement proper XML parsing in production
    console.warn('WARNING: Using placeholder XML parser for payments');
    return [];
  }

  private parseReviewsFromXML(xmlData: string): any[] {
    // Placeholder - implement proper XML parsing in production
    console.warn('WARNING: Using placeholder XML parser for reviews');
    return [];
  }
}
