import { useCallback, useEffect, useRef } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

export interface BackupSchedule {
  enabled: boolean
  frequency: 'hourly' | 'daily' | 'weekly' | 'manual'
  time?: string
  dayOfWeek?: number
  lastBackup?: number
  nextBackup?: number
}

export interface BackupConfig {
  owner: string
  repo: string
  branch: string
  token: string
  schedule: BackupSchedule
  dataCategories: {
    guests: boolean
    rooms: boolean
    reservations: boolean
    employees: boolean
    invoices: boolean
    payments: boolean
    inventory: boolean
    housekeeping: boolean
    finance: boolean
    reports: boolean
  }
  retentionDays: number
  compression: boolean
}

export interface BackupStatus {
  status: 'idle' | 'backing-up' | 'success' | 'error'
  lastBackupTime?: number
  lastBackupSize?: number
  totalBackups: number
  error?: string
  currentProgress?: number
}

export interface BackupRecord {
  id: string
  timestamp: number
  commitSha?: string
  size: number
  categories: string[]
  itemCount: number
  status: 'completed' | 'failed'
  error?: string
}

export function useHotelDataBackup() {
  const [config, setConfig] = useKV<BackupConfig>('hotel-backup-config', {
    owner: '',
    repo: '',
    branch: 'main',
    token: '',
    schedule: {
      enabled: false,
      frequency: 'daily',
      time: '02:00'
    },
    dataCategories: {
      guests: true,
      rooms: true,
      reservations: true,
      employees: true,
      invoices: true,
      payments: true,
      inventory: true,
      housekeeping: true,
      finance: true,
      reports: false
    },
    retentionDays: 30,
    compression: true
  })

  const [status, setStatus] = useKV<BackupStatus>('hotel-backup-status', {
    status: 'idle',
    totalBackups: 0
  })

  const [backupHistory, setBackupHistory] = useKV<BackupRecord[]>('hotel-backup-history', [])
  
  const schedulerRef = useRef<NodeJS.Timeout | null>(null)

  const createBackup = useCallback(async (categories?: string[]): Promise<{ success: boolean; sha?: string; error?: string }> => {
    if (!config?.token || !config.owner || !config.repo) {
      return { success: false, error: 'Backup configuration incomplete' }
    }

    setStatus((prev) => ({
      ...(prev || { status: 'idle', totalBackups: 0 }),
      status: 'backing-up',
      currentProgress: 0
    }))

    try {
      const user = await window.spark.user()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const allKeys = await window.spark.kv.keys()
      const backupData: Record<string, any> = {}
      let itemCount = 0

      const categoriesToBackup = categories || Object.entries(config.dataCategories)
        .filter(([_, enabled]) => enabled)
        .map(([category]) => category)

      const keyPatterns: Record<string, string[]> = {
        guests: ['w3-hotel-guests', 'w3-hotel-guest-profiles'],
        rooms: ['w3-hotel-rooms', 'w3-hotel-room-type-configs'],
        reservations: ['w3-hotel-reservations', 'w3-hotel-folios'],
        employees: ['w3-hotel-employees', 'w3-hotel-attendance', 'w3-hotel-shifts'],
        invoices: ['w3-hotel-invoices', 'w3-hotel-guest-invoices'],
        payments: ['w3-hotel-payments', 'w3-hotel-expenses'],
        inventory: ['w3-hotel-inventory', 'w3-hotel-food-items', 'w3-hotel-amenities'],
        housekeeping: ['w3-hotel-housekeeping', 'w3-hotel-maintenance'],
        finance: ['w3-hotel-accounts', 'w3-hotel-budgets', 'w3-hotel-journal-entries'],
        reports: ['w3-hotel-cost-center-reports', 'w3-hotel-profit-center-reports']
      }

      const totalKeys = categoriesToBackup.reduce((sum, cat) => 
        sum + (keyPatterns[cat]?.length || 0), 0
      )
      
      let processedKeys = 0

      for (const category of categoriesToBackup) {
        const patterns = keyPatterns[category] || []
        backupData[category] = {}

        for (const pattern of patterns) {
          const matchingKeys = allKeys.filter(key => key.includes(pattern))
          
          for (const key of matchingKeys) {
            try {
              const value = await window.spark.kv.get(key)
              if (value) {
                backupData[category][key] = value
                itemCount++
              }
            } catch (error) {
              console.error(`Error backing up ${key}:`, error)
            }
          }

          processedKeys++
          setStatus((prev) => ({
            ...(prev || { status: 'idle', totalBackups: 0 }),
            currentProgress: Math.round((processedKeys / totalKeys) * 100)
          }))
        }
      }

      const timestamp = new Date().toISOString()
      const fileName = `backup-${Date.now()}.json`
      
      const backupPayload = {
        version: '1.0.0',
        timestamp,
        hotel: config.owner,
        categories: categoriesToBackup,
        itemCount,
        user: user.login,
        data: backupData,
        metadata: {
          appVersion: '1.0.0',
          source: 'W3 Hotel PMS',
          compression: config.compression
        }
      }

      const dataString = JSON.stringify(backupPayload, null, 2)
      const dataSize = new Blob([dataString]).size

      const commitMessage = `Hotel Data Backup - ${timestamp}\n\nCategories: ${categoriesToBackup.join(', ')}\nItems: ${itemCount}\nSize: ${(dataSize / 1024).toFixed(2)} KB\nUser: ${user.login}`

      const response = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/contents/backups/${fileName}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${config.token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            message: commitMessage,
            content: btoa(dataString),
            branch: config.branch || 'main'
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'GitHub API error')
      }

      const result = await response.json()
      const commitSha = result.commit.sha

      const backupRecord: BackupRecord = {
        id: `backup-${Date.now()}`,
        timestamp: Date.now(),
        commitSha,
        size: dataSize,
        categories: categoriesToBackup,
        itemCount,
        status: 'completed'
      }

      setBackupHistory((prev) => {
        const current = prev || []
        const updated = [backupRecord, ...current]
        if (config.retentionDays > 0) {
          const cutoffTime = Date.now() - (config.retentionDays * 24 * 60 * 60 * 1000)
          return updated.filter(b => b.timestamp > cutoffTime)
        }
        return updated
      })

      setStatus({
        status: 'success',
        lastBackupTime: Date.now(),
        lastBackupSize: dataSize,
        totalBackups: (status?.totalBackups || 0) + 1,
        currentProgress: 100
      })

      return { success: true, sha: commitSha }
    } catch (error) {
      console.error('Backup error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      const failedRecord: BackupRecord = {
        id: `backup-${Date.now()}`,
        timestamp: Date.now(),
        size: 0,
        categories: categories || [],
        itemCount: 0,
        status: 'failed',
        error: errorMessage
      }

      setBackupHistory((prev) => [failedRecord, ...(prev || [])])

      setStatus({
        status: 'error',
        error: errorMessage,
        totalBackups: status?.totalBackups || 0,
        currentProgress: 0
      })

      return { success: false, error: errorMessage }
    }
  }, [config, setStatus, setBackupHistory])

  const scheduleNextBackup = useCallback(() => {
    if (!config?.schedule.enabled) return

    if (schedulerRef.current) {
      clearTimeout(schedulerRef.current)
      schedulerRef.current = null
    }

    const now = new Date()
    let nextBackupTime: Date

    switch (config.schedule.frequency) {
      case 'hourly':
        nextBackupTime = new Date(now.getTime() + 60 * 60 * 1000)
        break

      case 'daily':
        nextBackupTime = new Date(now)
        if (config.schedule.time) {
          const [hours, minutes] = config.schedule.time.split(':').map(Number)
          nextBackupTime.setHours(hours, minutes, 0, 0)
          
          if (nextBackupTime <= now) {
            nextBackupTime.setDate(nextBackupTime.getDate() + 1)
          }
        } else {
          nextBackupTime.setDate(nextBackupTime.getDate() + 1)
        }
        break

      case 'weekly': {
        nextBackupTime = new Date(now)
        const targetDay = config.schedule.dayOfWeek || 0
        const currentDay = now.getDay()
        let daysUntilTarget = targetDay - currentDay
        
        if (daysUntilTarget <= 0) {
          daysUntilTarget += 7
        }
        
        nextBackupTime.setDate(now.getDate() + daysUntilTarget)
        
        if (config.schedule.time) {
          const [hours, minutes] = config.schedule.time.split(':').map(Number)
          nextBackupTime.setHours(hours, minutes, 0, 0)
        }
        break
      }

      default:
        return
    }

    const timeUntilBackup = nextBackupTime.getTime() - now.getTime()

    schedulerRef.current = setTimeout(async () => {
      const result = await createBackup()
      if (result.success) {
        toast.success('Scheduled backup completed successfully')
      } else {
        toast.error(`Scheduled backup failed: ${result.error}`)
      }
      
      scheduleNextBackup()
    }, timeUntilBackup)

    setConfig((prev) => {
      const current = prev || {
        owner: '',
        repo: '',
        branch: 'main',
        token: '',
        schedule: {
          enabled: false,
          frequency: 'daily' as const,
          time: '02:00'
        },
        dataCategories: {
          guests: true,
          rooms: true,
          reservations: true,
          employees: true,
          invoices: true,
          payments: true,
          inventory: true,
          housekeeping: true,
          finance: true,
          reports: false
        },
        retentionDays: 30,
        compression: true
      }
      
      return {
        ...current,
        schedule: {
          ...current.schedule,
          nextBackup: nextBackupTime.getTime()
        }
      }
    })
  }, [config, createBackup, setConfig])

  useEffect(() => {
    if (config?.schedule.enabled) {
      scheduleNextBackup()
    }

    return () => {
      if (schedulerRef.current) {
        clearTimeout(schedulerRef.current)
      }
    }
  }, [config?.schedule.enabled, config?.schedule.frequency, config?.schedule.time, scheduleNextBackup])

  const manualBackup = useCallback(async () => {
    const result = await createBackup()
    if (result.success) {
      toast.success('Manual backup completed successfully')
    } else {
      toast.error(`Backup failed: ${result.error}`)
    }
    return result
  }, [createBackup])

  const updateConfig = useCallback((updates: Partial<BackupConfig>) => {
    setConfig((prev) => {
      const current = prev || {
        owner: '',
        repo: '',
        branch: 'main',
        token: '',
        schedule: {
          enabled: false,
          frequency: 'daily' as const,
          time: '02:00'
        },
        dataCategories: {
          guests: true,
          rooms: true,
          reservations: true,
          employees: true,
          invoices: true,
          payments: true,
          inventory: true,
          housekeeping: true,
          finance: true,
          reports: false
        },
        retentionDays: 30,
        compression: true
      }
      
      return {
        ...current,
        ...updates,
        schedule: {
          ...current.schedule,
          ...(updates.schedule || {})
        },
        dataCategories: {
          ...current.dataCategories,
          ...(updates.dataCategories || {})
        }
      }
    })
  }, [setConfig])

  const clearHistory = useCallback(() => {
    setBackupHistory([])
    toast.success('Backup history cleared')
  }, [setBackupHistory])

  return {
    config,
    status,
    backupHistory,
    manualBackup,
    updateConfig,
    clearHistory,
    scheduleNextBackup
  }
}
