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
  ChartPie,
  ArrowUp,
  ArrowDown,
  CaretUp,
  CaretDown
} from '@phosphor-icons/react'
import type { DashboardWidget, DashboardMetrics, Reservation, GuestFeedback } from '@/lib/types'
import { formatCurrency, formatPercent, getRoomStatusColor, calculateDashboardMetrics } from '@/lib/helpers'
import { PercentageChangeIndicator } from '@/components/PercentageChangeIndicator'
import { format } from 'date-fns'
import type { FilteredDashboardData } from '@/lib/filterHelpers'

interface WidgetRendererProps {
  widget: DashboardWidget
  metrics: DashboardMetrics
  data?: any
  onNavigate?: (module: string) => void
}

interface ComparisonIndicatorProps {
  current: number
  previous: number
  format?: 'currency' | 'percent' | 'number'
  inverse?: boolean
}

function ComparisonIndicator({ current, previous, format = 'number', inverse = false }: ComparisonIndicatorProps) {
  const change = current - previous
  const percentChange = previous !== 0 ? ((change / previous) * 100) : 0
  const isPositive = inverse ? change < 0 : change > 0
  const isNegative = inverse ? change > 0 : change < 0

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(val)
      case 'percent':
        return formatPercent(val)
      default:
        return val.toFixed(0)
    }
  }

  if (change === 0) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>No change</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-success' : isNegative ? 'text-destructive' : 'text-muted-foreground'}`}>
      {isPositive ? <TrendUp size={14} /> : <TrendDown size={14} />}
      <span>{Math.abs(percentChange).toFixed(1)}%</span>
      <span className="text-muted-foreground">
        ({change > 0 ? '+' : ''}{formatValue(change)})
      </span>
    </div>
  )
}

interface ComparisonBarProps {
  current: number
  previous: number
  label: string
  color?: string
}

function ComparisonBar({ current, previous, label, color = 'bg-primary' }: ComparisonBarProps) {
  const max = Math.max(current, previous, 1)
  const currentPercent = (current / max) * 100
  const previousPercent = (previous / max) * 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{formatCurrency(current)}</span>
      </div>
      <div className="space-y-1">
        <div className="relative w-full bg-muted rounded-full h-3">
          <div
            className={`${color} h-3 rounded-full transition-all relative`}
            style={{ width: `${currentPercent}%` }}
          >
            <span className="absolute right-1 top-0 text-[10px] font-medium text-primary-foreground">
              Current
            </span>
          </div>
        </div>
        <div className="relative w-full bg-muted rounded-full h-2 opacity-60">
          <div
            className={`${color} opacity-50 h-2 rounded-full transition-all relative`}
            style={{ width: `${previousPercent}%` }}
          >
            <span className="absolute right-1 top-0 text-[10px] font-medium text-muted-foreground">
              Previous
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function WidgetRenderer({ widget, metrics, data, onNavigate }: WidgetRendererProps) {
  if (!widget.isVisible) return null

  const comparisonData = data?.comparisonData as FilteredDashboardData | undefined
  const hasComparison = !!comparisonData

  const comparisonMetrics = hasComparison
    ? calculateDashboardMetrics(
        comparisonData.rooms,
        comparisonData.reservations,
        comparisonData.housekeepingTasks,
        comparisonData.orders,
        comparisonData.inventory,
        comparisonData.maintenanceRequests
      )
    : null

  const renderWidget = () => {
    switch (widget.type) {
      case 'occupancy':
        return (
          <Card className="p-6 border-l-4 border-l-primary h-full w-full glass-card glow-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Occupancy</h3>
              <Bed size={20} className="text-primary floating-animation" />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-semibold gradient-text">{formatPercent(metrics.occupancy.rate)}</p>
                <div className="flex items-center gap-4 text-sm mt-1">
                  <span className="text-muted-foreground">
                    {metrics.occupancy.occupied} / {metrics.occupancy.occupied + metrics.occupancy.available} rooms
                  </span>
                </div>
              </div>
              
              {hasComparison && comparisonMetrics && (
                <div className="pt-2 border-t">
                  <ComparisonIndicator
                    current={metrics.occupancy.rate}
                    previous={comparisonMetrics.occupancy.rate}
                    format="percent"
                  />
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Previous Period:</span>
                      <span className="font-medium">{formatPercent(comparisonMetrics.occupancy.rate)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="text-xs">
                  <span className="text-muted-foreground">Available:</span>
                  <span className="ml-1 font-medium">{metrics.occupancy.available}</span>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Maintenance:</span>
                  <span className="ml-1 font-medium">{metrics.occupancy.maintenance}</span>
                </div>
              </div>
            </div>
          </Card>
        )

      case 'revenue-today':
        return (
          <Card className="p-6 border-l-4 border-l-success h-full w-full glass-card glow-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Revenue Today</h3>
              <CurrencyDollar size={20} className="text-success floating-animation" />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-semibold gradient-text">{formatCurrency(metrics.revenue.today)}</p>
              </div>
              
              {hasComparison && comparisonMetrics && (
                <div className="pt-2 border-t">
                  <ComparisonIndicator
                    current={metrics.revenue.today}
                    previous={comparisonMetrics.revenue.today}
                    format="currency"
                  />
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Previous Period:</span>
                      <span className="font-medium">{formatCurrency(comparisonMetrics.revenue.today)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )

      case 'housekeeping':
        return (
          <Card className="p-6 border-l-4 border-l-accent h-full w-full glass-card glow-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Housekeeping</h3>
              <Broom size={20} className="text-accent floating-animation" />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-semibold gradient-text">{metrics.housekeeping.pendingTasks}</p>
                <p className="text-sm text-muted-foreground">Pending tasks</p>
              </div>
              
              {hasComparison && comparisonMetrics && (
                <div className="pt-2 border-t">
                  <ComparisonIndicator
                    current={metrics.housekeeping.pendingTasks}
                    previous={comparisonMetrics.housekeeping.pendingTasks}
                    inverse={true}
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="text-xs">
                  <span className="text-muted-foreground">Clean:</span>
                  <span className="ml-1 font-medium text-success">{metrics.housekeeping.cleanRooms}</span>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Dirty:</span>
                  <span className="ml-1 font-medium text-destructive">{metrics.housekeeping.dirtyRooms}</span>
                </div>
              </div>
            </div>
          </Card>
        )

      case 'amenities-stock':
        return (
          <Card className="p-6 border-l-4 border-l-destructive h-full w-full">
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
          <Card className="p-6 border-l-4 border-l-accent h-full w-full">
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
          <Card className="p-6 border-l-4 border-l-primary h-full w-full">
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
          <Card className="p-6 h-full w-full">
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
          <Card className="p-6 h-full w-full">
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
          <Card className="p-6 h-full w-full">
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
          <Card className="p-6 h-full w-full">
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
          <Card className="p-6 border-l-4 border-l-warning h-full w-full">
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
          <Card className="p-6 h-full w-full">
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
          <Card className="p-6 h-full w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Financial Summary</h3>
              <CurrencyDollar size={18} className="text-muted-foreground" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Revenue Today</span>
                <div className="text-right">
                  <span className="text-lg font-semibold">{formatCurrency(metrics.revenue.today)}</span>
                  {hasComparison && comparisonMetrics && (
                    <ComparisonIndicator
                      current={metrics.revenue.today}
                      previous={comparisonMetrics.revenue.today}
                      format="currency"
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Revenue MTD</span>
                <div className="text-right">
                  <span className="text-lg font-semibold">{formatCurrency(metrics.revenue.month)}</span>
                  {hasComparison && comparisonMetrics && (
                    <ComparisonIndicator
                      current={metrics.revenue.month}
                      previous={comparisonMetrics.revenue.month}
                      format="currency"
                    />
                  )}
                </div>
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

      case 'arrivals-departures': {
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
          <Card className="p-6 h-full w-full">
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
      }

      case 'crm-summary': {
        const totalGuests = data?.guestProfiles?.length || 0
        const totalFeedback = data?.guestFeedback?.length || 0
        const recentFeedback = (data?.guestFeedback || []).slice(0, 5)
        const avgRating = totalFeedback > 0
          ? (data?.guestFeedback || []).reduce((sum: number, f: GuestFeedback) => sum + f.overallRating, 0) / totalFeedback
          : 0
        const positiveFeedback = (data?.guestFeedback || []).filter((f: GuestFeedback) => f.sentiment === 'positive').length
        const negativeFeedback = (data?.guestFeedback || []).filter((f: GuestFeedback) => f.sentiment === 'negative').length

        return (
          <Card className="p-6 h-full w-full">
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
      }

      case 'revenue-chart': {
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
          <Card className="p-6 h-full w-full">
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
      }

      case 'occupancy-chart': {
        const last7DaysOccupancy = Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (6 - i))
          return {
            date: format(date, 'EEE'),
            occupancy: Math.floor(Math.random() * 40) + 60
          }
        })

        return (
          <Card className="p-6 h-full w-full">
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
      }

      case 'guest-feedback': {
        const allFeedback = data?.guestFeedback || []
        const feedbackCount = allFeedback.length
        const averageRating = feedbackCount > 0
          ? allFeedback.reduce((sum: number, f: GuestFeedback) => sum + f.overallRating, 0) / feedbackCount
          : 0
        const positiveCount = allFeedback.filter((f: GuestFeedback) => f.sentiment === 'positive').length
        const neutralCount = allFeedback.filter((f: GuestFeedback) => f.sentiment === 'neutral').length
        const negativeCount = allFeedback.filter((f: GuestFeedback) => f.sentiment === 'negative').length

        return (
          <Card className="p-6 h-full w-full">
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
      }

      case 'kitchen-operations':
        return (
          <Card className="p-6 h-full w-full">
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

      case 'channel-performance': {
        const channels = [
          { name: 'Direct Booking', revenue: 125000, bookings: 45, color: 'bg-primary' },
          { name: 'Booking.com', revenue: 95000, bookings: 38, color: 'bg-accent' },
          { name: 'Airbnb', revenue: 68000, bookings: 29, color: 'bg-success' },
          { name: 'Expedia', revenue: 52000, bookings: 21, color: 'bg-secondary' }
        ]
        const totalChannelRevenue = channels.reduce((sum, ch) => sum + ch.revenue, 0)

        return (
          <Card className="p-6 h-full w-full">
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
      }

      case 'period-comparison': {
        if (!hasComparison || !comparisonMetrics) {
          return (
            <Card className="p-6 h-full w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold">Period Comparison</h3>
                <ChartBar size={18} className="text-muted-foreground" />
              </div>
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  Enable comparison mode in filters to view period-over-period metrics
                </p>
              </div>
            </Card>
          )
        }

        const currentRevenue = metrics.revenue.today
        const previousRevenue = comparisonMetrics.revenue.today
        const currentOrders = metrics.fnb.ordersToday
        const previousOrders = comparisonMetrics.fnb.ordersToday
        const currentOccupancy = metrics.occupancy.rate
        const previousOccupancy = comparisonMetrics.occupancy.rate
        const currentTasks = metrics.housekeeping.pendingTasks
        const previousTasks = comparisonMetrics.housekeeping.pendingTasks

        return (
          <Card className="p-6 h-full w-full">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-semibold">Period Comparison</h3>
              <ChartBar size={18} className="text-muted-foreground" />
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center gap-2 mb-1">
                    <CaretUp size={16} className="text-success" weight="fill" />
                    <span className="text-xs text-muted-foreground">Current Period</span>
                  </div>
                  <p className="text-2xl font-semibold">{formatCurrency(currentRevenue)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Revenue</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-muted">
                  <div className="flex items-center gap-2 mb-1">
                    <CaretDown size={16} className="text-muted-foreground" weight="fill" />
                    <span className="text-xs text-muted-foreground">Previous Period</span>
                  </div>
                  <p className="text-2xl font-semibold text-muted-foreground">{formatCurrency(previousRevenue)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Revenue</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <ComparisonBar
                  current={currentRevenue}
                  previous={previousRevenue}
                  label="Revenue"
                  color="bg-success"
                />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">F&B Orders</span>
                    <span className="text-muted-foreground">{currentOrders}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="relative w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-accent h-3 rounded-full transition-all"
                        style={{ width: `${Math.min((currentOrders / Math.max(currentOrders, previousOrders, 1)) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Previous: {previousOrders}</span>
                      <ComparisonIndicator
                        current={currentOrders}
                        previous={previousOrders}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Occupancy Rate</span>
                    <span className="text-muted-foreground">{formatPercent(currentOccupancy)}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="relative w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-primary h-3 rounded-full transition-all"
                        style={{ width: `${currentOccupancy}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Previous: {formatPercent(previousOccupancy)}</span>
                      <ComparisonIndicator
                        current={currentOccupancy}
                        previous={previousOccupancy}
                        format="percent"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Pending Tasks</span>
                    <span className="text-muted-foreground">{currentTasks}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="relative w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-destructive h-3 rounded-full transition-all"
                        style={{ width: `${Math.min((currentTasks / Math.max(currentTasks, previousTasks, 1)) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Previous: {previousTasks}</span>
                      <ComparisonIndicator
                        current={currentTasks}
                        previous={previousTasks}
                        inverse={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )
      }

      case 'goal-tracking': {
        const goals = [
          { 
            name: 'Occupancy Target', 
            current: metrics.occupancy.rate, 
            target: 85, 
            color: 'text-accent',
            bgColor: 'bg-accent'
          },
          { 
            name: 'Revenue Target', 
            current: (metrics.revenue.today / 100000) * 100, 
            target: 100, 
            color: 'text-primary',
            bgColor: 'bg-primary'
          },
          { 
            name: 'Guest Satisfaction', 
            current: 85, // Default value - guest satisfaction data not in current metrics
            target: 90, 
            color: 'text-success',
            bgColor: 'bg-success'
          },
          { 
            name: 'Cost Control', 
            current: Math.min(((metrics.revenue.today - (metrics.revenue.today * 0.25)) / metrics.revenue.today) * 100, 100), 
            target: 80, 
            color: 'text-warning',
            bgColor: 'bg-warning'
          }
        ]

        return (
          <Card className="p-6 h-full w-full">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-semibold">Goal Progress</h3>
              <TrendUp size={18} className="text-muted-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {goals.map((goal, index) => {
                const percentage = Math.min((goal.current / goal.target) * 100, 100)
                const achieved = goal.current >= goal.target
                
                return (
                  <div key={index} className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/30">
                    <div className="relative w-20 h-20 mb-3">
                      <svg className="transform -rotate-90 w-20 h-20">
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          className="text-muted"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 32}`}
                          strokeDashoffset={`${2 * Math.PI * 32 * (1 - percentage / 100)}`}
                          className={goal.color}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-lg font-bold ${goal.color}`}>
                          {Math.round(percentage)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-center mb-1">{goal.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {goal.current.toFixed(0)} / {goal.target}
                      {achieved && <span className="ml-1 text-success">✓</span>}
                    </p>
                  </div>
                )
              })}
            </div>
          </Card>
        )
      }

      case 'quick-actions': {
        const quickActions = [
          { label: 'New Reservation', icon: Bed, action: () => onNavigate?.('frontoffice') },
          { label: 'New Guest', icon: Users, action: () => onNavigate?.('frontoffice') },
          { label: 'Purchase Order', icon: Package, action: () => onNavigate?.('procurement') },
          { label: 'Create Invoice', icon: CurrencyDollar, action: () => onNavigate?.('finance') },
          { label: 'New Requisition', icon: ChartBar, action: () => onNavigate?.('procurement') },
          { label: 'Log Feedback', icon: Heart, action: () => onNavigate?.('crm') }
        ]

        return (
          <Card className="p-6 h-full w-full">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-semibold">Quick Actions</h3>
              <Package size={18} className="text-muted-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-primary/10 hover:border-primary transition-all"
                  onClick={action.action}
                >
                  <action.icon size={20} />
                  <span className="text-xs font-medium text-center">{action.label}</span>
                </Button>
              ))}
            </div>
          </Card>
        )
      }

      case 'team-performance': {
        const topPerformers = [
          { name: 'Sarah Johnson', role: 'Front Desk', score: 98, tasks: 45 },
          { name: 'Mike Chen', role: 'Housekeeping', score: 95, tasks: 52 },
          { name: 'Emma Davis', role: 'F&B', score: 92, tasks: 38 },
          { name: 'James Wilson', role: 'Kitchen', score: 90, tasks: 41 }
        ]

        return (
          <Card className="p-6 h-full w-full">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-semibold">Top Performers</h3>
              <Star size={18} className="text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm shrink-0">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{performer.name}</p>
                    <p className="text-xs text-muted-foreground">{performer.role}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-success">{performer.score}%</p>
                    <p className="text-xs text-muted-foreground">{performer.tasks} tasks</p>
                  </div>
                </div>
              ))}
            </div>
            {onNavigate && (
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-4"
                onClick={() => onNavigate('hr')}
              >
                View All Staff
              </Button>
            )}
          </Card>
        )
      }

      case 'channel-sync-status': {
        const syncStatuses = [
          { channel: 'Booking.com', status: 'synced', lastSync: '2 mins ago', color: 'text-success' },
          { channel: 'Agoda', status: 'syncing', lastSync: 'In progress', color: 'text-warning' },
          { channel: 'Airbnb', status: 'synced', lastSync: '5 mins ago', color: 'text-success' },
          { channel: 'Expedia', status: 'error', lastSync: '1 hour ago', color: 'text-destructive' }
        ]

        return (
          <Card className="p-6 h-full w-full">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-semibold">Channel Sync Status</h3>
              {onNavigate && (
                <Button size="sm" onClick={() => onNavigate('channel-manager')} variant="outline">
                  Manage
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {syncStatuses.map((sync, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${sync.status === 'synced' ? 'bg-success' : sync.status === 'syncing' ? 'bg-warning animate-pulse' : 'bg-destructive'}`} />
                    <div>
                      <p className="font-medium text-sm">{sync.channel}</p>
                      <p className="text-xs text-muted-foreground">{sync.lastSync}</p>
                    </div>
                  </div>
                  <Badge variant={sync.status === 'synced' ? 'default' : sync.status === 'syncing' ? 'secondary' : 'destructive'}>
                    {sync.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )
      }

      case 'ota-comparison': {
        const otaMetrics = [
          { name: 'Booking.com', bookings: 38, adr: 2500, rating: 8.5 },
          { name: 'Agoda', bookings: 32, adr: 2350, rating: 8.2 },
          { name: 'Airbnb', bookings: 29, adr: 2800, rating: 4.7 },
          { name: 'Expedia', bookings: 21, adr: 2400, rating: 8.0 }
        ]

        return (
          <Card className="p-6 h-full w-full">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-semibold">OTA Comparison</h3>
              {onNavigate && (
                <Button size="sm" onClick={() => onNavigate('channel-manager')} variant="outline">
                  Details
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {otaMetrics.map((ota, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{ota.name}</span>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-medium">{ota.rating}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-muted-foreground">Bookings</p>
                      <p className="font-semibold">{ota.bookings}</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-muted-foreground">ADR</p>
                      <p className="font-semibold">{formatCurrency(ota.adr)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )
      }

      case 'booking-source': {
        const bookingSources = [
          { source: 'Booking.com', count: 38, percentage: 35 },
          { source: 'Agoda', count: 32, percentage: 30 },
          { source: 'Airbnb', count: 29, percentage: 27 },
          { source: 'Direct', count: 8, percentage: 8 }
        ]
        const totalBookings = bookingSources.reduce((sum, s) => sum + s.count, 0)

        return (
          <Card className="p-6 h-full w-full">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-semibold">Booking Source</h3>
              <div className="text-right">
                <p className="text-2xl font-semibold">{totalBookings}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
            <div className="space-y-3">
              {bookingSources.map((source, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{source.source}</span>
                    <span className="text-muted-foreground">{source.count} ({source.percentage}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )
      }

      case 'channel-revenue': {
        const channelRevenues = [
          { channel: 'Booking.com', today: 15000, month: 450000, trend: 'up' },
          { channel: 'Agoda', today: 12000, month: 360000, trend: 'up' },
          { channel: 'Airbnb', today: 18000, month: 540000, trend: 'down' },
          { channel: 'Direct', today: 8000, month: 240000, trend: 'up' }
        ]
        const totalToday = channelRevenues.reduce((sum, c) => sum + c.today, 0)
        const totalMonth = channelRevenues.reduce((sum, c) => sum + c.month, 0)

        return (
          <Card className="p-6 h-full w-full">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-semibold">Channel Revenue</h3>
              {onNavigate && (
                <Button size="sm" onClick={() => onNavigate('channel-manager')} variant="outline">
                  View All
                </Button>
              )}
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Today</p>
                  <p className="text-xl font-semibold">{formatCurrency(totalToday)}</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-xs text-muted-foreground mb-1">This Month</p>
                  <p className="text-xl font-semibold">{formatCurrency(totalMonth)}</p>
                </div>
              </div>
              <div className="space-y-2">
                {channelRevenues.map((rev, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{rev.channel}</span>
                      {rev.trend === 'up' ? (
                        <TrendUp size={14} className="text-success" />
                      ) : (
                        <TrendDown size={14} className="text-destructive" />
                      )}
                    </div>
                    <span className="font-semibold">{formatCurrency(rev.today)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )
      }

      default:
        return (
          <Card className="p-6 h-full w-full">
            <p className="text-sm text-muted-foreground text-center">{widget.title} - Coming Soon</p>
          </Card>
        )
    }
  }

  return <div className="w-full h-full">{renderWidget()}</div>
}
