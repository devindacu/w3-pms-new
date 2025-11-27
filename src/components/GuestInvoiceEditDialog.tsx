import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PencilSimple, Plus, Trash, X } from '@phosphor-icons/react'
import type { GuestInvoice, SystemUser, InvoiceLineItem } from '@/lib/types'
import { formatCurrency } from '@/lib/helpers'
import { toast } from 'sonner'

interface GuestInvoiceEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: GuestInvoice
  onSave: (invoice: GuestInvoice) => void
  currentUser: SystemUser
}

export function GuestInvoiceEditDialog({
  open,
  onOpenChange,
  invoice,
  onSave,
  currentUser
}: GuestInvoiceEditDialogProps) {
  const [editedInvoice, setEditedInvoice] = useState<GuestInvoice>(invoice)
  const [isSaving, setIsSaving] = useState(false)

  const handleLineItemChange = (index: number, field: keyof InvoiceLineItem, value: any) => {
    const updatedLineItems = [...editedInvoice.lineItems]
    updatedLineItems[index] = {
      ...updatedLineItems[index],
      [field]: value
    }

    if (field === 'quantity' || field === 'unitPrice') {
      const item = updatedLineItems[index]
      item.lineTotal = item.quantity * item.unitPrice
      item.netAmount = item.lineTotal - (item.discountAmount || 0)
      item.lineGrandTotal = item.netAmount + (item.serviceChargeAmount || 0) + item.totalTax
    }

    recalculateTotals(updatedLineItems)
  }

  const recalculateTotals = (lineItems: InvoiceLineItem[]) => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0)
    const totalTax = lineItems.reduce((sum, item) => sum + item.totalTax, 0)
    const serviceChargeAmount = lineItems.reduce((sum, item) => sum + (item.serviceChargeAmount || 0), 0)
    const grandTotal = subtotal - editedInvoice.totalDiscount + serviceChargeAmount + totalTax
    const amountDue = grandTotal - editedInvoice.totalPaid

    setEditedInvoice(prev => ({
      ...prev,
      lineItems,
      subtotal,
      totalTax,
      serviceChargeAmount,
      grandTotal,
      amountDue
    }))
  }

  const handleRemoveLineItem = (index: number) => {
    const updatedLineItems = editedInvoice.lineItems.filter((_, i) => i !== index)
    recalculateTotals(updatedLineItems)
    toast.success('Line item removed')
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updatedInvoice: GuestInvoice = {
        ...editedInvoice,
        updatedAt: Date.now(),
        auditTrail: [
          ...(editedInvoice.auditTrail || []),
          {
            id: `audit-${Date.now()}`,
            action: 'modified',
            description: 'Invoice modified',
            performedBy: currentUser.id,
            performedAt: Date.now()
          }
        ]
      }

      onSave(updatedInvoice)
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to save invoice')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Invoice - {invoice.invoiceNumber}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X size={18} />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Guest Name</Label>
                <Input
                  value={editedInvoice.guestName}
                  onChange={e =>
                    setEditedInvoice(prev => ({ ...prev, guestName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Guest Email</Label>
                <Input
                  type="email"
                  value={editedInvoice.guestEmail || ''}
                  onChange={e =>
                    setEditedInvoice(prev => ({ ...prev, guestEmail: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Guest Phone</Label>
                <Input
                  value={editedInvoice.guestPhone || ''}
                  onChange={e =>
                    setEditedInvoice(prev => ({ ...prev, guestPhone: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Room Number</Label>
                <Input
                  value={editedInvoice.roomNumber || ''}
                  onChange={e =>
                    setEditedInvoice(prev => ({ ...prev, roomNumber: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Guest Address</Label>
              <Textarea
                value={editedInvoice.guestAddress || ''}
                onChange={e => setEditedInvoice(prev => ({ ...prev, guestAddress: e.target.value }))}
                rows={2}
              />
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Line Items</h3>
              </div>

              <div className="space-y-3">
                {editedInvoice.lineItems.map((item, index) => (
                  <div key={item.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Description</Label>
                          <Input
                            value={item.description}
                            onChange={e => handleLineItemChange(index, 'description', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-2">
                            <Label className="text-xs">Quantity</Label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={e =>
                                handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 0)
                              }
                              step="0.01"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Unit Price</Label>
                            <Input
                              type="number"
                              value={item.unitPrice}
                              onChange={e =>
                                handleLineItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)
                              }
                              step="0.01"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Line Total</Label>
                            <Input value={formatCurrency(item.lineTotal)} disabled />
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLineItem(index)}
                        className="text-destructive"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex justify-end">
              <div className="w-96 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(editedInvoice.subtotal)}</span>
                </div>
                {editedInvoice.totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount:</span>
                    <span className="font-medium">-{formatCurrency(editedInvoice.totalDiscount)}</span>
                  </div>
                )}
                {editedInvoice.serviceChargeAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Charge:</span>
                    <span className="font-medium">
                      {formatCurrency(editedInvoice.serviceChargeAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax:</span>
                  <span className="font-medium">{formatCurrency(editedInvoice.totalTax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Grand Total:</span>
                  <span className="text-primary">{formatCurrency(editedInvoice.grandTotal)}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Instructions</Label>
                <Textarea
                  value={editedInvoice.paymentInstructions || ''}
                  onChange={e =>
                    setEditedInvoice(prev => ({ ...prev, paymentInstructions: e.target.value }))
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Special Instructions</Label>
                <Textarea
                  value={editedInvoice.specialInstructions || ''}
                  onChange={e =>
                    setEditedInvoice(prev => ({ ...prev, specialInstructions: e.target.value }))
                  }
                  rows={3}
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
