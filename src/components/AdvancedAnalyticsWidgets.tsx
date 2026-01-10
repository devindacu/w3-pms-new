import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  TrendUp,
  TrendDown,
  CurrencyDollar,
  Users,
  CalendarBlank,
  ArrowRight,
  Bed,
  ChartLine,
  ChartBar,
  ChartPie,
  ArrowsClockwise,
  CaretUp,
  CaretDown,
  CheckCircle,
  XCircle,
  Clock,
  Sparkle
} from '@phosphor-icons/react'
import { formatCurrency, formatPercent } from '@/lib/helpers'
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns'

interface AnalyticsData {
  reservations?: any[]
  rooms?: any[]
  orders?: any[]
  folios?: any[]
  guests?: any[]
}

interface AdvancedAnalyticsWidgetsProps {
  data: AnalyticsData
  onNavigate?: (module: string) => void
}

type TimePeriod = '7d' | '30d' | '90d' | 'ytd'

export function AdvancedAnalyticsWidgets({ data, onNavigate }: AdvancedAnalyticsWidgetsProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d')

  const getDateRange = (period: TimePeriod) => {
    const now = new Date()
    switch (period) {
      case '7d':
        return { start: startOfDay(subDays(now, 7)), end: endOfDay(now) }
      case '30d':
        return { start: startOfDay(subDays(now, 30)), end: endOfDay(now) }
      case '90d':
        return { start: startOfDay(subDays(now, 90)), end: endOfDay(now) }
      case 'ytd':
        return { start: new Date(now.getFullYear(), 0, 1), end: endOfDay(now) }
      default:
        return { start: startOfDay(subDays(now, 30)), end: endOfDay(now) }
    }
  }

  const analytics = useMemo(() => {
    const { start, end } = getDateRange(timePeriod)
    const reservations = data.reservations || []
    const rooms = data.rooms || []
    const orders = data.orders || []
    const folios = data.folios || []
    const guests = data.guests || []

    const periodReservations = reservations.filter(r => 
      isWithinInterval(new Date(r.createdAt || Date.now()), { start, end })
    )

    const periodOrders = orders.filter(o => 
      isWithinInterval(new Date(o.createdAt || Date.now()), { start, end })
    )

    const totalRooms = rooms.length
    const occupiedRooms = rooms.filter(r => r.status.includes('occupied')).length
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0

    const totalRevenue = folios.reduce((sum, f) => sum + (f.total || 0), 0)
    const roomRevenue = folios.reduce((sum, f) => sum + (f.roomCharges || 0), 0)
    const fnbRevenue = periodOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    const extraRevenue = totalRevenue - roomRevenue - fnbRevenue

    const confirmedReservations = periodReservations.filter(r => r.status === 'confirmed').length
    const checkedInReservations = periodReservations.filter(r => r.status === 'checked-in').length
    const cancelledReservations = periodReservations.filter(r => r.status === 'cancelled').length
    const noShowReservations = periodReservations.filter(r => r.status === 'no-show').length

    const totalGuests = guests.length
    const returningGuests = guests.filter(g => (g.stayCount || 0) > 1).length

    const avgDailyRate = roomRevenue / Math.max(occupiedRooms, 1)
    const revPar = totalRevenue / totalRooms

    const previousPeriodStart = new Date(start)
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    const previousRevenue = folios.filter(f => 
      isWithinInterval(new Date(f.createdAt || Date.now()), { 
        start: previousPeriodStart, 
        end: start 
      })
    ).reduce((sum, f) => sum + (f.total || 0), 0)

    const revenueGrowth = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0

    const dailyData: Array<{ date: string; revenue: number; orders: number }> = []
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    for (let i = 0; i < days; i++) {
      const dayStart = startOfDay(subDays(end, days - i - 1))
      const dayEnd = endOfDay(dayStart)
      
      const dayRevenue = folios.filter(f => 
        isWithinInterval(new Date(f.createdAt || Date.now()), { start: dayStart, end: dayEnd })
      ).reduce((sum, f) => sum + (f.total || 0), 0)
      
      const dayOrders = orders.filter(o => 
        isWithinInterval(new Date(o.createdAt || Date.now()), { start: dayStart, end: dayEnd })
      ).length
      
      dailyData.push({
        date: format(dayStart, 'MMM dd'),
        revenue: dayRevenue,
        orders: dayOrders,
      })
    }

    return {
      totalRevenue,
      roomRevenue,
      fnbRevenue,
      extraRevenue,
      occupancyRate,
      avgDailyRate,
      revPar,
      revenueGrowth,
      confirmedReservations,
      checkedInReservations,
      cancelledReservations,
      noShowReservations,
      totalGuests,
      returningGuests,
      dailyData,
      totalRooms,
      occupiedRooms,
    }
  }, [data, timePeriod])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Comprehensive insights and performance metrics
          </p>
        </div>
        <Select value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="ytd">Year to date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="group relative overflow-hidden border border-border/50 bg-gradient-to-br from-card via-card to-card/50 hover:border-success/30 transition-all duration-500 shadow-sm hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-success/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Total Revenue
                </p>
                <h3 className="text-sm font-medium text-foreground/80">All Sources</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-success/10 to-success/5 flex items-center justify-center border border-success/10 group-hover:scale-110 transition-transform duration-300">
                <CurrencyDollar size={22} weight="duotone" className="text-success" />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-4xl font-bold tracking-tight">{formatCurrency(analytics.totalRevenue)}</p>
              {analytics.revenueGrowth !== 0 && (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  analytics.revenueGrowth > 0 
                    ? 'bg-success/10 text-success border border-success/20' 
                    : 'bg-destructive/10 text-destructive border border-destructive/20'
                }`}>
                  {analytics.revenueGrowth > 0 ? <CaretUp size={14} weight="bold" /> : <CaretDown size={14} weight="bold" />}
                  <span>{analytics.revenueGrowth > 0 ? '+' : ''}{analytics.revenueGrowth.toFixed(1)}%</span>
                  <span className="opacity-70">vs previous period</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="group relative overflow-hidden border border-border/50 bg-gradient-to-br from-card via-card to-card/50 hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Occupancy Rate
                </p>
                <h3 className="text-sm font-medium text-foreground/80">Current Status</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10 group-hover:scale-110 transition-transform duration-300">
                <Bed size={22} weight="duotone" className="text-primary" />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-4xl font-bold tracking-tight">{analytics.occupancyRate.toFixed(1)}%</p>
              <div className="relative h-2 rounded-full bg-muted/50 overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary to-primary/80 rounded-full transition-all duration-700"
                  style={{ width: `${analytics.occupancyRate}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.occupiedRooms} of {analytics.totalRooms} rooms occupied
              </p>
            </div>
          </div>
        </Card>

        <Card className="group relative overflow-hidden border border-border/50 bg-gradient-to-br from-card via-card to-card/50 hover:border-accent/30 transition-all duration-500 shadow-sm hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Average Daily Rate
                </p>
                <h3 className="text-sm font-medium text-foreground/80">ADR</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center border border-accent/10 group-hover:scale-110 transition-transform duration-300">
                <ChartLine size={22} weight="duotone" className="text-accent" />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-4xl font-bold tracking-tight">{formatCurrency(analytics.avgDailyRate)}</p>
              <p className="text-xs text-muted-foreground">
                RevPAR: {formatCurrency(analytics.revPar)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="group relative overflow-hidden border border-border/50 bg-gradient-to-br from-card via-card to-card/50 hover:border-info/30 transition-all duration-500 shadow-sm hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-info/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Guest Loyalty
                </p>
                <h3 className="text-sm font-medium text-foreground/80">Returning Guests</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-info/10 to-info/5 flex items-center justify-center border border-info/10 group-hover:scale-110 transition-transform duration-300">
                <Users size={22} weight="duotone" className="text-info" />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-4xl font-bold tracking-tight">{analytics.totalGuests > 0 ? ((analytics.returningGuests / analytics.totalGuests) * 100).toFixed(1) : 0}%</p>
              <p className="text-xs text-muted-foreground">
                {analytics.returningGuests} of {analytics.totalGuests} total guests
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Revenue Breakdown</h3>
              <p className="text-xs text-muted-foreground mt-1">By revenue source</p>
            </div>
            <ChartPie size={24} weight="duotone" className="text-muted-foreground" />
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  Room Revenue
                </span>
                <span className="font-bold">{formatCurrency(analytics.roomRevenue)}</span>
              </div>
              <div className="relative h-2 rounded-full bg-muted/50 overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${analytics.totalRevenue > 0 ? (analytics.roomRevenue / analytics.totalRevenue) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.totalRevenue > 0 ? ((analytics.roomRevenue / analytics.totalRevenue) * 100).toFixed(1) : 0}% of total revenue
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  F&B Revenue
                </span>
                <span className="font-bold">{formatCurrency(analytics.fnbRevenue)}</span>
              </div>
              <div className="relative h-2 rounded-full bg-muted/50 overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-success rounded-full transition-all duration-500"
                  style={{ width: `${analytics.totalRevenue > 0 ? (analytics.fnbRevenue / analytics.totalRevenue) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.totalRevenue > 0 ? ((analytics.fnbRevenue / analytics.totalRevenue) * 100).toFixed(1) : 0}% of total revenue
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent" />
                  Extra Services
                </span>
                <span className="font-bold">{formatCurrency(analytics.extraRevenue)}</span>
              </div>
              <div className="relative h-2 rounded-full bg-muted/50 overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all duration-500"
                  style={{ width: `${analytics.totalRevenue > 0 ? (analytics.extraRevenue / analytics.totalRevenue) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.totalRevenue > 0 ? ((analytics.extraRevenue / analytics.totalRevenue) * 100).toFixed(1) : 0}% of total revenue
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-border/50 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Reservation Status</h3>
              <p className="text-xs text-muted-foreground mt-1">Period overview</p>
            </div>
            <CalendarBlank size={24} weight="duotone" className="text-muted-foreground" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-success/5 to-success/[0.02] border border-success/10">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={18} weight="duotone" className="text-success" />
                <p className="text-xs font-medium text-muted-foreground">Confirmed</p>
              </div>
              <p className="text-3xl font-bold text-success">{analytics.confirmedReservations}</p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/[0.02] border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <Bed size={18} weight="duotone" className="text-primary" />
                <p className="text-xs font-medium text-muted-foreground">Checked In</p>
              </div>
              <p className="text-3xl font-bold text-primary">{analytics.checkedInReservations}</p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-destructive/5 to-destructive/[0.02] border border-destructive/10">
              <div className="flex items-center gap-2 mb-2">
                <XCircle size={18} weight="duotone" className="text-destructive" />
                <p className="text-xs font-medium text-muted-foreground">Cancelled</p>
              </div>
              <p className="text-3xl font-bold text-destructive">{analytics.cancelledReservations}</p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-warning/5 to-warning/[0.02] border border-warning/10">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={18} weight="duotone" className="text-warning" />
                <p className="text-xs font-medium text-muted-foreground">No Show</p>
              </div>
              <p className="text-3xl font-bold text-warning">{analytics.noShowReservations}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 border border-border/50 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Revenue Trend</h3>
            <p className="text-xs text-muted-foreground mt-1">Daily revenue performance</p>
          </div>
          <ChartBar size={24} weight="duotone" className="text-muted-foreground" />
        </div>

        <div className="relative h-64">
          <div className="absolute inset-0 flex items-end justify-between gap-1">
            {analytics.dailyData.map((day, index) => {
              const maxRevenue = Math.max(...analytics.dailyData.map(d => d.revenue), 1)
              const height = (day.revenue / maxRevenue) * 100
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center justify-end h-56 relative group">
                    <div 
                      className="w-full bg-gradient-to-t from-primary to-primary/70 rounded-t-lg transition-all duration-300 hover:from-primary/90 hover:to-primary/80 relative overflow-hidden"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/10" />
                    </div>
                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground px-2 py-1 rounded text-xs font-semibold shadow-lg border">
                      {formatCurrency(day.revenue)}
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium">{day.date}</p>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {onNavigate && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 border border-border/50 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all duration-300 group cursor-pointer"
            onClick={() => onNavigate('analytics')}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-1">Detailed Analytics</h3>
                <p className="text-xs text-muted-foreground">View comprehensive reports</p>
              </div>
              <ArrowRight size={20} className="text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>

          <Card className="p-6 border border-border/50 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all duration-300 group cursor-pointer"
            onClick={() => onNavigate('finance')}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-1">Financial Reports</h3>
                <p className="text-xs text-muted-foreground">Access financial data</p>
              </div>
              <ArrowRight size={20} className="text-muted-foreground group-hover:text-success transition-colors group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>

          <Card className="p-6 border border-border/50 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all duration-300 group cursor-pointer"
            onClick={() => onNavigate('front-office')}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-1">Reservations</h3>
                <p className="text-xs text-muted-foreground">Manage bookings</p>
              </div>
              <ArrowRight size={20} className="text-muted-foreground group-hover:text-accent transition-colors group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
