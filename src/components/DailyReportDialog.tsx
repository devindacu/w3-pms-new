import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FileText, Printer } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { type KitchenConsumptionLog, type Recipe, type Order, type DailyConsumptionReport, type RecipeConsumptionSummary, type IngredientUsageSummary } from '@/lib/types'
import { formatCurrency } from '@/lib/helpers'

interface DailyReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  consumptionLogs: KitchenConsumptionLog[]
  recipes: Recipe[]
  orders: Order[]
}

export function DailyReportDialog({
  open,
  onOpenChange,
  consumptionLogs,
  recipes,
  orders
}: DailyReportDialogProps) {
  const [reportDate, setReportDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  const generateReport = () => {
    const selectedDate = new Date(reportDate).setHours(0, 0, 0, 0)
    const dayLogs = consumptionLogs.filter(log => {
      const logDate = new Date(log.producedAt).setHours(0, 0, 0, 0)
      return logDate === selectedDate && log.type === 'recipe-consumption'
    })

    if (dayLogs.length === 0) {
      toast.error('No consumption data found for this date')
      return null
    }

    const recipeMap = new Map<string, RecipeConsumptionSummary>()
    const ingredientMap = new Map<string, IngredientUsageSummary>()

    dayLogs.forEach(log => {
      const recipe = recipes.find(r => r.id === log.recipeId)
      const revenue = (recipe?.sellingPrice || 0) * log.portionsProduced
      const profit = revenue - log.totalCost
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0

      if (recipeMap.has(log.recipeId)) {
        const existing = recipeMap.get(log.recipeId)!
        existing.portionsProduced += log.portionsProduced
        existing.totalCost += log.totalCost
        existing.totalRevenue += revenue
        existing.profit += profit
        existing.averageCostPerPortion = existing.totalCost / existing.portionsProduced
        existing.profitMargin = existing.totalRevenue > 0 ? (existing.profit / existing.totalRevenue) * 100 : 0
      } else {
        recipeMap.set(log.recipeId, {
          recipeId: log.recipeId,
          recipeName: log.recipeName,
          portionsProduced: log.portionsProduced,
          averageCostPerPortion: log.costPerPortion,
          totalCost: log.totalCost,
          totalRevenue: revenue,
          profit,
          profitMargin
        })
      }

      log.ingredients.forEach(ing => {
        const key = ing.foodItemId || ing.name
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)!
          existing.totalUsed += ing.actualQuantity
          existing.totalCost += ing.actualCost
          existing.averageCost = existing.totalCost / existing.totalUsed
          if (!existing.recipes.includes(log.recipeName)) {
            existing.recipes.push(log.recipeName)
          }
        } else {
          ingredientMap.set(key, {
            foodItemId: ing.foodItemId,
            itemName: ing.name,
            totalUsed: ing.actualQuantity,
            unit: ing.unit,
            averageCost: ing.unitCost,
            totalCost: ing.actualCost,
            recipes: [log.recipeName]
          })
        }
      })
    })

    const recipeBreakdown = Array.from(recipeMap.values())
    const ingredientUsage = Array.from(ingredientMap.values())
    const totalRevenue = recipeBreakdown.reduce((sum, r) => sum + r.totalRevenue, 0)
    const totalCost = recipeBreakdown.reduce((sum, r) => sum + r.totalCost, 0)
    const grossProfit = totalRevenue - totalCost
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

    return {
      totalRecipesProduced: recipeMap.size,
      totalPortions: recipeBreakdown.reduce((sum, r) => sum + r.portionsProduced, 0),
      totalRevenue,
      totalCost,
      grossProfit,
      profitMargin,
      recipeBreakdown,
      ingredientUsage,
      topSellingRecipes: recipeBreakdown.sort((a, b) => b.portionsProduced - a.portionsProduced).slice(0, 5),
      lowPerformingRecipes: recipeBreakdown.sort((a, b) => a.profitMargin - b.profitMargin).slice(0, 5)
    }
  }

  const [report, setReport] = useState<ReturnType<typeof generateReport>>(null)

  const handleGenerate = () => {
    const generated = generateReport()
    if (generated) {
      setReport(generated)
      toast.success('Report generated successfully')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Daily Consumption Report</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="reportDate">Report Date</Label>
              <Input
                id="reportDate"
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
              />
            </div>
            <Button onClick={handleGenerate}>
              <FileText size={20} className="mr-2" />
              Generate Report
            </Button>
          </div>

          {report && (
            <ScrollArea className="max-h-[calc(90vh-250px)]">
              <div className="space-y-6 pr-4">
                <Card className="p-6 bg-primary/5">
                  <h3 className="font-semibold text-lg mb-4">Summary</h3>
                  <div className="grid grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Portions</p>
                      <p className="text-2xl font-semibold">{report.totalPortions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                      <p className="text-2xl font-semibold text-success">{formatCurrency(report.totalRevenue)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Cost</p>
                      <p className="text-2xl font-semibold text-destructive">{formatCurrency(report.totalCost)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Gross Profit</p>
                      <p className="text-2xl font-semibold text-primary">{formatCurrency(report.grossProfit)}</p>
                      <p className="text-sm text-muted-foreground">{report.profitMargin.toFixed(1)}% margin</p>
                    </div>
                  </div>
                </Card>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Recipe Breakdown</h3>
                  <div className="space-y-2">
                    {report.recipeBreakdown.map((recipe) => (
                      <Card key={recipe.recipeId} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{recipe.recipeName}</h4>
                          <span className="text-sm text-muted-foreground">{recipe.portionsProduced} portions</span>
                        </div>
                        <div className="grid grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Avg Cost</p>
                            <p className="font-medium">{formatCurrency(recipe.averageCostPerPortion)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Cost</p>
                            <p className="font-medium">{formatCurrency(recipe.totalCost)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Revenue</p>
                            <p className="font-medium text-success">{formatCurrency(recipe.totalRevenue)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Profit</p>
                            <p className="font-medium text-primary">{formatCurrency(recipe.profit)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Margin</p>
                            <p className={`font-medium ${
                              recipe.profitMargin >= 60 ? 'text-success' :
                              recipe.profitMargin >= 40 ? 'text-primary' :
                              recipe.profitMargin >= 20 ? 'text-accent' :
                              'text-destructive'
                            }`}>
                              {recipe.profitMargin.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-lg mb-3">Ingredient Usage</h3>
                  <div className="space-y-2">
                    {report.ingredientUsage
                      .sort((a, b) => b.totalCost - a.totalCost)
                      .map((ing, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                          <div className="flex-1">
                            <p className="font-medium">{ing.itemName}</p>
                            <p className="text-xs text-muted-foreground">
                              Used in: {ing.recipes.join(', ')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{ing.totalUsed.toFixed(2)} {ing.unit}</p>
                            <p className="text-sm text-muted-foreground">{formatCurrency(ing.totalCost)}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {report && (
            <Button onClick={() => toast.success('Print functionality would be implemented here')}>
              <Printer size={20} className="mr-2" />
              Print Report
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
