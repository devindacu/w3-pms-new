import * as React from 'react'
import { useState, lazy, Suspense } from 'react'
import { useKV } from '@github/spark/hooks'
import { useAutoBackup } from '@/hooks/use-auto-backup'
import { Toaster } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import w3PMSLogo from '@/assets/images/W3-PMS.png'
import {
  LayoutDashboard,
  Building2,
  Users,
  Sparkles,
  BedDouble,
  ClipboardList,
  UtensilsCrossed,
  Package,
  ShoppingCart,
  DollarSign,
  UserCog,
  Wrench,
  BarChart3,
  Settings as SettingsIcon,
  Search,
  Bell,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Menu,
  X
} from 'lucide-react'
import type { 
  SystemUser,
  Guest,
  GuestProfile,
  Reservation,
  Room,
  Folio,
  InventoryItem,
  HousekeepingTask,
  MenuItem,
  Order,
  Supplier,
  Employee,
  MaintenanceRequest,
  ExtraService,
  ExtraServiceCategory,
  FolioExtraService,
  GuestComplaint,
  GuestFeedback,
  MarketingCampaign,
  MarketingTemplate,
  UpsellOffer,
  UpsellTransaction,
  LoyaltyTransaction
} from '@/lib/types'
import { 
  sampleSystemUsers,
  sampleGuests,
  sampleReservations,
  sampleRooms,
  sampleFolios,
  sampleInventory,
  sampleHousekeepingTasks,
  sampleMenuItems,
  sampleOrders,
  sampleSuppliers,
  sampleEmployees,
  sampleMaintenanceRequests
} from '@/lib/sampleData'
import {
  sampleRoomTypeConfigs,
  sampleRatePlans,
  sampleSeasons,
  sampleEventDays,
  sampleCorporateAccounts
} from '@/lib/revenueManagementSampleData'

const FrontOffice = lazy(() => import('@/components/FrontOffice').then(m => ({ default: m.FrontOffice })))
const Housekeeping = lazy(() => import('@/components/Housekeeping').then(m => ({ default: m.Housekeeping })))
const FnBPOS = lazy(() => import('@/components/FnBPOS').then(m => ({ default: m.FnBPOS })))
const KitchenManagement = lazy(() => import('@/components/KitchenManagement').then(m => ({ default: m.KitchenManagement })))
const CRM = lazy(() => import('@/components/CRM').then(m => ({ default: m.CRM })))
const ExtraServicesManagement = lazy(() => import('@/components/ExtraServicesManagement').then(m => ({ default: m.ExtraServicesManagement })))
const RevenueManagement = lazy(() => import('@/components/RevenueManagement').then(m => ({ default: m.RevenueManagement })))
const ChannelManager = lazy(() => import('@/components/ChannelManager').then(m => ({ default: m.ChannelManager })))
const InventoryManagement = lazy(() => import('@/components/InventoryManagement').then(m => ({ default: m.InventoryManagement })))
const Procurement = lazy(() => import('@/components/Procurement').then(m => ({ default: m.Procurement })))
const SupplierManagement = lazy(() => import('@/components/SupplierManagement').then(m => ({ default: m.SupplierManagement })))
const Finance = lazy(() => import('@/components/Finance').then(m => ({ default: m.Finance })))
const HRManagement = lazy(() => import('@/components/HRManagement').then(m => ({ default: m.HRManagement })))
const Analytics = lazy(() => import('@/components/Analytics').then(m => ({ default: m.Analytics })))
const ConstructionManagement = lazy(() => import('@/components/ConstructionManagement').then(m => ({ default: m.ConstructionManagement })))
const UserManagement = lazy(() => import('@/components/UserManagement').then(m => ({ default: m.UserManagement })))
const Settings = lazy(() => import('@/components/Settings').then(m => ({ default: m.Settings })))

const LoadingState = () => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground">Loading module...</p>
    </div>
  </div>
)

type Module = 'dashboard' | 'front-office' | 'housekeeping' | 'fnb' | 'kitchen' | 'inventory' | 'procurement' | 'finance' | 'hr' | 'analytics' | 'construction' | 'suppliers' | 'user-management' | 'crm' | 'channel-manager' | 'room-revenue' | 'extra-services' | 'settings'

function App() {
  useAutoBackup({ debounceMs: 10000 })
  
  const [systemUsers] = useKV<SystemUser[]>('w3-hotel-system-users', sampleSystemUsers)
  const [currentModule, setCurrentModule] = useState<Module>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const [guests, setGuests] = useKV<Guest[]>('w3-hotel-guests', sampleGuests)
  const [guestProfiles, setGuestProfiles] = useKV<GuestProfile[]>('w3-hotel-guest-profiles', [])
  const [reservations, setReservations] = useKV<Reservation[]>('w3-hotel-reservations', sampleReservations)
  const [rooms, setRooms] = useKV<Room[]>('w3-hotel-rooms', sampleRooms)
  const [folios, setFolios] = useKV<Folio[]>('w3-hotel-folios', sampleFolios)
  const [inventory, setInventory] = useKV<InventoryItem[]>('w3-hotel-inventory', sampleInventory)
  const [housekeepingTasks, setHousekeepingTasks] = useKV<HousekeepingTask[]>('w3-hotel-housekeeping-tasks', sampleHousekeepingTasks)
  const [menuItems, setMenuItems] = useKV<MenuItem[]>('w3-hotel-menu-items', sampleMenuItems)
  const [orders, setOrders] = useKV<Order[]>('w3-hotel-orders', sampleOrders)
  const [suppliers, setSuppliers] = useKV<Supplier[]>('w3-hotel-suppliers', sampleSuppliers)
  const [employees, setEmployees] = useKV<Employee[]>('w3-hotel-employees', sampleEmployees)
  const [maintenanceRequests, setMaintenanceRequests] = useKV<MaintenanceRequest[]>('w3-hotel-maintenance', sampleMaintenanceRequests)
  const [extraServices, setExtraServices] = useKV<ExtraService[]>('w3-hotel-extra-services', [])
  const [serviceCategories, setServiceCategories] = useKV<ExtraServiceCategory[]>('w3-hotel-service-categories', [])
  const [folioExtraServices, setFolioExtraServices] = useKV<FolioExtraService[]>('w3-hotel-folio-extra-services', [])
  const [complaints, setComplaints] = useKV<GuestComplaint[]>('w3-hotel-complaints', [])
  const [feedback, setFeedback] = useKV<GuestFeedback[]>('w3-hotel-feedback', [])
  const [campaigns, setCampaigns] = useKV<MarketingCampaign[]>('w3-hotel-campaigns', [])
  const [templates, setTemplates] = useKV<MarketingTemplate[]>('w3-hotel-templates', [])
  const [upsellOffers, setUpsellOffers] = useKV<UpsellOffer[]>('w3-hotel-upsell-offers', [])
  const [upsellTransactions, setUpsellTransactions] = useKV<UpsellTransaction[]>('w3-hotel-upsell-transactions', [])
  const [loyaltyTransactions, setLoyaltyTransactions] = useKV<LoyaltyTransaction[]>('w3-hotel-loyalty-transactions', [])
  
  const [kitchenStations, setKitchenStations] = useKV<any[]>('w3-hotel-kitchen-stations', [])
  const [kitchenStaff, setKitchenStaff] = useKV<any[]>('w3-hotel-kitchen-staff', [])
  const [productionSchedules, setProductionSchedules] = useKV<any[]>('w3-hotel-production-schedules', [])
  const [kitchenInventoryIssues, setKitchenInventoryIssues] = useKV<any[]>('w3-hotel-kitchen-inventory-issues', [])
  const [wasteTracking, setWasteTracking] = useKV<any[]>('w3-hotel-waste-tracking', [])
  
  const [roomTypeConfigs, setRoomTypeConfigs] = useKV<any[]>('w3-hotel-room-type-configs', sampleRoomTypeConfigs)
  const [ratePlans, setRatePlans] = useKV<any[]>('w3-hotel-rate-plans', sampleRatePlans)
  const [seasons, setSeasons] = useKV<any[]>('w3-hotel-seasons', sampleSeasons)
  const [eventDays, setEventDays] = useKV<any[]>('w3-hotel-event-days', sampleEventDays)
  const [corporateAccounts, setCorporateAccounts] = useKV<any[]>('w3-hotel-corporate-accounts', sampleCorporateAccounts)
  const [rateCalendar, setRateCalendar] = useKV<any[]>('w3-hotel-rate-calendar', [])
  
  const [invoices, setInvoices] = useKV<any[]>('w3-hotel-finance-invoices', [])
  const [payments, setPayments] = useKV<any[]>('w3-hotel-finance-payments', [])
  const [expenses, setExpenses] = useKV<any[]>('w3-hotel-finance-expenses', [])
  const [accounts, setAccounts] = useKV<any[]>('w3-hotel-finance-accounts', [])
  const [budgets, setBudgets] = useKV<any[]>('w3-hotel-finance-budgets', [])
  const [journalEntries, setJournalEntries] = useKV<any[]>('w3-hotel-journal-entries', [])
  const [chartOfAccounts, setChartOfAccounts] = useKV<any[]>('w3-hotel-chart-of-accounts', [])
  
  const [grns, setGrns] = useKV<any[]>('w3-hotel-grns', [])
  const [recipes, setRecipes] = useKV<any[]>('w3-hotel-recipes', [])
  const [menus, setMenus] = useKV<any[]>('w3-hotel-menus', [])
  const [consumptionLogs, setConsumptionLogs] = useKV<any[]>('w3-hotel-consumption-logs', [])
  const [purchaseOrders, setPurchaseOrders] = useKV<any[]>('w3-hotel-purchase-orders', [])
  
  const [branding, setBranding] = useKV<any>('w3-hotel-branding', null)
  const [taxes, setTaxes] = useKV<any[]>('w3-hotel-taxes', [])
  const [serviceCharge, setServiceCharge] = useKV<any>('w3-hotel-service-charge', null)
  const [emailTemplates, setEmailTemplates] = useKV<any[]>('w3-hotel-email-templates', [])
  const [emailAnalytics, setEmailAnalytics] = useKV<any[]>('w3-hotel-email-analytics', [])
  const [campaignAnalytics, setCampaignAnalytics] = useKV<any[]>('w3-hotel-campaign-analytics', [])
  const [emailRecords, setEmailRecords] = useKV<any[]>('w3-hotel-email-records', [])
  
  const [attendance, setAttendance] = useKV<any[]>('w3-hotel-attendance', [])
  const [leaveRequests, setLeaveRequests] = useKV<any[]>('w3-hotel-leave-requests', [])
  const [shifts, setShifts] = useKV<any[]>('w3-hotel-shifts', [])
  const [dutyRosters, setDutyRosters] = useKV<any[]>('w3-hotel-duty-rosters', [])
  const [performanceReviews, setPerformanceReviews] = useKV<any[]>('w3-hotel-performance-reviews', [])
  
  const [otaConnections, setOtaConnections] = useKV<any[]>('w3-hotel-ota-connections', [])
  const [channelInventory, setChannelInventory] = useKV<any[]>('w3-hotel-channel-inventory', [])
  const [channelRates, setChannelRates] = useKV<any[]>('w3-hotel-channel-rates', [])
  const [channelReservations, setChannelReservations] = useKV<any[]>('w3-hotel-channel-reservations', [])
  const [syncLogs, setSyncLogs] = useKV<any[]>('w3-hotel-sync-logs', [])
  const [channelPerformance, setChannelPerformance] = useKV<any[]>('w3-hotel-channel-performance', [])
  const [channelReviews, setChannelReviews] = useKV<any[]>('w3-hotel-channel-reviews', [])
  const [bulkOperations, setBulkOperations] = useKV<any[]>('w3-hotel-bulk-operations', [])
  
  const [amenityUsageLogs, setAmenityUsageLogs] = useKV<any[]>('w3-hotel-amenity-usage-logs', [])
  const [amenityAutoOrders, setAmenityAutoOrders] = useKV<any[]>('w3-hotel-amenity-auto-orders', [])
  
  const [requisitions, setRequisitions] = useKV<any[]>('w3-hotel-requisitions', [])
  const [procurementInvoices, setProcurementInvoices] = useKV<any[]>('w3-hotel-procurement-invoices', [])
  
  const [foodItems, setFoodItems] = useKV<any[]>('w3-hotel-food-items', [])
  const [amenities, setAmenities] = useKV<any[]>('w3-hotel-amenities', [])
  const [constructionMaterials, setConstructionMaterials] = useKV<any[]>('w3-hotel-construction-materials', [])
  const [generalProducts, setGeneralProducts] = useKV<any[]>('w3-hotel-general-products', [])
  
  const [constructionProjects, setConstructionProjects] = useKV<any[]>('w3-hotel-construction-projects', [])
  const [contractors, setContractors] = useKV<any[]>('w3-hotel-contractors', [])
  
  const currentUser = (systemUsers || [])[0] || sampleSystemUsers[0]

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'front-office', label: 'Front Office', icon: BedDouble },
    { id: 'housekeeping', label: 'Housekeeping', icon: ClipboardList },
    { id: 'fnb', label: 'F&B / POS', icon: UtensilsCrossed },
    { id: 'kitchen', label: 'Kitchen', icon: UtensilsCrossed },
    { id: 'crm', label: 'Guest Relations', icon: Users },
    { id: 'extra-services', label: 'Extra Services', icon: Sparkles },
    { id: 'room-revenue', label: 'Room & Revenue', icon: Building2 },
    { id: 'channel-manager', label: 'Channel Manager', icon: TrendingUp },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'procurement', label: 'Procurement', icon: ShoppingCart },
    { id: 'suppliers', label: 'Suppliers', icon: Building2 },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'hr', label: 'HR & Staff', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'construction', label: 'Maintenance', icon: Wrench },
    { id: 'user-management', label: 'Users', icon: UserCog },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ]

  const stats = [
    { 
      label: 'Total Revenue', 
      value: '$124,592', 
      change: 12.5, 
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600 bg-green-50'
    },
    { 
      label: 'Occupancy Rate', 
      value: '87%', 
      change: 5.2, 
      trend: 'up',
      icon: BedDouble,
      color: 'text-primary bg-primary/10'
    },
    { 
      label: 'Active Guests', 
      value: '142', 
      change: -2.4, 
      trend: 'down',
      icon: Users,
      color: 'text-accent bg-accent/10'
    },
    { 
      label: 'Pending Tasks', 
      value: '23', 
      change: 8.1, 
      trend: 'up',
      icon: ClipboardList,
      color: 'text-warning bg-warning/10'
    },
  ]

  const renderDashboard = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back, {currentUser.firstName}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight
          return (
            <Card key={stat.label} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <Badge variant={stat.trend === 'up' ? 'default' : 'secondary'} className="gap-1">
                  <TrendIcon className="h-3 w-3" />
                  {Math.abs(stat.change)}%
                </Badge>
              </div>
              <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6">Recent Reservations</h3>
          <div className="space-y-4">
            {(reservations || []).slice(0, 5).map((reservation) => {
              const guest = guests?.find(g => g.id === reservation.guestId)
              const room = rooms?.find(r => r.id === reservation.roomId)
              const guestName = guest ? `${guest.firstName} ${guest.lastName}` : 'Guest'
              return (
                <div key={reservation.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {guestName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{guestName}</p>
                    <p className="text-sm text-muted-foreground">{room ? `Room ${room.roomNumber}` : 'Room pending'}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={reservation.status === 'confirmed' ? 'default' : 'secondary'}>
                      {reservation.status}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 py-6"
              onClick={() => setCurrentModule('front-office')}
            >
              <BedDouble className="h-6 w-6" />
              <span className="text-sm">New Booking</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 py-6"
              onClick={() => setCurrentModule('front-office')}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Check In</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 py-6"
              onClick={() => setCurrentModule('housekeeping')}
            >
              <ClipboardList className="h-6 w-6" />
              <span className="text-sm">Assign Task</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col gap-2 py-6"
              onClick={() => setCurrentModule('fnb')}
            >
              <UtensilsCrossed className="h-6 w-6" />
              <span className="text-sm">New Order</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-sidebar-background border-r border-sidebar-border
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="h-20 px-6 flex items-center justify-between border-b border-sidebar-border">
            <img src={w3PMSLogo} alt="W3 PMS" className="h-10" />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = currentModule === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentModule(item.id as Module)
                      setSidebarOpen(false)
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                      ${isActive 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'text-sidebar-foreground hover:bg-sidebar-accent'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {isActive && <ChevronRight className="h-4 w-4 ml-auto shrink-0" />}
                  </button>
                )
              })}
            </div>
          </nav>

          <div className="h-20 px-4 flex items-center gap-3 border-t border-sidebar-border">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{currentUser.firstName} {currentUser.lastName}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{currentUser.role.replace('-', ' ')}</p>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-border bg-card px-6 flex items-center gap-4 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search anything..."
                className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full" />
            </Button>
            
            <Button variant="ghost" size="icon">
              <Calendar className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {currentModule === 'dashboard' && renderDashboard()}
          {currentModule === 'front-office' && (
            <Suspense fallback={<LoadingState />}>
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
            </Suspense>
          )}
          {currentModule === 'housekeeping' && (
            <Suspense fallback={<LoadingState />}>
              <Housekeeping
                tasks={housekeepingTasks || []}
                setTasks={setHousekeepingTasks}
                rooms={rooms || []}
                setRooms={setRooms}
                employees={employees || []}
              />
            </Suspense>
          )}
          {currentModule === 'fnb' && (
            <Suspense fallback={<LoadingState />}>
              <FnBPOS
                menuItems={menuItems || []}
                setMenuItems={setMenuItems}
                orders={orders || []}
                setOrders={setOrders}
                guests={guests || []}
                rooms={rooms || []}
              />
            </Suspense>
          )}
          {currentModule === 'kitchen' && (
            <Suspense fallback={<LoadingState />}>
              <KitchenManagement
                stations={kitchenStations || []}
                setStations={setKitchenStations}
                staff={kitchenStaff || []}
                setStaff={setKitchenStaff}
                schedules={productionSchedules || []}
                setSchedules={setProductionSchedules}
                inventoryIssues={kitchenInventoryIssues || []}
                setInventoryIssues={setKitchenInventoryIssues}
                wasteTracking={wasteTracking || []}
                setWasteTracking={setWasteTracking}
                employees={employees || []}
                foodItems={[]}
              />
            </Suspense>
          )}
          {currentModule === 'crm' && (
            <Suspense fallback={<LoadingState />}>
              <CRM
                guestProfiles={guestProfiles || []}
                setGuestProfiles={setGuestProfiles}
                complaints={complaints || []}
                setComplaints={setComplaints}
                feedback={feedback || []}
                setFeedback={setFeedback}
                campaigns={campaigns || []}
                setCampaigns={setCampaigns}
                templates={templates || []}
                setTemplates={setTemplates}
                upsellOffers={upsellOffers || []}
                setUpsellOffers={setUpsellOffers}
                upsellTransactions={upsellTransactions || []}
                setUpsellTransactions={setUpsellTransactions}
                loyaltyTransactions={loyaltyTransactions || []}
                setLoyaltyTransactions={setLoyaltyTransactions}
                reservations={reservations}
                rooms={rooms}
                orders={orders}
                folioExtraServices={folioExtraServices}
              />
            </Suspense>
          )}
          {currentModule === 'extra-services' && (
            <Suspense fallback={<LoadingState />}>
              <ExtraServicesManagement
                services={extraServices || []}
                setServices={setExtraServices}
                categories={serviceCategories || []}
                setCategories={setServiceCategories}
                currentUser={currentUser}
              />
            </Suspense>
          )}
          {currentModule === 'room-revenue' && (
            <Suspense fallback={<LoadingState />}>
              <RevenueManagement
                roomTypes={roomTypeConfigs || []}
                setRoomTypes={setRoomTypeConfigs}
                ratePlans={ratePlans || []}
                setRatePlans={setRatePlans}
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
            </Suspense>
          )}
          {currentModule === 'channel-manager' && (
            <Suspense fallback={<LoadingState />}>
              <ChannelManager
                connections={otaConnections || []}
                setConnections={setOtaConnections}
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
            </Suspense>
          )}
          {currentModule === 'inventory' && (
            <Suspense fallback={<LoadingState />}>
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
            </Suspense>
          )}
          {currentModule === 'procurement' && (
            <Suspense fallback={<LoadingState />}>
              <Procurement
                requisitions={requisitions || []}
                setRequisitions={setRequisitions}
                suppliers={suppliers || []}
                foodItems={foodItems || []}
                amenities={amenities || []}
                constructionMaterials={constructionMaterials || []}
                generalProducts={generalProducts || []}
                purchaseOrders={purchaseOrders || []}
                setPurchaseOrders={setPurchaseOrders}
                grns={grns || []}
                setGRNs={setGrns}
                inventory={inventory || []}
                currentUser={currentUser}
                invoices={procurementInvoices || []}
                setInvoices={setProcurementInvoices}
              />
            </Suspense>
          )}
          {currentModule === 'suppliers' && (
            <Suspense fallback={<LoadingState />}>
              <SupplierManagement
                suppliers={suppliers || []}
                setSuppliers={setSuppliers}
              />
            </Suspense>
          )}
          {currentModule === 'finance' && (
            <Suspense fallback={<LoadingState />}>
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
                currentUser={currentUser}
              />
            </Suspense>
          )}
          {currentModule === 'hr' && (
            <Suspense fallback={<LoadingState />}>
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
            </Suspense>
          )}
          {currentModule === 'analytics' && (
            <Suspense fallback={<LoadingState />}>
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
            </Suspense>
          )}
          {currentModule === 'construction' && (
            <Suspense fallback={<LoadingState />}>
              <ConstructionManagement
                materials={constructionMaterials || []}
                setMaterials={setConstructionMaterials}
                projects={constructionProjects || []}
                setProjects={setConstructionProjects}
                suppliers={suppliers || []}
                contractors={contractors || []}
                setContractors={setContractors}
              />
            </Suspense>
          )}
          {currentModule === 'user-management' && (
            <Suspense fallback={<LoadingState />}>
              <UserManagement
                users={systemUsers || []}
                setUsers={() => {}}
                currentUser={currentUser}
                activityLogs={[]}
                setActivityLogs={() => {}}
              />
            </Suspense>
          )}
          {currentModule === 'settings' && (
            <Suspense fallback={<LoadingState />}>
              <Settings
                branding={branding}
                setBranding={setBranding}
                taxes={taxes || []}
                setTaxes={setTaxes}
                serviceCharge={serviceCharge}
                setServiceCharge={setServiceCharge}
                emailTemplates={emailTemplates || []}
                setEmailTemplates={setEmailTemplates}
                emailAnalytics={emailAnalytics || []}
                campaignAnalytics={campaignAnalytics || []}
                emailRecords={emailRecords || []}
                currentUser={currentUser}
              />
            </Suspense>
          )}
        </div>
      </main>

      <Toaster position="top-right" richColors closeButton />
    </div>
  )
}

export default App
