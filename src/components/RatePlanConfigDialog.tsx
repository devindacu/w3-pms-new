import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalIcon, X } from '@phosphor-icons/react'
import type {
  RatePlanConfig,
  BaseRatePlanType,
  PromoRatePlanType,
  MealPlanType,
  DerivedRateType,
  RoomTypeConfig
} from '@/lib/types'

interface RatePlanConfigDialogProps {
  open: boolean
  onClose: () => void
  ratePlan: RatePlanConfig | null
  onSave: (ratePlan: RatePlanConfig) => void
  roomTypes: RoomTypeConfig[]
  parentRatePlans: RatePlanConfig[]
  currentUser: { id: string }
}

const baseRatePlanTypes: BaseRatePlanType[] = ['bar', 'rack', 'corporate', 'travel-agent', 'wholesale', 'member', 'staff']
const promoRatePlanTypes: PromoRatePlanType[] = ['early-bird', 'last-minute', 'long-stay', 'weekend', 'festive', 'honeymoon', 'spa-package']
const mealPlanTypes: MealPlanType[] = ['ro', 'bb', 'hb', 'fb', 'ai']
const derivedRateTypes: DerivedRateType[] = ['percentage-discount', 'percentage-markup', 'fixed-discount', 'fixed-markup', 'derived-from-rate']

export function RatePlanConfigDialog({
  open,
  onClose,
  ratePlan,
  onSave,
  roomTypes,
  parentRatePlans,
  currentUser
}: RatePlanConfigDialogProps) {
  const [formData, setFormData] = useState<Partial<RatePlanConfig>>({
    code: '',
    name: '',
    description: '',
    type: 'bar',
    mealPlan: undefined,
    isParent: true,
    parentRatePlanId: undefined,
    roomTypeId: undefined,
    baseRate: undefined,
    validFrom: Date.now(),
    validTo: undefined,
    blackoutDates: [],
    minimumStay: undefined,
    maximumStay: undefined,
    advanceBookingDays: undefined,
    maxAdvanceBookingDays: undefined,
    cancellationPolicy: '',
    requiresApproval: false,
    isActive: true,
    sortOrder: 0,
    channels: [],
    derivedRateConfig: undefined
  })

  const [validFromDate, setValidFromDate] = useState<Date | undefined>(new Date())
  const [validToDate, setValidToDate] = useState<Date | undefined>()
  const [newChannel, setNewChannel] = useState('')

  useEffect(() => {
    if (ratePlan) {
      setFormData(ratePlan)
      setValidFromDate(new Date(ratePlan.validFrom))
      setValidToDate(ratePlan.validTo ? new Date(ratePlan.validTo) : undefined)
    } else {
      const now = Date.now()
      setFormData({
        code: '',
        name: '',
        description: '',
        type: 'bar',
        mealPlan: undefined,
        isParent: true,
        parentRatePlanId: undefined,
        roomTypeId: undefined,
        baseRate: undefined,
        validFrom: now,
        validTo: undefined,
        blackoutDates: [],
        minimumStay: undefined,
        maximumStay: undefined,
        advanceBookingDays: undefined,
        maxAdvanceBookingDays: undefined,
        cancellationPolicy: '',
        requiresApproval: false,
        isActive: true,
        sortOrder: 0,
        channels: [],
        derivedRateConfig: undefined
      })
      setValidFromDate(new Date())
      setValidToDate(undefined)
    }
  }, [ratePlan, open])

  const handleSubmit = () => {
    if (!formData.name || !formData.code || !formData.type) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!formData.isParent && !formData.parentRatePlanId) {
      toast.error('Derived rate plan must have a parent rate plan')
      return
    }

    if (!formData.isParent && !formData.derivedRateConfig) {
      toast.error('Derived rate plan must have derived rate configuration')
      return
    }

    if (formData.isParent && formData.baseRate === undefined) {
      toast.error('Parent rate plan must have a base rate')
      return
    }

    const now = Date.now()
    const savedRatePlan: RatePlanConfig = {
      id: ratePlan?.id || `rp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      code: formData.code!,
      name: formData.name!,
      description: formData.description,
      type: formData.type!,
      mealPlan: formData.mealPlan,
      isParent: formData.isParent!,
      parentRatePlanId: formData.parentRatePlanId,
      roomTypeId: formData.roomTypeId,
      baseRate: formData.baseRate,
      derivedRateConfig: formData.derivedRateConfig,
      validFrom: validFromDate ? validFromDate.getTime() : Date.now(),
      validTo: validToDate ? validToDate.getTime() : undefined,
      blackoutDates: formData.blackoutDates || [],
      minimumStay: formData.minimumStay,
      maximumStay: formData.maximumStay,
      advanceBookingDays: formData.advanceBookingDays,
      maxAdvanceBookingDays: formData.maxAdvanceBookingDays,
      cancellationPolicy: formData.cancellationPolicy,
      requiresApproval: formData.requiresApproval || false,
      isActive: formData.isActive ?? true,
      sortOrder: formData.sortOrder || 0,
      channels: formData.channels || [],
      createdAt: ratePlan?.createdAt || now,
      updatedAt: now,
      createdBy: ratePlan?.createdBy || currentUser.id
    }

    onSave(savedRatePlan)
    toast.success(`Rate plan ${ratePlan ? 'updated' : 'created'} successfully`)
    onClose()
  }

  const addChannel = () => {
    if (newChannel.trim()) {
      const current = formData.channels || []
      if (!current.includes(newChannel.trim())) {
        setFormData({ ...formData, channels: [...current, newChannel.trim()] })
        setNewChannel('')
      }
    }
  }

  const removeChannel = (channel: string) => {
    setFormData({
      ...formData,
      channels: (formData.channels || []).filter(c => c !== channel)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ratePlan ? 'Edit' : 'Create'} Rate Plan</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Rate Plan Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Best Available Rate"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., BAR"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the rate plan..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Rate Plan Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as BaseRatePlanType | PromoRatePlanType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <optgroup label="Base Rates">
                    {baseRatePlanTypes.map(type => (
                      <SelectItem key={type} value={type} className="capitalize">
                        {type.replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </optgroup>
                  <optgroup label="Promotional Rates">
                    {promoRatePlanTypes.map(type => (
                      <SelectItem key={type} value={type} className="capitalize">
                        {type.replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </optgroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mealPlan">Meal Plan</Label>
              <Select
                value={formData.mealPlan || ''}
                onValueChange={(value) => setFormData({ ...formData, mealPlan: value ? value as MealPlanType : undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select meal plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {mealPlanTypes.map(type => (
                    <SelectItem key={type} value={type} className="uppercase">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="isParent"
                checked={formData.isParent}
                onCheckedChange={(checked) => setFormData({ ...formData, isParent: checked, parentRatePlanId: undefined, derivedRateConfig: undefined })}
              />
              <Label htmlFor="isParent">Parent Rate Plan</Label>
            </div>
          </div>

          {!formData.isParent && (
            <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
              <h3 className="font-semibold">Derived Rate Configuration</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parentRatePlanId">Parent Rate Plan *</Label>
                  <Select
                    value={formData.parentRatePlanId || ''}
                    onValueChange={(value) => setFormData({ ...formData, parentRatePlanId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent rate plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {parentRatePlans.map(rp => (
                        <SelectItem key={rp.id} value={rp.id}>
                          {rp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="derivedType">Derivation Type *</Label>
                  <Select
                    value={formData.derivedRateConfig?.derivedType || ''}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        derivedRateConfig: {
                          derivedType: value as DerivedRateType,
                          parentRatePlanId: formData.parentRatePlanId || '',
                          value: formData.derivedRateConfig?.value || 0,
                          roundingRule: formData.derivedRateConfig?.roundingRule
                        }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select derivation type" />
                    </SelectTrigger>
                    <SelectContent>
                      {derivedRateTypes.map(type => (
                        <SelectItem key={type} value={type} className="capitalize">
                          {type.replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="derivedValue">
                    Value *
                    {formData.derivedRateConfig?.derivedType?.includes('percentage') && ' (%)'}
                    {formData.derivedRateConfig?.derivedType?.includes('fixed') && ' (LKR)'}
                  </Label>
                  <Input
                    id="derivedValue"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.derivedRateConfig?.value || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        derivedRateConfig: formData.derivedRateConfig
                          ? { ...formData.derivedRateConfig, value: parseFloat(e.target.value) || 0 }
                          : undefined
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roundingRule">Rounding Rule</Label>
                  <Select
                    value={formData.derivedRateConfig?.roundingRule || 'none'}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        derivedRateConfig: formData.derivedRateConfig
                          ? { ...formData.derivedRateConfig, roundingRule: value as any }
                          : undefined
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="nearest-5">Nearest 5</SelectItem>
                      <SelectItem value="nearest-10">Nearest 10</SelectItem>
                      <SelectItem value="nearest-50">Nearest 50</SelectItem>
                      <SelectItem value="nearest-100">Nearest 100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {formData.isParent && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseRate">Base Rate (LKR) *</Label>
                <Input
                  id="baseRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.baseRate || ''}
                  onChange={(e) => setFormData({ ...formData, baseRate: parseFloat(e.target.value) || undefined })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomTypeId">Room Type (Optional)</Label>
                <Select
                  value={formData.roomTypeId || ''}
                  onValueChange={(value) => setFormData({ ...formData, roomTypeId: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Room Types</SelectItem>
                    {roomTypes.map(rt => (
                      <SelectItem key={rt.id} value={rt.id}>
                        {rt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valid From *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalIcon size={16} className="mr-2" />
                    {validFromDate ? validFromDate.toLocaleDateString() : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={validFromDate}
                    onSelect={setValidFromDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Valid To (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalIcon size={16} className="mr-2" />
                    {validToDate ? validToDate.toLocaleDateString() : 'No end date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={validToDate}
                    onSelect={setValidToDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minimumStay">Min Stay (nights)</Label>
              <Input
                id="minimumStay"
                type="number"
                min="0"
                value={formData.minimumStay || ''}
                onChange={(e) => setFormData({ ...formData, minimumStay: parseInt(e.target.value) || undefined })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maximumStay">Max Stay (nights)</Label>
              <Input
                id="maximumStay"
                type="number"
                min="0"
                value={formData.maximumStay || ''}
                onChange={(e) => setFormData({ ...formData, maximumStay: parseInt(e.target.value) || undefined })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="advanceBookingDays">Min Advance (days)</Label>
              <Input
                id="advanceBookingDays"
                type="number"
                min="0"
                value={formData.advanceBookingDays || ''}
                onChange={(e) => setFormData({ ...formData, advanceBookingDays: parseInt(e.target.value) || undefined })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAdvanceBookingDays">Max Advance (days)</Label>
              <Input
                id="maxAdvanceBookingDays"
                type="number"
                min="0"
                value={formData.maxAdvanceBookingDays || ''}
                onChange={(e) => setFormData({ ...formData, maxAdvanceBookingDays: parseInt(e.target.value) || undefined })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
            <Textarea
              id="cancellationPolicy"
              value={formData.cancellationPolicy}
              onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
              placeholder="Describe cancellation policy..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Channels</Label>
            <div className="flex gap-2">
              <Input
                value={newChannel}
                onChange={(e) => setNewChannel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChannel())}
                placeholder="Add channel (e.g., Booking.com)..."
              />
              <Button type="button" onClick={addChannel} size="sm">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(formData.channels || []).map(channel => (
                <Badge key={channel} variant="outline">
                  {channel}
                  <X
                    size={14}
                    className="ml-1 cursor-pointer"
                    onClick={() => removeChannel(channel)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                min="0"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="requiresApproval"
                checked={formData.requiresApproval}
                onCheckedChange={(checked) => setFormData({ ...formData, requiresApproval: checked })}
              />
              <Label htmlFor="requiresApproval">Requires Approval</Label>
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>
            {ratePlan ? 'Update' : 'Create'} Rate Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
