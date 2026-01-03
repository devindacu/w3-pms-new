import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Bed,
  Broom,
  ForkKnife,
  CurrencyDollar,
  ChartBar,
  TrendUp,
  TrendDown,
  Users,
  CalendarCheck,
  SignOut,
  Receipt,
  Package
} from '@phosphor-icons/react'
import type { DashboardWidget, DashboardMetrics } from '@/lib/types'
import { formatCurrency, formatPercent } from '@/lib/helpers'

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
          <Card className="p-5 hover:shadow-md transition-shadow border-l-4 border-l-primary">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Occupancy</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold">{formatPercent(metrics.occupancy.rate)}</h3>
                  <span className="text-sm text-muted-foreground">
                    {metrics.occupancy.occupied} / {metrics.occupancy.occupied + metrics.occupancy.available} rooms
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bed size={20} className="text-primary" />
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Available:</span>
                <span className="ml-1 font-semibold">{metrics.occupancy.available}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Maintenance:</span>
                <span className="ml-1 font-semibold">{metrics.occupancy.maintenance}</span>
              </div>
            </div>
          </Card>
        )

      case 'revenue-today':
        return (
          <Card className="p-5 hover:shadow-md transition-shadow border-l-4 border-l-success">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Revenue Today</p>
                <h3 className="text-3xl font-bold">{formatCurrency(0)}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CurrencyDollar size={20} className="text-success" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Revenue MTD</span>
              <span className="ml-auto font-semibold">{formatCurrency(0)}</span>
            </div>
          </Card>
        )

      case 'financial-summary':
        return (
          <Card className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Financial Summary</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <CurrencyDollar size={20} className="text-accent" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Revenue Today</span>
                <span className="font-semibold">{formatCurrency(0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Revenue MTD</span>
                <span className="font-semibold">{formatCurrency(0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Growth</span>
                <span className="font-semibold text-success flex items-center gap-1">
                  <TrendUp size={14} />
                  0%
                </span>
              </div>
            </div>
          </Card>
        )

      case 'department-performance':
        return (
          <Card className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Department Performance</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ChartBar size={20} className="text-primary" />
              </div>
            </div>
            <div className="space-y-3">
              {(data?.departments || []).map((dept: any) => (
                <div key={dept.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{dept.name}</span>
                    <span className="text-xs font-semibold">{dept.performance}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${dept.performance}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )

      case 'pending-approvals':
        return (
          <Card className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Approvals</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Receipt size={20} className="text-warning" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-sm">Requisitions</span>
                <Badge variant="secondary" className="rounded-full">
                  {data?.pendingRequisitions || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-sm">Purchase Orders</span>
                <Badge variant="secondary" className="rounded-full">
                  {data?.pendingPOs || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-sm">Invoices</span>
                <Badge variant="secondary" className="rounded-full">
                  {data?.pendingInvoices || 0}
                </Badge>
              </div>
            </div>
          </Card>
        )

      case 'housekeeping':
        return (
          <Card className="p-5 hover:shadow-md transition-shadow border-l-4 border-l-secondary">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Housekeeping</p>
                <h3 className="text-3xl font-bold">{metrics.housekeeping.pendingTasks}</h3>
                <p className="text-xs text-muted-foreground mt-1">Pending tasks</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Broom size={20} className="text-secondary" />
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Clean:</span>
                <span className="ml-1 font-semibold">{metrics.housekeeping.cleanRooms}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Dirty:</span>
                <span className="ml-1 font-semibold">{metrics.housekeeping.dirtyRooms}</span>
              </div>
            </div>
          </Card>
        )

      case 'room-status':
        return (
          <Card className="p-5 hover:shadow-md transition-shadow col-span-full">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Room Status Overview</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate?.('front-office')}>
                View All
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {(data?.rooms || []).slice(0, 6).map((room: any) => (
                <div 
                  key={room.id}
                  className={`p-4 rounded-lg text-center ${
                    room.status === 'occupied' ? 'bg-primary text-primary-foreground' :
                    room.status === 'available' ? 'bg-success/10 text-success' :
                    room.status === 'maintenance' ? 'bg-warning/10 text-warning' :
                    'bg-muted text-muted-foreground'
                  }`}
                >
                  <p className="text-sm font-semibold">{room.roomNumber}</p>
                  <p className="text-xs mt-1 opacity-80 capitalize">{room.status}</p>
                </div>
              ))}
            </div>
          </Card>
        )

      case 'crm-summary':
        return (
          <Card className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">CRM & Guest Relations</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate?.('crm')}>
                View Details
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-primary/5">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users size={16} className="text-primary" />
                  <p className="text-sm text-muted-foreground">Total Guests</p>
                </div>
                <p className="text-2xl font-bold">{(data?.guestProfiles || []).length}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-accent/5">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Receipt size={16} className="text-accent" />
                  <p className="text-sm text-muted-foreground">Feedback</p>
                </div>
                <p className="text-2xl font-bold">{(data?.guestFeedback || []).length}</p>
              </div>
            </div>
          </Card>
        )

      default:
        return null
    }
  }

  return renderWidget()
}
