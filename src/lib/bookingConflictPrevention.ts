/**
 * Booking Conflict Prevention System
 * Client-side implementation for preventing double bookings
 */

import type { Reservation, Room } from './types'

export interface BookingConflict {
  hasConflict: boolean;
  conflictingReservations: Array<{
    id: string;
    guestName: string;
    checkIn: number;
    checkOut: number;
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
export function checkBookingConflicts(
  roomId: string,
  checkInDate: number,
  checkOutDate: number,
  reservations: Reservation[],
  excludeReservationId?: string
): BookingConflict {
  const activeStatuses = ['confirmed', 'checked-in']

  const conflictingReservations = reservations.filter(res => {
    if (excludeReservationId && res.id === excludeReservationId) return false
    if (res.roomId !== roomId) return false
    if (!activeStatuses.includes(res.status)) return false
    // Date overlap: new_checkin < existing_checkout AND new_checkout > existing_checkin
    return checkInDate < res.checkOutDate && checkOutDate > res.checkInDate
  })

  const hasConflict = conflictingReservations.length > 0

  if (hasConflict) {
    return {
      hasConflict: true,
      conflictingReservations: conflictingReservations.map(res => ({
        id: res.id,
        guestName: `Guest: ${res.guestId}`,
        checkIn: res.checkInDate,
        checkOut: res.checkOutDate,
        confirmationNumber: res.id,
        status: res.status,
      })),
      message: `Room is already booked for ${conflictingReservations.length} overlapping reservation(s)`,
    }
  }

  return {
    hasConflict: false,
    conflictingReservations: [],
  }
}

/**
 * Validate booking dates and details
 */
export function validateBooking(
  checkInDate: number,
  checkOutDate: number,
  numberOfGuests: number,
  maxOccupancy?: number
): BookingValidation {
  const errors: string[] = []
  const warnings: string[] = []

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  if (!checkInDate || isNaN(checkInDate)) {
    errors.push('Invalid check-in date')
  }

  if (!checkOutDate || isNaN(checkOutDate)) {
    errors.push('Invalid check-out date')
  }

  if (checkInDate >= checkOutDate) {
    errors.push('Check-out date must be after check-in date')
  }

  if (checkInDate < now.getTime()) {
    errors.push('Check-in date cannot be in the past')
  }

  const stayDuration = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))

  if (stayDuration > 365) {
    errors.push('Stay duration cannot exceed 365 days')
  }

  if (stayDuration > 30) {
    warnings.push('Long stay detected (more than 30 days)')
  }

  if (numberOfGuests < 1) {
    errors.push('Number of guests must be at least 1')
  }

  if (maxOccupancy && numberOfGuests > maxOccupancy) {
    errors.push(`Number of guests (${numberOfGuests}) exceeds room capacity (${maxOccupancy})`)
  }

  const hoursUntilCheckIn = (checkInDate - Date.now()) / (1000 * 60 * 60)
  if (hoursUntilCheckIn < 24 && hoursUntilCheckIn > 0) {
    warnings.push('Same-day or next-day booking - verify room availability')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Get room availability for a date range
 */
export function getRoomAvailability(
  rooms: Room[],
  reservations: Reservation[],
  startDate: number,
  endDate: number,
  roomType?: string
): Array<{
  roomId: string;
  roomNumber: string;
  roomType: string;
  isAvailable: boolean;
  blockedDates: string[];
}> {
  const filteredRooms = roomType
    ? rooms.filter(r => r.roomType === roomType)
    : rooms

  return filteredRooms.map(room => {
    const conflicts = checkBookingConflicts(room.id, startDate, endDate, reservations)
    return {
      roomId: room.id,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      isAvailable: !conflicts.hasConflict,
      blockedDates: conflicts.conflictingReservations.map(
        r => `${new Date(r.checkIn).toLocaleDateString()} to ${new Date(r.checkOut).toLocaleDateString()}`
      ),
    }
  })
}

/**
 * Suggest alternative rooms if primary choice is unavailable
 */
export function suggestAlternativeRooms(
  rooms: Room[],
  reservations: Reservation[],
  preferredRoomType: string,
  checkInDate: number,
  checkOutDate: number,
  numberOfGuests: number
): Array<{
  roomId: string;
  roomNumber: string;
  roomType: string;
  maxOccupancy: number;
  baseRate: number;
  amenities: string[];
}> {
  const availability = getRoomAvailability(rooms, reservations, checkInDate, checkOutDate, preferredRoomType)
  let availableRooms = availability.filter(a => a.isAvailable)

  if (availableRooms.length === 0) {
    const allAvailability = getRoomAvailability(rooms, reservations, checkInDate, checkOutDate)
    availableRooms = allAvailability.filter(a => a.isAvailable)
  }

  const availableRoomIds = new Set(availableRooms.map(a => a.roomId))

  return rooms
    .filter(r => availableRoomIds.has(r.id) && r.maxOccupancy >= numberOfGuests)
    .map(room => ({
      roomId: room.id,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      maxOccupancy: room.maxOccupancy,
      baseRate: room.baseRate,
      amenities: room.amenities || [],
    }))
}
