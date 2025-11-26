import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { UpsellOffer } from '@/lib/types'

interface UpsellOfferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  offer?: UpsellOffer
  onSave: (offer: UpsellOffer) => void
}

export function UpsellOfferDialog({ open, onOpenChange }: UpsellOfferDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upsell Offer Dialog</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">To be implemented</p>
      </DialogContent>
    </Dialog>
  )
}
