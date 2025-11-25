import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Package,
  MagnifyingGlass,
  Plus,
  ArrowUp,
  ArrowDown,
  Warning,
  CheckCircle,
  Pencil,
  MapPin,
  ShoppingCart,
  ClipboardText,
  Barcode,
  Basket,
  Broom,
  Archive,
  Armchair,
  Drop,
  Student
} from '@phosphor-icons/react'
import {
  type Amenity,
  type AmenityCategory,
  type AmenityDepartment,
  type Supplier,
  type AmenityUsageLog,
  type AmenityAutoOrder
} from '@/lib/types'
import {
  formatCurrency,
  formatDateTime,
  formatDate,
  generateId,
  generateNumber,
  getAmenityCategoryColor,
  getAmenityStockStatus,
  calculateAmenityInventoryValue,
  searchAmenities,
  filterAmenitiesByCategory,
  filterAmenitiesByDepartment,
  filterAmenitiesByStatus,
  getUrgentAmenities,
  getDaysUntilReorder,
  calculateAutoReorderQuantity
} from '@/lib/helpers'

interface AmenitiesManagementProps {
  amenities: Amenity[]
  setAmenities: (amenities: Amenity[] | ((current: Amenity[]) => Amenity[])) => void
  suppliers: Supplier[]
  usageLogs?: AmenityUsageLog[]
  setUsageLogs?: (logs: AmenityUsageLog[] | ((current: AmenityUsageLog[]) => AmenityUsageLog[])) => void
  autoOrders?: AmenityAutoOrder[]
  setAutoOrders?: (orders: AmenityAutoOrder[] | ((current: AmenityAutoOrder[]) => AmenityAutoOrder[])) => void
}

const amenityCategories: { value: AmenityCategory; label: string; icon: React.ReactNode }[] = [
  { value: 'toiletries', label: 'Toiletries', icon: <Drop size={16} /> },
  { value: 'linens', label: 'Linens', icon: <Archive size={16} /> },
  { value: 'cleaning-supplies', label: 'Cleaning Supplies', icon: <Broom size={16} /> },
  { value: 'beverages', label: 'Beverages', icon: <Basket size={16} /> },
  { value: 'food-items', label: 'Food Items', icon: <Basket size={16} /> },
  { value: 'paper-products', label: 'Paper Products', icon: <ClipboardText size={16} /> },
  { value: 'room-supplies', label: 'Room Supplies', icon: <Armchair size={16} /> },
  { value: 'public-area-supplies', label: 'Public Area Supplies', icon: <Student size={16} /> },
  { value: 'laundry-supplies', label: 'Laundry Supplies', icon: <Drop size={16} /> },
  { value: 'guest-amenities', label: 'Guest Amenities', icon: <Package size={16} /> }
]

const departments: { value: AmenityDepartment; label: string }[] = [
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'front-office', label: 'Front Office' },
  { value: 'fnb', label: 'F&B' },
  { value: 'public-areas', label: 'Public Areas' },
  { value: 'laundry', label: 'Laundry' },
  { value: 'spa', label: 'Spa' },
  { value: 'gym', label: 'Gym' },
  { value: 'pool', label: 'Pool' }
]

export function AmenitiesManagement({ 
  amenities, 
  setAmenities, 
  suppliers,
  usageLogs = [],
  setUsageLogs,
  autoOrders = [],
  setAutoOrders
}: AmenitiesManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<AmenityCategory | 'all'>('all')
  const [selectedDepartment, setSelectedDepartment] = useState<AmenityDepartment | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showAmenityDialog, setShowAmenityDialog] = useState(false)
  const [showUsageDialog, setShowUsageDialog] = useState(false)
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null)
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'category' | 'urgent'>('urgent')

  const filteredAmenities = (() => {
    let items = searchTerm ? searchAmenities(amenities, searchTerm) : amenities
    if (selectedCategory !== 'all') items = filterAmenitiesByCategory(items, selectedCategory)
    if (selectedDepartment !== 'all') items = filterAmenitiesByDepartment(items, selectedDepartment)
    if (selectedStatus !== 'all') items = filterAmenitiesByStatus(items, selectedStatus)

    return items.sort((a, b) => {
      if (sortBy === 'urgent') {
        const aStatus = getAmenityStockStatus(a)
        const bStatus = getAmenityStockStatus(b)
        if (aStatus.urgent && !bStatus.urgent) return -1
        if (!aStatus.urgent && bStatus.urgent) return 1
        return a.name.localeCompare(b.name)
      }
      if (sortBy === 'stock') return a.currentStock - b.currentStock
      if (sortBy === 'category') return a.category.localeCompare(b.category)
      return a.name.localeCompare(b.name)
    })
  })()

  const urgentItems = getUrgentAmenities(amenities)
  const totalValue = calculateAmenityInventoryValue(amenities)
  const lowStockCount = amenities.filter(a => a.currentStock <= a.reorderLevel).length

  const handleAddAmenity = (data: Partial<Amenity>) => {
    const newAmenity: Amenity = {
      id: generateId(),
      amenityId: generateNumber('AM'),
      name: data.name || '',
      category: data.category || 'room-supplies',
      department: data.department || ['housekeeping'],
      unit: data.unit || 'piece',
      currentStock: data.currentStock || 0,
      reorderLevel: data.reorderLevel || 0,
      reorderQuantity: data.reorderQuantity || 0,
      unitCost: data.unitCost || 0,
      supplierIds: data.supplierIds || [],
      autoReorder: data.autoReorder ?? true,
      storeLocation: data.storeLocation || '',
      parLevel: data.parLevel || 0,
      usageRatePerDay: data.usageRatePerDay || 0,
      notes: data.notes,
      lastUpdated: Date.now(),
      createdAt: Date.now()
    }

    setAmenities((current) => [...current, newAmenity])
    toast.success('Amenity added successfully')
    setShowAmenityDialog(false)
    setEditingAmenity(null)
  }

  const handleUpdateAmenity = (data: Partial<Amenity>) => {
    if (!editingAmenity) return

    setAmenities((current) =>
      current.map((item) =>
        item.id === editingAmenity.id
          ? { ...item, ...data, lastUpdated: Date.now() }
          : item
      )
    )

    if (data.currentStock !== undefined && editingAmenity.autoReorder && data.currentStock <= editingAmenity.reorderLevel) {
      triggerAutoReorder(editingAmenity)
    }

    toast.success('Amenity updated successfully')
    setShowAmenityDialog(false)
    setEditingAmenity(null)
  }

  const handleRecordUsage = (amenityId: string, department: AmenityDepartment, quantity: number, roomNumber?: string, purpose?: string) => {
    const amenity = amenities.find(a => a.id === amenityId)
    if (!amenity) return

    const newStock = Math.max(0, amenity.currentStock - quantity)
    
    setAmenities((current) =>
      current.map((item) =>
        item.id === amenityId
          ? { ...item, currentStock: newStock, lastUpdated: Date.now() }
          : item
      )
    )

    if (setUsageLogs) {
      const log: AmenityUsageLog = {
        id: generateId(),
        amenityId,
        department,
        quantity,
        usedBy: 'current-user',
        roomNumber,
        purpose,
        timestamp: Date.now()
      }
      setUsageLogs((current) => [...current, log])
    }

    if (amenity.autoReorder && newStock <= amenity.reorderLevel) {
      triggerAutoReorder(amenity)
    }

    toast.success(`Usage recorded: ${quantity} ${amenity.unit}`)
    setShowUsageDialog(false)
    setSelectedAmenity(null)
  }

  const handleRestock = (amenityId: string, quantity: number) => {
    setAmenities((current) =>
      current.map((item) =>
        item.id === amenityId
          ? { 
              ...item, 
              currentStock: item.currentStock + quantity,
              lastRestocked: Date.now(),
              lastUpdated: Date.now() 
            }
          : item
      )
    )
    toast.success(`Restocked ${quantity} units`)
  }

  const triggerAutoReorder = (amenity: Amenity) => {
    if (!setAutoOrders) return

    const existingOrder = autoOrders.find(
      o => o.amenityId === amenity.id && (o.status === 'pending' || o.status === 'ordered')
    )
    
    if (existingOrder) {
      toast.info('Auto-order already pending for this item')
      return
    }

    const orderQuantity = calculateAutoReorderQuantity(amenity)
    const primarySupplier = amenity.supplierIds[0] || ''

    const autoOrder: AmenityAutoOrder = {
      id: generateId(),
      amenityId: amenity.id,
      supplierId: primarySupplier,
      orderQuantity,
      status: 'pending',
      triggeredAt: Date.now()
    }

    setAutoOrders((current) => [...current, autoOrder])
    toast.warning(`Auto-reorder triggered: ${amenity.name} (${orderQuantity} ${amenity.unit})`)
  }

  const handleApproveAutoOrder = (orderId: string) => {
    if (!setAutoOrders) return

    setAutoOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? { 
              ...order, 
              status: 'ordered' as const,
              orderedAt: Date.now(),
              orderReference: generateNumber('PO-2024-')
            }
          : order
      )
    )
    toast.success('Auto-order approved and sent to supplier')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Amenities Management</h1>
          <p className="text-muted-foreground mt-1">Manage hotel consumables and supplies</p>
        </div>
        <Button onClick={() => { setEditingAmenity(null); setShowAmenityDialog(true) }} size="lg">
          <Plus size={20} className="mr-2" />
          Add Amenity
        </Button>
      </div>

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList>
          <TabsTrigger value="inventory">
            <Package size={16} className="mr-2" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="auto-orders">
            <ShoppingCart size={16} className="mr-2" />
            Auto Orders
            {autoOrders.filter(o => o.status === 'pending').length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {autoOrders.filter(o => o.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="usage">
            <ClipboardText size={16} className="mr-2" />
            Usage Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 border-l-4 border-l-primary">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Total Items</h3>
                <Package size={20} className="text-primary" />
              </div>
              <p className="text-3xl font-semibold">{amenities.length}</p>
              <p className="text-sm text-muted-foreground mt-2">Unique amenities</p>
            </Card>

            <Card className="p-6 border-l-4 border-l-destructive">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Low Stock</h3>
                <Warning size={20} className="text-destructive" />
              </div>
              <p className="text-3xl font-semibold text-destructive">{lowStockCount}</p>
              <p className="text-sm text-muted-foreground mt-2">Items need reorder</p>
            </Card>

            <Card className="p-6 border-l-4 border-l-accent">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Urgent Items</h3>
                <Warning size={20} className="text-accent" />
              </div>
              <p className="text-3xl font-semibold text-accent">{urgentItems.length}</p>
              <p className="text-sm text-muted-foreground mt-2">Require attention</p>
            </Card>

            <Card className="p-6 border-l-4 border-l-success">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Total Value</h3>
                <Archive size={20} className="text-success" />
              </div>
              <p className="text-3xl font-semibold">{formatCurrency(totalValue)}</p>
              <p className="text-sm text-muted-foreground mt-2">Current inventory</p>
            </Card>
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search amenities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as AmenityCategory | 'all')}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {amenityCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedDepartment} onValueChange={(v) => setSelectedDepartment(v as AmenityDepartment | 'all')}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent First</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="stock">Stock Level</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            {filteredAmenities.map((amenity) => {
              const stockStatus = getAmenityStockStatus(amenity)
              const daysUntilReorder = getDaysUntilReorder(amenity)
              const stockPercentage = (amenity.currentStock / amenity.parLevel) * 100

              return (
                <Card key={amenity.id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{amenity.name}</h3>
                            <Badge className={getAmenityCategoryColor(amenity.category)}>
                              {amenityCategories.find(c => c.value === amenity.category)?.label || amenity.category}
                            </Badge>
                            <Badge variant="outline">{amenity.amenityId}</Badge>
                            {amenity.autoReorder && (
                              <Badge variant="secondary">
                                <ShoppingCart size={12} className="mr-1" />
                                Auto-reorder
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Current Stock</p>
                              <p className={`text-2xl font-semibold ${stockStatus.color}`}>
                                {amenity.currentStock} {amenity.unit}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {stockPercentage.toFixed(0)}% of par level
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-muted-foreground">Par Level</p>
                              <p className="text-lg font-medium">{amenity.parLevel} {amenity.unit}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Reorder at {amenity.reorderLevel}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-muted-foreground">Usage Rate</p>
                              <p className="text-lg font-medium">
                                {amenity.usageRatePerDay} {amenity.unit}/day
                              </p>
                              {daysUntilReorder < 999 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  ~{daysUntilReorder} days to reorder
                                </p>
                              )}
                            </div>

                            <div>
                              <p className="text-sm text-muted-foreground">Total Value</p>
                              <p className="text-lg font-medium">
                                {formatCurrency(amenity.currentStock * amenity.unitCost)}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                @{formatCurrency(amenity.unitCost)}/{amenity.unit}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-4">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin size={14} />
                              {amenity.storeLocation}
                            </div>
                            <Separator orientation="vertical" className="h-4" />
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              Departments: {amenity.department.join(', ')}
                            </div>
                            {amenity.notes && (
                              <>
                                <Separator orientation="vertical" className="h-4" />
                                <div className="text-sm text-muted-foreground">{amenity.notes}</div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {stockStatus.urgent && (
                            <Badge variant="destructive" className="whitespace-nowrap">
                              <Warning size={14} className="mr-1" />
                              {stockStatus.status.replace('-', ' ').toUpperCase()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditingAmenity(amenity); setShowAmenityDialog(true) }}
                      >
                        <Pencil size={16} className="mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setSelectedAmenity(amenity); setShowUsageDialog(true) }}
                      >
                        <ClipboardText size={16} className="mr-2" />
                        Record Usage
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const quantity = prompt(`How many ${amenity.unit} to restock?`)
                          if (quantity && !isNaN(Number(quantity))) {
                            handleRestock(amenity.id, Number(quantity))
                          }
                        }}
                      >
                        <ArrowUp size={16} className="mr-2" />
                        Restock
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}

            {filteredAmenities.length === 0 && (
              <Card className="p-16 text-center">
                <Package size={64} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No amenities found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || selectedCategory !== 'all' || selectedDepartment !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Add your first amenity to get started'}
                </p>
                {!searchTerm && selectedCategory === 'all' && selectedDepartment === 'all' && (
                  <Button onClick={() => { setEditingAmenity(null); setShowAmenityDialog(true) }}>
                    <Plus size={20} className="mr-2" />
                    Add Amenity
                  </Button>
                )}
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="auto-orders" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Pending Auto-Orders</h3>
            <div className="space-y-3">
              {autoOrders.filter(o => o.status === 'pending').map((order) => {
                const amenity = amenities.find(a => a.id === order.amenityId)
                const supplier = (suppliers || []).find(s => s.id === order.supplierId)
                if (!amenity) return null

                return (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">{amenity.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Order {order.orderQuantity} {amenity.unit} from {supplier?.name || 'Unknown Supplier'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Triggered {formatDateTime(order.triggeredAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleApproveAutoOrder(order.id)}>
                        Approve Order
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (setAutoOrders) {
                            setAutoOrders((current) => current.map(o => 
                              o.id === order.id ? { ...o, status: 'cancelled' as const } : o
                            ))
                            toast.success('Auto-order cancelled')
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )
              })}

              {autoOrders.filter(o => o.status === 'pending').length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle size={48} className="mx-auto text-success mb-3" />
                  <p className="text-muted-foreground">No pending auto-orders</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Auto-Orders</h3>
            <div className="space-y-3">
              {autoOrders
                .filter(o => o.status === 'ordered' || o.status === 'received')
                .slice(0, 10)
                .map((order) => {
                  const amenity = amenities.find(a => a.id === order.amenityId)
                  const supplier = (suppliers || []).find(s => s.id === order.supplierId)
                  if (!amenity) return null

                  return (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{amenity.name}</p>
                          <Badge variant={order.status === 'received' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.orderQuantity} {amenity.unit} from {supplier?.name || 'Unknown Supplier'}
                        </p>
                        {order.orderReference && (
                          <p className="text-xs text-muted-foreground mt-1">
                            PO: {order.orderReference}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {order.orderedAt && <p>Ordered: {formatDate(order.orderedAt)}</p>}
                        {order.receivedAt && <p>Received: {formatDate(order.receivedAt)}</p>}
                      </div>
                    </div>
                  )
                })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Usage Log</h3>
            <div className="space-y-3">
              {usageLogs.slice(-20).reverse().map((log) => {
                const amenity = amenities.find(a => a.id === log.amenityId)
                if (!amenity) return null

                return (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{amenity.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {log.quantity} {amenity.unit} used by {log.department}
                        {log.roomNumber && ` · Room ${log.roomNumber}`}
                      </p>
                      {log.purpose && (
                        <p className="text-xs text-muted-foreground mt-1">{log.purpose}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {formatDateTime(log.timestamp)}
                    </div>
                  </div>
                )
              })}

              {usageLogs.length === 0 && (
                <div className="text-center py-12">
                  <ClipboardText size={48} className="mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No usage logs yet</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <AmenityDialog
        open={showAmenityDialog}
        onClose={() => { setShowAmenityDialog(false); setEditingAmenity(null) }}
        onSave={editingAmenity ? handleUpdateAmenity : handleAddAmenity}
        amenity={editingAmenity}
        suppliers={suppliers}
      />

      <UsageDialog
        open={showUsageDialog}
        onClose={() => { setShowUsageDialog(false); setSelectedAmenity(null) }}
        amenity={selectedAmenity}
        onRecord={handleRecordUsage}
      />
    </div>
  )
}

interface AmenityDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: Partial<Amenity>) => void
  amenity: Amenity | null
  suppliers: Supplier[]
}

function AmenityDialog({ open, onClose, onSave, amenity, suppliers }: AmenityDialogProps) {
  const [formData, setFormData] = useState<Partial<Amenity>>({
    name: '',
    category: 'toiletries',
    department: ['housekeeping'],
    unit: 'piece',
    currentStock: 0,
    reorderLevel: 0,
    reorderQuantity: 0,
    unitCost: 0,
    supplierIds: [],
    autoReorder: true,
    storeLocation: '',
    parLevel: 0,
    usageRatePerDay: 0,
    notes: ''
  })

  useState(() => {
    if (amenity) {
      setFormData(amenity)
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const toggleDepartment = (dept: AmenityDepartment) => {
    setFormData((prev) => {
      const currentDepts = prev.department || []
      const newDepts = currentDepts.includes(dept)
        ? currentDepts.filter(d => d !== dept)
        : [...currentDepts, dept]
      return { ...prev, department: newDepts }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{amenity ? 'Edit Amenity' : 'Add New Amenity'}</DialogTitle>
          <DialogDescription>
            {amenity ? 'Update amenity details' : 'Add a new consumable item to inventory'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as AmenityCategory })}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {amenityCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="piece, bottle, liter, etc."
                required
              />
            </div>

            <div>
              <Label htmlFor="currentStock">Current Stock</Label>
              <Input
                id="currentStock"
                type="number"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                required
              />
            </div>

            <div>
              <Label htmlFor="parLevel">Par Level</Label>
              <Input
                id="parLevel"
                type="number"
                value={formData.parLevel}
                onChange={(e) => setFormData({ ...formData, parLevel: Number(e.target.value) })}
                required
              />
            </div>

            <div>
              <Label htmlFor="reorderLevel">Reorder Level</Label>
              <Input
                id="reorderLevel"
                type="number"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
                required
              />
            </div>

            <div>
              <Label htmlFor="reorderQuantity">Reorder Quantity</Label>
              <Input
                id="reorderQuantity"
                type="number"
                value={formData.reorderQuantity}
                onChange={(e) => setFormData({ ...formData, reorderQuantity: Number(e.target.value) })}
                required
              />
            </div>

            <div>
              <Label htmlFor="unitCost">Unit Cost ($)</Label>
              <Input
                id="unitCost"
                type="number"
                step="0.01"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                required
              />
            </div>

            <div>
              <Label htmlFor="usageRatePerDay">Usage Rate (per day)</Label>
              <Input
                id="usageRatePerDay"
                type="number"
                value={formData.usageRatePerDay}
                onChange={(e) => setFormData({ ...formData, usageRatePerDay: Number(e.target.value) })}
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="storeLocation">Storage Location</Label>
              <Input
                id="storeLocation"
                value={formData.storeLocation}
                onChange={(e) => setFormData({ ...formData, storeLocation: e.target.value })}
                required
              />
            </div>

            <div className="col-span-2">
              <Label>Departments</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {departments.map(dept => (
                  <Button
                    key={dept.value}
                    type="button"
                    size="sm"
                    variant={(formData.department || []).includes(dept.value) ? 'default' : 'outline'}
                    onClick={() => toggleDepartment(dept.value)}
                  >
                    {dept.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <Label htmlFor="suppliers">Primary Supplier</Label>
              <Select 
                value={formData.supplierIds?.[0] || ''} 
                onValueChange={(v) => setFormData({ ...formData, supplierIds: [v] })}
              >
                <SelectTrigger id="suppliers">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="col-span-2 flex items-center gap-2">
              <Switch
                id="autoReorder"
                checked={formData.autoReorder}
                onCheckedChange={(checked) => setFormData({ ...formData, autoReorder: checked })}
              />
              <Label htmlFor="autoReorder" className="cursor-pointer">
                Enable automatic reorder when stock reaches reorder level
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {amenity ? 'Update' : 'Add'} Amenity
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface UsageDialogProps {
  open: boolean
  onClose: () => void
  amenity: Amenity | null
  onRecord: (amenityId: string, department: AmenityDepartment, quantity: number, roomNumber?: string, purpose?: string) => void
}

function UsageDialog({ open, onClose, amenity, onRecord }: UsageDialogProps) {
  const [department, setDepartment] = useState<AmenityDepartment>('housekeeping')
  const [quantity, setQuantity] = useState(1)
  const [roomNumber, setRoomNumber] = useState('')
  const [purpose, setPurpose] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amenity) return

    onRecord(amenity.id, department, quantity, roomNumber || undefined, purpose || undefined)
    setQuantity(1)
    setRoomNumber('')
    setPurpose('')
  }

  if (!amenity) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Usage: {amenity.name}</DialogTitle>
          <DialogDescription>
            Current stock: {amenity.currentStock} {amenity.unit}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="department">Department</Label>
            <Select value={department} onValueChange={(v) => setDepartment(v as AmenityDepartment)}>
              <SelectTrigger id="department">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantity">Quantity ({amenity.unit})</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={amenity.currentStock}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
          </div>

          <div>
            <Label htmlFor="roomNumber">Room Number (Optional)</Label>
            <Input
              id="roomNumber"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g., 201 or 301-315"
            />
          </div>

          <div>
            <Label htmlFor="purpose">Purpose (Optional)</Label>
            <Input
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g., Daily restocking, Guest request"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Record Usage</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
