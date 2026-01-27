import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

export interface SyncQueueItem {
  entityType: string;
  entityId: number;
  operation: 'create' | 'update' | 'delete';
  data: any;
}

export class DataSyncService {
  private processingInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;

  /**
   * Add item to sync queue
   */
  async queueSync(item: SyncQueueItem): Promise<void> {
    await db.insert(schema.dataSyncQueue).values({
      entityType: item.entityType,
      entityId: item.entityId,
      operation: item.operation,
      data: JSON.stringify(item.data),
      status: 'pending'
    });
  }

  /**
   * Process pending sync queue items
   */
  async processSyncQueue(): Promise<void> {
    if (this.isProcessing) {
      return; // Already processing
    }

    this.isProcessing = true;

    try {
      // Get pending items
      const pendingItems = await db.query.dataSyncQueue.findMany({
        where: eq(schema.dataSyncQueue.status, 'pending'),
        limit: 100
      });

      for (const item of pendingItems) {
        try {
          await this.processSyncItem(item);
          
          // Mark as processed
          await db.update(schema.dataSyncQueue)
            .set({
              status: 'completed',
              processedAt: new Date()
            })
            .where(eq(schema.dataSyncQueue.id, item.id));
        } catch (error) {
          // Update retry count and error
          const retryCount = (item.retryCount || 0) + 1;
          const status = retryCount >= 3 ? 'failed' : 'pending';
          
          await db.update(schema.dataSyncQueue)
            .set({
              status,
              retryCount,
              lastError: error instanceof Error ? error.message : 'Unknown error'
            })
            .where(eq(schema.dataSyncQueue.id, item.id));
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process individual sync item
   */
  private async processSyncItem(item: any): Promise<void> {
    const data = item.data ? JSON.parse(item.data) : {};
    
    switch (item.entityType) {
      case 'reservation':
        await this.syncReservation(item.entityId, item.operation, data);
        break;
      case 'room':
        await this.syncRoom(item.entityId, item.operation, data);
        break;
      case 'guest':
        await this.syncGuest(item.entityId, item.operation, data);
        break;
      // Add more entity types as needed
      default:
        console.warn(`Unknown entity type: ${item.entityType}`);
    }
  }

  /**
   * Sync reservation data
   */
  private async syncReservation(id: number, operation: string, data: any): Promise<void> {
    // Get the reservation
    const reservation = await db.query.reservations.findFirst({
      where: eq(schema.reservations.id, id)
    });

    if (!reservation) {
      throw new Error(`Reservation ${id} not found`);
    }

    // Sync to channel bookings if it came from a channel
    if (reservation.source && ['booking.com', 'agoda', 'expedia', 'airbnb'].includes(reservation.source)) {
      await this.syncToChannelBooking(reservation);
    }

    // Update room status if needed
    if (operation === 'create' || operation === 'update') {
      await this.updateRoomStatus(reservation.roomId!, reservation.status!);
    }
  }

  /**
   * Sync room data
   */
  private async syncRoom(id: number, operation: string, data: any): Promise<void> {
    const room = await db.query.rooms.findFirst({
      where: eq(schema.rooms.id, id)
    });

    if (!room) {
      throw new Error(`Room ${id} not found`);
    }

    // Sync availability to channels
    // This would call channel manager APIs to update availability
  }

  /**
   * Sync guest data
   */
  private async syncGuest(id: number, operation: string, data: any): Promise<void> {
    const guest = await db.query.guests.findFirst({
      where: eq(schema.guests.id, id)
    });

    if (!guest) {
      throw new Error(`Guest ${id} not found`);
    }

    // Update loyalty points, tier, etc.
    if (operation === 'update') {
      await this.updateGuestLoyalty(guest);
    }
  }

  /**
   * Sync reservation to channel booking
   */
  private async syncToChannelBooking(reservation: any): Promise<void> {
    // Check if channel booking exists
    const existingBooking = await db.query.channelBookings.findFirst({
      where: and(
        eq(schema.channelBookings.reservationId, reservation.id),
        eq(schema.channelBookings.channelName, reservation.source)
      )
    });

    const bookingData = {
      reservationId: reservation.id,
      channelName: reservation.source,
      guestName: '', // Would be populated from guest data
      guestEmail: '',
      roomType: reservation.roomId?.toString() || '',
      checkIn: reservation.checkInDate,
      checkOut: reservation.checkOutDate,
      totalAmount: reservation.totalAmount || '0',
      status: reservation.status || 'confirmed',
      syncStatus: 'synced',
      updatedAt: new Date()
    };

    if (existingBooking) {
      await db.update(schema.channelBookings)
        .set(bookingData)
        .where(eq(schema.channelBookings.id, existingBooking.id));
    } else {
      await db.insert(schema.channelBookings).values(bookingData);
    }
  }

  /**
   * Update room status based on reservation
   */
  private async updateRoomStatus(roomId: number, reservationStatus: string): Promise<void> {
    let roomStatus = 'available';
    
    switch (reservationStatus) {
      case 'confirmed':
      case 'checked-in':
        roomStatus = 'occupied';
        break;
      case 'checked-out':
      case 'cancelled':
        roomStatus = 'available';
        break;
    }

    await db.update(schema.rooms)
      .set({ status: roomStatus, updatedAt: new Date() })
      .where(eq(schema.rooms.id, roomId));
  }

  /**
   * Update guest loyalty information
   */
  private async updateGuestLoyalty(guest: any): Promise<void> {
    // Calculate loyalty points based on spending
    const totalSpent = parseFloat(guest.totalSpent || '0');
    const loyaltyPoints = Math.floor(totalSpent / 10); // 1 point per $10 spent

    // Determine tier
    let tier = 'Bronze';
    if (loyaltyPoints >= 1000) tier = 'Platinum';
    else if (loyaltyPoints >= 500) tier = 'Gold';
    else if (loyaltyPoints >= 200) tier = 'Silver';

    await db.update(schema.guests)
      .set({
        loyaltyPoints,
        loyaltyTier: tier,
        updatedAt: new Date()
      })
      .where(eq(schema.guests.id, guest.id));
  }

  /**
   * Start automatic sync processing
   * @param intervalMs - Interval in milliseconds (default: 60000 = 1 minute)
   *                     Note: 30 seconds may be too aggressive for production
   */
  startAutoSync(intervalMs: number = 60000): void {
    if (this.processingInterval) {
      this.stopAutoSync();
    }

    this.processingInterval = setInterval(() => {
      this.processSyncQueue().catch(console.error);
    }, intervalMs);
  }

  /**
   * Stop automatic sync processing
   */
  stopAutoSync(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  /**
   * Get sync queue status
   */
  async getSyncQueueStatus(): Promise<any> {
    const pending = await db.query.dataSyncQueue.findMany({
      where: eq(schema.dataSyncQueue.status, 'pending')
    });

    const failed = await db.query.dataSyncQueue.findMany({
      where: eq(schema.dataSyncQueue.status, 'failed')
    });

    return {
      pendingCount: pending.length,
      failedCount: failed.length,
      isProcessing: this.isProcessing
    };
  }
}
