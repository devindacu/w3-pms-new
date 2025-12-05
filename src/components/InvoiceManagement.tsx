import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MagnifyingGlass,
  Plus,
  DotsThree,
  Eye,
  PencilSimple,
  Download,
  Trash,
  ShareNetwork,
  Printer,
  Envelope,
  FileText,
  CurrencyDollar,
  Calendar,
  Receipt,
  Clock
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import type { GuestInvoice, GuestInvoiceType, GuestInvoiceStatus, SystemUser, HotelBranding, Payment } from '@/lib/types'
import { InvoiceEditDialog } from '@/components/InvoiceEditDialog'
import { InvoiceViewDialog } from '@/components/InvoiceViewDialog'
import { InvoiceShareDialog } from '@/components/InvoiceShareDialog'
import { PaymentRecordingDialog } from '@/components/PaymentRecordingDialog'
import { PaymentHistoryDialog } from '@/components/PaymentHistoryDialog'
import { formatCurrency } from '@/lib/helpers'

interface InvoiceManagementProps {
  invoices: GuestInvoice[]
  setInvoices: (setter: (current: GuestInvoice[]) => GuestInvoice[]) => void
  branding: HotelBranding | null
  currentUser: SystemUser
}

const getStatusBadgeColor = (status: GuestInvoiceStatus) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800'
    case 'interim':
      return 'bg-blue-100 text-blue-800'
    case 'final':
      return 'bg-green-100 text-green-800'
    case 'posted':
      return 'bg-purple-100 text-purple-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    case 'refunded':
    case 'partially-refunded':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getTypeBadgeColor = (type: GuestInvoiceType) => {
  switch (type) {
    case 'guest-folio':
      return 'bg-blue-100 text-blue-800'
    case 'room-only':
      return 'bg-purple-100 text-purple-800'
    case 'fnb-only':
      return 'bg-orange-100 text-orange-800'
    case 'extras-only':
      return 'bg-teal-100 text-teal-800'
    case 'group-master':
      return 'bg-indigo-100 text-indigo-800'
    case 'proforma':
      return 'bg-gray-100 text-gray-800'
    case 'credit-note':
      return 'bg-red-100 text-red-800'
    case 'debit-note':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function InvoiceManagement({ invoices, setInvoices, branding, currentUser }: InvoiceManagementProps) {
  const [payments, setPayments] = useKV<Payment[]>('w3-hotel-invoice-payments', [])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<GuestInvoiceStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<GuestInvoiceType | 'all'>('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<GuestInvoice | null>(null)
  const [viewingInvoice, setViewingInvoice] = useState<GuestInvoice | null>(null)
  const [sharingInvoice, setSharingInvoice] = useState<GuestInvoice | null>(null)
  const [recordingPaymentFor, setRecordingPaymentFor] = useState<GuestInvoice | null>(null)
  const [viewingPaymentHistoryFor, setViewingPaymentHistoryFor] = useState<GuestInvoice | null>(null)

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
    const matchesType = typeFilter === 'all' || inv.invoiceType === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const handleDownload = (invoice: GuestInvoice) => {
    if (!branding) {
      toast.error('Branding settings not configured')
      return
    }
    
    toast.success(`Downloading invoice ${invoice.invoiceNumber}`)
    
    setInvoices(current => 
      current.map(inv => 
        inv.id === invoice.id
          ? {
              ...inv,
              downloadedBy: currentUser.userId,
              downloadedAt: Date.now(),
              deliveryMethods: [
                ...inv.deliveryMethods.filter(d => d.method !== 'download'),
                {
                  method: 'download' as const,
                  status: 'downloaded' as const,
                  attemptedAt: Date.now(),
                  deliveredAt: Date.now(),
                  retryCount: 0,
                  deliveredBy: currentUser.userId
                }
              ],
              auditTrail: [
                ...inv.auditTrail,
                {
                  id: `audit-${Date.now()}`,
                  action: 'emailed' as const,
                  description: `Invoice downloaded by ${currentUser.firstName} ${currentUser.lastName}`,
                  performedBy: currentUser.userId,
                  performedAt: Date.now()
                }
              ]
            }
          : inv
      )
    )
  }

  const handlePrint = (invoice: GuestInvoice) => {
    if (!branding) {
      toast.error('Branding settings not configured')
      return
    }
    
    window.print()
    toast.success(`Printing invoice ${invoice.invoiceNumber}`)
    
    setInvoices(current => 
      current.map(inv => 
        inv.id === invoice.id
          ? {
              ...inv,
              printedBy: currentUser.userId,
              printedAt: Date.now(),
              deliveryMethods: [
                ...inv.deliveryMethods.filter(d => d.method !== 'print'),
                {
                  method: 'print' as const,
                  status: 'printed' as const,
                  attemptedAt: Date.now(),
                  deliveredAt: Date.now(),
                  retryCount: 0,
                  deliveredBy: currentUser.userId
                }
              ],
              auditTrail: [
                ...inv.auditTrail,
                {
                  id: `audit-${Date.now()}`,
                  action: 'printed' as const,
                  description: `Invoice printed by ${currentUser.firstName} ${currentUser.lastName}`,
                  performedBy: currentUser.userId,
                  performedAt: Date.now()
                }
              ]
            }
          : inv
      )
    )
  }

  const handleDelete = (invoice: GuestInvoice) => {
    if (invoice.status === 'posted' || invoice.status === 'final') {
      toast.error('Cannot delete posted or final invoices')
      return
    }
    
    if (confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      setInvoices(current => current.filter(inv => inv.id !== invoice.id))
      toast.success('Invoice deleted successfully')
    }
  }

  const handlePaymentRecorded = (payment: Payment) => {
    setPayments((currentPayments) => [...(currentPayments || []), payment])
    
    setInvoices((currentInvoices) => 
      currentInvoices.map(inv => {
        if (inv.id === payment.invoiceId) {
          const newTotalPaid = inv.totalPaid + payment.amount
          const newAmountDue = inv.grandTotal - newTotalPaid
          
          return {
            ...inv,
            totalPaid: newTotalPaid,
            amountDue: newAmountDue,
            payments: [
              ...(inv.payments || []),
              {
                id: payment.id,
                paymentDate: payment.processedAt,
                paymentType: payment.method === 'card' ? 'cash' as const : 
                            payment.method === 'bank-transfer' ? 'bank-transfer' as const :
                            payment.method === 'mobile-payment' ? 'mobile-payment' as const :
                            'cash' as const,
                amount: payment.amount,
                currency: inv.currency,
                exchangeRate: inv.exchangeRate,
                amountInBaseCurrency: payment.amount * inv.exchangeRate,
                reference: payment.reference,
                receivedBy: payment.processedBy,
                receivedAt: payment.processedAt,
                isRefunded: false,
                notes: payment.notes
              }
            ],
            auditTrail: [
              ...(inv.auditTrail || []),
              {
                id: `audit-${Date.now()}`,
                action: 'payment-received' as const,
                description: `Payment of ${formatCurrency(payment.amount)} received via ${payment.method}`,
                performedBy: payment.processedBy,
                performedAt: payment.processedAt
              }
            ],
            updatedAt: Date.now()
          }
        }
        return inv
      })
    )
  }

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0)
  const totalPaid = filteredInvoices.reduce((sum, inv) => sum + inv.totalPaid, 0)
  const totalDue = filteredInvoices.reduce((sum, inv) => sum + inv.amountDue, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Invoice Management</h1>
          <p className="text-muted-foreground mt-1">Create, manage, and track all guest invoices</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} size="lg">
          <Plus size={20} className="mr-2" />
          New Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Amount</h3>
            <CurrencyDollar size={20} className="text-primary" />
          </div>
          <p className="text-3xl font-semibold">{formatCurrency(totalAmount)}</p>
          <p className="text-xs text-muted-foreground mt-1">{filteredInvoices.length} invoices</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Paid</h3>
            <CurrencyDollar size={20} className="text-success" />
          </div>
          <p className="text-3xl font-semibold">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-muted-foreground mt-1">Received payments</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-destructive">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Amount Due</h3>
            <CurrencyDollar size={20} className="text-destructive" />
          </div>
          <p className="text-3xl font-semibold">{formatCurrency(totalDue)}</p>
          <p className="text-xs text-muted-foreground mt-1">Outstanding balance</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search by invoice #, guest name, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as GuestInvoiceStatus | 'all')}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="interim">Interim</SelectItem>
              <SelectItem value="final">Final</SelectItem>
              <SelectItem value="posted">Posted</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as GuestInvoiceType | 'all')}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="guest-folio">Guest Folio</SelectItem>
              <SelectItem value="room-only">Room Only</SelectItem>
              <SelectItem value="fnb-only">F&B Only</SelectItem>
              <SelectItem value="extras-only">Extras Only</SelectItem>
              <SelectItem value="group-master">Group Master</SelectItem>
              <SelectItem value="proforma">Proforma</SelectItem>
              <SelectItem value="credit-note">Credit Note</SelectItem>
              <SelectItem value="debit-note">Debit Note</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Guest/Company</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      <FileText size={48} className="mx-auto mb-2 opacity-50" />
                      <p>No invoices found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>
                        <Badge className={getTypeBadgeColor(invoice.invoiceType)}>
                          {invoice.invoiceType.replace(/-/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{invoice.guestName}</p>
                          {invoice.companyName && (
                            <p className="text-xs text-muted-foreground">{invoice.companyName}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} className="text-muted-foreground" />
                          {format(invoice.invoiceDate, 'dd MMM yyyy')}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(invoice.grandTotal)}</TableCell>
                      <TableCell className="text-success">{formatCurrency(invoice.totalPaid)}</TableCell>
                      <TableCell className={invoice.amountDue > 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                        {formatCurrency(invoice.amountDue)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <DotsThree size={20} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewingInvoice(invoice)}>
                              <Eye size={16} className="mr-2" />
                              View
                            </DropdownMenuItem>
                            {invoice.amountDue > 0 && (
                              <DropdownMenuItem onClick={() => setRecordingPaymentFor(invoice)}>
                                <CurrencyDollar size={16} className="mr-2" />
                                Record Payment
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => setViewingPaymentHistoryFor(invoice)}>
                              <Receipt size={16} className="mr-2" />
                              Payment History
                            </DropdownMenuItem>
                            {invoice.status === 'draft' && (
                              <DropdownMenuItem onClick={() => setEditingInvoice(invoice)}>
                                <PencilSimple size={16} className="mr-2" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDownload(invoice)}>
                              <Download size={16} className="mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePrint(invoice)}>
                              <Printer size={16} className="mr-2" />
                              Print
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSharingInvoice(invoice)}>
                              <ShareNetwork size={16} className="mr-2" />
                              Share
                            </DropdownMenuItem>
                            {(invoice.status === 'draft' || invoice.status === 'interim') && (
                              <DropdownMenuItem 
                                onClick={() => handleDelete(invoice)}
                                className="text-destructive"
                              >
                                <Trash size={16} className="mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      <InvoiceEditDialog
        open={createDialogOpen || !!editingInvoice}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false)
            setEditingInvoice(null)
          }
        }}
        invoice={editingInvoice || undefined}
        onSave={(invoice) => {
          if (editingInvoice) {
            setInvoices(current => current.map(inv => inv.id === invoice.id ? invoice : inv))
            toast.success('Invoice updated successfully')
          } else {
            setInvoices(current => [...current, invoice])
            toast.success('Invoice created successfully')
          }
          setEditingInvoice(null)
          setCreateDialogOpen(false)
        }}
        branding={branding}
        currentUser={currentUser}
      />

      {viewingInvoice && branding && (
        <InvoiceViewDialog
          open={!!viewingInvoice}
          onOpenChange={(open) => !open && setViewingInvoice(null)}
          invoice={viewingInvoice}
          branding={branding}
          currentUser={currentUser}
        />
      )}

      {sharingInvoice && branding && (
        <InvoiceShareDialog
          open={!!sharingInvoice}
          onOpenChange={(open) => !open && setSharingInvoice(null)}
          invoice={sharingInvoice}
          onShare={(method, recipient) => {
            setInvoices(current => 
              current.map(inv => 
                inv.id === sharingInvoice.id
                  ? {
                      ...inv,
                      deliveryMethods: [
                        ...inv.deliveryMethods.filter(d => d.method !== method),
                        {
                          method,
                          status: 'emailed' as const,
                          recipient,
                          attemptedAt: Date.now(),
                          deliveredAt: Date.now(),
                          retryCount: 0,
                          deliveredBy: currentUser.userId
                        }
                      ],
                      emailDeliveryStatus: method === 'email' ? 'emailed' as const : inv.emailDeliveryStatus,
                      emailDeliveredAt: method === 'email' ? Date.now() : inv.emailDeliveredAt,
                      auditTrail: [
                        ...inv.auditTrail,
                        {
                          id: `audit-${Date.now()}`,
                          action: 'emailed' as const,
                          description: `Invoice shared via ${method} to ${recipient}`,
                          performedBy: currentUser.userId,
                          performedAt: Date.now()
                        }
                      ]
                    }
                  : inv
              )
            )
            setSharingInvoice(null)
            toast.success(`Invoice sent successfully via ${method}`)
          }}
        />
      )}

      <PaymentRecordingDialog
        open={!!recordingPaymentFor}
        onClose={() => setRecordingPaymentFor(null)}
        invoice={recordingPaymentFor}
        onPaymentRecorded={handlePaymentRecorded}
        currentUser={currentUser}
      />

      <PaymentHistoryDialog
        open={!!viewingPaymentHistoryFor}
        onClose={() => setViewingPaymentHistoryFor(null)}
        invoice={viewingPaymentHistoryFor}
        payments={payments || []}
      />
    </div>
  )
}
