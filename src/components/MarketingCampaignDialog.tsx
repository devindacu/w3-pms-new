import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Megaphone } from '@phosphor-icons/react'
import type { MarketingCampaign, MarketingTemplate, GuestProfile, GuestSegment, LoyaltyTier, MarketingChannelType } from '@/lib/types'

interface MarketingCampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign?: MarketingCampaign
  templates: MarketingTemplate[]
  guests: GuestProfile[]
  onSave: (campaign: MarketingCampaign) => void
}

export function MarketingCampaignDialog({ open, onOpenChange, campaign, templates, guests, onSave }: MarketingCampaignDialogProps) {
  const [formData, setFormData] = useState<Partial<MarketingCampaign>>({
    type: 'promotional',
    status: 'draft',
    channel: 'email',
    targetSegments: [],
    filters: [],
    emailsSent: 0,
    smsSent: 0,
    emailsOpened: 0,
    emailsClicked: 0,
    conversions: 0,
    revenue: 0,
    cost: 0,
    unsubscribes: 0,
    bounces: 0,
    errors: 0
  })

  useEffect(() => {
    if (campaign) {
      setFormData(campaign)
    } else {
      const recipientCount = guests.length
      setFormData({
        type: 'promotional',
        status: 'draft',
        channel: 'email',
        targetSegments: [],
        filters: [],
        recipientCount,
        emailsSent: 0,
        smsSent: 0,
        emailsOpened: 0,
        emailsClicked: 0,
        conversions: 0,
        revenue: 0,
        cost: 0,
        unsubscribes: 0,
        bounces: 0,
        errors: 0
      })
    }
  }, [campaign, open, guests])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const campaignData: MarketingCampaign = {
      id: campaign?.id || `CAMP-${Date.now()}`,
      campaignId: campaign?.campaignId || `MC${String(Date.now()).slice(-6)}`,
      ...formData,
      createdAt: campaign?.createdAt || Date.now(),
      updatedAt: Date.now(),
      createdBy: campaign?.createdBy || 'current-user'
    } as MarketingCampaign

    onSave(campaignData)
  }

  const toggleSegment = (segment: GuestSegment) => {
    const current = formData.targetSegments || []
    if (current.includes(segment)) {
      setFormData({ ...formData, targetSegments: current.filter(s => s !== segment) })
    } else {
      setFormData({ ...formData, targetSegments: [...current, segment] })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone size={24} />
            {campaign ? 'Edit Campaign' : 'Create Marketing Campaign'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Summer Promotion 2024"
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                required
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="promotional">Promotional</SelectItem>
                  <SelectItem value="loyalty">Loyalty</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                  <SelectItem value="reengagement">Re-engagement</SelectItem>
                  <SelectItem value="upsell">Upsell</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Campaign description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="channel">Channel *</Label>
              <Select 
                value={formData.channel} 
                onValueChange={(value) => setFormData({ ...formData, channel: value as MarketingChannelType })}
                required
              >
                <SelectTrigger id="channel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="templateId">Template</Label>
            <Select 
              value={formData.templateId} 
              onValueChange={(value) => setFormData({ ...formData, templateId: value })}
            >
              <SelectTrigger id="templateId">
                <SelectValue placeholder="Select template (optional)" />
              </SelectTrigger>
              <SelectContent>
                {templates.filter(t => t.isActive).map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} ({template.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Target Segments</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {(['vip', 'corporate', 'leisure', 'group', 'wedding', 'repeat', 'new'] as GuestSegment[]).map((segment) => (
                <Badge
                  key={segment}
                  variant={(formData.targetSegments || []).includes(segment) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleSegment(segment)}
                >
                  {segment}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduledDate">Scheduled Date</Label>
              <Input
                id="scheduledDate"
                type="datetime-local"
                value={formData.scheduledDate ? new Date(formData.scheduledDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value ? new Date(e.target.value).getTime() : undefined })}
              />
            </div>
            <div>
              <Label htmlFor="cost">Campaign Cost</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {campaign && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <Label>Sent</Label>
                <p className="text-2xl font-semibold">{(formData.emailsSent || 0) + (formData.smsSent || 0)}</p>
              </div>
              <div>
                <Label>Opens</Label>
                <p className="text-2xl font-semibold">{formData.emailsOpened || 0}</p>
              </div>
              <div>
                <Label>Revenue</Label>
                <p className="text-2xl font-semibold">${formData.revenue || 0}</p>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="Internal notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {campaign ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
