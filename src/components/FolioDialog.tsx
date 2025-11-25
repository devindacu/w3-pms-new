import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { type Folio, type Reservation, type Guest, type Department } from '@/lib/types'
import { formatDateTime, formatCurrency, generateId } from '@/lib/helpers'
import { Plus, Receipt } from '@phosphor-icons/react'

interface FolioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folio?: Folio
  reservation?: Reservation
  folios: Folio[]
  setFolios: (folios: Folio[] | ((prev: Folio[]) => Folio[])) => void
  guests: Guest[]
}

export function FolioDialog({ 
  open, 
  onOpenChange, 
  folio,
  reservation,
  folios,
  setFolios,
  guests
}: FolioDialogProps) {
  const [chargeDescription, setChargeDescription] = useState('')
  const [chargeAmount, setChargeAmount] = useState(0)
  const [chargeQuantity, setChargeQuantity] = useState(1)
  const [chargeDepartment, setChargeDepartment] = useState<Department>('front-office')
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank-transfer' | 'mobile-payment'>('card')

  if (!folio && !reservation) return null

  const currentFolio = folio || folios.find(f => f.reservationId === reservation?.id)
  const guest = guests.find(g => g.id === (currentFolio?.guestId || reservation?.guestId))

  if (!currentFolio) return null

  const totalCharges = currentFolio.charges.reduce((sum, c) => sum + (c.amount * c.quantity), 0)
  const totalPayments = currentFolio.payments.reduce((sum, p) => sum + p.amount, 0)
  const balance = totalCharges - totalPayments

  const handleAddCharge = () => {
    if (!chargeDescription.trim() || chargeAmount <= 0) {
      toast.error('Please enter valid charge details')
      return
    }

    setFolios((prev) => prev.map(f => 
      f.id === currentFolio.id 
        ? {
            ...f,
            charges: [
              ...f.charges,
              {
                id: generateId(),
                folioId: f.id,
                description: chargeDescription,
                amount: chargeAmount,
                quantity: chargeQuantity,
                department: chargeDepartment,
                timestamp: Date.now(),
                postedBy: 'system'
              }
            ],
            balance: f.balance + (chargeAmount * chargeQuantity),
            updatedAt: Date.now()
          }
        : f
    ))

    setChargeDescription('')
    setChargeAmount(0)
    setChargeQuantity(1)
    toast.success('Charge added successfully')
  }

  const handleAddPayment = () => {
    if (paymentAmount <= 0) {
      toast.error('Please enter a valid payment amount')
      return
    }

    setFolios((prev) => prev.map(f => 
      f.id === currentFolio.id 
        ? {
            ...f,
            payments: [
              ...f.payments,
              {
                id: generateId(),
                folioId: f.id,
                amount: paymentAmount,
                method: paymentMethod,
                status: 'paid',
                timestamp: Date.now(),
                receivedBy: 'system'
              }
            ],
            balance: f.balance - paymentAmount,
            updatedAt: Date.now()
          }
        : f
    ))

    setPaymentAmount(0)
    toast.success('Payment recorded successfully')
  }

  const handlePrint = () => {
    toast.info('Folio printing functionality would be implemented here')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt size={24} />
            Guest Folio
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Guest Name</Label>
              <p className="font-semibold">
                {guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown Guest'}
              </p>
            </div>
            <div>
              <Label>Folio Number</Label>
              <p className="font-mono">{currentFolio.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Charges</h3>
            <div className="space-y-2 mb-4">
              {currentFolio.charges.map(charge => (
                <div key={charge.id} className="flex justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{charge.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(charge.timestamp)} • {charge.department}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(charge.amount)} × {charge.quantity}
                    </p>
                    <p className="text-sm font-bold">
                      {formatCurrency(charge.amount * charge.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-4">
                <Input
                  placeholder="Description"
                  value={chargeDescription}
                  onChange={(e) => setChargeDescription(e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  placeholder="Amount"
                  min="0"
                  step="0.01"
                  value={chargeAmount || ''}
                  onChange={(e) => setChargeAmount(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  placeholder="Qty"
                  min="1"
                  value={chargeQuantity}
                  onChange={(e) => setChargeQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="col-span-3">
                <Select value={chargeDepartment} onValueChange={(value: Department) => setChargeDepartment(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="front-office">Front Office</SelectItem>
                    <SelectItem value="fnb">F&B</SelectItem>
                    <SelectItem value="housekeeping">Housekeeping</SelectItem>
                    <SelectItem value="kitchen">Kitchen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Button onClick={handleAddCharge} className="w-full">
                  <Plus size={16} />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Payments</h3>
            <div className="space-y-2 mb-4">
              {currentFolio.payments.map(payment => (
                <div key={payment.id} className="flex justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium capitalize">{payment.method.replace('-', ' ')}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(payment.timestamp)}
                    </p>
                  </div>
                  <p className="font-semibold text-success">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-5">
                <Input
                  type="number"
                  placeholder="Payment amount"
                  min="0"
                  step="0.01"
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-6">
                <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    <SelectItem value="mobile-payment">Mobile Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Button onClick={handleAddPayment} className="w-full">
                  <Plus size={16} />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between text-lg">
              <span>Total Charges:</span>
              <span className="font-semibold">{formatCurrency(totalCharges)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span>Total Payments:</span>
              <span className="font-semibold">{formatCurrency(totalPayments)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-xl font-bold">
              <span>Balance:</span>
              <span className={balance > 0 ? 'text-destructive' : 'text-success'}>
                {formatCurrency(balance)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handlePrint}>
            <Receipt size={16} className="mr-2" />
            Print Folio
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
