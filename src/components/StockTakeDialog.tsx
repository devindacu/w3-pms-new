import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DialogAdapter } from '@/components/adapters/DialogAdapter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  ClipboardText, 
  Plus, 
  Minus, 
  CheckCircle, 
  Warning,
  Package,
  TrendUp,
  TrendDown
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { FoodItem, Amenity, ConstructionMaterial, GeneralProduct, SystemUser } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/helpers'

export interface StockTakeItem {
  id: string
  itemId: string
  itemName: string
  itemType: 'food' | 'amenity' | 'material' | 'product'
  category: string
  systemQuantity: number
  physicalQuantity: number | null
  variance: number
  variancePercentage: number
  unitCost: number
  varianceValue: number
  unit: string
  counted: boolean
}

export interface StockTake {
  id: string
  stockTakeNumber: string
  date: number
  status: 'in-progress' | 'completed' | 'approved'
  itemType: 'food' | 'amenity' | 'material' | 'product' | 'all'
  location?: string
  items: StockTakeItem[]
  totalVarianceValue: number
  countedBy: string
  approvedBy?: string
  approvedAt?: number
  notes?: string
  createdAt: number
  completedAt?: number
}

interface StockTakeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  foodItems: FoodItem[]
  amenities: Amenity[]
  materials: ConstructionMaterial[]
  products: GeneralProduct[]
  currentUser: SystemUser
  onComplete: (stockTake: StockTake) => void
}

export function StockTakeDialog({
  open,
  onOpenChange,
  foodItems,
  amenities,
  materials,
  products,
  currentUser,
  onComplete
}: StockTakeDialogProps) {
  const [itemType, setItemType] = useState<'food' | 'amenity' | 'material' | 'product'>('food')
  const [stockTakeItems, setStockTakeItems] = useState<StockTakeItem[]>([])
  const [notes, setNotes] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const initializeStockTake = (type: typeof itemType) => {
    let items: StockTakeItem[] = []
    
    switch (type) {
      case 'food':
        items = foodItems.map(item => ({
          id: `st-${item.id}`,
          itemId: item.id,
          itemName: item.name,
          itemType: 'food' as const,
          category: item.category,
          systemQuantity: item.currentStock,
          physicalQuantity: null,
          variance: 0,
          variancePercentage: 0,
          unitCost: item.unitCost,
          varianceValue: 0,
          unit: item.unit,
          counted: false
        }))
        break
      case 'amenity':
        items = amenities.map(item => ({
          id: `st-${item.id}`,
          itemId: item.id,
          itemName: item.name,
          itemType: 'amenity' as const,
          category: item.category,
          systemQuantity: item.currentStock,
          physicalQuantity: null,
          variance: 0,
          variancePercentage: 0,
          unitCost: item.unitCost,
          varianceValue: 0,
          unit: item.unit,
          counted: false
        }))
        break
      case 'material':
        items = materials.map(item => ({
          id: `st-${item.id}`,
          itemId: item.id,
          itemName: item.name,
          itemType: 'material' as const,
          category: item.category,
          systemQuantity: item.currentStock,
          physicalQuantity: null,
          variance: 0,
          variancePercentage: 0,
          unitCost: item.unitCost,
          varianceValue: 0,
          unit: item.unit,
          counted: false
        }))
        break
      case 'product':
        items = products.map(item => ({
          id: `st-${item.id}`,
          itemId: item.id,
          itemName: item.name,
          itemType: 'product' as const,
          category: item.category,
          systemQuantity: item.currentStock,
          physicalQuantity: null,
          variance: 0,
          variancePercentage: 0,
          unitCost: item.unitCost,
          varianceValue: 0,
          unit: item.unit,
          counted: false
        }))
        break
    }
    
    setStockTakeItems(items)
    setItemType(type)
  }

  const handlePhysicalCountChange = (itemId: string, value: string) => {
    const physicalQty = value === '' ? null : parseFloat(value)
    
    setStockTakeItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const variance = physicalQty !== null ? physicalQty - item.systemQuantity : 0
        const variancePercentage = item.systemQuantity > 0 
          ? (variance / item.systemQuantity) * 100 
          : 0
        const varianceValue = variance * item.unitCost
        
        return {
          ...item,
          physicalQuantity: physicalQty,
          variance,
          variancePercentage,
          varianceValue,
          counted: physicalQty !== null
        }
      }
      return item
    }))
  }

  const handleQuickAdjust = (itemId: string, adjustment: number) => {
    setStockTakeItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const currentPhysical = item.physicalQuantity ?? item.systemQuantity
        const newPhysical = Math.max(0, currentPhysical + adjustment)
        const variance = newPhysical - item.systemQuantity
        const variancePercentage = item.systemQuantity > 0 
          ? (variance / item.systemQuantity) * 100 
          : 0
        const varianceValue = variance * item.unitCost
        
        return {
          ...item,
          physicalQuantity: newPhysical,
          variance,
          variancePercentage,
          varianceValue,
          counted: true
        }
      }
      return item
    }))
  }

  const handleComplete = () => {
    const countedItems = stockTakeItems.filter(item => item.counted)
    
    if (countedItems.length === 0) {
      toast.error('Please count at least one item before completing')
      return
    }

    const totalVarianceValue = stockTakeItems.reduce((sum, item) => 
      sum + (item.counted ? item.varianceValue : 0), 0
    )

    const stockTake: StockTake = {
      id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      stockTakeNumber: `ST-${Date.now()}`,
      date: Date.now(),
      status: 'completed',
      itemType,
      items: stockTakeItems,
      totalVarianceValue,
      countedBy: `${currentUser.firstName} ${currentUser.lastName}`,
      notes: notes || undefined,
      createdAt: Date.now(),
      completedAt: Date.now()
    }

    onComplete(stockTake)
    toast.success(`Stock take completed. ${countedItems.length} items counted.`)
    onOpenChange(false)
    
    // Reset state
    setStockTakeItems([])
    setNotes('')
    setSearchTerm('')
  }

  const filteredItems = stockTakeItems.filter(item =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: stockTakeItems.length,
    counted: stockTakeItems.filter(i => i.counted).length,
    withVariance: stockTakeItems.filter(i => i.counted && i.variance !== 0).length,
    totalVarianceValue: stockTakeItems.reduce((sum, i) => sum + (i.counted ? i.varianceValue : 0), 0)
  }

  if (stockTakeItems.length === 0 && open) {
    return (
      <DialogAdapter open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardText className="h-6 w-6" />
              Start Stock Take
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Select the type of inventory you want to count:
            </p>

            <div className="grid grid-cols-2 gap-4">
              <Card 
                className="p-6 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                onClick={() => initializeStockTake('food')}
              >
                <Package className="h-12 w-12 mb-3 text-primary" />
                <h3 className="font-semibold mb-1">Food Items</h3>
                <p className="text-sm text-muted-foreground">{foodItems.length} items</p>
              </Card>

              <Card 
                className="p-6 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                onClick={() => initializeStockTake('amenity')}
              >
                <Package className="h-12 w-12 mb-3 text-primary" />
                <h3 className="font-semibold mb-1">Amenities</h3>
                <p className="text-sm text-muted-foreground">{amenities.length} items</p>
              </Card>

              <Card 
                className="p-6 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                onClick={() => initializeStockTake('material')}
              >
                <Package className="h-12 w-12 mb-3 text-primary" />
                <h3 className="font-semibold mb-1">Construction Materials</h3>
                <p className="text-sm text-muted-foreground">{materials.length} items</p>
              </Card>

              <Card 
                className="p-6 cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                onClick={() => initializeStockTake('product')}
              >
                <Package className="h-12 w-12 mb-3 text-primary" />
                <h3 className="font-semibold mb-1">General Products</h3>
                <p className="text-sm text-muted-foreground">{products.length} items</p>
              </Card>
            </div>
          </div>
        </DialogContent>
      </DialogAdapter>
    )
  }

  return (
    <DialogAdapter open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardText className="h-6 w-6" />
            Stock Take - {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Counted</p>
              <p className="text-2xl font-bold text-success">{stats.counted}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">With Variance</p>
              <p className="text-2xl font-bold text-warning">{stats.withVariance}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Variance Value</p>
              <p className={`text-2xl font-bold ${stats.totalVarianceValue >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(Math.abs(stats.totalVarianceValue))}
              </p>
            </Card>
          </div>

          {/* Search */}
          <div>
            <Label>Search Items</Label>
            <Input
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Items Table */}
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">System Qty</TableHead>
                  <TableHead className="text-right">Physical Qty</TableHead>
                  <TableHead className="text-center">Quick Adjust</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead className="text-right">Value Impact</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.itemName}</TableCell>
                    <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                    <TableCell className="text-right">
                      {item.systemQuantity} {item.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        className="w-24 text-right"
                        placeholder="Count"
                        value={item.physicalQuantity ?? ''}
                        onChange={(e) => handlePhysicalCountChange(item.id, e.target.value)}
                        step="0.01"
                        min="0"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickAdjust(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickAdjust(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.counted && (
                        <div className="flex items-center justify-end gap-1">
                          {item.variance > 0 ? (
                            <TrendUp className="h-4 w-4 text-success" />
                          ) : item.variance < 0 ? (
                            <TrendDown className="h-4 w-4 text-destructive" />
                          ) : null}
                          <span className={item.variance !== 0 ? (item.variance > 0 ? 'text-success' : 'text-destructive') : ''}>
                            {item.variance > 0 ? '+' : ''}{item.variance.toFixed(2)} ({item.variancePercentage.toFixed(1)}%)
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.counted && (
                        <span className={item.varianceValue !== 0 ? (item.varianceValue > 0 ? 'text-success' : 'text-destructive') : ''}>
                          {item.varianceValue > 0 ? '+' : ''}{formatCurrency(Math.abs(item.varianceValue))}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.counted ? (
                        <Badge className="bg-success">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Counted
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Warning className="mr-1 h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          {/* Notes */}
          <div>
            <Label>Notes (Optional)</Label>
            <Input
              placeholder="Add any notes about this stock take..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleComplete} disabled={stats.counted === 0}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Complete Stock Take ({stats.counted} items)
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogAdapter>
  )
}
