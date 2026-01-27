import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Buildings, Palette, FileText, Bank, UploadSimple, Image as ImageIcon, X, Eye, MapPin } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { HotelBranding, SystemUser } from '@/lib/types'

interface BrandingSettingsProps {
  branding: HotelBranding | null
  setBranding: (setter: (current: HotelBranding | null) => HotelBranding) => void
  currentUser: SystemUser
}

const defaultBranding: HotelBranding = {
  id: 'branding-1',
  hotelName: 'W3 Hotel',
  hotelAddress: '123 Main Street',
  hotelCity: 'Colombo',
  hotelState: 'Western Province',
  hotelCountry: 'Sri Lanka',
  hotelPostalCode: '00100',
  hotelPhone: '+94 11 234 5678',
  hotelEmail: 'info@w3hotel.lk',
  hotelWebsite: 'www.w3hotel.lk',
  taxRegistrationNumber: 'TRN-123456789',
  businessRegistrationNumber: 'BRN-987654321',
  tagline: 'Your Home Away From Home',
  colorScheme: {
    primary: '#2c5f2d',
    secondary: '#97bc62',
    accent: '#4a7c59'
  },
  footerGradient: {
    color1: '#2c5f2d',
    color2: '#4a7c59',
    color3: '#97bc62',
    color4: '#2c5f2d'
  },
  bankDetails: {
    bankName: 'Commercial Bank of Ceylon',
    accountName: 'W3 Hotel Pvt Ltd',
    accountNumber: '1234567890',
    branchName: 'Colombo Main Branch',
    branchCode: '001'
  },
  showQRCode: false,
  currency: 'LKR',
  currencySymbol: 'Rs.',
  currencyPosition: 'before',
  decimalPlaces: 2,
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  timezone: 'Asia/Colombo',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  updatedBy: 'admin'
}

export function BrandingSettings({ branding, setBranding, currentUser }: BrandingSettingsProps) {
  const [formData, setFormData] = useState<HotelBranding>(branding || defaultBranding)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [faviconPreview, setFaviconPreview] = useState<string>('')
  const [emailHeaderLogoPreview, setEmailHeaderLogoPreview] = useState<string>('')
  const [showPreview, setShowPreview] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)
  const emailHeaderLogoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (branding) {
      setFormData(branding)
      if (branding.logo) {
        setLogoPreview(branding.logo)
      }
      if (branding.favicon) {
        setFaviconPreview(branding.favicon)
      }
      if (branding.emailHeaderLogo) {
        setEmailHeaderLogoPreview(branding.emailHeaderLogo)
      }
    }
  }, [branding])

  const handleSave = async () => {
    try {
      const updatedBranding = {
        ...formData,
        updatedAt: Date.now(),
        updatedBy: currentUser.userId
      };

      // Save to database
      const response = await fetch('/api/branding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedBranding),
      });

      if (!response.ok) {
        throw new Error('Failed to save branding to database');
      }

      const savedBranding = await response.json();
      
      // Update local state
      setBranding(() => savedBranding);
      
      toast.success('Branding settings saved successfully to database');
    } catch (error) {
      console.error('Error saving branding:', error);
      toast.error('Failed to save branding settings. Please try again.');
    }
  }

  const handleReset = () => {
    setBranding(() => ({
      ...defaultBranding,
      id: branding?.id || 'branding-1',
      createdAt: branding?.createdAt || Date.now(),
      updatedAt: Date.now(),
      updatedBy: currentUser.userId
    }))
    setFormData(defaultBranding)
    setLogoPreview('')
    setFaviconPreview('')
    setEmailHeaderLogoPreview('')
    toast.success('Branding settings reset to defaults')
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo file size must be less than 2MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setLogoPreview(result)
        setFormData({ ...formData, logo: result })
        toast.success('Logo uploaded successfully')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setLogoPreview('')
    setFormData({ ...formData, logo: undefined })
    if (logoInputRef.current) {
      logoInputRef.current.value = ''
    }
    toast.success('Logo removed')
  }

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 500 * 1024) {
        toast.error('Favicon file size must be less than 500KB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setFaviconPreview(result)
        setFormData({ ...formData, favicon: result })
        toast.success('Favicon uploaded successfully')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveFavicon = () => {
    setFaviconPreview('')
    setFormData({ ...formData, favicon: undefined })
    if (faviconInputRef.current) {
      faviconInputRef.current.value = ''
    }
    toast.success('Favicon removed')
  }

  const handleEmailHeaderLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Email header logo file size must be less than 2MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setEmailHeaderLogoPreview(result)
        setFormData({ ...formData, emailHeaderLogo: result })
        toast.success('Email header logo uploaded successfully')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveEmailHeaderLogo = () => {
    setEmailHeaderLogoPreview('')
    setFormData({ ...formData, emailHeaderLogo: undefined })
    if (emailHeaderLogoInputRef.current) {
      emailHeaderLogoInputRef.current.value = ''
    }
    toast.success('Email header logo removed')
  }

  const generatePresetColors = () => [
    { name: 'Forest Green', primary: '#2c5f2d', secondary: '#97bc62', accent: '#4a7c59' },
    { name: 'Ocean Blue', primary: '#1e3a8a', secondary: '#60a5fa', accent: '#3b82f6' },
    { name: 'Sunset Orange', primary: '#c2410c', secondary: '#fb923c', accent: '#ea580c' },
    { name: 'Royal Purple', primary: '#6b21a8', secondary: '#a78bfa', accent: '#7c3aed' },
    { name: 'Elegant Gold', primary: '#854d0e', secondary: '#fbbf24', accent: '#ca8a04' },
    { name: 'Modern Teal', primary: '#115e59', secondary: '#5eead4', accent: '#14b8a6' },
  ]

  const applyPreset = (preset: { primary: string; secondary: string; accent: string }) => {
    setFormData({
      ...formData,
      colorScheme: preset
    })
    toast.success('Color preset applied')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Branding & Settings</h1>
          <p className="text-muted-foreground mt-1">Configure your hotel information and invoice branding</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="hotel" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="hotel">
            <Buildings size={16} className="mr-2" />
            Hotel Info
          </TabsTrigger>
          <TabsTrigger value="colors">
            <Palette size={16} className="mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="directions">
            <MapPin size={16} className="mr-2" />
            Directions
          </TabsTrigger>
          <TabsTrigger value="invoice">
            <FileText size={16} className="mr-2" />
            Invoice
          </TabsTrigger>
          <TabsTrigger value="banking">
            <Bank size={16} className="mr-2" />
            Banking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hotel" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Hotel Logo</h3>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1 space-y-3">
                  <Label htmlFor="logo-upload">Upload Logo</Label>
                  <p className="text-sm text-muted-foreground">
                    Recommended: PNG or SVG format, max 2MB, transparent background for best results
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => logoInputRef.current?.click()}
                      className="gap-2"
                    >
                      <UploadSimple size={18} />
                      Choose Logo
                    </Button>
                    {logoPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveLogo}
                        className="gap-2"
                      >
                        <X size={18} />
                        Remove Logo
                      </Button>
                    )}
                  </div>
                  <input
                    ref={logoInputRef}
                    id="logo-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
                
                {logoPreview && (
                  <div className="flex flex-col gap-2">
                    <Label>Logo Preview</Label>
                    <div className="border rounded-lg p-4 bg-white w-48 h-32 flex items-center justify-center">
                      <img
                        src={logoPreview}
                        alt="Hotel Logo"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Favicon</h3>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1 space-y-3">
                  <Label htmlFor="favicon-upload">Upload Favicon</Label>
                  <p className="text-sm text-muted-foreground">
                    Recommended: ICO, PNG format, 16x16, 32x32 or 64x64 pixels, max 500KB
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => faviconInputRef.current?.click()}
                      className="gap-2"
                    >
                      <UploadSimple size={18} />
                      Choose Favicon
                    </Button>
                    {faviconPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveFavicon}
                        className="gap-2"
                      >
                        <X size={18} />
                        Remove Favicon
                      </Button>
                    )}
                  </div>
                  <input
                    ref={faviconInputRef}
                    id="favicon-upload"
                    type="file"
                    accept="image/x-icon,image/png,image/jpeg"
                    onChange={handleFaviconUpload}
                    className="hidden"
                  />
                </div>
                
                {faviconPreview && (
                  <div className="flex flex-col gap-2">
                    <Label>Favicon Preview</Label>
                    <div className="border rounded-lg p-4 bg-white w-24 h-24 flex items-center justify-center">
                      <img
                        src={faviconPreview}
                        alt="Favicon"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Email Header Logo</h3>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1 space-y-3">
                  <Label htmlFor="email-header-logo-upload">Upload Email Header Logo</Label>
                  <p className="text-sm text-muted-foreground">
                    Recommended: PNG or JPG format, max 2MB, width 600px for optimal email display
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => emailHeaderLogoInputRef.current?.click()}
                      className="gap-2"
                    >
                      <UploadSimple size={18} />
                      Choose Email Header Logo
                    </Button>
                    {emailHeaderLogoPreview && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveEmailHeaderLogo}
                        className="gap-2"
                      >
                        <X size={18} />
                        Remove Email Header Logo
                      </Button>
                    )}
                  </div>
                  <input
                    ref={emailHeaderLogoInputRef}
                    id="email-header-logo-upload"
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleEmailHeaderLogoUpload}
                    className="hidden"
                  />
                </div>
                
                {emailHeaderLogoPreview && (
                  <div className="flex flex-col gap-2">
                    <Label>Email Header Logo Preview</Label>
                    <div className="border rounded-lg p-4 bg-white w-64 h-32 flex items-center justify-center">
                      <img
                        src={emailHeaderLogoPreview}
                        alt="Email Header Logo"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Hotel Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hotelName">Hotel Name *</Label>
                <Input
                  id="hotelName"
                  value={formData.hotelName}
                  onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="hotelAddress">Address *</Label>
                <Input
                  id="hotelAddress"
                  value={formData.hotelAddress}
                  onChange={(e) => setFormData({ ...formData, hotelAddress: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hotelCity">City *</Label>
                <Input
                  id="hotelCity"
                  value={formData.hotelCity}
                  onChange={(e) => setFormData({ ...formData, hotelCity: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hotelState">State/Province *</Label>
                <Input
                  id="hotelState"
                  value={formData.hotelState}
                  onChange={(e) => setFormData({ ...formData, hotelState: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hotelCountry">Country *</Label>
                <Input
                  id="hotelCountry"
                  value={formData.hotelCountry}
                  onChange={(e) => setFormData({ ...formData, hotelCountry: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hotelPostalCode">Postal Code</Label>
                <Input
                  id="hotelPostalCode"
                  value={formData.hotelPostalCode}
                  onChange={(e) => setFormData({ ...formData, hotelPostalCode: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hotelPhone">Phone *</Label>
                <Input
                  id="hotelPhone"
                  value={formData.hotelPhone}
                  onChange={(e) => setFormData({ ...formData, hotelPhone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hotelEmail">Email *</Label>
                <Input
                  id="hotelEmail"
                  type="email"
                  value={formData.hotelEmail}
                  onChange={(e) => setFormData({ ...formData, hotelEmail: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hotelWebsite">Website</Label>
                <Input
                  id="hotelWebsite"
                  value={formData.hotelWebsite}
                  onChange={(e) => setFormData({ ...formData, hotelWebsite: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxRegNumber">Tax Registration Number</Label>
                <Input
                  id="taxRegNumber"
                  value={formData.taxRegistrationNumber}
                  onChange={(e) => setFormData({ ...formData, taxRegistrationNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessRegNumber">Business Registration Number</Label>
                <Input
                  id="businessRegNumber"
                  value={formData.businessRegistrationNumber}
                  onChange={(e) => setFormData({ ...formData, businessRegistrationNumber: e.target.value })}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Color Scheme</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2"
              >
                <Eye size={16} />
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">Color Presets</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {generatePresetColors().map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="border rounded-lg p-3 hover:border-primary transition-colors text-left"
                    >
                      <div className="flex gap-2 mb-2">
                        <div
                          className="w-8 h-8 rounded"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div
                          className="w-8 h-8 rounded"
                          style={{ backgroundColor: preset.secondary }}
                        />
                        <div
                          className="w-8 h-8 rounded"
                          style={{ backgroundColor: preset.accent }}
                        />
                      </div>
                      <span className="text-sm font-medium">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <p className="text-xs text-muted-foreground mb-2">Main brand color for headers and key elements</p>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.colorScheme.primary}
                      onChange={(e) => setFormData({
                        ...formData,
                        colorScheme: { ...formData.colorScheme, primary: e.target.value }
                      })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={formData.colorScheme.primary}
                      onChange={(e) => setFormData({
                        ...formData,
                        colorScheme: { ...formData.colorScheme, primary: e.target.value }
                      })}
                      className="flex-1 font-mono"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <p className="text-xs text-muted-foreground mb-2">Supporting color for accents and highlights</p>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={formData.colorScheme.secondary}
                      onChange={(e) => setFormData({
                        ...formData,
                        colorScheme: { ...formData.colorScheme, secondary: e.target.value }
                      })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={formData.colorScheme.secondary}
                      onChange={(e) => setFormData({
                        ...formData,
                        colorScheme: { ...formData.colorScheme, secondary: e.target.value }
                      })}
                      className="flex-1 font-mono"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <p className="text-xs text-muted-foreground mb-2">Color for buttons and interactive elements</p>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={formData.colorScheme.accent}
                      onChange={(e) => setFormData({
                        ...formData,
                        colorScheme: { ...formData.colorScheme, accent: e.target.value }
                      })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={formData.colorScheme.accent}
                      onChange={(e) => setFormData({
                        ...formData,
                        colorScheme: { ...formData.colorScheme, accent: e.target.value }
                      })}
                      className="flex-1 font-mono"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>

              {showPreview && (
                <>
                  <Separator />
                  <div>
                    <Label className="mb-3 block">Live Preview</Label>
                    <div className="border rounded-lg p-6 space-y-4">
                      <div
                        className="p-4 rounded-lg text-white"
                        style={{ backgroundColor: formData.colorScheme.primary }}
                      >
                        <h4 className="text-lg font-semibold mb-1">{formData.hotelName}</h4>
                        <p className="text-sm opacity-90">{formData.tagline}</p>
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          type="button"
                          className="px-4 py-2 rounded font-medium text-white"
                          style={{ backgroundColor: formData.colorScheme.accent }}
                        >
                          Book Now
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 rounded font-medium border"
                          style={{
                            borderColor: formData.colorScheme.secondary,
                            color: formData.colorScheme.secondary
                          }}
                        >
                          Learn More
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded border text-center">
                          <div
                            className="w-12 h-12 rounded-full mx-auto mb-2"
                            style={{ backgroundColor: formData.colorScheme.primary }}
                          />
                          <p className="text-xs font-medium">Primary</p>
                        </div>
                        <div className="p-3 rounded border text-center">
                          <div
                            className="w-12 h-12 rounded-full mx-auto mb-2"
                            style={{ backgroundColor: formData.colorScheme.secondary }}
                          />
                          <p className="text-xs font-medium">Secondary</p>
                        </div>
                        <div className="p-3 rounded border text-center">
                          <div
                            className="w-12 h-12 rounded-full mx-auto mb-2"
                            style={{ backgroundColor: formData.colorScheme.accent }}
                          />
                          <p className="text-xs font-medium">Accent</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Footer Gradient Colors</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Customize the footer gradient colors to match your brand identity
            </p>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="footerColor1">Gradient Color 1</Label>
                  <p className="text-xs text-muted-foreground mb-2">Top-left gradient color</p>
                  <div className="flex gap-2">
                    <Input
                      id="footerColor1"
                      type="color"
                      value={formData.footerGradient?.color1 || formData.colorScheme.primary}
                      onChange={(e) => setFormData({
                        ...formData,
                        footerGradient: {
                          color1: e.target.value,
                          color2: formData.footerGradient?.color2 || formData.colorScheme.accent,
                          color3: formData.footerGradient?.color3 || formData.colorScheme.secondary,
                          color4: formData.footerGradient?.color4 || formData.colorScheme.primary
                        }
                      })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={formData.footerGradient?.color1 || formData.colorScheme.primary}
                      onChange={(e) => setFormData({
                        ...formData,
                        footerGradient: {
                          color1: e.target.value,
                          color2: formData.footerGradient?.color2 || formData.colorScheme.accent,
                          color3: formData.footerGradient?.color3 || formData.colorScheme.secondary,
                          color4: formData.footerGradient?.color4 || formData.colorScheme.primary
                        }
                      })}
                      className="flex-1 font-mono text-sm"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footerColor2">Gradient Color 2</Label>
                  <p className="text-xs text-muted-foreground mb-2">Middle gradient color</p>
                  <div className="flex gap-2">
                    <Input
                      id="footerColor2"
                      type="color"
                      value={formData.footerGradient?.color2 || formData.colorScheme.accent}
                      onChange={(e) => setFormData({
                        ...formData,
                        footerGradient: {
                          color1: formData.footerGradient?.color1 || formData.colorScheme.primary,
                          color2: e.target.value,
                          color3: formData.footerGradient?.color3 || formData.colorScheme.secondary,
                          color4: formData.footerGradient?.color4 || formData.colorScheme.primary
                        }
                      })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={formData.footerGradient?.color2 || formData.colorScheme.accent}
                      onChange={(e) => setFormData({
                        ...formData,
                        footerGradient: {
                          color1: formData.footerGradient?.color1 || formData.colorScheme.primary,
                          color2: e.target.value,
                          color3: formData.footerGradient?.color3 || formData.colorScheme.secondary,
                          color4: formData.footerGradient?.color4 || formData.colorScheme.primary
                        }
                      })}
                      className="flex-1 font-mono text-sm"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footerColor3">Gradient Color 3</Label>
                  <p className="text-xs text-muted-foreground mb-2">Middle-right gradient color</p>
                  <div className="flex gap-2">
                    <Input
                      id="footerColor3"
                      type="color"
                      value={formData.footerGradient?.color3 || formData.colorScheme.secondary}
                      onChange={(e) => setFormData({
                        ...formData,
                        footerGradient: {
                          color1: formData.footerGradient?.color1 || formData.colorScheme.primary,
                          color2: formData.footerGradient?.color2 || formData.colorScheme.accent,
                          color3: e.target.value,
                          color4: formData.footerGradient?.color4 || formData.colorScheme.primary
                        }
                      })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={formData.footerGradient?.color3 || formData.colorScheme.secondary}
                      onChange={(e) => setFormData({
                        ...formData,
                        footerGradient: {
                          color1: formData.footerGradient?.color1 || formData.colorScheme.primary,
                          color2: formData.footerGradient?.color2 || formData.colorScheme.accent,
                          color3: e.target.value,
                          color4: formData.footerGradient?.color4 || formData.colorScheme.primary
                        }
                      })}
                      className="flex-1 font-mono text-sm"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footerColor4">Gradient Color 4</Label>
                  <p className="text-xs text-muted-foreground mb-2">Bottom-right gradient color</p>
                  <div className="flex gap-2">
                    <Input
                      id="footerColor4"
                      type="color"
                      value={formData.footerGradient?.color4 || formData.colorScheme.primary}
                      onChange={(e) => setFormData({
                        ...formData,
                        footerGradient: {
                          color1: formData.footerGradient?.color1 || formData.colorScheme.primary,
                          color2: formData.footerGradient?.color2 || formData.colorScheme.accent,
                          color3: formData.footerGradient?.color3 || formData.colorScheme.secondary,
                          color4: e.target.value
                        }
                      })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={formData.footerGradient?.color4 || formData.colorScheme.primary}
                      onChange={(e) => setFormData({
                        ...formData,
                        footerGradient: {
                          color1: formData.footerGradient?.color1 || formData.colorScheme.primary,
                          color2: formData.footerGradient?.color2 || formData.colorScheme.accent,
                          color3: formData.footerGradient?.color3 || formData.colorScheme.secondary,
                          color4: e.target.value
                        }
                      })}
                      className="flex-1 font-mono text-sm"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="mb-3 block">Footer Gradient Preview</Label>
                <div 
                  className="border rounded-lg p-6 relative overflow-hidden min-h-[120px]"
                >
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to bottom right, ${formData.footerGradient?.color1 || formData.colorScheme.primary}15, ${formData.footerGradient?.color2 || formData.colorScheme.accent}10)`
                    }}
                  />
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to top right, ${formData.footerGradient?.color3 || formData.colorScheme.secondary}12, ${formData.footerGradient?.color4 || formData.colorScheme.primary}15)`
                    }}
                  />
                  <div className="relative backdrop-blur-[2px] flex items-center justify-center py-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground/80">
                        © {new Date().getFullYear()} Design & Developed by W3 Media PVT LTD
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        This is how your footer will look with these gradient colors
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Regional Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LKR">LKR - Sri Lankan Rupee</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currencySymbol">Currency Symbol</Label>
                <Input
                  id="currencySymbol"
                  value={formData.currencySymbol}
                  onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="directions" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">🗺️ Travel Directions & Landmarks</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Customize the travel directions and location information that appears in pre-arrival emails to help guests find your hotel easily.
            </p>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gpsCoordinates">GPS Coordinates</Label>
                <Input
                  id="gpsCoordinates"
                  value={formData.travelDirections?.gpsCoordinates || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    travelDirections: { ...formData.travelDirections, gpsCoordinates: e.target.value }
                  })}
                  placeholder="6.9271° N, 79.8612° E"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="directionsFromAirport">Directions from Airport</Label>
                <Textarea
                  id="directionsFromAirport"
                  value={formData.travelDirections?.directionsFromAirport || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    travelDirections: { ...formData.travelDirections, directionsFromAirport: e.target.value }
                  })}
                  placeholder="Approximately 15 minutes (12 km) by taxi from the airport. Exit the airport and take the Airport Expressway south..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="directionsFromCity">Directions from City Center</Label>
                <Textarea
                  id="directionsFromCity"
                  value={formData.travelDirections?.directionsFromCity || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    travelDirections: { ...formData.travelDirections, directionsFromCity: e.target.value }
                  })}
                  placeholder="From city center, head south on Main Road for approximately 5 km..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="drivingDirections">Detailed Driving Directions</Label>
                <Textarea
                  id="drivingDirections"
                  value={formData.travelDirections?.drivingDirections || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    travelDirections: { ...formData.travelDirections, drivingDirections: e.target.value }
                  })}
                  placeholder="If driving from the south, continue north on Highway A2. Pass the beach and continue for 8 km..."
                  rows={3}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="nearestLandmark">Nearest Landmarks</Label>
                <Textarea
                  id="nearestLandmark"
                  value={formData.travelDirections?.nearestLandmark || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    travelDirections: { ...formData.travelDirections, nearestLandmark: e.target.value }
                  })}
                  placeholder="Located directly opposite City Park and next to the Shopping Mall..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nearbyAttractions">Nearby Attractions</Label>
                <Textarea
                  id="nearbyAttractions"
                  value={formData.travelDirections?.nearbyAttractions || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    travelDirections: { ...formData.travelDirections, nearbyAttractions: e.target.value }
                  })}
                  placeholder="Beach (50m walk), National Museum (2 km), Temple (3 km), Fort (2 km)..."
                  rows={2}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="transportationOptions">Transportation Options</Label>
                <Textarea
                  id="transportationOptions"
                  value={formData.travelDirections?.transportationOptions || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    travelDirections: { ...formData.travelDirections, transportationOptions: e.target.value }
                  })}
                  placeholder="Airport Taxi (LKR 2,500-3,000), Rideshare apps (Uber/PickMe), Public Bus #187..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxiFare">Estimated Taxi Fare from Airport</Label>
                  <Input
                    id="taxiFare"
                    value={formData.travelDirections?.taxiFare || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      travelDirections: { ...formData.travelDirections, taxiFare: e.target.value }
                    })}
                    placeholder="LKR 2,500-3,000 (approximately USD 8-10)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publicTransport">Public Transport Info</Label>
                  <Input
                    id="publicTransport"
                    value={formData.travelDirections?.publicTransport || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      travelDirections: { ...formData.travelDirections, publicTransport: e.target.value }
                    })}
                    placeholder="Bus #138 from airport (LKR 100, 100m from hotel)"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="shuttleService">Hotel Shuttle Service</Label>
                <Textarea
                  id="shuttleService"
                  value={formData.travelDirections?.shuttleService || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    travelDirections: { ...formData.travelDirections, shuttleService: e.target.value }
                  })}
                  placeholder="Complimentary airport shuttle for 3+ night stays. Request 24 hours in advance..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shuttleSchedule">Shuttle Schedule</Label>
                <Input
                  id="shuttleSchedule"
                  value={formData.travelDirections?.shuttleSchedule || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    travelDirections: { ...formData.travelDirections, shuttleSchedule: e.target.value }
                  })}
                  placeholder="Airport pickup: 9 AM, 12 PM, 3 PM, 6 PM | Drop-off: 7 AM, 10 AM, 1 PM, 4 PM"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="parkingInfo">Parking Information</Label>
                <Textarea
                  id="parkingInfo"
                  value={formData.travelDirections?.parkingInfo || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    travelDirections: { ...formData.travelDirections, parkingInfo: e.target.value }
                  })}
                  placeholder="Complimentary valet parking available 24/7. Self-parking with 150 covered spaces..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="localTravelTips">Local Travel Tips</Label>
                <Textarea
                  id="localTravelTips"
                  value={formData.travelDirections?.localTravelTips || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    travelDirections: { ...formData.travelDirections, localTravelTips: e.target.value }
                  })}
                  placeholder="Traffic is heavy 7-10 AM and 5-8 PM. Best travel times are mid-morning or after 8 PM..."
                  rows={3}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="googleMapsLink">Google Maps Link</Label>
                  <Input
                    id="googleMapsLink"
                    value={formData.travelDirections?.googleMapsLink || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      travelDirections: { ...formData.travelDirections, googleMapsLink: e.target.value }
                    })}
                    placeholder="https://maps.google.com/?q=Hotel+Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wazeLink">Waze Navigation Link</Label>
                  <Input
                    id="wazeLink"
                    value={formData.travelDirections?.wazeLink || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      travelDirections: { ...formData.travelDirections, wazeLink: e.target.value }
                    })}
                    placeholder="https://waze.com/ul?q=Hotel+Name"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-muted/30">
            <h3 className="text-sm font-semibold mb-3">💡 Pro Tip</h3>
            <p className="text-sm text-muted-foreground">
              Provide detailed, specific directions with landmarks that locals and tourists can easily recognize. 
              Include estimated travel times and costs in local currency. Update seasonal information (like traffic patterns) 
              to keep directions current and helpful year-round.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="invoice" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Invoice Settings</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceFooter">Invoice Footer Text</Label>
                <Textarea
                  id="invoiceFooter"
                  value={formData.invoiceFooter}
                  onChange={(e) => setFormData({ ...formData, invoiceFooter: e.target.value })}
                  placeholder="Thank you for choosing our hotel!"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="termsAndConditions">Terms & Conditions</Label>
                <Textarea
                  id="termsAndConditions"
                  value={formData.termsAndConditions}
                  onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                  placeholder="1. Payment is due upon receipt\n2. All rates are in LKR\n3. Applicable taxes will be added"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentInstructions">Payment Instructions</Label>
                <Textarea
                  id="paymentInstructions"
                  value={formData.paymentInstructions}
                  onChange={(e) => setFormData({ ...formData, paymentInstructions: e.target.value })}
                  placeholder="Please make payment via bank transfer or cash at the front desk"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showQRCode">Show QR Code on Invoices</Label>
                  <p className="text-sm text-muted-foreground">Display a QR code for payment or invoice verification</p>
                </div>
                <Switch
                  id="showQRCode"
                  checked={formData.showQRCode}
                  onCheckedChange={(checked) => setFormData({ ...formData, showQRCode: checked })}
                />
              </div>

              {formData.showQRCode && (
                <div className="space-y-2">
                  <Label htmlFor="qrCodeContent">QR Code Content</Label>
                  <Input
                    id="qrCodeContent"
                    value={formData.qrCodeContent}
                    onChange={(e) => setFormData({ ...formData, qrCodeContent: e.target.value })}
                    placeholder="Enter payment link or UPI ID"
                  />
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="banking" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Bank Details</h3>
            <p className="text-sm text-muted-foreground mb-4">
              These details will appear on invoices for direct bank transfer payments
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name *</Label>
                <Input
                  id="bankName"
                  value={formData.bankDetails.bankName}
                  onChange={(e) => setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, bankName: e.target.value }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name *</Label>
                <Input
                  id="accountName"
                  value={formData.bankDetails.accountName}
                  onChange={(e) => setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, accountName: e.target.value }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input
                  id="accountNumber"
                  value={formData.bankDetails.accountNumber}
                  onChange={(e) => setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, accountNumber: e.target.value }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="branchName">Branch Name</Label>
                <Input
                  id="branchName"
                  value={formData.bankDetails.branchName}
                  onChange={(e) => setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, branchName: e.target.value }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="branchCode">Branch Code</Label>
                <Input
                  id="branchCode"
                  value={formData.bankDetails.branchCode}
                  onChange={(e) => setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, branchCode: e.target.value }
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="swiftCode">SWIFT Code</Label>
                <Input
                  id="swiftCode"
                  value={formData.bankDetails.swiftCode}
                  onChange={(e) => setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, swiftCode: e.target.value }
                  })}
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
