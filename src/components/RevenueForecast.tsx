import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sparkle,
  TrendUp,
  TrendDown,
  Minus,
  ChartLine,
  Lightning,
  Calendar,
  Download,
  Info,
  CurrencyDollar,
  Bed,
  ForkKnife,
  Warning
} from '@phosphor-icons/react'
import { formatCurrency } from '@/lib/helpers'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
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
  ensembleForecast,
  forecastLinearRegression,
  forecastExponentialSmoothing,
  forecastSeasonalDecomposition,
  analyzeTrend,
  detectAnomalies,
  type DataPoint,
  type ForecastResult
} from '@/lib/forecastingHelpers'
import type { GuestInvoice, Reservation, Order } from '@/lib/types'

interface RevenueForecastProps {
  guestInvoices?: GuestInvoice[]
  reservations?: Reservation[]
  orders?: Order[]
}

type ForecastPeriod = 7 | 14 | 30 | 60 | 90
type ForecastMethod = 'ensemble' | 'linear' | 'exponential' | 'seasonal'
type RevenueType = 'total' | 'room' | 'fnb'

export function RevenueForecast({
  guestInvoices = [],
  reservations = [],
  orders = []
}: RevenueForecastProps) {
  const [forecastPeriod, setForecastPeriod] = useState<ForecastPeriod>(30)
  const [forecastMethod, setForecastMethod] = useState<ForecastMethod>('ensemble')
  const [revenueType, setRevenueType] = useState<RevenueType>('total')
  const [showConfidenceInterval, setShowConfidenceInterval] = useState(true)

  const historicalData = useMemo(() => {
    const revenueByDate = new Map<string, { total: number; room: number; fnb: number }>()

    guestInvoices.forEach(invoice => {
      const dateKey = new Date(invoice.invoiceDate).toISOString().split('T')[0]
      const existing = revenueByDate.get(dateKey) || { total: 0, room: 0, fnb: 0 }
      
      const roomCharges = invoice.lineItems
        .filter(item => item.itemType === 'room-charge' || item.description.toLowerCase().includes('room'))
        .reduce((sum, item) => sum + item.lineTotal, 0)
      
      revenueByDate.set(dateKey, {
        total: existing.total + invoice.grandTotal,
        room: existing.room + roomCharges,
        fnb: existing.fnb
      })
    })

    orders.forEach(order => {
      const dateKey = new Date(order.createdAt).toISOString().split('T')[0]
      const existing = revenueByDate.get(dateKey) || { total: 0, room: 0, fnb: 0 }
      
      revenueByDate.set(dateKey, {
        total: existing.total + order.total,
        room: existing.room,
        fnb: existing.fnb + order.total
      })
    })

    const sortedData = Array.from(revenueByDate.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, revenue]) => ({
        date,
        total: revenue.total,
        room: revenue.room,
        fnb: revenue.fnb
      }))

    const last90Days = sortedData.slice(-90)

    return {
      total: last90Days.map(d => ({ date: d.date, value: d.total })),
      room: last90Days.map(d => ({ date: d.date, value: d.room })),
      fnb: last90Days.map(d => ({ date: d.date, value: d.fnb }))
    }
  }, [guestInvoices, orders])

  const currentHistoricalData = historicalData[revenueType]

  const forecast = useMemo(() => {
    if (currentHistoricalData.length < 7) {
      return []
    }

    switch (forecastMethod) {
      case 'linear':
        return forecastLinearRegression(currentHistoricalData, forecastPeriod)
      case 'exponential':
        return forecastExponentialSmoothing(currentHistoricalData, forecastPeriod)
      case 'seasonal':
        return forecastSeasonalDecomposition(currentHistoricalData, forecastPeriod)
      case 'ensemble':
      default:
        return ensembleForecast(currentHistoricalData, forecastPeriod)
    }
  }, [currentHistoricalData, forecastPeriod, forecastMethod])

  const trendAnalysis = useMemo(() => 
    analyzeTrend(currentHistoricalData),
    [currentHistoricalData]
  )

  const anomalies = useMemo(() => 
    detectAnomalies(currentHistoricalData),
    [currentHistoricalData]
  )

  const combinedChartData = useMemo(() => {
    const historical = currentHistoricalData.map((d, i) => ({
      date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: d.date,
      actual: d.value,
      isAnomaly: anomalies.includes(i),
      type: 'historical' as const
    }))

    const forecasted = forecast.map(f => ({
      date: new Date(f.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: f.date,
      predicted: f.predicted,
      lowerBound: f.lowerBound,
      upperBound: f.upperBound,
      confidence: f.confidence,
      type: 'forecast' as const
    }))

    return [...historical, ...forecasted]
  }, [currentHistoricalData, forecast, anomalies])

  const forecastSummary = useMemo(() => {
    if (forecast.length === 0) return null

    const totalPredicted = forecast.reduce((sum, f) => sum + f.predicted, 0)
    const avgDaily = totalPredicted / forecast.length
    const avgConfidence = forecast.reduce((sum, f) => sum + f.confidence, 0) / forecast.length
    
    const historicalAvg = currentHistoricalData.reduce((sum, d) => sum + d.value, 0) / currentHistoricalData.length
    const expectedGrowth = ((avgDaily - historicalAvg) / historicalAvg) * 100

    return {
      totalPredicted,
      avgDaily,
      avgConfidence,
      expectedGrowth,
      forecastDays: forecast.length
    }
  }, [forecast, currentHistoricalData])

  const getTrendIcon = () => {
    switch (trendAnalysis.trend) {
      case 'increasing':
        return <TrendUp size={24} className="text-green-600" weight="bold" />
      case 'decreasing':
        return <TrendDown size={24} className="text-red-600" weight="bold" />
      default:
        return <Minus size={24} className="text-yellow-600" weight="bold" />
    }
  }

  const getTrendColor = () => {
    switch (trendAnalysis.trend) {
      case 'increasing':
        return 'text-green-600'
      case 'decreasing':
        return 'text-red-600'
      default:
        return 'text-yellow-600'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRevenueTypeLabel = () => {
    switch (revenueType) {
      case 'room':
        return 'Room Revenue'
      case 'fnb':
        return 'F&B Revenue'
      default:
        return 'Total Revenue'
    }
  }

  const getRevenueTypeIcon = () => {
    switch (revenueType) {
      case 'room':
        return <Bed size={20} className="text-primary" weight="duotone" />
      case 'fnb':
        return <ForkKnife size={20} className="text-accent" weight="duotone" />
      default:
        return <CurrencyDollar size={20} className="text-primary" weight="duotone" />
    }
  }

  if (currentHistoricalData.length < 7) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold flex items-center gap-3">
            <Sparkle size={32} className="text-primary" weight="duotone" />
            Revenue Forecasting
          </h2>
          <p className="text-muted-foreground mt-1">
            AI-powered revenue predictions based on historical data
          </p>
        </div>

        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-yellow-100 flex items-center justify-center mx-auto">
              <Warning size={40} className="text-yellow-600" weight="duotone" />
            </div>
            <h3 className="text-2xl font-bold">Insufficient Historical Data</h3>
            <p className="text-muted-foreground">
              At least 7 days of revenue data is required to generate accurate forecasts. 
              Continue using the system to collect data for forecasting.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <Badge variant="outline" className="text-base px-4 py-2">
                Current Data Points: {currentHistoricalData.length}
              </Badge>
              <Badge variant="outline" className="text-base px-4 py-2">
                Required: 7
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold flex items-center gap-3">
            <Sparkle size={32} className="text-primary" weight="duotone" />
            Revenue Forecasting
          </h2>
          <p className="text-muted-foreground mt-1">
            AI-powered revenue predictions based on {currentHistoricalData.length} days of historical data
          </p>
        </div>
        
        <Button variant="outline" className="gap-2">
          <Download size={18} />
          Export Forecast
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 border-l-4 border-l-primary">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Current Trend</h3>
            {getTrendIcon()}
          </div>
          <p className={`text-2xl font-bold ${getTrendColor()} mb-2 capitalize`}>
            {trendAnalysis.trend}
          </p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Strength:</span>
              <span className="font-medium">{(trendAnalysis.strength * 100).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span>R-Squared:</span>
              <span className="font-medium">{(trendAnalysis.rSquared * 100).toFixed(1)}%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-l-accent">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Avg. Confidence</h3>
            <Lightning size={24} className={forecastSummary ? getConfidenceColor(forecastSummary.avgConfidence) : 'text-muted'} weight="fill" />
          </div>
          <p className={`text-2xl font-bold mb-2 ${forecastSummary ? getConfidenceColor(forecastSummary.avgConfidence) : 'text-muted-foreground'}`}>
            {forecastSummary ? `${forecastSummary.avgConfidence.toFixed(1)}%` : 'N/A'}
          </p>
          <p className="text-xs text-muted-foreground">
            {forecastSummary && forecastSummary.avgConfidence >= 80 ? 'High accuracy' : 
             forecastSummary && forecastSummary.avgConfidence >= 60 ? 'Moderate accuracy' : 'Lower accuracy'}
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Expected Growth</h3>
            {forecastSummary && forecastSummary.expectedGrowth >= 0 ? (
              <TrendUp size={24} className="text-green-600" weight="bold" />
            ) : (
              <TrendDown size={24} className="text-red-600" weight="bold" />
            )}
          </div>
          <p className={`text-2xl font-bold mb-2 ${forecastSummary && forecastSummary.expectedGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {forecastSummary ? `${forecastSummary.expectedGrowth >= 0 ? '+' : ''}${forecastSummary.expectedGrowth.toFixed(1)}%` : 'N/A'}
          </p>
          <p className="text-xs text-muted-foreground">
            vs. historical average
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground">Data Anomalies</h3>
            <Info size={24} className="text-blue-600" weight="fill" />
          </div>
          <p className="text-2xl font-bold text-blue-600 mb-2">
            {anomalies.length}
          </p>
          <p className="text-xs text-muted-foreground">
            Unusual data points detected
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-2">
            <Label>Revenue Type</Label>
            <Select value={revenueType} onValueChange={(value) => setRevenueType(value as RevenueType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total">Total Revenue</SelectItem>
                <SelectItem value="room">Room Revenue</SelectItem>
                <SelectItem value="fnb">F&B Revenue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Forecast Period</Label>
            <Select value={forecastPeriod.toString()} onValueChange={(value) => setForecastPeriod(parseInt(value) as ForecastPeriod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="14">14 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="60">60 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Forecast Method</Label>
            <Select value={forecastMethod} onValueChange={(value) => setForecastMethod(value as ForecastMethod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ensemble">Ensemble (Recommended)</SelectItem>
                <SelectItem value="linear">Linear Regression</SelectItem>
                <SelectItem value="exponential">Exponential Smoothing</SelectItem>
                <SelectItem value="seasonal">Seasonal Decomposition</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Display Options</Label>
            <Button
              variant={showConfidenceInterval ? "default" : "outline"}
              className="w-full"
              onClick={() => setShowConfidenceInterval(!showConfidenceInterval)}
            >
              {showConfidenceInterval ? 'Hide' : 'Show'} Confidence Interval
            </Button>
          </div>
        </div>

        {forecastSummary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20 mb-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Predicted Total Revenue</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(forecastSummary.totalPredicted)}</p>
              <p className="text-xs text-muted-foreground">Over next {forecastSummary.forecastDays} days</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Avg. Daily Revenue</p>
              <p className="text-xl font-bold text-primary">{formatCurrency(forecastSummary.avgDaily)}</p>
              <p className="text-xs text-muted-foreground">Forecasted average</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Forecast Reliability</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      forecastSummary.avgConfidence >= 80 ? 'bg-green-500' :
                      forecastSummary.avgConfidence >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${forecastSummary.avgConfidence}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">{forecastSummary.avgConfidence.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Tabs defaultValue="forecast" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forecast">
            <ChartLine size={18} className="mr-2" />
            Forecast Chart
          </TabsTrigger>
          <TabsTrigger value="breakdown">
            <Calendar size={18} className="mr-2" />
            Daily Breakdown
          </TabsTrigger>
          <TabsTrigger value="comparison">
            <TrendUp size={18} className="mr-2" />
            Model Comparison
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Sparkle size={18} className="mr-2" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {getRevenueTypeIcon()}
              {getRevenueTypeLabel()} Forecast
            </h3>
            <ResponsiveContainer width="100%" height={500}>
              <ComposedChart data={combinedChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  label={{ value: 'Revenue', angle: -90, position: 'insideLeft' }}
                  tickFormatter={(value) => formatCurrency(value)}
                  className="text-xs"
                />
                <Tooltip 
                  formatter={(value: any, name: string) => {
                    if (name === 'confidence') return `${Number(value).toFixed(1)}%`
                    return formatCurrency(Number(value))
                  }}
                  labelFormatter={(label) => `Date: ${label}`}
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                />
                <Legend />
                
                <ReferenceLine 
                  x={currentHistoricalData.length - 1} 
                  stroke="hsl(var(--border))" 
                  strokeDasharray="5 5"
                  label={{ value: 'Today', position: 'top' }}
                />

                {showConfidenceInterval && (
                  <Area
                    type="monotone"
                    dataKey="upperBound"
                    fill="hsl(var(--primary))"
                    stroke="none"
                    fillOpacity={0.1}
                    name="Upper Bound"
                  />
                )}
                
                {showConfidenceInterval && (
                  <Area
                    type="monotone"
                    dataKey="lowerBound"
                    fill="hsl(var(--background))"
                    stroke="none"
                    fillOpacity={1}
                    name="Lower Bound"
                  />
                )}

                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Actual Revenue"
                  dot={(props: any) => {
                    const dataPoint = combinedChartData[props.index]
                    if (dataPoint && 'isAnomaly' in dataPoint && dataPoint.isAnomaly) {
                      return (
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={6}
                          fill="hsl(var(--destructive))"
                          stroke="white"
                          strokeWidth={2}
                        />
                      )
                    }
                    return <circle {...props} r={3} fill="hsl(var(--primary))" />
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="hsl(var(--accent))"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  name="Predicted Revenue"
                  dot={{ fill: 'hsl(var(--accent))', r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>

            {anomalies.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Warning size={20} className="text-yellow-600 mt-0.5" weight="fill" />
                  <div>
                    <h4 className="font-semibold text-sm text-yellow-900">Data Anomalies Detected</h4>
                    <p className="text-xs text-yellow-700 mt-1">
                      {anomalies.length} unusual data point(s) detected (marked in red). These may represent special events, 
                      holidays, or data errors that could affect forecast accuracy.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="breakdown">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Daily Forecast Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-semibold">Date</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold">Predicted Revenue</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold">Lower Bound</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold">Upper Bound</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.map((f, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2 text-sm">
                        {new Date(f.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="text-right py-3 px-2 text-sm font-semibold">
                        {formatCurrency(f.predicted)}
                      </td>
                      <td className="text-right py-3 px-2 text-sm text-muted-foreground">
                        {formatCurrency(f.lowerBound)}
                      </td>
                      <td className="text-right py-3 px-2 text-sm text-muted-foreground">
                        {formatCurrency(f.upperBound)}
                      </td>
                      <td className="text-right py-3 px-2">
                        <Badge className={
                          f.confidence >= 80 ? 'bg-green-100 text-green-800' :
                          f.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {f.confidence.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {forecastSummary && (
                  <tfoot>
                    <tr className="border-t-2 font-bold bg-muted/30">
                      <td className="py-3 px-2 text-sm">Total</td>
                      <td className="text-right py-3 px-2 text-sm">
                        {formatCurrency(forecastSummary.totalPredicted)}
                      </td>
                      <td colSpan={3} className="text-right py-3 px-2 text-sm text-muted-foreground">
                        Average Daily: {formatCurrency(forecastSummary.avgDaily)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Forecast Model Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={(() => {
                const linearF = forecastLinearRegression(currentHistoricalData, forecastPeriod)
                const expF = forecastExponentialSmoothing(currentHistoricalData, forecastPeriod)
                const seasonalF = forecastSeasonalDecomposition(currentHistoricalData, forecastPeriod)
                const ensembleF = ensembleForecast(currentHistoricalData, forecastPeriod)

                return ensembleF.map((e, i) => ({
                  date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  linear: linearF[i]?.predicted || 0,
                  exponential: expF[i]?.predicted || 0,
                  seasonal: seasonalF[i]?.predicted || 0,
                  ensemble: e.predicted
                }))
              })()}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" angle={-45} textAnchor="end" height={80} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} className="text-xs" />
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="linear" stroke="#8884d8" name="Linear Regression" strokeWidth={2} />
                <Line type="monotone" dataKey="exponential" stroke="#82ca9d" name="Exponential Smoothing" strokeWidth={2} />
                <Line type="monotone" dataKey="seasonal" stroke="#ffc658" name="Seasonal Decomposition" strokeWidth={2} />
                <Line type="monotone" dataKey="ensemble" stroke="hsl(var(--primary))" name="Ensemble (Recommended)" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-sm mb-2 text-blue-900">Linear Regression</h4>
                <p className="text-xs text-blue-700">
                  Simple trend-based forecast. Best for data with clear linear trends and minimal seasonality.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-sm mb-2 text-green-900">Exponential Smoothing</h4>
                <p className="text-xs text-green-700">
                  Weighted average method giving more importance to recent data. Good for short-term forecasts.
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-sm mb-2 text-yellow-900">Seasonal Decomposition</h4>
                <p className="text-xs text-yellow-700">
                  Accounts for weekly patterns and seasonality. Ideal for businesses with recurring patterns.
                </p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                <h4 className="font-semibold text-sm mb-2 text-primary">Ensemble Method (Recommended)</h4>
                <p className="text-xs text-primary/80">
                  Combines all models for the most robust prediction. Balances strengths of different approaches.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Sparkle size={24} className="text-primary" weight="duotone" />
              AI-Powered Forecasting Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                const insights: Array<{
                  type: 'success' | 'warning' | 'info'
                  title: string
                  description: string
                }> = []

                if (trendAnalysis.trend === 'increasing' && trendAnalysis.strength > 0.3) {
                  insights.push({
                    type: 'success',
                    title: 'Strong Upward Trend Detected',
                    description: `Revenue is showing a strong ${trendAnalysis.trend} trend with ${(trendAnalysis.strength * 100).toFixed(0)}% strength. This momentum is likely to continue in the forecast period.`
                  })
                } else if (trendAnalysis.trend === 'decreasing') {
                  insights.push({
                    type: 'warning',
                    title: 'Declining Revenue Trend',
                    description: `Revenue is on a declining trajectory. Consider implementing promotional campaigns or reviewing pricing strategies to reverse this trend.`
                  })
                }

                if (forecastSummary && forecastSummary.expectedGrowth > 10) {
                  insights.push({
                    type: 'success',
                    title: 'Significant Growth Expected',
                    description: `The forecast predicts a ${forecastSummary.expectedGrowth.toFixed(1)}% increase in average daily revenue. Prepare for higher capacity utilization.`
                  })
                } else if (forecastSummary && forecastSummary.expectedGrowth < -10) {
                  insights.push({
                    type: 'warning',
                    title: 'Revenue Decline Forecasted',
                    description: `A ${Math.abs(forecastSummary.expectedGrowth).toFixed(1)}% decrease in revenue is predicted. Review operational strategies and marketing efforts.`
                  })
                }

                if (forecastSummary && forecastSummary.avgConfidence < 60) {
                  insights.push({
                    type: 'info',
                    title: 'Lower Forecast Confidence',
                    description: `Forecast confidence is ${forecastSummary.avgConfidence.toFixed(0)}%. This may be due to irregular historical patterns or limited data. Use forecasts as estimates rather than guarantees.`
                  })
                } else if (forecastSummary && forecastSummary.avgConfidence >= 80) {
                  insights.push({
                    type: 'success',
                    title: 'High Forecast Reliability',
                    description: `With ${forecastSummary.avgConfidence.toFixed(0)}% confidence, these forecasts are highly reliable. Historical data shows consistent patterns that enable accurate predictions.`
                  })
                }

                if (anomalies.length > currentHistoricalData.length * 0.1) {
                  insights.push({
                    type: 'warning',
                    title: 'High Data Volatility',
                    description: `${anomalies.length} anomalies detected in ${currentHistoricalData.length} days of data. High volatility may reduce forecast accuracy. Consider investigating unusual events or data quality issues.`
                  })
                }

                if (revenueType === 'fnb' && trendAnalysis.trend === 'increasing') {
                  insights.push({
                    type: 'success',
                    title: 'F&B Revenue Growing',
                    description: 'Your F&B operations are showing positive growth. Consider expanding menu offerings or extending service hours to capitalize on this trend.'
                  })
                }

                if (revenueType === 'room' && trendAnalysis.trend === 'stable') {
                  insights.push({
                    type: 'info',
                    title: 'Stable Room Revenue',
                    description: 'Room revenue is stable. This consistency is good for planning, but also presents opportunities for growth through dynamic pricing or promotional packages.'
                  })
                }

                if (insights.length === 0) {
                  insights.push({
                    type: 'info',
                    title: 'Steady Performance',
                    description: 'Revenue patterns are stable and predictable, which is ideal for accurate forecasting and operational planning.'
                  })
                }

                return insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      insight.type === 'success' ? 'bg-green-50 border-green-500' :
                      insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                      'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <h4 className="font-semibold mb-2">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                ))
              })()}
            </div>

            <div className="mt-6 p-5 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-primary/20">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkle size={20} className="text-primary" weight="fill" />
                Recommendations
              </h4>
              <ul className="space-y-2 text-sm">
                {trendAnalysis.trend === 'increasing' && (
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Capitalize on growth momentum by investing in marketing and capacity expansion</span>
                  </li>
                )}
                {trendAnalysis.trend === 'decreasing' && (
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">⚠</span>
                    <span>Implement revenue recovery strategies including promotions and guest retention programs</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">ℹ</span>
                  <span>Monitor actual performance against forecasts weekly to refine prediction accuracy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">ℹ</span>
                  <span>Use ensemble forecasting for the most balanced and reliable predictions</span>
                </li>
                {forecastPeriod >= 60 && (
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">⚠</span>
                    <span>Long-term forecasts have higher uncertainty. Review and update predictions regularly</span>
                  </li>
                )}
              </ul>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
