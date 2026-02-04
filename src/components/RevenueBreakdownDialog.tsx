import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import {
  ChartBar,
  Buildings,
  CurrencyDollar,
  TrendUp,
  FileText,
  CalendarBlank,
} from '@phosphor-icons/react'
import { formatCurrency, formatPercent } from '@/lib/helpers'
import type { Reservation, GuestInvoice, RoomTypeConfig, RatePlanConfig } from '@/lib/types'

interface RevenueBreakdownDialogProps {
  reservations: Reservation[]
  invoices: GuestInvoice[]
  roomTypes?: RoomTypeConfig[]
  ratePlans?: RatePlanConfig[]
}

type Period = '7d' | '30d' | '90d' | '1y' | 'all'
type GroupBy = 'room-type' | 'rate-plan' | 'both'

interface RoomTypeRevenue {
  roomType: string
  revenue: number
  bookings: number
  avgRate: number
  percentage: number
}

interface RatePlanRevenue {
  ratePlan: string
  revenue: number
  bookings: number
  avgRate: number
  percentage: number
}

interface CombinedRevenue {
  roomType: string
  ratePlan: string
  revenue: number
  bookings: number
  avgRate: number
}

const COLORS = [
  'oklch(0.65 0.22 265)',
  'oklch(0.55 0.16 220)',
  'oklch(0.60 0.18 155)',
  'oklch(0.68 0.24 35)',
  'oklch(0.62 0.20 310)',
  'oklch(0.70 0.18 180)',
  'oklch(0.58 0.20 45)',
  'oklch(0.64 0.16 290)',
]

export function RevenueBreakdownDialog({
  reservations,
  invoices,
  roomTypes = [],
  ratePlans = [],
}: RevenueBreakdownDialogProps) {
  const [open, setOpen] = useState(false)
  const [period, setPeriod] = useState<Period>('30d')
  const [groupBy, setGroupBy] = useState<GroupBy>('room-type')

  const getPeriodDays = (p: Period): number => {
    switch (p) {
      case '7d': return 7
      case '30d': return 30
      case '90d': return 90
      case '1y': return 365
      case 'all': return 36500
      default: return 30
    }
  }

  const filteredData = useMemo(() => {
    const days = getPeriodDays(period)
    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000)

    const filteredReservations = period === 'all'
      ? reservations
      : reservations.filter(r => new Date(r.checkInDate).getTime() >= cutoffDate)

    const filteredInvoices = period === 'all'
      ? invoices
      : invoices.filter(inv => inv.createdAt >= cutoffDate)

    return { reservations: filteredReservations, invoices: filteredInvoices }
  }, [reservations, invoices, period])

  const roomTypeBreakdown = useMemo((): RoomTypeRevenue[] => {
    const revenueMap = new Map<string, { revenue: number; bookings: number }>()

    filteredData.reservations.forEach(reservation => {
      const roomType = (reservation as any).roomType || 'Standard'
      const existing = revenueMap.get(roomType) || { revenue: 0, bookings: 0 }
      revenueMap.set(roomType, {
        revenue: existing.revenue + (reservation.totalAmount || 0),
        bookings: existing.bookings + 1,
      })
    })

    filteredData.invoices.forEach(invoice => {
      const roomRevenue = invoice.lineItems
        .filter(item => item.itemType.includes('room'))
        .reduce((sum, item) => sum + item.lineGrandTotal, 0)
      
      if (roomRevenue > 0) {
        const roomType = (invoice as any).roomType || 'Standard'
        const existing = revenueMap.get(roomType) || { revenue: 0, bookings: 0 }
        revenueMap.set(roomType, {
          revenue: existing.revenue + roomRevenue,
          bookings: existing.bookings,
        })
      }
    })

    const totalRevenue = Array.from(revenueMap.values()).reduce((sum, v) => sum + v.revenue, 0)

    return Array.from(revenueMap.entries())
      .map(([roomType, data]) => ({
        roomType,
        revenue: data.revenue,
        bookings: data.bookings,
        avgRate: data.bookings > 0 ? data.revenue / data.bookings : 0,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [filteredData])

  const ratePlanBreakdown = useMemo((): RatePlanRevenue[] => {
    const revenueMap = new Map<string, { revenue: number; bookings: number }>()

    filteredData.reservations.forEach(reservation => {
      const ratePlan = (reservation as any).ratePlan || 'Standard Rate'
      const existing = revenueMap.get(ratePlan) || { revenue: 0, bookings: 0 }
      revenueMap.set(ratePlan, {
        revenue: existing.revenue + (reservation.totalAmount || 0),
        bookings: existing.bookings + 1,
      })
    })

    filteredData.invoices.forEach(invoice => {
      const roomRevenue = invoice.lineItems
        .filter(item => item.itemType.includes('room'))
        .reduce((sum, item) => sum + item.lineGrandTotal, 0)
      
      if (roomRevenue > 0) {
        const ratePlan = (invoice as any).ratePlan || 'Standard Rate'
        const existing = revenueMap.get(ratePlan) || { revenue: 0, bookings: 0 }
        revenueMap.set(ratePlan, {
          revenue: existing.revenue + roomRevenue,
          bookings: existing.bookings,
        })
      }
    })

    const totalRevenue = Array.from(revenueMap.values()).reduce((sum, v) => sum + v.revenue, 0)

    return Array.from(revenueMap.entries())
      .map(([ratePlan, data]) => ({
        ratePlan,
        revenue: data.revenue,
        bookings: data.bookings,
        avgRate: data.bookings > 0 ? data.revenue / data.bookings : 0,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [filteredData])

  const combinedBreakdown = useMemo((): CombinedRevenue[] => {
    const revenueMap = new Map<string, { revenue: number; bookings: number }>()

    filteredData.reservations.forEach(reservation => {
      const roomType = (reservation as any).roomType || 'Standard'
      const key = `${roomType}|${(reservation as any).ratePlan || 'Standard Rate'}`
      const existing = revenueMap.get(key) || { revenue: 0, bookings: 0 }
      revenueMap.set(key, {
        revenue: existing.revenue + (reservation.totalAmount || 0),
        bookings: existing.bookings + 1,
      })
    })

    return Array.from(revenueMap.entries())
      .map(([key, data]) => {
        const [roomType, ratePlan] = key.split('|')
        return {
          roomType,
          ratePlan,
          revenue: data.revenue,
          bookings: data.bookings,
          avgRate: data.bookings > 0 ? data.revenue / data.bookings : 0,
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
  }, [filteredData])

  const totalRevenue = roomTypeBreakdown.reduce((sum, item) => sum + item.revenue, 0)
  const totalBookings = roomTypeBreakdown.reduce((sum, item) => sum + item.bookings, 0)
  const avgRevenuePerBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0

  return (
    <DialogAdapter open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ChartBar size={16} className="mr-2" />
          Revenue Breakdown
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChartBar size={24} />
            Revenue Breakdown Analysis
          </DialogTitle>
          <DialogDescription>
            Detailed revenue analysis by room type and rate plan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>

              <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="room-type">By Room Type</SelectItem>
                  <SelectItem value="rate-plan">By Rate Plan</SelectItem>
                  <SelectItem value="both">Combined View</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 border-l-4 border-l-primary">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
                <CurrencyDollar size={20} className="text-primary" />
              </div>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            </Card>

            <Card className="p-4 border-l-4 border-l-accent">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Total Bookings</h3>
                <Buildings size={20} className="text-accent" />
              </div>
              <p className="text-2xl font-bold">{totalBookings}</p>
            </Card>

            <Card className="p-4 border-l-4 border-l-secondary">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Avg per Booking</h3>
                <TrendUp size={20} className="text-secondary" />
              </div>
              <p className="text-2xl font-bold">{formatCurrency(avgRevenuePerBooking)}</p>
            </Card>
          </div>

          <Tabs defaultValue="chart" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chart">Charts</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="space-y-6">
              {groupBy === 'room-type' && (
                <>
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Revenue by Room Type</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={roomTypeBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="roomType" />
                        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="oklch(0.65 0.22 265)" name="Revenue" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Revenue Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={roomTypeBreakdown}
                          dataKey="revenue"
                          nameKey="roomType"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry) => `${entry.roomType}: ${formatPercent(entry.percentage / 100)}`}
                        >
                          {roomTypeBreakdown.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </>
              )}

              {groupBy === 'rate-plan' && (
                <>
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Revenue by Rate Plan</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={ratePlanBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="ratePlan" />
                        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="oklch(0.55 0.16 220)" name="Revenue" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Rate Plan Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={ratePlanBreakdown}
                          dataKey="revenue"
                          nameKey="ratePlan"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry) => `${entry.ratePlan}: ${formatPercent(entry.percentage / 100)}`}
                        >
                          {ratePlanBreakdown.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </>
              )}

              {groupBy === 'both' && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Combined Room Type & Rate Plan</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={combinedBreakdown.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="roomType"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                      />
                      <Legend />
                      <Bar dataKey="revenue" fill="oklch(0.60 0.18 155)" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="table" className="space-y-4">
              {groupBy === 'room-type' && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Room Type Details</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Room Type</th>
                          <th className="text-right py-3 px-4 font-medium">Revenue</th>
                          <th className="text-right py-3 px-4 font-medium">Bookings</th>
                          <th className="text-right py-3 px-4 font-medium">Avg Rate</th>
                          <th className="text-right py-3 px-4 font-medium">% of Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roomTypeBreakdown.map((item, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium">{item.roomType}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(item.revenue)}</td>
                            <td className="py-3 px-4 text-right">{item.bookings}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(item.avgRate)}</td>
                            <td className="py-3 px-4 text-right">
                              <Badge variant="secondary">{formatPercent(item.percentage / 100)}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {groupBy === 'rate-plan' && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Rate Plan Details</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Rate Plan</th>
                          <th className="text-right py-3 px-4 font-medium">Revenue</th>
                          <th className="text-right py-3 px-4 font-medium">Bookings</th>
                          <th className="text-right py-3 px-4 font-medium">Avg Rate</th>
                          <th className="text-right py-3 px-4 font-medium">% of Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ratePlanBreakdown.map((item, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium">{item.ratePlan}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(item.revenue)}</td>
                            <td className="py-3 px-4 text-right">{item.bookings}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(item.avgRate)}</td>
                            <td className="py-3 px-4 text-right">
                              <Badge variant="secondary">{formatPercent(item.percentage / 100)}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {groupBy === 'both' && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Combined View Details</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Room Type</th>
                          <th className="text-left py-3 px-4 font-medium">Rate Plan</th>
                          <th className="text-right py-3 px-4 font-medium">Revenue</th>
                          <th className="text-right py-3 px-4 font-medium">Bookings</th>
                          <th className="text-right py-3 px-4 font-medium">Avg Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {combinedBreakdown.map((item, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4 font-medium">{item.roomType}</td>
                            <td className="py-3 px-4">{item.ratePlan}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(item.revenue)}</td>
                            <td className="py-3 px-4 text-right">{item.bookings}</td>
                            <td className="py-3 px-4 text-right">{formatCurrency(item.avgRate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </DialogAdapter>
  )
}
