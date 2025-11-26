import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  ArrowsClockwise,
  CheckCircle,
  Warning,
  XCircle,
  Plus,
  TrendUp,
  TrendDown,
  Star,
  Link,
  LinkBreak,
  ArrowRight,
  Calendar,
  CurrencyDollar,
  Users,
  ChartBar,
  ClockClockwise,
  PlayCircle,
  PauseCircle
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { formatCurrency, formatDate } from '@/lib/helpers'
import type {
  OTAConnection,
  RatePlan,
  ChannelInventory,
  ChannelRate,
  ChannelReservation,
  SyncLog,
  ChannelPerformance,
  ChannelReview,
  BulkUpdateOperation,
  OTAChannel,
  Room,
  RoomType
} from '@/lib/types'
import { OTAConnectionDialog } from '@/components/OTAConnectionDialog'
import { RatePlanDialog } from '@/components/RatePlanDialog'
import { ChannelInventoryDialog } from '@/components/ChannelInventoryDialog'
import { BulkUpdateDialog } from '@/components/BulkUpdateDialog'
import { ReviewSyncDialog } from '@/components/ReviewSyncDialog'

interface ChannelManagerProps {
  connections: OTAConnection[]
  setConnections: (connections: OTAConnection[] | ((prev: OTAConnection[]) => OTAConnection[])) => void
  ratePlans: RatePlan[]
  setRatePlans: (plans: RatePlan[] | ((prev: RatePlan[]) => RatePlan[])) => void
  inventory: ChannelInventory[]
  setInventory: (inv: ChannelInventory[] | ((prev: ChannelInventory[]) => ChannelInventory[])) => void
  rates: ChannelRate[]
  setRates: (rates: ChannelRate[] | ((prev: ChannelRate[]) => ChannelRate[])) => void
  reservations: ChannelReservation[]
  setReservations: (res: ChannelReservation[] | ((prev: ChannelReservation[]) => ChannelReservation[])) => void
  syncLogs: SyncLog[]
  setSyncLogs: (logs: SyncLog[] | ((prev: SyncLog[]) => SyncLog[])) => void
  performance: ChannelPerformance[]
  reviews: ChannelReview[]
  setReviews: (reviews: ChannelReview[] | ((prev: ChannelReview[]) => ChannelReview[])) => void
  bulkOperations: BulkUpdateOperation[]
  setBulkOperations: (ops: BulkUpdateOperation[] | ((prev: BulkUpdateOperation[]) => BulkUpdateOperation[])) => void
  rooms: Room[]
  currentUser: { firstName: string; lastName: string }
}

export function ChannelManager({
  connections,
  setConnections,
  ratePlans,
  setRatePlans,
  inventory,
  setInventory,
  rates,
  setRates,
  reservations,
  setReservations,
  syncLogs,
  setSyncLogs,
  performance,
  reviews,
  setReviews,
  bulkOperations,
  setBulkOperations,
  rooms,
  currentUser
}: ChannelManagerProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'connections' | 'rates' | 'inventory' | 'reservations' | 'reviews' | 'sync'>('overview')
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false)
  const [ratePlanDialogOpen, setRatePlanDialogOpen] = useState(false)
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false)
  const [bulkUpdateDialogOpen, setBulkUpdateDialogOpen] = useState(false)
  const [reviewSyncDialogOpen, setReviewSyncDialogOpen] = useState(false)
  const [selectedConnection, setSelectedConnection] = useState<OTAConnection | undefined>()
  const [selectedRatePlan, setSelectedRatePlan] = useState<RatePlan | undefined>()

  const activeConnections = connections.filter(c => c.isActive)
  const totalBookings = connections.reduce((sum, c) => sum + c.totalBookings, 0)
  const totalRevenue = connections.reduce((sum, c) => sum + c.totalRevenue, 0)
  const pendingSyncs = connections.filter(c => c.status === 'pending').length
  const errorConnections = connections.filter(c => c.status === 'error').length

  const handleSync = (channelId: string, syncType: 'full' | 'availability' | 'rates' | 'reservations' | 'reviews') => {
    const connection = connections.find(c => c.id === channelId)
    if (!connection) return

    setConnections(prev => prev.map(c => 
      c.id === channelId ? { ...c, status: 'syncing' as const } : c
    ))

    const syncLog: SyncLog = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      channel: connection.channel,
      syncType,
      direction: 'bidirectional',
      status: 'in-progress',
      startedAt: Date.now(),
      recordsProcessed: 0,
      recordsSuccessful: 0,
      recordsFailed: 0,
      triggeredBy: 'manual',
      executedBy: `${currentUser.firstName} ${currentUser.lastName}`
    }

    setSyncLogs(prev => [syncLog, ...prev])

    setTimeout(() => {
      const recordsProcessed = Math.floor(Math.random() * 100) + 50
      const recordsSuccessful = Math.floor(recordsProcessed * (0.85 + Math.random() * 0.15))
      const recordsFailed = recordsProcessed - recordsSuccessful

      const completedLog: SyncLog = {
        ...syncLog,
        status: recordsFailed === 0 ? 'success' : 'partial',
        completedAt: Date.now(),
        duration: Date.now() - syncLog.startedAt,
        recordsProcessed,
        recordsSuccessful,
        recordsFailed
      }

      setSyncLogs(prev => prev.map(log => log.id === syncLog.id ? completedLog : log))

      setConnections(prev => prev.map(c => 
        c.id === channelId ? { 
          ...c, 
          status: 'connected' as const,
          lastSync: Date.now(),
          nextSync: Date.now() + (c.syncFrequency * 60 * 1000)
        } : c
      ))

      if (recordsFailed === 0) {
        toast.success(`${connection.name} synced successfully`)
      } else {
        toast.warning(`${connection.name} sync completed with ${recordsFailed} errors`)
      }
    }, 2000 + Math.random() * 2000)
  }

  const handleToggleConnection = (id: string) => {
    setConnections(prev => prev.map(c => 
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ))
    const connection = connections.find(c => c.id === id)
    toast.success(`${connection?.name} ${connection?.isActive ? 'deactivated' : 'activated'}`)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle size={20} className="text-success" weight="fill" />
      case 'syncing': return <ArrowsClockwise size={20} className="text-primary animate-spin" />
      case 'error': return <XCircle size={20} className="text-destructive" weight="fill" />
      case 'pending': return <Warning size={20} className="text-accent" weight="fill" />
      default: return <LinkBreak size={20} className="text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      connected: 'default',
      syncing: 'secondary',
      error: 'destructive',
      pending: 'outline',
      disconnected: 'outline'
    }
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Channel Manager</h1>
          <p className="text-muted-foreground mt-1">Manage OTA connections, rates, and inventory synchronization</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setReviewSyncDialogOpen(true)} variant="outline">
            <Star size={18} className="mr-2" />
            Sync Reviews
          </Button>
          <Button onClick={() => setConnectionDialogOpen(true)}>
            <Plus size={18} className="mr-2" />
            Add Channel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Active Channels</h3>
            <Link size={20} className="text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-semibold">{activeConnections.length}</p>
            <p className="text-sm text-muted-foreground">of {connections.length} total</p>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Bookings</h3>
            <Users size={20} className="text-success" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-semibold">{totalBookings}</p>
            <p className="text-sm text-muted-foreground">Across all channels</p>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Channel Revenue</h3>
            <CurrencyDollar size={20} className="text-accent" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-semibold">{formatCurrency(totalRevenue)}</p>
            <p className="text-sm text-muted-foreground">Net of commissions</p>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-destructive">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Sync Status</h3>
            <ArrowsClockwise size={20} className="text-destructive" />
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-semibold">{pendingSyncs}</p>
            <p className="text-sm text-muted-foreground">{errorConnections} errors</p>
          </div>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="rates">Rate Plans</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Channel Performance</h3>
              <div className="space-y-4">
                {performance.slice(0, 5).map((perf) => (
                  <div key={perf.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{perf.channel}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{formatCurrency(perf.revenue)}</span>
                        <Badge variant="secondary">{perf.bookings} bookings</Badge>
                      </div>
                    </div>
                    <Progress value={(perf.revenue / totalRevenue) * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Avg Rate: {formatCurrency(perf.averageRoomRate)}</span>
                      <span>Rating: {perf.averageRating?.toFixed(1) || 'N/A'} ⭐</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Sync Activity</h3>
              <div className="space-y-3">
                {syncLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="mt-1">
                      {log.status === 'success' ? (
                        <CheckCircle size={20} className="text-success" weight="fill" />
                      ) : log.status === 'failed' ? (
                        <XCircle size={20} className="text-destructive" weight="fill" />
                      ) : (
                        <ArrowsClockwise size={20} className="text-primary animate-spin" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{log.channel}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(log.startedAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">{log.syncType} sync</p>
                      {log.completedAt && (
                        <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                          <span>{log.recordsSuccessful} success</span>
                          {log.recordsFailed > 0 && <span className="text-destructive">{log.recordsFailed} failed</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-start"
                onClick={() => setBulkUpdateDialogOpen(true)}
              >
                <ChartBar size={24} className="mb-2 text-primary" />
                <span className="font-medium">Bulk Rate Update</span>
                <span className="text-xs text-muted-foreground mt-1">Update rates across channels</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-start"
                onClick={() => setInventoryDialogOpen(true)}
              >
                <Calendar size={24} className="mb-2 text-accent" />
                <span className="font-medium">Manage Inventory</span>
                <span className="text-xs text-muted-foreground mt-1">Allocate rooms to channels</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-start"
                onClick={() => {
                  activeConnections.forEach(conn => handleSync(conn.id, 'full'))
                }}
              >
                <ArrowsClockwise size={24} className="mb-2 text-success" />
                <span className="font-medium">Sync All Channels</span>
                <span className="text-xs text-muted-foreground mt-1">Full synchronization</span>
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="connections" className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {connections.map((connection) => (
              <Card key={connection.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">
                      {getStatusIcon(connection.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{connection.name}</h3>
                        {getStatusBadge(connection.status)}
                        {!connection.isActive && <Badge variant="outline">Inactive</Badge>}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Bookings</p>
                          <p className="font-semibold">{connection.totalBookings}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Revenue</p>
                          <p className="font-semibold">{formatCurrency(connection.totalRevenue)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Commission</p>
                          <p className="font-semibold">{connection.commission}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Sync</p>
                          <p className="font-semibold">
                            {connection.lastSync ? formatDate(connection.lastSync) : 'Never'}
                          </p>
                        </div>
                      </div>
                      {connection.lastError && (
                        <div className="mt-3 p-3 bg-destructive/10 rounded-lg">
                          <p className="text-sm text-destructive font-medium">Error: {connection.lastError.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(connection.lastError.timestamp)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSync(connection.id, 'full')}
                      disabled={connection.status === 'syncing'}
                    >
                      <ArrowsClockwise size={16} className="mr-2" />
                      Sync
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleToggleConnection(connection.id)}
                    >
                      {connection.isActive ? (
                        <><PauseCircle size={16} className="mr-2" />Pause</>
                      ) : (
                        <><PlayCircle size={16} className="mr-2" />Activate</>
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setSelectedConnection(connection)
                        setConnectionDialogOpen(true)
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Rate Plans</h3>
            <Button onClick={() => setRatePlanDialogOpen(true)}>
              <Plus size={18} className="mr-2" />
              Add Rate Plan
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ratePlans.map((plan) => (
              <Card key={plan.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{plan.name}</h4>
                      <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">{plan.type.replace('-', ' ')}</p>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(plan.baseRate)}</p>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Room Types:</span>
                    <span className="font-medium">{plan.roomTypes.join(', ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Channels:</span>
                    <span className="font-medium">{plan.channels.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Meal Plan:</span>
                    <span className="font-medium capitalize">{plan.mealPlan?.replace('-', ' ')}</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={() => {
                    setSelectedRatePlan(plan)
                    setRatePlanDialogOpen(true)
                  }}
                >
                  Edit Plan
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Channel Inventory Allocation</h3>
            <Button onClick={() => setBulkUpdateDialogOpen(true)}>
              <ChartBar size={18} className="mr-2" />
              Bulk Update
            </Button>
          </div>
          <Card className="p-6">
            <div className="space-y-4">
              {inventory.slice(0, 10).map((inv) => (
                <div key={inv.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize">{inv.roomType.replace('-', ' ')}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(inv.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{inv.availableRooms} / {inv.totalRooms}</p>
                      <p className="text-sm text-muted-foreground">Available</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(inv.channelAllocations).map(([channel, allocation]) => (
                      <div key={channel} className="p-2 bg-muted/50 rounded text-center">
                        <p className="text-xs text-muted-foreground truncate">{channel}</p>
                        <p className="font-semibold">{allocation}</p>
                      </div>
                    ))}
                  </div>
                  <Progress value={(inv.reservedRooms / inv.totalRooms) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reservations" className="space-y-6">
          <h3 className="text-lg font-semibold">Channel Reservations</h3>
          <Card className="p-6">
            <div className="space-y-4">
              {reservations.slice(0, 10).map((res) => (
                <div key={res.id} className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">
                          {res.guestDetails.firstName} {res.guestDetails.lastName}
                        </h4>
                        <Badge variant="secondary">{res.channel}</Badge>
                        <Badge>{res.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Booking: {res.channelBookingId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{formatCurrency(res.totalAmount)}</p>
                      <p className="text-xs text-muted-foreground">Net: {formatCurrency(res.netAmount)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Check-in</p>
                      <p className="font-medium">{formatDate(res.checkInDate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Check-out</p>
                      <p className="font-medium">{formatDate(res.checkOutDate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Room Type</p>
                      <p className="font-medium capitalize">{res.roomType.replace('-', ' ')}</p>
                    </div>
                  </div>
                  {!res.syncedToPMS && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-accent">
                      <Warning size={16} weight="fill" />
                      <span>Not synced to PMS</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Channel Reviews</h3>
            <Button onClick={() => setReviewSyncDialogOpen(true)}>
              <ArrowsClockwise size={18} className="mr-2" />
              Sync Reviews
            </Button>
          </div>
          <Card className="p-6">
            <div className="space-y-4">
              {reviews.slice(0, 10).map((review) => (
                <div key={review.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{review.guestName}</h4>
                        <Badge variant="secondary">{review.channel}</Badge>
                        {review.verified && <Badge variant="outline">Verified</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={16} 
                              weight={i < review.rating ? 'fill' : 'regular'}
                              className={i < review.rating ? 'text-accent' : 'text-muted-foreground'}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(review.submittedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.reviewTitle && (
                    <p className="font-medium mb-2">{review.reviewTitle}</p>
                  )}
                  <p className="text-sm text-muted-foreground mb-3">{review.reviewText}</p>
                  {review.categories && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {Object.entries(review.categories).slice(0, 6).map(([key, value]) => (
                        value && (
                          <div key={key} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="font-medium">{value}/5</span>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                  {!review.responseText && (
                    <Button size="sm" variant="outline">
                      <ArrowRight size={16} className="mr-2" />
                      Respond
                    </Button>
                  )}
                  {review.responseText && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-1">Your Response:</p>
                      <p className="text-sm text-muted-foreground">{review.responseText}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <OTAConnectionDialog
        open={connectionDialogOpen}
        onOpenChange={setConnectionDialogOpen}
        connection={selectedConnection}
        onSave={(conn) => {
          if (selectedConnection) {
            setConnections(prev => prev.map(c => c.id === conn.id ? conn : c))
            toast.success('Connection updated')
          } else {
            setConnections(prev => [...prev, conn])
            toast.success('Connection added')
          }
          setSelectedConnection(undefined)
        }}
        currentUser={currentUser}
      />

      <RatePlanDialog
        open={ratePlanDialogOpen}
        onOpenChange={setRatePlanDialogOpen}
        ratePlan={selectedRatePlan}
        connections={activeConnections}
        onSave={(plan) => {
          if (selectedRatePlan) {
            setRatePlans(prev => prev.map(p => p.id === plan.id ? plan : p))
            toast.success('Rate plan updated')
          } else {
            setRatePlans(prev => [...prev, plan])
            toast.success('Rate plan created')
          }
          setSelectedRatePlan(undefined)
        }}
        currentUser={currentUser}
      />

      <ChannelInventoryDialog
        open={inventoryDialogOpen}
        onOpenChange={setInventoryDialogOpen}
        connections={activeConnections}
        rooms={rooms}
        onSave={(invs) => {
          setInventory(prev => [...prev, ...invs])
          toast.success('Inventory allocated')
        }}
        currentUser={currentUser}
      />

      <BulkUpdateDialog
        open={bulkUpdateDialogOpen}
        onOpenChange={setBulkUpdateDialogOpen}
        connections={activeConnections}
        onSave={(op) => {
          setBulkOperations(prev => [...prev, op])
          toast.success('Bulk update scheduled')
        }}
        currentUser={currentUser}
      />

      <ReviewSyncDialog
        open={reviewSyncDialogOpen}
        onOpenChange={setReviewSyncDialogOpen}
        connections={activeConnections}
        onSync={(syncedReviews) => {
          setReviews(prev => [...prev, ...syncedReviews])
          toast.success(`Synced ${syncedReviews.length} reviews`)
        }}
      />
    </div>
  )
}
