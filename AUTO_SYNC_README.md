# 🔄 Automatic Spark Sync - Quick Start

## What is this?

Your repository now **automatically syncs** all code changes made in Spark to GitHub! 

No manual commits, no git commands needed - everything happens automatically in the background.

## How It Works

### 🤖 GitHub Actions Auto-Sync
A background workflow monitors your repository and automatically commits any changes:

- ⏰ **Runs every 5 minutes** during active hours (9 AM - 9 PM UTC)
- ⏰ **Runs every 30 minutes** during off-peak hours
- 🚀 **Instant sync** on every push
- 📝 **Auto-commits** with timestamps
- 💾 **Always backed up** - never lose work!

### 📊 Application Data Sync
The PMS application also syncs hotel data to GitHub:

- 🏨 Guest records, reservations, rooms
- 💰 Financial data, invoices
- 👥 Employee records
- 🔄 Configurable sync intervals
- 📋 Full audit trail

## Quick Start

### For Code (No Setup Required!)
Code changes are automatically synced - **nothing to configure!**

View sync activity:
1. Go to [Actions](../../actions)
2. Click "Auto-Sync Spark Changes"
3. See your automatic sync history

### For Application Data (5-Minute Setup)
1. Open the application
2. Go to **Settings → GitHub Sync**
3. Enter:
   - Your GitHub username
   - Repository name: `w3-pms-new`
   - Branch: `Primary` (default Spark repository branch)
   - [Create a GitHub token](https://github.com/settings/tokens/new?scopes=repo&description=W3-PMS-Sync)
4. Save and enable auto-sync
5. Done! 🎉

## Monitoring

### Check Sync Status
- **Code**: [View workflow runs](../../actions/workflows/auto-sync-spark-changes.yml)
- **Data**: Settings → GitHub Sync (in application)

### Sync Indicators
- 🟢 Synced - All backed up
- 🔵 Syncing - Upload in progress
- 🔴 Error - Check logs

## What Gets Synced?

✅ **All code files** (.ts, .tsx, .js, etc.)  
✅ **Configuration** (package.json, tsconfig, etc.)  
✅ **Documentation** (.md files)  
✅ **Hotel data** (via app settings)  
✅ **Everything you create in Spark!**

## Need Help?

📖 **Full Documentation**: [SPARK_AUTO_SYNC_GUIDE.md](./SPARK_AUTO_SYNC_GUIDE.md)

**Common Issues:**
- Sync not working? Check [Actions](../../actions) for errors
- Need faster sync? Edit `.github/workflows/auto-sync-spark-changes.yml`
- Data sync issues? Check token permissions

## Manual Sync

Need to sync right now?

1. Go to [Actions](../../actions/workflows/auto-sync-spark-changes.yml)
2. Click "Run workflow"
3. Add optional commit message
4. Click "Run workflow" ✅

---

**That's it!** Your Spark code is now automatically backed up to GitHub every few minutes. Code with confidence! 🚀
