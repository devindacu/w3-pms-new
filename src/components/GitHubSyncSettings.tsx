import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import {
  GithubLogo,
  CloudArrowUp,
  CheckCircle,
  XCircle,
  Clock,
  List,
  Trash,
  GitBranch,
  Key,
  Play,
  Pause
} from '@phosphor-icons/react'
import { useGitHubSync, type GitHubSyncConfig, type ChangeRecord } from '@/hooks/use-github-sync'
import { formatDistanceToNow } from 'date-fns'

interface GitHubSyncSettingsProps {
  initialConfig?: Partial<GitHubSyncConfig>
}

export function GitHubSyncSettings({ initialConfig }: GitHubSyncSettingsProps) {
  const defaultConfig: GitHubSyncConfig = {
    owner: initialConfig?.owner || '',
    repo: initialConfig?.repo || '',
    branch: initialConfig?.branch || 'main',
    token: initialConfig?.token || '',
    autoSyncInterval: initialConfig?.autoSyncInterval || 300000,
    enabled: initialConfig?.enabled || false
  }

  const {
    syncStatus,
    recordChange,
    syncChanges,
    updateConfig,
    clearSyncedHistory,
    changeLog,
    config,
    startAutoSync,
    stopAutoSync
  } = useGitHubSync(defaultConfig)

  const [formData, setFormData] = useState({
    owner: config?.owner || '',
    repo: config?.repo || '',
    branch: config?.branch || 'main',
    token: config?.token || '',
    autoSyncInterval: ((config?.autoSyncInterval || 300000) / 60000).toString(),
    enabled: config?.enabled || false
  })

  const handleSaveConfig = () => {
    const newConfig: GitHubSyncConfig = {
      owner: formData.owner,
      repo: formData.repo,
      branch: formData.branch,
      token: formData.token,
      autoSyncInterval: parseInt(formData.autoSyncInterval) * 60000,
      enabled: formData.enabled
    }

    updateConfig(newConfig)
    toast.success('GitHub sync configuration saved')
  }

  const handleTestSync = async () => {
    if (!config?.owner || !config?.repo || !config?.token) {
      toast.error('Please configure GitHub settings first')
      return
    }

    recordChange('test-sync', 'create', { test: true, timestamp: Date.now() })
    
    const result = await syncChanges()
    if (result.success) {
      toast.success(`Sync successful! Commit SHA: ${result.sha?.substring(0, 7)}`)
    } else {
      toast.error(`Sync failed: ${result.error}`)
    }
  }

  const handleToggleAutoSync = (enabled: boolean) => {
    setFormData(prev => ({ ...prev, enabled }))
    updateConfig({ enabled })
    
    if (enabled) {
      startAutoSync()
      toast.success('Auto-sync enabled')
    } else {
      stopAutoSync()
      toast.info('Auto-sync disabled')
    }
  }

  const getStatusIcon = () => {
    switch (syncStatus.status) {
      case 'syncing':
        return <Clock className="animate-spin" size={20} />
      case 'success':
        return <CheckCircle size={20} className="text-success" />
      case 'error':
        return <XCircle size={20} className="text-destructive" />
      default:
        return <CloudArrowUp size={20} />
    }
  }

  const getStatusBadge = () => {
    switch (syncStatus.status) {
      case 'syncing':
        return <Badge variant="secondary">Syncing...</Badge>
      case 'success':
        return <Badge variant="default" className="bg-success">Synced</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">Idle</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <GithubLogo size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">GitHub Sync</h2>
            <p className="text-muted-foreground text-sm">
              Automatically backup and sync your data to GitHub repository
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          {getStatusBadge()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Pending Changes</p>
            <p className="text-3xl font-bold text-foreground">{syncStatus.pendingChanges}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Changes</p>
            <p className="text-3xl font-bold text-foreground">{changeLog.length}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Last Sync</p>
            <p className="text-lg font-semibold text-foreground">
              {syncStatus.lastSyncTime
                ? formatDistanceToNow(syncStatus.lastSyncTime, { addSuffix: true })
                : 'Never'}
            </p>
          </div>
        </Card>
      </div>

      {syncStatus.error && (
        <Alert variant="destructive">
          <XCircle size={16} />
          <AlertDescription>{syncStatus.error}</AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Repository Configuration</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner">Repository Owner</Label>
                  <Input
                    id="owner"
                    placeholder="e.g., your-username"
                    value={formData.owner}
                    onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="repo">Repository Name</Label>
                  <Input
                    id="repo"
                    placeholder="e.g., hotel-pms-data"
                    value={formData.repo}
                    onChange={(e) => setFormData(prev => ({ ...prev, repo: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch" className="flex items-center gap-2">
                    <GitBranch size={16} />
                    Branch
                  </Label>
                  <Input
                    id="branch"
                    placeholder="main"
                    value={formData.branch}
                    onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interval">Auto-Sync Interval (minutes)</Label>
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    placeholder="5"
                    value={formData.autoSyncInterval}
                    onChange={(e) => setFormData(prev => ({ ...prev, autoSyncInterval: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="token" className="flex items-center gap-2">
                  <Key size={16} />
                  GitHub Personal Access Token
                </Label>
                <Input
                  id="token"
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={formData.token}
                  onChange={(e) => setFormData(prev => ({ ...prev, token: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Create a token at GitHub Settings → Developer settings → Personal access tokens
                  with 'repo' permission
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-sync">Enable Auto-Sync</Label>
              <p className="text-sm text-muted-foreground">
                Automatically sync changes at the specified interval
              </p>
            </div>
            <Switch
              id="auto-sync"
              checked={formData.enabled}
              onCheckedChange={handleToggleAutoSync}
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSaveConfig} className="flex-1">
              Save Configuration
            </Button>
            <Button
              onClick={handleTestSync}
              variant="outline"
              disabled={!config?.owner || !config?.repo || !config?.token}
            >
              <Play size={16} className="mr-2" />
              Test Sync Now
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <List size={20} />
            <h3 className="text-lg font-semibold">Change Log</h3>
          </div>
          <Button
            onClick={clearSyncedHistory}
            variant="outline"
            size="sm"
            disabled={changeLog.filter(c => c.synced).length === 0}
          >
            <Trash size={16} className="mr-2" />
            Clear Synced
          </Button>
        </div>

        <ScrollArea className="h-96">
          <div className="space-y-2">
            {changeLog.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <List size={48} className="mx-auto mb-2 opacity-50" />
                <p>No changes recorded yet</p>
              </div>
            ) : (
              changeLog
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((change) => (
                  <ChangeLogItem key={change.id} change={change} />
                ))
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}

function ChangeLogItem({ change }: { change: ChangeRecord }) {
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return <Badge variant="default" className="bg-success">Create</Badge>
      case 'update':
        return <Badge variant="default" className="bg-primary">Update</Badge>
      case 'delete':
        return <Badge variant="destructive">Delete</Badge>
      default:
        return <Badge variant="outline">{action}</Badge>
    }
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div>
          {change.synced ? (
            <CheckCircle size={20} className="text-success" />
          ) : (
            <Clock size={20} className="text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getActionBadge(change.action)}
            <code className="text-sm text-muted-foreground truncate">{change.key}</code>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(change.timestamp, { addSuffix: true })}
          </p>
        </div>
      </div>
      {change.synced && (
        <Badge variant="outline" className="ml-2">
          Synced
        </Badge>
      )}
    </div>
  )
}
