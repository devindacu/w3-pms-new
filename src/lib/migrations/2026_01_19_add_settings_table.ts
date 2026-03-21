import { Migration } from '../migrations'

export const migration_2026_01_19_add_settings_table: Migration = {
  version: '1.1.0',
  name: 'Add System Settings Table',
  timestamp: 1737331200000,
  
  async up() {
    console.log('Migration 1.1.0: System settings table already managed via PostgreSQL backend')
  },
  
  async down() {
    console.log('Migration 1.1.0: Rolling back system settings')
  }
}
