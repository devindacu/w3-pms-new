import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DialogAdapter } from '@/components/adapters/DialogAdapter'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { PrintButton } from '@/components/PrintButton'
import { A4PrintWrapper } from '@/components/A4PrintWrapper'
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
    <DialogAdapter open={open} onOpenChange={onOpenChange} size="2xl" showAnimation={true}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Daily Consumption Report</span>
            {report && (
              <PrintButton
                elementId="daily-report-printable"
                options={{
                  title: `Daily Consumption Report - ${reportDate}`,
                  filename: `daily-report-${reportDate}.pdf`,
                  includeHeader: true,
                  headerText: `Daily Consumption Report`,
                  includeFooter: true,
                  footerText: `Generated on ${new Date().toLocaleDateString()}`
                }}
                variant="outline"
                size="sm"
              />
            )}
          </DialogTitle>
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

        <div className="flex justify-end gap-3 pt-4 border-t no-print">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>

        {/* Hidden printable content */}
        {report && (
          <div className="hidden">
            <A4PrintWrapper
              id="daily-report-printable"
              title={`Daily Consumption Report`}
              headerContent={
                <div className="text-sm">
                  <p><strong>Report Date:</strong> {reportDate}</p>
                  <p><strong>Generated:</strong> {new Date().toLocaleDateString()}</p>
                </div>
              }
            >
              <div className="space-y-6">
                <section>
                  <h2 className="text-lg font-semibold mb-4">Summary</h2>
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr>
                        <td className="border p-2 font-medium">Total Portions Produced</td>
                        <td className="border p-2 text-right font-bold">{report.totalPortions}</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-medium">Total Recipes</td>
                        <td className="border p-2 text-right font-bold">{report.totalRecipesProduced}</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-medium">Total Revenue</td>
                        <td className="border p-2 text-right font-bold text-green-600">{formatCurrency(report.totalRevenue)}</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-medium">Total Cost</td>
                        <td className="border p-2 text-right font-bold text-red-600">{formatCurrency(report.totalCost)}</td>
                      </tr>
                      <tr className="bg-gray-100">
                        <td className="border p-2 font-bold">Gross Profit</td>
                        <td className="border p-2 text-right font-bold">{formatCurrency(report.grossProfit)} ({report.profitMargin.toFixed(1)}%)</td>
                      </tr>
                    </tbody>
                  </table>
                </section>

                <section className="page-break">
                  <h2 className="text-lg font-semibold mb-4">Recipe Breakdown</h2>
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Recipe Name</th>
                        <th className="border p-2 text-right">Portions</th>
                        <th className="border p-2 text-right">Avg Cost</th>
                        <th className="border p-2 text-right">Total Cost</th>
                        <th className="border p-2 text-right">Revenue</th>
                        <th className="border p-2 text-right">Profit</th>
                        <th className="border p-2 text-right">Margin %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.recipeBreakdown.map((recipe) => (
                        <tr key={recipe.recipeId}>
                          <td className="border p-2">{recipe.recipeName}</td>
                          <td className="border p-2 text-right">{recipe.portionsProduced}</td>
                          <td className="border p-2 text-right">{formatCurrency(recipe.averageCostPerPortion)}</td>
                          <td className="border p-2 text-right">{formatCurrency(recipe.totalCost)}</td>
                          <td className="border p-2 text-right">{formatCurrency(recipe.totalRevenue)}</td>
                          <td className="border p-2 text-right">{formatCurrency(recipe.profit)}</td>
                          <td className="border p-2 text-right">{recipe.profitMargin.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>

                <section className="page-break">
                  <h2 className="text-lg font-semibold mb-4">Ingredient Usage</h2>
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Ingredient</th>
                        <th className="border p-2 text-left">Used In</th>
                        <th className="border p-2 text-right">Quantity</th>
                        <th className="border p-2 text-right">Unit</th>
                        <th className="border p-2 text-right">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.ingredientUsage
                        .sort((a, b) => b.totalCost - a.totalCost)
                        .map((ing, idx) => (
                          <tr key={idx}>
                            <td className="border p-2">{ing.itemName}</td>
                            <td className="border p-2 text-xs">{ing.recipes.join(', ')}</td>
                            <td className="border p-2 text-right">{ing.totalUsed.toFixed(2)}</td>
                            <td className="border p-2 text-right">{ing.unit}</td>
                            <td className="border p-2 text-right font-semibold">{formatCurrency(ing.totalCost)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </section>
              </div>
            </A4PrintWrapper>
          </div>
        )}
      </DialogContent>
    </DialogAdapter>
  )
}
