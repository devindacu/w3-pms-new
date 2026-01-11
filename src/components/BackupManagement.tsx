import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  FloppyDisk,
  Download,
  Upload,
  Trash,
  LockKey,
  ClockCounterClockwise,
  ShieldCheck,
  Database,
  Warning,
  Check,
  FileArchive
} from '@phosphor-icons/react'
import {
  type BackupMetadata,
  type BackupSettings,
  createBackup,
  restoreBackup,
  downloadBackup,
  uploadBackup,
  getAllKVData,
  restoreAllKVData,
  formatBytes,
  cleanupOldBackups
} from '@/lib/backupEncryption'
import type { SystemUser } from '@/lib/types'

interface BackupManagementProps {
  currentUser: SystemUser
}

export function BackupManagement({ currentUser }: BackupManagementProps) {
  const [backups, setBackups] = useKV<BackupMetadata[]>('w3-hotel-backups', [])
  const [backupData, setBackupData] = useKV<Record<string, string>>('w3-hotel-backup-data', {})
  const [settings, setSettings] = useKV<BackupSettings>('w3-hotel-backup-settings', {
    autoBackupEnabled: false,
    autoBackupInterval: 24 * 60 * 60 * 1000,
    maxBackups: 10,
    encryptionEnabled: true,
    compressionEnabled: true,
    includeSystemData: true,
    includeSampleData: false
  })

  const [creating, setCreating] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<BackupMetadata | null>(null)
  
  const [backupName, setBackupName] = useState('')
  const [backupDescription, setBackupDescription] = useState('')
  const [encryptionPassword, setEncryptionPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [restorePassword, setRestorePassword] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  useEffect(() => {
    if (settings?.autoBackupEnabled) {
      const interval = setInterval(() => {
        handleAutoBackup()
      }, settings.autoBackupInterval)

      return () => clearInterval(interval)
    }
  }, [settings?.autoBackupEnabled, settings?.autoBackupInterval])

  const handleAutoBackup = async () => {
    try {
      const kvData = await getAllKVData()
      
      const { backup, data } = await createBackup(
        kvData,
        settings || {
          autoBackupEnabled: false,
          autoBackupInterval: 24 * 60 * 60 * 1000,
          maxBackups: 10,
          encryptionEnabled: false,
          compressionEnabled: true,
          includeSystemData: true,
          includeSampleData: false
        },
        undefined,
        {
          name: `Auto Backup ${new Date().toLocaleString()}`,
          description: 'Automatically created backup',
          autoBackup: true
        }
      )

      setBackups((current) => {
        const updated = [...(current || []), backup]
        const cleaned = cleanupOldBackups(updated, settings?.maxBackups || 10)
        return cleaned
      })

      setBackupData((current) => ({
        ...(current || {}),
        [backup.id]: data
      }))

      console.log('Auto backup created successfully')
    } catch (error) {
      console.error('Auto backup failed:', error)
    }
  }

  const handleCreateBackup = async () => {
    if (settings?.encryptionEnabled && encryptionPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (settings?.encryptionEnabled && encryptionPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setCreating(true)
    try {
      const kvData = await getAllKVData()
      
      const { backup, data } = await createBackup(
        kvData,
        settings || {
          autoBackupEnabled: false,
          autoBackupInterval: 24 * 60 * 60 * 1000,
          maxBackups: 10,
          encryptionEnabled: false,
          compressionEnabled: true,
          includeSystemData: true,
          includeSampleData: false
        },
        settings?.encryptionEnabled ? encryptionPassword : undefined,
        {
          name: backupName || `Manual Backup ${new Date().toLocaleString()}`,
          description: backupDescription,
          autoBackup: false
        }
      )

      setBackups((current) => [...(current || []), backup])
      setBackupData((current) => ({
        ...(current || {}),
        [backup.id]: data
      }))

      toast.success('Backup created successfully')
      setCreateDialogOpen(false)
      setBackupName('')
      setBackupDescription('')
      setEncryptionPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error('Failed to create backup: ' + (error as Error).message)
    } finally {
      setCreating(false)
    }
  }

  const handleRestoreBackup = async (backup: BackupMetadata) => {
    if (backup.encrypted && !restorePassword) {
      toast.error('Password required for encrypted backup')
      return
    }

    setRestoring(true)
    try {
      const data = backupData?.[backup.id]
      if (!data) {
        throw new Error('Backup data not found')
      }

      const restoredData = await restoreBackup(
        data,
        backup.encrypted ? restorePassword : undefined,
        settings?.compressionEnabled || false
      )

      await restoreAllKVData(restoredData)

      toast.success('Backup restored successfully. Refreshing...')
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      toast.error('Failed to restore backup: ' + (error as Error).message)
    } finally {
      setRestoring(false)
      setRestoreDialogOpen(false)
      setRestorePassword('')
    }
  }

  const handleDownloadBackup = (backup: BackupMetadata) => {
    const data = backupData?.[backup.id]
    if (!data) {
      toast.error('Backup data not found')
      return
    }

    const filename = `${backup.name.replace(/[^a-z0-9]/gi, '_')}_${backup.id}.w3backup`
    downloadBackup(data, filename)
    toast.success('Backup downloaded')
  }

  const handleUploadBackup = async () => {
    if (!uploadedFile) {
      toast.error('Please select a file')
      return
    }

    try {
      const data = await uploadBackup(uploadedFile)
      
      const backup: BackupMetadata = {
        id: `imported-${Date.now()}`,
        name: uploadedFile.name.replace('.w3backup', ''),
        description: 'Imported backup',
        timestamp: Date.now(),
        size: uploadedFile.size,
        encrypted: true,
        autoBackup: false,
        dataKeys: [],
        checksum: ''
      }

      setBackups((current) => [...(current || []), backup])
      setBackupData((current) => ({
        ...(current || {}),
        [backup.id]: data
      }))

      toast.success('Backup imported successfully')
      setUploadedFile(null)
    } catch (error) {
      toast.error('Failed to import backup: ' + (error as Error).message)
    }
  }

  const handleDeleteBackup = (backup: BackupMetadata) => {
    setBackups((current) => (current || []).filter(b => b.id !== backup.id))
    setBackupData((current) => {
      const updated = { ...(current || {}) }
      delete updated[backup.id]
      return updated
    })
    toast.success('Backup deleted')
    setDeleteConfirmOpen(false)
    setSelectedBackup(null)
  }

  const sortedBackups = [...(backups || [])].sort((a, b) => b.timestamp - a.timestamp)
  const manualBackups = sortedBackups.filter(b => !b.autoBackup)
  const autoBackups = sortedBackups.filter(b => b.autoBackup)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Backup & Data Security</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create, manage, and restore encrypted backups of your hotel data
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCreateDialogOpen(true)} size="lg">
            <FloppyDisk size={20} className="mr-2" />
            Create Backup
          </Button>
        </div>
      </div>

      <Tabs defaultValue="backups" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="backups">
            <Database size={18} className="mr-2" />
            Backups
          </TabsTrigger>
          <TabsTrigger value="settings">
            <ShieldCheck size={18} className="mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="import">
            <Upload size={18} className="mr-2" />
            Import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="backups" className="space-y-6">
          {manualBackups.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Manual Backups</h3>
              <div className="grid gap-4">
                {manualBackups.map((backup) => (
                  <Card key={backup.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{backup.name}</h4>
                          {backup.encrypted && (
                            <Badge variant="secondary" className="gap-1">
                              <LockKey size={14} />
                              Encrypted
                            </Badge>
                          )}
                          <Badge variant="outline">
                            <FileArchive size={14} className="mr-1" />
                            {formatBytes(backup.size)}
                          </Badge>
                        </div>
                        {backup.description && (
                          <p className="text-sm text-muted-foreground mb-2">{backup.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ClockCounterClockwise size={14} />
                            {new Date(backup.timestamp).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Check size={14} />
                            {backup.dataKeys.length} data keys
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBackup(backup)
                            setRestoreDialogOpen(true)
                          }}
                        >
                          <ClockCounterClockwise size={16} className="mr-1" />
                          Restore
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadBackup(backup)}
                        >
                          <Download size={16} className="mr-1" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBackup(backup)
                            setDeleteConfirmOpen(true)
                          }}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {autoBackups.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Automatic Backups</h3>
              <div className="grid gap-4">
                {autoBackups.map((backup) => (
                  <Card key={backup.id} className="p-4 bg-muted/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-sm">{backup.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            <FileArchive size={12} className="mr-1" />
                            {formatBytes(backup.size)}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <ClockCounterClockwise size={12} className="inline mr-1" />
                          {new Date(backup.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedBackup(backup)
                            setRestoreDialogOpen(true)
                          }}
                        >
                          <ClockCounterClockwise size={14} className="mr-1" />
                          Restore
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadBackup(backup)}
                        >
                          <Download size={14} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {sortedBackups.length === 0 && (
            <Card className="p-12 text-center">
              <Database size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Backups Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first backup to protect your hotel data
              </p>
              <Button onClick={() => setCreateDialogOpen(true)} size="lg">
                <FloppyDisk size={20} className="mr-2" />
                Create First Backup
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Backup Settings</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Automatic Backups</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically create backups at regular intervals
                  </p>
                </div>
                <Switch
                  checked={settings?.autoBackupEnabled || false}
                  onCheckedChange={(checked) =>
                    setSettings((s) => ({ ...(s || {} as BackupSettings), autoBackupEnabled: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Backup Interval (hours)</Label>
                <Input
                  type="number"
                  min="1"
                  max="168"
                  value={(settings?.autoBackupInterval || 86400000) / 3600000}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...(s || {} as BackupSettings),
                      autoBackupInterval: parseInt(e.target.value) * 3600000
                    }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  How often automatic backups should be created
                </p>
              </div>

              <div className="space-y-2">
                <Label>Maximum Backups to Keep</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={settings?.maxBackups || 10}
                  onChange={(e) =>
                    setSettings((s) => ({ ...(s || {} as BackupSettings), maxBackups: parseInt(e.target.value) }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Older automatic backups will be deleted when this limit is reached
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Encryption</Label>
                  <p className="text-sm text-muted-foreground">
                    Encrypt backups with AES-256-GCM encryption
                  </p>
                </div>
                <Switch
                  checked={settings?.encryptionEnabled || false}
                  onCheckedChange={(checked) =>
                    setSettings((s) => ({ ...(s || {} as BackupSettings), encryptionEnabled: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Compression</Label>
                  <p className="text-sm text-muted-foreground">
                    Compress backups to reduce file size
                  </p>
                </div>
                <Switch
                  checked={settings?.compressionEnabled || false}
                  onCheckedChange={(checked) =>
                    setSettings((s) => ({ ...(s || {} as BackupSettings), compressionEnabled: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="flex gap-3">
                  <ShieldCheck size={24} className="text-primary shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Security Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• AES-256-GCM encryption with PBKDF2 key derivation</li>
                      <li>• SHA-256 checksums for data integrity verification</li>
                      <li>• 100,000 iterations for password-based encryption</li>
                      <li>• Automatic backup cleanup to manage storage</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Import Backup</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="backup-file">Backup File</Label>
                <Input
                  id="backup-file"
                  type="file"
                  accept=".w3backup"
                  onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Upload a .w3backup file to import
                </p>
              </div>

              {uploadedFile && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileArchive size={20} className="text-primary" />
                    <span className="font-medium">{uploadedFile.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Size: {formatBytes(uploadedFile.size)}
                  </p>
                </div>
              )}

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex gap-3">
                  <Warning size={24} className="text-yellow-600 shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Important</h4>
                    <p className="text-sm text-muted-foreground">
                      Importing a backup does not automatically restore it. After import, go to the
                      Backups tab to restore the imported backup.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleUploadBackup}
                disabled={!uploadedFile}
                className="w-full"
                size="lg"
              >
                <Upload size={20} className="mr-2" />
                Import Backup
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Backup</DialogTitle>
            <DialogDescription>
              Create a secure backup of all your hotel data
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="backup-name">Backup Name</Label>
              <Input
                id="backup-name"
                placeholder="My Backup"
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="backup-description">Description (Optional)</Label>
              <Textarea
                id="backup-description"
                placeholder="Describe this backup..."
                value={backupDescription}
                onChange={(e) => setBackupDescription(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>

            {settings?.encryptionEnabled && (
              <>
                <Separator />
                <div>
                  <Label htmlFor="encryption-password">Encryption Password</Label>
                  <Input
                    id="encryption-password"
                    type="password"
                    placeholder="Enter a strong password"
                    value={encryptionPassword}
                    onChange={(e) => setEncryptionPassword(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum 8 characters. You'll need this to restore the backup.
                  </p>
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <div className="flex gap-2">
                    <LockKey size={20} className="text-primary shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      <strong>Important:</strong> Store your password safely. Without it, you won't be able
                      to restore this backup.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBackup} disabled={creating}>
              {creating ? 'Creating...' : 'Create Backup'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Restore Backup</DialogTitle>
            <DialogDescription>
              {selectedBackup?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex gap-3">
                <Warning size={24} className="text-yellow-600 shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Warning</h4>
                  <p className="text-sm text-muted-foreground">
                    Restoring this backup will replace all current data. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            {selectedBackup?.encrypted && (
              <div>
                <Label htmlFor="restore-password">Decryption Password</Label>
                <Input
                  id="restore-password"
                  type="password"
                  placeholder="Enter backup password"
                  value={restorePassword}
                  onChange={(e) => setRestorePassword(e.target.value)}
                  className="mt-2"
                />
              </div>
            )}

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">
                  {selectedBackup ? new Date(selectedBackup.timestamp).toLocaleString() : ''}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Size:</span>
                <span className="font-medium">
                  {selectedBackup ? formatBytes(selectedBackup.size) : ''}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Data Keys:</span>
                <span className="font-medium">{selectedBackup?.dataKeys.length || 0}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedBackup && handleRestoreBackup(selectedBackup)}
              disabled={restoring || (selectedBackup?.encrypted && !restorePassword)}
            >
              {restoring ? 'Restoring...' : 'Restore Backup'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Backup</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedBackup?.name}"?
            </DialogDescription>
          </DialogHeader>

          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. The backup file will be permanently deleted.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedBackup && handleDeleteBackup(selectedBackup)}
            >
              Delete Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
