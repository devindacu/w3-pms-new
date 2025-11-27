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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { Season, SeasonType } from '@/lib/types'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarIcon } from '@phosphor-icons/react'
import { format } from 'date-fns'

interface SeasonDialogProps {
  open: boolean
  onClose: () => void
  season: Season | null
  onSave: (season: Season) => void
}

export function SeasonDialog({ open, onClose, season, onSave }: SeasonDialogProps) {
  const [formData, setFormData] = useState<Partial<Season>>({
    name: '',
    code: '',
    type: 'mid',
    startDate: Date.now(),
    endDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
    rateMultiplier: 1.0,
    description: '',
    isActive: true,
  })

  useEffect(() => {
    if (season) {
      setFormData(season)
    } else {
      setFormData({
        name: '',
        code: '',
        type: 'mid',
        startDate: Date.now(),
        endDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
        rateMultiplier: 1.0,
        description: '',
        isActive: true,
      })
    }
  }, [season, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const seasonData: Season = {
      id: season?.id || `season-${Date.now()}`,
      name: formData.name || '',
      code: formData.code || '',
      type: formData.type || 'mid',
      startDate: formData.startDate || Date.now(),
      endDate: formData.endDate || Date.now(),
      rateMultiplier: formData.rateMultiplier || 1.0,
      description: formData.description,
      isActive: formData.isActive ?? true,
      createdAt: season?.createdAt || Date.now(),
      updatedAt: Date.now(),
    }

    onSave(seasonData)
    onClose()
  }

  const handleCodeGeneration = (name: string) => {
    const code = name.toUpperCase().replace(/\s+/g, '_').substring(0, 10)
    setFormData(prev => ({ ...prev, code }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{season ? 'Edit Season' : 'Add Season'}</DialogTitle>
          <DialogDescription>
            Configure seasonal pricing periods to automatically adjust room rates
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Season Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                    if (!season) handleCodeGeneration(e.target.value)
                  }}
                  placeholder="e.g., Summer High Season"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Season Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g., SUMMER_HIGH"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Season Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, type: value as SeasonType }))
                    const multipliers = { low: 0.8, mid: 1.0, high: 1.3, peak: 1.6 }
                    setFormData(prev => ({ ...prev, rateMultiplier: multipliers[value as SeasonType] }))
                  }}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select season type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Season</SelectItem>
                    <SelectItem value="mid">Mid Season</SelectItem>
                    <SelectItem value="high">High Season</SelectItem>
                    <SelectItem value="peak">Peak Season</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="multiplier">Rate Multiplier *</Label>
                <Input
                  id="multiplier"
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="5.0"
                  value={formData.rateMultiplier}
                  onChange={(e) => setFormData(prev => ({ ...prev, rateMultiplier: parseFloat(e.target.value) }))}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Base rate × {formData.rateMultiplier} = Final rate
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon size={16} className="mr-2" />
                      {formData.startDate ? format(new Date(formData.startDate), 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.startDate ? new Date(formData.startDate) : undefined}
                      onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date?.getTime() || Date.now() }))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon size={16} className="mr-2" />
                      {formData.endDate ? format(new Date(formData.endDate), 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endDate ? new Date(formData.endDate) : undefined}
                      onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date?.getTime() || Date.now() }))}
                      disabled={(date) => formData.startDate ? date < new Date(formData.startDate) : false}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this season and any special pricing considerations..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="active">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Enable this season for automatic rate adjustments
                </p>
              </div>
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Season Pricing Example</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Room Rate:</span>
                  <span className="font-medium">$100.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Season Multiplier:</span>
                  <span className="font-medium">×{formData.rateMultiplier}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Final Rate:</span>
                  <span className="font-semibold text-primary">
                    ${(100 * (formData.rateMultiplier || 1)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {season ? 'Update Season' : 'Create Season'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
