import { useEffect, useRef } from 'react'
import { useBackup } from './use-backup'

export function useAutoBackup(hookConfig?: {
  debounceMs?: number
  excludeKeys?: string[]
}) {
  const { config, createBackup } = useBackup()
  const debounceMs = hookConfig?.debounceMs || 5000
  const excludeKeys = hookConfig?.excludeKeys || []
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastSnapshotRef = useRef<Record<string, any>>({})

  useEffect(() => {
    if (!config?.autoBackup) {
      return
    }

    const checkForChanges = async () => {
      try {
        const allKeys = await window.spark.kv.keys()
        const currentSnapshot: Record<string, any> = {}
        
        for (const key of allKeys || []) {
          if (excludeKeys.includes(key)) continue
          if (!key.startsWith('w3-hotel-') && !key.startsWith('w3-')) continue
          if (key === 'w3-backup-versions' || key === 'w3-backup-config') continue
          
          const value = await window.spark.kv.get(key)
          if (value !== undefined) {
            currentSnapshot[key] = value
          }
        }

        const hasChanges = JSON.stringify(currentSnapshot) !== JSON.stringify(lastSnapshotRef.current)
        
        if (hasChanges && Object.keys(lastSnapshotRef.current).length > 0) {
          const changedKeys = Object.keys(currentSnapshot).filter(
            key => JSON.stringify(currentSnapshot[key]) !== JSON.stringify(lastSnapshotRef.current[key])
          )
          
          if (changedKeys.length > 0) {
            const modules = changedKeys.map(key => {
              const match = key.match(/^w3-hotel-(.+)$/)
              return match ? match[1] : 'system'
            })
            
            await createBackup(
              `Auto backup - ${modules.length} module(s) changed`,
              'auto',
              modules
            )
          }
        }

        lastSnapshotRef.current = currentSnapshot
      } catch (error) {
        console.error('Auto backup check failed:', error)
      }
    }

    const startMonitoring = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        checkForChanges()
        startMonitoring()
      }, debounceMs)
    }

    checkForChanges()
    startMonitoring()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [config, createBackup, debounceMs, excludeKeys])
}
