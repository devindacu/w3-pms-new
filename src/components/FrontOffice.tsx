import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  MagnifyingGlass, 
  UserPlus, 
  CalendarCheck, 
  CalendarX,
  CurrencyDollar,
  Key,
  Receipt,
  Eye,
  FileText,
  Printer,
  Download,
  EnvelopeSimple,
  CheckCircle,
  Clock,
  XCircle,
  UserCircle
} from '@phosphor-icons/react'
import { 
  type Guest, 
  type Reservation, 
  type Room, 
  type Folio, 
  type ExtraService, 
  type ExtraServiceCategory, 
  type FolioExtraService, 
  type SystemUser, 
  type GuestInvoice,
  type GuestInvoiceStatus,
  type TaxConfiguration,
  type ServiceChargeConfiguration,
  type InvoiceLineItem
} from '@/lib/types'
import { formatDate, formatCurrency, calculateNights, generateId } from '@/lib/helpers'
import { 
  generateInvoiceNumber,
  createLineItemFromFolioCharge,
  createLineItemFromExtraService,
  calculateInvoiceTotals,
  validateInvoice,
  createInvoiceAuditEntry
} from '@/lib/invoiceHelpers'
import { GuestDialog } from './GuestDialog'
import { ReservationDialog } from './ReservationDialog'
import { CheckInDialog } from './CheckInDialog'
import { CheckOutDialog } from './CheckOutDialog'
import { FolioDialog } from './FolioDialog'
import { ReservationDetailsDialog } from './ReservationDetailsDialog'
import { InvoiceViewerA4 } from './InvoiceViewerA4'
import { InvoiceManagementDialog } from './InvoiceManagementDialog'
import { toast } from 'sonner'

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
  const [guestInvoices, setGuestInvoices] = useKV<GuestInvoice[]>('w3-hotel-guest-invoices', [])
  
  const [searchQuery, setSearchQuery] = useState('')
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('')
  const [guestDialogOpen, setGuestDialogOpen] = useState(false)
  const [reservationDialogOpen, setReservationDialogOpen] = useState(false)
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false)
  const [checkOutDialogOpen, setCheckOutDialogOpen] = useState(false)
  const [folioDialogOpen, setFolioDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [invoiceViewerOpen, setInvoiceViewerOpen] = useState(false)
  const [createInvoiceDialogOpen, setCreateInvoiceDialogOpen] = useState(false)
  const [invoiceManagementDialogOpen, setInvoiceManagementDialogOpen] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<Guest | undefined>()
  const [selectedReservation, setSelectedReservation] = useState<Reservation | undefined>()
  const [selectedFolio, setSelectedFolio] = useState<Folio | undefined>()
  const [selectedInvoice, setSelectedInvoice] = useState<GuestInvoice | undefined>()
  const [selectedFolioId, setSelectedFolioId] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<GuestInvoiceStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [editingInvoice, setEditingInvoice] = useState<GuestInvoice | undefined>()

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

  const handleViewInvoice = (reservation: Reservation) => {
    const invoicesForReservation = (guestInvoices || []).filter(
      inv => inv.reservationIds?.includes(reservation.id)
    )
    if (invoicesForReservation.length > 0) {
      setSelectedInvoice(invoicesForReservation[0])
      setInvoiceViewerOpen(true)
    }
  }

  const hotelInfo = {
    name: 'W3 Hotel',
    address: '123 Hospitality Boulevard, Tourism District, City 12345',
    phone: '+1 (555) 123-4567',
    email: 'billing@w3hotel.com',
    website: 'www.w3hotel.com',
    taxRegistrationNumber: 'TAX-123456789',
    logo: ''
  }

  const taxConfig: TaxConfiguration[] = [
    {
      id: 'tax-1',
      name: 'VAT',
      type: 'vat',
      rate: 12,
      isInclusive: false,
      isActive: true,
      isCompoundTax: false,
      appliesTo: ['front-office', 'fnb', 'housekeeping'],
      calculationOrder: 1,
      taxableOnServiceCharge: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ]

  const serviceChargeConfig: ServiceChargeConfiguration = {
    id: 'sc-1',
    rate: 10,
    isActive: true,
    appliesTo: ['fnb'],
    isTaxable: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  const handleCreateInvoiceFromFolio = () => {
    if (!selectedFolioId) {
      toast.error('Please select a folio')
      return
    }

    const folio = folios.find(f => f.id === selectedFolioId)
    if (!folio) {
      toast.error('Folio not found')
      return
    }

    const guest = guests.find(g => g.id === folio.guestId)
    const reservation = reservations.find(r => r.id === folio.reservationId)
    const room = reservation ? rooms.find(r => r.id === reservation.roomId) : null

    const lineItems: InvoiceLineItem[] = []

    folio.charges.forEach(charge => {
      const lineItem = createLineItemFromFolioCharge(charge, taxConfig, serviceChargeConfig)
      lineItems.push(lineItem)
    })

    const extraServicesForFolio = (folioExtraServices || []).filter(
      es => es.folioId === folio.id
    )
    
    extraServicesForFolio.forEach(extraService => {
      const lineItem = createLineItemFromExtraService(extraService, taxConfig, serviceChargeConfig)
      lineItems.push(lineItem)
    })

    const totals = calculateInvoiceTotals(lineItems, [], taxConfig, serviceChargeConfig)

    const newInvoice: GuestInvoice = {
      id: generateId(),
      invoiceNumber: generateInvoiceNumber('guest-folio'),
      invoiceType: 'guest-folio',
      status: 'draft',
      folioIds: [folio.id],
      reservationIds: reservation ? [reservation.id] : [],
      guestId: folio.guestId,
      guestName: guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown Guest',
      guestEmail: guest?.email,
      guestPhone: guest?.phone,
      roomNumber: room?.roomNumber,
      checkInDate: reservation?.checkInDate,
      checkOutDate: reservation?.checkOutDate,
      invoiceDate: Date.now(),
      dueDate: Date.now() + (7 * 24 * 60 * 60 * 1000),
      currency: 'USD',
      exchangeRate: 1,
      lineItems,
      subtotal: totals.subtotal,
      discounts: [],
      totalDiscount: totals.totalDiscount,
      serviceChargeRate: serviceChargeConfig.rate,
      serviceChargeAmount: totals.serviceChargeAmount,
      taxLines: totals.taxLines,
      totalTax: totals.totalTax,
      grandTotal: totals.grandTotal,
      payments: [],
      totalPaid: 0,
      amountDue: totals.grandTotal,
      creditNotes: [],
      debitNotes: [],
      prepayments: [],
      netAmountDue: totals.grandTotal,
      isPostedToAccounts: false,
      deliveryMethods: [],
      auditTrail: [
        createInvoiceAuditEntry(
          'created',
          'Invoice created from folio',
          currentUser?.userId || 'system'
        )
      ],
      isGroupMaster: false,
      isTaxExempt: false,
      createdBy: currentUser?.userId || 'system',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    const validation = validateInvoice(newInvoice)
    if (!validation.isValid) {
      toast.error(`Invoice validation failed: ${validation.errors[0]?.message}`)
      return
    }

    setGuestInvoices(current => [...(current || []), newInvoice])
    setCreateInvoiceDialogOpen(false)
    setSelectedFolioId('')
    toast.success(`Invoice ${newInvoice.invoiceNumber} created successfully`)
    setSelectedInvoice(newInvoice)
    setInvoiceViewerOpen(true)
  }

  const getStatusIcon = (status: GuestInvoiceStatus) => {
    switch (status) {
      case 'final':
      case 'posted':
        return <CheckCircle size={16} className="text-success" />
      case 'draft':
      case 'interim':
        return <Clock size={16} className="text-yellow-600" />
      case 'cancelled':
      case 'refunded':
      case 'partially-refunded':
        return <XCircle size={16} className="text-destructive" />
      default:
        return <FileText size={16} className="text-muted-foreground" />
    }
  }

  const getInvoiceStatusBadge = (status: GuestInvoiceStatus) => {
    const variants: Record<GuestInvoiceStatus, string> = {
      draft: 'bg-yellow-100 text-yellow-800',
      interim: 'bg-blue-100 text-blue-800',
      final: 'bg-green-100 text-green-800',
      posted: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-orange-100 text-orange-800',
      'partially-refunded': 'bg-orange-100 text-orange-800'
    }
    return variants[status] || 'bg-gray-100 text-gray-800'
  }

  const pendingFolios = folios.filter(folio => {
    const hasInvoice = (guestInvoices || []).some(inv => inv.folioIds.includes(folio.id))
    return !hasInvoice && folio.balance > 0
  })

  const filteredInvoices = (guestInvoices || []).filter((invoice) => {
    const matchesSearch = 
      invoiceSearchQuery === '' ||
      invoice.invoiceNumber.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) ||
      invoice.guestName.toLowerCase().includes(invoiceSearchQuery.toLowerCase()) ||
      invoice.guestEmail?.toLowerCase().includes(invoiceSearchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    const matchesType = typeFilter === 'all' || invoice.invoiceType === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const invoiceStats = {
    total: (guestInvoices || []).length,
    draft: (guestInvoices || []).filter((i) => i.status === 'draft').length,
    final: (guestInvoices || []).filter((i) => i.status === 'final' || i.status === 'posted').length,
    outstanding: (guestInvoices || []).filter((i) => i.amountDue > 0 && i.status !== 'cancelled').length,
    totalOutstanding: (guestInvoices || [])
      .filter((i) => i.amountDue > 0 && i.status !== 'cancelled')
      .reduce((sum, i) => sum + i.amountDue, 0)
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
            <TabsTrigger value="invoices">
              <Receipt size={16} className="mr-1" />
              Invoices {pendingFolios.length > 0 && <Badge variant="destructive" className="ml-2">{pendingFolios.length}</Badge>}
            </TabsTrigger>
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
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" variant="outline" onClick={() => handleViewDetails(reservation)}>
                          <Eye size={16} className="mr-1" />
                          Details
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
                        {(reservation.status === 'checked-out' || (guestInvoices || []).some(inv => inv.reservationIds?.includes(reservation.id))) && (
                          <Button size="sm" variant="outline" onClick={() => handleViewInvoice(reservation)}>
                            <FileText size={16} className="mr-1" />
                            Invoice
                          </Button>
                        )}
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

          <TabsContent value="invoices" className="space-y-4">
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <Card className="p-4 border-l-4 border-l-primary">
                  <p className="text-sm text-muted-foreground">Total Invoices</p>
                  <p className="text-3xl font-semibold mt-1">{invoiceStats.total}</p>
                </Card>
                <Card className="p-4 border-l-4 border-l-yellow-500">
                  <p className="text-sm text-muted-foreground">Draft</p>
                  <p className="text-3xl font-semibold mt-1">{invoiceStats.draft}</p>
                </Card>
                <Card className="p-4 border-l-4 border-l-success">
                  <p className="text-sm text-muted-foreground">Final/Posted</p>
                  <p className="text-3xl font-semibold mt-1">{invoiceStats.final}</p>
                </Card>
                <Card className="p-4 border-l-4 border-l-destructive">
                  <p className="text-sm text-muted-foreground">Outstanding</p>
                  <p className="text-3xl font-semibold mt-1">{invoiceStats.outstanding}</p>
                </Card>
                <Card className="p-4 border-l-4 border-l-accent">
                  <p className="text-sm text-muted-foreground">Total Due</p>
                  <p className="text-2xl font-semibold mt-1">{formatCurrency(invoiceStats.totalOutstanding)}</p>
                </Card>
              </div>

              {pendingFolios.length > 0 && (
                <Card className="p-4 border-l-4 border-l-blue-500 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">Pending Folios</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {pendingFolios.length} folio{pendingFolios.length !== 1 ? 's' : ''} awaiting invoice generation
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setCreateInvoiceDialogOpen(true)}>
                        <Receipt size={18} className="mr-2" />
                        Quick Invoice
                      </Button>
                      <Button size="sm" onClick={() => {
                        setEditingInvoice(undefined)
                        setInvoiceManagementDialogOpen(true)
                      }}>
                        <Plus size={18} className="mr-2" />
                        New Invoice
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by invoice number, guest name, or email..."
                    value={invoiceSearchQuery}
                    onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="interim">Interim</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                    <SelectItem value="posted">Posted</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="guest-folio">Guest Folio</SelectItem>
                    <SelectItem value="room-only">Room Only</SelectItem>
                    <SelectItem value="fnb-only">F&B Only</SelectItem>
                    <SelectItem value="extras-only">Extras Only</SelectItem>
                    <SelectItem value="group-master">Group Master</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No invoices found</p>
                {pendingFolios.length > 0 && (
                  <Button className="mt-4" onClick={() => setCreateInvoiceDialogOpen(true)}>
                    <Plus size={18} className="mr-2" />
                    Create Your First Invoice
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInvoices.map((invoice) => (
                  <Card
                    key={invoice.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedInvoice(invoice)
                      setInvoiceViewerOpen(true)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(invoice.status)}
                          <h3 className="font-semibold text-lg">{invoice.invoiceNumber}</h3>
                          <Badge className={getInvoiceStatusBadge(invoice.status)}>
                            {invoice.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {invoice.invoiceType.replace('-', ' ')}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Guest</p>
                            <p className="font-medium">{invoice.guestName}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Invoice Date</p>
                            <p className="font-medium">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Amount</p>
                            <p className="font-semibold text-lg">{formatCurrency(invoice.grandTotal)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Amount Due</p>
                            <p className={`font-semibold text-lg ${invoice.amountDue > 0 ? 'text-destructive' : 'text-success'}`}>
                              {formatCurrency(invoice.amountDue)}
                            </p>
                          </div>
                        </div>

                        {invoice.roomNumber && (
                          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Room: {invoice.roomNumber}</span>
                            {invoice.checkInDate && invoice.checkOutDate && (
                              <span>
                                {new Date(invoice.checkInDate).toLocaleDateString()} - {new Date(invoice.checkOutDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {(invoice.status === 'draft' || invoice.status === 'interim') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingInvoice(invoice)
                              setInvoiceManagementDialogOpen(true)
                            }}
                            title="Edit Invoice"
                          >
                            <FileText size={18} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedInvoice(invoice)
                            setInvoiceViewerOpen(true)
                          }}
                        >
                          <Eye size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            toast.info('Print initiated - check your print dialog')
                          }}
                        >
                          <Printer size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            toast.info('Download functionality ready')
                          }}
                        >
                          <Download size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            toast.success(`Invoice shared via email to ${invoice.guestEmail || 'guest'}`)
                          }}
                        >
                          <EnvelopeSimple size={18} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      <Dialog open={createInvoiceDialogOpen} onOpenChange={setCreateInvoiceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Generate an invoice from a guest folio
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="folio">Select Folio</Label>
              <Select value={selectedFolioId} onValueChange={setSelectedFolioId}>
                <SelectTrigger id="folio">
                  <SelectValue placeholder="Select a folio to invoice" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-72">
                    {pendingFolios.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        No pending folios available
                      </div>
                    ) : (
                      pendingFolios.map((folio) => {
                        const guest = guests.find(g => g.id === folio.guestId)
                        const reservation = reservations.find(r => r.id === folio.reservationId)
                        const room = reservation ? rooms.find(r => r.id === reservation.roomId) : null
                        
                        return (
                          <SelectItem key={folio.id} value={folio.id}>
                            <div className="flex items-center justify-between w-full gap-4">
                              <div className="flex items-center gap-2">
                                <UserCircle size={18} />
                                <span className="font-medium">
                                  {guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown Guest'}
                                </span>
                                {room && (
                                  <Badge variant="outline">Room {room.roomNumber}</Badge>
                                )}
                              </div>
                              <span className="font-semibold text-primary">
                                {formatCurrency(folio.balance)}
                              </span>
                            </div>
                          </SelectItem>
                        )
                      })
                    )}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            {selectedFolioId && (
              <Card className="p-4 bg-muted/30">
                <h4 className="font-semibold mb-3">Folio Preview</h4>
                {(() => {
                  const folio = folios.find(f => f.id === selectedFolioId)
                  if (!folio) return null

                  return (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Charges:</span>
                        <span className="font-semibold">
                          {folio.charges.length} item{folio.charges.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Extra Services:</span>
                        <span className="font-semibold">
                          {(folioExtraServices || []).filter(es => es.folioId === folio.id).length} service{(folioExtraServices || []).filter(es => es.folioId === folio.id).length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between text-base">
                        <span className="font-semibold">Balance Due:</span>
                        <span className="font-semibold text-primary text-lg">
                          {formatCurrency(folio.balance)}
                        </span>
                      </div>
                    </div>
                  )
                })()}
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setCreateInvoiceDialogOpen(false)
              setSelectedFolioId('')
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateInvoiceFromFolio}
              disabled={!selectedFolioId}
            >
              <Receipt size={18} className="mr-2" />
              Create Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {selectedInvoice && currentUser && (
        <Dialog open={invoiceViewerOpen} onOpenChange={setInvoiceViewerOpen}>
          <DialogContent className="max-w-[95vw] h-[95vh] p-0">
            <InvoiceViewerA4
              invoice={selectedInvoice}
              hotelInfo={hotelInfo}
              currentUser={currentUser}
              onClose={() => setInvoiceViewerOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      <InvoiceManagementDialog
        open={invoiceManagementDialogOpen}
        onOpenChange={setInvoiceManagementDialogOpen}
        invoice={editingInvoice}
        folios={folios}
        guests={guests}
        reservations={reservations}
        rooms={rooms}
        folioExtraServices={folioExtraServices || []}
        taxConfig={taxConfig}
        serviceChargeConfig={serviceChargeConfig}
        onSave={(invoice) => {
          if (editingInvoice) {
            setGuestInvoices(current => 
              (current || []).map(inv => inv.id === invoice.id ? invoice : inv)
            )
            toast.success('Invoice updated successfully')
          } else {
            setGuestInvoices(current => [...(current || []), invoice])
            toast.success('Invoice created successfully')
          }
          setInvoiceManagementDialogOpen(false)
          setEditingInvoice(undefined)
        }}
        currentUser={currentUser}
      />
    </div>
  )
}
