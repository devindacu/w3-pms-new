import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster, toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
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
  Hammer
} from '@phosphor-icons/react'
import { 
  type Room, 
  type Guest, 
  type Reservation, 
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
  type Contractor
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
  sampleInventory,
  sampleMenuItems,
  sampleHousekeepingTasks,
  sampleSuppliers,
  sampleEmployees,
  sampleMaintenanceRequests,
  sampleFoodItems,
  sampleAmenities,
  sampleAmenityUsageLogs,
  sampleAmenityAutoOrders,
  sampleConstructionMaterials,
  sampleConstructionProjects,
  sampleContractors
} from '@/lib/sampleData'
import { FoodManagement } from '@/components/FoodManagement'
import { AmenitiesManagement } from '@/components/AmenitiesManagement'
import { ConstructionManagement } from '@/components/ConstructionManagement'

type Module = 'dashboard' | 'front-office' | 'housekeeping' | 'fnb' | 'inventory' | 'procurement' | 'finance' | 'hr' | 'engineering' | 'analytics' | 'food-management' | 'amenities' | 'construction'

function App() {
  const [guests, setGuests] = useKV<Guest[]>('w3-hotel-guests', [])
  const [rooms, setRooms] = useKV<Room[]>('w3-hotel-rooms', [])
  const [reservations, setReservations] = useKV<Reservation[]>('w3-hotel-reservations', [])
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
  
  const [currentModule, setCurrentModule] = useState<Module>('dashboard')

  const loadSampleData = () => {
    setGuests(sampleGuests)
    setRooms(sampleRooms)
    setReservations(sampleReservations)
    setInventory(sampleInventory)
    setMenuItems(sampleMenuItems)
    setHousekeepingTasks(sampleHousekeepingTasks)
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Hotel Dashboard</h1>
          <p className="text-muted-foreground mt-1">Unified view of all hotel operations</p>
        </div>
        {!hasData && (
          <Button onClick={loadSampleData} size="lg">
            <Database size={20} className="mr-2" />
            Load Sample Data
          </Button>
        )}
      </div>

      {!hasData ? (
        <Card className="p-16 text-center">
          <div className="max-w-md mx-auto">
            <Gauge size={64} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Welcome to W3 Hotel PMS</h3>
            <p className="text-muted-foreground mb-6">
              Your comprehensive hotel management solution integrating all operations in one platform
            </p>
            <Button onClick={loadSampleData} size="lg">
              <Database size={20} className="mr-2" />
              Load Sample Data to Get Started
            </Button>
          </div>
        </Card>
      ) : (
        <>
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">F&B Performance</h3>
                <ForkKnife size={20} className="text-muted-foreground" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Orders Today</span>
                  <span className="text-lg font-semibold">{metrics.fnb.ordersToday}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">F&B Revenue</span>
                  <span className="text-lg font-semibold">{formatCurrency(metrics.fnb.revenueToday)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Order Value</span>
                  <span className="text-lg font-semibold">{formatCurrency(metrics.fnb.averageOrderValue)}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Maintenance Status</h3>
                <Wrench size={20} className="text-muted-foreground" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Open Requests</span>
                  <span className="text-lg font-semibold">{metrics.maintenance.openRequests}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Urgent</span>
                  <Badge variant="destructive">{metrics.maintenance.urgent}</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rooms Out of Service</span>
                  <span className="text-lg font-semibold">{metrics.occupancy.maintenance}</span>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Room Status Overview</h3>
              <Button size="sm" onClick={() => setCurrentModule('housekeeping')}>
                View All Rooms
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {(rooms || []).slice(0, 12).map((room) => (
                <div
                  key={room.id}
                  className={`p-3 rounded-lg border-2 text-center ${getRoomStatusColor(room.status)}`}
                >
                  <div className="font-semibold text-lg">{room.roomNumber}</div>
                  <div className="text-xs mt-1 capitalize">{room.roomType}</div>
                  <div className="text-xs mt-1 opacity-80">{room.status.replace('-', ' ')}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Low Stock Items</h3>
              <Button size="sm" onClick={() => setCurrentModule('inventory')}>
                View Inventory
              </Button>
            </div>
            {metrics.inventory.lowStockItems === 0 ? (
              <p className="text-center text-muted-foreground py-8">All inventory levels are healthy</p>
            ) : (
              <div className="space-y-3">
                {(inventory || [])
                  .filter(item => item.currentStock <= item.reorderLevel && item.currentStock > 0)
                  .slice(0, 5)
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-destructive">{item.currentStock} {item.unit}</p>
                        <p className="text-xs text-muted-foreground">Reorder at {item.reorderLevel}</p>
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

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r bg-card p-4 space-y-2">
        <div className="px-3 py-4 mb-4">
          <h2 className="text-xl font-semibold">W3 Hotel PMS</h2>
          <p className="text-xs text-muted-foreground mt-1">Unified Management</p>
        </div>

        <nav className="space-y-1">
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
            variant={currentModule === 'food-management' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('food-management')}
          >
            <Carrot size={18} className="mr-2" />
            Food Management
          </Button>

          <Button
            variant={currentModule === 'amenities' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('amenities')}
          >
            <Basket size={18} className="mr-2" />
            Amenities
          </Button>

          <Button
            variant={currentModule === 'procurement' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('procurement')}
          >
            <ShoppingCart size={18} className="mr-2" />
            Procurement
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
            variant={currentModule === 'engineering' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('engineering')}
          >
            <Wrench size={18} className="mr-2" />
            Engineering
          </Button>

          <Button
            variant={currentModule === 'construction' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('construction')}
          >
            <Hammer size={18} className="mr-2" />
            Construction
          </Button>

          <Button
            variant={currentModule === 'analytics' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setCurrentModule('analytics')}
          >
            <ChartBar size={18} className="mr-2" />
            Analytics
          </Button>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {currentModule === 'dashboard' && renderDashboard()}
          {currentModule === 'front-office' && renderComingSoon('Front Office', <Bed size={64} />)}
          {currentModule === 'housekeeping' && renderComingSoon('Housekeeping', <Broom size={64} />)}
          {currentModule === 'fnb' && renderComingSoon('F&B / POS', <ForkKnife size={64} />)}
          {currentModule === 'inventory' && renderComingSoon('Inventory Management', <Package size={64} />)}
          {currentModule === 'food-management' && (
            <FoodManagement 
              foodItems={foodItems || []} 
              setFoodItems={setFoodItems}
              suppliers={suppliers || []}
            />
          )}
          {currentModule === 'amenities' && (
            <AmenitiesManagement 
              amenities={amenities || []} 
              setAmenities={setAmenities}
              suppliers={suppliers || []}
              usageLogs={amenityUsageLogs || []}
              setUsageLogs={setAmenityUsageLogs}
              autoOrders={amenityAutoOrders || []}
              setAutoOrders={setAmenityAutoOrders}
            />
          )}
          {currentModule === 'procurement' && renderComingSoon('Procurement', <ShoppingCart size={64} />)}
          {currentModule === 'finance' && renderComingSoon('Finance & Accounting', <CurrencyDollar size={64} />)}
          {currentModule === 'hr' && renderComingSoon('HR & Staff Management', <Users size={64} />)}
          {currentModule === 'engineering' && renderComingSoon('Engineering & Maintenance', <Wrench size={64} />)}
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
          {currentModule === 'analytics' && renderComingSoon('Analytics & Reports', <ChartBar size={64} />)}
        </div>
      </main>

      <Toaster position="top-right" richColors />
    </div>
  )
}

export default App
