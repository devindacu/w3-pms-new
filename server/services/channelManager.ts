import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export interface ChannelConfig {
  apiKey?: string;
  apiSecret?: string;
  propertyId: string;
  endpoint?: string;
  hotelId?: string;
}

export interface BookingData {
  externalBookingId: string;
  guestName: string;
  guestEmail: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  commission?: number;
  status: string;
  rawData?: any;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsSuccess: number;
  recordsFailed: number;
  errors?: string[];
}

export abstract class ChannelManagerService {
  protected channelName: string;
  protected config: ChannelConfig;

  constructor(channelName: string, config: ChannelConfig) {
    this.channelName = channelName;
    this.config = config;
  }

  abstract fetchBookings(startDate: Date, endDate: Date): Promise<BookingData[]>;
  abstract syncAvailability(roomType: string, date: Date, available: number): Promise<boolean>;
  abstract syncRates(roomType: string, date: Date, rate: number): Promise<boolean>;
  abstract updateBookingStatus(externalBookingId: string, status: string): Promise<boolean>;

  async syncBookingsToDatabase(bookings: BookingData[], channelId: number): Promise<SyncResult> {
    const startTime = Date.now();
    let recordsProcessed = 0;
    let recordsSuccess = 0;
    let recordsFailed = 0;
    const errors: string[] = [];

    try {
      for (const booking of bookings) {
        recordsProcessed++;
        try {
          // Check if booking already exists
          const existing = await db.query.channelBookings.findFirst({
            where: and(
              eq(schema.channelBookings.externalBookingId, booking.externalBookingId),
              eq(schema.channelBookings.channelName, this.channelName)
            )
          });

          if (existing) {
            // Update existing booking
            await db.update(schema.channelBookings)
              .set({
                guestName: booking.guestName,
                guestEmail: booking.guestEmail,
                roomType: booking.roomType,
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                totalAmount: booking.totalAmount.toString(),
                commission: booking.commission?.toString(),
                status: booking.status,
                syncStatus: 'synced',
                rawData: JSON.stringify(booking.rawData),
                updatedAt: new Date()
              })
              .where(eq(schema.channelBookings.id, existing.id));
          } else {
            // Create new booking
            await db.insert(schema.channelBookings).values({
              channelId,
              externalBookingId: booking.externalBookingId,
              channelName: this.channelName,
              guestName: booking.guestName,
              guestEmail: booking.guestEmail,
              roomType: booking.roomType,
              checkIn: booking.checkIn,
              checkOut: booking.checkOut,
              totalAmount: booking.totalAmount.toString(),
              commission: booking.commission?.toString(),
              status: booking.status,
              syncStatus: 'synced',
              rawData: JSON.stringify(booking.rawData)
            });
          }
          recordsSuccess++;
        } catch (error) {
          recordsFailed++;
          errors.push(`Failed to sync booking ${booking.externalBookingId}: ${error}`);
        }
      }

      // Log sync operation
      const duration = Math.floor((Date.now() - startTime) / 1000);
      await db.insert(schema.channelSyncLogs).values({
        channelId,
        channelName: this.channelName,
        syncType: 'bookings',
        status: recordsFailed > 0 ? 'partial' : 'success',
        recordsProcessed,
        recordsSuccess,
        recordsFailed,
        errorMessage: errors.length > 0 ? errors.join('; ') : undefined,
        completedAt: new Date(),
        duration
      });

      return {
        success: recordsFailed === 0,
        recordsProcessed,
        recordsSuccess,
        recordsFailed,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      await db.insert(schema.channelSyncLogs).values({
        channelId,
        channelName: this.channelName,
        syncType: 'bookings',
        status: 'error',
        recordsProcessed,
        recordsSuccess,
        recordsFailed,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
        duration
      });

      throw error;
    }
  }

  async logSyncOperation(
    channelId: number,
    syncType: string,
    status: string,
    recordsProcessed: number,
    errorMessage?: string
  ): Promise<void> {
    await db.insert(schema.channelSyncLogs).values({
      channelId,
      channelName: this.channelName,
      syncType,
      status,
      recordsProcessed,
      recordsSuccess: status === 'success' ? recordsProcessed : 0,
      recordsFailed: status === 'error' ? recordsProcessed : 0,
      errorMessage,
      completedAt: new Date()
    });
  }
}
