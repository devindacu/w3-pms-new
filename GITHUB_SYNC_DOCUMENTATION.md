# GitHub Auto-Save and Sync Implementation

This document describes the auto-save and GitHub sync functionality that has been implemented in the W3 Hotel PMS application.

## Overview

The system provides automatic saving of all data changes and optional synchronization with a GitHub repository for backup and version control purposes.

## Features

### 1. Auto-Save
- All data changes are automatically saved using the Spark KV store
- Debounced saves to prevent excessive write operations
- Configurable debounce delay (default: 1000ms)

### 2. GitHub Sync
- Automatic background synchronization to GitHub repository
- Configurable sync intervals (default: 5 minutes)
- Change tracking with detailed audit log
- Manual sync triggering for immediate backup
- Conflict detection and resolution

### 3. Change Tracking
- Complete audit trail of all data modifications
- Track create, update, and delete operations
- Timestamp for each change
- Sync status tracking

## Implementation

### Core Hooks

#### `use-github-sync.ts`
The main hook for GitHub synchronization functionality.

**Features:**
- GitHub API integration for commits
- Change queue management
- Automatic interval-based syncing
- Manual sync trigger
- Configuration management

**Usage:**
```typescript
import { useGitHubSync } from '@/hooks/use-github-sync'

const {
  syncStatus,
  recordChange,
  syncChanges,
  updateConfig,
  changeLog,
  config
} = useGitHubSync({
  owner: 'your-github-username',
  repo: 'your-repo-name',
  branch: 'main',
  token: 'your-github-token',
  autoSyncInterval: 300000, // 5 minutes
  enabled: true
})
```

#### `use-auto-save.ts`
A wrapper hook that combines KV storage with automatic GitHub sync.

**Features:**
- Automatic change detection
- Debounced saves
- GitHub sync integration
- Compatible with existing `useKV` API

**Usage:**
```typescript
import { useAutoSave } from '@/hooks/use-auto-save'

const [rooms, setRooms, deleteRooms] = useAutoSave('hotel-rooms', [], {
  debounceMs: 1000,
  enableGitHubSync: true,
  gitHubConfig: {
    owner: 'your-username',
    repo: 'hotel-data',
    token: 'ghp_xxxxxxxxxxxx'
  }
})
```

### UI Components

#### `GitHubSyncSettings.tsx`
A comprehensive settings interface for GitHub sync configuration.

**Features:**
- Repository configuration (owner, repo, branch)
- GitHub Personal Access Token input
- Auto-sync toggle
- Sync interval configuration
- Manual sync button with test functionality
- Real-time sync status display
- Change log viewer with filtering
- Statistics dashboard (pending changes, total changes, last sync time)

**Location:**
Settings → GitHub Sync tab

## Configuration

### GitHub Repository Setup

1. **Create a GitHub Repository**
   - Go to GitHub and create a new repository
   - This will store your backup data
   - Can be private or public

2. **Generate Personal Access Token**
   - Navigate to GitHub Settings → Developer settings → Personal access tokens
   - Click "Generate new token"
   - Select the `repo` scope (full control of private repositories)
   - Copy the generated token (starts with `ghp_`)

3. **Configure in W3 Hotel PMS**
   - Navigate to Settings → GitHub Sync
   - Enter your GitHub username in "Repository Owner"
   - Enter your repository name in "Repository Name"
   - Enter the branch name (usually `main`)
   - Paste your Personal Access Token
   - Set auto-sync interval (in minutes)
   - Enable auto-sync toggle

### Sync Intervals

Recommended sync intervals based on usage:
- **Production (High Activity)**: 3-5 minutes
- **Development/Testing**: 10-15 minutes
- **Low Activity**: 30-60 minutes

## Data Structure

### Change Record
```typescript
interface ChangeRecord {
  id: string                           // Unique change identifier
  timestamp: number                    // When the change occurred
  key: string                          // Data key that was changed
  action: 'create' | 'update' | 'delete'  // Type of operation
  value?: any                          // New value (for create/update)
  synced: boolean                      // Whether change has been synced
}
```

### Sync Status
```typescript
interface SyncStatus {
  status: 'idle' | 'syncing' | 'success' | 'error'
  lastSyncTime?: number                // Timestamp of last successful sync
  lastCommitSha?: string               // GitHub commit SHA
  error?: string                       // Error message if sync failed
  pendingChanges: number               // Number of unsynced changes
}
```

### GitHub Commit Structure
Each sync creates a commit in the repository with:
- **File**: `sync-data/{timestamp}.json`
- **Commit Message**: Detailed list of changes
- **Content**: JSON with changes, metadata, and user info

Example commit:
```
Auto-sync: 5 change(s) by username

- UPDATE w3-hotel-rooms
- CREATE w3-hotel-guests
- UPDATE w3-hotel-reservations
- DELETE w3-hotel-inventory
- UPDATE w3-hotel-employees
```

## Security

### Token Security
- **Never commit tokens to the repository**
- Tokens are stored in Spark KV (encrypted storage)
- Use environment-specific tokens for different deployments
- Regularly rotate tokens for enhanced security

### Token Permissions
The GitHub token only needs:
- `repo` scope for repository access
- No additional permissions required

### Data Privacy
- Ensure your GitHub repository has appropriate privacy settings
- Use private repositories for sensitive hotel data
- Review GitHub's data handling policies
- Consider data encryption before sync (future enhancement)

## Monitoring

### Sync Status Indicators
- **Idle**: No sync in progress, all changes synced
- **Syncing**: Currently uploading changes to GitHub
- **Success**: Last sync completed successfully
- **Error**: Sync failed (check error message)

### Statistics
View real-time statistics in the GitHub Sync settings:
- **Pending Changes**: Number of changes waiting to be synced
- **Total Changes**: Complete change history
- **Last Sync**: Time since last successful sync

### Change Log
- View complete history of all data changes
- Filter by synced/unsynced status
- See timestamps and action types
- Clear synced history to reduce clutter

## Troubleshooting

### Common Issues

#### "GitHub configuration incomplete"
- Verify all fields are filled (owner, repo, branch, token)
- Save configuration before enabling auto-sync

#### "GitHub API error"
- Check that token has correct permissions
- Verify repository exists and is accessible
- Ensure branch name is correct

#### Sync fails with authentication error
- Token may be expired or revoked
- Generate a new token and update configuration
- Verify token has `repo` scope

#### Changes not being tracked
- Ensure you're using `useAutoSave` or manually calling `recordChange`
- Check that GitHub sync is enabled in configuration
- Verify auto-sync toggle is enabled

## Best Practices

1. **Regular Monitoring**
   - Check sync status periodically
   - Review change logs for unexpected modifications
   - Monitor pending changes count

2. **Token Management**
   - Use dedicated tokens for production
   - Rotate tokens quarterly
   - Store tokens securely

3. **Repository Organization**
   - Use descriptive repository names
   - Consider separate repos for different environments
   - Implement branch strategy (main, dev, staging)

4. **Data Management**
   - Regularly clear synced change history
   - Review and clean up old sync files in GitHub
   - Monitor repository size

5. **Testing**
   - Test sync functionality before production use
   - Use test repository for development
   - Verify sync content matches expected data

## Future Enhancements

Potential improvements for future iterations:

1. **Data Encryption**
   - Encrypt sensitive data before GitHub sync
   - Add encryption configuration options

2. **Selective Sync**
   - Choose which data types to sync
   - Exclude sensitive information from backups

3. **Restore Functionality**
   - Pull data from GitHub to restore state
   - Point-in-time recovery

4. **Conflict Resolution**
   - Automatic conflict detection
   - Manual merge interface
   - Three-way merge support

5. **Webhook Integration**
   - Real-time sync triggers
   - GitHub webhook handlers
   - Event-driven synchronization

6. **Multi-Repository Support**
   - Sync to multiple repositories
   - Cross-repository data sharing
   - Redundant backups

7. **Compression**
   - Compress large datasets before sync
   - Reduce repository size
   - Faster transfers

8. **Incremental Sync**
   - Only sync changed portions of data
   - Reduce commit sizes
   - Optimize for large datasets

## API Reference

### useGitHubSync Hook

```typescript
function useGitHubSync(config: GitHubSyncConfig): {
  syncStatus: SyncStatus
  recordChange: (key: string, action: 'create' | 'update' | 'delete', value?: any) => void
  syncChanges: () => Promise<{ success: boolean; sha?: string; error?: string }>
  updateConfig: (newConfig: Partial<GitHubSyncConfig>) => void
  clearSyncedHistory: () => void
  changeLog: ChangeRecord[]
  config: GitHubSyncConfig
  startAutoSync: () => void
  stopAutoSync: () => void
}
```

### useAutoSave Hook

```typescript
function useAutoSave<T>(
  key: string,
  defaultValue: T,
  config?: AutoSaveConfig
): [
  value: T,
  setValue: (newValue: T | ((prev: T) => T)) => void,
  deleteValue: () => void
]
```

## Support

For issues or questions:
1. Check this documentation
2. Review error messages in sync status
3. Consult GitHub API documentation
4. Contact system administrator

## Changelog

### Version 1.0.0 (Current)
- Initial implementation
- GitHub sync with commit history
- Change tracking and audit log
- Configuration UI in Settings
- Auto-sync with configurable intervals
- Manual sync trigger
- Sync status monitoring
