export interface Migration {
  version: string
  name: string
  timestamp: number
  up: () => Promise<void>
  down?: () => Promise<void>
}

export interface MigrationRecord {
  id: string
  version: string
  name: string
  appliedAt: number
  checksum: string
}

export class MigrationManager {
  private static MIGRATIONS_KEY = 'w3-hotel-migrations'
  private static VERSION_KEY = 'w3-hotel-system-version'
  
  static async getAppliedMigrations(): Promise<MigrationRecord[]> {
    const migrations = await spark.kv.get<MigrationRecord[]>(this.MIGRATIONS_KEY)
    return migrations || []
  }
  
  static async markMigrationAsApplied(migration: Migration): Promise<void> {
    const applied = await this.getAppliedMigrations()
    const checksum = await this.generateChecksum(migration)
    
    const record: MigrationRecord = {
      id: `migration-${Date.now()}`,
      version: migration.version,
      name: migration.name,
      appliedAt: Date.now(),
      checksum
    }
    
    await spark.kv.set(this.MIGRATIONS_KEY, [...applied, record])
  }
  
  static async isMigrationApplied(version: string): Promise<boolean> {
    const applied = await this.getAppliedMigrations()
    return applied.some(m => m.version === version)
  }
  
  static async runMigrations(migrations: Migration[]): Promise<void> {
    const sortedMigrations = migrations.sort((a, b) => a.timestamp - b.timestamp)
    
    for (const migration of sortedMigrations) {
      const isApplied = await this.isMigrationApplied(migration.version)
      
      if (!isApplied) {
        console.log(`Running migration ${migration.version}: ${migration.name}`)
        await migration.up()
        await this.markMigrationAsApplied(migration)
        console.log(`✓ Migration ${migration.version} applied successfully`)
      }
    }
  }
  
  static async getCurrentVersion(): Promise<string> {
    const version = await spark.kv.get<string>(this.VERSION_KEY)
    return version || '0.0.0'
  }
  
  static async setVersion(version: string): Promise<void> {
    await spark.kv.set(this.VERSION_KEY, version)
  }
  
  private static async generateChecksum(migration: Migration): Promise<string> {
    const content = JSON.stringify({
      version: migration.version,
      name: migration.name,
      timestamp: migration.timestamp
    })
    return btoa(content)
  }
  
  static async rollbackMigration(version: string, migrations: Migration[]): Promise<void> {
    const migration = migrations.find(m => m.version === version)
    if (!migration || !migration.down) {
      throw new Error(`Migration ${version} not found or has no rollback`)
    }
    
    await migration.down()
    
    const applied = await this.getAppliedMigrations()
    const updated = applied.filter(m => m.version !== version)
    await spark.kv.set(this.MIGRATIONS_KEY, updated)
    
    console.log(`✓ Migration ${version} rolled back successfully`)
  }
}
