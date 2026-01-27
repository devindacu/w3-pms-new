import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Package,
  MagnifyingGlass,
  Download,
  Barcode,
  TrendUp,
  TrendDown,
  Clock,
  Warning,
  ChartBar,
  ArrowsClockwise,
  Carrot,
  Basket,
  Hammer,
  ClipboardText,
  Buildings,
  FunnelSimple,
  Plus,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/helpers'
import type {
  FoodItem,
  Amenity,
  ConstructionMaterial,
  GeneralProduct,
  Department,
  Supplier,
  AmenityUsageLog,
  AmenityAutoOrder,
} from '@/lib/types'
import { StockMovementDialog } from '@/components/StockMovementDialog'
import { BatchTrackingDialog } from '@/components/BatchTrackingDialog'
import { DepartmentUsageDialog } from '@/components/DepartmentUsageDialog'
import { FoodManagement } from '@/components/FoodManagement'
import { AmenitiesManagement } from '@/components/AmenitiesManagement'
import { GeneralProductsManagement } from '@/components/GeneralProductsManagement'
import { PrintButton } from '@/components/PrintButton'
import { A4PrintWrapper } from '@/components/A4PrintWrapper'

type InventorySource = 'all' | 'food' | 'amenities' | 'construction' | 'general'
type StockLevel = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock' | 'expiring'

interface UnifiedInventoryItem {
  id: string
  productId: string
  name: string
  category: string
  source: 'food' | 'amenities' | 'construction' | 'general'
  unit: string
  currentStock: number
  reorderLevel: number
  reorderQuantity: number
  unitCost: number
  totalValue: number
  supplierIds: string[]
  storeLocation: string
  batchNumber?: string
  expiryDate?: number
  lastUpdated: number
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expiring'
  department?: Department[]
  usageRatePerDay?: number
  isPerishable?: boolean
}

interface InventoryManagementProps {
  foodItems: FoodItem[]
  setFoodItems: (items: FoodItem[] | ((prev: FoodItem[]) => FoodItem[])) => void
  amenities: Amenity[]
  setAmenities: (items: Amenity[] | ((prev: Amenity[]) => Amenity[])) => void
  amenityUsageLogs: AmenityUsageLog[]
  setAmenityUsageLogs: (logs: AmenityUsageLog[] | ((prev: AmenityUsageLog[]) => AmenityUsageLog[])) => void
  amenityAutoOrders: AmenityAutoOrder[]
  setAmenityAutoOrders: (orders: AmenityAutoOrder[] | ((prev: AmenityAutoOrder[]) => AmenityAutoOrder[])) => void
  constructionMaterials: ConstructionMaterial[]
  generalProducts: GeneralProduct[]
  setGeneralProducts: (products: GeneralProduct[] | ((prev: GeneralProduct[]) => GeneralProduct[])) => void
  suppliers: Supplier[]
}

export function InventoryManagement({
  foodItems,
  setFoodItems,
  amenities,
  setAmenities,
  amenityUsageLogs,
  setAmenityUsageLogs,
  amenityAutoOrders,
  setAmenityAutoOrders,
  constructionMaterials,
  generalProducts,
  setGeneralProducts,
  suppliers,
}: InventoryManagementProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState<InventorySource>('all')
  const [stockLevelFilter, setStockLevelFilter] = useState<StockLevel>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [movementDialogOpen, setMovementDialogOpen] = useState(false)
  const [batchDialogOpen, setBatchDialogOpen] = useState(false)
  const [usageDialogOpen, setUsageDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<UnifiedInventoryItem | null>(null)

  const getStockStatus = (item: UnifiedInventoryItem): 'in-stock' | 'low-stock' | 'out-of-stock' | 'expiring' => {
    if (item.currentStock === 0) return 'out-of-stock'
    
    if (item.expiryDate) {
      const daysToExpiry = Math.ceil((item.expiryDate - Date.now()) / (1000 * 60 * 60 * 24))
      if (daysToExpiry <= 7 && daysToExpiry > 0) return 'expiring'
      if (daysToExpiry <= 0) return 'out-of-stock'
    }
    
    if (item.currentStock <= item.reorderLevel) return 'low-stock'
    return 'in-stock'
  }

  const unifiedInventory = useMemo<UnifiedInventoryItem[]>(() => {
    const unified: UnifiedInventoryItem[] = []

    foodItems.forEach(item => {
      const totalValue = item.currentStock * item.unitCost
      const unifiedItem: UnifiedInventoryItem = {
        id: item.id,
        productId: item.foodId,
        name: item.name,
        category: item.category,
        source: 'food',
        unit: item.unit,
        currentStock: item.currentStock,
        reorderLevel: item.reorderLevel,
        reorderQuantity: item.reorderQuantity,
        unitCost: item.unitCost,
        totalValue,
        supplierIds: item.supplierIds,
        storeLocation: item.storeLocation,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
        lastUpdated: item.lastUpdated,
        stockStatus: 'in-stock',
        isPerishable: item.isPerishable,
      }
      unifiedItem.stockStatus = getStockStatus(unifiedItem)
      unified.push(unifiedItem)
    })

    amenities.forEach(item => {
      const totalValue = item.currentStock * item.unitCost
      const unifiedItem: UnifiedInventoryItem = {
        id: item.id,
        productId: item.amenityId,
        name: item.name,
        category: item.category,
        source: 'amenities',
        unit: item.unit,
        currentStock: item.currentStock,
        reorderLevel: item.reorderLevel,
        reorderQuantity: item.reorderQuantity,
        unitCost: item.unitCost,
        totalValue,
        supplierIds: item.supplierIds,
        storeLocation: item.storeLocation,
        lastUpdated: item.lastUpdated,
        stockStatus: 'in-stock',
        department: item.department as Department[],
        usageRatePerDay: item.usageRatePerDay,
      }
      unifiedItem.stockStatus = getStockStatus(unifiedItem)
      unified.push(unifiedItem)
    })

    constructionMaterials.forEach(item => {
      const totalValue = item.currentStock * item.unitCost
      const unifiedItem: UnifiedInventoryItem = {
        id: item.id,
        productId: item.materialId,
        name: item.name,
        category: item.category,
        source: 'construction',
        unit: item.unit,
        currentStock: item.currentStock,
        reorderLevel: item.reorderLevel,
        reorderQuantity: item.reorderQuantity,
        unitCost: item.unitCost,
        totalValue,
        supplierIds: item.supplierIds,
        storeLocation: item.storeLocation,
        batchNumber: item.batchNumber,
        lastUpdated: item.lastUpdated,
        stockStatus: 'in-stock',
      }
      unifiedItem.stockStatus = getStockStatus(unifiedItem)
      unified.push(unifiedItem)
    })

    generalProducts.forEach(item => {
      const totalValue = item.currentStock * item.unitCost
      const unifiedItem: UnifiedInventoryItem = {
        id: item.id,
        productId: item.productId,
        name: item.name,
        category: item.category,
        source: 'general',
        unit: item.unit,
        currentStock: item.currentStock,
        reorderLevel: item.reorderLevel,
        reorderQuantity: item.reorderQuantity,
        unitCost: item.unitCost,
        totalValue,
        supplierIds: item.supplierIds,
        storeLocation: item.storeLocation,
        batchNumber: item.batchNumber,
        lastUpdated: item.lastUpdated,
        stockStatus: 'in-stock',
        department: item.department,
      }
      unifiedItem.stockStatus = getStockStatus(unifiedItem)
      unified.push(unifiedItem)
    })

    return unified
  }, [foodItems, amenities, constructionMaterials, generalProducts])

  const filteredInventory = useMemo(() => {
    return unifiedInventory.filter(item => {
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !item.productId.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      if (sourceFilter !== 'all' && item.source !== sourceFilter) {
        return false
      }

      if (stockLevelFilter !== 'all' && item.stockStatus !== stockLevelFilter) {
        return false
      }

      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false
      }

      return true
    })
  }, [unifiedInventory, searchQuery, sourceFilter, stockLevelFilter, selectedCategory])

  const metrics = useMemo(() => {
    const totalItems = unifiedInventory.length
    const totalValue = unifiedInventory.reduce((sum, item) => sum + item.totalValue, 0)
    const lowStock = unifiedInventory.filter(item => item.stockStatus === 'low-stock').length
    const outOfStock = unifiedInventory.filter(item => item.stockStatus === 'out-of-stock').length
    const expiring = unifiedInventory.filter(item => item.stockStatus === 'expiring').length

    return {
      totalItems,
      totalValue,
      lowStock,
      outOfStock,
      expiring,
      inStock: totalItems - lowStock - outOfStock - expiring,
    }
  }, [unifiedInventory])

  const categories = useMemo(() => {
    const cats = new Set(unifiedInventory.map(item => item.category))
    return Array.from(cats).sort()
  }, [unifiedInventory])

  const getStockBadge = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20">In Stock</Badge>
      case 'low-stock':
        return <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">Low Stock</Badge>
      case 'out-of-stock':
        return <Badge variant="destructive">Out of Stock</Badge>
      case 'expiring':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Expiring Soon</Badge>
      default:
        return null
    }
  }

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'food':
        return <Carrot size={16} />
      case 'amenities':
        return <Basket size={16} />
      case 'construction':
        return <Hammer size={16} />
      case 'general':
        return <ClipboardText size={16} />
      default:
        return <Package size={16} />
    }
  }

  const getSupplierName = (supplierIds: string[]) => {
    if (!supplierIds || supplierIds.length === 0) return 'N/A'
    const supplier = suppliers.find(s => s.id === supplierIds[0])
    return supplier ? supplier.name : 'Unknown'
  }

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Name', 'Category', 'Source', 'Current Stock', 'Unit', 'Unit Cost', 'Total Value', 'Status', 'Supplier', 'Location'].join(','),
      ...filteredInventory.map(item => [
        item.productId,
        item.name,
        item.category,
        item.source,
        item.currentStock,
        item.unit,
        item.unitCost,
        item.totalValue.toFixed(2),
        item.stockStatus,
        getSupplierName(item.supplierIds),
        item.storeLocation,
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory_${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    toast.success('Inventory data exported')
  }

  const openMovementDialog = (item: UnifiedInventoryItem) => {
    setSelectedItem(item)
    setMovementDialogOpen(true)
  }

  const openBatchDialog = (item: UnifiedInventoryItem) => {
    setSelectedItem(item)
    setBatchDialogOpen(true)
  }

  const openUsageDialog = (item: UnifiedInventoryItem) => {
    setSelectedItem(item)
    setUsageDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">Unified real-time stock tracking and management across all departments</p>
        </div>
        <div className="flex gap-2">
          <PrintButton
            elementId="inventory-printable"
            options={{
              title: 'Inventory Management Report',
              filename: `inventory-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`
            }}
            variant="outline"
            size="default"
          />
          <Button onClick={handleExport} variant="outline">
            <Download size={20} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Package size={18} className="mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="food">
            <Carrot size={18} className="mr-2" />
            Food Items
          </TabsTrigger>
          <TabsTrigger value="amenities">
            <Basket size={18} className="mr-2" />
            Amenities
          </TabsTrigger>
          <TabsTrigger value="general">
            <ClipboardText size={18} className="mr-2" />
            General Products
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Items</h3>
            <Package size={20} className="text-primary" />
          </div>
          <p className="text-3xl font-semibold">{metrics.totalItems}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Value: {formatCurrency(metrics.totalValue)}</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">In Stock</h3>
            <TrendUp size={20} className="text-success" />
          </div>
          <p className="text-3xl font-semibold">{metrics.inStock}</p>
          <p className="text-xs text-muted-foreground mt-1">Healthy levels</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Low Stock</h3>
            <Warning size={20} className="text-accent" />
          </div>
          <p className="text-3xl font-semibold">{metrics.lowStock}</p>
          <p className="text-xs text-muted-foreground mt-1">Needs reorder</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-destructive">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Out of Stock</h3>
            <TrendDown size={20} className="text-destructive" />
          </div>
          <p className="text-3xl font-semibold">{metrics.outOfStock}</p>
          <p className="text-xs text-muted-foreground mt-1">Urgent action needed</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-destructive">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Expiring Soon</h3>
            <Clock size={20} className="text-destructive" />
          </div>
          <p className="text-3xl font-semibold">{metrics.expiring}</p>
          <p className="text-xs text-muted-foreground mt-1">Within 7 days</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or product ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={sourceFilter} onValueChange={(value) => setSourceFilter(value as InventorySource)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="food">Food Items</SelectItem>
                <SelectItem value="amenities">Amenities</SelectItem>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="general">General Products</SelectItem>
              </SelectContent>
            </Select>

            <Select value={stockLevelFilter} onValueChange={(value) => setStockLevelFilter(value as StockLevel)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock Levels</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      No inventory items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">{item.productId}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSourceIcon(item.source)}
                          <span className="capitalize text-sm">{item.source}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize text-sm">{item.category.replace('-', ' ')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-medium">{item.currentStock} {item.unit}</span>
                          {item.currentStock <= item.reorderLevel && (
                            <span className="text-xs text-muted-foreground">Reorder: {item.reorderLevel}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitCost)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.totalValue)}</TableCell>
                      <TableCell>{getStockBadge(item.stockStatus)}</TableCell>
                      <TableCell className="text-sm">{item.storeLocation}</TableCell>
                      <TableCell className="text-sm">{getSupplierName(item.supplierIds)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openMovementDialog(item)}
                            title="Stock Movement"
                          >
                            <ArrowsClockwise size={16} />
                          </Button>
                          {item.batchNumber && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openBatchDialog(item)}
                              title="Batch Tracking"
                            >
                              <Barcode size={16} />
                            </Button>
                          )}
                          {item.department && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openUsageDialog(item)}
                              title="Department Usage"
                            >
                              <ChartBar size={16} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredInventory.length > 0 && (
            <div className="text-sm text-muted-foreground text-center">
              Showing {filteredInventory.length} of {unifiedInventory.length} items
            </div>
          )}
        </div>
      </Card>

        {selectedItem && (
          <>
            <StockMovementDialog
              open={movementDialogOpen}
              onOpenChange={setMovementDialogOpen}
              item={selectedItem}
            />
            <BatchTrackingDialog
              open={batchDialogOpen}
              onOpenChange={setBatchDialogOpen}
              item={selectedItem}
            />
            <DepartmentUsageDialog
              open={usageDialogOpen}
              onOpenChange={setUsageDialogOpen}
              item={selectedItem}
            />
          </>
        )}
        </TabsContent>

        <TabsContent value="food">
          <FoodManagement 
            foodItems={foodItems}
            setFoodItems={setFoodItems}
            suppliers={suppliers}
          />
        </TabsContent>

        <TabsContent value="amenities">
          <AmenitiesManagement 
            amenities={amenities}
            setAmenities={setAmenities}
            suppliers={suppliers}
            usageLogs={amenityUsageLogs}
            setUsageLogs={setAmenityUsageLogs}
            autoOrders={amenityAutoOrders}
            setAutoOrders={setAmenityAutoOrders}
          />
        </TabsContent>

        <TabsContent value="general">
          <GeneralProductsManagement
            products={generalProducts}
            setProducts={setGeneralProducts}
            suppliers={suppliers}
          />
        </TabsContent>
      </Tabs>

      {/* Hidden printable content */}
      <div className="hidden">
        <A4PrintWrapper
          id="inventory-printable"
          title="Inventory Management Report"
          headerContent={
            <div className="text-sm">
              <p><strong>Generated:</strong> {format(new Date(), 'PPP')}</p>
              <p><strong>Total Items:</strong> {filteredInventory.length}</p>
              <p><strong>Total Value:</strong> {formatCurrency(metrics.totalValue)}</p>
            </div>
          }
        >
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-4">Inventory Summary</h2>
              <table className="w-full border-collapse mb-6">
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 font-semibold">Total Items</td>
                    <td className="p-2 text-right">{metrics.totalItems}</td>
                    <td className="p-2 font-semibold">Total Value</td>
                    <td className="p-2 text-right">{formatCurrency(metrics.totalValue)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-semibold">In Stock</td>
                    <td className="p-2 text-right">{metrics.inStock}</td>
                    <td className="p-2 font-semibold">Low Stock</td>
                    <td className="p-2 text-right">{metrics.lowStock}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-semibold">Out of Stock</td>
                    <td className="p-2 text-right">{metrics.outOfStock}</td>
                    <td className="p-2 font-semibold">Expiring Soon</td>
                    <td className="p-2 text-right">{metrics.expiring}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-4">Inventory Items</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Product ID</th>
                    <th className="border p-2 text-left">Name</th>
                    <th className="border p-2 text-left">Category</th>
                    <th className="border p-2 text-right">Stock</th>
                    <th className="border p-2 text-right">Unit Cost</th>
                    <th className="border p-2 text-right">Total Value</th>
                    <th className="border p-2 text-left">Status</th>
                    <th className="border p-2 text-left">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.id}>
                      <td className="border p-2 font-mono text-xs">{item.productId}</td>
                      <td className="border p-2">{item.name}</td>
                      <td className="border p-2 capitalize text-sm">{item.category.replace('-', ' ')}</td>
                      <td className="border p-2 text-right">{item.currentStock} {item.unit}</td>
                      <td className="border p-2 text-right">{formatCurrency(item.unitCost)}</td>
                      <td className="border p-2 text-right font-semibold">{formatCurrency(item.totalValue)}</td>
                      <td className="border p-2 capitalize text-sm">{item.stockStatus.replace('-', ' ')}</td>
                      <td className="border p-2 text-sm">{item.storeLocation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </A4PrintWrapper>
      </div>
    </div>
  )
}
