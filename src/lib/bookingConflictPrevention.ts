/**
 * Booking Conflict Prevention System
 * Prevents double bookings and overlapping reservations
 */

import { db } from '../server/db';
import * as schema from '../shared/schema';
import { eq, and, or, gte, lte, between } from 'drizzle-orm';

export interface BookingConflict {
  hasConflict: boolean;
  conflictingReservations: Array<{
    id: number;
    guestName: string;
    checkIn: string;
    checkOut: string;
    confirmationNumber: string;
    status: string;
  }>;
  message?: string;
}

export interface BookingValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Check for booking conflicts before creating/updating a reservation
 */
export async function checkBookingConflicts(
  roomId: number,
  checkInDate: string,
  checkOutDate: string,
  excludeReservationId?: number
): Promise<BookingConflict> {
  try {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Query for overlapping reservations
    // A reservation overlaps if:
    // (new_checkin < existing_checkout) AND (new_checkout > existing_checkin)
    const conflictingReservations = await db
      .select()
      .from(schema.reservations)
      .where(
        and(
          eq(schema.reservations.roomId, roomId),
          // Exclude cancelled and no-show reservations
          or(
            eq(schema.reservations.status, 'pending'),
            eq(schema.reservations.status, 'confirmed'),
            eq(schema.reservations.status, 'checked-in')
          ),
          // Date overlap condition
          and(
            lte(schema.reservations.checkInDate, checkOut.toISOString()),
            gte(schema.reservations.checkOutDate, checkIn.toISOString())
          ),
          // Exclude current reservation if updating
          excludeReservationId
            ? ne(schema.reservations.id, excludeReservationId)
            : undefined
        )
      );

    const hasConflict = conflictingReservations.length > 0;

    if (hasConflict) {
      // Fetch guest details for conflicting reservations
      const conflicts = await Promise.all(
        conflictingReservations.map(async (res) => {
          const guest = await db
            .select()
            .from(schema.guests)
            .where(eq(schema.guests.id, res.guestId))
            .limit(1);

          return {
            id: res.id,
            guestName: guest[0]
              ? `${guest[0].firstName} ${guest[0].lastName}`
              : 'Unknown',
            checkIn: res.checkInDate,
            checkOut: res.checkOutDate,
            confirmationNumber: res.confirmationNumber || '',
            status: res.status,
          };
        })
      );

      return {
        hasConflict: true,
        conflictingReservations: conflicts,
        message: `Room is already booked for ${conflicts.length} overlapping reservation(s)`,
      };
    }

    return {
      hasConflict: false,
      conflictingReservations: [],
    };
  } catch (error) {
    console.error('Error checking booking conflicts:', error);
    throw new Error('Failed to check booking conflicts');
  }
}

/**
 * Validate booking dates and details
 */
export function validateBooking(
  checkInDate: string,
  checkOutDate: string,
  numberOfGuests: number,
  maxOccupancy?: number
): BookingValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Reset to start of day

  // Date validation
  if (isNaN(checkIn.getTime())) {
    errors.push('Invalid check-in date');
  }

  if (isNaN(checkOut.getTime())) {
    errors.push('Invalid check-out date');
  }

  if (checkIn >= checkOut) {
    errors.push('Check-out date must be after check-in date');
  }

  if (checkIn < now) {
    errors.push('Check-in date cannot be in the past');
  }

  // Calculate stay duration
  const stayDuration = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (stayDuration > 365) {
    errors.push('Stay duration cannot exceed 365 days');
  }

  if (stayDuration > 30) {
    warnings.push('Long stay detected (more than 30 days)');
  }

  // Guest count validation
  if (numberOfGuests < 1) {
    errors.push('Number of guests must be at least 1');
  }

  if (maxOccupancy && numberOfGuests > maxOccupancy) {
    errors.push(
      `Number of guests (${numberOfGuests}) exceeds room capacity (${maxOccupancy})`
    );
  }

  // Early check-in warning (less than 24 hours)
  const hoursUntilCheckIn = (checkIn.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntilCheckIn < 24 && hoursUntilCheckIn > 0) {
    warnings.push('Same-day or next-day booking - verify room availability');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get room availability for a date range
 */
export async function getRoomAvailability(
  startDate: string,
  endDate: string,
  roomType?: string
): Promise<
  Array<{
    roomId: number;
    roomNumber: string;
    roomType: string;
    isAvailable: boolean;
    blockedDates: string[];
  }>
> {
  try {
    // Fetch all rooms (or filtered by type)
    const rooms = roomType
      ? await db
          .select()
          .from(schema.rooms)
          .where(eq(schema.rooms.roomType, roomType))
      : await db.select().from(schema.rooms);

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check availability for each room
    const availability = await Promise.all(
      rooms.map(async (room) => {
        const conflicts = await checkBookingConflicts(
          room.id,
          startDate,
          endDate
        );

        return {
          roomId: room.id,
          roomNumber: room.roomNumber,
          roomType: room.roomType,
          isAvailable: !conflicts.hasConflict,
          blockedDates: conflicts.conflictingReservations.map(
            (r) => `${r.checkIn} to ${r.checkOut}`
          ),
        };
      })
    );

    return availability;
  } catch (error) {
    console.error('Error getting room availability:', error);
    throw new Error('Failed to get room availability');
  }
}

/**
 * Suggest alternative rooms if primary choice is unavailable
 */
export async function suggestAlternativeRooms(
  preferredRoomType: string,
  checkInDate: string,
  checkOutDate: string,
  numberOfGuests: number
): Promise<
  Array<{
    roomId: number;
    roomNumber: string;
    roomType: string;
    maxOccupancy: number;
    baseRate: number;
    amenities: string[];
  }>
> {
  try {
    // Get all available rooms
    const availability = await getRoomAvailability(
      checkInDate,
      checkOutDate,
      preferredRoomType
    );

    const availableRoomIds = availability
      .filter((a) => a.isAvailable)
      .map((a) => a.roomId);

    if (availableRoomIds.length === 0) {
      // Try other room types
      const allAvailability = await getRoomAvailability(
        checkInDate,
        checkOutDate
      );
      const otherAvailableIds = allAvailability
        .filter((a) => a.isAvailable)
        .map((a) => a.roomId);

      if (otherAvailableIds.length === 0) {
        return [];
      }

      // Fetch room details for alternatives
      const alternatives = await db
        .select()
        .from(schema.rooms)
        .where(
          and(
            inArray(schema.rooms.id, otherAvailableIds),
            gte(schema.rooms.maxOccupancy, numberOfGuests)
          )
        );

      return alternatives.map((room) => ({
        roomId: room.id,
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        maxOccupancy: room.maxOccupancy,
        baseRate: room.baseRate,
        amenities: room.amenities || [],
      }));
    }

    // Fetch details for available rooms of preferred type
    const rooms = await db
      .select()
      .from(schema.rooms)
      .where(
        and(
          inArray(schema.rooms.id, availableRoomIds),
          gte(schema.rooms.maxOccupancy, numberOfGuests)
        )
      );

    return rooms.map((room) => ({
      roomId: room.id,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      maxOccupancy: room.maxOccupancy,
      baseRate: room.baseRate,
      amenities: room.amenities || [],
    }));
  } catch (error) {
    console.error('Error suggesting alternative rooms:', error);
    throw new Error('Failed to suggest alternative rooms');
  }
}

// Note: These helper functions are placeholders for drizzle-orm operators
// In production, import { ne, inArray } from 'drizzle-orm' if available
// or use proper drizzle-orm filter syntax to avoid SQL injection risks
// Current implementation is for demonstration only and should be replaced
// with proper drizzle-orm operators before production use
