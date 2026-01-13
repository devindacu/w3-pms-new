import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Warning, CheckCircle, XCircle, Clock } from '@phosphor-icons/react'
import { type Conflict, formatTimestamp } from '@/lib/conflictResolution'

interface ConflictIndicatorProps {
  conflicts: Conflict<any>[]
  onViewConflict: (conflict: Conflict<any>) => void
  onResolveAll?: () => void
}

export function ConflictIndicator({ conflicts, onViewConflict, onResolveAll }: ConflictIndicatorProps) {
  const [open, setOpen] = useState(false)
  
  const pendingCount = conflicts.filter(c => c.status === 'pending').length
  const resolvedCount = conflicts.filter(c => c.status === 'resolved').length

  if (conflicts.length === 0) {
    return null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={pendingCount > 0 ? 'destructive' : 'outline'}
          size="sm"
          className="relative gap-2"
        >
          <Warning size={18} className={pendingCount > 0 ? 'animate-pulse' : ''} />
          {pendingCount > 0 ? (
            <>
              {pendingCount} Conflict{pendingCount !== 1 ? 's' : ''}
              <Badge variant="secondary" className="ml-1 bg-background/20">
                {pendingCount}
              </Badge>
            </>
          ) : (
            <>
              <CheckCircle size={18} />
              All Resolved
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Sync Conflicts</h3>
            <div className="flex items-center gap-2">
              {pendingCount > 0 && (
                <Badge variant="destructive">{pendingCount} Pending</Badge>
              )}
              {resolvedCount > 0 && (
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  {resolvedCount} Resolved
                </Badge>
              )}
            </div>
          </div>
          {pendingCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Data conflicts require your attention
            </p>
          )}
        </div>

        <ScrollArea className="max-h-96">
          <div className="p-2 space-y-2">
            {conflicts.map((conflict) => (
              <div
                key={conflict.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  conflict.status === 'pending'
                    ? 'bg-destructive/5 border-destructive/20 hover:bg-destructive/10'
                    : conflict.status === 'resolved'
                    ? 'bg-success/5 border-success/20 hover:bg-success/10'
                    : 'bg-muted/50 border-muted hover:bg-muted'
                }`}
                onClick={() => {
                  if (conflict.status === 'pending') {
                    onViewConflict(conflict)
                    setOpen(false)
                  }
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {conflict.status === 'pending' && (
                      <Warning size={16} className="text-destructive shrink-0" />
                    )}
                    {conflict.status === 'resolved' && (
                      <CheckCircle size={16} className="text-success shrink-0" />
                    )}
                    {conflict.status === 'ignored' && (
                      <XCircle size={16} className="text-muted-foreground shrink-0" />
                    )}
                    <span className="font-medium text-sm truncate">{conflict.key}</span>
                  </div>
                  <Badge
                    variant={
                      conflict.status === 'pending'
                        ? 'destructive'
                        : conflict.status === 'resolved'
                        ? 'outline'
                        : 'secondary'
                    }
                    className={
                      conflict.status === 'resolved'
                        ? 'bg-success/10 text-success border-success/20'
                        : ''
                    }
                  >
                    {conflict.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock size={12} />
                  {formatTimestamp(conflict.detectedAt)}
                </div>

                {conflict.status === 'resolved' && conflict.strategy && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Resolved using: <span className="font-medium">{conflict.strategy}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {pendingCount > 0 && onResolveAll && (
          <>
            <Separator />
            <div className="p-3">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => {
                  onResolveAll()
                  setOpen(false)
                }}
              >
                Auto-Resolve All (Last Write Wins)
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
