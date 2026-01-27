import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PencilSimple, Plus, Trash, X, CurrencyCircleDollar, Info } from '@phosphor-icons/react'
import type { GuestInvoice, SystemUser, InvoiceLineItem } from '@/lib/types'
import { formatCurrency } from '@/lib/helpers'
import { toast } from 'sonner'
import { type CurrencyCode, type ExchangeRate, type CurrencyConfiguration, CURRENCIES } from '@/lib/currencyTypes'
import { 
  formatCurrencyAmount,
  convertCurrency,
  roundCurrencyAmount,
  getLatestExchangeRate
} from '@/lib/currencyHelpers'
import { PrintButton } from '@/components/PrintButton'
import { A4PrintWrapper } from '@/components/A4PrintWrapper'

interface GuestInvoiceEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: GuestInvoice
  onSave: (invoice: GuestInvoice) => void
  currentUser: SystemUser
}

export function GuestInvoiceEditDialog({
  open,
  onOpenChange,
  invoice,
  onSave,
  currentUser
}: GuestInvoiceEditDialogProps) {
  const [editedInvoice, setEditedInvoice] = useState<GuestInvoice>(invoice)
  const [isSaving, setIsSaving] = useState(false)
  const [originalCurrency] = useState<CurrencyCode>(invoice.currency as CurrencyCode)
  const [originalTotals] = useState({
    subtotal: invoice.subtotal,
    totalTax: invoice.totalTax,
    serviceChargeAmount: invoice.serviceChargeAmount,
    grandTotal: invoice.grandTotal
  })
  
  const [currencyConfiguration] = useKV<CurrencyConfiguration | null>('w3-hotel-currency-config', null)
  const [exchangeRates] = useKV<ExchangeRate[]>('w3-hotel-exchange-rates', [])

  const handleLineItemChange = (index: number, field: keyof InvoiceLineItem, value: any) => {
    const updatedLineItems = [...editedInvoice.lineItems]
    updatedLineItems[index] = {
      ...updatedLineItems[index],
      [field]: value
    }

    if (field === 'quantity' || field === 'unitPrice') {
      const item = updatedLineItems[index]
      item.lineTotal = item.quantity * item.unitPrice
      item.netAmount = item.lineTotal - (item.discountAmount || 0)
      item.lineGrandTotal = item.netAmount + (item.serviceChargeAmount || 0) + item.totalTax
    }

    recalculateTotals(updatedLineItems)
  }

  const recalculateTotals = (lineItems: InvoiceLineItem[]) => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0)
    const totalTax = lineItems.reduce((sum, item) => sum + item.totalTax, 0)
    const serviceChargeAmount = lineItems.reduce((sum, item) => sum + (item.serviceChargeAmount || 0), 0)
    const grandTotal = subtotal - editedInvoice.totalDiscount + serviceChargeAmount + totalTax
    const amountDue = grandTotal - editedInvoice.totalPaid

    setEditedInvoice(prev => ({
      ...prev,
      lineItems,
      subtotal,
      totalTax,
      serviceChargeAmount,
      grandTotal,
      amountDue
    }))
  }

  const handleRemoveLineItem = (index: number) => {
    const updatedLineItems = editedInvoice.lineItems.filter((_, i) => i !== index)
    recalculateTotals(updatedLineItems)
    toast.success('Line item removed')
  }

  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    const oldCurrency = editedInvoice.currency as CurrencyCode
    
    if (oldCurrency === newCurrency) return

    const conversion = convertCurrency(
      1,
      oldCurrency,
      newCurrency,
      exchangeRates || []
    )

    if (!conversion) {
      toast.error(`No exchange rate found for ${oldCurrency} to ${newCurrency}`)
      return
    }

    const roundingMode = currencyConfiguration?.roundingMode || 'round'
    
    const convertedLineItems = editedInvoice.lineItems.map(item => ({
      ...item,
      unitPrice: roundCurrencyAmount(item.unitPrice * conversion.rate, newCurrency, roundingMode),
      lineTotal: roundCurrencyAmount(item.lineTotal * conversion.rate, newCurrency, roundingMode),
      netAmount: roundCurrencyAmount(item.netAmount * conversion.rate, newCurrency, roundingMode),
      discountAmount: item.discountAmount ? roundCurrencyAmount(item.discountAmount * conversion.rate, newCurrency, roundingMode) : undefined,
      serviceChargeAmount: roundCurrencyAmount(item.serviceChargeAmount * conversion.rate, newCurrency, roundingMode),
      totalTax: roundCurrencyAmount(item.totalTax * conversion.rate, newCurrency, roundingMode),
      lineGrandTotal: roundCurrencyAmount(item.lineGrandTotal * conversion.rate, newCurrency, roundingMode),
    }))

    setEditedInvoice(prev => ({
      ...prev,
      currency: newCurrency,
      exchangeRate: conversion.rate,
      lineItems: convertedLineItems,
      subtotal: roundCurrencyAmount(prev.subtotal * conversion.rate, newCurrency, roundingMode),
      totalDiscount: roundCurrencyAmount(prev.totalDiscount * conversion.rate, newCurrency, roundingMode),
      serviceChargeAmount: roundCurrencyAmount(prev.serviceChargeAmount * conversion.rate, newCurrency, roundingMode),
      totalTax: roundCurrencyAmount(prev.totalTax * conversion.rate, newCurrency, roundingMode),
      grandTotal: roundCurrencyAmount(prev.grandTotal * conversion.rate, newCurrency, roundingMode),
      totalPaid: roundCurrencyAmount(prev.totalPaid * conversion.rate, newCurrency, roundingMode),
      amountDue: roundCurrencyAmount(prev.amountDue * conversion.rate, newCurrency, roundingMode),
    }))

    toast.success(`Currency changed to ${CURRENCIES[newCurrency].name}`)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updatedInvoice: GuestInvoice = {
        ...editedInvoice,
        updatedAt: Date.now(),
        auditTrail: [
          ...(editedInvoice.auditTrail || []),
          {
            id: `audit-${Date.now()}`,
            action: 'updated',
            description: 'Invoice modified',
            performedBy: currentUser.id,
            performedAt: Date.now()
          }
        ]
      }

      onSave(updatedInvoice)
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to save invoice')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Invoice - {invoice.invoiceNumber}</DialogTitle>
            <div className="flex items-center gap-2">
              <PrintButton targetId="guest-invoice-edit-print" />
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                <X size={18} />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Guest Name</Label>
                <Input
                  value={editedInvoice.guestName}
                  onChange={e =>
                    setEditedInvoice(prev => ({ ...prev, guestName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Guest Email</Label>
                <Input
                  type="email"
                  value={editedInvoice.guestEmail || ''}
                  onChange={e =>
                    setEditedInvoice(prev => ({ ...prev, guestEmail: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Guest Phone</Label>
                <Input
                  value={editedInvoice.guestPhone || ''}
                  onChange={e =>
                    setEditedInvoice(prev => ({ ...prev, guestPhone: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Room Number</Label>
                <Input
                  value={editedInvoice.roomNumber || ''}
                  onChange={e =>
                    setEditedInvoice(prev => ({ ...prev, roomNumber: e.target.value }))
                  }
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <CurrencyCircleDollar size={20} className="text-primary" />
                    Invoice Currency
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Select the currency for this invoice. Amounts will be automatically converted.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={editedInvoice.currency}
                    onValueChange={(value) => handleCurrencyChange(value as CurrencyCode)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(currencyConfiguration?.allowedCurrencies || ['USD', 'EUR', 'GBP', 'LKR']).map((code) => {
                        const currency = CURRENCIES[code]
                        return currency ? (
                          <SelectItem key={code} value={code}>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs">{currency.symbol}</span>
                              <span>{currency.code}</span>
                              <span className="text-muted-foreground text-xs">- {currency.name}</span>
                            </div>
                          </SelectItem>
                        ) : null
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Exchange Rate</Label>
                  <Input
                    value={editedInvoice.exchangeRate.toFixed(6)}
                    disabled
                    className="font-mono"
                  />
                </div>

                {editedInvoice.currency !== originalCurrency && currencyConfiguration?.showOriginalAmount && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Info size={14} />
                      Original Amount ({originalCurrency})
                    </Label>
                    <Input
                      value={formatCurrencyAmount(originalTotals.grandTotal, originalCurrency)}
                      disabled
                      className="font-mono text-muted-foreground"
                    />
                  </div>
                )}
              </div>

              {editedInvoice.currency !== originalCurrency && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> This invoice has been converted from {originalCurrency} to {editedInvoice.currency} at rate {editedInvoice.exchangeRate.toFixed(6)}. 
                    All amounts shown are in {CURRENCIES[editedInvoice.currency as CurrencyCode]?.name || editedInvoice.currency}.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Guest Address</Label>
              <Textarea
                value={editedInvoice.guestAddress || ''}
                onChange={e => setEditedInvoice(prev => ({ ...prev, guestAddress: e.target.value }))}
                rows={2}
              />
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Line Items</h3>
              </div>

              <div className="space-y-3">
                {editedInvoice.lineItems.map((item, index) => (
                  <div key={item.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Description</Label>
                          <Input
                            value={item.description}
                            onChange={e => handleLineItemChange(index, 'description', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-2">
                            <Label className="text-xs">Quantity</Label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={e =>
                                handleLineItemChange(index, 'quantity', parseFloat(e.target.value) || 0)
                              }
                              step="0.01"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Unit Price</Label>
                            <Input
                              type="number"
                              value={item.unitPrice}
                              onChange={e =>
                                handleLineItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)
                              }
                              step="0.01"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Line Total</Label>
                            <Input value={formatCurrency(item.lineTotal)} disabled />
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLineItem(index)}
                        className="text-destructive"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex justify-end">
              <div className="w-96 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">
                    {formatCurrencyAmount(editedInvoice.subtotal, editedInvoice.currency as CurrencyCode)}
                  </span>
                </div>
                {editedInvoice.totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount:</span>
                    <span className="font-medium">
                      -{formatCurrencyAmount(editedInvoice.totalDiscount, editedInvoice.currency as CurrencyCode)}
                    </span>
                  </div>
                )}
                {editedInvoice.serviceChargeAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Charge:</span>
                    <span className="font-medium">
                      {formatCurrencyAmount(editedInvoice.serviceChargeAmount, editedInvoice.currency as CurrencyCode)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax:</span>
                  <span className="font-medium">
                    {formatCurrencyAmount(editedInvoice.totalTax, editedInvoice.currency as CurrencyCode)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Grand Total:</span>
                  <span className="text-primary">
                    {formatCurrencyAmount(editedInvoice.grandTotal, editedInvoice.currency as CurrencyCode)}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Instructions</Label>
                <Textarea
                  value={editedInvoice.paymentInstructions || ''}
                  onChange={e =>
                    setEditedInvoice(prev => ({ ...prev, paymentInstructions: e.target.value }))
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Special Instructions</Label>
                <Textarea
                  value={editedInvoice.specialInstructions || ''}
                  onChange={e =>
                    setEditedInvoice(prev => ({ ...prev, specialInstructions: e.target.value }))
                  }
                  rows={3}
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>

      <div className="hidden">
        <A4PrintWrapper 
          id="guest-invoice-edit-print" 
          title={`Invoice ${invoice.invoiceNumber} - Edit View`}
        >
          <div className="space-y-6">
            <div className="text-center border-b pb-4">
              <h1 className="text-2xl font-bold mb-2">Guest Invoice - Edit View</h1>
              <p className="text-lg font-semibold">{invoice.invoiceNumber}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-sm uppercase text-gray-600">Guest Information</h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-1 font-medium">Name:</td>
                      <td className="py-1">{editedInvoice.guestName}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium">Email:</td>
                      <td className="py-1">{editedInvoice.guestEmail || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium">Phone:</td>
                      <td className="py-1">{editedInvoice.guestPhone || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium">Room:</td>
                      <td className="py-1">{editedInvoice.roomNumber || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-sm uppercase text-gray-600">Invoice Details</h3>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="py-1 font-medium">Currency:</td>
                      <td className="py-1">{editedInvoice.currency}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-medium">Exchange Rate:</td>
                      <td className="py-1">{editedInvoice.exchangeRate.toFixed(6)}</td>
                    </tr>
                    {editedInvoice.currency !== originalCurrency && (
                      <tr>
                        <td className="py-1 font-medium">Original Currency:</td>
                        <td className="py-1">{originalCurrency}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {editedInvoice.guestAddress && (
              <div>
                <h3 className="font-semibold mb-2 text-sm uppercase text-gray-600">Guest Address</h3>
                <p className="text-sm">{editedInvoice.guestAddress}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-3 text-sm uppercase text-gray-600">Line Items</h3>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Quantity</th>
                    <th className="text-right py-2">Unit Price</th>
                    <th className="text-right py-2">Line Total</th>
                    <th className="text-right py-2">Tax</th>
                    <th className="text-right py-2">Service Charge</th>
                    <th className="text-right py-2">Grand Total</th>
                  </tr>
                </thead>
                <tbody>
                  {editedInvoice.lineItems.map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-2">{item.description}</td>
                      <td className="text-right py-2">{item.quantity}</td>
                      <td className="text-right py-2">{formatCurrencyAmount(item.unitPrice, editedInvoice.currency as CurrencyCode)}</td>
                      <td className="text-right py-2">{formatCurrencyAmount(item.lineTotal, editedInvoice.currency as CurrencyCode)}</td>
                      <td className="text-right py-2">{formatCurrencyAmount(item.totalTax, editedInvoice.currency as CurrencyCode)}</td>
                      <td className="text-right py-2">{formatCurrencyAmount(item.serviceChargeAmount, editedInvoice.currency as CurrencyCode)}</td>
                      <td className="text-right py-2 font-medium">{formatCurrencyAmount(item.lineGrandTotal, editedInvoice.currency as CurrencyCode)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-64">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 font-medium">Subtotal:</td>
                      <td className="py-2 text-right">{formatCurrencyAmount(editedInvoice.subtotal, editedInvoice.currency as CurrencyCode)}</td>
                    </tr>
                    {editedInvoice.totalDiscount > 0 && (
                      <tr className="border-b border-gray-200">
                        <td className="py-2 font-medium">Discount:</td>
                        <td className="py-2 text-right">-{formatCurrencyAmount(editedInvoice.totalDiscount, editedInvoice.currency as CurrencyCode)}</td>
                      </tr>
                    )}
                    {editedInvoice.serviceChargeAmount > 0 && (
                      <tr className="border-b border-gray-200">
                        <td className="py-2 font-medium">Service Charge:</td>
                        <td className="py-2 text-right">{formatCurrencyAmount(editedInvoice.serviceChargeAmount, editedInvoice.currency as CurrencyCode)}</td>
                      </tr>
                    )}
                    <tr className="border-b border-gray-200">
                      <td className="py-2 font-medium">Tax:</td>
                      <td className="py-2 text-right">{formatCurrencyAmount(editedInvoice.totalTax, editedInvoice.currency as CurrencyCode)}</td>
                    </tr>
                    <tr className="border-t-2 border-gray-300">
                      <td className="py-2 text-lg font-bold">Grand Total:</td>
                      <td className="py-2 text-right text-lg font-bold">{formatCurrencyAmount(editedInvoice.grandTotal, editedInvoice.currency as CurrencyCode)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {(editedInvoice.paymentInstructions || editedInvoice.specialInstructions) && (
              <div className="grid grid-cols-2 gap-6 border-t pt-4">
                {editedInvoice.paymentInstructions && (
                  <div>
                    <h3 className="font-semibold mb-2 text-sm uppercase text-gray-600">Payment Instructions</h3>
                    <p className="text-sm whitespace-pre-wrap">{editedInvoice.paymentInstructions}</p>
                  </div>
                )}
                {editedInvoice.specialInstructions && (
                  <div>
                    <h3 className="font-semibold mb-2 text-sm uppercase text-gray-600">Special Instructions</h3>
                    <p className="text-sm whitespace-pre-wrap">{editedInvoice.specialInstructions}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </A4PrintWrapper>
      </div>
    </Dialog>
  )
}
