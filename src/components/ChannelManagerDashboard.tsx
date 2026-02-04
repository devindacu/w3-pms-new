import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Link,
  LinkBreak,
  CheckCircle,
  Warning,
  ArrowsClockwise,
  TrendUp,
  TrendDown,
  CurrencyDollar,
  Users,
  Star,
  Calendar,
  ChartBar,
  Bell,
  Settings,
  Play,
  Pause,
  Eye,
  EyeSlash,
  Plus,
  Sparkle,
} from '@phosphor-icons/react';
import { 
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';
import { useKV } from '@/hooks/use-kv';
import { cn } from '@/lib/utils';

interface ChannelConfig {
  id: string;
  name: string;
  logo?: string;
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  credentials: {
    apiKey?: string;
    apiSecret?: string;
    propertyId?: string;
    hotelId?: string;
  };
  syncSettings: {
    autoSync: boolean;
    syncFrequency: number;
    syncAvailability: boolean;
    syncRates: boolean;
    syncReservations: boolean;
    syncReviews: boolean;
  };
  lastSync?: string;
  stats: {
    totalBookings: number;
    revenue: number;
    occupancy: number;
    avgRating: number;
    pendingReservations: number;
  };
}

interface ChannelPerformance {
  channel: string;
  bookings: number;
  revenue: number;
  growth: number;
  commission: number;
}

export function ChannelManagerDashboard() {
  const [channels, setChannels] = useKV<ChannelConfig[]>('channelConfigs', [
    {
      id: 'booking-com',
      name: 'Booking.com',
      enabled: true,
      status: 'connected',
      credentials: { propertyId: 'PROP123' },
      syncSettings: {
        autoSync: true,
        syncFrequency: 15,
        syncAvailability: true,
        syncRates: true,
        syncReservations: true,
        syncReviews: true,
      },
      lastSync: new Date().toISOString(),
      stats: {
        totalBookings: 156,
        revenue: 45600,
        occupancy: 78,
        avgRating: 4.5,
        pendingReservations: 8,
      },
    },
    {
      id: 'airbnb',
      name: 'Airbnb',
      enabled: true,
      status: 'connected',
      credentials: { apiKey: 'AIR_KEY' },
      syncSettings: {
        autoSync: true,
        syncFrequency: 30,
        syncAvailability: true,
        syncRates: true,
        syncReservations: true,
        syncReviews: true,
      },
      lastSync: new Date().toISOString(),
      stats: {
        totalBookings: 89,
        revenue: 28900,
        occupancy: 65,
        avgRating: 4.7,
        pendingReservations: 5,
      },
    },
    {
      id: 'expedia',
      name: 'Expedia',
      enabled: false,
      status: 'disconnected',
      credentials: {},
      syncSettings: {
        autoSync: false,
        syncFrequency: 15,
        syncAvailability: true,
        syncRates: true,
        syncReservations: true,
        syncReviews: false,
      },
      stats: {
        totalBookings: 0,
        revenue: 0,
        occupancy: 0,
        avgRating: 0,
        pendingReservations: 0,
      },
    },
    {
      id: 'agoda',
      name: 'Agoda',
      enabled: true,
      status: 'connected',
      credentials: { hotelId: 'HTL456' },
      syncSettings: {
        autoSync: true,
        syncFrequency: 20,
        syncAvailability: true,
        syncRates: true,
        syncReservations: true,
        syncReviews: true,
      },
      lastSync: new Date().toISOString(),
      stats: {
        totalBookings: 67,
        revenue: 19800,
        occupancy: 58,
        avgRating: 4.3,
        pendingReservations: 3,
      },
    },
  ]);

  const [selectedChannel, setSelectedChannel] = useState<ChannelConfig | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Calculate aggregate metrics
  const metrics = useMemo(() => {
    const active = channels.filter((c) => c.enabled);
    return {
      totalChannels: channels.length,
      activeChannels: active.length,
      totalBookings: active.reduce((sum, c) => sum + c.stats.totalBookings, 0),
      totalRevenue: active.reduce((sum, c) => sum + c.stats.revenue, 0),
      avgOccupancy: active.length > 0 
        ? active.reduce((sum, c) => sum + c.stats.occupancy, 0) / active.length 
        : 0,
      pendingReservations: active.reduce((sum, c) => sum + c.stats.pendingReservations, 0),
    };
  }, [channels]);

  // Performance data for charts
  const performanceData: ChannelPerformance[] = useMemo(() => {
    return channels
      .filter((c) => c.enabled)
      .map((c) => ({
        channel: c.name,
        bookings: c.stats.totalBookings,
        revenue: c.stats.revenue,
        growth: Math.random() * 20 - 5, // Mock data
        commission: c.stats.revenue * 0.15, // Mock 15% commission
      }));
  }, [channels]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-success/10 text-success border-success/20">
            <CheckCircle size={14} weight="fill" className="mr-1" />
            Connected
          </Badge>
        );
      case 'syncing':
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            <ArrowsClockwise size={14} weight="fill" className="mr-1 animate-spin" />
            Syncing
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <Warning size={14} weight="fill" className="mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <LinkBreak size={14} className="mr-1" />
            Disconnected
          </Badge>
        );
    }
  };

  const handleSync = (channelId: string) => {
    setChannels((prev) =>
      prev.map((c) =>
        c.id === channelId
          ? { ...c, status: 'syncing' as const, lastSync: new Date().toISOString() }
          : c
      )
    );

    toast.info(`Syncing ${channels.find((c) => c.id === channelId)?.name}...`);

    setTimeout(() => {
      setChannels((prev) =>
        prev.map((c) => (c.id === channelId ? { ...c, status: 'connected' as const } : c))
      );
      toast.success('Sync completed successfully');
    }, 2000);
  };

  const toggleChannel = (channelId: string) => {
    setChannels((prev) =>
      prev.map((c) =>
        c.id === channelId
          ? {
              ...c,
              enabled: !c.enabled,
              status: !c.enabled ? 'connected' as const : 'disconnected' as const,
            }
          : c
      )
    );
  };

  const COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Channel Manager</h1>
          <p className="text-muted-foreground">
            Manage your OTA integrations and monitor performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(val: any) => setTimeRange(val)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Plus size={20} weight="bold" className="mr-2" />
            Add Channel
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Channels</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" weight="fill" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.activeChannels}/{metrics.totalChannels}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalChannels - metrics.activeChannels} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" weight="fill" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalBookings}</div>
            <p className="text-xs text-success flex items-center gap-1">
              <TrendUp size={12} weight="fill" />
              +12.5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CurrencyDollar className="h-4 w-4 text-muted-foreground" weight="fill" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-success flex items-center gap-1">
              <TrendUp size={12} weight="fill" />
              +8.3% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Occupancy</CardTitle>
            <ChartBar className="h-4 w-4 text-muted-foreground" weight="fill" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgOccupancy.toFixed(1)}%</div>
            <Progress value={metrics.avgOccupancy} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Revenue by Channel */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Channel</CardTitle>
                <CardDescription>Revenue distribution across all channels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={performanceData}
                      dataKey="revenue"
                      nameKey="channel"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {performanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bookings by Channel */}
            <Card>
              <CardHeader>
                <CardTitle>Bookings by Channel</CardTitle>
                <CardDescription>Booking distribution and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#7C3AED" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Pending Reservations */}
          {metrics.pendingReservations > 0 && (
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell size={20} weight="fill" className="text-blue-600" />
                  Pending Reservations
                </CardTitle>
                <CardDescription>
                  You have {metrics.pendingReservations} new reservations waiting for confirmation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Review Reservations</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {channels.map((channel) => (
              <Card
                key={channel.id}
                className={cn(
                  'transition-all hover:shadow-lg',
                  !channel.enabled && 'opacity-60'
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {channel.name}
                      </CardTitle>
                      {getStatusBadge(channel.status)}
                    </div>
                    <Switch
                      checked={channel.enabled}
                      onCheckedChange={() => toggleChannel(channel.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats Grid */}
                  {channel.enabled && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Bookings</p>
                        <p className="text-lg font-bold">{channel.stats.totalBookings}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="text-lg font-bold">
                          ${(channel.stats.revenue / 1000).toFixed(1)}k
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Occupancy</p>
                        <p className="text-lg font-bold">{channel.stats.occupancy}%</p>
                      </div>
                      <div className="space-y-1 flex items-center gap-1">
                        <Star size={16} weight="fill" className="text-yellow-500" />
                        <p className="text-lg font-bold">{channel.stats.avgRating}</p>
                      </div>
                    </div>
                  )}

                  {/* Last Sync */}
                  {channel.lastSync && channel.enabled && (
                    <div className="text-xs text-muted-foreground">
                      Last synced:{' '}
                      {new Date(channel.lastSync).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {channel.enabled && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleSync(channel.id)}
                        disabled={channel.status === 'syncing'}
                      >
                        <ArrowsClockwise
                          size={16}
                          className={cn(channel.status === 'syncing' && 'animate-spin')}
                        />
                        Sync
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSelectedChannel(channel);
                        setConfigDialogOpen(true);
                      }}
                    >
                      <Settings size={16} />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Channel Performance Comparison</CardTitle>
              <CardDescription>
                Compare key metrics across all active channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.map((channel, index) => (
                  <div key={channel.channel} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{channel.channel}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          {channel.bookings} bookings
                        </span>
                        <span className="font-bold">
                          ${channel.revenue.toLocaleString()}
                        </span>
                        <span
                          className={cn(
                            'flex items-center gap-1',
                            channel.growth >= 0 ? 'text-success' : 'text-destructive'
                          )}
                        >
                          {channel.growth >= 0 ? (
                            <TrendUp size={16} weight="fill" />
                          ) : (
                            <TrendDown size={16} weight="fill" />
                          )}
                          {Math.abs(channel.growth).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={(channel.revenue / metrics.totalRevenue) * 100}
                      className="h-2"
                      style={{
                        ['--progress-background' as any]: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Commission Analysis</CardTitle>
                <CardDescription>Total commission paid to channels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="commission" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Trends</CardTitle>
                <CardDescription>Month-over-month growth by channel</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                    <Bar dataKey="growth" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Sync Settings</CardTitle>
              <CardDescription>
                Configure synchronization settings for all channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-sync all channels</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync data at regular intervals
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sync notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when sync completes or fails
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Conflict resolution</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically resolve data conflicts
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Bulk operations for all channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <ArrowsClockwise size={18} className="mr-2" />
                Sync All Channels
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Sparkle size={18} className="mr-2" />
                Update All Rates
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar size={18} className="mr-2" />
                Update Availability
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Configure {selectedChannel?.name}</DialogTitle>
            <DialogDescription>
              Update channel settings and credentials
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            {selectedChannel && (
              <div className="space-y-6">
                {/* Credentials */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Credentials</h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <Input
                        type="password"
                        placeholder="Enter API key"
                        defaultValue={selectedChannel.credentials.apiKey}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Property ID</Label>
                      <Input
                        placeholder="Enter property ID"
                        defaultValue={selectedChannel.credentials.propertyId}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Sync Settings */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Sync Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Auto-sync</Label>
                      <Switch defaultChecked={selectedChannel.syncSettings.autoSync} />
                    </div>
                    <div className="space-y-2">
                      <Label>Sync Frequency (minutes)</Label>
                      <Input
                        type="number"
                        defaultValue={selectedChannel.syncSettings.syncFrequency}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Sync Availability</Label>
                      <Switch defaultChecked={selectedChannel.syncSettings.syncAvailability} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Sync Rates</Label>
                      <Switch defaultChecked={selectedChannel.syncSettings.syncRates} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Sync Reservations</Label>
                      <Switch defaultChecked={selectedChannel.syncSettings.syncReservations} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Sync Reviews</Label>
                      <Switch defaultChecked={selectedChannel.syncSettings.syncReviews} />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex gap-2">
                  <Button className="flex-1">Save Changes</Button>
                  <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
