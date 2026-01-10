import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowsLeftRight,
  TrendUp,
  TrendDown,
  CalendarBlank,
  ChartBar,
  CurrencyDollar,
  Receipt,
  Users,
  Bed,
  Download,
  Sparkle
} from '@phosphor-icons/react'
import { formatCurrency, formatPercent, calculatePercentageChange } from '@/lib/helpers'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts'
import type { GuestInvoice, Reservation, Order, Folio } from '@/lib/types'

type PeriodType = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
type ComparisonMode = 'previous-period' | 'year-over-year' | 'custom'

interface RevenueComparisonProps {
  guestInvoices?: GuestInvoice[]
  reservations?: Reservation[]
  orders?: Order[]
  folios?: Folio[]
}

interface PeriodData {
  startDate: Date
  endDate: Date
  label: string
}

interface RevenueMetrics {
  totalRevenue: number
  roomRevenue: number
  fnbRevenue: number
  otherRevenue: number
  averageRevenuePerDay: number
  averageRevenuePerBooking: number
  totalBookings: number
  totalGuests: number
  occupancyRate: number
  revPAR: number
  revenueByCategory: { category: string; amount: number; percentage: number }[]
  dailyRevenue: { date: string; revenue: number; bookings: number }[]
}

export function RevenueComparison({
  guestInvoices = [],
  reservations = [],
  orders = [],
  folios = []
}: RevenueComparisonProps) {
  const [periodType, setPeriodType] = useState<PeriodType>('month')
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('previous-period')
  const [customCurrentStart, setCustomCurrentStart] = useState('')
  const [customCurrentEnd, setCustomCurrentEnd] = useState('')
  const [customPreviousStart, setCustomPreviousStart] = useState('')
  const [customPreviousEnd, setCustomPreviousEnd] = useState('')

  const getPeriodDates = (type: PeriodType, offset: number = 0): PeriodData => {
    const now = new Date()
    const startDate = new Date()
    const endDate = new Date()

    switch (type) {
      case 'day':
        startDate.setDate(now.getDate() - offset)
        startDate.setHours(0, 0, 0, 0)
        endDate.setDate(now.getDate() - offset)
        endDate.setHours(23, 59, 59, 999)
        return {
          startDate,
          endDate,
          label: offset === 0 ? 'Today' : offset === 1 ? 'Yesterday' : `${offset} days ago`
        }

      case 'week':
        const weekOffset = offset * 7
        startDate.setDate(now.getDate() - now.getDay() - weekOffset)
        startDate.setHours(0, 0, 0, 0)
        endDate.setDate(startDate.getDate() + 6)
        endDate.setHours(23, 59, 59, 999)
        return {
          startDate,
          endDate,
          label: offset === 0 ? 'This Week' : offset === 1 ? 'Last Week' : `${offset} weeks ago`
        }

      case 'month':
        startDate.setMonth(now.getMonth() - offset, 1)
        startDate.setHours(0, 0, 0, 0)
        endDate.setMonth(startDate.getMonth() + 1, 0)
        endDate.setHours(23, 59, 59, 999)
        return {
          startDate,
          endDate,
          label: offset === 0 ? 'This Month' : offset === 1 ? 'Last Month' : startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        }

      case 'quarter':
        const currentQuarter = Math.floor(now.getMonth() / 3)
        const targetQuarter = currentQuarter - offset
        const targetYear = now.getFullYear() + Math.floor(targetQuarter / 4)
        const adjustedQuarter = ((targetQuarter % 4) + 4) % 4
        
        startDate.setFullYear(targetYear, adjustedQuarter * 3, 1)
        startDate.setHours(0, 0, 0, 0)
        endDate.setFullYear(targetYear, adjustedQuarter * 3 + 3, 0)
        endDate.setHours(23, 59, 59, 999)
        return {
          startDate,
          endDate,
          label: offset === 0 ? 'This Quarter' : `Q${adjustedQuarter + 1} ${targetYear}`
        }

      case 'year':
        startDate.setFullYear(now.getFullYear() - offset, 0, 1)
        startDate.setHours(0, 0, 0, 0)
        endDate.setFullYear(now.getFullYear() - offset, 11, 31)
        endDate.setHours(23, 59, 59, 999)
        return {
          startDate,
          endDate,
          label: offset === 0 ? 'This Year' : `${now.getFullYear() - offset}`
        }

      default:
        return {
          startDate: now,
          endDate: now,
          label: 'Current'
        }
    }
  }

  const currentPeriod = useMemo(() => {
    if (periodType === 'custom' && customCurrentStart && customCurrentEnd) {
      return {
        startDate: new Date(customCurrentStart),
        endDate: new Date(customCurrentEnd),
        label: 'Custom Current Period'
      }
    }
    return getPeriodDates(periodType, 0)
  }, [periodType, customCurrentStart, customCurrentEnd])

  const previousPeriod = useMemo(() => {
    if (periodType === 'custom' && comparisonMode === 'custom' && customPreviousStart && customPreviousEnd) {
      return {
        startDate: new Date(customPreviousStart),
        endDate: new Date(customPreviousEnd),
        label: 'Custom Previous Period'
      }
    }

    if (comparisonMode === 'year-over-year') {
      const startDate = new Date(currentPeriod.startDate)
      const endDate = new Date(currentPeriod.endDate)
      startDate.setFullYear(startDate.getFullYear() - 1)
      endDate.setFullYear(endDate.getFullYear() - 1)
      return {
        startDate,
        endDate,
        label: 'Same Period Last Year'
      }
    }

    return getPeriodDates(periodType, 1)
  }, [periodType, comparisonMode, currentPeriod, customPreviousStart, customPreviousEnd])

  const calculateMetrics = (start: Date, end: Date): RevenueMetrics => {
    const startTime = start.getTime()
    const endTime = end.getTime()

    const periodInvoices = guestInvoices.filter(inv => {
      const invDate = new Date(inv.invoiceDate).getTime()
      return invDate >= startTime && invDate <= endTime
    })

    const periodReservations = reservations.filter(res => {
      const checkIn = new Date(res.checkInDate).getTime()
      return checkIn >= startTime && checkIn <= endTime
    })

    const periodOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt).getTime()
      return orderDate >= startTime && orderDate <= endTime
    })

    const totalRevenue = periodInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0)
    const roomRevenue = periodInvoices.reduce((sum, inv) => {
      const roomCharges = inv.lineItems.filter(item => 
        item.itemType === 'room-charge' || item.description.toLowerCase().includes('room')
      )
      return sum + roomCharges.reduce((itemSum, item) => itemSum + item.lineTotal, 0)
    }, 0)

    const fnbRevenue = periodOrders.reduce((sum, order) => sum + order.total, 0)
    const otherRevenue = totalRevenue - roomRevenue - fnbRevenue

    const days = Math.max(1, Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24)))
    const averageRevenuePerDay = totalRevenue / days
    const averageRevenuePerBooking = periodInvoices.length > 0 ? totalRevenue / periodInvoices.length : 0

    const totalBookings = periodReservations.length
    const totalGuests = periodReservations.reduce((sum, res) => sum + (res.adults || 0) + (res.children || 0), 0)

    const revenueByCategory = [
      { category: 'Room Revenue', amount: roomRevenue, percentage: totalRevenue > 0 ? (roomRevenue / totalRevenue) * 100 : 0 },
      { category: 'F&B Revenue', amount: fnbRevenue, percentage: totalRevenue > 0 ? (fnbRevenue / totalRevenue) * 100 : 0 },
      { category: 'Other Revenue', amount: otherRevenue, percentage: totalRevenue > 0 ? (otherRevenue / totalRevenue) * 100 : 0 }
    ]

    const dailyRevenueMap = new Map<string, { revenue: number; bookings: number }>()
    periodInvoices.forEach(inv => {
      const dateKey = new Date(inv.invoiceDate).toLocaleDateString()
      const existing = dailyRevenueMap.get(dateKey) || { revenue: 0, bookings: 0 }
      dailyRevenueMap.set(dateKey, {
        revenue: existing.revenue + inv.grandTotal,
        bookings: existing.bookings + 1
      })
    })

    const dailyRevenue = Array.from(dailyRevenueMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        bookings: data.bookings
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return {
      totalRevenue,
      roomRevenue,
      fnbRevenue,
      otherRevenue,
      averageRevenuePerDay,
      averageRevenuePerBooking,
      totalBookings,
      totalGuests,
      occupancyRate: 0,
      revPAR: 0,
      revenueByCategory,
      dailyRevenue
    }
  }

  const currentMetrics = useMemo(() => 
    calculateMetrics(currentPeriod.startDate, currentPeriod.endDate),
    [currentPeriod, guestInvoices, reservations, orders]
  )

  const previousMetrics = useMemo(() => 
    calculateMetrics(previousPeriod.startDate, previousPeriod.endDate),
    [previousPeriod, guestInvoices, reservations, orders]
  )

  const comparisonData = useMemo(() => {
    const maxLength = Math.max(currentMetrics.dailyRevenue.length, previousMetrics.dailyRevenue.length)
    const data: Array<{
      index: number
      currentDate: string
      previousDate: string
      currentRevenue: number
      previousRevenue: number
      currentBookings: number
      previousBookings: number
    }> = []

    for (let i = 0; i < maxLength; i++) {
      const current = currentMetrics.dailyRevenue[i]
      const previous = previousMetrics.dailyRevenue[i]

      data.push({
        index: i + 1,
        currentDate: current?.date || '',
        previousDate: previous?.date || '',
        currentRevenue: current?.revenue || 0,
        previousRevenue: previous?.revenue || 0,
        currentBookings: current?.bookings || 0,
        previousBookings: previous?.bookings || 0
      })
    }

    return data
  }, [currentMetrics, previousMetrics])

  const MetricCard = ({ 
    title, 
    currentValue, 
    previousValue, 
    icon: Icon,
    format = 'currency' 
  }: { 
    title: string
    currentValue: number
    previousValue: number
    icon: any
    format?: 'currency' | 'number' | 'percent'
  }) => {
    const change = calculatePercentageChange(currentValue, previousValue)
    const isPositive = change >= 0
    const formattedCurrent = format === 'currency' ? formatCurrency(currentValue) : 
                           format === 'percent' ? formatPercent(currentValue) : 
                           currentValue.toLocaleString()
    const formattedPrevious = format === 'currency' ? formatCurrency(previousValue) : 
                            format === 'percent' ? formatPercent(previousValue) : 
                            previousValue.toLocaleString()

    return (
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon size={24} className="text-primary" weight="duotone" />
          </div>
          <Badge className={isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {isPositive ? <TrendUp size={14} className="mr-1" /> : <TrendDown size={14} className="mr-1" />}
            {Math.abs(change).toFixed(1)}%
          </Badge>
        </div>
        
        <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
        
        <div className="space-y-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{currentPeriod.label}</p>
            <p className="text-2xl font-bold text-foreground">{formattedCurrent}</p>
          </div>
          
          <Separator />
          
          <div>
            <p className="text-xs text-muted-foreground mb-1">{previousPeriod.label}</p>
            <p className="text-lg font-semibold text-muted-foreground">{formattedPrevious}</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold flex items-center gap-3">
            <ArrowsLeftRight size={32} className="text-primary" weight="duotone" />
            Revenue Comparison
          </h2>
          <p className="text-muted-foreground mt-1">
            Compare revenue performance across different time periods
          </p>
        </div>
        
        <Button variant="outline" className="gap-2">
          <Download size={18} />
          Export Report
        </Button>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Period Type</Label>
            <Select value={periodType} onValueChange={(value) => setPeriodType(value as PeriodType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Daily</SelectItem>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="quarter">Quarterly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Comparison Mode</Label>
            <Select value={comparisonMode} onValueChange={(value) => setComparisonMode(value as ComparisonMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="previous-period">Previous Period</SelectItem>
                <SelectItem value="year-over-year">Year over Year</SelectItem>
                <SelectItem value="custom">Custom Comparison</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <div className="w-full p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground">Comparing</p>
              <p className="text-sm font-semibold">{currentPeriod.label} vs {previousPeriod.label}</p>
            </div>
          </div>
        </div>

        {periodType === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <CalendarBlank size={18} />
                Current Period
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Start Date</Label>
                  <input
                    type="date"
                    value={customCurrentStart}
                    onChange={(e) => setCustomCurrentStart(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">End Date</Label>
                  <input
                    type="date"
                    value={customCurrentEnd}
                    onChange={(e) => setCustomCurrentEnd(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            {comparisonMode === 'custom' && (
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <CalendarBlank size={18} />
                  Previous Period
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Start Date</Label>
                    <input
                      type="date"
                      value={customPreviousStart}
                      onChange={(e) => setCustomPreviousStart(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">End Date</Label>
                    <input
                      type="date"
                      value={customPreviousEnd}
                      onChange={(e) => setCustomPreviousEnd(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          currentValue={currentMetrics.totalRevenue}
          previousValue={previousMetrics.totalRevenue}
          icon={CurrencyDollar}
        />
        <MetricCard
          title="Room Revenue"
          currentValue={currentMetrics.roomRevenue}
          previousValue={previousMetrics.roomRevenue}
          icon={Bed}
        />
        <MetricCard
          title="F&B Revenue"
          currentValue={currentMetrics.fnbRevenue}
          previousValue={previousMetrics.fnbRevenue}
          icon={Receipt}
        />
        <MetricCard
          title="Average Revenue/Day"
          currentValue={currentMetrics.averageRevenuePerDay}
          previousValue={previousMetrics.averageRevenuePerDay}
          icon={ChartBar}
        />
      </div>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Trend Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="index" 
                  label={{ value: 'Day', position: 'insideBottom', offset: -5 }}
                  className="text-xs"
                />
                <YAxis 
                  label={{ value: 'Revenue', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => formatCurrency(value)}
                  className="text-xs"
                />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value))}
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="previousRevenue"
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--muted-foreground))"
                  fillOpacity={0.3}
                  name={previousPeriod.label}
                />
                <Line
                  type="monotone"
                  dataKey="currentRevenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  name={currentPeriod.label}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Bookings Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="index" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                />
                <Legend />
                <Bar dataKey="previousBookings" fill="hsl(var(--muted-foreground))" name={previousPeriod.label} />
                <Bar dataKey="currentBookings" fill="hsl(var(--primary))" name={currentPeriod.label} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">{currentPeriod.label} - Revenue Breakdown</h3>
              <div className="space-y-4">
                {currentMetrics.revenueByCategory.map((category, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{category.category}</span>
                      <span className="text-sm text-muted-foreground">{formatCurrency(category.amount)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{category.percentage.toFixed(1)}% of total</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">{previousPeriod.label} - Revenue Breakdown</h3>
              <div className="space-y-4">
                {previousMetrics.revenueByCategory.map((category, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{category.category}</span>
                      <span className="text-sm text-muted-foreground">{formatCurrency(category.amount)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-muted-foreground h-2 rounded-full transition-all"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{category.percentage.toFixed(1)}% of total</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detailed">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Detailed Metrics Comparison</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">{currentPeriod.label}</TableHead>
                  <TableHead className="text-right">{previousPeriod.label}</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Total Revenue</TableCell>
                  <TableCell className="text-right">{formatCurrency(currentMetrics.totalRevenue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(previousMetrics.totalRevenue)}</TableCell>
                  <TableCell className="text-right">
                    <Badge className={calculatePercentageChange(currentMetrics.totalRevenue, previousMetrics.totalRevenue) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {calculatePercentageChange(currentMetrics.totalRevenue, previousMetrics.totalRevenue).toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Room Revenue</TableCell>
                  <TableCell className="text-right">{formatCurrency(currentMetrics.roomRevenue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(previousMetrics.roomRevenue)}</TableCell>
                  <TableCell className="text-right">
                    <Badge className={calculatePercentageChange(currentMetrics.roomRevenue, previousMetrics.roomRevenue) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {calculatePercentageChange(currentMetrics.roomRevenue, previousMetrics.roomRevenue).toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">F&B Revenue</TableCell>
                  <TableCell className="text-right">{formatCurrency(currentMetrics.fnbRevenue)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(previousMetrics.fnbRevenue)}</TableCell>
                  <TableCell className="text-right">
                    <Badge className={calculatePercentageChange(currentMetrics.fnbRevenue, previousMetrics.fnbRevenue) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {calculatePercentageChange(currentMetrics.fnbRevenue, previousMetrics.fnbRevenue).toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Average Revenue/Day</TableCell>
                  <TableCell className="text-right">{formatCurrency(currentMetrics.averageRevenuePerDay)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(previousMetrics.averageRevenuePerDay)}</TableCell>
                  <TableCell className="text-right">
                    <Badge className={calculatePercentageChange(currentMetrics.averageRevenuePerDay, previousMetrics.averageRevenuePerDay) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {calculatePercentageChange(currentMetrics.averageRevenuePerDay, previousMetrics.averageRevenuePerDay).toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Average Revenue/Booking</TableCell>
                  <TableCell className="text-right">{formatCurrency(currentMetrics.averageRevenuePerBooking)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(previousMetrics.averageRevenuePerBooking)}</TableCell>
                  <TableCell className="text-right">
                    <Badge className={calculatePercentageChange(currentMetrics.averageRevenuePerBooking, previousMetrics.averageRevenuePerBooking) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {calculatePercentageChange(currentMetrics.averageRevenuePerBooking, previousMetrics.averageRevenuePerBooking).toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total Bookings</TableCell>
                  <TableCell className="text-right">{currentMetrics.totalBookings}</TableCell>
                  <TableCell className="text-right">{previousMetrics.totalBookings}</TableCell>
                  <TableCell className="text-right">
                    <Badge className={calculatePercentageChange(currentMetrics.totalBookings, previousMetrics.totalBookings) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {calculatePercentageChange(currentMetrics.totalBookings, previousMetrics.totalBookings).toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total Guests</TableCell>
                  <TableCell className="text-right">{currentMetrics.totalGuests}</TableCell>
                  <TableCell className="text-right">{previousMetrics.totalGuests}</TableCell>
                  <TableCell className="text-right">
                    <Badge className={calculatePercentageChange(currentMetrics.totalGuests, previousMetrics.totalGuests) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {calculatePercentageChange(currentMetrics.totalGuests, previousMetrics.totalGuests).toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Sparkle size={24} className="text-primary" weight="duotone" />
              AI-Powered Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                const revenueChange = calculatePercentageChange(currentMetrics.totalRevenue, previousMetrics.totalRevenue)
                const bookingsChange = calculatePercentageChange(currentMetrics.totalBookings, previousMetrics.totalBookings)
                const avgRevenueChange = calculatePercentageChange(currentMetrics.averageRevenuePerBooking, previousMetrics.averageRevenuePerBooking)

                const insights: Array<{
                  type: 'success' | 'warning' | 'info'
                  title: string
                  description: string
                }> = []

                if (revenueChange > 10) {
                  insights.push({
                    type: 'success',
                    title: 'Strong Revenue Growth',
                    description: `Revenue increased by ${revenueChange.toFixed(1)}% compared to the previous period. Excellent performance!`
                  })
                } else if (revenueChange < -10) {
                  insights.push({
                    type: 'warning',
                    title: 'Revenue Decline',
                    description: `Revenue decreased by ${Math.abs(revenueChange).toFixed(1)}%. Consider reviewing pricing strategy and marketing efforts.`
                  })
                }

                if (avgRevenueChange > 5) {
                  insights.push({
                    type: 'success',
                    title: 'Higher Average Booking Value',
                    description: `Average revenue per booking increased by ${avgRevenueChange.toFixed(1)}%. Your upselling strategies are working!`
                  })
                }

                if (bookingsChange > 15 && revenueChange < 5) {
                  insights.push({
                    type: 'info',
                    title: 'Volume vs Value Opportunity',
                    description: `Bookings increased by ${bookingsChange.toFixed(1)}% but revenue growth is modest. Consider optimizing pricing.`
                  })
                }

                if (currentMetrics.roomRevenue > currentMetrics.fnbRevenue * 5) {
                  insights.push({
                    type: 'info',
                    title: 'F&B Growth Opportunity',
                    description: `Room revenue significantly outpaces F&B. Consider promoting restaurant and bar services to guests.`
                  })
                }

                if (insights.length === 0) {
                  insights.push({
                    type: 'info',
                    title: 'Stable Performance',
                    description: 'Revenue metrics are relatively stable compared to the previous period.'
                  })
                }

                return insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      insight.type === 'success' ? 'bg-green-50 border-green-500' :
                      insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                      'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <h4 className="font-semibold mb-2">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                ))
              })()}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
