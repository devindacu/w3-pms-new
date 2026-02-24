import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DialogAdapter } from '@/components/adapters/DialogAdapter'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { type Reservation, type Guest, type Room } from '@/lib/types'
import { generateId, generateNumber, calculateNights, formatDate } from '@/lib/helpers'
import { checkBookingConflict, findAlternativeRooms, validateReservationDates } from '@/lib/bookingValidation'
import { Warning, CalendarX, CheckCircle, Calendar, Lightbulb } from '@phosphor-icons/react'
import { RoomAvailabilityCalendar } from './RoomAvailabilityCalendar'

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

  const [conflictCheck, setConflictCheck] = useState<{
    hasConflict: boolean
    conflictingReservations: Reservation[]
  }>({ hasConflict: false, conflictingReservations: [] })

  const [alternativeRooms, setAlternativeRooms] = useState<Array<{
    room: Room
    distance: number
    availableFrom: number
    availableTo: number
  }>>([])

  const [forceBook, setForceBook] = useState(false)

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
    setForceBook(false)
    setConflictCheck({ hasConflict: false, conflictingReservations: [] })
    setAlternativeRooms([])
  }, [reservation, open])

  useEffect(() => {
    if (formData.roomId && formData.checkInDate && formData.checkOutDate && formData.roomId !== 'no-room') {
      const checkIn = new Date(formData.checkInDate).getTime()
      const checkOut = new Date(formData.checkOutDate).getTime()

      if (checkOut > checkIn) {
        const conflict = checkBookingConflict(
          formData.roomId,
          checkIn,
          checkOut,
          reservations,
          reservation?.id
        )
        setConflictCheck(conflict)
        if (conflict.hasConflict) {
          setForceBook(false)
          // Find alternative rooms if there's a conflict
          const selectedRoom = rooms.find(r => r.id === formData.roomId)
          if (selectedRoom) {
            const alternatives = findAlternativeRooms(
              selectedRoom.roomType,
              checkIn,
              checkOut,
              rooms,
              reservations,
              5
            )
            setAlternativeRooms(alternatives)
          }
        } else {
          setAlternativeRooms([])
        }
      } else {
        setConflictCheck({ hasConflict: false, conflictingReservations: [] })
        setAlternativeRooms([])
      }
    } else {
      setConflictCheck({ hasConflict: false, conflictingReservations: [] })
      setAlternativeRooms([])
    }
  }, [formData.roomId, formData.checkInDate, formData.checkOutDate, reservations, reservation, rooms])

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

    if (conflictCheck.hasConflict && !forceBook) {
      toast.error('Booking conflict detected! Please review the warnings or choose a different room/dates.')
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

  const selectedRoom = rooms.find(r => r.id === formData.roomId)

  return (
    <DialogAdapter 
      open={open} 
      onOpenChange={onOpenChange}
      size="2xl"
      showAnimation={true}
    >
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{reservation ? 'Edit Reservation' : 'New Reservation'}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Booking Details</TabsTrigger>
            <TabsTrigger value="availability">
              <Calendar className="mr-2 h-4 w-4" />
              Availability Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">{/* Existing form content */}
            <div>
              <Label htmlFor="guestId">Guest *</Label>
              <Select value={formData.guestId} onValueChange={(value) => setFormData({ ...formData, guestId: value })}>
                <SelectTrigger id="guestId">
                  <SelectValue placeholder="Select guest" />
                </SelectTrigger>
                <SelectContent>
                  {guests.filter(guest => guest.id && guest.id.trim() !== '').map(guest => (
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
                <SelectTrigger 
                  id="roomId" 
                  className={conflictCheck.hasConflict ? 'border-destructive ring-destructive' : ''}
                >
                  <SelectValue placeholder="Select room (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-room">No Room Assigned</SelectItem>
                  {availableRooms.filter(room => room.id && room.id.trim() !== '').map(room => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.roomNumber} - {room.roomType} (LKR {room.baseRate}/night)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Room can be assigned later</p>
            </div>

            {conflictCheck.hasConflict && (
              <Alert variant="destructive" className="border-2">
                <Warning className="h-5 w-5" />
                <AlertTitle className="flex items-center gap-2">
                  <CalendarX className="h-4 w-4" />
                  Booking Conflict Detected!
                </AlertTitle>
                <AlertDescription className="space-y-3">
                  <p className="font-medium">
                    Room {selectedRoom?.roomNumber} is already booked for the selected dates:
                  </p>
                  <div className="space-y-2">
                    {conflictCheck.conflictingReservations.map((conflictRes) => {
                      const conflictGuest = guests.find(g => g.id === conflictRes.guestId)
                      return (
                        <div key={conflictRes.id} className="bg-destructive/10 border border-destructive/20 rounded-md p-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm">
                              {conflictGuest?.firstName} {conflictGuest?.lastName}
                            </p>
                            <Badge variant="destructive" className="text-xs">
                              {conflictRes.status}
                            </Badge>
                          </div>
                          <p className="text-xs">
                            <strong>Check-in:</strong> {formatDate(conflictRes.checkInDate)} • 
                            <strong className="ml-2">Check-out:</strong> {formatDate(conflictRes.checkOutDate)}
                          </p>
                          <p className="text-xs">
                            <strong>Guests:</strong> {conflictRes.adults} adults, {conflictRes.children} children
                          </p>
                          {conflictRes.specialRequests && (
                            <p className="text-xs italic">Note: {conflictRes.specialRequests}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Options to resolve:</p>
                    <ul className="text-xs space-y-1 list-disc list-inside">
                      <li>Select a different room</li>
                      <li>Choose different dates</li>
                      <li>Override conflict (requires authorization)</li>
                    </ul>
                    {!forceBook && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full mt-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => setForceBook(true)}
                      >
                        <Warning className="mr-2 h-4 w-4" />
                        Override & Force Book Anyway
                      </Button>
                    )}
                    {forceBook && (
                      <Alert className="bg-accent/10 border-accent">
                        <CheckCircle className="h-4 w-4 text-accent" />
                        <AlertDescription className="text-xs">
                          Override enabled. This booking will be created despite the conflict.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Alternative Room Suggestions */}
            {conflictCheck.hasConflict && alternativeRooms.length > 0 && (
              <Alert className="border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                <AlertTitle className="text-blue-900 dark:text-blue-100">
                  Alternative Rooms Available
                </AlertTitle>
                <AlertDescription className="space-y-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    The following rooms are available for your selected dates:
                  </p>
                  <div className="space-y-2">
                    {alternativeRooms.map(({ room }) => (
                      <div
                        key={room.id}
                        className="flex items-center justify-between bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-800 rounded-md p-3 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleRoomChange(room.id)}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">
                              Room {room.roomNumber} - {room.roomType}
                            </p>
                            {room.roomType !== rooms.find(r => r.id === formData.roomId)?.roomType && (
                              <Badge variant="secondary" className="text-xs">
                            {room.roomType === 'suite' || room.roomType === 'executive' ? 'Upgrade' : 'Alternative'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            LKR {room.baseRate}/night • Floor {room.floor} • Status: {room.status}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-blue-500 text-blue-600 hover:bg-blue-50"
                        >
                          Select
                        </Button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Click on any room to automatically select it for this reservation
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {!conflictCheck.hasConflict && formData.roomId !== 'no-room' && formData.checkInDate && formData.checkOutDate && (
              <Alert className="border-success bg-success/5">
                <CheckCircle className="h-5 w-5 text-success" />
                <AlertTitle className="text-success">Room Available</AlertTitle>
                <AlertDescription className="text-sm text-success">
                  No conflicts detected. Room {selectedRoom?.roomNumber} is available for the selected dates.
                </AlertDescription>
              </Alert>
            )}

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
            <Button 
              type="submit"
              variant={conflictCheck.hasConflict && !forceBook ? 'destructive' : 'default'}
              disabled={conflictCheck.hasConflict && !forceBook}
            >
              {conflictCheck.hasConflict && !forceBook ? (
                <>
                  <Warning className="mr-2 h-4 w-4" />
                  Conflict - Cannot Book
                </>
              ) : (
                <>
                  {reservation ? 'Update Reservation' : 'Create Reservation'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
          </TabsContent>

          <TabsContent value="availability" className="mt-4">
            <RoomAvailabilityCalendar
              rooms={rooms}
              reservations={reservations}
              selectedRoomId={formData.roomId !== 'no-room' ? formData.roomId : undefined}
              selectedCheckIn={formData.checkInDate ? new Date(formData.checkInDate).getTime() : undefined}
              selectedCheckOut={formData.checkOutDate ? new Date(formData.checkOutDate).getTime() : undefined}
            />
            <div className="mt-4 flex justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </DialogAdapter>
  )
}
