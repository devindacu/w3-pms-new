import { useEffect, useState, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { useBroadcastSync, type SyncMessage } from './use-broadcast-sync'

export function useSyncedKV<T>(key: string, defaultValue: T) {
  const [value, setValue, deleteValue] = useKV<T>(key, defaultValue)
  const [isInitialized, setIsInitialized] = useState(false)

  const handleSyncMessage = useCallback((message: SyncMessage) => {
    if (message.key !== key) return

    if (message.type === 'kv-update') {
      setValue(message.value)
    } else if (message.type === 'kv-delete') {
      setValue(defaultValue)
    }
  }, [key, setValue, defaultValue])

  const { broadcast } = useBroadcastSync(handleSyncMessage)

  const syncedSetValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue((currentValue: T | undefined) => {
      const safeCurrentValue = currentValue ?? defaultValue
      const resolvedValue = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(safeCurrentValue)
        : newValue

      broadcast({
        type: 'kv-update',
        key,
        value: resolvedValue,
      })

      return resolvedValue
    })
  }, [setValue, broadcast, key, defaultValue])

  const syncedDeleteValue = useCallback(() => {
    deleteValue()
    broadcast({
      type: 'kv-delete',
      key,
    })
  }, [deleteValue, broadcast, key])

  useEffect(() => {
    setIsInitialized(true)
  }, [])

  return [value, syncedSetValue, syncedDeleteValue] as const
}
