import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
  CurrencyDollar,
  X,
  CheckCircle,
  Warning,
  CalendarBlank,
  Hash,
  Bank,
  CreditCard,
  Wallet,
  DeviceMobile
} from '@phosphor-icons/react'
import type { GuestInvoice, Payment, PaymentMethod, SystemUser } from '@/lib/types'
import { formatCurrency } from '@/lib/helpers'

interface PaymentRecordingDialogProps {
  open: boolean
  onClose: () => void
  invoice: GuestInvoice | null
  onPaymentRecorded: (payment: Payment) => void
  currentUser: SystemUser
}

export function PaymentRecordingDialog({
  open,
  onClose,
  invoice,
  onPaymentRecorded,
  currentUser
}: PaymentRecordingDialogProps) {
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReset = () => {
    setAmount('')
    setPaymentMethod('cash')
    setPaymentDate(format(new Date(), 'yyyy-MM-dd'))
    setReference('')
    setNotes('')
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!invoice) {
      toast.error('No invoice selected')
      return
    }

    const paymentAmount = parseFloat(amount)
    
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error('Please enter a valid payment amount')
      return
    }

    if (paymentAmount > invoice.amountDue) {
      toast.error('Payment amount cannot exceed amount due')
      return
    }

    setIsSubmitting(true)

    try {
      const payment: Payment = {
        id: `pmt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        paymentNumber: `PMT-${Date.now()}`,
        invoiceId: invoice.id,
        guestId: invoice.guestId,
        supplierId: undefined,
        amount: paymentAmount,
        method: paymentMethod,
        status: 'paid',
        reference: reference || undefined,
        notes: notes || undefined,
        processedAt: new Date(paymentDate).getTime(),
        processedBy: currentUser.id,
        reconciled: false
      }

      onPaymentRecorded(payment)
      toast.success(`Payment of ${formatCurrency(paymentAmount)} recorded successfully`)
      handleClose()
    } catch (error) {
      console.error('Error recording payment:', error)
      toast.error('Failed to record payment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuickAmount = (type: 'full' | 'half' | 'quarter') => {
    if (!invoice) return
    
    const amountDue = invoice.amountDue
    switch (type) {
      case 'full':
        setAmount(amountDue.toFixed(2))
        break
      case 'half':
        setAmount((amountDue / 2).toFixed(2))
        break
      case 'quarter':
        setAmount((amountDue / 4).toFixed(2))
        break
    }
  }

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'cash':
        return <Wallet size={20} className="text-success" />
      case 'card':
        return <CreditCard size={20} className="text-primary" />
      case 'bank-transfer':
        return <Bank size={20} className="text-accent" />
      case 'mobile-payment':
        return <DeviceMobile size={20} className="text-secondary" />
      default:
        return <CurrencyDollar size={20} className="text-muted-foreground" />
    }
  }

  if (!invoice) return null

  const paymentAmount = parseFloat(amount) || 0
  const remainingBalance = invoice.amountDue - paymentAmount

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <CurrencyDollar size={24} className="text-success" />
              Record Payment
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X size={20} />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="p-4 bg-muted/50 border-l-4 border-l-primary">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Invoice Number</span>
                <span className="font-semibold">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Guest Name</span>
                <span className="font-semibold">{invoice.guestName}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Grand Total</span>
                <span className="text-lg font-bold">{formatCurrency(invoice.grandTotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Amount Paid</span>
                <span className="text-success font-semibold">{formatCurrency(invoice.totalPaid)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Amount Due</span>
                <span className="text-lg font-bold text-destructive">{formatCurrency(invoice.amountDue)}</span>
              </div>
            </div>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                <SelectTrigger id="payment-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">
                    <div className="flex items-center gap-2">
                      <Wallet size={16} />
                      Cash
                    </div>
                  </SelectItem>
                  <SelectItem value="card">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} />
                      Card Payment
                    </div>
                  </SelectItem>
                  <SelectItem value="bank-transfer">
                    <div className="flex items-center gap-2">
                      <Bank size={16} />
                      Bank Transfer
                    </div>
                  </SelectItem>
                  <SelectItem value="mobile-payment">
                    <div className="flex items-center gap-2">
                      <DeviceMobile size={16} />
                      Mobile Payment
                    </div>
                  </SelectItem>
                  <SelectItem value="credit">
                    <div className="flex items-center gap-2">
                      <CurrencyDollar size={16} />
                      Credit / Account
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="payment-amount">Payment Amount *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount('quarter')}
                  >
                    25%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount('half')}
                  >
                    50%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAmount('full')}
                  >
                    Full
                  </Button>
                </div>
              </div>
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                min="0"
                max={invoice.amountDue}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
              {paymentAmount > invoice.amountDue && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <Warning size={16} />
                  Amount exceeds amount due
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-date">Payment Date *</Label>
              <Input
                id="payment-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference Number</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder={
                    paymentMethod === 'card' ? 'Last 4 digits / Auth code' :
                    paymentMethod === 'bank-transfer' ? 'Transfer reference' :
                    paymentMethod === 'mobile-payment' ? 'Transaction ID' :
                    'Reference number (optional)'
                  }
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional payment notes (optional)"
                rows={3}
              />
            </div>

            {paymentAmount > 0 && (
              <Card className="p-4 bg-accent/10 border-accent">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle size={20} className="text-success" />
                    Payment Summary
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Payment Amount:</div>
                    <div className="font-semibold text-right">{formatCurrency(paymentAmount)}</div>
                    
                    <div className="text-muted-foreground">Payment Method:</div>
                    <div className="font-semibold text-right flex items-center justify-end gap-2">
                      {getPaymentMethodIcon(paymentMethod)}
                      {paymentMethod.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </div>
                    
                    <div className="text-muted-foreground">Current Due:</div>
                    <div className="font-semibold text-right text-destructive">
                      {formatCurrency(invoice.amountDue)}
                    </div>
                    
                    <div className="col-span-2"><Separator /></div>
                    
                    <div className="text-muted-foreground font-bold">Remaining Balance:</div>
                    <div className={`font-bold text-right text-lg ${
                      remainingBalance === 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {formatCurrency(remainingBalance)}
                    </div>
                  </div>
                  
                  {remainingBalance === 0 && (
                    <div className="flex items-center gap-2 text-sm text-success bg-success/10 p-2 rounded">
                      <CheckCircle size={16} />
                      This payment will fully settle the invoice
                    </div>
                  )}
                </div>
              </Card>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > invoice.amountDue}
                className="flex-1"
              >
                <CurrencyDollar size={20} className="mr-2" />
                {isSubmitting ? 'Recording...' : 'Record Payment'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
