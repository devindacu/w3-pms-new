import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import type { RatePlan, OTAConnection, RoomType, RatePlanType } from '@/lib/types'

interface RatePlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ratePlan?: RatePlan
  connections: OTAConnection[]
  onSave: (plan: RatePlan) => void
  currentUser: { firstName: string; lastName: string }
}

export function RatePlanDialog({ open, onOpenChange, ratePlan, connections, onSave, currentUser }: RatePlanDialogProps) {
  const [formData, setFormData] = useState<Partial<RatePlan>>({})

  useEffect(() => {
    if (ratePlan) {
      setFormData(ratePlan)
    } else {
      setFormData({
        isActive: true,
        baseRate: 0,
        currency: 'USD',
        roomTypes: [],
        channels: [],
        cancellationPolicy: {
          freeCancellationDays: 1,
          penaltyPercentage: 100,
          noShowCharge: 100
        },
        priority: 1
      })
    }
  }, [ratePlan, open])

  const handleSave = () => {
    const plan: RatePlan = {
      id: ratePlan?.id || `plan-${Date.now()}`,
      planId: ratePlan?.planId || `RP-${Date.now()}`,
      name: formData.name!,
      description: formData.description,
      type: formData.type!,
      roomTypes: formData.roomTypes!,
      baseRate: formData.baseRate!,
      currency: formData.currency!,
      isActive: formData.isActive!,
      channels: formData.channels!,
      includedInPackage: formData.includedInPackage,
      mealPlan: formData.mealPlan,
      cancellationPolicy: formData.cancellationPolicy!,
      advancePurchaseDays: formData.advancePurchaseDays,
      minimumStay: formData.minimumStay,
      maximumStay: formData.maximumStay,
      priority: formData.priority!,
      createdBy: ratePlan?.createdBy || `${currentUser.firstName} ${currentUser.lastName}`,
      createdAt: ratePlan?.createdAt || Date.now(),
      updatedAt: Date.now()
    }
    onSave(plan)
    onOpenChange(false)
  }

  const roomTypes: RoomType[] = ['standard', 'deluxe', 'suite', 'executive', 'presidential']

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ratePlan ? 'Edit' : 'Create'} Rate Plan</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Best Available Rate"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Plan Type *</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as RatePlanType })}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="non-refundable">Non-Refundable</SelectItem>
                  <SelectItem value="advance-purchase">Advance Purchase</SelectItem>
                  <SelectItem value="package">Package</SelectItem>
                  <SelectItem value="promotional">Promotional</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseRate">Base Rate *</Label>
              <Input
                id="baseRate"
                type="number"
                value={formData.baseRate || 0}
                onChange={(e) => setFormData({ ...formData, baseRate: parseFloat(e.target.value) })}
                placeholder="100.00"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mealPlan">Meal Plan</Label>
              <Select value={formData.mealPlan} onValueChange={(v) => setFormData({ ...formData, mealPlan: v as any })}>
                <SelectTrigger id="mealPlan">
                  <SelectValue placeholder="Select meal plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="room-only">Room Only</SelectItem>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="half-board">Half Board</SelectItem>
                  <SelectItem value="full-board">Full Board</SelectItem>
                  <SelectItem value="all-inclusive">All Inclusive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Room Types *</Label>
            <div className="grid grid-cols-2 gap-2">
              {roomTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`room-${type}`}
                    checked={formData.roomTypes?.includes(type)}
                    onCheckedChange={(checked) => {
                      const current = formData.roomTypes || []
                      setFormData({
                        ...formData,
                        roomTypes: checked
                          ? [...current, type]
                          : current.filter((t) => t !== type)
                      })
                    }}
                  />
                  <label htmlFor={`room-${type}`} className="text-sm capitalize">
                    {type.replace('-', ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Channels *</Label>
            <div className="grid grid-cols-2 gap-2">
              {connections.map((conn) => (
                <div key={conn.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`channel-${conn.id}`}
                    checked={formData.channels?.includes(conn.channel)}
                    onCheckedChange={(checked) => {
                      const current = formData.channels || []
                      setFormData({
                        ...formData,
                        channels: checked
                          ? [...current, conn.channel]
                          : current.filter((c) => c !== conn.channel)
                      })
                    }}
                  />
                  <label htmlFor={`channel-${conn.id}`} className="text-sm">
                    {conn.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="freeDays">Free Cancellation (days)</Label>
              <Input
                id="freeDays"
                type="number"
                value={formData.cancellationPolicy?.freeCancellationDays || 1}
                onChange={(e) => setFormData({
                  ...formData,
                  cancellationPolicy: {
                    ...formData.cancellationPolicy!,
                    freeCancellationDays: parseInt(e.target.value)
                  }
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="penalty">Penalty (%)</Label>
              <Input
                id="penalty"
                type="number"
                value={formData.cancellationPolicy?.penaltyPercentage || 100}
                onChange={(e) => setFormData({
                  ...formData,
                  cancellationPolicy: {
                    ...formData.cancellationPolicy!,
                    penaltyPercentage: parseInt(e.target.value)
                  }
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="noShow">No-Show Charge (%)</Label>
              <Input
                id="noShow"
                type="number"
                value={formData.cancellationPolicy?.noShowCharge || 100}
                onChange={(e) => setFormData({
                  ...formData,
                  cancellationPolicy: {
                    ...formData.cancellationPolicy!,
                    noShowCharge: parseInt(e.target.value)
                  }
                })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.name || !formData.type || !formData.roomTypes?.length || !formData.channels?.length}
          >
            {ratePlan ? 'Update' : 'Create'} Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
