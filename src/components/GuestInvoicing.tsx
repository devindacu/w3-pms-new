import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Receipt,
  Plus,
  FileText,
  CreditCard,
  Printer,
  EnvelopeSimple,
  Download,
  MagnifyingGlass,
  Funnel,
  Calendar,
  CurrencyDollar,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  PencilSimple,
  Trash,
  Eye,
  Moon,
  File
} from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type {
  GuestInvoice,
  Folio,
  Guest,
  Reservation,
  SystemUser,
  Order,
  ExtraService,
  ExtraServiceCategory,
  FolioExtraService,
  GuestInvoiceStatus,
  GuestInvoiceType
} from '@/lib/types'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/helpers'
import { InvoiceViewerA4 } from '@/components/InvoiceViewerA4'
import { PrintButton } from '@/components/PrintButton'
import { A4PrintWrapper } from '@/components/A4PrintWrapper'
import { ChargePostingDialog, type ChargeType } from '@/components/ChargePostingDialog'
import { InvoiceAdjustmentDialog } from '@/components/InvoiceAdjustmentDialog'
import { GuestInvoiceDialog } from '@/components/GuestInvoiceDialog'
import { InvoicePaymentDialog } from '@/components/InvoicePaymentDialog'

interface GuestInvoicingProps {
  invoices: GuestInvoice[]
  setInvoices: (fn: (invoices: GuestInvoice[]) => GuestInvoice[]) => void
  folios: Folio[]
  setFolios: (fn: (folios: Folio[]) => Folio[]) => void
  guests: Guest[]
  reservations: Reservation[]
  orders: Order[]
  extraServices: ExtraService[]
  serviceCategories: ExtraServiceCategory[]
  folioExtraServices: FolioExtraService[]
  setFolioExtraServices: (fn: (services: FolioExtraService[]) => FolioExtraService[]) => void
  currentUser: SystemUser
}

export function GuestInvoicing({
  invoices,
  setInvoices,
  folios,
  setFolios,
  guests,
  reservations,
  orders,
  extraServices,
  serviceCategories,
  folioExtraServices,
  setFolioExtraServices,
  currentUser
}: GuestInvoicingProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<GuestInvoiceStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<GuestInvoiceType | 'all'>('all')
  const [selectedInvoice, setSelectedInvoice] = useState<GuestInvoice | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isChargeDialogOpen, setIsChargeDialogOpen] = useState(false)
  const [chargeType, setChargeType] = useState<ChargeType | null>(null)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false)
  const [isNightAuditDialogOpen, setIsNightAuditDialogOpen] = useState(false)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [selectedFolio, setSelectedFolio] = useState<Folio | null>(null)

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
    const matchesType = typeFilter === 'all' || inv.invoiceType === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status: GuestInvoiceStatus) => {
    const variants: Record<GuestInvoiceStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      'draft': { variant: 'outline', label: 'Draft' },
      'interim': { variant: 'secondary', label: 'Interim' },
      'final': { variant: 'default', label: 'Final' },
      'posted': { variant: 'default', label: 'Posted' },
      'cancelled': { variant: 'destructive', label: 'Cancelled' },
      'refunded': { variant: 'destructive', label: 'Refunded' },
      'partially-refunded': { variant: 'outline', label: 'Partially Refunded' }
    }
    const { variant, label } = variants[status]
    return <Badge variant={variant}>{label}</Badge>
  }

  const getTypeIcon = (type: GuestInvoiceType): React.ReactElement => {
    const icons: Record<GuestInvoiceType, React.ReactElement> = {
      'guest-folio': <Receipt size={16} />,
      'room-only': <Receipt size={16} />,
      'fnb-only': <Receipt size={16} />,
      'extras-only': <Receipt size={16} />,
      'group-master': <FileText size={16} />,
      'proforma': <FileText size={16} />,
      'credit-note': <XCircle size={16} />,
      'debit-note': <CheckCircle size={16} />
    }
    return icons[type]
  }

  const handleCreateInvoice = () => {
    setSelectedInvoice(null)
    setIsDialogOpen(true)
  }

  const handleEditInvoice = (invoice: GuestInvoice) => {
    setSelectedInvoice(invoice)
    setIsDialogOpen(true)
  }

  const handleViewInvoice = (invoice: GuestInvoice) => {
    setSelectedInvoice(invoice)
    setIsViewerOpen(true)
  }

  const handlePostCharges = (folio: Folio) => {
    setSelectedFolio(folio)
    setIsChargeDialogOpen(true)
  }

  const handlePayment = (invoice: GuestInvoice) => {
    setSelectedInvoice(invoice)
    setIsPaymentDialogOpen(true)
  }

  const handleAdjustment = (invoice: GuestInvoice) => {
    setSelectedInvoice(invoice)
    setIsAdjustmentDialogOpen(true)
  }

  const handleNightAudit = () => {
    setIsNightAuditDialogOpen(true)
  }

  const stats = {
    totalDraft: invoices.filter(i => i.status === 'draft').length,
    totalInterim: invoices.filter(i => i.status === 'interim').length,
    totalFinal: invoices.filter(i => i.status === 'final').length,
    totalPosted: invoices.filter(i => i.status === 'posted').length,
    totalRevenue: invoices.filter(i => i.status !== 'cancelled').reduce((sum, i) => sum + i.grandTotal, 0),
    totalOutstanding: invoices.filter(i => i.status === 'final' || i.status === 'interim').reduce((sum, i) => sum + i.amountDue, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Guest Invoicing</h1>
          <p className="text-muted-foreground mt-1">
            Manage guest invoices, charge posting, and payment processing
          </p>
        </div>
        <div className="flex gap-2">
          <PrintButton
            elementId="guest-invoicing-print"
            options={{
              title: 'Guest Invoicing Report',
              filename: `guest-invoicing-${Date.now()}.pdf`
            }}
          />
          <Button onClick={handleNightAudit} variant="outline">
            <Moon size={20} className="mr-2" />
            Night Audit
          </Button>
          <Button onClick={handleCreateInvoice}>
            <Plus size={20} className="mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="text-sm text-muted-foreground">Draft Invoices</div>
          <div className="text-2xl font-semibold mt-1">{stats.totalDraft}</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-accent">
          <div className="text-sm text-muted-foreground">Interim Bills</div>
          <div className="text-2xl font-semibold mt-1">{stats.totalInterim}</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-success">
          <div className="text-sm text-muted-foreground">Final Invoices</div>
          <div className="text-2xl font-semibold mt-1">{stats.totalFinal}</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="text-sm text-muted-foreground">Posted to GL</div>
          <div className="text-2xl font-semibold mt-1">{stats.totalPosted}</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-success">
          <div className="text-sm text-muted-foreground">Total Revenue</div>
          <div className="text-2xl font-semibold mt-1">{formatCurrency(stats.totalRevenue)}</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-destructive">
          <div className="text-sm text-muted-foreground">Outstanding</div>
          <div className="text-2xl font-semibold mt-1">{formatCurrency(stats.totalOutstanding)}</div>
        </Card>
      </div>

      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">
            <Receipt size={16} className="mr-2" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="folios">
            <FileText size={16} className="mr-2" />
            Folios
          </TabsTrigger>
          <TabsTrigger value="charges">
            <CurrencyDollar size={16} className="mr-2" />
            Charge Posting
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <Card className="p-4">
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as GuestInvoiceStatus | 'all')}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="interim">Interim</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                  <SelectItem value="posted">Posted</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as GuestInvoiceType | 'all')}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="guest-folio">Guest Folio</SelectItem>
                  <SelectItem value="room-only">Room Only</SelectItem>
                  <SelectItem value="fnb-only">F&B Only</SelectItem>
                  <SelectItem value="proforma">Proforma</SelectItem>
                  <SelectItem value="credit-note">Credit Note</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Receipt size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No invoices found</p>
                </div>
              ) : (
                filteredInvoices.map((invoice) => (
                  <Card key={invoice.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getTypeIcon(invoice.invoiceType)}
                          <div className="font-semibold text-lg">{invoice.invoiceNumber}</div>
                          {getStatusBadge(invoice.status)}
                          {invoice.isPostedToAccounts && (
                            <Badge variant="outline">
                              <File size={14} className="mr-1" />
                              Posted to GL
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Guest</div>
                            <div className="font-medium">{invoice.guestName}</div>
                          </div>
                          {invoice.roomNumber && (
                            <div>
                              <div className="text-muted-foreground">Room</div>
                              <div className="font-medium">{invoice.roomNumber}</div>
                            </div>
                          )}
                          <div>
                            <div className="text-muted-foreground">Invoice Date</div>
                            <div className="font-medium">{formatDate(invoice.invoiceDate)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Total Amount</div>
                            <div className="font-semibold text-lg">{formatCurrency(invoice.grandTotal)}</div>
                          </div>
                        </div>
                        {invoice.amountDue > 0 && (
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">Amount Due: </span>
                            <span className="font-semibold text-destructive">{formatCurrency(invoice.amountDue)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline" onClick={() => handleViewInvoice(invoice)}>
                          <Eye size={16} className="mr-1" />
                          View
                        </Button>
                        {invoice.status === 'draft' || invoice.status === 'interim' ? (
                          <Button size="sm" variant="outline" onClick={() => handleEditInvoice(invoice)}>
                            <PencilSimple size={16} className="mr-1" />
                            Edit
                          </Button>
                        ) : null}
                        {invoice.amountDue > 0 && (
                          <Button size="sm" onClick={() => handlePayment(invoice)}>
                            <CreditCard size={16} className="mr-1" />
                            Payment
                          </Button>
                        )}
                        {(invoice.status === 'draft' || invoice.status === 'interim') && (
                          <Button size="sm" variant="outline" onClick={() => handleAdjustment(invoice)}>
                            <PencilSimple size={16} className="mr-1" />
                            Adjust
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="folios" className="space-y-4">
          <Card className="p-4">
            <div className="space-y-2">
              {folios.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No folios found</p>
                </div>
              ) : (
                folios.map((folio) => {
                  const guest = guests.find(g => g.id === folio.guestId)
                  const reservation = reservations.find(r => r.id === folio.reservationId)
                  return (
                    <Card key={folio.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-lg mb-2">
                            Folio #{folio.id.slice(0, 8)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Guest</div>
                              <div className="font-medium">{guest?.firstName} {guest?.lastName}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Charges</div>
                              <div className="font-medium">{folio.charges.length} items</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Payments</div>
                              <div className="font-medium">{folio.payments.length} transactions</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Balance</div>
                              <div className={`font-semibold text-lg ${folio.balance > 0 ? 'text-destructive' : 'text-success'}`}>
                                {formatCurrency(folio.balance)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" variant="outline" onClick={() => handlePostCharges(folio)}>
                            <Plus size={16} className="mr-1" />
                            Post Charges
                          </Button>
                          <Button size="sm" onClick={() => {
                            setSelectedFolio(folio)
                            setIsDialogOpen(true)
                          }}>
                            <ArrowRight size={16} className="mr-1" />
                            Generate Invoice
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                })
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="charges" className="space-y-4">
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Button
                onClick={() => {
                  setChargeType('room')
                  setIsChargeDialogOpen(true)
                }}
                className="h-32 flex-col gap-2"
                variant="outline"
              >
                <Receipt size={32} />
                <div className="text-center">
                  <div className="font-semibold">Post Room Charges</div>
                  <div className="text-xs text-muted-foreground">Nightly room rates</div>
                </div>
              </Button>
              <Button
                onClick={() => {
                  setChargeType('fnb')
                  setIsChargeDialogOpen(true)
                }}
                className="h-32 flex-col gap-2"
                variant="outline"
              >
                <CurrencyDollar size={32} />
                <div className="text-center">
                  <div className="font-semibold">Post F&B Charges</div>
                  <div className="text-xs text-muted-foreground">From POS/KOT</div>
                </div>
              </Button>
              <Button
                onClick={() => {
                  setChargeType('extra-service')
                  setIsChargeDialogOpen(true)
                }}
                className="h-32 flex-col gap-2"
                variant="outline"
              >
                <Plus size={32} />
                <div className="text-center">
                  <div className="font-semibold">Post Extra Services</div>
                  <div className="text-xs text-muted-foreground">Spa, laundry, etc.</div>
                </div>
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <GuestInvoiceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        guests={guests}
        reservations={reservations}
        onInvoiceCreated={(newInvoice) => {
          setInvoices((prev) => [...prev, newInvoice])
        }}
        currentUser={currentUser}
      />

      <ChargePostingDialog
        open={isChargeDialogOpen}
        onOpenChange={setIsChargeDialogOpen}
        chargeType={chargeType}
        invoice={selectedInvoice || undefined}
        guestName={selectedInvoice?.guestName}
        roomNumber={selectedInvoice?.roomNumber}
        onChargePosted={(charges) => {
          if (selectedInvoice) {
            const updatedInvoice: GuestInvoice = {
              ...selectedInvoice,
              lineItems: [...selectedInvoice.lineItems, ...charges],
              subtotal: selectedInvoice.subtotal + charges.reduce((sum, c) => sum + c.lineTotal, 0),
              totalTax: selectedInvoice.totalTax + charges.reduce((sum, c) => sum + c.totalTax, 0),
              grandTotal: selectedInvoice.grandTotal + charges.reduce((sum, c) => sum + c.lineGrandTotal, 0),
              amountDue: selectedInvoice.amountDue + charges.reduce((sum, c) => sum + c.lineGrandTotal, 0)
            }
            setInvoices((prev) => prev.map((inv) => (inv.id === selectedInvoice.id ? updatedInvoice : inv)))
          }
        }}
        currentUser={currentUser}
      />

      {selectedInvoice && (
        <>
          <InvoicePaymentDialog
            open={isPaymentDialogOpen}
            onOpenChange={setIsPaymentDialogOpen}
            invoice={{
              ...selectedInvoice,
              invoiceNumber: selectedInvoice.invoiceNumber,
              total: selectedInvoice.grandTotal,
              balance: selectedInvoice.amountDue,
              supplierId: '',
              items: []
            } as any}
            onPaymentRecorded={(payment, updatedInvoice) => {
              const guestInvoice: GuestInvoice = {
                ...selectedInvoice,
                totalPaid: selectedInvoice.totalPaid + payment.amount,
                amountDue: selectedInvoice.amountDue - payment.amount,
                status: selectedInvoice.amountDue - payment.amount <= 0 ? 'posted' : selectedInvoice.status
              }
              setInvoices((prev) => prev.map((inv) => (inv.id === selectedInvoice.id ? guestInvoice : inv)))
            }}
            currentUser={`${currentUser.firstName} ${currentUser.lastName}`}
          />

          <InvoiceAdjustmentDialog
            open={isAdjustmentDialogOpen}
            onOpenChange={setIsAdjustmentDialogOpen}
            invoice={selectedInvoice}
            onAdjustmentApplied={(updatedInvoice) => {
              setInvoices((prev) => prev.map((inv) => (inv.id === selectedInvoice.id ? updatedInvoice : inv)))
            }}
            currentUser={currentUser}
          />
        </>
      )}

      {selectedInvoice && (
        <InvoiceViewerA4
          invoice={selectedInvoice}
          hotelInfo={{
            name: "W3 Hotel",
            address: "Hotel Address",
            phone: "+123456789",
            email: "info@w3hotel.com",
            website: "www.w3hotel.com",
            taxRegistrationNumber: "TAX123456",
            logo: ""
          }}
          currentUser={currentUser}
        />
      )}

      {/* Hidden print section */}
      <div className="hidden">
        <A4PrintWrapper id="guest-invoicing-print" title="Guest Invoicing Report">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-sm text-muted-foreground">Draft Invoices</div>
                <div className="text-xl font-semibold">{stats.totalDraft}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Interim Bills</div>
                <div className="text-xl font-semibold">{stats.totalInterim}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Final Invoices</div>
                <div className="text-xl font-semibold">{stats.totalFinal}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Posted to GL</div>
                <div className="text-xl font-semibold">{stats.totalPosted}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
                <div className="text-xl font-semibold">{formatCurrency(stats.totalRevenue)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Outstanding</div>
                <div className="text-xl font-semibold">{formatCurrency(stats.totalOutstanding)}</div>
              </div>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-primary">
                  <th className="p-2 text-left">Invoice #</th>
                  <th className="p-2 text-left">Guest</th>
                  <th className="p-2 text-left">Room</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-right">Total</th>
                  <th className="p-2 text-right">Due</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b">
                    <td className="p-2">{invoice.invoiceNumber}</td>
                    <td className="p-2">{invoice.guestName}</td>
                    <td className="p-2">{invoice.roomNumber || '-'}</td>
                    <td className="p-2">{formatDate(invoice.invoiceDate)}</td>
                    <td className="p-2">{invoice.status}</td>
                    <td className="p-2 text-right">{formatCurrency(invoice.grandTotal)}</td>
                    <td className="p-2 text-right">{formatCurrency(invoice.amountDue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </A4PrintWrapper>
      </div>
    </div>
  )
}
