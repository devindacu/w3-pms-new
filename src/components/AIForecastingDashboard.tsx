import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { toast } from 'sonner'
import type { AIDemandForecast, AIInsight, Reservation } from '@/lib/types'
import {
  Brain,
  ChartLine,
  Sparkle,
  WarningCircle,
  TrendUp,
  TrendDown,
  Lightning,
  CalendarBlank,
  Spinner,
  ArrowClockwise,
  Info,
  CheckCircle,
  XCircle,
} from '@phosphor-icons/react'

interface AIForecastingDashboardProps {
  reservations: Reservation[]
  branding?: { hotelName?: string } | null
}

const DEMAND_COLORS: Record<string, string> = {
  low: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  high: 'bg-green-100 text-green-700 border-green-200',
  'very-high': 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-50 border-red-300 text-red-800',
  high: 'bg-orange-50 border-orange-300 text-orange-800',
  medium: 'bg-amber-50 border-amber-300 text-amber-800',
  low: 'bg-blue-50 border-blue-300 text-blue-800',
}

const PRIORITY_ICONS: Record<string, React.ReactNode> = {
  critical: <WarningCircle size={16} weight="fill" className="text-red-500" />,
  high: <TrendUp size={16} className="text-orange-500" />,
  medium: <Info size={16} className="text-amber-500" />,
  low: <CheckCircle size={16} className="text-blue-500" />,
}

function buildHistoricalData(reservations: Reservation[]): Array<{ date: string; occupancy: number; adr: number }> {
  const grouped: Record<string, { rooms: Set<string>; totalRevenue: number; count: number }> = {}
  const baseDate = new Date()
  baseDate.setHours(0, 0, 0, 0)
  const last90Days = Array.from({ length: 90 }, (_, i) => {
    const d = new Date(baseDate)
    d.setDate(d.getDate() - (89 - i))
    return d.toISOString().split('T')[0]
  })

  for (const date of last90Days) {
    grouped[date] = { rooms: new Set(), totalRevenue: 0, count: 0 }
  }

  for (const r of reservations) {
    if (r.status === 'checked-in' || r.status === 'checked-out') {
      const checkIn = r.checkInDate ? new Date(r.checkInDate).toISOString().split('T')[0] : null
      if (checkIn && grouped[checkIn]) {
        grouped[checkIn].rooms.add(r.roomId ?? 'unknown')
        grouped[checkIn].totalRevenue += r.totalAmount ?? 0
        grouped[checkIn].count += 1
      }
    }
  }

  const totalRooms = Math.max(10, new Set(reservations.map(r => r.roomId ?? 'unknown')).size)

  return last90Days.map(date => ({
    date,
    occupancy: Math.round((grouped[date]?.rooms.size / totalRooms) * 100),
    adr: grouped[date]?.count > 0 ? Math.round(grouped[date].totalRevenue / grouped[date].count) : 0,
  }))
}

export function AIForecastingDashboard({ reservations, branding }: AIForecastingDashboardProps) {
  const [forecasts, setForecasts] = useState<AIDemandForecast[]>([])
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)
  const [forecastDays, setForecastDays] = useState<'30' | '60' | '90'>('30')
  const [activeTab, setActiveTab] = useState<'forecast' | 'insights' | 'heatmap'>('forecast')

  const hotelName = branding?.hotelName ?? 'Our Hotel'

  useEffect(() => {
    loadCachedForecasts()
    loadInsights()
  }, [])

  const loadCachedForecasts = async () => {
    try {
      const res = await fetch('/api/ai/forecasts')
      if (res.ok) {
        const data: Array<Record<string, unknown>> = await res.json()
        const mapped: AIDemandForecast[] = data.map(f => ({
          id: String(f.id ?? ''),
          date: String(f.forecastDate ?? f.date ?? ''),
          predictedOccupancy: parseFloat(String(f.predictedOccupancy ?? 0)),
          predictedADR: parseFloat(String(f.predictedADR ?? 0)),
          predictedRevenue: parseFloat(String(f.predictedRevenue ?? 0)),
          confidence: parseFloat(String(f.confidence ?? 0)),
          demandLevel: (f.demandLevel as AIDemandForecast['demandLevel']) ?? 'medium',
          factors: Array.isArray(f.factors) ? f.factors as string[] : [],
          generatedAt: f.generatedAt ? new Date(f.generatedAt as string).getTime() : Date.now(),
        }))
        setForecasts(mapped)
      }
    } catch { /* ignore */ }
  }

  const loadInsights = async () => {
    setIsLoadingInsights(true)
    try {
      const res = await fetch('/api/ai/insights')
      if (res.ok) {
        const data: Array<Record<string, unknown>> = await res.json()
        const mapped: AIInsight[] = data.map(ins => ({
          id: String(ins.id ?? ''),
          type: (ins.type as AIInsight['type']) ?? 'revenue',
          priority: (ins.priority as AIInsight['priority']) ?? 'medium',
          title: String(ins.title ?? ''),
          description: String(ins.description ?? ''),
          recommendation: String(ins.recommendation ?? ''),
          potentialImpact: ins.potentialImpact ? String(ins.potentialImpact) : undefined,
          isRead: Boolean(ins.isRead),
          isDismissed: Boolean(ins.isDismissed),
          createdAt: ins.createdAt ? new Date(ins.createdAt as string).getTime() : Date.now(),
        }))
        setInsights(mapped.filter(i => !i.isDismissed))
      }
    } catch { /* ignore */ } finally {
      setIsLoadingInsights(false)
    }
  }

  const handleGenerateForecast = async () => {
    setIsGenerating(true)
    try {
      const historicalOccupancy = buildHistoricalData(reservations)
      const res = await fetch('/api/ai/forecast-demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ historicalOccupancy, forecastDays: Number(forecastDays), hotelName }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? 'Forecast generation failed')
        return
      }
      const data = await res.json()
      if (Array.isArray(data.forecasts) && data.forecasts.length > 0) {
        const mapped: AIDemandForecast[] = data.forecasts.map((f: Record<string, unknown>, i: number) => ({
          id: `forecast-${Date.now()}-${i}`,
          date: String(f.date ?? ''),
          predictedOccupancy: parseFloat(String(f.predictedOccupancy ?? 0)),
          predictedADR: parseFloat(String(f.predictedADR ?? 0)),
          predictedRevenue: parseFloat(String(f.predictedRevenue ?? 0)),
          confidence: parseFloat(String(f.confidence ?? 0)),
          demandLevel: (f.demandLevel as AIDemandForecast['demandLevel']) ?? 'medium',
          factors: Array.isArray(f.factors) ? f.factors as string[] : [],
          generatedAt: Date.now(),
        }))
        setForecasts(mapped)
        toast.success(`Generated ${mapped.length}-day demand forecast using ${data.provider}`)
      } else {
        toast.warning('Forecast generated but no data returned. Check your AI configuration.')
      }
    } catch {
      toast.error('Failed to generate forecast. Please check AI configuration.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateInsights = async () => {
    setIsLoadingInsights(true)
    try {
      // Compute current KPIs from reservations
      const recent = reservations.filter(r => r.status === 'checked-in' || r.status === 'checked-out')
      const totalRooms = Math.max(10, new Set(reservations.map(r => r.roomId ?? 'unknown')).size)
      const occupancy = recent.length > 0 ? Math.round((new Set(recent.map(r => r.roomId ?? 'unknown')).size / totalRooms) * 100) : 0
      const adr = recent.length > 0 ? Math.round(recent.reduce((s, r) => s + (r.totalAmount ?? 0), 0) / recent.length) : 0
      const revpar = Math.round((occupancy / 100) * adr)

      const res = await fetch('/api/ai/revenue-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ occupancy, adr, revpar, trend: 'stable', hotelName }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? 'Failed to generate insights')
        return
      }
      const data = await res.json()
      toast.success(`Generated ${Array.isArray(data.insights) ? data.insights.length : 0} AI insights`)
      await loadInsights()
    } catch {
      toast.error('Failed to generate insights. Please check AI configuration.')
    } finally {
      setIsLoadingInsights(false)
    }
  }

  const dismissInsight = async (id: string) => {
    try {
      await fetch(`/api/ai/insights/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDismissed: true }),
      })
      setInsights(prev => prev.filter(i => i.id !== id))
    } catch { /* ignore */ }
  }

  // Build chart data
  const chartData = forecasts.slice(0, Number(forecastDays)).map(f => ({
    date: f.date,
    occupancy: f.predictedOccupancy,
    adr: f.predictedADR,
    revenue: f.predictedRevenue,
    confidence: Math.round(f.confidence * 100),
  }))

  // Heatmap data: group forecasts by week + day
  const heatmapRows = forecasts.slice(0, Number(forecastDays)).reduce<Record<string, AIDemandForecast[]>>((acc, f) => {
    const d = new Date(f.date)
    const week = `${d.toLocaleString('default', { month: 'short', year: 'numeric' })} – Week ${Math.ceil((d.getDate() + d.getDay()) / 7)}`
    if (!acc[week]) acc[week] = []
    acc[week].push(f)
    return acc
  }, {})

  const unreadInsights = insights.filter(i => !i.isRead).length
  const criticalInsights = insights.filter(i => i.priority === 'critical').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Brain size={22} weight="duotone" className="text-violet-500" />
            AI Demand Forecasting
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered occupancy, ADR, and revenue predictions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={forecastDays} onValueChange={v => setForecastDays(v as '30' | '60' | '90')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="60">60 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateForecast} disabled={isGenerating} className="gap-2">
            {isGenerating ? <Spinner size={16} className="animate-spin" /> : <Sparkle size={16} />}
            {isGenerating ? 'Generating…' : 'Generate Forecast'}
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      {forecasts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Avg Predicted Occupancy</p>
            <p className="text-2xl font-bold text-violet-600 mt-1">
              {Math.round(forecasts.slice(0, Number(forecastDays)).reduce((s, f) => s + f.predictedOccupancy, 0) / Math.max(1, forecasts.slice(0, Number(forecastDays)).length))}%
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Avg Predicted ADR</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              LKR {Math.round(forecasts.slice(0, Number(forecastDays)).reduce((s, f) => s + f.predictedADR, 0) / Math.max(1, forecasts.slice(0, Number(forecastDays)).length)).toLocaleString()}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">High Demand Days</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {forecasts.slice(0, Number(forecastDays)).filter(f => f.demandLevel === 'high' || f.demandLevel === 'very-high').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">AI Confidence</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {forecasts.length > 0 ? Math.round(forecasts.slice(0, Number(forecastDays)).reduce((s, f) => s + f.confidence, 0) / Math.max(1, forecasts.slice(0, Number(forecastDays)).length) * 100) : 0}%
            </p>
          </Card>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        {(['forecast', 'heatmap', 'insights'] as const).map(tab => (
          <button
            key={tab}
            className={`pb-2 px-1 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab ? 'border-violet-500 text-violet-600' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            {tab === 'insights' && unreadInsights > 0 && (
              <Badge variant="destructive" className="ml-1.5 text-xs px-1.5 py-0">{unreadInsights}</Badge>
            )}
          </button>
        ))}
      </div>

      {/* Forecast Chart */}
      {activeTab === 'forecast' && (
        <Card className="p-5">
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <ChartLine size={48} className="mb-3 opacity-30" />
              <p className="font-medium">No forecast data yet</p>
              <p className="text-sm mt-1">Click "Generate Forecast" to run the AI demand prediction</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Occupancy Forecast (%)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="occGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip formatter={(v: number) => [`${v}%`, 'Occupancy']} />
                    <Area type="monotone" dataKey="occupancy" stroke="#8b5cf6" fill="url(#occGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">ADR Forecast (LKR)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <defs>
                      <linearGradient id="adrGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => [`LKR ${v.toLocaleString()}`, 'ADR']} />
                    <Area type="monotone" dataKey="adr" stroke="#3b82f6" fill="url(#adrGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Demand Heatmap */}
      {activeTab === 'heatmap' && (
        <Card className="p-5">
          {Object.keys(heatmapRows).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <CalendarBlank size={48} className="mb-3 opacity-30" />
              <p className="font-medium">No heatmap data</p>
              <p className="text-sm mt-1">Generate a forecast first to see the demand heatmap</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-red-200 inline-block" /> Low demand</span>
                <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-amber-200 inline-block" /> Medium</span>
                <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-green-200 inline-block" /> High</span>
                <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-emerald-400 inline-block" /> Very High</span>
              </div>
              {Object.entries(heatmapRows).map(([week, days]) => (
                <div key={week} className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">{week}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {days.map(day => {
                      const bgColor = {
                        low: 'bg-red-200 hover:bg-red-300',
                        medium: 'bg-amber-200 hover:bg-amber-300',
                        high: 'bg-green-200 hover:bg-green-300',
                        'very-high': 'bg-emerald-400 hover:bg-emerald-500',
                      }[day.demandLevel]
                      return (
                        <div
                          key={day.date}
                          className={`w-10 h-10 rounded flex flex-col items-center justify-center cursor-default transition-colors ${bgColor}`}
                          title={`${day.date}\nOccupancy: ${day.predictedOccupancy}%\nADR: LKR ${day.predictedADR.toLocaleString()}\nDemand: ${day.demandLevel}`}
                        >
                          <span className="text-xs font-bold leading-none">{new Date(day.date).getDate()}</span>
                          <span className="text-[9px] leading-none opacity-70">{day.predictedOccupancy}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* AI Insights */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {criticalInsights > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <WarningCircle size={12} weight="fill" />
                  {criticalInsights} Critical
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateInsights}
              disabled={isLoadingInsights}
              className="gap-2"
            >
              {isLoadingInsights ? <Spinner size={14} className="animate-spin" /> : <Lightning size={14} />}
              Generate New Insights
            </Button>
          </div>

          {isLoadingInsights && insights.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Spinner size={20} className="animate-spin" />
              Loading insights…
            </div>
          ) : insights.length === 0 ? (
            <Card className="p-8">
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
                <Brain size={48} className="mb-3 opacity-30" />
                <p className="font-medium">No AI insights yet</p>
                <p className="text-sm mt-1">Click "Generate New Insights" to get AI revenue recommendations</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {insights.map(insight => (
                <Alert
                  key={insight.id}
                  className={`${PRIORITY_COLORS[insight.priority]} border`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1">
                      {PRIORITY_ICONS[insight.priority]}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{insight.title}</p>
                          <Badge variant="outline" className="text-xs capitalize">{insight.type}</Badge>
                          <Badge variant="outline" className="text-xs capitalize">{insight.priority}</Badge>
                        </div>
                        <AlertDescription className="mt-1 text-sm">{insight.description}</AlertDescription>
                        {insight.recommendation && (
                          <p className="mt-1.5 text-xs font-medium">
                            💡 {insight.recommendation}
                          </p>
                        )}
                        {insight.potentialImpact && (
                          <p className="mt-1 text-xs text-green-700 dark:text-green-400">
                            📈 Impact: {insight.potentialImpact}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => dismissInsight(insight.id)}
                      className="text-muted-foreground hover:text-foreground flex-shrink-0 mt-0.5"
                      title="Dismiss"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
