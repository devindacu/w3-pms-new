import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { OTAConnection, OTAChannel } from '@/lib/types'

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
