import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ulid } from 'ulid'
import { type LostFoundItem, type Room, type Employee, type LostFoundCategory, type LostFoundStatus } from '@/lib/types'

interface LostFoundDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: LostFoundItem
  items: LostFoundItem[]
  setItems: (items: LostFoundItem[] | ((prev: LostFoundItem[]) => LostFoundItem[])) => void
  rooms: Room[]
  employees: Employee[]
}

export function LostFoundDialog({
  open,
  onOpenChange,
  item,
  items,
  setItems,
  rooms,
  employees
}: LostFoundDialogProps) {
  const isEditing = !!item

  const [formData, setFormData] = useState<Partial<LostFoundItem>>(() => ({
    category: item?.category || 'personal-items',
    description: item?.description || '',
    foundLocation: item?.foundLocation || '',
    roomId: item?.roomId || '',
    guestName: item?.guestName || '',
    status: item?.status || 'reported',
    storageLocation: item?.storageLocation || '',
    estimatedValue: item?.estimatedValue || 0,
    notes: item?.notes || ''
  }))

  const handleSubmit = () => {
    if (!formData.description || !formData.foundLocation) {
      toast.error('Please fill in required fields')
      return
    }

    const currentUser = employees.find(e => e.department === 'housekeeping') || employees[0]

    if (isEditing && item) {
      setItems((current) =>
        (current || []).map(i =>
          i.id === item.id
            ? { ...i, ...formData, updatedAt: Date.now() }
            : i
        )
      )
      toast.success('Lost & found item updated')
    } else {
      const newItem: LostFoundItem = {
        id: ulid(),
        itemNumber: `LF-${Date.now().toString().slice(-6)}`,
        category: formData.category as LostFoundCategory,
        description: formData.description!,
        foundLocation: formData.foundLocation!,
        foundBy: currentUser?.id || 'system',
        foundDate: Date.now(),
        roomId: formData.roomId || undefined,
        guestName: formData.guestName || undefined,
        status: formData.status as LostFoundStatus,
        storageLocation: formData.storageLocation || undefined,
        estimatedValue: formData.estimatedValue || 0,
        notes: formData.notes || undefined,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      setItems((current) => [...(current || []), newItem])
      toast.success('Lost & found item recorded')
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dialog-content-wrapper max-w-3xl">
        <DialogHeader className="dialog-header-fixed">
          <DialogTitle className="mobile-heading-responsive">
            {isEditing ? 'Update' : 'New'} Lost & Found Item
          </DialogTitle>
        </DialogHeader>

        <div className="dialog-body-scrollable">
          <div className="dialog-section">
            <div className="dialog-grid-2">
              <div className="dialog-form-field">
                <Label className="dialog-form-label">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as LostFoundCategory })}
                >
                  <SelectTrigger className="dialog-form-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="jewelry">Jewelry</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="documents">Documents</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="luggage">Luggage</SelectItem>
                    <SelectItem value="personal-items">Personal Items</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="dialog-form-field">
                <Label className="dialog-form-label">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as LostFoundStatus })}
                >
                  <SelectTrigger className="dialog-form-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reported">Reported</SelectItem>
                    <SelectItem value="in-storage">In Storage</SelectItem>
                    <SelectItem value="claimed">Claimed</SelectItem>
                    <SelectItem value="disposed">Disposed</SelectItem>
                    <SelectItem value="donated">Donated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="dialog-form-field">
              <Label className="dialog-form-label">Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the item in detail..."
                className="dialog-form-textarea"
              />
            </div>

            <div className="dialog-grid-2">
              <div className="dialog-form-field">
                <Label className="dialog-form-label">Found Location *</Label>
                <Input
                  value={formData.foundLocation}
                  onChange={(e) => setFormData({ ...formData, foundLocation: e.target.value })}
                  placeholder="e.g., Lobby, Restaurant..."
                  className="dialog-form-input"
                />
              </div>

              <div className="dialog-form-field">
                <Label className="dialog-form-label">Room (if applicable)</Label>
                <Select
                  value={formData.roomId}
                  onValueChange={(value) => setFormData({ ...formData, roomId: value })}
                >
                  <SelectTrigger className="dialog-form-input">
                    <SelectValue placeholder="Select room..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {rooms.map(room => (
                      <SelectItem key={room.id} value={room.id}>
                        Room {room.roomNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="dialog-grid-2">
              <div className="dialog-form-field">
                <Label className="dialog-form-label">Guest Name (if known)</Label>
                <Input
                  value={formData.guestName}
                  onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                  placeholder="Guest name..."
                  className="dialog-form-input"
                />
              </div>

              <div className="dialog-form-field">
                <Label className="dialog-form-label">Estimated Value ($)</Label>
                <Input
                  type="number"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  className="dialog-form-input"
                />
              </div>
            </div>

            <div className="dialog-form-field">
              <Label className="dialog-form-label">Storage Location</Label>
              <Input
                value={formData.storageLocation}
                onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                placeholder="e.g., Lost & Found Locker A3..."
                className="dialog-form-input"
              />
            </div>

            <div className="dialog-form-field">
              <Label className="dialog-form-label">Additional Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional information..."
                className="dialog-form-textarea"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="dialog-footer-fixed">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="dialog-button">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="dialog-button">
            {isEditing ? 'Update' : 'Create'} Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
