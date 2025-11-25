import { useState } from 'react'
import { type GeneralProduct, type Supplier, type Department, type GeneralProductCategory } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { X } from '@phosphor-icons/react'

interface GeneralProductDialogProps {
  open: boolean
  onClose: () => void
  onSave: (product: GeneralProduct) => void
  product?: GeneralProduct
  suppliers: Supplier[]
}

const CATEGORIES: GeneralProductCategory[] = [
  'office-supplies',
  'cleaning-products',
  'seasonal-items',
  'promotional-materials',
  'uniforms',
  'safety-equipment',
  'technology',
  'furniture',
  'signage',
  'miscellaneous'
]

const DEPARTMENTS: Department[] = [
  'front-office',
  'housekeeping',
  'fnb',
  'kitchen',
  'engineering',
  'finance',
  'hr',
  'admin'
]

export function GeneralProductDialog({ open, onClose, onSave, product, suppliers }: GeneralProductDialogProps) {
  const [formData, setFormData] = useState<GeneralProduct>({
    id: product?.id || `gp-${Date.now()}`,
    productId: product?.productId || `GP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`,
    name: product?.name || '',
    category: product?.category || 'office-supplies',
    description: product?.description || '',
    unit: product?.unit || 'unit',
    currentStock: product?.currentStock || 0,
    reorderLevel: product?.reorderLevel || 10,
    reorderQuantity: product?.reorderQuantity || 20,
    unitCost: product?.unitCost || 0,
    supplierIds: product?.supplierIds || [],
    department: product?.department || [],
    storeLocation: product?.storeLocation || '',
    batchNumber: product?.batchNumber || '',
    warrantyMonths: product?.warrantyMonths,
    purchaseDate: product?.purchaseDate,
    lastOrdered: product?.lastOrdered,
    lastRestocked: product?.lastRestocked,
    isConsumable: product?.isConsumable ?? true,
    notes: product?.notes || '',
    lastUpdated: Date.now(),
    createdAt: product?.createdAt || Date.now()
  })

  const toggleDepartment = (dept: Department) => {
    setFormData(prev => ({
      ...prev,
      department: prev.department.includes(dept)
        ? prev.department.filter(d => d !== dept)
        : [...prev.department, dept]
    }))
  }

  const toggleSupplier = (supplierId: string) => {
    setFormData(prev => ({
      ...prev,
      supplierIds: prev.supplierIds.includes(supplierId)
        ? prev.supplierIds.filter(id => id !== supplierId)
        : [...prev.supplierIds, supplierId]
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || formData.department.length === 0) {
      return
    }
    onSave(formData)
  }

  const getCategoryLabel = (category: string) => {
    return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit General Product' : 'Add New General Product'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productId">Product ID</Label>
                <Input
                  id="productId"
                  value={formData.productId}
                  onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as GeneralProductCategory }))}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit of Measurement</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="e.g., unit, box, ream, bottle"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-4">Inventory</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentStock">Current Stock</Label>
                <Input
                  id="currentStock"
                  type="number"
                  min="0"
                  value={formData.currentStock}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentStock: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorderLevel">Reorder Level</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  min="0"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, reorderLevel: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorderQuantity">Reorder Quantity</Label>
                <Input
                  id="reorderQuantity"
                  type="number"
                  min="1"
                  value={formData.reorderQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, reorderQuantity: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitCost">Unit Cost</Label>
                <Input
                  id="unitCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unitCost}
                  onChange={(e) => setFormData(prev => ({ ...prev, unitCost: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeLocation">Storage Location</Label>
                <Input
                  id="storeLocation"
                  value={formData.storeLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, storeLocation: e.target.value }))}
                  placeholder="e.g., Office Supply Room A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batchNumber">Batch Number (Optional)</Label>
                <Input
                  id="batchNumber"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, batchNumber: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-4">Departments *</h3>
            <div className="flex flex-wrap gap-2">
              {DEPARTMENTS.map(dept => (
                <Badge
                  key={dept}
                  variant={formData.department.includes(dept) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleDepartment(dept)}
                >
                  {getCategoryLabel(dept)}
                </Badge>
              ))}
            </div>
            {formData.department.length === 0 && (
              <p className="text-sm text-destructive mt-2">Please select at least one department</p>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-4">Suppliers</h3>
            <div className="space-y-2">
              {suppliers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No suppliers available</p>
              ) : (
                suppliers.map(supplier => (
                  <div key={supplier.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`supplier-${supplier.id}`}
                      checked={formData.supplierIds.includes(supplier.id)}
                      onChange={() => toggleSupplier(supplier.id)}
                      className="rounded border-input"
                    />
                    <Label htmlFor={`supplier-${supplier.id}`} className="cursor-pointer flex-1">
                      {supplier.name}
                      {supplier.category && supplier.category.length > 0 && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({supplier.category.join(', ')})
                        </span>
                      )}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="warrantyMonths">Warranty (Months)</Label>
                <Input
                  id="warrantyMonths"
                  type="number"
                  min="0"
                  value={formData.warrantyMonths || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    warrantyMonths: e.target.value ? Number(e.target.value) : undefined 
                  }))}
                  placeholder="Leave empty if not applicable"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate ? new Date(formData.purchaseDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    purchaseDate: e.target.value ? new Date(e.target.value).getTime() : undefined 
                  }))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Additional notes about this product..."
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.isConsumable}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isConsumable: checked }))}
            />
            <Label>Consumable Item</Label>
            <span className="text-xs text-muted-foreground ml-2">
              (Items that are used up vs. assets that remain)
            </span>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {product ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
