import { useState, useEffect, useCallback, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { useBroadcastSync, type SyncMessage } from './use-broadcast-sync'

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'conflict' | 'error'

export type SyncConflict<T> = {
  id: string
  key: string
  localValue: T
  remoteValue: T
  localTimestamp: number
  remoteTimestamp: number
  localVersion: number
  remoteVersion: number
  deviceId: string
  userId?: string
  remoteUserId?: string
  fieldChanges: string[]
  status: 'pending' | 'resolved' | 'ignored'
  resolvedValue?: T
  strategy?: ConflictResolutionStrategy
}

export type ConflictResolutionStrategy = 
  | 'keep-local' 
  | 'keep-remote' 
  | 'merge' 
  | 'manual'

export type SyncQueueItem<T> = {
  id: string
  key: string
  value: T
  timestamp: number
  version: number
  retries: number
  deviceId: string
  userId?: string
}

export interface ServerSyncOptions {
  syncInterval?: number
  conflictWindow?: number
  autoResolveStrategy?: ConflictResolutionStrategy
  maxQueueSize?: number
  maxRetries?: number
  enableSync?: boolean
  onConflictDetected?: (conflict: SyncConflict<any>) => void
  onConflictResolved?: (conflict: SyncConflict<any>) => void
  onSyncError?: (error: Error) => void
}

const DEFAULT_OPTIONS: Required<ServerSyncOptions> = {
  syncInterval: 30000,
  conflictWindow: 30000,
  autoResolveStrategy: 'manual',
  maxQueueSize: 1000,
  maxRetries: 5,
  enableSync: true,
  onConflictDetected: () => {},
  onConflictResolved: () => {},
  onSyncError: () => {},
}

const DEVICE_ID = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export function useServerSync<T>(
  key: string,
  defaultValue: T,
  options: ServerSyncOptions = {}
) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  const [value, setValue, deleteValue] = useKV<T>(key, defaultValue)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced')
  const [conflicts, setConflicts] = useState<SyncConflict<T>[]>([])
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem<T>[]>([])
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now())
  const [version, setVersion] = useState<number>(0)
  
  const syncIntervalRef = useRef<NodeJS.Timeout>()
  const isSyncingRef = useRef(false)

  const getUserId = async () => {
    try {
      const user = await window.spark.user()
      return user?.id || undefined
    } catch {
      return undefined
    }
  }

  const pushToServer = async (item: SyncQueueItem<T>) => {
    try {
      const remoteData = await window.spark.kv.get<{
        value: T
        timestamp: number
        version: number
        userId?: string
      }>(`${key}_meta`)

      if (remoteData) {
        const timeDiff = Math.abs(item.timestamp - remoteData.timestamp)
        const isConflict = timeDiff < opts.conflictWindow && 
                          remoteData.version !== item.version - 1

        if (isConflict) {
          const conflict: SyncConflict<T> = {
            id: `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            key,
            localValue: item.value,
            remoteValue: remoteData.value,
            localTimestamp: item.timestamp,
            remoteTimestamp: remoteData.timestamp,
            localVersion: item.version,
            remoteVersion: remoteData.version,
            deviceId: item.deviceId,
            userId: item.userId,
            remoteUserId: remoteData.userId,
            fieldChanges: detectFieldChanges(item.value, remoteData.value),
            status: 'pending',
          }

          setConflicts((prev) => [...prev, conflict])
          opts.onConflictDetected(conflict)
          setSyncStatus('conflict')

          if (opts.autoResolveStrategy !== 'manual') {
            await resolveConflictInternal(conflict, opts.autoResolveStrategy)
          }
          
          return false
        }
      }

      await window.spark.kv.set(`${key}_meta`, {
        value: item.value,
        timestamp: item.timestamp,
        version: item.version,
        userId: item.userId,
      })

      await window.spark.kv.set(key, item.value)
      
      return true
    } catch (error) {
      console.error('Server sync push error:', error)
      opts.onSyncError(error as Error)
      return false
    }
  }

  const pullFromServer = async () => {
    try {
      const remoteData = await window.spark.kv.get<{
        value: T
        timestamp: number
        version: number
        userId?: string
      }>(`${key}_meta`)

      if (!remoteData) return

      if (remoteData.version > version) {
        const timeDiff = Math.abs(Date.now() - remoteData.timestamp)
        
        if (timeDiff < opts.conflictWindow && version > 0) {
          const conflict: SyncConflict<T> = {
            id: `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            key,
            localValue: value,
            remoteValue: remoteData.value,
            localTimestamp: Date.now(),
            remoteTimestamp: remoteData.timestamp,
            localVersion: version,
            remoteVersion: remoteData.version,
            deviceId: DEVICE_ID,
            remoteUserId: remoteData.userId,
            fieldChanges: detectFieldChanges(value, remoteData.value),
            status: 'pending',
          }

          setConflicts((prev) => [...prev, conflict])
          opts.onConflictDetected(conflict)
          setSyncStatus('conflict')

          if (opts.autoResolveStrategy !== 'manual') {
            await resolveConflictInternal(conflict, opts.autoResolveStrategy)
          }
        } else if (remoteData.value !== undefined) {
          setValue(remoteData.value as any)
          setVersion(remoteData.version)
          setLastSyncTime(Date.now())
        }
      }
    } catch (error) {
      console.error('Server sync pull error:', error)
      opts.onSyncError(error as Error)
      setSyncStatus('error')
    }
  }

  const processSyncQueue = async () => {
    if (isSyncingRef.current || syncQueue.length === 0) return
    
    isSyncingRef.current = true
    setSyncStatus('syncing')

    const item = syncQueue[0]
    const success = await pushToServer(item)

    if (success) {
      setSyncQueue((prev) => prev.slice(1))
      setLastSyncTime(Date.now())
      
      if (syncQueue.length === 1) {
        setSyncStatus('synced')
      }
    } else {
      if (item.retries < opts.maxRetries) {
        setSyncQueue((prev) => [
          ...prev.slice(1),
          { ...item, retries: item.retries + 1 }
        ])
      } else {
        setSyncQueue((prev) => prev.slice(1))
        setSyncStatus('error')
      }
    }

    isSyncingRef.current = false
  }

  const detectFieldChanges = (local: T, remote: T): string[] => {
    const changes: string[] = []
    
    if (typeof local === 'object' && local !== null && 
        typeof remote === 'object' && remote !== null) {
      const allKeys = new Set([
        ...Object.keys(local),
        ...Object.keys(remote)
      ])
      
      for (const key of allKeys) {
        if (JSON.stringify((local as any)[key]) !== JSON.stringify((remote as any)[key])) {
          changes.push(key)
        }
      }
    }
    
    return changes
  }

  const mergeValues = (local: T, remote: T, fieldChanges: string[]): T => {
    if (typeof local !== 'object' || local === null) return local
    if (typeof remote !== 'object' || remote === null) return remote

    const merged = { ...remote } as any
    
    for (const key of Object.keys(local as any)) {
      if (!fieldChanges.includes(key)) {
        merged[key] = (local as any)[key]
      }
    }

    return merged as T
  }

  const resolveConflictInternal = async (
    conflict: SyncConflict<T>,
    strategy: ConflictResolutionStrategy,
    customValue?: T
  ) => {
    let resolvedValue: T

    switch (strategy) {
      case 'keep-local':
        resolvedValue = conflict.localValue
        break
      case 'keep-remote':
        resolvedValue = conflict.remoteValue
        break
      case 'merge':
        resolvedValue = mergeValues(
          conflict.localValue,
          conflict.remoteValue,
          conflict.fieldChanges
        )
        break
      case 'manual':
        if (!customValue) return
        resolvedValue = customValue
        break
    }

    setValue(resolvedValue as any)
    
    const newVersion = Math.max(conflict.localVersion, conflict.remoteVersion) + 1
    setVersion(newVersion)

    const userId = await getUserId()
    
    await window.spark.kv.set(`${key}_meta`, {
      value: resolvedValue,
      timestamp: Date.now(),
      version: newVersion,
      userId,
    })

    await window.spark.kv.set(key, resolvedValue)

    setConflicts((prev) =>
      prev.map((c) =>
        c.id === conflict.id
          ? { ...c, status: 'resolved' as const, resolvedValue, strategy }
          : c
      )
    )

    const resolvedConflict = conflicts.find((c) => c.id === conflict.id)
    if (resolvedConflict) {
      opts.onConflictResolved({ ...resolvedConflict, status: 'resolved', resolvedValue, strategy })
    }

    if (conflicts.filter((c) => c.status === 'pending').length === 1) {
      setSyncStatus('synced')
    }

    setLastSyncTime(Date.now())
  }

  const handleBroadcastMessage = useCallback((message: SyncMessage) => {
    if (message.key !== key) return
    
    if (message.type === 'kv-update') {
      setValue(message.value as any)
    }
  }, [key, setValue])

  const { broadcast } = useBroadcastSync(handleBroadcastMessage)

  const setValueWithSync = useCallback(
    async (newValue: T | ((prev: T) => T)) => {
      const userId = (await getUserId()) || undefined
      
      setValue((currentValue: T) => {
        const resolvedValue =
          typeof newValue === 'function'
            ? (newValue as (prev: T) => T)(currentValue)
            : newValue

        const newVersion = version + 1
        setVersion(newVersion)

        const queueItem: SyncQueueItem<T> = {
          id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          key,
          value: resolvedValue,
          timestamp: Date.now(),
          version: newVersion,
          retries: 0,
          deviceId: DEVICE_ID,
          userId,
        }

        setSyncQueue((prev) => {
          if (prev.length >= opts.maxQueueSize) {
            return [...prev.slice(1), queueItem]
          }
          return [...prev, queueItem]
        })

        broadcast({
          type: 'kv-update',
          key,
          value: resolvedValue,
        })

        return resolvedValue
      })
    },
    [setValue, broadcast, key, version, opts.maxQueueSize]
  )

  const resolveConflict = useCallback(
    (conflictId: string, strategy: ConflictResolutionStrategy, customValue?: T) => {
      const conflict = conflicts.find((c) => c.id === conflictId)
      if (!conflict) return

      resolveConflictInternal(conflict, strategy, customValue)
    },
    [conflicts]
  )

  const ignoreConflict = useCallback((conflictId: string) => {
    setConflicts((prev) =>
      prev.map((c) =>
        c.id === conflictId ? { ...c, status: 'ignored' as const } : c
      )
    )
    
    if (conflicts.filter((c) => c.status === 'pending').length === 1) {
      setSyncStatus('synced')
    }
  }, [conflicts])

  const forceSync = useCallback(async () => {
    await processSyncQueue()
    await pullFromServer()
  }, [syncQueue])

  useEffect(() => {
    if (!opts.enableSync) return

    const interval = setInterval(() => {
      processSyncQueue()
      pullFromServer()
    }, opts.syncInterval)

    syncIntervalRef.current = interval

    pullFromServer()

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [opts.enableSync, opts.syncInterval])

  useEffect(() => {
    if (syncQueue.length > 0 && !isSyncingRef.current) {
      processSyncQueue()
    }
  }, [syncQueue])

  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus('synced')
      forceSync()
    }

    const handleOffline = () => {
      setSyncStatus('offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if (!navigator.onLine) {
      setSyncStatus('offline')
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const pendingConflicts = conflicts.filter((c) => c.status === 'pending')

  return {
    value,
    setValue: setValueWithSync,
    deleteValue,
    syncStatus,
    conflicts,
    pendingConflicts,
    resolveConflict,
    ignoreConflict,
    queueDepth: syncQueue.length,
    lastSyncTime,
    forceSync,
    hasPendingConflicts: pendingConflicts.length > 0,
    version,
  }
}
