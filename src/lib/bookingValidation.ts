import type { Reservation, Room } from './types'

export interface BookingConflict {
  hasConflict: boolean
  conflictingReservations: Reservation[]
  message?: string
  severity: 'none' | 'warning' | 'error'
}

export interface AlternativeRoom {
  room: Room
  distance: number // how similar to requested room (lower is better)
  availableFrom: number
  availableTo: number
}

/**
 * Check if a booking conflicts with existing reservations
 * 
 * @param roomId - The room to check
 * @param checkIn - Check-in date timestamp
 * @param checkOut - Check-out date timestamp
 * @param reservations - All existing reservations
 * @param excludeReservationId - Optional reservation ID to exclude (for editing existing reservations)
 * @returns BookingConflict object with details
 */
export function checkBookingConflict(
  roomId: string,
  checkIn: number,
  checkOut: number,
  reservations: Reservation[],
  excludeReservationId?: string
): BookingConflict {
  // Filter reservations for this room, excluding the one being edited
  const roomReservations = reservations.filter(r => 
    r.roomId === roomId && 
    r.id !== excludeReservationId &&
    // Only check confirmed and checked-in reservations
    (r.status === 'confirmed' || r.status === 'checked-in')
  )

  // Check for date overlaps
  const conflicts = roomReservations.filter(r => {
    // Two reservations overlap if:
    // 1. New check-in is before existing check-out AND new check-out is after existing check-in
    const overlap = checkIn < r.checkOutDate && checkOut > r.checkInDate
    return overlap
  })

  if (conflicts.length === 0) {
    return {
      hasConflict: false,
      conflictingReservations: [],
      severity: 'none'
    }
  }

  // Generate helpful message
  const conflictDates = conflicts.map(r => 
    `${new Date(r.checkInDate).toLocaleDateString()} - ${new Date(r.checkOutDate).toLocaleDateString()}`
  ).join(', ')

  return {
    hasConflict: true,
    conflictingReservations: conflicts,
    message: `This room is already booked for: ${conflictDates}`,
    severity: 'error'
  }
}

/**
 * Find alternative rooms that are available for the requested dates
 * 
 * @param requestedRoomType - The originally requested room type
 * @param checkIn - Check-in date timestamp
 * @param checkOut - Check-out date timestamp
 * @param rooms - All available rooms
 * @param reservations - All existing reservations
 * @param maxResults - Maximum number of alternatives to return
 * @returns Array of alternative rooms sorted by similarity
 */
export function findAlternativeRooms(
  requestedRoomType: string,
  checkIn: number,
  checkOut: number,
  rooms: Room[],
  reservations: Reservation[],
  maxResults = 5
): AlternativeRoom[] {
  const alternatives: AlternativeRoom[] = []

  for (const room of rooms) {
    // Check if room is available for the entire duration
    const conflict = checkBookingConflict(room.id, checkIn, checkOut, reservations)
    
    if (!conflict.hasConflict && room.status !== 'maintenance' && room.status !== 'out-of-order') {
      // Calculate similarity score (0 = exact match)
      let distance = 0
      if (room.roomType !== requestedRoomType) {
        // Different room type - add penalty
        distance += 10
        
        // But prefer upgrades over downgrades (you can customize this logic)
        const roomTypeOrder = ['Standard', 'Deluxe', 'Suite', 'Executive Suite', 'Presidential Suite']
        const requestedIdx = roomTypeOrder.indexOf(requestedRoomType)
        const currentIdx = roomTypeOrder.indexOf(room.roomType)
        
        if (currentIdx > requestedIdx) {
          // This is an upgrade, less penalty
          distance += (currentIdx - requestedIdx) * 2
        } else {
          // This is a downgrade, more penalty
          distance += (requestedIdx - currentIdx) * 5
        }
      }

      alternatives.push({
        room,
        distance,
        availableFrom: checkIn,
        availableTo: checkOut
      })
    }
  }

  // Sort by distance (most similar first) and return limited results
  return alternatives
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxResults)
}

/**
 * Check if a room is available for walk-in (immediate check-in)
 * 
 * @param roomId - The room to check
 * @param rooms - All rooms
 * @param reservations - All existing reservations
 * @returns Whether the room is ready for immediate occupancy
 */
export function isRoomReadyForWalkIn(
  roomId: string,
  rooms: Room[],
  reservations: Reservation[]
): { ready: boolean; reason?: string } {
  const room = rooms.find(r => r.id === roomId)
  
  if (!room) {
    return { ready: false, reason: 'Room not found' }
  }

  // Check room status
  if (room.status === 'maintenance' || room.status === 'out-of-order') {
    return { ready: false, reason: `Room is currently ${room.status}` }
  }

  if (room.status === 'vacant-dirty') {
    return { ready: false, reason: 'Room needs cleaning' }
  }

  if (room.status !== 'vacant-clean') {
    return { ready: false, reason: 'Room is not available' }
  }

  // Check for existing reservations starting today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTimestamp = today.getTime()
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowTimestamp = tomorrow.getTime()

  const todayReservations = reservations.filter(r =>
    r.roomId === roomId &&
    (r.status === 'confirmed' || r.status === 'checked-in') &&
    r.checkInDate >= todayTimestamp &&
    r.checkInDate < tomorrowTimestamp
  )

  if (todayReservations.length > 0) {
    return { 
      ready: false, 
      reason: `Room has a reservation starting today at ${new Date(todayReservations[0].checkInDate).toLocaleTimeString()}` 
    }
  }

  return { ready: true }
}

/**
 * Get occupancy rate for a date range
 * 
 * @param rooms - All rooms
 * @param reservations - All reservations
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @returns Occupancy percentage
 */
export function calculateOccupancyRate(
  rooms: Room[],
  reservations: Reservation[],
  startDate: number,
  endDate: number
): number {
  const availableRooms = rooms.filter(r => 
    r.status !== 'out-of-order' && r.status !== 'maintenance'
  )
  
  if (availableRooms.length === 0) return 0

  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
  const totalRoomNights = availableRooms.length * days

  // Count occupied room nights
  let occupiedNights = 0
  
  for (const reservation of reservations) {
    if (reservation.status !== 'confirmed' && reservation.status !== 'checked-in') {
      continue
    }

    // Calculate overlap between reservation and date range
    const overlapStart = Math.max(reservation.checkInDate, startDate)
    const overlapEnd = Math.min(reservation.checkOutDate, endDate)
    
    if (overlapStart < overlapEnd) {
      const nights = Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24))
      occupiedNights += nights
    }
  }

  return (occupiedNights / totalRoomNights) * 100
}

/**
 * Validate reservation dates
 * 
 * @param checkIn - Check-in date timestamp
 * @param checkOut - Check-out date timestamp
 * @returns Validation result
 */
export function validateReservationDates(
  checkIn: number,
  checkOut: number
): { valid: boolean; error?: string } {
  const now = Date.now()
  
  // Check-in cannot be in the past (allow same day)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (checkIn < today.getTime()) {
    return { 
      valid: false, 
      error: 'Check-in date cannot be in the past' 
    }
  }

  // Check-out must be after check-in
  if (checkOut <= checkIn) {
    return { 
      valid: false, 
      error: 'Check-out date must be after check-in date' 
    }
  }

  // Minimum stay of 1 night
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
  if (nights < 1) {
    return { 
      valid: false, 
      error: 'Minimum stay is 1 night' 
    }
  }

  // Maximum advance booking (e.g., 1 year)
  const maxAdvanceDays = 365
  const maxAdvanceTimestamp = now + (maxAdvanceDays * 24 * 60 * 60 * 1000)
  if (checkIn > maxAdvanceTimestamp) {
    return { 
      valid: false, 
      error: `Cannot book more than ${maxAdvanceDays} days in advance` 
    }
  }

  return { valid: true }
}

/**
 * Get all available rooms for a date range
 * 
 * @param checkIn - Check-in date timestamp
 * @param checkOut - Check-out date timestamp
 * @param rooms - All rooms
 * @param reservations - All existing reservations
 * @param roomType - Optional filter by room type
 * @returns Array of available rooms
 */
export function getAvailableRooms(
  checkIn: number,
  checkOut: number,
  rooms: Room[],
  reservations: Reservation[],
  roomType?: string
): Room[] {
  let filteredRooms = rooms.filter(r => 
    r.status !== 'out-of-order' && r.status !== 'maintenance'
  )

  if (roomType) {
    filteredRooms = filteredRooms.filter(r => r.roomType === roomType)
  }

  return filteredRooms.filter(room => {
    const conflict = checkBookingConflict(room.id, checkIn, checkOut, reservations)
    return !conflict.hasConflict
  })
}
