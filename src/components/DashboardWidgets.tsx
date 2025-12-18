import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Bed,
  Broom,
  ForkKnife,
  CurrencyDollar,
  Basket,
  Carrot,
  Hammer,
  Wrench,
  Users,
  ChartBar,
  TrendUp,
  TrendDown,
  Package,
  SignIn,
  SignOut,
  Heart,
  Star,
  ChartLine,
  ChartPie
} from '@phosphor-icons/react'
import type { DashboardWidget, DashboardMetrics, Reservation, GuestFeedback } from '@/lib/types'
import { formatCurrency, formatPercent, getRoomStatusColor } from '@/lib/helpers'
import { format } from 'date-fns'

interface WidgetRendererProps {
  widget: DashboardWidget
  metrics: DashboardMetrics
  data?: any
  onNavigate?: (module: string) => void
}

export function WidgetRenderer({ widget, metrics, data, onNavigate }: WidgetRendererProps) {
  if (!widget.isVisible) return null

  const renderWidget = () => {
    switch (widget.type) {
      case 'occupancy':
        return (
          <Card className="stat-card h-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-medium text-muted-foreground">Occupancy Rate</h3>
              <div className="icon-badge">
                <Bed size={20} weight="duotone" />
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <p className="text-4xl font-bold tracking-tight">{formatPercent(metrics.occupancy.rate)}</p>
                <div className="progress-bar mt-3">
                  <div 
                    className="progress-bar-fill"
                    style={{ width: `${metrics.occupancy.rate}%` }}
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{metrics.occupancy.occupied}</span> of {metrics.occupancy.occupied + metrics.occupancy.available} rooms occupied
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-success/5 border border-success/10">
                  <p className="text-xs text-muted-foreground mb-1">Available</p>
                  <p className="text-xl font-bold text-success">{metrics.occupancy.available}</p>
                </div>
                <div className="p-3 rounded-xl bg-warning/5 border border-warning/10">
                  <p className="text-xs text-muted-foreground mb-1">Maintenance</p>
                  <p className="text-xl font-bold text-warning">{metrics.occupancy.maintenance}</p>
                </div>
              </div>
            </div>
          </Card>
        )

      case 'revenue-today':
        return (
          <Card className="stat-card h-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-medium text-muted-foreground">Revenue Today</h3>
              <div className="icon-badge-success">
                <CurrencyDollar size={20} weight="duotone" />
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-4xl font-bold tracking-tight">{formatCurrency(metrics.revenue.today)}</p>
              {metrics.revenue.growth !== 0 && (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${metrics.revenue.growth > 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                  {metrics.revenue.growth > 0 ? <TrendUp size={16} weight="bold" /> : <TrendDown size={16} weight="bold" />}
                  {metrics.revenue.growth > 0 ? '+' : ''}{formatPercent(Math.abs(metrics.revenue.growth))} vs yesterday
                </div>
              )}
            </div>
          </Card>
        )

      case 'housekeeping':
        return (
          <Card className="stat-card h-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-medium text-muted-foreground">Housekeeping</h3>
              <div className="icon-badge-accent">
                <Broom size={20} weight="duotone" />
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <p className="text-4xl font-bold tracking-tight">{metrics.housekeeping.pendingTasks}</p>
                <p className="text-sm text-muted-foreground mt-1">Pending tasks</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-success/5 border border-success/10">
                  <p className="text-xs text-muted-foreground mb-1">Clean</p>
                  <p className="text-xl font-bold text-success">{metrics.housekeeping.cleanRooms}</p>
                </div>
                <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/10">
                  <p className="text-xs text-muted-foreground mb-1">Dirty</p>
                  <p className="text-xl font-bold text-destructive">{metrics.housekeeping.dirtyRooms}</p>
                </div>
              </div>
            </div>
          </Card>
        )

      case 'amenities-stock':
        return (
          <Card className="stat-card h-full border-l-4 border-l-destructive">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-medium text-muted-foreground">Amenities Stock</h3>
              <div className="icon-badge-destructive">
                <Basket size={20} weight="duotone" />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-4xl font-bold tracking-tight">{data?.urgentAmenities || 0}</p>
              <p className="text-sm text-muted-foreground">Urgent items requiring attention</p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Low Stock:</span>
                  <span className="ml-2 font-semibold text-warning">{data?.lowStockAmenities || 0}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="ml-2 font-semibold">{data?.totalAmenities || 0}</span>
                </div>
              </div>
            </div>
          </Card>
        )

      case 'food-inventory':
        return (
          <Card className="stat-card h-full border-l-4 border-l-accent">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-medium text-muted-foreground">Food Inventory</h3>
              <div className="icon-badge-accent">
                <Carrot size={20} weight="duotone" />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-4xl font-bold tracking-tight">{data?.urgentFood || 0}</p>
              <p className="text-sm text-muted-foreground">Items need restocking</p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Expiring:</span>
                  <span className="ml-2 font-semibold text-destructive">{data?.expiringFood || 0}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="ml-2 font-semibold">{data?.totalFood || 0}</span>
                </div>
              </div>
            </div>
          </Card>
        )

      case 'maintenance-construction':
        return (
          <Card className="stat-card h-full border-l-4 border-l-primary">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-medium text-muted-foreground">Maintenance</h3>
              <div className="icon-badge">
                <Hammer size={20} weight="duotone" />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-4xl font-bold tracking-tight">{data?.activeProjects || 0}</p>
              <p className="text-sm text-muted-foreground">Active projects</p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Materials:</span>
                  <span className="ml-2 font-semibold">{data?.totalMaterials || 0}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Low Stock:</span>
                  <span className="ml-2 font-semibold text-destructive">{data?.lowStockMaterials || 0}</span>
                </div>
              </div>
            </div>
          </Card>
        )

      case 'fnb-performance':
        return (
          <Card className="stat-card h-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold">F&B Performance</h3>
              <ForkKnife size={20} className="text-muted-foreground" weight="duotone" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-sm text-muted-foreground">Orders Today</span>
                <span className="text-lg font-bold">{metrics.fnb.ordersToday}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-sm text-muted-foreground">F&B Revenue</span>
                <span className="text-lg font-bold">{formatCurrency(metrics.fnb.revenueToday)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-sm text-muted-foreground">Avg Order Value</span>
                <span className="text-lg font-bold">{formatCurrency(metrics.fnb.averageOrderValue)}</span>
              </div>
            </div>
          </Card>
        )

      case 'maintenance-status':
        return (
          <Card className="stat-card h-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold">Maintenance Status</h3>
              <Wrench size={20} className="text-muted-foreground" weight="duotone" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Open Requests</span>
                <span className="text-lg font-bold">{metrics.maintenance.openRequests}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Urgent</span>
                <Badge variant="destructive" className="rounded-lg">{metrics.maintenance.urgent}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Out of Service</span>
                <span className="text-lg font-bold">{metrics.occupancy.maintenance}</span>
              </div>
            </div>
          </Card>
        )

      case 'room-status':
        return (
          <Card className="stat-card h-full">
            <div className="flex items-center justify-between gap-3 mb-5">
              <h3 className="text-base font-semibold">Room Status</h3>
              {onNavigate && (
                <Button size="sm" onClick={() => onNavigate('housekeeping')} variant="outline" className="rounded-xl">
                  View All
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
              {data?.rooms?.slice(0, 12).map((room: any) => (
                <div
                  key={room.id}
                  className={`p-3 rounded-xl border-2 text-center transition-all hover:scale-105 ${getRoomStatusColor(room.status)}`}
                >
                  <div className="font-bold text-lg">{room.roomNumber}</div>
                  <div className="text-xs mt-1 capitalize opacity-80 line-clamp-1">{room.roomType}</div>
                  <div className="text-[10px] mt-1 uppercase tracking-wide opacity-60">{room.status.replace('-', ' ')}</div>
                </div>
              ))}
            </div>
          </Card>
        )

      case 'low-stock':
        return (
          <Card className="stat-card h-full">
            <div className="flex items-center justify-between gap-3 mb-5">
              <h3 className="text-base font-semibold">Low Stock Items</h3>
              {onNavigate && (
                <Button size="sm" onClick={() => onNavigate('inventory')} variant="outline" className="rounded-xl">
                  View Inventory
                </Button>
              )}
            </div>
            {metrics.inventory.lowStockItems === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">All inventory levels are healthy</p>
            ) : (
              <div className="space-y-3">
                {data?.lowStockItems?.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 p-3 bg-muted/30 rounded-xl">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{item.category}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-destructive">{item.currentStock} {item.unit}</p>
                      <p className="text-xs text-muted-foreground">Reorder at {item.reorderLevel}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )

      case 'pending-approvals':
        return (
          <Card className="stat-card h-full border-l-4 border-l-warning">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-medium text-muted-foreground">Pending Approvals</h3>
              <div className="icon-badge-warning">
                <Package size={20} weight="duotone" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-sm">Requisitions</span>
                <Badge className="rounded-lg">{data?.pendingRequisitions || 0}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-sm">Purchase Orders</span>
                <Badge className="rounded-lg">{data?.pendingPOs || 0}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-sm">Invoices</span>
                <Badge className="rounded-lg">{data?.pendingInvoices || 0}</Badge>
              </div>
            </div>
          </Card>
        )

      case 'department-performance':
        return (
          <Card className="stat-card h-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold">Department Performance</h3>
              <ChartBar size={20} className="text-muted-foreground" weight="duotone" />
            </div>
            <div className="space-y-4">
              {data?.departments?.map((dept: any) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{dept.name}</span>
                    <span className="text-muted-foreground font-semibold">{formatPercent(dept.performance)}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${dept.performance}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )

      case 'financial-summary':
        return (
          <Card className="stat-card h-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold">Financial Summary</h3>
              <CurrencyDollar size={20} className="text-muted-foreground" weight="duotone" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-sm text-muted-foreground">Revenue Today</span>
                <span className="text-lg font-bold">{formatCurrency(metrics.revenue.today)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-sm text-muted-foreground">Revenue MTD</span>
                <span className="text-lg font-bold">{formatCurrency(metrics.revenue.month)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-sm text-muted-foreground">Growth</span>
                <div className="flex items-center gap-2">
                  {metrics.revenue.growth >= 0 ? (
                    <TrendUp size={18} className="text-success" weight="bold" />
                  ) : (
                    <TrendDown size={18} className="text-destructive" weight="bold" />
                  )}
                  <span className="text-lg font-bold">{formatPercent(Math.abs(metrics.revenue.growth))}</span>
                </div>
              </div>
            </div>
          </Card>
        )

      case 'arrivals-departures':
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayTimestamp = today.getTime()

        const arrivals = (data?.reservations || []).filter((res: Reservation) => {
          const checkIn = new Date(res.checkInDate)
          checkIn.setHours(0, 0, 0, 0)
          return checkIn.getTime() === todayTimestamp && res.status === 'confirmed'
        })

        const departures = (data?.reservations || []).filter((res: Reservation) => {
          const checkOut = new Date(res.checkOutDate)
          checkOut.setHours(0, 0, 0, 0)
          return checkOut.getTime() === todayTimestamp && res.status === 'checked-in'
        })

        const getGuestName = (guestId: string) => {
          const guest = (data?.guestProfiles || []).find((g: any) => g.id === guestId) || (data?.guests || []).find((g: any) => g.id === guestId)
          return guest ? `${guest.firstName || ''} ${guest.lastName || ''}`.trim() || 'Unknown Guest' : 'Unknown Guest'
        }

        const getRoomNumber = (roomId?: string) => {
          if (!roomId) return 'N/A'
          const room = (data?.rooms || []).find((r: any) => r.id === roomId)
          return room?.roomNumber || 'N/A'
        }

        return (
          <Card className="stat-card h-full">
            <div className="flex items-center justify-between gap-3 mb-5">
              <h3 className="text-base font-semibold">Today's Movement</h3>
              {onNavigate && (
                <Button size="sm" onClick={() => onNavigate('front-office')} variant="outline" className="rounded-xl">
                  View All
                </Button>
              )}
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-success/5 border border-success/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <SignIn size={20} className="text-success" weight="duotone" />
                    <span className="font-semibold">Arrivals</span>
                  </div>
                  <Badge className="bg-success text-success-foreground rounded-lg">{arrivals.length}</Badge>
                </div>
                {arrivals.length > 0 ? (
                  <div className="space-y-2">
                    {arrivals.slice(0, 3).map((res: Reservation) => (
                      <div key={res.id} className="flex items-center justify-between text-sm">
                        <span className="truncate">{getGuestName(res.guestId)}</span>
                        <span className="text-muted-foreground shrink-0 ml-2">Room {getRoomNumber(res.roomId)}</span>
                      </div>
                    ))}
                    {arrivals.length > 3 && (
                      <p className="text-xs text-muted-foreground">+{arrivals.length - 3} more</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No arrivals today</p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <SignOut size={20} className="text-destructive" weight="duotone" />
                    <span className="font-semibold">Departures</span>
                  </div>
                  <Badge className="bg-destructive text-destructive-foreground rounded-lg">{departures.length}</Badge>
                </div>
                {departures.length > 0 ? (
                  <div className="space-y-2">
                    {departures.slice(0, 3).map((res: Reservation) => (
                      <div key={res.id} className="flex items-center justify-between text-sm">
                        <span className="truncate">{getGuestName(res.guestId)}</span>
                        <span className="text-muted-foreground shrink-0 ml-2">Room {getRoomNumber(res.roomId)}</span>
                      </div>
                    ))}
                    {departures.length > 3 && (
                      <p className="text-xs text-muted-foreground">+{departures.length - 3} more</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No departures today</p>
                )}
              </div>
            </div>
          </Card>
        )

      case 'crm-summary':
        const totalGuests = data?.guestProfiles?.length || 0
        const totalFeedback = data?.guestFeedback?.length || 0
        const recentFeedback = (data?.guestFeedback || []).slice(0, 5)
        const avgRating = totalFeedback > 0
          ? (data?.guestFeedback || []).reduce((sum: number, f: GuestFeedback) => sum + f.overallRating, 0) / totalFeedback
          : 0
        const positiveFeedback = (data?.guestFeedback || []).filter((f: GuestFeedback) => f.sentiment === 'positive').length
        const negativeFeedback = (data?.guestFeedback || []).filter((f: GuestFeedback) => f.sentiment === 'negative').length

        return (
          <Card className="stat-card h-full">
            <div className="flex items-center justify-between gap-3 mb-5">
              <h3 className="text-base font-semibold">Guest Relations</h3>
              {onNavigate && (
                <Button size="sm" onClick={() => onNavigate('crm')} variant="outline" className="rounded-xl">
                  View Details
                </Button>
              )}
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={16} className="text-primary" weight="duotone" />
                    <span className="text-xs text-muted-foreground">Total Guests</span>
                  </div>
                  <p className="text-2xl font-bold">{totalGuests}</p>
                </div>
                <div className="p-3 rounded-xl bg-accent/5 border border-accent/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart size={16} className="text-accent" weight="duotone" />
                    <span className="text-xs text-muted-foreground">Feedback</span>
                  </div>
                  <p className="text-2xl font-bold">{totalFeedback}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Average Rating</span>
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" weight="fill" />
                    <span className="font-bold">{avgRating.toFixed(1)}/5</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Positive:</span>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20 rounded-lg">{positiveFeedback}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Negative:</span>
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 rounded-lg">{negativeFeedback}</Badge>
                  </div>
                </div>
              </div>

              {recentFeedback.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Recent Feedback</h4>
                  <div className="space-y-2">
                    {recentFeedback.slice(0, 2).map((feedback: GuestFeedback) => (
                      <div key={feedback.id} className="p-2 rounded-lg bg-muted/30 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium truncate">{feedback.guestName}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <Star size={12} className="text-yellow-500 fill-yellow-500" weight="fill" />
                            <span>{feedback.overallRating}</span>
                          </div>
                        </div>
                        {feedback.comments && (
                          <p className="text-muted-foreground line-clamp-2">{feedback.comments}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )

      case 'revenue-chart':
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (6 - i))
          return {
            date: format(date, 'EEE'),
            revenue: Math.floor(Math.random() * 50000) + 30000
          }
        })

        const maxRevenue = Math.max(...last7Days.map(d => d.revenue))

        return (
          <Card className="stat-card h-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold">Revenue Trend</h3>
              <ChartLine size={20} className="text-muted-foreground" weight="duotone" />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Today</p>
                  <p className="text-lg font-bold">{formatCurrency(metrics.revenue.today)}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Week</p>
                  <p className="text-lg font-bold">{formatCurrency(metrics.revenue.month * 0.25)}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Month</p>
                  <p className="text-lg font-bold">{formatCurrency(metrics.revenue.month)}</p>
                </div>
              </div>

              <div className="space-y-2">
                {last7Days.map((day, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{day.date}</span>
                      <span className="text-muted-foreground">{formatCurrency(day.revenue)}</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )

      case 'occupancy-chart':
        const last7DaysOccupancy = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (6 - i))
          return {
            date: format(date, 'EEE'),
            occupancy: Math.floor(Math.random() * 40) + 60
          }
        })

        return (
          <Card className="stat-card h-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold">Occupancy Trend</h3>
              <ChartPie size={20} className="text-muted-foreground" weight="duotone" />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Today</p>
                  <p className="text-lg font-bold">{formatPercent(metrics.occupancy.rate)}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Week Avg</p>
                  <p className="text-lg font-bold">
                    {formatPercent(last7DaysOccupancy.reduce((sum, d) => sum + d.occupancy, 0) / 7)}
                  </p>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Peak</p>
                  <p className="text-lg font-bold">
                    {formatPercent(Math.max(...last7DaysOccupancy.map(d => d.occupancy)))}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {last7DaysOccupancy.map((day, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{day.date}</span>
                      <span className="text-muted-foreground">{formatPercent(day.occupancy)}</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${day.occupancy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )

      case 'guest-feedback':
        const allFeedback = data?.guestFeedback || []
        const feedbackCount = allFeedback.length
        const averageRating = feedbackCount > 0
          ? allFeedback.reduce((sum: number, f: GuestFeedback) => sum + f.overallRating, 0) / feedbackCount
          : 0
        const positiveCount = allFeedback.filter((f: GuestFeedback) => f.sentiment === 'positive').length
        const neutralCount = allFeedback.filter((f: GuestFeedback) => f.sentiment === 'neutral').length
        const negativeCount = allFeedback.filter((f: GuestFeedback) => f.sentiment === 'negative').length

        return (
          <Card className="stat-card h-full">
            <div className="flex items-center justify-between gap-3 mb-5">
              <h3 className="text-base font-semibold">Guest Feedback</h3>
              {onNavigate && (
                <Button size="sm" onClick={() => onNavigate('crm')} variant="outline" className="rounded-xl">
                  View All
                </Button>
              )}
            </div>
            <div className="space-y-4">
              <div className="text-center p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star size={28} className="text-yellow-500 fill-yellow-500" weight="fill" />
                  <span className="text-4xl font-bold">{averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground text-lg">/5</span>
                </div>
                <p className="text-sm text-muted-foreground">{feedbackCount} reviews</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Positive</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success rounded-full"
                        style={{ width: `${feedbackCount > 0 ? (positiveCount / feedbackCount) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-8 text-right">{positiveCount}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Neutral</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${feedbackCount > 0 ? (neutralCount / feedbackCount) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-8 text-right">{neutralCount}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Negative</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-destructive rounded-full"
                        style={{ width: `${feedbackCount > 0 ? (negativeCount / feedbackCount) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-8 text-right">{negativeCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )

      case 'kitchen-operations':
        return (
          <Card className="stat-card h-full">
            <div className="flex items-center justify-between gap-3 mb-5">
              <h3 className="text-base font-semibold">Kitchen Operations</h3>
              {onNavigate && (
                <Button size="sm" onClick={() => onNavigate('kitchen')} variant="outline" className="rounded-xl">
                  View Details
                </Button>
              )}
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2 mb-1">
                    <ForkKnife size={16} className="text-primary" weight="duotone" />
                    <span className="text-xs text-muted-foreground">Active Recipes</span>
                  </div>
                  <p className="text-2xl font-bold">{data?.activeRecipes || 0}</p>
                </div>
                <div className="p-3 rounded-xl bg-accent/5 border border-accent/10">
                  <div className="flex items-center gap-2 mb-1">
                    <Carrot size={16} className="text-accent" weight="duotone" />
                    <span className="text-xs text-muted-foreground">Consumption Logs</span>
                  </div>
                  <p className="text-2xl font-bold">{data?.consumptionLogs || 0}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <span className="text-sm text-muted-foreground">Food Inventory Alert</span>
                  <Badge variant="destructive" className="rounded-lg">{data?.urgentFood || 0}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <span className="text-sm text-muted-foreground">Waste Tracked</span>
                  <span className="font-semibold">{data?.wasteTracking || 0} items</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <span className="text-sm text-muted-foreground">Kitchen Efficiency</span>
                  <Badge className="bg-success text-success-foreground rounded-lg">92%</Badge>
                </div>
              </div>
            </div>
          </Card>
        )

      case 'channel-performance':
        const channels = [
          { name: 'Direct Booking', revenue: 125000, bookings: 45, color: 'bg-primary' },
          { name: 'Booking.com', revenue: 95000, bookings: 38, color: 'bg-accent' },
          { name: 'Airbnb', revenue: 68000, bookings: 29, color: 'bg-success' },
          { name: 'Expedia', revenue: 52000, bookings: 21, color: 'bg-secondary' }
        ]
        const totalChannelRevenue = channels.reduce((sum, ch) => sum + ch.revenue, 0)

        return (
          <Card className="stat-card h-full">
            <div className="flex items-center justify-between gap-3 mb-5">
              <h3 className="text-base font-semibold">Channel Performance</h3>
              {onNavigate && (
                <Button size="sm" onClick={() => onNavigate('channel-manager')} variant="outline" className="rounded-xl">
                  View Details
                </Button>
              )}
            </div>
            <div className="space-y-4">
              <div className="text-center p-4 rounded-xl bg-muted/30">
                <p className="text-xs text-muted-foreground mb-1">Total Channel Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalChannelRevenue)}</p>
              </div>

              <div className="space-y-3">
                {channels.map((channel, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{channel.name}</span>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(channel.revenue)}</p>
                        <p className="text-xs text-muted-foreground">{channel.bookings} bookings</p>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`${channel.color} h-full rounded-full`}
                        style={{ width: `${(channel.revenue / totalChannelRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )

      default:
        return (
          <Card className="stat-card h-full flex items-center justify-center">
            <p className="text-sm text-muted-foreground">{widget.title} - Coming Soon</p>
          </Card>
        )
    }
  }

  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 md:col-span-2',
    large: 'col-span-1 md:col-span-2 lg:col-span-3',
    full: 'col-span-full'
  }

  return <div className={sizeClasses[widget.size]}>{renderWidget()}</div>
}
