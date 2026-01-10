import type { WorkflowResult } from './test-utils'
import { delay, generateTestId } from './test-utils'

export async function guestLoyaltyWorkflow(): Promise<WorkflowResult> {
  const steps: string[] = []
  
  try {
    steps.push('Starting guest loyalty & CRM workflow')
    await delay(100)

    const guestId = generateTestId('guest')
    steps.push(`Guest profile: ${guestId}`)
    
    const guestProfile = {
      id: guestId,
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1555123456',
      loyaltyTier: 'Silver',
      loyaltyPoints: 2500,
      totalStays: 8,
      totalSpent: 6420,
      preferences: ['ocean-view', 'high-floor', 'late-checkout'],
      createdAt: Date.now() - (365 * 24 * 60 * 60 * 1000)
    }
    
    steps.push(`Tier: ${guestProfile.loyaltyTier} | Points: ${guestProfile.loyaltyPoints}`)
    await delay(100)

    steps.push('Guest making new reservation')
    const reservationTotal = 850
    await delay(50)

    steps.push('Identifying upsell opportunities')
    const upsellOffers = [
      { id: 'up-001', service: 'Room Upgrade', price: 50, potential: 'high' },
      { id: 'up-002', service: 'Spa Package', price: 120, potential: 'medium' },
      { id: 'up-003', service: 'Airport Transfer', price: 65, potential: 'high' }
    ]
    
    for (const offer of upsellOffers) {
      steps.push(`  ${offer.service}: $${offer.price} (${offer.potential} potential)`)
      await delay(30)
    }
    await delay(100)

    steps.push('Guest accepting upsell offers')
    const acceptedOffers = upsellOffers.filter(o => o.potential === 'high')
    const upsellRevenue = acceptedOffers.reduce((sum, o) => sum + o.price, 0)
    
    for (const offer of acceptedOffers) {
      const transactionId = generateTestId('upsell')
      steps.push(`  ✓ ${offer.service} - $${offer.price} (Transaction: ${transactionId})`)
      await delay(30)
    }
    
    steps.push(`Upsell revenue: $${upsellRevenue}`)
    await delay(100)

    const totalRevenue = reservationTotal + upsellRevenue
    steps.push(`Total reservation value: $${totalRevenue}`)
    await delay(50)

    steps.push('Calculating loyalty points earned')
    const basePoints = Math.floor(totalRevenue / 10)
    const tierBonus = guestProfile.loyaltyTier === 'Silver' ? 0.25 : 0
    const bonusPoints = Math.floor(basePoints * tierBonus)
    const totalPoints = basePoints + bonusPoints
    
    steps.push(`  Base points: ${basePoints}`)
    steps.push(`  Tier bonus (25%): ${bonusPoints}`)
    steps.push(`  Total points: ${totalPoints}`)
    await delay(100)

    guestProfile.loyaltyPoints += totalPoints
    steps.push(`Updated loyalty balance: ${guestProfile.loyaltyPoints} points`)
    await delay(50)

    steps.push('Checking tier upgrade eligibility')
    if (guestProfile.loyaltyPoints >= 5000 && guestProfile.totalStays >= 10) {
      steps.push('  ✓ Guest eligible for Gold tier upgrade!')
      guestProfile.loyaltyTier = 'Gold'
      steps.push(`  Tier upgraded to: ${guestProfile.loyaltyTier}`)
    } else {
      const pointsNeeded = 5000 - guestProfile.loyaltyPoints
      const staysNeeded = 10 - guestProfile.totalStays
      steps.push(`  Needs ${pointsNeeded} more points and ${staysNeeded} more stays for Gold`)
    }
    await delay(100)

    steps.push('Recording guest interaction')
    const interactionId = generateTestId('interaction')
    const interaction = {
      id: interactionId,
      guestId,
      type: 'reservation',
      channel: 'website',
      sentiment: 'positive',
      notes: 'Guest accepted upsell offers',
      timestamp: Date.now()
    }
    steps.push(`Interaction logged: ${interactionId}`)
    await delay(50)

    steps.push('Triggering personalized marketing campaign')
    const campaignId = generateTestId('campaign')
    const campaign = {
      id: campaignId,
      type: 'post-booking',
      template: 'pre-arrival-welcome',
      recipientId: guestId,
      scheduledFor: Date.now() + (24 * 60 * 60 * 1000),
      personalization: {
        name: guestProfile.firstName,
        tier: guestProfile.loyaltyTier,
        preferences: guestProfile.preferences
      }
    }
    
    steps.push(`Campaign: ${campaign.type} - ${campaign.template}`)
    await delay(100)

    steps.push('Sending pre-arrival email')
    const emailId = generateTestId('email')
    steps.push(`Email queued: ${emailId}`)
    await delay(50)

    steps.push('Recording guest feedback request')
    const feedbackRequestId = generateTestId('feedback')
    steps.push(`Feedback request scheduled for post-checkout: ${feedbackRequestId}`)
    await delay(100)

    steps.push('Updating CRM analytics')
    const crmMetrics = {
      customerLifetimeValue: guestProfile.totalSpent + totalRevenue,
      averageOrderValue: (guestProfile.totalSpent + totalRevenue) / (guestProfile.totalStays + 1),
      upsellConversionRate: (acceptedOffers.length / upsellOffers.length) * 100,
      loyaltyEngagement: 'high'
    }
    
    steps.push(`CLV: $${crmMetrics.customerLifetimeValue}`)
    steps.push(`AOV: $${crmMetrics.averageOrderValue.toFixed(2)}`)
    steps.push(`Upsell conversion: ${crmMetrics.upsellConversionRate.toFixed(1)}%`)
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
