import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster, toast } from 'sonner'
import { useTheme } from '@/hooks/use-theme'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import w3MediaLogo from '@/assets/images/W3Media-Web-Green.png'
import w3PMSLogo from '@/assets/images/W3-PMS.png'
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
  List,
  FileText
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
  getUrgentAmenities,
  calculateHistoricalComparison
} from '@/lib/helpers'
import { PercentageChangeIndicator } from '@/components/PercentageChangeIndicator'
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
  sampleGRNs,
  samplePayments,
  sampleExpenses,
  sampleAccounts,
  sampleBudgets,
  sampleCostCenters,
  sampleProfitCenters,
  sampleCostCenterReports,
  sampleProfitCenterReports
} from '@/lib/sampleData'
import { sampleGuestInvoices } from '@/lib/guestInvoiceSampleData'
import { sampleOTAConnections, sampleChannelPerformance } from '@/lib/channelManagerSampleData'
import { sampleEmailTemplates } from '@/lib/emailTemplateSampleData'
import { sampleEmailTemplateAnalytics, sampleCampaignAnalytics, sampleEmailSentRecords } from '@/lib/emailAnalyticsSampleData'
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
import { GlobalSearch } from '@/components/GlobalSearch'
import { ChannelManager } from '@/components/ChannelManager'
import { RoomRevenueManagement } from '@/components/RoomRevenueManagement'
import { ExtraServicesManagement } from '@/components/ExtraServicesManagement'
import { Analytics } from '@/components/Analytics'
import { Settings } from '@/components/Settings'
import { Finance } from '@/components/Finance'
import { InvoiceManagement } from '@/components/InvoiceManagement'
import { PaymentTracking } from '@/components/PaymentTracking'
import { DashboardWidgetManager } from '@/components/DashboardWidgetManager'
import { WidgetRenderer } from '@/components/DashboardWidgets'
import { getDefaultWidgetsForRole, getWidgetSize } from '@/lib/widgetConfig'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ColorMoodSelector } from '@/components/ColorMoodSelector'
import { CollapsibleSidebarGroup } from '@/components/CollapsibleSidebarGroup'
import type {
  DashboardLayout,
  DashboardWidget,
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
  GuestInvoice,
  HotelBranding,
  TaxConfiguration,
  ServiceChargeConfiguration,
  EmailTemplateAnalytics,
  EmailSentRecord,
  EmailCampaignAnalytics
} from '@/lib/types'

type Module = 'dashboard' | 'front-office' | 'housekeeping' | 'fnb' | 'inventory' | 'procurement' | 'finance' | 'hr' | 'analytics' | 'construction' | 'suppliers' | 'user-management' | 'kitchen' | 'forecasting' | 'notifications' | 'crm' | 'channel-manager' | 'room-revenue' | 'extra-services' | 'invoice-center' | 'settings'

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
  const [branding, setBranding] = useKV<HotelBranding | null>('w3-hotel-branding', null)
  const [taxes, setTaxes] = useKV<TaxConfiguration[]>('w3-hotel-taxes', [])
  const [serviceCharge, setServiceCharge] = useKV<ServiceChargeConfiguration | null>('w3-hotel-service-charge', null)
  const [emailTemplates, setEmailTemplates] = useKV<import('@/lib/invoiceEmailTemplates').EmailTemplate[]>('w3-hotel-email-templates', [])
  const [emailAnalytics, setEmailAnalytics] = useKV<EmailTemplateAnalytics[]>('w3-hotel-email-analytics', [])
  const [campaignAnalytics, setCampaignAnalytics] = useKV<EmailCampaignAnalytics[]>('w3-hotel-campaign-analytics', [])
  const [emailRecords, setEmailRecords] = useKV<EmailSentRecord[]>('w3-hotel-email-records', [])
  
  const [payments, setPayments] = useKV<import('@/lib/types').Payment[]>('w3-hotel-payments', [])
  const [expenses, setExpenses] = useKV<import('@/lib/types').Expense[]>('w3-hotel-expenses', [])
  const [accounts, setAccounts] = useKV<import('@/lib/types').Account[]>('w3-hotel-accounts', [])
  const [budgets, setBudgets] = useKV<import('@/lib/types').Budget[]>('w3-hotel-budgets', [])
  const [journalEntries, setJournalEntries] = useKV<import('@/lib/types').JournalEntry[]>('w3-hotel-journal-entries', [])
  const [chartOfAccounts, setChartOfAccounts] = useKV<import('@/lib/types').ChartOfAccount[]>('w3-hotel-chart-of-accounts', [])
  const [glEntries, setGLEntries] = useKV<import('@/lib/types').GLEntry[]>('w3-hotel-gl-entries', [])
  const [bankReconciliations, setBankReconciliations] = useKV<import('@/lib/types').BankReconciliation[]>('w3-hotel-bank-reconciliations', [])
  const [costCenters, setCostCenters] = useKV<import('@/lib/types').CostCenter[]>('w3-hotel-cost-centers', [])
  const [profitCenters, setProfitCenters] = useKV<import('@/lib/types').ProfitCenter[]>('w3-hotel-profit-centers', [])
  const [costCenterReports, setCostCenterReports] = useKV<import('@/lib/types').CostCenterReport[]>('w3-hotel-cost-center-reports', [])
  const [profitCenterReports, setProfitCenterReports] = useKV<import('@/lib/types').ProfitCenterReport[]>('w3-hotel-profit-center-reports', [])
  const [dashboardLayout, setDashboardLayout] = useKV<DashboardLayout | null>('w3-hotel-dashboard-layout', null)
  
  const [currentModule, setCurrentModule] = useState<Module>('dashboard')
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false)

  useTheme()

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

  const handleNavigateFromSearch = (module: Module, data?: any) => {
    setCurrentModule(module)
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
    setEmailTemplates(sampleEmailTemplates)
    setEmailAnalytics(sampleEmailTemplateAnalytics)
    setCampaignAnalytics(sampleCampaignAnalytics)
    setEmailRecords(sampleEmailSentRecords)
    setPayments(samplePayments)
    setExpenses(sampleExpenses)
    setAccounts(sampleAccounts)
    setBudgets(sampleBudgets)
    setCostCenters(sampleCostCenters)
    setProfitCenters(sampleProfitCenters)
    setCostCenterReports(sampleCostCenterReports)
    setProfitCenterReports(sampleProfitCenterReports)
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

  const historicalComparison = calculateHistoricalComparison(orders || [])

  const hasData = (rooms || []).length > 0

  const initializeDefaultLayout = () => {
    if (!dashboardLayout) {
      const defaultWidgets = getDefaultWidgetsForRole(currentUser.role)
      const widgets: DashboardWidget[] = defaultWidgets.map((type, index) => ({
        id: `widget-${Date.now()}-${index}`,
        type,
        title: type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        size: getWidgetSize(currentUser.role, type),
        position: index,
        isVisible: true,
        refreshInterval: 60000,
      }))

      const layout: DashboardLayout = {
        id: `layout-${Date.now()}`,
        userId: currentUser.id,
        userRole: currentUser.role,
        name: `${currentUser.role} Dashboard`,
        isDefault: true,
        isShared: false,
        widgets,
        columns: 2,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: currentUser.id
      }

      setDashboardLayout(layout)
      return layout
    }
    return dashboardLayout
  }

  const handleLayoutChange = (newLayout: DashboardLayout) => {
    setDashboardLayout(newLayout)
  }

  const renderDashboard = () => {
    const layout = initializeDefaultLayout()
    
    const widgetData = {
      urgentAmenities: getUrgentAmenities(amenities || []).length,
      lowStockAmenities: (amenities || []).filter(a => a.currentStock <= a.reorderLevel).length,
      totalAmenities: (amenities || []).length,
      urgentFood: getUrgentFoodItems(foodItems || []).length,
      expiringFood: getExpiringFoodItems(foodItems || [], 7).length,
      totalFood: (foodItems || []).length,
      activeProjects: (constructionProjects || []).filter(p => p.status === 'in-progress').length,
      totalMaterials: (constructionMaterials || []).length,
      lowStockMaterials: (constructionMaterials || []).filter(m => m.currentStock <= m.reorderLevel).length,
      rooms: rooms || [],
      lowStockItems: (inventory || []).filter(item => item.currentStock <= item.reorderLevel && item.currentStock > 0),
      pendingRequisitions: (requisitions || []).filter(r => r.status === 'pending-approval').length,
      pendingPOs: (purchaseOrders || []).filter(po => po.status === 'draft').length,
      pendingInvoices: (invoices || []).filter(inv => inv.status === 'pending-validation').length,
      departments: [
        { name: 'Front Office', performance: 85 },
        { name: 'Housekeeping', performance: 92 },
        { name: 'F&B', performance: 78 },
        { name: 'Engineering', performance: 88 },
        { name: 'Finance', performance: 95 }
      ],
      reservations: reservations || [],
      guests: guests || [],
      guestProfiles: guestProfiles || [],
      guestFeedback: guestFeedback || [],
      activeRecipes: (recipes || []).filter(r => r.isActive).length,
      consumptionLogs: (consumptionLogs || []).length,
      wasteTracking: (wasteTracking || []).length
    }

    return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">Hotel Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">Unified view of all hotel operations</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {!hasData && (
            <Button onClick={loadSampleData} size="lg" className="w-full sm:w-auto shine-effect">
              <Database size={20} className="mr-2" />
              Load Sample Data
            </Button>
          )}
          {hasData && layout && (
            <DashboardWidgetManager
              userId={currentUser.id}
              userRole={currentUser.role}
              currentLayout={layout}
              onLayoutChange={handleLayoutChange}
            />
          )}
        </div>
      </div>

      {!hasData ? (
        <Card className="p-8 md:p-12 lg:p-16 text-center glass-card shine-effect">
          <div className="max-w-md mx-auto space-y-6">
            <div className="mx-auto w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-primary/10 flex items-center justify-center floating-animation">
              <Gauge size={48} className="text-primary" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl md:text-2xl font-bold gradient-text">Welcome to W3 Hotel PMS</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Your comprehensive hotel management solution integrating all operations in one platform
              </p>
            </div>
            <Button onClick={loadSampleData} size="lg" className="w-full sm:w-auto mt-4 shine-effect">
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
          
          <div className={`grid gap-4 md:gap-6 ${layout?.columns === 1 ? 'grid-cols-1' : layout?.columns === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : layout?.columns === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
            {layout?.widgets
              .filter(w => w.isVisible)
              .sort((a, b) => a.position - b.position)
              .map(widget => (
                <div key={widget.id} className="animate-in fade-in slide-in-from-bottom-4 duration-300" style={{ animationDelay: `${widget.position * 50}ms` }}>
                  <WidgetRenderer
                    widget={widget}
                    metrics={metrics}
                    data={widgetData}
                    onNavigate={(module) => setCurrentModule(module as Module)}
                  />
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  )
  }

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
      <div className="px-3 py-4 mb-4">
        <div className="flex items-center gap-3">
          <img 
            src={w3PMSLogo}
            alt="W3 Hotel PMS" 
            className="h-12 w-auto object-contain"
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

        <CollapsibleSidebarGroup
          title="Property Management"
          groupId="property-management"
          icon={<Buildings size={14} />}
          defaultOpen={['front-office', 'crm', 'extra-services', 'housekeeping', 'fnb'].includes(currentModule)}
        >
          <Button
            variant={currentModule === 'front-office' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('front-office')}
          >
            <Bed size={18} className="mr-2" />
            Front Office
          </Button>

          <Button
            variant={currentModule === 'crm' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('crm')}
          >
            <Users size={18} className="mr-2" />
            Guest Relations
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
        </CollapsibleSidebarGroup>

        <Separator className="my-2" />

        <CollapsibleSidebarGroup
          title="Revenue Management"
          groupId="revenue-management"
          icon={<CurrencyDollar size={14} />}
          defaultOpen={['room-revenue', 'channel-manager'].includes(currentModule)}
        >
          <Button
            variant={currentModule === 'room-revenue' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('room-revenue')}
          >
            <Buildings size={18} className="mr-2" />
            Room & Revenue
          </Button>

          <Button
            variant={currentModule === 'channel-manager' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('channel-manager')}
          >
            <Buildings size={18} className="mr-2" />
            Channel Manager
          </Button>
        </CollapsibleSidebarGroup>

        <Separator className="my-2" />

        <CollapsibleSidebarGroup
          title="Inventory & Procurement"
          groupId="inventory-procurement"
          icon={<Package size={14} />}
          defaultOpen={['inventory', 'suppliers', 'procurement'].includes(currentModule)}
        >
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
        </CollapsibleSidebarGroup>

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

        <CollapsibleSidebarGroup
          title="Finance & Operations"
          groupId="finance-operations"
          icon={<CurrencyDollar size={14} />}
          defaultOpen={['finance', 'hr', 'user-management', 'construction'].includes(currentModule)}
        >
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
        </CollapsibleSidebarGroup>

        <Separator className="my-2" />

        <CollapsibleSidebarGroup
          title="Analytics & Insights"
          groupId="analytics-insights"
          icon={<ChartBar size={14} />}
          defaultOpen={['analytics', 'forecasting'].includes(currentModule)}
        >
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
        </CollapsibleSidebarGroup>

        <Separator className="my-2" />

        <Button
          variant={currentModule === 'invoice-center' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => setCurrentModule('invoice-center')}
        >
          <Receipt size={18} className="mr-2" />
          Invoice Center
        </Button>

        <Button
          variant={currentModule === 'settings' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => setCurrentModule('settings')}
        >
          <UserGear size={18} className="mr-2" />
          Settings
        </Button>
      </nav>
    </>
  )

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden lg:block w-64 border-r bg-card/80 backdrop-blur-md p-4 space-y-2 overflow-y-auto fixed left-0 top-0 bottom-0 z-40">
        <SidebarContent />
      </aside>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-4 overflow-y-auto">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <main className="flex-1 flex flex-col lg:ml-64 min-h-screen">
        <div className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur-md px-3 sm:px-4 py-3 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <div className="lg:hidden">
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <List size={20} />
                  </Button>
                </SheetTrigger>
              </div>
            </Sheet>
            <div className="hidden sm:flex items-center gap-2 flex-1 max-w-md">
              <GlobalSearch
                guests={guests || []}
                guestProfiles={guestProfiles || []}
                reservations={reservations || []}
                invoices={guestInvoices || []}
                onNavigate={handleNavigateFromSearch}
              />
            </div>
          </div>
          <img 
            src={w3PMSLogo}
            alt="W3 Hotel PMS" 
            className="h-7 sm:h-8 w-auto object-contain shrink-0"
          />
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <ColorMoodSelector />
            <ThemeToggle />
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
        
        <div className="sm:hidden px-3 py-2 border-b bg-card/95 backdrop-blur-md">
          <GlobalSearch
            guests={guests || []}
            guestProfiles={guestProfiles || []}
            reservations={reservations || []}
            invoices={guestInvoices || []}
            onNavigate={handleNavigateFromSearch}
          />
        </div>

        <div className="flex-1 p-4 md:p-6 lg:p-8">{currentModule === 'dashboard' && renderDashboard()}
          {currentModule === 'front-office' && (
            <FrontOffice
              guests={guests || []}
              setGuests={setGuests}
              guestProfiles={guestProfiles || []}
              setGuestProfiles={setGuestProfiles}
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
          {currentModule === 'finance' && (
            <Finance
              invoices={invoices || []}
              setInvoices={setInvoices}
              payments={payments || []}
              setPayments={setPayments}
              expenses={expenses || []}
              setExpenses={setExpenses}
              accounts={accounts || []}
              budgets={budgets || []}
              setBudgets={setBudgets}
              journalEntries={journalEntries || []}
              setJournalEntries={setJournalEntries}
              chartOfAccounts={chartOfAccounts || []}
              setChartOfAccounts={setChartOfAccounts}
              glEntries={glEntries || []}
              setGLEntries={setGLEntries}
              bankReconciliations={bankReconciliations || []}
              setBankReconciliations={setBankReconciliations}
              guestInvoices={guestInvoices || []}
              costCenters={costCenters || []}
              setCostCenters={setCostCenters}
              profitCenters={profitCenters || []}
              setProfitCenters={setProfitCenters}
              costCenterReports={costCenterReports || []}
              profitCenterReports={profitCenterReports || []}
              currentUser={currentUser}
            />
          )}
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
              reservations={reservations || []}
              rooms={rooms || []}
              orders={orders || []}
              folioExtraServices={folioExtraServices || []}
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
          {currentModule === 'invoice-center' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-semibold">Invoice Center</h1>
                  <p className="text-muted-foreground mt-1">
                    Centralized hub for all invoice management - guest invoices, supplier invoices, and payments
                  </p>
                </div>
              </div>

              <Tabs defaultValue="guest" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                  <TabsTrigger value="guest">
                    <Receipt size={18} className="mr-2" />
                    Guest Invoices
                  </TabsTrigger>
                  <TabsTrigger value="payments">
                    <CurrencyDollar size={18} className="mr-2" />
                    Payments
                  </TabsTrigger>
                  <TabsTrigger value="supplier">
                    <FileText size={18} className="mr-2" />
                    Supplier Invoices
                  </TabsTrigger>
                  <TabsTrigger value="analytics">
                    <ChartBar size={18} className="mr-2" />
                    Analytics
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="guest">
                  <InvoiceManagement
                    invoices={guestInvoices || []}
                    setInvoices={setGuestInvoices}
                    branding={branding || null}
                    currentUser={currentUser}
                  />
                </TabsContent>

                <TabsContent value="payments">
                  <PaymentTracking
                    payments={payments || []}
                    invoices={guestInvoices || []}
                    onUpdatePayment={(payment) => {
                      setPayments((prev) => 
                        (prev || []).map(p => p.id === payment.id ? payment : p)
                      )
                    }}
                    onUpdateInvoice={(invoice) => {
                      setGuestInvoices((prev) => 
                        (prev || []).map(inv => inv.id === invoice.id ? invoice : inv)
                      )
                    }}
                    currentUser={currentUser}
                  />
                </TabsContent>

                <TabsContent value="supplier">
                  <Card className="p-6">
                    <div className="text-center py-12">
                      <FileText size={64} className="mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Supplier Invoice Management</h3>
                      <p className="text-muted-foreground mb-6">
                        Manage supplier invoices, approvals, and three-way matching
                      </p>
                      <Button onClick={() => setCurrentModule('procurement')}>
                        Go to Procurement & Invoices
                      </Button>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-6 border-l-4 border-l-primary">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Guest Invoices</h3>
                        <Receipt size={20} className="text-primary" />
                      </div>
                      <p className="text-3xl font-semibold">{(guestInvoices || []).length}</p>
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total Amount:</span>
                          <span className="font-medium">{formatCurrency((guestInvoices || []).reduce((sum, inv) => sum + inv.grandTotal, 0))}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Amount Due:</span>
                          <span className="font-medium text-destructive">{formatCurrency((guestInvoices || []).reduce((sum, inv) => sum + inv.amountDue, 0))}</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 border-l-4 border-l-accent">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Supplier Invoices</h3>
                        <FileText size={20} className="text-accent" />
                      </div>
                      <p className="text-3xl font-semibold">{(invoices || []).length}</p>
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total Count:</span>
                          <span className="font-medium">{(invoices || []).length}</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 border-l-4 border-l-success">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Payments</h3>
                        <CurrencyDollar size={20} className="text-success" />
                      </div>
                      <p className="text-3xl font-semibold">{(payments || []).length}</p>
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-medium">{formatCurrency((payments || []).reduce((sum, p) => sum + p.amount, 0))}</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 border-l-4 border-l-secondary">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Quick Actions</h3>
                        <ClipboardText size={20} className="text-secondary" />
                      </div>
                      <div className="space-y-2 mt-4">
                        <Button variant="outline" className="w-full justify-start" size="sm">
                          <Receipt size={16} className="mr-2" />
                          New Invoice
                        </Button>
                        <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => setCurrentModule('finance')}>
                          <CurrencyDollar size={16} className="mr-2" />
                          Record Payment
                        </Button>
                      </div>
                    </Card>
                  </div>

                  <Card className="p-6 mt-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Guest Invoices</h3>
                    <div className="space-y-3">
                      {(guestInvoices || []).slice(0, 5).map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-muted-foreground">{invoice.guestName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(invoice.grandTotal)}</p>
                            <Badge className={
                              invoice.status === 'final' ? 'bg-green-100 text-green-800' :
                              invoice.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                              'bg-blue-100 text-blue-800'
                            }>
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
          {currentModule === 'settings' && (
            <Settings
              branding={branding || null}
              setBranding={setBranding}
              taxes={taxes || []}
              setTaxes={setTaxes}
              serviceCharge={serviceCharge || null}
              setServiceCharge={setServiceCharge}
              emailTemplates={emailTemplates || []}
              setEmailTemplates={setEmailTemplates}
              emailAnalytics={emailAnalytics || []}
              campaignAnalytics={campaignAnalytics || []}
              emailRecords={emailRecords || []}
              currentUser={currentUser}
            />
          )}
        </div>
        
        <footer className="border-t border-border overflow-hidden mt-auto bg-card/80 backdrop-blur-md">
          <div className="px-4 py-4 md:px-6 lg:px-8 md:py-5">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <p className="text-xs sm:text-sm font-medium text-foreground/70">
                © {new Date().getFullYear()} {branding?.hotelName || 'W3 Hotel'} - Design & Developed by
              </p>
              <a 
                href="https://www.w3media.lk/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-80 transition-all duration-300 hover:scale-105"
              >
                <img 
                  src={w3MediaLogo}
                  alt="W3 Media PVT LTD" 
                  className="h-5 sm:h-6 md:h-7"
                />
              </a>
            </div>
          </div>
        </footer>
      </main>

      <Toaster position="top-right" richColors />
    </div>
  )
}

export default App
