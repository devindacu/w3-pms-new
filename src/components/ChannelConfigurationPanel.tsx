import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Key, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Clock,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';

interface ChannelConfig {
  id: string;
  channelName: string;
  enabled: boolean;
  apiKey: string;
  apiSecret?: string;
  propertyId: string;
  accountId?: string;
  autoSync: boolean;
  syncFrequency: number; // minutes
  lastSyncTime?: string;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  syncSettings: {
    syncAvailability: boolean;
    syncRates: boolean;
    syncReservations: boolean;
    syncReviews: boolean;
    syncPhotos: boolean;
  };
  notifications: {
    newBooking: boolean;
    cancellation: boolean;
    modification: boolean;
    review: boolean;
    syncError: boolean;
  };
}

export function ChannelConfigurationPanel() {
  const [channels, setChannels] = useState<ChannelConfig[]>([
    {
      id: 'booking-com',
      channelName: 'Booking.com',
      enabled: true,
      apiKey: '',
      propertyId: '',
      autoSync: true,
      syncFrequency: 15,
      lastSyncTime: new Date().toISOString(),
      syncStatus: 'success',
      syncSettings: {
        syncAvailability: true,
        syncRates: true,
        syncReservations: true,
        syncReviews: true,
        syncPhotos: false
      },
      notifications: {
        newBooking: true,
        cancellation: true,
        modification: true,
        review: false,
        syncError: true
      }
    },
    {
      id: 'agoda',
      channelName: 'Agoda',
      enabled: true,
      apiKey: '',
      apiSecret: '',
      propertyId: '',
      autoSync: true,
      syncFrequency: 15,
      lastSyncTime: new Date().toISOString(),
      syncStatus: 'success',
      syncSettings: {
        syncAvailability: true,
        syncRates: true,
        syncReservations: true,
        syncReviews: true,
        syncPhotos: false
      },
      notifications: {
        newBooking: true,
        cancellation: true,
        modification: true,
        review: false,
        syncError: true
      }
    },
    {
      id: 'airbnb',
      channelName: 'Airbnb',
      enabled: true,
      apiKey: '',
      apiSecret: '',
      propertyId: '',
      accountId: '',
      autoSync: true,
      syncFrequency: 15,
      lastSyncTime: new Date().toISOString(),
      syncStatus: 'success',
      syncSettings: {
        syncAvailability: true,
        syncRates: true,
        syncReservations: true,
        syncReviews: true,
        syncPhotos: true
      },
      notifications: {
        newBooking: true,
        cancellation: true,
        modification: true,
        review: true,
        syncError: true
      }
    }
  ]);

  const [activeChannel, setActiveChannel] = useState<string>('booking-com');

  const updateChannel = (channelId: string, updates: Partial<ChannelConfig>) => {
    setChannels(channels.map(ch => 
      ch.id === channelId ? { ...ch, ...updates } : ch
    ));
  };

  const testConnection = async (channelId: string) => {
    const channel = channels.find(ch => ch.id === channelId);
    if (!channel) return;

    if (!channel.apiKey || !channel.propertyId) {
      toast.error('Please fill in API credentials');
      return;
    }

    updateChannel(channelId, { syncStatus: 'syncing' });
    toast.info(`Testing connection to ${channel.channelName}...`);

    // Simulate API test
    setTimeout(() => {
      updateChannel(channelId, { 
        syncStatus: 'success',
        lastSyncTime: new Date().toISOString()
      });
      toast.success(`Connection to ${channel.channelName} successful!`);
    }, 2000);
  };

  const syncNow = async (channelId: string) => {
    const channel = channels.find(ch => ch.id === channelId);
    if (!channel) return;

    updateChannel(channelId, { syncStatus: 'syncing' });
    toast.info(`Syncing with ${channel.channelName}...`);

    // Simulate sync
    setTimeout(() => {
      updateChannel(channelId, { 
        syncStatus: 'success',
        lastSyncTime: new Date().toISOString()
      });
      toast.success(`Sync with ${channel.channelName} completed!`);
    }, 3000);
  };

  const saveConfiguration = (channelId: string) => {
    const channel = channels.find(ch => ch.id === channelId);
    if (!channel) return;

    toast.success(`Configuration saved for ${channel.channelName}`);
  };

  const activeChannelData = channels.find(ch => ch.id === activeChannel);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Channel Configuration</h1>
          <p className="text-muted-foreground mt-1">
            Configure and manage OTA channel connections and sync settings
          </p>
        </div>
        <Settings className="w-8 h-8 text-muted-foreground" />
      </div>

      <Separator />

      <Tabs value={activeChannel} onValueChange={setActiveChannel} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="booking-com">Booking.com</TabsTrigger>
          <TabsTrigger value="agoda">Agoda</TabsTrigger>
          <TabsTrigger value="airbnb">Airbnb</TabsTrigger>
        </TabsList>

        {activeChannelData && (
          <>
            <TabsContent value={activeChannelData.id} className="space-y-4">
              {/* Connection Status */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Connection Status</h2>
                  <div className="flex items-center gap-2">
                    {activeChannelData.syncStatus === 'success' && (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Connected
                      </Badge>
                    )}
                    {activeChannelData.syncStatus === 'syncing' && (
                      <Badge variant="secondary" className="gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Syncing
                      </Badge>
                    )}
                    {activeChannelData.syncStatus === 'error' && (
                      <Badge variant="destructive" className="gap-1">
                        <XCircle className="w-3 h-3" />
                        Error
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Last Sync</span>
                    </div>
                    <p className="font-medium">
                      {activeChannelData.lastSyncTime 
                        ? new Date(activeChannelData.lastSyncTime).toLocaleString()
                        : 'Never'}
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <RefreshCw className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Auto Sync</span>
                    </div>
                    <p className="font-medium">
                      {activeChannelData.autoSync ? `Every ${activeChannelData.syncFrequency} min` : 'Disabled'}
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Status</span>
                    </div>
                    <p className="font-medium">
                      {activeChannelData.enabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              </Card>

              {/* API Credentials */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  API Credentials
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${activeChannelData.id}-apiKey`}>API Key *</Label>
                    <Input
                      id={`${activeChannelData.id}-apiKey`}
                      type="password"
                      value={activeChannelData.apiKey}
                      onChange={(e) => updateChannel(activeChannelData.id, { apiKey: e.target.value })}
                      placeholder="Enter API key"
                    />
                  </div>
                  {activeChannelData.apiSecret !== undefined && (
                    <div className="space-y-2">
                      <Label htmlFor={`${activeChannelData.id}-apiSecret`}>API Secret</Label>
                      <Input
                        id={`${activeChannelData.id}-apiSecret`}
                        type="password"
                        value={activeChannelData.apiSecret || ''}
                        onChange={(e) => updateChannel(activeChannelData.id, { apiSecret: e.target.value })}
                        placeholder="Enter API secret"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor={`${activeChannelData.id}-propertyId`}>Property ID *</Label>
                    <Input
                      id={`${activeChannelData.id}-propertyId`}
                      value={activeChannelData.propertyId}
                      onChange={(e) => updateChannel(activeChannelData.id, { propertyId: e.target.value })}
                      placeholder="Enter property ID"
                    />
                  </div>
                  {activeChannelData.accountId !== undefined && (
                    <div className="space-y-2">
                      <Label htmlFor={`${activeChannelData.id}-accountId`}>Account ID</Label>
                      <Input
                        id={`${activeChannelData.id}-accountId`}
                        value={activeChannelData.accountId || ''}
                        onChange={(e) => updateChannel(activeChannelData.id, { accountId: e.target.value })}
                        placeholder="Enter account ID"
                      />
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <Button 
                    onClick={() => testConnection(activeChannelData.id)}
                    disabled={activeChannelData.syncStatus === 'syncing'}
                  >
                    {activeChannelData.syncStatus === 'syncing' ? 'Testing...' : 'Test Connection'}
                  </Button>
                </div>
              </Card>

              {/* Sync Settings */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Sync Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor={`${activeChannelData.id}-autoSync`} className="cursor-pointer">Auto Sync</Label>
                      <p className="text-sm text-muted-foreground">Automatically sync data at regular intervals</p>
                    </div>
                    <Switch
                      id={`${activeChannelData.id}-autoSync`}
                      checked={activeChannelData.autoSync}
                      onCheckedChange={(checked) => updateChannel(activeChannelData.id, { autoSync: checked })}
                    />
                  </div>

                  {activeChannelData.autoSync && (
                    <div className="space-y-2">
                      <Label htmlFor={`${activeChannelData.id}-syncFreq`}>Sync Frequency (minutes)</Label>
                      <Input
                        id={`${activeChannelData.id}-syncFreq`}
                        type="number"
                        min="5"
                        max="1440"
                        value={activeChannelData.syncFrequency}
                        onChange={(e) => updateChannel(activeChannelData.id, { syncFrequency: parseInt(e.target.value) || 15 })}
                      />
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="font-medium">Data to Sync</h3>
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${activeChannelData.id}-syncAvail`} className="cursor-pointer">Availability</Label>
                      <Switch
                        id={`${activeChannelData.id}-syncAvail`}
                        checked={activeChannelData.syncSettings.syncAvailability}
                        onCheckedChange={(checked) => updateChannel(activeChannelData.id, {
                          syncSettings: { ...activeChannelData.syncSettings, syncAvailability: checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${activeChannelData.id}-syncRates`} className="cursor-pointer">Rates</Label>
                      <Switch
                        id={`${activeChannelData.id}-syncRates`}
                        checked={activeChannelData.syncSettings.syncRates}
                        onCheckedChange={(checked) => updateChannel(activeChannelData.id, {
                          syncSettings: { ...activeChannelData.syncSettings, syncRates: checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${activeChannelData.id}-syncRes`} className="cursor-pointer">Reservations</Label>
                      <Switch
                        id={`${activeChannelData.id}-syncRes`}
                        checked={activeChannelData.syncSettings.syncReservations}
                        onCheckedChange={(checked) => updateChannel(activeChannelData.id, {
                          syncSettings: { ...activeChannelData.syncSettings, syncReservations: checked }
                        })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${activeChannelData.id}-syncReviews`} className="cursor-pointer">Reviews</Label>
                      <Switch
                        id={`${activeChannelData.id}-syncReviews`}
                        checked={activeChannelData.syncSettings.syncReviews}
                        onCheckedChange={(checked) => updateChannel(activeChannelData.id, {
                          syncSettings: { ...activeChannelData.syncSettings, syncReviews: checked }
                        })}
                      />
                    </div>
                    {activeChannelData.syncSettings.syncPhotos !== undefined && (
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`${activeChannelData.id}-syncPhotos`} className="cursor-pointer">Photos</Label>
                        <Switch
                          id={`${activeChannelData.id}-syncPhotos`}
                          checked={activeChannelData.syncSettings.syncPhotos}
                          onCheckedChange={(checked) => updateChannel(activeChannelData.id, {
                            syncSettings: { ...activeChannelData.syncSettings, syncPhotos: checked }
                          })}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Notifications */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Settings
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${activeChannelData.id}-notifBook`} className="cursor-pointer">New Booking</Label>
                    <Switch
                      id={`${activeChannelData.id}-notifBook`}
                      checked={activeChannelData.notifications.newBooking}
                      onCheckedChange={(checked) => updateChannel(activeChannelData.id, {
                        notifications: { ...activeChannelData.notifications, newBooking: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${activeChannelData.id}-notifCancel`} className="cursor-pointer">Cancellation</Label>
                    <Switch
                      id={`${activeChannelData.id}-notifCancel`}
                      checked={activeChannelData.notifications.cancellation}
                      onCheckedChange={(checked) => updateChannel(activeChannelData.id, {
                        notifications: { ...activeChannelData.notifications, cancellation: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${activeChannelData.id}-notifMod`} className="cursor-pointer">Modification</Label>
                    <Switch
                      id={`${activeChannelData.id}-notifMod`}
                      checked={activeChannelData.notifications.modification}
                      onCheckedChange={(checked) => updateChannel(activeChannelData.id, {
                        notifications: { ...activeChannelData.notifications, modification: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${activeChannelData.id}-notifReview`} className="cursor-pointer">New Review</Label>
                    <Switch
                      id={`${activeChannelData.id}-notifReview`}
                      checked={activeChannelData.notifications.review}
                      onCheckedChange={(checked) => updateChannel(activeChannelData.id, {
                        notifications: { ...activeChannelData.notifications, review: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${activeChannelData.id}-notifError`} className="cursor-pointer">Sync Errors</Label>
                    <Switch
                      id={`${activeChannelData.id}-notifError`}
                      checked={activeChannelData.notifications.syncError}
                      onCheckedChange={(checked) => updateChannel(activeChannelData.id, {
                        notifications: { ...activeChannelData.notifications, syncError: checked }
                      })}
                    />
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <Button onClick={() => saveConfiguration(activeChannelData.id)} className="flex-1">
                  Save Configuration
                </Button>
                <Button 
                  onClick={() => syncNow(activeChannelData.id)} 
                  variant="outline"
                  disabled={activeChannelData.syncStatus === 'syncing'}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${activeChannelData.syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                  Sync Now
                </Button>
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
