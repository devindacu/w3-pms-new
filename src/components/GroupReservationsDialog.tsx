import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash, Users, Calendar } from '@phosphor-icons/react'
import { type Room, type Reservation, type Guest } from '@/lib/types'
import { generateId, formatCurrency, formatDate } from '@/lib/helpers'
import { toast } from 'sonner'

interface GroupReservation {
  id: string
  guestName: string
  roomType: string
  roomId?: string
  adults: number
  children: number
  specialRequests?: string
}

interface GroupReservationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rooms: Room[]
  onSave: (reservations: Reservation[], groupName: string, groupId: string) => void
}

export function GroupReservationsDialog({
  open,
  onOpenChange,
  rooms,
  onSave
}: GroupReservationsDialogProps) {
  const [groupName, setGroupName] = useState('')
  const [groupType, setGroupType] = useState<'corporate' | 'tour' | 'wedding' | 'conference' | 'other'>('corporate')
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [groupBookings, setGroupBookings] = useState<GroupReservation[]>([])
  const [masterBilling, setMasterBilling] = useState(true)
  const [groupNotes, setGroupNotes] = useState('')
  const [depositAmount, setDepositAmount] = useState(0)
  const [depositPaid, setDepositPaid] = useState(false)

  const availableRooms = rooms.filter(room => room.status === 'vacant-clean' || room.status === 'vacant-dirty')
  const roomTypes = Array.from(new Set(availableRooms.map(r => r.roomType)))

  const addBooking = () => {
    const newBooking: GroupReservation = {
      id: generateId(),
      guestName: '',
      roomType: roomTypes[0] || '',
      adults: 2,
      children: 0
    }
    setGroupBookings([...groupBookings, newBooking])
  }

  const removeBooking = (id: string) => {
    setGroupBookings(groupBookings.filter(b => b.id !== id))
  }

  const updateBooking = (id: string, field: keyof GroupReservation, value: any) => {
    setGroupBookings(groupBookings.map(b => 
      b.id === id ? { ...b, [field]: value } : b
    ))
  }

  const assignRoom = (bookingId: string, roomType: string) => {
    const availableRoomsOfType = availableRooms.filter(r => r.roomType === roomType && !groupBookings.some(b => b.roomId === r.id))
    if (availableRoomsOfType.length > 0) {
      updateBooking(bookingId, 'roomId', availableRoomsOfType[0].id)
    }
  }

  const calculateTotalAmount = () => {
    if (!checkInDate || !checkOutDate) return 0
    const nights = Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))
    return groupBookings.reduce((total, booking) => {
      const room = rooms.find(r => r.id === booking.roomId)
      return total + (room ? room.baseRate * nights : 0)
    }, 0)
  }

  const handleSave = () => {
    if (!groupName || !checkInDate || !checkOutDate || groupBookings.length === 0) {
      toast.error('Please fill all required fields and add at least one booking')
      return
    }

    if (groupBookings.some(b => !b.guestName || !b.roomId)) {
      toast.error('Please complete all booking details and assign rooms')
      return
    }

    const groupId = generateId()
    const nights = Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))

    const reservations: Reservation[] = groupBookings.map((booking, index) => {
      const room = rooms.find(r => r.id === booking.roomId)
      const guestId = generateId()
      
      return {
        id: generateId(),
        guestId,
        roomId: booking.roomId,
        checkInDate: new Date(checkInDate).getTime(),
        checkOutDate: new Date(checkOutDate).getTime(),
        adults: booking.adults,
        children: booking.children,
        totalAmount: room ? room.baseRate * nights : 0,
        ratePerNight: room ? room.baseRate : 0,
        advancePaid: depositPaid ? depositAmount / groupBookings.length : 0,
        status: 'confirmed' as const,
        specialRequests: booking.specialRequests,
        source: 'group',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: 'system'
      }
    })

    onSave(reservations, groupName, groupId)
    toast.success(`Group reservation created for ${groupBookings.length} rooms`)
    handleReset()
    onOpenChange(false)
  }

  const handleReset = () => {
    setGroupName('')
    setGroupType('corporate')
    setCheckInDate('')
    setCheckOutDate('')
    setContactPerson('')
    setContactEmail('')
    setContactPhone('')
    setGroupBookings([])
    setMasterBilling(true)
    setGroupNotes('')
    setDepositAmount(0)
    setDepositPaid(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size={24} />
            Create Group Reservation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Group Name *</Label>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g., ABC Corporation Annual Retreat"
              />
            </div>

            <div>
              <Label>Group Type *</Label>
              <Select value={groupType} onValueChange={(value: any) => setGroupType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corporate">Corporate</SelectItem>
                  <SelectItem value="tour">Tour Group</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Check-In Date *</Label>
              <Input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
              />
            </div>

            <div>
              <Label>Check-Out Date *</Label>
              <Input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                min={checkInDate}
              />
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Contact Person</Label>
                <Input
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Full Name"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+94 XX XXX XXXX"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Room Bookings ({groupBookings.length})</h3>
              <Button onClick={addBooking} size="sm">
                <Plus size={16} className="mr-1" />
                Add Booking
              </Button>
            </div>

            {groupBookings.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                <Users size={48} className="mx-auto mb-3 opacity-50" />
                <p>No bookings added yet</p>
                <p className="text-sm">Click "Add Booking" to start</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {groupBookings.map((booking, index) => (
                  <Card key={booking.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div>
                          <Label className="text-xs">Guest Name *</Label>
                          <Input
                            value={booking.guestName}
                            onChange={(e) => updateBooking(booking.id, 'guestName', e.target.value)}
                            placeholder="Guest Name"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Room Type *</Label>
                          <Select
                            value={booking.roomType}
                            onValueChange={(value) => {
                              updateBooking(booking.id, 'roomType', value)
                              assignRoom(booking.id, value)
                            }}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {roomTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Room Assigned</Label>
                          <div className="mt-1">
                            {booking.roomId ? (
                              <Badge variant="outline">
                                {rooms.find(r => r.id === booking.roomId)?.roomNumber}
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Not Assigned</Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Adults</Label>
                          <Input
                            type="number"
                            min="1"
                            value={booking.adults}
                            onChange={(e) => updateBooking(booking.id, 'adults', parseInt(e.target.value))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Children</Label>
                          <Input
                            type="number"
                            min="0"
                            value={booking.children}
                            onChange={(e) => updateBooking(booking.id, 'children', parseInt(e.target.value))}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeBooking(booking.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Master Billing</Label>
              <Select value={masterBilling ? 'yes' : 'no'} onValueChange={(v) => setMasterBilling(v === 'yes')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes - One invoice for entire group</SelectItem>
                  <SelectItem value="no">No - Individual invoices per room</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Group Deposit</Label>
              <Input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="depositPaid"
                  checked={depositPaid}
                  onChange={(e) => setDepositPaid(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="depositPaid" className="text-sm">Deposit Paid</Label>
              </div>
            </div>

            <div className="md:col-span-2">
              <Label>Group Notes</Label>
              <Textarea
                value={groupNotes}
                onChange={(e) => setGroupNotes(e.target.value)}
                placeholder="Any special arrangements, meal plans, or notes for the group..."
                rows={3}
              />
            </div>
          </div>

          <Card className="p-4 bg-muted/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Rooms</p>
                <p className="text-lg font-semibold">{groupBookings.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Guests</p>
                <p className="text-lg font-semibold">
                  {groupBookings.reduce((sum, b) => sum + b.adults + b.children, 0)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Nights</p>
                <p className="text-lg font-semibold">
                  {checkInDate && checkOutDate 
                    ? Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))
                    : 0}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Estimated Total</p>
                <p className="text-lg font-semibold">{formatCurrency(calculateTotalAmount())}</p>
              </div>
            </div>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Create Group Reservation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
