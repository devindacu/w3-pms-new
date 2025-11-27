import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Receipt,
  FileText,
  Download,
  Envelope,
  Printer,
  Plus,
  MagnifyingGlass,
  FunnelSimple,
  CheckCircle,
  XCircle,
  Clock,
  CurrencyDollar,
  Users,
  CreditCard,
  Warning
} from '@phosphor-icons/react'
import type {
  GuestInvoice,
  GuestInvoiceType,
  GuestInvoiceStatus,
  Folio,
  Guest,
  Reservation,
  TaxConfiguration,
  ServiceChargeConfiguration,
  SystemUser,
  FolioExtraService
} from '@/lib/types'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/helpers'
import { 
  generateInvoiceNumber,
  createLineItemFromFolioCharge,
  createLineItemFromExtraService,
  calculateInvoiceTotals,
  validateInvoice,
  createInvoiceAuditEntry,
  createGLEntriesForInvoice,
  formatInvoiceForEmail
} from '@/lib/invoiceHelpers'
import { generateId } from '@/lib/helpers'

interface GuestInvoicingProps {
  folios: Folio[]
  guests: Guest[]
  reservations: Reservation[]
  folioExtraServices: FolioExtraService[]
  currentUser: SystemUser
}

export function GuestInvoicing({ folios, guests, reservations, folioExtraServices, currentUser }: GuestInvoicingProps) {
  const [invoices, setInvoices] = useKV<GuestInvoice[]>('w3-hotel-guest-invoices', [])
  const [taxConfigs, setTaxConfigs] = useKV<TaxConfiguration[]>('w3-hotel-tax-configs', [])
  const [serviceChargeConfig, setServiceChargeConfig] = useKV<ServiceChargeConfiguration | null>('w3-hotel-service-charge-config', null)

  const [selectedInvoice, setSelectedInvoice] = useState<GuestInvoice | null>(null)
  const [viewInvoiceDialog, setViewInvoiceDialog] = useState(false)
  const [createInvoiceDialog, setCreateInvoiceDialog] = useState(false)
  const [selectedFolioId, setSelectedFolioId] = useState<string>('')
  const [invoiceType, setInvoiceType] = useState<GuestInvoiceType>('guest-folio')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<GuestInvoiceStatus | 'all'>('all')

  const generateInvoice = () => {
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
    
    if (!guest) {
      toast.error('Guest not found')
      return
    }

    const defaultTaxConfig: TaxConfiguration = {
      id: generateId(),
      name: 'VAT',
      type: 'vat',
      rate: 12,
      isInclusive: false,
      isActive: true,
      isCompoundTax: false,
      appliesTo: ['front-office', 'fnb', 'housekeeping', 'kitchen', 'engineering', 'finance', 'hr', 'admin'],
      calculationOrder: 1,
      taxableOnServiceCharge: false,
      registrationNumber: 'VAT-123456789',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    const defaultServiceCharge: ServiceChargeConfiguration = {
      id: generateId(),
      rate: 10,
      isActive: true,
      appliesTo: ['fnb'],
      isTaxable: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    const activeTaxes = (taxConfigs && taxConfigs.length > 0) ? taxConfigs : [defaultTaxConfig]
    const activeServiceCharge = serviceChargeConfig || defaultServiceCharge

    const lineItems = folio.charges.map(charge => 
      createLineItemFromFolioCharge(charge, activeTaxes, activeServiceCharge)
    )

    const extraServiceItems = (folioExtraServices || [])
      .filter(es => es.folioId === folio.id)
      .map(es => createLineItemFromExtraService(es, activeTaxes, activeServiceCharge))

    const allLineItems = [...lineItems, ...extraServiceItems]

    const totals = calculateInvoiceTotals(allLineItems, [], activeTaxes, activeServiceCharge)
    
    const totalPaid = folio.payments.reduce((sum, p) => sum + p.amount, 0)

    const invoice: GuestInvoice = {
      id: generateId(),
      invoiceNumber: generateInvoiceNumber(invoiceType),
      invoiceType,
      status: 'draft',
      folioIds: [folio.id],
      reservationIds: reservation ? [reservation.id] : [],
      guestId: guest.id,
      guestName: `${guest.firstName} ${guest.lastName}`,
      guestEmail: guest.email,
      guestPhone: guest.phone,
      guestAddress: guest.address,
      roomNumber: reservation ? '101' : undefined,
      checkInDate: reservation?.checkInDate,
      checkOutDate: reservation?.checkOutDate,
      invoiceDate: Date.now(),
      currency: 'LKR',
      exchangeRate: 1,
      lineItems: allLineItems,
      subtotal: totals.subtotal,
      discounts: [],
      totalDiscount: totals.totalDiscount,
      serviceChargeRate: activeServiceCharge.rate,
      serviceChargeAmount: totals.serviceChargeAmount,
      taxLines: totals.taxLines,
      totalTax: totals.totalTax,
      grandTotal: totals.grandTotal,
      payments: folio.payments.map(p => ({
        id: p.id,
        paymentDate: p.timestamp,
        paymentType: p.method as any,
        amount: p.amount,
        currency: 'LKR',
        exchangeRate: 1,
        amountInBaseCurrency: p.amount,
        reference: p.reference,
        receivedBy: p.receivedBy,
        receivedAt: p.timestamp,
        isRefunded: false
      })),
      totalPaid,
      amountDue: totals.grandTotal - totalPaid,
      creditNotes: [],
      debitNotes: [],
      prepayments: [],
      netAmountDue: totals.grandTotal - totalPaid,
      isPostedToAccounts: false,
      deliveryMethods: [],
      isGroupMaster: false,
      isTaxExempt: false,
      auditTrail: [createInvoiceAuditEntry(
        'created',
        `Invoice created from folio ${folio.id}`,
        currentUser.username
      )],
      createdBy: currentUser.username,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    const validation = validateInvoice(invoice)
    if (!validation.isValid) {
      toast.error(`Validation failed: ${validation.errors[0]?.message}`)
      return
    }

    setInvoices((current) => [...(current || []), invoice])
    toast.success(`Invoice ${invoice.invoiceNumber} generated successfully`)
    setCreateInvoiceDialog(false)
    setSelectedFolioId('')
  }

  const finalizeInvoice = (invoiceId: string) => {
    setInvoices((current) =>
      (current || []).map(inv => {
        if (inv.id === invoiceId) {
          const glEntries = createGLEntriesForInvoice(inv)
          return {
            ...inv,
            status: 'final' as GuestInvoiceStatus,
            finalizedAt: Date.now(),
            finalizedBy: currentUser.username,
            isPostedToAccounts: true,
            postedToAccountsAt: Date.now(),
            postedToAccountsBy: currentUser.username,
            glEntries,
            auditTrail: [
              ...inv.auditTrail,
              createInvoiceAuditEntry(
                'finalized',
                'Invoice finalized and posted to accounts',
                currentUser.username
              ),
              createInvoiceAuditEntry(
                'posted-to-accounts',
                `Posted ${glEntries.length} GL entries`,
                currentUser.username
              )
            ]
          }
        }
        return inv
      })
    )
    toast.success('Invoice finalized and posted to accounts')
  }

  const sendInvoiceEmail = async (invoice: GuestInvoice) => {
    if (!invoice.guestEmail) {
      toast.error('Guest email not available')
      return
    }

    const hotelInfo = {
      name: 'W3 Hotel',
      address: '123 Hotel Street, Colombo',
      phone: '+94 11 2345678',
      email: 'info@w3hotel.com'
    }

    const emailContent = formatInvoiceForEmail(invoice, hotelInfo)
    
    console.log('Email would be sent:', emailContent)

    setInvoices((current) =>
      (current || []).map(inv => {
        if (inv.id === invoice.id) {
          return {
            ...inv,
            emailDeliveryStatus: 'emailed' as const,
            emailDeliveredAt: Date.now(),
            deliveryMethods: [
              ...(inv.deliveryMethods || []),
              {
                method: 'email' as const,
                status: 'emailed' as const,
                recipient: invoice.guestEmail!,
                attemptedAt: Date.now(),
                deliveredAt: Date.now(),
                retryCount: 0,
                deliveredBy: currentUser.username
              }
            ],
            auditTrail: [
              ...inv.auditTrail,
              createInvoiceAuditEntry(
                'emailed',
                `Invoice emailed to ${invoice.guestEmail}`,
                currentUser.username
              )
            ]
          }
        }
        return inv
      })
    )

    toast.success(`Invoice emailed to ${invoice.guestEmail}`)
  }

  const printInvoice = (invoice: GuestInvoice) => {
    setInvoices((current) =>
      (current || []).map(inv => {
        if (inv.id === invoice.id) {
          return {
            ...inv,
            printedAt: Date.now(),
            printedBy: currentUser.username,
            deliveryMethods: [
              ...(inv.deliveryMethods || []),
              {
                method: 'print' as const,
                status: 'printed' as const,
                attemptedAt: Date.now(),
                deliveredAt: Date.now(),
                retryCount: 0,
                deliveredBy: currentUser.username
              }
            ],
            auditTrail: [
              ...inv.auditTrail,
              createInvoiceAuditEntry('printed', 'Invoice printed', currentUser.username)
            ]
          }
        }
        return inv
      })
    )
    toast.success('Invoice sent to printer')
  }

  const downloadInvoice = (invoice: GuestInvoice) => {
    setInvoices((current) =>
      (current || []).map(inv => {
        if (inv.id === invoice.id) {
          return {
            ...inv,
            downloadedAt: Date.now(),
            downloadedBy: currentUser.username,
            auditTrail: [
              ...inv.auditTrail,
              createInvoiceAuditEntry('updated', 'Invoice PDF downloaded', currentUser.username)
            ]
          }
        }
        return inv
      })
    )
    toast.success('Invoice PDF downloaded')
  }

  const filteredInvoices = (invoices || []).filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.guestName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadgeVariant = (status: GuestInvoiceStatus) => {
    switch (status) {
      case 'final': return 'default'
      case 'draft': return 'secondary'
      case 'posted': return 'outline'
      case 'cancelled': return 'destructive'
      default: return 'secondary'
    }
  }

  const stats = {
    total: filteredInvoices.length,
    draft: filteredInvoices.filter(i => i.status === 'draft').length,
    finalized: filteredInvoices.filter(i => i.status === 'final' || i.status === 'posted').length,
    totalRevenue: filteredInvoices.reduce((sum, i) => sum + i.grandTotal, 0),
    outstanding: filteredInvoices.reduce((sum, i) => sum + i.amountDue, 0)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-semibold">Guest Invoicing</h1>
        <p className="text-muted-foreground mt-1">Generate and manage guest invoices with multi-currency and tax support</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Invoices</h3>
            <Receipt size={20} className="text-primary" />
          </div>
          <p className="text-2xl font-semibold">{stats.total}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Draft</h3>
            <Clock size={20} className="text-accent" />
          </div>
          <p className="text-2xl font-semibold">{stats.draft}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Finalized</h3>
            <CheckCircle size={20} className="text-success" />
          </div>
          <p className="text-2xl font-semibold">{stats.finalized}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
            <CurrencyDollar size={20} className="text-primary" />
          </div>
          <p className="text-2xl font-semibold">{formatCurrency(stats.totalRevenue)}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-destructive">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Outstanding</h3>
            <Warning size={20} className="text-destructive" />
          </div>
          <p className="text-2xl font-semibold">{formatCurrency(stats.outstanding)}</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by invoice number or guest name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="final">Final</SelectItem>
              <SelectItem value="posted">Posted</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setCreateInvoiceDialog(true)}>
            <Plus size={18} className="mr-2" />
            Generate Invoice
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell className="capitalize">{invoice.invoiceType.replace('-', ' ')}</TableCell>
                  <TableCell>{invoice.guestName}</TableCell>
                  <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                  <TableCell>{formatCurrency(invoice.grandTotal)}</TableCell>
                  <TableCell>{formatCurrency(invoice.totalPaid)}</TableCell>
                  <TableCell className={invoice.amountDue > 0 ? 'text-destructive font-medium' : 'text-success'}>
                    {formatCurrency(invoice.amountDue)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          setSelectedInvoice(invoice)
                          setViewInvoiceDialog(true)
                        }}
                      >
                        <FileText size={16} />
                      </Button>
                      {invoice.status === 'draft' && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => finalizeInvoice(invoice.id)}
                        >
                          <CheckCircle size={16} />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => printInvoice(invoice)}
                      >
                        <Printer size={16} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => sendInvoiceEmail(invoice)}
                        disabled={!invoice.guestEmail}
                      >
                        <Envelope size={16} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => downloadInvoice(invoice)}
                      >
                        <Download size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={createInvoiceDialog} onOpenChange={setCreateInvoiceDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate New Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Invoice Type</Label>
              <Select value={invoiceType} onValueChange={(value) => setInvoiceType(value as GuestInvoiceType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guest-folio">Guest Folio Invoice</SelectItem>
                  <SelectItem value="room-only">Room-Only Invoice</SelectItem>
                  <SelectItem value="fnb-only">F&B Only Invoice</SelectItem>
                  <SelectItem value="extras-only">Extras Only Invoice</SelectItem>
                  <SelectItem value="group-master">Group Master Invoice</SelectItem>
                  <SelectItem value="proforma">Pro-forma Invoice</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Select Folio</Label>
              <Select value={selectedFolioId} onValueChange={setSelectedFolioId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a folio" />
                </SelectTrigger>
                <SelectContent>
                  {folios.map((folio) => {
                    const guest = guests.find(g => g.id === folio.guestId)
                    return (
                      <SelectItem key={folio.id} value={folio.id}>
                        {guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown'} - {formatCurrency(folio.balance)}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setCreateInvoiceDialog(false)}>Cancel</Button>
              <Button onClick={generateInvoice}>Generate Invoice</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={viewInvoiceDialog} onOpenChange={setViewInvoiceDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedInvoice && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl">Invoice {selectedInvoice.invoiceNumber}</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Guest Information</h4>
                  <p><strong>Name:</strong> {selectedInvoice.guestName}</p>
                  {selectedInvoice.guestEmail && <p><strong>Email:</strong> {selectedInvoice.guestEmail}</p>}
                  {selectedInvoice.guestPhone && <p><strong>Phone:</strong> {selectedInvoice.guestPhone}</p>}
                  {selectedInvoice.guestAddress && <p><strong>Address:</strong> {selectedInvoice.guestAddress}</p>}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Invoice Details</h4>
                  <p><strong>Type:</strong> {selectedInvoice.invoiceType.replace('-', ' ')}</p>
                  <p><strong>Date:</strong> {formatDate(selectedInvoice.invoiceDate)}</p>
                  <p><strong>Status:</strong> <Badge variant={getStatusBadgeVariant(selectedInvoice.status)}>{selectedInvoice.status}</Badge></p>
                  {selectedInvoice.roomNumber && <p><strong>Room:</strong> {selectedInvoice.roomNumber}</p>}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Line Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Service Charge</TableHead>
                      <TableHead>Tax</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.description}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(item.date)} • {item.department}</p>
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell>{formatCurrency(item.serviceChargeAmount)}</TableCell>
                        <TableCell>{formatCurrency(item.totalTax)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.lineGrandTotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                {selectedInvoice.totalDiscount > 0 && (
                  <div className="flex justify-between text-sm text-destructive">
                    <span>Discounts:</span>
                    <span>-{formatCurrency(selectedInvoice.totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Service Charge ({selectedInvoice.serviceChargeRate}%):</span>
                  <span>{formatCurrency(selectedInvoice.serviceChargeAmount)}</span>
                </div>
                {selectedInvoice.taxLines.map((tax, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{tax.taxName} ({tax.taxRate}%):</span>
                    <span>{formatCurrency(tax.taxAmount)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(selectedInvoice.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-success">
                  <span>Paid:</span>
                  <span>{formatCurrency(selectedInvoice.totalPaid)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-destructive">
                  <span>Balance Due:</span>
                  <span>{formatCurrency(selectedInvoice.amountDue)}</span>
                </div>
              </div>

              {selectedInvoice.isPostedToAccounts && selectedInvoice.glEntries && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3">GL Entries</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Account</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Debit</TableHead>
                          <TableHead className="text-right">Credit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoice.glEntries.map((entry, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-mono text-xs">{entry.accountCode} - {entry.accountName}</TableCell>
                            <TableCell className="text-sm">{entry.description}</TableCell>
                            <TableCell className="text-right">{entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</TableCell>
                            <TableCell className="text-right">{entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
