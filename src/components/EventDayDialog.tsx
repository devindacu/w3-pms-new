import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import type { EventDay } from '@/lib/types'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarIcon, Info } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface EventDayDialogProps {
  open: boolean
  onClose: () => void
  event: EventDay | null
  onSave: (event: EventDay) => void
}

export function EventDayDialog({ open, onClose, event, onSave }: EventDayDialogProps) {
  const [formData, setFormData] = useState<Partial<EventDay>>({
    name: '',
    date: Date.now(),
    description: '',
    rateMultiplier: 1.5,
    minimumStay: undefined,
    isActive: true,
  })

  useEffect(() => {
    if (event) {
      setFormData(event)
    } else {
      setFormData({
        name: '',
        date: Date.now(),
        description: '',
        rateMultiplier: 1.5,
        minimumStay: undefined,
        isActive: true,
      })
    }
  }, [event, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const eventData: EventDay = {
      id: event?.id || `event-${Date.now()}`,
      name: formData.name || '',
      date: formData.date || Date.now(),
      description: formData.description,
      rateMultiplier: formData.rateMultiplier || 1.5,
      minimumStay: formData.minimumStay,
      isActive: formData.isActive ?? true,
      createdAt: event?.createdAt || Date.now(),
      updatedAt: Date.now(),
    }

    onSave(eventData)
    onClose()
  }

  const suggestedEvents = [
    { name: 'New Year\'s Eve', multiplier: 2.5, minStay: 2 },
    { name: 'Christmas', multiplier: 2.0, minStay: 2 },
    { name: 'Independence Day', multiplier: 1.8, minStay: undefined },
    { name: 'Valentine\'s Day', multiplier: 1.6, minStay: undefined },
    { name: 'Thanksgiving', multiplier: 1.7, minStay: 2 },
    { name: 'Easter', multiplier: 1.6, minStay: undefined },
    { name: 'Labor Day Weekend', multiplier: 1.5, minStay: 2 },
    { name: 'Memorial Day Weekend', multiplier: 1.5, minStay: 2 },
  ]

  const applySuggestedEvent = (suggested: typeof suggestedEvents[0]) => {
    setFormData(prev => ({
      ...prev,
      name: suggested.name,
      rateMultiplier: suggested.multiplier,
      minimumStay: suggested.minStay,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Special Event' : 'Add Special Event'}</DialogTitle>
          <DialogDescription>
            Configure special event days with premium pricing and minimum stay requirements
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <Alert>
              <Info size={16} />
              <AlertDescription>
                Event days override seasonal pricing and apply premium rates for special occasions
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="name">Event Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., New Year's Eve, Concert Weekend"
                required
              />
              
              {!event && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <p className="text-xs text-muted-foreground w-full">Quick suggestions:</p>
                  {suggestedEvents.map((suggested, idx) => (
                    <Button
                      key={idx}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => applySuggestedEvent(suggested)}
                    >
                      {suggested.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon size={16} className="mr-2" />
                      {formData.date ? format(new Date(formData.date), 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date ? new Date(formData.date) : undefined}
                      onSelect={(date) => setFormData(prev => ({ ...prev, date: date?.getTime() || Date.now() }))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="multiplier">Rate Multiplier *</Label>
                <Input
                  id="multiplier"
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="10.0"
                  value={formData.rateMultiplier}
                  onChange={(e) => setFormData(prev => ({ ...prev, rateMultiplier: parseFloat(e.target.value) }))}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Typically 1.5× to 3.0× for special events
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStay">Minimum Stay (Optional)</Label>
              <Input
                id="minStay"
                type="number"
                min="1"
                max="14"
                value={formData.minimumStay || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  minimumStay: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                placeholder="e.g., 2 nights"
              />
              <p className="text-xs text-muted-foreground">
                Require guests to book a minimum number of nights during this event
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the event and any special considerations..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="active">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Enable this event for premium pricing
                </p>
              </div>
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Event Pricing Example</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Room Rate:</span>
                  <span className="font-medium">$100.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Event Multiplier:</span>
                  <span className="font-medium">×{formData.rateMultiplier}</span>
                </div>
                {formData.minimumStay && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Minimum Stay:</span>
                    <span className="font-medium">{formData.minimumStay} nights</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Event Rate:</span>
                  <span className="font-semibold text-destructive">
                    ${(100 * (formData.rateMultiplier || 1)).toFixed(2)}/night
                  </span>
                </div>
                {formData.minimumStay && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Total for {formData.minimumStay} nights:</span>
                    <span>${(100 * (formData.rateMultiplier || 1) * formData.minimumStay).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {event ? 'Update Event' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
