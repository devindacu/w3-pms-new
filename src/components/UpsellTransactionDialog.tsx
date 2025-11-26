import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { UpsellTransaction, UpsellOffer, GuestProfile } from '@/lib/types'

interface UpsellTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: UpsellTransaction
  guests: GuestProfile[]
  offers: UpsellOffer[]
  onSave: (transaction: UpsellTransaction) => void
}

export function UpsellTransactionDialog({ open, onOpenChange }: UpsellTransactionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upsell Transaction Dialog</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">To be implemented</p>
      </DialogContent>
    </Dialog>
  )
}
