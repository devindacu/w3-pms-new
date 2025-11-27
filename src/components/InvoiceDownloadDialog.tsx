import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Download, FileText, FileHtml, FilePdf, CheckCircle } from '@phosphor-icons/react'
import type { GuestInvoice } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/helpers'
import { toast } from 'sonner'

interface InvoiceDownloadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: GuestInvoice
  hotelInfo: {
    name: string
    address: string
    phone: string
    email: string
    website?: string
    taxRegistrationNumber?: string
  }
}

type DownloadFormat = 'html' | 'pdf' | 'json'

export function InvoiceDownloadDialog({
  open,
  onOpenChange,
  invoice,
  hotelInfo
}: InvoiceDownloadDialogProps) {
  const [format, setFormat] = useState<DownloadFormat>('html')
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      let content: string
      let filename: string
      let mimeType: string

      if (format === 'html') {
        content = generateHTMLInvoice()
        filename = `Invoice-${invoice.invoiceNumber}.html`
        mimeType = 'text/html'
      } else if (format === 'json') {
        content = JSON.stringify(invoice, null, 2)
        filename = `Invoice-${invoice.invoiceNumber}.json`
        mimeType = 'application/json'
      } else {
        toast.info('PDF generation would require a PDF library in production')
        content = generateHTMLInvoice()
        filename = `Invoice-${invoice.invoiceNumber}.html`
        mimeType = 'text/html'
      }

      const blob = new Blob([content], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success(`Invoice downloaded as ${filename}`)
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to download invoice')
    } finally {
      setIsDownloading(false)
    }
  }

  const generateHTMLInvoice = (): string => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 40px auto;
      padding: 40px;
      background: #fff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2d5f3f;
    }
    .hotel-info h1 {
      font-size: 28pt;
      color: #2d5f3f;
      margin-bottom: 10px;
    }
    .hotel-info p {
      font-size: 10pt;
      color: #666;
      margin: 2px 0;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-meta h2 {
      font-size: 32pt;
      color: #2d5f3f;
      margin-bottom: 10px;
    }
    .invoice-meta p {
      font-size: 11pt;
      margin: 4px 0;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 10pt;
      font-weight: 600;
      background: #e8f5e9;
      color: #2d5f3f;
      margin-top: 10px;
    }
    .billing-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin: 30px 0;
    }
    .billing-details h3 {
      font-size: 10pt;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 10px;
      letter-spacing: 0.5px;
    }
    .billing-details p {
      font-size: 11pt;
      margin: 3px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    thead {
      background: #f5f5f5;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      font-size: 10pt;
      text-transform: uppercase;
      color: #666;
      font-weight: 600;
    }
    td {
      font-size: 11pt;
    }
    .text-right {
      text-align: right;
    }
    .item-description {
      font-weight: 500;
    }
    .item-meta {
      font-size: 9pt;
      color: #666;
    }
    .totals {
      margin-top: 30px;
      display: flex;
      justify-content: flex-end;
    }
    .totals-table {
      width: 400px;
    }
    .totals-table td {
      border: none;
      padding: 8px 12px;
    }
    .totals-table .label {
      color: #666;
    }
    .totals-table .amount {
      text-align: right;
      font-weight: 500;
    }
    .grand-total {
      font-size: 16pt;
      font-weight: 700;
      color: #2d5f3f;
      padding-top: 12px !important;
      border-top: 2px solid #2d5f3f;
    }
    .balance-due {
      font-size: 14pt;
      font-weight: 600;
      color: #d32f2f;
    }
    .payment-history {
      margin: 30px 0;
    }
    .payment-history h3 {
      font-size: 12pt;
      color: #666;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .payment-record {
      display: flex;
      justify-between;
      padding: 10px;
      background: #f9f9f9;
      border-radius: 4px;
      margin-bottom: 8px;
    }
    .payment-amount {
      font-weight: 600;
      color: #2e7d32;
    }
    .instructions {
      margin: 30px 0;
      padding: 20px;
      background: #fff9e6;
      border-left: 4px solid #ffc107;
      border-radius: 4px;
    }
    .instructions h3 {
      font-size: 11pt;
      margin-bottom: 8px;
      color: #666;
    }
    .instructions p {
      font-size: 10pt;
      color: #555;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 10pt;
    }
    @media print {
      body { margin: 0; padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="hotel-info">
      <h1>${hotelInfo.name}</h1>
      <p>${hotelInfo.address}</p>
      <p>Phone: ${hotelInfo.phone}</p>
      <p>Email: ${hotelInfo.email}</p>
      ${hotelInfo.taxRegistrationNumber ? `<p>Tax Registration: ${hotelInfo.taxRegistrationNumber}</p>` : ''}
    </div>
    <div class="invoice-meta">
      <h2>INVOICE</h2>
      <p><strong>${invoice.invoiceNumber}</strong></p>
      <span class="status-badge">${invoice.status.toUpperCase()}</span>
    </div>
  </div>

  <div class="billing-details">
    <div>
      <h3>Bill To</h3>
      <p><strong>${invoice.guestName}</strong></p>
      ${invoice.companyName ? `<p>${invoice.companyName}</p>` : ''}
      ${invoice.guestAddress ? `<p>${invoice.guestAddress}</p>` : ''}
      ${invoice.guestEmail ? `<p>${invoice.guestEmail}</p>` : ''}
      ${invoice.guestPhone ? `<p>${invoice.guestPhone}</p>` : ''}
      ${invoice.companyGSTNumber ? `<p>GST: ${invoice.companyGSTNumber}</p>` : ''}
    </div>
    <div>
      <h3>Invoice Details</h3>
      <p><strong>Date:</strong> ${formatDate(invoice.invoiceDate)}</p>
      ${invoice.dueDate ? `<p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>` : ''}
      ${invoice.roomNumber ? `<p><strong>Room:</strong> ${invoice.roomNumber}</p>` : ''}
      ${invoice.checkInDate ? `<p><strong>Check-in:</strong> ${formatDate(invoice.checkInDate)}</p>` : ''}
      ${invoice.checkOutDate ? `<p><strong>Check-out:</strong> ${formatDate(invoice.checkOutDate)}</p>` : ''}
    </div>
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
          <td>
            <div class="item-description">${item.description}</div>
            <div class="item-meta">${formatDate(item.date)} • ${item.department}</div>
          </td>
          <td class="text-right">${item.quantity} ${item.unit}</td>
          <td class="text-right">${formatCurrency(item.unitPrice)}</td>
          <td class="text-right">${formatCurrency(item.lineTotal)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <table class="totals-table">
      <tr>
        <td class="label">Subtotal:</td>
        <td class="amount">${formatCurrency(invoice.subtotal)}</td>
      </tr>
      ${invoice.totalDiscount > 0 ? `
      <tr>
        <td class="label">Discount:</td>
        <td class="amount">-${formatCurrency(invoice.totalDiscount)}</td>
      </tr>
      ` : ''}
      ${invoice.serviceChargeAmount > 0 ? `
      <tr>
        <td class="label">Service Charge (${invoice.serviceChargeRate}%):</td>
        <td class="amount">${formatCurrency(invoice.serviceChargeAmount)}</td>
      </tr>
      ` : ''}
      ${invoice.taxLines?.map(tax => `
      <tr>
        <td class="label">${tax.taxName} (${tax.taxRate}%):</td>
        <td class="amount">${formatCurrency(tax.taxAmount)}</td>
      </tr>
      `).join('') || ''}
      <tr>
        <td class="label grand-total">GRAND TOTAL:</td>
        <td class="amount grand-total">${formatCurrency(invoice.grandTotal)}</td>
      </tr>
      ${invoice.totalPaid > 0 ? `
      <tr>
        <td class="label">Amount Paid:</td>
        <td class="amount" style="color: #2e7d32;">-${formatCurrency(invoice.totalPaid)}</td>
      </tr>
      <tr>
        <td class="label balance-due">BALANCE DUE:</td>
        <td class="amount balance-due">${formatCurrency(invoice.amountDue)}</td>
      </tr>
      ` : ''}
    </table>
  </div>

  ${invoice.payments && invoice.payments.length > 0 ? `
  <div class="payment-history">
    <h3>Payment History</h3>
    ${invoice.payments.map(payment => `
      <div class="payment-record">
        <div>
          <strong>${payment.paymentType.toUpperCase()}</strong>
          ${payment.reference ? ` • ${payment.reference}` : ''}
          <div style="font-size: 9pt; color: #666;">${formatDate(payment.paymentDate)}</div>
        </div>
        <div class="payment-amount">${formatCurrency(payment.amount)}</div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  ${invoice.paymentInstructions ? `
  <div class="instructions">
    <h3>Payment Instructions</h3>
    <p>${invoice.paymentInstructions}</p>
  </div>
  ` : ''}

  ${invoice.termsAndConditions ? `
  <div style="margin: 20px 0; font-size: 9pt; color: #666;">
    <h3 style="font-size: 10pt; margin-bottom: 8px;">Terms & Conditions</h3>
    <p>${invoice.termsAndConditions}</p>
  </div>
  ` : ''}

  <div class="footer">
    <p>Thank you for your business!</p>
    ${hotelInfo.website ? `<p>${hotelInfo.website}</p>` : ''}
    <p style="margin-top: 10px; font-size: 9pt;">This is a computer-generated invoice.</p>
  </div>
</body>
</html>
    `.trim()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Download Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Select the format you want to download the invoice in:
            </p>
            <RadioGroup value={format} onValueChange={(value: DownloadFormat) => setFormat(value)}>
              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="html" id="html" />
                <Label htmlFor="html" className="flex items-center flex-1 cursor-pointer">
                  <FileHtml size={20} className="mr-2 text-primary" />
                  <div>
                    <p className="font-medium">HTML Document</p>
                    <p className="text-xs text-muted-foreground">
                      Web page format, viewable in any browser
                    </p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center flex-1 cursor-pointer">
                  <FilePdf size={20} className="mr-2 text-destructive" />
                  <div>
                    <p className="font-medium">PDF Document</p>
                    <p className="text-xs text-muted-foreground">
                      Professional format, best for sharing
                    </p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex items-center flex-1 cursor-pointer">
                  <FileText size={20} className="mr-2 text-accent" />
                  <div>
                    <p className="font-medium">JSON Data</p>
                    <p className="text-xs text-muted-foreground">
                      Raw data format, for integrations
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg text-sm">
            <p className="text-muted-foreground">
              <strong>Invoice:</strong> {invoice.invoiceNumber}
            </p>
            <p className="text-muted-foreground">
              <strong>Amount:</strong> {formatCurrency(invoice.grandTotal)}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDownloading}>
            Cancel
          </Button>
          <Button onClick={handleDownload} disabled={isDownloading}>
            <Download size={16} className="mr-2" />
            {isDownloading ? 'Downloading...' : 'Download'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
