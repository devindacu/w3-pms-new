import { useState, useCallback, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { useBroadcastSync, type SyncMessage } from './use-broadcast-sync'
import {
  type Conflict,
  type ConflictMetadata,
  type ConflictResolutionStrategy,
  detectConflict,
  createConflict,
  resolveConflict,
} from '@/lib/conflictResolution'

interface UseConflictResolverOptions {
  autoResolveStrategy?: ConflictResolutionStrategy
  onConflictDetected?: (conflict: Conflict<any>) => void
  onConflictResolved?: (conflict: Conflict<any>, resolution: any) => void
}

export function useConflictResolver<T>(
  key: string,
  defaultValue: T,
  options: UseConflictResolverOptions = {}
) {
  const [value, setValue, deleteValue] = useKV<T>(key, defaultValue)
  const [conflicts, setConflicts] = useState<Conflict<T>[]>([])
  const [pendingUpdate, setPendingUpdate] = useState<{
    value: T
    metadata: ConflictMetadata
  } | null>(null)

  const handleSyncMessage = useCallback(
    (message: SyncMessage) => {
      if (message.key !== key) return
      if (message.type !== 'kv-update') return

      const remoteMetadata: ConflictMetadata = {
        conflictId: `${message.tabId}-${message.timestamp}`,
        key,
        timestamp: message.timestamp,
        tabId: message.tabId,
        userId: message.userId,
      }

      if (pendingUpdate) {
        const hasConflict = detectConflict(
          pendingUpdate.value,
          pendingUpdate.metadata,
          message.value,
          remoteMetadata
        )

        if (hasConflict) {
          const conflict = createConflict(
            key,
            pendingUpdate.value,
            pendingUpdate.metadata,
            message.value,
            remoteMetadata
          )

          setConflicts((prev) => [...prev, conflict])
          options.onConflictDetected?.(conflict)

          if (options.autoResolveStrategy) {
            resolveConflictById(conflict.id, options.autoResolveStrategy)
          }
          return
        }
      }

      setValue(message.value)
    },
    [key, pendingUpdate, setValue, options]
  )

  const { broadcast, tabId } = useBroadcastSync(handleSyncMessage)

  const setValueWithConflictDetection = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((currentValue: T) => {
        const resolvedValue =
          typeof newValue === 'function'
            ? (newValue as (prev: T) => T)(currentValue)
            : newValue

        const metadata: ConflictMetadata = {
          conflictId: `${tabId}-${Date.now()}`,
          key,
          timestamp: Date.now(),
          tabId,
        }

        setPendingUpdate({ value: resolvedValue, metadata })

        setTimeout(() => {
          setPendingUpdate(null)
        }, 10000)

        broadcast({
          type: 'kv-update',
          key,
          value: resolvedValue,
        })

        return resolvedValue
      })
    },
    [setValue, broadcast, key, tabId]
  )

  const resolveConflictById = useCallback(
    (conflictId: string, strategy: ConflictResolutionStrategy, customResolution?: T) => {
      setConflicts((prev) => {
        const conflict = prev.find((c) => c.id === conflictId)
        if (!conflict) return prev

        const resolution = resolveConflict(conflict, strategy, customResolution)

        setValue(resolution)
        broadcast({
          type: 'kv-update',
          key,
          value: resolution,
        })

        const resolvedConflict: Conflict<T> = {
          ...conflict,
          status: 'resolved',
          resolution,
          strategy,
        }

        options.onConflictResolved?.(resolvedConflict, resolution)

        return prev.map((c) => (c.id === conflictId ? resolvedConflict : c))
      })
    },
    [setValue, broadcast, key, options]
  )

  const ignoreConflict = useCallback((conflictId: string) => {
    setConflicts((prev) =>
      prev.map((c) => (c.id === conflictId ? { ...c, status: 'ignored' as const } : c))
    )
  }, [])

  const clearResolvedConflicts = useCallback(() => {
    setConflicts((prev) => prev.filter((c) => c.status === 'pending'))
  }, [])

  const pendingConflicts = conflicts.filter((c) => c.status === 'pending')

  return {
    value,
    setValue: setValueWithConflictDetection,
    deleteValue,
    conflicts,
    pendingConflicts,
    resolveConflict: resolveConflictById,
    ignoreConflict,
    clearResolvedConflicts,
    hasPendingConflicts: pendingConflicts.length > 0,
  }
}
