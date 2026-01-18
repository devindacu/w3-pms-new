# GitHub Hotel Data Backup - Configuration Guide

## Overview

The W3 Hotel PMS now includes comprehensive GitHub-based automatic backup functionality for all hotel data. This ensures your critical hotel operations data is safely backed up to GitHub repositories with scheduled automatic sync.

## What's New

### Automated Hotel Data Backup System
- **Comprehensive Data Coverage**: Backs up all categories of hotel data including:
  - Guests & Guest Profiles
  - Rooms & Room Types  
  - Reservations & Folios
  - Employees & HR Records
  - Invoices & Payments
  - Inventory & Food Items
  - Housekeeping & Maintenance
  - Finance & Accounting
  - Reports & Analytics

### Backup Features
- **Flexible Scheduling**: Configure backups to run hourly, daily, weekly, or manually
- **Selective Data Backup**: Choose which data categories to include in backups
- **Progress Tracking**: Real-time progress indicator during backup operations
- **Backup History**: Complete audit trail of all backups with status, size, and details
- **Data Retention**: Configurable retention period to manage backup history
- **Compression**: Optional data compression for smaller backup files
- **GitHub Integration**: Direct push to GitHub repository with commit tracking

### Access Location
Navigate to: **Settings → Hotel Data Backup** (new tab next to GitHub Sync)

## Configuration Steps

### 1. GitHub Repository Setup
1. Create a private GitHub repository for your hotel data backups
2. Recommended name: `hotel-data-backup` or similar
3. Keep repository private for data security

### 2. Generate GitHub Token
1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token"
3. Select the `repo` scope (full control of private repositories)
4. Copy the generated token immediately (starts with `ghp_`)

### 3. Configure Backup Settings
In **Settings → Hotel Data Backup → Configuration tab**:

**GitHub Repository:**
- Repository Owner: Your GitHub username
- Repository Name: Your repository name  
- Branch: main (or your preferred branch)
- GitHub Token: Paste your Personal Access Token
- Retention Days: How many days to keep backup history (default: 30)

**Backup Schedule:**
- Frequency: Choose from Hourly, Daily, Weekly, or Manual Only
- Time: For daily/weekly - select preferred backup time
- Day of Week: For weekly - select preferred day
- Enable Compression: Reduces backup file size
- Enable Auto-Backup: Toggle to activate scheduled backups

### 4. Select Data Categories
In **Settings → Hotel Data Backup → Data Selection tab**:

- Check/uncheck data categories to include in backups
- All categories selected by default for complete backup
- Deselecting categories may result in incomplete recovery capability

### 5. Test & Activate
1. Click "Save Configuration" to save your settings
2. Click "Backup Now" to test the connection and create first backup
3. If successful, toggle "Enable Auto-Backup" to activate scheduled backups
4. Monitor backup status in the dashboard

## Backup Data Structure

Backups are stored in your GitHub repository:
- **Location**: `backups/` folder
- **File Format**: JSON files with timestamp: `backup-{timestamp}.json`
- **Content**: All selected data categories with metadata
- **Commit Message**: Includes category list, item count, size, and user info

## Monitoring & Management

### Backup Status Dashboard
View real-time information:
- Total Backups: Number of successful backups completed
- Last Backup: Time since last successful backup
- Last Size: Size of the most recent backup
- Next Backup: Scheduled time for next automatic backup

### Progress Tracking
During backup operations:
- Real-time progress percentage
- Visual progress bar
- Category-by-category processing indicator

### Backup History
In **Settings → Hotel Data Backup → History tab**:
- Complete list of all backup operations
- Status (Success/Failed) with visual indicators
- Timestamp and time-ago format
- File size and item count
- Data categories included
- GitHub commit SHA (for successful backups)
- Error messages (for failed backups)
- Clear history option

## Security Best Practices

1. **Token Security**:
   - Never share your GitHub token
   - Never commit tokens to repositories
   - Treat tokens like passwords
   - Rotate tokens quarterly for production use

2. **Repository Privacy**:
   - Keep backup repositories private
   - Review GitHub repository access regularly
   - Enable two-factor authentication on GitHub

3. **Data Protection**:
   - Regular backup testing
   - Verify backup integrity periodically
   - Monitor backup history for anomalies

## Differences from GitHub Sync

The system now includes TWO GitHub features:

### GitHub Sync (Existing)
- Real-time sync of data changes
- Change-by-change tracking
- Conflict resolution
- Best for: Development and testing

### Hotel Data Backup (New)
- Scheduled full data backups
- Complete system state snapshots
- Category-based selection
- Best for: Production data protection

**Recommendation**: Use both features together for comprehensive data protection - GitHub Sync for real-time changes and Hotel Data Backup for scheduled full backups.

## Troubleshooting

**"Backup configuration incomplete"**
- Ensure all required fields are filled
- Save configuration before testing backup

**"GitHub API error"**
- Verify token has correct permissions (`repo` scope)
- Check repository exists and is accessible
- Ensure branch name is correct

**Backup fails with authentication error**
- Token may be expired or revoked
- Generate new token and update configuration

**No data backed up**
- Verify data categories are selected in Data Selection tab
- Check that there is actual data to backup

## Support

For issues or questions:
1. Check this documentation
2. Review error messages in backup status
3. Verify GitHub repository access
4. Consult system administrator
