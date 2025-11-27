import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster, toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Gauge,
  Bed,
  Broom,
  ForkKnife,
  Package,
  ShoppingCart,
  CurrencyDollar,
  Users,
  Wrench,
  ChartBar,
  Plus,
  Database,
  ArrowUp,
  ArrowDown,
  Warning,
  Carrot,
  Basket,
  Hammer,
  Buildings,
  ClipboardText,
  UserGear,
  Receipt,
  ChefHat,
  Sparkle,
  Bell,
  List
} from '@phosphor-icons/react'
import { 
  type Room, 
  type Guest, 
  type Reservation,
  type Folio,
  type InventoryItem,
  type HousekeepingTask,
  type MenuItem,
  type Order,
  type Supplier,
  type Employee,
  type MaintenanceRequest,
  type FoodItem,
  type Amenity,
  type AmenityUsageLog,
  type AmenityAutoOrder,
  type ConstructionMaterial,
  type ConstructionProject,
  type Contractor,
  type GeneralProduct,
  type SystemUser,
  type ActivityLog,
  type Attendance,
  type LeaveRequest,
  type Shift,
  type DutyRoster,
  type PerformanceReview,
  type Requisition,
  type PurchaseOrder,
  type GoodsReceivedNote,
  type Invoice,
  type Recipe,
  type Menu,
  type KitchenConsumptionLog,
  type KitchenStation,
  type KitchenStaff,
  type ProductionSchedule,
  type KitchenInventoryIssue,
  type WasteTracking,
  type Notification,
  type DemandForecast,
  type ExtraService,
  type ExtraServiceCategory,
  type FolioExtraService
} from '@/lib/types'
import { 
  formatCurrency, 
  formatPercent,
  calculateDashboardMetrics,
  getRoomStatusColor,
  getStockStatus,
  generateNumber,
  getUrgentFoodItems,
  getExpiringFoodItems,
  getUrgentAmenities
} from '@/lib/helpers'
import {
  sampleGuests,
  sampleRooms,
  sampleReservations,
  sampleFolios,
  sampleInventory,
  sampleMenuItems,
  sampleHousekeepingTasks,
  sampleOrders,
  sampleSuppliers,
  sampleEmployees,
  sampleMaintenanceRequests,
  sampleFoodItems,
  sampleAmenities,
  sampleAmenityUsageLogs,
  sampleAmenityAutoOrders,
  sampleConstructionMaterials,
  sampleConstructionProjects,
  sampleContractors,
  sampleGeneralProducts,
  sampleSystemUsers,
  sampleActivityLogs,
  sampleAttendance,
  sampleLeaveRequests,
  sampleShifts,
  sampleDutyRosters,
  samplePerformanceReviews,
  sampleRequisitions,
  samplePurchaseOrders,
  sampleGRNs
} from '@/lib/sampleData'
import { sampleGuestInvoices } from '@/lib/guestInvoiceSampleData'
import { sampleOTAConnections, sampleChannelPerformance } from '@/lib/channelManagerSampleData'
import { ConstructionManagement } from '@/components/ConstructionManagement'
import { SupplierManagement } from '@/components/SupplierManagement'
import { InventoryManagement } from '@/components/InventoryManagement'
import { UserManagement } from '@/components/UserManagement'
import { HRManagement } from '@/components/HRManagement'
import { FrontOffice } from '@/components/FrontOffice'
import { Housekeeping } from '@/components/Housekeeping'
import { Procurement } from '@/components/Procurement'
import { FnBPOS } from '@/components/FnBPOS'
import { KitchenOperations } from '@/components/KitchenOperations'
import { ForecastingAnalytics } from '@/components/ForecastingAnalytics'
import { NotificationPanel } from '@/components/NotificationPanel'
import { DashboardAlerts } from '@/components/DashboardAlerts'
import { generateAllAlerts } from '@/lib/notificationHelpers'
import { generateEmailFromNotifications, mockSendEmail } from '@/lib/emailHelpers'
import { CRM } from '@/components/CRM'
import { ChannelManager } from '@/components/ChannelManager'
import { RoomRevenueManagement } from '@/components/RoomRevenueManagement'
import { ExtraServicesManagement } from '@/components/ExtraServicesManagement'
import { Analytics } from '@/components/Analytics'
import type {
  GuestProfile,
  GuestComplaint,
  GuestFeedback,
  MarketingCampaign,
  MarketingTemplate,
  UpsellOffer,
  UpsellTransaction,
  LoyaltyTransaction,
  OTAConnection,
  RatePlan,
  ChannelInventory,
  ChannelRate,
  ChannelReservation,
  SyncLog,
  ChannelPerformance,
  ChannelReview,
  BulkUpdateOperation,
  RoomTypeConfig,
  RatePlanConfig,
  Season,
  EventDay,
  CorporateAccount,
  RateCalendar,
  OccupancyPricing,
  GuestInvoice
} from '@/lib/types'

type Module = 'dashboard' | 'front-office' | 'housekeeping' | 'fnb' | 'inventory' | 'procurement' | 'finance' | 'hr' | 'analytics' | 'construction' | 'suppliers' | 'user-management' | 'kitchen' | 'forecasting' | 'notifications' | 'crm' | 'channel-manager' | 'room-revenue' | 'extra-services'

function App() {
  const [guests, setGuests] = useKV<Guest[]>('w3-hotel-guests', [])
  const [rooms, setRooms] = useKV<Room[]>('w3-hotel-rooms', [])
  const [reservations, setReservations] = useKV<Reservation[]>('w3-hotel-reservations', [])
  const [folios, setFolios] = useKV<Folio[]>('w3-hotel-folios', [])
  const [inventory, setInventory] = useKV<InventoryItem[]>('w3-hotel-inventory', [])
  const [menuItems, setMenuItems] = useKV<MenuItem[]>('w3-hotel-menu', [])
  const [housekeepingTasks, setHousekeepingTasks] = useKV<HousekeepingTask[]>('w3-hotel-housekeeping', [])
  const [orders, setOrders] = useKV<Order[]>('w3-hotel-orders', [])
  const [suppliers, setSuppliers] = useKV<Supplier[]>('w3-hotel-suppliers', [])
  const [employees, setEmployees] = useKV<Employee[]>('w3-hotel-employees', [])
  const [maintenanceRequests, setMaintenanceRequests] = useKV<MaintenanceRequest[]>('w3-hotel-maintenance', [])
  const [foodItems, setFoodItems] = useKV<FoodItem[]>('w3-hotel-food-items', [])
  const [amenities, setAmenities] = useKV<Amenity[]>('w3-hotel-amenities', [])
  const [amenityUsageLogs, setAmenityUsageLogs] = useKV<AmenityUsageLog[]>('w3-hotel-amenity-usage', [])
  const [amenityAutoOrders, setAmenityAutoOrders] = useKV<AmenityAutoOrder[]>('w3-hotel-amenity-auto-orders', [])
  const [constructionMaterials, setConstructionMaterials] = useKV<ConstructionMaterial[]>('w3-hotel-construction-materials', [])
  const [constructionProjects, setConstructionProjects] = useKV<ConstructionProject[]>('w3-hotel-construction-projects', [])
  const [contractors, setContractors] = useKV<Contractor[]>('w3-hotel-contractors', [])
  const [generalProducts, setGeneralProducts] = useKV<GeneralProduct[]>('w3-hotel-general-products', [])
  const [systemUsers, setSystemUsers] = useKV<SystemUser[]>('w3-hotel-system-users', [])
  const [activityLogs, setActivityLogs] = useKV<ActivityLog[]>('w3-hotel-activity-logs', [])
  const [attendance, setAttendance] = useKV<Attendance[]>('w3-hotel-attendance', [])
  const [leaveRequests, setLeaveRequests] = useKV<LeaveRequest[]>('w3-hotel-leave-requests', [])
  const [shifts, setShifts] = useKV<Shift[]>('w3-hotel-shifts', [])
  const [dutyRosters, setDutyRosters] = useKV<DutyRoster[]>('w3-hotel-duty-rosters', [])
  const [performanceReviews, setPerformanceReviews] = useKV<PerformanceReview[]>('w3-hotel-performance-reviews', [])
  const [requisitions, setRequisitions] = useKV<Requisition[]>('w3-hotel-requisitions', [])
  const [purchaseOrders, setPurchaseOrders] = useKV<PurchaseOrder[]>('w3-hotel-purchase-orders', [])
  const [grns, setGRNs] = useKV<GoodsReceivedNote[]>('w3-hotel-grns', [])
  const [invoices, setInvoices] = useKV<Invoice[]>('w3-hotel-invoices', [])
  const [recipes, setRecipes] = useKV<Recipe[]>('w3-hotel-recipes', [])
  const [menus, setMenus] = useKV<Menu[]>('w3-hotel-menus', [])
  const [consumptionLogs, setConsumptionLogs] = useKV<KitchenConsumptionLog[]>('w3-hotel-consumption-logs', [])
  const [kitchenStations, setKitchenStations] = useKV<KitchenStation[]>('w3-hotel-kitchen-stations', [])
  const [kitchenStaff, setKitchenStaff] = useKV<KitchenStaff[]>('w3-hotel-kitchen-staff', [])
  const [productionSchedules, setProductionSchedules] = useKV<ProductionSchedule[]>('w3-hotel-production-schedules', [])
  const [inventoryIssues, setInventoryIssues] = useKV<KitchenInventoryIssue[]>('w3-hotel-inventory-issues', [])
  const [wasteTracking, setWasteTracking] = useKV<WasteTracking[]>('w3-hotel-waste-tracking', [])
  const [notifications, setNotifications] = useKV<Notification[]>('w3-hotel-notifications', [])
  const [forecasts, setForecasts] = useKV<DemandForecast[]>('w3-hotel-forecasts', [])
  const [guestProfiles, setGuestProfiles] = useKV<GuestProfile[]>('w3-hotel-guest-profiles', [])
  const [complaints, setComplaints] = useKV<GuestComplaint[]>('w3-hotel-complaints', [])
  const [guestFeedback, setGuestFeedback] = useKV<GuestFeedback[]>('w3-hotel-guest-feedback', [])
  const [marketingCampaigns, setMarketingCampaigns] = useKV<MarketingCampaign[]>('w3-hotel-marketing-campaigns', [])
  const [marketingTemplates, setMarketingTemplates] = useKV<MarketingTemplate[]>('w3-hotel-marketing-templates', [])
  const [upsellOffers, setUpsellOffers] = useKV<UpsellOffer[]>('w3-hotel-upsell-offers', [])
  const [upsellTransactions, setUpsellTransactions] = useKV<UpsellTransaction[]>('w3-hotel-upsell-transactions', [])
  const [loyaltyTransactions, setLoyaltyTransactions] = useKV<LoyaltyTransaction[]>('w3-hotel-loyalty-transactions', [])
  const [otaConnections, setOTAConnections] = useKV<OTAConnection[]>('w3-hotel-ota-connections', [])
  const [ratePlans, setRatePlans] = useKV<RatePlan[]>('w3-hotel-rate-plans', [])
  const [channelInventory, setChannelInventory] = useKV<ChannelInventory[]>('w3-hotel-channel-inventory', [])
  const [channelRates, setChannelRates] = useKV<ChannelRate[]>('w3-hotel-channel-rates', [])
  const [channelReservations, setChannelReservations] = useKV<ChannelReservation[]>('w3-hotel-channel-reservations', [])
  const [syncLogs, setSyncLogs] = useKV<SyncLog[]>('w3-hotel-sync-logs', [])
  const [channelPerformance, setChannelPerformance] = useKV<ChannelPerformance[]>('w3-hotel-channel-performance', [])
  const [channelReviews, setChannelReviews] = useKV<ChannelReview[]>('w3-hotel-channel-reviews', [])
  const [bulkOperations, setBulkOperations] = useKV<BulkUpdateOperation[]>('w3-hotel-bulk-operations', [])
  const [extraServices, setExtraServices] = useKV<ExtraService[]>('w3-hotel-extra-services', [])
  const [serviceCategories, setServiceCategories] = useKV<ExtraServiceCategory[]>('w3-hotel-service-categories', [])
  const [folioExtraServices, setFolioExtraServices] = useKV<FolioExtraService[]>('w3-hotel-folio-extra-services', [])
  
  const [roomTypeConfigs, setRoomTypeConfigs] = useKV<RoomTypeConfig[]>('w3-hotel-room-type-configs', [])
  const [ratePlanConfigs, setRatePlanConfigs] = useKV<RatePlanConfig[]>('w3-hotel-rate-plan-configs', [])
  const [seasons, setSeasons] = useKV<Season[]>('w3-hotel-seasons', [])
  const [eventDays, setEventDays] = useKV<EventDay[]>('w3-hotel-event-days', [])
  const [corporateAccounts, setCorporateAccounts] = useKV<CorporateAccount[]>('w3-hotel-corporate-accounts', [])
  const [rateCalendar, setRateCalendar] = useKV<RateCalendar[]>('w3-hotel-rate-calendar', [])
  const [occupancyPricing, setOccupancyPricing] = useKV<OccupancyPricing[]>('w3-hotel-occupancy-pricing', [])
  const [guestInvoices, setGuestInvoices] = useKV<GuestInvoice[]>('w3-hotel-guest-invoices', [])
  
  const [currentModule, setCurrentModule] = useState<Module>('dashboard')
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false)

  useEffect(() => {
    const refreshNotifications = () => {
      const newNotifications = generateAllAlerts(
        foodItems || [],
        amenities || [],
        constructionMaterials || [],
        generalProducts || [],
        requisitions || [],
        purchaseOrders || [],
        invoices || [],
        housekeepingTasks || [],
        rooms || [],
        reservations || [],
        orders || [],
        leaveRequests || [],
        constructionProjects || [],
        forecasts || []
      )

      setNotifications((currentNotifs) => {
        const existingIds = new Set((currentNotifs || []).map(n => 
          `${n.type}-${n.resourceId || 'global'}-${n.title}`
        ))
        
        const filtered = newNotifications.filter(n => {
          const key = `${n.type}-${n.resourceId || 'global'}-${n.title}`
          return !existingIds.has(key)
        })

        const active = (currentNotifs || []).filter(n => 
          n.status !== 'archived' && n.status !== 'dismissed' &&
          (!n.expiresAt || n.expiresAt > Date.now())
        )

        return [...active, ...filtered]
      })
    }

    const interval = setInterval(refreshNotifications, 60000)
    refreshNotifications()

    return () => clearInterval(interval)
  }, [
    foodItems,
    amenities,
    constructionMaterials,
    generalProducts,
    requisitions,
    purchaseOrders,
    invoices,
    housekeepingTasks,
    rooms,
    reservations,
    orders,
    leaveRequests,
    constructionProjects,
    forecasts
  ])
  
  const currentUser = (systemUsers || [])[0] || sampleSystemUsers[0]

  const handleMarkAsRead = (id: string) => {
    setNotifications((notifs) =>
      (notifs || []).map(n => n.id === id ? { ...n, status: 'read' as const, readAt: Date.now() } : n)
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications((notifs) =>
      (notifs || []).map(n => n.status === 'unread' ? { ...n, status: 'read' as const, readAt: Date.now() } : n)
    )
    toast.success('All notifications marked as read')
  }

  const handleDismiss = (id: string) => {
    setNotifications((notifs) =>
      (notifs || []).map(n => n.id === id ? { ...n, status: 'dismissed' as const, dismissedAt: Date.now() } : n)
    )
  }

  const handleArchive = (id: string) => {
    setNotifications((notifs) =>
      (notifs || []).map(n => n.id === id ? { ...n, status: 'archived' as const, archivedAt: Date.now() } : n)
    )
    toast.success('Notification archived')
  }

  const handleClearAll = () => {
    setNotifications((notifs) =>
      (notifs || []).map(n => ({ ...n, status: 'archived' as const, archivedAt: Date.now() }))
    )
    toast.success('All notifications cleared')
  }

  const handleSendEmailNotifications = async () => {
    const unreadCritical = (notifications || []).filter(
      n => n.status === 'unread' && (n.priority === 'critical' || n.priority === 'high')
    )

    if (unreadCritical.length === 0) {
      toast.info('No critical notifications to send')
      return
    }

    const email = generateEmailFromNotifications(
      unreadCritical,
      currentUser.email,
      `${currentUser.firstName} ${currentUser.lastName}`
    )

    const success = await mockSendEmail(email)
    if (success) {
      toast.success(`Email notification sent to ${currentUser.email}`)
    } else {
      toast.error('Failed to send email notification')
    }
  }

  const loadSampleData = () => {
    setGuests(sampleGuests)
    setRooms(sampleRooms)
    setReservations(sampleReservations)
    setFolios(sampleFolios)
    setInventory(sampleInventory)
    setMenuItems(sampleMenuItems)
    setHousekeepingTasks(sampleHousekeepingTasks)
    setOrders(sampleOrders)
    setSuppliers(sampleSuppliers)
    setEmployees(sampleEmployees)
    setMaintenanceRequests(sampleMaintenanceRequests)
    setFoodItems(sampleFoodItems)
    setAmenities(sampleAmenities)
    setAmenityUsageLogs(sampleAmenityUsageLogs)
    setAmenityAutoOrders(sampleAmenityAutoOrders)
    setConstructionMaterials(sampleConstructionMaterials)
    setConstructionProjects(sampleConstructionProjects)
    setContractors(sampleContractors)
    setGeneralProducts(sampleGeneralProducts)
    setSystemUsers(sampleSystemUsers)
    setActivityLogs(sampleActivityLogs)
    setAttendance(sampleAttendance)
    setLeaveRequests(sampleLeaveRequests)
    setShifts(sampleShifts)
    setDutyRosters(sampleDutyRosters)
    setPerformanceReviews(samplePerformanceReviews)
    setRequisitions(sampleRequisitions)
    setPurchaseOrders(samplePurchaseOrders)
    setGRNs(sampleGRNs)
    setOTAConnections(sampleOTAConnections)
    setChannelPerformance(sampleChannelPerformance)
    setGuestInvoices(sampleGuestInvoices)
    toast.success('Sample data loaded successfully')
  }

  const metrics = calculateDashboardMetrics(
    rooms || [],
    reservations || [],
    housekeepingTasks || [],
    orders || [],
    inventory || [],
    maintenanceRequests || []
  )

  const hasData = (rooms || []).length > 0

  const renderDashboard = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold">Hotel Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Unified view of all hotel operations</p>
        </div>
        {!hasData && (
          <Button onClick={loadSampleData} size="lg" className="w-full sm:w-auto">
            <Database size={20} className="mr-2" />
            Load Sample Data
          </Button>
        )}
      </div>

      {!hasData ? (
        <Card className="p-8 md:p-12 lg:p-16 text-center">
          <div className="max-w-md mx-auto">
            <Gauge size={48} className="mx-auto text-muted-foreground mb-4 md:w-16 md:h-16" />
            <h3 className="text-xl md:text-2xl font-semibold mb-2">Welcome to W3 Hotel PMS</h3>
            <p className="text-muted-foreground mb-6 text-sm md:text-base">
              Your comprehensive hotel management solution integrating all operations in one platform
            </p>
            <Button onClick={loadSampleData} size="lg" className="w-full sm:w-auto">
              <Database size={20} className="mr-2" />
              Load Sample Data to Get Started
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <DashboardAlerts
            notifications={notifications || []}
            onDismiss={handleDismiss}
            onViewAll={() => setNotificationPanelOpen(true)}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 border-l-4 border-l-primary">
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

            <Card className="p-6 border-l-4 border-l-success">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Revenue Today</h3>
                <CurrencyDollar size={20} className="text-success" />
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-semibold">{formatCurrency(metrics.revenue.today)}</p>
                <div className="flex items-center gap-1 text-sm text-success">
                  <ArrowUp size={16} />
                  <span>Live tracking</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-accent">
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

            <Card className="p-6 border-l-4 border-l-destructive">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Amenities Stock</h3>
                <Basket size={20} className="text-destructive" />
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-semibold">{getUrgentAmenities(amenities || []).length}</p>
                <p className="text-sm text-muted-foreground">Urgent items</p>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Low Stock:</span>
                    <span className="ml-1 font-medium text-accent">{(amenities || []).filter(a => a.currentStock <= a.reorderLevel).length}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="ml-1 font-medium">{(amenities || []).length}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-accent">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Food Inventory</h3>
                <Carrot size={20} className="text-accent" />
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-semibold">{getUrgentFoodItems(foodItems || []).length}</p>
                <p className="text-sm text-muted-foreground">Urgent items</p>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Expiring:</span>
                    <span className="ml-1 font-medium text-destructive">{getExpiringFoodItems(foodItems || [], 7).length}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="ml-1 font-medium">{(foodItems || []).length}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-primary">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Maintenance & Constructions</h3>
                <Hammer size={20} className="text-primary" />
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-semibold">{(constructionProjects || []).filter(p => p.status === 'in-progress').length}</p>
                <p className="text-sm text-muted-foreground">Active projects</p>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Materials:</span>
                    <span className="ml-1 font-medium">{(constructionMaterials || []).length}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Low Stock:</span>
                    <span className="ml-1 font-medium text-destructive">{(constructionMaterials || []).filter(m => m.currentStock <= m.reorderLevel).length}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base md:text-lg font-semibold">F&B Performance</h3>
                <ForkKnife size={18} className="text-muted-foreground md:w-5 md:h-5" />
              </div>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Orders Today</span>
                  <span className="text-base md:text-lg font-semibold">{metrics.fnb.ordersToday}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">F&B Revenue</span>
                  <span className="text-base md:text-lg font-semibold truncate ml-2">{formatCurrency(metrics.fnb.revenueToday)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Order Value</span>
                  <span className="text-base md:text-lg font-semibold truncate ml-2">{formatCurrency(metrics.fnb.averageOrderValue)}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base md:text-lg font-semibold">Maintenance Status</h3>
                <Wrench size={18} className="text-muted-foreground md:w-5 md:h-5" />
              </div>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Open Requests</span>
                  <span className="text-base md:text-lg font-semibold">{metrics.maintenance.openRequests}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Urgent</span>
                  <Badge variant="destructive">{metrics.maintenance.urgent}</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rooms Out of Service</span>
                  <span className="text-base md:text-lg font-semibold">{metrics.occupancy.maintenance}</span>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="text-base md:text-lg font-semibold">Room Status Overview</h3>
              <Button size="sm" onClick={() => setCurrentModule('housekeeping')} className="w-full sm:w-auto">
                View All Rooms
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
              {(rooms || []).slice(0, 12).map((room) => (
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

          <Card className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="text-base md:text-lg font-semibold">Low Stock Items</h3>
              <Button size="sm" onClick={() => setCurrentModule('inventory')} className="w-full sm:w-auto">
                View Inventory
              </Button>
            </div>
            {metrics.inventory.lowStockItems === 0 ? (
              <p className="text-center text-muted-foreground py-6 md:py-8 text-sm md:text-base">All inventory levels are healthy</p>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {(inventory || [])
                  .filter(item => item.currentStock <= item.reorderLevel && item.currentStock > 0)
                  .slice(0, 5)
                  .map((item) => (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-muted/50 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{item.category}</p>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <p className="font-semibold text-destructive">{item.currentStock} {item.unit}</p>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">Reorder at {item.reorderLevel}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )

  const renderComingSoon = (title: string, icon: React.ReactNode) => (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-semibold">{title}</h1>
        <p className="text-muted-foreground mt-1">This module is under development</p>
      </div>
      <Card className="p-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-muted-foreground mb-4 flex justify-center">{icon}</div>
          <h3 className="text-2xl font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground mb-6">
            We're building this module to provide comprehensive {title.toLowerCase()} management capabilities.
          </p>
          <Button onClick={() => setCurrentModule('dashboard')} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  )

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const SidebarContent = () => (
    <>
      <div className="px-3 py-4 mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">W3 Hotel PMS</h2>
          <p className="text-xs text-muted-foreground mt-1">Unified Management</p>
        </div>
        <div className="lg:block hidden">
          <NotificationPanel
            notifications={notifications || []}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDismiss={handleDismiss}
            onArchive={handleArchive}
            onClearAll={handleClearAll}
          />
        </div>
      </div>

      <nav className="space-y-1" onClick={() => setSidebarOpen(false)}>
        <Button
            variant={currentModule === 'dashboard' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('dashboard')}
          >
            <Gauge size={18} className="mr-2" />
            Dashboard
          </Button>

          <Separator className="my-2" />

          <Button
            variant={currentModule === 'front-office' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('front-office')}
          >
            <Bed size={18} className="mr-2" />
            Front Office
          </Button>

          <Button
            variant={currentModule === 'room-revenue' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('room-revenue')}
          >
            <Buildings size={18} className="mr-2" />
            Room & Revenue
          </Button>

          <Button
            variant={currentModule === 'extra-services' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('extra-services')}
          >
            <Sparkle size={18} className="mr-2" />
            Extra Services
          </Button>

          <Button
            variant={currentModule === 'housekeeping' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('housekeeping')}
          >
            <Broom size={18} className="mr-2" />
            Housekeeping
          </Button>

          <Button
            variant={currentModule === 'fnb' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('fnb')}
          >
            <ForkKnife size={18} className="mr-2" />
            F&B / POS
          </Button>

          <Separator className="my-2" />

          <Button
            variant={currentModule === 'inventory' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('inventory')}
          >
            <Package size={18} className="mr-2" />
            Inventory
          </Button>

          <Button
            variant={currentModule === 'suppliers' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('suppliers')}
          >
            <Buildings size={18} className="mr-2" />
            Suppliers
          </Button>

          <Button
            variant={currentModule === 'procurement' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('procurement')}
          >
            <ShoppingCart size={18} className="mr-2" />
            Procurement & Invoices
          </Button>

          <Separator className="my-2" />

          <Button
            variant={currentModule === 'kitchen' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('kitchen')}
          >
            <ChefHat size={18} className="mr-2" />
            Kitchen Operations
          </Button>

          <Separator className="my-2" />

          <Button
            variant={currentModule === 'finance' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('finance')}
          >
            <CurrencyDollar size={18} className="mr-2" />
            Finance
          </Button>

          <Button
            variant={currentModule === 'hr' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('hr')}
          >
            <Users size={18} className="mr-2" />
            HR & Staff
          </Button>

          <Button
            variant={currentModule === 'user-management' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('user-management')}
          >
            <UserGear size={18} className="mr-2" />
            User Management
          </Button>

          <Button
            variant={currentModule === 'construction' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('construction')}
          >
            <Hammer size={18} className="mr-2" />
            Maintenance & Constructions
          </Button>

          <Button
            variant={currentModule === 'analytics' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('analytics')}
          >
            <ChartBar size={18} className="mr-2" />
            Analytics
          </Button>

          <Button
            variant={currentModule === 'forecasting' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('forecasting')}
          >
            <Sparkle size={18} className="mr-2" />
            AI Forecasting
          </Button>

          <Separator className="my-2" />

          <Button
            variant={currentModule === 'crm' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('crm')}
          >
            <Users size={18} className="mr-2" />
            CRM & Guest Relations
          </Button>

          <Button
            variant={currentModule === 'channel-manager' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('channel-manager')}
          >
            <Buildings size={18} className="mr-2" />
            Channel Manager
          </Button>
        </nav>
      </>
  )

  return (
    <div className="flex min-h-screen bg-background">
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <aside className="hidden lg:block w-64 border-r bg-card p-4 space-y-2 overflow-y-auto fixed left-0 top-0 bottom-0 z-40">
          <SidebarContent />
        </aside>

        <SheetContent side="left" className="w-64 p-4 overflow-y-auto">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <main className="flex-1 overflow-auto lg:ml-64">
        <div className="lg:hidden sticky top-0 z-30 bg-background border-b px-4 py-3 flex items-center justify-between">
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <List size={24} />
            </Button>
          </SheetTrigger>
          <h1 className="text-lg font-semibold">W3 Hotel PMS</h1>
          <NotificationPanel
            notifications={notifications || []}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDismiss={handleDismiss}
            onArchive={handleArchive}
            onClearAll={handleClearAll}
          />
        </div>

        <div className="p-4 md:p-6 lg:p-8">
          {currentModule === 'dashboard' && renderDashboard()}
          {currentModule === 'front-office' && (
            <FrontOffice
              guests={guests || []}
              setGuests={setGuests}
              reservations={reservations || []}
              setReservations={setReservations}
              rooms={rooms || []}
              setRooms={setRooms}
              folios={folios || []}
              setFolios={setFolios}
              extraServices={extraServices || []}
              serviceCategories={serviceCategories || []}
              folioExtraServices={folioExtraServices || []}
              setFolioExtraServices={setFolioExtraServices}
              currentUser={currentUser}
            />
          )}
          {currentModule === 'room-revenue' && (
            <RoomRevenueManagement
              rooms={rooms || []}
              setRooms={setRooms}
              roomTypes={roomTypeConfigs || []}
              setRoomTypes={setRoomTypeConfigs}
              ratePlans={ratePlanConfigs || []}
              setRatePlans={setRatePlanConfigs}
              seasons={seasons || []}
              setSeasons={setSeasons}
              eventDays={eventDays || []}
              setEventDays={setEventDays}
              corporateAccounts={corporateAccounts || []}
              setCorporateAccounts={setCorporateAccounts}
              rateCalendar={rateCalendar || []}
              setRateCalendar={setRateCalendar}
              currentUser={currentUser}
            />
          )}
          {currentModule === 'housekeeping' && (
            <Housekeeping
              rooms={rooms || []}
              setRooms={setRooms}
              tasks={housekeepingTasks || []}
              setTasks={setHousekeepingTasks}
              employees={employees || []}
            />
          )}
          {currentModule === 'fnb' && (
            <FnBPOS
              menuItems={menuItems || []}
              setMenuItems={setMenuItems}
              orders={orders || []}
              setOrders={setOrders}
              guests={guests || []}
              rooms={rooms || []}
            />
          )}
          {currentModule === 'inventory' && (
            <InventoryManagement
              foodItems={foodItems || []}
              setFoodItems={setFoodItems}
              amenities={amenities || []}
              setAmenities={setAmenities}
              amenityUsageLogs={amenityUsageLogs || []}
              setAmenityUsageLogs={setAmenityUsageLogs}
              amenityAutoOrders={amenityAutoOrders || []}
              setAmenityAutoOrders={setAmenityAutoOrders}
              constructionMaterials={constructionMaterials || []}
              generalProducts={generalProducts || []}
              setGeneralProducts={setGeneralProducts}
              suppliers={suppliers || []}
            />
          )}

          {currentModule === 'suppliers' && (
            <SupplierManagement
              suppliers={suppliers || []}
              setSuppliers={setSuppliers}
            />
          )}
          {currentModule === 'procurement' && (
            <Procurement
              requisitions={requisitions || []}
              setRequisitions={setRequisitions}
              purchaseOrders={purchaseOrders || []}
              setPurchaseOrders={setPurchaseOrders}
              grns={grns || []}
              setGRNs={setGRNs}
              suppliers={suppliers || []}
              inventory={inventory || []}
              foodItems={foodItems || []}
              amenities={amenities || []}
              constructionMaterials={constructionMaterials || []}
              generalProducts={generalProducts || []}
              currentUser={currentUser}
              invoices={invoices || []}
              setInvoices={setInvoices}
            />
          )}
          {currentModule === 'kitchen' && (
            <KitchenOperations
              recipes={recipes || []}
              setRecipes={setRecipes}
              menus={menus || []}
              setMenus={setMenus}
              consumptionLogs={consumptionLogs || []}
              setConsumptionLogs={setConsumptionLogs}
              stations={kitchenStations || []}
              setStations={setKitchenStations}
              kitchenStaff={kitchenStaff || []}
              setKitchenStaff={setKitchenStaff}
              productionSchedules={productionSchedules || []}
              setProductionSchedules={setProductionSchedules}
              inventoryIssues={inventoryIssues || []}
              setInventoryIssues={setInventoryIssues}
              wasteTracking={wasteTracking || []}
              setWasteTracking={setWasteTracking}
              foodItems={foodItems || []}
              suppliers={suppliers || []}
              orders={orders || []}
              employees={employees || []}
            />
          )}
          {currentModule === 'finance' && renderComingSoon('Finance & Accounting', <CurrencyDollar size={64} />)}
          {currentModule === 'hr' && (
            <HRManagement
              employees={employees || []}
              setEmployees={setEmployees}
              attendance={attendance || []}
              setAttendance={setAttendance}
              leaveRequests={leaveRequests || []}
              setLeaveRequests={setLeaveRequests}
              shifts={shifts || []}
              setShifts={setShifts}
              dutyRosters={dutyRosters || []}
              setDutyRosters={setDutyRosters}
              performanceReviews={performanceReviews || []}
              setPerformanceReviews={setPerformanceReviews}
            />
          )}
          {currentModule === 'user-management' && (
            <UserManagement
              users={systemUsers || []}
              setUsers={setSystemUsers}
              currentUser={currentUser}
              activityLogs={activityLogs || []}
              setActivityLogs={setActivityLogs}
            />
          )}
          {currentModule === 'construction' && (
            <ConstructionManagement
              materials={constructionMaterials || []}
              setMaterials={setConstructionMaterials}
              projects={constructionProjects || []}
              setProjects={setConstructionProjects}
              suppliers={suppliers || []}
              contractors={contractors || []}
              setContractors={setContractors}
            />
          )}
          {currentModule === 'analytics' && (
            <Analytics
              orders={orders || []}
              foodItems={foodItems || []}
              suppliers={suppliers || []}
              grns={grns || []}
              recipes={recipes || []}
              menus={menus || []}
              consumptionLogs={consumptionLogs || []}
              purchaseOrders={purchaseOrders || []}
            />
          )}
          {currentModule === 'forecasting' && (
            <ForecastingAnalytics
              foodItems={foodItems || []}
              amenities={amenities || []}
              constructionMaterials={constructionMaterials || []}
              generalProducts={generalProducts || []}
              suppliers={suppliers || []}
              rooms={rooms || []}
              reservations={reservations || []}
              consumptionLogs={consumptionLogs || []}
              recipes={recipes || []}
              menus={menus || []}
            />
          )}
          {currentModule === 'crm' && (
            <CRM
              guestProfiles={guestProfiles || []}
              setGuestProfiles={setGuestProfiles}
              complaints={complaints || []}
              setComplaints={setComplaints}
              feedback={guestFeedback || []}
              setFeedback={setGuestFeedback}
              campaigns={marketingCampaigns || []}
              setCampaigns={setMarketingCampaigns}
              templates={marketingTemplates || []}
              setTemplates={setMarketingTemplates}
              upsellOffers={upsellOffers || []}
              setUpsellOffers={setUpsellOffers}
              upsellTransactions={upsellTransactions || []}
              setUpsellTransactions={setUpsellTransactions}
              loyaltyTransactions={loyaltyTransactions || []}
              setLoyaltyTransactions={setLoyaltyTransactions}
            />
          )}
          {currentModule === 'channel-manager' && (
            <ChannelManager
              connections={otaConnections || []}
              setConnections={setOTAConnections}
              ratePlans={ratePlans || []}
              setRatePlans={setRatePlans}
              inventory={channelInventory || []}
              setInventory={setChannelInventory}
              rates={channelRates || []}
              setRates={setChannelRates}
              reservations={channelReservations || []}
              setReservations={setChannelReservations}
              syncLogs={syncLogs || []}
              setSyncLogs={setSyncLogs}
              performance={channelPerformance || []}
              reviews={channelReviews || []}
              setReviews={setChannelReviews}
              bulkOperations={bulkOperations || []}
              setBulkOperations={setBulkOperations}
              rooms={rooms || []}
              currentUser={currentUser}
            />
          )}
          {currentModule === 'extra-services' && (
            <ExtraServicesManagement
              services={extraServices || []}
              setServices={setExtraServices}
              categories={serviceCategories || []}
              setCategories={setServiceCategories}
              currentUser={currentUser}
            />
          )}
        </div>
      </main>

      <Toaster position="top-right" richColors />
    </div>
  )
}

export default App
