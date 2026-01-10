import * as React from 'react'
import { useState, lazy, Suspense } from 'react'
import { useKV } from '@github/spark/hooks'
import { useAutoBackup } from '@/hooks/use-auto-backup'
import { Toaster } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  Receipt,
  Settings as SettingsIcon,
  Menu,
  Search,
  Bell,
  TrendingUp,
  Calendar,
  ChevronRight
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
import { ModuleLoadingSkeleton } from '@/components/ModuleLoadingSkeleton'
import { QuickBackupDialog } from '@/components/QuickBackupDialog'

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
  
  const currentUser = (systemUsers || [])[0] || sampleSystemUsers[0]

  const navigationGroups = [
    {
      label: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      label: 'Operations',
      items: [
        { id: 'front-office', label: 'Front Office', icon: BedDouble },
        { id: 'housekeeping', label: 'Housekeeping', icon: ClipboardList },
        { id: 'fnb', label: 'F&B / POS', icon: UtensilsCrossed },
        { id: 'kitchen', label: 'Kitchen', icon: UtensilsCrossed },
      ]
    },
    {
      label: 'Business',
      items: [
        { id: 'crm', label: 'Guest Relations', icon: Users },
        { id: 'extra-services', label: 'Extra Services', icon: Sparkles },
        { id: 'room-revenue', label: 'Room & Revenue', icon: Building2 },
        { id: 'channel-manager', label: 'Channel Manager', icon: TrendingUp },
      ]
    },
    {
      label: 'Management',
      items: [
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'procurement', label: 'Procurement', icon: ShoppingCart },
        { id: 'suppliers', label: 'Suppliers', icon: Building2 },
        { id: 'finance', label: 'Finance', icon: DollarSign },
        { id: 'hr', label: 'HR & Staff', icon: Users },
      ]
    },
    {
      label: 'System',
      items: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'construction', label: 'Maintenance', icon: Wrench },
        { id: 'user-management', label: 'Users', icon: UserCog },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
      ]
    }
  ]

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full bg-sidebar-background">
      <div className="h-16 px-6 flex items-center border-b border-sidebar-border">
        <img src={w3PMSLogo} alt="W3 PMS" className="h-8" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigationGroups.map((group) => (
          <div key={group.label}>
            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = currentModule === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentModule(item.id as Module)
                      onClose?.()
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${isActive 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }
                    `}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    {isActive && <ChevronRight size={16} className="ml-auto" />}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="h-16 px-4 flex items-center gap-3 border-t border-sidebar-border">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{currentUser.firstName} {currentUser.lastName}</p>
          <p className="text-xs text-muted-foreground truncate capitalize">{currentUser.role.replace('-', ' ')}</p>
        </div>
      </div>
    </div>
  )

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to W3 Hotel PMS</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BedDouble className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <h3 className="text-2xl font-bold">156</h3>
          <p className="text-sm text-muted-foreground">Total Rooms</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+8%</span>
          </div>
          <h3 className="text-2xl font-bold">1,247</h3>
          <p className="text-sm text-muted-foreground">Total Guests</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+15%</span>
          </div>
          <h3 className="text-2xl font-bold">$45,231</h3>
          <p className="text-sm text-muted-foreground">Revenue (MTD)</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+5%</span>
          </div>
          <h3 className="text-2xl font-bold">89%</h3>
          <p className="text-sm text-muted-foreground">Occupancy Rate</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                <div className="p-2 bg-muted rounded-lg">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New reservation created</p>
                  <p className="text-xs text-muted-foreground">Room 101 - John Doe</p>
                </div>
                <span className="text-xs text-muted-foreground">2 min ago</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button className="w-full justify-start" variant="outline">
              <BedDouble className="mr-2 h-4 w-4" />
              New Reservation
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Check In Guest
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Receipt className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <ClipboardList className="mr-2 h-4 w-4" />
              Assign Task
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )

  const renderComingSoon = (title: string) => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-1">Module under development</p>
      </div>
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
            <SettingsIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">Coming Soon</h3>
          <p className="text-muted-foreground">
            This module is currently under development. Stay tuned for updates.
          </p>
          <Button onClick={() => setCurrentModule('dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      <aside className="hidden lg:flex w-64 border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-card px-4 lg:px-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-muted border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <QuickBackupDialog />

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full"></span>
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          {currentModule === 'dashboard' && renderDashboard()}
          {currentModule === 'front-office' && (
            <Suspense fallback={<ModuleLoadingSkeleton />}>
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
            <Suspense fallback={<ModuleLoadingSkeleton />}>
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
            <Suspense fallback={<ModuleLoadingSkeleton />}>
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
            <Suspense fallback={<ModuleLoadingSkeleton />}>
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
            <Suspense fallback={<ModuleLoadingSkeleton />}>
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
            <Suspense fallback={<ModuleLoadingSkeleton />}>
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
            <Suspense fallback={<ModuleLoadingSkeleton />}>
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
          {currentModule === 'channel-manager' && renderComingSoon('Channel Manager')}
          {currentModule === 'inventory' && renderComingSoon('Inventory')}
          {currentModule === 'procurement' && renderComingSoon('Procurement')}
          {currentModule === 'suppliers' && (
            <Suspense fallback={<ModuleLoadingSkeleton />}>
              <SupplierManagement
                suppliers={suppliers || []}
                setSuppliers={setSuppliers}
              />
            </Suspense>
          )}
          {currentModule === 'finance' && (
            <Suspense fallback={<ModuleLoadingSkeleton />}>
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
          {currentModule === 'hr' && renderComingSoon('HR & Staff')}
          {currentModule === 'analytics' && (
            <Suspense fallback={<ModuleLoadingSkeleton />}>
              <Analytics
                orders={orders || []}
                foodItems={[]}
                suppliers={suppliers || []}
                grns={grns || []}
                recipes={recipes || []}
                menus={menus || []}
                consumptionLogs={consumptionLogs || []}
                purchaseOrders={purchaseOrders || []}
              />
            </Suspense>
          )}
          {currentModule === 'construction' && renderComingSoon('Maintenance')}
          {currentModule === 'user-management' && (
            <Suspense fallback={<ModuleLoadingSkeleton />}>
              <UserManagement
                users={systemUsers || []}
                setUsers={() => {}}
                currentUser={currentUser}
                activityLogs={[]}
                setActivityLogs={() => {}}
              />
            </Suspense>
          )}
          {currentModule === 'settings' && renderComingSoon('Settings')}
        </div>
      </main>

      <Toaster position="top-right" richColors />
    </div>
  )
}

export default App
