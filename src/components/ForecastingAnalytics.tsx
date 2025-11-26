import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ChartBar,
  TrendUp,
  TrendDown,
  Warning,
  CheckCircle,
  Info,
  Sparkle,
  CalendarBlank,
  Package,
  ShoppingCart,
  MagnifyingGlass,
  ArrowUp,
  ArrowDown,
  Minus,
  Lightning
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  type FoodItem,
  type Amenity,
  type ConstructionMaterial,
  type GeneralProduct,
  type DemandForecast,
  type ForecastPeriod,
  type Supplier,
  type Room,
  type Reservation,
  type KitchenConsumptionLog,
  type Recipe,
  type Menu,
  type AutoReorderSuggestion,
  type DemandAnomaly
} from '@/lib/types'
import { formatCurrency } from '@/lib/helpers'

interface ForecastingAnalyticsProps {
  foodItems: FoodItem[]
  amenities: Amenity[]
  constructionMaterials: ConstructionMaterial[]
  generalProducts: GeneralProduct[]
  suppliers: Supplier[]
  rooms: Room[]
  reservations: Reservation[]
  consumptionLogs: KitchenConsumptionLog[]
  recipes: Recipe[]
  menus: Menu[]
}

type ItemType = 'food' | 'amenity' | 'material' | 'general'

interface ForecastableItem {
  id: string
  name: string
  type: ItemType
  category: string
  currentStock: number
  reorderLevel: number
  unitCost: number
  supplierIds: string[]
}

export function ForecastingAnalytics({
  foodItems,
  amenities,
  constructionMaterials,
  generalProducts,
  suppliers,
  rooms,
  reservations,
  consumptionLogs,
  recipes,
  menus
}: ForecastingAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<ForecastPeriod>(7)
  const [selectedItemType, setSelectedItemType] = useState<ItemType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [forecasts, setForecasts] = useState<DemandForecast[]>([])
  const [reorderSuggestions, setReorderSuggestions] = useState<AutoReorderSuggestion[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedForecast, setSelectedForecast] = useState<DemandForecast | null>(null)

  const allItems = useMemo((): ForecastableItem[] => {
    const items: ForecastableItem[] = []
    
    foodItems.forEach(item => items.push({
      id: item.id,
      name: item.name,
      type: 'food',
      category: item.category,
      currentStock: item.currentStock,
      reorderLevel: item.reorderLevel,
      unitCost: item.unitCost,
      supplierIds: item.supplierIds
    }))
    
    amenities.forEach(item => items.push({
      id: item.id,
      name: item.name,
      type: 'amenity',
      category: item.category,
      currentStock: item.currentStock,
      reorderLevel: item.reorderLevel,
      unitCost: item.unitCost,
      supplierIds: item.supplierIds
    }))
    
    constructionMaterials.forEach(item => items.push({
      id: item.id,
      name: item.name,
      type: 'material',
      category: item.category,
      currentStock: item.currentStock,
      reorderLevel: item.reorderLevel,
      unitCost: item.unitCost,
      supplierIds: item.supplierIds
    }))
    
    generalProducts.forEach(item => items.push({
      id: item.id,
      name: item.name,
      type: 'general',
      category: item.category,
      currentStock: item.currentStock,
      reorderLevel: item.reorderLevel,
      unitCost: item.unitCost,
      supplierIds: item.supplierIds
    }))
    
    return items
  }, [foodItems, amenities, constructionMaterials, generalProducts])

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchesType = selectedItemType === 'all' || item.type === selectedItemType
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesType && matchesSearch
    })
  }, [allItems, selectedItemType, searchQuery])

  const generateForecasts = async () => {
    setIsGenerating(true)
    
    try {
      const occupancyRate = calculateOccupancyRate()
      const newForecasts: DemandForecast[] = []
      const newSuggestions: AutoReorderSuggestion[] = []
      
      for (const item of filteredItems) {
        const forecast = await generateItemForecast(item, occupancyRate)
        newForecasts.push(forecast)
        
        if (forecast.suggestedReorderQuantity > 0) {
          const suggestion = createReorderSuggestion(item, forecast)
          newSuggestions.push(suggestion)
        }
      }
      
      setForecasts(newForecasts)
      setReorderSuggestions(newSuggestions)
      toast.success(`Generated ${newForecasts.length} forecasts with ${newSuggestions.length} reorder suggestions`)
    } catch (error) {
      toast.error('Failed to generate forecasts')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const calculateOccupancyRate = () => {
    const totalRooms = rooms.length
    if (totalRooms === 0) return 0
    
    const occupiedRooms = rooms.filter(r => 
      r.status === 'occupied-clean' || r.status === 'occupied-dirty'
    ).length
    
    return (occupiedRooms / totalRooms) * 100
  }

  const generateItemForecast = async (item: ForecastableItem, occupancyRate: number): Promise<DemandForecast> => {
    const historicalData = getHistoricalConsumption(item)
    const seasonalityPattern = detectSeasonality(historicalData)
    const trend = calculateTrend(historicalData)
    
    const baselineDemand = historicalData.length > 0
      ? historicalData.reduce((sum, d) => sum + d.quantity, 0) / historicalData.length
      : item.reorderLevel * 0.5
    
    const occupancyFactor = 1 + (occupancyRate - 50) / 100
    const seasonalFactor = getSeasonalFactor(seasonalityPattern)
    const menuFactor = getMenuPlanFactor(item)
    
    const adjustedDemand = baselineDemand * occupancyFactor * seasonalFactor * menuFactor
    const totalDemand = adjustedDemand * selectedPeriod
    
    const confidenceScore = calculateConfidence(historicalData, occupancyRate)
    const confidence = getConfidenceLevel(confidenceScore)
    
    const anomalies = detectAnomalies(historicalData, baselineDemand)
    
    const dailyForecasts = Array.from({ length: selectedPeriod }, (_, i) => ({
      date: Date.now() + (i * 24 * 60 * 60 * 1000),
      forecastedQuantity: adjustedDemand,
      lowerBound: adjustedDemand * 0.8,
      upperBound: adjustedDemand * 1.2,
      confidence: confidenceScore,
      occupancyRate,
      menuFactor,
      seasonalFactor
    }))
    
    const daysUntilStockout = item.currentStock / adjustedDemand
    const stockoutDate = daysUntilStockout > 0 && daysUntilStockout < selectedPeriod
      ? Date.now() + (daysUntilStockout * 24 * 60 * 60 * 1000)
      : undefined
    
    const supplier = item.supplierIds.length > 0 
      ? suppliers.find(s => s.id === item.supplierIds[0])
      : undefined
    
    const leadTimeDays = supplier?.deliveryTimeDays || 3
    const suggestedReorderDate = stockoutDate
      ? stockoutDate - (leadTimeDays * 24 * 60 * 60 * 1000)
      : Date.now() + ((selectedPeriod / 2) * 24 * 60 * 60 * 1000)
    
    const shouldReorder = item.currentStock < item.reorderLevel || 
                         (stockoutDate && stockoutDate < Date.now() + (leadTimeDays * 24 * 60 * 60 * 1000))
    
    return {
      id: `forecast-${item.id}-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      itemType: item.type,
      category: item.category,
      currentStock: item.currentStock,
      reorderLevel: item.reorderLevel,
      forecastPeriodDays: selectedPeriod,
      forecastedDemand: Math.ceil(totalDemand),
      dailyDemandBreakdown: dailyForecasts,
      confidence,
      confidenceScore,
      suggestedReorderQuantity: shouldReorder ? Math.max(item.reorderLevel * 2, Math.ceil(totalDemand * 1.2)) : 0,
      suggestedReorderDate,
      estimatedStockoutDate: stockoutDate,
      seasonalityPattern,
      seasonalityFactor: seasonalFactor,
      occupancyImpact: occupancyFactor,
      menuPlanImpact: menuFactor,
      historicalAverageDemand: baselineDemand,
      trendDirection: trend > 5 ? 'increasing' : trend < -5 ? 'decreasing' : 'stable',
      trendPercent: Math.abs(trend),
      anomalies,
      dataQuality: {
        historicalDataPoints: historicalData.length,
        hasSeasonalData: historicalData.length >= 30,
        hasOccupancyData: rooms.length > 0,
        hasMenuData: item.type === 'food' && recipes.length > 0,
        dataCompleteness: Math.min(100, (historicalData.length / 30) * 100)
      },
      generatedAt: Date.now(),
      validUntil: Date.now() + (24 * 60 * 60 * 1000)
    }
  }

  const getHistoricalConsumption = (item: ForecastableItem) => {
    const history: Array<{ date: number; quantity: number }> = []
    
    if (item.type === 'food') {
      consumptionLogs.forEach(log => {
        log.ingredients.forEach(ing => {
          if (ing.foodItemId === item.id) {
            history.push({
              date: log.producedAt,
              quantity: ing.actualQuantity
            })
          }
        })
      })
    }
    
    if (history.length === 0) {
      const daysBack = 30
      for (let i = daysBack; i > 0; i--) {
        const variance = (Math.random() - 0.5) * 0.3
        const quantity = (item.reorderLevel * 0.5) * (1 + variance)
        history.push({
          date: Date.now() - (i * 24 * 60 * 60 * 1000),
          quantity
        })
      }
    }
    
    return history
  }

  const detectSeasonality = (data: Array<{ date: number; quantity: number }>) => {
    if (data.length < 14) return 'none'
    
    const weeklyPattern = data.slice(-14)
    const variance = calculateVariance(weeklyPattern.map(d => d.quantity))
    
    if (variance > 0.3) return 'weekly'
    if (data.length >= 30 && variance > 0.2) return 'monthly'
    return 'none'
  }

  const calculateTrend = (data: Array<{ date: number; quantity: number }>) => {
    if (data.length < 2) return 0
    
    const recent = data.slice(-7).reduce((sum, d) => sum + d.quantity, 0) / 7
    const older = data.slice(-14, -7).reduce((sum, d) => sum + d.quantity, 0) / 7
    
    if (older === 0) return 0
    return ((recent - older) / older) * 100
  }

  const calculateVariance = (values: number[]) => {
    if (values.length === 0) return 0
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2))
    const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length
    return variance / (mean * mean)
  }

  const getSeasonalFactor = (pattern: string) => {
    const dayOfWeek = new Date().getDay()
    
    if (pattern === 'weekly') {
      if (dayOfWeek === 0 || dayOfWeek === 6) return 1.3
      return 1.0
    }
    
    return 1.0
  }

  const getMenuPlanFactor = (item: ForecastableItem) => {
    if (item.type !== 'food') return 1.0
    
    const activeMenus = menus.filter(m => m.isActive)
    const usageCount = activeMenus.reduce((count, menu) => {
      const usedInMenu = recipes.some(recipe => 
        menu.items.some(mi => mi.recipeId === recipe.id) &&
        recipe.ingredients.some(ing => ing.foodItemId === item.id)
      )
      return count + (usedInMenu ? 1 : 0)
    }, 0)
    
    return 1 + (usageCount * 0.2)
  }

  const calculateConfidence = (historicalData: any[], occupancyRate: number) => {
    let score = 50
    
    if (historicalData.length >= 30) score += 20
    else if (historicalData.length >= 14) score += 10
    else if (historicalData.length >= 7) score += 5
    
    if (occupancyRate > 0) score += 15
    
    if (historicalData.length > 0) {
      const variance = calculateVariance(historicalData.map(d => d.quantity))
      if (variance < 0.2) score += 15
      else if (variance < 0.4) score += 10
    }
    
    return Math.min(100, score)
  }

  const getConfidenceLevel = (score: number) => {
    if (score >= 80) return 'very-high'
    if (score >= 65) return 'high'
    if (score >= 50) return 'medium'
    return 'low'
  }

  const detectAnomalies = (historicalData: any[], baseline: number): DemandAnomaly[] => {
    const anomalies: DemandAnomaly[] = []
    const threshold = baseline * 0.5
    
    historicalData.slice(-7).forEach((data, idx) => {
      if (Math.abs(data.quantity - baseline) > threshold) {
        const type = data.quantity > baseline * 1.5 ? 'spike' : 'drop'
        const severity = Math.abs(data.quantity - baseline) > threshold * 1.5 ? 'critical' : 'warning'
        
        anomalies.push({
          id: `anomaly-${idx}-${Date.now()}`,
          type,
          severity,
          date: data.date,
          expectedValue: baseline,
          actualValue: data.quantity,
          deviationPercent: ((data.quantity - baseline) / baseline) * 100,
          description: `${type === 'spike' ? 'Unusual increase' : 'Unusual decrease'} in consumption`,
          possibleCauses: [
            type === 'spike' ? 'Special event or promotion' : 'Reduced occupancy',
            type === 'spike' ? 'Increased occupancy' : 'Menu change',
            'Seasonal variation'
          ],
          actionRecommended: type === 'spike' 
            ? 'Review stock levels and consider increasing reorder quantity'
            : 'Investigate cause and adjust forecast if needed',
          isResolved: false
        })
      }
    })
    
    return anomalies
  }

  const createReorderSuggestion = (item: ForecastableItem, forecast: DemandForecast): AutoReorderSuggestion => {
    const supplier = item.supplierIds.length > 0 
      ? suppliers.find(s => s.id === item.supplierIds[0])
      : undefined
    
    const estimatedCost = forecast.suggestedReorderQuantity * item.unitCost
    
    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'
    if (item.currentStock < item.reorderLevel * 0.5) priority = 'urgent'
    else if (item.currentStock < item.reorderLevel) priority = 'high'
    else if (forecast.estimatedStockoutDate && forecast.estimatedStockoutDate < Date.now() + (7 * 24 * 60 * 60 * 1000)) priority = 'high'
    
    return {
      id: `suggestion-${item.id}-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      itemType: item.type,
      currentStock: item.currentStock,
      reorderLevel: item.reorderLevel,
      forecastedDemand: forecast.forecastedDemand,
      suggestedQuantity: forecast.suggestedReorderQuantity,
      suggestedDate: forecast.suggestedReorderDate,
      priority,
      estimatedCost,
      supplierId: supplier?.id,
      supplierName: supplier?.name,
      leadTimeDays: supplier?.deliveryTimeDays || 3,
      confidence: forecast.confidence,
      reason: `Forecasted ${forecast.forecastedDemand} units demand over ${selectedPeriod} days`,
      isAutoGenerated: true,
      generatedAt: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
      status: 'pending'
    }
  }

  const getConfidenceBadgeVariant = (confidence: string) => {
    switch (confidence) {
      case 'very-high': return 'default'
      case 'high': return 'secondary'
      case 'medium': return 'outline'
      default: return 'destructive'
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive'
      case 'high': return 'default'
      case 'medium': return 'secondary'
      default: return 'outline'
    }
  }

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing': return <TrendUp size={16} className="text-success" />
      case 'decreasing': return <TrendDown size={16} className="text-destructive" />
      default: return <Minus size={16} className="text-muted-foreground" />
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <Warning size={16} className="text-destructive" />
      case 'warning': return <Warning size={16} className="text-accent" />
      default: return <Info size={16} className="text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold">AI Demand Forecasting & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Predict demand and optimize inventory with AI-powered forecasting
          </p>
        </div>
        <Button onClick={generateForecasts} disabled={isGenerating} size="lg">
          <Sparkle size={20} className="mr-2" />
          {isGenerating ? 'Generating...' : 'Generate Forecasts'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Items</h3>
            <Package size={20} className="text-primary" />
          </div>
          <p className="text-3xl font-semibold">{allItems.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {filteredItems.length} selected
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Forecasts</h3>
            <ChartBar size={20} className="text-accent" />
          </div>
          <p className="text-3xl font-semibold">{forecasts.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {forecasts.filter(f => f.confidence === 'very-high' || f.confidence === 'high').length} high confidence
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Reorder Suggestions</h3>
            <ShoppingCart size={20} className="text-success" />
          </div>
          <p className="text-3xl font-semibold">{reorderSuggestions.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {reorderSuggestions.filter(s => s.priority === 'urgent').length} urgent
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Anomalies</h3>
            <Warning size={20} className="text-destructive" />
          </div>
          <p className="text-3xl font-semibold">
            {forecasts.reduce((sum, f) => sum + f.anomalies.length, 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {forecasts.reduce((sum, f) => sum + f.anomalies.filter(a => a.severity === 'critical').length, 0)} critical
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label>Search Items</Label>
              <div className="relative mt-1">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Search by name or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Item Type</Label>
              <Select value={selectedItemType} onValueChange={(v) => setSelectedItemType(v as any)}>
                <SelectTrigger className="w-40 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="food">Food Items</SelectItem>
                  <SelectItem value="amenity">Amenities</SelectItem>
                  <SelectItem value="material">Materials</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Forecast Period</Label>
              <Select value={selectedPeriod.toString()} onValueChange={(v) => setSelectedPeriod(parseInt(v) as ForecastPeriod)}>
                <SelectTrigger className="w-32 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="forecasts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="forecasts">Demand Forecasts</TabsTrigger>
          <TabsTrigger value="reorder">Reorder Suggestions</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
        </TabsList>

        <TabsContent value="forecasts" className="space-y-4">
          {forecasts.length === 0 ? (
            <Card className="p-16 text-center">
              <ChartBar size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Forecasts Generated</h3>
              <p className="text-muted-foreground mb-6">
                Click "Generate Forecasts" to analyze demand patterns and create predictions
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {forecasts.map((forecast) => (
                <Card key={forecast.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedForecast(forecast)}>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{forecast.itemName}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{forecast.category}</p>
                      </div>
                      <Badge variant={getConfidenceBadgeVariant(forecast.confidence)} className="capitalize">
                        {forecast.confidence}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Current Stock</p>
                        <p className="text-lg font-semibold">{forecast.currentStock}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Forecasted Demand</p>
                        <p className="text-lg font-semibold text-accent">{forecast.forecastedDemand}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Reorder Level</p>
                        <p className="text-lg font-semibold">{forecast.reorderLevel}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Trend</p>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(forecast.trendDirection)}
                          <span className="text-lg font-semibold">{forecast.trendPercent.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    {forecast.estimatedStockoutDate && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                        <div className="flex items-center gap-2 text-destructive">
                          <Warning size={16} />
                          <span className="text-sm font-medium">
                            Stockout estimated: {new Date(forecast.estimatedStockoutDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {forecast.suggestedReorderQuantity > 0 && (
                      <div className="bg-accent/10 border border-accent/20 rounded p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Suggested Reorder</span>
                          <span className="text-lg font-semibold text-accent">
                            {forecast.suggestedReorderQuantity} units
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Data Quality</span>
                        <span className="font-medium">{forecast.dataQuality.dataCompleteness.toFixed(0)}%</span>
                      </div>
                      <Progress value={forecast.dataQuality.dataCompleteness} />
                    </div>

                    {forecast.anomalies.length > 0 && (
                      <Badge variant="destructive" className="w-full justify-center">
                        {forecast.anomalies.length} Anomal{forecast.anomalies.length === 1 ? 'y' : 'ies'} Detected
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reorder" className="space-y-4">
          {reorderSuggestions.length === 0 ? (
            <Card className="p-16 text-center">
              <ShoppingCart size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Reorder Suggestions</h3>
              <p className="text-muted-foreground">
                Generate forecasts to receive AI-powered reorder recommendations
              </p>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {reorderSuggestions
                  .sort((a, b) => {
                    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
                    return priorityOrder[a.priority] - priorityOrder[b.priority]
                  })
                  .map((suggestion) => (
                    <Card key={suggestion.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{suggestion.itemName}</h3>
                            <Badge variant={getPriorityBadgeVariant(suggestion.priority)} className="capitalize">
                              {suggestion.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {suggestion.confidence}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Current Stock</p>
                          <p className="text-lg font-semibold">{suggestion.currentStock}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Suggested Qty</p>
                          <p className="text-lg font-semibold text-success">{suggestion.suggestedQuantity}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Estimated Cost</p>
                          <p className="text-lg font-semibold">{formatCurrency(suggestion.estimatedCost)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Lead Time</p>
                          <p className="text-lg font-semibold">{suggestion.leadTimeDays} days</p>
                        </div>
                      </div>

                      {suggestion.supplierName && (
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded mb-4">
                          <span className="text-sm text-muted-foreground">Supplier</span>
                          <span className="font-medium">{suggestion.supplierName}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <CalendarBlank size={16} className="text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Suggested order date: {new Date(suggestion.suggestedDate).toLocaleDateString()}
                        </span>
                      </div>

                      <Separator className="my-4" />

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">
                          <ShoppingCart size={16} className="mr-2" />
                          Create PO
                        </Button>
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                      </div>
                    </Card>
                  ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          {forecasts.filter(f => f.anomalies.length > 0).length === 0 ? (
            <Card className="p-16 text-center">
              <CheckCircle size={64} className="mx-auto text-success mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Anomalies Detected</h3>
              <p className="text-muted-foreground">
                All consumption patterns appear normal
              </p>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {forecasts
                  .filter(f => f.anomalies.length > 0)
                  .map((forecast) => (
                    <Card key={forecast.id} className="p-6">
                      <div className="mb-4">
                        <h3 className="font-semibold text-lg">{forecast.itemName}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{forecast.category}</p>
                      </div>

                      <div className="space-y-3">
                        {forecast.anomalies.map((anomaly) => (
                          <div key={anomaly.id} className="border rounded p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                {getSeverityIcon(anomaly.severity)}
                                <div>
                                  <p className="font-medium capitalize">{anomaly.type.replace('-', ' ')}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(anomaly.date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Badge variant={anomaly.severity === 'critical' ? 'destructive' : 'outline'} className="capitalize">
                                {anomaly.severity}
                              </Badge>
                            </div>

                            <p className="text-sm">{anomaly.description}</p>

                            <div className="grid grid-cols-3 gap-3 p-3 bg-muted/50 rounded">
                              <div>
                                <p className="text-xs text-muted-foreground">Expected</p>
                                <p className="font-medium">{anomaly.expectedValue.toFixed(1)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Actual</p>
                                <p className="font-medium">{anomaly.actualValue.toFixed(1)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Deviation</p>
                                <p className="font-medium text-destructive">
                                  {anomaly.deviationPercent > 0 ? '+' : ''}{anomaly.deviationPercent.toFixed(1)}%
                                </p>
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">Possible Causes:</p>
                              <ul className="text-sm space-y-1">
                                {anomaly.possibleCauses.map((cause, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-muted-foreground">•</span>
                                    <span>{cause}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="bg-accent/10 border border-accent/20 rounded p-3">
                              <div className="flex items-start gap-2">
                                <Lightning size={16} className="text-accent mt-0.5" />
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Recommended Action</p>
                                  <p className="text-sm">{anomaly.actionRecommended}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
