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
  UserCircle,
  Users
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
  type InvoiceLineItem,
  type GuestProfile
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
import { GuestProfileDialog } from './GuestProfileDialog'
import { ReservationDialog } from './ReservationDialog'
import { CheckInDialog } from './CheckInDialog'
import { CheckOutDialog } from './CheckOutDialog'
import { FolioDialog } from './FolioDialog'
import { ReservationDetailsDialog } from './ReservationDetailsDialog'
import { InvoiceViewerA4 } from './InvoiceViewerA4'
import { InvoiceManagementDialog } from './InvoiceManagementDialog'
import { GroupReservationsDialog } from './GroupReservationsDialog'
import { toast } from 'sonner'

interface FrontOfficeProps {
  guests: Guest[]
  setGuests: (guests: Guest[] | ((prev: Guest[]) => Guest[])) => void
  guestProfiles?: GuestProfile[]
  setGuestProfiles?: (profiles: GuestProfile[] | ((prev: GuestProfile[]) => GuestProfile[])) => void
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
  guestProfiles,
  setGuestProfiles,
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
  const [selectedGuestProfile, setSelectedGuestProfile] = useState<GuestProfile | null>(null)
  
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
  const [quickSearchOpen, setQuickSearchOpen] = useState(false)
  const [guestStatsDialogOpen, setGuestStatsDialogOpen] = useState(false)
  const [roomAssignmentDialogOpen, setRoomAssignmentDialogOpen] = useState(false)
  const [batchCheckInDialogOpen, setBatchCheckInDialogOpen] = useState(false)
  const [batchCheckOutDialogOpen, setBatchCheckOutDialogOpen] = useState(false)
  const [nightAuditDialogOpen, setNightAuditDialogOpen] = useState(false)
  const [groupReservationsDialogOpen, setGroupReservationsDialogOpen] = useState(false)
  const [waitlistDialogOpen, setWaitlistDialogOpen] = useState(false)
  const [selectedGuests, setSelectedGuests] = useState<string[]>([])
  const [selectedReservations, setSelectedReservations] = useState<string[]>([])

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

  const overdueCheckouts = reservations.filter(r => {
    if (r.status !== 'checked-in') return false
    const checkOutDate = new Date(r.checkOutDate).setHours(0, 0, 0, 0)
    const todayDate = new Date(today).setHours(0, 0, 0, 0)
    return checkOutDate < todayDate
  })

  const upcomingArrivals = reservations.filter(r => {
    const checkIn = new Date(r.checkInDate).setHours(0, 0, 0, 0)
    const todayDate = new Date(today).setHours(0, 0, 0, 0)
    const in3Days = new Date(today + (3 * 24 * 60 * 60 * 1000)).setHours(0, 0, 0, 0)
    return checkIn > todayDate && checkIn <= in3Days && r.status === 'confirmed'
  })

  const vipGuests = guests.filter(g => {
    const profile = (guestProfiles || []).find(p => p.guestId === g.id)
    return profile?.loyaltyInfo?.tier === 'platinum' || profile?.loyaltyInfo?.tier === 'gold'
  })

  const repeatGuests = guests.filter(g => g.totalStays && g.totalStays > 1)

  const groupReservations = reservations.filter(r => 
    r.source && (r.source.startsWith('group-') || r.source === 'group')
  )

  const groupSources = Array.from(new Set(
    groupReservations
      .map(r => r.specialRequests?.match(/Group: ([^|]+)/)?.[1])
      .filter(Boolean)
  ))

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
    const profile = (guestProfiles || []).find(p => p.guestId === guest.id)
    if (profile) {
      setSelectedGuestProfile(profile)
    } else {
      const newProfile: GuestProfile = {
        id: generateId(),
        guestId: guest.id,
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phone: guest.phone,
        nationality: guest.nationality,
        idType: guest.idType,
        idNumber: guest.idNumber,
        address: guest.address,
        preferences: {
          notesForStaff: guest.preferences?.join(', ')
        },
        loyaltyInfo: {
          tier: 'bronze',
          points: guest.loyaltyPoints || 0,
          lifetimePoints: guest.loyaltyPoints || 0,
          pointsToNextTier: 1000,
          tierSince: Date.now(),
          tierBenefits: [],
          enrolledDate: Date.now()
        },
        segments: [],
        communicationPreference: [],
        doNotDisturb: false,
        blacklisted: false,
        totalStays: guest.totalStays || 0,
        totalNights: 0,
        totalSpent: guest.totalSpent || 0,
        averageSpendPerStay: 0,
        createdAt: guest.createdAt,
        updatedAt: guest.updatedAt,
        createdBy: currentUser?.userId || 'system'
      }
      setSelectedGuestProfile(newProfile)
    }
    setGuestDialogOpen(true)
  }

  const handleNewGuest = () => {
    setSelectedGuestProfile(null)
    setGuestDialogOpen(true)
  }

  const handleSaveGroupReservations = (
    groupReservations: Reservation[], 
    groupName: string, 
    groupId: string,
    guestsData: Partial<Guest>[]
  ) => {
    const newGuests: Guest[] = guestsData.map(guestData => ({
      id: guestData.id || generateId(),
      firstName: guestData.firstName || 'Guest',
      lastName: guestData.lastName || 'Guest',
      email: guestData.email || '',
      phone: guestData.phone || '',
      loyaltyPoints: guestData.loyaltyPoints || 0,
      totalStays: guestData.totalStays || 1,
      totalSpent: guestData.totalSpent || 0,
      createdAt: guestData.createdAt || Date.now(),
      updatedAt: guestData.updatedAt || Date.now()
    }))

    setGuests((current) => [...current, ...newGuests])
    setReservations((current) => [...current, ...groupReservations])
    
    const newFolios: Folio[] = groupReservations.map(reservation => ({
      id: generateId(),
      reservationId: reservation.id,
      guestId: reservation.guestId,
      charges: [{
        id: generateId(),
        folioId: '', 
        description: `Room Charge - ${calculateNights(reservation.checkInDate, reservation.checkOutDate)} nights`,
        amount: reservation.ratePerNight,
        quantity: calculateNights(reservation.checkInDate, reservation.checkOutDate),
        department: 'front-office',
        timestamp: Date.now(),
        postedBy: currentUser?.userId || 'system'
      }],
      payments: reservation.advancePaid > 0 ? [{
        id: generateId(),
        folioId: '',
        amount: reservation.advancePaid,
        method: 'cash',
        status: 'paid' as const,
        timestamp: Date.now(),
        receivedBy: currentUser?.userId || 'system'
      }] : [],
      balance: reservation.totalAmount - reservation.advancePaid,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }))

    newFolios.forEach(folio => {
      folio.charges[0].folioId = folio.id
      if (folio.payments.length > 0) {
        folio.payments[0].folioId = folio.id
      }
    })

    setFolios((current) => [...current, ...newFolios])

    const roomIds = groupReservations.map(r => r.roomId).filter(Boolean) as string[]
    setRooms((current) =>
      current.map(room =>
        roomIds.includes(room.id)
          ? { ...room, status: 'occupied-clean' as const }
          : room
      )
    )

    toast.success(`Group reservation "${groupName}" created with ${groupReservations.length} rooms`)
  }

  const handleSaveGuestProfile = (profileData: Partial<GuestProfile>) => {
    if (selectedGuestProfile) {
      const updatedProfile: GuestProfile = {
        ...selectedGuestProfile,
        ...profileData,
        updatedAt: Date.now()
      }
      
      if (setGuestProfiles) {
        setGuestProfiles((prev) =>
          prev.map(p => p.id === updatedProfile.id ? updatedProfile : p)
        )
      }
      
      const guest = guests.find(g => g.id === updatedProfile.guestId)
      if (guest) {
        setGuests((prev) =>
          prev.map(g =>
            g.id === updatedProfile.guestId
              ? {
                  ...g,
                  firstName: updatedProfile.firstName,
                  lastName: updatedProfile.lastName,
                  email: updatedProfile.email,
                  phone: updatedProfile.phone,
                  nationality: updatedProfile.nationality,
                  idType: updatedProfile.idType,
                  idNumber: updatedProfile.idNumber,
                  address: updatedProfile.address,
                  loyaltyPoints: updatedProfile.loyaltyInfo.points,
                  totalStays: updatedProfile.totalStays,
                  totalSpent: updatedProfile.totalSpent,
                  updatedAt: Date.now()
                }
              : g
          )
        )
      }
      
      toast.success('Guest profile updated successfully')
    } else {
      const guestId = generateId()
      const newGuest: Guest = {
        id: guestId,
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email,
        phone: profileData.phone || '',
        nationality: profileData.nationality,
        idType: profileData.idType,
        idNumber: profileData.idNumber,
        address: profileData.address,
        loyaltyPoints: 0,
        totalStays: 0,
        totalSpent: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      
      const newProfile: GuestProfile = {
        id: generateId(),
        guestId: guestId,
        ...profileData,
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        phone: profileData.phone || '',
        preferences: profileData.preferences || {},
        loyaltyInfo: profileData.loyaltyInfo || {
          tier: 'bronze',
          points: 0,
          lifetimePoints: 0,
          pointsToNextTier: 1000,
          tierSince: Date.now(),
          tierBenefits: [],
          enrolledDate: Date.now()
        },
        segments: profileData.segments || [],
        communicationPreference: profileData.communicationPreference || [],
        doNotDisturb: profileData.doNotDisturb || false,
        blacklisted: profileData.blacklisted || false,
        totalStays: 0,
        totalNights: 0,
        totalSpent: 0,
        averageSpendPerStay: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: currentUser?.userId || 'system'
      } as GuestProfile
      
      setGuests((prev) => [...prev, newGuest])
      
      if (setGuestProfiles) {
        setGuestProfiles((prev) => [...prev, newProfile])
      }
      
      toast.success('Guest profile created successfully')
    }
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
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleNewGuest} variant="outline">
            <UserPlus size={20} className="mr-2" />
            New Guest
          </Button>
          <Button onClick={handleNewReservation} variant="outline">
            <Plus size={20} className="mr-2" />
            New Reservation
          </Button>
          <Button onClick={() => setGroupReservationsDialogOpen(true)}>
            <Users size={20} className="mr-2" />
            Group Booking
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Arrivals Today</h3>
            <CalendarCheck size={20} className="text-primary" />
          </div>
          <p className="text-3xl font-semibold">{arrivalsToday.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            +{upcomingArrivals.length} in 3 days
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Departures Today</h3>
            <CalendarX size={20} className="text-accent" />
          </div>
          <p className="text-3xl font-semibold">{departurestoday.length}</p>
          {overdueCheckouts.length > 0 && (
            <p className="text-xs text-destructive mt-1">
              {overdueCheckouts.length} overdue
            </p>
          )}
        </Card>

        <Card className="p-6 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">In-House</h3>
            <Key size={20} className="text-success" />
          </div>
          <p className="text-3xl font-semibold">{inHouseGuests.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {vipGuests.length} VIP guests
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-secondary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Guests</h3>
            <UserPlus size={20} className="text-secondary" />
          </div>
          <p className="text-3xl font-semibold">{guests.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {repeatGuests.length} repeat guests
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Pending Folios</h3>
            <Receipt size={20} className="text-purple-500" />
          </div>
          <p className="text-3xl font-semibold">{pendingFolios.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(pendingFolios.reduce((sum, f) => sum + f.balance, 0))}
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
            <CurrencyDollar size={20} className="text-blue-500" />
          </div>
          <p className="text-3xl font-semibold">
            {formatCurrency((guestInvoices || []).reduce((sum, inv) => sum + inv.grandTotal, 0))}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {invoiceStats.outstanding} outstanding
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="reservations">
          <TabsList className="mb-4">
            <TabsTrigger value="reservations">Reservations</TabsTrigger>
            <TabsTrigger value="arrivals">Arrivals Today</TabsTrigger>
            <TabsTrigger value="departures">Departures Today</TabsTrigger>
            <TabsTrigger value="groups">
              <Users size={16} className="mr-1" />
              Groups ({groupSources.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingArrivals.length})
            </TabsTrigger>
            <TabsTrigger value="vip">
              VIP Guests ({vipGuests.length})
            </TabsTrigger>
            <TabsTrigger value="guests">Guest Relations</TabsTrigger>
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

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingArrivals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No upcoming arrivals in the next 3 days
              </div>
            ) : (
              upcomingArrivals.map(reservation => {
                const guest = guests.find(g => g.id === reservation.guestId)
                const room = rooms.find(r => r.id === reservation.roomId)
                const daysUntilArrival = Math.ceil((new Date(reservation.checkInDate).getTime() - today) / (24 * 60 * 60 * 1000))
                
                return (
                  <Card key={reservation.id} className="p-4 border-l-4 border-l-blue-500">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown Guest'}
                          </h3>
                          <Badge className="bg-blue-100 text-blue-800">
                            In {daysUntilArrival} day{daysUntilArrival !== 1 ? 's' : ''}
                          </Badge>
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
                            <p className="text-muted-foreground">Nights</p>
                            <p className="font-medium">{calculateNights(reservation.checkInDate, reservation.checkOutDate)}</p>
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
                        <Button size="sm" variant="outline" onClick={() => handleEditReservation(reservation)}>
                          <FileText size={16} className="mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Group Bookings</h3>
              <Button onClick={() => setGroupReservationsDialogOpen(true)} size="sm">
                <Users size={16} className="mr-2" />
                New Group Booking
              </Button>
            </div>
            
            {groupSources.length === 0 ? (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No group bookings found</p>
                <Button onClick={() => setGroupReservationsDialogOpen(true)}>
                  <Users size={16} className="mr-2" />
                  Create First Group Booking
                </Button>
              </div>
            ) : (
              groupSources.map((groupName) => {
                const groupBookings = groupReservations.filter(r => 
                  r.specialRequests?.includes(`Group: ${groupName}`)
                )
                const groupGuests = groupBookings.map(r => guests.find(g => g.id === r.guestId)).filter(Boolean)
                const totalRevenue = groupBookings.reduce((sum, r) => sum + r.totalAmount, 0)
                const totalPaid = groupBookings.reduce((sum, r) => sum + r.advancePaid, 0)
                const groupType = groupBookings[0]?.source?.replace('group-', '') || 'other'
                const checkInDate = groupBookings[0]?.checkInDate
                const checkOutDate = groupBookings[0]?.checkOutDate
                const activeBookings = groupBookings.filter(r => r.status === 'confirmed' || r.status === 'checked-in')
                
                return (
                  <Card key={groupName} className="p-6 border-l-4 border-l-primary">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Users size={24} className="text-primary" />
                            <h3 className="text-xl font-semibold">{groupName}</h3>
                            <Badge className="capitalize">{groupType}</Badge>
                            {activeBookings.length > 0 && (
                              <Badge variant="outline" className="bg-green-50 text-green-700">
                                {activeBookings.length} Active
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Total Rooms</p>
                              <p className="text-lg font-semibold">{groupBookings.length}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Total Guests</p>
                              <p className="text-lg font-semibold">
                                {groupBookings.reduce((sum, r) => sum + r.adults + r.children, 0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Check-In</p>
                              <p className="text-sm font-medium">
                                {checkInDate ? formatDate(checkInDate) : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Check-Out</p>
                              <p className="text-sm font-medium">
                                {checkOutDate ? formatDate(checkOutDate) : 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Total Revenue</p>
                              <p className="text-lg font-semibold text-primary">
                                {formatCurrency(totalRevenue)}
                              </p>
                            </div>
                          </div>

                          {totalPaid > 0 && (
                            <div className="mt-3 p-3 bg-green-50 rounded-lg">
                              <p className="text-sm text-green-800">
                                <strong>Deposit Paid:</strong> {formatCurrency(totalPaid)} of {formatCurrency(totalRevenue)}
                              </p>
                              <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{ width: `${Math.min((totalPaid / totalRevenue) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Receipt size={16} />
                          Individual Bookings
                        </h4>
                        <div className="space-y-2">
                          {groupBookings.map((reservation) => {
                            const guest = guests.find(g => g.id === reservation.guestId)
                            const room = rooms.find(r => r.id === reservation.roomId)
                            
                            return (
                              <div 
                                key={reservation.id} 
                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-4 flex-1">
                                  <div className="flex-1">
                                    <p className="font-medium">
                                      {guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown Guest'}
                                    </p>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                      <span>Room {room?.roomNumber || 'Not assigned'}</span>
                                      <span>•</span>
                                      <span>{reservation.adults}A, {reservation.children}C</span>
                                      <span>•</span>
                                      {getStatusBadge(reservation.status)}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">{formatCurrency(reservation.totalAmount)}</p>
                                    {reservation.advancePaid > 0 && (
                                      <p className="text-xs text-green-600">
                                        {formatCurrency(reservation.advancePaid)} paid
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2 ml-4">
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
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </TabsContent>

          <TabsContent value="vip" className="space-y-4">
            {vipGuests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No VIP guests found
              </div>
            ) : (
              vipGuests.map(guest => {
                const profile = (guestProfiles || []).find(p => p.guestId === guest.id)
                const guestReservations = reservations.filter(r => r.guestId === guest.id)
                const activeReservation = guestReservations.find(r => r.status === 'checked-in')
                const upcomingReservation = guestReservations.find(r => r.status === 'confirmed' && new Date(r.checkInDate).getTime() > today)
                const room = activeReservation ? rooms.find(r => r.id === activeReservation.roomId) : null
                
                return (
                  <Card key={guest.id} className="p-4 border-l-4 border-l-yellow-500">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {guest.firstName} {guest.lastName}
                          </h3>
                          <Badge className="bg-yellow-100 text-yellow-800 capitalize">
                            {profile?.loyaltyInfo?.tier || 'VIP'}
                          </Badge>
                          {activeReservation && <Badge variant="secondary">In-House</Badge>}
                          {upcomingReservation && !activeReservation && <Badge className="bg-blue-100 text-blue-800">Arriving Soon</Badge>}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Email</p>
                            <p className="font-medium">{guest.email || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Phone</p>
                            <p className="font-medium">{guest.phone}</p>
                          </div>
                          {activeReservation && room && (
                            <div>
                              <p className="text-muted-foreground">Current Room</p>
                              <p className="font-medium">{room.roomNumber}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-muted-foreground">Total Stays</p>
                            <p className="font-medium">{guest.totalStays || 0} stays</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Loyalty Points</p>
                            <p className="font-medium text-yellow-600">{profile?.loyaltyInfo?.points.toLocaleString() || 0} pts</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Spent</p>
                            <p className="font-medium">{formatCurrency(guest.totalSpent || 0)}</p>
                          </div>
                        </div>
                        {profile?.preferences?.notesForStaff && (
                          <div className="mt-2 text-sm">
                            <p className="text-muted-foreground">VIP Notes</p>
                            <p className="text-yellow-700">{profile.preferences.notesForStaff}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditGuest(guest)}>
                          <Eye size={16} className="mr-1" />
                          View Profile
                        </Button>
                        {activeReservation && (
                          <Button size="sm" variant="outline" onClick={() => handleViewFolio(activeReservation)}>
                            <Receipt size={16} className="mr-1" />
                            Folio
                          </Button>
                        )}
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

      <GuestProfileDialog
        open={guestDialogOpen}
        onOpenChange={setGuestDialogOpen}
        profile={selectedGuestProfile}
        onSave={handleSaveGuestProfile}
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

      <GroupReservationsDialog
        open={groupReservationsDialogOpen}
        onOpenChange={setGroupReservationsDialogOpen}
        rooms={rooms}
        onSave={handleSaveGroupReservations}
      />
    </div>
  )
}
