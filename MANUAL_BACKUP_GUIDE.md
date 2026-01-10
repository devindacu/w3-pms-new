# Manual Backup System - W3 Hotel PMS

## Overview
The W3 Hotel PMS includes a comprehensive manual backup system that allows you to create backups before making major system changes. This ensures you can always restore your data if something goes wrong.

## Why Create Manual Backups?

Create a manual backup **BEFORE**:
- 🔧 Updating system settings or configuration
- 📊 Importing large amounts of data (guests, reservations, invoices)
- 🏗️ Making bulk operations (mass updates, deletions)
- 💰 Changing financial data (invoices, payments, budgets)
- 🏨 Modifying room rates, rate plans, or seasons
- 👥 Updating user permissions or roles
- 🔄 Performing data migrations
- 🛠️ Testing new features or workflows

## Quick Backup Access

### Option 1: Header Quick Backup Button
The fastest way to create a backup:

1. Look for the **"Quick Backup"** button in the top header (next to notifications)
2. Click the button to open the Quick Backup dialog
3. Enter a clear description of what you're about to do
4. Click **"Create Backup"**

**Example descriptions:**
- "Before updating room rate configurations for summer season"
- "Before importing 500 guest records from CSV"
- "Before bulk invoice generation for group booking"
- "Before changing tax rates for all services"

### Option 2: Settings → Backups Tab
For detailed backup management:

1. Navigate to **Settings** from the sidebar
2. Click on the **"Backups"** tab
3. Click **"Create Manual Backup Now"** (large button at top)
4. Enter description and confirm

## What Gets Backed Up?

Each backup includes a complete snapshot of:
- ✅ All guest records and profiles
- ✅ Reservations and bookings
- ✅ Room configurations and types
- ✅ Rate plans and seasons
- ✅ Invoices and financial records
- ✅ Inventory and procurement data
- ✅ Employee and HR data
- ✅ System settings and configurations
- ✅ Extra services and categories
- ✅ All other operational data

## Backup Information

Each backup stores:
- **Description**: Your custom description
- **Timestamp**: Exact date and time of creation
- **Created By**: User who created the backup
- **Size**: Total data size
- **Type**: Manual, Auto, or Scheduled
- **Modules**: Which parts of the system were included

## Viewing Backup Statistics

The backup system shows you:
- **Total Backups**: How many versions are stored
- **Storage Used**: Total size of all backups
- **Last Backup**: When the most recent backup was created
- **Auto Backups**: Number of automatic backups
- **Manual Backups**: Number of manual backups you've created
- **Scheduled Backups**: Number of daily scheduled backups

## Restoring from Backup

If you need to restore a previous version:

1. Go to **Settings → Backups**
2. Find the backup you want to restore in the **Backup History** list
3. Click **"Restore"** on that backup version
4. **Confirm the restoration** (this will overwrite current data)
5. System will restore and reload automatically

⚠️ **Warning**: Restoring a backup will replace ALL current data with the backup data. Make sure you restore the correct version!

## Best Practices

### 1. **Be Descriptive**
Good: "Before updating rate plans for Dec 2024 high season"
Bad: "Backup 1"

### 2. **Backup Before Major Changes**
Always create a manual backup before:
- Making changes that affect multiple records
- Importing external data
- Updating critical configurations

### 3. **Verify Backup Creation**
After creating a backup:
- Check that it appears in the Backup History
- Note the timestamp and size
- Verify the description is clear

### 4. **Regular Manual Backups**
Create manual backups at key milestones:
- End of day before night audit
- Before month-end close
- Before system updates
- Before training new staff

### 5. **Export Critical Backups**
For important backups:
- Export to JSON file (download to your computer)
- Store offline as additional protection
- Keep exports of month-end backups

## Exporting & Importing Backups

### Export a Backup
1. Go to **Settings → Backups**
2. Find the backup in the history
3. Click **"Export"** button
4. Save the JSON file to your computer

### Import a Backup
1. Go to **Settings → Backups**
2. Click **"Import Backup File"**
3. Select the JSON file from your computer
4. Confirm the import
5. System will reload with imported data

## Automatic Backup System

In addition to manual backups, the system also creates:

- **Auto Backups**: Created automatically when data changes
- **Scheduled Backups**: Daily automatic full backups
- **Retention**: Old backups are automatically cleaned based on retention settings

You can configure auto-backup settings in: **Settings → Backups → Configure Auto-Backup**

## Storage & Retention

### Default Settings
- **Retention Period**: 90 days
- **Max Versions**: 100 backups
- **Auto-Backup**: Enabled

### Managing Storage
If you're running out of storage:
- Delete old manual backups you no longer need
- Reduce retention period in settings
- Export and delete large backups
- Adjust max versions limit

## Troubleshooting

### "Backup creation failed"
- Check browser console for errors
- Try again in a few moments
- Clear browser cache and retry

### "Storage quota exceeded"
- Delete old backups
- Export important backups and delete
- Reduce retention period

### Backup seems incomplete
- Each backup is a complete snapshot at that moment
- Check the size - it should be substantial (MB range)
- Export and verify the JSON file

### Can't find a backup
- Check date filters
- Make sure you're looking at the correct backup type
- Manual backups are marked with a "manual" badge

## Security Notes

- ✅ Backups are stored securely in your browser's storage
- ✅ Only administrators can create and restore backups
- ✅ All backup operations are logged
- ✅ Exported backup files contain all your data - store securely
- ⚠️ Backup files are not encrypted - protect them accordingly

## Quick Reference Commands

| Action | Location | Shortcut |
|--------|----------|----------|
| Quick Backup | Header bar | Click "Quick Backup" button |
| View Backups | Settings → Backups | - |
| Create Manual | Settings → Backups | Click "Create Manual Backup Now" |
| Restore | Settings → Backups → History | Click "Restore" on version |
| Export | Settings → Backups → History | Click "Export" on version |
| Import | Settings → Backups | Click "Import Backup File" |
| Configure | Settings → Backups | Click "Configure Auto-Backup" |

## Support

If you encounter issues with the backup system:
1. Check this guide for troubleshooting steps
2. Verify you have administrator permissions
3. Check browser console for error messages
4. Contact support with backup ID and error details

---

**Remember**: A backup created today can save hours of work tomorrow. Always backup before major changes!
