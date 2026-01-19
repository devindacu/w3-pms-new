import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine
} from 'recharts'
import { 
  TrendUp, 
  TrendDown, 
  Sparkle,
  Calendar, 
  CurrencyDollar,
  Bed,
  ChartBar,
  ArrowsClockwise,
  Download,
  Info,
  Lightbulb,
  Warning
} from '@phosphor-icons/react'
import { formatCurrency, formatPercent } from '@/lib/helpers'
import type { Reservation, GuestInvoice, RoomTypeConfig, RatePlanConfig, Room } from '@/lib/types'
import {
  analyzeRoomTypePerformance,
  generateRevenueForecast,
  calculateForecastMetrics,
  identifySeasonalPatterns,
  predictOptimalPricing,
  generateRevenueScenarios,
  type RoomTypePerformance,
  type ForecastPeriod
} from '@/lib/revenueForecastingHelpers'

interface RevenueForecastingProps {
  reservations: Reservation[]
  invoices: GuestInvoice[]
  rooms: Room[]
  roomTypes: RoomTypeConfig[]
  ratePlans?: RatePlanConfig[]
}

type ForecastRange = '7d' | '14d' | '30d' | '60d' | '90d'
type ScenarioType = 'realistic' | 'optimistic' | 'conservative'

export function RevenueForecasting({ 
  reservations, 
  invoices,
  rooms,
  roomTypes,
  ratePlans = []
}: RevenueForecastingProps) {
  const [forecastRange, setForecastRange] = useState<ForecastRange>('30d')
  const [scenario, setScenario] = useState<ScenarioType>('realistic')
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all')

  const getForecastDays = (range: ForecastRange): number => {
    switch (range) {
      case '7d': return 7
      case '14d': return 14
      case '30d': return 30
      case '60d': return 60
      case '90d': return 90
      default: return 30
    }
  }

  const performance = useMemo(() => {
    return analyzeRoomTypePerformance(
      reservations,
      roomTypes,
      invoices,
      90,
      rooms
    )
  }, [reservations, roomTypes, invoices, rooms])

  const baseForecast = useMemo(() => {
    return generateRevenueForecast(
      reservations,
      roomTypes,
      invoices,
      getForecastDays(forecastRange),
      rooms.length
    )
  }, [reservations, roomTypes, invoices, forecastRange, rooms.length])

  const scenarios = useMemo(() => {
    return generateRevenueScenarios(baseForecast)
  }, [baseForecast])

  const currentForecast = scenarios[scenario]

  const metrics = useMemo(() => {
    return calculateForecastMetrics(currentForecast, performance)
  }, [currentForecast, performance])

  const seasonalPatterns = useMemo(() => {
    return identifySeasonalPatterns(reservations, 2)
  }, [reservations])

  const optimalPricing = useMemo(() => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    return predictOptimalPricing(performance, seasonalPatterns, futureDate)
  }, [performance, seasonalPatterns])

  const chartData = useMemo(() => {
    if (selectedRoomType === 'all') {
      return currentForecast.map(f => ({
        date: f.date,
        revenue: f.predictedRevenue,
        occupancy: f.predictedOccupancy,
        lowerBound: f.lowerBound,
        upperBound: f.upperBound,
        confidence: f.confidenceLevel
      }))
    } else {
      return currentForecast.map(f => {
        const rtForecast = f.roomTypeForecasts.find(rt => rt.roomTypeId === selectedRoomType)
        return {
          date: f.date,
          revenue: rtForecast?.predictedRevenue || 0,
          occupancy: rtForecast?.predictedOccupancy || 0,
          bookings: rtForecast?.predictedBookings || 0,
          adr: rtForecast?.predictedADR || 0
        }
      })
    }
  }, [currentForecast, selectedRoomType])

  const performanceData = useMemo(() => {
    return performance.map(p => ({
      name: p.roomTypeName,
      revenue: p.totalRevenue,
      occupancy: p.occupancyRate,
      adr: p.averageDailyRate,
      revPAR: p.revenuePerAvailableRoom,
      growth: p.growthRate
    }))
  }, [performance])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">{entry.name}:</span>
              </div>
              <span className="font-medium">
                {entry.name.toLowerCase().includes('revenue') || entry.name.toLowerCase().includes('adr') || entry.name.toLowerCase().includes('revpar')
                  ? formatCurrency(entry.value)
                  : entry.name.toLowerCase().includes('occupancy') || entry.name.toLowerCase().includes('confidence') || entry.name.toLowerCase().includes('growth')
                  ? `${entry.value.toFixed(1)}%`
                  : entry.value.toFixed(1)
                }
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Predicted Revenue', 'Predicted Occupancy', 'Lower Bound', 'Upper Bound', 'Confidence Level'],
      ...currentForecast.map(f => [
        f.date,
        f.predictedRevenue.toFixed(2),
        f.predictedOccupancy.toFixed(2),
        f.lowerBound.toFixed(2),
        f.upperBound.toFixed(2),
        f.confidenceLevel.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `revenue-forecast-${forecastRange}-${scenario}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Sparkle size={32} className="text-primary" />
            <h2 className="text-2xl md:text-3xl font-semibold">Predictive Revenue Forecasting</h2>
          </div>
          <p className="text-muted-foreground mt-1">AI-powered predictions based on historical room type performance</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={forecastRange} onValueChange={(v) => setForecastRange(v as ForecastRange)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Next 7 Days</SelectItem>
              <SelectItem value="14d">Next 14 Days</SelectItem>
              <SelectItem value="30d">Next 30 Days</SelectItem>
              <SelectItem value="60d">Next 60 Days</SelectItem>
              <SelectItem value="90d">Next 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Predicted Revenue</h3>
            <CurrencyDollar size={20} className="text-primary" />
          </div>
          <p className="text-2xl font-bold mb-1">{formatCurrency(metrics.totalPredictedRevenue)}</p>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant={metrics.expectedGrowth >= 0 ? 'default' : 'destructive'} className="gap-1">
              {metrics.expectedGrowth >= 0 ? <TrendUp size={14} /> : <TrendDown size={14} />}
              {Math.abs(metrics.expectedGrowth).toFixed(1)}%
            </Badge>
            <span className="text-muted-foreground">vs historical</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Based on {scenario} scenario
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-secondary">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Avg Predicted Occupancy</h3>
            <Bed size={20} className="text-secondary" />
          </div>
          <p className="text-2xl font-bold mb-1">{metrics.averagePredictedOccupancy.toFixed(1)}%</p>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="gap-1">
              <Info size={14} />
              {metrics.confidenceScore.toFixed(0)}% confidence
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Forecast accuracy score
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Top Performer</h3>
            <TrendUp size={20} className="text-accent" />
          </div>
          <p className="text-lg font-bold mb-1">{metrics.topPerformingRoomType}</p>
          <div className="flex items-center gap-2 text-sm">
            {performance.find(p => p.roomTypeName === metrics.topPerformingRoomType) && (
              <Badge variant="secondary">
                {formatCurrency(performance.find(p => p.roomTypeName === metrics.topPerformingRoomType)!.totalRevenue)}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Based on last 90 days
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-chart-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Forecast Horizon</h3>
            <Calendar size={20} className="text-chart-1" />
          </div>
          <p className="text-2xl font-bold mb-1">{getForecastDays(forecastRange)} Days</p>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline">
              {currentForecast.length} data points
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Through {new Date(currentForecast[currentForecast.length - 1]?.timestamp || Date.now()).toLocaleDateString()}
          </p>
        </Card>
      </div>

      <Tabs defaultValue="forecast" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="forecast">
            <ChartBar size={18} className="mr-2" />
            Forecast
          </TabsTrigger>
          <TabsTrigger value="scenarios">
            <ArrowsClockwise size={18} className="mr-2" />
            Scenarios
          </TabsTrigger>
          <TabsTrigger value="performance">
            <TrendUp size={18} className="mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <CurrencyDollar size={18} className="mr-2" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Lightbulb size={18} className="mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Revenue Forecast - {scenario.charAt(0).toUpperCase() + scenario.slice(1)} Scenario</h3>
              <Select value={selectedRoomType} onValueChange={setSelectedRoomType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Room Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Room Types</SelectItem>
                  {roomTypes.map(rt => (
                    <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--muted-foreground)"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="var(--muted-foreground)"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `LKR ${(value / 1000).toFixed(0)}k`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="var(--muted-foreground)"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value.toFixed(0)}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {selectedRoomType === 'all' && (
                  <>
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="upperBound"
                      fill="var(--primary)"
                      fillOpacity={0.1}
                      stroke="none"
                      name="Upper Bound"
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="lowerBound"
                      fill="var(--primary)"
                      fillOpacity={0.1}
                      stroke="none"
                      name="Lower Bound"
                    />
                  </>
                )}
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={false}
                  name="Predicted Revenue"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="occupancy"
                  stroke="var(--secondary)"
                  strokeWidth={2}
                  dot={false}
                  name="Predicted Occupancy"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['optimistic', 'realistic', 'conservative'] as const).map(scen => {
              const scenData = scenarios[scen]
              const scenMetrics = calculateForecastMetrics(scenData, performance)
              
              return (
                <Card 
                  key={scen}
                  className={`p-6 cursor-pointer transition-all ${
                    scenario === scen ? 'ring-2 ring-primary' : 'hover:shadow-md'
                  }`}
                  onClick={() => setScenario(scen)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold capitalize">{scen}</h3>
                    {scenario === scen && <Badge variant="default">Active</Badge>}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-xl font-bold">{formatCurrency(scenMetrics.totalPredictedRevenue)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Occupancy</p>
                      <p className="text-xl font-bold">{scenMetrics.averagePredictedOccupancy.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expected Growth</p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold">{scenMetrics.expectedGrowth.toFixed(1)}%</p>
                        {scenMetrics.expectedGrowth >= 0 ? (
                          <TrendUp size={18} className="text-success" />
                        ) : (
                          <TrendDown size={18} className="text-destructive" />
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Scenario Comparison</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={[
                {
                  metric: 'Revenue',
                  optimistic: scenarios.optimistic.reduce((sum, f) => sum + f.predictedRevenue, 0),
                  realistic: scenarios.realistic.reduce((sum, f) => sum + f.predictedRevenue, 0),
                  conservative: scenarios.conservative.reduce((sum, f) => sum + f.predictedRevenue, 0)
                },
                {
                  metric: 'Avg Occupancy',
                  optimistic: scenarios.optimistic.reduce((sum, f) => sum + f.predictedOccupancy, 0) / scenarios.optimistic.length,
                  realistic: scenarios.realistic.reduce((sum, f) => sum + f.predictedOccupancy, 0) / scenarios.realistic.length,
                  conservative: scenarios.conservative.reduce((sum, f) => sum + f.predictedOccupancy, 0) / scenarios.conservative.length
                }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="metric" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="optimistic" fill="var(--chart-3)" name="Optimistic" />
                <Bar dataKey="realistic" fill="var(--primary)" name="Realistic" />
                <Bar dataKey="conservative" fill="var(--chart-4)" name="Conservative" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Historical Room Type Performance (Last 90 Days)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--muted-foreground)"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="var(--muted-foreground)"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `LKR ${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="revenue" fill="var(--primary)" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {performance.map(perf => (
              <Card key={perf.roomTypeId} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{perf.roomTypeName}</h3>
                  <Badge variant={
                    perf.seasonalTrend === 'increasing' ? 'default' :
                    perf.seasonalTrend === 'decreasing' ? 'destructive' : 'secondary'
                  }>
                    {perf.seasonalTrend}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                    <p className="text-lg font-semibold">{formatCurrency(perf.totalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Occupancy</p>
                    <p className="text-lg font-semibold">{perf.occupancyRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ADR</p>
                    <p className="text-lg font-semibold">{formatCurrency(perf.averageDailyRate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">RevPAR</p>
                    <p className="text-lg font-semibold">{formatCurrency(perf.revenuePerAvailableRoom)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Growth Rate</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold">{perf.growthRate.toFixed(1)}%</p>
                      {perf.growthRate >= 0 ? (
                        <TrendUp size={18} className="text-success" />
                      ) : (
                        <TrendDown size={18} className="text-destructive" />
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recommended Optimal Pricing (Next 30 Days)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(optimalPricing).map(([roomTypeId, pricing]) => {
                const roomType = roomTypes.find(rt => rt.id === roomTypeId)
                if (!roomType) return null
                
                const currentPerf = performance.find(p => p.roomTypeId === roomTypeId)
                const priceDiff = pricing.suggestedRate - roomType.baseRate
                const priceChange = (priceDiff / roomType.baseRate) * 100
                
                return (
                  <Card key={roomTypeId} className="p-4 bg-muted/30">
                    <h4 className="font-semibold mb-3">{roomType.name}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Current Rate</span>
                        <span className="text-sm font-medium">{formatCurrency(roomType.baseRate)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Suggested Rate</span>
                        <span className="text-lg font-bold text-primary">{formatCurrency(pricing.suggestedRate)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Change</span>
                        <Badge variant={priceChange >= 0 ? 'default' : 'destructive'} className="gap-1">
                          {priceChange >= 0 ? <TrendUp size={12} /> : <TrendDown size={12} />}
                          {Math.abs(priceChange).toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground italic">{pricing.rationale}</p>
                      </div>
                      {currentPerf && (
                        <div className="pt-2 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Current Occupancy:</span>
                            <span className="font-medium">{currentPerf.occupancyRate.toFixed(1)}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Current ADR:</span>
                            <span className="font-medium">{formatCurrency(currentPerf.averageDailyRate)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lightbulb size={24} className="text-accent" />
              <h3 className="text-lg font-semibold">AI-Generated Recommendations</h3>
            </div>
            <div className="space-y-3">
              {metrics.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <Info size={20} className="text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{rec}</p>
                </div>
              ))}
              {metrics.recommendations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Info size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No specific recommendations at this time. Your performance looks good!</p>
                </div>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Seasonal Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={seasonalPatterns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="var(--muted-foreground)"
                    tickFormatter={(month) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month]}
                  />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="seasonality" 
                    stroke="var(--primary)" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Seasonality Index"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Key Metrics Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                  <span className="text-sm font-medium">Forecast Confidence</span>
                  <Badge variant="default">{metrics.confidenceScore.toFixed(0)}%</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                  <span className="text-sm font-medium">Expected Growth</span>
                  <Badge variant={metrics.expectedGrowth >= 0 ? 'default' : 'destructive'}>
                    {metrics.expectedGrowth >= 0 ? '+' : ''}{metrics.expectedGrowth.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                  <span className="text-sm font-medium">Top Performer</span>
                  <Badge variant="secondary">{metrics.topPerformingRoomType}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-chart-1/10 rounded-lg">
                  <span className="text-sm font-medium">Data Points</span>
                  <Badge variant="outline">{currentForecast.length}</Badge>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6 bg-accent/5 border-accent">
            <div className="flex items-start gap-3">
              <Warning size={24} className="text-accent flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-2">About This Forecast</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  This predictive model uses historical room type performance, seasonal patterns, and trend analysis to forecast future revenue and occupancy.
                  The confidence score indicates the reliability of predictions based on data quality and historical consistency.
                </p>
                <p className="text-sm text-muted-foreground">
                  Forecasts are updated automatically as new booking data becomes available. Consider multiple scenarios when making strategic decisions.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
