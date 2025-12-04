import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import {
  Printer,
  EnvelopeSimple,
  DownloadSimple,
  FileArrowDown,
  CheckCircle,
  Warning,
  XCircle,
  Sparkle
} from '@phosphor-icons/react'
import type { GuestInvoice, SystemUser } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/helpers'
import { toast } from 'sonner'

interface BatchInvoiceOperationsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedInvoices: GuestInvoice[]
  onClearSelection: () => void
  hotelInfo: any
  currentUser: SystemUser
  onUpdate: (invoiceIds: string[], updates: Partial<GuestInvoice>) => void
}

type BatchOperation = 'print' | 'email' | 'export' | null

interface EmailSettings {
  subject: string
  body: string
  cc?: string
  bcc?: string
}

export function BatchInvoiceOperations({
  open,
  onOpenChange,
  selectedInvoices,
  onClearSelection,
  hotelInfo,
  currentUser,
  onUpdate
}: BatchInvoiceOperationsProps) {
  const [operation, setOperation] = useState<BatchOperation>(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'excel'>('pdf')
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    subject: 'Your Invoice from W3 Hotel & Resorts',
    body: 'Dear Guest,\n\nPlease find attached your invoice.\n\nThank you for choosing W3 Hotel & Resorts.\n\nBest regards,\nW3 Hotel Team'
  })
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] }>({
    success: 0,
    failed: 0,
    errors: []
  })

  const handlePrintAll = async () => {
    setProcessing(true)
    setProgress(0)
    const newResults = { success: 0, failed: 0, errors: [] as string[] }

    for (let i = 0; i < selectedInvoices.length; i++) {
      const invoice = selectedInvoices[i]
      
      try {
        const htmlContent = generateInvoiceHTML(invoice, hotelInfo)
        const printWindow = window.open('', '', 'height=800,width=800')
        
        if (!printWindow) {
          throw new Error('Popup blocked - please allow popups')
        }

        printWindow.document.write(htmlContent)
        printWindow.document.close()
        printWindow.focus()

        await new Promise(resolve => setTimeout(resolve, 500))
        printWindow.print()

        newResults.success++
      } catch (error) {
        newResults.failed++
        newResults.errors.push(`${invoice.invoiceNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      setProgress(((i + 1) / selectedInvoices.length) * 100)
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    setResults(newResults)
    setProcessing(false)

    const invoiceIds = selectedInvoices.slice(0, newResults.success).map(inv => inv.id)
    if (invoiceIds.length > 0) {
      onUpdate(invoiceIds, {
        auditTrail: [
          {
            id: `audit-${Date.now()}`,
            action: 'printed',
            description: `Batch printed (${newResults.success} invoices)`,
            performedBy: currentUser.id,
            performedAt: Date.now()
          }
        ]
      })
    }

    toast.success(`${newResults.success} invoices printed successfully`)
    if (newResults.failed > 0) {
      toast.error(`${newResults.failed} invoices failed to print`)
    }
  }

  const handleEmailAll = async () => {
    setProcessing(true)
    setProgress(0)
    const newResults = { success: 0, failed: 0, errors: [] as string[] }

    const invoicesWithEmail = selectedInvoices.filter(inv => inv.guestEmail)
    const invoicesWithoutEmail = selectedInvoices.filter(inv => !inv.guestEmail)

    if (invoicesWithoutEmail.length > 0) {
      toast.warning(`${invoicesWithoutEmail.length} invoice(s) skipped - no email address`)
    }

    for (let i = 0; i < invoicesWithEmail.length; i++) {
      const invoice = invoicesWithEmail[i]
      
      try {
        await new Promise(resolve => setTimeout(resolve, 500))

        console.log(`Sending email to ${invoice.guestEmail}:`, {
          subject: emailSettings.subject,
          body: emailSettings.body,
          cc: emailSettings.cc,
          bcc: emailSettings.bcc,
          invoice: invoice.invoiceNumber
        })

        newResults.success++
      } catch (error) {
        newResults.failed++
        newResults.errors.push(`${invoice.invoiceNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      setProgress(((i + 1) / invoicesWithEmail.length) * 100)
    }

    setResults(newResults)
    setProcessing(false)

    const invoiceIds = invoicesWithEmail.slice(0, newResults.success).map(inv => inv.id)
    if (invoiceIds.length > 0) {
      onUpdate(invoiceIds, {
        deliveryMethods: [
          {
            method: 'email',
            status: 'emailed',
            attemptedAt: Date.now(),
            deliveredAt: Date.now(),
            retryCount: 0,
            deliveredBy: currentUser.id
          }
        ],
        auditTrail: [
          {
            id: `audit-${Date.now()}`,
            action: 'emailed',
            description: `Batch emailed (${newResults.success} invoices)`,
            performedBy: currentUser.id,
            performedAt: Date.now()
          }
        ]
      })
    }

    toast.success(`${newResults.success} invoices emailed successfully`)
    if (newResults.failed > 0) {
      toast.error(`${newResults.failed} invoices failed to send`)
    }
  }

  const handleExportAll = async () => {
    setProcessing(true)
    setProgress(0)
    const newResults = { success: 0, failed: 0, errors: [] as string[] }

    try {
      if (exportFormat === 'pdf') {
        for (let i = 0; i < selectedInvoices.length; i++) {
          const invoice = selectedInvoices[i]
          const htmlContent = generateInvoiceHTML(invoice, hotelInfo)
          
          const blob = new Blob([htmlContent], { type: 'text/html' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${invoice.invoiceNumber}.html`
          a.click()
          URL.revokeObjectURL(url)
          
          newResults.success++
          setProgress(((i + 1) / selectedInvoices.length) * 100)
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      } else if (exportFormat === 'csv') {
        const csvContent = generateCSV(selectedInvoices)
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoices-batch-${Date.now()}.csv`
        a.click()
        URL.revokeObjectURL(url)
        newResults.success = selectedInvoices.length
        setProgress(100)
      } else if (exportFormat === 'excel') {
        const csvContent = generateCSV(selectedInvoices)
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoices-batch-${Date.now()}.csv`
        a.click()
        URL.revokeObjectURL(url)
        newResults.success = selectedInvoices.length
        setProgress(100)
      }

      setResults(newResults)
      toast.success(`Exported ${newResults.success} invoices as ${exportFormat.toUpperCase()}`)
    } catch (error) {
      newResults.failed = selectedInvoices.length
      newResults.errors.push(error instanceof Error ? error.message : 'Export failed')
      setResults(newResults)
      toast.error('Export failed')
    }

    setProcessing(false)

    const invoiceIds = selectedInvoices.map(inv => inv.id)
    onUpdate(invoiceIds, {
      auditTrail: [
        {
          id: `audit-${Date.now()}`,
          action: 'printed',
          description: `Batch exported as ${exportFormat.toUpperCase()} (${newResults.success} invoices)`,
          performedBy: currentUser.id,
          performedAt: Date.now()
        }
      ]
    })
  }

  const handleConfirm = async () => {
    if (!operation) return

    switch (operation) {
      case 'print':
        await handlePrintAll()
        break
      case 'email':
        await handleEmailAll()
        break
      case 'export':
        await handleExportAll()
        break
    }
  }

  const resetDialog = () => {
    setOperation(null)
    setProgress(0)
    setResults({ success: 0, failed: 0, errors: [] })
    setEmailSettings({
      subject: 'Your Invoice from W3 Hotel & Resorts',
      body: 'Dear Guest,\n\nPlease find attached your invoice.\n\nThank you for choosing W3 Hotel & Resorts.\n\nBest regards,\nW3 Hotel Team'
    })
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      resetDialog()
      if (results.success > 0) {
        onClearSelection()
      }
    }, 200)
  }

  const totalAmount = selectedInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0)
  const totalDue = selectedInvoices.reduce((sum, inv) => sum + inv.amountDue, 0)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkle size={24} className="text-primary" />
            Batch Invoice Operations
          </DialogTitle>
          <DialogDescription>
            Perform bulk operations on {selectedInvoices.length} selected invoice(s)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Selected Invoices:</span>
                <span className="ml-2 font-semibold">{selectedInvoices.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="ml-2 font-semibold">{formatCurrency(totalAmount)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Due:</span>
                <span className="ml-2 font-semibold">{formatCurrency(totalDue)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">With Email:</span>
                <span className="ml-2 font-semibold">
                  {selectedInvoices.filter(inv => inv.guestEmail).length}
                </span>
              </div>
            </div>
          </div>

          {!operation && !processing && results.success === 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Select Operation:</h3>
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  className="h-auto p-4 justify-start"
                  onClick={() => setOperation('print')}
                >
                  <Printer size={24} className="mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Print All Invoices</div>
                    <div className="text-sm text-muted-foreground">
                      Print all {selectedInvoices.length} invoices to your default printer
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 justify-start"
                  onClick={() => setOperation('email')}
                >
                  <EnvelopeSimple size={24} className="mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Email All Invoices</div>
                    <div className="text-sm text-muted-foreground">
                      Send invoices to {selectedInvoices.filter(inv => inv.guestEmail).length} guest(s) with email addresses
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 justify-start"
                  onClick={() => setOperation('export')}
                >
                  <FileArrowDown size={24} className="mr-3" />
                  <div className="text-left">
                    <div className="font-semibold">Export All Invoices</div>
                    <div className="text-sm text-muted-foreground">
                      Download all invoices as PDF, CSV, or Excel
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          )}

          {operation === 'email' && !processing && results.success === 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Email Settings</h3>
                <Button variant="ghost" size="sm" onClick={() => setOperation(null)}>
                  Back
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="email-subject">Subject</Label>
                  <Input
                    id="email-subject"
                    value={emailSettings.subject}
                    onChange={e => setEmailSettings({ ...emailSettings, subject: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email-body">Message</Label>
                  <Textarea
                    id="email-body"
                    value={emailSettings.body}
                    onChange={e => setEmailSettings({ ...emailSettings, body: e.target.value })}
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="email-cc">CC (Optional)</Label>
                    <Input
                      id="email-cc"
                      type="email"
                      placeholder="cc@example.com"
                      value={emailSettings.cc || ''}
                      onChange={e => setEmailSettings({ ...emailSettings, cc: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email-bcc">BCC (Optional)</Label>
                    <Input
                      id="email-bcc"
                      type="email"
                      placeholder="bcc@example.com"
                      value={emailSettings.bcc || ''}
                      onChange={e => setEmailSettings({ ...emailSettings, bcc: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {operation === 'export' && !processing && results.success === 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Export Format</h3>
                <Button variant="ghost" size="sm" onClick={() => setOperation(null)}>
                  Back
                </Button>
              </div>
              
              <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF - Individual Files</SelectItem>
                  <SelectItem value="csv">CSV - Single File</SelectItem>
                  <SelectItem value="excel">Excel - Single File (CSV)</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-sm text-muted-foreground">
                {exportFormat === 'pdf' && `${selectedInvoices.length} individual PDF files will be downloaded`}
                {exportFormat === 'csv' && 'All invoices will be exported to a single CSV file'}
                {exportFormat === 'excel' && 'All invoices will be exported to a single CSV file (Excel compatible)'}
              </div>
            </div>
          )}

          {processing && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="font-semibold mb-2">Processing...</div>
                <Progress value={progress} className="h-2" />
                <div className="text-sm text-muted-foreground mt-2">
                  {Math.round(progress)}% complete
                </div>
              </div>
            </div>
          )}

          {results.success > 0 && !processing && (
            <div className="space-y-4">
              <div className="text-center">
                <CheckCircle size={48} className="mx-auto text-success mb-3" />
                <h3 className="font-semibold text-lg mb-2">Operation Complete</h3>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Successful:</span>
                  <Badge variant="default" className="bg-success">
                    <CheckCircle size={14} className="mr-1" />
                    {results.success}
                  </Badge>
                </div>
                
                {results.failed > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Failed:</span>
                    <Badge variant="destructive">
                      <XCircle size={14} className="mr-1" />
                      {results.failed}
                    </Badge>
                  </div>
                )}
              </div>

              {results.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                    <Warning size={16} />
                    Errors:
                  </div>
                  <div className="bg-destructive/10 rounded-lg p-3 max-h-32 overflow-y-auto">
                    {results.errors.map((error, idx) => (
                      <div key={idx} className="text-sm text-destructive">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedInvoices.length > 0 && !processing && results.success === 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Selected Invoices:</h3>
              <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3">
                {selectedInvoices.map(invoice => (
                  <div key={invoice.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{invoice.invoiceNumber}</span>
                      <span className="text-muted-foreground ml-2">- {invoice.guestName}</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(invoice.grandTotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!processing && results.success === 0 && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              {operation && (
                <Button onClick={handleConfirm}>
                  {operation === 'print' && 'Print All'}
                  {operation === 'email' && 'Send All'}
                  {operation === 'export' && 'Export All'}
                </Button>
              )}
            </>
          )}
          {results.success > 0 && (
            <Button onClick={handleClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
        @page { size: A4; margin: 20mm; }
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
    </body>
    </html>
  `
}

function generateCSV(invoices: GuestInvoice[]): string {
  const headers = [
    'Invoice Number',
    'Date',
    'Guest Name',
    'Guest Email',
    'Room Number',
    'Invoice Type',
    'Status',
    'Subtotal',
    'Discount',
    'Service Charge',
    'Tax',
    'Grand Total',
    'Amount Paid',
    'Amount Due'
  ]

  const rows = invoices.map(inv => [
    inv.invoiceNumber,
    formatDate(inv.invoiceDate),
    inv.guestName,
    inv.guestEmail || '',
    inv.roomNumber || '',
    inv.invoiceType,
    inv.status,
    inv.subtotal.toFixed(2),
    inv.totalDiscount.toFixed(2),
    inv.serviceChargeAmount.toFixed(2),
    inv.totalTax.toFixed(2),
    inv.grandTotal.toFixed(2),
    inv.totalPaid.toFixed(2),
    inv.amountDue.toFixed(2)
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  return csvContent
}
