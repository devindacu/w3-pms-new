import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { ulid } from 'ulid'
import { Image, Trash, Upload, X } from '@phosphor-icons/react'
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
    notes: item?.notes || '',
    images: item?.images || []
  }))

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrls, setPreviewUrls] = useState<string[]>(item?.images || [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const maxFiles = 5
    const currentImagesCount = previewUrls.length
    
    if (currentImagesCount >= maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`)
      return
    }

    const remainingSlots = maxFiles - currentImagesCount
    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    filesToProcess.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const imageUrl = reader.result as string
        setPreviewUrls(prev => [...prev, imageUrl])
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), imageUrl]
        }))
      }
      reader.readAsDataURL(file)
    })

    if (filesToProcess.length < files.length) {
      toast.info(`Only ${filesToProcess.length} images added (max ${maxFiles} total)`)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = (index: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }))
    toast.success('Image removed')
  }

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
        images: formData.images || [],
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

            <div className="dialog-form-field">
              <Label className="dialog-form-label">Item Photos (Max 5)</Label>
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={previewUrls.length >= 5}
                  className="w-full h-24 border-2 border-dashed hover:border-primary transition-colors"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={24} />
                    <span className="text-sm">
                      {previewUrls.length >= 5 
                        ? 'Maximum images reached' 
                        : 'Click to upload photos'
                      }
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {previewUrls.length}/5 images
                    </span>
                  </div>
                </Button>

                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {previewUrls.map((url, index) => (
                      <Card key={index} className="relative group overflow-hidden aspect-square">
                        <img
                          src={url}
                          alt={`Item photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            onClick={() => handleRemoveImage(index)}
                            className="h-8 w-8"
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {index + 1}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Upload clear photos of the item. Supported formats: JPG, PNG, GIF. Max size: 5MB per image.
                </p>
              </div>
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
