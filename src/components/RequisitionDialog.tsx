import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash, CheckCircle, XCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { 
  type Requisition, 
  type RequisitionItem,
  type Department,
  type SystemUser,
  type InventoryItem,
  type FoodItem,
  type Amenity,
  type ConstructionMaterial,
  type GeneralProduct,
  type Supplier
} from '@/lib/types'
import { generateId, generateNumber, formatCurrency } from '@/lib/helpers'

interface RequisitionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requisition?: Requisition
  requisitions: Requisition[]
  setRequisitions: (requisitions: Requisition[]) => void
  currentUser: SystemUser
  inventory: InventoryItem[]
  foodItems: FoodItem[]
  amenities: Amenity[]
  constructionMaterials: ConstructionMaterial[]
  generalProducts: GeneralProduct[]
  suppliers: Supplier[]
}

export function RequisitionDialog({
  open,
  onOpenChange,
  requisition,
  requisitions,
  setRequisitions,
  currentUser,
  inventory,
  foodItems,
  amenities,
  constructionMaterials,
  generalProducts,
  suppliers
}: RequisitionDialogProps) {
  const [department, setDepartment] = useState<Department>('front-office')
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<RequisitionItem[]>([])
  const [newItemName, setNewItemName] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState('')
  const [newItemUnit, setNewItemUnit] = useState('')
  const [newItemUnitPrice, setNewItemUnitPrice] = useState('')
  const [newItemSupplierId, setNewItemSupplierId] = useState('')

  const isViewMode = !!requisition && requisition.status !== 'draft'
  const canApprove = currentUser.role === 'admin' || currentUser.role === 'procurement-manager' || currentUser.role === 'department-head'

  useEffect(() => {
    if (requisition) {
      setDepartment(requisition.department)
      setPriority(requisition.priority)
      setNotes(requisition.notes || '')
      setItems(requisition.items)
    } else {
      setDepartment(currentUser.department || 'front-office')
      setPriority('normal')
      setNotes('')
      setItems([])
    }
  }, [requisition, currentUser])

  const handleAddItem = () => {
    if (!newItemName || !newItemQuantity || !newItemUnit || !newItemUnitPrice) {
      toast.error('Please fill in all item details')
      return
    }

    const quantity = parseFloat(newItemQuantity)
    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    const unitPrice = parseFloat(newItemUnitPrice)
    if (isNaN(unitPrice) || unitPrice < 0) {
      toast.error('Please enter a valid unit price')
      return
    }

    const newItem: RequisitionItem = {
      id: generateId(),
      inventoryItemId: generateId(),
      name: newItemName,
      quantity,
      unit: newItemUnit,
      unitPrice,
      estimatedCost: quantity * unitPrice,
      supplierId: newItemSupplierId || undefined
    }

    setItems([...items, newItem])
    setNewItemName('')
    setNewItemQuantity('')
    setNewItemUnit('')
    setNewItemUnitPrice('')
    setNewItemSupplierId('')
    toast.success('Item added')
  }

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId))
    toast.success('Item removed')
  }

  const handleSave = (status: 'draft' | 'pending-approval' = 'draft') => {
    if (items.length === 0) {
      toast.error('Please add at least one item')
      return
    }

    const now = Date.now()
    
    if (requisition) {
      const updated = requisitions.map(r =>
        r.id === requisition.id
          ? {
              ...r,
              department,
              priority,
              notes,
              items,
              status
            }
          : r
      )
      setRequisitions(updated)
      toast.success('Requisition updated')
    } else {
      const newRequisition: Requisition = {
        id: generateId(),
        requisitionNumber: generateNumber('REQ'),
        department,
        requestedBy: currentUser.username,
        items,
        status,
        priority,
        notes,
        createdAt: now
      }
      setRequisitions([newRequisition, ...requisitions])
      toast.success('Requisition created')
    }

    onOpenChange(false)
  }

  const handleApprove = () => {
    if (!requisition) return

    const updated = requisitions.map(r =>
      r.id === requisition.id
        ? {
            ...r,
            status: 'approved' as const,
            approvedBy: currentUser.username,
            approvedAt: Date.now()
          }
        : r
    )
    setRequisitions(updated)
    toast.success('Requisition approved')
    onOpenChange(false)
  }

  const handleReject = () => {
    if (!requisition) return

    const updated = requisitions.map(r =>
      r.id === requisition.id
        ? { ...r, status: 'rejected' as const }
        : r
    )
    setRequisitions(updated)
    toast.success('Requisition rejected')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {requisition 
              ? `Requisition ${requisition.requisitionNumber}` 
              : 'New Requisition'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Department</Label>
              <Select 
                value={department} 
                onValueChange={(value) => setDepartment(value as Department)}
                disabled={isViewMode}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="front-office">Front Office</SelectItem>
                  <SelectItem value="housekeeping">Housekeeping</SelectItem>
                  <SelectItem value="fnb">F&B</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority</Label>
              <Select 
                value={priority} 
                onValueChange={(value) => setPriority(value as any)}
                disabled={isViewMode}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special instructions or notes"
              disabled={isViewMode}
              rows={3}
            />
          </div>

          <Separator />

          <div>
            <Label className="text-base font-semibold">Items</Label>
            
            {!isViewMode && (
              <div className="space-y-3 mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-6">
                    <Label className="text-xs">Item Name</Label>
                    <Input
                      placeholder="Item name"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={newItemQuantity}
                      onChange={(e) => setNewItemQuantity(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Unit</Label>
                    <Input
                      placeholder="Unit"
                      value={newItemUnit}
                      onChange={(e) => setNewItemUnit(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Unit Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newItemUnitPrice}
                      onChange={(e) => setNewItemUnitPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-11">
                    <Label className="text-xs">Supplier (Optional)</Label>
                    <Select value={newItemSupplierId || undefined} onValueChange={(value) => setNewItemSupplierId(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1 flex items-end">
                    <Button onClick={handleAddItem} size="icon" className="w-full">
                      <Plus size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 mt-4">
              {items.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No items added yet</p>
              ) : (
                <>
                  <div className="grid grid-cols-12 gap-3 px-3 py-2 text-xs font-medium text-muted-foreground">
                    <div className="col-span-4">Item</div>
                    <div className="col-span-2 text-right">Quantity</div>
                    <div className="col-span-2 text-right">Unit Price</div>
                    <div className="col-span-2 text-right">Total</div>
                    <div className="col-span-2">Supplier</div>
                  </div>
                  {items.map((item) => {
                    const supplier = item.supplierId ? suppliers.find(s => s.id === item.supplierId) : null
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex-1 grid grid-cols-12 gap-3 items-center">
                          <div className="col-span-4">
                            <p className="font-medium">{item.name}</p>
                          </div>
                          <div className="col-span-2 text-right text-sm text-muted-foreground">
                            {item.quantity} {item.unit}
                          </div>
                          <div className="col-span-2 text-right text-sm text-muted-foreground">
                            {formatCurrency(item.unitPrice)}
                          </div>
                          <div className="col-span-2 text-right text-sm font-medium">
                            {formatCurrency(item.estimatedCost)}
                          </div>
                          <div className="col-span-2 text-sm text-muted-foreground">
                            {supplier ? supplier.name : '-'}
                          </div>
                        </div>
                        {!isViewMode && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash size={16} className="text-destructive" />
                          </Button>
                        )}
                      </div>
                    )
                  })}
                  <div className="flex justify-end pt-3 border-t">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Estimated Cost</p>
                      <p className="text-xl font-semibold">
                        {formatCurrency(items.reduce((sum, item) => sum + item.estimatedCost, 0))}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {requisition && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Requested By</p>
                  <p className="font-medium">{requisition.requestedBy}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className="capitalize">{requisition.status.replace('-', ' ')}</Badge>
                </div>
                {requisition.approvedBy && (
                  <>
                    <div>
                      <p className="text-muted-foreground">Approved By</p>
                      <p className="font-medium">{requisition.approvedBy}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Approved At</p>
                      <p className="font-medium">
                        {requisition.approvedAt 
                          ? new Date(requisition.approvedAt).toLocaleString() 
                          : 'N/A'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {isViewMode ? (
            <>
              {requisition?.status === 'pending-approval' && canApprove && (
                <>
                  <Button variant="outline" onClick={handleReject}>
                    <XCircle size={18} className="mr-2" />
                    Reject
                  </Button>
                  <Button onClick={handleApprove}>
                    <CheckCircle size={18} className="mr-2" />
                    Approve
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="secondary" onClick={() => handleSave('draft')}>
                Save as Draft
              </Button>
              <Button onClick={() => handleSave('pending-approval')}>
                Submit for Approval
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
