import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine
} from 'recharts'
import { 
  TrendUp, 
  TrendDown, 
  Calendar, 
  CurrencyDollar,
  Bed,
  ChartBar,
  ArrowsClockwise,
  Download,
  ForkKnife
} from '@phosphor-icons/react'
import { formatCurrency, formatPercent } from '@/lib/helpers'
import type { Reservation, Order, GuestInvoice, RoomTypeConfig, RatePlanConfig, Room } from '@/lib/types'
import { RevenueBreakdownDialog } from '@/components/RevenueBreakdownDialog'
import { RevenueForecasting } from '@/components/RevenueForecasting'
import { Sparkle } from '@phosphor-icons/react'

interface RevenueOccupancyTrendsProps {
  reservations: Reservation[]
  orders: Order[]
  invoices: GuestInvoice[]
  totalRooms: number
  rooms?: Room[]
  roomTypes?: RoomTypeConfig[]
  ratePlans?: RatePlanConfig[]
}

type Period = '7d' | '30d' | '90d' | '1y'
type ViewType = 'combined' | 'revenue' | 'occupancy' | 'fnb' | 'forecasting'

interface TrendData {
  date: string
  currentRevenue: number
  previousRevenue: number
  currentOccupancy: number
  previousOccupancy: number
  currentFnB: number
  previousFnB: number
  currentRoomRevenue: number
  previousRoomRevenue: number
}

export function RevenueOccupancyTrends({ 
  reservations, 
  orders, 
  invoices,
  totalRooms,
  rooms = [],
  roomTypes = [],
  ratePlans = []
}: RevenueOccupancyTrendsProps) {
  const [period, setPeriod] = useState<Period>('30d')
  const [viewType, setViewType] = useState<ViewType>('combined')

  const getPeriodDays = (p: Period): number => {
    switch (p) {
      case '7d': return 7
      case '30d': return 30
      case '90d': return 90
      case '1y': return 365
      default: return 30
    }
  }

  const trendData = useMemo(() => {
    const days = getPeriodDays(period)
    const now = Date.now()
    const data: TrendData[] = []

    for (let i = days - 1; i >= 0; i--) {
      const currentDate = now - (i * 24 * 60 * 60 * 1000)
      const previousDate = currentDate - (days * 24 * 60 * 60 * 1000)
      
      const currentStart = new Date(currentDate).setHours(0, 0, 0, 0)
      const currentEnd = new Date(currentDate).setHours(23, 59, 59, 999)
      const previousStart = new Date(previousDate).setHours(0, 0, 0, 0)
      const previousEnd = new Date(previousDate).setHours(23, 59, 59, 999)

      const currentReservations = reservations.filter(r => {
        const checkIn = new Date(r.checkInDate).getTime()
        const checkOut = new Date(r.checkOutDate).getTime()
        return checkIn <= currentEnd && checkOut >= currentStart
      })

      const previousReservations = reservations.filter(r => {
        const checkIn = new Date(r.checkInDate).getTime()
        const checkOut = new Date(r.checkOutDate).getTime()
        return checkIn <= previousEnd && checkOut >= previousStart
      })

      const currentRoomRevenue = currentReservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0)
      const previousRoomRevenue = previousReservations.reduce((sum, r) => sum + (r.totalAmount || 0), 0)

      const currentOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt).getTime()
        return orderDate >= currentStart && orderDate <= currentEnd
      })

      const previousOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt).getTime()
        return orderDate >= previousStart && orderDate <= previousEnd
      })

      const currentFnB = currentOrders.reduce((sum, o) => sum + o.total, 0)
      const previousFnB = previousOrders.reduce((sum, o) => sum + o.total, 0)

      const currentRevenue = currentRoomRevenue + currentFnB
      const previousRevenue = previousRoomRevenue + previousFnB

      const currentOccupancy = totalRooms > 0 ? (currentReservations.length / totalRooms) * 100 : 0
      const previousOccupancy = totalRooms > 0 ? (previousReservations.length / totalRooms) * 100 : 0

      data.push({
        date: new Date(currentDate).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        currentRevenue,
        previousRevenue,
        currentOccupancy,
        previousOccupancy,
        currentFnB,
        previousFnB,
        currentRoomRevenue,
        previousRoomRevenue
      })
    }

    return data
  }, [reservations, orders, period, totalRooms])

  const summary = useMemo(() => {
    const currentTotal = trendData.reduce((sum, d) => sum + d.currentRevenue, 0)
    const previousTotal = trendData.reduce((sum, d) => sum + d.previousRevenue, 0)
    const currentAvgOccupancy = trendData.reduce((sum, d) => sum + d.currentOccupancy, 0) / trendData.length
    const previousAvgOccupancy = trendData.reduce((sum, d) => sum + d.previousOccupancy, 0) / trendData.length
    const currentRoomTotal = trendData.reduce((sum, d) => sum + d.currentRoomRevenue, 0)
    const previousRoomTotal = trendData.reduce((sum, d) => sum + d.previousRoomRevenue, 0)
    const currentFnBTotal = trendData.reduce((sum, d) => sum + d.currentFnB, 0)
    const previousFnBTotal = trendData.reduce((sum, d) => sum + d.previousFnB, 0)

    const revenueChange = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0
    const occupancyChange = previousAvgOccupancy > 0 ? ((currentAvgOccupancy - previousAvgOccupancy) / previousAvgOccupancy) * 100 : 0
    const roomRevenueChange = previousRoomTotal > 0 ? ((currentRoomTotal - previousRoomTotal) / previousRoomTotal) * 100 : 0
    const fnbChange = previousFnBTotal > 0 ? ((currentFnBTotal - previousFnBTotal) / previousFnBTotal) * 100 : 0

    return {
      currentTotal,
      previousTotal,
      revenueChange,
      currentAvgOccupancy,
      previousAvgOccupancy,
      occupancyChange,
      currentRoomTotal,
      previousRoomTotal,
      roomRevenueChange,
      currentFnBTotal,
      previousFnBTotal,
      fnbChange
    }
  }, [trendData])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">{entry.name}:</span>
              </div>
              <span className="font-medium">
                {entry.name.includes('Occupancy') 
                  ? `${entry.value.toFixed(1)}%`
                  : formatCurrency(entry.value)
                }
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Current Revenue', 'Previous Revenue', 'Current Occupancy %', 'Previous Occupancy %'],
      ...trendData.map(d => [
        d.date,
        d.currentRevenue.toFixed(2),
        d.previousRevenue.toFixed(2),
        d.currentOccupancy.toFixed(2),
        d.previousOccupancy.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `revenue-occupancy-trends-${period}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold">Revenue & Occupancy Trends</h2>
          <p className="text-muted-foreground mt-1">Visual comparison of current vs previous period performance</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <RevenueBreakdownDialog
            reservations={reservations}
            invoices={invoices}
            roomTypes={roomTypes}
            ratePlans={ratePlans}
          />
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
            <CurrencyDollar size={20} className="text-primary" />
          </div>
          <p className="text-2xl font-bold mb-1">{formatCurrency(summary.currentTotal)}</p>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant={summary.revenueChange >= 0 ? 'default' : 'destructive'} className="gap-1">
              {summary.revenueChange >= 0 ? <TrendUp size={14} /> : <TrendDown size={14} />}
              {Math.abs(summary.revenueChange).toFixed(1)}%
            </Badge>
            <span className="text-muted-foreground">vs previous period</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Previous: {formatCurrency(summary.previousTotal)}
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-secondary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Avg Occupancy</h3>
            <Bed size={20} className="text-secondary" />
          </div>
          <p className="text-2xl font-bold mb-1">{summary.currentAvgOccupancy.toFixed(1)}%</p>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant={summary.occupancyChange >= 0 ? 'default' : 'destructive'} className="gap-1">
              {summary.occupancyChange >= 0 ? <TrendUp size={14} /> : <TrendDown size={14} />}
              {Math.abs(summary.occupancyChange).toFixed(1)}%
            </Badge>
            <span className="text-muted-foreground">vs previous period</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Previous: {summary.previousAvgOccupancy.toFixed(1)}%
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Room Revenue</h3>
            <Bed size={20} className="text-accent" />
          </div>
          <p className="text-2xl font-bold mb-1">{formatCurrency(summary.currentRoomTotal)}</p>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant={summary.roomRevenueChange >= 0 ? 'default' : 'destructive'} className="gap-1">
              {summary.roomRevenueChange >= 0 ? <TrendUp size={14} /> : <TrendDown size={14} />}
              {Math.abs(summary.roomRevenueChange).toFixed(1)}%
            </Badge>
            <span className="text-muted-foreground">vs previous period</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Previous: {formatCurrency(summary.previousRoomTotal)}
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">F&B Revenue</h3>
            <ForkKnife size={20} className="text-success" />
          </div>
          <p className="text-2xl font-bold mb-1">{formatCurrency(summary.currentFnBTotal)}</p>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant={summary.fnbChange >= 0 ? 'default' : 'destructive'} className="gap-1">
              {summary.fnbChange >= 0 ? <TrendUp size={14} /> : <TrendDown size={14} />}
              {Math.abs(summary.fnbChange).toFixed(1)}%
            </Badge>
            <span className="text-muted-foreground">vs previous period</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Previous: {formatCurrency(summary.previousFnBTotal)}
          </p>
        </Card>
      </div>

      <Tabs value={viewType} onValueChange={(v) => setViewType(v as ViewType)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="combined">
            <ChartBar size={18} className="mr-2" />
            Combined
          </TabsTrigger>
          <TabsTrigger value="revenue">
            <CurrencyDollar size={18} className="mr-2" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="occupancy">
            <Bed size={18} className="mr-2" />
            Occupancy
          </TabsTrigger>
          <TabsTrigger value="fnb">
            <ForkKnife size={18} className="mr-2" />
            F&B
          </TabsTrigger>
          <TabsTrigger value="forecasting">
            <Sparkle size={18} className="mr-2" />
            Forecasting
          </TabsTrigger>
        </TabsList>

        <TabsContent value="combined" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `${value.toFixed(0)}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="previousRevenue"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--muted-foreground))"
                  fillOpacity={0.3}
                  name="Previous Revenue"
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="currentRevenue"
                  fill="hsl(var(--primary))"
                  stroke="hsl(var(--primary))"
                  fillOpacity={0.5}
                  name="Current Revenue"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="currentOccupancy"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                  dot={false}
                  name="Current Occupancy"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="previousOccupancy"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Previous Occupancy"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Total Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="previousRevenue"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--muted-foreground))"
                  fillOpacity={0.3}
                  strokeWidth={2}
                  name="Previous Period"
                />
                <Area
                  type="monotone"
                  dataKey="currentRevenue"
                  fill="hsl(var(--primary))"
                  stroke="hsl(var(--primary))"
                  fillOpacity={0.6}
                  strokeWidth={2}
                  name="Current Period"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Breakdown (Room vs F&B)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="currentRoomRevenue" 
                  fill="hsl(var(--accent))" 
                  name="Room Revenue"
                  stackId="current"
                />
                <Bar 
                  dataKey="currentFnB" 
                  fill="hsl(var(--success))" 
                  name="F&B Revenue"
                  stackId="current"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Occupancy Rate Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `${value.toFixed(0)}%`}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <ReferenceLine y={70} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label="Target (70%)" />
                <Line
                  type="monotone"
                  dataKey="previousOccupancy"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Previous Period"
                />
                <Line
                  type="monotone"
                  dataKey="currentOccupancy"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={3}
                  name="Current Period"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="fnb" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">F&B Revenue Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="previousFnB" 
                  fill="hsl(var(--muted))" 
                  name="Previous Period"
                  opacity={0.5}
                />
                <Bar 
                  dataKey="currentFnB" 
                  fill="hsl(var(--success))" 
                  name="Current Period"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          {rooms.length > 0 && roomTypes.length > 0 ? (
            <RevenueForecasting
              reservations={reservations}
              invoices={invoices}
              rooms={rooms}
              roomTypes={roomTypes}
              ratePlans={ratePlans}
            />
          ) : (
            <Card className="p-12 text-center">
              <Sparkle size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Revenue Forecasting Not Available</h3>
              <p className="text-muted-foreground mb-6">
                Please configure room types and ensure you have historical booking data to enable predictive forecasting.
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
