import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface AgodaConfig {
  propertyId: string;
  apiKey: string;
  apiSecret: string;
  endpoint?: string;
}

export interface AgodaPropertyData {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface AgodaRoomData {
  id: string;
  name: string;
  description?: string;
  maxOccupancy: number;
  bedType?: string;
  roomSize?: number;
  smokingAllowed: boolean;
}

export interface AgodaRateData {
  roomId: string;
  date: string;
  baseRate: number;
  currency: string;
  availability: number;
  minStay?: number;
  maxStay?: number;
  closedToArrival?: boolean;
  closedToDeparture?: boolean;
}

export interface AgodaBookingData {
  bookingId: string;
  propertyId: string;
  guestName: string;
  guestEmail?: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  totalAmount: number;
  currency: string;
  status: string;
  specialRequests?: string;
}

export interface AgodaInventoryUpdate {
  roomId: string;
  date: string;
  availability: number;
  rate: number;
  currency: string;
}

export function useAgodaAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProperty = useCallback(async (config: AgodaConfig, propertyData: AgodaPropertyData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/channels/agoda/property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, propertyData })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update property');
      }

      const result = await response.json();
      toast.success('Property updated successfully on Agoda');
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRooms = useCallback(async (config: AgodaConfig, rooms: AgodaRoomData[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/channels/agoda/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, rooms })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update rooms');
      }

      const result = await response.json();
      toast.success('Rooms updated successfully on Agoda');
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRates = useCallback(async (config: AgodaConfig, rates: AgodaRateData[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/channels/agoda/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, rates })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update rates');
      }

      const result = await response.json();
      toast.success('Rates updated successfully on Agoda');
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateInventory = useCallback(async (config: AgodaConfig, inventory: AgodaInventoryUpdate[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/channels/agoda/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, inventory })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update inventory');
      }

      const result = await response.json();
      toast.success('Inventory updated successfully on Agoda');
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBookings = useCallback(async (config: AgodaConfig, startDate: Date, endDate: Date) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/channels/agoda/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          config, 
          startDate: startDate.toISOString(), 
          endDate: endDate.toISOString() 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch bookings');
      }

      const bookings = await response.json();
      return bookings as AgodaBookingData[];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getReviews = useCallback(async (config: AgodaConfig, startDate?: Date, endDate?: Date) => {
    setLoading(true);
    setError(null);
    
    try {
      const params: any = { config };
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();

      const response = await fetch('/api/channels/agoda/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch reviews');
      }

      const reviews = await response.json();
      return reviews;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const syncAvailability = useCallback(async (config: AgodaConfig, roomId: string, startDate: Date, endDate: Date) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/channels/agoda/sync-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          config, 
          roomId,
          startDate: startDate.toISOString(), 
          endDate: endDate.toISOString() 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sync availability');
      }

      const result = await response.json();
      toast.success('Availability synced successfully with Agoda');
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    updateProperty,
    updateRooms,
    updateRates,
    updateInventory,
    getBookings,
    getReviews,
    syncAvailability
  };
}
