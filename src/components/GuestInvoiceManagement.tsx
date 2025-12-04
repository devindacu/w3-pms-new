import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Receipt,
  MagnifyingGlass,
  Plus,
  Eye,
  PencilSimple,
  Download,
  ShareNetwork,
  EnvelopeSimple,
  Printer,
  FileText,
  Funnel,
  Calendar,
  CurrencyDollar,
  CheckCircle,
  Clock,
  XCircle,
  Warning
} from '@phosphor-icons/react'
import type { GuestInvoice, SystemUser, GuestInvoiceStatus, GuestInvoiceType } from '@/lib/types'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/helpers'
import { toast } from 'sonner'
import { GuestInvoiceViewDialog } from './GuestInvoiceViewDialog'
import { GuestInvoiceEditDialog } from './GuestInvoiceEditDialog'
import { InvoiceDownloadDialog } from './InvoiceDownloadDialog'
import { InvoiceShareDialog } from './InvoiceShareDialog'

interface GuestInvoiceManagementProps {
  invoices: GuestInvoice[]
  setInvoices: (fn: (invoices: GuestInvoice[]) => GuestInvoice[]) => void
  currentUser: SystemUser
}

const hotelInfo = {
  name: 'W3 Hotel & Resorts',
  address: '123 Luxury Avenue, Paradise City, PC 12345',
  phone: '+1 (555) 123-4567',
  email: 'billing@w3hotel.com',
  website: 'www.w3hotel.com',
  taxRegistrationNumber: 'GST-123456789',
  logo: ''
}

export function GuestInvoiceManagement({ invoices, setInvoices, currentUser }: GuestInvoiceManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<GuestInvoiceStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<GuestInvoiceType | 'all'>('all')
  const [selectedInvoice, setSelectedInvoice] = useState<GuestInvoice | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
    const matchesType = typeFilter === 'all' || inv.invoiceType === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const handleView = (invoice: GuestInvoice) => {
    setSelectedInvoice(invoice)
    setViewDialogOpen(true)
  }

  const handleEdit = (invoice: GuestInvoice) => {
    if (invoice.status === 'final' || invoice.status === 'posted') {
      toast.error('Cannot edit finalized or posted invoices')
      return
    }
    setSelectedInvoice(invoice)
    setEditDialogOpen(true)
  }

  const handleDownload = (invoice: GuestInvoice) => {
    setSelectedInvoice(invoice)
    setDownloadDialogOpen(true)
  }

  const handleShare = (invoice: GuestInvoice) => {
    setSelectedInvoice(invoice)
    setShareDialogOpen(true)
  }

  const handleQuickPrint = (invoice: GuestInvoice) => {
    const printWindow = window.open('', '', 'height=800,width=800')
    if (!printWindow) {
      toast.error('Please allow popups to print')
      return
    }

    const htmlContent = generateInvoiceHTML(invoice, hotelInfo)
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()

    setTimeout(() => {
      printWindow.print()
    }, 250)

    toast.success('Invoice sent to printer')
  }

  const handleQuickEmail = (invoice: GuestInvoice) => {
    if (!invoice.guestEmail) {
      toast.error('No email address on file for this guest')
      return
    }
    setSelectedInvoice(invoice)
    setShareDialogOpen(true)
  }

  const getStatusBadge = (status: GuestInvoiceStatus) => {
    const variants: Record<GuestInvoiceStatus, { variant: any; icon: any; label: string }> = {
      draft: { variant: 'secondary', icon: <Clock size={14} />, label: 'Draft' },
      interim: { variant: 'secondary', icon: <Clock size={14} />, label: 'Interim' },
      final: { variant: 'default', icon: <CheckCircle size={14} />, label: 'Final' },
      posted: { variant: 'default', icon: <FileText size={14} />, label: 'Posted' },
      cancelled: { variant: 'destructive', icon: <XCircle size={14} />, label: 'Cancelled' },
      refunded: { variant: 'destructive', icon: <XCircle size={14} />, label: 'Refunded' },
      'partially-refunded': { variant: 'secondary', icon: <Warning size={14} />, label: 'Partially Refunded' }
    }

    const config = variants[status]
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  const stats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    final: invoices.filter(i => i.status === 'final').length,
    posted: invoices.filter(i => i.status === 'posted').length,
    outstanding: invoices.filter(i => i.amountDue > 0 && i.status !== 'cancelled').length,
    totalRevenue: invoices
      .filter(i => i.status !== 'cancelled')
      .reduce((sum, inv) => sum + inv.grandTotal, 0),
    totalOutstanding: invoices
      .filter(i => i.status !== 'cancelled')
      .reduce((sum, inv) => sum + inv.amountDue, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">Guest Invoices</h1>
          <p className="text-muted-foreground mt-1">
            View, edit, download, and share guest invoices
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Invoices</span>
            <Receipt size={20} className="text-primary" />
          </div>
          <p className="text-2xl font-semibold">{stats.total}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Revenue</span>
            <CurrencyDollar size={20} className="text-accent" />
          </div>
          <p className="text-2xl font-semibold">{formatCurrency(stats.totalRevenue)}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Posted Invoices</span>
            <CheckCircle size={20} className="text-success" />
          </div>
          <p className="text-2xl font-semibold">{stats.posted}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-destructive">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Outstanding</span>
            <Warning size={20} className="text-destructive" />
          </div>
          <p className="text-2xl font-semibold">{formatCurrency(stats.totalOutstanding)}</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search by invoice number, guest name, room, or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-full md:w-48">
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
              <SelectItem value="partially-refunded">Partially Refunded</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
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
              <SelectItem value="proforma">Proforma</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <Receipt size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No invoices found</p>
            </div>
          ) : (
            filteredInvoices.map(invoice => (
              <Card key={invoice.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{invoice.invoiceNumber}</h3>
                      {getStatusBadge(invoice.status)}
                      {invoice.amountDue > 0 && invoice.status !== 'cancelled' && (
                        <Badge variant="outline" className="text-destructive border-destructive">
                          Due: {formatCurrency(invoice.amountDue)}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Guest:</span> {invoice.guestName}
                      </div>
                      {invoice.roomNumber && (
                        <div>
                          <span className="font-medium">Room:</span> {invoice.roomNumber}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Date:</span> {formatDate(invoice.invoiceDate)}
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span>{' '}
                        <span className="text-foreground font-semibold">
                          {formatCurrency(invoice.grandTotal)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Paid:</span> {formatCurrency(invoice.totalPaid)}
                      </div>
                      {invoice.guestEmail && (
                        <div className="truncate">
                          <span className="font-medium">Email:</span> {invoice.guestEmail}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleView(invoice)}>
                      <Eye size={16} className="mr-1" />
                      View
                    </Button>
                    {(invoice.status === 'draft' || invoice.status === 'final') && (
                      <Button variant="outline" size="sm" onClick={() => handleEdit(invoice)}>
                        <PencilSimple size={16} className="mr-1" />
                        Edit
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleDownload(invoice)}>
                      <Download size={16} className="mr-1" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleShare(invoice)}>
                      <ShareNetwork size={16} className="mr-1" />
                      Share
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleQuickPrint(invoice)}>
                      <Printer size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleQuickEmail(invoice)}>
                      <EnvelopeSimple size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>

      {selectedInvoice && (
        <>
          <GuestInvoiceViewDialog
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
            invoice={selectedInvoice}
            hotelInfo={hotelInfo}
            currentUser={currentUser}
          />
          <GuestInvoiceEditDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            invoice={selectedInvoice}
            onSave={updatedInvoice => {
              setInvoices(invoices =>
                invoices.map(inv => (inv.id === updatedInvoice.id ? updatedInvoice : inv))
              )
              toast.success('Invoice updated successfully')
            }}
            currentUser={currentUser}
          />
          <InvoiceDownloadDialog
            open={downloadDialogOpen}
            onOpenChange={setDownloadDialogOpen}
            invoice={selectedInvoice}
            hotelInfo={hotelInfo}
          />
          <InvoiceShareDialog
            open={shareDialogOpen}
            onOpenChange={setShareDialogOpen}
            invoice={selectedInvoice}
            hotelInfo={hotelInfo}
            onShare={(method, recipient) => {
              setInvoices(invoices =>
                invoices.map(inv =>
                  inv.id === selectedInvoice.id
                    ? {
                        ...inv,
                        deliveryMethods: [
                          ...(inv.deliveryMethods || []),
                          {
                            method,
                            status: method === 'email' ? 'emailed' : 'downloaded',
                            recipient,
                            attemptedAt: Date.now(),
                            deliveredAt: Date.now(),
                            retryCount: 0,
                            deliveredBy: currentUser.id
                          }
                        ],
                        auditTrail: [
                          ...(inv.auditTrail || []),
                          {
                            id: `audit-${Date.now()}`,
                            action: method === 'email' ? 'emailed' : 'printed',
                            description: `Invoice shared via ${method} to ${recipient}`,
                            performedBy: currentUser.id,
                            performedAt: Date.now()
                          }
                        ]
                      }
                    : inv
                )
              )
            }}
          />
        </>
      )}
    </div>
  )
}

function generateInvoiceHTML(invoice: GuestInvoice, hotelInfo: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'IBM Plex Sans', Arial, sans-serif; 
          font-size: 12pt; 
          line-height: 1.6; 
          color: #000;
          padding: 40px;
        }
        .invoice-header { margin-bottom: 40px; display: flex; justify-content: space-between; }
        .hotel-info h1 { font-size: 24pt; margin-bottom: 10px; color: #1a4d2e; }
        .hotel-info p { font-size: 10pt; color: #555; margin: 2px 0; }
        .invoice-meta { text-align: right; }
        .invoice-meta h2 { font-size: 28pt; color: #1a4d2e; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f5f5f5; font-weight: 600; }
        .text-right { text-align: right; }
        .totals { margin-top: 20px; }
        .totals td { border: none; }
        .grand-total { font-size: 14pt; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div class="hotel-info">
          <h1>${hotelInfo.name}</h1>
          <p>${hotelInfo.address}</p>
          <p>Phone: ${hotelInfo.phone}</p>
          <p>Email: ${hotelInfo.email}</p>
        </div>
        <div class="invoice-meta">
          <h2>INVOICE</h2>
          <p><strong>${invoice.invoiceNumber}</strong></p>
          <p>Date: ${formatDate(invoice.invoiceDate)}</p>
        </div>
      </div>
      
      <div>
        <strong>Bill To:</strong>
        <p>${invoice.guestName}</p>
        ${invoice.guestAddress ? `<p>${invoice.guestAddress}</p>` : ''}
        ${invoice.guestEmail ? `<p>${invoice.guestEmail}</p>` : ''}
        ${invoice.guestPhone ? `<p>${invoice.guestPhone}</p>` : ''}
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="text-right">Qty</th>
            <th class="text-right">Unit Price</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.lineItems.map(item => `
            <tr>
              <td>${item.description}</td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">${formatCurrency(item.unitPrice)}</td>
              <td class="text-right">${formatCurrency(item.lineTotal)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="totals">
        <table>
          <tr>
            <td></td>
            <td class="text-right"><strong>Subtotal:</strong></td>
            <td class="text-right">${formatCurrency(invoice.subtotal)}</td>
          </tr>
          ${invoice.totalDiscount > 0 ? `
          <tr>
            <td></td>
            <td class="text-right"><strong>Discount:</strong></td>
            <td class="text-right">-${formatCurrency(invoice.totalDiscount)}</td>
          </tr>
          ` : ''}
          ${invoice.serviceChargeAmount > 0 ? `
          <tr>
            <td></td>
            <td class="text-right"><strong>Service Charge:</strong></td>
            <td class="text-right">${formatCurrency(invoice.serviceChargeAmount)}</td>
          </tr>
          ` : ''}
          ${invoice.taxLines?.map(tax => `
          <tr>
            <td></td>
            <td class="text-right"><strong>${tax.taxName} (${tax.taxRate}%):</strong></td>
            <td class="text-right">${formatCurrency(tax.taxAmount)}</td>
          </tr>
          `).join('') || ''}
          <tr>
            <td></td>
            <td class="text-right grand-total">GRAND TOTAL:</td>
            <td class="text-right grand-total">${formatCurrency(invoice.grandTotal)}</td>
          </tr>
          ${invoice.totalPaid > 0 ? `
          <tr>
            <td></td>
            <td class="text-right"><strong>Amount Paid:</strong></td>
            <td class="text-right">${formatCurrency(invoice.totalPaid)}</td>
          </tr>
          <tr>
            <td></td>
            <td class="text-right"><strong>Balance Due:</strong></td>
            <td class="text-right">${formatCurrency(invoice.amountDue)}</td>
          </tr>
          ` : ''}
        </table>
      </div>
      
      ${invoice.paymentInstructions ? `
      <div style="margin-top: 30px;">
        <strong>Payment Instructions:</strong>
        <p>${invoice.paymentInstructions}</p>
      </div>
      ` : ''}
    </body>
    </html>
  `
}
