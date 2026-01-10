import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  CalendarCheck,
  User,
  UserPlus,
  SignIn,
  SignOut,
  Bed,
  CheckCircle,
  XCircle,
  CurrencyDollar,
  ForkKnife,
  Package,
  Wrench,
  ClockCounterClockwise,
  Bell
} from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { formatCurrency } from '@/lib/helpers'

interface Activity {
  id: string
  type: 'reservation' | 'check-in' | 'check-out' | 'guest' | 'payment' | 'order' | 'task' | 'maintenance' | 'inventory'
  title: string
  description: string
  timestamp: number
  icon: any
  color: string
}

interface RealtimeActivityFeedProps {
  data: {
    reservations?: any[]
    guests?: any[]
    folios?: any[]
    orders?: any[]
    housekeepingTasks?: any[]
    maintenanceRequests?: any[]
    inventory?: any[]
  }
  limit?: number
}

export function RealtimeActivityFeed({ data, limit = 20 }: RealtimeActivityFeedProps) {
  const activities = useMemo(() => {
    const allActivities: Activity[] = []

    const reservations = data.reservations || []
    reservations.forEach(r => {
      if (r.status === 'confirmed') {
        allActivities.push({
          id: r.id,
          type: 'reservation',
          title: 'New Reservation',
          description: `Reservation ${r.confirmationNumber || r.id.slice(0, 8)} confirmed`,
          timestamp: r.createdAt || Date.now(),
          icon: CalendarCheck,
          color: 'text-primary bg-primary/10'
        })
      }
      if (r.status === 'checked-in' && r.checkInTime) {
        allActivities.push({
          id: `${r.id}-checkin`,
          type: 'check-in',
          title: 'Guest Check-In',
          description: `Room ${r.roomNumber || 'TBD'} checked in`,
          timestamp: r.checkInTime,
          icon: SignIn,
          color: 'text-success bg-success/10'
        })
      }
      if (r.status === 'checked-out' && r.checkOutTime) {
        allActivities.push({
          id: `${r.id}-checkout`,
          type: 'check-out',
          title: 'Guest Check-Out',
          description: `Room ${r.roomNumber || 'TBD'} checked out`,
          timestamp: r.checkOutTime,
          icon: SignOut,
          color: 'text-muted-foreground bg-muted'
        })
      }
      if (r.status === 'cancelled') {
        allActivities.push({
          id: `${r.id}-cancel`,
          type: 'reservation',
          title: 'Reservation Cancelled',
          description: `Booking ${r.confirmationNumber || r.id.slice(0, 8)} cancelled`,
          timestamp: r.updatedAt || r.createdAt || Date.now(),
          icon: XCircle,
          color: 'text-destructive bg-destructive/10'
        })
      }
    })

    const guests = data.guests || []
    guests.forEach(g => {
      if (g.createdAt && Date.now() - g.createdAt < 7 * 24 * 60 * 60 * 1000) {
        allActivities.push({
          id: g.id,
          type: 'guest',
          title: 'New Guest Profile',
          description: `${g.firstName} ${g.lastName} added to system`,
          timestamp: g.createdAt,
          icon: UserPlus,
          color: 'text-accent bg-accent/10'
        })
      }
    })

    const folios = data.folios || []
    folios.filter(f => f.paymentStatus === 'paid').forEach(f => {
      allActivities.push({
        id: f.id,
        type: 'payment',
        title: 'Payment Received',
        description: `${formatCurrency(f.total || 0)} payment processed`,
        timestamp: f.updatedAt || f.createdAt || Date.now(),
        icon: CurrencyDollar,
        color: 'text-success bg-success/10'
      })
    })

    const orders = data.orders || []
    orders.forEach(o => {
      if (o.status === 'pending') {
        allActivities.push({
          id: o.id,
          type: 'order',
          title: 'New Order',
          description: `Order ${o.orderNumber} - ${formatCurrency(o.total || 0)}`,
          timestamp: o.createdAt || Date.now(),
          icon: ForkKnife,
          color: 'text-warning bg-warning/10'
        })
      }
    })

    const tasks = data.housekeepingTasks || []
    tasks.forEach(t => {
      if (t.status === 'completed' && t.completedAt) {
        allActivities.push({
          id: t.id,
          type: 'task',
          title: 'Task Completed',
          description: `${t.roomNumber || 'Room'} cleaning completed`,
          timestamp: t.completedAt,
          icon: CheckCircle,
          color: 'text-success bg-success/10'
        })
      }
    })

    const maintenance = data.maintenanceRequests || []
    maintenance.forEach(m => {
      if (m.priority === 'urgent' && m.status === 'pending') {
        allActivities.push({
          id: m.id,
          type: 'maintenance',
          title: 'Urgent Maintenance',
          description: `${m.description || 'Maintenance required'}`,
          timestamp: m.createdAt || Date.now(),
          icon: Wrench,
          color: 'text-destructive bg-destructive/10'
        })
      }
    })

    const inventory = data.inventory || []
    inventory.forEach(i => {
      if (i.currentStock <= i.reorderLevel) {
        allActivities.push({
          id: `${i.id}-stock`,
          type: 'inventory',
          title: 'Low Stock Alert',
          description: `${i.name} needs reordering`,
          timestamp: i.lastUpdated || Date.now(),
          icon: Package,
          color: 'text-warning bg-warning/10'
        })
      }
    })

    return allActivities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }, [data, limit])

  return (
    <Card className="border border-border/50 shadow-sm">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center border border-accent/10">
            <Bell size={22} weight="duotone" className="text-accent" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">Recent Activity</h2>
            <p className="text-xs text-muted-foreground">Live updates from your property</p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            {activities.length} updates
          </Badge>
        </div>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="p-4">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <ClockCounterClockwise size={32} weight="duotone" className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div
                    key={activity.id}
                    className="group relative flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all duration-200"
                  >
                    <div className={`w-10 h-10 rounded-xl ${activity.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                      <Icon size={20} weight="duotone" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold truncate">{activity.title}</p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{activity.description}</p>
                    </div>
                    {index < activities.length - 1 && (
                      <div className="absolute left-8 top-14 w-px h-3 bg-border" />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}
