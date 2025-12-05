import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { GuestProfile, GuestSegment } from '@/lib/types'
import { COUNTRIES } from '@/lib/countries'
import { Plus, X, User, MapPin, FileText, CreditCard, Star, Phone, Envelope } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface GuestProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: GuestProfile | null
  onSave: (profile: Partial<GuestProfile>) => void
}

const SALUTATIONS = ['Mr', 'Ms', 'Mrs', 'Dr', 'Prof'] as const
const ID_TYPES = ['Passport', 'National ID', 'Driving License', 'Other']
const DOCUMENT_TYPES = ['Passport', 'National ID', 'Visa', 'Driving License', 'Birth Certificate']
const LOYALTY_TIERS = ['bronze', 'silver', 'gold', 'platinum', 'diamond'] as const
const GUEST_SEGMENTS: GuestSegment[] = ['vip', 'corporate', 'leisure', 'group', 'wedding', 'repeat', 'new']
const COMMUNICATION_PREFS = ['email', 'sms', 'phone', 'whatsapp', 'none'] as const

export function GuestProfileDialog({ open, onOpenChange, profile, onSave }: GuestProfileDialogProps) {
  const [activeTab, setActiveTab] = useState('personal')
  
  const [salutation, setSalutation] = useState<string>('')
  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [lastName, setLastName] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | ''>('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [nationality, setNationality] = useState('')
  const [companyName, setCompanyName] = useState('')
  
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [alternatePhone, setAlternatePhone] = useState('')
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([])
  const [additionalPhones, setAdditionalPhones] = useState<string[]>([])
  
  const [documentType, setDocumentType] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [passportNumber, setPassportNumber] = useState('')
  const [countryOfBirth, setCountryOfBirth] = useState('')
  const [cityOfBirth, setCityOfBirth] = useState('')
  
  const [country, setCountry] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [region, setRegion] = useState('')
  const [district, setDistrict] = useState('')
  const [city, setCity] = useState('')
  const [location, setLocation] = useState('')
  const [street, setStreet] = useState('')
  const [house, setHouse] = useState('')
  const [block, setBlock] = useState('')
  const [litera, setLitera] = useState('')
  const [building, setBuilding] = useState('')
  const [apartment, setApartment] = useState('')
  
  const [guestStatus, setGuestStatus] = useState('')
  const [comment, setComment] = useState('')
  
  const [legalRepName, setLegalRepName] = useState('')
  const [legalRepEmail, setLegalRepEmail] = useState('')
  const [legalRepPhone, setLegalRepPhone] = useState('')
  const [hasLegalRep, setHasLegalRep] = useState(false)
  
  const [gstNumber, setGstNumber] = useState('')
  const [loyaltyTier, setLoyaltyTier] = useState<'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'>('bronze')
  const [segments, setSegments] = useState<GuestSegment[]>([])
  const [communicationPref, setCommunicationPref] = useState<string[]>([])
  const [vipNotes, setVipNotes] = useState('')
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([])
  const [allergies, setAllergies] = useState<string[]>([])
  const [specialRequests, setSpecialRequests] = useState<string[]>([])

  useEffect(() => {
    if (profile) {
      setSalutation(profile.salutation || '')
      setFirstName(profile.firstName)
      setMiddleName('')
      setLastName(profile.lastName)
      setGender('')
      setDateOfBirth(profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '')
      setNationality(profile.nationality || '')
      setCompanyName(profile.companyName || '')
      
      setEmail(profile.email || '')
      setPhone(profile.phone)
      setAlternatePhone(profile.alternatePhone || '')
      
      setDocumentType(profile.idType || '')
      setIdNumber(profile.idNumber || '')
      setPassportNumber(profile.passportNumber || '')
      
      setCountry(profile.country || '')
      setPostalCode(profile.postalCode || '')
      setRegion(profile.state || '')
      setCity(profile.city || '')
      setStreet(profile.address || '')
      
      setComment(profile.notes || '')
      setGstNumber(profile.gstNumber || '')
      setLoyaltyTier(profile.loyaltyInfo?.tier || 'bronze')
      setSegments(profile.segments || [])
      setCommunicationPref(profile.communicationPreference || [])
      setVipNotes(profile.vipNotes || '')
      setDietaryRestrictions(profile.dietaryRestrictions || [])
      setAllergies(profile.allergies || [])
      setSpecialRequests(profile.specialRequests || [])
    } else {
      resetForm()
    }
  }, [profile, open])

  const resetForm = () => {
    setSalutation('')
    setFirstName('')
    setMiddleName('')
    setLastName('')
    setGender('')
    setDateOfBirth('')
    setNationality('')
    setCompanyName('')
    setEmail('')
    setPhone('')
    setAlternatePhone('')
    setAdditionalEmails([])
    setAdditionalPhones([])
    setDocumentType('')
    setIdNumber('')
    setPassportNumber('')
    setCountryOfBirth('')
    setCityOfBirth('')
    setCountry('')
    setPostalCode('')
    setRegion('')
    setDistrict('')
    setCity('')
    setLocation('')
    setStreet('')
    setHouse('')
    setBlock('')
    setLitera('')
    setBuilding('')
    setApartment('')
    setGuestStatus('')
    setComment('')
    setLegalRepName('')
    setLegalRepEmail('')
    setLegalRepPhone('')
    setHasLegalRep(false)
    setGstNumber('')
    setLoyaltyTier('bronze')
    setSegments([])
    setCommunicationPref([])
    setVipNotes('')
    setDietaryRestrictions([])
    setAllergies([])
    setSpecialRequests([])
  }

  const handleSave = () => {
    if (!firstName || !lastName) {
      toast.error('Please fill in required fields: First Name and Last Name')
      return
    }

    if (!phone) {
      toast.error('Please provide a phone number')
      return
    }

    const profileData: Partial<GuestProfile> = {
      salutation: salutation as any,
      firstName,
      lastName,
      email: email || undefined,
      phone,
      alternatePhone: alternatePhone || undefined,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth).getTime() : undefined,
      nationality: nationality || undefined,
      idType: documentType || undefined,
      idNumber: idNumber || undefined,
      passportNumber: passportNumber || undefined,
      address: street || undefined,
      city: city || undefined,
      state: region || undefined,
      country: country || undefined,
      postalCode: postalCode || undefined,
      companyName: companyName || undefined,
      gstNumber: gstNumber || undefined,
      notes: comment || undefined,
      vipNotes: vipNotes || undefined,
      segments,
      communicationPreference: communicationPref as any,
      dietaryRestrictions,
      allergies,
      specialRequests,
      loyaltyInfo: {
        tier: loyaltyTier,
        points: profile?.loyaltyInfo?.points || 0,
        lifetimePoints: profile?.loyaltyInfo?.lifetimePoints || 0,
        pointsToNextTier: profile?.loyaltyInfo?.pointsToNextTier || 500,
        tierSince: profile?.loyaltyInfo?.tierSince || Date.now(),
        tierBenefits: profile?.loyaltyInfo?.tierBenefits || [],
        enrolledDate: profile?.loyaltyInfo?.enrolledDate || Date.now(),
      },
      preferences: profile?.preferences || {
        roomType: undefined,
        floor: undefined,
        bedType: undefined,
        smoking: undefined,
        view: undefined,
        pillow: undefined,
        temperature: undefined,
        newspaper: undefined,
        wakeUpCall: undefined,
        wakeUpTime: undefined,
        minibarPreferences: [],
        roomAmenities: [],
        foodPreferences: [],
        beveragePreferences: [],
        transportPreferences: [],
        activityInterests: [],
        specialOccasions: [],
      },
      doNotDisturb: profile?.doNotDisturb || false,
      blacklisted: profile?.blacklisted || false,
    }

    onSave(profileData)
    onOpenChange(false)
    resetForm()
  }

  const addArrayItem = (setter: (val: string[]) => void, current: string[]) => {
    setter([...current, ''])
  }

  const removeArrayItem = (setter: (val: string[]) => void, current: string[], index: number) => {
    setter(current.filter((_, i) => i !== index))
  }

  const updateArrayItem = (setter: (val: string[]) => void, current: string[], index: number, value: string) => {
    const updated = [...current]
    updated[index] = value
    setter(updated)
  }

  const toggleSegment = (segment: GuestSegment) => {
    setSegments(prev => 
      prev.includes(segment) ? prev.filter(s => s !== segment) : [...prev, segment]
    )
  }

  const toggleCommPref = (pref: string) => {
    setCommunicationPref(prev => 
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl">{profile ? 'Edit Guest Profile' : 'Add Guest Profile'}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">
                <User className="mr-2" size={16} />
                Personal Details
              </TabsTrigger>
              <TabsTrigger value="contact">
                <Phone className="mr-2" size={16} />
                Contact
              </TabsTrigger>
              <TabsTrigger value="residence">
                <MapPin className="mr-2" size={16} />
                Residence
              </TabsTrigger>
              <TabsTrigger value="status">
                <Star className="mr-2" size={16} />
                Status & Preferences
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[calc(90vh-220px)] px-6">
            <TabsContent value="personal" className="space-y-6 mt-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Personal Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salutation">Salutation</Label>
                    <Select value={salutation} onValueChange={setSalutation}>
                      <SelectTrigger id="salutation">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {SALUTATIONS.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality">Citizenship / Nationality *</Label>
                    <Select value={nationality} onValueChange={setNationality}>
                      <SelectTrigger id="nationality">
                        <SelectValue placeholder="Not selected" />
                      </SelectTrigger>
                      <SelectContent>
                        <ScrollArea className="h-72">
                          {COUNTRIES.map(country => (
                            <SelectItem key={country.code} value={country.name}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input
                      id="middleName"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      placeholder="Enter middle name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <RadioGroup value={gender} onValueChange={(val) => setGender(val as any)}>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male" className="font-normal cursor-pointer">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female" className="font-normal cursor-pointer">Female</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="companyName">Company</Label>
                    <Input
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Specify the company name and details"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Identity Document</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="documentType">Document</Label>
                    <Select value={documentType} onValueChange={setDocumentType}>
                      <SelectTrigger id="documentType">
                        <SelectValue placeholder="Not selected" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="countryOfBirth">Country of Birth</Label>
                    <Select value={countryOfBirth} onValueChange={setCountryOfBirth}>
                      <SelectTrigger id="countryOfBirth">
                        <SelectValue placeholder="Not selected" />
                      </SelectTrigger>
                      <SelectContent>
                        <ScrollArea className="h-72">
                          {COUNTRIES.map(country => (
                            <SelectItem key={country.code} value={country.name}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="idNumber">ID / Document Number</Label>
                    <Input
                      id="idNumber"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="Enter ID number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cityOfBirth">City of Birth</Label>
                    <Input
                      id="cityOfBirth"
                      value={cityOfBirth}
                      onChange={(e) => setCityOfBirth(e.target.value)}
                      placeholder="Enter city"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6 mt-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Contact Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="alternatePhone">Alternate Phone</Label>
                      <Input
                        id="alternatePhone"
                        type="tel"
                        value={alternatePhone}
                        onChange={(e) => setAlternatePhone(e.target.value)}
                        placeholder="Enter alternate phone number"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Additional Email Addresses</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addArrayItem(setAdditionalEmails, additionalEmails)}
                      >
                        <Plus size={16} className="mr-1" />
                        Add Email
                      </Button>
                    </div>
                    {additionalEmails.map((email, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => updateArrayItem(setAdditionalEmails, additionalEmails, idx, e.target.value)}
                          placeholder="Additional email"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeArrayItem(setAdditionalEmails, additionalEmails, idx)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Additional Phone Numbers</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addArrayItem(setAdditionalPhones, additionalPhones)}
                      >
                        <Plus size={16} className="mr-1" />
                        Add Phone
                      </Button>
                    </div>
                    {additionalPhones.map((phone, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          type="tel"
                          value={phone}
                          onChange={(e) => updateArrayItem(setAdditionalPhones, additionalPhones, idx, e.target.value)}
                          placeholder="Additional phone"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeArrayItem(setAdditionalPhones, additionalPhones, idx)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {hasLegalRep && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Legal Representative</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setHasLegalRep(false)}
                    >
                      <X size={16} className="mr-1" />
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="legalRepName">Name</Label>
                      <Input
                        id="legalRepName"
                        value={legalRepName}
                        onChange={(e) => setLegalRepName(e.target.value)}
                        placeholder="Enter name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="legalRepEmail">Email</Label>
                      <Input
                        id="legalRepEmail"
                        type="email"
                        value={legalRepEmail}
                        onChange={(e) => setLegalRepEmail(e.target.value)}
                        placeholder="Enter email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="legalRepPhone">Phone</Label>
                      <Input
                        id="legalRepPhone"
                        type="tel"
                        value={legalRepPhone}
                        onChange={(e) => setLegalRepPhone(e.target.value)}
                        placeholder="Enter phone"
                      />
                    </div>
                  </div>
                </Card>
              )}

              {!hasLegalRep && (
                <Button
                  variant="outline"
                  onClick={() => setHasLegalRep(true)}
                  className="w-full"
                >
                  <Plus size={16} className="mr-2" />
                  Add Legal Representative
                </Button>
              )}
            </TabsContent>

            <TabsContent value="residence" className="space-y-6 mt-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Place of Residence</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Not selected" />
                      </SelectTrigger>
                      <SelectContent>
                        <ScrollArea className="h-72">
                          {COUNTRIES.map(c => (
                            <SelectItem key={c.code} value={c.name}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="Enter postal code"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Input
                      id="region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="Enter region/state"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Enter district"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Enter city"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter location"
                    />
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="street">Street</Label>
                    <Input
                      id="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Enter street address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="house">House</Label>
                    <Input
                      id="house"
                      value={house}
                      onChange={(e) => setHouse(e.target.value)}
                      placeholder="Enter house number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="block">Block</Label>
                    <Input
                      id="block"
                      value={block}
                      onChange={(e) => setBlock(e.target.value)}
                      placeholder="Enter block"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="litera">Litera</Label>
                    <Input
                      id="litera"
                      value={litera}
                      onChange={(e) => setLitera(e.target.value)}
                      placeholder="Enter litera"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="building">Building</Label>
                    <Input
                      id="building"
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      placeholder="Enter building"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apartment">Apartment</Label>
                    <Input
                      id="apartment"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      placeholder="Enter apartment number"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="status" className="space-y-6 mt-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Guest Status</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="guestStatus">Status</Label>
                    <Select value={guestStatus} onValueChange={setGuestStatus}>
                      <SelectTrigger id="guestStatus">
                        <SelectValue placeholder="Not selected" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="blacklisted">Blacklisted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loyaltyTier">Loyalty Tier</Label>
                    <Select value={loyaltyTier} onValueChange={(v) => setLoyaltyTier(v as any)}>
                      <SelectTrigger id="loyaltyTier">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LOYALTY_TIERS.map(tier => (
                          <SelectItem key={tier} value={tier} className="capitalize">
                            {tier}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Guest Segments</Label>
                    <div className="flex flex-wrap gap-2">
                      {GUEST_SEGMENTS.map(seg => (
                        <Badge
                          key={seg}
                          variant={segments.includes(seg) ? 'default' : 'outline'}
                          className="cursor-pointer capitalize"
                          onClick={() => toggleSegment(seg)}
                        >
                          {seg}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Communication Preferences</Label>
                    <div className="flex flex-wrap gap-2">
                      {COMMUNICATION_PREFS.map(pref => (
                        <Badge
                          key={pref}
                          variant={communicationPref.includes(pref) ? 'default' : 'outline'}
                          className="cursor-pointer capitalize"
                          onClick={() => toggleCommPref(pref)}
                        >
                          {pref}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gstNumber">GST Number (for Corporate)</Label>
                    <Input
                      id="gstNumber"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                      placeholder="Enter GST number"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Preferences & Notes</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vipNotes">VIP Notes</Label>
                    <Textarea
                      id="vipNotes"
                      value={vipNotes}
                      onChange={(e) => setVipNotes(e.target.value)}
                      placeholder="Special VIP instructions or notes"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comment">General Comments</Label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Visible to property staff only"
                      rows={3}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Dietary Restrictions</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addArrayItem(setDietaryRestrictions, dietaryRestrictions)}
                      >
                        <Plus size={16} className="mr-1" />
                        Add
                      </Button>
                    </div>
                    {dietaryRestrictions.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => updateArrayItem(setDietaryRestrictions, dietaryRestrictions, idx, e.target.value)}
                          placeholder="e.g., Vegetarian, Vegan"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeArrayItem(setDietaryRestrictions, dietaryRestrictions, idx)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Allergies</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addArrayItem(setAllergies, allergies)}
                      >
                        <Plus size={16} className="mr-1" />
                        Add
                      </Button>
                    </div>
                    {allergies.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => updateArrayItem(setAllergies, allergies, idx, e.target.value)}
                          placeholder="e.g., Nuts, Shellfish"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeArrayItem(setAllergies, allergies, idx)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Special Requests</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addArrayItem(setSpecialRequests, specialRequests)}
                      >
                        <Plus size={16} className="mr-1" />
                        Add
                      </Button>
                    </div>
                    {specialRequests.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => updateArrayItem(setSpecialRequests, specialRequests, idx, e.target.value)}
                          placeholder="e.g., High floor, Late checkout"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeArrayItem(setSpecialRequests, specialRequests, idx)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {profile ? 'Update Profile' : 'Create Profile'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
