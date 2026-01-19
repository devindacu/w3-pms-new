import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Info,
  ArrowRight,
  Check,
  Warning,
  Database,
  Upload
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
    branch: initialConfig?.branch || 'primary',
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
    branch: config?.branch || 'primary',
    token: config?.token || '',
    autoSyncInterval: ((config?.autoSyncInterval || 300000) / 60000).toString(),
    enabled: config?.enabled || false
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    if (config) {
      setFormData({
        owner: config.owner || '',
        repo: config.repo || '',
        branch: config.branch || 'primary',
        token: config.token || '',
        autoSyncInterval: ((config.autoSyncInterval || 300000) / 60000).toString(),
        enabled: config.enabled || false
      })
    }
  }, [config])

  const handleSaveConfig = async () => {
    setIsSaving(true)
    try {
      const newConfig: GitHubSyncConfig = {
        owner: formData.owner.trim(),
        repo: formData.repo.trim(),
        branch: formData.branch.trim() || 'primary',
        token: formData.token.trim(),
        autoSyncInterval: parseInt(formData.autoSyncInterval) * 60000,
        enabled: formData.enabled
      }

      updateConfig(newConfig)
      toast.success('GitHub sync configuration saved successfully')
    } catch (error) {
      toast.error('Failed to save configuration')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestSync = async () => {
    if (!config?.owner || !config?.repo || !config?.token) {
      toast.error('Please save your GitHub configuration first')
      return
    }

    setIsTesting(true)
    try {
      recordChange('test-sync', 'create', { 
        test: true, 
        timestamp: Date.now(),
        message: 'Test sync from W3 Hotel PMS'
      })
      
      const result = await syncChanges()
      if (result.success) {
        toast.success(`✓ Sync successful! Commit SHA: ${result.sha?.substring(0, 7)}`)
      } else {
        toast.error(`✗ Sync failed: ${result.error}`)
      }
    } catch (error) {
      toast.error('Test sync failed')
    } finally {
      setIsTesting(false)
    }
  }

  const handleToggleAutoSync = (enabled: boolean) => {
    if (!config?.owner || !config?.repo || !config?.token) {
      toast.error('Please configure GitHub settings before enabling auto-sync')
      return
    }

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

  const handleClearHistory = () => {
    clearSyncedHistory()
    toast.success('Synced history cleared')
  }

  const isConfigValid = formData.owner && formData.repo && formData.branch && formData.token

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
          <TabsTrigger value="logs">Change Log</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
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
                        placeholder="primary"
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
                      Create a token at GitHub Settings → Developer settings → Personal access tokens with 'repo' permission
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

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleSaveConfig} className="flex-1" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Configuration'}
                </Button>
                <Button
                  onClick={handleTestSync}
                  variant="outline"
                  disabled={!isConfigValid || isTesting}
                >
                  <Play size={16} className="mr-2" />
                  {isTesting ? 'Testing...' : 'Test Sync Now'}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="setup">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">How to Set Up GitHub Sync</h3>
                <p className="text-sm text-muted-foreground">
                  Follow these steps to configure automatic data backup to your GitHub repository.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      1
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">Create a GitHub Repository</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Go to GitHub.com and create a new repository to store your hotel data backups.
                    </p>
                    <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-success" />
                        <span>Repository can be private or public</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-success" />
                        <span>Recommended name: <code className="px-1 bg-background rounded">hotel-pms-data</code></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-success" />
                        <span>Initialize with README is optional</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      2
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">Generate a Personal Access Token</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Create a token with repository access permissions.
                    </p>
                    <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <ArrowRight size={16} className="mt-0.5 text-muted-foreground flex-shrink-0" />
                        <span>Navigate to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <ArrowRight size={16} className="mt-0.5 text-muted-foreground flex-shrink-0" />
                        <span>Click "Generate new token"</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <ArrowRight size={16} className="mt-0.5 text-muted-foreground flex-shrink-0" />
                        <span>Give it a descriptive note: <code className="px-1 bg-background rounded">W3 Hotel PMS Sync</code></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <ArrowRight size={16} className="mt-0.5 text-muted-foreground flex-shrink-0" />
                        <span>Select the <code className="px-1 bg-background rounded">repo</code> scope (Full control of private repositories)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <ArrowRight size={16} className="mt-0.5 text-muted-foreground flex-shrink-0" />
                        <span>Generate token and copy it immediately (it won't be shown again)</span>
                      </div>
                    </div>
                    <Alert className="mt-3">
                      <Warning size={16} />
                      <AlertDescription className="text-sm">
                        Never share your token or commit it to a repository. Treat it like a password.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">Configure Sync Settings</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Enter your repository details in the Configuration tab.
                    </p>
                    <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-success" />
                        <span><strong>Repository Owner:</strong> Your GitHub username</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-success" />
                        <span><strong>Repository Name:</strong> The repository you created</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-success" />
                        <span><strong>Branch:</strong> Usually <code className="px-1 bg-background rounded">primary</code></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-success" />
                        <span><strong>Token:</strong> Paste the token you generated</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-success" />
                        <span><strong>Interval:</strong> Recommended 5-15 minutes</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      4
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">Test & Enable</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Test your configuration and enable automatic syncing.
                    </p>
                    <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-success" />
                        <span>Click "Test Sync Now" to verify the connection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-success" />
                        <span>If successful, toggle "Enable Auto-Sync"</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-success" />
                        <span>Monitor sync status in the dashboard</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <Info size={16} />
                <AlertDescription>
                  Your data will be synced to <code className="px-1 bg-background rounded">sync-data/</code> folder in your repository as JSON files with timestamps.
                </AlertDescription>
              </Alert>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
              <div className="flex items-center gap-2">
                <List size={20} />
                <h3 className="text-lg font-semibold">Change Log</h3>
              </div>
              <Button
                onClick={handleClearHistory}
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
                    <Database size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No changes recorded yet</p>
                    <p className="text-sm mt-1">Data changes will appear here</p>
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
        </TabsContent>
      </Tabs>
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
          <div className="flex items-center gap-2 mb-1 flex-wrap">
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
