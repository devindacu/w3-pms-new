import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Plus,
  MagnifyingGlass,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Printer,
  Download,
  EnvelopeSimple,
  Receipt,
  CurrencyDollar,
  Calendar,
  UserCircle
} from '@phosphor-icons/react'
import type { 
  GuestInvoice, 
  SystemUser, 
  GuestInvoiceStatus,
  Folio,
  Guest,
  Reservation,
  Room,
  FolioExtraService,
  ExtraService,
  ExtraServiceCategory,
  TaxConfiguration,
  ServiceChargeConfiguration,
  InvoiceLineItem,
  GuestInvoiceType
} from '@/lib/types'
import { formatCurrency, generateId } from '@/lib/helpers'
import { InvoiceViewer } from '@/components/InvoiceViewer'
import { 
  generateInvoiceNumber,
  createLineItemFromFolioCharge,
  createLineItemFromExtraService,
  calculateInvoiceTotals,
  validateInvoice,
  createInvoiceAuditEntry
} from '@/lib/invoiceHelpers'
import { toast } from 'sonner'

interface GuestInvoicingProps {
  currentUser: SystemUser
}

export function GuestInvoicing({ 
  currentUser
}: GuestInvoicingProps) {
  const [invoices, setInvoices] = useKV<GuestInvoice[]>('w3-hotel-guest-invoices', [])
  const [folios, setFolios] = useKV<Folio[]>('w3-hotel-folios', [])
  const [guests, setGuests] = useKV<Guest[]>('w3-hotel-guests', [])
  const [reservations, setReservations] = useKV<Reservation[]>('w3-hotel-reservations', [])
  const [rooms, setRooms] = useKV<Room[]>('w3-hotel-rooms', [])
  const [folioExtraServices, setFolioExtraServices] = useKV<FolioExtraService[]>('w3-hotel-folio-extra-services', [])
  
  const [selectedInvoice, setSelectedInvoice] = useState<GuestInvoice | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<GuestInvoiceStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedFolioId, setSelectedFolioId] = useState<string>('')

  const hotelInfo = {
    name: 'W3 Hotel',
    address: '123 Hospitality Boulevard, Tourism District, City 12345',
    phone: '+1 (555) 123-4567',
    email: 'billing@w3hotel.com',
    website: 'www.w3hotel.com',
    taxRegistrationNumber: 'TAX-123456789'
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

    const folio = (folios || []).find(f => f.id === selectedFolioId)
    if (!folio) {
      toast.error('Folio not found')
      return
    }

    const guest = (guests || []).find(g => g.id === folio.guestId)
    const reservation = (reservations || []).find(r => r.id === folio.reservationId)
    const room = reservation ? (rooms || []).find(r => r.id === reservation.roomId) : null

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
          currentUser.userId
        )
      ],
      isGroupMaster: false,
      isTaxExempt: false,
      createdBy: currentUser.userId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    const validation = validateInvoice(newInvoice)
    if (!validation.isValid) {
      toast.error(`Invoice validation failed: ${validation.errors[0]?.message}`)
      return
    }

    setInvoices(current => [...(current || []), newInvoice])
    setCreateDialogOpen(false)
    setSelectedFolioId('')
    toast.success(`Invoice ${newInvoice.invoiceNumber} created successfully`)
    setSelectedInvoice(newInvoice)
  }

  const filteredInvoices = (invoices || []).filter((invoice) => {
    const matchesSearch = 
      searchQuery === '' ||
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.guestEmail?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    const matchesType = typeFilter === 'all' || invoice.invoiceType === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

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

  const getStatusBadge = (status: GuestInvoiceStatus) => {
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

  const stats = {
    total: (invoices || []).length,
    draft: (invoices || []).filter((i) => i.status === 'draft').length,
    final: (invoices || []).filter((i) => i.status === 'final' || i.status === 'posted').length,
    outstanding: (invoices || []).filter((i) => i.amountDue > 0 && i.status !== 'cancelled').length,
    totalOutstanding: (invoices || [])
      .filter((i) => i.amountDue > 0 && i.status !== 'cancelled')
      .reduce((sum, i) => sum + i.amountDue, 0)
  }

  const pendingFolios = (folios || []).filter(folio => {
    const hasInvoice = (invoices || []).some(inv => inv.folioIds.includes(folio.id))
    return !hasInvoice && folio.balance > 0
  })

  if (selectedInvoice) {
    return (
      <InvoiceViewer
        invoice={selectedInvoice}
        hotelInfo={hotelInfo}
        currentUser={currentUser}
        onClose={() => setSelectedInvoice(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Guest Invoicing</h1>
          <p className="text-muted-foreground mt-1">Manage and track all guest invoices</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus size={20} className="mr-2" />
          New Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 border-l-4 border-l-primary">
          <p className="text-sm text-muted-foreground">Total Invoices</p>
          <p className="text-3xl font-semibold mt-1">{stats.total}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-yellow-500">
          <p className="text-sm text-muted-foreground">Draft</p>
          <p className="text-3xl font-semibold mt-1">{stats.draft}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-success">
          <p className="text-sm text-muted-foreground">Final/Posted</p>
          <p className="text-3xl font-semibold mt-1">{stats.final}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-destructive">
          <p className="text-sm text-muted-foreground">Outstanding</p>
          <p className="text-3xl font-semibold mt-1">{stats.outstanding}</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-accent">
          <p className="text-sm text-muted-foreground">Total Due</p>
          <p className="text-2xl font-semibold mt-1">{formatCurrency(stats.totalOutstanding)}</p>
        </Card>
      </div>

      {pendingFolios.length > 0 && (
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">Pending Folios</p>
              <p className="text-sm text-muted-foreground mt-1">
                {pendingFolios.length} folio{pendingFolios.length !== 1 ? 's' : ''} awaiting invoice generation
              </p>
            </div>
            <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
              <Receipt size={18} className="mr-2" />
              Create Invoices
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by invoice number, guest name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Invoices</TabsTrigger>
            <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
            <TabsTrigger value="paid">Paid in Full</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <InvoiceList
              invoices={filteredInvoices}
              onSelect={setSelectedInvoice}
              getStatusBadge={getStatusBadge}
              getStatusIcon={getStatusIcon}
            />
          </TabsContent>

          <TabsContent value="outstanding" className="mt-6">
            <InvoiceList
              invoices={filteredInvoices.filter((i) => i.amountDue > 0 && i.status !== 'cancelled')}
              onSelect={setSelectedInvoice}
              getStatusBadge={getStatusBadge}
              getStatusIcon={getStatusIcon}
            />
          </TabsContent>

          <TabsContent value="paid" className="mt-6">
            <InvoiceList
              invoices={filteredInvoices.filter((i) => i.amountDue === 0 && i.status === 'final')}
              onSelect={setSelectedInvoice}
              getStatusBadge={getStatusBadge}
              getStatusIcon={getStatusIcon}
            />
          </TabsContent>
        </Tabs>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
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
                        const guest = (guests || []).find(g => g.id === folio.guestId)
                        const reservation = (reservations || []).find(r => r.id === folio.reservationId)
                        const room = reservation ? (rooms || []).find(r => r.id === reservation.roomId) : null
                        
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
                  const folio = (folios || []).find(f => f.id === selectedFolioId)
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
              setCreateDialogOpen(false)
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
    </div>
  )
}

interface InvoiceListProps {
  invoices: GuestInvoice[]
  onSelect: (invoice: GuestInvoice) => void
  getStatusBadge: (status: GuestInvoiceStatus) => string
  getStatusIcon: (status: GuestInvoiceStatus) => React.ReactElement
}

function InvoiceList({ invoices, onSelect, getStatusBadge, getStatusIcon }: InvoiceListProps) {
  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No invoices found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {invoices.map((invoice) => (
        <Card
          key={invoice.id}
          className="p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelect(invoice)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getStatusIcon(invoice.status)}
                <h3 className="font-semibold text-lg">{invoice.invoiceNumber}</h3>
                <Badge className={getStatusBadge(invoice.status)}>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  toast.info('Print functionality ready')
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
                  toast.info('Email functionality ready')
                }}
              >
                <EnvelopeSimple size={18} />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
