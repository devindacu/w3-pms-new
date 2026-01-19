export interface SystemVersion {
  version: string
  appliedAt: number
  previousVersion?: string
  changelog?: string[]
}

export interface VersionInfo {
  current: string
  previous?: string
  history: SystemVersion[]
}

export class VersionControl {
  private static VERSION_HISTORY_KEY = 'w3-hotel-version-history'
  private static CURRENT_VERSION = '1.1.0'
  
  static async getCurrentVersion(): Promise<string> {
    const info = await this.getVersionInfo()
    return info.current
  }
  
  static async getVersionInfo(): Promise<VersionInfo> {
    const history = await spark.kv.get<SystemVersion[]>(this.VERSION_HISTORY_KEY) || []
    const current = history.length > 0 ? history[history.length - 1].version : '0.0.0'
    const previous = history.length > 1 ? history[history.length - 2].version : undefined
    
    return {
      current,
      previous,
      history
    }
  }
  
  static async updateVersion(newVersion: string, changelog: string[] = []): Promise<void> {
    const history = await spark.kv.get<SystemVersion[]>(this.VERSION_HISTORY_KEY) || []
    const info = await this.getVersionInfo()
    
    const versionRecord: SystemVersion = {
      version: newVersion,
      appliedAt: Date.now(),
      previousVersion: info.current,
      changelog
    }
    
    await spark.kv.set(this.VERSION_HISTORY_KEY, [...history, versionRecord])
  }
  
  static async initializeVersion(): Promise<void> {
    const history = await spark.kv.get<SystemVersion[]>(this.VERSION_HISTORY_KEY)
    
    if (!history || history.length === 0) {
      await this.updateVersion(this.CURRENT_VERSION, [
        'Initial version',
        'Complete hotel management system',
        'Multi-module architecture'
      ])
    }
  }
  
  static compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number)
    const parts2 = v2.split('.').map(Number)
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0
      const part2 = parts2[i] || 0
      
      if (part1 > part2) return 1
      if (part1 < part2) return -1
    }
    
    return 0
  }
  
  static isNewerVersion(newVer: string, currentVer: string): boolean {
    return this.compareVersions(newVer, currentVer) > 0
  }
}
