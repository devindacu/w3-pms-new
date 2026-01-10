import { useState } from 'react'
import { useBackup, type BackupVersion } from '@/hooks/use-backup'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Clock,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  Database,
  HardDrive,
  Calendar,
  User,
  FileText,
  AlertCircle,
  CheckCircle2,
  Settings,
  Save,
} from 'lucide-react'

const DEFAULT_CONFIG = {
  enabled: true,
  autoBackup: true,
  retentionDays: 90,
  maxVersions: 100,
  includedModules: ['all'],
  notifyOnFailure: true,
}

export function VersionControl() {
  const {
    versions,
    config,
    setConfig,
    createBackup,
    restoreVersion,
    deleteVersion,
    exportBackup,
    importBackup,
    getVersionStats,
  } = useBackup()

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<BackupVersion | null>(null)
  const [backupDescription, setBackupDescription] = useState('')
  const [importing, setImporting] = useState(false)

  const stats = getVersionStats()

  const handleCreateBackup = async () => {
    const result = await createBackup(backupDescription || 'Manual backup', 'manual')
    if (result) {
      toast.success('Backup created successfully')
      setShowCreateDialog(false)
      setBackupDescription('')
    } else {
      toast.error('Failed to create backup')
    }
  }

  const handleRestore = async () => {
    if (!selectedVersion) return

    const confirmed = window.confirm(
      `Are you sure you want to restore to version from ${new Date(selectedVersion.timestamp).toLocaleString()}? This will overwrite all current data.`
    )

    if (!confirmed) return

    const success = await restoreVersion(selectedVersion.id)
    if (success) {
      toast.success('System restored successfully')
      setShowRestoreDialog(false)
      setSelectedVersion(null)
      window.location.reload()
    } else {
      toast.error('Failed to restore version')
    }
  }

  const handleDelete = async (versionId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this backup version?')
    if (!confirmed) return

    const success = await deleteVersion(versionId)
    if (success) {
      toast.success('Backup version deleted')
    } else {
      toast.error('Failed to delete version')
    }
  }

  const handleExport = async (versionId: string) => {
    try {
      await exportBackup(versionId)
      toast.success('Backup exported successfully')
    } catch (error) {
      toast.error('Failed to export backup')
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)
    const success = await importBackup(file)
    setImporting(false)

    if (success) {
      toast.success('Backup imported successfully')
      window.location.reload()
    } else {
      toast.error('Failed to import backup')
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Version Control & Backups</h2>
        <p className="text-muted-foreground mt-1">
          Manage system backups and restore previous versions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Database className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Total Versions</h3>
          </div>
          <p className="text-3xl font-bold">{stats.totalVersions}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.autoBackups} auto, {stats.manualBackups} manual
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <HardDrive className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Storage Used</h3>
          </div>
          <p className="text-3xl font-bold">{formatBytes(stats.totalSize)}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Across all versions
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Latest Backup</h3>
          </div>
          <p className="text-lg font-bold">
            {stats.newestBackup ? new Date(stats.newestBackup).toLocaleDateString() : 'N/A'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.newestBackup ? new Date(stats.newestBackup).toLocaleTimeString() : ''}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Retention</h3>
          </div>
          <p className="text-3xl font-bold">{config.retentionDays}</p>
          <p className="text-sm text-muted-foreground mt-1">
            days
          </p>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setShowCreateDialog(true)}>
          <Save className="h-4 w-4 mr-2" />
          Create Backup
        </Button>

        <Button variant="outline" onClick={() => setShowConfigDialog(true)}>
          <Settings className="h-4 w-4 mr-2" />
          Configure
        </Button>

        <Button variant="outline" asChild>
          <label>
            <Upload className="h-4 w-4 mr-2" />
            Import Backup
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
              disabled={importing}
            />
          </label>
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Backup History</h3>
          
          {versions.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No backup versions yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first backup to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <h4 className="font-medium truncate">{version.description}</h4>
                        <Badge variant={version.changeType === 'manual' ? 'default' : 'secondary'}>
                          {version.changeType}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(version.timestamp).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {version.createdBy}
                        </div>
                        <div className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          {formatBytes(version.size)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedVersion(version)
                          setShowRestoreDialog(true)
                        }}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Restore
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExport(version.id)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(version.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Manual Backup</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what changed or why you're creating this backup..."
                value={backupDescription}
                onChange={(e) => setBackupDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  This will create a snapshot of all system data. Large datasets may take a moment to backup.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBackup}>
              <Save className="h-4 w-4 mr-2" />
              Create Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Version</DialogTitle>
          </DialogHeader>
          
          {selectedVersion && (
            <div className="space-y-4 py-4">
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-500">Warning</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Restoring this version will overwrite all current data. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Version:</span>
                  <span className="font-medium">{selectedVersion.description}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">
                    {new Date(selectedVersion.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Created by:</span>
                  <span className="font-medium">{selectedVersion.createdBy}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Size:</span>
                  <span className="font-medium">{formatBytes(selectedVersion.size)}</span>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    A backup of the current state will be created before restoration.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRestore}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Backup Configuration</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-backup">Automatic Backups</Label>
                <p className="text-sm text-muted-foreground">
                  Create daily automatic backups
                </p>
              </div>
              <Switch
                id="auto-backup"
                checked={config.autoBackup}
                onCheckedChange={(checked) => 
                  setConfig((c) => ({ ...(c || DEFAULT_CONFIG), autoBackup: checked }))
                }
              />
            </div>

            <Separator />

            <div>
              <Label htmlFor="retention">Retention Period (days)</Label>
              <Input
                id="retention"
                type="number"
                min="1"
                max="365"
                value={config.retentionDays}
                onChange={(e) =>
                  setConfig((c) => ({ ...(c || DEFAULT_CONFIG), retentionDays: parseInt(e.target.value) || 90 }))
                }
              />
              <p className="text-sm text-muted-foreground mt-1">
                Backups older than this will be automatically deleted
              </p>
            </div>

            <div>
              <Label htmlFor="max-versions">Maximum Versions</Label>
              <Input
                id="max-versions"
                type="number"
                min="1"
                max="1000"
                value={config.maxVersions}
                onChange={(e) =>
                  setConfig((c) => ({ ...(c || DEFAULT_CONFIG), maxVersions: parseInt(e.target.value) || 100 }))
                }
              />
              <p className="text-sm text-muted-foreground mt-1">
                Maximum number of backup versions to keep
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notify">Failure Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when backup fails
                </p>
              </div>
              <Switch
                id="notify"
                checked={config.notifyOnFailure}
                onCheckedChange={(checked) =>
                  setConfig((c) => ({ ...(c || DEFAULT_CONFIG), notifyOnFailure: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowConfigDialog(false)}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
