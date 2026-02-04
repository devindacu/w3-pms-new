import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DialogAdapter } from '@/components/adapters/DialogAdapter'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { type Reservation, type Room, type Folio, type Guest } from '@/lib/types'
import { formatDate, formatCurrency, generateId } from '@/lib/helpers'

interface CheckInDialogProps {
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

export function CheckInDialog({ 
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
}: CheckInDialogProps) {
  if (!reservation) return null

  const guest = guests.find(g => g.id === reservation.guestId)
  const room = rooms.find(r => r.id === reservation.roomId)

  const handleCheckIn = () => {
    if (!reservation.roomId) {
      toast.error('Please assign a room before check-in')
      return
    }

    setReservations((prev) => prev.map(r => 
      r.id === reservation.id 
        ? { ...r, status: 'checked-in', updatedAt: Date.now() }
        : r
    ))

    setRooms((prev) => prev.map(r => 
      r.id === reservation.roomId 
        ? { ...r, status: 'occupied-clean' }
        : r
    ))

    const existingFolio = folios.find(f => f.reservationId === reservation.id)
    if (!existingFolio) {
      const newFolio: Folio = {
        id: generateId(),
        reservationId: reservation.id,
        guestId: reservation.guestId,
        charges: [
          {
            id: generateId(),
            folioId: '',
            description: 'Room Charges',
            amount: reservation.ratePerNight,
            quantity: Math.ceil((reservation.checkOutDate - reservation.checkInDate) / (1000 * 60 * 60 * 24)),
            department: 'front-office',
            timestamp: Date.now(),
            postedBy: 'system'
          }
        ],
        payments: reservation.advancePaid > 0 ? [
          {
            id: generateId(),
            folioId: '',
            amount: reservation.advancePaid,
            method: 'card',
            status: 'paid',
            timestamp: Date.now(),
            receivedBy: 'system'
          }
        ] : [],
        balance: reservation.totalAmount - reservation.advancePaid,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      setFolios((prev) => [...prev, newFolio])
    }

    toast.success('Guest checked in successfully')
    onOpenChange(false)
  }

  return (
    <DialogAdapter open={open} onOpenChange={onOpenChange} size="lg" showAnimation={true}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check-In Guest</DialogTitle>
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
              <p className="font-medium">{room?.roomNumber || 'Not assigned'}</p>
            </div>
            <div>
              <Label>Room Type</Label>
              <p className="font-medium capitalize">{room?.roomType || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Check-in Date</Label>
              <p className="font-medium">{formatDate(reservation.checkInDate)}</p>
            </div>
            <div>
              <Label>Check-out Date</Label>
              <p className="font-medium">{formatDate(reservation.checkOutDate)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Total Amount</Label>
              <p className="font-medium">{formatCurrency(reservation.totalAmount)}</p>
            </div>
            <div>
              <Label>Advance Paid</Label>
              <p className="font-medium">{formatCurrency(reservation.advancePaid)}</p>
            </div>
          </div>

          <div>
            <Label>Balance Due</Label>
            <p className="text-xl font-bold text-primary">
              {formatCurrency(reservation.totalAmount - reservation.advancePaid)}
            </p>
          </div>

          {reservation.specialRequests && (
            <div>
              <Label>Special Requests</Label>
              <p className="text-sm">{reservation.specialRequests}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCheckIn}>
            Confirm Check-In
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogAdapter>
  )
}
