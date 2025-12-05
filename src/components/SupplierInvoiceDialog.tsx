import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Trash, Calendar, Upload, X } from '@phosphor-icons/react'
import { type Invoice, type InvoiceItem, type Supplier, type PurchaseOrder, type GoodsReceivedNote, InvoiceStatus } from '@/lib/types'
import { formatCurrency, formatDate, generateNumber } from '@/lib/helpers'

interface SupplierInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice?: Invoice
  suppliers: Supplier[]
  purchaseOrders: PurchaseOrder[]
  grns: GoodsReceivedNote[]
  onSave: (invoice: Invoice) => void
  onDelete?: (id: string) => void
  currentUser: { id: string; username: string }
}

export function SupplierInvoiceDialog({
  open,
  onOpenChange,
  invoice,
  suppliers,
  purchaseOrders,
  grns,
  onSave,
  onDelete,
  currentUser
}: SupplierInvoiceDialogProps) {
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [purchaseOrderId, setPurchaseOrderId] = useState('')
  const [grnId, setGRNId] = useState('')
  const [invoiceDate, setInvoiceDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState<InvoiceStatus>('pending-validation')
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [notes, setNotes] = useState('')
  const [scannedImage, setScannedImage] = useState<string | undefined>()

  useEffect(() => {
    if (invoice) {
      setInvoiceNumber(invoice.invoiceNumber)
      setSupplierId(invoice.supplierId)
      setPurchaseOrderId(invoice.purchaseOrderId || '')
      setGRNId(invoice.grnId || '')
      setInvoiceDate(new Date(invoice.invoiceDate).toISOString().split('T')[0])
      setDueDate(invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '')
      setStatus(invoice.status)
      setItems(invoice.items)
      setNotes(invoice.notes || '')
      setScannedImage(invoice.scannedImageUrl)
    } else {
      resetForm()
    }
  }, [invoice, open])

  const resetForm = () => {
    setInvoiceNumber(generateNumber('INV'))
    setSupplierId('')
    setPurchaseOrderId('')
    setGRNId('')
    setInvoiceDate(new Date().toISOString().split('T')[0])
    setDueDate('')
    setStatus('pending-validation')
    setItems([])
    setNotes('')
    setScannedImage(undefined)
  }

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      itemName: '',
      description: '',
      quantity: 0,
      unit: 'pcs',
      unitPrice: 0,
      total: 0
    }
    setItems([...items, newItem])
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? value : updatedItems[index].quantity
      const unitPrice = field === 'unitPrice' ? value : updatedItems[index].unitPrice
      updatedItems[index].total = quantity * unitPrice
    }
    
    setItems(updatedItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.08
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const loadFromPO = () => {
    if (!purchaseOrderId) return

    const po = purchaseOrders.find(p => p.id === purchaseOrderId)
    if (!po) return

    setSupplierId(po.supplierId)
    setItems(po.items.map(item => ({
      id: `item-${Date.now()}-${Math.random()}`,
      itemName: item.name,
      description: '',
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      total: item.total,
      poItemId: item.id
    })))
    toast.success('Items loaded from Purchase Order')
  }

  const loadFromGRN = () => {
    if (!grnId) return

    const grn = grns.find(g => g.id === grnId)
    if (!grn) return

    setSupplierId(grn.supplierId)
    if (grn.purchaseOrderId) {
      setPurchaseOrderId(grn.purchaseOrderId)
      const po = purchaseOrders.find(p => p.id === grn.purchaseOrderId)
      if (po) {
        setItems(grn.items.map(grnItem => {
          const poItem = po.items.find(p => p.inventoryItemId === grnItem.inventoryItemId)
          return {
            id: `item-${Date.now()}-${Math.random()}`,
            itemName: poItem?.name || grnItem.inventoryItemId,
            description: '',
            quantity: grnItem.receivedQuantity,
            unit: poItem?.unit || 'pcs',
            unitPrice: grnItem.unitPrice || poItem?.unitPrice || 0,
            total: grnItem.receivedQuantity * (grnItem.unitPrice || poItem?.unitPrice || 0),
            grnItemId: grnItem.id,
            poItemId: poItem?.id
          }
        }))
      }
    }
    toast.success('Items loaded from GRN')
  }

  const handleSave = () => {
    if (!invoiceNumber.trim()) {
      toast.error('Invoice number is required')
      return
    }

    if (!supplierId) {
      toast.error('Please select a supplier')
      return
    }

    if (!invoiceDate) {
      toast.error('Invoice date is required')
      return
    }

    if (items.length === 0) {
      toast.error('Please add at least one item')
      return
    }

    if (items.some(item => !item.itemName.trim() || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast.error('All items must have valid name, quantity, and price')
      return
    }

    const supplier = suppliers.find(s => s.id === supplierId)
    const invoiceData: Invoice = {
      id: invoice?.id || `inv-${Date.now()}`,
      invoiceNumber,
      supplierId,
      supplierName: supplier?.name,
      purchaseOrderId: purchaseOrderId || undefined,
      grnId: grnId || undefined,
      invoiceDate: new Date(invoiceDate).getTime(),
      dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
      status,
      items,
      scannedImageUrl: scannedImage,
      notes,
      createdAt: invoice?.createdAt || Date.now(),
      updatedAt: Date.now()
    }

    onSave(invoiceData)
    onOpenChange(false)
    toast.success(invoice ? 'Invoice updated successfully' : 'Invoice created successfully')
  }

  const handleDelete = () => {
    if (!invoice || !onDelete) return

    if (confirm('Are you sure you want to delete this invoice?')) {
      onDelete(invoice.id)
      onOpenChange(false)
      toast.success('Invoice deleted successfully')
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setScannedImage(reader.result as string)
        toast.success('Image uploaded successfully')
      }
      reader.readAsDataURL(file)
    }
  }

  const selectedSupplier = suppliers.find(s => s.id === supplierId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {invoice ? 'Edit Supplier Invoice' : 'Create Supplier Invoice'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice-number">Invoice Number *</Label>
              <Input
                id="invoice-number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as InvoiceStatus)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending-validation">Pending Validation</SelectItem>
                  <SelectItem value="validated">Validated</SelectItem>
                  <SelectItem value="matched">Matched</SelectItem>
                  <SelectItem value="mismatch">Mismatch</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="posted">Posted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier *</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Select supplier" />
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

            <div className="space-y-2">
              <Label htmlFor="invoice-date">Invoice Date *</Label>
              <Input
                id="invoice-date"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase-order">Purchase Order (Optional)</Label>
              <div className="flex gap-2">
                <Select value={purchaseOrderId} onValueChange={setPurchaseOrderId}>
                  <SelectTrigger id="purchase-order">
                    <SelectValue placeholder="Select PO" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {purchaseOrders
                      .filter(po => !supplierId || po.supplierId === supplierId)
                      .map((po) => (
                        <SelectItem key={po.id} value={po.id}>
                          {po.poNumber} - {formatCurrency(po.total)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {purchaseOrderId && (
                  <Button type="button" size="sm" onClick={loadFromPO}>
                    Load Items
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grn">GRN (Optional)</Label>
              <div className="flex gap-2">
                <Select value={grnId} onValueChange={setGRNId}>
                  <SelectTrigger id="grn">
                    <SelectValue placeholder="Select GRN" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {grns
                      .filter(grn => !supplierId || grn.supplierId === supplierId)
                      .map((grn) => (
                        <SelectItem key={grn.id} value={grn.id}>
                          {grn.grnNumber}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {grnId && (
                  <Button type="button" size="sm" onClick={loadFromGRN}>
                    Load Items
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scanned-image">Scanned Invoice</Label>
              <div className="flex gap-2">
                <Input
                  id="scanned-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="flex-1"
                />
                {scannedImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setScannedImage(undefined)}
                  >
                    <X size={18} />
                  </Button>
                )}
              </div>
              {scannedImage && (
                <img src={scannedImage} alt="Scanned invoice" className="mt-2 max-h-32 rounded border" />
              )}
            </div>
          </div>

          {selectedSupplier && (
            <Card className="p-4 bg-muted/50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Contact:</span> {selectedSupplier.phone}
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span> {selectedSupplier.email || 'N/A'}
                </div>
                <div>
                  <span className="text-muted-foreground">Payment Terms:</span> {selectedSupplier.paymentTerms}
                </div>
                <div>
                  <span className="text-muted-foreground">Credit Limit:</span>{' '}
                  {selectedSupplier.creditLimit ? formatCurrency(selectedSupplier.creditLimit) : 'N/A'}
                </div>
              </div>
            </Card>
          )}

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Invoice Items</h3>
              <Button type="button" size="sm" onClick={addItem}>
                <Plus size={16} className="mr-1" />
                Add Item
              </Button>
            </div>

            {items.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                No items added. Click "Add Item" to get started.
              </Card>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <Card key={item.id} className="p-4">
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-3">
                        <Label className="text-xs">Item Name *</Label>
                        <Input
                          value={item.itemName}
                          onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                          placeholder="Item name"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={item.description || ''}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Description"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Quantity *</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="col-span-1">
                        <Label className="text-xs">Unit</Label>
                        <Input
                          value={item.unit}
                          onChange={(e) => updateItem(index, 'unit', e.target.value)}
                          placeholder="pcs"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Unit Price *</Label>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="col-span-1">
                        <Label className="text-xs">Total</Label>
                        <div className="text-sm font-semibold pt-2">
                          {formatCurrency(item.total)}
                        </div>
                      </div>
                      <div className="col-span-1 flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Card className="p-4 bg-muted/30">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-semibold">{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (8%):</span>
                <span className="font-semibold">{formatCurrency(calculateTax())}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-primary">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or comments..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          {invoice && onDelete && (
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete Invoice
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            {invoice ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
