import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface BookingComConfig {
  propertyId: string;
  apiKey: string;
  endpoint?: string;
}

export interface PropertyData {
  name?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
}

export interface RoomTypeData {
  id: string;
  name: string;
  maxPersons: number;
  smoking: boolean;
}

export interface PhotoData {
  type: 'property' | 'room';
  roomId?: string;
  photoUrl: string;
  caption?: string;
}

export function useBookingComAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProperty = useCallback(async (config: BookingComConfig, propertyData: PropertyData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/channels/booking-com/property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, propertyData })
      });

      if (!response.ok) {
        throw new Error('Failed to update property');
      }

      const result = await response.json();
      toast.success('Property updated successfully on Booking.com');
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

  const updateRoomTypes = useCallback(async (config: BookingComConfig, roomTypes: RoomTypeData[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/channels/booking-com/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, roomTypes })
      });

      if (!response.ok) {
        throw new Error('Failed to update room types');
      }

      const result = await response.json();
      toast.success('Room types updated successfully on Booking.com');
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

  const uploadPhoto = useCallback(async (config: BookingComConfig, photoData: PhotoData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/channels/booking-com/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, photoData })
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      const result = await response.json();
      toast.success('Photo uploaded successfully to Booking.com');
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

  const updateFacilities = useCallback(async (config: BookingComConfig, facilities: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/channels/booking-com/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, facilities })
      });

      if (!response.ok) {
        throw new Error('Failed to update facilities');
      }

      const result = await response.json();
      toast.success('Facilities updated successfully on Booking.com');
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

  const getPayments = useCallback(async (config: BookingComConfig, startDate: Date, endDate: Date) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/channels/booking-com/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          config, 
          startDate: startDate.toISOString(), 
          endDate: endDate.toISOString() 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const payments = await response.json();
      return payments;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getReviews = useCallback(async (config: BookingComConfig, startDate?: Date, endDate?: Date) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        config: JSON.stringify(config)
      });
      
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const response = await fetch(`/api/channels/booking-com/reviews?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
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

  return {
    loading,
    error,
    updateProperty,
    updateRoomTypes,
    uploadPhoto,
    updateFacilities,
    getPayments,
    getReviews
  };
}
