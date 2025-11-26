import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Envelope } from '@phosphor-icons/react'
import type { MarketingTemplate, MarketingChannelType } from '@/lib/types'

interface MarketingTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: MarketingTemplate
  onSave: (template: MarketingTemplate) => void
}

export function MarketingTemplateDialog({ open, onOpenChange, template, onSave }: MarketingTemplateDialogProps) {
  const [formData, setFormData] = useState<Partial<MarketingTemplate>>({
    type: 'promotional',
    channel: 'email',
    isActive: true,
    usage: 0,
    variables: []
  })

  useEffect(() => {
    if (template) {
      setFormData(template)
    } else {
      setFormData({
        type: 'promotional',
        channel: 'email',
        isActive: true,
        usage: 0,
        variables: []
      })
    }
  }, [template, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const templateData: MarketingTemplate = {
      id: template?.id || `TPL-${Date.now()}`,
      templateId: template?.templateId || `MT${String(Date.now()).slice(-6)}`,
      ...formData,
      createdAt: template?.createdAt || Date.now(),
      updatedAt: Date.now(),
      createdBy: template?.createdBy || 'current-user'
    } as MarketingTemplate

    onSave(templateData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Envelope size={24} />
            {template ? 'Edit Template' : 'Create Marketing Template'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Welcome Email"
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
                  <SelectItem value="transactional">Transactional</SelectItem>
                  <SelectItem value="welcome">Welcome</SelectItem>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="anniversary">Anniversary</SelectItem>
                  <SelectItem value="loyalty">Loyalty</SelectItem>
                  <SelectItem value="feedback-request">Feedback Request</SelectItem>
                  <SelectItem value="win-back">Win Back</SelectItem>
                  <SelectItem value="booking-confirmation">Booking Confirmation</SelectItem>
                  <SelectItem value="pre-arrival">Pre-arrival</SelectItem>
                  <SelectItem value="post-stay">Post-stay</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
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
              rows={2}
              placeholder="Template description..."
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
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>

          {formData.channel !== 'sms' && (
            <>
              <div>
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Use {firstName}, {lastName}, etc. for personalization"
                />
              </div>

              <div>
                <Label htmlFor="emailBody">Email Body</Label>
                <Textarea
                  id="emailBody"
                  value={formData.emailBody}
                  onChange={(e) => setFormData({ ...formData, emailBody: e.target.value })}
                  rows={8}
                  placeholder="Email content... Use variables like {firstName}, {loyaltyPoints}, etc."
                />
              </div>
            </>
          )}

          {formData.channel !== 'email' && (
            <div>
              <Label htmlFor="smsBody">SMS Body</Label>
              <Textarea
                id="smsBody"
                value={formData.smsBody}
                onChange={(e) => setFormData({ ...formData, smsBody: e.target.value })}
                rows={4}
                placeholder="SMS content (max 160 chars)... Use {firstName}, {loyaltyPoints}, etc."
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {(formData.smsBody || '').length}/160 characters
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {template ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
