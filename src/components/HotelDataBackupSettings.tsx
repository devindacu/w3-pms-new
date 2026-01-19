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
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
  Database,
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
  GithubLogo,
  CalendarBlank,
  HardDrives
} from '@phosphor-icons/react'
import { useHotelDataBackup } from '@/hooks/use-hotel-data-backup'
import { formatDistanceToNow } from 'date-fns'

export function HotelDataBackupSettings() {
  const {
    config,
    status,
    backupHistory,
    manualBackup,
    updateConfig,
    clearHistory
  } = useHotelDataBackup()

  const [formData, setFormData] = useState({
    owner: config?.owner || '',
    repo: config?.repo || '',
    branch: config?.branch || 'Primary', // Default Spark repository branch
    token: config?.token || '',
    frequency: config?.schedule.frequency || 'daily',
    time: config?.schedule.time || '02:00',
    dayOfWeek: (config?.schedule.dayOfWeek || 0).toString(),
    enabled: config?.schedule.enabled || false,
    retentionDays: (config?.retentionDays || 30).toString(),
    compression: config?.compression || true
  })

  const [dataCategories, setDataCategories] = useState(config?.dataCategories ||{
    guests: true,
    rooms: true,
    reservations: true,
    employees: true,
    invoices: true,
    payments: true,
    inventory: true,
    housekeeping: true,
    finance: true,
    reports: false
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isBacking, setIsBacking] = useState(false)

  useEffect(() => {
    if (config) {
      setFormData({
        owner: config.owner || '',
        repo: config.repo || '',
        branch: config.branch || 'Primary', // Default Spark repository branch
        token: config.token || '',
        frequency: config.schedule.frequency || 'daily',
        time: config.schedule.time || '02:00',
        dayOfWeek: (config.schedule.dayOfWeek || 0).toString(),
        enabled: config.schedule.enabled || false,
        retentionDays: (config.retentionDays || 30).toString(),
        compression: config.compression || true
      })
      setDataCategories(config.dataCategories)
    }
  }, [config])

  const handleSaveConfig = async () => {
    setIsSaving(true)
    try {
      updateConfig({
        owner: formData.owner.trim(),
        repo: formData.repo.trim(),
        branch: formData.branch.trim() || 'Primary', // Default Spark repository branch
        token: formData.token.trim(),
        retentionDays: parseInt(formData.retentionDays) || 30,
        compression: formData.compression,
        schedule: {
          enabled: formData.enabled,
          frequency: formData.frequency as 'hourly' | 'daily' | 'weekly' | 'manual',
          time: formData.time,
          dayOfWeek: parseInt(formData.dayOfWeek)
        },
        dataCategories
      })
      toast.success('Backup configuration saved successfully')
    } catch (error) {
      toast.error('Failed to save configuration')
    } finally {
      setIsSaving(false)
    }
  }

  const handleBackupNow = async () => {
    if (!config?.owner || !config?.repo || !config?.token) {
      toast.error('Please save your configuration first')
      return
    }

    setIsBacking(true)
    try {
      await manualBackup()
    } finally {
      setIsBacking(false)
    }
  }

  const handleToggleAutoBackup = (enabled: boolean) => {
    if (!config?.owner || !config?.repo || !config?.token) {
      toast.error('Please configure GitHub settings before enabling auto-backup')
      return
    }

    setFormData(prev => ({ ...prev, enabled }))
    updateConfig({
      schedule: {
        ...config.schedule,
        enabled
      }
    })
    
    if (enabled) {
      toast.success('Auto-backup enabled')
    } else {
      toast.info('Auto-backup disabled')
    }
  }

  const handleClearHistory = () => {
    clearHistory()
  }

  const isConfigValid = formData.owner && formData.repo && formData.branch && formData.token

  const getStatusIcon = () => {
    switch (status?.status) {
      case 'backing-up':
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
    switch (status?.status) {
      case 'backing-up':
        return <Badge variant="secondary">Backing Up...</Badge>
      case 'success':
        return <Badge variant="default" className="bg-success">Success</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">Idle</Badge>
    }
  }

  const selectedCategoryCount = Object.values(dataCategories).filter(Boolean).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Database size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Hotel Data Backup</h2>
            <p className="text-muted-foreground text-sm">
              Automatically backup all hotel data to GitHub repository
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          {getStatusBadge()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Backups</p>
            <p className="text-3xl font-bold text-foreground">{status?.totalBackups || 0}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Last Backup</p>
            <p className="text-lg font-semibold text-foreground">
              {status?.lastBackupTime
                ? formatDistanceToNow(status.lastBackupTime, { addSuffix: true })
                : 'Never'}
            </p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Last Size</p>
            <p className="text-lg font-semibold text-foreground">
              {status?.lastBackupSize
                ? `${(status.lastBackupSize / 1024).toFixed(2)} KB`
                : 'N/A'}
            </p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Next Backup</p>
            <p className="text-sm font-semibold text-foreground">
              {config?.schedule.enabled && config?.schedule.nextBackup
                ? formatDistanceToNow(config.schedule.nextBackup, { addSuffix: true })
                : 'Not scheduled'}
            </p>
          </div>
        </Card>
      </div>

      {status?.status === 'backing-up' && status.currentProgress !== undefined && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Backup Progress</span>
              <span className="text-sm text-muted-foreground">{status.currentProgress}%</span>
            </div>
            <Progress value={status.currentProgress} className="h-2" />
          </div>
        </Card>
      )}

      {status?.error && (
        <Alert variant="destructive">
          <XCircle size={16} />
          <AlertDescription>{status.error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="data">Data Selection</TabsTrigger>
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
          <TabsTrigger value="history">Backup History</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">GitHub Repository</h3>
                
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
                        placeholder="e.g., hotel-data-backup"
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
                      <Label htmlFor="retention">Retention Days</Label>
                      <Input
                        id="retention"
                        type="number"
                        min="1"
                        placeholder="30"
                        value={formData.retentionDays}
                        onChange={(e) => setFormData(prev => ({ ...prev, retentionDays: e.target.value }))}
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

              <div>
                <h3 className="text-lg font-semibold mb-4">Backup Schedule</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select
                        value={formData.frequency}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value as any }))}
                      >
                        <SelectTrigger id="frequency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Every Hour</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="manual">Manual Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(formData.frequency === 'daily' || formData.frequency === 'weekly') && (
                      <div className="space-y-2">
                        <Label htmlFor="time">Time</Label>
                        <Input
                          id="time"
                          type="time"
                          value={formData.time}
                          onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                        />
                      </div>
                    )}

                    {formData.frequency === 'weekly' && (
                      <div className="space-y-2">
                        <Label htmlFor="dayOfWeek">Day of Week</Label>
                        <Select
                          value={formData.dayOfWeek}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, dayOfWeek: value }))}
                        >
                          <SelectTrigger id="dayOfWeek">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Sunday</SelectItem>
                            <SelectItem value="1">Monday</SelectItem>
                            <SelectItem value="2">Tuesday</SelectItem>
                            <SelectItem value="3">Wednesday</SelectItem>
                            <SelectItem value="4">Thursday</SelectItem>
                            <SelectItem value="5">Friday</SelectItem>
                            <SelectItem value="6">Saturday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="compression"
                      checked={formData.compression}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, compression: checked as boolean }) as any)
                      }
                    />
                    <label
                      htmlFor="compression"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Enable compression
                    </label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-backup">Enable Auto-Backup</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically backup data based on the schedule above
                  </p>
                </div>
                <Switch
                  id="auto-backup"
                  checked={formData.enabled}
                  onCheckedChange={handleToggleAutoBackup}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleSaveConfig} className="flex-1" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Configuration'}
                </Button>
                <Button
                  onClick={handleBackupNow}
                  variant="outline"
                  disabled={!isConfigValid || isBacking}
                >
                  <Play size={16} className="mr-2" />
                  {isBacking ? 'Backing Up...' : 'Backup Now'}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Select Data Categories</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose which data categories to include in backups
                  </p>
                </div>
                <Badge variant="outline">
                  {selectedCategoryCount} of {Object.keys(dataCategories).length} selected
                </Badge>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(dataCategories).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => 
                        setDataCategories(prev => ({ ...prev, [key]: checked as boolean }))
                      }
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={key}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer capitalize"
                      >
                        {key}
                      </label>
                    </div>
                    <HardDrives size={16} className="text-muted-foreground" />
                  </div>
                ))}
              </div>

              <Alert>
                <Info size={16} />
                <AlertDescription>
                  Backing up all categories ensures complete data recovery capability. Deselecting categories may result in incomplete backups.
                </AlertDescription>
              </Alert>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="setup">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">How to Set Up Hotel Data Backup</h3>
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
                      Create a new private repository on GitHub.com to store your hotel data backups.
                    </p>
                    <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-success" />
                        <span>Make repository private for data security</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-success" />
                        <span>Recommended name: <code className="px-1 bg-background rounded">hotel-data-backup</code></span>
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
                    <h4 className="font-semibold mb-2">Configure Backup Settings</h4>
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
                        <span><strong>Branch:</strong> Usually <code className="px-1 bg-background rounded">main</code></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-success" />
                        <span><strong>Token:</strong> Paste the token you generated</span>
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
                    <h4 className="font-semibold mb-2">Select Data & Test</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Choose data categories and test your configuration.
                    </p>
                    <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-success" />
                        <span>Go to "Data Selection" tab and choose categories</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-success" />
                        <span>Click "Backup Now" to test the connection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-success" />
                        <span>If successful, enable "Auto-Backup"</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-success" />
                        <span>Monitor backup status in the dashboard</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <Info size={16} />
                <AlertDescription>
                  Your data will be backed up to <code className="px-1 bg-background rounded">backups/</code> folder in your repository as JSON files with timestamps.
                </AlertDescription>
              </Alert>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
              <div className="flex items-center gap-2">
                <List size={20} />
                <h3 className="text-lg font-semibold">Backup History</h3>
              </div>
              <Button
                onClick={handleClearHistory}
                variant="outline"
                size="sm"
                disabled={(backupHistory || []).length === 0}
              >
                <Trash size={16} className="mr-2" />
                Clear History
              </Button>
            </div>

            <ScrollArea className="h-96">
              <div className="space-y-2">
                {(backupHistory || []).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarBlank size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No backups recorded yet</p>
                    <p className="text-sm mt-1">Your backup history will appear here</p>
                  </div>
                ) : (
                  (backupHistory || [])
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((backup) => (
                      <div
                        key={backup.id}
                        className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="mt-0.5">
                            {backup.status === 'completed' ? (
                              <CheckCircle size={20} className="text-success" />
                            ) : (
                              <XCircle size={20} className="text-destructive" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Badge variant={backup.status === 'completed' ? 'default' : 'destructive'} className={backup.status === 'completed' ? 'bg-success' : ''}>
                                {backup.status === 'completed' ? 'Success' : 'Failed'}
                              </Badge>
                              <span className="text-sm font-medium">{backup.itemCount} items</span>
                              <span className="text-sm text-muted-foreground">
                                {(backup.size / 1024).toFixed(2)} KB
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {formatDistanceToNow(backup.timestamp, { addSuffix: true })}
                            </p>
                            <div className="flex items-center gap-1 flex-wrap">
                              {backup.categories.map((cat) => (
                                <Badge key={cat} variant="outline" className="text-xs">
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                            {backup.error && (
                              <p className="text-xs text-destructive mt-2">{backup.error}</p>
                            )}
                          </div>
                        </div>
                        {backup.commitSha && (
                          <div className="ml-4">
                            <Badge variant="secondary" className="font-mono text-xs">
                              {backup.commitSha.substring(0, 7)}
                            </Badge>
                          </div>
                        )}
                      </div>
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
