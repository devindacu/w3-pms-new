import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QuickCheckInOut } from '@/components/QuickCheckInOut'
import { QuickRoomStatus } from '@/components/QuickRoomStatus'
import { QuickPaymentRecord } from '@/components/QuickPaymentRecord'
import { useOfflineStatus } from '@/hooks/use-offline'
import { Badge } from '@/components/ui/badge'
import { 
  SignIn,
  Bed, 
  CurrencyDollar,
  WifiSlash,
  WifiHigh,
  ArrowsClockwise,
  CheckCircle,
  Info
} from '@phosphor-icons/react'
import type { Room } from '@/lib/types'

type OfflineOperationsPanelProps = {
  rooms: Room[]
  onUpdateRoom: (roomId: string, updates: Partial<Room>) => void
}

export function OfflineOperationsPanel({
  rooms,
  onUpdateRoom,
}: OfflineOperationsPanelProps) {
  const { isOnline, queueStatus, syncPending } = useOfflineStatus()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Quick Operations
          </h2>
          <p className="text-muted-foreground mt-1">
            Essential operations available offline
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge 
            variant={isOnline ? 'default' : 'destructive'}
            className="text-sm px-3 py-1.5"
          >
            {isOnline ? (
              <>
                <WifiHigh size={16} className="mr-2" weight="bold" />
                Online
              </>
            ) : (
              <>
                <WifiSlash size={16} className="mr-2" weight="bold" />
                Offline Mode
              </>
            )}
          </Badge>
          
          {queueStatus.pending > 0 && isOnline && (
            <Button onClick={syncPending} size="sm" variant="outline">
              <ArrowsClockwise size={16} className="mr-2" weight="bold" />
              Sync {queueStatus.pending}
            </Button>
          )}
        </div>
      </div>

      {!isOnline && (
        <Card className="border-2 border-destructive/50 bg-destructive/5 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <Info size={20} className="text-destructive" weight="bold" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-destructive mb-1">Working Offline</h4>
              <p className="text-sm text-muted-foreground">
                You can continue using these quick operations. All changes will be saved locally
                and automatically synced when your connection is restored.
              </p>
            </div>
          </div>
        </Card>
      )}

      {queueStatus.pending > 0 && (
        <Card className="border-2 border-warning/50 bg-warning/5 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                <CheckCircle size={20} className="text-warning" weight="bold" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-warning mb-1">
                  {queueStatus.pending} Operation{queueStatus.pending > 1 ? 's' : ''} Pending
                </h4>
                <p className="text-sm text-muted-foreground">
                  {isOnline 
                    ? 'Ready to sync to the server'
                    : 'Will sync when you\'re back online'}
                </p>
              </div>
            </div>
            {isOnline && (
              <Button onClick={syncPending} size="sm">
                <ArrowsClockwise size={16} className="mr-2" weight="bold" />
                Sync Now
              </Button>
            )}
          </div>
        </Card>
      )}

      <Tabs defaultValue="checkin" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="checkin" className="flex-col gap-2 py-3">
            <SignIn size={24} weight="duotone" />
            <span className="text-xs sm:text-sm">Check In/Out</span>
          </TabsTrigger>
          <TabsTrigger value="status" className="flex-col gap-2 py-3">
            <Bed size={24} weight="duotone" />
            <span className="text-xs sm:text-sm">Room Status</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex-col gap-2 py-3">
            <CurrencyDollar size={24} weight="duotone" />
            <span className="text-xs sm:text-sm">Payment</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checkin" className="mt-6">
          <QuickCheckInOut 
            rooms={rooms}
            onUpdateRoom={onUpdateRoom}
            isOnline={isOnline}
          />
        </TabsContent>

        <TabsContent value="status" className="mt-6">
          <QuickRoomStatus 
            rooms={rooms}
            onUpdateRoom={onUpdateRoom}
            isOnline={isOnline}
          />
        </TabsContent>

        <TabsContent value="payment" className="mt-6">
          <QuickPaymentRecord isOnline={isOnline} />
        </TabsContent>
      </Tabs>

      <Card className="p-6 bg-primary/5 border-primary/20">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Info size={20} className="text-primary" />
          Offline Mode Benefits
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <CheckCircle size={18} className="text-success shrink-0 mt-0.5" weight="bold" />
            <div>
              <p className="font-medium mb-1">Uninterrupted Service</p>
              <p className="text-muted-foreground">Continue operations during connectivity issues</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle size={18} className="text-success shrink-0 mt-0.5" weight="bold" />
            <div>
              <p className="font-medium mb-1">Automatic Sync</p>
              <p className="text-muted-foreground">Changes sync automatically when online</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle size={18} className="text-success shrink-0 mt-0.5" weight="bold" />
            <div>
              <p className="font-medium mb-1">Priority Queue</p>
              <p className="text-muted-foreground">Critical operations sync first</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle size={18} className="text-success shrink-0 mt-0.5" weight="bold" />
            <div>
              <p className="font-medium mb-1">Data Safety</p>
              <p className="text-muted-foreground">All changes saved locally until synced</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
