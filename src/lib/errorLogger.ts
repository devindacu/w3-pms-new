/**
 * Error Logging Utility
 * Centralized error logging for production monitoring
 */

interface ErrorLog {
  id: string
  timestamp: number
  level: 'error' | 'warning' | 'info'
  message: string
  stack?: string
  component?: string
  user?: string
  context?: Record<string, any>
}

class ErrorLogger {
  private static instance: ErrorLogger
  private logs: ErrorLog[] = []
  private maxLogs = 1000 // Keep last 1000 logs
  private storageKey = 'error-logs'

  private constructor() {
    // Load existing logs from storage
    this.loadLogs()
    
    // Set up global error handler
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleWindowError.bind(this))
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this))
    }
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger()
    }
    return ErrorLogger.instance
  }

  private loadLogs() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        this.logs = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load error logs:', error)
    }
  }

  private saveLogs() {
    try {
      // Keep only the most recent logs
      if (this.logs.length > this.maxLogs) {
        this.logs = this.logs.slice(-this.maxLogs)
      }
      localStorage.setItem(this.storageKey, JSON.stringify(this.logs))
    } catch (error) {
      console.error('Failed to save error logs:', error)
    }
  }

  private handleWindowError(event: ErrorEvent) {
    this.logError({
      message: event.message,
      stack: event.error?.stack,
      component: 'Global',
      context: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    })
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent) {
    this.logError({
      message: `Unhandled Promise Rejection: ${event.reason}`,
      stack: event.reason?.stack,
      component: 'Promise',
      context: {
        reason: event.reason
      }
    })
  }

  private createLog(
    level: 'error' | 'warning' | 'info',
    message: string,
    options?: {
      stack?: string
      component?: string
      user?: string
      context?: Record<string, any>
    }
  ): ErrorLog {
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      message,
      stack: options?.stack,
      component: options?.component,
      user: options?.user,
      context: options?.context
    }
  }

  logError(options: {
    message: string
    stack?: string
    component?: string
    user?: string
    context?: Record<string, any>
  }) {
    const log = this.createLog('error', options.message, options)
    this.logs.push(log)
    this.saveLogs()
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', log)
    }
    
    return log
  }

  logWarning(options: {
    message: string
    component?: string
    user?: string
    context?: Record<string, any>
  }) {
    const log = this.createLog('warning', options.message, options)
    this.logs.push(log)
    this.saveLogs()
    
    if (process.env.NODE_ENV === 'development') {
      console.warn('Warning logged:', log)
    }
    
    return log
  }

  logInfo(options: {
    message: string
    component?: string
    user?: string
    context?: Record<string, any>
  }) {
    const log = this.createLog('info', options.message, options)
    this.logs.push(log)
    this.saveLogs()
    
    if (process.env.NODE_ENV === 'development') {
      console.info('Info logged:', log)
    }
    
    return log
  }

  getLogs(): ErrorLog[] {
    return [...this.logs]
  }

  getLogsByLevel(level: 'error' | 'warning' | 'info'): ErrorLog[] {
    return this.logs.filter(log => log.level === level)
  }

  getLogsByComponent(component: string): ErrorLog[] {
    return this.logs.filter(log => log.component === component)
  }

  getLogsSince(timestamp: number): ErrorLog[] {
    return this.logs.filter(log => log.timestamp >= timestamp)
  }

  clearLogs() {
    this.logs = []
    this.saveLogs()
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  getMetrics() {
    const now = Date.now()
    const oneHourAgo = now - 60 * 60 * 1000
    const oneDayAgo = now - 24 * 60 * 60 * 1000

    const recentLogs = this.logs.filter(log => log.timestamp >= oneDayAgo)
    const hourlyLogs = this.logs.filter(log => log.timestamp >= oneHourAgo)

    return {
      total: this.logs.length,
      errors: this.logs.filter(l => l.level === 'error').length,
      warnings: this.logs.filter(l => l.level === 'warning').length,
      info: this.logs.filter(l => l.level === 'info').length,
      last24Hours: recentLogs.length,
      lastHour: hourlyLogs.length,
      errorRate: hourlyLogs.filter(l => l.level === 'error').length / 1, // per hour
      topComponents: this.getTopComponents(5),
      topErrors: this.getTopErrors(5)
    }
  }

  private getTopComponents(limit: number) {
    const counts = new Map<string, number>()
    this.logs.forEach(log => {
      if (log.component) {
        counts.set(log.component, (counts.get(log.component) || 0) + 1)
      }
    })
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([component, count]) => ({ component, count }))
  }

  private getTopErrors(limit: number) {
    const counts = new Map<string, number>()
    this.logs.filter(l => l.level === 'error').forEach(log => {
      const msg = log.message.substring(0, 100)
      counts.set(msg, (counts.get(msg) || 0) + 1)
    })
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([message, count]) => ({ message, count }))
  }
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance()

// Helper functions for easy usage
export const logError = (message: string, component?: string, context?: Record<string, any>) => {
  return errorLogger.logError({ message, component, context })
}

export const logWarning = (message: string, component?: string, context?: Record<string, any>) => {
  return errorLogger.logWarning({ message, component, context })
}

export const logInfo = (message: string, component?: string, context?: Record<string, any>) => {
  return errorLogger.logInfo({ message, component, context })
}

// React hook for components
export const useErrorLogger = () => {
  const logError = (error: Error | string, context?: Record<string, any>) => {
    const message = error instanceof Error ? error.message : error
    const stack = error instanceof Error ? error.stack : undefined
    return errorLogger.logError({ message, stack, context })
  }

  const logWarning = (message: string, context?: Record<string, any>) => {
    return errorLogger.logWarning({ message, context })
  }

  const logInfo = (message: string, context?: Record<string, any>) => {
    return errorLogger.logInfo({ message, context })
  }

  return { logError, logWarning, logInfo }
}
