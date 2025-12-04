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
import { Buildings, Palette, FileText, Bank, UploadSimple, Image as ImageIcon, X, Eye } from '@phosphor-icons/react'
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
  const [showPreview, setShowPreview] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (branding) {
      setFormData(branding)
      if (branding.logo) {
        setLogoPreview(branding.logo)
      }
    }
  }, [branding])

  const handleSave = () => {
    setBranding(() => ({
      ...formData,
      updatedAt: Date.now(),
      updatedBy: currentUser.userId
    }))
    toast.success('Branding settings saved successfully')
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hotel">
            <Buildings size={16} className="mr-2" />
            Hotel Info
          </TabsTrigger>
          <TabsTrigger value="colors">
            <Palette size={16} className="mr-2" />
            Colors
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

            <Separator className="my-6" />

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
