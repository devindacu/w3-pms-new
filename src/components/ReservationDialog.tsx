import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { type Reservation, type Guest, type Room } from '@/lib/types'
import { generateId, generateNumber, calculateNights } from '@/lib/helpers'

interface ReservationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation?: Reservation
  reservations: Reservation[]
  setReservations: (reservations: Reservation[] | ((prev: Reservation[]) => Reservation[])) => void
  guests: Guest[]
  rooms: Room[]
}

export function ReservationDialog({ 
  open, 
  onOpenChange, 
  reservation, 
  reservations, 
  setReservations,
  guests,
  rooms
}: ReservationDialogProps) {
  const [formData, setFormData] = useState({
    guestId: '',
    roomId: 'no-room',
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    children: 0,
    ratePerNight: 0,
    advancePaid: 0,
    source: 'direct',
    specialRequests: ''
  })

  useEffect(() => {
    if (reservation) {
      const checkIn = new Date(reservation.checkInDate)
      const checkOut = new Date(reservation.checkOutDate)
      setFormData({
        guestId: reservation.guestId,
        roomId: reservation.roomId || 'no-room',
        checkInDate: checkIn.toISOString().split('T')[0],
        checkOutDate: checkOut.toISOString().split('T')[0],
        adults: reservation.adults,
        children: reservation.children,
        ratePerNight: reservation.ratePerNight,
        advancePaid: reservation.advancePaid,
        source: reservation.source,
        specialRequests: reservation.specialRequests || ''
      })
    } else {
      setFormData({
        guestId: '',
        roomId: 'no-room',
        checkInDate: '',
        checkOutDate: '',
        adults: 1,
        children: 0,
        ratePerNight: 0,
        advancePaid: 0,
        source: 'direct',
        specialRequests: ''
      })
    }
  }, [reservation, open])

  const availableRooms = rooms.filter(r => 
    r.status === 'vacant-clean' || r.status === 'vacant-dirty' || r.id === reservation?.roomId
  )

  const handleRoomChange = (roomId: string) => {
    if (roomId === 'no-room') {
      setFormData({ 
        ...formData, 
        roomId: 'no-room',
        ratePerNight: 0
      })
    } else {
      const room = rooms.find(r => r.id === roomId)
      setFormData({ 
        ...formData, 
        roomId,
        ratePerNight: room?.baseRate || 0
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.guestId || !formData.checkInDate || !formData.checkOutDate) {
      toast.error('Please fill in all required fields')
      return
    }

    const checkIn = new Date(formData.checkInDate).getTime()
    const checkOut = new Date(formData.checkOutDate).getTime()

    if (checkOut <= checkIn) {
      toast.error('Check-out date must be after check-in date')
      return
    }

    const nights = calculateNights(checkIn, checkOut)
    const totalAmount = nights * formData.ratePerNight

    if (reservation) {
      setReservations((prev) => prev.map(r => 
        r.id === reservation.id 
          ? {
              ...r,
              guestId: formData.guestId,
              roomId: formData.roomId === 'no-room' ? undefined : formData.roomId,
              checkInDate: checkIn,
              checkOutDate: checkOut,
              adults: formData.adults,
              children: formData.children,
              ratePerNight: formData.ratePerNight,
              totalAmount,
              advancePaid: formData.advancePaid,
              source: formData.source,
              specialRequests: formData.specialRequests || undefined,
              updatedAt: Date.now()
            }
          : r
      ))
      toast.success('Reservation updated successfully')
    } else {
      const newReservation: Reservation = {
        id: generateId(),
        guestId: formData.guestId,
        roomId: formData.roomId === 'no-room' ? undefined : formData.roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        adults: formData.adults,
        children: formData.children,
        status: 'confirmed',
        ratePerNight: formData.ratePerNight,
        totalAmount,
        advancePaid: formData.advancePaid,
        source: formData.source,
        specialRequests: formData.specialRequests || undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: 'system'
      }
      setReservations((prev) => [...prev, newReservation])
      toast.success('Reservation created successfully')
    }

    onOpenChange(false)
  }

  const nights = formData.checkInDate && formData.checkOutDate
    ? calculateNights(new Date(formData.checkInDate).getTime(), new Date(formData.checkOutDate).getTime())
    : 0
  const totalAmount = nights * formData.ratePerNight

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{reservation ? 'Edit Reservation' : 'New Reservation'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="guestId">Guest *</Label>
              <Select value={formData.guestId} onValueChange={(value) => setFormData({ ...formData, guestId: value })}>
                <SelectTrigger id="guestId">
                  <SelectValue placeholder="Select guest" />
                </SelectTrigger>
                <SelectContent>
                  {guests.map(guest => (
                    <SelectItem key={guest.id} value={guest.id}>
                      {guest.firstName} {guest.lastName} - {guest.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="roomId">Room</Label>
              <Select value={formData.roomId} onValueChange={handleRoomChange}>
                <SelectTrigger id="roomId">
                  <SelectValue placeholder="Select room (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-room">No Room Assigned</SelectItem>
                  {availableRooms.map(room => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.roomNumber} - {room.roomType} (LKR {room.baseRate}/night)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Room can be assigned later</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkInDate">Check-in Date *</Label>
                <Input
                  id="checkInDate"
                  type="date"
                  value={formData.checkInDate}
                  onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="checkOutDate">Check-out Date *</Label>
                <Input
                  id="checkOutDate"
                  type="date"
                  value={formData.checkOutDate}
                  onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="adults">Adults</Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  value={formData.adults}
                  onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="children">Children</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  value={formData.children}
                  onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="ratePerNight">Rate/Night (LKR)</Label>
                <Input
                  id="ratePerNight"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.ratePerNight}
                  onChange={(e) => setFormData({ ...formData, ratePerNight: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="advancePaid">Advance (LKR)</Label>
                <Input
                  id="advancePaid"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.advancePaid}
                  onChange={(e) => setFormData({ ...formData, advancePaid: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="source">Booking Source</Label>
              <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                <SelectTrigger id="source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Direct</SelectItem>
                  <SelectItem value="booking.com">Booking.com</SelectItem>
                  <SelectItem value="expedia">Expedia</SelectItem>
                  <SelectItem value="airbnb">Airbnb</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="walk-in">Walk-in</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="specialRequests">Special Requests</Label>
              <Textarea
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                rows={3}
                placeholder="Early check-in, extra pillows, etc."
              />
            </div>

            {nights > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nights</p>
                    <p className="text-lg font-semibold">{nights}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-lg font-semibold">${totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Balance Due</p>
                    <p className="text-lg font-semibold">${(totalAmount - formData.advancePaid).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {reservation ? 'Update Reservation' : 'Create Reservation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
