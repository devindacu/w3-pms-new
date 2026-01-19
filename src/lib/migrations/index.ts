import { Migration } from '../migrations'
import { migration_2026_01_19_initial_schema } from './2026_01_19_initial_schema'
import { migration_2026_01_19_add_settings_table } from './2026_01_19_add_settings_table'

export const allMigrations: Migration[] = [
  migration_2026_01_19_initial_schema,
  migration_2026_01_19_add_settings_table,
]

export { MigrationManager } from '../migrations'
