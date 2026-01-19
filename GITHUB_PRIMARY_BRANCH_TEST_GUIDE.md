# GitHub Primary Branch Sync - Test Guide

## Overview

This guide will help you configure and test the GitHub repository sync functionality with the `primary` branch setting. The W3 Hotel PMS has been updated to use GitHub's modern branch naming convention (`primary` instead of `main` or `master`).

## What Changed?

### Previous Configuration
- Default branch: `main`
- Manual configuration required to use different branch names

### Current Configuration  
- Default branch: `primary` (GitHub's modern standard)
- Follows GitHub's inclusive naming conventions
- All new repositories should use `primary` as the default branch

## Prerequisites

Before testing, ensure you have:

1. ✅ A GitHub account
2. ✅ A GitHub repository (can be new or existing)
3. ✅ A Personal Access Token with `repo` permissions
4. ✅ The repository has a `primary` branch (or you can create it during testing)

## Quick Test (5 Steps)

### Step 1: Access GitHub Sync Settings

1. Open W3 Hotel PMS
2. Navigate to **Settings** (sidebar bottom)
3. Click on the **GitHub Sync** tab

You should see the GitHub Sync configuration interface.

### Step 2: Configure Repository Settings

Fill in the following fields:

| Field | Value | Example |
|-------|-------|---------|
| Repository Owner | Your GitHub username | `john-doe` |
| Repository Name | Your repository name | `hotel-pms-data` |
| Branch | `primary` | `primary` |
| GitHub Token | Your Personal Access Token | `ghp_xxxxxxxxxxxx` |
| Auto-Sync Interval | Minutes between syncs | `5` |

**Important:** The branch field should show `primary` by default. If you need to use a different branch, you can change it.

### Step 3: Save Configuration

1. Click **"Save Configuration"** button
2. Wait for success toast: "GitHub sync configuration saved successfully"
3. The configuration is now stored in your browser's local storage

### Step 4: Test the Sync

1. Click **"Test Sync Now"** button
2. Watch for the status indicator to change to "Syncing..."
3. Wait for completion (typically 2-5 seconds)
4. Look for success message: "✓ Sync successful! Commit SHA: xxxxxxx"

**If this fails:** See Troubleshooting section below

### Step 5: Verify in GitHub

1. Go to your GitHub repository
2. Ensure you're viewing the `primary` branch (check branch dropdown)
3. Look for a `sync-data/` folder
4. Click into the folder - you should see a JSON file with a timestamp name
5. Click on the file to view the test sync data
6. Check the commit history - you should see an "Auto-sync" commit

✅ **Success!** Your GitHub sync with primary branch is working correctly.

## Using the GitHub Test Suite

For comprehensive testing, use the built-in test suite:

### Access the Test Suite

1. Navigate to **Settings → GitHub Test** tab
2. You'll see the "GitHub Sync Test Suite" interface

### Configure Test Settings

The test suite pre-fills your saved configuration. Verify:

- Repository Owner matches your GitHub username
- Repository Name is correct
- Branch is set to `primary` ✓
- Token is present (shown as dots for security)

### Run All Tests

Click the **"Run All Tests"** button. The suite will run 7 comprehensive tests:

#### Test 1: Configuration Validation
- ✅ Verifies all required fields are present
- ✅ Checks that branch is set to 'primary'

#### Test 2: Primary Branch Configuration
- ✅ Explicitly validates branch = 'primary'
- ❌ Fails if branch is set to anything else

#### Test 3: GitHub API Connection
- ✅ Tests connection to GitHub API
- ✅ Verifies repository exists and is accessible

#### Test 4: Branch Existence Check
- ✅ Confirms 'primary' branch exists in the repository
- ❌ Fails with helpful message if branch doesn't exist
- 📝 Provides instructions to create the branch

#### Test 5: Test Data Creation
- ✅ Creates sample test data
- ✅ Queues data for sync

#### Test 6: Sync to Primary Branch
- ✅ Performs actual sync to GitHub
- ✅ Commits test data to 'primary' branch
- ✅ Returns commit SHA

#### Test 7: Verify Commit on Primary Branch
- ✅ Fetches latest commit from 'primary' branch
- ✅ Confirms commit was successful
- ✅ Validates commit message contains "Auto-sync"

### Interpreting Test Results

After tests complete, you'll see:

- **Total Tests:** 7
- **Passed:** Number of successful tests (should be 7/7)
- **Failed:** Number of failed tests (should be 0)
- **Success Rate:** Percentage (should be 100%)

Each test shows:
- ✅ Green checkmark = Passed
- ❌ Red X = Failed
- ⏱️ Duration in milliseconds
- 📝 Detailed information about what was tested

## Creating a Primary Branch

If your repository doesn't have a `primary` branch yet, you can create it:

### Method 1: GitHub Web Interface

1. Go to your repository on GitHub
2. Click the branch dropdown (shows current branch like 'main')
3. Type `primary` in the search field
4. Click **"Create branch: primary from main"**
5. Go to Settings → Branches
6. Set `primary` as the default branch (optional but recommended)

### Method 2: Rename Existing Branch

1. Go to your repository on GitHub
2. Click Settings → Branches
3. Click the pencil icon next to your default branch
4. Rename it to `primary`
5. Click "Rename branch"

### Method 3: Git Command Line

```bash
# Clone your repository
git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git
cd YOUR-REPO

# Create and switch to primary branch
git checkout -b primary

# Push to GitHub
git push origin primary

# Set as default (optional)
git push origin HEAD:primary
git symbolic-ref refs/remotes/origin/HEAD refs/remotes/origin/primary
```

## Troubleshooting

### Error: "Branch is set to 'X' instead of 'primary'"

**Cause:** The branch field doesn't contain 'primary'

**Solution:**
1. Go to Settings → GitHub Sync
2. Change the Branch field to `primary`
3. Click "Save Configuration"
4. Run test again

### Error: "Branch 'primary' not found"

**Cause:** Your repository doesn't have a `primary` branch

**Solution:** Create the primary branch using one of the methods above

### Error: "GitHub API error: 401 Unauthorized"

**Cause:** Token is invalid or missing permissions

**Solution:**
1. Generate a new Personal Access Token
2. Ensure it has `repo` scope selected
3. Copy the token
4. Update in Settings → GitHub Sync
5. Save and test again

### Error: "GitHub API error: 404 Not Found"

**Cause:** Repository doesn't exist or name is incorrect

**Solution:**
1. Verify repository exists on GitHub
2. Check spelling of owner and repo name
3. Ensure repository is accessible with your token
4. Update configuration and test again

### Error: "Network error"

**Cause:** No internet connection or GitHub is unreachable

**Solution:**
1. Check your internet connection
2. Verify GitHub.com is accessible
3. Try again in a few moments

### Test Stuck on "Running Tests..."

**Solution:**
1. Wait up to 30 seconds (tests make real API calls)
2. Refresh the page if stuck longer
3. Check browser console for errors
4. Try running tests again

## Monitoring Auto-Sync

Once configured and tested, you can monitor automatic syncing:

### Status Indicators

In the top bar, look for the sync status indicator:

- 🟢 **Synced** - All changes backed up
- 🔵 **Syncing** - Currently uploading
- ⚪ **Idle** - No pending changes
- 🔴 **Error** - Sync failed
- ⚠️ **Conflict** - Manual resolution needed

### View Pending Changes

In Settings → GitHub Sync:

- **Pending Changes:** Shows number waiting to sync
- **Last Sync:** Time since last successful sync
- **Total Changes:** Complete change history

### Change Log

The "Change Log" tab shows:

- All data changes tracked
- Sync status for each change
- Timestamp and action type
- Clear synced history option

## Best Practices

### ✅ Do:

1. **Use primary branch** - Follow modern conventions
2. **Test regularly** - Run test suite after configuration changes
3. **Monitor status** - Check sync indicator periodically
4. **Review commits** - Verify data is syncing to GitHub
5. **Use private repos** - For sensitive hotel data

### ❌ Don't:

1. **Use old branch names** - Avoid 'master' or other deprecated names
2. **Share tokens** - Keep Personal Access Tokens secure
3. **Ignore errors** - Address sync failures promptly
4. **Use public repos** - For confidential business data
5. **Skip testing** - Always test after configuration

## Advanced Configuration

### Custom Branch Names

While `primary` is recommended, you can use any branch name:

1. Enter your custom branch name in the Branch field
2. Ensure the branch exists in your repository
3. Save and test
4. Note: Tests will fail if not using 'primary' (by design)

### Multiple Environments

For different environments (dev/staging/prod):

1. Create separate repositories or branches
2. Configure each environment separately
3. Use different tokens for security
4. Test each configuration independently

### Sync Intervals

Choose based on activity level:

- **High activity:** 3-5 minutes
- **Medium activity:** 10-15 minutes
- **Low activity:** 30-60 minutes
- **Manual only:** Disable auto-sync, sync manually

## Verification Checklist

Use this checklist to confirm everything is working:

- [ ] GitHub repository created
- [ ] `primary` branch exists in repository
- [ ] Personal Access Token generated with `repo` permission
- [ ] Configuration saved in W3 Hotel PMS
- [ ] Test sync completed successfully
- [ ] `sync-data/` folder visible in GitHub repository
- [ ] Test data file visible in GitHub
- [ ] Auto-sync commit appears in commit history
- [ ] All 7 test suite tests pass with 100% success rate
- [ ] Auto-sync toggle enabled (if desired)
- [ ] Sync status shows "Synced" or "Idle"

## Support Resources

### Documentation

- **GITHUB_SYNC_DOCUMENTATION.md** - Complete technical documentation
- **GITHUB_SYNC_QUICK_START.md** - Quick setup guide
- **This guide** - Testing and verification

### In-App Help

- Settings → GitHub Sync → Setup Guide tab
- Detailed step-by-step instructions
- Visual indicators and status messages
- Error descriptions and solutions

### GitHub Resources

- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub Branches](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-branches)
- [GitHub API](https://docs.github.com/en/rest)

## FAQ

### Q: Why 'primary' instead of 'main'?

**A:** GitHub and the industry are moving toward more inclusive naming conventions. 'Primary' is the recommended standard going forward.

### Q: Can I still use 'main' or 'master'?

**A:** Yes, you can configure any branch name. However, the test suite specifically validates 'primary' usage to encourage best practices.

### Q: Will old data on 'main' branch be lost?

**A:** No. If you create a new 'primary' branch from 'main', all history is preserved. You can also rename 'main' to 'primary' without losing data.

### Q: What happens if I change branches?

**A:** New syncs will go to the newly configured branch. Previous syncs on the old branch remain accessible.

### Q: How do I migrate from 'main' to 'primary'?

**A:**
1. Ensure 'primary' branch exists (create from 'main' if needed)
2. Update configuration to use 'primary'
3. Test the sync
4. Optionally set 'primary' as default branch in GitHub
5. Optionally delete old 'main' branch (after verifying)

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| Jan 2025 | 1.0.0 | Initial release with primary branch support |
| Jan 2025 | 1.1.0 | Added comprehensive test suite |
| Jan 2025 | 1.2.0 | Updated default branch from 'main' to 'primary' |

---

**Status:** ✅ Production Ready  
**Last Updated:** January 2025  
**Maintained By:** W3 Hotel PMS Development Team
