import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  MagnifyingGlass, 
  UserPlus, 
  CalendarCheck, 
  CalendarX,
  CurrencyDollar,
  Key,
  Receipt,
  Eye
} from '@phosphor-icons/react'
import { type Guest, type Reservation, type Room, type Folio, type ExtraService, type ExtraServiceCategory, type FolioExtraService, type SystemUser } from '@/lib/types'
import { formatDate, formatCurrency, calculateNights } from '@/lib/helpers'
import { GuestDialog } from './GuestDialog'
import { ReservationDialog } from './ReservationDialog'
import { CheckInDialog } from './CheckInDialog'
import { CheckOutDialog } from './CheckOutDialog'
import { FolioDialog } from './FolioDialog'
import { ReservationDetailsDialog } from './ReservationDetailsDialog'

interface FrontOfficeProps {
  guests: Guest[]
  setGuests: (guests: Guest[] | ((prev: Guest[]) => Guest[])) => void
  reservations: Reservation[]
  setReservations: (reservations: Reservation[] | ((prev: Reservation[]) => Reservation[])) => void
  rooms: Room[]
  setRooms: (rooms: Room[] | ((prev: Room[]) => Room[])) => void
  folios: Folio[]
  setFolios: (folios: Folio[] | ((prev: Folio[]) => Folio[])) => void
  extraServices?: ExtraService[]
  serviceCategories?: ExtraServiceCategory[]
  folioExtraServices?: FolioExtraService[]
  setFolioExtraServices?: (services: FolioExtraService[] | ((prev: FolioExtraService[]) => FolioExtraService[])) => void
  currentUser?: SystemUser
}

export function FrontOffice({ 
  guests, 
  setGuests, 
  reservations, 
  setReservations,
  rooms,
  setRooms,
  folios,
  setFolios,
  extraServices,
  serviceCategories,
  folioExtraServices,
  setFolioExtraServices,
  currentUser
}: FrontOfficeProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [guestDialogOpen, setGuestDialogOpen] = useState(false)
  const [reservationDialogOpen, setReservationDialogOpen] = useState(false)
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false)
  const [checkOutDialogOpen, setCheckOutDialogOpen] = useState(false)
  const [folioDialogOpen, setFolioDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<Guest | undefined>()
  const [selectedReservation, setSelectedReservation] = useState<Reservation | undefined>()
  const [selectedFolio, setSelectedFolio] = useState<Folio | undefined>()

  const today = Date.now()
  const arrivalsToday = reservations.filter(r => {
    const checkIn = new Date(r.checkInDate).setHours(0, 0, 0, 0)
    const todayDate = new Date(today).setHours(0, 0, 0, 0)
    return checkIn === todayDate && r.status === 'confirmed'
  })

  const departurestoday = reservations.filter(r => {
    const checkOut = new Date(r.checkOutDate).setHours(0, 0, 0, 0)
    const todayDate = new Date(today).setHours(0, 0, 0, 0)
    return checkOut === todayDate && r.status === 'checked-in'
  })

  const inHouseGuests = reservations.filter(r => r.status === 'checked-in')

  const filteredGuests = guests.filter(g => 
    `${g.firstName} ${g.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.phone.includes(searchQuery)
  )

  const filteredReservations = reservations.filter(r => {
    const guest = guests.find(g => g.id === r.guestId)
    const room = rooms.find(rm => rm.id === r.roomId)
    return guest && (
      `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room?.roomNumber.includes(searchQuery)
    )
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'confirmed': 'default',
      'checked-in': 'secondary',
      'checked-out': 'outline',
      'cancelled': 'destructive',
      'no-show': 'destructive'
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const handleEditGuest = (guest: Guest) => {
    setSelectedGuest(guest)
    setGuestDialogOpen(true)
  }

  const handleNewGuest = () => {
    setSelectedGuest(undefined)
    setGuestDialogOpen(true)
  }

  const handleNewReservation = () => {
    setSelectedReservation(undefined)
    setReservationDialogOpen(true)
  }

  const handleEditReservation = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setReservationDialogOpen(true)
  }

  const handleCheckIn = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setCheckInDialogOpen(true)
  }

  const handleCheckOut = (reservation: Reservation) => {
    setSelectedReservation(reservation)
    setCheckOutDialogOpen(true)
  }

  const handleViewFolio = (reservation: Reservation) => {
    const folio = folios.find(f => f.reservationId === reservation.id)
    setSelectedFolio(folio)
    setSelectedReservation(reservation)
    setFolioDialogOpen(true)
  }

  const handleViewDetails = (reservation: Reservation) => {
    const guest = guests.find(g => g.id === reservation.guestId)
    setSelectedReservation(reservation)
    setSelectedGuest(guest)
    setDetailsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Front Office</h1>
          <p className="text-muted-foreground mt-1">Guest management and reservations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNewGuest}>
            <UserPlus size={20} className="mr-2" />
            New Guest
          </Button>
          <Button onClick={handleNewReservation}>
            <Plus size={20} className="mr-2" />
            New Reservation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Arrivals Today</h3>
            <CalendarCheck size={20} className="text-primary" />
          </div>
          <p className="text-3xl font-semibold">{arrivalsToday.length}</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Departures Today</h3>
            <CalendarX size={20} className="text-accent" />
          </div>
          <p className="text-3xl font-semibold">{departurestoday.length}</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">In-House</h3>
            <Key size={20} className="text-success" />
          </div>
          <p className="text-3xl font-semibold">{inHouseGuests.length}</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-secondary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Guests</h3>
            <UserPlus size={20} className="text-secondary" />
          </div>
          <p className="text-3xl font-semibold">{guests.length}</p>
        </Card>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="reservations">
          <TabsList className="mb-4">
            <TabsTrigger value="reservations">Reservations</TabsTrigger>
            <TabsTrigger value="arrivals">Arrivals Today</TabsTrigger>
            <TabsTrigger value="departures">Departures Today</TabsTrigger>
            <TabsTrigger value="guests">Guest Directory</TabsTrigger>
          </TabsList>

          <div className="mb-4">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search guests, rooms, or reservations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <TabsContent value="reservations" className="space-y-4">
            {filteredReservations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No reservations found
              </div>
            ) : (
              filteredReservations.map(reservation => {
                const guest = guests.find(g => g.id === reservation.guestId)
                const room = rooms.find(r => r.id === reservation.roomId)
                return (
                  <Card key={reservation.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown Guest'}
                          </h3>
                          {getStatusBadge(reservation.status)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Room</p>
                            <p className="font-medium">{room?.roomNumber || 'Not assigned'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Check-in</p>
                            <p className="font-medium">{formatDate(reservation.checkInDate)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Check-out</p>
                            <p className="font-medium">{formatDate(reservation.checkOutDate)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Amount</p>
                            <p className="font-medium">{formatCurrency(reservation.totalAmount)}</p>
                          </div>
                        </div>
                        {reservation.specialRequests && (
                          <div className="mt-2 text-sm">
                            <p className="text-muted-foreground">Special Requests</p>
                            <p>{reservation.specialRequests}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewDetails(reservation)}>
                          <Eye size={16} className="mr-1" />
                          View Details
                        </Button>
                        {reservation.status === 'confirmed' && (
                          <Button size="sm" onClick={() => handleCheckIn(reservation)}>
                            <CalendarCheck size={16} className="mr-1" />
                            Check In
                          </Button>
                        )}
                        {reservation.status === 'checked-in' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleViewFolio(reservation)}>
                              <Receipt size={16} className="mr-1" />
                              Folio
                            </Button>
                            <Button size="sm" onClick={() => handleCheckOut(reservation)}>
                              <CalendarX size={16} className="mr-1" />
                              Check Out
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleEditReservation(reservation)}>
                          Edit
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </TabsContent>

          <TabsContent value="arrivals" className="space-y-4">
            {arrivalsToday.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No arrivals scheduled for today
              </div>
            ) : (
              arrivalsToday.map(reservation => {
                const guest = guests.find(g => g.id === reservation.guestId)
                const room = rooms.find(r => r.id === reservation.roomId)
                return (
                  <Card key={reservation.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                          {guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown Guest'}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Room</p>
                            <p className="font-medium">{room?.roomNumber || 'Not assigned'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Nights</p>
                            <p className="font-medium">{calculateNights(reservation.checkInDate, reservation.checkOutDate)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Guests</p>
                            <p className="font-medium">{reservation.adults} adults, {reservation.children} children</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewDetails(reservation)}>
                          <Eye size={16} className="mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" onClick={() => handleCheckIn(reservation)}>
                          <CalendarCheck size={16} className="mr-1" />
                          Check In
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </TabsContent>

          <TabsContent value="departures" className="space-y-4">
            {departurestoday.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No departures scheduled for today
              </div>
            ) : (
              departurestoday.map(reservation => {
                const guest = guests.find(g => g.id === reservation.guestId)
                const room = rooms.find(r => r.id === reservation.roomId)
                const folio = folios.find(f => f.reservationId === reservation.id)
                return (
                  <Card key={reservation.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                          {guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown Guest'}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Room</p>
                            <p className="font-medium">{room?.roomNumber || 'Not assigned'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Charges</p>
                            <p className="font-medium">{formatCurrency(reservation.totalAmount)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Balance</p>
                            <p className="font-medium">{formatCurrency(folio?.balance || 0)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewDetails(reservation)}>
                          <Eye size={16} className="mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleViewFolio(reservation)}>
                          <Receipt size={16} className="mr-1" />
                          Folio
                        </Button>
                        <Button size="sm" onClick={() => handleCheckOut(reservation)}>
                          <CalendarX size={16} className="mr-1" />
                          Check Out
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </TabsContent>

          <TabsContent value="guests" className="space-y-4">
            {filteredGuests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No guests found
              </div>
            ) : (
              filteredGuests.map(guest => {
                const guestReservations = reservations.filter(r => r.guestId === guest.id)
                const activeReservation = guestReservations.find(r => r.status === 'checked-in')
                return (
                  <Card key={guest.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {guest.firstName} {guest.lastName}
                          </h3>
                          {activeReservation && <Badge variant="secondary">In-House</Badge>}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Email</p>
                            <p className="font-medium">{guest.email || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Phone</p>
                            <p className="font-medium">{guest.phone}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Stays</p>
                            <p className="font-medium">{guest.totalStays}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Loyalty Points</p>
                            <p className="font-medium">{guest.loyaltyPoints}</p>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleEditGuest(guest)}>
                        View Details
                      </Button>
                    </div>
                  </Card>
                )
              })
            )}
          </TabsContent>
        </Tabs>
      </Card>

      <GuestDialog
        open={guestDialogOpen}
        onOpenChange={setGuestDialogOpen}
        guest={selectedGuest}
        guests={guests}
        setGuests={setGuests}
      />

      <ReservationDialog
        open={reservationDialogOpen}
        onOpenChange={setReservationDialogOpen}
        reservation={selectedReservation}
        reservations={reservations}
        setReservations={setReservations}
        guests={guests}
        rooms={rooms}
      />

      <CheckInDialog
        open={checkInDialogOpen}
        onOpenChange={setCheckInDialogOpen}
        reservation={selectedReservation}
        reservations={reservations}
        setReservations={setReservations}
        rooms={rooms}
        setRooms={setRooms}
        folios={folios}
        setFolios={setFolios}
        guests={guests}
      />

      <CheckOutDialog
        open={checkOutDialogOpen}
        onOpenChange={setCheckOutDialogOpen}
        reservation={selectedReservation}
        reservations={reservations}
        setReservations={setReservations}
        rooms={rooms}
        setRooms={setRooms}
        folios={folios}
        setFolios={setFolios}
        guests={guests}
      />

      <FolioDialog
        open={folioDialogOpen}
        onOpenChange={setFolioDialogOpen}
        folio={selectedFolio}
        reservation={selectedReservation}
        folios={folios}
        setFolios={setFolios}
        guests={guests}
        extraServices={extraServices}
        serviceCategories={serviceCategories}
        folioExtraServices={folioExtraServices}
        setFolioExtraServices={setFolioExtraServices}
        currentUser={currentUser}
      />

      {selectedReservation && selectedGuest && (
        <ReservationDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          reservation={selectedReservation}
          guest={selectedGuest}
          room={rooms.find(r => r.id === selectedReservation.roomId)}
        />
      )}
    </div>
  )
}
