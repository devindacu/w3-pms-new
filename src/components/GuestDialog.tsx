import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { type Guest } from '@/lib/types'
import { generateId } from '@/lib/helpers'

interface GuestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guest?: Guest
  guests: Guest[]
  setGuests: (guests: Guest[] | ((prev: Guest[]) => Guest[])) => void
}

export function GuestDialog({ open, onOpenChange, guest, guests, setGuests }: GuestDialogProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    idType: '',
    idNumber: '',
    address: '',
    preferences: ''
  })

  useEffect(() => {
    if (guest) {
      setFormData({
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email || '',
        phone: guest.phone,
        nationality: guest.nationality || '',
        idType: guest.idType || '',
        idNumber: guest.idNumber || '',
        address: guest.address || '',
        preferences: guest.preferences?.join(', ') || ''
      })
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        nationality: '',
        idType: '',
        idNumber: '',
        address: '',
        preferences: ''
      })
    }
  }, [guest, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phone.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    const preferencesArray = formData.preferences
      ? formData.preferences.split(',').map(p => p.trim()).filter(p => p)
      : []

    if (guest) {
      setGuests((prev) => prev.map(g => 
        g.id === guest.id 
          ? { 
              ...g, 
              ...formData,
              preferences: preferencesArray,
              updatedAt: Date.now()
            }
          : g
      ))
      toast.success('Guest updated successfully')
    } else {
      const newGuest: Guest = {
        id: generateId(),
        ...formData,
        preferences: preferencesArray,
        loyaltyPoints: 0,
        totalStays: 0,
        totalSpent: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      setGuests((prev) => [...prev, newGuest])
      toast.success('Guest added successfully')
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{guest ? 'Edit Guest' : 'Add New Guest'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="idType">ID Type</Label>
                <Input
                  id="idType"
                  value={formData.idType}
                  onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                  placeholder="Passport, etc."
                />
              </div>
              <div>
                <Label htmlFor="idNumber">ID Number</Label>
                <Input
                  id="idNumber"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="preferences">Preferences (comma-separated)</Label>
              <Input
                id="preferences"
                value={formData.preferences}
                onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                placeholder="Non-smoking, High floor, King bed"
              />
            </div>

            {guest && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Total Stays</p>
                  <p className="text-lg font-semibold">{guest.totalStays}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-lg font-semibold">${guest.totalSpent.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loyalty Points</p>
                  <p className="text-lg font-semibold">{guest.loyaltyPoints}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {guest ? 'Update Guest' : 'Add Guest'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
