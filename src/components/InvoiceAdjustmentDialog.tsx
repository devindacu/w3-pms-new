import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Calculator, Plus, Minus, Info } from '@phosphor-icons/react'
import type { GuestInvoice, SystemUser } from '@/lib/types'
import { formatCurrency, generateNumber } from '@/lib/helpers'

export type AdjustmentType = 'discount' | 'surcharge' | 'correction' | 'waiver'

interface InvoiceAdjustmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: GuestInvoice
  onAdjustmentApplied: (invoice: GuestInvoice) => void
  currentUser: SystemUser
}

export function InvoiceAdjustmentDialog({
  open,
  onOpenChange,
  invoice,
  onAdjustmentApplied,
  currentUser
}: InvoiceAdjustmentDialogProps) {
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('discount')
  const [adjustmentMethod, setAdjustmentMethod] = useState<'percentage' | 'fixed'>('percentage')
  const [adjustmentValue, setAdjustmentValue] = useState<number>(0)
  const [reason, setReason] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [requiresApproval, setRequiresApproval] = useState(false)

  useEffect(() => {
    if (open) {
      setAdjustmentType('discount')
      setAdjustmentMethod('percentage')
      setAdjustmentValue(0)
      setReason('')
      setNotes('')
      setRequiresApproval(false)
    }
  }, [open])

  const calculateAdjustmentAmount = () => {
    if (adjustmentMethod === 'percentage') {
      return (invoice.subtotal * adjustmentValue) / 100
    }
    return adjustmentValue
  }

  const getAdjustedTotal = () => {
    const adjustmentAmount = calculateAdjustmentAmount()
    const isNegative = adjustmentType === 'discount' || adjustmentType === 'waiver'
    
    if (isNegative) {
      return invoice.grandTotal - adjustmentAmount
    }
    return invoice.grandTotal + adjustmentAmount
  }

  const getAdjustmentTypeInfo = (type: AdjustmentType) => {
    switch (type) {
      case 'discount':
        return {
          label: 'Discount',
          description: 'Reduce invoice amount',
          color: 'text-success',
          icon: <Minus size={16} />
        }
      case 'surcharge':
        return {
          label: 'Surcharge',
          description: 'Add additional charge',
          color: 'text-warning',
          icon: <Plus size={16} />
        }
      case 'correction':
        return {
          label: 'Correction',
          description: 'Fix calculation error',
          color: 'text-primary',
          icon: <Calculator size={16} />
        }
      case 'waiver':
        return {
          label: 'Waiver',
          description: 'Waive amount (manager approval)',
          color: 'text-destructive',
          icon: <Minus size={16} />
        }
    }
  }

  const handleSubmit = () => {
    if (adjustmentValue <= 0) {
      toast.error('Adjustment amount must be greater than 0')
      return
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for this adjustment')
      return
    }

    const adjustmentAmount = calculateAdjustmentAmount()
    const isNegative = adjustmentType === 'discount' || adjustmentType === 'waiver'
    
    // Check if adjustment exceeds invoice amount for discounts/waivers
    if (isNegative && adjustmentAmount > invoice.grandTotal) {
      toast.error('Adjustment amount cannot exceed invoice total')
      return
    }

    // Apply adjustment to invoice
    const userName = `${currentUser.firstName} ${currentUser.lastName}`
    const updatedInvoice: GuestInvoice = {
      ...invoice,
      totalDiscount: isNegative 
        ? invoice.totalDiscount + adjustmentAmount 
        : invoice.totalDiscount,
      grandTotal: getAdjustedTotal(),
      amountDue: getAdjustedTotal() - invoice.totalPaid,
      internalNotes: invoice.internalNotes 
        ? `${invoice.internalNotes}\n[${new Date().toISOString()}] ${adjustmentType.toUpperCase()}: ${reason} (${userName})`
        : `[${new Date().toISOString()}] ${adjustmentType.toUpperCase()}: ${reason} (${userName})`
    }

    onAdjustmentApplied(updatedInvoice)
    onOpenChange(false)
    toast.success(`${getAdjustmentTypeInfo(adjustmentType).label} of ${formatCurrency(adjustmentAmount)} applied successfully`)
  }

  const adjustmentAmount = calculateAdjustmentAmount()
  const adjustedTotal = getAdjustedTotal()
  const typeInfo = getAdjustmentTypeInfo(adjustmentType)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator size={24} className="text-primary" />
            Invoice Adjustment
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            Invoice: {invoice.invoiceNumber} | Current Total: {formatCurrency(invoice.grandTotal)}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Adjustment Type */}
          <div className="space-y-2">
            <Label>Adjustment Type *</Label>
            <Select
              value={adjustmentType}
              onValueChange={(value: AdjustmentType) => setAdjustmentType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(['discount', 'surcharge', 'correction', 'waiver'] as AdjustmentType[]).map((type) => {
                  const info = getAdjustmentTypeInfo(type)
                  return (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <span className={info.color}>{info.icon}</span>
                        <div>
                          <div className="font-medium">{info.label}</div>
                          <div className="text-xs text-muted-foreground">{info.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Adjustment Method */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Method</Label>
              <Select
                value={adjustmentMethod}
                onValueChange={(value: 'percentage' | 'fixed') => setAdjustmentMethod(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount (LKR)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {adjustmentMethod === 'percentage' ? 'Percentage' : 'Amount'} *
              </Label>
              <Input
                type="number"
                min="0"
                step={adjustmentMethod === 'percentage' ? '0.01' : '0.01'}
                max={adjustmentMethod === 'percentage' ? '100' : undefined}
                value={adjustmentValue}
                onChange={(e) => setAdjustmentValue(parseFloat(e.target.value) || 0)}
                placeholder={adjustmentMethod === 'percentage' ? '0.00' : '0.00'}
              />
            </div>
          </div>

          {/* Adjustment Preview */}
          <div className="p-4 bg-muted/30 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Original Total:</span>
              <span className="font-medium">{formatCurrency(invoice.grandTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Adjustment Amount:</span>
              <span className={`font-medium ${typeInfo.color}`}>
                {(adjustmentType === 'discount' || adjustmentType === 'waiver') ? '-' : '+'}
                {formatCurrency(adjustmentAmount)}
              </span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">New Total:</span>
                <span className="font-bold text-lg">{formatCurrency(adjustedTotal)}</span>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Required: Why is this adjustment being made?"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional: Any additional context or details..."
              rows={3}
            />
          </div>

          {/* Warning for large adjustments */}
          {adjustmentAmount > invoice.grandTotal * 0.2 && (
            <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning rounded-lg">
              <Info size={20} className="text-warning shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-warning">Large Adjustment Warning</p>
                <p className="text-muted-foreground mt-1">
                  This adjustment is more than 20% of the invoice total. Manager approval may be required.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Apply Adjustment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
