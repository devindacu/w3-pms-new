import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Trash } from '@phosphor-icons/react'
import { type Invoice, type InvoiceItem, type InvoiceType, type InvoiceStatus, type PaymentTerms } from '@/lib/types'
import { formatCurrency, generateId, generateNumber } from '@/lib/helpers'
import { toast } from 'sonner'

interface InvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice?: Invoice
  onSave?: (invoice: Invoice) => void
  currentUser?: { id: string; username?: string }
}

const PAYMENT_TERMS: PaymentTerms[] = ['net-7', 'net-15', 'net-30', 'net-45', 'net-60', 'net-90', 'due-on-receipt', 'prepaid']
const INVOICE_TYPES: InvoiceType[] = ['standard', 'credit-note', 'debit-note', 'proforma', 'recurring']

function createEmptyItem(): InvoiceItem {
  return {
    id: generateId(),
    itemName: '',
    name: '',
    description: '',
    quantity: 1,
    unit: 'unit',
    unitPrice: 0,
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    total: 0,
    inventoryItemId: '',
  }
}

export function InvoiceDialog({ open, onOpenChange, invoice, onSave, currentUser }: InvoiceDialogProps) {
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [type, setType] = useState<InvoiceType>('standard')
  const [status, setStatus] = useState<InvoiceStatus>('draft')
  const [invoiceDate, setInvoiceDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('net-30')
  const [taxRate, setTaxRate] = useState(0)
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<InvoiceItem[]>([createEmptyItem()])

  const isEditing = !!invoice

  useEffect(() => {
    if (open) {
      if (invoice) {
        setInvoiceNumber(invoice.invoiceNumber)
        setSupplierName(invoice.supplierName || '')
        setType(invoice.type)
        setStatus(invoice.status)
        setInvoiceDate(invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split('T')[0] : '')
        setDueDate(invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '')
        setPaymentTerms(invoice.paymentTerms)
        setTaxRate(invoice.taxRate || 0)
        setNotes(invoice.notes || '')
        setItems(invoice.items?.length ? invoice.items : [createEmptyItem()])
      } else {
        const today = new Date().toISOString().split('T')[0]
        const due = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        setInvoiceNumber(generateNumber('INV'))
        setSupplierName('')
        setType('standard')
        setStatus('draft')
        setInvoiceDate(today)
        setDueDate(due)
        setPaymentTerms('net-30')
        setTaxRate(0)
        setNotes('')
        setItems([createEmptyItem()])
      }
    }
  }, [open, invoice])

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setItems(prev => {
      const updated = [...prev]
      const item = { ...updated[index], [field]: value }
      if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate') {
        const qty = field === 'quantity' ? Number(value) : item.quantity
        const price = field === 'unitPrice' ? Number(value) : item.unitPrice
        const tax = field === 'taxRate' ? Number(value) : item.taxRate
        item.subtotal = qty * price
        item.taxAmount = item.subtotal * (tax / 100)
        item.total = item.subtotal + item.taxAmount
      }
      if (field === 'itemName') {
        item.name = String(value)
      }
      updated[index] = item
      return updated
    })
  }

  const addItem = () => setItems(prev => [...prev, createEmptyItem()])
  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index))

  const subtotal = items.reduce((s, i) => s + i.subtotal, 0)
  const taxAmount = items.reduce((s, i) => s + i.taxAmount, 0)
  const total = subtotal + taxAmount

  const handleSave = () => {
    if (!invoiceNumber.trim()) {
      toast.error('Invoice number is required')
      return
    }
    if (!supplierName.trim()) {
      toast.error('Supplier name is required')
      return
    }
    if (!invoiceDate) {
      toast.error('Invoice date is required')
      return
    }

    const now = Date.now()
    const saved: Invoice = {
      id: invoice?.id || generateId(),
      invoiceNumber: invoiceNumber.trim(),
      supplierId: invoice?.supplierId || '',
      supplierName: supplierName.trim(),
      type,
      status,
      invoiceDate: new Date(invoiceDate).getTime(),
      issueDate: new Date(invoiceDate).getTime(),
      dueDate: dueDate ? new Date(dueDate).getTime() : now + 30 * 24 * 60 * 60 * 1000,
      paymentTerms,
      subtotal,
      tax: taxAmount,
      taxRate,
      taxAmount,
      total,
      amountPaid: invoice?.amountPaid || 0,
      balance: total - (invoice?.amountPaid || 0),
      currency: 'USD',
      exchangeRate: 1,
      items,
      notes: notes.trim(),
      createdBy: invoice?.createdBy || currentUser?.id || '',
      createdAt: invoice?.createdAt || now,
      updatedAt: now,
    }

    onSave?.(saved)
    toast.success(isEditing ? 'Invoice updated' : 'Invoice created')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="inv-number">Invoice Number *</Label>
                <Input
                  id="inv-number"
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  placeholder="INV-0001"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-supplier">Supplier Name *</Label>
                <Input
                  id="inv-supplier"
                  value={supplierName}
                  onChange={e => setSupplierName(e.target.value)}
                  placeholder="Supplier name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-type">Invoice Type</Label>
                <Select value={type} onValueChange={v => setType(v as InvoiceType)}>
                  <SelectTrigger id="inv-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INVOICE_TYPES.map(t => (
                      <SelectItem key={t} value={t}>{t.replace(/-/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-status">Status</Label>
                <Select value={status} onValueChange={v => setStatus(v as InvoiceStatus)}>
                  <SelectTrigger id="inv-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(['draft', 'pending-validation', 'validated', 'approved', 'paid', 'overdue', 'cancelled'] as InvoiceStatus[]).map(s => (
                      <SelectItem key={s} value={s}>{s.replace(/-/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-date">Invoice Date *</Label>
                <Input
                  id="inv-date"
                  type="date"
                  value={invoiceDate}
                  onChange={e => setInvoiceDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-due">Due Date</Label>
                <Input
                  id="inv-due"
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-terms">Payment Terms</Label>
                <Select value={paymentTerms} onValueChange={v => setPaymentTerms(v as PaymentTerms)}>
                  <SelectTrigger id="inv-terms">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TERMS.map(t => (
                      <SelectItem key={t} value={t}>{t.replace(/-/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inv-tax">Default Tax Rate (%)</Label>
                <Input
                  id="inv-tax"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={taxRate}
                  onChange={e => setTaxRate(Number(e.target.value))}
                />
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">Line Items</h4>
                <Button type="button" size="sm" variant="outline" onClick={addItem}>
                  <Plus size={14} className="mr-1" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <Card key={item.id} className="p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-xs">Item Name</Label>
                        <Input
                          placeholder="Item description"
                          value={item.itemName}
                          onChange={e => updateItem(index, 'itemName', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Qty</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.quantity}
                          onChange={e => updateItem(index, 'quantity', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Unit Price</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={e => updateItem(index, 'unitPrice', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Tax %</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={item.taxRate}
                          onChange={e => updateItem(index, 'taxRate', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Total</Label>
                        <div className="h-8 flex items-center px-3 bg-muted rounded-md text-sm font-medium">
                          {formatCurrency(item.total)}
                        </div>
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mt-3 flex justify-end">
                <div className="space-y-1 text-sm min-w-[180px]">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Tax:</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between gap-4 font-semibold">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="inv-notes">Notes</Label>
              <Textarea
                id="inv-notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>{isEditing ? 'Update Invoice' : 'Create Invoice'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
