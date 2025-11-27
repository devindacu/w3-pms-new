import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Trash, 
  FileText,
  Calendar,
  CurrencyDollar,
  Tag,
  Receipt,
  X,
  Check,
  Warning
} from '@phosphor-icons/react'
import { 
  type GuestInvoice, 
  type GuestInvoiceType, 
  type GuestInvoiceStatus,
  type InvoiceLineItem,
  type InvoiceDiscount,
  type TaxConfiguration,
  type ServiceChargeConfiguration,
  type Folio,
  type Guest,
  type Reservation,
  type Room,
  type FolioExtraService,
  type Department
} from '@/lib/types'
import { formatDate, formatCurrency, generateId } from '@/lib/helpers'
import { 
  generateInvoiceNumber,
  calculateInvoiceTotals,
  createLineItemFromFolioCharge,
  createLineItemFromExtraService,
  validateInvoice
} from '@/lib/invoiceHelpers'
import { toast } from 'sonner'

interface InvoiceManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice?: GuestInvoice
  folios: Folio[]
  guests: Guest[]
  reservations: Reservation[]
  rooms: Room[]
  folioExtraServices: FolioExtraService[]
  taxConfig: TaxConfiguration[]
  serviceChargeConfig: ServiceChargeConfiguration
  onSave: (invoice: GuestInvoice) => void
  currentUser?: { id: string; firstName: string; lastName: string }
}

export function InvoiceManagementDialog({
  open,
  onOpenChange,
  invoice,
  folios,
  guests,
  reservations,
  rooms,
  folioExtraServices,
  taxConfig,
  serviceChargeConfig,
  onSave,
  currentUser
}: InvoiceManagementDialogProps) {
  const [invoiceType, setInvoiceType] = useState<GuestInvoiceType>('guest-folio')
  const [status, setStatus] = useState<GuestInvoiceStatus>('draft')
  const [selectedFolioIds, setSelectedFolioIds] = useState<string[]>([])
  const [selectedReservationIds, setSelectedReservationIds] = useState<string[]>([])
  const [selectedGuestId, setSelectedGuestId] = useState<string>('')
  const [companyName, setCompanyName] = useState('')
  const [companyGSTNumber, setCompanyGSTNumber] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([])
  const [discounts, setDiscounts] = useState<InvoiceDiscount[]>([])
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [isTaxExempt, setIsTaxExempt] = useState(false)
  const [taxExemptionReason, setTaxExemptionReason] = useState('')
  const [dueDate, setDueDate] = useState<string>('')
  const [isGroupMaster, setIsGroupMaster] = useState(false)
  
  useEffect(() => {
    if (invoice) {
      setInvoiceType(invoice.invoiceType)
      setStatus(invoice.status)
      setSelectedFolioIds(invoice.folioIds)
      setSelectedReservationIds(invoice.reservationIds)
      setSelectedGuestId(invoice.guestId)
      setCompanyName(invoice.companyName || '')
      setCompanyGSTNumber(invoice.companyGSTNumber || '')
      setCompanyAddress(invoice.companyAddress || '')
      setLineItems(invoice.lineItems)
      setDiscounts(invoice.discounts)
      setSpecialInstructions(invoice.specialInstructions || '')
      setInternalNotes(invoice.internalNotes || '')
      setIsTaxExempt(invoice.isTaxExempt)
      setTaxExemptionReason(invoice.taxExemptionReason || '')
      setDueDate(invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '')
      setIsGroupMaster(invoice.isGroupMaster)
    } else {
      resetForm()
    }
  }, [invoice, open])

  const resetForm = () => {
    setInvoiceType('guest-folio')
    setStatus('draft')
    setSelectedFolioIds([])
    setSelectedReservationIds([])
    setSelectedGuestId('')
    setCompanyName('')
    setCompanyGSTNumber('')
    setCompanyAddress('')
    setLineItems([])
    setDiscounts([])
    setSpecialInstructions('')
    setInternalNotes('')
    setIsTaxExempt(false)
    setTaxExemptionReason('')
    setDueDate('')
    setIsGroupMaster(false)
  }

  const handleLoadFolioCharges = () => {
    if (selectedFolioIds.length === 0) {
      toast.error('Please select at least one folio')
      return
    }

    const newLineItems: InvoiceLineItem[] = []

    selectedFolioIds.forEach(folioId => {
      const folio = folios.find(f => f.id === folioId)
      if (!folio) return

      folio.charges.forEach(charge => {
        const lineItem = createLineItemFromFolioCharge(charge, taxConfig, serviceChargeConfig)
        newLineItems.push(lineItem)
      })

      const extraServices = folioExtraServices.filter(es => es.folioId === folioId)
      extraServices.forEach(extraService => {
        const lineItem = createLineItemFromExtraService(extraService, taxConfig, serviceChargeConfig)
        newLineItems.push(lineItem)
      })
    })

    setLineItems(newLineItems)
    toast.success(`Loaded ${newLineItems.length} line items`)
  }

  const handleAddManualLineItem = () => {
    const newLineItem: InvoiceLineItem = {
      id: generateId(),
      date: Date.now(),
      itemType: 'misc',
      department: 'front-office',
      description: '',
      quantity: 1,
      unit: 'EA',
      unitPrice: 0,
      lineTotal: 0,
      netAmount: 0,
      taxable: true,
      serviceChargeApplicable: false,
      serviceChargeAmount: 0,
      taxLines: [],
      totalTax: 0,
      lineGrandTotal: 0,
      postedAt: Date.now(),
      isSplit: false,
      isVoided: false
    }
    setLineItems([...lineItems, newLineItem])
  }

  const handleRemoveLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id))
  }

  const handleUpdateLineItem = (id: string, field: string, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id !== id) return item
      
      const updated = { ...item, [field]: value }
      
      if (field === 'quantity' || field === 'unitPrice') {
        updated.lineTotal = updated.quantity * updated.unitPrice
        updated.netAmount = updated.lineTotal
        
        if (updated.serviceChargeApplicable && serviceChargeConfig.isActive) {
          updated.serviceChargeAmount = updated.lineTotal * (serviceChargeConfig.rate / 100)
        }
        
        if (updated.taxable && !isTaxExempt) {
          const applicableTaxes = taxConfig.filter(tax => 
            tax.isActive && tax.appliesTo.includes(updated.department)
          ).sort((a, b) => a.calculationOrder - b.calculationOrder)
          
          updated.taxLines = applicableTaxes.map(tax => {
            let taxableAmount = updated.lineTotal
            if (tax.taxableOnServiceCharge) {
              taxableAmount += updated.serviceChargeAmount
            }
            
            const taxAmount = taxableAmount * (tax.rate / 100)
            
            return {
              taxType: tax.type,
              taxName: tax.name,
              taxRate: tax.rate,
              taxableAmount,
              taxAmount,
              isInclusive: tax.isInclusive
            }
          })
          
          updated.totalTax = updated.taxLines.reduce((sum, tax) => sum + tax.taxAmount, 0)
        } else {
          updated.taxLines = []
          updated.totalTax = 0
        }
        
        updated.lineGrandTotal = updated.lineTotal + updated.serviceChargeAmount + updated.totalTax
      }
      
      return updated
    }))
  }

  const handleAddDiscount = () => {
    const newDiscount: InvoiceDiscount = {
      id: generateId(),
      type: 'percentage',
      scope: 'invoice-level',
      description: '',
      value: 0,
      amount: 0,
      appliedBy: currentUser?.id || 'system',
      appliedAt: Date.now(),
      approvalRequired: false
    }
    setDiscounts([...discounts, newDiscount])
  }

  const handleRemoveDiscount = (id: string) => {
    setDiscounts(discounts.filter(d => d.id !== id))
  }

  const handleUpdateDiscount = (id: string, field: string, value: any) => {
    setDiscounts(discounts.map(discount => {
      if (discount.id !== id) return discount
      
      const updated = { ...discount, [field]: value }
      
      if (field === 'type' || field === 'value') {
        const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0)
        if (updated.type === 'percentage') {
          updated.amount = subtotal * (updated.value / 100)
        } else {
          updated.amount = updated.value
        }
      }
      
      return updated
    }))
  }

  const totals = calculateInvoiceTotals(lineItems, discounts, taxConfig, serviceChargeConfig)

  const handleSave = () => {
    const selectedGuest = guests.find(g => g.id === selectedGuestId)
    if (!selectedGuest && invoiceType !== 'proforma') {
      toast.error('Please select a guest')
      return
    }

    if (lineItems.length === 0 && invoiceType !== 'proforma') {
      toast.error('Please add at least one line item')
      return
    }

    const reservationsData = reservations.filter(r => selectedReservationIds.includes(r.id))
    const reservation = reservationsData[0]
    const room = reservation ? rooms.find(r => r.id === reservation.roomId) : undefined

    const newInvoice: GuestInvoice = {
      id: invoice?.id || generateId(),
      invoiceNumber: invoice?.invoiceNumber || generateInvoiceNumber(invoiceType),
      invoiceType,
      status,
      folioIds: selectedFolioIds,
      reservationIds: selectedReservationIds,
      guestId: selectedGuestId,
      guestName: selectedGuest ? `${selectedGuest.firstName} ${selectedGuest.lastName}` : '',
      guestEmail: selectedGuest?.email,
      guestPhone: selectedGuest?.phone,
      companyName: companyName || undefined,
      companyGSTNumber: companyGSTNumber || undefined,
      companyAddress: companyAddress || undefined,
      roomNumber: room?.roomNumber,
      checkInDate: reservation?.checkInDate,
      checkOutDate: reservation?.checkOutDate,
      invoiceDate: invoice?.invoiceDate || Date.now(),
      dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
      currency: 'USD',
      exchangeRate: 1,
      lineItems,
      subtotal: totals.subtotal,
      discounts,
      totalDiscount: totals.totalDiscount,
      serviceChargeRate: serviceChargeConfig.rate,
      serviceChargeAmount: totals.serviceChargeAmount,
      taxLines: totals.taxLines,
      totalTax: totals.totalTax,
      grandTotal: totals.grandTotal,
      payments: invoice?.payments || [],
      totalPaid: invoice?.totalPaid || 0,
      amountDue: totals.grandTotal - (invoice?.totalPaid || 0),
      creditNotes: invoice?.creditNotes || [],
      debitNotes: invoice?.debitNotes || [],
      prepayments: invoice?.prepayments || [],
      netAmountDue: totals.grandTotal - (invoice?.totalPaid || 0),
      isPostedToAccounts: invoice?.isPostedToAccounts || false,
      deliveryMethods: invoice?.deliveryMethods || [],
      auditTrail: invoice?.auditTrail || [],
      isGroupMaster,
      isTaxExempt,
      taxExemptionReason: isTaxExempt ? taxExemptionReason : undefined,
      specialInstructions: specialInstructions || undefined,
      internalNotes: internalNotes || undefined,
      createdBy: invoice?.createdBy || currentUser?.id || 'system',
      createdAt: invoice?.createdAt || Date.now(),
      updatedAt: Date.now()
    }

    const validation = validateInvoice(newInvoice)
    if (!validation.isValid) {
      toast.error(validation.errors[0]?.message || 'Invalid invoice data')
      return
    }

    onSave(newInvoice)
    toast.success(`Invoice ${invoice ? 'updated' : 'created'} successfully`)
    onOpenChange(false)
  }

  const invoiceTypeDescriptions: Record<GuestInvoiceType, string> = {
    'guest-folio': 'Final bill at check-out or interim bill on request',
    'room-only': 'Only accommodation charges (corporate contract)',
    'fnb-only': 'Restaurant/banquet charges (can be posted to folio or separate)',
    'extras-only': 'Spa, laundry, transport, minibar consumption',
    'group-master': 'Consolidated invoice for groups or events',
    'proforma': 'Non-posting quotation for guests/events',
    'credit-note': 'Adjustments, refunds, corrections (negative)',
    'debit-note': 'Additional charges after check-out (positive)'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {invoice ? 'Edit Invoice' : 'Create New Invoice'}
            {invoice && <Badge className="ml-2">{invoice.invoiceNumber}</Badge>}
          </DialogTitle>
          <DialogDescription>
            Create and manage guest invoices with different types and configurations
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="line-items">Line Items ({lineItems.length})</TabsTrigger>
            <TabsTrigger value="discounts">Discounts ({discounts.length})</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice-type">Invoice Type</Label>
                <Select value={invoiceType} onValueChange={(value) => setInvoiceType(value as GuestInvoiceType)}>
                  <SelectTrigger id="invoice-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guest-folio">Guest Folio Invoice</SelectItem>
                    <SelectItem value="room-only">Room-Only Invoice</SelectItem>
                    <SelectItem value="fnb-only">F&B Invoice</SelectItem>
                    <SelectItem value="extras-only">Extras Invoice</SelectItem>
                    <SelectItem value="group-master">Group/Master Account</SelectItem>
                    <SelectItem value="proforma">Pro-forma/Quotation</SelectItem>
                    <SelectItem value="credit-note">Credit Note</SelectItem>
                    <SelectItem value="debit-note">Debit Note</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {invoiceTypeDescriptions[invoiceType]}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as GuestInvoiceStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="interim">Interim</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                    <SelectItem value="posted">Posted</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guest">Guest</Label>
                <Select value={selectedGuestId} onValueChange={setSelectedGuestId}>
                  <SelectTrigger id="guest">
                    <SelectValue placeholder="Select guest..." />
                  </SelectTrigger>
                  <SelectContent>
                    {guests.map(guest => (
                      <SelectItem key={guest.id} value={guest.id}>
                        {guest.firstName} {guest.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Source Folios</Label>
              <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                {folios.map(folio => {
                  const reservation = reservations.find(r => r.id === folio.reservationId)
                  const guest = guests.find(g => g.id === folio.guestId)
                  const room = reservation ? rooms.find(r => r.id === reservation.roomId) : undefined
                  
                  return (
                    <div key={folio.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`folio-${folio.id}`}
                        checked={selectedFolioIds.includes(folio.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFolioIds([...selectedFolioIds, folio.id])
                            if (reservation && !selectedReservationIds.includes(reservation.id)) {
                              setSelectedReservationIds([...selectedReservationIds, reservation.id])
                            }
                            if (guest && !selectedGuestId) {
                              setSelectedGuestId(guest.id)
                            }
                          } else {
                            setSelectedFolioIds(selectedFolioIds.filter(id => id !== folio.id))
                          }
                        }}
                      />
                      <label htmlFor={`folio-${folio.id}`} className="text-sm flex-1 cursor-pointer">
                        {guest?.firstName} {guest?.lastName} - Room {room?.roomNumber} - Balance: {formatCurrency(folio.balance)}
                      </label>
                    </div>
                  )
                })}
              </div>
              <Button 
                onClick={handleLoadFolioCharges} 
                size="sm" 
                variant="outline"
                disabled={selectedFolioIds.length === 0}
              >
                <FileText size={16} className="mr-2" />
                Load Folio Charges
              </Button>
            </div>

            {(invoiceType === 'room-only' || companyName) && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-medium">Company Details (Corporate Billing)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input
                        id="company-name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="ABC Corporation Ltd."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-gst">GST/Tax Number</Label>
                      <Input
                        id="company-gst"
                        value={companyGSTNumber}
                        onChange={(e) => setCompanyGSTNumber(e.target.value)}
                        placeholder="GST123456789"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-address">Company Address</Label>
                    <Textarea
                      id="company-address"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      placeholder="Full billing address..."
                      rows={2}
                    />
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="tax-exempt"
                  checked={isTaxExempt}
                  onCheckedChange={setIsTaxExempt}
                />
                <Label htmlFor="tax-exempt">Tax Exempt</Label>
              </div>

              {isTaxExempt && (
                <div className="space-y-2">
                  <Label htmlFor="tax-exemption-reason">Tax Exemption Reason</Label>
                  <Input
                    id="tax-exemption-reason"
                    value={taxExemptionReason}
                    onChange={(e) => setTaxExemptionReason(e.target.value)}
                    placeholder="Diplomatic immunity, Government contract, etc."
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  id="group-master"
                  checked={isGroupMaster}
                  onCheckedChange={setIsGroupMaster}
                />
                <Label htmlFor="group-master">Group Master Invoice</Label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="special-instructions">Special Instructions</Label>
                <Textarea
                  id="special-instructions"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Instructions for guest..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="internal-notes">Internal Notes</Label>
                <Textarea
                  id="internal-notes"
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  placeholder="Internal notes (not visible to guest)..."
                  rows={2}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="line-items" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Invoice Line Items</h3>
              <Button onClick={handleAddManualLineItem} size="sm">
                <Plus size={16} className="mr-2" />
                Add Line Item
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {lineItems.map((item) => (
                  <Card key={item.id} className="p-4">
                    <div className="grid grid-cols-12 gap-3 items-start">
                      <div className="col-span-4 space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => handleUpdateLineItem(item.id, 'description', e.target.value)}
                          placeholder="Item description..."
                        />
                      </div>
                      
                      <div className="col-span-2 space-y-2">
                        <Label>Type</Label>
                        <Select 
                          value={item.itemType} 
                          onValueChange={(value) => handleUpdateLineItem(item.id, 'itemType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="room-charge">Room Charge</SelectItem>
                            <SelectItem value="fnb-restaurant">F&B Restaurant</SelectItem>
                            <SelectItem value="fnb-minibar">F&B Minibar</SelectItem>
                            <SelectItem value="fnb-banquet">F&B Banquet</SelectItem>
                            <SelectItem value="fnb-room-service">Room Service</SelectItem>
                            <SelectItem value="spa">Spa</SelectItem>
                            <SelectItem value="transport">Transport</SelectItem>
                            <SelectItem value="laundry">Laundry</SelectItem>
                            <SelectItem value="telephone">Telephone</SelectItem>
                            <SelectItem value="parking">Parking</SelectItem>
                            <SelectItem value="extra-service">Extra Service</SelectItem>
                            <SelectItem value="misc">Miscellaneous</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="col-span-1 space-y-2">
                        <Label>Qty</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      
                      <div className="col-span-2 space-y-2">
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      
                      <div className="col-span-2 space-y-2">
                        <Label>Total</Label>
                        <Input value={formatCurrency(item.lineGrandTotal)} disabled />
                      </div>
                      
                      <div className="col-span-1 flex items-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveLineItem(item.id)}
                        >
                          <Trash size={16} className="text-destructive" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`taxable-${item.id}`}
                          checked={item.taxable}
                          onChange={(e) => handleUpdateLineItem(item.id, 'taxable', e.target.checked)}
                        />
                        <Label htmlFor={`taxable-${item.id}`} className="text-sm">Taxable</Label>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`service-charge-${item.id}`}
                          checked={item.serviceChargeApplicable}
                          onChange={(e) => handleUpdateLineItem(item.id, 'serviceChargeApplicable', e.target.checked)}
                        />
                        <Label htmlFor={`service-charge-${item.id}`} className="text-sm">Service Charge</Label>
                      </div>
                      
                      {item.taxLines.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Tax: {formatCurrency(item.totalTax)}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
                
                {lineItems.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Receipt size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No line items added yet</p>
                    <p className="text-sm">Add items manually or load from folio</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="discounts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Discounts & Adjustments</h3>
              <Button onClick={handleAddDiscount} size="sm">
                <Plus size={16} className="mr-2" />
                Add Discount
              </Button>
            </div>

            <div className="space-y-3">
              {discounts.map((discount) => (
                <Card key={discount.id} className="p-4">
                  <div className="grid grid-cols-12 gap-3 items-start">
                    <div className="col-span-5 space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={discount.description}
                        onChange={(e) => handleUpdateDiscount(discount.id, 'description', e.target.value)}
                        placeholder="Discount description..."
                      />
                    </div>
                    
                    <div className="col-span-2 space-y-2">
                      <Label>Type</Label>
                      <Select 
                        value={discount.type} 
                        onValueChange={(value) => handleUpdateDiscount(discount.id, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="fixed-amount">Fixed Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-2 space-y-2">
                      <Label>Value</Label>
                      <Input
                        type="number"
                        value={discount.value}
                        onChange={(e) => handleUpdateDiscount(discount.id, 'value', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div className="col-span-2 space-y-2">
                      <Label>Amount</Label>
                      <Input value={formatCurrency(discount.amount)} disabled />
                    </div>
                    
                    <div className="col-span-1 flex items-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDiscount(discount.id)}
                      >
                        <Trash size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              
              {discounts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Tag size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No discounts applied</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Invoice Summary</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                </div>
                
                {totals.totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discounts</span>
                    <span className="font-medium text-destructive">-{formatCurrency(totals.totalDiscount)}</span>
                  </div>
                )}
                
                {totals.serviceChargeAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Charge ({serviceChargeConfig.rate}%)</span>
                    <span className="font-medium">{formatCurrency(totals.serviceChargeAmount)}</span>
                  </div>
                )}
                
                <Separator />
                
                {totals.taxLines.map((tax) => (
                  <div key={tax.taxName} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{tax.taxName} ({tax.taxRate}%)</span>
                    <span className="font-medium">{formatCurrency(tax.taxAmount)}</span>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between text-lg font-semibold pt-2">
                  <span>Grand Total</span>
                  <span className="text-primary">{formatCurrency(totals.grandTotal)}</span>
                </div>
                
                {invoice && invoice.totalPaid > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Paid</span>
                      <span className="font-medium text-success">-{formatCurrency(invoice.totalPaid)}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Amount Due</span>
                      <span className="text-destructive">{formatCurrency(totals.grandTotal - invoice.totalPaid)}</span>
                    </div>
                  </>
                )}
              </div>

              {isTaxExempt && (
                <div className="mt-4 p-3 bg-warning/10 rounded-lg flex items-start gap-2">
                  <Warning size={20} className="text-warning mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Tax Exempt Invoice</p>
                    <p className="text-muted-foreground">{taxExemptionReason}</p>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {invoice ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
