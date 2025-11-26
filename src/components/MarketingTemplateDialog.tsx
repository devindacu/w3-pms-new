import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { MarketingTemplate } from '@/lib/types'

interface MarketingTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: MarketingTemplate
  onSave: (template: MarketingTemplate) => void
}

export function MarketingTemplateDialog({ open, onOpenChange }: MarketingTemplateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Marketing Template Dialog</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">To be implemented</p>
      </DialogContent>
    </Dialog>
  )
}
