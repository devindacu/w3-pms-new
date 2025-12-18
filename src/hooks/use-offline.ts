import { useState, useEffect } from 'react'
import { offlineManager, type OfflineQueueStatus } from '@/lib/offlineManager'

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(offlineManager.isOnline())
  const [queueStatus, setQueueStatus] = useState<OfflineQueueStatus>(
    offlineManager.getQueueStatus()
  )

  useEffect(() => {
    const unsubscribeOnline = offlineManager.addOnlineStatusListener(setIsOnline)
    const unsubscribeSync = offlineManager.addSyncStatusListener(setQueueStatus)

    setIsOnline(offlineManager.isOnline())
    setQueueStatus(offlineManager.getQueueStatus())

    return () => {
      unsubscribeOnline()
      unsubscribeSync()
    }
  }, [])

  return {
    isOnline,
    queueStatus,
    syncPending: () => offlineManager.syncPendingOperations(),
    clearQueue: () => offlineManager.clearQueue(),
  }
}

export function useOfflineQueue() {
  return {
    queueOperation: (
      type: 'create' | 'update' | 'delete',
      resource: string,
      data: any,
      priority: 'high' | 'medium' | 'low' = 'medium'
    ) => offlineManager.queueOperation(type, resource, data, priority),
    getPendingOperations: () => offlineManager.getPendingOperations(),
  }
}
