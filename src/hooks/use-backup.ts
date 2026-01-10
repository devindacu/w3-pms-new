import { useEffect, useCallback, useRef } from 'react'
import { useKV } from '@github/spark/hooks'

export interface BackupVersion {
  id: string
  timestamp: number
  createdBy: string
  changeType: 'auto' | 'manual' | 'scheduled'
  description: string
  modules: string[]
  dataSnapshot: Record<string, any>
  size: number
  changes: ChangeLog[]
}

export interface ChangeLog {
  module: string
  action: 'create' | 'update' | 'delete'
  recordId: string
  before: any
  after: any
  timestamp: number
}

interface BackupConfig {
  enabled: boolean
  autoBackup: boolean
  retentionDays: number
  maxVersions: number
  includedModules: string[]
  notifyOnFailure: boolean
}

const DEFAULT_CONFIG: BackupConfig = {
  enabled: true,
  autoBackup: true,
  retentionDays: 90,
  maxVersions: 100,
  includedModules: ['all'],
  notifyOnFailure: true,
}

export function useBackup() {
  const [versions, setVersions] = useKV<BackupVersion[]>('w3-backup-versions', [])
  const [config, setConfig] = useKV<BackupConfig>('w3-backup-config', DEFAULT_CONFIG)
  const lastBackupRef = useRef<number>(0)

  const createBackup = useCallback(async (
    description: string,
    changeType: 'auto' | 'manual' | 'scheduled' = 'manual',
    changedModules?: string[]
  ): Promise<BackupVersion | null> => {
    try {
      const currentUser = await window.spark.user()
      
      const allKeys = await window.spark.kv.keys()
      const dataSnapshot: Record<string, any> = {}
      
      for (const key of allKeys || []) {
        if (key.startsWith('w3-hotel-') || key.startsWith('w3-')) {
          const value = await window.spark.kv.get(key)
          if (value !== undefined) {
            dataSnapshot[key] = value
          }
        }
      }

      const dataString = JSON.stringify(dataSnapshot)
      const size = new Blob([dataString]).size

      const newVersion: BackupVersion = {
        id: `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        createdBy: currentUser?.login || 'system',
        changeType,
        description,
        modules: changedModules || ['all'],
        dataSnapshot,
        size,
        changes: [],
      }

      setVersions((current) => {
        const updated = [newVersion, ...(current || [])]
        const maxVersions = config?.maxVersions || DEFAULT_CONFIG.maxVersions
        return updated.slice(0, maxVersions)
      })

      lastBackupRef.current = Date.now()

      return newVersion
    } catch (error) {
      console.error('Backup creation failed:', error)
      if (config?.notifyOnFailure) {
      }
      return null
    }
  }, [config, setVersions])

  const restoreVersion = useCallback(async (versionId: string): Promise<boolean> => {
    try {
      const version = versions?.find(v => v.id === versionId)
      if (!version) {
        throw new Error('Version not found')
      }

      for (const [key, value] of Object.entries(version.dataSnapshot)) {
        await window.spark.kv.set(key, value)
      }

      await createBackup(`Restored from ${new Date(version.timestamp).toLocaleString()}`, 'manual')

      return true
    } catch (error) {
      console.error('Restore failed:', error)
      return false
    }
  }, [versions, createBackup])

  const deleteVersion = useCallback(async (versionId: string): Promise<boolean> => {
    try {
      setVersions((current) => (current || []).filter(v => v.id !== versionId))
      return true
    } catch (error) {
      console.error('Delete version failed:', error)
      return false
    }
  }, [setVersions])

  const exportBackup = useCallback(async (versionId: string): Promise<void> => {
    const version = versions?.find(v => v.id === versionId)
    if (!version) {
      throw new Error('Version not found')
    }

    const exportData = {
      version: version.id,
      timestamp: version.timestamp,
      description: version.description,
      data: version.dataSnapshot,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `w3-pms-backup-${new Date(version.timestamp).toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [versions])

  const importBackup = useCallback(async (file: File): Promise<boolean> => {
    try {
      const text = await file.text()
      const importData = JSON.parse(text)

      if (!importData.data || typeof importData.data !== 'object') {
        throw new Error('Invalid backup file format')
      }

      for (const [key, value] of Object.entries(importData.data)) {
        await window.spark.kv.set(key, value)
      }

      await createBackup(`Imported from ${file.name}`, 'manual')

      return true
    } catch (error) {
      console.error('Import failed:', error)
      return false
    }
  }, [createBackup])

  const cleanupOldVersions = useCallback(async (): Promise<void> => {
    const retentionMs = (config?.retentionDays || DEFAULT_CONFIG.retentionDays) * 24 * 60 * 60 * 1000
    const cutoffTime = Date.now() - retentionMs

    setVersions((current) => (current || []).filter(v => v.timestamp > cutoffTime))
  }, [config, setVersions])

  const getVersionStats = useCallback(() => {
    const totalSize = (versions || []).reduce((sum, v) => sum + v.size, 0)
    const autoBackups = (versions || []).filter(v => v.changeType === 'auto').length
    const manualBackups = (versions || []).filter(v => v.changeType === 'manual').length
    const scheduledBackups = (versions || []).filter(v => v.changeType === 'scheduled').length

    return {
      totalVersions: (versions || []).length,
      totalSize,
      autoBackups,
      manualBackups,
      scheduledBackups,
      oldestBackup: versions?.[versions.length - 1]?.timestamp,
      newestBackup: versions?.[0]?.timestamp,
    }
  }, [versions])

  useEffect(() => {
    const interval = setInterval(async () => {
      await cleanupOldVersions()
      
      if (config?.autoBackup) {
        const hoursSinceLastBackup = (Date.now() - lastBackupRef.current) / (1000 * 60 * 60)
        if (hoursSinceLastBackup >= 24) {
          await createBackup('Scheduled daily backup', 'scheduled')
        }
      }
    }, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [config, cleanupOldVersions, createBackup])

  return {
    versions: versions || [],
    config: config || DEFAULT_CONFIG,
    setConfig,
    createBackup,
    restoreVersion,
    deleteVersion,
    exportBackup,
    importBackup,
    cleanupOldVersions,
    getVersionStats,
  }
}
