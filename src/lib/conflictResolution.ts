export type ConflictResolutionStrategy = 'manual' | 'last-write-wins' | 'first-write-wins' | 'merge'

export interface ConflictMetadata {
  conflictId: string
  key: string
  timestamp: number
  tabId: string
  userId?: string
}

export interface ConflictVersion<T> {
  value: T
  metadata: ConflictMetadata
  version: number
}

export interface Conflict<T> {
  id: string
  key: string
  localVersion: ConflictVersion<T>
  remoteVersion: ConflictVersion<T>
  detectedAt: number
  status: 'pending' | 'resolved' | 'ignored'
  resolution?: T
  strategy?: ConflictResolutionStrategy
}

export function detectConflict<T>(
  localValue: T,
  localMetadata: ConflictMetadata,
  remoteValue: T,
  remoteMetadata: ConflictMetadata
): boolean {
  const timeDiff = Math.abs(localMetadata.timestamp - remoteMetadata.timestamp)
  const CONFLICT_THRESHOLD = 5000
  
  if (timeDiff > CONFLICT_THRESHOLD) return false
  
  const localStr = JSON.stringify(localValue)
  const remoteStr = JSON.stringify(remoteValue)
  
  return localStr !== remoteStr
}

export function createConflict<T>(
  key: string,
  localValue: T,
  localMetadata: ConflictMetadata,
  remoteValue: T,
  remoteMetadata: ConflictMetadata
): Conflict<T> {
  return {
    id: `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    key,
    localVersion: {
      value: localValue,
      metadata: localMetadata,
      version: 1,
    },
    remoteVersion: {
      value: remoteValue,
      metadata: remoteMetadata,
      version: 1,
    },
    detectedAt: Date.now(),
    status: 'pending',
  }
}

export function resolveConflict<T>(
  conflict: Conflict<T>,
  strategy: ConflictResolutionStrategy,
  customResolution?: T
): T {
  switch (strategy) {
    case 'last-write-wins':
      return conflict.localVersion.metadata.timestamp > conflict.remoteVersion.metadata.timestamp
        ? conflict.localVersion.value
        : conflict.remoteVersion.value

    case 'first-write-wins':
      return conflict.localVersion.metadata.timestamp < conflict.remoteVersion.metadata.timestamp
        ? conflict.localVersion.value
        : conflict.remoteVersion.value

    case 'manual':
      if (!customResolution) {
        throw new Error('Manual resolution requires a custom resolution value')
      }
      return customResolution

    case 'merge':
      return mergeValues(conflict.localVersion.value, conflict.remoteVersion.value)

    default:
      return conflict.localVersion.value
  }
}

function mergeValues<T>(local: T, remote: T): T {
  if (Array.isArray(local) && Array.isArray(remote)) {
    const localIds = new Set(local.map((item: any) => item.id))
    const merged = [...local]
    
    remote.forEach((item: any) => {
      if (!localIds.has(item.id)) {
        merged.push(item)
      }
    })
    
    return merged as T
  }

  if (typeof local === 'object' && local !== null && typeof remote === 'object' && remote !== null) {
    return { ...remote, ...local } as T
  }

  return local
}

export function getConflictDiff<T>(local: T, remote: T): Array<{ field: string; local: any; remote: any }> {
  const diff: Array<{ field: string; local: any; remote: any }> = []

  if (typeof local !== 'object' || local === null || typeof remote !== 'object' || remote === null) {
    return [{ field: 'value', local, remote }]
  }

  const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)])

  allKeys.forEach((key) => {
    const localVal = (local as any)[key]
    const remoteVal = (remote as any)[key]

    if (JSON.stringify(localVal) !== JSON.stringify(remoteVal)) {
      diff.push({
        field: key,
        local: localVal,
        remote: remoteVal,
      })
    }
  })

  return diff
}

export function formatTimestamp(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  
  if (diff < 1000) return 'just now'
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  
  return new Date(timestamp).toLocaleString()
}
