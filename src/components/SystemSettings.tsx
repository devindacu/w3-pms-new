import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Gear, FloppyDisk, Trash, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { HotelBranding, SystemUser } from '@/lib/types'

interface SystemSettingsProps {
  branding: HotelBranding | null
  setBranding: (setter: (current: HotelBranding | null) => HotelBranding) => void
  currentUser: SystemUser
}

const currencyOptions = [
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs.' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
]

const dateFormats = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2024)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2024)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2024-12-31)' },
  { value: 'DD-MMM-YYYY', label: 'DD-MMM-YYYY (31-Dec-2024)' },
]

const timeFormats = [
  { value: '12h', label: '12-hour (02:30 PM)' },
  { value: '24h', label: '24-hour (14:30)' },
]

const timezones = [
  { value: 'Asia/Colombo', label: 'Asia/Colombo (GMT+5:30)' },
  { value: 'UTC', label: 'UTC (GMT+0:00)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
]

export function SystemSettings({ branding, setBranding, currentUser }: SystemSettingsProps) {
  const [currency, setCurrency] = useState(branding?.currency || 'LKR')
  const [currencySymbol, setCurrencySymbol] = useState(branding?.currencySymbol || 'Rs.')
  const [currencyPosition, setCurrencyPosition] = useState<'before' | 'after'>(
    branding?.currencyPosition || 'before'
  )
  const [decimalPlaces, setDecimalPlaces] = useState(branding?.decimalPlaces || 2)
  const [dateFormat, setDateFormat] = useState(branding?.dateFormat || 'DD/MM/YYYY')
  const [timeFormat, setTimeFormat] = useState(branding?.timeFormat || '12h')
  const [timezone, setTimezone] = useState(branding?.timezone || 'Asia/Colombo')

  const handleCurrencyChange = (code: string) => {
    const selectedCurrency = currencyOptions.find(c => c.code === code)
    if (selectedCurrency) {
      setCurrency(code)
      setCurrencySymbol(selectedCurrency.symbol)
    }
  }

  const handleSave = () => {
    const now = Date.now()
    
    if (branding) {
      setBranding(() => ({
        ...branding,
        currency,
        currencySymbol,
        currencyPosition,
        decimalPlaces,
        dateFormat,
        timeFormat,
        timezone,
        updatedAt: now,
        updatedBy: currentUser.id,
      }))
    } else {
      setBranding(() => ({
        id: `branding-${Date.now()}`,
        hotelName: 'W3 Hotel',
        hotelAddress: '123 Main Street',
        hotelCity: 'Colombo',
        hotelState: 'Western Province',
        hotelCountry: 'Sri Lanka',
        hotelPostalCode: '00100',
        hotelPhone: '+94 11 234 5678',
        hotelEmail: 'info@w3hotel.lk',
        hotelWebsite: 'www.w3hotel.lk',
        colorScheme: {
          primary: '#2c5f2d',
          secondary: '#97bc62',
          accent: '#4a7c59'
        },
        bankDetails: {
          bankName: 'Commercial Bank of Ceylon',
          accountName: 'W3 Hotel Pvt Ltd',
          accountNumber: '1234567890'
        },
        showQRCode: false,
        currency,
        currencySymbol,
        currencyPosition,
        decimalPlaces,
        dateFormat,
        timeFormat,
        timezone,
        createdAt: now,
        updatedAt: now,
        updatedBy: currentUser.id,
      }))
    }

    toast.success('System settings saved successfully')
  }

  const handleClearCache = () => {
    if (confirm('⚠️ WARNING: This will clear all browser cache and reload the application.\n\nAll unsaved data will be lost. Continue?')) {
      localStorage.clear()
      sessionStorage.clear()
      
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name)
          })
        }).then(() => {
          toast.success('Cache cleared successfully. Reloading...')
          setTimeout(() => {
            window.location.reload()
          }, 500)
        })
      } else {
        toast.success('Cache cleared successfully. Reloading...')
        setTimeout(() => {
          window.location.reload()
        }, 500)
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Gear size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">System Settings</h2>
            <p className="text-sm text-muted-foreground">Configure currency, date/time formats, and regional preferences</p>
          </div>
        </div>

        <Separator className="mb-6" />

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Currency Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyOptions.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.code} - {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency-symbol">Currency Symbol</Label>
                <Input
                  id="currency-symbol"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  placeholder="Rs."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency-position">Currency Position</Label>
                <Select value={currencyPosition} onValueChange={(v) => setCurrencyPosition(v as 'before' | 'after')}>
                  <SelectTrigger id="currency-position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before">Before Amount (Rs. 1,000)</SelectItem>
                    <SelectItem value="after">After Amount (1,000 Rs.)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="decimal-places">Decimal Places</Label>
                <Select value={decimalPlaces.toString()} onValueChange={(v) => setDecimalPlaces(parseInt(v))}>
                  <SelectTrigger id="decimal-places">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 (1000)</SelectItem>
                    <SelectItem value="2">2 (1000.00)</SelectItem>
                    <SelectItem value="3">3 (1000.000)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Preview:</p>
              <p className="text-lg">
                {currencyPosition === 'before' 
                  ? `${currencySymbol} ${(12345.67).toFixed(decimalPlaces)}`
                  : `${(12345.67).toFixed(decimalPlaces)} ${currencySymbol}`
                }
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Date & Time Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select value={dateFormat} onValueChange={setDateFormat}>
                  <SelectTrigger id="date-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dateFormats.map((fmt) => (
                      <SelectItem key={fmt.value} value={fmt.value}>
                        {fmt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-format">Time Format</Label>
                <Select value={timeFormat} onValueChange={setTimeFormat}>
                  <SelectTrigger id="time-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeFormats.map((fmt) => (
                      <SelectItem key={fmt.value} value={fmt.value}>
                        {fmt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Cache Management</h3>
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <Warning size={24} className="text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-warning-foreground">Clear Browser Cache</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This will clear all cached data, local storage, and session storage. 
                    The application will reload and all unsaved changes will be lost.
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleClearCache} 
                variant="destructive" 
                className="gap-2"
              >
                <Trash size={18} />
                Clear Cache & Reload
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2">
            <FloppyDisk size={18} />
            Save System Settings
          </Button>
        </div>
      </Card>
    </div>
  )
}
