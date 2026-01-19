import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useKV } from '@github/spark/hooks'
import type { 
  GoogleAnalyticsConfig,
  GoogleAnalyticsAudienceMetrics,
  GoogleAnalyticsAcquisitionMetrics 
} from '@/lib/types'
import {
  Globe,
  MagnifyingGlass,
  Users,
  Eye,
  Clock,
  DeviceMobile,
  TrendUp,
  TrendDown,
  ArrowsClockwise,
  Info,
  Gear
} from '@phosphor-icons/react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { formatPercent } from '@/lib/helpers'

interface GoogleAnalyticsDashboardProps {
  onNavigateToSettings: () => void
}

const CHART_COLORS = ['#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EF4444']

const generateMockAudienceData = (): GoogleAnalyticsAudienceMetrics[] => {
  const data: GoogleAnalyticsAudienceMetrics[] = []
  const now = Date.now()
  
  for (let i = 30; i >= 0; i--) {
    const date = now - i * 24 * 60 * 60 * 1000
    data.push({
      date,
      users: Math.floor(Math.random() * 500) + 300,
      newUsers: Math.floor(Math.random() * 200) + 100,
      sessions: Math.floor(Math.random() * 700) + 400,
      pageviews: Math.floor(Math.random() * 2000) + 1000,
      bounceRate: Math.random() * 0.4 + 0.3,
      avgSessionDuration: Math.random() * 200 + 100,
      pagesPerSession: Math.random() * 3 + 2,
      deviceCategory: {
        desktop: Math.floor(Math.random() * 300) + 150,
        mobile: Math.floor(Math.random() * 250) + 100,
        tablet: Math.floor(Math.random() * 100) + 30
      }
    })
  }
  
  return data
}

const generateMockAcquisitionData = (): GoogleAnalyticsAcquisitionMetrics[] => {
  const channels = [
    { channel: 'Organic Search', source: 'google', medium: 'organic' },
    { channel: 'Direct', source: '(direct)', medium: '(none)' },
    { channel: 'Social', source: 'facebook', medium: 'social' },
    { channel: 'Referral', source: 'booking.com', medium: 'referral' },
    { channel: 'Paid Search', source: 'google', medium: 'cpc' },
    { channel: 'Email', source: 'newsletter', medium: 'email' }
  ]
  
  return channels.map(ch => ({
    date: Date.now(),
    channel: ch.channel,
    source: ch.source,
    medium: ch.medium,
    users: Math.floor(Math.random() * 300) + 100,
    newUsers: Math.floor(Math.random() * 150) + 50,
    sessions: Math.floor(Math.random() * 400) + 150,
    bounceRate: Math.random() * 0.4 + 0.3,
    pagesPerSession: Math.random() * 3 + 2,
    avgSessionDuration: Math.random() * 200 + 100,
    goalCompletions: Math.floor(Math.random() * 50) + 10,
    goalConversionRate: Math.random() * 0.1 + 0.02,
    transactionRevenue: Math.random() * 5000 + 1000
  }))
}

export function GoogleAnalyticsDashboard({ onNavigateToSettings }: GoogleAnalyticsDashboardProps) {
  const [config] = useKV<GoogleAnalyticsConfig | null>('ga-config', null)
  const [isLoading, setIsLoading] = useState(false)
  const [audienceData, setAudienceData] = useState<GoogleAnalyticsAudienceMetrics[]>([])
  const [acquisitionData, setAcquisitionData] = useState<GoogleAnalyticsAcquisitionMetrics[]>([])
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now())

  const loadData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setAudienceData(generateMockAudienceData())
      setAcquisitionData(generateMockAcquisitionData())
      setIsLoading(false)
      setLastRefresh(Date.now())
    }, 1000)
  }

  useEffect(() => {
    loadData()
  }, [])

  const isConfigured = config && config.isActive && config.connectionStatus === 'connected'
  const latestAudience = audienceData[audienceData.length - 1]
  const totalUsers = audienceData.reduce((sum, d) => sum + d.users, 0)
  const totalSessions = audienceData.reduce((sum, d) => sum + d.sessions, 0)
  const totalPageviews = audienceData.reduce((sum, d) => sum + d.pageviews, 0)
  const avgBounceRate = audienceData.length > 0 
    ? audienceData.reduce((sum, d) => sum + d.bounceRate, 0) / audienceData.length 
    : 0

  const chartData = audienceData.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    users: d.users,
    sessions: d.sessions,
    pageviews: d.pageviews
  }))

  const deviceData = latestAudience?.deviceCategory ? [
    { name: 'Desktop', value: latestAudience.deviceCategory.desktop },
    { name: 'Mobile', value: latestAudience.deviceCategory.mobile },
    { name: 'Tablet', value: latestAudience.deviceCategory.tablet }
  ] : []

  if (!isConfigured) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Google Analytics</h2>
            <p className="text-muted-foreground mt-1">Track audience and acquisition metrics</p>
          </div>
        </div>

        <Card className="p-12 text-center">
          <Globe size={64} className="mx-auto text-primary mb-4" />
          <h3 className="text-xl font-semibold mb-2">Google Analytics Not Connected</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Connect your Google Analytics account to view audience insights, traffic sources, and user behavior data.
          </p>
          <Button onClick={onNavigateToSettings} size="lg" className="gap-2">
            <Gear size={20} />
            Configure Google Analytics
          </Button>
        </Card>

        <Alert>
          <Info size={18} className="text-primary" />
          <AlertDescription>
            <strong>Preview Mode:</strong> The data shown below is simulated for demonstration purposes.
            Connect your Google Analytics account to see real data.
          </AlertDescription>
        </Alert>

        {renderDashboard()}
      </div>
    )
  }

  function renderDashboard() {
    return (
      <Tabs defaultValue="audience" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="audience" className="gap-2">
              <Users size={18} />
              Audience
            </TabsTrigger>
            <TabsTrigger value="acquisition" className="gap-2">
              <MagnifyingGlass size={18} />
              Acquisition
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Last updated: {new Date(lastRefresh).toLocaleTimeString()}
            </span>
            <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading} className="gap-2">
              <ArrowsClockwise size={16} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </Button>
          </div>
        </div>

        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 border-l-4 border-l-primary">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
                <Users size={20} className="text-primary" />
              </div>
              <p className="text-3xl font-semibold">{totalUsers.toLocaleString()}</p>
              <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
                <TrendUp size={16} weight="bold" />
                <span>12.5% vs last period</span>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-secondary">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Sessions</h3>
                <Eye size={20} className="text-secondary" />
              </div>
              <p className="text-3xl font-semibold">{totalSessions.toLocaleString()}</p>
              <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
                <TrendUp size={16} weight="bold" />
                <span>8.3% vs last period</span>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-accent">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Pageviews</h3>
                <Eye size={20} className="text-accent" />
              </div>
              <p className="text-3xl font-semibold">{totalPageviews.toLocaleString()}</p>
              <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
                <TrendUp size={16} weight="bold" />
                <span>15.7% vs last period</span>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-destructive">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Bounce Rate</h3>
                <Clock size={20} className="text-destructive" />
              </div>
              <p className="text-3xl font-semibold">{formatPercent(avgBounceRate)}</p>
              <div className="mt-2 flex items-center gap-1 text-sm text-red-600">
                <TrendDown size={16} weight="bold" />
                <span>3.2% vs last period</span>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">User Trends (Last 30 Days)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.020 265)" />
                  <XAxis dataKey="date" stroke="oklch(0.68 0.015 265)" style={{ fontSize: '12px' }} />
                  <YAxis stroke="oklch(0.68 0.015 265)" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'oklch(0.18 0.015 265)',
                      border: '1px solid oklch(0.28 0.020 265)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#7C3AED" 
                    fill="url(#colorUsers)" 
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="#06B6D4" 
                    fill="url(#colorSessions)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Device Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Session Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Avg. Session Duration</p>
                <p className="text-2xl font-semibold">
                  {latestAudience ? Math.floor(latestAudience.avgSessionDuration / 60) : 0}m{' '}
                  {latestAudience ? Math.floor(latestAudience.avgSessionDuration % 60) : 0}s
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Pages per Session</p>
                <p className="text-2xl font-semibold">
                  {latestAudience ? latestAudience.pagesPerSession.toFixed(2) : '0.00'}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">New Users</p>
                <p className="text-2xl font-semibold">
                  {latestAudience ? latestAudience.newUsers.toLocaleString() : '0'}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="acquisition" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Traffic Channels</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={acquisitionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.020 265)" />
                <XAxis dataKey="channel" stroke="oklch(0.68 0.015 265)" style={{ fontSize: '12px' }} />
                <YAxis stroke="oklch(0.68 0.015 265)" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'oklch(0.18 0.015 265)',
                    border: '1px solid oklch(0.28 0.020 265)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="users" fill="#7C3AED" name="Users" radius={[8, 8, 0, 0]} />
                <Bar dataKey="sessions" fill="#06B6D4" name="Sessions" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Channel Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Channel</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Users</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Sessions</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Bounce Rate</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {acquisitionData.map((item, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium">{item.channel}</p>
                          <p className="text-xs text-muted-foreground">{item.source} / {item.medium}</p>
                        </div>
                      </td>
                      <td className="text-right py-3 px-2">{item.users.toLocaleString()}</td>
                      <td className="text-right py-3 px-2">{item.sessions.toLocaleString()}</td>
                      <td className="text-right py-3 px-2">{formatPercent(item.bounceRate)}</td>
                      <td className="text-right py-3 px-2">{formatPercent(item.goalConversionRate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Sources</h3>
              <div className="space-y-3">
                {acquisitionData.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                      <span className="font-medium">{item.source}</span>
                    </div>
                    <span className="text-muted-foreground">{item.users} users</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Conversion Overview</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Conversions</span>
                    <span className="font-semibold">
                      {acquisitionData.reduce((sum, d) => sum + d.goalCompletions, 0)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: '75%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Avg. Conversion Rate</span>
                    <span className="font-semibold">
                      {formatPercent(acquisitionData.reduce((sum, d) => sum + d.goalConversionRate, 0) / acquisitionData.length)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: '45%' }} />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Google Analytics</h2>
          <p className="text-muted-foreground mt-1">Track audience and acquisition metrics</p>
        </div>
        {isConfigured && (
          <Badge className="gap-1 bg-green-100 text-green-800">
            <Globe size={16} weight="fill" />
            Connected
          </Badge>
        )}
      </div>

      {renderDashboard()}
    </div>
  )
}
