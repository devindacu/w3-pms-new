import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
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
  Buildings
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
  ResponsiveContainer
} from 'recharts'
import { AnalyticsDateFilter, type DateRange } from '@/components/AnalyticsDateFilter'
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

export function Analytics(props: AnalyticsProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  })

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

  const getRevenueData = () => {
    const totalRevenue = filteredData.guestInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0)
    const paidRevenue = filteredData.payments.reduce((sum, p) => sum + p.amount, 0)
    const pendingRevenue = filteredData.guestInvoices.reduce((sum, inv) => sum + inv.amountDue, 0)
    const roomRevenue = totalRevenue * 0.6
    const fnbRevenue = filteredData.orders.reduce((sum, o) => sum + o.total, 0)
    
    return {
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      roomRevenue,
      fnbRevenue,
      otherRevenue: totalRevenue - roomRevenue - fnbRevenue
    }
  }

  const getGuestData = () => {
    const totalGuests = props.guests.length
    const activeReservations = filteredData.reservations.filter(r => r.status === 'checked-in').length
    const upcomingReservations = filteredData.reservations.filter(r => r.status === 'confirmed').length
    const avgStayDuration = filteredData.reservations.length > 0
      ? filteredData.reservations.reduce((sum, r) => sum + Math.ceil((r.checkOutDate - r.checkInDate) / (1000 * 60 * 60 * 24)), 0) / filteredData.reservations.length
      : 0

    return {
      totalGuests,
      activeReservations,
      upcomingReservations,
      avgStayDuration,
      complaints: filteredData.complaints.length,
      feedback: filteredData.guestFeedback.length,
      satisfaction: filteredData.guestFeedback.length > 0
        ? filteredData.guestFeedback.reduce((sum, f) => {
            const rating = f.ratings?.roomCleanliness
            return sum + (typeof rating === 'number' ? rating : 0)
          }, 0) / filteredData.guestFeedback.length
        : 0
    }
  }

  const getHousekeepingData = () => {
    const totalTasks = filteredData.housekeepingTasks.length
    const completedTasks = filteredData.housekeepingTasks.filter(t => t.status === 'completed').length
    const pendingTasks = filteredData.housekeepingTasks.filter(t => t.status === 'pending').length
    const inProgressTasks = filteredData.housekeepingTasks.filter(t => t.status === 'in-progress').length

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    }
  }

  const getFnBData = () => {
    const totalOrders = filteredData.orders.length
    const completedOrders = filteredData.orders.filter(o => o.status === 'served').length
    const totalRevenue = filteredData.orders.reduce((sum, o) => sum + o.total, 0)
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

  const getFinanceData = () => {
    const totalInvoices = filteredData.guestInvoices.length
    const totalPayments = filteredData.payments.length
    const totalExpenses = filteredData.expenses.length
    const revenue = filteredData.payments.reduce((sum, p) => sum + p.amount, 0)
    const expenseAmount = filteredData.expenses.reduce((sum, e) => sum + e.amount, 0)
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
      return { month, revenue: monthRevenue }
    })
  })()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Comprehensive analytics across all hotel operations</p>
        </div>
      </div>

      <AnalyticsDateFilter
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onReset={handleReset}
        className="bg-card p-4 rounded-lg border"
      />

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

            <Card className="p-6 border-l-4 border-l-accent">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
                <CurrencyDollar size={20} className="text-accent" />
              </div>
              <p className="text-3xl font-semibold">{formatCurrency(revenueData.totalRevenue)}</p>
              <p className="text-sm text-muted-foreground mt-1">Pending: {formatCurrency(revenueData.pendingRevenue)}</p>
            </Card>

            <Card className="p-6 border-l-4 border-l-success">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Active Guests</h3>
                <Users size={20} className="text-success" />
              </div>
              <p className="text-3xl font-semibold">{guestData.activeReservations}</p>
              <p className="text-sm text-muted-foreground mt-1">Upcoming: {guestData.upcomingReservations}</p>
            </Card>

            <Card className="p-6 border-l-4 border-l-secondary">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Net Profit</h3>
                <TrendUp size={20} className="text-secondary" />
              </div>
              <p className="text-3xl font-semibold">{formatCurrency(financeData.netProfit)}</p>
              <p className="text-sm text-muted-foreground mt-1">Margin: {financeData.profitMargin.toFixed(1)}%</p>
            </Card>
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
            <h3 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
              </AreaChart>
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
            <Card className="p-6 border-l-4 border-l-primary">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Revenue</h3>
              <p className="text-3xl font-semibold">{formatCurrency(revenueData.totalRevenue)}</p>
            </Card>
            <Card className="p-6 border-l-4 border-l-success">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Paid Revenue</h3>
              <p className="text-3xl font-semibold text-success">{formatCurrency(revenueData.paidRevenue)}</p>
            </Card>
            <Card className="p-6 border-l-4 border-l-destructive">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Pending Revenue</h3>
              <p className="text-3xl font-semibold text-destructive">{formatCurrency(revenueData.pendingRevenue)}</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Room Revenue</h3>
              <p className="text-2xl font-semibold">{formatCurrency(revenueData.roomRevenue)}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">F&B Revenue</h3>
              <p className="text-2xl font-semibold">{formatCurrency(revenueData.fnbRevenue)}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Other Revenue</h3>
              <p className="text-2xl font-semibold">{formatCurrency(revenueData.otherRevenue)}</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="guests" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Guests</h3>
              <p className="text-3xl font-semibold">{guestData.totalGuests}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Active Check-ins</h3>
              <p className="text-3xl font-semibold text-primary">{guestData.activeReservations}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Avg Stay Duration</h3>
              <p className="text-3xl font-semibold">{guestData.avgStayDuration.toFixed(1)} days</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Satisfaction</h3>
              <p className="text-3xl font-semibold text-accent">{guestData.satisfaction.toFixed(1)}/5</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Complaints</h3>
              <p className="text-2xl font-semibold text-destructive">{guestData.complaints}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Feedback Received</h3>
              <p className="text-2xl font-semibold text-success">{guestData.feedback}</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="housekeeping" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Tasks</h3>
              <p className="text-3xl font-semibold">{housekeepingData.totalTasks}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Completed</h3>
              <p className="text-3xl font-semibold text-success">{housekeepingData.completedTasks}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">In Progress</h3>
              <p className="text-3xl font-semibold text-primary">{housekeepingData.inProgressTasks}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Completion Rate</h3>
              <p className="text-3xl font-semibold text-accent">{housekeepingData.completionRate.toFixed(1)}%</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fnb" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Orders</h3>
              <p className="text-3xl font-semibold">{fnbData.totalOrders}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Revenue</h3>
              <p className="text-3xl font-semibold">{formatCurrency(fnbData.totalRevenue)}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Avg Order Value</h3>
              <p className="text-3xl font-semibold">{formatCurrency(fnbData.avgOrderValue)}</p>
            </Card>
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
            <Card className="p-6 border-l-4 border-l-primary">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Revenue</h3>
              <p className="text-3xl font-semibold">{formatCurrency(financeData.revenue)}</p>
            </Card>
            <Card className="p-6 border-l-4 border-l-destructive">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Expenses</h3>
              <p className="text-3xl font-semibold text-destructive">{formatCurrency(financeData.expenseAmount)}</p>
            </Card>
            <Card className="p-6 border-l-4 border-l-success">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Net Profit</h3>
              <p className="text-3xl font-semibold text-success">{formatCurrency(financeData.netProfit)}</p>
            </Card>
            <Card className="p-6 border-l-4 border-l-accent">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Profit Margin</h3>
              <p className="text-3xl font-semibold">{financeData.profitMargin.toFixed(1)}%</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Invoices</h3>
              <p className="text-2xl font-semibold">{financeData.totalInvoices}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Payments</h3>
              <p className="text-2xl font-semibold">{financeData.totalPayments}</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Expenses</h3>
              <p className="text-2xl font-semibold">{financeData.totalExpenses}</p>
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
      </Tabs>
    </div>
  )
}
