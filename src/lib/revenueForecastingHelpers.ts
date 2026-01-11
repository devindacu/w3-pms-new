import type { Reservation, RoomTypeConfig, RatePlanConfig, GuestInvoice } from './types'

export interface RoomTypePerformance {
  roomTypeId: string
  roomTypeName: string
  totalRevenue: number
  totalBookings: number
  averageDailyRate: number
  occupancyRate: number
  revenuePerAvailableRoom: number
  seasonalTrend: 'increasing' | 'decreasing' | 'stable'
  growthRate: number
}

export interface ForecastPeriod {
  date: string
  timestamp: number
  predictedRevenue: number
  predictedOccupancy: number
  confidenceLevel: number
  lowerBound: number
  upperBound: number
  roomTypeForecasts: RoomTypeForecast[]
}

export interface RoomTypeForecast {
  roomTypeId: string
  roomTypeName: string
  predictedRevenue: number
  predictedBookings: number
  predictedADR: number
  predictedOccupancy: number
}

export interface SeasonalPattern {
  month: number
  averageRevenue: number
  averageOccupancy: number
  bookingCount: number
  seasonality: number
}

export interface ForecastMetrics {
  totalPredictedRevenue: number
  averagePredictedOccupancy: number
  expectedGrowth: number
  confidenceScore: number
  topPerformingRoomType: string
  recommendations: string[]
}

export function analyzeRoomTypePerformance(
  reservations: Reservation[],
  roomTypes: RoomTypeConfig[],
  invoices: GuestInvoice[],
  daysBack: number = 90,
  rooms: any[] = []
): RoomTypePerformance[] {
  const now = Date.now()
  const startDate = now - (daysBack * 24 * 60 * 60 * 1000)
  
  const recentReservations = reservations.filter(r => 
    new Date(r.checkInDate).getTime() >= startDate
  )
  
  const recentInvoices = invoices.filter(inv => {
    const invDate = new Date(inv.invoiceDate).getTime()
    return invDate >= startDate
  })

  return roomTypes.map(roomType => {
    const roomsOfType = rooms.filter(r => r.roomType === roomType.name)
    const totalRoomsOfType = roomsOfType.length || 1
    
    const roomNumbers = new Set(roomsOfType.map(r => r.roomNumber))
    const typeInvoices = recentInvoices.filter(inv => 
      inv.roomNumber && roomNumbers.has(inv.roomNumber)
    )
    
    const totalRevenue = typeInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0)
    const totalBookings = typeInvoices.length
    const averageDailyRate = totalBookings > 0 ? totalRevenue / totalBookings : roomType.baseRate
    
    const totalRoomNights = typeInvoices.reduce((sum, inv) => {
      const checkIn = inv.checkInDate ? new Date(inv.checkInDate).getTime() : 0
      const checkOut = inv.checkOutDate ? new Date(inv.checkOutDate).getTime() : 0
      if (checkIn && checkOut) {
        const nights = Math.ceil((checkOut - checkIn) / (24 * 60 * 60 * 1000))
        return sum + Math.max(1, nights)
      }
      return sum + 1
    }, 0)
    
    const availableRoomNights = totalRoomsOfType * daysBack
    const occupancyRate = availableRoomNights > 0 ? (totalRoomNights / availableRoomNights) * 100 : 0
    const revenuePerAvailableRoom = availableRoomNights > 0 ? totalRevenue / availableRoomNights : 0
    
    const growthRate = calculateGrowthRateFromInvoices(typeInvoices, daysBack)
    const seasonalTrend = determineSeasonalTrend(growthRate)
    
    return {
      roomTypeId: roomType.id,
      roomTypeName: roomType.name,
      totalRevenue,
      totalBookings,
      averageDailyRate,
      occupancyRate,
      revenuePerAvailableRoom,
      seasonalTrend,
      growthRate
    }
  })
}

function calculateGrowthRate(reservations: Reservation[], daysBack: number): number {
  if (reservations.length === 0) return 0
  
  const now = Date.now()
  const midPoint = now - (daysBack / 2 * 24 * 60 * 60 * 1000)
  
  const firstHalf = reservations.filter(r => 
    new Date(r.checkInDate).getTime() < midPoint
  )
  const secondHalf = reservations.filter(r => 
    new Date(r.checkInDate).getTime() >= midPoint
  )
  
  const firstHalfRevenue = firstHalf.reduce((sum, r) => sum + (r.totalAmount || 0), 0)
  const secondHalfRevenue = secondHalf.reduce((sum, r) => sum + (r.totalAmount || 0), 0)
  
  if (firstHalfRevenue === 0) return 0
  
  return ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100
}

function calculateGrowthRateFromInvoices(invoices: GuestInvoice[], daysBack: number): number {
  if (invoices.length === 0) return 0
  
  const now = Date.now()
  const midPoint = now - (daysBack / 2 * 24 * 60 * 60 * 1000)
  
  const firstHalf = invoices.filter(inv => 
    new Date(inv.invoiceDate).getTime() < midPoint
  )
  const secondHalf = invoices.filter(inv => 
    new Date(inv.invoiceDate).getTime() >= midPoint
  )
  
  const firstHalfRevenue = firstHalf.reduce((sum, inv) => sum + inv.grandTotal, 0)
  const secondHalfRevenue = secondHalf.reduce((sum, inv) => sum + inv.grandTotal, 0)
  
  if (firstHalfRevenue === 0) return 0
  
  return ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100
}

function determineSeasonalTrend(growthRate: number): 'increasing' | 'decreasing' | 'stable' {
  if (growthRate > 5) return 'increasing'
  if (growthRate < -5) return 'decreasing'
  return 'stable'
}

export function identifySeasonalPatterns(
  reservations: Reservation[],
  yearsBack: number = 2
): SeasonalPattern[] {
  const now = Date.now()
  const startDate = now - (yearsBack * 365 * 24 * 60 * 60 * 1000)
  
  const historicalReservations = reservations.filter(r => 
    new Date(r.checkInDate).getTime() >= startDate
  )
  
  const monthlyData: { [month: number]: { revenue: number[], occupancy: number[], bookings: number } } = {}
  
  for (let month = 0; month < 12; month++) {
    monthlyData[month] = { revenue: [], occupancy: [], bookings: 0 }
  }
  
  historicalReservations.forEach(reservation => {
    const month = new Date(reservation.checkInDate).getMonth()
    monthlyData[month].revenue.push(reservation.totalAmount || 0)
    monthlyData[month].bookings++
  })
  
  const patterns: SeasonalPattern[] = []
  const avgMonthlyRevenue = Object.values(monthlyData).reduce((sum, data) => 
    sum + (data.revenue.reduce((s, r) => s + r, 0) / Math.max(1, data.revenue.length)), 0
  ) / 12
  
  for (let month = 0; month < 12; month++) {
    const data = monthlyData[month]
    const avgRevenue = data.revenue.length > 0 
      ? data.revenue.reduce((sum, r) => sum + r, 0) / data.revenue.length 
      : 0
    
    const seasonality = avgMonthlyRevenue > 0 ? (avgRevenue / avgMonthlyRevenue) : 1
    
    patterns.push({
      month,
      averageRevenue: avgRevenue,
      averageOccupancy: 0,
      bookingCount: data.bookings,
      seasonality
    })
  }
  
  return patterns
}

export function generateRevenueForecast(
  reservations: Reservation[],
  roomTypes: RoomTypeConfig[],
  invoices: GuestInvoice[],
  forecastDays: number = 90,
  totalRooms: number = 50
): ForecastPeriod[] {
  const performance = analyzeRoomTypePerformance(reservations, roomTypes, invoices, 90)
  const seasonalPatterns = identifySeasonalPatterns(reservations, 2)
  
  const forecasts: ForecastPeriod[] = []
  const now = Date.now()
  
  const historicalAvgRevenue = reservations
    .filter(r => new Date(r.checkInDate).getTime() >= now - (90 * 24 * 60 * 60 * 1000))
    .reduce((sum, r) => sum + (r.totalAmount || 0), 0) / 90
  
  const historicalAvgOccupancy = reservations
    .filter(r => new Date(r.checkInDate).getTime() >= now - (90 * 24 * 60 * 60 * 1000))
    .length / (totalRooms * 90) * 100
  
  for (let day = 1; day <= forecastDays; day++) {
    const forecastDate = now + (day * 24 * 60 * 60 * 1000)
    const forecastMonth = new Date(forecastDate).getMonth()
    
    const seasonalPattern = seasonalPatterns[forecastMonth]
    const seasonalityFactor = seasonalPattern?.seasonality || 1
    
    const trendFactor = 1 + (performance.reduce((sum, p) => sum + p.growthRate, 0) / performance.length / 100)
    
    const dayOfWeek = new Date(forecastDate).getDay()
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.15 : 1.0
    
    const baseRevenue = historicalAvgRevenue * seasonalityFactor * trendFactor * weekendFactor
    
    const variance = baseRevenue * 0.15
    const predictedRevenue = baseRevenue
    const lowerBound = baseRevenue - variance
    const upperBound = baseRevenue + variance
    
    const baseOccupancy = historicalAvgOccupancy * seasonalityFactor * trendFactor * weekendFactor
    const predictedOccupancy = Math.min(100, Math.max(0, baseOccupancy))
    
    const dataPoints = Math.min(reservations.length, 90)
    const confidenceLevel = Math.min(95, 50 + (dataPoints / 90 * 45))
    
    const roomTypeForecasts = performance.map(perf => {
      const roomTypePredictedRevenue = predictedRevenue * (perf.totalRevenue / performance.reduce((sum, p) => sum + p.totalRevenue, 0))
      const roomTypePredictedBookings = Math.round(perf.totalBookings / 90 * seasonalityFactor * trendFactor)
      const roomTypePredictedADR = roomTypePredictedBookings > 0 
        ? roomTypePredictedRevenue / roomTypePredictedBookings 
        : perf.averageDailyRate
      
      return {
        roomTypeId: perf.roomTypeId,
        roomTypeName: perf.roomTypeName,
        predictedRevenue: roomTypePredictedRevenue,
        predictedBookings: roomTypePredictedBookings,
        predictedADR: roomTypePredictedADR,
        predictedOccupancy: perf.occupancyRate * seasonalityFactor * trendFactor
      }
    })
    
    forecasts.push({
      date: new Date(forecastDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      timestamp: forecastDate,
      predictedRevenue,
      predictedOccupancy,
      confidenceLevel,
      lowerBound,
      upperBound,
      roomTypeForecasts
    })
  }
  
  return forecasts
}

export function calculateForecastMetrics(
  forecasts: ForecastPeriod[],
  performance: RoomTypePerformance[]
): ForecastMetrics {
  const totalPredictedRevenue = forecasts.reduce((sum, f) => sum + f.predictedRevenue, 0)
  const averagePredictedOccupancy = forecasts.reduce((sum, f) => sum + f.predictedOccupancy, 0) / forecasts.length
  
  const currentRevenue = performance.reduce((sum, p) => sum + p.totalRevenue, 0)
  const expectedGrowth = currentRevenue > 0 
    ? ((totalPredictedRevenue - currentRevenue) / currentRevenue) * 100 
    : 0
  
  const confidenceScore = forecasts.reduce((sum, f) => sum + f.confidenceLevel, 0) / forecasts.length
  
  const topPerformer = performance.reduce((top, current) => 
    current.totalRevenue > top.totalRevenue ? current : top
  , performance[0])
  
  const recommendations: string[] = []
  
  performance.forEach(perf => {
    if (perf.occupancyRate < 60) {
      recommendations.push(`Consider promotional strategies for ${perf.roomTypeName} to boost occupancy (currently ${perf.occupancyRate.toFixed(1)}%)`)
    }
    if (perf.seasonalTrend === 'increasing') {
      recommendations.push(`${perf.roomTypeName} showing strong growth trend - consider premium pricing`)
    }
    if (perf.seasonalTrend === 'decreasing') {
      recommendations.push(`${perf.roomTypeName} showing declining trend - review pricing and marketing strategy`)
    }
  })
  
  if (averagePredictedOccupancy > 80) {
    recommendations.push('High predicted occupancy - consider increasing rates to maximize revenue')
  } else if (averagePredictedOccupancy < 50) {
    recommendations.push('Low predicted occupancy - implement promotional campaigns to drive bookings')
  }
  
  if (expectedGrowth < 0) {
    recommendations.push('Negative growth forecast - urgent action needed to reverse trend')
  } else if (expectedGrowth > 20) {
    recommendations.push('Strong growth forecast - ensure operational capacity to meet demand')
  }
  
  return {
    totalPredictedRevenue,
    averagePredictedOccupancy,
    expectedGrowth,
    confidenceScore,
    topPerformingRoomType: topPerformer?.roomTypeName || 'N/A',
    recommendations: recommendations.slice(0, 5)
  }
}

export function predictOptimalPricing(
  performance: RoomTypePerformance[],
  seasonalPatterns: SeasonalPattern[],
  targetDate: Date
): { [roomTypeId: string]: { suggestedRate: number, rationale: string } } {
  const month = targetDate.getMonth()
  const seasonalPattern = seasonalPatterns[month]
  const seasonalityFactor = seasonalPattern?.seasonality || 1
  
  const pricing: { [roomTypeId: string]: { suggestedRate: number, rationale: string } } = {}
  
  performance.forEach(perf => {
    let suggestedRate = perf.averageDailyRate * seasonalityFactor
    let rationale = 'Based on historical performance and seasonal trends'
    
    if (perf.occupancyRate > 85) {
      suggestedRate *= 1.15
      rationale = 'High occupancy - premium pricing recommended'
    } else if (perf.occupancyRate < 50) {
      suggestedRate *= 0.9
      rationale = 'Low occupancy - competitive pricing to drive bookings'
    }
    
    if (perf.seasonalTrend === 'increasing') {
      suggestedRate *= 1.1
      rationale += ' with growth trend adjustment'
    } else if (perf.seasonalTrend === 'decreasing') {
      suggestedRate *= 0.95
      rationale += ' with decline mitigation'
    }
    
    pricing[perf.roomTypeId] = {
      suggestedRate: Math.round(suggestedRate * 100) / 100,
      rationale
    }
  })
  
  return pricing
}

export function generateRevenueScenarios(
  baseForecasts: ForecastPeriod[]
): {
  optimistic: ForecastPeriod[]
  realistic: ForecastPeriod[]
  conservative: ForecastPeriod[]
} {
  const optimistic = baseForecasts.map(f => ({
    ...f,
    predictedRevenue: f.predictedRevenue * 1.2,
    predictedOccupancy: Math.min(100, f.predictedOccupancy * 1.15),
    lowerBound: f.lowerBound * 1.2,
    upperBound: f.upperBound * 1.2,
    roomTypeForecasts: f.roomTypeForecasts.map(rtf => ({
      ...rtf,
      predictedRevenue: rtf.predictedRevenue * 1.2,
      predictedOccupancy: Math.min(100, rtf.predictedOccupancy * 1.15)
    }))
  }))
  
  const realistic = baseForecasts
  
  const conservative = baseForecasts.map(f => ({
    ...f,
    predictedRevenue: f.predictedRevenue * 0.85,
    predictedOccupancy: f.predictedOccupancy * 0.9,
    lowerBound: f.lowerBound * 0.85,
    upperBound: f.upperBound * 0.85,
    roomTypeForecasts: f.roomTypeForecasts.map(rtf => ({
      ...rtf,
      predictedRevenue: rtf.predictedRevenue * 0.85,
      predictedOccupancy: rtf.predictedOccupancy * 0.9
    }))
  }))
  
  return { optimistic, realistic, conservative }
}
