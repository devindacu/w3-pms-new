import { useState, useMemo } from 'react'
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
  ArrowsCounterClockwise
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
  ComposedChart
} from 'recharts'
import { AnalyticsDateFilter, type DateRange } from '@/components/AnalyticsDateFilter'
import { PercentageChangeIndicator } from '@/components/PercentageChangeIndicator'
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
  MaintenanceRequest
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
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="guests">Guests</TabsTrigger>
          <TabsTrigger value="housekeeping">Housekeeping</TabsTrigger>
          <TabsTrigger value="fnb">F&B</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
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

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Room Status Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Vacant Clean</p>
                <p className="text-2xl font-semibold mt-1">{occupancyData.vacantClean}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Vacant Dirty</p>
                <p className="text-2xl font-semibold mt-1">{occupancyData.vacantDirty}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Under Maintenance</p>
                <p className="text-2xl font-semibold mt-1">{occupancyData.maintenance}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-semibold mt-1">{occupancyData.vacantClean}</p>
              </div>
            </div>
          </Card>
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
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Items</h3>
              <p className="text-3xl font-semibold">{inventoryData.totalItems}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Low Stock</h3>
              <p className="text-3xl font-semibold text-destructive">{inventoryData.lowStockItems}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Out of Stock</h3>
              <p className="text-3xl font-semibold text-destructive">{inventoryData.outOfStockItems}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Value</h3>
              <p className="text-3xl font-semibold">{formatCurrency(inventoryData.totalValue)}</p>
            </Card>
          </div>
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
              title="Total Expenses"
              currentValue={financeData.totalExpenses}
              previousValue={prevFinanceData?.totalExpenses}
              icon={<Receipt size={20} />}
            />
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
      </Tabs>
    </div>
  )
}
