import { isWithinInterval, isToday, getDay, parse } from 'date-fns'
import type { MealCombo, ComboPromotion } from './types'

export function isPromotionActive(promotion: ComboPromotion): boolean {
  if (!promotion.isActive) return false

  const now = Date.now()
  const currentDate = new Date(now)

  if (now < promotion.startDate || now > promotion.endDate) {
    return false
  }

  if (promotion.maxRedemptions && promotion.currentRedemptions >= promotion.maxRedemptions) {
    return false
  }

  if (promotion.daysOfWeek && promotion.daysOfWeek.length > 0) {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const currentDayName = dayNames[getDay(currentDate)]
    if (!promotion.daysOfWeek.includes(currentDayName)) {
      return false
    }
  }

  if (promotion.startTime && promotion.endTime) {
    const currentTime = currentDate.toTimeString().slice(0, 5)
    if (currentTime < promotion.startTime || currentTime > promotion.endTime) {
      return false
    }
  }

  return true
}

export function getActivePromotion(combo: MealCombo): ComboPromotion | undefined {
  if (!combo.promotions || combo.promotions.length === 0) {
    return undefined
  }

  const activePromotions = combo.promotions
    .filter(isPromotionActive)
    .sort((a, b) => b.priorityLevel - a.priorityLevel)

  return activePromotions[0]
}

export function calculatePromotionPrice(combo: MealCombo, promotion: ComboPromotion): number {
  let promotionPrice = combo.comboPrice

  if (promotion.additionalDiscountPercentage > 0) {
    promotionPrice = combo.comboPrice * (1 - promotion.additionalDiscountPercentage / 100)
  }

  if (promotion.additionalDiscountAmount && promotion.additionalDiscountAmount > 0) {
    promotionPrice -= promotion.additionalDiscountAmount
  }

  return Math.max(0, promotionPrice)
}

export function getPromotionSavings(combo: MealCombo, promotion: ComboPromotion): number {
  const promotionPrice = calculatePromotionPrice(combo, promotion)
  return combo.comboPrice - promotionPrice
}

export function getTimeRemaining(endDate: number): { 
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
} {
  const now = Date.now()
  const total = endDate - now

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
  }

  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))

  return { days, hours, minutes, seconds, total }
}

export function formatTimeRemaining(endDate: number): string {
  const { days, hours, minutes } = getTimeRemaining(endDate)

  if (days > 0) {
    return `${days}d ${hours}h remaining`
  }
  
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`
  }

  return `${minutes}m remaining`
}

export function getPromotionBadgeColor(promotionType: string): string {
  switch (promotionType) {
    case 'flash-sale':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'early-bird':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    case 'happy-hour':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'seasonal':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'limited-time':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    case 'loyalty-exclusive':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    default:
      return 'bg-primary/10 text-primary'
  }
}

export function enrichComboWithPromotion(combo: MealCombo): MealCombo {
  const activePromotion = getActivePromotion(combo)

  if (!activePromotion) {
    return {
      ...combo,
      isPromotionActive: false,
      activePromotion: undefined,
      promotionPrice: undefined,
      promotionSavings: undefined
    }
  }

  const promotionPrice = calculatePromotionPrice(combo, activePromotion)
  const promotionSavings = getPromotionSavings(combo, activePromotion)

  return {
    ...combo,
    isPromotionActive: true,
    activePromotion,
    promotionPrice,
    promotionSavings
  }
}
