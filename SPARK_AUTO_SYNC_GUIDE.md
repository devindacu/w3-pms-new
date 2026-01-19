# Spark Auto-Sync System Documentation

## Overview

This repository is equipped with an **automatic synchronization system** that continuously monitors and syncs code changes made in the Spark development environment to GitHub. This ensures that all development work is automatically backed up and version-controlled without manual intervention.

## How It Works

### 1. **GitHub Actions Workflow**

The auto-sync system uses GitHub Actions to automatically detect and commit changes:

- **Location**: `.github/workflows/auto-sync-spark-changes.yml`
- **Triggers**:
  - On every push to main, Primary, or copilot/* branches
  - Scheduled runs every 5 minutes (during active hours 9 AM - 9 PM UTC)
  - Scheduled runs every 30 minutes (during off-peak hours)
  - Manual trigger available via GitHub Actions UI

### 2. **Application-Level Sync**

The application also includes a built-in GitHub sync feature for data:

- **Hook**: `src/hooks/use-github-sync.ts`
- **Auto-save**: `src/hooks/use-auto-save.ts`
- **UI Settings**: `src/components/GitHubSyncSettings.tsx`

## Features

### ✅ Automatic Code Sync
- Detects any file changes in the repository
- Automatically commits changes with timestamps
- Pushes to the current branch
- No manual git commands needed

### ✅ Scheduled Backups
- Runs every 5 minutes during active development hours
- Runs every 30 minutes during off-peak hours
- Ensures no work is lost

### ✅ Data Sync (Application Feature)
- Syncs hotel data (guests, reservations, rooms, etc.)
- Configurable sync intervals
- Change tracking and audit log
- Manual sync option available

### ✅ Manual Control
- Trigger auto-sync manually from GitHub Actions
- Custom commit messages
- Enable/disable via Settings UI

## Setup Instructions

### For Code Auto-Sync (Automatic)

The GitHub Actions workflow is already configured and will run automatically. No setup required!

**To monitor sync activity:**
1. Go to your GitHub repository
2. Click on "Actions" tab
3. Select "Auto-Sync Spark Changes" workflow
4. View run history and logs

**To trigger manually:**
1. Go to Actions > Auto-Sync Spark Changes
2. Click "Run workflow"
3. Optionally add a custom commit message
4. Click "Run workflow" button

### For Application Data Sync (User Configuration)

1. Navigate to **Settings → GitHub Sync** in the application
2. Configure:
   - **Repository Owner**: Your GitHub username
   - **Repository Name**: Repository name (e.g., `w3-pms-new`)
   - **Branch**: Target branch (default: `main`)
   - **GitHub Token**: Personal Access Token with `repo` scope
   - **Auto-Sync Interval**: How often to sync (default: 5 minutes)
3. Click "Save Configuration"
4. Toggle "Enable Auto-Sync"
5. Click "Test Sync Now" to verify

### Creating a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token (classic)
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
5. Copy the token (starts with `ghp_`)
6. Use it in the application settings

## What Gets Synced

### Code Sync (GitHub Actions)
- **All code files** in the repository
- **Configuration files** (.json, .yml, .ts, etc.)
- **Documentation** (.md files)
- **Build outputs** (if committed)
- **Spark-generated changes**

### Data Sync (Application)
- Guest records and reservations
- Room inventory and housekeeping data
- Financial records and invoices
- Employee and HR data
- All other hotel operational data

## Sync Status Monitoring

### GitHub Actions Dashboard
- View workflow runs in the Actions tab
- Check sync frequency and success rate
- Review commit history
- Debug failed syncs

### Application Dashboard
Shows:
- **Pending Changes**: Number of changes waiting to sync
- **Last Sync**: Time since last successful sync
- **Sync Status**: Current state (Idle/Syncing/Success/Error)
- **Change Log**: History of all synced changes

### Status Indicators
- 🟢 **Synced**: All changes backed up
- 🔵 **Syncing**: Currently uploading
- 🔴 **Error**: Sync failed (check logs)
- ⚪ **Idle**: No changes to sync

## Sync Intervals

### Code Sync (GitHub Actions)
```yaml
Active hours (9 AM - 9 PM UTC): Every 5 minutes
Off-peak hours:                 Every 30 minutes
On push events:                 Immediate
Manual trigger:                 On-demand
```

### Data Sync (Application)
```
Default:           Every 5 minutes (300000ms)
Configurable:      1 minute to unlimited
Manual trigger:    Available in Settings
```

## Troubleshooting

### Code Sync Issues

**Problem: Workflow not running**
- Check if the workflow file exists in `.github/workflows/`
- Verify workflow permissions in repository settings
- Check Actions tab for disabled workflows

**Problem: Commits not appearing**
- Verify the workflow has write permissions
- Check workflow logs for errors
- Ensure GITHUB_TOKEN has sufficient permissions

### Data Sync Issues

**Problem: Sync fails with authentication error**
- Verify GitHub token is valid and not expired
- Ensure token has `repo` scope
- Re-generate token if needed

**Problem: Changes not syncing**
- Check if auto-sync is enabled in Settings
- Verify repository owner and name are correct
- Check browser console for errors
- Ensure changes are being tracked (check change log)

**Problem: Sync is slow**
- Adjust sync interval in Settings
- Check network connection
- Verify GitHub API rate limits

## Data Format

### Code Commits
```
Commit Message: Auto-sync: Spark changes at YYYY-MM-DD HH:MM:SS UTC
Description:    Automatically synced from Spark environment
                Changes detected and committed by auto-sync workflow
```

### Data Sync Files
Stored in `sync-data/` folder as JSON:
```json
{
  "syncTimestamp": 1704067200000,
  "user": "username",
  "changes": [
    {
      "key": "hotel-rooms",
      "action": "update",
      "value": { /* room data */ },
      "timestamp": 1704067200000
    }
  ],
  "metadata": {
    "appVersion": "1.0.0",
    "source": "W3 Hotel PMS"
  }
}
```

## Security Considerations

### GitHub Tokens
- ⚠️ **Never commit tokens** to the repository
- Store tokens securely in application KV store
- Use tokens with minimal required permissions
- Rotate tokens periodically
- Consider using GitHub Apps for better security

### Data Privacy
- Use **private repositories** for sensitive hotel data
- Enable **branch protection** rules
- Review **access permissions** regularly
- Consider **encrypting sensitive data** before sync

## Advanced Configuration

### Customizing Sync Schedule

Edit `.github/workflows/auto-sync-spark-changes.yml`:

```yaml
schedule:
  # Every 2 minutes (more frequent)
  - cron: '*/2 * * * *'
  
  # Every hour (less frequent)
  - cron: '0 * * * *'
  
  # Only on weekdays at 9 AM
  - cron: '0 9 * * 1-5'
```

### Excluding Files from Sync

Add to `.gitignore`:
```
# Don't sync these
node_modules/
dist/
*.log
.env
tmp/
```

### Custom Commit Messages

Trigger manually with custom message:
1. Go to Actions → Auto-Sync Spark Changes
2. Click "Run workflow"
3. Enter custom message
4. Run

## Best Practices

1. ✅ **Keep tokens secure** - Never commit them
2. ✅ **Monitor sync status** - Check regularly for errors
3. ✅ **Use private repos** - For sensitive data
4. ✅ **Test before enabling** - Use "Test Sync Now" first
5. ✅ **Review change logs** - Understand what's being synced
6. ✅ **Set appropriate intervals** - Balance frequency vs. API limits
7. ✅ **Backup regularly** - Don't rely solely on auto-sync
8. ✅ **Document changes** - Use meaningful commit messages

## Support

For issues or questions:
1. Check this documentation
2. Review workflow logs in Actions tab
3. Check application console for errors
4. Review GitHub API status page
5. Consult repository maintainers

## Version History

- **v1.0** (2026-01-19): Initial auto-sync implementation
  - GitHub Actions workflow
  - Application data sync
  - Scheduled and manual triggers
  - Comprehensive monitoring
