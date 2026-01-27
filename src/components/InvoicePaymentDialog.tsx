import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { type Invoice, type Payment, type PaymentMethod } from '@/lib/types'
import { formatCurrency, formatDate, generateNumber } from '@/lib/helpers'
import { CreditCard, Money, Bank, DeviceMobile, Receipt } from '@phosphor-icons/react'
import { PrintButton } from '@/components/PrintButton'
import { A4PrintWrapper } from '@/components/A4PrintWrapper'

interface InvoicePaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice
  onPaymentRecorded: (payment: Payment, updatedInvoice: Invoice) => void
  currentUser: string
}

export function InvoicePaymentDialog({ 
  open, 
  onOpenChange, 
  invoice, 
  onPaymentRecorded,
  currentUser
}: InvoicePaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [paymentAmount, setPaymentAmount] = useState<number>(invoice.balance)
  const [reference, setReference] = useState<string>('')
  const [authorizationCode, setAuthorizationCode] = useState<string>('')
  const [cardType, setCardType] = useState<string>('')
  const [cardLast4, setCardLast4] = useState<string>('')
  const [bankName, setBankName] = useState<string>('')
  const [chequeNumber, setChequeNumber] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [processingFee, setProcessingFee] = useState<number>(0)

  useEffect(() => {
    if (open) {
      setPaymentAmount(invoice.balance)
      setReference('')
      setAuthorizationCode('')
      setCardType('')
      setCardLast4('')
      setBankName('')
      setChequeNumber('')
      setNotes('')
      setProcessingFee(0)
    }
  }, [open, invoice.balance])

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'cash':
        return <Money size={20} />
      case 'card':
        return <CreditCard size={20} />
      case 'bank-transfer':
        return <Bank size={20} />
      case 'mobile-payment':
        return <DeviceMobile size={20} />
      case 'credit':
        return <Receipt size={20} />
      default:
        return <Money size={20} />
    }
  }

  const handleSubmit = () => {
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error('Payment amount must be greater than 0')
      return
    }

    if (paymentAmount > invoice.balance) {
      toast.error(`Payment amount cannot exceed outstanding balance of ${formatCurrency(invoice.balance)}`)
      return
    }

    if (paymentMethod === 'card' && !cardLast4) {
      toast.error('Please enter the last 4 digits of the card')
      return
    }

    if (paymentMethod === 'bank-transfer' && !reference) {
      toast.error('Please enter the bank transfer reference')
      return
    }

    const newPayment: Payment = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      paymentNumber: generateNumber('PAY'),
      invoiceId: invoice.id,
      supplierId: invoice.supplierId,
      amount: paymentAmount,
      method: paymentMethod,
      status: 'paid',
      reference,
      notes,
      processedAt: Date.now(),
      processedBy: currentUser,
      reconciled: false,
      isRefunded: false,
      isRefund: false,
      ...(paymentMethod === 'card' && {
        authorizationCode,
        cardType,
        cardLast4
      }),
      ...(paymentMethod === 'bank-transfer' && {
        bankName,
        transferReference: reference
      }),
      ...(paymentMethod === 'cash' && chequeNumber && {
        chequeNumber
      }),
      ...(processingFee > 0 && {
        processingFee
      })
    }

    const newAmountPaid = invoice.amountPaid + paymentAmount
    const newBalance = invoice.total - newAmountPaid
    
    let newStatus = invoice.status
    if (newBalance === 0) {
      newStatus = 'paid'
    } else if (newAmountPaid > 0 && newBalance > 0) {
      newStatus = 'partially-paid'
    }

    const updatedInvoice: Invoice = {
      ...invoice,
      amountPaid: newAmountPaid,
      balance: newBalance,
      status: newStatus,
      ...(newBalance === 0 && {
        paidAt: Date.now(),
        paidBy: currentUser
      })
    }

    onPaymentRecorded(newPayment, updatedInvoice)
    toast.success(`Payment of ${formatCurrency(paymentAmount)} recorded successfully`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Record Payment for Invoice</span>
            <PrintButton
              elementId="invoice-payment-print"
              options={{
                title: `Payment Receipt - ${invoice.invoiceNumber}`,
                filename: `payment-${invoice.invoiceNumber}.pdf`
              }}
              variant="outline"
              size="sm"
            />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Summary */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Invoice Number:</span>
              <Badge variant="outline">{invoice.invoiceNumber}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Supplier:</span>
              <span className="text-sm">{invoice.supplierName}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Invoice Total:</span>
              <span className="text-sm font-semibold">{formatCurrency(invoice.total)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Amount Paid:</span>
              <span className="text-sm text-success">{formatCurrency(invoice.amountPaid)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Outstanding Balance:</span>
              <span className="text-lg font-bold text-destructive">{formatCurrency(invoice.balance)}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Payment Method</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {(['cash', 'card', 'bank-transfer', 'mobile-payment', 'credit'] as PaymentMethod[]).map((method) => (
                <Button
                  key={method}
                  type="button"
                  variant={paymentMethod === method ? 'default' : 'outline'}
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => setPaymentMethod(method)}
                >
                  {getPaymentMethodIcon(method)}
                  <span className="text-xs capitalize">
                    {method.replace('-', ' ')}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Payment Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payment-amount">Payment Amount *</Label>
              <Input
                id="payment-amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                min="0"
                max={invoice.balance}
                step="0.01"
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum: {formatCurrency(invoice.balance)}
              </p>
            </div>

            <div>
              <Label htmlFor="processing-fee">Processing Fee (Optional)</Label>
              <Input
                id="processing-fee"
                type="number"
                value={processingFee}
                onChange={(e) => setProcessingFee(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Additional transaction fees
              </p>
            </div>
          </div>

          {/* Payment Method Specific Fields */}
          {paymentMethod === 'card' && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <CreditCard size={16} />
                Card Payment Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="card-type">Card Type</Label>
                  <Select value={cardType} onValueChange={setCardType}>
                    <SelectTrigger id="card-type">
                      <SelectValue placeholder="Select card type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visa">Visa</SelectItem>
                      <SelectItem value="mastercard">Mastercard</SelectItem>
                      <SelectItem value="amex">American Express</SelectItem>
                      <SelectItem value="discover">Discover</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="card-last4">Last 4 Digits *</Label>
                  <Input
                    id="card-last4"
                    value={cardLast4}
                    onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="1234"
                    maxLength={4}
                  />
                </div>

                <div>
                  <Label htmlFor="auth-code">Authorization Code</Label>
                  <Input
                    id="auth-code"
                    value={authorizationCode}
                    onChange={(e) => setAuthorizationCode(e.target.value)}
                    placeholder="AUTH-123456"
                  />
                </div>

                <div>
                  <Label htmlFor="reference">Transaction Reference</Label>
                  <Input
                    id="reference"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="TXN-REF-123"
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'bank-transfer' && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Bank size={16} />
                Bank Transfer Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bank-name">Bank Name</Label>
                  <Input
                    id="bank-name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Bank name"
                  />
                </div>

                <div>
                  <Label htmlFor="transfer-ref">Transfer Reference *</Label>
                  <Input
                    id="transfer-ref"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="TRF-123456"
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'cash' && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Money size={16} />
                Cash Payment Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="receipt-ref">Receipt Reference</Label>
                  <Input
                    id="receipt-ref"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="RCPT-001"
                  />
                </div>

                <div>
                  <Label htmlFor="cheque-number">Cheque Number (if applicable)</Label>
                  <Input
                    id="cheque-number"
                    value={chequeNumber}
                    onChange={(e) => setChequeNumber(e.target.value)}
                    placeholder="CHQ-123456"
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'mobile-payment' && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <DeviceMobile size={16} />
                Mobile Payment Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mobile-provider">Payment Provider</Label>
                  <Select value={reference.split('|')[0] || ''} onValueChange={(value) => setReference(`${value}|${reference.split('|')[1] || ''}`)}>
                    <SelectTrigger id="mobile-provider">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PayPal">PayPal</SelectItem>
                      <SelectItem value="Venmo">Venmo</SelectItem>
                      <SelectItem value="Apple Pay">Apple Pay</SelectItem>
                      <SelectItem value="Google Pay">Google Pay</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="transaction-id">Transaction ID</Label>
                  <Input
                    id="transaction-id"
                    value={reference.split('|')[1] || ''}
                    onChange={(e) => setReference(`${reference.split('|')[0] || 'Other'}|${e.target.value}`)}
                    placeholder="TXN-MOBILE-123"
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'credit' && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Receipt size={16} />
                Credit Payment Details
              </h4>
              <div>
                <Label htmlFor="credit-ref">Credit Reference</Label>
                <Input
                  id="credit-ref"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="CREDIT-REF-123"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Payment will be recorded against supplier's credit account
                </p>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Payment Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about this payment..."
              rows={3}
            />
          </div>

          {/* Payment Summary */}
          {paymentAmount > 0 && (
            <div className="bg-primary/5 p-4 rounded-lg space-y-2 border border-primary/20">
              <h4 className="font-semibold text-sm">Payment Summary</h4>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm">Payment Amount:</span>
                <span className="font-semibold">{formatCurrency(paymentAmount)}</span>
              </div>
              {processingFee > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Processing Fee:</span>
                  <span className="font-semibold">{formatCurrency(processingFee)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm">New Outstanding Balance:</span>
                <span className="font-bold text-lg">
                  {formatCurrency(invoice.balance - paymentAmount)}
                </span>
              </div>
              {invoice.balance - paymentAmount === 0 && (
                <Badge variant="default" className="w-full justify-center">
                  Invoice will be marked as PAID
                </Badge>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Receipt size={18} />
            Record Payment
          </Button>
        </DialogFooter>

        {/* Hidden print section */}
        <div className="hidden">
          <A4PrintWrapper
            id="invoice-payment-print"
            title={`Payment Receipt - ${invoice.invoiceNumber}`}
            headerContent={
              <div className="text-sm">
                <p><strong>Invoice:</strong> {invoice.invoiceNumber}</p>
                <p><strong>Supplier:</strong> {invoice.supplierName}</p>
                <p><strong>Date:</strong> {formatDate(Date.now())}</p>
              </div>
            }
          >
            <div className="space-y-6">
              {/* Invoice Summary */}
              <section>
                <h2 className="text-lg font-semibold mb-4">Invoice Summary</h2>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-semibold">Invoice Number</td>
                      <td className="p-2">{invoice.invoiceNumber}</td>
                      <td className="p-2 font-semibold">Invoice Date</td>
                      <td className="p-2">{formatDate(invoice.invoiceDate)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-semibold">Supplier</td>
                      <td className="p-2">{invoice.supplierName}</td>
                      <td className="p-2 font-semibold">Status</td>
                      <td className="p-2 capitalize">{invoice.status.replace('-', ' ')}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-semibold">Invoice Total</td>
                      <td className="p-2 font-semibold">{formatCurrency(invoice.total)}</td>
                      <td className="p-2 font-semibold">Amount Paid</td>
                      <td className="p-2 text-green-600">{formatCurrency(invoice.amountPaid)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-semibold">Outstanding Balance</td>
                      <td className="p-2 font-bold text-red-600">{formatCurrency(invoice.balance)}</td>
                      <td className="p-2"></td>
                      <td className="p-2"></td>
                    </tr>
                  </tbody>
                </table>
              </section>

              {/* Payment Details */}
              <section>
                <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-semibold">Payment Method</td>
                      <td className="p-2 capitalize">{paymentMethod.replace('-', ' ')}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-semibold">Payment Amount</td>
                      <td className="p-2 font-bold text-lg">{formatCurrency(paymentAmount)}</td>
                    </tr>
                    {processingFee > 0 && (
                      <tr className="border-b">
                        <td className="p-2 font-semibold">Processing Fee</td>
                        <td className="p-2">{formatCurrency(processingFee)}</td>
                      </tr>
                    )}
                    {reference && (
                      <tr className="border-b">
                        <td className="p-2 font-semibold">Reference</td>
                        <td className="p-2">{reference}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>

              {/* Card Details */}
              {paymentMethod === 'card' && cardLast4 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4">Card Payment Details</h2>
                  <table className="w-full border-collapse">
                    <tbody>
                      {cardType && (
                        <tr className="border-b">
                          <td className="p-2 font-semibold">Card Type</td>
                          <td className="p-2 capitalize">{cardType}</td>
                        </tr>
                      )}
                      <tr className="border-b">
                        <td className="p-2 font-semibold">Card Last 4 Digits</td>
                        <td className="p-2">**** **** **** {cardLast4}</td>
                      </tr>
                      {authorizationCode && (
                        <tr className="border-b">
                          <td className="p-2 font-semibold">Authorization Code</td>
                          <td className="p-2">{authorizationCode}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </section>
              )}

              {/* Bank Transfer Details */}
              {paymentMethod === 'bank-transfer' && (
                <section>
                  <h2 className="text-lg font-semibold mb-4">Bank Transfer Details</h2>
                  <table className="w-full border-collapse">
                    <tbody>
                      {bankName && (
                        <tr className="border-b">
                          <td className="p-2 font-semibold">Bank Name</td>
                          <td className="p-2">{bankName}</td>
                        </tr>
                      )}
                      {reference && (
                        <tr className="border-b">
                          <td className="p-2 font-semibold">Transfer Reference</td>
                          <td className="p-2">{reference}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </section>
              )}

              {/* Payment Summary */}
              {paymentAmount > 0 && (
                <section>
                  <h2 className="text-lg font-semibold mb-4">Payment Summary</h2>
                  <div className="bg-gray-50 p-4 rounded border">
                    <table className="w-full">
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2">Payment Amount:</td>
                          <td className="p-2 text-right font-semibold">{formatCurrency(paymentAmount)}</td>
                        </tr>
                        {processingFee > 0 && (
                          <tr className="border-b">
                            <td className="p-2">Processing Fee:</td>
                            <td className="p-2 text-right font-semibold">{formatCurrency(processingFee)}</td>
                          </tr>
                        )}
                        <tr className="border-b-2 border-black">
                          <td className="p-2 font-bold">New Outstanding Balance:</td>
                          <td className="p-2 text-right font-bold text-lg">{formatCurrency(invoice.balance - paymentAmount)}</td>
                        </tr>
                      </tbody>
                    </table>
                    {invoice.balance - paymentAmount === 0 && (
                      <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-center">
                        <p className="font-semibold text-green-800">Invoice will be marked as PAID</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Notes */}
              {notes && (
                <section>
                  <h2 className="text-lg font-semibold mb-4">Payment Notes</h2>
                  <div className="bg-gray-50 p-3 rounded border">
                    <p className="text-sm whitespace-pre-line">{notes}</p>
                  </div>
                </section>
              )}
            </div>
          </A4PrintWrapper>
        </div>
      </DialogContent>
    </Dialog>
  )
}
