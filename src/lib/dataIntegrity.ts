export interface DataBackup {
  id: string
  timestamp: number
  version: string
  keys: string[]
  size: number
  checksum: string
  type: 'manual' | 'auto' | 'pre-migration'
}

export class DataIntegrity {
  private static BACKUP_HISTORY_KEY = 'w3-hotel-backup-history'
  private static MAX_AUTO_BACKUPS = 10
  
  static async createBackup(type: 'manual' | 'auto' | 'pre-migration' = 'manual'): Promise<DataBackup> {
    const keys = await window.spark.kv.keys()
    const version = await window.spark.kv.get<string>('w3-hotel-system-version') || '0.0.0'
    
    const backup: DataBackup = {
      id: `backup-${Date.now()}`,
      timestamp: Date.now(),
      version,
      keys: keys.filter(k => k.startsWith('w3-hotel-')),
      size: keys.length,
      checksum: await this.generateChecksum(keys),
      type
    }
    
    const history = await this.getBackupHistory()
    await window.spark.kv.set(this.BACKUP_HISTORY_KEY, [...history, backup])
    
    await this.cleanupOldBackups()
    
    return backup
  }
  
  static async getBackupHistory(): Promise<DataBackup[]> {
    return await window.spark.kv.get<DataBackup[]>(this.BACKUP_HISTORY_KEY) || []
  }
  
  static async cleanupOldBackups(): Promise<void> {
    const history = await this.getBackupHistory()
    const autoBackups = history.filter(b => b.type === 'auto')
    
    if (autoBackups.length > this.MAX_AUTO_BACKUPS) {
      const toKeep = autoBackups.slice(-this.MAX_AUTO_BACKUPS)
      const manualBackups = history.filter(b => b.type !== 'auto')
      await window.spark.kv.set(this.BACKUP_HISTORY_KEY, [...manualBackups, ...toKeep])
    }
  }
  
  static async verifyDataIntegrity(): Promise<{
    valid: boolean
    errors: string[]
  }> {
    const errors: string[] = []
    
    const criticalKeys = [
      'w3-hotel-system-version',
      'w3-hotel-migrations',
    ]
    
    for (const key of criticalKeys) {
      const value = await window.spark.kv.get(key)
      if (!value) {
        errors.push(`Missing critical key: ${key}`)
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
  
  private static async generateChecksum(keys: string[]): Promise<string> {
    const content = JSON.stringify({
      keys: keys.sort(),
      timestamp: Date.now()
    })
    return btoa(content).substring(0, 16)
  }
  
  static async exportData(): Promise<Record<string, any>> {
    const keys = await window.spark.kv.keys()
    const dataKeys = keys.filter(k => k.startsWith('w3-hotel-'))
    const exportData: Record<string, any> = {}
    
    for (const key of dataKeys) {
      exportData[key] = await window.spark.kv.get(key)
    }
    
    return exportData
  }
  
  static async importData(data: Record<string, any>, mode: 'merge' | 'overwrite' = 'merge'): Promise<void> {
    if (mode === 'overwrite') {
      const keys = await window.spark.kv.keys()
      const dataKeys = keys.filter(k => k.startsWith('w3-hotel-'))
      
      for (const key of dataKeys) {
        await window.spark.kv.delete(key)
      }
    }
    
    for (const [key, value] of Object.entries(data)) {
      await window.spark.kv.set(key, value)
    }
  }
}
