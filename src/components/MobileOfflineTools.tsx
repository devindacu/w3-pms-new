import { useState } from 'react'
import { useOfflineStatus, useOfflineQueue } from '@/hooks/use-offline'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  WifiSlash,
  WifiHigh,
  ArrowsClockwise,
  List,
  Clock,
  CheckCircle,
  Trash,
  Warning,
  Database,
} from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'

export function MobileOfflineTools() {
  const { isOnline, queueStatus, syncPending, clearQueue } = useOfflineStatus()
  const { getPendingOperations } = useOfflineQueue()
  const [isOpen, setIsOpen] = useState(false)

  const pendingOps = getPendingOperations()

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`relative ${
            !isOnline
              ? 'border-destructive/50 bg-destructive/10 text-destructive'
              : queueStatus.pending > 0
              ? 'border-warning/50 bg-warning/10 text-warning'
              : ''
          }`}
        >
          {!isOnline ? (
            <WifiSlash size={18} weight="bold" className="mr-2" />
          ) : (
            <WifiHigh size={18} weight="bold" className="mr-2" />
          )}
          <span className="hidden sm:inline">
            {isOnline ? 'Online' : 'Offline'}
          </span>
          {queueStatus.pending > 0 && (
            <Badge className="ml-2 h-5 min-w-[20px] px-1.5 bg-warning text-warning-foreground">
              {queueStatus.pending}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-3">
            {isOnline ? (
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <WifiHigh size={20} className="text-success" weight="bold" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <WifiSlash size={20} className="text-destructive" weight="bold" />
              </div>
            )}
            <div className="flex-1 text-left">
              <div className="text-lg font-bold">Offline Mode</div>
              <div className="text-sm font-normal text-muted-foreground">
                {isOnline ? 'Connected' : 'Working offline'}
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="p-6 space-y-6">
          {!isOnline && (
            <Card className="border-2 border-destructive/50 bg-destructive/5 p-4">
              <div className="flex items-start gap-3">
                <Warning size={24} className="text-destructive shrink-0 mt-0.5" weight="bold" />
                <div className="space-y-2 flex-1">
                  <h4 className="font-semibold text-destructive">No Internet Connection</h4>
                  <p className="text-sm text-muted-foreground">
                    Don't worry! All your changes are being saved locally and will
                    automatically sync when you're back online.
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock size={20} className="text-warning" />
                <span className="text-sm text-muted-foreground">Pending</span>
              </div>
              <p className="text-3xl font-bold text-warning">
                {queueStatus.pending}
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle size={20} className="text-success" />
                <span className="text-sm text-muted-foreground">Synced</span>
              </div>
              <p className="text-3xl font-bold text-success">
                {queueStatus.synced}
              </p>
            </Card>
          </div>

          {queueStatus.lastSync && (
            <div className="text-sm text-muted-foreground text-center">
              Last synced {formatDistanceToNow(queueStatus.lastSync, { addSuffix: true })}
            </div>
          )}

          <Tabs defaultValue="pending" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending" className="gap-2">
                <List size={16} />
                Pending
                {queueStatus.pending > 0 && (
                  <Badge className="ml-1 h-5 px-1.5 bg-warning text-warning-foreground">
                    {queueStatus.pending}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="info" className="gap-2">
                <Database size={16} />
                Info
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingOps.length === 0 ? (
                <Card className="p-8 text-center">
                  <CheckCircle size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <h4 className="font-semibold mb-2">All Caught Up!</h4>
                  <p className="text-sm text-muted-foreground">
                    No pending operations to sync
                  </p>
                </Card>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {pendingOps.map((op) => (
                      <Card key={op.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant={
                                  op.type === 'create'
                                    ? 'default'
                                    : op.type === 'update'
                                    ? 'secondary'
                                    : 'destructive'
                                }
                                className="text-xs"
                              >
                                {op.type}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={
                                  op.priority === 'high'
                                    ? 'border-destructive text-destructive'
                                    : op.priority === 'medium'
                                    ? 'border-warning text-warning'
                                    : ''
                                }
                              >
                                {op.priority}
                              </Badge>
                            </div>
                            <p className="font-medium text-sm truncate">
                              {op.resource}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(op.timestamp, {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {pendingOps.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  {isOnline && (
                    <Button
                      onClick={() => {
                        syncPending()
                        setTimeout(() => setIsOpen(false), 1000)
                      }}
                      className="w-full"
                      size="lg"
                    >
                      <ArrowsClockwise size={20} className="mr-2" weight="bold" />
                      Sync All ({queueStatus.pending})
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      if (confirm('Clear all pending operations? This cannot be undone.')) {
                        clearQueue()
                      }
                    }}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <Trash size={20} className="mr-2" />
                    Clear Queue
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="info" className="space-y-4">
              <Card className="p-4">
                <h4 className="font-semibold mb-3">How Offline Mode Works</h4>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Automatic Detection
                      </p>
                      <p>
                        The app automatically detects when you go offline and
                        switches to offline mode.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Local Storage
                      </p>
                      <p>
                        All operations are saved in your device's local storage
                        for safety.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Smart Syncing
                      </p>
                      <p>
                        When back online, operations sync automatically in order
                        of priority.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">4</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Priority Queue
                      </p>
                      <p>
                        High-priority operations (check-ins, payments) sync first.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-primary/5 border-primary/20">
                <h4 className="font-semibold mb-2 text-primary">
                  Critical Operations Supported
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-primary shrink-0" />
                    <span>Guest check-in/check-out</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-primary shrink-0" />
                    <span>Room status updates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-primary shrink-0" />
                    <span>Payment recording</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-primary shrink-0" />
                    <span>Housekeeping tasks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-primary shrink-0" />
                    <span>F&B orders</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-primary shrink-0" />
                    <span>Inventory updates</span>
                  </li>
                </ul>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}
