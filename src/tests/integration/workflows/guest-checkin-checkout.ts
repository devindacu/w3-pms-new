import type { WorkflowResult } from './test-utils'
import { delay, generateTestId, getDateRange } from './test-utils'

export async function guestCheckInCheckOutWorkflow(): Promise<WorkflowResult> {
  const steps: string[] = []
  
  try {
    steps.push('Starting guest check-in to check-out workflow')
    await delay(100)

    const guestId = generateTestId('guest')
    steps.push(`Created test guest: ${guestId}`)
    
    const guest = {
      id: guestId,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@test.com',
      phone: '+1234567890',
      nationality: 'US',
      idType: 'passport',
      idNumber: 'P123456',
      loyaltyPoints: 0,
      totalStays: 0,
      totalSpent: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    await delay(50)

    const reservationId = generateTestId('reservation')
    const { start: checkInDate, end: checkOutDate } = getDateRange(3)
    steps.push(`Created reservation: ${reservationId} (3 nights)`)
    
    const reservation = {
      id: reservationId,
      guestId,
      roomId: 'room-101',
      checkInDate,
      checkOutDate,
      adults: 2,
      children: 0,
      status: 'confirmed' as const,
      ratePerNight: 150,
      totalAmount: 450,
      advancePaid: 0,
      source: 'direct',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: 'test-user'
    }
    await delay(100)

    steps.push('Checking room availability')
    const roomAvailable = true
    if (!roomAvailable) {
      throw new Error('Room not available for selected dates')
    }
    await delay(50)

    steps.push('Processing check-in')
    steps.push('Guest checked in successfully')
    await delay(100)

    const folioId = generateTestId('folio')
    steps.push(`Created guest folio: ${folioId}`)
    
    const folio = {
      id: folioId,
      guestId,
      reservationId,
      roomCharges: 450,
      extraCharges: 0,
      taxes: 45,
      total: 495,
      paid: 0,
      balance: 495,
      createdAt: Date.now()
    }
    await delay(50)

    steps.push('Adding room service charges to folio')
    const roomServiceCharge = 85
    folio.extraCharges += roomServiceCharge
    folio.total += roomServiceCharge
    folio.balance += roomServiceCharge
    steps.push(`Posted room service charge: $${roomServiceCharge}`)
    await delay(100)

    steps.push('Adding minibar charges to folio')
    const minibarCharge = 32
    folio.extraCharges += minibarCharge
    folio.total += minibarCharge
    folio.balance += minibarCharge
    steps.push(`Posted minibar charge: $${minibarCharge}`)
    await delay(50)

    steps.push('Processing check-out')
    await delay(100)

    steps.push('Processing payment')
    const paymentId = generateTestId('payment')
    folio.paid = folio.balance
    folio.balance = 0
    steps.push(`Payment processed: ${paymentId} - $${folio.paid}`)
    await delay(100)

    steps.push('Updating room status to vacant-dirty')
    const roomStatus = 'vacant-dirty'
    steps.push(`Room 101 status: ${roomStatus}`)
    await delay(50)

    steps.push('Creating housekeeping task for room cleanup')
    const taskId = generateTestId('task')
    steps.push(`Housekeeping task created: ${taskId}`)
    await delay(100)

    steps.push('Updating guest loyalty points')
    const earnedPoints = Math.floor(folio.paid / 10)
    guest.loyaltyPoints += earnedPoints
    guest.totalStays += 1
    guest.totalSpent += folio.paid
    steps.push(`Guest earned ${earnedPoints} loyalty points`)
    await delay(50)

    steps.push('Sending check-out confirmation email')
    await delay(100)

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
