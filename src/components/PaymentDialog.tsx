import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { type Payment, type PaymentMethod, type PaymentStatus, type Invoice } from '@/lib/types'
import { generateNumber } from '@/lib/helpers'

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment?: Payment
  invoices: Invoice[]
  onSave: (payment: Payment) => void
}

export function PaymentDialog({ open, onOpenChange, payment, invoices, onSave }: PaymentDialogProps) {
  const [formData, setFormData] = useState<Partial<Payment>>({
    paymentNumber: '',
    amount: 0,
    method: 'cash',
    status: 'paid',
    processedAt: Date.now(),
    processedBy: 'admin',
    reconciled: false
  })

  useEffect(() => {
    if (payment) {
      setFormData(payment)
    } else {
      const newPaymentNumber = generateNumber('PAY')
      setFormData({
        paymentNumber: newPaymentNumber,
        amount: 0,
        method: 'cash',
        status: 'paid',
        processedAt: Date.now(),
        processedBy: 'admin',
        reconciled: false
      })
    }
  }, [payment, open])

  const handleSubmit = () => {
    if (!formData.paymentNumber) {
      toast.error('Payment number is required')
      return
    }

    if (!formData.amount || formData.amount <= 0) {
      toast.error('Payment amount must be greater than 0')
      return
    }

    const newPayment: Payment = {
      id: payment?.id || `pay-${Date.now()}`,
      paymentNumber: formData.paymentNumber!,
      invoiceId: formData.invoiceId,
      guestId: formData.guestId,
      supplierId: formData.supplierId,
      amount: formData.amount!,
      method: formData.method as PaymentMethod,
      status: formData.status as PaymentStatus,
      reference: formData.reference,
      notes: formData.notes,
      processedAt: formData.processedAt!,
      processedBy: formData.processedBy!,
      reconciled: formData.reconciled || false,
      reconciledAt: formData.reconciledAt,
      reconciledBy: formData.reconciledBy
    }

    onSave(newPayment)
    toast.success(payment ? 'Payment updated successfully' : 'Payment recorded successfully')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{payment ? 'Edit Payment' : 'Record New Payment'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Payment Number</Label>
              <Input
                value={formData.paymentNumber}
                onChange={(e) => setFormData({ ...formData, paymentNumber: e.target.value })}
                placeholder="PAY-001"
              />
            </div>

            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <Label>Payment Method</Label>
              <Select value={formData.method} onValueChange={(value) => setFormData({ ...formData, method: value as PaymentMethod })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mobile-payment">Mobile Payment</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as PaymentStatus })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partially-paid">Partially Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Processed Date</Label>
              <Input
                type="date"
                value={new Date(formData.processedAt!).toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, processedAt: new Date(e.target.value).getTime() })}
              />
            </div>

            <div>
              <Label>Processed By</Label>
              <Input
                value={formData.processedBy}
                onChange={(e) => setFormData({ ...formData, processedBy: e.target.value })}
                placeholder="Username"
              />
            </div>

            <div className="col-span-2">
              <Label>Related Invoice (Optional)</Label>
              <Select value={formData.invoiceId || ''} onValueChange={(value) => setFormData({ ...formData, invoiceId: value || undefined })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select invoice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {invoices.map((inv) => (
                    <SelectItem key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - ${inv.total.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label>Reference Number</Label>
              <Input
                value={formData.reference || ''}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Transaction reference or check number"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="reconciled"
              checked={formData.reconciled}
              onCheckedChange={(checked) => setFormData({ 
                ...formData, 
                reconciled: checked as boolean,
                reconciledAt: checked ? Date.now() : undefined,
                reconciledBy: checked ? 'admin' : undefined
              })}
            />
            <Label htmlFor="reconciled" className="cursor-pointer">
              Mark as reconciled
            </Label>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this payment..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {payment ? 'Update Payment' : 'Record Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
