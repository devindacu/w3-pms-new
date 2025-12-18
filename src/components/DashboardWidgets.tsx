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
import { PercentageChangeIndicator } from '@/components/PercentageChangeIndicator'
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Occupancy</h3>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bed size={20} className="text-primary" weight="duotone" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-bold">{formatPercent(metrics.occupancy.rate)}</p>
                <div className="progress-bar mt-2">
                  <div 
                    className="progress-bar-fill"
                    style={{ width: `${metrics.occupancy.rate}%` }}
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{metrics.occupancy.occupied}</span> / {metrics.occupancy.occupied + metrics.occupancy.available} rooms
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-success/10">
                  <p className="text-xs text-muted-foreground">Available</p>
                  <p className="text-lg font-semibold text-success">{metrics.occupancy.available}</p>
                </div>
                <div className="p-3 rounded-xl bg-warning/10">
                  <p className="text-xs text-muted-foreground">Maintenance</p>
                  <p className="text-lg font-semibold text-warning">{metrics.occupancy.maintenance}</p>
                </div>
              </div>
            </div>
          </Card>
        )

      case 'revenue-today':
        return (
          <Card className="stat-card h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Revenue Today</h3>
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <CurrencyDollar size={20} className="text-success" weight="duotone" />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-3xl font-bold">{formatCurrency(metrics.revenue.today)}</p>
              {metrics.revenue.growth !== 0 && (
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${metrics.revenue.growth > 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Housekeeping</h3>
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Broom size={20} className="text-accent" weight="duotone" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-bold">{metrics.housekeeping.pendingTasks}</p>
                <p className="text-sm text-muted-foreground">Pending tasks</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-success/10">
                  <p className="text-xs text-muted-foreground">Clean</p>
                  <p className="text-lg font-semibold text-success">{metrics.housekeeping.cleanRooms}</p>
                </div>
                <div className="p-3 rounded-xl bg-destructive/10">
                  <p className="text-xs text-muted-foreground">Dirty</p>
                  <p className="text-lg font-semibold text-destructive">{metrics.housekeeping.dirtyRooms}</p>
                </div>
              </div>
            </div>
          </Card>
        )

      case 'amenities-stock':
        return (
          <Card className="p-6 border-l-4 border-l-destructive h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Amenities Stock</h3>
              <Basket size={20} className="text-destructive" />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-semibold">{data?.urgentAmenities || 0}</p>
              <p className="text-sm text-muted-foreground">Urgent items</p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="text-xs">
                  <span className="text-muted-foreground">Low Stock:</span>
                  <span className="ml-1 font-medium text-accent">{data?.lowStockAmenities || 0}</span>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="ml-1 font-medium">{data?.totalAmenities || 0}</span>
                </div>
              </div>
            </div>
          </Card>
        )

      case 'food-inventory':
        return (
          <Card className="p-6 border-l-4 border-l-accent h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Food Inventory</h3>
              <Carrot size={20} className="text-accent" />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-semibold">{data?.urgentFood || 0}</p>
              <p className="text-sm text-muted-foreground">Urgent items</p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="text-xs">
                  <span className="text-muted-foreground">Expiring:</span>
                  <span className="ml-1 font-medium text-destructive">{data?.expiringFood || 0}</span>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="ml-1 font-medium">{data?.totalFood || 0}</span>
                </div>
              </div>
            </div>
          </Card>
        )

      case 'maintenance-construction':
        return (
          <Card className="p-6 border-l-4 border-l-primary h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Maintenance & Construction</h3>
              <Hammer size={20} className="text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-semibold">{data?.activeProjects || 0}</p>
              <p className="text-sm text-muted-foreground">Active projects</p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="text-xs">
                  <span className="text-muted-foreground">Materials:</span>
                  <span className="ml-1 font-medium">{data?.totalMaterials || 0}</span>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Low Stock:</span>
                  <span className="ml-1 font-medium text-destructive">{data?.lowStockMaterials || 0}</span>
                </div>
              </div>
            </div>
          </Card>
        )

      case 'fnb-performance':
        return (
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">F&B Performance</h3>
              <ForkKnife size={18} className="text-muted-foreground" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">Orders Today</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{metrics.fnb.ordersToday}</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">F&B Revenue</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{formatCurrency(metrics.fnb.revenueToday)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted-foreground">Avg Order Value</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{formatCurrency(metrics.fnb.averageOrderValue)}</span>
                </div>
              </div>
            </div>
          </Card>
        )

      case 'maintenance-status':
        return (
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Maintenance Status</h3>
              <Wrench size={18} className="text-muted-foreground" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Open Requests</span>
                <span className="text-lg font-semibold">{metrics.maintenance.openRequests}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Urgent</span>
                <Badge variant="destructive">{metrics.maintenance.urgent}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rooms Out of Service</span>
                <span className="text-lg font-semibold">{metrics.occupancy.maintenance}</span>
              </div>
            </div>
          </Card>
        )

      case 'room-status':
        return (
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-semibold">Room Status Overview</h3>
              {onNavigate && (
                <Button size="sm" onClick={() => onNavigate('housekeeping')} variant="outline">
                  View All
                </Button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
              {data?.rooms?.slice(0, 12).map((room: any) => (
                <div
                  key={room.id}
                  className={`p-2 md:p-3 rounded-lg border-2 text-center ${getRoomStatusColor(room.status)}`}
                >
                  <div className="font-semibold text-base md:text-lg">{room.roomNumber}</div>
                  <div className="text-xs mt-1 capitalize line-clamp-1">{room.roomType}</div>
                  <div className="text-xs mt-1 opacity-80 line-clamp-1">{room.status.replace('-', ' ')}</div>
                </div>
              ))}
            </div>
          </Card>
        )

      case 'low-stock':
        return (
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-semibold">Low Stock Items</h3>
              {onNavigate && (
                <Button size="sm" onClick={() => onNavigate('inventory')} variant="outline">
                  View Inventory
                </Button>
              )}
            </div>
            {metrics.inventory.lowStockItems === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">All inventory levels are healthy</p>
            ) : (
              <div className="space-y-3">
                {data?.lowStockItems?.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{item.category}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-destructive">{item.currentStock} {item.unit}</p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">Reorder at {item.reorderLevel}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )

      case 'pending-approvals':
        return (
          <Card className="p-6 border-l-4 border-l-warning h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Pending Approvals</h3>
              <Package size={20} className="text-warning" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Requisitions</span>
                <Badge>{data?.pendingRequisitions || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Purchase Orders</span>
                <Badge>{data?.pendingPOs || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Invoices</span>
                <Badge>{data?.pendingInvoices || 0}</Badge>
              </div>
            </div>
          </Card>
        )

      case 'department-performance':
        return (
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Department Performance</h3>
              <ChartBar size={18} className="text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {data?.departments?.map((dept: any) => (
                <div key={dept.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{dept.name}</span>
                    <span className="text-muted-foreground">{formatPercent(dept.performance)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
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
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Financial Summary</h3>
              <CurrencyDollar size={18} className="text-muted-foreground" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Revenue Today</span>
                <span className="text-lg font-semibold">{formatCurrency(metrics.revenue.today)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Revenue MTD</span>
                <span className="text-lg font-semibold">{formatCurrency(metrics.revenue.month)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Growth</span>
                <div className="flex items-center gap-1">
                  {metrics.revenue.growth >= 0 ? (
                    <TrendUp size={16} className="text-success" />
                  ) : (
                    <TrendDown size={16} className="text-destructive" />
                  )}
                  <span className="text-lg font-semibold">{formatPercent(Math.abs(metrics.revenue.growth))}</span>
                </div>
              </div>
            </div>
          </Card>
        )

      case 'arrivals-departures':
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayTimestamp = today.getTime()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const tomorrowTimestamp = tomorrow.getTime()

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
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-semibold">Today's Arrivals & Departures</h3>
              {onNavigate && (
                <Button size="sm" onClick={() => onNavigate('front-office')} variant="outline">
                  View All
                </Button>
              )}
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border-l-4 border-l-success bg-success/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <SignIn size={20} className="text-success" />
                    <span className="font-medium">Arrivals</span>
                  </div>
                  <Badge className="bg-success text-success-foreground">{arrivals.length}</Badge>
                </div>
                {arrivals.length > 0 ? (
                  <div className="space-y-2 mt-3">
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

              <div className="p-4 rounded-lg border-l-4 border-l-destructive bg-destructive/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <SignOut size={20} className="text-destructive" />
                    <span className="font-medium">Departures</span>
                  </div>
                  <Badge className="bg-destructive text-destructive-foreground">{departures.length}</Badge>
                </div>
                {departures.length > 0 ? (
                  <div className="space-y-2 mt-3">
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
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-semibold">CRM & Guest Relations</h3>
              {onNavigate && (
                <Button size="sm" onClick={() => onNavigate('crm')} variant="outline">
                  View Details
                </Button>
              )}
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={16} className="text-primary" />
                    <span className="text-xs text-muted-foreground">Total Guests</span>
                  </div>
                  <p className="text-2xl font-semibold">{totalGuests}</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart size={16} className="text-accent" />
                    <span className="text-xs text-muted-foreground">Feedback</span>
                  </div>
                  <p className="text-2xl font-semibold">{totalFeedback}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Average Rating</span>
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{avgRating.toFixed(1)}/5</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Positive:</span>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">{positiveFeedback}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Negative:</span>
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">{negativeFeedback}</Badge>
                  </div>
                </div>
              </div>

              {recentFeedback.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase">Recent Feedback</h4>
                  <div className="space-y-2">
                    {recentFeedback.slice(0, 2).map((feedback: GuestFeedback) => (
                      <div key={feedback.id} className="p-2 rounded bg-muted/30 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium truncate">{feedback.guestName}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <Star size={12} className="text-yellow-500 fill-yellow-500" />
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
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Revenue Trend (Last 7 Days)</h3>
              <ChartLine size={18} className="text-muted-foreground" />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Today</p>
                  <p className="text-lg font-semibold">{formatCurrency(metrics.revenue.today)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">This Week</p>
                  <p className="text-lg font-semibold">{formatCurrency(metrics.revenue.month * 0.25)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">This Month</p>
                  <p className="text-lg font-semibold">{formatCurrency(metrics.revenue.month)}</p>
                </div>
              </div>

              <div className="space-y-2">
                {last7Days.map((day, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{day.date}</span>
                      <span className="text-muted-foreground">{formatCurrency(day.revenue)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
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
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Occupancy Trend (Last 7 Days)</h3>
              <ChartPie size={18} className="text-muted-foreground" />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Today</p>
                  <p className="text-lg font-semibold">{formatPercent(metrics.occupancy.rate)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Week Avg</p>
                  <p className="text-lg font-semibold">
                    {formatPercent(last7DaysOccupancy.reduce((sum, d) => sum + d.occupancy, 0) / 7)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Peak</p>
                  <p className="text-lg font-semibold">
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
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full transition-all"
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
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-semibold">Guest Feedback</h3>
              {onNavigate && (
                <Button size="sm" onClick={() => onNavigate('crm')} variant="outline">
                  View All
                </Button>
              )}
            </div>
            <div className="space-y-4">
              <div className="text-center p-4 rounded-lg bg-primary/5">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star size={24} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-3xl font-semibold">{averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">/5</span>
                </div>
                <p className="text-sm text-muted-foreground">{feedbackCount} reviews</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Positive</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div
                        className="bg-success h-2 rounded-full"
                        style={{ width: `${feedbackCount > 0 ? (positiveCount / feedbackCount) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{positiveCount}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Neutral</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full"
                        style={{ width: `${feedbackCount > 0 ? (neutralCount / feedbackCount) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{neutralCount}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Negative</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2">
                      <div
                        className="bg-destructive h-2 rounded-full"
                        style={{ width: `${feedbackCount > 0 ? (negativeCount / feedbackCount) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{negativeCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )

      case 'kitchen-operations':
        return (
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-semibold">Kitchen Operations</h3>
              {onNavigate && (
                <Button size="sm" onClick={() => onNavigate('kitchen')} variant="outline">
                  View Details
                </Button>
              )}
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2 mb-1">
                    <ForkKnife size={16} className="text-primary" />
                    <span className="text-xs text-muted-foreground">Active Recipes</span>
                  </div>
                  <p className="text-2xl font-semibold">{data?.activeRecipes || 0}</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Carrot size={16} className="text-accent" />
                    <span className="text-xs text-muted-foreground">Consumption Logs</span>
                  </div>
                  <p className="text-2xl font-semibold">{data?.consumptionLogs || 0}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Food Inventory Alert</span>
                  <Badge variant="destructive">{data?.urgentFood || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Waste Tracked</span>
                  <span className="font-medium">{data?.wasteTracking || 0} items</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Kitchen Efficiency</span>
                  <Badge className="bg-success text-success-foreground">92%</Badge>
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
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-semibold">Channel Performance</h3>
              {onNavigate && (
                <Button size="sm" onClick={() => onNavigate('channel-manager')} variant="outline">
                  View Details
                </Button>
              )}
            </div>
            <div className="space-y-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Total Channel Revenue</p>
                <p className="text-2xl font-semibold">{formatCurrency(totalChannelRevenue)}</p>
              </div>

              <div className="space-y-3">
                {channels.map((channel, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{channel.name}</span>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(channel.revenue)}</p>
                        <p className="text-xs text-muted-foreground">{channel.bookings} bookings</p>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`${channel.color} h-2 rounded-full transition-all`}
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
          <Card className="p-6 h-full">
            <p className="text-sm text-muted-foreground text-center">{widget.title} - Coming Soon</p>
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
