# Rollback Wizard - Data Recovery Guide

## Overview

The Rollback Wizard is a comprehensive, step-by-step guided interface for easy data recovery from backups in the W3 Hotel PMS system. It provides a safe, user-friendly way to restore data with full control and visibility over what will be changed.

## Features

### 🎯 Key Capabilities

1. **Step-by-Step Guidance** - 5-step wizard that guides users through the entire rollback process
2. **Selective Restoration** - Choose specific data modules to restore instead of full system restoration
3. **Preview Changes** - See exactly what will change before committing to the rollback
4. **Safety Mechanisms** - Automatic pre-rollback backup creation for recovery insurance
5. **Impact Analysis** - Visual indicators showing the impact level of each restoration
6. **Comprehensive Logging** - Full audit trail of all rollback operations

### 📋 Wizard Steps

#### Step 1: Select Backup
- View all available backups with search functionality
- See backup metadata (date, size, encryption status, modules included)
- Select the backup you want to restore from

#### Step 2: Verify Backup
- Verify backup integrity
- Enter decryption password for encrypted backups
- Validate backup can be successfully decrypted

#### Step 3: Select Data
- **Full Restore Mode** - Restore all data from the backup
- **Selective Restore Mode** - Choose specific modules to restore
  - Quick selection by category (Core, Operational, Financial, Analytics)
  - Individual module selection with descriptions
  - See current record counts for each module

#### Step 4: Preview Changes
- See detailed impact analysis for each selected module:
  - Current record count vs. backup record count
  - Change type (Add, Remove, Replace, None)
  - Impact level (Low, Medium, High, Critical)
- Financial data changes are automatically flagged as Critical
- Option to create pre-rollback backup (recommended)

#### Step 5: Restore
- Final confirmation with summary
- Progress indicator during restoration
- Error handling and partial restoration support
- Automatic page refresh after successful restoration

## Data Modules

The wizard supports selective restoration of the following modules:

### Core Data
- **Rooms** - Room inventory and configurations
- **Guests** - Guest records and profiles
- **Reservations** - Booking and reservation data
- **System Users** - User accounts and permissions
- **Branding Settings** - Hotel branding and theme
- **Tax Configuration** - Tax rates and settings

### Operational Data
- **Housekeeping** - Tasks and assignments
- **Employees** - Staff and employee records
- **Inventory** - General inventory items
- **Food Inventory** - F&B inventory and stock
- **Amenities** - Room amenities inventory
- **Menu Items** - Restaurant menu and pricing
- **F&B Orders** - Food and beverage orders
- **Suppliers** - Supplier contacts and records

### Financial Data
- **Folios** - Guest folio transactions
- **Supplier Invoices** - Purchase invoices and bills
- **Guest Invoices** - Guest billing invoices
- **Payments** - Payment transactions
- **Expenses** - Operating expenses

### Analytics Data
- **Guest CRM** - Guest profiles and preferences

## Usage Guide

### Accessing the Rollback Wizard

1. Navigate to **Settings** → **Hotel Data Backup**
2. Click the **"Rollback Wizard"** button in the top-right corner
3. The wizard dialog will open

### Performing a Full Restore

```typescript
// Step 1: Select your backup
// Step 2: Verify (enter password if encrypted)
// Step 3: Select "Full Restore" mode
// Step 4: Review all changes
// Step 5: Check "Create pre-rollback backup" and click "Start Restoration"
```

### Performing a Selective Restore

```typescript
// Step 1: Select your backup
// Step 2: Verify (enter password if encrypted)
// Step 3: Select "Selective Restore" mode
// Step 4: Choose modules by:
//   - Clicking individual modules
//   - Using "Select All" / "Deselect All"
//   - Using category buttons (Core/Operational/Financial/Analytics)
// Step 5: Review changes → Create pre-rollback backup → Start Restoration
```

### Best Practices

✅ **DO:**
- Always create a pre-rollback backup (recommended)
- Review the preview carefully before restoring
- Pay special attention to "Critical" impact changes
- Restore during off-peak hours when possible
- Test with selective restore before full restore
- Keep backup passwords in a secure location

❌ **DON'T:**
- Skip the preview step
- Ignore high/critical impact warnings
- Restore during peak business hours
- Restore without understanding what will change
- Lose backup encryption passwords

## Safety Features

### 1. Pre-Rollback Backup
Before any restoration, the wizard can automatically create a backup of the current state. This provides a safety net if you need to revert the rollback.

### 2. Impact Analysis
The wizard categorizes changes by impact:
- **Low** - Minor changes, few records affected
- **Medium** - Moderate changes or data replacement
- **High** - Significant data removal or many records affected
- **Critical** - Financial data changes or large-scale modifications

### 3. Partial Restoration Support
If some modules fail to restore, the wizard:
- Continues with remaining modules
- Logs all errors
- Reports partial success
- Allows you to retry failed modules

### 4. Audit Trail
Every rollback operation is logged with:
- Timestamp
- Backup source
- Modules restored
- Number of records restored
- Success/Partial/Failed status
- Error details (if any)
- User who performed the operation

## Error Handling

The wizard handles various error scenarios:

### Backup Verification Failures
- Invalid password for encrypted backup
- Corrupted backup data
- Missing backup files

### Restoration Failures
- Module-specific failures are logged
- Partial restoration continues for other modules
- Clear error messages for troubleshooting

### Recovery Options
- Pre-rollback backup can be restored
- Individual module retry capability
- Full audit log for investigation

## Technical Details

### Storage
- Rollback logs: `w3-hotel-rollback-logs`
- Pre-rollback backups: Tagged with "Pre-Rollback" in name
- All backups stored in `w3-hotel-backups` and `w3-hotel-backup-data`

### Performance
- Asynchronous restoration with progress tracking
- Optimized for large datasets
- Module-by-module processing
- Automatic page refresh after completion

### Security
- Encrypted backup support
- Password verification before restoration
- Audit trail of all operations
- User authentication required

## Troubleshooting

### Backup Not Appearing
- Ensure backup was created successfully
- Check if backup file exists in storage
- Verify backup metadata is intact

### Verification Failed
- Double-check encryption password
- Ensure backup is not corrupted
- Try downloading and re-importing backup

### Partial Restoration
- Check error log for specific module failures
- Verify module data structure compatibility
- Contact support with error details

### Page Not Refreshing
- Manually refresh the page
- Check browser console for errors
- Verify restoration completed successfully

## Integration with Backup System

The Rollback Wizard integrates seamlessly with the existing backup management system:

1. **Backup Creation** - Uses standard backup format
2. **Encryption** - Supports encrypted and non-encrypted backups
3. **Compression** - Works with compressed backups
4. **Metadata** - Reads backup metadata for display
5. **Validation** - Uses backup verification system

## Future Enhancements

Planned features for future releases:
- Schedule automated rollbacks
- Point-in-time recovery
- Differential restoration (only changed records)
- Rollback simulation mode
- Multi-step undo capability
- Export rollback reports

## API Reference

### RollbackLog Interface
```typescript
interface RollbackLog {
  id: string
  timestamp: number
  backupId: string
  backupName: string
  modulesRestored: string[]
  recordsRestored: number
  status: 'success' | 'partial' | 'failed'
  errors?: string[]
  performedBy: string
}
```

### Data Module Selection
```typescript
interface DataModuleSelection {
  key: string // KV storage key
  label: string // Display name
  description: string // Module description
  category: 'core' | 'operational' | 'financial' | 'analytics'
  selected: boolean // Selection state
  recordCount?: number // Current record count
}
```

### Rollback Preview
```typescript
interface RollbackPreview {
  module: string
  currentRecords: number
  backupRecords: number
  changeType: 'add' | 'remove' | 'replace' | 'none'
  impact: 'low' | 'medium' | 'high' | 'critical'
}
```

## Support

For issues or questions about the Rollback Wizard:
1. Check this documentation
2. Review audit logs for error details
3. Contact system administrator
4. Refer to backup management documentation

## Changelog

### Version 1.0.0 (Current)
- Initial release
- 5-step wizard interface
- Selective and full restore modes
- Impact analysis and preview
- Pre-rollback backup creation
- Comprehensive audit logging
- Error handling and recovery
