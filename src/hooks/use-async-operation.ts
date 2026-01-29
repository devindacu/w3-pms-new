import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface UseAsyncOperationOptions {
  onSuccess?: (result: any) => void
  onError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
  showSuccessToast?: boolean
  showErrorToast?: boolean
}

interface UseAsyncOperationReturn<T> {
  execute: (operation: () => Promise<T>) => Promise<T | undefined>
  isLoading: boolean
  error: Error | null
  data: T | null
  reset: () => void
}

/**
 * Custom hook for handling async operations with loading, error, and success states
 * Automatically shows toast notifications and handles errors gracefully
 * 
 * @example
 * const { execute, isLoading, error } = useAsyncOperation({
 *   successMessage: 'Data saved successfully',
 *   errorMessage: 'Failed to save data'
 * })
 * 
 * await execute(async () => {
 *   return await api.saveData(data)
 * })
 */
export function useAsyncOperation<T = any>(
  options: UseAsyncOperationOptions = {}
): UseAsyncOperationReturn<T> {
  const {
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    showSuccessToast = true,
    showErrorToast = true
  } = options

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(
    async (operation: () => Promise<T>): Promise<T | undefined> => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await operation()
        setData(result)

        if (showSuccessToast && successMessage) {
          toast.success(successMessage)
        }

        if (onSuccess) {
          onSuccess(result)
        }

        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An unexpected error occurred')
        setError(error)

        if (showErrorToast) {
          toast.error(errorMessage || error.message)
        }

        if (onError) {
          onError(error)
        }

        // Log to console for debugging
        console.error('Async operation failed:', error)

        return undefined
      } finally {
        setIsLoading(false)
      }
    },
    [onSuccess, onError, successMessage, errorMessage, showSuccessToast, showErrorToast]
  )

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
    setData(null)
  }, [])

  return {
    execute,
    isLoading,
    error,
    data,
    reset
  }
}
