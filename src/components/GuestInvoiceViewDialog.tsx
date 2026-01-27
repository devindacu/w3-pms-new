import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PrintButton } from '@/components/PrintButton'
import { A4PrintWrapper } from '@/components/A4PrintWrapper'
import {
  Printer,
  Download,
  ShareNetwork,
  X,
  CheckCircle,
  Clock,
  FileText,
  XCircle,
  Warning
} from '@phosphor-icons/react'
import type { GuestInvoice, SystemUser } from '@/lib/types'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/helpers'
import { toast } from 'sonner'

interface GuestInvoiceViewDialogProps {
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
  currentUser: SystemUser
}

export function GuestInvoiceViewDialog({
  open,
  onOpenChange,
  invoice,
  hotelInfo,
  currentUser
}: GuestInvoiceViewDialogProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  const getStatusBadge = () => {
    const config = {
      draft: { variant: 'secondary' as const, icon: <Clock size={14} />, label: 'Draft' },
      final: { variant: 'default' as const, icon: <CheckCircle size={14} />, label: 'Final' },
      posted: { variant: 'default' as const, icon: <FileText size={14} />, label: 'Posted' },
      'partially-paid': { variant: 'secondary' as const, icon: <Warning size={14} />, label: 'Partially Paid' }
    }[invoice.status] || { variant: 'secondary' as const, icon: <Clock size={14} />, label: invoice.status }

    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Invoice Details</DialogTitle>
            <div className="flex items-center gap-2">
              <PrintButton
                elementId="guest-invoice-printable"
                options={{
                  title: `Invoice ${invoice.invoiceNumber}`,
                  filename: `invoice-${invoice.invoiceNumber}.pdf`,
                  includeHeader: true,
                  headerText: hotelInfo.name,
                  includeFooter: true,
                  footerText: `Invoice ${invoice.invoiceNumber} - Generated on ${new Date().toLocaleDateString()}`
                }}
                variant="outline"
                size="sm"
              />
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                <X size={18} />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div ref={contentRef} className="p-8 bg-white text-foreground">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-3xl font-semibold text-primary mb-2">{hotelInfo.name}</h1>
                <p className="text-sm text-muted-foreground">{hotelInfo.address}</p>
                <p className="text-sm text-muted-foreground">Phone: {hotelInfo.phone}</p>
                <p className="text-sm text-muted-foreground">Email: {hotelInfo.email}</p>
                {hotelInfo.taxRegistrationNumber && (
                  <p className="text-sm text-muted-foreground">
                    Tax Registration: {hotelInfo.taxRegistrationNumber}
                  </p>
                )}
              </div>
              <div className="text-right">
                <h2 className="text-4xl font-semibold text-primary mb-2">INVOICE</h2>
                <p className="text-lg font-semibold">{invoice.invoiceNumber}</p>
                <div className="mt-2">{getStatusBadge()}</div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">BILL TO</h3>
                <p className="font-semibold">{invoice.guestName}</p>
                {invoice.companyName && <p className="text-sm">{invoice.companyName}</p>}
                {invoice.guestAddress && <p className="text-sm">{invoice.guestAddress}</p>}
                {invoice.guestEmail && <p className="text-sm">{invoice.guestEmail}</p>}
                {invoice.guestPhone && <p className="text-sm">{invoice.guestPhone}</p>}
                {invoice.companyGSTNumber && (
                  <p className="text-sm">GST: {invoice.companyGSTNumber}</p>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">INVOICE DETAILS</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoice Date:</span>
                    <span className="font-medium">{formatDate(invoice.invoiceDate)}</span>
                  </div>
                  {invoice.dueDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span className="font-medium">{formatDate(invoice.dueDate)}</span>
                    </div>
                  )}
                  {invoice.roomNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Room Number:</span>
                      <span className="font-medium">{invoice.roomNumber}</span>
                    </div>
                  )}
                  {invoice.checkInDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-in:</span>
                      <span className="font-medium">{formatDate(invoice.checkInDate)}</span>
                    </div>
                  )}
                  {invoice.checkOutDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-out:</span>
                      <span className="font-medium">{formatDate(invoice.checkOutDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">LINE ITEMS</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-semibold">Description</th>
                    <th className="text-right py-2 text-sm font-semibold">Qty</th>
                    <th className="text-right py-2 text-sm font-semibold">Unit Price</th>
                    <th className="text-right py-2 text-sm font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item, index) => (
                    <tr key={item.id} className={index !== invoice.lineItems.length - 1 ? 'border-b' : ''}>
                      <td className="py-3">
                        <div>
                          <p className="text-sm font-medium">{item.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(item.date)} • {item.department}
                          </p>
                        </div>
                      </td>
                      <td className="text-right py-3 text-sm">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="text-right py-3 text-sm">{formatCurrency(item.unitPrice)}</td>
                      <td className="text-right py-3 text-sm font-medium">
                        {formatCurrency(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mb-8">
              <div className="w-80">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  
                  {invoice.totalDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Discount:</span>
                      <span className="font-medium text-destructive">
                        -{formatCurrency(invoice.totalDiscount)}
                      </span>
                    </div>
                  )}

                  {invoice.serviceChargeAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Service Charge ({invoice.serviceChargeRate}%):
                      </span>
                      <span className="font-medium">{formatCurrency(invoice.serviceChargeAmount)}</span>
                    </div>
                  )}

                  {invoice.taxLines && invoice.taxLines.length > 0 && (
                    <>
                      <Separator className="my-2" />
                      {invoice.taxLines.map((tax, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {tax.taxName} ({tax.taxRate}%):
                          </span>
                          <span className="font-medium">{formatCurrency(tax.taxAmount)}</span>
                        </div>
                      ))}
                    </>
                  )}

                  <Separator className="my-3" />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Grand Total:</span>
                    <span className="text-primary">{formatCurrency(invoice.grandTotal)}</span>
                  </div>

                  {invoice.totalPaid > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount Paid:</span>
                        <span className="font-medium text-success">
                          -{formatCurrency(invoice.totalPaid)}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Balance Due:</span>
                        <span className={invoice.amountDue > 0 ? 'text-destructive' : 'text-success'}>
                          {formatCurrency(invoice.amountDue)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {invoice.payments && invoice.payments.length > 0 && (
              <>
                <Separator className="my-6" />
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">PAYMENT HISTORY</h3>
                  <div className="space-y-2">
                    {invoice.payments.map(payment => (
                      <div key={payment.id} className="flex justify-between text-sm p-2 bg-muted/30 rounded">
                        <div>
                          <span className="font-medium">{payment.paymentType.toUpperCase()}</span>
                          {payment.reference && (
                            <span className="text-muted-foreground ml-2">• {payment.reference}</span>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(payment.paymentDate)}
                          </p>
                        </div>
                        <span className="font-semibold text-success">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {invoice.paymentInstructions && (
              <>
                <Separator className="my-6" />
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    PAYMENT INSTRUCTIONS
                  </h3>
                  <p className="text-sm text-muted-foreground">{invoice.paymentInstructions}</p>
                </div>
              </>
            )}

            {invoice.termsAndConditions && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  TERMS & CONDITIONS
                </h3>
                <p className="text-xs text-muted-foreground">{invoice.termsAndConditions}</p>
              </div>
            )}

            <Separator className="my-6" />

            <div className="text-center text-xs text-muted-foreground">
              <p>Thank you for your business!</p>
              {hotelInfo.website && <p className="mt-1">{hotelInfo.website}</p>}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
