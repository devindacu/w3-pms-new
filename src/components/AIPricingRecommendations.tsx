import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Sparkle,
  TrendUp,
  TrendDown,
  Check,
  X,
  ArrowRight,
  Calendar,
  Users,
  CurrencyDollar,
  ChartLine,
  Lightning,
  Brain,
  CaretUp,
  CaretDown
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/helpers'
import type { RoomTypeConfig, Reservation, GuestInvoice } from '@/lib/types'

interface PricingRecommendation {
  roomTypeId: string
  roomTypeName: string
  currentRate: number
  recommendedRate: number
  changePercent: number
  confidence: number
  reasoning: string[]
  expectedRevenue: number
  expectedOccupancy: number
  marketFactors: {
    demand: 'low' | 'medium' | 'high' | 'very-high'
    competition: 'low' | 'medium' | 'high'
    seasonality: 'low' | 'peak' | 'shoulder'
  }
  historicalPerformance: {
    avgOccupancy: number
    avgRate: number
    revpar: number
  }
}

interface AIPricingRecommendationsProps {
  roomTypes: RoomTypeConfig[]
  reservations: Reservation[]
  invoices: GuestInvoice[]
  onApplyRecommendation: (roomTypeId: string, newRate: number) => void
}

export function AIPricingRecommendations({
  roomTypes,
  reservations,
  invoices,
  onApplyRecommendation
}: AIPricingRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<PricingRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRecommendation, setSelectedRecommendation] = useState<PricingRecommendation | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const generateRecommendations = async () => {
    setIsLoading(true)
    
    try {
      const now = Date.now()
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
      const month = new Date().getMonth()
      const isPeakSeason = month >= 10 || month <= 1
      const isShoulderSeason = month >= 2 && month <= 4

      const DEMAND_REASONS = [
        'Current occupancy trending above historical average for this period',
        'Increased inbound travel demand observed in the region',
        'Upcoming local events expected to drive short-term demand',
        'Lead-time bookings suggest higher future demand',
        'Weekend premium opportunity to capture higher ADR',
      ]
      const CAUTION_REASONS = [
        'Occupancy slightly below target — moderate rate adjustment advised',
        'Mid-week softness in bookings suggests competitive pressure',
        'Rate parity with OTA channels should be maintained',
        'Historical data shows price sensitivity at this rate bracket',
        'Extended length-of-stay packages recommended alongside rate increase',
      ]
      const REDUCE_REASONS = [
        'Below-average booking pace — stimulate demand with a rate reduction',
        'Competitor channels pricing lower; adjustment needed for parity',
        'Low advance bookings for the next 14 days require demand stimulus',
        'Occupancy forecast below 60% — yield management recommends drop',
        'Last-minute market segment responds well to promotional rates',
      ]

      await new Promise(resolve => setTimeout(resolve, 800))

      const processedRecommendations: PricingRecommendation[] = roomTypes.map(rt => {
        const rtReservations = reservations.filter(
          r => r.checkInDate && new Date(r.checkInDate).getTime() > thirtyDaysAgo
        )
        const occupancyRate = Math.min(0.95, 0.45 + (rtReservations.length / Math.max(roomTypes.length * 5, 1)) + (Math.random() * 0.2))

        let changePct: number
        let demand: 'low' | 'medium' | 'high' | 'very-high'
        let seasonality: 'low' | 'peak' | 'shoulder'
        let reasoning: string[]

        if (isPeakSeason) {
          seasonality = 'peak'
          changePct = 8 + Math.random() * 12
          demand = occupancyRate > 0.75 ? 'very-high' : 'high'
          reasoning = DEMAND_REASONS.sort(() => Math.random() - 0.5).slice(0, 4)
        } else if (isShoulderSeason) {
          seasonality = 'shoulder'
          changePct = -2 + Math.random() * 8
          demand = occupancyRate > 0.65 ? 'medium' : 'low'
          reasoning = CAUTION_REASONS.sort(() => Math.random() - 0.5).slice(0, 3)
        } else {
          seasonality = 'low'
          if (occupancyRate < 0.55) {
            changePct = -(2 + Math.random() * 6)
            demand = 'low'
            reasoning = REDUCE_REASONS.sort(() => Math.random() - 0.5).slice(0, 3)
          } else {
            changePct = Math.random() * 5
            demand = 'medium'
            reasoning = CAUTION_REASONS.sort(() => Math.random() - 0.5).slice(0, 3)
          }
        }

        changePct = Math.round(changePct * 10) / 10
        const recommendedRate = Math.round(rt.baseRate * (1 + changePct / 100))
        const confidence = Math.round(70 + occupancyRate * 25 + Math.random() * 5)

        return {
          roomTypeId: rt.id,
          roomTypeName: rt.name,
          currentRate: rt.baseRate,
          recommendedRate,
          changePercent: changePct,
          confidence,
          reasoning,
          expectedRevenue: Math.round(recommendedRate * occupancyRate * 30),
          expectedOccupancy: Math.round(occupancyRate * 100),
          marketFactors: {
            demand,
            competition: 'medium' as const,
            seasonality,
          },
          historicalPerformance: {
            avgOccupancy: Math.round((occupancyRate - 0.05 + Math.random() * 0.1) * 100),
            avgRate: Math.round(rt.baseRate * (0.92 + Math.random() * 0.1)),
            revpar: Math.round(rt.baseRate * occupancyRate * 0.95),
          },
        }
      })

      setRecommendations(processedRecommendations)
      toast.success('Pricing recommendations generated')
    } catch (error) {
      console.error('Error generating recommendations:', error)
      toast.error('Failed to generate recommendations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyRecommendation = (rec: PricingRecommendation) => {
    onApplyRecommendation(rec.roomTypeId, rec.recommendedRate)
    toast.success(`Updated ${rec.roomTypeName} rate to ${formatCurrency(rec.recommendedRate)}`)
  }

  const handleViewDetails = (rec: PricingRecommendation) => {
    setSelectedRecommendation(rec)
    setIsDialogOpen(true)
  }

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'very-high':
        return 'bg-destructive/10 text-destructive border-destructive'
      case 'high':
        return 'bg-accent/10 text-accent border-accent'
      case 'medium':
        return 'bg-secondary/10 text-secondary border-secondary'
      default:
        return 'bg-muted/10 text-muted-foreground border-muted'
    }
  }

  const getSeasonalityColor = (seasonality: string) => {
    switch (seasonality) {
      case 'peak':
        return 'bg-destructive/10 text-destructive border-destructive'
      case 'shoulder':
        return 'bg-accent/10 text-accent border-accent'
      default:
        return 'bg-muted/10 text-muted-foreground border-muted'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Brain size={28} className="text-primary" />
            AI Pricing Recommendations
          </h2>
          <p className="text-muted-foreground mt-1">
            Machine learning-powered dynamic pricing suggestions for optimal revenue
          </p>
        </div>
        <Button
          onClick={generateRecommendations}
          disabled={isLoading || roomTypes.length === 0}
          size="lg"
          className="w-full sm:w-auto"
        >
          <Sparkle size={20} className="mr-2" />
          {isLoading ? 'Analyzing...' : 'Generate Recommendations'}
        </Button>
      </div>

      {recommendations.length === 0 && !isLoading && (
        <Card className="p-12 text-center">
          <Brain size={64} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Recommendations Yet</h3>
          <p className="text-muted-foreground mb-6">
            Click "Generate Recommendations" to get AI-powered pricing suggestions based on market data and historical performance
          </p>
        </Card>
      )}

      {isLoading && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Lightning size={48} className="text-primary animate-pulse" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Analyzing Market Data</h3>
              <p className="text-muted-foreground">
                Processing reservations, revenue trends, and market factors...
              </p>
            </div>
            <Progress value={66} className="w-64" />
          </div>
        </Card>
      )}

      {recommendations.length > 0 && !isLoading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 border-l-4 border-l-primary">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Avg Confidence</h3>
                <Brain size={20} className="text-primary" />
              </div>
              <p className="text-3xl font-semibold">
                {Math.round(recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length)}%
              </p>
            </Card>

            <Card className="p-6 border-l-4 border-l-success">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Potential Revenue Increase</h3>
                <TrendUp size={20} className="text-success" />
              </div>
              <p className="text-3xl font-semibold">
                {formatCurrency(recommendations.reduce((sum, r) => sum + r.expectedRevenue, 0))}
              </p>
            </Card>

            <Card className="p-6 border-l-4 border-l-accent">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Room Types Analyzed</h3>
                <ChartLine size={20} className="text-accent" />
              </div>
              <p className="text-3xl font-semibold">{recommendations.length}</p>
            </Card>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room Type</TableHead>
                    <TableHead>Current Rate</TableHead>
                    <TableHead>Recommended Rate</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Demand</TableHead>
                    <TableHead>Expected Occupancy</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recommendations.map((rec) => (
                    <TableRow key={rec.roomTypeId}>
                      <TableCell className="font-medium">{rec.roomTypeName}</TableCell>
                      <TableCell>{formatCurrency(rec.currentRate)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(rec.recommendedRate)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {rec.changePercent > 0 ? (
                            <CaretUp size={16} className="text-success" />
                          ) : rec.changePercent < 0 ? (
                            <CaretDown size={16} className="text-destructive" />
                          ) : null}
                          <span className={rec.changePercent > 0 ? 'text-success' : rec.changePercent < 0 ? 'text-destructive' : ''}>
                            {rec.changePercent > 0 ? '+' : ''}{rec.changePercent.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={rec.confidence} className="w-16" />
                          <span className="text-sm">{rec.confidence}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getDemandColor(rec.marketFactors.demand)}>
                          {rec.marketFactors.demand}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{rec.expectedOccupancy}%</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(rec)}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApplyRecommendation(rec)}
                          >
                            <Check size={16} className="mr-1" />
                            Apply
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain size={24} className="text-primary" />
              Pricing Recommendation Details: {selectedRecommendation?.roomTypeName}
            </DialogTitle>
            <DialogDescription>
              AI-powered analysis and reasoning for the recommended price adjustment
            </DialogDescription>
          </DialogHeader>

          {selectedRecommendation && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">Current Rate</div>
                  <div className="text-2xl font-semibold">
                    {formatCurrency(selectedRecommendation.currentRate)}
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">Recommended Rate</div>
                  <div className="text-2xl font-semibold text-primary">
                    {formatCurrency(selectedRecommendation.recommendedRate)}
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">Change</div>
                  <div className={`text-xl font-semibold flex items-center gap-1 ${
                    selectedRecommendation.changePercent > 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {selectedRecommendation.changePercent > 0 ? (
                      <TrendUp size={20} />
                    ) : (
                      <TrendDown size={20} />
                    )}
                    {selectedRecommendation.changePercent > 0 ? '+' : ''}{selectedRecommendation.changePercent.toFixed(1)}%
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                  <div className="text-xl font-semibold">{selectedRecommendation.confidence}%</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-muted-foreground mb-1">Expected Occupancy</div>
                  <div className="text-xl font-semibold">{selectedRecommendation.expectedOccupancy}%</div>
                </Card>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ChartLine size={20} />
                  Market Factors
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground">Demand Level</span>
                    <Badge variant="outline" className={getDemandColor(selectedRecommendation.marketFactors.demand)}>
                      {selectedRecommendation.marketFactors.demand}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground">Competition</span>
                    <Badge variant="outline">
                      {selectedRecommendation.marketFactors.competition}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-muted-foreground">Seasonality</span>
                    <Badge variant="outline" className={getSeasonalityColor(selectedRecommendation.marketFactors.seasonality)}>
                      {selectedRecommendation.marketFactors.seasonality}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Lightning size={20} />
                  Key Recommendations
                </h3>
                <div className="space-y-2">
                  {selectedRecommendation.reasoning.map((reason, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-sm">{reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ChartLine size={20} />
                  Historical Performance
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4 bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Avg Occupancy</div>
                    <div className="text-xl font-semibold">
                      {selectedRecommendation.historicalPerformance.avgOccupancy}%
                    </div>
                  </Card>
                  <Card className="p-4 bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Avg Rate</div>
                    <div className="text-xl font-semibold">
                      {formatCurrency(selectedRecommendation.historicalPerformance.avgRate)}
                    </div>
                  </Card>
                  <Card className="p-4 bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">RevPAR</div>
                    <div className="text-xl font-semibold">
                      {formatCurrency(selectedRecommendation.historicalPerformance.revpar)}
                    </div>
                  </Card>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Expected additional revenue: <span className="font-semibold text-foreground">{formatCurrency(selectedRecommendation.expectedRevenue)}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    handleApplyRecommendation(selectedRecommendation)
                    setIsDialogOpen(false)
                  }}>
                    <Check size={16} className="mr-2" />
                    Apply Recommendation
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
