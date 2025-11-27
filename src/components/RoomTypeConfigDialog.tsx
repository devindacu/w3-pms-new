import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { X, Plus } from '@phosphor-icons/react'
import type { RoomTypeConfig, BeddingType, ViewType } from '@/lib/types'


interface RoomTypeConfigDialogProps {
  open: boolean
  onClose: () => void
  roomType: RoomTypeConfig | null
  onSave: (roomType: RoomTypeConfig) => void
  currentUser: { id: string }
}

const beddingOptions: BeddingType[] = ['king', 'queen', 'twin', 'single', 'double', 'sofa-bed', 'bunk-bed']
const viewOptions: ViewType[] = ['city', 'ocean', 'garden', 'pool', 'mountain', 'courtyard', 'interior']

export function RoomTypeConfigDialog({ open, onClose, roomType, onSave, currentUser }: RoomTypeConfigDialogProps) {
  const [formData, setFormData] = useState<Partial<RoomTypeConfig>>({
    name: '',
    code: '',
    description: '',
    baseRate: 0,
    rackRate: 0,
    maxOccupancy: 2,
    baseOccupancy: 2,
    size: 0,
    amenities: [],
    bedding: [],
    viewTypes: [],
    inventoryItems: [],
    sortOrder: 0,
    isActive: true
  })

  const [newAmenity, setNewAmenity] = useState('')
  const [newInventoryItem, setNewInventoryItem] = useState('')

  useEffect(() => {
    if (roomType) {
      setFormData(roomType)
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        baseRate: 0,
        rackRate: 0,
        maxOccupancy: 2,
        baseOccupancy: 2,
        size: 0,
        amenities: [],
        bedding: [],
        viewTypes: [],
        inventoryItems: [],
        sortOrder: 0,
        isActive: true
      })
    }
  }, [roomType, open])

  const handleSubmit = () => {
    if (!formData.name || !formData.code) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.baseRate! <= 0 || formData.rackRate! <= 0) {
      toast.error('Rates must be greater than 0')
      return
    }

    if (formData.baseOccupancy! > formData.maxOccupancy!) {
      toast.error('Base occupancy cannot exceed max occupancy')
      return
    }

    const now = Date.now()
    const savedRoomType: RoomTypeConfig = {
      id: roomType?.id || `rt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name!,
      code: formData.code!,
      description: formData.description || '',
      baseRate: formData.baseRate!,
      rackRate: formData.rackRate!,
      maxOccupancy: formData.maxOccupancy!,
      baseOccupancy: formData.baseOccupancy!,
      size: formData.size,
      amenities: formData.amenities || [],
      bedding: formData.bedding || [],
      viewTypes: formData.viewTypes || [],
      inventoryItems: formData.inventoryItems || [],
      sortOrder: formData.sortOrder || 0,
      isActive: formData.isActive ?? true,
      createdAt: roomType?.createdAt || now,
      updatedAt: now,
      createdBy: roomType?.createdBy || currentUser.id
    }

    onSave(savedRoomType)
    toast.success(`Room type ${roomType ? 'updated' : 'created'} successfully`)
    onClose()
  }

  const toggleBedding = (bedding: BeddingType) => {
    const current = formData.bedding || []
    if (current.includes(bedding)) {
      setFormData({ ...formData, bedding: current.filter(b => b !== bedding) })
    } else {
      setFormData({ ...formData, bedding: [...current, bedding] })
    }
  }

  const toggleView = (view: ViewType) => {
    const current = formData.viewTypes || []
    if (current.includes(view)) {
      setFormData({ ...formData, viewTypes: current.filter(v => v !== view) })
    } else {
      setFormData({ ...formData, viewTypes: [...current, view] })
    }
  }

  const addAmenity = () => {
    if (newAmenity.trim()) {
      const current = formData.amenities || []
      if (!current.includes(newAmenity.trim())) {
        setFormData({ ...formData, amenities: [...current, newAmenity.trim()] })
        setNewAmenity('')
      }
    }
  }

  const removeAmenity = (amenity: string) => {
    setFormData({ 
      ...formData, 
      amenities: (formData.amenities || []).filter(a => a !== amenity) 
    })
  }

  const addInventoryItem = () => {
    if (newInventoryItem.trim()) {
      const current = formData.inventoryItems || []
      if (!current.includes(newInventoryItem.trim())) {
        setFormData({ ...formData, inventoryItems: [...current, newInventoryItem.trim()] })
        setNewInventoryItem('')
      }
    }
  }

  const removeInventoryItem = (item: string) => {
    setFormData({ 
      ...formData, 
      inventoryItems: (formData.inventoryItems || []).filter(i => i !== item) 
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{roomType ? 'Edit' : 'Create'} Room Type Configuration</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Room Type Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Deluxe Ocean View"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., DOV"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the room type..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseRate">Base Rate (LKR) *</Label>
              <Input
                id="baseRate"
                type="number"
                min="0"
                step="0.01"
                value={formData.baseRate}
                onChange={(e) => setFormData({ ...formData, baseRate: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rackRate">Rack Rate (LKR) *</Label>
              <Input
                id="rackRate"
                type="number"
                min="0"
                step="0.01"
                value={formData.rackRate}
                onChange={(e) => setFormData({ ...formData, rackRate: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="baseOccupancy">Base Occupancy *</Label>
              <Input
                id="baseOccupancy"
                type="number"
                min="1"
                value={formData.baseOccupancy}
                onChange={(e) => setFormData({ ...formData, baseOccupancy: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxOccupancy">Max Occupancy *</Label>
              <Input
                id="maxOccupancy"
                type="number"
                min="1"
                value={formData.maxOccupancy}
                onChange={(e) => setFormData({ ...formData, maxOccupancy: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size (sqm)</Label>
              <Input
                id="size"
                type="number"
                min="0"
                value={formData.size || ''}
                onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) || undefined })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bedding Types</Label>
            <div className="flex flex-wrap gap-2">
              {beddingOptions.map(bedding => (
                <Badge
                  key={bedding}
                  variant={(formData.bedding || []).includes(bedding) ? 'default' : 'outline'}
                  className="cursor-pointer capitalize"
                  onClick={() => toggleBedding(bedding)}
                >
                  {bedding.replace('-', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>View Types</Label>
            <div className="flex flex-wrap gap-2">
              {viewOptions.map(view => (
                <Badge
                  key={view}
                  variant={(formData.viewTypes || []).includes(view) ? 'default' : 'outline'}
                  className="cursor-pointer capitalize"
                  onClick={() => toggleView(view)}
                >
                  {view.replace('-', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Amenities</Label>
            <div className="flex gap-2">
              <Input
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                placeholder="Add amenity..."
              />
              <Button type="button" onClick={addAmenity}>
                <Plus size={18} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(formData.amenities || []).map(amenity => (
                <Badge key={amenity} variant="secondary">
                  {amenity}
                  <X
                    size={14}
                    className="ml-1 cursor-pointer"
                    onClick={() => removeAmenity(amenity)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Inventory Items Associated</Label>
            <div className="flex gap-2">
              <Input
                value={newInventoryItem}
                onChange={(e) => setNewInventoryItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInventoryItem())}
                placeholder="Add inventory item..."
              />
              <Button type="button" onClick={addInventoryItem}>
                <Plus size={18} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(formData.inventoryItems || []).map(item => (
                <Badge key={item} variant="outline">
                  {item}
                  <X
                    size={14}
                    className="ml-1 cursor-pointer"
                    onClick={() => removeInventoryItem(item)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            {roomType ? 'Update' : 'Create'} Room Type
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
