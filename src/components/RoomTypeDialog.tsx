import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { X } from '@phosphor-icons/react'
import type { RoomTypeConfig } from '@/lib/types'

interface RoomTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomType: RoomTypeConfig | null
  onSave: (roomType: RoomTypeConfig) => void
}

export function RoomTypeDialog({
  open,
  onOpenChange,
  roomType,
  onSave
}: RoomTypeDialogProps) {
  const [formData, setFormData] = useState<Partial<RoomTypeConfig>>({})
  const [amenityInput, setAmenityInput] = useState('')

  useEffect(() => {
    if (roomType) {
      setFormData(roomType)
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        baseRate: 0,
        maxOccupancy: 2,
        size: 0,
        amenities: [],
        isActive: true
      })
    }
    setAmenityInput('')
  }, [roomType, open])

  const handleAddAmenity = () => {
    if (amenityInput.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...(prev.amenities || []), amenityInput.trim()]
      }))
      setAmenityInput('')
    }
  }

  const handleRemoveAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: (prev.amenities || []).filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.code) {
      return
    }

    const roomTypeData: RoomTypeConfig = {
      id: roomType?.id || `rt-${Date.now()}`,
      name: formData.name,
      code: formData.code,
      description: formData.description,
      baseRate: Number(formData.baseRate) || 0,
      maxOccupancy: Number(formData.maxOccupancy) || 2,
      size: formData.size ? Number(formData.size) : undefined,
      amenities: formData.amenities || [],
      isActive: formData.isActive ?? true,
      createdAt: roomType?.createdAt || Date.now(),
      updatedAt: Date.now()
    }

    onSave(roomTypeData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {roomType ? 'Edit Room Type' : 'Add Room Type'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Deluxe Ocean View"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={formData.code || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="e.g., DLX"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe this room type..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseRate">Base Rate (LKR)</Label>
              <Input
                id="baseRate"
                type="number"
                min="0"
                step="0.01"
                value={formData.baseRate || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, baseRate: parseFloat(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxOccupancy">Max Occupancy</Label>
              <Input
                id="maxOccupancy"
                type="number"
                min="1"
                value={formData.maxOccupancy || 2}
                onChange={(e) => setFormData(prev => ({ ...prev, maxOccupancy: parseInt(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size (sq ft)</Label>
              <Input
                id="size"
                type="number"
                min="0"
                value={formData.size || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value ? parseInt(e.target.value) : undefined }))}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amenities">Amenities</Label>
            <div className="flex gap-2">
              <Input
                id="amenities"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddAmenity()
                  }
                }}
                placeholder="Add amenity and press Enter"
              />
              <Button type="button" onClick={handleAddAmenity} variant="secondary">
                Add
              </Button>
            </div>
            {formData.amenities && formData.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.amenities.map((amenity, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {amenity}
                    <X
                      size={14}
                      className="cursor-pointer"
                      onClick={() => handleRemoveAmenity(index)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive ?? true}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {roomType ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
