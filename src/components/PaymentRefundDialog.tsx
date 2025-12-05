import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
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
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
  ArrowLeft,
  CurrencyDollar,
  CalendarBlank,
  Receipt,
  Warning,
  CheckCircle,
  Wallet,
  CreditCard,
  Bank,
  DeviceMobile
} from '@phosphor-icons/react'
import type { Payment, PaymentMethod, PaymentRefund, GuestInvoice, SystemUser } from '@/lib/types'
import { formatCurrency } from '@/lib/helpers'

interface PaymentRefundDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: Payment
  invoice?: GuestInvoice
  currentUser: SystemUser
  onRefund: (refund: PaymentRefund, updatedPayment: Payment, updatedInvoice?: GuestInvoice) => void
}

export function PaymentRefundDialog({
  open,
  onOpenChange,
  payment,
  invoice,
  currentUser,
  onRefund
}: PaymentRefundDialogProps) {
  const [refundAmount, setRefundAmount] = useState<number>(0)
  const [refundMethod, setRefundMethod] = useState<PaymentMethod>(payment.method)
  const [refundReason, setRefundReason] = useState('')
  const [refundReference, setRefundReference] = useState('')
  const [notes, setNotes] = useState('')
  const [requireApproval, setRequireApproval] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalRefundedAmount = (payment.refundedAmount || 0)
  const maxRefundAmount = payment.amount - totalRefundedAmount
  const isFullRefund = refundAmount === maxRefundAmount
  const isPartialRefund = refundAmount > 0 && refundAmount < maxRefundAmount

  useEffect(() => {
    if (open) {
      setRefundAmount(maxRefundAmount)
      setRefundMethod(payment.method)
      setRefundReason('')
      setRefundReference('')
      setNotes('')
      setRequireApproval(maxRefundAmount > 10000)
    }
  }, [open, maxRefundAmount, payment.method])

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (refundAmount <= 0) {
      toast.error('Refund amount must be greater than 0')
      return
    }

    if (refundAmount > maxRefundAmount) {
      toast.error(`Refund amount cannot exceed ${formatCurrency(maxRefundAmount)}`)
      return
    }

    if (!refundReason.trim()) {
      toast.error('Please provide a reason for the refund')
      return
    }

    if (requireApproval && !currentUser.permissions?.some(p => p.actions.includes('approve'))) {
      toast.error('This refund requires manager approval')
      return
    }

    setIsSubmitting(true)

    try {
      const refund: PaymentRefund = {
        id: `rfnd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        refundNumber: `RFND-${Date.now()}`,
        originalPaymentId: payment.id,
        originalPaymentNumber: payment.paymentNumber,
        amount: refundAmount,
        refundMethod: refundMethod,
        reason: refundReason,
        notes: notes || undefined,
        approvedBy: requireApproval ? currentUser.id : undefined,
        approvedAt: requireApproval ? Date.now() : undefined,
        processedBy: currentUser.id,
        processedAt: Date.now(),
        invoiceId: payment.invoiceId,
        guestId: payment.guestId,
        reference: refundReference || undefined,
        status: 'processed',
        createdAt: Date.now()
      }

      const partialRefunds = payment.partialRefunds || []
      partialRefunds.push(refund)

      const newRefundedAmount = totalRefundedAmount + refundAmount
      const isFullyRefunded = newRefundedAmount >= payment.amount

      const updatedPayment: Payment = {
        ...payment,
        isRefunded: isFullyRefunded,
        refundedAmount: newRefundedAmount,
        refundedAt: Date.now(),
        refundedBy: currentUser.id,
        refundReference: refund.refundNumber,
        refundReason: refundReason,
        partialRefunds,
        status: isFullyRefunded ? 'refunded' : payment.status
      }

      let updatedInvoice: GuestInvoice | undefined = undefined
      
      if (invoice) {
        const newTotalPaid = invoice.totalPaid - refundAmount
        const newAmountDue = invoice.grandTotal - newTotalPaid

        const paymentRecords = invoice.payments.map(p => 
          p.id === payment.id 
            ? {
                ...p,
                isRefunded: true,
                refundedAmount: refundAmount,
                refundedAt: Date.now(),
                refundReference: refund.refundNumber
              }
            : p
        )

        updatedInvoice = {
          ...invoice,
          payments: paymentRecords,
          totalPaid: newTotalPaid,
          amountDue: newAmountDue,
          status: newAmountDue > 0 && newAmountDue < invoice.grandTotal ? 'partially-refunded' : invoice.status,
          auditTrail: [
            ...invoice.auditTrail,
            {
              id: `audit-${Date.now()}`,
              action: 'refunded',
              description: `Refund of ${formatCurrency(refundAmount)} processed for payment ${payment.paymentNumber}. Reason: ${refundReason}`,
              performedBy: currentUser.id,
              performedAt: Date.now()
            }
          ]
        }
      }

      onRefund(refund, updatedPayment, updatedInvoice)
      
      toast.success(
        isFullRefund 
          ? `Full refund of ${formatCurrency(refundAmount)} processed successfully`
          : `Partial refund of ${formatCurrency(refundAmount)} processed successfully`
      )
      
      handleClose()
    } catch (error) {
      console.error('Error processing refund:', error)
      toast.error('Failed to process refund')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'cash':
        return <Wallet size={18} className="text-success" />
      case 'card':
        return <CreditCard size={18} className="text-primary" />
      case 'bank-transfer':
        return <Bank size={18} className="text-accent" />
      case 'mobile-payment':
        return <DeviceMobile size={18} className="text-secondary" />
      default:
        return <CurrencyDollar size={18} className="text-muted-foreground" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeft size={24} className="text-destructive" />
            Process Payment Refund
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 px-6 py-4">
          <Card className="p-4 bg-muted/30 border-l-4 border-l-primary">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Receipt size={20} />
              Original Payment Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Payment Number:</span>
                <div className="font-mono font-medium mt-1">{payment.paymentNumber}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Payment Date:</span>
                <div className="font-medium mt-1">{format(payment.processedAt, 'MMM dd, yyyy HH:mm')}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Payment Method:</span>
                <div className="flex items-center gap-2 mt-1">
                  {getPaymentMethodIcon(payment.method)}
                  <span className="font-medium capitalize">{payment.method.split('-').join(' ')}</span>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Original Amount:</span>
                <div className="font-bold text-success mt-1">{formatCurrency(payment.amount)}</div>
              </div>
              {totalRefundedAmount > 0 && (
                <>
                  <div>
                    <span className="text-muted-foreground">Already Refunded:</span>
                    <div className="font-bold text-destructive mt-1">{formatCurrency(totalRefundedAmount)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Available to Refund:</span>
                    <div className="font-bold text-primary mt-1">{formatCurrency(maxRefundAmount)}</div>
                  </div>
                </>
              )}
              {payment.reference && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Reference:</span>
                  <div className="font-mono text-sm mt-1">{payment.reference}</div>
                </div>
              )}
            </div>
          </Card>

          {invoice && (
            <Card className="p-4 bg-muted/20">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Receipt size={20} />
                Invoice Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Invoice Number:</span>
                  <div className="font-mono font-medium mt-1">{invoice.invoiceNumber}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Guest Name:</span>
                  <div className="font-medium mt-1">{invoice.guestName}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Invoice Total:</span>
                  <div className="font-bold mt-1">{formatCurrency(invoice.grandTotal)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Amount Due:</span>
                  <div className="font-bold text-accent mt-1">{formatCurrency(invoice.amountDue)}</div>
                </div>
              </div>
            </Card>
          )}

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <CurrencyDollar size={20} />
              Refund Details
            </h3>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="refundAmount" className="flex items-center justify-between">
                  <span>Refund Amount *</span>
                  <span className="text-sm text-muted-foreground">
                    Max: {formatCurrency(maxRefundAmount)}
                  </span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">LKR</span>
                  <Input
                    id="refundAmount"
                    type="number"
                    min="0"
                    max={maxRefundAmount}
                    step="0.01"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                    className="pl-14"
                  />
                </div>
                {isFullRefund && (
                  <div className="flex items-center gap-2 text-sm text-success">
                    <CheckCircle size={16} />
                    <span>Full refund</span>
                  </div>
                )}
                {isPartialRefund && (
                  <div className="flex items-center gap-2 text-sm text-accent">
                    <Warning size={16} />
                    <span>Partial refund - {formatCurrency(maxRefundAmount - refundAmount)} will remain</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="refundMethod">Refund Method *</Label>
                <Select value={refundMethod} onValueChange={(value) => setRefundMethod(value as PaymentMethod)}>
                  <SelectTrigger id="refundMethod">
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
                        Card (Refund to original card)
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
                    <SelectItem value="credit">Credit Note</SelectItem>
                  </SelectContent>
                </Select>
                {refundMethod !== payment.method && (
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <Warning size={16} />
                    <span>Refund method differs from original payment method</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="refundReason">Refund Reason *</Label>
                <Select value={refundReason} onValueChange={setRefundReason}>
                  <SelectTrigger id="refundReason">
                    <SelectValue placeholder="Select refund reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cancellation">Cancellation</SelectItem>
                    <SelectItem value="Duplicate Payment">Duplicate Payment</SelectItem>
                    <SelectItem value="Service Issue">Service Issue</SelectItem>
                    <SelectItem value="Billing Error">Billing Error</SelectItem>
                    <SelectItem value="Guest Request">Guest Request</SelectItem>
                    <SelectItem value="Quality Issue">Quality Issue</SelectItem>
                    <SelectItem value="Overcharge">Overcharge</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="refundReference">Refund Reference</Label>
                <Input
                  id="refundReference"
                  value={refundReference}
                  onChange={(e) => setRefundReference(e.target.value)}
                  placeholder="Transaction reference, approval code, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional details about this refund..."
                  rows={3}
                />
              </div>
            </div>

            {requireApproval && (
              <Card className="p-4 bg-amber-50 border-amber-200">
                <div className="flex items-start gap-3">
                  <Warning size={20} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-semibold text-amber-900">Manager Approval Required</h4>
                    <p className="text-sm text-amber-700">
                      This refund amount exceeds LKR 10,000 and requires manager approval. Please ensure you have the necessary permissions.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {payment.partialRefunds && payment.partialRefunds.length > 0 && (
              <Card className="p-4 bg-muted/20">
                <h4 className="font-semibold mb-3">Previous Refunds</h4>
                <div className="space-y-2">
                  {payment.partialRefunds.map((refund, index) => (
                    <div key={refund.id} className="flex items-center justify-between text-sm p-2 bg-background rounded">
                      <div>
                        <div className="font-medium">{refund.refundNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(refund.processedAt, 'MMM dd, yyyy HH:mm')} - {refund.reason}
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-destructive/10 text-destructive">
                        {formatCurrency(refund.amount)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t pt-4">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || refundAmount <= 0 || !refundReason}
            className="bg-destructive hover:bg-destructive/90"
          >
            <ArrowLeft size={16} className="mr-2" />
            {isSubmitting ? 'Processing...' : `Process Refund ${formatCurrency(refundAmount)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
