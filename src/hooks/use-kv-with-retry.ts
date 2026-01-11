import { useKV } from '@github/spark/hooks'
import { useEffect, useRef, useState } from 'react'

export function useKVWithRetry<T>(
  key: string,
  defaultValue: T,
  maxRetries = 3
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [data, setData, deleteData] = useKV<T>(key, defaultValue)
  const [retryCount, setRetryCount] = useState(0)
  const lastErrorRef = useRef<Error | null>(null)

  useEffect(() => {
    if (data === null || data === undefined) {
      if (retryCount < maxRetries) {
        const timer = setTimeout(() => {
          setRetryCount((prev) => prev + 1)
        }, 1000 * Math.pow(2, retryCount))
        return () => clearTimeout(timer)
      } else {
        if (lastErrorRef.current) {
          console.warn(`KV retry limit reached for key: ${key}`, lastErrorRef.current)
        }
      }
    } else {
      setRetryCount(0)
      lastErrorRef.current = null
    }
  }, [data, key, maxRetries, retryCount])

  const setDataWithErrorHandling = (value: T | ((prev: T) => T)) => {
    try {
      setData(value)
    } catch (error) {
      lastErrorRef.current = error as Error
      console.error(`Error setting KV data for key: ${key}`, error)
    }
  }

  const deleteDataWithErrorHandling = () => {
    try {
      deleteData()
    } catch (error) {
      lastErrorRef.current = error as Error
      console.error(`Error deleting KV data for key: ${key}`, error)
    }
  }

  return [data ?? defaultValue, setDataWithErrorHandling, deleteDataWithErrorHandling]
}
