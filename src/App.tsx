import React, { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { useServerSync } from '@/hooks/use-server-sync'
import { Toaster, toast } from 'sonner'
import { useTheme } from '@/hooks/use-theme'
import { useBrandingTheme } from '@/hooks/use-branding-theme'
import { useMigrationManager } from '@/hooks/use-migration-manager'
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
  FileText,
  TrendUp,
  Moon,
  Layout,
  ArrowsOutCardinal
} from '@phosphor-icons/react'
import { ServerSyncStatusIndicator } from '@/components/ServerSyncStatusIndicator'
import { ServerSyncConflictDialog } from '@/components/ServerSyncConflictDialog'
import { DashboardFilters, type DashboardFilters as DashboardFiltersType } from '@/components/DashboardFilters'
import { applyDashboardFilters, type FilteredDashboardData } from '@/lib/filterHelpers'
import { generateDefaultExchangeRates } from '@/lib/currencyHelpers'
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
  type FolioExtraService,
  type MasterFolio,
  type GroupReservation
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
import { UnifiedRevenueManagement } from '@/components/UnifiedRevenueManagement'
import { ExtraServicesManagement } from '@/components/ExtraServicesManagement'
import { Analytics } from '@/components/Analytics'
import { Settings } from '@/components/Settings'
import { Finance } from '@/components/Finance'
import { InvoiceManagement } from '@/components/InvoiceManagement'
import { PaymentTracking } from '@/components/PaymentTracking'
import { Reports } from '@/components/Reports'
import { DashboardWidgetManager } from '@/components/DashboardWidgetManager'
import { DashboardLayoutManager } from '@/components/DashboardLayoutManager'
import { WidgetRenderer } from '@/components/DashboardWidgets'
import { DraggableDashboardGrid } from '@/components/DraggableDashboardGrid'
import { getDefaultWidgetsForRole, getWidgetSize } from '@/lib/widgetConfig'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ColorMoodSelector } from '@/components/ColorMoodSelector'
import { RevenueOccupancyTrends } from '@/components/RevenueOccupancyTrends'
import { NightAudit } from '@/components/NightAudit'
import { SyncStatusIndicator } from '@/components/SyncStatusIndicator'
import { MasterFolioManagement } from '@/components/MasterFolioManagement'
// New UI/UX Enhancement Components
import { EnhancedDashboardWidgets } from '@/components/EnhancedDashboardWidgets'
import { VisualFloorPlan } from '@/components/VisualFloorPlan'
import { RevenueManagementSystem } from '@/components/RevenueManagementSystem'
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

type Module = 'dashboard' | 'front-office' | 'housekeeping' | 'fnb' | 'inventory' | 'procurement' | 'finance' | 'hr' | 'analytics' | 'construction' | 'suppliers' | 'user-management' | 'kitchen' | 'forecasting' | 'notifications' | 'crm' | 'channel-manager' | 'revenue-management' | 'extra-services' | 'invoice-center' | 'settings' | 'revenue-trends' | 'reports' | 'night-audit' | 'master-folio' | 'floor-plan'

function App() {
  const {
    value: guests,
    setValue: setGuests,
    syncStatus: guestsSyncStatus,
    pendingConflicts: guestsConflicts,
    resolveConflict: resolveGuestsConflict,
    ignoreConflict: ignoreGuestsConflict,
    queueDepth: guestsQueueDepth,
    lastSyncTime: guestsLastSyncTime,
    forceSync: forceGuestsSync,
  } = useServerSync<Guest[]>('w3-hotel-guests', [], {
    syncInterval: 30000,
    autoResolveStrategy: 'manual',
    enableSync: true,
  })

  const {
    value: rooms,
    setValue: setRooms,
    syncStatus: roomsSyncStatus,
    pendingConflicts: roomsConflicts,
    resolveConflict: resolveRoomsConflict,
    ignoreConflict: ignoreRoomsConflict,
    queueDepth: roomsQueueDepth,
    lastSyncTime: roomsLastSyncTime,
    forceSync: forceRoomsSync,
  } = useServerSync<Room[]>('w3-hotel-rooms', [], {
    syncInterval: 30000,
    autoResolveStrategy: 'manual',
    enableSync: true,
  })

  const {
    value: reservations,
    setValue: setReservations,
    syncStatus: reservationsSyncStatus,
    pendingConflicts: reservationsConflicts,
    resolveConflict: resolveReservationsConflict,
    ignoreConflict: ignoreReservationsConflict,
    queueDepth: reservationsQueueDepth,
    lastSyncTime: reservationsLastSyncTime,
    forceSync: forceReservationsSync,
  } = useServerSync<Reservation[]>('w3-hotel-reservations', [], {
    syncInterval: 30000,
    autoResolveStrategy: 'manual',
    enableSync: true,
  })

  const {
    value: employees,
    setValue: setEmployees,
    syncStatus: employeesSyncStatus,
    pendingConflicts: employeesConflicts,
    resolveConflict: resolveEmployeesConflict,
    ignoreConflict: ignoreEmployeesConflict,
    queueDepth: employeesQueueDepth,
    lastSyncTime: employeesLastSyncTime,
    forceSync: forceEmployeesSync,
  } = useServerSync<Employee[]>('w3-hotel-employees', [], {
    syncInterval: 30000,
    autoResolveStrategy: 'manual',
    enableSync: true,
  })

  const {
    value: invoices,
    setValue: setInvoices,
    syncStatus: invoicesSyncStatus,
    pendingConflicts: invoicesConflicts,
    resolveConflict: resolveInvoicesConflict,
    ignoreConflict: ignoreInvoicesConflict,
    queueDepth: invoicesQueueDepth,
    lastSyncTime: invoicesLastSyncTime,
    forceSync: forceInvoicesSync,
  } = useServerSync<Invoice[]>('w3-hotel-invoices', [], {
    syncInterval: 30000,
    autoResolveStrategy: 'manual',
    enableSync: true,
  })

  const {
    value: housekeepingTasks,
    setValue: setHousekeepingTasks,
    syncStatus: housekeepingSyncStatus,
    pendingConflicts: housekeepingConflicts,
    resolveConflict: resolveHousekeepingConflict,
    ignoreConflict: ignoreHousekeepingConflict,
    queueDepth: housekeepingQueueDepth,
    lastSyncTime: housekeepingLastSyncTime,
    forceSync: forceHousekeepingSync,
  } = useServerSync<HousekeepingTask[]>('w3-hotel-housekeeping', [], {
    syncInterval: 30000,
    autoResolveStrategy: 'manual',
    enableSync: true,
  })

  const [folios, setFolios] = useKV<Folio[]>('w3-hotel-folios', [])
  const [inventory, setInventory] = useKV<InventoryItem[]>('w3-hotel-inventory', [])
  const [menuItems, setMenuItems] = useKV<MenuItem[]>('w3-hotel-menu', [])
  const [menuCategories, setMenuCategories] = useKV<import('@/lib/types').MenuItemCategory[]>('w3-hotel-menu-categories', [])
  const [orders, setOrders] = useKV<Order[]>('w3-hotel-orders', [])
  const [suppliers, setSuppliers] = useKV<Supplier[]>('w3-hotel-suppliers', [])
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
  const [dashboardLayout, setDashboardLayout] = useKV<DashboardLayout | null>('w3-hotel-active-dashboard-layout', null)
  const [savedDashboardLayouts] = useKV<DashboardLayout[]>('w3-hotel-dashboard-layouts', [])
  const [invoiceSequences, setInvoiceSequences] = useKV<import('@/lib/types').InvoiceNumberSequence[]>('w3-hotel-invoice-sequences', [])
  const [nightAuditLogs, setNightAuditLogs] = useKV<import('@/lib/types').NightAuditLog[]>('w3-hotel-night-audit-logs', [])
  const [mealCombos, setMealCombos] = useKV<import('@/lib/types').MealCombo[]>('w3-hotel-meal-combos', [])
  const [currencyConfiguration, setCurrencyConfiguration] = useKV<import('@/lib/currencyTypes').CurrencyConfiguration | null>('w3-hotel-currency-config', null)
  const [exchangeRates, setExchangeRates] = useKV<import('@/lib/currencyTypes').ExchangeRate[]>('w3-hotel-exchange-rates', [])
  const [masterFolios, setMasterFolios] = useKV<MasterFolio[]>('w3-hotel-master-folios', [])
  const [groupReservations, setGroupReservations] = useKV<GroupReservation[]>('w3-hotel-group-reservations', [])
  
  const [currentModule, setCurrentModule] = useState<Module>('dashboard')
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState<string>('branding')
  const [showSyncConflicts, setShowSyncConflicts] = useState(false)
  const [dragMode, setDragMode] = useState(false)
  
  const [dashboardFilters, setDashboardFilters] = useState<DashboardFiltersType>({
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date()
    },
    category: 'all'
  })

  const getCombinedSyncStatus = (): 'synced' | 'syncing' | 'offline' | 'conflict' | 'error' => {
    if (guestsConflicts.length > 0 || roomsConflicts.length > 0 || reservationsConflicts.length > 0 || 
        employeesConflicts.length > 0 || invoicesConflicts.length > 0 || housekeepingConflicts.length > 0) {
      return 'conflict'
    }
    if (guestsSyncStatus === 'syncing' || roomsSyncStatus === 'syncing' || reservationsSyncStatus === 'syncing' ||
        employeesSyncStatus === 'syncing' || invoicesSyncStatus === 'syncing' || housekeepingSyncStatus === 'syncing') {
      return 'syncing'
    }
    if (guestsSyncStatus === 'offline' || roomsSyncStatus === 'offline' || reservationsSyncStatus === 'offline' ||
        employeesSyncStatus === 'offline' || invoicesSyncStatus === 'offline' || housekeepingSyncStatus === 'offline') {
      return 'offline'
    }
    if (guestsSyncStatus === 'error' || roomsSyncStatus === 'error' || reservationsSyncStatus === 'error' ||
        employeesSyncStatus === 'error' || invoicesSyncStatus === 'error' || housekeepingSyncStatus === 'error') {
      return 'error'
    }
    return 'synced'
  }

  const getCombinedQueueDepth = () => guestsQueueDepth + roomsQueueDepth + reservationsQueueDepth + 
    employeesQueueDepth + invoicesQueueDepth + housekeepingQueueDepth
  
  const getCombinedConflictCount = () => guestsConflicts.length + roomsConflicts.length + reservationsConflicts.length +
    employeesConflicts.length + invoicesConflicts.length + housekeepingConflicts.length

  const getLatestSyncTime = () => {
    const times = [guestsLastSyncTime, roomsLastSyncTime, reservationsLastSyncTime, 
      employeesLastSyncTime, invoicesLastSyncTime, housekeepingLastSyncTime].filter(Boolean)
    return times.length > 0 ? Math.max(...times) : Date.now()
  }

  const handleForceSync = () => {
    forceGuestsSync()
    forceRoomsSync()
    forceReservationsSync()
    forceEmployeesSync()
    forceInvoicesSync()
    forceHousekeepingSync()
  }

  const allConflicts = [
    ...guestsConflicts.map(c => ({ ...c, dataType: 'Guests' as const })),
    ...roomsConflicts.map(c => ({ ...c, dataType: 'Rooms' as const })),
    ...reservationsConflicts.map(c => ({ ...c, dataType: 'Reservations' as const })),
    ...employeesConflicts.map(c => ({ ...c, dataType: 'Employees' as const })),
    ...invoicesConflicts.map(c => ({ ...c, dataType: 'Supplier Invoices' as const })),
    ...housekeepingConflicts.map(c => ({ ...c, dataType: 'Housekeeping Tasks' as const })),
  ]

  const handleResolveConflict = (conflictId: string, strategy: any, customValue?: any) => {
    const conflict = allConflicts.find(c => c.id === conflictId)
    if (!conflict) return

    if (conflict.dataType === 'Guests') {
      resolveGuestsConflict(conflictId, strategy, customValue)
    } else if (conflict.dataType === 'Rooms') {
      resolveRoomsConflict(conflictId, strategy, customValue)
    } else if (conflict.dataType === 'Reservations') {
      resolveReservationsConflict(conflictId, strategy, customValue)
    } else if (conflict.dataType === 'Employees') {
      resolveEmployeesConflict(conflictId, strategy, customValue)
    } else if (conflict.dataType === 'Supplier Invoices') {
      resolveInvoicesConflict(conflictId, strategy, customValue)
    } else if (conflict.dataType === 'Housekeeping Tasks') {
      resolveHousekeepingConflict(conflictId, strategy, customValue)
    }
  }

  const handleIgnoreConflict = (conflictId: string) => {
    const conflict = allConflicts.find(c => c.id === conflictId)
    if (!conflict) return

    if (conflict.dataType === 'Guests') {
      ignoreGuestsConflict(conflictId)
    } else if (conflict.dataType === 'Rooms') {
      ignoreRoomsConflict(conflictId)
    } else if (conflict.dataType === 'Reservations') {
      ignoreReservationsConflict(conflictId)
    } else if (conflict.dataType === 'Employees') {
      ignoreEmployeesConflict(conflictId)
    } else if (conflict.dataType === 'Supplier Invoices') {
      ignoreInvoicesConflict(conflictId)
    } else if (conflict.dataType === 'Housekeeping Tasks') {
      ignoreHousekeepingConflict(conflictId)
    }
  }

  useEffect(() => {
    if (getCombinedConflictCount() > 0) {
      setShowSyncConflicts(true)
    }
  }, [guestsConflicts.length, roomsConflicts.length, reservationsConflicts.length, 
      employeesConflicts.length, invoicesConflicts.length, housekeepingConflicts.length])

  useTheme()
  useBrandingTheme(branding || null)
  
  const {
    isInitialized: migrationInitialized,
    currentVersion: systemVersion,
    pendingMigrations: systemPendingMigrations
  } = useMigrationManager()

  const currentUser = React.useMemo(() => {
    return (systemUsers || [])[0] || sampleSystemUsers[0]
  }, [systemUsers])

  useEffect(() => {
    if (!currentUser?.id) return
    if (savedDashboardLayouts && savedDashboardLayouts.length > 0) {
      const userDefaultLayout = savedDashboardLayouts.find(
        l => l.userId === currentUser.id && l.isDefault
      )
      if (userDefaultLayout && !dashboardLayout) {
        setDashboardLayout(userDefaultLayout)
      }
    }
  }, [currentUser?.id, savedDashboardLayouts, dashboardLayout])

  useEffect(() => {
    const handleNavigateToSettings = (event: CustomEvent) => {
      setCurrentModule('settings')
      if (event.detail) {
        setSettingsTab(event.detail)
      }
    }

    window.addEventListener('navigate-to-settings', handleNavigateToSettings as EventListener)
    return () => {
      window.removeEventListener('navigate-to-settings', handleNavigateToSettings as EventListener)
    }
  }, [])

  useEffect(() => {
    if (!currentUser?.id) return
    
    if (!currencyConfiguration) {
      const defaultCurrencyConfig: import('@/lib/currencyTypes').CurrencyConfiguration = {
        id: 'currency-config-default',
        baseCurrency: 'LKR',
        displayCurrency: 'LKR',
        allowedCurrencies: ['LKR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'CNY', 'INR'],
        autoUpdateRates: false,
        rateUpdateInterval: 3600000,
        roundingMode: 'round',
        showOriginalAmount: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        updatedBy: currentUser.id
      }
      setCurrencyConfiguration(defaultCurrencyConfig)
    }

    if (!exchangeRates || exchangeRates.length === 0) {
      const defaultRates = generateDefaultExchangeRates('LKR', currentUser.id)
      setExchangeRates(defaultRates)
    }
  }, [currentUser?.id, currencyConfiguration, exchangeRates])

  // Load branding from database on app initialization
  useEffect(() => {
    const loadBranding = async () => {
      try {
        const response = await fetch('/api/branding');
        if (response.ok) {
          const savedBranding = await response.json();
          if (savedBranding) {
            setBranding(savedBranding);
          }
        }
      } catch (error) {
        console.error('Failed to load branding from database:', error);
        // If branding fails to load, use local storage or defaults
      }
    };
    
    loadBranding();
  }, [])

  useEffect(() => {
    const hasAnyData = (rooms || []).length > 0 || 
                       (guests || []).length > 0 || 
                       (reservations || []).length > 0 || 
                       (employees || []).length > 0

    if (!hasAnyData) {
      loadSampleData()
    }
  }, [])

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
    if (!currentUser?.id || !currentUser?.role) {
      return null
    }
    
    if (!dashboardLayout) {
      const defaultWidgets = getDefaultWidgetsForRole(currentUser.role) || []
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
    
    const rawData: FilteredDashboardData = {
      rooms: rooms || [],
      reservations: reservations || [],
      housekeepingTasks: housekeepingTasks || [],
      orders: orders || [],
      inventory: inventory || [],
      maintenanceRequests: maintenanceRequests || [],
      guests: guests || [],
      employees: employees || [],
      payments: payments || [],
      expenses: expenses || [],
      invoices: guestInvoices || [],
      foodItems: foodItems || [],
      amenities: amenities || [],
      constructionMaterials: constructionMaterials || [],
      generalProducts: generalProducts || []
    }
    
    const { current: filteredData, comparison: comparisonData } = applyDashboardFilters(rawData, dashboardFilters)
    
    const filteredMetrics = calculateDashboardMetrics(
      filteredData.rooms,
      filteredData.reservations,
      filteredData.housekeepingTasks,
      filteredData.orders,
      filteredData.inventory,
      filteredData.maintenanceRequests
    )
    
    const widgetData = {
      urgentAmenities: getUrgentAmenities(filteredData.amenities).length,
      lowStockAmenities: filteredData.amenities.filter(a => a.currentStock <= a.reorderLevel).length,
      totalAmenities: filteredData.amenities.length,
      urgentFood: getUrgentFoodItems(filteredData.foodItems).length,
      expiringFood: getExpiringFoodItems(filteredData.foodItems, 7).length,
      totalFood: filteredData.foodItems.length,
      activeProjects: (constructionProjects || []).filter(p => p.status === 'in-progress').length,
      totalMaterials: filteredData.constructionMaterials.length,
      lowStockMaterials: filteredData.constructionMaterials.filter(m => m.currentStock <= m.reorderLevel).length,
      rooms: filteredData.rooms,
      lowStockItems: filteredData.inventory.filter(item => item.currentStock <= item.reorderLevel && item.currentStock > 0),
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
      reservations: filteredData.reservations,
      guests: filteredData.guests,
      guestProfiles: guestProfiles || [],
      guestFeedback: guestFeedback || [],
      activeRecipes: (recipes || []).filter(r => r.isActive).length,
      consumptionLogs: (consumptionLogs || []).length,
      wasteTracking: (wasteTracking || []).length,
      comparisonData
    }

    const handleFiltersChange = (newFilters: DashboardFiltersType) => {
      setDashboardFilters(newFilters)
    }

    const handleFiltersReset = () => {
      setDashboardFilters({
        dateRange: {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          to: new Date()
        },
        category: 'all'
      })
    }

    return (
    <div className="mobile-spacing-compact">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <Gauge size={16} className="mr-2" />
            Operations Overview
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Sparkle size={16} className="mr-2" />
            Advanced Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="mobile-heading-responsive font-semibold text-foreground">Hotel Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground mobile-text-responsive">Unified view of all hotel operations</p>
              {layout && (
                <Badge variant="outline" className="hidden sm:inline-flex">
                  <Layout size={12} className="mr-1" />
                  {layout.name}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {!hasData && (
              <Button onClick={loadSampleData} size="lg" className="w-full sm:w-auto mobile-optimized-button">
                <Database size={20} className="mr-2" />
                <span className="hidden sm:inline">Load Sample Data</span>
                <span className="sm:hidden">Load Data</span>
              </Button>
            )}
            {hasData && layout && currentUser?.id && (
              <>
                <Button
                  variant={dragMode ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => setDragMode(!dragMode)}
                  className="mobile-optimized-button"
                >
                  <ArrowsOutCardinal size={20} className="mr-2" />
                  <span className="hidden sm:inline">{dragMode ? 'Exit Rearrange' : 'Rearrange Widgets'}</span>
                  <span className="sm:hidden">{dragMode ? 'Exit' : 'Rearrange'}</span>
                </Button>
                <DashboardLayoutManager
                  userId={currentUser.id}
                  userRole={currentUser.role}
                  currentLayout={layout}
                  onLayoutChange={handleLayoutChange}
                />
                <DashboardWidgetManager
                  userId={currentUser.id}
                  userRole={currentUser.role}
                  currentLayout={layout}
                  onLayoutChange={handleLayoutChange}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {!hasData ? (
        <Card className="mobile-card-compact text-center">
          <div className="max-w-md mx-auto">
            <Gauge size={48} className="mx-auto text-primary mb-4 sm:w-16 sm:h-16" />
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2">Welcome to W3 Hotel PMS</h3>
            <p className="text-muted-foreground mb-6 mobile-text-responsive">
              Your comprehensive hotel management solution integrating all operations in one platform
            </p>
            <Button onClick={loadSampleData} size="lg" className="w-full sm:w-auto mobile-optimized-button">
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
          
          <DashboardFilters
            filters={dashboardFilters}
            onFiltersChange={handleFiltersChange}
            onReset={handleFiltersReset}
          />
          
          <DraggableDashboardGrid
            layout={layout}
            metrics={filteredMetrics}
            data={widgetData}
            onNavigate={(module) => setCurrentModule(module as Module)}
            onLayoutChange={handleLayoutChange}
            dragEnabled={dragMode}
            onDragEnabledChange={setDragMode}
          />
        </>
      )}
        </TabsContent>

        <TabsContent value="advanced">
          <EnhancedDashboardWidgets />
        </TabsContent>
      </Tabs>
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
            src={branding?.logo || w3PMSLogo}
            alt={branding?.hotelName || "W3 Hotel PMS"} 
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

          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Operations</p>
          </div>

          <Button
            variant={currentModule === 'front-office' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('front-office')}
          >
            <Bed size={18} className="mr-2" />
            Front Office
          </Button>

          <Button
            variant={currentModule === 'floor-plan' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('floor-plan')}
          >
            <Layout size={18} className="mr-2" />
            Floor Plan
          </Button>

          <Button
            variant={currentModule === 'housekeeping' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('housekeeping')}
          >
            <Broom size={18} className="mr-2" />
            Housekeeping
          </Button>

          <Separator className="my-2" />

          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Guest Services</p>
          </div>

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

          <Separator className="my-2" />

          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Food & Beverage</p>
          </div>

          <Button
            variant={currentModule === 'fnb' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('fnb')}
          >
            <ForkKnife size={18} className="mr-2" />
            F&B / POS
          </Button>

          <Button
            variant={currentModule === 'kitchen' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('kitchen')}
          >
            <ChefHat size={18} className="mr-2" />
            Kitchen Operations
          </Button>

          <Separator className="my-2" />

          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Revenue & Distribution</p>
          </div>

          <Button
            variant={currentModule === 'revenue-management' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('revenue-management')}
          >
            <TrendUp size={18} className="mr-2" />
            Revenue Management
          </Button>

          <Button
            variant={currentModule === 'channel-manager' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('channel-manager')}
          >
            <Buildings size={18} className="mr-2" />
            Channel Manager
          </Button>

          <Separator className="my-2" />

          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Inventory & Procurement</p>
          </div>

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

          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Finance & Accounting</p>
          </div>

          <Button
            variant={currentModule === 'finance' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('finance')}
          >
            <CurrencyDollar size={18} className="mr-2" />
            Finance
          </Button>

          <Button
            variant={currentModule === 'invoice-center' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('invoice-center')}
          >
            <Receipt size={18} className="mr-2" />
            Invoice Center
          </Button>

          <Button
            variant={currentModule === 'night-audit' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('night-audit')}
          >
            <Moon size={18} className="mr-2" />
            Night Audit
          </Button>

          <Button
            variant={currentModule === 'master-folio' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('master-folio')}
          >
            <Buildings size={18} className="mr-2" />
            Master Folio
          </Button>

          <Separator className="my-2" />

          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">HR & Administration</p>
          </div>

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

          <Separator className="my-2" />

          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Analytics & Reports</p>
          </div>

          <Button
            variant={currentModule === 'analytics' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('analytics')}
          >
            <ChartBar size={18} className="mr-2" />
            Analytics
          </Button>

          <Button
            variant={currentModule === 'revenue-trends' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('revenue-trends')}
          >
            <TrendUp size={18} className="mr-2" />
            Revenue & Occupancy
          </Button>

          <Button
            variant={currentModule === 'forecasting' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('forecasting')}
          >
            <Sparkle size={18} className="mr-2" />
            AI Forecasting
          </Button>

          <Button
            variant={currentModule === 'reports' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('reports')}
          >
            <FileText size={18} className="mr-2" />
            Reports
          </Button>

          <Separator className="my-2" />

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
      {!currentUser?.id ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Gauge size={64} className="mx-auto text-primary mb-4 animate-spin-slow" />
            <p className="text-muted-foreground">Loading system...</p>
          </div>
        </div>
      ) : (
        <>
      <aside className="hidden lg:block w-64 border-r bg-card p-4 space-y-2 overflow-y-auto fixed left-0 top-0 bottom-0 z-40">
        <SidebarContent />
      </aside>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-4 overflow-y-auto">
          <SidebarContent />
        </SheetContent>

        <main className="flex-1 flex flex-col lg:ml-64 min-h-screen">
          <div className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="lg:hidden">
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                      <List size={20} className="sm:w-6 sm:h-6" />
                    </Button>
                  </SheetTrigger>
                </div>
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
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="hidden md:flex items-center gap-2">
                  <ServerSyncStatusIndicator
                    syncStatus={getCombinedSyncStatus()}
                    queueDepth={getCombinedQueueDepth()}
                    lastSyncTime={getLatestSyncTime()}
                    conflictCount={getCombinedConflictCount()}
                    onForceSync={handleForceSync}
                    onShowConflicts={() => setShowSyncConflicts(true)}
                  />
                  <SyncStatusIndicator />
                </div>
                <div className="hidden sm:block">
                  <ColorMoodSelector />
                </div>
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
          </div>
          
          <div className="sm:hidden px-3 py-2 border-b bg-card">
            <GlobalSearch
              guests={guests || []}
              guestProfiles={guestProfiles || []}
              reservations={reservations || []}
              invoices={guestInvoices || []}
              onNavigate={handleNavigateFromSearch}
            />
          </div>

        <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">{currentModule === 'dashboard' && renderDashboard()}
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
          {currentModule === 'revenue-management' && (
            <UnifiedRevenueManagement
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
              reservations={reservations || []}
              invoices={guestInvoices || []}
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
              menuCategories={menuCategories || []}
              setMenuCategories={setMenuCategories}
              orders={orders || []}
              setOrders={setOrders}
              guests={guests || []}
              rooms={rooms || []}
              mealCombos={mealCombos || []}
              setMealCombos={setMealCombos}
              currentUser={currentUser}
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
              rooms={rooms || []}
              reservations={reservations || []}
              guests={guests || []}
              guestProfiles={guestProfiles || []}
              orders={orders || []}
              foodItems={foodItems || []}
              suppliers={suppliers || []}
              grns={grns || []}
              recipes={recipes || []}
              menus={menus || []}
              consumptionLogs={consumptionLogs || []}
              purchaseOrders={purchaseOrders || []}
              employees={employees || []}
              housekeepingTasks={housekeepingTasks || []}
              guestInvoices={guestInvoices || []}
              payments={payments || []}
              expenses={expenses || []}
              folios={folios || []}
              inventory={inventory || []}
              complaints={complaints || []}
              guestFeedback={guestFeedback || []}
              channelReservations={channelReservations || []}
              channelPerformance={channelPerformance || []}
              maintenanceRequests={maintenanceRequests || []}
              emailAnalytics={emailAnalytics || []}
              campaignAnalytics={campaignAnalytics || []}
              emailRecords={emailRecords || []}
            />
          )}
          {currentModule === 'revenue-trends' && (
            <RevenueOccupancyTrends
              reservations={reservations || []}
              orders={orders || []}
              invoices={guestInvoices || []}
              totalRooms={(rooms || []).length}
              rooms={rooms || []}
              roomTypes={roomTypeConfigs || []}
              ratePlans={ratePlanConfigs || []}
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
          {currentModule === 'floor-plan' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Visual Floor Plan</h1>
                  <p className="text-muted-foreground">
                    Interactive room status visualization
                  </p>
                </div>
              </div>
              <VisualFloorPlan rooms={rooms || []} reservations={reservations || []} />
            </div>
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
                        <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => setCurrentModule('front-office')}>
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
              currencyConfiguration={currencyConfiguration || null}
              setCurrencyConfiguration={setCurrencyConfiguration}
              exchangeRates={exchangeRates || []}
              setExchangeRates={setExchangeRates}
              currentUser={currentUser}
              activeTab={settingsTab}
            />
          )}
          {currentModule === 'reports' && (
            <Reports
              rooms={rooms || []}
              reservations={reservations || []}
              guests={guests || []}
              orders={orders || []}
              employees={employees || []}
              housekeepingTasks={housekeepingTasks || []}
              inventory={inventory || []}
              guestInvoices={guestInvoices || []}
              payments={payments || []}
              expenses={expenses || []}
              currentUser={currentUser}
            />
          )}
          {currentModule === 'night-audit' && (
            <NightAudit
              folios={folios || []}
              setFolios={setFolios}
              reservations={reservations || []}
              rooms={rooms || []}
              guests={guests || []}
              guestInvoices={guestInvoices || []}
              setGuestInvoices={setGuestInvoices}
              payments={payments || []}
              setPayments={setPayments}
              taxes={taxes || []}
              serviceCharge={serviceCharge || null}
              invoiceSequences={invoiceSequences || []}
              setInvoiceSequences={setInvoiceSequences}
              auditLogs={nightAuditLogs || []}
              setAuditLogs={setNightAuditLogs}
              currentUser={currentUser}
            />
          )}
          {currentModule === 'master-folio' && (
            <MasterFolioManagement
              masterFolios={masterFolios || []}
              setMasterFolios={setMasterFolios}
              folios={folios || []}
              setFolios={setFolios}
              reservations={reservations || []}
              guests={guests || []}
              currentUser={currentUser}
            />
          )}
        </div>
        
        <footer className="border-t border-border overflow-hidden mt-auto bg-card">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-5">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 md:gap-3">
              <p className="text-xs sm:text-sm font-medium text-foreground/80 text-center">
                © {new Date().getFullYear()} {branding?.hotelName || 'W3 Hotel'} - Design & Developed by
              </p>
              <a 
                href="https://www.w3media.lk/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity mobile-optimized-button p-0 min-h-0"
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
      </Sheet>

      <ServerSyncConflictDialog
        open={showSyncConflicts}
        onOpenChange={setShowSyncConflicts}
        conflicts={allConflicts}
        onResolve={handleResolveConflict}
        onIgnore={handleIgnoreConflict}
      />

      <Toaster position="top-right" richColors />
      </>
      )}
    </div>
  )
}

export default App
