import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import {
  X,
  CurrencyDollar,
  Wallet,
  CreditCard,
  Bank,
  DeviceMobile,
  CheckCircle,
  Clock,
  Receipt,
  Download,
  Printer
} from '@phosphor-icons/react'
import type { GuestInvoice, Payment, PaymentMethod } from '@/lib/types'
import { formatCurrency } from '@/lib/helpers'
import { toast } from 'sonner'

interface PaymentHistoryDialogProps {
  open: boolean
  onClose: () => void
  invoice: GuestInvoice | null
  payments: Payment[]
}

export function PaymentHistoryDialog({
  open,
  onClose,
  invoice,
  payments
}: PaymentHistoryDialogProps) {
  if (!invoice) return null

  const invoicePayments = payments.filter(p => p.invoiceId === invoice.id)
  const totalPaidFromPayments = invoicePayments.reduce((sum, p) => sum + p.amount, 0)

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'cash':
        return <Wallet size={18} className="text-success" />
      case 'card':
        return <CreditCard size={18} className="text-primary" />
      case 'bank-transfer':
        return <Bank size={18} className="text-accent" />
      case 'mobile-payment':
        return <DeviceMobile size={18} className="text-secondary" />
      default:
        return <CurrencyDollar size={18} className="text-muted-foreground" />
    }
  }

  const getPaymentMethodBadge = (method: PaymentMethod) => {
    const colors = {
      'cash': 'bg-success/10 text-success border-success/20',
      'card': 'bg-primary/10 text-primary border-primary/20',
      'bank-transfer': 'bg-accent/10 text-accent border-accent/20',
      'mobile-payment': 'bg-secondary/10 text-secondary border-secondary/20',
      'credit': 'bg-muted text-muted-foreground border-muted'
    }
    
    return colors[method] || 'bg-muted text-muted-foreground'
  }

  const handleExportPayments = () => {
    const csvContent = [
      ['Payment Number', 'Date', 'Method', 'Amount', 'Reference', 'Status'].join(','),
      ...invoicePayments.map(payment => [
        payment.paymentNumber,
        format(payment.processedAt, 'yyyy-MM-dd HH:mm'),
        payment.method,
        payment.amount.toFixed(2),
        payment.reference || '',
        payment.status
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `payments-${invoice.invoiceNumber}-${format(Date.now(), 'yyyy-MM-dd')}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Payment history exported')
  }

  const handlePrintReceipt = (payment: Payment) => {
    toast.info('Print functionality would be implemented here')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Receipt size={24} className="text-primary" />
              Payment History
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1">
          <Card className="p-4 bg-muted/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Invoice Number</span>
                  <span className="font-semibold">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Guest Name</span>
                  <span className="font-semibold">{invoice.guestName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Invoice Date</span>
                  <span className="font-semibold">{format(invoice.invoiceDate, 'MMM dd, yyyy')}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Grand Total</span>
                  <span className="text-lg font-bold">{formatCurrency(invoice.grandTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Total Paid</span>
                  <span className="text-lg font-bold text-success">{formatCurrency(invoice.totalPaid)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Amount Due</span>
                  <span className={`text-lg font-bold ${invoice.amountDue === 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(invoice.amountDue)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CurrencyDollar size={20} />
                Payment Transactions ({invoicePayments.length})
              </h3>
              {invoicePayments.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPayments}
                >
                  <Download size={16} className="mr-2" />
                  Export
                </Button>
              )}
            </div>

            {invoicePayments.length === 0 ? (
              <Card className="p-12 text-center">
                <Clock size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Payments Recorded</h3>
                <p className="text-muted-foreground">
                  No payment transactions have been recorded for this invoice yet.
                </p>
              </Card>
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment #</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reconciled</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoicePayments.sort((a, b) => b.processedAt - a.processedAt).map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-mono font-medium">
                            {payment.paymentNumber}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">
                                {format(payment.processedAt, 'MMM dd, yyyy')}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(payment.processedAt, 'HH:mm:ss')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getPaymentMethodBadge(payment.method)}>
                              <div className="flex items-center gap-1.5">
                                {getPaymentMethodIcon(payment.method)}
                                <span className="capitalize">
                                  {payment.method.split('-').join(' ')}
                                </span>
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell className="font-bold text-success">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {payment.reference || <span className="text-muted-foreground italic">—</span>}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              payment.status === 'paid' ? 'bg-success/10 text-success border-success/20' :
                              payment.status === 'pending' ? 'bg-warning/10 text-warning border-warning/20' :
                              payment.status === 'refunded' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                              'bg-muted text-muted-foreground'
                            }>
                              {payment.status === 'paid' && <CheckCircle size={14} className="mr-1" />}
                              <span className="capitalize">{payment.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {payment.reconciled ? (
                              <div className="flex items-center gap-2 text-success">
                                <CheckCircle size={16} />
                                <span className="text-sm">Yes</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock size={16} />
                                <span className="text-sm">Pending</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePrintReceipt(payment)}
                            >
                              <Printer size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}

            {invoicePayments.length > 0 && invoice.payments && invoice.payments.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Invoice Payment Records</h3>
                  <Card>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Reference</TableHead>
                            <TableHead>Received By</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoice.payments.sort((a, b) => b.paymentDate - a.paymentDate).map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>
                                {format(payment.paymentDate, 'MMM dd, yyyy HH:mm')}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {payment.paymentType}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-bold text-success">
                                {formatCurrency(payment.amount)}
                              </TableCell>
                              <TableCell className="font-mono text-sm">
                                {payment.reference || '—'}
                              </TableCell>
                              <TableCell className="text-sm">
                                {payment.receivedBy}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
