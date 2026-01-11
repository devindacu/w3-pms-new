import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ClockCounterClockwise,
  DownloadSimple,
  UploadSimple,
  TrashSimple,
  Warning,
  CheckCircle,
  Clock,
  ArrowCounterClockwise,
  FloppyDisk,
  Database,
  Info,
  Calendar,
  FileText,
  GitBranch
} from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import type { SystemUser } from '@/lib/types'

interface BackupSnapshot {
  id: string
  timestamp: number
  description: string
  createdBy: string
  createdByName: string
  dataSize: number
  version: string
  isAutomatic: boolean
  data: Record<string, any>
}

interface AutoBackupSettings {
  enabled: boolean
  frequency: 'hourly' | 'daily' | 'weekly'
  retentionDays: number
  maxBackups: number
}

interface VersionControlProps {
  currentUser: SystemUser
}

export function VersionControl({ currentUser }: VersionControlProps) {
  const [backups, setBackups] = useKV<BackupSnapshot[]>('w3-hotel-backups', [])
  const [autoBackupSettings, setAutoBackupSettings] = useKV<AutoBackupSettings>('w3-hotel-auto-backup-settings', {
    enabled: true,
    frequency: 'daily',
    retentionDays: 30,
    maxBackups: 50
  })
  const [lastAutoBackup, setLastAutoBackup] = useKV<number>('w3-hotel-last-auto-backup', 0)
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<BackupSnapshot | null>(null)
  const [backupDescription, setBackupDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)

  const getAllKVData = async () => {
    const keys = await window.spark.kv.keys()
    const data: Record<string, any> = {}
    
    for (const key of keys) {
      if (!key.startsWith('w3-hotel-backups') && !key.startsWith('w3-hotel-auto-backup')) {
        const value = await window.spark.kv.get(key)
        if (value !== undefined) {
          data[key] = value
        }
      }
    }
    
    return data
  }

  const calculateDataSize = (data: Record<string, any>): number => {
    const jsonString = JSON.stringify(data)
    return new Blob([jsonString]).size
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const createBackup = async (isAutomatic = false) => {
    setIsCreating(true)
    try {
      const data = await getAllKVData()
      const dataSize = calculateDataSize(data)
      
      const snapshot: BackupSnapshot = {
        id: `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        description: isAutomatic ? 'Automatic backup' : backupDescription || 'Manual backup',
        createdBy: currentUser.id,
        createdByName: `${currentUser.firstName} ${currentUser.lastName}`,
        dataSize,
        version: '1.0.0',
        isAutomatic,
        data
      }

      setBackups((current) => {
        const updated = [snapshot, ...(current || [])]
        
        if (autoBackupSettings && autoBackupSettings.maxBackups > 0) {
          return updated.slice(0, autoBackupSettings.maxBackups)
        }
        
        return updated
      })

      if (isAutomatic) {
        setLastAutoBackup(Date.now())
      }

      setBackupDescription('')
      setCreateDialogOpen(false)
      toast.success(isAutomatic ? 'Automatic backup created successfully' : 'Backup created successfully')
    } catch (error) {
      toast.error('Failed to create backup')
      console.error(error)
    } finally {
      setIsCreating(false)
    }
  }

  const restoreBackup = async (backup: BackupSnapshot) => {
    setIsRestoring(true)
    try {
      const currentData = await getAllKVData()
      
      const restoreSnapshot: BackupSnapshot = {
        id: `pre-restore-${Date.now()}`,
        timestamp: Date.now(),
        description: `Pre-restore backup (before restoring ${backup.description})`,
        createdBy: currentUser.id,
        createdByName: `${currentUser.firstName} ${currentUser.lastName}`,
        dataSize: calculateDataSize(currentData),
        version: '1.0.0',
        isAutomatic: false,
        data: currentData
      }

      setBackups((current) => [restoreSnapshot, ...(current || [])])

      for (const [key, value] of Object.entries(backup.data)) {
        await window.spark.kv.set(key, value)
      }

      setRestoreDialogOpen(false)
      setSelectedBackup(null)
      toast.success('Backup restored successfully. Reloading page...')
      
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      toast.error('Failed to restore backup')
      console.error(error)
    } finally {
      setIsRestoring(false)
    }
  }

  const deleteBackup = (backupId: string) => {
    setBackups((current) => (current || []).filter(b => b.id !== backupId))
    setDeleteDialogOpen(false)
    setSelectedBackup(null)
    toast.success('Backup deleted successfully')
  }

  const downloadBackup = (backup: BackupSnapshot) => {
    const dataStr = JSON.stringify(backup, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `w3-hotel-backup-${new Date(backup.timestamp).toISOString()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Backup downloaded successfully')
  }

  const uploadBackup = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const backup = JSON.parse(text) as BackupSnapshot
        
        setBackups((current) => [backup, ...(current || [])])
        toast.success('Backup imported successfully')
      } catch (error) {
        toast.error('Failed to import backup. Invalid file format.')
        console.error(error)
      }
    }
    input.click()
  }

  const cleanupOldBackups = () => {
    if (!autoBackupSettings) return

    const cutoffDate = Date.now() - (autoBackupSettings.retentionDays * 24 * 60 * 60 * 1000)
    
    setBackups((current) => 
      (current || []).filter(b => {
        if (!b.isAutomatic) return true
        return b.timestamp > cutoffDate
      })
    )
  }

  useEffect(() => {
    if (!autoBackupSettings?.enabled) return

    const checkAutoBackup = () => {
      const now = Date.now()
      let shouldBackup = false

      if (!lastAutoBackup) {
        shouldBackup = true
      } else {
        const timeSinceLastBackup = now - lastAutoBackup
        const hourInMs = 60 * 60 * 1000
        const dayInMs = 24 * hourInMs
        const weekInMs = 7 * dayInMs

        switch (autoBackupSettings.frequency) {
          case 'hourly':
            shouldBackup = timeSinceLastBackup >= hourInMs
            break
          case 'daily':
            shouldBackup = timeSinceLastBackup >= dayInMs
            break
          case 'weekly':
            shouldBackup = timeSinceLastBackup >= weekInMs
            break
        }
      }

      if (shouldBackup) {
        createBackup(true)
      }
    }

    const interval = setInterval(checkAutoBackup, 5 * 60 * 1000)
    checkAutoBackup()

    return () => clearInterval(interval)
  }, [autoBackupSettings, lastAutoBackup])

  useEffect(() => {
    cleanupOldBackups()
  }, [autoBackupSettings?.retentionDays])

  const totalBackupSize = (backups || []).reduce((sum, b) => sum + b.dataSize, 0)
  const manualBackups = (backups || []).filter(b => !b.isAutomatic)
  const automaticBackups = (backups || []).filter(b => b.isAutomatic)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Backups</h3>
            <Database size={20} className="text-primary" />
          </div>
          <p className="text-3xl font-semibold">{(backups || []).length}</p>
          <div className="mt-2 text-xs text-muted-foreground">
            {manualBackups.length} manual, {automaticBackups.length} automatic
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Size</h3>
            <FloppyDisk size={20} className="text-accent" />
          </div>
          <p className="text-3xl font-semibold">{formatBytes(totalBackupSize)}</p>
          <div className="mt-2 text-xs text-muted-foreground">
            Across all backups
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Last Backup</h3>
            <Clock size={20} className="text-secondary" />
          </div>
          <p className="text-xl font-semibold">
            {lastAutoBackup ? formatDistanceToNow(lastAutoBackup, { addSuffix: true }) : 'Never'}
          </p>
          <div className="mt-2 text-xs text-muted-foreground">
            Auto backup {autoBackupSettings?.enabled ? 'enabled' : 'disabled'}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Auto-Backup Settings</h3>
            <p className="text-sm text-muted-foreground mt-1">Configure automatic backup behavior</p>
          </div>
          <Switch
            checked={autoBackupSettings?.enabled || false}
            onCheckedChange={(enabled) => 
              setAutoBackupSettings((current) => ({ ...current!, enabled }))
            }
          />
        </div>

        {autoBackupSettings?.enabled && (
          <>
            <Separator className="my-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Backup Frequency</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={autoBackupSettings.frequency}
                  onChange={(e) => 
                    setAutoBackupSettings((current) => ({ 
                      ...current!, 
                      frequency: e.target.value as 'hourly' | 'daily' | 'weekly' 
                    }))
                  }
                >
                  <option value="hourly">Every Hour</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Retention Period (Days)</Label>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={autoBackupSettings.retentionDays}
                  onChange={(e) => 
                    setAutoBackupSettings((current) => ({ 
                      ...current!, 
                      retentionDays: parseInt(e.target.value) || 30 
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Maximum Backups</Label>
                <Input
                  type="number"
                  min="1"
                  max="200"
                  value={autoBackupSettings.maxBackups}
                  onChange={(e) => 
                    setAutoBackupSettings((current) => ({ 
                      ...current!, 
                      maxBackups: parseInt(e.target.value) || 50 
                    }))
                  }
                />
              </div>
            </div>
          </>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Backup Management</h3>
            <p className="text-sm text-muted-foreground mt-1">Create, restore, and manage system backups</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={uploadBackup}>
              <UploadSimple size={18} className="mr-2" />
              Import
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <FloppyDisk size={18} className="mr-2" />
              Create Backup
            </Button>
          </div>
        </div>

        {(backups || []).length === 0 ? (
          <div className="text-center py-12">
            <Database size={64} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Backups Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first backup to protect your data
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <FloppyDisk size={18} className="mr-2" />
              Create First Backup
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {(backups || []).map((backup) => (
              <Card key={backup.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <GitBranch size={18} className="text-primary shrink-0" />
                      <h4 className="font-medium truncate">{backup.description}</h4>
                      {backup.isAutomatic && (
                        <Badge variant="secondary" className="shrink-0">Auto</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{new Date(backup.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText size={14} />
                        <span>{formatBytes(backup.dataSize)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Info size={14} />
                        <span>v{backup.version}</span>
                      </div>
                      <div className="flex items-center gap-1 truncate">
                        <span className="truncate">by {backup.createdByName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadBackup(backup)}
                    >
                      <DownloadSimple size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedBackup(backup)
                        setRestoreDialogOpen(true)
                      }}
                    >
                      <ArrowCounterClockwise size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedBackup(backup)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <TrashSimple size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <Alert>
        <Info size={18} />
        <AlertDescription>
          <strong>Important:</strong> Backups are stored in your browser's local storage. For production use, 
          regularly download backups to external storage. Restoring a backup will replace all current data 
          with the backup data.
        </AlertDescription>
      </Alert>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Backup</DialogTitle>
            <DialogDescription>
              Create a snapshot of all system data. You can restore this backup later if needed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Backup Description</Label>
              <Textarea
                id="description"
                placeholder="Enter a description for this backup..."
                value={backupDescription}
                onChange={(e) => setBackupDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => createBackup(false)} disabled={isCreating}>
              {isCreating ? (
                <>Creating...</>
              ) : (
                <>
                  <FloppyDisk size={18} className="mr-2" />
                  Create Backup
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Backup</DialogTitle>
            <DialogDescription>
              This will replace all current data with the backup data. A pre-restore backup will be created automatically.
            </DialogDescription>
          </DialogHeader>

          {selectedBackup && (
            <div className="space-y-4 py-4">
              <Alert>
                <Warning size={18} />
                <AlertDescription>
                  <strong>Warning:</strong> This action will restore data from {new Date(selectedBackup.timestamp).toLocaleString()}.
                  All current data will be replaced.
                </AlertDescription>
              </Alert>

              <Card className="p-4 bg-muted">
                <h4 className="font-medium mb-2">{selectedBackup.description}</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>Created: {new Date(selectedBackup.timestamp).toLocaleString()}</div>
                  <div>Size: {formatBytes(selectedBackup.dataSize)}</div>
                  <div>Created by: {selectedBackup.createdByName}</div>
                </div>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedBackup && restoreBackup(selectedBackup)}
              disabled={isRestoring}
            >
              {isRestoring ? (
                <>Restoring...</>
              ) : (
                <>
                  <ArrowCounterClockwise size={18} className="mr-2" />
                  Restore Backup
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Backup</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this backup? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedBackup && (
            <Card className="p-4 bg-muted my-4">
              <h4 className="font-medium mb-2">{selectedBackup.description}</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>Created: {new Date(selectedBackup.timestamp).toLocaleString()}</div>
                <div>Size: {formatBytes(selectedBackup.dataSize)}</div>
              </div>
            </Card>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedBackup && deleteBackup(selectedBackup.id)}
            >
              <TrashSimple size={18} className="mr-2" />
              Delete Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
