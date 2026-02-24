import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Receipt,
  ForkKnife,
  Basket,
  Plus,
  Trash,
  Calendar,
  CurrencyDollar
} from '@phosphor-icons/react'
import type { GuestInvoice, InvoiceLineItem, SystemUser } from '@/lib/types'
import { formatCurrency, formatDate, generateNumber } from '@/lib/helpers'

export type ChargeType = 'room' | 'fnb' | 'extra-service'

interface ChargePostingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chargeType: ChargeType | null
  invoice?: GuestInvoice
  guestName?: string
  roomNumber?: string
  onChargePosted: (charges: InvoiceLineItem[]) => void
  currentUser: SystemUser
}

export function ChargePostingDialog({
  open,
  onOpenChange,
  chargeType,
  invoice,
  guestName = '',
  roomNumber = '',
  onChargePosted,
  currentUser
}: ChargePostingDialogProps) {
  const [charges, setCharges] = useState<InvoiceLineItem[]>([])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [quantity, setQuantity] = useState<number>(1)
  const [chargeDate, setChargeDate] = useState(formatDate(Date.now()))
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setCharges([])
      setDescription('')
      setAmount(0)
      setQuantity(1)
      setChargeDate(formatDate(Date.now()))
      setNotes('')
    }
  }, [open])

  const getChargeTypeInfo = () => {
    switch (chargeType) {
      case 'room':
        return {
          title: 'Post Room Charges',
          icon: <Receipt size={24} className="text-primary" />,
          placeholder: 'Room charge description (e.g., Nightly Rate, Late Checkout)',
          defaultDescription: 'Room Charge'
        }
      case 'fnb':
        return {
          title: 'Post F&B Charges',
          icon: <ForkKnife size={24} className="text-accent" />,
          placeholder: 'F&B item description (e.g., Breakfast, Room Service)',
          defaultDescription: 'F&B Charge'
        }
      case 'extra-service':
        return {
          title: 'Post Extra Service Charges',
          icon: <Basket size={24} className="text-success" />,
          placeholder: 'Service description (e.g., Spa, Laundry, Tour)',
          defaultDescription: 'Extra Service'
        }
      default:
        return {
          title: 'Post Charge',
          icon: <CurrencyDollar size={24} />,
          placeholder: 'Charge description',
          defaultDescription: 'Charge'
        }
    }
  }

  const addChargeToList = () => {
    if (!description.trim()) {
      toast.error('Please enter a description')
      return
    }

    if (amount <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }

    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0')
      return
    }

    const lineTotal = amount * quantity
    const taxRate = 0.1 // 10% tax
    const totalTax = lineTotal * taxRate
    const lineGrandTotal = lineTotal + totalTax
    const now = Date.now()

    const newCharge: InvoiceLineItem = {
      id: `charge-${now}-${Math.random().toString(36).substr(2, 9)}`,
      description: description.trim(),
      quantity,
      unit: 'unit',
      unitPrice: amount,
      lineTotal,
      taxLines: [{ taxType: 'vat', taxName: 'VAT', taxRate: taxRate * 100, taxableAmount: lineTotal, taxAmount: totalTax, isInclusive: false }],
      totalTax,
      netAmount: lineTotal,
      lineGrandTotal,
      discountAmount: 0,
      discountType: undefined,
      discountValue: 0,
      serviceChargeApplicable: false,
      serviceChargeAmount: 0,
      itemType: chargeType === 'fnb' ? 'fnb-restaurant' : chargeType === 'extra-service' ? 'extra-service' : 'room-charge',
      department: chargeType === 'fnb' ? 'fnb' : chargeType === 'extra-service' ? 'admin' : 'front-office',
      date: now,
      postedAt: now,
      postedBy: `${currentUser.firstName} ${currentUser.lastName}`,
      taxable: true,
      isSplit: false,
      isVoided: false,
      notes: chargeDate,
    }

    setCharges([...charges, newCharge])
    
    // Reset input fields for next item
    setDescription('')
    setAmount(0)
    setQuantity(1)
    
    toast.success('Charge added to list')
  }

  const removeCharge = (id: string) => {
    setCharges(charges.filter(c => c.id !== id))
    toast.success('Charge removed')
  }

  const handleSubmit = () => {
    if (charges.length === 0) {
      toast.error('Please add at least one charge')
      return
    }

    onChargePosted(charges)
    onOpenChange(false)
    toast.success(`${charges.length} charge(s) posted successfully`)
  }

  const typeInfo = getChargeTypeInfo()
  const totalAmount = charges.reduce((sum, charge) => sum + charge.lineGrandTotal, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {typeInfo.icon}
            {typeInfo.title}
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            {guestName && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Guest:</span>
                <span>{guestName}</span>
              </div>
            )}
            {roomNumber && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Room:</span>
                <Badge variant="outline">{roomNumber}</Badge>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Add New Charge Form */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold text-sm">Add Charge</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={typeInfo.placeholder}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chargeDate">Date</Label>
                <Input
                  id="chargeDate"
                  type="date"
                  value={chargeDate}
                  onChange={(e) => setChargeDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Unit Price (LKR)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                Line Total: {formatCurrency(amount * quantity)}
              </div>
              <Button onClick={addChargeToList} size="sm">
                <Plus size={16} className="mr-2" />
                Add to List
              </Button>
            </div>
          </div>

          {/* Charges List */}
          {charges.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Charges to Post ({charges.length})</h3>
                <div className="text-sm font-semibold">
                  Total: {formatCurrency(totalAmount)}
                </div>
              </div>

              <ScrollArea className="h-[200px] rounded-lg border">
                <div className="divide-y">
                  {charges.map((charge) => (
                    <div
                      key={charge.id}
                      className="flex items-center justify-between p-3 hover:bg-muted/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{charge.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span>{charge.quantity} × {formatCurrency(charge.unitPrice)}</span>
                          <span>Tax: {formatCurrency(charge.totalTax)}</span>
                          <span className="text-xs text-muted-foreground">{charge.notes}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-semibold text-sm">
                          {formatCurrency(charge.lineGrandTotal)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCharge(charge.id)}
                        >
                          <Trash size={16} className="text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes about these charges..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={charges.length === 0}>
            Post {charges.length > 0 && `${charges.length} `}Charge{charges.length !== 1 && 's'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
