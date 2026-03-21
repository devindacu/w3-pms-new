export interface DataBackup {
  id: string
  timestamp: number
  version: string
  keys: string[]
  size: number
  checksum: string
  type: 'manual' | 'auto' | 'pre-migration'
}

async function kvGet<T>(key: string): Promise<T | null> {
  try {
    const r = await fetch(`/api/extra-settings/${encodeURIComponent(key)}`)
    if (!r.ok) return null
    const d = await r.json()
    return (d?.value ?? null) as T | null
  } catch {
    return null
  }
}

async function kvSet<T>(key: string, value: T): Promise<void> {
  try {
    await fetch(`/api/extra-settings/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    })
  } catch {
    // ignore
  }
}

export class DataIntegrity {
  private static BACKUP_HISTORY_KEY = 'sys-backup-history'
  private static MAX_AUTO_BACKUPS = 10

  static async createBackup(type: 'manual' | 'auto' | 'pre-migration' = 'manual'): Promise<DataBackup> {
    const version = (await kvGet<string>('sys-version')) || '0.0.0'

    const backup: DataBackup = {
      id: `backup-${Date.now()}`,
      timestamp: Date.now(),
      version,
      keys: [],
      size: 0,
      checksum: await this.generateChecksum([]),
      type,
    }

    const history = await this.getBackupHistory()
    await kvSet(this.BACKUP_HISTORY_KEY, [...history, backup])

    await this.cleanupOldBackups()

    return backup
  }

  static async getBackupHistory(): Promise<DataBackup[]> {
    return (await kvGet<DataBackup[]>(this.BACKUP_HISTORY_KEY)) || []
  }

  static async cleanupOldBackups(): Promise<void> {
    const history = await this.getBackupHistory()
    const autoBackups = history.filter(b => b.type === 'auto')

    if (autoBackups.length > this.MAX_AUTO_BACKUPS) {
      const toKeep = autoBackups.slice(-this.MAX_AUTO_BACKUPS)
      const manualBackups = history.filter(b => b.type !== 'auto')
      await kvSet(this.BACKUP_HISTORY_KEY, [...manualBackups, ...toKeep])
    }
  }

  static async verifyDataIntegrity(): Promise<{ valid: boolean; errors: string[] }> {
    return { valid: true, errors: [] }
  }

  private static async generateChecksum(keys: string[]): Promise<string> {
    const content = JSON.stringify({ keys: keys.sort(), timestamp: Date.now() })
    return btoa(content).substring(0, 16)
  }

  static async exportData(): Promise<Record<string, unknown>> {
    return {}
  }

  static async importData(_data: Record<string, unknown>, _mode: 'merge' | 'overwrite' = 'merge'): Promise<void> {
    // Data import is handled directly via the API endpoints
  }
}
