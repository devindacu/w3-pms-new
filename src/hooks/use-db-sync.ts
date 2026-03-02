import { useEffect, useCallback } from 'react'
import { fetchFromAPI } from '@/lib/api-sync'

type SetterFn<T> = (value: T | ((prev: T | undefined) => T)) => void

export function useDBSync<T>(
  apiEndpoint: string,
  currentValue: T | undefined,
  setValue: SetterFn<T>,
  defaultValue: T,
  enabled: boolean = true
) {
  const syncFromDB = useCallback(async () => {
    if (!enabled) return
    const data = await fetchFromAPI<T>(apiEndpoint, defaultValue)
    // Only update if DB has data and current KV is empty/default
    if (Array.isArray(data) && data.length > 0) {
      if (!Array.isArray(currentValue) || (currentValue as unknown[]).length === 0) {
        setValue(data)
      }
    }
  }, [apiEndpoint, enabled, defaultValue, currentValue, setValue])

  useEffect(() => {
    syncFromDB()
  }, []) // only on mount

  return { syncFromDB }
}
