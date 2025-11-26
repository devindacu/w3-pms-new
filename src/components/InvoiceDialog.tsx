import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Plus, Trash } from '@phosphor-icons/react'
import { type Invoice, type InvoiceItem, type InvoiceType, type InvoiceStatus, type PaymentTerms } from '@/lib/types'
import { generateNumber } from '@/lib/helpers'

interface InvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice?: Invoice
  onSave: (invoice: Invoice) => void
}

export function InvoiceDialog({ open, onOpenChange, invoice, onSave }: InvoiceDialogProps) {
  const [formData, setFormData] = useState<Partial<Invoice>>({
    invoiceNumber: '',
    type: 'room-charge',
    issueDate: Date.now(),
    dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    amountPaid: 0,
    balance: 0,
    status: 'draft',
    paymentTerms: 'net-7'
  })

  const [items, setItems] = useState<Partial<InvoiceItem>[]>([])

  useEffect(() => {
    if (invoice) {
      setFormData(invoice)
      setItems(invoice.items)
    } else {
      const newInvoiceNumber = generateNumber('INV')
      setFormData({
        invoiceNumber: newInvoiceNumber,
        type: 'room-charge',
        issueDate: Date.now(),
        dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
        items: [],
        subtotal: 0,
        tax: 0,
        discount: 0,
        total: 0,
        amountPaid: 0,
        balance: 0,
        status: 'draft',
        paymentTerms: 'net-7'
      })
      setItems([])
    }
  }, [invoice, open])

  useEffect(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0)
    const tax = subtotal * 0.1
    const total = subtotal + tax - (formData.discount || 0)
    const balance = total - (formData.amountPaid || 0)

    setFormData(prev => ({
      ...prev,
      subtotal,
      tax,
      total,
      balance
    }))
  }, [items, formData.discount, formData.amountPaid])

  const handleAddItem = () => {
    setItems([...items, { id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0, total: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? value : (newItems[index].quantity || 0)
      const unitPrice = field === 'unitPrice' ? value : (newItems[index].unitPrice || 0)
      newItems[index].total = quantity * unitPrice
    }
    
    setItems(newItems)
  }

  const handleSubmit = () => {
    if (!formData.invoiceNumber) {
      toast.error('Invoice number is required')
      return
    }

    if (items.length === 0) {
      toast.error('At least one item is required')
      return
    }

    const completeItems: InvoiceItem[] = items.map(item => ({
      id: item.id || `item-${Date.now()}`,
      description: item.description || '',
      quantity: item.quantity || 0,
      unitPrice: item.unitPrice || 0,
      total: item.total || 0,
      department: item.department
    }))

    const newInvoice: Invoice = {
      id: invoice?.id || `inv-${Date.now()}`,
      invoiceNumber: formData.invoiceNumber!,
      type: formData.type as InvoiceType,
      guestId: formData.guestId,
      reservationId: formData.reservationId,
      supplierId: formData.supplierId,
      issueDate: formData.issueDate!,
      dueDate: formData.dueDate!,
      items: completeItems,
      subtotal: formData.subtotal!,
      tax: formData.tax!,
      discount: formData.discount || 0,
      total: formData.total!,
      amountPaid: formData.amountPaid || 0,
      balance: formData.balance!,
      status: formData.status as InvoiceStatus,
      paymentTerms: formData.paymentTerms as PaymentTerms,
      notes: formData.notes,
      createdAt: invoice?.createdAt || Date.now(),
      createdBy: invoice?.createdBy || 'admin',
      paidAt: formData.paidAt
    }

    onSave(newInvoice)
    toast.success(invoice ? 'Invoice updated successfully' : 'Invoice created successfully')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{invoice ? 'Edit Invoice' : 'Create New Invoice'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Invoice Number</Label>
              <Input
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                placeholder="INV-001"
              />
            </div>

            <div>
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as InvoiceType })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="room-charge">Room Charge</SelectItem>
                  <SelectItem value="fnb">F&B</SelectItem>
                  <SelectItem value="amenities">Amenities</SelectItem>
                  <SelectItem value="laundry">Laundry</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Issue Date</Label>
              <Input
                type="date"
                value={new Date(formData.issueDate!).toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, issueDate: new Date(e.target.value).getTime() })}
              />
            </div>

            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={new Date(formData.dueDate!).toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, dueDate: new Date(e.target.value).getTime() })}
              />
            </div>

            <div>
              <Label>Payment Terms</Label>
              <Select value={formData.paymentTerms} onValueChange={(value) => setFormData({ ...formData, paymentTerms: value as PaymentTerms })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="net-7">Net 7 Days</SelectItem>
                  <SelectItem value="net-15">Net 15 Days</SelectItem>
                  <SelectItem value="net-30">Net 30 Days</SelectItem>
                  <SelectItem value="net-60">Net 60 Days</SelectItem>
                  <SelectItem value="net-90">Net 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as InvoiceStatus })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partially-paid">Partially Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Invoice Items</Label>
              <Button type="button" size="sm" onClick={handleAddItem}>
                <Plus size={16} className="mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-5">
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Item description"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Unit Price</Label>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Total</Label>
                      <Input value={item.total?.toFixed(2)} readOnly className="bg-muted" />
                    </div>
                    <div className="col-span-1 flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        className="text-destructive"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">${formData.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (10%):</span>
              <span className="font-medium">${formData.tax?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Discount:</span>
              <Input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
                className="w-32 text-right"
              />
            </div>
            <div className="flex justify-between text-lg font-semibold border-t pt-2">
              <span>Total:</span>
              <span>${formData.total?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount Paid:</span>
              <Input
                type="number"
                value={formData.amountPaid}
                onChange={(e) => setFormData({ ...formData, amountPaid: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
                className="w-32 text-right"
              />
            </div>
            <div className="flex justify-between text-lg font-semibold text-destructive">
              <span>Balance Due:</span>
              <span>${formData.balance?.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {invoice ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
