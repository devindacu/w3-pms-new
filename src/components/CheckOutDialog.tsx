import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DialogAdapter } from '@/components/adapters/DialogAdapter'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { type Reservation, type Room, type Folio, type Guest } from '@/lib/types'
import { formatDate, formatCurrency, generateId } from '@/lib/helpers'

interface CheckOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation?: Reservation
  reservations: Reservation[]
  setReservations: (reservations: Reservation[] | ((prev: Reservation[]) => Reservation[])) => void
  rooms: Room[]
  setRooms: (rooms: Room[] | ((prev: Room[]) => Room[])) => void
  folios: Folio[]
  setFolios: (folios: Folio[] | ((prev: Folio[]) => Folio[])) => void
  guests: Guest[]
}

export function CheckOutDialog({ 
  open, 
  onOpenChange, 
  reservation,
  reservations,
  setReservations,
  rooms,
  setRooms,
  folios,
  setFolios,
  guests
}: CheckOutDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank-transfer' | 'mobile-payment'>('card')
  const [paymentAmount, setPaymentAmount] = useState(0)

  if (!reservation) return null

  const guest = guests.find(g => g.id === reservation.guestId)
  const room = rooms.find(r => r.id === reservation.roomId)
  const folio = folios.find(f => f.reservationId === reservation.id)
  
  const totalCharges = folio?.charges.reduce((sum, c) => sum + (c.amount * c.quantity), 0) || reservation.totalAmount
  const totalPayments = folio?.payments.reduce((sum, p) => sum + p.amount, 0) || reservation.advancePaid
  const balance = totalCharges - totalPayments

  const handleCheckOut = () => {
    if (balance > 0 && paymentAmount < balance) {
      toast.error('Payment amount must cover the full balance')
      return
    }

    if (balance > 0 && paymentAmount > 0) {
      setFolios((prev) => prev.map(f => 
        f.reservationId === reservation.id 
          ? {
              ...f,
              payments: [
                ...f.payments,
                {
                  id: generateId(),
                  folioId: f.id,
                  amount: paymentAmount,
                  method: paymentMethod,
                  status: 'paid' as const,
                  timestamp: Date.now(),
                  receivedBy: 'system'
                }
              ],
              balance: balance - paymentAmount,
              updatedAt: Date.now()
            }
          : f
      ))
    }

    setReservations((prev) => prev.map(r => 
      r.id === reservation.id 
        ? { ...r, status: 'checked-out', updatedAt: Date.now() }
        : r
    ))

    setRooms((prev) => prev.map(r => 
      r.id === reservation.roomId 
        ? { ...r, status: 'vacant-dirty' }
        : r
    ))

    toast.success('Guest checked out successfully')
    onOpenChange(false)
    setPaymentAmount(0)
  }

  return (
    <DialogAdapter open={open} onOpenChange={onOpenChange} size="lg" showAnimation={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check-Out Guest</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Guest Name</Label>
            <p className="text-lg font-semibold">
              {guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown Guest'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Room</Label>
              <p className="font-medium">{room?.roomNumber || 'N/A'}</p>
            </div>
            <div>
              <Label>Check-out Date</Label>
              <p className="font-medium">{formatDate(reservation.checkOutDate)}</p>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Total Charges:</span>
              <span className="font-semibold">{formatCurrency(totalCharges)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Payments:</span>
              <span className="font-semibold">{formatCurrency(totalPayments)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Balance Due:</span>
              <span className={balance > 0 ? 'text-destructive' : 'text-success'}>
                {formatCurrency(balance)}
              </span>
            </div>
          </div>

          {balance > 0 && (
            <>
              <div>
                <Label htmlFor="paymentAmount">Payment Amount</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  placeholder={balance.toFixed(2)}
                />
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <SelectTrigger id="paymentMethod">
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
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCheckOut}>
            Confirm Check-Out
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogAdapter>
  )
}
