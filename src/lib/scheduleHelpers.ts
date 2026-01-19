import type { ReportSchedule, ScheduleExecutionLog, ScheduleFrequency, DayOfWeek } from './reportScheduleTypes'

export function calculateNextRun(schedule: ReportSchedule): number {
  const { frequency, timeOfDay, dayOfWeek, dayOfMonth, timezone } = schedule.scheduleConfig
  const now = new Date()
  const [hours, minutes] = timeOfDay.split(':').map(Number)
  let nextRun = new Date()
  nextRun.setHours(hours, minutes, 0, 0)

  if (frequency === 'daily') {
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1)
    }
  } else if (frequency === 'weekly' && dayOfWeek) {
    const daysOfWeek: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const targetDay = daysOfWeek.indexOf(dayOfWeek as DayOfWeek)
    const currentDay = nextRun.getDay()
    let daysUntilTarget = targetDay - currentDay
    
    if (daysUntilTarget < 0 || (daysUntilTarget === 0 && nextRun <= now)) {
      daysUntilTarget += 7
    }
    
    nextRun.setDate(nextRun.getDate() + daysUntilTarget)
  } else if (frequency === 'monthly' && dayOfMonth) {
    nextRun.setDate(dayOfMonth)
    
    if (nextRun <= now || nextRun.getDate() !== dayOfMonth) {
      nextRun.setMonth(nextRun.getMonth() + 1)
      nextRun.setDate(dayOfMonth)
    }
  }

  return nextRun.getTime()
}

export function shouldExecuteSchedule(schedule: ReportSchedule): boolean {
  if (schedule.status !== 'active') return false
  if (!schedule.nextRun) return false
  
  const now = Date.now()
  const gracePeriod = 5 * 60 * 1000
  
  return schedule.nextRun <= now && schedule.nextRun > (now - gracePeriod)
}

export function getScheduleDescription(schedule: ReportSchedule): string {
  const { frequency, timeOfDay, dayOfWeek, dayOfMonth } = schedule.scheduleConfig
  
  switch (frequency) {
    case 'daily':
      return `Daily at ${timeOfDay}`
    case 'weekly':
      return `Every ${dayOfWeek} at ${timeOfDay}`
    case 'monthly':
      return `Monthly on day ${dayOfMonth} at ${timeOfDay}`
    default:
      return 'Custom schedule'
  }
}

export function formatScheduleTime(timestamp: number, timezone: string = 'UTC'): string {
  try {
    return new Date(timestamp).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone
    })
  } catch (error) {
    return new Date(timestamp).toLocaleString('en-US')
  }
}

export function getTimeUntilNextRun(nextRun?: number): string {
  if (!nextRun) return 'Not scheduled'
  
  const now = Date.now()
  const diff = nextRun - now
  
  if (diff < 0) return 'Overdue'
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `In ${days} day${days !== 1 ? 's' : ''}`
  } else if (hours > 0) {
    return `In ${hours} hour${hours !== 1 ? 's' : ''}`
  } else {
    return `In ${minutes} minute${minutes !== 1 ? 's' : ''}`
  }
}

export function createExecutionLog(
  scheduleId: string,
  status: 'success' | 'failed' | 'partial',
  duration: number,
  options: {
    reportSize?: number
    emailsSent?: number
    errorMessage?: string
    generatedFileUrl?: string
  } = {}
): ScheduleExecutionLog {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    scheduleId,
    executedAt: Date.now(),
    status,
    duration,
    reportSize: options.reportSize,
    emailsSent: options.emailsSent || 0,
    errorMessage: options.errorMessage,
    generatedFileUrl: options.generatedFileUrl
  }
}

export function getScheduleHealth(schedule: ReportSchedule): {
  status: 'healthy' | 'warning' | 'critical'
  message: string
} {
  const failureRate = schedule.runCount > 0 
    ? schedule.failureCount / schedule.runCount 
    : 0

  if (schedule.status === 'failed') {
    return {
      status: 'critical',
      message: 'Schedule has failed'
    }
  }

  if (failureRate > 0.5) {
    return {
      status: 'critical',
      message: 'High failure rate (>50%)'
    }
  }

  if (failureRate > 0.2) {
    return {
      status: 'warning',
      message: 'Moderate failure rate (>20%)'
    }
  }

  if (schedule.status === 'paused') {
    return {
      status: 'warning',
      message: 'Schedule is paused'
    }
  }

  return {
    status: 'healthy',
    message: 'Schedule is healthy'
  }
}

export function validateEmailRecipients(emails: string[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  emails.forEach((email, index) => {
    if (!emailRegex.test(email)) {
      errors.push(`Invalid email at position ${index + 1}: ${email}`)
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}

export function getNextExecutionTime(
  frequency: ScheduleFrequency,
  timeOfDay: string,
  dayOfWeek?: DayOfWeek,
  dayOfMonth?: number
): Date {
  const [hours, minutes] = timeOfDay.split(':').map(Number)
  const next = new Date()
  next.setHours(hours, minutes, 0, 0)

  if (frequency === 'daily') {
    if (next <= new Date()) {
      next.setDate(next.getDate() + 1)
    }
  } else if (frequency === 'weekly' && dayOfWeek) {
    const daysOfWeek: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const targetDay = daysOfWeek.indexOf(dayOfWeek)
    const currentDay = next.getDay()
    let daysUntilTarget = targetDay - currentDay

    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7
    }

    next.setDate(next.getDate() + daysUntilTarget)
  } else if (frequency === 'monthly' && dayOfMonth) {
    next.setDate(dayOfMonth)
    
    if (next <= new Date()) {
      next.setMonth(next.getMonth() + 1)
      next.setDate(dayOfMonth)
    }
  }

  return next
}
