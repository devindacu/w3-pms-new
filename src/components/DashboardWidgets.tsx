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
  Package
} from '@phosphor-icons/react'
import type { DashboardWidget, DashboardMetrics } from '@/lib/types'
import { formatCurrency, formatPercent, getRoomStatusColor } from '@/lib/helpers'
import { PercentageChangeIndicator } from '@/components/PercentageChangeIndicator'

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
          <Card className="p-6 border-l-4 border-l-primary h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Occupancy</h3>
              <Bed size={20} className="text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-semibold">{formatPercent(metrics.occupancy.rate)}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  {metrics.occupancy.occupied} / {metrics.occupancy.occupied + metrics.occupancy.available} rooms
                </span>
              </div>
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
          <Card className="p-6 border-l-4 border-l-success h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Revenue Today</h3>
              <CurrencyDollar size={20} className="text-success" />
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-3xl font-semibold">{formatCurrency(metrics.revenue.today)}</p>
              </div>
            </div>
          </Card>
        )

      case 'housekeeping':
        return (
          <Card className="p-6 border-l-4 border-l-accent h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Housekeeping</h3>
              <Broom size={20} className="text-accent" />
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-semibold">{metrics.housekeeping.pendingTasks}</p>
              <p className="text-sm text-muted-foreground">Pending tasks</p>
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
