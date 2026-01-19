import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowsClockwise, 
  CheckCircle, 
  WifiSlash, 
  Warning, 
  Clock,
  ArrowsLeftRight,
  CloudArrowUp,
  CloudCheck,
  CloudSlash
} from '@phosphor-icons/react'
import { type SyncStatus } from '@/hooks/use-server-sync'
import { formatDistanceToNow } from 'date-fns'

interface ServerSyncStatusIndicatorProps {
  syncStatus: SyncStatus
  queueDepth?: number
  lastSyncTime?: number
  conflictCount?: number
  onForceSync?: () => void
  onShowConflicts?: () => void
}

export function ServerSyncStatusIndicator({
  syncStatus,
  queueDepth = 0,
  lastSyncTime,
  conflictCount = 0,
  onForceSync,
  onShowConflicts,
}: ServerSyncStatusIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const getStatusColor = () => {
    if (!isOnline || syncStatus === 'offline') return 'text-muted-foreground'
    if (syncStatus === 'conflict') return 'text-warning'
    if (syncStatus === 'error') return 'text-destructive'
    if (syncStatus === 'syncing') return 'text-primary'
    return 'text-success'
  }

  const getStatusIcon = () => {
    if (!isOnline || syncStatus === 'offline') {
      return <CloudSlash size={16} className={getStatusColor()} />
    }
    if (syncStatus === 'conflict') {
      return <Warning size={16} className={getStatusColor()} />
    }
    if (syncStatus === 'error') {
      return <CloudSlash size={16} className={getStatusColor()} />
    }
    if (syncStatus === 'syncing') {
      return <CloudArrowUp size={16} className={`${getStatusColor()} animate-pulse`} />
    }
    return <CloudCheck size={16} className={getStatusColor()} />
  }

  const getStatusText = () => {
    if (!isOnline) return 'Offline'
    if (syncStatus === 'offline') return 'Offline'
    if (syncStatus === 'conflict') return `${conflictCount} Conflict${conflictCount > 1 ? 's' : ''}`
    if (syncStatus === 'error') return 'Sync Error'
    if (syncStatus === 'syncing') return 'Syncing...'
    return 'Synced'
  }

  const getStatusBadgeVariant = (): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (syncStatus === 'conflict' || syncStatus === 'error') return 'destructive'
    if (syncStatus === 'syncing') return 'default'
    return 'outline'
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 h-8 px-2">
          {getStatusIcon()}
          <span className="text-xs hidden sm:inline">{getStatusText()}</span>
          {queueDepth > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {queueDepth}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-1 flex items-center gap-2">
              {getStatusIcon()}
              Server Sync Status
            </h4>
            <p className="text-sm text-muted-foreground">
              Real-time synchronization across all your devices
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={getStatusBadgeVariant()} className="gap-1">
                {getStatusIcon()}
                {getStatusText()}
              </Badge>
            </div>

            {lastSyncTime && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock size={14} />
                  Last Sync:
                </span>
                <span className="text-sm">
                  {formatDistanceToNow(lastSyncTime, { addSuffix: true })}
                </span>
              </div>
            )}

            {queueDepth > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending Changes:</span>
                <Badge variant="secondary">{queueDepth}</Badge>
              </div>
            )}

            {conflictCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <ArrowsLeftRight size={14} />
                  Conflicts:
                </span>
                <Badge variant="destructive">{conflictCount}</Badge>
              </div>
            )}

            {!isOnline && (
              <div className="p-3 bg-muted/50 rounded-lg border border-warning/30">
                <div className="flex items-start gap-2">
                  <WifiSlash size={16} className="text-warning mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-warning">No internet connection</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Changes are saved locally and will sync when you're back online
                    </p>
                  </div>
                </div>
              </div>
            )}

            {syncStatus === 'error' && isOnline && (
              <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/30">
                <div className="flex items-start gap-2">
                  <Warning size={16} className="text-destructive mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-destructive">Sync error occurred</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Unable to sync with server. Check your connection and try again.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {syncStatus === 'synced' && isOnline && (
              <div className="p-3 bg-success/10 rounded-lg border border-success/30">
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-success mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-success">All changes synced</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your data is up to date across all devices
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex gap-2">
            {conflictCount > 0 && onShowConflicts && (
              <Button
                size="sm"
                variant="destructive"
                onClick={onShowConflicts}
                className="flex-1 gap-2"
              >
                <ArrowsLeftRight size={14} />
                Resolve Conflicts
              </Button>
            )}
            {isOnline && onForceSync && (
              <Button
                size="sm"
                variant="outline"
                onClick={onForceSync}
                disabled={syncStatus === 'syncing'}
                className="flex-1 gap-2"
              >
                <ArrowsClockwise size={14} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
                Force Sync
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>💡 <strong>Tip:</strong> Changes sync automatically every 30 seconds</p>
            <p>🔄 Multi-device sync keeps all your devices in perfect harmony</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
