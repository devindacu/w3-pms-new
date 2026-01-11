import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  ChartBar,
  Bed,
  Users,
  CurrencyDollar,
  Package,
  ChefHat,
  Broom,
  Receipt,
  TrendUp,
  TrendDown,
  Buildings,
  ArrowsCounterClockwise,
  Globe
} from '@phosphor-icons/react'
import { formatCurrency, formatPercent } from '@/lib/helpers'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { AnalyticsDateFilter, type DateRange } from '@/components/AnalyticsDateFilter'
import { PercentageChangeIndicator } from '@/components/PercentageChangeIndicator'
import { GoogleAnalyticsDashboard } from '@/components/GoogleAnalyticsDashboard'
import { EmailTemplateAnalyticsComponent } from '@/components/EmailTemplateAnalytics'
import type {
  Room,
  Reservation,
  Guest,
  GuestProfile,
  Order,
  FoodItem,
  Supplier,
  GoodsReceivedNote,
  Recipe,
  Menu,
  KitchenConsumptionLog,
  PurchaseOrder,
  Employee,
  HousekeepingTask,
  GuestInvoice,
  Payment,
  Expense,
  Folio,
  InventoryItem,
  GuestComplaint,
  GuestFeedback,
  ChannelReservation,
  ChannelPerformance,
  MaintenanceRequest,
  EmailTemplateAnalytics,
  EmailSentRecord,
  EmailCampaignAnalytics
} from '@/lib/types'

interface AnalyticsProps {
  rooms: Room[]
  reservations: Reservation[]
  guests: Guest[]
  guestProfiles: GuestProfile[]
  orders: Order[]
  foodItems: FoodItem[]
  suppliers: Supplier[]
  grns: GoodsReceivedNote[]
  recipes: Recipe[]
  menus: Menu[]
  consumptionLogs: KitchenConsumptionLog[]
  purchaseOrders: PurchaseOrder[]
  employees: Employee[]
  housekeepingTasks: HousekeepingTask[]
  guestInvoices: GuestInvoice[]
  payments: Payment[]
  expenses: Expense[]
  folios: Folio[]
  inventory: InventoryItem[]
  complaints: GuestComplaint[]
  guestFeedback: GuestFeedback[]
  channelReservations: ChannelReservation[]
  channelPerformance: ChannelPerformance[]
  maintenanceRequests: MaintenanceRequest[]
  emailAnalytics: EmailTemplateAnalytics[]
  campaignAnalytics: EmailCampaignAnalytics[]
  emailRecords: EmailSentRecord[]
}

const CHART_COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444']

const isWithinDateRange = (timestamp: number, range: DateRange): boolean => {
  const date = new Date(timestamp)
  date.setHours(0, 0, 0, 0)
  const from = new Date(range.from)
  from.setHours(0, 0, 0, 0)
  const to = new Date(range.to)
  to.setHours(23, 59, 59, 999)
  return date >= from && date <= to
}

const getPreviousPeriodRange = (range: DateRange): DateRange => {
  const periodLength = range.to.getTime() - range.from.getTime()
  return {
    from: new Date(range.from.getTime() - periodLength),
    to: new Date(range.from.getTime() - 1)
  }
}

const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export function Analytics(props: AnalyticsProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  })
  const [comparisonEnabled, setComparisonEnabled] = useState(false)

  const filteredData = useMemo(() => {
    return {
      reservations: props.reservations.filter(r => isWithinDateRange(r.checkInDate, dateRange)),
      guestInvoices: props.guestInvoices.filter(inv => isWithinDateRange(inv.invoiceDate, dateRange)),
      payments: props.payments.filter(p => isWithinDateRange(p.processedAt, dateRange)),
      orders: props.orders.filter(o => isWithinDateRange(o.createdAt, dateRange)),
      expenses: props.expenses.filter(e => isWithinDateRange(e.expenseDate, dateRange)),
      housekeepingTasks: props.housekeepingTasks.filter(t => isWithinDateRange(t.createdAt, dateRange)),
      complaints: props.complaints.filter(c => isWithinDateRange(c.reportedAt, dateRange)),
      guestFeedback: props.guestFeedback.filter(f => isWithinDateRange(f.submittedAt, dateRange)),
      channelReservations: props.channelReservations.filter(r => isWithinDateRange(r.checkInDate, dateRange))
    }
  }, [props, dateRange])

  const previousPeriodRange = useMemo(() => getPreviousPeriodRange(dateRange), [dateRange])

  const previousPeriodData = useMemo(() => {
    if (!comparisonEnabled) return null
    return {
      reservations: props.reservations.filter(r => isWithinDateRange(r.checkInDate, previousPeriodRange)),
      guestInvoices: props.guestInvoices.filter(inv => isWithinDateRange(inv.invoiceDate, previousPeriodRange)),
      payments: props.payments.filter(p => isWithinDateRange(p.processedAt, previousPeriodRange)),
      orders: props.orders.filter(o => isWithinDateRange(o.createdAt, previousPeriodRange)),
      expenses: props.expenses.filter(e => isWithinDateRange(e.expenseDate, previousPeriodRange)),
      housekeepingTasks: props.housekeepingTasks.filter(t => isWithinDateRange(t.createdAt, previousPeriodRange)),
      complaints: props.complaints.filter(c => isWithinDateRange(c.reportedAt, previousPeriodRange)),
      guestFeedback: props.guestFeedback.filter(f => isWithinDateRange(f.submittedAt, previousPeriodRange)),
      channelReservations: props.channelReservations.filter(r => isWithinDateRange(r.checkInDate, previousPeriodRange))
    }
  }, [props, previousPeriodRange, comparisonEnabled])

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange)
  }

  const handleReset = () => {
    setDateRange({
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date()
    })
  }

  const getOccupancyData = () => {
    const occupiedRooms = props.rooms.filter(r => r.status.includes('occupied')).length
    const totalRooms = props.rooms.length
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0

    return {
      occupiedRooms,
      totalRooms,
      occupancyRate,
      vacantClean: props.rooms.filter(r => r.status === 'vacant-clean').length,
      vacantDirty: props.rooms.filter(r => r.status === 'vacant-dirty').length,
      maintenance: props.rooms.filter(r => r.status === 'maintenance').length
    }
  }

  const getRevenueData = (data = filteredData) => {
    const totalRevenue = data.guestInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0)
    const paidRevenue = data.payments.reduce((sum, p) => sum + p.amount, 0)
    const pendingRevenue = data.guestInvoices.reduce((sum, inv) => sum + inv.amountDue, 0)
    const roomRevenue = totalRevenue * 0.6
    const fnbRevenue = data.orders.reduce((sum, o) => sum + o.total, 0)
    
    return {
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      roomRevenue,
      fnbRevenue,
      otherRevenue: totalRevenue - roomRevenue - fnbRevenue
    }
  }

  const getGuestData = (data = filteredData) => {
    const totalGuests = props.guests.length
    const activeReservations = data.reservations.filter(r => r.status === 'checked-in').length
    const upcomingReservations = data.reservations.filter(r => r.status === 'confirmed').length
    const avgStayDuration = data.reservations.length > 0
      ? data.reservations.reduce((sum, r) => sum + Math.ceil((r.checkOutDate - r.checkInDate) / (1000 * 60 * 60 * 24)), 0) / data.reservations.length
      : 0

    return {
      totalGuests,
      activeReservations,
      upcomingReservations,
      avgStayDuration,
      complaints: data.complaints.length,
      feedback: data.guestFeedback.length,
      satisfaction: data.guestFeedback.length > 0
        ? data.guestFeedback.reduce((sum, f) => {
            const rating = f.ratings?.roomCleanliness
            return sum + (typeof rating === 'number' ? rating : 0)
          }, 0) / data.guestFeedback.length
        : 0
    }
  }

  const getHousekeepingData = (data = filteredData) => {
    const totalTasks = data.housekeepingTasks.length
    const completedTasks = data.housekeepingTasks.filter(t => t.status === 'completed').length
    const pendingTasks = data.housekeepingTasks.filter(t => t.status === 'pending').length
    const inProgressTasks = data.housekeepingTasks.filter(t => t.status === 'in-progress').length

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    }
  }

  const getFnBData = (data = filteredData) => {
    const totalOrders = data.orders.length
    const completedOrders = data.orders.filter(o => o.status === 'served').length
    const totalRevenue = data.orders.reduce((sum, o) => sum + o.total, 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    return {
      totalOrders,
      completedOrders,
      totalRevenue,
      avgOrderValue,
      recipes: props.recipes.length
    }
  }

  const getInventoryData = () => {
    const totalItems = props.foodItems.length
    const lowStockItems = props.foodItems.filter(f => f.currentStock <= f.reorderLevel).length
    const outOfStockItems = props.foodItems.filter(f => f.currentStock === 0).length
    const totalValue = props.foodItems.reduce((sum, f) => sum + (f.currentStock * f.unitCost), 0)

    return {
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalValue
    }
  }

  const getFinanceData = (data = filteredData) => {
    const totalInvoices = data.guestInvoices.length
    const totalPayments = data.payments.length
    const totalExpenses = data.expenses.length
    const revenue = data.payments.reduce((sum, p) => sum + p.amount, 0)
    const expenseAmount = data.expenses.reduce((sum, e) => sum + e.amount, 0)
    const netProfit = revenue - expenseAmount

    return {
      totalInvoices,
      totalPayments,
      totalExpenses,
      revenue,
      expenseAmount,
      netProfit,
      profitMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0
    }
  }

  const getStaffData = () => {
    const totalEmployees = props.employees.length
    const activeEmployees = props.employees.filter(e => e.status === 'active').length
    const departments = Array.from(new Set(props.employees.map(e => e.department)))

    return {
      totalEmployees,
      activeEmployees,
      departments: departments.length
    }
  }

  const occupancyData = getOccupancyData()
  const revenueData = getRevenueData()
  const guestData = getGuestData()
  const housekeepingData = getHousekeepingData()
  const fnbData = getFnBData()
  const inventoryData = getInventoryData()
  const financeData = getFinanceData()
  const staffData = getStaffData()

  const prevRevenueData = previousPeriodData ? getRevenueData(previousPeriodData) : null
  const prevGuestData = previousPeriodData ? getGuestData(previousPeriodData) : null
  const prevHousekeepingData = previousPeriodData ? getHousekeepingData(previousPeriodData) : null
  const prevFnBData = previousPeriodData ? getFnBData(previousPeriodData) : null
  const prevFinanceData = previousPeriodData ? getFinanceData(previousPeriodData) : null

  const revenueChartData = [
    { name: 'Room Revenue', value: revenueData.roomRevenue },
    { name: 'F&B Revenue', value: revenueData.fnbRevenue },
    { name: 'Other Revenue', value: revenueData.otherRevenue }
  ]

  const occupancyChartData = [
    { name: 'Occupied', value: occupancyData.occupiedRooms },
    { name: 'Vacant Clean', value: occupancyData.vacantClean },
    { name: 'Vacant Dirty', value: occupancyData.vacantDirty },
    { name: 'Maintenance', value: occupancyData.maintenance }
  ]

  const monthlyRevenueData = (() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map((month, index) => {
      const monthRevenue = filteredData.guestInvoices
        .filter(inv => new Date(inv.invoiceDate).getMonth() === index)
        .reduce((sum, inv) => sum + inv.grandTotal, 0)
      
      const prevMonthRevenue = previousPeriodData 
        ? previousPeriodData.guestInvoices
          .filter(inv => new Date(inv.invoiceDate).getMonth() === index)
          .reduce((sum, inv) => sum + inv.grandTotal, 0)
        : 0

      return { 
        month, 
        current: monthRevenue,
        previous: prevMonthRevenue 
      }
    })
  })()

  const ComparisonCard = ({ 
    title, 
    currentValue, 
    previousValue, 
    icon, 
    formatter = (v: number) => v.toString(),
    borderColor = 'border-l-primary',
    iconColor = 'text-primary'
  }: {
    title: string
    currentValue: number
    previousValue?: number
    icon: React.ReactNode
    formatter?: (value: number) => string
    borderColor?: string
    iconColor?: string
  }) => {
    return (
      <Card className={`p-6 border-l-4 ${borderColor}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className={iconColor}>{icon}</div>
        </div>
        <p className="text-3xl font-semibold">{formatter(currentValue)}</p>
        {comparisonEnabled && previousValue !== undefined && (
          <div className="mt-2 flex items-center gap-2">
            <PercentageChangeIndicator current={currentValue} previous={previousValue} size="sm" />
            <span className="text-xs text-muted-foreground">
              vs prev: {formatter(previousValue)}
            </span>
          </div>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Comprehensive analytics across all hotel operations</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-lg border">
        <AnalyticsDateFilter
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          onReset={handleReset}
          className="flex-1"
        />
        
        <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-lg">
          <ArrowsCounterClockwise size={20} className="text-primary" />
          <div className="flex items-center gap-2">
            <Switch
              id="comparison-mode"
              checked={comparisonEnabled}
              onCheckedChange={setComparisonEnabled}
            />
            <Label htmlFor="comparison-mode" className="text-sm font-medium cursor-pointer">
              Compare with Previous Period
            </Label>
          </div>
        </div>
      </div>

      {comparisonEnabled && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <ArrowsCounterClockwise size={24} className="text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Comparison Mode Enabled</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Current Period: {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Previous Period: {previousPeriodRange.from.toLocaleDateString()} - {previousPeriodRange.to.toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-11">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="guests">Guests</TabsTrigger>
          <TabsTrigger value="housekeeping">Housekeeping</TabsTrigger>
          <TabsTrigger value="fnb">F&B</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="google-analytics" className="gap-1">
            <Globe size={16} />
            <span className="hidden lg:inline">Google</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 border-l-4 border-l-primary">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Occupancy Rate</h3>
                <Bed size={20} className="text-primary" />
              </div>
              <p className="text-3xl font-semibold">{occupancyData.occupancyRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground mt-1">{occupancyData.occupiedRooms} / {occupancyData.totalRooms} rooms</p>
            </Card>

            <ComparisonCard
              title="Total Revenue"
              currentValue={revenueData.totalRevenue}
              previousValue={prevRevenueData?.totalRevenue}
              icon={<CurrencyDollar size={20} />}
              formatter={formatCurrency}
              borderColor="border-l-accent"
              iconColor="text-accent"
            />

            <ComparisonCard
              title="Active Guests"
              currentValue={guestData.activeReservations}
              previousValue={prevGuestData?.activeReservations}
              icon={<Users size={20} />}
              borderColor="border-l-success"
              iconColor="text-success"
            />

            <ComparisonCard
              title="Net Profit"
              currentValue={financeData.netProfit}
              previousValue={prevFinanceData?.netProfit}
              icon={<TrendUp size={20} />}
              formatter={formatCurrency}
              borderColor="border-l-secondary"
              iconColor="text-secondary"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {revenueChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Room Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={occupancyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Monthly Revenue Trend
              {comparisonEnabled && <span className="text-sm font-normal text-muted-foreground ml-2">(Current vs Previous Period)</span>}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              {comparisonEnabled ? (
                <ComposedChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="previous" 
                    name="Previous Period"
                    stroke="#94a3b8" 
                    fill="#94a3b8" 
                    fillOpacity={0.3} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="current" 
                    name="Current Period"
                    stroke="#8B5CF6" 
                    fill="#8B5CF6" 
                    fillOpacity={0.6} 
                  />
                </ComposedChart>
              ) : (
                <AreaChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Area type="monotone" dataKey="current" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Rooms</h3>
              <p className="text-3xl font-semibold">{occupancyData.totalRooms}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Occupied Rooms</h3>
              <p className="text-3xl font-semibold text-primary">{occupancyData.occupiedRooms}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Occupancy Rate</h3>
              <p className="text-3xl font-semibold text-accent">{occupancyData.occupancyRate.toFixed(1)}%</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Room Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={occupancyChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {occupancyChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Room Type Analytics</h3>
              <div className="space-y-3">
                {Array.from(new Set(props.rooms.map(r => r.roomType))).map((type) => {
                  const typeRooms = props.rooms.filter(r => r.roomType === type)
                  const occupied = typeRooms.filter(r => r.status.includes('occupied')).length
                  const total = typeRooms.length
                  const rate = total > 0 ? (occupied / total) * 100 : 0
                  
                  return (
                    <div key={type} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize">{type}</span>
                        <Badge variant={rate > 80 ? "default" : rate > 50 ? "secondary" : "outline"}>
                          {rate.toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{occupied} / {total} rooms</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Room Status Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Vacant Clean</p>
                <p className="text-2xl font-semibold mt-1 text-success">{occupancyData.vacantClean}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Vacant Dirty</p>
                <p className="text-2xl font-semibold mt-1 text-destructive">{occupancyData.vacantDirty}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Under Maintenance</p>
                <p className="text-2xl font-semibold mt-1 text-accent">{occupancyData.maintenance}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-semibold mt-1 text-primary">{occupancyData.vacantClean}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Daily Occupancy Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={(() => {
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                  const date = new Date()
                  date.setDate(date.getDate() - (6 - i))
                  const dayReservations = filteredData.reservations.filter(r => {
                    const checkIn = new Date(r.checkInDate)
                    const checkOut = new Date(r.checkOutDate)
                    return checkIn <= date && checkOut >= date && r.status === 'checked-in'
                  })
                  return {
                    date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    occupied: dayReservations.length,
                    rate: occupancyData.totalRooms > 0 ? (dayReservations.length / occupancyData.totalRooms) * 100 : 0
                  }
                })
                return last7Days
              })()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => typeof value === 'number' ? value.toFixed(1) : value} />
                <Legend />
                <Area type="monotone" dataKey="occupied" name="Occupied Rooms" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Room Rate vs Occupancy (Scatter Plot)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="rate" 
                    name="Occupancy Rate" 
                    unit="%" 
                    domain={[0, 100]}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="avgRate" 
                    name="Avg Rate" 
                    tickFormatter={(value) => `$${value}`}
                  />
                  <ZAxis range={[100, 400]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value: any, name: string) => {
                      if (name === 'avgRate') return formatCurrency(value)
                      if (name === 'rate') return `${value.toFixed(1)}%`
                      return value
                    }}
                  />
                  <Legend />
                  <Scatter 
                    name="Room Types" 
                    data={Array.from(new Set(props.rooms.map(r => r.roomType))).map((type) => {
                      const typeRooms = props.rooms.filter(r => r.roomType === type)
                      const occupied = typeRooms.filter(r => r.status.includes('occupied')).length
                      const total = typeRooms.length
                      const rate = total > 0 ? (occupied / total) * 100 : 0
                      const avgRate = 150 + Math.random() * 200
                      return { type, rate, avgRate, rooms: total }
                    })}
                    fill={CHART_COLORS[0]} 
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Weekly Occupancy Heat Map</h3>
              <div className="space-y-2">
                {(() => {
                  const last7Days = Array.from({ length: 7 }, (_, i) => {
                    const date = new Date()
                    date.setDate(date.getDate() - (6 - i))
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
                    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
                      const checkInHour = filteredData.reservations.filter(r => {
                        const checkIn = new Date(r.checkInDate)
                        return checkIn.toDateString() === date.toDateString() && 
                               checkIn.getHours() === hour
                      }).length
                      return checkInHour
                    })
                    const maxCheckIns = Math.max(...hourlyData, 1)
                    return { dayName, hourlyData, maxCheckIns }
                  })
                  
                  return last7Days.map(({ dayName, hourlyData, maxCheckIns }) => (
                    <div key={dayName} className="flex items-center gap-2">
                      <span className="text-xs w-20 text-muted-foreground">{dayName.slice(0, 3)}</span>
                      <div className="flex gap-0.5 flex-1">
                        {hourlyData.map((count, hour) => {
                          const intensity = maxCheckIns > 0 ? count / maxCheckIns : 0
                          const bgColor = intensity === 0 ? 'bg-muted' : 
                                        intensity < 0.33 ? 'bg-primary/30' :
                                        intensity < 0.66 ? 'bg-primary/60' : 'bg-primary'
                          return (
                            <div 
                              key={hour}
                              className={`h-6 flex-1 rounded-sm ${bgColor} hover:ring-1 hover:ring-primary cursor-pointer transition-all`}
                              title={`${dayName} ${hour}:00 - ${count} check-ins`}
                            />
                          )
                        })}
                      </div>
                    </div>
                  ))
                })()}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                  <span className="text-xs text-muted-foreground">Activity:</span>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-muted rounded-sm" />
                    <span className="text-xs">None</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-primary/30 rounded-sm" />
                    <span className="text-xs">Low</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-primary/60 rounded-sm" />
                    <span className="text-xs">Medium</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-primary rounded-sm" />
                    <span className="text-xs">High</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ComparisonCard
              title="Total Revenue"
              currentValue={revenueData.totalRevenue}
              previousValue={prevRevenueData?.totalRevenue}
              icon={<CurrencyDollar size={20} />}
              formatter={formatCurrency}
              borderColor="border-l-primary"
              iconColor="text-primary"
            />
            <ComparisonCard
              title="Paid Revenue"
              currentValue={revenueData.paidRevenue}
              previousValue={prevRevenueData?.paidRevenue}
              icon={<Receipt size={20} />}
              formatter={formatCurrency}
              borderColor="border-l-success"
              iconColor="text-success"
            />
            <ComparisonCard
              title="Pending Revenue"
              currentValue={revenueData.pendingRevenue}
              previousValue={prevRevenueData?.pendingRevenue}
              icon={<Receipt size={20} />}
              formatter={formatCurrency}
              borderColor="border-l-destructive"
              iconColor="text-destructive"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ComparisonCard
              title="Room Revenue"
              currentValue={revenueData.roomRevenue}
              previousValue={prevRevenueData?.roomRevenue}
              icon={<Bed size={20} />}
              formatter={formatCurrency}
            />
            <ComparisonCard
              title="F&B Revenue"
              currentValue={revenueData.fnbRevenue}
              previousValue={prevRevenueData?.fnbRevenue}
              icon={<ChefHat size={20} />}
              formatter={formatCurrency}
            />
            <ComparisonCard
              title="Other Revenue"
              currentValue={revenueData.otherRevenue}
              previousValue={prevRevenueData?.otherRevenue}
              icon={<Buildings size={20} />}
              formatter={formatCurrency}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue by Source</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                  >
                    {revenueChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue Performance</h3>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Collection Rate</span>
                    <Badge variant="default">
                      {revenueData.totalRevenue > 0 ? formatPercent(revenueData.paidRevenue / revenueData.totalRevenue) : '0%'}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-success h-2 rounded-full" 
                      style={{ width: `${revenueData.totalRevenue > 0 ? (revenueData.paidRevenue / revenueData.totalRevenue) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Room Revenue Share</span>
                    <Badge variant="secondary">
                      {revenueData.totalRevenue > 0 ? formatPercent(revenueData.roomRevenue / revenueData.totalRevenue) : '0%'}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${revenueData.totalRevenue > 0 ? (revenueData.roomRevenue / revenueData.totalRevenue) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">F&B Revenue Share</span>
                    <Badge variant="outline">
                      {revenueData.totalRevenue > 0 ? formatPercent(revenueData.fnbRevenue / revenueData.totalRevenue) : '0%'}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-accent h-2 rounded-full" 
                      style={{ width: `${revenueData.totalRevenue > 0 ? (revenueData.fnbRevenue / revenueData.totalRevenue) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Daily Revenue Trend (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={(() => {
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                  const date = new Date()
                  date.setDate(date.getDate() - (6 - i))
                  const dayInvoices = filteredData.guestInvoices.filter(inv => {
                    const invDate = new Date(inv.invoiceDate)
                    return invDate.toDateString() === date.toDateString()
                  })
                  const dayPayments = filteredData.payments.filter(p => {
                    const payDate = new Date(p.processedAt)
                    return payDate.toDateString() === date.toDateString()
                  })
                  return {
                    date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    invoiced: dayInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0),
                    collected: dayPayments.reduce((sum, p) => sum + p.amount, 0)
                  }
                })
                return last7Days
              })()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Area type="monotone" dataKey="invoiced" name="Invoiced" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="collected" name="Collected" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue Performance Radar</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={[
                  { 
                    metric: 'Room Revenue', 
                    value: revenueData.totalRevenue > 0 ? (revenueData.roomRevenue / revenueData.totalRevenue) * 100 : 0,
                    fullMark: 100 
                  },
                  { 
                    metric: 'F&B Revenue', 
                    value: revenueData.totalRevenue > 0 ? (revenueData.fnbRevenue / revenueData.totalRevenue) * 100 : 0,
                    fullMark: 100 
                  },
                  { 
                    metric: 'Collection Rate', 
                    value: revenueData.totalRevenue > 0 ? (revenueData.paidRevenue / revenueData.totalRevenue) * 100 : 0,
                    fullMark: 100 
                  },
                  { 
                    metric: 'Occupancy', 
                    value: occupancyData.occupancyRate,
                    fullMark: 100 
                  },
                  { 
                    metric: 'Profit Margin', 
                    value: Math.min(financeData.profitMargin * 2, 100),
                    fullMark: 100 
                  }
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Performance" dataKey="value" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.6} />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue vs Payment Scatter</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="invoiced" 
                    name="Invoiced" 
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="collected" 
                    name="Collected"
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <ZAxis range={[50, 200]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value: any) => formatCurrency(value)}
                  />
                  <Legend />
                  <Scatter 
                    name="Daily Performance" 
                    data={Array.from({ length: 7 }, (_, i) => {
                      const date = new Date()
                      date.setDate(date.getDate() - (6 - i))
                      const dayInvoices = filteredData.guestInvoices.filter(inv => {
                        const invDate = new Date(inv.invoiceDate)
                        return invDate.toDateString() === date.toDateString()
                      })
                      const dayPayments = filteredData.payments.filter(p => {
                        const payDate = new Date(p.processedAt)
                        return payDate.toDateString() === date.toDateString()
                      })
                      return {
                        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                        invoiced: dayInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0),
                        collected: dayPayments.reduce((sum, p) => sum + p.amount, 0)
                      }
                    })}
                    fill={CHART_COLORS[2]} 
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="guests" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Guests</h3>
              <p className="text-3xl font-semibold">{guestData.totalGuests}</p>
            </Card>
            <ComparisonCard
              title="Active Check-ins"
              currentValue={guestData.activeReservations}
              previousValue={prevGuestData?.activeReservations}
              icon={<Users size={20} />}
              borderColor="border-l-primary"
              iconColor="text-primary"
            />
            <ComparisonCard
              title="Avg Stay Duration"
              currentValue={guestData.avgStayDuration}
              previousValue={prevGuestData?.avgStayDuration}
              icon={<Bed size={20} />}
              formatter={(v) => `${v.toFixed(1)} days`}
            />
            <ComparisonCard
              title="Satisfaction"
              currentValue={guestData.satisfaction}
              previousValue={prevGuestData?.satisfaction}
              icon={<TrendUp size={20} />}
              formatter={(v) => `${v.toFixed(1)}/5`}
              borderColor="border-l-accent"
              iconColor="text-accent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ComparisonCard
              title="Complaints"
              currentValue={guestData.complaints}
              previousValue={prevGuestData?.complaints}
              icon={<TrendDown size={20} />}
              borderColor="border-l-destructive"
              iconColor="text-destructive"
            />
            <ComparisonCard
              title="Feedback Received"
              currentValue={guestData.feedback}
              previousValue={prevGuestData?.feedback}
              icon={<Receipt size={20} />}
              borderColor="border-l-success"
              iconColor="text-success"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Reservation Status Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Checked In', value: filteredData.reservations.filter(r => r.status === 'checked-in').length },
                      { name: 'Confirmed', value: filteredData.reservations.filter(r => r.status === 'confirmed').length },
                      { name: 'Checked Out', value: filteredData.reservations.filter(r => r.status === 'checked-out').length },
                      { name: 'Cancelled', value: filteredData.reservations.filter(r => r.status === 'cancelled').length },
                      { name: 'No Show', value: filteredData.reservations.filter(r => r.status === 'no-show').length }
                    ].filter(item => item.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {CHART_COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Guest Metrics</h3>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Average Stay</p>
                      <p className="text-2xl font-semibold mt-1">{guestData.avgStayDuration.toFixed(1)} days</p>
                    </div>
                    <Bed size={32} className="text-primary" />
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Reservations</p>
                      <p className="text-2xl font-semibold mt-1">{filteredData.reservations.length}</p>
                    </div>
                    <Receipt size={32} className="text-accent" />
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Guest Satisfaction</p>
                      <p className="text-2xl font-semibold mt-1">{guestData.satisfaction.toFixed(1)}/5.0</p>
                    </div>
                    <TrendUp size={32} className="text-success" />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Daily Arrivals & Departures (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={(() => {
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                  const date = new Date()
                  date.setDate(date.getDate() - (6 - i))
                  const arrivals = filteredData.reservations.filter(r => {
                    const checkIn = new Date(r.checkInDate)
                    return checkIn.toDateString() === date.toDateString()
                  }).length
                  const departures = filteredData.reservations.filter(r => {
                    const checkOut = new Date(r.checkOutDate)
                    return checkOut.toDateString() === date.toDateString()
                  }).length
                  return {
                    date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    arrivals,
                    departures
                  }
                })
                return last7Days
              })()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="arrivals" name="Arrivals" fill="#8B5CF6" />
                <Bar dataKey="departures" name="Departures" fill="#06B6D4" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Guest Satisfaction Radar</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={(() => {
                  const metrics = [
                    { category: 'Room Cleanliness', rating: 0, count: 0 },
                    { category: 'Staff Service', rating: 0, count: 0 },
                    { category: 'Room Comfort', rating: 0, count: 0 },
                    { category: 'Value', rating: 0, count: 0 },
                    { category: 'Food Quality', rating: 0, count: 0 }
                  ]
                  
                  filteredData.guestFeedback.forEach(feedback => {
                    if (feedback.ratings?.roomCleanliness) {
                      metrics[0].rating += feedback.ratings.roomCleanliness
                      metrics[0].count++
                    }
                    if (feedback.ratings?.staffService) {
                      metrics[1].rating += feedback.ratings.staffService
                      metrics[1].count++
                    }
                    if (feedback.ratings?.roomComfort) {
                      metrics[2].rating += feedback.ratings.roomComfort
                      metrics[2].count++
                    }
                    if (feedback.ratings?.valueForMoney) {
                      metrics[3].rating += feedback.ratings.valueForMoney
                      metrics[3].count++
                    }
                    if (feedback.ratings?.foodQuality) {
                      metrics[4].rating += feedback.ratings.foodQuality
                      metrics[4].count++
                    }
                  })
                  
                  return metrics.map(m => ({
                    category: m.category,
                    value: m.count > 0 ? (m.rating / m.count) * 20 : 0,
                    fullMark: 100
                  }))
                })()}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Satisfaction" dataKey="value" stroke={CHART_COLORS[2]} fill={CHART_COLORS[2]} fillOpacity={0.6} />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Stay Duration Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="nights" 
                    name="Nights" 
                  />
                  <YAxis 
                    type="number" 
                    dataKey="totalSpent" 
                    name="Total Spent"
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <ZAxis range={[50, 300]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value: any, name: string) => {
                      if (name === 'totalSpent') return formatCurrency(value)
                      return value
                    }}
                  />
                  <Legend />
                  <Scatter 
                    name="Guest Stays" 
                    data={filteredData.reservations.map(r => {
                      const nights = Math.ceil((r.checkOutDate - r.checkInDate) / (1000 * 60 * 60 * 24))
                      const invoice = filteredData.guestInvoices.find(inv => 
                        inv.reservationIds && inv.reservationIds.includes(r.id)
                      )
                      return {
                        nights,
                        totalSpent: invoice?.grandTotal || 0
                      }
                    }).filter(d => d.totalSpent > 0)}
                    fill={CHART_COLORS[3]} 
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="housekeeping" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ComparisonCard
              title="Total Tasks"
              currentValue={housekeepingData.totalTasks}
              previousValue={prevHousekeepingData?.totalTasks}
              icon={<Broom size={20} />}
            />
            <ComparisonCard
              title="Completed"
              currentValue={housekeepingData.completedTasks}
              previousValue={prevHousekeepingData?.completedTasks}
              icon={<TrendUp size={20} />}
              borderColor="border-l-success"
              iconColor="text-success"
            />
            <ComparisonCard
              title="In Progress"
              currentValue={housekeepingData.inProgressTasks}
              previousValue={prevHousekeepingData?.inProgressTasks}
              icon={<ChartBar size={20} />}
              borderColor="border-l-primary"
              iconColor="text-primary"
            />
            <ComparisonCard
              title="Completion Rate"
              currentValue={housekeepingData.completionRate}
              previousValue={prevHousekeepingData?.completionRate}
              icon={<TrendUp size={20} />}
              formatter={(v) => `${v.toFixed(1)}%`}
              borderColor="border-l-accent"
              iconColor="text-accent"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Task Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: housekeepingData.completedTasks },
                      { name: 'In Progress', value: housekeepingData.inProgressTasks },
                      { name: 'Pending', value: housekeepingData.pendingTasks }
                    ].filter(item => item.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {CHART_COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                    <Badge variant={housekeepingData.completionRate > 80 ? "default" : housekeepingData.completionRate > 60 ? "secondary" : "destructive"}>
                      {housekeepingData.completionRate.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-success h-2 rounded-full" 
                      style={{ width: `${housekeepingData.completionRate}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Tasks per Day</p>
                      <p className="text-2xl font-semibold mt-1">
                        {(housekeepingData.totalTasks / 7).toFixed(1)}
                      </p>
                    </div>
                    <ChartBar size={32} className="text-primary" />
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Tasks</p>
                      <p className="text-2xl font-semibold mt-1 text-destructive">{housekeepingData.pendingTasks}</p>
                    </div>
                    <TrendDown size={32} className="text-destructive" />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Daily Task Completion (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={(() => {
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                  const date = new Date()
                  date.setDate(date.getDate() - (6 - i))
                  const dayTasks = filteredData.housekeepingTasks.filter(t => {
                    const taskDate = new Date(t.createdAt)
                    return taskDate.toDateString() === date.toDateString()
                  })
                  return {
                    date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    completed: dayTasks.filter(t => t.status === 'completed').length,
                    inProgress: dayTasks.filter(t => t.status === 'in-progress').length,
                    pending: dayTasks.filter(t => t.status === 'pending').length
                  }
                })
                return last7Days
              })()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" name="Completed" fill="#10B981" stackId="a" />
                <Bar dataKey="inProgress" name="In Progress" fill="#8B5CF6" stackId="a" />
                <Bar dataKey="pending" name="Pending" fill="#EF4444" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="fnb" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ComparisonCard
              title="Total Orders"
              currentValue={fnbData.totalOrders}
              previousValue={prevFnBData?.totalOrders}
              icon={<Receipt size={20} />}
            />
            <ComparisonCard
              title="Total Revenue"
              currentValue={fnbData.totalRevenue}
              previousValue={prevFnBData?.totalRevenue}
              icon={<CurrencyDollar size={20} />}
              formatter={formatCurrency}
            />
            <ComparisonCard
              title="Avg Order Value"
              currentValue={fnbData.avgOrderValue}
              previousValue={prevFnBData?.avgOrderValue}
              icon={<ChartBar size={20} />}
              formatter={formatCurrency}
            />
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Recipes</h3>
              <p className="text-3xl font-semibold">{fnbData.recipes}</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Order Type Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Dine-in', value: filteredData.orders.filter(o => o.type === 'dine-in').length },
                      { name: 'Room Service', value: filteredData.orders.filter(o => o.type === 'room-service').length },
                      { name: 'Takeaway', value: filteredData.orders.filter(o => o.type === 'takeaway').length }
                    ].filter(item => item.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {CHART_COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">F&B Performance Metrics</h3>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Order Completion Rate</p>
                      <p className="text-2xl font-semibold mt-1">
                        {fnbData.totalOrders > 0 ? formatPercent(fnbData.completedOrders / fnbData.totalOrders) : '0%'}
                      </p>
                    </div>
                    <TrendUp size={32} className="text-success" />
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div 
                      className="bg-success h-2 rounded-full" 
                      style={{ width: `${fnbData.totalOrders > 0 ? (fnbData.completedOrders / fnbData.totalOrders) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Average Order Value</p>
                      <p className="text-2xl font-semibold mt-1">{formatCurrency(fnbData.avgOrderValue)}</p>
                    </div>
                    <ChartBar size={32} className="text-primary" />
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Menus</p>
                      <p className="text-2xl font-semibold mt-1">{props.menus.length}</p>
                    </div>
                    <ChefHat size={32} className="text-accent" />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Daily F&B Revenue (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={(() => {
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                  const date = new Date()
                  date.setDate(date.getDate() - (6 - i))
                  const dayOrders = filteredData.orders.filter(o => {
                    const orderDate = new Date(o.createdAt)
                    return orderDate.toDateString() === date.toDateString()
                  })
                  return {
                    date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
                    orders: dayOrders.length
                  }
                })
                return last7Days
              })()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value, name) => name === 'revenue' ? formatCurrency(Number(value)) : value} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                <Area yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Order Value vs Frequency</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="orderCount" 
                    name="Order Count" 
                  />
                  <YAxis 
                    type="number" 
                    dataKey="avgValue" 
                    name="Avg Value"
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <ZAxis range={[50, 300]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value: any, name: string) => {
                      if (name === 'avgValue') return formatCurrency(value)
                      return value
                    }}
                  />
                  <Legend />
                  <Scatter 
                    name="Order Types" 
                    data={[
                      { type: 'Dine-in', orders: filteredData.orders.filter(o => o.type === 'dine-in') },
                      { type: 'Room Service', orders: filteredData.orders.filter(o => o.type === 'room-service') },
                      { type: 'Takeaway', orders: filteredData.orders.filter(o => o.type === 'takeaway') }
                    ].map(({ type, orders }) => ({
                      type,
                      orderCount: orders.length,
                      avgValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0
                    }))}
                    fill={CHART_COLORS[1]} 
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">F&B Performance Radar</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={[
                  { 
                    metric: 'Order Volume', 
                    value: Math.min((fnbData.totalOrders / 50) * 100, 100),
                    fullMark: 100 
                  },
                  { 
                    metric: 'Revenue', 
                    value: Math.min((fnbData.totalRevenue / 10000) * 100, 100),
                    fullMark: 100 
                  },
                  { 
                    metric: 'Avg Order Value', 
                    value: Math.min((fnbData.avgOrderValue / 100) * 100, 100),
                    fullMark: 100 
                  },
                  { 
                    metric: 'Completion Rate', 
                    value: fnbData.totalOrders > 0 ? (fnbData.completedOrders / fnbData.totalOrders) * 100 : 0,
                    fullMark: 100 
                  },
                  { 
                    metric: 'Menu Coverage', 
                    value: Math.min((fnbData.recipes / 50) * 100, 100),
                    fullMark: 100 
                  }
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Performance" dataKey="value" stroke={CHART_COLORS[3]} fill={CHART_COLORS[3]} fillOpacity={0.6} />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Hourly Order Heat Map</h3>
            <div className="space-y-2">
              {(() => {
                const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                
                return daysOfWeek.map((dayName) => {
                  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
                    const orderCount = filteredData.orders.filter(o => {
                      const orderDate = new Date(o.createdAt)
                      const orderDay = orderDate.toLocaleDateString('en-US', { weekday: 'long' })
                      return orderDay === dayName && orderDate.getHours() === hour
                    }).length
                    return orderCount
                  })
                  const maxOrders = Math.max(...hourlyData, 1)
                  
                  return (
                    <div key={dayName} className="flex items-center gap-2">
                      <span className="text-xs w-20 text-muted-foreground">{dayName.slice(0, 3)}</span>
                      <div className="flex gap-0.5 flex-1">
                        {hourlyData.map((count, hour) => {
                          const intensity = maxOrders > 0 ? count / maxOrders : 0
                          const bgColor = intensity === 0 ? 'bg-muted' : 
                                        intensity < 0.33 ? 'bg-accent/30' :
                                        intensity < 0.66 ? 'bg-accent/60' : 'bg-accent'
                          return (
                            <div 
                              key={hour}
                              className={`h-6 flex-1 rounded-sm ${bgColor} hover:ring-1 hover:ring-accent cursor-pointer transition-all`}
                              title={`${dayName} ${hour}:00 - ${count} orders`}
                            />
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              })()}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                <span className="text-xs text-muted-foreground">Orders:</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-muted rounded-sm" />
                  <span className="text-xs">None</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-accent/30 rounded-sm" />
                  <span className="text-xs">Low</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-accent/60 rounded-sm" />
                  <span className="text-xs">Medium</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-accent rounded-sm" />
                  <span className="text-xs">High</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Items</h3>
              <p className="text-3xl font-semibold">{inventoryData.totalItems}</p>
            </Card>
            <Card className="p-6 border-l-4 border-l-destructive">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Low Stock</h3>
                <Package size={20} className="text-destructive" />
              </div>
              <p className="text-3xl font-semibold text-destructive">{inventoryData.lowStockItems}</p>
            </Card>
            <Card className="p-6 border-l-4 border-l-destructive">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Out of Stock</h3>
                <TrendDown size={20} className="text-destructive" />
              </div>
              <p className="text-3xl font-semibold text-destructive">{inventoryData.outOfStockItems}</p>
            </Card>
            <Card className="p-6 border-l-4 border-l-primary">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Total Value</h3>
                <CurrencyDollar size={20} className="text-primary" />
              </div>
              <p className="text-3xl font-semibold">{formatCurrency(inventoryData.totalValue)}</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Inventory Stock Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'In Stock', value: inventoryData.totalItems - inventoryData.lowStockItems - inventoryData.outOfStockItems },
                      { name: 'Low Stock', value: inventoryData.lowStockItems },
                      { name: 'Out of Stock', value: inventoryData.outOfStockItems }
                    ].filter(item => item.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {[CHART_COLORS[2], CHART_COLORS[3], CHART_COLORS[4]].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Low Stock Items</h3>
              <div className="space-y-3">
                {props.foodItems
                  .filter(item => item.currentStock <= item.reorderLevel)
                  .slice(0, 5)
                  .map(item => (
                    <div key={item.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{item.name}</span>
                        <Badge variant="destructive">Low Stock</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Current: {item.currentStock} {item.unit}</span>
                        <span>Reorder: {item.reorderLevel} {item.unit}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                        <div 
                          className="bg-destructive h-1.5 rounded-full" 
                          style={{ width: `${(item.currentStock / item.reorderLevel) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                {props.foodItems.filter(item => item.currentStock <= item.reorderLevel).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package size={48} className="mx-auto mb-2 opacity-50" />
                    <p>All items are adequately stocked</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Inventory Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Food Items</h4>
                  <ChefHat size={20} className="text-primary" />
                </div>
                <p className="text-2xl font-semibold">{props.foodItems.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Value: {formatCurrency(props.foodItems.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0))}
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">General Inventory</h4>
                  <Package size={20} className="text-accent" />
                </div>
                <p className="text-2xl font-semibold">{props.inventory.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Low Stock: {props.inventory.filter(i => i.currentStock <= i.reorderLevel).length}
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Suppliers</h4>
                  <Buildings size={20} className="text-secondary" />
                </div>
                <p className="text-2xl font-semibold">{props.suppliers.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Reliable: {props.suppliers.filter(s => s.rating && s.rating >= 4).length}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="finance" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ComparisonCard
              title="Total Revenue"
              currentValue={financeData.revenue}
              previousValue={prevFinanceData?.revenue}
              icon={<CurrencyDollar size={20} />}
              formatter={formatCurrency}
              borderColor="border-l-primary"
              iconColor="text-primary"
            />
            <ComparisonCard
              title="Total Expenses"
              currentValue={financeData.expenseAmount}
              previousValue={prevFinanceData?.expenseAmount}
              icon={<TrendDown size={20} />}
              formatter={formatCurrency}
              borderColor="border-l-destructive"
              iconColor="text-destructive"
            />
            <ComparisonCard
              title="Net Profit"
              currentValue={financeData.netProfit}
              previousValue={prevFinanceData?.netProfit}
              icon={<TrendUp size={20} />}
              formatter={formatCurrency}
              borderColor="border-l-success"
              iconColor="text-success"
            />
            <ComparisonCard
              title="Profit Margin"
              currentValue={financeData.profitMargin}
              previousValue={prevFinanceData?.profitMargin}
              icon={<ChartBar size={20} />}
              formatter={(v) => `${v.toFixed(1)}%`}
              borderColor="border-l-accent"
              iconColor="text-accent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ComparisonCard
              title="Total Invoices"
              currentValue={financeData.totalInvoices}
              previousValue={prevFinanceData?.totalInvoices}
              icon={<Receipt size={20} />}
            />
            <ComparisonCard
              title="Total Payments"
              currentValue={financeData.totalPayments}
              previousValue={prevFinanceData?.totalPayments}
              icon={<CurrencyDollar size={20} />}
            />
            <ComparisonCard
              title="Expense Transactions"
              currentValue={financeData.totalExpenses}
              previousValue={prevFinanceData?.totalExpenses}
              icon={<Receipt size={20} />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue vs Expenses</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { category: 'Revenue', amount: financeData.revenue },
                  { category: 'Expenses', amount: financeData.expenseAmount },
                  { category: 'Net Profit', amount: financeData.netProfit }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="amount" fill="#8B5CF6">
                    {[
                      <Cell key="revenue" fill={CHART_COLORS[0]} />,
                      <Cell key="expenses" fill={CHART_COLORS[4]} />,
                      <Cell key="profit" fill={CHART_COLORS[2]} />
                    ]}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Financial Health</h3>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Profit Margin</span>
                    <Badge variant={financeData.profitMargin > 20 ? "default" : financeData.profitMargin > 10 ? "secondary" : "destructive"}>
                      {financeData.profitMargin.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${financeData.profitMargin > 20 ? 'bg-success' : financeData.profitMargin > 10 ? 'bg-primary' : 'bg-destructive'}`}
                      style={{ width: `${Math.min(financeData.profitMargin * 2, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Expense Ratio</p>
                      <p className="text-2xl font-semibold mt-1">
                        {financeData.revenue > 0 ? formatPercent(financeData.expenseAmount / financeData.revenue) : '0%'}
                      </p>
                    </div>
                    <TrendDown size={32} className="text-destructive" />
                  </div>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Collection Efficiency</p>
                      <p className="text-2xl font-semibold mt-1">
                        {financeData.totalInvoices > 0 ? formatPercent(financeData.totalPayments / financeData.totalInvoices) : '0%'}
                      </p>
                    </div>
                    <TrendUp size={32} className="text-success" />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Daily Financial Summary (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={(() => {
                const last7Days = Array.from({ length: 7 }, (_, i) => {
                  const date = new Date()
                  date.setDate(date.getDate() - (6 - i))
                  const dayPayments = filteredData.payments.filter(p => {
                    const payDate = new Date(p.processedAt)
                    return payDate.toDateString() === date.toDateString()
                  })
                  const dayExpenses = filteredData.expenses.filter(e => {
                    const expDate = new Date(e.expenseDate)
                    return expDate.toDateString() === date.toDateString()
                  })
                  const revenue = dayPayments.reduce((sum, p) => sum + p.amount, 0)
                  const expenses = dayExpenses.reduce((sum, e) => sum + e.amount, 0)
                  return {
                    date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    revenue,
                    expenses,
                    profit: revenue - expenses
                  }
                })
                return last7Days
              })()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#10B981" />
                <Bar dataKey="expenses" name="Expenses" fill="#EF4444" />
                <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#8B5CF6" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Financial Health Radar</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={[
                  { 
                    metric: 'Revenue Growth', 
                    value: prevFinanceData && prevFinanceData.revenue > 0 
                      ? Math.min(Math.max(((financeData.revenue - prevFinanceData.revenue) / prevFinanceData.revenue) * 200 + 50, 0), 100)
                      : 50,
                    fullMark: 100 
                  },
                  { 
                    metric: 'Profit Margin', 
                    value: Math.min(financeData.profitMargin * 2, 100),
                    fullMark: 100 
                  },
                  { 
                    metric: 'Collection Efficiency', 
                    value: financeData.totalInvoices > 0 ? (financeData.totalPayments / financeData.totalInvoices) * 100 : 0,
                    fullMark: 100 
                  },
                  { 
                    metric: 'Expense Control', 
                    value: financeData.revenue > 0 ? Math.max(100 - ((financeData.expenseAmount / financeData.revenue) * 100), 0) : 0,
                    fullMark: 100 
                  },
                  { 
                    metric: 'Cash Flow', 
                    value: Math.min((financeData.netProfit / 1000) * 10, 100),
                    fullMark: 100 
                  }
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Financial Health" dataKey="value" stroke={CHART_COLORS[4]} fill={CHART_COLORS[4]} fillOpacity={0.6} />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue vs Expense Correlation</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="revenue" 
                    name="Revenue" 
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="expenses" 
                    name="Expenses"
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <ZAxis range={[100, 400]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value: any) => formatCurrency(value)}
                  />
                  <Legend />
                  <Scatter 
                    name="Daily Performance" 
                    data={Array.from({ length: 30 }, (_, i) => {
                      const date = new Date()
                      date.setDate(date.getDate() - (29 - i))
                      const dayPayments = props.payments.filter(p => {
                        const payDate = new Date(p.processedAt)
                        return payDate.toDateString() === date.toDateString() && 
                               isWithinDateRange(p.processedAt, dateRange)
                      })
                      const dayExpenses = props.expenses.filter(e => {
                        const expDate = new Date(e.expenseDate)
                        return expDate.toDateString() === date.toDateString() &&
                               isWithinDateRange(e.expenseDate, dateRange)
                      })
                      return {
                        revenue: dayPayments.reduce((sum, p) => sum + p.amount, 0),
                        expenses: dayExpenses.reduce((sum, e) => sum + e.amount, 0)
                      }
                    }).filter(d => d.revenue > 0 || d.expenses > 0)}
                    fill={CHART_COLORS[0]} 
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Employees</h3>
              <p className="text-3xl font-semibold">{staffData.totalEmployees}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Active Employees</h3>
              <p className="text-3xl font-semibold text-success">{staffData.activeEmployees}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Departments</h3>
              <p className="text-3xl font-semibold">{staffData.departments}</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="email" className="mt-6">
          <EmailTemplateAnalyticsComponent
            templateAnalytics={props.emailAnalytics}
            campaignAnalytics={props.campaignAnalytics}
            emailRecords={props.emailRecords}
          />
        </TabsContent>

        <TabsContent value="google-analytics" className="mt-6">
          <GoogleAnalyticsDashboard 
            onNavigateToSettings={() => {
              window.dispatchEvent(new CustomEvent('navigate-to-settings', { detail: 'google-analytics' }))
            }} 
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
