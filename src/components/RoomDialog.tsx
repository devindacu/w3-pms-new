import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Badge } from '@/components/ui/badge'
import { X } from '@phosphor-icons/react'
import type { Room, RoomStatus, RoomType, RoomTypeConfig } from '@/lib/types'
import { formatCurrency } from '@/lib/helpers'

interface RoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: Room | null
  onSave: (room: Room) => void
}

const COMMON_AMENITIES = [
  'WiFi',
  'TV',
  'Air Conditioning',
  'Mini Bar',
  'Safe',
  'Coffee Maker',
  'Balcony',
  'Sea View',
  'City View',
  'Bathtub',
  'Shower',
  'Hairdryer',
  'Iron',
  'Telephone',
  'Work Desk',
  'Sofa',
  'Kitchenette',
  'Microwave',
  'Refrigerator',
]

export function RoomDialog({ open, onOpenChange, room, onSave }: RoomDialogProps) {
  const [roomTypes] = useKV<RoomTypeConfig[]>('w3-hotel-room-types', [])
  const [formData, setFormData] = useState<Partial<Room>>({
    roomNumber: '',
    floor: 1,
    roomType: 'standard',
    status: 'vacant-clean',
    baseRate: 0,
    maxOccupancy: 2,
    amenities: [],
    notes: '',
  })
  const [selectedAmenity, setSelectedAmenity] = useState('')

  useEffect(() => {
    if (room) {
      setFormData(room)
    } else {
      setFormData({
        roomNumber: '',
        floor: 1,
        roomType: 'standard',
        status: 'vacant-clean',
        baseRate: 0,
        maxOccupancy: 2,
        amenities: [],
        notes: '',
      })
    }
  }, [room, open])

  const handleRoomTypeChange = (typeCode: string) => {
    const selectedType = (roomTypes || []).find(rt => rt.code === typeCode)
    if (selectedType) {
      setFormData(prev => ({
        ...prev,
        roomType: selectedType.code as RoomType,
        baseRate: selectedType.baseRate,
        maxOccupancy: selectedType.maxOccupancy,
        amenities: [...selectedType.amenities]
      }))
    } else {
      setFormData(prev => ({ ...prev, roomType: typeCode as RoomType }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const roomData: Room = {
      id: room?.id || `room-${Date.now()}`,
      roomNumber: formData.roomNumber || '',
      floor: formData.floor || 1,
      roomType: formData.roomType as RoomType || 'standard',
      status: formData.status as RoomStatus || 'vacant-clean',
      baseRate: formData.baseRate || 0,
      maxOccupancy: formData.maxOccupancy || 2,
      amenities: formData.amenities || [],
      notes: formData.notes,
      lastCleaned: room?.lastCleaned,
      assignedHousekeeper: room?.assignedHousekeeper,
    }

    onSave(roomData)
  }

  const addAmenity = () => {
    if (selectedAmenity && !formData.amenities?.includes(selectedAmenity)) {
      setFormData(prev => ({
        ...prev,
        amenities: [...(prev.amenities || []), selectedAmenity]
      }))
      setSelectedAmenity('')
    }
  }

  const removeAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: (prev.amenities || []).filter(a => a !== amenity)
    }))
  }

  const addCustomAmenity = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const customAmenity = e.currentTarget.value.trim()
      if (customAmenity && !formData.amenities?.includes(customAmenity)) {
        setFormData(prev => ({
          ...prev,
          amenities: [...(prev.amenities || []), customAmenity]
        }))
        e.currentTarget.value = ''
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{room ? 'Edit Room' : 'Add New Room'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-12 gap-4">
            <div className="space-y-2 col-span-3">
              <Label htmlFor="roomNumber">Room Number *</Label>
              <Input
                id="roomNumber"
                value={formData.roomNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                placeholder="101"
                required
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="floor">Floor *</Label>
              <Input
                id="floor"
                type="number"
                min="0"
                value={formData.floor}
                onChange={(e) => setFormData(prev => ({ ...prev, floor: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>

            <div className="space-y-2 col-span-7">
              <Label htmlFor="roomType">Room Type *</Label>
              <Select
                value={formData.roomType}
                onValueChange={handleRoomTypeChange}
              >
                <SelectTrigger id="roomType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(roomTypes || []).filter(rt => rt.isActive && rt.code && rt.code.trim() !== '').length > 0 ? (
                    (roomTypes || []).filter(rt => rt.isActive && rt.code && rt.code.trim() !== '').map(rt => (
                      <SelectItem key={rt.id} value={rt.code}>
                        {rt.name}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="deluxe">Deluxe</SelectItem>
                      <SelectItem value="suite">Suite</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                      <SelectItem value="presidential">Presidential</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-6">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as RoomStatus }))}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacant-clean">Vacant Clean</SelectItem>
                  <SelectItem value="vacant-dirty">Vacant Dirty</SelectItem>
                  <SelectItem value="occupied-clean">Occupied Clean</SelectItem>
                  <SelectItem value="occupied-dirty">Occupied Dirty</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="out-of-order">Out of Order</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-3">
              <Label htmlFor="baseRate">Base Rate (LKR) *</Label>
              <Input
                id="baseRate"
                type="number"
                min="0"
                step="0.01"
                value={formData.baseRate}
                onChange={(e) => setFormData(prev => ({ ...prev, baseRate: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>

            <div className="space-y-2 col-span-3">
              <Label htmlFor="maxOccupancy">Max Occupancy *</Label>
              <Input
                id="maxOccupancy"
                type="number"
                min="1"
                value={formData.maxOccupancy}
                onChange={(e) => setFormData(prev => ({ ...prev, maxOccupancy: parseInt(e.target.value) || 1 }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Amenities</Label>
            <div className="flex gap-2">
              <Select value={selectedAmenity} onValueChange={setSelectedAmenity}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select amenity..." />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_AMENITIES.filter(a => !formData.amenities?.includes(a)).map(amenity => (
                    <SelectItem key={amenity} value={amenity}>
                      {amenity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={addAmenity} disabled={!selectedAmenity}>
                Add
              </Button>
            </div>
            <Input
              placeholder="Or type custom amenity and press Enter..."
              onKeyDown={addCustomAmenity}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.amenities?.map(amenity => (
                <Badge key={amenity} variant="secondary" className="gap-1">
                  {amenity}
                  <button
                    type="button"
                    onClick={() => removeAmenity(amenity)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes about this room..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {room ? 'Update Room' : 'Add Room'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
