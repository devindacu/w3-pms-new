import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash } from '@phosphor-icons/react'
import type { GuestInvoice, GuestInvoiceType, SystemUser, HotelBranding, InvoiceLineItem, Department } from '@/lib/types'
import { PrintButton } from '@/components/PrintButton'
import { A4PrintWrapper } from '@/components/A4PrintWrapper'

interface InvoiceEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice?: GuestInvoice
  onSave: (invoice: GuestInvoice) => void
  branding: HotelBranding | null
  currentUser: SystemUser
}

export function InvoiceEditDialog({ open, onOpenChange, invoice, onSave, branding, currentUser }: InvoiceEditDialogProps) {
  const [formData, setFormData] = useState<Partial<GuestInvoice>>({
    invoiceType: 'guest-folio',
    status: 'draft',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    currency: branding?.currency || 'LKR',
    lineItems: [],
    subtotal: 0,
    totalDiscount: 0,
    totalTax: 0,
    grandTotal: 0,
    totalPaid: 0,
    amountDue: 0,
  })

  const [lineItems, setLineItems] = useState<Partial<InvoiceLineItem>[]>([])

  useEffect(() => {
    if (invoice) {
      setFormData(invoice)
      setLineItems(invoice.lineItems)
    } else {
      setFormData({
        invoiceType: 'guest-folio',
        status: 'draft',
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        currency: branding?.currency || 'LKR',
        lineItems: [],
        subtotal: 0,
        totalDiscount: 0,
        totalTax: 0,
        grandTotal: 0,
        totalPaid: 0,
        amountDue: 0,
      })
      setLineItems([])
    }
  }, [invoice, branding])

  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: `line-${Date.now()}`,
        date: Date.now(),
        description: '',
        quantity: 1,
        unit: 'unit',
        unitPrice: 0,
        lineTotal: 0,
        netAmount: 0,
        taxable: true,
        serviceChargeApplicable: true,
        serviceChargeAmount: 0,
        totalTax: 0,
        lineGrandTotal: 0,
        postedAt: Date.now(),
        isSplit: false,
        isVoided: false,
        itemType: 'misc',
        department: 'admin' as Department,
        taxLines: []
      }
    ])
  }

  const handleRemoveLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const handleLineItemChange = (index: number, field: string, value: any) => {
    const updated = [...lineItems]
    updated[index] = {
      ...updated[index],
      [field]: value
    }
    
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? value : updated[index].quantity || 0
      const unitPrice = field === 'unitPrice' ? value : updated[index].unitPrice || 0
      const lineTotal = quantity * unitPrice
      updated[index] = {
        ...updated[index],
        lineTotal,
        netAmount: lineTotal,
        lineGrandTotal: lineTotal
      }
    }
    
    setLineItems(updated)
  }

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + (item.lineTotal || 0), 0)
    const grandTotal = lineItems.reduce((sum, item) => sum + (item.lineGrandTotal || 0), 0)
    
    return {
      subtotal,
      grandTotal,
      amountDue: grandTotal - (formData.totalPaid || 0)
    }
  }

  const handleSave = () => {
    const totals = calculateTotals()
    const now = Date.now()
    
    const savedInvoice: GuestInvoice = {
      id: invoice?.id || `inv-${now}`,
      invoiceNumber: invoice?.invoiceNumber || `INV-${String(now).slice(-8)}`,
      invoiceType: formData.invoiceType as GuestInvoiceType || 'guest-folio',
      status: formData.status || 'draft',
      folioIds: formData.folioIds || [],
      reservationIds: formData.reservationIds || [],
      guestId: formData.guestId || `guest-${now}`,
      guestName: formData.guestName || '',
      guestAddress: formData.guestAddress,
      guestEmail: formData.guestEmail,
      guestPhone: formData.guestPhone,
      companyName: formData.companyName,
      companyGSTNumber: formData.companyGSTNumber,
      companyAddress: formData.companyAddress,
      roomNumber: formData.roomNumber,
      checkInDate: formData.checkInDate,
      checkOutDate: formData.checkOutDate,
      invoiceDate: formData.invoiceDate || now,
      dueDate: formData.dueDate,
      currency: formData.currency || 'LKR',
      exchangeRate: formData.exchangeRate || 1,
      lineItems: lineItems as InvoiceLineItem[],
      subtotal: totals.subtotal,
      discounts: formData.discounts || [],
      totalDiscount: formData.totalDiscount || 0,
      serviceChargeRate: formData.serviceChargeRate || 0,
      serviceChargeAmount: formData.serviceChargeAmount || 0,
      taxLines: formData.taxLines || [],
      totalTax: formData.totalTax || 0,
      grandTotal: totals.grandTotal,
      payments: formData.payments || [],
      totalPaid: formData.totalPaid || 0,
      amountDue: totals.amountDue,
      creditNotes: formData.creditNotes || [],
      debitNotes: formData.debitNotes || [],
      prepayments: formData.prepayments || [],
      netAmountDue: totals.amountDue,
      isPostedToAccounts: formData.isPostedToAccounts || false,
      deliveryMethods: formData.deliveryMethods || [],
      auditTrail: formData.auditTrail || [
        {
          id: `audit-${now}`,
          action: invoice ? 'updated' : 'created',
          description: invoice ? 'Invoice updated' : 'Invoice created',
          performedBy: currentUser.userId,
          performedAt: now
        }
      ],
      isGroupMaster: formData.isGroupMaster || false,
      isTaxExempt: formData.isTaxExempt || false,
      createdBy: invoice?.createdBy || currentUser.userId,
      createdAt: invoice?.createdAt || now,
      updatedAt: now,
      ...(!invoice && { finalizedBy: undefined, finalizedAt: undefined })
    }
    
    onSave(savedInvoice)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{invoice ? 'Edit Invoice' : 'Create New Invoice'}</span>
            <PrintButton
              elementId="invoice-edit-print"
              options={{
                title: `Invoice Edit - ${formData.guestName || 'Draft'}`,
                filename: `invoice-edit-${formData.guestName?.replace(/\s/g, '-') || 'draft'}.pdf`
              }}
              variant="outline"
              size="sm"
            />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceType">Invoice Type</Label>
              <Select
                value={formData.invoiceType}
                onValueChange={(value) => setFormData({ ...formData, invoiceType: value as GuestInvoiceType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guest-folio">Guest Folio</SelectItem>
                  <SelectItem value="room-only">Room Only</SelectItem>
                  <SelectItem value="fnb-only">F&B Only</SelectItem>
                  <SelectItem value="extras-only">Extras Only</SelectItem>
                  <SelectItem value="group-master">Group Master</SelectItem>
                  <SelectItem value="proforma">Proforma</SelectItem>
                  <SelectItem value="credit-note">Credit Note</SelectItem>
                  <SelectItem value="debit-note">Debit Note</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={formData.invoiceDate ? new Date(formData.invoiceDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, invoiceDate: new Date(e.target.value).getTime() })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guestName">Guest Name *</Label>
              <Input
                id="guestName"
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestEmail">Email</Label>
              <Input
                id="guestEmail"
                type="email"
                value={formData.guestEmail}
                onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guestPhone">Phone</Label>
              <Input
                id="guestPhone"
                value={formData.guestPhone}
                onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Line Items</Label>
              <Button type="button" onClick={handleAddLineItem} size="sm">
                <Plus size={16} className="mr-2" />
                Add Line Item
              </Button>
            </div>

            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div key={item.id || index} className="flex gap-2 items-start p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                    />
                    <Input
                      placeholder="Quantity"
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                    <Input
                      placeholder="Unit Price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleLineItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                    <Input
                      placeholder="Total"
                      value={item.lineTotal?.toFixed(2) || '0.00'}
                      readOnly
                      className="bg-background"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveLineItem(index)}
                    className="text-destructive"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea
              id="notes"
              value={formData.internalNotes}
              onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="border-t pt-4">
            <div className="space-y-2 max-w-md ml-auto">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">{branding?.currencySymbol || 'LKR'} {calculateTotals().subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span>Grand Total:</span>
                <span>{branding?.currencySymbol || 'LKR'} {calculateTotals().grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Amount Due:</span>
                <span>{branding?.currencySymbol || 'LKR'} {calculateTotals().amountDue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {invoice ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </div>
        </div>

        {/* Hidden print section */}
        <div className="hidden">
          <A4PrintWrapper
            id="invoice-edit-print"
            title={`Invoice Edit - ${formData.guestName || 'Draft'}`}
            headerContent={
              <div className="text-sm">
                <p><strong>Type:</strong> {formData.invoiceType?.replace('-', ' ').toUpperCase() || 'N/A'}</p>
                <p><strong>Guest:</strong> {formData.guestName || 'N/A'}</p>
                <p><strong>Date:</strong> {formData.invoiceDate ? new Date(formData.invoiceDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            }
          >
            <div className="space-y-6">
              {/* Invoice Details */}
              <section>
                <h2 className="text-lg font-semibold mb-4">Invoice Details</h2>
                <table className="w-full border-collapse mb-6">
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-semibold">Invoice Type</td>
                      <td className="p-2 capitalize">{formData.invoiceType?.replace('-', ' ') || 'N/A'}</td>
                      <td className="p-2 font-semibold">Invoice Date</td>
                      <td className="p-2">{formData.invoiceDate ? new Date(formData.invoiceDate).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-semibold">Guest Name</td>
                      <td className="p-2">{formData.guestName || 'N/A'}</td>
                      <td className="p-2 font-semibold">Email</td>
                      <td className="p-2">{formData.guestEmail || 'N/A'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-semibold">Phone</td>
                      <td className="p-2">{formData.guestPhone || 'N/A'}</td>
                      <td className="p-2 font-semibold">Company</td>
                      <td className="p-2">{formData.companyName || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              {/* Line Items */}
              <section>
                <h2 className="text-lg font-semibold mb-4">Line Items</h2>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Description</th>
                      <th className="border p-2 text-right">Quantity</th>
                      <th className="border p-2 text-right">Unit Price</th>
                      <th className="border p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.length > 0 ? (
                      lineItems.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className="border p-2">{item.description || 'N/A'}</td>
                          <td className="border p-2 text-right">{item.quantity || 0}</td>
                          <td className="border p-2 text-right">{branding?.currencySymbol || 'LKR'} {(item.unitPrice || 0).toFixed(2)}</td>
                          <td className="border p-2 text-right font-semibold">{branding?.currencySymbol || 'LKR'} {(item.lineTotal || 0).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="border p-2 text-center text-gray-500" colSpan={4}>No line items</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>

              {/* Totals */}
              <section>
                <h2 className="text-lg font-semibold mb-4">Summary</h2>
                <div className="flex justify-end">
                  <table className="w-80 border-collapse">
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2">Subtotal:</td>
                        <td className="p-2 text-right font-semibold">{branding?.currencySymbol || 'LKR'} {calculateTotals().subtotal.toFixed(2)}</td>
                      </tr>
                      <tr className="border-b-2 border-black">
                        <td className="p-2 font-bold">Grand Total:</td>
                        <td className="p-2 text-right font-bold text-lg">{branding?.currencySymbol || 'LKR'} {calculateTotals().grandTotal.toFixed(2)}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2">Amount Due:</td>
                        <td className="p-2 text-right font-semibold">{branding?.currencySymbol || 'LKR'} {calculateTotals().amountDue.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Notes */}
              {formData.internalNotes && (
                <section>
                  <h2 className="text-lg font-semibold mb-4">Internal Notes</h2>
                  <div className="bg-gray-50 p-3 rounded border">
                    <p className="text-sm whitespace-pre-line">{formData.internalNotes}</p>
                  </div>
                </section>
              )}
            </div>
          </A4PrintWrapper>
        </div>
      </DialogContent>
    </Dialog>
  )
}
