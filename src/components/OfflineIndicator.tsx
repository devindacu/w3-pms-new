import { useOfflineStatus } from '@/hooks/use-offline'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  WifiSlash,
  WifiHigh,
  ArrowsClockwise,
  CheckCircle,
  Clock,
  Warning,
} from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'

export function OfflineIndicator() {
  const { isOnline, queueStatus, syncPending, clearQueue } = useOfflineStatus()

  const hasPending = queueStatus.pending > 0

  if (isOnline && !hasPending) {
    return null
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative rounded-xl ${
            !isOnline
              ? 'bg-destructive/10 hover:bg-destructive/20 text-destructive'
              : hasPending
              ? 'bg-warning/10 hover:bg-warning/20 text-warning'
              : 'bg-muted/50 hover:bg-muted'
          }`}
        >
          {!isOnline ? (
            <WifiSlash size={20} weight="bold" />
          ) : (
            <WifiHigh size={20} weight="bold" />
          )}
          {hasPending && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-warning text-[10px] font-bold text-warning-foreground">
              {queueStatus.pending}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Connection Status</h4>
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

          {!isOnline && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm">
              <div className="flex items-start gap-2">
                <Warning size={18} className="mt-0.5 text-destructive shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-destructive">No Connection</p>
                  <p className="text-xs text-muted-foreground">
                    Changes will be saved locally and synced when you're back
                    online.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={16} />
                <span>Pending</span>
              </div>
              <span className="font-semibold text-warning">
                {queueStatus.pending}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle size={16} />
                <span>Synced</span>
              </div>
              <span className="font-semibold text-success">
                {queueStatus.synced}
              </span>
            </div>

            {queueStatus.lastSync && (
              <div className="text-xs text-muted-foreground pt-2 border-t">
                Last sync:{' '}
                {formatDistanceToNow(queueStatus.lastSync, { addSuffix: true })}
              </div>
            )}
          </div>

          {hasPending && (
            <div className="space-y-2 pt-2 border-t">
              {isOnline && (
                <Button
                  onClick={syncPending}
                  size="sm"
                  className="w-full"
                  variant="default"
                >
                  <ArrowsClockwise size={16} className="mr-2" weight="bold" />
                  Sync Now
                </Button>
              )}
              <Button
                onClick={clearQueue}
                size="sm"
                className="w-full"
                variant="outline"
              >
                Clear Queue
              </Button>
            </div>
          )}

          {!hasPending && isOnline && (
            <div className="rounded-lg bg-success/10 p-3 text-center">
              <CheckCircle size={24} className="mx-auto mb-2 text-success" weight="bold" />
              <p className="text-sm font-medium text-success">
                All operations synced
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
