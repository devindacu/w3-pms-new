# Automatic Code Sync - Quick Reference Card

## 🎯 At a Glance

| Feature | Details |
|---------|---------|
| **Status** | ✅ Active & Running |
| **Workflow File** | `.github/workflows/auto-sync.yml` |
| **Default Branch** | `primary` |
| **Active Hours Sync** | Every 5 minutes (9 AM - 9 PM UTC) |
| **Off-Peak Sync** | Every 30 minutes (9 PM - 9 AM UTC) |
| **Push Sync** | Immediate on every push |
| **Manual Sync** | Available via GitHub Actions UI |

## ⚡ Quick Commands

### View Workflow Status
```
GitHub Repository → Actions Tab → "Automatic Spark Code Sync"
```

### Manual Trigger
```
Actions → Automatic Spark Code Sync → Run workflow → Select 'primary' → Run
```

### Check Last Sync
```
Actions → Latest workflow run → View logs
```

### Disable Auto-Sync
```
Actions → Automatic Spark Code Sync → ⋮ menu → Disable workflow
```

### Re-enable Auto-Sync
```
Actions → Automatic Spark Code Sync → ⋮ menu → Enable workflow
```

## 📅 Sync Schedule

### Weekday/Weekend (Same Schedule)

**Active Hours (9 AM - 9 PM UTC)**
```
9:00 → 9:05 → 9:10 → 9:15 → 9:20 ... (every 5 min)
```

**Off-Peak (9 PM - 9 AM UTC)**
```
21:00 → 21:30 → 22:00 → 22:30 ... (every 30 min)
```

**On Every Push**
```
git push → Immediate sync (within seconds)
```

## 🔧 Customization Snippets

### Change Active Hours Frequency

**Every 3 minutes:**
```yaml
- cron: '*/3 9-20 * * *'
```

**Every 10 minutes:**
```yaml
- cron: '*/10 9-20 * * *'
```

**Every 15 minutes:**
```yaml
- cron: '*/15 9-20 * * *'
```

### Change Off-Peak Frequency

**Every hour:**
```yaml
- cron: '0 21-8,0-8 * * *'
```

**Every 2 hours:**
```yaml
- cron: '0 */2 21-23,0-8 * * *'
```

### 24/7 Same Frequency

**Every 5 minutes all day:**
```yaml
- cron: '*/5 * * * *'
```

**Every 30 minutes all day:**
```yaml
- cron: '*/30 * * * *'
```

### Timezone Adjustments

**EST (UTC-5):**
```yaml
# 9 AM EST = 2 PM UTC
# 9 PM EST = 2 AM UTC
schedule:
  - cron: '*/5 14-23,0-1 * * *'    # Active
  - cron: '*/30 2-13 * * *'         # Off-peak
```

**PST (UTC-8):**
```yaml
# 9 AM PST = 5 PM UTC
# 9 PM PST = 5 AM UTC
schedule:
  - cron: '*/5 17-23,0-4 * * *'    # Active
  - cron: '*/30 5-16 * * *'         # Off-peak
```

**GMT+8 (Beijing/Singapore):**
```yaml
# 9 AM GMT+8 = 1 AM UTC
# 9 PM GMT+8 = 1 PM UTC
schedule:
  - cron: '*/5 1-12 * * *'          # Active
  - cron: '*/30 13-23,0 * * *'      # Off-peak
```

## 🎯 Common Tasks

### Task: Check if sync is working
```
1. Go to GitHub → Actions
2. Look for green checkmarks
3. Click latest run
4. Verify "Sync completed" in logs
```

### Task: Manually sync right now
```
1. Actions → Automatic Spark Code Sync
2. Run workflow → primary → Run workflow
3. Wait ~1 minute
4. Check for green checkmark
```

### Task: View sync history
```
1. Actions tab
2. Filter by "Automatic Spark Code Sync"
3. See all runs with timestamps
```

### Task: Stop auto-sync temporarily
```
1. Actions → Automatic Spark Code Sync
2. ⋮ menu (top right)
3. Disable workflow
4. (Re-enable when ready)
```

### Task: Change sync frequency
```
1. Edit .github/workflows/auto-sync.yml
2. Modify cron expressions
3. Commit changes
4. New schedule takes effect immediately
```

## 📊 Monitoring

### Health Check Points

✅ **Workflow enabled** → Actions shows green status  
✅ **Recent runs** → Successful runs in last 24 hours  
✅ **No failures** → No red X marks in Actions  
✅ **Commits visible** → GitHub shows recent commits  

### Warning Signs

⚠️ **Red X in Actions** → Check workflow logs for errors  
⚠️ **No recent runs** → Verify workflow is enabled  
⚠️ **Old last commit** → Check if changes are being made  
⚠️ **Permission errors** → Check workflow permissions in Settings  

## 🐛 Troubleshooting

### Issue: Workflow not running

**Solution 1:** Check Actions are enabled
```
Settings → Actions → General → Enable Actions
```

**Solution 2:** Check workflow file exists
```
Verify .github/workflows/auto-sync.yml is present
```

**Solution 3:** Re-enable workflow
```
Actions → Workflow → Enable
```

### Issue: Sync failing with permission error

**Solution:** Enable write permissions
```
Settings → Actions → General → Workflow permissions
→ Select "Read and write permissions"
```

### Issue: Wrong branch being synced

**Solution:** Update workflow file
```yaml
on:
  push:
    branches:
      - primary  # Change to your branch name
```

### Issue: Too many Actions minutes used

**Solution:** Reduce frequency
```yaml
# Change from every 5 min to every 15 min
- cron: '*/15 9-20 * * *'
```

## 💡 Pro Tips

1. **Monitor first week** - Check Actions daily to ensure smooth operation
2. **Test manual trigger** - Verify manual sync works before relying on automation
3. **Use with data sync** - Enable GitHub Sync in Settings for complete backup
4. **Adjust for timezone** - Set active hours to match your business hours
5. **Balance frequency vs cost** - More frequent = better backup, but uses more Actions minutes

## 📞 Quick Help

| Question | Answer |
|----------|--------|
| Where is workflow file? | `.github/workflows/auto-sync.yml` |
| How often does it sync? | 5 min (active) / 30 min (off-peak) |
| Can I trigger manually? | Yes, via Actions UI |
| Does it use my git config? | No, uses GitHub Actions Bot identity |
| What branch does it sync? | `primary` (configurable) |
| Does it work offline? | No, requires GitHub connection |
| Cost for private repos? | Uses GitHub Actions minutes from quota |
| Cost for public repos? | Free, unlimited |

## 🔗 Related Documentation

- [AUTOMATIC_SPARK_CODE_SYNC.md](./AUTOMATIC_SPARK_CODE_SYNC.md) - Complete guide
- [GITHUB_SYNC_PRIMARY_BRANCH_COMPLETE.md](./GITHUB_SYNC_PRIMARY_BRANCH_COMPLETE.md) - Data sync
- [.github/workflows/auto-sync.yml](./.github/workflows/auto-sync.yml) - Workflow file

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Status:** ✅ Active
