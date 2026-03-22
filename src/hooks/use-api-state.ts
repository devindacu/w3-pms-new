import { useState, useEffect, useCallback, useRef } from 'react'

async function syncArrayToApi<T extends { id?: string | number }>(
  endpoint: string,
  prev: T[],
  next: T[]
): Promise<void> {
  const prevMap = new Map(prev.map(i => [String(i.id), i]))
  const nextMap = new Map(next.map(i => [String(i.id), i]))

  for (const [id] of prevMap) {
    if (!nextMap.has(id)) {
      await fetch(`/api/${endpoint}/${id}`, { method: 'DELETE' }).catch(() => {})
    }
  }

  for (const [id, item] of nextMap) {
    if (!prevMap.has(id)) {
      await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      }).catch(() => {})
    }
  }

  for (const [id, item] of nextMap) {
    const prevItem = prevMap.get(id)
    if (prevItem && JSON.stringify(prevItem) !== JSON.stringify(item)) {
      await fetch(`/api/${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      }).catch(() => {})
    }
  }
}

export function useApiState<T extends { id?: string | number }>(
  endpoint: string,
  defaultValue: T[] = []
): [T[], React.Dispatch<React.SetStateAction<T[]>>, () => void, boolean] {
  const [items, setItemsLocal] = useState<T[]>(defaultValue)
  const [isLoading, setIsLoading] = useState(true)
  const prevRef = useRef<T[]>(defaultValue)
  const loadedRef = useRef(false)

  const fetchData = useCallback(() => {
    setIsLoading(true)
    fetch(`/api/${endpoint}`)
      .then(r => (r.ok ? r.json() : []))
      .then(data => {
        if (Array.isArray(data)) {
          setItemsLocal(data)
          prevRef.current = data
          loadedRef.current = true
        }
        setIsLoading(false)
      })
      .catch(() => {
        loadedRef.current = true
        setIsLoading(false)
      })
  }, [endpoint])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const setItems = useCallback(
    (updater: T[] | ((prev: T[]) => T[])) => {
      setItemsLocal(prev => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        if (loadedRef.current) {
          syncArrayToApi(endpoint, prevRef.current, next).catch(() => {})
        }
        prevRef.current = next
        return next
      })
    },
    [endpoint]
  )

  return [items, setItems as React.Dispatch<React.SetStateAction<T[]>>, fetchData, isLoading]
}

export function useApiSyncState<T extends { id?: string | number }>(
  endpoint: string,
  defaultValue: T[] = []
): {
  value: T[]
  setValue: React.Dispatch<React.SetStateAction<T[]>>
  syncStatus: 'synced' | 'syncing' | 'offline' | 'conflict' | 'error'
  pendingConflicts: { id: string; [key: string]: unknown }[]
  resolveConflict: (conflictId: string, strategy?: unknown, customValue?: unknown) => void
  ignoreConflict: (conflictId: string) => void
  queueDepth: number
  lastSyncTime: number
  forceSync: () => void
  isLoading: boolean
} {
  const [value, setValue, forceSync, isLoading] = useApiState<T>(endpoint, defaultValue)
  const [syncStatus] = useState<'synced' | 'syncing' | 'offline' | 'conflict' | 'error'>('synced')
  const lastSyncTime = useRef(Date.now())

  return {
    value,
    setValue,
    syncStatus,
    pendingConflicts: [] as { id: string; [key: string]: unknown }[],
    resolveConflict: (_conflictId: string, ..._args: unknown[]) => {},
    ignoreConflict: (_conflictId: string) => {},
    queueDepth: 0,
    lastSyncTime: lastSyncTime.current,
    forceSync,
    isLoading,
  }
}

export function useSettingState<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [data, setDataLocal] = useState<T>(defaultValue)
  const loadedRef = useRef(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingValueRef = useRef<T>(defaultValue)

  useEffect(() => {
    fetch(`/api/extra-settings/${encodeURIComponent(key)}`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d && d.value !== undefined) {
          setDataLocal(d.value as T)
          pendingValueRef.current = d.value as T
        }
        loadedRef.current = true
      })
      .catch(() => {
        loadedRef.current = true
      })
  }, [key])

  const setData = useCallback(
    (newValueOrFn: T | ((prev: T) => T)) => {
      setDataLocal(prev => {
        const newValue = typeof newValueOrFn === 'function' ? (newValueOrFn as (prev: T) => T)(prev) : newValueOrFn
        pendingValueRef.current = newValue
        if (loadedRef.current) {
          if (debounceRef.current) clearTimeout(debounceRef.current)
          debounceRef.current = setTimeout(() => {
            fetch(`/api/extra-settings/${encodeURIComponent(key)}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ value: pendingValueRef.current }),
            }).catch(() => {})
          }, 500)
        }
        return newValue
      })
    },
    [key]
  )

  return [data, setData]
}
