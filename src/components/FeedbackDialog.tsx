import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { GuestFeedback, GuestProfile } from '@/lib/types'

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feedback?: GuestFeedback
  guests: GuestProfile[]
  onSave: (feedback: GuestFeedback) => void
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feedback Dialog</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">To be implemented</p>
      </DialogContent>
    </Dialog>
  )
}
