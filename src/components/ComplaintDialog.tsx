import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { GuestComplaint, GuestProfile } from '@/lib/types'

interface ComplaintDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  complaint?: GuestComplaint
  guests: GuestProfile[]
  onSave: (complaint: GuestComplaint) => void
}

export function ComplaintDialog({ open, onOpenChange }: ComplaintDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complaint Dialog</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">To be implemented</p>
      </DialogContent>
    </Dialog>
  )
}
