import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { FloppyDisk } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { type KitchenConsumptionLog, type Recipe, type FoodItem, type Order, type ConsumptionIngredient, type VarianceDetail } from '@/lib/types'
import { formatCurrency } from '@/lib/helpers'

interface ConsumptionLogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  log?: KitchenConsumptionLog
  consumptionLogs: KitchenConsumptionLog[]
  setConsumptionLogs: (logs: KitchenConsumptionLog[]) => void
  recipes: Recipe[]
  foodItems: FoodItem[]
  orders: Order[]
}

export function ConsumptionLogDialog({
  open,
  onOpenChange,
  log,
  consumptionLogs,
  setConsumptionLogs,
  recipes,
  foodItems,
  orders
}: ConsumptionLogDialogProps) {
  const [formData, setFormData] = useState<Partial<KitchenConsumptionLog>>({
    recipeId: '',
    recipeName: '',
    portionsProduced: 1,
    type: 'recipe-consumption',
    ingredients: [],
    totalCost: 0,
    costPerPortion: 0,
    producedBy: 'Current User'
  })

  useEffect(() => {
    if (log) {
      setFormData(log)
    } else {
      const logNumber = `KCL-${(consumptionLogs.length + 1).toString().padStart(5, '0')}`
      setFormData(prev => ({ ...prev, logNumber }))
    }
  }, [log, consumptionLogs.length])

  const handleRecipeSelect = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId)
    if (!recipe) return

    const ingredients: ConsumptionIngredient[] = recipe.ingredients.map(ing => ({
      id: crypto.randomUUID(),
      foodItemId: ing.foodItemId,
      name: ing.name,
      expectedQuantity: ing.quantity,
      actualQuantity: ing.quantity,
      unit: ing.unit,
      unitCost: ing.unitCost,
      expectedCost: ing.totalCost,
      actualCost: ing.totalCost,
      variance: 0,
      variancePercent: 0
    }))

    setFormData(prev => ({
      ...prev,
      recipeId: recipe.id,
      recipeName: recipe.name,
      ingredients,
      totalCost: ingredients.reduce((sum, ing) => sum + ing.actualCost, 0),
      costPerPortion: ingredients.reduce((sum, ing) => sum + ing.actualCost, 0) / (prev.portionsProduced || 1)
    }))
  }

  const updateIngredient = (id: string, field: 'actualQuantity', value: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients?.map(ing => {
        if (ing.id === id) {
          const actualQuantity = value
          const actualCost = actualQuantity * ing.unitCost
          const variance = actualQuantity - ing.expectedQuantity
          const variancePercent = ing.expectedQuantity > 0 ? (variance / ing.expectedQuantity) * 100 : 0
          
          return {
            ...ing,
            actualQuantity,
            actualCost,
            variance,
            variancePercent
          }
        }
        return ing
      })
    }))
  }

  const calculateTotals = () => {
    const totalCost = formData.ingredients?.reduce((sum, ing) => sum + ing.actualCost, 0) || 0
    const portions = formData.portionsProduced || 1
    const variance: VarianceDetail[] = formData.ingredients
      ?.filter(ing => ing.variance !== 0)
      .map(ing => ({
        itemName: ing.name,
        expectedQuantity: ing.expectedQuantity,
        actualQuantity: ing.actualQuantity,
        variance: ing.variance,
        variancePercent: ing.variancePercent,
        varianceCost: ing.variance * ing.unitCost
      })) || []

    setFormData(prev => ({
      ...prev,
      totalCost,
      costPerPortion: totalCost / portions,
      variance: variance.length > 0 ? variance : undefined
    }))
  }

  useEffect(() => {
    calculateTotals()
  }, [formData.ingredients, formData.portionsProduced])

  const handleSave = () => {
    if (!formData.recipeId || !formData.portionsProduced) {
      toast.error('Please select a recipe and enter portions produced')
      return
    }

    const now = Date.now()
    const logData: KitchenConsumptionLog = {
      id: log?.id || crypto.randomUUID(),
      logNumber: formData.logNumber!,
      recipeId: formData.recipeId!,
      recipeName: formData.recipeName!,
      orderId: formData.orderId,
      orderNumber: formData.orderNumber,
      menuItemId: formData.menuItemId,
      portionsProduced: formData.portionsProduced!,
      type: formData.type!,
      ingredients: formData.ingredients || [],
      totalCost: formData.totalCost!,
      costPerPortion: formData.costPerPortion!,
      variance: formData.variance,
      wasteReason: formData.wasteReason,
      spoilageReason: formData.spoilageReason,
      producedBy: formData.producedBy!,
      producedAt: log?.producedAt || now,
      shiftType: formData.shiftType,
      notes: formData.notes,
      createdAt: now
    }

    if (log) {
      setConsumptionLogs(consumptionLogs.map(l => l.id === log.id ? logData : l))
      toast.success('Consumption log updated')
    } else {
      setConsumptionLogs([...consumptionLogs, logData])
      toast.success('Consumption logged successfully')
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{log ? 'Edit Consumption Log' : 'Log Consumption'}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-150px)] pr-4">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipe">Recipe*</Label>
                <Select
                  value={formData.recipeId}
                  onValueChange={handleRecipeSelect}
                  disabled={!!log}
                >
                  <SelectTrigger id="recipe">
                    <SelectValue placeholder="Select recipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipes.filter(r => r.isActive).map((recipe) => (
                      <SelectItem key={recipe.id} value={recipe.id}>
                        {recipe.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="portions">Portions Produced*</Label>
                <Input
                  id="portions"
                  type="number"
                  value={formData.portionsProduced}
                  onChange={(e) => setFormData({ ...formData, portionsProduced: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>

            <Card className="p-4 bg-muted/50">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Cost</span>
                  <span className="font-semibold">{formatCurrency(formData.totalCost || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cost Per Portion</span>
                  <span className="font-semibold text-primary">{formatCurrency(formData.costPerPortion || 0)}</span>
                </div>
              </div>
            </Card>

            {formData.ingredients && formData.ingredients.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Ingredient Verification</h4>
                {formData.ingredients.map((ing) => (
                  <Card key={ing.id} className="p-3">
                    <div className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-4">
                        <p className="font-medium text-sm">{ing.name}</p>
                      </div>
                      <div className="col-span-2 text-center">
                        <p className="text-xs text-muted-foreground">Expected</p>
                        <p className="font-medium text-sm">{ing.expectedQuantity} {ing.unit}</p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Actual</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={ing.actualQuantity}
                          onChange={(e) => updateIngredient(ing.id, 'actualQuantity', parseFloat(e.target.value) || 0)}
                          className="h-8"
                        />
                      </div>
                      <div className="col-span-2 text-center">
                        <p className="text-xs text-muted-foreground">Variance</p>
                        <p className={`font-medium text-sm ${ing.variance > 0 ? 'text-destructive' : ing.variance < 0 ? 'text-success' : ''}`}>
                          {ing.variance > 0 ? '+' : ''}{ing.variance.toFixed(2)}
                        </p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="text-xs text-muted-foreground">Cost</p>
                        <p className="font-medium text-sm">{formatCurrency(ing.actualCost)}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <FloppyDisk size={20} className="mr-2" />
            Save Log
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
