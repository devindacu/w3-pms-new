import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash, PaperPlaneRight } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { 
  type PurchaseOrder,
  type PurchaseOrderItem,
  type PurchaseOrderStatus,
  type Supplier,
  type Requisition,
  type SystemUser,
  type InventoryItem,
  type FoodItem,
  type Amenity,
  type ConstructionMaterial,
  type GeneralProduct
} from '@/lib/types'
import { generateId, generateNumber, formatCurrency } from '@/lib/helpers'

interface PurchaseOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  purchaseOrder?: PurchaseOrder
  purchaseOrders: PurchaseOrder[]
  setPurchaseOrders: (pos: PurchaseOrder[]) => void
  suppliers: Supplier[]
  requisitions: Requisition[]
  currentUser: SystemUser
  inventory: InventoryItem[]
  foodItems: FoodItem[]
  amenities: Amenity[]
  constructionMaterials: ConstructionMaterial[]
  generalProducts: GeneralProduct[]
}

export function PurchaseOrderDialog({
  open,
  onOpenChange,
  purchaseOrder,
  purchaseOrders,
  setPurchaseOrders,
  suppliers,
  requisitions,
  currentUser,
  inventory,
  foodItems,
  amenities,
  constructionMaterials,
  generalProducts
}: PurchaseOrderDialogProps) {
  const [supplierId, setSupplierId] = useState('')
  const [requisitionId, setRequisitionId] = useState('')
  const [expectedDelivery, setExpectedDelivery] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<PurchaseOrderItem[]>([])
  const [status, setStatus] = useState<PurchaseOrderStatus>('draft')
  
  const [newItemName, setNewItemName] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState('')
  const [newItemUnit, setNewItemUnit] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')

  const isViewMode = !!purchaseOrder && purchaseOrder.status !== 'draft'

  useEffect(() => {
    if (purchaseOrder) {
      setSupplierId(purchaseOrder.supplierId)
      setRequisitionId(purchaseOrder.requisitionId || '')
      setExpectedDelivery(purchaseOrder.expectedDelivery ? new Date(purchaseOrder.expectedDelivery).toISOString().split('T')[0] : '')
      setNotes(purchaseOrder.notes || '')
      setItems(purchaseOrder.items)
      setStatus(purchaseOrder.status)
    } else {
      setSupplierId('')
      setRequisitionId('')
      setExpectedDelivery('')
      setNotes('')
      setItems([])
      setStatus('draft')
    }
  }, [purchaseOrder])

  const handleRequisitionChange = (reqId: string) => {
    const actualReqId = reqId === "none" ? "" : reqId
    setRequisitionId(actualReqId)
    
    if (actualReqId) {
      const req = requisitions.find(r => r.id === actualReqId)
      if (req) {
        const reqItems: PurchaseOrderItem[] = req.items.map(item => ({
          id: generateId(),
          inventoryItemId: item.inventoryItemId,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.estimatedCost || 0,
          total: item.quantity * (item.estimatedCost || 0)
        }))
        setItems(reqItems)
      }
    }
  }

  const handleAddItem = () => {
    if (!newItemName || !newItemQuantity || !newItemUnit || !newItemPrice) {
      toast.error('Please fill in all item details')
      return
    }

    const quantity = parseFloat(newItemQuantity)
    const unitPrice = parseFloat(newItemPrice)

    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    if (isNaN(unitPrice) || unitPrice < 0) {
      toast.error('Please enter a valid price')
      return
    }

    const newItem: PurchaseOrderItem = {
      id: generateId(),
      inventoryItemId: generateId(),
      name: newItemName,
      quantity,
      unit: newItemUnit,
      unitPrice,
      total: quantity * unitPrice
    }

    setItems([...items, newItem])
    setNewItemName('')
    setNewItemQuantity('')
    setNewItemUnit('')
    setNewItemPrice('')
    toast.success('Item added')
  }

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId))
    toast.success('Item removed')
  }

  const handleUpdateItemPrice = (itemId: string, newPrice: string) => {
    const price = parseFloat(newPrice)
    if (isNaN(price)) return

    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, unitPrice: price, total: item.quantity * price }
        : item
    ))
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * 0.1
    const total = subtotal + tax
    return { subtotal, tax, total }
  }

  const { subtotal, tax, total } = calculateTotals()

  const handleSave = (newStatus: PurchaseOrderStatus = 'draft') => {
    if (!supplierId) {
      toast.error('Please select a supplier')
      return
    }

    if (items.length === 0) {
      toast.error('Please add at least one item')
      return
    }

    const now = Date.now()
    const { subtotal, tax, total } = calculateTotals()
    
    if (purchaseOrder) {
      const updated = purchaseOrders.map(po =>
        po.id === purchaseOrder.id
          ? {
              ...po,
              supplierId,
              requisitionId: requisitionId || undefined,
              items,
              subtotal,
              tax,
              total,
              status: newStatus,
              expectedDelivery: expectedDelivery ? new Date(expectedDelivery).getTime() : undefined,
              notes
            }
          : po
      )
      setPurchaseOrders(updated)
      toast.success('Purchase order updated')
    } else {
      const newPO: PurchaseOrder = {
        id: generateId(),
        poNumber: generateNumber('PO'),
        supplierId,
        requisitionId: requisitionId || undefined,
        items,
        subtotal,
        tax,
        total,
        status: newStatus,
        expectedDelivery: expectedDelivery ? new Date(expectedDelivery).getTime() : undefined,
        notes,
        createdAt: now,
        createdBy: currentUser.username,
        revisionNumber: 1,
        watermark: newStatus === 'draft' ? 'DRAFT' : newStatus === 'approved' ? 'APPROVED' : 'ORDERED',
        qrCode: `QR-${generateNumber('PO')}`
      }
      setPurchaseOrders([newPO, ...purchaseOrders])
      toast.success('Purchase order created')
    }

    onOpenChange(false)
  }

  const handleStatusChange = (newStatus: PurchaseOrderStatus) => {
    if (!purchaseOrder) return

    const updated = purchaseOrders.map(po =>
      po.id === purchaseOrder.id
        ? { ...po, status: newStatus }
        : po
    )
    setPurchaseOrders(updated)
    toast.success(`PO status updated to ${newStatus}`)
    onOpenChange(false)
  }

  const approvedRequisitions = requisitions.filter(r => r.status === 'approved')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {purchaseOrder 
              ? `Purchase Order ${purchaseOrder.poNumber}` 
              : 'New Purchase Order'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Supplier *</Label>
              <Select 
                value={supplierId} 
                onValueChange={setSupplierId}
                disabled={isViewMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>From Requisition (Optional)</Label>
              <Select 
                value={requisitionId || "none"} 
                onValueChange={handleRequisitionChange}
                disabled={isViewMode || !!purchaseOrder}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select requisition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {approvedRequisitions.map(req => (
                    <SelectItem key={req.id} value={req.id}>
                      {req.requisitionNumber} - {req.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Expected Delivery</Label>
              <Input
                type="date"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
                disabled={isViewMode}
              />
            </div>

            {purchaseOrder && (
              <div>
                <Label>Status</Label>
                <Select 
                  value={status} 
                  onValueChange={(value) => handleStatusChange(value as PurchaseOrderStatus)}
                  disabled={!purchaseOrder}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="invoiced">Invoiced</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special instructions or notes"
              disabled={isViewMode}
              rows={2}
            />
          </div>

          <Separator />

          <div>
            <Label className="text-base font-semibold">Items</Label>
            
            {!isViewMode && (
              <div className="grid grid-cols-12 gap-3 mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="col-span-4">
                  <Input
                    placeholder="Item name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    placeholder="Unit"
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Unit Price"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                  />
                </div>
                <div className="col-span-1">
                  <Button onClick={handleAddItem} size="icon" className="w-full">
                    <Plus size={18} />
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2 mt-4">
              {items.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No items added yet</p>
              ) : (
                <>
                  <div className="grid grid-cols-12 gap-3 px-3 text-xs font-medium text-muted-foreground">
                    <div className="col-span-4">Item</div>
                    <div className="col-span-2 text-right">Quantity</div>
                    <div className="col-span-2 text-right">Unit Price</div>
                    <div className="col-span-3 text-right">Total</div>
                    <div className="col-span-1"></div>
                  </div>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-3 items-center p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="col-span-4">
                        <p className="font-medium">{item.name}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="text-sm">{item.quantity} {item.unit}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        {isViewMode ? (
                          <p className="text-sm">{formatCurrency(item.unitPrice)}</p>
                        ) : (
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItemPrice(item.id, e.target.value)}
                            className="text-right"
                          />
                        )}
                      </div>
                      <div className="col-span-3 text-right">
                        <p className="font-semibold">{formatCurrency(item.total)}</p>
                      </div>
                      <div className="col-span-1">
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
                    </div>
                  ))}
                </>
              )}
            </div>

            {items.length > 0 && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="font-medium">{formatCurrency(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-lg font-bold">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          {isViewMode ? (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="secondary" onClick={() => handleSave('draft')}>
                Save as Draft
              </Button>
              <Button onClick={() => handleSave('approved')}>
                <PaperPlaneRight size={18} className="mr-2" />
                Approve & Send
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
