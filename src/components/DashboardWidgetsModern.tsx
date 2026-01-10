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
  Package,
  ChartLine
} from '@phosphor-icons/react'
import type { DashboardWidget, DashboardMetrics } from '@/lib/types'
import { formatCurrency, formatPercent } from '@/lib/helpers'
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'

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

      case 'revenue-analytics':
        const revenueData = [
          { month: 'Jan', rooms: 45000, fnb: 18000, services: 8000, total: 71000 },
          { month: 'Feb', rooms: 52000, fnb: 21000, services: 9500, total: 82500 },
          { month: 'Mar', rooms: 58000, fnb: 24000, services: 11000, total: 93000 },
          { month: 'Apr', rooms: 61000, fnb: 26000, services: 12000, total: 99000 },
          { month: 'May', rooms: 68000, fnb: 29000, services: 14000, total: 111000 },
          { month: 'Jun', rooms: 72000, fnb: 31000, services: 15500, total: 118500 }
        ]

        const revenueBySource = [
          { name: 'Room Revenue', value: 356000, color: 'oklch(0.65 0.23 262)' },
          { name: 'F&B Revenue', value: 149000, color: 'oklch(0.75 0.20 140)' },
          { name: 'Services', value: 70000, color: 'oklch(0.80 0.18 85)' },
          { name: 'Other', value: 25000, color: 'oklch(0.70 0.15 40)' }
        ]

        const totalRevenue = revenueBySource.reduce((sum, item) => sum + item.value, 0)

        return (
          <Card className="p-6 hover:shadow-md transition-shadow col-span-full">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Revenue Analytics</p>
                <h3 className="text-2xl font-bold">{formatCurrency(totalRevenue)}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-success/10 text-success border-success/20">
                    <TrendUp size={14} className="mr-1" />
                    +12.5% vs last period
                  </Badge>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ChartLine size={24} className="text-primary" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-1">Revenue Trend (6 Months)</h4>
                  <p className="text-xs text-muted-foreground">Monthly revenue breakdown by category</p>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRooms" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.65 0.23 262)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="oklch(0.65 0.23 262)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorFnB" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.75 0.20 140)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="oklch(0.75 0.20 140)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorServices" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.80 0.18 85)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="oklch(0.80 0.18 85)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0 0 / 0.1)" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: 'oklch(0.5 0 0)', fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: 'oklch(0.5 0 0 / 0.2)' }}
                    />
                    <YAxis 
                      tick={{ fill: 'oklch(0.5 0 0)', fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: 'oklch(0.5 0 0 / 0.2)' }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'oklch(1 0 0)',
                        border: '1px solid oklch(0.9 0 0)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px oklch(0 0 0 / 0.1)'
                      }}
                      formatter={(value: any) => formatCurrency(value)}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                      iconType="circle"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="rooms" 
                      name="Rooms"
                      stroke="oklch(0.65 0.23 262)" 
                      fillOpacity={1} 
                      fill="url(#colorRooms)"
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="fnb" 
                      name="F&B"
                      stroke="oklch(0.75 0.20 140)" 
                      fillOpacity={1} 
                      fill="url(#colorFnB)"
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="services" 
                      name="Services"
                      stroke="oklch(0.80 0.18 85)" 
                      fillOpacity={1} 
                      fill="url(#colorServices)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-1">Revenue Distribution</h4>
                  <p className="text-xs text-muted-foreground">By revenue source</p>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={revenueBySource}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {revenueBySource.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'oklch(1 0 0)',
                        border: '1px solid oklch(0.9 0 0)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px oklch(0 0 0 / 0.1)'
                      }}
                      formatter={(value: any, name: string) => [formatCurrency(value), name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {revenueBySource.map((source) => (
                <div key={source.name} className="p-4 rounded-lg border border-border/40 bg-card/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: source.color }}
                    />
                    <p className="text-xs text-muted-foreground">{source.name}</p>
                  </div>
                  <p className="text-lg font-bold">{formatCurrency(source.value)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatPercent(source.value / totalRevenue)} of total
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )

      default:
        return null
    }
  }

  return renderWidget()
}
