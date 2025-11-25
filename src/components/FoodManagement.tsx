import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
} from '@/components/ui/dialog'
import {
  Carrot,
  Egg,
  Wine,
  Leaf,
  Snowflake,
  Archive,
  MagnifyingGlass,
  Plus,
  ArrowUp,
  ArrowDown,
  Warning,
  CheckCircle,
  X,
  Pencil,
  Calendar,
  MapPin,
  ShoppingCart,
  ClipboardText,
  Barcode
} from '@phosphor-icons/react'
import {
  type FoodItem,
  type FoodCategory,
  type OrderFrequency,
  type Supplier,
  type QualityStatus
} from '@/lib/types'
import {
  getFoodCategoryColor,
  getOrderFrequencyColor,
  getFoodStockStatus,
  getQualityStatusColor,
  formatCurrency,
  formatDate,
  getDaysUntilExpiry,
  generateId,
  searchFoodItems,
  filterFoodByCategory,
  filterFoodByFrequency,
  getUrgentFoodItems,
  getExpiringFoodItems
} from '@/lib/helpers'

interface FoodManagementProps {
  foodItems: FoodItem[]
  setFoodItems: (items: FoodItem[] | ((prev: FoodItem[]) => FoodItem[])) => void
  suppliers: Supplier[]
}

export function FoodManagement({ foodItems, setFoodItems, suppliers }: FoodManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<FoodCategory | 'all'>('all')
  const [frequencyFilter, setFrequencyFilter] = useState<OrderFrequency | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'low-stock' | 'expiring-soon' | 'expired' | 'in-stock'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    category: 'vegetables' as FoodCategory,
    unit: 'kg',
    currentStock: 0,
    reorderLevel: 0,
    reorderQuantity: 0,
    unitCost: 0,
    supplierIds: [] as string[],
    orderFrequency: 'weekly' as OrderFrequency,
    storeLocation: '',
    isPerishable: true,
    shelfLife: 0,
    expiryDate: '',
    batchNumber: '',
    qualityStatus: 'excellent' as QualityStatus
  })

  const getCategoryIcon = (category: FoodCategory) => {
    const iconMap = {
      'vegetables': <Leaf size={20} />,
      'fruits': <Carrot size={20} />,
      'meat': <Egg size={20} />,
      'dairy': <Egg size={20} />,
      'beverage': <Wine size={20} />,
      'frozen': <Snowflake size={20} />,
      'bakery': <Archive size={20} />,
      'dry-goods': <Archive size={20} />,
      'non-perishable': <Archive size={20} />,
      'spices': <Leaf size={20} />,
      'perishable': <Warning size={20} />
    }
    return iconMap[category] || <Archive size={20} />
  }

  const filteredItems = foodItems
    .filter(item => {
      const matchesSearch = searchFoodItems([item], searchTerm).length > 0
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
      const matchesFrequency = frequencyFilter === 'all' || item.orderFrequency === frequencyFilter
      const matchesStatus = statusFilter === 'all' || getFoodStockStatus(item).status === statusFilter
      return matchesSearch && matchesCategory && matchesFrequency && matchesStatus
    })

  const urgentItems = getUrgentFoodItems(foodItems)
  const expiringItems = getExpiringFoodItems(foodItems, 7)
  const lowStockItems = foodItems.filter(item => 
    item.currentStock <= item.reorderLevel && item.currentStock > 0
  )

  const handleAddEdit = () => {
    if (!formData.name || !formData.storeLocation) {
      toast.error('Please fill in all required fields')
      return
    }

    const expiryTimestamp = formData.expiryDate && formData.isPerishable
      ? new Date(formData.expiryDate).getTime()
      : undefined

    if (editingItem) {
      setFoodItems((currentItems) => currentItems.map(item =>
        item.id === editingItem.id
          ? {
              ...item,
              ...formData,
              expiryDate: expiryTimestamp,
              lastUpdated: Date.now()
            }
          : item
      ))
      toast.success('Food item updated successfully')
    } else {
      const newItem: FoodItem = {
        id: generateId(),
        foodId: `F${String(foodItems.length + 1).padStart(3, '0')}`,
        ...formData,
        expiryDate: expiryTimestamp,
        receivedDate: Date.now(),
        lastUpdated: Date.now(),
        createdAt: Date.now()
      }
      setFoodItems((currentItems) => [...currentItems, newItem])
      toast.success('Food item added successfully')
    }

    setDialogOpen(false)
    resetForm()
  }

  const handleEdit = (item: FoodItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      unit: item.unit,
      currentStock: item.currentStock,
      reorderLevel: item.reorderLevel,
      reorderQuantity: item.reorderQuantity,
      unitCost: item.unitCost,
      supplierIds: item.supplierIds,
      orderFrequency: item.orderFrequency,
      storeLocation: item.storeLocation,
      isPerishable: item.isPerishable,
      shelfLife: item.shelfLife || 0,
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
      batchNumber: item.batchNumber || '',
      qualityStatus: item.qualityStatus || 'excellent'
    })
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setFoodItems((currentItems) => currentItems.filter(item => item.id !== id))
    toast.success('Food item deleted successfully')
  }

  const resetForm = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      category: 'vegetables',
      unit: 'kg',
      currentStock: 0,
      reorderLevel: 0,
      reorderQuantity: 0,
      unitCost: 0,
      supplierIds: [],
      orderFrequency: 'weekly',
      storeLocation: '',
      isPerishable: true,
      shelfLife: 0,
      expiryDate: '',
      batchNumber: '',
      qualityStatus: 'excellent'
    })
  }

  const handleStockAdjustment = (item: FoodItem, adjustment: number) => {
    setFoodItems((currentItems) => currentItems.map(i =>
      i.id === item.id
        ? { ...i, currentStock: Math.max(0, i.currentStock + adjustment), lastUpdated: Date.now() }
        : i
    ))
    toast.success(`Stock ${adjustment > 0 ? 'increased' : 'decreased'} for ${item.name}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Food Management</h1>
          <p className="text-muted-foreground mt-1">Manage all food inventory with quality and expiry tracking</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true) }} size="lg">
          <Plus size={20} className="mr-2" />
          Add Food Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-l-destructive">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Urgent Items</h3>
            <Warning size={20} className="text-destructive" />
          </div>
          <p className="text-3xl font-semibold">{urgentItems.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Low stock or expiring</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Expiring Soon</h3>
            <Calendar size={20} className="text-accent" />
          </div>
          <p className="text-3xl font-semibold">{expiringItems.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Within 7 days</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Low Stock</h3>
            <ShoppingCart size={20} className="text-primary" />
          </div>
          <p className="text-3xl font-semibold">{lowStockItems.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Below reorder level</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Items</h3>
            <Archive size={20} className="text-success" />
          </div>
          <p className="text-3xl font-semibold">{foodItems.length}</p>
          <p className="text-sm text-muted-foreground mt-1">In inventory</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative lg:col-span-2">
              <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search food items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as FoodCategory | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="vegetables">Vegetables</SelectItem>
                <SelectItem value="fruits">Fruits</SelectItem>
                <SelectItem value="meat">Meat</SelectItem>
                <SelectItem value="dairy">Dairy</SelectItem>
                <SelectItem value="beverage">Beverage</SelectItem>
                <SelectItem value="frozen">Frozen</SelectItem>
                <SelectItem value="bakery">Bakery</SelectItem>
                <SelectItem value="dry-goods">Dry Goods</SelectItem>
                <SelectItem value="spices">Spices</SelectItem>
                <SelectItem value="non-perishable">Non-Perishable</SelectItem>
              </SelectContent>
            </Select>

            <Select value={frequencyFilter} onValueChange={(value) => setFrequencyFilter(value as OrderFrequency | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frequencies</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="on-demand">On-Demand</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {filteredItems.length === 0 ? (
          <Card className="p-16 text-center">
            <Archive size={64} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No food items found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your filters or add a new food item</p>
          </Card>
        ) : (
          filteredItems.map((item) => {
            const stockStatus = getFoodStockStatus(item)
            const daysToExpiry = getDaysUntilExpiry(item.expiryDate)
            const primarySupplier = (suppliers || []).find(s => item.supplierIds.includes(s.id))

            return (
              <Card key={item.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    <div className="p-3 bg-muted rounded-lg">
                      {getCategoryIcon(item.category)}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{item.name}</h3>
                          <Badge variant="outline" className={getFoodCategoryColor(item.category)}>
                            {item.category}
                          </Badge>
                          <Badge className={getOrderFrequencyColor(item.orderFrequency)}>
                            {item.orderFrequency}
                          </Badge>
                          {item.qualityStatus && (
                            <Badge className={getQualityStatusColor(item.qualityStatus)}>
                              {item.qualityStatus}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Barcode size={16} />
                            {item.foodId}
                          </span>
                          {item.batchNumber && (
                            <span className="flex items-center gap-1">
                              <ClipboardText size={16} />
                              Batch: {item.batchNumber}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MapPin size={16} />
                            {item.storeLocation}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Current Stock</p>
                          <p className={`text-lg font-semibold ${stockStatus.color}`}>
                            {item.currentStock} {item.unit}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">Reorder Level</p>
                          <p className="text-lg font-semibold">{item.reorderLevel} {item.unit}</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">Unit Cost</p>
                          <p className="text-lg font-semibold">{formatCurrency(item.unitCost)}</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">Total Value</p>
                          <p className="text-lg font-semibold">
                            {formatCurrency(item.currentStock * item.unitCost)}
                          </p>
                        </div>

                        {item.expiryDate && (
                          <div>
                            <p className="text-xs text-muted-foreground">Expires</p>
                            <p className={`text-sm font-semibold ${
                              daysToExpiry !== null && daysToExpiry <= 3 
                                ? 'text-destructive' 
                                : daysToExpiry !== null && daysToExpiry <= 7 
                                ? 'text-accent' 
                                : ''
                            }`}>
                              {daysToExpiry !== null && daysToExpiry >= 0 
                                ? `${daysToExpiry} days` 
                                : 'Expired'}
                            </p>
                            <p className="text-xs text-muted-foreground">{formatDate(item.expiryDate)}</p>
                          </div>
                        )}

                        {primarySupplier && (
                          <div>
                            <p className="text-xs text-muted-foreground">Primary Supplier</p>
                            <p className="text-sm font-semibold">{primarySupplier.name}</p>
                          </div>
                        )}
                      </div>

                      {stockStatus.urgent && (
                        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                          <Warning size={18} />
                          <span className="text-sm font-medium">
                            {stockStatus.status === 'out-of-stock' && 'Out of stock - Reorder immediately'}
                            {stockStatus.status === 'expired' && 'Item has expired - Remove from inventory'}
                            {stockStatus.status === 'expiring-soon' && `Expiring in ${daysToExpiry} days - Use soon`}
                            {stockStatus.status === 'low-stock' && 'Below reorder level - Place order'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStockAdjustment(item, -1)}
                      disabled={item.currentStock === 0}
                    >
                      <ArrowDown size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStockAdjustment(item, 1)}
                    >
                      <ArrowUp size={16} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                      <Pencil size={16} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)}>
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Food Item' : 'Add New Food Item'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Fresh Tomatoes"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as FoodCategory })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                    <SelectItem value="fruits">Fruits</SelectItem>
                    <SelectItem value="meat">Meat</SelectItem>
                    <SelectItem value="dairy">Dairy</SelectItem>
                    <SelectItem value="beverage">Beverage</SelectItem>
                    <SelectItem value="frozen">Frozen</SelectItem>
                    <SelectItem value="bakery">Bakery</SelectItem>
                    <SelectItem value="dry-goods">Dry Goods</SelectItem>
                    <SelectItem value="spices">Spices</SelectItem>
                    <SelectItem value="non-perishable">Non-Perishable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit *</label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="kg, liter, piece"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Current Stock *</label>
                <Input
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Unit Cost *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.unitCost}
                  onChange={(e) => setFormData({ ...formData, unitCost: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Reorder Level *</label>
                <Input
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Reorder Quantity *</label>
                <Input
                  type="number"
                  value={formData.reorderQuantity}
                  onChange={(e) => setFormData({ ...formData, reorderQuantity: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Order Frequency *</label>
              <Select value={formData.orderFrequency} onValueChange={(value) => setFormData({ ...formData, orderFrequency: value as OrderFrequency })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="on-demand">On-Demand</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Store Location *</label>
              <Input
                value={formData.storeLocation}
                onChange={(e) => setFormData({ ...formData, storeLocation: e.target.value })}
                placeholder="e.g., Kitchen Cold Storage"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Batch Number</label>
              <Input
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                placeholder="Optional"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPerishable"
                checked={formData.isPerishable}
                onChange={(e) => setFormData({ ...formData, isPerishable: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isPerishable" className="text-sm font-medium">
                Perishable Item
              </label>
            </div>

            {formData.isPerishable && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Expiry Date</label>
                    <Input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Shelf Life (days)</label>
                    <Input
                      type="number"
                      value={formData.shelfLife}
                      onChange={(e) => setFormData({ ...formData, shelfLife: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Quality Status</label>
                  <Select value={formData.qualityStatus} onValueChange={(value) => setFormData({ ...formData, qualityStatus: value as QualityStatus })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm() }}>
              Cancel
            </Button>
            <Button onClick={handleAddEdit}>
              {editingItem ? 'Update' : 'Add'} Food Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
