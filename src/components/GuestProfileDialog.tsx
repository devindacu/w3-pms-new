import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { User, Heart, Star, Phone, MapPin, Building, Gift, ShieldCheck } from '@phosphor-icons/react'
import type { GuestProfile, LoyaltyTier, GuestSegment, CommunicationPreference, RoomType } from '@/lib/types'

interface GuestProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guest?: GuestProfile
  onSave: (guest: GuestProfile) => void
}

export function GuestProfileDialog({ open, onOpenChange, guest, onSave }: GuestProfileDialogProps) {
  const [formData, setFormData] = useState<Partial<GuestProfile>>({
    salutation: 'Mr',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    nationality: '',
    idType: 'Passport',
    idNumber: '',
    passportNumber: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    companyName: '',
    gstNumber: '',
    preferences: {
      roomType: undefined,
      floor: '',
      bedType: 'king',
      smoking: false,
      view: 'no-preference',
      pillow: 'firm',
      temperature: 22,
      newspaper: '',
      wakeUpCall: false,
      wakeUpTime: '',
      minibarPreferences: [],
      roomAmenities: [],
      foodPreferences: [],
      beveragePreferences: [],
      transportPreferences: [],
      activityInterests: [],
      specialOccasions: []
    },
    loyaltyInfo: {
      tier: 'bronze',
      points: 0,
      lifetimePoints: 0,
      pointsToNextTier: 500,
      tierSince: Date.now(),
      tierBenefits: [],
      pointsExpiring: [],
      enrolledDate: Date.now()
    },
    segments: [],
    communicationPreference: ['email'],
    doNotDisturb: false,
    blacklisted: false,
    dietaryRestrictions: [],
    allergies: [],
    specialRequests: [],
    totalStays: 0,
    totalNights: 0,
    totalSpent: 0,
    averageSpendPerStay: 0,
    tags: [],
    notes: ''
  })

  useEffect(() => {
    if (guest) {
      setFormData(guest)
    } else {
      setFormData({
        salutation: 'Mr',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        alternatePhone: '',
        nationality: '',
        idType: 'Passport',
        idNumber: '',
        passportNumber: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        companyName: '',
        gstNumber: '',
        preferences: {
          roomType: undefined,
          floor: '',
          bedType: 'king',
          smoking: false,
          view: 'no-preference',
          pillow: 'firm',
          temperature: 22,
          newspaper: '',
          wakeUpCall: false,
          wakeUpTime: '',
          minibarPreferences: [],
          roomAmenities: [],
          foodPreferences: [],
          beveragePreferences: [],
          transportPreferences: [],
          activityInterests: [],
          specialOccasions: []
        },
        loyaltyInfo: {
          tier: 'bronze',
          points: 0,
          lifetimePoints: 0,
          pointsToNextTier: 500,
          tierSince: Date.now(),
          tierBenefits: ['5% Discount on F&B'],
          pointsExpiring: [],
          enrolledDate: Date.now()
        },
        segments: [],
        communicationPreference: ['email'],
        doNotDisturb: false,
        blacklisted: false,
        dietaryRestrictions: [],
        allergies: [],
        specialRequests: [],
        totalStays: 0,
        totalNights: 0,
        totalSpent: 0,
        averageSpendPerStay: 0,
        tags: [],
        notes: ''
      })
    }
  }, [guest, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const guestProfile: GuestProfile = {
      id: guest?.id || `GP-${Date.now()}`,
      guestId: guest?.guestId || `G${String(Date.now()).slice(-6)}`,
      ...formData,
      createdAt: guest?.createdAt || Date.now(),
      updatedAt: Date.now(),
      createdBy: guest?.createdBy || 'current-user'
    } as GuestProfile

    onSave(guestProfile)
  }

  const toggleSegment = (segment: GuestSegment) => {
    const current = formData.segments || []
    if (current.includes(segment)) {
      setFormData({ ...formData, segments: current.filter(s => s !== segment) })
    } else {
      setFormData({ ...formData, segments: [...current, segment] })
    }
  }

  const toggleCommunicationPref = (pref: CommunicationPreference) => {
    const current = formData.communicationPreference || []
    if (current.includes(pref)) {
      setFormData({ ...formData, communicationPreference: current.filter(p => p !== pref) })
    } else {
      setFormData({ ...formData, communicationPreference: [...current, pref] })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User size={24} />
            {guest ? 'Edit Guest Profile' : 'Add Guest Profile'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="personal" className="mt-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal">
                <User size={16} className="mr-2" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="contact">
                <Phone size={16} className="mr-2" />
                Contact
              </TabsTrigger>
              <TabsTrigger value="preferences">
                <Heart size={16} className="mr-2" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="loyalty">
                <Star size={16} className="mr-2" />
                Loyalty
              </TabsTrigger>
              <TabsTrigger value="additional">
                <Gift size={16} className="mr-2" />
                Additional
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 mt-6">
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="salutation">Salutation</Label>
                  <Select 
                    value={formData.salutation} 
                    onValueChange={(value) => setFormData({ ...formData, salutation: value as any })}
                  >
                    <SelectTrigger id="salutation">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mr">Mr</SelectItem>
                      <SelectItem value="Ms">Ms</SelectItem>
                      <SelectItem value="Mrs">Mrs</SelectItem>
                      <SelectItem value="Dr">Dr</SelectItem>
                      <SelectItem value="Prof">Prof</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
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
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ''}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value ? new Date(e.target.value).getTime() : undefined })}
                  />
                </div>
                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    placeholder="e.g., Indian, American"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="idType">ID Type</Label>
                  <Select 
                    value={formData.idType} 
                    onValueChange={(value) => setFormData({ ...formData, idType: value })}
                  >
                    <SelectTrigger id="idType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Passport">Passport</SelectItem>
                      <SelectItem value="National ID">National ID</SelectItem>
                      <SelectItem value="Driving License">Driving License</SelectItem>
                      <SelectItem value="Aadhaar">Aadhaar</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="idNumber">ID Number</Label>
                  <Input
                    id="idNumber"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="passportNumber">Passport Number</Label>
                  <Input
                    id="passportNumber"
                    value={formData.passportNumber}
                    onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Guest Segments</Label>
                <div className="flex flex-wrap gap-2">
                  {(['vip', 'corporate', 'leisure', 'group', 'wedding', 'repeat', 'new'] as GuestSegment[]).map((segment) => (
                    <Badge
                      key={segment}
                      variant={(formData.segments || []).includes(segment) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleSegment(segment)}
                    >
                      {segment}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="doNotDisturb">Do Not Disturb</Label>
                    <p className="text-xs text-muted-foreground">Guest prefers minimal contact</p>
                  </div>
                  <Switch
                    id="doNotDisturb"
                    checked={formData.doNotDisturb}
                    onCheckedChange={(checked) => setFormData({ ...formData, doNotDisturb: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="blacklisted">Blacklisted</Label>
                    <p className="text-xs text-muted-foreground">Prevent future bookings</p>
                  </div>
                  <Switch
                    id="blacklisted"
                    checked={formData.blacklisted}
                    onCheckedChange={(checked) => setFormData({ ...formData, blacklisted: checked })}
                  />
                </div>
              </div>

              {formData.blacklisted && (
                <div>
                  <Label htmlFor="blacklistReason">Blacklist Reason</Label>
                  <Textarea
                    id="blacklistReason"
                    value={formData.blacklistReason}
                    onChange={(e) => setFormData({ ...formData, blacklistReason: e.target.value })}
                    rows={2}
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="guest@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="alternatePhone">Alternate Phone</Label>
                <Input
                  id="alternatePhone"
                  type="tel"
                  value={formData.alternatePhone}
                  onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                />
              </div>

              <Separator />

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label>Communication Preferences</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(['email', 'sms', 'phone', 'whatsapp', 'none'] as CommunicationPreference[]).map((pref) => (
                    <Badge
                      key={pref}
                      variant={(formData.communicationPreference || []).includes(pref) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleCommunicationPref(pref)}
                    >
                      {pref}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input
                    id="gstNumber"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4 mt-6">
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Room Preferences</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="roomType">Preferred Room Type</Label>
                    <Select 
                      value={formData.preferences?.roomType} 
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        preferences: { ...formData.preferences!, roomType: value as RoomType }
                      })}
                    >
                      <SelectTrigger id="roomType">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="deluxe">Deluxe</SelectItem>
                        <SelectItem value="suite">Suite</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                        <SelectItem value="presidential">Presidential</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bedType">Bed Type</Label>
                    <Select 
                      value={formData.preferences?.bedType} 
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        preferences: { ...formData.preferences!, bedType: value as any }
                      })}
                    >
                      <SelectTrigger id="bedType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="king">King</SelectItem>
                        <SelectItem value="queen">Queen</SelectItem>
                        <SelectItem value="twin">Twin</SelectItem>
                        <SelectItem value="single">Single</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label htmlFor="floor">Floor Preference</Label>
                    <Input
                      id="floor"
                      value={formData.preferences?.floor}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        preferences: { ...formData.preferences!, floor: e.target.value }
                      })}
                      placeholder="e.g., High floor"
                    />
                  </div>
                  <div>
                    <Label htmlFor="view">View Preference</Label>
                    <Select 
                      value={formData.preferences?.view} 
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        preferences: { ...formData.preferences!, view: value as any }
                      })}
                    >
                      <SelectTrigger id="view">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sea">Sea View</SelectItem>
                        <SelectItem value="city">City View</SelectItem>
                        <SelectItem value="garden">Garden View</SelectItem>
                        <SelectItem value="pool">Pool View</SelectItem>
                        <SelectItem value="no-preference">No Preference</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pillow">Pillow Type</Label>
                    <Select 
                      value={formData.preferences?.pillow} 
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        preferences: { ...formData.preferences!, pillow: value as any }
                      })}
                    >
                      <SelectTrigger id="pillow">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="soft">Soft</SelectItem>
                        <SelectItem value="firm">Firm</SelectItem>
                        <SelectItem value="memory-foam">Memory Foam</SelectItem>
                        <SelectItem value="feather">Feather</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="smoking">Smoking Room</Label>
                    <Switch
                      id="smoking"
                      checked={formData.preferences?.smoking}
                      onCheckedChange={(checked) => setFormData({ 
                        ...formData, 
                        preferences: { ...formData.preferences!, smoking: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="wakeUpCall">Wake-up Call</Label>
                    <Switch
                      id="wakeUpCall"
                      checked={formData.preferences?.wakeUpCall}
                      onCheckedChange={(checked) => setFormData({ 
                        ...formData, 
                        preferences: { ...formData.preferences!, wakeUpCall: checked }
                      })}
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-4">Dietary Preferences</h3>
                <div>
                  <Label htmlFor="dietaryRestrictions">Dietary Restrictions</Label>
                  <Input
                    id="dietaryRestrictions"
                    value={(formData.dietaryRestrictions || []).join(', ')}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      dietaryRestrictions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    placeholder="e.g., Vegetarian, Vegan, Halal (comma-separated)"
                  />
                </div>
                <div className="mt-4">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Input
                    id="allergies"
                    value={(formData.allergies || []).join(', ')}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    placeholder="e.g., Nuts, Shellfish, Gluten (comma-separated)"
                  />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="loyalty" className="space-y-4 mt-6">
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">Loyalty Program</h3>
                    <p className="text-sm text-muted-foreground">Member since {new Date(formData.loyaltyInfo?.enrolledDate || Date.now()).toLocaleDateString()}</p>
                  </div>
                  <Star size={48} className="text-yellow-500" />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="tier">Tier</Label>
                    <Select 
                      value={formData.loyaltyInfo?.tier} 
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        loyaltyInfo: { ...formData.loyaltyInfo!, tier: value as LoyaltyTier }
                      })}
                    >
                      <SelectTrigger id="tier">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bronze">Bronze</SelectItem>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="platinum">Platinum</SelectItem>
                        <SelectItem value="diamond">Diamond</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="points">Current Points</Label>
                    <Input
                      id="points"
                      type="number"
                      value={formData.loyaltyInfo?.points}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        loyaltyInfo: { ...formData.loyaltyInfo!, points: parseInt(e.target.value) || 0 }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lifetimePoints">Lifetime Points</Label>
                    <Input
                      id="lifetimePoints"
                      type="number"
                      value={formData.loyaltyInfo?.lifetimePoints}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        loyaltyInfo: { ...formData.loyaltyInfo!, lifetimePoints: parseInt(e.target.value) || 0 }
                      })}
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-4">Guest Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="totalStays">Total Stays</Label>
                    <Input
                      id="totalStays"
                      type="number"
                      value={formData.totalStays}
                      onChange={(e) => setFormData({ ...formData, totalStays: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalNights">Total Nights</Label>
                    <Input
                      id="totalNights"
                      type="number"
                      value={formData.totalNights}
                      onChange={(e) => setFormData({ ...formData, totalNights: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalSpent">Total Spent</Label>
                    <Input
                      id="totalSpent"
                      type="number"
                      value={formData.totalSpent}
                      onChange={(e) => setFormData({ ...formData, totalSpent: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="averageSpendPerStay">Average Spend Per Stay</Label>
                    <Input
                      id="averageSpendPerStay"
                      type="number"
                      value={formData.averageSpendPerStay}
                      onChange={(e) => setFormData({ ...formData, averageSpendPerStay: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="additional" className="space-y-4 mt-6">
              <div>
                <Label htmlFor="vipNotes">VIP Notes</Label>
                <Textarea
                  id="vipNotes"
                  value={formData.vipNotes}
                  onChange={(e) => setFormData({ ...formData, vipNotes: e.target.value })}
                  rows={3}
                  placeholder="Special instructions or notes for VIP guests..."
                />
              </div>

              <div>
                <Label htmlFor="specialRequests">Special Requests</Label>
                <Input
                  id="specialRequests"
                  value={(formData.specialRequests || []).join(', ')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    specialRequests: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="e.g., Extra pillows, Room away from elevator (comma-separated)"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={(formData.tags || []).join(', ')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="e.g., Frequent, Business, Family (comma-separated)"
                />
              </div>

              <div>
                <Label htmlFor="acquisitionSource">Acquisition Source</Label>
                <Input
                  id="acquisitionSource"
                  value={formData.acquisitionSource}
                  onChange={(e) => setFormData({ ...formData, acquisitionSource: e.target.value })}
                  placeholder="e.g., Google Ads, Referral, Walk-in"
                />
              </div>

              <div>
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  placeholder="Internal notes (not visible to guest)..."
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {guest ? 'Update Profile' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
