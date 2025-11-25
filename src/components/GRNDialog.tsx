import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Package } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { 
  type GoodsReceivedNote,
  type GRNItem,
  type PurchaseOrder,
  type Supplier,
  type SystemUser,
  type InventoryItem,
  type FoodItem,
  type Amenity,
  type ConstructionMaterial,
  type GeneralProduct
} from '@/lib/types'
import { generateId, generateNumber, formatCurrency, formatDate } from '@/lib/helpers'

interface GRNDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  grn?: GoodsReceivedNote
  grns: GoodsReceivedNote[]
  setGRNs: (grns: GoodsReceivedNote[]) => void
  purchaseOrders: PurchaseOrder[]
  setPurchaseOrders: (pos: PurchaseOrder[]) => void
  suppliers: Supplier[]
  currentUser: SystemUser
  inventory: InventoryItem[]
  foodItems: FoodItem[]
  amenities: Amenity[]
  constructionMaterials: ConstructionMaterial[]
  generalProducts: GeneralProduct[]
}

export function GRNDialog({
  open,
  onOpenChange,
  grn,
  grns,
  setGRNs,
  purchaseOrders,
  setPurchaseOrders,
  suppliers,
  currentUser,
  inventory,
  foodItems,
  amenities,
  constructionMaterials,
  generalProducts
}: GRNDialogProps) {
  const [purchaseOrderId, setPurchaseOrderId] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [invoiceAmount, setInvoiceAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<GRNItem[]>([])

  const isViewMode = !!grn

  const confirmedPOs = purchaseOrders.filter(po => po.status === 'confirmed')

  useEffect(() => {
    if (grn) {
      setPurchaseOrderId(grn.purchaseOrderId)
      setInvoiceNumber(grn.invoiceNumber || '')
      setInvoiceAmount(grn.invoiceAmount?.toString() || '')
      setNotes(grn.notes || '')
      setItems(grn.items)
    } else {
      setPurchaseOrderId('')
      setInvoiceNumber('')
      setInvoiceAmount('')
      setNotes('')
      setItems([])
    }
  }, [grn])

  const handlePOChange = (poId: string) => {
    setPurchaseOrderId(poId)
    
    if (poId) {
      const po = purchaseOrders.find(p => p.id === poId)
      if (po) {
        const grnItems: GRNItem[] = po.items.map(item => ({
          id: generateId(),
          inventoryItemId: item.inventoryItemId,
          orderedQuantity: item.quantity,
          receivedQuantity: item.quantity,
          damagedQuantity: 0
        }))
        setItems(grnItems)
        setInvoiceAmount(po.total.toString())
      }
    }
  }

  const handleUpdateReceived = (itemId: string, received: string) => {
    const quantity = parseFloat(received)
    if (isNaN(quantity)) return

    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, receivedQuantity: quantity }
        : item
    ))
  }

  const handleUpdateDamaged = (itemId: string, damaged: string) => {
    const quantity = parseFloat(damaged)
    if (isNaN(quantity)) return

    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, damagedQuantity: quantity }
        : item
    ))
  }

  const handleUpdateBatch = (itemId: string, batch: string) => {
    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, batchNumber: batch }
        : item
    ))
  }

  const handleUpdateExpiry = (itemId: string, expiry: string) => {
    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, expiryDate: expiry ? new Date(expiry).getTime() : undefined }
        : item
    ))
  }

  const handleSave = () => {
    if (!purchaseOrderId) {
      toast.error('Please select a purchase order')
      return
    }

    if (items.length === 0) {
      toast.error('No items to receive')
      return
    }

    const now = Date.now()
    const po = purchaseOrders.find(p => p.id === purchaseOrderId)
    
    if (!po) {
      toast.error('Purchase order not found')
      return
    }

    if (grn) {
      const updated = grns.map(g =>
        g.id === grn.id
          ? {
              ...g,
              invoiceNumber: invoiceNumber || undefined,
              invoiceAmount: invoiceAmount ? parseFloat(invoiceAmount) : undefined,
              notes,
              items
            }
          : g
      )
      setGRNs(updated)
      toast.success('GRN updated')
    } else {
      const newGRN: GoodsReceivedNote = {
        id: generateId(),
        grnNumber: generateNumber('GRN'),
        purchaseOrderId,
        supplierId: po.supplierId,
        items,
        receivedAt: now,
        receivedBy: currentUser.username,
        notes,
        invoiceNumber: invoiceNumber || undefined,
        invoiceAmount: invoiceAmount ? parseFloat(invoiceAmount) : undefined
      }
      setGRNs([newGRN, ...grns])

      const updatedPOs = purchaseOrders.map(p =>
        p.id === purchaseOrderId
          ? { ...p, status: 'delivered' as const }
          : p
      )
      setPurchaseOrders(updatedPOs)

      toast.success('GRN created and stock updated')
    }

    onOpenChange(false)
  }

  const selectedPO = purchaseOrders.find(po => po.id === purchaseOrderId)
  const supplier = selectedPO ? suppliers.find(s => s.id === selectedPO.supplierId) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {grn 
              ? `Goods Received Note ${grn.grnNumber}` 
              : 'New Goods Received Note'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Purchase Order *</Label>
              <Select 
                value={purchaseOrderId} 
                onValueChange={handlePOChange}
                disabled={isViewMode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select purchase order" />
                </SelectTrigger>
                <SelectContent>
                  {confirmedPOs.map(po => {
                    const sup = suppliers.find(s => s.id === po.supplierId)
                    return (
                      <SelectItem key={po.id} value={po.id}>
                        {po.poNumber} - {sup?.name} - {formatCurrency(po.total)}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {supplier && (
              <div>
                <Label>Supplier</Label>
                <Input value={supplier.name} disabled />
              </div>
            )}

            <div>
              <Label>Invoice Number</Label>
              <Input
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-12345"
                disabled={isViewMode}
              />
            </div>

            <div>
              <Label>Invoice Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(e.target.value)}
                placeholder="0.00"
                disabled={isViewMode}
              />
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any delivery notes or observations"
              disabled={isViewMode}
              rows={2}
            />
          </div>

          <Separator />

          <div>
            <Label className="text-base font-semibold">Items Received</Label>

            <div className="space-y-2 mt-4">
              {items.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Select a purchase order to see items
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-12 gap-3 px-3 text-xs font-medium text-muted-foreground">
                    <div className="col-span-2">Item ID</div>
                    <div className="col-span-2 text-right">Ordered</div>
                    <div className="col-span-2 text-right">Received</div>
                    <div className="col-span-2 text-right">Damaged</div>
                    <div className="col-span-2">Batch No.</div>
                    <div className="col-span-2">Expiry Date</div>
                  </div>
                  {items.map((item, index) => {
                    const poItem = selectedPO?.items[index]
                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-12 gap-3 items-center p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="col-span-2">
                          <p className="text-xs font-mono">
                            {item.inventoryItemId.slice(-8)}
                          </p>
                          {poItem && (
                            <p className="text-xs text-muted-foreground">{poItem.name}</p>
                          )}
                        </div>
                        <div className="col-span-2 text-right">
                          <p className="text-sm font-medium">{item.orderedQuantity}</p>
                        </div>
                        <div className="col-span-2">
                          {isViewMode ? (
                            <p className="text-sm text-right font-medium">{item.receivedQuantity}</p>
                          ) : (
                            <Input
                              type="number"
                              value={item.receivedQuantity}
                              onChange={(e) => handleUpdateReceived(item.id, e.target.value)}
                              className="text-right"
                            />
                          )}
                        </div>
                        <div className="col-span-2">
                          {isViewMode ? (
                            <p className="text-sm text-right text-destructive font-medium">
                              {item.damagedQuantity}
                            </p>
                          ) : (
                            <Input
                              type="number"
                              value={item.damagedQuantity}
                              onChange={(e) => handleUpdateDamaged(item.id, e.target.value)}
                              className="text-right"
                            />
                          )}
                        </div>
                        <div className="col-span-2">
                          {isViewMode ? (
                            <p className="text-sm">{item.batchNumber || '-'}</p>
                          ) : (
                            <Input
                              value={item.batchNumber || ''}
                              onChange={(e) => handleUpdateBatch(item.id, e.target.value)}
                              placeholder="Optional"
                            />
                          )}
                        </div>
                        <div className="col-span-2">
                          {isViewMode ? (
                            <p className="text-sm">
                              {item.expiryDate ? formatDate(item.expiryDate) : '-'}
                            </p>
                          ) : (
                            <Input
                              type="date"
                              value={item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : ''}
                              onChange={(e) => handleUpdateExpiry(item.id, e.target.value)}
                            />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </div>

            {items.length > 0 && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Items</p>
                    <p className="font-semibold text-lg">{items.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Received</p>
                    <p className="font-semibold text-lg">
                      {items.reduce((sum, item) => sum + item.receivedQuantity, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Damaged</p>
                    <p className="font-semibold text-lg text-destructive">
                      {items.reduce((sum, item) => sum + item.damagedQuantity, 0)}
                    </p>
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
              <Button onClick={handleSave}>
                <Package size={18} className="mr-2" />
                Create GRN
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
