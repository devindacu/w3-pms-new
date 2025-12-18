import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useOfflineStatus } from '@/hooks/use-offline'
import { 
  WifiSlash, 
  WifiHigh, 
  Clock, 
  CheckCircle,
  ArrowsClockwise,
  ArrowRight
} from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'

type OfflineStatusWidgetProps = {
  onNavigate?: () => void
}

export function OfflineStatusWidget({ onNavigate }: OfflineStatusWidgetProps) {
  const { isOnline, queueStatus, syncPending } = useOfflineStatus()

  const hasPending = queueStatus.pending > 0

  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Offline Mode</h3>
        <Badge 
          variant={isOnline ? 'default' : 'destructive'}
          className="text-xs"
        >
          {isOnline ? (
            <>
              <WifiHigh size={12} className="mr-1" weight="bold" />
              Online
            </>
          ) : (
            <>
              <WifiSlash size={12} className="mr-1" weight="bold" />
              Offline
            </>
          )}
        </Badge>
      </div>

      <div className="space-y-4 flex-1">
        {!isOnline && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-sm font-medium text-destructive mb-1">
              Working Offline
            </p>
            <p className="text-xs text-muted-foreground">
              Changes are saved locally and will sync automatically
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-warning" />
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold text-warning">
              {queueStatus.pending}
            </p>
          </div>

          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={16} className="text-success" />
              <span className="text-xs text-muted-foreground">Synced</span>
            </div>
            <p className="text-2xl font-bold text-success">
              {queueStatus.synced}
            </p>
          </div>
        </div>

        {queueStatus.lastSync && (
          <div className="text-xs text-muted-foreground text-center py-2">
            Last synced {formatDistanceToNow(queueStatus.lastSync, { addSuffix: true })}
          </div>
        )}

        {hasPending && !isOnline && (
          <div className="rounded-lg bg-warning/10 border border-warning/20 p-3">
            <p className="text-sm text-warning font-medium mb-1">
              Operations Queued
            </p>
            <p className="text-xs text-muted-foreground">
              {queueStatus.pending} operation{queueStatus.pending > 1 ? 's' : ''} will sync when you're back online
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2 pt-4 border-t mt-4">
        {hasPending && isOnline && (
          <Button 
            onClick={syncPending}
            size="sm"
            className="w-full"
          >
            <ArrowsClockwise size={16} className="mr-2" weight="bold" />
            Sync {queueStatus.pending} Operation{queueStatus.pending > 1 ? 's' : ''}
          </Button>
        )}
        {onNavigate && (
          <Button 
            onClick={onNavigate}
            size="sm"
            variant="outline"
            className="w-full"
          >
            Quick Operations
            <ArrowRight size={16} className="ml-2" />
          </Button>
        )}
      </div>
    </Card>
  )
}
