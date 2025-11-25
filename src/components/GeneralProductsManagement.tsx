import { useState } from 'react'
import { type GeneralProduct, type Supplier } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Plus,
  MagnifyingGlass,
  Package,
  Warning,
  CheckCircle,
  Trash,
  PencilSimple,
  ArrowCounterClockwise,
  Minus
} from '@phosphor-icons/react'
import { GeneralProductDialog } from '@/components/GeneralProductDialog'
import { formatCurrency, getStockStatus } from '@/lib/helpers'

interface GeneralProductsManagementProps {
  products: GeneralProduct[]
  setProducts: (updater: (current: GeneralProduct[]) => GeneralProduct[]) => void
  suppliers: Supplier[]
}

export function GeneralProductsManagement({ products, setProducts, suppliers }: GeneralProductsManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [filterLowStock, setFilterLowStock] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<GeneralProduct | null>(null)

  const categories = Array.from(
    new Set(products.map(p => p.category))
  ).sort()

  const departments = Array.from(
    new Set(products.flatMap(p => p.department))
  ).sort()

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesDepartment = selectedDepartment === 'all' || product.department.includes(selectedDepartment as any)
    const matchesLowStock = !filterLowStock || product.currentStock <= product.reorderLevel
    return matchesSearch && matchesCategory && matchesDepartment && matchesLowStock
  })

  const lowStockCount = products.filter(p => p.currentStock <= p.reorderLevel).length
  const outOfStockCount = products.filter(p => p.currentStock === 0).length

  const handleAddProduct = (product: GeneralProduct) => {
    setProducts(current => [...current, product])
    setDialogOpen(false)
    toast.success('Product added successfully')
  }

  const handleUpdateProduct = (product: GeneralProduct) => {
    setProducts(current => 
      current.map(p => p.id === product.id ? product : p)
    )
    setEditingProduct(null)
    toast.success('Product updated successfully')
  }

  const handleDeleteProduct = (id: string) => {
    setProducts(current => current.filter(p => p.id !== id))
    toast.success('Product deleted successfully')
  }

  const handleRestockProduct = (product: GeneralProduct) => {
    setProducts(current => 
      current.map(p => 
        p.id === product.id 
          ? { 
              ...p, 
              currentStock: p.currentStock + p.reorderQuantity,
              lastRestocked: Date.now(),
              lastUpdated: Date.now()
            } 
          : p
      )
    )
    toast.success(`Restocked ${product.name}`)
  }

  const getStockStatusBadge = (product: GeneralProduct) => {
    if (product.currentStock === 0) {
      return <Badge variant="destructive" className="gap-1"><Warning size={14} />Out of Stock</Badge>
    }
    if (product.currentStock <= product.reorderLevel) {
      return <Badge variant="secondary" className="gap-1 bg-accent text-accent-foreground"><Warning size={14} />Low Stock</Badge>
    }
    return <Badge variant="secondary" className="gap-1 bg-success/10 text-success"><CheckCircle size={14} />In Stock</Badge>
  }

  const getCategoryLabel = (category: string) => {
    return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">General Products</h1>
          <p className="text-muted-foreground mt-1">Office supplies, cleaning products, and miscellaneous items</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="lg">
          <Plus size={20} className="mr-2" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-3xl font-semibold mt-1">{products.length}</p>
            </div>
            <Package size={32} className="text-primary" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <p className="text-3xl font-semibold mt-1">{lowStockCount}</p>
            </div>
            <Warning size={32} className="text-accent" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Out of Stock</p>
              <p className="text-3xl font-semibold mt-1">{outOfStockCount}</p>
            </div>
            <Warning size={32} className="text-destructive" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-3xl font-semibold mt-1">
                {formatCurrency(products.reduce((sum, p) => sum + (p.currentStock * p.unitCost), 0))}
              </p>
            </div>
            <Package size={32} className="text-success" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="relative">
            <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products by name, ID, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Categories
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {getCategoryLabel(category)}
              </Button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedDepartment === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDepartment('all')}
            >
              All Departments
            </Button>
            {departments.map(dept => (
              <Button
                key={dept}
                variant={selectedDepartment === dept ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedDepartment(dept)}
              >
                {getCategoryLabel(dept)}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={filterLowStock ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterLowStock(!filterLowStock)}
            >
              <Warning size={16} className="mr-1" />
              Low Stock Only ({lowStockCount})
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <Card key={product.id} className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.productId}</p>
              </div>
              {getStockStatusBadge(product)}
            </div>

            {product.description && (
              <p className="text-sm text-muted-foreground">{product.description}</p>
            )}

            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary">{getCategoryLabel(product.category)}</Badge>
              {product.isConsumable ? (
                <Badge variant="outline">Consumable</Badge>
              ) : (
                <Badge variant="outline">Asset</Badge>
              )}
            </div>

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Stock:</span>
                <span className="font-semibold">{product.currentStock} {product.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reorder Level:</span>
                <span>{product.reorderLevel} {product.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unit Cost:</span>
                <span>{formatCurrency(product.unitCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Value:</span>
                <span className="font-semibold">{formatCurrency(product.currentStock * product.unitCost)}</span>
              </div>
            </div>

            <Separator />

            <div className="text-xs text-muted-foreground">
              <p>Location: {product.storeLocation}</p>
              <p>Departments: {product.department.map(d => getCategoryLabel(d)).join(', ')}</p>
              {product.warrantyMonths && (
                <p>Warranty: {product.warrantyMonths} months</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setEditingProduct(product)}
              >
                <PencilSimple size={16} className="mr-1" />
                Edit
              </Button>
              {product.currentStock <= product.reorderLevel && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleRestockProduct(product)}
                >
                  <ArrowCounterClockwise size={16} className="mr-1" />
                  Restock
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteProduct(product.id)}
              >
                <Trash size={16} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="p-16 text-center">
          <Package size={64} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-2xl font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm || selectedCategory !== 'all' || selectedDepartment !== 'all' || filterLowStock
              ? 'Try adjusting your filters'
              : 'Add your first general product to get started'}
          </p>
          {!searchTerm && selectedCategory === 'all' && selectedDepartment === 'all' && !filterLowStock && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus size={20} className="mr-2" />
              Add Product
            </Button>
          )}
        </Card>
      )}

      {dialogOpen && (
        <GeneralProductDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSave={handleAddProduct}
          suppliers={suppliers}
        />
      )}

      {editingProduct && (
        <GeneralProductDialog
          open={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleUpdateProduct}
          product={editingProduct}
          suppliers={suppliers}
        />
      )}
    </div>
  )
}
