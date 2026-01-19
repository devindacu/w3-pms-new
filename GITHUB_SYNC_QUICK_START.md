# GitHub Repository Sync - Quick Start Guide

## Overview

The W3 Hotel PMS includes a built-in GitHub sync feature that automatically backs up all your hotel data to a GitHub repository. This ensures your data is safe, versioned, and accessible from anywhere.

## Why Use GitHub Sync?

✅ **Automatic Backups** - Your data is automatically synced at regular intervals  
✅ **Version History** - Every change is tracked with timestamps and commit history  
✅ **Data Recovery** - Restore data from any point in time using GitHub's version control  
✅ **Off-site Storage** - Data is stored securely in the cloud  
✅ **Audit Trail** - Complete history of all changes made to your data  

## Quick Setup (5 Minutes)

### Step 1: Create a GitHub Account
If you don't have one already, visit [github.com](https://github.com) and sign up for a free account.

### Step 2: Create a New Repository

1. Click the "+" icon in the top right → "New repository"
2. Repository name: `hotel-pms-data` (or any name you prefer)
3. Description: "W3 Hotel PMS Data Backup"
4. Choose **Private** for sensitive hotel data
5. Skip "Initialize this repository with a README"
6. Click "Create repository"

### Step 3: Generate a Personal Access Token

1. Click your profile picture → Settings
2. Scroll down to "Developer settings" (left sidebar)
3. Click "Personal access tokens" → "Tokens (classic)"
4. Click "Generate new token" → "Generate new token (classic)"
5. Note: `W3 Hotel PMS Sync`
6. Expiration: Choose "No expiration" or set a future date
7. **Select scopes:**
   - ✅ Check `repo` (this gives full control of private repositories)
8. Click "Generate token"
9. **IMPORTANT:** Copy the token immediately (starts with `ghp_`) - it won't be shown again!

### Step 4: Configure in W3 Hotel PMS

1. Navigate to: **Settings → GitHub Sync**
2. Fill in the configuration:
   - **Repository Owner:** Your GitHub username
   - **Repository Name:** `hotel-pms-data` (or the name you chose)
   - **Branch:** `main` (GitHub's default branch)
   - **GitHub Personal Access Token:** Paste the token you copied
   - **Auto-Sync Interval:** `5` minutes (recommended)
3. Click "Save Configuration"
4. Click "Test Sync Now" to verify the connection
5. If successful, toggle "Enable Auto-Sync"

**Note on Branch Naming:** GitHub uses `main` as the default branch name. If your repository uses a different branch name, enter it here. You can verify your repository's default branch in GitHub repository settings.

## What Gets Synced?

All your hotel operational data is automatically backed up, including:

- Guests and reservations
- Rooms and housekeeping data
- Inventory and stock levels
- Purchase orders and invoices
- Employee and HR data
- Financial records
- Menu items and recipes
- All other system data

## Data Format

Your data is stored in your GitHub repository in the `sync-data/` folder as JSON files with timestamps:

```
your-repo/
└── sync-data/
    ├── 1704067200000.json
    ├── 1704070800000.json
    └── 1704074400000.json
```

Each file contains:
- Timestamp of the sync
- User who made the changes
- List of changes (create/update/delete)
- Full data for changed records

## Monitoring Sync Status

Check the sync status at any time:

### In Settings → GitHub Sync

- **Pending Changes:** Number of changes waiting to be synced
- **Total Changes:** Complete history of all changes
- **Last Sync:** Time since last successful sync
- **Status Badge:** Current sync status (Idle/Syncing/Synced/Error)

### Status Indicators

- 🟢 **Synced** - All changes backed up successfully
- 🔵 **Syncing** - Currently uploading changes
- ⚪ **Idle** - No changes to sync
- 🔴 **Error** - Sync failed (check error message)

## Sync Intervals - Recommendations

Choose based on your hotel's activity level:

- **High Activity Hotels:** 3-5 minutes
- **Medium Activity:** 10-15 minutes
- **Low Activity:** 30-60 minutes

Shorter intervals = more frequent backups but more GitHub commits.

## Security Best Practices

### ✅ DO:
- Use a **private repository** for hotel data
- Keep your GitHub token secure (treat it like a password)
- Regularly review your sync logs
- Set a token expiration date and rotate periodically
- Use 2-factor authentication on your GitHub account

### ❌ DON'T:
- Share your GitHub token with anyone
- Commit the token to any repository
- Use a public repository for sensitive data
- Give the token more permissions than necessary (only `repo` scope needed)

## Troubleshooting

### "GitHub configuration incomplete"
**Solution:** Ensure all fields are filled - owner, repo, branch, and token

### "GitHub API error" or "401 Unauthorized"
**Possible causes:**
- Token is invalid or expired
- Token doesn't have `repo` permission
- Token was revoked

**Solution:** Generate a new token and update configuration

### "404 Not Found"
**Possible causes:**
- Repository name is incorrect
- Repository doesn't exist
- Repository owner username is wrong
- Branch 'primary' doesn't exist in the repository

**Solution:** 
1. Double-check repository name and owner in GitHub
2. Verify the branch exists in your repository. To create the 'primary' branch:
   - Go to your GitHub repository
   - Click on the branch dropdown (usually shows 'main' or 'master')
   - Type 'primary' in the search box
   - Click "Create branch: primary from main" (or from your current default branch)
   - Alternatively, you can rename your default branch to 'primary' in repository settings

### Sync stuck at "Syncing"
**Solution:**
1. Wait a few minutes
2. Refresh the page
3. Check your internet connection
4. Force sync manually with "Test Sync Now"

### No changes being recorded
**Solution:**
- Verify auto-sync is enabled (toggle switch should be ON)
- Check sync interval is set correctly
- Make a change to trigger a sync
- Review change log to see if changes are being tracked

## Viewing Your Backups

1. Go to your GitHub repository
2. Navigate to the `sync-data/` folder
3. Click on any JSON file to view the backup
4. Click "History" to see all versions
5. Click "Raw" to download the JSON file

## Change Log

The Change Log tab shows all tracked changes:

- **Action Type:** Create, Update, or Delete
- **Data Key:** What was changed (e.g., `w3-hotel-rooms`)
- **Timestamp:** When the change occurred
- **Status:** Synced or Pending

You can clear synced history to keep the log clean:
- Click "Clear Synced" to remove successfully backed-up changes
- Pending changes will remain until synced

## Advanced: Manual Sync

Even with auto-sync enabled, you can manually trigger a sync:

1. Navigate to Settings → GitHub Sync
2. Click "Test Sync Now"
3. Wait for confirmation toast
4. Check your repository for the new commit

## Data Recovery (Future Feature)

Currently, GitHub sync provides one-way backup. Future updates will include:
- One-click data restoration
- Point-in-time recovery
- Selective data import
- Conflict resolution for multi-device setups

To restore data manually now:
1. Download the JSON file from GitHub
2. Parse the JSON to extract the data
3. Use the data as needed

## GitHub Commit Messages

Each sync creates a commit with a descriptive message:

```
Auto-sync: 5 change(s) by username

- UPDATE w3-hotel-rooms
- CREATE w3-hotel-guests
- UPDATE w3-hotel-reservations
- DELETE w3-hotel-inventory
- UPDATE w3-hotel-employees
```

This makes it easy to understand what changed in each sync.

## FAQ

### Q: How much GitHub storage does this use?
**A:** Very little. JSON files are small (typically 10-100KB each). A year of syncs is usually under 100MB.

### Q: Can I sync to multiple repositories?
**A:** Not currently. You can only sync to one repository at a time.

### Q: What happens if my internet goes down?
**A:** Changes are queued locally and will sync automatically when connection is restored.

### Q: Can I see who made each change?
**A:** Yes! Each sync includes the username of the person who made the changes.

### Q: Will this slow down my application?
**A:** No. Syncing happens in the background and doesn't affect app performance.

### Q: Can I disable sync temporarily?
**A:** Yes. Toggle the "Enable Auto-Sync" switch to OFF. Re-enable anytime.

### Q: Is my data encrypted?
**A:** Data is transmitted securely via HTTPS. GitHub stores data securely, but the JSON files are not encrypted. Use a private repository for sensitive data.

### Q: Can I sync to GitLab or Bitbucket?
**A:** Not currently. Only GitHub is supported at this time.

## Support

For additional help:
1. Check this documentation
2. Review error messages in the sync status
3. Consult the GitHub Sync Documentation (GITHUB_SYNC_DOCUMENTATION.md)
4. Contact your system administrator

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Feature Status:** ✅ Production Ready
