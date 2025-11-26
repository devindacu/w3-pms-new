import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { Gift } from '@phosphor-icons/react'
import type { UpsellOffer, UpsellCategory } from '@/lib/types'

interface UpsellOfferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  offer?: UpsellOffer
  onSave: (offer: UpsellOffer) => void
}

export function UpsellOfferDialog({ open, onOpenChange, offer, onSave }: UpsellOfferDialogProps) {
  const [formData, setFormData] = useState<Partial<UpsellOffer>>({
    category: 'room-upgrade',
    isActive: true,
    availableFor: {},
    displayOrder: 0
  })

  useEffect(() => {
    if (offer) {
      setFormData(offer)
    } else {
      setFormData({
        category: 'room-upgrade',
        isActive: true,
        availableFor: {},
        displayOrder: 0
      })
    }
  }, [offer, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const offerData: UpsellOffer = {
      id: offer?.id || `USO-${Date.now()}`,
      offerId: offer?.offerId || `UO${String(Date.now()).slice(-6)}`,
      ...formData,
      createdAt: offer?.createdAt || Date.now(),
      updatedAt: Date.now(),
      createdBy: offer?.createdBy || 'current-user'
    } as UpsellOffer

    onSave(offerData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift size={24} />
            {offer ? 'Edit Upsell Offer' : 'Create Upsell Offer'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Offer Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Room Upgrade to Suite"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value as UpsellCategory })}
                required
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="room-upgrade">Room Upgrade</SelectItem>
                  <SelectItem value="spa">Spa</SelectItem>
                  <SelectItem value="dining">Dining</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="tours">Tours</SelectItem>
                  <SelectItem value="late-checkout">Late Checkout</SelectItem>
                  <SelectItem value="early-checkin">Early Check-in</SelectItem>
                  <SelectItem value="package">Package</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Detailed description of the offer..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="basePrice">Base Price *</Label>
              <Input
                id="basePrice"
                type="number"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <Label htmlFor="discountedPrice">Discounted Price</Label>
              <Input
                id="discountedPrice"
                type="number"
                step="0.01"
                value={formData.discountedPrice}
                onChange={(e) => setFormData({ ...formData, discountedPrice: parseFloat(e.target.value) || undefined })}
                placeholder="Leave empty for no discount"
              />
            </div>
          </div>

          <Card className="p-4">
            <Label>Inventory (Optional)</Label>
            <div className="grid grid-cols-3 gap-4 mt-3">
              <div>
                <Label htmlFor="totalInventory">Total</Label>
                <Input
                  id="totalInventory"
                  type="number"
                  value={formData.inventory?.total}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    inventory: { 
                      ...formData.inventory!, 
                      total: parseInt(e.target.value) || 0,
                      available: parseInt(e.target.value) || 0,
                      reserved: 0
                    } 
                  })}
                />
              </div>
              <div>
                <Label htmlFor="availableInventory">Available</Label>
                <Input
                  id="availableInventory"
                  type="number"
                  value={formData.inventory?.available}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    inventory: { ...formData.inventory!, available: parseInt(e.target.value) || 0 } 
                  })}
                />
              </div>
              <div>
                <Label htmlFor="reservedInventory">Reserved</Label>
                <Input
                  id="reservedInventory"
                  type="number"
                  value={formData.inventory?.reserved}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    inventory: { ...formData.inventory!, reserved: parseInt(e.target.value) || 0 } 
                  })}
                />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="validFrom">Valid From</Label>
              <Input
                id="validFrom"
                type="date"
                value={formData.validFrom ? new Date(formData.validFrom).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value ? new Date(e.target.value).getTime() : undefined })}
              />
            </div>
            <div>
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                type="date"
                value={formData.validUntil ? new Date(formData.validUntil).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value ? new Date(e.target.value).getTime() : undefined })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label htmlFor="isActive">Active Offer</Label>
              <p className="text-xs text-muted-foreground">Available for booking</p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {offer ? 'Update Offer' : 'Create Offer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
