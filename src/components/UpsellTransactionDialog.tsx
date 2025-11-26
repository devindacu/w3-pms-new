import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { TrendUp } from '@phosphor-icons/react'
import type { UpsellTransaction, UpsellOffer, GuestProfile } from '@/lib/types'

interface UpsellTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: UpsellTransaction
  guests: GuestProfile[]
  offers: UpsellOffer[]
  onSave: (transaction: UpsellTransaction) => void
}

export function UpsellTransactionDialog({ open, onOpenChange, transaction, guests, offers, onSave }: UpsellTransactionDialogProps) {
  const [formData, setFormData] = useState<Partial<UpsellTransaction>>({
    status: 'offered',
    offeredVia: 'front-desk'
  })

  useEffect(() => {
    if (transaction) {
      setFormData(transaction)
    } else {
      setFormData({
        status: 'offered',
        offeredVia: 'front-desk'
      })
    }
  }, [transaction, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const selectedGuest = guests.find(g => g.id === formData.guestId)
    const selectedOffer = offers.find(o => o.id === formData.offerId)
    
    const transactionData: UpsellTransaction = {
      id: transaction?.id || `UST-${Date.now()}`,
      transactionNumber: transaction?.transactionNumber || `UT${String(Date.now()).slice(-6)}`,
      ...formData,
      guestName: selectedGuest ? `${selectedGuest.firstName} ${selectedGuest.lastName}` : '',
      offerName: selectedOffer?.name || '',
      category: selectedOffer?.category || 'other',
      amount: selectedOffer?.basePrice || 0,
      finalAmount: formData.finalAmount || selectedOffer?.discountedPrice || selectedOffer?.basePrice || 0,
      offeredAt: transaction?.offeredAt || Date.now(),
      offeredBy: transaction?.offeredBy || 'current-user',
      createdAt: transaction?.createdAt || Date.now(),
      updatedAt: Date.now()
    } as UpsellTransaction

    onSave(transactionData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendUp size={24} />
            {transaction ? 'Update Upsell Transaction' : 'Create Upsell Transaction'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guestId">Guest *</Label>
              <Select 
                value={formData.guestId} 
                onValueChange={(value) => setFormData({ ...formData, guestId: value })}
                required
              >
                <SelectTrigger id="guestId">
                  <SelectValue placeholder="Select guest" />
                </SelectTrigger>
                <SelectContent>
                  {guests.map((guest) => (
                    <SelectItem key={guest.id} value={guest.id}>
                      {guest.firstName} {guest.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="offerId">Offer *</Label>
              <Select 
                value={formData.offerId} 
                onValueChange={(value) => {
                  const offer = offers.find(o => o.id === value)
                  setFormData({ 
                    ...formData, 
                    offerId: value,
                    amount: offer?.basePrice || 0,
                    finalAmount: offer?.discountedPrice || offer?.basePrice || 0,
                    discount: offer?.discountedPrice ? (offer.basePrice - offer.discountedPrice) : undefined
                  })
                }}
                required
              >
                <SelectTrigger id="offerId">
                  <SelectValue placeholder="Select offer" />
                </SelectTrigger>
                <SelectContent>
                  {offers.filter(o => o.isActive).map((offer) => (
                    <SelectItem key={offer.id} value={offer.id}>
                      {offer.name} - ${offer.discountedPrice || offer.basePrice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status *</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                required
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="offered">Offered</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="offeredVia">Offered Via *</Label>
              <Select 
                value={formData.offeredVia} 
                onValueChange={(value) => setFormData({ ...formData, offeredVia: value as any })}
                required
              >
                <SelectTrigger id="offeredVia">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="front-desk">Front Desk</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="app">App</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="in-room-tablet">In-Room Tablet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="discount">Discount</Label>
              <Input
                id="discount"
                type="number"
                step="0.01"
                value={formData.discount}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  discount: parseFloat(e.target.value) || 0,
                  finalAmount: (formData.amount || 0) - (parseFloat(e.target.value) || 0)
                })}
              />
            </div>
            <div>
              <Label htmlFor="finalAmount">Final Amount *</Label>
              <Input
                id="finalAmount"
                type="number"
                step="0.01"
                value={formData.finalAmount}
                onChange={(e) => setFormData({ ...formData, finalAmount: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Additional notes about the transaction..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {transaction ? 'Update Transaction' : 'Create Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
