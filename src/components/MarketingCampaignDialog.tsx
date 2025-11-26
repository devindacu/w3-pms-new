import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { MarketingCampaign, MarketingTemplate, GuestProfile } from '@/lib/types'

interface MarketingCampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign?: MarketingCampaign
  templates: MarketingTemplate[]
  guests: GuestProfile[]
  onSave: (campaign: MarketingCampaign) => void
}

export function MarketingCampaignDialog({ open, onOpenChange }: MarketingCampaignDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Marketing Campaign Dialog</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">To be implemented</p>
      </DialogContent>
    </Dialog>
  )
}
