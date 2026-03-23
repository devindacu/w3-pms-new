import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { ArrowSquareOut, ListNumbers } from '@phosphor-icons/react'
import type { OTAConnection, OTAChannel } from '@/lib/types'

interface OTAChannelGuide {
  label: string
  credentialsSteps: string[]
  reviewUrlSteps: string[]
  reviewUrlPlaceholder: string
  reviewUrlExample: string
  extranetUrl: string
}

const OTA_CHANNEL_GUIDES: Partial<Record<OTAChannel, OTAChannelGuide>> = {
  'booking.com': {
    label: 'Booking.com',
    credentialsSteps: [
      'Log in to the Booking.com Extranet at admin.booking.com.',
      'Go to "Account" → "Connectivity provider" or contact your connectivity partner.',
      'Your Property ID is shown in the URL or under "Property" → "Property details".',
      'Your API Key / XML credentials are provided by Booking.com Connectivity team — open a ticket via the Extranet if needed.',
    ],
    reviewUrlSteps: [
      'Log in to the Booking.com Extranet (admin.booking.com).',
      'Go to "Property" → "Property details" and click "View your property on Booking.com".',
      'Copy the URL from the browser address bar (e.g. booking.com/hotel/lk/my-hotel.html).',
      'Paste that URL in the Review URL field below.',
    ],
    reviewUrlPlaceholder: 'https://www.booking.com/hotel/lk/my-hotel.html',
    reviewUrlExample: 'https://www.booking.com/hotel/lk/grand-hotel.html',
    extranetUrl: 'https://admin.booking.com',
  },
  'agoda': {
    label: 'Agoda',
    credentialsSteps: [
      'Log in to the Agoda YCS (Yield Control System) at ycs.agoda.com.',
      'Your Property ID is shown in the top-right corner or URL after logging in.',
      'For API credentials, go to "Settings" → "Connectivity" or contact Agoda Partner Support.',
      'API keys are issued by Agoda — use the YCS Help Centre to request access.',
    ],
    reviewUrlSteps: [
      'Go to agoda.com and search for your property by name.',
      'Open your property listing page.',
      'Copy the URL from the browser address bar.',
      'It should look like: agoda.com/hotel-name/hotel/...',
    ],
    reviewUrlPlaceholder: 'https://www.agoda.com/hotel-name/hotel/...',
    reviewUrlExample: 'https://www.agoda.com/grand-hotel/hotel/city.html',
    extranetUrl: 'https://ycs.agoda.com',
  },
  'expedia': {
    label: 'Expedia',
    credentialsSteps: [
      'Log in to Expedia Partner Central at partner.expedia.com.',
      'Your Property ID is listed under "Property" → "Property summary".',
      'For API access, go to "Connectivity" → "API credentials" or contact your market manager.',
      'Expedia EPS (Expedia Partner Solutions) API keys are available from your account settings.',
    ],
    reviewUrlSteps: [
      'Log in to Expedia Partner Central and open your property summary.',
      'Click "View on Expedia" to open your public listing.',
      'Copy the URL from the browser address bar.',
      'It should look like: expedia.com/h/your-hotel-name.h12345.html',
    ],
    reviewUrlPlaceholder: 'https://www.expedia.com/h/my-hotel.h12345.html',
    reviewUrlExample: 'https://www.expedia.com/h/grand-hotel.h12345.html',
    extranetUrl: 'https://partner.expedia.com',
  },
  'airbnb': {
    label: 'Airbnb',
    credentialsSteps: [
      'Log in to your Airbnb host account at airbnb.com/hosting.',
      'Your Listing ID appears in the URL when you open a listing (e.g. airbnb.com/rooms/12345678).',
      'Airbnb API access requires approval — apply via developers.airbnb.com.',
      'Use the listing ID as Property ID and your Airbnb API token as the API Key.',
    ],
    reviewUrlSteps: [
      'Log in to airbnb.com and go to your Host Dashboard.',
      'Click "Listings" and open the listing you want to track.',
      'Click "View listing" to see the public page.',
      'Copy the URL — it should look like: airbnb.com/rooms/[listing-id]',
    ],
    reviewUrlPlaceholder: 'https://www.airbnb.com/rooms/12345678',
    reviewUrlExample: 'https://www.airbnb.com/rooms/12345678',
    extranetUrl: 'https://www.airbnb.com/hosting',
  },
  'makemytrip': {
    label: 'MakeMyTrip',
    credentialsSteps: [
      'Log in to the MakeMyTrip Partner Portal at mypartner.makemytrip.com.',
      'Your Hotel ID is shown under "My Hotels" → select your property.',
      'For API access, contact your MakeMyTrip Account Manager or raise a request via the partner portal.',
      'API credentials (username and password) are issued by the MakeMyTrip connectivity team.',
    ],
    reviewUrlSteps: [
      'Go to makemytrip.com and search for your hotel by name.',
      'Open your hotel listing and copy the URL from the browser.',
      'It should look like: makemytrip.com/hotels/hotel-details/?...',
    ],
    reviewUrlPlaceholder: 'https://www.makemytrip.com/hotels/hotel-details/?hotelId=...',
    reviewUrlExample: 'https://www.makemytrip.com/hotels/hotel-details/?hotelId=201409251128204099',
    extranetUrl: 'https://mypartner.makemytrip.com',
  },
  'goibibo': {
    label: 'Goibibo',
    credentialsSteps: [
      'Log in to the Goibibo Partner Portal at ibibo.com/partner.',
      'Your Hotel ID is available under "My Properties" in the dashboard.',
      'For API credentials, contact Goibibo partner support or your account manager.',
    ],
    reviewUrlSteps: [
      'Go to goibibo.com and search for your hotel.',
      'Open your hotel listing and copy the URL.',
      'It should look like: goibibo.com/hotels/hotel/your-hotel-name/...',
    ],
    reviewUrlPlaceholder: 'https://www.goibibo.com/hotels/hotel/my-hotel-name/...',
    reviewUrlExample: 'https://www.goibibo.com/hotels/hotel/grand-hotel-city/',
    extranetUrl: 'https://www.ibibo.com/partner',
  },
  'hotels.com': {
    label: 'Hotels.com',
    credentialsSteps: [
      'Hotels.com is part of the Expedia Group — log in to Expedia Partner Central at partner.expedia.com.',
      'Your Property ID and API credentials are shared across the Expedia Group platforms.',
      'Go to "Property" → "Property summary" to find your Hotel ID.',
      'API keys are available under "Connectivity" → "API credentials".',
    ],
    reviewUrlSteps: [
      'Go to hotels.com and search for your property.',
      'Open your listing page and copy the URL from the browser.',
      'It should look like: hotels.com/ho123456/your-hotel-name-city/',
    ],
    reviewUrlPlaceholder: 'https://www.hotels.com/ho123456/my-hotel-city/',
    reviewUrlExample: 'https://www.hotels.com/ho123456/grand-hotel-colombo/',
    extranetUrl: 'https://partner.expedia.com',
  },
}

interface OTAConnectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  connection?: OTAConnection
  onSave: (connection: OTAConnection) => void
  currentUser: { firstName: string; lastName: string }
}

export function OTAConnectionDialog({
  open,
  onOpenChange,
  connection,
  onSave,
  currentUser
}: OTAConnectionDialogProps) {
  const [formData, setFormData] = useState<Partial<OTAConnection>>({})

  useEffect(() => {
    if (connection) {
      setFormData(connection)
    } else {
      setFormData({
        isActive: true,
        autoSync: true,
        syncFrequency: 60,
        totalBookings: 0,
        totalRevenue: 0,
        commission: 15,
        syncSettings: {
          syncAvailability: true,
          syncRates: true,
          syncRestrictions: true,
          syncInventory: true,
          syncReservations: true,
          syncReviews: true
        }
      })
    }
  }, [connection, open])

  const handleSave = () => {
    const conn: OTAConnection = {
      id: connection?.id || `conn-${Date.now()}`,
      channel: formData.channel!,
      name: formData.name!,
      status: 'disconnected',
      apiKey: formData.apiKey,
      propertyId: formData.propertyId,
      accountId: formData.accountId,
      username: formData.username,
      reviewUrl: formData.reviewUrl,
      isActive: formData.isActive!,
      autoSync: formData.autoSync!,
      syncFrequency: formData.syncFrequency!,
      totalBookings: formData.totalBookings!,
      totalRevenue: formData.totalRevenue!,
      commission: formData.commission!,
      syncSettings: formData.syncSettings!,
      createdAt: connection?.createdAt || Date.now(),
      updatedAt: Date.now(),
      connectedBy: connection?.connectedBy || `${currentUser.firstName} ${currentUser.lastName}`
    }
    onSave(conn)
    onOpenChange(false)
  }

  const channelGuide = formData.channel ? OTA_CHANNEL_GUIDES[formData.channel] : undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{connection ? 'Edit' : 'Add'} OTA Connection</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="channel">Channel *</Label>
              <Select 
                value={formData.channel} 
                onValueChange={(v) => setFormData({ ...formData, channel: v as OTAChannel })}
                disabled={!!connection}
              >
                <SelectTrigger id="channel">
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="booking.com">Booking.com</SelectItem>
                  <SelectItem value="agoda">Agoda</SelectItem>
                  <SelectItem value="expedia">Expedia</SelectItem>
                  <SelectItem value="airbnb">Airbnb</SelectItem>
                  <SelectItem value="makemytrip">MakeMyTrip</SelectItem>
                  <SelectItem value="goibibo">Goibibo</SelectItem>
                  <SelectItem value="hotels.com">Hotels.com</SelectItem>
                  <SelectItem value="direct-website">Direct Website</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Display Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Booking.com"
              />
            </div>
          </div>

          {/* Platform connection guide */}
          {channelGuide && (
            <Card className="p-4 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <ListNumbers size={18} className="text-amber-700 dark:text-amber-300 flex-shrink-0" />
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                    How to connect {channelGuide.label}
                  </p>
                </div>
                <a
                  href={channelGuide.extranetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1 hover:underline shrink-0"
                >
                  Open {channelGuide.label}
                  <ArrowSquareOut size={12} />
                </a>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-xs text-amber-800 dark:text-amber-200">
                {channelGuide.credentialsSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyId">Property ID</Label>
              <Input
                id="propertyId"
                value={formData.propertyId || ''}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                placeholder="Property/Hotel ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountId">Account ID</Label>
              <Input
                id="accountId"
                value={formData.accountId || ''}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                placeholder="Account ID"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key / Password</Label>
            <Input
              id="apiKey"
              type="password"
              value={formData.apiKey || ''}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              placeholder="API Key or Password"
            />
          </div>

          {/* Review URL field with guide */}
          <div className="space-y-2">
            <Label htmlFor="reviewUrl">Review Page URL</Label>
            {channelGuide && (
              <Card className="p-3 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 mb-1">
                <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  How to find your {channelGuide.label} review URL
                </p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-blue-800 dark:text-blue-200">
                  {channelGuide.reviewUrlSteps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
                <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                  <span className="font-medium">Example: </span>
                  <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded text-[11px]">{channelGuide.reviewUrlExample}</code>
                </p>
              </Card>
            )}
            <Input
              id="reviewUrl"
              value={formData.reviewUrl || ''}
              onChange={(e) => setFormData({ ...formData, reviewUrl: e.target.value })}
              placeholder={channelGuide?.reviewUrlPlaceholder ?? 'https://...'}
            />
            <p className="text-xs text-muted-foreground">
              The public listing URL for this channel — used to sync real guest reviews.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commission">Commission (%)</Label>
              <Input
                id="commission"
                type="number"
                value={formData.commission || 0}
                onChange={(e) => setFormData({ ...formData, commission: parseFloat(e.target.value) })}
                placeholder="15"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="syncFrequency">Sync Frequency (minutes)</Label>
              <Input
                id="syncFrequency"
                type="number"
                value={formData.syncFrequency || 60}
                onChange={(e) => setFormData({ ...formData, syncFrequency: parseInt(e.target.value) })}
                placeholder="60"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Sync Settings</Label>
            <div className="space-y-2">
              {[
                { key: 'syncAvailability', label: 'Sync Availability' },
                { key: 'syncRates', label: 'Sync Rates & Pricing' },
                { key: 'syncRestrictions', label: 'Sync Restrictions' },
                { key: 'syncInventory', label: 'Sync Inventory' },
                { key: 'syncReservations', label: 'Sync Reservations' },
                { key: 'syncReviews', label: 'Sync Reviews' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key}>{label}</Label>
                  <Switch
                    id={key}
                    checked={formData.syncSettings?.[key as keyof typeof formData.syncSettings] || false}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        syncSettings: { ...formData.syncSettings!, [key]: checked }
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Active</Label>
            <Switch
              id="isActive"
              checked={formData.isActive || false}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="autoSync">Auto Sync</Label>
            <Switch
              id="autoSync"
              checked={formData.autoSync || false}
              onCheckedChange={(checked) => setFormData({ ...formData, autoSync: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!formData.channel || !formData.name}
          >
            {connection ? 'Update' : 'Add'} Connection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
