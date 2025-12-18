import { toast } from 'sonner'

export type OfflineOperation = {
  id: string
  type: 'create' | 'update' | 'delete'
  resource: string
  data: any
  timestamp: number
  synced: boolean
  priority: 'high' | 'medium' | 'low'
}

export type OfflineQueueStatus = {
  pending: number
  failed: number
  synced: number
  lastSync: number | null
}

class OfflineManager {
  private static instance: OfflineManager
  private queueKey = 'w3-hotel-offline-queue'
  private statusKey = 'w3-hotel-offline-status'
  private listeners: Set<(isOnline: boolean) => void> = new Set()
  private syncListeners: Set<(status: OfflineQueueStatus) => void> = new Set()
  
  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline)
      window.addEventListener('offline', this.handleOffline)
    }
  }

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager()
    }
    return OfflineManager.instance
  }

  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true
  }

  private handleOnline = () => {
    toast.success('Back online! Syncing pending operations...', {
      duration: 3000,
    })
    this.listeners.forEach(listener => listener(true))
    this.syncPendingOperations()
  }

  private handleOffline = () => {
    toast.warning('You are offline. Changes will be saved locally.', {
      duration: 5000,
    })
    this.listeners.forEach(listener => listener(false))
  }

  addOnlineStatusListener(callback: (isOnline: boolean) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  addSyncStatusListener(callback: (status: OfflineQueueStatus) => void) {
    this.syncListeners.add(callback)
    return () => this.syncListeners.delete(callback)
  }

  private notifySyncListeners() {
    const status = this.getQueueStatus()
    this.syncListeners.forEach(listener => listener(status))
  }

  async queueOperation(
    type: OfflineOperation['type'],
    resource: string,
    data: any,
    priority: OfflineOperation['priority'] = 'medium'
  ): Promise<void> {
    const operation: OfflineOperation = {
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      resource,
      data,
      timestamp: Date.now(),
      synced: false,
      priority,
    }

    const queue = this.getQueue()
    queue.push(operation)
    this.saveQueue(queue)
    
    if (!this.isOnline()) {
      toast.info(`Operation queued for sync (${queue.filter(q => !q.synced).length} pending)`, {
        duration: 2000,
      })
    }

    this.notifySyncListeners()
  }

  private getQueue(): OfflineOperation[] {
    try {
      const stored = localStorage.getItem(this.queueKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load offline queue:', error)
      return []
    }
  }

  private saveQueue(queue: OfflineOperation[]): void {
    try {
      localStorage.setItem(this.queueKey, JSON.stringify(queue))
    } catch (error) {
      console.error('Failed to save offline queue:', error)
      toast.error('Failed to save offline data')
    }
  }

  getQueueStatus(): OfflineQueueStatus {
    const queue = this.getQueue()
    const statusData = this.getStatusData()
    
    return {
      pending: queue.filter(op => !op.synced).length,
      failed: 0,
      synced: queue.filter(op => op.synced).length,
      lastSync: statusData.lastSync,
    }
  }

  private getStatusData() {
    try {
      const stored = localStorage.getItem(this.statusKey)
      return stored ? JSON.parse(stored) : { lastSync: null }
    } catch {
      return { lastSync: null }
    }
  }

  private updateStatusData(data: any) {
    try {
      localStorage.setItem(this.statusKey, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  async syncPendingOperations(): Promise<void> {
    if (!this.isOnline()) {
      toast.error('Cannot sync while offline')
      return
    }

    const queue = this.getQueue()
    const pendingOps = queue.filter(op => !op.synced)

    if (pendingOps.length === 0) {
      toast.info('No pending operations to sync')
      return
    }

    const sortedOps = pendingOps.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp
    })

    let syncedCount = 0
    const updatedQueue = [...queue]

    for (const op of sortedOps) {
      try {
        await this.processOperation(op)
        const index = updatedQueue.findIndex(q => q.id === op.id)
        if (index !== -1) {
          updatedQueue[index].synced = true
          syncedCount++
        }
      } catch (error) {
        console.error(`Failed to sync operation ${op.id}:`, error)
      }
    }

    this.saveQueue(updatedQueue)
    this.updateStatusData({ lastSync: Date.now() })
    this.notifySyncListeners()

    if (syncedCount > 0) {
      toast.success(`Successfully synced ${syncedCount} operation(s)`)
    }

    setTimeout(() => {
      this.cleanupOldSyncedOperations()
    }, 1000)
  }

  private async processOperation(operation: OfflineOperation): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  private cleanupOldSyncedOperations(): void {
    const queue = this.getQueue()
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)
    
    const filtered = queue.filter(op => {
      if (op.synced && op.timestamp < oneDayAgo) {
        return false
      }
      return true
    })

    if (filtered.length < queue.length) {
      this.saveQueue(filtered)
      this.notifySyncListeners()
    }
  }

  clearQueue(): void {
    this.saveQueue([])
    this.updateStatusData({ lastSync: null })
    this.notifySyncListeners()
    toast.success('Offline queue cleared')
  }

  getPendingOperations(): OfflineOperation[] {
    return this.getQueue().filter(op => !op.synced)
  }

  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline)
      window.removeEventListener('offline', this.handleOffline)
    }
    this.listeners.clear()
    this.syncListeners.clear()
  }
}

export const offlineManager = OfflineManager.getInstance()
