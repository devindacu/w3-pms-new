import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Bed, 
  CalendarBlank, 
  CurrencyDollar, 
  Clock,
  Users,
  MapPin,
  Phone,
  EnvelopeSimple,
  IdentificationCard,
  Note,
  Receipt,
  Info
} from '@phosphor-icons/react'
import { type Reservation, type Guest, type Room } from '@/lib/types'
import { formatDate, formatCurrency, calculateNights } from '@/lib/helpers'

interface ReservationDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: Reservation
  guest: Guest
  room?: Room
}

export function ReservationDetailsDialog({ 
  open, 
  onOpenChange, 
  reservation,
  guest,
  room
}: ReservationDetailsDialogProps) {
  const nights = calculateNights(reservation.checkInDate, reservation.checkOutDate)
  const balanceDue = reservation.totalAmount - reservation.advancePaid

  const getStatusColor = (status: string) => {
    const colors = {
      'confirmed': 'bg-primary/10 text-primary border-primary/20',
      'checked-in': 'bg-success/10 text-success border-success/20',
      'checked-out': 'bg-muted text-muted-foreground border-border',
      'cancelled': 'bg-destructive/10 text-destructive border-destructive/20',
      'no-show': 'bg-destructive/10 text-destructive border-destructive/20'
    }
    return colors[status as keyof typeof colors] || 'bg-muted text-muted-foreground'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      'confirmed': 'Confirmed',
      'checked-in': 'Checked In',
      'checked-out': 'Checked Out',
      'cancelled': 'Cancelled',
      'no-show': 'No Show'
    }
    return labels[status as keyof typeof labels] || status
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Receipt size={24} className="text-primary" />
              <span>Reservation Details</span>
            </div>
            <Badge className={`${getStatusColor(reservation.status)} px-3 py-1 text-sm font-medium border`}>
              {getStatusLabel(reservation.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <Card className="p-6 bg-muted/30">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Reservation Number</p>
                <p className="text-xl font-semibold font-mono">{reservation.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Created On</p>
                <p className="font-medium">{formatDate(reservation.createdAt)}</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <User size={20} className="text-primary" />
                <h3 className="text-lg font-semibold">Guest Information</h3>
              </div>
              <Separator className="mb-4" />
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Name</p>
                  <p className="text-lg font-semibold">{guest.firstName} {guest.lastName}</p>
                </div>
                {guest.email && (
                  <div className="flex items-center gap-2">
                    <EnvelopeSimple size={16} className="text-muted-foreground" />
                    <p className="text-sm">{guest.email}</p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-muted-foreground" />
                  <p className="text-sm">{guest.phone}</p>
                </div>
                {guest.nationality && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-muted-foreground" />
                    <p className="text-sm">{guest.nationality}</p>
                  </div>
                )}
                {guest.idNumber && (
                  <div className="flex items-center gap-2">
                    <IdentificationCard size={16} className="text-muted-foreground" />
                    <p className="text-sm">{guest.idType || 'ID'}: {guest.idNumber}</p>
                  </div>
                )}
                {guest.address && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Address</p>
                    <p className="text-sm">{guest.address}</p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bed size={20} className="text-primary" />
                <h3 className="text-lg font-semibold">Room Information</h3>
              </div>
              <Separator className="mb-4" />
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Room Number</p>
                  <p className="text-2xl font-semibold">{room?.roomNumber || 'Not Assigned'}</p>
                </div>
                {room && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Room Type</p>
                      <p className="font-medium capitalize">{room.roomType.replace('-', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Floor</p>
                      <p className="font-medium">{room.floor}</p>
                    </div>
                    {room.amenities.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Amenities</p>
                        <div className="flex flex-wrap gap-2">
                          {room.amenities.map((amenity, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarBlank size={20} className="text-primary" />
              <h3 className="text-lg font-semibold">Stay Details</h3>
            </div>
            <Separator className="mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Check-in Date</p>
                <div className="flex items-center gap-2">
                  <CalendarBlank size={16} className="text-primary" />
                  <p className="font-medium">{formatDate(reservation.checkInDate)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Check-out Date</p>
                <div className="flex items-center gap-2">
                  <CalendarBlank size={16} className="text-accent" />
                  <p className="font-medium">{formatDate(reservation.checkOutDate)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Number of Nights</p>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-muted-foreground" />
                  <p className="font-medium">{nights} {nights === 1 ? 'night' : 'nights'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Guests</p>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-muted-foreground" />
                  <p className="font-medium">
                    {reservation.adults} {reservation.adults === 1 ? 'Adult' : 'Adults'}
                    {reservation.children > 0 && `, ${reservation.children} ${reservation.children === 1 ? 'Child' : 'Children'}`}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CurrencyDollar size={20} className="text-primary" />
              <h3 className="text-lg font-semibold">Pricing & Payment</h3>
            </div>
            <Separator className="mb-4" />
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground">Rate per Night</p>
                <p className="font-semibold">{formatCurrency(reservation.ratePerNight)}</p>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <p className="text-muted-foreground">Number of Nights</p>
                <p className="font-medium">× {nights}</p>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-lg">
                <p className="font-medium">Subtotal</p>
                <p className="font-semibold">{formatCurrency(reservation.ratePerNight * nights)}</p>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center text-xl bg-muted/50 p-4 rounded-lg">
                <p className="font-semibold">Total Amount</p>
                <p className="font-bold text-primary">{formatCurrency(reservation.totalAmount)}</p>
              </div>
              <Separator className="my-4" />
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-muted-foreground">Advance Paid</p>
                  <p className="font-medium text-success">{formatCurrency(reservation.advancePaid)}</p>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <p className="font-semibold">Balance Due</p>
                  <p className={`font-bold ${balanceDue > 0 ? 'text-destructive' : 'text-success'}`}>
                    {formatCurrency(balanceDue)}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info size={20} className="text-primary" />
              <h3 className="text-lg font-semibold">Additional Information</h3>
            </div>
            <Separator className="mb-4" />
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Booking Source</p>
                <Badge variant="outline" className="capitalize">{reservation.source}</Badge>
              </div>
              {reservation.specialRequests && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Special Requests</p>
                  <Card className="p-4 bg-muted/30">
                    <div className="flex items-start gap-2">
                      <Note size={16} className="text-muted-foreground mt-0.5" />
                      <p className="text-sm">{reservation.specialRequests}</p>
                    </div>
                  </Card>
                </div>
              )}
              {guest.preferences && guest.preferences.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Guest Preferences</p>
                  <div className="flex flex-wrap gap-2">
                    {guest.preferences.map((pref, idx) => (
                      <Badge key={idx} variant="secondary">
                        {pref}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {guest.totalStays > 0 && (
            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <User size={20} className="text-primary" />
                <h3 className="text-lg font-semibold">Guest History</h3>
              </div>
              <Separator className="mb-4" />
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Stays</p>
                  <p className="text-2xl font-bold text-primary">{guest.totalStays}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-success">{formatCurrency(guest.totalSpent)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Loyalty Points</p>
                  <p className="text-2xl font-bold text-accent">{guest.loyaltyPoints}</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
