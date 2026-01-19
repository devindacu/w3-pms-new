import { Migration } from '../migrations'

export const migration_2026_01_19_add_settings_table: Migration = {
  version: '1.1.0',
  name: 'Add System Settings Table',
  timestamp: 1737331200000,
  
  async up() {
    console.log('Migration 1.1.0: Adding system settings support')
    
    const existingSettings = await window.spark.kv.get('w3-hotel-system-settings')
    if (!existingSettings) {
      const defaultSettings = {
        id: 'system-settings',
        maintenanceMode: false,
        enableAutoBackup: true,
        backupFrequency: 'daily',
        dataRetentionDays: 365,
        enableAuditLog: true,
        featureFlags: {
          enableAIForecasting: true,
          enableChannelManager: true,
          enableMobileApp: false,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      
      await window.spark.kv.set('w3-hotel-system-settings', defaultSettings)
    }
  },
  
  async down() {
    console.log('Migration 1.1.0: Rolling back system settings')
  }
}
