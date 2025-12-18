import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { useOfflineQueue } from '@/hooks/use-offline'
import { toast } from 'sonner'
import {
  CurrencyDollar,
  CheckCircle,
  WifiSlash,
  CreditCard,
  Money,
  Bank,
} from '@phosphor-icons/react'

type QuickPaymentRecordProps = {
  isOnline: boolean
}

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: Money },
  { value: 'credit-card', label: 'Credit Card', icon: CreditCard },
  { value: 'bank-transfer', label: 'Bank Transfer', icon: Bank },
] as const

export function QuickPaymentRecord({ isOnline }: QuickPaymentRecordProps) {
  const { queueOperation } = useOfflineQueue()
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')

  const handleRecordPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (!method) {
      toast.error('Please select payment method')
      return
    }

    try {
      await queueOperation(
        'create',
        'payment',
        {
          amount: parseFloat(amount),
          method,
          reference: reference || undefined,
          notes: notes || undefined,
          timestamp: Date.now(),
        },
        'high'
      )

      toast.success(
        `Payment of $${amount} recorded${!isOnline ? ' (will sync when online)' : ''}`
      )

      setAmount('')
      setMethod('')
      setReference('')
      setNotes('')
    } catch (error) {
      toast.error('Failed to record payment')
    }
  }

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Quick Payment</h3>
        {!isOnline && (
          <Badge variant="outline" className="border-warning text-warning">
            <WifiSlash size={12} className="mr-1" />
            Offline Mode
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="payment-amount">Amount</Label>
          <div className="relative">
            <CurrencyDollar
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="payment-amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-10"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="payment-method">Payment Method</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger id="payment-method">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((pm) => {
                const Icon = pm.icon
                return (
                  <SelectItem key={pm.value} value={pm.value}>
                    <div className="flex items-center gap-2">
                      <Icon size={16} />
                      <span>{pm.label}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="payment-reference">Reference Number (Optional)</Label>
          <Input
            id="payment-reference"
            placeholder="Transaction reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="payment-notes">Notes (Optional)</Label>
          <Textarea
            id="payment-notes"
            placeholder="Additional notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        <Button
          onClick={handleRecordPayment}
          className="w-full"
          size="lg"
          disabled={!amount || !method}
        >
          <CheckCircle size={20} className="mr-2" weight="bold" />
          Record Payment
        </Button>

        {!isOnline && (
          <div className="rounded-lg bg-warning/10 border border-warning/20 p-3 text-sm">
            <p className="text-warning font-medium mb-1">Working Offline</p>
            <p className="text-muted-foreground text-xs">
              Payment will be saved locally and synced when you're back online.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
