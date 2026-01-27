import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Download,
  Printer,
  ShareNetwork,
  EnvelopeSimple,
  Copy,
  CheckCircle,
  X,
  FileText,
  ArrowLeft
} from '@phosphor-icons/react'
import type { GuestInvoice, SystemUser } from '@/lib/types'
import { formatCurrency } from '@/lib/helpers'
import { formatInvoiceForEmail } from '@/lib/invoiceHelpers'
import { toast } from 'sonner'
import { PrintButton } from '@/components/PrintButton'
import { A4PrintWrapper } from '@/components/A4PrintWrapper'

interface InvoiceViewerProps {
  invoice: GuestInvoice
  hotelInfo: {
    name: string
    address: string
    phone: string
    email: string
    website?: string
    taxRegistrationNumber?: string
    logo?: string
  }
  currentUser: SystemUser
  onClose?: () => void
}

export function InvoiceViewer({ invoice, hotelInfo, currentUser, onClose }: InvoiceViewerProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [emailTo, setEmailTo] = useState(invoice.guestEmail || '')
  const [emailCC, setEmailCC] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const printContent = printRef.current
    if (!printContent) return

    const printWindow = window.open('', '', 'height=800,width=800')
    if (!printWindow) {
      toast.error('Please allow popups to print')
      return
    }

    printWindow.document.write(`
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
          .invoice-header { margin-bottom: 40px; display: flex; justify-content: space-between; align-items: start; }
          .hotel-info h1 { font-size: 24pt; margin-bottom: 10px; color: #1a4d2e; }
          .hotel-info p { font-size: 10pt; color: #555; margin: 2px 0; }
          .invoice-meta { text-align: right; }
          .invoice-meta h2 { font-size: 28pt; color: #1a4d2e; margin-bottom: 10px; }
          .invoice-meta p { font-size: 10pt; margin: 4px 0; }
          .badge { 
            display: inline-block; 
            padding: 4px 12px; 
            border-radius: 4px; 
            font-size: 9pt;
            font-weight: 600;
            margin-top: 8px;
          }
          .badge.final { background: #d1fae5; color: #065f46; }
          .badge.draft { background: #fef3c7; color: #92400e; }
          .section-title { 
            font-size: 11pt; 
            font-weight: 600; 
            text-transform: uppercase; 
            color: #666; 
            margin: 30px 0 15px 0;
            letter-spacing: 0.5px;
          }
          .bill-to { margin: 20px 0; }
          .bill-to h3 { font-size: 10pt; font-weight: 600; margin-bottom: 8px; }
          .bill-to p { font-size: 10pt; margin: 2px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          thead { background: #f9fafb; }
          th { 
            padding: 12px 8px; 
            text-align: left; 
            font-size: 9pt; 
            font-weight: 600; 
            text-transform: uppercase; 
            color: #666;
            border-bottom: 2px solid #1a4d2e;
          }
          th.right, td.right { text-align: right; }
          th.center, td.center { text-align: center; }
          td { 
            padding: 10px 8px; 
            font-size: 10pt; 
            border-bottom: 1px solid #e5e7eb; 
          }
          tbody tr:hover { background: #f9fafb; }
          .summary-table { margin-top: 30px; }
          .summary-table table { width: auto; margin-left: auto; min-width: 300px; }
          .summary-table td { border: none; padding: 8px 16px; }
          .summary-table tr.total { font-weight: 700; font-size: 12pt; }
          .summary-table tr.total td { 
            border-top: 2px solid #1a4d2e; 
            padding-top: 16px; 
            color: #1a4d2e;
          }
          .footer { 
            margin-top: 60px; 
            padding-top: 20px; 
            border-top: 1px solid #e5e7eb; 
            font-size: 9pt; 
            color: #666;
          }
          .tax-breakdown { 
            background: #f9fafb; 
            padding: 16px; 
            margin: 20px 0; 
            border-left: 3px solid #1a4d2e;
          }
          .tax-breakdown h4 { font-size: 10pt; margin-bottom: 10px; }
          .tax-breakdown table { margin: 0; background: white; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
      </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)

    toast.success('Invoice sent to printer')
  }

  const handleDownloadPDF = () => {
    const printContent = printRef.current
    if (!printContent) return

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif; 
            font-size: 12pt; 
            padding: 40px;
          }
          /* Add all styles from print */
        </style>
      </head>
      <body>${printContent.innerHTML}</body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Invoice-${invoice.invoiceNumber}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Invoice downloaded successfully')
  }

  const handleCopyLink = () => {
    const invoiceUrl = `${window.location.origin}/invoices/${invoice.id}`
    navigator.clipboard.writeText(invoiceUrl)
    toast.success('Invoice link copied to clipboard')
  }

  const handleEmailSend = async () => {
    if (!emailTo) {
      toast.error('Please enter recipient email')
      return
    }

    setIsSending(true)
    
    try {
      const { subject, htmlBody } = formatInvoiceForEmail(invoice, hotelInfo)
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success(`Invoice emailed to ${emailTo}`)
      setEmailDialogOpen(false)
      setEmailTo(invoice.guestEmail || '')
      setEmailCC('')
      setEmailMessage('')
    } catch (error) {
      toast.error('Failed to send email')
    } finally {
      setIsSending(false)
    }
  }

  const getStatusBadgeClass = (status: GuestInvoice['status']) => {
    const classes = {
      draft: 'bg-yellow-100 text-yellow-800',
      interim: 'bg-blue-100 text-blue-800',
      final: 'bg-green-100 text-green-800',
      posted: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-orange-100 text-orange-800',
      'partially-refunded': 'bg-orange-100 text-orange-800'
    }
    return classes[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft size={18} />
              </Button>
            )}
            <div>
              <h2 className="text-2xl font-semibold">Invoice {invoice.invoiceNumber}</h2>
              <p className="text-sm text-muted-foreground">
                {invoice.guestName} • {new Date(invoice.invoiceDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PrintButton
              elementId="invoice-viewer-print"
              options={{
                title: `Invoice ${invoice.invoiceNumber}`,
                filename: `invoice-${invoice.invoiceNumber}.pdf`
              }}
              variant="outline"
            />
            <Button variant="outline" onClick={handlePrint}>
              <Printer size={18} className="mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download size={18} className="mr-2" />
              Download
            </Button>
            <Button onClick={() => setShareDialogOpen(true)}>
              <ShareNetwork size={18} className="mr-2" />
              Share
            </Button>
          </div>
        </div>

        <Card className="p-0 overflow-hidden">
          <div ref={printRef} className="p-8 md:p-12 bg-white">
            <div className="invoice-header flex justify-between items-start mb-8">
              <div className="hotel-info">
                <h1 className="text-3xl font-semibold text-primary mb-2">{hotelInfo.name}</h1>
                <p className="text-sm text-muted-foreground">{hotelInfo.address}</p>
                <p className="text-sm text-muted-foreground">Phone: {hotelInfo.phone}</p>
                <p className="text-sm text-muted-foreground">Email: {hotelInfo.email}</p>
                {hotelInfo.website && <p className="text-sm text-muted-foreground">Web: {hotelInfo.website}</p>}
                {hotelInfo.taxRegistrationNumber && (
                  <p className="text-sm text-muted-foreground mt-2">Tax Reg: {hotelInfo.taxRegistrationNumber}</p>
                )}
              </div>

              <div className="invoice-meta text-right">
                <h2 className="text-4xl font-bold text-primary mb-2">INVOICE</h2>
                <p className="text-sm"><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
                <p className="text-sm"><strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                {invoice.dueDate && (
                  <p className="text-sm"><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                )}
                <Badge className={`mt-2 ${getStatusBadgeClass(invoice.status)}`}>
                  {invoice.status.replace('-', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="section-title">BILL TO</div>
            <div className="bill-to bg-muted/30 p-4 rounded">
              <h3 className="font-semibold text-lg">{invoice.guestName}</h3>
              {invoice.companyName && <p className="text-sm font-medium mt-1">{invoice.companyName}</p>}
              {invoice.guestAddress && <p className="text-sm">{invoice.guestAddress}</p>}
              {invoice.guestEmail && <p className="text-sm">Email: {invoice.guestEmail}</p>}
              {invoice.guestPhone && <p className="text-sm">Phone: {invoice.guestPhone}</p>}
              {invoice.companyGSTNumber && <p className="text-sm mt-1">GST: {invoice.companyGSTNumber}</p>}
            </div>

            {invoice.roomNumber && (
              <>
                <div className="section-title">STAY DETAILS</div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Room Number</p>
                    <p className="font-semibold">{invoice.roomNumber}</p>
                  </div>
                  {invoice.checkInDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Check In</p>
                      <p className="font-semibold">{new Date(invoice.checkInDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {invoice.checkOutDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Check Out</p>
                      <p className="font-semibold">{new Date(invoice.checkOutDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="section-title">CHARGES</div>
            <table className="w-full">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th className="center">Qty</th>
                  <th className="right">Unit Price</th>
                  <th className="right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="text-sm">{new Date(item.date).toLocaleDateString()}</td>
                    <td>
                      <div className="font-medium">{item.description}</div>
                      {item.notes && <div className="text-xs text-muted-foreground mt-1">{item.notes}</div>}
                    </td>
                    <td className="center">{item.quantity}</td>
                    <td className="right">{formatCurrency(item.unitPrice)}</td>
                    <td className="right font-semibold">{formatCurrency(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {invoice.taxLines && invoice.taxLines.length > 0 && (
              <div className="tax-breakdown">
                <h4 className="font-semibold mb-2">Tax Breakdown</h4>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th>Tax Type</th>
                      <th className="right">Rate</th>
                      <th className="right">Taxable Amount</th>
                      <th className="right">Tax Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.taxLines.map((tax, idx) => (
                      <tr key={idx}>
                        <td className="text-sm">{tax.taxName}</td>
                        <td className="text-sm right">{tax.taxRate}%</td>
                        <td className="text-sm right">{formatCurrency(tax.taxableAmount)}</td>
                        <td className="text-sm right font-semibold">{formatCurrency(tax.taxAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="summary-table">
              <table>
                <tbody>
                  <tr>
                    <td className="text-muted-foreground">Subtotal:</td>
                    <td className="right font-semibold">{formatCurrency(invoice.subtotal)}</td>
                  </tr>
                  {invoice.totalDiscount > 0 && (
                    <tr>
                      <td className="text-muted-foreground">Discount:</td>
                      <td className="right text-destructive">-{formatCurrency(invoice.totalDiscount)}</td>
                    </tr>
                  )}
                  {invoice.serviceChargeAmount > 0 && (
                    <tr>
                      <td className="text-muted-foreground">Service Charge ({invoice.serviceChargeRate}%):</td>
                      <td className="right font-semibold">{formatCurrency(invoice.serviceChargeAmount)}</td>
                    </tr>
                  )}
                  {invoice.totalTax > 0 && (
                    <tr>
                      <td className="text-muted-foreground">Total Tax:</td>
                      <td className="right font-semibold">{formatCurrency(invoice.totalTax)}</td>
                    </tr>
                  )}
                  <tr className="total">
                    <td>GRAND TOTAL:</td>
                    <td className="right">{formatCurrency(invoice.grandTotal)}</td>
                  </tr>
                  {invoice.totalPaid > 0 && (
                    <>
                      <tr>
                        <td className="text-muted-foreground">Amount Paid:</td>
                        <td className="right text-success">-{formatCurrency(invoice.totalPaid)}</td>
                      </tr>
                      <tr className="total">
                        <td>AMOUNT DUE:</td>
                        <td className="right text-destructive">{formatCurrency(invoice.amountDue)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {invoice.payments && invoice.payments.length > 0 && (
              <>
                <div className="section-title">PAYMENTS RECEIVED</div>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Payment Method</th>
                      <th>Reference</th>
                      <th className="right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="text-sm">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                        <td className="text-sm capitalize">{payment.paymentType.replace('-', ' ')}</td>
                        <td className="text-sm">{payment.reference || '-'}</td>
                        <td className="right font-semibold">{formatCurrency(payment.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {(invoice.termsAndConditions || invoice.paymentInstructions) && (
              <div className="footer">
                {invoice.paymentInstructions && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2">Payment Instructions:</h4>
                    <p className="text-xs text-muted-foreground whitespace-pre-line">{invoice.paymentInstructions}</p>
                  </div>
                )}
                {invoice.termsAndConditions && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Terms & Conditions:</h4>
                    <p className="text-xs text-muted-foreground whitespace-pre-line">{invoice.termsAndConditions}</p>
                  </div>
                )}
                {invoice.legalDisclaimer && (
                  <p className="text-xs text-muted-foreground mt-4 italic">{invoice.legalDisclaimer}</p>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Invoice</DialogTitle>
            <DialogDescription>
              Choose how you'd like to share this invoice
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setShareDialogOpen(false)
                setEmailDialogOpen(true)
              }}
            >
              <EnvelopeSimple size={20} className="mr-3" />
              Send via Email
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleCopyLink}
            >
              <Copy size={20} className="mr-3" />
              Copy Invoice Link
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setShareDialogOpen(false)
                handleDownloadPDF()
              }}
            >
              <Download size={20} className="mr-3" />
              Download and Share
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email Invoice</DialogTitle>
            <DialogDescription>
              Send invoice {invoice.invoiceNumber} to the guest
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email-to">To *</Label>
              <Input
                id="email-to"
                type="email"
                placeholder="guest@email.com"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="email-cc">CC</Label>
              <Input
                id="email-cc"
                type="email"
                placeholder="Multiple emails separated by comma"
                value={emailCC}
                onChange={(e) => setEmailCC(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="email-message">Additional Message (Optional)</Label>
              <Textarea
                id="email-message"
                placeholder="Add a personal message to the email..."
                rows={4}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
              />
            </div>

            <div className="bg-muted/50 p-4 rounded border">
              <div className="flex items-start gap-2">
                <FileText size={20} className="text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Invoice-{invoice.invoiceNumber}.pdf</p>
                  <p className="text-xs text-muted-foreground">Will be attached to the email</p>
                </div>
                <CheckCircle size={20} className="text-success" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEmailSend} disabled={isSending || !emailTo}>
                {isSending ? (
                  <>Sending...</>
                ) : (
                  <>
                    <EnvelopeSimple size={18} className="mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden print section */}
      <div className="hidden">
        <A4PrintWrapper
          id="invoice-viewer-print"
          title={`Invoice ${invoice.invoiceNumber}`}
          headerContent={
            <div className="text-sm">
              <p><strong>Guest:</strong> {invoice.guestName}</p>
              <p><strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {invoice.status.toUpperCase()}</p>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Invoice Header */}
            <section>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">{hotelInfo.name}</h2>
                  <p className="text-sm">{hotelInfo.address}</p>
                  <p className="text-sm">Phone: {hotelInfo.phone}</p>
                  <p className="text-sm">Email: {hotelInfo.email}</p>
                  {hotelInfo.website && <p className="text-sm">Web: {hotelInfo.website}</p>}
                  {hotelInfo.taxRegistrationNumber && (
                    <p className="text-sm mt-1">Tax Reg: {hotelInfo.taxRegistrationNumber}</p>
                  )}
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold">INVOICE</h2>
                  <p className="text-sm"><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
                  <p className="text-sm"><strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                  {invoice.dueDate && (
                    <p className="text-sm"><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Bill To */}
            <section>
              <h3 className="text-base font-semibold mb-2">BILL TO</h3>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-semibold">{invoice.guestName}</p>
                {invoice.companyName && <p className="text-sm">{invoice.companyName}</p>}
                {invoice.guestAddress && <p className="text-sm">{invoice.guestAddress}</p>}
                {invoice.guestEmail && <p className="text-sm">Email: {invoice.guestEmail}</p>}
                {invoice.guestPhone && <p className="text-sm">Phone: {invoice.guestPhone}</p>}
                {invoice.companyGSTNumber && <p className="text-sm mt-1">GST: {invoice.companyGSTNumber}</p>}
              </div>
            </section>

            {/* Stay Details */}
            {invoice.roomNumber && (
              <section>
                <h3 className="text-base font-semibold mb-2">STAY DETAILS</h3>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-semibold">Room Number</td>
                      <td className="p-2">{invoice.roomNumber}</td>
                      {invoice.checkInDate && (
                        <>
                          <td className="p-2 font-semibold">Check In</td>
                          <td className="p-2">{new Date(invoice.checkInDate).toLocaleDateString()}</td>
                        </>
                      )}
                    </tr>
                    {invoice.checkOutDate && (
                      <tr className="border-b">
                        <td className="p-2 font-semibold">Check Out</td>
                        <td className="p-2">{new Date(invoice.checkOutDate).toLocaleDateString()}</td>
                        <td className="p-2"></td>
                        <td className="p-2"></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>
            )}

            {/* Line Items */}
            <section>
              <h3 className="text-base font-semibold mb-2">CHARGES</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Date</th>
                    <th className="border p-2 text-left">Description</th>
                    <th className="border p-2 text-center">Qty</th>
                    <th className="border p-2 text-right">Unit Price</th>
                    <th className="border p-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td className="border p-2 text-sm">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="border p-2">
                        <div className="font-medium">{item.description}</div>
                        {item.notes && <div className="text-xs text-gray-600">{item.notes}</div>}
                      </td>
                      <td className="border p-2 text-center">{item.quantity}</td>
                      <td className="border p-2 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="border p-2 text-right font-semibold">{formatCurrency(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Tax Breakdown */}
            {invoice.taxLines && invoice.taxLines.length > 0 && (
              <section>
                <h3 className="text-base font-semibold mb-2">TAX BREAKDOWN</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Tax Type</th>
                      <th className="border p-2 text-right">Rate</th>
                      <th className="border p-2 text-right">Taxable Amount</th>
                      <th className="border p-2 text-right">Tax Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.taxLines.map((tax, idx) => (
                      <tr key={idx}>
                        <td className="border p-2">{tax.taxName}</td>
                        <td className="border p-2 text-right">{tax.taxRate}%</td>
                        <td className="border p-2 text-right">{formatCurrency(tax.taxableAmount)}</td>
                        <td className="border p-2 text-right font-semibold">{formatCurrency(tax.taxAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {/* Summary */}
            <section>
              <div className="flex justify-end">
                <table className="w-80 border-collapse">
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">Subtotal:</td>
                      <td className="p-2 text-right font-semibold">{formatCurrency(invoice.subtotal)}</td>
                    </tr>
                    {invoice.totalDiscount > 0 && (
                      <tr className="border-b">
                        <td className="p-2">Discount:</td>
                        <td className="p-2 text-right text-red-600">-{formatCurrency(invoice.totalDiscount)}</td>
                      </tr>
                    )}
                    {invoice.serviceChargeAmount > 0 && (
                      <tr className="border-b">
                        <td className="p-2">Service Charge ({invoice.serviceChargeRate}%):</td>
                        <td className="p-2 text-right font-semibold">{formatCurrency(invoice.serviceChargeAmount)}</td>
                      </tr>
                    )}
                    {invoice.totalTax > 0 && (
                      <tr className="border-b">
                        <td className="p-2">Total Tax:</td>
                        <td className="p-2 text-right font-semibold">{formatCurrency(invoice.totalTax)}</td>
                      </tr>
                    )}
                    <tr className="border-b-2 border-black">
                      <td className="p-2 font-bold">GRAND TOTAL:</td>
                      <td className="p-2 text-right font-bold text-lg">{formatCurrency(invoice.grandTotal)}</td>
                    </tr>
                    {invoice.totalPaid > 0 && (
                      <>
                        <tr className="border-b">
                          <td className="p-2">Amount Paid:</td>
                          <td className="p-2 text-right text-green-600">-{formatCurrency(invoice.totalPaid)}</td>
                        </tr>
                        <tr className="border-b-2 border-black">
                          <td className="p-2 font-bold">AMOUNT DUE:</td>
                          <td className="p-2 text-right font-bold text-lg text-red-600">{formatCurrency(invoice.amountDue)}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Payments */}
            {invoice.payments && invoice.payments.length > 0 && (
              <section>
                <h3 className="text-base font-semibold mb-2">PAYMENTS RECEIVED</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Date</th>
                      <th className="border p-2 text-left">Payment Method</th>
                      <th className="border p-2 text-left">Reference</th>
                      <th className="border p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="border p-2 text-sm">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                        <td className="border p-2 text-sm capitalize">{payment.paymentType.replace('-', ' ')}</td>
                        <td className="border p-2 text-sm">{payment.reference || '-'}</td>
                        <td className="border p-2 text-right font-semibold">{formatCurrency(payment.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {/* Terms and Conditions */}
            {(invoice.termsAndConditions || invoice.paymentInstructions) && (
              <section className="text-sm">
                {invoice.paymentInstructions && (
                  <div className="mb-3">
                    <h4 className="font-semibold mb-1">Payment Instructions:</h4>
                    <p className="text-xs whitespace-pre-line">{invoice.paymentInstructions}</p>
                  </div>
                )}
                {invoice.termsAndConditions && (
                  <div>
                    <h4 className="font-semibold mb-1">Terms & Conditions:</h4>
                    <p className="text-xs whitespace-pre-line">{invoice.termsAndConditions}</p>
                  </div>
                )}
                {invoice.legalDisclaimer && (
                  <p className="text-xs italic mt-3">{invoice.legalDisclaimer}</p>
                )}
              </section>
            )}
          </div>
        </A4PrintWrapper>
      </div>
    </>
  )
}
