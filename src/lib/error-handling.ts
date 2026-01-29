import { toast } from 'sonner'

/**
 * Enhanced error class with additional context
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * Log error to console with formatted output
 */
export function logError(error: Error | AppError, context?: Record<string, any>) {
  console.group(`❌ Error: ${error.message}`)
  console.error('Name:', error.name)
  console.error('Message:', error.message)
  
  if (error instanceof AppError && error.code) {
    console.error('Code:', error.code)
  }
  
  if (error instanceof AppError && error.context) {
    console.error('Error Context:', error.context)
  }
  
  if (context) {
    console.error('Additional Context:', context)
  }
  
  console.error('Stack:', error.stack)
  console.groupEnd()
}

/**
 * Handle error with toast notification and logging
 */
export function handleError(
  error: unknown,
  options: {
    title?: string
    message?: string
    showToast?: boolean
    logToConsole?: boolean
    context?: Record<string, any>
  } = {}
) {
  const {
    title = 'Error',
    message,
    showToast = true,
    logToConsole = true,
    context
  } = options

  const err = error instanceof Error ? error : new Error(String(error))

  if (logToConsole) {
    logError(err, context)
  }

  if (showToast) {
    const toastMessage = message || err.message || 'An unexpected error occurred'
    toast.error(title, {
      description: toastMessage
    })
  }
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    errorMessage?: string
    successMessage?: string
    onError?: (error: Error) => void
    onSuccess?: (result: any) => void
  } = {}
): T {
  return (async (...args: Parameters<T>) => {
    try {
      const result = await fn(...args)
      
      if (options.successMessage) {
        toast.success(options.successMessage)
      }
      
      if (options.onSuccess) {
        options.onSuccess(result)
      }
      
      return result
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      
      handleError(err, {
        message: options.errorMessage
      })
      
      if (options.onError) {
        options.onError(err)
      }
      
      throw err
    }
  }) as T
}

/**
 * Validate that required fields are present
 * Note: Treats empty strings as missing values. For fields where empty strings
 * are valid, exclude them from the requiredFields array.
 */
export function validateRequired<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[],
  fieldLabels?: Partial<Record<keyof T, string>>
): void {
  const missingFields: string[] = []

  for (const field of requiredFields) {
    const value = data[field]
    if (value === undefined || value === null || value === '') {
      const label = fieldLabels?.[field] || String(field)
      missingFields.push(label)
    }
  }

  if (missingFields.length > 0) {
    throw new AppError(
      `Please fill in the required fields: ${missingFields.join(', ')}`,
      'VALIDATION_ERROR',
      { missingFields, data }
    )
  }
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number
    initialDelay?: number
    maxDelay?: number
    onRetry?: (attempt: number, error: Error) => void
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    onRetry
  } = options

  let lastError: Error | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt === maxRetries) {
        break
      }

      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay)

      if (onRetry) {
        onRetry(attempt + 1, lastError)
      }

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  // This point is only reached if all retries failed
  if (!lastError) {
    throw new Error('Operation failed but no error was captured')
  }
  
  throw lastError
}

/**
 * Safe JSON parse with error handling
 */
export function safeParse<T>(
  json: string,
  fallback: T
): T {
  try {
    return JSON.parse(json)
  } catch (error) {
    console.warn('Failed to parse JSON, using fallback value:', error)
    return fallback
  }
}

/**
 * Type guard for AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
