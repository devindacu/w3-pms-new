import { useEffect, useState } from 'react'
import { MigrationManager, allMigrations } from '@/lib/migrations'
import { VersionControl } from '@/lib/versionControl'
import { DataIntegrity } from '@/lib/dataIntegrity'
import { toast } from 'sonner'

export function useMigrationManager() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [currentVersion, setCurrentVersion] = useState<string>('0.0.0')
  const [pendingMigrations, setPendingMigrations] = useState<number>(0)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    initializeSystem()
  }, [])

  const initializeSystem = async () => {
    try {
      await VersionControl.initializeVersion()
      
      const version = await VersionControl.getCurrentVersion()
      setCurrentVersion(version)
      
      const applied = await MigrationManager.getAppliedMigrations()
      const pending = allMigrations.filter(
        m => !applied.some(a => a.version === m.version)
      )
      setPendingMigrations(pending.length)
      
      if (pending.length > 0) {
        await runPendingMigrations()
      }
      
      setIsInitialized(true)
    } catch (error) {
      console.error('Failed to initialize system:', error)
      toast.error('System initialization failed')
    }
  }

  const runPendingMigrations = async () => {
    if (isRunning) return
    
    setIsRunning(true)
    try {
      await DataIntegrity.createBackup('pre-migration')
      
      await MigrationManager.runMigrations(allMigrations)
      
      setPendingMigrations(0)
      
      const version = await VersionControl.getCurrentVersion()
      setCurrentVersion(version)
      
      console.log('All migrations completed successfully')
    } catch (error) {
      console.error('Migration failed:', error)
      toast.error('Migration failed. Data has been preserved.')
    } finally {
      setIsRunning(false)
    }
  }

  const createBackup = async () => {
    try {
      const backup = await DataIntegrity.createBackup('manual')
      toast.success(`Backup created: ${backup.id}`)
      return backup
    } catch (error) {
      console.error('Backup failed:', error)
      toast.error('Backup creation failed')
      return null
    }
  }

  const verifyIntegrity = async () => {
    const result = await DataIntegrity.verifyDataIntegrity()
    if (result.valid) {
      toast.success('Data integrity verified')
    } else {
      toast.error(`Data integrity issues: ${result.errors.join(', ')}`)
    }
    return result
  }

  return {
    isInitialized,
    currentVersion,
    pendingMigrations,
    isRunning,
    runPendingMigrations,
    createBackup,
    verifyIntegrity
  }
}
