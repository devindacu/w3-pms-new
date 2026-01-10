import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  TrendUp,
  TrendDown,
  Lightning,
  Target,
  Trophy,
  Star,
  CheckCircle,
  WarningCircle,
  XCircle,
  ChartLineUp,
  Percent,
  Clock,
  Fire
} from '@phosphor-icons/react'
import { formatCurrency, formatPercent } from '@/lib/helpers'

interface PerformanceMetricsProps {
  data: {
    rooms?: any[]
    reservations?: any[]
    folios?: any[]
    orders?: any[]
    housekeepingTasks?: any[]
    maintenanceRequests?: any[]
  }
}

export function PerformanceMetrics({ data }: PerformanceMetricsProps) {
  const metrics = useMemo(() => {
    const rooms = data.rooms || []
    const reservations = data.reservations || []
    const folios = data.folios || []
    const orders = data.orders || []
    const tasks = data.housekeepingTasks || []
    const maintenance = data.maintenanceRequests || []

    const totalRooms = rooms.length
    const occupiedRooms = rooms.filter(r => r.status?.includes('occupied')).length
    const cleanRooms = rooms.filter(r => r.status?.includes('clean')).length
    const dirtyRooms = rooms.filter(r => r.status?.includes('dirty')).length

    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0
    const cleanlinessRate = totalRooms > 0 ? (cleanRooms / totalRooms) * 100 : 0

    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'completed').length
    const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'assigned').length
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    const confirmedReservations = reservations.filter(r => r.status === 'confirmed').length
    const cancelledReservations = reservations.filter(r => r.status === 'cancelled').length
    const noShowReservations = reservations.filter(r => r.status === 'no-show').length
    const totalReservations = reservations.length
    const conversionRate = totalReservations > 0 
      ? ((confirmedReservations + (reservations.filter(r => r.status === 'checked-in').length)) / totalReservations) * 100 
      : 0

    const totalRevenue = folios.reduce((sum, f) => sum + (f.total || 0), 0)
    const paidFolios = folios.filter(f => f.paymentStatus === 'paid').length
    const totalFolios = folios.length
    const paymentCollectionRate = totalFolios > 0 ? (paidFolios / totalFolios) * 100 : 0

    const avgOrderValue = orders.length > 0 
      ? orders.reduce((sum, o) => sum + (o.total || 0), 0) / orders.length 
      : 0

    const urgentMaintenance = maintenance.filter(m => m.priority === 'urgent' || m.priority === 'high').length
    const openMaintenance = maintenance.filter(m => m.status === 'pending' || m.status === 'in-progress').length
    const maintenanceResponseRate = maintenance.length > 0 
      ? ((maintenance.length - openMaintenance) / maintenance.length) * 100 
      : 100

    return {
      occupancyRate,
      cleanlinessRate,
      taskCompletionRate,
      conversionRate,
      paymentCollectionRate,
      maintenanceResponseRate,
      occupiedRooms,
      totalRooms,
      cleanRooms,
      dirtyRooms,
      completedTasks,
      pendingTasks,
      totalRevenue,
      avgOrderValue,
      urgentMaintenance,
      openMaintenance,
      confirmedReservations,
      cancelledReservations
    }
  }, [data])

  const getPerformanceLevel = (rate: number): { level: string; color: string; icon: any } => {
    if (rate >= 90) return { level: 'Excellent', color: 'text-success bg-success/10 border-success/20', icon: Trophy }
    if (rate >= 75) return { level: 'Good', color: 'text-primary bg-primary/10 border-primary/20', icon: Star }
    if (rate >= 60) return { level: 'Fair', color: 'text-warning bg-warning/10 border-warning/20', icon: Clock }
    return { level: 'Needs Attention', color: 'text-destructive bg-destructive/10 border-destructive/20', icon: WarningCircle }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10">
          <Lightning size={22} weight="duotone" className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Performance Metrics</h2>
          <p className="text-xs text-muted-foreground">Real-time operational efficiency</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-5 border border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Occupancy Performance
              </p>
              <h3 className="text-sm font-medium text-foreground/80">Room Utilization</h3>
            </div>
            <Target size={20} weight="duotone" className="text-primary" />
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-3xl font-bold">{metrics.occupancyRate.toFixed(1)}%</p>
                {(() => {
                  const perf = getPerformanceLevel(metrics.occupancyRate)
                  const Icon = perf.icon
                  return (
                    <Badge className={`${perf.color} border text-xs px-2 py-0.5`}>
                      <Icon size={12} weight="fill" className="mr-1" />
                      {perf.level}
                    </Badge>
                  )
                })()}
              </div>
              <Progress value={metrics.occupancyRate} className="h-2" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Occupied</span>
              <span className="font-semibold">{metrics.occupiedRooms} / {metrics.totalRooms}</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Housekeeping Efficiency
              </p>
              <h3 className="text-sm font-medium text-foreground/80">Task Completion</h3>
            </div>
            <CheckCircle size={20} weight="duotone" className="text-success" />
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-3xl font-bold">{metrics.taskCompletionRate.toFixed(1)}%</p>
                {(() => {
                  const perf = getPerformanceLevel(metrics.taskCompletionRate)
                  const Icon = perf.icon
                  return (
                    <Badge className={`${perf.color} border text-xs px-2 py-0.5`}>
                      <Icon size={12} weight="fill" className="mr-1" />
                      {perf.level}
                    </Badge>
                  )
                })()}
              </div>
              <Progress value={metrics.taskCompletionRate} className="h-2" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pending Tasks</span>
              <span className="font-semibold">{metrics.pendingTasks}</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Room Cleanliness
              </p>
              <h3 className="text-sm font-medium text-foreground/80">Quality Standard</h3>
            </div>
            <Star size={20} weight="duotone" className="text-warning" />
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-3xl font-bold">{metrics.cleanlinessRate.toFixed(1)}%</p>
                {(() => {
                  const perf = getPerformanceLevel(metrics.cleanlinessRate)
                  const Icon = perf.icon
                  return (
                    <Badge className={`${perf.color} border text-xs px-2 py-0.5`}>
                      <Icon size={12} weight="fill" className="mr-1" />
                      {perf.level}
                    </Badge>
                  )
                })()}
              </div>
              <Progress value={metrics.cleanlinessRate} className="h-2" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Dirty Rooms</span>
              <span className="font-semibold text-destructive">{metrics.dirtyRooms}</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Booking Conversion
              </p>
              <h3 className="text-sm font-medium text-foreground/80">Reservation Rate</h3>
            </div>
            <Percent size={20} weight="duotone" className="text-accent" />
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-3xl font-bold">{metrics.conversionRate.toFixed(1)}%</p>
                {(() => {
                  const perf = getPerformanceLevel(metrics.conversionRate)
                  const Icon = perf.icon
                  return (
                    <Badge className={`${perf.color} border text-xs px-2 py-0.5`}>
                      <Icon size={12} weight="fill" className="mr-1" />
                      {perf.level}
                    </Badge>
                  )
                })()}
              </div>
              <Progress value={metrics.conversionRate} className="h-2" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Confirmed</span>
              <span className="font-semibold text-success">{metrics.confirmedReservations}</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Payment Collection
              </p>
              <h3 className="text-sm font-medium text-foreground/80">Revenue Recovery</h3>
            </div>
            <ChartLineUp size={20} weight="duotone" className="text-success" />
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-3xl font-bold">{metrics.paymentCollectionRate.toFixed(1)}%</p>
                {(() => {
                  const perf = getPerformanceLevel(metrics.paymentCollectionRate)
                  const Icon = perf.icon
                  return (
                    <Badge className={`${perf.color} border text-xs px-2 py-0.5`}>
                      <Icon size={12} weight="fill" className="mr-1" />
                      {perf.level}
                    </Badge>
                  )
                })()}
              </div>
              <Progress value={metrics.paymentCollectionRate} className="h-2" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Revenue</span>
              <span className="font-semibold">{formatCurrency(metrics.totalRevenue)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Maintenance Response
              </p>
              <h3 className="text-sm font-medium text-foreground/80">Service Quality</h3>
            </div>
            <Fire size={20} weight="duotone" className="text-destructive" />
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-3xl font-bold">{metrics.maintenanceResponseRate.toFixed(1)}%</p>
                {(() => {
                  const perf = getPerformanceLevel(metrics.maintenanceResponseRate)
                  const Icon = perf.icon
                  return (
                    <Badge className={`${perf.color} border text-xs px-2 py-0.5`}>
                      <Icon size={12} weight="fill" className="mr-1" />
                      {perf.level}
                    </Badge>
                  )
                })()}
              </div>
              <Progress value={metrics.maintenanceResponseRate} className="h-2" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Urgent Issues</span>
              <span className="font-semibold text-destructive">{metrics.urgentMaintenance}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 border border-border/50 bg-gradient-to-br from-card to-card/50 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Overall Performance Score</h3>
        
        <div className="space-y-4">
          {(() => {
            const averageScore = (
              metrics.occupancyRate +
              metrics.taskCompletionRate +
              metrics.cleanlinessRate +
              metrics.conversionRate +
              metrics.paymentCollectionRate +
              metrics.maintenanceResponseRate
            ) / 6

            const perf = getPerformanceLevel(averageScore)
            const Icon = perf.icon

            return (
              <>
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl ${perf.color} border flex items-center justify-center`}>
                    <Icon size={32} weight="duotone" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-2">
                      <p className="text-4xl font-bold">{averageScore.toFixed(1)}%</p>
                      <Badge className={`${perf.color} border`}>
                        {perf.level}
                      </Badge>
                    </div>
                    <Progress value={averageScore} className="h-3" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Occupancy</p>
                    <p className="text-lg font-bold">{metrics.occupancyRate.toFixed(0)}%</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Tasks</p>
                    <p className="text-lg font-bold">{metrics.taskCompletionRate.toFixed(0)}%</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Clean</p>
                    <p className="text-lg font-bold">{metrics.cleanlinessRate.toFixed(0)}%</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Convert</p>
                    <p className="text-lg font-bold">{metrics.conversionRate.toFixed(0)}%</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Payment</p>
                    <p className="text-lg font-bold">{metrics.paymentCollectionRate.toFixed(0)}%</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Service</p>
                    <p className="text-lg font-bold">{metrics.maintenanceResponseRate.toFixed(0)}%</p>
                  </div>
                </div>
              </>
            )
          })()}
        </div>
      </Card>
    </div>
  )
}
