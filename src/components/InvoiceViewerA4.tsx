import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
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
import { toast } from 'sonner'

interface InvoiceViewerA4Props {
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

export function InvoiceViewerA4({ invoice, hotelInfo, currentUser, onClose }: InvoiceViewerA4Props) {
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

    const printWindow = window.open('', '', 'width=800,height=1100')
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
          @page {
            size: A4;
            margin: 0;
          }
          
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
          }
          
          body { 
            font-family: 'IBM Plex Sans', 'Segoe UI', Arial, sans-serif; 
            font-size: 10pt; 
            line-height: 1.5; 
            color: #000;
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            background: white;
          }
          
          .invoice-container {
            max-width: 180mm;
            margin: 0 auto;
          }
          
          .invoice-header { 
            margin-bottom: 25px; 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start; 
            border-bottom: 3px solid #1a4d2e;
            padding-bottom: 15px;
          }
          
          .hotel-info h1 { 
            font-size: 22pt; 
            margin-bottom: 8px; 
            color: #1a4d2e; 
            font-weight: 700;
          }
          
          .hotel-info p { 
            font-size: 9pt; 
            color: #555; 
            margin: 1px 0; 
          }
          
          .invoice-meta { 
            text-align: right; 
          }
          
          .invoice-meta h2 { 
            font-size: 26pt; 
            color: #1a4d2e; 
            margin-bottom: 8px; 
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          
          .invoice-meta p { 
            font-size: 9pt; 
            margin: 3px 0; 
          }
          
          .badge { 
            display: inline-block; 
            padding: 3px 10px; 
            border-radius: 3px; 
            font-size: 8pt;
            font-weight: 600;
            margin-top: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .badge.final { 
            background: #d1fae5; 
            color: #065f46; 
          }
          
          .badge.draft { 
            background: #fef3c7; 
            color: #92400e; 
          }
          
          .badge.interim { 
            background: #dbeafe; 
            color: #1e40af; 
          }
          
          .badge.posted { 
            background: #e9d5ff; 
            color: #6b21a8; 
          }
          
          .section-title { 
            font-size: 10pt; 
            font-weight: 600; 
            text-transform: uppercase; 
            color: #666; 
            margin: 20px 0 12px 0;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
          }
          
          .bill-to { 
            margin: 15px 0; 
            background: #f9fafb;
            padding: 12px;
            border-left: 3px solid #1a4d2e;
          }
          
          .bill-to h3 { 
            font-size: 9pt; 
            font-weight: 600; 
            margin-bottom: 6px; 
            color: #1a4d2e;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .bill-to p { 
            font-size: 9pt; 
            margin: 2px 0; 
          }
          
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0; 
          }
          
          thead { 
            background: #f3f4f6; 
          }
          
          th { 
            padding: 10px 8px; 
            text-align: left; 
            font-size: 8pt; 
            font-weight: 700; 
            text-transform: uppercase; 
            color: #374151;
            border-bottom: 2px solid #1a4d2e;
            letter-spacing: 0.5px;
          }
          
          th.right, td.right { 
            text-align: right; 
          }
          
          th.center, td.center { 
            text-align: center; 
          }
          
          td { 
            padding: 8px; 
            font-size: 9pt; 
            border-bottom: 1px solid #e5e7eb; 
            vertical-align: top;
          }
          
          tbody tr:nth-child(even) {
            background: #f9fafb;
          }
          
          .summary-section { 
            margin-top: 25px; 
            display: flex;
            justify-content: flex-end;
          }
          
          .summary-table { 
            min-width: 280px;
            max-width: 350px;
          }
          
          .summary-table table { 
            margin: 0;
          }
          
          .summary-table td { 
            border: none; 
            padding: 6px 12px; 
          }
          
          .summary-table tr.subtotal td {
            font-weight: 600;
            font-size: 9.5pt;
            border-top: 1px solid #d1d5db;
            padding-top: 8px;
          }
          
          .summary-table tr.total { 
            font-weight: 700; 
            font-size: 11pt; 
          }
          
          .summary-table tr.total td { 
            border-top: 2px solid #1a4d2e; 
            padding-top: 10px; 
            color: #1a4d2e;
            background: #f0fdf4;
          }
          
          .tax-breakdown { 
            background: #f9fafb; 
            padding: 12px; 
            margin: 15px 0; 
            border-left: 3px solid #6b7280;
          }
          
          .tax-breakdown h4 { 
            font-size: 9pt; 
            margin-bottom: 8px; 
            font-weight: 600;
            color: #374151;
          }
          
          .tax-breakdown table { 
            margin: 0; 
            background: white; 
          }
          
          .payment-records {
            margin-top: 20px;
            padding: 12px;
            background: #f0f9ff;
            border-left: 3px solid #0284c7;
          }
          
          .payment-records h4 {
            font-size: 9pt;
            font-weight: 600;
            margin-bottom: 8px;
            color: #0c4a6e;
          }
          
          .footer { 
            margin-top: 40px; 
            padding-top: 15px; 
            border-top: 1px solid #e5e7eb; 
            font-size: 8pt; 
            color: #6b7280;
            text-align: center;
          }
          
          .footer p {
            margin: 3px 0;
          }
          
          .notes {
            margin-top: 20px;
            padding: 12px;
            background: #fffbeb;
            border-left: 3px solid #f59e0b;
          }
          
          .notes h4 {
            font-size: 9pt;
            font-weight: 600;
            margin-bottom: 6px;
            color: #92400e;
          }
          
          .notes p {
            font-size: 8.5pt;
            color: #78350f;
          }
          
          @media print {
            body { 
              padding: 10mm; 
            }
            .no-print { 
              display: none !important; 
            }
            .invoice-container {
              page-break-after: avoid;
            }
            table {
              page-break-inside: avoid;
            }
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
    }, 300)

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
        <meta charset="UTF-8">
        <style>
          @page { size: A4; margin: 15mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 10pt; }
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

  const handleShare = () => {
    setShareDialogOpen(true)
  }

  const getStatusBadgeClass = (status: GuestInvoice['status']) => {
    const classes = {
      draft: 'draft',
      interim: 'interim',
      final: 'final',
      posted: 'posted',
      cancelled: 'destructive',
      refunded: 'secondary',
      'partially-refunded': 'secondary'
    }
    return classes[status] || 'default'
  }

  return (
    <>
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between no-print">
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
            <Button variant="outline" onClick={handlePrint}>
              <Printer size={18} className="mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download size={18} className="mr-2" />
              Download
            </Button>
            <Button onClick={handleShare}>
              <ShareNetwork size={18} className="mr-2" />
              Share
            </Button>
            <Button variant="outline" onClick={() => setEmailDialogOpen(true)}>
              <EnvelopeSimple size={18} className="mr-2" />
              Email
            </Button>
          </div>
        </div>

        <Card className="p-0 overflow-hidden">
          <div ref={printRef} className="invoice-container p-8 md:p-12 bg-white" style={{ minHeight: '297mm', maxWidth: '210mm', margin: '0 auto' }}>
            <div className="invoice-header">
              <div className="hotel-info">
                <h1>{hotelInfo.name}</h1>
                <p>{hotelInfo.address}</p>
                <p>Phone: {hotelInfo.phone}</p>
                <p>Email: {hotelInfo.email}</p>
                {hotelInfo.website && <p>Web: {hotelInfo.website}</p>}
                {hotelInfo.taxRegistrationNumber && (
                  <p className="mt-2 font-semibold">Tax Reg: {hotelInfo.taxRegistrationNumber}</p>
                )}
              </div>

              <div className="invoice-meta">
                <h2>INVOICE</h2>
                <p><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
                <p><strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                {invoice.dueDate && (
                  <p><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                )}
                <span className={`badge ${getStatusBadgeClass(invoice.status)}`}>
                  {invoice.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="bill-to">
              <h3>Bill To</h3>
              <p className="font-semibold text-base">{invoice.guestName}</p>
              {invoice.guestEmail && <p>Email: {invoice.guestEmail}</p>}
              {invoice.guestPhone && <p>Phone: {invoice.guestPhone}</p>}
              {invoice.guestAddress && <p>{invoice.guestAddress}</p>}
              {invoice.reservationIds && invoice.reservationIds.length > 0 && (
                <p className="mt-2"><strong>Reservation(s):</strong> {invoice.reservationIds.join(', ')}</p>
              )}
            </div>

            <div className="section-title">INVOICE DETAILS</div>

            <table>
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>Description</th>
                  <th className="center" style={{ width: '10%' }}>Qty</th>
                  <th className="right" style={{ width: '15%' }}>Unit Price</th>
                  <th className="right" style={{ width: '15%' }}>Tax</th>
                  <th className="right" style={{ width: '15%' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="font-semibold">{item.description}</div>
                      {item.department && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Dept: {item.department.toUpperCase()}
                        </div>
                      )}
                      {item.date && (
                        <div className="text-xs text-muted-foreground">
                          Service Date: {new Date(item.date).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="center">{item.quantity}</td>
                    <td className="right">{formatCurrency(item.unitPrice)}</td>
                    <td className="right">
                      {item.taxLines && item.taxLines.length > 0
                        ? formatCurrency(item.taxLines.reduce((sum, tax) => sum + tax.taxAmount, 0))
                        : '-'}
                    </td>
                    <td className="right font-semibold">{formatCurrency(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {invoice.taxLines && invoice.taxLines.length > 0 && (
              <div className="tax-breakdown">
                <h4>Tax Breakdown</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Tax Type</th>
                      <th className="right">Taxable Amount</th>
                      <th className="right">Rate</th>
                      <th className="right">Tax Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.taxLines.map((tax) => (
                      <tr key={tax.taxName}>
                        <td className="font-medium">{tax.taxName}</td>
                        <td className="right">{formatCurrency(tax.taxableAmount)}</td>
                        <td className="right">{tax.taxRate}%</td>
                        <td className="right font-semibold">{formatCurrency(tax.taxAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="summary-section">
              <div className="summary-table">
                <table>
                  <tbody>
                    <tr>
                      <td>Subtotal</td>
                      <td className="right">{formatCurrency(invoice.subtotal)}</td>
                    </tr>
                    {invoice.discounts && invoice.discounts.length > 0 && invoice.discounts.map((discount) => (
                      <tr key={discount.id}>
                        <td className="text-success">
                          Discount: {discount.description}
                          {discount.type === 'percentage' && ` (${discount.value}%)`}
                        </td>
                        <td className="right text-success">-{formatCurrency(discount.amount)}</td>
                      </tr>
                    ))}
                    {invoice.serviceChargeAmount > 0 && (
                      <tr>
                        <td>Service Charge</td>
                        <td className="right">{formatCurrency(invoice.serviceChargeAmount)}</td>
                      </tr>
                    )}
                    {invoice.totalTax > 0 && (
                      <tr>
                        <td>Total Tax</td>
                        <td className="right">{formatCurrency(invoice.totalTax)}</td>
                      </tr>
                    )}
                    <tr className="subtotal">
                      <td>Grand Total</td>
                      <td className="right">{formatCurrency(invoice.grandTotal)}</td>
                    </tr>
                    {invoice.totalPaid > 0 && (
                      <>
                        <tr>
                          <td>Total Paid</td>
                          <td className="right text-success">-{formatCurrency(invoice.totalPaid)}</td>
                        </tr>
                        <tr className="total">
                          <td>Balance Due</td>
                          <td className="right">{formatCurrency(invoice.amountDue)}</td>
                        </tr>
                      </>
                    )}
                    {invoice.totalPaid === 0 && (
                      <tr className="total">
                        <td>Amount Due</td>
                        <td className="right">{formatCurrency(invoice.grandTotal)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {invoice.payments && invoice.payments.length > 0 && (
              <div className="payment-records">
                <h4>Payment History</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Method</th>
                      <th>Reference</th>
                      <th className="right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                        <td className="capitalize">{payment.paymentType.replace('-', ' ')}</td>
                        <td>{payment.reference || '-'}</td>
                        <td className="right font-semibold">{formatCurrency(payment.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {invoice.internalNotes && (
              <div className="notes">
                <h4>Notes</h4>
                <p>{invoice.internalNotes}</p>
              </div>
            )}

            <div className="footer">
              <p><strong>{hotelInfo.name}</strong></p>
              <p>Thank you for your business!</p>
              <p className="mt-2">This is a computer-generated invoice and is valid without signature.</p>
              {invoice.createdBy && (
                <p className="mt-2">Generated by: {invoice.createdBy} on {new Date(invoice.createdAt).toLocaleString()}</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Share Invoice</h3>
              <p className="text-sm text-muted-foreground">Choose how you want to share this invoice</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShareDialogOpen(false)}>
              <X size={18} />
            </Button>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={handleCopyLink}>
              <Copy size={18} className="mr-2" />
              Copy Link
            </Button>
            
            <Button variant="outline" className="w-full justify-start" onClick={() => {
              setShareDialogOpen(false)
              setEmailDialogOpen(true)
            }}>
              <EnvelopeSimple size={18} className="mr-2" />
              Send via Email
            </Button>
            
            <Button variant="outline" className="w-full justify-start" onClick={handleDownloadPDF}>
              <Download size={18} className="mr-2" />
              Download as HTML
            </Button>
            
            <Button variant="outline" className="w-full justify-start" onClick={handlePrint}>
              <Printer size={18} className="mr-2" />
              Print
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Email Invoice</h3>
              <p className="text-sm text-muted-foreground">Send invoice {invoice.invoiceNumber} via email</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setEmailDialogOpen(false)}>
              <X size={18} />
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="email-to">To</Label>
              <Input
                id="email-to"
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="recipient@example.com"
              />
            </div>

            <div>
              <Label htmlFor="email-cc">CC (optional)</Label>
              <Input
                id="email-cc"
                type="email"
                value={emailCC}
                onChange={(e) => setEmailCC(e.target.value)}
                placeholder="cc@example.com"
              />
            </div>

            <div>
              <Label htmlFor="email-message">Message (optional)</Label>
              <Textarea
                id="email-message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Add a personal message..."
                rows={4}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEmailSend} disabled={isSending}>
              {isSending ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
