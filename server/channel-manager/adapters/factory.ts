/**
 * OTA Adapter Factory
 * 
 * Creates and caches adapter instances for each channel.
 * Loads configuration from the database channels table.
 */

import { db } from '../../db';
import * as schema from '../../../shared/schema';
import { eq } from 'drizzle-orm';
import { BaseOTAAdapter, OTAConfig, DEFAULT_CURRENCY } from './base-adapter';
import { BookingComAdapter } from './booking-com';
import { ExpediaAdapter } from './expedia';
import { AgodaAdapter } from './agoda';
import { AirbnbAdapter } from './airbnb';

export type OTAChannelName = 'booking.com' | 'expedia' | 'agoda' | 'airbnb';

const CHANNEL_NAME_MAP: Record<string, OTAChannelName> = {
  'booking.com': 'booking.com',
  'booking': 'booking.com',
  'expedia': 'expedia',
  'agoda': 'agoda',
  'airbnb': 'airbnb',
};

// Adapter cache to avoid re-instantiation
const adapterCache = new Map<number, BaseOTAAdapter>();

export function createAdapter(channelName: OTAChannelName, config: OTAConfig): BaseOTAAdapter {
  const normalizedName = CHANNEL_NAME_MAP[channelName.toLowerCase()] ?? channelName;

  switch (normalizedName) {
    case 'booking.com':
      return new BookingComAdapter(config);
    case 'expedia':
      return new ExpediaAdapter(config);
    case 'agoda':
      return new AgodaAdapter(config);
    case 'airbnb':
      return new AirbnbAdapter(config);
    default:
      throw new Error(`Unsupported OTA channel: ${channelName}`);
  }
}

/**
 * Load adapter from database channel configuration.
 * Parses connectionDetails JSON for API credentials.
 */
export async function getAdapterForChannel(channelId: number): Promise<BaseOTAAdapter> {
  if (adapterCache.has(channelId)) {
    return adapterCache.get(channelId)!;
  }

  const rows = await db.select()
    .from(schema.channels)
    .where(eq(schema.channels.id, channelId))
    .limit(1);

  if (!rows.length) {
    throw new Error(`Channel ${channelId} not found`);
  }

  const channel = rows[0];
  if (!channel.isActive) {
    throw new Error(`Channel ${channel.name} (${channelId}) is inactive`);
  }

  let connectionDetails: Record<string, string> = {};
  try {
    connectionDetails = JSON.parse(channel.connectionDetails ?? '{}');
  } catch {
    throw new Error(`Channel ${channelId} has invalid connection details`);
  }

  const config: OTAConfig = {
    channelId: channel.id,
    channelName: channel.name,
    apiKey: connectionDetails.apiKey ?? '',
    apiSecret: connectionDetails.apiSecret,
    propertyId: connectionDetails.propertyId ?? '',
    hotelId: connectionDetails.hotelId,
    endpoint: connectionDetails.endpoint,
    webhookSecret: connectionDetails.webhookSecret,
    currency: connectionDetails.currency ?? DEFAULT_CURRENCY,
    timeoutMs: connectionDetails.timeoutMs ? parseInt(connectionDetails.timeoutMs) : 30_000,
    maxRetries: connectionDetails.maxRetries ? parseInt(connectionDetails.maxRetries) : 3,
  };

  const channelType = channel.type?.toLowerCase() ?? '';
  const normalizedName = CHANNEL_NAME_MAP[channelType] ?? (channelType as OTAChannelName);
  const adapter = createAdapter(normalizedName, config);

  adapterCache.set(channelId, adapter);
  return adapter;
}

/**
 * Get all active channel adapters.
 */
export async function getAllActiveAdapters(): Promise<Map<number, BaseOTAAdapter>> {
  const channels = await db.select().from(schema.channels);
  const active = channels.filter(c => c.isActive);
  const adapters = new Map<number, BaseOTAAdapter>();

  for (const channel of active) {
    try {
      const adapter = await getAdapterForChannel(channel.id);
      adapters.set(channel.id, adapter);
    } catch (err) {
      console.error(`[AdapterFactory] Failed to create adapter for channel ${channel.id} (${channel.name}):`, err);
    }
  }

  return adapters;
}

/**
 * Invalidate cached adapter (after config update).
 */
export function invalidateAdapterCache(channelId?: number): void {
  if (channelId) {
    adapterCache.delete(channelId);
  } else {
    adapterCache.clear();
  }
}
