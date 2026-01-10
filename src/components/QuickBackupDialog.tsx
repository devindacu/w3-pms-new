import { useState } from 'react'
import { useBackup } from '@/hooks/use-backup'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Database,
  Clock,
  CheckCircle,
  Warning,
  FloppyDisk,
} from '@phosphor-icons/react'

interface QuickBackupDialogProps {
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function QuickBackupDialog({ trigger, onSuccess }: QuickBackupDialogProps) {
  const { createBackup, versions, getVersionStats } = useBackup()
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const stats = getVersionStats()
  const lastBackup = versions[0]

  const handleCreateBackup = async () => {
    if (!description.trim()) {
      toast.error('Please enter a backup description')
      return
    }

    setCreating(true)
    try {
      const result = await createBackup(description, 'manual')
      if (result) {
        toast.success('Backup created successfully', {
          description: `Backup size: ${formatBytes(result.size)}`,
        })
        setDescription('')
        setOpen(false)
        onSuccess?.()
      } else {
        toast.error('Failed to create backup')
      }
    } catch (error) {
      toast.error('Backup creation failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setCreating(false)
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const getTimeSince = (timestamp?: number): string => {
    if (!timestamp) return 'Never'
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <FloppyDisk size={16} />
            Quick Backup
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database size={24} className="text-primary" />
            Create Manual Backup
          </DialogTitle>
          <DialogDescription>
            Create a backup before making major system changes. You can restore to this point later if needed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
              <Database size={20} className="text-muted-foreground" />
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalVersions}</div>
                <div className="text-xs text-muted-foreground">Total Backups</div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
              <Clock size={20} className="text-muted-foreground" />
              <div className="text-center">
                <div className="text-2xl font-bold">{getTimeSince(stats.newestBackup)}</div>
                <div className="text-xs text-muted-foreground">Last Backup</div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
              <FloppyDisk size={20} className="text-muted-foreground" />
              <div className="text-center">
                <div className="text-2xl font-bold">{formatBytes(stats.totalSize)}</div>
                <div className="text-xs text-muted-foreground">Total Size</div>
              </div>
            </div>
          </div>

          {lastBackup && (
            <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card">
              <CheckCircle size={20} className="text-green-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">Latest Backup</span>
                  <Badge variant="secondary" className="text-xs">
                    {lastBackup.changeType}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{lastBackup.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(lastBackup.timestamp).toLocaleString()}
                  </span>
                  <span>{formatBytes(lastBackup.size)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <Warning size={20} className="text-amber-600 dark:text-amber-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Important</p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Create a backup before: updating system settings, importing data, bulk operations, or major configuration changes.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backup-description">
              Backup Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="backup-description"
              placeholder="Example: Before updating room rate configurations&#10;Example: Before importing guest data from CSV&#10;Example: Before major system settings update"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Provide a clear description so you can identify this backup later
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={creating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateBackup}
            disabled={creating || !description.trim()}
            className="gap-2"
          >
            {creating ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Creating...
              </>
            ) : (
              <>
                <FloppyDisk size={16} />
                Create Backup
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
