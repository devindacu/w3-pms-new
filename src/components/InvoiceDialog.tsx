import { Dialog } from '@/components/ui/dialog'

interface InvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoiceDialog({ open, onOpenChange }: InvoiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div>Invoice Dialog - Deprecated</div>
    </Dialog>
  )
}
