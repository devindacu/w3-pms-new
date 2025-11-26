import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { GuestProfile } from '@/lib/types'

interface GuestProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guest?: GuestProfile
  onSave: (guest: GuestProfile) => void
}

export function GuestProfileDialog({ open, onOpenChange, guest, onSave }: GuestProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{guest ? 'Edit Guest Profile' : 'Add Guest Profile'}</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <p className="text-muted-foreground">Guest profile dialog - To be implemented</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
