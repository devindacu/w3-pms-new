# Database Persistence & Migration System

## Overview

The W3 Hotel PMS implements a comprehensive database persistence and migration system that ensures **zero data loss** during code updates. This system separates code from data, uses incremental migrations, and preserves all existing settings, users, messages, and history.

## Architecture

### 1. Separation of Concerns

```
┌─────────────────────────────────────────┐
│          APPLICATION CODE               │
│  (Git versioned, frequently updated)    │
└─────────────────────────────────────────┘
                  │
                  │ Uses
                  ▼
┌─────────────────────────────────────────┐
│         MIGRATION SYSTEM                │
│  (Versioned, incremental updates)       │
└─────────────────────────────────────────┘
                  │
                  │ Manages
                  ▼
┌─────────────────────────────────────────┐
│      PERSISTENT KEY-VALUE STORAGE       │
│  (Never reset, always preserved)        │
└─────────────────────────────────────────┘
```

### 2. Key Components

#### Migration Manager (`src/lib/migrations.ts`)
- Tracks which migrations have been applied
- Runs migrations in order
- Ensures migrations run only once
- Creates pre-migration backups

#### Version Control (`src/lib/versionControl.ts`)
- Maintains system version history
- Tracks version updates and changelogs
- Enables version comparison

#### Data Integrity (`src/lib/dataIntegrity.ts`)
- Creates automatic and manual backups
- Verifies data integrity
- Exports/imports data
- Cleanup of old backups

## How It Works

### Migration Lifecycle

```
1. Code Update Detected
         ↓
2. System Initialization
         ↓
3. Check for Pending Migrations
         ↓
4. Create Pre-Migration Backup
         ↓
5. Run Migrations Sequentially
         ↓
6. Mark Migrations as Applied
         ↓
7. Update System Version
         ↓
8. Application Ready
```

### Data Persistence Keys

All data is stored using the `spark.kv` API with prefixed keys:

- `w3-hotel-*` - All application data
- `w3-hotel-migrations` - Migration history
- `w3-hotel-system-version` - Current version
- `w3-hotel-backup-history` - Backup metadata
- `w3-hotel-system-settings` - System configuration

### Migration Files

Located in `src/lib/migrations/`, each migration:

```typescript
export const migration_2026_01_19_example: Migration = {
  version: '1.2.0',
  name: 'Add New Feature',
  timestamp: 1737331200000,
  
  async up() {
    // Apply changes
    const existingData = await spark.kv.get('w3-hotel-data')
    if (existingData) {
      // Modify existing data incrementally
      await spark.kv.set('w3-hotel-data', {
        ...existingData,
        newField: 'default value'
      })
    }
  },
  
  async down() {
    // Optional rollback logic
  }
}
```

## Usage

### For Developers

#### Adding a New Migration

1. Create a new migration file:
```bash
src/lib/migrations/2026_01_19_your_feature.ts
```

2. Define the migration:
```typescript
import { Migration } from '../migrations'

export const migration_2026_01_19_your_feature: Migration = {
  version: '1.3.0',
  name: 'Your Feature Description',
  timestamp: Date.now(),
  
  async up() {
    // Your migration logic
  }
}
```

3. Register in `src/lib/migrations/index.ts`:
```typescript
import { migration_2026_01_19_your_feature } from './2026_01_19_your_feature'

export const allMigrations: Migration[] = [
  // ... existing migrations
  migration_2026_01_19_your_feature,
]
```

#### Best Practices

✅ **DO:**
- Add new fields with default values
- Use incremental updates
- Preserve existing data
- Test migrations thoroughly
- Document changes in changelog

❌ **DON'T:**
- Delete or rename existing data
- Modify old migration files
- Reset data in migrations
- Use `DROP` or `TRUNCATE` equivalents
- Hard-code configuration values

### For System Administrators

#### Viewing Migration Status

Access the System Migration Status page through Settings to view:
- Current system version
- Applied migrations
- Backup history
- Data integrity status

#### Creating Manual Backups

```typescript
import { DataIntegrity } from '@/lib/dataIntegrity'

const backup = await DataIntegrity.createBackup('manual')
```

#### Exporting Data

Use the "Export Data" button in the System Migration Status page to download a JSON export of all system data.

#### Verifying Data Integrity

```typescript
import { DataIntegrity } from '@/lib/dataIntegrity'

const result = await DataIntegrity.verifyDataIntegrity()
if (!result.valid) {
  console.error('Integrity issues:', result.errors)
}
```

## Update Flow

### Code Update Process

1. **Pull Latest Code**
```bash
git pull origin main
npm install
```

2. **System Detects Changes**
- On application load, migration system initializes
- Compares current version with migration history
- Identifies pending migrations

3. **Automatic Migration**
- Pre-migration backup created automatically
- Migrations run in sequence
- Each migration marked as applied
- Version updated

4. **Application Ready**
- All existing data preserved
- New features available
- Settings unchanged

### Rollback Procedure

If a migration causes issues:

1. **Review Backup History**
```typescript
const backups = await DataIntegrity.getBackupHistory()
```

2. **Identify Pre-Migration Backup**
Look for backups with `type: 'pre-migration'`

3. **Contact Support**
System administrators should contact development team for rollback procedures

## Data Protection

### Automatic Backups

The system creates backups automatically:
- Before each migration
- Maximum of 10 auto-backups retained
- Manual backups never auto-deleted

### Backup Types

- **Manual**: User-initiated backups
- **Auto**: Scheduled automatic backups
- **Pre-Migration**: Created before applying migrations

### Data Retention

- All user data is retained indefinitely
- Settings are never reset
- Activity logs preserved
- Migration history maintained

## Version History

### Tracking Changes

Every version update is recorded with:
- Version number (semant ic versioning)
- Application timestamp
- Previous version reference
- Changelog entries

### Version Comparison

```typescript
import { VersionControl } from '@/lib/versionControl'

const isNewer = VersionControl.isNewerVersion('1.3.0', '1.2.0')
// Returns: true
```

## Security Considerations

### Data Access

- All data stored in Spark KV (server-side)
- No client-side data caching
- Secure key-value storage

### Migration Integrity

- Checksums verify migration integrity
- Migrations run only once
- Atomic operations where possible

### Backup Security

- Backups stored in same secure storage
- Export requires user action
- No automatic external transmission

## Monitoring

### Health Checks

The system provides real-time status:
- Current version
- Migration count
- Backup count
- Data integrity status

### Logs

Migration activity is logged to console:
```
Running migration 1.1.0: Add System Settings
✓ Migration 1.1.0 applied successfully
```

## Troubleshooting

### Common Issues

**Issue**: Migrations not running
- **Solution**: Check console for errors, verify migration files are properly registered

**Issue**: Data integrity errors
- **Solution**: Run integrity check, review error messages, restore from backup if needed

**Issue**: Version mismatch
- **Solution**: Clear browser cache, force hard refresh

### Support

For migration issues:
1. Check migration logs in browser console
2. Review backup history
3. Export current data
4. Contact development team with:
   - Current version
   - Error messages
   - Recent migration history

## Future Enhancements

Planned improvements:
- Scheduled automatic backups
- Cloud backup integration
- Migration testing framework
- Rollback automation
- Data migration wizard
- Version comparison tool

## API Reference

### MigrationManager

```typescript
// Get applied migrations
const migrations = await MigrationManager.getAppliedMigrations()

// Check if migration applied
const isApplied = await MigrationManager.isMigrationApplied('1.1.0')

// Run all pending migrations
await MigrationManager.runMigrations(allMigrations)
```

### VersionControl

```typescript
// Get current version
const version = await VersionControl.getCurrentVersion()

// Update version
await VersionControl.updateVersion('1.2.0', ['New feature', 'Bug fix'])

// Compare versions
const result = VersionControl.compareVersions('1.2.0', '1.1.0')
```

### DataIntegrity

```typescript
// Create backup
const backup = await DataIntegrity.createBackup('manual')

// Verify integrity
const result = await DataIntegrity.verifyDataIntegrity()

// Export data
const data = await DataIntegrity.exportData()

// Import data
await DataIntegrity.importData(data, 'merge')
```

## Conclusion

The W3 Hotel PMS migration system ensures that code updates never result in data loss. By separating code from data, using incremental migrations, and maintaining comprehensive backups, the system provides a safe and reliable update mechanism that preserves all hotel operations data across all versions.

---

**Last Updated**: January 19, 2026  
**System Version**: 1.1.0  
**Maintained by**: W3 Media Development Team
