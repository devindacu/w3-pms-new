import type { WorkflowResult } from './test-utils'
import { delay, generateTestId, getDateRange } from './test-utils'

export async function channelManagerSyncWorkflow(): Promise<WorkflowResult> {
  const steps: string[] = []
  
  try {
    steps.push('Starting channel manager sync workflow')
    await delay(100)

    const connectionId = generateTestId('conn')
    steps.push(`OTA connection: ${connectionId}`)
    
    const otaConnection = {
      id: connectionId,
      channel: 'Booking.com',
      status: 'active',
      propertyId: 'PROP-12345',
      apiKey: '***encrypted***',
      lastSync: Date.now() - (60 * 60 * 1000)
    }
    
    steps.push(`Channel: ${otaConnection.channel}`)
    await delay(100)

    steps.push('Syncing room inventory to OTA')
    const roomTypes = [
      { id: 'rt-001', name: 'Deluxe Room', available: 25, totalRooms: 30 },
      { id: 'rt-002', name: 'Suite', available: 8, totalRooms: 10 },
      { id: 'rt-003', name: 'Standard Room', available: 45, totalRooms: 60 }
    ]
    
    for (const roomType of roomTypes) {
      steps.push(`  ${roomType.name}: ${roomType.available}/${roomType.totalRooms} available`)
      await delay(30)
    }
    await delay(100)

    steps.push('Syncing rate plans to OTA')
    const { start: today } = getDateRange(0)
    const ratePlans = [
      { roomTypeId: 'rt-001', date: today, rate: 180, minStay: 1 },
      { roomTypeId: 'rt-002', date: today, rate: 320, minStay: 2 },
      { roomTypeId: 'rt-003', date: today, rate: 120, minStay: 1 }
    ]
    
    for (const plan of ratePlans) {
      steps.push(`  Rate updated: $${plan.rate} (Min stay: ${plan.minStay})`)
      await delay(30)
    }
    await delay(100)

    steps.push('Applying restrictions')
    const restrictions = [
      { type: 'stop-sell', roomTypeId: 'rt-002', dates: [] },
      { type: 'min-stay', value: 3, roomTypeId: 'rt-001', dates: [] }
    ]
    
    steps.push(`Applied ${restrictions.length} restriction(s)`)
    await delay(50)

    steps.push('Checking for new reservations from OTA')
    await delay(150)

    const newReservationId = generateTestId('ota-res')
    steps.push(`New reservation received: ${newReservationId}`)
    
    const { start: checkIn, end: checkOut } = getDateRange(7)
    const otaReservation = {
      id: newReservationId,
      channel: 'Booking.com',
      confirmationCode: 'BK-789456123',
      guestName: 'Jane Smith',
      guestEmail: 'jane.smith@email.com',
      guestPhone: '+1987654321',
      roomTypeId: 'rt-001',
      checkIn,
      checkOut,
      adults: 2,
      children: 1,
      ratePerNight: 180,
      totalAmount: 1260,
      commission: 189,
      netAmount: 1071,
      status: 'confirmed'
    }
    
    steps.push(`Guest: ${otaReservation.guestName}`)
    steps.push(`Total: $${otaReservation.totalAmount} (Commission: $${otaReservation.commission})`)
    await delay(100)

    steps.push('Creating guest profile in PMS')
    const guestId = generateTestId('guest')
    const guest = {
      id: guestId,
      firstName: 'Jane',
      lastName: 'Smith',
      email: otaReservation.guestEmail,
      phone: otaReservation.guestPhone,
      source: 'Booking.com',
      createdAt: Date.now()
    }
    steps.push(`Guest profile created: ${guestId}`)
    await delay(100)

    steps.push('Creating reservation in PMS')
    const pmsReservationId = generateTestId('reservation')
    const pmsReservation = {
      id: pmsReservationId,
      guestId,
      otaReservationId: newReservationId,
      confirmationCode: otaReservation.confirmationCode,
      checkInDate: otaReservation.checkIn,
      checkOutDate: otaReservation.checkOut,
      roomType: 'deluxe',
      adults: otaReservation.adults,
      children: otaReservation.children,
      ratePerNight: otaReservation.ratePerNight,
      totalAmount: otaReservation.totalAmount,
      source: 'Booking.com',
      status: 'confirmed'
    }
    steps.push(`PMS reservation: ${pmsReservationId}`)
    await delay(100)

    steps.push('Updating room inventory after booking')
    const updatedInventory = roomTypes.map(rt => 
      rt.id === otaReservation.roomTypeId 
        ? { ...rt, available: rt.available - 1 }
        : rt
    )
    
    for (const rt of updatedInventory) {
      steps.push(`  ${rt.name}: ${rt.available} available`)
      await delay(30)
    }
    await delay(50)

    steps.push('Syncing updated inventory back to OTA')
    await delay(100)

    steps.push('Recording channel performance metrics')
    const performanceMetrics = {
      channel: 'Booking.com',
      bookings: 1,
      revenue: otaReservation.netAmount,
      commission: otaReservation.commission,
      conversionRate: 0.12
    }
    steps.push(`Net revenue: $${performanceMetrics.revenue}`)
    await delay(50)

    steps.push('Creating sync log')
    const syncLogId = generateTestId('sync')
    const syncLog = {
      id: syncLogId,
      connectionId,
      type: 'full-sync',
      status: 'success',
      itemsSynced: 8,
      newReservations: 1,
      timestamp: Date.now()
    }
    steps.push(`Sync log: ${syncLogId}`)
    await delay(50)

    steps.push('Workflow completed successfully')
    
    return {
      success: true,
      steps
    }
  } catch (error) {
    steps.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      steps
    }
  }
}
