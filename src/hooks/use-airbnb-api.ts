import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface AirbnbConfig {
  propertyId: string;
  apiKey: string;
  apiSecret: string;
  endpoint?: string;
}

export interface ListingData {
  name: string;
  description: string;
  propertyType: string;
  roomType: string;
  accommodates: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
}

export interface PricingRules {
  basePrice: number;
  weekendPrice?: number;
  monthlyDiscount?: number;
  weeklyDiscount?: number;
  cleaningFee?: number;
  extraPersonFee?: number;
}

export function useAirbnbAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateListing = useCallback(async (config: AirbnbConfig, listingData: ListingData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/channels/airbnb/listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, listingData })
      });

      if (!response.ok) {
        throw new Error('Failed to update listing');
      }

      const result = await response.json();
      toast.success('Listing updated successfully on Airbnb');
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

  const uploadPhoto = useCallback(async (config: AirbnbConfig, photoUrl: string, caption?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/channels/airbnb/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, photoUrl, caption })
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      const result = await response.json();
      toast.success('Photo uploaded successfully to Airbnb');
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

  const sendMessage = useCallback(async (config: AirbnbConfig, reservationId: string, message: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/channels/airbnb/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, reservationId, message })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();
      toast.success('Message sent successfully');
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

  const getMessages = useCallback(async (config: AirbnbConfig, reservationId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        config: JSON.stringify(config)
      });

      const response = await fetch(`/api/channels/airbnb/messages/${reservationId}?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const messages = await response.json();
      return messages;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getReviews = useCallback(async (config: AirbnbConfig) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        config: JSON.stringify(config)
      });

      const response = await fetch(`/api/channels/airbnb/reviews?${params.toString()}`);

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

  const respondToReview = useCallback(async (config: AirbnbConfig, reviewId: string, response: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetch(`/api/channels/airbnb/reviews/${reviewId}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, response })
      });

      if (!result.ok) {
        throw new Error('Failed to respond to review');
      }

      const data = await result.json();
      toast.success('Review response posted successfully');
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePricing = useCallback(async (config: AirbnbConfig, pricingRules: PricingRules) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/channels/airbnb/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, pricingRules })
      });

      if (!response.ok) {
        throw new Error('Failed to update pricing');
      }

      const result = await response.json();
      toast.success('Pricing rules updated successfully on Airbnb');
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

  const getCalendar = useCallback(async (config: AirbnbConfig, startDate: Date, endDate: Date) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        config: JSON.stringify(config),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      const response = await fetch(`/api/channels/airbnb/calendar?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch calendar');
      }

      const calendar = await response.json();
      return calendar;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getAnalytics = useCallback(async (config: AirbnbConfig, startDate: Date, endDate: Date) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        config: JSON.stringify(config),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      const response = await fetch(`/api/channels/airbnb/analytics?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const analytics = await response.json();
      return analytics;
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
    updateListing,
    uploadPhoto,
    sendMessage,
    getMessages,
    getReviews,
    respondToReview,
    updatePricing,
    getCalendar,
    getAnalytics
  };
}
