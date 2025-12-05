import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ChartBar, TrendUp, Users, Globe, MapPin, Star, Calendar, ChartPie } from '@phosphor-icons/react'
import type { GuestProfile, GuestFeedback } from '@/lib/types'
import { formatCurrency, formatPercent } from '@/lib/helpers'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Area,
  AreaChart
} from 'recharts'

interface GuestAnalyticsDashboardProps {
  guestProfiles: GuestProfile[]
  feedback: GuestFeedback[]
}

type TimeRange = '7d' | '30d' | '90d' | '365d' | 'all'
type ChartType = 'bar' | 'line' | 'area'

const COLORS = {
  primary: 'oklch(0.35 0.18 140)',
  secondary: 'oklch(0.45 0.15 120)',
  accent: 'oklch(0.55 0.12 130)',
  success: 'oklch(0.65 0.15 150)',
  warning: 'oklch(0.70 0.15 80)',
  destructive: 'oklch(0.50 0.20 15)',
  muted: 'oklch(0.45 0.08 140)',
  chart1: 'oklch(0.35 0.18 140)',
  chart2: 'oklch(0.45 0.15 120)',
  chart3: 'oklch(0.30 0.20 150)',
  chart4: 'oklch(0.55 0.12 130)',
  chart5: 'oklch(0.40 0.16 125)'
}

const PIE_COLORS = [COLORS.chart1, COLORS.chart2, COLORS.chart3, COLORS.chart4, COLORS.chart5]

export function GuestAnalyticsDashboard({ guestProfiles, feedback }: GuestAnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [demographicChartType, setDemographicChartType] = useState<ChartType>('bar')
  const [feedbackChartType, setFeedbackChartType] = useState<ChartType>('line')

  const getTimeRangeMs = (range: TimeRange): number => {
    const day = 24 * 60 * 60 * 1000
    switch (range) {
      case '7d': return 7 * day
      case '30d': return 30 * day
      case '90d': return 90 * day
      case '365d': return 365 * day
      case 'all': return Infinity
    }
  }

  const filterByTimeRange = <T extends { submittedAt?: number; createdAt?: number }>(items: T[]): T[] => {
    if (timeRange === 'all') return items
    const cutoff = Date.now() - getTimeRangeMs(timeRange)
    return items.filter(item => {
      const timestamp = item.submittedAt || item.createdAt || 0
      return timestamp >= cutoff
    })
  }

  const nationalityData = useMemo(() => {
    const counts: Record<string, number> = {}
    guestProfiles.forEach(guest => {
      const nationality = guest.nationality || 'Unknown'
      counts[nationality] = (counts[nationality] || 0) + 1
    })
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, percentage: (value / guestProfiles.length) * 100 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }, [guestProfiles])

  const segmentData = useMemo(() => {
    const counts: Record<string, number> = {}
    guestProfiles.forEach(guest => {
      guest.segments.forEach(segment => {
        counts[segment] = (counts[segment] || 0) + 1
      })
    })
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, percentage: (value / guestProfiles.length) * 100 }))
      .sort((a, b) => b.value - a.value)
  }, [guestProfiles])

  const loyaltyTierData = useMemo(() => {
    const counts: Record<string, number> = {}
    guestProfiles.forEach(guest => {
      const tier = guest.loyaltyInfo.tier || 'bronze'
      counts[tier] = (counts[tier] || 0) + 1
    })
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value, percentage: (value / guestProfiles.length) * 100 }))
      .sort((a, b) => {
        const tierOrder = { diamond: 4, platinum: 3, gold: 2, silver: 1, bronze: 0 }
        return (tierOrder[b.name as keyof typeof tierOrder] || 0) - (tierOrder[a.name as keyof typeof tierOrder] || 0)
      })
  }, [guestProfiles])

  const ageGroupData = useMemo(() => {
    const counts: Record<string, number> = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '56-65': 0,
      '65+': 0
    }
    
    guestProfiles.forEach(guest => {
      if (guest.dateOfBirth) {
        const age = Math.floor((Date.now() - guest.dateOfBirth) / (365.25 * 24 * 60 * 60 * 1000))
        if (age >= 18 && age <= 25) counts['18-25']++
        else if (age >= 26 && age <= 35) counts['26-35']++
        else if (age >= 36 && age <= 45) counts['36-45']++
        else if (age >= 46 && age <= 55) counts['46-55']++
        else if (age >= 56 && age <= 65) counts['56-65']++
        else if (age > 65) counts['65+']++
      }
    })
    
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [guestProfiles])

  const genderData = useMemo(() => {
    const counts: Record<string, number> = {}
    guestProfiles.forEach(guest => {
      const gender = (guest as any).gender
      if (gender) {
        counts[gender] = (counts[gender] || 0) + 1
      }
    })
    
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [guestProfiles])

  const feedbackTrendData = useMemo(() => {
    const filteredFeedback = filterByTimeRange(feedback)
    const groupedByMonth: Record<string, { total: number; sum: number; count: number }> = {}
    
    filteredFeedback.forEach(fb => {
      const date = new Date(fb.submittedAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!groupedByMonth[monthKey]) {
        groupedByMonth[monthKey] = { total: 0, sum: 0, count: 0 }
      }
      
      groupedByMonth[monthKey].count++
      groupedByMonth[monthKey].sum += fb.overallRating * 2
    })
    
    return Object.entries(groupedByMonth)
      .map(([month, data]) => ({
        month,
        averageRating: data.sum / data.count,
        reviewCount: data.count
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }, [feedback, timeRange])

  const sentimentTrendData = useMemo(() => {
    const filteredFeedback = filterByTimeRange(feedback)
    const groupedByMonth: Record<string, Record<string, number>> = {}
    
    filteredFeedback.forEach(fb => {
      const date = new Date(fb.submittedAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!groupedByMonth[monthKey]) {
        groupedByMonth[monthKey] = { positive: 0, neutral: 0, negative: 0 }
      }
      
      const sentiment = fb.sentiment || 'neutral'
      groupedByMonth[monthKey][sentiment] = (groupedByMonth[monthKey][sentiment] || 0) + 1
    })
    
    return Object.entries(groupedByMonth)
      .map(([month, sentiments]) => ({
        month,
        positive: sentiments.positive || 0,
        neutral: sentiments.neutral || 0,
        negative: sentiments.negative || 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }, [feedback, timeRange])

  const ratingDistributionData = useMemo(() => {
    const filteredFeedback = filterByTimeRange(feedback)
    const distribution: Record<string, number> = {
      '5 Stars': 0,
      '4 Stars': 0,
      '3 Stars': 0,
      '2 Stars': 0,
      '1 Star': 0
    }
    
    filteredFeedback.forEach(fb => {
      const rating = Math.round(fb.overallRating * 2)
      if (rating >= 9) distribution['5 Stars']++
      else if (rating >= 7) distribution['4 Stars']++
      else if (rating >= 5) distribution['3 Stars']++
      else if (rating >= 3) distribution['2 Stars']++
      else distribution['1 Star']++
    })
    
    return Object.entries(distribution).map(([name, value]) => ({ name, value }))
  }, [feedback, timeRange])

  const categoryRatingsData = useMemo(() => {
    const filteredFeedback = filterByTimeRange(feedback)
    
    if (filteredFeedback.length === 0) {
      return []
    }
    
    const categories = ['cleanliness', 'comfort', 'location', 'facilities', 'staff', 'valueForMoney'] as const
    
    return categories.map(category => {
      const sum = filteredFeedback.reduce((acc, fb) => {
        const categoryRatings = (fb as any).categoryRatings
        return acc + (categoryRatings?.[category] || 0)
      }, 0)
      const avg = (sum / filteredFeedback.length) * 2
      return {
        category: category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        rating: avg,
        fullMark: 10
      }
    })
  }, [feedback, timeRange])

  const reviewSourceData = useMemo(() => {
    const filteredFeedback = filterByTimeRange(feedback)
    const counts: Record<string, number> = {}
    
    filteredFeedback.forEach(fb => {
      counts[fb.reviewSource] = (counts[fb.reviewSource] || 0) + 1
    })
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [feedback, timeRange])

  const guestValueData = useMemo(() => {
    const sorted = [...guestProfiles]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)
    
    return sorted.map(guest => ({
      name: `${guest.firstName} ${guest.lastName}`,
      totalSpent: guest.totalSpent,
      stays: guest.totalStays,
      avgSpend: guest.averageSpendPerStay
    }))
  }, [guestProfiles])

  const acquisitionSourceData = useMemo(() => {
    const counts: Record<string, number> = {}
    guestProfiles.forEach(guest => {
      const source = guest.acquisitionSource || 'Direct'
      counts[source] = (counts[source] || 0) + 1
    })
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [guestProfiles])

  const stats = useMemo(() => {
    const filteredFeedback = filterByTimeRange(feedback)
    const avgRating = filteredFeedback.length > 0
      ? (filteredFeedback.reduce((sum, f) => sum + f.overallRating, 0) / filteredFeedback.length) * 2
      : 0
    
    const sentimentCounts = filteredFeedback.reduce((acc, f) => {
      const sentiment = f.sentiment || 'neutral'
      acc[sentiment] = (acc[sentiment] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalValue = guestProfiles.reduce((sum, g) => sum + g.totalSpent, 0)
    const avgLifetimeValue = guestProfiles.length > 0 ? totalValue / guestProfiles.length : 0

    return {
      totalGuests: guestProfiles.length,
      totalReviews: filteredFeedback.length,
      averageRating: avgRating.toFixed(1),
      positiveSentiment: sentimentCounts.positive || 0,
      neutralSentiment: sentimentCounts.neutral || 0,
      negativeSentiment: sentimentCounts.negative || 0,
      avgLifetimeValue,
      totalLifetimeValue: totalValue
    }
  }, [guestProfiles, feedback, timeRange])

  const renderChart = (data: any[], type: ChartType, dataKey: string, name: string) => {
    if (type === 'bar') {
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.05 140)" />
          <XAxis dataKey="name" stroke="oklch(0.45 0.08 140)" />
          <YAxis stroke="oklch(0.45 0.08 140)" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'oklch(0.99 0.003 140)', 
              border: '1px solid oklch(0.85 0.05 140)',
              borderRadius: '0.5rem'
            }} 
          />
          <Legend />
          <Bar dataKey={dataKey} fill={COLORS.chart1} name={name} />
        </BarChart>
      )
    } else if (type === 'line') {
      return (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.05 140)" />
          <XAxis dataKey="name" stroke="oklch(0.45 0.08 140)" />
          <YAxis stroke="oklch(0.45 0.08 140)" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'oklch(0.99 0.003 140)', 
              border: '1px solid oklch(0.85 0.05 140)',
              borderRadius: '0.5rem'
            }} 
          />
          <Legend />
          <Line type="monotone" dataKey={dataKey} stroke={COLORS.chart1} name={name} strokeWidth={2} />
        </LineChart>
      )
    } else {
      return (
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.05 140)" />
          <XAxis dataKey="name" stroke="oklch(0.45 0.08 140)" />
          <YAxis stroke="oklch(0.45 0.08 140)" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'oklch(0.99 0.003 140)', 
              border: '1px solid oklch(0.85 0.05 140)',
              borderRadius: '0.5rem'
            }} 
          />
          <Legend />
          <Area type="monotone" dataKey={dataKey} fill={COLORS.chart1} stroke={COLORS.chart1} name={name} />
        </AreaChart>
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Guest Analytics Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Visual insights into guest demographics and feedback trends
          </p>
        </div>
        <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="365d">Last Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Guests</p>
            <Users size={18} className="text-primary" />
          </div>
          <p className="text-3xl font-semibold">{stats.totalGuests}</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Average Rating</p>
            <Star size={18} className="text-accent" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-semibold">{stats.averageRating}</p>
            <p className="text-sm text-muted-foreground">/ 10</p>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-success">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total Reviews</p>
            <ChartBar size={18} className="text-success" />
          </div>
          <p className="text-3xl font-semibold">{stats.totalReviews}</p>
          <div className="flex gap-2 mt-2">
            <Badge className="text-xs bg-success/20 text-success border-success/30">
              {stats.positiveSentiment} Positive
            </Badge>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-chart2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Avg. Lifetime Value</p>
            <TrendUp size={18} className="text-chart-2" />
          </div>
          <p className="text-3xl font-semibold">{formatCurrency(stats.avgLifetimeValue)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Total: {formatCurrency(stats.totalLifetimeValue)}
          </p>
        </Card>
      </div>

      <Tabs defaultValue="demographics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="demographics">
            <Globe className="mr-2 h-4 w-4" />
            Demographics
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <Star className="mr-2 h-4 w-4" />
            Feedback Trends
          </TabsTrigger>
          <TabsTrigger value="behavior">
            <TrendUp className="mr-2 h-4 w-4" />
            Guest Behavior
          </TabsTrigger>
          <TabsTrigger value="value">
            <ChartBar className="mr-2 h-4 w-4" />
            Guest Value
          </TabsTrigger>
        </TabsList>

        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Top Nationalities</h3>
                <Select value={demographicChartType} onValueChange={(value) => setDemographicChartType(value as ChartType)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                {renderChart(nationalityData, demographicChartType, 'value', 'Guests')}
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Guest Segments</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={segmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {segmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'oklch(0.99 0.003 140)', 
                      border: '1px solid oklch(0.85 0.05 140)',
                      borderRadius: '0.5rem'
                    }} 
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Loyalty Tier Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={loyaltyTierData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.05 140)" />
                  <XAxis type="number" stroke="oklch(0.45 0.08 140)" />
                  <YAxis dataKey="name" type="category" stroke="oklch(0.45 0.08 140)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'oklch(0.99 0.003 140)', 
                      border: '1px solid oklch(0.85 0.05 140)',
                      borderRadius: '0.5rem'
                    }} 
                  />
                  <Bar dataKey="value" fill={COLORS.chart3} name="Guests" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Age Group Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ageGroupData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.05 140)" />
                  <XAxis dataKey="name" stroke="oklch(0.45 0.08 140)" />
                  <YAxis stroke="oklch(0.45 0.08 140)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'oklch(0.99 0.003 140)', 
                      border: '1px solid oklch(0.85 0.05 140)',
                      borderRadius: '0.5rem'
                    }} 
                  />
                  <Bar dataKey="value" fill={COLORS.chart4} name="Guests" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {genderData.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Gender Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'oklch(0.99 0.003 140)', 
                        border: '1px solid oklch(0.85 0.05 140)',
                        borderRadius: '0.5rem'
                      }} 
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </Card>
            )}

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Acquisition Sources</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={acquisitionSourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {acquisitionSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'oklch(0.99 0.003 140)', 
                      border: '1px solid oklch(0.85 0.05 140)',
                      borderRadius: '0.5rem'
                    }} 
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Rating Trend Over Time</h3>
                <Select value={feedbackChartType} onValueChange={(value) => setFeedbackChartType(value as ChartType)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={feedbackTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.05 140)" />
                  <XAxis dataKey="month" stroke="oklch(0.45 0.08 140)" />
                  <YAxis stroke="oklch(0.45 0.08 140)" domain={[0, 10]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'oklch(0.99 0.003 140)', 
                      border: '1px solid oklch(0.85 0.05 140)',
                      borderRadius: '0.5rem'
                    }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="averageRating" stroke={COLORS.chart1} name="Avg Rating" strokeWidth={2} />
                  <Line type="monotone" dataKey="reviewCount" stroke={COLORS.chart2} name="Review Count" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ratingDistributionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.05 140)" />
                  <XAxis type="number" stroke="oklch(0.45 0.08 140)" />
                  <YAxis dataKey="name" type="category" stroke="oklch(0.45 0.08 140)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'oklch(0.99 0.003 140)', 
                      border: '1px solid oklch(0.85 0.05 140)',
                      borderRadius: '0.5rem'
                    }} 
                  />
                  <Bar dataKey="value" fill={COLORS.success} name="Reviews" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Sentiment Analysis Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={sentimentTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.05 140)" />
                  <XAxis dataKey="month" stroke="oklch(0.45 0.08 140)" />
                  <YAxis stroke="oklch(0.45 0.08 140)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'oklch(0.99 0.003 140)', 
                      border: '1px solid oklch(0.85 0.05 140)',
                      borderRadius: '0.5rem'
                    }} 
                  />
                  <Legend />
                  <Area type="monotone" dataKey="positive" stackId="1" stroke={COLORS.success} fill={COLORS.success} name="Positive" />
                  <Area type="monotone" dataKey="neutral" stackId="1" stroke={COLORS.warning} fill={COLORS.warning} name="Neutral" />
                  <Area type="monotone" dataKey="negative" stackId="1" stroke={COLORS.destructive} fill={COLORS.destructive} name="Negative" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Category Ratings</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={categoryRatingsData}>
                  <PolarGrid stroke="oklch(0.85 0.05 140)" />
                  <PolarAngleAxis dataKey="category" stroke="oklch(0.45 0.08 140)" />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} stroke="oklch(0.45 0.08 140)" />
                  <Radar name="Rating" dataKey="rating" stroke={COLORS.chart1} fill={COLORS.chart1} fillOpacity={0.6} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'oklch(0.99 0.003 140)', 
                      border: '1px solid oklch(0.85 0.05 140)',
                      borderRadius: '0.5rem'
                    }} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Reviews by Source</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reviewSourceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.05 140)" />
                  <XAxis dataKey="name" stroke="oklch(0.45 0.08 140)" />
                  <YAxis stroke="oklch(0.45 0.08 140)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'oklch(0.99 0.003 140)', 
                      border: '1px solid oklch(0.85 0.05 140)',
                      borderRadius: '0.5rem'
                    }} 
                  />
                  <Bar dataKey="value" fill={COLORS.chart5} name="Reviews" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Stays Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={(() => {
                  const distribution: Record<string, number> = {
                    '1 Stay': 0,
                    '2-3 Stays': 0,
                    '4-5 Stays': 0,
                    '6-10 Stays': 0,
                    '10+ Stays': 0
                  }
                  
                  guestProfiles.forEach(guest => {
                    const stays = guest.totalStays
                    if (stays === 1) distribution['1 Stay']++
                    else if (stays <= 3) distribution['2-3 Stays']++
                    else if (stays <= 5) distribution['4-5 Stays']++
                    else if (stays <= 10) distribution['6-10 Stays']++
                    else distribution['10+ Stays']++
                  })
                  
                  return Object.entries(distribution).map(([name, value]) => ({ name, value }))
                })()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.05 140)" />
                  <XAxis dataKey="name" stroke="oklch(0.45 0.08 140)" />
                  <YAxis stroke="oklch(0.45 0.08 140)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'oklch(0.99 0.003 140)', 
                      border: '1px solid oklch(0.85 0.05 140)',
                      borderRadius: '0.5rem'
                    }} 
                  />
                  <Bar dataKey="value" fill={COLORS.chart2} name="Guests" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Spend Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={(() => {
                  const distribution: Record<string, number> = {
                    '$0-500': 0,
                    '$500-1K': 0,
                    '$1K-5K': 0,
                    '$5K-10K': 0,
                    '$10K+': 0
                  }
                  
                  guestProfiles.forEach(guest => {
                    const spent = guest.totalSpent
                    if (spent < 500) distribution['$0-500']++
                    else if (spent < 1000) distribution['$500-1K']++
                    else if (spent < 5000) distribution['$1K-5K']++
                    else if (spent < 10000) distribution['$5K-10K']++
                    else distribution['$10K+']++
                  })
                  
                  return Object.entries(distribution).map(([name, value]) => ({ name, value }))
                })()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.05 140)" />
                  <XAxis dataKey="name" stroke="oklch(0.45 0.08 140)" />
                  <YAxis stroke="oklch(0.45 0.08 140)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'oklch(0.99 0.003 140)', 
                      border: '1px solid oklch(0.85 0.05 140)',
                      borderRadius: '0.5rem'
                    }} 
                  />
                  <Bar dataKey="value" fill={COLORS.chart3} name="Guests" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="value" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top 10 Guests by Lifetime Value</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={guestValueData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.05 140)" />
                <XAxis type="number" stroke="oklch(0.45 0.08 140)" />
                <YAxis dataKey="name" type="category" stroke="oklch(0.45 0.08 140)" width={120} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'oklch(0.99 0.003 140)', 
                    border: '1px solid oklch(0.85 0.05 140)',
                    borderRadius: '0.5rem'
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="totalSpent" fill={COLORS.chart1} name="Total Spent" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Guests - Stays vs Spend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={guestValueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.05 140)" />
                  <XAxis dataKey="name" stroke="oklch(0.45 0.08 140)" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="oklch(0.45 0.08 140)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'oklch(0.99 0.003 140)', 
                      border: '1px solid oklch(0.85 0.05 140)',
                      borderRadius: '0.5rem'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="stays" fill={COLORS.chart2} name="Number of Stays" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Average Spend per Stay</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={guestValueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.85 0.05 140)" />
                  <XAxis dataKey="name" stroke="oklch(0.45 0.08 140)" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="oklch(0.45 0.08 140)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'oklch(0.99 0.003 140)', 
                      border: '1px solid oklch(0.85 0.05 140)',
                      borderRadius: '0.5rem'
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="avgSpend" fill={COLORS.chart4} name="Avg Spend per Stay" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
